// Atualiza a versão do service worker (hash dos ficheiros) e cria o .zip para o Netlify Drop.
// Uso: node tools/build.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const assets = [...sw.matchAll(/^\s+'([^']+)',$/gm)].map((m) => m[1]).filter((a) => a !== './');
const h = createHash('sha256');
for (const a of assets) h.update(readFileSync(join(root, a)));
const version = 'kmp-' + h.digest('hex').slice(0, 10);
writeFileSync(join(root, 'sw.js'), sw.replace(/const VERSION = '[^']+';/, `const VERSION = '${version}';`));
console.log('Versão do service worker:', version);

const zip = join(root, '..', 'KartMentalPro-netlify.zip');
execSync(`rm -f "${zip}" && cd "${root}" && zip -qr "${zip}" index.html manifest.webmanifest sw.js _headers css js icons`);
console.log('Criado:', zip);
