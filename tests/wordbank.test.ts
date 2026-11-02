/**
 * Peças das traduções (engine/wordBank.ts).
 */
import { describe, expect, it } from 'vitest';
import type { Exercise, ExerciseOf } from '../src/domain/schemas.ts';
import { expandAnswerPattern, normalize } from '../src/engine/answers.ts';
import { gradeExercise } from '../src/engine/grading.ts';
import { answerTiles, bareWord, buildWordPools, translationTiles } from '../src/engine/wordBank.ts';
import { realFiles } from './helpers.ts';

const base = { instruction: 'x', explanation: 'y', vocabRefs: [] };

describe('peças para traduzir', () => {
  const lesson: Exercise[] = [
    { ...base, id: 's1-u01-l001-e01', type: 'translate', direction: 'nl-pt', prompt: 'Ik drink koffie.', answers: ['(Eu )bebo café.'] },
    { ...base, id: 's1-u01-l001-e02', type: 'translate', direction: 'nl-pt', prompt: 'Ik eet brood.', answers: ['(Eu )como pão.'] },
    { ...base, id: 's1-u01-l001-e03', type: 'listening', audioText: 'Jij leest een boek in Amsterdam.', answers: ['x'], translation: 'Tu lês um livro em Amsterdão.' },
    { ...base, id: 's1-u01-l001-e04', type: 'match', pairs: [{ nl: 'het huis', pt: 'casa' }, { nl: 'de thee', pt: 'chá' }, { nl: 'water', pt: 'água' }] },
  ];
  const pools = buildWordPools(lesson);

  it('a resposta em peças, com palavras a mais da lição', () => {
    const ex = lesson[0] as ExerciseOf<'translate'>;
    const tiles = translationTiles(ex, pools)!;
    expect(tiles.slice(0, 3)).toEqual(['Eu', 'bebo', 'café']);
    expect(tiles.length).toBeGreaterThanOrEqual(5);
    // nenhuma peça a mais faz parte de uma resposta aceite
    const accepted = new Set(expandAnswerPattern(ex.answers[0]!).flatMap((a) => a.split(' ')).map((w) => normalize(bareWord(w))));
    for (const t of tiles.slice(3)) expect(accepted.has(normalize(t))).toBe(false);
  });

  it('a maiúscula de início de frase sai das peças a mais, os nomes próprios ficam', () => {
    expect(pools.pt).toContain('tu');
    expect(pools.nl).toContain('jij');
    expect(pools.nl).toContain('Amsterdam');
  });

  it('respostas longas ou com notas ficam com teclado', () => {
    const long: ExerciseOf<'translate'> = { ...base, id: 's1-u01-l001-e05', type: 'translate', direction: 'pt-nl', prompt: 'x', answers: ['een twee drie vier vijf zes zeven acht negen tien elf twaalf dertien'] };
    expect(translationTiles(long, pools)).toBeNull();
  });

  it('em todo o curso, construir a resposta com as peças é aceite', () => {
    let tiled = 0;
    let total = 0;
    for (const l of realFiles().flatMap((f) => f.lessons)) {
      const p = buildWordPools(l.exercises);
      for (const ex of l.exercises) {
        if (ex.type !== 'translate') continue;
        total++;
        const tiles = translationTiles(ex, p);
        if (!tiles) continue;
        tiled++;
        if (ex.wordBank) continue;
        const built = answerTiles(ex)!.join(' ');
        expect(tiles.slice(0, answerTiles(ex)!.length)).toEqual(answerTiles(ex));
        expect(gradeExercise(ex, { kind: 'text', value: built }, { lenientAccents: false }).verdict, `${ex.id}: ${built}`).not.toBe('incorrect');
      }
    }
    expect(tiled / total).toBeGreaterThan(0.6);
  });
});

describe('respostas curtas', () => {
  it('outras expressões curtas da lição (possíveis sinónimos) não servem de peça a mais', () => {
    const ex: ExerciseOf<'translate'> = { ...base, id: 's1-u01-l001-e01', type: 'translate', direction: 'nl-pt', prompt: 'Tot ziens!', answers: ['[Adeus|Até à vista]'] };
    const others: Exercise[] = [
      ex,
      { ...base, id: 's1-u01-l001-e02', type: 'match', pairs: [{ nl: 'doei', pt: 'tchau' }, { nl: 'hoi', pt: 'olá' }, { nl: 'dag', pt: 'bom dia' }] },
      { ...base, id: 's1-u01-l001-e03', type: 'listening', audioText: 'Ik heet Sanne en ik woon in Delft.', answers: ['x'], translation: 'Chamo-me Sanne e moro em Delft.' },
    ];
    const tiles = translationTiles(ex, buildWordPools(others))!;
    expect(tiles[0]).toBe('Adeus');
    for (const bad of ['tchau', 'olá']) expect(tiles).not.toContain(bad);
  });
});
