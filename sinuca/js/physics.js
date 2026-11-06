'use strict';
/* Física da mesa em unidades da mesa: largura 1, comprimento 2 (mesa na vertical).
   Usada pelo jogo e pelas simulações da IA (sem efeitos visuais). */
const PHYS = (() => {
  const R = 0.03, W = 1, L = 2, DT = 1 / 300;
  const MU = 0.6, K = 0.42;           // atrito de rolamento (constante + proporcional)
  const E_BALL = 0.95, E_RAIL = 0.76;
  const CG = 0.08, SG = 0.065;         // abertura das caçapas de canto e do meio
  const MAX_SPEED = 5.6;

  const segs = [];
  function seg(x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; segs.push({ x1, y1, dx, dy, l2: dx * dx + dy * dy }); }
  seg(CG, 0, W - CG, 0); seg(CG, L, W - CG, L);
  seg(0, CG, 0, 1 - SG); seg(0, 1 + SG, 0, L - CG);
  seg(W, CG, W, 1 - SG); seg(W, 1 + SG, W, L - CG);
  // bocas das caçapas de canto
  seg(CG, 0, CG - 0.03, -0.045); seg(0, CG, -0.045, CG - 0.03);
  seg(W - CG, 0, W - CG + 0.03, -0.045); seg(W, CG, W + 0.045, CG - 0.03);
  seg(CG, L, CG - 0.03, L + 0.045); seg(0, L - CG, -0.045, L - CG + 0.03);
  seg(W - CG, L, W - CG + 0.03, L + 0.045); seg(W, L - CG, W + 0.045, L - CG + 0.03);
  // bocas das caçapas do meio
  seg(0, 1 - SG, -0.04, 1 - SG + 0.012); seg(0, 1 + SG, -0.04, 1 + SG - 0.012);
  seg(W, 1 - SG, W + 0.04, 1 - SG + 0.012); seg(W, 1 + SG, W + 0.04, 1 + SG - 0.012);

  const POCKETS = [
    { x: -0.022, y: -0.022, r: 0.062 }, { x: W + 0.022, y: -0.022, r: 0.062 },
    { x: -0.038, y: 1, r: 0.056 }, { x: W + 0.038, y: 1, r: 0.056 },
    { x: -0.022, y: L + 0.022, r: 0.062 }, { x: W + 0.022, y: L + 0.022, r: 0.062 },
  ];

  function groupOf(id) { return id === 0 ? 'cue' : id === 8 ? 'eight' : id < 8 ? 'solid' : 'stripe'; }

  function newRecord() {
    return { firstHit: null, potted: [], cuePotted: false, cushions: {}, cushionAfterHit: false, contacts: 0, cueCushionsBeforeHit: 0, bankPotted: [] };
  }

  /* sh: { rec, spin:{sx,sy,dx,dy,used,sideUsed}, ev:function|null } */
  function step(balls, dt, sh) {
    const n = balls.length, rec = sh.rec, ev = sh.ev;
    for (let i = 0; i < n; i++) {
      const b = balls[i];
      if (b.on && (b.vx || b.vy)) { b.x += b.vx * dt; b.y += b.vy * dt; }
    }
    // bola contra bola
    const D = 2 * R, D2 = D * D;
    for (let i = 0; i < n; i++) {
      const a = balls[i]; if (!a.on) continue;
      for (let j = i + 1; j < n; j++) {
        const b = balls[j]; if (!b.on) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
        if (d2 >= D2 || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
        const ov = (D - d) / 2;
        a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
        const vrel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (vrel <= 0) continue;
        let cue = null, preSpeed = 0;
        if (a.id === 0) cue = a; else if (b.id === 0) cue = b;
        if (cue) preSpeed = Math.hypot(cue.vx, cue.vy);
        const imp = (1 + E_BALL) / 2 * vrel;
        a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny;
        rec.contacts++;
        if (cue) {
          const other = cue === a ? b : a;
          if (rec.firstHit === null) rec.firstHit = other.id;
          const sp = sh.spin;
          if (sp && !sp.used) {
            sp.used = true;
            const f = sp.sy * 0.55 * preSpeed;
            cue.vx += sp.dx * f; cue.vy += sp.dy * f;
          }
        }
        if (ev) ev('ball', { speed: vrel, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      }
    }
    // tabelas
    for (let i = 0; i < n; i++) {
      const b = balls[i]; if (!b.on) continue;
      if (b.x > R + 0.002 && b.x < W - R - 0.002 && b.y > R + 0.002 && b.y < L - R - 0.002) continue;
      for (let k = 0; k < segs.length; k++) {
        const s = segs[k];
        let t = ((b.x - s.x1) * s.dx + (b.y - s.y1) * s.dy) / s.l2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const cx = s.x1 + s.dx * t, cy = s.y1 + s.dy * t;
        const ddx = b.x - cx, ddy = b.y - cy, dd2 = ddx * ddx + ddy * ddy;
        if (dd2 >= R * R || dd2 === 0) continue;
        const d = Math.sqrt(dd2), nx = ddx / d, ny = ddy / d;
        b.x = cx + nx * R; b.y = cy + ny * R;
        const vn = b.vx * nx + b.vy * ny;
        if (vn >= 0) continue;
        b.vx -= (1 + E_RAIL) * vn * nx; b.vy -= (1 + E_RAIL) * vn * ny;
        b.vx *= 0.97; b.vy *= 0.97;
        rec.cushions[b.id] = (rec.cushions[b.id] || 0) + 1;
        if (rec.firstHit !== null) rec.cushionAfterHit = true;
        else if (b.id === 0) rec.cueCushionsBeforeHit++;
        if (b.id === 0 && sh.spin && !sh.spin.sideUsed && sh.spin.sx) {
          sh.spin.sideUsed = true;
          const tx = -ny, ty = nx, f = sh.spin.sx * 0.3 * Math.abs(vn);
          b.vx += tx * f; b.vy += ty * f;
        }
        if (ev) ev('rail', { speed: -vn, x: b.x, y: b.y });
      }
    }
    // caçapas
    for (let i = 0; i < n; i++) {
      const b = balls[i]; if (!b.on) continue;
      let hit = -1;
      for (let p = 0; p < 6; p++) {
        const P = POCKETS[p], dx = b.x - P.x, dy = b.y - P.y;
        if (dx * dx + dy * dy < P.r * P.r) { hit = p; break; }
      }
      if (hit < 0 && (b.x < -0.07 || b.x > W + 0.07 || b.y < -0.07 || b.y > L + 0.07)) hit = nearestPocket(b.x, b.y);
      if (hit >= 0) {
        b.on = false; b.vx = b.vy = 0;
        if (b.id === 0) rec.cuePotted = true;
        else {
          rec.potted.push(b.id);
          if (rec.cushions[b.id]) rec.bankPotted.push(b.id);
        }
        if (ev) ev('pocket', { id: b.id, pocket: hit, x: POCKETS[hit].x, y: POCKETS[hit].y });
      }
    }
    // atrito
    let moving = false;
    for (let i = 0; i < n; i++) {
      const b = balls[i]; if (!b.on || (!b.vx && !b.vy)) continue;
      const s = Math.hypot(b.vx, b.vy);
      const ns = s - (MU + K * s) * dt;
      if (ns <= 0.006) { b.vx = b.vy = 0; continue; }
      const f = ns / s; b.vx *= f; b.vy *= f; moving = true;
    }
    return moving;
  }

  function nearestPocket(x, y) {
    let best = 0, bd = Infinity;
    POCKETS.forEach((P, i) => { const d = (P.x - x) ** 2 + (P.y - y) ** 2; if (d < bd) { bd = d; best = i; } });
    return best;
  }

  function powerToSpeed(p) { return 0.3 + (MAX_SPEED - 0.3) * p; }

  function strike(balls, ang, power, spin) {
    const cue = balls.find(b => b.id === 0);
    const v = powerToSpeed(power), dx = Math.cos(ang), dy = Math.sin(ang);
    cue.vx = dx * v; cue.vy = dy * v;
    return { sx: spin ? spin.x : 0, sy: spin ? spin.y : 0, dx, dy, used: false, sideUsed: false };
  }

  function cloneBalls(balls) { return balls.map(b => ({ id: b.id, x: b.x, y: b.y, vx: 0, vy: 0, on: b.on })); }

  /* Simulação completa de uma tacada, para a IA. */
  function simulate(balls, ang, power, spin, maxSteps = 2400) {
    const bs = cloneBalls(balls);
    const sh = { rec: newRecord(), spin: strike(bs, ang, power, spin), ev: null };
    let steps = 0;
    while (steps++ < maxSteps && step(bs, DT, sh)) { /* continua */ }
    return { rec: sh.rec, balls: bs };
  }

  /* Raio da bola branca: primeira bola ou tabela atingida. */
  function raycast(balls, x, y, dx, dy, ignoreId = 0) {
    let best = Infinity, ball = null;
    for (const b of balls) {
      if (!b.on || b.id === ignoreId) continue;
      const px = x - b.x, py = y - b.y;
      const bb = dx * px + dy * py, cc = px * px + py * py - 4 * R * R;
      const disc = bb * bb - cc;
      if (disc < 0) continue;
      const t = -bb - Math.sqrt(disc);
      if (t > 0 && t < best) { best = t; ball = b; }
    }
    const tx = dx > 0 ? (W - R - x) / dx : dx < 0 ? (R - x) / dx : Infinity;
    const ty = dy > 0 ? (L - R - y) / dy : dy < 0 ? (R - y) / dy : Infinity;
    const tw = Math.max(0, Math.min(tx, ty));
    if (tw < best) return { t: tw, ball: null };
    return { t: best, ball };
  }

  function isFree(balls, x, y, exceptId = 0, area = null) {
    if (x < R || x > W - R || y < R || y > L - R) return false;
    if (area && (y < area.minY || y > area.maxY)) return false;
    for (const b of balls) {
      if (!b.on || b.id === exceptId) continue;
      if ((b.x - x) ** 2 + (b.y - y) ** 2 < (2 * R + 0.003) ** 2) return false;
    }
    return true;
  }

  /* Procura o lugar livre mais próximo (para recolocar bolas). */
  function freeSpotNear(balls, x, y, exceptId = 0, area = null) {
    if (isFree(balls, x, y, exceptId, area)) return { x, y };
    for (let r = 0.01; r < 1.2; r += 0.01) {
      for (let a = 0; a < 16; a++) {
        const ang = a / 16 * Math.PI * 2, nx = x + Math.cos(ang) * r, ny = y + Math.sin(ang) * r;
        if (isFree(balls, nx, ny, exceptId, area)) return { x: nx, y: ny };
      }
    }
    return { x: 0.5, y: 1.5 };
  }

  const FOOT = { x: 0.5, y: 0.5 }, HEAD_Y = 1.5;

  function rack(rnd = Math.random) {
    const stripes = [9, 10, 11, 12, 13, 14, 15];
    const slots = new Array(15).fill(0);
    slots[0] = 1; slots[4] = 8;
    const rest = U.shuffle([2, 3, 4, 5, 6, 7], rnd);
    const rs = U.shuffle(stripes, rnd);
    // cantos de trás: uma lisa e uma riscada
    if (rnd() < 0.5) { slots[10] = rest.pop(); slots[14] = rs.pop(); } else { slots[10] = rs.pop(); slots[14] = rest.pop(); }
    const pool = U.shuffle(rest.concat(rs), rnd);
    for (let i = 0; i < 15; i++) if (!slots[i]) slots[i] = pool.pop();
    const out = [{ id: 0, x: 0.5, y: 1.58, vx: 0, vy: 0, on: true }];
    const dx = 2 * R + 0.0012, dy = dx * 0.8660254;
    let i = 0;
    for (let row = 0; row < 5; row++) for (let k = 0; k <= row; k++) {
      out.push({ id: slots[i++], x: FOOT.x + (k - row / 2) * dx + (rnd() - 0.5) * 0.0006, y: FOOT.y - row * dy, vx: 0, vy: 0, on: true });
    }
    return out;
  }

  return { R, W, L, DT, POCKETS, CG, SG, MAX_SPEED, FOOT, HEAD_Y, step, strike, simulate, raycast, isFree, freeSpotNear, rack, cloneBalls, newRecord, groupOf, powerToSpeed };
})();
if (typeof module !== 'undefined') module.exports = PHYS;
