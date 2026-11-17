// Servidor: serve o site e trata das salas em tempo real (Socket.IO).
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import * as R from './rooms.js';
import * as AI from './ai.js';
import { attachHandlers } from './handlers.js';

const here = dirname(fileURLToPath(import.meta.url));

export function startServer({ port = 3000, dataFile = join(here, 'data', 'rooms.json'), log = true, duelPauseMs = 3000 } = {}) {
  const app = express();
  const http = createServer(app);
  const io = new Server(http, { maxHttpBufferSize: 6 * 1024 * 1024 });
  const store = new R.RoomStore(process.env.DATA_DIR ? join(process.env.DATA_DIR, 'rooms.json') : dataFile);
  const handlers = attachHandlers(io, store, { duelPauseMs });

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
        console.log(`🐟 Cardume a correr em http://localhost:${actual}`);
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
