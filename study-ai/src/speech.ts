// Ler as respostas em voz alta com a voz do próprio dispositivo (português de Portugal).
// Funciona sem servidor e sem custos. As respostas vêm em Markdown com fórmulas (LaTeX):
// primeiro passam a texto que se possa ler em voz alta.

/** Fórmulas LaTeX simples → palavras. */
function mathToWords(tex: string): string {
  let t = tex;
  // Frações e raízes (repetido para apanhar as encaixadas).
  for (let i = 0; i < 4; i++) {
    t = t.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, ' $1 sobre $2 ');
    t = t.replace(/\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}/g, ' raiz de índice $1 de $2 ');
    t = t.replace(/\\sqrt\s*\{([^{}]*)\}/g, ' raiz quadrada de $1 ');
  }
  const words: [RegExp, string][] = [
    [/\^\s*\{?2\}?/g, ' ao quadrado '],
    [/\^\s*\{?3\}?/g, ' ao cubo '],
    [/\^\s*\{([^{}]*)\}/g, ' elevado a $1 '],
    [/\^\s*(\S)/g, ' elevado a $1 '],
    [/_\s*\{([^{}]*)\}/g, ' índice $1 '],
    [/\\times|\\cdot/g, ' vezes '],
    [/\\div/g, ' a dividir por '],
    [/\\pm/g, ' mais ou menos '],
    [/\\neq|\\ne\b/g, ' diferente de '],
    [/\\leq|\\le\b/g, ' menor ou igual a '],
    [/\\geq|\\ge\b/g, ' maior ou igual a '],
    [/\\approx/g, ' aproximadamente '],
    [/\\infty/g, ' infinito '],
    [/\\pi/g, ' pi '],
    [/\\alpha/g, ' alfa '],
    [/\\beta/g, ' beta '],
    [/\\Delta|\\delta/g, ' delta '],
    [/\\degree|\^\s*\\circ/g, ' graus '],
    [/\\%/g, ' por cento '],
    [/\\(quad|qquad|,|;|!|left|right|text|mathrm|mathbf|displaystyle)/g, ' '],
    [/</g, ' menor que '],
    [/>/g, ' maior que '],
    [/=/g, ' igual a '],
    [/\+/g, ' mais '],
    [/(\s)-(\s|\d)/g, '$1menos $2'],
  ];
  for (const [re, w] of words) t = t.replace(re, w);
  return t.replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}]/g, ' ');
}

/** Markdown (com fórmulas) → texto para ler em voz alta. */
export function speechText(md: string): string {
  let t = md.replace(/\r/g, '');
  t = t.replace(/```[\s\S]*?```/g, ' (exemplo de código) ');
  t = t.replace(/\$\$([\s\S]+?)\$\$/g, (_m, m: string) => ` ${mathToWords(m)}. `);
  t = t.replace(/\\\[([\s\S]+?)\\\]/g, (_m, m: string) => ` ${mathToWords(m)}. `);
  t = t.replace(/\$([^$\n]+?)\$/g, (_m, m: string) => ` ${mathToWords(m)} `);
  t = t.replace(/\\\((.+?)\\\)/g, (_m, m: string) => ` ${mathToWords(m)} `);
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  t = t.replace(/`([^`]+)`/g, '$1');
  t = t
    .split('\n')
    .map((line) => {
      let l = line.trim();
      if (/^\|?\s*:?-{2,}/.test(l)) return ''; // linha separadora das tabelas
      if (l.startsWith('|')) l = `${l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()).filter(Boolean).join(', ')}.`;
      l = l.replace(/^#{1,6}\s+(.*)$/, '$1.');
      l = l.replace(/^>\s?/, '');
      l = l.replace(/^[-*+]\s+/, '');
      l = l.replace(/^(-{3,}|\*{3,}|_{3,})$/, '');
      return l;
    })
    .filter(Boolean)
    .join('\n');
  t = t.replace(/(\*\*|__|\*|_|~~)/g, '');
  t = t.replace(/[ \t]+/g, ' ').replace(/ ([.,;:!?])/g, '$1').replace(/\.\s*\./g, '.');
  return t.trim();
}

/** Divide em frases curtas (alguns navegadores param a meio de textos longos). */
export function speechChunks(text: string, max = 220): string[] {
  const sentences = text.split(/(?<=[.!?:;])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  const chunks: string[] = [];
  for (const s of sentences) {
    if (s.length <= max) {
      chunks.push(s);
      continue;
    }
    let rest = s;
    while (rest.length > max) {
      const cut = rest.lastIndexOf(' ', max);
      chunks.push(rest.slice(0, cut > 40 ? cut : max));
      rest = rest.slice(cut > 40 ? cut + 1 : max);
    }
    if (rest) chunks.push(rest);
  }
  return chunks;
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

function portugueseVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase() === 'pt-pt') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('pt-pt')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('pt')) ??
    null
  );
}

let session = 0;

/** O iPhone só deixa falar depois de um toque: chamar dentro de um clique «destrava» a voz. */
export function unlockSpeech() {
  if (!canSpeak()) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  session++;
  if (canSpeak()) window.speechSynthesis.cancel();
}

/** Lê o texto (Markdown) em voz alta. `onEnd` é chamado no fim (não quando é interrompido). */
export function speak(markdown: string, opts: { onEnd?: () => void; rate?: number } = {}) {
  if (!canSpeak()) return;
  stopSpeaking();
  const id = ++session;
  const chunks = speechChunks(speechText(markdown));
  const voice = portugueseVoice();
  let i = 0;
  const next = () => {
    if (id !== session) return;
    if (i >= chunks.length) {
      opts.onEnd?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(chunks[i++]!);
    u.lang = voice?.lang ?? 'pt-PT';
    if (voice) u.voice = voice;
    u.rate = opts.rate ?? 1;
    u.onend = next;
    u.onerror = (e) => {
      if (id === session && e.error !== 'interrupted' && e.error !== 'canceled') next();
    };
    window.speechSynthesis.speak(u);
  };
  next();
}
