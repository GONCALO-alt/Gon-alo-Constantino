import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { io as connect } from 'socket.io-client';
import * as R from '../rooms.js';
import { startServer } from '../server.js';

test('filtro de linguagem tapa asneiras', () => {
  assert.equal(R.cleanText('isto é uma merda'), 'isto é uma *****');
  assert.equal(R.cleanText('olá amigos'), 'olá amigos');
});

test('foco: quem se distrai não ganha minutos', () => {
  const store = new R.RoomStore();
  const room = store.create('Ciências', 'Ana');
  R.addMember(room, 'a', { name: 'Ana' });
  R.addMember(room, 'b', { name: 'Rui' });
  assert.ok(R.addMember(room, 'c', { name: 'ana' }).error, 'nome repetido recusado');
  R.startFocus(room, 0, 25);
  R.setStatus(room, 'b', 'away');
  R.setStatus(room, 'b', 'focused'); // voltar não apaga a distração
  const res = R.finishFocus(room);
  assert.deepEqual(res.rewarded, ['Ana']);
  assert.equal(room.stats.Ana.minutes, 25);
  assert.equal(room.stats.Rui.minutes, 0);
});

test('duelo: pontos por acerto e rapidez, vencedor ganha vitória', () => {
  const store = new R.RoomStore();
  const room = store.create('Mat', 'Ana');
  for (let i = 0; i < 3; i++) R.addQuestion(room, 'Ana', { question: `${i}+1?`, options: [`${i + 1}`, 'x'], answer: 0 });
  assert.ok(R.addQuestion(room, 'Ana', { question: 'só uma', options: ['a'], answer: 0 }).error);
  assert.ok(!R.startDuel(room).error);
  const q = R.nextQuestion(room, 1000);
  assert.equal(q.total, 3);
  assert.equal(q.answer, undefined, 'a resposta certa não é enviada');
  assert.equal(R.answerDuel(room, 'Ana', 0, 1000).correct, true);
  assert.equal(R.answerDuel(room, 'Ana', 0, 1000), null, 'só responde uma vez');
  assert.equal(R.answerDuel(room, 'Rui', 1, 2000).correct, false);
  const final = R.endDuel(room);
  assert.equal(final[0].name, 'Ana');
  assert.equal(final[0].points, 150);
  assert.equal(room.stats.Ana.duelWins, 1);
});

test('salas ficam guardadas depois de reiniciar', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'eca-')), 'rooms.json');
  const a = new R.RoomStore(file);
  const room = a.create('Hist', 'Ana');
  R.addNote(room, 'Ana', 'Romanos', 'Júlio César…');
  a.saveNow();
  const b = new R.RoomStore(file);
  assert.equal(b.get(room.code.toLowerCase()).notes[0].title, 'Romanos');
});

test('dois amigos na mesma sala em tempo real', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'eca-'));
  const srv = await startServer({ port: 0, dataFile: join(dir, 'rooms.json'), log: false });
  const url = `http://localhost:${srv.port}`;
  const ana = connect(url), rui = connect(url);
  const emit = (s, ev, data) => new Promise(r => s.emit(ev, data, r));
  try {
    const created = await emit(ana, 'createRoom', { name: 'Teste', profile: { name: 'Ana' } });
    assert.match(created.room.code, /^[A-Z0-9]{6}$/);
    const joined = await emit(rui, 'joinRoom', { code: created.room.code.toLowerCase(), profile: { name: 'Rui' } });
    assert.equal(joined.room.name, 'Teste');
    assert.ok((await emit(rui, 'joinRoom', { code: 'NOPE00', profile: { name: 'X' } })).error);

    const got = new Promise(r => rui.on('chat', r));
    ana.emit('chat', 'olá Rui');
    assert.equal((await got).text, 'olá Rui');

    const timer = new Promise(r => rui.on('timer', r));
    ana.emit('timerStart', 25);
    assert.equal((await timer).state, 'focus');
  } finally {
    ana.close(); rui.close();
    await srv.close();
  }
});
