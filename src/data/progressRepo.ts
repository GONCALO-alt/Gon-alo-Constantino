/**
 * Operações sobre os dados pessoais. Cada operação que altera vários objetos
 * corre numa única transação: ou fica tudo gravado, ou nada.
 */
import {
  DEFAULT_SETTINGS, LOCAL_USER_ID,
  type Achievement, type DailyStat, type ExerciseAttempt, type LessonProgress, type ReviewSchedule,
  type StudySession, type UserProfile, type UserSettings,
} from '../domain/progress.ts';
import type { Verdict } from '../engine/answers.ts';
import { ACHIEVEMENTS, localDate, newlyUnlocked, type AchievementDef } from '../engine/progression.ts';
import { applyReview, isMastered, newSchedule } from '../engine/srs.ts';
import { ALL_STORES, closeDB, DB_NAME, DB_VERSION, getDB } from './db.ts';

export async function getProfile(): Promise<UserProfile> {
  const db = await getDB();
  const p = await db.get('profile', LOCAL_USER_ID);
  if (p) return p;
  const fresh: UserProfile = {
    id: LOCAL_USER_ID, displayName: '', createdAt: new Date().toISOString(),
    totalXp: 0, studyDays: [], totalStudySeconds: 0,
  };
  await db.put('profile', fresh);
  return fresh;
}

export async function saveProfile(p: UserProfile): Promise<void> {
  await (await getDB()).put('profile', p);
}

export async function getSettings(): Promise<UserSettings> {
  const s = await (await getDB()).get('settings', LOCAL_USER_ID);
  // Acrescenta valores por omissão para opções novas (definições antigas continuam válidas).
  return { ...DEFAULT_SETTINGS, ...s, id: LOCAL_USER_ID };
}

export async function saveSettings(s: UserSettings): Promise<void> {
  await (await getDB()).put('settings', { ...s, id: LOCAL_USER_ID });
}

export async function getAllLessonProgress(): Promise<LessonProgress[]> {
  return (await getDB()).getAll('lessonProgress');
}

export async function getCompletedLessonIds(): Promise<Set<string>> {
  return new Set(await (await getDB()).getAllKeys('lessonProgress'));
}

export async function getAllReviews(): Promise<ReviewSchedule[]> {
  return (await getDB()).getAll('reviews');
}

export async function countDueReviews(now = Date.now()): Promise<number> {
  return (await getDB()).countFromIndex('reviews', 'byDue', IDBKeyRange.upperBound(now));
}

export async function getDailyStats(): Promise<DailyStat[]> {
  return (await getDB()).getAll('dailyStats');
}

export async function getRecentAttempts(sinceDate: string): Promise<ExerciseAttempt[]> {
  return (await getDB()).getAllFromIndex('attempts', 'byDate', IDBKeyRange.lowerBound(sinceDate));
}

export async function getSessions(limit = 50): Promise<StudySession[]> {
  const all = await (await getDB()).getAllFromIndex('sessions', 'byStart');
  return all.slice(-limit).reverse();
}

export async function getAchievements(): Promise<Achievement[]> {
  return (await getDB()).getAll('achievements');
}

// ---------------------------------------------------------------------------
// Registo de uma lição concluída
// ---------------------------------------------------------------------------
export interface LessonAnswer {
  exerciseId: string;
  exerciseType: ExerciseAttempt['exerciseType'];
  verdict: Verdict;
  answer: string;
  vocabRefs: string[];
}

export interface LessonCompletion {
  lessonId: string;
  unitId: string;
  contentVersion: number;
  /** Só a primeira tentativa de cada exercício conta para a precisão. */
  answers: LessonAnswer[];
  newVocabIds: string[];
  difficulty: number;
  xp: number;
  startedAt: number;
  endedAt: number;
}

/** Conta unidades concluídas a partir das lições concluídas (depende do índice de conteúdo). */
export type UnitCounter = (completedLessonIds: ReadonlySet<string>) => number;

export interface CompletionOutcome {
  profile: UserProfile;
  newAchievements: AchievementDef[];
  isRepeat: boolean;
}

function upsertDaily(prev: DailyStat | undefined, date: string, d: Partial<Omit<DailyStat, 'date'>>): DailyStat {
  const b = prev ?? { date, xp: 0, lessons: 0, answers: 0, correctAnswers: 0, seconds: 0 };
  return {
    date,
    xp: b.xp + (d.xp ?? 0),
    lessons: b.lessons + (d.lessons ?? 0),
    answers: b.answers + (d.answers ?? 0),
    correctAnswers: b.correctAnswers + (d.correctAnswers ?? 0),
    seconds: b.seconds + (d.seconds ?? 0),
  };
}

export async function recordLessonCompletion(c: LessonCompletion, countUnits: UnitCounter = () => 0): Promise<CompletionOutcome> {
  const db = await getDB();
  const tx = db.transaction(['profile', 'lessonProgress', 'attempts', 'reviews', 'dailyStats', 'achievements', 'sessions'], 'readwrite');
  const now = c.endedAt;
  const date = localDate(new Date(now));
  const iso = new Date(now).toISOString();
  const seconds = Math.max(0, Math.round((c.endedAt - c.startedAt) / 1000));
  const correct = c.answers.filter((a) => a.verdict !== 'incorrect').length;
  const accuracy = c.answers.length ? correct / c.answers.length : 1;

  const prev = await tx.objectStore('lessonProgress').get(c.lessonId);
  await tx.objectStore('lessonProgress').put({
    lessonId: c.lessonId,
    unitId: c.unitId,
    completedAt: iso,
    contentVersion: c.contentVersion,
    bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
    timesCompleted: (prev?.timesCompleted ?? 0) + 1,
    xpEarned: (prev?.xpEarned ?? 0) + c.xp,
  });

  for (const a of c.answers) {
    await tx.objectStore('attempts').add({
      lessonId: c.lessonId, exerciseId: a.exerciseId, exerciseType: a.exerciseType,
      correct: a.verdict !== 'incorrect', answer: a.answer.slice(0, 300), at: iso, date, topic: c.unitId,
    });
  }

  // Revisão espaçada: o vocabulário novo entra no calendário; erros antecipam a revisão.
  const reviews = tx.objectStore('reviews');
  for (const id of c.newVocabIds) {
    if (!(await reviews.get(id))) await reviews.put(newSchedule(id, now, c.difficulty));
  }
  const wrongRefs = new Set(c.answers.filter((a) => a.verdict === 'incorrect').flatMap((a) => a.vocabRefs));
  for (const id of wrongRefs) {
    const s = await reviews.get(id);
    if (s) await reviews.put(applyReview(s, 'incorrect', now));
  }

  const ds = tx.objectStore('dailyStats');
  await ds.put(upsertDaily(await ds.get(date), date, { xp: c.xp, lessons: 1, answers: c.answers.length, correctAnswers: correct, seconds }));

  await tx.objectStore('sessions').add({ kind: 'lesson', lessonId: c.lessonId, startedAt: new Date(c.startedAt).toISOString(), endedAt: iso, xp: c.xp, accuracy });

  const profileStore = tx.objectStore('profile');
  const profile = (await profileStore.get(LOCAL_USER_ID))!;
  const updated: UserProfile = {
    ...profile,
    totalXp: profile.totalXp + c.xp,
    studyDays: profile.studyDays.includes(date) ? profile.studyDays : [...profile.studyDays, date],
    totalStudySeconds: profile.totalStudySeconds + seconds,
    lastLessonId: c.lessonId,
  };
  await profileStore.put(updated);

  const newAchievements = await checkAchievements(tx, updated, countUnits);
  await tx.done;
  return { profile: updated, newAchievements, isRepeat: !!prev };
}

// ---------------------------------------------------------------------------
// Sessão de revisão
// ---------------------------------------------------------------------------
export interface ReviewAnswer {
  itemId: string;
  verdict: Verdict;
  answer: string;
  exerciseType: ExerciseAttempt['exerciseType'];
}

export async function recordReviewSession(answers: ReviewAnswer[], xp: number, startedAt: number, endedAt: number, countUnits: UnitCounter = () => 0): Promise<CompletionOutcome> {
  const db = await getDB();
  const tx = db.transaction(['profile', 'attempts', 'reviews', 'dailyStats', 'achievements', 'sessions', 'lessonProgress'], 'readwrite');
  const date = localDate(new Date(endedAt));
  const iso = new Date(endedAt).toISOString();
  const reviews = tx.objectStore('reviews');
  // Um item pode aparecer mais de uma vez na sessão: só a primeira resposta conta para o calendário.
  const seen = new Set<string>();
  for (const a of answers) {
    await tx.objectStore('attempts').add({ lessonId: null, exerciseId: `review:${a.itemId}`, exerciseType: a.exerciseType, correct: a.verdict !== 'incorrect', answer: a.answer.slice(0, 300), at: iso, date });
    if (seen.has(a.itemId)) continue;
    seen.add(a.itemId);
    const s = await reviews.get(a.itemId);
    if (s) await reviews.put(applyReview(s, a.verdict, endedAt));
  }
  const correct = answers.filter((a) => a.verdict !== 'incorrect').length;
  const seconds = Math.max(0, Math.round((endedAt - startedAt) / 1000));
  const ds = tx.objectStore('dailyStats');
  await ds.put(upsertDaily(await ds.get(date), date, { xp, answers: answers.length, correctAnswers: correct, seconds }));
  await tx.objectStore('sessions').add({ kind: 'review', startedAt: new Date(startedAt).toISOString(), endedAt: iso, xp, accuracy: answers.length ? correct / answers.length : 1 });
  const ps = tx.objectStore('profile');
  const profile = (await ps.get(LOCAL_USER_ID))!;
  const updated: UserProfile = {
    ...profile,
    totalXp: profile.totalXp + xp,
    studyDays: profile.studyDays.includes(date) ? profile.studyDays : [...profile.studyDays, date],
    totalStudySeconds: profile.totalStudySeconds + seconds,
  };
  await ps.put(updated);
  const newAchievements = await checkAchievements(tx, updated, countUnits);
  await tx.done;
  return { profile: updated, newAchievements, isRepeat: false };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- as transações têm listas de stores diferentes
type AnyTx = { objectStore(name: 'achievements' | 'lessonProgress' | 'reviews' | 'sessions'): any };

async function checkAchievements(tx: AnyTx, profile: UserProfile, countUnits: UnitCounter): Promise<AchievementDef[]> {
  const achStore = tx.objectStore('achievements');
  const already = new Set<string>((await achStore.getAllKeys()) as string[]);
  const progress = (await tx.objectStore('lessonProgress').getAll()) as LessonProgress[];
  const reviews = (await tx.objectStore('reviews').getAll()) as ReviewSchedule[];
  const sessions = (await tx.objectStore('sessions').getAll()) as StudySession[];
  const ctx = {
    profile,
    lessonsCompleted: progress.length,
    unitsCompleted: countUnits(new Set(progress.map((p) => p.lessonId))),
    wordsLearned: reviews.length,
    wordsMastered: reviews.filter(isMastered).length,
    perfectLessons: progress.filter((p) => p.bestAccuracy === 1).length,
    reviewSessions: sessions.filter((s) => s.kind === 'review').length,
  };
  const fresh = newlyUnlocked(ctx, already);
  const iso = new Date().toISOString();
  for (const a of fresh) await achStore.put({ id: a.id, unlockedAt: iso });
  return fresh;
}

export { ACHIEVEMENTS };

// ---------------------------------------------------------------------------
// Privacidade: exportar e apagar
// ---------------------------------------------------------------------------
export interface ExportFile {
  app: 'dutchpath';
  dbVersion: number;
  exportedAt: string;
  data: Record<string, unknown[]>;
}

export async function exportAllData(): Promise<ExportFile> {
  const db = await getDB();
  const data: Record<string, unknown[]> = {};
  for (const s of ALL_STORES) data[s] = await db.getAll(s);
  return { app: 'dutchpath', dbVersion: DB_VERSION, exportedAt: new Date().toISOString(), data };
}

/** Restaura uma cópia de segurança (substitui todos os dados locais). */
export async function importAllData(file: unknown): Promise<void> {
  const f = file as Partial<ExportFile>;
  if (f?.app !== 'dutchpath' || typeof f.data !== 'object' || !f.data) throw new Error('Ficheiro de cópia de segurança inválido.');
  if ((f.dbVersion ?? 0) > DB_VERSION) throw new Error('Esta cópia foi criada por uma versão mais recente da aplicação.');
  const db = await getDB();
  const tx = db.transaction([...ALL_STORES], 'readwrite');
  for (const s of ALL_STORES) {
    await tx.objectStore(s).clear();
    for (const row of (f.data[s] ?? []) as never[]) await tx.objectStore(s).put(row);
  }
  await tx.done;
}

/** Apaga TODOS os dados pessoais deste navegador. */
export async function deleteAllData(): Promise<void> {
  await closeDB();
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
