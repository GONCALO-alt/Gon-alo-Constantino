/**
 * Compilação do conteúdo de autoria (content/) para o formato servido à aplicação
 * (public/content/). Só entram lições com estado "published".
 *
 *   public/content/index.json            estrutura + IDs das lições (leve, ~1 KB por unidade)
 *   public/content/units/<unitId>.json   lições completas de uma unidade (carregadas a pedido)
 *   public/content/vocab/<sectionId>.json vocabulário compacto por secção (para a revisão)
 */
import { createHash } from 'node:crypto';
import type { CourseIndex, CourseStructure, UnitBundle, UnitLessonsFile, VocabBundle } from '../../src/domain/schemas.ts';

export interface CompiledContent {
  index: CourseIndex;
  units: Map<string, UnitBundle>;
  vocab: Map<string, VocabBundle>;
}

export function hashOf(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function compileContent(structure: CourseStructure, files: readonly UnitLessonsFile[], builtAt = new Date().toISOString()): CompiledContent {
  const byUnit = new Map(files.map((f) => [f.unitId, f]));
  const units = new Map<string, UnitBundle>();
  const vocab = new Map<string, VocabBundle>();

  const sections = structure.sections.map((sec) => {
    const sectionVocab: VocabBundle = { sectionId: sec.id, items: [] };
    const unitsOut = sec.units.map((u) => {
      const published = (byUnit.get(u.id)?.lessons ?? [])
        .filter((l) => l.status === 'published')
        .sort((a, b) => a.order - b.order);
      if (published.length > 0) {
        const lessons = published.map(({ status: _s, reviewNotes: _r, provenance: _p, ...rest }) => rest);
        units.set(u.id, { unitId: u.id, contentHash: hashOf(lessons), lessons });
        for (const l of published) for (const v of l.newVocabulary) sectionVocab.items.push({ ...v, lessonId: l.id });
      }
      return { ...u, lessonIds: published.map((l) => l.id) };
    });
    if (sectionVocab.items.length) vocab.set(sec.id, sectionVocab);
    const { units: _u, ...secRest } = sec;
    return { ...secRest, units: unitsOut };
  });

  const contentHash = hashOf({ sections: sections.map((s) => s.units.map((u) => u.lessonIds)), units: [...units.values()].map((u) => u.contentHash) });
  return {
    index: { courseId: 'pt-nl', structureVersion: structure.structureVersion, contentHash, builtAt, sections },
    units,
    vocab,
  };
}
