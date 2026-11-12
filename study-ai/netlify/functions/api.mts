// Função do Netlify que responde a /api/... (ver netlify.toml: /api/* → esta função).
import type { Context } from '@netlify/functions';
import { netlifyApp } from '../lib/setup.ts';

export default async (req: Request, context: Context) => netlifyApp()(req, { ip: context.ip ?? 'ip' });
