// Teste de ponta a ponta num navegador real (Chromium/Playwright).
// Usa a versão compilada (npm run build) e um simulador local da API de IA
// (tests/fake-anthropic.ts), por isso não precisa de chave nem tem custos.
// Uso: npm run build && npm run test:e2e   (capturas em tests/e2e/screenshots)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { startFakeAnthropic } from '../fake-anthropic.ts';
import { startFakeGemini } from '../fake-gemini.ts';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');

const root = path.resolve(import.meta.dirname, '../..');
const shots = path.join(root, process.env.TARGET ? `tests/e2e/screenshots-${process.env.TARGET}` : 'tests/e2e/screenshots');
fs.mkdirSync(shots, { recursive: true });
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'study-ai-e2e-'));
const port = 8800 + Math.floor(Math.random() * 100);
const base = `http://127.0.0.1:${port}`;
const scale = Number(process.env.SHOT_SCALE ?? 1);

// TARGET=netlify / TARGET=cloudflare testam essas versões (IA Gemini) em vez do servidor Node.
const target = process.env.TARGET ?? 'node';
const gemini = target === 'netlify' || target === 'cloudflare';
const fake = gemini ? await startFakeGemini() : await startFakeAnthropic();
fake.reply = [
  '## Frações equivalentes',
  '',
  'Duas frações são **equivalentes** quando representam a mesma parte do todo.',
  '',
  '1. Multiplica o numerador e o denominador pelo mesmo número: $\\frac{1}{2} = \\frac{2}{4}$',
  '2. Ou divide os dois pelo mesmo número: $\\frac{6}{9} = \\frac{2}{3}$',
  '',
  '$$\\frac{a}{b} = \\frac{a \\times k}{b \\times k}, \\quad k \\neq 0$$',
  '',
  '| Fração | Equivalente |',
  '|---|---|',
  '| 1/3 | 2/6 |',
  '| 3/4 | 6/8 |',
  '',
  '**Resposta:** $\\frac{3}{4}$ e $\\frac{6}{8}$ são equivalentes.',
].join('\n');

const persistDir = fs.mkdtempSync(path.join(os.tmpdir(), 'study-ai-e2e-cf-'));
const server = target === 'cloudflare'
  ? spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'dev', '--env', 'local', '--port', String(port), '--ip', '127.0.0.1', '--persist-to', persistDir,
      '--var', 'GEMINI_API_KEY:e2e', '--var', `GEMINI_BASE_URL:${fake.url}`], {
      cwd: root,
      env: { ...process.env, STUDY_AI_SKIP_BUILD: '1', WRANGLER_SEND_METRICS: 'false', NO_PROXY: '127.0.0.1,localhost', CI: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  : target === 'netlify'
  ? spawn(process.execPath, ['tools/netlify-local.mjs'], {
      cwd: root,
      env: { ...process.env, PORT: String(port), GEMINI_API_KEY: 'e2e', GEMINI_BASE_URL: fake.url },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  : spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'server/index.ts'], {
      cwd: root,
      env: { ...process.env, NODE_ENV: 'production', PORT: String(port), DATA_DIR: dataDir, ANTHROPIC_API_KEY: 'e2e', ANTHROPIC_BASE_URL: fake.url, COOKIE_SECURE: 'false' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
if (target !== 'cloudflare') server.stderr.on('data', (d) => process.stderr.write(d));
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('servidor não arrancou')), 60000);
  server.stdout.on('data', (d) => /a correr|Ready on/.test(String(d)) && (clearTimeout(t), resolve()));
});

const errors = [];
let failed = false;
const step = async (name, fn) => {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    failed = true;
    console.error(`✗ ${name}\n  ${err.message.split('\n').slice(0, 4).join('\n  ')}`);
  }
};

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  const shot = (name) => page.screenshot({ path: path.join(shots, `${name}.png`) });

  await step('criar conta', async () => {
    await page.goto(base);
    await page.waitForURL('**/criar-conta');
    await shot('01-criar-conta');
    await page.getByPlaceholder('Como te chamas?').fill('Marta');
    await page.getByPlaceholder('nome@exemplo.pt').fill('marta@exemplo.pt');
    await page.getByPlaceholder('Pelo menos 8 caracteres').fill('estudar-muito');
    await page.getByRole('button', { name: 'Criar conta e começar' }).click();
    await page.waitForURL('**/questionario');
  });

  await step('questionário completo', async () => {
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: /^9\.º/ }).click();
    await shot('02-questionario-ano');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByText('Que disciplinas tens?').waitFor();
    await shot('03-questionario-disciplinas');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Matemática', exact: true }).click();
    await page.getByRole('button', { name: 'Físico-Química' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Inglês' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: /1 h 30/ }).click();
    await page.getByRole('button', { name: 'Domingo' }).click();
    await shot('04-questionario-tempo');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: /Preparar testes/ }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: /^Exercícios/ }).click();
    await page.getByRole('button', { name: /^Resumos/ }).click();
    await shot('05-questionario-estilo');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Adicionar teste' }).click();
    await page.getByPlaceholder('Matéria (opcional)').fill('Equações');
    await shot('06-questionario-testes');
    await page.getByRole('button', { name: 'Criar o meu plano' }).click();
    await page.getByText('A criar o teu plano de estudos').waitFor();
    await page.waitForTimeout(1200);
    await shot('07-a-criar-plano');
    await page.getByText('O teu plano está pronto').waitFor({ timeout: 10000 });
    await page.waitForTimeout(700);
    await shot('08-plano-pronto');
    await page.getByRole('button', { name: 'Escolher a minha IA' }).click();
    await page.waitForURL('**/planos?inicio=1');
  });

  await step('escolher plano de IA', async () => {
    await page.getByText('Escolhe a tua IA').first().waitFor();
    await page.waitForTimeout(600);
    await shot('09-escolhe-a-tua-ia');
    await page.getByRole('button', { name: 'Escolher Cláudio 6' }).click();
    await page.waitForURL(base + '/');
  });

  await step('página inicial', async () => {
    await page.getByText('Plano de hoje').waitFor();
    // Anúncio da própria app: ainda não falou com a IA → convite para a primeira pergunta.
    await page.locator('aside.promo[data-promo="primeira-pergunta"]').waitFor();
    await page.waitForTimeout(700);
    await shot('10-inicio');
  });

  await step('chat com IA (simulador local)', async () => {
    await page.getByRole('button', { name: /Falar com a IA/ }).click();
    await page.waitForURL('**/chat');
    await page.getByText('Em que posso ajudar?').waitFor();
    await shot('11-chat-vazio');
    await page.getByRole('button', { name: /Explicar matéria/ }).click();
    await page.getByLabel('Mensagem').pressSequentially('frações equivalentes');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await page.getByRole('heading', { name: 'Frações equivalentes' }).waitFor({ timeout: 10000 });
    await page.locator('.katex').first().waitFor();
    await page.waitForURL(/\/chat\/[0-9a-f-]+$/);
    await page.waitForTimeout(500);
    await shot('12-chat-resposta');
    await page.getByRole('button', { name: 'Guardar resumo' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Guardar' }).click();
    await page.getByText('Guardado nos teus resumos.').waitFor();
  });

  await step('plano de estudos e calendário', async () => {
    await page.getByRole('link', { name: /Plano de estudos/ }).first().click();
    await page.getByText('Objetivos da semana').waitFor();
    await page.waitForTimeout(600);
    await shot('13-plano-semana');
    await page.locator('.wsession').first().click();
    await page.getByRole('button', { name: 'Marcar como feita' }).click();
    await page.getByRole('tab', { name: 'Calendário escolar' }).click();
    await page.waitForURL('**/plano/calendario');
    await page.getByRole('button', { name: 'Adicionar' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Trabalho' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Guardar' }).click();
    await page.getByText('Adicionado ao calendário.').waitFor();
    await page.waitForTimeout(400);
    await shot('14-calendario');
  });

  await step('disciplinas', async () => {
    await page.getByRole('link', { name: 'Disciplinas' }).first().click();
    await page.locator('.subject-card').first().waitFor();
    await page.locator('.subject-card .star').first().click();
    await page.waitForTimeout(500);
    await shot('15-disciplinas');
    await page.locator('.subject-card').first().click();
    await page.getByRole('link', { name: 'Perguntar à IA' }).waitFor();
    await shot('16-disciplina');
  });

  await step('resumos', async () => {
    await page.getByRole('link', { name: 'Resumos' }).first().click();
    await page.locator('.summary-card').first().waitFor();
    await shot('17-resumos');
    await page.locator('.summary-card').first().click();
    await page.getByRole('button', { name: 'Criar flashcards com IA' }).waitFor();
    await shot('18-resumo');
  });

  await step('gerar e fazer um teste', async () => {
    await page.getByRole('link', { name: 'Testes e exercícios' }).first().click();
    await page.getByPlaceholder(/Funções afins/).fill('Frações');
    await shot('19-gerador-testes');
    await page.getByRole('button', { name: 'Gerar teste' }).click();
    await page.waitForURL(/\/testes\/[0-9a-f-]+$/);
    await page.locator('.q-opt').first().click();
    await page.locator('.q-card').nth(1).locator('.q-opt').nth(1).click();
    await page.locator('textarea').fill('Uma fração com o mesmo valor');
    await page.getByRole('button', { name: 'Entregar e corrigir' }).click();
    await page.getByText('Teste corrigido.').waitFor();
    await page.waitForTimeout(600);
    await shot('20-teste-corrigido');
  });

  await step('flashcards', async () => {
    await page.goto(base + '/testes/flashcards');
    await page.getByRole('button', { name: 'Novo baralho' }).first().click();
    await page.getByRole('dialog').getByPlaceholder(/Capitais/).fill('Frações');
    await page.getByRole('dialog').getByRole('button', { name: 'Criar com IA' }).click();
    await page.waitForURL(/\/flashcards\//);
    await page.getByRole('button', { name: /Rever 2 cartões/ }).click();
    await page.getByRole('button', { name: 'Ver resposta' }).click();
    await page.waitForTimeout(700);
    await shot('21-flashcard');
    await page.getByRole('button', { name: 'Sabia', exact: true }).click();
  });

  await step('modo de estudo', async () => {
    await page.goto(base + '/estudar');
    await page.getByRole('button', { name: 'Começar', exact: true }).click();
    await page.waitForTimeout(1300);
    await shot('22-modo-estudo');
    await page.getByRole('button', { name: 'Pausar' }).click();
  });

  await step('progresso e definições', async () => {
    await page.goto(base + '/progresso');
    await page.getByText('Minutos de estudo por dia').waitFor();
    await page.waitForTimeout(700);
    await shot('23-progresso');
    // Fechar um anúncio: não volta a aparecer ao recarregar.
    const promo = page.locator('aside.promo');
    if (await promo.count()) {
      const id = await promo.getAttribute('data-promo');
      await page.getByRole('button', { name: 'Fechar anúncio' }).click();
      await page.reload();
      await page.getByText('Minutos de estudo por dia').waitFor();
      await page.waitForTimeout(500);
      if (await page.locator(`aside.promo[data-promo="${id}"]`).count()) throw new Error('o anúncio fechado voltou a aparecer');
    }
    await page.goto(base + '/definicoes');
    await page.getByText('Perfil de estudante', { exact: true }).waitFor();
    await shot('24-definicoes');
  });

  await step('telemóvel (390 px)', async () => {
    const mctx = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: scale > 1 ? 3 : 2 });
    await mctx.addCookies(await ctx.cookies());
    const m = await mctx.newPage();
    m.on('pageerror', (e) => errors.push(e.message));
    const mshot = (n) => m.screenshot({ path: path.join(shots, `${n}.png`) });
    // Algum elemento visível sai da largura do ecrã? (ignora zonas com scroll próprio)
    const overflowing = () =>
      m.evaluate(() => {
        const w = window.innerWidth;
        const bad = [];
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (!r.width || r.right <= w + 1) continue;
          if (el.closest('.tabs, .day-strip, .md table, .md pre, .katex-display, .overlay, .toaster, svg')) continue;
          if (getComputedStyle(el).position === 'fixed') continue;
          bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} (${Math.round(r.right)}px)`);
        }
        return bad.slice(0, 3);
      });

    await m.goto(base + '/');
    await m.getByText('Plano de hoje').waitFor();
    await m.waitForTimeout(600);
    await mshot('m1-inicio');
    await m.getByText('Instala a STUDY AI no telemóvel').waitFor();

    for (const p of ['/', '/plano', '/plano/calendario', '/testes', '/testes/flashcards', '/testes/historico', '/progresso', '/planos', '/disciplinas', '/resumos', '/definicoes', '/estudar']) {
      await m.goto(base + p);
      await m.waitForTimeout(600);
      const bad = await overflowing();
      if (bad.length) throw new Error(`fora do ecrã em ${p}: ${bad.join(', ')}`);
    }

    // Chat em ecrã inteiro: sem barras da aplicação, com botão para voltar.
    await m.goto(base + '/chat');
    await m.getByText('Em que posso ajudar?').waitFor();
    if (await m.locator('.bottom-nav').isVisible()) throw new Error('a barra de baixo aparece no chat');
    await m.getByRole('link', { name: 'Voltar ao início' }).waitFor();
    await mshot('m2-chat');
    await m.getByLabel('Mensagem').fill('O que são frações equivalentes?');
    await m.getByRole('button', { name: 'Enviar' }).click();
    await m.getByRole('heading', { name: 'Frações equivalentes' }).waitFor({ timeout: 10000 });
    await m.waitForTimeout(400);
    await mshot('m2b-chat-resposta');

    // Plano: um dia de cada vez, com seletor de dias.
    await m.goto(base + '/plano');
    await m.locator('.day-pill').nth(1).click();
    await m.getByText(/^Terça,/).waitFor();
    await m.locator('.day-pill.today').click();
    await m.waitForTimeout(300);
    await mshot('m3-plano');
    if ((await m.locator('.week').count()) !== 0) throw new Error('a grelha da semana inteira aparece no telemóvel');

    await m.goto(base + '/planos');
    await m.waitForTimeout(500);
    await mshot('m4-planos');
    await m.getByRole('button', { name: 'Menu' }).click();
    await m.waitForTimeout(400);
    await mshot('m5-menu');

    // Aplicação instalável: manifesto, ícones e service worker.
    const manifest = await (await m.request.get(base + '/manifest.webmanifest')).json();
    if (manifest.display !== 'standalone' || !manifest.icons.some((i) => i.sizes === '512x512')) throw new Error('manifesto incompleto');
    for (const i of manifest.icons) {
      const r = await m.request.get(base + i.src);
      if (!r.ok()) throw new Error(`ícone em falta: ${i.src}`);
    }
    const sw = await m.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    if (!sw) throw new Error('o service worker não ficou registado');
    await mctx.close();
  });

  await step('usar sem conta (telemóvel)', async () => {
    const gctx = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: scale > 1 ? 3 : 2 });
    const g = await gctx.newPage();
    g.on('pageerror', (e) => errors.push(e.message));
    await g.goto(base);
    await g.waitForURL('**/criar-conta');
    await g.getByRole('button', { name: 'Experimentar sem conta' }).waitFor();
    await g.waitForTimeout(500);
    await g.screenshot({ path: path.join(shots, 'm0-criar-conta-ou-sem-conta.png') });
    await g.getByRole('button', { name: 'Experimentar sem conta' }).click();
    await g.waitForURL('**/questionario');
    // Responde ao questionário pela API (o questionário já foi testado acima) e vai às Definições.
    const q = await g.request.put(`${base}/api/profile/questionnaire`, {
      headers: { 'X-Requested-With': 'study-ai' },
      data: { questionnaire: { name: 'Rita', year: '7', subjects: ['portugues', 'matematica'], customSubjects: {}, difficult: ['matematica'], easy: [], dailyMinutes: 45, studyDays: [0, 2, 4], startTime: '17:30', goal: 'melhorar-notas', styles: ['exercicios'], tests: [] } },
    });
    if (!q.ok()) throw new Error(`questionário: ${q.status()}`);
    await g.goto(`${base}/definicoes#conta`);
    await g.getByText('Estás a usar a STUDY AI sem conta.').waitFor();
    await g.waitForTimeout(600);
    await g.screenshot({ path: path.join(shots, 'm6-definicoes-sem-conta.png') });
    await g.getByPlaceholder('nome@exemplo.pt').fill('rita@exemplo.pt');
    await g.getByPlaceholder('Pelo menos 8 caracteres').fill('estudar-sempre');
    await g.getByRole('button', { name: 'Criar conta e guardar os meus dados' }).click();
    await g.getByText('Conta criada! Os teus dados ficaram guardados.').waitFor();
    await g.locator('#conta').getByText('rita@exemplo.pt').waitFor();
    await g.screenshot({ path: path.join(shots, 'm7-conta-criada.png') });
    await gctx.close();
  });

  await step('cabeçalhos de segurança', async () => {
    for (const url of [`${base}/`, `${base}/plano/semana`]) {
      const r = await fetch(url);
      const csp = r.headers.get('content-security-policy') ?? '';
      if (!csp.includes("frame-ancestors 'none'") || r.headers.get('x-content-type-options') !== 'nosniff') throw new Error(`faltam cabeçalhos em ${url}`);
    }
    const api = await fetch(`${base}/api/me`);
    if (api.status !== 401 || api.headers.get('x-content-type-options') !== 'nosniff') throw new Error('a API não tem os cabeçalhos certos');
  });
} finally {
  await browser.close();
  server.kill();
  await fake.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
  fs.rmSync(persistDir, { recursive: true, force: true });
}

// O primeiro pedido /api/me antes de iniciar sessão responde 401 de propósito.
const relevant = errors.filter((e) => !/favicon|ResizeObserver loop|status of 401/.test(e));
if (relevant.length) {
  failed = true;
  console.error('Erros na consola do navegador:\n  ' + relevant.join('\n  '));
}
console.log(failed ? '\nFALHOU' : `\nTudo certo. Capturas em ${shots}`);
process.exit(failed ? 1 : 0);
