import fs from 'node:fs';
import path from 'node:path';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { getUsage } from './ai/usage.ts';
import {
  type Ctx,
  loadEvents,
  loadPlan,
  loadProfile,
  readCookie,
  requireAuth,
  SESSION_COOKIE,
  SESSION_DAYS,
  uid,
  validate,
} from './context.ts';
import { nowIso, parseJson } from './db.ts';
import { getDummyHash, hashPassword, hashToken, HttpError, newId, newToken, RateLimiter, verifyPassword } from './security.ts';
import type { MeResponse, UserPublic } from '../shared/types.ts';

const email = z.string().trim().toLowerCase().email('Email inválido').max(200);
const password = z
  .string()
  .min(8, 'A palavra-passe tem de ter pelo menos 8 caracteres')
  .max(200, 'A palavra-passe é demasiado longa');

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Escreve o teu nome').max(60),
  email,
  password,
});
const loginSchema = z.object({ email, password: z.string().min(1).max(200) });

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
}

export function toPublicUser(u: Pick<UserRow, 'id' | 'email' | 'name' | 'created_at'>): UserPublic {
  return { id: u.id, email: u.email, name: u.name, createdAt: u.created_at };
}

export function buildMe(ctx: Ctx, userId: string): MeResponse {
  const user = ctx.db.one<UserRow>('SELECT id, email, name, created_at FROM users WHERE id = ?', userId);
  if (!user) throw new HttpError(401, 'Conta não encontrada.', 'unauthenticated');
  const profile = loadProfile(ctx.db, userId);
  return {
    user: toPublicUser(user),
    profile,
    usage: getUsage(ctx.db, userId, profile.aiPlan, ctx.today()),
    ai: ctx.ai.status(),
  };
}

export function authRouter(ctx: Ctx): Router {
  const r = Router();
  const authLimiter = new RateLimiter(10, 15 * 60 * 1000);
  const ipLimiter = new RateLimiter(60, 15 * 60 * 1000);

  function startSession(req: Request, res: Response, userId: string) {
    const token = newToken();
    const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
    ctx.db.run(
      'INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
      hashToken(token),
      userId,
      nowIso(),
      expires.toISOString(),
    );
    ctx.db.run('DELETE FROM sessions WHERE expires_at < ?', nowIso());
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: ctx.config.secureCookies || req.secure,
      path: '/',
      expires,
    });
  }

  function limit(req: Request, key: string) {
    const ip = req.ip ?? 'ip';
    if (!ipLimiter.take(ip) || !authLimiter.take(`${ip}|${key}`)) {
      throw new HttpError(429, 'Demasiadas tentativas. Espera alguns minutos e tenta novamente.', 'rate_limited');
    }
  }

  r.post('/auth/register', async (req, res) => {
    const body = validate(registerSchema, req.body);
    limit(req, body.email);
    const existing = ctx.db.one<{ id: string }>('SELECT id FROM users WHERE email = ?', body.email);
    if (existing) throw new HttpError(409, 'Já existe uma conta com este email. Inicia sessão.', 'email_taken');
    const id = newId();
    const hash = await hashPassword(body.password);
    const now = nowIso();
    ctx.db.tx(() => {
      ctx.db.run(
        'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
        id,
        body.email,
        body.name,
        hash,
        now,
      );
      ctx.db.run('INSERT INTO profiles (user_id, updated_at) VALUES (?, ?)', id, now);
    });
    startSession(req, res, id);
    res.status(201).json(buildMe(ctx, id));
  });

  r.post('/auth/login', async (req, res) => {
    const body = validate(loginSchema, req.body);
    limit(req, body.email);
    const user = ctx.db.one<UserRow>('SELECT * FROM users WHERE email = ?', body.email);
    const ok = await verifyPassword(body.password, user?.password_hash ?? (await getDummyHash()));
    if (!user || !ok) throw new HttpError(401, 'Email ou palavra-passe incorretos.', 'bad_credentials');
    startSession(req, res, user.id);
    res.json(buildMe(ctx, user.id));
  });

  r.post('/auth/logout', (req, res) => {
    const token = readCookie(req, SESSION_COOKIE);
    if (token) ctx.db.run('DELETE FROM sessions WHERE token_hash = ?', hashToken(token));
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  r.get('/me', requireAuth(ctx), (_req, res) => {
    res.json(buildMe(ctx, uid(res)));
  });

  r.post('/auth/password', requireAuth(ctx), async (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ current: z.string().min(1).max(200), next: password }), req.body);
    limit(req, userId);
    const user = ctx.db.one<UserRow>('SELECT * FROM users WHERE id = ?', userId);
    if (!user || !(await verifyPassword(body.current, user.password_hash)))
      throw new HttpError(400, 'A palavra-passe atual não está correta.', 'bad_credentials');
    ctx.db.run('UPDATE users SET password_hash = ? WHERE id = ?', await hashPassword(body.next), userId);
    // Termina as outras sessões e abre uma nova neste dispositivo.
    ctx.db.run('DELETE FROM sessions WHERE user_id = ?', userId);
    startSession(req, res, userId);
    res.json({ ok: true });
  });

  r.get('/account/export', requireAuth(ctx), (_req, res) => {
    const userId = uid(res);
    const me = buildMe(ctx, userId);
    const db = ctx.db;
    const data = {
      exportedAt: nowIso(),
      user: me.user,
      profile: me.profile,
      plan: loadPlan(db, userId),
      events: loadEvents(db, userId),
      conversations: db
        .all<{ id: string; title: string; subject: string | null; created_at: string }>(
          'SELECT id, title, subject, created_at FROM conversations WHERE user_id = ? ORDER BY created_at',
          userId,
        )
        .map((c) => ({
          ...c,
          messages: db.all(
            'SELECT role, content, plan, status, created_at FROM messages WHERE conversation_id = ? AND user_id = ? ORDER BY created_at',
            c.id,
            userId,
          ),
        })),
      summaries: db.all('SELECT subject, title, content, source, created_at, updated_at FROM summaries WHERE user_id = ?', userId),
      decks: db.all<{ id: string; subject: string | null; title: string }>('SELECT id, subject, title FROM decks WHERE user_id = ?', userId).map((d) => ({
        ...d,
        cards: db.all('SELECT front, back, box, due, reviews, correct FROM cards WHERE deck_id = ? AND user_id = ?', d.id, userId),
      })),
      tests: db
        .all<Record<string, unknown>>('SELECT subject, topic, difficulty, title, questions, answers, results, score, max_score, created_at, completed_at FROM tests WHERE user_id = ?', userId)
        .map((t) => ({ ...t, questions: parseJson(t.questions, []), answers: parseJson(t.answers, null), results: parseJson(t.results, null) })),
      studyLogs: db.all('SELECT date, subject, minutes, source, created_at FROM study_logs WHERE user_id = ?', userId),
      dailyGoals: db.all('SELECT date, text, done FROM daily_goals WHERE user_id = ?', userId),
    };
    res.setHeader('Content-Disposition', 'attachment; filename="study-ai-dados.json"');
    res.json(data);
  });

  r.delete('/account', requireAuth(ctx), async (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ password: z.string().min(1).max(200) }), req.body);
    limit(req, userId);
    const user = ctx.db.one<UserRow>('SELECT * FROM users WHERE id = ?', userId);
    if (!user || !(await verifyPassword(body.password, user.password_hash)))
      throw new HttpError(400, 'A palavra-passe não está correta.', 'bad_credentials');
    ctx.db.run('DELETE FROM users WHERE id = ?', userId);
    fs.rmSync(path.join(ctx.db.uploadsDir, userId), { recursive: true, force: true });
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  return r;
}
