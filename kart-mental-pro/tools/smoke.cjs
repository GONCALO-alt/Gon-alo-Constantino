// Teste automático: abre a app num iPhone simulado e joga os 12 exercícios até ao ecrã de resultados.
// Uso: (servir a pasta em http://localhost:8765) node tools/smoke.cjs [pasta-capturas] [ids]
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || '.';
const only = process.argv[3] ? process.argv[3].split(',').map(Number) : null;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message + '\n' + e.stack));
  p.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text()));
  await p.addInitScript(() => {
    if (!localStorage.getItem('kmp:v1'))
      localStorage.setItem('kmp:v1', JSON.stringify({ v: 1, settings: { onboarded: true, sound: false, voice: false, reminder: { on: false, time: '19:00' } }, sessions: [] }));
  });
  await p.goto('http://localhost:8765/');
  await p.waitForTimeout(300);
  const wait = (ms) => p.waitForTimeout(ms);
  const fb = async () => (await p.$('.fb')) != null;
  const down = (sel) => p.evaluate((sel) => document.querySelector(sel).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })), sel);
  const start = async (id) => {
    await p.evaluate((id) => KMP.runner.start(id, { mode: 'free' }), id);
    await wait(200);
    await p.click('.go-btn');
    await wait(id === 12 ? 300 : 2700);
  };
  const bots = {
    1: async () => {
      for (let k = 0; k < 400 && !(await fb()); k++) {
        const s = await p.$eval('.rx-area', (e) => e.dataset.s).catch(() => null);
        if (s === 'go') {
          await wait(250);
          await p.click('.rx-area');
        } else if (s === 'idle' || s === 'show' || s === 'bad') await p.click('.rx-area');
        await wait(150);
      }
    },
    2: async () => {
      await down('.sch-cell[data-n="7"]');
      for (let n = 1; n <= 25; n++) {
        await p.click(`.sch-cell[data-n="${n}"]`);
        await wait(30);
      }
      await wait(1000);
    },
    3: async () => {
      await p.click('.per-start');
      for (let k = 0; k < 12; k++) {
        await p.waitForSelector('.per-slot.flash', { timeout: 4000 });
        const key = Number(await p.$eval('.per-slot.flash', (e) => e.dataset.k));
        const pick = k % 4 === 3 ? (key + 2) % 8 : key;
        await down(`.per-slot[data-k="${pick}"]`);
        await wait(900);
      }
      await wait(500);
    },
    4: async () => {
      for (let r = 0; r < 30 && !(await fb()); r++) {
        await p.waitForFunction(() => /A tua vez|Fim/.test((document.querySelector('.mem-msg') || {}).textContent || '') || document.querySelector('.fb'), null, { timeout: 15000 });
        if (await fb()) break;
        if ((await p.textContent('.mem-msg')).includes('Fim')) {
          await wait(1200);
          break;
        }
        for (const i of [0, 1, 0, 1, 2]) await down(`.mem-pad[data-i="${i}"]`);
        await wait(1500);
      }
    },
    5: async () => {
      for (let k = 0; k < 600 && !(await fb()); k++) {
        const msg = await p.textContent('.st-msg');
        const lit = await p.$$eval('.st-col.on', (x) => x.length);
        if (/Toca/.test(msg)) await down('.st-wrap');
        else if (lit === 0 && msg === '') {
          await wait(230);
          await down('.st-wrap');
        }
        await wait(100);
      }
    },
    6: async () => {
      for (let r = 0; r < 5; r++) {
        await p.click('.trk-start');
        await p.waitForFunction(() => /Toca n/.test(document.querySelector('.trk-msg').textContent), null, { timeout: 20000 });
        const box = await p.$eval('canvas', (c) => {
          const r = c.getBoundingClientRect();
          return { x: r.left, y: r.top, w: r.width, h: r.height };
        });
        for (let t = 0; t < 40; t++) {
          await p.mouse.click(box.x + Math.random() * box.w, box.y + Math.random() * box.h);
          const done = await p.evaluate(() => !!document.querySelector('.fb') || !document.querySelector('.trk-start').classList.contains('hidden'));
          if (done) break;
        }
        await wait(300);
      }
      await wait(1600);
    },
    7: async () => {
      for (let k = 0; k < 15; k++) {
        await p.waitForSelector('.opt:not([disabled])');
        const o = await p.$$('.opt');
        await o[k % 4].click();
        await wait(1200);
      }
      await wait(500);
    },
    8: async () => {
      for (let k = 0; k < 20; k++) {
        await p.waitForFunction(() => document.querySelector('.stp-word').textContent.length > 0, null, { timeout: 5000 });
        await p.evaluate(() => {
          const c = document.querySelector('.stp-word').style.color;
          const b = KMP.u.$$('.stp-btn').find((x) => x.querySelector('i').style.background === c);
          b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        });
        await wait(450);
      }
      await wait(600);
    },
    9: async () => {
      await wait(500);
      await p.screenshot({ path: OUT + '/ex9-scene.png' });
      const box = await p.$eval('[data-w="a"]', (c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      });
      await p.mouse.click(box.x + 5, box.y + 5);
      await p.click('.dif-give');
      await wait(2600);
    },
    10: async () => {
      for (let r = 0; r < 6 && !(await fb()); r++) {
        await p.waitForSelector('.num-pad:not(.hidden)', { timeout: 15000 }).catch(() => {});
        if (await fb()) break;
        await down('.key[data-k="1"]');
        await down('.key[data-k="OK"]');
        await wait(2300);
      }
      await wait(1500);
    },
    11: async () => {
      await p.click('.cir-item[data-id="beta"]');
      await wait(300);
      await p.screenshot({ path: OUT + '/ex11-study.png' });
      await p.click('.cir-go');
      for (let k = 0; k < 15; k++) {
        if (await p.$('.seq-b')) {
          for (let j = 0; j < 7; j++) await p.click('.seq-b[data-d="R"]');
          break;
        }
        await p.click('.opt');
        await wait(1500);
      }
      await wait(2200);
    },
    12: async () => {
      await p.click('.vis-start');
      await wait(2500);
      await p.screenshot({ path: OUT + '/ex12-run.png' });
      await p.click('.vis-skip');
      await wait(300);
      await p.click('.stars[data-k="c"] button[data-v="4"]');
      await p.click('.stars[data-k="n"] button[data-v="3"]');
      await p.click('.vis-save');
      await wait(500);
    },
  };
  let fails = 0;
  for (const id of only || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    try {
      await start(id);
      await p.screenshot({ path: OUT + `/ex${id}-play.png` });
      await bots[id]();
      const ok = await fb();
      if (!ok) fails++;
      await p.screenshot({ path: OUT + `/ex${id}-fb.png` });
      const s = await p.evaluate((id) => KMP.data.sessionsOf(id).slice(-1)[0], id);
      console.log(id, ok ? 'OK' : 'SEM FEEDBACK', s ? JSON.stringify({ score: s.score, acc: s.acc, m: s.m }) : '');
      await p.evaluate(() => KMP.runner.close());
    } catch (e) {
      fails++;
      console.log(id, 'ERRO', e.message.split('\n')[0]);
      await p.screenshot({ path: OUT + `/ex${id}-err.png` });
      await p.evaluate(() => KMP.runner.close());
    }
  }
  await p.goto('http://localhost:8765/#/stats');
  await wait(400);
  await p.screenshot({ path: OUT + '/stats.png', fullPage: true });
  console.log(errs.join('\n') || 'sem erros na página');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
