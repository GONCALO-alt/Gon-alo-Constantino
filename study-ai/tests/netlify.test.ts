// Testes da versão Netlify: função /api com armazenamento em memória e um Gemini falso.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../netlify/lib/app.ts';
import { GeminiAi, pickModel } from '../core/gemini.ts';
import { memoryKV } from '../netlify/lib/kv.ts';
import { startFakeGemini, type FakeGemini } from './fake-gemini.ts';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');

type Handler = ReturnType<typeof createApp>;

class Client {
  cookie = '';
  handler: Handler;
  ip: string;
  constructor(handler: Handler, ip = '10.0.0.1') {
    this.handler = handler;
    this.ip = ip;
  }
  async req(method: string, url: string, body?: unknown, headers: Record<string, string> = {}) {
    const isBuf = Buffer.isBuffer(body);
    const res = await this.handler(
      new Request(`https://study-ai.test/api${url}`, {
        method,
        headers: {
          'X-Requested-With': 'study-ai',
          ...(body !== undefined && !isBuf ? { 'Content-Type': 'application/json' } : {}),
          ...(this.cookie ? { Cookie: this.cookie } : {}),
          ...headers,
        },
        body: body === undefined ? undefined : isBuf ? new Uint8Array(body as Buffer) : JSON.stringify(body),
      }),
      { ip: this.ip },
    );
    const set = res.headers.get('set-cookie');
    if (set) this.cookie = set.split(';')[0]!;
    const type = res.headers.get('content-type') ?? '';
    const data = type.includes('json') ? await res.json() : await res.text();
    return { status: res.status, data: data as any, headers: res.headers };
  }
  get = (u: string) => this.req('GET', u);
  post = (u: string, b?: unknown, h?: Record<string, string>) => this.req('POST', u, b ?? {}, h);
  put = (u: string, b: unknown) => this.req('PUT', u, b);
  del = (u: string, b?: unknown) => this.req('DELETE', u, b);
}

function parseSse(text: string) {
  return text
    .split('\n\n')
    .filter((c) => c.includes('data:'))
    .map((c) => ({ event: c.match(/^event: (.+)$/m)?.[1], data: JSON.parse(c.match(/^data: (.+)$/m)?.[1] ?? 'null') }));
}

const questionnaire = {
  name: 'Ana Silva',
  year: '8',
  subjects: ['portugues', 'matematica', 'ingles', 'historia', 'fisico-quimica'],
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
let kv: ReturnType<typeof memoryKV>;
let app: Handler;
let ipCounter = 0;

/** Pedido ao Gemini cuja última mensagem contém `text`. */
function geminiRequest(text: string) {
  return fake.requests
    .filter((r) => (r.body.contents ?? []).at(-1)?.parts?.some((p: any) => String(p.text ?? '').includes(text)))
    .at(-1)!;
}

beforeAll(async () => {
  fake = await startFakeGemini();
  kv = memoryKV();
  app = createApp({ kv, ai: new GeminiAi({ apiKey: 'chave-de-teste', baseUrl: fake.url }), secret: 'segredo-de-teste' });
});

afterAll(async () => {
  await fake.close();
});

async function newStudent(email: string, handler = app) {
  const c = new Client(handler, `10.1.0.${++ipCounter}`);
  const r = await c.post('/auth/register', { name: 'Ana', email, password: 'palavra-secreta' });
  expect(r.status).toBe(201);
  expect((await c.put('/profile/questionnaire', { questionnaire })).status).toBe(200);
  return c;
}

describe('Netlify: contas', () => {
  it('regista, inicia e termina sessão com cookie assinado', async () => {
    const c = new Client(app);
    const r = await c.post('/auth/register', { name: 'Rui', email: 'Rui@Exemplo.pt', password: 'muitosegura1' });
    expect(r.status).toBe(201);
    expect(r.data.user.email).toBe('rui@exemplo.pt');
    expect(r.headers.get('set-cookie')).toMatch(/HttpOnly; SameSite=Lax; .*Secure/);
    expect((await c.get('/me')).status).toBe(200);

    // Um cookie alterado não serve.
    const forged = new Client(app);
    for (const ch of ['A', 'B', 'C', 'D', 'Q']) {
      forged.cookie = c.cookie.replace(/.$/, ch);
      if (forged.cookie !== c.cookie) expect((await forged.get('/me')).status).toBe(401);
    }

    await c.post('/auth/logout');
    expect((await c.get('/me')).status).toBe(401);
    expect((await new Client(app).post('/auth/login', { email: 'rui@exemplo.pt', password: 'errada123' })).status).toBe(401);
    expect((await c.post('/auth/login', { email: 'RUI@exemplo.pt', password: 'muitosegura1' })).status).toBe(200);
    expect((await c.get('/me')).data.user.name).toBe('Rui');
  });

  it('recusa emails repetidos, palavras-passe curtas e pedidos sem o cabeçalho anti-CSRF', async () => {
    expect((await new Client(app).post('/auth/register', { name: 'X', email: 'dup@exemplo.pt', password: '12345678' })).status).toBe(201);
    expect((await new Client(app).post('/auth/register', { name: 'Y', email: 'dup@exemplo.pt', password: '12345678' })).status).toBe(409);
    expect((await new Client(app).post('/auth/register', { name: 'Y', email: 'curta@exemplo.pt', password: '123' })).status).toBe(400);
    const res = await app(
      new Request('https://study-ai.test/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Z', email: 'csrf@exemplo.pt', password: '12345678' }),
      }),
      { ip: '10.9.9.9' },
    );
    expect(res.status).toBe(403);
  });

  it('não guarda a palavra-passe nem o email em claro nas chaves', async () => {
    await newStudent('privado@exemplo.pt');
    const keys = [...kv.dump().keys()];
    expect(keys.some((k) => k.includes('privado@exemplo.pt'))).toBe(false);
    const values = [...kv.dump().values()].filter((v) => typeof v === 'string').join('\n');
    expect(values).not.toContain('palavra-secreta');
  });

  it('mudar a palavra-passe termina as outras sessões', async () => {
    const a = await newStudent('troca@exemplo.pt');
    const other = new Client(app, '10.2.0.1');
    await other.post('/auth/login', { email: 'troca@exemplo.pt', password: 'palavra-secreta' });
    expect((await other.get('/me')).status).toBe(200);
    expect((await a.post('/auth/password', { current: 'errada', next: 'nova-palavra-1' })).status).toBe(400);
    expect((await a.post('/auth/password', { current: 'palavra-secreta', next: 'nova-palavra-1' })).status).toBe(200);
    expect((await a.get('/me')).status).toBe(200);
    expect((await other.get('/me')).status).toBe(401);
  });

  it('exporta e apaga todos os dados (e o email pode voltar a ser usado)', async () => {
    const c = await newStudent('apagar@exemplo.pt');
    await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'x.png' });
    const exp = await c.get('/account/export');
    expect(exp.data.user.email).toBe('apagar@exemplo.pt');
    expect(JSON.stringify(exp.data)).not.toContain('scrypt$');
    const uid = exp.data.user.id;
    expect((await c.del('/account', { password: 'errada' })).status).toBe(400);
    expect((await c.del('/account', { password: 'palavra-secreta' })).status).toBe(200);
    expect((await c.get('/me')).status).toBe(401);
    expect([...kv.dump().keys()].filter((k) => k.includes(uid))).toEqual([]);
    expect((await new Client(app).post('/auth/register', { name: 'Ana', email: 'apagar@exemplo.pt', password: '12345678' })).status).toBe(201);
  });
});

describe('Netlify: plano e dados', () => {
  it('cria o plano a partir do questionário e isola os dados de cada estudante', async () => {
    const a = await newStudent('plano@exemplo.pt');
    const plan = (await a.get('/plan')).data.plan;
    expect(plan.sessions.length).toBeGreaterThan(0);
    expect((await a.get('/events')).data.events).toHaveLength(1);
    const s = await a.post('/summaries', { subject: 'matematica', title: 'Frações', content: 'Resumo da Ana', source: 'manual' });
    expect(s.status).toBe(201);

    const b = await newStudent('outra@exemplo.pt');
    expect((await b.get('/summaries')).data.summaries).toHaveLength(0);
    expect((await b.put(`/summaries/${s.data.summary.id}`, { subject: null, title: 'x', content: 'y' })).status).toBe(404);
  });

  it('não perde dados com pedidos ao mesmo tempo', async () => {
    const c = await newStudent('pressa@exemplo.pt');
    const results = await Promise.all(
      Array.from({ length: 8 }, (_, i) => c.post('/logs', { date: '2026-11-10', subject: 'matematica', minutes: 10 + i, source: 'timer' })),
    );
    expect(results.every((r) => r.status === 201 || r.status === 200)).toBe(true);
    const stats = await c.get('/stats?date=2026-11-10');
    expect(stats.data.totalMinutes).toBe(8 * 10 + 28);
  });
});

describe('Netlify: IA Gemini', () => {
  it('escolhe automaticamente o modelo Flash mais recente', () => {
    expect(pickModel(['models/gemini-2.0-flash', 'models/gemini-2.5-flash', 'models/gemini-2.5-pro'], false)).toBe('gemini-2.5-flash');
    expect(pickModel(['models/gemini-2.5-flash-lite', 'models/gemini-3-flash-lite'], true)).toBe('gemini-3-flash-lite');
    expect(pickModel(['models/gemini-flash-latest', 'models/gemini-9-flash'], false)).toBe('gemini-flash-latest');
    expect(pickModel(['models/gemini-2.5-flash-preview-tts'], false)).toBeNull();
  });

  it('responde em streaming com o contexto do estudante e guarda o histórico', async () => {
    const c = await newStudent('chat@exemplo.pt');
    const me = await c.get('/me');
    expect(me.data.ai).toMatchObject({ configured: true, provider: 'Google Gemini' });
    expect(me.data.ai.notice).toContain('Google');

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
    const system = sent.body.systemInstruction.parts.map((p: any) => p.text).join('');
    expect(system).toContain('8.º ano');
    expect(system).toContain('Disciplina desta conversa: Matemática');
    expect(sent.body.generationConfig.maxOutputTokens).toBe(2048);
    expect(sent.body.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 0 });

    const conv = events[0]!.data.conversation;
    await c.post('/chat/send', { conversationId: conv.id, content: 'E frações equivalentes?', attachmentIds: [] });
    const again = geminiRequest('E frações equivalentes?');
    expect(again.body.contents.map((x: any) => x.role)).toEqual(['user', 'model', 'user']);
    const history = await c.get(`/conversations/${conv.id}`);
    expect(history.data.messages).toHaveLength(4);
  });

  it('o Cláudio 6 usa o Flash com respostas maiores e aceita PDF', async () => {
    const c = await newStudent('pdf@exemplo.pt');
    await c.put('/profile/ai-plan', { plan: 'claudio-6' });
    const pdf = await c.post('/uploads', PDF, { 'Content-Type': 'application/pdf', 'X-File-Name': 'ficha.pdf' });
    expect(pdf.status).toBe(201);
    const txt = await c.post('/uploads', Buffer.from('Apontamentos de História'), { 'Content-Type': 'text/plain', 'X-File-Name': 'notas.txt' });
    expect(txt.status).toBe(201);
    const r = await c.post('/chat/send', { content: 'Analisa a ficha', attachmentIds: [pdf.data.attachment.id, txt.data.attachment.id] });
    expect(parseSse(r.data).some((e) => e.event === 'done')).toBe(true);
    const sent = geminiRequest('Analisa a ficha');
    expect(sent.path).toContain('/models/gemini-flash-latest:');
    expect(sent.body.generationConfig.maxOutputTokens).toBe(8192 + 2048);
    expect(sent.body.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 2048 });
    const parts = sent.body.contents.at(-1).parts;
    expect(parts.filter((p: any) => p.inlineData?.mimeType === 'application/pdf')).toHaveLength(1);
    expect(parts.some((p: any) => String(p.text).includes('Apontamentos de História'))).toBe(true);

    const file = await c.get(`/attachments/${pdf.data.attachment.id}`);
    expect(file.status).toBe(200);
    const other = await newStudent('outro-pdf@exemplo.pt');
    expect((await other.get(`/attachments/${pdf.data.attachment.id}`)).status).toBe(404);
  });

  it('respeita os limites do Cláudio 5.5 (3 imagens por dia, sem ficheiros)', async () => {
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
    const parts = geminiRequest('Corrige estes exercícios').body.contents.at(-1).parts;
    expect(parts.filter((p: any) => p.inlineData?.mimeType === 'image/png')).toHaveLength(3);
    expect((await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'f4.png' })).status).toBe(429);
    expect((await c.post('/uploads', PDF, { 'Content-Type': 'application/pdf', 'X-File-Name': 'ficha.pdf' })).status).toBe(403);
    expect((await c.post('/uploads', Buffer.from('MZ executável'), { 'Content-Type': 'image/png', 'X-File-Name': 'x.png' })).status).toBe(415);
  });

  it('quando o limite gratuito do Gemini acaba, explica e não conta a pergunta', async () => {
    const c = await newStudent('limite@exemplo.pt');
    fake.failNext = 429;
    const r = await c.post('/chat/send', { content: 'Pergunta sem quota', attachmentIds: [] });
    const err = parseSse(r.data).find((e) => e.event === 'error')!.data;
    expect(err.code).toBe('ai_rate_limit');
    expect(err.message).toContain('limite');
    expect((await c.get('/me')).data.usage.questionsUsed).toBe(0);
    expect((await c.get('/conversations')).data.conversations).toHaveLength(0);
  });

  it('gera testes, flashcards e resumos (com respostas em JSON)', async () => {
    const c = await newStudent('materiais@exemplo.pt');
    const g = await c.post('/tests/generate', { subject: 'matematica', topic: 'Frações', count: 3, difficulty: 'medio', kinds: ['escolha-multipla', 'resposta-curta'] });
    expect(g.status).toBe(201);
    expect(g.data.test.questions).toHaveLength(3);
    const testReq = fake.requests.filter((x) => x.body.generationConfig?.responseMimeType === 'application/json').at(-1)!;
    expect(testReq.path).toContain(':generateContent');
    const s = await c.post(`/tests/${g.data.test.id}/submit`, { answers: [0, 1, 'Representa a mesma parte'] });
    expect(s.status).toBe(200);
    expect(s.data.test.score).toBe(2);

    const d = await c.post('/decks/generate', { subject: 'matematica', topic: 'Frações', count: 6 });
    expect(d.status).toBe(201);
    expect(d.data.deck.cardCount).toBe(2);
    const sum = await c.post('/summaries/generate', { subject: 'matematica', topic: 'Frações' });
    expect(sum.status).toBe(201);
    expect(sum.data.summary.content).toContain('Frações');
  });

  it('corta e guarda a resposta antes do limite de tempo do Netlify', async () => {
    const slowApp = createApp({ kv: memoryKV(), ai: new GeminiAi({ apiKey: 'k', baseUrl: fake.url, deadlineMs: 250 }), secret: 's' });
    const c = await newStudent('lento@exemplo.pt', slowApp);
    fake.reply = 'Uma resposta bastante comprida que chega devagar, pedaço a pedaço, até ao fim.';
    fake.slowMs = 60;
    try {
      const r = await c.post('/chat/send', { content: 'Pergunta lenta', attachmentIds: [] });
      const done = parseSse(r.data).find((e) => e.event === 'done')!.data;
      expect(done.message.content).toContain('A resposta foi cortada');
      expect(done.usage.questionsUsed).toBe(1);
    } finally {
      fake.slowMs = 0;
    }
  });

  it('sem GEMINI_API_KEY diz claramente como ativar a IA', async () => {
    const noAi = createApp({ kv: memoryKV(), ai: new GeminiAi({ apiKey: null }), secret: 's' });
    const c = await newStudent('semia@exemplo.pt', noAi);
    const me = await c.get('/me');
    expect(me.data.ai.configured).toBe(false);
    expect(me.data.ai.message).toContain('GEMINI_API_KEY');
    const r = await c.post('/chat/send', { content: 'Olá', attachmentIds: [] });
    expect(r.status).toBe(503);
    expect(r.data.code).toBe('ai_not_configured');
    // O resto da app continua a funcionar.
    expect((await c.get('/plan')).data.plan.sessions.length).toBeGreaterThan(0);
  });

  it('cria o segredo das sessões quando não é definido', async () => {
    const store = memoryKV();
    const a = createApp({ kv: store, ai: new GeminiAi({ apiKey: null }) });
    const c = new Client(a);
    expect((await c.post('/auth/register', { name: 'S', email: 's@exemplo.pt', password: '12345678' })).status).toBe(201);
    expect(store.dump().has('config/session-secret')).toBe(true);
    // Outra instância da função (mesmo armazenamento) aceita a mesma sessão.
    const b = createApp({ kv: store, ai: new GeminiAi({ apiKey: null }) });
    const same = new Client(b);
    same.cookie = c.cookie;
    expect((await same.get('/me')).status).toBe(200);
  });
});

describe('usar sem conta', () => {
  it('começa sem conta e depois cria a conta sem perder nada', async () => {
    const c = new Client(app, '10.7.0.1');
    const g = await c.post('/auth/guest');
    expect(g.status).toBe(201);
    expect(g.data.user).toMatchObject({ guest: true, email: '' });
    expect(g.data.profile.onboarded).toBe(false);
    expect((await c.put('/profile/questionnaire', { questionnaire })).status).toBe(200);
    expect((await c.get('/plan')).data.plan.sessions.length).toBeGreaterThan(0);
    await c.post('/summaries', { subject: 'matematica', title: 'Feito sem conta', content: 'Resumo', source: 'manual' });
    expect((await c.post('/auth/password', { current: 'x', next: 'nova-palavra-1' })).status).toBe(400);

    expect((await new Client(app, '10.7.0.2').post('/auth/register', { name: 'X', email: 'ocupado-sc@exemplo.pt', password: '12345678' })).status).toBe(201);
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
    const other = new Client(app, '10.7.0.2');
    expect((await other.post('/auth/login', { email: 'sem.conta@exemplo.pt', password: 'palavra-secreta' })).status).toBe(200);
    expect((await other.get('/summaries')).data.summaries.map((s: any) => s.title)).toEqual(['Feito sem conta']);
    expect((await other.get('/me')).data.profile.onboarded).toBe(true);
  });

  it('sem conta, apagar os dados não pede palavra-passe', async () => {
    const c = new Client(app, '10.7.0.1');
    expect((await c.post('/auth/guest')).status).toBe(201);
    expect((await c.del('/account', {})).status).toBe(200);
    expect((await c.get('/me')).status).toBe(401);
  });
});
