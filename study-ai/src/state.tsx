import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { api, setUnauthorizedHandler } from './api';
import type { UsageSnapshot } from '../shared/plans';
import type { MeResponse } from '../shared/types';

// ---------- Cache simples de pedidos (partilhada entre páginas) ----------

interface Entry {
  data?: unknown;
  error?: Error;
  promise?: Promise<unknown>;
  stale: boolean;
}
const cache = new Map<string, Entry>();
const listeners = new Set<() => void>();
let version = 0;
const notify = () => {
  version++;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Marca como desatualizados todos os pedidos cujo nome começa por um dos prefixos. */
export function invalidate(...prefixes: string[]) {
  for (const key of cache.keys())
    if (prefixes.some((p) => key === p || key.startsWith(`${p}/`) || key.startsWith(`${p}?`))) cache.get(key)!.stale = true;
  notify();
}

export function setCached<T>(key: string, data: T) {
  cache.set(key, { data, stale: false });
  notify();
}

/** Atualiza já os dados em cache (se existirem), sem esperar por um novo pedido. */
export function updateCached<T>(key: string, fn: (data: T) => T) {
  const e = cache.get(key);
  if (e?.data !== undefined) {
    cache.set(key, { data: fn(e.data as T), stale: false });
    notify();
  }
}

export function clearCache() {
  cache.clear();
  notify();
}

/** Carrega `path` da API (GET) e guarda em cache. Volta a carregar quando é invalidado. */
export function useQuery<T>(path: string | null): {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
  reload: () => void;
} {
  useSyncExternalStore(subscribe, () => version);
  const entry = path ? cache.get(path) : undefined;
  useEffect(() => {
    if (!path) return;
    const e = cache.get(path);
    if (e && !e.stale) return;
    if (e?.promise) return;
    const promise = api<T>(path)
      .then((data) => cache.set(path, { data, stale: false }))
      .catch((error: Error) => cache.set(path, { data: e?.data, error, stale: false }))
      .finally(notify);
    cache.set(path, { ...(e ?? {}), stale: e?.stale ?? false, promise });
  });
  return {
    data: entry?.data as T | undefined,
    error: entry?.error,
    loading: !!path && (!entry || (entry.data === undefined && !entry.error)),
    reload: useCallback(() => path && invalidate(path), [path]),
  };
}

// ---------- Estado global: sessão, perfil, notificações ----------

interface Toast {
  id: number;
  text: string;
  kind: 'ok' | 'error';
}

interface AppState {
  me: MeResponse | null;
  ready: boolean;
  setMe: (me: MeResponse | null) => void;
  refreshMe: () => Promise<void>;
  setUsage: (usage: UsageSnapshot) => void;
  logout: () => Promise<void>;
  toast: (text: string, kind?: Toast['kind']) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [me, setMeState] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((text: string, kind: Toast['kind'] = 'ok') => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const setMe = useCallback((next: MeResponse | null) => {
    setMeState(next);
    if (!next) clearCache();
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      setMeState(await api<MeResponse>('/me'));
    } catch {
      setMeState(null);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setMe(null));
    refreshMe().finally(() => setReady(true));
  }, [refreshMe, setMe]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(!!me?.profile.settings.reduceMotion);
  }, [me?.profile.settings.reduceMotion]);

  const value = useMemo<AppState>(
    () => ({
      me,
      ready,
      setMe,
      refreshMe,
      setUsage: (usage) => setMeState((m) => (m ? { ...m, usage } : m)),
      logout: async () => {
        await api('/auth/logout', { method: 'POST' }).catch(() => {});
        setMe(null);
      },
      toast,
    }),
    [me, ready, setMe, refreshMe, toast],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toaster" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind === 'error' ? 'error' : ''}`}>
            {t.kind === 'error' ? <CircleAlert /> : <CircleCheck />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp fora do AppProvider');
  return ctx;
}

/** Utilizador com sessão iniciada (só usar dentro das páginas protegidas). */
export function useMe(): MeResponse {
  const { me } = useApp();
  if (!me) throw new Error('Sem sessão');
  return me;
}
