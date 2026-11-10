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
  { id: 'bubble', name: 'Bolha', text: 'Fixe!', style: { font: 'Fredoka', size: 140, color: '#ffffff', strokeColor: '#ff4d8d', strokeWidth: 12, shadowBlur: 0 },
    extra: { animIn: { type: 'pop', duration: 0.5 }, motion: { type: 'jelly', intensity: 60 } } },
  { id: 'comic', name: 'Banda desenhada', text: 'POW!', style: { font: 'Bangers', size: 170, bold: false, color: '#ffe600', strokeColor: '#000000', strokeWidth: 9, shadowColor: '#000000', shadowBlur: 0, shadowX: 8, shadowY: 8 },
    extra: { animIn: { type: 'elastic', duration: 0.7 }, animOut: { type: 'zoomOut', duration: 0.3 } } },
  { id: 'marker', name: 'Marcador', text: 'nota importante', style: { font: 'Permanent Marker', size: 110, bold: false, color: '#ffffff', shadowBlur: 8 },
    extra: { transform: { x: 0, y: 0, scale: 1, rotation: -4, opacity: 1, flipH: false, flipV: false }, animIn: { type: 'wipeRight', duration: 0.8 } } },
  { id: 'arcade', name: 'Arcade', text: 'GAME OVER', style: { font: 'Press Start 2P', size: 64, bold: false, color: '#39ff14', shadowColor: '#39ff14', shadowBlur: 22, shadowY: 0 },
    extra: { animIn: { type: 'glitchIn', duration: 0.5 }, motion: { type: 'flicker', intensity: 40 } } },
  { id: 'neonblue', name: 'Néon azul', text: 'NIGHT', style: { font: 'Monoton', size: 130, bold: false, color: '#d9f8ff', shadowColor: '#00c8ff', shadowBlur: 40, shadowY: 0 },
    extra: { animIn: { type: 'flash', duration: 0.5 }, motion: { type: 'breathe', intensity: 70 } } },
  { id: 'elegant', name: 'Elegante', text: 'Para sempre', style: { font: 'Great Vibes', size: 160, bold: false, color: '#ffffff', shadowBlur: 20 },
    extra: { animIn: { type: 'fade', duration: 1.2 }, animOut: { type: 'blur', duration: 0.8 } } },
  { id: 'horror', name: 'Terror', text: 'MEDO', style: { font: 'Creepster', size: 170, bold: false, color: '#c20000', shadowColor: '#000000', shadowBlur: 25 },
    extra: { animIn: { type: 'shake', duration: 0.6 }, motion: { type: 'shake', intensity: 30 } } },
  { id: 'gaming', name: 'Gaming', text: 'LEVEL UP', style: { font: 'Black Ops One', size: 130, bold: false, color: '#ffffff', strokeColor: '#ff3b3b', strokeWidth: 6, shadowBlur: 0 },
    extra: { animIn: { type: 'zoomBlur', duration: 0.5 }, motion: { type: 'zoomPulse', intensity: 50 } } },
  { id: 'future', name: 'Futurista', text: 'FUTURO', style: { font: 'Orbitron', size: 110, color: '#e0e7ff', letterSpacing: 14, shadowColor: '#6c7cff', shadowBlur: 24, shadowY: 0 },
    extra: { animIn: { type: 'wipeRight', duration: 0.9 }, animOut: { type: 'wipeLeft', duration: 0.5 } } },
  { id: 'typewriter', name: 'Máquina de escrever', text: 'Era uma vez…', style: { font: 'Special Elite', size: 84, bold: false, color: '#f5f0e1', background: '#000000', backgroundOpacity: 0.55, shadowBlur: 0 },
    extra: { animIn: { type: 'wipeRight', duration: 1.6 } } },
  { id: 'minimal', name: 'Minimal', text: 'MINIMAL', style: { font: 'Raleway', size: 90, bold: false, letterSpacing: 24, shadowBlur: 0, shadowY: 0 },
    extra: { animIn: { type: 'riseUp', duration: 0.9 }, animOut: { type: 'fade', duration: 0.6 } } },
  { id: 'candy', name: 'Doce', text: 'Yummy', style: { font: 'Titan One', size: 140, bold: false, color: '#ffb3d9', strokeColor: '#ffffff', strokeWidth: 9, shadowColor: '#ff5ca8', shadowBlur: 0, shadowY: 8 },
    extra: { animIn: { type: 'bounce', duration: 0.8 }, motion: { type: 'bounceLoop', intensity: 50 } } },
  { id: 'news', name: 'Notícia', text: 'ÚLTIMA HORA', style: { font: 'Barlow Condensed', size: 76, color: '#ffffff', background: '#e10600', backgroundOpacity: 1, shadowBlur: 0, shadowY: 0, align: 'left' },
    extra: { transform: { x: -0.2, y: 0.32, scale: 1, rotation: 0, opacity: 1, flipH: false, flipV: false }, animIn: { type: 'wipeRight', duration: 0.5 }, animOut: { type: 'slideLeft', duration: 0.4 } } },
  { id: 'epic', name: 'Épico', text: 'LENDA', style: { font: 'Cinzel', size: 130, color: '#f5d76e', letterSpacing: 12, shadowColor: '#000000', shadowBlur: 20 },
    extra: { animIn: { type: 'zoomOut', duration: 1.4 }, motion: { type: 'kenBurnsIn', intensity: 40 } } },
  { id: 'notebook', name: 'Caderno', text: 'lembrete :)', style: { font: 'Caveat', size: 130, color: '#ffffff', shadowBlur: 6 },
    extra: { animIn: { type: 'wipeRight', duration: 1 } } },
  { id: 'sticker', name: 'Autocolante', text: 'NOVO', style: { font: 'Lilita One', size: 130, bold: false, color: '#ffffff', background: '#8b6cff', backgroundOpacity: 1, shadowBlur: 0, shadowY: 0 },
    extra: { transform: { x: 0, y: 0, scale: 1, rotation: -6, opacity: 1, flipH: false, flipV: false }, animIn: { type: 'pop', duration: 0.45 }, motion: { type: 'wiggle', intensity: 40 } } },
  { id: 'retrowave', name: 'Retro 80s', text: 'RETRO', style: { font: 'Righteous', size: 150, color: '#ff71ce', strokeColor: '#01cdfe', strokeWidth: 5, shadowColor: '#b967ff', shadowBlur: 30, shadowY: 0 },
    extra: { animIn: { type: 'stretch', duration: 0.6 }, effects: [{ id: 'c', type: 'chromatic', intensity: 40 }] } },
  { id: 'flip', name: 'Virar', text: 'SURPRESA', style: { font: 'Luckiest Guy', size: 130, bold: false, color: '#ffffff', strokeColor: '#000000', strokeWidth: 7, shadowBlur: 0 },
    extra: { animIn: { type: 'flipX', duration: 0.5 }, animOut: { type: 'flipY', duration: 0.4 } } },
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
