/**
 * Teste de fumo num navegador real (Chromium via Playwright), em ecrã de telemóvel
 * e de computador. Pressupõe `npm run build`. Uso: npm run test:e2e
 *  - verifica que não há deslocamento horizontal em ecrãs pequenos;
 *  - faz o primeiro exercício de uma lição;
 *  - confirma que o progresso sobrevive a recarregar a página;
 *  - confirma que a app e uma lição abrem sem internet (service worker);
 *  - guarda capturas em tests/e2e/screenshots (ignoradas pelo git).
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('Playwright não está disponível neste ambiente. Instale-o com "npm i -D playwright" para correr este teste.');
  process.exit(2);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const shots = join(root, 'tests/e2e/screenshots');
mkdirSync(shots, { recursive: true });
const PORT = 4179;
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'pipe' });
const base = `http://localhost:${PORT}/`;
const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? '✓' : '✗'} ${msg}`); };

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('O servidor de pré-visualização não arrancou.');
}

async function noHorizontalScroll(page, label) {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  check(sw <= cw, `${label}: sem deslocamento horizontal (${sw} ≤ ${cw})`);
}

try {
  await waitForServer();
  const browser = await chromium.launch();
  for (const vp of [{ name: 'telemovel', width: 360, height: 740 }, { name: 'computador', width: 1280, height: 800 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, locale: 'pt-PT' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base);
    await page.getByText('Começar a primeira lição').waitFor();
    await noHorizontalScroll(page, `${vp.name} / início`);
    await page.screenshot({ path: join(shots, `${vp.name}-inicio.png`), fullPage: true });

    await page.goto(`${base}#/curso/s1`);
    await page.getByRole('link', { name: /Olá e adeus/ }).waitFor();
    await noHorizontalScroll(page, `${vp.name} / mapa`);
    await page.screenshot({ path: join(shots, `${vp.name}-mapa.png`), fullPage: true });

    await page.goto(`${base}#/licao/s1-u01-l001`);
    await page.getByRole('button', { name: /Começar/ }).waitFor();
    await page.screenshot({ path: join(shots, `${vp.name}-licao-intro.png`), fullPage: true });
    await page.getByRole('button', { name: /Começar/ }).click();
    await page.getByRole('radio', { name: /hoi/ }).click();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await page.getByRole('status').waitFor();
    check((await page.getByRole('status').textContent()).match(/Certo|Muito bem|Exatamente|Correto/), `${vp.name}: feedback de resposta certa`);
    await noHorizontalScroll(page, `${vp.name} / exercício`);
    await page.screenshot({ path: join(shots, `${vp.name}-feedback.png`) });
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('textbox').fill('Até mais ver');
    await page.screenshot({ path: join(shots, `${vp.name}-traducao.png`) });

    // Persistência: grava um dia de estudo diretamente pela app (perfil) e recarrega.
    await page.goto(`${base}#/perfil`);
    await page.getByLabel(/Como quer ser tratado/).fill('Ana');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await page.getByText('Guardado.').waitFor();
    await page.reload();
    await page.goto(`${base}#/`);
    await page.getByText(/Ana!/).waitFor({ timeout: 5000 }).then(() => check(true, `${vp.name}: dados mantêm-se após recarregar`), () => check(false, `${vp.name}: dados mantêm-se após recarregar`));
    for (const route of ['revisao', 'estatisticas', 'definicoes']) {
      await page.goto(`${base}#/${route}`);
      await page.waitForTimeout(300);
      await noHorizontalScroll(page, `${vp.name} / ${route}`);
      await page.screenshot({ path: join(shots, `${vp.name}-${route}.png`), fullPage: true });
    }
    check(errors.length === 0, `${vp.name}: sem erros de JavaScript${errors.length ? ': ' + errors.join(' | ') : ''}`);
    await ctx.close();
  }

  // Sem internet: depois de guardar as lições, a app e uma lição abrem com a rede desligada.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-PT' });
    // Como o Netlify: /index.html redireciona para /.
    await ctx.route('**/index.html', (r) => r.fulfill({ status: 301, headers: { Location: base } }));
    const page = await ctx.newPage();
    await page.goto(base + '#/definicoes');
    await page.waitForSelector('text=Todas as lições estão guardadas', { timeout: 60000 });
    await ctx.setOffline(true);
    await page.goto(base + '#/licao/s1-u01-l001');
    await page.reload();
    await page.waitForSelector('text=Olá e adeus', { timeout: 10000 }).catch(() => {});
    check(((await page.textContent('body')) ?? '').includes('Olá e adeus'), 'sem internet: a app e uma lição abrem');
    await ctx.close();
  }
  await browser.close();
} catch (e) {
  failures.push(String(e));
  console.error(e);
} finally {
  server.kill();
}
console.log(failures.length ? `\n${failures.length} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
process.exit(failures.length ? 1 : 0);
