// Servidor HTTP que imita a API de mensagens da Anthropic, SÓ para os testes automáticos.
// Permite verificar a integração (streaming, respostas estruturadas, pedidos enviados)
// sem chave de API nem custos. Nunca é usado pela aplicação.
import http from 'node:http';
import type { AddressInfo } from 'node:net';

export interface FakeRequest {
  headers: http.IncomingHttpHeaders;
  body: Record<string, any>;
}

export interface FakeAnthropic {
  url: string;
  requests: FakeRequest[];
  /** Texto devolvido nas respostas de chat em streaming. */
  reply: string;
  close(): Promise<void>;
}

function lastUserText(body: Record<string, any>): string {
  const msgs = body.messages ?? [];
  const last = msgs[msgs.length - 1];
  if (!last) return '';
  if (typeof last.content === 'string') return last.content;
  return (last.content as any[]).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}

function structured(prompt: string): unknown {
  if (prompt.includes('flashcards')) {
    return { title: 'Frações', cards: [{ front: 'O que é o numerador?', back: 'O número de cima da fração.' }, { front: 'E o denominador?', back: 'O número de baixo.' }] };
  }
  if (prompt.includes('Corrige as respostas abertas')) {
    const indexes = [...prompt.matchAll(/## Pergunta (\d+)/g)].map((m) => Number(m[1]));
    return { grades: indexes.map((index) => ({ index, score: 1, feedback: 'Quase certo: faltou a unidade.' })) };
  }
  return {
    title: 'Teste de frações',
    questions: [
      { kind: 'escolha-multipla', prompt: 'Quanto é $\\frac{1}{2} + \\frac{1}{4}$?', options: ['3/4', '2/6', '1/6', '1'], correct_option: 0, model_answer: '3/4', explanation: 'Reduz ao mesmo denominador.', points: 1 },
      { kind: 'verdadeiro-falso', prompt: '1/2 é maior do que 1/3.', options: ['Verdadeiro', 'Falso'], correct_option: 0, model_answer: 'Verdadeiro', explanation: 'Metade é mais do que um terço.', points: 1 },
      { kind: 'resposta-curta', prompt: 'O que é uma fração equivalente?', options: [], correct_option: -1, model_answer: 'Uma fração que representa a mesma quantidade.', explanation: 'Ex.: 1/2 = 2/4.', points: 2 },
    ],
  };
}

export async function startFakeAnthropic(): Promise<FakeAnthropic> {
  const state: FakeAnthropic = { url: '', requests: [], reply: 'Olá! **Uma fração** representa partes de um todo: $\\frac{1}{2}$.', close: async () => {} };
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : {};
      state.requests.push({ headers: req.headers, body });
      if (!req.url?.startsWith('/v1/messages')) {
        res.writeHead(404).end();
        return;
      }
      const usage = { input_tokens: 120, output_tokens: 40, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
      const message = { id: 'msg_fake', type: 'message', role: 'assistant', model: body.model, stop_reason: null, stop_sequence: null, usage };
      const prompt = lastUserText(body);
      const text = body.output_config?.format ? JSON.stringify(structured(prompt)) : prompt.includes('resumo') ? '## Resumo\n\n**Frações** são partes de um todo.' : state.reply;
      if (body.stream) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
        const send = (event: string, data: unknown) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        send('message_start', { type: 'message_start', message: { ...message, content: [] } });
        send('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
        const parts = text.match(/.{1,12}/gs) ?? [];
        for (const p of parts) send('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: p } });
        send('content_block_stop', { type: 'content_block_stop', index: 0 });
        send('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 40 } });
        send('message_stop', { type: 'message_stop' });
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ...message, stop_reason: 'end_turn', content: [{ type: 'text', text }] }));
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  state.url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  state.close = () => new Promise((resolve) => server.close(() => resolve()));
  return state;
}
