/**
 * Lições de prática (tools/authoring/practice_gen.py): uma a seguir a cada lição escrita,
 * sem palavras novas e só com vocabulário já ensinado.
 */
import { describe, expect, it } from 'vitest';
import { realFiles } from './helpers.ts';

const isPractice = (g?: string) => !!g && g.includes('practice_gen.py');

describe('lições de prática', () => {
  const files = realFiles();
  const all = files.flatMap((f) => f.lessons);
  const practice = all.filter((l) => isPractice(l.provenance?.generator));

  it('há uma prática para quase todas as lições escritas', () => {
    expect(practice.length).toBeGreaterThan(1500);
  });

  it('cada prática vem logo a seguir à lição que treina e não ensina palavras novas', () => {
    for (const f of files) {
      const orders = new Map(f.lessons.map((l) => [l.order, l]));
      for (const p of f.lessons.filter((l) => isPractice(l.provenance?.generator))) {
        expect(p.newVocabulary, p.id).toEqual([]);
        expect(p.order % 1, p.id).toBe(0.5);
        const before = orders.get(p.order - 0.5);
        expect(before, p.id).toBeTruthy();
        expect(isPractice(before!.provenance?.generator), p.id).toBe(false);
        expect(p.exercises.length, p.id).toBeGreaterThanOrEqual(6);
      }
    }
  });

  it('todas as palavras treinadas já foram ensinadas antes (na ordem do curso)', () => {
    const seen = new Set<string>();
    const order = files
      .slice()
      .sort((a, b) => a.unitId.localeCompare(b.unitId, 'en', { numeric: true }))
      .flatMap((f) => [...f.lessons].sort((a, b) => a.order - b.order));
    for (const l of order) {
      l.newVocabulary.forEach((v) => seen.add(v.id));
      if (!isPractice(l.provenance?.generator)) continue;
      for (const r of [...l.reviewVocabulary, ...l.exercises.flatMap((e) => e.vocabRefs)]) expect(seen.has(r), `${l.id}: ${r}`).toBe(true);
    }
  });
});
