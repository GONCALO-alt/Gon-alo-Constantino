import { build, context } from 'esbuild';
const watch = process.argv.includes('--watch');
const common = {
  bundle: true, platform: 'node', target: 'node20', format: 'cjs', sourcemap: true,
  external: ['electron', 'ffmpeg-static', 'ffprobe-static'], outdir: 'dist-electron',
  alias: { '@shared': './shared' }, logLevel: 'info',
};
const entries = { entryPoints: { main: 'electron/main.ts', preload: 'electron/preload.ts' } };
if (watch) { const ctx = await context({ ...common, ...entries }); await ctx.watch(); }
else await build({ ...common, ...entries });
