/**
 * Correção da pronúncia (exercício «Leia em voz alta»).
 * O reconhecimento de voz do navegador devolve uma ou mais transcrições do que o aluno disse.
 * Aqui compara-se palavra a palavra (exatamente) com a frase pedida, usando só a transcrição mais
 * provável e a confiança do reconhecedor: se ele percebeu todas as palavras com nitidez, a pronúncia
 * é compreensível. Não é uma avaliação fonética fina (o navegador não dá essa informação).
 */
import { normalize, stripAccents, type Verdict } from './answers.ts';

export interface SpeechWord {
  word: string;
  heard: boolean;
}

/** Uma transcrição do reconhecedor de voz, com a confiança (0–1) quando o navegador a dá. */
export interface Heard {
  transcript: string;
  confidence?: number;
}

export interface SpeechGrade {
  verdict: Verdict;
  /** O que o reconhecedor achou mais provável (a primeira transcrição). */
  best: string;
  /** Palavras da frase pedida, marcadas como percebidas ou não. */
  words: SpeechWord[];
  /** Proporção de palavras percebidas exatamente (0–1). */
  ratio: number;
  /** Confiança do reconhecedor (0–1), ou null se o navegador não a der. */
  confidence: number | null;
  /** Pontuação mostrada ao aluno (0–100): palavras certas × nitidez. */
  score: number;
}

/** Confiança mínima para «Certo» (abaixo disso, mesmo com as palavras todas: «Quase, repita mais devagar»). */
export const MIN_CONFIDENCE = 0.7;

const tokens = (s: string) => stripAccents(normalize(s)).split(' ').filter(Boolean);

/**
 * Compara palavra a palavra, de forma EXATA (sem aceitar letras trocadas), pela ordem.
 * Única tolerância: o reconhecedor pode escrever uma palavra composta separada («goede morgen» = «goedemorgen»).
 */
function matchWords(target: string[], heard: string[]): boolean[] {
  let j = 0;
  return target.map((w) => {
    for (let k = j; k < heard.length; k++) {
      if (heard[k] === w) { j = k + 1; return true; }
      if (k + 1 < heard.length && heard[k]! + heard[k + 1]! === w) { j = k + 2; return true; }
    }
    return false;
  });
}

export function gradeSpeech(target: string, alternatives: readonly (string | Heard)[]): SpeechGrade {
  const tWords = tokens(target);
  const display = target.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  // Só conta o que o reconhecedor achou MAIS provável (as alternativas seguintes não salvam uma má pronúncia).
  const top = alternatives[0];
  const transcript = typeof top === 'string' ? top : top?.transcript ?? '';
  const rawConf = typeof top === 'string' ? undefined : top?.confidence;
  const confidence = typeof rawConf === 'number' && rawConf > 0 ? Math.min(1, rawConf) : null;
  const marks = matchWords(tWords, tokens(transcript));
  const ratio = tWords.length ? marks.filter(Boolean).length / tWords.length : 0;
  const clear = confidence === null || confidence >= MIN_CONFIDENCE;
  const verdict: Verdict = ratio === 1 && clear ? 'correct' : ratio >= 0.75 ? 'almost' : 'incorrect';
  const score = Math.round(100 * ratio * (confidence === null ? 1 : Math.min(1, confidence / 0.9)));
  return {
    verdict, best: transcript, ratio, confidence, score,
    words: display.map((w, i) => ({ word: w, heard: marks[i] ?? false })),
  };
}

/** Frases boas para ler em voz alta: curtas, sem números nem símbolos que o reconhecedor escreve de outra forma. */
export function isGoodSpeakingText(nl: string): boolean {
  const words = nl.trim().split(/\s+/);
  return words.length >= 1 && words.length <= 9 && !/[0-9€%@/…«»()[\]_]/.test(nl) && /\p{L}/u.test(nl);
}

interface SpeakingSourceLesson {
  id: string;
  newVocabulary: readonly { id: string; nl: string; pt: readonly string[]; article?: string; pos: string }[];
  examples: readonly { nl: string; pt: string }[];
}

const SPEAK_INSTRUCTION = 'Leia em voz alta.';
const SPEAK_EXPLANATION =
  'Dica: toque no altifalante para ouvir o modelo, depois repita devagar, articulando cada palavra. Se o reconhecimento de voz percebe as palavras, a sua pronúncia é compreensível.';

/**
 * Exercícios de leitura em voz alta criados a partir da própria lição:
 * uma palavra nova e uma frase de exemplo curta. Não ficam guardados no conteúdo.
 */
export function speakingExercisesFor(lesson: SpeakingSourceLesson): Extract<import('../domain/schemas.ts').Exercise, { type: 'speaking' }>[] {
  const out: Extract<import('../domain/schemas.ts').Exercise, { type: 'speaking' }>[] = [];
  const word = lesson.newVocabulary.find((v) => isGoodSpeakingText(v.nl) && v.nl.trim().split(/\s+/).length <= 3);
  if (word) {
    out.push({
      id: `${lesson.id}-e91`, type: 'speaking', instruction: SPEAK_INSTRUCTION, explanation: SPEAK_EXPLANATION,
      vocabRefs: [word.id], text: word.article ? `${word.article} ${word.nl}` : word.nl, translation: word.pt[0] ?? '',
    });
  }
  const sentence = [...lesson.examples]
    .filter((e) => isGoodSpeakingText(e.nl) && e.nl.trim().split(/\s+/).length >= 2)
    .sort((a, b) => a.nl.length - b.nl.length)[0];
  if (sentence) {
    out.push({
      id: `${lesson.id}-e92`, type: 'speaking', instruction: SPEAK_INSTRUCTION, explanation: SPEAK_EXPLANATION,
      vocabRefs: [], text: sentence.nl, translation: sentence.pt,
    });
  }
  return out.filter((e) => e.translation);
}

/** Intercala os exercícios de voz: um a meio da lição e outro perto do fim. */
export function withSpeaking<T>(exercises: readonly T[], speaking: readonly T[]): T[] {
  const out = [...exercises];
  if (speaking[0]) out.splice(Math.ceil(out.length / 2), 0, speaking[0]);
  if (speaking[1]) out.splice(Math.max(out.length - 1, 0), 0, speaking[1]);
  return out;
}
