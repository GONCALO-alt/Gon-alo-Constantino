/**
 * Router mínimo baseado no hash (#/curso/s1). Funciona em alojamento estático
 * sem configuração do servidor e não precisa de dependências.
 */
import { useEffect, useState } from 'react';

/** Tipos de sessão de revisão: vocabulário, palavras difíceis, gramática, os meus erros, o meu dicionário. */
export type ReviewMode = 'vocab' | 'hard' | 'grammar' | 'mistakes' | 'saved';

export type Route =
  | { name: 'home' }
  | { name: 'course'; sectionId?: string }
  | { name: 'lesson'; lessonId: string }
  | { name: 'review' }
  | { name: 'reviewSession'; mode: ReviewMode }
  | { name: 'profile' }
  | { name: 'stats' }
  | { name: 'settings' }
  | { name: 'games' }
  | { name: 'search' }
  | { name: 'dictionary' }
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
        const mode: ReviewMode = parts[2] === 'gramatica' ? 'grammar' : parts[2] === 'dificeis' ? 'hard'
          : parts[2] === 'erros' ? 'mistakes' : parts[2] === 'guardadas' ? 'saved' : 'vocab';
        return { name: 'reviewSession', mode };
      }
      return { name: 'review' };
    case 'perfil': return { name: 'profile' };
    case 'estatisticas': return { name: 'stats' };
    case 'definicoes': return { name: 'settings' };
    case 'jogos': return { name: 'games' };
    case 'pesquisa': return { name: 'search' };
    case 'dicionario': return { name: 'dictionary' };
    default: return { name: 'notFound', path };
  }
}

export const href = {
  home: () => '#/',
  course: (sectionId?: string) => (sectionId ? `#/curso/${sectionId}` : '#/curso'),
  lesson: (id: string) => `#/licao/${id}`,
  review: () => '#/revisao',
  reviewSession: (mode: ReviewMode) => `#/revisao/sessao/${({ grammar: 'gramatica', hard: 'dificeis', mistakes: 'erros', saved: 'guardadas', vocab: 'vocabulario' } as const)[mode]}`,
  profile: () => '#/perfil',
  stats: () => '#/estatisticas',
  settings: () => '#/definicoes',
  games: () => '#/jogos',
  search: () => '#/pesquisa',
  dictionary: () => '#/dicionario',
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
