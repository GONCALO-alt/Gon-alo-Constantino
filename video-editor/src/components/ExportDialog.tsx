import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Cpu, FolderOpen, Play, XCircle, Zap } from 'lucide-react';
import type { ExportOptions, ExportProgress, HardwareInfo, VideoCodec } from '@shared/types';
import { RESOLUTIONS, exportSize } from '@shared/defaults';
import { toSrt } from '@shared/srt';
import { projectDuration, fmtTime } from '@shared/timeline';
import { useEditor } from '../store/editor';
import { usePlayback } from '../store/playback';
import { api, isWeb, mediaUrl } from '../api';
import { renderTextPng } from '../engine/text';
import { captionTracks, trackSegments } from '../captions/captions';
import { Modal, Seg, Slider, Toggle, fmtBytes } from './ui';

/** Bitrate recomendado (Mbps) por resolução e FPS — valores típicos de plataformas de vídeo. */
const recommended = (short: number, fps: number) => {
  const base: Record<number, number> = { 720: 8, 1080: 16, 1440: 30, 2160: 45 };
  return Math.round((base[short] ?? 16) * (fps > 30 ? 1.5 : 1));
};

const fmtEta = (s: number) => {
  if (!Number.isFinite(s) || s <= 0) return '—';
  const m = Math.floor(s / 60), r = Math.round(s % 60);
  return m ? `${m} min ${r} s` : `${r} s`;
};

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const project = useEditor((s) => s.project);
  const [hw, setHw] = useState<HardwareInfo | null>(null);
  const saved = JSON.parse(localStorage.getItem('exportPrefs') || '{}');
  const [res, setRes] = useState<number>(saved.res ?? 1080);
  const [fps, setFps] = useState<number>(saved.fps ?? project.settings.fps);
  const [codec, setCodec] = useState<VideoCodec>(saved.codec ?? 'h264');
  const [useHw, setUseHw] = useState<boolean>(saved.useHw ?? false);
  const [rateControl, setRateControl] = useState<'crf' | 'bitrate'>(saved.rateControl ?? 'bitrate');
  const [crf, setCrf] = useState<number>(saved.crf ?? 18);
  const [bitrate, setBitrate] = useState<number>(saved.bitrate ?? recommended(saved.res ?? 1080, saved.fps ?? project.settings.fps));
  const [preset, setPreset] = useState<ExportOptions['preset']>(saved.preset ?? 'medium');
  const [audioKbps, setAudioKbps] = useState<number>(saved.audioKbps ?? 320);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [hwDecode, setHwDecode] = useState<boolean>(saved.hwDecode ?? false);
  const [exportSrt, setExportSrt] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [preparing, setPreparing] = useState<string | null>(null);
  const srtRef = useRef<{ path: string; content: string } | null>(null);
  const dur = projectDuration(project);
  const size = exportSize(project.settings.width, project.settings.height, res);
  const hasCaptions = captionTracks(project).length > 0;

  useEffect(() => { api.detectHardware().then(setHw).catch(() => setHw({ encoders: [{ id: 'libx264', codec: 'h264', label: 'H.264', hardware: false }], ffmpegVersion: '?', ffmpegPath: '' })); }, []);
  useEffect(() => api.onExportProgress((p) => { if (!jobId || p.jobId === jobId) setProgress(p); }), [jobId]);
  useEffect(() => { usePlayback.getState().setPlaying(false); }, []);

  const encoders = hw?.encoders ?? [];
  const hevcAvailable = encoders.some((e) => e.codec === 'hevc');
  const hwEncoder = encoders.find((e) => e.codec === codec && e.hardware);
  const encoder = useHw && hwEncoder ? hwEncoder.id : codec === 'hevc' ? 'libx265' : 'libx264';
  const estSize = rateControl === 'bitrate' ? ((bitrate * 1e6 + (includeAudio ? audioKbps * 1000 : 0)) * dur) / 8 : 0;

  const start = async () => {
    const out = await api.saveExportDialog(`${project.name} ${Math.min(size.width, size.height) >= 2160 ? '4K' : `${Math.min(size.width, size.height)}p`}${fps}`);
    if (!out) return;
    localStorage.setItem('exportPrefs', JSON.stringify({ res, fps, codec, useHw, rateControl, crf, bitrate, preset, audioKbps, hwDecode }));
    // Renderiza cada texto diretamente à resolução final (nítido em 4K)
    setPreparing('A preparar textos e legendas…');
    const textImages: Record<string, { path: string; width: number; height: number }> = {};
    try {
      const texts = project.clips.filter((c) => c.type === 'text' && !project.tracks.find((t) => t.id === c.trackId)?.hidden);
      for (const c of texts) {
        const png = await renderTextPng(c.text ?? '', c.style!, Math.min(size.width, size.height));
        const path = await api.writeTemp(`text_${c.id}_${size.height}_${Date.now()}.png`, png.data);
        textImages[c.id] = { path, width: png.width, height: png.height };
      }
    } catch (e: any) { setPreparing(null); useEditor.getState().notify('Erro ao preparar textos: ' + e.message, 'error'); return; }
    setPreparing(null);
    const opts: ExportOptions = {
      outputPath: out, width: size.width, height: size.height, fps, codec, encoder, rateControl, crf, bitrateMbps: bitrate,
      preset, audioBitrateKbps: audioKbps, includeAudio, hwDecode,
    };
    setProgress({ jobId: '', progress: 0, frame: 0, fps: 0, speed: 0, elapsed: 0, eta: 0, stage: 'preparing' });
    const id = await api.startExport(project, opts, textImages);
    setJobId(id);
    srtRef.current = exportSrt && hasCaptions
      ? { path: out.replace(/\.mp4$/i, '') + '.srt', content: toSrt(trackSegments(project, captionTracks(project)[0].id)) }
      : null;
  };

  // grava o .srt ao lado do vídeo quando a exportação termina
  useEffect(() => {
    if (progress?.stage === 'done' && srtRef.current) {
      const { path, content } = srtRef.current;
      srtRef.current = null;
      api.writeText(path, content).then(() => useEditor.getState().notify('Legendas SRT gravadas: ' + path, 'success'));
    }
  }, [progress?.stage]);

  const running = progress && (progress.stage === 'rendering' || progress.stage === 'preparing' || progress.stage === 'finalizing');
  const res4kWarning = res === 2160 && fps >= 50 && !useHw;

  if (progress) {
    const p = progress;
    return (
      <Modal title={p.stage === 'done' ? 'Exportação concluída' : p.stage === 'error' ? 'Erro na exportação' : p.stage === 'cancelled' ? 'Exportação cancelada' : `A exportar ${size.width}×${size.height} · ${fps} FPS`}
        onClose={running ? undefined : onClose}
        footer={running ? <button className="btn danger" onClick={() => jobId && api.cancelExport(jobId)}><XCircle size={15} /> Cancelar</button>
          : <>
            {p.stage === 'done' && p.result && isWeb && <button className="btn" onClick={() => api.reveal(p.result!.path)}><FolderOpen size={15} /> Guardar MP4</button>}
            {p.stage === 'done' && p.result && !isWeb && <button className="btn" onClick={() => api.reveal(p.result!.path)}><FolderOpen size={15} /> Mostrar na pasta</button>}
            {p.stage === 'done' && p.result && !isWeb && <button className="btn" onClick={() => api.openPath(p.result!.path)}><Play size={15} /> Reproduzir</button>}
            <button className="btn primary" onClick={onClose}>Fechar</button>
          </>}>
        {running && (
          <>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <b style={{ fontSize: 22 }}>{Math.floor(p.progress * 100)}%</b>
              <span className="muted">{p.stage === 'finalizing' ? 'A finalizar o ficheiro…' : p.stage === 'preparing' ? 'A iniciar o FFmpeg…' : p.message}</span>
            </div>
            <div className="big-progress"><div style={{ width: `${p.progress * 100}%` }} /></div>
            <div className="stats">
              <div className="stat"><span>Tempo restante</span><b>{fmtEta(p.eta)}</b></div>
              <div className="stat"><span>Decorrido</span><b>{fmtEta(p.elapsed)}</b></div>
              <div className="stat"><span>Velocidade</span><b>{p.fps ? `${Math.round(p.fps)} fps` : '—'}</b></div>
              <div className="stat"><span>Tempo real</span><b>{p.speed ? `${p.speed.toFixed(2)}×` : '—'}</b></div>
            </div>
            <div className="hint" style={{ marginTop: 12 }}>Codificador: {encoder} · {rateControl === 'crf' ? `CRF ${crf}` : `${bitrate} Mbps`} · áudio AAC {audioKbps} kbps</div>
          </>
        )}
        {p.stage === 'done' && p.result && (
          <div>
            <div className="row" style={{ marginBottom: 14 }}><CheckCircle2 size={28} color="var(--green)" /><div><b>Vídeo exportado com sucesso</b><div className="small muted">{isWeb ? 'Toque em «Guardar MP4» para o guardar no seu dispositivo.' : p.result.path}</div></div></div>
            {isWeb && <video src={mediaUrl(p.result.path)} controls playsInline style={{ width: '100%', maxHeight: 320, background: '#000', borderRadius: 8, marginBottom: 10 }} />}
            <div className="hint" style={{ marginBottom: 6 }}>{isWeb ? 'Informação lida do ficheiro produzido pelo FFmpeg:' : 'Verificação do ficheiro produzido (lida com ffprobe):'}</div>
            <div className="stats">
              <div className="stat"><span>Resolução</span><b>{p.result.width}×{p.result.height}</b></div>
              <div className="stat"><span>FPS</span><b>{p.result.fps}</b></div>
              <div className="stat"><span>Codec</span><b>{p.result.codec.toUpperCase()}{p.result.audioCodec ? ` + ${p.result.audioCodec.toUpperCase()}` : ''}</b></div>
              <div className="stat"><span>Tamanho</span><b>{fmtBytes(p.result.size)}</b></div>
              <div className="stat"><span>Duração</span><b>{fmtTime(p.result.duration, fps)}</b></div>
              <div className="stat"><span>Bitrate</span><b>{(p.result.bitrate / 1e6).toFixed(1)} Mbps</b></div>
              <div className="stat"><span>Tempo de render</span><b>{fmtEta(p.elapsed)}</b></div>
            </div>
          </div>
        )}
        {p.stage === 'error' && <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--red)', fontSize: 12, userSelect: 'text' }}>{p.message}</pre>}
        {p.stage === 'cancelled' && <div className="hint">A exportação foi cancelada e o ficheiro parcial foi apagado.</div>}
      </Modal>
    );
  }

  return (
    <Modal title="Exportar vídeo" onClose={onClose} width={720}
      footer={<>
        <span className="muted small grow">{dur > 0 ? `Duração ${fmtTime(dur, fps)}${estSize ? ` · tamanho estimado ${fmtBytes(estSize)}` : ''}` : 'A timeline está vazia'}</span>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn primary lg" disabled={dur <= 0 || !!preparing || !hw} onClick={start}>{preparing ?? 'Exportar'}</button>
      </>}>
      <div className="field">
        <label>Resolução</label>
        <div className="opt-grid">
          {RESOLUTIONS.map((r) => {
            const s = exportSize(project.settings.width, project.settings.height, r.short);
            return (
              <div key={r.id} className={`opt ${res === r.short ? 'on' : ''}`} onClick={() => { setRes(r.short); setBitrate(recommended(r.short, fps)); }}>
                <b>{r.short === 2160 ? '4K UHD' : r.id}</b><span>{s.width} × {s.height}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="field">
        <label>Fotogramas por segundo</label>
        <div className="opt-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[24, 25, 30, 50, 60].map((f) => (
            <div key={f} className={`opt ${fps === f ? 'on' : ''}`} onClick={() => { setFps(f); setBitrate(recommended(res, f)); }}><b>{f}</b><span>FPS</span></div>
          ))}
        </div>
      </div>
      <div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
        <div className="field grow">
          <label>Formato / codec</label>
          <Seg value={codec} onChange={(v) => setCodec(v)} options={[
            { v: 'h264', label: 'MP4 · H.264' },
            ...(hevcAvailable ? [{ v: 'hevc' as VideoCodec, label: 'MP4 · H.265 / HEVC' }] : []),
          ]} />
          {!hevcAvailable && hw && <span className="small muted">H.265 indisponível neste FFmpeg</span>}
        </div>
        {!isWeb && <div className="field grow">
          <label><span><Cpu size={12} /> Aceleração por hardware</span></label>
          {hwEncoder ? <Toggle label={hwEncoder.label} value={useHw} onChange={setUseHw} /> : <span className="small muted">{hw ? 'Nenhum codificador de GPU disponível — será usado o software (máxima qualidade).' : 'A detetar…'}</span>}
          <Toggle label="Descodificação por hardware" value={hwDecode} onChange={setHwDecode} />
        </div>}
      </div>
      <div className="field">
        <label>Qualidade</label>
        <Seg value={rateControl} onChange={setRateControl} options={[{ v: 'bitrate', label: 'Bitrate' }, { v: 'crf', label: 'Qualidade constante (CRF)' }]} />
      </div>
      {rateControl === 'bitrate'
        ? <Slider label={`Bitrate de vídeo (recomendado ${recommended(res, fps)} Mbps)`} value={bitrate} min={2} max={200} unit=" Mbps" onChange={setBitrate} />
        : <Slider label="CRF (menor = melhor qualidade; 18 ≈ visualmente sem perdas)" value={crf} min={10} max={35} onChange={setCrf} />}
      <div className="row" style={{ gap: 16 }}>
        <div className="field grow">
          <label>Velocidade de codificação</label>
          <select className="input" value={preset} onChange={(e) => setPreset(e.target.value as any)} disabled={useHw && !!hwEncoder}>
            <option value="veryfast">Muito rápida</option><option value="fast">Rápida</option><option value="medium">Equilibrada</option><option value="slow">Lenta (melhor compressão)</option>
          </select>
        </div>
        <div className="field grow">
          <label>Áudio AAC</label>
          <select className="input" value={includeAudio ? audioKbps : 0} onChange={(e) => { const v = Number(e.target.value); setIncludeAudio(v > 0); if (v) setAudioKbps(v); }}>
            <option value={128}>128 kbps</option><option value={192}>192 kbps</option><option value={256}>256 kbps</option><option value={320}>320 kbps</option><option value={0}>Sem áudio</option>
          </select>
        </div>
      </div>
      {hasCaptions && <Toggle label="Exportar também as legendas em ficheiro .srt (as legendas já ficam incorporadas no vídeo)" value={exportSrt} onChange={setExportSrt} />}
      {isWeb && <div className="hint" style={{ color: 'var(--accent2)', marginBottom: 6 }}><Zap size={12} /> No navegador o FFmpeg corre num só núcleo do processador: 1080p demora alguns segundos por segundo de vídeo; 4K a 60 FPS pode demorar vários minutos. Para exportações longas em 4K use a app desktop.</div>}
      {!isWeb && res4kWarning && <div className="hint" style={{ color: 'var(--accent2)' }}><Zap size={12} /> 4K a 60 FPS em software é exigente: o render pode demorar várias vezes a duração do vídeo. Ative a aceleração por hardware se estiver disponível.</div>}
      {hw && <div className="small muted" style={{ marginTop: 8 }}>{hw.ffmpegVersion}</div>}
    </Modal>
  );
}
