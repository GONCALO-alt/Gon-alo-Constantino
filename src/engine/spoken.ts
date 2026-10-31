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
    case 'speaking':
      return ex.text;
    case 'multipleChoice': {
      if (DUTCH_OPTION_PROMPTS.test(ex.prompt) || /em neerlandês\?$/i.test(ex.prompt)) return correctOption(ex.options);
      // «O que significa «de koffie»?»: lê a palavra neerlandesa do enunciado.
      const quoted = /^O que significa:? «([^»]+)»\??$/.exec(ex.prompt.trim());
      return quoted ? quoted[1]! : null;
    }
    default:
      // listening (já ouvido), match, comprehension, shortWriting: nada a ler.
      return null;
  }
}

/**
 * Significado (em português) da resposta certa, para mostrar quando o aluno erra.
 * null quando a resposta certa já está em português ou não há tradução disponível.
 */
export function answerMeaning(ex: Exercise): string | null {
  switch (ex.type) {
    case 'translate':
      return ex.direction === 'pt-nl' ? ex.prompt : null;
    case 'fillBlank':
      return ex.translation ?? null;
    case 'wordOrder':
    case 'listening':
      return ex.translation;
    case 'buildSentence':
      return ex.prompt;
    case 'articleChoice':
      return ex.pt;
    case 'speaking':
      return ex.translation;
    default:
      return null;
  }
}
