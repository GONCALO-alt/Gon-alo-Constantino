// API da versão Netlify: contas e sessões + o núcleo comum (core/api.ts) com os dados
// de cada estudante no Netlify Blobs e a IA do Gemini.

import crypto from 'node:crypto';
import { createCore, CoreError, json, type CoreAi, type CoreContext, type StoredFile } from '../../core/api';
import { freshState, trimState, type UserState } from '../../core/state';
import { todayInTimeZone } from '../../shared/dates';
import { getDummyHash, hashPassword, RateLimiter, verifyPassword } from '../../server/security';
import type { KV } from './kv';

export interface AppOptions {
  kv: KV;
  ai: CoreAi;
  /** Segredo das sessões (variável SESSION_SECRET). Se faltar, é criado e guardado no armazenamento. */
  secret?: string | null;
  timeZone?: string;
  /** Cookies `Secure` (https). Desligar só para testes locais em http. */
  secureCookies?: boolean;
}

const COOKIE = 'study_ai_sid';
const SESSION_DAYS = 30;
const MAX_UPLOAD = 4 * 1024 * 1024; // o Netlify limita o tamanho dos pedidos às funções

interface Account {
  id: string;
  email: string;
  hash: string;
  tokenVersion: number;
  createdAt: string;
}

const emailKey = (email: string) => `email/${crypto.createHash('sha256').update(email).digest('hex')}`;
const accountKey = (uid: string) => `user/${uid}/account`;
const stateKey = (uid: string) => `user/${uid}/state`;
const fileKey = (uid: string, id: string) => `user/${uid}/files/${id}`;
const fileMetaKey = (uid: string, id: string) => `user/${uid}/filemeta/${id}`;

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
};

function withHeaders(res: Response, extra: Record<string, string> = {}): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries({ ...SECURITY_HEADERS, ...extra })) headers.set(k, v);
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  return new Response(res.body, { status: res.status, headers });
}

function readCookie(req: Request, name: string): string | null {
  for (const part of (req.headers.get('cookie') ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function createApp(opts: AppOptions) {
  const { kv } = opts;
  const today = () => todayInTimeZone(opts.timeZone ?? 'Europe/Lisbon');
  const core = createCore({ ai: opts.ai, today, maxImageBytes: MAX_UPLOAD, maxPdfBytes: MAX_UPLOAD });
  const authLimiter = new RateLimiter(10, 15 * 60 * 1000);
  const ipLimiter = new RateLimiter(60, 15 * 60 * 1000);
  const aiLimiter = new RateLimiter(15, 60 * 1000);
  let secret: Promise<Buffer> | null = null;
  const accountCache = new Map<string, { at: number; tokenVersion: number }>();

  function getSecret(): Promise<Buffer> {
    secret ??= (async () => {
      if (opts.secret) return Buffer.from(opts.secret);
      const stored = await kv.getJSON<{ value: string }>('config/session-secret');
      if (stored) return Buffer.from(stored.data.value, 'base64');
      const value = crypto.randomBytes(32).toString('base64');
      await kv.setJSON('config/session-secret', { value }, { onlyIfNew: true });
      const again = await kv.getJSON<{ value: string }>('config/session-secret');
      return Buffer.from(again?.data.value ?? value, 'base64');
    })();
    return secret;
  }

  async function sign(uid: string, tokenVersion: number) {
    const exp = Date.now() + SESSION_DAYS * 86_400_000;
    const payload = `${uid}.${tokenVersion}.${exp}`;
    const mac = crypto.createHmac('sha256', await getSecret()).update(payload).digest('base64url');
    return { token: `${payload}.${mac}`, exp };
  }

  /** Sessão: `uid.versão.validade.assinatura`. A versão muda ao trocar a palavra-passe. */
  async function verify(token: string | null): Promise<string | null> {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 4) return null;
    const [uid, version, exp, mac] = parts as [string, string, string, string];
    if (Number(exp) < Date.now()) return null;
    const expected = crypto.createHmac('sha256', await getSecret()).update(`${uid}.${version}.${exp}`).digest();
    const given = Buffer.from(mac, 'base64url');
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
    const cached = accountCache.get(uid);
    let tokenVersion = cached && Date.now() - cached.at < 60_000 ? cached.tokenVersion : null;
    if (tokenVersion === null) {
      const acc = await kv.getJSON<Account>(accountKey(uid));
      if (!acc) return null;
      tokenVersion = acc.data.tokenVersion;
      accountCache.set(uid, { at: Date.now(), tokenVersion });
    }
    return Number(version) === tokenVersion ? uid : null;
  }

  function cookie(token: string, exp: number, secure: boolean) {
    return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(exp).toUTCString()}${secure ? '; Secure' : ''}`;
  }
  const clearCookie = `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  function context(uid: string): CoreContext {
    let cached: { data: UserState; etag: string } | null = null;
    const load = async () => {
      const r = await kv.getJSON<UserState>(stateKey(uid));
      if (!r) throw new CoreError(401, 'Conta não encontrada. Inicia sessão novamente.', 'unauthenticated');
      cached = r;
      return r;
    };
    return {
      async state() {
        return (cached ?? (await load())).data;
      },
      async commit(fn) {
        // Lê a versão mais recente, aplica e grava só se ninguém a mudou entretanto.
        for (let attempt = 0; attempt < 6; attempt++) {
          const current = await load();
          const s = current.data;
          const result = fn(s);
          trimState(s);
          s.rev = (s.rev || 0) + 1;
          if (await kv.setJSON(stateKey(uid), s, { onlyIfMatch: current.etag })) {
            cached = null;
            return result;
          }
          await new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
        }
        throw new CoreError(503, 'Muitas alterações ao mesmo tempo. Tenta de novo.', 'conflict');
      },
      files: {
        async put(f: StoredFile) {
          await kv.setBytes(fileKey(uid, f.meta.id), f.bytes);
          await kv.setJSON(fileMetaKey(uid, f.meta.id), { meta: f.meta, text: f.text ?? null, messageId: f.messageId ?? null, createdAt: Date.now() });
        },
        async get(id) {
          const m = await kv.getJSON<{ meta: StoredFile['meta']; text: string | null; messageId: string | null }>(fileMetaKey(uid, id));
          if (!m) return null;
          const bytes = await kv.getBytes(fileKey(uid, id));
          if (!bytes) return null;
          return { meta: m.data.meta, bytes, ...(m.data.text !== null ? { text: m.data.text } : {}), ...(m.data.messageId ? { messageId: m.data.messageId } : {}) };
        },
        async setMessage(id, messageId) {
          const m = await kv.getJSON<Record<string, unknown>>(fileMetaKey(uid, id));
          if (m) await kv.setJSON(fileMetaKey(uid, id), { ...m.data, messageId: messageId ?? null });
        },
        async remove(id) {
          await kv.delete(fileKey(uid, id));
          await kv.delete(fileMetaKey(uid, id));
        },
      },
    };
  }

  /** Apaga anexos carregados mas nunca enviados, com mais de um dia. */
  async function cleanupFiles(uid: string) {
    const keys = await kv.list(`user/${uid}/filemeta/`);
    for (const key of keys.slice(0, 50)) {
      const m = await kv.getJSON<{ messageId: string | null; createdAt: number }>(key);
      if (m && !m.data.messageId && Date.now() - m.data.createdAt > 86_400_000) {
        const id = key.split('/').pop()!;
        await kv.delete(fileKey(uid, id));
        await kv.delete(key);
      }
    }
  }

  const validEmail = (v: unknown) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) && v.length <= 200;

  async function handle(req: Request, info: { ip: string }): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '') || '/';
    const method = req.method.toUpperCase();
    const secure = opts.secureCookies ?? url.protocol === 'https:';
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && req.headers.get('x-requested-with') !== 'study-ai') {
      return json({ error: 'Pedido recusado.', code: 'csrf' }, 403);
    }
    const limit = (key: string) => {
      if (!ipLimiter.take(info.ip) || !authLimiter.take(`${info.ip}|${key}`))
        throw new CoreError(429, 'Demasiadas tentativas. Espera alguns minutos e tenta novamente.', 'rate_limited');
    };
    const body = async () => {
      try {
        return await req.json();
      } catch {
        return {};
      }
    };

    // ---------- contas ----------
    if (method === 'POST' && path === '/auth/register') {
      const b = await body();
      const email = String(b?.email ?? '').trim().toLowerCase();
      const name = String(b?.name ?? '').trim().slice(0, 60);
      const password = String(b?.password ?? '');
      if (!name) return json({ error: 'Dados inválidos: escreve o teu nome.', code: 'invalid' }, 400);
      if (!validEmail(email)) return json({ error: 'Dados inválidos: email inválido.', code: 'invalid' }, 400);
      if (password.length < 8 || password.length > 200) return json({ error: 'Dados inválidos: a palavra-passe tem de ter pelo menos 8 caracteres.', code: 'invalid' }, 400);
      limit(email);
      const id = crypto.randomUUID();
      if (!(await kv.setJSON(emailKey(email), { id }, { onlyIfNew: true }))) {
        // Pode ser um registo que falhou a meio (email reservado, conta por gravar): nesse caso continua.
        const existing = await kv.getJSON<{ id: string }>(emailKey(email));
        const orphan = existing && !(await kv.getJSON(accountKey(existing.data.id)));
        if (!orphan || !(await kv.setJSON(emailKey(email), { id }, { onlyIfMatch: existing.etag })))
          return json({ error: 'Já existe uma conta com este email. Inicia sessão.', code: 'email_taken' }, 409);
      }
      const account: Account = { id, email, hash: await hashPassword(password), tokenVersion: 1, createdAt: new Date().toISOString() };
      await kv.setJSON(accountKey(id), account);
      await kv.setJSON(stateKey(id), freshState({ id, name, email }));
      const { token, exp } = await sign(id, 1);
      const me = await core.handle({ method: 'GET', path: '/me', query: url.searchParams, body: null, headers: req.headers }, context(id));
      return withHeaders(new Response(me!.body, { status: 201, headers: me!.headers }), { 'Set-Cookie': cookie(token, exp, secure) });
    }
    if (method === 'POST' && path === '/auth/login') {
      const b = await body();
      const email = String(b?.email ?? '').trim().toLowerCase();
      const password = String(b?.password ?? '');
      limit(email);
      const idx = validEmail(email) ? await kv.getJSON<{ id: string }>(emailKey(email)) : null;
      const acc = idx ? await kv.getJSON<Account>(accountKey(idx.data.id)) : null;
      const ok = await verifyPassword(password, acc?.data.hash ?? (await getDummyHash()));
      if (!acc || !ok) return json({ error: 'Email ou palavra-passe incorretos.', code: 'bad_credentials' }, 401);
      const { token, exp } = await sign(acc.data.id, acc.data.tokenVersion);
      const me = await core.handle({ method: 'GET', path: '/me', query: url.searchParams, body: null, headers: req.headers }, context(acc.data.id));
      return withHeaders(me!, { 'Set-Cookie': cookie(token, exp, secure) });
    }
    if (method === 'POST' && path === '/auth/logout') return withHeaders(json({ ok: true }), { 'Set-Cookie': clearCookie });

    const uid = await verify(readCookie(req, COOKIE));
    if (!uid) {
      if (path === '/health') return json({ ok: true, ai: opts.ai.configured() });
      return json({ error: 'Inicia sessão para continuar.', code: 'unauthenticated' }, 401);
    }

    if (method === 'POST' && path === '/auth/password') {
      const b = await body();
      limit(uid);
      const acc = await kv.getJSON<Account>(accountKey(uid));
      if (!acc || !(await verifyPassword(String(b?.current ?? ''), acc.data.hash)))
        return json({ error: 'A palavra-passe atual não está correta.', code: 'bad_credentials' }, 400);
      const next = String(b?.next ?? '');
      if (next.length < 8 || next.length > 200) return json({ error: 'Dados inválidos: a nova palavra-passe tem de ter pelo menos 8 caracteres.', code: 'invalid' }, 400);
      const tokenVersion = acc.data.tokenVersion + 1;
      await kv.setJSON(accountKey(uid), { ...acc.data, hash: await hashPassword(next), tokenVersion });
      accountCache.delete(uid);
      const { token, exp } = await sign(uid, tokenVersion);
      return withHeaders(json({ ok: true }), { 'Set-Cookie': cookie(token, exp, secure) });
    }
    if (method === 'GET' && path === '/account/export') {
      const s = await context(uid).state();
      const { usage: _u, ...data } = s;
      void _u;
      return withHeaders(json({ exportedAt: new Date().toISOString(), ...data }), { 'Content-Disposition': 'attachment; filename="study-ai-dados.json"' });
    }
    if (method === 'DELETE' && path === '/account') {
      const b = await body();
      limit(uid);
      const acc = await kv.getJSON<Account>(accountKey(uid));
      if (!acc || !(await verifyPassword(String(b?.password ?? ''), acc.data.hash)))
        return json({ error: 'A palavra-passe não está correta.', code: 'bad_credentials' }, 400);
      for (const key of await kv.list(`user/${uid}/`)) await kv.delete(key);
      await kv.delete(emailKey(acc.data.email));
      accountCache.delete(uid);
      return withHeaders(json({ ok: true }), { 'Set-Cookie': clearCookie });
    }

    // ---------- tudo o resto: núcleo comum ----------
    const isAi = ['/chat/send', '/summaries/generate', '/decks/generate', '/tests/generate', '/plan/insights'].includes(path) || /^\/tests\/[^/]+\/submit$/.test(path);
    if (isAi && !aiLimiter.take(uid)) return json({ error: 'Estás a fazer pedidos muito depressa. Espera um pouco.', code: 'rate_limited' }, 429);
    let reqBody: unknown = null;
    if (path === '/uploads' && method === 'POST') {
      const buf = new Uint8Array(await req.arrayBuffer());
      if (buf.length > MAX_UPLOAD) return json({ error: 'O ficheiro é maior do que 4 MB.', code: 'too_large' }, 413);
      reqBody = buf;
      cleanupFiles(uid).catch(() => {});
    } else if (!['GET', 'HEAD', 'DELETE'].includes(method)) reqBody = await body();
    const res = await core.handle({ method, path, query: url.searchParams, body: reqBody, headers: req.headers, signal: req.signal }, context(uid));
    return withHeaders(res ?? json({ error: 'Endereço não encontrado.', code: 'not_found' }, 404));
  }

  return async (req: Request, info: { ip: string }): Promise<Response> => {
    try {
      return await handle(req, info);
    } catch (err) {
      if (err instanceof CoreError) return withHeaders(json({ error: err.message, code: err.code }, err.status));
      console.error('[study-ai]', err);
      return withHeaders(json({ error: 'Ocorreu um erro no servidor. Tenta novamente.', code: 'server_error' }, 500));
    }
  };
}
