import React, { useEffect, useRef, useState } from 'react';
import {
  AudioLines, Blend, Captions, ChevronDown, Copy, Download, FolderInput, Gauge, History, Image as ImageIcon, MoreHorizontal,
  Music, Package, Plus, Redo2, RectangleVertical, Save, Scissors, Settings, SlidersHorizontal, Snowflake, Sparkles, Trash2,
  Type, Undo2, Volume2, Wand2, X, Move, Clapperboard, PencilLine, RefreshCw,
} from 'lucide-react';
import type { Clip } from '@shared/types';
import { useEditor, mainTrackEnd } from '../store/editor';
import { usePlayback } from '../store/playback';
import { projectDuration } from '@shared/timeline';
import { api } from '../api';
import * as A from '../actions';
import { Preview } from './Preview';
import { Timeline, ContextMenu, MenuItem } from './timeline/Timeline';
import {
  AnimInspector, AudioInspector, BasicInspector, ColorInspector, FxInspector, ProjectInspector, SpeedInspector, TextInspector, TransitionInspector,
} from './inspector/Inspector';
import { MediaPanel } from './panels/MediaPanel';
import { TextPanel } from './panels/TextPanel';
import { EffectsPanel, FiltersPanel, TransitionsPanel } from './panels/LooksPanels';
import { CaptionsPanel } from './panels/CaptionsPanel';
import { ExportDialog } from './ExportDialog';
import { HistoryDialog, SettingsDialog } from './Dialogs';

type SheetId = 'media' | 'audio' | 'text' | 'captions' | 'effects' | 'filters' | 'transitions' | 'format'
  | 'edit-text' | 'transform' | 'color' | 'speed' | 'volume' | 'anim' | 'transition';

const SHEET_TITLES: Record<SheetId, string> = {
  media: 'Média', audio: 'Áudio e música', text: 'Texto', captions: 'Legendas', effects: 'Efeitos', filters: 'Filtros',
  transitions: 'Transições', format: 'Formato', 'edit-text': 'Editar texto', transform: 'Transformar e recortar', color: 'Ajustar cor',
  speed: 'Velocidade', volume: 'Volume', anim: 'Animação', transition: 'Transição',
};
const CLIP_SHEETS: SheetId[] = ['edit-text', 'transform', 'color', 'speed', 'volume', 'anim'];

interface Tool { label: string; icon: React.ReactNode; sheet?: SheetId; run?: () => void; danger?: boolean }

/** Ferramentas da barra inferior: gerais, ou específicas do clip selecionado (como no CapCut). */
function toolsFor(clip: Clip | undefined): Tool[] {
  if (!clip) {
    return [
      { label: 'Média', icon: <ImageIcon size={22} />, sheet: 'media' },
      { label: 'Áudio', icon: <Music size={22} />, sheet: 'audio' },
      { label: 'Texto', icon: <Type size={22} />, sheet: 'text' },
      { label: 'Legendas', icon: <Captions size={22} />, sheet: 'captions' },
      { label: 'Efeitos', icon: <Sparkles size={22} />, sheet: 'effects' },
      { label: 'Filtros', icon: <Wand2 size={22} />, sheet: 'filters' },
      { label: 'Transições', icon: <Blend size={22} />, sheet: 'transitions' },
      { label: 'Formato', icon: <RectangleVertical size={22} />, sheet: 'format' },
    ];
  }
  const split: Tool = { label: 'Dividir', icon: <Scissors size={22} />, run: A.splitAtPlayhead };
  const dup: Tool = { label: 'Duplicar', icon: <Copy size={22} />, run: A.duplicateSelection };
  const del: Tool = { label: 'Apagar', icon: <Trash2 size={22} />, run: () => A.deleteSelection(false), danger: true };
  const anim: Tool = { label: 'Animação', icon: <Clapperboard size={22} />, sheet: 'anim' };
  const transform: Tool = { label: 'Transformar', icon: <Move size={22} />, sheet: 'transform' };
  const color: Tool = { label: 'Ajustar', icon: <SlidersHorizontal size={22} />, sheet: 'color' };
  const filters: Tool = { label: 'Filtros', icon: <Wand2 size={22} />, sheet: 'filters' };
  const fx: Tool = { label: 'Efeitos', icon: <Sparkles size={22} />, sheet: 'effects' };
  const speed: Tool = { label: 'Velocidade', icon: <Gauge size={22} />, sheet: 'speed' };
  const volume: Tool = { label: 'Volume', icon: <Volume2 size={22} />, sheet: 'volume' };
  switch (clip.type) {
    case 'video':
      return [split, speed, volume, anim, color, filters, fx, transform,
        { label: 'Congelar', icon: <Snowflake size={22} />, run: A.freezeFrame },
        { label: 'Extrair áudio', icon: <AudioLines size={22} />, run: A.extractAudio }, dup, del];
    case 'image':
      return [split, anim, color, filters, fx, transform, dup, del];
    case 'audio':
      return [split, volume, speed, { label: 'Sincronizar', icon: <RefreshCw size={22} />, run: A.syncAudioToVideo }, dup, del];
    case 'text':
      return [{ label: 'Editar', icon: <PencilLine size={22} />, sheet: 'edit-text' }, split, anim, transform, fx, dup, del];
  }
}

export function Editor() {
  const project = useEditor((s) => s.project);
  const selection = useEditor((s) => s.selection);
  const transitionSel = useEditor((s) => s.transitionSel);
  const [sheet, setSheet] = useState<SheetId | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const clip = selection.length === 1 ? project.clips.find((c) => c.id === selection[0]) : undefined;
  useAutosave();
  useShortcuts(() => setShowExport(true));

  useEffect(() => { if (transitionSel) setSheet('transition'); }, [transitionSel]);
  useEffect(() => {
    setSheet((s) => (s && ((CLIP_SHEETS.includes(s) && !clip) || (s === 'transition' && !transitionSel)) ? null : s));
  }, [clip?.id, transitionSel]);

  // arrastar ficheiros do sistema para a janela
  const [dragOver, setDragOver] = useState(false);
  const onDrop = (e: React.DragEvent) => {
    setDragOver(false);
    if (!e.dataTransfer.files.length || (e.target as HTMLElement).closest('.tl-scroll')) return;
    e.preventDefault();
    const paths = Array.from(e.dataTransfer.files).map((f) => api.pathForFile(f)).filter(Boolean);
    const { trackId, end } = mainTrackEnd(useEditor.getState().project);
    A.importPaths(paths, { at: end, trackId });
  };

  /** Botão "+" do CapCut: escolhe ficheiros e acrescenta-os no fim da pista principal. */
  const addMedia = async () => {
    const paths = await api.openMedia();
    if (!paths.length) return;
    const { trackId, end } = mainTrackEnd(useEditor.getState().project);
    A.importPaths(paths, { at: end, trackId });
  };

  const tools = toolsFor(clip);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolset = clip ? clip.type : transitionSel ? 'transition' : 'main';
  useEffect(() => { if (toolbarRef.current) toolbarRef.current.scrollLeft = 0; }, [toolset]);
  const sheetBody = (id: SheetId) => {
    switch (id) {
      case 'media': return <MediaPanel kind="all" />;
      case 'audio': return <MediaPanel kind="audio" />;
      case 'text': return <TextPanel />;
      case 'captions': return <CaptionsPanel />;
      case 'effects': return <>{clip && clip.type !== 'audio' && <FxInspector clip={clip} />}<EffectsPanel /></>;
      case 'filters': return <FiltersPanel />;
      case 'transitions': return <TransitionsPanel />;
      case 'format': return <ProjectInspector project={project} />;
      case 'edit-text': return clip ? <TextInspector clip={clip} /> : null;
      case 'transform': return clip ? <BasicInspector clip={clip} /> : null;
      case 'color': return clip ? <ColorInspector clip={clip} /> : null;
      case 'speed': return clip ? <SpeedInspector clip={clip} project={project} /> : null;
      case 'volume': return clip ? <AudioInspector clip={clip} /> : null;
      case 'anim': return clip ? <AnimInspector clip={clip} /> : null;
      case 'transition': {
        const c = project.clips.find((x) => x.id === transitionSel);
        return c ? <TransitionInspector clip={c} project={project} /> : null;
      }
    }
  };

  return (
    <div className="app mobile" onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }} onDrop={onDrop}>
      <TopBar onExport={() => setShowExport(true)} onHistory={() => setShowHistory(true)} onSettings={() => setShowSettings(true)} />
      <div className="m-preview"><Preview /></div>
      <div className="m-timeline">
        <Timeline />
        <button className="m-add" title="Adicionar média" onClick={addMedia}><Plus size={22} /></button>
        {project.clips.length === 0 && (
          <div className="m-empty" onClick={addMedia}><Plus size={18} /> Toque em <b>+</b> para adicionar vídeos, fotos ou música</div>
        )}
      </div>
      <div className="m-toolbar" ref={toolbarRef}>
        {(clip || transitionSel) && (
          <button className="m-tool back" title="Voltar" onClick={() => { useEditor.getState().select([]); setSheet(null); }}>
            <ChevronDown size={22} /><span>Voltar</span>
          </button>
        )}
        {tools.map((t) => (
          <button key={t.label} className={`m-tool ${sheet && t.sheet === sheet ? 'on' : ''} ${t.danger ? 'danger' : ''}`}
            onClick={() => { if (t.run) t.run(); else if (t.sheet) setSheet(sheet === t.sheet ? null : t.sheet); }}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </div>
      {sheet && (
        <div className="sheet" key={sheet}>
          <div className="sheet-head">
            <span>{SHEET_TITLES[sheet]}</span>
            {(sheet === 'media' || sheet === 'audio') && <button className="btn sm primary" onClick={A.importDialog}><Plus size={13} /> Importar</button>}
            <button className="icon-btn" title="Fechar" onClick={() => { setSheet(null); if (sheet === 'transition') useEditor.getState().selectTransition(null); }}><X size={18} /></button>
          </div>
          <div className="sheet-body">{sheetBody(sheet)}</div>
        </div>
      )}
      {dragOver && (
        <div className="modal-bg" style={{ pointerEvents: 'none' }}>
          <div className="dropzone over" style={{ padding: 40, fontSize: 15, background: 'var(--bg2)' }}><FolderInput size={28} /><br />Largue os ficheiros para importar</div>
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
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);
  const color = save.status === 'saved' ? 'var(--green)' : save.status === 'error' ? 'var(--red)' : 'var(--accent2)';
  const dur = projectDuration(project);
  return (
    <div className="topbar m-top">
      <button className="icon-btn" title="Fechar e voltar aos projetos" onClick={async () => { await A.saveNow(true); await api.endSession(); useEditor.getState().goHome(); }}><X size={20} /></button>
      <div className="grow" style={{ minWidth: 0 }}>
        <input className="project-name" value={name} onChange={(e) => useEditor.getState().commit((d) => { d.name = e.target.value; }, 'rename')}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
        <div className="m-sub"><span className="dot" style={{ background: color }} />
          {project.settings.width < project.settings.height ? '9:16' : `${project.settings.width}×${project.settings.height}`} · {Math.floor(dur / 60)}:{String(Math.floor(dur % 60)).padStart(2, '0')}
        </div>
      </div>
      <button className="icon-btn" title="Desfazer (Ctrl+Z)" disabled={!canUndo} onClick={() => useEditor.getState().undo()}><Undo2 size={19} /></button>
      <button className="icon-btn" title="Refazer (Ctrl+Shift+Z)" disabled={!canRedo} onClick={() => useEditor.getState().redo()}><Redo2 size={19} /></button>
      <button className="icon-btn" title="Mais opções" onClick={(e) => setMenu({
        x: e.clientX - 200, y: e.clientY + 10, items: [
          { label: 'Guardar', icon: <Save size={14} />, kbd: 'Ctrl S', run: () => A.saveNow() },
          { label: 'Guardar como…', run: () => A.saveAs() },
          { label: 'Histórico de versões', icon: <History size={14} />, run: onHistory },
          { label: 'Exportar projeto com média', icon: <Package size={14} />, run: () => A.exportPackage() },
          { label: 'Definições', icon: <Settings size={14} />, run: onSettings },
        ],
      })}><MoreHorizontal size={19} /></button>
      <button className="btn primary" onClick={onExport}><Download size={15} /> Exportar</button>
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
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
