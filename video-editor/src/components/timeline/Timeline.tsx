import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  AudioLines, Blend, Copy, Diamond, Eye, EyeOff, Lock, Magnet, Maximize2, Plus, Scissors, Snowflake, Trash2, Type, Film,
  Unlock, Volume2, VolumeX, ZoomIn, ZoomOut, Unlink, Music, ChevronUp, ChevronDown,
} from 'lucide-react';
import type { Clip, MediaAsset, Project, Track, TrackKind } from '@shared/types';
import { clipEnd, getMedia, prevAdjacent, projectDuration, EPS } from '@shared/timeline';
import { ANIMATABLE, propValue, valueAt } from '@shared/animation';
import { TRANSITIONS } from '@shared/looks';
import {
  useEditor, findFreeTrack, addMediaClip, addTrack, trackKindFor, withLinked, setTransition, overlaps, setKeyframe,
} from '../../store/editor';
import { usePlayback } from '../../store/playback';
import { api, mediaUrl } from '../../api';
import * as A from '../../actions';
import { Waveform } from './Waveform';

const TRACK_H: Record<TrackKind, number> = { video: 66, text: 34, audio: 54 };
const RULER_H = 28;
const SNAP_PX = 8;

interface DragState {
  mode: 'move' | 'trimL' | 'trimR';
  ids: string[];
  primary: string;
  dt: number;
  trackId: string; // pista de destino do clip principal
  snap: number | null;
}

export function Timeline() {
  const project = useEditor((s) => s.project);
  const zoom = useEditor((s) => s.zoom);
  const selection = useEditor((s) => s.selection);
  const transitionSel = useEditor((s) => s.transitionSel);
  const snapping = useEditor((s) => s.settings.snapping);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headsRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ left: 0, width: 1000 });
  const [drag, setDrag] = useState<DragState | null>(null);
  const [dropTrack, setDropTrack] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);
  const dur = projectDuration(project);
  const contentW = Math.max((dur + 30) * zoom, view.width + 200);

  const lanes = useMemo(() => {
    let y = 0;
    return project.tracks.map((t) => { const l = { track: t, y, h: TRACK_H[t.kind] }; y += l.h; return l; });
  }, [project.tracks]);
  const lanesH = lanes.reduce((s, l) => s + l.h, 0);

  const onScroll = () => {
    const el = scrollRef.current!;
    if (headsRef.current) headsRef.current.scrollTop = el.scrollTop;
    setView({ left: el.scrollLeft, width: el.clientWidth });
  };
  useLayoutEffect(() => {
    const el = scrollRef.current!;
    const ro = new ResizeObserver(() => setView({ left: el.scrollLeft, width: el.clientWidth }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // zoom com Ctrl+roda, ancorado ao cursor
  useEffect(() => {
    const el = scrollRef.current!;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const z = useEditor.getState().zoom;
      const t = (el.scrollLeft + x) / z;
      const nz = Math.max(4, Math.min(1200, z * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
      useEditor.getState().setZoom(nz);
      requestAnimationFrame(() => { el.scrollLeft = t * nz - x; });
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, []);

  // segue a cabeça de leitura durante a reprodução
  useEffect(() => usePlayback.subscribe((s) => {
    if (!s.playing) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = s.time * useEditor.getState().zoom;
    if (x > el.scrollLeft + el.clientWidth - 40 || x < el.scrollLeft) el.scrollLeft = x - 80;
  }), []);

  const fitZoom = () => {
    const el = scrollRef.current!;
    useEditor.getState().setZoom(Math.max(4, (el.clientWidth - 60) / Math.max(1, dur)));
    el.scrollLeft = 0;
  };

  const timeAtClientX = (clientX: number) => {
    const el = scrollRef.current!;
    return Math.max(0, (clientX - el.getBoundingClientRect().left + el.scrollLeft) / zoom);
  };
  const trackAtClientY = (clientY: number): Track | null => {
    const el = scrollRef.current!;
    const y = clientY - el.getBoundingClientRect().top + el.scrollTop - RULER_H;
    const l = lanes.find((x) => y >= x.y && y < x.y + x.h);
    return l?.track ?? null;
  };

  // ---------- arrastar / aparar clips ----------
  const startClipDrag = (e: React.PointerEvent, clip: Clip, mode: DragState['mode']) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const st = useEditor.getState();
    const additive = e.shiftKey || e.ctrlKey || e.metaKey;
    let sel = st.selection;
    if (additive) { st.select([clip.id], true); return; }
    if (!sel.includes(clip.id)) { st.select([clip.id]); sel = [clip.id]; }
    const p = st.project;
    const track = p.tracks.find((t) => t.id === clip.trackId);
    if (track?.locked) return;
    const ids = withLinked(p, mode === 'move' ? sel : [clip.id]).filter((id) => !p.tracks.find((t) => t.id === p.clips.find((c) => c.id === id)?.trackId)?.locked);
    const orig = new Map(p.clips.filter((c) => ids.includes(c.id)).map((c) => [c.id, { ...c }]));
    const t = usePlayback.getState().time;
    const points = [0, t, ...p.markers];
    for (const c of p.clips) if (!ids.includes(c.id)) points.push(c.start, clipEnd(c));
    const x0 = e.clientX;
    const fps = p.settings.fps;
    const minDur = 1 / fps;
    let moved = false;
    let state: DragState = { mode, ids, primary: clip.id, dt: 0, trackId: clip.trackId, snap: null };

    const snapDelta = (edges: number[]): { d: number; at: number | null } => {
      if (!useEditor.getState().settings.snapping) return { d: 0, at: null };
      let best = SNAP_PX / zoom, d = 0, at: number | null = null;
      for (const e of edges) for (const pt of points) {
        if (Math.abs(pt - e) < best) { best = Math.abs(pt - e); d = pt - e; at = pt; }
      }
      return { d, at };
    };

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0;
      if (!moved && Math.abs(dx) < 3 && mode === 'move' && Math.abs(ev.movementY) < 3) return;
      moved = true;
      let dt = dx / zoom;
      const o = orig.get(clip.id)!;
      const m = getMedia(p, o.mediaId);
      let trackId = clip.trackId;
      let snap: number | null = null;
      if (mode === 'move') {
        const edges = Array.from(orig.values()).flatMap((c) => [c.start + dt, c.start + dt + c.duration]);
        const s = snapDelta(edges);
        dt += s.d; snap = s.at;
        const minStart = Math.min(...Array.from(orig.values()).map((c) => c.start));
        dt = Math.max(dt, -minStart);
        const over = trackAtClientY(ev.clientY);
        if (over && over.kind === trackKindFor(o) && !over.locked) trackId = over.id;
      } else {
        // limites: média de origem e clips vizinhos na mesma pista
        const neighbors = p.clips.filter((c) => c.trackId === o.trackId && !ids.includes(c.id));
        if (mode === 'trimL') {
          const prevEnd = Math.max(0, ...neighbors.filter((c) => clipEnd(c) <= o.start + EPS).map(clipEnd));
          let ns = o.start + dt;
          const s = snapDelta([ns]); ns += s.d; snap = s.at;
          ns = Math.max(ns, prevEnd);
          if (o.type === 'video' || o.type === 'audio') ns = Math.max(ns, o.start - o.in / o.speed);
          ns = Math.min(ns, o.start + o.duration - minDur);
          dt = ns - o.start;
        } else {
          const nextStart = Math.min(Infinity, ...neighbors.filter((c) => c.start >= clipEnd(o) - EPS).map((c) => c.start));
          let ne = o.start + o.duration + dt;
          const s = snapDelta([ne]); ne += s.d; snap = s.at;
          ne = Math.min(ne, nextStart);
          if ((o.type === 'video' || o.type === 'audio') && m) ne = Math.min(ne, o.start + (m.duration - o.in) / o.speed);
          ne = Math.max(ne, o.start + minDur);
          dt = ne - (o.start + o.duration);
        }
      }
      state = { ...state, dt, trackId, snap };
      setDrag(state);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDrag(null);
      if (!moved || (Math.abs(state.dt) < 1e-6 && state.trackId === clip.trackId)) return;
      useEditor.getState().commit((d) => {
        for (const id of ids) {
          const c = d.clips.find((x) => x.id === id);
          const o = orig.get(id);
          if (!c || !o) continue;
          if (mode === 'move') {
            c.start = Math.max(0, o.start + state.dt);
            if (id === clip.id) c.trackId = state.trackId;
          } else if (mode === 'trimL') {
            c.start = o.start + state.dt;
            c.duration = o.duration - state.dt;
            c.in = Math.max(0, o.in + state.dt * o.speed);
            // keyframes acompanham o novo início
            for (const k of ANIMATABLE) if (c.keyframes[k]) c.keyframes[k] = c.keyframes[k]!.map((f) => ({ ...f, t: f.t - state.dt })).filter((f) => f.t >= -1e-3);
          } else {
            c.duration = o.duration + state.dt;
          }
        }
        if (mode === 'move') {
          // resolve sobreposições: procura (ou cria) uma pista livre
          for (const id of ids) {
            const c = d.clips.find((x) => x.id === id)!;
            if (overlaps(d as Project, c.trackId, c.start, clipEnd(c as Clip), ids)) {
              c.trackId = findFreeTrack(d, trackKindFor(c), c.start, clipEnd(c as Clip), undefined, ids);
            }
          }
        }
        for (const c of d.clips) if (c.transitionIn && !prevAdjacent(d as Project, c as Clip)) c.transitionIn = null;
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // ---------- largar média / ficheiros ----------
  const onLaneDrop = async (e: React.DragEvent, track: Track) => {
    e.preventDefault();
    setDropTrack(null);
    const t = timeAtClientX(e.clientX);
    const mediaId = e.dataTransfer.getData('application/x-media-id');
    if (mediaId) {
      const m = useEditor.getState().project.media.find((x) => x.id === mediaId);
      if (!m) return;
      useEditor.getState().commit((d) => {
        const kind: TrackKind = m.kind === 'audio' ? 'audio' : 'video';
        const c = addMediaClip(d, m, t, track.kind === kind ? track.id : undefined);
        useEditor.setState({ selection: [c.id] });
      });
      return;
    }
    const preset = e.dataTransfer.getData('application/x-text-preset');
    if (preset) {
      document.dispatchEvent(new CustomEvent('add-text-preset', { detail: { preset, at: t } }));
      return;
    }
    if (e.dataTransfer.files.length) {
      const paths = Array.from(e.dataTransfer.files).map((f) => api.pathForFile(f)).filter(Boolean);
      A.importPaths(paths, { at: t, trackId: track.id });
    }
  };

  const clipMenu = (e: React.MouseEvent, c: Clip) => {
    e.preventDefault();
    const st = useEditor.getState();
    if (!st.selection.includes(c.id)) st.select([c.id]);
    const items: MenuItem[] = [
      { label: 'Dividir no cursor', icon: <Scissors size={14} />, kbd: 'S', run: A.splitAtPlayhead },
      { label: 'Duplicar', icon: <Copy size={14} />, kbd: 'Ctrl D', run: A.duplicateSelection },
      { label: 'Copiar', kbd: 'Ctrl C', run: A.copySelection },
      { label: 'Colar no cursor', kbd: 'Ctrl V', run: A.paste },
    ];
    if (c.type === 'video') items.push({ label: 'Congelar fotograma', icon: <Snowflake size={14} />, run: A.freezeFrame }, { label: 'Separar áudio', icon: <AudioLines size={14} />, run: A.extractAudio });
    if (c.type === 'video' || c.type === 'audio') items.push({ label: c.muted ? 'Ativar som' : 'Remover áudio (silenciar)', icon: c.muted ? <Volume2 size={14} /> : <VolumeX size={14} />, run: A.toggleMute });
    if (c.type === 'audio') items.push({ label: 'Sincronizar com vídeo (forma de onda)', icon: <AudioLines size={14} />, run: A.syncAudioToVideo });
    if (c.linkId) items.push({ label: 'Desligar áudio/vídeo', icon: <Unlink size={14} />, run: A.unlinkSelection });
    items.push({ label: 'Apagar', icon: <Trash2 size={14} />, kbd: 'Del', run: () => A.deleteSelection(false), danger: true });
    items.push({ label: 'Apagar e fechar espaço', kbd: 'Shift Del', run: () => A.deleteSelection(true), danger: true });
    setMenu({ x: e.clientX, y: e.clientY, items });
  };

  const trackMenu = (e: React.MouseEvent, t: Track) => {
    e.preventDefault();
    const moveTrack = (dir: -1 | 1) => useEditor.getState().commit((d) => {
      const i = d.tracks.findIndex((x) => x.id === t.id);
      const j = i + dir;
      if (j < 0 || j >= d.tracks.length) return;
      [d.tracks[i], d.tracks[j]] = [d.tracks[j], d.tracks[i]];
    });
    setMenu({
      x: e.clientX, y: e.clientY, items: [
        { label: 'Mover para cima (camada superior)', icon: <ChevronUp size={14} />, run: () => moveTrack(-1) },
        { label: 'Mover para baixo', icon: <ChevronDown size={14} />, run: () => moveTrack(1) },
        { label: 'Apagar pista e clips', icon: <Trash2 size={14} />, danger: true, run: () => useEditor.getState().commit((d) => {
          d.clips = d.clips.filter((c) => c.trackId !== t.id);
          d.tracks = d.tracks.filter((x) => x.id !== t.id);
          if (!d.tracks.some((x) => x.kind === 'video')) addTrack(d, 'video');
        }) },
      ],
    });
  };

  const addKeyframesHere = () => {
    const st = useEditor.getState();
    const t = usePlayback.getState().time;
    const clips = st.project.clips.filter((c) => st.selection.includes(c.id) && t >= c.start && t <= clipEnd(c));
    if (!clips.length) { st.notify('Selecione um clip sob o cursor para adicionar keyframes'); return; }
    st.commit((d) => {
      for (const c of d.clips) {
        if (!st.selection.includes(c.id) || t < c.start || t > clipEnd(c as Clip)) continue;
        const props = c.type === 'audio' ? (['volume'] as const) : (['x', 'y', 'scale', 'rotation', 'opacity'] as const);
        for (const p of props) setKeyframe(c, p, t - c.start, valueAt(c.keyframes[p], propValue(c as Clip, p), t - c.start));
      }
    });
    st.notify('Keyframes adicionados no cursor (posição, escala, rotação, opacidade)', 'success');
  };

  const selClips = project.clips.filter((c) => selection.includes(c.id));
  const hasSel = selClips.length > 0;

  return (
    <>
      <div className="tl-toolbar">
        <button className="icon-btn" title="Dividir (S)" onClick={A.splitAtPlayhead}><Scissors size={16} /></button>
        <button className="icon-btn" title="Apagar (Del)" disabled={!hasSel && !transitionSel} onClick={() => A.deleteSelection(false)}><Trash2 size={16} /></button>
        <button className="icon-btn" title="Duplicar (Ctrl+D)" disabled={!hasSel} onClick={A.duplicateSelection}><Copy size={16} /></button>
        <button className="icon-btn" title="Congelar fotograma" onClick={A.freezeFrame}><Snowflake size={16} /></button>
        <button className="icon-btn" title="Separar áudio do vídeo" disabled={!selClips.some((c) => c.type === 'video')} onClick={A.extractAudio}><AudioLines size={16} /></button>
        <button className="icon-btn" title="Silenciar / ativar som do clip" disabled={!selClips.some((c) => c.type !== 'text' && c.type !== 'image')} onClick={A.toggleMute}><VolumeX size={16} /></button>
        <button className="icon-btn" title="Adicionar keyframes no cursor" disabled={!hasSel} onClick={addKeyframesHere}><Diamond size={16} /></button>
        <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 6px' }} />
        <button className={`icon-btn ${snapping ? 'active' : ''}`} title="Íman (snap automático)" onClick={() => useEditor.getState().setSettings({ snapping: !snapping })}><Magnet size={16} /></button>
        <button className="btn sm ghost" title="Nova pista de vídeo" onClick={() => useEditor.getState().commit((d) => { addTrack(d, 'video'); })}><Plus size={13} /><Film size={13} /></button>
        <button className="btn sm ghost" title="Nova pista de áudio" onClick={() => useEditor.getState().commit((d) => { addTrack(d, 'audio'); })}><Plus size={13} /><Music size={13} /></button>
        <button className="btn sm ghost" title="Nova pista de texto" onClick={() => useEditor.getState().commit((d) => { addTrack(d, 'text'); })}><Plus size={13} /><Type size={13} /></button>
        <div style={{ flex: 1 }} />
        <button className="icon-btn" title="Afastar (-)" onClick={() => useEditor.getState().setZoom(zoom / 1.25)}><ZoomOut size={16} /></button>
        <input type="range" min={0} max={100} step={0.5} style={{ width: 130, ['--fill' as any]: `${(Math.log(zoom / 4) / Math.log(300)) * 100}%` }}
          value={(Math.log(zoom / 4) / Math.log(300)) * 100} onChange={(e) => useEditor.getState().setZoom(4 * Math.pow(300, parseFloat(e.target.value) / 100))} />
        <button className="icon-btn" title="Aproximar (+)" onClick={() => useEditor.getState().setZoom(zoom * 1.25)}><ZoomIn size={16} /></button>
        <button className="icon-btn" title="Ajustar ao projeto" onClick={fitZoom}><Maximize2 size={15} /></button>
      </div>
      <div className="tl-body">
        <div className="tl-heads" ref={headsRef}>
          <div className="tl-heads-inner">
            {lanes.map(({ track, h }) => <TrackHead key={track.id} track={track} h={h} onMenu={(e) => trackMenu(e, track)} />)}
            <div style={{ height: 200 }} />
          </div>
        </div>
        <div className="tl-scroll" ref={scrollRef} onScroll={onScroll}
          onPointerDown={(e) => { if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('lane')) useEditor.getState().select([]); }}>
          <div className="tl-content" style={{ width: contentW, height: lanesH + RULER_H + 200 }}>
            <Ruler zoom={zoom} view={view} width={contentW} markers={project.markers} fps={project.settings.fps} onSeek={(t) => usePlayback.getState().seek(t)} />
            {lanes.map(({ track, h }) => (
              <div key={track.id} className={`lane ${dropTrack === track.id ? 'drop' : ''} ${track.locked ? 'locked' : ''}`} style={{ height: h }}
                onDragOver={(e) => { e.preventDefault(); setDropTrack(track.id); }}
                onDragLeave={() => setDropTrack(null)}
                onDrop={(e) => onLaneDrop(e, track)}>
                {project.clips.filter((c) => c.trackId === track.id || (drag?.primary === c.id && drag.mode === 'move' && drag.trackId === track.id)).map((c) => {
                  if (drag?.primary === c.id && drag.mode === 'move' && drag.trackId !== track.id) return null;
                  return (
                    <ClipView key={c.id} clip={c} project={project} zoom={zoom} view={view} h={h}
                      selected={selection.includes(c.id)} drag={drag?.ids.includes(c.id) ? drag : null} dim={track.hidden || (track.muted && c.type === 'audio')}
                      onPointerDown={startClipDrag} onContextMenu={clipMenu} />
                  );
                })}
                {project.clips.filter((c) => c.trackId === track.id && track.kind !== 'audio').map((c) => {
                  const prev = prevAdjacent(project, c);
                  if (!prev || drag) return null;
                  return (
                    <div key={`tr-${c.id}`} className={`trans ${c.transitionIn ? '' : 'empty'} ${transitionSel === c.id ? 'on' : ''}`}
                      style={{ left: c.start * zoom }} title={c.transitionIn ? `Transição: ${TRANSITIONS.find((x) => x.type === c.transitionIn!.type)?.name}` : 'Adicionar transição'}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!c.transitionIn) useEditor.getState().commit((d) => { setTransition(d, c.id, { type: 'dissolve', duration: 0.5 }); });
                        useEditor.getState().selectTransition(c.id);
                      }}>
                      <Blend size={13} />
                    </div>
                  );
                })}
              </div>
            ))}
            <Playhead zoom={zoom} height={lanesH + RULER_H} />
            {drag?.snap != null && <div className="snapline" style={{ left: drag.snap * zoom, height: lanesH + RULER_H }} />}
          </div>
        </div>
      </div>
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </>
  );
}

function TrackHead({ track, h, onMenu }: { track: Track; h: number; onMenu: (e: React.MouseEvent) => void }) {
  const [editing, setEditing] = useState(false);
  const upd = (fn: (t: Track) => void) => useEditor.getState().commit((d) => { const t = d.tracks.find((x) => x.id === track.id); if (t) fn(t); });
  const icon = track.kind === 'video' ? <Film size={13} /> : track.kind === 'audio' ? <Music size={13} /> : <Type size={13} />;
  return (
    <div className="tl-head" style={{ height: h }} onContextMenu={onMenu}>
      <span style={{ color: 'var(--text3)', display: 'flex' }}>{icon}</span>
      <div className="name" onDoubleClick={() => setEditing(true)} title={`${track.name} — duplo clique para renomear, botão direito para mais opções`}>
        {editing ? (
          <input autoFocus defaultValue={track.name} onBlur={(e) => { upd((t) => { t.name = e.target.value || t.name; }); setEditing(false); }}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
        ) : track.name}
      </div>
      {track.kind !== 'audio' && (
        <button className={`icon-btn sm ${track.hidden ? 'active' : ''}`} title={track.hidden ? 'Mostrar pista' : 'Ocultar pista'} onClick={() => upd((t) => { t.hidden = !t.hidden; })}>
          {track.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      )}
      {track.kind !== 'text' && (
        <button className={`icon-btn sm ${track.muted ? 'active' : ''}`} title={track.muted ? 'Ativar som' : 'Silenciar pista'} onClick={() => upd((t) => { t.muted = !t.muted; })}>
          {track.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
      )}
      <button className={`icon-btn sm ${track.locked ? 'active' : ''}`} title={track.locked ? 'Desbloquear' : 'Bloquear pista'} onClick={() => upd((t) => { t.locked = !t.locked; })}>
        {track.locked ? <Lock size={13} /> : <Unlock size={13} />}
      </button>
    </div>
  );
}

function ClipView({ clip, project, zoom, view, h, selected, drag, dim, onPointerDown, onContextMenu }: {
  clip: Clip; project: Project; zoom: number; view: { left: number; width: number }; h: number; selected: boolean;
  drag: DragState | null; dim: boolean;
  onPointerDown: (e: React.PointerEvent, c: Clip, mode: DragState['mode']) => void;
  onContextMenu: (e: React.MouseEvent, c: Clip) => void;
}) {
  let start = clip.start, duration = clip.duration, inPt = clip.in;
  if (drag) {
    if (drag.mode === 'move') start = Math.max(0, clip.start + drag.dt);
    else if (drag.mode === 'trimL') { start = clip.start + drag.dt; duration = clip.duration - drag.dt; inPt = clip.in + drag.dt * clip.speed; }
    else duration = clip.duration + drag.dt;
  }
  const m = getMedia(project, clip.mediaId);
  const left = start * zoom, width = Math.max(2, duration * zoom);
  const kfTimes = Array.from(new Set(Object.values(clip.keyframes).flatMap((k) => (k ?? []).map((f) => f.t)))).filter((t) => t <= duration);
  const badges: string[] = [];
  if (clip.speed !== 1) badges.push(`${+clip.speed.toFixed(2)}×`);
  if (clip.effects.length || clip.filter) badges.push('fx');
  if (clip.animIn.type !== 'none' || clip.animOut.type !== 'none' || clip.motion.type !== 'none') badges.push('anim');
  return (
    <div className={`clip ${clip.type} ${selected ? 'sel' : ''} ${drag ? 'ghost' : ''} ${dim ? 'dim' : ''}`}
      style={{ left, width }}
      onPointerDown={(e) => onPointerDown(e, clip, 'move')}
      onContextMenu={(e) => onContextMenu(e, clip)}
      onDoubleClick={() => usePlayback.getState().seek(clip.start)}>
      {clip.type === 'video' && m?.filmstrip && <Filmstrip m={m} clip={{ ...clip, in: inPt }} left={left} width={width} zoom={zoom} view={view} h={h - 6} />}
      {clip.type === 'video' && !m?.filmstrip && m?.thumbnail && <div className="strip"><div style={{ width: '100%', backgroundImage: `url("${mediaUrl(m.thumbnail)}")`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x' }} /></div>}
      {clip.type === 'image' && m?.thumbnail && <div className="strip"><div style={{ width: '100%', backgroundImage: `url("${mediaUrl(m.thumbnail)}")`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x' }} /></div>}
      {(clip.type === 'audio' || (clip.type === 'video' && !clip.muted)) && m?.waveform && (
        <Waveform file={m.waveform} inPt={inPt} speed={clip.speed} duration={duration} left={left} width={width} zoom={zoom} view={view}
          height={clip.type === 'audio' ? h - 22 : 16} color={clip.type === 'audio' ? 'rgba(160,255,200,.75)' : 'rgba(255,255,255,.55)'} volume={clip.volume} />
      )}
      {clip.type === 'audio' && clip.fadeIn > 0 && <div className="fade" style={{ left: 0, width: clip.fadeIn * zoom, background: 'linear-gradient(to bottom right, rgba(0,0,0,.45) 50%, transparent 50%)' }} />}
      {clip.type === 'audio' && clip.fadeOut > 0 && <div className="fade" style={{ right: 0, width: clip.fadeOut * zoom, background: 'linear-gradient(to bottom left, rgba(0,0,0,.45) 50%, transparent 50%)' }} />}
      <div className="label">
        {clip.muted && clip.type !== 'image' && <VolumeX size={11} />}
        {clip.linkId && <span title="Ligado">🔗</span>}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{clip.type === 'text' ? clip.text : clip.name ?? m?.name}</span>
        {badges.map((b) => <span key={b} className="chip" style={{ height: 15, fontSize: 10, background: 'rgba(0,0,0,.5)' }}>{b}</span>)}
      </div>
      {selected && kfTimes.map((t) => <div key={t} className="kfd" style={{ left: t * zoom }} />)}
      <div className="handle l" onPointerDown={(e) => onPointerDown(e, clip, 'trimL')} />
      <div className="handle r" onPointerDown={(e) => onPointerDown(e, clip, 'trimR')} />
    </div>
  );
}

/** Miniaturas do clip (só as visíveis no ecrã são desenhadas). */
function Filmstrip({ m, clip, left, width, zoom, view, h }: { m: MediaAsset; clip: Clip; left: number; width: number; zoom: number; view: { left: number; width: number }; h: number }) {
  const tileW = Math.max(30, Math.round(h * 16 / 9));
  const count = m.filmstrip!.count;
  const url = mediaUrl(m.filmstrip!.path);
  const first = Math.max(0, Math.floor((view.left - left) / tileW) - 1);
  const last = Math.min(Math.ceil(width / tileW), Math.ceil((view.left + view.width - left) / tileW) + 1);
  const tiles: React.ReactNode[] = [];
  for (let i = first; i < last; i++) {
    const t = clip.in + ((i * tileW) / zoom) * clip.speed;
    const idx = Math.min(count - 1, Math.max(0, Math.floor((t / Math.max(0.001, m.duration)) * count)));
    tiles.push(<div key={i} style={{
      position: 'absolute', left: i * tileW, width: tileW, height: '100%',
      backgroundImage: `url("${url}")`, backgroundSize: `${count * tileW}px 100%`, backgroundPosition: `-${idx * tileW}px 0`,
    }} />);
  }
  return <div className="strip">{tiles}</div>;
}

function Playhead({ zoom, height }: { zoom: number; height: number }) {
  const time = usePlayback((s) => s.time);
  return <div className="playhead" style={{ left: time * zoom, height }} />;
}

function Ruler({ zoom, view, width, markers, fps, onSeek }: { zoom: number; view: { left: number; width: number }; width: number; markers: number[]; fps: number; onSeek: (t: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const dpr = window.devicePixelRatio || 1;
    c.width = view.width * dpr; c.height = RULER_H * dpr;
    c.style.width = `${view.width}px`; c.style.height = `${RULER_H}px`;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, view.width, RULER_H);
    const steps = [1 / fps, 2 / fps, 5 / fps, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    const major = steps.find((s) => s * zoom >= 80) ?? 600;
    const minor = major / 5;
    ctx.fillStyle = '#6b7283';
    ctx.font = '10px Inter';
    const i0 = Math.floor(view.left / zoom / minor);
    for (let i = i0; i * minor * zoom < view.left + view.width; i++) {
      const t = Math.round(i * minor * fps * 1000) / (fps * 1000);
      const x = t * zoom - view.left;
      const isMajor = i % 5 === 0;
      ctx.fillRect(Math.round(x), isMajor ? 12 : 20, 1, isMajor ? 16 : 8);
      if (isMajor) {
        const tt = t + 1e-6;
        const mm = Math.floor(tt / 60), ss = Math.floor(tt % 60), ff = Math.floor((tt % 1) * fps);
        ctx.fillText(major < 1 ? `${mm}:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}` : `${mm}:${String(ss).padStart(2, '0')}`, x + 4, 10);
      }
    }
  }, [zoom, view, fps]);
  const scrub = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const at = (x: number) => Math.max(0, (x - r.left) / zoom);
    usePlayback.getState().setPlaying(false);
    onSeek(at(e.clientX));
    const move = (ev: PointerEvent) => onSeek(at(ev.clientX));
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="ruler" style={{ width }} onPointerDown={scrub}>
      <canvas ref={ref} style={{ position: 'sticky', left: 0 }} />
      {markers.map((m, i) => <div key={i} className="marker" style={{ left: m * zoom }} title={`Marcador ${i + 1} (duplo clique para remover)`}
        onDoubleClick={(e) => { e.stopPropagation(); useEditor.getState().commit((d) => { d.markers.splice(i, 1); }); }} />)}
    </div>
  );
}

export interface MenuItem { label: string; icon?: React.ReactNode; kbd?: string; run: () => void; danger?: boolean }

export function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: MenuItem[]; onClose: () => void }) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('pointerdown', close);
    window.addEventListener('blur', close);
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('blur', close); };
  }, [onClose]);
  const top = Math.min(y, window.innerHeight - items.length * 32 - 16);
  return (
    <div style={{ position: 'fixed', left: x, top, zIndex: 80, background: 'var(--bg3)', border: '1px solid var(--line2)', borderRadius: 8, padding: 4, minWidth: 220, boxShadow: 'var(--shadow)', animation: 'pop .12s' }}
      onPointerDown={(e) => e.stopPropagation()}>
      {items.map((it, i) => (
        <div key={i} className="row" style={{ padding: '6px 10px', borderRadius: 5, cursor: 'pointer', color: it.danger ? 'var(--red)' : undefined }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg4)')} onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          onClick={() => { onClose(); it.run(); }}>
          <span style={{ width: 16, display: 'flex' }}>{it.icon}</span>
          <span className="grow">{it.label}</span>
          {it.kbd && <span className="small muted">{it.kbd}</span>}
        </div>
      ))}
    </div>
  );
}

