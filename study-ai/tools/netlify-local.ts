// Imita o Netlify no computador: serve a app compilada (dist/) e a função /api com os
// dados em memória. Serve para experimentar a versão Netlify antes de a publicar.
// Uso: npm run build && npm run netlify:local   (com GEMINI_API_KEY no .env para a IA)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createApp } from '../netlify/lib/app';
import { GeminiAi } from '../netlify/lib/gemini';
import { memoryKV } from '../netlify/lib/kv';

const root = process.cwd();
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT ?? 8888);
const env = (n: string) => process.env[n]?.trim() || null;

const api = createApp({
  kv: memoryKV(),
  ai: new GeminiAi({
    apiKey: env('GEMINI_API_KEY'),
    baseUrl: env('GEMINI_BASE_URL'),
    model: env('GEMINI_MODEL'),
    models: { 'claudio-5': env('GEMINI_MODEL_CLAUDIO_5'), 'claudio-5-5': env('GEMINI_MODEL_CLAUDIO_5_5'), 'claudio-6': env('GEMINI_MODEL_CLAUDIO_6') },
  }),
  secret: env('SESSION_SECRET') ?? 'apenas-para-testes-locais',
  secureCookies: false,
});

// Os mesmos cabeçalhos do netlify.toml.
const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
const csp = /Content-Security-Policy = "([^"]+)"/.exec(toml)?.[1] ?? "default-src 'self'";
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const abort = new AbortController();
    res.on('close', () => !res.writableFinished && abort.abort());
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
    const r = await api(
      new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method!) ? undefined : Buffer.concat(chunks), signal: abort.signal }),
      { ip: req.socket.remoteAddress ?? 'local' },
    );
    const out: Record<string, string | string[]> = {};
    r.headers.forEach((v, k) => (out[k] = v));
    res.writeHead(r.status, out);
    if (!r.body) return void res.end();
    const reader = r.body.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } catch {
      /* o navegador fechou a ligação */
    }
    return void res.end();
  }
  let file = path.join(dist, path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html');
  const ext = path.extname(file);
  res.writeHead(200, {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': file.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`STUDY AI (versão Netlify) a correr em http://127.0.0.1:${port}`);
  console.log(env('GEMINI_API_KEY') ? 'IA: Google Gemini ligado.' : 'IA: sem GEMINI_API_KEY — o chat mostra como a ativar.');
  console.log('Os dados ficam só em memória: desaparecem ao fechar.');
});
