// Fotografias do telemóvel: reduz o tamanho antes de enviar (mais rápido, gasta menos dados e cabe
// no limite de 4 MB por anexo). A IA lê bem o texto com 2000 píxeis no lado maior.

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('imagem'));
    };
    img.src = url;
  });
}

/** Devolve um JPEG com no máximo `maxSide` píxeis no lado maior (ou o original se já for pequeno). */
export async function shrinkPhoto(file: File, maxSide = 2000, quality = 0.85): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    return file; // o navegador não consegue abrir: o servidor decide
  }
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const g = canvas.getContext('2d');
  if (!g) return file;
  g.fillStyle = '#fff'; // PNG com transparência → fundo branco
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
}
