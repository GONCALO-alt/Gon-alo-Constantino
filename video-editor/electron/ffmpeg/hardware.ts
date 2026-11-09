// Deteção de codificadores disponíveis. Cada codificador de hardware é testado com uma
// codificação real de alguns fotogramas — só aparece na lista se funcionar nesta máquina.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { HardwareInfo, VideoCodec } from '../../shared/types';
import { ffPaths, ffmpegVersion, run } from './paths';

const CANDIDATES: { id: string; codec: VideoCodec; label: string; hardware: boolean }[] = [
  { id: 'libx264', codec: 'h264', label: 'H.264 (software x264)', hardware: false },
  { id: 'libx265', codec: 'hevc', label: 'H.265 / HEVC (software x265)', hardware: false },
  { id: 'h264_nvenc', codec: 'h264', label: 'H.264 NVIDIA NVENC', hardware: true },
  { id: 'hevc_nvenc', codec: 'hevc', label: 'HEVC NVIDIA NVENC', hardware: true },
  { id: 'h264_qsv', codec: 'h264', label: 'H.264 Intel Quick Sync', hardware: true },
  { id: 'hevc_qsv', codec: 'hevc', label: 'HEVC Intel Quick Sync', hardware: true },
  { id: 'h264_amf', codec: 'h264', label: 'H.264 AMD AMF', hardware: true },
  { id: 'hevc_amf', codec: 'hevc', label: 'HEVC AMD AMF', hardware: true },
  { id: 'h264_videotoolbox', codec: 'h264', label: 'H.264 Apple VideoToolbox', hardware: true },
  { id: 'hevc_videotoolbox', codec: 'hevc', label: 'HEVC Apple VideoToolbox', hardware: true },
  { id: 'h264_vaapi', codec: 'h264', label: 'H.264 VA-API', hardware: true },
  { id: 'hevc_vaapi', codec: 'hevc', label: 'HEVC VA-API', hardware: true },
];

let cache: HardwareInfo | null = null;

export async function detectHardware(): Promise<HardwareInfo> {
  if (cache) return cache;
  const { ffmpeg } = ffPaths();
  const list = await run(ffmpeg, ['-hide_banner', '-encoders']);
  const available = CANDIDATES.filter((c) => new RegExp(`\\s${c.id}\\s`).test(list.stdout));
  const tmp = path.join(os.tmpdir(), 'corte-hwtest');
  fs.mkdirSync(tmp, { recursive: true });
  const working: typeof CANDIDATES = [];
  for (const c of available) {
    if (!c.hardware) { working.push(c); continue; }
    const out = path.join(tmp, `${c.id}.mp4`);
    const pre = c.id.endsWith('_vaapi') ? ['-vaapi_device', '/dev/dri/renderD128'] : [];
    const vf = c.id.endsWith('_vaapi') ? ['-vf', 'format=nv12,hwupload'] : ['-pix_fmt', c.id.endsWith('_qsv') ? 'nv12' : 'yuv420p'];
    const r = await run(ffmpeg, ['-hide_banner', '-y', ...pre, '-f', 'lavfi', '-i', 'color=black:s=256x256:r=30:d=0.2', ...vf, '-c:v', c.id, '-frames:v', '5', out]);
    if (r.code === 0) working.push(c);
  }
  const v = ffmpegVersion();
  cache = { encoders: working, ffmpegVersion: v.text, ffmpegPath: ffmpeg };
  return cache;
}
