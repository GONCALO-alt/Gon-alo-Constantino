import jsQR from 'jsqr';
import { describe, expect, it } from 'vitest';
import { qrMatrix, qrPath } from '../src/qr.ts';

/** Desenha a matriz em píxeis (como um ecrã ou papel) e lê-a com um leitor de QR Codes. */
function scan(m: boolean[][]): string | null {
  const scale = 6;
  const quiet = 4;
  const size = (m.length + quiet * 2) * scale;
  const px = new Uint8ClampedArray(size * size * 4).fill(255);
  m.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (!dark) return;
      for (let y = 0; y < scale; y++)
        for (let x = 0; x < scale; x++) {
          const i = (((r + quiet) * scale + y) * size + (c + quiet) * scale + x) * 4;
          px[i] = px[i + 1] = px[i + 2] = 0;
        }
    }),
  );
  return jsQR(px, size, size)?.data ?? null;
}

describe('QR Code da app', () => {
  it('lê-se e abre o endereço do site', () => {
    for (const url of ['https://yellow-recipe-9be5.exemplo.workers.dev/', 'https://study-ai.netlify.app/', 'http://localhost:8787/']) {
      expect(scan(qrMatrix(url))).toBe(url);
    }
  });

  it('desenha um quadrado por módulo escuro', () => {
    const m = qrMatrix('https://exemplo.pt/');
    const dark = m.flat().filter(Boolean).length;
    expect(qrPath(m).match(/M/g)).toHaveLength(dark);
  });
});
