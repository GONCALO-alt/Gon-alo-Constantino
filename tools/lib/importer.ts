/**
 * Importação de lotes de lições (geradas por IA ou escritas à mão) para content/lessons.
 *
 * Garantias:
 *  - Idempotente: reimportar o mesmo lote não cria duplicados.
 *  - Nunca sobrescreve uma lição aprovada/publicada (só rascunhos, e só com `replaceDrafts`).
 *  - Todas as lições importadas entram como "draft" e precisam de revisão humana.
 *  - Um lote com erros de esquema é rejeitado por inteiro (nada é escrito).
 */
import { z } from 'zod';
import { LessonSchema, type Lesson, type PublicationStatus, type UnitLessonsFile } from '../../src/domain/schemas.ts';
import { hashOf } from './build.ts';

export const DraftBatchSchema = z.object({
  batchId: z.string().min(1),
  createdAt: z.string(),
  generator: z.string().optional(),
  lessons: z.array(z.unknown()),
});
export type DraftBatch = z.infer<typeof DraftBatchSchema>;

export interface ImportResult {
  files: Map<string, UnitLessonsFile>;
  added: string[];
  replaced: string[];
  skippedIdentical: string[];
  conflicts: string[];
  errors: string[];
}

function contentOf(l: Lesson): unknown {
  const { status: _s, provenance: _p, reviewNotes: _r, version: _v, ...rest } = l;
  return rest;
}

export function importBatch(
  existing: ReadonlyMap<string, UnitLessonsFile>,
  batch: unknown,
  opts: { replaceDrafts?: boolean; knownUnits?: ReadonlySet<string> } = {},
): ImportResult {
  const res: ImportResult = { files: new Map(), added: [], replaced: [], skippedIdentical: [], conflicts: [], errors: [] };
  const b = DraftBatchSchema.safeParse(batch);
  if (!b.success) {
    res.errors.push('Ficheiro de lote inválido: ' + b.error.issues.map((i) => i.message).join('; '));
    return res;
  }
  const lessons: Lesson[] = [];
  b.data.lessons.forEach((raw, i) => {
    const r = LessonSchema.safeParse(raw);
    if (!r.success) {
      const id = (raw as { id?: string })?.id ?? `#${i + 1}`;
      res.errors.push(`${id}: ` + r.error.issues.slice(0, 5).map((x) => `${x.path.join('.')}: ${x.message}`).join('; '));
    } else lessons.push(r.data);
  });
  const ids = lessons.map((l) => l.id);
  const dupInBatch = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupInBatch.length) res.errors.push(`IDs duplicados no próprio lote: ${[...new Set(dupInBatch)].join(', ')}`);
  for (const l of lessons) if (opts.knownUnits && !opts.knownUnits.has(l.unitId)) res.errors.push(`${l.id}: unidade ${l.unitId} não existe.`);
  if (res.errors.length) return res;

  // Cópia de trabalho dos ficheiros afetados.
  const files = new Map<string, UnitLessonsFile>();
  for (const [k, v] of existing) files.set(k, { unitId: v.unitId, lessons: [...v.lessons] });

  for (const incoming of lessons) {
    const file = files.get(incoming.unitId) ?? { unitId: incoming.unitId, lessons: [] };
    files.set(incoming.unitId, file);
    const idx = file.lessons.findIndex((l) => l.id === incoming.id);
    const draft: Lesson = {
      ...incoming,
      status: 'draft',
      provenance: { ...incoming.provenance, batchId: b.data.batchId, generator: incoming.provenance.generator ?? b.data.generator },
    };
    if (idx === -1) {
      if (file.lessons.some((l) => l.order === incoming.order && l.status !== 'rejected')) {
        res.conflicts.push(`${incoming.id}: a posição ${incoming.order} já está ocupada em ${incoming.unitId}.`);
        continue;
      }
      file.lessons.push(draft);
      res.added.push(incoming.id);
      continue;
    }
    const current = file.lessons[idx]!;
    if (hashOf(contentOf(current)) === hashOf(contentOf(incoming))) {
      res.skippedIdentical.push(incoming.id);
      continue;
    }
    if (current.status === 'draft' && opts.replaceDrafts) {
      file.lessons[idx] = { ...draft, version: current.version + 1 };
      res.replaced.push(incoming.id);
    } else {
      res.conflicts.push(`${incoming.id}: já existe (${current.status}) com conteúdo diferente.`);
    }
  }
  for (const f of files.values()) f.lessons.sort((a, b) => a.order - b.order);
  // Só devolve ficheiros alterados.
  for (const [k, v] of files) {
    const before = existing.get(k);
    if (!before || hashOf(before) !== hashOf(v)) res.files.set(k, v);
  }
  return res;
}

const TRANSITIONS: Record<PublicationStatus, PublicationStatus[]> = {
  draft: ['approved', 'rejected'],
  approved: ['published', 'draft', 'rejected'],
  published: ['draft'], // despublicar = voltar a rascunho para corrigir
  rejected: ['draft'],
};

export function canTransition(from: PublicationStatus, to: PublicationStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Muda o estado de lições. Devolve as lições alteradas e os erros. */
export function setStatus(
  files: Map<string, UnitLessonsFile>,
  ids: ReadonlySet<string>,
  to: PublicationStatus,
  meta: { reviewer?: string; note?: string; now?: string } = {},
): { changed: string[]; errors: string[] } {
  const changed: string[] = [];
  const errors: string[] = [];
  const found = new Set<string>();
  for (const f of files.values()) {
    f.lessons = f.lessons.map((l) => {
      if (!ids.has(l.id)) return l;
      found.add(l.id);
      if (!canTransition(l.status, to)) {
        errors.push(`${l.id}: não é possível passar de "${l.status}" para "${to}".`);
        return l;
      }
      changed.push(l.id);
      const reviewed = to === 'approved' || to === 'rejected';
      return {
        ...l,
        status: to,
        reviewNotes: meta.note ?? l.reviewNotes,
        provenance: reviewed ? { ...l.provenance, reviewedBy: meta.reviewer ?? 'local', reviewedAt: meta.now ?? new Date().toISOString() } : l.provenance,
      };
    });
  }
  for (const id of ids) if (!found.has(id)) errors.push(`${id}: lição não encontrada.`);
  return { changed, errors };
}
