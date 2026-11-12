// IA da versão Netlify: Google Gemini (plano gratuito da API).
// A chave fica só no servidor (variável GEMINI_API_KEY no Netlify).

import { ApiError, GoogleGenAI, type Content, type Part } from '@google/genai';
import { CoreError, type ChatTurn, type CoreAi, type Media } from '../../core/api';
import type { AiPlanId } from '../../shared/plans';
import type { AiStatus } from '../../shared/types';

export interface GeminiOptions {
  apiKey: string | null;
  baseUrl?: string | null;
  /** Modelo para todos os planos, ou por plano. Vazio = escolhido automaticamente. */
  model?: string | null;
  models?: Partial<Record<AiPlanId, string | null>>;
  /** Tempo máximo de uma resposta (o Netlify termina as funções aos 30 s). */
  deadlineMs?: number;
}

const NOT_CONFIGURED =
  'Para a ativar, é preciso definir a variável GEMINI_API_KEY no Netlify (chave gratuita em aistudio.google.com — ver README). Todas as outras funcionalidades funcionam normalmente.';
const NOTICE =
  'A IA é o Google Gemini (plano gratuito): a Google pode usar as conversas para melhorar os seus modelos. Não escrevas dados pessoais.';

/** Tamanho máximo das respostas de cada plano. */
const MAX_TOKENS: Record<AiPlanId, number> = { 'claudio-5': 2048, 'claudio-5-5': 6144, 'claudio-6': 8192 };

const SUPPORTED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

const toBase64 = (b: Uint8Array) => Buffer.from(b).toString('base64');

/** Escolhe, da lista de modelos da conta, o «Flash» (ou «Flash-Lite») estável mais recente. */
export function pickModel(names: string[], lite: boolean): string | null {
  const clean = names.map((n) => n.replace(/^models\//, ''));
  const alias = lite ? 'gemini-flash-lite-latest' : 'gemini-flash-latest';
  if (clean.includes(alias)) return alias;
  const re = lite ? /^gemini-(\d+(?:\.\d+)?)-flash-lite$/ : /^gemini-(\d+(?:\.\d+)?)-flash$/;
  const ranked = clean
    .map((n) => ({ n, m: re.exec(n) }))
    .filter((x) => x.m)
    .sort((a, b) => Number(b.m![1]) - Number(a.m![1]));
  return ranked[0]?.n ?? null;
}

export class GeminiAi implements CoreAi {
  private client: GoogleGenAI | null;
  private opts: GeminiOptions;
  private resolved: Partial<Record<'flash' | 'lite', Promise<string>>> = {};
  pdf = true;

  constructor(opts: GeminiOptions) {
    this.opts = opts;
    this.client = opts.apiKey
      ? new GoogleGenAI({ apiKey: opts.apiKey, ...(opts.baseUrl ? { httpOptions: { baseUrl: opts.baseUrl } } : {}) })
      : null;
  }

  configured() {
    return this.client !== null;
  }

  status(): AiStatus {
    return this.client
      ? { configured: true, message: 'IA ligada.', provider: 'Google Gemini', notice: NOTICE }
      : { configured: false, message: NOT_CONFIGURED, provider: 'Google Gemini' };
  }

  checkImage(mime: string): string | null {
    return SUPPORTED_IMAGES.includes(mime) ? null : 'Este tipo de imagem não é aceite pela IA. Usa JPG, PNG ou WEBP.';
  }

  private require(): GoogleGenAI {
    if (!this.client) throw new CoreError(503, NOT_CONFIGURED, 'ai_not_configured');
    return this.client;
  }

  /** Modelo de cada plano: o Cláudio 5 usa o Flash-Lite (mais pedidos grátis por dia), os outros o Flash. */
  private async model(plan: AiPlanId): Promise<string> {
    const explicit = this.opts.models?.[plan] || this.opts.model;
    if (explicit) return explicit;
    const kind = plan === 'claudio-5' ? 'lite' : 'flash';
    this.resolved[kind] ??= (async () => {
      const client = this.require();
      const names: string[] = [];
      try {
        const pager = await client.models.list({ config: { pageSize: 200 } });
        for await (const m of pager) if (m.name) names.push(m.name);
      } catch {
        /* sem lista: usa o nome habitual */
      }
      return pickModel(names, kind === 'lite') ?? pickModel(names, false) ?? (kind === 'lite' ? 'gemini-flash-lite-latest' : 'gemini-flash-latest');
    })().catch((err) => {
      delete this.resolved[kind];
      throw err;
    });
    return this.resolved[kind]!;
  }

  private contents(turns: ChatTurn[], media: Media[]): Content[] {
    const contents: Content[] = turns.map((t) => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.content }] }));
    const last = contents[contents.length - 1];
    if (last && media.length) {
      const parts: Part[] = media.map((m) => ({ inlineData: { mimeType: m.mime, data: toBase64(m.bytes) } }));
      last.parts = [...parts, ...(last.parts ?? [])];
    }
    return contents;
  }

  async chat(o: { plan: AiPlanId; system: string; turns: ChatTurn[]; media: Media[]; signal: AbortSignal; onDelta: (d: string) => void }) {
    const client = this.require();
    const model = await this.model(o.plan);
    const deadline = new AbortController();
    const timer = setTimeout(() => deadline.abort(), this.opts.deadlineMs ?? 25_000);
    const signal = AbortSignal.any([o.signal, deadline.signal]);
    let text = '';
    let finish: string | undefined;
    try {
      const stream = await client.models.generateContentStream({
        model,
        contents: this.contents(o.turns, o.media),
        config: { systemInstruction: o.system, maxOutputTokens: MAX_TOKENS[o.plan], abortSignal: signal },
      });
      for await (const chunk of stream) {
        if (chunk.promptFeedback?.blockReason) throw refused();
        const t = chunk.text;
        if (t) {
          text += t;
          o.onDelta(t);
        }
        finish = chunk.candidates?.[0]?.finishReason ?? finish;
      }
    } catch (err) {
      if (o.signal.aborted) return { text, truncated: false, aborted: true };
      if (deadline.signal.aborted && text) return { text, truncated: true, aborted: false };
      if (deadline.signal.aborted) throw new CoreError(504, 'A IA demorou demasiado a responder. Tenta uma pergunta mais curta.', 'ai_timeout');
      throw toCoreError(err, () => this.forget(o.plan));
    } finally {
      clearTimeout(timer);
    }
    if (!text && finish && finish !== 'STOP') throw refused();
    return { text, truncated: finish === 'MAX_TOKENS', aborted: false };
  }

  async text(plan: AiPlanId, system: string, prompt: string) {
    const client = this.require();
    try {
      const r = await client.models.generateContent({
        model: await this.model(plan),
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: system, maxOutputTokens: MAX_TOKENS[plan], abortSignal: AbortSignal.timeout(this.opts.deadlineMs ?? 25_000) },
      });
      if (!r.text) throw refused();
      return r.text;
    } catch (err) {
      throw toCoreError(err, () => this.forget(plan));
    }
  }

  async json<T>(plan: AiPlanId, system: string, prompt: string, format: string): Promise<T> {
    const client = this.require();
    let raw = '';
    try {
      const r = await client.models.generateContent({
        model: await this.model(plan),
        contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nResponde apenas com JSON neste formato: ${format}` }] }],
        config: {
          systemInstruction: system,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
          abortSignal: AbortSignal.timeout(this.opts.deadlineMs ?? 25_000),
        },
      });
      raw = r.text ?? '';
    } catch (err) {
      throw toCoreError(err, () => this.forget(plan));
    }
    try {
      return JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '')) as T;
    } catch {
      throw new CoreError(502, 'A resposta da IA veio incompleta. Tenta de novo (com menos perguntas, se for um teste).', 'ai_incomplete');
    }
  }

  private forget(plan: AiPlanId) {
    delete this.resolved[plan === 'claudio-5' ? 'lite' : 'flash'];
  }
}

const refused = () => new CoreError(422, 'A IA não pode responder a este pedido. Se for uma dúvida de estudo, tenta explicá-la de outra forma.', 'ai_refusal');

function toCoreError(err: unknown, onModelMissing: () => void): CoreError {
  if (err instanceof CoreError) return err;
  if (err instanceof ApiError) {
    const msg = err.message ?? '';
    if (err.status === 429)
      return new CoreError(429, 'A IA gratuita atingiu o limite de pedidos. Espera um minuto e tenta de novo; se continuar, o limite do dia acabou (volta amanhã).', 'ai_rate_limit');
    if (err.status === 401 || err.status === 403 || /API key/i.test(msg))
      return new CoreError(503, 'A chave do Gemini configurada no Netlify não é válida. Confirma a variável GEMINI_API_KEY.', 'ai_auth');
    if (err.status === 404) {
      onModelMissing();
      return new CoreError(503, 'O modelo de IA mudou de nome. Tenta de novo daqui a um momento.', 'ai_model');
    }
    if (err.status === 400) return new CoreError(400, 'A IA não aceitou o pedido (o anexo pode ser grande demais ou de um tipo não suportado).', 'ai_bad_request');
    return new CoreError(503, 'O serviço de IA está temporariamente indisponível. Tenta de novo.', 'ai_unavailable');
  }
  if ((err as Error)?.name === 'AbortError' || (err as Error)?.name === 'TimeoutError')
    return new CoreError(504, 'A IA demorou demasiado a responder. Tenta de novo.', 'ai_timeout');
  console.error('[gemini]', err);
  return new CoreError(503, 'Não foi possível falar com a IA. Tenta de novo.', 'ai_unavailable');
}
