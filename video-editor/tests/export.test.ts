// Testes do motor de exportação com o FFmpeg real: gera média de teste, monta um
// projeto multipista e verifica o ficheiro final (resolução, FPS, codecs, píxeis).
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ffPaths, run, runBuffer } from '../electron/ffmpeg/paths';
import { probe } from '../electron/ffmpeg/media';
import { startExport, renderAudioMix } from '../electron/ffmpeg/exporter';
import { createProject, clipFromMedia, createTextClip, createTrack, baseClip } from '../shared/defaults';
import type { ExportOptions, MediaAsset, Project } from '../shared/types';
import { uid } from '../shared/timeline';

const OUT = path.join(__dirname, '.out');
const ff = () => ffPaths().ffmpeg;

async function gen(args: string[]) {
  const r = await run(ff(), ['-hide_banner', '-y', ...args]);
  if (r.code !== 0) throw new Error(r.stderr.slice(-800));
}

async function media(file: string): Promise<MediaAsset> {
  const p = await probe(file);
  return { ...p, id: uid('m_'), importedAt: Date.now() };
}

const baseOpts = (o: Partial<ExportOptions>): ExportOptions => ({
  outputPath: '', width: 1920, height: 1080, fps: 30, codec: 'h264', encoder: 'libx264', rateControl: 'crf', crf: 23,
  bitrateMbps: 20, preset: 'ultrafast', audioBitrateKbps: 192, includeAudio: true, hwDecode: false, ...o,
});

async function exportProject(p: Project, o: ExportOptions, textImages = {}) {
  const job = startExport(uid('j'), p, o, textImages, () => undefined);
  return job.promise;
}

async function pixel(file: string, t: number, x: number, y: number): Promise<[number, number, number]> {
  const buf = await runBuffer(ff(), ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1', '-vf', `crop=2:2:${x}:${y}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  return [buf[0], buf[1], buf[2]];
}

let vid: MediaAsset, vid2: MediaAsset, img: MediaAsset, aud: MediaAsset, red: MediaAsset, textPng: string;

beforeAll(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await gen(['-f', 'lavfi', '-i', 'testsrc2=s=1920x1080:r=30:d=4', '-f', 'lavfi', '-i', 'sine=f=440:d=4', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-shortest', path.join(OUT, 'a.mp4')]);
  await gen(['-f', 'lavfi', '-i', 'smptebars=s=1280x720:r=25:d=4', '-f', 'lavfi', '-i', 'sine=f=660:d=4', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-shortest', path.join(OUT, 'b.mov')]);
  await gen(['-f', 'lavfi', '-i', 'mandelbrot=s=800x800', '-frames:v', '1', path.join(OUT, 'c.png')]);
  await gen(['-f', 'lavfi', '-i', 'sine=f=220:d=6', '-c:a', 'libmp3lame', path.join(OUT, 'd.mp3')]);
  await gen(['-f', 'lavfi', '-i', 'color=red:s=400x400', '-frames:v', '1', path.join(OUT, 'red.png')]);
  // imagem de texto com transparência (o editor gera-a com o canvas)
  textPng = path.join(OUT, 'text.png');
  await gen(['-f', 'lavfi', '-i', 'color=c=yellow:s=1160x160,format=rgba,pad=1200:200:20:20:color=black@0', '-frames:v', '1', textPng]);
  [vid, vid2, img, aud, red] = await Promise.all(['a.mp4', 'b.mov', 'c.png', 'd.mp3', 'red.png'].map((f) => media(path.join(OUT, f))));
});

describe('probe', () => {
  it('lê metadados de vídeo, imagem e áudio', () => {
    expect(vid.kind).toBe('video');
    expect(vid.width).toBe(1920);
    expect(vid.hasAudio).toBe(true);
    expect(vid.duration).toBeGreaterThan(3.9);
    expect(img.kind).toBe('image');
    expect(aud.kind).toBe('audio');
    expect(aud.needsProxy).toBe(false);
  });
});

function complexProject(): { p: Project; textImages: any } {
  const p = createProject('Teste', 1920, 1080, 30);
  p.media.push(vid, vid2, img, aud);
  const vMain = p.tracks[0];
  const aTrack = p.tracks[1];
  const overlay = createTrack('video', 'Sobreposição');
  const text = createTrack('text', 'Texto');
  p.tracks = [text, overlay, vMain, aTrack];

  const c1 = clipFromMedia(vid, vMain.id, 0); c1.duration = 3;
  c1.color.brightness = 20; c1.color.temperature = 40; c1.filter = { id: 'cinema', intensity: 80 };
  c1.effects.push({ id: 'e1', type: 'vignette', intensity: 60 }, { id: 'e2', type: 'grain', intensity: 30 });
  const c2 = clipFromMedia(vid2, vMain.id, 3); c2.duration = 2; c2.speed = 2; // fast motion (usa 4 s de fonte)
  c2.transitionIn = { type: 'dissolve', duration: 0.8 };
  const c3 = clipFromMedia(img, vMain.id, 5); c3.duration = 2; c3.transitionIn = { type: 'zoomIn', duration: 0.6 };
  c3.motion = { type: 'kenBurnsIn', intensity: 80 }; c3.effects.push({ id: 'e3', type: 'glitch', intensity: 40 });
  const c4 = clipFromMedia(vid, vMain.id, 7); c4.duration = 2; c4.speed = 0.5; c4.transitionIn = { type: 'blur', duration: 0.5 };
  c4.transform.flipH = true; c4.crop = { l: 0.1, r: 0.1, t: 0, b: 0 };
  // sobreposição picture-in-picture com keyframes de posição, escala, rotação e opacidade
  const o1 = clipFromMedia(vid2, overlay.id, 1); o1.duration = 3;
  o1.keyframes.x = [{ t: 0, v: -0.3, ease: 'easeInOut' }, { t: 3, v: 0.3, ease: 'linear' }];
  o1.keyframes.scale = [{ t: 0, v: 0.3, ease: 'linear' }, { t: 3, v: 0.5, ease: 'linear' }];
  o1.keyframes.rotation = [{ t: 0, v: 0, ease: 'linear' }, { t: 3, v: 45, ease: 'linear' }];
  o1.keyframes.opacity = [{ t: 0, v: 0, ease: 'linear' }, { t: 1, v: 1, ease: 'linear' }];
  o1.muted = true;
  const o2 = clipFromMedia(vid2, overlay.id, 4); o2.duration = 2; o2.transform.scale = 0.4; o2.transform.rotation = 15;
  o2.transitionIn = { type: 'glitch', duration: 0.4 }; o2.effects.push({ id: 'e4', type: 'bw', intensity: 100 });
  o2.animOut = { type: 'fade', duration: 0.5 };
  const o3 = clipFromMedia(vid2, overlay.id, 6); o3.duration = 1.5; o3.transform.scale = 0.4; o3.transitionIn = { type: 'fade', duration: 0.5 };
  o3.effects.push({ id: 'e5', type: 'sepia', intensity: 70 }, { id: 'e6', type: 'invert', intensity: 30 }, { id: 'e7', type: 'sharpen', intensity: 50 });
  // texto com animação de entrada/saída
  const t1 = createTextClip(text.id, 0.5, 'Olá'); t1.duration = 4; t1.transform.y = 0.3;
  t1.animIn = { type: 'pop', duration: 0.6 }; t1.animOut = { type: 'slideDown', duration: 0.5 };
  const t2 = createTextClip(text.id, 5, 'Fim'); t2.duration = 3; t2.animIn = { type: 'spin', duration: 0.5 }; t2.motion = { type: 'shake', intensity: 50 };
  // música com fades e keyframes de volume
  const a1 = clipFromMedia(aud, aTrack.id, 0.5); a1.duration = 5; a1.fadeIn = 1; a1.fadeOut = 1.5;
  a1.keyframes.volume = [{ t: 0, v: 0.5, ease: 'linear' }, { t: 4, v: 1.2, ease: 'linear' }];
  p.clips.push(c1, c2, c3, c4, o1, o2, o3, t1, t2, a1);
  const textImages = { [t1.id]: { path: textPng, width: 600, height: 100 }, [t2.id]: { path: textPng, width: 300, height: 50 } };
  return { p, textImages };
}

describe('exportação', () => {
  it('exporta um projeto complexo em 4K UHD a 60 FPS (H.264 + AAC)', async () => {
    const { p, textImages } = complexProject();
    const out = path.join(OUT, 'export_4k60.mp4');
    const res = await exportProject(p, baseOpts({ outputPath: out, width: 3840, height: 2160, fps: 60 }), textImages);
    expect(res.width).toBe(3840);
    expect(res.height).toBe(2160);
    expect(res.fps).toBe(60);
    expect(res.codec).toBe('h264');
    expect(res.audioCodec).toBe('aac');
    expect(res.duration).toBeGreaterThan(8.9);
    expect(res.duration).toBeLessThan(9.2);
    const frames = await run(ffPaths().ffprobe, ['-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', out]);
    expect(Number(frames.stdout.trim())).toBe(540);
  });

  it('exporta em H.265/HEVC 1080p com bitrate configurado', async () => {
    const { p, textImages } = complexProject();
    const out = path.join(OUT, 'export_hevc.mp4');
    const res = await exportProject(p, baseOpts({ outputPath: out, codec: 'hevc', encoder: 'libx265', rateControl: 'bitrate', bitrateMbps: 8, fps: 25 }), textImages);
    expect(res.codec).toBe('hevc');
    expect(res.width).toBe(1920);
    expect(res.fps).toBe(25);
  });

  it('posiciona, roda e aplica opacidade corretamente (verificação de píxeis)', async () => {
    const p = createProject('Px', 1280, 720, 30);
    p.media.push(red);
    const tr = p.tracks[0];
    const c = clipFromMedia(red, tr.id, 0); c.duration = 2;
    c.transform.scale = 0.25; // 720*0.25 = 180 px de lado
    c.transform.x = 0.25; // centro em x = 640 + 320 = 960
    c.keyframes.opacity = [{ t: 0, v: 1, ease: 'linear' }, { t: 1, v: 1, ease: 'hold' }, { t: 1.01, v: 0, ease: 'linear' }];
    p.clips.push(c);
    p.settings.background = '#0000ff';
    const out = path.join(OUT, 'px.mp4');
    await exportProject(p, baseOpts({ outputPath: out, width: 1280, height: 720, crf: 10 }));
    const inside = await pixel(out, 0.5, 958, 358);
    const outside = await pixel(out, 0.5, 600, 358);
    const later = await pixel(out, 1.6, 958, 358);
    expect(inside[0]).toBeGreaterThan(200); expect(inside[2]).toBeLessThan(60);
    expect(outside[2]).toBeGreaterThan(200); expect(outside[0]).toBeLessThan(60);
    expect(later[2]).toBeGreaterThan(200); // opacidade 0 depois de 1 s
  });

  it('cancela uma exportação em curso e remove o ficheiro parcial', async () => {
    const { p, textImages } = complexProject();
    const out = path.join(OUT, 'cancel.mp4');
    const job = startExport('cancel', p, baseOpts({ outputPath: out, width: 3840, height: 2160, fps: 60, preset: 'medium' }), textImages, () => undefined);
    setTimeout(() => job.abort.abort(), 1500);
    await expect(job.promise).rejects.toThrow(/cancelada/);
    expect(fs.existsSync(out)).toBe(false);
    expect(fs.existsSync(out.replace('.mp4', '.rendering.mp4'))).toBe(false);
  });

  it('gera a mistura de áudio para legendas automáticas', async () => {
    const { p } = complexProject();
    const wav = await renderAudioMix(p);
    const info = await probe(wav);
    expect(info.kind).toBe('audio');
    expect(info.sampleRate).toBe(16000);
    expect(info.channels).toBe(1);
    expect(info.duration).toBeGreaterThan(8.5);
  });

  it('suporta clip só com áudio removido e projeto vazio de áudio', async () => {
    const p = createProject('Mudo', 640, 360, 24);
    p.media.push(vid);
    const c = clipFromMedia(vid, p.tracks[0].id, 0); c.duration = 1; c.muted = true;
    p.clips.push(c, baseClip('text', p.tracks[0].id, 1, 0.5)); // texto sem imagem é ignorado
    const out = path.join(OUT, 'mute.mp4');
    const res = await exportProject(p, baseOpts({ outputPath: out, width: 640, height: 360, fps: 24 }));
    expect(res.audioCodec).toBe('aac');
    expect(res.fps).toBe(24);
  });
});

describe('animações, efeitos e transições (catálogo completo)', () => {
  it('exporta todos os efeitos, animações, movimentos e transições sem erros', async () => {
    const { EFFECTS, TRANSITIONS, ANIMS, MOTIONS } = await import('../shared/looks');
    const p = createProject('Catálogo', 1280, 720, 30);
    p.media.push(vid, vid2, img);
    const tv = p.tracks[0].id;
    const text = createTrack('text', 'T');
    p.tracks.unshift(text);
    let t = 0;
    // uma sequência com todas as transições
    TRANSITIONS.forEach((tr, i) => {
      const c = clipFromMedia(i % 2 ? vid2 : img, tv, t); c.duration = 1;
      if (i > 0) c.transitionIn = { type: tr.type, duration: 0.4 };
      if (i === 0) c.transitionIn = null;
      p.clips.push(c); t += 1;
    });
    // transição do 1.º tipo também (o 1.º clip não tem anterior)
    const extra = clipFromMedia(vid, tv, t); extra.duration = 1; extra.transitionIn = { type: TRANSITIONS[0].type, duration: 0.4 }; p.clips.push(extra);
    // textos com todas as animações de entrada/saída e movimentos
    const anims = ANIMS.filter((a) => a.type !== 'none');
    anims.forEach((an, i) => {
      const c = createTextClip(text.id, i * 0.6, an.name); c.duration = 0.6;
      c.animIn = { type: an.type, duration: 0.25 }; c.animOut = { type: anims[(i + 3) % anims.length].type, duration: 0.2 };
      const mo = MOTIONS[i % MOTIONS.length]; c.motion = { type: mo.type, intensity: 70 };
      p.clips.push(c);
    });
    // camadas com todos os efeitos
    const fxTrack = createTrack('video', 'FX');
    p.tracks.splice(1, 0, fxTrack);
    EFFECTS.forEach((ef, i) => {
      const c = clipFromMedia(vid2, fxTrack.id, i * 0.8); c.duration = 0.8; c.transform.scale = 0.5;
      c.effects.push({ id: 'x' + i, type: ef.type, intensity: 80 });
      p.clips.push(c);
    });
    const textImages: Record<string, any> = {};
    for (const c of p.clips) if (c.type === 'text') textImages[c.id] = { path: textPng, width: 300, height: 50 };
    const out = path.join(OUT, 'catalog.mp4');
    const res = await exportProject(p, baseOpts({ outputPath: out, width: 1280, height: 720 }), textImages);
    expect(res.width).toBe(1280);
    expect(res.duration).toBeGreaterThan(t);
  });

  it('cortina revela metade a meio da animação e o espelho é simétrico', async () => {
    const p = createProject('Px2', 1280, 720, 30);
    p.media.push(red, vid);
    p.settings.background = '#0000ff';
    const c = clipFromMedia(red, p.tracks[0].id, 0); c.duration = 3; c.transform.scale = 2; // cobre o canvas
    c.animIn = { type: 'wipeRight', duration: 2 };
    p.clips.push(c);
    const top = createTrack('video', 'M'); p.tracks.unshift(top);
    const m = clipFromMedia(vid, top.id, 0); m.duration = 3; m.transform.scale = 0.5; m.transform.y = 0.25;
    m.effects.push({ id: 'mi', type: 'mirror', intensity: 100 });
    p.clips.push(m);
    const out = path.join(OUT, 'wipe.mp4');
    await exportProject(p, baseOpts({ outputPath: out, width: 1280, height: 720, crf: 10 }));
    // easeOut(0.5)=0.875 → revelado até ~87% da largura em t=1 s
    const left = await pixel(out, 1, 200, 100), right = await pixel(out, 1, 1240, 100);
    expect(left[0]).toBeGreaterThan(200); expect(left[2]).toBeLessThan(60);
    expect(right[2]).toBeGreaterThan(200); expect(right[0]).toBeLessThan(60);
    // espelho: píxeis simétricos em relação ao centro da camada (x=640)
    const a = await pixel(out, 1.5, 640 - 120, 540), b = await pixel(out, 1.5, 640 + 118, 540);
    for (let i = 0; i < 3; i++) expect(Math.abs(a[i] - b[i])).toBeLessThan(30);
  });
});
