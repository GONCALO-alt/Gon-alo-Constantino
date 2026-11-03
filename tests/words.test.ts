/**
 * Pesquisa (engine/search.ts) e «Os meus erros» (engine/mistakes.ts).
 */
import { describe, expect, it } from 'vitest';
import type { ExerciseAttempt } from '../src/domain/progress.ts';
import { openMistakes, reviewItemOf } from '../src/engine/mistakes.ts';
import { searchVocab, type SearchItem } from '../src/engine/search.ts';
import { realFiles } from './helpers.ts';

const vocab: SearchItem[] = realFiles()
  .sort((a, b) => a.unitId.localeCompare(b.unitId, 'en', { numeric: true }))
  .flatMap((f) => [...f.lessons].sort((a, b) => a.order - b.order))
  .flatMap((l) => l.newVocabulary.map((v) => ({ ...v, lessonId: l.id })));

describe('pesquisa', () => {
  it('em neerlandês, com ou sem artigo', () => {
    expect(searchVocab(vocab, 'hallo')[0]!.nl).toBe('hallo');
    expect(searchVocab(vocab, 'het huis')[0]!.nl).toBe('huis');
  });
  it('em português (com ou sem acentos)', () => {
    expect(searchVocab(vocab, 'casa').some((w) => w.nl === 'huis')).toBe(true);
    expect(searchVocab(vocab, 'obrigado').length).toBeGreaterThan(0);
    expect(searchVocab(vocab, 'ola')[0]!.pt.join(' ')).toMatch(/olá/);
  });
  it('formas conjugadas levam à palavra do dicionário', () => {
    expect(searchVocab(vocab, 'werkt')[0]!.nl).toBe('werken');
  });
  it('a mesma palavra ensinada em várias lições aparece uma vez', () => {
    const r = searchVocab(vocab, 'hallo');
    expect(r.filter((w) => w.nl === 'hallo' && w.pt[0] === r[0]!.pt[0])).toHaveLength(1);
  });
  it('pesquisas muito curtas não devolvem nada', () => {
    expect(searchVocab(vocab, 'x')).toEqual([]);
  });
});

const at = (exerciseId: string, correct: boolean, t: string, lessonId: string | null = 's1-u01-l001'): ExerciseAttempt =>
  ({ exerciseId, correct, at: t, date: t.slice(0, 10), lessonId, exerciseType: 'translate', answer: correct ? 'certo' : 'errado' });

describe('os meus erros', () => {
  it('fica só o que foi errado na última tentativa', () => {
    const list = openMistakes([
      at('a', false, '2026-11-01T10:00:00Z'),
      at('a', true, '2026-11-02T10:00:00Z'), // corrigido
      at('b', true, '2026-11-01T10:00:00Z'),
      at('b', false, '2026-11-03T10:00:00Z'), // errou depois de acertar
      at('c', false, '2026-11-02T10:00:00Z'),
      at('s1-u01-l001-e91', false, '2026-11-03T11:00:00Z'), // leitura em voz alta não conta
    ]);
    expect(list.map((m) => m.exerciseId)).toEqual(['b', 'c']);
  });
  it('erros da revisão apontam para a palavra', () => {
    expect(reviewItemOf('review:v-huis')).toBe('v-huis');
    expect(reviewItemOf('s1-u01-l001-e01')).toBeNull();
  });
});
