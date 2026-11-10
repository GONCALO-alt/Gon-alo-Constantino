// Motor de reprodução: relógio mestre, pool de elementos de média sincronizados com a
// timeline, mistura de áudio (Web Audio) e desenho de cada fotograma no compositor WebGL.
import type { Clip, MediaAsset, Project } from '@shared/types';
import { AnimExprs, clipAnimation, volumeExpr } from '@shared/animation';
import { evalExpr, Expr, rangeOf } from '@shared/expr';
import { baseSize } from '@shared/geometry';
import { pixelGrid, posterLevels, chromaShift, glowSigma, scanStrength, scanPeriod, barsFraction, blurSigma, eqParams, filterMono, filterSaturation, getFilter, glitchShift, grainStrength, sharpenAmount, tempTintGains, vignetteAngle } from '@shared/looks';
import { clipEnd, getMedia, projectDuration, sourceTimeAt, transitionTail } from '@shared/timeline';
import { mediaUrl } from '../api';
import { usePlayback } from '../store/playback';
import { Compositor } from './compositor';
import { fontString, renderText, RenderedText } from './text';

interface Entry {
  el: HTMLVideoElement | HTMLAudioElement;
  src: string;
  gain: GainNode;
  node: MediaElementAudioSourceNode;
  kind: 'video' | 'audio';
}

interface Prepared {
  anim: AnimExprs;
  vol: Expr;
  tail: number;
  blurMax: number;
  glitchMax: number;
}

export interface LayerBox { cx: number; cy: number; w: number; h: number; rot: number }

export class Player {
  comp: Compositor;
  actx: AudioContext;
  master: GainNode;
  analyser: AnalyserNode;
  pool = new Map<string, Entry>();
  images = new Map<string, HTMLImageElement>();
  texts = new Map<string, { key: string; r: RenderedText; ver: number }>();
  prepared = new Map<string, Prepared>();
  project: Project | null = null;
  useProxies = true;
  dirty = true;
  raf = 0;
  wasPlaying = false;
  clockStart = 0;
  timeStart = 0;
  lastSet = -1;
  boxes = new Map<string, LayerBox>();
  onFrame?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.comp = new Compositor(canvas);
    this.actx = new AudioContext({ latencyHint: 'interactive' });
    this.master = this.actx.createGain();
    this.analyser = this.actx.createAnalyser();
    this.analyser.fftSize = 512;
    this.master.connect(this.analyser);
    this.analyser.connect(this.actx.destination);
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    for (const e of this.pool.values()) { e.el.pause(); e.el.removeAttribute('src'); e.el.load(); }
    this.pool.clear();
    this.actx.close();
  }

  setProject(p: Project, useProxies: boolean) {
    const mediaChanged = this.project?.media !== p.media || this.useProxies !== useProxies;
    this.project = p;
    this.useProxies = useProxies;
    this.prepared.clear();
    for (const c of p.clips) {
      const anim = clipAnimation(p, c);
      const tail = transitionTail(p, c);
      const vis = c.duration + tail;
      this.prepared.set(c.id, {
        anim, vol: volumeExpr(c), tail,
        blurMax: rangeOf(anim.blur, 0, vis).max,
        glitchMax: rangeOf(anim.glitch, 0, vis, 600).max,
      });
    }
    if (mediaChanged) for (const [id, e] of this.pool) {
      const c = p.clips.find((x) => x.id === id);
      const m = c && getMedia(p, c.mediaId);
      if (!c || !m || this.srcFor(m) !== e.src) this.release(id);
    }
    this.dirty = true;
  }

  invalidate() { this.dirty = true; }

  srcFor(m: MediaAsset) {
    const proxy = this.useProxies && m.proxyStatus === 'ready' && m.proxyPath;
    return mediaUrl(proxy ? m.proxyPath! : m.path);
  }

  private ensure(c: Clip, m: MediaAsset): Entry {
    let e = this.pool.get(c.id);
    const src = this.srcFor(m);
    if (e && e.src === src) return e;
    if (e) this.release(c.id);
    const el = document.createElement(c.type === 'audio' ? 'audio' : 'video') as HTMLVideoElement;
    el.crossOrigin = 'anonymous';
    el.preload = 'auto';
    el.playsInline = true;
    el.src = src;
    el.addEventListener('seeked', () => { this.dirty = true; });
    el.addEventListener('loadeddata', () => { this.dirty = true; });
    const node = this.actx.createMediaElementSource(el);
    const gain = this.actx.createGain();
    gain.gain.value = 0;
    node.connect(gain);
    gain.connect(this.master);
    e = { el, src, gain, node, kind: c.type === 'audio' ? 'audio' : 'video' };
    this.pool.set(c.id, e);
    return e;
  }

  private release(id: string) {
    const e = this.pool.get(id);
    if (!e) return;
    e.el.pause();
    try { e.node.disconnect(); e.gain.disconnect(); } catch { /* */ }
    e.el.removeAttribute('src');
    e.el.load();
    this.pool.delete(id);
    this.comp.dropTexture(`v:${id}`);
  }

  private image(m: MediaAsset): HTMLImageElement {
    let img = this.images.get(m.id);
    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { this.dirty = true; };
      img.src = mediaUrl(m.path);
      this.images.set(m.id, img);
    }
    return img;
  }

  private text(c: Clip, H: number) {
    const spec = fontString(c.style!, 40);
    const ready = document.fonts.check(spec, c.text || 'A');
    if (!ready) document.fonts.load(spec, c.text || 'A').then(() => { this.texts.delete(c.id); this.dirty = true; }).catch(() => undefined);
    const key = JSON.stringify([c.text, c.style, Math.round(H), ready]);
    const cur = this.texts.get(c.id);
    if (cur && cur.key === key) return cur;
    const r = renderText(c.text ?? '', c.style!, H, cur?.r.canvas);
    const entry = { key, r, ver: (cur?.ver ?? 0) + 1 };
    this.texts.set(c.id, entry);
    return entry;
  }

  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const p = this.project;
    if (!p) return;
    const pb = usePlayback.getState();
    let t = pb.time;
    const dur = projectDuration(p);
    if (pb.playing) {
      if (!this.wasPlaying || Math.abs(pb.time - this.lastSet) > 1e-6) {
        this.clockStart = now;
        this.timeStart = pb.time >= dur - 0.01 ? 0 : pb.time;
        if (this.actx.state !== 'running') this.actx.resume();
      }
      t = this.timeStart + ((now - this.clockStart) / 1000) * pb.rate;
      if (t >= dur) {
        if (pb.loop && dur > 0) { t = 0; this.clockStart = now; this.timeStart = 0; }
        else { t = dur; usePlayback.setState({ playing: false }); }
      }
      this.lastSet = t;
      usePlayback.setState({ time: t });
      this.dirty = true;
    }
    this.wasPlaying = pb.playing && t < dur;
    this.sync(p, t, this.wasPlaying, pb.rate);
    if (this.dirty) {
      this.dirty = false;
      this.draw(p, t);
      this.onFrame?.();
    }
  };

  private sync(p: Project, t: number, playing: boolean, rate: number) {
    const near = new Set<string>();
    const fps = p.settings.fps;
    for (const c of p.clips) {
      if (c.type !== 'video' && c.type !== 'audio') continue;
      const m = getMedia(p, c.mediaId);
      const track = p.tracks.find((x) => x.id === c.trackId);
      if (!m || !track) continue;
      const needVideo = c.type === 'video' && !track.hidden;
      const needAudio = !track.muted && !c.muted && m.hasAudio;
      if (!needVideo && !needAudio) continue;
      const prep = this.prepared.get(c.id);
      const end = clipEnd(c) + (needVideo ? prep?.tail ?? 0 : 0);
      const preroll = playing ? 2 : 0.5;
      if (t < c.start - preroll || t >= end) continue;
      near.add(c.id);
      const e = this.ensure(c, m);
      const active = t >= c.start;
      const maxT = Math.max(0, (m.duration || 0) - 0.05);
      const desired = Math.min(maxT, Math.max(0, active ? sourceTimeAt(c, t) : c.in));
      const audible = active && needAudio && t < clipEnd(c);
      const vol = audible && prep ? evalExpr(prep.vol, t - c.start) : 0;
      if (Math.abs(e.gain.gain.value - vol) > 0.001) e.gain.gain.setTargetAtTime(vol, this.actx.currentTime, 0.015);
      if (playing && active && desired < maxT) {
        const pr = Math.min(16, Math.max(0.0625, c.speed * rate));
        if (Math.abs(e.el.playbackRate - pr) > 1e-3) e.el.playbackRate = pr;
        if (e.el.paused) {
          e.el.currentTime = desired;
          e.el.play().catch(() => undefined);
        } else if (!e.el.seeking && Math.abs(e.el.currentTime - desired) > 0.3) {
          e.el.currentTime = desired;
        }
      } else {
        if (!e.el.paused) e.el.pause();
        if (!e.el.seeking && Math.abs(e.el.currentTime - desired) > 0.5 / fps) e.el.currentTime = desired;
      }
    }
    for (const id of Array.from(this.pool.keys())) if (!near.has(id)) this.release(id);
  }

  /** Geometria e parâmetros de uma camada num instante (partilhado pelo desenho e pelas caixas de seleção). */
  private layer(p: Project, c: Clip, t: number, W: number, H: number, dims?: { width: number; height: number }) {
    const prep = this.prepared.get(c.id);
    if (!prep) return null;
    const T = t - c.start;
    if (T < 0 || T >= c.duration + prep.tail) return null;
    const a = prep.anim;
    const m = getMedia(p, c.mediaId);
    const bs = baseSize(c, m, W, H, dims);
    const s = evalExpr(a.scale, T);
    const box: LayerBox = {
      cx: W / 2 + evalExpr(a.x, T) * W,
      cy: H / 2 + evalExpr(a.y, T) * H,
      w: bs.w * s * evalExpr(a.sx, T), h: bs.h * s * evalExpr(a.sy, T),
      rot: (evalExpr(a.rotation, T) * Math.PI) / 180,
    };
    return { box, T, a, prep, m };
  }

  private draw(p: Project, t: number) {
    const W = this.comp.W, H = this.comp.H;
    this.comp.clear(p.settings.background);
    this.boxes.clear();
    const order = new Map(p.tracks.map((tr, i) => [tr.id, i]));
    const clips = p.clips
      .filter((c) => c.type !== 'audio')
      .sort((a, b) => (order.get(b.trackId)! - order.get(a.trackId)!) || a.start - b.start);
    for (const c of clips) {
      const track = p.tracks.find((x) => x.id === c.trackId);
      if (!track || track.hidden) continue;
      let src: TexImageSource | null = null;
      let key = '', ver = 'live';
      let dims: { width: number; height: number } | undefined;
      const quick = this.layer(p, c, t, W, H, c.type === 'text' ? { width: 1, height: 1 } : undefined);
      if (!quick) continue;
      if (c.type === 'video') {
        const e = this.pool.get(c.id);
        if (!e) continue;
        src = e.el as HTMLVideoElement; key = `v:${c.id}`;
        // enquanto o vídeo procura um fotograma, mantém o último fotograma desenhado
        if ((e.el as HTMLVideoElement).readyState < 2 || e.el.seeking) {
          if (!this.comp.textures.has(key)) continue;
          ver = 'keep';
        }
      } else if (c.type === 'image') {
        const m = quick.m;
        if (!m) continue;
        const img = this.image(m);
        if (!img.complete || !img.naturalWidth) continue;
        src = img; key = `i:${m.id}`; ver = 'static';
      } else if (c.type === 'text') {
        const tx = this.text(c, Math.min(W, H)); // texto escala com o lado menor (vertical ou horizontal)
        src = tx.r.canvas; key = `t:${c.id}`; ver = String(tx.ver);
        dims = { width: tx.r.width, height: tx.r.height };
      }
      const L = this.layer(p, c, t, W, H, dims)!;
      const { a, T, prep, box } = L;
      this.boxes.set(c.id, box);
      const opacity = evalExpr(a.opacity, T);
      if (opacity <= 0.001 || !src) continue;
      const fx = (type: string) => c.effects.filter((e) => e.type === type).reduce((s, e) => s + e.intensity, 0);
      const eq = eqParams(c.color);
      const g = tempTintGains(c.color);
      const f = c.filter && getFilter(c.filter.id) && c.filter.intensity > 0 ? c.filter : null;
      const blurW = prep.blurMax > 0.5 ? evalExpr(a.blur, T) / prep.blurMax : 0;
      const glW = prep.glitchMax > 0.5 ? evalExpr(a.glitch, T) / prep.glitchMax : 0;
      this.comp.draw(src, key, ver, {
        center: [box.cx, box.cy], size: [box.w, box.h], rotation: box.rot,
        crop: c.type === 'text' ? { l: 0, t: 0, r: 0, b: 0 } : c.crop,
        flipH: c.transform.flipH, flipV: c.transform.flipV,
        eq: [eq.brightness, eq.contrast, eq.saturation], gains: [g.r, g.g, g.b],
        filter: f ? { id: f.id, intensity: f.intensity, mono: filterMono(f.id, f.intensity), sat: filterSaturation(f.id, f.intensity) } : null,
        sharpen: sharpenAmount(Math.min(100, fx('sharpen'))), bw: Math.min(1, fx('bw') / 100), sepia: Math.min(1, fx('sepia') / 100),
        invert: Math.min(1, fx('invert') / 100), vignette: vignetteAngle(Math.min(100, fx('vignette'))), grain: grainStrength(Math.min(100, fx('grain'))),
        blurS: blurSigma(a.blurStatic, H), blurA: blurSigma(prep.blurMax, H), blurW,
        glitchPx: glitchShift(prep.glitchMax, H), glitchW: glW,
        opacity, black: evalExpr(a.black, T), time: t,
        white: evalExpr(a.white, T), mirror: fx('mirror') > 0, pixel: fx('pixelate') > 0 ? pixelGrid(Math.min(100, fx('pixelate')), Math.abs(box.w), Math.abs(box.h), H) as [number, number] : [0, 0],
        poster: fx('posterize') > 0 ? posterLevels(Math.min(100, fx('posterize'))) : 0, duo: Math.min(1, fx('duotone') / 100),
        chroma: Math.max(fx('chromatic') > 0 ? chromaShift(Math.min(100, fx('chromatic')), H) : 0, fx('scanlines') > 0 ? chromaShift(25, H) : 0),
        glow: 0.85 * Math.min(1, fx('glow') / 100), glowSigma: glowSigma(H),
        scan: fx('scanlines') > 0 ? scanStrength(Math.min(100, fx('scanlines'))) : 0, scanP: scanPeriod(H),
        bars: barsFraction(Math.min(100, fx('cinemaBars'))),
        wipes: a.wipes.map((w) => ({ p: evalExpr(w.p, T), dir: w.dir })),
      });
    }
  }

  /** Captura o fotograma atual como PNG (botão "Capturar fotograma"). */
  snapshot(): Promise<Blob | null> {
    return new Promise((res) => this.comp.canvas.toBlob(res, 'image/png'));
  }
}
