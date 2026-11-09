import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(import.meta.dirname, 'src'),
  base: './',
  plugins: [react()],
  resolve: { alias: { '@shared': path.resolve(import.meta.dirname, 'shared') } },
  build: { outDir: path.resolve(import.meta.dirname, 'dist'), emptyOutDir: true, target: 'chrome128' },
  worker: { format: 'es' },
  server: { port: 5173, strictPort: true },
  optimizeDeps: { exclude: ['@huggingface/transformers'] },
  test: { root: import.meta.dirname, include: ['tests/**/*.test.ts'], testTimeout: 300000, hookTimeout: 300000 },
} as any);
