// IA das versões Netlify e Cloudflare: Google Gemini (plano gratuito da API).
// Fala diretamente com a API REST (só `fetch`), por isso funciona em Node e nos Workers.
// A chave fica só no servidor (variável/segredo GEMINI_API_KEY).

import { CoreError, type ChatTurn, type CoreAi, type Media } from './api';
import type { AiPlanId } from '../shared/plans';
import type { AiStatus } from '../shared/types';

export interface GeminiOptions {
  apiKey: string | null;
  baseUrl?: string | null;
  /** Modelo para todos os planos, ou por plano. Vazio = escolhido automaticamente. */
  model?: string | null;
  models?: Partial<Record<AiPlanId, string | null>>;
  /** Tempo máximo de uma resposta (o Netlify termina as funções aos 30 s). */
  deadlineMs?: number;
  /** Tokens de «pensamento» por plano (mais = respostas mais cuidadas, mas mais lentas). */
  thinking?: Partial<Record<AiPlanId, number>>;
  /** Onde se define a chave (para a mensagem quando falta). */
  where?: string;
}

const NOTICE =
  'A IA é o Google Gemini (plano gratuito): a Google pode usar as conversas para melhorar os seus modelos. Não escrevas dados pessoais.';

/** Tamanho máximo do texto das respostas de cada plano (o pensamento soma-se a isto). */
const ANSWER_TOKENS: Record<AiPlanId, number> = { 'claudio-5': 2048, 'claudio-5-5': 6144, 'claudio-6': 8192 };
const DEFAULT_THINKING: Record<AiPlanId, number> = { 'claudio-5': 0, 'claudio-5-5': 1024, 'claudio-6': 2048 };

const SUPPORTED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

interface Part {
  text?: string;
  thought?: boolean;
  inlineData?: { mimeType: string; data: string };
}
interface Content {
  role: 'user' | 'model';
  parts: Part[];
}
interface GenerateResponse {
  candidates?: { content?: { parts?: Part[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

class GeminiHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Base64 sem depender de `Buffer` (funciona em Node e nos Workers). */
function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const textOf = (r: GenerateResponse) =>
  (r.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => p.text && !p.thought)
    .map((p) => p.text)
    .join('');

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
  private opts: GeminiOptions;
  private base: string;
  /** Modelo escolhido, partilhado por todas as instâncias com a mesma chave (evita repetir a lista). */
  private static resolved = new Map<string, Promise<string>>();
  /** Modelos que não aceitam o controlo do pensamento (pede-se sem ele). */
  private noThinking = new Set<string>();
  pdf = true;
  vision = true;

  constructor(opts: GeminiOptions) {
    this.opts = opts;
    this.base = (opts.baseUrl || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
  }

  private get notConfigured() {
    return `Para a ativar, é preciso definir a chave GEMINI_API_KEY ${this.opts.where ?? 'no alojamento'} (chave gratuita em aistudio.google.com — ver README). Todas as outras funcionalidades funcionam normalmente.`;
  }

  configured() {
    return !!this.opts.apiKey;
  }

  status(): AiStatus {
    return this.opts.apiKey
      ? { configured: true, message: 'IA ligada.', provider: 'Google Gemini', notice: NOTICE, voice: true }
      : { configured: false, message: this.notConfigured, provider: 'Google Gemini' };
  }

  checkImage(mime: string): string | null {
    return SUPPORTED_IMAGES.includes(mime) ? null : 'Este tipo de imagem não é aceite pela IA. Usa JPG, PNG ou WEBP.';
  }

  private key(): string {
    if (!this.opts.apiKey) throw new CoreError(503, this.notConfigured, 'ai_not_configured');
    return this.opts.apiKey;
  }

  private async call(path: string, init: { method?: string; body?: unknown; signal?: AbortSignal }): Promise<Response> {
    const res = await fetch(`${this.base}/v1beta/${path}`, {
      method: init.method ?? 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.key() },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: init.signal,
    });
    if (!res.ok) {
      let message = res.statusText;
      try {
        const data = (await res.json()) as { error?: { message?: string } };
        message = data.error?.message ?? message;
      } catch {
        /* sem corpo JSON */
      }
      throw new GeminiHttpError(res.status, message);
    }
    return res;
  }

  /** Modelo de cada plano: o Cláudio 5 usa o Flash-Lite (mais pedidos grátis por dia), os outros o Flash. */
  private async model(plan: AiPlanId): Promise<string> {
    const explicit = this.opts.models?.[plan] || this.opts.model;
    if (explicit) return explicit;
    const kind = plan === 'claudio-5' ? 'lite' : 'flash';
    const cacheKey = this.cacheKey(kind);
    const cached = GeminiAi.resolved.get(cacheKey);
    if (cached) return cached;
    const pending = (async () => {
      const names: string[] = [];
      try {
        let token = '';
        for (let page = 0; page < 5; page++) {
          const res = await this.call(`models?pageSize=200${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`, { method: 'GET' });
          const data = (await res.json()) as { models?: { name?: string }[]; nextPageToken?: string };
          for (const m of data.models ?? []) if (m.name) names.push(m.name);
          if (!data.nextPageToken) break;
          token = data.nextPageToken;
        }
      } catch (err) {
        if (err instanceof GeminiHttpError && (err.status === 401 || err.status === 403)) throw err;
        /* sem lista: usa o nome habitual */
      }
      return pickModel(names, kind === 'lite') ?? pickModel(names, false) ?? (kind === 'lite' ? 'gemini-flash-lite-latest' : 'gemini-flash-latest');
    })().catch((err) => {
      GeminiAi.resolved.delete(cacheKey);
      throw err;
    });
    GeminiAi.resolved.set(cacheKey, pending);
    return pending;
  }

  private cacheKey(kind: 'flash' | 'lite') {
    return `${this.base}|${(this.opts.apiKey ?? '').slice(-8)}|${kind}`;
  }

  private forget(plan: AiPlanId) {
    GeminiAi.resolved.delete(this.cacheKey(plan === 'claudio-5' ? 'lite' : 'flash'));
  }

  private config(model: string, plan: AiPlanId, answerTokens: number, extra: Record<string, unknown> = {}) {
    const budget = this.opts.thinking?.[plan] ?? DEFAULT_THINKING[plan];
    if (this.noThinking.has(model)) return { maxOutputTokens: answerTokens + budget, ...extra };
    return { maxOutputTokens: answerTokens + budget, thinkingConfig: { thinkingBudget: budget }, ...extra };
  }

  /** Faz o pedido; se o modelo não aceitar o controlo do pensamento, repete sem ele. */
  private async generate(plan: AiPlanId, stream: boolean, body: (model: string) => Record<string, unknown>, signal: AbortSignal) {
    const model = await this.model(plan);
    const path = `models/${encodeURIComponent(model)}:${stream ? 'streamGenerateContent?alt=sse' : 'generateContent'}`;
    try {
      return await this.call(path, { body: body(model), signal });
    } catch (err) {
      if (err instanceof GeminiHttpError && err.status === 400 && /thinking/i.test(err.message) && !this.noThinking.has(model)) {
        this.noThinking.add(model);
        return await this.call(path, { body: body(model), signal });
      }
      if (err instanceof GeminiHttpError && err.status === 404) this.forget(plan);
      throw err;
    }
  }

  private contents(turns: ChatTurn[], media: Media[]): Content[] {
    const contents: Content[] = turns.map((t) => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.content }] }));
    const last = contents[contents.length - 1];
    if (last && media.length) last.parts = [...media.map((m) => ({ inlineData: { mimeType: m.mime, data: toBase64(m.bytes) } })), ...last.parts];
    return contents;
  }

  async chat(o: { plan: AiPlanId; system: string; turns: ChatTurn[]; media: Media[]; signal: AbortSignal; onDelta: (d: string) => void }) {
    const deadline = new AbortController();
    const timer = setTimeout(() => deadline.abort(), this.opts.deadlineMs ?? 25_000);
    const signal = AbortSignal.any([o.signal, deadline.signal]);
    const contents = this.contents(o.turns, o.media);
    let text = '';
    let finish: string | undefined;
    try {
      const res = await this.generate(
        o.plan,
        true,
        (model) => ({ contents, systemInstruction: { parts: [{ text: o.system }] }, generationConfig: this.config(model, o.plan, ANSWER_TOKENS[o.plan]) }),
        signal,
      );
      const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += value;
        const events = buf.split(/\r?\n\r?\n/);
        buf = events.pop() ?? '';
        for (const ev of events) {
          const data = ev
            .split(/\r?\n/)
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).trim())
            .join('');
          if (!data) continue;
          const chunk = JSON.parse(data) as GenerateResponse;
          if (chunk.promptFeedback?.blockReason) throw refused();
          const t = textOf(chunk);
          if (t) {
            text += t;
            o.onDelta(t);
          }
          finish = chunk.candidates?.[0]?.finishReason ?? finish;
        }
      }
    } catch (err) {
      if (o.signal.aborted) return { text, truncated: false, aborted: true };
      if (deadline.signal.aborted && text) return { text, truncated: true, aborted: false };
      if (deadline.signal.aborted) throw new CoreError(504, 'A IA demorou demasiado a responder. Tenta uma pergunta mais curta.', 'ai_timeout');
      throw toCoreError(err);
    } finally {
      clearTimeout(timer);
    }
    if (!text && finish && finish !== 'STOP') throw finish === 'MAX_TOKENS' ? tooLong() : refused();
    return { text, truncated: finish === 'MAX_TOKENS', aborted: false };
  }

  private async once(plan: AiPlanId, system: string, prompt: string, json: boolean, media: Media[] = []): Promise<string> {
    const parts: Part[] = [...media.map((m) => ({ inlineData: { mimeType: m.mime, data: toBase64(m.bytes) } })), { text: prompt }];
    try {
      const res = await this.generate(
        plan,
        false,
        (model) => ({
          contents: [{ role: 'user', parts }],
          systemInstruction: { parts: [{ text: system }] },
          generationConfig: this.config(model, plan, json ? 8192 : ANSWER_TOKENS[plan], json ? { responseMimeType: 'application/json' } : {}),
        }),
        AbortSignal.timeout(this.opts.deadlineMs ?? 25_000),
      );
      const data = (await res.json()) as GenerateResponse;
      if (data.promptFeedback?.blockReason) throw refused();
      const text = textOf(data);
      if (!text) throw data.candidates?.[0]?.finishReason === 'MAX_TOKENS' ? tooLong() : refused();
      return text;
    } catch (err) {
      throw toCoreError(err);
    }
  }

  text(plan: AiPlanId, system: string, prompt: string) {
    return this.once(plan, system, prompt, false);
  }

  /** Voz → texto com o modelo mais leve (o Gemini percebe áudio diretamente). */
  async transcribe(audio: Uint8Array, mime: string, signal?: AbortSignal): Promise<string> {
    const limit = AbortSignal.timeout(this.opts.deadlineMs ?? 25_000);
    try {
      const res = await this.generate(
        'claudio-5',
        false,
        (model) => ({
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType: mime, data: toBase64(audio) } },
                { text: 'Transcreve exatamente o que é dito nesta gravação (português de Portugal). Responde só com o texto transcrito, sem comentários. Se não houver fala, não escrevas nada.' },
              ],
            },
          ],
          generationConfig: this.config(model, 'claudio-5', 1024),
        }),
        signal ? AbortSignal.any([signal, limit]) : limit,
      );
      return textOf((await res.json()) as GenerateResponse);
    } catch (err) {
      throw toCoreError(err);
    }
  }

  async json<T>(plan: AiPlanId, system: string, prompt: string, format: string, media: Media[] = []): Promise<T> {
    const raw = await this.once(plan, system, `${prompt}\n\nResponde apenas com JSON neste formato: ${format}`, true, media);
    try {
      return JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')) as T;
    } catch {
      throw new CoreError(502, 'A resposta da IA veio incompleta. Tenta de novo (com menos perguntas, se for um teste).', 'ai_incomplete');
    }
  }
}

const refused = () => new CoreError(422, 'A IA não pode responder a este pedido. Se for uma dúvida de estudo, tenta explicá-la de outra forma.', 'ai_refusal');
const tooLong = () => new CoreError(502, 'A resposta da IA ficou demasiado longa. Tenta dividir a pergunta em partes.', 'ai_incomplete');

function toCoreError(err: unknown): CoreError {
  if (err instanceof CoreError) return err;
  if (err instanceof GeminiHttpError) {
    if (err.status === 429)
      return new CoreError(429, 'A IA gratuita atingiu o limite de pedidos. Espera um minuto e tenta de novo; se continuar, o limite do dia acabou (volta amanhã).', 'ai_rate_limit');
    if (err.status === 401 || err.status === 403 || /API key/i.test(err.message))
      return new CoreError(503, 'A chave do Gemini (GEMINI_API_KEY) não é válida. Confirma-a nas definições do alojamento.', 'ai_auth');
    if (err.status === 404) return new CoreError(503, 'O modelo de IA mudou de nome. Tenta de novo daqui a um momento.', 'ai_model');
    if (err.status === 400) return new CoreError(400, 'A IA não aceitou o pedido (o anexo pode ser grande demais ou de um tipo não suportado).', 'ai_bad_request');
    return new CoreError(503, 'O serviço de IA está temporariamente indisponível. Tenta de novo.', 'ai_unavailable');
  }
  const name = (err as Error)?.name;
  if (name === 'AbortError' || name === 'TimeoutError') return new CoreError(504, 'A IA demorou demasiado a responder. Tenta de novo.', 'ai_timeout');
  console.error('[gemini]', err);
  return new CoreError(503, 'Não foi possível falar com a IA. Tenta de novo.', 'ai_unavailable');
}
