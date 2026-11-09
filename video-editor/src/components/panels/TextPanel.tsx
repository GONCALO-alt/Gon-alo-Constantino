import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Clip, TextStyle } from '@shared/types';
import { DEFAULT_TEXT_STYLE } from '@shared/defaults';
import { useEditor, addText } from '../../store/editor';
import { usePlayback } from '../../store/playback';

interface Preset { id: string; name: string; text: string; style: Partial<TextStyle>; extra?: Partial<Clip> }

export const TEXT_PRESETS: Preset[] = [
  { id: 'basic', name: 'Texto simples', text: 'Texto', style: {} },
  { id: 'title', name: 'Título animado', text: 'GRANDE TÍTULO', style: { font: 'Bebas Neue', size: 180, bold: false, letterSpacing: 6, shadowBlur: 24 },
    extra: { animIn: { type: 'pop', duration: 0.6 }, animOut: { type: 'fade', duration: 0.5 } } },
  { id: 'cinematic', name: 'Cinemático', text: 'UM FILME DE', style: { font: 'Playfair Display', size: 72, bold: false, letterSpacing: 18, shadowBlur: 0, shadowY: 0 },
    extra: { animIn: { type: 'fade', duration: 1.2 }, animOut: { type: 'fade', duration: 1 } } },
  { id: 'neon', name: 'Néon', text: 'NÉON', style: { font: 'Montserrat', size: 140, color: '#ffe8ff', shadowColor: '#ff2bd6', shadowBlur: 40, shadowY: 0 },
    extra: { animIn: { type: 'zoomIn', duration: 0.5 }, motion: { type: 'pulse', intensity: 60 } } },
  { id: 'outline', name: 'Contorno', text: 'CONTORNO', style: { font: 'Anton', size: 130, bold: false, color: '#ffd400', strokeColor: '#000000', strokeWidth: 10, shadowBlur: 0 },
    extra: { animIn: { type: 'slideUp', duration: 0.5 } } },
  { id: 'box', name: 'Caixa', text: 'Novidade', style: { font: 'Poppins', size: 80, color: '#111111', background: '#ffb547', backgroundOpacity: 1, shadowBlur: 0 },
    extra: { animIn: { type: 'slideRight', duration: 0.45 }, animOut: { type: 'slideLeft', duration: 0.45 } } },
  { id: 'lower', name: 'Rodapé (lower third)', text: 'Nome Apelido\nCargo / descrição', style: { font: 'Inter', size: 54, align: 'left', background: '#0b0c10', backgroundOpacity: 0.8, shadowBlur: 0 },
    extra: { transform: { x: -0.25, y: 0.33, scale: 1, rotation: 0, opacity: 1, flipH: false, flipV: false }, animIn: { type: 'slideRight', duration: 0.5 }, animOut: { type: 'fade', duration: 0.4 } } },
  { id: 'script', name: 'Manuscrito', text: 'Obrigado!', style: { font: 'Pacifico', size: 140, bold: false, color: '#ffffff', shadowBlur: 18 },
    extra: { animIn: { type: 'blur', duration: 0.8 }, animOut: { type: 'fade', duration: 0.6 } } },
  { id: 'glitch', name: 'Glitch', text: 'GLITCH', style: { font: 'Oswald', size: 150, color: '#ffffff', shadowBlur: 0 },
    extra: { effects: [{ id: 'g1', type: 'glitch', intensity: 70 }], animIn: { type: 'zoomOut', duration: 0.35 } } },
  { id: 'subtitle', name: 'Legenda', text: 'Legenda de exemplo', style: { size: 60, strokeWidth: 6, shadowBlur: 0, shadowY: 0 },
    extra: { transform: { x: 0, y: 0.38, scale: 1, rotation: 0, opacity: 1, flipH: false, flipV: false } } },
];

export function addPreset(id: string, at?: number) {
  const p = TEXT_PRESETS.find((x) => x.id === id) ?? TEXT_PRESETS[0];
  const t = at ?? usePlayback.getState().time;
  useEditor.getState().commit((d) => {
    const extra = JSON.parse(JSON.stringify(p.extra ?? {}));
    if (extra.effects) extra.effects = extra.effects.map((e: any) => ({ ...e, id: Math.random().toString(36).slice(2) }));
    const c = addText(d, t, p.text, { ...DEFAULT_TEXT_STYLE, ...p.style }, extra);
    useEditor.setState({ selection: [c.id] });
  });
}

export function TextPanel() {
  useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent).detail; addPreset(d.preset, d.at); };
    document.addEventListener('add-text-preset', h);
    return () => document.removeEventListener('add-text-preset', h);
  }, []);
  return (
    <>
      <div className="panel-head">Texto e títulos
        <button className="btn sm primary" onClick={() => addPreset('basic')}><Plus size={13} /> Adicionar texto</button>
      </div>
      <div className="panel-body">
        <div className="hint" style={{ marginBottom: 10 }}>Clique para inserir no cursor ou arraste para a timeline. Depois edite o texto, a fonte, as cores e as animações no painel da direita.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {TEXT_PRESETS.map((p) => {
            const s = { ...DEFAULT_TEXT_STYLE, ...p.style };
            return (
              <div key={p.id} className="text-preset" draggable title={p.name}
                onDragStart={(e) => e.dataTransfer.setData('application/x-text-preset', p.id)}
                onClick={() => addPreset(p.id)}>
                <div style={{
                  fontFamily: `"${s.font}"`, fontWeight: s.bold ? 700 : 400, fontStyle: s.italic ? 'italic' : 'normal', fontSize: Math.min(26, s.size / 4.5),
                  color: s.color, letterSpacing: s.letterSpacing / 6, WebkitTextStroke: s.strokeWidth ? `${Math.min(2, s.strokeWidth / 5)}px ${s.strokeColor}` : undefined,
                  textShadow: s.shadowBlur ? `0 0 ${s.shadowBlur / 4}px ${s.shadowColor}` : undefined,
                  background: s.background ? s.background : undefined, display: 'inline-block', padding: s.background ? '2px 8px' : 0, borderRadius: 4,
                  overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', whiteSpace: 'nowrap',
                }}>{p.text.split('\n')[0]}</div>
                <div className="small muted" style={{ marginTop: 6 }}>{p.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
