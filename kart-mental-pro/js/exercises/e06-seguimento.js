/* Exercício 6 — Seguimento visual (acompanhar objetos em movimento) */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const PATTERNS = [
    { k: 'linear', n: 'Linear' },
    { k: 'circle', n: 'Circular' },
    { k: 'eight', n: 'Em oito' },
    { k: 'zigzag', n: 'Ziguezague' },
    { k: 'random', n: 'Aleatório' },
  ];

  KMP.registerEx({
    id: 6,
    name: 'Seguimento Visual',
    short: 'Seguimento',
    cat: 'Visão',
    icon: 'target',
    est: 4,
    desc: 'Segue com os olhos os karts marcados enquanto se misturam com os outros. A velocidade aumenta a cada ronda.',
    how: [
      'No início de cada ronda, os karts-alvo acendem-se a verde.',
      'Depois ficam todos iguais e movem-se. Segue os alvos só com os olhos.',
      'Quando pararem, toca nos karts que eram os alvos.',
    ],
    levels: {
      1: '5 karts, 1 alvo',
      2: '7 karts, 2 alvos',
      3: '9 karts, 3 alvos',
    },
    record: { key: 'accPct', label: 'Melhor precisão', lower: false, unit: '%' },
    run(stage, ctx) {
      const lv = ctx.level;
      const nObj = [0, 5, 7, 9][lv];
      const nTgt = lv;
      const rounds = 5;
      let round = 0;
      let hits = 0;
      let errors = 0;
      let phase = 'idle';
      let objs = [];
      let picks = 0;

      stage.innerHTML = `<div class="trk-wrap">
        <div class="trk-msg">Toca em «Iniciar» para a ronda 1</div>
        <canvas class="trk-canvas"></canvas>
        <button class="btn primary trk-start">Iniciar</button>
      </div>`;
      const canvas = stage.querySelector('canvas');
      const msg = stage.querySelector('.trk-msg');
      const startBtn = stage.querySelector('.trk-start');
      const g = canvas.getContext('2d');
      let W = 0;
      let H = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const resize = () => {
        const r = canvas.getBoundingClientRect();
        W = r.width;
        H = r.height;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      ctx.hud('Ronda 0/' + rounds);

      const R = 17;
      const draw = (mode) => {
        g.clearRect(0, 0, W, H);
        // pista estilizada
        g.strokeStyle = 'rgba(255,255,255,.06)';
        g.lineWidth = 1;
        for (let x = 0; x < W; x += 28) {
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x, H);
          g.stroke();
        }
        objs.forEach((o) => {
          let fill = '#f5f5f7';
          if (mode === 'show' && o.tgt) fill = '#00d26a';
          if (o.picked) fill = o.tgt ? '#00d26a' : '#e10600';
          if (mode === 'reveal' && o.tgt && !o.picked) fill = '#ffd400';
          g.save();
          g.translate(o.x, o.y);
          g.rotate(o.a || 0);
          g.fillStyle = fill;
          g.beginPath();
          g.roundRect ? g.roundRect(-R, -R * 0.62, R * 2, R * 1.24, 6) : g.rect(-R, -R * 0.62, R * 2, R * 1.24);
          g.fill();
          g.fillStyle = '#0a0a0c';
          g.fillRect(-R + 3, -R * 0.62 - 3, 8, 4);
          g.fillRect(R - 11, -R * 0.62 - 3, 8, 4);
          g.fillRect(-R + 3, R * 0.62 - 1, 8, 4);
          g.fillRect(R - 11, R * 0.62 - 1, 8, 4);
          g.restore();
        });
      };

      const setup = () => {
        resize();
        const pad = R + 6;
        objs = [];
        for (let i = 0; i < nObj; i++) {
          let x;
          let y;
          let tries = 0;
          do {
            x = U.rand(pad, W - pad);
            y = U.rand(pad, H - pad);
            tries++;
          } while (tries < 50 && objs.some((o) => Math.hypot(o.x - x, o.y - y) < R * 2.6));
          objs.push({ x, y, x0: x, y0: y, tgt: i < nTgt, picked: false, ph: U.rand(0, Math.PI * 2), dir: U.rand(0, Math.PI * 2), a: 0, cx: U.rand(W * 0.3, W * 0.7), cy: U.rand(H * 0.3, H * 0.7), rr: U.rand(40, Math.min(W, H) * 0.4), sgn: Math.random() < 0.5 ? -1 : 1 });
        }
      };

      const startRound = async () => {
        round++;
        picks = 0;
        ctx.hud('Ronda ' + round + '/' + rounds);
        const pattern = PATTERNS[(round - 1) % PATTERNS.length];
        const speed = 90 + round * 35 + lv * 15; // px/s
        setup();
        phase = 'show';
        msg.innerHTML = `Ronda ${round} · <b>${pattern.n}</b> — memoriza ${nTgt > 1 ? 'os alvos verdes' : 'o alvo verde'}`;
        draw('show');
        await ctx.scope.wait(1800);
        phase = 'move';
        msg.textContent = 'Segue com os olhos…';
        const dur = 6000 + round * 600;
        const t0 = performance.now();
        let last = t0;
        await new Promise((res) => {
          const step = (now) => {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            const el = (now - t0) / 1000;
            move(pattern.k, dt, el, speed);
            draw('move');
            if (now - t0 < dur) ctx.scope.raf(step);
            else res();
          };
          ctx.scope.raf(step);
        });
        phase = 'pick';
        msg.textContent = `Toca ${nTgt > 1 ? 'nos ' + nTgt + ' alvos' : 'no alvo'}`;
      };

      const bounce = (o) => {
        const pad = R + 2;
        if (o.x < pad) {
          o.x = pad;
          o.dir = Math.PI - o.dir;
        }
        if (o.x > W - pad) {
          o.x = W - pad;
          o.dir = Math.PI - o.dir;
        }
        if (o.y < pad) {
          o.y = pad;
          o.dir = -o.dir;
        }
        if (o.y > H - pad) {
          o.y = H - pad;
          o.dir = -o.dir;
        }
      };

      const move = (k, dt, el, speed) => {
        objs.forEach((o, i) => {
          const px = o.x;
          const py = o.y;
          if (k === 'linear') {
            o.x += Math.cos(o.dir) * speed * dt;
            o.y += Math.sin(o.dir) * speed * dt;
            bounce(o);
          } else if (k === 'circle') {
            const w = (speed / o.rr) * o.sgn;
            o.x = o.cx + Math.cos(o.ph + el * w) * o.rr;
            o.y = o.cy + Math.sin(o.ph + el * w) * o.rr;
            o.x = U.clamp(o.x, R, W - R);
            o.y = U.clamp(o.y, R, H - R);
          } else if (k === 'eight') {
            const w = (speed / 160) * o.sgn;
            const t = o.ph + el * w;
            o.x = W / 2 + Math.sin(t) * (W / 2 - R - 4) * (0.5 + (i % 3) * 0.22);
            o.y = H / 2 + Math.sin(2 * t) * (H / 2 - R - 4) * (0.45 + (i % 2) * 0.35);
          } else if (k === 'zigzag') {
            o.x += Math.cos(o.dir) * speed * dt;
            o.y += Math.sin(o.dir) * speed * dt;
            if (Math.random() < dt * 1.6) o.dir += (Math.random() < 0.5 ? 1 : -1) * U.rand(1.0, 1.8);
            bounce(o);
          } else {
            o.dir += U.rand(-3, 3) * dt;
            o.x += Math.cos(o.dir) * speed * dt;
            o.y += Math.sin(o.dir) * speed * dt;
            bounce(o);
          }
          const dx = o.x - px;
          const dy = o.y - py;
          if (Math.abs(dx) + Math.abs(dy) > 0.01) o.a = Math.atan2(dy, dx);
        });
      };

      ctx.scope.on(startBtn, 'click', () => {
        startBtn.classList.add('hidden');
        startRound();
      });
      ctx.scope.on(canvas, 'pointerdown', (e) => {
        if (phase !== 'pick') return;
        e.preventDefault();
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        let best = null;
        let bd = 1e9;
        objs.forEach((o) => {
          const d = Math.hypot(o.x - x, o.y - y);
          if (!o.picked && d < bd) {
            bd = d;
            best = o;
          }
        });
        if (!best || bd > R * 2.2) return;
        best.picked = true;
        picks++;
        if (best.tgt) {
          hits++;
          KMP.sound.ok();
        } else {
          errors++;
          KMP.sound.err();
        }
        draw('pick');
        if (picks >= nTgt) {
          phase = 'reveal';
          draw('reveal');
          const got = objs.filter((o) => o.tgt && o.picked).length;
          msg.innerHTML = got === nTgt ? '<span class="ok-t">Perfeito!</span>' : `<span class="bad-t">${got} de ${nTgt}</span> — a amarelo, o que falhaste`;
          if (round >= rounds) ctx.scope.timeout(done, 1300);
          else {
            startBtn.textContent = 'Ronda ' + (round + 1);
            startBtn.classList.remove('hidden');
          }
        }
      });

      const done = () => {
        const total = rounds * nTgt;
        const acc = hits / total;
        ctx.finish({
          score: Math.round(acc * 100),
          acc,
          m: { accPct: Math.round(acc * 100), hits, errors },
          lines: [
            ['Acertos', hits + ' de ' + total],
            ['Erros', errors],
            ['Padrões', 'Linear, circular, em oito, ziguezague, aleatório'],
          ],
          tip:
            acc >= 0.85
              ? 'Excelente atenção dividida — útil para seguir vários karts num pelotão.'
              : 'Não tentes seguir cada kart com movimentos bruscos dos olhos: segue o "grupo" e mantém os alvos em mente.',
        });
      };
    },
  });
})();
