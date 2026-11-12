// Estado de um estudante (versões claude.ai, Netlify e Cloudflare).
// O servidor Node (SQLite) usa tabelas próprias; as outras versões usam este formato.

import type { PushState } from './reminders';
import type {
  CalendarEvent, ChatMessage, Conversation, DailyGoal, Essay, Flashcard, PracticeTest, Profile, StudyLog, StudyPlan, Summary,
} from '../shared/types';

export interface DeckRow {
  id: string;
  subject: string | null;
  title: string;
  createdAt: string;
}

export interface UserState {
  /** Aumenta a cada gravação. */
  rev: number;
  user: { id: string; name: string; email: string; createdAt: string; guest?: boolean };
  profile: Profile;
  plan: StudyPlan | null;
  checks: Record<string, string[]>;
  usage: Record<string, { questions: number; images: number }>;
  cardReviews: Record<string, number>;
  events: CalendarEvent[];
  logs: StudyLog[];
  goals: DailyGoal[];
  conversations: Record<string, { conversation: Conversation; messages: ChatMessage[] }>;
  summaries: Record<string, Summary>;
  decks: Record<string, { deck: DeckRow; cards: Flashcard[] }>;
  tests: Record<string, PracticeTest>;
  /** Redações corrigidas (pode faltar em estados antigos). */
  essays?: Record<string, Essay>;
  /** Lembretes no telemóvel: subscrições, preferências e o que já foi enviado. */
  push?: PushState;
}

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;

export function freshState(user: { id?: string; name: string; email?: string; guest?: boolean }): UserState {
  return {
    rev: 0,
    user: {
      id: user.id ?? newId(),
      name: user.name || 'Estudante',
      email: user.email ?? '',
      createdAt: new Date().toISOString(),
      ...(user.guest ? { guest: true } : {}),
    },
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
    essays: {},
  };
}

/** Limita o tamanho: conversas e registos antigos saem primeiro. */
export function trimState(s: UserState) {
  const convs = Object.values(s.conversations).sort((a, b) => b.conversation.updatedAt.localeCompare(a.conversation.updatedAt));
  for (const c of convs.slice(150)) delete s.conversations[c.conversation.id];
  for (const c of convs.slice(0, 150)) if (c.messages.length > 200) c.messages = c.messages.slice(-200);
  if (s.logs.length > 5000) s.logs = s.logs.slice(-5000);
  if (s.goals.length > 3000) s.goals = s.goals.slice(-3000);
  const essays = Object.values(s.essays ?? {}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const e of essays.slice(50)) delete s.essays![e.id];
}

const month = (date: string) => date.slice(0, 7);

/** Uma conversa muito longa guarda só as mensagens mais recentes (limite de cada documento). */
export function trimConversation(c: { conversation: Conversation; messages: ChatMessage[] }) {
  let messages = c.messages;
  while (messages.length > 2 && JSON.stringify(messages).length > 200_000) messages = messages.slice(2);
  return { conversation: c.conversation, messages };
}

/**
 * Divide o estado em documentos pequenos (chave → valor): `main`, `conv_<id>`, `sum_<id>`,
 * `deck_<id>`, `test_<id>`, `logs_AAAA-MM`, `goals_AAAA-MM`. Assim só se grava o que mudou.
 */
export function splitState(s: UserState): Record<string, unknown> {
  const docs: Record<string, unknown> = {
    main: { rev: s.rev, user: s.user, profile: s.profile, plan: s.plan, checks: s.checks, usage: s.usage, cardReviews: s.cardReviews, events: s.events, push: s.push },
  };
  for (const [id, c] of Object.entries(s.conversations)) docs[`conv_${id}`] = trimConversation(c);
  for (const [id, x] of Object.entries(s.summaries)) docs[`sum_${id}`] = x;
  for (const [id, x] of Object.entries(s.decks)) docs[`deck_${id}`] = x;
  for (const [id, x] of Object.entries(s.tests)) docs[`test_${id}`] = x;
  for (const [id, x] of Object.entries(s.essays ?? {})) docs[`essay_${id}`] = x;
  for (const l of s.logs) ((docs[`logs_${month(l.date)}`] ??= []) as StudyLog[]).push(l);
  for (const g of s.goals) ((docs[`goals_${month(g.date)}`] ??= []) as DailyGoal[]).push(g);
  return docs;
}

/** O contrário de `splitState`. Devolve `null` se não houver estado guardado. */
export function joinState(docs: Record<string, unknown>): UserState | null {
  const main = docs.main as Partial<UserState> | undefined;
  if (!main?.user || !main.profile) return null;
  const s: UserState = {
    rev: Number(main.rev) || 0,
    user: main.user,
    profile: main.profile,
    plan: main.plan ?? null,
    checks: main.checks ?? {},
    usage: main.usage ?? {},
    cardReviews: main.cardReviews ?? {},
    events: main.events ?? [],
    ...(main.push ? { push: main.push } : {}),
    logs: [],
    goals: [],
    conversations: {},
    summaries: {},
    decks: {},
    tests: {},
    essays: {},
  };
  for (const [key, value] of Object.entries(docs)) {
    if (!value) continue;
    const id = key.slice(key.indexOf('_') + 1);
    if (key.startsWith('conv_')) s.conversations[id] = value as UserState['conversations'][string];
    else if (key.startsWith('sum_')) s.summaries[id] = value as Summary;
    else if (key.startsWith('deck_')) s.decks[id] = value as UserState['decks'][string];
    else if (key.startsWith('test_')) s.tests[id] = value as PracticeTest;
    else if (key.startsWith('essay_')) s.essays![id] = value as Essay;
    else if (key.startsWith('logs_')) s.logs.push(...(value as StudyLog[]));
    else if (key.startsWith('goals_')) s.goals.push(...(value as DailyGoal[]));
  }
  return s;
}
