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
import { phone, startPushServer } from '../fake-push.ts';

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
const pushServer = await startPushServer();
const server = target === 'cloudflare'
  ? spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'dev', '--env', 'local', '--port', String(port), '--ip', '127.0.0.1', '--persist-to', persistDir,
      '--var', 'GEMINI_API_KEY:e2e', '--var', `GEMINI_BASE_URL:${fake.url}`, '--var', 'PUSH_ALLOW_LOCAL:1'], {
      cwd: root,
      env: { ...process.env, STUDY_AI_SKIP_BUILD: '1', WRANGLER_SEND_METRICS: 'false', NO_PROXY: '127.0.0.1,localhost', CI: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  : target === 'netlify'
  ? spawn(process.execPath, ['tools/netlify-local.mjs'], {
      cwd: root,
      env: { ...process.env, PORT: String(port), GEMINI_API_KEY: 'e2e', GEMINI_BASE_URL: fake.url, PUSH_ALLOW_LOCAL: '1' },
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

// Microfone simulado (para testar a voz no chat).
const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  const shot = (name) => page.screenshot({ path: path.join(shots, `${name}.png`) });
  // Medalhas novas aparecem numa janela de celebração: fecha-a e regista que apareceu.
  let celebrated = 0;
  await page.addLocatorHandler(page.getByRole('dialog').filter({ hasText: /Nova medalha!|medalhas novas!/ }), async (dialog) => {
    celebrated++;
    if (celebrated === 1) await page.screenshot({ path: path.join(shots, '23b-nova-medalha.png') });
    await dialog.getByRole('button', { name: 'Continuar' }).click();
  });

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
    // Medalhas: já ganhou algumas no percurso acima (resumo, teste, sessões) e houve celebração.
    const panel = page.locator('#medalhas');
    await panel.getByText(/Nível \d+ · /).waitFor();
    await panel.getByText('Desafios da semana').waitFor();
    if ((await panel.locator('.medal:not(.locked)').count()) < 1) throw new Error('nenhuma medalha ganha');
    if (!celebrated) throw new Error('a celebração de medalha nova não apareceu');
    await panel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await panel.screenshot({ path: path.join(shots, '23c-medalhas.png') });
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

  await step('microfone no chat', async () => {
    // a) Ditado do navegador (simulado): o texto aparece enquanto se fala.
    const vctx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
    await vctx.addCookies(await ctx.cookies());
    await vctx.addInitScript(() => {
      class FakeRecognition {
        start() {
          const said = (text, isFinal) => this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal })] });
          setTimeout(() => said('o que é uma', false), 150);
          setTimeout(() => said('o que é uma fração', true), 400);
          setTimeout(() => this.onend?.(), 500);
        }
        stop() { this.onend?.(); }
        abort() {}
      }
      window.SpeechRecognition = FakeRecognition;
      window.webkitSpeechRecognition = FakeRecognition;
    });
    const v = await vctx.newPage();
    v.on('pageerror', (e) => errors.push(e.message));
    await v.goto(`${base}/chat`);
    await v.getByLabel('Mensagem').fill('Pergunta:');
    await v.getByRole('button', { name: 'Falar (ditar a pergunta)' }).click();
    await v.getByText('A ouvir…').waitFor();
    const typed = () => v.evaluate(() => document.querySelector('textarea[aria-label="Mensagem"]')?.value);
    for (let i = 0; i < 30 && (await typed()) !== 'Pergunta: o que é uma fração'; i++) await v.waitForTimeout(200);
    if ((await typed()) !== 'Pergunta: o que é uma fração') throw new Error(`ditado: a caixa ficou com «${await typed()}»`);
    await vctx.close();

    // c) Modo conversa: fala → envia sozinho → lê a resposta em voz alta → volta a ouvir.
    const tctx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
    await tctx.addCookies(await ctx.cookies());
    await tctx.addInitScript(() => {
      window.__starts = 0;
      window.__spoken = [];
      class FakeRecognition {
        start() {
          window.__starts++;
          if (window.__starts > 1) return; // depois da primeira vez fica só à escuta
          setTimeout(() => this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: 'explica frações equivalentes' }], { isFinal: true })] }), 200);
          setTimeout(() => this.onend?.(), 300);
        }
        stop() { this.onend?.(); }
        abort() {}
      }
      window.SpeechRecognition = FakeRecognition;
      window.webkitSpeechRecognition = FakeRecognition;
      speechSynthesis.speak = (u) => {
        window.__spoken.push(u.text);
        setTimeout(() => u.onend?.(), 5);
      };
      speechSynthesis.cancel = () => {};
    });
    const t = await tctx.newPage();
    t.on('pageerror', (e) => errors.push(e.message));
    await t.goto(`${base}/chat`);
    await t.getByRole('button', { name: 'Modo conversa (falar e ouvir)' }).click();
    await t.getByText('Modo conversa: fala').waitFor();
    await t.getByRole('heading', { name: 'Frações equivalentes' }).waitFor({ timeout: 15000 });
    await t.waitForFunction(() => window.__spoken.some((x) => x.includes('Frações equivalentes')) && window.__starts >= 2, null, { timeout: 10000 });
    const spoken = await t.evaluate(() => window.__spoken.join(' '));
    if (/[*$#|\\]/.test(spoken)) throw new Error(`a leitura tem símbolos: ${spoken.slice(0, 120)}`);
    await t.getByRole('button', { name: 'Desligar o modo conversa' }).click();
    await t.getByRole('button', { name: 'Modo conversa (falar e ouvir)' }).waitFor({ timeout: 3000 });
    if (await t.getByText('A ouvir…').isVisible()) throw new Error('o microfone continuou ligado depois de desligar o modo conversa');
    await t.evaluate(() => (window.__spoken = []));
    await t.getByRole('button', { name: 'Ouvir', exact: true }).first().click();
    await t.getByRole('button', { name: 'Parar', exact: true }).waitFor().catch(() => {});
    await t.waitForFunction(() => window.__spoken.length > 0);
    await t.screenshot({ path: path.join(shots, '12b-ouvir-resposta.png') });

    // Modo ditado: frase a frase, com tempo para escrever.
    await t.evaluate(() => (window.__spoken = []));
    await t.getByRole('button', { name: 'Ditado', exact: true }).first().click();
    const dlg = t.getByRole('dialog');
    await dlg.getByText(/Frase 1 de \d+/).waitFor();
    await dlg.getByRole('button', { name: 'Rápida' }).click();
    await dlg.getByRole('button', { name: 'Começar' }).click();
    await t.waitForFunction(() => window.__spoken.some((x) => x.trim()));
    await dlg.getByText('tempo para escrever').waitFor();
    await dlg.getByText(/Frase 2 de \d+/).waitFor({ timeout: 8000 });
    const first = await t.evaluate(() => window.__spoken.filter((x) => x.trim())[0]);
    if (first !== 'Frações equivalentes.') throw new Error(`o ditado começou por «${first}»`);
    await t.waitForTimeout(200);
    await t.screenshot({ path: path.join(shots, '12c-ditado.png') });
    await dlg.getByRole('button', { name: 'Pausar' }).click();
    await dlg.getByRole('button', { name: 'Fechar' }).last().click();
    await tctx.close();

    // b) Sem ditado no navegador (como na app instalada no iPhone): grava e o servidor transcreve.
    if (gemini) {
      const rctx = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: scale > 1 ? 3 : 2, permissions: ['microphone'] });
      await rctx.addCookies(await ctx.cookies());
      await rctx.addInitScript(() => {
        delete window.webkitSpeechRecognition;
        delete window.SpeechRecognition;
      });
      const r = await rctx.newPage();
      r.on('pageerror', (e) => errors.push(e.message));
      await r.goto(`${base}/chat`);
      await r.getByRole('button', { name: 'Falar (ditar a pergunta)' }).click();
      await r.getByText(/A gravar 0:0\d/).waitFor();
      await r.waitForTimeout(1500);
      await r.screenshot({ path: path.join(shots, 'm8-a-gravar.png') });
      await r.getByRole('button', { name: 'Parar de ouvir' }).click();
      await r.waitForFunction(() => (document.querySelector('textarea[aria-label="Mensagem"]')?.value ?? '').includes('Frações equivalentes'), null, { timeout: 15000 });
      const sent = fake.requests.filter((x) => (x.body.contents?.[0]?.parts ?? []).some((p) => p.inlineData?.mimeType?.startsWith('audio/'))).at(-1);
      if (!sent) throw new Error('a gravação não chegou à IA');
      await rctx.close();
    }
  });

  await step('fotos da matéria, redações e calendário por foto (telemóvel)', async () => {
    if (!gemini) return; // a versão Node (Claude) não tem estas funções
    const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const fctx = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: scale > 1 ? 3 : 2 });
    await fctx.addCookies(await ctx.cookies());
    const f = await fctx.newPage();
    f.on('pageerror', (e) => errors.push(e.message));
    await f.addLocatorHandler(f.getByRole('dialog').filter({ hasText: /Nova medalha!|medalhas novas!/ }), (d) => d.getByRole('button', { name: 'Continuar' }).click());
    const noOverflow = async (where) => {
      const bad = await f.evaluate(() => [...document.querySelectorAll('main *')].filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && !el.closest('.tabs, .md table, .katex-display')).map((el) => el.className).slice(0, 3));
      if (bad.length) throw new Error(`${where}: sai do ecrã (${bad.join(', ')})`);
    };
    const upload = async (scope) => {
      await scope.locator('.photo-picker input[type=file]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });
      await scope.locator('.photo-thumb').first().waitFor();
      await f.waitForFunction(() => !document.querySelector('.photo-thumb .loading'));
    };

    // 1) Fotos da matéria → resumo, flashcards e teste.
    await f.goto(`${base}/testes/fotos`);
    await f.getByText('Fotografa a matéria').waitFor();
    await upload(f);
    await noOverflow('fotos da matéria');
    await f.screenshot({ path: path.join(shots, 'm10-fotos-materia.png') });
    await f.getByRole('button', { name: 'Criar a partir das fotos' }).click();
    await f.getByText('Feito a partir das tuas fotos').waitFor({ timeout: 20000 });
    await f.getByRole('link', { name: /Flashcards/ }).waitFor();
    await f.getByRole('link', { name: /Teste de preparação/ }).waitFor();
    await f.screenshot({ path: path.join(shots, 'm11-fotos-resultado.png') });

    // 2) Correção de uma redação escrita.
    await f.goto(`${base}/testes/redacoes`);
    await f.getByLabel(/A tua redação/).fill('A minha escola é grande e tem muitos alunos. Gosto de ir á biblioteca no intervalo, onde leio livros de aventuras com os meus amigos. Os professores são simpáticos e ajudam-nos sempre que temos dúvidas nas aulas de Matemática e de Português.');
    await noOverflow('redações');
    await f.getByRole('button', { name: 'Corrigir a redação' }).click();
    await f.waitForURL(/\/testes\/redacoes\/[0-9a-f-]+$/);
    await f.locator('.essay-grade').getByText('15').waitFor();
    await f.getByText('Contração da preposição').waitFor();
    await noOverflow('redação corrigida');
    await f.screenshot({ path: path.join(shots, 'm12-redacao-corrigida.png') });
    await f.goto(`${base}/testes/redacoes`);
    await f.getByRole('link', { name: /A minha escola/ }).waitFor();

    // 3) Calendário de testes por foto: ler, confirmar e marcar.
    await f.goto(`${base}/plano/calendario`);
    await f.getByRole('button', { name: 'Da foto' }).click();
    const dlg = f.getByRole('dialog');
    await upload(dlg);
    await dlg.getByRole('button', { name: 'Ler as datas' }).click();
    await dlg.getByText('Teste de Matemática').waitFor({ timeout: 15000 });
    await f.screenshot({ path: path.join(shots, 'm13-calendario-foto.png') });
    await dlg.getByRole('button', { name: /Marcar 1 no calendário/ }).click();
    await f.getByText(/1 data marcada no calendário/).waitFor();
    const evs = await f.request.get(`${base}/api/events`);
    const list = (await evs.json()).events;
    if (!list.some((e) => e.date === '2026-12-03' && e.subject === 'matematica')) throw new Error('o teste da foto não ficou no calendário');
    await fctx.close();
  });

  await step('lembretes no telemóvel', async () => {
    if (!gemini) return; // a versão Node não envia lembretes
    const device = phone(`${pushServer.url}/push/e2e`);
    const rctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, permissions: ['notifications'] });
    await rctx.addCookies(await ctx.cookies());
    // O Chromium de testes não tem serviço de notificações: simula a subscrição do telemóvel.
    await rctx.addInitScript((sub) => {
      let current = null;
      const fakeSub = { endpoint: sub.endpoint, toJSON: () => sub, unsubscribe: async () => ((current = null), true) };
      PushManager.prototype.subscribe = async () => (current = fakeSub);
      PushManager.prototype.getSubscription = async () => current;
      // Sem ecrã, o Chromium diz sempre «bloqueadas»: simula a autorização da pessoa.
      Object.defineProperty(Notification, 'permission', { get: () => 'granted' });
      Notification.requestPermission = async () => 'granted';
    }, device.sub);
    const r = await rctx.newPage();
    r.on('pageerror', (e) => errors.push(e.message));
    await r.goto(`${base}/definicoes#lembretes`);
    const card = r.locator('#lembretes');
    await card.waitFor({ timeout: 15000 }).catch(() => {});
    if (!(await card.getByText('Lembretes neste dispositivo').isVisible().catch(() => false))) {
      await r.waitForTimeout(1500);
      const txt = (await card.count()) ? await card.innerText() : `(sem cartão) features=${JSON.stringify((await (await r.request.get(`${base}/api/me`)).json()).features)}`;
      throw new Error(`cartão dos lembretes: ${txt.slice(0, 300)}`);
    }
    await card.getByRole('switch', { name: 'Lembretes neste dispositivo' }).click();
    await r.getByText('Lembretes ligados neste dispositivo').waitFor();
    await card.locator('select').first().selectOption('0');
    const before = pushServer.received.length;
    await card.getByRole('button', { name: 'Enviar teste' }).click();
    await r.getByText('Enviada!').waitFor();
    for (let i = 0; i < 30 && pushServer.received.length === before; i++) await r.waitForTimeout(100);
    const msg = JSON.parse(device.decrypt(pushServer.received.at(-1).body).text);
    if (msg.title !== 'Lembretes ligados ✅') throw new Error(`notificação errada: ${msg.title}`);
    const cfg = await (await r.request.get(`${base}/api/push/config`)).json();
    if (!cfg.subscribed || cfg.settings.minutesBefore !== 0) throw new Error('as preferências não ficaram guardadas');
    await card.scrollIntoViewIfNeeded();
    await r.waitForTimeout(300);
    await card.screenshot({ path: path.join(shots, '24b-lembretes.png') });
    await rctx.close();
  });

  await step('partilhar a app (QR Code)', async () => {
    const qctx = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: scale > 1 ? 3 : 2 });
    await qctx.addCookies(await ctx.cookies());
    const q = await qctx.newPage();
    q.on('pageerror', (e) => errors.push(e.message));
    await q.goto(base);
    await q.getByRole('button', { name: 'Menu' }).click();
    await q.getByRole('link', { name: /Mostrar QR Code da app/ }).click();
    // Abre logo em ecrã inteiro, para mostrar às outras pessoas.
    const full = q.getByRole('dialog', { name: /QR Code da STUDY AI em ecrã inteiro/ });
    await full.waitFor();
    if (!(await full.getByText(base.replace(/^https?:\/\//, '')).isVisible())) throw new Error('o QR Code em ecrã inteiro não mostra o endereço do site');
    await q.waitForTimeout(300);
    await q.screenshot({ path: path.join(shots, 'm9a-qr-ecra-inteiro.png') });
    await full.getByRole('button', { name: 'Fechar' }).click();
    await full.waitFor({ state: 'detached' });
    const card = q.locator('#partilhar');
    await card.locator('svg[role="img"]').waitFor();
    const shown = (await card.locator('.share-url').textContent())?.trim();
    if (shown !== base.replace(/^https?:\/\//, '')) throw new Error(`o QR Code aponta para «${shown}»`);
    await card.scrollIntoViewIfNeeded();
    await q.waitForTimeout(400);
    await card.screenshot({ path: path.join(shots, 'm9-qr-code.png') });
    // A imagem para imprimir abre dentro da app (no iPhone, ir para o Safari dava erro).
    await card.getByRole('button', { name: 'Imagem para imprimir' }).click();
    const img = q.getByRole('dialog').getByRole('img', { name: /Cartaz com o QR Code/ });
    await img.waitFor();
    if (!(await img.getAttribute('src'))?.startsWith('data:image/png')) throw new Error('a imagem do QR Code não foi criada');
    if (q.url().startsWith('blob:')) throw new Error('saiu da app');
    await q.getByText('Guardar nas Fotos').waitFor();
    await q.waitForTimeout(300);
    await q.screenshot({ path: path.join(shots, 'm9b-qr-imagem.png') });
    await qctx.close();
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
  await pushServer.close();
}

// O primeiro pedido /api/me antes de iniciar sessão responde 401 de propósito.
const relevant = errors.filter((e) => !/favicon|ResizeObserver loop|status of 401/.test(e));
if (relevant.length) {
  failed = true;
  console.error('Erros na consola do navegador:\n  ' + relevant.join('\n  '));
}
console.log(failed ? '\nFALHOU' : `\nTudo certo. Capturas em ${shots}`);
process.exit(failed ? 1 : 0);
