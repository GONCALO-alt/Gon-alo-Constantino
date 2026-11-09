import type { Clip, MediaAsset } from './types';

/**
 * Tamanho base (em píxeis do canvas W×H) de uma camada visual com escala 1.
 * Vídeos e imagens são encaixados ("contain") no canvas depois do recorte.
 * Textos usam o tamanho da imagem renderizada (já à escala do canvas).
 */
export function baseSize(
  clip: Clip, media: MediaAsset | undefined, W: number, H: number,
  textDims?: { width: number; height: number },
): { w: number; h: number; cw: number; ch: number } {
  if (clip.type === 'text') {
    const w = textDims?.width ?? 2, h = textDims?.height ?? 2;
    return { w, h, cw: w, ch: h };
  }
  const mw = media?.width || W, mh = media?.height || H;
  const cw = Math.max(1, mw * (1 - clip.crop.l - clip.crop.r));
  const ch = Math.max(1, mh * (1 - clip.crop.t - clip.crop.b));
  const fit = Math.min(W / cw, H / ch);
  return { w: cw * fit, h: ch * fit, cw, ch };
}

export const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
