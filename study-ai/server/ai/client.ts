import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import type { z } from 'zod';
import type { AppConfig, PlanModelConfig } from '../config.ts';
import { HttpError } from '../security.ts';
import type { AiPlanId } from '../../shared/plans.ts';
import type { AiStatus } from '../../shared/types.ts';

// Ligação ao modelo de IA (API da Anthropic, Claude).
// A chave fica APENAS no servidor (variável ANTHROPIC_API_KEY). Sem chave, a aplicação
// continua a funcionar e as funcionalidades de IA mostram que a IA não está ligada.

export type AiMessage = Anthropic.Beta.BetaMessageParam;
export type AiContent = Anthropic.Beta.BetaContentBlockParam;

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface StreamResult {
  text: string;
  stopReason: string | null;
  usage: AiUsage;
  aborted: boolean;
}

const NOT_CONFIGURED =
  'A IA ainda não está ligada. Para a ativar, é preciso definir a variável ANTHROPIC_API_KEY no servidor (ver README). Todas as outras funcionalidades funcionam normalmente.';

/** Modelos em que o servidor da API pode repetir o pedido noutro modelo se houver uma recusa. */
function supportsServerFallback(model: string): boolean {
  return /^claude-(opus-5|fable-5|sonnet-5-5)/.test(model);
}

function supportsEffort(model: string): boolean {
  return !/^claude-(haiku-4|sonnet-4-5|opus-4-[015]|3)/.test(model);
}

export class AiService {
  private readonly client: Anthropic | null;
  private readonly plans: Record<AiPlanId, PlanModelConfig>;

  constructor(config: AppConfig) {
    this.plans = config.ai.plans;
    this.client = config.ai.apiKey
      ? new Anthropic({
          apiKey: config.ai.apiKey,
          ...(config.ai.baseURL ? { baseURL: config.ai.baseURL } : {}),
          maxRetries: 2,
          timeout: 10 * 60 * 1000,
        })
      : null;
  }

  get configured(): boolean {
    return this.client !== null;
  }

  status(): AiStatus {
    return this.configured
      ? { configured: true, message: 'IA ligada.' }
      : { configured: false, message: NOT_CONFIGURED };
  }

  modelFor(plan: AiPlanId): PlanModelConfig {
    return this.plans[plan];
  }

  private requireClient(): Anthropic {
    if (!this.client) throw new HttpError(503, NOT_CONFIGURED, 'ai_not_configured');
    return this.client;
  }

  private baseParams(plan: AiPlanId, overrides?: Partial<PlanModelConfig>) {
    const cfg = { ...this.plans[plan], ...overrides };
    return {
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      ...(supportsEffort(cfg.model) ? { output_config: { effort: cfg.effort } } : {}),
      ...(supportsServerFallback(cfg.model)
        ? { betas: ['server-side-fallback-2026-07-01'] as Anthropic.Beta.AnthropicBeta[], fallbacks: 'default' as const }
        : {}),
    };
  }

  /** Resposta em streaming para o chat. `onText` recebe cada pedaço de texto. */
  async streamChat(opts: {
    plan: AiPlanId;
    system: string;
    messages: AiMessage[];
    signal: AbortSignal;
    onText: (delta: string) => void;
  }): Promise<StreamResult> {
    const client = this.requireClient();
    const stream = client.beta.messages.stream(
      {
        ...this.baseParams(opts.plan),
        system: opts.system,
        messages: opts.messages,
        cache_control: { type: 'ephemeral' },
      },
      { signal: opts.signal },
    );
    let text = '';
    stream.on('text', (delta) => {
      text += delta;
      opts.onText(delta);
    });
    try {
      const final = await stream.finalMessage();
      return {
        text,
        stopReason: final.stop_reason,
        usage: { inputTokens: final.usage.input_tokens, outputTokens: final.usage.output_tokens },
        aborted: false,
      };
    } catch (err) {
      if (opts.signal.aborted || err instanceof Anthropic.APIUserAbortError) {
        return { text, stopReason: null, usage: { inputTokens: 0, outputTokens: 0 }, aborted: true };
      }
      throw toHttpError(err);
    }
  }

  /** Texto completo (resumos, análise do plano). Usa streaming por dentro para evitar timeouts. */
  async generateText(opts: {
    plan: AiPlanId;
    system: string;
    prompt: string;
    maxTokens?: number;
    effort?: PlanModelConfig['effort'];
  }): Promise<{ text: string; usage: AiUsage }> {
    const client = this.requireClient();
    try {
      const stream = client.beta.messages.stream({
        ...this.baseParams(opts.plan, {
          ...(opts.maxTokens ? { maxTokens: opts.maxTokens } : {}),
          ...(opts.effort ? { effort: opts.effort } : {}),
        }),
        system: opts.system,
        messages: [{ role: 'user', content: opts.prompt }],
      });
      const final = await stream.finalMessage();
      if (final.stop_reason === 'refusal') throw new HttpError(422, 'A IA não pode responder a este pedido.', 'ai_refusal');
      const text = final.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
      return { text, usage: { inputTokens: final.usage.input_tokens, outputTokens: final.usage.output_tokens } };
    } catch (err) {
      throw toHttpError(err);
    }
  }

  /** Resposta estruturada (JSON validado com Zod): testes, flashcards, correções. */
  async generateStructured<S extends z.ZodType>(opts: {
    plan: AiPlanId;
    system: string;
    prompt: string;
    schema: S;
    maxTokens?: number;
  }): Promise<{ data: z.infer<S>; usage: AiUsage }> {
    const client = this.requireClient();
    try {
      const params = this.baseParams(opts.plan, { maxTokens: opts.maxTokens ?? 16000 });
      const response = await client.beta.messages.parse({
        ...params,
        output_config: { ...(params.output_config ?? {}), format: betaZodOutputFormat(opts.schema) },
        system: opts.system,
        messages: [{ role: 'user', content: opts.prompt }],
      });
      if (response.stop_reason === 'refusal') throw new HttpError(422, 'A IA não pode responder a este pedido.', 'ai_refusal');
      if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
        throw new HttpError(502, 'A resposta da IA ficou incompleta. Tenta com menos perguntas.', 'ai_incomplete');
      }
      return {
        data: response.parsed_output as z.infer<S>,
        usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
      };
    } catch (err) {
      throw toHttpError(err);
    }
  }
}

export function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError)
    return new HttpError(503, 'A chave da API configurada no servidor não é válida ou não tem acesso a este modelo.', 'ai_auth');
  if (err instanceof Anthropic.RateLimitError)
    return new HttpError(429, 'A IA está a receber muitos pedidos. Tenta novamente daqui a um minuto.', 'ai_rate_limit');
  if (err instanceof Anthropic.BadRequestError)
    return new HttpError(400, `A IA não aceitou o pedido: ${err.message}`, 'ai_bad_request');
  if (err instanceof Anthropic.APIConnectionError)
    return new HttpError(503, 'Não foi possível ligar ao serviço de IA. Verifica a ligação do servidor.', 'ai_connection');
  if (err instanceof Anthropic.APIError)
    return new HttpError(503, 'O serviço de IA está temporariamente indisponível. Tenta novamente.', 'ai_unavailable');
  console.error('[ai] erro inesperado', err);
  return new HttpError(500, 'Ocorreu um erro ao falar com a IA.', 'ai_error');
}
