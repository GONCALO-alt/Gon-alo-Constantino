/**
 * Efeitos sonoros sintetizados no navegador (Web Audio API).
 * Não há ficheiros de áudio nem serviços externos: os sons são gerados na hora.
 * O som de erro é suave e curto — informa, nunca castiga.
 */

export type SoundName =
  | 'correct' | 'correct2' | 'correct3' | 'almost' | 'incorrect'
  | 'streak3' | 'streak5' | 'streak10'
  | 'pairMatch' | 'pairMiss' | 'tap' | 'untap'
  | 'reveal' | 'lessonComplete' | 'lessonPerfect' | 'achievement';

/** Timbres: «bell» e «chime» somam harmónicos que decaem, como um sino ou uma campainha. */
type Timbre = 'sine' | 'triangle' | 'square' | 'bell' | 'chime' | 'pluck';

export interface Note {
  /** Frequência em Hz. */
  f: number;
  /** Início, em segundos, relativo ao momento em que o som é tocado. */
  at: number;
  /** Duração em segundos. */
  dur: number;
  timbre?: Timbre;
  /** Ganho máximo (0–1) antes do volume geral. */
  gain?: number;
  /** Deslize de frequência até este valor (Hz) durante a nota. */
  slideTo?: number;
}

// Notas (Hz)
const G3 = 196.0, A3 = 220.0, C4 = 261.63, Eb4 = 311.13, G4 = 392.0;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.0, B5 = 987.77;
const C6 = 1046.5, D6 = 1174.66, E6 = 1318.51, G6 = 1567.98, C7 = 2093.0;

const arp = (fs: number[], step: number, dur: number, timbre: Timbre = 'bell', gain = 0.8): Note[] =>
  fs.map((f, i) => ({ f, at: i * step, dur, timbre, gain }));

export const SOUNDS: Record<SoundName, Note[]> = {
  // Certo: três variantes alegres, alternadas para não cansar.
  correct: [
    { f: E5, at: 0, dur: 0.18, timbre: 'chime', gain: 0.8 },
    { f: B5, at: 0.09, dur: 0.38, timbre: 'chime', gain: 0.9 },
  ],
  correct2: [
    { f: G5, at: 0, dur: 0.16, timbre: 'chime', gain: 0.75 },
    { f: C6, at: 0.08, dur: 0.16, timbre: 'chime', gain: 0.8 },
    { f: E6, at: 0.16, dur: 0.38, timbre: 'chime', gain: 0.85 },
  ],
  correct3: [
    { f: C6, at: 0, dur: 0.14, timbre: 'bell', gain: 0.7 },
    { f: G6, at: 0.1, dur: 0.42, timbre: 'bell', gain: 0.85 },
  ],
  almost: [
    { f: D5, at: 0, dur: 0.16, timbre: 'chime', gain: 0.6 },
    { f: F5, at: 0.11, dur: 0.3, timbre: 'chime', gain: 0.55 },
  ],
  // Errado: um «tum-tum» grave e curto, a descer — percebe-se, mas não assusta.
  incorrect: [
    { f: Eb4, at: 0, dur: 0.17, timbre: 'pluck', gain: 0.75, slideTo: 300 },
    { f: A3, at: 0.15, dur: 0.32, timbre: 'pluck', gain: 0.7, slideTo: 200 },
  ],
  // Respostas certas seguidas.
  streak3: arp([C5, E5, G5, C6], 0.07, 0.3, 'chime', 0.75),
  streak5: [...arp([C5, E5, G5, C6, E6], 0.065, 0.3, 'chime', 0.75), { f: G6, at: 0.36, dur: 0.5, timbre: 'bell', gain: 0.6 }],
  streak10: [
    ...arp([C5, E5, G5, C6, E6, G6], 0.06, 0.3, 'chime', 0.75),
    { f: C6, at: 0.42, dur: 0.7, timbre: 'bell', gain: 0.6 },
    { f: E6, at: 0.42, dur: 0.7, timbre: 'bell', gain: 0.5 },
    { f: C7, at: 0.42, dur: 0.7, timbre: 'bell', gain: 0.35 },
  ],
  pairMatch: [
    { f: A5, at: 0, dur: 0.1, timbre: 'chime', gain: 0.55 },
    { f: E6, at: 0.05, dur: 0.18, timbre: 'chime', gain: 0.5 },
  ],
  pairMiss: [{ f: A3 * 2, at: 0, dur: 0.22, timbre: 'pluck', gain: 1, slideTo: 330 }],
  tap: [{ f: 1200, at: 0, dur: 0.05, timbre: 'pluck', gain: 0.35, slideTo: 900 }],
  untap: [{ f: 800, at: 0, dur: 0.05, timbre: 'pluck', gain: 0.3, slideTo: 600 }],
  reveal: [
    { f: G4, at: 0, dur: 0.2, timbre: 'bell', gain: 0.45 },
    { f: D5, at: 0.12, dur: 0.35, timbre: 'bell', gain: 0.4 },
  ],
  // Fim de lição: pequena fanfarra.
  lessonComplete: [
    ...arp([C5, E5, G5], 0.11, 0.22, 'chime', 0.75),
    { f: C6, at: 0.33, dur: 0.18, timbre: 'chime', gain: 0.8 },
    { f: G5, at: 0.5, dur: 0.16, timbre: 'chime', gain: 0.7 },
    { f: C6, at: 0.62, dur: 0.9, timbre: 'bell', gain: 0.8 },
    { f: E6, at: 0.62, dur: 0.9, timbre: 'bell', gain: 0.55 },
    { f: G4, at: 0.62, dur: 0.9, timbre: 'triangle', gain: 0.35 },
    { f: C4, at: 0.62, dur: 0.9, timbre: 'triangle', gain: 0.35 },
  ],
  // Lição sem erros: fanfarra mais longa, com brilho no fim.
  lessonPerfect: [
    ...arp([C5, E5, G5, C6], 0.1, 0.22, 'chime', 0.75),
    { f: B5, at: 0.42, dur: 0.14, timbre: 'chime', gain: 0.7 },
    { f: C6, at: 0.52, dur: 0.14, timbre: 'chime', gain: 0.75 },
    { f: D6, at: 0.62, dur: 0.14, timbre: 'chime', gain: 0.75 },
    { f: E6, at: 0.74, dur: 1.0, timbre: 'bell', gain: 0.85 },
    { f: G5, at: 0.74, dur: 1.0, timbre: 'bell', gain: 0.5 },
    { f: C5, at: 0.74, dur: 1.0, timbre: 'triangle', gain: 0.4 },
    { f: C4, at: 0.74, dur: 1.0, timbre: 'triangle', gain: 0.35 },
    ...arp([G6, C7, G6, C7], 0.08, 0.12, 'bell', 0.25).map((n) => ({ ...n, at: n.at + 1.0 })),
  ],
  achievement: [
    ...arp([G5, B5, D6, G6], 0.08, 0.25, 'bell', 0.7),
    { f: G6, at: 0.32, dur: 0.8, timbre: 'bell', gain: 0.6 },
    { f: B5, at: 0.32, dur: 0.8, timbre: 'bell', gain: 0.45 },
    { f: G3 * 2, at: 0.32, dur: 0.8, timbre: 'triangle', gain: 0.3 },
  ],
};

/** Variações de «certo», alternadas. */
const CORRECT_VARIANTS: SoundName[] = ['correct', 'correct2', 'correct3'];
let correctTurn = 0;

let enabled = true;
let volume = 0.8;
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

/** Parciais (múltiplo da frequência, ganho relativo, decaimento relativo) de cada timbre. */
const PARTIALS: Record<'bell' | 'chime' | 'pluck', [number, number, number][]> = {
  bell: [[1, 1, 1], [2, 0.45, 0.6], [3, 0.25, 0.4], [4.2, 0.12, 0.25]],
  chime: [[1, 1, 1], [2, 0.3, 0.5], [3, 0.12, 0.3]],
  pluck: [[1, 1, 1], [2, 0.35, 0.35]],
};

function playNote(ac: AudioContext, out: AudioNode, n: Note, t0: number): void {
  const start = t0 + n.at;
  const peak = n.gain ?? 1;
  const timbre = n.timbre ?? 'sine';
  const partials: [number, number, number][] =
    timbre === 'bell' || timbre === 'chime' || timbre === 'pluck' ? PARTIALS[timbre] : [[1, 1, 1]];
  const wave: OscillatorType = timbre === 'triangle' || timbre === 'square' ? timbre : timbre === 'pluck' ? 'triangle' : 'sine';
  for (const [mult, rel, decay] of partials) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(n.f * mult, start);
    if (n.slideTo) osc.frequency.exponentialRampToValueAtTime(n.slideTo * mult, start + n.dur);
    const end = start + Math.max(0.04, n.dur * decay);
    // Ataque rápido e decaimento exponencial (sem estalidos).
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * rel), start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(g).connect(out);
    osc.start(start);
    osc.stop(end + 0.05);
  }
}

export function playSound(name: SoundName): void {
  if (!enabled || volume <= 0) return;
  const ac = getContext();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + 0.01;
    // Compressor: vários sons sobrepostos não saturam nem ficam demasiado altos.
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.ratio.value = 6;
    const master = ac.createGain();
    master.gain.value = 0.45 * volume;
    master.connect(comp).connect(ac.destination);
    for (const n of SOUNDS[name]) playNote(ac, master, n, t0);
  } catch {
    // Sem áudio disponível: a aplicação continua a funcionar em silêncio.
  }
}

/** Som de resposta certa, com variações e sons especiais para sequências (3, 5, 10 seguidas). */
export function playCorrect(streak: number): void {
  if (streak === 10 || (streak > 10 && streak % 10 === 0)) return playSound('streak10');
  if (streak === 5) return playSound('streak5');
  if (streak === 3) return playSound('streak3');
  playSound(CORRECT_VARIANTS[correctTurn++ % CORRECT_VARIANTS.length]!);
}

/** Pequena vibração no telemóvel (se o dispositivo permitir). */
export function vibrate(pattern: number | number[]): void {
  if (!enabled) return;
  try { navigator.vibrate?.(pattern); } catch { /* sem vibração */ }
}

/** Fim de lição ou de revisão: fanfarra (mais longa se não houve erros) e som de conquista nova. */
export function celebrate(newAchievement: boolean, perfect = false): void {
  playSound(perfect ? 'lessonPerfect' : 'lessonComplete');
  vibrate([30, 60, 30]);
  if (newAchievement) setTimeout(() => playSound('achievement'), perfect ? 2000 : 1600);
}

/** Duração total de um som, em segundos (para testes e para evitar sobreposições). */
export function soundLength(name: SoundName): number {
  return Math.max(...SOUNDS[name].map((n) => n.at + n.dur));
}
