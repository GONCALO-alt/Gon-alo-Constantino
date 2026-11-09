// Teste ponta-a-ponta da aplicação Electron real (Playwright + Xvfb).
// Uso: xvfb-run -a node tests/e2e/app.e2e.cjs
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'tests/.out');
const SHOTS = path.join(OUT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'corte-home-'));
const ffmpeg = require(path.join(ROOT, 'node_modules/ffmpeg-static'));
const step = (s) => console.log('▶', s);

async function launch() {
  const app = await electron.launch({
    executablePath: require(path.join(ROOT, 'node_modules/electron')),
    args: [ROOT, '--no-sandbox'],
    env: { ...process.env, HOME, XDG_CONFIG_HOME: path.join(HOME, '.config') },
  });
  const win = await app.firstWindow();
  win.on('console', (m) => { if (m.type() === 'error') console.log('  [console]', m.text()); });
  win.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  await win.setViewportSize({ width: 1600, height: 960 });
  return { app, win };
}

const shot = (win, name) => win.screenshot({ path: path.join(SHOTS, name + '.png') });

(async () => {
  const media = ['a.mp4', 'b.mov', 'c.png', 'd.mp3'].map((f) => path.join(OUT, f));
  for (const m of media) if (!fs.existsSync(m)) throw new Error('Corra primeiro "npm test" para gerar a média de teste: ' + m);
  // vídeo MKV extra para testar proxies (VP9 em MKV + áudio Opus)
  const mkv = path.join(OUT, 'e.mkv');
  if (!fs.existsSync(mkv)) execFileSync(ffmpeg, ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc=s=1280x720:r=30:d=3', '-c:v', 'mpeg4', mkv]);

  let { app, win } = await launch();
  step('Página inicial');
  await win.waitForSelector('text=Novo projeto');
  await shot(win, '01_home');

  step('Novo projeto 16:9');
  await win.click('.new-card >> text=Novo projeto');
  await win.waitForSelector('.timeline');

  step('Importar ficheiros (diálogo simulado)');
  await app.evaluate(({ dialog }, files) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: files }); }, [...media, mkv]);
  await win.click('.panel-head >> text=Importar');
  await win.waitForFunction(() => document.querySelectorAll('.media-card').length >= 5, null, { timeout: 30000 });
  await win.waitForTimeout(2500);
  await shot(win, '02_library');

  step('Adicionar clips à timeline');
  const card = (name) => win.locator('.media-card', { hasText: name });
  await card('a.mp4').dblclick();
  await card('b.mov').dblclick();
  await card('c.png').dblclick();
  await card('d.mp3').locator('.add').click({ force: true });
  await win.waitForFunction(() => document.querySelectorAll('.clip').length >= 4);

  step('Texto com predefinição "Título animado"');
  await win.click('.rail-btn:has-text("Texto")');
  await win.click('.text-preset:has-text("Título animado")');
  await win.waitForFunction(() => document.querySelectorAll('.clip.text').length >= 1);

  step('Selecionar 2.º clip e aplicar transição dissolver + filtro');
  const clips = win.locator('.lane .clip.video');
  await clips.nth(1).click({ position: { x: 30, y: 20 } });
  await win.click('.rail-btn:has-text("Transições")');
  await win.click('.tile:has-text("Dissolver")');
  await win.click('.rail-btn:has-text("Filtros")');
  await clips.nth(0).click({ position: { x: 30, y: 20 } });
  await win.click('.tile:has-text("Cinema")');
  await win.click('.rail-btn:has-text("Efeitos")');
  await win.click('.tile:has-text("Vinheta")');

  step('Dividir no cursor (tecla S) e desfazer/refazer');
  await win.evaluate(() => document.querySelector('.ruler').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: document.querySelector('.ruler').getBoundingClientRect().left + 160, clientY: 10 })));
  await win.mouse.up();
  const before = await win.locator('.lane .clip').count();
  await win.keyboard.press('Escape');
  await win.keyboard.press('s');
  await win.waitForTimeout(300);
  const after = await win.locator('.lane .clip').count();
  console.log(`   clips: ${before} → ${after} após dividir`);
  if (after <= before) throw new Error('dividir não funcionou');
  await win.keyboard.press('Control+z');
  await win.waitForTimeout(200);
  if ((await win.locator('.lane .clip').count()) !== before) throw new Error('desfazer falhou');
  await win.keyboard.press('Control+Shift+z');
  await win.waitForTimeout(200);
  if ((await win.locator('.lane .clip').count()) !== after) throw new Error('refazer falhou');

  step('Keyframes de escala no texto');
  await win.locator('.lane .clip.text').first().click();
  await win.waitForSelector('.inspector .tab:has-text("Básico")');
  await win.click('.inspector .tab:has-text("Básico")');
  await win.locator('.inspector .kf').first().click();
  await win.waitForTimeout(200);
  await shot(win, '03_editor');

  step('Reproduzir 1.5 s e verificar a pré-visualização');
  await win.keyboard.press('Home');
  await win.keyboard.press('Space');
  await win.waitForTimeout(1500);
  console.log('   pool:', await win.evaluate(() => JSON.stringify(Array.from(window.__corte.player.pool.values()).map((e) => ({ k: e.kind, p: e.el.paused, t: +e.el.currentTime.toFixed(2), rs: e.el.readyState, s: e.el.seeking, src: e.src.slice(-12) })))));
  await win.keyboard.press('Space');
  const t = await win.locator('.timecode b').innerText();
  console.log('   tempo após reprodução:', t);
  const lum = await win.evaluate(() => {
    const c = document.querySelector('.preview-canvas-box canvas');
    const gl = c.getContext('webgl2');
    const px = new Uint8Array(4 * 16);
    gl.readPixels(Math.floor(c.width / 2), Math.floor(c.height / 2), 4, 4, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return px.reduce((a, b) => a + b, 0) / px.length;
  });
  console.log('   luminância média do centro do canvas:', lum.toFixed(1));
  if (lum < 5) throw new Error('pré-visualização preta');
  await shot(win, '04_playing');

  step('Esperar autosave');
  await win.waitForSelector('text=Guardado', { timeout: 10000 });
  const projDir = path.join(await app.evaluate(({ app }) => app.getPath('documents')), 'Corte Studio', 'Projetos');
  const files = fs.readdirSync(projDir);
  console.log('   ficheiros de projeto:', files.join(', '));

  step('Exportar 4K UHD a 60 FPS');
  const outFile = path.join(OUT, 'app_export_4k60.mp4');
  if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
  await app.evaluate(({ dialog }, f) => { dialog.showSaveDialog = async () => ({ canceled: false, filePath: f }); }, outFile);
  await win.click('.topbar >> text=Exportar');
  await win.locator('.opt', { has: win.locator('b', { hasText: /^4K UHD$/ }) }).click();
  await win.locator('.opt', { has: win.locator('b', { hasText: /^60$/ }) }).click();
  await win.selectOption('.modal select >> nth=0', 'veryfast');
  await shot(win, '05_export_dialog');
  await win.click('.modal-foot >> text=Exportar');
  await win.waitForSelector('.big-progress', { timeout: 20000 });
  await win.waitForTimeout(4000);
  await shot(win, '06_export_progress');
  await win.waitForSelector('text=Exportação concluída', { timeout: 900000 });
  await shot(win, '07_export_done');
  const probe = execFileSync(require(path.join(ROOT, 'node_modules/ffprobe-static')).path, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,avg_frame_rate,codec_name', '-of', 'csv=p=0', outFile]).toString().trim();
  console.log('   ffprobe:', probe);
  if (!probe.includes('3840,2160') || !probe.includes('60/1')) throw new Error('exportação não é 4K60');
  await win.click('.modal-foot >> text=Fechar');

  step('Encerramento inesperado → recuperação');
  await win.locator('.lane .clip').first().click();
  await win.keyboard.press('Delete');
  await win.waitForSelector('text=Guardado', { timeout: 10000 });
  const pid = await app.evaluate(() => process.pid);
  process.kill(pid, 'SIGKILL');
  await new Promise((r) => setTimeout(r, 1000));
  ({ app, win } = await launch());
  await win.waitForSelector('text=Recuperar projeto', { timeout: 15000 });
  await shot(win, '08_recovery');
  await win.click('.modal-foot >> text=Recuperar');
  await win.waitForSelector('.timeline');
  console.log('   clips após recuperação:', await win.locator('.lane .clip').count());
  await app.close();
  console.log('✔ Teste E2E concluído com sucesso');
})().catch(async (e) => { console.error('✘', e); process.exit(1); });
