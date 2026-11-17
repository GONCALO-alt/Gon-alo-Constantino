// Lógica das salas de estudo (sem rede) — fácil de testar.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

export const LIMITS = {
  maxMembers: 30,        // salas grandes (turma inteira)
  maxMessages: 200,      // mensagens guardadas por sala
  maxNotes: 300,
  maxQuestions: 200,
  maxText: 500,          // caracteres por mensagem
  maxNoteText: 4000,
  nameMax: 20,
};

// Filtro simples de linguagem (pode ser alargado).
const BAD_WORDS = [
  'merda', 'caralho', 'foda', 'fodase', 'puta', 'cabrao', 'cabrão', 'porra',
  'idiota', 'estupido', 'estúpido', 'otario', 'otário', 'fdp', 'pqp', 'crl',
];
const BAD_RE = new RegExp(`\\b(${BAD_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'giu');

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
const newId = () => `${Date.now().toString(36)}${(idCounter++).toString(36)}`;

export class RoomStore {
  constructor(file = null) {
    this.file = file;
    this.rooms = new Map();
    this._saveTimer = null;
    if (file && existsSync(file)) {
      try {
        const data = JSON.parse(readFileSync(file, 'utf8'));
        for (const r of data.rooms ?? []) this.rooms.set(r.code, hydrate(r));
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
    writeFileSync(this.file, JSON.stringify({ rooms }, null, 1));
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
    stats: r.stats ?? {},                 // nome -> { minutes, sessions, duelWins }
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

// ---------- ações sobre uma sala ----------

export function addMember(room, socketId, profile) {
  const name = cleanName(profile?.name);
  if (!name) return { error: 'Escolhe um nome.' };
  if (room.members.size >= LIMITS.maxMembers) return { error: 'A sala está cheia.' };
  const taken = [...room.members.values()].some(m => m.name.toLowerCase() === name.toLowerCase());
  if (taken) return { error: 'Já há alguém com esse nome nesta sala.' };
  const member = {
    name,
    avatar: String(profile?.avatar ?? '🙂').slice(0, 8),
    frame: String(profile?.frame ?? 'none').slice(0, 20),
    status: 'focused',
  };
  room.members.set(socketId, member);
  room.stats[name] ??= { minutes: 0, sessions: 0, duelWins: 0 };
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

export function addQuestion(room, author, q) {
  const question = cleanText(q?.question, 200);
  const options = (Array.isArray(q?.options) ? q.options : []).map(o => cleanText(o, 80)).filter(Boolean);
  const answer = Number(q?.answer);
  if (!question || options.length < 2 || options.length > 4) return { error: 'Escreve a pergunta e 2 a 4 respostas.' };
  if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) return { error: 'Escolhe a resposta certa.' };
  if (room.questions.length >= LIMITS.maxQuestions) return { error: 'Esta sala já tem perguntas demais.' };
  const item = { id: newId(), author, question, options, answer, ts: Date.now() };
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

// ---------- temporizador de foco ----------

export function startFocus(room, now = Date.now(), minutes) {
  const m = clampMin(minutes ?? room.timer.focusMin, 5, 90);
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
export function finishFocus(room) {
  const minutes = room.timer.focusMin;
  const rewarded = [];
  for (const mem of room.members.values()) {
    if (room.distracted.has(mem.name)) continue;
    const s = room.stats[mem.name] ??= { minutes: 0, sessions: 0, duelWins: 0 };
    s.minutes += minutes;
    s.sessions += 1;
    rewarded.push(mem.name);
  }
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

// ---------- duelo de quiz ----------

export const DUEL = { perQuestionMs: 15_000, maxQuestions: 10 };

export function startDuel(room, count = DUEL.maxQuestions) {
  if (room.duel) return { error: 'Já há um duelo a decorrer.' };
  if (room.questions.length < 3) return { error: 'São precisas pelo menos 3 perguntas para um duelo.' };
  const pool = [...room.questions];
  shuffle(pool);
  room.duel = {
    questions: pool.slice(0, Math.min(count, DUEL.maxQuestions)),
    index: -1,
    scores: {},          // nome -> pontos
    answered: new Map(), // nome -> índice escolhido (pergunta atual)
    askedAt: 0,
  };
  return { duel: room.duel };
}

export function nextQuestion(room, now = Date.now()) {
  const d = room.duel;
  if (!d) return null;
  d.index += 1;
  d.answered = new Map();
  d.askedAt = now;
  if (d.index >= d.questions.length) return null;
  const q = d.questions[d.index];
  return { index: d.index, total: d.questions.length, question: q.question, options: q.options, endsAt: now + DUEL.perQuestionMs };
}

// Pontos: 100 por resposta certa + até 50 por rapidez.
export function answerDuel(room, name, choice, now = Date.now()) {
  const d = room.duel;
  if (!d || d.index < 0 || d.index >= d.questions.length) return null;
  if (d.answered.has(name)) return null;
  const elapsed = now - d.askedAt;
  if (elapsed > DUEL.perQuestionMs) return null;
  d.answered.set(name, choice);
  const q = d.questions[d.index];
  const correct = Number(choice) === q.answer;
  const points = correct ? 100 + Math.round(50 * (1 - elapsed / DUEL.perQuestionMs)) : 0;
  d.scores[name] = (d.scores[name] ?? 0) + points;
  return { correct, points };
}

export function revealAnswer(room) {
  const d = room.duel;
  if (!d) return null;
  const q = d.questions[d.index];
  return { index: d.index, answer: q.answer, scores: ranking(d.scores) };
}

export function endDuel(room) {
  const d = room.duel;
  if (!d) return null;
  const final = ranking(d.scores);
  if (final.length && final[0].points > 0) {
    const top = final[0].points;
    for (const r of final) if (r.points === top) {
      const s = room.stats[r.name] ??= { minutes: 0, sessions: 0, duelWins: 0 };
      s.duelWins += 1;
    }
  }
  room.duel = null;
  return final;
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

// ---------- o que se envia aos clientes ----------

export function publicRoom(room) {
  return {
    code: room.code,
    name: room.name,
    owner: room.owner,
    messages: room.messages.slice(-50),
    notes: room.notes,
    questions: room.questions.map(({ id, author, question }) => ({ id, author, question })), // sem respostas!
    stats: room.stats,
    timer: room.timer,
    members: membersList(room),
    duelActive: !!room.duel,
  };
}

export function membersList(room) {
  return [...room.members.values()].map(m => ({
    ...m,
    distracted: room.timer.state === 'focus' && room.distracted.has(m.name),
  }));
}
