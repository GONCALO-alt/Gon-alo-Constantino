import React, { useEffect, useRef, useState } from 'react';
import {
  AudioLines, Blend, Captions, ChevronLeft, Download, FolderInput, History, Home as HomeIcon, Image as ImageIcon, Redo2, Save,
  Scissors, Settings, Sparkles, Type, Undo2, Wand2, Package,
} from 'lucide-react';
import { useEditor, LeftTab } from '../store/editor';
import { usePlayback } from '../store/playback';
import { projectDuration } from '@shared/timeline';
import { api } from '../api';
import * as A from '../actions';
import { Preview } from './Preview';
import { Timeline } from './timeline/Timeline';
import { Inspector } from './inspector/Inspector';
import { MediaPanel } from './panels/MediaPanel';
import { TextPanel } from './panels/TextPanel';
import { EffectsPanel, FiltersPanel, TransitionsPanel } from './panels/LooksPanels';
import { CaptionsPanel } from './panels/CaptionsPanel';
import { ExportDialog } from './ExportDialog';
import { HistoryDialog, SettingsDialog } from './Dialogs';

const TABS: { id: LeftTab; label: string; icon: React.ReactNode }[] = [
  { id: 'media', label: 'Média', icon: <ImageIcon size={19} /> },
  { id: 'audio', label: 'Áudio', icon: <AudioLines size={19} /> },
  { id: 'text', label: 'Texto', icon: <Type size={19} /> },
  { id: 'captions', label: 'Legendas', icon: <Captions size={19} /> },
  { id: 'effects', label: 'Efeitos', icon: <Sparkles size={19} /> },
  { id: 'transitions', label: 'Transições', icon: <Blend size={19} /> },
  { id: 'filters', label: 'Filtros', icon: <Wand2 size={19} /> },
];

export function Editor() {
  const leftTab = useEditor((s) => s.leftTab);
  const [leftOpen, setLeftOpen] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tlHeight, setTlHeight] = useState(() => Number(localStorage.getItem('tlh')) || 320);
  useAutosave();
  useShortcuts(() => setShowExport(true));

  // arrastar ficheiros do sistema para a janela
  const [dragOver, setDragOver] = useState(false);
  const onDrop = (e: React.DragEvent) => {
    setDragOver(false);
    if (!e.dataTransfer.files.length || (e.target as HTMLElement).closest('.tl-scroll')) return;
    e.preventDefault();
    const paths = Array.from(e.dataTransfer.files).map((f) => api.pathForFile(f)).filter(Boolean);
    A.importPaths(paths);
  };

  return (
    <div className="app" onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }} onDrop={onDrop}>
      <TopBar onExport={() => setShowExport(true)} onHistory={() => setShowHistory(true)} onSettings={() => setShowSettings(true)} />
      <div className={`workspace ${leftOpen ? '' : 'no-left'}`}>
        <div className="rail">
          {TABS.map((t) => (
            <button key={t.id} className={`rail-btn ${leftTab === t.id && leftOpen ? 'on' : ''}`}
              onClick={() => { if (leftTab === t.id) setLeftOpen(!leftOpen); else { useEditor.getState().setLeftTab(t.id); setLeftOpen(true); } }}>
              {t.icon}{t.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="rail-btn" title={leftOpen ? 'Recolher painel' : 'Expandir painel'} onClick={() => setLeftOpen(!leftOpen)}>
            <ChevronLeft size={18} style={{ transform: leftOpen ? 'none' : 'rotate(180deg)', transition: 'transform .2s' }} />
          </button>
        </div>
        <div className="panel">
          {leftOpen && (
            <>
              {leftTab === 'media' && <MediaPanel kind="all" />}
              {leftTab === 'audio' && <MediaPanel kind="audio" />}
              {leftTab === 'text' && <TextPanel />}
              {leftTab === 'captions' && <CaptionsPanel />}
              {leftTab === 'effects' && <EffectsPanel />}
              {leftTab === 'transitions' && <TransitionsPanel />}
              {leftTab === 'filters' && <FiltersPanel />}
            </>
          )}
        </div>
        <div className="center">
          <Preview />
          <div className="timeline" style={{ ['--tl-h' as any]: `${tlHeight}px` }}>
            <div className="tl-resize" onPointerDown={(e) => {
              const y0 = e.clientY, h0 = tlHeight;
              const move = (ev: PointerEvent) => setTlHeight(Math.max(160, Math.min(window.innerHeight - 260, h0 - (ev.clientY - y0))));
              const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); localStorage.setItem('tlh', String(tlHeight)); };
              window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
            }} />
            <Timeline />
          </div>
        </div>
        <Inspector />
      </div>
      {dragOver && (
        <div className="modal-bg" style={{ pointerEvents: 'none' }}>
          <div className="dropzone over" style={{ padding: 48, fontSize: 16, background: 'var(--bg2)' }}><FolderInput size={30} /><br />Largue os ficheiros para importar</div>
        </div>
      )}
      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
      {showHistory && <HistoryDialog onClose={() => setShowHistory(false)} />}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function TopBar({ onExport, onHistory, onSettings }: { onExport: () => void; onHistory: () => void; onSettings: () => void }) {
  const name = useEditor((s) => s.project.name);
  const save = useEditor((s) => s.saveState);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const project = useEditor((s) => s.project);
  const dur = projectDuration(project);
  const [, force] = useState(0);
  useEffect(() => { const i = setInterval(() => force((x) => x + 1), 15000); return () => clearInterval(i); }, []);
  const ago = Math.round((Date.now() - save.at) / 60000);
  const label = save.status === 'saving' ? 'A guardar…' : save.status === 'dirty' ? 'Alterações por guardar' : save.status === 'error' ? 'Erro ao guardar'
    : ago < 1 ? 'Guardado agora' : `Guardado há ${ago} min`;
  const color = save.status === 'saved' ? 'var(--green)' : save.status === 'error' ? 'var(--red)' : 'var(--accent2)';
  return (
    <div className="topbar">
      <button className="icon-btn" title="Projetos" onClick={async () => { await A.saveNow(true); await api.endSession(); useEditor.getState().goHome(); }}><HomeIcon size={17} /></button>
      <div className="brand"><div className="logo"><Scissors size={15} /></div></div>
      <input className="project-name" value={name} onChange={(e) => useEditor.getState().commit((d) => { d.name = e.target.value; }, 'rename')}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
      <div className="save-state"><span className="dot" style={{ background: color }} />{label}</div>
      <div style={{ flex: 1 }} />
      <span className="chip">{project.settings.width}×{project.settings.height} · {project.settings.fps} fps · {Math.floor(dur / 60)}:{String(Math.floor(dur % 60)).padStart(2, '0')}</span>
      <button className="icon-btn" title="Desfazer (Ctrl+Z)" disabled={!canUndo} onClick={() => useEditor.getState().undo()}><Undo2 size={17} /></button>
      <button className="icon-btn" title="Refazer (Ctrl+Shift+Z)" disabled={!canRedo} onClick={() => useEditor.getState().redo()}><Redo2 size={17} /></button>
      <button className="icon-btn" title="Guardar (Ctrl+S)" onClick={() => A.saveNow()}><Save size={17} /></button>
      <button className="icon-btn" title="Histórico de versões" onClick={onHistory}><History size={17} /></button>
      <button className="icon-btn" title="Exportar projeto com média (pasta)" onClick={() => A.exportPackage()}><Package size={17} /></button>
      <button className="icon-btn" title="Definições" onClick={onSettings}><Settings size={17} /></button>
      <button className="btn primary" onClick={onExport}><Download size={15} /> Exportar</button>
    </div>
  );
}

/** Autosave: grava ~1 s depois de cada alteração (ficheiro do projeto + diário de recuperação + histórico). */
function useAutosave() {
  const version = useEditor((s) => s.version);
  const status = useEditor((s) => s.saveState.status);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (status !== 'dirty') return;
    const t = setTimeout(() => A.saveNow(true), 1000);
    return () => clearTimeout(t);
  }, [version, status]);
  useEffect(() => {
    const before = () => { if (useEditor.getState().saveState.status === 'dirty') A.saveNow(true); };
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, []);
}

function useShortcuts(openExport: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable) return;
      const s = useEditor.getState();
      const pb = usePlayback.getState();
      const fps = s.project.settings.fps;
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); s.undo(); }
      else if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); s.redo(); }
      else if (mod && k === 's') { e.preventDefault(); e.shiftKey ? A.saveAs() : A.saveNow(); }
      else if (mod && k === 'e') { e.preventDefault(); openExport(); }
      else if (mod && k === 'c') { A.copySelection(); }
      else if (mod && k === 'v') { A.paste(); }
      else if (mod && k === 'd') { e.preventDefault(); A.duplicateSelection(); }
      else if (mod && k === 'b') { e.preventDefault(); A.splitAtPlayhead(); }
      else if (mod && k === 'a') { e.preventDefault(); s.select(s.project.clips.map((c) => c.id)); }
      else if (k === ' ') { e.preventDefault(); pb.toggle(); }
      else if (k === 's' && !mod) A.splitAtPlayhead();
      else if (k === 'delete' || k === 'backspace') { e.preventDefault(); A.deleteSelection(e.shiftKey); }
      else if (k === 'arrowleft') { e.preventDefault(); pb.setPlaying(false); pb.seek(pb.time - (e.shiftKey ? 1 : 1 / fps)); }
      else if (k === 'arrowright') { e.preventDefault(); pb.setPlaying(false); pb.seek(pb.time + (e.shiftKey ? 1 : 1 / fps)); }
      else if (k === 'home') pb.seek(0);
      else if (k === 'end') pb.seek(projectDuration(s.project));
      else if (k === 'm') s.commit((d) => { d.markers.push(pb.time); });
      else if (k === '=' || k === '+') s.setZoom(s.zoom * 1.25);
      else if (k === '-') s.setZoom(s.zoom / 1.25);
      else if (k === 'escape') s.select([]);
      else if (k === 'f' && !mod) document.dispatchEvent(new CustomEvent('preview-fullscreen'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openExport]);
}
