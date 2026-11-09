import type { Clip, ClipType, MediaAsset, Project, TextStyle, Track, TrackKind } from './types';
import { uid } from './timeline';

export const DEFAULT_TEXT_STYLE: TextStyle = {
  font: 'Inter',
  size: 96,
  color: '#ffffff',
  bold: true,
  italic: false,
  underline: false,
  align: 'center',
  letterSpacing: 0,
  lineHeight: 1.2,
  strokeColor: '#000000',
  strokeWidth: 0,
  shadowColor: 'rgba(0,0,0,0.6)',
  shadowBlur: 12,
  shadowX: 0,
  shadowY: 4,
  background: '',
  backgroundOpacity: 0.6,
};

export const CAPTION_STYLE: TextStyle = {
  ...DEFAULT_TEXT_STYLE,
  size: 64,
  strokeColor: '#000000',
  strokeWidth: 6,
  shadowBlur: 0,
  shadowY: 0,
};

export function createProject(name = 'Projeto sem título', width = 1920, height = 1080, fps = 30): Project {
  const now = Date.now();
  return {
    version: 1,
    id: uid('p_'),
    name,
    createdAt: now,
    updatedAt: now,
    settings: { width, height, fps, background: '#000000' },
    media: [],
    tracks: [createTrack('video', 'Vídeo 1'), createTrack('audio', 'Áudio 1')],
    clips: [],
    markers: [],
  };
}

export function createTrack(kind: TrackKind, name?: string): Track {
  const names: Record<TrackKind, string> = { video: 'Vídeo', audio: 'Áudio', text: 'Texto' };
  return { id: uid('t_'), kind, name: name ?? names[kind], locked: false, hidden: false, muted: false };
}

export function baseClip(type: ClipType, trackId: string, start: number, duration: number): Clip {
  return {
    id: uid('c_'),
    type,
    trackId,
    start,
    duration,
    in: 0,
    speed: 1,
    volume: 1,
    muted: false,
    fadeIn: 0,
    fadeOut: 0,
    transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, flipH: false, flipV: false },
    crop: { l: 0, t: 0, r: 0, b: 0 },
    color: { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0 },
    filter: null,
    effects: [],
    keyframes: {},
    motion: { type: 'none', intensity: 50 },
    animIn: { type: 'none', duration: 0.5 },
    animOut: { type: 'none', duration: 0.5 },
    transitionIn: null,
  };
}

export function clipFromMedia(m: MediaAsset, trackId: string, start: number): Clip {
  const type: ClipType = m.kind === 'image' ? 'image' : m.kind === 'audio' ? 'audio' : 'video';
  const dur = m.kind === 'image' ? 5 : m.duration;
  const c = baseClip(type, trackId, start, dur);
  c.mediaId = m.id;
  c.name = m.name;
  return c;
}

export function createTextClip(trackId: string, start: number, text = 'Texto', style?: Partial<TextStyle>, duration = 4): Clip {
  const c = baseClip('text', trackId, start, duration);
  c.text = text;
  c.style = { ...DEFAULT_TEXT_STYLE, ...style };
  c.name = text;
  return c;
}

/** Garante que projetos antigos ou incompletos têm todos os campos. */
export function normalizeProject(p: Project): Project {
  const template = baseClip('video', '', 0, 1);
  p.clips = p.clips.map((c) => ({
    ...template,
    ...c,
    transform: { ...template.transform, ...c.transform },
    crop: { ...template.crop, ...c.crop },
    color: { ...template.color, ...c.color },
    motion: { ...template.motion, ...c.motion },
    animIn: { ...template.animIn, ...c.animIn },
    animOut: { ...template.animOut, ...c.animOut },
    keyframes: c.keyframes ?? {},
    effects: c.effects ?? [],
    style: c.type === 'text' ? { ...DEFAULT_TEXT_STYLE, ...c.style } : c.style,
  }));
  p.markers = p.markers ?? [];
  return p;
}

export const RESOLUTIONS = [
  { id: '720p', label: '720p HD', short: 720 },
  { id: '1080p', label: '1080p Full HD', short: 1080 },
  { id: '1440p', label: '1440p 2K', short: 1440 },
  { id: '2160p', label: '4K Ultra HD', short: 2160 },
] as const;

/** Dimensões de exportação para uma resolução (lado menor) mantendo a proporção do projeto. */
export function exportSize(projW: number, projH: number, short: number) {
  const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
  if (projW >= projH) return { width: even((short * projW) / projH), height: short };
  return { width: short, height: even((short * projH) / projW) };
}

export const ASPECTS = [
  { id: '16:9', w: 1920, h: 1080, label: '16:9 YouTube' },
  { id: '9:16', w: 1080, h: 1920, label: '9:16 TikTok / Reels' },
  { id: '1:1', w: 1080, h: 1080, label: '1:1 Instagram' },
  { id: '4:5', w: 1080, h: 1350, label: '4:5 Retrato' },
  { id: '21:9', w: 2560, h: 1080, label: '21:9 Cinema' },
  { id: '4:3', w: 1440, h: 1080, label: '4:3 Clássico' },
];
