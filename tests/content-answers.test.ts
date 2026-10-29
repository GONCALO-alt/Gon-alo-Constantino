/**
 * Para TODAS as lições publicadas: a resposta de referência de cada exercício
 * tem de ser aceite pelo motor de correção (rápido; não usa a interface).
 */
import { describe, expect, it } from 'vitest';
import type { Exercise } from '../src/domain/schemas.ts';
import { expandAnswerPattern, joinTokens } from '../src/engine/answers.ts';
import { gradeExercise, type ExerciseResponse } from '../src/engine/grading.ts';
import { realFiles } from './helpers.ts';

function referenceResponse(ex: Exercise): ExerciseResponse {
  const first = (xs: string[]) => expandAnswerPattern(xs[0]!)[0]!;
  switch (ex.type) {
    case 'multipleChoice': case 'expression': case 'dialogue':
      return { kind: 'option', id: ex.options.find((o) => o.correct)!.id };
    case 'articleChoice': return { kind: 'option', id: ex.article };
    case 'findError': return { kind: 'index', index: ex.errorIndex };
    case 'match': return { kind: 'match', mistakes: 0 };
    case 'comprehension': return { kind: 'options', ids: ex.questions.map((q) => q.options.find((o) => o.correct)!.id) };
    case 'wordOrder': return { kind: 'text', value: joinTokens(ex.tokens) };
    case 'shortWriting': return { kind: 'text', value: first(ex.referenceAnswers) };
    case 'fillBlank': return { kind: 'text', value: ex.choices ? ex.choices.find((c) => expandAnswerPattern(ex.answers[0]!).includes(c)) ?? first(ex.answers) : first(ex.answers) };
    default: return { kind: 'text', value: first(ex.answers) };
  }
}

const lessons = realFiles().flatMap((f) => f.lessons).filter((l) => l.status === 'published');

describe('respostas de referência de todo o conteúdo publicado', () => {
  it.each(lessons.map((l) => [l.id, l] as const))('%s', (_id, lesson) => {
    for (const ex of lesson.exercises) {
      const r = gradeExercise(ex, referenceResponse(ex), { lenientAccents: false });
      expect(r.verdict, `${ex.id} (${ex.type}) → ${JSON.stringify(referenceResponse(ex))}`).toBe('correct');
    }
  });
});
