import { Router } from 'express';
import { z } from 'zod';
import { chatSystemPrompt, planInsightsPrompt } from '../ai/prompts.ts';
import { buildMe } from '../auth.ts';
import {
  type Ctx,
  loadEvents,
  loadPlan,
  loadProfile,
  savePlan,
  toEvent,
  uid,
  validate,
} from '../context.ts';
import { nowIso } from '../db.ts';
import { HttpError, newId, RateLimiter } from '../security.ts';
import { addDays, isISODate, weekStart, WEEKDAYS } from '../../shared/dates.ts';
import { generatePlan, newSessionId } from '../../shared/planner.ts';
import { AI_PLAN_IDS } from '../../shared/plans.ts';
import { getSubject } from '../../shared/subjects.ts';
import { ACTIVITY_LABELS, type CalendarEvent, type Questionnaire, type StudyPlan } from '../../shared/types.ts';

const isoDate = z.string().refine(isISODate, 'data inválida');
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'hora inválida');
const subjectId = z.string().regex(/^[a-z0-9-]{1,60}$/, 'disciplina inválida');
const optionalSubject = z.union([subjectId, z.literal('')]);

const questionnaireSchema = z.object({
  name: z.string().trim().min(1, 'escreve o teu nome').max(60),
  year: z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'superior']),
  subjects: z.array(subjectId).min(1, 'escolhe pelo menos uma disciplina').max(30),
  customSubjects: z.record(subjectId, z.string().trim().min(1).max(40)).default({}),
  difficult: z.array(subjectId).max(30).default([]),
  easy: z.array(subjectId).max(30).default([]),
  dailyMinutes: z.number().int().min(15).max(360),
  studyDays: z.array(z.number().int().min(0).max(6)).min(1, 'escolhe pelo menos um dia').max(7),
  startTime: time,
  goal: z.enum(['melhorar-notas', 'preparar-testes', 'trabalhos-casa', 'aprender-melhor', 'organizar-tempo', 'exames']),
  styles: z.array(z.enum(['resumos', 'exercicios', 'explicacoes', 'perguntas', 'exemplos'])).max(5).default([]),
  tests: z
    .array(z.object({ subject: subjectId, date: isoDate, topic: z.string().trim().max(120).optional() }))
    .max(30)
    .default([]),
});

const activity = z.enum([
  'estudo', 'exercicios', 'resumo', 'perguntas', 'exemplos', 'revisao', 'consolidacao', 'tpc', 'preparacao-teste',
]);
const sessionSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  start: time,
  minutes: z.number().int().min(5).max(240),
  subject: optionalSubject,
  activity,
  note: z.string().trim().max(200).optional(),
});

const eventSchema = z.object({
  type: z.enum(['teste', 'trabalho', 'outro']),
  subject: subjectId.nullable(),
  title: z.string().trim().min(1, 'escreve um título').max(120),
  date: isoDate,
  notes: z.string().trim().max(1000).default(''),
});

const logSchema = z.object({
  date: isoDate,
  subject: subjectId.nullable(),
  minutes: z.number().int().min(1).max(600),
  source: z.enum(['timer', 'plano', 'manual']),
  sessionKey: z.string().max(120).nullable().optional(),
});

function cleanQuestionnaire(q: z.infer<typeof questionnaireSchema>): Questionnaire {
  const subjects = [...new Set(q.subjects)];
  const custom: Record<string, string> = {};
  for (const id of subjects) if (q.customSubjects[id]) custom[id] = q.customSubjects[id]!;
  return {
    ...q,
    subjects,
    customSubjects: custom,
    difficult: [...new Set(q.difficult)].filter((id) => subjects.includes(id)),
    easy: [...new Set(q.easy)].filter((id) => subjects.includes(id) && !q.difficult.includes(id)),
    studyDays: [...new Set(q.studyDays)].sort((a, b) => a - b),
    styles: [...new Set(q.styles)],
    tests: [],
  };
}

function planAsText(plan: StudyPlan, q: Questionnaire): string {
  return plan.meta.studyDays
    .map((d) => {
      const items = plan.sessions
        .filter((s) => s.weekday === d)
        .map((s) => `${s.start} ${s.subject ? getSubject(s.subject, q.customSubjects).name : 'TPC'} (${s.minutes} min, ${ACTIVITY_LABELS[s.activity]})`);
      return `${WEEKDAYS[d]}: ${items.join('; ')}`;
    })
    .join('\n');
}

export function studentRouter(ctx: Ctx): Router {
  const r = Router();
  const insightsLimiter = new RateLimiter(6, 60 * 60 * 1000);

  /** Análise do plano pela IA, em segundo plano (não conta para os limites). */
  async function refreshInsights(userId: string): Promise<string | null> {
    if (!ctx.ai.configured) return null;
    const profile = loadProfile(ctx.db, userId);
    const plan = loadPlan(ctx.db, userId);
    const q = profile.questionnaire;
    if (!plan || !q) return null;
    const { text } = await ctx.ai.generateText({
      plan: profile.aiPlan,
      system: chatSystemPrompt({ plan: profile.aiPlan, questionnaire: q, events: [], subject: null }),
      prompt: planInsightsPrompt(q, planAsText(plan, q)),
      maxTokens: 4000,
      effort: 'low',
    });
    const current = loadPlan(ctx.db, userId);
    if (current && current.generatedAt === plan.generatedAt) {
      current.aiInsights = text.trim();
      savePlan(ctx.db, userId, current);
    }
    return text.trim();
  }

  // ---------- Perfil e questionário ----------

  r.put('/profile/questionnaire', (req, res) => {
    const userId = uid(res);
    const body = validate(
      z.object({ questionnaire: questionnaireSchema, regenerate: z.boolean().default(true) }),
      req.body,
    );
    const raw = body.questionnaire;
    const q = cleanQuestionnaire(raw);
    const today = ctx.today();
    let plan = loadPlan(ctx.db, userId);
    ctx.db.tx(() => {
      ctx.db.run(
        'UPDATE profiles SET questionnaire = ?, onboarded = 1, updated_at = ? WHERE user_id = ?',
        JSON.stringify(q),
        nowIso(),
        userId,
      );
      ctx.db.run('UPDATE users SET name = ? WHERE id = ?', q.name, userId);
      for (const t of raw.tests) {
        if (!q.subjects.includes(t.subject)) continue;
        const exists = ctx.db.one(
          "SELECT id FROM events WHERE user_id = ? AND type = 'teste' AND subject = ? AND date = ?",
          userId,
          t.subject,
          t.date,
        );
        if (exists) continue;
        const name = getSubject(t.subject, q.customSubjects).name;
        ctx.db.run(
          'INSERT INTO events (id, user_id, type, subject, title, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          newId(),
          userId,
          'teste',
          t.subject,
          t.topic ? `Teste de ${name}: ${t.topic}` : `Teste de ${name}`,
          t.date,
          '',
          nowIso(),
        );
      }
      if (body.regenerate || !plan) {
        const fresh = generatePlan(q, loadEvents(ctx.db, userId, today), today);
        if (plan) fresh.settings = plan.settings;
        savePlan(ctx.db, userId, fresh);
        plan = fresh;
      }
    });
    if (body.regenerate) refreshInsights(userId).catch((err) => console.warn('[plan] análise da IA falhou:', err?.message));
    res.json({ me: buildMe(ctx, userId), plan });
  });

  r.put('/profile/ai-plan', (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ plan: z.enum(AI_PLAN_IDS as [string, ...string[]]) }), req.body);
    ctx.db.run('UPDATE profiles SET ai_plan = ?, updated_at = ? WHERE user_id = ?', body.plan, nowIso(), userId);
    res.json(buildMe(ctx, userId));
  });

  r.put('/profile/favorites', (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ favorites: z.array(subjectId).max(30) }), req.body);
    ctx.db.run('UPDATE profiles SET favorites = ?, updated_at = ? WHERE user_id = ?', JSON.stringify([...new Set(body.favorites)]), nowIso(), userId);
    res.json(buildMe(ctx, userId));
  });

  r.put('/profile/settings', (req, res) => {
    const userId = uid(res);
    const body = validate(
      z.object({
        reduceMotion: z.boolean().optional(),
        focusMinutes: z.number().int().min(5).max(120).optional(),
        breakMinutes: z.number().int().min(1).max(60).optional(),
      }),
      req.body,
    );
    const current = loadProfile(ctx.db, userId).settings;
    ctx.db.run('UPDATE profiles SET settings = ?, updated_at = ? WHERE user_id = ?', JSON.stringify({ ...current, ...body }), nowIso(), userId);
    res.json(buildMe(ctx, userId));
  });

  // ---------- Plano de estudos ----------

  r.get('/plan', (req, res) => {
    const userId = uid(res);
    const week = typeof req.query.week === 'string' && isISODate(req.query.week) ? weekStart(req.query.week) : weekStart(ctx.today());
    const checks = ctx.db
      .all<{ goal_id: string }>('SELECT goal_id FROM weekly_checks WHERE user_id = ? AND week = ?', userId, week)
      .map((c) => c.goal_id);
    res.json({ plan: loadPlan(ctx.db, userId), week, checks });
  });

  r.post('/plan/generate', (_req, res) => {
    const userId = uid(res);
    const profile = loadProfile(ctx.db, userId);
    if (!profile.questionnaire) throw new HttpError(400, 'Responde primeiro ao questionário.', 'no_questionnaire');
    const today = ctx.today();
    const old = loadPlan(ctx.db, userId);
    const plan = generatePlan(profile.questionnaire, loadEvents(ctx.db, userId, today), today);
    if (old) plan.settings = old.settings;
    savePlan(ctx.db, userId, plan);
    refreshInsights(userId).catch((err) => console.warn('[plan] análise da IA falhou:', err?.message));
    res.json({ plan });
  });

  r.post('/plan/insights', async (_req, res) => {
    const userId = uid(res);
    if (!ctx.ai.configured) throw new HttpError(503, ctx.ai.status().message, 'ai_not_configured');
    if (!insightsLimiter.take(userId)) throw new HttpError(429, 'Pediste muitas análises. Tenta mais tarde.', 'rate_limited');
    const text = await refreshInsights(userId);
    res.json({ aiInsights: text, plan: loadPlan(ctx.db, userId) });
  });

  function mutatePlan(userId: string, fn: (plan: StudyPlan) => void): StudyPlan {
    const plan = loadPlan(ctx.db, userId);
    if (!plan) throw new HttpError(404, 'Ainda não tens um plano de estudos.', 'no_plan');
    fn(plan);
    savePlan(ctx.db, userId, plan);
    return plan;
  }

  r.post('/plan/sessions', (req, res) => {
    const userId = uid(res);
    const body = validate(sessionSchema, req.body);
    const plan = mutatePlan(userId, (p) => {
      if (p.sessions.length >= 120) throw new HttpError(400, 'O plano já tem sessões a mais.', 'too_many');
      p.sessions.push({ id: newSessionId(), ...body });
    });
    res.status(201).json({ plan });
  });

  r.put('/plan/sessions/:id', (req, res) => {
    const userId = uid(res);
    const body = validate(sessionSchema, req.body);
    const plan = mutatePlan(userId, (p) => {
      const s = p.sessions.find((x) => x.id === req.params.id);
      if (!s) throw new HttpError(404, 'Sessão não encontrada.', 'not_found');
      Object.assign(s, body);
      if (!body.note) delete s.note;
    });
    res.json({ plan });
  });

  r.delete('/plan/sessions/:id', (req, res) => {
    const userId = uid(res);
    const plan = mutatePlan(userId, (p) => {
      p.sessions = p.sessions.filter((x) => x.id !== req.params.id);
    });
    res.json({ plan });
  });

  r.put('/plan/settings', (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ autoRevisions: z.boolean() }), req.body);
    const plan = mutatePlan(userId, (p) => {
      p.settings = { ...p.settings, ...body };
    });
    res.json({ plan });
  });

  r.put('/plan/goals/:goalId', (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ week: isoDate, done: z.boolean() }), req.body);
    const goalId = String(req.params.goalId).slice(0, 120);
    const week = weekStart(body.week);
    if (body.done)
      ctx.db.run('INSERT OR IGNORE INTO weekly_checks (user_id, week, goal_id) VALUES (?, ?, ?)', userId, week, goalId);
    else ctx.db.run('DELETE FROM weekly_checks WHERE user_id = ? AND week = ? AND goal_id = ?', userId, week, goalId);
    res.json({ ok: true });
  });

  // ---------- Calendário ----------

  r.get('/events', (req, res) => {
    const userId = uid(res);
    const from = typeof req.query.from === 'string' && isISODate(req.query.from) ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' && isISODate(req.query.to) ? req.query.to : undefined;
    res.json({ events: loadEvents(ctx.db, userId, from, to) });
  });

  r.post('/events', (req, res) => {
    const userId = uid(res);
    const body = validate(eventSchema, req.body);
    const id = newId();
    ctx.db.run(
      'INSERT INTO events (id, user_id, type, subject, title, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      id,
      userId,
      body.type,
      body.subject,
      body.title,
      body.date,
      body.notes,
      nowIso(),
    );
    res.status(201).json({ event: { id, ...body } satisfies CalendarEvent });
  });

  r.put('/events/:id', (req, res) => {
    const userId = uid(res);
    const body = validate(eventSchema, req.body);
    const result = ctx.db.run(
      'UPDATE events SET type = ?, subject = ?, title = ?, date = ?, notes = ? WHERE id = ? AND user_id = ?',
      body.type,
      body.subject,
      body.title,
      body.date,
      body.notes,
      req.params.id,
      userId,
    );
    if (!result.changes) throw new HttpError(404, 'Evento não encontrado.', 'not_found');
    const row = ctx.db.one<Parameters<typeof toEvent>[0]>('SELECT * FROM events WHERE id = ? AND user_id = ?', req.params.id, userId)!;
    res.json({ event: toEvent(row) });
  });

  r.delete('/events/:id', (req, res) => {
    const userId = uid(res);
    ctx.db.run('DELETE FROM events WHERE id = ? AND user_id = ?', req.params.id, userId);
    res.json({ ok: true });
  });

  // ---------- Registos de estudo (sessões feitas, temporizador) ----------

  r.get('/logs', (req, res) => {
    const userId = uid(res);
    const from = typeof req.query.from === 'string' && isISODate(req.query.from) ? req.query.from : addDays(ctx.today(), -30);
    const to = typeof req.query.to === 'string' && isISODate(req.query.to) ? req.query.to : addDays(ctx.today(), 1);
    const logs = ctx.db.all<{
      id: string; date: string; subject: string | null; minutes: number; source: string; session_key: string | null; created_at: string;
    }>(
      'SELECT id, date, subject, minutes, source, session_key, created_at FROM study_logs WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY created_at',
      userId,
      from,
      to,
    );
    res.json({
      logs: logs.map((l) => ({
        id: l.id, date: l.date, subject: l.subject, minutes: l.minutes, source: l.source, sessionKey: l.session_key, createdAt: l.created_at,
      })),
    });
  });

  r.post('/logs', (req, res) => {
    const userId = uid(res);
    const body = validate(logSchema, req.body);
    const id = newId();
    if (body.sessionKey) {
      ctx.db.run(
        `INSERT INTO study_logs (id, user_id, date, subject, minutes, source, session_key, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (user_id, session_key) WHERE session_key IS NOT NULL
         DO UPDATE SET minutes = excluded.minutes, source = excluded.source`,
        id, userId, body.date, body.subject, body.minutes, body.source, body.sessionKey, nowIso(),
      );
    } else {
      ctx.db.run(
        'INSERT INTO study_logs (id, user_id, date, subject, minutes, source, session_key, created_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)',
        id, userId, body.date, body.subject, body.minutes, body.source, nowIso(),
      );
    }
    res.status(201).json({ ok: true });
  });

  r.delete('/logs', (req, res) => {
    const userId = uid(res);
    const key = typeof req.query.sessionKey === 'string' ? req.query.sessionKey : null;
    const id = typeof req.query.id === 'string' ? req.query.id : null;
    if (key) ctx.db.run('DELETE FROM study_logs WHERE user_id = ? AND session_key = ?', userId, key);
    else if (id) ctx.db.run('DELETE FROM study_logs WHERE user_id = ? AND id = ?', userId, id);
    else throw new HttpError(400, 'Indica o registo a apagar.', 'invalid');
    res.json({ ok: true });
  });

  // ---------- Objetivos diários ----------

  r.get('/goals', (req, res) => {
    const userId = uid(res);
    const date = typeof req.query.date === 'string' && isISODate(req.query.date) ? req.query.date : ctx.today();
    const goals = ctx.db
      .all<{ id: string; date: string; text: string; done: number }>(
        'SELECT id, date, text, done FROM daily_goals WHERE user_id = ? AND date = ? ORDER BY created_at',
        userId,
        date,
      )
      .map((g) => ({ ...g, done: Boolean(g.done) }));
    res.json({ goals });
  });

  r.post('/goals', (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ date: isoDate, text: z.string().trim().min(1, 'escreve o objetivo').max(140) }), req.body);
    const count = ctx.db.one<{ n: number }>('SELECT COUNT(*) AS n FROM daily_goals WHERE user_id = ? AND date = ?', userId, body.date)!.n;
    if (count >= 20) throw new HttpError(400, 'Já tens muitos objetivos para este dia.', 'too_many');
    const id = newId();
    ctx.db.run('INSERT INTO daily_goals (id, user_id, date, text, done, created_at) VALUES (?, ?, ?, ?, 0, ?)', id, userId, body.date, body.text, nowIso());
    res.status(201).json({ goal: { id, date: body.date, text: body.text, done: false } });
  });

  r.put('/goals/:id', (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ done: z.boolean().optional(), text: z.string().trim().min(1).max(140).optional() }), req.body);
    if (body.done !== undefined)
      ctx.db.run('UPDATE daily_goals SET done = ? WHERE id = ? AND user_id = ?', body.done ? 1 : 0, req.params.id, userId);
    if (body.text) ctx.db.run('UPDATE daily_goals SET text = ? WHERE id = ? AND user_id = ?', body.text, req.params.id, userId);
    res.json({ ok: true });
  });

  r.delete('/goals/:id', (req, res) => {
    const userId = uid(res);
    ctx.db.run('DELETE FROM daily_goals WHERE id = ? AND user_id = ?', req.params.id, userId);
    res.json({ ok: true });
  });

  // ---------- Estatísticas ----------

  r.get('/stats', (req, res) => {
    const userId = uid(res);
    const db = ctx.db;
    const today = typeof req.query.date === 'string' && isISODate(req.query.date) ? req.query.date : ctx.today();
    const from30 = addDays(today, -29);
    const perDay = db.all<{ date: string; minutes: number }>(
      'SELECT date, SUM(minutes) AS minutes FROM study_logs WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY date',
      userId, addDays(today, -400), today,
    );
    const byDate = new Map(perDay.map((d) => [d.date, d.minutes]));
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = addDays(from30, i);
      return { date, minutes: byDate.get(date) ?? 0 };
    });
    let streak = 0;
    let cursor = byDate.get(today) ? today : addDays(today, -1);
    while (byDate.get(cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    const week = weekStart(today);
    const weekEnd = addDays(week, 6);
    const weekSubjects = db.all<{ subject: string | null; minutes: number }>(
      'SELECT subject, SUM(minutes) AS minutes FROM study_logs WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY subject ORDER BY minutes DESC',
      userId, week, weekEnd,
    );
    const allSubjects = db.all<{ subject: string | null; minutes: number }>(
      'SELECT subject, SUM(minutes) AS minutes FROM study_logs WHERE user_id = ? GROUP BY subject ORDER BY minutes DESC',
      userId,
    );
    const weekSessions = db.one<{ n: number }>(
      'SELECT COUNT(*) AS n FROM study_logs WHERE user_id = ? AND session_key IS NOT NULL AND date >= ? AND date <= ?',
      userId, week, weekEnd,
    )!.n;
    const totalMinutes = db.one<{ m: number | null }>('SELECT SUM(minutes) AS m FROM study_logs WHERE user_id = ?', userId)!.m ?? 0;
    const questions = db.one<{ q: number | null }>('SELECT SUM(questions) AS q FROM usage WHERE user_id = ?', userId)!.q ?? 0;
    const tests = db.all<{ id: string; title: string; subject: string | null; score: number; max_score: number; completed_at: string }>(
      'SELECT id, title, subject, score, max_score, completed_at FROM tests WHERE user_id = ? AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 12',
      userId,
    );
    const cards = db.one<{ total: number; mastered: number | null }>(
      'SELECT COUNT(*) AS total, SUM(CASE WHEN box >= 4 THEN 1 ELSE 0 END) AS mastered FROM cards WHERE user_id = ?',
      userId,
    )!;
    const reviews = db.all<{ date: string; count: number }>(
      'SELECT date, count FROM card_reviews WHERE user_id = ? AND date >= ?',
      userId, addDays(today, -6),
    );
    res.json({
      today,
      days,
      streak,
      weekMinutes: weekSubjects.reduce((a, s) => a + s.minutes, 0),
      weekSubjects,
      allSubjects,
      weekSessions,
      totalMinutes,
      questions,
      summaries: db.one<{ n: number }>('SELECT COUNT(*) AS n FROM summaries WHERE user_id = ?', userId)!.n,
      conversations: db.one<{ n: number }>('SELECT COUNT(*) AS n FROM conversations WHERE user_id = ?', userId)!.n,
      cards: { total: cards.total, mastered: cards.mastered ?? 0 },
      reviewsToday: reviews.find((r) => r.date === today)?.count ?? 0,
      reviewDays: reviews.filter((r) => r.date >= week).length,
      tests: tests.map((t) => ({
        id: t.id, title: t.title, subject: t.subject, score: t.score, maxScore: t.max_score, completedAt: t.completed_at,
      })),
    });
  });

  return r;
}
