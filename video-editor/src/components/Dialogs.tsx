import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { fmtDuration } from '@shared/timeline';
import { useEditor } from '../store/editor';
import { api, isWeb } from '../api';
import { Modal, Toggle } from './ui';
import * as A from '../actions';

export function HistoryDialog({ onClose }: { onClose: () => void }) {
  const project = useEditor((s) => s.project);
  const [list, setList] = useState<{ time: number; clips: number; duration: number }[] | null>(null);
  useEffect(() => { api.history(project.id).then(setList); }, [project.id]);
  const restore = async (time: number) => {
    const snap = await api.loadSnapshot(project.id, time);
    await api.snapshot(useEditor.getState().project); // guarda o estado atual antes de restaurar
    useEditor.getState().commit((d) => {
      d.tracks = snap.tracks as any;
      d.clips = snap.clips as any;
      d.settings = snap.settings as any;
      d.markers = snap.markers as any;
      for (const m of snap.media) if (!d.media.find((x) => x.id === m.id)) d.media.push(m as any);
    });
    useEditor.getState().notify(`Versão de ${new Date(time).toLocaleTimeString('pt-PT')} restaurada (Ctrl+Z para anular)`, 'success');
    onClose();
  };
  return (
    <Modal title="Histórico de versões" onClose={onClose} width={520}>
      <div className="hint" style={{ marginBottom: 12 }}>O Corte Studio guarda automaticamente uma versão do projeto a cada minuto de edição (até 50). Pode recuperar qualquer uma delas.</div>
      {!list && <div className="muted">A carregar…</div>}
      {list?.length === 0 && <div className="empty-state">Ainda não há versões anteriores. Continue a editar — o autosave cria-as automaticamente.</div>}
      {list?.map((v) => (
        <div key={v.time} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
          <div className="grow">
            <b>{new Date(v.time).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'medium' })}</b>
            <div className="small muted">{v.clips} clips · {fmtDuration(v.duration) || '0:00'}</div>
          </div>
          <button className="btn sm" onClick={() => restore(v.time)}><RotateCcw size={13} /> Restaurar</button>
        </div>
      ))}
    </Modal>
  );
}

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const settings = useEditor((s) => s.settings);
  const [info, setInfo] = useState<{ ffmpeg: string; userData: string; version: string } | null>(null);
  const [hw, setHw] = useState<string>('A detetar…');
  useEffect(() => {
    api.appInfo().then(setInfo);
    api.detectHardware().then((h) => setHw(h.encoders.map((e) => e.label).join(' · '))).catch(() => setHw('—'));
  }, []);
  return (
    <Modal title="Definições" onClose={onClose} width={560} footer={<button className="btn primary" onClick={onClose}>Fechar</button>}>
      <div className="section-title"><span>Desempenho</span></div>
      <Toggle label="Usar proxies na pré-visualização" value={settings.useProxies} onChange={(v) => useEditor.getState().setSettings({ useProxies: v })} />
      <Toggle label="Criar proxies automaticamente para formatos pesados" value={settings.autoProxy} onChange={(v) => useEditor.getState().setSettings({ autoProxy: v })} />
      <Toggle label="Íman na timeline (snap)" value={settings.snapping} onChange={(v) => useEditor.getState().setSettings({ snapping: v })} />
      <div className="sep" />
      <div className="section-title"><span>Projeto</span></div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        {!isWeb && <button className="btn sm" onClick={() => A.saveAs()}>Guardar como…</button>}
        {!isWeb && <button className="btn sm" onClick={() => A.exportPackage()}>Exportar projeto com média…</button>}
        {isWeb && <span className="hint">Os projetos e a média ficam guardados neste navegador.</span>}
      </div>
      <div className="sep" />
      <div className="section-title"><span>Sistema</span></div>
      <div className="hint" style={{ userSelect: 'text', lineHeight: 1.7 }}>
        Codificadores disponíveis: {hw}<br />
        FFmpeg: {info?.ffmpeg}<br />
        Dados da aplicação: {info?.userData}<br />
        Versão: {info?.version}
      </div>
    </Modal>
  );
}
