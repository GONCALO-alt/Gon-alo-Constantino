// Compila tools/netlify-local.ts (como o Netlify faz com a função, usando o esbuild) e arranca-o.
import { build } from 'esbuild';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const outfile = path.join(root, 'node_modules/.cache/study-ai/netlify-local.mjs');
await build({
  entryPoints: [path.join(root, 'tools/netlify-local.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
  logLevel: 'warning',
});
await import(pathToFileURL(outfile).href);
