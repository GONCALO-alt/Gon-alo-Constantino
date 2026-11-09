/* Exercício 3 — Visão periférica */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const CENTER = ['A', 'K', 'X', 'H', 'E', 'M'];
  const POS8 = [
    { k: 0, x: 50, y: 8, n: 'cima' },
    { k: 1, x: 88, y: 20, n: 'cima-direita' },
    { k: 2, x: 92, y: 50, n: 'direita' },
    { k: 3, x: 88, y: 80, n: 'baixo-direita' },
    { k: 4, x: 50, y: 92, n: 'baixo' },
    { k: 5, x: 12, y: 80, n: 'baixo-esquerda' },
    { k: 6, x: 8, y: 50, n: 'esquerda' },
    { k: 7, x: 12, y: 20, n: 'cima-esquerda' },
  ];

  KMP.registerEx({
    id: 3,
    name: 'Visão Periférica',
    short: 'Periférica',
    cat: 'Visão',
    icon: 'eye',
    est: 3,
    desc: 'Mantém o olhar no símbolo central e deteta onde aparece o estímulo na periferia.',
    how: [
      'Olha sempre para o símbolo central — não mexas os olhos.',
      'Um estímulo pisca numa das posições à volta.',
      'Toca na posição onde apareceu. No nível Elite, indica também a letra central.',
    ],
    levels: {
      1: '4 posições, estímulo durante 500 ms',
      2: '8 posições, estímulo durante 250 ms',
      3: '8 posições, 150 ms, e tens de dizer qual era a letra central',
    },
    record: { key: 'accPct', label: 'Melhor precisão', lower: false, unit: '%' },
    run(stage, ctx) {
      const lv = ctx.level;
      const positions = lv === 1 ? POS8.filter((p) => p.k % 2 === 0) : POS8;
      const flashMs = lv === 1 ? 500 : lv === 2 ? 250 : 150;
      const trials = 12;
      let i = 0;
      let hits = 0;
      let centerHits = 0;
      const rts = [];
      let shownAt = 0;
      let phase = 'idle';
      let cur = null;
      let curCenter = null;

      stage.innerHTML = `<div class="per-wrap">
        <div class="per-field">
          ${positions.map((p) => `<button class="per-slot" data-k="${p.k}" style="left:${p.x}%;top:${p.y}%" aria-label="${p.n}"></button>`).join('')}
          <div class="per-center mono">+</div>
        </div>
        <div class="per-msg">Fixa o centro. Toca em «Iniciar».</div>
        <div class="per-choices hidden"></div>
        <button class="btn primary per-start">Iniciar</button>
      </div>`;
      const field = stage.querySelector('.per-field');
      const center = stage.querySelector('.per-center');
      const msg = stage.querySelector('.per-msg');
      const startBtn = stage.querySelector('.per-start');
      const choices = stage.querySelector('.per-choices');
      ctx.hud('0/' + trials);

      const next = async () => {
        if (i >= trials) return done();
        phase = 'fix';
        U.$$('.per-slot', field).forEach((s) => (s.className = 'per-slot'));
        curCenter = U.pick(CENTER);
        center.textContent = curCenter;
        msg.textContent = 'Olha para o centro…';
        await ctx.scope.wait(U.rand(700, 1600));
        cur = U.pick(positions);
        const slot = field.querySelector(`[data-k="${cur.k}"]`);
        slot.classList.add('flash');
        KMP.sound.tick();
        shownAt = performance.now();
        phase = 'answer';
        await ctx.scope.wait(flashMs);
        slot.classList.remove('flash');
        if (lv === 3) center.textContent = '•';
        if (phase === 'answer') msg.textContent = 'Onde apareceu?';
      };

      const askCenter = () => {
        phase = 'center';
        msg.textContent = 'Qual era a letra central?';
        const opts = U.shuffle([curCenter].concat(U.shuffle(CENTER.filter((c) => c !== curCenter)).slice(0, 3)));
        choices.innerHTML = opts.map((c) => `<button class="btn chip-btn mono" data-c="${c}">${c}</button>`).join('');
        choices.classList.remove('hidden');
      };

      const afterTrial = () => {
        i++;
        ctx.hud(i + '/' + trials);
        ctx.scope.timeout(next, 650);
      };

      ctx.scope.on(startBtn, 'click', () => {
        startBtn.remove();
        next();
      });
      ctx.scope.on(field, 'pointerdown', (e) => {
        const b = e.target.closest('.per-slot');
        if (!b || phase !== 'answer') return;
        e.preventDefault();
        const rt = performance.now() - shownAt;
        const k = Number(b.dataset.k);
        const ok = k === cur.k;
        rts.push(rt);
        const target = field.querySelector(`[data-k="${cur.k}"]`);
        target.classList.add('target');
        if (ok) {
          hits++;
          b.classList.add('hit');
          KMP.sound.ok();
          msg.textContent = 'Certo · ' + Math.round(rt) + ' ms';
        } else {
          b.classList.add('miss');
          KMP.sound.err();
          msg.textContent = 'Era ' + cur.n;
        }
        phase = 'wait';
        if (lv === 3) ctx.scope.timeout(askCenter, 350);
        else afterTrial();
      });
      ctx.scope.on(choices, 'click', (e) => {
        const b = e.target.closest('[data-c]');
        if (!b || phase !== 'center') return;
        phase = 'wait';
        if (b.dataset.c === curCenter) {
          centerHits++;
          KMP.sound.ok();
        } else KMP.sound.err();
        choices.classList.add('hidden');
        center.textContent = curCenter;
        afterTrial();
      });

      const done = () => {
        const acc = hits / trials;
        const avg = Math.round(U.mean(rts));
        const totalAcc = lv === 3 ? (hits + centerHits) / (trials * 2) : acc;
        const score = Math.round(U.clamp(totalAcc * 85 + U.scale(avg, 500, 1500) * 0.15, 0, 100));
        ctx.finish({
          score,
          acc: totalAcc,
          m: { accPct: Math.round(acc * 100), avgMs: avg, hits, centerHits },
          lines: [
            ['Posições certas', hits + ' de ' + trials],
            ['Tempo médio de resposta', avg + ' ms'],
          ].concat(lv === 3 ? [['Letra central certa', centerHits + ' de ' + trials]] : []),
          tip:
            acc >= 0.9
              ? 'Ótima leitura periférica: é o que te permite ver um kart a chegar ao lado sem tirar os olhos da trajetória.'
              : 'Resiste à tentação de procurar o estímulo com os olhos. Relaxa o olhar e "abre" o campo de visão.',
        });
      };
    },
  });
})();
