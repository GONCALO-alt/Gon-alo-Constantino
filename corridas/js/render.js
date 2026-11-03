/* Desenho: pista vista de cima, carros, capacetes, efeitos e mini-mapa. Tudo em metros, com a câmara a seguir o carro. */
'use strict';

const RENDER = (() => {
  let cv, ctx, DPR = 1, VW = 0, VH = 0;
  const cam = { x: 0, y: 0, rot: 0, z: 6 };
  const pats = {};
  function init(canvas) { cv = canvas; ctx = cv.getContext('2d'); resize(); makePatterns(); }
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    const r = cv.getBoundingClientRect(); VW = r.width; VH = r.height;
    cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  }
  function noiseCanvas(sz, base, amp, seed) {
    const c = document.createElement('canvas'); c.width = c.height = sz;
    const g = c.getContext('2d'), im = g.createImageData(sz, sz), rnd = mulberry32(seed);
    for (let i = 0; i < sz * sz; i++) { const v = (rnd() - 0.5) * amp; im.data[i * 4] = base[0] + v; im.data[i * 4 + 1] = base[1] + v; im.data[i * 4 + 2] = base[2] + v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); return c;
  }
  function makePatterns() {
    const asph = noiseCanvas(64, [62, 64, 68], 16, 7);
    pats.asphalt = ctx.createPattern(asph, 'repeat');
    const grass = document.createElement('canvas'); grass.width = grass.height = 64;
    const gg = grass.getContext('2d');
    gg.drawImage(noiseCanvas(64, [66, 120, 58], 14, 3), 0, 0);
    gg.fillStyle = 'rgba(255,255,255,.05)'; gg.fillRect(0, 0, 32, 64);
    pats.grass = ctx.createPattern(grass, 'repeat');
    pats.gravel = ctx.createPattern(noiseCanvas(32, [205, 182, 140], 40, 11), 'repeat');
    pats.apron = ctx.createPattern(noiseCanvas(32, [104, 108, 114], 14, 5), 'repeat');
  }
  // escala dos padrões: 1 píxel do padrão = 0,25 m
  function patScale(p, k) { if (p.setTransform) p.setTransform(new DOMMatrix([k, 0, 0, k, 0, 0])); return p; }

  // ---------- capacete ----------
  function drawHelmet(g, x, y, r, h, top = true) {
    g.save(); g.translate(x, y);
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fillStyle = h.c1; g.fill();
    g.save(); g.clip();
    const p = h.pattern;
    g.fillStyle = h.c2; g.strokeStyle = h.c2;
    if (p === 'faixa') g.fillRect(-r * 0.22, -r, r * 0.44, r * 2);
    else if (p === 'duplo') { g.fillRect(-r * 0.5, -r, r * 0.25, r * 2); g.fillRect(r * 0.25, -r, r * 0.25, r * 2); }
    else if (p === 'estrelas') for (let k = 0; k < 5; k++) starPath(g, Math.cos(k * 1.3) * r * 0.55, Math.sin(k * 2.1) * r * 0.55, r * 0.22, h.c2);
    else if (p === 'chamas') { g.beginPath(); g.moveTo(-r, r); for (let k = 0; k <= 6; k++) g.lineTo(-r + (k * 2 * r) / 6, k % 2 ? -r * 0.1 : r * 0.35); g.lineTo(r, r); g.fill(); g.fillStyle = h.c3; g.beginPath(); g.moveTo(-r, r); for (let k = 0; k <= 6; k++) g.lineTo(-r + (k * 2 * r) / 6, k % 2 ? r * 0.3 : r * 0.6); g.lineTo(r, r); g.fill(); }
    else if (p === 'xadrez') { const q = r / 2.5; for (let a = -3; a < 3; a++) for (let b = -3; b < 3; b++) if ((a + b) & 1) g.fillRect(a * q, b * q, q, q); }
    else if (p === 'raio') { g.beginPath(); g.moveTo(-r * 0.1, -r); g.lineTo(r * 0.25, -r * 0.1); g.lineTo(-r * 0.05, -r * 0.05); g.lineTo(r * 0.2, r); g.lineTo(-r * 0.3, 0.05 * r); g.lineTo(0, 0); g.closePath(); g.fill(); }
    else if (p === 'bandeira' && h.flagImg) g.drawImage(h.flagImg, -r, -r * 0.75, r * 2, r * 1.5);
    g.restore();
    // viseira
    if (top) { g.beginPath(); g.ellipse(0, -r * 0.38, r * 0.62, r * 0.26, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(15,18,30,.88)'; g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-r * 0.2, -r * 0.44, r * 0.18, r * 0.07, -0.2, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.lineWidth = r * 0.12; g.strokeStyle = 'rgba(0,0,0,.45)'; g.stroke();
    g.restore();
  }
  function starPath(g, x, y, r, col) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k & 1 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fillStyle = col; g.fill(); }

  // ---------- carros (vistos de cima, a apontar para +x) ----------
  function drawCar(g, cat, L, W, col1, col2, helmet, num, braking) {
    const wheel = (x, y, l, w) => { g.fillStyle = '#121212'; g.fillRect(x - l / 2, y - w / 2, l, w); g.fillStyle = '#2a2a2a'; g.fillRect(x - l / 2, y - w / 2, l, w * 0.25); };
    // sombra
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(-L * 0.04 + 0.25, 0.3, L * 0.52, W * 0.55, 0, 0, Math.PI * 2); g.fill();
    if (cat === 'kart') {
      const wl = L * 0.2, ww = W * 0.17;
      wheel(L * 0.32, -W * 0.4, wl, ww); wheel(L * 0.32, W * 0.4, wl, ww); wheel(-L * 0.33, -W * 0.42, wl * 1.15, ww * 1.25); wheel(-L * 0.33, W * 0.42, wl * 1.15, ww * 1.25);
      g.strokeStyle = '#999'; g.lineWidth = 0.05; g.strokeRect(-L * 0.42, -W * 0.3, L * 0.8, W * 0.6);
      g.fillStyle = col1; g.beginPath(); g.moveTo(L * 0.5, -W * 0.28); g.lineTo(L * 0.5, W * 0.28); g.lineTo(L * 0.3, W * 0.2); g.lineTo(L * 0.3, -W * 0.2); g.fill(); // carenagem frontal
      g.fillRect(-L * 0.2, -W * 0.48, L * 0.42, W * 0.12); g.fillRect(-L * 0.2, W * 0.36, L * 0.42, W * 0.12); // pontões
      g.fillStyle = col2; g.fillRect(L * 0.08, -W * 0.15, L * 0.22, W * 0.3); // painel do número
      g.fillStyle = '#0e0e0e'; g.fillRect(-L * 0.5, -W * 0.36, L * 0.08, W * 0.72); // para-choques
      g.fillStyle = '#333'; g.fillRect(-L * 0.25, -W * 0.16, L * 0.26, W * 0.32); // banco
      drawHelmet(g, -L * 0.06, 0, W * 0.15, helmet);
      return;
    }
    const fw = L * 0.13, rw = L * 0.15, fwid = W * 0.17, rwid = W * 0.22;
    wheel(L * 0.3, -W * 0.4, fw, fwid); wheel(L * 0.3, W * 0.4, fw, fwid); wheel(-L * 0.3, -W * 0.39, rw, rwid); wheel(-L * 0.3, W * 0.39, rw, rwid);
    // braços da suspensão
    g.strokeStyle = '#222'; g.lineWidth = 0.06; g.beginPath(); g.moveTo(L * 0.3, -W * 0.33); g.lineTo(L * 0.18, -W * 0.08); g.moveTo(L * 0.3, W * 0.33); g.lineTo(L * 0.18, W * 0.08); g.moveTo(-L * 0.3, -W * 0.3); g.lineTo(-L * 0.2, -W * 0.15); g.moveTo(-L * 0.3, W * 0.3); g.lineTo(-L * 0.2, W * 0.15); g.stroke();
    // asa da frente
    g.fillStyle = col2; g.fillRect(L * 0.43, -W * 0.5, L * 0.06, W); g.fillStyle = col1; g.fillRect(L * 0.47, -W * 0.5, L * 0.03, W);
    g.fillStyle = '#111'; g.fillRect(L * 0.42, -W * 0.5, L * 0.08, W * 0.05); g.fillRect(L * 0.42, W * 0.45, L * 0.08, W * 0.05);
    // nariz e monocoque
    g.fillStyle = col1;
    g.beginPath(); g.moveTo(L * 0.48, -W * 0.05); g.lineTo(L * 0.48, W * 0.05); g.lineTo(L * 0.1, W * 0.13); g.lineTo(-L * 0.05, W * 0.16); g.lineTo(-L * 0.05, -W * 0.16); g.lineTo(L * 0.1, -W * 0.13); g.closePath(); g.fill();
    // pontões laterais
    g.beginPath(); g.moveTo(L * 0.05, -W * 0.32); g.quadraticCurveTo(-L * 0.05, -W * 0.36, -L * 0.25, -W * 0.18); g.lineTo(-L * 0.25, W * 0.18); g.quadraticCurveTo(-L * 0.05, W * 0.36, L * 0.05, W * 0.32); g.closePath(); g.fill();
    g.fillStyle = col2; g.beginPath(); g.moveTo(L * 0.05, -W * 0.3); g.quadraticCurveTo(-L * 0.02, -W * 0.33, -L * 0.12, -W * 0.27); g.lineTo(-L * 0.12, -W * 0.22); g.lineTo(L * 0.05, -W * 0.24); g.fill();
    g.beginPath(); g.moveTo(L * 0.05, W * 0.3); g.quadraticCurveTo(-L * 0.02, W * 0.33, -L * 0.12, W * 0.27); g.lineTo(-L * 0.12, W * 0.22); g.lineTo(L * 0.05, W * 0.24); g.fill();
    // tampa do motor
    g.fillStyle = col1; g.beginPath(); g.moveTo(-L * 0.02, -W * 0.12); g.lineTo(-L * 0.38, -W * 0.06); g.lineTo(-L * 0.38, W * 0.06); g.lineTo(-L * 0.02, W * 0.12); g.fill();
    g.fillStyle = col2; g.fillRect(-L * 0.3, -W * 0.02, L * 0.26, W * 0.04);
    // asa de trás
    g.fillStyle = '#111'; g.fillRect(-L * 0.5, -W * 0.38, L * 0.1, W * 0.76);
    g.fillStyle = col2; g.fillRect(-L * 0.48, -W * 0.36, L * 0.06, W * 0.72);
    g.fillStyle = braking ? '#ff2a2a' : '#5a0d0d'; g.fillRect(-L * 0.505, -W * 0.03, L * 0.02, W * 0.06);
    // cockpit, piloto e halo
    g.fillStyle = '#0c0c0c'; g.beginPath(); g.ellipse(L * 0.04, 0, L * 0.09, W * 0.11, 0, 0, Math.PI * 2); g.fill();
    drawHelmet(g, L * 0.03, 0, W * 0.09, helmet);
    if (cat === 'f2' || cat === 'f1') { g.strokeStyle = '#1a1a1a'; g.lineWidth = W * 0.035; g.beginPath(); g.moveTo(L * 0.14, 0); g.lineTo(L * 0.1, 0); g.moveTo(L * 0.1, 0); g.quadraticCurveTo(L * 0.06, -W * 0.13, -L * 0.03, -W * 0.11); g.moveTo(L * 0.1, 0); g.quadraticCurveTo(L * 0.06, W * 0.13, -L * 0.03, W * 0.11); g.stroke(); }
    // número no nariz
    if (num != null) { g.save(); g.translate(L * 0.3, 0); g.rotate(Math.PI / 2); g.fillStyle = '#fff'; g.font = `bold ${W * 0.16}px "Titillium Web", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, 0, 0); g.restore(); }
  }

  // ---------- pista ----------
  function visibleRuns(T, cx, cy, rad) {
    const vis = new Uint8Array(T.n), r2 = (rad + T.W + T.runoff * 2) ** 2;
    for (let i = 0; i < T.n; i++) vis[i] = (T.x[i] - cx) ** 2 + (T.y[i] - cy) ** 2 < r2 ? 1 : 0;
    let start = vis.indexOf(0); if (start < 0) return [[...Array(T.n + 1).keys()].map((i) => i % T.n)];
    const runs = []; let cur = null;
    for (let k = 1; k <= T.n; k++) { const i = (start + k) % T.n; if (vis[i]) { if (!cur) { cur = [(i - 1 + T.n) % T.n]; runs.push(cur); } cur.push(i); } else if (cur) { cur.push(i); cur = null; } }
    return runs;
  }
  function polyline(T, idx, off, sideFn) {
    ctx.beginPath();
    let first = true;
    for (const i of idx) { const o = sideFn ? sideFn(i) : off; const x = T.x[i] + T.nx[i] * o, y = T.y[i] + T.ny[i] * o; if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y); }
  }
  function strokeFlagged(T, run, flagFn, off, width, style, dash) {
    let seg = [];
    const flush = () => { if (seg.length > 1) { polyline(T, seg, off); ctx.lineWidth = width; ctx.strokeStyle = style; ctx.setLineDash(dash || []); ctx.stroke(); } seg = []; };
    for (const i of run) { if (flagFn(i)) seg.push(i); else flush(); }
    flush(); ctx.setLineDash([]);
  }
  function drawTrack(T, R, opts) {
    const rad = Math.hypot(VW, VH) / 2 / cam.z + 20;
    const runs = visibleRuns(T, cam.x, cam.y, rad);
    const half = T.W / 2;
    ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
    // relva de fundo
    ctx.fillStyle = patScale(pats.grass, 0.35); ctx.fillRect(cam.x - rad, cam.y - rad, rad * 2, rad * 2);
    for (const run of runs) {
      // escapatória: asfalto claro (fórmulas) ou relva mais clara (karts)
      polyline(T, run, 0); ctx.lineWidth = T.W + (T.kart ? 3 : 10); ctx.strokeStyle = T.kart ? '#5d9a4e' : patScale(pats.apron, 0.25); ctx.stroke();
      // gravilha no exterior das curvas
      for (const sd of [-1, 1]) strokeFlagged(T, run, (i) => T.gravel[i] === sd, sd * (half + T.runoff * 0.55), T.runoff * 0.85, patScale(pats.gravel, 0.25));
    }
    // boxes
    if (T.pit) {
      const pit = T.pit, idx = []; for (let i = pit.i0 - 20; i <= pit.i1 + 20; i++) idx.push((i + T.n) % T.n);
      const sd = pit.side;
      polyline(T, idx, sd * pit.off); ctx.lineWidth = 9; ctx.strokeStyle = patScale(pats.asphalt, 0.25); ctx.stroke();
      polyline(T, idx, sd * (pit.off + 4.6)); ctx.lineWidth = 0.25; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      // garagens com cores das equipas
      const teams = opts.teams || [];
      for (let k = 0; k < 10; k++) {
        const i = (pit.boxI + k * 3 * 5 - 20 + T.n) % T.n;
        const x = T.x[i] + T.nx[i] * sd * (pit.off + 9), y = T.y[i] + T.ny[i] * sd * (pit.off + 9);
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(T.ty[i], T.tx[i]));
        ctx.fillStyle = '#d9dde3'; ctx.fillRect(-6, -4, 12, 8);
        ctx.fillStyle = (teams[k] && teams[k][1]) || '#555'; ctx.fillRect(-6, sd > 0 ? -4 : 3, 12, 1);
        ctx.restore();
      }
      // muro das boxes
      const wall = []; for (let i = pit.i0; i <= pit.i1; i++) wall.push((i + T.n) % T.n);
      polyline(T, wall, sd * (half + 3.2)); ctx.lineWidth = 0.7; ctx.strokeStyle = '#e8e8e8'; ctx.stroke();
    }
    for (const run of runs) {
      // barreiras
      for (const sd of [-1, 1]) {
        polyline(T, run, sd * (half + T.runoff)); ctx.lineWidth = 0.9; ctx.strokeStyle = '#c8ccd2'; ctx.stroke();
        strokeFlagged(T, run, (i) => T.gravel[i] === sd, sd * (half + T.runoff - 0.6), 1.2, '#d22', [1.2, 1.2]);
        strokeFlagged(T, run, (i) => T.gravel[i] === sd, sd * (half + T.runoff - 0.6), 1.2, '#f4f4f4', [0, 1.2, 1.2, 0]);
      }
      // asfalto
      polyline(T, run, 0); ctx.lineWidth = T.W; ctx.strokeStyle = patScale(pats.asphalt, 0.2); ctx.stroke();
      // borracha na trajetória
      polyline(T, run, 0, (i) => T.off[i]); ctx.lineWidth = T.kart ? 1.6 : 2.4; ctx.strokeStyle = 'rgba(20,20,22,.28)'; ctx.stroke();
      // linhas brancas
      for (const sd of [-1, 1]) { polyline(T, run, sd * (half - 0.25)); ctx.lineWidth = 0.22; ctx.strokeStyle = 'rgba(240,240,240,.9)'; ctx.stroke(); }
      // corretores
      for (const sd of [-1, 1]) {
        strokeFlagged(T, run, (i) => T.kerb[i], sd * (half + 0.45), 0.95, '#d41e1e');
        strokeFlagged(T, run, (i) => T.kerb[i], sd * (half + 0.45), 0.95, '#f5f5f5', [1.6, 1.6]);
      }
      // trajetória ideal (ajuda)
      if (opts.line && opts.prof) {
        let seg = [], col = null;
        const flush = () => { if (seg.length > 1) { polyline(T, seg, 0, (i) => T.off[i]); ctx.lineWidth = T.kart ? 0.5 : 0.8; ctx.strokeStyle = col; ctx.stroke(); } };
        for (const i of run) {
          const v = opts.prof.v, nb = v[(i + 6) % T.n] < v[i] - 0.4 ? '#ff3b30' : v[(i + 3) % T.n] < v[i] + 0.05 && v[(i + 3) % T.n] > v[i] - 0.4 ? '#ffd60a' : '#30d158';
          if (nb !== col) { flush(); seg = seg.length ? [seg[seg.length - 1]] : []; col = nb; }
          seg.push(i);
        }
        flush();
      }
    }
    // linha de partida em xadrez e lugares da grelha
    {
      const i = 0, th = Math.atan2(T.ty[i], T.tx[i]);
      ctx.save(); ctx.translate(T.x[i], T.y[i]); ctx.rotate(th);
      const q = T.W / 10;
      for (let a = 0; a < 2; a++) for (let b = 0; b < 10; b++) { ctx.fillStyle = (a + b) & 1 ? '#111' : '#fff'; ctx.fillRect(-q + a * q, -half + b * q, q, q); }
      ctx.restore();
      const gap = T.kart ? 6.5 : 8;
      for (let k = 0; k < (opts.gridN || 20); k++) {
        const pt = trackPoint(T, T.len - 12 - k * gap + (T.kart ? 1 : 2), (k % 2 ? 1 : -1) * T.W * 0.22);
        ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.th);
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 0.18;
        const w = T.kart ? 1.6 : 2.2; ctx.beginPath(); ctx.moveTo(-0.6, -w); ctx.lineTo(0, -w); ctx.lineTo(0, w); ctx.lineTo(-0.6, w); ctx.stroke();
        ctx.restore();
      }
    }
    // marcas de pneus
    if (R && R.skids.length) {
      ctx.lineCap = 'round'; ctx.fillStyle = 'rgba(18,18,18,.33)';
      for (const s of R.skids) if ((s[0] - cam.x) ** 2 + (s[1] - cam.y) ** 2 < rad * rad) { ctx.beginPath(); ctx.arc(s[0], s[1], 0.13 + s[3] * 0.06, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  function drawScenery(T) {
    const rad = Math.hypot(VW, VH) / 2 / cam.z + 20, r2 = rad * rad;
    // bancadas
    for (const st of T.stands) {
      const i = st.i, sd = st.side, n = Math.round(st.length / T.ds);
      for (let k = -n / 2; k < n / 2; k += Math.round(8 / T.ds)) {
        const j = (i + Math.round(k) + T.n) % T.n;
        const x = T.x[j] + T.nx[j] * sd * (st.dist + 4), y = T.y[j] + T.ny[j] * sd * (st.dist + 4);
        if ((x - cam.x) ** 2 + (y - cam.y) ** 2 > r2) continue;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(T.ty[j], T.tx[j]));
        ctx.fillStyle = '#9aa1ab'; ctx.fillRect(-4.2, -4, 8.4, 8);
        const rnd = mulberry32(j * 13 + 1);
        for (let a = 0; a < 6; a++) for (let b = 0; b < 4; b++) { ctx.fillStyle = ['#e63946', '#f1faee', '#ffb703', '#219ebc', '#8ecae6', '#fb8500'][Math.floor(rnd() * 6)]; ctx.fillRect(-3.8 + a * 1.3, -3.4 + b * 1.7, 0.8, 0.8); }
        ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(-4.2, sd > 0 ? 3.2 : -4, 8.4, 0.8);
        ctx.restore();
      }
    }
    // árvores com sombra
    for (const t of T.trees) {
      if ((t[0] - cam.x) ** 2 + (t[1] - cam.y) ** 2 > r2) continue;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(t[0] + t[2] * 0.35, t[1] + t[2] * 0.35, t[2], 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = t[3] < 0.5 ? '#2e6b2f' : '#3b7d35'; ctx.beginPath(); ctx.arc(t[0], t[1], t[2], 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(t[0] - t[2] * 0.3, t[1] - t[2] * 0.3, t[2] * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  function drawParticles(R, dt) {
    for (const p of R.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.97; p.vy *= 0.97; }
    R.parts = R.parts.filter((p) => p.t < p.life);
    if (R.parts.length > 600) R.parts.splice(0, R.parts.length - 600);
    for (const p of R.parts) {
      const k = p.t / p.life;
      if (p.kind === 'smoke') { ctx.fillStyle = `rgba(230,230,230,${0.35 * (1 - k)})`; ctx.beginPath(); ctx.arc(p.x, p.y, 0.6 + k * 2.4, 0, Math.PI * 2); ctx.fill(); }
      else if (p.kind === 'dust') { ctx.fillStyle = `rgba(200,170,120,${0.5 * (1 - k)})`; ctx.beginPath(); ctx.arc(p.x, p.y, 0.5 + k * 2, 0, Math.PI * 2); ctx.fill(); }
      else if (p.kind === 'grass') { ctx.fillStyle = `rgba(80,140,60,${0.6 * (1 - k)})`; ctx.fillRect(p.x, p.y, 0.3, 0.3); }
      else { ctx.fillStyle = `rgba(255,${200 - k * 150},60,${1 - k})`; ctx.fillRect(p.x, p.y, 0.25, 0.25); }
    }
  }
  function frame(R, view, dt) {
    const T = R.T, me = R.me, car = me.phys;
    // câmara
    const v = car.speed, top = car.p.vtop;
    const span = T.kart ? lerp(26, 46, clamp(v / top, 0, 1)) : lerp(55, 115, clamp(v / top, 0, 1));
    const zt = Math.min(VW, VH) / span;
    cam.z = lerp(cam.z, zt, Math.min(1, dt * 2));
    const rotT = view.camFixed ? 0 : car.th + Math.PI / 2;
    let dr = rotT - cam.rot; dr = Math.atan2(Math.sin(dr), Math.cos(dr));
    cam.rot += dr * Math.min(1, dt * (view.camFixed ? 10 : 6));
    const ahead = view.camFixed ? 0 : Math.min(VW, VH) * 0.22 / cam.z;
    cam.x = lerp(cam.x, car.x + Math.cos(car.th) * ahead, Math.min(1, dt * 8));
    cam.y = lerp(cam.y, car.y + Math.sin(car.th) * ahead, Math.min(1, dt * 8));
    if (view.shake > 0) { cam.x += (Math.random() - 0.5) * view.shake; cam.y += (Math.random() - 0.5) * view.shake; }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#3d6f37'; ctx.fillRect(0, 0, VW, VH);
    ctx.save();
    ctx.translate(VW / 2, VH / 2); ctx.rotate(-cam.rot); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
    drawTrack(T, R, { line: view.line, prof: me.prof, teams: view.teams, gridN: R.cars.length });
    // carros
    for (const c of R.cars) {
      const x = c.isPlayer ? car.x : c.x, y = c.isPlayer ? car.y : c.y, th = c.isPlayer ? car.th : c.th;
      if ((x - cam.x) ** 2 + (y - cam.y) ** 2 > (Math.hypot(VW, VH) / cam.z) ** 2) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(th);
      drawCar(ctx, T.cat, car.p.len, car.p.wid, c.d.c1, c.d.c2, c.d.helmet, c.d.num, c.isPlayer ? view.braking : c.v < (c.lastV || 0) - 0.05);
      ctx.restore();
      c.lastV = c.v;
      // nome por cima dos rivais próximos
      if (!c.isPlayer && view.names && (x - car.x) ** 2 + (y - car.y) ** 2 < (T.kart ? 30 : 70) ** 2) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(cam.rot);
        ctx.font = `600 ${11 / cam.z}px "Titillium Web", sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,.55)'; const tw = ctx.measureText(c.d.code).width + 6 / cam.z;
        ctx.fillRect(-tw / 2, -car.p.len * 0.9 - 12 / cam.z, tw, 14 / cam.z);
        ctx.fillStyle = '#fff'; ctx.fillText(c.d.code, 0, -car.p.len * 0.9 - 1.5 / cam.z);
        ctx.restore();
      }
    }
    drawParticles(R, dt);
    drawScenery(T);
    ctx.restore();
  }
  // ---------- mini-mapa ----------
  let miniCache = null;
  function drawMini(mcv, R) {
    const g = mcv.getContext('2d'), T = R.T, w = mcv.width, h = mcv.height;
    const m = T.mini, sc = Math.min((w - 16) / (m.x1 - m.x0), (h - 16) / (m.y1 - m.y0));
    const ox = (w - (m.x1 - m.x0) * sc) / 2 - m.x0 * sc, oy = (h - (m.y1 - m.y0) * sc) / 2 - m.y0 * sc;
    if (!miniCache || miniCache.T !== T || miniCache.w !== w) {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const q = c.getContext('2d');
      q.lineJoin = 'round'; q.beginPath(); for (let i = 0; i <= T.n; i++) { const j = i % T.n; q.lineTo(T.x[j] * sc + ox, T.y[j] * sc + oy); }
      q.strokeStyle = 'rgba(0,0,0,.6)'; q.lineWidth = 7; q.stroke(); q.strokeStyle = '#e9edf2'; q.lineWidth = 3; q.stroke();
      q.fillStyle = '#fff'; q.fillRect(T.x[0] * sc + ox - 3, T.y[0] * sc + oy - 3, 6, 6);
      miniCache = { T, w, c };
    }
    g.clearRect(0, 0, w, h); g.drawImage(miniCache.c, 0, 0);
    for (const c of R.cars) {
      const x = (c.isPlayer ? c.phys.x : c.x) * sc + ox, y = (c.isPlayer ? c.phys.y : c.y) * sc + oy;
      g.beginPath(); g.arc(x, y, c.isPlayer ? 5 : 3.4, 0, Math.PI * 2); g.fillStyle = c.isPlayer ? '#ffd60a' : c.d.c1; g.fill();
      g.lineWidth = 1.2; g.strokeStyle = c.isPlayer ? '#000' : 'rgba(0,0,0,.6)'; g.stroke();
    }
  }
  return { init, resize, frame, drawMini, drawHelmet, drawCar, get size() { return [VW, VH]; } };
})();
