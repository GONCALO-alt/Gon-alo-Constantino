/**
 * Pronúncia através da síntese de voz do sistema (Web Speech API).
 * É gratuita e funciona sem servidor, MAS depende do dispositivo: nem todos
 * têm uma voz neerlandesa instalada. Por isso a aplicação verifica sempre a
 * disponibilidade e oferece alternativas (ver exercício de compreensão auditiva).
 * Ficheiros de áudio gravados (campo `audio`) têm prioridade quando existem.
 */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

function findDutchVoice(): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  const voices = s.getVoices();
  return voices.find((v) => v.lang === 'nl-NL') ?? voices.find((v) => v.lang.toLowerCase().startsWith('nl')) ?? null;
}

/** As vozes carregam de forma assíncrona em alguns navegadores. */
export function loadVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice | null> {
  const s = synth();
  if (!s) return Promise.resolve(null);
  const v = findDutchVoice();
  if (v) {
    cachedVoice = v;
    return Promise.resolve(v);
  }
  return new Promise((resolve) => {
    const done = () => {
      cachedVoice = findDutchVoice();
      resolve(cachedVoice);
    };
    s.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, timeoutMs);
  });
}

export function hasDutchVoice(): boolean {
  if (cachedVoice === undefined) cachedVoice = findDutchVoice();
  return !!cachedVoice;
}

export function canSpeak(): boolean {
  return !!synth();
}

export function speak(text: string, rate = 0.9, audioUrl?: string): Promise<void> {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    return audio.play().then(() => new Promise<void>((r) => audio.addEventListener('ended', () => r(), { once: true })));
  }
  const s = synth();
  if (!s) return Promise.resolve();
  s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'nl-NL';
  u.rate = rate;
  const v = cachedVoice ?? findDutchVoice();
  if (v) u.voice = v;
  return new Promise((resolve) => {
    u.onend = () => resolve();
    u.onerror = () => resolve();
    s.speak(u);
  });
}

/** Interrompe a leitura em curso (ex.: ao passar para o exercício seguinte). */
export function stopSpeaking(): void {
  synth()?.cancel();
}
