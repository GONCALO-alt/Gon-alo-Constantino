// IA da versão Cloudflare sem chave nenhuma: Workers AI (modelos abertos nos servidores do
// Cloudflare, com um limite diário gratuito na própria conta). É usada quando não há GEMINI_API_KEY.

import { CoreError, type ChatTurn, type CoreAi, type Media } from '../core/api';
import type { AiPlanId } from '../shared/plans';
import type { AiStatus } from '../shared/types';

/** O que este ficheiro usa da associação `AI` do Cloudflare (permite testá-lo com um falso). */
export interface AiBinding {
  run(model: string, inputs: Record<string, unknown>, options?: { signal?: AbortSignal }): Promise<unknown>;
  toMarkdown(file: { name: string; blob: Blob }): Promise<{ format: string; data?: string; error?: string }>;
}

/** Llama 4 Scout: multilingue (português incluído), lê imagens e tem contexto grande. */
export const DEFAULT_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';
/** Voz → texto (Whisper, com português). */
export const SPEECH_MODEL = '@cf/openai/whisper-large-v3-turbo';

/** Tamanho máximo das respostas de cada plano (o limite gratuito conta por palavras geradas). */
const MAX_TOKENS: Record<AiPlanId, number> = { 'claudio-5': 1536, 'claudio-5-5': 3072, 'claudio-6': 4096 };
const IMAGES = ['image/jpeg', 'image/png', 'image/webp'];
const NOTICE =
  'A IA é um modelo aberto (Llama 4) a correr no Cloudflare, com um limite diário gratuito. Pode errar e não escrevas dados pessoais.';

type Message = { role: string; content: string | { type: string; text?: string; image_url?: { url: string } }[] };

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

/** Tira o JSON de uma resposta (com ou sem ```json … ```, ou com texto à volta). */
export function extractJson(raw: string): unknown {
  const clean = raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
    throw new Error('sem JSON');
  }
}

export class WorkersAi implements CoreAi {
  private ai: AiBinding;
  private model: string;
  private deadlineMs: number;
  pdf = true;
  vision = true;

  constructor(ai: AiBinding, opts: { model?: string | null; deadlineMs?: number } = {}) {
    this.ai = ai;
    this.model = opts.model || DEFAULT_MODEL;
    this.deadlineMs = opts.deadlineMs ?? 120_000;
  }

  configured() {
    return true;
  }

  status(): AiStatus {
    return { configured: true, message: 'IA ligada.', provider: 'Cloudflare Workers AI', notice: NOTICE, voice: true };
  }

  checkImage(mime: string): string | null {
    return IMAGES.includes(mime) ? null : 'Este tipo de imagem não é aceite pela IA. Usa JPG, PNG ou WEBP.';
  }

  async transcribe(audio: Uint8Array, _mime: string, signal?: AbortSignal): Promise<string> {
    const limit = AbortSignal.timeout(60_000);
    try {
      const r = (await this.ai.run(
        SPEECH_MODEL,
        { audio: toBase64(audio), task: 'transcribe', language: 'pt', vad_filter: true },
        { signal: signal ? AbortSignal.any([signal, limit]) : limit },
      )) as { text?: string };
      return String(r?.text ?? '');
    } catch (err) {
      throw toCoreError(err);
    }
  }

  /** Texto de um PDF (conversão do próprio Cloudflare). */
  private async pdfText(m: Media): Promise<string> {
    let r: { format: string; data?: string; error?: string };
    try {
      r = await this.ai.toMarkdown({ name: m.name || 'ficheiro.pdf', blob: new Blob([m.bytes.slice()], { type: 'application/pdf' }) });
    } catch (err) {
      throw toCoreError(err);
    }
    const text = r.format !== 'error' ? (r.data ?? '').trim() : '';
    if (!text) throw new CoreError(422, `Não consegui ler o texto do PDF «${m.name}». Se for uma digitalização, envia antes fotografias das páginas.`, 'bad_pdf');
    return text;
  }

  private async messages(system: string, turns: ChatTurn[], media: Media[]): Promise<Message[]> {
    const msgs: Message[] = [{ role: 'system', content: system }, ...turns.map((t) => ({ role: t.role, content: t.content }))];
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== 'user' || !media.length) return msgs;
    let text = last.content as string;
    const images: { type: string; image_url: { url: string } }[] = [];
    for (const m of media) {
      if (m.mime === 'application/pdf') text += `\n\n[Conteúdo do PDF «${m.name}»]\n"""\n${(await this.pdfText(m)).slice(0, 60_000)}\n"""`;
      else images.push({ type: 'image_url', image_url: { url: `data:${m.mime};base64,${toBase64(m.bytes)}` } });
    }
    last.content = images.length ? [{ type: 'text', text }, ...images] : text;
    return msgs;
  }

  async chat(o: { plan: AiPlanId; system: string; turns: ChatTurn[]; media: Media[]; signal: AbortSignal; onDelta: (d: string) => void }) {
    const messages = await this.messages(o.system, o.turns, o.media);
    const maxTokens = MAX_TOKENS[o.plan];
    const deadline = new AbortController();
    const timer = setTimeout(() => deadline.abort(), this.deadlineMs);
    const signal = AbortSignal.any([o.signal, deadline.signal]);
    let text = '';
    let completion = 0;
    try {
      const stream = (await this.ai.run(this.model, { messages, max_tokens: maxTokens, stream: true }, { signal })) as ReadableStream;
      const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
      const abort = () => reader.cancel().catch(() => {});
      signal.addEventListener('abort', abort);
      let buf = '';
      let done = false;
      while (!done) {
        const r = await reader.read();
        if (r.done) break;
        buf += r.value;
        const events = buf.split(/\r?\n\r?\n/);
        buf = events.pop() ?? '';
        for (const ev of events) {
          const data = ev
            .split(/\r?\n/)
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).trim())
            .join('');
          if (!data) continue;
          if (data === '[DONE]') {
            done = true;
            break;
          }
          const chunk = JSON.parse(data) as { response?: unknown; usage?: { completion_tokens?: number } };
          if (typeof chunk.response === 'string' && chunk.response) {
            text += chunk.response;
            o.onDelta(chunk.response);
          }
          if (chunk.usage?.completion_tokens) completion = chunk.usage.completion_tokens;
        }
      }
      signal.removeEventListener('abort', abort);
      if (signal.aborted) throw new DOMException('cancelado', 'AbortError');
    } catch (err) {
      if (o.signal.aborted) return { text, truncated: false, aborted: true };
      if (deadline.signal.aborted && text) return { text, truncated: true, aborted: false };
      if (deadline.signal.aborted) throw new CoreError(504, 'A IA demorou demasiado a responder. Tenta uma pergunta mais curta.', 'ai_timeout');
      throw toCoreError(err);
    } finally {
      clearTimeout(timer);
    }
    if (!text.trim()) throw new CoreError(502, 'A IA não respondeu. Tenta de novo.', 'ai_empty');
    return { text, truncated: completion >= maxTokens, aborted: false };
  }

  private async once(plan: AiPlanId, system: string, prompt: string, extra: Record<string, unknown> = {}, media: Media[] = []): Promise<unknown> {
    const images = media.filter((m) => m.mime.startsWith('image/'));
    const user = images.length
      ? [{ type: 'text', text: prompt }, ...images.map((m) => ({ type: 'image_url', image_url: { url: `data:${m.mime};base64,${toBase64(m.bytes)}` } }))]
      : prompt;
    const r = (await this.ai.run(
      this.model,
      { messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: extra.response_format ? 6144 : MAX_TOKENS[plan], ...extra },
      { signal: AbortSignal.timeout(this.deadlineMs) },
    )) as { response?: unknown };
    return r?.response;
  }

  async text(plan: AiPlanId, system: string, prompt: string) {
    try {
      const response = await this.once(plan, system, prompt);
      if (typeof response !== 'string' || !response.trim()) throw new CoreError(502, 'A IA não respondeu. Tenta de novo.', 'ai_empty');
      return response;
    } catch (err) {
      throw toCoreError(err);
    }
  }

  async json<T>(plan: AiPlanId, system: string, prompt: string, format: string, media: Media[] = []): Promise<T> {
    const full = `${prompt}\n\nResponde apenas com JSON válido neste formato (sem texto antes nem depois): ${format}`;
    let response: unknown;
    try {
      try {
        response = await this.once(plan, system, full, { response_format: { type: 'json_object' } }, media);
      } catch (err) {
        if (isLimit(err) || (err as Error)?.name === 'TimeoutError') throw err;
        response = await this.once(plan, system, full, {}, media); // modelo sem modo JSON: pede só por texto
      }
    } catch (err) {
      throw toCoreError(err);
    }
    if (response && typeof response === 'object') return response as T;
    try {
      return extractJson(String(response ?? '')) as T;
    } catch {
      throw new CoreError(502, 'A resposta da IA veio incompleta. Tenta de novo (com menos perguntas, se for um teste).', 'ai_incomplete');
    }
  }
}

/** O limite gratuito do dia acabou (ou o serviço está sobrecarregado). */
const isLimit = (err: unknown) => /neuron|daily free|allocation|rate.?limit|too many|capacity|\b429\b|3036|4006|3040/i.test(String((err as Error)?.message ?? err));

function toCoreError(err: unknown): CoreError {
  if (err instanceof CoreError) return err;
  const name = (err as Error)?.name;
  const msg = String((err as Error)?.message ?? err);
  if (name === 'AbortError' || name === 'TimeoutError') return new CoreError(504, 'A IA demorou demasiado a responder. Tenta de novo.', 'ai_timeout');
  if (isLimit(err))
    return new CoreError(429, 'A IA gratuita do Cloudflare atingiu o limite de hoje ou está muito ocupada. Tenta mais tarde (o limite renova todos os dias).', 'ai_rate_limit');
  if (/too (large|long)|context|maximum|exceed/i.test(msg))
    return new CoreError(400, 'A pergunta ou o anexo são grandes demais para a IA. Tenta com menos texto ou uma imagem mais pequena.', 'ai_bad_request');
  console.error('[workers-ai]', err);
  return new CoreError(503, 'A IA do Cloudflare está temporariamente indisponível. Tenta de novo.', 'ai_unavailable');
}
