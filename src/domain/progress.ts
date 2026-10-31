/**
 * Entidades de DADOS PESSOAIS (progresso). Vivem apenas no IndexedDB do navegador.
 * Ligam-se ao conteúdo apenas por IDs estáveis (lessonId, vocabId, exerciseId),
 * por isso o conteúdo pode ser atualizado sem perder progresso.
 */
import type { ExerciseType } from './schemas.ts';

/** Aplicação de utilizador único: o perfil local tem sempre este ID. */
export const LOCAL_USER_ID = 'local';

export interface UserProfile {
  id: string;
  displayName: string;
  createdAt: string; // ISO
  totalXp: number;
  /** Datas (AAAA-MM-DD, hora local) em que o utilizador estudou. */
  studyDays: string[];
  totalStudySeconds: number;
  lastLessonId?: string;
}

export interface UserSettings {
  id: string; // = userId
  interfaceLanguage: 'pt-PT';
  dailyGoalXp: number;
  audioEnabled: boolean;
  speechRate: number; // 0.5–1.2
  /** Efeitos sonoros curtos (certo, errado, lição concluída…). */
  soundEffects: boolean;
  /** Volume dos efeitos sonoros (0–1). */
  soundVolume: number;
  /** Ler em voz alta a resposta certa em neerlandês depois de cada exercício. */
  speakAnswers: boolean;
  /** Desbloqueia todas as unidades (para quem já tem conhecimentos). */
  freeNavigation: boolean;
  /** Aceitar respostas sem acentos (com aviso) quando o acento não muda o sentido. */
  lenientAccents: boolean;
  notificationsEnabled: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_SETTINGS: Omit<UserSettings, 'id'> = {
  interfaceLanguage: 'pt-PT',
  dailyGoalXp: 30,
  audioEnabled: true,
  speechRate: 0.9,
  soundEffects: true,
  soundVolume: 0.8,
  speakAnswers: true,
  freeNavigation: false,
  lenientAccents: true,
  notificationsEnabled: false,
  reducedMotion: false,
};

export interface LessonProgress {
  lessonId: string;
  unitId: string;
  completedAt: string;
  /** Versão do conteúdo da lição quando foi concluída. */
  contentVersion: number;
  bestAccuracy: number; // 0–1
  timesCompleted: number;
  xpEarned: number;
}

export interface ExerciseAttempt {
  id?: number; // auto-incremento
  lessonId: string | null; // null = sessão de revisão
  exerciseId: string;
  exerciseType: ExerciseType | 'review';
  correct: boolean;
  answer: string;
  at: string; // ISO
  date: string; // AAAA-MM-DD
  topic?: string; // unidade, para estatísticas por tema
}

export interface ReviewSchedule {
  /** ID do item revisto (normalmente vocabId). */
  itemId: string;
  kind: 'vocab';
  firstLearnedAt: string;
  lastReviewedAt: string;
  /** Data a partir da qual o item está pronto para revisão (ms epoch). */
  dueAt: number;
  /** Caixa de Leitner (0 = novo/esquecido). */
  box: number;
  reviews: number;
  correct: number;
  incorrect: number;
  lapses: number;
  /** 1 (fácil) – 5 (difícil); ajustado pelo historial. */
  difficulty: number;
}

export interface Achievement {
  id: string;
  unlockedAt: string;
}

export interface DailyStat {
  date: string; // AAAA-MM-DD
  xp: number;
  lessons: number;
  answers: number;
  correctAnswers: number;
  seconds: number;
}

export interface StudySession {
  id?: number;
  kind: 'lesson' | 'review';
  lessonId?: string;
  startedAt: string;
  endedAt: string;
  xp: number;
  accuracy: number;
}
