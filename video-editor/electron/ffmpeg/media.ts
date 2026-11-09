// Análise e processamento de ficheiros multimédia: ffprobe, miniaturas, tira de
// miniaturas para a timeline, picos da forma de onda, proxies e captura de fotogramas.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { MediaAsset, MediaKind } from '../../shared/types';
import { ffPaths, run, runBuffer } from './paths';

export const VIDEO_EXT = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v', 'mts', 'm2ts', 'ts', 'wmv', 'flv', '3gp', 'mpg', 'mpeg', 'ogv'];
export const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'tif', 'tiff'];
export const AUDIO_EXT = ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'opus', 'wma', 'aiff', 'aif'];

const PLAYABLE_VIDEO = ['h264', 'vp8', 'vp9', 'av1', 'theora'];
const PLAYABLE_AUDIO = ['aac', 'mp3', 'opus', 'vorbis', 'flac', 'pcm_s16le', 'pcm_s24le', 'pcm_f32le', 'pcm_u8', 'pcm_s32le', 'mp2'];
const PLAYABLE_PIX = ['yuv420p', 'yuvj420p', 'nv12'];

const ensureDir = (d: string) => { fs.mkdirSync(d, { recursive: true }); return d; };

export function cacheKey(file: string) {
  const st = fs.statSync(file);
  return crypto.createHash('sha1').update(`${file}|${st.size}|${st.mtimeMs}`).digest('hex').slice(0, 16);
}

export async function probe(file: string): Promise<Omit<MediaAsset, 'id' | 'importedAt'>> {
  const { ffprobe } = ffPaths();
  const r = await run(ffprobe, ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]);
  if (r.code !== 0) throw new Error(`Não foi possível ler o ficheiro: ${r.stderr.slice(-400)}`);
  const j = JSON.parse(r.stdout);
  const streams: any[] = j.streams || [];
  const ext = path.extname(file).slice(1).toLowerCase();
  const v = streams.find((s) => s.codec_type === 'video' && !(s.disposition?.attached_pic));
  const a = streams.find((s) => s.codec_type === 'audio');
  let kind: MediaKind = 'video';
  if (IMAGE_EXT.includes(ext) || (v && ['png', 'mjpeg', 'webp', 'bmp', 'tiff', 'gif'].includes(v.codec_name) && !(parseFloat(j.format?.duration) > 0.5))) kind = 'image';
  else if (!v) kind = 'audio';
  if (kind === 'video' && ext === 'gif') kind = 'video';

  let width = v?.width ?? 0, height = v?.height ?? 0;
  const rot = Number(v?.tags?.rotate ?? v?.side_data_list?.find((d: any) => d.rotation !== undefined)?.rotation ?? 0);
  if (Math.abs(rot) % 180 === 90) [width, height] = [height, width];
  const fr = (v?.avg_frame_rate || v?.r_frame_rate || '30/1').split('/');
  const fps = Number(fr[1]) ? Number(fr[0]) / Number(fr[1]) : 30;
  const duration = kind === 'image' ? 0 : parseFloat(j.format?.duration ?? v?.duration ?? a?.duration ?? '0') || 0;
  const vcodec = v?.codec_name as string | undefined;
  const acodec = a?.codec_name as string | undefined;
  const needsProxy = kind === 'video' && (
    !PLAYABLE_VIDEO.includes(vcodec ?? '') || (!!v?.pix_fmt && !PLAYABLE_PIX.includes(v.pix_fmt)) || (!!acodec && !PLAYABLE_AUDIO.includes(acodec))
  ) || (kind === 'audio' && !PLAYABLE_AUDIO.includes(acodec ?? ''));

  return {
    name: path.basename(file),
    path: file,
    kind,
    duration,
    width,
    height,
    fps: Math.round(fps * 1000) / 1000,
    hasAudio: !!a,
    hasVideo: kind !== 'audio',
    videoCodec: vcodec,
    audioCodec: acodec,
    pixFmt: v?.pix_fmt,
    bitrate: Number(j.format?.bit_rate) || undefined,
    size: Number(j.format?.size) || fs.statSync(file).size,
    sampleRate: a ? Number(a.sample_rate) : undefined,
    channels: a?.channels,
    needsProxy,
    proxyStatus: 'none',
  };
}

export async function makeThumbnail(m: Pick<MediaAsset, 'path' | 'kind' | 'duration'>, outDir: string): Promise<string | undefined> {
  if (m.kind === 'audio') return undefined;
  const out = path.join(ensureDir(outDir), `${cacheKey(m.path)}_thumb.jpg`);
  if (fs.existsSync(out)) return out;
  const { ffmpeg } = ffPaths();
  const ss = m.kind === 'video' ? Math.min(1, m.duration / 3) : 0;
  const r = await run(ffmpeg, ['-hide_banner', '-y', '-ss', String(ss), '-i', m.path, '-frames:v', '1', '-vf', 'scale=320:-2', '-q:v', '4', out]);
  return r.code === 0 && fs.existsSync(out) ? out : undefined;
}

/** Tira horizontal com N miniaturas (para os clips de vídeo na timeline). */
export async function makeFilmstrip(m: Pick<MediaAsset, 'path' | 'kind' | 'duration'>, outDir: string): Promise<{ path: string; count: number } | undefined> {
  if (m.kind !== 'video' || m.duration <= 0) return undefined;
  const count = Math.max(4, Math.min(48, Math.round(m.duration / 2)));
  const out = path.join(ensureDir(outDir), `${cacheKey(m.path)}_strip${count}.jpg`);
  if (fs.existsSync(out)) return { path: out, count };
  const { ffmpeg } = ffPaths();
  const rate = count / m.duration;
  const r = await run(ffmpeg, ['-hide_banner', '-y', '-skip_frame', 'nokey', '-i', m.path,
    '-vf', `fps=${rate.toFixed(6)},scale=160:90:force_original_aspect_ratio=increase,crop=160:90,tile=${count}x1`,
    '-frames:v', '1', '-q:v', '5', out]);
  if (r.code !== 0 || !fs.existsSync(out)) {
    // alguns ficheiros não têm keyframes suficientes: tenta sem skip_frame
    const r2 = await run(ffmpeg, ['-hide_banner', '-y', '-i', m.path,
      '-vf', `fps=${rate.toFixed(6)},scale=160:90:force_original_aspect_ratio=increase,crop=160:90,tile=${count}x1`,
      '-frames:v', '1', '-q:v', '5', out]);
    if (r2.code !== 0) return undefined;
  }
  return { path: out, count };
}

/** Picos da forma de onda: 100 valores por segundo (0..255). */
export async function makeWaveform(m: Pick<MediaAsset, 'path' | 'hasAudio'>, outDir: string): Promise<string | undefined> {
  if (!m.hasAudio) return undefined;
  const out = path.join(ensureDir(outDir), `${cacheKey(m.path)}_wave.json`);
  if (fs.existsSync(out)) return out;
  const { ffmpeg } = ffPaths();
  const rate = 8000, perSec = 100, win = rate / perSec;
  const buf = await runBuffer(ffmpeg, ['-hide_banner', '-v', 'error', '-i', m.path, '-vn', '-ac', '1', '-ar', String(rate), '-f', 's16le', '-acodec', 'pcm_s16le', '-']);
  const samples = new Int16Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 2));
  const n = Math.ceil(samples.length / win);
  const peaks: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    let mx = 0;
    const end = Math.min(samples.length, (i + 1) * win);
    for (let j = i * win; j < end; j++) { const v = Math.abs(samples[j]); if (v > mx) mx = v; }
    peaks[i] = Math.round((mx / 32768) * 255);
  }
  fs.writeFileSync(out, JSON.stringify({ perSec, peaks }));
  return out;
}

/** Proxy H.264 leve para edição fluida (originais são sempre usados na exportação). */
export async function makeProxy(m: Pick<MediaAsset, 'path' | 'kind' | 'duration'>, outDir: string, onProgress: (p: number) => void, signal?: AbortSignal): Promise<string> {
  const { ffmpeg } = ffPaths();
  const isAudio = m.kind === 'audio';
  const out = path.join(ensureDir(outDir), `${cacheKey(m.path)}_proxy.${isAudio ? 'm4a' : 'mp4'}`);
  if (fs.existsSync(out)) { onProgress(1); return out; }
  const tmp = out + '.part' + (isAudio ? '.m4a' : '.mp4');
  const args = isAudio
    ? ['-hide_banner', '-y', '-i', m.path, '-vn', '-c:a', 'aac', '-b:a', '192k', '-progress', 'pipe:1', tmp]
    : ['-hide_banner', '-y', '-i', m.path, '-map', '0:v:0', '-map', '0:a:0?', '-vf', "scale='min(1280,iw)':-2,format=yuv420p",
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-g', '12', '-bf', '0',
      '-c:a', 'aac', '-b:a', '160k', '-ac', '2', '-movflags', '+faststart', '-progress', 'pipe:1', tmp];
  const r = await run(ffmpeg, args, {
    signal,
    collect: false,
    onStdout: (s) => {
      const mm = s.match(/out_time_us=(\d+)/g);
      if (mm && m.duration > 0) onProgress(Math.min(0.99, Number(mm[mm.length - 1].split('=')[1]) / 1e6 / m.duration));
    },
  });
  if (r.code !== 0) { try { fs.unlinkSync(tmp); } catch { /* */ } throw new Error(r.stderr.slice(-600)); }
  fs.renameSync(tmp, out);
  onProgress(1);
  return out;
}

/** Captura um fotograma em resolução total (para "congelar fotograma"). */
export async function extractFrame(file: string, time: number, outDir: string): Promise<string> {
  const { ffmpeg } = ffPaths();
  const out = path.join(ensureDir(outDir), `frame_${cacheKey(file)}_${Math.round(time * 1000)}.png`);
  const r = await run(ffmpeg, ['-hide_banner', '-y', '-ss', String(Math.max(0, time)), '-i', file, '-frames:v', '1', out]);
  if (r.code !== 0 || !fs.existsSync(out)) throw new Error('Falha ao capturar fotograma: ' + r.stderr.slice(-300));
  return out;
}

export function kindFromExt(file: string): MediaKind | null {
  const e = path.extname(file).slice(1).toLowerCase();
  if (VIDEO_EXT.includes(e)) return 'video';
  if (IMAGE_EXT.includes(e)) return 'image';
  if (AUDIO_EXT.includes(e)) return 'audio';
  return null;
}
