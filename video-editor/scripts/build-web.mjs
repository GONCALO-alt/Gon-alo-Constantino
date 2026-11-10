// Build da versão web (cloud): Vite em modo "web" + núcleo do ffmpeg.wasm dividido em partes ≤ 14 MB.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

execSync('npx vite build --mode web', { stdio: 'inherit' });
const core = 'node_modules/@ffmpeg/core/dist/umd';
const out = 'dist-web/ffmpeg';
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(core, 'ffmpeg-core.js'), path.join(out, 'ffmpeg-core.js'));
const wasm = fs.readFileSync(path.join(core, 'ffmpeg-core.wasm'));
const PART = 14_000_000;
let n = 0;
for (let o = 0; o < wasm.length; o += PART, n++) {
  fs.writeFileSync(path.join(out, `ffmpeg-core.part${String(n).padStart(2, '0')}.wasm`), wasm.subarray(o, o + PART));
}
console.log(`ffmpeg.wasm dividido em ${n} partes`);
