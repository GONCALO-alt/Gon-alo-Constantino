// Teste do fluxo do programa: treino guiado, dia concluído, sábado (pista) e domingo (análise).
// Os exercícios são substituídos por versões instantâneas para testar só a navegação.
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  const check = (cond, msg) => {
    console.log((cond ? 'OK   ' : 'FALHA') + ' ' + msg);
    if (!cond) errs.push(msg);
  };
  await p.goto('http://localhost:8765/');
  await p.waitForTimeout(300);
  await p.fill('#onb-name', 'Gonçalo');
  await p.click('#onb-go');
  await p.waitForTimeout(300);
  check((await p.evaluate(() => KMP.store.state.profile.kartType)) === 'aluguer', 'perfil inicial: karting de aluguer');
  // Exercícios instantâneos
  await p.evaluate(() =>
    KMP.EX_ORDER.forEach((id) => {
      KMP.EX[id].noCountdown = true;
      KMP.EX[id].run = (stage, c) => c.scope.timeout(() => c.finish({ score: 85, acc: 0.9, m: { bestMs: 240, avgMs: 260, times: [240, 280], timeMs: 30000, maxLen: 6, accPct: 90, minutes: 5, found: 5, total: 5, wrong: 0, falseStarts: 0 }, lines: [['Teste', 1]], tip: 'ok' }), 50);
    })
  );
  await p.click('[data-guided="1"]');
  await p.waitForTimeout(200);
  check((await p.textContent('.run-title')).includes('Dia 1 · 1 de 2'), 'treino guiado começa no dia 1, exercício 1 de 2');
  await p.click('.go-btn');
  await p.waitForSelector('.fb');
  await p.waitForTimeout(1000);
  await p.screenshot({ path: OUT + '/flow-fb.png' });
  await p.click('.next-btn');
  await p.waitForTimeout(200);
  check((await p.textContent('.run-title')).includes('2 de 2'), 'botão «Próximo exercício» abre o 2.º');
  await p.click('.go-btn');
  await p.waitForSelector('.fb');
  check((await p.textContent('.fb')).includes('Dia 1 do programa concluído'), 'dia 1 concluído no feedback');
  await p.click('.done-btn');
  await p.waitForTimeout(300);
  check(await p.evaluate(() => KMP.program.isDone(1)), 'dia 1 marcado como feito');
  check(await p.evaluate(() => KMP.store.state.ach.first > 0), 'conquista «Primeira volta»');
  await p.screenshot({ path: OUT + '/flow-home-done.png', fullPage: true });

  // Recarregar: os dados persistem
  await p.reload();
  await p.waitForTimeout(300);
  check(await p.evaluate(() => KMP.store.state.sessions.length === 2 && KMP.program.isDone(1)), 'dados mantêm-se depois de fechar/abrir');

  // Programa começado há 6 dias: sábado = dia 5, domingo = dia 6 (hoje é segunda-feira 9/11/2026 no teste real)
  await p.evaluate(() => {
    KMP.program.start(KMP.u.addDays(KMP.u.ymd(), -6));
  });
  const kinds = await p.evaluate(() => [1, 2, 3, 4, 5, 6, 7].map((d) => KMP.program.day(d).kind + ':' + KMP.u.WD_SHORT[KMP.program.day(d).wd]));
  console.log('      dias:', kinds.join(' '));
  const sat = await p.evaluate(() => [1, 2, 3, 4, 5, 6, 7].find((d) => KMP.program.day(d).kind === 'review'));
  const sun = await p.evaluate(() => [1, 2, 3, 4, 5, 6, 7].find((d) => KMP.program.day(d).kind === 'rest'));
  await p.evaluate((d) => (location.hash = '#/pista/' + d), sat);
  await p.waitForTimeout(200);
  await p.fill('#tk-circ', 'Kartódromo de teste');
  await p.fill('#tk-laps', '20');
  await p.fill('#tk-best', '0:45.320');
  await p.click('#tk-feel button[data-v="4"]');
  await p.click('[data-act="save-track"]');
  await p.waitForTimeout(200);
  check(await p.evaluate((d) => KMP.program.isDone(d), sat), 'sábado concluído com treino real de kart');
  await p.evaluate((d) => (location.hash = '#/dia/' + d), sun);
  await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + '/flow-sunday.png', fullPage: true });
  await p.fill('#an-note', 'Trabalhar as partidas.');
  await p.click('[data-act="finish-rest"]');
  await p.waitForTimeout(200);
  check(await p.evaluate((d) => KMP.program.isDone(d), sun), 'domingo concluído com análise');
  await p.evaluate(() => (location.hash = '#/programa'));
  await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '/flow-program.png', fullPage: true });
  // Exportar / importar
  const json = await p.evaluate(() => KMP.store.export());
  await p.evaluate((j) => KMP.store.import(j), json);
  check(await p.evaluate(() => KMP.store.state.track.length === 1), 'exportar e importar cópia de segurança');
  // Circuito personalizado
  await p.evaluate(() => (location.hash = '#/circuitos/novo'));
  await p.waitForTimeout(200);
  await p.fill('#ce-name', 'Pista de casa');
  for (const a of ['ce-c', 'ce-s', 'ce-c', 'ce-s', 'ce-c', 'ce-c']) await p.click(`[data-act="${a}"]` + (a === 'ce-s' ? '[data-l="100"]' : ''));
  await p.screenshot({ path: OUT + '/flow-editor.png' });
  await p.click('[data-act="ce-save"]');
  await p.waitForTimeout(200);
  check(await p.evaluate(() => KMP.circuits.all().some((c) => c.name === 'Pista de casa')), 'circuito personalizado guardado');
  console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'sem erros');
  await b.close();
  process.exit(errs.length ? 1 : 0);
})();
