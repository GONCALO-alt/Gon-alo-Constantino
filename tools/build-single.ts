/**
 * Gera dist-single/dutchpath.html: a app inteira (JS, CSS e todas as lições publicadas)
 * num único ficheiro HTML que abre diretamente no navegador, sem servidor.
 *
 *   npm run build:single
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const OUT_DIR = 'dist-single';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// Evita que o conteúdo feche a etiqueta <script> antes do tempo.
const safe = (s: string) => s.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');

let html = readFileSync(join(DIST, 'index.html'), 'utf8');

const content: Record<string, unknown> = {};
const contentDir = join(DIST, 'content');
for (const f of walk(contentDir).filter((f) => f.endsWith('.json'))) {
  content[relative(contentDir, f).split('\\').join('/')] = JSON.parse(readFileSync(f, 'utf8'));
}

const cssMatch = html.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/);
const jsMatch = html.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/);
if (!cssMatch || !jsMatch) throw new Error('Não encontrei os ficheiros JS/CSS em dist/index.html. Corra primeiro "npm run build".');

const css = readFileSync(join(DIST, cssMatch[1]!), 'utf8');
const js = readFileSync(join(DIST, jsMatch[1]!), 'utf8');

html = html
  .replace(cssMatch[0], () => `<style>${css}</style>`)
  .replace(jsMatch[0], () => '')
  .replace('</body>', () =>
    `<script>window.__DUTCHPATH_CONTENT__=${safe(JSON.stringify(content))};</script>\n` +
    `<script type="module">${safe(js)}</script>\n</body>`);

mkdirSync(OUT_DIR, { recursive: true });
const out = join(OUT_DIR, 'dutchpath.html');
writeFileSync(out, html);
console.log(`✓ ${out} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB, ${Object.keys(content).length} ficheiros de conteúdo embutidos)`);
