// «Telemóvel» simulado para os testes dos lembretes: chaves da subscrição e leitura das
// notificações cifradas com uma implementação independente (a do Node), segundo o RFC 8291.
import crypto from 'node:crypto';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { b64url } from '../core/push.ts';

/** Um «telemóvel»: chaves da subscrição e forma de ler as notificações cifradas. */
export function phone(endpoint: string) {
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  const auth = crypto.randomBytes(16);
  return {
    sub: { endpoint, keys: { p256dh: b64url(ecdh.getPublicKey()), auth: b64url(auth) } },
    decrypt(body: Buffer) {
      const salt = body.subarray(0, 16);
      const rs = body.readUInt32BE(16);
      const idlen = body[20]!;
      const asPublic = body.subarray(21, 21 + idlen);
      const cipher = body.subarray(21 + idlen);
      const shared = ecdh.computeSecret(asPublic);
      const info = Buffer.concat([Buffer.from('WebPush: info\0'), ecdh.getPublicKey(), asPublic]);
      const ikm = Buffer.from(crypto.hkdfSync('sha256', shared, auth, info, 32));
      const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16));
      const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12));
      const d = crypto.createDecipheriv('aes-128-gcm', cek, nonce);
      d.setAuthTag(cipher.subarray(cipher.length - 16));
      const plain = Buffer.concat([d.update(cipher.subarray(0, cipher.length - 16)), d.final()]);
      let end = plain.length - 1;
      while (plain[end] === 0) end--;
      if (plain[end] !== 2) throw new Error('delimitador do registo errado');
      return { rs, text: plain.subarray(0, end).toString('utf8') };
    },
  };
}


/** Serviço de notificações simulado: guarda o que recebe; endereços com «apagada» respondem 410. */
export async function startPushServer() {
  const received: { path: string; headers: http.IncomingHttpHeaders; body: Buffer }[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      received.push({ path: req.url ?? '', headers: req.headers, body: Buffer.concat(chunks) });
      res.writeHead(req.url?.includes('apagada') ? 410 : 201).end();
    });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  return { received, url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, close: () => new Promise<void>((r) => server.close(() => r())) };
}
