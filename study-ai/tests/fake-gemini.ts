// Servidor HTTP que imita a API do Google Gemini, SÓ para os testes automáticos
// (versão Netlify). Nunca é usado pela aplicação.
import http from 'node:http';
import type { AddressInfo } from 'node:net';

export interface FakeGeminiRequest {
  path: string;
  headers: http.IncomingHttpHeaders;
  body: Record<string, any>;
}

export interface FakeGemini {
  url: string;
  requests: FakeGeminiRequest[];
  reply: string;
  /** Se definido, o próximo pedido responde com este estado HTTP (ex.: 429). */
  failNext: number | null;
  /** Pausa (ms) entre pedaços da resposta em streaming, para testar o tempo máximo. */
  slowMs: number;
  close(): Promise<void>;
}

function promptText(body: Record<string, any>): string {
  const last = (body.contents ?? []).at(-1);
  return (last?.parts ?? []).map((p: any) => p.text ?? '').join('\n');
}

function structured(prompt: string): unknown {
  if (prompt.includes('flashcards')) return { title: 'Frações', cards: [{ front: 'O que é o numerador?', back: 'O número de cima.' }, { front: 'E o denominador?', back: 'O número de baixo.' }] };
  if (prompt.includes('Corrige as respostas abertas')) {
    const indexes = [...prompt.matchAll(/## Pergunta (\d+)/g)].map((m) => Number(m[1]));
    return { grades: indexes.map((index) => ({ index, score: 1, feedback: 'Quase certo.' })) };
  }
  return {
    title: 'Teste de frações',
    questions: [
      { kind: 'escolha-multipla', prompt: 'Quanto é 1/2 + 1/4?', options: ['3/4', '2/6', '1/6', '1'], correct_option: 0, model_answer: '3/4', explanation: 'Mesmo denominador.', points: 1 },
      { kind: 'verdadeiro-falso', prompt: '1/2 é maior do que 1/3.', options: ['Verdadeiro', 'Falso'], correct_option: 0, model_answer: 'Verdadeiro', explanation: '', points: 1 },
      { kind: 'resposta-curta', prompt: 'O que é uma fração equivalente?', options: [], correct_option: -1, model_answer: 'A mesma quantidade.', explanation: '', points: 2 },
    ],
  };
}

export async function startFakeGemini(): Promise<FakeGemini> {
  const state: FakeGemini = {
    url: '',
    requests: [],
    reply: 'Olá! **Uma fração** representa partes de um todo: $\\frac{1}{2}$.',
    failNext: null,
    slowMs: 0,
    close: async () => {},
  };
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : {};
      const path = req.url ?? '';
      state.requests.push({ path, headers: req.headers, body });
      if (state.failNext) {
        const status = state.failNext;
        state.failNext = null;
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: status, message: 'Resource has been exhausted (e.g. check quota).', status: 'RESOURCE_EXHAUSTED' } }));
        return;
      }
      if (req.method === 'GET' && path.startsWith('/v1beta/models')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash-preview-tts', 'gemini-flash-latest', 'gemini-flash-lite-latest'].map((m) => ({
              name: `models/${m}`,
              supportedGenerationMethods: ['generateContent'],
            })),
          }),
        );
        return;
      }
      const prompt = promptText(body);
      const isJson = body.generationConfig?.responseMimeType === 'application/json';
      const text = isJson ? JSON.stringify(structured(prompt)) : prompt.includes('resumo') ? '## Resumo\n\n**Frações** são partes de um todo.' : state.reply;
      if (path.includes(':streamGenerateContent')) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        const parts = text.match(/.{1,12}/gs) ?? [];
        const write = (i: number) => {
          if (i >= parts.length || res.destroyed) return void res.end();
          const last = i === parts.length - 1;
          res.write(
            `data: ${JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: parts[i] }] }, index: 0, ...(last ? { finishReason: 'STOP' } : {}) }], usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 20 } })}\r\n\r\n`,
          );
          if (state.slowMs) setTimeout(() => write(i + 1), state.slowMs);
          else write(i + 1);
        };
        write(0);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text }] }, finishReason: 'STOP', index: 0 }] }));
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  state.url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  state.close = () => new Promise((resolve) => server.close(() => resolve()));
  return state;
}
