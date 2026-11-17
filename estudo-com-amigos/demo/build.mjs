// Constrói a demo num único ficheiro HTML (dist/demo.html) que corre sem servidor.
// Uso: npm run demo
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const swap = {
  name: 'demo-swap',
  setup(b) {
    // a IA verdadeira é trocada pela IA da demo
    b.onResolve({ filter: /^\.\/ai\.js$/ }, args =>
      args.importer.endsWith('handlers.js') ? { path: join(root, 'demo', 'ai-demo.js') } : undefined);
    // o browser não tem ficheiros: a demo não guarda nada em disco
    b.onResolve({ filter: /^node:(fs|path)$/ }, args => ({ path: args.path, namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
      contents: 'export const readFileSync=()=>"";export const writeFileSync=()=>{};export const mkdirSync=()=>{};export const existsSync=()=>false;export const dirname=p=>p;',
      loader: 'js',
    }));
  },
};

const out = await build({
  entryPoints: [join(root, 'demo', 'main.js')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  minify: true,
  write: false,
  plugins: [swap],
});
const js = out.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

const css = readFileSync(join(root, 'public', 'style.css'), 'utf8');
const html = readFileSync(join(root, 'public', 'index.html'), 'utf8');
const icon = 'data:image/svg+xml;base64,' + readFileSync(join(root, 'public', 'icons', 'icon.svg')).toString('base64');
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script src="/socket.io')).trim()
  .replaceAll('src="icons/icon.svg"', `src="${icon}"`);

const page = `<title>Cardume</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
${css}
/* demo */
.demo-note { margin-bottom: 1rem; padding: .6rem .9rem; border-radius: 12px; background: var(--card); border: 1px dashed var(--accent); color: var(--muted); font-size: .9rem; }
.demo-note b { color: var(--text); }
</style>
${body.replace('<div id="testBanner"', '<div class="demo-note"><b>Demo jogável.</b> O Rui e a Eva são amigos simulados e a IA dá respostas de exemplo. Cria uma sala para eles entrarem. O foco de 1 minuto e os duelos curtos são só para experimentar.</div>\n    <div id="testBanner"')}
<script type="module">${js}</script>
`;

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'demo.html'), page);
// versão que abre sozinha no browser (duplo clique)
writeFileSync(join(root, 'dist', 'demo-offline.html'),
  `<!doctype html>\n<html lang="pt">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${page}</body>\n</html>\n`);
console.log(`dist/demo.html + dist/demo-offline.html (${Math.round(page.length / 1024)} KB)`);
