import type { Clip, Project, Track, MediaAsset } from './types';

export const EPS = 1e-4;

export const clipEnd = (c: Clip) => c.start + c.duration;
export const sourceTimeAt = (c: Clip, t: number) => c.in + (t - c.start) * c.speed;
export const sourceSpan = (c: Clip) => c.duration * c.speed;

export function projectDuration(p: Project): number {
  let d = 0;
  for (const c of p.clips) d = Math.max(d, clipEnd(c));
  return d;
}

export function clipsOnTrack(p: Project, trackId: string): Clip[] {
  return p.clips.filter((c) => c.trackId === trackId).sort((a, b) => a.start - b.start);
}

export function getMedia(p: Project, id?: string): MediaAsset | undefined {
  return id ? p.media.find((m) => m.id === id) : undefined;
}

export function getTrack(p: Project, id: string): Track | undefined {
  return p.tracks.find((t) => t.id === id);
}

/** Clip imediatamente anterior e encostado na mesma pista. */
export function prevAdjacent(p: Project, c: Clip): Clip | undefined {
  return p.clips.find((o) => o.trackId === c.trackId && o.id !== c.id && Math.abs(clipEnd(o) - c.start) < 0.01);
}
export function nextAdjacent(p: Project, c: Clip): Clip | undefined {
  return p.clips.find((o) => o.trackId === c.trackId && o.id !== c.id && Math.abs(o.start - clipEnd(c)) < 0.01);
}

/** Duração máxima permitida para uma transição entre dois clips. */
export function maxTransition(a: Clip, b: Clip): number {
  return Math.max(0.1, Math.min(a.duration, b.duration) * 0.9);
}

/**
 * Prolongamento do clip `c` para lá do seu fim, para servir de fundo à transição do clip seguinte
 * (dissolver, zoom, deslizar...). O "fade" passa por preto e não precisa de prolongamento.
 */
export function transitionTail(p: Project, c: Clip): number {
  if (c.type === 'audio') return 0;
  const n = nextAdjacent(p, c);
  if (!n || !n.transitionIn || n.transitionIn.type === 'fade' || n.transitionIn.type === 'whiteFlash') return 0;
  return Math.min(n.transitionIn.duration, maxTransition(c, n));
}

/** Duração da transição de entrada efetivamente aplicada (0 se não houver clip anterior). */
export function effectiveTransitionIn(p: Project, c: Clip): number {
  if (!c.transitionIn) return 0;
  const prev = prevAdjacent(p, c);
  if (!prev) return 0;
  return Math.min(c.transitionIn.duration, maxTransition(prev, c));
}

/** Duração do "fade para preto" no fim do clip, se o seguinte usa a transição fade. */
export function fadeOutTail(p: Project, c: Clip): number {
  const n = nextAdjacent(p, c);
  if (!n || !n.transitionIn || (n.transitionIn.type !== 'fade' && n.transitionIn.type !== 'whiteFlash')) return 0;
  return Math.min(n.transitionIn.duration, maxTransition(c, n));
}

export const isVisual = (c: Clip) => c.type === 'video' || c.type === 'image' || c.type === 'text';
export const hasAudio = (c: Clip, m?: MediaAsset) =>
  (c.type === 'audio' || (c.type === 'video' && !!m?.hasAudio)) && !c.muted;

export function fmtTime(t: number, fps = 30, withFrames = true): string {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const f = Math.floor((t - Math.floor(t)) * fps + 1e-6);
  const pad = (n: number) => String(n).padStart(2, '0');
  const base = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return withFrames ? `${base}:${pad(f)}` : base;
}

export function fmtDuration(t: number): string {
  if (!t) return '';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const uid = (prefix = '') =>
  prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
