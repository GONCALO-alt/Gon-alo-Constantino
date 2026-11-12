// IA na versão de demonstração (artefacto do claude.ai): usa a capacidade `sample`,
// que pergunta ao Claude com a conta de quem abre a página. Não há chave de API.

import type { AiPlanId } from '../../shared/plans';

type ModelTier = 'quick' | 'default' | 'complex';

interface SampleUpdate {
  text: string;
  delta: string;
}

interface SampleOptions {
  onText?: (u: SampleUpdate) => void;
  signal?: AbortSignal;
  images?: Blob[];
  modelTier?: ModelTier;
  cache?: boolean;
}

interface SampleFn {
  (input: string | { role: 'user' | 'assistant'; content: string }[], options?: SampleOptions): Promise<{ text: string; truncated: boolean }>;
  json<T = unknown>(input: string | { role: 'user' | 'assistant'; content: string }[], options?: SampleOptions): Promise<T>;
  limits(): Promise<{ maxPromptBytes: number; images?: { maxCount: number; maxInputBytes: number; mediaTypes: string[] }; modelTiers?: string[] }>;
}

interface ClaudeHost {
  use(name: string): Promise<unknown>;
}

export class DemoError extends Error {
  status: number;
  code: string;
  partial?: string;
  constructor(status: number, message: string, code: string, partial?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.partial = partial;
  }
}

/** Profundidade de cada plano → nível de modelo pedido ao Claude. */
const TIER: Record<AiPlanId, ModelTier> = { 'claudio-5': 'quick', 'claudio-5-5': 'default', 'claudio-6': 'complex' };

export const NOT_AVAILABLE =
  'Nesta página, a IA usa o Claude da tua conta do claude.ai. Abre a página no claude.ai com a sessão iniciada e autoriza o uso do Claude quando te for perguntado.';

export class DemoAi {
  private sample: SampleFn | null = null;
  private tiers: string[] = [];
  imageTypes: string[] = [];
  maxImages = 0;
  maxImageBytes = 0;

  async init(host: ClaudeHost | null) {
    if (!host) return;
    this.sample = (await host.use('sample').catch(() => null)) as SampleFn | null;
    if (!this.sample) return;
    const limits = await this.sample.limits().catch(() => null);
    this.tiers = limits?.modelTiers ?? [];
    this.imageTypes = limits?.images?.mediaTypes ?? [];
    this.maxImages = limits?.images?.maxCount ?? 0;
    this.maxImageBytes = limits?.images?.maxInputBytes ?? 0;
  }

  get configured() {
    return this.sample !== null;
  }

  private options(plan: AiPlanId, extra: SampleOptions = {}): SampleOptions {
    const tier = TIER[plan];
    return { ...(this.tiers.includes(tier) ? { modelTier: tier } : {}), ...extra };
  }

  private require(): SampleFn {
    if (!this.sample) throw new DemoError(503, NOT_AVAILABLE, 'ai_not_configured');
    return this.sample;
  }

  async chat(o: {
    plan: AiPlanId;
    turns: { role: 'user' | 'assistant'; content: string }[];
    images: Blob[];
    signal: AbortSignal;
    onDelta: (d: string) => void;
  }): Promise<{ text: string; truncated: boolean; aborted: boolean }> {
    const sample = this.require();
    let text = '';
    try {
      const r = await sample(
        o.turns,
        this.options(o.plan, {
          cache: false,
          signal: o.signal,
          ...(o.images.length ? { images: o.images } : {}),
          onText: (u) => {
            text = u.text;
            if (u.delta) o.onDelta(u.delta);
          },
        }),
      );
      return { text: r.text, truncated: r.truncated, aborted: false };
    } catch (err) {
      const e = err as { code?: string; message?: string; text?: string };
      if (e?.code === 'cancelled' || o.signal.aborted) return { text: e?.text ?? text, truncated: false, aborted: true };
      throw toDemoError(e, e?.text ?? text);
    }
  }

  async text(plan: AiPlanId, prompt: string): Promise<string> {
    const sample = this.require();
    try {
      const r = await sample(prompt, this.options(plan, { cache: false }));
      return r.text;
    } catch (err) {
      throw toDemoError(err as { code?: string; message?: string });
    }
  }

  async json<T>(plan: AiPlanId, prompt: string): Promise<T> {
    const sample = this.require();
    try {
      return await sample.json<T>(prompt, this.options(plan, { cache: false }));
    } catch (err) {
      throw toDemoError(err as { code?: string; message?: string });
    }
  }
}

function toDemoError(e: { code?: string; message?: string }, partial?: string): DemoError {
  switch (e?.code) {
    case 'not_granted':
    case 'not_declared':
    case 'sampling_disabled':
    case 'capability_disabled':
    case 'capability_removed':
      return new DemoError(503, 'A página não tem autorização para usar o Claude. Autoriza-a no menu de permissões do artefacto e tenta de novo.', 'ai_not_granted');
    case 'session_expired':
      return new DemoError(503, 'A tua sessão do claude.ai terminou. Volta a entrar e tenta de novo.', 'ai_session');
    case 'rate_limited':
    case 'queue_overflow':
      return new DemoError(429, 'A IA está a receber muitos pedidos. Espera um pouco e tenta de novo.', 'ai_rate_limit');
    case 'refused':
      return new DemoError(422, 'A IA não pode responder a este pedido. Se for uma dúvida de estudo, tenta explicá-la de outra forma.', 'ai_refusal');
    case 'prompt_too_large':
      return new DemoError(413, 'A conversa ficou demasiado longa. Começa uma nova conversa.', 'too_large');
    case 'image_rejected':
    case 'images_unavailable':
      return new DemoError(415, 'A IA não conseguiu usar esta imagem. Tenta com outra fotografia (JPG ou PNG).', 'bad_image');
    case 'invalid_json':
    case 'empty_completion':
      return new DemoError(502, 'A resposta da IA veio incompleta. Tenta de novo.', 'ai_incomplete');
    default:
      return new DemoError(503, 'Não foi possível falar com a IA agora. Tenta de novo daqui a pouco.', 'ai_unavailable', partial);
  }
}
