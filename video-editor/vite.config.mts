import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const r = (p: string) => path.resolve(import.meta.dirname, p);

/** Versão web: a página publicada na cloud é um fragmento (a plataforma acrescenta <html>/<head>/<body>). */
const webFragment = (): Plugin => ({
  name: 'web-fragment',
  enforce: 'post',
  transformIndexHtml(html) {
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
    const tags = (head.match(/<script[\s\S]*?<\/script>|<link[^>]*>/g) ?? []).join('\n');
    return `<title>Corte Studio</title>\n${tags}\n<div id="root"></div>\n`;
  },
});

export default defineConfig(({ mode }) => {
  const web = mode === 'web';
  return {
    root: r('src'),
    base: './',
    plugins: [react(), ...(web ? [webFragment()] : [])],
    resolve: {
      alias: [
        { find: '@shared', replacement: r('shared') },
        ...(web ? [
          { find: /^\.\/fontFiles$/, replacement: r('src/engine/fontFiles.web.ts') },
          { find: /^@huggingface\/transformers$/, replacement: r('src/captions/transformers-web.ts') },
        ] : []),
      ],
    },
    build: { outDir: r(web ? 'dist-web' : 'dist'), emptyOutDir: true, target: 'chrome110', assetsInlineLimit: 0 },
    worker: { format: 'es' },
    server: { port: 5173, strictPort: true },
    optimizeDeps: { exclude: ['@huggingface/transformers'] },
    test: { root: import.meta.dirname, include: ['tests/**/*.test.ts'], testTimeout: 300000, hookTimeout: 300000 },
  } as any;
});
