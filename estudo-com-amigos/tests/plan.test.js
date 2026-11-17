import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, suggestedSubjects, planTips } from '../public/plan.js';
import { missingKeys, setLang, t } from '../public/i18n.js';

const MON = new Date(2026, 10, 16, 10); // segunda-feira, 16 nov 2026

test('plano: só nos dias escolhidos, com blocos de 25 min', () => {
  const p = buildPlan({ subjects: ['mat', 'port'], hard: [], goal: 'keep', minutes: 60, days: [0, 2, 4], when: 'evening' }, MON);
  assert.equal(p.weekOf, '2026-11-16');
  assert.deepEqual(p.week.map(d => d.blocks.length), [2, 0, 2, 0, 2, 0, 0]);
  assert.ok(p.week[0].blocks.every(b => b.minutes === 25));
});

test('plano: pouco tempo dá um só bloco curto', () => {
  const p = buildPlan({ subjects: ['mat'], minutes: 15, days: [1] }, MON);
  assert.deepEqual(p.week[1].blocks.map(b => b.minutes), [15]);
});

test('plano: disciplinas difíceis aparecem mais vezes', () => {
  const p = buildPlan({ subjects: ['mat', 'port', 'ing', 'hist'], hard: ['mat'], minutes: 90, days: [0, 1, 2, 3, 4, 5, 6] }, MON);
  const count = s => p.week.flatMap(d => d.blocks).filter(b => b.subject === s).length;
  assert.ok(count('mat') > count('port') * 2, `mat=${count('mat')} port=${count('port')}`);
});

test('plano: nos 3 dias antes do teste, o primeiro bloco é para o teste', () => {
  const p = buildPlan({ subjects: ['mat', 'hist'], minutes: 60, days: [0, 1, 2, 3, 4], test: { subject: 'hist', date: '2026-11-20' } }, MON);
  // teste na sexta (dia 4): terça, quarta e quinta começam com o teste
  const first = p.week.slice(0, 5).map(d => d.blocks[0]);
  assert.deepEqual(first.map(b => b.kind === 'test'), [false, true, true, true, false]);
  assert.ok(first.slice(1, 4).every(b => b.subject === 'hist'));
});

test('plano: sugestões por ano e dicas', () => {
  assert.ok(suggestedSubjects('8').includes('fq'));
  assert.ok(suggestedSubjects('11').includes('fil'));
  assert.deepEqual(planTips({ when: 'morning', hard: ['mat'], goal: 'exams' }), ['tip.morning', 'tip.hard', 'tip.exams']);
});

test('traduções: as 4 línguas têm todas as chaves e substituem parâmetros', () => {
  for (const [lang, keys] of Object.entries(missingKeys())) assert.deepEqual(keys, [], `faltam em ${lang}`);
  setLang('en');
  assert.equal(t('sys.joined', { name: 'Ana' }), 'Ana joined the room.');
  setLang('fr');
  assert.equal(t('err.room_full'), 'Le salon est plein.');
  setLang('xx');
  assert.equal(t('err.room_full'), 'A sala está cheia.', 'língua desconhecida volta ao português');
});
