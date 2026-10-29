import { describe, expect, it } from 'vitest';
import { expandAnswerPattern, gradeText, levenshtein, normalize } from '../src/engine/answers.ts';

describe('normalização', () => {
  it('ignora maiúsculas, espaços e pontuação que não muda o sentido', () => {
    expect(normalize('  Hallo,   Sanne!  ')).toBe('hallo sanne');
    expect(normalize('Hoe gaat het?')).toBe('hoe gaat het');
  });
  it('uniformiza apóstrofos tipográficos (importante em zo’n, ’s morgens)', () => {
    expect(normalize('zo’n')).toBe(normalize("zo'n"));
  });
});

describe('variantes de respostas', () => {
  it('expande alternativas e segmentos opcionais', () => {
    expect(expandAnswerPattern('[Hoi|Hallo], Ana').sort()).toEqual(['Hallo, Ana', 'Hoi, Ana']);
    expect(expandAnswerPattern('Dank [je|u]( wel)').sort()).toEqual(['Dank je', 'Dank je wel', 'Dank u', 'Dank u wel']);
    expect(expandAnswerPattern('Não, (eu )sou (a )Eva')).toContain('Não, sou Eva');
  });
  it('limita explosões combinatórias', () => {
    const p = Array.from({ length: 12 }, () => '[a|b]').join(' ');
    expect(expandAnswerPattern(p).length).toBeLessThanOrEqual(256);
  });
});

describe('gradeText', () => {
  it('aceita respostas equivalentes', () => {
    expect(gradeText('hallo sanne', ['Hallo, Sanne!']).verdict).toBe('correct');
    expect(gradeText('Obrigada', ['Obrigad[o|a]']).verdict).toBe('correct');
    expect(gradeText('dank u', ['Dank [je|u]( wel)', 'Bedankt']).verdict).toBe('correct');
  });
  it('aceita acentos em falta com aviso, se permitido', () => {
    const r = gradeText('Ate ja', ['Até já']);
    expect(r.verdict).toBe('almost');
    expect(r.note).toMatch(/acentos/);
    expect(gradeText('Ate ja', ['Até já'], { lenientAccents: false, allowTypos: false }).verdict).toBe('incorrect');
  });
  it('tolera uma gralha numa palavra longa', () => {
    expect(gradeText('Goedemorgn', ['Goedemorgen']).verdict).toBe('almost');
  });
  it('não trata troca de palavras curtas como gralha (de/het, een/en)', () => {
    expect(gradeText('het naam', ['de naam']).verdict).toBe('incorrect');
    expect(gradeText('Ik ben en student', ['Ik ben een student']).verdict).toBe('incorrect');
  });
  it('não aceita palavras curtas com uma letra trocada', () => {
    expect(gradeText('bent', ['ben'], { allowTypos: true }).verdict).toBe('incorrect');
  });
  it('rejeita respostas vazias e devolve a resposta mais próxima', () => {
    expect(gradeText('   ', ['Hallo']).verdict).toBe('incorrect');
    expect(gradeText('Tot zien morgen', ['Tot ziens', 'Tot straks']).bestMatch).toBe('Tot ziens');
  });
  it('levenshtein limitada', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('abc', 'abcdefgh', 2)).toBeGreaterThan(2);
  });
});
