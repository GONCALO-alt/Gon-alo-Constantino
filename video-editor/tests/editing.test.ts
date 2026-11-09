// Testes das operações de edição da timeline (funções puras sobre o projeto).
import { describe, it, expect } from 'vitest';
import { produce } from 'immer';
import type { MediaAsset, Project } from '../shared/types';
import { createProject, clipFromMedia, createTextClip } from '../shared/defaults';
import { clipEnd, projectDuration, prevAdjacent, transitionTail, effectiveTransitionIn } from '../shared/timeline';
import { clipAnimation, keyframeExpr, valueAt, volumeExpr } from '../shared/animation';
import { evalExpr, toFFmpeg } from '../shared/expr';
import { parseSrt, toSrt } from '../shared/srt';
import {
  addMediaClip, deleteClips, detachAudio, findFreeTrack, insertFreeze, splitClip, setTransition, overlaps,
} from '../src/store/editor';
import { splitSegments } from '../src/captions/captions';

const media = (o: Partial<MediaAsset> = {}): MediaAsset => ({
  id: 'm1', name: 'v.mp4', path: '/x/v.mp4', kind: 'video', duration: 10, width: 1920, height: 1080, fps: 30,
  hasAudio: true, hasVideo: true, size: 1, importedAt: 0, ...o,
});

const base = (): Project => {
  const p = createProject('T');
  p.media.push(media(), media({ id: 'a1', kind: 'audio', name: 'm.mp3', hasVideo: false }));
  return p;
};

describe('operações de edição', () => {
  it('divide um clip preservando a fonte e os keyframes', () => {
    let p = base();
    const c = clipFromMedia(p.media[0], p.tracks[0].id, 0);
    c.speed = 2; c.duration = 5; c.in = 1;
    c.keyframes.opacity = [{ t: 0, v: 0, ease: 'linear' }, { t: 4, v: 1, ease: 'linear' }];
    p.clips.push(c);
    p = produce(p, (d) => { splitClip(d, c.id, 2); });
    const [a, b] = [...p.clips].sort((x, y) => x.start - y.start);
    expect(a.duration).toBeCloseTo(2);
    expect(b.start).toBeCloseTo(2);
    expect(b.duration).toBeCloseTo(3);
    expect(b.in).toBeCloseTo(1 + 2 * 2); // in + local*speed
    expect(valueAt(a.keyframes.opacity, 1, 2)).toBeCloseTo(0.5);
    expect(valueAt(b.keyframes.opacity, 1, 0)).toBeCloseTo(0.5);
    expect(valueAt(b.keyframes.opacity, 1, 2)).toBeCloseTo(1);
  });

  it('coloca clips em pistas livres quando há sobreposição', () => {
    let p = base();
    p = produce(p, (d) => {
      addMediaClip(d, d.media[0] as MediaAsset, 0);
      addMediaClip(d, d.media[0] as MediaAsset, 5); // sobrepõe-se ao primeiro (0..10)
    });
    const tracks = new Set(p.clips.map((c) => c.trackId));
    expect(tracks.size).toBe(2);
    expect(p.tracks.filter((t) => t.kind === 'video').length).toBe(2);
    const t = p.clips[0].trackId;
    expect(overlaps(p, t, 3, 4)).toBe(true);
    expect(produce(p, (d) => { expect(findFreeTrack(d, 'video', 20, 25)).toBeTruthy(); })).toBeTruthy();
  });

  it('separa o áudio do vídeo para uma pista de áudio ligada', () => {
    let p = base();
    const c = clipFromMedia(p.media[0], p.tracks[0].id, 1);
    p.clips.push(c);
    p = produce(p, (d) => { detachAudio(d, c.id); });
    const v = p.clips.find((x) => x.type === 'video')!;
    const a = p.clips.find((x) => x.type === 'audio')!;
    expect(v.muted).toBe(true);
    expect(a.muted).toBe(false);
    expect(a.start).toBe(v.start);
    expect(a.linkId).toBe(v.linkId);
    expect(p.tracks.find((t) => t.id === a.trackId)!.kind).toBe('audio');
  });

  it('congela um fotograma inserindo 3 s e empurrando o resto da pista', () => {
    let p = base();
    const c1 = clipFromMedia(p.media[0], p.tracks[0].id, 0);
    const c2 = clipFromMedia(p.media[0], p.tracks[0].id, 10);
    p.clips.push(c1, c2);
    const frame = media({ id: 'f1', kind: 'image', duration: 0, name: 'frame.png' });
    p = produce(p, (d) => { insertFreeze(d, c1.id, 4, frame, 3); });
    const onTrack = p.clips.filter((c) => c.trackId === p.tracks[0].id).sort((a, b) => a.start - b.start);
    expect(onTrack.map((c) => c.type)).toEqual(['video', 'image', 'video', 'video']);
    expect(onTrack[1].start).toBeCloseTo(4);
    expect(onTrack[2].start).toBeCloseTo(7);
    expect(onTrack[3].start).toBeCloseTo(13);
    expect(projectDuration(p)).toBeCloseTo(23);
  });

  it('congelar fotograma mantém o áudio separado sincronizado', () => {
    let p = base();
    const v = clipFromMedia(p.media[0], p.tracks[0].id, 0);
    p.clips.push(v);
    p = produce(p, (d) => { detachAudio(d, v.id); });
    const frame = media({ id: 'f2', kind: 'image', duration: 0 });
    p = produce(p, (d) => { insertFreeze(d, v.id, 4, frame, 3); });
    const vids = p.clips.filter((c) => c.type === 'video').sort((a, b) => a.start - b.start);
    const auds = p.clips.filter((c) => c.type === 'audio').sort((a, b) => a.start - b.start);
    expect(auds).toHaveLength(2);
    expect(auds[1].start).toBeCloseTo(vids[1].start);
    expect(auds[1].in).toBeCloseTo(vids[1].in);
  });

  it('apaga com ripple e remove transições órfãs', () => {
    let p = base();
    const t = p.tracks[0].id;
    const a = clipFromMedia(p.media[0], t, 0); a.duration = 3;
    const b = clipFromMedia(p.media[0], t, 3); b.duration = 3;
    const c = clipFromMedia(p.media[0], t, 6); c.duration = 3;
    p.clips.push(a, b, c);
    p = produce(p, (d) => { setTransition(d, c.id, { type: 'dissolve', duration: 1 }); });
    expect(p.clips.find((x) => x.id === c.id)!.transitionIn?.type).toBe('dissolve');
    p = produce(p, (d) => { deleteClips(d, [b.id], true); });
    const cc = p.clips.find((x) => x.id === c.id)!;
    expect(cc.start).toBeCloseTo(3);
    expect(prevAdjacent(p, cc)?.id).toBe(a.id);
    expect(cc.transitionIn?.type).toBe('dissolve'); // continua encostado
    p = produce(p, (d) => { deleteClips(d, [a.id], false); });
    expect(p.clips.find((x) => x.id === c.id)!.transitionIn).toBeNull();
  });

  it('transição: prolonga o clip anterior e anima o seguinte', () => {
    const p = base();
    const t = p.tracks[0].id;
    const a = clipFromMedia(p.media[0], t, 0); a.duration = 4;
    const b = clipFromMedia(p.media[0], t, 4); b.duration = 4;
    b.transitionIn = { type: 'dissolve', duration: 1 };
    p.clips.push(a, b);
    expect(transitionTail(p, a)).toBeCloseTo(1);
    expect(effectiveTransitionIn(p, b)).toBeCloseTo(1);
    const anim = clipAnimation(p, b);
    expect(evalExpr(anim.opacity, 0)).toBeCloseTo(0);
    expect(evalExpr(anim.opacity, 0.5)).toBeCloseTo(0.5);
    expect(evalExpr(anim.opacity, 1.5)).toBeCloseTo(1);
  });

  it('volume com fades e keyframes', () => {
    const p = base();
    const c = clipFromMedia(p.media[1], p.tracks[1].id, 0);
    c.duration = 10; c.fadeIn = 2; c.fadeOut = 2;
    c.keyframes.volume = [{ t: 0, v: 1, ease: 'linear' }, { t: 10, v: 2, ease: 'linear' }];
    const v = volumeExpr(c);
    expect(evalExpr(v, 1)).toBeCloseTo(0.5 * 1.1);
    expect(evalExpr(v, 5)).toBeCloseTo(1.5);
    expect(evalExpr(v, 9)).toBeCloseTo(0.5 * 1.9);
  });

  it('expressões: a avaliação em JS e a conversão para FFmpeg são coerentes', () => {
    const e = keyframeExpr([{ t: 0, v: 0, ease: 'easeInOut' }, { t: 2, v: 10, ease: 'easeOut' }, { t: 3, v: 4, ease: 'linear' }], 0);
    const f = toFFmpeg(e, 't');
    // avalia a string FFmpeg com um mini-intérprete (if/lt/min/max/pow) para comparar
    const js = f.replace(/if\(/g, 'IF(').replace(/lt\(/g, 'LT(').replace(/\bt\b/g, 'T');
    // eslint-disable-next-line no-new-func
    const fn = new Function('T', 'IF', 'LT', 'min', 'max', 'pow', `return ${js};`);
    for (const t of [-1, 0, 0.5, 1, 1.7, 2, 2.4, 3, 5]) {
      const r = fn(t, (c: number, a: number, b: number) => (c ? a : b), (a: number, b: number) => (a < b ? 1 : 0), Math.min, Math.max, Math.pow);
      expect(r).toBeCloseTo(evalExpr(e, t), 6);
    }
  });
});

describe('legendas', () => {
  it('SRT: exporta e volta a importar sem perdas', () => {
    const segs = [{ start: 0.5, end: 2.25, text: 'Olá mundo' }, { start: 3, end: 4.999, text: 'Segunda\nlinha' }];
    const back = parseSrt(toSrt(segs));
    expect(back).toHaveLength(2);
    expect(back[0].start).toBeCloseTo(0.5);
    expect(back[1].end).toBeCloseTo(4.999);
    expect(back[1].text).toBe('Segunda\nlinha');
  });
  it('divide frases longas em legendas curtas mantendo o intervalo total', () => {
    const out = splitSegments([{ start: 0, end: 10, text: 'Esta é uma frase bastante longa que precisa de ser dividida em várias legendas curtas e legíveis' }]);
    expect(out.length).toBeGreaterThan(1);
    expect(out.every((s) => s.text.length <= 42)).toBe(true);
    expect(out[0].start).toBe(0);
    expect(out[out.length - 1].end).toBeCloseTo(10);
  });
  it('textos são clips normais da timeline', () => {
    const p = base();
    const t = createTextClip(p.tracks[0].id, 1, 'Olá');
    expect(clipEnd(t)).toBe(5);
  });
});
