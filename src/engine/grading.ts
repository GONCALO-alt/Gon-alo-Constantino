/**
 * Correção de cada tipo de exercício. Função pura: (exercício, resposta) → resultado.
 * A interface só recolhe a resposta; toda a lógica de correção vive aqui e é testada.
 */
import type { Exercise } from '../domain/schemas.ts';
import { gradeText, joinTokens, normalize, wordCount, type GradeOptions, type Verdict } from './answers.ts';

export type ExerciseResponse =
  | { kind: 'text'; value: string }
  | { kind: 'option'; id: string }
  | { kind: 'options'; ids: string[] }
  | { kind: 'index'; index: number }
  | { kind: 'match'; mistakes: number }
  /** Escrita livre: o aluno autoavalia quando a resposta difere dos modelos. */
  | { kind: 'self'; text: string; ok: boolean };

export interface ExerciseResult {
  verdict: Verdict;
  /** Resposta correta a mostrar (ou resposta-modelo). */
  expected: string;
  note?: string;
  /** Feedback específico da opção escolhida. */
  optionFeedback?: string;
  /** Texto da resposta do aluno (para o histórico). */
  given: string;
}

function correctOptionText(options: readonly { text: string; correct: boolean }[]): string {
  return options.filter((o) => o.correct).map((o) => o.text).join(' / ');
}

function gradeOption(
  options: readonly { id: string; text: string; correct: boolean; feedback?: string }[],
  r: ExerciseResponse,
): ExerciseResult {
  const id = r.kind === 'option' ? r.id : '';
  const chosen = options.find((o) => o.id === id);
  return {
    verdict: chosen?.correct ? 'correct' : 'incorrect',
    expected: correctOptionText(options),
    optionFeedback: chosen?.feedback,
    given: chosen?.text ?? '',
  };
}

export function gradeExercise(ex: Exercise, r: ExerciseResponse, opts: GradeOptions = {}): ExerciseResult {
  const text = r.kind === 'text' ? r.value : '';
  switch (ex.type) {
    case 'translate':
    case 'listening': {
      const g = gradeText(text, ex.answers, opts);
      return { verdict: g.verdict, expected: g.bestMatch, note: g.note, given: text };
    }
    case 'fillBlank': {
      // Aceita tanto a palavra em falta como a frase completa.
      const full = ex.answers.map((a) => ex.sentence.replace('___', a));
      const g = gradeText(text, ex.answers, opts);
      if (g.verdict !== 'incorrect') return { verdict: g.verdict, expected: g.bestMatch, note: g.note, given: text };
      const g2 = gradeText(text, full, opts);
      return { verdict: g2.verdict, expected: g.bestMatch, note: g2.note, given: text };
    }
    case 'conjugation': {
      // Formas verbais: sem tolerância a gralhas (uma letra muda a forma).
      const g = gradeText(text, ex.answers, { ...opts, allowTypos: false });
      return { verdict: g.verdict, expected: g.bestMatch, note: g.note, given: text };
    }
    case 'buildSentence': {
      // Com banco de palavras, não há gralhas possíveis: comparação normalizada.
      const g = gradeText(text, ex.answers, { lenientAccents: false, allowTypos: false });
      return { verdict: g.verdict, expected: g.bestMatch, given: text };
    }
    case 'wordOrder': {
      const accepted = [joinTokens(ex.tokens), ...ex.alternatives];
      const g = gradeText(text, accepted, { lenientAccents: false, allowTypos: false });
      return { verdict: g.verdict, expected: g.bestMatch, given: text };
    }
    case 'multipleChoice':
    case 'dialogue':
    case 'expression':
      return gradeOption(ex.options, r);
    case 'articleChoice': {
      const given = r.kind === 'option' ? r.id : '';
      return {
        verdict: given === ex.article ? 'correct' : 'incorrect',
        expected: `${ex.article} ${ex.noun}`,
        given,
      };
    }
    case 'findError': {
      const idx = r.kind === 'index' ? r.index : -1;
      return {
        verdict: idx === ex.errorIndex ? 'correct' : 'incorrect',
        expected: `«${ex.tokens[ex.errorIndex]}» → «${ex.correction}»`,
        given: idx >= 0 ? (ex.tokens[idx] ?? '') : '',
      };
    }
    case 'match': {
      const mistakes = r.kind === 'match' ? r.mistakes : ex.pairs.length;
      return {
        verdict: mistakes === 0 ? 'correct' : mistakes <= 1 ? 'almost' : 'incorrect',
        expected: ex.pairs.map((p) => `${p.nl} = ${p.pt}`).join(' · '),
        note: mistakes > 0 ? `${mistakes} ${mistakes === 1 ? 'tentativa errada' : 'tentativas erradas'}.` : undefined,
        given: `${mistakes} erros`,
      };
    }
    case 'comprehension': {
      const ids = r.kind === 'options' ? r.ids : [];
      const wrong = ex.questions.filter((q, i) => !q.options.find((o) => o.id === ids[i])?.correct);
      return {
        verdict: wrong.length === 0 ? 'correct' : 'incorrect',
        expected: ex.questions.map((q) => correctOptionText(q.options)).join(' · '),
        note: wrong.length ? `${ex.questions.length - wrong.length} de ${ex.questions.length} respostas certas.` : undefined,
        given: ids.join(','),
      };
    }
    case 'shortWriting': {
      const value = r.kind === 'self' || r.kind === 'text' ? (r.kind === 'self' ? r.text : r.value) : '';
      const g = gradeText(value, ex.referenceAnswers, opts);
      if (g.verdict !== 'incorrect') return { verdict: g.verdict, expected: g.bestMatch, note: g.note, given: value };
      if (wordCount(value) < ex.minWords) {
        return { verdict: 'incorrect', expected: g.bestMatch, note: `Escreva pelo menos ${ex.minWords} palavras.`, given: value };
      }
      // Diferente do modelo não significa errado: é o aluno que confirma (autoavaliação).
      if (r.kind === 'self') {
        return {
          verdict: r.ok ? 'correct' : 'incorrect',
          expected: g.bestMatch,
          note: r.ok ? 'Autoavaliada como correta.' : 'Compare com a resposta-modelo.',
          given: value,
        };
      }
      return { verdict: 'incorrect', expected: g.bestMatch, given: value };
    }
  }
}

/** True se o exercício de escrita livre precisa de autoavaliação para esta resposta. */
export function needsSelfAssessment(ex: Exercise, value: string, opts: GradeOptions = {}): boolean {
  if (ex.type !== 'shortWriting') return false;
  if (wordCount(value) < ex.minWords) return false;
  return gradeText(value, ex.referenceAnswers, opts).verdict === 'incorrect';
}

/** Normalização exposta para a UI (ex.: comparar escolhas). */
export { normalize };
