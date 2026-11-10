import React, { useRef, useState } from 'react';
import { Captions, Download, FileUp, Plus, Trash2, Wand2 } from 'lucide-react';
import type { TextStyle } from '@shared/types';
import { CAPTION_STYLE } from '@shared/defaults';
import { parseSrt, toSrt } from '@shared/srt';
import { clipEnd, fmtTime, projectDuration } from '@shared/timeline';
import { useEditor, addText } from '../../store/editor';
import { usePlayback } from '../../store/playback';
import { api, isWeb } from '../../api';
import { captionTracks, insertCaptions, LANG_NAMES, LANGUAGES, splitSegments, trackSegments, wavToFloat32 } from '../../captions/captions';
import { FontPicker } from '../FontPicker';
import { Slider, Toggle } from '../ui';

export function CaptionsPanel() {
  const project = useEditor((s) => s.project);
  const tracks = captionTracks(project);
  const [trackId, setTrackId] = useState<string | null>(null);
  const active = tracks.find((t) => t.id === trackId) ?? tracks[0];
  const [model, setModel] = useState('base');
  const [language, setLanguage] = useState('auto');
  const [job, setJob] = useState<{ status: string; progress?: number; error?: string; detected?: string } | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const generate = async () => {
    if (projectDuration(project) <= 0) { useEditor.getState().notify('A timeline está vazia'); return; }
    setJob({ status: 'A extrair o áudio da timeline…' });
    try {
      const wav = await api.captionAudio(project);
      const audio = wavToFloat32(wav);
      if (!audio.length) throw new Error('Não há áudio na timeline');
      const w = workerRef.current ?? new Worker(new URL('../../captions/whisper.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = w;
      const files = new Map<string, number>();
      w.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'status') setJob((j) => ({ ...j, status: m.text }));
        else if (m.type === 'download') {
          files.set(m.file, m.progress);
          const avg = Array.from(files.values()).reduce((a, b) => a + b, 0) / files.size;
          setJob((j) => ({ ...j, status: 'A descarregar o modelo (só na primeira vez)…', progress: avg / 100 }));
        } else if (m.type === 'language') setJob((j) => ({ ...j!, detected: m.language }));
        else if (m.type === 'done') {
          const segs = splitSegments(m.chunks.map((c: any, i: number, arr: any[]) => ({ start: c.start, end: c.end ?? arr[i + 1]?.start ?? c.start + 3, text: c.text })));
          const lang = LANG_NAMES[m.language] ?? m.language;
          const id = insertCaptions(segs, `Legendas (${lang})`);
          setTrackId(id);
          setJob(null);
          useEditor.getState().notify(`${segs.length} legendas geradas · idioma: ${lang}`, 'success');
        } else if (m.type === 'error') setJob({ status: '', error: m.message });
      };
      w.onerror = (e) => setJob({ status: '', error: e.message || 'Erro no reconhecimento de voz' });
      w.postMessage({ audio, model, language }, [audio.buffer]);
    } catch (e: any) {
      setJob({ status: '', error: e.message });
    }
  };

  const importSrt = async () => {
    const txt = await api.openSrt();
    if (!txt) return;
    const segs = parseSrt(txt);
    if (!segs.length) { useEditor.getState().notify('Ficheiro SRT sem legendas válidas', 'error'); return; }
    setTrackId(insertCaptions(segs, 'Legendas (SRT)'));
    useEditor.getState().notify(`${segs.length} legendas importadas`, 'success');
  };

  const exportSrt = async () => {
    if (!active) return;
    const f = await api.saveSrt(project.name, toSrt(trackSegments(project, active.id)));
    if (f) useEditor.getState().notify('Legendas exportadas: ' + f, 'success');
  };

  const clips = active ? project.clips.filter((c) => c.trackId === active.id && c.type === 'text').sort((a, b) => a.start - b.start) : [];
  const style: TextStyle = clips[0]?.style ?? CAPTION_STYLE;
  const applyStyle = (patch: Partial<TextStyle>, extra?: (c: any) => void) => useEditor.getState().commit((d) => {
    for (const c of d.clips) if (active && c.trackId === active.id && c.type === 'text') { c.style = { ...c.style!, ...patch }; extra?.(c); }
  }, `capstyle-${Object.keys(patch).join()}`);

  return (
    <>
      <div className="panel-head">Legendas</div>
      <div className="panel-body">
        <div className="section-title"><span><Wand2 size={13} /> Legendas automáticas</span></div>
        {isWeb && <div className="hint" style={{ marginBottom: 10 }}>As legendas automáticas (Whisper) precisam de descarregar o modelo da Internet e só estão disponíveis na app desktop. Aqui pode importar um ficheiro SRT ou escrever as frases.</div>}
        {!isWeb && <>
        <div className="field">
          <label>Idioma</label>
          <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Modelo Whisper</label>
          <select className="input" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="tiny">Rápido (tiny · ~40 MB)</option>
            <option value="base">Equilibrado (base · ~80 MB)</option>
            <option value="small">Preciso (small · ~250 MB)</option>
          </select>
        </div>
        <button className="btn primary" style={{ width: '100%' }} disabled={!!job && !job.error} onClick={generate}><Captions size={15} /> Gerar legendas</button>
        {job && (
          <div style={{ marginTop: 10 }}>
            {job.error ? <div className="hint" style={{ color: 'var(--red)' }}>Erro: {job.error}</div> : (
              <>
                <div className="hint">{job.status}{job.detected && ` · idioma detetado: ${LANG_NAMES[job.detected] ?? job.detected}`}</div>
                <div className="progress" style={{ marginTop: 6 }}><div style={{ width: `${(job.progress ?? 0.5) * 100}%`, opacity: job.progress == null ? 0.5 : 1 }} /></div>
              </>
            )}
          </div>
        )}
        <div className="hint" style={{ marginTop: 8 }}>O reconhecimento corre localmente (Whisper). Na primeira utilização o modelo é descarregado da Internet.</div>
        </>}

        <div className="sep" />
        <div className="row">
          <button className="btn sm" onClick={importSrt}><FileUp size={13} /> Importar SRT</button>
          <button className="btn sm" disabled={!active} onClick={exportSrt}><Download size={13} /> Exportar SRT</button>
        </div>

        {tracks.length > 0 && active && (
          <>
            <div className="sep" />
            {tracks.length > 1 && (
              <div className="field">
                <label>Pista de legendas</label>
                <select className="input" value={active.id} onChange={(e) => setTrackId(e.target.value)}>
                  {tracks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
            <div className="section-title"><span>Estilo (aplicado a todas)</span></div>
            <FontPicker value={style.font} onChange={(f) => applyStyle({ font: f })} />
            <div className="row" style={{ marginBottom: 10 }}>

              <input type="color" value={style.color} title="Cor do texto" onChange={(e) => applyStyle({ color: e.target.value })} />
              <input type="color" value={style.strokeColor} title="Cor do contorno" onChange={(e) => applyStyle({ strokeColor: e.target.value })} />
            </div>
            <Slider label="Tamanho" value={style.size} min={20} max={160} onChange={(v) => applyStyle({ size: v })} />
            <Slider label="Contorno" value={style.strokeWidth} min={0} max={16} step={0.5} onChange={(v) => applyStyle({ strokeWidth: v })} />
            <Slider label="Posição vertical" value={Math.round((clips[0]?.transform.y ?? 0.38) * 100)} min={-48} max={48} unit="%"
              onChange={(v) => applyStyle({}, (c) => { c.transform.y = v / 100; })} />
            <Toggle label="Caixa de fundo" value={!!style.background} onChange={(v) => applyStyle({ background: v ? '#000000' : '', backgroundOpacity: 0.6 })} />
            <Toggle label="Negrito" value={style.bold} onChange={(v) => applyStyle({ bold: v })} />
            <div className="field">
              <label>Animação de entrada</label>
              <select className="input" value={clips[0]?.animIn.type ?? 'none'} onChange={(e) => applyStyle({}, (c) => { c.animIn = { type: e.target.value, duration: 0.25 }; })}>
                <option value="none">Nenhuma</option><option value="fade">Fade</option><option value="pop">Pop</option><option value="slideUp">Subir</option>
              </select>
            </div>

            <div className="section-title" style={{ marginTop: 6 }}>
              <span>Frases ({clips.length})</span>
              <button className="btn sm" onClick={() => useEditor.getState().commit((d) => {
                const t = usePlayback.getState().time;
                addText(d, t, 'Nova frase', style, { trackId: active.id, duration: 2, transform: { ...(clips[0]?.transform ?? { x: 0, y: 0.38, scale: 1, rotation: 0, opacity: 1, flipH: false, flipV: false }) } });
              })}><Plus size={12} /> Frase</button>
            </div>
            {clips.map((c) => (
              <div key={c.id} className="caption-row">
                <div className="t" title="Ir para esta frase" onClick={() => { usePlayback.getState().seek(c.start); useEditor.getState().select([c.id]); }}>
                  {fmtTime(c.start, 100, false)}<br />{fmtTime(clipEnd(c), 100, false)}
                </div>
                <textarea className="input" value={c.text} onKeyDown={(e) => e.stopPropagation()}
                  onChange={(e) => useEditor.getState().commit((d) => { const x = d.clips.find((y) => y.id === c.id); if (x) { x.text = e.target.value; x.name = e.target.value; } }, `cap-${c.id}`)} />
                <button className="icon-btn sm" title="Apagar frase" onClick={() => useEditor.getState().commit((d) => { d.clips = d.clips.filter((x) => x.id !== c.id); })}><Trash2 size={12} /></button>
              </div>
            ))}
          </>
        )}
        {tracks.length === 0 && <div className="empty-state" style={{ paddingTop: 16 }}>Ainda não há legendas. Gere-as automaticamente ou importe um ficheiro SRT.</div>}
      </div>
    </>
  );
}
