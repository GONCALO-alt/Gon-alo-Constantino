// Versão claude.ai (artefacto): os pedidos /api/... são respondidos dentro da página
// pelo núcleo comum (core/api.ts). A IA é o Claude da conta de quem abre a página e os
// dados ficam na área privada dessa pessoa (ou no navegador).

import { createCore, CoreError, json, type CoreContext, type StoredFile } from '../../core/api';
import { freshState, trimState } from '../../core/state';
import { today } from '../../shared/dates';
import { MAX_IMAGE_BYTES } from '../../shared/plans';
import { DemoAi } from './ai';
import { DemoStore } from './store';

const store = new DemoStore();
const ai = new DemoAi();
/** Anexos desta sessão (só na memória: imagens e ficheiros não vão para o armazenamento). */
const files = new Map<string, StoredFile & { url: string }>();

let ready: Promise<void> | null = null;
let viewerName = '';

const fresh = () => freshState({ name: viewerName.split(' ')[0] ?? '' });

function boot(): Promise<void> {
  ready ??= (async () => {
    const host = (window as unknown as { claude?: { use(name: string): Promise<unknown> } }).claude;
    const has = host && typeof host.use === 'function' ? host : null;
    const [db, user] = has
      ? await Promise.all([has.use('db').catch(() => null), has.use('user').catch(() => null), ai.init(has)])
      : [null, null];
    let id: string | null = null;
    if (user) {
      const u = user as { id(): Promise<string | null>; me(): Promise<{ name?: string }> };
      id = await u.id().catch(() => null);
      viewerName = (await u.me().catch(() => null))?.name ?? '';
    }
    await store.init(db as never, id, fresh);
  })();
  return ready;
}

const core = createCore({ ai, today, maxImageBytes: MAX_IMAGE_BYTES, maxPdfBytes: 0 });
core.route('GET', '/demo/info', () => ({ storage: store.kind, viewerName }));
core.route('POST', '/demo/reset', async (r) => {
  for (const f of files.values()) URL.revokeObjectURL(f.url);
  files.clear();
  await store.reset(fresh);
  return core.handle({ ...r, method: 'GET', path: '/me' }, ctx);
});
core.route('POST', '/auth/logout', () => ({ ok: true }));

const ctx: CoreContext = {
  state: async () => store.state,
  async commit(fn) {
    const result = fn(store.state);
    trimState(store.state);
    await store.saveNow();
    return result;
  },
  files: {
    async put(f) {
      files.set(f.meta.id, { ...f, url: URL.createObjectURL(new Blob([f.bytes as BlobPart], { type: f.meta.mime })) });
    },
    async get(id) {
      return files.get(id) ?? null;
    },
    async setMessage(id, messageId) {
      const f = files.get(id);
      if (f) files.set(id, { ...f, ...(messageId ? { messageId } : { messageId: undefined }) });
    },
    async remove(id) {
      const f = files.get(id);
      if (f) URL.revokeObjectURL(f.url);
      files.delete(id);
    },
  },
};

/** Substitui o `fetch` para /api/... na versão claude.ai. */
export async function demoFetch(input: string, init: RequestInit = {}): Promise<Response> {
  await boot();
  const url = new URL(input, 'https://study-ai.local');
  const path = url.pathname.replace(/^\/api/, '');
  const method = (init.method ?? 'GET').toUpperCase();
  let body: unknown = undefined;
  if (typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = undefined;
    }
  } else if (init.body instanceof Blob) body = new Uint8Array(await init.body.arrayBuffer());
  try {
    const res = await core.handle({ method, path, query: url.searchParams, body, headers: new Headers(init.headers), signal: init.signal ?? undefined }, ctx);
    if (res && res.status >= 500 && !res.headers.get('content-type')?.includes('event-stream')) store.logError(`${method} ${path}`, new Error(`HTTP ${res.status}`));
    return res ?? json({ error: 'Endereço não encontrado.', code: 'not_found' }, 404);
  } catch (err) {
    store.logError(`${method} ${path}`, err);
    console.error('[demo]', err);
    const e = err instanceof CoreError ? err : new CoreError(500, `Ocorreu um erro (${(err as Error)?.message ?? 'desconhecido'}). Tenta novamente.`, 'erro');
    return json({ error: e.message, code: e.code }, e.status);
  }
}

/** Erros da página (fora dos pedidos) também ficam registados para diagnóstico. */
export function demoLogError(where: string, err: unknown) {
  if (ready) store.logError(where, err);
}

/** Endereço de um anexo desta sessão (imagens). `null` se já não estiver disponível. */
export function demoAttachmentUrl(id: string): string | null {
  return files.get(id)?.url ?? null;
}
