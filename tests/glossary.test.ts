/**
 * Dicionário de palavras clicáveis (engine/glossary.ts) e significado da resposta (engine/spoken.ts).
 */
import { describe, expect, it } from 'vitest';
import type { Exercise } from '../src/domain/schemas.ts';
import { buildGlossary, lemmaCandidates } from '../src/engine/glossary.ts';
import { answerMeaning } from '../src/engine/spoken.ts';
import { realFiles } from './helpers.ts';

const g = buildGlossary([
  { nl: 'werken', pt: ['trabalhar'] },
  { nl: 'wonen', pt: ['morar'] },
  { nl: 'zitten', pt: ['estar sentado'] },
  { nl: 'rijden', pt: ['conduzir'] },
  { nl: 'groot', pt: ['grande'] },
  { nl: 'dik', pt: ['gordo', 'grosso'] },
  { nl: 'kat', pt: ['gato'], article: 'de', plural: 'katten' },
  { nl: 'boom', pt: ['árvore'], article: 'de' },
  { nl: 'huis', pt: ['casa'], article: 'het' },
  { nl: 'lezen', pt: ['ler'] },
  { nl: 'zich vergissen', pt: ['enganar-se'] },
  { nl: 'goedemorgen', pt: ['bom dia'] },
]);
const first = (w: string) => g.lookup(w)[0]?.pt[0];

describe('dicionário: formas flexionadas', () => {
  it('verbos conjugados', () => {
    expect(first('werkt')).toBe('trabalhar');
    expect(first('woont')).toBe('morar');
    expect(first('zit')).toBe('estar sentado');
    expect(first('rijdt')).toBe('conduzir');
    expect(first('leest')).toBe('ler');
    expect(first('vergist')).toBe('enganar-se');
  });
  it('adjetivos, plurais e diminutivos', () => {
    expect(first('grote')).toBe('grande');
    expect(first('dikke')).toBe('gordo');
    expect(first('katten')).toBe('gato');
    expect(first('bomen')).toBe('árvore');
    expect(first('huisje')).toBe('casa');
  });
  it('pontuação e maiúsculas', () => {
    expect(first('Goedemorgen!')).toBe('bom dia');
    expect(g.lookup('kat')[0]?.headword).toBe('de kat');
  });
  it('palavra desconhecida devolve lista vazia', () => {
    expect(g.lookup('xyzzy')).toEqual([]);
    expect(lemmaCandidates('...')).toEqual([]);
  });
});

describe('dicionário com o vocabulário real do curso', () => {
  const items = realFiles().flatMap((f) => f.lessons).flatMap((l) => l.newVocabulary);
  const real = buildGlossary(items);
  it('reconhece palavras frequentes das frases das lições', () => {
    for (const w of ['fiets', 'woon', 'werkt', 'huis', 'grote', 'kinderen', 'boeken', 'regent']) {
      expect(real.lookup(w).length, w).toBeGreaterThan(0);
    }
  });
});

describe('significado da resposta certa (mostrado quando há erro)', () => {
  const base = { id: 's1-u01-l001-e01', instruction: 'x', explanation: 'y', vocabRefs: [] };
  it('tradução para neerlandês mostra o enunciado em português', () => {
    const ex: Exercise = { ...base, type: 'translate', direction: 'pt-nl', prompt: 'Obrigado!', answers: ['Dank je'] };
    expect(answerMeaning(ex)).toBe('Obrigado!');
  });
  it('tradução para português não repete', () => {
    const ex: Exercise = { ...base, type: 'translate', direction: 'nl-pt', prompt: 'Dank je', answers: ['Obrigado'] };
    expect(answerMeaning(ex)).toBeNull();
  });
});
