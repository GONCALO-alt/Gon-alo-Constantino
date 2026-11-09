// Correção de cor, filtros (looks cinematográficos) e efeitos.
// As fórmulas aqui são a fonte única da verdade: o shader WebGL da pré-visualização
// e os filtros FFmpeg da exportação usam exatamente estes parâmetros.
import type { ColorAdjust, EffectType, TransitionType, AnimType, MotionType } from './types';
import { Expr, T, add, sub, mul, pow, min, max, evalExpr } from './expr';

/** Parâmetros no formato do filtro `eq` do FFmpeg. */
export function eqParams(c: ColorAdjust) {
  return {
    brightness: (c.brightness / 100) * 0.3,
    contrast: 1 + (c.contrast / 100) * 0.6,
    saturation: Math.max(0, 1 + c.saturation / 100),
  };
}

/** Multiplicadores RGB para temperatura/tonalidade (colorchannelmixer). */
export function tempTintGains(c: ColorAdjust) {
  const tk = c.temperature / 100;
  const ti = c.tint / 100;
  return { r: 1 + 0.18 * tk, g: 1 - 0.14 * ti, b: 1 - 0.18 * tk };
}

export const isNeutralColor = (c: ColorAdjust) =>
  !c.brightness && !c.contrast && !c.saturation && !c.temperature && !c.tint;

// ---- Filtros (curvas por canal, em função de v = T no intervalo 0..1) ----
const lgg = (lift: number, gamma: number, gain: number): Expr =>
  add(mul(pow(T, 1 / gamma), gain * (1 - lift)), lift);
const sCurve = (base: Expr, amount: number): Expr => {
  // v + a * (smoothstep(v) - v)
  const s = mul(mul(base, base), sub(3, mul(2, base)));
  return add(base, mul(amount, sub(s, base)));
};
const clampE = (e: Expr) => min(max(e, 0), 1);

export interface FilterDef {
  id: string;
  name: string;
  mono?: boolean;
  r: Expr; g: Expr; b: Expr;
  saturation: number;
  swatch: string; // gradiente para a miniatura do filtro
}

const def = (
  id: string, name: string, swatch: string,
  r: Expr, g: Expr, b: Expr, saturation = 1, mono = false,
): FilterDef => ({ id, name, swatch, r: clampE(r), g: clampE(g), b: clampE(b), saturation, mono });

export const FILTERS: FilterDef[] = [
  def('cinema', 'Cinema', 'linear-gradient(135deg,#0f4c5c,#e36414)',
    sCurve(lgg(0.02, 1.05, 1.05), 0.3), sCurve(T, 0.25), lgg(0.08, 0.95, 0.9), 1.1),
  def('vintage', 'Vintage', 'linear-gradient(135deg,#a68a64,#582f0e)',
    lgg(0.08, 1, 1.05), lgg(0.08, 1, 1), lgg(0.08, 1, 0.85), 0.75),
  def('noir', 'Noir', 'linear-gradient(135deg,#000,#bbb)', sCurve(T, 0.6), sCurve(T, 0.6), sCurve(T, 0.6), 1, true),
  def('warm', 'Quente', 'linear-gradient(135deg,#ffb703,#fb8500)',
    lgg(0.02, 1, 1.08), T, lgg(0, 1, 0.88), 1.05),
  def('cold', 'Frio', 'linear-gradient(135deg,#90e0ef,#023e8a)',
    lgg(0, 1, 0.9), T, lgg(0.04, 1, 1.08), 0.95),
  def('faded', 'Desbotado', 'linear-gradient(135deg,#ddd,#888)',
    lgg(0.12, 1, 0.95), lgg(0.12, 1, 0.95), lgg(0.12, 1, 0.95), 0.8),
  def('vivid', 'Vívido', 'linear-gradient(135deg,#f72585,#4cc9f0)',
    sCurve(T, 0.35), sCurve(T, 0.35), sCurve(T, 0.35), 1.35),
  def('golden', 'Hora dourada', 'linear-gradient(135deg,#ffd166,#ef476f)',
    lgg(0, 1, 1.1), lgg(0, 1, 1.03), lgg(0.02, 1, 0.8), 1.15),
  def('matrix', 'Matriz', 'linear-gradient(135deg,#003300,#00ff41)',
    lgg(0, 1, 0.85), lgg(0.03, 1, 1.1), lgg(0, 1, 0.85), 0.8),
  def('pastel', 'Pastel', 'linear-gradient(135deg,#ffc8dd,#bde0fe)',
    sCurve(lgg(0.1, 1, 1), -0.2), sCurve(lgg(0.1, 1, 1), -0.2), sCurve(lgg(0.1, 1, 1), -0.2), 0.7),
  def('bleach', 'Bleach', 'linear-gradient(135deg,#555,#eee)', sCurve(T, 0.4), sCurve(T, 0.4), sCurve(T, 0.4), 0.45),
  def('sepiafilm', 'Filme antigo', 'linear-gradient(135deg,#704214,#e8c39e)',
    lgg(0.05, 1, 1.1), lgg(0.03, 1, 0.95), lgg(0, 1, 0.75), 1, true),
];

export const getFilter = (id?: string | null) => FILTERS.find((f) => f.id === id);

/** Curva de um canal com a intensidade aplicada: v + (curva(v) - v) * k */
export function filterChannel(curve: Expr, intensity: number): Expr {
  const k = intensity / 100;
  return add(T, mul(k, sub(curve, T)));
}

/** LUT de 256 entradas RGBA usada pela pré-visualização (igual ao lutrgb do FFmpeg). */
export function filterLut(id: string, intensity: number): Uint8Array {
  const f = getFilter(id);
  const lut = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    const v = i / 255;
    const ch = (e: Expr) => (f ? evalExpr(filterChannel(e, intensity), v) : v);
    lut[i * 4] = Math.round(Math.min(1, Math.max(0, ch(f?.r ?? T))) * 255);
    lut[i * 4 + 1] = Math.round(Math.min(1, Math.max(0, ch(f?.g ?? T))) * 255);
    lut[i * 4 + 2] = Math.round(Math.min(1, Math.max(0, ch(f?.b ?? T))) * 255);
    lut[i * 4 + 3] = 255;
  }
  return lut;
}

export const filterSaturation = (id: string, intensity: number) => {
  const f = getFilter(id);
  return f ? 1 + (f.saturation - 1) * (intensity / 100) : 1;
};
export const filterMono = (id: string, intensity: number) => {
  const f = getFilter(id);
  return f?.mono ? intensity / 100 : 0;
};

// ---- Efeitos ----
export interface EffectDef { type: EffectType; name: string; description: string }
export const EFFECTS: EffectDef[] = [
  { type: 'blur', name: 'Desfocar', description: 'Desfoque gaussiano' },
  { type: 'sharpen', name: 'Nitidez', description: 'Realça detalhes' },
  { type: 'vignette', name: 'Vinheta', description: 'Escurece os cantos' },
  { type: 'grain', name: 'Grão de filme', description: 'Ruído analógico' },
  { type: 'glitch', name: 'Glitch', description: 'Separação RGB intermitente' },
  { type: 'bw', name: 'Preto e branco', description: 'Remove a cor' },
  { type: 'sepia', name: 'Sépia', description: 'Tom antigo' },
  { type: 'invert', name: 'Inverter', description: 'Negativo' },
];

/** Sigma (px) do desfoque para uma intensidade 0..100 numa altura de referência. */
export const blurSigma = (intensity: number, refHeight: number) => (intensity / 100) * 18 * (refHeight / 1080);
/** Deslocamento RGB (px) do glitch. */
export const glitchShift = (intensity: number, refHeight: number) => (intensity / 100) * 24 * (refHeight / 1080);
/** Ângulo da vinheta (filtro vignette do FFmpeg). */
export const vignetteAngle = (intensity: number) => (intensity / 100) * (Math.PI / 2) * 0.85;
export const grainStrength = (intensity: number) => (intensity / 100) * 40; // escala 0..100 do filtro noise
export const sharpenAmount = (intensity: number) => (intensity / 100) * 2.0;

// ---- Catálogos para a interface ----
export const TRANSITIONS: { type: TransitionType; name: string }[] = [
  { type: 'fade', name: 'Fade (preto)' },
  { type: 'dissolve', name: 'Dissolver' },
  { type: 'zoomIn', name: 'Zoom in' },
  { type: 'zoomOut', name: 'Zoom out' },
  { type: 'slideLeft', name: 'Deslizar ←' },
  { type: 'slideRight', name: 'Deslizar →' },
  { type: 'slideUp', name: 'Deslizar ↑' },
  { type: 'slideDown', name: 'Deslizar ↓' },
  { type: 'blur', name: 'Desfoque' },
  { type: 'glitch', name: 'Glitch' },
];

export const ANIMS: { type: AnimType; name: string }[] = [
  { type: 'none', name: 'Nenhuma' },
  { type: 'fade', name: 'Fade' },
  { type: 'slideUp', name: 'Subir' },
  { type: 'slideDown', name: 'Descer' },
  { type: 'slideLeft', name: 'Da direita' },
  { type: 'slideRight', name: 'Da esquerda' },
  { type: 'zoomIn', name: 'Zoom in' },
  { type: 'zoomOut', name: 'Zoom out' },
  { type: 'pop', name: 'Pop' },
  { type: 'blur', name: 'Desfoque' },
  { type: 'spin', name: 'Rodopio' },
];

export const MOTIONS: { type: MotionType; name: string }[] = [
  { type: 'none', name: 'Nenhum' },
  { type: 'shake', name: 'Tremer' },
  { type: 'kenBurnsIn', name: 'Ken Burns (aproximar)' },
  { type: 'kenBurnsOut', name: 'Ken Burns (afastar)' },
  { type: 'pulse', name: 'Pulsar' },
  { type: 'float', name: 'Flutuar' },
  { type: 'sway', name: 'Balançar' },
];
