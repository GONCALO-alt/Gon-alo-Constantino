// Junta a versão de demonstração (VITE_DEMO=1 vite build) num só ficheiro HTML,
// pronto a publicar como artefacto do claude.ai: o artefacto não tem servidor, por isso
// o JavaScript, o CSS e as fontes ficam todos dentro da página.
// Uso: npm run build:artifact  →  dist-artifact/study-ai.html
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'dist-artifact');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
const styles = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((m) => m[1]);
if (scripts.length !== 1) throw new Error(`esperava 1 script, encontrei ${scripts.length}`);

const read = (href) => fs.readFileSync(path.join(dir, href.replace(/^\.?\//, '')), 'utf8');
// Fontes do KaTeX: o navegador escolhe woff2; os formatos antigos só aumentavam o ficheiro.
const css = styles
  .map(read)
  .join('\n')
  .replace(/,\s*url\(data:font\/(woff|ttf|truetype)[^)]*\)\s*format\("(woff|truetype)"\)/g, '');
// `</script` dentro do código fecharia a etiqueta antes do tempo.
// O carácter U+FFFD (usado pelas bibliotecas de Markdown dentro de textos) fica escrito como escape.
const js = read(scripts[0]).replace(/<\/script/gi, '<\\/script').replace(/�/g, '\\uFFFD');

const page = `<title>STUDY AI</title>
<meta name="theme-color" content="#09090b">
<style>html,body{background:#09090b}</style>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;

const out = path.join(dir, 'study-ai.html');
fs.writeFileSync(out, page);
console.log(`${path.relative(root, out)}: ${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} MB`);
