/* Exercício 5 — Simulador de partida */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;

  KMP.registerEx({
    id: 5,
    name: 'Simulador de Partida',
    short: 'Partida',
    cat: 'Partidas',
    icon: 'lights',
    est: 2,
    desc: 'As cinco luzes vermelhas acendem-se uma a uma. Quando se apagarem, arranca!',
    how: [
      'Toca em «Para a grelha» e espera pelas luzes.',
      'As 5 luzes acendem-se com intervalos de 1 segundo.',
      'Toca no ecrã assim que todas se apagarem. Tocar antes é falsa partida.',
    ],
    levels: {
      1: '5 partidas, apagam entre 0,5 e 2,5 s depois',
      2: '5 partidas, apagam entre 0,2 e 3 s depois',
      3: '7 partidas, intervalos irregulares entre luzes',
    },
    record: { key: 'bestMs', label: 'Melhor partida', lower: true, unit: 'ms' },
    run(stage, ctx) {
      const lv = ctx.level;
      const starts = lv === 3 ? 7 : 5;
      const times = [];
      let falseStarts = 0;
      let state = 'idle';
      let tOut = 0;
      let seqId = 0;

      stage.innerHTML = `<div class="st-wrap">
        <div class="st-gantry">${[0, 1, 2, 3, 4]
          .map(() => '<div class="st-col"><span class="st-l"></span><span class="st-l"></span></div>')
          .join('')}</div>
        <div class="st-read mono">— ms</div>
        <div class="st-msg">Toca para ir para a grelha</div>
        <div class="st-list"></div>
      </div>`;
      const wrap = stage.firstElementChild;
      const cols = U.$$('.st-col', stage);
      const read = stage.querySelector('.st-read');
      const msg = stage.querySelector('.st-msg');
      const list = stage.querySelector('.st-list');
      ctx.hud('0/' + starts);

      const setLights = (n) => cols.forEach((c, i) => c.classList.toggle('on', i < n));
      const renderList = () =>
        (list.innerHTML = times
          .map((t) => {
            const best = t === Math.min(...times);
            return `<span class="st-chip ${best ? 'pb' : ''}">${Math.round(t)}</span>`;
          })
          .join(''));

      const sequence = async () => {
        const my = ++seqId;
        state = 'lights';
        wrap.classList.remove('bad');
        read.textContent = '— ms';
        msg.textContent = 'Concentra-te…';
        setLights(0);
        await ctx.scope.wait(U.rand(800, 1400));
        for (let n = 1; n <= 5; n++) {
          if (my !== seqId) return;
          setLights(n);
          KMP.sound.light();
          await ctx.scope.wait(lv === 3 ? U.rand(700, 1300) : 1000);
        }
        if (my !== seqId) return;
        const hold = lv === 1 ? U.rand(500, 2500) : U.rand(200, 3000);
        await ctx.scope.wait(hold);
        if (my !== seqId || state !== 'lights') return;
        setLights(0);
        msg.textContent = '';
        state = 'out-pending';
        ctx.scope.raf(() => {
          tOut = performance.now();
          if (state === 'out-pending') state = 'out';
        });
      };

      const onTap = (e) => {
        e.preventDefault();
        const now = performance.now();
        if (state === 'idle' || state === 'result') {
          if (times.length >= starts) return;
          sequence();
          return;
        }
        if (state === 'lights') {
          seqId++;
          falseStarts++;
          state = 'result';
          KMP.sound.err();
          setLights(0);
          wrap.classList.add('bad');
          read.textContent = 'FALSA PARTIDA';
          msg.textContent = 'Arrancaste antes de as luzes se apagarem. Toca para repetir.';
          return;
        }
        if (state === 'out') {
          const rt = now - tOut;
          times.push(rt);
          state = 'result';
          KMP.sound.go();
          read.textContent = Math.round(rt) + ' ms';
          renderList();
          ctx.hud(times.length + '/' + starts);
          if (times.length >= starts) {
            msg.textContent = 'Corrida terminada!';
            ctx.scope.timeout(done, 900);
          } else msg.textContent = rt < 250 ? 'Arranque fantástico! Toca para a próxima.' : 'Toca para a próxima partida.';
        }
      };
      ctx.scope.on(wrap, 'pointerdown', onTap);

      const done = () => {
        const avg = Math.round(U.mean(times));
        const best = Math.round(Math.min(...times));
        const score = U.clamp(U.scale(avg, 210, 480) - falseStarts * 10, 0, 100);
        ctx.finish({
          score,
          acc: starts / (starts + falseStarts),
          m: { bestMs: best, avgMs: avg, times: times.map(Math.round), falseStarts },
          lines: [
            ['Média', avg + ' ms'],
            ['Melhor', best + ' ms'],
            ['Falsas partidas', falseStarts],
          ],
          chart: { values: times.map(Math.round), unit: 'ms', invert: true, label: 'Partidas desta sessão' },
          tip:
            falseStarts > 1
              ? 'Muitas falsas partidas: reage ao apagar das luzes, não tentes adivinhar o momento.'
              : avg < 260
              ? 'Partidas muito fortes. Na grelha, mantém o mesmo ritual de respiração antes das luzes.'
              : 'Pé pronto, olhar fixo na última luz e respiração calma — reagir é mais rápido que pensar.',
        });
      };
    },
  });
})();
