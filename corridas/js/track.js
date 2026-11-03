/* Pistas: geradas a partir de uma semente (sempre iguais para o mesmo nome), com trajetória ideal e perfil de velocidade. */
'use strict';

function buildTrack(name, cat) {
  const C = catById(cat);
  const kart = cat === 'kart';
  const rnd = mulberry32(trackSeed(name, cat));
  const ds = kart ? 1 : 2;
  const W = C.W, runoff = C.runoff;
  let best = null;
  for (let attempt = 0; attempt < 60 && !best; attempt++) {
    const target = C.len[0] + rnd() * (C.len[1] - C.len[0]);
    const n = kart ? 9 + Math.floor(rnd() * 5) : 9 + Math.floor(rnd() * 6);
    const base = [];
    for (let k = 0; k < n; k++) {
      const ang = (k / n) * Math.PI * 2 + (rnd() - 0.5) * ((Math.PI * 2) / n) * 0.55;
      const r = 0.5 + rnd() * 0.65;
      base.push([Math.cos(ang) * r * 1.35, Math.sin(ang) * r]);
    }
    // cantos arredondados com raios variados (ganchos, curvas médias e rápidas)
    const path = [];
    for (let i = 0; i < n; i++) {
      const P0 = base[(i - 1 + n) % n], P1 = base[i], P2 = base[(i + 1) % n];
      const lin = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), lout = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]);
      const din = [(P1[0] - P0[0]) / lin, (P1[1] - P0[1]) / lin], dout = [(P2[0] - P1[0]) / lout, (P2[1] - P1[1]) / lout];
      const cr = din[0] * dout[1] - din[1] * dout[0], dot = clamp(din[0] * dout[0] + din[1] * dout[1], -1, 1);
      const phi = Math.acos(dot);
      if (phi < 0.02) { path.push([P1[0], P1[1]]); continue; }
      let rr = (kart ? 0.045 : 0.025) + rnd() * (kart ? 0.12 : 0.18);
      let t = rr * Math.tan(phi / 2);
      const maxT = 0.46 * Math.min(lin, lout);
      if (t > maxT) { t = maxT; rr = t / Math.tan(phi / 2); }
      const T1 = [P1[0] - din[0] * t, P1[1] - din[1] * t];
      const sg = Math.sign(cr) || 1;
      const O = [T1[0] - din[1] * rr * sg, T1[1] + din[0] * rr * sg];
      const a1 = Math.atan2(T1[1] - O[1], T1[0] - O[0]);
      const steps = Math.max(3, Math.ceil(phi * 14));
      for (let k = 0; k <= steps; k++) { const a = a1 + sg * phi * (k / steps); path.push([O[0] + Math.cos(a) * rr, O[1] + Math.sin(a) * rr]); }
    }
    // escala para o comprimento pretendido e reamostragem uniforme
    let len = 0; for (let i = 0; i < path.length; i++) { const q = path[(i + 1) % path.length]; len += Math.hypot(q[0] - path[i][0], q[1] - path[i][1]); }
    const sc = target / len;
    const pts = resample(path.map(([x, y]) => [x * sc, y * sc]), ds);
    const geo = geometry(pts);
    // raio mínimo e espaço livre entre partes da pista
    let minR = 1e9; for (let i = 0; i < geo.n; i++) minR = Math.min(minR, 1 / Math.max(1e-6, Math.abs(geo.k[i])));
    if (minR < (kart ? 7 : 14)) continue;
    if (!clearance(geo, W / 2 + runoff + (kart ? 3 : 6))) continue;
    best = geo;
  }
  if (!best) throw new Error('pista');
  const T = best;
  T.name = name; T.cat = cat; T.W = W; T.runoff = runoff; T.ds = ds; T.kart = kart;
  // partida no meio-fim da reta mais longa
  const straight = (i) => Math.abs(T.k[i]) < 1 / (kart ? 120 : 500);
  let bestRun = 0, bestEnd = 0, run = 0;
  for (let i = 0; i < T.n * 2; i++) { if (straight(i % T.n)) { run++; if (run > bestRun) { bestRun = run; bestEnd = i; } } else run = 0; }
  bestRun = Math.min(bestRun, T.n);
  const startIdx = (bestEnd - Math.floor(bestRun * 0.35) + T.n) % T.n;
  rotateTrack(T, startIdx);
  if (rnd() < 0.5) reverseTrack(T);
  T.straightLen = bestRun * ds;
  finishTrack(T, rnd);
  return T;
}
function resample(path, ds) {
  const cum = [0];
  for (let i = 1; i <= path.length; i++) { const a = path[i - 1], b = path[i % path.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const L = cum[cum.length - 1], n = Math.round(L / ds), out = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = (k / n) * L;
    while (cum[j + 1] < s) j++;
    const a = path[j], b = path[(j + 1) % path.length], t = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  // suavizar ligeiramente
  for (let it = 0; it < 3; it++) { const c = out.map((p) => p.slice()); for (let i = 0; i < n; i++) { const p = c[(i - 1 + n) % n], q = c[(i + 1) % n]; out[i][0] = (p[0] + 2 * c[i][0] + q[0]) / 4; out[i][1] = (p[1] + 2 * c[i][1] + q[1]) / 4; } }
  return out;
}
function geometry(pts) {
  const n = pts.length;
  const x = new Float64Array(n), y = new Float64Array(n), tx = new Float64Array(n), ty = new Float64Array(n), k = new Float64Array(n), s = new Float64Array(n);
  for (let i = 0; i < n; i++) { x[i] = pts[i][0]; y[i] = pts[i][1]; }
  let L = 0;
  for (let i = 0; i < n; i++) {
    const a = (i - 1 + n) % n, b = (i + 1) % n;
    const dx = x[b] - x[a], dy = y[b] - y[a], d = Math.hypot(dx, dy);
    tx[i] = dx / d; ty[i] = dy / d;
    s[i] = L; L += Math.hypot(x[b] - x[i], y[b] - y[i]);
  }
  for (let i = 0; i < n; i++) {
    const a = (i - 1 + n) % n, b = (i + 1) % n;
    const cr = tx[a] * ty[b] - ty[a] * tx[b];
    k[i] = cr / Math.max(1e-6, Math.hypot(x[b] - x[a], y[b] - y[a]));
  }
  // curvatura suavizada
  const ks = new Float64Array(n);
  for (let i = 0; i < n; i++) { let t = 0; for (let d = -3; d <= 3; d++) t += k[(i + d + n) % n]; ks[i] = t / 7; }
  // normal para a direita (y para baixo)
  const nx = new Float64Array(n), ny = new Float64Array(n);
  for (let i = 0; i < n; i++) { nx[i] = -ty[i]; ny[i] = tx[i]; }
  return { n, x, y, tx, ty, nx, ny, k: ks, s, len: L };
}
function clearance(g, need) {
  const cell = need * 1.2, grid = new Map(), key = (a, b) => a + ',' + b;
  for (let i = 0; i < g.n; i++) { const kk = key(Math.floor(g.x[i] / cell), Math.floor(g.y[i] / cell)); let a = grid.get(kk); if (!a) grid.set(kk, (a = [])); a.push(i); }
  const skip = Math.ceil((need * 3.2) / Math.max(0.5, g.len / g.n));
  for (let i = 0; i < g.n; i += 2) {
    const cx = Math.floor(g.x[i] / cell), cy = Math.floor(g.y[i] / cell);
    for (let ax = -1; ax <= 1; ax++) for (let ay = -1; ay <= 1; ay++) {
      const a = grid.get(key(cx + ax, cy + ay)); if (!a) continue;
      for (const j of a) {
        let d = Math.abs(i - j); d = Math.min(d, g.n - d);
        if (d < skip) continue;
        if ((g.x[i] - g.x[j]) ** 2 + (g.y[i] - g.y[j]) ** 2 < need * need * 4) return false;
      }
    }
  }
  return true;
}
function rotateTrack(T, k0) {
  for (const f of ['x', 'y', 'tx', 'ty', 'nx', 'ny', 'k']) { const a = T[f], b = new Float64Array(T.n); for (let i = 0; i < T.n; i++) b[i] = a[(i + k0) % T.n]; T[f] = b; }
  let L = 0; for (let i = 0; i < T.n; i++) { T.s[i] = L; const j = (i + 1) % T.n; L += Math.hypot(T.x[j] - T.x[i], T.y[j] - T.y[i]); }
}
function reverseTrack(T) {
  for (const f of ['x', 'y', 'k']) { const a = T[f], b = new Float64Array(T.n); for (let i = 0; i < T.n; i++) b[i] = a[(T.n - i) % T.n]; T[f] = b; }
  for (let i = 0; i < T.n; i++) T.k[i] = -T.k[i];
  const g = geometry(Array.from({ length: T.n }, (_, i) => [T.x[i], T.y[i]]));
  Object.assign(T, { tx: g.tx, ty: g.ty, nx: g.nx, ny: g.ny, s: g.s, len: g.len, k: g.k });
}

// ---------- trajetória ideal (menor curvatura dentro da pista), gravilha, corretores, boxes ----------
function finishTrack(T, rnd) {
  const n = T.n, half = T.W / 2 - (T.kart ? 0.9 : 1.6);
  // deslocamento lateral da trajetória em relação ao centro
  const off = new Float64Array(n);
  const px = Float64Array.from(T.x), py = Float64Array.from(T.y);
  for (let it = 0; it < 500; it++) {
    for (let i = 0; i < n; i++) {
      const a = (i - 1 + n) % n, b = (i + 1) % n;
      const mx = (px[a] + px[b]) / 2, my = (py[a] + py[b]) / 2;
      let o = (mx - T.x[i]) * T.nx[i] + (my - T.y[i]) * T.ny[i];
      o = clamp(o, -half, half);
      off[i] = o; px[i] = T.x[i] + T.nx[i] * o; py[i] = T.y[i] + T.ny[i] * o;
    }
  }
  T.off = off; T.rx = px; T.ry = py;
  const rg = geometry(Array.from({ length: n }, (_, i) => [px[i], py[i]]));
  T.rk = rg.k;
  // gravilha no exterior das curvas, corretores nas curvas
  T.gravel = new Int8Array(n); // -1 esquerda, 1 direita, 0 nada
  T.kerb = new Uint8Array(n);
  const kc = 1 / (T.kart ? 45 : 220), kk = 1 / (T.kart ? 80 : 420);
  for (let i = 0; i < n; i++) {
    if (Math.abs(T.k[i]) > kc) { const side = T.k[i] > 0 ? -1 : 1; for (let d = -25; d <= 40; d++) T.gravel[(i + d + n) % n] = side; }
  }
  for (let i = 0; i < n; i++) if (Math.abs(T.k[i]) > kk) for (let d = -6; d <= 6; d++) T.kerb[(i + d + n) % n] = 1;
  // boxes: faixa paralela à reta da meta
  const pitHalf = Math.min(T.straightLen * 0.45, T.kart ? 0 : 320);
  T.pit = null;
  if (!T.kart && pitHalf > 120) {
    const i0 = Math.round(-pitHalf / T.ds), i1 = Math.round(pitHalf / T.ds);
    const offP = T.W / 2 + 9;
    // escolher o lado com mais espaço
    let side = 1;
    const test = (sd) => { for (let i = i0; i <= i1; i += 5) { const j = (i + n) % n; const x = T.x[j] + T.nx[j] * offP * sd, y = T.y[j] + T.ny[j] * offP * sd; if (nearestDist(T, x, y, j) < offP - 2) return false; } return true; };
    if (!test(1)) side = -1;
    T.pit = { i0, i1, side, off: offP, speed: 22.2, boxI: Math.round(pitHalf * 0.15 / T.ds) };
  }
  // decoração: árvores, bancadas
  T.trees = []; T.stands = [];
  const far = T.W / 2 + T.runoff + 7;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < n; i++) { x0 = Math.min(x0, T.x[i]); x1 = Math.max(x1, T.x[i]); y0 = Math.min(y0, T.y[i]); y1 = Math.max(y1, T.y[i]); }
  T.bbox = [x0 - 120, y0 - 120, x1 + 120, y1 + 120];
  const ntree = T.kart ? 260 : 900;
  for (let t = 0; t < ntree * 3 && T.trees.length < ntree; t++) {
    const x = lerp(T.bbox[0], T.bbox[2], rnd()), y = lerp(T.bbox[1], T.bbox[3], rnd());
    const d = nearestDist(T, x, y);
    if (d < far + (T.pit ? 14 : 0) || d > (T.kart ? 70 : 160)) continue;
    T.trees.push([x, y, (T.kart ? 2.2 : 3.5) + rnd() * (T.kart ? 2 : 4), rnd()]);
  }
  // bancadas na reta da meta e em algumas curvas
  const standAt = (i, side, length) => T.stands.push({ i, side, length, dist: T.W / 2 + T.runoff + 6 + (T.pit && side === T.pit.side && Math.abs(i < n / 2 ? i : i - n) * T.ds < 340 ? 16 : 0) });
  standAt(0, -(T.pit ? T.pit.side : 1), T.kart ? 40 : 160);
  for (let i = 0; i < n; i += Math.round(n / 6)) if (Math.abs(T.k[i]) > kc) standAt(i, T.k[i] > 0 ? -1 : 1, T.kart ? 25 : 70);
  // mini-mapa
  T.mini = { x0, y0, x1, y1 };
  T.cache = {};
}
function nearestDist(T, x, y, hint) {
  let best = 1e18;
  if (hint !== undefined) {
    for (let d = -400; d <= 400; d += 2) { const j = (hint + d + T.n * 4) % T.n; const q = (T.x[j] - x) ** 2 + (T.y[j] - y) ** 2; if (q < best) best = q; }
    // também verificar o resto, para apanhar outras partes da pista
  }
  for (let j = 0; j < T.n; j += 3) { const q = (T.x[j] - x) ** 2 + (T.y[j] - y) ** 2; if (q < best) best = q; }
  return Math.sqrt(best);
}
// projeção de um ponto na pista: índice mais perto e desvio lateral
function project(T, x, y, hint) {
  let bi = hint, bd = 1e18;
  for (let d = -40; d <= 40; d++) { const j = (hint + d + T.n) % T.n; const q = (T.x[j] - x) ** 2 + (T.y[j] - y) ** 2; if (q < bd) { bd = q; bi = j; } }
  if (bd > 60 * 60) for (let j = 0; j < T.n; j++) { const q = (T.x[j] - x) ** 2 + (T.y[j] - y) ** 2; if (q < bd) { bd = q; bi = j; } }
  const lat = (x - T.x[bi]) * T.nx[bi] + (y - T.y[bi]) * T.ny[bi];
  const along = (x - T.x[bi]) * T.tx[bi] + (y - T.y[bi]) * T.ty[bi];
  return { i: bi, lat, s: T.s[bi] + along };
}
// perfil de velocidade para um carro (curvas, travagens e acelerações com os limites reais do carro)
function speedProfile(T, car) {
  const key = car.key; if (T.cache[key]) return T.cache[key];
  const n = T.n, g = 9.81, v = new Float64Array(n);
  const mu = car.mu, m = car.m, cl = car.cl;
  for (let i = 0; i < n; i++) {
    const k = Math.abs(T.rk[i]);
    const den = m * k - mu * cl;
    v[i] = den <= 0 ? car.vtop : Math.min(car.vtop, Math.sqrt((mu * m * g) / den));
  }
  const accel = (sp) => { const F = Math.min(car.P / Math.max(sp, 6), m * car.acc0, mu * (m * g * (1 - car.a / car.L) + cl * sp * sp * 0.55)); return (F - car.cd * sp * sp) / m; };
  const brake = (sp) => (mu * (m * g + cl * sp * sp) * car.brk + car.cd * sp * sp) / m;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; const lim = Math.sqrt(Math.max(0, v[i] * v[i] + 2 * Math.max(0, accel(v[i])) * T.ds)); if (v[j] > lim) v[j] = lim; }
    for (let i = n - 1; i >= 0; i--) { const j = (i + 1) % n; const lim = Math.sqrt(v[j] * v[j] + 2 * brake(v[j]) * T.ds); if (v[i] > lim) v[i] = lim; }
  }
  let t = 0; for (let i = 0; i < n; i++) t += T.ds / Math.max(1, v[i]);
  const res = { v, lap: t };
  T.cache[key] = res;
  return res;
}
