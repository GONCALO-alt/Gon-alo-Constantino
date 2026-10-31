/**
 * Uso sem internet e instalação no ecrã inicial (PWA).
 * O service worker (dist/sw.js, gerado por tools/build-sw.ts) guarda a app e todas as lições.
 * Só funciona num endereço https (ex.: Netlify); não funciona no ficheiro único nem dentro de molduras.
 */

export type OfflineState =
  | { kind: 'unsupported'; reason: 'browser' | 'file' | 'frame' | 'dev' }
  | { kind: 'saving'; done: number; total: number }
  | { kind: 'ready' }
  | { kind: 'error' };

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let state: OfflineState = { kind: 'saving', done: 0, total: 0 };
let installEvent: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getOfflineState(): OfflineState {
  return state;
}
export function canPromptInstall(): boolean {
  return !!installEvent;
}
export function subscribeOffline(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** A app está aberta como aplicação instalada (ecrã inicial)? */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Abre o pedido de instalação do navegador (Chrome/Edge no Android e no computador). */
export async function promptInstall(): Promise<boolean> {
  const e = installEvent;
  if (!e) return false;
  installEvent = null;
  emit();
  await e.prompt();
  return (await e.userChoice).outcome === 'accepted';
}

function unsupportedReason(): OfflineState | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return { kind: 'unsupported', reason: 'browser' };
  if (location.protocol === 'file:' || (window as unknown as { __DUTCHPATH_CONTENT__?: unknown }).__DUTCHPATH_CONTENT__) return { kind: 'unsupported', reason: 'file' };
  let framed = false;
  try { framed = window.top !== window.self; } catch { framed = true; }
  if (framed) return { kind: 'unsupported', reason: 'frame' };
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return { kind: 'unsupported', reason: 'browser' };
  return null;
}

/** Chamado uma vez no arranque. */
export function startOffline(isProduction: boolean): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvent = e as InstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => { installEvent = null; emit(); });

  const blocked = unsupportedReason() ?? (isProduction ? null : { kind: 'unsupported', reason: 'dev' } as const);
  if (blocked) { state = blocked; emit(); return; }

  const sw = navigator.serviceWorker;
  sw.addEventListener('message', (e: MessageEvent) => {
    const d = e.data as { type?: string; state?: string; done?: number; total?: number } | null;
    if (d?.type !== 'dutchpath-offline') return;
    if (d.state === 'ready') state = { kind: 'ready' };
    else if (d.state === 'saving' && state.kind !== 'ready') state = { kind: 'saving', done: d.done ?? 0, total: d.total ?? 0 };
    emit();
  });
  sw.register('./sw.js').then(
    () => sw.ready.then((reg) => reg.active?.postMessage({ type: 'dutchpath-status' })),
    () => { state = { kind: 'error' }; emit(); },
  );
}
