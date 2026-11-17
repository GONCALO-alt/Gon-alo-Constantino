// Regras do servidor em tempo real (eventos Socket.IO). Não depende do Express.
import * as R from './rooms.js';
import * as AI from './ai.js';
import { signPass, verifyPass, randomSecret, DAY } from './premium.js';

const AI_WEEKLY_LIMIT = Number(globalThis.process?.env?.AI_WEEKLY_LIMIT) || 30; // usos de IA por sala por semana (grátis)
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_B64 = 5 * 1024 * 1024;
const tutorDaily = () => Number(globalThis.process?.env?.AI_TUTOR_DAILY) || 40; // mensagens grátis ao tutor por pessoa por dia
const SUBJECT_IDS = ['mat', 'port', 'ing', 'cien', 'fq', 'hist', 'geo', 'bg', 'fil', 'fr', 'es', 'tic', 'ev', 'eco'];

// Limpa a conversa enviada pelo browser: só papéis válidos, textos curtos, últimas 20 mensagens, a acabar no aluno.
export function cleanTutorMessages(list) {
  const msgs = (Array.isArray(list) ? list : [])
    .filter(m => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-20);
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  // junta mensagens seguidas do mesmo papel
  const out = [];
  for (const m of msgs) {
    if (out.length && out.at(-1).role === m.role) out.at(-1).content += `\n\n${m.content}`;
    else out.push({ ...m });
  }
  return out.length && out.at(-1).role === 'user' ? out : null;
}

// Contexto do plano de estudo (só valores conhecidos, nada de texto livre)
export function tutorContext(c) {
  if (!c || typeof c !== 'object') return '';
  const pick = list => (Array.isArray(list) ? list.filter(x => SUBJECT_IDS.includes(x)) : []);
  const parts = [];
  if (/^(\d{1,2}|uni|other)$/.test(String(c.year ?? ''))) parts.push(`ano: ${c.year}`);
  if (pick(c.subjects).length) parts.push(`disciplinas: ${pick(c.subjects).join(', ')}`);
  if (pick(c.hard).length) parts.push(`mais difíceis: ${pick(c.hard).join(', ')}`);
  if (['grades', 'exams', 'keep', 'organize'].includes(c.goal)) parts.push(`objetivo: ${c.goal}`);
  if (c.test && SUBJECT_IDS.includes(c.test.subject) && /^\d{4}-\d{2}-\d{2}$/.test(c.test.date)) parts.push(`teste de ${c.test.subject} em ${c.test.date}`);
  return parts.join('; ');
}

// Liga as regras das salas a um servidor Socket.IO (ou a qualquer objeto com a mesma forma).
export const PREMIUM = {
  trialDays: 7,          // teste grátis depois do primeiro plano
  streakDays: 30,        // dias de chama acesa para ganhar Premium
  streakReward: 7,       // dias de Premium ganhos com a chama
  teamSize: 5,           // pessoas com Premium para a sala inteira ficar Premium
  freeExamsPerWeek: 1,   // amostra grátis do modo exame
  freeCorrectionsPerDay: 2,
};

export function attachHandlers(io, store, { duelPauseMs = 3000, premiumSecret = randomSecret() } = {}) {
  const timers = new Map();      // code -> timeout do temporizador
  const duelTimers = new Map();
  const explainCache = new Map(); // "qid:escolha" -> explicação
  const tutorUse = new Map();     // pessoa (IP) -> { day, count }
  const freeUse = new Map();      // "pessoa:tipo" -> { period, count } (amostras grátis)
  const trialGiven = new Set();   // pessoas que já usaram o teste grátis

  // Premium da turma: com 5 pessoas Premium na sala, a sala inteira fica Premium
  function updateTeam(room) {
    const count = [...room.members.values()].filter(m => m.premium).length;
    const active = count >= PREMIUM.teamSize;
    room.teamPremium = active;
    io.to(room.code).emit('teamPremium', { count, need: PREMIUM.teamSize, active });
    io.to(room.code).emit('aiQuota', R.aiQuota(room, AI_WEEKLY_LIMIT));
  }


  R.rolloverLeagues(store);
  const leagueTick = setInterval(() => {
    if (R.rolloverLeagues(store)) {
      store.save();
      for (const room of store.rooms.values()) if (room.members.size) emitProgress(room);
    }
  }, 60 * 60 * 1000);

  const emitMembers = room => io.to(room.code).emit('members', R.membersList(room));
  const emitTimer = room => io.to(room.code).emit('timer', room.timer);
  const emitProgress = room => io.to(room.code).emit('progress', {
    streak: R.streakInfo(room), league: R.leagueInfo(store, room), stats: room.stats,
  });
  const emitAiQuota = room => io.to(room.code).emit('aiQuota', R.aiQuota(room, AI_WEEKLY_LIMIT));

  function scheduleTimer(room) {
    clearTimeout(timers.get(room.code));
    if (room.timer.state === 'idle') return;
    const ms = Math.max(0, room.timer.endsAt - Date.now());
    timers.set(room.code, setTimeout(() => {
      if (room.timer.state === 'focus') {
        const before = R.streakInfo(room).today.lit;
        const { minutes, rewarded } = R.finishFocus(room);
        const streak = R.streakInfo(room);
        io.to(room.code).emit('focusDone', { minutes, rewarded, hour: new Date().getHours(), streak: streak.streak });
        if (!before && streak.today.lit) io.to(room.code).emit('system', { k: 'flame_lit', p: { n: streak.streak } });
        emitProgress(room);
        R.startBreak(room);
      } else {
        R.stopTimer(room);
        io.to(room.code).emit('breakDone');
      }
      store.save();
      emitTimer(room);
      emitMembers(room);
      scheduleTimer(room);
    }, ms));
  }

  function runDuelQuestion(room) {
    const q = R.nextQuestion(room);
    if (!q) return finishDuel(room);
    io.to(room.code).emit('duelQuestion', q);
    duelTimers.set(room.code, setTimeout(() => {
      const reveal = R.revealAnswer(room);
      io.to(room.code).emit('duelReveal', reveal);
      for (const name of reveal.eliminated) io.to(room.code).emit('system', { k: 'eliminated', p: { name, n: reveal.index + 1 } });
      const end = R.duelShouldEnd(room);
      duelTimers.set(room.code, setTimeout(() => (end ? finishDuel(room) : runDuelQuestion(room)), duelPauseMs));
    }, R.DUEL.perQuestionMs));
  }

  function finishDuel(room) {
    const result = R.endDuel(room);
    io.to(room.code).emit('duelEnd', result);
    emitProgress(room);
    store.save();
  }

  io.on('connection', socket => {
    let room = null;
    let me = null;
    let aiBusy = false;
    let premium = null; // conteúdo do passe Premium desta ligação
    const ack = (cb, data) => typeof cb === 'function' && cb(data);
    const isPremium = () => !!premium && premium.exp > Date.now();

    // amostras grátis (exame por semana, correção por dia) — o Premium não tem limite
    function takeFree(kind, limit, period) {
      if (isPremium()) return true;
      const k = `${who}:${kind}`;
      const u = freeUse.get(k);
      const count = u?.period === period ? u.count : 0;
      if (count >= limit) return false;
      freeUse.set(k, { period, count: count + 1 });
      return true;
    }
    const giveBackFree = kind => {
      if (isPremium()) return;
      const u = freeUse.get(`${who}:${kind}`);
      if (u) u.count = Math.max(0, u.count - 1);
    };

    async function grant(kind, days) {
      const start = isPremium() ? premium.exp : Date.now();
      premium = { kind, exp: start + days * DAY };
      if (room && me) { me.premium = true; updateTeam(room); }
      return { pass: await signPass(premiumSecret, premium), premium };
    }

    function join(target, profile, cb) {
      if (!target) return ack(cb, { error: 'room_not_found' });
      const res = R.addMember(target, socket.id, profile);
      if (res.error) return ack(cb, res);
      room = target;
      me = res.member;
      me.premium = isPremium();
      socket.join(room.code);
      ack(cb, {
        room: R.publicRoom(room, store),
        me,
        ai: { enabled: AI.aiEnabled(), quota: R.aiQuota(room, AI_WEEKLY_LIMIT) },
      });
      socket.to(room.code).emit('system', { k: 'joined', p: { name: me.name } });
      emitMembers(room);
      emitProgress(room); // a meta do dia muda quando entra alguém
      updateTeam(room);
      store.save();
    }

    socket.on('createRoom', ({ name, profile } = {}, cb) => {
      if (room) return ack(cb, { error: 'already_in_room' });
      join(store.create(name, profile?.name), profile, cb);
    });

    socket.on('joinRoom', ({ code, profile } = {}, cb) => {
      if (room) return ack(cb, { error: 'already_in_room' });
      join(store.get(code), profile, cb);
    });

    // ---------- tutor: funciona sem sala ----------
    let tutorBusy = false;
    const who = socket.handshake?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || socket.handshake?.address || socket.id;

    // ---------- Premium ----------
    socket.on('auth', async (opts, cb) => {
      premium = await verifyPass(premiumSecret, opts?.pass);
      if (room && me) { me.premium = isPremium(); updateTeam(room); }
      ack(cb, { premium });
    });

    // 7 dias grátis, uma vez por pessoa
    socket.on('claimTrial', async (_x, cb) => {
      if (trialGiven.has(who)) return ack(cb, { error: 'trial_used' });
      trialGiven.add(who);
      ack(cb, await grant('trial', PREMIUM.trialDays));
    });

    // 30 dias seguidos de chama acesa na sala dão 7 dias de Premium (uma vez por cada 30 dias)
    socket.on('claimStreak', async (_x, cb) => {
      if (!room || !me) return ack(cb, { error: 'need_room' });
      const streak = R.streakInfo(room).streak;
      const earned = Math.floor(streak / PREMIUM.streakDays);
      room.streakRewards ??= {};
      const given = room.streakRewards[me.name] ?? 0;
      if (earned <= given) return ack(cb, { error: 'streak_not_yet', p: { n: PREMIUM.streakDays - (streak % PREMIUM.streakDays) } });
      room.streakRewards[me.name] = earned;
      store.save();
      ack(cb, await grant('streak', PREMIUM.streakReward));
    });

    // ---------- modo exame ----------
    let examBusy = false;
    socket.on('aiExam', async (opts, cb) => {
      const { subject, year, count, topic, lang } = opts ?? {};
      if (!AI.aiEnabled()) return ack(cb, { error: 'ai_off' });
      if (examBusy) return ack(cb, { error: 'ai_busy' });
      const subj = R.cleanText(subject, 40);
      if (!subj) return ack(cb, { error: 'subject_required' });
      if (!takeFree('exam', PREMIUM.freeExamsPerWeek, R.weekKey())) return ack(cb, { error: 'exam_limit', quota: true });
      examBusy = true;
      try {
        const n = [5, 10, 20].includes(Number(count)) ? Number(count) : 10;
        const exam = await AI.generateExam({ subject: subj, year: R.cleanText(year, 10), count: n, topic: R.cleanText(topic, 60), lang });
        if (!exam.questions.length) throw new AI.AIError('ai_incomplete');
        ack(cb, { ok: true, exam, premium: isPremium() });
      } catch (e) {
        giveBackFree('exam');
        ack(cb, { error: e instanceof AI.AIError ? e.message : 'ai_failed' });
      } finally {
        examBusy = false;
      }
    });

    // ---------- correção de respostas escritas ----------
    let corrBusy = false;
    socket.on('aiCorrect', async (opts, cb) => {
      const { question, answer, image, subject, lang } = opts ?? {};
      if (!AI.aiEnabled()) return ack(cb, { error: 'ai_off' });
      if (corrBusy) return ack(cb, { error: 'ai_busy' });
      if (image && (!IMAGE_TYPES.includes(image.mediaType) || typeof image.data !== 'string' || image.data.length > MAX_IMAGE_B64)) {
        return ack(cb, { error: 'image_invalid' });
      }
      const ans = R.cleanText(answer, 6000);
      if (!image && ans.length < 10) return ack(cb, { error: 'correct_need_answer' });
      if (!takeFree('correct', PREMIUM.freeCorrectionsPerDay, R.dayKey())) return ack(cb, { error: 'correct_limit', quota: true });
      corrBusy = true;
      try {
        const result = await AI.correctAnswer({ question: R.cleanText(question, 1000), answer: ans, image, subject: R.cleanText(subject, 40), lang });
        ack(cb, { ok: true, result });
      } catch (e) {
        giveBackFree('correct');
        ack(cb, { error: e instanceof AI.AIError ? e.message : 'ai_failed' });
      } finally {
        corrBusy = false;
      }
    });
    socket.on('tutorAsk', async (opts, cb) => {
      const { messages, lang, image, context } = opts ?? {};
      if (!AI.aiEnabled()) return ack(cb, { error: 'ai_off' });
      if (tutorBusy) return ack(cb, { error: 'ai_busy' });
      const msgs = cleanTutorMessages(messages);
      if (!msgs) return ack(cb, { error: 'tutor_empty' });
      if (image && (!IMAGE_TYPES.includes(image.mediaType) || typeof image.data !== 'string' || image.data.length > MAX_IMAGE_B64)) {
        return ack(cb, { error: 'image_invalid' });
      }
      const day = R.dayKey();
      const use = tutorUse.get(who);
      const count = use?.day === day ? use.count : 0;
      const limit = tutorDaily();
      if (!isPremium() && count >= limit) return ack(cb, { error: 'tutor_limit', p: { n: limit }, quota: true });
      if (!isPremium()) tutorUse.set(who, { day, count: count + 1 });
      tutorBusy = true;
      const id = opts?.id ?? null;
      try {
        const text = await AI.tutorStream({
          messages: msgs, lang, image, context: tutorContext(context),
          onText: delta => socket.emit('tutorDelta', { id, delta }),
        });
        ack(cb, { ok: true, text, left: isPremium() ? null : limit - count - 1 });
      } catch (e) {
        if (!isPremium()) tutorUse.set(who, { day, count }); // falhou: não conta
        ack(cb, { error: e instanceof AI.AIError ? e.message : 'ai_failed' });
        if (!(e instanceof AI.AIError)) console.error('[tutor]', e);
      } finally {
        tutorBusy = false;
      }
    });

    // A partir daqui é preciso estar numa sala.
    const inRoom = fn => (...args) => { if (room && me) fn(...args); };

    // Corre uma tarefa de IA: verifica se está ligada, a quota, e só uma de cada vez por pessoa.
    async function runAI(cb, fn, { count = true } = {}) {
      if (!AI.aiEnabled()) return ack(cb, { error: 'ai_off' });
      if (aiBusy) return ack(cb, { error: 'ai_busy' });
      if (isPremium()) count = false;
      if (count && !R.useAI(room, AI_WEEKLY_LIMIT)) {
        return ack(cb, { error: 'ai_quota', p: { n: AI_WEEKLY_LIMIT }, quota: true });
      }
      aiBusy = true;
      try {
        ack(cb, await fn());
      } catch (e) {
        if (count) room.aiUsage.count = Math.max(0, room.aiUsage.count - 1); // falhou: não conta
        ack(cb, { error: e instanceof AI.AIError ? e.message : 'ai_failed' });
        if (!(e instanceof AI.AIError)) console.error('[IA]', e);
      } finally {
        aiBusy = false;
        emitAiQuota(room);
        store.save();
      }
    }

    socket.on('chat', inRoom(text => {
      const msg = R.addMessage(room, me.name, text);
      if (msg) { io.to(room.code).emit('chat', msg); store.save(); }
    }));

    socket.on('react', inRoom(emoji => {
      if (['🔥', '💪', '😴', '👏', '🤯', '☕'].includes(emoji)) io.to(room.code).emit('react', { name: me.name, emoji });
    }));

    socket.on('status', inRoom(status => {
      R.setStatus(room, socket.id, status);
      emitMembers(room);
    }));

    socket.on('profile', inRoom(p => {
      me.avatar = String(p?.avatar ?? me.avatar).slice(0, 8);
      me.frame = String(p?.frame ?? me.frame).slice(0, 20);
      me.medal = String(p?.medal ?? me.medal ?? '').slice(0, 8);
      emitMembers(room);
    }));

    socket.on('timerStart', inRoom(minutes => {
      R.startFocus(room, Date.now(), minutes);
      io.to(room.code).emit('system', { k: 'focus_started', p: { name: me.name, n: room.timer.focusMin } });
      emitTimer(room); emitMembers(room); scheduleTimer(room);
    }));

    socket.on('timerStop', inRoom(() => {
      R.stopTimer(room);
      io.to(room.code).emit('system', { k: 'timer_stopped', p: { name: me.name } });
      emitTimer(room); emitMembers(room); scheduleTimer(room);
    }));

    socket.on('ambience', inRoom(a => {
      if (!R.AMBIENCES.includes(a)) return;
      room.ambience = a;
      io.to(room.code).emit('ambience', { ambience: a, by: me.name });
      store.save();
    }));

    // apontamentos
    socket.on('addNote', inRoom(({ title, text } = {}, cb) => {
      const note = R.addNote(room, me.name, title, text);
      if (!note) return ack(cb, { error: 'note_failed' });
      io.to(room.code).emit('note', note); store.save(); ack(cb, { ok: true });
    }));

    socket.on('removeNote', inRoom(id => {
      if (R.removeNote(room, id, me.name)) { io.to(room.code).emit('noteRemoved', id); store.save(); }
    }));

    // perguntas
    socket.on('addQuestion', inRoom((q, cb) => {
      const res = R.addQuestion(room, me.name, { ...q, ai: false });
      if (res.error) return ack(cb, res);
      io.to(room.code).emit('question', R.publicQuestion(res.question));
      store.save(); ack(cb, { ok: true });
    }));

    socket.on('removeQuestion', inRoom(id => {
      if (R.removeQuestion(room, id, me.name)) { io.to(room.code).emit('questionRemoved', id); store.save(); }
    }));

    // calendário de testes
    socket.on('addTest', inRoom((t, cb) => {
      const res = R.addTest(room, me.name, t);
      if (res.error) return ack(cb, res);
      io.to(room.code).emit('tests', R.upcomingTests(room));
      io.to(room.code).emit('system', { k: 'test_added', p: { name: me.name, subject: res.test.subject } });
      store.save(); ack(cb, { ok: true });
    }));

    socket.on('removeTest', inRoom(id => {
      if (R.removeTest(room, id)) { io.to(room.code).emit('tests', R.upcomingTests(room)); store.save(); }
    }));

    // duelos
    socket.on('duelStart', inRoom((opts, cb) => {
      const participants = [...room.members.values()].map(m => m.name);
      const res = R.startDuel(room, opts?.mode, participants);
      if (res.error) return ack(cb, res);
      ack(cb, { ok: true });
      io.to(room.code).emit('duelStarting', { by: me.name, mode: res.duel.mode, total: res.duel.questions.length, players: participants });
      duelTimers.set(room.code, setTimeout(() => runDuelQuestion(room), duelPauseMs));
    }));

    socket.on('duelAnswer', inRoom((choice, cb) => {
      const res = R.answerDuel(room, me.name, choice);
      if (res) { ack(cb, res); io.to(room.code).emit('duelAnswered', me.name); }
    }));

    socket.on('duelFifty', inRoom((_x, cb) => ack(cb, R.useFifty(room, me.name) ?? { error: 'fifty_used' })));
    socket.on('duelAsk', inRoom((_x, cb) => ack(cb, R.useAsk(room, me.name) ?? { error: 'ask_used' })));

    // ---------- IA ----------
    socket.on('aiQuestions', inRoom((opts, cb) => {
      const { image, text, lang } = opts ?? {};
      if (image) {
        if (!IMAGE_TYPES.includes(image.mediaType) || typeof image.data !== 'string' || image.data.length > MAX_IMAGE_B64) {
          return ack(cb, { error: 'image_invalid' });
        }
      }
      const cleanTextIn = R.cleanText(text, 8000);
      if (!image && cleanTextIn.length < 30) return ack(cb, { error: 'ai_text_short' });
      runAI(cb, async () => {
        const out = await AI.generateQuestions({ image, text: cleanTextIn, lang });
        if (!out.questions.length) return { error: 'ai_no_content' };
        const added = [];
        for (const q of out.questions) {
          const res = R.addQuestion(room, me.name, { ...q, ai: true });
          if (res.question) { added.push(res.question); io.to(room.code).emit('question', R.publicQuestion(res.question)); }
        }
        io.to(room.code).emit('system', { k: 'ai_questions', p: { name: me.name, n: added.length, subject: out.subject } });
        return { ok: true, count: added.length, subject: out.subject };
      });
    }));

    socket.on('aiExplain', inRoom((opts, cb) => {
      const { qid, chosen, lang } = opts ?? {};
      const q = room.questions.find(x => x.id === qid);
      if (!q) return ack(cb, { error: 'question_gone' });
      const pick = Number.isInteger(chosen) && chosen >= 0 && chosen < q.options.length ? chosen : null;
      const key = `${qid}:${pick}:${AI.langName(lang)}`;
      if (explainCache.has(key)) return ack(cb, explainCache.get(key));
      // explicações não gastam a quota da sala (são curtas e ficam em cache)
      runAI(cb, async () => {
        const out = await AI.explainMistake({ question: q.question, options: q.options, answer: q.answer, chosen: pick, lang });
        explainCache.set(key, out);
        if (explainCache.size > 2000) explainCache.delete(explainCache.keys().next().value);
        return out;
      }, { count: false });
    }));

    socket.on('aiSummary', inRoom((opts, cb) => {
      const lang = opts?.lang;
      if (room.notes.length === 0) return ack(cb, { error: 'no_notes' });
      runAI(cb, async () => {
        const summary = { ...(await AI.summarizeNotes(room.notes, lang)), by: me.name, ts: Date.now(), notes: room.notes.length };
        room.summary = summary;
        io.to(room.code).emit('summary', summary);
        return { ok: true };
      });
    }));

    socket.on('aiGrade', inRoom((opts, cb) => {
      const { testId, lang } = opts ?? {};
      const perf = R.performance(room, me.name);
      if (perf.answered < 5) return ack(cb, { error: 'grade_need_answers' });
      const test = R.upcomingTests(room).find(t => t.id === testId) ?? null;
      runAI(cb, async () => ({ ...(await AI.predictGrade({ perf, test, lang })), answered: perf.answered, accuracy: perf.accuracy }));
    }));

    socket.on('report', inRoom(({ messageId } = {}) => {
      const msg = room.messages.find(m => m.id === messageId);
      if (msg) console.warn(`[DENÚNCIA] sala ${room.code}: ${me.name} denunciou "${msg.text}" de ${msg.author}`);
    }));

    socket.on('disconnect', () => {
      if (!room || !me) return;
      room.members.delete(socket.id);
      updateTeam(room);
      io.to(room.code).emit('system', { k: 'left', p: { name: me.name } });
      emitMembers(room);
    });
  });

  return {
    stop() {
      clearInterval(leagueTick);
      for (const t of [...timers.values(), ...duelTimers.values()]) clearTimeout(t);
    },
  };
}
