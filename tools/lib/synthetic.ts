/**
 * Dados SINTÉTICOS para testes de desempenho e escala. NÃO são conteúdo pedagógico
 * e nunca devem ser publicados (provenance.source = "synthetic").
 */
import type { CourseStructure, Exercise, Lesson, UnitLessonsFile } from '../../src/domain/schemas.ts';

const SYL = ['ka', 'lo', 'mi', 'ne', 'tu', 'ro', 'sa', 've', 'di', 'po', 'ge', 'ha', 'bi', 'zu', 'fe', 'wo', 'je', 'ni'];

/** Palavra pseudo-aleatória determinística e única por número. */
export function fakeWord(n: number): string {
  let s = '';
  let x = n + 7;
  do {
    s += SYL[x % SYL.length];
    x = Math.floor(x / SYL.length);
  } while (x > 0);
  return s;
}

export function syntheticLesson(unitId: string, order: number, seed: number): Lesson {
  const id = `${unitId}-l${String(order).padStart(3, '0')}`;
  const w = (k: number) => fakeWord(seed * 13 + k);
  const vocabId = `v-syn-${seed}`;
  const e = (n: number) => `${id}-e${String(n).padStart(2, '0')}`;
  const common = { explanation: `Explicação ${seed}.`, vocabRefs: [vocabId] };
  const exercises: Exercise[] = [
    { ...common, id: e(1), type: 'translate', direction: 'nl-pt', instruction: 'Traduza.', prompt: `${w(1)} ${w(2)} ${w(3)}`, answers: [`${w(4)} ${w(5)}`] },
    { ...common, id: e(2), type: 'multipleChoice', instruction: 'Escolha.', prompt: `${w(6)} ${w(7)}?`, options: [{ id: 'a', text: w(8), correct: true }, { id: 'b', text: w(9), correct: false }, { id: 'c', text: w(10), correct: false }] },
    { ...common, id: e(3), type: 'fillBlank', instruction: 'Complete.', sentence: `${w(11)} ___ ${w(12)} ${w(13)}`, answers: [w(14)] },
    { ...common, id: e(4), type: 'wordOrder', instruction: 'Ordene.', translation: `${w(15)} ${w(16)}`, tokens: [w(17), w(18), w(19)], alternatives: [] },
    { ...common, id: e(5), type: 'match', instruction: 'Associe.', pairs: [{ nl: w(20), pt: w(21) }, { nl: w(22), pt: w(23) }, { nl: w(24), pt: w(25) }] },
    { ...common, id: e(6), type: 'articleChoice', instruction: 'Artigo.', noun: w(26), pt: w(27), article: seed % 3 ? 'de' : 'het' },
  ];
  return {
    id, unitId, order, title: `Lição sintética ${seed} ${w(30)}`, description: 'Sintética.', cefr: 'A1',
    objectives: ['Teste de desempenho'],
    newVocabulary: [{ id: vocabId, nl: w(31), pt: [w(32)], pos: 'noun', article: 'de' }],
    reviewVocabulary: [], examples: [{ nl: w(33), pt: w(34) }], grammar: [], exercises,
    difficulty: 1 + (seed % 5), estimatedMinutes: 5, status: 'published', version: 1,
    provenance: { source: 'synthetic' },
  };
}

/** Distribui `total` lições pelas unidades da estrutura, respeitando a proporção prevista. */
export function syntheticCourse(structure: CourseStructure, total = 5000): UnitLessonsFile[] {
  const units = structure.sections.flatMap((s) => s.units);
  const planned = units.reduce((n, u) => n + u.plannedLessons, 0);
  let seed = 0;
  let assigned = 0;
  return units.map((u, i) => {
    const n = i === units.length - 1 ? total - assigned : Math.round((u.plannedLessons / planned) * total);
    assigned += n;
    return { unitId: u.id, lessons: Array.from({ length: n }, (_, k) => syntheticLesson(u.id, k + 1, seed++)) };
  });
}
