/**
 * Revisão espaçada — sistema de caixas de Leitner, simples e transparente.
 *
 *  - Cada item começa na caixa 0 quando é aprendido.
 *  - Resposta certa → sobe uma caixa; o intervalo até à próxima revisão cresce.
 *  - Resposta errada → desce duas caixas e volta a ficar disponível em poucos minutos.
 *  - "Quase certa" (gralha/acento) → mantém a caixa e revê-se mais cedo.
 *  - A dificuldade do item (1–5) encurta ou alonga ligeiramente os intervalos.
 *  - A confiança indicada pelo aluno (opcional) pode saltar uma caixa.
 *
 * Todos os parâmetros estão em SRS_CONFIG para poderem ser ajustados e testados.
 */
import type { ReviewSchedule } from '../domain/progress.ts';
import type { Verdict } from './answers.ts';

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

export const SRS_CONFIG = {
  /** Intervalo por caixa (ms). Caixa 0 = rever na mesma sessão / pouco depois. */
  intervals: [10 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY, 75 * DAY, 160 * DAY],
  /** Depois de um erro, o item volta a estar pronto após este tempo. */
  relearnDelay: 5 * MIN,
  /** Quantas caixas desce após um erro. */
  lapsePenalty: 2,
  /** Ajuste por dificuldade: 1 → ×1.3, 3 → ×1, 5 → ×0.7. */
  difficultyFactor: (d: number) => 1 + (3 - d) * 0.15,
  /** Considera-se "dominado" a partir desta caixa. */
  masteredBox: 5,
} as const;

export type Confidence = 'low' | 'normal' | 'high';

export function newSchedule(itemId: string, now: number, difficulty = 3): ReviewSchedule {
  const iso = new Date(now).toISOString();
  return {
    itemId,
    kind: 'vocab',
    firstLearnedAt: iso,
    lastReviewedAt: iso,
    dueAt: now + SRS_CONFIG.intervals[0]!,
    box: 0,
    reviews: 0,
    correct: 0,
    incorrect: 0,
    lapses: 0,
    difficulty: clamp(difficulty, 1, 5),
  };
}

export function intervalFor(box: number, difficulty: number): number {
  const i = clamp(box, 0, SRS_CONFIG.intervals.length - 1);
  return Math.round(SRS_CONFIG.intervals[i]! * SRS_CONFIG.difficultyFactor(difficulty));
}

/** Aplica o resultado de uma revisão. Devolve um NOVO objeto (imutável). */
export function applyReview(s: ReviewSchedule, verdict: Verdict, now: number, confidence: Confidence = 'normal'): ReviewSchedule {
  const next: ReviewSchedule = {
    ...s,
    reviews: s.reviews + 1,
    lastReviewedAt: new Date(now).toISOString(),
  };
  const maxBox = SRS_CONFIG.intervals.length - 1;
  if (verdict === 'incorrect') {
    next.incorrect += 1;
    next.lapses += s.box > 0 ? 1 : 0;
    next.box = Math.max(0, s.box - SRS_CONFIG.lapsePenalty);
    next.difficulty = clamp(s.difficulty + 0.5, 1, 5);
    next.dueAt = now + SRS_CONFIG.relearnDelay;
    return next;
  }
  next.correct += 1;
  if (verdict === 'almost') {
    next.dueAt = now + Math.max(SRS_CONFIG.relearnDelay, Math.round(intervalFor(s.box, s.difficulty) / 2));
    return next;
  }
  const step = confidence === 'high' ? 2 : confidence === 'low' ? 0 : 1;
  next.box = clamp(s.box + step, 0, maxBox);
  next.difficulty = clamp(s.difficulty - (confidence === 'high' ? 0.3 : 0.1), 1, 5);
  next.dueAt = now + intervalFor(next.box, next.difficulty);
  return next;
}

export function isDue(s: ReviewSchedule, now: number): boolean {
  return s.dueAt <= now;
}

/**
 * Ordena os itens para uma sessão: primeiro os atrasados há mais tempo e os mais
 * difíceis; limita o tamanho da sessão.
 */
export function pickDue(items: readonly ReviewSchedule[], now: number, limit = 15): ReviewSchedule[] {
  return items
    .filter((s) => isDue(s, now))
    .sort((a, b) => a.box - b.box || b.difficulty - a.difficulty || a.dueAt - b.dueAt)
    .slice(0, limit);
}

/** Itens "difíceis": muitos erros relativos ou dificuldade alta. */
export function isHard(s: ReviewSchedule): boolean {
  return s.difficulty >= 4 || (s.reviews >= 3 && s.incorrect / s.reviews >= 0.4);
}

export function isMastered(s: ReviewSchedule): boolean {
  return s.box >= SRS_CONFIG.masteredBox;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
