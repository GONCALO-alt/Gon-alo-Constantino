/**
 * Estado partilhado da aplicação: índice do curso, perfil, definições e
 * lições concluídas. `refresh()` recarrega depois de gravar progresso.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CourseIndex } from '../domain/schemas.ts';
import type { UserProfile, UserSettings } from '../domain/progress.ts';
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
}

interface Ctx {
  data: AppData | null;
  error: string | null;
  refresh: () => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  countUnits: (completed: ReadonlySet<string>) => number;
}

const AppContext = createContext<Ctx | null>(null);

async function load(): Promise<AppData> {
  const [index, profile, settings, completed, dueReviews, reviews, daily] = await Promise.all([
    contentRepo.loadIndex(),
    repo.getProfile(),
    repo.getSettings(),
    repo.getCompletedLessonIds(),
    repo.countDueReviews(),
    repo.getAllReviews(),
    repo.getDailyStats(),
  ]);
  const today = localDate();
  return {
    index, profile, settings, completed,
    unitStates: computeUnitStates(index, completed, settings.freeNavigation),
    dueReviews,
    totalReviews: reviews.length,
    todayXp: daily.find((d) => d.date === today)?.xp ?? 0,
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

  const value = useMemo(() => ({ data, error, refresh, updateSettings, countUnits }), [data, error, refresh, updateSettings, countUnits]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
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
