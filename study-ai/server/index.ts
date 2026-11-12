import { createApp } from './app.ts';

const { app, ctx } = createApp();
const { port } = ctx.config;

app.listen(port, () => {
  console.log(`STUDY AI a correr em http://localhost:${port}`);
  console.log(`Dados em ${ctx.config.dataDir}`);
  if (ctx.ai.configured) {
    const models = Object.entries(ctx.config.ai.plans)
      .map(([plan, cfg]) => `${plan}: ${cfg.model} (esforço ${cfg.effort})`)
      .join(', ');
    console.log(`IA ligada — ${models}`);
  } else {
    console.log('IA NÃO configurada: defina ANTHROPIC_API_KEY para ativar o chat, resumos, flashcards e testes com IA.');
  }
});
