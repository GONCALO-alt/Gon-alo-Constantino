import React, { useState } from 'react';
import { Film, Image as ImageIcon, Music, Plus, Upload, Zap, Trash2, AlertTriangle } from 'lucide-react';
import type { MediaAsset } from '@shared/types';
import { fmtDuration } from '@shared/timeline';
import { useEditor } from '../../store/editor';
import { api, mediaUrl } from '../../api';
import * as A from '../../actions';
import { fmtBytes } from '../ui';

export function MediaPanel({ kind }: { kind: 'all' | 'audio' }) {
  const media = useEditor((s) => s.project.media);
  const clips = useEditor((s) => s.project.clips);
  const [filter, setFilter] = useState<'all' | 'video' | 'image' | 'audio'>('all');
  const [over, setOver] = useState(false);
  const list = media.filter((m) => (kind === 'audio' ? m.kind === 'audio' : filter === 'all' || m.kind === filter))
    .filter((m) => !m.name.startsWith('frame_'))
    .sort((a, b) => b.importedAt - a.importedAt);
  const used = new Set(clips.map((c) => c.mediaId));

  return (
    <>
      <div className="panel-head">
        {kind === 'audio' ? 'Áudio e música' : 'Biblioteca de média'}
        <button className="btn sm primary" onClick={A.importDialog}><Upload size={13} /> Importar</button>
      </div>
      <div className="panel-body">
        <div className={`dropzone ${over ? 'over' : ''}`} onClick={A.importDialog}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setOver(false); A.importPaths(Array.from(e.dataTransfer.files).map((f) => api.pathForFile(f))); }}>
          <Upload size={20} /><br />
          {kind === 'audio' ? 'Adicionar música: MP3, WAV, AAC, M4A, FLAC, OGG…' : 'Arraste ficheiros para aqui ou clique para importar'}
          <div className="small muted" style={{ marginTop: 4 }}>{kind === 'audio' ? '' : 'MP4, MOV, MKV, WebM, AVI · PNG, JPG, WebP · MP3, WAV, AAC…'}</div>
        </div>
        {kind === 'all' && media.length > 0 && (
          <div className="seg" style={{ marginTop: 12 }}>
            {(['all', 'video', 'image', 'audio'] as const).map((f) => (
              <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{{ all: 'Tudo', video: 'Vídeo', image: 'Imagem', audio: 'Áudio' }[f]}</button>
            ))}
          </div>
        )}
        {list.length === 0 && <div className="empty-state">{media.length ? 'Nada neste filtro.' : 'A biblioteca está vazia.'}</div>}
        <div className="media-grid">
          {list.map((m) => <MediaCard key={m.id} m={m} used={used.has(m.id)} />)}
        </div>
      </div>
    </>
  );
}

function MediaCard({ m, used }: { m: MediaAsset; used: boolean }) {
  const icon = m.kind === 'video' ? <Film size={12} /> : m.kind === 'image' ? <ImageIcon size={12} /> : <Music size={12} />;
  const info = [
    m.kind !== 'audio' ? `${m.width}×${m.height}` : `${(m.sampleRate ?? 0) / 1000} kHz`,
    m.kind === 'video' ? `${Math.round(m.fps)} fps` : '',
    (m.videoCodec ?? m.audioCodec ?? '').toUpperCase(),
    fmtBytes(m.size),
  ].filter(Boolean).join(' · ');
  return (
    <div className="media-card" draggable title={`${m.name}\n${info}\nArraste para a timeline ou clique em + para acrescentar`}
      onDragStart={(e) => { e.dataTransfer.setData('application/x-media-id', m.id); e.dataTransfer.effectAllowed = 'copy'; }}
      onDoubleClick={() => A.addToTimeline(m)}>
      <div className="media-thumb" style={m.thumbnail ? { backgroundImage: `url("${mediaUrl(m.thumbnail)}")` } : undefined}>
        {!m.thumbnail && (m.kind === 'audio' ? <Music size={26} /> : <Film size={26} />)}
        <span className="kind">{icon}</span>
        {m.duration > 0 && <span className="badge">{fmtDuration(m.duration)}</span>}
        <button className="btn sm primary add" title="Acrescentar à timeline" onClick={(e) => { e.stopPropagation(); A.addToTimeline(m); }}><Plus size={13} /></button>
      </div>
      <div className="media-meta">
        <div className="media-name">{m.name}</div>
        <div className="media-info">{info}</div>
        <ProxyStatus m={m} />
        {!used && (
          <button className="btn sm ghost danger" style={{ height: 20, padding: '0 4px', marginTop: 2 }} title="Remover da biblioteca"
            onClick={() => useEditor.getState().commit((d) => { d.media = d.media.filter((x) => x.id !== m.id); })}><Trash2 size={11} /></button>
        )}
      </div>
    </div>
  );
}

function ProxyStatus({ m }: { m: MediaAsset }) {
  if (m.kind === 'image') return null;
  if (m.proxyStatus === 'running') {
    return (
      <div style={{ marginTop: 4 }}>
        <div className="row small muted" style={{ justifyContent: 'space-between' }}>
          <span>A criar proxy… {Math.round((m.proxyProgress ?? 0) * 100)}%</span>
          <button className="btn sm ghost" style={{ height: 18, padding: '0 4px' }} onClick={() => api.cancelProxy(m.id)}>×</button>
        </div>
        <div className="progress"><div style={{ width: `${(m.proxyProgress ?? 0) * 100}%` }} /></div>
      </div>
    );
  }
  if (m.proxyStatus === 'ready') return <div className="small" style={{ color: 'var(--green)', marginTop: 3 }}><Zap size={10} /> Proxy pronto</div>;
  if (m.needsProxy) {
    return (
      <div className="row small" style={{ color: 'var(--accent2)', marginTop: 3, gap: 4 }}>
        <AlertTriangle size={11} /> <span className="grow">Formato pesado/sem leitura direta</span>
        <button className="btn sm" style={{ height: 18, padding: '0 5px', fontSize: 10.5 }} onClick={() => api.makeProxy(m)}>Proxy</button>
      </div>
    );
  }
  if (m.kind === 'video' && (m.height > 1440 || m.proxyStatus === 'error')) {
    return (
      <div className="row small muted" style={{ marginTop: 3 }}>
        <span className="grow">{m.proxyStatus === 'error' ? 'Erro no proxy' : 'Alta resolução'}</span>
        <button className="btn sm" style={{ height: 18, padding: '0 5px', fontSize: 10.5 }} onClick={() => api.makeProxy(m)}>Criar proxy</button>
      </div>
    );
  }
  return null;
}
