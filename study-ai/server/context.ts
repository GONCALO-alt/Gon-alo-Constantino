import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { AppConfig } from './config.ts';
import { parseJson, type Db } from './db.ts';
import type { AiService } from './ai/client.ts';
import { HttpError, hashToken } from './security.ts';
import { todayInTimeZone } from '../shared/dates.ts';
import { DEFAULT_AI_PLAN, isAiPlanId } from '../shared/plans.ts';
import type { CalendarEvent, Profile, ProfileSettings, Questionnaire, StudyPlan } from '../shared/types.ts';

export interface Ctx {
  db: Db;
  config: AppConfig;
  ai: AiService;
  /** Data de hoje no fuso horário da aplicação. */
  today(): string;
}

export function makeToday(config: AppConfig) {
  return () => todayInTimeZone(config.timeZone);
}

export const SESSION_COOKIE = 'study_ai_sid';
export const SESSION_DAYS = 30;
/** Sem conta, a sessão é a única forma de voltar aos dados: dura o máximo que os navegadores aceitam. */
export const GUEST_SESSION_DAYS = 400;

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

/** Middleware: exige sessão válida e guarda o id do estudante em `res.locals.userId`. */
export function requireAuth(ctx: Ctx) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = readCookie(req, SESSION_COOKIE);
    if (!token) return next(new HttpError(401, 'Inicia sessão para continuar.', 'unauthenticated'));
    const row = ctx.db.one<{ user_id: string; expires_at: string }>(
      'SELECT user_id, expires_at FROM sessions WHERE token_hash = ?',
      hashToken(token),
    );
    if (!row || row.expires_at < new Date().toISOString()) {
      return next(new HttpError(401, 'A sessão terminou. Inicia sessão novamente.', 'unauthenticated'));
    }
    res.locals.userId = row.user_id;
    next();
  };
}

export function uid(res: Response): string {
  const id = res.locals.userId as string | undefined;
  if (!id) throw new HttpError(401, 'Inicia sessão para continuar.', 'unauthenticated');
  return id;
}

export function validate<S extends z.ZodType>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? ` (${issue.path.join('.')})` : '';
    throw new HttpError(400, `Dados inválidos${where}: ${issue?.message ?? 'verifica o formulário'}`, 'invalid');
  }
  return result.data;
}

export const DEFAULT_SETTINGS: ProfileSettings = { reduceMotion: false, focusMinutes: 25, breakMinutes: 5 };

interface ProfileRow {
  onboarded: number;
  questionnaire: string | null;
  ai_plan: string;
  favorites: string;
  settings: string;
}

export function loadProfile(db: Db, userId: string): Profile {
  const row = db.one<ProfileRow>(
    'SELECT onboarded, questionnaire, ai_plan, favorites, settings FROM profiles WHERE user_id = ?',
    userId,
  );
  return {
    onboarded: Boolean(row?.onboarded),
    questionnaire: parseJson<Questionnaire | null>(row?.questionnaire, null),
    aiPlan: isAiPlanId(row?.ai_plan) ? row.ai_plan : DEFAULT_AI_PLAN,
    favorites: parseJson<string[]>(row?.favorites, []),
    settings: { ...DEFAULT_SETTINGS, ...parseJson<Partial<ProfileSettings>>(row?.settings, {}) },
  };
}

export function loadPlan(db: Db, userId: string): StudyPlan | null {
  const row = db.one<{ data: string }>('SELECT data FROM study_plans WHERE user_id = ?', userId);
  return parseJson<StudyPlan | null>(row?.data, null);
}

export function savePlan(db: Db, userId: string, plan: StudyPlan) {
  db.run(
    `INSERT INTO study_plans (user_id, data, updated_at) VALUES (?, ?, ?)
     ON CONFLICT (user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    userId,
    JSON.stringify(plan),
    new Date().toISOString(),
  );
}

interface EventRow {
  id: string;
  type: CalendarEvent['type'];
  subject: string | null;
  title: string;
  date: string;
  notes: string;
}

export function toEvent(r: EventRow): CalendarEvent {
  return { id: r.id, type: r.type, subject: r.subject, title: r.title, date: r.date, notes: r.notes };
}

export function loadEvents(db: Db, userId: string, from?: string, to?: string): CalendarEvent[] {
  const rows = db.all<EventRow>(
    `SELECT id, type, subject, title, date, notes FROM events
     WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date, created_at`,
    userId,
    from ?? '0000-01-01',
    to ?? '9999-12-31',
  );
  return rows.map(toEvent);
}
