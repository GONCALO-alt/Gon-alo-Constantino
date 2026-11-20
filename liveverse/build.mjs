// Junta src/ num único ficheiro index.html (abre diretamente no navegador).
import { readFileSync, writeFileSync } from 'node:fs';
const dir = new URL('./src/', import.meta.url);
const read = f => readFileSync(new URL(f, dir), 'utf8');
const js = ['data.js', 'core.js', 'views.js', 'live.js', 'social.js', 'app.js'].map(read).join('\n');
const out = read('shell.html').replace('/*STYLE*/', () => read('style.css')).replace('/*SCRIPT*/', () => js);
writeFileSync(new URL('./index.html', import.meta.url), out);
console.log('index.html', (out.length / 1024).toFixed(1) + ' KB');
