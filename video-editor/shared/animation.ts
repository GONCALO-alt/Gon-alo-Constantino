// Cálculo das propriedades animadas de um clip ao longo do tempo (keyframes,
// animações de entrada/saída, efeitos de movimento e transições), como expressões
// partilhadas pela pré-visualização e pela exportação.
import type { AnimProp, Clip, Ease, Keyframe, Project } from './types';
import {
  Expr, T, add, sub, mul, div, max, sin, floor, iflt, clamp01, evalExpr, pow,
} from './expr';
import { effectiveTransitionIn, fadeOutTail, nextAdjacent, transitionTail } from './timeline';

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

export interface Wipe { p: Expr; dir: 0 | 1 | 2 | 3 } // 0: revela da esquerda, 1: da direita, 2: de cima, 3: de baixo

export interface AnimExprs {
  x: Expr; y: Expr; scale: Expr; rotation: Expr; opacity: Expr;
  sx: Expr; sy: Expr; // escala horizontal / vertical extra (virar, esticar, gelatina)
  blurStatic: number; // efeito "Desfocar" (intensidade 0..100), aplicado sempre
  blur: Expr; // desfoque animado extra (transições/animações), 0..100
  glitch: Expr; // intensidade 0..100 (efeito + transição)
  black: Expr; // 0..1 (mistura para preto — transição fade)
  white: Expr; // 0..1 (mistura para branco — flash)
  wipes: Wipe[]; // máscaras de revelação
}

const easeOutP = (p: Expr) => easeExpr(p, 'easeOut');
const backOut = (p: Expr) => {
  const c1 = 1.70158, c3 = c1 + 1;
  const q = sub(p, 1);
  return add(1, add(mul(c3, mul(q, mul(q, q))), mul(c1, mul(q, q))));
};
const bounceOut = (p: Expr): Expr => {
  const n1 = 7.5625, d1 = 2.75;
  const sq = (o: number, c: number) => add(mul(n1, mul(sub(p, o), sub(p, o))), c);
  return iflt(p, 1 / d1, mul(n1, mul(p, p)), iflt(p, 2 / d1, sq(1.5 / d1, 0.75), iflt(p, 2.5 / d1, sq(2.25 / d1, 0.9375), sq(2.625 / d1, 0.984375))));
};
const elasticOut = (p: Expr): Expr =>
  iflt(p, 0.999, add(1, mul(pow(2, mul(-10, p)), sin(mul(sub(mul(p, 10), 0.75), (2 * Math.PI) / 3)))), 1);
const frac = (e: Expr) => sub(e, floor(e));
const absE = (e: Expr): Expr => (typeof e === 'number' ? Math.abs(e) : { op: 'abs', a: e });
/** Ruído pseudo-aleatório determinístico com `rate` mudanças por segundo (0..1). */
export const flicker = (rate: number) => frac(mul(sin(mul(floor(mul(T, rate)), 12.9898)), 43758.5453));

const WIPE_DIR: Record<string, Wipe['dir']> = { wipeRight: 0, wipeLeft: 1, wipeDown: 2, wipeUp: 3 };

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
  let sx: Expr = 1, sy: Expr = 1;
  const fxSum = (t: string) => c.effects.filter((e) => e.type === t).reduce((s, e) => s + e.intensity, 0);
  const staticBlur = fxSum('blur');
  const staticGlitch = fxSum('glitch');
  let blur: Expr = 0;
  let glitch: Expr = staticGlitch > 0 ? mul(staticGlitch, add(0.35, mul(0.65, flicker(12)))) : 0;
  let black: Expr = 0;
  let white: Expr = 0;
  const wipes: Wipe[] = [];
  const tau = 2 * Math.PI;

  // Efeitos animados por natureza
  const flash = fxSum('flash') / 100, strobe = fxSum('strobe') / 100;
  if (flash > 0) white = add(white, mul(flash, max(0, sub(1, mul(frac(mul(T, 1.2)), 5)))));
  if (strobe > 0) white = add(white, mul(0.8 * strobe, iflt(frac(mul(T, 6)), 0.5, 1, 0)));

  // Efeitos de movimento contínuos (loop)
  const k = c.motion.intensity / 100;
  if (k > 0) {
    switch (c.motion.type) {
      case 'shake':
        x = add(x, add(mul(0.012 * k, sin(mul(T, 37))), mul(0.006 * k, sin(mul(T, 91)))));
        y = add(y, add(mul(0.012 * k, sin(mul(T, 29))), mul(0.006 * k, sin(mul(T, 73)))));
        rotation = add(rotation, mul(1.2 * k, sin(mul(T, 23))));
        break;
      case 'kenBurnsIn': scale = mul(scale, add(1, mul(0.25 * k, div(T, Math.max(0.1, c.duration))))); break;
      case 'kenBurnsOut': scale = mul(scale, add(1, mul(0.25 * k, sub(1, div(T, Math.max(0.1, c.duration)))))); break;
      case 'pulse': scale = mul(scale, add(1, mul(0.06 * k, add(0.5, mul(0.5, sin(mul(T, tau * 1.2))))))); break;
      case 'float': y = add(y, mul(0.025 * k, sin(mul(T, tau * 0.4)))); break;
      case 'sway': rotation = add(rotation, mul(5 * k, sin(mul(T, tau * 0.3)))); break;
      case 'heartbeat': scale = mul(scale, add(1, mul(0.1 * k, pow(max(0, sin(mul(T, tau * 1.2))), 6)))); break;
      case 'wiggle':
        rotation = add(rotation, mul(6 * k, sin(mul(T, tau * 2.2))));
        x = add(x, mul(0.01 * k, sin(mul(T, tau * 1.1))));
        break;
      case 'spinLoop': rotation = add(rotation, mul(120 * k, T)); break;
      case 'breathe':
        scale = mul(scale, add(1, mul(0.05 * k, sin(mul(T, tau * 0.25)))));
        opacity = mul(opacity, sub(1, mul(0.15 * k, add(0.5, mul(0.5, sin(mul(T, tau * 0.25)))))));
        break;
      case 'jelly':
        sx = mul(sx, add(1, mul(0.08 * k, sin(mul(T, tau * 2)))));
        sy = mul(sy, sub(1, mul(0.08 * k, sin(mul(T, tau * 2)))));
        break;
      case 'flicker': opacity = mul(opacity, iflt(flicker(10), 0.7, 1, 1 - 0.6 * k)); break;
      case 'bounceLoop': y = sub(y, mul(0.04 * k, absE(sin(mul(T, tau * 0.9))))); break;
      case 'rock':
        rotation = add(rotation, mul(8 * k, sin(mul(T, tau * 0.6))));
        x = add(x, mul(0.015 * k, sin(mul(T, tau * 0.6))));
        break;
      case 'glitchLoop': glitch = add(glitch, mul(60 * k, iflt(flicker(6), 0.7, 0, add(0.5, mul(0.5, flicker(25)))))); break;
      case 'zoomPulse': scale = mul(scale, add(1, mul(0.12 * k, pow(max(0, sin(mul(T, tau))), 4)))); break;
    }
  }

  // Animações de entrada / saída (p vai de 0 a 1 ao longo da animação; na saída é invertido)
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
      case 'rotateIn': rotation = add(rotation, mul(sub(1, q), -90)); scale = mul(scale, add(0.8, mul(0.2, q))); opacity = mul(opacity, q); break;
      case 'swing': rotation = add(rotation, mul(mul(30, sub(1, p)), sin(mul(p, tau * 1.5)))); opacity = mul(opacity, clamp01(mul(p, 4))); break;
      case 'bounce': y = sub(y, mul(sub(1, bounceOut(p)), 0.3)); opacity = mul(opacity, clamp01(mul(p, 5))); break;
      case 'flipX': sx = mul(sx, max(0.002, q)); break;
      case 'flipY': sy = mul(sy, max(0.002, q)); break;
      case 'stretch': sx = mul(sx, add(1, mul(0.8, sub(1, q)))); sy = mul(sy, sub(1, mul(0.6, sub(1, q)))); opacity = mul(opacity, q); break;
      case 'squeeze': sx = mul(sx, sub(1, mul(0.7, sub(1, q)))); sy = mul(sy, add(1, mul(0.5, sub(1, q)))); opacity = mul(opacity, q); break;
      case 'wipeRight': case 'wipeLeft': case 'wipeUp': case 'wipeDown': wipes.push({ p: q, dir: WIPE_DIR[type] }); break;
      case 'shake': x = add(x, mul(mul(0.03, sub(1, p)), sin(mul(T, 60)))); opacity = mul(opacity, clamp01(mul(p, 4))); break;
      case 'flash': white = max(white, sub(1, q)); break;
      case 'zoomBlur': scale = mul(scale, sub(1.5, mul(0.5, q))); blur = add(blur, mul(sub(1, q), 80)); opacity = mul(opacity, q); break;
      case 'riseUp': y = add(y, mul(sub(1, q), 0.35)); opacity = mul(opacity, q); break;
      case 'elastic': scale = mul(scale, max(0.02, elasticOut(p))); opacity = mul(opacity, clamp01(mul(p, 6))); break;
      case 'glitchIn': glitch = add(glitch, mul(mul(sub(1, p), 100), add(0.4, mul(0.6, flicker(20))))); opacity = mul(opacity, clamp01(mul(p, 3))); break;
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
    const type = c.transitionIn.type;
    switch (type) {
      case 'fade': black = max(black, sub(1, clamp01(div(T, td / 2)))); break;
      case 'whiteFlash': white = max(white, sub(1, clamp01(div(T, td / 2)))); break;
      case 'dissolve': opacity = mul(opacity, q); break;
      case 'zoomIn': scale = mul(scale, add(0.6, mul(0.4, q))); opacity = mul(opacity, q); break;
      case 'zoomOut': scale = mul(scale, sub(1.4, mul(0.4, q))); opacity = mul(opacity, q); break;
      case 'slideLeft': case 'pushLeft': x = add(x, sub(1, q)); break;
      case 'slideRight': case 'pushRight': x = sub(x, sub(1, q)); break;
      case 'slideUp': y = add(y, sub(1, q)); break;
      case 'slideDown': y = sub(y, sub(1, q)); break;
      case 'blur': blur = add(blur, mul(sub(1, q), 100)); opacity = mul(opacity, q); break;
      case 'glitch':
        glitch = add(glitch, mul(mul(sub(1, p), 100), add(0.4, mul(0.6, flicker(20)))));
        opacity = mul(opacity, clamp01(mul(p, 3)));
        break;
      case 'wipeLeft': case 'wipeRight': case 'wipeUp': case 'wipeDown': wipes.push({ p: q, dir: WIPE_DIR[type] }); break;
      case 'spin': rotation = add(rotation, mul(sub(1, q), 180)); scale = mul(scale, add(0.3, mul(0.7, q))); opacity = mul(opacity, q); break;
      case 'shake': x = add(x, mul(mul(0.04, sub(1, p)), sin(mul(T, 70)))); opacity = mul(opacity, q); break;
      case 'zoomBlur': scale = mul(scale, sub(1.3, mul(0.3, q))); blur = add(blur, mul(sub(1, q), 100)); opacity = mul(opacity, q); break;
    }
  }
  // Fim do clip: fade/flash para o clip seguinte, ou empurrado por ele
  const n = nextAdjacent(project, c);
  if (n?.transitionIn && c.type !== 'audio') {
    const nt = n.transitionIn.type;
    if (nt === 'fade' || nt === 'whiteFlash') {
      const half = fadeOutTail(project, c) / 2;
      if (half > 0) {
        const ramp = clamp01(div(sub(T, c.duration - half), half));
        if (nt === 'fade') black = max(black, ramp); else white = max(white, ramp);
      }
    } else if ((nt === 'pushLeft' || nt === 'pushRight') && tail > 0) {
      const qa = easeExpr(clamp01(div(sub(T, c.duration), tail)), 'easeInOut');
      x = nt === 'pushLeft' ? sub(x, qa) : add(x, qa);
    }
  }

  return {
    x, y, scale: max(scale, 0.001), rotation, opacity: clamp01(opacity), sx: max(sx, 0.002), sy: max(sy, 0.002),
    blurStatic: staticBlur, blur: max(blur, 0), glitch: max(glitch, 0), black: clamp01(black), white: clamp01(white), wipes,
  };
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
