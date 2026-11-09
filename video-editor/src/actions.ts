// Ações de alto nível usadas pela barra de ferramentas, menus e atalhos de teclado.
import type { Clip, MediaAsset } from '@shared/types';
import { clipEnd, getMedia, uid, sourceTimeAt, EPS } from '@shared/timeline';
import { api } from './api';
import {
  addMediaClip, deleteClips, detachAudio, findFreeTrack, insertFreeze, mainTrackEnd, pruneTracks, splitClip, trackKindFor, useEditor, withLinked,
} from './store/editor';
import { usePlayback } from './store/playback';

const ed = () => useEditor.getState();
const now = () => usePlayback.getState().time;

export async function importPaths(paths: string[], addToTimeline: { at?: number; trackId?: string } | false = false): Promise<MediaAsset[]> {
  if (!paths.length) return [];
  ed().notify(`A importar ${paths.length} ficheiro(s)…`);
  const { media, errors } = await api.importMedia(paths, { autoProxy: ed().settings.autoProxy });
  if (errors.length) ed().notify(errors.join(' · '), 'error');
  if (!media.length) return [];
  ed().commit((d) => {
    for (const m of media) d.media.push(m);
    if (addToTimeline) {
      let t = addToTimeline.at ?? now();
      for (const m of media) {
        const c = addMediaClip(d, m, t, addToTimeline.trackId);
        t = clipEnd(c);
      }
    }
  });
  if (!errors.length) ed().notify(`${media.length} ficheiro(s) importado(s)`, 'success');
  return media;
}

export async function importDialog() {
  const paths = await api.openMedia();
  return importPaths(paths);
}

/** Acrescenta média no fim da pista principal (ou na posição indicada). */
export function addToTimeline(m: MediaAsset, at?: number, trackId?: string) {
  ed().commit((d) => {
    const start = at ?? (m.kind === 'video' || m.kind === 'image' ? mainTrackEnd(d as any).end : now());
    const c = addMediaClip(d, m, start, trackId ?? (m.kind !== 'audio' ? mainTrackEnd(d as any).trackId : undefined));
    useEditor.setState({ selection: [c.id] });
  });
}

export function splitAtPlayhead() {
  const s = ed();
  const t = now();
  const p = s.project;
  let targets = s.selection.length ? p.clips.filter((c) => s.selection.includes(c.id)) : p.clips;
  targets = targets.filter((c) => t > c.start + EPS && t < clipEnd(c) - EPS && !p.tracks.find((tr) => tr.id === c.trackId)?.locked);
  if (!targets.length) { s.notify('Coloque o cursor sobre um clip para dividir'); return; }
  const ids = withLinked(p, targets.map((c) => c.id)).filter((id) => {
    const c = p.clips.find((x) => x.id === id)!;
    return t > c.start + EPS && t < clipEnd(c) - EPS;
  });
  s.commit((d) => { for (const id of ids) splitClip(d, id, t); });
}

export function deleteSelection(ripple = false) {
  const s = ed();
  if (s.transitionSel) {
    s.commit((d) => { const c = d.clips.find((x) => x.id === s.transitionSel); if (c) c.transitionIn = null; });
    useEditor.setState({ transitionSel: null });
    return;
  }
  if (!s.selection.length) return;
  const locked = new Set(s.project.tracks.filter((t) => t.locked).map((t) => t.id));
  const ids = withLinked(s.project, s.selection).filter((id) => !locked.has(s.project.clips.find((c) => c.id === id)?.trackId ?? ''));
  s.commit((d) => { deleteClips(d, ids, ripple); pruneTracks(d); });
  useEditor.setState({ selection: [] });
}

export function duplicateSelection() {
  const s = ed();
  const clips = s.project.clips.filter((c) => s.selection.includes(c.id));
  if (!clips.length) return;
  const newIds: string[] = [];
  s.commit((d) => {
    for (const c of clips) {
      const n: Clip = JSON.parse(JSON.stringify(c));
      n.id = uid('c_');
      n.start = clipEnd(c);
      n.linkId = undefined;
      n.transitionIn = null;
      n.trackId = findFreeTrack(d, trackKindFor(c), n.start, n.start + n.duration, c.trackId);
      d.clips.push(n);
      newIds.push(n.id);
    }
  });
  useEditor.setState({ selection: newIds });
}

export function copySelection() {
  const s = ed();
  const clips = s.project.clips.filter((c) => s.selection.includes(c.id));
  if (clips.length) useEditor.setState({ clipboard: JSON.parse(JSON.stringify(clips)) });
}

export function paste() {
  const s = ed();
  if (!s.clipboard.length) return;
  const t = now();
  const base = Math.min(...s.clipboard.map((c) => c.start));
  const newIds: string[] = [];
  s.commit((d) => {
    for (const c of s.clipboard) {
      const n: Clip = JSON.parse(JSON.stringify(c));
      n.id = uid('c_');
      n.start = t + (c.start - base);
      n.linkId = undefined;
      n.transitionIn = null;
      n.trackId = findFreeTrack(d, trackKindFor(c), n.start, n.start + n.duration, c.trackId);
      d.clips.push(n);
      newIds.push(n.id);
    }
  });
  useEditor.setState({ selection: newIds });
}

export async function freezeFrame() {
  const s = ed();
  const t = now();
  const c = s.project.clips.find((x) => s.selection.includes(x.id) && x.type === 'video' && t >= x.start && t < clipEnd(x))
    ?? s.project.clips.find((x) => x.type === 'video' && t >= x.start && t < clipEnd(x));
  if (!c) { s.notify('Coloque o cursor sobre um clip de vídeo'); return; }
  const m = getMedia(s.project, c.mediaId)!;
  s.notify('A capturar fotograma em resolução total…');
  try {
    const frame = await api.freezeFrame(m.path, sourceTimeAt(c, t));
    ed().commit((d) => insertFreeze(d, c.id, t, frame, 3));
    ed().notify('Fotograma congelado (3 s)', 'success');
  } catch (e: any) { ed().notify(e.message, 'error'); }
}

export function extractAudio() {
  const s = ed();
  const vids = s.project.clips.filter((c) => s.selection.includes(c.id) && c.type === 'video');
  if (!vids.length) { s.notify('Selecione um clip de vídeo'); return; }
  let ok = 0;
  s.commit((d) => { for (const v of vids) if (detachAudio(d, v.id)) ok++; });
  s.notify(ok ? 'Áudio separado para uma pista de áudio (ligado ao vídeo)' : 'O clip não tem áudio', ok ? 'success' : 'error');
}

export function toggleMute() {
  const s = ed();
  const clips = s.project.clips.filter((c) => s.selection.includes(c.id) && (c.type === 'video' || c.type === 'audio'));
  if (!clips.length) return;
  const mute = !clips[0].muted;
  s.commit((d) => { for (const c of d.clips) if (s.selection.includes(c.id)) c.muted = mute; });
}

export function unlinkSelection() {
  const s = ed();
  s.commit((d) => { for (const c of d.clips) if (s.selection.includes(c.id)) c.linkId = undefined; });
}

/**
 * Sincronização automática: alinha um clip de áudio com o áudio de um clip de vídeo,
 * pela correlação cruzada das envolventes da forma de onda (100 amostras/s).
 */
export async function syncAudioToVideo() {
  const s = ed();
  const p = s.project;
  const sel = p.clips.filter((c) => s.selection.includes(c.id));
  const audio = sel.find((c) => c.type === 'audio');
  const video = sel.find((c) => c.type === 'video') ?? p.clips.find((c) => c.type === 'video' && audio && c.start < clipEnd(audio) && clipEnd(c) > audio.start);
  if (!audio || !video) { s.notify('Selecione um clip de áudio e um clip de vídeo (Ctrl+clique)'); return; }
  const ma = getMedia(p, audio.mediaId), mv = getMedia(p, video.mediaId);
  if (!ma?.waveform || !mv?.waveform) { s.notify('As formas de onda ainda estão a ser analisadas'); return; }
  const [wa, wv] = await Promise.all([api.readWaveform(ma.waveform), api.readWaveform(mv.waveform)]);
  const R = 100;
  const seg = (w: number[], c: Clip) => {
    const out: number[] = [];
    const n = Math.floor(c.duration * R);
    for (let i = 0; i < n; i++) out.push(w[Math.floor((c.in + (i / R) * c.speed) * R)] ?? 0);
    const mean = out.reduce((a, b) => a + b, 0) / Math.max(1, out.length);
    return out.map((v) => v - mean);
  };
  const A = seg(wa.peaks, audio), V = seg(wv.peaks, video);
  const maxLag = Math.min(15 * R, Math.max(A.length, V.length));
  let best = 0, bestScore = -Infinity;
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    let sum = 0, n = 0;
    for (let i = 0; i < V.length; i += 1) {
      const j = i - lag;
      if (j < 0 || j >= A.length) continue;
      sum += V[i] * A[j]; n++;
    }
    if (n > R * 2 && sum / Math.sqrt(n) > bestScore) { bestScore = sum / Math.sqrt(n); best = lag; }
  }
  const newStart = video.start + best / R;
  s.commit((d) => { const c = d.clips.find((x) => x.id === audio.id); if (c) c.start = Math.max(0, newStart); });
  s.notify(`Áudio sincronizado (deslocamento ${(best / R).toFixed(2)} s)`, 'success');
}

let saving: Promise<void> | null = null;
export async function saveNow(silent = false) {
  const s = ed();
  if (saving) await saving;
  saving = (async () => {
    try {
      useEditor.setState({ saveState: { status: 'saving', at: s.saveState.at } });
      const file = s.filePath ?? (await api.defaultProjectPath(s.project));
      const r = await api.autosave(useEditor.getState().project, file);
      useEditor.setState({ filePath: file, saveState: { status: 'saved', at: r.savedAt } });
      if (!silent) ed().notify('Projeto guardado', 'success');
    } catch (e: any) {
      useEditor.setState({ saveState: { status: 'error', at: Date.now() } });
      ed().notify(`Erro ao guardar: ${e.message}`, 'error');
    }
  })();
  await saving;
  saving = null;
}

export async function saveAs() {
  const s = ed();
  const f = await api.saveProjectAsDialog(s.project.name);
  if (!f) return;
  await api.saveProject(s.project, f);
  useEditor.setState({ filePath: f, saveState: { status: 'saved', at: Date.now() } });
  await api.beginSession(s.project.id, f);
  ed().notify('Projeto guardado como ' + f, 'success');
}

export async function exportPackage() {
  const dir = await api.chooseFolder('Escolha a pasta para exportar o projeto (com média)');
  if (!dir) return;
  ed().notify('A copiar média…');
  const f = await api.exportPackage(ed().project, dir);
  ed().notify('Projeto exportado para ' + f, 'success');
  api.reveal(f);
}
