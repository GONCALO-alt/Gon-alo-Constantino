/**
 * Ensinar primeiro (engine/teach.ts) e expressões no dicionário (engine/glossary.ts).
 */
import { describe, expect, it } from 'vitest';
import type { Exercise } from '../src/domain/schemas.ts';
import { buildGlossary } from '../src/engine/glossary.ts';
import { approxPronunciation, exerciseHelp, makeWordTest, wordsToIntroduce } from '../src/engine/teach.ts';
import { buildReviewExercise, cleanPt, knownPool, seededRandom } from '../src/engine/session.ts';
import { realFiles } from './helpers.ts';

const vocab = realFiles().flatMap((f) => f.lessons).flatMap((l) => l.newVocabulary);
const g = buildGlossary(vocab);
const isDutch = (t: string) => {
  const ws = t.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  return ws.length > 0 && ws.filter((w) => g.lookup(w).length || g.expressions(w).length).length / ws.length >= 0.5;
};

describe('pronúncia aproximada', () => {
  it('palavras frequentes', () => {
    expect(approxPronunciation('goed')).toBe('rrut');
    expect(approxPronunciation('dank je wel')).toBe('dank ie vel');
    expect(approxPronunciation('huis')).toBe('hãuis');
    expect(approxPronunciation('uur')).toBe('ür');
    expect(approxPronunciation('goedemorgen')).toBe('rrudemorre');
  });
});

describe('formas irregulares', () => {
  it('gaat → gaan, heeft → hebben, ben → zijn', () => {
    expect(g.lookup('gaat')[0]?.headword).toBe('gaan');
    expect(g.lookup('heeft')[0]?.headword).toBe('hebben');
    expect(g.lookup('kan')[0]?.headword).toBe('kunnen');
  });
});

describe('expressões no dicionário', () => {
  it('encontra expressões de várias palavras dentro de uma frase', () => {
    const e = g.expressions('Hoi! Hoe gaat het met je?').map((x) => x.headword.toLowerCase());
    expect(e.some((h) => h.startsWith('hoe gaat het'))).toBe(true);
  });
});

const base = { id: 's1-u01-l001-e01', instruction: 'x', explanation: 'y', vocabRefs: [] };

describe('o que mostrar em cada exercício', () => {
  it('tradução para português: as palavras sim, a frase traduzida tapada', () => {
    const h = exerciseHelp({ ...base, type: 'translate', direction: 'nl-pt', prompt: 'Ik woon in Utrecht.', answers: ['Eu moro em Utrecht.'] }, isDutch);
    expect(h.words).toContain('woon');
    expect(h.spoilerWords.size).toBe(0);
    expect(h.sentences[0]).toMatchObject({ hide: 'pt' });
  });
  it('associação e «O que significa»: o significado é a resposta, fica tapado', () => {
    const m = exerciseHelp({ ...base, type: 'match', pairs: [{ nl: 'huis', pt: 'casa' }, { nl: 'kat', pt: 'gato' }, { nl: 'boom', pt: 'árvore' }] }, isDutch);
    expect([...m.spoilerWords]).toEqual(['huis', 'kat', 'boom']);
    const mc = exerciseHelp({ ...base, type: 'multipleChoice', prompt: 'O que significa «de koffie»?', options: [{ id: 'a', text: 'café', correct: true }, { id: 'b', text: 'chá', correct: false }] }, isDutch);
    expect(mc.spoilerWords.has('koffie')).toBe(true);
  });
  it('ouvir e escrever: o texto fica tapado (a tradução não)', () => {
    const h = exerciseHelp({ ...base, type: 'listening', audioText: 'Ik ben moe.', answers: ['Ik ben moe.'], translation: 'Estou cansado.' }, isDutch);
    expect(h.sentences[0]).toMatchObject({ hide: 'nl', pt: 'Estou cansado.' });
  });
  it('todos os exercícios do curso têm alguma coisa para explicar', () => {
    const exs: Exercise[] = realFiles().flatMap((f) => f.lessons).flatMap((l) => l.exercises);
    const empty = exs.filter((e) => { const h = exerciseHelp(e, isDutch); return h.words.length === 0 && h.sentences.length === 0 && h.vocabIds.length === 0; });
    // Só podem faltar perguntas inteiramente em português (ex.: escolha múltipla sobre cultura).
    expect(empty.length / exs.length).toBeLessThan(0.002);
  });
});

describe('palavras novas a roxo', () => {
  it('formas flexionadas de uma palavra nova também são «novas» (para ficarem a roxo)', () => {
    const isNew = makeWordTest([{ id: 'v-wonen', nl: 'wonen', pt: ['morar'] }, { id: 'v-kat', nl: 'kat', pt: ['gato'], plural: 'katten' }]);
    expect(isNew('woont')).toBe(true);
    expect(isNew('Katten')).toBe(true);
    expect(isNew('huis')).toBe(false);
    const heten = makeWordTest([{ id: 'v-heten', nl: 'heten', pt: ['chamar-se'] }]);
    expect(heten('heet')).toBe(true);
    expect(heten('het')).toBe(false);
  });
});

describe('primeira vez que uma palavra aparece', () => {
  const base2 = { instruction: 'x', explanation: 'y' };
  const dag = { id: 'v-dag', nl: 'dag', pt: ['olá', 'adeus'] };
  const huis = { id: 'v-huis', nl: 'huis', pt: ['casa'], article: 'het' as const };
  it('o primeiro exercício que usa a palavra mostra-a; os seguintes já não', () => {
    const ex1: Exercise = { ...base2, id: 'a', vocabRefs: ['v-dag'], type: 'multipleChoice', prompt: 'O que significa «dag»?', options: [{ id: 'a', text: 'olá', correct: true }, { id: 'b', text: 'casa', correct: false }] };
    const ex2: Exercise = { ...base2, id: 'b', vocabRefs: [], type: 'translate', direction: 'nl-pt', prompt: 'Dag, mijn huis!', answers: ['x'] };
    const introduced = new Set<string>();
    const first = wordsToIntroduce(ex1, [dag, huis], introduced);
    expect(first.map((w) => w.id)).toEqual(['v-dag']);
    first.forEach((w) => introduced.add(w.id));
    // «huis» aparece pela 1.ª vez no 2.º exercício (pelo texto, mesmo sem vocabRefs); «dag» já não.
    expect(wordsToIntroduce(ex2, [dag, huis], introduced).map((w) => w.id)).toEqual(['v-huis']);
  });
});

describe('opções erradas só com palavras conhecidas', () => {
  const all = realFiles().sort((a, b) => a.unitId.localeCompare(b.unitId, 'en', { numeric: true }))
    .flatMap((f) => [...f.lessons].sort((a, b) => a.order - b.order)).flatMap((l) => l.newVocabulary.map((v) => ({ ...v, lessonId: l.id })));
  it('com poucas palavras conhecidas, completa com as primeiras do curso (nunca de secções avançadas)', () => {
    const pool = knownPool(all, new Set(['v-dag']));
    expect(pool.length).toBe(12);
    const firstIds = new Set(all.slice(0, 40).map((v) => v.id));
    expect(pool.every((v) => firstIds.has(v.id) || v.id === 'v-dag')).toBe(true);
  });
  it('as opções não levam notas («vá lá / bom… (Flandres)» → «vá lá»)', () => {
    expect(cleanPt('vá lá / bom... (Flandres)')).toBe('vá lá');
    const pool = knownPool(all, new Set(all.slice(0, 30).map((v) => v.id)));
    const rnd = seededRandom(1);
    for (let i = 0; i < 50; i++) {
      const ex = buildReviewExercise(pool[i % pool.length]!, pool, rnd, 0);
      if (ex.type === 'multipleChoice') for (const o of ex.options) expect(o.text).not.toMatch(/[()]/);
    }
  });
});
