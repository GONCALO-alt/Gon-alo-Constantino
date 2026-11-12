/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = Number(process.env.PORT ?? 8787);
// `VITE_DEMO=1`: versão de demonstração para um artefacto do claude.ai — um só ficheiro,
// com o JavaScript, o CSS e as fontes lá dentro (ver tools/build-artifact.mjs).
const demo = process.env.VITE_DEMO === '1';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: `http://localhost:${apiPort}`, changeOrigin: false },
    },
  },
  build: demo
    ? {
        outDir: 'dist-artifact',
        assetsInlineLimit: 100_000_000,
        cssCodeSplit: false,
        modulePreload: false,
        copyPublicDir: false,
        chunkSizeWarningLimit: 5000,
        rollupOptions: { output: { inlineDynamicImports: true } },
      }
    : {
        outDir: 'dist',
        chunkSizeWarningLimit: 1200,
      },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000,
  },
});
