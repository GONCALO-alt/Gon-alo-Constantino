/* Exercício 11 — Memorização de circuitos */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const C = () => KMP.circuits;

  /** Gera as perguntas a partir da geometria do circuito. */
  const makeQuiz = (circ, geo, lv) => {
    const cs = geo.corners;
    const n = cs.length;
    const Q = [];
    const side = (c) => (c.d === 'L' ? 'Esquerda' : 'Direita');
    Q.push({ q: circ.real ? 'Quantas curvas principais estavam assinaladas no mapa?' : 'Quantas curvas tem o circuito?', opts: U.shuffle([n, n - 1, n + 1, n + 2].map(String)), a: String(n) });
    U.shuffle(cs)
      .slice(0, lv === 1 ? 2 : 3)
      .forEach((c) => Q.push({ q: `Para que lado é a curva ${c.n}?`, opts: ['Esquerda', 'Direita'], a: side(c) }));
    const kc = U.pick(cs);
    Q.push({ q: `Que tipo de curva é a curva ${kc.n}?`, opts: ['Curva rápida', 'Curva média', 'Gancho'], a: kc.kind });
    const strong = cs.filter((c) => c.brake === 2);
    if (strong.length) {
      const t = U.pick(strong);
      const others = U.shuffle(cs.filter((c) => c.brake < 2)).slice(0, 3);
      Q.push({ q: 'Em qual destas curvas há travagem forte?', opts: U.shuffle([t].concat(others)).map((c) => 'Curva ' + c.n), a: 'Curva ' + t.n });
    }
    const longest = geo.straights.slice().sort((a, b) => b.l - a.l)[0];
    if (longest) {
      const t = longest.before;
      const others = U.shuffle(cs.filter((c) => c !== t)).slice(0, 3);
      Q.push({ q: 'Que curva vem depois da reta mais longa?', opts: U.shuffle([t].concat(others)).map((c) => 'Curva ' + c.n), a: 'Curva ' + t.n });
    }
    const zone = geo.straights.find((s) => s.zone);
    if (zone && lv >= 2 && !(longest && longest.before === zone.before)) {
      const t = zone.before;
      const others = U.shuffle(cs.filter((c) => c !== t)).slice(0, 3);
      Q.push({ q: 'A zona de ultrapassagem principal termina na travagem para…', opts: U.shuffle([t].concat(others)).map((c) => 'Curva ' + c.n), a: 'Curva ' + t.n });
    }
    if (lv >= 2 && n >= 3) {
      const i = U.randint(0, n - 2);
      const c = cs[i + 1];
      Q.push({ q: `Depois da curva ${cs[i].n}, a curva seguinte é para…`, opts: ['Esquerda', 'Direita'], a: side(c) });
    }
    if (lv === 3) {
      const c = U.pick(cs);
      Q.push({ q: `Que travagem tem a curva ${c.n}?`, opts: C().brakeName.slice(), a: C().brakeName[c.brake] });
    }
    // Pergunta final: sequência completa de curvas (esquerda/direita).
    Q.push({ seq: true, q: 'Seleciona a sequência das curvas, da meta até ao fim da volta', a: cs.map((c) => c.d) });
    return Q;
  };

  KMP.registerEx({
    id: 11,
    name: 'Memorização de Circuitos',
    short: 'Circuitos',
    cat: 'Circuitos',
    icon: 'track',
    est: 6,
    desc: 'Estuda o mapa do circuito — curvas, travagens e zonas de ultrapassagem — e responde de memória.',
    how: [
      'Escolhe um circuito: Portimão, Estoril, pistas de Fórmula 1, traçados de karting ou o teu (podes desenhar a pista onde corres).',
      'Estuda o mapa: número, direção e tipo de cada curva, travagens (vermelho/laranja) e zona de ultrapassagem (verde).',
      'O mapa desaparece e respondes às perguntas, incluindo a sequência completa de curvas.',
    ],
    levels: {
      1: 'Estudo de 60 s · o contorno fica visível durante as perguntas',
      2: 'Estudo de 45 s · mapa escondido',
      3: 'Estudo de 30 s · mapa escondido e mais perguntas',
    },
    record: { key: 'accPct', label: 'Melhor precisão', lower: false, unit: '%' },
    run(stage, ctx) {
      const lv = ctx.level;
      const studyMs = [0, 60000, 45000, 30000][lv];

      const choose = () => {
        stage.innerHTML = `<div class="cir-wrap scroll">
          <h3 class="sec-t">Escolhe o circuito</h3>
          <div class="cir-list">${C().pickerHtml(
            (c) => `<button class="cir-item" data-id="${c.id}"><div class="cir-thumb">${C().svg(c, { plain: true }).html}</div>
              <div><b>${U.esc(c.name)}</b><small>${c.real ? U.esc(c.desc) + ' · ' : c.custom ? 'Personalizado · ' : ''}${C().geometry(c).corners.length} curvas${c.real ? ' principais' : ''}</small></div></button>`
          )}</div>
          <button class="btn ghost full" data-act="new">＋ Criar circuito personalizado</button>
        </div>`;
        ctx.hud('Escolher');
        ctx.scope.on(stage, 'click', onChoose);
      };
      const onChoose = (e) => {
        const b = e.target.closest('.cir-item');
        if (b) {
          stage.removeEventListener('click', onChoose);
          study(C().get(b.dataset.id));
        } else if (e.target.closest('[data-act="new"]')) {
          ctx.exit('#/circuitos/novo');
        }
      };

      const study = (circ) => {
        const { html, geo } = C().svg(circ);
        // Traçados com muitas curvas têm mais tempo de estudo.
        const studyFor = Math.round(studyMs * (geo.corners.length > 10 ? 1.5 : 1));
        stage.innerHTML = `<div class="cir-wrap">
          <div class="cir-head"><b>${U.esc(circ.name)}</b><span class="mono cir-timer"></span></div>
          <div class="cir-map">${html}</div>
          <div class="cir-legend"><span><i class="lg r"></i>Travagem forte</span><span><i class="lg o"></i>Média</span><span><i class="lg g"></i>Ultrapassagem</span></div>
          <div class="cir-corners scroll">${geo.corners
            .map((c) => `<div class="cc"><span class="cc-n">${c.n}</span><span>${c.d === 'L' ? '↰ Esquerda' : '↱ Direita'}</span><span>${c.kind}</span><span class="b${c.brake}">${C().brakeName[c.brake]}</span></div>`)
            .join('')}</div>
          ${circ.real ? `<p class="muted small cir-note">${U.esc(circ.place)} · curvas principais detetadas no traçado real. A numeração e as travagens são estimativas e podem não coincidir com as oficiais.</p>` : ''}
          <button class="btn primary full cir-go">Já memorizei</button>
        </div>`;
        const timerEl = stage.querySelector('.cir-timer');
        const t0 = performance.now();
        let gone = false;
        const go = () => {
          if (gone) return;
          gone = true;
          ctx.scope.clearInterval(iv);
          quiz(circ, geo, performance.now() - t0);
        };
        const iv = ctx.scope.interval(() => {
          const left = studyFor - (performance.now() - t0);
          timerEl.textContent = U.fmtClock(Math.max(left, 0));
          if (left <= 0) go();
        }, 200);
        timerEl.textContent = U.fmtClock(studyFor);
        ctx.hud('Estudo');
        ctx.scope.on(stage.querySelector('.cir-go'), 'click', go);
      };

      const quiz = (circ, geo, studied) => {
        const Q = makeQuiz(circ, geo, lv);
        let qi = 0;
        let pts = 0;
        let max = 0;
        const outline = lv === 1 ? `<div class="cir-mini">${C().svg(circ, { plain: true }).html}</div>` : '';
        const render = () => {
          const q = Q[qi];
          ctx.hud(qi + 1 + '/' + Q.length);
          if (q.seq) {
            let picked = [];
            stage.innerHTML = `<div class="cir-wrap">${outline}<div class="cir-q">${q.q}</div>
              <div class="seq-slots">${q.a.map((_, i) => `<span class="seq-s" data-i="${i}">${i + 1}</span>`).join('')}</div>
              <div class="row gap"><button class="btn big seq-b" data-d="L">↰ Esquerda</button><button class="btn big seq-b" data-d="R">↱ Direita</button></div>
              <button class="btn ghost small seq-undo">Desfazer</button></div>`;
            const slots = U.$$('.seq-s', stage);
            const paint = () =>
              slots.forEach((s, i) => {
                s.textContent = picked[i] ? (picked[i] === 'L' ? '↰' : '↱') : i + 1;
                s.classList.toggle('f', !!picked[i]);
              });
            ctx.scope.on(stage.querySelector('.seq-undo'), 'click', () => {
              picked.pop();
              paint();
            });
            U.$$('.seq-b', stage).forEach((b) =>
              ctx.scope.on(b, 'click', () => {
                if (picked.length >= q.a.length) return;
                picked.push(b.dataset.d);
                KMP.sound.tick();
                paint();
                if (picked.length === q.a.length) {
                  let good = 0;
                  slots.forEach((s, i) => {
                    const ok = picked[i] === q.a[i];
                    if (ok) good++;
                    s.classList.add(ok ? 'ok' : 'bad');
                    if (!ok) s.textContent = q.a[i] === 'L' ? '↰' : '↱';
                  });
                  pts += good;
                  max += q.a.length;
                  good === q.a.length ? KMP.sound.ok() : KMP.sound.err();
                  U.$$('.seq-b', stage).forEach((x) => (x.disabled = true));
                  ctx.scope.timeout(() => finish(circ, studied, pts, max, Q.length), 1800);
                }
              })
            );
            return;
          }
          stage.innerHTML = `<div class="cir-wrap">${outline}<div class="cir-q">${q.q}</div>
            <div class="q-opts ${q.opts.length === 2 ? 'two' : ''}">${q.opts.map((o) => `<button class="btn opt" data-v="${U.esc(o)}">${U.esc(o)}</button>`).join('')}</div><div class="q-fb"></div></div>`;
          const optsEl = stage.querySelector('.q-opts');
          ctx.scope.on(optsEl, 'click', function onc(e) {
            const b = e.target.closest('.opt');
            if (!b || optsEl.dataset.done) return;
            optsEl.dataset.done = 1;
            const ok = b.dataset.v === q.a;
            max++;
            if (ok) pts++;
            U.$$('.opt', optsEl).forEach((x) => {
              if (x.dataset.v === q.a) x.classList.add('right');
              else if (x === b) x.classList.add('wrong');
            });
            ok ? KMP.sound.ok() : KMP.sound.err();
            qi++;
            ctx.scope.timeout(render, ok ? 600 : 1300);
          });
        };
        render();
      };

      const finish = (circ, studied, pts, max) => {
        const acc = pts / max;
        const { html } = C().svg(circ);
        ctx.finish({
          score: Math.round(acc * 100),
          acc,
          m: { accPct: Math.round(acc * 100), circuit: circ.id, studyMs: Math.round(studied) },
          lines: [
            ['Circuito', circ.name],
            ['Respostas certas', pts + ' de ' + max],
            ['Tempo de estudo', U.fmtSec(studied)],
          ],
          extraHtml: `<div class="cir-map small">${html}</div>`,
          tip:
            acc >= 0.85
              ? 'Conheces bem o traçado. Antes de ires à pista, repete a volta de olhos fechados (Visualização Mental).'
              : 'Estuda o circuito por setores: meta → primeira travagem, zona técnica, regresso à meta.',
        });
      };

      choose();
    },
  });
})();
