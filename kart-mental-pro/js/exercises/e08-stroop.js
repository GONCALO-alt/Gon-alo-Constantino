/* Exercício 8 — Teste Stroop */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const COLS = [
    { n: 'VERMELHO', c: '#ff3b30' },
    { n: 'VERDE', c: '#00d26a' },
    { n: 'AZUL', c: '#2f8cff' },
    { n: 'AMARELO', c: '#ffd400' },
  ];

  KMP.registerEx({
    id: 8,
    name: 'Teste Stroop',
    short: 'Stroop',
    cat: 'Concentração',
    icon: 'stroop',
    est: 2,
    desc: 'Indica a COR em que a palavra está escrita, não o que a palavra diz. Treina o controlo da atenção.',
    how: ['Aparece o nome de uma cor, pintado numa cor (às vezes diferente).', 'Toca no botão da cor da tinta — ignora o significado.', 'Responde depressa: há tempo limite.'],
    levels: {
      1: '30% de conflito · 3 s por palavra',
      2: '70% de conflito · 2,2 s por palavra',
      3: '80% de conflito, botões trocam de lugar · 1,6 s',
    },
    record: { key: 'accPct', label: 'Melhor precisão', lower: false, unit: '%' },
    run(stage, ctx) {
      const lv = ctx.level;
      const N = 20;
      const conflict = [0, 0.3, 0.7, 0.8][lv];
      const limit = [0, 3000, 2200, 1600][lv];
      let i = 0;
      let ok = 0;
      let okConflict = 0;
      let nConflict = 0;
      const rts = [];
      const rtsC = [];
      let cur = null;
      let t0 = 0;
      let locked = true;
      let order = COLS.slice();

      stage.innerHTML = `<div class="q-wrap">
        <div class="q-bar"><span></span></div>
        <div class="stp-word"></div>
        <div class="stp-opts"></div>
        <div class="q-fb"></div>
      </div>`;
      const bar = stage.querySelector('.q-bar span');
      const word = stage.querySelector('.stp-word');
      const opts = stage.querySelector('.stp-opts');
      const fb = stage.querySelector('.q-fb');

      const renderOpts = () =>
        (opts.innerHTML = order.map((c) => `<button class="btn stp-btn" data-c="${c.c}"><i style="background:${c.c}"></i>${c.n}</button>`).join(''));
      renderOpts();

      const tick = () => {
        if (locked) return;
        const left = 1 - (performance.now() - t0) / limit;
        bar.style.transform = `scaleX(${Math.max(left, 0)})`;
        if (left <= 0) answer(null);
        else ctx.scope.raf(tick);
      };

      const next = () => {
        if (i >= N) return done();
        const meaning = U.pick(COLS);
        const isConf = Math.random() < conflict;
        const ink = isConf ? U.pick(COLS.filter((c) => c !== meaning)) : meaning;
        cur = { meaning, ink, isConf };
        if (lv === 3) {
          order = U.shuffle(COLS);
          renderOpts();
        }
        word.textContent = meaning.n;
        word.style.color = ink.c;
        fb.textContent = '';
        ctx.hud(i + 1 + '/' + N);
        locked = false;
        t0 = performance.now();
        tick();
      };

      const answer = (c) => {
        locked = true;
        const rt = performance.now() - t0;
        const right = c === cur.ink.c;
        if (cur.isConf) nConflict++;
        if (right) {
          ok++;
          if (cur.isConf) okConflict++;
          rts.push(rt);
          if (cur.isConf) rtsC.push(rt);
          KMP.sound.ok();
          fb.innerHTML = `<span class="ok-t">${Math.round(rt)} ms</span>`;
        } else {
          KMP.sound.err();
          fb.innerHTML = c == null ? '<span class="bad-t">Tempo esgotado</span>' : `<span class="bad-t">A tinta era ${cur.ink.n.toLowerCase()}</span>`;
        }
        word.textContent = '';
        i++;
        ctx.scope.timeout(next, right ? 350 : 900);
      };

      ctx.scope.on(opts, 'pointerdown', (e) => {
        const b = e.target.closest('.stp-btn');
        if (!b || locked) return;
        e.preventDefault();
        answer(b.dataset.c);
      });

      const done = () => {
        const acc = ok / N;
        const avg = rts.length ? Math.round(U.mean(rts)) : limit;
        const score = Math.round(U.clamp(acc * 75 + U.scale(avg, 550, limit) * 0.25, 0, 100));
        ctx.finish({
          score,
          acc,
          m: { accPct: Math.round(acc * 100), avgMs: avg, avgConflictMs: rtsC.length ? Math.round(U.mean(rtsC)) : null, okConflict, nConflict },
          lines: [
            ['Respostas certas', ok + ' de ' + N],
            ['Tempo médio', avg + ' ms'],
            ['Certas com conflito', okConflict + ' de ' + nConflict],
          ],
          tip:
            acc >= 0.9
              ? 'Grande controlo da atenção: consegues ignorar distrações e responder ao que importa.'
              : 'Fixa-te só na cor da tinta. Se ajudar, desfoca ligeiramente o olhar para não "ler" a palavra.',
        });
      };
      ctx.scope.timeout(next, 500);
    },
  });
})();
