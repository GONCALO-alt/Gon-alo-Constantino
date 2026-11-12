// Os três planos de IA da STUDY AI.
// Os preços são apenas informativos: não existe nenhum sistema de pagamentos.
// Os limites são aplicados no servidor (server/ai/usage.ts) e mostrados na interface.

export type AiPlanId = 'claudio-5' | 'claudio-5-5' | 'claudio-6';

/** Profundidade das respostas: muda as instruções dadas ao modelo e o esforço pedido. */
export type AnswerDepth = 'basica' | 'detalhada' | 'aprofundada';

export interface AiPlan {
  id: AiPlanId;
  name: string;
  /** Preço apresentado (apenas visual). */
  price: string;
  tagline: string;
  depth: AnswerDepth;
  /** Perguntas por dia. `null` = sem limite. */
  dailyQuestions: number | null;
  /** Imagens por dia. `null` = sem limite, 0 = não permite. */
  dailyImages: number | null;
  /** Permite carregar ficheiros (PDF, TXT, MD, CSV). */
  files: boolean;
  features: string[];
  highlight?: boolean;
}

export const AI_PLANS: Record<AiPlanId, AiPlan> = {
  'claudio-5': {
    id: 'claudio-5',
    name: 'Cláudio 5',
    price: '0,00 €',
    tagline: 'O essencial para estudar todos os dias.',
    depth: 'basica',
    dailyQuestions: null,
    dailyImages: 0,
    files: false,
    features: [
      'Respostas mais simples e diretas',
      'Ajuda em todas as disciplinas',
      'Explicações básicas',
      'Resumos simples',
      'Ajuda nos trabalhos de casa',
      'Sem limite de perguntas',
    ],
  },
  'claudio-5-5': {
    id: 'claudio-5-5',
    name: 'Cláudio 5.5',
    price: '0,79 €',
    tagline: 'Mais detalhe e análise de fotografias.',
    depth: 'detalhada',
    dailyQuestions: 20,
    dailyImages: 3,
    files: false,
    features: [
      'Respostas mais completas e detalhadas',
      'Ajuda em todas as disciplinas',
      'Até 3 imagens por dia',
      'Analisa fotografias de exercícios e fichas',
      'Explicações passo a passo',
      'Criação de resumos e exercícios',
      'Limite de 20 perguntas por dia',
    ],
  },
  'claudio-6': {
    id: 'claudio-6',
    name: 'Cláudio 6',
    price: '0,99 €',
    tagline: 'A experiência completa, sem limites.',
    depth: 'aprofundada',
    dailyQuestions: null,
    dailyImages: null,
    files: true,
    highlight: true,
    features: [
      'Respostas completas e detalhadas',
      'Explicações mais aprofundadas',
      'Imagens ilimitadas',
      'Carregar ficheiros (PDF, TXT, MD, CSV)',
      'Analisa documentos e fichas de exercícios',
      'Ajuda em todas as disciplinas',
      'Resolve exercícios passo a passo',
      'Cria testes, resumos e fichas de estudo',
      'Sem limite de perguntas',
    ],
  },
};

export const AI_PLAN_IDS = Object.keys(AI_PLANS) as AiPlanId[];
export const DEFAULT_AI_PLAN: AiPlanId = 'claudio-5';

export function isAiPlanId(value: unknown): value is AiPlanId {
  return typeof value === 'string' && value in AI_PLANS;
}

/** Tipos de ficheiro aceites. As imagens seguem os formatos suportados pela API. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export const FILE_TYPES = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv'] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 20 * 1024 * 1024;
/** Gravação de voz para transcrever (cerca de 2 minutos). */
export const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
export const MAX_AUDIO_SECONDS = 120;

export const MAX_TEXT_BYTES = 1024 * 1024;
/** Máximo de anexos numa só mensagem. */
export const MAX_ATTACHMENTS_PER_MESSAGE = 6;

export interface UsageSnapshot {
  plan: AiPlanId;
  day: string;
  questionsUsed: number;
  questionsLimit: number | null;
  imagesUsed: number;
  imagesLimit: number | null;
  files: boolean;
}

export function questionsLeft(u: UsageSnapshot): number | null {
  return u.questionsLimit === null ? null : Math.max(0, u.questionsLimit - u.questionsUsed);
}

export function imagesLeft(u: UsageSnapshot): number | null {
  return u.imagesLimit === null ? null : Math.max(0, u.imagesLimit - u.imagesUsed);
}

/** Se o pedido ultrapassar o que o plano permite, devolve o erro a mostrar (senão `null`). */
export function limitError(usage: UsageSnapshot, opts: { images?: number; files?: number } = {}): { status: number; message: string; code: string } | null {
  const plan = AI_PLANS[usage.plan];
  if (usage.questionsLimit !== null && usage.questionsUsed >= usage.questionsLimit) {
    return {
      status: 429,
      message: `Já usaste as ${usage.questionsLimit} perguntas de hoje do ${plan.name}. Volta amanhã ou muda de plano em «Escolhe a tua IA».`,
      code: 'limit_questions',
    };
  }
  const images = opts.images ?? 0;
  if (images > 0) {
    if (usage.imagesLimit === 0)
      return { status: 403, message: `O ${plan.name} não permite carregar imagens. Escolhe o Cláudio 5.5 ou o Cláudio 6.`, code: 'plan_no_images' };
    if (usage.imagesLimit !== null && usage.imagesUsed + images > usage.imagesLimit) {
      const left = Math.max(0, usage.imagesLimit - usage.imagesUsed);
      return { status: 429, message: `O ${plan.name} permite ${usage.imagesLimit} imagens por dia. Hoje ainda podes enviar ${left}.`, code: 'limit_images' };
    }
  }
  if ((opts.files ?? 0) > 0 && !plan.files)
    return { status: 403, message: `O ${plan.name} não permite carregar ficheiros. Só o Cláudio 6 analisa documentos.`, code: 'plan_no_files' };
  return null;
}
