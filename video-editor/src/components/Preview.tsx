import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Camera, Maximize, Pause, Play, Repeat, SkipBack, SkipForward, StepBack, StepForward } from 'lucide-react';
import type { AnimProp, Clip } from '@shared/types';
import { fmtTime, projectDuration } from '@shared/timeline';
import { valueAt } from '@shared/animation';
import { useEditor, setKeyframe } from '../store/editor';
import { usePlayback } from '../store/playback';
import { Player, LayerBox } from '../engine/player';
import { api } from '../api';

export let activePlayer: Player | null = null;

/** Define uma propriedade animável: se o clip já tem keyframes para ela, cria/atualiza o keyframe no instante atual. */
export function setAnimProps(clipId: string, values: Partial<Record<AnimProp, number>>, key?: string) {
  const t = usePlayback.getState().time;
  useEditor.getState().commit((d) => {
    const c = d.clips.find((x) => x.id === clipId);
    if (!c) return;
    for (const [prop, value] of Object.entries(values) as [AnimProp, number][]) {
      if (c.keyframes[prop]?.length) setKeyframe(c, prop, Math.max(0, Math.min(c.duration, t - c.start)), value);
      else if (prop === 'volume') c.volume = value;
      else c.transform[prop] = value;
    }
  }, key ?? `${Object.keys(values).join('')}-${clipId}`);
}
export const setAnimProp = (clipId: string, prop: AnimProp, value: number, key?: string) => setAnimProps(clipId, { [prop]: value }, key);

export const currentValue = (c: Clip, prop: AnimProp) => {
  const t = usePlayback.getState().time - c.start;
  const base = prop === 'volume' ? c.volume : c.transform[prop];
  return valueAt(c.keyframes[prop], base, Math.max(0, Math.min(c.duration, t)));
};

export function Preview() {
  const project = useEditor((s) => s.project);
  const useProxies = useEditor((s) => s.settings.useProxies);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [size, setSize] = useState({ w: 640, h: 360 });
  const [error, setError] = useState<string | null>(null);
  const { width: PW, height: PH } = project.settings;

  useEffect(() => {
    try {
      const pl = new Player(canvasRef.current!);
      playerRef.current = pl;
      activePlayer = pl;
      (window as any).__corte = { player: pl, editor: useEditor, playback: usePlayback };
      pl.setProject(useEditor.getState().project, useEditor.getState().settings.useProxies);
    } catch (e: any) { setError(e.message); }
    return () => { playerRef.current?.destroy(); playerRef.current = null; activePlayer = null; };
  }, []);

  useEffect(() => { playerRef.current?.setProject(project, useProxies); }, [project, useProxies]);
  useEffect(() => usePlayback.subscribe((s, prev) => { if (s.time !== prev.time) playerRef.current?.invalidate(); }), []);

  // encaixa o canvas no palco mantendo a proporção do projeto
  useLayoutEffect(() => {
    const el = stageRef.current!;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const availW = r.width - 28, availH = r.height - 28;
      const scale = Math.min(availW / PW, availH / PH);
      const w = Math.max(16, Math.floor(PW * scale)), h = Math.max(16, Math.floor(PH * scale));
      setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [PW, PH]);

  useEffect(() => {
    const pl = playerRef.current;
    if (!pl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // resolução interna: tamanho no ecrã × DPR, limitada à resolução do projeto
    const k = Math.min(1, (PW / (size.w * dpr)));
    pl.comp.resize(Math.round(size.w * dpr * k), Math.round(size.h * dpr * k));
    pl.invalidate();
  }, [size, PW]);

  useEffect(() => {
    const fs = () => stageRef.current?.requestFullscreen();
    document.addEventListener('preview-fullscreen', fs);
    return () => document.removeEventListener('preview-fullscreen', fs);
  }, []);

  return (
    <div className="preview-wrap">
      <div className="preview-stage" ref={stageRef} onDoubleClick={(e) => { if (e.target === stageRef.current) document.fullscreenElement ? document.exitFullscreen() : stageRef.current?.requestFullscreen(); }}>
        <div className="preview-canvas-box" style={{ width: size.w, height: size.h }}>
          <canvas ref={canvasRef} />
          <SelectionOverlay playerRef={playerRef} cssW={size.w} cssH={size.h} />
          {error && <div className="empty-state" style={{ position: 'absolute', inset: 0 }}>Pré-visualização indisponível: {error}</div>}
          {project.clips.length === 0 && (
            <div className="empty-state" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
              <div>Importe vídeos, imagens ou áudio e arraste-os para a timeline.<br />Pode também largar ficheiros diretamente nesta janela.</div>
            </div>
          )}
        </div>
      </div>
      <Transport stageRef={stageRef} playerRef={playerRef} />
    </div>
  );
}

function Transport({ stageRef, playerRef }: { stageRef: React.RefObject<HTMLDivElement>; playerRef: React.MutableRefObject<Player | null> }) {
  const time = usePlayback((s) => s.time);
  const playing = usePlayback((s) => s.playing);
  const rate = usePlayback((s) => s.rate);
  const loop = usePlayback((s) => s.loop);
  const project = useEditor((s) => s.project);
  const fps = project.settings.fps;
  const dur = projectDuration(project);
  const pb = usePlayback.getState();
  const [level, setLevel] = useState(0);
  useEffect(() => {
    let raf = 0;
    const buf = new Uint8Array(512);
    const tick = () => {
      const an = playerRef.current?.analyser;
      if (an) {
        an.getByteTimeDomainData(buf);
        let mx = 0;
        for (const v of buf) mx = Math.max(mx, Math.abs(v - 128));
        setLevel((l) => Math.max(mx / 128, l * 0.9));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playerRef]);

  return (
    <div className="transport">
      <div className="timecode"><b>{fmtTime(time, fps)}</b> / {fmtTime(dur, fps)}</div>
      <div className="row" style={{ gap: 4 }}>
        <button className="icon-btn hide-mobile" title="Início (Home)" onClick={() => pb.seek(0)}><SkipBack size={16} /></button>
        <button className="icon-btn" title="Recuar 1 fotograma (←)" onClick={() => { pb.setPlaying(false); pb.seek(time - 1 / fps); }}><StepBack size={16} /></button>
        <button className="play-btn" title="Reproduzir/Pausar (Espaço)" onClick={() => pb.toggle()}>
          {playing ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: 2 }} />}
        </button>
        <button className="icon-btn" title="Avançar 1 fotograma (→)" onClick={() => { pb.setPlaying(false); pb.seek(time + 1 / fps); }}><StepForward size={16} /></button>
        <button className="icon-btn hide-mobile" title="Fim (End)" onClick={() => pb.seek(dur)}><SkipForward size={16} /></button>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
        <div className="meter hide-mobile" title="Nível de áudio"><div style={{ height: `${Math.min(100, level * 100)}%` }} /></div>
        <select className="input hide-mobile" style={{ width: 74, height: 28 }} value={rate} title="Velocidade de reprodução" onChange={(e) => pb.setRate(parseFloat(e.target.value))}>
          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => <option key={r} value={r}>{r}×</option>)}
        </select>
        <button className={`icon-btn hide-mobile ${loop ? 'active' : ''}`} title="Repetir" onClick={() => usePlayback.setState({ loop: !loop })}><Repeat size={16} /></button>
        <button className="icon-btn hide-mobile" title="Capturar fotograma (PNG)" onClick={async () => {
          const b = await playerRef.current?.snapshot();
          if (!b) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(b); a.download = `fotograma_${fmtTime(time, fps).replace(/:/g, '-')}.png`; a.click();
        }}><Camera size={16} /></button>
        <button className="icon-btn" title="Ecrã inteiro (F)" onClick={() => stageRef.current?.requestFullscreen().catch(() => api.toggleFullscreen())}><Maximize size={16} /></button>
      </div>
    </div>
  );
}

/** Caixa de seleção sobre o vídeo: arrastar para mover, cantos para escalar, pega para rodar. */
function SelectionOverlay({ playerRef, cssW, cssH }: { playerRef: React.MutableRefObject<Player | null>; cssW: number; cssH: number }) {
  const selection = useEditor((s) => s.selection);
  const [box, setBox] = useState<LayerBox | null>(null);
  const selId = selection.length === 1 ? selection[0] : null;
  useEffect(() => {
    const pl = playerRef.current;
    if (!pl) return;
    pl.onFrame = () => setBox(selId ? pl.boxes.get(selId) ?? null : null);
    pl.invalidate();
    return () => { pl.onFrame = undefined; };
  }, [selId, playerRef]);
  const pl = playerRef.current;
  if (!box || !selId || !pl) return null;
  const clip = useEditor.getState().project.clips.find((c) => c.id === selId);
  if (!clip || clip.type === 'audio') return null;
  const k = cssW / pl.comp.W;
  const W = pl.comp.W, H = pl.comp.H;

  const drag = (mode: 'move' | 'scale' | 'rotate') => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    usePlayback.getState().setPlaying(false);
    const x0 = e.clientX, y0 = e.clientY;
    const startX = currentValue(clip, 'x'), startY = currentValue(clip, 'y');
    const startS = currentValue(clip, 'scale'), startR = currentValue(clip, 'rotation');
    const rect = (e.currentTarget as HTMLElement).closest('.preview-canvas-box')!.getBoundingClientRect();
    const cx = rect.left + box.cx * k, cy = rect.top + box.cy * k;
    const d0 = Math.hypot(x0 - cx, y0 - cy);
    const a0 = Math.atan2(y0 - cy, x0 - cx);
    const key = `${mode}-${clip.id}-${Date.now()}`;
    const move = (ev: PointerEvent) => {
      if (mode === 'move') {
        let nx = startX + (ev.clientX - x0) / k / W;
        let ny = startY + (ev.clientY - y0) / k / H;
        if (Math.abs(nx) < 0.01) nx = 0; // íman ao centro
        if (Math.abs(ny) < 0.01) ny = 0;
        setAnimProps(clip.id, { x: nx, y: ny }, key);
      } else if (mode === 'scale') {
        const d = Math.hypot(ev.clientX - cx, ev.clientY - cy);
        setAnimProp(clip.id, 'scale', Math.max(0.02, (startS * d) / Math.max(1, d0)), key);
      } else {
        const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
        let deg = startR + ((a - a0) * 180) / Math.PI;
        if (ev.shiftKey) deg = Math.round(deg / 15) * 15;
        setAnimProp(clip.id, 'rotation', Math.round(deg * 10) / 10, key);
      }
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const w = box.w * k, h = box.h * k;
  return (
    <div className="preview-overlay" style={{ pointerEvents: 'none' }}>
      <div className="sel-box" onPointerDown={drag('move')} style={{
        pointerEvents: 'auto', left: box.cx * k - w / 2, top: box.cy * k - h / 2, width: w, height: h,
        transform: `rotate(${box.rot}rad)`,
      }}>
        {[[-5, -5, 'nwse-resize'], [w - 5, -5, 'nesw-resize'], [-5, h - 5, 'nesw-resize'], [w - 5, h - 5, 'nwse-resize']].map(([l, t, cur], i) => (
          <div key={i} className="h" style={{ left: l as number, top: t as number, cursor: cur as string }} onPointerDown={drag('scale')} />
        ))}
        <div className="rot" title="Rodar (Shift = passos de 15°)" onPointerDown={drag('rotate')} />
      </div>
    </div>
  );
}
