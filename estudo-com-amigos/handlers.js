// Regras do servidor em tempo real (eventos Socket.IO). Não depende do Express.
import * as R from './rooms.js';
import * as AI from './ai.js';

const AI_WEEKLY_LIMIT = Number(globalThis.process?.env?.AI_WEEKLY_LIMIT) || 30; // usos de IA por sala por semana (grátis)
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_B64 = 5 * 1024 * 1024;

// Liga as regras das salas a um servidor Socket.IO (ou a qualquer objeto com a mesma forma).
export function attachHandlers(io, store, { duelPauseMs = 3000 } = {}) {
  const timers = new Map();      // code -> timeout do temporizador
  const duelTimers = new Map();
  const explainCache = new Map(); // "qid:escolha" -> explicação

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
        if (!before && streak.today.lit) io.to(room.code).emit('system', `🔥 A chama da sala está acesa hoje! Sequência: ${streak.streak} dia(s).`);
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
      for (const name of reveal.eliminated) io.to(room.code).emit('system', `💥 ${name} foi eliminado na pergunta ${reveal.index + 1}.`);
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
    const ack = (cb, data) => typeof cb === 'function' && cb(data);

    function join(target, profile, cb) {
      if (!target) return ack(cb, { error: 'Não encontrei nenhuma sala com esse código.' });
      const res = R.addMember(target, socket.id, profile);
      if (res.error) return ack(cb, res);
      room = target;
      me = res.member;
      socket.join(room.code);
      ack(cb, {
        room: R.publicRoom(room, store),
        me,
        ai: { enabled: AI.aiEnabled(), quota: R.aiQuota(room, AI_WEEKLY_LIMIT) },
      });
      socket.to(room.code).emit('system', `${me.name} entrou na sala.`);
      emitMembers(room);
      emitProgress(room); // a meta do dia muda quando entra alguém
      store.save();
    }

    socket.on('createRoom', ({ name, profile } = {}, cb) => {
      if (room) return ack(cb, { error: 'Já estás numa sala.' });
      join(store.create(name, profile?.name), profile, cb);
    });

    socket.on('joinRoom', ({ code, profile } = {}, cb) => {
      if (room) return ack(cb, { error: 'Já estás numa sala.' });
      join(store.get(code), profile, cb);
    });

    // A partir daqui é preciso estar numa sala.
    const inRoom = fn => (...args) => { if (room && me) fn(...args); };

    // Corre uma tarefa de IA: verifica se está ligada, a quota, e só uma de cada vez por pessoa.
    async function runAI(cb, fn, { count = true } = {}) {
      if (!AI.aiEnabled()) return ack(cb, { error: 'A IA ainda não está ligada nesta app.' });
      if (aiBusy) return ack(cb, { error: 'Espera que a IA acabe o pedido anterior.' });
      if (count && !R.useAI(room, AI_WEEKLY_LIMIT)) {
        return ack(cb, { error: `Esta sala já usou os ${AI_WEEKLY_LIMIT} pedidos de IA desta semana.`, quota: true });
      }
      aiBusy = true;
      try {
        ack(cb, await fn());
      } catch (e) {
        if (count) room.aiUsage.count = Math.max(0, room.aiUsage.count - 1); // falhou: não conta
        ack(cb, { error: e instanceof AI.AIError ? e.message : 'A IA falhou. Tenta outra vez.' });
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
      emitMembers(room);
    }));

    socket.on('timerStart', inRoom(minutes => {
      R.startFocus(room, Date.now(), minutes);
      io.to(room.code).emit('system', `${me.name} começou ${room.timer.focusMin} min de foco. Bora! 💪`);
      emitTimer(room); emitMembers(room); scheduleTimer(room);
    }));

    socket.on('timerStop', inRoom(() => {
      R.stopTimer(room);
      io.to(room.code).emit('system', `${me.name} parou o temporizador.`);
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
      if (!note) return ack(cb, { error: 'Não deu para guardar o apontamento.' });
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
      io.to(room.code).emit('system', `📅 ${me.name} marcou o teste de ${res.test.subject}.`);
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

    socket.on('duelFifty', inRoom((_x, cb) => ack(cb, R.useFifty(room, me.name) ?? { error: 'Já usaste o 50/50.' })));
    socket.on('duelAsk', inRoom((_x, cb) => ack(cb, R.useAsk(room, me.name) ?? { error: 'Já perguntaste à sala.' })));

    // ---------- IA ----------
    socket.on('aiQuestions', inRoom(({ image, text } = {}, cb) => {
      if (image) {
        if (!IMAGE_TYPES.includes(image.mediaType) || typeof image.data !== 'string' || image.data.length > MAX_IMAGE_B64) {
          return ack(cb, { error: 'A imagem é grande demais ou de um tipo que não conheço.' });
        }
      }
      const cleanTextIn = R.cleanText(text, 8000);
      if (!image && cleanTextIn.length < 30) return ack(cb, { error: 'Tira uma foto ou escreve mais texto (pelo menos umas frases).' });
      runAI(cb, async () => {
        const out = await AI.generateQuestions({ image, text: cleanTextIn });
        if (!out.questions.length) return { error: 'Não encontrei matéria para fazer perguntas. Tenta uma foto mais nítida.' };
        const added = [];
        for (const q of out.questions) {
          const res = R.addQuestion(room, me.name, { ...q, ai: true });
          if (res.question) { added.push(res.question); io.to(room.code).emit('question', R.publicQuestion(res.question)); }
        }
        io.to(room.code).emit('system', `🤖 ${me.name} criou ${added.length} perguntas com IA (${out.subject}).`);
        return { ok: true, count: added.length, subject: out.subject };
      });
    }));

    socket.on('aiExplain', inRoom(({ qid, chosen } = {}, cb) => {
      const q = room.questions.find(x => x.id === qid);
      if (!q) return ack(cb, { error: 'Essa pergunta já não existe.' });
      const pick = Number.isInteger(chosen) && chosen >= 0 && chosen < q.options.length ? chosen : null;
      const key = `${qid}:${pick}`;
      if (explainCache.has(key)) return ack(cb, explainCache.get(key));
      // explicações não gastam a quota da sala (são curtas e ficam em cache)
      runAI(cb, async () => {
        const out = await AI.explainMistake({ question: q.question, options: q.options, answer: q.answer, chosen: pick });
        explainCache.set(key, out);
        if (explainCache.size > 2000) explainCache.delete(explainCache.keys().next().value);
        return out;
      }, { count: false });
    }));

    socket.on('aiSummary', inRoom((_x, cb) => {
      if (room.notes.length === 0) return ack(cb, { error: 'Ainda não há apontamentos para resumir.' });
      runAI(cb, async () => {
        const summary = { ...(await AI.summarizeNotes(room.notes)), by: me.name, ts: Date.now(), notes: room.notes.length };
        room.summary = summary;
        io.to(room.code).emit('summary', summary);
        return { ok: true };
      });
    }));

    socket.on('aiGrade', inRoom(({ testId } = {}, cb) => {
      const perf = R.performance(room, me.name);
      if (perf.answered < 5) return ack(cb, { error: 'Responde a pelo menos 5 perguntas em duelos para eu conseguir prever.' });
      const test = R.upcomingTests(room).find(t => t.id === testId) ?? null;
      runAI(cb, async () => ({ ...(await AI.predictGrade({ perf, test })), answered: perf.answered, accuracy: perf.accuracy }));
    }));

    socket.on('report', inRoom(({ messageId } = {}) => {
      const msg = room.messages.find(m => m.id === messageId);
      if (msg) console.warn(`[DENÚNCIA] sala ${room.code}: ${me.name} denunciou "${msg.text}" de ${msg.author}`);
    }));

    socket.on('disconnect', () => {
      if (!room || !me) return;
      room.members.delete(socket.id);
      io.to(room.code).emit('system', `${me.name} saiu da sala.`);
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
