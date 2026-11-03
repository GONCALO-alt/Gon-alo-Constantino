/**
 * Decoração das épocas festivas (Natal, Halloween, Carnaval, Páscoa).
 * A época vem de engine/season.ts e pode ser desligada nas Definições.
 */
import { createContext, useContext, type CSSProperties } from 'react';
import type { Season } from '../../engine/season.ts';

export const SeasonContext = createContext<Season | null>(null);
export const useSeason = () => useContext(SeasonContext);

const EGG_COLORS = [['#f7a8c8', '#fff3a8'], ['#a8d8f7', '#ffffff'], ['#c8f7a8', '#f7c8f0'], ['#ffd59e', '#a8c8f7'], ['#d9b8ff', '#fff3a8']];

/** Ovo da Páscoa pintado (desenho próprio). */
export function EasterEgg({ variant = 0, size = 34 }: { variant?: number; size?: number }) {
  const [base, stripe] = EGG_COLORS[variant % EGG_COLORS.length]!;
  const id = `egg-${variant}`;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" aria-hidden="true" className="egg">
      <clipPath id={id}><path d="M20 2C9 2 3 20 3 31c0 10 8 17 17 17s17-7 17-17C37 20 31 2 20 2Z" /></clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="40" height="50" fill={base} />
        <path d="M0 22 l5 -4 5 4 5 -4 5 4 5 -4 5 4 5 -4 5 4 v5 l-5 -4 -5 4 -5 -4 -5 4 -5 -4 -5 4 -5 -4 -5 4Z" fill={stripe} />
        <rect y="34" width="40" height="4" fill={stripe} />
        <circle cx="12" cy="12" r="2" fill={stripe} /><circle cx="27" cy="10" r="2" fill={stripe} /><circle cx="20" cy="43" r="2" fill="#fff" opacity="0.7" />
      </g>
      <path d="M20 2C9 2 3 20 3 31c0 10 8 17 17 17s17-7 17-17C37 20 31 2 20 2Z" fill="none" stroke="rgb(0 0 0 / 12%)" />
    </svg>
  );
}

/** Enfeite ao lado do caminho de lições. */
export function SeasonDeco({ season, index }: { season: Season; index: number }) {
  if (season === 'easter') return <EasterEgg variant={index} />;
  const set: Record<Exclude<Season, 'easter'>, string[]> = {
    christmas: ['🎄', '🎁', '⛄', '🔔', '⭐'],
    halloween: ['🎃', '🦇', '👻', '🕸️', '🍬'],
    carnival: ['🎭', '🎉', '🎊', '🎺', '🥳'],
  };
  return <span className="season-emoji">{set[season][index % 5]}</span>;
}

/** Efeito de fundo: neve no Natal, papelinhos no Carnaval. */
export function SeasonFx({ season }: { season: Season }) {
  if (season !== 'christmas' && season !== 'carnival') return null;
  const n = season === 'christmas' ? 26 : 20;
  return (
    <div className={`season-fx fx-${season}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const r = (k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
        return <span key={i} style={{ '--fx': `${r(1) * 100}%`, '--fd': `${(r(2) * 8).toFixed(1)}s`, '--ft': `${(7 + r(3) * 7).toFixed(1)}s`, '--fs': `${(4 + r(4) * 6).toFixed(0)}px` } as CSSProperties} />;
      })}
    </div>
  );
}
