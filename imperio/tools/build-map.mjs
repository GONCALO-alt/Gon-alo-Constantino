/**
 * Gera imperio/data.js: o mapa do mundo em quadrados, dividido em países e províncias.
 *
 * Precisa de: npm i world-atlas@2 i18n-iso-countries topojson-client (numa pasta à parte)
 * Uso: NODE_PATH=<pasta>/node_modules node imperio/tools/build-map.mjs
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(join(process.env.NODE_PATH || '.', 'x.js'));
const topo = require('world-atlas/countries-110m.json');
const { feature } = require('topojson-client');
const iso = require('i18n-iso-countries');
iso.registerLocale(require('i18n-iso-countries/langs/pt.json'));

// ---------- Projeção (Miller), em "graus" ----------
const RAD = Math.PI / 180;
const projY = (lat) => -1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * RAD)) / RAD;
const invY = (y) => (Math.atan(Math.exp((-y * RAD) / 1.25)) - Math.PI / 4) / 0.4 / RAD;

const LAT_TOP = 76, LAT_BOT = -56;
const S = 0.8; // lado do quadrado, em graus
const W = S, H = S;
const UNIT = (S * S) / 3.74; // área de um quadrado comparada com a de um hexágono antigo (R=1.2)
const Y0 = projY(LAT_TOP), Y1 = projY(LAT_BOT);
const COLS = Math.round(360 / W);
const ROWS = Math.ceil((Y1 - Y0) / H) + 1;
const center = (c, r) => [-180 + (c + 0.5) * S, Y0 + (r + 0.5) * S];

// ---------- Países ----------
const MERGE = { 'N. Cyprus': '196', Somaliland: '706', Greenland: '208', 'Puerto Rico': '840', 'New Caledonia': '250', 'Falkland Is.': '826' };
const DROP = new Set(['010', '260']); // Antártida, Terras Austrais Francesas
const NAME_PT = {
  XK: 'Kosovo', US: 'Estados Unidos', GB: 'Reino Unido', RU: 'Rússia', CD: 'RD Congo', CG: 'Congo', KR: 'Coreia do Sul', KP: 'Coreia do Norte',
  IR: 'Irão', SY: 'Síria', VE: 'Venezuela', BO: 'Bolívia', TZ: 'Tanzânia', LA: 'Laos', VN: 'Vietname', MD: 'Moldávia', MK: 'Macedónia do Norte',
  CZ: 'Chéquia', PS: 'Palestina', TW: 'Taiwan', CI: 'Costa do Marfim', BA: 'Bósnia', SZ: 'Essuatíni', FK: 'Malvinas', EH: 'Saara Ocidental',
  DO: 'Rep. Dominicana', CF: 'Rep. Centro-Africana', SS: 'Sudão do Sul', TL: 'Timor-Leste', BN: 'Brunei', AE: 'Emirados Árabes', NL: 'Países Baixos', MM: 'Mianmar', KW: 'Kuwait', DJ: 'Jibuti',
};
const features = feature(topo, topo.objects.countries).features;
const countries = []; // {a2, n, polys:[rings...]}
const byNum = new Map();
for (const f of features) {
  let num = f.id, nm = f.properties.name;
  if (DROP.has(num)) continue;
  if (MERGE[nm]) num = MERGE[nm];
  let a2 = num ? iso.numericToAlpha2(num) : null;
  if (nm === 'Kosovo') a2 = 'XK';
  if (!a2) { console.warn('sem código:', nm, num); continue; }
  let c = countries.find((x) => x.a2 === a2);
  if (!c) {
    c = { a2, n: NAME_PT[a2] || iso.getName(a2, 'pt', { select: 'alias' }) || iso.getName(a2, 'pt') || nm, polys: [] };
    countries.push(c);
  }
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const p of polys) {
    const ring = p[0].map(([lon, lat]) => [lon, projY(Math.max(-85, Math.min(85, lat)))]);
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
    for (const [x, y] of ring) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); }
    if (bx1 - bx0 > 180) { // atravessa a linha de data: dividir em duas metades
      for (const side of [-1, 1]) {
        const sh = (r) => r.map(([x, y]) => [side < 0 ? (x > 0 ? x - 360 : x) : (x < 0 ? x + 360 : x), y]);
        const rr = p.map((r) => sh(r.map(([lon, lat]) => [lon, projY(Math.max(-85, Math.min(85, lat)))])));
        const xs = rr[0].map((q) => q[0]), ys = rr[0].map((q) => q[1]);
        c.polys.push({ rings: rr, bb: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] });
      }
      continue;
    }
    c.polys.push({ rings: p.map((r) => r.map(([lon, lat]) => [lon, projY(Math.max(-85, Math.min(85, lat)))])), bb: [bx0, by0, bx1, by1] });
  }
  byNum.set(num, c);
}
countries.forEach((c, i) => (c.i = i));

function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function countryAt(x, y) {
  for (const c of countries) for (const p of c.polys) {
    const b = p.bb;
    if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
    if (inRing(x, y, p.rings[0]) && !p.rings.slice(1).some((h) => inRing(x, y, h))) return c.i;
  }
  return -1;
}

// ---------- Grelha ----------
const grid = new Map(); // "c,r" -> country
const key = (c, r) => c + ',' + r;
const SAMPLES = [[0, 0], [-0.3 * S, -0.3 * S], [0.3 * S, -0.3 * S], [-0.3 * S, 0.3 * S], [0.3 * S, 0.3 * S]];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  const [x, y] = center(c, r);
  const votes = new Map();
  for (const [dx, dy] of SAMPLES) {
    const k = countryAt(x + dx, y + dy);
    if (k >= 0) votes.set(k, (votes.get(k) || 0) + 1);
  }
  if (!votes.size) continue;
  const tot = [...votes.values()].reduce((a, b) => a + b, 0);
  if (tot < 2 && !votes.has(countryAt(x, y))) continue;
  grid.set(key(c, r), [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0]);
}
function neighbors(c, r) {
  const d = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  return d.map(([dc, dr]) => [(c + dc + COLS) % COLS, r + dr]);
}
function nearestCell(x, y) {
  return [((Math.floor((x + 180) / S) % COLS) + COLS) % COLS, Math.floor((y - Y0) / S)];
}
// Países pequenos sem hexágono: recebem o hexágono mais próximo do seu centro.
const count = () => { const m = new Map(); for (const v of grid.values()) m.set(v, (m.get(v) || 0) + 1); return m; };
const locked = new Set();
for (const c of countries) {
  if (count().get(c.i)) continue;
  const big = c.polys.reduce((a, b) => ((b.bb[2] - b.bb[0]) * (b.bb[3] - b.bb[1]) > (a.bb[2] - a.bb[0]) * (a.bb[3] - a.bb[1]) ? b : a));
  const ring = big.rings[0];
  const x = ring.reduce((s, p) => s + p[0], 0) / ring.length, y = ring.reduce((s, p) => s + p[1], 0) / ring.length;
  const start = nearestCell(x, y);
  // procura em espiral: oceano livre ou hexágono de um país grande
  const seen = new Set([key(...start)]), q = [start];
  const cnt = count();
  while (q.length) {
    const [cc, rr] = q.shift();
    const k = key(cc, rr), own = grid.get(k);
    if (!locked.has(k) && (own === undefined || cnt.get(own) > 3)) { grid.set(k, c.i); locked.add(k); break; }
    for (const n of neighbors(cc, rr)) { const nk = key(...n); if (!seen.has(nk)) { seen.add(nk); q.push(n); } }
  }
}

// ---------- Províncias (crescimento a partir de sementes) ----------
const hexes = [...grid.entries()].map(([k, ci]) => { const [c, r] = k.split(',').map(Number); return { c, r, ci, p: -1 }; });
const hexAt = new Map(hexes.map((h, i) => [key(h.c, h.r), i]));
const hexNb = (h) => neighbors(h.c, h.r).map((n) => hexAt.get(key(...n))).filter((i) => i !== undefined);
const DIRS = ['Norte', 'Sul', 'Leste', 'Oeste', 'Centro', 'Nordeste', 'Noroeste', 'Sudeste', 'Sudoeste'];
const provinces = [];
function hexDist(a, b) {
  let dx = Math.abs(a.c - b.c); if (dx > COLS / 2) dx = COLS - dx;
  return Math.max(dx, Math.abs(a.r - b.r));
}
for (const country of countries) {
  const mine = hexes.map((h, i) => i).filter((i) => hexes[i].ci === country.i);
  const total = mine.length;
  const nProv = Math.max(total >= 10 ? 2 : 1, Math.round(Math.sqrt(total * UNIT) * 1.1));
  // componentes ligadas
  const comp = new Map(); const comps = [];
  for (const i of mine) {
    if (comp.has(i)) continue;
    const list = [i]; comp.set(i, comps.length);
    for (let k = 0; k < list.length; k++) for (const n of hexNb(hexes[list[k]])) if (hexes[n].ci === country.i && !comp.has(n)) { comp.set(n, comps.length); list.push(n); }
    comps.push(list);
  }
  for (const list of comps) {
    let k = Math.max(1, Math.round((list.length / total) * nProv));
    if (list.length < 2 && comps.length > 1 && list.length / total < 0.05) k = 1;
    k = Math.min(k, list.length);
    // sementes: ponto mais distante sucessivo
    const seeds = [list[0]];
    let far = list[0], fd = -1;
    for (const i of list) { const d = hexDist(hexes[i], hexes[list[0]]); if (d > fd) { fd = d; far = i; } }
    seeds[0] = far;
    while (seeds.length < k) {
      let best = -1, bd = -1;
      for (const i of list) { const d = Math.min(...seeds.map((s) => hexDist(hexes[i], hexes[s]))); if (d > bd) { bd = d; best = i; } }
      seeds.push(best);
    }
    // ajuste de Lloyd (2 passagens) para províncias mais equilibradas
    const assign = () => {
      const lab = new Map(); const fronts = seeds.map((s, j) => { lab.set(s, j); return [s]; });
      let any = true;
      while (any) {
        any = false;
        fronts.forEach((fr, j) => {
          const next = [];
          for (const i of fr) for (const n of hexNb(hexes[i])) if (hexes[n].ci === country.i && comp.get(n) === comp.get(list[0]) && !lab.has(n)) { lab.set(n, j); next.push(n); }
          fronts[j] = next; if (next.length) any = true;
        });
      }
      return lab;
    };
    let lab = assign();
    for (let it = 0; it < 3; it++) {
      for (let j = 0; j < seeds.length; j++) {
        const mem = list.filter((i) => lab.get(i) === j);
        const mc = mem.reduce((s, i) => s + hexes[i].c, 0) / mem.length, mr = mem.reduce((s, i) => s + hexes[i].r, 0) / mem.length;
        let best = seeds[j], bd = 1e9;
        for (const i of mem) { const d = (hexes[i].c - mc) ** 2 + (hexes[i].r - mr) ** 2; if (d < bd) { bd = d; best = i; } }
        seeds[j] = best;
      }
      lab = assign();
    }
    const base = provinces.length;
    for (let j = 0; j < seeds.length; j++) provinces.push({ ci: country.i, hexes: [] });
    for (const i of list) { const pj = base + lab.get(i); hexes[i].p = pj; provinces[pj].hexes.push(i); }
  }
}
// ---------- Geometria e nomes das províncias ----------
for (const p of provinces) {
  const pts = p.hexes.map((i) => center(hexes[i].c, hexes[i].r));
  p.x = pts.reduce((s, q) => s + q[0], 0) / pts.length;
  p.y = pts.reduce((s, q) => s + q[1], 0) / pts.length;
}
// Capitais conhecidas (lon, lat)
const CAP = {
  PT: [-9.14, 38.72], ES: [-3.7, 40.42], FR: [2.35, 48.86], GB: [-0.13, 51.5], DE: [13.4, 52.52], IT: [12.5, 41.9], US: [-77.04, 38.9], CA: [-75.7, 45.42],
  MX: [-99.13, 19.43], BR: [-47.88, -15.79], AR: [-58.38, -34.6], RU: [37.62, 55.75], CN: [116.4, 39.9], IN: [77.2, 28.6], JP: [139.7, 35.7],
  AU: [149.13, -35.28], ZA: [28.2, -25.75], EG: [31.24, 30.04], NG: [7.49, 9.06], TR: [32.86, 39.93], SA: [46.7, 24.7], IR: [51.4, 35.7],
  PK: [73.05, 33.7], ID: [106.85, -6.2], KR: [126.98, 37.57], KP: [125.75, 39.03], UA: [30.52, 50.45], PL: [21.01, 52.23], SE: [18.07, 59.33],
  NO: [10.75, 59.91], FI: [24.94, 60.17], CL: [-70.65, -33.45], CO: [-74.07, 4.71], PE: [-77.04, -12.05], VE: [-66.9, 10.5], KZ: [71.43, 51.13],
  DZ: [3.06, 36.75], MA: [-6.85, 34.02], CD: [15.27, -4.33], AO: [13.23, -8.84], MZ: [32.57, -25.97], ET: [38.74, 9.03], KE: [36.82, -1.29],
  NZ: [174.78, -41.29], TH: [100.5, 13.75], VN: [105.85, 21.03], PH: [120.98, 14.6], MN: [106.9, 47.9], IQ: [44.37, 33.31], LY: [13.19, 32.89],
  SD: [32.53, 15.5], BO: [-68.15, -16.5], GR: [23.73, 37.98], RO: [26.1, 44.43], AF: [69.17, 34.53], MY: [101.69, 3.14], MM: [96.13, 19.75],
};
const provsOf = (ci) => provinces.map((p, i) => i).filter((i) => provinces[i].ci === ci);
for (const c of countries) {
  const ps = provsOf(c.i);
  let cap;
  if (CAP[c.a2]) {
    const [lon, lat] = CAP[c.a2]; const y = projY(lat);
    cap = ps.reduce((a, b) => ((provinces[b].x - lon) ** 2 + (provinces[b].y - y) ** 2 < (provinces[a].x - lon) ** 2 + (provinces[a].y - y) ** 2 ? b : a));
  } else {
    // a província mais central da maior parte do país
    const mx = ps.reduce((s, i) => s + provinces[i].x * provinces[i].hexes.length, 0) / ps.reduce((s, i) => s + provinces[i].hexes.length, 0);
    const my = ps.reduce((s, i) => s + provinces[i].y * provinces[i].hexes.length, 0) / ps.reduce((s, i) => s + provinces[i].hexes.length, 0);
    cap = ps.reduce((a, b) => ((provinces[b].x - mx) ** 2 + (provinces[b].y - my) ** 2 < (provinces[a].x - mx) ** 2 + (provinces[a].y - my) ** 2 ? b : a));
  }
  provinces[cap].cap = true;
  c.cap = cap;
  // nomes por direção em relação à capital
  const used = new Map();
  for (const i of ps) {
    const p = provinces[i];
    let nm;
    if (i === cap) nm = 'Capital';
    else {
      const dx = p.x - provinces[cap].x, dy = provinces[cap].y - p.y; // dy>0 = norte
      const a = Math.atan2(dy, dx) / RAD;
      const dist = Math.hypot(dx, dy);
      if (dist < 2.5) nm = 'Centro';
      else nm = a > 157.5 || a <= -157.5 ? 'Oeste' : a > 112.5 ? 'Noroeste' : a > 67.5 ? 'Norte' : a > 22.5 ? 'Nordeste' : a > -22.5 ? 'Leste' : a > -67.5 ? 'Sudeste' : a > -112.5 ? 'Sul' : 'Sudoeste';
    }
    const n = (used.get(nm) || 0) + 1; used.set(nm, n);
    p.name = nm; p.k = n;
  }
  for (const i of ps) { const p = provinces[i]; if (used.get(p.name) > 1) p.name += ' ' + ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][p.k - 1] || p.k; }
}

// ---------- Ligações entre províncias ----------
const adj = provinces.map(() => new Set());
for (const h of hexes) for (const n of hexNb(h)) { const q = hexes[n].p; if (q !== h.p) { adj[h.p].add(q); adj[q].add(h.p); } }
const sea = provinces.map(() => new Set());
// só os quadrados da orla contam para as distâncias por mar
provinces.forEach((p) => (p.edge = p.hexes.filter((i) => hexNb(hexes[i]).length < 4 || hexNb(hexes[i]).some((n) => hexes[n].p !== hexes[i].p))));
function provDist(a, b) {
  let best = 1e9;
  for (const i of provinces[a].edge) for (const j of provinces[b].edge) best = Math.min(best, hexDist(hexes[i], hexes[j]));
  return best;
}
// rotas marítimas curtas
const SEA_RANGE = Math.round(8 / S);
for (let a = 0; a < provinces.length; a++) for (let b = a + 1; b < provinces.length; b++) {
  if (adj[a].has(b)) continue;
  let dx = Math.abs(provinces[a].x - provinces[b].x); dx = Math.min(dx, 360 - dx);
  if (dx > 15 || Math.abs(provinces[a].y - provinces[b].y) > 15) continue;
  if (provDist(a, b) <= SEA_RANGE) { sea[a].add(b); sea[b].add(a); }
}
// garantir que todo o mundo está ligado
for (;;) {
  const compOf = new Array(provinces.length).fill(-1); let nc = 0;
  for (let s = 0; s < provinces.length; s++) {
    if (compOf[s] >= 0) continue;
    const st = [s]; compOf[s] = nc;
    while (st.length) { const v = st.pop(); for (const w of [...adj[v], ...sea[v]]) if (compOf[w] < 0) { compOf[w] = nc; st.push(w); } }
    nc++;
  }
  if (nc === 1) break;
  // ligar a componente mais pequena à mais próxima
  const sizes = new Array(nc).fill(0); compOf.forEach((c) => sizes[c]++);
  const small = sizes.indexOf(Math.min(...sizes));
  let best = null, bd = 1e9;
  for (let a = 0; a < provinces.length; a++) if (compOf[a] === small) for (let b = 0; b < provinces.length; b++) if (compOf[b] !== small) {
    let dx = Math.abs(provinces[a].x - provinces[b].x); dx = Math.min(dx, 360 - dx);
    const d = Math.hypot(dx, provinces[a].y - provinces[b].y);
    if (d < bd) { bd = d; best = [a, b]; }
  }
  sea[best[0]].add(best[1]); sea[best[1]].add(best[0]);
}

// ---------- Saída ----------
const out = {
  S, unit: +UNIT.toFixed(4), Y0, cols: COLS, rows: ROWS,
  countries: countries.map((c) => ({ a2: c.a2, n: c.n, cap: c.cap })),
  provinces: provinces.map((p, i) => ({ c: p.ci, n: p.name, x: +p.x.toFixed(2), y: +p.y.toFixed(2), cap: p.cap ? 1 : 0, adj: [...adj[i]], sea: [...sea[i]] })),
  hexes: hexes.flatMap((h) => [h.c, h.r, h.p]),
};
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'data.js');
writeFileSync(file, '// Gerado por tools/build-map.mjs — não editar à mão.\nwindow.MAPA=' + JSON.stringify(out) + ';\n');
console.log(`países ${countries.length}, províncias ${provinces.length}, quadrados ${hexes.length}, grelha ${COLS}x${ROWS}`);
const big = countries.map((c) => [c.n, provsOf(c.i).length]).sort((a, b) => b[1] - a[1]).slice(0, 12);
console.log(big.map((x) => x.join(':')).join('  '));
