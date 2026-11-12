// Peças comuns às versões alojadas sem servidor próprio (Netlify e Cloudflare):
// sessões em cookie assinado, validação das contas, cabeçalhos de segurança, erros.

import crypto from 'node:crypto';
import { CoreError, json } from './api';

export const SESSION_COOKIE = 'study_ai_sid';
export const SESSION_DAYS = 30;
/** Sem conta, a sessão é a única forma de voltar aos dados: dura o máximo que os navegadores aceitam. */
export const GUEST_SESSION_DAYS = 400;
/** Tamanho máximo de um anexo. */
export const MAX_UPLOAD = 4 * 1024 * 1024;

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
};

export function withHeaders(res: Response, extra: Record<string, string> = {}): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries({ ...SECURITY_HEADERS, ...extra })) headers.set(k, v);
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  return new Response(res.body, { status: res.status, headers });
}

export function readCookie(req: Request, name: string): string | null {
  for (const part of (req.headers.get('cookie') ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function sessionCookie(token: string, exp: number, secure: boolean) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(exp).toUTCString()}${secure ? '; Secure' : ''}`;
}
export const clearSessionCookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

/** Sessão: `uid.versão.validade.assinatura`. A versão muda ao trocar a palavra-passe. */
export function signSession(secret: Buffer, uid: string, version: number, days = SESSION_DAYS) {
  const exp = Date.now() + days * 86_400_000;
  const payload = `${uid}.${version}.${exp}`;
  const mac = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return { token: `${payload}.${mac}`, exp };
}

/** Confirma a assinatura e a validade. Devolve o estudante e a versão (que ainda tem de ser confirmada). */
export function readSession(secret: Buffer, token: string | null): { uid: string; version: number } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [uid, version, exp, mac] = parts as [string, string, string, string];
  if (!/^[0-9a-f-]{36}$/.test(uid) || !(Number(exp) > Date.now())) return null;
  // Compara o texto exato da assinatura (qualquer letra alterada no cookie invalida a sessão).
  const expected = Buffer.from(crypto.createHmac('sha256', secret).update(`${uid}.${version}.${exp}`).digest('base64url'));
  const given = Buffer.from(mac);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  return { uid, version: Number(version) };
}

export const emailHash = (email: string) => crypto.createHash('sha256').update(email).digest('hex');

export function validEmail(v: unknown): v is string {
  return typeof v === 'string' && v.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/** Dados do registo, já limpos; ou uma resposta de erro. */
export function registerInput(b: any): { email: string; name: string; password: string } | Response {
  const email = String(b?.email ?? '').trim().toLowerCase();
  const name = String(b?.name ?? '').trim().slice(0, 60);
  const password = String(b?.password ?? '');
  if (!name) return json({ error: 'Dados inválidos: escreve o teu nome.', code: 'invalid' }, 400);
  if (!validEmail(email)) return json({ error: 'Dados inválidos: email inválido.', code: 'invalid' }, 400);
  if (password.length < 8 || password.length > 200) return json({ error: 'Dados inválidos: a palavra-passe tem de ter pelo menos 8 caracteres.', code: 'invalid' }, 400);
  return { email, name, password };
}

/** Email e palavra-passe para transformar a utilização sem conta numa conta normal. */
export function upgradeInput(b: any): { email: string; password: string } | Response {
  const email = String(b?.email ?? '').trim().toLowerCase();
  const password = String(b?.password ?? '');
  if (!validEmail(email)) return json({ error: 'Dados inválidos: email inválido.', code: 'invalid' }, 400);
  if (password.length < 8 || password.length > 200) return json({ error: 'Dados inválidos: a palavra-passe tem de ter pelo menos 8 caracteres.', code: 'invalid' }, 400);
  return { email, password };
}

export const notGuest = () => json({ error: 'Esta conta já tem email e palavra-passe.', code: 'not_guest' }, 400);
export const guestNoPassword = () => json({ error: 'Ainda não tens palavra-passe: primeiro cria a conta (email e palavra-passe).', code: 'guest' }, 400);
export const tooManyGuests = () =>
  new CoreError(429, 'Foram criadas muitas utilizações sem conta a partir desta ligação. Espera um pouco ou cria uma conta.', 'rate_limited');

export const newPasswordError = (next: string) =>
  next.length < 8 || next.length > 200 ? json({ error: 'Dados inválidos: a nova palavra-passe tem de ter pelo menos 8 caracteres.', code: 'invalid' }, 400) : null;

export const badLogin = () => json({ error: 'Email ou palavra-passe incorretos.', code: 'bad_credentials' }, 401);
export const emailTaken = () => json({ error: 'Já existe uma conta com este email. Inicia sessão.', code: 'email_taken' }, 409);
export const unauthenticated = () => json({ error: 'Inicia sessão para continuar.', code: 'unauthenticated' }, 401);
export const tooManyAttempts = () => new CoreError(429, 'Demasiadas tentativas. Espera alguns minutos e tenta novamente.', 'rate_limited');

/** Pedidos que usam a IA (têm um limite de ritmo próprio). */
export const isAiPath = (path: string) =>
  ['/chat/send', '/summaries/generate', '/decks/generate', '/tests/generate', '/plan/insights', '/transcribe'].includes(path) || /^\/tests\/[^/]+\/submit$/.test(path);

/** Caminho da API sem o prefixo (/api/..., /.netlify/functions/api/...). */
export const apiPath = (url: URL) => url.pathname.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '') || '/';

/** Os pedidos que alteram dados têm de trazer este cabeçalho (proteção contra CSRF). */
export const csrfOk = (req: Request) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase()) || req.headers.get('x-requested-with') === 'study-ai';

export async function readJson(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

/** Erros conhecidos → resposta JSON; o resto → erro 500 genérico (registado). */
export function errorResponse(err: unknown): Response {
  if (err instanceof CoreError) return withHeaders(json({ error: err.message, code: err.code }, err.status));
  console.error('[study-ai]', err);
  return withHeaders(json({ error: 'Ocorreu um erro no servidor. Tenta novamente.', code: 'server_error' }, 500));
}

/** Dados para exportar (sem os contadores internos). */
export function exportData<T extends { usage: unknown }>(s: T) {
  const { usage: _u, ...data } = s;
  void _u;
  return withHeaders(json({ exportedAt: new Date().toISOString(), ...data }), { 'Content-Disposition': 'attachment; filename="study-ai-dados.json"' });
}
