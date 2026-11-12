import type { AiPlanId, UsageSnapshot } from './plans.ts';
import type { CustomSubjects } from './subjects.ts';

export type MainGoal =
  | 'melhorar-notas'
  | 'preparar-testes'
  | 'trabalhos-casa'
  | 'aprender-melhor'
  | 'organizar-tempo'
  | 'exames';

export type LearningStyle = 'resumos' | 'exercicios' | 'explicacoes' | 'perguntas' | 'exemplos';

export const GOAL_LABELS: Record<MainGoal, string> = {
  'melhorar-notas': 'Melhorar as notas',
  'preparar-testes': 'Preparar testes',
  'trabalhos-casa': 'Fazer os trabalhos de casa',
  'aprender-melhor': 'Aprender melhor a matéria',
  'organizar-tempo': 'Organizar o meu tempo',
  exames: 'Preparar exames nacionais',
};

export const STYLE_LABELS: Record<LearningStyle, string> = {
  resumos: 'Resumos',
  exercicios: 'Exercícios',
  explicacoes: 'Explicações detalhadas',
  perguntas: 'Perguntas e respostas',
  exemplos: 'Exemplos práticos',
};

export interface UpcomingTest {
  subject: string;
  date: string;
  topic?: string;
}

/** Respostas do questionário inicial. */
export interface Questionnaire {
  name: string;
  year: string;
  subjects: string[];
  customSubjects: CustomSubjects;
  difficult: string[];
  easy: string[];
  /** Minutos disponíveis por dia de estudo. */
  dailyMinutes: number;
  /** Dias de estudo: 0 = segunda … 6 = domingo. */
  studyDays: number[];
  /** Hora a que costuma começar a estudar (HH:MM). */
  startTime: string;
  goal: MainGoal;
  styles: LearningStyle[];
  tests: UpcomingTest[];
}

export type ActivityType =
  | 'estudo'
  | 'exercicios'
  | 'resumo'
  | 'perguntas'
  | 'exemplos'
  | 'revisao'
  | 'consolidacao'
  | 'tpc'
  | 'preparacao-teste';

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  estudo: 'Estudo da matéria',
  exercicios: 'Exercícios',
  resumo: 'Resumo',
  perguntas: 'Perguntas e respostas',
  exemplos: 'Exemplos práticos',
  revisao: 'Revisão',
  consolidacao: 'Exercícios de consolidação',
  tpc: 'Trabalhos de casa',
  'preparacao-teste': 'Preparação para o teste',
};

export const ACTIVITY_HINTS: Record<ActivityType, string> = {
  estudo: 'Lê a matéria e pede à IA que te explique o que não perceberes.',
  exercicios: 'Resolve exercícios e confirma as respostas com a IA.',
  resumo: 'Faz um resumo (ou pede-o à IA) e guarda-o nos teus resumos.',
  perguntas: 'Testa-te com flashcards ou com perguntas feitas pela IA.',
  exemplos: 'Pede à IA exemplos práticos para ligar a matéria ao dia a dia.',
  revisao: 'Revê o que estudaste esta semana e anota as dúvidas.',
  consolidacao: 'Exercícios extra para fixar bem a matéria.',
  tpc: 'Faz os trabalhos de casa. Se ficares preso, pede ajuda à IA.',
  'preparacao-teste': 'Prepara o teste: revisões, teste de preparação e flashcards.',
};

export interface PlanSession {
  id: string;
  weekday: number;
  start: string;
  minutes: number;
  /** Id da disciplina; vazio para «Trabalhos de casa» de todas as disciplinas. */
  subject: string;
  activity: ActivityType;
  note?: string;
}

export interface WeeklyGoal {
  id: string;
  text: string;
  kind: 'minutes' | 'sessions' | 'check';
  subject?: string;
  target?: number;
}

export interface StudyPlan {
  version: 1;
  generatedAt: string;
  sessions: PlanSession[];
  weeklyGoals: WeeklyGoal[];
  insights: string[];
  aiInsights?: string | null;
  meta: { startTime: string; dailyMinutes: number; studyDays: number[] };
  settings: { autoRevisions: boolean };
}

export type EventType = 'teste' | 'trabalho' | 'outro';

export interface CalendarEvent {
  id: string;
  type: EventType;
  subject: string | null;
  title: string;
  date: string;
  notes: string;
}

/** Uma sessão concreta num dia (do plano semanal ou uma revisão antes de um teste). */
export interface DaySession extends PlanSession {
  date: string;
  key: string;
  eventId?: string;
}

export interface UserPublic {
  id: string;
  /** Vazio quando se usa a app sem conta. */
  email: string;
  name: string;
  createdAt: string;
  /** A usar sem conta (só neste dispositivo, até criar a conta). */
  guest?: boolean;
}

export interface ProfileSettings {
  reduceMotion: boolean;
  focusMinutes: number;
  breakMinutes: number;
}

export interface Profile {
  onboarded: boolean;
  questionnaire: Questionnaire | null;
  aiPlan: AiPlanId;
  favorites: string[];
  settings: ProfileSettings;
}

export interface MeResponse {
  user: UserPublic;
  profile: Profile;
  usage: UsageSnapshot;
  ai: AiStatus;
  /** Funcionalidades extra desta versão: 'photos' (fotos → materiais/calendário), 'essays' (redações). */
  features?: string[];
}

export interface AiStatus {
  configured: boolean;
  /** Explicação para mostrar quando a IA não está ligada. */
  message: string;
  /** Quem fornece a IA (ex.: «Google Gemini»), quando não é o Claude. */
  provider?: string;
  /** Aviso a mostrar junto do chat (ex.: privacidade do plano gratuito). */
  notice?: string;
  /** O servidor transforma gravações de voz em texto (POST /transcribe). */
  voice?: boolean;
}

export interface Attachment {
  id: string;
  kind: 'image' | 'file';
  mime: string;
  name: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments: Attachment[];
  plan: AiPlanId | null;
  status: 'ok' | 'stopped' | 'error';
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
  preview?: string;
}

export interface Summary {
  id: string;
  subject: string | null;
  title: string;
  content: string;
  source: 'ia' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  subject: string | null;
  title: string;
  createdAt: string;
  cardCount: number;
  dueCount: number;
  masteredCount: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  box: number;
  due: string;
  reviews: number;
  correct: number;
}

export type QuestionKind = 'escolha-multipla' | 'verdadeiro-falso' | 'resposta-curta' | 'desenvolvimento';

export const QUESTION_KIND_LABELS: Record<QuestionKind, string> = {
  'escolha-multipla': 'Escolha múltipla',
  'verdadeiro-falso': 'Verdadeiro ou falso',
  'resposta-curta': 'Resposta curta',
  desenvolvimento: 'Desenvolvimento',
};

export interface TestQuestion {
  kind: QuestionKind;
  prompt: string;
  options: string[];
  correctOption: number;
  modelAnswer: string;
  explanation: string;
  points: number;
}

export interface QuestionResult {
  score: number;
  max: number;
  correct: boolean;
  feedback: string;
}

export interface PracticeTest {
  id: string;
  subject: string | null;
  topic: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  title: string;
  questions: TestQuestion[];
  answers: (string | number | null)[] | null;
  results: QuestionResult[] | null;
  score: number | null;
  maxScore: number;
  createdAt: string;
  completedAt: string | null;
}

export interface StudyLog {
  id: string;
  date: string;
  subject: string | null;
  minutes: number;
  source: 'timer' | 'plano' | 'manual';
  sessionKey: string | null;
  createdAt: string;
}

export interface DailyGoal {
  id: string;
  date: string;
  text: string;
  done: boolean;
}

/** Números para as medalhas e os desafios da semana (parte de GET /stats). */
export interface AchievementNumbers {
  bestStreak: number;
  studyDays: number;
  sessionsDone: number;
  testsDone: number;
  testsExcellent: number;
  reviewsTotal: number;
  subjectsStudied: number;
  weekTests: number;
  weekReviews: number;
  weekQuestions: number;
  weekDays: number;
}

/** Maior número de dias seguidos numa lista de datas AAAA-MM-DD. */
export function longestRun(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  let best = 0;
  let run = 0;
  let prev = '';
  for (const d of sorted) {
    const next = prev && new Date(Date.parse(`${prev}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
    run = next === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

// ---------- correção de redações ----------

export type EssayKind = 'opiniao' | 'argumentativo' | 'narrativo' | 'descritivo' | 'expositivo' | 'carta' | 'resumo' | 'outro';

export const ESSAY_KIND_LABELS: Record<EssayKind, string> = {
  opiniao: 'Texto de opinião',
  argumentativo: 'Texto argumentativo',
  narrativo: 'Texto narrativo',
  descritivo: 'Texto descritivo',
  expositivo: 'Texto expositivo',
  carta: 'Carta / email',
  resumo: 'Resumo / síntese',
  outro: 'Outro',
};

export type EssayErrorType = 'ortografia' | 'acentuação' | 'pontuação' | 'gramática' | 'vocabulário' | 'estrutura';

export interface EssayError {
  original: string;
  correction: string;
  explanation: string;
  type: EssayErrorType;
}

export interface EssayCriterion {
  name: string;
  score: number;
  max: number;
  comment: string;
}

export interface EssayReview {
  /** Nota de 0 a 20. */
  grade: number;
  /** «Insuficiente», «Suficiente», «Bom», «Muito bom». */
  level: string;
  summary: string;
  criteria: EssayCriterion[];
  errors: EssayError[];
  strengths: string[];
  improvements: string[];
  /** Versão melhorada (Markdown). */
  improved: string;
  wordCount: number;
}

export interface Essay {
  id: string;
  title: string;
  kind: EssayKind;
  theme: string;
  text: string;
  fromPhoto: boolean;
  review: EssayReview;
  createdAt: string;
}

/** Proposta de teste/trabalho lida de uma fotografia do calendário (a confirmar pelo estudante). */
export interface CalendarProposal {
  date: string;
  subject: string | null;
  type: EventType;
  title: string;
  notes: string;
}
