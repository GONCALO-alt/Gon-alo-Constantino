/**
 * Estado das palavras e palavras difíceis que voltam nas lições.
 */
import { describe, expect, it } from 'vitest';
import type { ReviewSchedule } from '../src/domain/progress.ts';
import { applyReview, newSchedule, pickWordsToReview, SRS_CONFIG, wordStatus } from '../src/engine/srs.ts';

const now = Date.UTC(2026, 10, 7);
const s = (id: string, patch: Partial<ReviewSchedule> = {}): ReviewSchedule => ({ ...newSchedule(id, now - 86_400_000, 2), ...patch });

describe('estado de cada palavra', () => {
  it('a aprender, difícil e já sei', () => {
    expect(wordStatus(s('v-a'))).toBe('learning');
    expect(wordStatus(s('v-b', { lapses: 1 }))).toBe('hard');
    expect(wordStatus(s('v-c', { reviews: 5, incorrect: 3 }))).toBe('hard');
    expect(wordStatus(s('v-d', { box: SRS_CONFIG.masteredBox }))).toBe('mastered');
    expect(wordStatus(s('v-e', { reviews: 1, incorrect: 1 }))).toBe('hard'); // errou e ainda não acertou
    expect(wordStatus(s('v-f', { reviews: 3, incorrect: 1, correct: 2 }))).toBe('learning');
  });
  it('acertar e errar contam', () => {
    const a = applyReview(applyReview(s('v-a'), 'correct', now), 'incorrect', now + 1000);
    expect(a.correct).toBe(1);
    expect(a.incorrect).toBe(1);
  });
});

describe('palavras que voltam numa lição', () => {
  it('primeiro as difíceis (mais erros), depois as prontas para revisão; nunca as palavras novas da lição', () => {
    const list = [
      s('v-due', { dueAt: now - 1000 }),
      s('v-hard1', { lapses: 1, incorrect: 1, dueAt: now + 1e9 }),
      s('v-hard3', { lapses: 2, incorrect: 3, dueAt: now + 1e9 }),
      s('v-new', { lapses: 5, incorrect: 5 }),
      s('v-ok', { box: SRS_CONFIG.masteredBox, dueAt: now - 1000 }),
    ];
    expect(pickWordsToReview(list, now, new Set(['v-new']), 3).map((x) => x.itemId)).toEqual(['v-hard3', 'v-hard1', 'v-due']);
  });
  it('sem palavras difíceis nem prontas: nada', () => {
    expect(pickWordsToReview([s('v-a', { dueAt: now + 1e9 })], now, new Set())).toEqual([]);
  });
});
