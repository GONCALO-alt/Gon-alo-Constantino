/* Exercício 7 — Cálculo mental */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;

  /** Gera uma conta e a resposta certa (sempre inteira). */
  const gen = (lv) => {
    const ops = lv === 1 ? ['+', '−'] : ['+', '−', '×', '÷'];
    const op = U.pick(ops);
    let a;
    let b;
    let r;
    if (op === '+') {
      a = lv === 1 ? U.randint(2, 30) : lv === 2 ? U.randint(12, 80) : U.randint(35, 160);
      b = lv === 1 ? U.randint(2, 20) : lv === 2 ? U.randint(8, 60) : U.randint(25, 140);
      r = a + b;
    } else if (op === '−') {
      a = lv === 1 ? U.randint(8, 40) : lv === 2 ? U.randint(30, 100) : U.randint(80, 250);
      b = U.randint(2, a - 1);
      r = a - b;
    } else if (op === '×') {
      a = lv === 2 ? U.randint(2, 9) : U.randint(3, 15);
      b = lv === 2 ? U.randint(2, 9) : U.randint(4, 12);
      r = a * b;
    } else {
      b = lv === 2 ? U.randint(2, 9) : U.randint(3, 12);
      r = lv === 2 ? U.randint(2, 10) : U.randint(4, 15);
      a = b * r;
    }
    let text = `${a} ${op} ${b}`;
    // Nível Elite: por vezes, conta de dois passos.
    if (lv === 3 && Math.random() < 0.4) {
      const c = U.randint(2, 20);
      if (Math.random() < 0.5) {
        text = `${text} + ${c}`;
        r = r + c;
      } else if (r - c > 0) {
        text = `${text} − ${c}`;
        r = r - c;
      }
    }
    // Opções plausíveis: perto da resposta e com o mesmo último dígito.
    const opts = new Set([r]);
    const cands = U.shuffle([r + 1, r - 1, r + 2, r - 2, r + 10, r - 10, r + 5, r - 5, r + U.randint(3, 9), r - U.randint(3, 9)]).filter((x) => x >= 0);
    for (const c of cands) {
      if (opts.size >= 4) break;
      opts.add(c);
    }
    return { text, r, opts: U.shuffle(Array.from(opts)) };
  };

  KMP.registerEx({
    id: 7,
    name: 'Cálculo Mental',
    short: 'Cálculo',
    cat: 'Decisão',
    icon: 'calc',
    est: 3,
    desc: 'Resolve contas rápidas e escolhe a resposta certa entre quatro. Treina decisões rápidas sob pressão.',
    how: ['Lê a conta e escolhe a resposta certa.', 'Cada conta tem tempo limite: a barra vermelha mostra o tempo restante.', 'Mede-se a precisão e a velocidade.'],
    levels: {
      1: 'Adição e subtração simples · 10 s por conta',
      2: 'As quatro operações · 8 s por conta',
      3: 'Números maiores e contas de dois passos · 7 s por conta',
    },
    record: { key: 'accPct', label: 'Melhor precisão', lower: false, unit: '%' },
    run(stage, ctx) {
      const lv = ctx.level;
      const N = 15;
      const limit = [0, 10000, 8000, 7000][lv];
      let i = 0;
      let ok = 0;
      let timeouts = 0;
      const rts = [];
      let q = null;
      let t0 = 0;
      let locked = false;
      let timer = null;

      stage.innerHTML = `<div class="q-wrap">
        <div class="q-bar"><span></span></div>
        <div class="q-text mono"></div>
        <div class="q-opts"></div>
        <div class="q-fb"></div>
      </div>`;
      const bar = stage.querySelector('.q-bar span');
      const text = stage.querySelector('.q-text');
      const optsEl = stage.querySelector('.q-opts');
      const fb = stage.querySelector('.q-fb');

      const tick = () => {
        const left = 1 - (performance.now() - t0) / limit;
        bar.style.transform = `scaleX(${Math.max(left, 0)})`;
        if (left <= 0 && !locked) answer(null);
        else if (!locked) timer = ctx.scope.raf(tick);
      };

      const next = () => {
        if (i >= N) return done();
        q = gen(lv);
        locked = false;
        fb.textContent = '';
        text.textContent = q.text + ' = ?';
        optsEl.innerHTML = q.opts.map((o) => `<button class="btn opt mono" data-v="${o}">${o}</button>`).join('');
        ctx.hud(i + 1 + '/' + N);
        t0 = performance.now();
        tick();
      };

      const answer = (v) => {
        locked = true;
        const rt = performance.now() - t0;
        const right = v === q.r;
        if (v == null) timeouts++;
        else rts.push(rt);
        if (right) ok++;
        U.$$('.opt', optsEl).forEach((b) => {
          const bv = Number(b.dataset.v);
          if (bv === q.r) b.classList.add('right');
          else if (bv === v) b.classList.add('wrong');
          b.disabled = true;
        });
        fb.innerHTML = right ? `<span class="ok-t">Certo · ${U.fmtSec(rt)}</span>` : v == null ? '<span class="bad-t">Tempo esgotado</span>' : `<span class="bad-t">Errado — era ${q.r}</span>`;
        right ? KMP.sound.ok() : KMP.sound.err();
        i++;
        ctx.scope.timeout(next, right ? 550 : 1100);
      };

      ctx.scope.on(optsEl, 'click', (e) => {
        const b = e.target.closest('.opt');
        if (!b || locked) return;
        answer(Number(b.dataset.v));
      });

      const done = () => {
        const acc = ok / N;
        const avg = rts.length ? Math.round(U.mean(rts)) : limit;
        const score = Math.round(U.clamp(acc * 75 + U.scale(avg, limit * 0.2, limit * 0.8) * 0.25, 0, 100));
        ctx.finish({
          score,
          acc,
          m: { accPct: Math.round(acc * 100), avgMs: avg, ok, timeouts },
          lines: [
            ['Respostas certas', ok + ' de ' + N],
            ['Tempo médio', U.fmtSec(avg)],
            ['Tempo esgotado', timeouts],
          ],
          tip:
            acc >= 0.9
              ? 'Raciocínio rápido e certeiro. Na pista, isto traduz-se em decisões de ultrapassagem mais seguras.'
              : 'Prefere a precisão à pressa: uma decisão certa vale mais do que uma rápida e errada.',
        });
      };
      next();
    },
  });
})();
