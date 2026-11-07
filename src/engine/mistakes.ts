/**
 * «Os meus erros»: exercícios cuja ÚLTIMA resposta foi errada.
 * Quando o aluno acerta o mesmo exercício (numa lição, revisão ou no treino dos erros),
 * o erro sai da lista. Os exercícios de leitura em voz alta não contam.
 */
import type { ExerciseAttempt } from '../domain/progress.ts';

export interface OpenMistake {
  exerciseId: string;
  lessonId: string | null;
  exerciseType: ExerciseAttempt['exerciseType'];
  answer: string;
  at: string;
}

/** Exercícios de voz gerados na hora (…-e91, …-e92). */
const isSpeaking = (id: string) => /-e9\d$/.test(id);

export function openMistakes(attempts: readonly ExerciseAttempt[]): OpenMistake[] {
  const latest = new Map<string, ExerciseAttempt>();
  for (const a of attempts) {
    if (isSpeaking(a.exerciseId)) continue;
    const prev = latest.get(a.exerciseId);
    // Por ordem de registo; em empate de hora, o registo mais recente (id maior) vence.
    if (!prev || a.at > prev.at || (a.at === prev.at && (a.id ?? 0) >= (prev.id ?? 0))) latest.set(a.exerciseId, a);
  }
  return [...latest.values()]
    .filter((a) => !a.correct)
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((a) => ({ exerciseId: a.exerciseId, lessonId: a.lessonId, exerciseType: a.exerciseType, answer: a.answer, at: a.at }));
}

/** ID de vocabulário de um erro da revisão (review:v-…), ou null. */
export function reviewItemOf(exerciseId: string): string | null {
  // «review:v-…» (sessões de revisão) ou «review-v-…» (palavras difíceis repetidas numa lição).
  return /^review[:-]v-/.test(exerciseId) ? exerciseId.slice(7) : null;
}
