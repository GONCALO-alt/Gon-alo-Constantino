// Cálculo das propriedades animadas de um clip ao longo do tempo (keyframes,
// animações de entrada/saída, efeitos de movimento e transições), como expressões
// partilhadas pela pré-visualização e pela exportação.
import type { AnimProp, Clip, Ease, Keyframe, Project } from './types';
import {
  Expr, T, add, sub, mul, div, max, sin, floor, iflt, clamp01, evalExpr,
} from './expr';
import { effectiveTransitionIn, fadeOutTail, transitionTail } from './timeline';

export function easeExpr(p: Expr, ease: Ease): Expr {
  switch (ease) {
    case 'linear': return p;
    case 'hold': return 0;
    case 'easeIn': return mul(p, mul(p, p));
    case 'easeOut': { const q = sub(1, p); return sub(1, mul(q, mul(q, q))); }
    case 'easeInOut': {
      const q = add(mul(-2, p), 2);
      return iflt(p, 0.5, mul(4, mul(p, mul(p, p))), sub(1, div(mul(q, mul(q, q)), 2)));
    }
  }
}

export function keyframeExpr(kfs: Keyframe[] | undefined, fallback: number): Expr {
  if (!kfs || kfs.length === 0) return fallback;
  const k = [...kfs].sort((a, b) => a.t - b.t);
  if (k.length === 1) return k[0].v;
  let e: Expr = k[k.length - 1].v;
  for (let i = k.length - 2; i >= 0; i--) {
    const a = k[i], b = k[i + 1];
    const span = Math.max(1e-4, b.t - a.t);
    const p = clamp01(div(sub(T, a.t), span));
    const seg = add(a.v, mul(b.v - a.v, easeExpr(p, a.ease)));
    e = iflt(T, b.t, seg, e);
  }
  return e;
}

export function valueAt(kfs: Keyframe[] | undefined, fallback: number, t: number) {
  return evalExpr(keyframeExpr(kfs, fallback), t);
}

export interface AnimExprs {
  x: Expr; y: Expr; scale: Expr; rotation: Expr; opacity: Expr;
  blurStatic: number; // efeito "Desfocar" (intensidade 0..100), aplicado sempre
  blur: Expr; // desfoque animado extra (transições/animações), 0..100
  glitch: Expr; // intensidade 0..100 (efeito + transição)
  black: Expr; // 0..1 (mistura para preto — transição fade)
}

const easeOutP = (p: Expr) => easeExpr(p, 'easeOut');
const backOut = (p: Expr) => {
  const c1 = 1.70158, c3 = c1 + 1;
  const q = sub(p, 1);
  return add(1, add(mul(c3, mul(q, mul(q, q))), mul(c1, mul(q, q))));
};
const frac = (e: Expr) => sub(e, floor(e));
/** Ruído pseudo-aleatório determinístico com `rate` mudanças por segundo (0..1). */
export const flicker = (rate: number) => frac(mul(sin(mul(floor(mul(T, rate)), 12.9898)), 43758.5453));

/**
 * Expressões das propriedades visuais de um clip em função do tempo local T
 * (0 = início do clip na timeline). `visDur` inclui o prolongamento para transições.
 */
export function clipAnimation(project: Project, c: Clip): AnimExprs {
  const tail = transitionTail(project, c);
  const visDur = c.duration + tail;
  let x: Expr = keyframeExpr(c.keyframes.x, c.transform.x);
  let y: Expr = keyframeExpr(c.keyframes.y, c.transform.y);
  let scale: Expr = keyframeExpr(c.keyframes.scale, c.transform.scale);
  let rotation: Expr = keyframeExpr(c.keyframes.rotation, c.transform.rotation);
  let opacity: Expr = keyframeExpr(c.keyframes.opacity, c.transform.opacity);
  const staticBlur = c.effects.filter((e) => e.type === 'blur').reduce((s, e) => s + e.intensity, 0);
  const staticGlitch = c.effects.filter((e) => e.type === 'glitch').reduce((s, e) => s + e.intensity, 0);
  let blur: Expr = 0;
  let glitch: Expr = staticGlitch > 0 ? mul(staticGlitch, add(0.35, mul(0.65, flicker(12)))) : 0;
  let black: Expr = 0;

  // Efeitos de movimento contínuos
  const k = c.motion.intensity / 100;
  if (k > 0) {
    const tau = 2 * Math.PI;
    switch (c.motion.type) {
      case 'shake':
        x = add(x, add(mul(0.012 * k, sin(mul(T, 37))), mul(0.006 * k, sin(mul(T, 91)))));
        y = add(y, add(mul(0.012 * k, sin(mul(T, 29))), mul(0.006 * k, sin(mul(T, 73)))));
        rotation = add(rotation, mul(1.2 * k, sin(mul(T, 23))));
        break;
      case 'kenBurnsIn':
        scale = mul(scale, add(1, mul(0.25 * k, div(T, Math.max(0.1, c.duration)))));
        break;
      case 'kenBurnsOut':
        scale = mul(scale, add(1, mul(0.25 * k, sub(1, div(T, Math.max(0.1, c.duration))))));
        break;
      case 'pulse':
        scale = mul(scale, add(1, mul(0.06 * k, add(0.5, mul(0.5, sin(mul(T, tau * 1.2)))))));
        break;
      case 'float':
        y = add(y, mul(0.025 * k, sin(mul(T, tau * 0.4))));
        break;
      case 'sway':
        rotation = add(rotation, mul(5 * k, sin(mul(T, tau * 0.3))));
        break;
    }
  }

  // Animações de entrada / saída
  const applyAnim = (type: string, q: Expr, p: Expr) => {
    switch (type) {
      case 'fade': opacity = mul(opacity, q); break;
      case 'slideUp': y = add(y, mul(sub(1, q), 0.15)); opacity = mul(opacity, q); break;
      case 'slideDown': y = sub(y, mul(sub(1, q), 0.15)); opacity = mul(opacity, q); break;
      case 'slideLeft': x = add(x, mul(sub(1, q), 0.2)); opacity = mul(opacity, q); break;
      case 'slideRight': x = sub(x, mul(sub(1, q), 0.2)); opacity = mul(opacity, q); break;
      case 'zoomIn': scale = mul(scale, add(0.4, mul(0.6, q))); opacity = mul(opacity, q); break;
      case 'zoomOut': scale = mul(scale, sub(1.6, mul(0.6, q))); opacity = mul(opacity, q); break;
      case 'pop': scale = mul(scale, max(0.02, backOut(p))); opacity = mul(opacity, clamp01(mul(p, 4))); break;
      case 'blur': blur = add(blur, mul(sub(1, q), 80)); opacity = mul(opacity, q); break;
      case 'spin': rotation = add(rotation, mul(sub(1, q), -180)); scale = mul(scale, max(0.02, q)); break;
    }
  };
  if (c.animIn.type !== 'none' && c.animIn.duration > 0) {
    const p = clamp01(div(T, c.animIn.duration));
    applyAnim(c.animIn.type, easeOutP(p), p);
  }
  if (c.animOut.type !== 'none' && c.animOut.duration > 0) {
    const p = clamp01(div(sub(visDur, T), c.animOut.duration));
    applyAnim(c.animOut.type, easeOutP(p), p);
  }

  // Transição de entrada (este clip é o "B")
  const td = effectiveTransitionIn(project, c);
  if (c.transitionIn && td > 0) {
    const p = clamp01(div(T, td));
    const q = easeExpr(p, 'easeInOut');
    switch (c.transitionIn.type) {
      case 'fade': black = max(black, sub(1, clamp01(div(T, td / 2)))); break;
      case 'dissolve': opacity = mul(opacity, q); break;
      case 'zoomIn': scale = mul(scale, add(0.6, mul(0.4, q))); opacity = mul(opacity, q); break;
      case 'zoomOut': scale = mul(scale, sub(1.4, mul(0.4, q))); opacity = mul(opacity, q); break;
      case 'slideLeft': x = add(x, sub(1, q)); break;
      case 'slideRight': x = sub(x, sub(1, q)); break;
      case 'slideUp': y = add(y, sub(1, q)); break;
      case 'slideDown': y = sub(y, sub(1, q)); break;
      case 'blur': blur = add(blur, mul(sub(1, q), 100)); opacity = mul(opacity, q); break;
      case 'glitch':
        glitch = add(glitch, mul(mul(sub(1, p), 100), add(0.4, mul(0.6, flicker(20)))));
        opacity = mul(opacity, clamp01(mul(p, 3)));
        break;
    }
  }
  // Fim do clip com "fade" para o clip seguinte
  const fo = fadeOutTail(project, c);
  if (fo > 0) {
    const half = fo / 2;
    black = max(black, clamp01(div(sub(T, c.duration - half), half)));
  }

  return { x, y, scale: max(scale, 0.001), rotation, opacity: clamp01(opacity), blurStatic: staticBlur, blur: max(blur, 0), glitch: max(glitch, 0), black: clamp01(black) };
}

/** Volume (0..2) de um clip no tempo local T, com fades. */
export function volumeExpr(c: Clip): Expr {
  let v: Expr = keyframeExpr(c.keyframes.volume, c.volume);
  if (c.fadeIn > 0) v = mul(v, clamp01(div(T, c.fadeIn)));
  if (c.fadeOut > 0) v = mul(v, clamp01(div(sub(c.duration, T), c.fadeOut)));
  return max(v, 0);
}

export const ANIMATABLE: AnimProp[] = ['x', 'y', 'scale', 'rotation', 'opacity', 'volume'];

export function propValue(c: Clip, prop: AnimProp): number {
  if (prop === 'volume') return c.volume;
  return c.transform[prop];
}
