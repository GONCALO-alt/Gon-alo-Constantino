import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { io as connect } from 'socket.io-client';
import * as R from '../rooms.js';

process.env.AI_MOCK = '1';
const { startServer } = await import('../server.js');

const DAY = 86_400_000;
const T0 = Date.parse('2026-11-17T10:00:00Z'); // uma terça-feira

function roomWith(...names) {
  const store = new R.RoomStore();
  const room = store.create('Sala', names[0]);
  names.forEach((n, i) => R.addMember(room, `s${i}`, { name: n }, T0));
  return { store, room };
}

test('filtro de linguagem tapa asneiras', () => {
  assert.equal(R.cleanText('isto é uma merda'), 'isto é uma *****');
  assert.equal(R.cleanText('olá amigos'), 'olá amigos');
});

test('foco: quem se distrai não ganha minutos', () => {
  const { room } = roomWith('Ana', 'Rui');
  assert.ok(R.addMember(room, 'c', { name: 'ana' }).error, 'nome repetido recusado');
  R.startFocus(room, T0, 25);
  R.setStatus(room, 's1', 'away');
  R.setStatus(room, 's1', 'focused'); // voltar não apaga a distração
  const res = R.finishFocus(room, T0);
  assert.deepEqual(res.rewarded, ['Ana']);
  assert.equal(room.stats.Ana.minutes, 25);
  assert.equal(room.stats.Rui.minutes, 0);
});

test('chama da sala: 15 min por pessoa, quem estuda a dobrar salva o amigo', () => {
  const { room } = roomWith('Ana', 'Rui');
  // dia 1: só a Ana estuda 30 min (meta = 2 × 15) -> acesa
  room.members.delete('s1');
  R.startFocus(room, T0, 30);
  R.finishFocus(room, T0);
  assert.equal(R.streakInfo(room, T0).streak, 1);
  // dia 2: os dois entram, só 15 min no total -> ainda não acesa, mas a sequência de ontem conta
  const d2 = T0 + DAY;
  R.addMember(room, 'x', { name: 'Rui' }, d2);
  room.members.delete('s0'); room.members.delete('x');
  R.addMember(room, 'y', { name: 'Ana2' }, d2);
  R.startFocus(room, d2, 15);
  R.finishFocus(room, d2);
  const s = R.streakInfo(room, d2);
  assert.equal(s.today.lit, false);
  assert.equal(s.streak, 1);
  // dia 4 sem estudar no dia 3 -> sequência a zero
  assert.equal(R.streakInfo(room, T0 + 3 * DAY).streak, 0);
});

test('ligas: melhores sobem, quem não estuda desce', () => {
  const store = new R.RoomStore();
  R.rolloverLeagues(store, T0);
  const rooms = Array.from({ length: 5 }, (_, i) => store.create(`S${i}`, 'x'));
  rooms[1].league.tier = 1; // Prata
  rooms.forEach((r, i) => R.addLeagueMinutes(r, i === 0 ? 300 : i === 4 ? 0 : 50, T0));
  assert.equal(R.rolloverLeagues(store, T0 + 7 * DAY), true);
  assert.equal(R.rolloverLeagues(store, T0 + 7 * DAY), false, 'só uma vez por semana');
  assert.equal(rooms[0].league.tier, 1, 'a melhor do Bronze sobe');
  assert.equal(rooms[4].league.tier, 0, 'não desce abaixo de Bronze');
  assert.equal(rooms[1].league.tier, 1, 'sozinha na Prata: não tem com quem competir, fica');
  assert.equal(rooms[0].league.minutes, 0, 'minutos recomeçam');
});

test('calendário de testes', () => {
  const { room } = roomWith('Ana');
  assert.ok(R.addTest(room, 'Ana', { subject: 'Mat', date: '2026-11-10' }, T0).error, 'data passada');
  R.addTest(room, 'Ana', { subject: 'Hist', date: '2026-11-25' }, T0);
  R.addTest(room, 'Ana', { subject: 'Mat', date: '2026-11-19' }, T0);
  const up = R.upcomingTests(room, T0);
  assert.deepEqual(up.map(t => [t.subject, t.daysLeft]), [['Mat', 2], ['Hist', 8]]);
});

function withQuestions(room, n, difficulty) {
  for (let i = 0; i < n; i++) {
    R.addQuestion(room, 'Ana', { question: `${i}+1?`, options: [`${i + 1}`, 'x', 'y', 'z'], answer: 0, topic: 'Somas', difficulty: difficulty?.(i) });
  }
}

test('duelo clássico: pontos por acerto e rapidez', () => {
  const { room } = roomWith('Ana', 'Rui');
  withQuestions(room, 3);
  assert.ok(R.addQuestion(room, 'Ana', { question: 'só uma', options: ['a'], answer: 0 }).error);
  assert.ok(!R.startDuel(room, 'classico', ['Ana', 'Rui']).error);
  const q = R.nextQuestion(room, 1000);
  assert.equal(q.answer, undefined, 'a resposta certa não é enviada');
  assert.equal(R.answerDuel(room, 'Ana', 0, 1000).correct, true);
  assert.equal(R.answerDuel(room, 'Ana', 0, 1000), null, 'só responde uma vez');
  assert.equal(R.answerDuel(room, 'Rui', 1, 2000).correct, false);
  const end = R.endDuel(room);
  assert.deepEqual(end.winners, ['Ana']);
  assert.equal(end.ranking[0].points, 150);
  assert.equal(room.stats.Ana.duelWins, 1);
  assert.equal(R.performance(room, 'Rui').accuracy, 0);
});

test('duelo de eliminação: dificuldade a subir, ajudas e eliminados', () => {
  const { room } = roomWith('Ana', 'Rui', 'Eva');
  withQuestions(room, 6, i => 3 - (i % 3));
  R.startDuel(room, 'eliminacao', ['Ana', 'Rui', 'Eva']);
  const diffs = room.duel.questions.map(q => q.difficulty);
  assert.deepEqual(diffs, [...diffs].sort(), 'mais fáceis primeiro');

  R.nextQuestion(room, 0);
  const fifty = R.useFifty(room, 'Ana');
  assert.equal(fifty.hide.length, 2);
  assert.ok(!fifty.hide.includes(0), 'nunca esconde a certa');
  assert.equal(R.useFifty(room, 'Ana'), null, '50/50 só uma vez');
  R.answerDuel(room, 'Rui', 0, 10);
  assert.deepEqual(R.useAsk(room, 'Ana').votes, [1, 0, 0, 0]);
  R.answerDuel(room, 'Ana', 0, 20);
  R.answerDuel(room, 'Eva', 2, 20);
  const rev = R.revealAnswer(room);
  assert.deepEqual(rev.eliminated, ['Eva']);
  assert.equal(R.duelShouldEnd(room), false);

  R.nextQuestion(room, 100);
  R.answerDuel(room, 'Ana', 0, 110);
  R.answerDuel(room, 'Rui', 3, 110);
  R.revealAnswer(room);
  assert.equal(R.duelShouldEnd(room), true, 'só sobra a Ana');
  const end = R.endDuel(room);
  assert.deepEqual(end.winners, ['Ana']);
  assert.deepEqual(end.ranking.map(r => r.name), ['Ana', 'Rui', 'Eva']);
});

test('quota de IA por semana', () => {
  const { room } = roomWith('Ana');
  assert.equal(R.useAI(room, 2, T0), true);
  assert.equal(R.useAI(room, 2, T0), true);
  assert.equal(R.useAI(room, 2, T0), false);
  assert.equal(R.aiQuota(room, 2, T0 + 7 * DAY).left, 2, 'nova semana, nova quota');
  room.premium = true;
  assert.equal(R.aiQuota(room, 2, T0).limit, null);
});

test('salas ficam guardadas depois de reiniciar', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'eca-')), 'rooms.json');
  const a = new R.RoomStore(file);
  const room = a.create('Hist', 'Ana');
  R.addNote(room, 'Ana', 'Romanos', 'Júlio César…');
  R.addTest(room, 'Ana', { subject: 'Hist', date: '2099-01-01' });
  a.saveNow();
  const b = new R.RoomStore(file);
  const back = b.get(room.code.toLowerCase());
  assert.equal(back.notes[0].title, 'Romanos');
  assert.equal(back.tests[0].subject, 'Hist');
});

test('tempo real: chat, foco, testes e IA (modo de teste)', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'eca-'));
  const srv = await startServer({ port: 0, dataFile: join(dir, 'rooms.json'), log: false });
  const url = `http://localhost:${srv.port}`;
  const ana = connect(url), rui = connect(url);
  const emit = (s, ev, data) => new Promise(r => s.emit(ev, data, r));
  const next = (s, ev) => new Promise(r => s.once(ev, r));
  try {
    const created = await emit(ana, 'createRoom', { name: 'Teste', profile: { name: 'Ana' } });
    assert.match(created.room.code, /^[A-Z0-9]{6}$/);
    assert.equal(created.ai.enabled, true);
    const joined = await emit(rui, 'joinRoom', { code: created.room.code.toLowerCase(), profile: { name: 'Rui' } });
    assert.equal(joined.room.name, 'Teste');
    assert.equal(joined.room.streak.today.people, 2);

    const got = next(rui, 'chat');
    ana.emit('chat', 'olá Rui');
    assert.equal((await got).text, 'olá Rui');

    const timer = next(rui, 'timer');
    ana.emit('timerStart', 25);
    assert.equal((await timer).state, 'focus');

    const tests = next(rui, 'tests');
    assert.ok((await emit(ana, 'addTest', { subject: 'Ciências', date: '2099-05-05' })).ok);
    assert.equal((await tests)[0].subject, 'Ciências');

    const amb = next(rui, 'ambience');
    ana.emit('ambience', 'chuva');
    assert.equal((await amb).ambience, 'chuva');

    // IA
    assert.ok((await emit(ana, 'aiQuestions', { text: 'curto' })).error, 'texto curto demais');
    const q = await emit(ana, 'aiQuestions', { text: 'A fotossíntese é o processo em que as plantas produzem o seu alimento usando luz.' });
    assert.equal(q.count, 8);
    const sum = await emit(ana, 'aiSummary');
    assert.ok(sum.error, 'sem apontamentos ainda');
    await emit(ana, 'addNote', { title: 'Plantas', text: 'Clorofila…' });
    const summary = next(rui, 'summary');
    assert.ok((await emit(ana, 'aiSummary')).ok);
    assert.ok((await summary).mustKnow.length);
    const qid = srv.store.get(created.room.code).questions[0].id;
    assert.ok((await emit(rui, 'aiExplain', { qid, chosen: 1 })).explanation);
    assert.ok((await emit(rui, 'aiGrade', {})).error, 'precisa de respostas primeiro');
  } finally {
    ana.close(); rui.close();
    await srv.close();
  }
});

test('tutor: funciona sem sala, responde aos bocados e tem limite diário', async () => {
  process.env.AI_TUTOR_DAILY = '2';
  const dir = mkdtempSync(join(tmpdir(), 'eca-'));
  const srv = await startServer({ port: 0, dataFile: join(dir, 'rooms.json'), log: false });
  const ana = connect(`http://localhost:${srv.port}`);
  const emit = (ev, data) => new Promise(r => ana.emit(ev, data, r));
  try {
    assert.equal((await emit('tutorAsk', { messages: [] })).error, 'tutor_empty');
    let streamed = '';
    ana.on('tutorDelta', d => { if (d.id === 7) streamed += d.delta; });
    const res = await emit('tutorAsk', { id: 7, messages: [{ role: 'user', content: 'O que é uma fração?' }], lang: 'pt' });
    assert.ok(res.ok);
    assert.match(res.text, /fração/);
    assert.equal(streamed, res.text, 'o texto chegou todo aos bocados');
    assert.equal(res.left, 1);
    assert.ok((await emit('tutorAsk', { messages: [{ role: 'user', content: 'e mais?' }] })).ok);
    const limited = await emit('tutorAsk', { messages: [{ role: 'user', content: 'outra' }] });
    assert.equal(limited.error, 'tutor_limit');
    assert.equal(limited.quota, true);
  } finally {
    ana.close();
    await srv.close();
    delete process.env.AI_TUTOR_DAILY;
  }
});
