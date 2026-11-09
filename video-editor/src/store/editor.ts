import { create } from 'zustand';
import { produce, Draft } from 'immer';
import type { Clip, MediaAsset, Project, Track, TrackKind, TransitionRef, Keyframe, AnimProp } from '@shared/types';
import { clipFromMedia, createProject, createTextClip, createTrack } from '@shared/defaults';
import { clipEnd, clipsOnTrack, getMedia, maxTransition, prevAdjacent, uid, EPS } from '@shared/timeline';
import { valueAt } from '@shared/animation';
import { usePlayback } from './playback';

export type LeftTab = 'media' | 'audio' | 'text' | 'captions' | 'effects' | 'transitions' | 'filters';

interface Settings { autoProxy: boolean; useProxies: boolean; snapping: boolean }

interface EditorState {
  screen: 'home' | 'editor';
  project: Project;
  filePath: string | null;
  past: Project[];
  future: Project[];
  lastKey: string | null;
  lastKeyAt: number;
  version: number; // muda a cada alteração (usado pelo autosave e pela pré-visualização)
  selection: string[];
  transitionSel: string | null; // id do clip B cuja transição está selecionada
  zoom: number; // píxeis por segundo
  leftTab: LeftTab;
  settings: Settings;
  saveState: { status: 'saved' | 'saving' | 'dirty' | 'error'; at: number };
  toast: { id: number; text: string; kind: 'info' | 'error' | 'success' } | null;
  clipboard: Clip[];

  openProject(p: Project, filePath: string | null): void;
  goHome(): void;
  commit(fn: (d: Draft<Project>) => void, key?: string): void;
  silent(fn: (d: Draft<Project>) => void): void;
  undo(): void;
  redo(): void;
  select(ids: string[], additive?: boolean): void;
  selectTransition(clipId: string | null): void;
  setZoom(z: number): void;
  setLeftTab(t: LeftTab): void;
  setSettings(s: Partial<Settings>): void;
  setSaveState(s: EditorState['saveState']): void;
  notify(text: string, kind?: 'info' | 'error' | 'success'): void;
  setFilePath(p: string): void;
}

const HISTORY_LIMIT = 200;

const loadSettings = (): Settings => {
  try { return { autoProxy: true, useProxies: true, snapping: true, ...JSON.parse(localStorage.getItem('settings') || '{}') }; }
  catch { return { autoProxy: true, useProxies: true, snapping: true }; }
};

export const useEditor = create<EditorState>((set, get) => ({
  screen: 'home',
  project: createProject(),
  filePath: null,
  past: [],
  future: [],
  lastKey: null,
  lastKeyAt: 0,
  version: 0,
  selection: [],
  transitionSel: null,
  zoom: 80,
  leftTab: 'media',
  settings: loadSettings(),
  saveState: { status: 'saved', at: Date.now() },
  toast: null,
  clipboard: [],

  openProject: (p, filePath) => {
    set({ project: p, filePath, past: [], future: [], selection: [], transitionSel: null, screen: 'editor', version: get().version + 1, saveState: { status: 'saved', at: Date.now() } });
    usePlayback.getState().seek(0);
  },
  goHome: () => set({ screen: 'home' }),

  commit: (fn, key) => {
    const s = get();
    const next = produce(s.project, fn);
    if (next === s.project) return;
    const now = Date.now();
    const coalesce = key && s.lastKey === key && now - s.lastKeyAt < 1500;
    set({
      project: next,
      past: coalesce ? s.past : [...s.past.slice(-HISTORY_LIMIT), s.project],
      future: [],
      lastKey: key ?? null,
      lastKeyAt: now,
      version: s.version + 1,
      saveState: { status: 'dirty', at: s.saveState.at },
    });
  },
  // alteração sem entrada no histórico (ex.: miniaturas/proxies a chegar do processo principal)
  silent: (fn) => {
    const s = get();
    const next = produce(s.project, fn);
    if (next !== s.project) set({ project: next, version: s.version + 1 });
  },
  undo: () => {
    const s = get();
    if (!s.past.length) return;
    const prev = s.past[s.past.length - 1];
    set({ project: keepMedia(prev, s.project), past: s.past.slice(0, -1), future: [s.project, ...s.future], lastKey: null, version: s.version + 1, saveState: { status: 'dirty', at: s.saveState.at } });
  },
  redo: () => {
    const s = get();
    if (!s.future.length) return;
    const [next, ...rest] = s.future;
    set({ project: keepMedia(next, s.project), future: rest, past: [...s.past, s.project], lastKey: null, version: s.version + 1, saveState: { status: 'dirty', at: s.saveState.at } });
  },
  select: (ids, additive) => {
    const cur = get().selection;
    const next = additive ? Array.from(new Set([...cur, ...ids])).filter((id) => !(cur.includes(id) && ids.includes(id) && ids.length === 1)) : ids;
    set({ selection: next, transitionSel: null });
  },
  selectTransition: (clipId) => set({ transitionSel: clipId, selection: [] }),
  setZoom: (z) => set({ zoom: Math.max(4, Math.min(1200, z)) }),
  setLeftTab: (t) => set({ leftTab: t }),
  setSettings: (s) => {
    const settings = { ...get().settings, ...s };
    localStorage.setItem('settings', JSON.stringify(settings));
    set({ settings });
  },
  setSaveState: (saveState) => set({ saveState }),
  notify: (text, kind = 'info') => set({ toast: { id: Date.now(), text, kind } }),
  setFilePath: (p) => set({ filePath: p }),
}));

/** Ao desfazer, mantém os metadados de média mais recentes (miniaturas, proxies). */
function keepMedia(target: Project, current: Project): Project {
  return produce(target, (d) => {
    for (const m of d.media) {
      const cur = current.media.find((x) => x.id === m.id);
      if (cur) Object.assign(m, { thumbnail: cur.thumbnail, filmstrip: cur.filmstrip, waveform: cur.waveform, proxyPath: cur.proxyPath, proxyStatus: cur.proxyStatus, proxyProgress: cur.proxyProgress });
    }
  });
}

// ============== Operações de edição (funções puras sobre o rascunho) ==============

export const trackKindFor = (c: Pick<Clip, 'type'>): TrackKind => (c.type === 'audio' ? 'audio' : c.type === 'text' ? 'text' : 'video');

export function overlaps(p: Project, trackId: string, start: number, end: number, ignore: string[] = []) {
  return p.clips.some((c) => c.trackId === trackId && !ignore.includes(c.id) && c.start < end - EPS && clipEnd(c) > start + EPS);
}

/** Encontra (ou cria) uma pista compatível e livre no intervalo pedido. */
export function findFreeTrack(d: Draft<Project>, kind: TrackKind, start: number, end: number, preferred?: string, ignore: string[] = []): string {
  if (preferred) {
    const t = d.tracks.find((x) => x.id === preferred);
    if (t && t.kind === kind && !t.locked && !overlaps(d as Project, preferred, start, end, ignore)) return preferred;
  }
  const candidates = d.tracks.filter((t) => t.kind === kind && !t.locked);
  // pistas de vídeo: de baixo para cima (a principal é a última); áudio: de cima para baixo
  const ordered = kind === 'audio' ? candidates : [...candidates].reverse();
  for (const t of ordered) if (!overlaps(d as Project, t.id, start, end, ignore)) return t.id;
  return addTrack(d, kind);
}

export function addTrack(d: Draft<Project>, kind: TrackKind): string {
  const count = d.tracks.filter((t) => t.kind === kind).length + 1;
  const names: Record<TrackKind, string> = { video: 'Vídeo', audio: 'Áudio', text: 'Texto' };
  const t = createTrack(kind, `${names[kind]} ${count}`);
  if (kind === 'audio') d.tracks.push(t);
  else if (kind === 'text') d.tracks.unshift(t);
  else {
    // nova pista de vídeo fica acima das pistas de vídeo existentes (camada superior)
    const firstVideo = d.tracks.findIndex((x) => x.kind === 'video');
    d.tracks.splice(firstVideo < 0 ? d.tracks.filter((x) => x.kind === 'text').length : firstVideo, 0, t);
  }
  return t.id;
}

export function addMediaClip(d: Draft<Project>, m: MediaAsset, start: number, trackId?: string): Clip {
  const kind: TrackKind = m.kind === 'audio' ? 'audio' : 'video';
  const dur = m.kind === 'image' ? 5 : m.duration;
  const tid = findFreeTrack(d, kind, start, start + dur, trackId);
  const c = clipFromMedia(m, tid, start);
  d.clips.push(c as Draft<Clip>);
  return c;
}

/** Fim da pista principal de vídeo (para acrescentar clips em sequência). */
export function mainTrackEnd(p: Project): { trackId: string; end: number } {
  const videos = p.tracks.filter((t) => t.kind === 'video');
  const main = videos[videos.length - 1];
  if (!main) return { trackId: '', end: 0 };
  const clips = clipsOnTrack(p, main.id);
  return { trackId: main.id, end: clips.length ? clipEnd(clips[clips.length - 1]) : 0 };
}

export function splitClip(d: Draft<Project>, id: string, t: number): string | null {
  const c = d.clips.find((x) => x.id === id);
  if (!c) return null;
  const fps = d.settings.fps;
  if (t <= c.start + 1 / fps || t >= clipEnd(c) - 1 / fps) return null;
  const local = t - c.start;
  const right: Clip = JSON.parse(JSON.stringify(c));
  right.id = uid('c_');
  right.start = t;
  right.duration = c.duration - local;
  right.in = c.in + local * c.speed;
  right.transitionIn = null;
  right.animIn = { ...right.animIn, type: 'none' };
  right.fadeIn = 0;
  c.duration = local;
  c.animOut = { ...c.animOut, type: 'none' };
  c.fadeOut = 0;
  // keyframes: divide pela posição
  for (const k of Object.keys(c.keyframes) as AnimProp[]) {
    const kfs = c.keyframes[k] as Keyframe[] | undefined;
    if (!kfs?.length) continue;
    const v = valueAt(kfs as Keyframe[], 0, local);
    c.keyframes[k] = [...kfs.filter((f) => f.t < local), { t: local, v, ease: 'linear' }];
    right.keyframes[k] = [{ t: 0, v, ease: 'linear' }, ...kfs.filter((f) => f.t > local).map((f) => ({ ...f, t: f.t - local }))];
  }
  if (c.linkId) right.linkId = `${c.linkId}_${right.id}`;
  d.clips.push(right as Draft<Clip>);
  return right.id;
}

export function setTransition(d: Draft<Project>, clipId: string, tr: TransitionRef | null): boolean {
  const c = d.clips.find((x) => x.id === clipId);
  if (!c) return false;
  if (!tr) { c.transitionIn = null; return true; }
  const prev = prevAdjacent(d as Project, c as Clip);
  if (!prev) return false;
  c.transitionIn = { type: tr.type, duration: Math.min(tr.duration, maxTransition(prev, c as Clip)) };
  return true;
}

/** Remove clips; com ripple, puxa os clips seguintes da mesma pista. */
export function deleteClips(d: Draft<Project>, ids: string[], ripple = false) {
  const removed = d.clips.filter((c) => ids.includes(c.id));
  d.clips = d.clips.filter((c) => !ids.includes(c.id));
  if (ripple) {
    for (const r of removed) {
      for (const c of d.clips) if (c.trackId === r.trackId && c.start >= clipEnd(r as Clip) - EPS) c.start -= r.duration;
    }
  }
  for (const c of d.clips) {
    if (c.transitionIn && !prevAdjacent(d as Project, c as Clip)) c.transitionIn = null;
  }
}

/** Remove pistas vazias extra (mantém pelo menos uma de vídeo e uma de áudio). */
export function pruneTracks(d: Draft<Project>) {
  d.tracks = d.tracks.filter((t) => {
    const used = d.clips.some((c) => c.trackId === t.id);
    if (used) return true;
    const same = d.tracks.filter((x) => x.kind === t.kind);
    if ((t.kind === 'video' || t.kind === 'audio') && same.length === 1) return true;
    return false;
  });
}

/** Separa o áudio de um clip de vídeo para uma pista de áudio (ligado ao vídeo). */
export function detachAudio(d: Draft<Project>, id: string): string | null {
  const c = d.clips.find((x) => x.id === id);
  if (!c || c.type !== 'video') return null;
  const m = getMedia(d as Project, c.mediaId);
  if (!m?.hasAudio) return null;
  const tid = findFreeTrack(d, 'audio', c.start, clipEnd(c as Clip));
  const a: Clip = JSON.parse(JSON.stringify(c));
  Object.assign(a, {
    id: uid('c_'), type: 'audio', trackId: tid, muted: false, transitionIn: null,
    effects: [], filter: null, keyframes: c.keyframes.volume ? { volume: c.keyframes.volume } : {},
  });
  const link = c.linkId ?? uid('l_');
  a.linkId = link;
  c.linkId = link;
  c.muted = true;
  c.keyframes = { ...c.keyframes, volume: undefined };
  d.clips.push(a as Draft<Clip>);
  return a.id;
}

/** Congelar fotograma: divide o clip e insere uma imagem fixa, empurrando o resto da pista. */
export function insertFreeze(d: Draft<Project>, clipId: string, t: number, frame: MediaAsset, holdDuration = 3) {
  const c = d.clips.find((x) => x.id === clipId);
  if (!c) return;
  d.media.push({ ...frame, name: `Fotograma congelado ${fmtClock(t)}.png` } as Draft<MediaAsset>);
  // o áudio separado e ligado a este vídeo também é dividido e empurrado, para manter a sincronização
  const linkedAudio = c.linkId ? d.clips.filter((o) => o.type === 'audio' && o.linkId === c.linkId && o.start < t && clipEnd(o as Clip) > t) : [];
  splitClip(d, clipId, t);
  for (const a of linkedAudio) splitClip(d, a.id, t);
  const affected = new Set([c.trackId, ...linkedAudio.map((a) => a.trackId)]);
  for (const o of d.clips) if (affected.has(o.trackId) && o.start >= t - EPS) o.start += holdDuration;
  const img = clipFromMedia(frame, c.trackId, t);
  img.duration = holdDuration;
  img.transform = { ...c.transform };
  img.crop = { ...c.crop };
  img.color = { ...c.color };
  img.filter = c.filter ? { ...c.filter } : null;
  img.effects = c.effects.map((e) => ({ ...e }));
  img.name = 'Fotograma congelado';
  d.clips.push(img as Draft<Clip>);
}

const fmtClock = (t: number) => `${Math.floor(t / 60)}m${(t % 60).toFixed(1)}s`;

export function addText(d: Draft<Project>, start: number, text: string, style?: Partial<Clip['style']>, extra?: Partial<Clip>): Clip {
  const dur = extra?.duration ?? 4;
  const tid = extra?.trackId ?? findFreeTrack(d, 'text', start, start + dur);
  const c = createTextClip(tid, start, text, style as any, dur);
  Object.assign(c, extra ?? {}, { trackId: tid, start });
  d.clips.push(c as Draft<Clip>);
  return c;
}

export function setKeyframe(c: Draft<Clip>, prop: AnimProp, t: number, v: number) {
  const list = (c.keyframes[prop] ?? []) as Keyframe[];
  const i = list.findIndex((k) => Math.abs(k.t - t) < 1 / 60);
  if (i >= 0) list[i].v = v;
  else list.push({ t, v, ease: 'easeInOut' });
  list.sort((a, b) => a.t - b.t);
  c.keyframes[prop] = list;
}

export const findTrack = (p: Project, id: string): Track | undefined => p.tracks.find((t) => t.id === id);

/** Clips ligados a um conjunto (vídeo + áudio extraído). */
export function withLinked(p: Project, ids: string[]): string[] {
  const links = new Set(p.clips.filter((c) => ids.includes(c.id) && c.linkId).map((c) => c.linkId));
  return Array.from(new Set([...ids, ...p.clips.filter((c) => c.linkId && links.has(c.linkId)).map((c) => c.id)]));
}
