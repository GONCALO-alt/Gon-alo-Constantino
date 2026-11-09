// Pequena linguagem de expressões em função do tempo local T.
// A mesma árvore é avaliada em JavaScript (pré-visualização) e convertida
// numa expressão FFmpeg (exportação), garantindo que o resultado exportado
// é idêntico ao que se vê no editor.

export type Expr =
  | number
  | { op: 'T' }
  | { op: 'add' | 'sub' | 'mul' | 'div' | 'min' | 'max' | 'pow'; a: Expr; b: Expr }
  | { op: 'sin' | 'cos' | 'abs' | 'floor'; a: Expr }
  | { op: 'iflt'; a: Expr; b: Expr; then: Expr; else: Expr };

export const T: Expr = { op: 'T' };

const isNum = (e: Expr): e is number => typeof e === 'number';

export function add(a: Expr, b: Expr): Expr {
  if (isNum(a) && isNum(b)) return a + b;
  if (a === 0) return b;
  if (b === 0) return a;
  return { op: 'add', a, b };
}
export function sub(a: Expr, b: Expr): Expr {
  if (isNum(a) && isNum(b)) return a - b;
  if (b === 0) return a;
  return { op: 'sub', a, b };
}
export function mul(a: Expr, b: Expr): Expr {
  if (isNum(a) && isNum(b)) return a * b;
  if (a === 0 || b === 0) return 0;
  if (a === 1) return b;
  if (b === 1) return a;
  return { op: 'mul', a, b };
}
export function div(a: Expr, b: Expr): Expr {
  if (isNum(a) && isNum(b)) return b === 0 ? 0 : a / b;
  if (b === 1) return a;
  return { op: 'div', a, b };
}
export function min(a: Expr, b: Expr): Expr {
  if (isNum(a) && isNum(b)) return Math.min(a, b);
  return { op: 'min', a, b };
}
export function max(a: Expr, b: Expr): Expr {
  if (isNum(a) && isNum(b)) return Math.max(a, b);
  return { op: 'max', a, b };
}
export function pow(a: Expr, b: Expr): Expr {
  if (isNum(a) && isNum(b)) return Math.pow(a, b);
  if (b === 1) return a;
  return { op: 'pow', a, b };
}
export function sin(a: Expr): Expr { return isNum(a) ? Math.sin(a) : { op: 'sin', a }; }
export function cos(a: Expr): Expr { return isNum(a) ? Math.cos(a) : { op: 'cos', a }; }
export function floor(a: Expr): Expr { return isNum(a) ? Math.floor(a) : { op: 'floor', a }; }
/** if (a < b) then x else y */
export function iflt(a: Expr, b: Expr, then: Expr, els: Expr): Expr {
  if (isNum(a) && isNum(b)) return a < b ? then : els;
  if (isNum(then) && isNum(els) && then === els) return then;
  return { op: 'iflt', a, b, then, else: els };
}
export const clamp01 = (e: Expr): Expr => min(max(e, 0), 1);

export function evalExpr(e: Expr, t: number): number {
  if (typeof e === 'number') return e;
  switch (e.op) {
    case 'T': return t;
    case 'add': return evalExpr(e.a, t) + evalExpr(e.b, t);
    case 'sub': return evalExpr(e.a, t) - evalExpr(e.b, t);
    case 'mul': return evalExpr(e.a, t) * evalExpr(e.b, t);
    case 'div': { const d = evalExpr(e.b, t); return d === 0 ? 0 : evalExpr(e.a, t) / d; }
    case 'min': return Math.min(evalExpr(e.a, t), evalExpr(e.b, t));
    case 'max': return Math.max(evalExpr(e.a, t), evalExpr(e.b, t));
    case 'pow': return Math.pow(evalExpr(e.a, t), evalExpr(e.b, t));
    case 'sin': return Math.sin(evalExpr(e.a, t));
    case 'cos': return Math.cos(evalExpr(e.a, t));
    case 'abs': return Math.abs(evalExpr(e.a, t));
    case 'floor': return Math.floor(evalExpr(e.a, t));
    case 'iflt': return evalExpr(e.a, t) < evalExpr(e.b, t) ? evalExpr(e.then, t) : evalExpr(e.else, t);
  }
}

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return '0';
  const s = Number(n.toFixed(6)).toString();
  return n < 0 ? `(${s})` : s;
};

/** Converte para a sintaxe de expressões do FFmpeg. `tv` é o texto que representa T. */
export function toFFmpeg(e: Expr, tv: string): string {
  if (typeof e === 'number') return fmt(e);
  switch (e.op) {
    case 'T': return `(${tv})`;
    case 'add': return `(${toFFmpeg(e.a, tv)}+${toFFmpeg(e.b, tv)})`;
    case 'sub': return `(${toFFmpeg(e.a, tv)}-${toFFmpeg(e.b, tv)})`;
    case 'mul': return `(${toFFmpeg(e.a, tv)}*${toFFmpeg(e.b, tv)})`;
    case 'div': return `(${toFFmpeg(e.a, tv)}/${toFFmpeg(e.b, tv)})`;
    case 'min': return `min(${toFFmpeg(e.a, tv)},${toFFmpeg(e.b, tv)})`;
    case 'max': return `max(${toFFmpeg(e.a, tv)},${toFFmpeg(e.b, tv)})`;
    case 'pow': return `pow(${toFFmpeg(e.a, tv)},${toFFmpeg(e.b, tv)})`;
    case 'sin': return `sin(${toFFmpeg(e.a, tv)})`;
    case 'cos': return `cos(${toFFmpeg(e.a, tv)})`;
    case 'abs': return `abs(${toFFmpeg(e.a, tv)})`;
    case 'floor': return `floor(${toFFmpeg(e.a, tv)})`;
    case 'iflt': return `if(lt(${toFFmpeg(e.a, tv)},${toFFmpeg(e.b, tv)}),${toFFmpeg(e.then, tv)},${toFFmpeg(e.else, tv)})`;
  }
}

export const isConst = (e: Expr): e is number => typeof e === 'number';

/** Amostra a expressão para encontrar o mínimo/máximo num intervalo. */
export function rangeOf(e: Expr, t0: number, t1: number, samples = 240): { min: number; max: number } {
  if (isConst(e)) return { min: e, max: e };
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const v = evalExpr(e, t0 + ((t1 - t0) * i) / samples);
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return { min: lo, max: hi };
}
