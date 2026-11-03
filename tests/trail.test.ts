/**
 * Tipo de cada círculo do caminho de lições (ícone).
 */
import { describe, expect, it } from 'vitest';
import { kindOf } from '../src/ui/screens/HomeScreen.tsx';
import { lessonOf, realFiles } from './helpers.ts';

describe('ícones do caminho', () => {
  const files = realFiles();
  it('lição com uma história para ler = livro', () => {
    expect(kindOf(lessonOf(files, 's1-u02-l004'))).toBe('story');
  });
  it('lição normal, prática e desafio', () => {
    expect(kindOf(lessonOf(files, 's1-u01-l001'))).toBe('lesson');
    expect(kindOf(lessonOf(files, 's1-u01-l501'))).toBe('practice');
  });
  it('há histórias em todas as secções', () => {
    for (const s of ['s1', 's2', 's3', 's4', 's5', 's6', 's7']) {
      const n = files.filter((f) => f.unitId.startsWith(s + '-')).flatMap((f) => f.lessons).filter((l) => kindOf(l) === 'story').length;
      expect(n, s).toBeGreaterThan(5);
    }
  });
});
