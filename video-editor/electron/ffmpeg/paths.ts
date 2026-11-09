import fs from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

function fromStatic(mod: string): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let p: any = require(mod);
    if (p && typeof p === 'object') p = p.path;
    if (typeof p === 'string') {
      // Em apps empacotadas o binário está fora do asar
      p = p.replace('app.asar', 'app.asar.unpacked');
      if (fs.existsSync(p)) return p;
    }
  } catch { /* não instalado */ }
  return undefined;
}

let cached: { ffmpeg: string; ffprobe: string } | null = null;

/** Ordem: variáveis de ambiente → binários embutidos (ffmpeg-static) → PATH do sistema. */
export function ffPaths() {
  if (cached) return cached;
  const ffmpeg = process.env.FFMPEG_PATH || fromStatic('ffmpeg-static') || 'ffmpeg';
  const ffprobe = process.env.FFPROBE_PATH || fromStatic('ffprobe-static') || 'ffprobe';
  cached = { ffmpeg, ffprobe };
  return cached;
}

export function ffmpegVersion(): { text: string; major: number } {
  const r = spawnSync(ffPaths().ffmpeg, ['-hide_banner', '-version'], { encoding: 'utf8' });
  const text = (r.stdout || '').split('\n')[0] || 'desconhecida';
  const m = text.match(/version\s+n?(\d+)/);
  return { text, major: m ? +m[1] : 6 };
}

export interface RunResult { code: number; stdout: string; stderr: string }

export function run(bin: string, args: string[], opts: { onStdout?: (s: string) => void; onStderr?: (s: string) => void; signal?: AbortSignal; collect?: boolean } = {}): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { windowsHide: true });
    let out = '', err = '';
    const collect = opts.collect !== false;
    p.stdout.on('data', (d) => { const s = d.toString(); if (collect) out += s; opts.onStdout?.(s); });
    p.stderr.on('data', (d) => { const s = d.toString(); err += s; if (err.length > 200000) err = err.slice(-100000); opts.onStderr?.(s); });
    p.on('error', reject);
    p.on('close', (code) => resolve({ code: code ?? -1, stdout: out, stderr: err }));
    opts.signal?.addEventListener('abort', () => { try { p.kill('SIGKILL'); } catch { /* */ } });
  });
}

/** Executa e devolve a saída binária (stdout) — usado para PCM das ondas sonoras. */
export function runBuffer(bin: string, args: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { windowsHide: true });
    const chunks: Buffer[] = [];
    let err = '';
    p.stdout.on('data', (d) => chunks.push(d));
    p.stderr.on('data', (d) => { err += d.toString(); if (err.length > 50000) err = err.slice(-20000); });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error(err.slice(-2000)))));
  });
}
