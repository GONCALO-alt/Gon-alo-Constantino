// Testes da IA do Cloudflare (Workers AI) com uma associação `AI` falsa, através da app inteira.
import { beforeAll, describe, expect, it } from 'vitest';
import { DEFAULT_MODEL, extractJson, WorkersAi, type AiBinding } from '../cloudflare/workers-ai.ts';
import { createApp } from '../netlify/lib/app.ts';
import { memoryKV } from '../netlify/lib/kv.ts';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');
const REPLY = 'Olá! **Uma fração** representa partes de um todo: $\\frac{1}{2}$.';

interface Call {
  model: string;
  inputs: Record<string, any>;
}

function fakeAi() {
  const calls: Call[] = [];
  const state = { failNext: null as string | null, jsonModeFails: false, jsonAsString: false, pdfs: [] as string[] };
  const lastText = (inputs: Record<string, any>) => {
    const c = inputs.messages.at(-1).content;
    return typeof c === 'string' ? c : c.map((p: any) => p.text ?? '').join('');
  };
  const ai: AiBinding = {
    async run(model, inputs) {
      calls.push({ model, inputs });
      if (model.includes('whisper')) return { text: ' Quanto é dois mais dois? ', transcription_info: { language: 'pt' } };
      if (state.failNext) {
        const m = state.failNext;
        state.failNext = null;
        throw new Error(m);
      }
      const prompt = lastText(inputs);
      if (inputs.response_format && state.jsonModeFails) throw new Error('AiError: 5006: response_format is not supported');
      if (prompt.includes('JSON') && prompt.includes('Estas fotografias são páginas')) {
        return { response: { readable: true, title: 'Os Descobrimentos', topic: 'Descobrimentos portugueses', content: '## Os Descobrimentos\n\nNo século XV, **Portugal** explorou a costa africana. Em 1498, Vasco da Gama chegou à Índia.' } };
      }
      if (prompt.includes('JSON') && prompt.includes('calendário')) {
        return { response: { events: [
          { date: '2026-12-03', subject: 'matematica', type: 'teste', title: 'Teste de Matemática', notes: 'Frações' },
          { date: '2026-12-03', subject: 'matematica', type: 'teste', title: 'Teste de Matemática', notes: 'repetido' },
          { date: '2026-12-10', subject: 'quimica-inventada', type: 'trabalho', title: 'Trabalho de grupo', notes: '' },
          { date: '31/12', subject: null, type: 'teste', title: 'Data inválida', notes: '' },
        ] } };
      }
      if (prompt.includes('JSON') && prompt.includes('Corrige esta redação')) {
        return { response: {
          transcription: prompt.includes('A redação está nas fotografias') ? 'Eu acho que os telemoveis na escola deviam ser proibidos porque distraem os alunos nas aulas e nos intervalos.' : '',
          title: 'Telemóveis na escola', grade: 13.5, level: 'x', summary: 'Boa opinião, mas com alguns erros de acentuação.',
          criteria: [
            { name: 'Tema e tipo de texto', score: 4, max: 5, comment: 'Adequado.' },
            { name: 'Estrutura e coesão', score: 3, max: 5, comment: 'Faltam parágrafos.' },
            { name: 'Correção linguística', score: 3, max: 5, comment: 'Erros de acentuação.' },
            { name: 'Vocabulário', score: 2, max: 3, comment: 'Simples.' },
            { name: 'Ideias', score: 1.5, max: 2, comment: 'Bons argumentos.' },
          ],
          errors: [
            { original: 'telemoveis', correction: 'telemóveis', explanation: 'Leva acento agudo no «o».', type: 'acentuação' },
            { original: 'igual', correction: 'igual', explanation: 'sem erro', type: 'ortografia' },
          ],
          strengths: ['Opinião clara'], improvements: ['Usa parágrafos'], improved: 'Eu acho que os **telemóveis** na escola deviam ser proibidos.',
        } };
      }
      if (prompt.includes('JSON')) {
        const data = prompt.includes('flashcards')
          ? { title: 'Frações', cards: [{ front: 'Numerador?', back: 'O número de cima.' }, { front: 'Denominador?', back: 'O número de baixo.' }] }
          : prompt.includes('Corrige as respostas abertas')
            ? { grades: [...prompt.matchAll(/## Pergunta (\d+)/g)].map((m) => ({ index: Number(m[1]), score: 1, feedback: 'Quase.' })) }
            : {
                title: 'Teste de frações',
                questions: [
                  { kind: 'escolha-multipla', prompt: '1/2 + 1/4?', options: ['3/4', '2/6', '1/6', '1'], correct_option: 0, model_answer: '3/4', explanation: '', points: 1 },
                  { kind: 'verdadeiro-falso', prompt: '1/2 > 1/3', options: ['Verdadeiro', 'Falso'], correct_option: 0, model_answer: 'Verdadeiro', explanation: '', points: 1 },
                  { kind: 'resposta-curta', prompt: 'Fração equivalente?', options: [], correct_option: -1, model_answer: 'A mesma parte.', explanation: '', points: 2 },
                ],
              };
        // Alguns modelos devolvem o JSON já interpretado; outros como texto (às vezes entre ```).
        return { response: inputs.response_format && !state.jsonAsString ? data : `Aqui está:\n\`\`\`json\n${JSON.stringify(data)}\n\`\`\`` };
      }
      if (!inputs.stream) return { response: '## Resumo\n\n**Frações** são partes de um todo.' };
      const enc = new TextEncoder();
      const parts = REPLY.match(/.{1,10}/gs) ?? [];
      return new ReadableStream<Uint8Array>({
        start(c) {
          for (const p of parts) c.enqueue(enc.encode(`data: ${JSON.stringify({ response: p, p: 'abc' })}\n\n`));
          c.enqueue(enc.encode(`data: ${JSON.stringify({ response: '', usage: { prompt_tokens: 900, completion_tokens: 30 } })}\n\n`));
          c.enqueue(enc.encode('data: [DONE]\n\n'));
          c.close();
        },
      });
    },
    async toMarkdown(file) {
      state.pdfs.push(file.name);
      return { format: 'markdown', data: `# ${file.name}\n\nFrações equivalentes: 1/2 = 2/4.` };
    },
  };
  return { ai, calls, state };
}

const questionnaire = {
  name: 'Ana Silva',
  year: '8',
  subjects: ['portugues', 'matematica', 'ingles'],
  customSubjects: {},
  difficult: ['matematica'],
  easy: ['ingles'],
  dailyMinutes: 60,
  studyDays: [0, 1, 2, 3, 4],
  startTime: '18:00',
  goal: 'preparar-testes',
  styles: ['exercicios'],
  tests: [],
};

let fake: ReturnType<typeof fakeAi>;
let app: ReturnType<typeof createApp>;
let n = 0;

class Client {
  cookie = '';
  ip = `10.5.0.${++n}`;
  async req(method: string, url: string, body?: unknown, headers: Record<string, string> = {}) {
    const isBuf = Buffer.isBuffer(body);
    const res = await app(
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
    return { status: res.status, data: (type.includes('json') ? await res.json() : await res.text()) as any };
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

async function student(email: string) {
  const c = new Client();
  expect((await c.post('/auth/register', { name: 'Ana', email, password: 'palavra-secreta' })).status).toBe(201);
  expect((await c.put('/profile/questionnaire', { questionnaire })).status).toBe(200);
  return c;
}

beforeAll(() => {
  fake = fakeAi();
  app = createApp({ kv: memoryKV(), ai: new WorkersAi(fake.ai), secret: 's' });
});

describe('IA do Cloudflare (Workers AI)', () => {
  it('não precisa de chave: aparece ligada, com o aviso certo', async () => {
    const c = await student('ligada@exemplo.pt');
    const me = await c.get('/me');
    expect(me.data.ai).toMatchObject({ configured: true, provider: 'Cloudflare Workers AI' });
    expect(me.data.ai.notice).toContain('Cloudflare');
  });

  it('responde em streaming com as instruções do estudante e guarda a conversa', async () => {
    const c = await student('chat@exemplo.pt');
    const r = await c.post('/chat/send', { content: 'Explica-me frações', attachmentIds: [], subject: 'matematica' });
    const events = parseSse(r.data);
    expect(events.filter((e) => e.event === 'delta').length).toBeGreaterThan(1);
    const done = events.find((e) => e.event === 'done')!.data;
    expect(done.message.content).toBe(REPLY);
    expect(done.usage.questionsUsed).toBe(1);
    const call = fake.calls.at(-1)!;
    expect(call.model).toBe(DEFAULT_MODEL);
    expect(call.inputs).toMatchObject({ stream: true, max_tokens: 1536 });
    expect(call.inputs.messages[0].role).toBe('system');
    expect(call.inputs.messages[0].content).toContain('8.º ano');
    expect(call.inputs.messages.at(-1)).toEqual({ role: 'user', content: 'Explica-me frações' });
  });

  it('Cláudio 6: envia imagens e lê o texto dos PDF', async () => {
    const c = await student('anexos@exemplo.pt');
    await c.put('/profile/ai-plan', { plan: 'claudio-6' });
    const img = await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'exercicio.png' });
    const pdf = await c.post('/uploads', PDF, { 'Content-Type': 'application/pdf', 'X-File-Name': 'ficha.pdf' });
    expect(img.status).toBe(201);
    expect(pdf.status).toBe(201);
    const r = await c.post('/chat/send', { content: 'Corrige isto', attachmentIds: [img.data.attachment.id, pdf.data.attachment.id] });
    expect(parseSse(r.data).some((e) => e.event === 'done')).toBe(true);
    expect(fake.state.pdfs).toContain('ficha.pdf');
    const call = fake.calls.at(-1)!;
    expect(call.inputs.max_tokens).toBe(4096);
    const content = call.inputs.messages.at(-1).content;
    expect(content[0].type).toBe('text');
    expect(content[0].text).toContain('Frações equivalentes: 1/2 = 2/4.');
    expect(content[1]).toEqual({ type: 'image_url', image_url: { url: `data:image/png;base64,${PNG.toString('base64')}` } });
  });

  it('gera e corrige testes, flashcards e resumos (JSON com ou sem modo JSON)', async () => {
    const c = await student('materiais@exemplo.pt');
    const g = await c.post('/tests/generate', { subject: 'matematica', topic: 'Frações', count: 3, kinds: ['escolha-multipla', 'resposta-curta'] });
    expect(g.status).toBe(201);
    expect(g.data.test.questions).toHaveLength(3);
    expect(fake.calls.at(-1)!.inputs.response_format).toEqual({ type: 'json_object' });

    fake.state.jsonAsString = true;
    const s = await c.post(`/tests/${g.data.test.id}/submit`, { answers: [0, 1, 'A mesma parte'] });
    expect(s.data.test.score).toBe(2);
    fake.state.jsonAsString = false;

    fake.state.jsonModeFails = true;
    const d = await c.post('/decks/generate', { subject: 'matematica', topic: 'Frações', count: 6 });
    expect(d.data.deck.cardCount).toBe(2);
    expect(fake.calls.at(-1)!.inputs.response_format).toBeUndefined();
    fake.state.jsonModeFails = false;

    expect((await c.post('/summaries/generate', { subject: 'matematica', topic: 'Frações' })).status).toBe(201);
  });

  it('quando acaba o limite gratuito do dia, explica e não conta a pergunta', async () => {
    const c = await student('limite@exemplo.pt');
    fake.state.failNext = 'AiError: 4006: you have used up your daily free allocation of 10,000 neurons, please upgrade';
    const r = await c.post('/chat/send', { content: 'Sem limite', attachmentIds: [] });
    const err = parseSse(r.data).find((e) => e.event === 'error')!.data;
    expect(err.code).toBe('ai_rate_limit');
    expect(err.message).toContain('limite de hoje');
    expect((await c.get('/me')).data.usage.questionsUsed).toBe(0);
  });

  it('transforma gravações de voz em texto (sem contar como pergunta)', async () => {
    const c = await student('voz@exemplo.pt');
    expect((await c.get('/me')).data.ai.voice).toBe(true);
    const audio = Buffer.alloc(4000, 7);
    const r = await c.post('/transcribe', audio, { 'Content-Type': 'audio/webm;codecs=opus' });
    expect(r.status).toBe(200);
    expect(r.data.text).toBe('Quanto é dois mais dois?');
    const call = fake.calls.at(-1)!;
    expect(call.model).toContain('whisper');
    expect(call.inputs).toMatchObject({ language: 'pt', task: 'transcribe', audio: audio.toString('base64') });
    expect((await c.get('/me')).data.usage.questionsUsed).toBe(0);
    expect((await c.post('/transcribe', Buffer.alloc(50), { 'Content-Type': 'audio/webm' })).status).toBe(400);
    expect((await c.post('/transcribe', audio, { 'Content-Type': 'image/png' })).status).toBe(415);
  });

  it('fotos da matéria → resumo, flashcards e teste (e a foto é apagada)', async () => {
    const c = await student('fotos@exemplo.pt');
    expect((await c.get('/me')).data.features).toEqual(['essays', 'photos', 'push']);
    // O Cláudio 5 não aceita imagens.
    expect((await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'p.png' })).status).toBe(403);
    await c.put('/profile/ai-plan', { plan: 'claudio-5-5' });
    const up = await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'pagina.png' });
    const r = await c.post('/photos/materials', { attachmentIds: [up.data.attachment.id], subject: 'historia', make: 'both' });
    expect(r.status).toBe(201);
    expect(r.data.summary).toMatchObject({ title: 'Os Descobrimentos', subject: 'historia', source: 'ia' });
    expect(r.data.deck.cardCount).toBe(2);
    expect(r.data.test.questions).toHaveLength(3);
    expect(r.data.usage).toMatchObject({ questionsUsed: 1, imagesUsed: 1 });
    const notesCall = fake.calls.find((x) => JSON.stringify(x.inputs).includes('Estas fotografias são páginas'))!;
    expect(notesCall.inputs.messages.at(-1).content[1]).toEqual({ type: 'image_url', image_url: { url: `data:image/png;base64,${PNG.toString('base64')}` } });
    const testCall = fake.calls.filter((x) => JSON.stringify(x.inputs).includes('As perguntas são só sobre esta matéria')).at(-1)!;
    expect(JSON.stringify(testCall.inputs)).toContain('Vasco da Gama');
    expect((await c.get(`/attachments/${up.data.attachment.id}`)).status).toBe(404);
    expect((await c.post('/photos/materials', { attachmentIds: [up.data.attachment.id] })).status).toBe(400);
  });

  it('foto do calendário → datas dos testes para confirmar', async () => {
    const c = await student('calendario@exemplo.pt');
    await c.put('/profile/ai-plan', { plan: 'claudio-6' });
    const up = await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'calendario.png' });
    const r = await c.post('/photos/calendar', { attachmentIds: [up.data.attachment.id] });
    expect(r.status).toBe(200);
    expect(r.data.events).toEqual([
      { date: '2026-12-03', subject: 'matematica', type: 'teste', title: 'Teste de Matemática', notes: 'Frações' },
      { date: '2026-12-10', subject: null, type: 'trabalho', title: 'Trabalho de grupo', notes: '' },
    ]);
    const call = fake.calls.find((x) => JSON.stringify(x.inputs).includes('calendário'))!;
    expect(JSON.stringify(call.inputs)).toContain('matematica = Matemática');
    expect((await c.get('/events')).data.events).toHaveLength(0); // só fica marcado depois de confirmar
  });

  it('corrige redações escritas ou fotografadas e guarda o histórico', async () => {
    const c = await student('redacao@exemplo.pt');
    expect((await c.post('/essays/review', { text: 'Muito curta.', kind: 'opiniao' })).status).toBe(400);
    const text = 'Eu acho que os telemoveis na escola deviam ser proibidos porque distraem os alunos nas aulas e também nos intervalos, quando deviam brincar e conversar uns com os outros em vez de olharem para o ecrã.';
    const r = await c.post('/essays/review', { text, kind: 'opiniao', theme: 'Telemóveis na escola' });
    expect(r.status).toBe(201);
    const e = r.data.essay;
    expect(e).toMatchObject({ title: 'Telemóveis na escola', kind: 'opiniao', fromPhoto: false, text });
    expect(e.review).toMatchObject({ grade: 13.5, level: 'Suficiente' });
    expect(e.review.errors).toEqual([{ original: 'telemoveis', correction: 'telemóveis', explanation: 'Leva acento agudo no «o».', type: 'acentuação' }]);
    expect(e.review.wordCount).toBe(text.split(/\s+/).length);
    const call = fake.calls.at(-1)!;
    expect(JSON.stringify(call.inputs)).toContain('Acordo Ortográfico de 1990');

    await c.put('/profile/ai-plan', { plan: 'claudio-6' });
    const up = await c.post('/uploads', PNG, { 'Content-Type': 'image/png', 'X-File-Name': 'redacao.png' });
    const p = await c.post('/essays/review', { attachmentIds: [up.data.attachment.id], kind: 'opiniao' });
    expect(p.status).toBe(201);
    expect(p.data.essay.fromPhoto).toBe(true);
    expect(p.data.essay.text).toContain('telemoveis na escola');

    const list = await c.get('/essays');
    expect(list.data.essays).toHaveLength(2);
    expect((await c.get(`/essays/${e.id}`)).data.essay.id).toBe(e.id);
    expect((await c.del(`/essays/${e.id}`)).status).toBe(200);
    expect((await c.get('/essays')).data.essays).toHaveLength(1);
  });

  it('tira o JSON do meio do texto', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJson('Claro! Aqui está: {"a":{"b":2}} Espero que ajude.')).toEqual({ a: { b: 2 } });
    expect(() => extractJson('nada')).toThrow();
  });
});
