// Configuração comum às funções do Netlify (API e lembretes agendados).
import { getStore } from '@netlify/blobs';
import { GeminiAi } from '../../core/gemini';
import { createApp } from './app';
import { blobsKV } from './kv';

const env = (name: string) => {
  const v = process.env[name] ?? (globalThis as { Netlify?: { env: { get(n: string): string | undefined } } }).Netlify?.env.get(name);
  return v && v.trim() ? v.trim() : null;
};

let app: ReturnType<typeof createApp> | null = null;

export function netlifyApp() {
  app ??= createApp({
    kv: blobsKV(getStore({ name: 'study-ai', consistency: 'strong' })),
    ai: new GeminiAi({
      apiKey: env('GEMINI_API_KEY'),
      model: env('GEMINI_MODEL'),
      models: { 'claudio-5': env('GEMINI_MODEL_CLAUDIO_5'), 'claudio-5-5': env('GEMINI_MODEL_CLAUDIO_5_5'), 'claudio-6': env('GEMINI_MODEL_CLAUDIO_6') },
      where: 'no Netlify (Site configuration → Environment variables)',
    }),
    secret: env('SESSION_SECRET'),
    timeZone: env('APP_TIMEZONE') ?? 'Europe/Lisbon',
  });
  return app;
}
