/**
 * Regras de progressão: desbloqueio de unidades e lições, XP, sequência e conquistas.
 * Funções puras sobre o índice do curso e o conjunto de lições concluídas.
 */
import type { CourseIndex, IndexedUnit } from '../domain/schemas.ts';
import type { UserProfile } from '../domain/progress.ts';

export type LessonState = 'completed' | 'available' | 'locked';
export type UnitState = 'completed' | 'in-progress' | 'available' | 'locked' | 'coming-soon';

/** Unidades pela ordem global do curso. */
export function orderedUnits(index: CourseIndex): IndexedUnit[] {
  return [...index.sections]
    .sort((a, b) => a.order - b.order)
    .flatMap((s) => [...s.units].sort((a, b) => a.order - b.order));
}

/** Uma unidade conta como concluída quando todas as suas lições publicadas estão concluídas. */
export function isUnitComplete(unit: IndexedUnit, completed: ReadonlySet<string>): boolean {
  return unit.lessonIds.length > 0 && unit.lessonIds.every((id) => completed.has(id));
}

/**
 * Calcula o estado de todas as unidades numa só passagem (O(lições)).
 * Regra: a primeira unidade está sempre disponível; as restantes exigem os
 * pré-requisitos explícitos OU, se não houver, a unidade anterior com conteúdo.
 * Unidades sem lições publicadas são "em preparação" e não bloqueiam as seguintes.
 */
export function computeUnitStates(
  index: CourseIndex,
  completed: ReadonlySet<string>,
  freeNavigation = false,
): Map<string, UnitState> {
  const states = new Map<string, UnitState>();
  const units = orderedUnits(index);
  const doneUnits = new Set(units.filter((u) => isUnitComplete(u, completed)).map((u) => u.id));
  const hasContent = new Set(units.filter((u) => u.lessonIds.length > 0).map((u) => u.id));
  let previousWithContent: IndexedUnit | undefined;
  for (const u of units) {
    if (u.lessonIds.length === 0) {
      states.set(u.id, 'coming-soon');
      continue;
    }
    const done = u.lessonIds.filter((id) => completed.has(id)).length;
    let unlocked: boolean;
    if (freeNavigation || !previousWithContent) unlocked = true;
    else if (u.prerequisites.length > 0) unlocked = u.prerequisites.every((p) => doneUnits.has(p) || !hasContent.has(p));
    else unlocked = doneUnits.has(previousWithContent.id);
    // Uma unidade já iniciada nunca volta a ficar bloqueada (ex.: após atualização de conteúdo).
    if (done > 0) unlocked = true;
    states.set(u.id, !unlocked ? 'locked' : done === u.lessonIds.length ? 'completed' : done > 0 ? 'in-progress' : 'available');
    previousWithContent = u;
  }
  return states;
}

/** Estado de cada lição dentro de uma unidade: sequencial, revisitável depois de concluída. */
export function computeLessonStates(
  unit: IndexedUnit,
  unitState: UnitState,
  completed: ReadonlySet<string>,
  freeNavigation = false,
): Map<string, LessonState> {
  const out = new Map<string, LessonState>();
  let previousDone = true;
  for (const id of unit.lessonIds) {
    if (completed.has(id)) out.set(id, 'completed');
    else if (unitState !== 'locked' && unitState !== 'coming-soon' && (previousDone || freeNavigation)) out.set(id, 'available');
    else out.set(id, 'locked');
    previousDone = completed.has(id);
  }
  return out;
}

/** Próxima lição recomendada: a primeira disponível e não concluída na ordem do curso. */
export function nextLesson(index: CourseIndex, completed: ReadonlySet<string>, freeNavigation = false): { unitId: string; lessonId: string } | null {
  const states = computeUnitStates(index, completed, freeNavigation);
  for (const u of orderedUnits(index)) {
    const st = states.get(u.id);
    if (st === 'locked' || st === 'coming-soon' || st === 'completed') continue;
    const id = u.lessonIds.find((l) => !completed.has(l));
    if (id) return { unitId: u.id, lessonId: id };
  }
  return null;
}

// ---------------------------------------------------------------------------
// XP
// ---------------------------------------------------------------------------
export const XP_RULES = {
  lessonBase: 10,
  perCorrect: 1,
  perfectBonus: 5,
  /** Repetir uma lição dá metade do XP base (incentiva rever sem "farmar"). */
  repeatFactor: 0.5,
  reviewPerCorrect: 1,
  reviewSessionBonus: 3,
} as const;

export function lessonXp(correct: number, total: number, isRepeat: boolean): number {
  const base = XP_RULES.lessonBase * (isRepeat ? XP_RULES.repeatFactor : 1);
  const perfect = total > 0 && correct === total ? XP_RULES.perfectBonus : 0;
  return Math.round(base + correct * XP_RULES.perCorrect + perfect);
}

// ---------------------------------------------------------------------------
// Datas e sequência (sem castigo: só se mostra o que foi conseguido)
// ---------------------------------------------------------------------------
export function localDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return localDate(new Date(y, m - 1, d + n));
}

/**
 * Sequência atual: dias seguidos de estudo terminando hoje ou ontem
 * (estudar hoje ainda pode "continuar" a sequência — não há perda a meio do dia).
 */
export function currentStreak(studyDays: readonly string[], today: string): number {
  const set = new Set(studyDays);
  let start = set.has(today) ? today : addDays(today, -1);
  if (!set.has(start)) return 0;
  let n = 0;
  while (set.has(start)) {
    n++;
    start = addDays(start, -1);
  }
  return n;
}

export function longestStreak(studyDays: readonly string[]): number {
  const sorted = [...new Set(studyDays)].sort();
  let best = 0;
  let run = 0;
  let prev: string | undefined;
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function studyDaysInLastWeek(studyDays: readonly string[], today: string): number {
  const set = new Set(studyDays);
  let n = 0;
  for (let i = 0; i < 7; i++) if (set.has(addDays(today, -i))) n++;
  return n;
}

export function lastNDays(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
}

// ---------------------------------------------------------------------------
// Conquistas
// ---------------------------------------------------------------------------
export interface AchievementContext {
  profile: UserProfile;
  lessonsCompleted: number;
  unitsCompleted: number;
  wordsLearned: number;
  wordsMastered: number;
  perfectLessons: number;
  reviewSessions: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  test: (c: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 'first-lesson', title: 'Primeiro passo', description: 'Concluir a primeira lição.', icon: '🌱', test: (c) => c.lessonsCompleted >= 1 },
  { id: 'lessons-10', title: 'Ritmo certo', description: 'Concluir 10 lições.', icon: '🚲', test: (c) => c.lessonsCompleted >= 10 },
  { id: 'lessons-50', title: 'Meio caminho andado', description: 'Concluir 50 lições.', icon: '🛤️', test: (c) => c.lessonsCompleted >= 50 },
  { id: 'lessons-250', title: 'Persistência', description: 'Concluir 250 lições.', icon: '🏔️', test: (c) => c.lessonsCompleted >= 250 },
  { id: 'unit-1', title: 'Unidade completa', description: 'Concluir uma unidade inteira.', icon: '🧩', test: (c) => c.unitsCompleted >= 1 },
  { id: 'perfect-1', title: 'Sem falhas', description: 'Concluir uma lição sem erros.', icon: '🎯', test: (c) => c.perfectLessons >= 1 },
  { id: 'words-50', title: 'Vocabulário a crescer', description: 'Aprender 50 palavras.', icon: '📚', test: (c) => c.wordsLearned >= 50 },
  { id: 'words-250', title: 'Biblioteca pessoal', description: 'Aprender 250 palavras.', icon: '🏛️', test: (c) => c.wordsLearned >= 250 },
  { id: 'mastered-25', title: 'Memória de longo prazo', description: 'Dominar 25 palavras na revisão.', icon: '🧠', test: (c) => c.wordsMastered >= 25 },
  { id: 'review-5', title: 'Revisão regular', description: 'Fazer 5 sessões de revisão.', icon: '🔁', test: (c) => c.reviewSessions >= 5 },
  { id: 'days-3', title: 'Três dias de estudo', description: 'Estudar em 3 dias diferentes.', icon: '🌷', test: (c) => c.profile.studyDays.length >= 3 },
  { id: 'days-30', title: 'Um mês de prática', description: 'Estudar em 30 dias diferentes (não precisam de ser seguidos).', icon: '🌻', test: (c) => c.profile.studyDays.length >= 30 },
  { id: 'xp-500', title: '500 XP', description: 'Acumular 500 pontos de experiência.', icon: '⭐', test: (c) => c.profile.totalXp >= 500 },
];

export function newlyUnlocked(ctx: AchievementContext, already: ReadonlySet<string>): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !already.has(a.id) && a.test(ctx));
}

// ---------------------------------------------------------------------------
// Mensagens de incentivo (variadas, sem culpa)
// ---------------------------------------------------------------------------
const ENCOURAGEMENT = {
  perfect: ['Impecável! Nem um erro.', 'Perfeito — está a ganhar confiança.', 'Excelente precisão!'],
  good: ['Muito bem! Cada lição conta.', 'Bom trabalho — os erros também ensinam.', 'Está no bom caminho.'],
  tough: ['Esta foi exigente. Rever ajuda muito.', 'Os erros são normais: vamos revê-los mais tarde.', 'Persistir é o que faz a diferença.'],
  welcomeBack: ['Bem-vindo de volta! Vamos retomar onde ficou.', 'Que bom vê-lo outra vez. Uma lição curta para aquecer?'],
} as const;

export function encouragement(kind: keyof typeof ENCOURAGEMENT, seed = Date.now()): string {
  const list = ENCOURAGEMENT[kind];
  return list[Math.abs(Math.floor(seed)) % list.length]!;
}
