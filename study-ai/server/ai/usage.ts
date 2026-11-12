import { AI_PLANS, type AiPlanId, type UsageSnapshot } from '../../shared/plans.ts';
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
  const plan = AI_PLANS[usage.plan];
  if (usage.questionsLimit !== null && usage.questionsUsed >= usage.questionsLimit) {
    throw new HttpError(
      429,
      `Já usaste as ${usage.questionsLimit} perguntas de hoje do ${plan.name}. Volta amanhã ou muda de plano em «Escolhe a tua IA».`,
      'limit_questions',
    );
  }
  const images = opts.images ?? 0;
  if (images > 0) {
    if (usage.imagesLimit === 0)
      throw new HttpError(403, `O ${plan.name} não permite carregar imagens. Escolhe o Cláudio 5.5 ou o Cláudio 6.`, 'plan_no_images');
    if (usage.imagesLimit !== null && usage.imagesUsed + images > usage.imagesLimit) {
      const left = Math.max(0, usage.imagesLimit - usage.imagesUsed);
      throw new HttpError(
        429,
        `O ${plan.name} permite ${usage.imagesLimit} imagens por dia. Hoje ainda podes enviar ${left}.`,
        'limit_images',
      );
    }
  }
  if ((opts.files ?? 0) > 0 && !plan.files) {
    throw new HttpError(403, `O ${plan.name} não permite carregar ficheiros. Só o Cláudio 6 analisa documentos.`, 'plan_no_files');
  }
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
