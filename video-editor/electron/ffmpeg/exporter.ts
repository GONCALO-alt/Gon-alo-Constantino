// Executor da exportação: grava o filtergraph, corre o FFmpeg, reporta progresso/ETA,
// permite cancelar e, no fim, verifica o ficheiro produzido com o ffprobe.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ExportOptions, ExportProgress, ExportResult, Project } from '../../shared/types';
import { buildAudioMixCommand, buildExportCommand, TextImage } from '../../shared/exportGraph';
import { ffPaths, ffmpegVersion, run } from './paths';

export interface ExportJob { id: string; abort: AbortController; promise: Promise<ExportResult> }

const jobs = new Map<string, ExportJob>();

export function scriptFlag(): '-filter_complex_script' | '-/filter_complex' {
  return ffmpegVersion().major >= 7 ? '-/filter_complex' : '-filter_complex_script';
}

export async function verifyOutput(file: string): Promise<ExportResult> {
  const { ffprobe } = ffPaths();
  const r = await run(ffprobe, ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]);
  const j = JSON.parse(r.stdout || '{}');
  const v = (j.streams || []).find((s: any) => s.codec_type === 'video');
  const a = (j.streams || []).find((s: any) => s.codec_type === 'audio');
  const fr = String(v?.avg_frame_rate || v?.r_frame_rate || '0/1').split('/');
  return {
    path: file,
    width: v?.width ?? 0,
    height: v?.height ?? 0,
    fps: Number(fr[1]) ? Math.round((Number(fr[0]) / Number(fr[1])) * 100) / 100 : 0,
    codec: v?.codec_name ?? '?',
    audioCodec: a?.codec_name,
    duration: parseFloat(j.format?.duration ?? '0'),
    size: Number(j.format?.size ?? 0),
    bitrate: Number(j.format?.bit_rate ?? 0),
  };
}

export function startExport(
  id: string,
  project: Project,
  opt: ExportOptions,
  textImages: Record<string, TextImage>,
  onProgress: (p: ExportProgress) => void,
): ExportJob {
  const abort = new AbortController();
  const promise = (async () => {
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'corte-export-'));
    const scriptPath = path.join(work, 'graph.txt');
    const built = buildExportCommand(project, opt, { textImages, filterScriptPath: scriptPath, scriptFlag: scriptFlag() });
    fs.writeFileSync(scriptPath, built.filterGraph);
    fs.mkdirSync(path.dirname(opt.outputPath), { recursive: true });
    const tmpOut = opt.outputPath.replace(/(\.[^.]+)$/, '.rendering$1');
    built.args[built.args.length - 1] = tmpOut;
    const t0 = Date.now();
    const totalFrames = Math.ceil(built.duration * opt.fps);
    onProgress({ jobId: id, progress: 0, frame: 0, fps: 0, speed: 0, elapsed: 0, eta: 0, stage: 'rendering' });
    let state: Record<string, string> = {};
    let lastErr = '';
    const r = await run(ffPaths().ffmpeg, built.args, {
      signal: abort.signal,
      collect: false,
      onStderr: (s) => { lastErr = (lastErr + s).slice(-4000); },
      onStdout: (s) => {
        for (const line of s.split('\n')) {
          const [k, v] = line.split('=');
          if (!k || v === undefined) continue;
          state[k.trim()] = v.trim();
          if (k.trim() === 'progress') {
            const outUs = Number(state.out_time_us || state.out_time_ms || 0);
            const p = Math.max(0, Math.min(1, outUs / 1e6 / built.duration));
            const elapsed = (Date.now() - t0) / 1000;
            onProgress({
              jobId: id, progress: p, frame: Number(state.frame || 0), fps: Number(state.fps || 0),
              speed: parseFloat(state.speed || '0') || 0, elapsed, eta: p > 0.01 ? (elapsed * (1 - p)) / p : 0,
              stage: 'rendering', message: `${state.frame || 0} / ${totalFrames} fotogramas`,
            });
          }
        }
      },
    });
    try { fs.rmSync(work, { recursive: true, force: true }); } catch { /* */ }
    if (abort.signal.aborted) {
      try { fs.unlinkSync(tmpOut); } catch { /* */ }
      onProgress({ jobId: id, progress: 0, frame: 0, fps: 0, speed: 0, elapsed: 0, eta: 0, stage: 'cancelled' });
      throw new Error('Exportação cancelada');
    }
    if (r.code !== 0) {
      try { fs.unlinkSync(tmpOut); } catch { /* */ }
      const msg = lastErr.split('\n').filter((l) => /error|invalid|failed|cannot|no such/i.test(l)).slice(-6).join('\n') || lastErr.slice(-800);
      onProgress({ jobId: id, progress: 0, frame: 0, fps: 0, speed: 0, elapsed: 0, eta: 0, stage: 'error', message: msg });
      throw new Error(msg);
    }
    onProgress({ jobId: id, progress: 1, frame: totalFrames, fps: 0, speed: 0, elapsed: (Date.now() - t0) / 1000, eta: 0, stage: 'finalizing' });
    fs.renameSync(tmpOut, opt.outputPath);
    const result = await verifyOutput(opt.outputPath);
    onProgress({ jobId: id, progress: 1, frame: totalFrames, fps: 0, speed: 0, elapsed: (Date.now() - t0) / 1000, eta: 0, stage: 'done', result });
    return result;
  })();
  const job = { id, abort, promise };
  jobs.set(id, job);
  promise.catch(() => undefined).finally(() => jobs.delete(id));
  return job;
}

export function cancelExport(id: string) {
  jobs.get(id)?.abort.abort();
}

/** Mistura todo o áudio da timeline num WAV mono 16 kHz (entrada do reconhecimento de voz). */
export async function renderAudioMix(project: Project): Promise<string> {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'corte-asr-'));
  const out = path.join(work, 'mix.wav');
  const scriptPath = path.join(work, 'graph.txt');
  const built = buildAudioMixCommand(project, out, scriptPath, scriptFlag());
  fs.writeFileSync(scriptPath, built.filterGraph);
  const r = await run(ffPaths().ffmpeg, built.args, { collect: false });
  if (r.code !== 0) throw new Error('Falha a extrair áudio: ' + r.stderr.slice(-600));
  return out;
}
