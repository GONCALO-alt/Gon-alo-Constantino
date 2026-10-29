import { describe, expect, it } from 'vitest';
import { UnitBundleSchema, CourseIndexSchema } from '../src/domain/schemas.ts';
import { compileContent } from '../tools/lib/build.ts';
import { canTransition, importBatch, setStatus } from '../tools/lib/importer.ts';
import { syntheticLesson } from '../tools/lib/synthetic.ts';
import { clone, realFiles, realStructure } from './helpers.ts';

const units = new Set(realStructure().sections.flatMap((s) => s.units.map((u) => u.id)));
const existing = () => new Map(realFiles().map((f) => [f.unitId, clone(f)]));
// Uma unidade ainda sem lições (a última do curso), para os testes de importação.
const EMPTY = (() => {
  const used = new Set(realFiles().map((f) => f.unitId));
  return [...units].reverse().find((u) => !used.has(u))!;
})();
const batch = (lessons: unknown[], batchId = 'lote-001') => ({ batchId, createdAt: '2026-10-29', generator: 'teste', lessons });

describe('importação de lotes', () => {
  it('importa lições novas sempre como rascunho', () => {
    const l = syntheticLesson(EMPTY, 1, 1);
    const r = importBatch(existing(), batch([l]), { knownUnits: units });
    expect(r.errors).toEqual([]);
    expect(r.added).toEqual([`${EMPTY}-l001`]);
    expect(r.files.get(EMPTY)!.lessons[0]!.status).toBe('draft');
    expect(r.files.get(EMPTY)!.lessons[0]!.provenance.batchId).toBe('lote-001');
  });
  it('é idempotente: repetir o mesmo lote não cria duplicados', () => {
    const l = syntheticLesson(EMPTY, 1, 1);
    const first = importBatch(existing(), batch([l]), { knownUnits: units });
    const after = existing();
    for (const [k, v] of first.files) after.set(k, v);
    const second = importBatch(after, batch([l]), { knownUnits: units });
    expect(second.added).toEqual([]);
    expect(second.skippedIdentical).toEqual([`${EMPTY}-l001`]);
    expect(second.files.size).toBe(0);
  });
  it('nunca substitui lições publicadas', () => {
    const published = clone(realFiles()[0]!.lessons[0]!);
    published.title = 'Outro título';
    const r = importBatch(existing(), batch([published]), { replaceDrafts: true, knownUnits: units });
    expect(r.conflicts.length).toBe(1);
    expect(r.files.size).toBe(0);
  });
  it('substitui rascunhos apenas com replaceDrafts, aumentando a versão', () => {
    const l = syntheticLesson(EMPTY, 1, 1);
    const base = existing();
    base.set(EMPTY, { unitId: EMPTY, lessons: [{ ...l, status: 'draft' }] });
    const changed = { ...l, title: 'Título revisto' };
    expect(importBatch(base, batch([changed]), { knownUnits: units }).conflicts.length).toBe(1);
    const r = importBatch(base, batch([changed]), { replaceDrafts: true, knownUnits: units });
    expect(r.replaced).toEqual([`${EMPTY}-l001`]);
    expect(r.files.get(EMPTY)!.lessons[0]!.version).toBe(2);
  });
  it('rejeita o lote inteiro se uma lição for inválida', () => {
    const ok = syntheticLesson(EMPTY, 1, 1);
    const bad = { ...syntheticLesson(EMPTY, 2, 2), exercises: [] };
    const r = importBatch(existing(), batch([ok, bad]), { knownUnits: units });
    expect(r.errors.length).toBeGreaterThan(0);
    expect(r.files.size).toBe(0);
  });
  it('rejeita unidades desconhecidas e IDs duplicados no lote', () => {
    const l = syntheticLesson(EMPTY, 1, 1);
    expect(importBatch(existing(), batch([l, l]), { knownUnits: units }).errors.join()).toMatch(/duplicados/);
    expect(importBatch(existing(), batch([{ ...l, id: 's1-u99-l001', unitId: 's1-u99' }]), { knownUnits: units }).errors.join()).toMatch(/não existe/);
  });
});

describe('fluxo de revisão editorial', () => {
  it('transições permitidas', () => {
    expect(canTransition('draft', 'approved')).toBe(true);
    expect(canTransition('draft', 'published')).toBe(false); // tem de ser aprovada primeiro
    expect(canTransition('approved', 'published')).toBe(true);
    expect(canTransition('rejected', 'published')).toBe(false);
  });
  it('setStatus regista quem reviu e quando', () => {
    const files = new Map([[EMPTY, { unitId: EMPTY, lessons: [{ ...syntheticLesson(EMPTY, 1, 1), status: 'draft' as const }] }]]);
    const r = setStatus(files, new Set([`${EMPTY}-l001`]), 'approved', { reviewer: 'ana', now: '2026-10-29T10:00:00Z', note: 'ok' });
    expect(r.changed).toEqual([`${EMPTY}-l001`]);
    const l = files.get(EMPTY)!.lessons[0]!;
    expect(l.provenance.reviewedBy).toBe('ana');
    expect(l.reviewNotes).toBe('ok');
    expect(setStatus(files, new Set(['nao-existe']), 'approved').errors.length).toBe(1);
  });
});

describe('compilação', () => {
  it('só inclui lições publicadas e remove metadados editoriais', () => {
    const files = realFiles().map(clone);
    files.push({ unitId: EMPTY, lessons: [{ ...syntheticLesson(EMPTY, 1, 1), status: 'draft' }] });
    const c = compileContent(realStructure(), files, '2026-10-29');
    CourseIndexSchema.parse(c.index);
    const u3 = c.index.sections.flatMap((s) => s.units).find((u) => u.id === EMPTY)!;
    expect(u3.lessonIds).toEqual([]);
    expect(c.units.has(EMPTY)).toBe(false);
    const bundle = UnitBundleSchema.parse(c.units.get('s1-u01'));
    expect('status' in bundle.lessons[0]!).toBe(false);
    expect(JSON.stringify(c.units.get('s1-u01'))).not.toContain('provenance');
  });
  it('o hash do conteúdo muda quando uma lição muda (e só então)', () => {
    const a = compileContent(realStructure(), realFiles(), 't1');
    const b = compileContent(realStructure(), realFiles(), 't2');
    expect(a.index.contentHash).toBe(b.index.contentHash);
    const changed = realFiles().map(clone);
    changed[0]!.lessons[0]!.title = 'Mudou';
    expect(compileContent(realStructure(), changed).index.contentHash).not.toBe(a.index.contentHash);
  });
});
