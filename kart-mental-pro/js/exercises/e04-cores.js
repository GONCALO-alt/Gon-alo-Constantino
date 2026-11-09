/* Exercício 4 — Memória de cores */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const PADS = [
    { c: '#e10600', n: 'Vermelho' },
    { c: '#00d26a', n: 'Verde' },
    { c: '#00b4ff', n: 'Azul' },
    { c: '#ffd400', n: 'Amarelo' },
    { c: '#c43dff', n: 'Roxo' },
    { c: '#ff7a00', n: 'Laranja' },
  ];

  KMP.registerEx({
    id: 4,
    name: 'Memória de Cores',
    short: 'Cores',
    cat: 'Memória',
    icon: 'palette',
    est: 3,
    desc: 'Observa a sequência de cores e repete-a. Cada ronda certa acrescenta mais uma cor.',
    how: [
      'Observa as cores que se acendem, pela ordem.',
      'Quando aparecer «A tua vez», repete a sequência.',
      'Tens 2 vidas. O resultado é a maior sequência conseguida.',
    ],
    levels: {
      1: '4 cores, começa com 3, ritmo calmo',
      2: '6 cores, começa com 4',
      3: '6 cores, começa com 5, ritmo rápido',
    },
    record: { key: 'maxLen', label: 'Maior sequência', lower: false, unit: 'cores' },
    run(stage, ctx) {
      const lv = ctx.level;
      const pads = lv === 1 ? PADS.slice(0, 4) : PADS;
      const startLen = lv + 2;
      const onMs = lv === 1 ? 600 : lv === 2 ? 480 : 360;
      const gapMs = lv === 3 ? 160 : 230;
      let seq = [];
      let input = 0;
      let lives = 2;
      let maxLen = 0;
      let rounds = 0;
      let okRounds = 0;
      let busy = true;

      stage.innerHTML = `<div class="mem-wrap">
        <div class="mem-msg">Prepara-te…</div>
        <div class="mem-pads p${pads.length}">${pads.map((p, i) => `<button class="mem-pad" data-i="${i}" style="--c:${p.c}" aria-label="${p.n}"></button>`).join('')}</div>
        <div class="mem-info"><span>Sequência: <b class="mem-len">0</b></span><span>Vidas: <b class="mem-lives">♥♥</b></span></div>
      </div>`;
      const msg = stage.querySelector('.mem-msg');
      const lenEl = stage.querySelector('.mem-len');
      const livesEl = stage.querySelector('.mem-lives');
      const padEls = U.$$('.mem-pad', stage);

      const light = async (i, ms) => {
        padEls[i].classList.add('on');
        KMP.sound.pad(i);
        await ctx.scope.wait(ms);
        padEls[i].classList.remove('on');
      };

      const play = async () => {
        busy = true;
        stage.querySelector('.mem-pads').classList.add('locked');
        msg.textContent = 'Observa…';
        lenEl.textContent = seq.length;
        ctx.hud('Seq. ' + seq.length);
        await ctx.scope.wait(700);
        for (const i of seq) {
          await light(i, onMs);
          await ctx.scope.wait(gapMs);
        }
        msg.textContent = 'A tua vez!';
        input = 0;
        busy = false;
        stage.querySelector('.mem-pads').classList.remove('locked');
      };

      const newRound = (len) => {
        seq = Array.from({ length: len }, () => U.randint(0, pads.length - 1));
        rounds++;
        play();
      };

      ctx.scope.on(stage.querySelector('.mem-pads'), 'pointerdown', (e) => {
        const b = e.target.closest('.mem-pad');
        if (!b || busy) return;
        e.preventDefault();
        const i = Number(b.dataset.i);
        light(i, 180);
        if (i === seq[input]) {
          input++;
          if (input === seq.length) {
            busy = true;
            okRounds++;
            maxLen = Math.max(maxLen, seq.length);
            msg.textContent = 'Certo! +1 cor';
            KMP.sound.ok();
            ctx.scope.timeout(() => newRound(seq.length + 1), 700);
          }
        } else {
          busy = true;
          lives--;
          livesEl.textContent = '♥'.repeat(lives) + '♡'.repeat(2 - lives);
          KMP.sound.err();
          b.classList.add('wrong');
          ctx.scope.timeout(() => b.classList.remove('wrong'), 400);
          if (lives <= 0) {
            msg.textContent = 'Fim!';
            ctx.scope.timeout(done, 800);
          } else {
            msg.textContent = 'Errado — nova sequência do mesmo tamanho';
            ctx.scope.timeout(() => newRound(seq.length), 1200);
          }
        }
      });

      const done = () => {
        const target = startLen + 6;
        const score = U.clamp(U.scale(maxLen, target, startLen - 1), 0, 100);
        ctx.finish({
          score,
          acc: rounds ? okRounds / rounds : null,
          m: { maxLen, rounds, okRounds },
          lines: [
            ['Maior sequência', maxLen ? maxLen + ' cores' : 'nenhuma'],
            ['Rondas certas', okRounds + ' de ' + rounds],
          ],
          tip:
            maxLen >= startLen + 4
              ? 'Grande memória de trabalho. Usa-a para guardar referências de travagem volta após volta.'
              : 'Agrupa as cores em blocos de 2 ou 3 e diz-as mentalmente — é mais fácil lembrar blocos do que cores soltas.',
        });
      };

      ctx.scope.timeout(() => newRound(startLen), 600);
    },
  });
})();
