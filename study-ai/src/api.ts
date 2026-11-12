import type { UsageSnapshot } from '../shared/plans';
import type { Attachment, ChatMessage, Conversation } from '../shared/types';
import { DEMO } from './env';

/** Na versão de demonstração (artefacto) os pedidos são respondidos dentro da página. */
async function send(url: string, init: RequestInit): Promise<Response> {
  if (DEMO) {
    const { demoFetch } = await import('./demo/server');
    return demoFetch(url, init);
  }
  return fetch(url, init);
}

let demoUrl: ((id: string) => string | null) | null = null;
if (DEMO) import('./demo/server').then((m) => (demoUrl = m.demoAttachmentUrl));

/** Endereço para mostrar um anexo (imagem ou ficheiro). `null` se já não estiver disponível. */
export function attachmentUrl(id: string): string | null {
  return DEMO ? (demoUrl?.(id) ?? null) : `/api/attachments/${id}`;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, message: string, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

async function parseError(res: Response): Promise<ApiError> {
  let message = 'Ocorreu um erro. Tenta novamente.';
  let code = 'erro';
  try {
    const body = await res.json();
    if (body?.error) message = body.error;
    if (body?.code) code = body.code;
  } catch {
    if (res.status === 502 || res.status === 504) message = 'O servidor não respondeu. Verifica se está a correr.';
  }
  return new ApiError(res.status, message, code);
}

export async function api<T>(path: string, opts: { method?: Method; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  let res: Response;
  try {
    res = await send(`/api${path}`, {
      method: opts.method ?? 'GET',
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'study-ai',
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new ApiError(0, 'Sem ligação ao servidor. Verifica a tua internet.', 'network');
  }
  if (!res.ok) {
    const error = await parseError(res);
    if (res.status === 401 && error.code === 'unauthenticated' && !path.startsWith('/auth/')) onUnauthorized?.();
    throw error;
  }
  return (await res.json()) as T;
}

export async function uploadFile(file: File): Promise<Attachment> {
  const res = await send('/api/uploads', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'study-ai',
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
    },
    body: file,
  });
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { attachment: Attachment };
  return body.attachment;
}

export interface StreamHandlers {
  onStart?: (data: { conversation: Conversation; userMessage: ChatMessage }) => void;
  onDelta?: (text: string) => void;
  onDone?: (data: { message: ChatMessage; usage: UsageSnapshot }) => void;
  onError?: (error: ApiError) => void;
}

/** Envia uma mensagem e lê a resposta em streaming (Server-Sent Events). */
export async function streamChat(
  body: { conversationId: string | null; content: string; attachmentIds: string[]; subject: string | null },
  handlers: StreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await send('/api/chat/send', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'study-ai', 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return;
    handlers.onError?.(new ApiError(0, 'Sem ligação ao servidor. Verifica a tua internet.', 'network'));
    return;
  }
  if (!res.ok || !res.body) {
    const error = await parseError(res);
    if (res.status === 401) onUnauthorized?.();
    handlers.onError?.(error);
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const chunk = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        let event = 'message';
        let data = '';
        for (const line of chunk.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (!data) continue;
        const payload = JSON.parse(data);
        if (event === 'start') handlers.onStart?.(payload);
        else if (event === 'delta') handlers.onDelta?.(payload.text);
        else if (event === 'done') {
          finished = true;
          handlers.onDone?.(payload);
        } else if (event === 'error') {
          finished = true;
          handlers.onError?.(new ApiError(500, payload.message, payload.code ?? 'ai_error'));
        }
      }
    }
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return;
    if (!finished) handlers.onError?.(new ApiError(0, 'A ligação foi interrompida.', 'network'));
    return;
  }
  if (!finished && !signal.aborted) handlers.onError?.(new ApiError(0, 'A ligação foi interrompida.', 'network'));
}
