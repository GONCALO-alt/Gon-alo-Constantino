import fs from 'node:fs';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { AiService } from './ai/client.ts';
import { authRouter } from './auth.ts';
import { loadConfig, type AppConfig } from './config.ts';
import { type Ctx, makeToday, requireAuth } from './context.ts';
import { Db } from './db.ts';
import { chatRouter, cleanupOrphanAttachments } from './routes/chat.ts';
import { libraryRouter } from './routes/library.ts';
import { studentRouter } from './routes/student.ts';
import { HttpError, requireCsrfHeader, securityHeaders } from './security.ts';

export interface App {
  app: express.Express;
  ctx: Ctx;
  close(): void;
}

export function createApp(overrides: Partial<AppConfig> = {}, dbFile?: string): App {
  const config = loadConfig(overrides);
  const db = new Db(config.dataDir, dbFile);
  const ctx: Ctx = { db, config, ai: new AiService(config), today: makeToday(config) };

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY : false);
  app.use(securityHeaders);

  const api = express.Router();
  api.use(express.json({ limit: '1mb' }));
  api.use(requireCsrfHeader);
  api.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  api.get('/health', (_req, res) => res.json({ ok: true, ai: ctx.ai.configured }));
  api.get('/ai/status', (_req, res) => res.json(ctx.ai.status()));
  api.use(authRouter(ctx));
  api.use(requireAuth(ctx));
  api.use(studentRouter(ctx));
  api.use(chatRouter(ctx));
  api.use(libraryRouter(ctx));
  api.use((_req, _res, next) => next(new HttpError(404, 'Endereço não encontrado.', 'not_found')));
  app.use('/api', api);

  if (config.staticDir && fs.existsSync(config.staticDir)) {
    const staticDir = config.staticDir;
    app.use(
      express.static(staticDir, {
        index: false,
        setHeaders: (res, file) => {
          if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        },
      }),
    );
    // Aplicação de página única: as outras rotas devolvem o index.html.
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) return;
    const body = err as { type?: string; status?: number };
    if (body?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'O ficheiro ou a mensagem é demasiado grande.', code: 'too_large' });
    }
    if (body?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Pedido inválido.', code: 'invalid' });
    }
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, code: err.code });
    console.error('[server] erro', err);
    res.status(500).json({ error: 'Ocorreu um erro no servidor. Tenta novamente.', code: 'server_error' });
  });

  cleanupOrphanAttachments(db);
  const timer = setInterval(() => cleanupOrphanAttachments(db), 3_600_000);
  timer.unref();

  return {
    app,
    ctx,
    close() {
      clearInterval(timer);
      db.close();
    },
  };
}
