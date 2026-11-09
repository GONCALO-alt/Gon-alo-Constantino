import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../api';

const cache = new Map<string, Promise<{ perSec: number; peaks: number[] }>>();
export function loadWave(file: string) {
  let p = cache.get(file);
  if (!p) { p = api.readWaveform(file); cache.set(file, p); }
  return p;
}

/** Forma de onda do troço visível do clip (100 picos por segundo de fonte). */
export function Waveform({ file, inPt, speed, duration, left, width, zoom, view, height, color, volume }: {
  file: string; inPt: number; speed: number; duration: number; left: number; width: number; zoom: number;
  view: { left: number; width: number }; height: number; color: string; volume: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [wave, setWave] = useState<{ perSec: number; peaks: number[] } | null>(null);
  useEffect(() => { let alive = true; loadWave(file).then((w) => alive && setWave(w)).catch(() => undefined); return () => { alive = false; }; }, [file]);
  const x0 = Math.max(0, view.left - left - 50);
  const x1 = Math.min(width, view.left + view.width - left + 50);
  const w = Math.max(1, Math.floor(x1 - x0));
  useEffect(() => {
    const c = ref.current;
    if (!c || !wave) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = w * dpr; c.height = height * dpr;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, height);
    ctx.fillStyle = color;
    const gain = Math.min(1.6, Math.max(0.15, volume));
    for (let x = 0; x < w; x++) {
      const tA = inPt + ((x0 + x) / zoom) * speed;
      const tB = inPt + ((x0 + x + 1) / zoom) * speed;
      let mx = 0;
      for (let i = Math.floor(tA * wave.perSec); i <= Math.floor(tB * wave.perSec); i++) mx = Math.max(mx, wave.peaks[i] ?? 0);
      const v = Math.min(1, Math.sqrt((mx / 255) * gain)) * (height - 2); // escala perceptual
      ctx.fillRect(x, (height - v) / 2, 1, Math.max(1, v));
    }
  }, [wave, w, x0, height, inPt, speed, zoom, color, volume]);
  if (x1 <= x0 || duration <= 0) return null;
  return <canvas ref={ref} className="wave" style={{ left: x0, width: w, height }} />;
}
