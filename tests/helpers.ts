import { readFileSync } from 'node:fs';
import { CourseStructureSchema, type CourseStructure, type Lesson, type UnitLessonsFile } from '../src/domain/schemas.ts';
import { PATHS, readLessonFiles } from '../tools/lib/io.ts';
import { compileContent } from '../tools/lib/build.ts';
import type { Fetcher } from '../src/data/contentRepo.ts';

export function realStructure(): CourseStructure {
  return CourseStructureSchema.parse(JSON.parse(readFileSync(PATHS.structure, 'utf8')));
}
export function realFiles(): UnitLessonsFile[] {
  return [...readLessonFiles().values()];
}
export function asRaw(files: UnitLessonsFile[]) {
  return files.map((f) => ({ name: `${f.unitId}.json`, data: f }));
}
export function clone<T>(x: T): T {
  return structuredClone(x);
}
export function lessonOf(files: UnitLessonsFile[], id: string): Lesson {
  return files.flatMap((f) => f.lessons).find((l) => l.id === id)!;
}

export function fetcherFor(compiled = compileContent(realStructure(), realFiles())): Fetcher {
  return async (url: string) => {
    const path = url.replace(/^.*content\//, '');
    let body: unknown;
    if (path === 'index.json') body = compiled.index;
    else if (path.startsWith('units/')) body = compiled.units.get(path.slice(6, -5));
    else if (path.startsWith('vocab/')) body = compiled.vocab.get(path.slice(6, -5));
    return { ok: body !== undefined, status: body === undefined ? 404 : 200, json: async () => body };
  };
}

