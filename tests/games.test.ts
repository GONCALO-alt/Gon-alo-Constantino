/**
 * Mini-jogos (engine/games.ts).
 */
import { describe, expect, it } from 'vitest';
import { articleWords, choiceRound, gameWords, memoryDeck, raceScore, type VocabSource } from '../src/engine/games.ts';
import { seededRandom } from '../src/engine/session.ts';
import { realFiles } from './helpers.ts';

const all: VocabSource[] = realFiles()
  .sort((a, b) => a.unitId.localeCompare(b.unitId, 'en', { numeric: true }))
  .flatMap((f) => [...f.lessons].sort((a, b) => a.order - b.order))
  .flatMap((l) => l.newVocabulary.map((v) => ({ ...v, lessonId: l.id })));

describe('palavras dos jogos', () => {
  it('só as das lições concluídas (completando com as primeiras do curso)', () => {
    const none = gameWords(all, new Set());
    expect(none.length).toBe(12);
    expect(none[0]!.nl).toBe('hallo');
    const done = new Set(['s1-u01-l001', 's1-u01-l002', 's1-u02-l001']);
    const learned = gameWords(all, done);
    const fromDone = new Set(all.filter((v) => done.has(v.lessonId)).map((v) => v.id));
    expect(learned.slice(0, 5).every((w) => fromDone.has(w.id))).toBe(true);
  });

  it('nenhuma palavra com variantes «a|b» nem notas entre parênteses', () => {
    const everything = gameWords(all, new Set(all.map((v) => v.lessonId)), 0);
    expect(everything.length).toBeGreaterThan(3000);
    for (const w of everything) {
      expect(w.nl, w.id).not.toMatch(/[|()]/);
      expect(w.pt, w.id).not.toMatch(/[()]/);
    }
  });
});

describe('rondas', () => {
  const words = gameWords(all, new Set(all.slice(0, 400).map((v) => v.lessonId)), 0);

  it('escolha: 4 opções, uma certa, sem significados repetidos', () => {
    const rnd = seededRandom(7);
    for (let i = 0; i < 300; i++) {
      const r = choiceRound(words, rnd)!;
      expect(r.options).toHaveLength(4);
      expect(r.options.filter((o) => o.id === r.word.id)).toHaveLength(1);
      for (const o of r.options) {
        if (o.id !== r.word.id) expect(o.ptKeys.some((k) => r.word.ptKeys.includes(k)), `${r.word.nl} / ${o.nl}`).toBe(false);
      }
    }
  });

  it('memória: 6 pares, cada palavra em neerlandês e em português', () => {
    const deck = memoryDeck(words, seededRandom(3));
    expect(deck).toHaveLength(12);
    const byWord = new Map<string, string[]>();
    for (const c of deck) byWord.set(c.wordId, [...(byWord.get(c.wordId) ?? []), c.side]);
    for (const sides of byWord.values()) expect(sides.sort()).toEqual(['nl', 'pt']);
  });

  it('de of het: só substantivos com artigo', () => {
    const nouns = articleWords(words);
    expect(nouns.length).toBeGreaterThan(20);
    for (const n of nouns) expect(['de', 'het']).toContain(n.article);
  });

  it('corrida: respostas seguidas valem mais, até um limite', () => {
    expect(raceScore(0)).toBe(10);
    expect(raceScore(3)).toBe(16);
    expect(raceScore(50)).toBe(raceScore(5));
  });
});
