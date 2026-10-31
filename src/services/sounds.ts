/**
 * Efeitos sonoros curtos, sintetizados no navegador (Web Audio API).
 * Não há ficheiros de áudio nem serviços externos: os sons são gerados na hora.
 * Volume baixo e tons suaves — o som de erro é discreto, nunca um «castigo».
 */

export type SoundName =
  | 'correct' | 'almost' | 'incorrect'
  | 'pairMatch' | 'pairMiss' | 'tap'
  | 'reveal' | 'lessonComplete' | 'achievement';

interface Note {
  /** Frequência em Hz. */
  f: number;
  /** Início, em segundos, relativo ao momento em que o som é tocado. */
  at: number;
  /** Duração em segundos. */
  dur: number;
  type?: OscillatorType;
  /** Ganho máximo (0–1) antes do volume geral. */
  gain?: number;
}

// Notas (Hz)
const C4 = 261.63, E4 = 329.63, G4 = 392.0, A4 = 440.0;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880.0;
const C6 = 1046.5, E6 = 1318.51;

export const SOUNDS: Record<SoundName, Note[]> = {
  correct: [
    { f: E5, at: 0, dur: 0.12 },
    { f: A5, at: 0.09, dur: 0.22 },
  ],
  almost: [
    { f: D5, at: 0, dur: 0.12 },
    { f: E5, at: 0.1, dur: 0.18, gain: 0.7 },
  ],
  incorrect: [
    { f: E4, at: 0, dur: 0.16, type: 'triangle', gain: 0.6 },
    { f: C4, at: 0.13, dur: 0.24, type: 'triangle', gain: 0.5 },
  ],
  pairMatch: [{ f: G5, at: 0, dur: 0.09, gain: 0.6 }],
  pairMiss: [{ f: A4, at: 0, dur: 0.1, type: 'triangle', gain: 0.4 }],
  tap: [{ f: C6, at: 0, dur: 0.04, gain: 0.25 }],
  reveal: [{ f: G4, at: 0, dur: 0.18, type: 'triangle', gain: 0.45 }],
  lessonComplete: [
    { f: C5, at: 0, dur: 0.14 },
    { f: E5, at: 0.12, dur: 0.14 },
    { f: G5, at: 0.24, dur: 0.14 },
    { f: C6, at: 0.36, dur: 0.4 },
  ],
  achievement: [
    { f: G5, at: 0, dur: 0.12 },
    { f: C6, at: 0.1, dur: 0.12 },
    { f: E6, at: 0.2, dur: 0.35 },
  ],
};

let enabled = true;
let volume = 0.5;
let ctx: AudioContext | null = null;

/** Chamado pela aplicação sempre que as definições mudam. */
export function configureSounds(opts: { enabled: boolean; volume?: number }): void {
  enabled = opts.enabled;
  if (opts.volume !== undefined) volume = Math.min(1, Math.max(0, opts.volume));
}

export function soundsEnabled(): boolean {
  return enabled;
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try { ctx = new Ctor(); } catch { return null; }
  }
  // Os navegadores suspendem o áudio até haver interação; os sons tocam sempre depois de um toque.
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

export function playSound(name: SoundName): void {
  if (!enabled || volume <= 0) return;
  const ac = getContext();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + 0.01;
    const master = ac.createGain();
    master.gain.value = 0.18 * volume;
    master.connect(ac.destination);
    for (const n of SOUNDS[name]) {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = n.type ?? 'sine';
      osc.frequency.value = n.f;
      const start = t0 + n.at;
      const peak = n.gain ?? 1;
      // Envelope curto (ataque rápido, decaimento suave) para evitar estalidos.
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(peak, start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);
      osc.connect(g).connect(master);
      osc.start(start);
      osc.stop(start + n.dur + 0.05);
    }
  } catch {
    // Sem áudio disponível: a aplicação continua a funcionar em silêncio.
  }
}

/** Fim de lição ou de revisão: melodia curta e, se houver conquista nova, um segundo som. */
export function celebrate(newAchievement: boolean): void {
  playSound('lessonComplete');
  if (newAchievement) setTimeout(() => playSound('achievement'), 900);
}
