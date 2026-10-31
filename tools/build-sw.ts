/**
 * Gera dist/sw.js: o service worker que guarda a app e todas as lições para uso sem internet.
 * Corre depois do `vite build` (faz parte de `npm run build`).
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const SKIP = new Set(['sw.js', '_headers', '_redirects']);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(DIST)
  .map((f) => relative(DIST, f).split('\\').join('/'))
  .filter((f) => !SKIP.has(f))
  .sort();
const entries = files.map((f) => [f, createHash('sha256').update(readFileSync(join(DIST, f))).digest('hex').slice(0, 16)] as const);
const version = createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0, 12);
const body = readFileSync('tools/sw/sw.js', 'utf8');
const sw = `const VERSION = ${JSON.stringify(version)};\nconst PRECACHE = ${JSON.stringify(entries)};\n${body}`;
writeFileSync(join(DIST, 'sw.js'), sw);
const mb = entries.reduce((n, [f]) => n + statSync(join(DIST, f)).size, 0) / 1024 / 1024;
console.log(`✓ dist/sw.js: versão ${version}, ${entries.length} ficheiros (${mb.toFixed(1)} MB) para uso sem internet`);
