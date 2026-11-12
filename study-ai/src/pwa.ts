// Tudo o que faz a STUDY AI comportar-se como uma aplicação de telemóvel:
// instalação no ecrã principal, service worker, vibração, teclado e altura do ecrã.
import { useEffect, useState, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isIOS(): boolean {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

export function isPhoneOrTablet(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}

export function initPwa() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    emit();
  });
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* sem service worker a aplicação funciona na mesma */
      });
    });
  }
  // Com o teclado aberto, esconde a barra de navegação de baixo (fica mais espaço para escrever).
  const isField = (el: EventTarget | null) =>
    el instanceof HTMLElement && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'range'].includes((el as HTMLInputElement).type)) || el.isContentEditable);
  document.addEventListener('focusin', (e) => {
    if (isField(e.target)) document.documentElement.dataset.kb = 'open';
  });
  document.addEventListener('focusout', () => {
    setTimeout(() => {
      if (!isField(document.activeElement)) delete document.documentElement.dataset.kb;
    }, 50);
  });
  // Altura real visível (no iPhone o teclado não muda 100vh): usada pelo chat em ecrã inteiro.
  const vv = window.visualViewport;
  const setHeight = () => document.documentElement.style.setProperty('--app-height', `${Math.round(vv?.height ?? window.innerHeight)}px`);
  setHeight();
  vv?.addEventListener('resize', setHeight);
  window.addEventListener('resize', setHeight);
  if (isStandalone()) document.documentElement.dataset.standalone = 'true';
}

/** Estado da instalação da aplicação no telemóvel/computador. */
export function useInstall() {
  const snapshot = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => `${!!deferred}|${installed}`,
  );
  void snapshot;
  return {
    /** O navegador permite instalar com um botão (Android, Chrome, Edge). */
    canPrompt: !!deferred,
    installed: installed || isStandalone(),
    ios: isIOS(),
    async prompt(): Promise<boolean> {
      if (!deferred) return false;
      await deferred.prompt();
      const choice = await deferred.userChoice;
      deferred = null;
      emit();
      return choice.outcome === 'accepted';
    },
  };
}

/** Vibração curta (só em telemóveis que a suportam). */
export function haptic(pattern: number | number[] = 12) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignorar */
  }
}

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}
