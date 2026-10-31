/**
 * Correção da pronúncia (exercício «Leia em voz alta»).
 * O reconhecimento de voz do navegador devolve uma ou mais transcrições do que o aluno disse.
 * Aqui compara-se palavra a palavra com a frase pedida: se o reconhecedor percebeu as palavras,
 * a pronúncia é compreensível. Não é uma avaliação fonética fina — é «percebe-se ou não».
 */
import { levenshtein, normalize, stripAccents, type Verdict } from './answers.ts';

export interface SpeechWord {
  word: string;
  heard: boolean;
}

export interface SpeechGrade {
  verdict: Verdict;
  /** Transcrição que mais se aproxima da frase pedida. */
  best: string;
  /** Palavras da frase pedida, marcadas como percebidas ou não. */
  words: SpeechWord[];
  /** Proporção de palavras percebidas (0–1). */
  ratio: number;
}

const tokens = (s: string) => stripAccents(normalize(s)).split(' ').filter(Boolean);

/** Duas palavras «batem» se forem iguais ou quase (uma letra de diferença em palavras longas). */
function sameWord(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.min(a.length, b.length) >= 5) return levenshtein(a, b, 1) <= 1;
  return false;
}

function matchWords(target: string[], heard: string[]): boolean[] {
  const pool = [...heard];
  return target.map((w) => {
    const i = pool.findIndex((h) => sameWord(w, h));
    if (i < 0) return false;
    pool.splice(i, 1);
    return true;
  });
}

export function gradeSpeech(target: string, alternatives: readonly string[]): SpeechGrade {
  const tWords = tokens(target);
  const display = target.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  let best = { alt: alternatives[0] ?? '', marks: tWords.map(() => false), ratio: 0 };
  for (const alt of alternatives) {
    const marks = matchWords(tWords, tokens(alt));
    const ratio = tWords.length ? marks.filter(Boolean).length / tWords.length : 0;
    if (ratio > best.ratio) best = { alt, marks, ratio };
  }
  const verdict: Verdict = best.ratio === 1 ? 'correct' : best.ratio >= 0.6 ? 'almost' : 'incorrect';
  return {
    verdict,
    best: best.alt,
    ratio: best.ratio,
    words: display.map((w, i) => ({ word: w, heard: best.marks[i] ?? false })),
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
