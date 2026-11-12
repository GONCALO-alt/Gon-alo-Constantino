// Testes da versão Cloudflare: corre o Worker e os Durable Objects no motor do Cloudflare
// (workerd, via `wrangler dev`), com um Gemini falso. Não precisa de conta nem de internet.
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startFakeGemini, type FakeGemini } from './fake-gemini.ts';
import { phone, startPushServer } from './fake-push.ts';
import { localNow } from '../core/reminders.ts';
import { isoWeekday, minutesToTime } from '../shared/dates.ts';

const root = path.resolve(import.meta.dirname, '..');
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
/** PDF com 2,5 MB: obriga a guardar o anexo em vários pedaços. */
const BIG_PDF = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(2_500_000, 0x41), Buffer.from('\n%%EOF')]);

const questionnaire = {
  name: 'Ana Silva',
  year: '8',
  subjects: ['portugues', 'matematica', 'ingles', 'historia'],
  customSubjects: {},
  difficult: ['matematica'],
  easy: ['ingles'],
  dailyMinutes: 60,
  studyDays: [0, 1, 2, 3, 4],
  startTime: '18:00',
  goal: 'preparar-testes',
  styles: ['exercicios', 'resumos'],
  tests: [{ subject: 'matematica', date: '2099-01-10', topic: 'Frações' }],
};

let fake: FakeGemini;
let worker: ChildProcess | null = null;
let base = '';
const persist = fs.mkdtempSync(path.join(os.tmpdir(), 'study-ai-cf-'));

async function startWorker() {
  const port = 9100 + Math.floor(Math.random() * 800);
  const child = spawn(
    process.execPath,
    [path.join(root, 'node_modules/wrangler/bin/wrangler.js'), 'dev', '--env', 'local', '--port', String(port), '--ip', '127.0.0.1', '--persist-to', persist,
      '--var', 'GEMINI_API_KEY:chave-de-teste', '--var', `GEMINI_BASE_URL:${fake.url}`, '--var', 'SESSION_SECRET:segredo-de-teste', '--var', 'PUSH_ALLOW_LOCAL:1',
      '--test-scheduled', '--log-level', 'warn'],
    { cwd: root, env: { ...process.env, STUDY_AI_SKIP_BUILD: '1', WRANGLER_SEND_METRICS: 'false', NO_PROXY: '127.0.0.1,localhost', CI: '1' }, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let log = '';
  child.stdout!.on('data', (d) => (log += d));
  child.stderr!.on('data', (d) => (log += d));
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`${url}/api/health`);
      if (r.status === 401 || r.ok) {
        worker = child;
        base = url;
        return;
      }
    } catch {
      /* ainda a arrancar */
    }
    if (child.exitCode !== null) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  child.kill();
  throw new Error(`wrangler dev não arrancou:\n${log}`);
}

async function stopWorker() {
  if (!worker) return;
  const w = worker;
  worker = null;
  await new Promise<void>((resolve) => {
    w.once('exit', () => resolve());
    w.kill('SIGTERM');
    setTimeout(() => (w.kill('SIGKILL'), resolve()), 5000);
  });
}

class Client {
  cookie = '';
  async req(method: string, url: string, body?: unknown, headers: Record<string, string> = {}) {
    const isBuf = Buffer.isBuffer(body);
    const res = await fetch(`${base}/api${url}`, {
      method,
      headers: {
        'X-Requested-With': 'study-ai',
        ...(body !== undefined && !isBuf ? { 'Content-Type': 'application/json' } : {}),
        ...(this.cookie ? { Cookie: this.cookie } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isBuf ? new Uint8Array(body as Buffer) : JSON.stringify(body),
    });
    const set = res.headers.get('set-cookie');
    if (set) this.cookie = set.split(';')[0]!;
    const type = res.headers.get('content-type') ?? '';
    const data = type.includes('json') ? await res.json() : type.includes('event-stream') || type.startsWith('text') ? await res.text() : Buffer.from(await res.arrayBuffer());
    return { status: res.status, data: data as any, headers: res.headers };
  }
  get = (u: string) => this.req('GET', u);
  post = (u: string, b?: unknown, h?: Record<string, string>) => this.req('POST', u, b ?? {}, h);
  put = (u: string, b: unknown) => this.req('PUT', u, b);
  del = (u: string, b?: unknown) => this.req('DELETE', u, b);
}

const parseSse = (text: string) =>
  text
    .split('\n\n')
    .filter((c) => c.includes('data:'))
    .map((c) => ({ event: c.match(/^event: (.+)$/m)?.[1], data: JSON.parse(c.match(/^data: (.+)$/m)?.[1] ?? 'null') }));

const geminiRequest = (text: string) =>
  fake.requests.filter((r) => (r.body.contents ?? []).at(-1)?.parts?.some((p: any) => String(p.text ?? '').includes(text))).at(-1)!;

async function newStudent(email: string) {
  const c = new Client();
  const r = await c.post('/auth/register', { name: 'Ana', email, password: 'palavra-secreta' });
  expect(r.status).toBe(201);
  expect((await c.put('/profile/questionnaire', { questionnaire })).status).toBe(200);
  return c;
}

beforeAll(async () => {
  fake = await startFakeGemini();
  await startWorker();
}, 90_000);

afterAll(async () => {
  await stopWorker();
  await fake.close();
  fs.rmSync(persist, { recursive: true, force: true });
});

describe('Cloudflare: contas', () => {
  it('regista, inicia e termina sessão; recusa cookies alterados', async () => {
    const c = new Client();
    const r = await c.post('/auth/register', { name: 'Rui', email: 'Rui@Exemplo.pt', password: 'muitosegura1' });
    expect(r.status).toBe(201);
    expect(r.data.user.email).toBe('rui@exemplo.pt');
    expect(r.headers.get('set-cookie')).toMatch(/HttpOnly; SameSite=Lax/);
    expect((await c.get('/me')).status).toBe(200);
    const forged = new Client();
    forged.cookie = c.cookie.replace(/.$/, (ch) => (ch === 'A' ? 'B' : 'A'));
    expect((await forged.get('/me')).status).toBe(401);
    await c.post('/auth/logout');
    expect((await c.get('/me')).status).toBe(401);
    expect((await new Client().post('/auth/login', { email: 'rui@exemplo.pt', password: 'errada123' })).status).toBe(401);
    expect((await new Client().post('/auth/login', { email: 'ninguem@exemplo.pt', password: 'errada123' })).status).toBe(401);
    expect((await c.post('/auth/login', { email: 'RUI@exemplo.pt', password: 'muitosegura1' })).status).toBe(200);
    expect((await c.get('/me')).data.user.name).toBe('Rui');
  });

  it('recusa emails repetidos, palavras-passe curtas e pedidos sem o cabeçalho anti-CSRF', async () => {
    expect((await new Client().post('/auth/register', { name: 'X', email: 'dup@exemplo.pt', password: '12345678' })).status).toBe(201);
    expect((await new Client().post('/auth/register', { name: 'Y', email: 'dup@exemplo.pt', password: '12345678' })).status).toBe(409);
    expect((await new Client().post('/auth/register', { name: 'Y', email: 'curta@exemplo.pt', password: '123' })).status).toBe(400);
    const res = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Z', email: 'csrf@exemplo.pt', password: '12345678' }),
    });
    expect(res.status).toBe(403);
  });

  it('mudar a palavra-passe termina as outras sessões', async () => {
    const a = await newStudent('troca@exemplo.pt');
    const other = new Client();
    await other.post('/auth/login', { email: 'troca@exemplo.pt', password: 'palavra-secreta' });
    expect((await other.get('/me')).status).toBe(200);
    expect((await a.post('/auth/password', { current: 'errada', next: 'nova-palavra-1' })).status).toBe(400);
    expect((await a.post('/auth/password', { current: 'palavra-secreta', next: 'nova-palavra-1' })).status).toBe(200);
    expect((await a.get('/me')).status).toBe(200);
    expect((await other.get('/me')).status).toBe(401);
    expect((await new Client().post('/auth/login', { email: 'troca@exemplo.pt', password: 'nova-palavra-1' })).status).toBe(200);
  });

  it('exporta e apaga a conta (e o email pode voltar a ser usado)', async () => {
    const c = await newStudent('apagar@exemplo.pt');
    const exp = await c.get('/account/export');
    expect(exp.data.user.email).toBe('apagar@exemplo.pt');
    expect(JSON.stringify(exp.data)).not.toContain('scrypt$');
    expect((await c.del('/account', { password: 'errada' })).status).toBe(400);
    const old = c.cookie;
    expect((await c.del('/account', { password: 'palavra-secreta' })).status).toBe(200);
    const stale = new Client();
    stale.cookie = old;
    expect((await stale.get('/me')).status).toBe(401);
    expect((await new Client().post('/auth/login', { email: 'apagar@exemplo.pt', password: 'palavra-secreta' })).status).toBe(401);
    const again = await newStudent('apagar@exemplo.pt');
    expect((await again.get('/summaries')).data.summaries).toHaveLength(0);
  });
});

describe('Cloudflare: plano e dados', () => {
  it('cria o plano, isola os dados e não perde escritas em simultâneo', async () => {
    const a = await newStudent('plano@exemplo.pt');
    expect((await a.get('/plan')).data.plan.sessions.length).toBeGreaterThan(0);
    expect((await a.get('/events')).data.events).toHaveLength(1);
    const s = await a.post('/summaries', { subject: 'matematica', title: 'Frações', content: 'Resumo da Ana', source: 'manual' });
    expect(s.status).toBe(201);
    const b = await newStudent('outra@exemplo.pt');
    expect((await b.get('/summaries')).data.summaries).toHaveLength(0);
    expect((await b.put(`/summaries/${s.data.summary.id}`, { subject: null, title: 'x', content: 'y' })).status).toBe(404);

    const results = await Promise.all(
      Array.from({ length: 8 }, (_, i) => a.post('/logs', { date: '2026-11-10', subject: 'matematica', minutes: 10 + i, source: 'timer' })),
    );
    expect(results.every((r) => r.status === 201)).toBe(true);
    expect((await a.get('/stats?date=2026-11-10')).data.totalMinutes).toBe(8 * 10 + 28);
  });
});

describe('Cloudflare: IA Gemini', () => {
  it('responde em streaming, com o contexto do estudante, e guarda o histórico', async () => {
    const c = await newStudent('chat@exemplo.pt');
    const r = await c.post('/chat/send', { content: 'Explica-me frações', attachmentIds: [], subject: 'matematica' });
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toContain('text/event-stream');
    const events = parseSse(r.data);
    expect(events[0]!.event).toBe('start');
    expect(events.filter((e) => e.event === 'delta').length).toBeGreaterThan(1);
    const done = events.find((e) => e.event === 'done')!.data;
    expect(done.message.content).toBe(fake.reply);
    expect(done.usage.questionsUsed).toBe(1);

    const sent = geminiRequest('Explica-me frações');
    expect(sent.path).toContain('/models/gemini-flash-lite-latest:streamGenerateContent');
    expect(sent.headers['x-goog-api-key']).toBe('chave-de-teste');
    expect(sent.body.systemInstruction.parts[0].text).toContain('Disciplina desta conversa: Matemática');
    expect(sent.body.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 0 });

    const conv = events[0]!.data.conversation;
    await c.post('/chat/send', { conversationId: conv.id, content: 'E frações equivalentes?', attachmentIds: [] });
    expect(geminiRequest('E frações equivalentes?').body.contents.map((x: any) => x.role)).toEqual(['user', 'model', 'user']);
    expect((await c.get(`/conversations/${conv.id}`)).data.messages).toHaveLength(4);
  });

  it('Cláudio 6: pensa mais e lê PDF grandes (guardados em pedaços)', async () => {
    const c = await newStudent('pdf@exemplo.pt');
    await c.put('/profile/ai-plan', { plan: 'claudio-6' });
    const up = await c.post('/uploads', BIG_PDF, { 'Content-Type': 'application/pdf', 'X-File-Name': 'ficha.pdf' });
    expect(up.status).toBe(201);
    const file = await c.get(`/attachments/${up.data.attachment.id}`);
    expect(file.status).toBe(200);
    expect(Buffer.compare(file.data, BIG_PDF)).toBe(0);
    const r = await c.post('/chat/send', { content: 'Analisa a ficha grande', attachmentIds: [up.data.attachment.id] });
    expect(parseSse(r.data).some((e) => e.event === 'done')).toBe(true);
    const sent = geminiRequest('Analisa a ficha grande');
    expect(sent.path).toContain('/models/gemini-flash-latest:');
    expect(sent.body.generationConfig).toMatchObject({ maxOutputTokens: 8192 + 8192, thinkingConfig: { thinkingBudget: 8192 } });
    const pdf = sent.body.contents.at(-1).parts.find((p: any) => p.inlineData);
    expect(Buffer.from(pdf.inlineData.data, 'base64').equals(BIG_PDF)).toBe(true);
    const other = await newStudent('outro-pdf@exemplo.pt');
    expect((await other.get(`/attachments/${up.data.attachment.id}`)).status).toBe(404);
  });

  it('respeita os limites do Cláudio 5.5', async () => {
    const c = await newStudent('img@exemplo.pt');
    await c.put('/profile/ai-plan', { plan: 'claudio-5-5' });
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const up = await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': `f${i}.png` });
      expect(up.status).toBe(201);
      ids.push(up.data.attachment.id);
    }
    const r = await c.post('/chat/send', { content: 'Corrige estes exercícios', attachmentIds: ids });
    expect(parseSse(r.data).find((e) => e.event === 'done')!.data.usage.imagesUsed).toBe(3);
    expect((await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'f4.png' })).status).toBe(429);
    expect((await c.post('/uploads', BIG_PDF.subarray(0, 100), { 'Content-Type': 'application/pdf', 'X-File-Name': 'f.pdf' })).status).toBe(403);
  });

  it('se o modelo não aceitar o controlo do pensamento, repete sem ele', async () => {
    const c = await newStudent('pensar@exemplo.pt');
    fake.rejectThinking = true;
    try {
      const r = await c.post('/chat/send', { content: 'Pergunta sem pensamento', attachmentIds: [] });
      expect(parseSse(r.data).some((e) => e.event === 'done')).toBe(true);
      expect(geminiRequest('Pergunta sem pensamento').body.generationConfig.thinkingConfig).toBeUndefined();
    } finally {
      fake.rejectThinking = false;
    }
  });

  it('quando o limite gratuito do Gemini acaba, explica e não conta a pergunta', async () => {
    const c = await newStudent('limite@exemplo.pt');
    fake.failNext = 429;
    const r = await c.post('/chat/send', { content: 'Pergunta sem quota', attachmentIds: [] });
    expect(parseSse(r.data).find((e) => e.event === 'error')!.data.code).toBe('ai_rate_limit');
    expect((await c.get('/me')).data.usage.questionsUsed).toBe(0);
    expect((await c.get('/conversations')).data.conversations).toHaveLength(0);
  });

  it('gera testes, flashcards e resumos', async () => {
    const c = await newStudent('materiais@exemplo.pt');
    const g = await c.post('/tests/generate', { subject: 'matematica', topic: 'Frações', count: 3, difficulty: 'medio', kinds: ['escolha-multipla', 'resposta-curta'] });
    expect(g.status).toBe(201);
    const s = await c.post(`/tests/${g.data.test.id}/submit`, { answers: [0, 1, 'Representa a mesma parte'] });
    expect(s.data.test.score).toBe(2);
    expect((await c.post('/decks/generate', { subject: 'matematica', topic: 'Frações', count: 6 })).data.deck.cardCount).toBe(2);
    expect((await c.post('/summaries/generate', { subject: 'matematica', topic: 'Frações' })).status).toBe(201);
  });
});

describe('Cloudflare: os dados ficam guardados', () => {
  it('depois de reiniciar, a conta, o plano e as conversas continuam lá', async () => {
    const c = await newStudent('persistente@exemplo.pt');
    await c.post('/summaries', { subject: 'historia', title: 'Descobrimentos', content: 'Resumo', source: 'manual' });
    await c.post('/chat/send', { content: 'Pergunta para guardar', attachmentIds: [] });
    await stopWorker();
    await startWorker();
    const again = new Client();
    expect((await again.post('/auth/login', { email: 'persistente@exemplo.pt', password: 'palavra-secreta' })).status).toBe(200);
    expect((await again.get('/summaries')).data.summaries.map((s: any) => s.title)).toEqual(['Descobrimentos']);
    expect((await again.get('/conversations')).data.conversations).toHaveLength(1);
    expect((await again.get('/plan')).data.plan.sessions.length).toBeGreaterThan(0);
    // A sessão antiga também continua válida (mesmo segredo).
    expect((await c.get('/me')).status).toBe(200);
  }, 90_000);
});

describe('usar sem conta', () => {
  it('começa sem conta e depois cria a conta sem perder nada', async () => {
    const c = new Client();
    const g = await c.post('/auth/guest');
    expect(g.status).toBe(201);
    expect(g.data.user).toMatchObject({ guest: true, email: '' });
    expect(g.data.profile.onboarded).toBe(false);
    expect((await c.put('/profile/questionnaire', { questionnaire })).status).toBe(200);
    expect((await c.get('/plan')).data.plan.sessions.length).toBeGreaterThan(0);
    await c.post('/summaries', { subject: 'matematica', title: 'Feito sem conta', content: 'Resumo', source: 'manual' });
    expect((await c.post('/auth/password', { current: 'x', next: 'nova-palavra-1' })).status).toBe(400);

    expect((await new Client().post('/auth/register', { name: 'X', email: 'ocupado-sc@exemplo.pt', password: '12345678' })).status).toBe(201);
    expect((await c.post('/auth/upgrade', { email: 'ocupado-sc@exemplo.pt', password: 'palavra-secreta' })).status).toBe(409);
    expect((await c.post('/auth/upgrade', { email: 'mau-email', password: 'palavra-secreta' })).status).toBe(400);
    const up = await c.post('/auth/upgrade', { email: 'Sem.Conta@Exemplo.pt', password: 'palavra-secreta' });
    expect(up.status).toBe(200);
    expect(up.data.user.guest).toBeUndefined();
    expect(up.data.user.email).toBe('sem.conta@exemplo.pt');
    expect(up.data.user.name).toBe('Ana Silva');
    expect((await c.get('/me')).status).toBe(200);
    expect((await c.post('/auth/upgrade', { email: 'outro-sc@exemplo.pt', password: 'palavra-secreta' })).status).toBe(400);

    // Noutro dispositivo: entra com o email e encontra tudo.
    const other = new Client();
    expect((await other.post('/auth/login', { email: 'sem.conta@exemplo.pt', password: 'palavra-secreta' })).status).toBe(200);
    expect((await other.get('/summaries')).data.summaries.map((s: any) => s.title)).toEqual(['Feito sem conta']);
    expect((await other.get('/me')).data.profile.onboarded).toBe(true);
  }, 60_000);

  it('sem conta, apagar os dados não pede palavra-passe', async () => {
    const c = new Client();
    expect((await c.post('/auth/guest')).status).toBe(201);
    expect((await c.del('/account', {})).status).toBe(200);
    expect((await c.get('/me')).status).toBe(401);
  });
});

describe('Cloudflare: lembretes no telemóvel', () => {
  it('ativa, envia a notificação de teste e a tarefa agendada avisa da sessão de agora', async () => {
    const push = await startPushServer();
    try {
      const c = await newStudent('lembretes-cf@exemplo.pt');
      expect((await c.get('/me')).data.features).toContain('push');
      const cfg = await c.get('/push/config');
      expect(cfg.data.publicKey).toMatch(/^[A-Za-z0-9_-]{86,88}$/);
      const p = phone(`${push.url}/push/telemovel`);
      expect((await c.post('/push/subscribe', { subscription: p.sub, settings: { minutesBefore: 0 } })).status).toBe(200);
      expect((await c.post('/push/test')).data.sent).toBe(1);
      expect(JSON.parse(p.decrypt(push.received.at(-1)!.body).text).title).toBe('Lembretes ligados ✅');

      // Uma sessão do plano marcada para agora (hora de Lisboa) → a tarefa agendada envia o lembrete.
      const now = localNow('Europe/Lisbon');
      const add = await c.post('/plan/sessions', { weekday: isoWeekday(now.date), start: minutesToTime(now.minutes), minutes: 20, subject: 'matematica', activity: 'exercicios' });
      expect(add.status).toBe(201);
      const before = push.received.length;
      const tick = await fetch(`${base}/__scheduled?cron=${encodeURIComponent('*/5 * * * *')}`);
      expect(tick.ok).toBe(true);
      for (let i = 0; i < 40 && push.received.length === before; i++) await new Promise((r) => setTimeout(r, 150));
      const titles = push.received.slice(before).map((r) => JSON.parse(p.decrypt(r.body).text).title);
      expect(titles).toContain('Hora de estudar: Matemática');

      // Não repete na execução seguinte.
      const again = push.received.length;
      await fetch(`${base}/__scheduled?cron=${encodeURIComponent('*/5 * * * *')}`);
      await new Promise((r) => setTimeout(r, 800));
      expect(push.received.length).toBe(again);
    } finally {
      await push.close();
    }
  }, 60_000);
});
