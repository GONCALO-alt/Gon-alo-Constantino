import { AI_PLANS, limitError, type AiPlanId, type UsageSnapshot } from '../../shared/plans.ts';
import type { Db } from '../db.ts';
import { HttpError } from '../security.ts';
import type { AiUsage } from './client.ts';

// Controlo dos limites de cada plano (por estudante, por dia, por plano).

export function getUsage(db: Db, userId: string, plan: AiPlanId, day: string): UsageSnapshot {
  const row = db.one<{ questions: number; images: number }>(
    'SELECT questions, images FROM usage WHERE user_id = ? AND day = ? AND plan = ?',
    userId,
    day,
    plan,
  );
  const p = AI_PLANS[plan];
  return {
    plan,
    day,
    questionsUsed: row?.questions ?? 0,
    questionsLimit: p.dailyQuestions,
    imagesUsed: row?.images ?? 0,
    imagesLimit: p.dailyImages,
    files: p.files,
  };
}

/** Lança um erro 429/403 se o pedido ultrapassar o que o plano permite. */
export function assertAllowed(usage: UsageSnapshot, opts: { images?: number; files?: number } = {}) {
  const e = limitError(usage, opts);
  if (e) throw new HttpError(e.status, e.message, e.code);
}

export function recordUsage(
  db: Db,
  userId: string,
  plan: AiPlanId,
  day: string,
  add: { questions?: number; images?: number; tokens?: AiUsage },
) {
  db.run(
    `INSERT INTO usage (user_id, day, plan, questions, images, input_tokens, output_tokens)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (user_id, day, plan) DO UPDATE SET
       questions = questions + excluded.questions,
       images = images + excluded.images,
       input_tokens = input_tokens + excluded.input_tokens,
       output_tokens = output_tokens + excluded.output_tokens`,
    userId,
    day,
    plan,
    add.questions ?? 0,
    add.images ?? 0,
    add.tokens?.inputTokens ?? 0,
    add.tokens?.outputTokens ?? 0,
  );
}
