import { describe, expect, it } from 'vitest';
import type { Exercise } from '../src/domain/schemas.ts';
import { checkExercise, validateContent } from '../tools/lib/validate.ts';
import { findSimilar } from '../tools/lib/similarity.ts';
import { asRaw, clone, lessonOf, realFiles, realStructure } from './helpers.ts';

describe('conteúdo real do repositório', () => {
  it('passa na validação sem erros', () => {
    const r = validateContent(realStructure(), asRaw(realFiles()));
    expect(r.errors).toEqual([]);
    expect(r.stats.lessons).toBeGreaterThanOrEqual(10);
  });
  it('a estrutura tem 7 secções e 4.500 lições previstas', () => {
    const s = realStructure();
    expect(s.sections).toHaveLength(7);
    expect(s.sections.reduce((n, x) => n + x.plannedLessons, 0)).toBe(4500);
  });
  it('cada lição tem pelo menos 3 tipos de exercício e duração entre 3 e 8 minutos', () => {
    for (const l of realFiles().flatMap((f) => f.lessons)) {
      expect(new Set(l.exercises.map((e) => e.type)).size).toBeGreaterThanOrEqual(3);
      expect(l.estimatedMinutes).toBeGreaterThanOrEqual(3);
      expect(l.estimatedMinutes).toBeLessThanOrEqual(8);
    }
  });
});

describe('deteção de problemas', () => {
  const structure = realStructure();
  it('IDs de lição duplicados', () => {
    const files = clone(realFiles());
    const f = files[0]!;
    f.lessons.push({ ...clone(f.lessons[0]!), order: 99 });
    const r = validateContent(structure, asRaw(files), { skipSimilarity: true });
    expect(r.errors.some((e) => e.message.includes('duplicado'))).toBe(true);
  });
  it('vocabulário referenciado mas não definido', () => {
    const files = clone(realFiles());
    lessonOf(files, 's1-u01-l001').exercises[0]!.vocabRefs.push('v-nao-existe');
    const r = validateContent(structure, asRaw(files), { skipSimilarity: true });
    expect(r.errors.some((e) => e.message.includes('v-nao-existe'))).toBe(true);
  });
  it('vocabulário definido duas vezes', () => {
    const files = clone(realFiles());
    const l2 = lessonOf(files, 's1-u01-l002');
    l2.newVocabulary.push(clone(lessonOf(files, 's1-u01-l001').newVocabulary[0]!));
    const r = validateContent(structure, asRaw(files), { skipSimilarity: true });
    expect(r.errors.some((e) => e.message.includes('já foi definido'))).toBe(true);
  });
  it('lição publicada que depende de vocabulário de um rascunho', () => {
    const files = clone(realFiles());
    lessonOf(files, 's1-u01-l001').status = 'draft';
    const r = validateContent(structure, asRaw(files), { skipSimilarity: true });
    expect(r.errors.some((e) => e.message.includes('não publicada'))).toBe(true);
  });
  it('unidade inexistente e ficheiro com nome errado', () => {
    const files = clone(realFiles());
    const raw = asRaw(files);
    raw[0]!.name = 'outro.json';
    const r = validateContent(structure, raw, { skipSimilarity: true });
    expect(r.errors.some((e) => e.message.includes('nome do ficheiro'))).toBe(true);
  });
  it('esquema inválido dá erro com localização', () => {
    const files = clone(realFiles());
    (lessonOf(files, 's1-u01-l001') as { title: string }).title = '';
    const r = validateContent(structure, asRaw(files), { skipSimilarity: true });
    expect(r.errors.some((e) => e.where.includes('title'))).toBe(true);
  });
});

describe('verificações de coerência dos exercícios', () => {
  const b = { id: 's1-u01-l001-e01', instruction: 'i', explanation: 'e', vocabRefs: [] };
  it('escolha múltipla sem opção correta ou com opções repetidas', () => {
    expect(checkExercise({ ...b, type: 'multipleChoice', prompt: 'p', options: [{ id: 'a', text: 'x', correct: false }, { id: 'b', text: 'y', correct: false }] })).not.toEqual([]);
    expect(checkExercise({ ...b, type: 'multipleChoice', prompt: 'p', options: [{ id: 'a', text: 'x', correct: true }, { id: 'b', text: 'X', correct: false }] }).join()).toMatch(/repetidos/);
  });
  it('banco de palavras que não permite construir a resposta', () => {
    const ex: Exercise = { ...b, type: 'buildSentence', prompt: 'p', tokens: ['Ik', 'ben'], answers: ['Ik ben Ana'] };
    expect(checkExercise(ex).join()).toMatch(/peças/);
  });
  it('alternativa de ordenação com palavras diferentes', () => {
    const ex: Exercise = { ...b, type: 'wordOrder', translation: 't', tokens: ['Ik', 'ben', 'Ana'], alternatives: ['Ana ben jij'] };
    expect(checkExercise(ex).join()).toMatch(/mesmas palavras/);
  });
  it('diálogo com a linha a completar preenchida', () => {
    const ex: Exercise = { ...b, type: 'dialogue', lines: [{ speaker: 'A', nl: 'Hoi' }, { speaker: 'B', nl: 'Hoi' }], blankLine: 1, options: [{ id: 'a', text: 'x', correct: true }, { id: 'b', text: 'y', correct: false }] };
    expect(checkExercise(ex).join()).toMatch(/vazio/);
  });
  it('parênteses desequilibrados nas respostas', () => {
    expect(checkExercise({ ...b, type: 'translate', direction: 'nl-pt', prompt: 'x', answers: ['[a|b'] }).join()).toMatch(/desequilibrados/);
  });
});

describe('semelhança', () => {
  it('encontra textos quase iguais e ignora textos diferentes', () => {
    const pairs = findSimilar([
      { id: 1, text: 'Ik woon in Amsterdam en ik kom uit Portugal' },
      { id: 2, text: 'Ik woon in Amsterdam en ik kom uit Portugal!' },
      { id: 3, text: 'Waar is het station? Rechtdoor en dan links.' },
    ], 0.85);
    expect(pairs.map((p) => [p.a, p.b].sort())).toEqual([[1, 2]]);
  });
  it('avisa sobre lições quase duplicadas', () => {
    const files = clone(realFiles());
    const f = files[0]!;
    const copy = clone(f.lessons[0]!);
    copy.id = 's1-u01-l099';
    copy.order = 99;
    copy.newVocabulary = [];
    copy.exercises = copy.exercises.map((e, i) => ({ ...e, id: `s1-u01-l099-e${String(i + 1).padStart(2, '0')}` }));
    f.lessons.push(copy);
    const r = validateContent(realStructure(), asRaw(files));
    expect(r.warnings.some((w) => w.message.includes('muito semelhante'))).toBe(true);
  });
});
