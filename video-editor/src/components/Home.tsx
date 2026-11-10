import React, { useEffect, useState } from 'react';
import { Copy, Film, FolderOpen, Pencil, Plus, Scissors, Trash2, LifeBuoy } from 'lucide-react';
import type { ProjectSummary, Project } from '@shared/types';
import { ASPECTS, createProject } from '@shared/defaults';
import { fmtDuration } from '@shared/timeline';
import { api, mediaUrl } from '../api';
import { useEditor } from '../store/editor';
import { Modal } from './ui';

export async function openFile(file: string) {
  try {
    const p = await api.loadProject(file);
    useEditor.getState().openProject(p, file);
    await api.beginSession(p.id, file);
    // reanalisa média (miniaturas/ondas em cache) e avisa se algum ficheiro desapareceu
    const missing: string[] = [];
    for (const m of p.media) {
      if (!(await api.exists(m.path))) missing.push(m.name);
      else if (!m.filmstrip || !m.waveform) api.analyzeMedia(m, { autoProxy: useEditor.getState().settings.autoProxy });
    }
    if (missing.length) useEditor.getState().notify(`Ficheiros em falta: ${missing.join(', ')}`, 'error');
  } catch (e: any) {
    useEditor.getState().notify(`Não foi possível abrir o projeto: ${e.message}`, 'error');
  }
}

export async function newProject(w: number, h: number, name = 'Projeto sem título') {
  const p = createProject(name, w, h, 30);
  const file = await api.saveProject(p);
  useEditor.getState().openProject(p, file);
  await api.beginSession(p.id, file);
}

export function Home() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [renaming, setRenaming] = useState<ProjectSummary | null>(null);
  const [recovery, setRecovery] = useState<{ file: string; savedAt: number; project: Project } | null>(null);
  const refresh = () => api.listProjects().then(setProjects);

  useEffect(() => {
    refresh();
    api.pendingRecovery().then((r) => { if (r) setRecovery(r); });
  }, []);

  return (
    <div className="home">
      <div className="home-inner">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="brand" style={{ fontSize: 20 }}>
            <div className="logo" style={{ width: 34, height: 34, borderRadius: 9 }}><Scissors size={18} /></div>
            Corte Studio
          </div>
          <button className="btn" onClick={async () => { const f = await api.openProjectDialog(); if (f) openFile(f); }}>
            <FolderOpen size={15} /> Abrir projeto…
          </button>
        </div>

        <div className="hero">
          <div className="new-card" onClick={() => newProject(1080, 1920)}>
            <div className="row" style={{ gap: 12 }}>
              <div className="logo" style={{ width: 44, height: 44, borderRadius: 12 }}><Plus size={24} /></div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Novo projeto</div>
                <div className="muted">Vertical 9:16 · exportação até 4K a 60 FPS</div>
              </div>
            </div>
            <div className="aspects" onClick={(e) => e.stopPropagation()}>
              {ASPECTS.map((a) => (
                <div key={a.id} className="aspect" onClick={() => newProject(a.w, a.h)}>
                  <i style={{ width: a.w > a.h ? 18 : (18 * a.w) / a.h, height: a.h > a.w ? 18 : (18 * a.h) / a.w }} />
                  {a.label}
                </div>
              ))}
            </div>
          </div>
          <div className="new-card" style={{ background: 'var(--bg2)', borderColor: 'var(--line)', cursor: 'default' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Atalhos essenciais</div>
            <div className="hint" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px' }}>
              <kbd>Espaço</kbd><span>Reproduzir / pausar</span>
              <kbd>S</kbd><span>Dividir no cursor</span>
              <kbd>Del</kbd><span>Apagar seleção (<kbd>Shift</kbd> = ripple)</span>
              <kbd>Ctrl Z / Ctrl Shift Z</kbd><span>Desfazer / refazer</span>
              <kbd>Ctrl S</kbd><span>Guardar · <kbd>Ctrl E</kbd> Exportar</span>
              <kbd>← →</kbd><span>Fotograma anterior / seguinte</span>
            </div>
          </div>
        </div>

        <h3 style={{ marginTop: 36, marginBottom: 0 }}>Projetos</h3>
        {projects.length === 0 && <div className="empty-state">Ainda não há projetos. Crie um novo para começar.</div>}
        <div className="proj-grid">
          {projects.map((p) => (
            <div key={p.path} className="proj" onClick={() => openFile(p.path)}>
              <div className="proj-thumb" style={p.thumbnail ? { backgroundImage: `url("${mediaUrl(p.thumbnail)}")` } : undefined}>
                {!p.thumbnail && <Film size={28} />}
              </div>
              <div className="proj-meta">
                <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div className="small muted">
                  {new Date(p.updatedAt).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' })}
                  {p.duration > 0 && ` · ${fmtDuration(p.duration)}`} · {p.width}×{p.height}
                </div>
              </div>
              <div className="proj-actions" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn sm" title="Renomear" onClick={() => setRenaming(p)}><Pencil size={13} /></button>
                <button className="icon-btn sm" title="Duplicar" onClick={async () => { await api.duplicateProject(p.path); refresh(); }}><Copy size={13} /></button>
                <button className="icon-btn sm" title="Mostrar na pasta" onClick={() => api.reveal(p.path)}><FolderOpen size={13} /></button>
                <button className="icon-btn sm" title="Apagar" onClick={async () => {
                  if ((await api.confirm(`Apagar o projeto "${p.name}"?`, 'Os ficheiros de média originais não são apagados.', ['Apagar', 'Cancelar'])) === 0) {
                    await api.removeProject(p.path); refresh();
                  }
                }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {renaming && <RenameDialog initial={renaming.name} onClose={() => setRenaming(null)} onSave={async (n) => { await api.renameProject(renaming.path, n); setRenaming(null); refresh(); }} />}
      {recovery && (
        <Modal title={<span className="row"><LifeBuoy size={18} color="var(--accent)" /> Recuperar projeto</span>} onClose={() => { api.endSession(); setRecovery(null); }}
          footer={<>
            <button className="btn" onClick={() => { api.endSession(); setRecovery(null); }}>Ignorar</button>
            <button className="btn primary" onClick={async () => {
              const r = recovery; setRecovery(null);
              useEditor.getState().openProject(r.project, r.file);
              await api.beginSession(r.project.id, r.file);
              useEditor.getState().notify('Projeto recuperado a partir do último autosave', 'success');
            }}>Recuperar</button>
          </>}>
          <p>A aplicação não foi encerrada corretamente. Existe uma versão guardada automaticamente de
            <b> {recovery.project.name}</b> de {new Date(recovery.savedAt).toLocaleString('pt-PT')}.</p>
          <p className="muted">{recovery.project.clips.length} clips · {recovery.project.media.length} ficheiros de média</p>
        </Modal>
      )}
    </div>
  );
}

export function RenameDialog({ initial, onClose, onSave }: { initial: string; onClose: () => void; onSave: (n: string) => void }) {
  const [name, setName] = useState(initial);
  return (
    <Modal title="Renomear projeto" onClose={onClose} width={420}
      footer={<><button className="btn" onClick={onClose}>Cancelar</button><button className="btn primary" onClick={() => onSave(name.trim() || initial)}>Guardar</button></>}>
      <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSave(name.trim() || initial)} />
    </Modal>
  );
}
