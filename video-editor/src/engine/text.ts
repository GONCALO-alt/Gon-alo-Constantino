// Renderização de texto para canvas. É usada tanto na pré-visualização como na
// exportação (onde o texto é renderizado diretamente à resolução final, ex. 4K).
import type { TextStyle } from '@shared/types';

export interface RenderedText { canvas: HTMLCanvasElement; width: number; height: number }

const hexToRgba = (color: string, alpha: number) => {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const c = color.length === 4 ? color.slice(1).split('').map((x) => x + x).join('') : color.slice(1);
    const n = parseInt(c, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  }
  return color;
};

export const fontString = (s: TextStyle, px: number) =>
  `${s.italic ? 'italic ' : ''}${s.bold ? '700 ' : '400 '}${px}px "${s.font}", Inter, sans-serif`;

export async function ensureFont(s: TextStyle) {
  try { await document.fonts.load(fontString(s, 40), 'AaÁçã'); } catch { /* fonte do sistema */ }
}

export function renderText(text: string, s: TextStyle, refHeight: number, canvas?: HTMLCanvasElement): RenderedText {
  const k = refHeight / 1080;
  const px = Math.max(1, s.size * k);
  const lines = (text || ' ').split('\n');
  const c = canvas ?? document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  ctx.font = fontString(s, px);
  (ctx as any).letterSpacing = `${s.letterSpacing * k}px`;
  const lineH = px * s.lineHeight;
  const widths = lines.map((l) => ctx.measureText(l).width);
  const textW = Math.max(1, ...widths);
  const textH = lineH * lines.length;
  const stroke = s.strokeWidth * k;
  const bgPad = s.background ? px * 0.35 : 0;
  const shadowPad = s.shadowBlur * k * 1.5 + Math.max(Math.abs(s.shadowX), Math.abs(s.shadowY)) * k;
  const pad = Math.ceil(stroke + bgPad + shadowPad + 4);
  const W = Math.ceil(textW + pad * 2);
  const H = Math.ceil(textH + pad * 2);
  c.width = W;
  c.height = H;
  ctx.clearRect(0, 0, W, H);
  ctx.font = fontString(s, px);
  (ctx as any).letterSpacing = `${s.letterSpacing * k}px`;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  if (s.background) {
    ctx.fillStyle = hexToRgba(s.background, s.backgroundOpacity);
    const r = px * 0.2;
    const x = pad - bgPad, y = pad - bgPad, w = textW + bgPad * 2, h = textH + bgPad * 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }
  lines.forEach((line, i) => {
    const lw = widths[i];
    const x = s.align === 'left' ? pad : s.align === 'right' ? pad + textW - lw : pad + (textW - lw) / 2;
    const y = pad + lineH * i + lineH / 2;
    if (s.shadowBlur > 0 || s.shadowX || s.shadowY) {
      ctx.shadowColor = s.shadowColor;
      ctx.shadowBlur = s.shadowBlur * k;
      ctx.shadowOffsetX = s.shadowX * k;
      ctx.shadowOffsetY = s.shadowY * k;
    }
    if (stroke > 0) {
      ctx.strokeStyle = s.strokeColor;
      ctx.lineWidth = stroke * 2;
      ctx.strokeText(line, x, y);
      ctx.shadowColor = 'transparent';
    }
    ctx.fillStyle = s.color;
    ctx.fillText(line, x, y);
    ctx.shadowColor = 'transparent';
    if (s.underline) {
      ctx.fillRect(x, y + px * 0.45, lw, Math.max(1, px * 0.06));
    }
  });
  return { canvas: c, width: W, height: H };
}

export async function renderTextPng(text: string, s: TextStyle, refHeight: number): Promise<{ data: ArrayBuffer; width: number; height: number }> {
  await ensureFont(s);
  const r = renderText(text, s, refHeight);
  const blob: Blob = await new Promise((res, rej) => r.canvas.toBlob((b) => (b ? res(b) : rej(new Error('PNG'))), 'image/png'));
  return { data: await blob.arrayBuffer(), width: r.width, height: r.height };
}

export { FONTS } from './fonts';
