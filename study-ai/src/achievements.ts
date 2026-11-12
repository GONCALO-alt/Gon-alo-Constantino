// Medalhas, pontos (XP), nível e desafios da semana, calculados a partir das estatísticas.
// Sem React, para poder ser testado.
import type { AchievementNumbers } from '../shared/types';

export interface AchievementStats {
  totalMinutes: number;
  timerMinutes: number;
  questions: number;
  summaries: number;
  cards: { total: number; mastered: number };
  weekMinutes: number;
  weekSessions: number;
  achievements: AchievementNumbers;
}

export type Tier = 'bronze' | 'prata' | 'ouro';
export const TIERS: Tier[] = ['bronze', 'prata', 'ouro'];
export const TIER_LABEL: Record<Tier, string> = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro' };
const TIER_XP: Record<Tier, number> = { bronze: 50, prata: 150, ouro: 400 };

interface MedalDef {
  id: string;
  emoji: string;
  title: string;
  /** Texto do objetivo `n` (com singular e plural certos). */
  text: (n: number) => string;
  goals: [number, number, number];
  value: (s: AchievementStats) => number;
}

export const MEDALS: MedalDef[] = [
  { id: 'tempo', emoji: '⏱️', title: 'Maratonista', text: (n) => `Estudar ${time(n)} no total`, goals: [60, 600, 3000], value: (s) => s.totalMinutes },
  { id: 'sequencia', emoji: '🔥', title: 'Sempre presente', text: (n) => `Estudar ${n} dias seguidos`, goals: [3, 7, 30], value: (s) => s.achievements.bestStreak },
  { id: 'plano', emoji: '📅', title: 'Plano cumprido', text: (n) => `Fazer ${n} sessões do plano`, goals: [5, 25, 100], value: (s) => s.achievements.sessionsDone },
  { id: 'testes', emoji: '📝', title: 'Treino de testes', text: (n) => (n === 1 ? 'Fazer o primeiro teste de preparação' : `Fazer ${n} testes de preparação`), goals: [1, 10, 30], value: (s) => s.achievements.testsDone },
  { id: 'notas', emoji: '🌟', title: 'Nota máxima', text: (n) => `Ter 90% ou mais em ${n} ${n === 1 ? 'teste' : 'testes'}`, goals: [1, 5, 15], value: (s) => s.achievements.testsExcellent },
  { id: 'memoria', emoji: '🧠', title: 'Memória de elefante', text: (n) => `Dominar ${n} flashcards`, goals: [10, 50, 200], value: (s) => s.cards.mastered },
  { id: 'revisoes', emoji: '🔁', title: 'Revisor', text: (n) => `Fazer ${n} revisões de flashcards`, goals: [50, 300, 1000], value: (s) => s.achievements.reviewsTotal },
  { id: 'perguntas', emoji: '💬', title: 'Curioso', text: (n) => `Fazer ${n} perguntas à IA`, goals: [10, 100, 500], value: (s) => s.questions },
  { id: 'resumos', emoji: '📚', title: 'Bom resumo', text: (n) => (n === 1 ? 'Guardar o primeiro resumo' : `Guardar ${n} resumos`), goals: [1, 10, 30], value: (s) => s.summaries },
  { id: 'foco', emoji: '🎯', title: 'Foco total', text: (n) => `Estudar ${time(n)} no modo de estudo`, goals: [25, 250, 1000], value: (s) => s.timerMinutes },
  { id: 'disciplinas', emoji: '🧭', title: 'Explorador', text: (n) => `Estudar ${n} disciplinas diferentes`, goals: [3, 6, 10], value: (s) => s.achievements.subjectsStudied },
];

/** Minutos por extenso: «1 hora», «10 horas», «25 minutos». */
function time(n: number): string {
  if (n >= 60 && n % 60 === 0) return `${n / 60} ${n === 60 ? 'hora' : 'horas'}`;
  return `${n} minutos`;
}

const goalText = (def: MedalDef, n: number) => def.text(n);

export interface MedalView {
  id: string;
  emoji: string;
  title: string;
  /** Nível alcançado (null = ainda nenhum). */
  tier: Tier | null;
  value: number;
  /** Próximo objetivo (null = já tem ouro). */
  next: { tier: Tier; goal: number; text: string } | null;
  /** Texto do nível alcançado (ou do primeiro, se ainda não tem). */
  text: string;
}

export function medals(s: AchievementStats): MedalView[] {
  return MEDALS.map((def) => {
    const value = def.value(s);
    const reached = def.goals.filter((g) => value >= g).length;
    const tier = reached ? TIERS[reached - 1]! : null;
    const nextIdx = reached < 3 ? reached : null;
    return {
      id: def.id,
      emoji: def.emoji,
      title: def.title,
      tier,
      value,
      next: nextIdx === null ? null : { tier: TIERS[nextIdx]!, goal: def.goals[nextIdx]!, text: goalText(def, def.goals[nextIdx]!) },
      text: goalText(def, def.goals[Math.max(0, reached - 1)]!),
    };
  });
}

/** Chaves «medalha:nível» de tudo o que já foi ganho (para saber o que é novo). */
export const earnedKeys = (list: MedalView[]) =>
  list.flatMap((m) => (m.tier ? TIERS.slice(0, TIERS.indexOf(m.tier) + 1).map((t) => `${m.id}:${t}`) : []));

const LEVELS = [
  { xp: 0, name: 'Iniciante' },
  { xp: 200, name: 'Aprendiz' },
  { xp: 600, name: 'Estudioso' },
  { xp: 1200, name: 'Dedicado' },
  { xp: 2200, name: 'Avançado' },
  { xp: 3600, name: 'Expert' },
  { xp: 5500, name: 'Mestre' },
  { xp: 8000, name: 'Lenda' },
];

export interface LevelView {
  xp: number;
  level: number;
  name: string;
  /** XP do nível atual e do seguinte (null no último). */
  from: number;
  to: number | null;
}

/** Pontos: cada minuto de estudo, sessão, teste, revisão e pergunta conta; as medalhas dão bónus. */
export function level(s: AchievementStats, list = medals(s)): LevelView {
  const a = s.achievements;
  const bonus = list.reduce((sum, m) => sum + (m.tier ? TIERS.slice(0, TIERS.indexOf(m.tier) + 1).reduce((x, t) => x + TIER_XP[t], 0) : 0), 0);
  const xp = Math.round(s.totalMinutes + a.sessionsDone * 10 + a.testsDone * 25 + a.testsExcellent * 25 + a.reviewsTotal + Math.min(s.questions, 1000) * 2 + s.summaries * 10 + bonus);
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1]!.xp) i++;
  return { xp, level: i + 1, name: LEVELS[i]!.name, from: LEVELS[i]!.xp, to: LEVELS[i + 1]?.xp ?? null };
}

export interface Challenge {
  id: string;
  emoji: string;
  title: string;
  value: number;
  goal: number;
  unit: string;
  done: boolean;
}

/**
 * Três desafios por semana, que mudam de semana para semana.
 * `plannedWeekMinutes` vem do questionário (minutos por dia × dias de estudo).
 */
export function weeklyChallenges(s: AchievementStats, weekStartDate: string, plannedWeekMinutes: number | null): Challenge[] {
  const a = s.achievements;
  const target = Math.min(600, Math.max(60, Math.round(((plannedWeekMinutes ?? 150) * 0.8) / 10) * 10));
  const pool: Omit<Challenge, 'done'>[] = [
    { id: 'minutos', emoji: '⏱️', title: `Estudar ${target} minutos esta semana`, value: s.weekMinutes, goal: target, unit: 'min' },
    { id: 'dias', emoji: '📆', title: 'Estudar em 4 dias diferentes', value: a.weekDays, goal: 4, unit: 'dias' },
    { id: 'teste', emoji: '📝', title: 'Fazer um teste de preparação', value: a.weekTests, goal: 1, unit: 'teste' },
    { id: 'revisoes', emoji: '🔁', title: 'Rever 30 flashcards', value: a.weekReviews, goal: 30, unit: 'revisões' },
    { id: 'sessoes', emoji: '📅', title: 'Cumprir 4 sessões do plano', value: s.weekSessions, goal: 4, unit: 'sessões' },
    { id: 'perguntas', emoji: '💬', title: 'Tirar 5 dúvidas com a IA', value: a.weekQuestions, goal: 5, unit: 'perguntas' },
  ];
  // O primeiro desafio é sempre o tempo de estudo; os outros dois rodam com a semana.
  const week = Math.floor(Date.parse(`${weekStartDate}T12:00:00Z`) / (7 * 86_400_000));
  const rest = pool.slice(1);
  const pick = [pool[0]!, rest[week % rest.length]!, rest[(week + 2) % rest.length]!];
  return pick.map((c) => ({ ...c, value: Math.min(c.value, c.goal), done: c.value >= c.goal }));
}
