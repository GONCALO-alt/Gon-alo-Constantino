/**
 * Exercício «Leia em voz alta»: correção por palavras e criação a partir da lição.
 */
import { describe, expect, it } from 'vitest';
import type { Exercise } from '../src/domain/schemas.ts';
import { gradeExercise } from '../src/engine/grading.ts';
import { gradeSpeech, isGoodSpeakingText, speakingExercisesFor, withSpeaking } from '../src/engine/speech.ts';
import { lessonOf, realFiles } from './helpers.ts';

describe('correção da leitura em voz alta', () => {
  it('frase reconhecida por inteiro → certo', () => {
    const g = gradeSpeech('Ik woon in Utrecht.', ['ik woon in Utrecht']);
    expect(g.verdict).toBe('correct');
    expect(g.words.every((w) => w.heard)).toBe(true);
  });
  it('escolhe a melhor das alternativas do reconhecedor', () => {
    const g = gradeSpeech('Goedemorgen!', ['goede morgan', 'goedemorgen']);
    expect(g.verdict).toBe('correct');
    expect(g.best).toBe('goedemorgen');
  });
  it('uma palavra falhada numa frase longa → quase, e marca a palavra', () => {
    const g = gradeSpeech('Mijn zus woont in Amsterdam', ['mijn zus wordt in Amsterdam']);
    expect(g.verdict).toBe('almost');
    expect(g.words.find((w) => w.word === 'woont')?.heard).toBe(false);
  });
  it('nada parecido → errado', () => {
    expect(gradeSpeech('De fiets is rood', ['hello world']).verdict).toBe('incorrect');
    expect(gradeSpeech('De fiets is rood', []).verdict).toBe('incorrect');
  });
  it('o motor de correção diz o que ouviu', () => {
    const ex: Exercise = { id: 's1-u01-l001-e91', type: 'speaking', instruction: 'x', explanation: 'y', vocabRefs: [], text: 'Hallo!', translation: 'Olá!' };
    const r = gradeExercise(ex, { kind: 'speech', alternatives: ['hallo'] });
    expect(r.verdict).toBe('correct');
    expect(r.note).toContain('hallo');
  });
});

describe('exercícios de voz criados a partir das lições', () => {
  it('frases boas: curtas e sem números', () => {
    expect(isGoodSpeakingText('Ik heb twee broers.')).toBe(true);
    expect(isGoodSpeakingText('Het kost €3,50.')).toBe(false);
  });
  it('cada lição escrita da Secção 1 gera pelo menos um exercício de voz', () => {
    const lesson = lessonOf(realFiles(), 's1-u01-l001');
    const sp = speakingExercisesFor(lesson);
    expect(sp.length).toBeGreaterThan(0);
    for (const e of sp) expect(gradeExercise(e, { kind: 'speech', alternatives: [e.text] }).verdict).toBe('correct');
    const all = withSpeaking(lesson.exercises, sp);
    expect(all.length).toBe(lesson.exercises.length + sp.length);
  });
  it('em todo o curso, a própria frase lida é sempre aceite', () => {
    let n = 0;
    for (const l of realFiles().flatMap((f) => f.lessons)) {
      for (const e of speakingExercisesFor(l)) {
        n++;
        expect(gradeExercise(e, { kind: 'speech', alternatives: [e.text] }).verdict, e.text).toBe('correct');
      }
    }
    expect(n).toBeGreaterThan(1000);
  });
});
