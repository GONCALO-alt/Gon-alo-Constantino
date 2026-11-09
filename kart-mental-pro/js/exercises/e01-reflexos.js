/* Exercício 1 — Teste de reflexos */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const COLORS = ['#00d26a', '#00b4ff', '#ffd400', '#ff7a00', '#c43dff', '#ffffff'];

  KMP.registerEx({
    id: 1,
    name: 'Teste de Reflexos',
    short: 'Reflexos',
    cat: 'Reflexos',
    icon: 'bolt',
    est: 2,
    desc: 'Toca no ecrã no instante em que a cor muda. Mede o tempo de reação em milissegundos.',
    how: [
      'Mantém o dedo perto do ecrã e olha para o centro.',
      'Quando o fundo mudar de cor, toca o mais rápido possível.',
      'Tocar antes da mudança conta como antecipação e a tentativa repete-se.',
    ],
    levels: {
      1: '5 tentativas',
      2: '8 tentativas, intervalos mais imprevisíveis',
      3: '8 tentativas com cores-armadilha: não toques no vermelho',
    },
    record: { key: 'bestMs', label: 'Melhor reação', lower: true, unit: 'ms' },
    run(stage, ctx) {
      const lv = ctx.level;
      const trials = lv === 1 ? 5 : 8;
      const times = [];
      let anticip = 0;
      let trapHits = 0;
      let trapsShown = 0;
      let state = 'idle'; // idle | wait | go | trap | show
      let t0 = 0;
      let goTimer = null;

      stage.innerHTML = `<div class="rx-area" data-s="idle"><div class="rx-big">Toca para começar</div><div class="rx-sub">Tentativa 1 de ${trials}</div></div>`;
      const area = stage.firstElementChild;
      const big = area.querySelector('.rx-big');
      const sub = area.querySelector('.rx-sub');
      const setHud = () => ctx.hud(`${times.length}/${trials}`);
      setHud();

      const arm = () => {
        state = 'wait';
        area.dataset.s = 'wait';
        area.style.background = '';
        big.textContent = 'Espera…';
        sub.textContent = lv === 3 ? 'Toca na mudança de cor — mas nunca no vermelho' : 'Toca quando a cor mudar';
        const delay = lv === 1 ? U.rand(1500, 3500) : U.rand(1000, 5000);
        // No nível 3, por vezes aparece primeiro uma cor-armadilha.
        const trap = lv === 3 && Math.random() < 0.35;
        goTimer = ctx.scope.timeout(() => (trap ? showTrap() : showGo()), delay);
      };
      const showTrap = () => {
        state = 'trap';
        trapsShown++;
        area.dataset.s = 'trap';
        area.style.background = '#e10600';
        big.textContent = 'NÃO TOQUES';
        sub.textContent = '';
        goTimer = ctx.scope.timeout(() => {
          state = 'wait';
          area.dataset.s = 'wait';
          area.style.background = '';
          big.textContent = 'Espera…';
          goTimer = ctx.scope.timeout(showGo, U.rand(700, 2200));
        }, 900);
      };
      const showGo = () => {
        const c = U.pick(COLORS);
        area.style.background = c;
        area.dataset.s = 'go';
        big.textContent = 'TOCA!';
        sub.textContent = '';
        // Medir a partir do momento em que a cor é pintada.
        ctx.scope.raf(() => {
          t0 = performance.now();
          state = 'go';
        });
        state = 'go-pending';
      };

      const finish = () => {
        const best = Math.min(...times);
        const avg = Math.round(U.mean(times));
        const sorted = times.slice().sort((a, b) => a - b);
        const consistency = Math.round(sorted[sorted.length - 1] - sorted[0]);
        let score = U.scale(avg, 200, 480) - anticip * 4 - trapHits * 8;
        score = U.clamp(score, 0, 100);
        const attempts = times.length + anticip + trapHits;
        ctx.finish({
          score,
          acc: attempts ? times.length / attempts : null,
          m: { bestMs: Math.round(best), avgMs: avg, times: times.map(Math.round), anticip, trapHits, trapsShown },
          lines: [
            ['Média', avg + ' ms'],
            ['Melhor', Math.round(best) + ' ms'],
            ['Pior', Math.round(sorted[sorted.length - 1]) + ' ms'],
            ['Variação', consistency + ' ms'],
            ['Antecipações', anticip],
          ].concat(lv === 3 ? [['Toques no vermelho', trapHits + ' de ' + trapsShown]] : []),
          chart: { values: times.map(Math.round), unit: 'ms', invert: true, label: 'Tempos desta sessão' },
          tip:
            avg < 250
              ? 'Reação de nível de competição. Mantém a consistência — é ela que ganha partidas.'
              : avg < 320
              ? 'Bom tempo. Tenta relaxar a mão: a tensão atrasa a resposta.'
              : 'Concentra o olhar num só ponto e antecipa a mudança sem tocar antes do tempo.',
        });
      };

      const onTap = (e) => {
        e.preventDefault();
        const now = performance.now();
        if (state === 'idle' || state === 'show') {
          if (times.length >= trials) return;
          arm();
          return;
        }
        if (state === 'wait' || state === 'go-pending') {
          if (state === 'go-pending') return; // a cor ainda não foi pintada
          clearTimeout(goTimer);
          anticip++;
          KMP.sound.err();
          state = 'show';
          area.dataset.s = 'bad';
          area.style.background = '';
          big.textContent = 'Antecipação!';
          sub.textContent = 'Tocaste antes da mudança. Toca para repetir.';
          return;
        }
        if (state === 'trap') {
          clearTimeout(goTimer);
          trapHits++;
          KMP.sound.err();
          state = 'show';
          area.dataset.s = 'bad';
          area.style.background = '';
          big.textContent = 'Era vermelho!';
          sub.textContent = 'Não devias tocar. Toca para continuar.';
          return;
        }
        if (state === 'go') {
          const rt = now - t0;
          times.push(rt);
          KMP.sound.tap();
          setHud();
          state = 'show';
          area.dataset.s = 'show';
          area.style.background = '';
          big.innerHTML = `${Math.round(rt)}<small> ms</small>`;
          if (times.length >= trials) {
            sub.textContent = 'Concluído!';
            ctx.scope.timeout(finish, 800);
          } else sub.textContent = `Tentativa ${times.length + 1} de ${trials} — toca para continuar`;
        }
      };
      ctx.scope.on(area, 'pointerdown', onTap);
    },
  });
})();
