/**
 * Estado partilhado da aplicação: índice do curso, perfil, definições e
 * lições concluídas. `refresh()` recarrega depois de gravar progresso.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CourseIndex } from '../domain/schemas.ts';
import type { UserProfile, UserSettings } from '../domain/progress.ts';
import { openMistakes } from '../engine/mistakes.ts';
import { contentRepo } from '../data/contentRepo.ts';
import * as repo from '../data/progressRepo.ts';
import { computeUnitStates, isUnitComplete, localDate, orderedUnits, type UnitState } from '../engine/progression.ts';

export interface AppData {
  index: CourseIndex;
  profile: UserProfile;
  settings: UserSettings;
  completed: Set<string>;
  unitStates: Map<string, UnitState>;
  dueReviews: number;
  totalReviews: number;
  todayXp: number;
  /** Dicionário pessoal: IDs das palavras guardadas. */
  savedWords: Set<string>;
  /** Número de exercícios na lista «Os meus erros». */
  mistakes: number;
}

interface Ctx {
  data: AppData | null;
  error: string | null;
  refresh: () => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  countUnits: (completed: ReadonlySet<string>) => number;
  /** Guarda ou tira uma palavra do dicionário pessoal. */
  toggleSaved: (vocabId: string) => Promise<void>;
}

const AppContext = createContext<Ctx | null>(null);

async function load(): Promise<AppData> {
  const [index, profile, settings, completed, dueReviews, reviews, daily, saved, attempts] = await Promise.all([
    contentRepo.loadIndex(),
    repo.getProfile(),
    repo.getSettings(),
    repo.getCompletedLessonIds(),
    repo.countDueReviews(),
    repo.getAllReviews(),
    repo.getDailyStats(),
    repo.getSavedWords(),
    repo.getAllAttempts(),
  ]);
  const today = localDate();
  return {
    index, profile, settings, completed,
    unitStates: computeUnitStates(index, completed, settings.freeNavigation),
    dueReviews,
    totalReviews: reviews.length,
    todayXp: daily.find((d) => d.date === today)?.xp ?? 0,
    savedWords: new Set(saved.map((w) => w.vocabId)),
    mistakes: openMistakes(attempts).length,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setData(await load());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    const current = await repo.getSettings();
    await repo.saveSettings({ ...current, ...patch });
    await refresh();
  }, [refresh]);

  const countUnits = useCallback(
    (completed: ReadonlySet<string>) => (data ? orderedUnits(data.index).filter((u) => isUnitComplete(u, completed)).length : 0),
    [data],
  );

  const toggleSaved = useCallback(async (vocabId: string) => {
    if (data?.savedWords.has(vocabId)) await repo.unsaveWord(vocabId);
    else await repo.saveWord(vocabId);
    await refresh();
  }, [data, refresh]);

  const value = useMemo(() => ({ data, error, refresh, updateSettings, countUnits, toggleSaved }), [data, error, refresh, updateSettings, countUnits, toggleSaved]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Dicionário pessoal fora do ecrã principal (ex.: palavras clicáveis); null se não houver app. */
export function useSavedWords(): { saved: Set<string>; toggle: (id: string) => Promise<void> } | null {
  const c = useContext(AppContext);
  return c?.data ? { saved: c.data.savedWords, toggle: c.toggleSaved } : null;
}

export function useApp(): Ctx {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp fora do AppProvider');
  return c;
}

/** Versão que garante dados carregados (usar dentro de ecrãs). */
export function useAppData(): AppData & Omit<Ctx, 'data'> {
  const c = useApp();
  if (!c.data) throw new Error('Dados ainda não carregados');
  return { ...c.data, ...c };
}
