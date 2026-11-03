/* Império Mundial — jogo de estratégia arcade. Tudo corre no browser, sem servidor. */
'use strict';
(() => {
const M = window.MAPA;
const $ = (s) => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'k' : n >= 1000 ? (n / 1e3).toFixed(1) + 'k' : Math.round(n).toString());
const flagOf = (a2) => String.fromCodePoint(...[...a2].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));

// ---------- Dados dos países ----------
// Riqueza (multiplica o rendimento) e força militar (qualidade das tropas).
const WEALTH = { US: 4.2, CN: 3.4, JP: 3, DE: 3, IN: 2.2, GB: 2.7, FR: 2.6, IT: 2.2, BR: 1.9, CA: 2.3, RU: 1.9, KR: 2.4, AU: 2.2, ES: 2, MX: 1.6, ID: 1.5, NL: 2.5, SA: 2.3, TR: 1.6, CH: 2.9, PL: 1.7, SE: 2.4, BE: 2.4, AR: 1.4, NO: 2.7, AT: 2.4, AE: 2.7, IL: 2.5, IE: 2.7, DK: 2.5, PT: 1.6, GR: 1.5, CZ: 1.8, FI: 2.3, NZ: 2.1, QA: 2.8, KW: 2.4, TW: 2.4, SG: 2.8, MY: 1.6, TH: 1.5, VN: 1.3, PH: 1.2, EG: 1.2, ZA: 1.4, NG: 1.1, CL: 1.6, CO: 1.3, PE: 1.3, IR: 1.3, UA: 1.1, KZ: 1.3, HU: 1.6, RO: 1.5, LU: 3, IS: 2.3, HR: 1.5, SI: 1.8, SK: 1.6, EE: 1.7, LT: 1.6, LV: 1.5, UY: 1.5, OM: 1.7, BH: 2, CY: 1.7, BG: 1.3 };
const POOR = 'AF SO CF TD NE ML SS ER BI MW MZ CD LR SL GN GW GM MG TG BF HT YE KP NP TJ KG SD ET UG RW ZW'.split(' ');
POOR.forEach((a) => (WEALTH[a] = 0.75));
const MIL = { US: 12, RU: 9, CN: 9, IN: 6, GB: 4.5, FR: 4.5, KR: 3.5, JP: 3.5, TR: 3.5, PK: 3, IL: 3.5, DE: 3, IT: 2.5, EG: 2.5, IR: 3, BR: 2.5, UA: 2.5, KP: 3, SA: 2.5, AU: 2.2, ES: 2, PL: 2.2, ID: 2, VN: 2.2, TW: 2.2, GR: 1.8, SE: 1.8, FI: 1.8, NO: 1.6, CA: 2, MX: 1.6, DZ: 1.8, MA: 1.4, TH: 1.6, NG: 1.4, ET: 1.4, CO: 1.4, AR: 1.4, CL: 1.4, PT: 1.4, NL: 1.5, BY: 1.4, KZ: 1.3, SY: 1.3, IQ: 1.5, MM: 1.4, AZ: 1.3, AE: 1.6, PH: 1.3, MY: 1.3, VE: 1.3, PE: 1.2, CU: 1.2, ZA: 1.5, CH: 1.5, AT: 1.2, RO: 1.4, HU: 1.2, CZ: 1.3 };
const ALLIANCES = [
  ['Aliança Atlântica', '#4cc9f0', 'US CA GB FR DE IT ES PT NL BE LU DK NO IS PL CZ SK HU RO BG GR TR HR SI AL ME MK EE LV LT FI SE'],
  ['Pacto Euroasiático', '#ff4d6d', 'RU BY KZ AM KG TJ'],
  ['Eixo Oriental', '#f77f00', 'CN KP PK LA KH'],
  ['Liga Árabe', '#06d6a0', 'SA EG AE QA KW OM JO IQ SY LB YE PS'],
  ['União do Magrebe', '#a3b18a', 'MA DZ TN LY MR'],
  ['Comunidade Austral', '#e9c46a', 'ZA NA BW ZW ZM MZ MW AO TZ CD MG SZ LS'],
  ['Liga da África Ocidental', '#80ed99', 'NG GH CI SN ML BF NE GN SL LR TG BJ GM GW'],
  ['Mercosul', '#ffd166', 'BR AR UY PY BO'],
  ['Aliança do Pacífico', '#c77dff', 'AU NZ JP KR PH TW'],
  ['Pacto Andino', '#90e0ef', 'CO PE EC CL'],
  ['ASEAN', '#ff70a6', 'ID MY TH VN BN MM'],
  ['Aliança Bolivariana', '#b5179e', 'VE CU NI'],
  ['Pacto do Corno de África', '#43aa8b', 'KE UG RW BI SS ET ER SO DJ SD'],
  ['Liga Centro-Americana', '#f3722c', 'GT HN SV CR PA BZ'],
];
const PALETTE = ['#ff4d6d', '#ffb703', '#06d6a0', '#4cc9f0', '#c77dff', '#f77f00', '#80ed99', '#4361ee', '#ff70a6', '#e9c46a', '#90e0ef', '#f94144', '#43aa8b', '#b5179e', '#a3b18a', '#ef8354'];

// ---------- Mundo ----------
const NC = M.countries.length, NP = M.provinces.length;
const HX = []; // quadrados do mapa
const hexKey = new Map();
for (let i = 0; i < M.hexes.length; i += 3) {
  const c = M.hexes[i], r = M.hexes[i + 1], p = M.hexes[i + 2];
  const x = -180 + (c + 0.5) * M.S, y = M.Y0 + (r + 0.5) * M.S;
  hexKey.set(c + ',' + r, HX.length);
  HX.push({ c, r, p, x, y, nb: null });
}
// vizinhos: este, sul, oeste, norte (a aresta d fica entre os cantos d e d+1)
const NB4 = [[1, 0], [0, 1], [-1, 0], [0, -1]];
for (const h of HX) h.nb = NB4.map(([dc, dr]) => hexKey.get(h.c + dc + ',' + (h.r + dr)) ?? -1);
const R = M.S / 2; // meio lado do quadrado
const ND = 4, VX = [1, 1, -1, -1], VY = [-1, 1, 1, -1]; // cantos: cima-dir, baixo-dir, baixo-esq, cima-esq

let C, P, alliances, G; // estado
function provHexes() {
  const lists = Array.from({ length: NP }, () => []);
  HX.forEach((h, i) => lists[h.p].push(i));
  return lists;
}
const PH = provHexes();
// ponto de etiqueta: quadrado mais perto do centro
const LABEL = M.provinces.map((p, j) => {
  let best = PH[j][0], bd = 1e9;
  for (const i of PH[j]) { const d = (HX[i].x - p.x) ** 2 + (HX[i].y - p.y) ** 2; if (d < bd) { bd = d; best = i; } }
  return [HX[best].x, HX[best].y];
});
// cores: países vizinhos com cores diferentes
const COLORS = (() => {
  const nb = Array.from({ length: NC }, () => new Set());
  M.provinces.forEach((p) => p.adj.forEach((q) => { const a = p.c, b = M.provinces[q].c; if (a !== b) { nb[a].add(b); nb[b].add(a); } }));
  const order = [...Array(NC).keys()].sort((a, b) => nb[b].size - nb[a].size);
  const col = new Array(NC).fill(-1);
  for (const c of order) {
    const used = new Set([...nb[c]].map((x) => col[x]));
    let k = (c * 7) % PALETTE.length;
    for (let t = 0; t < PALETTE.length && used.has(k); t++) k = (k + 1) % PALETTE.length;
    col[c] = k;
  }
  return col.map((k) => PALETTE[k]);
})();
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function newGame(playerIdx) {
  C = M.countries.map((c, i) => {
    const m = MIL[c.a2] || 1;
    return { i, a2: c.a2, n: c.n, flag: flagOf(c.a2), cap: c.cap, color: COLORS[i], w: WEALTH[c.a2] || 1, m, q: 1 + 0.06 * m, eco: 0, mil: 0, def: 0, money: 0, troops: 0, alive: true, wars: new Set(), ally: -1, rel: 0 };
  });
  P = M.provinces.map((p, j) => ({ j, n: p.n, owner: p.c, orig: p.c, hx: PH[j].length * M.unit, adj: p.adj, sea: p.sea, gar: 0, occ: 0 }));
  alliances = ALLIANCES.map(([name, color, list], id) => {
    const members = new Set();
    list.split(' ').forEach((a2) => { const c = C.find((x) => x.a2 === a2); if (c) { members.add(c.i); c.ally = id; } });
    return { id, name, color, members };
  });
  G = { day: 1, player: playerIdx, truce: {}, warStart: {}, taken: {}, pending: [], won: false, offers: 0, aiWars: 0, seenTips: {} };
  for (const c of C) {
    const np = P.filter((p) => p.owner === c.i).length;
    c.troops = Math.round(10 + np * 4 * c.q + c.m * 6);
    c.money = 20 * c.w;
    c.rel = c.ally >= 0 && c.ally === C[playerIdx].ally ? 50 : ri(-10, 15);
  }
  for (const p of P) p.gar = gmax(p);
  const me = C[playerIdx];
  me.money = 60 + income(me) * 8;
  me.troops = Math.max(me.troops, 25);
  G.baseCost = 20 + income(me) * 8;
}

// ---------- Regras ----------
const provsOf = (ci) => P.filter((p) => p.owner === ci);
const isCap = (p) => C[p.owner].cap === p.j;
const value = (p) => (0.6 + 0.25 * p.hx) * C[p.orig].w;
const gmax = (p) => { const o = C[p.owner]; return (8 + 1.5 * p.hx) * (isCap(p) ? 1.6 : 1) * (1 + 0.25 * o.def) * o.q * (p.owner === G.player ? 1.25 : 1); };
const homeBonus = (p) => (p.orig === p.owner ? 1.3 : 1);
function income(c) {
  let s = 0;
  for (const p of P) if (p.owner === c.i) s += value(p) * (p.occ > 0 ? 0.5 : 1);
  return s * (1 + 0.2 * c.eco);
}
const atWar = (a, b) => C[a].wars.has(b);
const allied = (a, b) => a !== b && C[a].ally >= 0 && C[a].ally === C[b].ally;
const pairKey = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
const power = (c) => c.troops * c.q + P.reduce((s, p) => s + (p.owner === c.i ? p.gar * c.q : 0), 0);
const upCost = (lvl) => Math.round(G.baseCost * Math.pow(1.6, lvl));
const recruitCost = () => 1.2;
const airCost = () => Math.round(15 + income(C[G.player]) * 2.5);
const giftCost = (c) => Math.round(15 + income(c) * 4);
const regen = (c) => 0.5 + provsOf(c.i).length * 0.18 * (1 + 0.2 * c.mil);

// fontes de ataque: província do atacante que toca no alvo
function attackSource(att, t) {
  let best = null, bd = -1, sea = false;
  for (const q of P[t].adj) if (P[q].owner === att && P[q].gar > bd) { bd = P[q].gar; best = q; }
  if (best !== null) return { from: best, sea: false };
  for (const q of P[t].sea) if (P[q].owner === att && P[q].gar > bd) { bd = P[q].gar; best = q; sea = true; }
  return best !== null ? { from: best, sea } : null;
}
function winChance(n, att, t, sea) {
  const a = C[att], d = C[P[t].owner];
  const A = n * a.q * (1 + 0.1 * a.mil) * (sea ? 0.8 : 1);
  const res = Math.min(d.troops * 0.3, Math.max(4, P[t].gar) * 1.5);
  const D = (Math.max(0.5, P[t].gar) + res) * d.q * (1 + 0.1 * d.def) * (isCap(P[t]) ? 1.25 : 1) * homeBonus(P[t]);
  // A*U(0.85,1.2) > D*U(0.85,1.2)
  const r = A / D;
  return clamp((r - 0.7) / 0.7, 0, 1);
}

// ---------- Ecrã / câmara ----------
const cv = $('#map'), ctx = cv.getContext('2d');
let DPR = 1, VW = 0, VH = 0;
const cam = { x: 0, y: 40, s: 2 };
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  const r = cv.getBoundingClientRect();
  VW = r.width; VH = r.height;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  clampCam();
}
const minScale = () => Math.max(VW / 370, VH / 170, 0.8);
function clampCam() {
  cam.s = clamp(cam.s, minScale(), 60);
  const hw = VW / 2 / cam.s, hh = VH / 2 / cam.s;
  const x0 = -182, x1 = 182, y0 = M.Y0 - 4, y1 = M.Y0 + M.rows * M.S + 2;
  cam.x = x1 - x0 < hw * 2 ? 0 : clamp(cam.x, x0 + hw, x1 - hw);
  cam.y = y1 - y0 < hh * 2 ? (y0 + y1) / 2 : clamp(cam.y, y0 + hh, y1 - hh);
}
const sx = (x) => (x - cam.x) * cam.s + VW / 2;
const sy = (y) => (y - cam.y) * cam.s + VH / 2;
const wx = (px) => (px - VW / 2) / cam.s + cam.x;
const wy = (py) => (py - VH / 2) / cam.s + cam.y;
let camAnim = null;
function flyTo(x, y, s, ms = 700) { camAnim = { x0: cam.x, y0: cam.y, s0: cam.s, x, y, s, t0: performance.now(), ms }; }
function focusCountry(ci, ms) {
  let ps = provsOf(ci); if (!ps.length) return;
  // ignorar territórios muito longe da capital (ex.: Rússia do outro lado da linha de data)
  const cx = LABEL[C[ci].cap][0], cy = LABEL[C[ci].cap][1];
  const nearCap = ps.filter((p) => Math.abs(LABEL[p.j][0] - cx) < 70 && Math.abs(LABEL[p.j][1] - cy) < 45);
  if (nearCap.length) ps = nearCap;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const p of ps) for (const i of PH[p.j]) { x0 = Math.min(x0, HX[i].x); x1 = Math.max(x1, HX[i].x); y0 = Math.min(y0, HX[i].y); y1 = Math.max(y1, HX[i].y); }
  const pad = 14;
  const s = clamp(Math.min(VW / (x1 - x0 + pad * 2), VH / (y1 - y0 + pad * 2)), 3, 16);
  flyTo((x0 + x1) / 2, (y0 + y1) / 2, s, ms);
}

// ---------- Cache do mapa ----------
const K = 10; // píxeis por grau na cache
const CX0 = -184, CY0 = M.Y0 - 4;
const cache = document.createElement('canvas');
cache.width = Math.ceil(368 * K); cache.height = Math.ceil((M.rows * M.S + 8) * K);
const cctx = cache.getContext('2d');
let cacheDirty = true;
function hexPath(c, x, y, r) {
  c.moveTo(x + VX[0] * r, y + VY[0] * r);
  for (let k = 1; k < ND; k++) c.lineTo(x + VX[k] * r, y + VY[k] * r);
  c.closePath();
}
function colorOfHex(h) { return C[P[h.p].owner].color; }
// desenha uma lista de quadrados com uma transformação (escala s, origem ox, oy)
function drawHexes(c, list, s, ox, oy) {
  const r = R * s;
  // agrupar por cor para menos mudanças de estilo
  const groups = new Map();
  for (const i of list) { const col = colorOfHex(HX[i]); let g = groups.get(col); if (!g) groups.set(col, (g = [])); g.push(i); }
  for (const [col, ids] of groups) {
    c.fillStyle = shade(col, -0.45); c.beginPath();
    for (const i of ids) hexPath(c, (HX[i].x - ox) * s, (HX[i].y - oy) * s, r * 1.01);
    c.fill();
    c.fillStyle = col; c.beginPath();
    for (const i of ids) hexPath(c, (HX[i].x - ox) * s - r * 0.06, (HX[i].y - oy) * s - r * 0.06, r * 0.84);
    c.fill();
    c.fillStyle = shade(col, 0.35); c.beginPath();
    for (const i of ids) { const x = (HX[i].x - ox) * s - r * 0.55, y = (HX[i].y - oy) * s - r * 0.55; c.rect(x, y, r * 0.5, r * 0.5); }
    c.globalAlpha = 0.5; c.fill(); c.globalAlpha = 1;
  }
  // fronteiras
  c.lineCap = 'round';
  const prov = new Path2D(), nat = new Path2D(), coast = new Path2D();
  for (const i of list) {
    const h = HX[i], x = (h.x - ox) * s, y = (h.y - oy) * s;
    for (let d = 0; d < ND; d++) {
      const n = h.nb[d];
      const k1 = d, k2 = (d + 1) % ND;
      const ax = x + VX[k1] * r, ay = y + VY[k1] * r, bx = x + VX[k2] * r, by = y + VY[k2] * r;
      if (n < 0) { coast.moveTo(ax, ay); coast.lineTo(bx, by); continue; }
      const hn = HX[n];
      if (hn.p === h.p) continue;
      if (n < i && list.length > 1000) continue; // cada aresta uma vez (cache)
      if (P[hn.p].owner !== P[h.p].owner) { nat.moveTo(ax, ay); nat.lineTo(bx, by); } else { prov.moveTo(ax, ay); prov.lineTo(bx, by); }
    }
  }
  c.strokeStyle = 'rgba(10,14,40,.55)'; c.lineWidth = Math.max(0.7, r * 0.16); c.stroke(prov);
  c.strokeStyle = '#0a0e24'; c.lineWidth = Math.max(1.2, r * 0.4); c.stroke(nat);
  c.strokeStyle = 'rgba(160,230,255,.55)'; c.lineWidth = Math.max(0.8, r * 0.12); c.stroke(coast);
}
const ALL = HX.map((_, i) => i);
function rebuildCache() {
  cctx.clearRect(0, 0, cache.width, cache.height);
  drawHexes(cctx, ALL, K, CX0, CY0);
  cacheDirty = false;
}

// ---------- Efeitos ----------
const FX = { moves: [], parts: [], texts: [], rings: [], flips: [], planes: [] };
let shakeT = 0;
function boom(x, y, big = 1) {
  for (let k = 0; k < 16 * big; k++) {
    const a = rnd(0, Math.PI * 2), v = rnd(0.6, 3.2) * big;
    FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.8, life: rnd(0.5, 1.1), t: 0, col: pick(['#fff3b0', '#ffc93c', '#ff8a3c', '#ff3d5a']), r: rnd(0.25, 0.6) * big, smoke: false });
  }
  for (let k = 0; k < 6 * big; k++) FX.parts.push({ x, y, vx: rnd(-0.6, 0.6), vy: rnd(-1.2, -0.3), life: rnd(1, 1.8), t: 0, col: '#55607f', r: rnd(0.5, 1.1) * big, smoke: true });
  FX.rings.push({ x, y, t: 0, life: 0.6, max: 3.5 * big, col: '#ffd75e' });
  sfx.boom();
}
function floatText(x, y, txt, col, size = 1) { FX.texts.push({ x, y, txt, col, t: 0, life: 1.6, size }); }
function flipProvince(j, fromX, fromY, oldCol) {
  const now = performance.now();
  for (const i of PH[j]) {
    const d = Math.hypot(HX[i].x - fromX, HX[i].y - fromY);
    FX.flips.push({ i, old: oldCol, t0: now + d * 45, dur: 380 });
  }
}

// ---------- Desenho ----------
let wavePat = null;
function makeWave() {
  const t = document.createElement('canvas'); t.width = t.height = 64;
  const g = t.getContext('2d');
  g.strokeStyle = 'rgba(80,120,220,.16)'; g.lineWidth = 1.5;
  for (let y = 8; y < 64; y += 16) { g.beginPath(); for (let x = 0; x <= 64; x += 4) g.lineTo(x, y + Math.sin((x / 64) * Math.PI * 2) * 3); g.stroke(); }
  g.fillStyle = 'rgba(120,170,255,.12)'; g.fillRect(30, 2, 2, 2); g.fillRect(6, 40, 2, 2);
  wavePat = ctx.createPattern(t, 'repeat');
}
const flagCache = new Map();
function flagImg(a2) {
  let im = flagCache.get(a2);
  if (!im) {
    im = document.createElement('canvas'); im.width = im.height = 48;
    const g = im.getContext('2d'); g.font = '38px system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(flagOf(a2), 24, 27); flagCache.set(a2, im);
  }
  return im;
}
let sel = -1; // província selecionada
let attackable = new Set();
function computeAttackable() {
  attackable = new Set();
  const me = G.player;
  for (const p of P) if (p.owner !== me && atWar(me, p.owner) && attackSource(me, p.j)) attackable.add(p.j);
}

function render(now) {
  const dt = Math.min(0.05, (now - (render.last || now)) / 1000); render.last = now;
  if (camAnim) {
    const k = clamp((now - camAnim.t0) / camAnim.ms, 0, 1), e = 1 - Math.pow(1 - k, 3);
    cam.x = camAnim.x0 + (camAnim.x - camAnim.x0) * e; cam.y = camAnim.y0 + (camAnim.y - camAnim.y0) * e;
    cam.s = camAnim.s0 * Math.pow(camAnim.s / camAnim.s0, e);
    clampCam(); if (k >= 1) camAnim = null;
  }
  if (C && cacheDirty) rebuildCache();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // oceano
  const grd = ctx.createRadialGradient(VW / 2, VH * 0.4, 10, VW / 2, VH / 2, Math.max(VW, VH));
  grd.addColorStop(0, '#16205a'); grd.addColorStop(1, '#070b22');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, VW, VH);
  if (!wavePat) makeWave();
  const off = (now / 60) % 64;
  ctx.save(); ctx.translate(-((cam.x * cam.s) % 64) + off, -((cam.y * cam.s) % 64)); ctx.fillStyle = wavePat; ctx.fillRect(-64, -64, VW + 128, VH + 128); ctx.restore();
  if (!C) return;
  let ox = 0, oy = 0;
  if (shakeT > 0) { shakeT -= dt; ox = rnd(-1, 1) * shakeT * 14; oy = rnd(-1, 1) * shakeT * 14; }
  ctx.save(); ctx.translate(ox, oy);
  // terra
  if (cam.s <= K * 1.25) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(cache, sx(CX0), sy(CY0), cache.width / K * cam.s, cache.height / K * cam.s);
  } else {
    const x0 = wx(-20), x1 = wx(VW + 20), y0 = wy(-20), y1 = wy(VH + 20);
    const vis = [];
    for (let i = 0; i < HX.length; i++) { const h = HX[i]; if (h.x > x0 && h.x < x1 && h.y > y0 && h.y < y1) vis.push(i); }
    ctx.save(); ctx.translate(sx(0), sy(0)); drawHexes(ctx, vis, cam.s, 0, 0); ctx.restore();
  }
  const r = R * cam.s;
  // quadrados a mudar de dono
  FX.flips = FX.flips.filter((f) => now < f.t0 + f.dur);
  for (const f of FX.flips) {
    const h = HX[f.i], x = sx(h.x), y = sy(h.y);
    const k = (now - f.t0) / f.dur;
    if (k < 0) { ctx.fillStyle = f.old; ctx.beginPath(); hexPath(ctx, x, y, r * 0.95); ctx.fill(); continue; }
    const sc = Math.abs(Math.cos(k * Math.PI));
    ctx.fillStyle = '#0a0e24'; ctx.beginPath(); hexPath(ctx, x, y, r); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.scale(1, Math.max(0.05, sc));
    ctx.fillStyle = k < 0.5 ? f.old : colorOfHex(h); ctx.beginPath(); hexPath(ctx, 0, 0, r * 0.95); ctx.fill();
    if (k > 0.5) { ctx.fillStyle = `rgba(255,255,255,${(1 - k) * 1.4})`; ctx.fill(); }
    ctx.restore();
  }
  // linhas: fronteira do império, frentes de guerra, seleção
  const me = G.player, pulse = 0.5 + 0.5 * Math.sin(now / 220);
  const empire = new Path2D(), front = new Path2D(), selP = new Path2D(), allyP = new Path2D();
  const vx0 = -r * 2, vx1 = VW + r * 2, vy0 = -r * 2, vy1 = VH + r * 2;
  for (let i = 0; i < HX.length; i++) {
    const h = HX[i], ow = P[h.p].owner;
    const isMe = ow === me, isSel = h.p === sel;
    if (!isMe && !isSel && !C[me].wars.has(ow) && !allied(me, ow)) continue;
    const x = sx(h.x), y = sy(h.y);
    if (x < vx0 || x > vx1 || y < vy0 || y > vy1) continue;
    for (let d = 0; d < ND; d++) {
      const n = h.nb[d];
      const pn = n < 0 ? -1 : HX[n].p, on = n < 0 ? -1 : P[pn].owner;
      const ax = x + VX[d] * r, ay = y + VY[d] * r, bx = x + VX[(d + 1) % ND] * r, by = y + VY[(d + 1) % ND] * r;
      if (isSel && pn !== h.p) { selP.moveTo(ax, ay); selP.lineTo(bx, by); }
      if (isMe && on !== me) {
        if (on >= 0 && C[me].wars.has(on)) { front.moveTo(ax, ay); front.lineTo(bx, by); } else { empire.moveTo(ax, ay); empire.lineTo(bx, by); }
      } else if (!isMe && allied(me, ow) && on !== ow && on !== me) { allyP.moveTo(ax, ay); allyP.lineTo(bx, by); }
    }
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgba(46,229,157,${0.35 + 0.2 * pulse})`; ctx.lineWidth = Math.max(1.5, r * 0.18); ctx.stroke(allyP);
  ctx.shadowColor = '#ffc93c'; ctx.shadowBlur = 8 + pulse * 8;
  ctx.strokeStyle = '#ffd75e'; ctx.lineWidth = Math.max(2, r * 0.26); ctx.stroke(empire);
  ctx.shadowColor = '#ff3d5a'; ctx.strokeStyle = `rgba(255,61,90,${0.6 + 0.4 * pulse})`; ctx.lineWidth = Math.max(2.5, r * 0.32); ctx.stroke(front);
  ctx.shadowColor = '#fff'; ctx.shadowBlur = 12; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, r * 0.22 + pulse * 1.5); ctx.setLineDash([r * 0.6, r * 0.4]); ctx.lineDashOffset = -now / 40; ctx.stroke(selP); ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  // capitais, nomes, guarnições
  drawLabels(now, pulse);
  // movimentos de tropas
  drawMoves(now);
  drawPlanes(now);
  // partículas
  for (const p of FX.parts) { p.t += dt; p.x += p.vx * dt * 2.2; p.y += p.vy * dt * 2.2; if (!p.smoke) p.vy += dt * 3; p.vx *= 0.98; }
  FX.parts = FX.parts.filter((p) => p.t < p.life);
  for (const p of FX.parts) {
    const k = 1 - p.t / p.life;
    ctx.globalAlpha = p.smoke ? k * 0.5 : k;
    ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), Math.max(1, p.r * cam.s * (p.smoke ? 2 - k : 1)), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const g of FX.rings) g.t += dt;
  FX.rings = FX.rings.filter((g) => g.t < g.life);
  for (const g of FX.rings) {
    const k = g.t / g.life;
    ctx.strokeStyle = g.col; ctx.globalAlpha = 1 - k; ctx.lineWidth = 3 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(sx(g.x), sy(g.y), Math.max(2, g.max * k * cam.s), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (const t of FX.texts) t.t += dt;
  FX.texts = FX.texts.filter((t) => t.t < t.life);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const t of FX.texts) {
    const k = t.t / t.life, pop = k < 0.15 ? 0.6 + (k / 0.15) * 0.6 : 1.2 - Math.min(0.2, (k - 0.15));
    ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
    ctx.font = `${Math.round(15 * t.size * pop)}px Bungee, Impact, sans-serif`;
    const x = sx(t.x), y = sy(t.y) - k * 40;
    ctx.lineWidth = 4; ctx.strokeStyle = '#0a0e24'; ctx.strokeText(t.txt, x, y);
    ctx.fillStyle = t.col; ctx.fillText(t.txt, x, y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function pill(x, y, txt, bg, fg, border) {
  ctx.font = '700 11px "Chakra Petch", sans-serif';
  const w = ctx.measureText(txt).width + 10, h = 15;
  ctx.fillStyle = bg; ctx.strokeStyle = border; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2, w, h, 7) : ctx.rect(x - w / 2, y - h / 2, w, h); ctx.fill(); ctx.stroke();
  ctx.fillStyle = fg; ctx.fillText(txt, x, y + 0.5);
}
function drawLabels(now, pulse) {
  const me = G.player, s = cam.s;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // nomes dos países
  if (s >= 2.2) {
    const boxes = [];
    for (const c of [...C].sort((a, b) => (b.i === me) - (a.i === me) || (b._np || 0) - (a._np || 0))) {
      if (!c.alive) continue;
      const np = c._np || 0;
      if (s < 3.5 && np < 6) continue;
      if (s < 6 && np < 2 && c.i !== me) continue;
      const [lx, ly] = LABEL[c.cap];
      const x = sx(lx), y = sy(ly) - (s >= 5 ? clamp(s * 0.9, 4, 12) * 2.6 + 10 : Math.max(10, R * s * 0.9));
      if (x < -60 || x > VW + 60 || y < -20 || y > VH + 20) continue;
      const fs = clamp(s * 1.3, 9, 15);
      ctx.font = `${fs}px Bungee, Impact, sans-serif`;
      const tw = ctx.measureText(c.n.toUpperCase()).width / 2 + 3, th = fs * 0.7;
      if (boxes.some((b) => Math.abs(b[0] - x) < b[2] + tw && Math.abs(b[1] - y) < th * 2)) continue;
      boxes.push([x, y, tw]);
      ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(10,14,36,.85)';
      ctx.strokeText(c.n.toUpperCase(), x, y); ctx.fillStyle = c.i === me ? '#ffd75e' : '#f4f1ff'; ctx.fillText(c.n.toUpperCase(), x, y);
    }
  }
  // capitais
  for (const c of C) {
    if (!c.alive) continue;
    if (s < 2.6 && c.i !== me && !C[me].wars.has(c.i)) continue;
    const [lx, ly] = LABEL[c.cap];
    const x = sx(lx), y = sy(ly);
    if (x < -20 || x > VW + 20 || y < -20 || y > VH + 20) continue;
    const z = clamp(s * 0.9, 4, 12);
    const bob = Math.sin(now / 400 + c.i) * 1.5;
    if (s >= 5) { const im = flagImg(c.a2); ctx.drawImage(im, x - z * 1.1, y - z * 1.1 - z * 1.4 + bob, z * 2.2, z * 2.2); }
    star(x, y + (s >= 5 ? 0 : bob * 0.3), z * 0.55, c.i === me ? '#ffd75e' : '#ffffff');
  }
  // guarnições
  if (s >= 6) {
    for (const p of P) {
      const show = p.owner === me || C[me].wars.has(p.owner) || s >= 11 || p.j === sel;
      if (!show) continue;
      const [lx, ly] = LABEL[p.j];
      const x = sx(lx), y = sy(ly) + (isCap(p) ? R * s * 0.55 : 0);
      if (x < -30 || x > VW + 30 || y < -20 || y > VH + 20) continue;
      const enemy = C[me].wars.has(p.owner);
      pill(x, y, fmt(p.gar), p.owner === me ? '#3d2c00' : enemy ? '#4a0f1e' : '#151c3d', p.owner === me ? '#ffe7a3' : enemy ? '#ffc2cc' : '#dfe3ff', p.owner === me ? '#ffc93c' : enemy ? '#ff3d5a' : '#2f3c78');
      if (p.occ > 0 && p.owner === me) { ctx.font = '10px sans-serif'; ctx.fillText('⚑', x + 16, y - 9); }
    }
  }
  // alvos atacáveis
  for (const j of attackable) {
    const [lx, ly] = LABEL[j];
    const x = sx(lx), y = sy(ly);
    if (x < -20 || x > VW + 20 || y < -20 || y > VH + 20) continue;
    const z = clamp(cam.s * 1.1, 6, 16) * (0.85 + pulse * 0.25);
    ctx.strokeStyle = '#ff3d5a'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(x, y, z, 0, Math.PI * 2);
    for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2 + now / 900; ctx.moveTo(x + Math.cos(a) * z * 0.6, y + Math.sin(a) * z * 0.6); ctx.lineTo(x + Math.cos(a) * z * 1.35, y + Math.sin(a) * z * 1.35); }
    ctx.stroke(); ctx.globalAlpha = 1;
  }
}
function star(x, y, r, col) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k & 1 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = col; ctx.strokeStyle = '#0a0e24'; ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
}
function curve(m, k) {
  const [x0, y0] = LABEL[m.from], [x1, y1] = LABEL[m.to];
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(6, len * 0.25) * (m.sea ? 1.6 : 1);
  const cx = (x0 + x1) / 2 - (dy / len) * bend, cy = (y0 + y1) / 2 + (dx / len) * bend;
  const u = 1 - k;
  return [u * u * x0 + 2 * u * k * cx + k * k * x1, u * u * y0 + 2 * u * k * cy + k * k * y1, cx, cy];
}
function drawMoves(now) {
  const done = [];
  for (const m of FX.moves) {
    if (m.paused === undefined) m.paused = 0;
    const k = clamp((now - m.t0 - m.paused) / m.dur, 0, 1);
    const col = C[m.att].color;
    const [x0, y0] = LABEL[m.from], [x1, y1] = LABEL[m.to];
    const [, , cx, cy] = curve(m, 0);
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, cam.s * 0.45); ctx.globalAlpha = 0.85;
    ctx.setLineDash([8, 6]); ctx.lineDashOffset = -now / 25;
    ctx.beginPath(); ctx.moveTo(sx(x0), sy(y0)); ctx.quadraticCurveTo(sx(cx), sy(cy), sx(x1), sy(y1)); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    // ponta da seta
    const [ex, ey] = curve(m, 0.97);
    const a = Math.atan2(sy(y1) - sy(ey), sx(x1) - sx(ex));
    const hs = Math.max(7, cam.s * 1.2);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(sx(x1), sy(y1)); ctx.lineTo(sx(x1) - Math.cos(a - 0.5) * hs, sy(y1) - Math.sin(a - 0.5) * hs); ctx.lineTo(sx(x1) - Math.cos(a + 0.5) * hs, sy(y1) - Math.sin(a + 0.5) * hs); ctx.fill();
    // unidade
    const [ux, uy] = curve(m, k);
    const z = clamp(cam.s * 1.2, 7, 15);
    const X = sx(ux), Y = sy(uy) + Math.sin(now / 80) * 1.2;
    ctx.fillStyle = shade(col, -0.5); ctx.beginPath(); ctx.arc(X, Y + 2, z, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, z, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0a0e24'; ctx.font = `${Math.round(z * 1.05)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(m.sea ? '⚓' : '⚔', X, Y + 1);
    pill(X, Y - z - 9, fmt(m.n), '#0a0e24', '#fff', col);
    if (Math.random() < 0.3) FX.parts.push({ x: ux, y: uy, vx: rnd(-0.2, 0.2), vy: rnd(-0.3, 0), life: 0.6, t: 0, col: m.sea ? '#bfe9ff' : '#8a7f6a', r: 0.35, smoke: true });
    if (k >= 1) done.push(m);
  }
  for (const m of done) { FX.moves.splice(FX.moves.indexOf(m), 1); resolveBattle(m); }
}
function drawPlanes(now) {
  const done = [];
  for (const pl of FX.planes) {
    const k = clamp((now - pl.t0 - (pl.paused || 0)) / pl.dur, 0, 1);
    const x = pl.x0 + (pl.x1 - pl.x0) * k, y = pl.y0 + (pl.y1 - pl.y0) * k - Math.sin(k * Math.PI) * 8;
    const a = Math.atan2(pl.y1 - pl.y0, pl.x1 - pl.x0);
    if (Math.random() < 0.6) FX.parts.push({ x, y, vx: 0, vy: 0, life: 0.7, t: 0, col: '#dfe9ff', r: 0.3, smoke: true });
    ctx.save(); ctx.translate(sx(x), sy(y)); ctx.rotate(a + Math.PI / 4);
    ctx.font = `${clamp(cam.s * 2, 14, 26)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✈️', 0, 0); ctx.restore();
    if (k >= 1) done.push(pl);
  }
  for (const pl of done) { FX.planes.splice(FX.planes.indexOf(pl), 1); pl.onHit(); }
}

// ---------- Batalhas ----------
function launchAttack(att, to, n) {
  const src = attackSource(att, to);
  if (!src || n < 1) return false;
  C[att].troops -= n;
  const [x0, y0] = LABEL[src.from], [x1, y1] = LABEL[to];
  const dist = Math.hypot(x1 - x0, y1 - y0);
  FX.moves.push({ att, from: src.from, to, n, sea: src.sea, t0: performance.now(), dur: clamp(700 + dist * 90, 900, 2600) * (src.sea ? 1.3 : 1) });
  if (att === G.player) sfx.march();
  return true;
}
function resolveBattle(m) {
  const t = P[m.to], def = t.owner, a = C[m.att];
  const [x, y] = LABEL[m.to];
  if (def === m.att || !atWar(m.att, def) || !a.alive) { a.troops += m.n; return; }
  const d = C[def];
  const A = m.n * a.q * (1 + 0.1 * a.mil) * rnd(0.85, 1.2) * (m.sea ? 0.8 : 1);
  // as tropas livres do defensor ajudam a defender (reserva)
  const res = Math.min(d.troops * 0.3, Math.max(4, t.gar) * 1.5);
  const D = (Math.max(0.5, t.gar) + res) * d.q * (1 + 0.1 * d.def) * rnd(0.85, 1.2) * (isCap(t) ? 1.25 : 1) * homeBonus(t);
  const visible = m.att === G.player || def === G.player || onScreen(x, y);
  if (visible) boom(x, y, def === G.player || m.att === G.player ? 1.2 : 0.7);
  if (A > D) {
    const surv = m.n * (1 - 0.7 * (D / A));
    d.troops -= res * 0.8;
    if (visible) floatText(x, y + 2, '-' + fmt(m.n - surv), '#ff8fa3', 0.8);
    capture(m.to, m.att, surv, LABEL[m.from]);
  } else {
    const dmg = (A / d.q) * 0.75, tot = Math.max(1, t.gar + res);
    t.gar = Math.max(0.5, t.gar - dmg * (t.gar / tot));
    d.troops = Math.max(0, d.troops - dmg * (res / tot));
    a.troops += m.n * 0.15;
    if (visible) { floatText(x, y, 'DERROTA', m.att === G.player ? '#ff3d5a' : '#9aa3d6', 0.9); floatText(x, y + 3, '-' + fmt(m.n * 0.85), '#ff8fa3', 0.7); }
    if (def === G.player) { toast(`🛡️ Repeliste o ataque de ${a.flag} ${a.n} em ${t.n}!`, 'good'); sfx.good(); }
    if (m.att === G.player) { toast(`💥 O ataque a ${t.n} (${d.n}) falhou. A guarnição ficou com ${fmt(t.gar)}.`, 'war'); }
  }
  if (m.att === G.player || def === G.player) { shakeT = 0.35; uiDirty = true; }
}
function onScreen(x, y) { const X = sx(x), Y = sy(y); return X > -40 && X < VW + 40 && Y > -40 && Y < VH + 40; }
function capture(j, att, surv, from) {
  const p = P[j], old = p.owner, wasCap = isCap(p);
  const oldCol = C[old].color;
  p.owner = att;
  p.gar = Math.min(surv, gmax(p)); C[att].troops += surv - p.gar;
  p.occ = p.orig === att ? 0 : 40;
  const key = pairKey(att, old);
  G.taken[key] = G.taken[key] || {}; G.taken[key][att] = (G.taken[key][att] || 0) + 1;
  cacheDirty = true; countProv();
  const [x, y] = LABEL[j];
  flipProvince(j, from[0], from[1], oldCol);
  FX.rings.push({ x, y, t: 0, life: 0.9, max: 6, col: C[att].color });
  if (att === G.player) {
    floatText(x, y - 2, 'CONQUISTADO!', '#ffd75e', 1.1);
    sfx.win(); toast(`🏴 Conquistaste ${p.n} (${C[old].flag} ${C[old].n})!`, 'gold');
    coinBurst();
  } else if (old === G.player) {
    floatText(x, y - 2, 'PERDIDO!', '#ff3d5a', 1.1);
    toast(`⚠️ ${C[att].flag} ${C[att].n} tomou ${p.n}!`, 'war'); sfx.bad();
  }
  if (wasCap) capitalFalls(old, att);
  if (!P.some((q) => q.owner === old)) eliminate(old, att);
  computeAttackable();
  if (att === G.player) checkVictory();
}
function capitalFalls(ci, by) {
  const c = C[ci];
  const rest = provsOf(ci);
  if (!rest.length) return;
  for (const q of rest) q.gar *= 0.6;
  c.troops *= 0.75;
  const nc = rest.reduce((a, b) => (b.hx > a.hx ? b : a));
  c.cap = nc.j;
  if (by === G.player) banner(c.flag + ' ⇢ ' + C[by].flag, 'CAPITAL!', `A capital de ${c.n} caiu! O moral do inimigo afundou.`, 'gold');
  else if (ci === G.player) banner(c.flag, 'CAPITAL PERDIDA', `O governo fugiu para ${nc.n}.`, '');
  else if (c.wars.has(G.player) || C[by].wars.has(G.player) || allied(G.player, ci)) toast(`🏛️ A capital de ${c.flag} ${c.n} caiu nas mãos de ${C[by].flag} ${C[by].n}.`, 'war');
}
function eliminate(ci, by) {
  const c = C[ci]; c.alive = false;
  for (const e of [...c.wars]) endWar(ci, e, true);
  if (c.ally >= 0) { alliances[c.ally].members.delete(ci); c.ally = -1; }
  if (ci === G.player) { gameOver(by); return; }
  if (by === G.player) { banner(c.flag, 'ANEXADO!', `${c.n} faz agora parte do teu império.`, 'gold'); sfx.fanfare(); }
  else toast(`☠️ ${c.flag} ${c.n} foi anexado por ${C[by].flag} ${C[by].n}.`, '');
}

// ---------- Guerra e diplomacia ----------
function declareWar(a, b, opts = {}) {
  if (a === b || atWar(a, b) || !C[a].alive || !C[b].alive) return;
  C[a].wars.add(b); C[b].wars.add(a);
  G.warStart[pairKey(a, b)] = G.day;
  const me = G.player;
  if (a === me || b === me) {
    const other = C[a === me ? b : a];
    other.rel = -100;
    if (a === me) for (const c of C) if (c.i !== me && c.i !== b) c.rel -= allied(c.i, b) ? 35 : 4;
    if (!opts.quiet) {
      banner(C[a].flag + ' ⚔ ' + C[b].flag, 'GUERRA!', a === me ? `Declaraste guerra a ${C[b].n}.` : `${C[a].n} declarou-te guerra!`, '');
      sfx.horn(); shakeT = 0.5;
    }
  } else if (allied(me, b) && !opts.cascade) {
    // um aliado foi atacado: o jogador decide
    askDefendAlly(b, a);
  }
  if (!opts.cascade) callAllies(a, b);
  if (a !== me && b !== me) G.aiWars++;
  computeAttackable(); uiDirty = true;
}
function callAllies(a, b) {
  const me = G.player;
  // aliados do defensor juntam-se contra o atacante
  if (C[b].ally >= 0) for (const y of alliances[C[b].ally].members) {
    if (y === a || y === b || !C[y].alive || atWar(y, a) || allied(y, a)) continue;
    if (y === me) continue; // tratado em askDefendAlly
    if (Math.random() < (near(y, a) ? 0.8 : 0.3)) G.pending.push({ day: G.day + ri(1, 4), type: 'join', who: y, against: a, side: b });
  }
  // aliados do atacante podem ajudar
  if (C[a].ally >= 0) for (const y of alliances[C[a].ally].members) {
    if (y === a || y === b || y === me || !C[y].alive || atWar(y, b) || allied(y, b)) continue;
    if (Math.random() < (near(y, b) ? (a === me ? 0.6 : 0.4) : 0.06)) G.pending.push({ day: G.day + ri(2, 6), type: 'join', who: y, against: b, side: a });
  }
}
// dois países estão perto (fronteira ou mar, ou a menos de ~25 graus)
function near(a, b) {
  for (const p of P) if (p.owner === a) for (const q of [...p.adj, ...p.sea]) if (P[q].owner === b) return true;
  const [ax, ay] = LABEL[C[a].cap], [bx, by] = LABEL[C[b].cap];
  return Math.hypot(ax - bx, ay - by) < 25;
}
function endWar(a, b, silent) {
  C[a].wars.delete(b); C[b].wars.delete(a);
  G.truce[pairKey(a, b)] = G.day + 30;
  if (a !== G.player && b !== G.player) G.aiWars = Math.max(0, G.aiWars - 1);
  if (!silent && (a === G.player || b === G.player)) {
    const o = C[a === G.player ? b : a];
    banner(C[G.player].flag + ' 🕊 ' + o.flag, 'PAZ', `Fizeste as pazes com ${o.n}. As províncias conquistadas ficam contigo.`, 'good');
    sfx.good(); o.rel = Math.max(o.rel, -20);
  }
  computeAttackable(); uiDirty = true;
}
function warScore(me, e) {
  const t = G.taken[pairKey(me, e)] || {};
  return (t[me] || 0) - (t[e] || 0);
}
function peaceChance(e) {
  const me = G.player, c = C[e];
  const days = G.day - (G.warStart[pairKey(me, e)] || G.day);
  const ratio = power(C[me]) / Math.max(1, power(c));
  const score = warScore(me, e);
  let ch = 0.15 + days * 0.006 + score * 0.12 + (ratio - 1) * 0.15;
  if (c.ally >= 0 && c.ally !== C[me].ally) ch += 0.1; // aliados que só vieram ajudar desistem mais depressa
  if (score < 0) ch -= 0.1 * -score;
  return clamp(ch, 0.03, 0.95);
}
function allianceChance(ci) {
  const me = C[G.player], c = C[ci];
  if (atWar(me.i, ci)) return 0;
  if (c.ally >= 0 && [...alliances[c.ally].members].some((m) => atWar(m, me.i))) return 0;
  let ch = (c.rel + 15) / 100 + (power(me) > power(c) ? 0.12 : -0.08);
  if (c.ally >= 0) ch *= 0.7;
  return clamp(ch, 0.02, 0.9);
}

// ---------- Simulação diária ----------
let speed = 1, acc = 0, paused = false;
function countProv() { for (const c of C) c._np = 0; for (const p of P) C[p.owner]._np++; }
function tick() {
  G.day++;
  const me = G.player;
  for (const c of C) {
    if (!c.alive) continue;
    const inc = income(c);
    c.money += inc;
    if (c.i === me) { c.troops += regen(c); continue; }
    // economia da IA
    const spend = c.money * 0.55;
    c.troops += spend / recruitCost(); c.money -= spend;
    const capT = 15 + c._np * 9 * c.q;
    if (c.troops > capT) c.troops = capT + (c.troops - capT) * 0.5;
    if (c.money > upCost(c.eco + c.def + c.mil) * 1.5 && Math.random() < 0.3) { const k = pick(['eco', 'def', 'mil']); c.money -= upCost(c.eco + c.def + c.mil); c[k]++; }
    // relação com o jogador volta devagar ao normal
    if (!c.wars.has(me)) c.rel += c.rel < 0 ? 0.25 : c.rel > 20 ? -0.1 : 0;
    c.rel = clamp(c.rel, -100, 100);
  }
  for (const p of P) {
    const gm = gmax(p);
    if (p.gar < gm) p.gar = Math.min(gm, p.gar + gm * 0.045 + 0.2);
    else if (p.gar > gm * 2.5) p.gar = gm * 2.5;
    if (p.occ > 0) p.occ--;
  }
  // eventos agendados (aliados a entrar na guerra)
  const due = G.pending.filter((e) => e.day <= G.day);
  G.pending = G.pending.filter((e) => e.day > G.day);
  for (const e of due) {
    if (e.type !== 'join') continue;
    const y = C[e.who];
    if (!y.alive || !C[e.against].alive || atWar(e.who, e.against) || !atWar(e.side, e.against)) continue;
    declareWar(e.who, e.against, { cascade: true, quiet: true });
    if (e.against === me) { toast(`🔥 ${y.flag} ${y.n} junta-se à guerra para defender ${C[e.side].flag} ${C[e.side].n}!`, 'war'); sfx.horn(); flashBan(y.flag, 'ENTRA NA GUERRA'); }
    else if (e.side === me) { toast(`🤝 ${y.flag} ${y.n} junta-se a ti contra ${C[e.against].flag} ${C[e.against].n}!`, 'good'); sfx.good(); }
    else if (allied(me, e.against)) toast(`⚔️ ${y.flag} ${y.n} atacou o teu aliado ${C[e.against].flag} ${C[e.against].n}.`, 'war');
  }
  aiWarfare();
  worldEvents();
  computeAttackable();
  if (G.day % 15 === 0) save();
  uiDirty = true;
}
function aiWarfare() {
  const me = G.player;
  let launched = 0, vsMeToday = 0;
  const order = C.filter((c) => c.alive && c.i !== me && c.wars.size).sort(() => Math.random() - 0.5);
  for (const c of order) {
    for (const e of c.wars) {
      if (launched > 14) return;
      const vsMe = e === me;
      if (vsMe && vsMeToday >= 2) continue;
      if (Math.random() > (vsMe ? 0.2 : 0.22)) continue;
      // alvos na fronteira
      let best = null, bscore = 1e9;
      for (const p of P) {
        if (p.owner !== e) continue;
        const src = attackSource(c.i, p.j);
        if (!src) continue;
        const sc = (p.gar + Math.min(C[e].troops * 0.3, Math.max(4, p.gar) * 1.5)) * C[e].q * homeBonus(p) * (src.sea ? 1.25 : 1) * (isCap(p) ? 1.25 : 1) - p.hx * 0.3;
        if (sc < bscore) { bscore = sc; best = p.j; }
      }
      if (best === null) {
        // sem fronteira: bombardeamento aéreo de vez em quando
        if (vsMe && Math.random() < 0.05 && c.troops > 20) { airStrike(c.i, pick(provsOf(me)).j); vsMeToday++; }
        continue;
      }
      const need = (bscore / c.q) * 1.35;
      if (c.troops < need * 1.05) continue;
      const n = Math.min(c.troops * (vsMe ? 0.6 : 0.85), need * rnd(1.2, 1.8));
      if (n < need) continue;
      if (launchAttack(c.i, best, n)) { launched++; if (vsMe) vsMeToday++; }
    }
  }
}
function worldEvents() {
  const me = G.player;
  // guerras entre países da IA
  if (G.aiWars < 3 && Math.random() < 0.025) {
    const a = pick(C.filter((c) => c.alive && c.i !== me && !c.wars.size));
    if (a) {
      const nbs = new Set();
      for (const p of P) if (p.owner === a.i) for (const q of p.adj) { const o = P[q].owner; if (o !== a.i && o !== me && !allied(o, a.i) && !(G.truce[pairKey(a.i, o)] > G.day)) nbs.add(o); }
      const cand = [...nbs].filter((o) => power(C[o]) < power(a) * 1.1);
      if (cand.length) {
        const b = pick(cand);
        declareWar(a.i, b);
        if (!allied(me, b)) toast(`📰 ${a.flag} ${a.n} invadiu ${C[b].flag} ${C[b].n}!`, '');
      }
    }
  }
  // a IA ataca o jogador
  const share = C[me]._np / NP;
  if (G.day > 40 && Math.random() < 0.005 + share * 0.04) {
    const nbs = new Set();
    for (const p of P) if (p.owner === me) for (const q of [...p.adj, ...p.sea]) { const o = P[q].owner; if (o !== me) nbs.add(o); }
    const cand = [...nbs].filter((o) => !atWar(o, me) && !allied(o, me) && C[o].rel < 5 && !(G.truce[pairKey(o, me)] > G.day) && power(C[o]) > power(C[me]) * 0.8);
    if (cand.length) {
      const o = pick(cand);
      declareWar(o, me);
      // os aliados do jogador vêm ajudar
      if (C[me].ally >= 0) for (const y of alliances[C[me].ally].members) if (y !== me && C[y].alive && !atWar(y, o) && Math.random() < 0.7) G.pending.push({ day: G.day + ri(1, 3), type: 'join', who: y, against: o, side: me });
    }
  }
  // pazes entre IA
  for (const c of C) {
    if (!c.alive || c.i === me) continue;
    for (const e of [...c.wars]) {
      if (e === me || e < c.i) continue;
      const days = G.day - (G.warStart[pairKey(c.i, e)] || G.day);
      if (days > 30 && Math.random() < 0.015) endWar(c.i, e, true);
    }
  }
  // o inimigo pede paz
  if (!dialogOpen() && Math.random() < 0.05) {
    const e = pick([...C[me].wars]);
    if (e !== undefined) {
      const days = G.day - (G.warStart[pairKey(me, e)] || G.day);
      if (days > 20 && peaceChance(e) > 0.55 && (G.lastOffer || 0) + 20 < G.day) {
        G.lastOffer = G.day;
        const o = C[e];
        dialog(`${o.flag} 🕊️`, `${o.n} pede a paz`, `Estão em guerra há ${days} dias. Se aceitares, ficas com as províncias que conquistaste e há tréguas de 30 dias.`, [
          ['Aceitar paz', 'green', () => endWar(me, e)],
          ['Continuar a guerra', 'red', () => {}],
        ]);
      }
    }
  }
}
function airStrike(att, j) {
  const [x0, y0] = LABEL[C[att].cap], [x1, y1] = LABEL[j];
  FX.planes.push({ x0, y0, x1, y1, t0: performance.now(), dur: clamp(Math.hypot(x1 - x0, y1 - y0) * 25, 900, 2600), onHit: () => {
    const p = P[j];
    if (!atWar(att, p.owner)) return;
    const loss = p.gar * rnd(0.3, 0.5);
    p.gar -= loss;
    if (onScreen(x1, y1) || p.owner === G.player || att === G.player) { boom(x1, y1, 1); boom(x1 + rnd(-1.5, 1.5), y1 + rnd(-1.5, 1.5), 0.6); floatText(x1, y1, '-' + fmt(loss), '#ff8fa3', 0.9); }
    if (p.owner === G.player) { toast(`✈️ ${C[att].flag} ${C[att].n} bombardeou ${p.n}! (-${fmt(loss)})`, 'war'); shakeT = 0.4; }
    uiDirty = true;
  } });
  if (att === G.player || P[j].owner === G.player) sfx.plane();
}

// ---------- Ações do jogador ----------
const A = {
  attack(j, frac) {
    const me = C[G.player];
    const n = Math.floor(me.troops * frac);
    if (n < 1) { toast('Não tens tropas suficientes. Recruta mais no Exército.', 'war'); return; }
    launchAttack(G.player, j, n); uiDirty = true;
  },
  war(ci) {
    if (allied(G.player, ci)) { toast('Não podes atacar um aliado. Sai da aliança primeiro.', 'war'); return; }
    if (G.truce[pairKey(G.player, ci)] > G.day) { toast(`Há tréguas com ${C[ci].n} até ao dia ${G.truce[pairKey(G.player, ci)]}.`, 'war'); return; }
    declareWar(G.player, ci);
    if (!G.seenTips.war) { G.seenTips.war = 1; setTimeout(() => toast('🎯 As províncias com mira vermelha podem ser atacadas. Toca numa e escolhe quantas tropas enviar.', 'gold'), 2400); }
  },
  peace(ci) {
    const ch = peaceChance(ci);
    if (Math.random() < ch) endWar(G.player, ci);
    else { toast(`${C[ci].flag} ${C[ci].n} recusou a paz. Conquista mais terreno e tenta outra vez.`, 'war'); C[ci].rel -= 5; }
    G.peaceTry = G.peaceTry || {}; G.peaceTry[ci] = G.day;
  },
  ally(ci) {
    const me = C[G.player], c = C[ci];
    if (Math.random() < allianceChance(ci)) {
      if (c.ally >= 0) { if (me.ally >= 0) alliances[me.ally].members.delete(me.i); me.ally = c.ally; alliances[c.ally].members.add(me.i); banner(me.flag + ' 🤝 ' + c.flag, 'ALIANÇA!', `Entraste no bloco ${alliances[c.ally].name}.`, 'good'); }
      else {
        if (me.ally < 0) { alliances.push({ id: alliances.length, name: `Aliança de ${me.n}`, color: '#ffc93c', members: new Set([me.i]) }); me.ally = alliances.length - 1; }
        c.ally = me.ally; alliances[me.ally].members.add(ci);
        banner(me.flag + ' 🤝 ' + c.flag, 'ALIANÇA!', `${c.n} juntou-se ao bloco ${alliances[me.ally].name}.`, 'good');
      }
      c.rel = Math.max(c.rel, 50); sfx.fanfare();
    } else { toast(`${c.flag} ${c.n} recusou a aliança. Melhora as relações com presentes.`, 'war'); c.rel -= 8; }
    uiDirty = true;
  },
  leave() {
    const me = C[G.player];
    if (me.ally < 0) return;
    const al = alliances[me.ally];
    al.members.delete(me.i);
    for (const m of al.members) C[m].rel -= 30;
    toast(`Saíste do bloco ${al.name}. Os antigos aliados não gostaram.`, 'war');
    me.ally = -1; uiDirty = true; renderSheet();
  },
  gift(ci) {
    const me = C[G.player], cost = giftCost(C[ci]);
    if (me.money < cost) return toast('Dinheiro insuficiente.', 'war');
    me.money -= cost; C[ci].rel = clamp(C[ci].rel + 18, -100, 100);
    toast(`🎁 Enviaste um presente a ${C[ci].flag} ${C[ci].n}. Relação: ${Math.round(C[ci].rel)}`, 'good');
    sfx.coin(); uiDirty = true;
  },
  reinforce(j) {
    const me = C[G.player], p = P[j];
    const room = gmax(p) * 2.5 - p.gar, n = Math.min(Math.floor(me.troops * 0.5), room);
    if (n < 1) return toast(room < 1 ? 'Esta província já está no máximo.' : 'Não tens tropas livres.', 'war');
    me.troops -= n; p.gar += n;
    const [x, y] = LABEL[j]; floatText(x, y, '+' + fmt(n), '#ffd75e'); FX.rings.push({ x, y, t: 0, life: 0.6, max: 4, col: '#ffd75e' });
    sfx.coin(); uiDirty = true;
  },
  air(j) {
    const me = C[G.player], cost = airCost();
    if (me.money < cost) return toast('Dinheiro insuficiente para o ataque aéreo.', 'war');
    me.money -= cost; airStrike(G.player, j); uiDirty = true;
  },
  upgrade(k) {
    const me = C[G.player], cost = upCost(me[k]);
    if (me.money < cost || me[k] >= 10) return;
    me.money -= cost; me[k]++; sfx.fanfare(); coinBurst();
    toast({ eco: '📈 Economia melhorada! Mais rendimento por dia.', mil: '🏭 Indústria militar melhorada! Ataques mais fortes.', def: '🏰 Defesas melhoradas! Guarnições maiores.' }[k], 'gold');
    uiDirty = true; renderSheet();
  },
  recruit(n) {
    const me = C[G.player];
    const max = Math.floor(me.money / recruitCost());
    n = n === 'max' ? max : Math.min(n, max);
    if (n < 1) return toast('Dinheiro insuficiente.', 'war');
    me.money -= n * recruitCost(); me.troops += n; sfx.march();
    toast(`🪖 Recrutaste ${fmt(n)} tropas.`, 'good'); uiDirty = true; renderSheet();
  },
};
function askDefendAlly(victim, aggressor) {
  const v = C[victim], a = C[aggressor], me = G.player;
  dialog(`${a.flag} ⚔ ${v.flag}`, `${a.n} atacou ${v.n}!`, `${v.n} é teu aliado e pede ajuda. Se recusares, a relação com a aliança piora.`, [
    ['Defender aliado', 'red', () => declareWar(me, aggressor, { cascade: true })],
    ['Ficar de fora', '', () => { for (const m of alliances[v.ally]?.members || []) if (m !== me) C[m].rel -= 15; }],
  ]);
}

// ---------- Interface ----------
let uiDirty = true, panelHold = false;
function toast(msg, kind = '') {
  const box = $('#toasts');
  const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg;
  box.appendChild(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3800);
}
function banner(flags, big, small, kind) {
  const b = $('#banner');
  b.innerHTML = `<div class="ban ${kind}"><div class="flags">${flags}</div><div class="big">${big}</div><div class="small">${small}</div></div>`;
  clearTimeout(banner.t); banner.t = setTimeout(() => (b.innerHTML = ''), 2300);
  if (!kind) { $('#app').classList.remove('shake'); void $('#app').offsetWidth; $('#app').classList.add('shake'); }
}
function flashBan(flag, txt) { if (!$('#banner').innerHTML) banner(flag, txt, '', 'mini'); }
function dialogOpen() { return !$('#dialog').hidden; }
function dialog(flags, title, text, buttons) {
  const d = $('#dialog');
  d.innerHTML = `<div class="dlg"><div class="flags">${flags}</div><h3>${title}</h3><p>${text}</p><div class="btns">${buttons.map((b, i) => `<button class="btn ${b[1]}" data-i="${i}">${b[0]}</button>`).join('')}</div></div>`;
  d.hidden = false; paused = true;
  d.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; d.hidden = true; paused = false; buttons[+b.dataset.i][2](); };
}
let lastMoney = 0;
function updateHUD() {
  const me = C[G.player];
  $('#hMoney').textContent = fmt(me.money);
  if (Math.floor(me.money) > lastMoney + 0.5 && G.day > 1) { const el = $('#hMoney'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  lastMoney = Math.floor(me.money);
  $('#hInc').textContent = '+' + fmt(income(me)) + '/dia';
  $('#hTroops').textContent = fmt(me.troops);
  $('#hProv').textContent = me._np;
  const share = (me._np / NP) * 100;
  $('#hShare').textContent = share.toFixed(share < 10 ? 1 : 0) + '% do mundo';
  $('#hBar').style.width = Math.min(100, share * 2) + '%';
  $('#hSub').textContent = `Dia ${G.day} · ${me.wars.size ? me.wars.size + (me.wars.size > 1 ? ' guerras' : ' guerra') : 'em paz'}`;
  $('#warDot').hidden = !me.wars.size;
}
function relLabel(r) { return r >= 50 ? 'Amigável' : r >= 15 ? 'Cordial' : r > -15 ? 'Neutra' : r > -60 ? 'Tensa' : 'Hostil'; }
let lastPanelKey = null;
function renderPanel() {
  const el = $('#panel');
  const key = sel + ':' + warConfirm;
  const anim = key !== lastPanelKey; lastPanelKey = key;
  const st = el.scrollTop;
  renderPanelInner(el);
  const card = el.firstElementChild;
  if (card && !anim) card.style.animation = 'none';
  el.scrollTop = anim ? 0 : st;
}
function renderPanelInner(el) {
  const me = C[G.player];
  if (sel < 0) {
    const wars = [...me.wars];
    el.innerHTML = `<div class="card"><div class="head"><span class="flag">${me.flag}</span><div><h2>${me.n}</h2><p>${me._np} províncias · rendimento +${fmt(income(me))}/dia</p></div></div>
    ${wars.length ? `<p class="note warn">Em guerra com: ${wars.map((w) => C[w].flag + ' ' + C[w].n).join(', ')}. Ataca as províncias com mira vermelha.</p>` : `<p class="note">Toca numa província vizinha para a ver. Para conquistar, declara guerra e ataca província a província. Cuidado: os aliados do inimigo vêm defendê-lo.</p>`}
    <div class="btns"><button class="btn gold" data-a="sheet" data-v="eco">Economia</button><button class="btn red" data-a="sheet" data-v="army">Exército</button><button class="btn green" data-a="sheet" data-v="dip">Diplomacia</button></div></div>`;
    return;
  }
  const p = P[sel], o = C[p.owner], mine = p.owner === me.i;
  const al = o.ally >= 0 ? alliances[o.ally] : null;
  const tags = [];
  if (mine) tags.push('<span class="tag me">Teu</span>');
  else if (atWar(me.i, o.i)) tags.push('<span class="tag war">Em guerra</span>');
  else if (allied(me.i, o.i)) tags.push('<span class="tag ally">Aliado</span>');
  if (isCap(p)) tags.push('<span class="tag">★ Capital</span>');
  let html = `<div class="card"><div class="head"><span class="flag">${o.flag}</span><div style="min-width:0"><h2>${p.n} · ${o.n}</h2><p>${tags.join(' ')} ${al ? `<span class="tag" style="border-color:${al.color}">${al.name}</span>` : ''}</p></div></div>
  <div class="kv"><div><small>Guarnição</small><b>${fmt(p.gar)}</b></div><div><small>Rendimento</small><b>+${value(p).toFixed(1)}</b></div><div><small>${mine ? 'Tamanho' : 'Relação'}</small><b>${mine ? PH[p.j].length + ' quadr.' : relLabel(o.rel)}</b></div></div>`;
  if (mine) {
    html += p.occ > 0 ? `<p class="note">Território ocupado: rende metade durante mais ${p.occ} dias.</p>` : '';
    html += `<div class="btns"><button class="btn gold" data-a="reinforce" data-v="${p.j}">Reforçar<small>enviar 50% das tropas livres</small></button></div>`;
  } else if (atWar(me.i, o.i)) {
    const src = attackSource(me.i, p.j);
    if (src) {
      const opts = [[0.25, '25%'], [0.5, '50%'], [1, 'Tudo']].map(([f, l]) => {
        const n = Math.floor(me.troops * f), ch = winChance(n, me.i, p.j, src.sea);
        return `<button class="btn red ${ch > 0.6 ? 'pulse' : ''}" data-a="attack" data-v="${p.j}" data-f="${f}" ${n < 1 ? 'disabled' : ''}>${l} · ${fmt(n)}<small>vitória ${Math.round(ch * 100)}%</small></button>`;
      }).join('');
      html += `${src.sea ? '<p class="note">Desembarque por mar: as tropas lutam com -20%.</p>' : ''}<div class="btns">${opts}</div>`;
    } else html += `<p class="note warn">Não tens fronteira com esta província. Conquista as províncias à volta primeiro, ou bombardeia-a.</p>`;
    html += `<div class="btns"><button class="btn blue" data-a="air" data-v="${p.j}" ${me.money < airCost() ? 'disabled' : ''}>Ataque aéreo<small>$${airCost()} · -30 a 50% guarnição</small></button><button class="btn green" data-a="peace" data-v="${o.i}">Propor paz<small>aceitação ~${Math.round(peaceChance(o.i) * 100)}%</small></button></div>`;
  } else {
    const allies = al ? [...al.members].filter((m) => m !== o.i && m !== me.i && C[m].alive && !allied(m, me.i)) : [];
    const isAlly = allied(me.i, o.i);
    const truce = G.truce[pairKey(me.i, o.i)] > G.day;
    if (warConfirm === o.i) {
      html += `<p class="note warn">${allies.length ? `⚠️ Os aliados vão defendê-lo: ${allies.map((m) => C[m].flag).join(' ')}` : 'Não tem aliados para o defender.'}</p>
      <div class="btns"><button class="btn red pulse" data-a="war" data-v="${o.i}">Confirmar guerra</button><button class="btn" data-a="nowar">Cancelar</button></div>`;
    } else {
      html += `<div class="btns">
      ${isAlly ? '' : `<button class="btn red" data-a="warask" data-v="${o.i}" ${truce ? 'disabled' : ''}>Declarar guerra<small>${truce ? 'tréguas até dia ' + G.truce[pairKey(me.i, o.i)] : allies.length ? allies.length + ' aliados vão defendê-lo' : 'sem aliados'}</small></button>`}
      ${isAlly ? '' : `<button class="btn green" data-a="ally" data-v="${o.i}">Aliança<small>${al ? 'entrar no bloco' : 'formar aliança'} · ${Math.round(allianceChance(o.i) * 100)}%</small></button>`}
      <button class="btn gold" data-a="gift" data-v="${o.i}" ${me.money < giftCost(o) ? 'disabled' : ''}>Presente<small>$${giftCost(o)} · +relação</small></button></div>`;
    }
  }
  el.innerHTML = html + '</div>';
}
let warConfirm = -1, sheetTab = null;
function upRow(k, name, desc, ico, col) {
  const me = C[G.player], lv = me[k], cost = upCost(lv);
  return `<div class="up"><div class="ico" style="background:${col}">${ico}</div><div class="t"><b>${name}</b><small>${desc}</small><div class="lv">${Array.from({ length: 10 }, (_, i) => `<span class="${i < lv ? 'on' : ''}"></span>`).join('')}</div></div>
  <button class="btn gold" data-a="upgrade" data-v="${k}" ${me.money < cost || lv >= 10 ? 'disabled' : ''}>${lv >= 10 ? 'Máx' : '$' + fmt(cost)}</button></div>`;
}
function renderSheet() {
  const s = $('#sheet');
  if (!sheetTab) { s.hidden = true; s.dataset.tab = ''; return; }
  const me = C[G.player];
  let title = '', body = '';
  if (sheetTab === 'eco') {
    title = 'Economia';
    body = `<div class="box"><h4>Tesouro</h4><div class="kv"><div><small>Dinheiro</small><b>$${fmt(me.money)}</b></div><div><small>Por dia</small><b>+${fmt(income(me))}</b></div><div><small>Províncias</small><b>${me._np}</b></div></div>
    <p class="note">Cada província rende conforme o tamanho e a riqueza do país de origem. Territórios acabados de conquistar rendem metade até serem integrados.</p></div>
    <div class="box"><h4>Melhorias</h4>
    ${upRow('eco', 'Economia', '+20% de rendimento por nível', '$', 'linear-gradient(#ffe37a,#f0a800)')}
    ${upRow('mil', 'Indústria Militar', '+10% ataque e mais recrutas por dia', '⚔', 'linear-gradient(#ff8fa3,#d61f3d)')}
    ${upRow('def', 'Defesa', '+25% de guarnição em todas as províncias', '⛨', 'linear-gradient(#7fe6ff,#1c8fd6)')}</div>
    <div class="box"><h4>As tuas províncias mais ricas</h4>${provsOf(me.i).sort((a, b) => value(b) - value(a)).slice(0, 6).map((p) => `<div class="row"><span class="f">${C[p.orig].flag}</span><div class="grow">${p.n}<small>${C[p.orig].n}${p.occ ? ' · ocupada' : ''}</small></div><b>+${value(p).toFixed(1)}</b></div>`).join('')}</div>`;
  } else if (sheetTab === 'army') {
    title = 'Exército';
    const enemies = [...me.wars];
    body = `<div class="box"><h4>Forças</h4><div class="kv"><div><small>Tropas livres</small><b>${fmt(me.troops)}</b></div><div><small>Recrutas/dia</small><b>+${regen(me).toFixed(1)}</b></div><div><small>Poder total</small><b>${fmt(power(me))}</b></div></div></div>
    <div class="box"><h4>Recrutar ($${recruitCost()} por tropa)</h4><div class="btns">
    <button class="btn red" data-a="recruit" data-v="10" ${me.money < 12 ? 'disabled' : ''}>+10<small>$12</small></button>
    <button class="btn red" data-a="recruit" data-v="50" ${me.money < 60 ? 'disabled' : ''}>+50<small>$60</small></button>
    <button class="btn gold" data-a="recruit" data-v="max" ${me.money < 1.2 ? 'disabled' : ''}>Máximo<small>${fmt(Math.floor(me.money / 1.2))} tropas</small></button></div></div>
    <div class="box"><h4>Comparar forças</h4>${enemies.length ? enemies.map((e) => { const c = C[e], r = power(me) / (power(me) + power(c)); return `<div class="row"><span class="f">${c.flag}</span><div class="grow">${c.n}<small>poder ${fmt(power(c))} · ${c._np} prov.</small><div class="chance"><div style="width:${r * 100}%"></div></div></div></div>`; }).join('') : '<p class="note">Não estás em guerra. Vê a força de um país tocando nele no mapa.</p>'}</div>
    <div class="box"><h4>Dicas</h4><p class="note">Ataca províncias com guarnição baixa. A capital tem +25% de defesa, mas quando cai o inimigo perde moral. Um ataque falhado também enfraquece a guarnição — às vezes compensa atacar duas vezes.</p></div>`;
  } else if (sheetTab === 'dip') {
    title = 'Diplomacia';
    const al = me.ally >= 0 ? alliances[me.ally] : null;
    const wars = [...me.wars];
    const rank = C.filter((c) => c.alive).sort((a, b) => b._np - a._np || power(b) - power(a)).slice(0, 10);
    body = `<div class="box"><h4>A tua aliança</h4>${al ? `<div class="row"><div class="grow"><b>${al.name}</b><small>${al.members.size} membros</small></div><button class="btn" data-a="leave">Sair</button></div><div class="flagrow">${[...al.members].map((m) => C[m].flag).join(' ')}</div>` : '<p class="note">Não tens aliança. Toca num país no mapa e propõe uma.</p>'}</div>
    <div class="box"><h4>Guerras</h4>${wars.length ? wars.map((e) => { const c = C[e], d = G.day - (G.warStart[pairKey(me.i, e)] || G.day), sc = warScore(me.i, e); return `<div class="row"><span class="f">${c.flag}</span><div class="grow">${c.n}<small>${d} dias · ${sc >= 0 ? '+' : ''}${sc} províncias · paz ~${Math.round(peaceChance(e) * 100)}%</small></div><button class="btn green" data-a="peace" data-v="${e}">Paz</button><button class="btn" data-a="goto" data-v="${e}">Ver</button></div>`; }).join('') : '<p class="note">Estás em paz.</p>'}</div>
    <div class="box"><h4>Ranking mundial</h4>${rank.map((c, i) => `<div class="row"><b style="width:20px">${i + 1}</b><span class="f">${c.flag}</span><div class="grow">${c.n}${c.i === me.i ? ' (tu)' : ''}<small>${c._np} províncias · poder ${fmt(power(c))}</small></div></div>`).join('')}</div>
    <div class="box"><h4>Alianças do mundo</h4>${alliances.filter((a) => a.members.size > 1).map((a) => `<div><b style="color:${a.color}">${a.name}</b><div class="flagrow">${[...a.members].map((m) => C[m].flag).join(' ')}</div></div>`).join('')}</div>`;
  }
  const st = s.querySelector('.body')?.scrollTop || 0, same = s.dataset.tab === sheetTab;
  s.dataset.tab = sheetTab;
  s.innerHTML = `<header><h3>${title}</h3><button class="x" data-a="close" aria-label="Fechar">✕</button></header><div class="body">${body}</div>`;
  if (same) s.querySelector('.body').scrollTop = st;
  s.hidden = false;
}
function openTab(t) {
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
  sheetTab = t === 'map' ? null : t;
  renderSheet(); sfx.click();
}
function onAction(e) {
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
  const a = b.dataset.a, v = b.dataset.v;
  sfx.click();
  if (a === 'attack') A.attack(+v, +b.dataset.f);
  else if (a === 'warask') { warConfirm = +v; }
  else if (a === 'nowar') warConfirm = -1;
  else if (a === 'war') { warConfirm = -1; A.war(+v); }
  else if (a === 'peace') A.peace(+v);
  else if (a === 'ally') A.ally(+v);
  else if (a === 'gift') A.gift(+v);
  else if (a === 'reinforce') A.reinforce(+v);
  else if (a === 'air') A.air(+v);
  else if (a === 'upgrade') A.upgrade(v);
  else if (a === 'recruit') A.recruit(v === 'max' ? 'max' : +v);
  else if (a === 'leave') A.leave();
  else if (a === 'sheet') openTab(v);
  else if (a === 'close') openTab('map');
  else if (a === 'goto') { openTab('map'); focusCountry(+v); }
  renderPanel(); if (sheetTab) renderSheet(); updateHUD();
}
$('#panel').addEventListener('click', onAction);
$('#sheet').addEventListener('click', onAction);
for (const el of [$('#panel'), $('#sheet')]) {
  el.addEventListener('pointerdown', () => (panelHold = true));
  el.addEventListener('pointerup', () => setTimeout(() => (panelHold = false), 60));
  el.addEventListener('pointercancel', () => (panelHold = false));
}
$('#tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) openTab(b.dataset.t); });
$('#speed').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  speed = +b.dataset.s; document.querySelectorAll('#speed button').forEach((x) => x.classList.toggle('on', x === b)); sfx.click();
});
function coinBurst() {
  const hud = $('#hMoney');
  for (let k = 0; k < 6; k++) {
    const c = document.createElement('i'); c.className = 'i-gold';
    c.style.cssText = `position:absolute;width:14px;height:14px;border-radius:50%;left:${50 + rnd(-30, 30)}%;top:50%;z-index:20;pointer-events:none;transition:transform .7s cubic-bezier(.3,-.3,.6,1),opacity .7s`;
    $('#mapwrap').appendChild(c);
    const r = hud.getBoundingClientRect(), m = $('#mapwrap').getBoundingClientRect(), cr = c.getBoundingClientRect();
    requestAnimationFrame(() => { c.style.transform = `translate(${r.left - cr.left}px, ${r.top - cr.top}px) scale(.6)`; c.style.opacity = '0.3'; });
    setTimeout(() => c.remove(), 750 + k * 10);
    void m;
  }
}

// ---------- Toque / rato ----------
const ptrs = new Map();
let drag = null, pinch = null, moved = 0;
cv.addEventListener('pointerdown', (e) => {
  cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); camAnim = null;
  if (ptrs.size === 1) { drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; moved = 0; }
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: cam.s, mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 }; moved = 99; }
});
cv.addEventListener('pointermove', (e) => {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (pinch && ptrs.size >= 2) {
    const [a, b] = [...ptrs.values()];
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const rect = cv.getBoundingClientRect();
    const mx = (a[0] + b[0]) / 2 - rect.left, my = (a[1] + b[1]) / 2 - rect.top;
    const wx0 = wx(mx), wy0 = wy(my);
    cam.s = clamp(pinch.s * (d / pinch.d), minScale(), 60);
    cam.x = wx0 - (mx - VW / 2) / cam.s; cam.y = wy0 - (my - VH / 2) / cam.s;
    clampCam();
  } else if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    moved = Math.max(moved, Math.hypot(dx, dy));
    cam.x = drag.cx - dx / cam.s; cam.y = drag.cy - dy / cam.s; clampCam();
  }
});
function endPtr(e) {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.delete(e.pointerId);
  if (ptrs.size === 0) {
    if (moved < 8 && drag && C) { const r = cv.getBoundingClientRect(); tapAt(e.clientX - r.left, e.clientY - r.top); }
    drag = null; pinch = null;
  } else if (ptrs.size === 1) { const [v] = [...ptrs.values()]; drag = { x: v[0], y: v[1], cx: cam.x, cy: cam.y }; pinch = null; }
}
cv.addEventListener('pointerup', endPtr);
cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
  const x0 = wx(mx), y0 = wy(my);
  cam.s = clamp(cam.s * Math.exp(-e.deltaY * 0.0015), minScale(), 60);
  cam.x = x0 - (mx - VW / 2) / cam.s; cam.y = y0 - (my - VH / 2) / cam.s; clampCam();
}, { passive: false });
function hexAtWorld(x, y) {
  const c = Math.floor((x + 180) / M.S), r = Math.floor((y - M.Y0) / M.S);
  const i = hexKey.get(c + ',' + r);
  if (i !== undefined) return i;
  // toque mesmo ao lado da costa: aceitar o quadrado vizinho
  for (const [dc, dr] of [...NB4, [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const j = hexKey.get(c + dc + ',' + (r + dr)); if (j !== undefined) return j; }
  return -1;
}
function tapAt(px, py) {
  const i = hexAtWorld(wx(px), wy(py));
  let j = i < 0 ? -1 : HX[i].p;
  // com pouco zoom, um toque perto de uma mira vermelha escolhe esse alvo
  let bd = 24 * 24;
  for (const t of attackable) { const d = (sx(LABEL[t][0]) - px) ** 2 + (sy(LABEL[t][1]) - py) ** 2; if (d < bd) { bd = d; j = t; } }
  if (j !== sel) warConfirm = -1;
  sel = j;
  if (sel >= 0) sfx.select();
  renderPanel();
}
$('#zin').onclick = () => flyTo(cam.x, cam.y, cam.s * 1.6, 300);
$('#zout').onclick = () => flyTo(cam.x, cam.y, cam.s / 1.6, 300);
$('#zhome').onclick = () => focusCountry(G.player);

// ---------- Som (sintetizado) ----------
const sfx = (() => {
  let ac = null, on = true;
  const get = () => { if (!on) return null; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { return null; } return ac; };
  function tone(f, d, type = 'square', vol = 0.06, slide = 0, delay = 0) {
    const a = get(); if (!a) return;
    const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + 0.02);
  }
  function noise(d, vol = 0.12, delay = 0) {
    const a = get(); if (!a) return;
    const n = a.createBuffer(1, a.sampleRate * d, a.sampleRate), ch = n.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 2);
    const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 900; s.buffer = n; g.gain.value = vol;
    s.connect(f).connect(g).connect(a.destination); s.start(a.currentTime + delay);
  }
  let lastBoom = 0;
  return {
    toggle() { on = !on; return on; },
    click: () => tone(660, 0.05, 'square', 0.03),
    select: () => { tone(520, 0.06, 'square', 0.04); tone(780, 0.08, 'square', 0.04, 0, 0.05); },
    coin: () => { tone(988, 0.08, 'square', 0.05); tone(1319, 0.2, 'square', 0.05, 0, 0.08); },
    march: () => { for (let k = 0; k < 3; k++) tone(140, 0.07, 'triangle', 0.08, -40, k * 0.12); },
    boom: () => { const t = performance.now(); if (t - lastBoom < 120) return; lastBoom = t; noise(0.5, 0.18); tone(90, 0.4, 'sine', 0.15, -60); },
    win: () => [523, 659, 784, 1047].forEach((f, k) => tone(f, 0.14, 'square', 0.05, 0, k * 0.08)),
    bad: () => [392, 311, 233].forEach((f, k) => tone(f, 0.2, 'sawtooth', 0.04, 0, k * 0.12)),
    good: () => [440, 554, 659].forEach((f, k) => tone(f, 0.15, 'triangle', 0.06, 0, k * 0.09)),
    horn: () => { tone(196, 0.5, 'sawtooth', 0.05); tone(147, 0.7, 'sawtooth', 0.05, 0, 0.35); noise(0.3, 0.08, 0.1); },
    fanfare: () => [523, 523, 659, 784, 659, 784, 1047].forEach((f, k) => tone(f, 0.16, 'square', 0.045, 0, k * 0.1)),
    plane: () => tone(300, 1.2, 'sawtooth', 0.02, 400),
  };
})();

// ---------- Guardar ----------
const SAVE = 'imperio-quadrados-v2';
function save() {
  try {
    localStorage.setItem(SAVE, JSON.stringify({
      G: { ...G, pending: G.pending },
      C: C.map((c) => ({ money: c.money, troops: c.troops, eco: c.eco, mil: c.mil, def: c.def, alive: c.alive, wars: [...c.wars], ally: c.ally, rel: c.rel, cap: c.cap })),
      P: P.map((p) => [p.owner, Math.round(p.gar * 10) / 10, p.occ]),
      AL: alliances.map((a) => ({ name: a.name, color: a.color, members: [...a.members] })),
    }));
  } catch (e) { /* sem armazenamento */ }
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE));
    if (!s) return false;
    newGame(s.G.player);
    Object.assign(G, s.G);
    s.C.forEach((d, i) => Object.assign(C[i], d, { wars: new Set(d.wars) }));
    s.P.forEach((d, j) => { P[j].owner = d[0]; P[j].gar = d[1]; P[j].occ = d[2]; });
    alliances = s.AL.map((a, id) => ({ id, name: a.name, color: a.color, members: new Set(a.members) }));
    return true;
  } catch (e) { return false; }
}
const hasSave = () => { try { return !!localStorage.getItem(SAVE); } catch (e) { return false; } };

// ---------- Início / fim ----------
function startGame() {
  countProv(); computeAttackable(); cacheDirty = true;
  $('#start').hidden = true; paused = false; sel = -1;
  $('#hFlag').textContent = C[G.player].flag; $('#hName').textContent = C[G.player].n;
  resize();
  cam.s = minScale(); cam.x = 0; cam.y = 40; clampCam();
  setTimeout(() => focusCountry(G.player, 1600), 250);
  renderPanel(); updateHUD();
  if (G.day <= 1) {
    banner(C[G.player].flag, C[G.player].n.toUpperCase(), 'O teu império começa aqui.', 'gold'); sfx.fanfare();
    const me = C[G.player];
    setTimeout(() => toast(me.ally >= 0 ? `🤝 Pertences ao bloco ${alliances[me.ally].name}. Os teus aliados podem ajudar-te.` : '🌍 Não tens aliados. Toca num país vizinho para propor uma aliança.', 'good'), 2600);
    setTimeout(() => !C[G.player].wars.size && toast('⚔️ Para crescer: toca num vizinho, declara guerra e conquista uma província de cada vez.', 'gold'), 6500);
  }
}
function checkVictory() {
  const me = C[G.player];
  if (!G.won && me._np / NP >= 0.5) {
    G.won = true;
    dialog('👑 ' + me.flag, 'Domínio mundial!', `${me.n} controla metade do mundo em ${G.day} dias. Podes continuar a jogar até conquistares tudo.`, [['Continuar', 'gold', () => {}]]);
    sfx.fanfare();
  }
}
function gameOver(by) {
  try { localStorage.removeItem(SAVE); } catch (e) { /* */ }
  dialog('☠️', 'O teu império caiu', `${C[by].flag} ${C[by].n} conquistou a tua última província no dia ${G.day}.`, [['Novo jogo', 'gold', () => showStart()]]);
  paused = true;
}
function difficulty(c) {
  const np = M.provinces.filter((p) => p.c === c.i).length;
  const pw = c.q * (np * 3 + c.m * 4) * (WEALTH[c.a2] || 1);
  return pw > 60 ? 1 : pw > 25 ? 2 : pw > 12 ? 3 : pw > 6 ? 4 : 5;
}
function showStart() {
  $('#start').hidden = false; paused = true; sheetTab = null; $('#sheet').hidden = true;
  const s = $('#startIn');
  s.innerHTML = `<div class="logo"><h1>IMPÉRIO<span>MUNDIAL</span></h1><p>Escolhe um país, faz alianças e conquista o mundo província a província.</p></div>
  <div class="menu">${hasSave() ? '<button class="btn gold" id="bCont">Continuar</button>' : ''}<button class="btn ${hasSave() ? 'red' : 'gold'}" id="bNew">Novo jogo</button></div>
  <div class="help"><b>Como se joga:</b> toca num país vizinho e declara guerra. Ataca as províncias com mira vermelha, uma de cada vez. Os aliados do inimigo juntam-se à guerra contra ti — escolhe bem os alvos e faz as tuas próprias alianças. Usa o dinheiro para melhorar a economia, o exército e as defesas.</div>`;
  $('#bNew').onclick = () => { sfx.click(); showPicker(); };
  if ($('#bCont')) $('#bCont').onclick = () => { sfx.click(); if (load()) startGame(); else showPicker(); };
}
function showPicker() {
  const tmp = M.countries.map((c, i) => ({ i, a2: c.a2, n: c.n, m: MIL[c.a2] || 1, q: 1 + 0.06 * (MIL[c.a2] || 1) }));
  tmp.forEach((c) => { c.d = difficulty(c); c.np = M.provinces.filter((p) => p.c === c.i).length; const al = ALLIANCES.find((a) => a[2].split(' ').includes(c.a2)); c.al = al ? al[0] : ''; });
  let filter = 0;
  const s = $('#startIn');
  s.innerHTML = `<div class="logo"><h1 style="font-size:34px">ESCOLHE<span>O TEU PAÍS</span></h1></div>
  <div class="picker"><input id="q" type="search" placeholder="Procurar país…" autocomplete="off">
  <div class="chips" id="chips">${['Todos', 'Fácil', 'Médio', 'Difícil', 'Lendário'].map((t, k) => `<button data-k="${k}" class="${k === 0 ? 'on' : ''}">${t}</button>`).join('')}</div>
  <div class="list" id="list"></div><button class="btn" id="bBack">Voltar</button></div>`;
  const draw = () => {
    const q = $('#q').value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const ok = (c) => (!q || c.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)) && (!filter || (filter === 1 && c.d <= 1) || (filter === 2 && (c.d === 2 || c.d === 3)) || (filter === 3 && c.d === 4) || (filter === 4 && c.d === 5));
    $('#list').innerHTML = tmp.filter(ok).sort((a, b) => a.d - b.d || a.n.localeCompare(b.n, 'pt')).map((c) => `<button class="pick" data-i="${c.i}"><span class="f">${flagOf(c.a2)}</span><div><b>${c.n}</b><small>${c.np} província${c.np > 1 ? 's' : ''}${c.al ? ' · ' + c.al : ''}</small></div><div class="stars">${'★'.repeat(c.d)}${'☆'.repeat(5 - c.d)}<small>${['', 'Fácil', 'Médio', 'Médio', 'Difícil', 'Lendário'][c.d]}</small></div></button>`).join('');
  };
  draw();
  $('#q').oninput = draw;
  $('#chips').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; filter = +b.dataset.k; document.querySelectorAll('#chips button').forEach((x) => x.classList.toggle('on', x === b)); draw(); };
  $('#list').onclick = (e) => { const b = e.target.closest('.pick'); if (!b) return; sfx.coin(); newGame(+b.dataset.i); startGame(); };
  $('#bBack').onclick = showStart;
}
// fundo animado do ecrã inicial
const bg = $('#bgfx'), bctx = bg.getContext('2d');
function drawBg(now) {
  if ($('#start').hidden) return;
  const w = bg.clientWidth, h = bg.clientHeight;
  if (bg.width !== w * DPR) { bg.width = w * DPR; bg.height = h * DPR; }
  bctx.setTransform(DPR, 0, 0, DPR, 0, 0); bctx.clearRect(0, 0, w, h);
  const r = 14, hw = r * 2;
  for (let row = -1; row < h / hw + 1; row++) for (let col = -1; col < w / hw + 1; col++) {
    const x = col * hw + r, y = row * hw + r;
    const v = Math.sin(col * 0.5 + now / 900) * Math.cos(row * 0.45 - now / 1300);
    if (v < 0.35) continue;
    bctx.globalAlpha = (v - 0.35) * 0.5;
    bctx.fillStyle = PALETTE[(col * 3 + row * 5 + 100) % PALETTE.length];
    bctx.beginPath(); hexPath(bctx, x, y, r * 0.84); bctx.fill();
  }
  bctx.globalAlpha = 1;
}

// ---------- Ciclo principal ----------
let last = performance.now();
function loop(now) {
  const dt = now - last; last = now;
  const running = C && !paused && speed > 0 && $('#start').hidden;
  if (!running) { for (const m of FX.moves) m.paused = (m.paused || 0) + dt; for (const p of FX.planes) p.paused = (p.paused || 0) + dt; }
  if (running) {
    acc += dt * speed;
    while (acc >= 1000) { acc -= 1000; tick(); }
  }
  if (C) {
    if (uiDirty && !panelHold) { uiDirty = false; updateHUD(); renderPanel(); if (sheetTab) renderSheet(); }
  }
  render(now);
  drawBg(now);
  requestAnimationFrame(loop);
}
window.addEventListener('resize', resize);
resize();
showStart();
requestAnimationFrame(loop);
window.__imperio = { scr(j) { const r = cv.getBoundingClientRect(); return [sx(LABEL[j][0]) + r.left, sy(LABEL[j][1]) + r.top]; }, get att() { return [...attackable]; }, get C() { return C; }, get P() { return P; }, get G() { return G; }, A, tick };
})();
