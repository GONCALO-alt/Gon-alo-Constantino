import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Copy, Download, Maximize2, QrCode, Share2 } from 'lucide-react';
import { qrMatrix, qrPath, qrPoster } from '../qr';
import { useApp } from '../state';
import { Button, Modal } from './ui';

/** iPhone/iPad: as transferências abrem fora da app (no Safari) e falham; mostra-se a imagem na app. */
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Endereço público da app (a página inicial). */
export const appUrl = () => `${window.location.origin}/`;

/** QR Code para os colegas entrarem na STUDY AI, com copiar, partilhar e descarregar. */
export function ShareApp() {
  const { toast } = useApp();
  const url = appUrl();
  const matrix = useMemo(() => qrMatrix(url), [url]);
  const path = useMemo(() => qrPath(matrix), [matrix]);
  const [copied, setCopied] = useState(false);
  const [poster, setPoster] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  // «Menu → Mostrar QR Code» abre logo em ecrã inteiro.
  const [big, setBig] = useState(location.hash === '#qr');
  useEffect(() => {
    if (location.hash === '#qr') setBig(true);
  }, [location.hash]);
  const closeBig = () => {
    setBig(false);
    if (location.hash === '#qr') navigate(`${location.pathname}#partilhar`, { replace: true });
  };
  // Enquanto mostra o código: ecrã sempre ligado; «Esc» fecha.
  useEffect(() => {
    if (!big) return;
    let lock: { release(): Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<{ release(): Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeBig();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      void lock?.release().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [big]);
  const canShare = typeof navigator.share === 'function';

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast('Não consegui copiar. Mantém o dedo no endereço para o copiares.', 'error');
    }
  }

  async function share() {
    try {
      await navigator.share({ title: 'STUDY AI', text: 'Experimenta a STUDY AI, o assistente de estudos com IA:', url });
    } catch {
      /* cancelado */
    }
  }

  async function download() {
    try {
      const blob = await qrPoster(url);
      const file = new File([blob], 'study-ai-qr-code.png', { type: 'image/png' });
      // No telemóvel, partilhar a imagem deixa guardá-la nas Fotos ou enviá-la.
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'STUDY AI' });
          return;
        } catch (err) {
          if ((err as Error)?.name === 'AbortError') return; // a pessoa fechou a partilha
        }
      }
      // Mostra a imagem dentro da app (no iPhone dá para guardar nas Fotos com um toque longo).
      const reader = new FileReader();
      reader.onload = () => setPoster(String(reader.result));
      reader.readAsDataURL(blob);
    } catch {
      toast('Não consegui criar a imagem. Tira uma captura de ecrã ao QR Code.', 'error');
    }
  }

  const n = matrix.length;
  return (
    <section className="card pad-lg" id="partilhar">
      <div className="card-head">
        <span className="card-title"><QrCode /> Partilhar a STUDY AI</span>
      </div>
      <div className="share-app">
        <button type="button" className="qr-box" onClick={() => setBig(true)} title="Mostrar em ecrã inteiro">
          <svg viewBox={`-4 -4 ${n + 8} ${n + 8}`} role="img" aria-label={`QR Code com o endereço ${url}`} shapeRendering="crispEdges">
            <rect x={-4} y={-4} width={n + 8} height={n + 8} fill="#fff" />
            <path d={path} fill="#09090b" />
          </svg>
        </button>
        <div className="stack grow" style={{ minWidth: 220 }}>
          <p className="muted small">Os teus colegas apontam a câmara do telemóvel para este código e entram logo na app.</p>
          <div className="share-url" title={url}>{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
          <Button icon={<Maximize2 />} onClick={() => setBig(true)}>Mostrar em ecrã inteiro</Button>
          <div className="row wrap" style={{ gap: 8 }}>
            <Button variant="secondary" size="sm" icon={copied ? <Check /> : <Copy />} onClick={copy}>{copied ? 'Copiado' : 'Copiar link'}</Button>
            {canShare && <Button variant="secondary" size="sm" icon={<Share2 />} onClick={share}>Partilhar</Button>}
            <Button variant="secondary" size="sm" icon={<Download />} onClick={download}>Imagem para imprimir</Button>
          </div>
        </div>
      </div>
      {big && (
        <div className="qr-full" role="dialog" aria-modal="true" aria-label="QR Code da STUDY AI em ecrã inteiro" onClick={closeBig}>
          <div className="qr-full-brand"><span>STUDY</span> AI</div>
          <svg viewBox={`-4 -4 ${n + 8} ${n + 8}`} role="img" aria-label={`QR Code grande com o endereço ${url}`} shapeRendering="crispEdges">
            <rect x={-4} y={-4} width={n + 8} height={n + 8} fill="#fff" />
            <path d={path} fill="#09090b" />
          </svg>
          <div className="qr-full-text">Aponta a câmara do telemóvel<br />e toca no link para entrar</div>
          <div className="qr-full-url">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
          <button type="button" className="btn btn-secondary" onClick={closeBig}>Fechar</button>
        </div>
      )}
      <Modal
        open={!!poster}
        onClose={() => setPoster(null)}
        title="Imagem para imprimir"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPoster(null)}>Fechar</Button>
            {poster && !isIOS() && (
              <a className="btn btn-primary" href={poster} download="study-ai-qr-code.png"><Download /> Descarregar</a>
            )}
          </>
        }
      >
        <div className="stack">
          {poster && <img src={poster} alt="Cartaz com o QR Code da STUDY AI" className="qr-poster" />}
          <p className="small muted center">
            {isIOS() ? 'Mantém o dedo na imagem e escolhe «Guardar nas Fotos» (ou «Partilhar»).' : 'Descarrega a imagem para a imprimir ou enviar.'}
          </p>
        </div>
      </Modal>
    </section>
  );
}
