/**
 * Router mínimo baseado no hash (#/curso/s1). Funciona em alojamento estático
 * sem configuração do servidor e não precisa de dependências.
 */
import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'course'; sectionId?: string }
  | { name: 'lesson'; lessonId: string }
  | { name: 'review' }
  | { name: 'reviewSession'; mode: 'vocab' | 'hard' | 'grammar' }
  | { name: 'profile' }
  | { name: 'stats' }
  | { name: 'settings' }
  | { name: 'notFound'; path: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  switch (parts[0]) {
    case undefined: return { name: 'home' };
    case 'curso': return parts[1] ? { name: 'course', sectionId: parts[1] } : { name: 'course' };
    case 'licao': return parts[1] ? { name: 'lesson', lessonId: parts[1] } : { name: 'notFound', path };
    case 'revisao':
      if (parts[1] === 'sessao') {
        const mode = parts[2] === 'gramatica' ? 'grammar' : parts[2] === 'dificeis' ? 'hard' : 'vocab';
        return { name: 'reviewSession', mode };
      }
      return { name: 'review' };
    case 'perfil': return { name: 'profile' };
    case 'estatisticas': return { name: 'stats' };
    case 'definicoes': return { name: 'settings' };
    default: return { name: 'notFound', path };
  }
}

export const href = {
  home: () => '#/',
  course: (sectionId?: string) => (sectionId ? `#/curso/${sectionId}` : '#/curso'),
  lesson: (id: string) => `#/licao/${id}`,
  review: () => '#/revisao',
  reviewSession: (mode: 'vocab' | 'hard' | 'grammar') => `#/revisao/sessao/${mode === 'grammar' ? 'gramatica' : mode === 'hard' ? 'dificeis' : 'vocabulario'}`,
  profile: () => '#/perfil',
  stats: () => '#/estatisticas',
  settings: () => '#/definicoes',
};

export function navigate(to: string): void {
  window.location.hash = to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo?.(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
