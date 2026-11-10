// FFmpeg no navegador (ffmpeg.wasm, núcleo publicado junto da página em partes de 14 MB).
// Corre num Web Worker para não bloquear a interface; cancelar termina o worker.

const PARTS = ['ffmpeg/ffmpeg-core.part00.wasm', 'ffmpeg/ffmpeg-core.part01.wasm', 'ffmpeg/ffmpeg-core.part02.wasm'];
const CORE = 'ffmpeg/ffmpeg-core.js';

const WORKER_SRC = `
let core = null, logs = [];
self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === 'load') {
      const parts = await Promise.all(m.parts.map((p) => fetch(p).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + p); return r.arrayBuffer(); })));
      const total = parts.reduce((s, b) => s + b.byteLength, 0);
      const bin = new Uint8Array(total); let o = 0;
      for (const b of parts) { bin.set(new Uint8Array(b), o); o += b.byteLength; }
      importScripts(m.core);
      core = await createFFmpegCore({ wasmBinary: bin.buffer, locateFile: (p) => p });
      core.setLogger((l) => { logs.push(l.message); if (logs.length > 4000) logs = logs.slice(-2000); self.postMessage({ type: 'log', line: l.message }); });
      core.setProgress((p) => self.postMessage({ type: 'progress', progress: p.progress, time: p.time }));
      self.postMessage({ type: 'loaded' });
    } else if (m.type === 'exec') {
      logs = [];
      const mounted = [];
      for (const [dir, blobs] of m.mounts || []) {
        try { core.FS.mkdir(dir); } catch {}
        try { core.FS.mount(core.FS.filesystems.WORKERFS, { blobs }, dir); mounted.push(dir); }
        catch { for (const b of blobs) core.FS.writeFile(dir + '/' + b.name, new Uint8Array(await b.data.arrayBuffer())); }
      }
      for (const [name, data] of m.files || []) {
        const d = name.slice(0, name.lastIndexOf('/'));
        if (d) { try { core.FS.mkdir(d); } catch {} }
        core.FS.writeFile(name, data);
      }
      core.exec(...m.args);
      const ret = core.ret;
      core.reset();
      let out = null;
      if (m.out) { try { out = core.FS.readFile(m.out); core.FS.unlink(m.out); } catch {} }
      for (const [name] of m.files || []) { try { core.FS.unlink(name); } catch {} }
      for (const d of mounted) { try { core.FS.unmount(d); } catch {} }
      self.postMessage({ type: 'done', ret, out, logs }, out ? [out.buffer] : []);
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err && err.message || err), logs });
  }
};`;

export interface ExecJob {
  args: string[];
  mounts?: [string, { name: string; data: Blob }[]][]; // ficheiros grandes, sem cópia (WORKERFS)
  files?: [string, Uint8Array][];
  out?: string;
  onLog?: (line: string) => void;
  onProgress?: (time: number) => void;
}
export interface ExecResult { ret: number; out: Uint8Array | null; logs: string[] }

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let queue: Promise<unknown> = Promise.resolve();
let current: { reject: (e: Error) => void } | null = null;

const abs = (p: string) => new URL(p, document.baseURI).href;

function boot(): Promise<void> {
  if (ready) return ready;
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  worker = new Worker(url);
  ready = new Promise((res, rej) => {
    worker!.onmessage = (e) => {
      if (e.data.type === 'loaded') res();
      else if (e.data.type === 'error') rej(new Error('Não foi possível carregar o FFmpeg: ' + e.data.message));
    };
    worker!.onerror = (e) => rej(new Error('Não foi possível carregar o FFmpeg: ' + e.message));
    worker!.postMessage({ type: 'load', core: abs(CORE), parts: PARTS.map(abs) });
  });
  ready.catch(() => { ready = null; worker?.terminate(); worker = null; });
  return ready;
}

export function exec(job: ExecJob): Promise<ExecResult> {
  const run = async (): Promise<ExecResult> => {
    await boot();
    return new Promise((res, rej) => {
      current = { reject: rej };
      worker!.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'log') {
          job.onLog?.(m.line);
          const t = /time=(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(m.line);
          if (t) job.onProgress?.(+t[1] * 3600 + +t[2] * 60 + +t[3]);
        } else if (m.type === 'done') { current = null; res({ ret: m.ret, out: m.out, logs: m.logs }); }
        else if (m.type === 'error') { current = null; rej(new Error(m.message)); }
      };
      worker!.postMessage({ type: 'exec', args: job.args, mounts: job.mounts, files: job.files, out: job.out });
    });
  };
  const p = queue.then(run, run);
  queue = p.catch(() => undefined);
  return p;
}

/** Cancela o trabalho em curso (termina o worker; o próximo trabalho volta a carregar o FFmpeg). */
export function cancelAll() {
  worker?.terminate();
  worker = null;
  ready = null;
  current?.reject(new Error('Exportação cancelada'));
  current = null;
}

export const preload = () => boot().catch(() => undefined);
