import { useMemo, useState } from 'react';
import { Check, Copy, Download, QrCode, Share2 } from 'lucide-react';
import { qrMatrix, qrPath, qrPoster } from '../qr';
import { useApp } from '../state';
import { Button } from './ui';

/** Endereço público da app (a página inicial). */
export const appUrl = () => `${window.location.origin}/`;

/** QR Code para os colegas entrarem na STUDY AI, com copiar, partilhar e descarregar. */
export function ShareApp() {
  const { toast } = useApp();
  const url = appUrl();
  const matrix = useMemo(() => qrMatrix(url), [url]);
  const path = useMemo(() => qrPath(matrix), [matrix]);
  const [copied, setCopied] = useState(false);
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
        await navigator.share({ files: [file], title: 'STUDY AI' }).catch(() => {});
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
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
        <div className="qr-box">
          <svg viewBox={`-4 -4 ${n + 8} ${n + 8}`} role="img" aria-label={`QR Code com o endereço ${url}`} shapeRendering="crispEdges">
            <rect x={-4} y={-4} width={n + 8} height={n + 8} fill="#fff" />
            <path d={path} fill="#09090b" />
          </svg>
        </div>
        <div className="stack grow" style={{ minWidth: 220 }}>
          <p className="muted small">Os teus colegas apontam a câmara do telemóvel para este código e entram logo na app.</p>
          <div className="share-url" title={url}>{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
          <div className="row wrap" style={{ gap: 8 }}>
            <Button variant="secondary" size="sm" icon={copied ? <Check /> : <Copy />} onClick={copy}>{copied ? 'Copiado' : 'Copiar link'}</Button>
            {canShare && <Button variant="secondary" size="sm" icon={<Share2 />} onClick={share}>Partilhar</Button>}
            <Button variant="secondary" size="sm" icon={<Download />} onClick={download}>Imagem para imprimir</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
