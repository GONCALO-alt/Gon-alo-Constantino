// Núcleo da API /api/... para as versões sem servidor próprio:
//  - versão claude.ai (artefacto): corre dentro da página;
//  - versão Netlify: corre numa função do Netlify.
// Recebe as dependências de fora (IA, ficheiros, armazenamento) e devolve `Response`s.
// Todas as alterações passam por `ctx.commit(...)`, que grava de forma segura mesmo
// quando há dois pedidos ao mesmo tempo (no Netlify a função pode ser repetida).

import { chatSystemPrompt, planInsightsPrompt, structuredSystemPrompt, summarySystemPrompt } from '../server/ai/prompts';
import {
  applyGrades, flashcardsPrompt, gradeClosed, gradePrompt, JSON_FORMATS, normalizeCards, normalizeQuestions, testPrompt,
  type Difficulty, type RawCards, type RawGrades, type RawTest,
} from '../server/ai/materials';
import { addDays, isISODate, weekStart } from '../shared/dates';
import { cleanQuestionnaire, generatePlan, newSessionId, planAsText } from '../shared/planner';
import {
  AI_PLANS, FILE_TYPES, IMAGE_TYPES, isAiPlanId, limitError, MAX_ATTACHMENTS_PER_MESSAGE, MAX_AUDIO_BYTES, MAX_TEXT_BYTES, type AiPlanId, type UsageSnapshot,
} from '../shared/plans';
import { getSubject, yearLabel } from '../shared/subjects';
import {
  longestRun, type AchievementNumbers,
  type AiStatus, type Essay, type EssayKind, type Attachment, type CalendarEvent, type ChatMessage, type Conversation, type DailyGoal, type Deck, type MeResponse, type PlanSession, type PracticeTest, type Questionnaire, type QuestionKind, type StudyLog, type StudyPlan, type Summary,
} from '../shared/types';
import { validSubscription, type VapidKeys } from './push';
import { cleanSettings, pushOf, pushToAll } from './reminders';
import { newId, trimState, type UserState } from './state';
import {
  calendarPrompt, countWords, ESSAY_KINDS, essayPrompt, JSON_CALENDAR, JSON_ESSAY, JSON_NOTES, normalizeCalendar, normalizeEssay, normalizeNotes,
  photoNotesPrompt, type RawCalendar, type RawEssay, type RawNotes,
} from './tools';

export class CoreError extends Error {
  status: number;
  code: string;
  constructor(status: number, message: string, code = 'erro') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface Media {
  mime: string;
  bytes: Uint8Array;
  name: string;
}

/** A IA usada (Claude no claude.ai, Gemini no Netlify). Os erros devem ser `CoreError`. */
export interface CoreAi {
  configured(): boolean;
  status(): AiStatus;
  chat(o: {
    plan: AiPlanId;
    system: string;
    turns: ChatTurn[];
    media: Media[];
    signal: AbortSignal;
    onDelta: (text: string) => void;
  }): Promise<{ text: string; truncated: boolean; aborted: boolean }>;
  text(plan: AiPlanId, system: string, prompt: string): Promise<string>;
  /** Resposta em JSON; `media` são fotografias para a IA ver (só se `vision`). */
  json<T>(plan: AiPlanId, system: string, prompt: string, format: string, media?: Media[]): Promise<T>;
  /** A IA consegue ver fotografias nas respostas em JSON (funções com fotos). */
  vision?: boolean;
  /** Mensagem de erro se a imagem não puder ser usada, senão `null`. */
  checkImage(mime: string, size: number): string | null;
  /** A IA consegue ler PDF? */
  pdf: boolean;
  /** Transforma uma gravação de voz em texto (opcional). */
  transcribe?(audio: Uint8Array, mime: string, signal?: AbortSignal): Promise<string>;
}

export interface StoredFile {
  meta: Attachment;
  bytes: Uint8Array;
  text?: string;
  messageId?: string;
}

export interface CoreFiles {
  put(f: StoredFile): Promise<void>;
  get(id: string): Promise<StoredFile | null>;
  setMessage(id: string, messageId: string | undefined): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface CoreContext {
  /** Estado mais recente do estudante (lido uma vez por pedido). */
  state(): Promise<UserState>;
  /** Aplica uma alteração e grava. A função pode correr mais do que uma vez: só deve mudar `s`. */
  commit<T>(fn: (s: UserState) => T): Promise<T>;
  files: CoreFiles;
}

export interface CoreOptions {
  ai: CoreAi;
  today(): string;
  /** Tamanhos máximos de envio (bytes). */
  maxImageBytes: number;
  maxPdfBytes: number;
  /** Lembretes no telemóvel (Web Push). Sem isto, a versão não tem lembretes. */
  push?: PushHost;
}

export interface PushHost {
  /** Chaves VAPID do servidor (criadas uma vez e guardadas). */
  vapid(): Promise<VapidKeys>;
  /** Avisado quando o estudante liga ou desliga os lembretes (lista para a tarefa agendada). */
  index?(uid: string, on: boolean): Promise<void>;
  /** Aceitar endereços locais nas subscrições (só nos testes). */
  allowLocal?: boolean;
}

interface Req {
  method: string;
  path: string;
  query: URLSearchParams;
  body: any;
  headers: Headers;
  signal?: AbortSignal;
}

type Handler = (r: Req & { params: Record<string, string> }, ctx: CoreContext) => unknown | Promise<unknown>;

const now = () => new Date().toISOString();
/** Pedidos que criam algo respondem 201, como a versão com servidor próprio. */
const CREATED = new Set([
  '/plan/sessions', '/events', '/logs', '/goals', '/uploads', '/summaries', '/summaries/generate',
  '/decks', '/decks/generate', '/decks/:id/cards', '/tests/generate', '/photos/materials', '/essays/review',
]);
const BOX_INTERVAL = [0, 1, 2, 4, 7, 14];

export function fail(status: number, message: string, code = 'erro'): never {
  throw new CoreError(status, message, code);
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export function createCore(opts: CoreOptions) {
  const { ai } = opts;
  const today = () => opts.today();
  const routes: { method: string; path: string; pattern: RegExp; keys: string[]; handler: Handler }[] = [];
  const route = (method: string, path: string, handler: Handler) => {
    const keys: string[] = [];
    const pattern = new RegExp(`^${path.replace(/:([a-zA-Z]+)/g, (_m, k: string) => (keys.push(k), '([^/]+)'))}$`);
    routes.push({ method, path, pattern, keys, handler });
  };

  // ---------- utilitários ----------

  const usageOf = (s: UserState): UsageSnapshot => {
    const plan = s.profile.aiPlan;
    const day = today();
    const u = s.usage[`${day}|${plan}`] ?? { questions: 0, images: 0 };
    const p = AI_PLANS[plan];
    return { plan, day, questionsUsed: u.questions, questionsLimit: p.dailyQuestions, imagesUsed: u.images, imagesLimit: p.dailyImages, files: p.files };
  };
  const assertAllowed = (s: UserState, o: { images?: number; files?: number } = {}) => {
    const e = limitError(usageOf(s), o);
    if (e) fail(e.status, e.message, e.code);
  };
  const record = (s: UserState, plan: AiPlanId, add: { questions?: number; images?: number }) => {
    const key = `${today()}|${plan}`;
    const u = (s.usage[key] ??= { questions: 0, images: 0 });
    u.questions += add.questions ?? 0;
    u.images += add.images ?? 0;
    const cutoff = addDays(today(), -40);
    for (const k of Object.keys(s.usage)) if (k.slice(0, 10) < cutoff) delete s.usage[k];
  };
  const me = (s: UserState): MeResponse => ({
    user: { id: s.user.id, email: s.user.email, name: s.user.name, createdAt: s.user.createdAt, ...(s.user.guest ? { guest: true } : {}) },
    profile: s.profile,
    usage: usageOf(s),
    ai: ai.status(),
    features: [...(ai.configured() ? ['essays', ...(ai.vision ? ['photos'] : [])] : []), ...(opts.push ? ['push'] : [])],
  });
  const subjectName = (s: UserState, id: string | null | undefined) => (id ? getSubject(id, s.profile.questionnaire?.customSubjects).name : 'estudo');
  const requireAi = () => {
    if (!ai.configured()) fail(503, ai.status().message, 'ai_not_configured');
  };
  const planOf = (s: UserState): StudyPlan => s.plan ?? fail(404, 'Ainda não tens um plano de estudos.', 'no_plan');
  const deckView = (s: UserState, id: string, date: string): Deck => {
    const d = s.decks[id]!;
    return {
      id,
      subject: d.deck.subject,
      title: d.deck.title,
      createdAt: d.deck.createdAt,
      cardCount: d.cards.length,
      dueCount: d.cards.filter((c) => c.due <= date).length,
      masteredCount: d.cards.filter((c) => c.box >= 4).length,
    };
  };
  const preview = (c: { messages: ChatMessage[] }) =>
    (c.messages[c.messages.length - 1]?.content ?? '').replace(/[#*_`$>\-]/g, '').replace(/\s+/g, ' ').slice(0, 120);

  // ---------- perfil e questionário ----------

  route('GET', '/me', async (_r, ctx) => me(await ctx.state()));
  route('GET', '/health', () => ({ ok: true, app: 'STUDY AI', ai: ai.configured() }));

  // ---------- voz: gravação → texto (não conta como pergunta) ----------

  route('POST', '/transcribe', async ({ body, headers, signal }) => {
    if (!ai.transcribe || !ai.configured()) fail(501, 'Nesta versão a gravação de voz não está disponível. Usa o ditado do teclado.', 'no_voice');
    const bytes = body instanceof Uint8Array ? body : new Uint8Array(0);
    if (bytes.length < 200) fail(400, 'A gravação ficou vazia. Tenta outra vez, a falar perto do telemóvel.', 'empty');
    if (bytes.length > MAX_AUDIO_BYTES) fail(413, 'A gravação é demasiado longa. Grava no máximo 2 minutos de cada vez.', 'too_large');
    const mime = (headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
    if (!mime.startsWith('audio/')) fail(415, 'Isto não parece uma gravação de áudio.', 'bad_type');
    const text = (await ai.transcribe!(bytes, mime, signal)).trim();
    if (!text) fail(422, 'Não percebi o que disseste. Tenta outra vez, devagar e perto do microfone.', 'no_speech');
    return { text };
  });
  route('GET', '/ai/status', () => ai.status());

  route('PUT', '/profile/questionnaire', async ({ body }, ctx) => {
    const raw = body?.questionnaire as Questionnaire | undefined;
    if (!raw?.name?.trim()) fail(400, 'Escreve o teu nome.', 'invalid');
    if (!Array.isArray(raw.subjects) || !raw.subjects.length) fail(400, 'Escolhe pelo menos uma disciplina.', 'invalid');
    const questionnaire = cleanQuestionnaire({ ...raw, customSubjects: raw.customSubjects ?? {}, name: raw.name.trim().slice(0, 60) });
    const regenerate = body.regenerate !== false;
    const s = await ctx.commit((s) => {
      s.profile = { ...s.profile, questionnaire, onboarded: true };
      s.user = { ...s.user, name: questionnaire.name };
      for (const t of raw.tests ?? []) {
        if (!t.subject || !isISODate(t.date) || !questionnaire.subjects.includes(t.subject)) continue;
        if (s.events.some((e) => e.type === 'teste' && e.subject === t.subject && e.date === t.date)) continue;
        const name = getSubject(t.subject, questionnaire.customSubjects).name;
        s.events.push({ id: newId(), type: 'teste', subject: t.subject, title: t.topic ? `Teste de ${name}: ${t.topic}` : `Teste de ${name}`, date: t.date, notes: '' });
      }
      s.events.sort((a, b) => a.date.localeCompare(b.date));
      if (regenerate || !s.plan) {
        const fresh = generatePlan(questionnaire, s.events.filter((e) => e.date >= today()), today());
        if (s.plan) fresh.settings = s.plan.settings;
        s.plan = fresh;
      }
      return s;
    });
    return { me: me(s), plan: s.plan };
  });

  route('PUT', '/profile/ai-plan', async ({ body }, ctx) => {
    if (!isAiPlanId(body?.plan)) fail(400, 'Plano inválido.', 'invalid');
    return me(await ctx.commit((s) => ((s.profile = { ...s.profile, aiPlan: body.plan }), s)));
  });
  route('PUT', '/profile/favorites', async ({ body }, ctx) => {
    const favorites = [...new Set((Array.isArray(body?.favorites) ? body.favorites : []) as string[])].slice(0, 30);
    return me(await ctx.commit((s) => ((s.profile = { ...s.profile, favorites }), s)));
  });
  route('PUT', '/profile/settings', async ({ body }, ctx) => {
    const patch: Record<string, unknown> = {};
    if (typeof body?.reduceMotion === 'boolean') patch.reduceMotion = body.reduceMotion;
    if (Number.isFinite(body?.focusMinutes)) patch.focusMinutes = Math.min(120, Math.max(5, Math.round(body.focusMinutes)));
    if (Number.isFinite(body?.breakMinutes)) patch.breakMinutes = Math.min(60, Math.max(1, Math.round(body.breakMinutes)));
    return me(await ctx.commit((s) => ((s.profile = { ...s.profile, settings: { ...s.profile.settings, ...patch } }), s)));
  });

  // ---------- plano de estudos ----------

  route('GET', '/plan', async ({ query }, ctx) => {
    const s = await ctx.state();
    const week = weekStart(isISODate(query.get('week')) ? query.get('week')! : today());
    return { plan: s.plan, week, checks: s.checks[week] ?? [] };
  });
  route('POST', '/plan/generate', async (_r, ctx) => {
    const s = await ctx.commit((s) => {
      const questionnaire = s.profile.questionnaire ?? fail(400, 'Responde primeiro ao questionário.', 'no_questionnaire');
      const plan = generatePlan(questionnaire, s.events.filter((e) => e.date >= today()), today());
      if (s.plan) plan.settings = s.plan.settings;
      s.plan = plan;
      return s;
    });
    return { plan: s.plan };
  });
  route('POST', '/plan/insights', async (_r, ctx) => {
    requireAi();
    const s = await ctx.state();
    const q = s.profile.questionnaire;
    const plan = s.plan;
    if (!q || !plan) fail(400, 'Ainda não tens um plano de estudos.', 'no_plan');
    const text = (
      await ai.text(s.profile.aiPlan, chatSystemPrompt({ plan: s.profile.aiPlan, questionnaire: q, events: [], subject: null }), planInsightsPrompt(q, planAsText(plan, q)))
    ).trim();
    const after = await ctx.commit((st) => {
      if (st.plan && st.plan.generatedAt === plan.generatedAt) st.plan = { ...st.plan, aiInsights: text };
      return st;
    });
    return { aiInsights: text, plan: after.plan };
  });

  const sessionFields = (b: any): Omit<PlanSession, 'id'> => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(b?.start))) fail(400, 'Hora inválida.', 'invalid');
    return {
      weekday: Math.min(6, Math.max(0, Number(b.weekday) || 0)),
      start: String(b.start),
      minutes: Math.min(240, Math.max(5, Number(b.minutes) || 30)),
      subject: String(b.subject ?? '').slice(0, 60),
      activity: b.activity,
      ...(b.note ? { note: String(b.note).slice(0, 200) } : {}),
    };
  };
  route('POST', '/plan/sessions', async ({ body }, ctx) => {
    const fields = sessionFields(body);
    const s = await ctx.commit((s) => {
      const plan = planOf(s);
      s.plan = { ...plan, sessions: [...plan.sessions, { id: newSessionId(), ...fields }] };
      return s;
    });
    return { plan: s.plan };
  });
  route('PUT', '/plan/sessions/:id', async ({ params, body }, ctx) => {
    const fields = sessionFields(body);
    const s = await ctx.commit((s) => {
      const plan = planOf(s);
      if (!plan.sessions.some((x) => x.id === params.id)) fail(404, 'Sessão não encontrada.', 'not_found');
      s.plan = { ...plan, sessions: plan.sessions.map((x) => (x.id === params.id ? { id: x.id, ...fields } : x)) };
      return s;
    });
    return { plan: s.plan };
  });
  route('DELETE', '/plan/sessions/:id', async ({ params }, ctx) => {
    const s = await ctx.commit((s) => {
      const plan = planOf(s);
      s.plan = { ...plan, sessions: plan.sessions.filter((x) => x.id !== params.id) };
      return s;
    });
    return { plan: s.plan };
  });
  route('PUT', '/plan/settings', async ({ body }, ctx) => {
    const s = await ctx.commit((s) => {
      const plan = planOf(s);
      s.plan = { ...plan, settings: { ...plan.settings, autoRevisions: !!body?.autoRevisions } };
      return s;
    });
    return { plan: s.plan };
  });
  route('PUT', '/plan/goals/:goalId', async ({ params, body }, ctx) => {
    if (!isISODate(body?.week)) fail(400, 'Semana inválida.', 'invalid');
    const week = weekStart(body.week);
    await ctx.commit((s) => {
      const list = new Set(s.checks[week] ?? []);
      if (body.done) list.add(params.goalId!.slice(0, 120));
      else list.delete(params.goalId!);
      s.checks = { ...s.checks, [week]: [...list] };
    });
    return { ok: true };
  });

  // ---------- calendário ----------

  const eventFields = (b: any) => {
    if (!String(b?.title ?? '').trim()) fail(400, 'Escreve um título.', 'invalid');
    if (!isISODate(b?.date)) fail(400, 'Data inválida.', 'invalid');
    const type = ['teste', 'trabalho', 'outro'].includes(b.type) ? b.type : 'outro';
    return { type, subject: b.subject ?? null, title: String(b.title).trim().slice(0, 120), date: b.date, notes: String(b.notes ?? '').slice(0, 1000) } as Omit<CalendarEvent, 'id'>;
  };
  route('GET', '/events', async ({ query }, ctx) => {
    const s = await ctx.state();
    const from = query.get('from') ?? '0000-01-01';
    const to = query.get('to') ?? '9999-12-31';
    return { events: s.events.filter((e) => e.date >= from && e.date <= to).sort((a, b) => a.date.localeCompare(b.date)) };
  });
  route('POST', '/events', async ({ body }, ctx) => {
    const event: CalendarEvent = { id: newId(), ...eventFields(body) };
    await ctx.commit((s) => void (s.events = [...s.events, event]));
    return { event };
  });
  route('PUT', '/events/:id', async ({ params, body }, ctx) => {
    const event: CalendarEvent = { id: params.id!, ...eventFields(body) };
    await ctx.commit((s) => {
      if (!s.events.some((e) => e.id === params.id)) fail(404, 'Evento não encontrado.', 'not_found');
      s.events = s.events.map((e) => (e.id === params.id ? event : e));
    });
    return { event };
  });
  route('DELETE', '/events/:id', async ({ params }, ctx) => {
    await ctx.commit((s) => void (s.events = s.events.filter((e) => e.id !== params.id)));
    return { ok: true };
  });

  // ---------- registos de estudo e objetivos ----------

  route('GET', '/logs', async ({ query }, ctx) => {
    const s = await ctx.state();
    const from = query.get('from') ?? addDays(today(), -30);
    const to = query.get('to') ?? addDays(today(), 1);
    return { logs: s.logs.filter((l) => l.date >= from && l.date <= to).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) };
  });
  route('POST', '/logs', async ({ body }, ctx) => {
    if (!isISODate(body?.date)) fail(400, 'Data inválida.', 'invalid');
    const log: StudyLog = {
      id: newId(),
      date: body.date,
      subject: body.subject ?? null,
      minutes: Math.max(1, Math.min(600, Math.round(Number(body.minutes)) || 1)),
      source: ['timer', 'plano', 'manual'].includes(body.source) ? body.source : 'manual',
      sessionKey: body.sessionKey ? String(body.sessionKey).slice(0, 120) : null,
      createdAt: now(),
    };
    await ctx.commit((s) => {
      const existing = log.sessionKey ? s.logs.find((l) => l.sessionKey === log.sessionKey) : undefined;
      s.logs = existing ? s.logs.map((l) => (l === existing ? { ...l, minutes: log.minutes, source: log.source } : l)) : [...s.logs, log];
    });
    return { ok: true };
  });
  route('DELETE', '/logs', async ({ query }, ctx) => {
    const key = query.get('sessionKey');
    const id = query.get('id');
    if (!key && !id) fail(400, 'Indica o registo a apagar.', 'invalid');
    await ctx.commit((s) => void (s.logs = s.logs.filter((l) => (key ? l.sessionKey !== key : l.id !== id))));
    return { ok: true };
  });
  route('GET', '/goals', async ({ query }, ctx) => {
    const s = await ctx.state();
    const date = query.get('date') ?? today();
    return { goals: s.goals.filter((g) => g.date === date) };
  });
  route('POST', '/goals', async ({ body }, ctx) => {
    const text = String(body?.text ?? '').trim().slice(0, 140);
    if (!text) fail(400, 'Escreve o objetivo.', 'invalid');
    if (!isISODate(body?.date)) fail(400, 'Data inválida.', 'invalid');
    const goal: DailyGoal = { id: newId(), date: body.date, text, done: false };
    await ctx.commit((s) => void (s.goals = [...s.goals, goal]));
    return { goal };
  });
  route('PUT', '/goals/:id', async ({ params, body }, ctx) => {
    await ctx.commit((s) => {
      s.goals = s.goals.map((g) =>
        g.id === params.id
          ? { ...g, ...(typeof body?.done === 'boolean' ? { done: body.done } : {}), ...(body?.text ? { text: String(body.text).slice(0, 140) } : {}) }
          : g,
      );
    });
    return { ok: true };
  });
  route('DELETE', '/goals/:id', async ({ params }, ctx) => {
    await ctx.commit((s) => void (s.goals = s.goals.filter((g) => g.id !== params.id)));
    return { ok: true };
  });

  // ---------- estatísticas ----------

  function achievementNumbers(s: UserState, week: string, weekEnd: string, byDate: Map<string, number>): AchievementNumbers {
    const done = Object.values(s.tests).filter((t) => t.completedAt);
    const inWeek = (d: string) => d >= week && d <= weekEnd;
    return {
      bestStreak: longestRun([...byDate.entries()].filter(([, m]) => m > 0).map(([d]) => d)),
      studyDays: [...byDate.values()].filter((m) => m > 0).length,
      sessionsDone: s.logs.filter((l) => l.sessionKey).length,
      testsDone: done.length,
      testsExcellent: done.filter((t) => t.maxScore > 0 && (t.score ?? 0) / t.maxScore >= 0.9).length,
      reviewsTotal: Object.values(s.cardReviews).reduce((a, n) => a + n, 0),
      subjectsStudied: new Set(s.logs.map((l) => l.subject).filter(Boolean)).size,
      weekTests: done.filter((t) => inWeek(t.completedAt!.slice(0, 10))).length,
      weekReviews: Object.entries(s.cardReviews).filter(([d]) => inWeek(d)).reduce((a, [, n]) => a + n, 0),
      weekQuestions: Object.entries(s.usage).filter(([k]) => inWeek(k.slice(0, 10))).reduce((a, [, u]) => a + u.questions, 0),
      weekDays: new Set(s.logs.filter((l) => inWeek(l.date) && l.minutes > 0).map((l) => l.date)).size,
    };
  }

  route('GET', '/stats', async ({ query }, ctx) => {
    const s = await ctx.state();
    const date = isISODate(query.get('date')) ? query.get('date')! : today();
    const byDate = new Map<string, number>();
    for (const l of s.logs) byDate.set(l.date, (byDate.get(l.date) ?? 0) + l.minutes);
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = addDays(date, i - 29);
      return { date: d, minutes: byDate.get(d) ?? 0 };
    });
    let streak = 0;
    let cursor = byDate.get(date) ? date : addDays(date, -1);
    while (byDate.get(cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    const week = weekStart(date);
    const weekEnd = addDays(week, 6);
    const group = (logs: StudyLog[]) => {
      const m = new Map<string | null, number>();
      for (const l of logs) m.set(l.subject, (m.get(l.subject) ?? 0) + l.minutes);
      return [...m.entries()].map(([subject, minutes]) => ({ subject, minutes })).sort((a, b) => b.minutes - a.minutes);
    };
    const weekLogs = s.logs.filter((l) => l.date >= week && l.date <= weekEnd);
    const cards = Object.values(s.decks).flatMap((d) => d.cards);
    const tests = Object.values(s.tests)
      .filter((t) => t.completedAt)
      .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
      .slice(0, 12)
      .map((t) => ({ id: t.id, title: t.title, subject: t.subject, score: t.score ?? 0, maxScore: t.maxScore, completedAt: t.completedAt! }));
    return {
      today: date,
      days,
      streak,
      weekMinutes: weekLogs.reduce((a, l) => a + l.minutes, 0),
      weekSubjects: group(weekLogs),
      allSubjects: group(s.logs),
      weekSessions: weekLogs.filter((l) => l.sessionKey).length,
      totalMinutes: s.logs.reduce((a, l) => a + l.minutes, 0),
      timerMinutes: s.logs.filter((l) => l.source === 'timer').reduce((a, l) => a + l.minutes, 0),
      questions: Object.values(s.usage).reduce((a, u) => a + u.questions, 0),
      summaries: Object.keys(s.summaries).length,
      conversations: Object.keys(s.conversations).length,
      cards: { total: cards.length, mastered: cards.filter((c) => c.box >= 4).length },
      reviewsToday: s.cardReviews[date] ?? 0,
      reviewDays: Object.keys(s.cardReviews).filter((d) => d >= week && d <= date).length,
      tests,
      achievements: achievementNumbers(s, week, weekEnd, byDate),
    };
  });

  // ---------- conversas e anexos ----------

  route('GET', '/conversations', async ({ query }, ctx) => {
    const s = await ctx.state();
    const text = (query.get('q') ?? '').trim().toLowerCase();
    const list = Object.values(s.conversations)
      .filter((c) => !text || c.conversation.title.toLowerCase().includes(text) || c.messages.some((m) => m.content.toLowerCase().includes(text)))
      .sort((a, b) => b.conversation.updatedAt.localeCompare(a.conversation.updatedAt))
      .map((c) => ({ ...c.conversation, preview: preview(c) }));
    return { conversations: list };
  });
  const convOf = (s: UserState, id: string) => s.conversations[id] ?? fail(404, 'Conversa não encontrada.', 'not_found');
  route('GET', '/conversations/:id', async ({ params }, ctx) => {
    const c = convOf(await ctx.state(), params.id!);
    return { conversation: c.conversation, messages: c.messages };
  });
  route('PATCH', '/conversations/:id', async ({ params, body }, ctx) => {
    const s = await ctx.commit((s) => {
      const c = convOf(s, params.id!);
      const conversation: Conversation = {
        ...c.conversation,
        ...(body?.title ? { title: String(body.title).slice(0, 80) } : {}),
        ...(body?.subject !== undefined ? { subject: body.subject } : {}),
      };
      s.conversations = { ...s.conversations, [params.id!]: { ...c, conversation } };
      return s;
    });
    return { conversation: s.conversations[params.id!]!.conversation };
  });
  route('DELETE', '/conversations/:id', async ({ params }, ctx) => {
    const before = (await ctx.state()).conversations[params.id!];
    await ctx.commit((s) => {
      const copy = { ...s.conversations };
      delete copy[params.id!];
      s.conversations = copy;
    });
    for (const m of before?.messages ?? []) for (const a of m.attachments) await ctx.files.remove(a.id).catch(() => {});
    return { ok: true };
  });

  route('POST', '/uploads', async ({ body, headers }, ctx) => {
    const bytes = body instanceof Uint8Array ? body : new Uint8Array(0);
    if (!bytes.length) fail(400, 'O ficheiro está vazio.', 'empty');
    let name = 'ficheiro';
    try {
      name = decodeURIComponent(headers.get('x-file-name') ?? 'ficheiro');
    } catch {
      /* nome genérico */
    }
    name = name.replace(/[\\/\0\r\n]/g, '_').slice(0, 120) || 'ficheiro';
    const type = (headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
    const s = await ctx.state();
    const plan = AI_PLANS[s.profile.aiPlan];
    const sniffed = sniff(bytes);
    const isImage = !!sniffed && (IMAGE_TYPES as readonly string[]).includes(sniffed);
    const isPdf = sniffed === 'application/pdf';
    const isText = !isImage && !isPdf && ((FILE_TYPES as readonly string[]).includes(type) || /\.(txt|md|csv)$/i.test(name));
    let meta: Attachment;
    let text: string | undefined;
    if (isImage) {
      if (plan.dailyImages === 0) fail(403, `O ${plan.name} não permite carregar imagens. Escolhe o Cláudio 5.5 ou o Cláudio 6.`, 'plan_no_images');
      if (bytes.length > opts.maxImageBytes) fail(413, `A imagem é maior do que ${Math.round(opts.maxImageBytes / 1048576)} MB. Tira uma fotografia mais pequena.`, 'too_large');
      const u = usageOf(s);
      if (u.imagesLimit !== null && u.imagesUsed >= u.imagesLimit) fail(429, `Já usaste as ${u.imagesLimit} imagens de hoje do ${plan.name}.`, 'limit_images');
      const problem = ai.checkImage(sniffed!, bytes.length);
      if (problem) fail(415, problem, 'bad_image');
      meta = { id: newId(), kind: 'image', mime: sniffed!, name, size: bytes.length };
    } else if (isPdf) {
      if (!plan.files) fail(403, `O ${plan.name} não permite carregar ficheiros. Só o Cláudio 6 analisa documentos.`, 'plan_no_files');
      if (!ai.pdf) fail(415, 'Nesta versão os PDF não podem ser lidos. Copia o texto para um ficheiro .txt.', 'bad_type');
      if (bytes.length > opts.maxPdfBytes) fail(413, `O PDF é maior do que ${Math.round(opts.maxPdfBytes / 1048576)} MB.`, 'too_large');
      meta = { id: newId(), kind: 'file', mime: 'application/pdf', name, size: bytes.length };
    } else if (isText) {
      if (!plan.files) fail(403, `O ${plan.name} não permite carregar ficheiros. Só o Cláudio 6 analisa documentos.`, 'plan_no_files');
      if (bytes.length > MAX_TEXT_BYTES) fail(413, 'O ficheiro de texto é maior do que 1 MB.', 'too_large');
      try {
        text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes);
      } catch {
        fail(415, 'O ficheiro não parece ser texto.', 'bad_type');
      }
      meta = { id: newId(), kind: 'file', mime: 'text/plain', name, size: bytes.length };
    } else {
      fail(415, 'Tipo de ficheiro não suportado. Usa imagens (JPG, PNG, WEBP, GIF), PDF ou ficheiros de texto (TXT, MD, CSV).', 'bad_type');
    }
    await ctx.files.put({ meta, bytes, ...(text !== undefined ? { text } : {}) });
    return { attachment: meta };
  });
  route('GET', '/attachments/:id', async ({ params }, ctx) => {
    const f = await ctx.files.get(params.id!);
    if (!f) fail(404, 'Ficheiro não encontrado.', 'not_found');
    return new Response(f.bytes as BodyInit, {
      headers: {
        'Content-Type': f.meta.mime,
        'Cache-Control': 'private, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': `${f.meta.kind === 'image' ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(f.meta.name)}`,
      },
    });
  });
  route('DELETE', '/attachments/:id', async ({ params }, ctx) => {
    const f = await ctx.files.get(params.id!);
    if (f && !f.messageId) await ctx.files.remove(params.id!);
    return { ok: true };
  });

  route('POST', '/chat/send', async ({ body, signal }, ctx) => {
    const content = String(body?.content ?? '').slice(0, 20000);
    const ids = [...new Set((Array.isArray(body?.attachmentIds) ? body.attachmentIds : []) as string[])].slice(0, MAX_ATTACHMENTS_PER_MESSAGE);
    if (!content.trim() && !ids.length) fail(400, 'Escreve uma pergunta.', 'empty');
    requireAi();
    const files = await Promise.all(ids.map((id) => ctx.files.get(id)));
    if (files.some((f) => !f || f.messageId)) fail(400, 'Um dos anexos já não existe. Volta a carregá-lo.', 'bad_attachment');
    const images = files.filter((f) => f!.meta.kind === 'image').length;
    assertAllowed(await ctx.state(), { images, files: files.length - images });

    const userMessage: ChatMessage = { id: newId(), role: 'user', content, attachments: files.map((f) => f!.meta), plan: 'claudio-5', status: 'ok', createdAt: now() };
    const newConvId = newId();
    const subject = body?.subject === undefined ? undefined : (body.subject ?? null);
    // 1) Guarda a pergunta (e cria a conversa, se for nova).
    const s = await ctx.commit((s) => {
      userMessage.plan = s.profile.aiPlan;
      let entry = body?.conversationId ? convOf(s, body.conversationId) : null;
      if (!entry) {
        const clean = (content || files[0]?.meta.name || '').replace(/\s+/g, ' ').trim();
        const conversation: Conversation = {
          id: newConvId,
          title: clean ? (clean.length > 60 ? `${clean.slice(0, 57)}…` : clean) : 'Nova conversa',
          subject: subject ?? null,
          createdAt: userMessage.createdAt,
          updatedAt: userMessage.createdAt,
        };
        entry = { conversation, messages: [] };
      } else if (subject !== undefined) entry = { ...entry, conversation: { ...entry.conversation, subject } };
      s.conversations = { ...s.conversations, [entry.conversation.id]: { ...entry, messages: [...entry.messages, userMessage] } };
      return s;
    });
    const conv = Object.values(s.conversations).find((c) => c.messages.some((m) => m.id === userMessage.id))!;
    const convId = conv.conversation.id;
    const created = convId === newConvId;
    for (const f of files) await ctx.files.setMessage(f!.meta.id, userMessage.id);
    const plan = s.profile.aiPlan;

    // 2) Prepara o pedido à IA: histórico recente + anexos da última mensagem.
    const history = conv.messages.slice(-40).filter((m) => m.content.trim() || m.role === 'user');
    while (history.length && history[0]!.role !== 'user') history.shift();
    const texts = new Map<string, string>();
    for (const m of history) for (const a of m.attachments) if (a.kind === 'file') {
      const f = a.id === undefined ? null : await ctx.files.get(a.id);
      if (f?.text !== undefined) texts.set(a.id, f.text);
    }
    const turns: ChatTurn[] = [];
    history.forEach((m, i) => {
      const last = i === history.length - 1;
      let text = m.role === 'user' ? m.content.trim() || 'Analisa o que te enviei e ajuda-me.' : m.content;
      if (m.role === 'user')
        for (const a of m.attachments) {
          if (texts.has(a.id)) text += `\n\n[Ficheiro «${a.name}»]\n"""\n${texts.get(a.id)!.slice(0, 60000)}\n"""`;
          else if (last) text += `\n\n[Anexo: ${a.name}]`;
          else text += `\n\n[Anexo enviado antes: ${a.name}]`;
        }
      const prev = turns[turns.length - 1];
      if (prev && prev.role === m.role) prev.content += `\n\n${text}`;
      else turns.push({ role: m.role, content: text });
    });
    const media: Media[] = files.filter((f) => f!.meta.kind === 'image' || f!.meta.mime === 'application/pdf').map((f) => ({ mime: f!.meta.mime, bytes: f!.bytes, name: f!.meta.name }));
    const system = chatSystemPrompt({
      plan,
      questionnaire: s.profile.questionnaire,
      events: s.events.filter((e) => e.date >= today()),
      subject: conv.conversation.subject,
    });

    const rollback = async () => {
      await ctx.commit((st) => {
        const c = st.conversations[convId];
        if (!c) return;
        const messages = c.messages.filter((m) => m.id !== userMessage.id);
        const copy = { ...st.conversations };
        if (created && !messages.length) delete copy[convId];
        else copy[convId] = { ...c, messages };
        st.conversations = copy;
      });
      for (const f of files) await ctx.files.setMessage(f!.meta.id, undefined).catch(() => {});
    };

    // 3) Resposta em streaming (Server-Sent Events).
    return sse(signal, async (send) => {
      send('start', { conversation: conv.conversation, userMessage });
      try {
        const r = await ai.chat({ plan, system, turns, media, signal: signal ?? new AbortController().signal, onDelta: (d) => send('delta', { text: d }) });
        let text = r.text;
        if (r.truncated) text += '\n\n_(A resposta foi cortada. Pede «continua» para ver o resto.)_';
        if (!text.trim()) {
          await rollback();
          send('error', { message: 'A resposta foi interrompida antes de começar. A pergunta não foi contada.', code: 'empty' });
          return;
        }
        const message: ChatMessage = { id: newId(), role: 'assistant', content: text, attachments: [], plan, status: r.aborted ? 'stopped' : 'ok', createdAt: now() };
        const after = await ctx.commit((st) => {
          const c = st.conversations[convId];
          if (c) st.conversations = { ...st.conversations, [convId]: { conversation: { ...c.conversation, updatedAt: message.createdAt }, messages: [...c.messages, message] } };
          record(st, plan, { questions: 1, images });
          trimState(st);
          return st;
        });
        send('done', { message, usage: usageOf(after) });
      } catch (err) {
        await rollback().catch(() => {});
        const e = err instanceof CoreError ? err : new CoreError(500, 'Ocorreu um erro ao falar com a IA.', 'ai_error');
        send('error', { message: `${e.message} A pergunta não foi contada.`, code: e.code });
        if (!(err instanceof CoreError)) throw err;
      }
    });
  });

  // ---------- resumos ----------

  route('GET', '/summaries', async ({ query }, ctx) => {
    const s = await ctx.state();
    const subject = query.get('subject');
    return { summaries: Object.values(s.summaries).filter((x) => !subject || x.subject === subject).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) };
  });
  route('POST', '/summaries', async ({ body }, ctx) => {
    if (!String(body?.title ?? '').trim() || !String(body?.content ?? '').trim()) fail(400, 'O resumo precisa de título e conteúdo.', 'invalid');
    const t = now();
    const summary: Summary = {
      id: newId(),
      subject: body.subject ?? null,
      title: String(body.title).trim().slice(0, 140),
      content: String(body.content).slice(0, 60000),
      source: body.source === 'ia' ? 'ia' : 'manual',
      createdAt: t,
      updatedAt: t,
    };
    await ctx.commit((s) => void (s.summaries = { ...s.summaries, [summary.id]: summary }));
    return { summary };
  });
  route('PUT', '/summaries/:id', async ({ params, body }, ctx) => {
    const s = await ctx.commit((s) => {
      const x = s.summaries[params.id!] ?? fail(404, 'Resumo não encontrado.', 'not_found');
      s.summaries = {
        ...s.summaries,
        [x.id]: { ...x, subject: body.subject ?? null, title: String(body.title ?? x.title).slice(0, 140), content: String(body.content ?? x.content).slice(0, 60000), updatedAt: now() },
      };
      return s;
    });
    return { summary: s.summaries[params.id!] };
  });
  route('DELETE', '/summaries/:id', async ({ params }, ctx) => {
    await ctx.commit((s) => {
      const copy = { ...s.summaries };
      delete copy[params.id!];
      s.summaries = copy;
    });
    return { ok: true };
  });
  route('POST', '/summaries/generate', async ({ body }, ctx) => {
    const topic = String(body?.topic ?? '').trim().slice(0, 300);
    if (topic.length < 2) fail(400, 'Indica a matéria.', 'invalid');
    requireAi();
    const s = await ctx.state();
    assertAllowed(s);
    const plan = s.profile.aiPlan;
    const text = await ai.text(plan, summarySystemPrompt(plan, s.profile.questionnaire), `Faz um resumo de ${subjectName(s, body.subject)} sobre: ${topic}`);
    const t = now();
    const summary: Summary = { id: newId(), subject: body.subject ?? null, title: `${topic.charAt(0).toUpperCase()}${topic.slice(1)}`.slice(0, 140), content: text.trim(), source: 'ia', createdAt: t, updatedAt: t };
    const after = await ctx.commit((st) => {
      st.summaries = { ...st.summaries, [summary.id]: summary };
      record(st, plan, { questions: 1 });
      return st;
    });
    return { summary, usage: usageOf(after) };
  });

  // ---------- flashcards ----------

  route('GET', '/decks', async ({ query }, ctx) => {
    const s = await ctx.state();
    const date = query.get('date') ?? today();
    return { decks: Object.keys(s.decks).map((id) => deckView(s, id, date)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
  });
  const newDeck = (subject: string | null, title: string, cards: { front: string; back: string }[]) => {
    const id = newId();
    return {
      deck: { id, subject, title: title.slice(0, 120), createdAt: now() },
      cards: cards.map((c) => ({ id: newId(), deckId: id, front: c.front, back: c.back, box: 1, due: today(), reviews: 0, correct: 0 })),
    };
  };
  route('POST', '/decks', async ({ body }, ctx) => {
    if (!String(body?.title ?? '').trim()) fail(400, 'Escreve um título.', 'invalid');
    const cards = (Array.isArray(body.cards) ? body.cards : [])
      .filter((c: any) => String(c?.front ?? '').trim() && String(c?.back ?? '').trim())
      .slice(0, 200)
      .map((c: any) => ({ front: String(c.front).trim().slice(0, 500), back: String(c.back).trim().slice(0, 2000) }));
    const d = newDeck(body.subject ?? null, String(body.title).trim(), cards);
    const s = await ctx.commit((s) => ((s.decks = { ...s.decks, [d.deck.id]: d }), s));
    return { deck: deckView(s, d.deck.id, today()) };
  });
  route('POST', '/decks/generate', async ({ body }, ctx) => {
    const topic = String(body?.topic ?? '').trim().slice(0, 300);
    const count = Math.min(30, Math.max(4, Number(body?.count) || 10));
    const s = await ctx.state();
    let source: string | undefined;
    if (body?.summaryId) source = (s.summaries[body.summaryId] ?? fail(404, 'Resumo não encontrado.', 'not_found')).content;
    else if (topic.length < 2) fail(400, 'Indica a matéria dos flashcards.', 'invalid');
    requireAi();
    assertAllowed(s);
    const plan = s.profile.aiPlan;
    const q = s.profile.questionnaire;
    const raw = await ai.json<RawCards>(
      plan,
      structuredSystemPrompt(q),
      flashcardsPrompt({ count, subjectName: subjectName(s, body.subject), topic, yearLabel: yearLabel(q?.year), source }),
      JSON_FORMATS.cards,
    );
    const cards = normalizeCards(raw, count);
    if (!cards.length) fail(502, 'A IA não devolveu flashcards. Tenta novamente.', 'ai_empty');
    const d = newDeck(body.subject ?? null, String(raw?.title || topic || 'Flashcards'), cards);
    const after = await ctx.commit((st) => {
      st.decks = { ...st.decks, [d.deck.id]: d };
      record(st, plan, { questions: 1 });
      return st;
    });
    return { deck: deckView(after, d.deck.id, today()), usage: usageOf(after) };
  });
  const deckOf = (s: UserState, id: string) => s.decks[id] ?? fail(404, 'Baralho não encontrado.', 'not_found');
  route('GET', '/decks/:id', async ({ params, query }, ctx) => {
    const s = await ctx.state();
    const d = deckOf(s, params.id!);
    return { deck: deckView(s, params.id!, query.get('date') ?? today()), cards: d.cards };
  });
  route('PUT', '/decks/:id', async ({ params, body }, ctx) => {
    await ctx.commit((s) => {
      const d = deckOf(s, params.id!);
      s.decks = { ...s.decks, [params.id!]: { ...d, deck: { ...d.deck, subject: body.subject ?? null, title: String(body.title ?? d.deck.title).slice(0, 120) } } };
    });
    return { ok: true };
  });
  route('DELETE', '/decks/:id', async ({ params }, ctx) => {
    await ctx.commit((s) => {
      const copy = { ...s.decks };
      delete copy[params.id!];
      s.decks = copy;
    });
    return { ok: true };
  });
  route('POST', '/decks/:id/cards', async ({ params, body }, ctx) => {
    if (!String(body?.front ?? '').trim() || !String(body?.back ?? '').trim()) fail(400, 'Preenche a frente e o verso.', 'invalid');
    const card = { id: newId(), deckId: params.id!, front: String(body.front).slice(0, 500), back: String(body.back).slice(0, 2000), box: 1, due: today(), reviews: 0, correct: 0 };
    await ctx.commit((s) => {
      const d = deckOf(s, params.id!);
      s.decks = { ...s.decks, [params.id!]: { ...d, cards: [...d.cards, card] } };
    });
    return { card };
  });
  const updateCard = (s: UserState, id: string, fn: (c: UserState['decks'][string]['cards'][number]) => UserState['decks'][string]['cards'][number] | null) => {
    for (const [deckId, d] of Object.entries(s.decks)) {
      if (!d.cards.some((c) => c.id === id)) continue;
      const cards = d.cards.map((c) => (c.id === id ? fn(c) : c)).filter(Boolean) as typeof d.cards;
      s.decks = { ...s.decks, [deckId]: { ...d, cards } };
      return cards.find((c) => c.id === id) ?? null;
    }
    return fail(404, 'Flashcard não encontrado.', 'not_found');
  };
  route('PUT', '/cards/:id', async ({ params, body }, ctx) => {
    await ctx.commit((s) => updateCard(s, params.id!, (c) => ({ ...c, front: String(body?.front ?? c.front).slice(0, 500), back: String(body?.back ?? c.back).slice(0, 2000) })));
    return { ok: true };
  });
  route('DELETE', '/cards/:id', async ({ params }, ctx) => {
    await ctx.commit((s) => updateCard(s, params.id!, () => null));
    return { ok: true };
  });
  route('POST', '/cards/:id/review', async ({ params, body }, ctx) => {
    const date = isISODate(body?.date) ? body.date : today();
    const known = !!body?.known;
    const card = await ctx.commit((s) => {
      const c = updateCard(s, params.id!, (c) => {
        const box = known ? Math.min(5, c.box + 1) : 1;
        return { ...c, box, due: addDays(date, known ? (BOX_INTERVAL[box] ?? 14) : 0), reviews: c.reviews + 1, correct: c.correct + (known ? 1 : 0) };
      });
      s.cardReviews = { ...s.cardReviews, [date]: (s.cardReviews[date] ?? 0) + 1 };
      return c;
    });
    return { card };
  });

  // ---------- testes de preparação ----------

  route('GET', '/tests', async (_r, ctx) => ({ tests: Object.values((await ctx.state()).tests).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }));
  const testOf = (s: UserState, id: string) => s.tests[id] ?? fail(404, 'Teste não encontrado.', 'not_found');
  route('GET', '/tests/:id', async ({ params }, ctx) => ({ test: testOf(await ctx.state(), params.id!) }));
  route('DELETE', '/tests/:id', async ({ params }, ctx) => {
    await ctx.commit((s) => {
      const copy = { ...s.tests };
      delete copy[params.id!];
      s.tests = copy;
    });
    return { ok: true };
  });
  route('POST', '/tests/generate', async ({ body }, ctx) => {
    const topic = String(body?.topic ?? '').trim().slice(0, 300);
    if (topic.length < 2) fail(400, 'Indica a matéria do teste.', 'invalid');
    const allowed: QuestionKind[] = ['escolha-multipla', 'verdadeiro-falso', 'resposta-curta', 'desenvolvimento'];
    const picked = (Array.isArray(body?.kinds) ? body.kinds : []).filter((k: QuestionKind) => allowed.includes(k)) as QuestionKind[];
    const kinds = picked.length ? picked : (['escolha-multipla', 'resposta-curta'] as QuestionKind[]);
    const count = Math.min(20, Math.max(3, Number(body?.count) || 8));
    const difficulty: Difficulty = ['facil', 'medio', 'dificil'].includes(body?.difficulty) ? body.difficulty : 'medio';
    requireAi();
    const s = await ctx.state();
    assertAllowed(s);
    const plan = s.profile.aiPlan;
    const name = subjectName(s, body.subject);
    const raw = await ai.json<RawTest>(
      plan,
      structuredSystemPrompt(s.profile.questionnaire),
      testPrompt({ subjectName: name, topic, yearLabel: yearLabel(s.profile.questionnaire?.year), count, difficulty, kinds }),
      JSON_FORMATS.test,
    );
    const questions = normalizeQuestions(raw, count);
    if (!questions.length) fail(502, 'A IA não devolveu perguntas válidas. Tenta novamente.', 'ai_empty');
    const test: PracticeTest = {
      id: newId(),
      subject: body.subject ?? null,
      topic,
      difficulty,
      title: String(raw?.title || `Teste de ${name}`).slice(0, 140),
      questions,
      answers: null,
      results: null,
      score: null,
      maxScore: questions.reduce((a, x) => a + x.points, 0),
      createdAt: now(),
      completedAt: null,
    };
    const after = await ctx.commit((st) => {
      st.tests = { ...st.tests, [test.id]: test };
      record(st, plan, { questions: 1 });
      return st;
    });
    return { test, usage: usageOf(after) };
  });
  route('POST', '/tests/:id/submit', async ({ params, body }, ctx) => {
    const s = await ctx.state();
    const test = testOf(s, params.id!);
    const answers = (Array.isArray(body?.answers) ? body.answers : []) as (string | number | null)[];
    if (answers.length !== test.questions.length) fail(400, 'Responde a todas as perguntas.', 'invalid');
    const results = gradeClosed(test.questions, answers);
    const open = test.questions.map((_, i) => i).filter((i) => results[i] === null);
    let usageOut: UsageSnapshot | undefined;
    let graded = false;
    if (open.length) {
      const self = body.selfGrades as Record<string, boolean> | undefined;
      if (self && open.every((i) => typeof self[String(i)] === 'boolean')) {
        for (const i of open) {
          const qn = test.questions[i]!;
          const ok = self[String(i)]!;
          results[i] = { score: ok ? qn.points : 0, max: qn.points, correct: ok, feedback: 'Autoavaliação.' };
        }
      } else if (body.useAi !== false && ai.configured()) {
        const limit = limitError(usageOf(s));
        if (limit) return { pendingSelfGrade: open, test, notice: limit.message };
        const raw = await ai.json<RawGrades>(
          s.profile.aiPlan,
          structuredSystemPrompt(s.profile.questionnaire),
          gradePrompt(test.title, open.map((i) => ({ index: i, question: test.questions[i]!, answer: String(answers[i] ?? '') }))),
          JSON_FORMATS.grades,
        );
        applyGrades(test.questions, results, open, raw);
        graded = true;
      } else {
        return { pendingSelfGrade: open, test };
      }
    }
    const final = results as NonNullable<(typeof results)[number]>[];
    const done: PracticeTest = { ...test, answers, results: final, score: final.reduce((a, x) => a + x.score, 0), completedAt: now() };
    const after = await ctx.commit((st) => {
      if (!st.tests[test.id]) fail(404, 'Teste não encontrado.', 'not_found');
      st.tests = { ...st.tests, [test.id]: done };
      if (graded) record(st, s.profile.aiPlan, { questions: 1 });
      return st;
    });
    if (graded) usageOut = usageOf(after);
    return { test: done, ...(usageOut ? { usage: usageOut } : {}) };
  });

  // ---------- lembretes no telemóvel ----------

  const requirePush = () => opts.push ?? fail(501, 'Esta versão não envia lembretes.', 'no_push');
  route('GET', '/push/config', async (_r, ctx) => {
    const host = requirePush();
    const p = pushOf(await ctx.state());
    return { publicKey: (await host.vapid()).publicKey, subscribed: p.subs.length > 0, devices: p.subs.length, settings: p.settings };
  });
  route('POST', '/push/subscribe', async ({ body, headers }, ctx) => {
    const host = requirePush();
    const sub = validSubscription(body?.subscription, host.allowLocal);
    if (!sub) fail(400, 'Subscrição de notificações inválida.', 'invalid');
    const origin = String(headers.get('origin') ?? '').slice(0, 200);
    const after = await ctx.commit((s) => {
      const p = pushOf(s);
      const subs = [...p.subs.filter((x) => x.endpoint !== sub.endpoint), { ...sub, origin, createdAt: now() }].slice(-5);
      s.push = { ...p, subs, settings: cleanSettings(body?.settings, p.settings) };
      return s;
    });
    await host.index?.(after.user.id, true);
    return { ok: true, settings: pushOf(after).settings };
  });
  route('DELETE', '/push/subscribe', async ({ body }, ctx) => {
    const host = requirePush();
    const after = await ctx.commit((s) => {
      const p = pushOf(s);
      s.push = { ...p, subs: body?.endpoint ? p.subs.filter((x) => x.endpoint !== body.endpoint) : [] };
      return s;
    });
    if (!pushOf(after).subs.length) await host.index?.(after.user.id, false);
    return { ok: true };
  });
  route('PUT', '/push/settings', async ({ body }, ctx) => {
    requirePush();
    const after = await ctx.commit((s) => {
      const p = pushOf(s);
      s.push = { ...p, settings: cleanSettings(body, p.settings) };
      return s;
    });
    return { settings: pushOf(after).settings };
  });
  route('POST', '/push/test', async (_r, ctx) => {
    const host = requirePush();
    const p = pushOf(await ctx.state());
    if (!p.subs.length) fail(400, 'Primeiro ativa os lembretes neste dispositivo.', 'no_subscription');
    const r = await pushToAll(p.subs, { title: 'Lembretes ligados ✅', body: 'É assim que a STUDY AI te avisa das sessões de estudo e dos testes.', url: '/definicoes#lembretes', tag: 'teste-lembretes' }, await host.vapid());
    if (r.gone.length) await ctx.commit((s) => void (s.push = { ...pushOf(s), subs: pushOf(s).subs.filter((x) => !r.gone.includes(x.endpoint)) }));
    if (!r.sent) fail(502, 'Não consegui enviar a notificação. Desativa e volta a ativar os lembretes.', 'push_failed');
    return { sent: r.sent };
  });

  // ---------- funções com fotos ----------

  const requireVision = () => {
    requireAi();
    if (!ai.vision) fail(501, 'Nesta versão a IA não consegue ler fotografias.', 'no_vision');
  };
  /** Fotografias carregadas em /uploads (no máximo 4), para a IA ver. */
  async function takePhotos(ctx: CoreContext, ids: unknown): Promise<{ media: Media[]; ids: string[] }> {
    const list = [...new Set((Array.isArray(ids) ? ids : []).filter((x): x is string => typeof x === 'string'))].slice(0, 4);
    if (!list.length) fail(400, 'Tira pelo menos uma fotografia.', 'empty');
    const files = await Promise.all(list.map((id) => ctx.files.get(id)));
    if (files.some((f) => !f || f.meta.kind !== 'image' || f.messageId)) fail(400, 'Uma das fotografias já não existe. Volta a tirá-la.', 'bad_attachment');
    return { media: files.map((f) => ({ mime: f!.meta.mime, bytes: f!.bytes, name: f!.meta.name })), ids: list };
  }
  const dropPhotos = async (ctx: CoreContext, ids: string[]) => {
    for (const id of ids) await ctx.files.remove(id).catch(() => {});
  };

  // Fotos da matéria → resumo + flashcards e/ou teste de preparação.
  route('POST', '/photos/materials', async ({ body }, ctx) => {
    requireVision();
    const make: 'flashcards' | 'test' | 'both' = ['flashcards', 'test', 'both'].includes(body?.make) ? body.make : 'both';
    const s = await ctx.state();
    const photos = await takePhotos(ctx, body?.attachmentIds);
    assertAllowed(s, { images: photos.media.length, files: 0 });
    const plan = s.profile.aiPlan;
    const q = s.profile.questionnaire;
    const subject: string | null = typeof body?.subject === 'string' && body.subject ? body.subject : null;
    const name = subjectName(s, subject);
    const year = yearLabel(q?.year);
    const notes = normalizeNotes(await ai.json<RawNotes>(plan, structuredSystemPrompt(q), photoNotesPrompt({ subjectName: name, yearLabel: year }), JSON_NOTES, photos.media));
    if (!notes) fail(422, 'Não consegui ler a matéria nas fotografias. Tira fotos mais nítidas, com boa luz e a página inteira.', 'unreadable');
    const [rawCards, rawTest] = await Promise.all([
      make !== 'test'
        ? ai.json<RawCards>(plan, structuredSystemPrompt(q), flashcardsPrompt({ count: 12, subjectName: name, topic: notes.topic, yearLabel: year, source: notes.content }), JSON_FORMATS.cards)
        : null,
      make !== 'flashcards'
        ? ai.json<RawTest>(
            plan,
            structuredSystemPrompt(q),
            testPrompt({ subjectName: name, topic: notes.topic, yearLabel: year, count: 6, difficulty: 'medio', kinds: ['escolha-multipla', 'verdadeiro-falso', 'resposta-curta'], source: notes.content }),
            JSON_FORMATS.test,
          )
        : null,
    ]);
    const cards = rawCards ? normalizeCards(rawCards, 12) : [];
    const questions = rawTest ? normalizeQuestions(rawTest, 6) : [];
    if (make === 'flashcards' && !cards.length) fail(502, 'A IA não devolveu flashcards. Tenta novamente.', 'ai_empty');
    if (make === 'test' && !questions.length) fail(502, 'A IA não devolveu perguntas. Tenta novamente.', 'ai_empty');
    if (make === 'both' && !cards.length && !questions.length) fail(502, 'A IA não conseguiu criar materiais a partir das fotos. Tenta novamente.', 'ai_empty');
    const t = now();
    const summary: Summary = { id: newId(), subject, title: notes.title, content: notes.content, source: 'ia', createdAt: t, updatedAt: t };
    const deck = cards.length ? newDeck(subject, String(rawCards?.title || notes.title), cards) : null;
    const test: PracticeTest | null = questions.length
      ? {
          id: newId(),
          subject,
          topic: notes.topic,
          difficulty: 'medio',
          title: String(rawTest?.title || `Teste: ${notes.title}`).slice(0, 140),
          questions,
          answers: null,
          results: null,
          score: null,
          maxScore: questions.reduce((a, x) => a + x.points, 0),
          createdAt: t,
          completedAt: null,
        }
      : null;
    const after = await ctx.commit((st) => {
      st.summaries = { ...st.summaries, [summary.id]: summary };
      if (deck) st.decks = { ...st.decks, [deck.deck.id]: deck };
      if (test) st.tests = { ...st.tests, [test.id]: test };
      record(st, plan, { questions: 1, images: photos.media.length });
      return st;
    });
    await dropPhotos(ctx, photos.ids);
    return { summary, deck: deck ? deckView(after, deck.deck.id, today()) : null, test, usage: usageOf(after) };
  });

  // Foto do calendário de testes → propostas de datas (o estudante confirma antes de as marcar).
  route('POST', '/photos/calendar', async ({ body }, ctx) => {
    requireVision();
    const s = await ctx.state();
    const photos = await takePhotos(ctx, body?.attachmentIds);
    assertAllowed(s, { images: photos.media.length, files: 0 });
    const plan = s.profile.aiPlan;
    const q = s.profile.questionnaire;
    const subjects = (q?.subjects ?? []).map((id) => ({ id, name: getSubject(id, q?.customSubjects).name }));
    const raw = await ai.json<RawCalendar>(plan, structuredSystemPrompt(q), calendarPrompt({ today: today(), subjects }), JSON_CALENDAR, photos.media);
    const events = normalizeCalendar(raw, subjects.map((x) => x.id), today());
    const after = await ctx.commit((st) => {
      record(st, plan, { questions: 1, images: photos.media.length });
      return st;
    });
    await dropPhotos(ctx, photos.ids);
    return { events, usage: usageOf(after) };
  });

  // ---------- correção de redações ----------

  const essaysOf = (s: UserState) => s.essays ?? {};
  route('GET', '/essays', async (_r, ctx) => ({
    essays: Object.values(essaysOf(await ctx.state()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((e) => ({ id: e.id, title: e.title, kind: e.kind, grade: e.review.grade, level: e.review.level, createdAt: e.createdAt })),
  }));
  route('GET', '/essays/:id', async ({ params }, ctx) => ({ essay: essaysOf(await ctx.state())[params.id!] ?? fail(404, 'Redação não encontrada.', 'not_found') }));
  route('DELETE', '/essays/:id', async ({ params }, ctx) => {
    await ctx.commit((s) => {
      const copy = { ...essaysOf(s) };
      delete copy[params.id!];
      s.essays = copy;
    });
    return { ok: true };
  });
  route('POST', '/essays/review', async ({ body }, ctx) => {
    requireAi();
    const kind: EssayKind = ESSAY_KINDS.includes(body?.kind) ? body.kind : 'outro';
    const theme = String(body?.theme ?? '').trim().slice(0, 300);
    const text = String(body?.text ?? '').trim().slice(0, 12000);
    const s = await ctx.state();
    const hasPhotos = Array.isArray(body?.attachmentIds) && body.attachmentIds.length > 0;
    if (!text && !hasPhotos) fail(400, 'Escreve ou fotografa a tua redação.', 'empty');
    if (!hasPhotos && countWords(text) < 30) fail(400, 'A redação é muito curta para ser corrigida (escreve pelo menos 30 palavras).', 'too_short');
    if (hasPhotos) requireVision();
    const photos = hasPhotos ? await takePhotos(ctx, body.attachmentIds) : null;
    assertAllowed(s, { images: photos?.media.length ?? 0, files: 0 });
    const plan = s.profile.aiPlan;
    const q = s.profile.questionnaire;
    const raw = await ai.json<RawEssay>(
      plan,
      structuredSystemPrompt(q),
      essayPrompt({ kind, theme, yearLabel: yearLabel(q?.year), text, fromPhoto: !!photos }),
      JSON_ESSAY,
      photos?.media ?? [],
    );
    const r = normalizeEssay(raw, photos ? '' : text);
    const body2 = photos ? r.transcription : text;
    if (!r.review.summary && !r.review.criteria.length) fail(502, 'A IA não devolveu a correção. Tenta novamente.', 'ai_empty');
    if (photos && countWords(body2) < 10) fail(422, 'Não consegui ler a redação nas fotografias. Tira fotos mais nítidas, com boa luz.', 'unreadable');
    const essay: Essay = { id: newId(), title: r.title, kind, theme, text: body2, fromPhoto: !!photos, review: r.review, createdAt: now() };
    const after = await ctx.commit((st) => {
      st.essays = { ...essaysOf(st), [essay.id]: essay };
      record(st, plan, { questions: 1, images: photos?.media.length ?? 0 });
      return st;
    });
    if (photos) await dropPhotos(ctx, photos.ids);
    return { essay, usage: usageOf(after) };
  });

  // ---------- entrada ----------

  async function handle(req: Req, ctx: CoreContext): Promise<Response | null> {
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = r.pattern.exec(req.path);
      if (!m) continue;
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1] ?? '')]));
      try {
        const result = await r.handler({ ...req, params }, ctx);
        return result instanceof Response ? result : json(result, r.method === 'POST' && CREATED.has(r.path) ? 201 : 200);
      } catch (err) {
        if (err instanceof CoreError) return json({ error: err.message, code: err.code }, err.status);
        throw err;
      }
    }
    return null;
  }

  return { handle, route };
}

/** Assinaturas de ficheiro (não confiar só no tipo indicado pelo navegador). */
export function sniff(b: Uint8Array): string | null {
  const s = (n: number, len: number) => String.fromCharCode(...b.subarray(n, n + len));
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && b[0] === 0x89 && s(1, 3) === 'PNG') return 'image/png';
  if (b.length >= 6 && (s(0, 6) === 'GIF87a' || s(0, 6) === 'GIF89a')) return 'image/gif';
  if (b.length >= 12 && s(0, 4) === 'RIFF' && s(8, 4) === 'WEBP') return 'image/webp';
  if (b.length >= 5 && s(0, 5) === '%PDF-') return 'application/pdf';
  return null;
}

/** Resposta em Server-Sent Events, construída na hora (funciona no navegador e no Netlify). */
export function sse(signal: AbortSignal | undefined, run: (send: (event: string, data: unknown) => void) => Promise<void>): Response {
  const enc = new TextEncoder();
  let ctrl!: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      ctrl = c;
    },
    cancel() {
      closed = true;
    },
  });
  const send = (event: string, data: unknown) => {
    if (closed) return;
    try {
      ctrl.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    } catch {
      closed = true;
    }
  };
  signal?.addEventListener('abort', () => {
    if (closed) return;
    closed = true;
    try {
      ctrl.error(new DOMException('Pedido cancelado', 'AbortError'));
    } catch {
      /* já fechado */
    }
  });
  queueMicrotask(async () => {
    try {
      await run(send);
    } catch (err) {
      console.error('[study-ai] erro no chat', err);
    }
    if (!closed) {
      closed = true;
      try {
        ctrl.close();
      } catch {
        /* já fechado */
      }
    }
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' } });
}

export type Core = ReturnType<typeof createCore>;
