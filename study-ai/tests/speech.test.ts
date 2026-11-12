import { describe, expect, it } from 'vitest';
import { dictationChunks, speechChunks, speechText } from '../src/speech.ts';

describe('ler as respostas em voz alta', () => {
  it('tira o Markdown e lê as fórmulas por palavras', () => {
    const md = [
      '## Frações equivalentes',
      '',
      'Duas frações são **equivalentes** quando representam a mesma parte: $\\frac{1}{2} = \\frac{2}{4}$.',
      '',
      '1. Multiplica por $k$',
      '- Área: $A = \\pi r^2$',
      '',
      '| Fração | Equivalente |',
      '|---|---|',
      '| 1/3 | 2/6 |',
      '',
      '$$x \\times 3 \\neq 5$$',
    ].join('\n');
    const t = speechText(md);
    expect(t).toContain('Frações equivalentes.');
    expect(t).toContain('Duas frações são equivalentes');
    expect(t).toContain('1 sobre 2 igual a 2 sobre 4');
    expect(t).toContain('A igual a pi r ao quadrado');
    expect(t).toContain('Fração, Equivalente.');
    expect(t).toContain('1/3, 2/6.');
    expect(t).toContain('x vezes 3 diferente de 5');
    expect(t).not.toMatch(/[*#$|\\]/);
  });

  it('divide textos longos em frases curtas', () => {
    const long = `${'Uma frase com várias palavras. '.repeat(20)}${'palavra '.repeat(80)}`;
    const chunks = speechChunks(long, 120);
    expect(chunks.length).toBeGreaterThan(20);
    expect(chunks.every((c) => c.length <= 120)).toBe(true);
    expect(chunks.join(' ').replace(/\s+/g, ' ')).toBe(long.trim().replace(/\s+/g, ' '));
  });

  it('para ditado, corta também nas vírgulas', () => {
    const md = 'A Revolução Francesa começou em 1789, com a tomada da Bastilha, e mudou a forma como a Europa via o poder dos reis e a liberdade.';
    const chunks = dictationChunks(md, 60);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 60)).toBe(true);
    expect(chunks.join(' ')).toBe(md);
  });

  it('os números das listas ficam com a frase', () => {
    const chunks = dictationChunks('Passos:\n\n1. Multiplica os dois.\n2. Simplifica.');
    expect(chunks).toEqual(['Passos:', '1) Multiplica os dois.', '2) Simplifica.']);
  });
});
