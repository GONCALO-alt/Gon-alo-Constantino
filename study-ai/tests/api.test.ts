import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp, type App } from '../server/app.ts';
import { startFakeAnthropic, type FakeAnthropic } from './fake-anthropic.ts';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');

class Client {
  cookie = '';
  base: string;
  constructor(base: string) {
    this.base = base;
  }
  async req(method: string, url: string, body?: unknown, headers: Record<string, string> = {}) {
    const isBuf = Buffer.isBuffer(body);
    const res = await fetch(this.base + url, {
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
    const data = type.includes('json') ? await res.json() : await res.text();
    return { status: res.status, data: data as any };
  }
  get = (u: string) => this.req('GET', u);
  post = (u: string, b?: unknown, h?: Record<string, string>) => this.req('POST', u, b ?? {}, h);
  put = (u: string, b: unknown) => this.req('PUT', u, b);
  del = (u: string, b?: unknown) => this.req('DELETE', u, b);
}

/** O pedido de chat enviado à API cuja última mensagem contém `text`. */
function chatRequest(text: string) {
  return fake.requests.filter((x) => {
    const last = x.body.messages?.at(-1);
    const content = typeof last?.content === 'string' ? last.content : (last?.content ?? []).map((b: any) => b.text ?? '').join(' ');
    return content.includes(text);
  }).at(-1)!;
}

function parseSse(text: string) {
  return text
    .split('\n\n')
    .filter((c) => c.includes('data:'))
    .map((c) => {
      const event = c.match(/^event: (.+)$/m)?.[1];
      const data = JSON.parse(c.match(/^data: (.+)$/m)?.[1] ?? 'null');
      return { event, data };
    });
}

const questionnaire = {
  name: 'Ana Silva',
  year: '8',
  subjects: ['portugues', 'matematica', 'ingles', 'historia', 'fisico-quimica', 'educacao-fisica'],
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

let fake: FakeAnthropic;
let app: App;
let server: Server;
let base: string;
let noAi: App;
let noAiServer: Server;
let noAiBase: string;
const dirs: string[] = [];

function tmp() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'study-ai-test-'));
  dirs.push(d);
  return d;
}

function listen(a: App): Promise<[Server, string]> {
  return new Promise((resolve) => {
    const s = a.app.listen(0, '127.0.0.1', () => resolve([s, `http://127.0.0.1:${(s.address() as AddressInfo).port}/api`]));
  });
}

beforeAll(async () => {
  fake = await startFakeAnthropic();
  app = createApp({ dataDir: tmp(), staticDir: null, ai: { apiKey: 'test-key', baseURL: fake.url } as any });
  [server, base] = await listen(app);
  noAi = createApp({ dataDir: tmp(), staticDir: null, ai: { apiKey: null, baseURL: null } as any });
  [noAiServer, noAiBase] = await listen(noAi);
});

afterAll(async () => {
  server.close();
  noAiServer.close();
  app.close();
  noAi.close();
  await fake.close();
  for (const d of dirs) fs.rmSync(d, { recursive: true, force: true });
});

async function newStudent(email: string, b = base) {
  const c = new Client(b);
  const r = await c.post('/auth/register', { name: 'Ana', email, password: 'palavra-secreta' });
  expect(r.status).toBe(201);
  const q = await c.put('/profile/questionnaire', { questionnaire });
  expect(q.status).toBe(200);
  return c;
}

describe('contas e autenticação', () => {
  it('regista, inicia e termina sessão', async () => {
    const c = new Client(base);
    const r = await c.post('/auth/register', { name: 'Rui', email: 'Rui@Exemplo.pt', password: 'muitosegura1' });
    expect(r.status).toBe(201);
    expect(r.data.user.email).toBe('rui@exemplo.pt');
    expect(r.data.profile.onboarded).toBe(false);
    expect(r.data.user.password_hash).toBeUndefined();
    expect(c.cookie).toMatch(/^study_ai_sid=/);

    expect((await c.get('/me')).status).toBe(200);
    await c.post('/auth/logout');
    expect((await c.get('/me')).status).toBe(401);

    const bad = await new Client(base).post('/auth/login', { email: 'rui@exemplo.pt', password: 'errada123' });
    expect(bad.status).toBe(401);
    const ok = await c.post('/auth/login', { email: 'rui@exemplo.pt', password: 'muitosegura1' });
    expect(ok.status).toBe(200);
  });

  it('recusa emails repetidos e palavras-passe curtas', async () => {
    const c = new Client(base);
    expect((await c.post('/auth/register', { name: 'X', email: 'dup@exemplo.pt', password: '12345678' })).status).toBe(201);
    expect((await new Client(base).post('/auth/register', { name: 'Y', email: 'dup@exemplo.pt', password: '12345678' })).status).toBe(409);
    expect((await new Client(base).post('/auth/register', { name: 'Y', email: 'curta@exemplo.pt', password: '123' })).status).toBe(400);
  });

  it('exige o cabeçalho anti-CSRF nos pedidos que alteram dados', async () => {
    const res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Z', email: 'csrf@exemplo.pt', password: '12345678' }),
    });
    expect(res.status).toBe(403);
  });

  it('guarda o token de sessão apenas como hash', async () => {
    const c = await newStudent('hash@exemplo.pt');
    const token = decodeURIComponent(c.cookie.split('=')[1]!);
    const rows = app.ctx.db.all<{ token_hash: string }>('SELECT token_hash FROM sessions');
    expect(rows.some((r) => r.token_hash === token)).toBe(false);
  });
});

describe('questionário e plano de estudos', () => {
  it('cria o plano automaticamente e marca os testes no calendário', async () => {
    const c = await newStudent('plano@exemplo.pt');
    const me = await c.get('/me');
    expect(me.data.profile.onboarded).toBe(true);
    const { data } = await c.get('/plan');
    const plan = data.plan;
    expect(plan.sessions.length).toBeGreaterThan(0);
    expect(plan.weeklyGoals.length).toBeGreaterThan(0);
    const count = (id: string) => plan.sessions.filter((s: any) => s.subject === id).length;
    expect(count('matematica')).toBeGreaterThan(count('ingles'));
    expect(count('educacao-fisica')).toBe(0);
    const events = await c.get('/events');
    expect(events.data.events).toHaveLength(1);
    expect(events.data.events[0].title).toContain('Matemática');

    const edited = await c.put(`/plan/sessions/${plan.sessions[0].id}`, { ...plan.sessions[0], minutes: 50, note: 'Capítulo 2' });
    expect(edited.data.plan.sessions[0].minutes).toBe(50);
    const added = await c.post('/plan/sessions', { weekday: 5, start: '10:00', minutes: 30, subject: 'historia', activity: 'resumo' });
    expect(added.status).toBe(201);
  });

  it('regista sessões feitas e calcula estatísticas', async () => {
    const c = await newStudent('stats@exemplo.pt');
    await c.post('/logs', { date: '2026-11-10', subject: 'matematica', minutes: 30, source: 'plano', sessionKey: '2026-11-10:s1' });
    await c.post('/logs', { date: '2026-11-10', subject: 'matematica', minutes: 35, source: 'plano', sessionKey: '2026-11-10:s1' });
    await c.post('/logs', { date: '2026-11-11', subject: null, minutes: 20, source: 'timer' });
    const stats = await c.get('/stats?date=2026-11-11');
    expect(stats.data.totalMinutes).toBe(55);
    expect(stats.data.streak).toBe(2);
    await c.del('/logs?sessionKey=2026-11-10%3As1');
    expect((await c.get('/stats?date=2026-11-11')).data.totalMinutes).toBe(20);
  });
});

describe('isolamento dos dados entre estudantes', () => {
  it('um estudante não vê nem altera os dados de outro', async () => {
    const a = await newStudent('a@exemplo.pt');
    const b = await newStudent('b@exemplo.pt');
    const s = await a.post('/summaries', { subject: 'matematica', title: 'Frações', content: 'Resumo da Ana', source: 'manual' });
    expect((await b.get('/summaries')).data.summaries).toHaveLength(0);
    expect((await b.put(`/summaries/${s.data.summary.id}`, { subject: null, title: 'x', content: 'y' })).status).toBe(404);
    await b.del(`/summaries/${s.data.summary.id}`);
    expect((await a.get('/summaries')).data.summaries).toHaveLength(1);

    const chat = await a.post('/chat/send', { content: 'O que é uma fração?', attachmentIds: [] });
    const conv = parseSse(chat.data).find((e) => e.event === 'start')!.data.conversation;
    expect((await b.get(`/conversations/${conv.id}`)).status).toBe(404);
    expect((await b.get('/conversations')).data.conversations).toHaveLength(0);
  });
});

describe('chat com IA', () => {
  it('responde em streaming, guarda o histórico e conta a pergunta', async () => {
    const c = await newStudent('chat@exemplo.pt');
        const r = await c.post('/chat/send', { content: 'Explica-me frações', attachmentIds: [], subject: 'matematica' });
    expect(r.status).toBe(200);
    const events = parseSse(r.data);
    expect(events[0]!.event).toBe('start');
    expect(events.filter((e) => e.event === 'delta').length).toBeGreaterThan(1);
    const done = events.find((e) => e.event === 'done')!.data;
    expect(done.message.content).toBe(fake.reply);
    expect(done.usage.questionsUsed).toBe(1);

    const sent = chatRequest('Explica-me frações');
    expect(sent.body.model).toBe('claude-opus-5-5');
    expect(sent.body.output_config).toEqual({ effort: 'low' });
    expect(sent.body.fallbacks).toBe('default');
    expect(String(sent.headers['anthropic-beta'])).toContain('server-side-fallback-2026-07-01');
    expect(sent.body.system).toContain('8.º ano');
    expect(sent.body.system).toContain('Disciplina desta conversa: Matemática');
    expect(sent.body.system).toContain('Cláudio 5');

    const conv = events[0]!.data.conversation;
    const again = await c.post('/chat/send', { conversationId: conv.id, content: 'E frações equivalentes?', attachmentIds: [] });
    expect(again.status).toBe(200);
    const last = chatRequest('E frações equivalentes?');
    expect(last.body.messages).toHaveLength(3);
    const history = await c.get(`/conversations/${conv.id}`);
    expect(history.data.messages.map((m: any) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant']);
  });

  it('adapta o pedido ao plano escolhido', async () => {
    const c = await newStudent('planos@exemplo.pt');
    await c.put('/profile/ai-plan', { plan: 'claudio-6' });
        await c.post('/chat/send', { content: 'Olá do plano 6', attachmentIds: [] });
    const sent = chatRequest('Olá do plano 6');
    expect(sent.body.output_config).toEqual({ effort: 'high' });
    expect(sent.body.max_tokens).toBe(32000);
    expect(sent.body.system).toContain('aprofundadas');
  });

  it('sem chave de API mostra claramente que a IA não está ligada', async () => {
    const c = new Client(noAiBase);
    await c.post('/auth/register', { name: 'Sem IA', email: 'semia@exemplo.pt', password: '12345678' });
    const me = await c.get('/me');
    expect(me.data.ai.configured).toBe(false);
    expect(me.data.ai.message).toContain('ANTHROPIC_API_KEY');
    const r = await c.post('/chat/send', { content: 'Olá', attachmentIds: [] });
    expect(r.status).toBe(503);
    expect(r.data.code).toBe('ai_not_configured');
    expect((await c.get('/conversations')).data.conversations).toHaveLength(0);
  });
});

describe('limites e anexos de cada plano', () => {
  it('Cláudio 5 não permite imagens', async () => {
    const c = await newStudent('img5@exemplo.pt');
    const r = await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'foto.png' });
    expect(r.status).toBe(403);
    expect(r.data.code).toBe('plan_no_images');
  });

  it('Cláudio 5.5: até 3 imagens e 20 perguntas por dia, sem ficheiros', async () => {
    const c = await newStudent('img55@exemplo.pt');
    await c.put('/profile/ai-plan', { plan: 'claudio-5-5' });
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const up = await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': `f${i}.png` });
      expect(up.status).toBe(201);
      ids.push(up.data.attachment.id);
    }
        const r = await c.post('/chat/send', { content: 'Corrige estes exercícios', attachmentIds: ids });
    const done = parseSse(r.data).find((e) => e.event === 'done')!.data;
    expect(done.usage.imagesUsed).toBe(3);
    const blocks = chatRequest('Corrige estes exercícios').body.messages.at(-1).content;
    expect(blocks.filter((b: any) => b.type === 'image')).toHaveLength(3);

    const fourth = await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'f4.png' });
    expect(fourth.status).toBe(429);
    const pdf = await c.post('/uploads', PDF, { 'Content-Type': 'application/pdf', 'X-File-Name': 'ficha.pdf' });
    expect(pdf.status).toBe(403);

    const me = await c.get('/me');
    app.ctx.db.run('UPDATE usage SET questions = 20 WHERE user_id = ? AND plan = ?', me.data.user.id, 'claudio-5-5');
    const blocked = await c.post('/chat/send', { content: 'Mais uma', attachmentIds: [] });
    expect(blocked.status).toBe(429);
    expect(blocked.data.code).toBe('limit_questions');
  });

  it('Cláudio 6: ficheiros PDF e texto, e recusa tipos falsos', async () => {
    const c = await newStudent('img6@exemplo.pt');
    await c.put('/profile/ai-plan', { plan: 'claudio-6' });
    const pdf = await c.post('/uploads', PDF, { 'Content-Type': 'application/pdf', 'X-File-Name': 'ficha.pdf' });
    expect(pdf.status).toBe(201);
    const txt = await c.post('/uploads', Buffer.from('Apontamentos de História'), { 'Content-Type': 'text/plain', 'X-File-Name': 'notas.txt' });
    expect(txt.status).toBe(201);
    const fakeImg = await c.post('/uploads', Buffer.from('MZ executável'), { 'Content-Type': 'image/png', 'X-File-Name': 'x.png' });
    expect(fakeImg.status).toBe(415);
        await c.post('/chat/send', { content: 'Analisa a ficha', attachmentIds: [pdf.data.attachment.id, txt.data.attachment.id] });
    const blocks = chatRequest('Analisa a ficha').body.messages.at(-1).content;
    expect(blocks.filter((b: any) => b.type === 'document')).toHaveLength(2);
    const file = await fetch(`${base}/attachments/${pdf.data.attachment.id}`, { headers: { Cookie: c.cookie } });
    expect(file.status).toBe(200);
    const other = await newStudent('outro6@exemplo.pt');
    const denied = await fetch(`${base}/attachments/${pdf.data.attachment.id}`, { headers: { Cookie: other.cookie } });
    expect(denied.status).toBe(404);
  });
});

describe('materiais criados pela IA', () => {
  it('gera e corrige um teste de preparação', async () => {
    const c = await newStudent('teste@exemplo.pt');
    const g = await c.post('/tests/generate', { subject: 'matematica', topic: 'Frações', count: 3, difficulty: 'medio', kinds: ['escolha-multipla', 'resposta-curta'] });
    expect(g.status).toBe(201);
    const test = g.data.test;
    expect(test.questions).toHaveLength(3);
    expect(test.maxScore).toBe(4);
    const s = await c.post(`/tests/${test.id}/submit`, { answers: [0, 1, 'Representa a mesma parte'] });
    expect(s.status).toBe(200);
    expect(s.data.test.results[0].correct).toBe(true);
    expect(s.data.test.results[1].correct).toBe(false);
    expect(s.data.test.results[2].score).toBe(1);
    expect(s.data.test.score).toBe(2);
    expect(s.data.usage.questionsUsed).toBe(2);
  });

  it('cria flashcards e resumos com IA', async () => {
    const c = await newStudent('flash@exemplo.pt');
    const d = await c.post('/decks/generate', { subject: 'matematica', topic: 'Frações', count: 6 });
    expect(d.status).toBe(201);
    expect(d.data.deck.cardCount).toBe(2);
    const deck = await c.get(`/decks/${d.data.deck.id}`);
    const card = deck.data.cards[0];
    const rev = await c.post(`/cards/${card.id}/review`, { known: true, date: '2026-11-12' });
    expect(rev.data.card.box).toBe(2);
    expect(rev.data.card.due).toBe('2026-11-14');
    const s = await c.post('/summaries/generate', { subject: 'matematica', topic: 'Frações' });
    expect(s.status).toBe(201);
    expect(s.data.summary.source).toBe('ia');
  });

  it('sem IA, as perguntas abertas são autoavaliadas', async () => {
    const c = await newStudent('auto@exemplo.pt');
    const g = await c.post('/tests/generate', { subject: 'matematica', topic: 'Frações', count: 3, kinds: ['resposta-curta'] });
    const s = await c.post(`/tests/${g.data.test.id}/submit`, { answers: [0, 0, 'x'], useAi: false });
    expect(s.data.pendingSelfGrade).toEqual([2]);
    const s2 = await c.post(`/tests/${g.data.test.id}/submit`, { answers: [0, 0, 'x'], selfGrades: { '2': true } });
    expect(s2.data.test.score).toBe(4);
  });
});

describe('conta', () => {
  it('exporta e apaga todos os dados', async () => {
    const c = await newStudent('apagar@exemplo.pt');
    const exp = await c.get('/account/export');
    expect(exp.data.user.email).toBe('apagar@exemplo.pt');
    expect(JSON.stringify(exp.data)).not.toContain('scrypt$');
    expect((await c.del('/account', { password: 'errada' })).status).toBe(400);
    expect((await c.del('/account', { password: 'palavra-secreta' })).status).toBe(200);
    expect((await c.get('/me')).status).toBe(401);
  });
});

describe('usar sem conta', () => {
  it('começa sem conta e depois cria a conta sem perder nada', async () => {
    const c = new Client(base);
    const g = await c.post('/auth/guest');
    expect(g.status).toBe(201);
    expect(g.data.user).toMatchObject({ guest: true, email: '' });
    expect(g.data.profile.onboarded).toBe(false);
    expect((await c.put('/profile/questionnaire', { questionnaire })).status).toBe(200);
    expect((await c.get('/plan')).data.plan.sessions.length).toBeGreaterThan(0);
    await c.post('/summaries', { subject: 'matematica', title: 'Feito sem conta', content: 'Resumo', source: 'manual' });
    expect((await c.post('/auth/password', { current: 'x', next: 'nova-palavra-1' })).status).toBe(400);

    expect((await new Client(base).post('/auth/register', { name: 'X', email: 'ocupado-sc@exemplo.pt', password: '12345678' })).status).toBe(201);
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
    const other = new Client(base);
    expect((await other.post('/auth/login', { email: 'sem.conta@exemplo.pt', password: 'palavra-secreta' })).status).toBe(200);
    expect((await other.get('/summaries')).data.summaries.map((s: any) => s.title)).toEqual(['Feito sem conta']);
    expect((await other.get('/me')).data.profile.onboarded).toBe(true);
  });

  it('sem conta, apagar os dados não pede palavra-passe', async () => {
    const c = new Client(base);
    expect((await c.post('/auth/guest')).status).toBe(201);
    expect((await c.del('/account', {})).status).toBe(200);
    expect((await c.get('/me')).status).toBe(401);
  });
});
