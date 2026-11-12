// QR Code do endereço da app (gerado no próprio dispositivo, sem serviços externos).
import qrcode from 'qrcode-generator';

/** Matriz do QR Code (true = quadrado escuro). Correção de erros «M»: lê-se bem mesmo impresso. */
export function qrMatrix(text: string): boolean[][] {
  const qr = qrcode(0, 'M');
  qr.addData(text, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

/** Caminho SVG com um quadrado por módulo escuro (unidade = 1 módulo). */
export function qrPath(m: boolean[][]): string {
  let d = '';
  m.forEach((row, r) => row.forEach((dark, c) => dark && (d += `M${c} ${r}h1v1h-1z`)));
  return d;
}

/** Imagem PNG para imprimir ou partilhar: título, QR Code e endereço. */
export async function qrPoster(url: string): Promise<Blob> {
  const m = qrMatrix(url);
  const n = m.length;
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, W, H);
  // Cabeçalho preto e amarelo (as cores da app).
  g.fillStyle = '#09090b';
  g.fillRect(0, 0, W, 250);
  g.fillStyle = '#ffd400';
  g.font = '800 92px system-ui, -apple-system, sans-serif';
  g.textAlign = 'center';
  g.fillText('STUDY AI', W / 2, 140);
  g.fillStyle = '#e4e4e7';
  g.font = '500 38px system-ui, -apple-system, sans-serif';
  g.fillText('O teu assistente de estudos com IA', W / 2, 205);
  // QR Code com margem branca (necessária para ler).
  const size = 760;
  const cell = Math.floor(size / (n + 8));
  const qrSize = cell * n;
  const x0 = Math.round((W - qrSize) / 2);
  const y0 = 300 + Math.round((size - qrSize) / 2);
  g.fillStyle = '#09090b';
  m.forEach((row, r) => row.forEach((dark, c) => dark && g.fillRect(x0 + c * cell, y0 + r * cell, cell, cell)));
  g.fillStyle = '#09090b';
  g.font = '700 46px system-ui, -apple-system, sans-serif';
  g.fillText('Aponta a câmara para entrar', W / 2, 1150);
  g.fillStyle = '#52525b';
  g.font = '500 32px system-ui, -apple-system, sans-serif';
  g.fillText(url.replace(/^https?:\/\//, '').replace(/\/$/, ''), W / 2, 1215);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('imagem'))), 'image/png'));
}
