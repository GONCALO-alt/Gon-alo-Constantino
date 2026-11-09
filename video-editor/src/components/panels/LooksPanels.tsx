import React from 'react';
import { Sparkles, Move } from 'lucide-react';
import type { EffectType, MotionType } from '@shared/types';
import { EFFECTS, FILTERS, MOTIONS, TRANSITIONS } from '@shared/looks';
import { prevAdjacent, uid } from '@shared/timeline';
import { useEditor, setTransition } from '../../store/editor';
import { Slider } from '../ui';


const FX_PREVIEW: Record<EffectType, string> = {
  blur: 'blur(3px)', sharpen: 'contrast(1.4)', vignette: 'brightness(.8)', grain: 'contrast(1.2) saturate(.8)', glitch: 'hue-rotate(90deg)',
  bw: 'grayscale(1)', sepia: 'sepia(1)', invert: 'invert(1)',
};

export function EffectsPanel() {
  const selection = useEditor((s) => s.selection);
  const clips = useEditor((s) => s.project.clips).filter((c) => selection.includes(c.id) && c.type !== 'audio');
  const addEffect = (type: EffectType) => {
    if (!clips.length) { useEditor.getState().notify('Selecione um ou mais clips visuais na timeline'); return; }
    useEditor.getState().commit((d) => {
      for (const c of d.clips) if (selection.includes(c.id) && c.type !== 'audio') {
        const ex = c.effects.find((e) => e.type === type);
        if (!ex) c.effects.push({ id: uid('e_'), type, intensity: type === 'invert' || type === 'bw' ? 100 : 50 });
      }
    });
  };
  const setMotion = (type: MotionType) => {
    if (!clips.length) { useEditor.getState().notify('Selecione um ou mais clips visuais na timeline'); return; }
    useEditor.getState().commit((d) => { for (const c of d.clips) if (selection.includes(c.id) && c.type !== 'audio') c.motion.type = type; });
  };
  return (
    <>
      <div className="panel-head">Efeitos</div>
      <div className="panel-body">
        {!clips.length && <div className="hint" style={{ marginBottom: 10 }}>Selecione clips na timeline e clique num efeito para o aplicar. A intensidade de cada efeito ajusta-se individualmente no separador <b>Efeitos</b> à direita.</div>}
        <div className="section-title"><span><Sparkles size={13} /> Efeitos visuais</span></div>
        <div className="tile-grid">
          {EFFECTS.map((e) => {
            const on = clips.some((c) => c.effects.some((x) => x.type === e.type));
            return (
              <div key={e.type} className={`tile ${on ? 'on' : ''}`} onClick={() => addEffect(e.type)} title={e.description}>
                <div className="sw" style={{ background: 'linear-gradient(135deg,#ff6a3d,#4cc2ff 60%,#8b6cff)', filter: FX_PREVIEW[e.type] }}>{e.type === 'glitch' ? '▚' : ''}</div>
                {e.name}
              </div>
            );
          })}
        </div>
        <div className="section-title" style={{ marginTop: 18 }}><span><Move size={13} /> Efeitos de movimento</span></div>
        <div className="tile-grid">
          {MOTIONS.map((m) => (
            <div key={m.type} className={`tile ${clips.some((c) => c.motion.type === m.type) ? 'on' : ''}`} onClick={() => setMotion(m.type)}>{m.name}</div>
          ))}
        </div>
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
    if (!targets.length) { st.notify('Selecione o clip que recebe a transição (o segundo de dois clips encostados) ou clique no ícone entre clips'); return; }
    let ok = 0;
    st.commit((d) => { for (const id of targets) if (setTransition(d, id, { type, duration })) ok++; });
    if (!ok) st.notify('O clip selecionado não tem um clip encostado antes dele na mesma pista', 'error');
    else if (targets.length === 1) st.selectTransition(targets[0]);
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
        <div className="hint" style={{ marginBottom: 10 }}>As transições aplicam-se entre dois clips encostados na mesma pista. Clique no ícone ⧉ que aparece entre clips na timeline, ou selecione o segundo clip e escolha aqui.</div>
        <Slider label="Duração" value={duration} min={0.1} max={3} step={0.05} unit="s" onChange={setDuration} />
        <div className="tile-grid">
          {TRANSITIONS.map((t) => (
            <div key={t.type} className="tile" onClick={() => apply(t.type)} onContextMenu={(e) => { e.preventDefault(); applyAll(t.type); }} title="Clique: aplicar · Botão direito: aplicar a todos os cortes">
              <div className="sw" style={{ background: transitionSwatch(t.type) }} />
              {t.name}
            </div>
          ))}
        </div>
        <button className="btn sm" style={{ marginTop: 12 }} onClick={() => applyAll('dissolve')}>Dissolver em todos os cortes</button>
      </div>
    </>
  );
}

const transitionSwatch = (t: string) => ({
  fade: 'linear-gradient(90deg,#4cc2ff,#000 50%,#ff6a3d)',
  dissolve: 'linear-gradient(90deg,#4cc2ff,#ff6a3d)',
  zoomIn: 'radial-gradient(circle,#ff6a3d 30%,#4cc2ff 31%)',
  zoomOut: 'radial-gradient(circle,#4cc2ff 45%,#ff6a3d 46%)',
  slideLeft: 'linear-gradient(90deg,#4cc2ff 50%,#ff6a3d 50%)',
  slideRight: 'linear-gradient(270deg,#4cc2ff 50%,#ff6a3d 50%)',
  slideUp: 'linear-gradient(0deg,#4cc2ff 50%,#ff6a3d 50%)',
  slideDown: 'linear-gradient(180deg,#4cc2ff 50%,#ff6a3d 50%)',
  blur: 'linear-gradient(90deg,#4cc2ff,#a68cff,#ff6a3d)',
  glitch: 'repeating-linear-gradient(0deg,#4cc2ff 0 4px,#ff2b6d 4px 6px,#ff6a3d 6px 10px)',
} as Record<string, string>)[t];

export function FiltersPanel() {
  const selection = useEditor((s) => s.selection);
  const clips = useEditor((s) => s.project.clips).filter((c) => selection.includes(c.id) && c.type !== 'audio');
  const current = clips[0]?.filter;
  const apply = (id: string | null) => {
    if (!clips.length) { useEditor.getState().notify('Selecione um ou mais clips visuais na timeline'); return; }
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
