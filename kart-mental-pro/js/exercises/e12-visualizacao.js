/* Exercício 12 — Visualização mental guiada */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const C = () => KMP.circuits;

  /** Passos de uma volta guiada, com a fração do circuito onde o kart está. */
  const lapSteps = (circ, geo) => {
    const steps = [];
    const L = geo.len;
    const longStraight = circ.real ? 300 : 120;
    let prevEnd = 0;
    geo.corners.forEach((c, k) => {
      const at = Math.max(c.at, 0) / L;
      const mid = Math.max((c.at + c.end) / 2, 0) / L;
      const end = Math.min(Math.max(c.end, 0) / L, 1);
      const side = c.d === 'L' ? 'esquerda' : 'direita';
      const straight = c.straight || 0;
      let approach;
      if (straight >= longStraight)
        approach = `Reta longa${circ.real ? ' (cerca de ' + Math.round(straight / 10) * 10 + ' m)' : ''}: acelerador a fundo, corpo relaxado. Olha já para a referência de travagem da curva ${c.n}.`;
      else if (straight >= 30) approach = `Curta reta: posiciona-te do lado de fora, preparando a curva ${c.n} à ${side}.`;
      else approach = `Liga diretamente à curva ${c.n}, à ${side}. Mãos suaves, sem perder ritmo.`;
      if (c.zoneBefore) approach += ' É a zona de ultrapassagem: vê quem está à tua volta.';
      const brake = [
        'Sem travagem: levanta ligeiramente o pé e mantém a velocidade de passagem.',
        'Travagem média: trava a direito, curta e firme, e liberta antes de virar.',
        'Travagem forte: pressão máxima logo no início, depois liberta progressivamente até ao ponto de viragem.',
      ][c.brake];
      steps.push({ f: Math.max(at - 0.03, prevEnd), title: `Aproximação · Curva ${c.n}`, text: approach + ' ' + brake });
      steps.push({
        f: mid,
        title: `Curva ${c.n} · ${c.kind}`,
        text:
          c.kind === 'Gancho'
            ? 'Entra por fora, aponta para uma corda tardia. Sente o kart rodar e espera pela saída.'
            : c.kind === 'Curva rápida'
            ? 'Volante suave e preciso, olhar já na saída. Mantém a velocidade no ponto de corda.'
            : 'Aponta para o ponto de corda junto ao corretor interior. Sente a aderência dos pneus.',
      });
      steps.push({
        f: end,
        title: `Saída da curva ${c.n}`,
        text: `Abre o volante e acelera progressivamente, usando toda a largura da pista. ${k === geo.corners.length - 1 ? 'Reta da meta: respira e prepara a próxima volta.' : 'Olhar na próxima referência.'}`,
      });
      prevEnd = end;
    });
    return steps;
  };

  KMP.registerEx({
    id: 12,
    name: 'Visualização Mental',
    short: 'Visualização',
    cat: 'Visualização',
    icon: 'brain',
    est: 5,
    desc: 'Sessão guiada para imaginar voltas consistentes: travagens, curvas, trajetórias e concentração.',
    how: [
      'Escolhe a duração e o circuito. Senta-te confortável e, se puderes, usa auscultadores.',
      'Começa com respiração guiada. Depois, segue as instruções curva a curva e imagina cada detalhe.',
      'No fim, avalia a tua concentração e a nitidez das imagens.',
    ],
    levels: { 1: 'Instruções detalhadas', 2: 'Instruções detalhadas', 3: 'Instruções detalhadas' },
    record: { key: 'minutes', label: 'Sessão mais longa', lower: false, unit: 'min' },
    noCountdown: true,
    run(stage, ctx) {
      let dur = 5;
      let circId = 'alfa';
      let voice = KMP.store.state.settings.voice;
      const setup = () => {
        const all = C().all();
        stage.innerHTML = `<div class="vis-wrap scroll">
          <h3 class="sec-t">Duração</h3>
          <div class="seg-ctl" data-k="dur">${[3, 5, 10, 15].map((m) => `<button class="${m === dur ? 'on' : ''}" data-v="${m}">${m} min</button>`).join('')}</div>
          <h3 class="sec-t">Circuito</h3>
          <select class="input vis-circ">${C()
            .GROUPS.map(([gid, gname]) => {
              const list = all.filter((c) => c.group === gid);
              return list.length ? `<optgroup label="${gname}">${list.map((c) => `<option value="${c.id}" ${c.id === circId ? 'selected' : ''}>${U.esc(c.name)}</option>`).join('')}</optgroup>` : '';
            })
            .join('')}</select>
          <label class="switch-row"><span>Instruções por voz</span><input type="checkbox" class="vis-voice" ${voice ? 'checked' : ''}><i></i></label>
          <p class="muted small">A voz usa a síntese do iPhone. Confirma que o modo silencioso está desligado.</p>
          <button class="btn primary full big vis-start">Começar sessão</button>
        </div>`;
        ctx.hud('Preparar');
        U.$$('.seg-ctl', stage).forEach((g) =>
          ctx.scope.on(g, 'click', (e) => {
            const b = e.target.closest('button');
            if (!b) return;
            U.$$('button', g).forEach((x) => x.classList.toggle('on', x === b));
            if (g.dataset.k === 'dur') dur = Number(b.dataset.v);
            else circId = b.dataset.v;
          })
        );
        ctx.scope.on(stage.querySelector('.vis-circ'), 'change', (e) => (circId = e.target.value));
        ctx.scope.on(stage.querySelector('.vis-voice'), 'change', (e) => (voice = e.target.checked));
        ctx.scope.on(stage.querySelector('.vis-start'), 'click', start);
      };

      const say = (t) => {
        if (!voice) return;
        const prev = KMP.store.state.settings.voice;
        KMP.store.state.settings.voice = true;
        KMP.speak(t);
        KMP.store.state.settings.voice = prev;
      };

      const start = () => {
        const circ = C().get(circId) || C().all()[0];
        const { html, geo } = C().svg(circ, { dot: true, labels: true });
        const totalMs = dur * 60000;
        const introMs = Math.min(45000, totalMs * 0.2);
        const outroMs = 20000;
        const lapBudget = totalMs - introMs - outroMs;
        let steps = lapSteps(circ, geo);
        // Circuitos com muitas curvas: um passo por curva, para dar tempo de ler e imaginar.
        if (lapBudget / steps.length < 5500)
          steps = steps.filter((_, i) => i % 3 === 1).map((s, i) => Object.assign({}, s, { text: lapSteps(circ, geo)[i * 3].text + ' ' + s.text }));
        const laps = Math.max(1, Math.round(lapBudget / (steps.length * 7000)));
        const stepMs = lapBudget / (laps * steps.length);

        // Plano completo: respiração → voltas → fecho
        const plan = [];
        const breathe = [
          ['Respiração', 'Fecha os olhos ou fixa um ponto. Inspira pelo nariz durante 4 segundos…'],
          ['Respiração', 'Expira devagar durante 4 segundos. Solta os ombros e as mãos.'],
          ['Concentração', 'Imagina-te sentado no kart: o capacete, o volante nas mãos, o som do motor.'],
          ['Na grelha', `Estás no ${circ.name}. Vais fazer ${laps} ${laps > 1 ? 'voltas' : 'volta'} perfeitas e iguais.`],
        ];
        breathe.forEach((b) => plan.push({ ms: introMs / breathe.length, title: b[0], text: b[1], f: 0, breath: true }));
        for (let l = 1; l <= laps; l++)
          steps.forEach((s, i) => plan.push(Object.assign({}, s, { ms: stepMs, lap: l, title: s.title, text: i === 0 && l > 1 ? `Volta ${l}. Igual à anterior: mesmos pontos, mesma calma. ` + s.text : s.text })));
        plan.push({ ms: outroMs, title: 'Bandeira de xadrez', text: 'Abranda e respira fundo. Guarda a sensação desta volta consistente — é a tua referência para a pista.', f: 1, breath: true });

        stage.innerHTML = `<div class="vis-run">
          <div class="vis-map">${html}</div>
          <div class="vis-breath"><div class="vis-circle"></div></div>
          <div class="vis-step"><div class="vis-title"></div><div class="vis-text"></div></div>
          <div class="vis-prog"><span></span></div>
          <div class="row gap center"><button class="btn ghost small vis-pause">Pausa</button><button class="btn ghost small vis-skip">Terminar</button></div>
        </div>`;
        const dot = stage.querySelector('.circ-dot');
        const path = stage.querySelector('.circ-line');
        const plen = path.getTotalLength();
        const title = stage.querySelector('.vis-title');
        const text = stage.querySelector('.vis-text');
        const prog = stage.querySelector('.vis-prog span');
        const breathEl = stage.querySelector('.vis-breath');
        const mapEl = stage.querySelector('.vis-map');
        const pauseBtn = stage.querySelector('.vis-pause');
        // A fração do traçado no SVG inclui o fecho; ajusta para o comprimento real.
        const realFrac = geo.len / (geo.len + (geo.closing.length ? Math.hypot(...geo.pts[geo.pts.length - 1]) : 0));

        let idx = -1;
        let elapsed = 0;
        let stepStart = 0;
        let last = performance.now();
        let paused = false;
        const t0 = performance.now();
        let fFrom = 0;
        let fTo = 0;

        const enter = (i) => {
          idx = i;
          stepStart = elapsed;
          const p = plan[i];
          title.textContent = (p.lap ? `Volta ${p.lap}/${laps} · ` : '') + p.title;
          text.textContent = p.text;
          breathEl.classList.toggle('hidden', !p.breath);
          mapEl.classList.toggle('dim', !!p.breath);
          fFrom = fTo;
          fTo = p.f;
          if (p.lap && i > 0 && plan[i - 1].f - p.f > 0.5) fFrom = 0;
          say(p.text);
          KMP.sound.tick();
        };

        const loop = (now) => {
          const dt = now - last;
          last = now;
          if (!paused) elapsed += dt;
          let acc = 0;
          let i = 0;
          for (; i < plan.length; i++) {
            if (elapsed < acc + plan[i].ms) break;
            acc += plan[i].ms;
          }
          if (i >= plan.length) return finish(true);
          if (i !== idx) enter(i);
          const local = U.clamp((elapsed - stepStart) / plan[i].ms, 0, 1);
          const f = fFrom + (fTo - fFrom) * Math.min(local * 1.4, 1);
          const pt = path.getPointAtLength(f * realFrac * plen);
          dot.setAttribute('cx', pt.x);
          dot.setAttribute('cy', pt.y);
          prog.style.transform = `scaleX(${elapsed / totalMs})`;
          ctx.hud(U.fmtClock(Math.max(totalMs - elapsed, 0)));
          ctx.scope.raf(loop);
        };
        ctx.scope.raf(loop);

        ctx.scope.on(pauseBtn, 'click', () => {
          paused = !paused;
          pauseBtn.textContent = paused ? 'Continuar' : 'Pausa';
          if (paused) KMP.stopSpeak();
        });
        ctx.scope.on(stage.querySelector('.vis-skip'), 'click', () => finish(false));

        let finished = false;
        const finish = (complete) => {
          if (finished) return;
          finished = true;
          KMP.stopSpeak();
          rate(circ, elapsed, totalMs, complete);
        };
      };

      const rate = (circ, elapsed, totalMs, complete) => {
        let conc = 0;
        let clar = 0;
        stage.innerHTML = `<div class="vis-wrap">
          <h3 class="sec-t">Como correu?</h3>
          <p class="muted">Avalia com honestidade — isto ajuda a ver a tua evolução.</p>
          <div class="rate-row"><span>Concentração</span><div class="stars" data-k="c">${[1, 2, 3, 4, 5].map((n) => `<button data-v="${n}">★</button>`).join('')}</div></div>
          <div class="rate-row"><span>Nitidez das imagens</span><div class="stars" data-k="n">${[1, 2, 3, 4, 5].map((n) => `<button data-v="${n}">★</button>`).join('')}</div></div>
          <button class="btn primary full big vis-save" disabled>Guardar sessão</button>
        </div>`;
        ctx.hud('Avaliação');
        const save = stage.querySelector('.vis-save');
        U.$$('.stars', stage).forEach((g) =>
          ctx.scope.on(g, 'click', (e) => {
            const b = e.target.closest('button');
            if (!b) return;
            const v = Number(b.dataset.v);
            U.$$('button', g).forEach((x) => x.classList.toggle('on', Number(x.dataset.v) <= v));
            if (g.dataset.k === 'c') conc = v;
            else clar = v;
            save.disabled = !(conc && clar);
          })
        );
        ctx.scope.on(save, 'click', () => {
          const done = Math.min(elapsed / totalMs, 1);
          const minutes = Math.round((elapsed / 60000) * 10) / 10;
          const score = Math.round(done * 60 + ((conc + clar) / 10) * 40);
          ctx.finish({
            score,
            acc: null,
            m: { minutes, planned: totalMs / 60000, complete, conc, clar, circuit: circ.id },
            lines: [
              ['Circuito', circ.name],
              ['Tempo de visualização', U.fmtDur(elapsed)],
              ['Concluída', complete ? 'Sim' : Math.round(done * 100) + '%'],
              ['Concentração', conc + '/5'],
              ['Nitidez', clar + '/5'],
            ],
            tip:
              conc >= 4
                ? 'Ótima sessão. Repete esta visualização na véspera e no dia da corrida, antes de vestir o fato.'
                : 'É normal a mente divagar. Quando isso acontecer, volta à respiração e retoma na curva seguinte.',
          });
        });
      };

      setup();
    },
  });
})();
