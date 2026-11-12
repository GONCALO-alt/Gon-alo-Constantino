import path from 'node:path';
import type { AiPlanId } from '../shared/plans.ts';

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface PlanModelConfig {
  model: string;
  effort: Effort;
  maxTokens: number;
}

export interface AppConfig {
  port: number;
  production: boolean;
  dataDir: string;
  /** Fuso horário usado para os limites diários. */
  timeZone: string;
  /** `true` força cookies `Secure` (https). Por omissão: só em produção. */
  secureCookies: boolean;
  /** Pasta com o frontend compilado (servido em produção). */
  staticDir: string | null;
  ai: {
    apiKey: string | null;
    baseURL: string | null;
    plans: Record<AiPlanId, PlanModelConfig>;
  };
}

// Modelo por omissão: Claude Opus 5.5. A profundidade de cada plano é controlada pelo
// esforço (effort), pelo máximo de tokens e pelas instruções. Cada plano pode usar outro
// modelo com as variáveis STUDY_AI_MODEL_CLAUDIO_5 / _5_5 / _6.
const DEFAULT_MODEL = 'claude-opus-5-5';

function env(name: string): string | null {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}

export function loadConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  const production = process.env.NODE_ENV === 'production';
  const root = path.resolve(import.meta.dirname, '..');
  const base: AppConfig = {
    port: Number(env('PORT') ?? 8787),
    production,
    dataDir: path.resolve(env('DATA_DIR') ?? path.join(root, 'data')),
    timeZone: env('APP_TIMEZONE') ?? 'Europe/Lisbon',
    secureCookies: env('COOKIE_SECURE') ? env('COOKIE_SECURE') === 'true' : production,
    staticDir: production ? path.join(root, 'dist') : null,
    ai: {
      apiKey: env('ANTHROPIC_API_KEY'),
      baseURL: env('ANTHROPIC_BASE_URL'),
      plans: {
        'claudio-5': { model: env('STUDY_AI_MODEL_CLAUDIO_5') ?? DEFAULT_MODEL, effort: 'low', maxTokens: 6000 },
        'claudio-5-5': { model: env('STUDY_AI_MODEL_CLAUDIO_5_5') ?? DEFAULT_MODEL, effort: 'medium', maxTokens: 16000 },
        'claudio-6': { model: env('STUDY_AI_MODEL_CLAUDIO_6') ?? DEFAULT_MODEL, effort: 'high', maxTokens: 32000 },
      },
    },
  };
  return { ...base, ...overrides, ai: { ...base.ai, ...(overrides.ai ?? {}) } };
}
