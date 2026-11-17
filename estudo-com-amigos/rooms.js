// Lógica das salas de estudo (sem rede) — fácil de testar.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

export const LIMITS = {
  maxMembers: 30,        // salas grandes (turma inteira)
  maxMessages: 200,      // mensagens guardadas por sala
  maxNotes: 300,
  maxQuestions: 300,
  maxTests: 50,
  maxText: 500,          // caracteres por mensagem
  maxNoteText: 4000,
  nameMax: 20,
  answerLog: 300,        // respostas guardadas por pessoa (para a previsão de nota)
  minFocus: 5,           // minutos mínimos de uma sessão de foco
};

export const TZ = 'Europe/Lisbon';
export const AMBIENCES = ['none', 'chuva', 'cafe', 'lofi', 'biblioteca'];
export const LEAGUES = ['Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante'];
export const STREAK_MIN_PER_PERSON = 15;

// ---------- texto ----------

const BAD_WORDS = [
  'merda', 'caralho', 'foda', 'fodase', 'puta', 'cabrao', 'cabrão', 'porra',
  'idiota', 'estupido', 'estúpido', 'otario', 'otário', 'fdp', 'pqp', 'crl',
];
const BAD_RE = new RegExp(`(?<![\\p{L}])(${BAD_WORDS.join('|')})(?![\\p{L}])`, 'giu');

export function cleanText(text, max = LIMITS.maxText) {
  const t = String(text ?? '').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, max);
  return t.replace(BAD_RE, m => '*'.repeat(m.length));
}

export function cleanName(name) {
  return cleanText(name, LIMITS.nameMax).replace(/\s+/g, ' ');
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I para não confundir
export function makeCode(exists) {
  for (;;) {
    let c = '';
    for (let i = 0; i < 6; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    if (!exists(c)) return c;
  }
}

let idCounter = 0;
export const newId = () => `${Date.now().toString(36)}${(idCounter++).toString(36)}`;

// ---------- datas (hora de Portugal) ----------

const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
export const dayKey = (now = Date.now()) => dayFmt.format(new Date(now)); // "2026-11-17"

export function addDays(key, n) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Semana começa à segunda-feira. Devolve o dia (segunda) que identifica a semana.
export function weekKey(now = Date.now()) {
  const key = dayKey(now);
  const dow = new Date(`${key}T12:00:00Z`).getUTCDay(); // 0 = domingo
  return addDays(key, -((dow + 6) % 7));
}

export function daysUntil(dateKey, now = Date.now()) {
  const a = new Date(`${dayKey(now)}T12:00:00Z`);
  const b = new Date(`${dateKey}T12:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

// ---------- armazenamento ----------

export class RoomStore {
  constructor(file = null) {
    this.file = file;
    this.rooms = new Map();
    this.meta = { leagueWeek: null };
    this._saveTimer = null;
    if (file && existsSync(file)) {
      try {
        const data = JSON.parse(readFileSync(file, 'utf8'));
        for (const r of data.rooms ?? []) this.rooms.set(r.code, hydrate(r));
        this.meta = { ...this.meta, ...(data.meta ?? {}) };
      } catch (e) {
        console.error('Não consegui ler as salas guardadas:', e.message);
      }
    }
  }

  create(name, owner) {
    const code = makeCode(c => this.rooms.has(c));
    const room = hydrate({
      code,
      name: cleanText(name, 40) || 'Sala de estudo',
      owner: cleanName(owner),
      createdAt: Date.now(),
    });
    this.rooms.set(code, room);
    this.save();
    return room;
  }

  get(code) {
    return this.rooms.get(String(code ?? '').toUpperCase().trim()) ?? null;
  }

  save() {
    if (!this.file) return;
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.saveNow(), 500);
  }

  saveNow() {
    if (!this.file) return;
    clearTimeout(this._saveTimer);
    mkdirSync(dirname(this.file), { recursive: true });
    const rooms = [...this.rooms.values()].map(persistable);
    writeFileSync(this.file, JSON.stringify({ meta: this.meta, rooms }, null, 1));
  }
}

function hydrate(r) {
  return {
    code: r.code,
    name: r.name,
    owner: r.owner ?? '',
    createdAt: r.createdAt ?? Date.now(),
    messages: r.messages ?? [],
    notes: r.notes ?? [],
    questions: r.questions ?? [],
    tests: r.tests ?? [],                 // calendário de testes
    stats: r.stats ?? {},                 // nome -> { minutes, sessions, duelWins }
    answerLog: r.answerLog ?? {},         // nome -> [{ q, topic, ok, ts }]
    days: r.days ?? {},                   // "AAAA-MM-DD" -> { minutes, people: [] }
    league: { tier: 0, week: weekKey(), minutes: 0, ...(r.league ?? {}) },
    ambience: AMBIENCES.includes(r.ambience) ? r.ambience : 'none',
    summary: r.summary ?? null,           // resumo da IA
    aiUsage: r.aiUsage ?? { week: weekKey(), count: 0 },
    premium: !!r.premium,
    timer: { state: 'idle', endsAt: null, focusMin: 25, breakMin: 5, ...(r.timer ?? {}) },
    // estado só em memória:
    members: new Map(),                   // socketId -> { name, avatar, frame, status }
    distracted: new Set(),                // nomes que saíram durante o foco atual
    duel: null,
  };
}

function persistable(room) {
  const { members, distracted, duel, ...rest } = room;
  // o temporizador a correr não sobrevive a um reinício
  return { ...rest, timer: { ...rest.timer, state: 'idle', endsAt: null } };
}

// ---------- membros e chat ----------

export function addMember(room, socketId, profile, now = Date.now()) {
  const name = cleanName(profile?.name);
  if (!name) return { error: 'name_required' };
  if (room.members.size >= LIMITS.maxMembers) return { error: 'room_full' };
  const taken = [...room.members.values()].some(m => m.name.toLowerCase() === name.toLowerCase());
  if (taken) return { error: 'name_taken' };
  const member = {
    name,
    avatar: String(profile?.avatar ?? '🙂').slice(0, 8),
    frame: String(profile?.frame ?? 'none').slice(0, 20),
    medal: String(profile?.medal ?? '').slice(0, 8),
    status: 'focused',
  };
  room.members.set(socketId, member);
  room.stats[name] ??= { minutes: 0, sessions: 0, duelWins: 0 };
  markVisit(room, name, now);
  return { member };
}

export function addMessage(room, author, text) {
  const clean = cleanText(text);
  if (!clean) return null;
  const msg = { id: newId(), author, text: clean, ts: Date.now() };
  room.messages.push(msg);
  if (room.messages.length > LIMITS.maxMessages) room.messages.splice(0, room.messages.length - LIMITS.maxMessages);
  return msg;
}

// ---------- apontamentos ----------

export function addNote(room, author, title, text) {
  const body = cleanText(text, LIMITS.maxNoteText);
  if (!body) return null;
  if (room.notes.length >= LIMITS.maxNotes) return null;
  const note = { id: newId(), author, title: cleanText(title, 60) || 'Apontamento', text: body, ts: Date.now() };
  room.notes.push(note);
  return note;
}

export function removeNote(room, id, requester) {
  const i = room.notes.findIndex(n => n.id === id);
  if (i < 0) return false;
  const n = room.notes[i];
  if (n.author !== requester && room.owner !== requester) return false;
  room.notes.splice(i, 1);
  return true;
}

// ---------- perguntas ----------

export function addQuestion(room, author, q) {
  const question = cleanText(q?.question, 200);
  const options = (Array.isArray(q?.options) ? q.options : []).map(o => cleanText(o, 80)).filter(Boolean);
  const answer = Number(q?.answer);
  if (!question || options.length < 2 || options.length > 4) return { error: 'question_invalid' };
  if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) return { error: 'answer_required' };
  if (room.questions.length >= LIMITS.maxQuestions) return { error: 'too_many_questions' };
  const difficulty = [1, 2, 3].includes(Number(q?.difficulty)) ? Number(q.difficulty) : 2;
  const item = {
    id: newId(), author, question, options, answer, difficulty,
    topic: cleanText(q?.topic, 40) || '',
    ai: !!q?.ai,
    ts: Date.now(),
  };
  room.questions.push(item);
  return { question: item };
}

export function removeQuestion(room, id, requester) {
  const i = room.questions.findIndex(q => q.id === id);
  if (i < 0) return false;
  const q = room.questions[i];
  if (q.author !== requester && room.owner !== requester) return false;
  room.questions.splice(i, 1);
  return true;
}

export const publicQuestion = ({ id, author, question, difficulty, topic, ai }) => ({ id, author, question, difficulty, topic, ai });

// ---------- calendário de testes ----------

export function addTest(room, author, { subject, date } = {}, now = Date.now()) {
  const s = cleanText(subject, 40);
  if (!s) return { error: 'subject_required' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date ?? ''))) return { error: 'date_required' };
  if (daysUntil(date, now) < 0) return { error: 'date_past' };
  if (room.tests.length >= LIMITS.maxTests) return { error: 'calendar_full' };
  const test = { id: newId(), author, subject: s, date };
  room.tests.push(test);
  room.tests.sort((a, b) => a.date.localeCompare(b.date));
  return { test };
}

export function removeTest(room, id) {
  const i = room.tests.findIndex(t => t.id === id);
  if (i < 0) return false;
  room.tests.splice(i, 1);
  return true;
}

export function upcomingTests(room, now = Date.now()) {
  return room.tests
    .map(t => ({ ...t, daysLeft: daysUntil(t.date, now) }))
    .filter(t => t.daysLeft >= 0);
}

// ---------- chama da sala (streak em grupo) ----------
// Um dia conta se a sala estudou pelo menos 15 min × (pessoas que entraram nesse dia).
// Quem estuda a dobrar "salva" o amigo que não estudou.

function today(room, now) {
  const k = dayKey(now);
  room.days[k] ??= { minutes: 0, people: [] };
  return room.days[k];
}

function markVisit(room, name, now) {
  const d = today(room, now);
  if (!d.people.includes(name)) d.people.push(name);
  pruneDays(room, now);
}

function pruneDays(room, now) {
  const oldest = addDays(dayKey(now), -60);
  for (const k of Object.keys(room.days)) if (k < oldest) delete room.days[k];
}

export const dayGoal = d => STREAK_MIN_PER_PERSON * Math.max(1, d?.people?.length ?? 0);
export const dayLit = d => !!d && d.minutes >= dayGoal(d);

export function streakInfo(room, now = Date.now()) {
  const todayKey = dayKey(now);
  const t = room.days[todayKey] ?? { minutes: 0, people: [] };
  let streak = 0;
  let k = dayLit(t) ? todayKey : addDays(todayKey, -1);
  while (dayLit(room.days[k])) { streak++; k = addDays(k, -1); }
  return { streak, today: { minutes: t.minutes, goal: dayGoal(t), lit: dayLit(t), people: t.people.length } };
}

// ---------- ligas semanais ----------

export function addLeagueMinutes(room, minutes, now = Date.now()) {
  const wk = weekKey(now);
  if (room.league.week !== wk) room.league = { ...room.league, week: wk, minutes: 0 };
  room.league.minutes += minutes;
}

// No início de cada semana: em cada liga, sobe o melhor 20% e desce o pior 20% (ou quem não estudou).
export function rolloverLeagues(store, now = Date.now()) {
  const wk = weekKey(now);
  if (store.meta.leagueWeek === wk) return false;
  const first = store.meta.leagueWeek == null;
  store.meta.leagueWeek = wk;
  if (first) return false;
  const byTier = new Map();
  for (const room of store.rooms.values()) {
    const minutes = room.league.week === wk ? 0 : room.league.minutes; // minutos da semana que acabou
    if (!byTier.has(room.league.tier)) byTier.set(room.league.tier, []);
    byTier.get(room.league.tier).push({ room, minutes });
  }
  for (const [tier, list] of byTier) {
    list.sort((a, b) => b.minutes - a.minutes);
    const n = Math.max(1, Math.floor(list.length * 0.2));
    list.forEach(({ room, minutes }, i) => {
      let t = tier;
      if (minutes > 0 && i < n && list.length > 1) t = Math.min(LEAGUES.length - 1, tier + 1);
      else if (minutes === 0 || (i >= list.length - n && list.length > 2)) t = Math.max(0, tier - 1);
      room.league = { tier: t, week: wk, minutes: 0, last: { tier, minutes, place: i + 1 } };
    });
  }
  return true;
}

export function leagueTable(store, room, now = Date.now()) {
  const wk = weekKey(now);
  return [...store.rooms.values()]
    .filter(r => r.league.tier === room.league.tier)
    .map(r => ({ name: r.name, minutes: r.league.week === wk ? r.league.minutes : 0, me: r === room }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 30);
}

// ---------- temporizador de foco ----------

export function startFocus(room, now = Date.now(), minutes) {
  const m = clampMin(minutes ?? room.timer.focusMin, LIMITS.minFocus, 90);
  room.timer = { ...room.timer, state: 'focus', focusMin: m, endsAt: now + m * 60_000, startedAt: now };
  room.distracted.clear();
  for (const mem of room.members.values()) if (mem.status === 'away') room.distracted.add(mem.name);
}

export function startBreak(room, now = Date.now()) {
  room.timer = { ...room.timer, state: 'break', endsAt: now + room.timer.breakMin * 60_000 };
}

export function stopTimer(room) {
  room.timer = { ...room.timer, state: 'idle', endsAt: null };
  room.distracted.clear();
}

// Termina o foco e dá os minutos a quem não se distraiu. Devolve quem ganhou.
export function finishFocus(room, now = Date.now()) {
  const minutes = room.timer.focusMin;
  const rewarded = [];
  for (const mem of room.members.values()) {
    if (room.distracted.has(mem.name)) continue;
    const s = room.stats[mem.name] ??= { minutes: 0, sessions: 0, duelWins: 0 };
    s.minutes += minutes;
    s.sessions += 1;
    rewarded.push(mem.name);
  }
  const total = minutes * rewarded.length;
  today(room, now).minutes += total;
  addLeagueMinutes(room, total, now);
  room.distracted.clear();
  return { minutes, rewarded };
}

export function setStatus(room, socketId, status) {
  const mem = room.members.get(socketId);
  if (!mem) return;
  mem.status = status === 'away' ? 'away' : 'focused';
  if (mem.status === 'away' && room.timer.state === 'focus') room.distracted.add(mem.name);
}

const clampMin = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(Number(v) || lo)));

// ---------- duelos ----------
// mode "classico": pontos por acerto + rapidez.
// mode "eliminacao": perguntas cada vez mais difíceis; quem erra sai. Ajudas: 50/50 e "perguntar à sala".

export const DUEL = { perQuestionMs: (Number(globalThis.process?.env?.DUEL_SECONDS) || 15) * 1000, maxQuestions: 10, maxElimination: 15 };

export function startDuel(room, mode = 'classico', participants = []) {
  if (room.duel) return { error: 'duel_running' };
  if (room.questions.length < 3) return { error: 'duel_need_questions' };
  const elim = mode === 'eliminacao';
  if (elim && participants.length < 1) return { error: 'duel_no_players' };
  const pool = [...room.questions];
  shuffle(pool);
  if (elim) pool.sort((a, b) => (a.difficulty ?? 2) - (b.difficulty ?? 2));
  room.duel = {
    mode: elim ? 'eliminacao' : 'classico',
    questions: pool.slice(0, elim ? DUEL.maxElimination : DUEL.maxQuestions),
    index: -1,
    scores: {},          // nome -> pontos (clássico) ou perguntas acertadas (eliminação)
    alive: new Set(participants),
    out: [],             // ordem de eliminação
    lifelines: Object.fromEntries(participants.map(p => [p, { fifty: true, ask: true }])),
    answered: new Map(), // nome -> índice escolhido (pergunta atual)
    askedAt: 0,
  };
  for (const p of participants) room.duel.scores[p] = 0;
  return { duel: room.duel };
}

export function nextQuestion(room, now = Date.now()) {
  const d = room.duel;
  if (!d) return null;
  d.index += 1;
  d.answered = new Map();
  d.askedAt = now;
  if (d.index >= d.questions.length) return null;
  if (d.mode === 'eliminacao' && d.alive.size === 0) return null;
  const q = d.questions[d.index];
  return {
    mode: d.mode, index: d.index, total: d.questions.length,
    qid: q.id, question: q.question, options: q.options, difficulty: q.difficulty,
    alive: [...d.alive], endsAt: now + DUEL.perQuestionMs,
  };
}

export function answerDuel(room, name, choice, now = Date.now()) {
  const d = room.duel;
  if (!d || d.index < 0 || d.index >= d.questions.length) return null;
  if (d.answered.has(name)) return null;
  if (d.mode === 'eliminacao' && !d.alive.has(name)) return null;
  const elapsed = now - d.askedAt;
  if (elapsed > DUEL.perQuestionMs) return null;
  d.answered.set(name, Number(choice));
  const q = d.questions[d.index];
  const correct = Number(choice) === q.answer;
  let points = 0;
  if (correct) points = d.mode === 'eliminacao' ? 1 : 100 + Math.round(50 * (1 - elapsed / DUEL.perQuestionMs));
  d.scores[name] = (d.scores[name] ?? 0) + points;
  logAnswer(room, name, q, correct, now);
  return { correct, points };
}

// 50/50: devolve dois índices errados para esconder.
export function useFifty(room, name) {
  const d = room.duel;
  if (!d || d.mode !== 'eliminacao' || !d.alive.has(name) || !d.lifelines[name]?.fifty) return null;
  const q = d.questions[d.index];
  if (!q || q.options.length < 3) return null;
  d.lifelines[name].fifty = false;
  const wrong = q.options.map((_, i) => i).filter(i => i !== q.answer);
  shuffle(wrong);
  return { hide: wrong.slice(0, q.options.length - 2) };
}

// Perguntar à sala: mostra o que os outros já responderam (ou o "palpite" de quem já saiu).
export function useAsk(room, name) {
  const d = room.duel;
  if (!d || d.mode !== 'eliminacao' || !d.alive.has(name) || !d.lifelines[name]?.ask) return null;
  const q = d.questions[d.index];
  if (!q) return null;
  d.lifelines[name].ask = false;
  const votes = q.options.map(() => 0);
  for (const [who, c] of d.answered) if (who !== name && votes[c] != null) votes[c]++;
  return { votes, total: votes.reduce((a, b) => a + b, 0) };
}

export function revealAnswer(room) {
  const d = room.duel;
  if (!d) return null;
  const q = d.questions[d.index];
  const eliminated = [];
  if (d.mode === 'eliminacao') {
    for (const name of [...d.alive]) {
      if (d.answered.get(name) !== q.answer) {
        d.alive.delete(name);
        d.out.push(name);
        eliminated.push(name);
      }
    }
  }
  return { index: d.index, qid: q.id, answer: q.answer, scores: ranking(d.scores), eliminated, alive: [...d.alive] };
}

// Na eliminação, o duelo acaba quando sobra 1 (com 2+ jogadores) ou ninguém.
export function duelShouldEnd(room) {
  const d = room.duel;
  if (!d) return true;
  if (d.index + 1 >= d.questions.length) return true;
  if (d.mode === 'eliminacao') {
    const players = Object.keys(d.lifelines).length;
    return d.alive.size === 0 || (players > 1 && d.alive.size <= 1);
  }
  return false;
}

export function endDuel(room) {
  const d = room.duel;
  if (!d) return null;
  let final = ranking(d.scores);
  if (d.mode === 'eliminacao') {
    // vencedores: quem ainda está vivo; depois por ordem inversa de eliminação
    const order = [...d.alive, ...[...d.out].reverse()];
    final = order.map(name => ({ name, points: d.scores[name] ?? 0, survived: d.alive.has(name) }));
  }
  const winners = d.mode === 'eliminacao'
    ? final.filter(r => r.survived)
    : final.filter(r => final[0].points > 0 && r.points === final[0].points);
  for (const r of winners) {
    const s = room.stats[r.name] ??= { minutes: 0, sessions: 0, duelWins: 0 };
    s.duelWins += 1;
  }
  room.duel = null;
  return { mode: d.mode, ranking: final, winners: winners.map(w => w.name) };
}

function logAnswer(room, name, q, ok, now) {
  const log = room.answerLog[name] ??= [];
  log.push({ q: q.id, topic: q.topic || '', ok, ts: now });
  if (log.length > LIMITS.answerLog) log.splice(0, log.length - LIMITS.answerLog);
}

function ranking(scores) {
  return Object.entries(scores).map(([name, points]) => ({ name, points })).sort((a, b) => b.points - a.points);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

// ---------- dados para a previsão de nota ----------

export function performance(room, name) {
  const log = room.answerLog[name] ?? [];
  const byTopic = {};
  for (const a of log) {
    const t = a.topic || 'Geral';
    byTopic[t] ??= { right: 0, total: 0 };
    byTopic[t].total++;
    if (a.ok) byTopic[t].right++;
  }
  const right = log.filter(a => a.ok).length;
  const wrongIds = [...new Set(log.filter(a => !a.ok).map(a => a.q))].slice(-15);
  const wrong = wrongIds.map(id => room.questions.find(q => q.id === id)).filter(Boolean)
    .map(q => ({ question: q.question, correct: q.options[q.answer], topic: q.topic }));
  return {
    answered: log.length,
    accuracy: log.length ? Math.round((right / log.length) * 100) : null,
    byTopic,
    wrong,
    minutes: room.stats[name]?.minutes ?? 0,
    sessions: room.stats[name]?.sessions ?? 0,
  };
}

// ---------- quota de IA ----------

export function aiQuota(room, limit, now = Date.now()) {
  const wk = weekKey(now);
  if (room.aiUsage.week !== wk) room.aiUsage = { week: wk, count: 0 };
  const max = room.premium ? Infinity : limit;
  return { used: room.aiUsage.count, limit: room.premium ? null : limit, left: Math.max(0, max - room.aiUsage.count) };
}

export function useAI(room, limit, now = Date.now()) {
  const q = aiQuota(room, limit, now);
  if (q.left <= 0) return false;
  room.aiUsage.count++;
  return true;
}

// ---------- o que se envia aos clientes ----------

export function publicRoom(room, store, now = Date.now()) {
  return {
    code: room.code,
    name: room.name,
    owner: room.owner,
    messages: room.messages.slice(-50),
    notes: room.notes,
    questions: room.questions.map(publicQuestion), // sem respostas!
    tests: upcomingTests(room, now),
    stats: room.stats,
    timer: room.timer,
    members: membersList(room),
    duelActive: !!room.duel,
    ambience: room.ambience,
    summary: room.summary,
    streak: streakInfo(room, now),
    league: leagueInfo(store, room, now),
  };
}

export function leagueInfo(store, room, now = Date.now()) {
  return {
    tier: room.league.tier,
    name: LEAGUES[room.league.tier],
    last: room.league.last ?? null,
    table: store ? leagueTable(store, room, now) : [],
  };
}

export function membersList(room) {
  return [...room.members.values()].map(m => ({
    ...m,
    distracted: room.timer.state === 'focus' && room.distracted.has(m.name),
  }));
}
