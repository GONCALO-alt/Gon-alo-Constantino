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
// Quadrados do mapa guardados em arrays compactos (são ~200 mil)
const COLS = M.cols, ROWS = M.rows, S = M.S;
const GRID = new Int32Array(COLS * ROWS).fill(-1); // linha*COLS+coluna -> quadrado
let N = 0;
for (const row of M.runs) for (let k = 0; k < row.length; k += 3) N += row[k + 1];
const CC = new Int16Array(N), CR = new Int16Array(N), CP = new Int16Array(N);
{
  let i = 0;
  M.runs.forEach((row, r) => {
    for (let k = 0; k < row.length; k += 3) for (let c = row[k]; c < row[k] + row[k + 1]; c++) { CC[i] = c; CR[i] = r; CP[i] = row[k + 2]; GRID[r * COLS + c] = i; i++; }
  });
}
const cellAt = (c, r) => (c < 0 || c >= COLS || r < 0 || r >= ROWS ? -1 : GRID[r * COLS + c]);
const cxOf = (i) => -180 + (CC[i] + 0.5) * S, cyOf = (i) => M.Y0 + (CR[i] + 0.5) * S;
// vizinhos: este, sul, oeste, norte (a aresta d fica entre os cantos d e d+1)
const NB4 = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const R = S / 2; // meio lado do quadrado
const ND = 4, VX = [1, 1, -1, -1], VY = [-1, 1, 1, -1]; // cantos: cima-dir, baixo-dir, baixo-esq, cima-esq

let C, P, alliances, G; // estado
const PH = Array.from({ length: NP }, () => []);
for (let i = 0; i < N; i++) PH[CP[i]].push(i);
// caixa de cada província (em quadrados) e ponto da etiqueta (quadrado mais perto do centro)
const PBOX = PH.map((list) => { let c0 = 1e9, r0 = 1e9, c1 = -1, r1 = -1; for (const i of list) { c0 = Math.min(c0, CC[i]); c1 = Math.max(c1, CC[i]); r0 = Math.min(r0, CR[i]); r1 = Math.max(r1, CR[i]); } return [c0, r0, c1, r1]; });
const LABEL = M.provinces.map((p, j) => {
  let best = PH[j][0], bd = 1e9;
  for (const i of PH[j]) { const d = (cxOf(i) - p.x) ** 2 + (cyOf(i) - p.y) ** 2; if (d < bd) { bd = d; best = i; } }
  return [cxOf(best), cyOf(best)];
});
// ---------- Terreno e recursos ----------
const RAD = Math.PI / 180;
const latOf = (y) => (Math.atan(Math.exp((-y * RAD) / 1.25)) - Math.PI / 4) / 0.4 / RAD;
// 0 planície, 1 floresta, 2 montanha, 3 deserto, 4 tundra
const TERR = [
  { n: 'Planície', i: '🌿', d: 1, t: 3 },
  { n: 'Floresta', i: '🌲', d: 1.2, t: 2 },
  { n: 'Montanha', i: '⛰️', d: 1.5, t: 1.8 },
  { n: 'Deserto', i: '🏜️', d: 1.15, t: 2.6 },
  { n: 'Tundra', i: '❄️', d: 1.15, t: 2.4 },
];
const BOXES = [ // [terreno, lon0, lon1, lat0, lat1]
  [2, 70, 104, 27, 39], [2, 5, 16, 44, 47.8], [2, -79, -64, -45, 8], [2, -123, -104, 33, 58], [2, 38, 50, 40.5, 43.5], [2, -9, 9, 29.5, 35.5],
  [2, 44, 62, 28, 38], [2, 35, 42, 6, 14.5], [2, 18, 26.5, 45, 49.5], [2, -2, 3, 42, 43.2], [2, 57, 61, 50, 67], [2, 5, 17, 60, 69.5],
  [2, 62, 75, 33, 38.5], [2, 72, 96, 40, 49], [2, -84, -76, 35, 41], [2, 95, 104, 22, 33], [2, 26, 40, 37, 40], [2, 135, 142, 35, 41],
  [3, -17, 32, 15.5, 31], [3, 36, 58, 15, 31], [3, 90, 116, 38, 46], [3, 68, 75, 24, 30], [3, 118, 142, -31, -20], [3, 12, 25, -28, -18],
  [3, -71.5, -68, -27, -18], [3, -117, -108, 28, 37], [3, 52, 68, 37, 45], [3, 77, 90, 36, 42], [3, 47, 62, 25, 32],
  [1, -75, -48, -12, 3], [1, 9, 30, -6, 5], [1, 96, 125, -9, 20], [1, 30, 140, 55, 64], [1, -128, -60, 49, 59], [1, 140, 152, -10, -2], [1, -95, -77, 8, 20],
];
function terrainAt(lon, lat) {
  if (lat > 64 || lat < -50) return 4;
  for (const b of BOXES) if (lon >= b[1] && lon <= b[2] && lat >= b[3] && lat <= b[4]) return b[0];
  return 0;
}
const TC = new Uint8Array(N);
for (let i = 0; i < N; i++) TC[i] = terrainAt(cxOf(i), latOf(cyOf(i)));
const PTER = PH.map((list) => { const n = [0, 0, 0, 0, 0]; for (const i of list) n[TC[i]]++; return n.indexOf(Math.max(...n)); });
const RES = { oil: { n: 'Petróleo', i: '🛢️', d: '+rendimento, tanques mais baratos' }, gold: { n: 'Ouro', i: '💰', d: '+rendimento' }, food: { n: 'Comida', i: '🌾', d: '+0.5 recrutas por dia' }, iron: { n: 'Ferro', i: '⛏️', d: '+4% ataque, tanques mais baratos' } };
const RES0 = PH.map((_, j) => {
  const h = ((j * 2654435761) >>> 0) % 1000 / 1000, h2 = ((j * 40503 + 17) >>> 0) % 100 / 100;
  if (h > 0.25) return '';
  const t = PTER[j];
  if (t === 3) return h2 < 0.7 ? 'oil' : 'gold';
  if (t === 2) return h2 < 0.5 ? 'gold' : 'iron';
  if (t === 4) return h2 < 0.6 ? 'oil' : 'iron';
  if (t === 1) return h2 < 0.4 ? 'food' : h2 < 0.7 ? 'gold' : 'iron';
  return h2 < 0.6 ? 'food' : h2 < 0.8 ? 'oil' : 'iron';
});
// orla de cada província: segmentos [x1,y1,x2,y2,província vizinha (-1 = mar)], juntando arestas seguidas
const PSEG = PH.map((list) => {
  const out = [];
  const set = new Set(list);
  // arestas horizontais (norte/sul) e verticais (este/oeste)
  for (const d of [0, 1, 2, 3]) {
    const keyed = new Map(); // linha da aresta -> lista de [posição, vizinho]
    for (const i of list) {
      const n = cellAt(CC[i] + NB4[d][0], CR[i] + NB4[d][1]);
      if (n >= 0 && CP[n] === CP[i]) continue;
      const nb = n < 0 ? -1 : CP[n];
      const line = d === 0 || d === 2 ? CC[i] : CR[i], pos = d === 0 || d === 2 ? CR[i] : CC[i];
      let a = keyed.get(line); if (!a) keyed.set(line, (a = [])); a.push([pos, nb]);
    }
    for (const [line, a] of keyed) {
      a.sort((u, v) => u[0] - v[0]);
      for (let k = 0; k < a.length;) {
        let e = k; while (e + 1 < a.length && a[e + 1][0] === a[e][0] + 1 && a[e + 1][1] === a[k][1]) e++;
        const p0 = a[k][0], p1 = a[e][0] + 1;
        if (d === 0 || d === 2) { const x = -180 + (line + (d === 0 ? 1 : 0)) * S; out.push(x, M.Y0 + p0 * S, x, M.Y0 + p1 * S, a[k][1]); }
        else { const y = M.Y0 + (line + (d === 1 ? 1 : 0)) * S; out.push(-180 + p0 * S, y, -180 + p1 * S, y, a[k][1]); }
        k = e + 1;
      }
    }
  }
  void set;
  return new Float32Array(out);
});
const COAST = PSEG.map((sg) => { for (let k = 4; k < sg.length; k += 5) if (sg[k] < 0) return true; return false; });
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
    return { i, a2: c.a2, n: c.n, flag: flagOf(c.a2), cap: c.cap, color: COLORS[i], w: WEALTH[c.a2] || 1, m, q: 1 + 0.06 * m, eco: 0, mil: 0, def: 0, money: 0, troops: 0, tanks: 0, ships: 0, planes: 0, missiles: 0, boom: 0, crisis: 0, alive: true, wars: new Set(), ally: -1, rel: 0 };
  });
  P = M.provinces.map((p, j) => ({ j, n: p.n, owner: p.c, orig: p.c, hx: PH[j].length * M.unit, adj: p.adj, sea: p.sea, gar: 0, occ: 0, b: 0, res: RES0[j], dev: 0, incite: 0 }));
  alliances = ALLIANCES.map(([name, color, list], id) => {
    const members = new Set();
    list.split(' ').forEach((a2) => { const c = C.find((x) => x.a2 === a2); if (c) { members.add(c.i); c.ally = id; } });
    return { id, name, color, members };
  });
  G = { day: 1, player: playerIdx, truce: {}, warStart: {}, taken: {}, pending: [], won: false, offers: 0, aiWars: 0, seenTips: {}, armies: [], nextArmy: 1, trade: [], aggr: 0, heat: new Array(NP).fill(0), coal: -1, tribCD: {}, planesUsed: 0 };
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
  me.tanks = Math.round(2 + me.m * 2); me.ships = me.m >= 2 ? 2 : 1; me.planes = me.m >= 3 ? 2 : 1;
  // as capitais começam com uma muralha; países ricos com uma fábrica
  for (const c of C) { P[c.cap].b |= 8; if (c.w >= 2) P[c.cap].b |= 1; }
  countProv();
  G.baseCost = 20 + income(me) * 8;
}

// ---------- Regras ----------
const provsOf = (ci) => P.filter((p) => p.owner === ci);
const isCap = (p) => C[p.owner].cap === p.j;
const baseValue = (p) => (0.6 + 0.25 * p.hx) * C[p.orig].w;
function value(p) {
  const b = baseValue(p);
  let v = b * (p.b & 1 ? 1.5 : 1) * (p.b & 4 ? 1.2 : 1);
  if (p.res === 'oil') v += 2 + b * 0.8; else if (p.res === 'gold') v += 3 + b * 1.2;
  return v * (p.dev > 0 ? 0.5 : 1);
}
const gmax = (p) => { const o = C[p.owner]; return (8 + 1.5 * p.hx) * (isCap(p) ? 1.6 : 1) * (1 + 0.25 * o.def) * o.q * (p.owner === G.player ? 1.25 : 1); };
const homeBonus = (p) => (p.orig === p.owner ? 1.3 : 1);
function incomeBase(c) {
  let s = 0;
  for (const p of P) if (p.owner === c.i) s += value(p) * (p.occ > 0 ? 0.5 : 1);
  return s * (1 + 0.2 * c.eco) * (c.boom > 0 ? 1.3 : 1) * (c.crisis > 0 ? 0.75 : 1);
}
function tradeIncome(c) {
  if (!G || c.i !== G.player) return 0;
  let s = 0;
  for (const t of G.trade) if (C[t].alive) s += 1 + 0.08 * Math.min(incomeBase(c), incomeBase(C[t]));
  return s;
}
const income = (c) => incomeBase(c) + tradeIncome(c);
const atkMult = (c) => c.q * (1 + 0.1 * c.mil) * (1 + Math.min(0.2, 0.04 * (c._iron || 0)));
const tankMult = (j, sea) => (sea ? 1.5 : TERR[PTER[j]].t);
const defReserve = (t) => Math.min(C[t.owner].troops * 0.3, Math.max(4, t.gar) * 1.5);
function defPower(t) {
  const d = C[t.owner];
  return (Math.max(0.5, t.gar) + defReserve(t) + armyDefAt(t.j)) * d.q * (1 + 0.1 * d.def) * (isCap(t) ? 1.25 : 1) * homeBonus(t) * TERR[PTER[t.j]].d * (t.b & 8 ? 1.4 : 1);
}
// fator de desembarque: porto na origem, navios, ou nenhum
function seaF(att, from) {
  if (P[from].b & 4) return 0.95;
  if (att === G.player) return C[att].ships > 0 ? 0.85 : 0.55;
  return 0.8;
}
const atWar = (a, b) => C[a].wars.has(b);
const allied = (a, b) => a !== b && C[a].ally >= 0 && C[a].ally === C[b].ally;
const pairKey = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
const power = (c) => (c.troops + (c.tanks || 0) * 2.5 + (c.i === G.player ? G.armies.reduce((s, a) => s + a.inf + a.tank * 2.5, 0) : 0)) * c.q + P.reduce((s, p) => s + (p.owner === c.i ? p.gar * c.q : 0), 0);
const upCost = (lvl) => Math.round(G.baseCost * Math.pow(1.6, lvl));
const recruitCost = () => 1.2;
const COST = { inf: () => 1.2, tank: (c) => 5 * (c._oil ? 0.7 : 1) * (c._iron ? 0.85 : 1), ship: () => 12, plane: () => 20, missile: (c) => Math.round(300 + incomeBase(c) * 20) };
const BUILD = [
  { k: 1, n: 'Fábrica', i: '🏭', d: '+50% rendimento', f: 0.7 },
  { k: 2, n: 'Quartel', i: '🪖', d: '+0.6 recrutas/dia, menos revoltas', f: 0.5 },
  { k: 4, n: 'Porto', i: '⚓', d: 'desembarques sem penalização, +20% rendimento', f: 0.6 },
  { k: 8, n: 'Muralha', i: '🧱', d: '+40% defesa', f: 0.5 },
];
const buildCost = (bd) => Math.round(G.baseCost * bd.f);
const spyCost = (c) => Math.round(25 + incomeBase(C[G.player]) * 2.5 + incomeBase(c) * 1.5);
const giftCost = (c) => Math.round(15 + income(c) * 4);
const regen = (c) => 0.5 + (c._np || 0) * 0.18 * (1 + 0.2 * c.mil) + (c._bar || 0) * 0.6 + (c._food || 0) * 0.5;

// fontes de ataque: província do atacante que toca no alvo
function attackSource(att, t) {
  let best = null, bd = -1, sea = false;
  for (const q of P[t].adj) if (P[q].owner === att && P[q].gar > bd) { bd = P[q].gar; best = q; }
  if (best !== null) return { from: best, sea: false };
  for (const q of P[t].sea) if (P[q].owner === att && P[q].gar > bd) { bd = P[q].gar; best = q; sea = true; }
  return best !== null ? { from: best, sea } : null;
}
function winChance(n, att, t, sea, sf = 0.8) {
  const A = n * atkMult(C[att]) * (sea ? sf : 1);
  const r = A / defPower(P[t]);
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
  $('#sheet').style.bottom = $('#tabs').offsetHeight + 'px';
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
  // só os quadrados perto da capital (ilhas longínquas, como os Açores, não contam)
  for (const p of ps) for (const i of PH[p.j]) { const x = cxOf(i), y = cyOf(i); if (Math.abs(x - cx) > 70 || Math.abs(y - cy) > 45 || Math.hypot(x - LABEL[p.j][0], y - LABEL[p.j][1]) > 12) continue; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x0 > x1) { x0 = x1 = cx; y0 = y1 = cy; }
  const pad = 6;
  const s = clamp(Math.min(VW / (x1 - x0 + pad * 2), VH / (y1 - y0 + pad * 2)), 3, 30);
  flyTo((x0 + x1) / 2, (y0 + y1) / 2, s, ms);
}

// ---------- Cache do mapa (3x3 píxeis por quadrado) ----------
const PXC = 3, K = PXC / S; // K = píxeis por grau na cache
const CX0 = -180, CY0 = M.Y0;
const cache = document.createElement('canvas');
cache.width = COLS * PXC; cache.height = ROWS * PXC;
const cctx = cache.getContext('2d');
let cacheDirty = true;
const dirtyBoxes = [];
function hexPath(c, x, y, r) {
  c.moveTo(x + VX[0] * r, y + VY[0] * r);
  for (let k = 1; k < ND; k++) c.lineTo(x + VX[k] * r, y + VY[k] * r);
  c.closePath();
}
const colorOfCell = (i) => C[P[CP[i]].owner].color;
const rgbOf = (hex, f) => { const m = shade(hex, f).match(/\d+/g).map(Number); return m; };
let PAL = null; // por país: base, brilho, grelha, província
function makePal() { PAL = C.map((c) => [rgbOf(c.color, 0), rgbOf(c.color, 0.4), rgbOf(c.color, -0.12), rgbOf(c.color, -0.42)]); }
const BORDER = [10, 14, 36], COASTC = [150, 220, 255], SAND = [246, 222, 160], SNOW = [235, 244, 255];
function paintCells(c0, r0, c1, r1) {
  c0 = Math.max(0, c0); r0 = Math.max(0, r0); c1 = Math.min(COLS - 1, c1); r1 = Math.min(ROWS - 1, r1);
  const w = (c1 - c0 + 1) * PXC, h = (r1 - r0 + 1) * PXC;
  const img = cctx.createImageData(w, h), d = img.data;
  const put = (x, y, col) => { const o = (y * w + x) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255; };
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const i = GRID[r * COLS + c]; if (i < 0) continue;
    const p = CP[i], ow = P[p].owner, pal = PAL[ow];
    const side = (n) => (n < 0 ? COASTC : P[CP[n]].owner !== ow ? BORDER : CP[n] !== p ? pal[3] : null);
    const e = side(cellAt(c + 1, r)), sth = side(cellAt(c, r + 1)), wst = side(cellAt(c - 1, r)), nth = side(cellAt(c, r - 1));
    const X = (c - c0) * PXC, Y = (r - r0) * PXC;
    for (let py = 0; py < 3; py++) for (let px = 0; px < 3; px++) {
      let col = px === 0 && py === 0 ? pal[1] : pal[0];
      if (px === 1 && py === 1) { const tt = TC[i]; if (tt === 2) col = pal[3]; else if (tt === 1) col = pal[2]; else if (tt === 3) col = SAND; else if (tt === 4) col = SNOW; }
      if (px === 2) col = e || pal[2];
      if (py === 2) col = sth || (px === 2 ? e || pal[2] : pal[2]);
      if (px === 0 && wst && wst !== pal[3]) col = wst;
      if (py === 0 && nth && nth !== pal[3]) col = nth;
      put(X + px, Y + py, col);
    }
  }
  cctx.putImageData(img, c0 * PXC, r0 * PXC);
}
function rebuildCache() {
  if (!PAL) makePal();
  if (cacheDirty) { cctx.clearRect(0, 0, cache.width, cache.height); paintCells(0, 0, COLS - 1, ROWS - 1); dirtyBoxes.length = 0; }
  while (dirtyBoxes.length) { const b = dirtyBoxes.pop(); paintCells(b[0] - 1, b[1] - 1, b[2] + 1, b[3] + 1); }
  cacheDirty = false;
}
function markDirty(j) { const b = PBOX[j]; if (b[2] - b[0] > COLS / 2) cacheDirty = true; else dirtyBoxes.push(b); }

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
    const d = Math.hypot(cxOf(i) - fromX, cyOf(i) - fromY);
    FX.flips.push({ i, old: oldCol, t0: now + d * 60, dur: 380 });
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
  if (C && (cacheDirty || dirtyBoxes.length)) rebuildCache();
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
  ctx.imageSmoothingEnabled = cam.s < K * 0.9;
  ctx.drawImage(cache, sx(CX0), sy(CY0), COLS * S * cam.s, ROWS * S * cam.s);
  ctx.imageSmoothingEnabled = true;
  const r = R * cam.s;
  // quadrados a mudar de dono
  FX.flips = FX.flips.filter((f) => now < f.t0 + f.dur);
  for (const f of FX.flips) {
    const x = sx(cxOf(f.i)), y = sy(cyOf(f.i));
    const k = (now - f.t0) / f.dur;
    if (k < 0) { ctx.fillStyle = f.old; ctx.beginPath(); hexPath(ctx, x, y, r * 0.95); ctx.fill(); continue; }
    const sc = Math.abs(Math.cos(k * Math.PI));
    ctx.fillStyle = '#0a0e24'; ctx.beginPath(); hexPath(ctx, x, y, r); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.scale(1, Math.max(0.05, sc));
    ctx.fillStyle = k < 0.5 ? f.old : colorOfCell(f.i); ctx.beginPath(); hexPath(ctx, 0, 0, r * 0.95); ctx.fill();
    if (k > 0.5) { ctx.fillStyle = `rgba(255,255,255,${(1 - k) * 1.4})`; ctx.fill(); }
    ctx.restore();
  }
  // linhas: fronteira do império, frentes de guerra, seleção
  const me = G.player, pulse = 0.5 + 0.5 * Math.sin(now / 220);
  const empire = new Path2D(), front = new Path2D(), selP = new Path2D(), allyP = new Path2D();
  const wx0 = wx(-10), wx1 = wx(VW + 10), wy0 = wy(-10), wy1 = wy(VH + 10);
  for (let j = 0; j < NP; j++) {
    const ow = P[j].owner;
    const isMe = ow === me, isSel = j === sel, isAlly = !isMe && allied(me, ow);
    if (!isMe && !isSel && !isAlly) continue;
    const b = PBOX[j];
    if (-180 + (b[2] + 1) * S < wx0 || -180 + b[0] * S > wx1 || M.Y0 + (b[3] + 1) * S < wy0 || M.Y0 + b[1] * S > wy1) continue;
    const sg = PSEG[j];
    for (let k = 0; k < sg.length; k += 5) {
      const nb = sg[k + 4], on = nb < 0 ? -1 : P[nb].owner;
      const ax = sx(sg[k]), ay = sy(sg[k + 1]), bx = sx(sg[k + 2]), by = sy(sg[k + 3]);
      if (isSel) { selP.moveTo(ax, ay); selP.lineTo(bx, by); }
      if (isMe && on !== me) {
        if (on >= 0 && C[me].wars.has(on)) { front.moveTo(ax, ay); front.lineTo(bx, by); } else { empire.moveTo(ax, ay); empire.lineTo(bx, by); }
      } else if (isAlly && on !== ow && on !== me) { allyP.moveTo(ax, ay); allyP.lineTo(bx, by); }
    }
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgba(46,229,157,${0.35 + 0.2 * pulse})`; ctx.lineWidth = Math.max(1.5, r * 0.18); ctx.stroke(allyP);
  ctx.shadowColor = '#ffc93c'; ctx.shadowBlur = 8 + pulse * 8;
  ctx.strokeStyle = '#ffd75e'; ctx.lineWidth = Math.max(2, r * 0.26); ctx.stroke(empire);
  ctx.shadowColor = '#ff3d5a'; ctx.strokeStyle = `rgba(255,61,90,${0.6 + 0.4 * pulse})`; ctx.lineWidth = Math.max(2.5, r * 0.32); ctx.stroke(front);
  ctx.shadowColor = '#fff'; ctx.shadowBlur = 12; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, r * 0.22 + pulse * 1.5); ctx.setLineDash([r * 0.6, r * 0.4]); ctx.lineDashOffset = -now / 40; ctx.stroke(selP); ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  if (heatMode) drawHeat(now, pulse);
  drawTrade(now);
  // capitais, nomes, guarnições
  drawLabels(now, pulse);
  // movimentos de tropas
  drawMoves(now);
  drawArmies(now);
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

let heatMode = false;
function drawHeat(now, pulse) {
  ctx.fillStyle = 'rgba(5,8,26,.6)'; ctx.fillRect(-20, -20, VW + 40, VH + 40);
  ctx.globalCompositeOperation = 'lighter';
  for (let j = 0; j < NP; j++) {
    const h = G.heat[j]; if (h < 0.05) continue;
    const [lx, ly] = LABEL[j], x = sx(lx), y = sy(ly);
    const r = clamp((2 + Math.sqrt(h) * 3) * cam.s, 10, 140) * (0.9 + pulse * 0.15);
    if (x < -r || x > VW + r || y < -r || y > VH + r) continue;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,${Math.round(200 - Math.min(1, h / 4) * 160)},40,${Math.min(0.9, 0.25 + h * 0.15)})`); g.addColorStop(1, 'rgba(255,40,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // todas as frentes de guerra do mundo
  const fr = new Path2D();
  for (let j = 0; j < NP; j++) {
    const ow = P[j].owner; if (!C[ow].wars.size) continue;
    const sg = PSEG[j];
    for (let k = 0; k < sg.length; k += 5) { const nb = sg[k + 4]; if (nb < 0 || !C[ow].wars.has(P[nb].owner)) continue; fr.moveTo(sx(sg[k]), sy(sg[k + 1])); fr.lineTo(sx(sg[k + 2]), sy(sg[k + 3])); }
  }
  ctx.strokeStyle = `rgba(255,61,90,${0.6 + 0.4 * pulse})`; ctx.lineWidth = 2.5; ctx.shadowColor = '#ff3d5a'; ctx.shadowBlur = 10; ctx.stroke(fr); ctx.shadowBlur = 0;
}
function drawTrade(now) {
  if (!G.trade.length) return;
  const [x0, y0] = LABEL[C[G.player].cap];
  G.trade.forEach((t, idx) => {
    if (!C[t].alive) return;
    const [x1, y1] = LABEL[C[t].cap];
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * 0.25;
    ctx.strokeStyle = 'rgba(255,201,60,.45)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 5]); ctx.lineDashOffset = -now / 50;
    ctx.beginPath(); ctx.moveTo(sx(x0), sy(y0)); ctx.quadraticCurveTo(sx(cx), sy(cy), sx(x1), sy(y1)); ctx.stroke(); ctx.setLineDash([]);
    for (let c = 0; c < 2; c++) {
      const k = (now / 4000 + idx * 0.37 + c * 0.5) % 1, u = 1 - k;
      const X = sx(u * u * x0 + 2 * u * k * cx + k * k * x1), Y = sy(u * u * y0 + 2 * u * k * cy + k * k * y1);
      ctx.fillStyle = '#ffc93c'; ctx.strokeStyle = '#6b4400'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X, Y, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  });
}
const emoCache = new Map();
function emoImg(ch) {
  let im = emoCache.get(ch);
  if (!im) { im = document.createElement('canvas'); im.width = im.height = 32; const g = im.getContext('2d'); g.font = '26px system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 16, 18); emoCache.set(ch, im); }
  return im;
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
      if (s >= 8) {
        const icons = [];
        if (p.res) icons.push(RES[p.res].i);
        for (const b of BUILD) if (p.b & b.k) icons.push(b.i);
        icons.forEach((ic, k) => ctx.drawImage(emoImg(ic), x - icons.length * 6 + k * 12, y + 8, 12, 12));
      }
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
    const x = pl.x0 + (pl.x1 - pl.x0) * k, y = pl.y0 + (pl.y1 - pl.y0) * k - Math.sin(k * Math.PI) * (pl.arc || 8);
    const a = Math.atan2(pl.y1 - pl.y0, pl.x1 - pl.x0);
    if (Math.random() < 0.6) FX.parts.push({ x, y, vx: 0, vy: 0, life: 0.7, t: 0, col: '#dfe9ff', r: 0.3, smoke: true });
    if (pl.icon === '🚀') for (let q = 0; q < 3; q++) FX.parts.push({ x, y, vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3), life: 0.5, t: 0, col: pick(['#ffd75e', '#ff8a3c', '#fff']), r: 0.4, smoke: false });
    const ang = pl.icon === '🚀' ? Math.atan2(pl.y1 - pl.y0 - Math.cos(k * Math.PI) * Math.PI * (pl.arc || 8), pl.x1 - pl.x0) : a;
    ctx.save(); ctx.translate(sx(x), sy(y)); ctx.rotate(pl.icon === '🕵️' ? 0 : ang + Math.PI / 4);
    ctx.font = `${clamp(cam.s * 2, 14, 26)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(pl.icon || '✈️', 0, 0); ctx.restore();
    if (k >= 1) done.push(pl);
  }
  for (const pl of done) { FX.planes.splice(FX.planes.indexOf(pl), 1); pl.onHit(); }
}

// ---------- Batalhas ----------
function launchAttack(att, to, n, units) {
  const src = attackSource(att, to);
  if (!src) return false;
  const c = C[att];
  const inf = units ? units.inf : n, tank = units ? units.tank : 0;
  const str = inf + tank * tankMult(to, src.sea);
  if (str < 1) return false;
  c.troops -= inf; c.tanks -= tank;
  const [x0, y0] = LABEL[src.from], [x1, y1] = LABEL[to];
  const dist = Math.hypot(x1 - x0, y1 - y0);
  FX.moves.push({ att, from: src.from, to, inf, tank, n: str, sea: src.sea, sf: src.sea ? seaF(att, src.from) : 1, t0: performance.now(), dur: clamp(700 + dist * 90, 900, 2600) * (src.sea ? 1.3 : 1) });
  if (att === G.player) sfx.march();
  return true;
}
function resolveBattle(m) {
  const t = P[m.to], def = t.owner, a = C[m.att];
  const [x, y] = LABEL[m.to];
  if (def === m.att || !atWar(m.att, def) || !a.alive) { a.troops += m.inf; a.tanks += m.tank; return; }
  const d = C[def];
  const res = defReserve(t), arm = armyDefAt(t.j);
  const A = m.n * atkMult(a) * m.sf * rnd(0.85, 1.2);
  const D = defPower(t) * rnd(0.85, 1.2);
  G.heat[m.to] += 1;
  const visible = m.att === G.player || def === G.player || onScreen(x, y);
  if (visible) boom(x, y, def === G.player || m.att === G.player ? 1.2 : 0.7);
  if (A > D) {
    const frac = 1 - 0.7 * (D / A);
    const infS = m.inf * frac, tkS = m.tank * frac;
    d.troops = Math.max(0, d.troops - res * 0.8);
    if (arm > 0) armiesBeaten(t.j);
    if (visible) floatText(x, y + 2, '-' + fmt(m.n * (1 - frac)), '#ff8fa3', 0.8);
    a.troops += infS * 0.4; a.tanks += tkS * 0.4;
    capture(m.to, m.att, (infS + tkS) * 0.6, LABEL[m.from]);
  } else {
    const dmg = (A / d.q) * 0.75, tot = Math.max(1, t.gar + res + arm);
    t.gar = Math.max(0.5, t.gar - dmg * (t.gar / tot));
    d.troops = Math.max(0, d.troops - dmg * (res / tot));
    if (arm > 0) armiesHurt(t.j, dmg * (arm / tot));
    a.troops += m.inf * 0.15; a.tanks += m.tank * 0.15;
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
  p.b &= ~8; // a muralha cai com a conquista
  if (old === G.player) armiesBeaten(j);
  const key = pairKey(att, old);
  G.taken[key] = G.taken[key] || {}; G.taken[key][att] = (G.taken[key][att] || 0) + 1;
  markDirty(j); countProv();
  const [x, y] = LABEL[j];
  flipProvince(j, from[0], from[1], oldCol);
  FX.rings.push({ x, y, t: 0, life: 0.9, max: 6, col: C[att].color });
  if (att === G.player) {
    G.aggr += 0.6;
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
  if (by === G.player) G.aggr += 8;
  G.trade = G.trade.filter((t) => t !== ci);
  if (by === G.player) { banner(c.flag, 'ANEXADO!', `${c.n} faz agora parte do teu império.`, 'gold'); sfx.fanfare(); }
  else toast(`☠️ ${c.flag} ${c.n} foi anexado por ${C[by].flag} ${C[by].n}.`, '');
}

// ---------- Guerra e diplomacia ----------
function declareWar(a, b, opts = {}) {
  if (a === b || atWar(a, b) || !C[a].alive || !C[b].alive) return;
  C[a].wars.add(b); C[b].wars.add(a);
  G.warStart[pairKey(a, b)] = G.day;
  const me = G.player;
  if (a === me || b === me) G.trade = G.trade.filter((t) => t !== a && t !== b);
  if (a === me) G.aggr += 6;
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
    if (c.boom > 0) c.boom--;
    if (c.crisis > 0) c.crisis--;
    if (c.i === me) { c.troops += regen(c); continue; }
    // a IA também constrói, de vez em quando
    if (Math.random() < 0.012) { const q = pick(provsOf(c.i)); if (q) q.b |= pick([1, 2, 8]); }
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
    if (p.dev > 0) p.dev--;
    if (p.incite > 0) p.incite--;
  }
  for (let j = 0; j < NP; j++) G.heat[j] *= 0.94;
  G.aggr = Math.max(0, G.aggr - 0.15);
  G.planesUsed = 0;
  tickArmies();
  revolts();
  // eventos agendados (aliados a entrar na guerra)
  const due = G.pending.filter((e) => e.day <= G.day);
  G.pending = G.pending.filter((e) => e.day > G.day);
  for (const e of due) {
    if (e.type !== 'join') continue;
    const y = C[e.who];
    if (!y.alive || !C[e.against].alive || atWar(e.who, e.against) || !atWar(e.side, e.against)) continue;
    declareWar(e.who, e.against, { cascade: true, quiet: true });
    if (e.against === me) { toast(`🔥 ${y.flag} ${y.n} junta-se à guerra para defender ${C[e.side].flag} ${C[e.side].n}!`, 'war'); sfx.horn(); flashBan(y.flag, 'ENTRA NA GUERRA'); }
    else if (e.side === me) { if (near(e.who, e.against) || y._np >= 6) { toast(`🤝 ${y.flag} ${y.n} junta-se a ti contra ${C[e.against].flag} ${C[e.against].n}!`, 'good'); sfx.good(); } }
    else if (allied(me, e.against)) toast(`⚔️ ${y.flag} ${y.n} atacou o teu aliado ${C[e.against].flag} ${C[e.against].n}.`, 'war');
  }
  aiWarfare();
  worldEvents();
  if (Math.random() < 0.045) randomEvent();
  if (G.day % 10 === 0) maybeCoalition();
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
        const sc = defPower(p) * (src.sea ? 1.25 : 1) - p.hx * 0.3;
        if (sc < bscore) { bscore = sc; best = p.j; }
      }
      if (best === null) {
        // sem fronteira: bombardeamento aéreo de vez em quando
        if (vsMe && Math.random() < 0.05 && c.troops > 20) { airStrike(c.i, pick(provsOf(me)).j); vsMeToday++; }
        continue;
      }
      const need = (bscore / atkMult(c)) * 1.35;
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
    p.gar -= loss; G.heat[j] += 0.6;
    if (att === G.player && Math.random() < 0.2) { C[att].planes = Math.max(0, C[att].planes - 1); toast('✈️ Um dos teus aviões foi abatido.', 'war'); }
    if (onScreen(x1, y1) || p.owner === G.player || att === G.player) { boom(x1, y1, 1); boom(x1 + rnd(-1.5, 1.5), y1 + rnd(-1.5, 1.5), 0.6); floatText(x1, y1, '-' + fmt(loss), '#ff8fa3', 0.9); }
    if (p.owner === G.player) { toast(`✈️ ${C[att].flag} ${C[att].n} bombardeou ${p.n}! (-${fmt(loss)})`, 'war'); shakeT = 0.4; }
    uiDirty = true;
  } });
  if (att === G.player || P[j].owner === G.player) sfx.plane();
}

// ---------- Exércitos com generais ----------
const GEN_NAMES = ['Lobo', 'Águia', 'Trovão', 'Ferro', 'Falcão', 'Tempestade', 'Leão', 'Raio', 'Tigre', 'Coruja', 'Urso', 'Cometa', 'Martelo', 'Vulcão', 'Escorpião', 'Sombra'];
const TRAITS = { atk: { n: 'Ofensivo', d: '+20% ataque' }, spd: { n: 'Rápido', d: '+50% velocidade' }, def: { n: 'Defensivo', d: '+30% defesa' } };
let selArmy = -1;
const armyById = (id) => G.armies.find((a) => a.id === id);
const maxArmies = () => 2 + Math.floor(C[G.player].mil / 2);
const armyStr = (a, j, sea) => a.inf + a.tank * tankMult(j, sea);
const armySpeed = (a) => 0.5 * (a.trait === 'spd' ? 1.5 : 1);
// força dos exércitos do jogador parados numa província (ajudam a defender)
function armyDefAt(j) {
  if (!G || P[j].owner !== G.player) return 0;
  let s = 0;
  for (const a of G.armies) if (a.prov === j && !(a.path.length && a.prog > 0.5)) s += armyStr(a, j, false) * (a.trait === 'def' ? 1.3 : 1);
  return s;
}
function armiesHurt(j, dmg) {
  const list = G.armies.filter((a) => a.prov === j);
  const tot = list.reduce((s, a) => s + armyStr(a, j, false), 0) || 1;
  for (const a of list) { const f = Math.max(0, 1 - (dmg * (armyStr(a, j, false) / tot)) / Math.max(1, armyStr(a, j, false))); a.inf *= f; a.tank *= f; }
  cleanArmies();
}
// exércitos numa província perdida: recuam com metade das tropas, ou são destruídos
function armiesBeaten(j) {
  for (const a of G.armies.filter((x) => x.prov === j)) {
    const back = [...P[j].adj].find((q) => P[q].owner === G.player);
    if (back !== undefined) { a.inf *= 0.5; a.tank *= 0.5; a.prov = back; a.path = []; a.prog = 0; toast(`🎖️ O exército do General ${a.name} recuou para ${P[back].n}.`, 'war'); }
    else { a.inf = 0; a.tank = 0; toast(`☠️ O exército do General ${a.name} foi destruído.`, 'war'); }
  }
  cleanArmies();
}
function cleanArmies() {
  const before = G.armies.length;
  G.armies = G.armies.filter((a) => a.inf + a.tank >= 1);
  if (G.armies.length !== before && !armyById(selArmy)) selArmy = -1;
  uiDirty = true;
}
const passable = (j) => { const o = P[j].owner, me = G.player; return o === me || allied(me, o) || atWar(me, o); };
function armyPath(a, dest) {
  if (dest === a.prov) return [];
  const prev = new Map([[a.prov, -1]]), q = [a.prov];
  const ships = C[G.player].ships > 0;
  while (q.length) {
    const v = q.shift();
    if (v === dest) break;
    // não se atravessa território inimigo: pára-se na primeira província inimiga
    if (v !== a.prov && P[v].owner !== G.player && !allied(G.player, P[v].owner)) continue;
    for (const w of [...P[v].adj, ...(ships || P[v].b & 4 ? P[v].sea : [])]) if (!prev.has(w) && passable(w)) { prev.set(w, v); q.push(w); }
  }
  if (!prev.has(dest)) return null;
  const path = [];
  for (let v = dest; v !== a.prov; v = prev.get(v)) path.unshift(v);
  return path;
}
function tickArmies() {
  const me = G.player;
  for (const a of [...G.armies]) {
    if (!a.path.length && a.auto) autoTarget(a);
    if (!a.path.length) continue;
    const next = a.path[0];
    if (!passable(next)) { a.path = []; a.prog = 0; continue; }
    const sea = !P[a.prov].adj.includes(next);
    a.prog += armySpeed(a) * (sea ? 0.7 : 1);
    if (a.prog < 1) continue;
    a.prog = 0;
    const o = P[next].owner;
    if (o === me || allied(me, o)) { a.prov = next; a.path.shift(); continue; }
    armyBattle(a, next, sea);
  }
  cleanArmies();
}
function autoTarget(a) {
  const me = C[G.player];
  const nbs = [...P[a.prov].adj, ...(me.ships > 0 ? P[a.prov].sea : [])];
  let best = -1, bc = 0.5;
  for (const j of nbs) {
    if (!atWar(me.i, P[j].owner)) continue;
    const sea = !P[a.prov].adj.includes(j);
    const ch = winChance(armyStr(a, j, sea) * (a.trait === 'atk' ? 1.2 : 1), me.i, j, sea, seaF(me.i, a.prov));
    if (ch > bc) { bc = ch; best = j; }
  }
  if (best >= 0) { a.path = [best]; return; }
  // sem alvo bom ao lado: ir para a frente de guerra mais próxima
  if (!me.wars.size) return;
  const prev = new Map([[a.prov, -1]]), q = [a.prov];
  while (q.length) {
    const v = q.shift();
    if (v !== a.prov && [...P[v].adj].some((w) => atWar(me.i, P[w].owner))) {
      const path = []; for (let x = v; x !== a.prov; x = prev.get(x)) path.unshift(x);
      a.path = path; return;
    }
    for (const w of P[v].adj) if (!prev.has(w) && P[w].owner === me.i) { prev.set(w, v); q.push(w); }
  }
}
function armyBattle(a, j, sea) {
  const me = C[G.player], t = P[j], d = C[t.owner];
  const [x, y] = LABEL[j];
  const A = armyStr(a, j, sea) * atkMult(me) * (a.trait === 'atk' ? 1.2 : 1) * (sea ? seaF(me.i, a.prov) : 1) * rnd(0.85, 1.2);
  const res = defReserve(t);
  const D = defPower(t) * rnd(0.85, 1.2);
  G.heat[j] += 1.2;
  boom(x, y, 1.2); shakeT = 0.3;
  if (A > D) {
    const frac = 1 - 0.65 * (D / A);
    a.inf *= frac; a.tank *= frac;
    d.troops = Math.max(0, d.troops - res * 0.8);
    const g = Math.min(a.inf * 0.25, 10 + a.inf * 0.1);
    a.inf -= g;
    floatText(x, y + 2, `GEN. ${a.name.toUpperCase()}!`, '#ffd75e', 0.9);
    const from = LABEL[a.prov];
    a.prov = j; a.path.shift();
    capture(j, me.i, g, from);
  } else {
    a.inf *= 0.55; a.tank *= 0.6; a.path = [];
    const dmg = (A / d.q) * 0.75, tot = Math.max(1, t.gar + res);
    t.gar = Math.max(0.5, t.gar - dmg * (t.gar / tot));
    d.troops = Math.max(0, d.troops - dmg * (res / tot));
    floatText(x, y, 'DERROTA', '#ff3d5a', 0.9);
    toast(`💥 O General ${a.name} falhou o ataque a ${t.n}. Guarnição: ${fmt(t.gar)}.`, 'war');
  }
  uiDirty = true;
}
function armyScreenPos(a) {
  const [x0, y0] = LABEL[a.prov];
  const idx = G.armies.filter((b) => b.prov === a.prov).indexOf(a);
  let x = x0, y = y0;
  if (a.path.length) {
    const running = !paused && speed > 0;
    const k = clamp(a.prog + (running ? (acc / 1000) * armySpeed(a) : 0), 0, 1);
    const [x1, y1] = LABEL[a.path[0]];
    x = x0 + (x1 - x0) * k; y = y0 + (y1 - y0) * k;
  }
  return [sx(x) + idx * 14 - 16, sy(y) - 18 - idx * 4];
}
function drawArmies(now) {
  if (!G.armies.length) return;
  const col = C[G.player].color;
  for (const a of G.armies) {
    if (a.id === selArmy && a.path.length) {
      ctx.strokeStyle = '#ffd75e'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -now / 30;
      ctx.beginPath(); const [px, py] = armyScreenPos(a); ctx.moveTo(px, py + 10);
      for (const j of a.path) ctx.lineTo(sx(LABEL[j][0]), sy(LABEL[j][1]));
      ctx.stroke(); ctx.setLineDash([]);
      const end = a.path[a.path.length - 1]; star(sx(LABEL[end][0]), sy(LABEL[end][1]), 7, '#ffd75e');
    }
  }
  for (const a of G.armies) {
    const [X, Y0] = armyScreenPos(a);
    const Y = Y0 + (a.path.length ? Math.sin(now / 90) * 1.5 : 0);
    if (X < -40 || X > VW + 40 || Y < -40 || Y > VH + 40) continue;
    const isSel = a.id === selArmy;
    if (isSel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, 18 + Math.sin(now / 150) * 3, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = shade(col, -0.55); rrect(X - 15, Y - 9, 30, 21, 6); ctx.fill();
    ctx.fillStyle = col; ctx.strokeStyle = isSel ? '#fff' : '#0a0e24'; ctx.lineWidth = 2; rrect(X - 15, Y - 11, 30, 21, 6); ctx.fill(); ctx.stroke();
    drawTank(X - 6, Y - 1, 1);
    ctx.fillStyle = '#0a0e24'; ctx.font = 'bold 9px "Chakra Petch", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(a.name[0], X + 8, Y - 1);
    pill(X, Y - 19, fmt(a.inf + a.tank * 2.5), '#0a0e24', '#ffe7a3', '#ffc93c');
    if (a.auto) { ctx.font = '10px sans-serif'; ctx.fillText('⟳', X + 17, Y + 8); }
  }
}
function rrect(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
function drawTank(x, y, z) {
  ctx.fillStyle = '#0a0e24';
  ctx.fillRect(x - 6 * z, y, 12 * z, 4 * z);
  ctx.fillRect(x - 3 * z, y - 3 * z, 6 * z, 3 * z);
  ctx.fillRect(x + 2 * z, y - 2.5 * z, 6 * z, 1.4 * z);
}

// ---------- Revoltas ----------
function revolts() {
  for (const p of P) {
    if (p.orig === p.owner) continue;
    const unrest = (p.occ > 0 ? 2 : 0.4) * (1.2 - Math.min(1, p.gar / gmax(p))) * (p.b & 2 ? 0.3 : 1) * (p.incite > 0 ? 8 : 1);
    if (Math.random() < 0.0035 * unrest) revolt(p.j);
  }
}
function revolt(j) {
  const p = P[j], old = p.owner, orig = C[p.orig];
  const [x, y] = LABEL[j];
  const rebels = (8 + 1.5 * p.hx) * rnd(0.6, 1.2) * (p.occ > 0 ? 1.3 : 0.9) * orig.q;
  const D = defPower(p) * rnd(0.8, 1.2) * 0.7;
  const show = old === G.player || p.orig === G.player || onScreen(x, y);
  G.heat[j] += 1;
  if (show) { for (let k = 0; k < 24; k++) FX.parts.push({ x: x + rnd(-1, 1), y: y + rnd(-1, 1), vx: rnd(-0.5, 0.5), vy: rnd(-1.6, -0.4), life: rnd(0.6, 1.4), t: 0, col: pick(['#ff8a3c', '#ffc93c', '#ff3d5a']), r: rnd(0.3, 0.7), smoke: false }); FX.rings.push({ x, y, t: 0, life: 0.8, max: 5, col: '#ff8a3c' }); sfx.revolt(); }
  if (rebels > D) {
    let reborn = false;
    if (!orig.alive) { orig.alive = true; orig.cap = j; orig.troops = rebels * 0.5; orig.tanks = 0; orig.wars = new Set(); orig.ally = -1; orig.money = 20; reborn = true; }
    capture(j, orig.i, rebels * 0.5, [x, y]);
    if (!atWar(orig.i, old) && !allied(orig.i, old)) declareWar(orig.i, old, { cascade: true, quiet: true });
    if (old === G.player) { toast(`🔥 Revolta em ${p.n}! A província voltou a ${orig.flag} ${orig.n}.`, 'war'); banner(orig.flag, 'REVOLTA!', `${p.n} rebelou-se contra ti.`, ''); }
    else if (reborn && show) toast(`🔥 ${orig.flag} ${orig.n} renasceu com uma revolta em ${p.n}!`, 'news');
    else if (show) toast(`🔥 Revolta! ${p.n} libertou-se de ${C[old].flag} ${C[old].n}.`, 'news');
  } else {
    p.gar = Math.max(0.5, p.gar - rebels * 0.5);
    if (old === G.player) toast(`🛡️ Revolta esmagada em ${p.n}. Constrói um Quartel para evitar mais.`, 'good');
  }
  uiDirty = true;
}

// ---------- Acontecimentos aleatórios ----------
function randomEvent() {
  const me = G.player;
  const alive = C.filter((c) => c.alive && c._np > 0);
  const c = Math.random() < 0.35 ? C[me] : pick(alive);
  if (!c) return;
  const mine = c.i === me;
  const visible = mine || near(me, c.i) || c._np >= 8 || Math.random() < 0.3;
  const k = pick(['quake', 'quake', 'crisis', 'oil', 'coup', 'boom', 'boom', 'plague', 'harvest', 'harvest']);
  const prov = pick(provsOf(c.i));
  const who = `${c.flag} ${c.n}`;
  let msg = '';
  if (k === 'quake') {
    prov.gar *= 0.5; prov.dev = 30;
    const [x, y] = LABEL[prov.j];
    for (let r = 0; r < 3; r++) FX.rings.push({ x, y, t: -r * 0.2, life: 1.2, max: 8, col: '#c9a26b' });
    if (mine || onScreen(x, y)) shakeT = 0.8;
    msg = `Terramoto em ${prov.n} (${who})! Guarnição e rendimento caem.`;
  } else if (k === 'crisis') { c.money *= 0.6; c.crisis = 30; msg = `Crise económica em ${who}. Rendimento -25% durante 30 dias.`; }
  else if (k === 'oil') {
    const q = provsOf(c.i).find((x) => !x.res) || prov;
    q.res = 'oil'; countProv();
    const [x, y] = LABEL[q.j]; FX.rings.push({ x, y, t: 0, life: 1, max: 5, col: '#ffd75e' }); floatText(x, y, '🛢️ PETRÓLEO!', '#ffd75e', 0.9);
    msg = `Descoberto petróleo em ${q.n} (${who})!`;
  } else if (k === 'coup') {
    c.troops *= 0.75;
    if (!mine) { if (c.ally >= 0 && Math.random() < 0.5) { alliances[c.ally].members.delete(c.i); c.ally = -1; } c.rel = clamp(c.rel + rnd(-40, 40), -100, 100); msg = `Golpe de estado em ${who}! O novo governo mudou a política externa.`; }
    else msg = 'Tentativa de golpe no teu país! Perdeste 25% das tropas livres.';
  } else if (k === 'boom') { c.boom = 30; msg = `Boom económico em ${who}! Rendimento +30% durante 30 dias.`; }
  else if (k === 'plague') { c.troops *= 0.8; for (const q of provsOf(c.i)) q.gar *= 0.85; msg = `Epidemia em ${who}. O exército perdeu 20% das tropas.`; }
  else if (k === 'harvest') { c.money += incomeBase(c) * 10; msg = `Colheita recorde em ${who}! Ganhou 10 dias de rendimento.`; }
  if (visible) { toast('📰 ' + msg, 'news'); if (mine) sfx.event(); }
  uiDirty = true;
}

// ---------- Coligações contra o jogador ----------
function maybeCoalition() {
  const me = C[G.player];
  if (G.coal >= 0 && alliances[G.coal] && [...alliances[G.coal].members].some((m) => C[m].alive && atWar(m, me.i))) return;
  const threat = (me._np / NP) * 120 + G.aggr;
  if (threat < 30 || Math.random() > 0.3) return;
  const cand = C.filter((c) => c.alive && c.i !== me.i && !allied(c.i, me.i) && c.rel < 25 && near(c.i, me.i) && !(G.truce[pairKey(c.i, me.i)] > G.day)).sort((a, b) => power(b) - power(a)).slice(0, 6);
  if (cand.length < 2) return;
  const al = { id: alliances.length, name: `Coligação contra ${me.n}`, color: '#ff3d5a', members: new Set() };
  alliances.push(al); G.coal = al.id;
  for (const c of cand) {
    if (c.ally >= 0) alliances[c.ally].members.delete(c.i);
    c.ally = al.id; al.members.add(c.i); c.rel = -60;
    declareWar(c.i, me.i, { cascade: true, quiet: true });
  }
  G.aggr = Math.max(0, G.aggr - 25);
  banner(cand.map((c) => c.flag).join(''), 'COLIGAÇÃO!', `${cand.length} países juntaram-se contra o teu império.`, '');
  sfx.horn(); shakeT = 0.6;
  toast(`⚠️ ${cand.map((c) => c.n).join(', ')} formaram uma coligação contra ti.`, 'war');
}

// ---------- Míssil ----------
function missileStrike(att, j) {
  const [x0, y0] = LABEL[C[att].cap], [x1, y1] = LABEL[j];
  sfx.missile();
  FX.planes.push({ x0, y0, x1, y1, icon: '🚀', arc: 25, t0: performance.now(), dur: 2400, onHit: () => {
    const p = P[j];
    megaBoom(x1, y1);
    p.gar *= 0.08; p.dev = 60; G.heat[j] += 5;
    if (p.owner === G.player) armiesBeaten(j);
    if (att === G.player) {
      G.aggr += 30;
      for (const c of C) if (c.i !== att) c.rel -= c.i === p.owner ? 50 : 25;
      toast(`🚀 O míssil devastou ${p.n}. O mundo está chocado com o ataque.`, 'war');
    } else if (p.owner === G.player) toast(`🚀 ${C[att].flag} ${C[att].n} lançou um míssil contra ${p.n}!`, 'war');
    uiDirty = true;
  } });
}
function megaBoom(x, y) {
  const f = $('#flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
  for (let k = 0; k < 4; k++) FX.rings.push({ x, y, t: -k * 0.15, life: 1.4, max: 10 + k * 4, col: k % 2 ? '#fff' : '#ffd75e' });
  for (let k = 0; k < 90; k++) { const a = rnd(0, Math.PI * 2), v = rnd(1, 6); FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: rnd(0.8, 1.8), t: 0, col: pick(['#fff', '#fff3b0', '#ffc93c', '#ff8a3c', '#ff3d5a']), r: rnd(0.3, 0.9), smoke: false }); }
  for (let k = 0; k < 30; k++) FX.parts.push({ x: x + rnd(-0.6, 0.6), y, vx: rnd(-0.3, 0.3), vy: rnd(-3, -1.2), life: rnd(1.5, 2.6), t: 0, col: pick(['#6b6f86', '#8a8fa8', '#55607f']), r: rnd(0.8, 1.6), smoke: true });
  shakeT = 1.3; sfx.boom(); setTimeout(() => sfx.boom(), 150);
}

// ---------- Espiões ----------
function spyMission(ci, kind) {
  const me = C[G.player], c = C[ci];
  const [x0, y0] = LABEL[me.cap], [x1, y1] = LABEL[c.cap];
  const ch = { steal: 0.6, sabotage: 0.55, revolt: 0.45, provoke: 0.4 }[kind];
  sfx.spy();
  FX.planes.push({ x0, y0, x1, y1, icon: '🕵️', arc: 4, t0: performance.now(), dur: 1500, onHit: () => {
    if (!c.alive) return;
    if (Math.random() < ch) {
      if (kind === 'steal') { const v = Math.min(c.money * 0.35 + 10, incomeBase(me) * 20 + 60); c.money = Math.max(0, c.money - v); me.money += v; coinBurst(); toast(`🕵️ Os espiões roubaram $${fmt(v)} a ${c.flag} ${c.n}!`, 'gold'); }
      else if (kind === 'sabotage') { for (const q of provsOf(ci)) q.gar *= 0.75; c.troops *= 0.85; toast(`🕵️ Sabotagem! As defesas de ${c.flag} ${c.n} caíram 25%.`, 'gold'); }
      else if (kind === 'revolt') {
        const list = provsOf(ci).filter((q) => !isCap(q));
        const q = list.find((z) => z.orig !== z.owner) || pick(list.length ? list : provsOf(ci));
        q.incite = 20; toast(`🕵️ Os espiões estão a incitar uma revolta em ${q.n}!`, 'gold');
        if (q.orig !== q.owner) revolt(q.j);
        else { q.gar *= 0.5; const [x, y] = LABEL[q.j]; boom(x, y, 0.6); }
      } else if (kind === 'provoke') {
        const nbs = new Set();
        for (const q of provsOf(ci)) for (const w of q.adj) { const o = P[w].owner; if (o !== ci && o !== me.i && !allied(o, ci) && !atWar(o, ci)) nbs.add(o); }
        const o = pick([...nbs]);
        if (o !== undefined) { declareWar(ci, o); toast(`🕵️ Os espiões puseram ${c.flag} ${c.n} em guerra com ${C[o].flag} ${C[o].n}!`, 'gold'); }
        else toast('🕵️ Não havia nenhum vizinho para provocar.', '');
      }
      sfx.good();
    } else if (Math.random() < 0.5) {
      c.rel -= 40; G.aggr += 5;
      toast(`🚨 Os teus espiões foram apanhados em ${c.flag} ${c.n}! A relação piorou muito.`, 'war'); sfx.bad();
    } else toast(`🕵️ A missão em ${c.flag} ${c.n} falhou, mas ninguém descobriu.`, '');
    uiDirty = true;
  } });
}

// ---------- Ações do jogador ----------
const A = {
  attack(j, frac) {
    const me = C[G.player];
    const inf = Math.floor(me.troops * frac), tank = Math.floor(me.tanks * frac);
    if (inf + tank < 1) { toast('Não tens tropas suficientes. Recruta mais no Exército.', 'war'); return; }
    launchAttack(G.player, j, 0, { inf, tank }); uiDirty = true;
  },
  buy(kind, n) {
    const me = C[G.player], cost = COST[kind](me);
    const max = Math.floor(me.money / cost);
    n = n === 'max' ? max : Math.min(n, max);
    if (n < 1) return toast('Dinheiro insuficiente.', 'war');
    me.money -= n * cost;
    const key = { inf: 'troops', tank: 'tanks', ship: 'ships', plane: 'planes', missile: 'missiles' }[kind];
    me[key] += n;
    kind === 'missile' ? sfx.missile() : sfx.march();
    toast({ inf: `🪖 Recrutaste ${fmt(n)} soldados.`, tank: `🛡️ Construíste ${fmt(n)} tanques.`, ship: `🚢 Construíste ${n} navio${n > 1 ? 's' : ''}.`, plane: `✈️ Compraste ${n} avi${n > 1 ? 'ões' : 'ão'}.`, missile: '🚀 Míssil pronto a lançar.' }[kind], 'good');
    uiDirty = true; renderSheet();
  },
  build(j, k) {
    const me = C[G.player], p = P[j], bd = BUILD.find((b) => b.k === k), cost = buildCost(bd);
    if (p.owner !== me.i || p.b & k) return;
    if (k === 4 && !COAST[j]) return toast('Só podes construir um porto numa província com costa.', 'war');
    if (me.money < cost) return toast('Dinheiro insuficiente.', 'war');
    me.money -= cost; p.b |= k; countProv();
    const [x, y] = LABEL[j]; floatText(x, y, bd.i + ' ' + bd.n.toUpperCase(), '#ffd75e', 0.9); FX.rings.push({ x, y, t: 0, life: 0.8, max: 4, col: '#ffd75e' });
    sfx.build(); uiDirty = true;
  },
  newArmy(j) {
    const me = C[G.player];
    if (G.armies.length >= maxArmies()) return toast(`Só podes ter ${maxArmies()} exércitos. Melhora a Indústria Militar para teres mais.`, 'war');
    const inf = Math.floor(me.troops * 0.5), tank = Math.floor(me.tanks * 0.5);
    if (inf + tank * 3 < 5) return toast('Precisas de pelo menos 5 tropas livres para formar um exército.', 'war');
    me.troops -= inf; me.tanks -= tank;
    const used = new Set(G.armies.map((a) => a.name));
    const name = GEN_NAMES.find((n) => !used.has(n)) || 'Novo';
    const a = { id: G.nextArmy++, name, trait: pick(Object.keys(TRAITS)), prov: j, path: [], prog: 0, inf, tank, auto: false };
    G.armies.push(a); selArmy = a.id; sel = -1;
    banner('🎖️', 'GENERAL ' + name.toUpperCase(), `${TRAITS[a.trait].n}: ${TRAITS[a.trait].d}. Toca numa província para o mandares avançar.`, 'gold');
    sfx.fanfare(); uiDirty = true;
  },
  armyAuto(id) { const a = armyById(id); if (a) { a.auto = !a.auto; toast(a.auto ? `⟳ O General ${a.name} vai combater sozinho.` : `O General ${a.name} espera ordens.`, 'good'); } },
  armyStop(id) { const a = armyById(id); if (a) { a.path = []; a.prog = 0; } },
  armyReinforce(id) {
    const a = armyById(id), me = C[G.player]; if (!a) return;
    if (P[a.prov].owner !== me.i) return toast('O exército tem de estar numa província tua para receber reforços.', 'war');
    const inf = Math.floor(me.troops * 0.5), tank = Math.floor(me.tanks * 0.5);
    if (inf + tank < 1) return toast('Não tens tropas livres.', 'war');
    me.troops -= inf; me.tanks -= tank; a.inf += inf; a.tank += tank; sfx.march();
    const [x, y] = LABEL[a.prov]; floatText(x, y, '+' + fmt(inf + tank * 2.5), '#ffd75e');
  },
  armyDisband(id) {
    const a = armyById(id), me = C[G.player]; if (!a) return;
    me.troops += a.inf; me.tanks += a.tank; a.inf = 0; a.tank = 0; cleanArmies(); selArmy = -1;
    toast(`O exército do General ${a.name} foi dissolvido. As tropas voltaram à reserva.`, '');
  },
  missile(j) {
    const me = C[G.player];
    if (me.missiles < 1) return toast('Não tens mísseis. Compra um no Exército.', 'war');
    me.missiles--; missileStrike(G.player, j); uiDirty = true;
  },
  trade(ci) {
    const me = C[G.player], c = C[ci];
    if (G.trade.includes(ci)) { G.trade = G.trade.filter((t) => t !== ci); c.rel -= 10; return toast(`Acordo comercial com ${c.flag} ${c.n} cancelado.`, ''); }
    if (G.trade.length >= 3 + me.eco) return toast(`Só podes ter ${3 + me.eco} acordos. Melhora a Economia para teres mais.`, 'war');
    if (Math.random() < clamp((c.rel + 50) / 100, 0.1, 0.95)) {
      G.trade.push(ci); c.rel += 5; sfx.coin(); coinBurst();
      banner(me.flag + ' 💱 ' + c.flag, 'COMÉRCIO!', `Acordo comercial com ${c.n}: +$${fmt(1 + 0.08 * Math.min(incomeBase(me), incomeBase(c)))} por dia.`, 'gold');
    } else { c.rel -= 5; toast(`${c.flag} ${c.n} recusou o acordo comercial.`, 'war'); }
    uiDirty = true;
  },
  tribute(ci) {
    const me = C[G.player], c = C[ci];
    if (G.tribCD[ci] > G.day) return toast(`${c.n} já recusou. Espera até ao dia ${G.tribCD[ci]}.`, 'war');
    G.tribCD[ci] = G.day + 30; G.aggr += 3;
    let guard = power(c);
    if (c.ally >= 0) for (const m of alliances[c.ally].members) if (m !== ci && C[m].alive && near(m, G.player)) guard += power(C[m]) * 0.5;
    const ratio = power(me) / Math.max(1, guard);
    if (ratio < 1.5 || Math.random() > clamp((ratio - 1.3) / 3, 0.05, 0.85)) { c.rel -= 25; toast(`${c.flag} ${c.n} recusou pagar tributo e ficou furioso.`, 'war'); sfx.bad(); return; }
    const border = provsOf(ci).filter((q) => !isCap(q) && q.adj.some((w) => P[w].owner === me.i));
    if (ratio > 4 && border.length) {
      const q = pick(border);
      banner(c.flag + ' ⇢ ' + me.flag, 'TRIBUTO!', `${c.n} cedeu-te ${q.n} sem combate.`, 'gold');
      capture(q.j, me.i, gmax(q) * 0.4, LABEL[c.cap]);
    } else {
      const v = Math.max(15, Math.round(Math.max(c.money * 0.6, incomeBase(c) * 12)));
      c.money = Math.max(0, c.money - v); me.money += v; coinBurst();
      banner(c.flag + ' 💰', 'TRIBUTO!', `${c.n} pagou-te $${fmt(v)}.`, 'gold');
    }
    c.rel -= 15; sfx.coin(); uiDirty = true;
  },
  spy(ci, kind) {
    const me = C[G.player], cost = spyCost(C[ci]);
    if (me.money < cost) return toast('Dinheiro insuficiente para a missão.', 'war');
    me.money -= cost; spyMission(ci, kind); uiDirty = true;
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
    const me = C[G.player];
    if (me.planes - G.planesUsed < 1) return toast(me.planes ? 'Todos os aviões já voaram hoje. Espera pelo dia seguinte.' : 'Não tens aviões. Compra-os no Exército.', 'war');
    G.planesUsed++; airStrike(G.player, j); uiDirty = true;
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
  while (box.children.length > 2) box.firstChild.remove();
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
  $('#hTanks').textContent = me.tanks ? '+' + fmt(me.tanks) + ' tanques' : 'soldados';
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
  const key = sel + ':' + warConfirm + ':' + selArmy + ':' + spyMenu;
  const anim = key !== lastPanelKey; lastPanelKey = key;
  const st = el.scrollTop;
  renderPanelInner(el);
  const card = el.firstElementChild;
  if (card && !anim) card.style.animation = 'none';
  el.scrollTop = anim ? 0 : st;
}
function armyCard(a) {
  const me = C[G.player], t = TRAITS[a.trait];
  const where = P[a.prov].n + ' (' + C[P[a.prov].owner].n + ')';
  const dest = a.path.length ? P[a.path[a.path.length - 1]] : null;
  return `<div class="card"><div class="head"><span class="flag">🎖️</span><div style="min-width:0"><h2>General ${a.name}</h2><p><span class="tag me">${t.n}</span> ${t.d}${a.auto ? ' · <span class="tag ally">Automático</span>' : ''}</p></div></div>
  <div class="kv"><div><small>Soldados</small><b>${fmt(a.inf)}</b></div><div><small>Tanques</small><b>${fmt(a.tank)}</b></div><div><small>Força</small><b>${fmt(a.inf + a.tank * 2.5)}</b></div></div>
  <p class="note">${dest ? `A avançar para <b>${dest.n}</b> (${a.path.length} província${a.path.length > 1 ? 's' : ''}).` : `Parado em ${where}.`} Toca numa província no mapa para lhe dares uma ordem.${me.ships ? '' : ' Sem navios não atravessa o mar.'}</p>
  <div class="btns"><button class="btn ${a.auto ? 'green' : 'blue'}" data-a="armyAuto" data-v="${a.id}">${a.auto ? 'Automático: sim' : 'Automático: não'}<small>combate sozinho</small></button>
  <button class="btn gold" data-a="armyReinforce" data-v="${a.id}">Reforçar<small>50% da reserva</small></button></div>
  <div class="btns">${a.path.length ? `<button class="btn" data-a="armyStop" data-v="${a.id}">Parar</button>` : ''}<button class="btn" data-a="armyDisband" data-v="${a.id}">Dissolver</button><button class="btn" data-a="armyClose">Fechar</button></div></div>`;
}
function renderPanelInner(el) {
  const me = C[G.player];
  const army = armyById(selArmy);
  if (army) { el.innerHTML = armyCard(army); return; }
  if (sel < 0) {
    const wars = [...me.wars];
    el.innerHTML = `<div class="card"><div class="head"><span class="flag">${me.flag}</span><div><h2>${me.n}</h2><p>${me._np} províncias · rendimento +${fmt(income(me))}/dia</p></div></div>
    ${wars.length ? `<p class="note warn">Em guerra com: ${wars.map((w) => C[w].flag + ' ' + C[w].n).join(', ')}. Ataca as províncias com mira vermelha ou manda um general.</p>` : `<p class="note">Toca numa província para a ver. Para conquistar, declara guerra e ataca província a província. Cuidado: os aliados do inimigo vêm defendê-lo.</p>`}
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
  const tr = TERR[PTER[p.j]];
  tags.push(`<span class="tag">${tr.i} ${tr.n}${tr.d > 1 ? ' +' + Math.round((tr.d - 1) * 100) + '% def.' : ''}</span>`);
  if (p.res) tags.push(`<span class="tag" title="${RES[p.res].d}">${RES[p.res].i} ${RES[p.res].n}</span>`);
  const blds = BUILD.filter((b) => p.b & b.k).map((b) => b.i).join(' ');
  let html = `<div class="card"><div class="head"><span class="flag">${o.flag}</span><div style="min-width:0"><h2>${p.n} · ${o.n}</h2><p>${tags.join(' ')} ${al ? `<span class="tag" style="border-color:${al.color}">${al.name}</span>` : ''}</p></div></div>
  <div class="kv"><div><small>Guarnição</small><b>${fmt(p.gar)}</b></div><div><small>Rendimento</small><b>+${value(p).toFixed(1)}</b></div><div><small>${mine ? 'Edifícios' : 'Relação'}</small><b>${mine ? blds || '—' : relLabel(o.rel)}</b></div></div>`;
  if (p.dev > 0) html += `<p class="note warn">Devastada: rende metade durante mais ${p.dev} dias.</p>`;
  if (mine) {
    html += p.occ > 0 ? `<p class="note">Território ocupado: rende metade durante mais ${p.occ} dias e pode revoltar-se.</p>` : '';
    html += `<div class="btns">${BUILD.map((b) => { const has = p.b & b.k, cost = buildCost(b), no = b.k === 4 && !COAST[p.j]; return `<button class="btn ${has ? 'green' : ''}" data-a="build" data-v="${p.j}" data-k="${b.k}" ${has || no || me.money < cost ? 'disabled' : ''} title="${b.d}">${b.i} ${b.n}<small>${has ? 'construído' : no ? 'sem costa' : '$' + fmt(cost)}</small></button>`; }).join('')}</div>
    <div class="btns"><button class="btn gold" data-a="reinforce" data-v="${p.j}">Reforçar<small>50% dos soldados livres</small></button><button class="btn red" data-a="newArmy" data-v="${p.j}" ${G.armies.length >= maxArmies() ? 'disabled' : ''}>Novo general<small>${G.armies.length}/${maxArmies()} exércitos</small></button></div>`;
  } else if (atWar(me.i, o.i)) {
    const src = attackSource(me.i, p.j);
    if (src) {
      const sf = src.sea ? seaF(me.i, src.from) : 1;
      const opts = [[0.25, '25%'], [0.5, '50%'], [1, 'Tudo']].map(([f, l]) => {
        const n = Math.floor(me.troops * f) + Math.floor(me.tanks * f) * tankMult(p.j, src.sea), ch = winChance(n, me.i, p.j, src.sea, sf);
        return `<button class="btn red ${ch > 0.6 ? 'pulse' : ''}" data-a="attack" data-v="${p.j}" data-f="${f}" ${n < 1 ? 'disabled' : ''}>${l} · ${fmt(n)}<small>vitória ${Math.round(ch * 100)}%</small></button>`;
      }).join('');
      html += `${src.sea ? `<p class="note">Desembarque por mar: ${sf >= 0.95 ? 'o porto evita a penalização' : me.ships ? 'os navios reduzem a penalização (-15%)' : 'sem navios as tropas lutam com -45%'}.</p>` : ''}<div class="btns">${opts}</div>`;
    } else html += `<p class="note warn">Não tens fronteira com esta província. Manda um general, bombardeia-a ou usa um míssil.</p>`;
    const freeP = me.planes - G.planesUsed;
    html += `<div class="btns"><button class="btn blue" data-a="air" data-v="${p.j}" ${freeP < 1 ? 'disabled' : ''}>✈️ Ataque aéreo<small>${freeP}/${me.planes} aviões hoje</small></button>
    <button class="btn red" data-a="missile" data-v="${p.j}" ${me.missiles < 1 ? 'disabled' : ''}>🚀 Míssil<small>${me.missiles ? me.missiles + ' pronto' + (me.missiles > 1 ? 's' : '') : 'compra no Exército'}</small></button>
    <button class="btn green" data-a="peace" data-v="${o.i}">Propor paz<small>aceitação ~${Math.round(peaceChance(o.i) * 100)}%</small></button></div>
    ${spyButtons(o)}`;
  } else {
    const allies = al ? [...al.members].filter((m) => m !== o.i && m !== me.i && C[m].alive && !allied(m, me.i)) : [];
    const isAlly = allied(me.i, o.i);
    const truce = G.truce[pairKey(me.i, o.i)] > G.day;
    const trading = G.trade.includes(o.i);
    if (warConfirm === o.i) {
      html += `<p class="note warn">${allies.length ? `⚠️ Os aliados vão defendê-lo: ${allies.map((m) => C[m].flag).join(' ')}` : 'Não tem aliados para o defender.'}${trading ? ' O acordo comercial acaba.' : ''}</p>
      <div class="btns"><button class="btn red pulse" data-a="war" data-v="${o.i}">Confirmar guerra</button><button class="btn" data-a="nowar">Cancelar</button></div>`;
    } else {
      html += `<div class="btns">
      ${isAlly ? '' : `<button class="btn red" data-a="warask" data-v="${o.i}" ${truce ? 'disabled' : ''}>Declarar guerra<small>${truce ? 'tréguas até dia ' + G.truce[pairKey(me.i, o.i)] : allies.length ? allies.length + ' aliados vão defendê-lo' : 'sem aliados'}</small></button>`}
      ${isAlly ? '' : `<button class="btn green" data-a="ally" data-v="${o.i}">Aliança<small>${al ? 'entrar no bloco' : 'formar aliança'} · ${Math.round(allianceChance(o.i) * 100)}%</small></button>`}
      <button class="btn gold" data-a="gift" data-v="${o.i}" ${me.money < giftCost(o) ? 'disabled' : ''}>Presente<small>$${giftCost(o)} · +relação</small></button></div>
      <div class="btns"><button class="btn ${trading ? 'green' : 'blue'}" data-a="trade" data-v="${o.i}">💱 ${trading ? 'A comerciar' : 'Comércio'}<small>${trading ? 'toca para cancelar' : '+$' + fmt(1 + 0.08 * Math.min(incomeBase(me), incomeBase(o))) + '/dia'}</small></button>
      ${isAlly ? '' : `<button class="btn gold" data-a="tribute" data-v="${o.i}" ${G.tribCD[o.i] > G.day ? 'disabled' : ''}>👑 Exigir tributo<small>${power(me) > power(o) * 1.5 ? 'és muito mais forte' : 'precisas de ser mais forte'}</small></button>`}</div>
      ${spyButtons(o)}`;
    }
  }
  el.innerHTML = html + '</div>';
}
let spyMenu = -1;
function spyButtons(o) {
  const cost = spyCost(o), poor = C[G.player].money < cost;
  if (spyMenu !== o.i) return `<div class="btns"><button class="btn" data-a="spymenu" data-v="${o.i}">🕵️ Espiões<small>missões secretas · $${fmt(cost)}</small></button></div>`;
  return `<p class="note">Missão secreta em ${o.n} ($${fmt(cost)}). Se os espiões forem apanhados, a relação piora muito.</p>
  <div class="btns"><button class="btn blue" data-a="spy" data-v="${o.i}" data-k="steal" ${poor ? 'disabled' : ''}>💸 Roubar<small>60%</small></button><button class="btn blue" data-a="spy" data-v="${o.i}" data-k="sabotage" ${poor ? 'disabled' : ''}>💣 Sabotar<small>-25% defesas · 55%</small></button></div>
  <div class="btns"><button class="btn blue" data-a="spy" data-v="${o.i}" data-k="revolt" ${poor ? 'disabled' : ''}>🔥 Revolta<small>45%</small></button><button class="btn blue" data-a="spy" data-v="${o.i}" data-k="provoke" ${poor ? 'disabled' : ''}>⚔️ Provocar guerra<small>com um vizinho · 40%</small></button><button class="btn" data-a="spymenu" data-v="-1">Fechar</button></div>`;
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
    <div class="box"><h4>Recursos</h4>${Object.entries(RES).map(([k, r]) => `<div class="row"><span class="f">${r.i}</span><div class="grow">${r.n}<small>${r.d}</small></div><b>${me['_' + k] || 0}</b></div>`).join('')}<p class="note">Conquista províncias com recursos para ganhares estes bónus. Toca numa província para ver o que tem.</p></div>
    <div class="box"><h4>Comércio</h4>${G.trade.length ? G.trade.map((t) => `<div class="row"><span class="f">${C[t].flag}</span><div class="grow">${C[t].n}<small>+$${fmt(1 + 0.08 * Math.min(incomeBase(me), incomeBase(C[t])))} por dia</small></div><button class="btn" data-a="trade" data-v="${t}">Cancelar</button></div>`).join('') : '<p class="note">Sem acordos. Toca num país em paz contigo e escolhe Comércio.</p>'}<p class="note">${G.trade.length}/${3 + me.eco} acordos · a guerra cancela o acordo.</p></div>
    <div class="box"><h4>Edifícios</h4>${BUILD.map((b) => `<div class="row"><span class="f">${b.i}</span><div class="grow">${b.n}<small>${b.d} · $${fmt(buildCost(b))}</small></div><b>${P.filter((q) => q.owner === me.i && q.b & b.k).length}</b></div>`).join('')}<p class="note">Constrói tocando numa das tuas províncias.</p></div>
    <div class="box"><h4>As tuas províncias mais ricas</h4>${provsOf(me.i).sort((a, b) => value(b) - value(a)).slice(0, 6).map((p) => `<div class="row"><span class="f">${C[p.orig].flag}</span><div class="grow">${p.n}<small>${C[p.orig].n}${p.occ ? ' · ocupada' : ''}</small></div><b>+${value(p).toFixed(1)}</b></div>`).join('')}</div>`;
  } else if (sheetTab === 'army') {
    title = 'Exército';
    const enemies = [...me.wars];
    const unit = (kind, ico, name, desc, have, opts) => { const c = COST[kind](me); return `<div class="up"><div class="ico" style="background:linear-gradient(#ffd1d8,#d61f3d)">${ico}</div><div class="t"><b>${name} · ${fmt(have)}</b><small>${desc} · $${c.toFixed(c < 10 ? 1 : 0)}</small></div><div class="btns" style="flex-wrap:nowrap">${opts.map((n) => `<button class="btn red" data-a="buy" data-k="${kind}" data-v="${n}" ${me.money < c * (n === 'max' ? 1 : n) ? 'disabled' : ''}>${n === 'max' ? 'Máx' : '+' + n}</button>`).join('')}</div></div>`; };
    body = `<div class="box"><h4>Forças</h4><div class="kv"><div><small>Recrutas/dia</small><b>+${regen(me).toFixed(1)}</b></div><div><small>Poder total</small><b>${fmt(power(me))}</b></div><div><small>Dinheiro</small><b>$${fmt(me.money)}</b></div></div></div>
    <div class="box"><h4>Recrutar e construir</h4>
    ${unit('inf', '🪖', 'Soldados', 'baratos, defendem e ocupam', me.troops, [10, 'max'])}
    ${unit('tank', '⛟', 'Tanques', 'valem 3 soldados em planície, menos em montanha e floresta', me.tanks, [5, 'max'])}
    ${unit('ship', '🚢', 'Navios', 'desembarques por mar com menos penalização', me.ships, [1])}
    ${unit('plane', '✈️', 'Aviões', 'um bombardeamento por avião por dia', me.planes, [1])}
    ${unit('missile', '🚀', 'Míssil', 'devasta uma província inteira · o mundo vai odiar-te', me.missiles, [1])}</div>
    <div class="box"><h4>Generais (${G.armies.length}/${maxArmies()})</h4>${G.armies.length ? G.armies.map((a) => `<div class="row"><span class="f">🎖️</span><div class="grow">General ${a.name} · ${TRAITS[a.trait].n}<small>${fmt(a.inf)} soldados · ${fmt(a.tank)} tanques · ${P[a.prov].n}${a.path.length ? ' → ' + P[a.path[a.path.length - 1]].n : ''}${a.auto ? ' · automático' : ''}</small></div><button class="btn gold" data-a="armySel" data-v="${a.id}">Ver</button></div>`).join('') : '<p class="note">Ainda não tens generais.</p>'}
    <button class="btn red" data-a="newArmy" data-v="${me.cap}" ${G.armies.length >= maxArmies() ? 'disabled' : ''}>Novo general na capital<small>leva 50% dos soldados e tanques livres</small></button></div>
    <div class="box"><h4>Comparar forças</h4>${enemies.length ? enemies.map((e) => { const c = C[e], r = power(me) / (power(me) + power(c)); return `<div class="row"><span class="f">${c.flag}</span><div class="grow">${c.n}<small>poder ${fmt(power(c))} · ${c._np} prov.</small><div class="chance"><div style="width:${r * 100}%"></div></div></div></div>`; }).join('') : '<p class="note">Não estás em guerra.</p>'}</div>
    <div class="box"><h4>Terreno</h4>${TERR.map((t) => `<div class="row"><span class="f">${t.i}</span><div class="grow">${t.n}<small>defesa ${t.d > 1 ? '+' + Math.round((t.d - 1) * 100) + '%' : 'normal'} · tanque vale ${t.t} soldados</small></div></div>`).join('')}</div>`;
  } else if (sheetTab === 'dip') {
    title = 'Diplomacia';
    const al = me.ally >= 0 ? alliances[me.ally] : null;
    const wars = [...me.wars];
    const rank = C.filter((c) => c.alive).sort((a, b) => b._np - a._np || power(b) - power(a)).slice(0, 10);
    const threat = Math.round((me._np / NP) * 120 + G.aggr);
    body = `<div class="box"><h4>Ameaça mundial</h4><div class="chance"><div style="width:${clamp(threat / 60, 0, 1) * 100}%;background:linear-gradient(90deg,#2ee59d,#ffc93c,#ff3d5a)"></div></div><p class="note">${threat < 20 ? 'O mundo não te vê como ameaça.' : threat < 30 ? 'Os vizinhos começam a desconfiar de ti.' : 'Perigo: podem formar uma coligação contra ti!'} Guerras, mísseis, tributos e anexações aumentam a ameaça.</p></div>
    <div class="box"><h4>A tua aliança</h4>${al ? `<div class="row"><div class="grow"><b>${al.name}</b><small>${al.members.size} membros</small></div><button class="btn" data-a="leave">Sair</button></div><div class="flagrow">${[...al.members].map((m) => C[m].flag).join(' ')}</div>` : '<p class="note">Não tens aliança. Toca num país no mapa e propõe uma.</p>'}</div>
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
  else if (a === 'buy') A.buy(b.dataset.k, v === 'max' ? 'max' : +v);
  else if (a === 'build') A.build(+v, +b.dataset.k);
  else if (a === 'newArmy') { A.newArmy(+v); if (sheetTab) openTab('map'); }
  else if (a === 'armySel') { selArmy = +v; sel = -1; openTab('map'); const ar = armyById(selArmy); if (ar) flyTo(LABEL[ar.prov][0], LABEL[ar.prov][1], Math.max(cam.s, 8), 600); }
  else if (a === 'armyAuto') A.armyAuto(+v);
  else if (a === 'armyStop') A.armyStop(+v);
  else if (a === 'armyReinforce') A.armyReinforce(+v);
  else if (a === 'armyDisband') A.armyDisband(+v);
  else if (a === 'armyClose') selArmy = -1;
  else if (a === 'missile') A.missile(+v);
  else if (a === 'trade') A.trade(+v);
  else if (a === 'tribute') A.tribute(+v);
  else if (a === 'spymenu') spyMenu = +v;
  else if (a === 'spy') { spyMenu = -1; A.spy(+v, b.dataset.k); }
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
  const b = e.target.closest('button'); if (!b || b.dataset.s === undefined) return;
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
  const c = Math.floor((x + 180) / S), r = Math.floor((y - M.Y0) / S);
  // toque mesmo ao lado da costa: procurar à volta
  for (let rad = 0; rad <= 3; rad++) for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
    if (Math.max(Math.abs(dc), Math.abs(dr)) !== rad) continue;
    const i = cellAt(c + dc, r + dr); if (i >= 0) return i;
  }
  return -1;
}
function tapAt(px, py) {
  // tocar num exército seleciona-o
  for (const a of G.armies) { const [X, Y] = armyScreenPos(a); if (Math.abs(X - px) < 18 && Math.abs(Y - py) < 16) { selArmy = a.id; sel = -1; sfx.select(); renderPanel(); return; } }
  const i = hexAtWorld(wx(px), wy(py));
  const ar = armyById(selArmy);
  if (ar) {
    if (i < 0) { selArmy = -1; renderPanel(); return; }
    const dest = CP[i];
    if (!passable(dest)) { toast('Só podes avançar por território teu, aliado ou de um inimigo em guerra.', 'war'); return; }
    const path = armyPath(ar, dest);
    if (!path) { toast(C[G.player].ships ? 'Não há caminho até lá.' : 'Não há caminho por terra. Compra navios para atravessar o mar.', 'war'); return; }
    ar.path = path; ar.prog = 0; sfx.march();
    toast(path.length ? `🎖️ O General ${ar.name} avança para ${P[dest].n}.` : `O General ${ar.name} fica em ${P[dest].n}.`, 'good');
    renderPanel(); return;
  }
  let j = i < 0 ? -1 : CP[i];
  // com pouco zoom, um toque perto de uma mira vermelha escolhe esse alvo
  let bd = 24 * 24;
  for (const t of attackable) { const d = (sx(LABEL[t][0]) - px) ** 2 + (sy(LABEL[t][1]) - py) ** 2; if (d < bd) { bd = d; j = t; } }
  if (j !== sel) { warConfirm = -1; spyMenu = -1; }
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
    build: () => { [330, 440, 554].forEach((f, k) => tone(f, 0.08, 'square', 0.04, 0, k * 0.06)); noise(0.15, 0.05, 0.2); },
    spy: () => [880, 660, 880, 660].forEach((f, k) => tone(f, 0.06, 'triangle', 0.03, 0, k * 0.08)),
    missile: () => { tone(200, 2.2, 'sawtooth', 0.03, 900); noise(0.6, 0.05); },
    revolt: () => { noise(0.4, 0.1); [262, 247, 233].forEach((f, k) => tone(f, 0.15, 'sawtooth', 0.04, 0, k * 0.1)); },
    event: () => [784, 988, 784].forEach((f, k) => tone(f, 0.1, 'square', 0.035, 0, k * 0.1)),
    ctx: get,
  };
})();

// ---------- Música arcade (sintetizada) ----------
const music = (() => {
  let on = true, timer = null, step = 0, nextT = 0, gain = null;
  try { on = localStorage.getItem('imperio-musica') !== '0'; } catch (e) { /* */ }
  const PEACE = { bpm: 116, ch: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]] };
  const WAR = { bpm: 148, ch: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]] };
  const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
  function note(a, f, t, d, type, vol) {
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(gain); o.start(t); o.stop(t + d + 0.02);
  }
  function hat(a, t) {
    const n = a.createBuffer(1, a.sampleRate * 0.04, a.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 6000; g.gain.value = 0.03; s.buffer = n; s.connect(f).connect(g).connect(gain); s.start(t);
  }
  function schedule() {
    const a = sfx.ctx(); if (!a || !on) return;
    if (!gain) { gain = a.createGain(); gain.gain.value = 0.8; gain.connect(a.destination); }
    const war = !!(C && G && C[G.player] && C[G.player].wars.size);
    const m = war ? WAR : PEACE, spb = 60 / m.bpm / 2;
    if (nextT < a.currentTime) nextT = a.currentTime + 0.05;
    while (nextT < a.currentTime + 0.25) {
      const bar = Math.floor(step / 8) % 4, chord = m.ch[bar], st = step % 8;
      if (st % 4 === 0) note(a, hz(chord[0] - 24), nextT, spb * 1.9, 'triangle', 0.07);
      if (war && st % 4 === 2) note(a, hz(chord[0] - 12), nextT, spb * 0.8, 'triangle', 0.05);
      const arp = [0, 1, 2, 1, 0, 2, 1, 2][st];
      note(a, hz(chord[arp] + 12), nextT, spb * 0.8, 'square', 0.016);
      if (st === 0 && step % 32 === 0) note(a, hz(chord[2] + 24), nextT, spb * 3, 'triangle', 0.02);
      if (war || st % 2 === 1) hat(a, nextT);
      nextT += spb; step++;
    }
  }
  return {
    start() { if (!timer) timer = setInterval(schedule, 80); },
    get on() { return on; },
    toggle() {
      on = !on;
      try { localStorage.setItem('imperio-musica', on ? '1' : '0'); } catch (e) { /* */ }
      if (gain) gain.gain.value = on ? 0.8 : 0;
      return on;
    },
  };
})();
$('#music').onclick = () => { const on = music.toggle(); $('#music').classList.toggle('off', !on); $('#music').textContent = on ? '♪' : '♪̸'; music.start(); };
$('#zheat').onclick = () => { heatMode = !heatMode; $('#zheat').classList.toggle('on', heatMode); if (heatMode) toast('🔥 Mapa de guerra: zonas vermelhas são combates recentes; linhas vermelhas são frentes de guerra.', 'war'); };

// ---------- Guardar ----------
const SAVE = 'imperio-quadrados-v4';
function save() {
  try {
    localStorage.setItem(SAVE, JSON.stringify({
      G: { ...G, pending: G.pending },
      C: C.map((c) => ({ money: c.money, troops: c.troops, tanks: c.tanks, ships: c.ships, planes: c.planes, missiles: c.missiles, boom: c.boom, crisis: c.crisis, eco: c.eco, mil: c.mil, def: c.def, alive: c.alive, wars: [...c.wars], ally: c.ally, rel: c.rel, cap: c.cap })),
      P: P.map((p) => [p.owner, Math.round(p.gar * 10) / 10, p.occ, p.b, p.res, p.dev]),
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
    s.P.forEach((d, j) => { P[j].owner = d[0]; P[j].gar = d[1]; P[j].occ = d[2]; P[j].b = d[3] || 0; P[j].res = d[4] || ''; P[j].dev = d[5] || 0; });
    alliances = s.AL.map((a, id) => ({ id, name: a.name, color: a.color, members: new Set(a.members) }));
    return true;
  } catch (e) { return false; }
}
const hasSave = () => { try { return !!localStorage.getItem(SAVE); } catch (e) { return false; } };

// ---------- Início / fim ----------
function startGame() {
  countProv(); computeAttackable(); cacheDirty = true; makePal(); selArmy = -1; spyMenu = -1;
  music.start();
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
window.__imperio = { dbg(j) { const a = G.armies[0]; return { passable: passable(j), path: a && armyPath(a, j), owner: P[j].owner, me: G.player, atWar: atWar(G.player, P[j].owner), ships: C[G.player].ships }; }, tap: (x, y) => { const r = cv.getBoundingClientRect(); tapAt(x - r.left, y - r.top); }, scr(j) { const r = cv.getBoundingClientRect(); return [sx(LABEL[j][0]) + r.left, sy(LABEL[j][1]) + r.top]; }, get att() { return [...attackable]; }, get C() { return C; }, get P() { return P; }, get G() { return G; }, A, tick };
})();
