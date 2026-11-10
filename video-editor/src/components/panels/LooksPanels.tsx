import React from 'react';
import { Sparkles } from 'lucide-react';
import type { EffectType } from '@shared/types';
import { EFFECTS, FILTERS, TRANSITIONS } from '@shared/looks';
import { prevAdjacent, uid } from '@shared/timeline';
import { useEditor, setTransition } from '../../store/editor';
import { Slider } from '../ui';


const SAMPLE = 'linear-gradient(135deg,#ff6a3d,#ffd166 35%,#4cc2ff 65%,#8b6cff)';
/** Miniaturas ilustrativas (CSS) de cada efeito. */
const FX_PREVIEW: Record<EffectType, React.CSSProperties> = {
  blur: { filter: 'blur(3px)' }, sharpen: { filter: 'contrast(1.4)' }, vignette: { boxShadow: 'inset 0 0 18px 8px #000' },
  grain: { filter: 'contrast(1.2) saturate(.8)' }, glitch: { filter: 'hue-rotate(90deg)' }, bw: { filter: 'grayscale(1)' },
  sepia: { filter: 'sepia(1)' }, invert: { filter: 'invert(1)' }, chromatic: { boxShadow: '-3px 0 0 #f00a, 3px 0 0 #0ffa' },
  pixelate: { background: 'conic-gradient(#ff6a3d 25%,#4cc2ff 0 50%,#ffd166 0 75%,#8b6cff 0) 0 0/12px 12px' },
  posterize: { background: 'linear-gradient(135deg,#ff6a3d 33%,#ffd166 33% 66%,#4cc2ff 66%)' },
  scanlines: { background: `repeating-linear-gradient(0deg,#0006 0 2px,transparent 2px 4px),${SAMPLE}` },
  mirror: { background: 'linear-gradient(90deg,#ff6a3d,#4cc2ff 50%,#ff6a3d)' }, glow: { filter: 'brightness(1.3) saturate(1.2)', boxShadow: '0 0 14px #fff8' },
  flash: { filter: 'brightness(1.8)' }, strobe: { background: 'repeating-linear-gradient(90deg,#fff 0 8px,#222 8px 16px)' },
  duotone: { background: 'linear-gradient(135deg,#1b1464,#ff5c8a)' }, cinemaBars: { boxShadow: 'inset 0 10px 0 #000, inset 0 -10px 0 #000' },
};

const needSel = () => useEditor.getState().notify('Selecione um ou mais clips visuais na timeline');

function groupBy<T extends { category: string }>(list: T[]) {
  const m = new Map<string, T[]>();
  for (const x of list) m.set(x.category, [...(m.get(x.category) ?? []), x]);
  return Array.from(m.entries());
}

export function EffectsPanel() {
  const selection = useEditor((s) => s.selection);
  const clips = useEditor((s) => s.project.clips).filter((c) => selection.includes(c.id) && c.type !== 'audio');
  const toggleEffect = (type: EffectType) => {
    if (!clips.length) return needSel();
    const has = clips.every((c) => c.effects.some((e) => e.type === type));
    useEditor.getState().commit((d) => {
      for (const c of d.clips) if (selection.includes(c.id) && c.type !== 'audio') {
        if (has) c.effects = c.effects.filter((e) => e.type !== type);
        else if (!c.effects.some((e) => e.type === type)) c.effects.push({ id: uid('e_'), type, intensity: ['invert', 'bw', 'mirror'].includes(type) ? 100 : 60 });
      }
    });
  };
  return (
    <>
      <div className="panel-head">Efeitos</div>
      <div className="panel-body">
        {!clips.length && <div className="hint" style={{ marginBottom: 10 }}>Selecione um clip e toque num efeito para o aplicar (toque de novo para o tirar). A intensidade ajusta-se em cima.</div>}
        {groupBy(EFFECTS).map(([cat, list]) => (
          <div key={cat} style={{ marginBottom: 14 }}>
            <div className="section-title"><span><Sparkles size={13} /> {cat}</span></div>
            <div className="tile-grid">
              {list.map((e) => {
                const on = clips.some((c) => c.effects.some((x) => x.type === e.type));
                return (
                  <div key={e.type} className={`tile ${on ? 'on' : ''}`} onClick={() => toggleEffect(e.type)} title={e.description}>
                    <div className="sw" style={{ background: SAMPLE, ...FX_PREVIEW[e.type] }} />
                    {e.name}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function TransitionsPanel() {
  const selection = useEditor((s) => s.selection);
  const transitionSel = useEditor((s) => s.transitionSel);
  const [duration, setDuration] = React.useState(0.6);
  const apply = (type: any) => {
    const st = useEditor.getState();
    const p = st.project;
    const targets = transitionSel ? [transitionSel] : p.clips.filter((c) => selection.includes(c.id) && c.type !== 'audio').map((c) => c.id);
    if (!targets.length) { st.notify('Toque no ícone ⧉ entre dois clips na timeline, ou selecione o segundo clip'); return; }
    let ok = 0;
    st.commit((d) => { for (const id of targets) if (setTransition(d, id, { type, duration })) ok++; });
    if (!ok) st.notify('O clip selecionado não tem um clip encostado antes dele na mesma pista', 'error');
  };
  const applyAll = (type: any) => {
    const st = useEditor.getState();
    let n = 0;
    st.commit((d) => { for (const c of d.clips) if (c.type !== 'audio' && prevAdjacent(d as any, c as any) && setTransition(d, c.id, { type, duration })) n++; });
    st.notify(n ? `Transição aplicada a ${n} cortes` : 'Não há clips encostados', n ? 'success' : 'error');
  };
  return (
    <>
      <div className="panel-head">Transições</div>
      <div className="panel-body">
        <div className="hint" style={{ marginBottom: 10 }}>Toque no ícone ⧉ entre dois clips da timeline e escolha aqui. Botão direito: aplicar a todos os cortes.</div>
        <Slider label="Duração" value={duration} min={0.1} max={3} step={0.05} unit="s" onChange={setDuration} />
        <TransitionGrid onPick={apply} onPickAll={applyAll} />
        <button className="btn sm" style={{ marginTop: 12 }} onClick={() => applyAll('dissolve')}>Misturar em todos os cortes</button>
      </div>
    </>
  );
}

export function TransitionGrid({ current, onPick, onPickAll }: { current?: string; onPick: (t: any) => void; onPickAll?: (t: any) => void }) {
  return (
    <>
      {groupBy(TRANSITIONS).map(([cat, list]) => (
        <div key={cat} style={{ marginBottom: 12 }}>
          <div className="section-title"><span>{cat}</span></div>
          <div className="tile-grid">
            {list.map((t) => (
              <div key={t.type} className={`tile ${current === t.type ? 'on' : ''}`} onClick={() => onPick(t.type)}
                onContextMenu={(e) => { if (onPickAll) { e.preventDefault(); onPickAll(t.type); } }}>
                <div className="sw" style={{ background: transitionSwatch(t.type) }} />
                {t.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

const A_ = '#4cc2ff', B_ = '#ff6a3d';
const transitionSwatch = (t: string) => ({
  fade: `linear-gradient(90deg,${A_},#000 50%,${B_})`,
  whiteFlash: `linear-gradient(90deg,${A_},#fff 50%,${B_})`,
  dissolve: `linear-gradient(90deg,${A_},${B_})`,
  zoomIn: `radial-gradient(circle,${B_} 30%,${A_} 31%)`,
  zoomOut: `radial-gradient(circle,${A_} 45%,${B_} 46%)`,
  zoomBlur: `radial-gradient(circle,${B_},${A_})`,
  spin: `conic-gradient(${B_} 0 50%,${A_} 0)`,
  shake: `repeating-linear-gradient(80deg,${A_} 0 6px,${B_} 6px 12px)`,
  slideLeft: `linear-gradient(90deg,${A_} 50%,${B_} 50%)`,
  slideRight: `linear-gradient(270deg,${A_} 50%,${B_} 50%)`,
  slideUp: `linear-gradient(0deg,${A_} 50%,${B_} 50%)`,
  slideDown: `linear-gradient(180deg,${A_} 50%,${B_} 50%)`,
  pushLeft: `linear-gradient(90deg,${A_} 40%,#000 40% 44%,${B_} 44%)`,
  pushRight: `linear-gradient(270deg,${A_} 40%,#000 40% 44%,${B_} 44%)`,
  wipeRight: `linear-gradient(90deg,${B_} 50%,${A_} 50%)`,
  wipeLeft: `linear-gradient(270deg,${B_} 50%,${A_} 50%)`,
  wipeDown: `linear-gradient(180deg,${B_} 50%,${A_} 50%)`,
  wipeUp: `linear-gradient(0deg,${B_} 50%,${A_} 50%)`,
  blur: `linear-gradient(90deg,${A_},#a68cff,${B_})`,
  glitch: `repeating-linear-gradient(0deg,${A_} 0 4px,#ff2b6d 4px 6px,${B_} 6px 10px)`,
} as Record<string, string>)[t];

export function FiltersPanel() {
  const selection = useEditor((s) => s.selection);
  const clips = useEditor((s) => s.project.clips).filter((c) => selection.includes(c.id) && c.type !== 'audio');
  const current = clips[0]?.filter;
  const apply = (id: string | null) => {
    if (!clips.length) return needSel();
    useEditor.getState().commit((d) => { for (const c of d.clips) if (selection.includes(c.id) && c.type !== 'audio') c.filter = id ? { id, intensity: c.filter?.intensity ?? 80 } : null; });
  };
  return (
    <>
      <div className="panel-head">Filtros cinematográficos</div>
      <div className="panel-body">
        {!clips.length && <div className="hint" style={{ marginBottom: 10 }}>Selecione clips na timeline para aplicar um filtro.</div>}
        <div className="tile-grid">
          <div className={`tile ${clips.length && !current ? 'on' : ''}`} onClick={() => apply(null)}><div className="sw" style={{ background: 'var(--bg4)' }}>∅</div>Nenhum</div>
          {FILTERS.map((f) => (
            <div key={f.id} className={`tile ${current?.id === f.id ? 'on' : ''}`} onClick={() => apply(f.id)}>
              <div className="sw" style={{ background: f.swatch }} />{f.name}
            </div>
          ))}
        </div>
        {current && clips.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <Slider label="Intensidade" value={current.intensity} min={0} max={100} unit="%"
              onChange={(v) => useEditor.getState().commit((d) => { for (const c of d.clips) if (selection.includes(c.id) && c.filter) c.filter.intensity = v; }, 'filter-int')} />
          </div>
        )}
      </div>
    </>
  );
}
