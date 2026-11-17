// Passes Premium assinados pelo servidor (HMAC-SHA256 com Web Crypto: funciona no Node e no browser).
// Um passe é "dados.assinatura"; ninguém consegue mudar a data de fim sem conhecer o segredo do servidor.

const enc = new TextEncoder();
const b64url = bytes => {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = str => {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, c => c.charCodeAt(0));
};

const keys = new Map();
async function key(secret) {
  if (!keys.has(secret)) {
    keys.set(secret, globalThis.crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']));
  }
  return keys.get(secret);
}

export const DAY = 86_400_000;

export function randomSecret() {
  return b64url(globalThis.crypto.getRandomValues(new Uint8Array(32)));
}

// payload: { kind: 'trial' | 'streak', exp: timestamp }
export async function signPass(secret, payload) {
  const data = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await globalThis.crypto.subtle.sign('HMAC', await key(secret), enc.encode(data));
  return `${data}.${b64url(sig)}`;
}

// Devolve o conteúdo do passe se for válido e ainda não tiver acabado; senão null.
export async function verifyPass(secret, pass, now = Date.now()) {
  if (typeof pass !== 'string' || pass.length > 600) return null;
  const [data, sig] = pass.split('.');
  if (!data || !sig) return null;
  try {
    const ok = await globalThis.crypto.subtle.verify('HMAC', await key(secret), fromB64url(sig), enc.encode(data));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(data)));
    return Number(payload.exp) > now ? payload : null;
  } catch {
    return null;
  }
}
