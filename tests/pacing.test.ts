/**
 * Ritmo das palavras novas (tools/authoring/pacing_gen.py): poucas palavras de cada vez,
 * muitas vezes repetidas, e as mini-lições ficam junto da lição que preparam.
 */
import { describe, expect, it } from 'vitest';
import { CourseIndexSchema } from '../src/domain/schemas.ts';
import { isWordsPrepLesson, nextLesson, withPreparedLessons } from '../src/engine/progression.ts';
import { compileContent } from '../tools/lib/build.ts';
import { realFiles, realStructure } from './helpers.ts';

describe('palavras novas aos poucos', () => {
  const files = realFiles();
  const lessons = files.flatMap((f) => f.lessons).filter((l) => l.status === 'published');
  const idx = CourseIndexSchema.parse(compileContent(realStructure(), files, 't').index);
  const order = idx.sections.flatMap((s) => s.units).flatMap((u) => u.lessonIds);

  it('quase nenhuma lição apresenta mais de 3 palavras novas', () => {
    const heavy = lessons.filter((l) => l.newVocabulary.length > 3);
    expect(heavy.length).toBeLessThan(lessons.length * 0.01);
  });

  it('cada palavra de uma mini-lição aparece pelo menos 3 vezes nos exercícios', () => {
    const minis = lessons.filter((l) => isWordsPrepLesson(l.id));
    expect(minis.length).toBeGreaterThan(1000);
    let ok = 0, words = 0;
    for (const l of minis) {
      for (const v of l.newVocabulary) {
        if (v.nl.includes('|')) continue;
        words++;
        if (l.exercises.filter((e) => e.vocabRefs.includes(v.id)).length >= 3) ok++;
      }
    }
    expect(ok / words).toBeGreaterThan(0.95);
  });

  it('as mini-lições vêm logo antes da lição que preparam, na mesma unidade', () => {
    for (const u of idx.sections.flatMap((s) => s.units)) {
      const last = u.lessonIds[u.lessonIds.length - 1]!;
      expect(isWordsPrepLesson(last), u.id).toBe(false);
    }
    const i = order.indexOf('s1-u01-l002');
    expect(order.slice(i - 3, i).every(isWordsPrepLesson)).toBe(true);
    expect(order[i - 4]).toBe('s1-u01-l501');
  });

  it('quem já fez a lição não tem de voltar atrás para as mini-lições', () => {
    const done = new Set(order.slice(0, order.indexOf('s1-u01-l504') + 1).filter((id) => !isWordsPrepLesson(id)));
    const all = withPreparedLessons(idx, done);
    expect(order.slice(0, order.indexOf('s1-u01-l504') + 1).every((id) => all.has(id))).toBe(true);
    // A seguir vêm as mini-lições da próxima lição ainda por fazer.
    expect(isWordsPrepLesson(nextLesson(idx, all)!.lessonId) || nextLesson(idx, all)!.lessonId === 's1-u01-l005').toBe(true);
  });
});
