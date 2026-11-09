/* Exercício 2 — Tabela de Schulte (5x5) */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const TINTS = ['#ff4d4d', '#00d26a', '#00b4ff', '#ffd400', '#ffffff', '#c43dff', '#ff7a00'];

  KMP.registerEx({
    id: 2,
    name: 'Tabela de Schulte',
    short: 'Schulte',
    cat: 'Concentração',
    icon: 'grid',
    est: 2,
    desc: 'Encontra os números de 1 a 25 pela ordem, o mais rápido possível, sem mover o olhar do centro.',
    how: [
      'Fixa o olhar no centro da grelha e usa a visão periférica.',
      'Toca nos números por ordem crescente (no nível Elite, de 25 para 1).',
      'O cronómetro começa no primeiro toque certo e cada erro conta.',
    ],
    levels: {
      1: 'Números de 1 a 25, todos iguais',
      2: 'Cores e tamanhos diferentes para distrair',
      3: 'Ordem inversa (25 → 1) com cores e tamanhos diferentes',
    },
    record: { key: 'timeMs', label: 'Melhor tempo', lower: true, fmt: (v) => U.fmtSec(v) },
    run(stage, ctx) {
      const lv = ctx.level;
      const nums = U.shuffle(Array.from({ length: 25 }, (_, i) => i + 1));
      const order = lv === 3 ? Array.from({ length: 25 }, (_, i) => 25 - i) : Array.from({ length: 25 }, (_, i) => i + 1);
      let idx = 0;
      let errors = 0;
      let t0 = null;
      let tick = null;

      stage.innerHTML = `<div class="sch-wrap">
        <div class="sch-top"><div class="sch-next">Procura: <b>${order[0]}</b></div><div class="sch-time mono">0,00 s</div></div>
        <div class="sch-grid">${nums
          .map((n) => {
            const style = lv >= 2 ? `color:${U.pick(TINTS)};font-size:${U.randint(18, 30)}px` : '';
            return `<button class="sch-cell" data-n="${n}" style="${style}">${n}</button>`;
          })
          .join('')}<div class="sch-dot"></div></div>
        <div class="sch-err">Erros: <b>0</b></div></div>`;
      const nextEl = stage.querySelector('.sch-next b');
      const timeEl = stage.querySelector('.sch-time');
      const errEl = stage.querySelector('.sch-err b');
      ctx.hud('0/25');

      const loop = () => {
        timeEl.textContent = U.fmtSec(performance.now() - t0);
        tick = ctx.scope.raf(loop);
      };

      ctx.scope.on(stage.querySelector('.sch-grid'), 'pointerdown', (e) => {
        const b = e.target.closest('.sch-cell');
        if (!b || b.classList.contains('done')) return;
        e.preventDefault();
        const n = Number(b.dataset.n);
        if (n === order[idx]) {
          if (t0 == null) {
            t0 = performance.now();
            loop();
          }
          b.classList.add('done');
          KMP.sound.tick();
          idx++;
          ctx.hud(idx + '/25');
          if (idx >= 25) {
            const time = performance.now() - t0;
            cancelAnimationFrame(tick);
            timeEl.textContent = U.fmtSec(time);
            const target = lv === 1 ? 25000 : lv === 2 ? 30000 : 35000;
            const score = U.clamp(U.scale(time, target, target * 2.6) - errors * 3, 0, 100);
            ctx.scope.timeout(
              () =>
                ctx.finish({
                  score,
                  acc: 25 / (25 + errors),
                  m: { timeMs: Math.round(time), errors },
                  lines: [
                    ['Tempo', U.fmtSec(time)],
                    ['Erros', errors],
                    ['Ritmo', U.num(time / 25000, 2) + ' s por número'],
                  ],
                  tip:
                    time < target
                      ? 'Excelente varrimento visual. Na pista, isto ajuda a ler bandeiras e adversários sem desviar o olhar.'
                      : 'Tenta não "caçar" cada número com os olhos: mantém o olhar no centro e deixa a periferia trabalhar.',
                }),
              500
            );
          } else nextEl.textContent = order[idx];
        } else {
          errors++;
          errEl.textContent = errors;
          KMP.sound.err();
          b.classList.remove('wrong');
          void b.offsetWidth;
          b.classList.add('wrong');
        }
      });
    },
  });
})();
