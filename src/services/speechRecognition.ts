/**
 * Reconhecimento de voz através do navegador (Web Speech API).
 * Gratuito, sem chaves de API e sem servidor próprio. Atenção: em alguns navegadores
 * (por ex. Chrome) o áudio é processado pelos servidores do fabricante do navegador.
 * Não existe em todos os navegadores (por ex. Firefox): a aplicação verifica sempre.
 */
import { prepareForMicrophone, restoreAudioAfterMicrophone } from './sounds.ts';

interface RecognitionAlternative { transcript: string }
interface RecognitionResultEvent { results: ArrayLike<ArrayLike<RecognitionAlternative>> }
interface RecognitionErrorEvent { error: string }
export interface SpeechRecognitionLike {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => SpeechRecognitionLike;

function ctor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canRecognizeSpeech(): boolean {
  return !!ctor();
}

export type RecognitionErrorKind = 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | 'other';

export class RecognitionError extends Error {
  kind: RecognitionErrorKind;
  constructor(kind: RecognitionErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

export interface RecognitionHandle {
  /** Resolve com as transcrições (a mais provável primeiro). */
  result: Promise<string[]>;
  /** Pára de ouvir e devolve o que já tiver sido reconhecido. */
  stop(): void;
}

/** Ouve uma frase em neerlandês e devolve as transcrições possíveis. */
export function listenOnce(lang = 'nl-NL', timeoutMs = 10_000): RecognitionHandle {
  const C = ctor();
  if (!C) return { result: Promise.reject(new RecognitionError('unsupported')), stop() {} };
  const rec = new C();
  rec.lang = lang;
  rec.maxAlternatives = 5;
  rec.interimResults = false;
  rec.continuous = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let restored = false;
  const restore = () => { if (!restored) { restored = true; restoreAudioAfterMicrophone(); } };
  const result = new Promise<string[]>((resolve, reject) => {
    let got: string[] = [];
    rec.onresult = (e) => {
      const first = e.results[0];
      if (!first) return;
      got = Array.from({ length: first.length }, (_, i) => first[i]?.transcript ?? '').filter(Boolean);
    };
    rec.onerror = (e) => {
      clearTimeout(timer);
      restore();
      const kind: RecognitionErrorKind =
        e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'not-allowed'
        : e.error === 'no-speech' ? 'no-speech'
        : e.error === 'network' ? 'network' : 'other';
      reject(new RecognitionError(kind));
    };
    rec.onend = () => {
      clearTimeout(timer);
      restore();
      if (got.length) resolve(got);
      else reject(new RecognitionError('no-speech'));
    };
  });
  try {
    prepareForMicrophone();
    rec.start();
    timer = setTimeout(() => rec.stop(), timeoutMs);
  } catch {
    restore();
    return { result: Promise.reject(new RecognitionError('other')), stop() {} };
  }
  return { result, stop: () => rec.stop() };
}

export const RECOGNITION_ERROR_TEXT: Record<RecognitionErrorKind, string> = {
  'not-allowed': 'O microfone não está autorizado. Permita o acesso ao microfone nas definições do navegador.',
  'no-speech': 'Não ouvi nada. Toque no microfone e fale perto do telemóvel.',
  network: 'O reconhecimento de voz precisa de internet neste navegador.',
  unsupported: 'Este navegador não tem reconhecimento de voz (experimente o Chrome ou o Safari).',
  other: 'O reconhecimento de voz falhou. Tente outra vez.',
};
