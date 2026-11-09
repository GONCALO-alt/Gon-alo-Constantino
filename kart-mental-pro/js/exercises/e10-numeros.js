/* Exercício 10 — Memória de números */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;

  KMP.registerEx({
    id: 10,
    name: 'Memória de Números',
    short: 'Números',
    cat: 'Memória',
    icon: 'digits',
    est: 3,
    desc: 'Memoriza a sequência de números durante alguns segundos e escreve-a depois de desaparecer.',
    how: ['Os números aparecem durante pouco tempo.', 'Depois de desaparecerem, escreve-os pela mesma ordem.', 'Cada acerto acrescenta um número. Tens 2 vidas.'],
    levels: {
      1: 'Começa com 4 números · 1 s por número',
      2: 'Começa com 5 números · 0,7 s por número',
      3: 'Começa com 6 números · 0,5 s por número',
    },
    record: { key: 'maxLen', label: 'Recorde', lower: false, unit: 'dígitos' },
    run(stage, ctx) {
      const lv = ctx.level;
      let len = lv + 3;
      const perDigit = [0, 1000, 700, 500][lv];
      let lives = 2;
      let maxLen = 0;
      let rounds = 0;
      let okRounds = 0;
      let seq = '';
      let typed = '';
      let phase = 'show';

      stage.innerHTML = `<div class="num-wrap">
        <div class="num-msg">Memoriza</div>
        <div class="num-show mono"></div>
        <div class="num-count"><span></span></div>
        <div class="num-pad hidden">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, 'OK']
          .map((k) => `<button class="btn key mono ${k === 'OK' ? 'primary' : ''}" data-k="${k}">${k}</button>`)
          .join('')}</div>
        <div class="num-info"><span>Comprimento: <b class="num-len"></b></span><span>Vidas: <b class="num-lives">♥♥</b></span></div>
      </div>`;
      const msg = stage.querySelector('.num-msg');
      const show = stage.querySelector('.num-show');
      const count = stage.querySelector('.num-count span');
      const pad = stage.querySelector('.num-pad');
      const lenEl = stage.querySelector('.num-len');
      const livesEl = stage.querySelector('.num-lives');

      const round = async () => {
        rounds++;
        phase = 'show';
        seq = Array.from({ length: len }, () => U.randint(0, 9)).join('');
        typed = '';
        lenEl.textContent = len;
        ctx.hud(len + ' dígitos');
        pad.classList.add('hidden');
        msg.textContent = 'Memoriza';
        show.classList.remove('typed');
        show.textContent = '';
        await ctx.scope.wait(500);
        show.textContent = seq.replace(/(\d{3})(?=\d)/g, '$1 ');
        const dur = len * perDigit;
        count.style.transition = 'none';
        count.style.transform = 'scaleX(1)';
        void count.offsetWidth;
        count.style.transition = `transform ${dur}ms linear`;
        count.style.transform = 'scaleX(0)';
        await ctx.scope.wait(dur);
        show.textContent = '';
        msg.textContent = 'Escreve a sequência';
        show.classList.add('typed');
        renderTyped();
        pad.classList.remove('hidden');
        phase = 'input';
      };

      const renderTyped = () => {
        show.innerHTML = Array.from({ length: len }, (_, i) => `<span class="slot ${i < typed.length ? 'f' : ''}">${typed[i] || ''}</span>`).join('');
      };

      const check = () => {
        phase = 'check';
        pad.classList.add('hidden');
        if (typed === seq) {
          okRounds++;
          maxLen = Math.max(maxLen, len);
          KMP.sound.ok();
          msg.innerHTML = '<span class="ok-t">Certo!</span> +1 número';
          len++;
          ctx.scope.timeout(round, 1000);
        } else {
          lives--;
          livesEl.textContent = '♥'.repeat(lives) + '♡'.repeat(2 - lives);
          KMP.sound.err();
          msg.innerHTML = `<span class="bad-t">Era</span>`;
          show.classList.remove('typed');
          show.innerHTML = seq
            .split('')
            .map((d, i) => `<span class="${typed[i] === d ? 'ok-t' : 'bad-t'}">${d}</span>`)
            .join('');
          if (lives <= 0) ctx.scope.timeout(done, 1800);
          else ctx.scope.timeout(round, 2000);
        }
      };

      ctx.scope.on(pad, 'pointerdown', (e) => {
        const b = e.target.closest('.key');
        if (!b || phase !== 'input') return;
        e.preventDefault();
        const k = b.dataset.k;
        KMP.sound.tick();
        if (k === '⌫') typed = typed.slice(0, -1);
        else if (k === 'OK') {
          if (typed.length) return check();
        } else if (typed.length < len) {
          typed += k;
          if (typed.length === len) {
            renderTyped();
            return ctx.scope.timeout(check, 250);
          }
        }
        renderTyped();
      });

      const done = () => {
        const start = lv + 3;
        const score = U.clamp(U.scale(maxLen, start + 5, start - 1), 0, 100);
        ctx.finish({
          score,
          acc: rounds ? okRounds / rounds : null,
          m: { maxLen, rounds, okRounds },
          lines: [
            ['Maior sequência', maxLen ? maxLen + ' dígitos' : 'nenhuma'],
            ['Rondas certas', okRounds + ' de ' + rounds],
          ],
          tip:
            maxLen >= 8
              ? 'Memória de trabalho de alto nível — ideal para guardar tempos por setor e referências.'
              : 'Agrupa os números em blocos de 3 (como um número de telefone) e repete-os mentalmente.',
        });
      };

      round();
    },
  });
})();
