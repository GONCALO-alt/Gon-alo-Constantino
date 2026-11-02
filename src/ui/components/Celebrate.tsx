/**
 * Animações de celebração, só com CSS (sem bibliotecas):
 *  - Confetti: papelinhos a cair (fim de lição);
 *  - Sparkles: pequena explosão de estrelinhas (resposta certa);
 *  - useCountUp: um número que sobe até ao valor final (XP ganho).
 * Com «Reduzir animações» ligado, o CSS desliga tudo e o número aparece logo.
 */
import { useEffect, useState, type CSSProperties } from 'react';

const COLORS = ['#f2683c', '#4bae32', '#1c9fd6', '#f0b400', '#8e5bd8', '#d9478c'];

/** Número pseudoaleatório estável (o mesmo desenho em cada renderização). */
function rand(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Confetti({ count = 36 }: { count?: number }) {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{
          '--cx': `${rand(i, 1) * 100}%`,
          '--cd': `${(rand(i, 2) * 0.6).toFixed(2)}s`,
          '--ct': `${(1.6 + rand(i, 3) * 1.2).toFixed(2)}s`,
          '--cr': `${Math.round(rand(i, 4) * 720 - 360)}deg`,
          '--cs': `${(rand(i, 5) * 60 - 30).toFixed(0)}px`,
          background: COLORS[i % COLORS.length],
        } as CSSProperties} />
      ))}
    </div>
  );
}

export function Sparkles({ count = 10 }: { count?: number }) {
  return (
    <span className="sparkles" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const d = 26 + rand(i, 7) * 18;
        return (
          <span key={i} style={{
            '--sx': `${Math.round(Math.cos(a) * d)}px`,
            '--sy': `${Math.round(Math.sin(a) * d)}px`,
            background: COLORS[i % COLORS.length],
          } as CSSProperties} />
        );
      })}
    </span>
  );
}

/** Conta de 0 até `target` em ~`ms` milissegundos. */
export function useCountUp(target: number, ms = 900): number {
  const reduce = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.motion === 'reduce');
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce || typeof requestAnimationFrame === 'undefined') { setValue(target); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduce]);
  return value;
}
