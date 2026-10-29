/**
 * Base de dados local (IndexedDB) para os dados pessoais.
 *
 * O conteúdo do curso NÃO é guardado aqui: vem dos ficheiros estáticos
 * (public/content) e é ligado ao progresso apenas por IDs estáveis.
 *
 * Migrações: cada versão nova acrescenta um passo em MIGRATIONS. Os passos
 * correm por ordem a partir da versão que o navegador tiver, sem apagar dados.
 */
import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction, type StoreNames } from 'idb';
import type {
  Achievement, DailyStat, ExerciseAttempt, LessonProgress, ReviewSchedule, StudySession, UserProfile, UserSettings,
} from '../domain/progress.ts';

export interface DutchPathDB extends DBSchema {
  profile: { key: string; value: UserProfile };
  settings: { key: string; value: UserSettings };
  lessonProgress: { key: string; value: LessonProgress; indexes: { byUnit: string } };
  attempts: { key: number; value: ExerciseAttempt; indexes: { byDate: string; byLesson: string } };
  reviews: { key: string; value: ReviewSchedule; indexes: { byDue: number } };
  dailyStats: { key: string; value: DailyStat };
  achievements: { key: string; value: Achievement };
  sessions: { key: number; value: StudySession; indexes: { byStart: string } };
  meta: { key: string; value: { key: string; value: unknown } };
}

export const DB_NAME = 'dutchpath';
export const DB_VERSION = 2;

type UpgradeTx = IDBPTransaction<DutchPathDB, StoreNames<DutchPathDB>[], 'versionchange'>;
type Migration = (db: IDBPDatabase<DutchPathDB>, tx: UpgradeTx) => void;

/** MIGRATIONS[n] leva a base de dados da versão n para a n+1. */
export const MIGRATIONS: Migration[] = [
  // 0 → 1: esquema inicial
  (db) => {
    db.createObjectStore('profile', { keyPath: 'id' });
    db.createObjectStore('settings', { keyPath: 'id' });
    const lp = db.createObjectStore('lessonProgress', { keyPath: 'lessonId' });
    lp.createIndex('byUnit', 'unitId');
    const at = db.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true });
    at.createIndex('byDate', 'date');
    at.createIndex('byLesson', 'lessonId');
    const rv = db.createObjectStore('reviews', { keyPath: 'itemId' });
    rv.createIndex('byDue', 'dueAt');
    db.createObjectStore('dailyStats', { keyPath: 'date' });
    db.createObjectStore('achievements', { keyPath: 'id' });
    db.createObjectStore('meta', { keyPath: 'key' });
  },
  // 1 → 2: histórico de sessões de estudo
  (db) => {
    const s = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
    s.createIndex('byStart', 'startedAt');
  },
];

let dbPromise: Promise<IDBPDatabase<DutchPathDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<DutchPathDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DutchPathDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        for (let v = oldVersion; v < DB_VERSION; v++) MIGRATIONS[v]!(db, tx);
      },
      blocked() {
        console.warn('Base de dados bloqueada por outro separador aberto com uma versão antiga.');
      },
    }).catch((err: unknown) => {
      dbPromise = null; // permite tentar de novo
      throw err;
    });
  }
  return dbPromise;
}

/** Fecha a ligação (usado nos testes e antes de apagar a base de dados). */
export async function closeDB(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise.catch(() => null);
    db?.close();
    dbPromise = null;
  }
}

export const ALL_STORES = ['profile', 'settings', 'lessonProgress', 'attempts', 'reviews', 'dailyStats', 'achievements', 'sessions', 'meta'] as const satisfies readonly StoreNames<DutchPathDB>[];
