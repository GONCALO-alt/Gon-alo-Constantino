import { spawn } from 'node:child_process';
import { createServer } from 'vite';
import { build } from 'esbuild';
import electron from 'electron';

const server = await createServer({ configFile: 'vite.config.mts' });
await server.listen();
const url = `http://localhost:${server.config.server.port}`;
await build({ entryPoints: { main: 'electron/main.ts', preload: 'electron/preload.ts' }, bundle: true, platform: 'node',
  target: 'node20', format: 'cjs', sourcemap: true, external: ['electron', 'ffmpeg-static', 'ffprobe-static'],
  outdir: 'dist-electron', alias: { '@shared': './shared' } });
const args = ['.', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : [])];
const child = spawn(electron, args, { stdio: 'inherit', env: { ...process.env, VITE_DEV_SERVER_URL: url } });
child.on('exit', (code) => { server.close(); process.exit(code ?? 0); });
