// Gera o comando FFmpeg (argumentos + filtergraph) que renderiza o projeto completo.
// É uma função pura: recebe o projeto e as opções e devolve o comando, o que permite
// testá-la diretamente com o FFmpeg real (ver tests/export.test.ts).
import type { Clip, ExportOptions, MediaAsset, Project } from './types';
import { clipAnimation, keyframeExpr } from './animation';
import { Expr, div, isConst, rangeOf, sub, toFFmpeg } from './expr';
import { baseSize, even } from './geometry';
import {
  blurSigma, eqParams, filterChannel, filterMono, filterSaturation, getFilter, glitchShift,
  grainStrength, isNeutralColor, sharpenAmount, tempTintGains, vignetteAngle,
} from './looks';
import { getMedia, getTrack, projectDuration, transitionTail } from './timeline';

export interface TextImage { path: string; width: number; height: number }

export interface BuildContext {
  textImages: Record<string, TextImage>;
  filterScriptPath: string; // onde o runner vai gravar o filtergraph
  scriptFlag?: '-filter_complex_script' | '-/filter_complex';
  vaapiDevice?: string;
  audioOnly?: boolean; // gera só a mistura de áudio (legendas automáticas)
}

export interface BuiltCommand {
  args: string[];
  filterGraph: string;
  duration: number;
  layers: number;
  audioTracks: number;
}

const n6 = (v: number) => Number(v.toFixed(6)).toString();
const q = (s: string) => `'${s.replace(/'/g, "\\'")}'`;

function atempoChain(speed: number): string[] {
  const out: string[] = [];
  let s = speed;
  while (s > 2.0) { out.push('atempo=2'); s /= 2; }
  while (s < 0.5) { out.push('atempo=0.5'); s /= 0.5; }
  if (Math.abs(s - 1) > 1e-6) out.push(`atempo=${n6(s)}`);
  return out;
}

export function buildExportCommand(project: Project, opt: ExportOptions, ctx: BuildContext): BuiltCommand {
  const W = opt.width, H = opt.height, FPS = opt.fps;
  const total = Math.max(1 / FPS, projectDuration(project));
  const inputs: string[] = [];
  const chains: string[] = [];
  let inputIndex = 0;
  const addInput = (args: string[]) => { inputs.push(...args); return inputIndex++; };

  const trackOrder = new Map(project.tracks.map((t, i) => [t.id, i]));
  const clips = [...project.clips].sort((a, b) => {
    const ta = trackOrder.get(a.trackId) ?? 0, tb = trackOrder.get(b.trackId) ?? 0;
    if (ta !== tb) return tb - ta; // pistas de baixo primeiro
    return a.start - b.start;
  });

  if (!ctx.audioOnly) chains.push(`color=c=${project.settings.background || 'black'}:s=${W}x${H}:r=${FPS}:d=${n6(total)},format=yuv420p,setsar=1[base0]`);
  let baseLabel = 'base0';
  let layerCount = 0;
  const audioLabels: string[] = [];
  const mediaInput = new Map<string, number>(); // clip.id -> índice de input

  for (const c of clips) {
    const track = getTrack(project, c.trackId);
    if (!track) continue;
    const media = getMedia(project, c.mediaId);
    const tail = transitionTail(project, c);
    const visDur = c.duration + tail;

    // ---------- Entradas ----------
    const needsVideo = !ctx.audioOnly && !track.hidden && (c.type === 'video' || c.type === 'image' || c.type === 'text');
    const needsAudio = opt.includeAudio && !track.muted && !c.muted
      && (c.type === 'audio' || (c.type === 'video' && !!media?.hasAudio));
    if (!needsVideo && !needsAudio) continue;

    let idx: number;
    if (c.type === 'text') {
      const img = ctx.textImages[c.id];
      if (!img) continue;
      idx = addInput(['-loop', '1', '-framerate', String(FPS), '-t', n6(visDur + 0.1), '-i', img.path]);
    } else if (c.type === 'image') {
      if (!media) continue;
      idx = addInput(['-loop', '1', '-framerate', String(FPS), '-t', n6(visDur + 0.1), '-i', media.path]);
    } else {
      if (!media) continue;
      const span = (needsVideo ? visDur : c.duration) * c.speed + 0.25;
      const pre = opt.hwDecode && c.type === 'video' ? ['-hwaccel', 'auto'] : [];
      idx = addInput([...pre, '-ss', n6(Math.max(0, c.in)), '-t', n6(span), '-i', media.path]);
    }
    mediaInput.set(c.id, idx);

    // ---------- Vídeo ----------
    const a = needsVideo ? clipAnimation(project, c) : null;
    if (a && !(isConst(a.opacity) && a.opacity <= 0)) {
      const L = `L${layerCount}`;
      const stmts: string[] = [];
      let cur = `[${idx}:v]`;
      let f: string[] = [];
      let seg = 0;
      const flush = () => {
        const lbl = `${L}_${seg++}`;
        stmts.push(`${cur}${f.length ? f.join(',') : 'null'}[${lbl}]`);
        cur = `[${lbl}]`;
        f = [];
        return lbl;
      };
      /** Máscara animada: geq num mapa 2×2 ampliado para o tamanho da camada (funciona em qualquer FFmpeg ≥ 4). */
      const mask = (rgb: Expr, alpha: Expr, w: number, h: number) => {
        const lbl = `${L}_m${seg++}`;
        const e = (x: Expr) => q(`255*clip(${toFFmpeg(x, 'T')},0,1)`);
        stmts.push(`color=c=white:s=2x2:r=${FPS}:d=${n6(visDur)},format=gbrap,geq=r=${e(rgb)}:g=${e(rgb)}:b=${e(rgb)}:a=${e(alpha)},scale=${w}:${h}:flags=neighbor[${lbl}]`);
        return lbl;
      };
      /** Mistura animada entre a camada atual e uma versão processada (desfoque/glitch). */
      const crossfade = (processed: string[], weight: Expr, w: number, h: number) => {
        const src = flush();
        const s = `${L}_s${seg}`, b0 = `${L}_b${seg}`, b1 = `${L}_p${seg}`, bm = `${L}_q${seg}`;
        seg++;
        stmts.push(`[${src}]split[${s}][${b0}]`);
        stmts.push(`[${b0}]${processed.join(',')},format=gbrap[${b1}]`);
        const m = mask(1, weight, w, h);
        stmts.push(`[${b1}][${m}]blend=all_mode=multiply[${bm}]`);
        const out = `${L}_x${seg++}`;
        stmts.push(`[${s}]format=rgba[${s}r];[${s}r][${bm}]overlay=format=rgb:eof_action=pass[${out}]`);
        cur = `[${out}]`;
      };

      f.push(c.type === 'video' && c.speed !== 1 ? `setpts=(PTS-STARTPTS)/${n6(c.speed)}` : 'setpts=PTS-STARTPTS');
      f.push(`fps=${FPS}`);
      f.push(`tpad=stop_mode=clone:stop_duration=${n6(visDur + 1)}`);
      f.push(`trim=duration=${n6(visDur)}`, 'setpts=PTS-STARTPTS');

      // Recorte
      const cr = c.crop;
      if (c.type !== 'text' && (cr.l || cr.r || cr.t || cr.b)) {
        f.push(`crop=w=iw*${n6(1 - cr.l - cr.r)}:h=ih*${n6(1 - cr.t - cr.b)}:x=iw*${n6(cr.l)}:y=ih*${n6(cr.t)}`);
      }

      // Escala
      const textDims = ctx.textImages[c.id];
      const bs = baseSize(c, media, W, H, textDims);
      const scaleAnimated = !isConst(a.scale);
      const rotAnimated = !isConst(a.rotation);
      const perspectivePath = scaleAnimated || rotAnimated;
      const sRange = rangeOf(a.scale, 0, visDur);
      let smax = perspectivePath ? sRange.max : (a.scale as number);
      // Limita a resolução intermédia para manter a exportação viável
      const diagCanvas = Math.hypot(W, H);
      const maxDim = Math.max(bs.w, bs.h) * smax;
      if (maxDim > diagCanvas * 2) smax = (diagCanvas * 2) / Math.max(bs.w, bs.h);
      const lw = even(bs.w * smax), lh = even(bs.h * smax);
      f.push(`scale=${lw}:${lh}:flags=lanczos`, 'setsar=1');
      if (c.transform.flipH) f.push('hflip');
      if (c.transform.flipV) f.push('vflip');

      // Cor
      if (!isNeutralColor(c.color)) {
        const e = eqParams(c.color);
        f.push(`eq=brightness=${n6(e.brightness)}:contrast=${n6(e.contrast)}:saturation=${n6(e.saturation)}`);
        const g = tempTintGains(c.color);
        if (g.r !== 1 || g.g !== 1 || g.b !== 1) f.push(`format=rgba`, `colorchannelmixer=rr=${n6(g.r)}:gg=${n6(g.g)}:bb=${n6(g.b)}`);
      }
      // Filtro (look)
      if (c.filter && getFilter(c.filter.id) && c.filter.intensity > 0) {
        const fd = getFilter(c.filter.id)!;
        const mono = filterMono(fd.id, c.filter.intensity);
        if (mono > 0) f.push(`hue=s=${n6(1 - mono)}`);
        const ch = (e: Expr) => q(`clip(255*(${toFFmpeg(filterChannel(e, c.filter!.intensity), 'val/255')}),0,255)`);
        f.push(`format=rgba`, `lutrgb=r=${ch(fd.r)}:g=${ch(fd.g)}:b=${ch(fd.b)}`);
        const fs = filterSaturation(fd.id, c.filter.intensity);
        if (Math.abs(fs - 1) > 1e-3) f.push(`eq=saturation=${n6(fs)}`);
      }
      // Efeitos (ordem canónica, igual à do shader da pré-visualização)
      const ORDER = ['sharpen', 'bw', 'sepia', 'invert', 'vignette', 'grain'];
      for (const ef of [...c.effects].sort((x, y) => ORDER.indexOf(x.type) - ORDER.indexOf(y.type))) {
        const k = ef.intensity / 100;
        if (k <= 0) continue;
        switch (ef.type) {
          case 'sharpen': f.push(`unsharp=5:5:${n6(sharpenAmount(ef.intensity))}:5:5:0`); break;
          case 'vignette': f.push(`vignette=angle=${n6(vignetteAngle(ef.intensity))}`); break;
          case 'grain': f.push(`noise=alls=${Math.round(grainStrength(ef.intensity))}:allf=t+u`); break;
          case 'bw': f.push(`hue=s=${n6(1 - k)}`); break;
          case 'sepia': {
            const m = (s: number, i: number) => n6(i * (1 - k) + s * k);
            f.push(`format=rgba`, `colorchannelmixer=rr=${m(0.393, 1)}:rg=${m(0.769, 0)}:rb=${m(0.189, 0)}:gr=${m(0.349, 0)}:gg=${m(0.686, 1)}:gb=${m(0.168, 0)}:br=${m(0.272, 0)}:bg=${m(0.534, 0)}:bb=${m(0.131, 1)}`);
            break;
          }
          case 'invert': {
            const ex = q(`val+(255-2*val)*${n6(k)}`);
            f.push(`format=rgba`, `lutrgb=r=${ex}:g=${ex}:b=${ex}`);
            break;
          }
        }
      }
      // Desfoque estático
      if (a.blurStatic > 0) f.push(`gblur=sigma=${n6(blurSigma(a.blurStatic, H))}`);
      f.push('format=rgba');
      // Desfoque animado: mistura com a versão desfocada ao máximo
      if (!isConst(a.blur) || (a.blur as number) > 0) {
        const r = rangeOf(a.blur, 0, visDur);
        if (r.max > 0.5) crossfade([`gblur=sigma=${n6(blurSigma(r.max, H))}`], div(a.blur, r.max), lw, lh);
      }
      // Glitch: mistura com a versão com separação RGB máxima
      if (!isConst(a.glitch) || (a.glitch as number) > 0) {
        const r = rangeOf(a.glitch, 0, visDur, 600);
        if (r.max > 0.5) {
          const px = Math.max(1, Math.round(glitchShift(r.max, H)));
          crossfade(['format=rgba', `rgbashift=rh=${-px}:bh=${px}:gv=${Math.round(px / 3)}:edge=smear`], div(a.glitch, r.max), lw, lh);
        }
      }
      // Opacidade / fade para preto
      const opacityAnimated = !isConst(a.opacity) || !isConst(a.black);
      if (opacityAnimated) {
        f.push('format=gbrap');
        const src = flush();
        const m = mask(sub(1, a.black), a.opacity, lw, lh);
        const out = `${L}_o${seg++}`;
        stmts.push(`[${src}][${m}]blend=all_mode=multiply,format=rgba[${out}]`);
        cur = `[${out}]`;
      } else {
        const op = a.opacity as number, b = 1 - (a.black as number);
        if (op < 1 || b < 1) f.push(`colorchannelmixer=rr=${n6(b)}:gg=${n6(b)}:bb=${n6(b)}:aa=${n6(op)}`);
      }
      // Geometria: rotação / escala animada
      if (perspectivePath) {
        const box = even(Math.ceil(Math.hypot(lw, lh)) + 4);
        f.push('format=yuva444p', `pad=${box}:${box}:(ow-iw)/2:(oh-ih)/2:color=black@0`);
        const Tv = `in/${FPS}`;
        const kE = `max(${toFFmpeg(a.scale, Tv)}/${n6(smax)},0.002)`;
        const th = `(${toFFmpeg(a.rotation, Tv)})*PI/180`;
        const c0 = box / 2;
        const corners = [[-c0, -c0], [c0, -c0], [-c0, c0], [c0, c0]];
        const parts = corners.map(([dx, dy], i) => {
          const X = `${c0}+${kE}*((${dx})*cos(${th})-(${dy})*sin(${th}))`;
          const Y = `${c0}+${kE}*((${dx})*sin(${th})+(${dy})*cos(${th}))`;
          return `x${i}=${q(X)}:y${i}=${q(Y)}`;
        });
        f.push(`perspective=sense=destination:eval=frame:interpolation=linear:${parts.join(':')}`);
      } else if (Math.abs(a.rotation as number) > 1e-3) {
        const rad = ((a.rotation as number) * Math.PI) / 180;
        const rw = even(Math.abs(lw * Math.cos(rad)) + Math.abs(lh * Math.sin(rad)) + 2);
        const rh = even(Math.abs(lw * Math.sin(rad)) + Math.abs(lh * Math.cos(rad)) + 2);
        f.push(`rotate=a=${n6(rad)}:ow=${rw}:oh=${rh}:c=none:bilinear=1`);
      }
      f.push(`setpts=PTS+${n6(c.start)}/TB`);
      stmts.push(`${cur}${f.join(',')}[${L}]`);
      chains.push(...stmts);

      const Tg = `t-${n6(c.start)}`;
      const xE = `W/2+(${toFFmpeg(a.x, Tg)})*W-w/2`;
      const yE = `H/2+(${toFFmpeg(a.y, Tg)})*H-h/2`;
      const posAnimated = !isConst(a.x) || !isConst(a.y);
      const next = `base${layerCount + 1}`;
      chains.push(`[${baseLabel}][${L}]overlay=x=${q(xE)}:y=${q(yE)}:eval=${posAnimated ? 'frame' : 'init'}:eof_action=pass:shortest=0[${next}]`);
      baseLabel = next;
      layerCount++;
    }

    // ---------- Áudio ----------
    if (needsAudio) {
      const A = `A${audioLabels.length}`;
      const f: string[] = ['asetpts=PTS-STARTPTS', 'aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo'];
      f.push(...atempoChain(c.speed));
      f.push(`apad=whole_dur=${n6(c.duration)}`, `atrim=duration=${n6(c.duration)}`, 'asetpts=PTS-STARTPTS');
      const vol = keyframeExpr(c.keyframes.volume, c.volume);
      if (isConst(vol)) { if (vol !== 1) f.push(`volume=${n6(vol)}`); }
      else f.push(`volume=${q(toFFmpeg(vol, 't'))}:eval=frame`);
      if (c.fadeIn > 0) f.push(`afade=t=in:st=0:d=${n6(c.fadeIn)}`);
      if (c.fadeOut > 0) f.push(`afade=t=out:st=${n6(Math.max(0, c.duration - c.fadeOut))}:d=${n6(c.fadeOut)}`);
      if (c.start > 0) f.push(`adelay=delays=${Math.round(c.start * 1000)}:all=1`);
      chains.push(`[${idx}:a]${f.join(',')}[${A}]`);
      audioLabels.push(A);
    }
  }

  // Saída de vídeo
  let vOut = baseLabel;
  const isVaapi = opt.encoder.endsWith('_vaapi');
  if (!ctx.audioOnly) chains.push(`[${vOut}]format=${isVaapi ? 'nv12' : opt.encoder.endsWith('_qsv') ? 'nv12' : 'yuv420p'}${isVaapi ? ',hwupload' : ''}[vout]`);
  vOut = 'vout';

  // Saída de áudio
  if (opt.includeAudio) {
    if (audioLabels.length > 0) {
      chains.push(`${audioLabels.map((l) => `[${l}]`).join('')}amix=inputs=${audioLabels.length}:normalize=0:dropout_transition=0,apad,atrim=duration=${n6(total)},alimiter=limit=0.98:level=disabled[aout]`);
    } else {
      chains.push(`anullsrc=r=48000:cl=stereo,atrim=duration=${n6(total)}[aout]`);
    }
  }

  const filterGraph = chains.join(';\n');
  const args: string[] = ['-hide_banner', '-y', '-nostdin'];
  if (isVaapi) args.push('-vaapi_device', ctx.vaapiDevice ?? '/dev/dri/renderD128');
  args.push(...inputs);
  args.push(ctx.scriptFlag ?? '-filter_complex_script', ctx.filterScriptPath);
  args.push('-map', `[${vOut}]`);
  if (opt.includeAudio) args.push('-map', '[aout]');
  args.push(...videoEncoderArgs(opt));
  if (opt.includeAudio) args.push('-c:a', 'aac', '-b:a', `${opt.audioBitrateKbps}k`, '-ar', '48000', '-ac', '2');
  args.push('-r', String(FPS), '-t', n6(total), '-movflags', '+faststart', '-progress', 'pipe:1', '-stats_period', '0.25', opt.outputPath);
  return { args, filterGraph, duration: total, layers: layerCount, audioTracks: audioLabels.length };
}

export function videoEncoderArgs(opt: ExportOptions): string[] {
  const e = opt.encoder;
  const br = `${opt.bitrateMbps}M`;
  const rate = (crfArgs: string[]) => opt.rateControl === 'crf'
    ? crfArgs
    : ['-b:v', br, '-maxrate', `${Math.round(opt.bitrateMbps * 1.5)}M`, '-bufsize', `${opt.bitrateMbps * 2}M`];
  const gop = ['-g', String(Math.round(opt.fps * 2))];
  if (e === 'libx264') {
    return ['-c:v', 'libx264', '-preset', opt.preset, '-profile:v', 'high', '-pix_fmt', 'yuv420p', ...rate(['-crf', String(opt.crf)]), ...gop];
  }
  if (e === 'libx265') {
    return ['-c:v', 'libx265', '-preset', opt.preset, '-tag:v', 'hvc1', '-pix_fmt', 'yuv420p', '-x265-params', 'log-level=error',
      ...rate(['-crf', String(opt.crf)]), ...gop];
  }
  if (e.endsWith('_nvenc')) {
    return ['-c:v', e, '-preset', 'p5', '-pix_fmt', 'yuv420p', ...(e.startsWith('hevc') ? ['-tag:v', 'hvc1'] : []),
      ...rate(['-rc', 'vbr', '-cq', String(opt.crf), '-b:v', '0']), ...gop];
  }
  if (e.endsWith('_qsv')) {
    return ['-c:v', e, '-preset', 'medium', ...(e.startsWith('hevc') ? ['-tag:v', 'hvc1'] : []),
      ...rate(['-global_quality', String(opt.crf)]), ...gop];
  }
  if (e.endsWith('_videotoolbox')) {
    return ['-c:v', e, ...(e.startsWith('hevc') ? ['-tag:v', 'hvc1'] : []), '-pix_fmt', 'yuv420p',
      ...rate(['-q:v', String(Math.round(100 - opt.crf * 1.6))]), ...gop];
  }
  if (e.endsWith('_amf')) {
    return ['-c:v', e, '-quality', 'quality', ...(e.startsWith('hevc') ? ['-tag:v', 'hvc1'] : []),
      ...rate(['-rc', 'cqp', '-qp_i', String(opt.crf), '-qp_p', String(opt.crf)]), ...gop];
  }
  if (e.endsWith('_vaapi')) {
    return ['-c:v', e, ...(e.startsWith('hevc') ? ['-tag:v', 'hvc1'] : []), ...rate(['-qp', String(opt.crf)]), ...gop];
  }
  return ['-c:v', e, '-b:v', br];
}

/** Comando para gerar uma mistura de áudio mono 16 kHz (usada nas legendas automáticas). */
export function buildAudioMixCommand(project: Project, outPath: string, scriptPath: string, scriptFlag?: BuildContext['scriptFlag']): BuiltCommand {
  const flag = scriptFlag ?? '-filter_complex_script';
  const built = buildExportCommand(project, {
    outputPath: outPath, width: 16, height: 16, fps: 10, codec: 'h264', encoder: 'libx264', rateControl: 'crf', crf: 30,
    bitrateMbps: 1, preset: 'ultrafast', audioBitrateKbps: 128, includeAudio: true, hwDecode: false,
  }, { textImages: {}, filterScriptPath: scriptPath, scriptFlag: flag, audioOnly: true });
  const inputArgs = built.args.slice(3, built.args.indexOf(flag));
  const args = ['-hide_banner', '-y', '-nostdin', ...inputArgs, flag, scriptPath, '-map', '[aout]', '-ac', '1', '-ar', '16000',
    '-c:a', 'pcm_s16le', '-t', n6(built.duration), outPath];
  return { ...built, args };
}

export type { MediaAsset, Clip };
