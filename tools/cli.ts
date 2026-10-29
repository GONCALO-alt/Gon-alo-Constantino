/**
 * CLI de conteúdo do DutchPath.
 *
 *   node tools/cli.ts validate [--no-similarity] [--strict]
 *   node tools/cli.ts build
 *   node tools/cli.ts stats
 *   node tools/cli.ts import <lote.json> [--replace-drafts]
 *   node tools/cli.ts review list [--status draft] [--unit s1-u01]
 *   node tools/cli.ts review show <lessonId>
 *   node tools/cli.ts review <approve|reject|publish|unpublish|reopen> <ids…> [--unit u] [--batch b] [--note "…"]
 */
import { readFileSync } from 'node:fs';
import { CourseStructureSchema, type Lesson, type PublicationStatus } from '../src/domain/schemas.ts';
import { compileContent } from './lib/build.ts';
import { importBatch, setStatus } from './lib/importer.ts';
import { PATHS, readJson, readLessonFiles, readRawLessonFiles, writeCompiled, writeLessonFile } from './lib/io.ts';
import { validateContent, type ValidationReport } from './lib/validate.ts';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1]!.startsWith('--') && ['status', 'unit', 'batch', 'note'].includes(args[i - 1]!.slice(2))));

function printReport(r: ValidationReport, max = 60): void {
  const show = (label: string, list: ValidationReport['errors']) => {
    if (!list.length) return;
    console.log(`\n${label} (${list.length}):`);
    for (const i of list.slice(0, max)) console.log(`  • [${i.where}] ${i.message}`);
    if (list.length > max) console.log(`  … e mais ${list.length - max}.`);
  };
  show('ERROS', r.errors);
  show('AVISOS', r.warnings);
  const s = r.stats;
  console.log(`\nLições: ${s.lessons} · Exercícios: ${s.exercises} · Vocabulário: ${s.vocabulary} · Estados: ${JSON.stringify(s.byStatus)}`);
  console.log(r.errors.length ? '✗ Validação falhou.' : '✓ Sem erros de estrutura. (A qualidade linguística exige revisão humana.)');
}

function runValidate(): ValidationReport {
  return validateContent(readJson(PATHS.structure), readRawLessonFiles(), { skipSimilarity: flag('no-similarity') });
}

function selectIds(lessons: Lesson[], ids: string[]): Set<string> {
  const unit = opt('unit');
  const batch = opt('batch');
  const out = new Set(ids);
  for (const l of lessons) {
    if (unit && l.unitId === unit) out.add(l.id);
    if (batch && l.provenance.batchId === batch) out.add(l.id);
  }
  return out;
}

const [cmd, sub, ...rest] = positional;
switch (cmd) {
  case 'validate': {
    const t = performance.now();
    const r = runValidate();
    printReport(r);
    console.log(`(${Math.round(performance.now() - t)} ms)`);
    process.exit(r.errors.length || (flag('strict') && r.warnings.length) ? 1 : 0);
    break;
  }
  case 'build': {
    const r = validateContent(readJson(PATHS.structure), readRawLessonFiles(), { skipSimilarity: true });
    if (r.errors.length) {
      printReport(r);
      console.error('Compilação cancelada: corrija os erros primeiro.');
      process.exit(1);
    }
    const structure = CourseStructureSchema.parse(readJson(PATHS.structure));
    const compiled = compileContent(structure, [...readLessonFiles().values()]);
    writeCompiled(compiled);
    const n = [...compiled.units.values()].reduce((a, u) => a + u.lessons.length, 0);
    console.log(`✓ Conteúdo compilado em public/content: ${n} lições publicadas em ${compiled.units.size} unidades (hash ${compiled.index.contentHash}).`);
    break;
  }
  case 'stats':
  case 'status': {
    const structure = CourseStructureSchema.parse(readJson(PATHS.structure));
    const files = readLessonFiles();
    console.log('Secção | previstas | rascunho | aprovadas | publicadas | rejeitadas');
    for (const s of structure.sections) {
      const c: Record<PublicationStatus, number> = { draft: 0, approved: 0, published: 0, rejected: 0 };
      for (const u of s.units) for (const l of files.get(u.id)?.lessons ?? []) c[l.status]++;
      console.log(`${s.id} ${s.title.padEnd(28)} | ${String(s.plannedLessons).padStart(4)} | ${c.draft} | ${c.approved} | ${c.published} | ${c.rejected}`);
    }
    break;
  }
  case 'import': {
    const file = sub;
    if (!file) throw new Error('Indique o ficheiro do lote.');
    const structure = CourseStructureSchema.parse(readJson(PATHS.structure));
    const known = new Set(structure.sections.flatMap((s) => s.units.map((u) => u.id)));
    const existing = readLessonFiles();
    const res = importBatch(existing, JSON.parse(readFileSync(file, 'utf8')), { replaceDrafts: flag('replace-drafts'), knownUnits: known });
    if (res.errors.length) {
      console.error('Lote rejeitado (nada foi escrito):\n  ' + res.errors.join('\n  '));
      process.exit(1);
    }
    // Validação global ANTES de escrever.
    const merged = new Map(existing);
    for (const [k, v] of res.files) merged.set(k, v);
    const report = validateContent(readJson(PATHS.structure), [...merged.values()].map((f) => ({ name: `${f.unitId}.json`, data: f })));
    if (report.errors.length) {
      printReport(report);
      console.error('Lote rejeitado: a importação criaria erros (nada foi escrito).');
      process.exit(1);
    }
    for (const f of res.files.values()) writeLessonFile(f);
    console.log(`✓ Importadas como rascunho: ${res.added.length} · substituídas: ${res.replaced.length} · idênticas (ignoradas): ${res.skippedIdentical.length}`);
    if (res.conflicts.length) console.log('Conflitos (não importadas):\n  ' + res.conflicts.join('\n  '));
    if (report.warnings.length) console.log(`${report.warnings.length} avisos — veja "npm run content:validate".`);
    break;
  }
  case 'review': {
    const files = readLessonFiles();
    const all = [...files.values()].flatMap((f) => f.lessons);
    if (sub === 'list' || !sub) {
      const st = opt('status');
      const unit = opt('unit');
      for (const l of all.filter((l) => (!st || l.status === st) && (!unit || l.unitId === unit))) {
        console.log(`${l.id.padEnd(14)} ${l.status.padEnd(9)} v${l.version} ${l.cefr.padEnd(5)} ${l.title}  [${l.provenance.source}${l.provenance.batchId ? ' · ' + l.provenance.batchId : ''}]`);
      }
      break;
    }
    if (sub === 'show') {
      const l = all.find((x) => x.id === rest[0]);
      if (!l) throw new Error('Lição não encontrada.');
      console.log(JSON.stringify(l, null, 2));
      break;
    }
    const target: Record<string, PublicationStatus> = { approve: 'approved', reject: 'rejected', publish: 'published', unpublish: 'draft', reopen: 'draft' };
    const to = target[sub];
    if (!to) throw new Error(`Subcomando desconhecido: ${sub}`);
    const ids = selectIds(all, rest);
    if (!ids.size) throw new Error('Indique IDs, --unit ou --batch.');
    const { changed, errors } = setStatus(files, ids, to, { note: opt('note') });
    if (errors.length) console.error('  ' + errors.join('\n  '));
    // Publicar exige que o conjunto continue válido.
    const report = validateContent(readJson(PATHS.structure), [...files.values()].map((f) => ({ name: `${f.unitId}.json`, data: f })), { skipSimilarity: true });
    if (report.errors.length) {
      printReport(report);
      console.error('Alteração cancelada: deixaria o conteúdo inválido.');
      process.exit(1);
    }
    const touched = new Set(all.filter((l) => changed.includes(l.id)).map((l) => l.unitId));
    for (const u of touched) writeLessonFile(files.get(u)!);
    console.log(`✓ ${changed.length} lições → ${to}.${to === 'published' ? ' Execute "npm run content:build".' : ''}`);
    break;
  }
  default:
    console.log(readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]);
}
