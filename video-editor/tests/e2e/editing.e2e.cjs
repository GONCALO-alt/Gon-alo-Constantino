// Segundo teste E2E: ferramentas de edição e coerência pré-visualização ↔ exportação.
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'tests/.out');
const SHOTS = path.join(OUT, 'shots');
const ffmpeg = require(path.join(ROOT, 'node_modules/ffmpeg-static'));
const ffprobe = require(path.join(ROOT, 'node_modules/ffprobe-static')).path;
const step = (s) => console.log('▶', s);
const assert = (c, m) => { if (!c) throw new Error(m); };

(async () => {
  const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'corte-home-'));
  const app = await electron.launch({ executablePath: require(path.join(ROOT, 'node_modules/electron')), args: [ROOT, '--no-sandbox'], env: { ...process.env, HOME } });
  const win = await app.firstWindow();
  win.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  await win.setViewportSize({ width: 480, height: 940 });
  const zoom = (z) => win.evaluate((v) => window.__corte.editor.getState().setZoom(v), z);
  const state = () => win.evaluate(() => window.__corte.editor.getState().project);
  const stubOpen = (files) => app.evaluate(({ dialog }, f) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: f }); }, files);
  const stubSave = (file) => app.evaluate(({ dialog }, f) => { dialog.showSaveDialog = async () => ({ canceled: false, filePath: f }); }, file);
  const setNum = async (label, v) => {
    const inp = win.locator(`.sheet .field:has(.label > span:text-is("${label}")) .num`).first();
    await inp.click(); await inp.fill(String(v)); await inp.press('Enter');
  };

  await win.click('.new-card >> text=Novo projeto');
  await stubOpen(['red.png', 'a.mp4', 'd.mp3'].map((f) => path.join(OUT, f)));
  await win.click('.m-tool:has-text("Média")');
  await win.click('.sheet-head >> text=Importar');
  await win.waitForFunction(() => document.querySelectorAll('.media-card').length >= 3);

  step('Coerência de cor: imagem vermelha + brilho + temperatura + filtro "Quente"');
  await win.locator('.media-card', { hasText: 'red.png' }).dblclick();
  await win.click('.m-tool:has-text("Ajustar")');
  await setNum('Brilho', 30);
  await setNum('Temperatura', -60);
  await setNum('Contraste', 20);
  await win.click('.m-tool:has-text("Filtros")');
  await win.click('.tile:has-text("Quente")');
  await win.click('.m-tool:has-text("Transformar")');
  await setNum('Escala', 300); // ocupa todo o canvas
  await win.waitForTimeout(500);
  const prev = await win.evaluate(() => {
    const c = document.querySelector('.preview-canvas-box canvas'); const gl = c.getContext('webgl2');
    const px = new Uint8Array(4); gl.readPixels(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return Array.from(px).slice(0, 3);
  });
  const colorOut = path.join(OUT, 'color_check.mp4');
  await stubSave(colorOut);
  await win.click('.topbar >> text=Exportar');
  await win.locator('.opt', { has: win.locator('b', { hasText: /^720p$/ }) }).click();
  await win.click('.seg button:has-text("Qualidade constante")');
  await win.click('.modal-foot >> text=Exportar');
  await win.waitForSelector('text=Exportação concluída', { timeout: 120000 });
  await win.click('.modal-foot >> text=Fechar');
  const buf = execFileSync(ffmpeg, ['-v', 'error', '-ss', '1', '-i', colorOut, '-frames:v', '1', '-vf', 'crop=4:4:638:358,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  const exp = Array.from(buf.slice(0, 3));
  const diff = Math.max(...prev.map((v, i) => Math.abs(v - exp[i])));
  console.log(`   pré-visualização RGB=${prev}  exportação RGB=${exp}  diferença máx=${diff}`);
  assert(diff <= 14, 'cor da pré-visualização difere da exportação');

  step('Novo clip de vídeo e arrastar na timeline');
  await win.keyboard.press('Escape');
  await win.click('.m-tool:has-text("Média")');
  await win.locator('.media-card', { hasText: 'a.mp4' }).dblclick();
  let p = await state();
  let vid = p.clips.find((c) => c.type === 'video');
  await win.click('.sheet-head button[title="Fechar"]');
  await zoom(30);
  const vbox = await win.locator('.lane .clip.video').first().boundingBox();
  await win.mouse.move(vbox.x + vbox.width / 2, vbox.y + vbox.height / 2);
  await win.mouse.down();
  await win.mouse.move(vbox.x + vbox.width / 2 + 120, vbox.y + vbox.height / 2, { steps: 8 });
  await win.mouse.up();
  p = await state();
  const moved = p.clips.find((c) => c.id === vid.id);
  console.log(`   início ${vid.start.toFixed(2)} → ${moved.start.toFixed(2)}`);
  assert(moved.start > vid.start + 0.5, 'arrastar não moveu o clip');

  step('Aparar pela pega direita');
  await zoom(30);
  await win.waitForTimeout(200);
  const b2 = await win.locator('.lane .clip.video').first().boundingBox();
  await win.mouse.move(b2.x + b2.width - 3, b2.y + 20);
  await win.mouse.down();
  await win.mouse.move(b2.x + b2.width - 3 - b2.width / 3, b2.y + 20, { steps: 6 });
  await win.mouse.up();
  p = await state();
  const trimmed = p.clips.find((c) => c.id === vid.id);
  console.log(`   duração ${moved.duration.toFixed(2)} → ${trimmed.duration.toFixed(2)}`);
  assert(trimmed.duration < moved.duration - 0.5, 'aparar não funcionou');

  step('Velocidade 2× (fast motion)');
  await win.locator('.lane .clip.video').first().click({ position: { x: 20, y: 30 } });
  await win.click('.m-tool:has-text("Velocidade")');
  await win.click('.sheet .btn:text-is("2×")');
  p = await state();
  const fast = p.clips.find((c) => c.id === vid.id);
  console.log(`   velocidade ${fast.speed}, duração ${fast.duration.toFixed(2)}`);
  assert(fast.speed === 2 && Math.abs(fast.duration - trimmed.duration / 2) < 0.05, 'velocidade');

  step('Separar áudio e congelar fotograma');
  await win.evaluate((t) => window.__corte.playback.getState().seek(t), fast.start + 0.5);
  await win.click('.sheet-head button[title="Fechar"]');
  await win.click('.m-tool:has-text("Extrair áudio")');
  await win.click('.m-tool:has-text("Congelar")');
  await win.waitForFunction(() => window.__corte.editor.getState().project.clips.filter((c) => c.type === 'image').length >= 2, null, { timeout: 20000 });
  p = await state();
  console.log('   tipos:', p.clips.map((c) => c.type).join(', '));
  assert(p.clips.some((c) => c.type === 'audio' && c.linkId), 'áudio separado');

  step('Legendas: importar e exportar SRT');
  const srtIn = path.join(OUT, 'in.srt');
  fs.writeFileSync(srtIn, '1\n00:00:00,500 --> 00:00:02,000\nPrimeira frase\n\n2\n00:00:02,500 --> 00:00:04,000\nSegunda frase\n');
  await stubOpen([srtIn]);
  await win.keyboard.press('Escape');
  await win.click('.m-tool:has-text("Legendas")');
  await win.click('text=Importar SRT');
  await win.waitForSelector('.caption-row');
  const rows = await win.locator('.caption-row').count();
  await win.locator('.caption-row textarea').first().fill('Primeira frase editada');
  const srtOut = path.join(OUT, 'out.srt');
  await stubSave(srtOut);
  await win.click('text=Exportar SRT');
  await win.waitForTimeout(500);
  const srt = fs.readFileSync(srtOut, 'utf8');
  console.log(`   ${rows} legendas; SRT exportado:`, JSON.stringify(srt.slice(0, 60)));
  assert(rows === 2 && srt.includes('Primeira frase editada') && srt.includes('00:00:02,500 --> 00:00:04,000'), 'SRT');
  await win.screenshot({ path: path.join(SHOTS, '10_captions.png') });

  step('Histórico de versões');
  await win.click('.topbar button[title="Mais opções"]');
  await win.click('text=Histórico de versões');
  await win.waitForSelector('.modal-head:has-text("Histórico de versões")');
  await win.keyboard.press('Escape');

  step('Exportar H.265 1080p 25 FPS com legendas incorporadas');
  const hevc = path.join(OUT, 'app_export_hevc.mp4');
  await stubSave(hevc);
  await win.click('.topbar >> text=Exportar');
  await win.locator('.opt', { has: win.locator('b', { hasText: /^1080p$/ }) }).click();
  await win.locator('.opt', { has: win.locator('b', { hasText: /^25$/ }) }).click();
  await win.click('.seg button:has-text("H.265")');
  await win.click('.modal-foot >> text=Exportar');
  await win.waitForSelector('text=Exportação concluída', { timeout: 300000 });
  await win.screenshot({ path: path.join(SHOTS, '11_hevc_done.png') });
  const info = execFileSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,avg_frame_rate', '-of', 'csv=p=0', hevc]).toString().trim();
  console.log('   ffprobe:', info);
  assert(info.startsWith('hevc,1080,1920,25/1'), 'HEVC vertical');
  await app.close();
  console.log('✔ Teste E2E de edição concluído');
})().catch((e) => { console.error('✘', e); process.exit(1); });
