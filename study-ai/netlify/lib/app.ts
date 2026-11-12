// API da versão Netlify: contas e sessões + o núcleo comum (core/api.ts) com os dados
// de cada estudante no Netlify Blobs e a IA do Gemini.

import crypto from 'node:crypto';
import { createCore, CoreError, json, type CoreAi, type CoreContext, type StoredFile } from '../../core/api';
import {
  apiPath, badLogin, clearSessionCookie, csrfOk, emailHash, emailTaken, errorResponse, exportData, isAiPath, MAX_UPLOAD,
  newPasswordError, readCookie, readJson, readSession, registerInput, SESSION_COOKIE, sessionCookie, signSession, tooManyAttempts,
  unauthenticated, validEmail, withHeaders,
} from '../../core/host';
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

interface Account {
  id: string;
  email: string;
  hash: string;
  tokenVersion: number;
  createdAt: string;
}

const emailKey = (email: string) => `email/${emailHash(email)}`;
const accountKey = (uid: string) => `user/${uid}/account`;
const stateKey = (uid: string) => `user/${uid}/state`;
const fileKey = (uid: string, id: string) => `user/${uid}/files/${id}`;
const fileMetaKey = (uid: string, id: string) => `user/${uid}/filemeta/${id}`;

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
    })().catch((err) => {
      secret = null;
      throw err;
    });
    return secret;
  }

  /** O estudante da sessão, se o cookie for válido e a palavra-passe não tiver mudado entretanto. */
  async function verify(token: string | null): Promise<string | null> {
    const session = readSession(await getSecret(), token);
    if (!session) return null;
    const cached = accountCache.get(session.uid);
    let tokenVersion = cached && Date.now() - cached.at < 60_000 ? cached.tokenVersion : null;
    if (tokenVersion === null) {
      const acc = await kv.getJSON<Account>(accountKey(session.uid));
      if (!acc) return null;
      tokenVersion = acc.data.tokenVersion;
      accountCache.set(session.uid, { at: Date.now(), tokenVersion });
    }
    return session.version === tokenVersion ? session.uid : null;
  }

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

  const me = async (req: Request, uid: string) =>
    (await core.handle({ method: 'GET', path: '/me', query: new URLSearchParams(), body: null, headers: req.headers }, context(uid)))!;

  async function handle(req: Request, info: { ip: string }): Promise<Response> {
    const url = new URL(req.url);
    const path = apiPath(url);
    const method = req.method.toUpperCase();
    const secure = opts.secureCookies ?? url.protocol === 'https:';
    if (!csrfOk(req)) return json({ error: 'Pedido recusado.', code: 'csrf' }, 403);
    const limit = (key: string) => {
      if (!ipLimiter.take(info.ip) || !authLimiter.take(`${info.ip}|${key}`)) throw tooManyAttempts();
    };

    // ---------- contas ----------
    if (method === 'POST' && path === '/auth/register') {
      const input = registerInput(await readJson(req));
      if (input instanceof Response) return input;
      const { email, name, password } = input;
      limit(email);
      const id = crypto.randomUUID();
      if (!(await kv.setJSON(emailKey(email), { id }, { onlyIfNew: true }))) {
        // Pode ser um registo que falhou a meio (email reservado, conta por gravar): nesse caso continua.
        const existing = await kv.getJSON<{ id: string }>(emailKey(email));
        const orphan = existing && !(await kv.getJSON(accountKey(existing.data.id)));
        if (!orphan || !(await kv.setJSON(emailKey(email), { id }, { onlyIfMatch: existing.etag }))) return emailTaken();
      }
      const account: Account = { id, email, hash: await hashPassword(password), tokenVersion: 1, createdAt: new Date().toISOString() };
      await kv.setJSON(stateKey(id), freshState({ id, name, email }));
      await kv.setJSON(accountKey(id), account);
      const { token, exp } = signSession(await getSecret(), id, 1);
      const res = await me(req, id);
      return withHeaders(new Response(res.body, { status: 201, headers: res.headers }), { 'Set-Cookie': sessionCookie(token, exp, secure) });
    }
    if (method === 'POST' && path === '/auth/login') {
      const b = await readJson(req);
      const email = String(b?.email ?? '').trim().toLowerCase();
      const password = String(b?.password ?? '');
      limit(email);
      const idx = validEmail(email) ? await kv.getJSON<{ id: string }>(emailKey(email)) : null;
      const acc = idx ? await kv.getJSON<Account>(accountKey(idx.data.id)) : null;
      const ok = await verifyPassword(password, acc?.data.hash ?? (await getDummyHash()));
      if (!acc || !ok) return badLogin();
      const { token, exp } = signSession(await getSecret(), acc.data.id, acc.data.tokenVersion);
      return withHeaders(await me(req, acc.data.id), { 'Set-Cookie': sessionCookie(token, exp, secure) });
    }
    if (method === 'POST' && path === '/auth/logout') return withHeaders(json({ ok: true }), { 'Set-Cookie': clearSessionCookie });

    const uid = await verify(readCookie(req, SESSION_COOKIE));
    if (!uid) {
      if (path === '/health') return json({ ok: true, ai: opts.ai.configured() });
      return unauthenticated();
    }

    if (method === 'POST' && path === '/auth/password') {
      const b = await readJson(req);
      limit(uid);
      const acc = await kv.getJSON<Account>(accountKey(uid));
      if (!acc || !(await verifyPassword(String(b?.current ?? ''), acc.data.hash)))
        return json({ error: 'A palavra-passe atual não está correta.', code: 'bad_credentials' }, 400);
      const next = String(b?.next ?? '');
      const invalid = newPasswordError(next);
      if (invalid) return invalid;
      const tokenVersion = acc.data.tokenVersion + 1;
      await kv.setJSON(accountKey(uid), { ...acc.data, hash: await hashPassword(next), tokenVersion });
      accountCache.delete(uid);
      const { token, exp } = signSession(await getSecret(), uid, tokenVersion);
      return withHeaders(json({ ok: true }), { 'Set-Cookie': sessionCookie(token, exp, secure) });
    }
    if (method === 'GET' && path === '/account/export') return exportData(await context(uid).state());
    if (method === 'DELETE' && path === '/account') {
      const b = await readJson(req);
      limit(uid);
      const acc = await kv.getJSON<Account>(accountKey(uid));
      if (!acc || !(await verifyPassword(String(b?.password ?? ''), acc.data.hash)))
        return json({ error: 'A palavra-passe não está correta.', code: 'bad_credentials' }, 400);
      await kv.delete(accountKey(uid)); // primeiro a conta: a sessão deixa logo de valer
      for (const key of await kv.list(`user/${uid}/`)) await kv.delete(key);
      await kv.delete(emailKey(acc.data.email));
      accountCache.delete(uid);
      return withHeaders(json({ ok: true }), { 'Set-Cookie': clearSessionCookie });
    }

    // ---------- tudo o resto: núcleo comum ----------
    if (isAiPath(path) && !aiLimiter.take(uid)) return json({ error: 'Estás a fazer pedidos muito depressa. Espera um pouco.', code: 'rate_limited' }, 429);
    let reqBody: unknown = null;
    if (path === '/uploads' && method === 'POST') {
      const buf = new Uint8Array(await req.arrayBuffer());
      if (buf.length > MAX_UPLOAD) return json({ error: 'O ficheiro é maior do que 4 MB.', code: 'too_large' }, 413);
      reqBody = buf;
      cleanupFiles(uid).catch(() => {});
    } else if (!['GET', 'HEAD', 'DELETE'].includes(method)) reqBody = await readJson(req);
    const res = await core.handle({ method, path, query: url.searchParams, body: reqBody, headers: req.headers, signal: req.signal }, context(uid));
    return withHeaders(res ?? json({ error: 'Endereço não encontrado.', code: 'not_found' }, 404));
  }

  return async (req: Request, info: { ip: string }): Promise<Response> => {
    try {
      return withHeaders(await handle(req, info));
    } catch (err) {
      return errorResponse(err);
    }
  };
}
