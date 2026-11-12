// IA na versão claude.ai (artefacto): usa a capacidade `sample`, que pergunta ao Claude
// com a conta de quem abre a página. Não há chave de API.

import { CoreError, type CoreAi, type ChatTurn, type Media } from '../../core/api';
import type { AiPlanId } from '../../shared/plans';
import type { AiStatus } from '../../shared/types';

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
type Input = string | ChatTurn[];
interface SampleFn {
  (input: Input, options?: SampleOptions): Promise<{ text: string; truncated: boolean }>;
  json<T = unknown>(input: Input, options?: SampleOptions): Promise<T>;
  limits(): Promise<{ maxPromptBytes: number; images?: { maxCount: number; maxInputBytes: number; mediaTypes: string[] }; modelTiers?: string[] }>;
}
interface ClaudeHost {
  use(name: string): Promise<unknown>;
}

/** Profundidade de cada plano → nível de modelo pedido ao Claude. */
const TIER: Record<AiPlanId, ModelTier> = { 'claudio-5': 'quick', 'claudio-5-5': 'default', 'claudio-6': 'complex' };

export const NOT_AVAILABLE =
  'Nesta página, a IA usa o Claude da tua conta do claude.ai. Abre a página no claude.ai com a sessão iniciada e autoriza o uso do Claude quando te for perguntado.';

export class DemoAi implements CoreAi {
  private sample: SampleFn | null = null;
  private tiers: string[] = [];
  private imageTypes: string[] = [];
  private maxImages = 0;
  private maxImageBytes = 0;
  pdf = false;

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

  configured() {
    return this.sample !== null;
  }

  status(): AiStatus {
    return this.sample ? { configured: true, message: 'IA ligada.' } : { configured: false, message: NOT_AVAILABLE };
  }

  checkImage(mime: string, size: number): string | null {
    if (!this.sample) return null;
    if (!this.maxImages) return 'Nesta página, a IA não consegue receber imagens.';
    if (this.imageTypes.length && !this.imageTypes.includes(mime)) return 'Este tipo de imagem não é aceite. Usa JPG ou PNG.';
    if (this.maxImageBytes && size > this.maxImageBytes) return 'A imagem é demasiado grande para a IA. Usa uma fotografia mais pequena.';
    return null;
  }

  private options(plan: AiPlanId, extra: SampleOptions = {}): SampleOptions {
    const tier = TIER[plan];
    return { ...(this.tiers.includes(tier) ? { modelTier: tier } : {}), cache: false, ...extra };
  }

  private require(): SampleFn {
    if (!this.sample) throw new CoreError(503, NOT_AVAILABLE, 'ai_not_configured');
    return this.sample;
  }

  async chat(o: { plan: AiPlanId; system: string; turns: ChatTurn[]; media: Media[]; signal: AbortSignal; onDelta: (d: string) => void }) {
    const sample = this.require();
    // A capacidade não tem instruções de sistema: vão no início da primeira mensagem.
    const turns = o.turns.map((t) => ({ ...t }));
    if (turns[0]) turns[0].content = `Instruções para esta conversa (segue-as e não as repitas):\n\n${o.system}\n\n---\n\nMensagem do estudante:\n${turns[0].content}`;
    const images = o.media.filter((m) => m.mime.startsWith('image/')).map((m) => new Blob([m.bytes as BlobPart], { type: m.mime }));
    let text = '';
    try {
      const r = await sample(
        turns,
        this.options(o.plan, {
          signal: o.signal,
          ...(images.length ? { images } : {}),
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
      throw toCoreError(e);
    }
  }

  async text(plan: AiPlanId, system: string, prompt: string) {
    const sample = this.require();
    try {
      return (await sample(`${system}\n\n---\n\n${prompt}`, this.options(plan))).text;
    } catch (err) {
      throw toCoreError(err as { code?: string });
    }
  }

  get vision() {
    return this.imageTypes.length > 0;
  }

  async json<T>(plan: AiPlanId, system: string, prompt: string, format: string, media: Media[] = []) {
    const sample = this.require();
    const images = media.filter((m) => this.imageTypes.includes(m.mime)).map((m) => new Blob([m.bytes as BlobPart], { type: m.mime }));
    try {
      return await sample.json<T>(
        `${system}\n\n---\n\n${prompt}\n\nResponde apenas com JSON neste formato: ${format}`,
        this.options(plan, images.length ? { images } : {}),
      );
    } catch (err) {
      throw toCoreError(err as { code?: string });
    }
  }
}

function toCoreError(e: { code?: string; message?: string }): CoreError {
  switch (e?.code) {
    case 'not_granted':
    case 'not_declared':
    case 'sampling_disabled':
    case 'capability_disabled':
    case 'capability_removed':
      return new CoreError(503, 'A página não tem autorização para usar o Claude. Autoriza-a no menu de permissões do artefacto e tenta de novo.', 'ai_not_granted');
    case 'session_expired':
      return new CoreError(503, 'A tua sessão do claude.ai terminou. Volta a entrar e tenta de novo.', 'ai_session');
    case 'rate_limited':
    case 'queue_overflow':
      return new CoreError(429, 'A IA está a receber muitos pedidos. Espera um pouco e tenta de novo.', 'ai_rate_limit');
    case 'refused':
      return new CoreError(422, 'A IA não pode responder a este pedido. Se for uma dúvida de estudo, tenta explicá-la de outra forma.', 'ai_refusal');
    case 'prompt_too_large':
      return new CoreError(413, 'A conversa ficou demasiado longa. Começa uma nova conversa.', 'too_large');
    case 'image_rejected':
    case 'images_unavailable':
      return new CoreError(415, 'A IA não conseguiu usar esta imagem. Tenta com outra fotografia (JPG ou PNG).', 'bad_image');
    case 'invalid_json':
    case 'empty_completion':
      return new CoreError(502, 'A resposta da IA veio incompleta. Tenta de novo.', 'ai_incomplete');
    default:
      return new CoreError(503, 'Não foi possível falar com a IA agora. Tenta de novo daqui a pouco.', 'ai_unavailable');
  }
}
