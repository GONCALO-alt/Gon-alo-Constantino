import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { io as connect } from 'socket.io-client';

process.env.AI_MOCK = '1';
const { startServer } = await import('../server.js');

async function withServer(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'prem-'));
  const srv = await startServer({ port: 0, dataFile: join(dir, 'rooms.json'), log: false, duelPauseMs: 10 });
  const sockets = [];
  const open = () => { const s = connect(`http://localhost:${srv.port}`); sockets.push(s); return s; };
  const emit = (s, ev, data) => new Promise(r => s.emit(ev, data, r));
  try { await fn({ open, emit, srv }); } finally { sockets.forEach(s => s.close()); await srv.close(); }
}

test('premium: teste grátis uma vez, o passe vale noutra ligação e tira o limite do tutor', async () => {
  process.env.AI_TUTOR_DAILY = '1';
  await withServer(async ({ open, emit }) => {
    const a = open();
    const ask = s => emit(s, 'tutorAsk', { messages: [{ role: 'user', content: 'olá' }] });
    assert.ok((await ask(a)).ok);
    assert.equal((await ask(a)).error, 'tutor_limit');
    const trial = await emit(a, 'claimTrial');
    assert.equal(trial.premium.kind, 'trial');
    assert.ok(trial.premium.exp > Date.now() + 6.9 * 86_400_000);
    assert.equal((await emit(a, 'claimTrial')).error, 'trial_used', 'só uma vez');
    const after = await ask(a);
    assert.ok(after.ok);
    assert.equal(after.left, null, 'Premium: sem limite');
    // nova ligação com o passe guardado
    const b = open();
    assert.equal((await ask(b)).error, 'tutor_limit');
    assert.equal((await emit(b, 'auth', { pass: trial.pass })).premium.kind, 'trial');
    assert.ok((await ask(b)).ok);
    // passe falsificado não vale
    const c = open();
    const fake = trial.pass.slice(0, -3) + 'abc';
    assert.equal((await emit(c, 'auth', { pass: fake })).premium, null);
  });
  delete process.env.AI_TUTOR_DAILY;
});

test('premium: amostras grátis do exame e da correção', async () => {
  await withServer(async ({ open, emit }) => {
    const a = open();
    const exam = await emit(a, 'aiExam', { subject: 'Matemática', count: 5 });
    assert.equal(exam.exam.questions.length, 5);
    assert.ok(exam.exam.questions.every(q => q.explanation));
    assert.equal((await emit(a, 'aiExam', { subject: 'Matemática' })).error, 'exam_limit');
    const corr = { question: 'O que é a fotossíntese?', answer: 'É quando as plantas fazem comida com luz.' };
    assert.equal((await emit(a, 'aiCorrect', { answer: 'curto' })).error, 'correct_need_answer');
    assert.equal((await emit(a, 'aiCorrect', corr)).result.score, 72);
    assert.ok((await emit(a, 'aiCorrect', corr)).ok);
    assert.equal((await emit(a, 'aiCorrect', corr)).error, 'correct_limit');
    await emit(a, 'claimTrial');
    assert.ok((await emit(a, 'aiExam', { subject: 'Matemática' })).ok, 'com Premium não há limite');
  });
});

test('premium da turma: com 5 pessoas Premium a sala fica sem limite de IA', async () => {
  await withServer(async ({ open, emit, srv }) => {
    const owner = open();
    const created = await emit(owner, 'createRoom', { name: 'T', profile: { name: 'P0' } });
    const code = created.room.code;
    let last = null;
    owner.on('teamPremium', x => { last = x; });
    // cada pessoa tem o seu passe (o servidor dá-lhe um teste)
    const { signPass } = await import('../premium.js');
    const room = srv.store.get(code);
    for (let i = 1; i <= 5; i++) {
      const s = open();
      await emit(s, 'joinRoom', { code, profile: { name: `P${i}` } });
      const trial = await emit(s, 'claimTrial');
      if (trial.error) {
        // no teste todos vêm do mesmo IP: o teste grátis só sai uma vez, por isso usamos um passe da recompensa
        assert.equal(trial.error, 'trial_used');
        room.days = Object.fromEntries(Array.from({ length: 31 }, (_, d) => [new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10), { minutes: 999, people: [] }]));
        const r = await emit(s, 'claimStreak');
        assert.ok(r.pass, JSON.stringify(r));
      }
    }
    await new Promise(r => setTimeout(r, 50));
    assert.deepEqual(last, { count: 5, need: 5, active: true });
    assert.equal(room.teamPremium, true);
    assert.equal((await emit(owner, 'aiSummary', {})).error, 'no_notes');
    assert.equal(typeof signPass, 'function');
  });
});
