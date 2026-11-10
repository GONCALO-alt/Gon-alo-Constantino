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
export interface EffectDef { type: EffectType; name: string; description: string; category: string }
export const EFFECTS: EffectDef[] = [
  { type: 'blur', name: 'Desfocar', description: 'Desfoque gaussiano', category: 'Básico' },
  { type: 'sharpen', name: 'Nitidez', description: 'Realça detalhes', category: 'Básico' },
  { type: 'vignette', name: 'Vinheta', description: 'Escurece os cantos', category: 'Básico' },
  { type: 'cinemaBars', name: 'Barras de cinema', description: 'Faixas pretas em cima e em baixo', category: 'Básico' },
  { type: 'mirror', name: 'Espelho', description: 'Reflete a metade esquerda', category: 'Básico' },
  { type: 'glow', name: 'Brilho suave', description: 'Halo luminoso (glow)', category: 'Luz' },
  { type: 'flash', name: 'Flash', description: 'Clarões brancos ritmados', category: 'Luz' },
  { type: 'strobe', name: 'Estroboscópio', description: 'Piscar rápido', category: 'Luz' },
  { type: 'grain', name: 'Grão de filme', description: 'Ruído analógico', category: 'Retro' },
  { type: 'scanlines', name: 'VHS', description: 'Linhas de varrimento e cor deslocada', category: 'Retro' },
  { type: 'sepia', name: 'Sépia', description: 'Tom antigo', category: 'Retro' },
  { type: 'bw', name: 'Preto e branco', description: 'Remove a cor', category: 'Retro' },
  { type: 'posterize', name: 'Posterizar', description: 'Reduz o número de cores', category: 'Arte' },
  { type: 'duotone', name: 'Duotone', description: 'Azul profundo e rosa', category: 'Arte' },
  { type: 'invert', name: 'Inverter', description: 'Negativo', category: 'Arte' },
  { type: 'pixelate', name: 'Pixelizar', description: 'Mosaico de píxeis', category: 'Distorção' },
  { type: 'chromatic', name: 'Aberração cromática', description: 'Separação RGB fixa', category: 'Distorção' },
  { type: 'glitch', name: 'Glitch', description: 'Separação RGB intermitente', category: 'Distorção' },
];

/** Sigma (px) do desfoque para uma intensidade 0..100 numa altura de referência. */
export const blurSigma = (intensity: number, refHeight: number) => (intensity / 100) * 18 * (refHeight / 1080);
/** Deslocamento RGB (px) do glitch. */
export const glitchShift = (intensity: number, refHeight: number) => (intensity / 100) * 24 * (refHeight / 1080);
/** Ângulo da vinheta (filtro vignette do FFmpeg). */
export const vignetteAngle = (intensity: number) => (intensity / 100) * (Math.PI / 2) * 0.85;
export const grainStrength = (intensity: number) => (intensity / 100) * 40; // escala 0..100 do filtro noise
export const sharpenAmount = (intensity: number) => (intensity / 100) * 2.0;
/** Número de blocos (horizontal, vertical) do pixelizar — independente da resolução, igual no preview e na exportação. */
export const pixelGrid = (intensity: number, layerW: number, layerH: number, refHeight: number) => {
  const block = ((2 + (intensity / 100) * 38) / 1080) * refHeight;
  return [Math.max(1, Math.round(layerW / block)), Math.max(1, Math.round(layerH / block))];
};
/** Número de níveis por canal do posterizar. */
export const posterLevels = (intensity: number) => Math.max(2, Math.round(16 - (intensity / 100) * 13));
export const chromaShift = (intensity: number, refHeight: number) => Math.max(1, Math.round((intensity / 100) * 14 * (refHeight / 1080)));
/** Período (px) e opacidade das linhas do VHS. */
export const scanPeriod = (refHeight: number) => Math.max(2, Math.round(4 * (refHeight / 1080)));
export const scanStrength = (intensity: number) => (intensity / 100) * 0.45;
export const glowSigma = (refHeight: number) => 14 * (refHeight / 1080);
export const barsFraction = (intensity: number) => (intensity / 100) * 0.14;
export const DUOTONE = { dark: [27, 20, 100], light: [255, 92, 138] };

// ---- Catálogos para a interface ----
export const TRANSITIONS: { type: TransitionType; name: string; category: string }[] = [
  { type: 'dissolve', name: 'Misturar', category: 'Básico' },
  { type: 'fade', name: 'Fundir a preto', category: 'Básico' },
  { type: 'whiteFlash', name: 'Flash branco', category: 'Básico' },
  { type: 'zoomIn', name: 'Aproximar', category: 'Câmara' },
  { type: 'zoomOut', name: 'Afastar', category: 'Câmara' },
  { type: 'zoomBlur', name: 'Zoom desfocado', category: 'Câmara' },
  { type: 'spin', name: 'Rodar', category: 'Câmara' },
  { type: 'shake', name: 'Tremer', category: 'Câmara' },
  { type: 'slideLeft', name: 'Deslizar ←', category: 'Deslizar' },
  { type: 'slideRight', name: 'Deslizar →', category: 'Deslizar' },
  { type: 'slideUp', name: 'Deslizar ↑', category: 'Deslizar' },
  { type: 'slideDown', name: 'Deslizar ↓', category: 'Deslizar' },
  { type: 'pushLeft', name: 'Empurrar ←', category: 'Deslizar' },
  { type: 'pushRight', name: 'Empurrar →', category: 'Deslizar' },
  { type: 'wipeRight', name: 'Cortina →', category: 'Cortina' },
  { type: 'wipeLeft', name: 'Cortina ←', category: 'Cortina' },
  { type: 'wipeDown', name: 'Cortina ↓', category: 'Cortina' },
  { type: 'wipeUp', name: 'Cortina ↑', category: 'Cortina' },
  { type: 'blur', name: 'Desfoque', category: 'Efeitos' },
  { type: 'glitch', name: 'Glitch', category: 'Efeitos' },
];

export const ANIMS: { type: AnimType; name: string }[] = [
  { type: 'none', name: 'Nenhuma' },
  { type: 'fade', name: 'Fade' },
  { type: 'zoomIn', name: 'Zoom in' },
  { type: 'zoomOut', name: 'Zoom out' },
  { type: 'pop', name: 'Pop' },
  { type: 'elastic', name: 'Elástico' },
  { type: 'bounce', name: 'Quicar' },
  { type: 'slideUp', name: 'Subir' },
  { type: 'slideDown', name: 'Descer' },
  { type: 'slideLeft', name: 'Da direita' },
  { type: 'slideRight', name: 'Da esquerda' },
  { type: 'riseUp', name: 'Emergir' },
  { type: 'rotateIn', name: 'Rodar' },
  { type: 'spin', name: 'Rodopio' },
  { type: 'swing', name: 'Baloiçar' },
  { type: 'flipX', name: 'Virar H' },
  { type: 'flipY', name: 'Virar V' },
  { type: 'stretch', name: 'Esticar' },
  { type: 'squeeze', name: 'Apertar' },
  { type: 'wipeRight', name: 'Revelar →' },
  { type: 'wipeLeft', name: 'Revelar ←' },
  { type: 'wipeDown', name: 'Revelar ↓' },
  { type: 'wipeUp', name: 'Revelar ↑' },
  { type: 'blur', name: 'Desfoque' },
  { type: 'zoomBlur', name: 'Zoom desfocado' },
  { type: 'shake', name: 'Tremer' },
  { type: 'flash', name: 'Flash' },
  { type: 'glitchIn', name: 'Glitch' },
];

export const MOTIONS: { type: MotionType; name: string }[] = [
  { type: 'none', name: 'Nenhum' },
  { type: 'shake', name: 'Tremer' },
  { type: 'heartbeat', name: 'Batimento' },
  { type: 'pulse', name: 'Pulsar' },
  { type: 'zoomPulse', name: 'Zoom ritmado' },
  { type: 'breathe', name: 'Respirar' },
  { type: 'jelly', name: 'Gelatina' },
  { type: 'wiggle', name: 'Abanar' },
  { type: 'rock', name: 'Embalar' },
  { type: 'sway', name: 'Balançar' },
  { type: 'float', name: 'Flutuar' },
  { type: 'bounceLoop', name: 'Saltitar' },
  { type: 'spinLoop', name: 'Girar' },
  { type: 'flicker', name: 'Cintilar' },
  { type: 'glitchLoop', name: 'Glitch' },
  { type: 'kenBurnsIn', name: 'Ken Burns (aproximar)' },
  { type: 'kenBurnsOut', name: 'Ken Burns (afastar)' },
];
