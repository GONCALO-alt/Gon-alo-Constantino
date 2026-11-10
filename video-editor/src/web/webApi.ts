// Versão web (navegador / cloud) da API que o processo principal do Electron fornece.
// Média e projetos ficam no IndexedDB deste navegador; o FFmpeg corre em WebAssembly.
import type { Api } from '../api';
import type { ExportOptions, ExportProgress, ExportResult, HardwareInfo, MediaAsset, MediaKind, Project, ProjectSummary } from '@shared/types';
import { buildAudioMixCommand, buildExportCommand } from '@shared/exportGraph';
import { normalizeProject } from '@shared/defaults';
import { projectDuration, uid } from '@shared/timeline';
import * as idb from './idb';
import { exec, cancelAll } from './ffmpeg';

// ---------- URLs dos ficheiros (blob:) ----------
export const urlCache = new Map<string, string>();
const blobCache = new Map<string, Blob>();

export function webUrl(path: string): string {
  return urlCache.get(path) ?? '';
}

async function storeBlob(path: string, blob: Blob, persist = true) {
  blobCache.set(path, blob);
  if (!urlCache.has(path)) urlCache.set(path, URL.createObjectURL(blob));
  if (persist) await idb.put('files', path, blob);
}

async function loadBlob(path?: string): Promise<Blob | undefined> {
  if (!path) return undefined;
  let b = blobCache.get(path);
  if (!b) {
    b = await idb.get<Blob>('files', path);
    if (b) { blobCache.set(path, b); urlCache.set(path, URL.createObjectURL(b)); }
  }
  return b;
}

async function preloadProject(p: Project) {
  await Promise.all(p.media.flatMap((m) => [m.path, m.thumbnail, m.filmstrip?.path, m.proxyPath, m.waveform].map(loadBlob)));
}

// ---------- eventos ----------
const listeners = { media: new Set<(u: any) => void>(), export: new Set<(p: ExportProgress) => void>() };
const emitMedia = (id: string, path: string, patch: Partial<MediaAsset>) => listeners.media.forEach((f) => f({ id, path, patch }));
const emitExport = (p: ExportProgress) => listeners.export.forEach((f) => f(p));

// ---------- seleção de ficheiros ----------
const pending = new Map<string, File>();
const register = (f: File) => { const k = `pending:${uid()}`; pending.set(k, f); return k; };

function pickFiles(accept: string, multiple: boolean): Promise<File[]> {
  return new Promise((res) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = accept;
    inp.multiple = multiple;
    inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.onchange = () => { res(Array.from(inp.files ?? [])); inp.remove(); };
    inp.addEventListener('cancel', () => { res([]); inp.remove(); });
    inp.click();
  });
}

// ---------- gravar ficheiros (capacidade "downloads" da cloud, ou link normal fora dela) ----------
async function saveFile(filename: string, data: Blob | string): Promise<boolean> {
  try {
    const dl = await (window as any).claude?.use?.('downloads');
    if (dl) { await dl.save({ filename, data }); return true; }
  } catch (e: any) {
    if (e?.code === 'declined') return false;
  }
  const blob = typeof data === 'string' ? new Blob([data], { type: 'text/plain' }) : data;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 1000);
  return true;
}

// ---------- confirmação dentro da página (alert/confirm não existem na cloud) ----------
function confirmBox(message: string, detail?: string, buttons: string[] = ['Sim', 'Não']): Promise<number> {
  return new Promise((res) => {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal" style="width:380px"><div class="modal-body"><b></b><p class="muted small"></p></div><div class="modal-foot"></div></div>`;
    (bg.querySelector('b') as HTMLElement).textContent = message;
    (bg.querySelector('p') as HTMLElement).textContent = detail ?? '';
    const foot = bg.querySelector('.modal-foot')!;
    buttons.forEach((label, i) => {
      const b = document.createElement('button');
      b.className = `btn ${i === 0 ? 'primary' : ''}`;
      b.textContent = label;
      b.onclick = () => { bg.remove(); res(i); };
      foot.appendChild(b);
    });
    document.body.appendChild(bg);
  });
}

// ---------- análise de média no navegador ----------
const EXT: Record<MediaKind, string[]> = {
  video: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v', 'mts', 'm2ts', 'ts', 'wmv', 'flv', '3gp', 'mpg', 'mpeg', 'ogv'],
  image: ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'],
  audio: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'opus', 'aiff', 'aif', 'wma'],
};
function kindOf(f: File): MediaKind | null {
  const e = f.name.split('.').pop()?.toLowerCase() ?? '';
  for (const k of Object.keys(EXT) as MediaKind[]) if (EXT[k].includes(e)) return k;
  if (f.type.startsWith('video/')) return 'video';
  if (f.type.startsWith('image/')) return 'image';
  if (f.type.startsWith('audio/')) return 'audio';
  return null;
}

function loadVideo(url: string, tag: 'video' | 'audio' = 'video'): Promise<HTMLVideoElement> {
  return new Promise((res, rej) => {
    const v = document.createElement(tag) as HTMLVideoElement;
    v.preload = 'auto';
    v.muted = true;
    v.crossOrigin = 'anonymous';
    v.onloadeddata = () => res(v);
    v.onerror = () => rej(new Error('formato não suportado pelo navegador'));
    v.src = url;
  });
}
const seek = (v: HTMLVideoElement, t: number) => new Promise<void>((res) => {
  const done = () => { v.removeEventListener('seeked', done); res(); };
  v.addEventListener('seeked', done);
  v.currentTime = Math.max(0, Math.min(t, (v.duration || 0) - 0.05));
  setTimeout(done, 3000);
});
const canvasBlob = (c: HTMLCanvasElement, type = 'image/jpeg', q = 0.8) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('canvas'))), type, q));

async function thumbFrom(src: CanvasImageSource, w: number, h: number, id: string): Promise<string> {
  const c = document.createElement('canvas');
  c.width = 320; c.height = Math.max(2, Math.round((320 * h) / Math.max(1, w)));
  c.getContext('2d')!.drawImage(src, 0, 0, c.width, c.height);
  const path = `web:thumb/${id}.jpg`;
  await storeBlob(path, await canvasBlob(c));
  return path;
}

async function filmstrip(m: MediaAsset): Promise<MediaAsset['filmstrip']> {
  const url = webUrl(m.proxyPath ?? m.path);
  const v = await loadVideo(url);
  const count = Math.max(4, Math.min(48, Math.round(m.duration / 2)));
  const c = document.createElement('canvas');
  c.width = 160 * count; c.height = 90;
  const ctx = c.getContext('2d')!;
  for (let i = 0; i < count; i++) {
    await seek(v, ((i + 0.5) / count) * m.duration);
    const s = Math.max(160 / v.videoWidth, 90 / v.videoHeight);
    const w = v.videoWidth * s, h = v.videoHeight * s;
    ctx.drawImage(v, i * 160 + (160 - w) / 2, (90 - h) / 2, w, h);
  }
  v.removeAttribute('src');
  const path = `web:strip/${m.id}.jpg`;
  await storeBlob(path, await canvasBlob(c, 'image/jpeg', 0.7));
  return { path, count };
}

async function waveform(m: MediaAsset, file: Blob): Promise<string | undefined> {
  if (file.size > 400 * 1024 * 1024) return undefined;
  const ac = new OfflineAudioContext(1, 1, 8000);
  let buf: AudioBuffer;
  try { buf = await ac.decodeAudioData(await file.arrayBuffer()); } catch { return undefined; }
  const data = buf.getChannelData(0);
  const win = Math.max(1, Math.floor(buf.sampleRate / 100));
  const peaks: number[] = [];
  for (let i = 0; i < data.length; i += win) {
    let mx = 0;
    for (let j = i; j < Math.min(data.length, i + win); j++) { const a = Math.abs(data[j]); if (a > mx) mx = a; }
    peaks.push(Math.round(Math.min(1, mx) * 255));
  }
  const path = `web:wave/${m.id}.json`;
  await storeBlob(path, new Blob([JSON.stringify({ perSec: buf.sampleRate / win, peaks })], { type: 'application/json' }));
  return path;
}

/** Análise com o FFmpeg (para formatos que o navegador não abre, ex. HEVC, ProRes). */
async function probeFfmpeg(file: Blob, name: string) {
  const r = await exec({ args: ['-hide_banner', '-i', `/in/${name}`], mounts: [['/in', [{ name, data: file }]]] });
  const log = r.logs.join('\n');
  const d = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(log);
  const v = /Video: (\w+)[^\n]*?, (\d{2,5})x(\d{2,5})[^\n]*?(?:, ([\d.]+) fps)?/.exec(log);
  const a = /Audio: (\w+)/.exec(log);
  return {
    duration: d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0,
    videoCodec: v?.[1], width: v ? +v[2] : 0, height: v ? +v[3] : 0, fps: v?.[4] ? +v[4] : 30, audioCodec: a?.[1],
  };
}

async function makeProxyBlob(m: MediaAsset, onProgress: (p: number) => void): Promise<string> {
  const file = await loadBlob(m.path);
  if (!file) throw new Error('ficheiro em falta');
  const name = `src.${m.name.split('.').pop()}`;
  const isAudio = m.kind === 'audio';
  const out = isAudio ? '/proxy.m4a' : '/proxy.mp4';
  const args = isAudio
    ? ['-hide_banner', '-y', '-i', `/in/${name}`, '-vn', '-c:a', 'aac', '-b:a', '160k', out]
    : ['-hide_banner', '-y', '-i', `/in/${name}`, '-map', '0:v:0', '-map', '0:a:0?', '-vf', "scale='min(1280,iw)':-2,format=yuv420p",
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '24', '-g', '12', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-movflags', '+faststart', out];
  const r = await exec({ args, mounts: [['/in', [{ name, data: file }]]], out, onProgress: (t) => onProgress(Math.min(0.99, t / Math.max(0.1, m.duration))) });
  if (r.ret !== 0 || !r.out) throw new Error('falha ao criar proxy: ' + r.logs.slice(-8).join(' | '));
  const path = `web:proxy/${m.id}.${isAudio ? 'm4a' : 'mp4'}`;
  await storeBlob(path, new Blob([r.out], { type: isAudio ? 'audio/mp4' : 'video/mp4' }));
  return path;
}

async function importFile(f: File | Blob, name: string, opts: { autoProxy: boolean }): Promise<MediaAsset> {
  const kind = f instanceof File ? kindOf(f) : 'image';
  if (!kind) throw new Error('formato não suportado');
  const id = uid('m_');
  const path = `web:media/${id}/${name}`;
  await storeBlob(path, f);
  const url = webUrl(path);
  const m: MediaAsset = {
    id, name, path, kind, duration: 0, width: 0, height: 0, fps: kind === 'video' ? 30 : 0, hasAudio: kind !== 'image',
    hasVideo: kind !== 'audio', size: f.size, importedAt: Date.now(), proxyStatus: 'none', needsProxy: false,
  };
  if (kind === 'image') {
    const img = new Image();
    img.src = url;
    await img.decode();
    m.width = img.naturalWidth; m.height = img.naturalHeight;
    m.thumbnail = await thumbFrom(img, m.width, m.height, id);
    m.hasAudio = false;
    return m;
  }
  try {
    const v = await loadVideo(url, kind === 'audio' ? 'audio' : 'video');
    m.duration = v.duration || 0;
    if (kind === 'video') {
      m.width = v.videoWidth; m.height = v.videoHeight;
      if (!m.width) throw new Error('sem vídeo legível');
      await seek(v, Math.min(1, m.duration / 3));
      m.thumbnail = await thumbFrom(v, m.width, m.height, id);
    }
    v.removeAttribute('src');
  } catch {
    // o navegador não lê este formato: usa o FFmpeg para analisar e cria um proxy
    const info = await probeFfmpeg(f, `src.${name.split('.').pop()}`);
    Object.assign(m, { duration: info.duration, width: info.width, height: info.height, fps: info.fps, videoCodec: info.videoCodec, audioCodec: info.audioCodec, hasAudio: !!info.audioCodec, needsProxy: true });
    if (!m.duration) throw new Error('não foi possível ler o ficheiro');
  }
  // análise em segundo plano: proxy (se preciso), tira de miniaturas e forma de onda
  const w: MediaAsset = { ...m }; // cópia: o objeto original passa a ser imutável no estado da app
  (async () => {
    if (w.needsProxy && opts.autoProxy) {
      emitMedia(id, path, { proxyStatus: 'running', proxyProgress: 0 });
      try {
        w.proxyPath = await makeProxyBlob(w, (p) => emitMedia(id, path, { proxyProgress: p }));
        w.proxyStatus = 'ready';
        emitMedia(id, path, { proxyStatus: 'ready', proxyPath: w.proxyPath, proxyProgress: 1 });
        if (w.kind === 'video') {
          const v = await loadVideo(webUrl(w.proxyPath));
          await seek(v, Math.min(1, w.duration / 3));
          emitMedia(id, path, { thumbnail: await thumbFrom(v, w.width, w.height, id) });
        }
      } catch (e) { console.error('proxy', e); emitMedia(id, path, { proxyStatus: 'error' }); }
    }
    const patch: Partial<MediaAsset> = {};
    if (w.kind === 'video' && (!w.needsProxy || w.proxyPath)) { try { patch.filmstrip = await filmstrip(w); } catch { /* */ } }
    const wave = await waveform(w, w.proxyPath ? (await loadBlob(w.proxyPath))! : f).catch(() => undefined);
    if (wave) patch.waveform = wave;
    else if (w.kind === 'video' && !w.needsProxy) patch.hasAudio = false;
    emitMedia(id, path, patch);
  })();
  return m;
}

// ---------- exportação ----------
let exportCancelled = false;

function parseOutput(logs: string[], path: string, size: number, opt: ExportOptions, duration: number): ExportResult {
  const out = logs.slice(Math.max(0, logs.findIndex((l) => l.startsWith('Output #0'))));
  const v = out.map((l) => /Video: (\w+)[^\n]*?, (\d+)x(\d+)[^\n]*?, ([\d.]+) fps/.exec(l)).find(Boolean);
  const a = out.map((l) => /Audio: (\w+)/.exec(l)).find(Boolean);
  return {
    path, width: v ? +v[2] : opt.width, height: v ? +v[3] : opt.height, fps: v ? +v[4] : opt.fps, codec: v?.[1] ?? opt.codec,
    audioCodec: a?.[1], duration, size, bitrate: duration > 0 ? (size * 8) / duration : 0,
  };
}

async function runExport(id: string, project: Project, opt: ExportOptions, textImages: Record<string, { path: string; width: number; height: number }>) {
  exportCancelled = false;
  const t0 = performance.now();
  emitExport({ jobId: id, progress: 0, frame: 0, fps: 0, speed: 0, elapsed: 0, eta: 0, stage: 'preparing', message: 'A carregar o FFmpeg…' });
  // ficheiros de entrada: média original (montada sem cópia) e textos renderizados
  const copy: Project = JSON.parse(JSON.stringify(project));
  const mounts: { name: string; data: Blob }[] = [];
  const usedMedia = new Set(copy.clips.map((c) => c.mediaId));
  for (const m of copy.media) {
    if (!usedMedia.has(m.id)) continue;
    const blob = await loadBlob(m.path);
    if (!blob) throw new Error(`Ficheiro em falta: ${m.name}`);
    const name = `${m.id}.${m.name.split('.').pop()?.toLowerCase() || 'bin'}`;
    mounts.push({ name, data: blob });
    m.path = `/in/${name}`;
  }
  const files: [string, Uint8Array][] = [];
  const tImgs: typeof textImages = {};
  for (const [cid, t] of Object.entries(textImages)) {
    const b = await loadBlob(t.path) ?? memFiles.get(t.path);
    if (!b) continue;
    const p = `/t/${cid}.png`;
    files.push([p, new Uint8Array(await b.arrayBuffer())]);
    tImgs[cid] = { ...t, path: p };
  }
  const built = buildExportCommand(copy, { ...opt, outputPath: '/out.mp4', hwDecode: false }, { textImages: tImgs, filterScriptPath: '/graph.txt', scriptFlag: '-filter_complex_script' });
  files.push(['/graph.txt', new TextEncoder().encode(built.filterGraph)]);
  const args: string[] = [];
  for (let i = 0; i < built.args.length; i++) {
    const a = built.args[i];
    if (a === '-progress' || a === '-stats_period') { i++; continue; }
    args.push(a);
  }
  const totalFrames = Math.ceil(built.duration * opt.fps);
  let lastEmit = 0;
  const r = await exec({
    args, files, mounts: [['/in', mounts]], out: '/out.mp4',
    onProgress: (t) => {
      const now = performance.now();
      if (now - lastEmit < 250) return;
      lastEmit = now;
      const p = Math.max(0, Math.min(1, t / built.duration));
      const elapsed = (now - t0) / 1000;
      emitExport({
        jobId: id, progress: p, frame: Math.round(p * totalFrames), fps: elapsed > 0 ? (p * totalFrames) / elapsed : 0,
        speed: elapsed > 0 ? t / elapsed : 0, elapsed, eta: p > 0.01 ? (elapsed * (1 - p)) / p : 0, stage: 'rendering',
        message: `${Math.round(p * totalFrames)} / ${totalFrames} fotogramas`,
      });
    },
  });
  if (r.ret !== 0 || !r.out) {
    const msg = r.logs.filter((l) => /error|invalid|failed|cannot/i.test(l)).slice(-6).join('\n') || 'O FFmpeg terminou com erro';
    throw new Error(msg);
  }
  const blob = new Blob([r.out], { type: 'video/mp4' });
  const path = `web:export/${opt.outputPath}`;
  await storeBlob(path, blob, false);
  const result = parseOutput(r.logs, path, blob.size, opt, built.duration);
  emitExport({ jobId: id, progress: 1, frame: totalFrames, fps: 0, speed: 0, elapsed: (performance.now() - t0) / 1000, eta: 0, stage: 'done', result });
}

const memFiles = new Map<string, Blob>();
let hwCache: HardwareInfo | null = null;

// ---------- projetos ----------
const projPath = (id: string) => `idb:${id}`;
const projId = (path: string) => path.replace(/^idb:/, '');

async function summaries(): Promise<ProjectSummary[]> {
  const out: ProjectSummary[] = [];
  for (const k of await idb.keys('projects')) {
    const p = await idb.get<Project>('projects', k);
    if (!p) continue;
    const thumb = p.media.find((m) => m.thumbnail)?.thumbnail;
    if (thumb) await loadBlob(thumb);
    out.push({ id: p.id, name: p.name, path: projPath(p.id), updatedAt: p.updatedAt, duration: projectDuration(p), thumbnail: thumb, width: p.settings.width, height: p.settings.height });
  }
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createWebApi(): Api {
  return {
    openMedia: async () => (await pickFiles('video/*,image/*,audio/*,.mkv,.mov,.mts', true)).map(register),
    saveExportDialog: async (name: string) => `${name.replace(/[\\/:*?"<>|]+/g, '_')}.mp4`,
    openProjectDialog: async () => null,
    saveProjectAsDialog: async () => null,
    chooseFolder: async () => null,
    openSrt: async () => { const [f] = await pickFiles('.srt,text/plain', false); return f ? f.text() : null; },
    saveSrt: async (name: string, content: string) => ((await saveFile(`${name}.srt.txt`, content)) ? `${name}.srt.txt` : null),
    confirm: confirmBox,
    importMedia: async (paths: string[], opts: { autoProxy: boolean }) => {
      const media: MediaAsset[] = [], errors: string[] = [];
      for (const p of paths) {
        const f = pending.get(p);
        if (!f) continue;
        pending.delete(p);
        try { media.push(await importFile(f, f.name, opts)); } catch (e: any) { errors.push(`${f.name}: ${e.message}`); }
      }
      return { media, errors };
    },
    analyzeMedia: async (m: MediaAsset) => {
      await loadBlob(m.path);
      if (m.kind === 'video' && !m.filmstrip) { try { emitMedia(m.id, m.path, { filmstrip: await filmstrip(m) }); } catch { /* */ } }
    },
    makeProxy: async (m: MediaAsset) => {
      emitMedia(m.id, m.path, { proxyStatus: 'running', proxyProgress: 0 });
      try {
        const p = await makeProxyBlob(m, (x) => emitMedia(m.id, m.path, { proxyProgress: x }));
        emitMedia(m.id, m.path, { proxyStatus: 'ready', proxyPath: p, proxyProgress: 1 });
      } catch { emitMedia(m.id, m.path, { proxyStatus: 'error' }); }
    },
    cancelProxy: async () => cancelAll(),
    readWaveform: async (path: string) => JSON.parse(await (await loadBlob(path))!.text()),
    freezeFrame: async (path: string, time: number) => {
      const file = await loadBlob(path);
      if (!file) throw new Error('ficheiro em falta');
      const name = `src.${path.split('.').pop()}`;
      const r = await exec({ args: ['-hide_banner', '-y', '-ss', String(Math.max(0, time)), '-i', `/in/${name}`, '-frames:v', '1', '/frame.png'], mounts: [['/in', [{ name, data: file }]]], out: '/frame.png' });
      if (!r.out) throw new Error('Falha ao capturar fotograma');
      const f = new File([r.out], `fotograma_${Math.round(time * 1000)}.png`, { type: 'image/png' });
      return importFile(f, f.name, { autoProxy: false });
    },
    exists: async (path: string) => !!(await loadBlob(path)),
    writeTemp: async (name: string, data: ArrayBuffer) => { const k = `mem:${name}`; memFiles.set(k, new Blob([data])); return k; },
    readBinary: async (path: string) => (await (await loadBlob(path) ?? memFiles.get(path))!.arrayBuffer()),
    writeText: async (path: string, content: string) => { await saveFile(`${path.split('/').pop()}.txt`, content); },
    detectHardware: async () => {
      if (hwCache) return hwCache;
      const enc = await exec({ args: ['-hide_banner', '-encoders'] });
      const ver = await exec({ args: ['-version'] });
      const txt = enc.logs.join('\n');
      const encoders: HardwareInfo['encoders'] = [{ id: 'libx264', codec: 'h264', label: 'H.264 (x264, no navegador)', hardware: false }];
      if (/\slibx265\s/.test(txt)) encoders.push({ id: 'libx265', codec: 'hevc', label: 'H.265 / HEVC (x265, no navegador)', hardware: false });
      hwCache = { encoders, ffmpegVersion: `${ver.logs.find((l) => /version/.test(l)) ?? 'ffmpeg'} · WebAssembly`, ffmpegPath: 'ffmpeg.wasm' };
      return hwCache;
    },
    startExport: async (project: Project, opts: ExportOptions, textImages: Record<string, { path: string; width: number; height: number }>) => {
      const id = uid('job_');
      runExport(id, project, opts, textImages).catch((e) => {
        emitExport({ jobId: id, progress: 0, frame: 0, fps: 0, speed: 0, elapsed: 0, eta: 0, stage: exportCancelled ? 'cancelled' : 'error', message: e.message });
      });
      return id;
    },
    cancelExport: async () => { exportCancelled = true; cancelAll(); },
    reveal: async (path: string) => {
      const b = await loadBlob(path);
      if (b) await saveFile(path.split('/').pop() || 'video.mp4', b);
    },
    openPath: async () => undefined,
    captionAudio: async (project: Project) => {
      const copy: Project = JSON.parse(JSON.stringify(project));
      const mounts: { name: string; data: Blob }[] = [];
      for (const m of copy.media) {
        const b = await loadBlob(m.path);
        if (!b) continue;
        const name = `${m.id}.${m.name.split('.').pop()}`;
        mounts.push({ name, data: b });
        m.path = `/in/${name}`;
      }
      const built = buildAudioMixCommand(copy, '/mix.wav', '/graph.txt', '-filter_complex_script');
      const args = built.args.filter((a, i, arr) => a !== '-progress' && arr[i - 1] !== '-progress');
      const r = await exec({ args, mounts: [['/in', mounts]], files: [['/graph.txt', new TextEncoder().encode(built.filterGraph)]], out: '/mix.wav' });
      if (!r.out) throw new Error('Falha a extrair áudio');
      return r.out.buffer.slice(r.out.byteOffset, r.out.byteOffset + r.out.byteLength) as ArrayBuffer;
    },
    listProjects: summaries,
    loadProject: async (path: string) => {
      const p = await idb.get<Project>('projects', projId(path));
      if (!p) throw new Error('Projeto não encontrado neste navegador');
      const n = normalizeProject(JSON.parse(JSON.stringify(p)));
      await preloadProject(n);
      return n;
    },
    saveProject: async (p: Project) => { p.updatedAt = Date.now(); await idb.put('projects', p.id, JSON.parse(JSON.stringify(p))); return projPath(p.id); },
    defaultProjectPath: async (p: Project) => projPath(p.id),
    autosave: async (p: Project) => {
      const now = Date.now();
      const copy = JSON.parse(JSON.stringify({ ...p, updatedAt: now }));
      await idb.put('projects', p.id, copy);
      const hist = (await idb.keys('history')).filter((k) => k.startsWith(p.id + ':')).sort();
      const last = hist.length ? Number(hist[hist.length - 1].split(':')[1]) : 0;
      if (now - last > 60_000) {
        await idb.put('history', `${p.id}:${now}`, copy);
        for (const old of hist.slice(0, Math.max(0, hist.length + 1 - 50))) await idb.del('history', old);
      }
      return { savedAt: now };
    },
    snapshot: async (p: Project) => { await idb.put('history', `${p.id}:${Date.now()}`, JSON.parse(JSON.stringify(p))); },
    history: async (id: string) => {
      const out = [];
      for (const k of (await idb.keys('history')).filter((x) => x.startsWith(id + ':'))) {
        const p = await idb.get<Project>('history', k);
        if (p) out.push({ time: Number(k.split(':')[1]), clips: p.clips.length, duration: projectDuration(p) });
      }
      return out.sort((a, b) => b.time - a.time);
    },
    loadSnapshot: async (id: string, time: number) => normalizeProject((await idb.get<Project>('history', `${id}:${time}`))!),
    duplicateProject: async (path: string) => {
      const p = (await idb.get<Project>('projects', projId(path)))!;
      const c = { ...JSON.parse(JSON.stringify(p)), id: uid('p_'), name: `${p.name} (cópia)`, createdAt: Date.now(), updatedAt: Date.now() };
      await idb.put('projects', c.id, c);
      return projPath(c.id);
    },
    renameProject: async (path: string, name: string) => {
      const p = await idb.get<Project>('projects', projId(path));
      if (p) await idb.put('projects', p.id, { ...p, name });
    },
    removeProject: async (path: string) => { await idb.del('projects', projId(path)); },
    exportPackage: async () => '',
    beginSession: async (id: string, file: string) => { await idb.put('kv', 'session', { id, file, at: Date.now() }); },
    endSession: async () => { await idb.del('kv', 'session'); },
    pendingRecovery: async () => {
      const s = await idb.get<{ id: string; file: string; at: number }>('kv', 'session');
      if (!s) return null;
      const p = await idb.get<Project>('projects', s.id);
      if (!p) return null;
      const n = normalizeProject(JSON.parse(JSON.stringify(p)));
      await preloadProject(n);
      return { file: s.file, savedAt: p.updatedAt, project: n };
    },
    appInfo: async () => ({ ffmpeg: 'ffmpeg.wasm (no navegador)', userData: 'Armazenamento deste navegador (IndexedDB)', platform: 'web', version: '1.0.0' }),
    toggleFullscreen: async () => { try { await document.documentElement.requestFullscreen(); } catch { /* */ } },
    onMediaUpdate: (cb) => { listeners.media.add(cb); return () => listeners.media.delete(cb); },
    onExportProgress: (cb) => { listeners.export.add(cb); return () => listeners.export.delete(cb); },
    pathForFile: (f: File) => register(f),
  };
}
