/** Leitura/escrita de ficheiros de conteúdo. Toda a lógica está em módulos puros. */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UnitLessonsFileSchema, type UnitLessonsFile } from '../../src/domain/schemas.ts';
import type { CompiledContent } from './build.ts';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const PATHS = {
  structure: join(ROOT, 'content/course.json'),
  lessons: join(ROOT, 'content/lessons'),
  drafts: join(ROOT, 'content/drafts'),
  out: join(ROOT, 'public/content'),
};

export function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Escrita atómica (ficheiro temporário + rename) para nunca deixar JSON corrompido. */
export function writeJson(path: string, data: unknown, pretty = true): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(data, null, pretty ? 2 : 0) + '\n', 'utf8');
  renameSync(tmp, path);
}

export function readRawLessonFiles(dir = PATHS.lessons): { name: string; data: unknown }[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({ name: f, data: readJson(join(dir, f)) }));
}

export function readLessonFiles(dir = PATHS.lessons): Map<string, UnitLessonsFile> {
  const out = new Map<string, UnitLessonsFile>();
  for (const { name, data } of readRawLessonFiles(dir)) {
    const parsed = UnitLessonsFileSchema.parse(data);
    if (`${parsed.unitId}.json` !== name) throw new Error(`${name}: unitId ${parsed.unitId} não corresponde ao nome do ficheiro.`);
    out.set(parsed.unitId, parsed);
  }
  return out;
}

export function writeLessonFile(file: UnitLessonsFile, dir = PATHS.lessons): void {
  writeJson(join(dir, `${file.unitId}.json`), file);
}

export function writeCompiled(c: CompiledContent, out = PATHS.out): void {
  // Escreve numa pasta temporária e troca no fim (nunca fica meio compilado).
  const tmp = `${out}.tmp-${process.pid}`;
  rmSync(tmp, { recursive: true, force: true });
  writeJson(join(tmp, 'index.json'), c.index, false);
  for (const [id, u] of c.units) writeJson(join(tmp, 'units', `${id}.json`), u, false);
  for (const [id, v] of c.vocab) writeJson(join(tmp, 'vocab', `${id}.json`), v, false);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(dirname(out), { recursive: true });
  renameSync(tmp, out);
}
