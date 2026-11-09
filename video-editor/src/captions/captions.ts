import type { CaptionSegment, Clip, Project, TextStyle } from '@shared/types';
import { CAPTION_STYLE, createTextClip, createTrack } from '@shared/defaults';
import { clipEnd } from '@shared/timeline';
import { useEditor } from '../store/editor';
import type { Draft } from 'immer';

/** Divide frases longas em legendas curtas (~42 caracteres, máximo 2 linhas), repartindo o tempo pelos caracteres. */
export function splitSegments(segs: CaptionSegment[], maxChars = 42): CaptionSegment[] {
  const out: CaptionSegment[] = [];
  for (const s of segs) {
    const text = s.text.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    if (text.length <= maxChars) { out.push({ ...s, text }); continue; }
    const words = text.split(' ');
    const parts: string[] = [];
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > maxChars && cur) { parts.push(cur.trim()); cur = w; }
      else cur = `${cur} ${w}`;
    }
    if (cur.trim()) parts.push(cur.trim());
    const total = parts.reduce((a, p) => a + p.length, 0);
    let t = s.start;
    for (const p of parts) {
      const d = ((s.end - s.start) * p.length) / total;
      out.push({ start: t, end: t + d, text: p });
      t += d;
    }
  }
  return out;
}

export function captionTracks(p: Project) {
  return p.tracks.filter((t) => t.caption);
}

/** Cria uma pista de legendas com um clip de texto por frase. */
export function insertCaptions(segs: CaptionSegment[], name = 'Legendas', style: TextStyle = CAPTION_STYLE): string {
  let trackId = '';
  useEditor.getState().commit((d) => {
    const t = createTrack('text', name);
    t.caption = true;
    d.tracks.unshift(t);
    trackId = t.id;
    let lastEnd = 0;
    for (const s of segs) {
      const start = Math.max(s.start, lastEnd);
      const end = Math.max(start + 0.2, s.end);
      const c = createTextClip(t.id, start, s.text, style, end - start);
      c.transform.y = 0.38;
      d.clips.push(c as Draft<Clip>);
      lastEnd = end;
    }
  });
  return trackId;
}

export function trackSegments(p: Project, trackId: string): CaptionSegment[] {
  return p.clips.filter((c) => c.trackId === trackId && c.type === 'text').sort((a, b) => a.start - b.start)
    .map((c) => ({ start: c.start, end: clipEnd(c), text: c.text ?? '' }));
}

/** Converte a mistura de áudio WAV (PCM 16 bits mono 16 kHz) em Float32. */
export function wavToFloat32(buf: ArrayBuffer): Float32Array {
  const dv = new DataView(buf);
  let off = 12;
  while (off < dv.byteLength - 8) {
    const id = String.fromCharCode(dv.getUint8(off), dv.getUint8(off + 1), dv.getUint8(off + 2), dv.getUint8(off + 3));
    const size = dv.getUint32(off + 4, true);
    if (id === 'data') {
      const n = Math.floor(Math.min(size, dv.byteLength - off - 8) / 2);
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = dv.getInt16(off + 8 + i * 2, true) / 32768;
      return out;
    }
    off += 8 + size + (size % 2);
  }
  return new Float32Array(0);
}

export const LANGUAGES: [string, string][] = [
  ['auto', 'Detetar automaticamente'], ['portuguese', 'Português'], ['english', 'Inglês'], ['spanish', 'Espanhol'], ['french', 'Francês'],
  ['german', 'Alemão'], ['italian', 'Italiano'], ['dutch', 'Neerlandês'], ['japanese', 'Japonês'], ['chinese', 'Chinês'], ['russian', 'Russo'],
  ['arabic', 'Árabe'], ['hindi', 'Hindi'], ['korean', 'Coreano'], ['polish', 'Polaco'], ['turkish', 'Turco'], ['ukrainian', 'Ucraniano'],
];
export const LANG_NAMES: Record<string, string> = {
  pt: 'Português', en: 'Inglês', es: 'Espanhol', fr: 'Francês', de: 'Alemão', it: 'Italiano', nl: 'Neerlandês', ja: 'Japonês', zh: 'Chinês',
  ru: 'Russo', ar: 'Árabe', hi: 'Hindi', ko: 'Coreano', pl: 'Polaco', tr: 'Turco', uk: 'Ucraniano', sv: 'Sueco', ca: 'Catalão', gl: 'Galego',
};
