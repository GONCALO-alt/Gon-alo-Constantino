/**
 * Organização apresentada ao aluno (tools/lib/layout.ts): 8 secções, 1005 unidades.
 */
import { describe, expect, it } from 'vitest';
import { CourseIndexSchema } from '../src/domain/schemas.ts';
import { compileContent } from '../tools/lib/build.ts';
import { realFiles, realStructure } from './helpers.ts';

describe('8 secções e 1005 unidades', () => {
  const files = realFiles();
  const c = compileContent(realStructure(), files, 't');
  const idx = CourseIndexSchema.parse(c.index);

  it('unidades por secção e níveis como pedido', () => {
    expect(idx.sections.map((s) => s.units.length)).toEqual([10, 30, 30, 60, 255, 260, 180, 180]);
    expect(idx.sections.reduce((n, s) => n + s.units.length, 0)).toBe(1005);
    expect(idx.sections.map((s) => s.cefr)).toEqual(['Inicial', 'A1', 'A1', 'A2', 'B1', 'B1', 'B2', 'B2']);
  });

  it('todas as lições publicadas, uma só vez, pela ordem do curso', () => {
    const shown = idx.sections.flatMap((s) => s.units).flatMap((u) => u.lessonIds);
    const published = realStructure().sections.flatMap((s) => s.units).flatMap((u) =>
      (files.find((f) => f.unitId === u.id)?.lessons ?? []).filter((l) => l.status === 'published').sort((a, b) => a.order - b.order).map((l) => l.id));
    expect(shown).toEqual(published);
    expect(new Set(shown).size).toBe(shown.length);
  });

  it('cada prática fica na mesma unidade que a lição que treina; nenhuma unidade vazia', () => {
    for (const u of idx.sections.flatMap((s) => s.units)) {
      expect(u.lessonIds.length, u.id).toBeGreaterThan(0);
      expect(/-l5\d\d$/.test(u.lessonIds[0]!), u.id).toBe(false);
    }
  });

  it('o vocabulário continua nas secções de autoria', () => {
    expect(idx.vocabSections).toEqual(['s1', 's2', 's3', 's4', 's5', 's6', 's7']);
    expect([...c.vocab.keys()].sort()).toEqual(idx.vocabSections);
  });
});
