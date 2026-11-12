// Tarefa agendada do Netlify: a cada 5 minutos envia os lembretes (sessões do plano e véspera dos testes).
import type { Config } from '@netlify/functions';
import { netlifyApp } from '../lib/setup.ts';

export default async () => {
  const r = await netlifyApp().reminders();
  return new Response(JSON.stringify(r), { headers: { 'Content-Type': 'application/json' } });
};

export const config: Config = { schedule: '*/5 * * * *' };
