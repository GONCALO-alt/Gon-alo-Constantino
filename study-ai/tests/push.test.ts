// Lembretes no telemóvel: cifra e assinatura das notificações (verificadas com uma implementação
// independente, a do Node) e envio pela app, com um serviço de notificações simulado.
import crypto from 'node:crypto';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { b64url, encryptPush, fromB64url, generateVapidKeys, vapidAuthorization } from '../core/push.ts';
import { phone } from './fake-push.ts';
import { DEFAULT_REMINDERS, dueReminders, localNow } from '../core/reminders.ts';
import { freshState } from '../core/state.ts';
import { GeminiAi } from '../core/gemini.ts';
import { createApp } from '../netlify/lib/app.ts';
import { memoryKV } from '../netlify/lib/kv.ts';
import { addDays, isoWeekday } from '../shared/dates.ts';

/** Confirma a assinatura VAPID com a chave pública (como faz o serviço de notificações). */
function verifyVapid(header: string, endpoint: string) {
  const m = /^vapid t=([^,]+), k=(.+)$/.exec(header);
  expect(m).not.toBeNull();
  const [h, c, sig] = m![1]!.split('.');
  const raw = fromB64url(m![2]!);
  const key = crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: b64url(raw.subarray(1, 33)), y: b64url(raw.subarray(33, 65)) }, format: 'jwk' });
  const ok = crypto.verify('sha256', Buffer.from(`${h}.${c}`), { key, dsaEncoding: 'ieee-p1363' }, Buffer.from(fromB64url(sig!)));
  expect(ok).toBe(true);
  const claims = JSON.parse(Buffer.from(fromB64url(c!)).toString());
  expect(claims.aud).toBe(new URL(endpoint).origin);
  expect(claims.exp).toBeGreaterThan(Date.now() / 1000);
  return claims;
}

describe('notificações: cifra e assinatura', () => {
  it('o telemóvel consegue ler a notificação cifrada', async () => {
    const p = phone('https://push.exemplo/abc');
    const body = Buffer.from(await encryptPush(new TextEncoder().encode('{"title":"Olá ✅"}'), p.sub));
    expect(p.decrypt(body)).toEqual({ rs: 4096, text: '{"title":"Olá ✅"}' });
  });

  it('a assinatura VAPID é válida para o serviço de notificações', async () => {
    const keys = await generateVapidKeys();
    expect(fromB64url(keys.publicKey)).toHaveLength(65);
    const claims = verifyVapid(await vapidAuthorization('https://web.push.apple.com/abc', keys, 'https://study-ai.exemplo'), 'https://web.push.apple.com/abc');
    expect(claims.sub).toBe('https://study-ai.exemplo');
  });
});

describe('notificações: que lembretes enviar', () => {
  const date = '2026-11-16'; // segunda-feira
  const state = () => {
    const s = freshState({ id: 'u1', name: 'Ana' });
    s.plan = {
      version: 1, generatedAt: '', insights: [], weeklyGoals: [], meta: { startTime: '18:00', dailyMinutes: 60, studyDays: [0] }, settings: { autoRevisions: false },
      sessions: [{ id: 'a', weekday: isoWeekday(date), start: '18:00', minutes: 30, subject: 'matematica', activity: 'exercicios' }],
    };
    s.events = [{ id: 'e1', type: 'teste', subject: 'historia', title: 'Teste de História', date: addDays(date, 1), notes: '' }];
    s.push = { subs: [{ endpoint: 'https://x', keys: { p256dh: 'a', auth: 'b' }, origin: 'https://app', createdAt: '' }], settings: { ...DEFAULT_REMINDERS }, sent: [] };
    return s;
  };

  it('avisa 10 minutos antes da sessão e na véspera do teste, sem repetir', () => {
    const s = state();
    expect(dueReminders(s, { date, minutes: 17 * 60 + 49 })).toEqual([]);
    const at = dueReminders(s, { date, minutes: 17 * 60 + 50 });
    expect(at).toHaveLength(1);
    expect(at[0]!.message.title).toBe('Daqui a 10 min: Matemática');
    expect(at[0]!.message.body).toContain('18:00 · Exercícios');
    s.push!.sent.push(at[0]!.key);
    expect(dueReminders(s, { date, minutes: 17 * 60 + 55 })).toEqual([]);
    const tests = dueReminders(s, { date, minutes: 19 * 60 + 2 });
    expect(tests.map((r) => r.message.title)).toEqual(['Amanhã: Teste de História']);
    expect(tests[0]!.message.url).toBe('/testes?subject=historia');
  });

  it('não avisa sessões já feitas, nem depois de passar meia hora, nem sem subscrições', () => {
    const s = state();
    s.logs = [{ id: 'l', date, subject: 'matematica', minutes: 30, source: 'plano', sessionKey: `${date}:a`, createdAt: '' }];
    expect(dueReminders(s, { date, minutes: 17 * 60 + 50 })).toEqual([]);
    const t = state();
    expect(dueReminders(t, { date, minutes: 18 * 60 + 25 })).toEqual([]);
    t.push!.subs = [];
    expect(dueReminders(t, { date, minutes: 17 * 60 + 50 })).toEqual([]);
  });

  it('calcula a hora local (Lisboa, com hora de verão)', () => {
    expect(localNow('Europe/Lisbon', new Date('2026-07-01T17:30:00Z'))).toEqual({ date: '2026-07-01', minutes: 18 * 60 + 30 });
    expect(localNow('Europe/Lisbon', new Date('2026-12-01T23:30:00Z'))).toEqual({ date: '2026-12-01', minutes: 23 * 60 + 30 });
  });
});

describe('notificações: pela app (Netlify), com um serviço de notificações simulado', () => {
  const received: { path: string; headers: http.IncomingHttpHeaders; body: Buffer }[] = [];
  let server: http.Server;
  let base = '';
  beforeAll(async () => {
    server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        received.push({ path: req.url ?? '', headers: req.headers, body: Buffer.concat(chunks) });
        res.writeHead(req.url?.includes('apagada') ? 410 : 201).end();
      });
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => server.close());

  it('ativa, envia a notificação de teste e os lembretes do plano', async () => {
    const kv = memoryKV();
    const app = createApp({ kv, ai: new GeminiAi({ apiKey: null }), secret: 's', pushAllowLocal: true });
    let cookie = '';
    const call = async (method: string, path: string, body?: unknown) => {
      const res = await app(
        new Request(`https://study-ai.test/api${path}`, {
          method,
          headers: { 'X-Requested-With': 'study-ai', 'Content-Type': 'application/json', Origin: 'https://study-ai.test', ...(cookie ? { Cookie: cookie } : {}) },
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
        { ip: '10.9.0.1' },
      );
      const set = res.headers.get('set-cookie');
      if (set) cookie = set.split(';')[0]!;
      return { status: res.status, data: (await res.json()) as any };
    };
    expect((await call('POST', '/auth/register', { name: 'Ana', email: 'lembretes@exemplo.pt', password: 'palavra-secreta' })).data.features).toContain('push');
    const cfg = await call('GET', '/push/config');
    expect(fromB64url(cfg.data.publicKey)).toHaveLength(65);
    expect(cfg.data.subscribed).toBe(false);

    const p = phone(`${base}/push/telemovel`);
    expect((await call('POST', '/push/subscribe', { subscription: { endpoint: 'http://evil.exemplo/x', keys: p.sub.keys } })).status).toBe(400);
    expect((await call('POST', '/push/subscribe', { subscription: p.sub, settings: { minutesBefore: 0 } })).data.settings.minutesBefore).toBe(0);
    expect(kv.dump().has(`pushidx/${(await call('GET', '/me')).data.user.id}`)).toBe(true);

    // Notificação de teste.
    expect((await call('POST', '/push/test')).data.sent).toBe(1);
    const t = received.at(-1)!;
    expect(t.headers['content-encoding']).toBe('aes128gcm');
    expect(t.headers.ttl).toBe('3600');
    expect(verifyVapid(String(t.headers.authorization), p.sub.endpoint).sub).toBe('https://study-ai.test');
    expect(JSON.parse(p.decrypt(t.body).text)).toMatchObject({ title: 'Lembretes ligados ✅' });

    // Lembrete de uma sessão do plano, à hora certa (a tarefa agendada corre a cada 5 minutos).
    const date = '2026-11-16';
    await call('PUT', '/plan', { sessions: [], weeklyGoals: [] }).catch(() => {});
    await call('PUT', '/profile/questionnaire', {
      questionnaire: { name: 'Ana', year: '8', subjects: ['matematica', 'historia'], customSubjects: {}, difficult: [], easy: [], dailyMinutes: 30, studyDays: [isoWeekday(date)], startTime: '18:00', goal: 'melhorar-notas', styles: ['exercicios'], tests: [] },
    });
    await call('POST', '/events', { type: 'teste', subject: 'historia', title: 'Teste de História', date: addDays(date, 1) });
    const before = received.length;
    expect((await app.reminders({ date, minutes: 18 * 60 + 1 })).sent).toBeGreaterThanOrEqual(1);
    const titles = received.slice(before).map((r) => JSON.parse(p.decrypt(r.body).text).title);
    expect(titles.some((x) => x.startsWith('Hora de estudar'))).toBe(true);
    expect((await app.reminders({ date, minutes: 18 * 60 + 6 })).sent).toBe(0); // não repete
    const atNight = await app.reminders({ date, minutes: 19 * 60 + 3 });
    expect(atNight.sent).toBe(1);
    expect(JSON.parse(p.decrypt(received.at(-1)!.body).text).title).toBe('Amanhã: Teste de História');

    // Uma subscrição que deixou de existir (410) é apagada; sem nenhuma, sai da lista.
    const gone = phone(`${base}/push/apagada`);
    await call('DELETE', '/push/subscribe', { endpoint: p.sub.endpoint });
    await call('POST', '/push/subscribe', { subscription: gone.sub });
    expect((await call('POST', '/push/test')).status).toBe(502);
    expect((await call('GET', '/push/config')).data.subscribed).toBe(false);
    await app.reminders({ date, minutes: 10 });
  });
});
