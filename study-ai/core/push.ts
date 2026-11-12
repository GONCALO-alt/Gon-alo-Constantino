// Notificações Web Push (normas RFC 8291 e RFC 8292), só com WebCrypto: funciona em Node e nos Workers.
// - VAPID: o servidor assina cada envio com uma chave sua (criada uma vez e guardada).
// - O conteúdo vai cifrado (aes128gcm) com as chaves da subscrição do telemóvel.

export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface VapidKeys {
  /** Chave pública (65 bytes, base64url) — é a `applicationServerKey` do navegador. */
  publicKey: string;
  /** Chave privada em JWK. */
  privateJwk: JsonWebKey;
}

export interface PushMessage {
  title: string;
  body: string;
  url: string;
  tag?: string;
}

export type PushResult = 'ok' | 'gone' | 'error';

const enc = new TextEncoder();

export function b64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const concat = (...parts: Uint8Array[]): Uint8Array<ArrayBuffer> => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};

export async function generateVapidKeys(): Promise<VapidKeys> {
  const pair = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])) as CryptoKeyPair;
  const raw = new Uint8Array((await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer);
  const privateJwk = (await crypto.subtle.exportKey('jwk', pair.privateKey)) as JsonWebKey;
  return { publicKey: b64url(raw), privateJwk };
}

/** Cabeçalho Authorization (VAPID): JWT ES256 para o serviço de notificações do telemóvel. */
export async function vapidAuthorization(endpoint: string, keys: VapidKeys, subject: string, now = Date.now()): Promise<string> {
  const header = b64url(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64url(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 3600, sub: subject })));
  const key = await crypto.subtle.importKey('jwk', keys.privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(`${header}.${claims}`)));
  return `vapid t=${header}.${claims}.${b64url(sig)}, k=${keys.publicKey}`;
}

/** Cópia com um ArrayBuffer próprio (os tipos do WebCrypto não aceitam memória partilhada). */
const own = (u: Uint8Array): Uint8Array<ArrayBuffer> => new Uint8Array(u);

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, bytes: number) {
  const key = await crypto.subtle.importKey('raw', own(ikm), 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: own(salt), info: own(info) }, key, bytes * 8));
}

/** Cifra o conteúdo para uma subscrição (Content-Encoding: aes128gcm, RFC 8291). */
export async function encryptPush(payload: Uint8Array, sub: PushSubscriptionData): Promise<Uint8Array<ArrayBuffer>> {
  const uaPublic = fromB64url(sub.keys.p256dh);
  const authSecret = fromB64url(sub.keys.auth);
  const local = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair;
  const asPublic = new Uint8Array((await crypto.subtle.exportKey('raw', local.publicKey)) as ArrayBuffer);
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  // (os tipos do Cloudflare chamam «$public» ao campo «public»; em execução é «public» em todo o lado)
  const ecdh = { name: 'ECDH', public: uaKey } as unknown as Parameters<typeof crypto.subtle.deriveBits>[0];
  const shared = new Uint8Array(await crypto.subtle.deriveBits(ecdh, local.privateKey, 256));
  const ikm = await hkdf(authSecret, shared, concat(enc.encode('WebPush: info\0'), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const record = concat(payload, new Uint8Array([2])); // 0x02: último (e único) registo
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, record));
  const rs = new Uint8Array([0, 0, 16, 0]); // tamanho do registo: 4096
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher);
}

/** Envia uma notificação. 'gone' = a subscrição já não existe (apaga-se). */
export async function sendPush(sub: PushSubscriptionData, message: PushMessage, keys: VapidKeys, subject: string): Promise<PushResult> {
  try {
    const body = await encryptPush(enc.encode(JSON.stringify(message)), sub);
    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        Authorization: await vapidAuthorization(sub.endpoint, keys, subject),
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        TTL: '3600',
        Urgency: 'normal',
        ...(message.tag ? { Topic: message.tag.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) } : {}),
      },
      body,
    });
    if (res.status === 404 || res.status === 410) return 'gone';
    return res.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

/** Só aceita endereços https de serviços de notificações (ou locais, nos testes). */
export function validSubscription(v: unknown, allowLocal = false): PushSubscriptionData | null {
  const s = v as Partial<PushSubscriptionData> | null;
  if (!s || typeof s.endpoint !== 'string' || s.endpoint.length > 1000) return null;
  let url: URL;
  try {
    url = new URL(s.endpoint);
  } catch {
    return null;
  }
  const local = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  if (url.protocol !== 'https:' && !(allowLocal && local)) return null;
  if (local && !allowLocal) return null;
  const p256dh = s.keys?.p256dh;
  const auth = s.keys?.auth;
  if (typeof p256dh !== 'string' || typeof auth !== 'string' || p256dh.length > 200 || auth.length > 100) return null;
  try {
    if (fromB64url(p256dh).length !== 65 || fromB64url(auth).length < 16) return null;
  } catch {
    return null;
  }
  return { endpoint: s.endpoint, keys: { p256dh, auth } };
}
