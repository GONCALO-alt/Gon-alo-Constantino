import { describe, expect, it } from 'vitest';
import type { Exercise } from '../src/domain/schemas.ts';
import { gradeExercise, needsSelfAssessment } from '../src/engine/grading.ts';

const base = { id: 's1-u01-l001-e01', instruction: 'x', explanation: 'y', vocabRefs: [] };
const opts = (correct: number) => [0, 1, 2].map((i) => ({ id: 'abc'[i]!, text: `opção ${i}`, correct: i === correct }));

describe('correção por tipo de exercício', () => {
  it('tradução com várias respostas aceites', () => {
    const ex: Exercise = { ...base, type: 'translate', direction: 'pt-nl', prompt: 'Obrigado!', answers: ['Dank [je|u]( wel)', 'Bedankt'] };
    expect(gradeExercise(ex, { kind: 'text', value: 'bedankt!' }).verdict).toBe('correct');
    expect(gradeExercise(ex, { kind: 'text', value: 'Dank je wel.' }).verdict).toBe('correct');
    expect(gradeExercise(ex, { kind: 'text', value: 'Graag gedaan' }).verdict).toBe('incorrect');
  });
  it('escolha múltipla com feedback específico', () => {
    const ex: Exercise = { ...base, type: 'multipleChoice', prompt: '?', options: [{ id: 'a', text: 'hoi', correct: true }, { id: 'b', text: 'doei', correct: false, feedback: 'é despedida' }] };
    expect(gradeExercise(ex, { kind: 'option', id: 'a' }).verdict).toBe('correct');
    const r = gradeExercise(ex, { kind: 'option', id: 'b' });
    expect(r.verdict).toBe('incorrect');
    expect(r.optionFeedback).toBe('é despedida');
  });
  it('preencher espaço aceita a palavra ou a frase completa', () => {
    const ex: Exercise = { ...base, type: 'fillBlank', sentence: 'Waar kom je ___?', answers: ['vandaan'] };
    expect(gradeExercise(ex, { kind: 'text', value: 'vandaan' }).verdict).toBe('correct');
    expect(gradeExercise(ex, { kind: 'text', value: 'Waar kom je vandaan?' }).verdict).toBe('correct');
  });
  it('conjugação não aceita gralhas (uma letra muda a forma)', () => {
    const ex: Exercise = { ...base, type: 'conjugation', verb: 'wonen', pronoun: 'jij', tense: 'presente', answers: ['woont'] };
    expect(gradeExercise(ex, { kind: 'text', value: 'woon' }).verdict).toBe('incorrect');
    expect(gradeExercise(ex, { kind: 'text', value: 'Woont' }).verdict).toBe('correct');
  });
  it('ordenação aceita ordens alternativas válidas', () => {
    const ex: Exercise = { ...base, type: 'wordOrder', translation: 'Agora moro em Lisboa.', tokens: ['Ik', 'woon', 'nu', 'in', 'Lissabon'], alternatives: ['Nu woon ik in Lissabon'] };
    expect(gradeExercise(ex, { kind: 'text', value: 'Nu woon ik in Lissabon' }).verdict).toBe('correct');
    expect(gradeExercise(ex, { kind: 'text', value: 'Nu ik woon in Lissabon' }).verdict).toBe('incorrect');
  });
  it('de/het, encontrar o erro, associação e compreensão', () => {
    expect(gradeExercise({ ...base, type: 'articleChoice', noun: 'huis', pt: 'casa', article: 'het' }, { kind: 'option', id: 'het' }).verdict).toBe('correct');
    expect(gradeExercise({ ...base, type: 'findError', tokens: ['Ik', 'bent', 'Ana'], errorIndex: 1, correction: 'ben' }, { kind: 'index', index: 0 }).verdict).toBe('incorrect');
    const m: Exercise = { ...base, type: 'match', pairs: [{ nl: 'a', pt: '1' }, { nl: 'b', pt: '2' }, { nl: 'c', pt: '3' }] };
    expect(gradeExercise(m, { kind: 'match', mistakes: 0 }).verdict).toBe('correct');
    expect(gradeExercise(m, { kind: 'match', mistakes: 1 }).verdict).toBe('almost');
    expect(gradeExercise(m, { kind: 'match', mistakes: 3 }).verdict).toBe('incorrect');
    const c: Exercise = { ...base, type: 'comprehension', kind: 'text', text: 't', questions: [{ prompt: 'q1', options: opts(0) }, { prompt: 'q2', options: opts(2) }] };
    expect(gradeExercise(c, { kind: 'options', ids: ['a', 'c'] }).verdict).toBe('correct');
    expect(gradeExercise(c, { kind: 'options', ids: ['a', 'b'] }).verdict).toBe('incorrect');
  });
  it('escrita livre: diferente do modelo NÃO é automaticamente errado', () => {
    const ex: Exercise = { ...base, type: 'shortWriting', prompt: 'Apresente-se', referenceAnswers: ['Ik heet Ana'], checklist: ['nome'], minWords: 3 };
    expect(gradeExercise(ex, { kind: 'text', value: 'Ik heet Ana' }).verdict).toBe('correct');
    expect(needsSelfAssessment(ex, 'Hallo, mijn naam is Joana')).toBe(true);
    expect(needsSelfAssessment(ex, 'Joana')).toBe(false); // demasiado curta: errada sem autoavaliação
    expect(gradeExercise(ex, { kind: 'self', text: 'Hallo, mijn naam is Joana', ok: true }).verdict).toBe('correct');
    expect(gradeExercise(ex, { kind: 'text', value: 'Joana' }).note).toMatch(/pelo menos 3/);
  });
});
