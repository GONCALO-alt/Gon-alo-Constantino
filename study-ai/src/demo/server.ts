// «Servidor» da versão de demonstração: responde aos mesmos pedidos /api/... que o
// servidor Node, mas dentro da página (artefacto do claude.ai). Reutiliza o motor do
// plano, os limites dos planos e as instruções da IA do servidor real.

import { chatSystemPrompt, planInsightsPrompt, structuredSystemPrompt, summarySystemPrompt } from '../../server/ai/prompts';
import {
  applyGrades, flashcardsPrompt, gradeClosed, gradePrompt, JSON_FORMATS, normalizeCards, normalizeQuestions, testPrompt,
  type Difficulty, type RawCards, type RawGrades, type RawTest,
} from '../../server/ai/materials';
import { addDays, isISODate, today, weekStart } from '../../shared/dates';
import { cleanQuestionnaire, generatePlan, newSessionId, planAsText } from '../../shared/planner';
import {
  AI_PLANS, FILE_TYPES, IMAGE_TYPES, isAiPlanId, limitError, MAX_ATTACHMENTS_PER_MESSAGE, MAX_IMAGE_BYTES, MAX_TEXT_BYTES,
  type UsageSnapshot,
} from '../../shared/plans';
import { getSubject, yearLabel } from '../../shared/subjects';
import type {
  Attachment, CalendarEvent, ChatMessage, Conversation, DailyGoal, Deck, MeResponse, PlanSession, PracticeTest, Questionnaire,
  QuestionKind, StudyLog, StudyPlan, Summary,
} from '../../shared/types';
import { DemoAi, DemoError, NOT_AVAILABLE } from './ai';
import { DemoStore, type DemoState } from './store';

const store = new DemoStore();
const ai = new DemoAi();
/** Anexos desta sessão (ficam só na memória: imagens e ficheiros não vão para o armazenamento). */
const attachments = new Map<string, { meta: Attachment; blob: Blob; url: string; text?: string; messageId?: string }>();

let ready: Promise<void> | null = null;

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`);
const now = () => new Date().toISOString();

function freshState(name: string): DemoState {
  return {
    user: { id: uid(), name: name || 'Estudante', email: '', createdAt: now() },
    profile: {
      onboarded: false,
      questionnaire: null,
      aiPlan: 'claudio-5',
      favorites: [],
      settings: { reduceMotion: false, focusMinutes: 25, breakMinutes: 5 },
    },
    plan: null,
    checks: {},
    usage: {},
    cardReviews: {},
    events: [],
    logs: [],
    goals: [],
    conversations: {},
    summaries: {},
    decks: {},
    tests: {},
  };
}

let viewerName = '';

function boot(): Promise<void> {
  ready ??= (async () => {
    const host = (window as unknown as { claude?: { use(name: string): Promise<unknown> } }).claude;
    const has = host && typeof host.use === 'function' ? host : null;
    const [db, user] = has
      ? await Promise.all([has.use('db').catch(() => null), has.use('user').catch(() => null), ai.init(has)])
      : [null, null];
    let id: string | null = null;
    if (user) {
      const u = user as { id(): Promise<string | null>; me(): Promise<{ name?: string }> };
      id = await u.id().catch(() => null);
      viewerName = (await u.me().catch(() => null))?.name ?? '';
    }
    await store.init(db as never, id, () => freshState(viewerName.split(' ')[0] ?? ''));
  })();
  return ready;
}

// ---------- utilitários ----------

const S = () => store.state;

function fail(status: number, message: string, code = 'erro'): never {
  throw new DemoError(status, message, code);
}

function usage(): UsageSnapshot {
  const plan = S().profile.aiPlan;
  const day = today();
  const u = S().usage[`${day}|${plan}`] ?? { questions: 0, images: 0 };
  const p = AI_PLANS[plan];
  return { plan, day, questionsUsed: u.questions, questionsLimit: p.dailyQuestions, imagesUsed: u.images, imagesLimit: p.dailyImages, files: p.files };
}

function assertAllowed(opts: { images?: number; files?: number } = {}) {
  const e = limitError(usage(), opts);
  if (e) fail(e.status, e.message, e.code);
}

function record(add: { questions?: number; images?: number }) {
  const key = `${today()}|${S().profile.aiPlan}`;
  const u = (S().usage[key] ??= { questions: 0, images: 0 });
  u.questions += add.questions ?? 0;
  u.images += add.images ?? 0;
  const cutoff = addDays(today(), -40);
  for (const k of Object.keys(S().usage)) if (k.slice(0, 10) < cutoff) delete S().usage[k];
  store.save();
}

function me(): MeResponse {
  return {
    user: { id: S().user.id, email: S().user.email, name: S().user.name, createdAt: S().user.createdAt },
    profile: S().profile,
    usage: usage(),
    ai: ai.configured ? { configured: true, message: 'IA ligada.' } : { configured: false, message: NOT_AVAILABLE },
  };
}

function q(): Questionnaire | null {
  return S().profile.questionnaire;
}

function subjectName(id: string | null | undefined): string {
  return id ? getSubject(id, q()?.customSubjects).name : 'estudo';
}

function planOrFail(): StudyPlan {
  const p = S().plan;
  if (!p) fail(404, 'Ainda não tens um plano de estudos.', 'no_plan');
  return p;
}

function deckView(id: string, date: string): Deck {
  const d = S().decks[id]!;
  return {
    id,
    subject: d.deck.subject,
    title: d.deck.title,
    createdAt: d.deck.createdAt,
    cardCount: d.cards.length,
    dueCount: d.cards.filter((c) => c.due <= date).length,
    masteredCount: d.cards.filter((c) => c.box >= 4).length,
  };
}

const BOX_INTERVAL = [0, 1, 2, 4, 7, 14];

async function refreshInsights() {
  const plan = S().plan;
  const questionnaire = q();
  if (!ai.configured || !plan || !questionnaire) return;
  const prompt = `${chatSystemPrompt({ plan: S().profile.aiPlan, questionnaire, events: [], subject: null })}\n\n---\n\n${planInsightsPrompt(questionnaire, planAsText(plan, questionnaire))}`;
  const text = await ai.text(S().profile.aiPlan, prompt);
  const current = S().plan;
  if (current && current.generatedAt === plan.generatedAt) {
    current.aiInsights = text.trim();
    store.save();
  }
  return text.trim();
}

function conversationPreview(c: { messages: ChatMessage[] }) {
  const last = c.messages[c.messages.length - 1];
  return (last?.content ?? '').replace(/[#*_`$>\-]/g, '').replace(/\s+/g, ' ').slice(0, 120);
}

function sse(signal: AbortSignal | undefined, run: (send: (event: string, data: unknown) => void) => Promise<void>): Response {
  let ctrl!: ReadableStreamDefaultController<Uint8Array>;
  const enc = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      ctrl = c;
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
    await run(send);
    if (!closed) {
      closed = true;
      try {
        ctrl.close();
      } catch {
        /* já fechado */
      }
    }
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
}

// ---------- rotas ----------

type Handler = (ctx: { params: Record<string, string>; query: URLSearchParams; body: any; init: RequestInit }) => unknown | Promise<unknown>;
const routes: { method: string; pattern: RegExp; keys: string[]; handler: Handler }[] = [];

function route(method: string, path: string, handler: Handler) {
  const keys: string[] = [];
  const pattern = new RegExp(`^${path.replace(/:([a-zA-Z]+)/g, (_m, k: string) => (keys.push(k), '([^/]+)'))}$`);
  routes.push({ method, pattern, keys, handler });
}

route('GET', '/me', () => me());
route('GET', '/health', () => ({ ok: true, ai: ai.configured }));
route('GET', '/demo/info', () => ({ storage: store.kind, viewerName }));
route('POST', '/demo/reset', async () => {
  attachments.clear();
  await store.reset(() => freshState(viewerName.split(' ')[0] ?? ''));
  return me();
});
route('POST', '/auth/logout', () => ({ ok: true }));

// Perfil e questionário
route('PUT', '/profile/questionnaire', ({ body }) => {
  const raw = body?.questionnaire as Questionnaire | undefined;
  if (!raw?.name?.trim()) fail(400, 'Escreve o teu nome.', 'invalid');
  if (!raw.subjects?.length) fail(400, 'Escolhe pelo menos uma disciplina.', 'invalid');
  const questionnaire = cleanQuestionnaire({ ...raw, name: raw.name.trim().slice(0, 60) });
  const regenerate = body.regenerate !== false;
  const s = S();
  s.profile = { ...s.profile, questionnaire, onboarded: true };
  s.user.name = questionnaire.name;
  for (const t of raw.tests ?? []) {
    if (!t.subject || !isISODate(t.date) || !questionnaire.subjects.includes(t.subject)) continue;
    if (s.events.some((e) => e.type === 'teste' && e.subject === t.subject && e.date === t.date)) continue;
    const name = subjectName(t.subject);
    s.events.push({ id: uid(), type: 'teste', subject: t.subject, title: t.topic ? `Teste de ${name}: ${t.topic}` : `Teste de ${name}`, date: t.date, notes: '' });
  }
  s.events.sort((a, b) => a.date.localeCompare(b.date));
  if (regenerate || !s.plan) {
    const fresh = generatePlan(questionnaire, s.events.filter((e) => e.date >= today()), today());
    if (s.plan) fresh.settings = s.plan.settings;
    s.plan = fresh;
  }
  store.save();
  if (regenerate) refreshInsights().catch(() => {});
  return { me: me(), plan: s.plan };
});
route('PUT', '/profile/ai-plan', ({ body }) => {
  if (!isAiPlanId(body?.plan)) fail(400, 'Plano inválido.', 'invalid');
  S().profile.aiPlan = body.plan;
  store.save();
  return me();
});
route('PUT', '/profile/favorites', ({ body }) => {
  S().profile.favorites = [...new Set((body?.favorites ?? []) as string[])].slice(0, 30);
  store.save();
  return me();
});
route('PUT', '/profile/settings', ({ body }) => {
  S().profile.settings = { ...S().profile.settings, ...body };
  store.save();
  return me();
});

// Plano de estudos
route('GET', '/plan', ({ query }) => {
  const week = weekStart(isISODate(query.get('week')) ? query.get('week')! : today());
  return { plan: S().plan, week, checks: S().checks[week] ?? [] };
});
route('POST', '/plan/generate', () => {
  const questionnaire = q();
  if (!questionnaire) fail(400, 'Responde primeiro ao questionário.', 'no_questionnaire');
  const plan = generatePlan(questionnaire, S().events.filter((e) => e.date >= today()), today());
  if (S().plan) plan.settings = S().plan!.settings;
  S().plan = plan;
  store.save();
  refreshInsights().catch(() => {});
  return { plan };
});
route('POST', '/plan/insights', async () => {
  if (!ai.configured) fail(503, NOT_AVAILABLE, 'ai_not_configured');
  const text = await refreshInsights();
  return { aiInsights: text, plan: S().plan };
});
const sessionFields = (b: any): Omit<PlanSession, 'id'> => ({
  weekday: Number(b.weekday),
  start: String(b.start),
  minutes: Number(b.minutes),
  subject: String(b.subject ?? ''),
  activity: b.activity,
  ...(b.note ? { note: String(b.note).slice(0, 200) } : {}),
});
route('POST', '/plan/sessions', ({ body }) => {
  const plan = planOrFail();
  plan.sessions.push({ id: newSessionId(), ...sessionFields(body) });
  store.save();
  return { plan };
});
route('PUT', '/plan/sessions/:id', ({ params, body }) => {
  const plan = planOrFail();
  const i = plan.sessions.findIndex((x) => x.id === params.id);
  if (i < 0) fail(404, 'Sessão não encontrada.', 'not_found');
  plan.sessions[i] = { id: params.id!, ...sessionFields(body) };
  store.save();
  return { plan };
});
route('DELETE', '/plan/sessions/:id', ({ params }) => {
  const plan = planOrFail();
  plan.sessions = plan.sessions.filter((x) => x.id !== params.id);
  store.save();
  return { plan };
});
route('PUT', '/plan/settings', ({ body }) => {
  const plan = planOrFail();
  plan.settings = { ...plan.settings, autoRevisions: !!body?.autoRevisions };
  store.save();
  return { plan };
});
route('PUT', '/plan/goals/:goalId', ({ params, body }) => {
  const week = weekStart(body.week);
  const list = new Set(S().checks[week] ?? []);
  if (body.done) list.add(params.goalId!);
  else list.delete(params.goalId!);
  S().checks[week] = [...list];
  store.save();
  return { ok: true };
});

// Calendário
const eventFields = (b: any) => {
  if (!String(b?.title ?? '').trim()) fail(400, 'Escreve um título.', 'invalid');
  if (!isISODate(b?.date)) fail(400, 'Data inválida.', 'invalid');
  return { type: b.type, subject: b.subject ?? null, title: String(b.title).trim().slice(0, 120), date: b.date, notes: String(b.notes ?? '').slice(0, 1000) };
};
route('GET', '/events', ({ query }) => {
  const from = query.get('from') ?? '0000-01-01';
  const to = query.get('to') ?? '9999-12-31';
  return { events: S().events.filter((e) => e.date >= from && e.date <= to).sort((a, b) => a.date.localeCompare(b.date)) };
});
route('POST', '/events', ({ body }) => {
  const event: CalendarEvent = { id: uid(), ...eventFields(body) };
  S().events.push(event);
  store.save();
  return { event };
});
route('PUT', '/events/:id', ({ params, body }) => {
  const i = S().events.findIndex((e) => e.id === params.id);
  if (i < 0) fail(404, 'Evento não encontrado.', 'not_found');
  S().events[i] = { id: params.id!, ...eventFields(body) };
  store.save();
  return { event: S().events[i] };
});
route('DELETE', '/events/:id', ({ params }) => {
  S().events = S().events.filter((e) => e.id !== params.id);
  store.save();
  return { ok: true };
});

// Registos de estudo
route('GET', '/logs', ({ query }) => {
  const from = query.get('from') ?? addDays(today(), -30);
  const to = query.get('to') ?? addDays(today(), 1);
  return { logs: S().logs.filter((l) => l.date >= from && l.date <= to).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) };
});
route('POST', '/logs', ({ body }) => {
  const log: StudyLog = {
    id: uid(),
    date: body.date,
    subject: body.subject ?? null,
    minutes: Math.max(1, Math.min(600, Number(body.minutes) || 1)),
    source: body.source,
    sessionKey: body.sessionKey ?? null,
    createdAt: now(),
  };
  if (log.sessionKey) {
    const existing = S().logs.find((l) => l.sessionKey === log.sessionKey);
    if (existing) Object.assign(existing, { minutes: log.minutes, source: log.source });
    else S().logs.push(log);
  } else S().logs.push(log);
  store.save();
  return { ok: true };
});
route('DELETE', '/logs', ({ query }) => {
  const key = query.get('sessionKey');
  const id = query.get('id');
  S().logs = S().logs.filter((l) => (key ? l.sessionKey !== key : l.id !== id));
  store.save();
  return { ok: true };
});

// Objetivos diários
route('GET', '/goals', ({ query }) => {
  const date = query.get('date') ?? today();
  return { goals: S().goals.filter((g) => g.date === date) };
});
route('POST', '/goals', ({ body }) => {
  const text = String(body?.text ?? '').trim().slice(0, 140);
  if (!text) fail(400, 'Escreve o objetivo.', 'invalid');
  const goal: DailyGoal = { id: uid(), date: body.date, text, done: false };
  S().goals.push(goal);
  store.save();
  return { goal };
});
route('PUT', '/goals/:id', ({ params, body }) => {
  const g = S().goals.find((x) => x.id === params.id);
  if (g) {
    if (typeof body.done === 'boolean') g.done = body.done;
    if (body.text) g.text = String(body.text).slice(0, 140);
    store.save();
  }
  return { ok: true };
});
route('DELETE', '/goals/:id', ({ params }) => {
  S().goals = S().goals.filter((g) => g.id !== params.id);
  store.save();
  return { ok: true };
});

// Estatísticas
route('GET', '/stats', ({ query }) => {
  const date = isISODate(query.get('date')) ? query.get('date')! : today();
  const s = S();
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
  const reviewDays = Object.keys(s.cardReviews).filter((d) => d >= week && d <= date).length;
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
    reviewDays,
    tests,
  };
});

// Conversas e anexos
route('GET', '/conversations', ({ query }) => {
  const text = (query.get('q') ?? '').trim().toLowerCase();
  const list = Object.values(S().conversations)
    .filter((c) => !text || c.conversation.title.toLowerCase().includes(text) || c.messages.some((m) => m.content.toLowerCase().includes(text)))
    .sort((a, b) => b.conversation.updatedAt.localeCompare(a.conversation.updatedAt))
    .map((c) => ({ ...c.conversation, preview: conversationPreview(c) }));
  return { conversations: list };
});
function convOrFail(id: string) {
  const c = S().conversations[id];
  if (!c) fail(404, 'Conversa não encontrada.', 'not_found');
  return c;
}
route('GET', '/conversations/:id', ({ params }) => {
  const c = convOrFail(params.id!);
  return { conversation: c.conversation, messages: c.messages };
});
route('PATCH', '/conversations/:id', ({ params, body }) => {
  const c = convOrFail(params.id!);
  if (body.title) c.conversation.title = String(body.title).slice(0, 80);
  if (body.subject !== undefined) c.conversation.subject = body.subject;
  store.save();
  return { conversation: c.conversation };
});
route('DELETE', '/conversations/:id', ({ params }) => {
  const c = S().conversations[params.id!];
  if (c) for (const m of c.messages) for (const a of m.attachments) attachments.delete(a.id);
  delete S().conversations[params.id!];
  store.save();
  return { ok: true };
});

route('POST', '/uploads', async ({ body, init }) => {
  const blob = body as Blob;
  const headers = new Headers(init.headers);
  let name = 'ficheiro';
  try {
    name = decodeURIComponent(headers.get('x-file-name') ?? 'ficheiro');
  } catch {
    /* nome genérico */
  }
  const type = (headers.get('content-type') ?? blob.type ?? '').split(';')[0]!.toLowerCase();
  const plan = AI_PLANS[S().profile.aiPlan];
  const isImage = (IMAGE_TYPES as readonly string[]).includes(type);
  const isText = !isImage && ((FILE_TYPES as readonly string[]).includes(type) || /\.(txt|md|csv)$/i.test(name)) && type !== 'application/pdf';
  const isPdf = type === 'application/pdf' || /\.pdf$/i.test(name);
  let meta: Attachment;
  let text: string | undefined;
  if (isImage) {
    if (plan.dailyImages === 0) fail(403, `O ${plan.name} não permite carregar imagens. Escolhe o Cláudio 5.5 ou o Cláudio 6.`, 'plan_no_images');
    if (blob.size > MAX_IMAGE_BYTES) fail(413, 'A imagem é maior do que 5 MB. Tira uma fotografia mais pequena.', 'too_large');
    const u = usage();
    if (u.imagesLimit !== null && u.imagesUsed >= u.imagesLimit) fail(429, `Já usaste as ${u.imagesLimit} imagens de hoje do ${plan.name}.`, 'limit_images');
    if (ai.configured && !ai.maxImages) fail(503, 'Nesta página, a IA não consegue receber imagens.', 'images_unavailable');
    if (ai.imageTypes.length && !ai.imageTypes.includes(type)) fail(415, 'Este tipo de imagem não é aceite. Usa JPG ou PNG.', 'bad_type');
    if (ai.maxImageBytes && blob.size > ai.maxImageBytes) fail(413, 'A imagem é demasiado grande para a IA. Usa uma fotografia mais pequena.', 'too_large');
    meta = { id: uid(), kind: 'image', mime: type, name: name.slice(0, 120), size: blob.size };
  } else if (isPdf) {
    if (!plan.files) fail(403, `O ${plan.name} não permite carregar ficheiros. Só o Cláudio 6 analisa documentos.`, 'plan_no_files');
    fail(415, 'Nesta versão de demonstração os PDF não podem ser lidos. Copia o texto para um ficheiro .txt ou usa a versão completa da STUDY AI.', 'bad_type');
  } else if (isText) {
    if (!plan.files) fail(403, `O ${plan.name} não permite carregar ficheiros. Só o Cláudio 6 analisa documentos.`, 'plan_no_files');
    if (blob.size > MAX_TEXT_BYTES) fail(413, 'O ficheiro de texto é maior do que 1 MB.', 'too_large');
    text = await blob.text();
    meta = { id: uid(), kind: 'file', mime: 'text/plain', name: name.slice(0, 120), size: blob.size };
  } else {
    fail(415, 'Tipo de ficheiro não suportado. Usa imagens (JPG, PNG, WEBP, GIF) ou ficheiros de texto (TXT, MD, CSV).', 'bad_type');
  }
  attachments.set(meta.id, { meta, blob, url: URL.createObjectURL(blob), ...(text !== undefined ? { text } : {}) });
  return { attachment: meta };
});
route('DELETE', '/attachments/:id', ({ params }) => {
  const a = attachments.get(params.id!);
  if (a && !a.messageId) {
    URL.revokeObjectURL(a.url);
    attachments.delete(params.id!);
  }
  return { ok: true };
});

/** Conteúdo de uma mensagem do estudante para enviar à IA (texto + ficheiros de texto). */
function userTurn(m: ChatMessage, isLast: boolean): string {
  let content = m.content.trim() || 'Analisa o que te enviei e ajuda-me.';
  for (const a of m.attachments) {
    const stored = attachments.get(a.id);
    if (a.kind === 'image') content += isLast && stored ? `\n\n[Imagem anexada: ${a.name}]` : `\n\n[Imagem enviada antes: ${a.name}]`;
    else if (stored?.text !== undefined) content += `\n\n[Ficheiro «${a.name}»]\n"""\n${stored.text.slice(0, 60000)}\n"""`;
    else content += `\n\n[Ficheiro enviado antes: ${a.name}]`;
  }
  return content;
}

route('POST', '/chat/send', ({ body, init }) => {
  const content = String(body?.content ?? '');
  const ids = [...new Set((body?.attachmentIds ?? []) as string[])].slice(0, MAX_ATTACHMENTS_PER_MESSAGE);
  if (!content.trim() && !ids.length) fail(400, 'Escreve uma pergunta.', 'empty');
  if (!ai.configured) fail(503, NOT_AVAILABLE, 'ai_not_configured');
  const atts = ids.map((id) => attachments.get(id));
  if (atts.some((a) => !a || a.messageId)) fail(400, 'Um dos anexos já não existe. Volta a carregá-lo.', 'bad_attachment');
  const images = atts.filter((a) => a!.meta.kind === 'image').length;
  assertAllowed({ images, files: atts.length - images });

  const s = S();
  const plan = s.profile.aiPlan;
  let entry = body.conversationId ? convOrFail(body.conversationId) : null;
  let created = false;
  if (entry && body.subject !== undefined) entry.conversation.subject = body.subject ?? null;
  if (!entry) {
    const t = now();
    const clean = (content || atts[0]?.meta.name || '').replace(/\s+/g, ' ').trim();
    const conversation: Conversation = {
      id: uid(),
      title: clean ? (clean.length > 60 ? `${clean.slice(0, 57)}…` : clean) : 'Nova conversa',
      subject: body.subject ?? null,
      createdAt: t,
      updatedAt: t,
    };
    entry = { conversation, messages: [] };
    s.conversations[conversation.id] = entry;
    created = true;
  }
  const conv = entry;
  const userMessage: ChatMessage = { id: uid(), role: 'user', content, attachments: atts.map((a) => a!.meta), plan, status: 'ok', createdAt: now() };
  conv.messages.push(userMessage);
  for (const a of atts) a!.messageId = userMessage.id;

  // Histórico para a IA: as instruções vão no início da primeira mensagem (a IA não guarda memória).
  const history = conv.messages.slice(-40).filter((m) => m.content.trim() || m.role === 'user');
  while (history.length && history[0]!.role !== 'user') history.shift();
  const turns: { role: 'user' | 'assistant'; content: string }[] = [];
  history.forEach((m, i) => {
    const text = m.role === 'user' ? userTurn(m, i === history.length - 1) : m.content;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${text}`;
    else turns.push({ role: m.role, content: text });
  });
  const system = chatSystemPrompt({ plan, questionnaire: q(), events: s.events.filter((e) => e.date >= today()), subject: conv.conversation.subject });
  turns[0]!.content = `Instruções para esta conversa (segue-as e não as repitas):\n\n${system}\n\n---\n\nMensagem do estudante:\n${turns[0]!.content}`;
  const imageBlobs = atts.filter((a) => a!.meta.kind === 'image').map((a) => a!.blob);

  const rollback = () => {
    conv.messages = conv.messages.filter((m) => m.id !== userMessage.id);
    for (const a of atts) delete a!.messageId;
    if (created) delete s.conversations[conv.conversation.id];
    store.save();
  };

  return sse(init.signal ?? undefined, async (send) => {
    send('start', { conversation: conv.conversation, userMessage });
    try {
      const r = await ai.chat({ plan, turns, images: imageBlobs, signal: init.signal ?? new AbortController().signal, onDelta: (d) => send('delta', { text: d }) });
      let text = r.text;
      if (r.truncated) text += '\n\n_(A resposta foi cortada por ser muito longa. Pede «continua» para ver o resto.)_';
      if (!text.trim()) {
        rollback();
        send('error', { message: 'A resposta foi interrompida antes de começar. A pergunta não foi contada.', code: 'empty' });
        return;
      }
      const message: ChatMessage = { id: uid(), role: 'assistant', content: text, attachments: [], plan, status: r.aborted ? 'stopped' : 'ok', createdAt: now() };
      conv.messages.push(message);
      conv.conversation.updatedAt = message.createdAt;
      record({ questions: 1, images });
      send('done', { message, usage: usage() });
    } catch (err) {
      rollback();
      const e = err instanceof DemoError ? err : new DemoError(500, 'Ocorreu um erro ao falar com a IA.', 'ai_error');
      send('error', { message: `${e.message} A pergunta não foi contada.`, code: e.code });
    }
  });
});

// Resumos
route('GET', '/summaries', ({ query }) => {
  const subject = query.get('subject');
  const list = Object.values(S().summaries)
    .filter((x) => !subject || x.subject === subject)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { summaries: list };
});
route('POST', '/summaries', ({ body }) => {
  if (!String(body?.title ?? '').trim() || !String(body?.content ?? '').trim()) fail(400, 'O resumo precisa de título e conteúdo.', 'invalid');
  const t = now();
  const summary: Summary = {
    id: uid(),
    subject: body.subject ?? null,
    title: String(body.title).trim().slice(0, 140),
    content: String(body.content).slice(0, 60000),
    source: body.source === 'ia' ? 'ia' : 'manual',
    createdAt: t,
    updatedAt: t,
  };
  S().summaries[summary.id] = summary;
  store.save();
  return { summary };
});
route('PUT', '/summaries/:id', ({ params, body }) => {
  const x = S().summaries[params.id!];
  if (!x) fail(404, 'Resumo não encontrado.', 'not_found');
  Object.assign(x, { subject: body.subject ?? null, title: String(body.title).slice(0, 140), content: String(body.content).slice(0, 60000), updatedAt: now() });
  store.save();
  return { summary: x };
});
route('DELETE', '/summaries/:id', ({ params }) => {
  delete S().summaries[params.id!];
  store.save();
  return { ok: true };
});
route('POST', '/summaries/generate', async ({ body }) => {
  const topic = String(body?.topic ?? '').trim();
  if (topic.length < 2) fail(400, 'Indica a matéria.', 'invalid');
  if (!ai.configured) fail(503, NOT_AVAILABLE, 'ai_not_configured');
  assertAllowed();
  const plan = S().profile.aiPlan;
  const text = await ai.text(plan, `${summarySystemPrompt(plan, q())}\n\n---\n\nFaz um resumo de ${subjectName(body.subject)} sobre: ${topic}`);
  record({ questions: 1 });
  const t = now();
  const summary: Summary = {
    id: uid(),
    subject: body.subject ?? null,
    title: `${topic.charAt(0).toUpperCase()}${topic.slice(1)}`.slice(0, 140),
    content: text.trim(),
    source: 'ia',
    createdAt: t,
    updatedAt: t,
  };
  S().summaries[summary.id] = summary;
  store.save();
  return { summary, usage: usage() };
});

// Flashcards
route('GET', '/decks', ({ query }) => {
  const date = query.get('date') ?? today();
  const decks = Object.keys(S().decks)
    .map((id) => deckView(id, date))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { decks };
});
function createDeck(subject: string | null, title: string, cards: { front: string; back: string }[]) {
  const id = uid();
  const t = now();
  S().decks[id] = {
    deck: { id, subject, title: title.slice(0, 120), createdAt: t },
    cards: cards.map((c) => ({ id: uid(), deckId: id, front: c.front, back: c.back, box: 1, due: today(), reviews: 0, correct: 0 })),
  };
  store.save();
  return id;
}
route('POST', '/decks', ({ body }) => {
  if (!String(body?.title ?? '').trim()) fail(400, 'Escreve um título.', 'invalid');
  const id = createDeck(body.subject ?? null, String(body.title).trim(), (body.cards ?? []).filter((c: any) => c.front?.trim() && c.back?.trim()));
  return { deck: deckView(id, today()) };
});
route('POST', '/decks/generate', async ({ body }) => {
  const topic = String(body?.topic ?? '').trim();
  const count = Math.min(30, Math.max(4, Number(body?.count) || 10));
  let source: string | undefined;
  if (body?.summaryId) {
    const sm = S().summaries[body.summaryId];
    if (!sm) fail(404, 'Resumo não encontrado.', 'not_found');
    source = sm.content;
  } else if (topic.length < 2) fail(400, 'Indica a matéria dos flashcards.', 'invalid');
  if (!ai.configured) fail(503, NOT_AVAILABLE, 'ai_not_configured');
  assertAllowed();
  const plan = S().profile.aiPlan;
  const prompt = `${structuredSystemPrompt(q())}\n\n---\n\n${flashcardsPrompt({ count, subjectName: subjectName(body.subject), topic, yearLabel: yearLabel(q()?.year), source })}\n\nResponde apenas com JSON neste formato: ${JSON_FORMATS.cards}`;
  const raw = await ai.json<RawCards>(plan, prompt);
  record({ questions: 1 });
  const cards = normalizeCards(raw, count);
  if (!cards.length) fail(502, 'A IA não devolveu flashcards. Tenta novamente.', 'ai_empty');
  const id = createDeck(body.subject ?? null, String(raw?.title || topic || 'Flashcards'), cards);
  return { deck: deckView(id, today()), usage: usage() };
});
function deckOrFail(id: string) {
  const d = S().decks[id];
  if (!d) fail(404, 'Baralho não encontrado.', 'not_found');
  return d;
}
route('GET', '/decks/:id', ({ params, query }) => {
  const d = deckOrFail(params.id!);
  return { deck: deckView(params.id!, query.get('date') ?? today()), cards: d.cards };
});
route('PUT', '/decks/:id', ({ params, body }) => {
  const d = deckOrFail(params.id!);
  d.deck.subject = body.subject ?? null;
  d.deck.title = String(body.title).slice(0, 120);
  store.save();
  return { ok: true };
});
route('DELETE', '/decks/:id', ({ params }) => {
  delete S().decks[params.id!];
  store.save();
  return { ok: true };
});
route('POST', '/decks/:id/cards', ({ params, body }) => {
  const d = deckOrFail(params.id!);
  const card = { id: uid(), deckId: params.id!, front: String(body.front).slice(0, 500), back: String(body.back).slice(0, 2000), box: 1, due: today(), reviews: 0, correct: 0 };
  d.cards.push(card);
  store.save();
  return { card };
});
function findCard(id: string) {
  for (const d of Object.values(S().decks)) {
    const c = d.cards.find((x) => x.id === id);
    if (c) return { deck: d, card: c };
  }
  return fail(404, 'Flashcard não encontrado.', 'not_found');
}
route('PUT', '/cards/:id', ({ params, body }) => {
  const { card } = findCard(params.id!);
  card.front = String(body.front).slice(0, 500);
  card.back = String(body.back).slice(0, 2000);
  store.save();
  return { ok: true };
});
route('DELETE', '/cards/:id', ({ params }) => {
  const { deck } = findCard(params.id!);
  deck.cards = deck.cards.filter((c) => c.id !== params.id);
  store.save();
  return { ok: true };
});
route('POST', '/cards/:id/review', ({ params, body }) => {
  const { card } = findCard(params.id!);
  const date = isISODate(body?.date) ? body.date : today();
  const known = !!body?.known;
  card.box = known ? Math.min(5, card.box + 1) : 1;
  card.due = addDays(date, known ? (BOX_INTERVAL[card.box] ?? 14) : 0);
  card.reviews += 1;
  card.correct += known ? 1 : 0;
  S().cardReviews[date] = (S().cardReviews[date] ?? 0) + 1;
  store.save();
  return { card };
});

// Testes de preparação
route('GET', '/tests', () => ({ tests: Object.values(S().tests).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }));
function testOrFail(id: string) {
  const t = S().tests[id];
  if (!t) fail(404, 'Teste não encontrado.', 'not_found');
  return t;
}
route('GET', '/tests/:id', ({ params }) => ({ test: testOrFail(params.id!) }));
route('DELETE', '/tests/:id', ({ params }) => {
  delete S().tests[params.id!];
  store.save();
  return { ok: true };
});
route('POST', '/tests/generate', async ({ body }) => {
  const topic = String(body?.topic ?? '').trim();
  if (topic.length < 2) fail(400, 'Indica a matéria do teste.', 'invalid');
  const kinds = ((body?.kinds ?? []) as QuestionKind[]).length ? (body.kinds as QuestionKind[]) : (['escolha-multipla', 'resposta-curta'] as QuestionKind[]);
  const count = Math.min(20, Math.max(3, Number(body?.count) || 8));
  const difficulty: Difficulty = ['facil', 'medio', 'dificil'].includes(body?.difficulty) ? body.difficulty : 'medio';
  if (!ai.configured) fail(503, NOT_AVAILABLE, 'ai_not_configured');
  assertAllowed();
  const plan = S().profile.aiPlan;
  const name = subjectName(body.subject);
  const prompt = `${structuredSystemPrompt(q())}\n\n---\n\n${testPrompt({ subjectName: name, topic, yearLabel: yearLabel(q()?.year), count, difficulty, kinds })}\n\nResponde apenas com JSON neste formato: ${JSON_FORMATS.test}`;
  const raw = await ai.json<RawTest>(plan, prompt);
  record({ questions: 1 });
  const questions = normalizeQuestions(raw, count);
  if (!questions.length) fail(502, 'A IA não devolveu perguntas válidas. Tenta novamente.', 'ai_empty');
  const test: PracticeTest = {
    id: uid(),
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
  S().tests[test.id] = test;
  store.save();
  return { test, usage: usage() };
});
route('POST', '/tests/:id/submit', async ({ params, body }) => {
  const test = testOrFail(params.id!);
  const answers = (body?.answers ?? []) as (string | number | null)[];
  if (answers.length !== test.questions.length) fail(400, 'Responde a todas as perguntas.', 'invalid');
  const results = gradeClosed(test.questions, answers);
  const open = test.questions.map((_, i) => i).filter((i) => results[i] === null);
  let usageOut: UsageSnapshot | undefined;
  if (open.length) {
    const self = body.selfGrades as Record<string, boolean> | undefined;
    if (self && open.every((i) => typeof self[String(i)] === 'boolean')) {
      for (const i of open) {
        const qn = test.questions[i]!;
        const ok = self[String(i)]!;
        results[i] = { score: ok ? qn.points : 0, max: qn.points, correct: ok, feedback: 'Autoavaliação.' };
      }
    } else if (body.useAi !== false && ai.configured) {
      const limit = limitError(usage());
      if (limit) return { pendingSelfGrade: open, test, notice: limit.message };
      const prompt = `${structuredSystemPrompt(q())}\n\n---\n\n${gradePrompt(test.title, open.map((i) => ({ index: i, question: test.questions[i]!, answer: String(answers[i] ?? '') })))}\n\nResponde apenas com JSON neste formato: ${JSON_FORMATS.grades}`;
      const raw = await ai.json<RawGrades>(S().profile.aiPlan, prompt);
      record({ questions: 1 });
      usageOut = usage();
      applyGrades(test.questions, results, open, raw);
    } else {
      return { pendingSelfGrade: open, test };
    }
  }
  const final = results as NonNullable<(typeof results)[number]>[];
  Object.assign(test, { answers, results: final, score: final.reduce((a, x) => a + x.score, 0), completedAt: now() });
  store.save();
  return { test, ...(usageOut ? { usage: usageOut } : {}) };
});

// ---------- entrada ----------

/** Substitui o `fetch` para /api/... na versão de demonstração. */
export async function demoFetch(input: string, init: RequestInit = {}): Promise<Response> {
  await boot();
  const url = new URL(input, 'https://study-ai.local');
  const path = url.pathname.replace(/^\/api/, '');
  const method = (init.method ?? 'GET').toUpperCase();
  let body: unknown = undefined;
  if (typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = undefined;
    }
  } else if (init.body instanceof Blob) body = init.body;
  for (const r of routes) {
    if (r.method !== method) continue;
    const m = r.pattern.exec(path);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1] ?? '')]));
    try {
      const result = await r.handler({ params, query: url.searchParams, body, init });
      if (result instanceof Response) return result;
      return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      const e = err instanceof DemoError ? err : new DemoError(500, 'Ocorreu um erro. Tenta novamente.', 'erro');
      if (!(err instanceof DemoError)) console.error('[demo]', err);
      return new Response(JSON.stringify({ error: e.message, code: e.code }), { status: e.status, headers: { 'Content-Type': 'application/json' } });
    }
  }
  return new Response(JSON.stringify({ error: 'Endereço não encontrado.', code: 'not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}

/** Endereço de um anexo desta sessão (imagens). `null` se já não estiver disponível. */
export function demoAttachmentUrl(id: string): string | null {
  return attachments.get(id)?.url ?? null;
}
