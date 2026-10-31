/**
 * Que frase em neerlandês deve ser lida em voz alta depois de o aluno responder?
 * Função pura: devolve o texto neerlandês correto do exercício, ou null quando
 * a resposta não é neerlandês (ex.: tradução para português) ou já foi ouvida.
 */
import type { Exercise } from '../domain/schemas.ts';
import { expectedAnswer } from './grading.ts';
import { expandAnswerPattern, joinTokens } from './answers.ts';

/** Perguntas de escolha múltipla cujas opções são frases neerlandesas. */
const DUTCH_OPTION_PROMPTS = /ordem correta|frase correta|frase mais natural|soa mais formal|mais educad/i;

const firstVariant = (s: string) => expandAnswerPattern(s)[0] ?? s;

const correctOption = (options: readonly { text: string; correct: boolean }[]) =>
  options.find((o) => o.correct)?.text ?? null;

function fillBlank(sentence: string, answer: string): string {
  const filled = sentence.replace('___', answer);
  // Se a resposta abre a frase, a primeira letra fica maiúscula.
  return sentence.startsWith('___') ? filled.charAt(0).toUpperCase() + filled.slice(1) : filled;
}

/** Frase corrigida de um exercício «encontrar o erro». */
export function correctedSentence(tokens: readonly string[], index: number, correction: string): string | null {
  if (correction.includes('…') || correction.includes('/')) return null;
  const out = [...tokens];
  if (/^\(.*\)$/.test(correction.trim())) {
    // «(retirar)»: a palavra sai da frase; a pontuação final passa para a palavra anterior.
    const punct = /[.!?,;:]+$/.exec(out[index] ?? '')?.[0] ?? '';
    out.splice(index, 1);
    if (punct && index > 0) out[index - 1] = out[index - 1]!.replace(/[.!?,;:]*$/, punct);
    return joinTokens(out);
  }
  const original = out[index] ?? '';
  const punct = /[.!?,;:]+$/.exec(original)?.[0] ?? '';
  const hasPunct = /[.!?,;:]$/.test(correction);
  out[index] = hasPunct || !punct ? correction : correction + punct;
  return joinTokens(out);
}

export function dutchAnswerText(ex: Exercise): string | null {
  switch (ex.type) {
    case 'translate':
      return ex.direction === 'pt-nl' ? firstVariant(expectedAnswer(ex)) : firstVariant(ex.prompt);
    case 'fillBlank':
      return fillBlank(ex.sentence, firstVariant(ex.answers[0]!));
    case 'conjugation':
      return ex.sentence ? fillBlank(ex.sentence, firstVariant(ex.answers[0]!)) : firstVariant(ex.answers[0]!);
    case 'buildSentence':
    case 'wordOrder':
      return expectedAnswer(ex);
    case 'findError':
      return correctedSentence(ex.tokens, ex.errorIndex, ex.correction);
    case 'articleChoice':
      return `${ex.article} ${ex.noun}`;
    case 'dialogue':
      return correctOption(ex.options);
    case 'expression':
      return ex.expression;
    case 'multipleChoice':
      return DUTCH_OPTION_PROMPTS.test(ex.prompt) ? correctOption(ex.options) : null;
    default:
      // listening (já ouvido), match, comprehension, shortWriting: nada a ler.
      return null;
  }
}
