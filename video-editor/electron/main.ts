import { app, BrowserWindow, dialog, ipcMain, protocol, shell, Menu } from 'electron';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import type { ExportOptions, MediaAsset, Project } from '../shared/types';
import { uid } from '../shared/timeline';
import {
  AUDIO_EXT, IMAGE_EXT, VIDEO_EXT, extractFrame, kindFromExt, makeFilmstrip, makeProxy, makeThumbnail, makeWaveform, probe,
} from './ffmpeg/media';
import { detectHardware } from './ffmpeg/hardware';
import { cancelExport, renderAudioMix, startExport } from './ffmpeg/exporter';
import { ffPaths } from './ffmpeg/paths';
import { ProjectStore } from './projects';

protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, bypassCSP: true, corsEnabled: true } },
]);

let win: BrowserWindow | null = null;
let store: ProjectStore;
const cacheDir = () => path.join(app.getPath('userData'), 'cache');
const proxyDir = () => path.join(app.getPath('userData'), 'proxies');
const tempDir = () => path.join(os.tmpdir(), 'corte-studio');

const MIME: Record<string, string> = {
  mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska', ogv: 'video/ogg',
  mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', opus: 'audio/ogg', flac: 'audio/flac',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', json: 'application/json',
};

/** media://f/<caminho codificado> → ficheiro local, com suporte a pedidos Range (necessário para vídeo). */
function registerMediaProtocol() {
  protocol.handle('media', async (req) => {
    const url = new URL(req.url);
    const file = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    const abs = process.platform === 'win32' ? file : '/' + file.replace(/^\/+/, '');
    let st: fs.Stats;
    try { st = fs.statSync(abs); } catch { return new Response('not found', { status: 404 }); }
    const type = MIME[path.extname(abs).slice(1).toLowerCase()] || 'application/octet-stream';
    const headers: Record<string, string> = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' };
    const range = req.headers.get('range');
    if (range) {
      const m = range.match(/bytes=(\d*)-(\d*)/);
      let start = m && m[1] ? parseInt(m[1], 10) : 0;
      let end = m && m[2] ? parseInt(m[2], 10) : st.size - 1;
      if (m && !m[1] && m[2]) { start = st.size - parseInt(m[2], 10); end = st.size - 1; }
      end = Math.min(end, st.size - 1);
      if (start > end || start >= st.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${st.size}` } });
      headers['Content-Range'] = `bytes ${start}-${end}/${st.size}`;
      headers['Content-Length'] = String(end - start + 1);
      const stream = Readable.toWeb(fs.createReadStream(abs, { start, end })) as any;
      return new Response(stream, { status: 206, headers });
    }
    headers['Content-Length'] = String(st.size);
    return new Response(Readable.toWeb(fs.createReadStream(abs)) as any, { status: 200, headers });
  });
}

function send(channel: string, payload: unknown) {
  win?.webContents.send(channel, payload);
}

// ---- Processamento de média em segundo plano ----
const proxyJobs = new Map<string, AbortController>();
async function backgroundMedia(m: MediaAsset, opts: { autoProxy: boolean }) {
  const patch = (p: Partial<MediaAsset>) => send('media:update', { id: m.id, path: m.path, patch: p });
  try {
    const [strip, wave] = await Promise.all([
      makeFilmstrip(m, cacheDir()).catch(() => undefined),
      makeWaveform(m, cacheDir()).catch(() => undefined),
    ]);
    patch({ filmstrip: strip, waveform: wave });
  } catch { /* não crítico */ }
  if (m.needsProxy && opts.autoProxy) runProxy(m);
}

function runProxy(m: Pick<MediaAsset, 'id' | 'path' | 'kind' | 'duration'>) {
  if (proxyJobs.has(m.id)) return;
  const ac = new AbortController();
  proxyJobs.set(m.id, ac);
  const patch = (p: Partial<MediaAsset>) => send('media:update', { id: m.id, path: m.path, patch: p });
  patch({ proxyStatus: 'running', proxyProgress: 0 });
  let last = 0;
  makeProxy(m, proxyDir(), (p) => { if (p - last > 0.02 || p === 1) { last = p; patch({ proxyProgress: p }); } }, ac.signal)
    .then((out) => patch({ proxyStatus: 'ready', proxyPath: out, proxyProgress: 1 }))
    .catch((e) => {
      if (!ac.signal.aborted) console.error('proxy', e);
      patch({ proxyStatus: ac.signal.aborted ? 'none' : 'error', proxyProgress: 0 });
    })
    .finally(() => proxyJobs.delete(m.id));
}

async function importFile(file: string): Promise<MediaAsset> {
  const info = await probe(file);
  const m: MediaAsset = { ...info, id: uid('m_'), importedAt: Date.now() };
  m.thumbnail = await makeThumbnail(m, cacheDir()).catch(() => undefined);
  return m;
}

function registerIpc() {
  const h = (ch: string, fn: (...a: any[]) => any) => ipcMain.handle(ch, (_e, ...a) => fn(...a));

  h('dialog:openMedia', async () => {
    const r = await dialog.showOpenDialog(win!, {
      title: 'Importar ficheiros', properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Multimédia', extensions: [...VIDEO_EXT, ...IMAGE_EXT, ...AUDIO_EXT] },
        { name: 'Vídeo', extensions: VIDEO_EXT }, { name: 'Imagem', extensions: IMAGE_EXT }, { name: 'Áudio', extensions: AUDIO_EXT },
      ],
    });
    return r.canceled ? [] : r.filePaths;
  });
  h('dialog:saveExport', async (name: string) => {
    const r = await dialog.showSaveDialog(win!, {
      title: 'Exportar vídeo', defaultPath: path.join(app.getPath('videos'), `${name}.mp4`), filters: [{ name: 'MP4', extensions: ['mp4'] }],
    });
    return r.canceled ? null : r.filePath;
  });
  h('dialog:openProject', async () => {
    const r = await dialog.showOpenDialog(win!, { title: 'Abrir projeto', properties: ['openFile'], filters: [{ name: 'Projeto Corte Studio', extensions: ['corte'] }] });
    return r.canceled ? null : r.filePaths[0];
  });
  h('dialog:saveProjectAs', async (name: string) => {
    const r = await dialog.showSaveDialog(win!, { title: 'Guardar projeto como', defaultPath: `${name}.corte`, filters: [{ name: 'Projeto Corte Studio', extensions: ['corte'] }] });
    return r.canceled ? null : r.filePath;
  });
  h('dialog:chooseFolder', async (title: string) => {
    const r = await dialog.showOpenDialog(win!, { title, properties: ['openDirectory', 'createDirectory'] });
    return r.canceled ? null : r.filePaths[0];
  });
  h('dialog:openSrt', async () => {
    const r = await dialog.showOpenDialog(win!, { title: 'Importar legendas', properties: ['openFile'], filters: [{ name: 'SubRip', extensions: ['srt'] }] });
    return r.canceled ? null : fs.readFileSync(r.filePaths[0], 'utf8');
  });
  h('dialog:saveSrt', async (name: string, content: string) => {
    const r = await dialog.showSaveDialog(win!, { title: 'Exportar legendas', defaultPath: `${name}.srt`, filters: [{ name: 'SubRip', extensions: ['srt'] }] });
    if (r.canceled || !r.filePath) return null;
    fs.writeFileSync(r.filePath, content, 'utf8');
    return r.filePath;
  });
  h('dialog:confirm', async (message: string, detail?: string, buttons?: string[]) => {
    const r = await dialog.showMessageBox(win!, { type: 'question', message, detail, buttons: buttons ?? ['Sim', 'Não'], defaultId: 0, cancelId: (buttons?.length ?? 2) - 1 });
    return r.response;
  });

  h('media:import', async (paths: string[], opts: { autoProxy: boolean }) => {
    const results: MediaAsset[] = [];
    const errors: string[] = [];
    for (const p of paths) {
      if (!kindFromExt(p)) { errors.push(`${path.basename(p)}: formato não suportado`); continue; }
      try {
        const m = await importFile(p);
        results.push(m);
        backgroundMedia(m, opts);
      } catch (e: any) { errors.push(`${path.basename(p)}: ${e.message}`); }
    }
    return { media: results, errors };
  });
  h('media:analyze', (m: MediaAsset, opts: { autoProxy: boolean }) => { backgroundMedia(m, opts); });
  h('media:proxy', (m: MediaAsset) => runProxy(m));
  h('media:cancelProxy', (id: string) => proxyJobs.get(id)?.abort());
  h('media:waveform', (file: string) => JSON.parse(fs.readFileSync(file, 'utf8')));
  h('media:freezeFrame', async (file: string, time: number) => {
    const png = await extractFrame(file, time, path.join(app.getPath('userData'), 'frames'));
    return importFile(png);
  });
  h('media:exists', (file: string) => fs.existsSync(file));
  h('fs:writeTemp', (name: string, data: ArrayBuffer) => {
    fs.mkdirSync(tempDir(), { recursive: true });
    const p = path.join(tempDir(), name);
    fs.writeFileSync(p, Buffer.from(data));
    return p;
  });
  h('fs:writeText', (file: string, content: string) => { fs.writeFileSync(file, content, 'utf8'); });
  h('fs:readBinary', (file: string) => {
    const b = fs.readFileSync(file);
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  });

  h('hw:detect', () => detectHardware());

  h('export:start', (project: Project, opts: ExportOptions, textImages: Record<string, { path: string; width: number; height: number }>) => {
    const id = uid('job_');
    const job = startExport(id, project, opts, textImages, (p) => send('export:progress', p));
    job.promise.catch(() => undefined);
    return id;
  });
  h('export:cancel', (id: string) => cancelExport(id));
  h('shell:reveal', (file: string) => shell.showItemInFolder(file));
  h('shell:open', (file: string) => shell.openPath(file));

  h('captions:audioMix', async (project: Project) => {
    const wav = await renderAudioMix(project);
    const b = fs.readFileSync(wav);
    fs.rmSync(path.dirname(wav), { recursive: true, force: true });
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  });

  h('project:list', () => store.list());
  h('project:load', (file: string) => store.load(file));
  h('project:save', (p: Project, file?: string) => store.save(p, file));
  h('project:defaultPath', (p: Project) => store.defaultPath(p));
  h('project:autosave', (p: Project, file: string) => store.autosave(p, file));
  h('project:snapshot', (p: Project) => store.snapshot(p));
  h('project:history', (id: string) => store.history(id));
  h('project:loadSnapshot', (id: string, time: number) => store.loadSnapshot(id, time));
  h('project:duplicate', (file: string) => store.duplicate(file));
  h('project:rename', (file: string, name: string) => store.rename(file, name));
  h('project:remove', (file: string) => store.remove(file));
  h('project:exportPackage', (p: Project, dir: string) => store.exportPackage(p, dir));
  h('project:beginSession', (id: string, file: string) => store.beginSession(id, file));
  h('project:endSession', () => store.endSession());
  h('project:pendingRecovery', () => store.pendingRecovery());

  h('app:info', () => ({ ffmpeg: ffPaths().ffmpeg, userData: app.getPath('userData'), platform: process.platform, version: app.getVersion() }));
  h('app:toggleFullscreen', () => win?.setFullScreen(!win.isFullScreen()));
}

function createWindow() {
  win = new BrowserWindow({
    width: 480, height: 940, minWidth: 380, minHeight: 700,
    backgroundColor: '#0b0c10', title: 'Corte Studio', show: false, autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, backgroundThrottling: false },
  });
  win.once('ready-to-show', () => win?.show());
  const dev = process.env.VITE_DEV_SERVER_URL;
  if (dev) win.loadURL(dev);
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  win.on('closed', () => { win = null; });
}

app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport');
app.whenReady().then(() => {
  store = new ProjectStore(path.join(app.getPath('documents'), 'Corte Studio', 'Projetos'), app.getPath('userData'));
  registerMediaProtocol();
  registerIpc();
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('before-quit', () => { for (const ac of proxyJobs.values()) ac.abort(); });
app.on('window-all-closed', () => { store?.endSession(); app.quit(); });
