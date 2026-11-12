// Versão Cloudflare (plano gratuito): Worker + Durable Objects com SQLite.
//
// - Os ficheiros da app (dist/) são servidos diretamente pelo Cloudflare (não gastam pedidos).
// - /api/... passa por este Worker, que trata das contas e das sessões (cookie assinado).
// - Cada estudante tem o seu próprio Durable Object («user:<id>»): guarda os dados numa base
//   SQLite só dele, mantém-nos em memória enquanto está a ser usado e fala com o Gemini.
// - Há também um objeto por email («email:<hash>», liga o email à conta) e um «config».

import { DurableObject } from 'cloudflare:workers';
import { createCore, CoreError, json, type CoreContext, type StoredFile } from '../core/api';
import { GeminiAi } from '../core/gemini';
import { WorkersAi, type AiBinding } from './workers-ai';
import {
  apiPath, badLogin, clearSessionCookie, csrfOk, emailHash, emailTaken, errorResponse, exportData, GUEST_SESSION_DAYS, guestNoPassword,
  isAiPath, MAX_UPLOAD, newPasswordError, notGuest, readCookie, readJson, readSession, registerInput, SESSION_COOKIE, sessionCookie,
  signSession, tooManyAttempts, tooManyGuests, unauthenticated, upgradeInput, validEmail, withHeaders,
} from '../core/host';
import { generateVapidKeys, type VapidKeys } from '../core/push';
import { deliverReminders, localNow } from '../core/reminders';
import { freshState, joinState, splitState, trimState, type UserState } from '../core/state';
import { todayInTimeZone } from '../shared/dates';
import { getDummyHash, hashPassword, RateLimiter, verifyPassword } from '../server/security';

export interface Env {
  ASSETS: Fetcher;
  STORE: DurableObjectNamespace<StudyStore>;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  GEMINI_MODEL_CLAUDIO_5?: string;
  GEMINI_MODEL_CLAUDIO_5_5?: string;
  GEMINI_MODEL_CLAUDIO_6?: string;
  /** Só para testes (simulador do Gemini). */
  GEMINI_BASE_URL?: string;
  /** IA do próprio Cloudflare (Workers AI): usada quando não há GEMINI_API_KEY. */
  AI?: Ai;
  /** Outro modelo do Workers AI (opcional). */
  WORKERS_AI_MODEL?: string;
  SESSION_SECRET?: string;
  APP_TIMEZONE?: string;
  /** Só nos testes: aceitar subscrições de notificações em endereços locais. */
  PUSH_ALLOW_LOCAL?: string;
}

interface Account {
  email: string;
  hash: string;
  tokenVersion: number;
  createdAt: string;
  /** A usar sem conta (sem email nem palavra-passe). */
  guest?: boolean;
}

const CHUNK = 1024 * 1024; // as linhas do SQLite dos Durable Objects vão até 2 MB
const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export class StudyStore extends DurableObject<Env> {
  private sql: SqlStorage;
  private state: UserState | null = null;
  private saved = new Map<string, string>();
  private aiLimiter = new RateLimiter(15, 60 * 1000);
  private core: ReturnType<typeof createCore> | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.createTables();
  }

  private createTables() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS docs (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, meta TEXT NOT NULL, text TEXT, message_id TEXT, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS file_chunks (id TEXT NOT NULL, n INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY (id, n));
    `);
  }

  // ---------- pequenas ajudas ----------

  private getMeta<T>(key: string): T | null {
    const row = this.sql.exec<{ value: string }>('SELECT value FROM meta WHERE key = ?', key).toArray()[0];
    return row ? (JSON.parse(row.value) as T) : null;
  }
  private setMeta(key: string, value: unknown) {
    this.sql.exec('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', key, JSON.stringify(value));
  }

  // ---------- objeto «config» ----------

  /** Segredo das sessões, criado na primeira vez (quando não se define SESSION_SECRET). */
  async secret(): Promise<string> {
    let s = this.getMeta<string>('session-secret');
    if (!s) {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      s = btoa(String.fromCharCode(...bytes));
      this.setMeta('session-secret', s);
    }
    return s;
  }

  /** Chaves VAPID dos lembretes no telemóvel (criadas na primeira vez). */
  async vapid(): Promise<VapidKeys> {
    let k = this.getMeta<VapidKeys>('vapid');
    if (!k) {
      k = await generateVapidKeys();
      if (!this.getMeta('vapid')) this.setMeta('vapid', k);
      k = this.getMeta<VapidKeys>('vapid')!;
    }
    return k;
  }

  // ---------- objeto «push-index»: estudantes com lembretes ligados ----------

  private indexTable() {
    this.sql.exec('CREATE TABLE IF NOT EXISTS push_index (uid TEXT PRIMARY KEY)');
  }
  async pushIndex(uid: string, on: boolean): Promise<void> {
    this.indexTable();
    if (on) this.sql.exec('INSERT OR IGNORE INTO push_index (uid) VALUES (?)', uid);
    else this.sql.exec('DELETE FROM push_index WHERE uid = ?', uid);
  }
  /** Próximo grupo de estudantes (roda pela lista, para caber nos limites de cada execução). */
  async pushBatch(limit: number): Promise<string[]> {
    this.indexTable();
    const cursor = this.getMeta<string>('cursor') ?? '';
    let rows = this.sql.exec<{ uid: string }>('SELECT uid FROM push_index WHERE uid > ? ORDER BY uid LIMIT ?', cursor, limit).toArray();
    if (rows.length < limit && cursor) {
      const more = this.sql.exec<{ uid: string }>('SELECT uid FROM push_index WHERE uid <= ? ORDER BY uid LIMIT ?', cursor, limit - rows.length).toArray();
      rows = [...rows, ...more];
    }
    const last = rows.at(-1)?.uid;
    if (last) this.setMeta('cursor', last);
    return [...new Set(rows.map((r) => r.uid))];
  }

  // ---------- objeto «email:<hash>» ----------

  /** Liga o email a uma conta. Falha se já estiver ligado a outra. */
  async claimEmail(uid: string): Promise<boolean> {
    const cur = this.getMeta<{ uid: string }>('email');
    if (cur && cur.uid !== uid) return false;
    this.setMeta('email', { uid });
    return true;
  }

  async releaseEmail(uid: string): Promise<void> {
    const cur = this.getMeta<{ uid: string }>('email');
    if (cur?.uid === uid) this.sql.exec('DELETE FROM meta WHERE key = ?', 'email');
  }

  /** A conta deste email (sem email registado, faz o mesmo trabalho para não o revelar pelo tempo). */
  async lookupEmail(password: string): Promise<string | null> {
    const cur = this.getMeta<{ uid: string }>('email');
    if (!cur) await verifyPassword(password, await getDummyHash());
    return cur?.uid ?? null;
  }

  // ---------- objeto «user:<id>»: conta ----------

  private account(): Account | null {
    return this.getMeta<Account>('account');
  }

  /** Cria a conta. Sem palavra-passe (`null`) é uma utilização sem conta. */
  async createAccount(input: { uid: string; name: string; email: string; password: string | null }): Promise<void> {
    if (this.account()) throw new Error('conta já existe');
    const guest = input.password === null;
    const hash = guest ? '' : await hashPassword(input.password!);
    this.ctx.storage.transactionSync(() => {
      this.setMeta('account', { email: input.email, hash, tokenVersion: 1, createdAt: new Date().toISOString(), ...(guest ? { guest } : {}) } satisfies Account);
      this.state = freshState({ id: input.uid, name: input.name, email: input.email, guest });
      this.saved.clear();
      this.persist(this.state);
    });
  }

  /** Versão da sessão se a palavra-passe estiver certa. */
  async login(password: string): Promise<number | null> {
    const acc = this.account();
    if (!acc || !(await verifyPassword(password, acc.hash))) return null;
    return acc.tokenVersion;
  }

  /** Se a sessão é válida e se é uma utilização sem conta. */
  async info(version: number): Promise<{ guest: boolean } | null> {
    const acc = this.account();
    return acc && acc.tokenVersion === version ? { guest: !!acc.guest } : null;
  }

  /** Transforma a utilização sem conta numa conta normal (o email já foi reservado pelo Worker). */
  async upgrade(version: number, email: string, password: string): Promise<boolean> {
    const acc = this.account();
    if (!acc || acc.tokenVersion !== version || !acc.guest) return false;
    const hash = await hashPassword(password);
    const now = this.account()!;
    const { guest: _g, ...rest } = now;
    void _g;
    this.setMeta('account', { ...rest, email, hash } satisfies Account);
    await this.context.commit((s) => {
      const { guest: _x, ...user } = s.user;
      void _x;
      s.user = { ...user, email };
    });
    return true;
  }

  async changePassword(version: number, current: string, next: string): Promise<number | null> {
    const acc = this.account();
    if (!acc || acc.tokenVersion !== version || acc.guest || !(await verifyPassword(current, acc.hash))) return null;
    const hash = await hashPassword(next);
    const now = this.account()!;
    const tokenVersion = now.tokenVersion + 1;
    this.setMeta('account', { ...now, hash, tokenVersion });
    return tokenVersion;
  }

  /** Email da conta, se a sessão e a palavra-passe estiverem certas (antes de a apagar). */
  async checkPassword(version: number, password: string): Promise<string | null> {
    const acc = this.account();
    if (!acc || acc.tokenVersion !== version) return null;
    if (acc.guest) return ''; // sem conta não há palavra-passe: basta a sessão deste dispositivo
    if (!(await verifyPassword(password, acc.hash))) return null;
    return acc.email;
  }

  /** Tarefa agendada: envia os lembretes devidos a este estudante. Devolve se ainda tem lembretes. */
  async remindersTick(): Promise<boolean> {
    if (!this.account()) return false;
    try {
      const vapid = await stub(this.env, 'config').vapid();
      const r = await deliverReminders(this.context, vapid, localNow(clean(this.env.APP_TIMEZONE) ?? 'Europe/Lisbon'));
      return r.active;
    } catch (err) {
      console.error('[lembretes]', err);
      return true; // tenta outra vez na próxima execução
    }
  }

  /** Apaga tudo o que este objeto guarda. */
  async wipe(): Promise<void> {
    this.state = null;
    this.saved.clear();
    await this.ctx.storage.deleteAll();
    this.createTables(); // o objeto pode voltar a receber pedidos (ex.: uma sessão antiga)
  }

  // ---------- objeto «user:<id>»: dados do estudante ----------

  private load(): UserState {
    if (this.state) return this.state;
    const docs: Record<string, unknown> = {};
    this.saved.clear();
    for (const row of this.sql.exec<{ key: string; value: string }>('SELECT key, value FROM docs')) {
      docs[row.key] = JSON.parse(row.value);
      this.saved.set(row.key, row.value);
    }
    const s = joinState(docs);
    if (!s) throw new CoreError(401, 'Conta não encontrada. Inicia sessão novamente.', 'unauthenticated');
    this.state = s;
    return s;
  }

  /** Grava só os documentos que mudaram (numa transação). */
  private persist(s: UserState) {
    const docs = splitState(s);
    for (const [key, value] of Object.entries(docs)) {
      const str = JSON.stringify(value);
      if (this.saved.get(key) === str) continue;
      this.sql.exec('INSERT OR REPLACE INTO docs (key, value) VALUES (?, ?)', key, str);
      this.saved.set(key, str);
    }
    for (const key of [...this.saved.keys()]) {
      if (key in docs) continue;
      this.sql.exec('DELETE FROM docs WHERE key = ?', key);
      this.saved.delete(key);
    }
  }

  private context: CoreContext = {
    state: async () => this.load(),
    commit: async (fn) => {
      const s = this.load();
      try {
        return this.ctx.storage.transactionSync(() => {
          const result = fn(s);
          trimState(s);
          s.rev = (s.rev || 0) + 1;
          this.persist(s);
          return result;
        });
      } catch (err) {
        // A memória pode ter ficado a meio: volta a ler da base de dados no próximo pedido.
        this.state = null;
        this.saved.clear();
        throw err;
      }
    },
    files: {
      put: async (f: StoredFile) => {
        this.ctx.storage.transactionSync(() => {
          this.sql.exec(
            'INSERT OR REPLACE INTO files (id, meta, text, message_id, created_at) VALUES (?, ?, ?, ?, ?)',
            f.meta.id, JSON.stringify(f.meta), f.text ?? null, f.messageId ?? null, Date.now(),
          );
          for (let i = 0, n = 0; i < f.bytes.length; i += CHUNK, n++)
            this.sql.exec('INSERT OR REPLACE INTO file_chunks (id, n, data) VALUES (?, ?, ?)', f.meta.id, n, f.bytes.slice(i, i + CHUNK).buffer);
        });
      },
      get: async (id) => {
        const row = this.sql
          .exec<{ meta: string; text: string | null; message_id: string | null }>('SELECT meta, text, message_id FROM files WHERE id = ?', id)
          .toArray()[0];
        if (!row) return null;
        const chunks = this.sql.exec<{ data: ArrayBuffer }>('SELECT data FROM file_chunks WHERE id = ? ORDER BY n', id).toArray();
        const bytes = new Uint8Array(chunks.reduce((t, c) => t + c.data.byteLength, 0));
        let at = 0;
        for (const c of chunks) {
          bytes.set(new Uint8Array(c.data), at);
          at += c.data.byteLength;
        }
        return {
          meta: JSON.parse(row.meta),
          bytes,
          ...(row.text !== null ? { text: row.text } : {}),
          ...(row.message_id ? { messageId: row.message_id } : {}),
        };
      },
      setMessage: async (id, messageId) => {
        this.sql.exec('UPDATE files SET message_id = ? WHERE id = ?', messageId ?? null, id);
      },
      remove: async (id) => {
        this.sql.exec('DELETE FROM file_chunks WHERE id = ?', id);
        this.sql.exec('DELETE FROM files WHERE id = ?', id);
      },
    },
  };

  /** Apaga anexos carregados mas nunca enviados, com mais de um dia. */
  private cleanupFiles() {
    const old = this.sql
      .exec<{ id: string }>('SELECT id FROM files WHERE message_id IS NULL AND created_at < ?', Date.now() - 86_400_000)
      .toArray();
    for (const { id } of old) {
      this.sql.exec('DELETE FROM file_chunks WHERE id = ?', id);
      this.sql.exec('DELETE FROM files WHERE id = ?', id);
    }
  }

  private getCore() {
    const env = this.env;
    // Com GEMINI_API_KEY usa o Gemini; sem ela, a IA do próprio Cloudflare (não precisa de chave).
    const geminiKey = clean(env.GEMINI_API_KEY);
    this.core ??= createCore({
      ai: !geminiKey && env.AI ? new WorkersAi(env.AI as unknown as AiBinding, { model: clean(env.WORKERS_AI_MODEL) }) : new GeminiAi({
        apiKey: geminiKey,
        baseUrl: clean(env.GEMINI_BASE_URL),
        model: clean(env.GEMINI_MODEL),
        models: { 'claudio-5': clean(env.GEMINI_MODEL_CLAUDIO_5), 'claudio-5-5': clean(env.GEMINI_MODEL_CLAUDIO_5_5), 'claudio-6': clean(env.GEMINI_MODEL_CLAUDIO_6) },
        // No Cloudflare não há o limite de 30 s do Netlify: a IA pode pensar mais nos planos superiores.
        deadlineMs: 120_000,
        thinking: { 'claudio-5': 0, 'claudio-5-5': 2048, 'claudio-6': 8192 },
        where: 'no Cloudflare (Settings → Variables and Secrets)',
      }),
      today: () => todayInTimeZone(clean(env.APP_TIMEZONE) ?? 'Europe/Lisbon'),
      maxImageBytes: MAX_UPLOAD,
      maxPdfBytes: MAX_UPLOAD,
      push: {
        vapid: () => stub(env, 'config').vapid(),
        index: (uid, on) => stub(env, 'push-index').pushIndex(uid, on),
        allowLocal: clean(env.PUSH_ALLOW_LOCAL) === '1',
      },
    });
    return this.core;
  }

  /** Pedidos da app, já autenticados pelo Worker (que indica a versão da sessão). */
  async fetch(req: Request): Promise<Response> {
    try {
      const acc = this.account();
      if (!acc || acc.tokenVersion !== Number(req.headers.get('x-study-version'))) return withHeaders(unauthenticated());
      const url = new URL(req.url);
      const path = apiPath(url);
      const method = req.method.toUpperCase();
      if (method === 'GET' && path === '/account/export') return exportData(this.load());
      if (isAiPath(path) && !this.aiLimiter.take('ai'))
        return withHeaders(json({ error: 'Estás a fazer pedidos muito depressa. Espera um pouco.', code: 'rate_limited' }, 429));
      let body: unknown = null;
      if (method === 'POST' && (path === '/uploads' || path === '/transcribe')) {
        const buf = new Uint8Array(await req.arrayBuffer());
        if (buf.length > MAX_UPLOAD) return withHeaders(json({ error: 'O ficheiro é maior do que 4 MB.', code: 'too_large' }, 413));
        body = buf;
        if (path === '/uploads') this.cleanupFiles();
      } else if (!['GET', 'HEAD', 'DELETE'].includes(method)) body = await readJson(req);
      const res = await this.getCore().handle({ method, path, query: url.searchParams, body, headers: req.headers, signal: req.signal }, this.context);
      return withHeaders(res ?? json({ error: 'Endereço não encontrado.', code: 'not_found' }, 404));
    } catch (err) {
      return errorResponse(err);
    }
  }
}

// ---------- Worker: contas, sessões e encaminhamento ----------

const authLimiter = new RateLimiter(10, 15 * 60 * 1000);
const ipLimiter = new RateLimiter(60, 15 * 60 * 1000);
const guestLimiter = new RateLimiter(5, 60 * 60 * 1000);
let secretCache: { key: string; value: Promise<Buffer> } | null = null;

const stub = (env: Env, name: string) => env.STORE.get(env.STORE.idFromName(name));

function getSecret(env: Env): Promise<Buffer> {
  const configured = clean(env.SESSION_SECRET);
  const key = configured ?? 'auto';
  if (secretCache?.key !== key) {
    const value = configured
      ? Promise.resolve(Buffer.from(configured))
      : stub(env, 'config')
          .secret()
          .then((s) => Buffer.from(s, 'base64'));
    value.catch(() => (secretCache = null));
    secretCache = { key, value };
  }
  return secretCache.value;
}

/** Envia o pedido ao objeto do estudante, indicando quem é e a versão da sessão. */
function forward(env: Env, req: Request, uid: string, version: number, override?: { method: string; path: string }) {
  const headers = new Headers(req.headers);
  headers.set('x-study-version', String(version));
  const target = override ? new Request(new URL(`/api${override.path}`, req.url), { method: override.method, headers }) : new Request(req, { headers });
  return stub(env, `user:${uid}`).fetch(target);
}

async function api(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = apiPath(url);
  const method = req.method.toUpperCase();
  const secure = url.protocol === 'https:';
  const ip = req.headers.get('cf-connecting-ip') ?? 'local';
  if (!csrfOk(req)) return json({ error: 'Pedido recusado.', code: 'csrf' }, 403);
  const limit = (key: string) => {
    if (!ipLimiter.take(ip) || !authLimiter.take(`${ip}|${key}`)) throw tooManyAttempts();
  };

  if (method === 'POST' && path === '/auth/register') {
    const input = registerInput(await readJson(req));
    if (input instanceof Response) return input;
    limit(input.email);
    const uid = crypto.randomUUID();
    const user = stub(env, `user:${uid}`);
    await user.createAccount({ uid, ...input });
    if (!(await stub(env, `email:${emailHash(input.email)}`).claimEmail(uid))) {
      await user.wipe();
      return emailTaken();
    }
    const { token, exp } = signSession(await getSecret(env), uid, 1);
    const me = await forward(env, req, uid, 1, { method: 'GET', path: '/me' });
    return withHeaders(new Response(me.body, { status: 201, headers: me.headers }), { 'Set-Cookie': sessionCookie(token, exp, secure) });
  }
  if (method === 'POST' && path === '/auth/login') {
    const b = await readJson(req);
    const email = String(b?.email ?? '').trim().toLowerCase();
    const password = String(b?.password ?? '');
    limit(email);
    if (!validEmail(email)) return badLogin();
    const uid = await stub(env, `email:${emailHash(email)}`).lookupEmail(password);
    const version = uid ? await stub(env, `user:${uid}`).login(password) : null;
    if (!uid || version === null) return badLogin();
    const { token, exp } = signSession(await getSecret(env), uid, version);
    return withHeaders(await forward(env, req, uid, version, { method: 'GET', path: '/me' }), { 'Set-Cookie': sessionCookie(token, exp, secure) });
  }
  if (method === 'POST' && path === '/auth/guest') {
    // Usar sem conta: conta anónima só com a sessão deste dispositivo (pode virar conta normal depois).
    if (!guestLimiter.take(ip)) throw tooManyGuests();
    const uid = crypto.randomUUID();
    await stub(env, `user:${uid}`).createAccount({ uid, name: '', email: '', password: null });
    const { token, exp } = signSession(await getSecret(env), uid, 1, GUEST_SESSION_DAYS);
    const me = await forward(env, req, uid, 1, { method: 'GET', path: '/me' });
    return withHeaders(new Response(me.body, { status: 201, headers: me.headers }), { 'Set-Cookie': sessionCookie(token, exp, secure) });
  }
  if (method === 'POST' && path === '/auth/logout') return withHeaders(json({ ok: true }), { 'Set-Cookie': clearSessionCookie });

  const session = readSession(await getSecret(env), readCookie(req, SESSION_COOKIE));
  if (!session) {
    if (path === '/health') return json({ ok: true, app: 'STUDY AI', ai: !!clean(env.GEMINI_API_KEY) || !!env.AI });
    return withHeaders(unauthenticated());
  }
  const { uid, version } = session;

  if (method === 'POST' && path === '/auth/upgrade') {
    const input = upgradeInput(await readJson(req));
    if (input instanceof Response) return input;
    limit(input.email);
    const user = stub(env, `user:${uid}`);
    const info = await user.info(version);
    if (!info) return withHeaders(unauthenticated());
    if (!info.guest) return notGuest();
    const emailStub = stub(env, `email:${emailHash(input.email)}`);
    if (!(await emailStub.claimEmail(uid))) return emailTaken();
    if (!(await user.upgrade(version, input.email, input.password))) {
      await emailStub.releaseEmail(uid);
      return notGuest();
    }
    const { token, exp } = signSession(await getSecret(env), uid, version);
    return withHeaders(await forward(env, req, uid, version, { method: 'GET', path: '/me' }), { 'Set-Cookie': sessionCookie(token, exp, secure) });
  }
  if (method === 'POST' && path === '/auth/password') {
    const b = await readJson(req);
    limit(uid);
    if ((await stub(env, `user:${uid}`).info(version))?.guest) return guestNoPassword();
    const next = String(b?.next ?? '');
    const invalid = newPasswordError(next);
    if (invalid) return invalid;
    const newVersion = await stub(env, `user:${uid}`).changePassword(version, String(b?.current ?? ''), next);
    if (newVersion === null) return json({ error: 'A palavra-passe atual não está correta.', code: 'bad_credentials' }, 400);
    const { token, exp } = signSession(await getSecret(env), uid, newVersion);
    return withHeaders(json({ ok: true }), { 'Set-Cookie': sessionCookie(token, exp, secure) });
  }
  if (method === 'DELETE' && path === '/account') {
    const b = await readJson(req);
    limit(uid);
    const user = stub(env, `user:${uid}`);
    const email = await user.checkPassword(version, String(b?.password ?? ''));
    if (email === null) return json({ error: 'A palavra-passe não está correta.', code: 'bad_credentials' }, 400);
    // Primeiro o email (deixa de dar para entrar), depois os dados.
    if (email) await stub(env, `email:${emailHash(email)}`).releaseEmail(uid);
    await user.wipe();
    return withHeaders(json({ ok: true }), { 'Set-Cookie': clearSessionCookie });
  }

  return forward(env, req, uid, version);
}

/** Tarefa agendada (a cada 5 minutos): lembretes de um grupo de estudantes de cada vez. */
async function runReminders(env: Env) {
  const index = stub(env, 'push-index');
  const uids = await index.pushBatch(40); // cada execução gratuita tem um limite de pedidos
  for (let i = 0; i < uids.length; i += 8) {
    await Promise.all(
      uids.slice(i, i + 8).map(async (uid) => {
        const active = await stub(env, `user:${uid}`).remindersTick().catch(() => true);
        if (!active) await index.pushIndex(uid, false);
      }),
    );
  }
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runReminders(env));
  },
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    try {
      return withHeaders(await api(req, env));
    } catch (err) {
      return errorResponse(err);
    }
  },
} satisfies ExportedHandler<Env>;
