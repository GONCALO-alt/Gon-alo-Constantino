// Servidor: serve o site e trata das salas em tempo real (Socket.IO).
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import * as R from './rooms.js';
import * as AI from './ai.js';
import { attachHandlers } from './handlers.js';
import { randomSecret } from './premium.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

// Segredo que assina os passes Premium: PREMIUM_SECRET, ou um ficheiro criado na pasta de dados.
function loadSecret(dir) {
  if (process.env.PREMIUM_SECRET) return process.env.PREMIUM_SECRET;
  const file = join(dir, 'secret.txt');
  if (existsSync(file)) return readFileSync(file, 'utf8').trim();
  const secret = randomSecret();
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}

const here = dirname(fileURLToPath(import.meta.url));

export function startServer({ port = 3000, dataFile = join(here, 'data', 'rooms.json'), log = true, duelPauseMs = 3000 } = {}) {
  const app = express();
  const http = createServer(app);
  const io = new Server(http, { maxHttpBufferSize: 6 * 1024 * 1024 });
  const file = process.env.DATA_DIR ? join(process.env.DATA_DIR, 'rooms.json') : dataFile;
  const store = new R.RoomStore(file);
  const handlers = attachHandlers(io, store, { duelPauseMs, premiumSecret: loadSecret(dirname(file)) });

  app.use(express.static(join(here, 'public'), {
    setHeaders(res, path) {
      if (path.endsWith('.webmanifest')) res.setHeader('Content-Type', 'application/manifest+json');
    },
  }));
  app.get('/health', (_req, res) => res.json({ ok: true, ai: AI.aiEnabled() }));

  return new Promise(resolve => {
    http.listen(port, () => {
      const actual = http.address().port;
      if (log) {
        console.log(`🐟 Shoalmates a correr em http://localhost:${actual}`);
        console.log(AI.aiEnabled()
          ? `🤖 IA ligada${process.env.AI_MOCK === '1' ? ' (modo de teste, respostas falsas)' : ''}.`
          : '🤖 IA desligada: define ANTHROPIC_API_KEY para a ligar.');
      }
      resolve({
        port: actual, io, store,
        close: () => new Promise(r => {
          handlers.stop();
          store.saveNow();
          io.close(() => r());
        }),
      });
    });
  });
}

if (process.argv?.[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer({ port: Number(process.env.PORT) || 3000 });
}
