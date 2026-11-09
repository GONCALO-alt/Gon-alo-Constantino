import React, { useState } from 'react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, FlipHorizontal2, FlipVertical2, Italic, Underline, Trash2, Snowflake, AudioLines, RotateCcw, X,
} from 'lucide-react';
import type { AnimProp, Clip, ColorAdjust, Project, TextStyle } from '@shared/types';
import { ANIMS, EFFECTS, FILTERS, MOTIONS, TRANSITIONS } from '@shared/looks';
import { ASPECTS } from '@shared/defaults';
import { clipEnd, getMedia, maxTransition, prevAdjacent, fmtTime } from '@shared/timeline';
import { useEditor, setKeyframe, setTransition } from '../../store/editor';
import { usePlayback } from '../../store/playback';
import { Section, Slider, KfButton, Seg, Toggle, fmtBytes } from '../ui';
import { setAnimProp, currentValue } from '../Preview';
import { FONTS } from '../../engine/text';
import * as A from '../../actions';

type Tab = 'basic' | 'color' | 'speed' | 'audio' | 'anim' | 'fx' | 'text';

const upd = (id: string, fn: (c: Clip) => void, key?: string) =>
  useEditor.getState().commit((d) => { const c = d.clips.find((x) => x.id === id); if (c) fn(c as Clip); }, key);

export function Inspector() {
  const project = useEditor((s) => s.project);
  const selection = useEditor((s) => s.selection);
  const transitionSel = useEditor((s) => s.transitionSel);
  const [tab, setTab] = useState<Tab>('basic');
  const clip = selection.length === 1 ? project.clips.find((c) => c.id === selection[0]) : undefined;

  if (transitionSel) {
    const c = project.clips.find((x) => x.id === transitionSel);
    if (c) return <aside className="inspector"><TransitionInspector clip={c} project={project} /></aside>;
  }
  if (!clip) {
    return (
      <aside className="inspector">
        <div className="panel-head">{selection.length > 1 ? `${selection.length} clips selecionados` : 'Projeto'}</div>
        <div style={{ overflow: 'auto' }}>{selection.length > 1 ? <MultiInspector ids={selection} /> : <ProjectInspector project={project} />}</div>
      </aside>
    );
  }
  const tabs: { id: Tab; label: string }[] = [];
  if (clip.type === 'text') tabs.push({ id: 'text', label: 'Texto' });
  if (clip.type !== 'audio') tabs.push({ id: 'basic', label: 'Básico' });
  if (clip.type === 'video' || clip.type === 'image') tabs.push({ id: 'color', label: 'Cor' });
  if (clip.type === 'video' || clip.type === 'audio') tabs.push({ id: 'speed', label: 'Velocidade' });
  if (clip.type === 'video' || clip.type === 'audio') tabs.push({ id: 'audio', label: 'Áudio' });
  if (clip.type !== 'audio') tabs.push({ id: 'anim', label: 'Animação' }, { id: 'fx', label: 'Efeitos' });
  const active = tabs.find((t) => t.id === tab) ? tab : tabs[0].id;
  const m = getMedia(project, clip.mediaId);

  return (
    <aside className="inspector">
      <div className="panel-head" style={{ gap: 8 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clip.type === 'text' ? 'Texto' : clip.name ?? m?.name}</span>
        <span className="chip">{fmtTime(clip.duration, project.settings.fps)}</span>
      </div>
      <div className="tabs">{tabs.map((t) => <button key={t.id} className={`tab ${active === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>
      <div style={{ overflow: 'auto', flex: 1 }} key={clip.id + active}>
        {active === 'text' && <TextInspector clip={clip} />}
        {active === 'basic' && <BasicInspector clip={clip} />}
        {active === 'color' && <ColorInspector clip={clip} />}
        {active === 'speed' && <SpeedInspector clip={clip} project={project} />}
        {active === 'audio' && <AudioInspector clip={clip} />}
        {active === 'anim' && <AnimInspector clip={clip} />}
        {active === 'fx' && <FxInspector clip={clip} />}
        {m && (
          <div className="section small muted" style={{ lineHeight: 1.6 }}>
            {m.name}<br />
            {m.kind !== 'audio' && `${m.width}×${m.height} · `}{m.kind === 'video' && `${m.fps} fps · `}{m.videoCodec ?? m.audioCodec} · {fmtBytes(m.size)}
            {m.proxyStatus === 'ready' && ' · proxy ativo'}
          </div>
        )}
      </div>
    </aside>
  );
}

/** Slider de uma propriedade animável com botão de keyframe. */
function AnimSlider({ clip, prop, label, min, max, step, unit, scale = 1, def }: {
  clip: Clip; prop: AnimProp; label: string; min: number; max: number; step: number; unit?: string; scale?: number; def: number;
}) {
  const t = usePlayback((s) => s.time);
  const local = t - clip.start;
  const kfs = clip.keyframes[prop] ?? [];
  const onKf = kfs.find((k) => Math.abs(k.t - local) < 1 / 60);
  const value = currentValue(clip, prop);
  const inRange = local >= 0 && local <= clip.duration;
  return (
    <Slider label={label} value={+(value * scale).toFixed(3)} min={min} max={max} step={step} unit={unit}
      onChange={(v) => setAnimProp(clip.id, prop, v / scale)}
      onReset={() => upd(clip.id, (c) => { delete c.keyframes[prop]; if (prop === 'volume') c.volume = def; else c.transform[prop] = def; })}
      kf={<KfButton active={!!onKf} has={kfs.length > 0} title={!inRange ? 'Mova o cursor para dentro do clip' : undefined} onClick={() => {
        if (!inRange) { useEditor.getState().notify('Coloque o cursor dentro do clip para criar keyframes'); return; }
        upd(clip.id, (c) => {
          const list = c.keyframes[prop] ?? [];
          if (onKf) c.keyframes[prop] = list.filter((k) => k !== list.find((x) => Math.abs(x.t - local) < 1 / 60));
          else setKeyframe(c, prop, local, value);
          if (!c.keyframes[prop]?.length) delete c.keyframes[prop];
        });
      }} />} />
  );
}

function KeyframeNav({ clip }: { clip: Clip }) {
  const times = Array.from(new Set(Object.values(clip.keyframes).flatMap((k) => (k ?? []).map((f) => f.t)))).sort((a, b) => a - b);
  if (!times.length) return null;
  const t = usePlayback.getState().time - clip.start;
  const go = (dir: 1 | -1) => {
    const target = dir > 0 ? times.find((x) => x > t + 1e-3) : [...times].reverse().find((x) => x < t - 1e-3);
    if (target !== undefined) usePlayback.getState().seek(clip.start + target);
  };
  return (
    <div className="row" style={{ marginBottom: 10 }}>
      <span className="small muted grow">{times.length} keyframe(s)</span>
      <button className="btn sm" onClick={() => go(-1)}>◀ Anterior</button>
      <button className="btn sm" onClick={() => go(1)}>Seguinte ▶</button>
      <button className="btn sm ghost danger" title="Remover todos os keyframes" onClick={() => upd(clip.id, (c) => { c.keyframes = {}; })}><Trash2 size={13} /></button>
    </div>
  );
}

function BasicInspector({ clip }: { clip: Clip }) {
  return (
    <>
      <Section title="Transformar" right={<button className="btn sm ghost" onClick={() => upd(clip.id, (c) => { c.transform = { ...c.transform, x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 }; for (const k of ['x', 'y', 'scale', 'rotation', 'opacity'] as const) delete c.keyframes[k]; })}><RotateCcw size={12} /> Repor</button>}>
        <KeyframeNav clip={clip} />
        <AnimSlider clip={clip} prop="scale" label="Escala" min={1} max={400} step={1} unit="%" scale={100} def={1} />
        <AnimSlider clip={clip} prop="x" label="Posição X" min={-100} max={100} step={0.1} scale={100} def={0} />
        <AnimSlider clip={clip} prop="y" label="Posição Y" min={-100} max={100} step={0.1} scale={100} def={0} />
        <AnimSlider clip={clip} prop="rotation" label="Rotação" min={-360} max={360} step={0.5} unit="°" def={0} />
        <AnimSlider clip={clip} prop="opacity" label="Opacidade" min={0} max={100} step={1} unit="%" scale={100} def={1} />
        <div className="row">
          <button className={`btn sm ${clip.transform.flipH ? 'primary' : ''}`} onClick={() => upd(clip.id, (c) => { c.transform.flipH = !c.transform.flipH; })}><FlipHorizontal2 size={14} /> Espelhar H</button>
          <button className={`btn sm ${clip.transform.flipV ? 'primary' : ''}`} onClick={() => upd(clip.id, (c) => { c.transform.flipV = !c.transform.flipV; })}><FlipVertical2 size={14} /> Espelhar V</button>
        </div>
      </Section>
      {clip.type !== 'text' && (
        <Section title="Recortar (crop)" right={<button className="btn sm ghost" onClick={() => upd(clip.id, (c) => { c.crop = { l: 0, t: 0, r: 0, b: 0 }; })}><RotateCcw size={12} /> Repor</button>}>
          {(['l', 'r', 't', 'b'] as const).map((k) => (
            <Slider key={k} label={{ l: 'Esquerda', r: 'Direita', t: 'Cima', b: 'Baixo' }[k]} value={Math.round(clip.crop[k] * 1000) / 10} min={0} max={95} step={0.5} unit="%"
              onChange={(v) => upd(clip.id, (c) => {
                const opp = { l: 'r', r: 'l', t: 'b', b: 't' } as const;
                c.crop[k] = Math.min(v / 100, 0.98 - c.crop[opp[k]]);
              }, `crop-${k}-${clip.id}`)} />
          ))}
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {[['16:9', 16 / 9], ['9:16', 9 / 16], ['1:1', 1], ['4:5', 4 / 5]].map(([lbl, ratio]) => (
              <button key={lbl as string} className="btn sm" onClick={() => {
                const m = getMedia(useEditor.getState().project, clip.mediaId);
                if (!m) return;
                const r = ratio as number, src = m.width / m.height;
                upd(clip.id, (c) => {
                  if (src > r) { const k = (1 - r / src) / 2; c.crop = { l: k, r: k, t: 0, b: 0 }; }
                  else { const k = (1 - src / r) / 2; c.crop = { l: 0, r: 0, t: k, b: k }; }
                });
              }}>{lbl as string}</button>
            ))}
            <button className="btn sm" title="Preencher o enquadramento do projeto" onClick={() => {
              const p = useEditor.getState().project; const m = getMedia(p, clip.mediaId);
              if (!m) return;
              const r = p.settings.width / p.settings.height, src = m.width / m.height;
              upd(clip.id, (c) => { c.crop = { l: 0, r: 0, t: 0, b: 0 }; c.transform.scale = Math.max(src / r, r / src); });
            }}>Preencher</button>
          </div>
        </Section>
      )}
    </>
  );
}

function ColorInspector({ clip }: { clip: Clip }) {
  const set = (k: keyof ColorAdjust, v: number) => upd(clip.id, (c) => { c.color[k] = v; }, `color-${k}-${clip.id}`);
  const rows: [keyof ColorAdjust, string][] = [['brightness', 'Brilho'], ['contrast', 'Contraste'], ['saturation', 'Saturação'], ['temperature', 'Temperatura'], ['tint', 'Tonalidade']];
  return (
    <>
      <Section title="Ajustes de cor" right={<button className="btn sm ghost" onClick={() => upd(clip.id, (c) => { c.color = { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0 }; })}><RotateCcw size={12} /> Repor</button>}>
        {rows.map(([k, l]) => <Slider key={k} label={l} value={clip.color[k]} min={-100} max={100} onChange={(v) => set(k, v)} onReset={() => set(k, 0)} />)}
      </Section>
      <Section title="Filtro">
        {clip.filter ? (
          <>
            <div className="row" style={{ marginBottom: 8 }}>
              <span className="grow">{FILTERS.find((f) => f.id === clip.filter!.id)?.name}</span>
              <button className="btn sm ghost" onClick={() => upd(clip.id, (c) => { c.filter = null; })}><X size={13} /> Remover</button>
            </div>
            <Slider label="Intensidade" value={clip.filter.intensity} min={0} max={100} unit="%" onChange={(v) => upd(clip.id, (c) => { if (c.filter) c.filter.intensity = v; }, `fi-${clip.id}`)} />
          </>
        ) : <div className="hint">Escolha um filtro no separador <b>Filtros</b> (à esquerda).</div>}
      </Section>
    </>
  );
}

function SpeedInspector({ clip, project }: { clip: Clip; project: Project }) {
  const m = getMedia(project, clip.mediaId);
  const setSpeed = (sp: number) => upd(clip.id, (c) => {
    const span = c.duration * c.speed; // duração da fonte mantém-se
    let nd = span / sp;
    // não ultrapassar o clip seguinte na pista
    const next = useEditor.getState().project.clips.filter((o) => o.trackId === c.trackId && o.start >= clipEnd(c) - 1e-4).sort((a, b) => a.start - b.start)[0];
    if (next) nd = Math.min(nd, next.start - c.start);
    if (m) nd = Math.min(nd, (m.duration - c.in) / sp);
    c.speed = sp;
    c.duration = Math.max(1 / project.settings.fps, nd);
  }, `speed-${clip.id}`);
  return (
    <Section title="Velocidade">
      <Slider label="Velocidade" value={clip.speed} min={0.1} max={10} step={0.05} unit="×" onChange={setSpeed} onReset={() => setSpeed(1)} />
      <div className="row" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
        {[0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8].map((s) => <button key={s} className={`btn sm ${clip.speed === s ? 'primary' : ''}`} onClick={() => setSpeed(s)}>{s}×</button>)}
      </div>
      <div className="hint" style={{ marginBottom: 12 }}>
        {clip.speed < 1 ? 'Câmara lenta' : clip.speed > 1 ? 'Câmara rápida' : 'Velocidade normal'} · duração na timeline {fmtTime(clip.duration, project.settings.fps)}.
        O áudio é ajustado com preservação do tom.
      </div>
      {clip.type === 'video' && <button className="btn" onClick={A.freezeFrame}><Snowflake size={14} /> Congelar fotograma no cursor</button>}
    </Section>
  );
}

function AudioInspector({ clip }: { clip: Clip }) {
  return (
    <>
      <Section title="Áudio">
        <Toggle label="Silenciar este clip (remover áudio)" value={clip.muted} onChange={(v) => upd(clip.id, (c) => { c.muted = v; })} />
        <AnimSlider clip={clip} prop="volume" label="Volume" min={0} max={200} step={1} unit="%" scale={100} def={1} />
        <Slider label="Fade in" value={clip.fadeIn} min={0} max={Math.min(10, clip.duration)} step={0.05} unit="s" onChange={(v) => upd(clip.id, (c) => { c.fadeIn = v; }, `fin-${clip.id}`)} onReset={() => upd(clip.id, (c) => { c.fadeIn = 0; })} />
        <Slider label="Fade out" value={clip.fadeOut} min={0} max={Math.min(10, clip.duration)} step={0.05} unit="s" onChange={(v) => upd(clip.id, (c) => { c.fadeOut = v; }, `fout-${clip.id}`)} onReset={() => upd(clip.id, (c) => { c.fadeOut = 0; })} />
      </Section>
      <Section title="Ferramentas">
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {clip.type === 'video' && <button className="btn sm" onClick={A.extractAudio}><AudioLines size={13} /> Separar áudio</button>}
          {clip.type === 'audio' && <button className="btn sm" onClick={A.syncAudioToVideo}><AudioLines size={13} /> Sincronizar com vídeo</button>}
          {clip.linkId && <button className="btn sm" onClick={A.unlinkSelection}>Desligar</button>}
        </div>
        <div className="hint" style={{ marginTop: 8 }}>
          A sincronização compara a forma de onda deste áudio com o som do vídeo selecionado (Ctrl+clique) ou sobreposto, e alinha-os automaticamente.
        </div>
      </Section>
    </>
  );
}

function AnimInspector({ clip }: { clip: Clip }) {
  const row = (which: 'animIn' | 'animOut', title: string) => (
    <Section title={title}>
      <select className="input" value={clip[which].type} onChange={(e) => upd(clip.id, (c) => { c[which].type = e.target.value as any; })}>
        {ANIMS.map((a) => <option key={a.type} value={a.type}>{a.name}</option>)}
      </select>
      {clip[which].type !== 'none' && (
        <div style={{ marginTop: 10 }}>
          <Slider label="Duração" value={clip[which].duration} min={0.1} max={Math.max(0.2, Math.min(5, clip.duration))} step={0.05} unit="s"
            onChange={(v) => upd(clip.id, (c) => { c[which].duration = v; }, `${which}-${clip.id}`)} />
        </div>
      )}
    </Section>
  );
  return (
    <>
      {row('animIn', 'Animação de entrada')}
      {row('animOut', 'Animação de saída')}
      <Section title="Efeito de movimento">
        <select className="input" value={clip.motion.type} onChange={(e) => upd(clip.id, (c) => { c.motion.type = e.target.value as any; })}>
          {MOTIONS.map((a) => <option key={a.type} value={a.type}>{a.name}</option>)}
        </select>
        {clip.motion.type !== 'none' && (
          <div style={{ marginTop: 10 }}>
            <Slider label="Intensidade" value={clip.motion.intensity} min={0} max={100} unit="%" onChange={(v) => upd(clip.id, (c) => { c.motion.intensity = v; }, `mo-${clip.id}`)} />
          </div>
        )}
      </Section>
      <Section title="Keyframes">
        <div className="hint">Use o botão ◆ ao lado de Escala, Posição, Rotação, Opacidade (Básico) ou Volume para criar animações personalizadas. Mova o cursor e altere os valores: os keyframes intermédios são interpolados com suavização.</div>
      </Section>
    </>
  );
}

function FxInspector({ clip }: { clip: Clip }) {
  return (
    <Section title="Efeitos aplicados">
      {clip.effects.length === 0 && <div className="hint">Sem efeitos. Adicione-os no separador <b>Efeitos</b> (à esquerda).</div>}
      {clip.effects.map((e) => (
        <div key={e.id} style={{ marginBottom: 6 }}>
          <div className="row">
            <b className="grow" style={{ fontSize: 12 }}>{EFFECTS.find((x) => x.type === e.type)?.name}</b>
            <button className="icon-btn sm" title="Remover" onClick={() => upd(clip.id, (c) => { c.effects = c.effects.filter((x) => x.id !== e.id); })}><X size={13} /></button>
          </div>
          <Slider value={e.intensity} min={0} max={100} unit="%" onChange={(v) => upd(clip.id, (c) => { const x = c.effects.find((y) => y.id === e.id); if (x) x.intensity = v; }, `fx-${e.id}`)} />
        </div>
      ))}
    </Section>
  );
}

function TextInspector({ clip }: { clip: Clip }) {
  const s = clip.style!;
  const set = <K extends keyof TextStyle>(k: K, v: TextStyle[K], key = true) => upd(clip.id, (c) => { (c.style as any)[k] = v; }, key ? `ts-${k}-${clip.id}` : undefined);
  return (
    <>
      <Section title="Conteúdo">
        <textarea className="input" value={clip.text} rows={3} onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => upd(clip.id, (c) => { c.text = e.target.value; c.name = e.target.value.slice(0, 40); }, `txt-${clip.id}`)} />
      </Section>
      <Section title="Tipo de letra">
        <div className="field">
          <select className="input" value={s.font} onChange={(e) => set('font', e.target.value, false)} style={{ fontFamily: s.font }}>
            {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
          </select>
        </div>
        <Slider label="Tamanho" value={s.size} min={8} max={400} onChange={(v) => set('size', v)} />
        <div className="row" style={{ marginBottom: 10 }}>
          <input type="color" value={s.color} onChange={(e) => set('color', e.target.value)} title="Cor" />
          <button className={`icon-btn ${s.bold ? 'active' : ''}`} title="Negrito" onClick={() => set('bold', !s.bold, false)}><Bold size={15} /></button>
          <button className={`icon-btn ${s.italic ? 'active' : ''}`} title="Itálico" onClick={() => set('italic', !s.italic, false)}><Italic size={15} /></button>
          <button className={`icon-btn ${s.underline ? 'active' : ''}`} title="Sublinhado" onClick={() => set('underline', !s.underline, false)}><Underline size={15} /></button>
          <div className="grow" />
          <Seg value={s.align} onChange={(v) => set('align', v, false)} options={[
            { v: 'left', label: <AlignLeft size={14} /> }, { v: 'center', label: <AlignCenter size={14} /> }, { v: 'right', label: <AlignRight size={14} /> },
          ]} />
        </div>
        <Slider label="Espaçamento entre letras" value={s.letterSpacing} min={-10} max={60} onChange={(v) => set('letterSpacing', v)} />
        <Slider label="Altura da linha" value={s.lineHeight} min={0.7} max={3} step={0.05} onChange={(v) => set('lineHeight', v)} />
      </Section>
      <Section title="Contorno">
        <div className="row"><input type="color" value={s.strokeColor} onChange={(e) => set('strokeColor', e.target.value)} />
          <div className="grow"><Slider value={s.strokeWidth} min={0} max={30} step={0.5} onChange={(v) => set('strokeWidth', v)} /></div></div>
      </Section>
      <Section title="Sombra">
        <div className="row"><input type="color" value={s.shadowColor.startsWith('#') ? s.shadowColor : '#000000'} onChange={(e) => set('shadowColor', e.target.value)} />
          <div className="grow"><Slider label="Desfoque" value={s.shadowBlur} min={0} max={60} onChange={(v) => set('shadowBlur', v)} /></div></div>
        <Slider label="Deslocamento X" value={s.shadowX} min={-40} max={40} onChange={(v) => set('shadowX', v)} />
        <Slider label="Deslocamento Y" value={s.shadowY} min={-40} max={40} onChange={(v) => set('shadowY', v)} />
      </Section>
      <Section title="Fundo">
        <Toggle label="Caixa de fundo" value={!!s.background} onChange={(v) => set('background', v ? '#000000' : '', false)} />
        {!!s.background && (
          <div className="row"><input type="color" value={s.background} onChange={(e) => set('background', e.target.value)} />
            <div className="grow"><Slider label="Opacidade" value={Math.round(s.backgroundOpacity * 100)} min={0} max={100} unit="%" onChange={(v) => set('backgroundOpacity', v / 100)} /></div></div>
        )}
      </Section>
    </>
  );
}

function TransitionInspector({ clip, project }: { clip: Clip; project: Project }) {
  const prev = prevAdjacent(project, clip);
  const tr = clip.transitionIn;
  if (!prev || !tr) return <div className="panel-body"><div className="hint">Esta transição já não é válida (os clips não estão encostados).</div></div>;
  const max = maxTransition(prev, clip);
  return (
    <>
      <div className="panel-head">Transição</div>
      <Section title="Tipo">
        <div className="tile-grid">
          {TRANSITIONS.map((t) => (
            <div key={t.type} className={`tile ${tr.type === t.type ? 'on' : ''}`} onClick={() => useEditor.getState().commit((d) => { setTransition(d, clip.id, { ...tr, type: t.type }); })}>{t.name}</div>
          ))}
        </div>
      </Section>
      <Section title="Duração">
        <Slider value={tr.duration} min={0.1} max={Math.max(0.2, Math.min(3, max))} step={0.05} unit="s"
          onChange={(v) => useEditor.getState().commit((d) => { setTransition(d, clip.id, { ...tr, duration: v }); }, `trd-${clip.id}`)} />
        <div className="row">
          <button className="btn sm" onClick={() => {
            const st = useEditor.getState();
            st.commit((d) => { for (const c of d.clips) if (c.trackId === clip.trackId && c.id !== clip.id) setTransition(d, c.id, { ...tr }); });
            st.notify('Transição aplicada a todos os cortes da pista', 'success');
          }}>Aplicar a todos os cortes</button>
          <button className="btn sm danger" onClick={() => { useEditor.getState().commit((d) => { setTransition(d, clip.id, null); }); useEditor.getState().selectTransition(null); }}><Trash2 size={13} /> Remover</button>
        </div>
      </Section>
    </>
  );
}

function MultiInspector({ ids }: { ids: string[] }) {
  return (
    <Section title="Edição em grupo">
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn sm" onClick={A.duplicateSelection}>Duplicar</button>
        <button className="btn sm" onClick={A.toggleMute}>Silenciar/ativar</button>
        <button className="btn sm" onClick={A.syncAudioToVideo}>Sincronizar áudio</button>
        <button className="btn sm danger" onClick={() => A.deleteSelection(false)}>Apagar</button>
      </div>
      <div className="hint" style={{ marginTop: 10 }}>Filtros e efeitos escolhidos à esquerda são aplicados a todos os {ids.length} clips selecionados.</div>
    </Section>
  );
}

function ProjectInspector({ project }: { project: Project }) {
  const set = (fn: (p: Project) => void) => useEditor.getState().commit((d) => fn(d as Project));
  const aspect = ASPECTS.find((a) => Math.abs(a.w / a.h - project.settings.width / project.settings.height) < 0.01)?.id ?? 'custom';
  const settings = useEditor((s) => s.settings);
  return (
    <>
      <Section title="Formato">
        <div className="field">
          <label>Proporção</label>
          <select className="input" value={aspect} onChange={(e) => { const a = ASPECTS.find((x) => x.id === e.target.value); if (a) set((p) => { p.settings.width = a.w; p.settings.height = a.h; }); }}>
            {ASPECTS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            {aspect === 'custom' && <option value="custom">Personalizado</option>}
          </select>
        </div>
        <div className="field">
          <label>Fotogramas por segundo (projeto)</label>
          <Seg value={project.settings.fps} onChange={(v) => set((p) => { p.settings.fps = v; })} options={[24, 25, 30, 50, 60].map((f) => ({ v: f, label: String(f) }))} />
        </div>
        <div className="field">
          <label>Cor de fundo</label>
          <input type="color" value={project.settings.background} onChange={(e) => set((p) => { p.settings.background = e.target.value; })} />
        </div>
      </Section>
      <Section title="Desempenho">
        <Toggle label="Usar proxies na pré-visualização" value={settings.useProxies} onChange={(v) => useEditor.getState().setSettings({ useProxies: v })} />
        <Toggle label="Criar proxies automaticamente" value={settings.autoProxy} onChange={(v) => useEditor.getState().setSettings({ autoProxy: v })} />
        <div className="hint">Os proxies são cópias leves (H.264 720p) usadas só na edição. A exportação usa sempre os ficheiros originais em qualidade total.</div>
      </Section>
      <Section title="Resumo">
        <div className="hint">{project.clips.length} clips · {project.tracks.length} pistas · {project.media.length} ficheiros</div>
      </Section>
    </>
  );
}
