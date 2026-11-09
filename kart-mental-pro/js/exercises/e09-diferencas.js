/* Exercício 9 — Encontra as diferenças (cenas de pista geradas aleatoriamente) */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const PAL = ['#e10600', '#00a5ff', '#ffd400', '#00c060', '#ff7a00', '#c43dff', '#ffffff', '#111111'];

  /* Desenho de cada tipo de objeto, com a base em (0,0). */
  const DRAW = {
    cloud: (o) => `<g fill="${o.c}"><ellipse cx="0" cy="-8" rx="18" ry="8"/><ellipse cx="-10" cy="-12" rx="9" ry="8"/><ellipse cx="8" cy="-14" rx="10" ry="9"/></g>`,
    sun: (o) => `<g><circle cx="0" cy="-14" r="11" fill="${o.c}"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="0" y1="-29" x2="0" y2="-34" stroke="${o.c}" stroke-width="2.5" transform="rotate(${a} 0 -14)"/>`).join('')}</g>`,
    tree: (o) => `<g><rect x="-3" y="-14" width="6" height="14" fill="#6b4226"/><circle cx="0" cy="-24" r="13" fill="${o.c}"/><circle cx="-7" cy="-18" r="8" fill="${o.c}"/><circle cx="7" cy="-18" r="8" fill="${o.c}"/></g>`,
    flag: (o) => `<g><rect x="-1.5" y="-40" width="3" height="40" fill="#ddd"/><path d="M1.5 -40 h20 l-5 7 l5 7 h-20 z" fill="${o.c}"/></g>`,
    sign: (o) => `<g><rect x="-2" y="-14" width="4" height="14" fill="#999"/><rect x="-15" y="-36" width="30" height="22" rx="3" fill="${o.c}" stroke="#fff" stroke-width="1.5"/><text x="0" y="-20" font-size="13" font-weight="800" text-anchor="middle" fill="${o.c === '#ffffff' || o.c === '#ffd400' ? '#111' : '#fff'}" font-family="Arial">${o.n}</text></g>`,
    tires: (o) => `<g fill="#1b1b1b" stroke="${o.c}" stroke-width="2.5"><ellipse cx="0" cy="-5" rx="12" ry="5"/><ellipse cx="0" cy="-13" rx="12" ry="5"/><ellipse cx="0" cy="-21" rx="12" ry="5"/></g>`,
    cone: (o) => `<g><rect x="-10" y="-3" width="20" height="3" fill="${o.c}"/><path d="M-7 -3 L0 -24 L7 -3 Z" fill="${o.c}"/><path d="M-4.6 -10 L4.6 -10 L3.4 -14 L-3.4 -14 Z" fill="#fff"/></g>`,
    barrel: (o) => `<g><rect x="-9" y="-24" width="18" height="24" rx="3" fill="${o.c}"/><rect x="-9" y="-17" width="18" height="3" fill="rgba(0,0,0,.35)"/><rect x="-9" y="-8" width="18" height="3" fill="rgba(0,0,0,.35)"/></g>`,
    bush: (o) => `<g fill="${o.c}"><circle cx="-8" cy="-7" r="7"/><circle cx="0" cy="-10" r="9"/><circle cx="9" cy="-7" r="7"/></g>`,
    kart: (o) =>
      `<g><rect x="-22" y="-8" width="10" height="8" rx="2" fill="#111"/><rect x="12" y="-8" width="10" height="8" rx="2" fill="#111"/><path d="M-24 -6 h48 l-4 -8 h-40 z" fill="${o.c}"/><circle cx="-2" cy="-20" r="6" fill="${o.h}"/><rect x="-3" y="-15" width="10" height="2" fill="#111"/><circle cx="12" cy="-10" r="4" fill="#fff"/><text x="12" y="-7.6" font-size="6.5" font-weight="800" text-anchor="middle" fill="#111" font-family="Arial">${o.n}</text></g>`,
  };
  const SIZE = { cloud: 18, sun: 18, tree: 20, flag: 18, sign: 18, tires: 15, cone: 13, barrel: 13, bush: 14, kart: 22 };

  const makeScene = () => {
    const items = [];
    const add = (type, x, y, extra) => items.push(Object.assign({ id: items.length, type, x, y, c: '#fff', s: 1, flip: 1, hidden: false }, extra || {}));
    add('cloud', U.randint(30, 70), 30, { c: '#ffffff' });
    add('sun', U.randint(140, 170), 40, { c: '#ffd400' });
    add('cloud', U.randint(230, 270), 26, { c: '#e9eef5' });
    const back = U.shuffle(['tree', 'flag', 'sign', 'tires', 'tree']);
    [32, 92, 152, 212, 270].forEach((x, i) => {
      const t = back[i];
      const ex = t === 'tree' ? { c: U.pick(['#1f8f3a', '#2aa84a', '#147a32']) } : t === 'sign' ? { c: U.pick(['#e10600', '#00a5ff', '#ffffff']), n: U.randint(1, 9) } : { c: U.pick(PAL.slice(0, 6)) };
      add(t, x + U.randint(-6, 6), 98, ex);
    });
    [62, 160, 250].forEach((x) =>
      add('kart', x + U.randint(-10, 10), 146 + U.randint(-3, 3), { c: U.pick(PAL.slice(0, 6)), h: U.pick(['#ffffff', '#ffd400', '#111111', '#00a5ff']), n: U.randint(1, 99) })
    );
    const front = U.shuffle(['cone', 'cone', 'tires', 'barrel', 'bush']);
    [28, 96, 160, 222, 280].forEach((x, i) => {
      const t = front[i];
      add(t, x + U.randint(-5, 5), 192, { c: t === 'cone' ? '#ff7a00' : t === 'bush' ? '#2aa84a' : U.pick(PAL.slice(0, 6)) });
    });
    return items;
  };

  /** Aplica uma alteração visível a um objeto; devolve descrição. */
  const mutate = (o, lv) => {
    const kinds = ['color', 'hide', 'scale', 'shift'];
    if (o.type === 'kart' || o.type === 'sign') kinds.push('number', 'number');
    if (o.type === 'flag' || o.type === 'kart') kinds.push('flip');
    const k = U.pick(kinds);
    if (k === 'color') o.c = U.pick(PAL.filter((c) => c !== o.c && c !== '#111111'));
    else if (k === 'hide') o.hidden = true;
    else if (k === 'scale') o.s = lv === 3 ? U.pick([0.78, 1.22]) : U.pick([0.65, 1.4]);
    else if (k === 'shift') o.x += (Math.random() < 0.5 ? -1 : 1) * (lv === 3 ? 9 : 14);
    else if (k === 'number') o.n = o.type === 'kart' ? ((o.n + U.randint(10, 60)) % 99) + 1 : (o.n % 9) + 1;
    else if (k === 'flip') o.flip = -1;
    return k;
  };

  const render = (items, found) => {
    const bg = `<defs><linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#16324f"/><stop offset="1" stop-color="#3c6e91"/></linearGradient></defs>
      <rect width="300" height="200" fill="url(#sky)"/><rect y="98" width="300" height="102" fill="#1e6b2f"/>
      <rect y="112" width="300" height="44" fill="#3a3a3f"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 20}" y="108" width="10" height="4" fill="#e10600"/><rect x="${i * 20 + 10}" y="108" width="10" height="4" fill="#fff"/><rect x="${i * 20}" y="156" width="10" height="4" fill="#fff"/><rect x="${i * 20 + 10}" y="156" width="10" height="4" fill="#e10600"/>`).join('')}
      <line x1="0" x2="300" y1="134" y2="134" stroke="#fff" stroke-width="1" stroke-dasharray="8 8" opacity=".5"/>`;
    const body = items
      .filter((o) => !o.hidden)
      .map((o) => `<g transform="translate(${o.x} ${o.y}) scale(${o.s * o.flip} ${o.s})">${DRAW[o.type](o)}</g>`)
      .join('');
    const marks = found.map((f) => `<circle cx="${f.x}" cy="${f.y}" r="${f.r}" fill="none" stroke="#00d26a" stroke-width="2.5"/>`).join('');
    return `<svg viewBox="0 0 300 200" class="dif-svg">${bg}${body}${marks}</svg>`;
  };

  KMP.registerEx({
    id: 9,
    name: 'Encontra as Diferenças',
    short: 'Diferenças',
    cat: 'Concentração',
    icon: 'diff',
    est: 4,
    desc: 'Compara as duas imagens da pista e toca nas diferenças. Cada imagem é gerada de novo em cada sessão.',
    how: ['Compara as duas imagens com atenção.', 'Toca em qualquer das imagens onde vires uma diferença.', 'Toques errados descontam pontos. Podes desistir e ver as que faltam.'],
    levels: {
      1: '5 diferenças evidentes · 90 s',
      2: '6 diferenças · 90 s',
      3: '7 diferenças mais subtis · 75 s',
    },
    record: { key: 'scorePts', label: 'Melhor pontuação', lower: false, unit: 'pts' },
    run(stage, ctx) {
      const lv = ctx.level;
      const N = [0, 5, 6, 7][lv];
      const limit = [0, 90000, 90000, 75000][lv];
      const A = makeScene();
      const B = JSON.parse(JSON.stringify(A));
      const targets = U.shuffle(B).slice(0, N);
      const diffs = targets.map((o) => {
        const orig = A[o.id];
        mutate(o, lv);
        const s = Math.max(orig.s, o.s);
        const r = SIZE[o.type] * s + 6;
        const cx = (orig.x + o.x) / 2;
        const cy = o.y - SIZE[o.type] * s * 0.9;
        return { id: o.id, x: cx, y: cy, r, found: false };
      });
      let wrong = 0;
      let t0 = performance.now();
      let ended = false;

      stage.innerHTML = `<div class="dif-wrap">
        <div class="dif-top"><span>Encontradas: <b class="dif-n">0</b>/${N}</span><span class="mono dif-t">0:00</span></div>
        <div class="dif-img" data-w="a"></div>
        <div class="dif-img" data-w="b"></div>
        <div class="dif-bottom"><span>Toques errados: <b class="dif-w">0</b></span><button class="btn ghost small dif-give">Desistir</button></div>
      </div>`;
      const imgA = stage.querySelector('[data-w="a"]');
      const imgB = stage.querySelector('[data-w="b"]');
      const nEl = stage.querySelector('.dif-n');
      const tEl = stage.querySelector('.dif-t');
      const wEl = stage.querySelector('.dif-w');
      const draw = () => {
        const f = diffs.filter((d) => d.found);
        imgA.innerHTML = render(A, f);
        imgB.innerHTML = render(B, f);
      };
      draw();
      ctx.hud('0/' + N);

      const timer = ctx.scope.interval(() => {
        const el = performance.now() - t0;
        const left = Math.max(limit - el, 0);
        tEl.textContent = U.fmtClock(left);
        tEl.classList.toggle('bad-t', left < 15000);
        if (left <= 0) end(false);
      }, 250);

      const onTap = (e) => {
        if (ended) return;
        const box = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - box.left) / box.width) * 300;
        const y = ((e.clientY - box.top) / box.height) * 200;
        let hit = null;
        diffs.forEach((d) => {
          if (!d.found && Math.hypot(d.x - x, d.y - y) < d.r + (lv === 1 ? 10 : 6)) hit = d;
        });
        if (hit) {
          hit.found = true;
          KMP.sound.ok();
          const n = diffs.filter((d) => d.found).length;
          nEl.textContent = n;
          ctx.hud(n + '/' + N);
          draw();
          if (n === N) end(true);
        } else if (!diffs.some((d) => d.found && Math.hypot(d.x - x, d.y - y) < d.r + 6)) {
          wrong++;
          wEl.textContent = wrong;
          KMP.sound.err();
          const svg = e.currentTarget.querySelector('svg');
          svg.insertAdjacentHTML('beforeend', `<g class="dif-x"><circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#e10600" stroke-width="2.5"/></g>`);
          ctx.scope.timeout(() => !ended && draw(), 500);
        }
      };
      ctx.scope.on(imgA, 'pointerdown', onTap);
      ctx.scope.on(imgB, 'pointerdown', onTap);
      ctx.scope.on(stage.querySelector('.dif-give'), 'click', () => end(false));

      const end = (all) => {
        if (ended) return;
        ended = true;
        ctx.scope.clearInterval(timer);
        const time = performance.now() - t0;
        const found = diffs.filter((d) => d.found).length;
        // Mostrar as que faltaram.
        const missing = diffs.filter((d) => !d.found);
        if (missing.length) {
          [imgA, imgB].forEach((im) =>
            im.querySelector('svg').insertAdjacentHTML('beforeend', missing.map((d) => `<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="none" stroke="#ffd400" stroke-width="2.5" stroke-dasharray="4 3"/>`).join(''))
          );
        }
        const acc = found / (found + wrong || 1);
        const timeBonus = all ? U.scale(time, limit * 0.3, limit) * 0.2 : 0;
        const score = Math.round(U.clamp((found / N) * 80 + timeBonus - wrong * 4, 0, 100));
        ctx.scope.timeout(
          () =>
            ctx.finish({
              score,
              acc: found ? acc : 0,
              m: { scorePts: score, found, total: N, wrong, timeMs: Math.round(time) },
              lines: [
                ['Diferenças', found + ' de ' + N],
                ['Toques errados', wrong],
                ['Tempo', U.fmtSec(time)],
              ],
              tip:
                found === N && wrong <= 1
                  ? 'Olho clínico! A mesma atenção ao detalhe ajuda a reparar em mudanças de aderência e marcas na pista.'
                  : 'Percorre as imagens por zonas (céu, bancada, pista, frente) em vez de saltar de um lado para o outro.',
            }),
          missing.length ? 1800 : 600
        );
      };
    },
  });
})();
