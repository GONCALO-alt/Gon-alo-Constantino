// Estado de um estudante, guardado como um todo (versão claude.ai e versão Netlify).
// O servidor Node (SQLite) usa tabelas próprias; estas duas versões usam este formato.

import type {
  CalendarEvent, ChatMessage, Conversation, DailyGoal, Flashcard, PracticeTest, Profile, StudyLog, StudyPlan, Summary,
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
  user: { id: string; name: string; email: string; createdAt: string };
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
}

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;

export function freshState(user: { id?: string; name: string; email?: string }): UserState {
  return {
    rev: 0,
    user: { id: user.id ?? newId(), name: user.name || 'Estudante', email: user.email ?? '', createdAt: new Date().toISOString() },
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

/** Limita o tamanho: conversas e registos antigos saem primeiro. */
export function trimState(s: UserState) {
  const convs = Object.values(s.conversations).sort((a, b) => b.conversation.updatedAt.localeCompare(a.conversation.updatedAt));
  for (const c of convs.slice(150)) delete s.conversations[c.conversation.id];
  for (const c of convs.slice(0, 150)) if (c.messages.length > 200) c.messages = c.messages.slice(-200);
  if (s.logs.length > 5000) s.logs = s.logs.slice(-5000);
  if (s.goals.length > 3000) s.goals = s.goals.slice(-3000);
}
