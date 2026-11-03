/* Mundo da carreira: pilotos, equipas, campeonatos de todas as categorias, mercado, contratos, patrocinadores,
   desenvolvimento, rivalidades e notícias. Só regras e simulação; os ecrãs estão no ui.js. */
'use strict';

const CAREER = (() => {
  const ORDER = ['kart', 'f4', 'f3', 'f2', 'f1'];
  const AGE_MIN = { kart: 10, f4: 15, f3: 16, f2: 17, f1: 18 };
  const AGE_RANGE = { kart: [12, 16], f4: [15, 18], f3: [16, 21], f2: [18, 24], f1: [20, 36] };
  const RATING = { kart: [30, 66], f4: [40, 70], f3: [50, 78], f2: [56, 85], f1: [64, 95] };
  const KART_FIELD = 15;
  // pontuação oficial de cada campeonato e formato do fim de semana
  const FORMAT = {
    kart: { sprint: { n: 'Pré-final', pts: [], laps: 0.5, rev: 0 }, main: { n: 'Final', pts: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] }, pole: 0, fl: 0 },
    f4: { sprint: { n: 'Corrida 1', pts: [15, 12, 10, 8, 6, 5, 4, 3, 2, 1], laps: 0.6, rev: 8 }, main: { n: 'Corrida 2', pts: POINTS }, pole: 0, fl: 1 },
    f3: { sprint: { n: 'Corrida sprint', pts: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], laps: 0.6, rev: 12 }, main: { n: 'Corrida principal', pts: POINTS }, pole: 2, fl: 1 },
    f2: { sprint: { n: 'Corrida sprint', pts: [10, 8, 6, 5, 4, 3, 2, 1], laps: 0.6, rev: 10 }, main: { n: 'Corrida principal', pts: POINTS }, pole: 2, fl: 1 },
    f1: { sprint: { n: 'Sprint', pts: [8, 7, 6, 5, 4, 3, 2, 1], laps: 0.33, rev: 0, only: ['Xangai', 'Miami', 'Gilles Villeneuve (Montreal)', 'Silverstone', 'Zandvoort', 'Marina Bay (Singapura)'] }, main: { n: 'Grande Prémio', pts: POINTS }, pole: 0, fl: 0 },
  };
  const hasSprint = (cat, track) => { const f = FORMAT[cat].sprint; return !!f && (!f.only || f.only.includes(track)); };
  // pontos da superlicença (F1): posição final no campeonato
  const SUPER = { f2: [40, 40, 40, 30, 20, 10, 8, 6, 4, 3], f3: [30, 25, 20, 15, 12, 9, 7, 5, 3, 2], f4: [12, 10, 7, 5, 3, 2, 1], kart: [] };
  // peças por categoria: efeitos por nível (power, grip, aero, brake, rel = fiabilidade)
  const PARTS = {
    f4: [['motor', 'Motor', '⚙️', { power: 0.006, rel: -0.002 }], ['aero', 'Aerodinâmica', '🪽', { aero: 0.008, power: -0.0015 }], ['susp', 'Suspensão', '🔩', { grip: 0.004 }], ['travoes', 'Travões', '🛑', { brake: 0.02 }], ['afin', 'Afinações', '🎛️', { grip: 0.002, power: 0.002 }]],
    f1: [['pu', 'Unidade de potência', '⚡', { power: 0.006, rel: -0.003 }], ['fw', 'Asa dianteira', '🪽', { grip: 0.003, aero: 0.003 }], ['rw', 'Asa traseira', '🛫', { aero: 0.006, power: -0.002 }],
      ['floor', 'Fundo do carro', '🟫', { aero: 0.007 }], ['susp', 'Suspensão', '🔩', { grip: 0.004 }], ['cool', 'Arrefecimento', '❄️', { rel: 0.008, power: 0.001 }], ['aero', 'Aerodinâmica', '🌬️', { aero: 0.004, grip: 0.002 }]],
  };
  PARTS.f3 = PARTS.f4; PARTS.f2 = PARTS.f4;
  const partsOf = (cat) => (cat === 'kart' ? null : PARTS[cat]);
  const PART_COST = { f4: 900, f3: 2200, f2: 5200, f1: 15000 };
  // patrocinadores possíveis: nome, cor, reputação mínima, valor base por corrida
  const SPONSOR_POOL = [
    ['Café Pista', '#6b3e26', 0, 60], ['Moto Peças Lda', '#c8102e', 0, 80], ['Rádio Turbo', '#ff8000', 5, 110], ['Rio Verde Café', '#1a8a4a', 10, 150], ['Kappa Telecom', '#6a0dad', 18, 260],
    ['Atlas Seguros', '#0b1f4b', 25, 420], ['Sol & Mar', '#f0b323', 30, 600], ['Nimbus Energy', '#1e5bc6', 38, 1000], ['Pixel Games', '#ff8000', 45, 1500], ['Zeta Bank', '#00a19b', 55, 2600],
    ['Lusoil', '#e10600', 62, 4200], ['Vortex Drinks', '#d4145a', 70, 6500], ['Orion Watches', '#2b2b2b', 80, 10000], ['Helios Aviation', '#d4a017', 88, 15000]];

  const rnd = Math.random;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const catIdx = (c) => ORDER.indexOf(c);
  const nextOf = (c) => ORDER[catIdx(c) + 1] || null;
  const prevOf = (c) => ORDER[catIdx(c) - 1] || null;
  // capacidade (0-100) para ritmo em pista
  const skillOf = (rating) => 0.93 + rating * 0.00073;

  // ---------- logótipos (SVG) ----------
  function logo(name, c1, c2, shape = 0, size = 40) {
    const ini = name.replace(/[^A-Za-zÀ-ú ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const shapes = [
      `<path d="M20 2 L37 9 L34 28 L20 38 L6 28 L3 9 Z" fill="${c1}" stroke="${c2}" stroke-width="2.5"/>`,
      `<circle cx="20" cy="20" r="17" fill="${c1}" stroke="${c2}" stroke-width="3"/>`,
      `<path d="M20 2 L36 11 L36 29 L20 38 L4 29 L4 11 Z" fill="${c1}" stroke="${c2}" stroke-width="2.5"/>`,
      `<path d="M2 26 Q12 6 38 8 Q30 18 34 30 Q18 26 2 26 Z" fill="${c1}" stroke="${c2}" stroke-width="2.5"/>`,
      `<rect x="4" y="4" width="32" height="32" rx="7" transform="rotate(45 20 20)" fill="${c1}" stroke="${c2}" stroke-width="2.5"/>`,
    ];
    return `<svg class="tlogo" viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true">${shapes[shape % shapes.length]}<text x="20" y="25" text-anchor="middle" font-family="Saira Condensed,Arial Narrow,sans-serif" font-weight="800" font-style="italic" font-size="${ini.length > 1 ? 13 : 16}" fill="${c2}">${ini}</text></svg>`;
  }

  // ---------- criação do mundo ----------
  let idN = 0;
  function newDriver(W, cat, opts = {}) {
    const ar = AGE_RANGE[cat], rr = RATING[cat], age = opts.age ?? ar[0] + Math.floor(rnd() * (ar[1] - ar[0] + 1));
    const rating = opts.rating ?? clamp(rr[0] + (rr[1] - rr[0]) * Math.pow(rnd(), 1.3), 20, 97);
    const talent = clamp(rating + 4 + rnd() * (cat === 'kart' ? 38 : cat === 'f4' ? 30 : 20) * (age < 20 ? 1 : 0.4), rating, 99);
    let first, last, tries = 0; do { first = pick(FIRST); last = pick(LAST); tries++; } while (tries < 20 && Object.values(W.drivers).some((x) => !x.retired && x.first === first && x.last === last));
    const pat = pick(HELMET_PATTERNS).k;
    const d = { id: 'w' + W.year + '_' + (idN++) + '_' + Math.floor(rnd() * 1e5), first, last, code: last.replace(/[^A-Za-zÀ-ú]/g, '').slice(0, 3).toUpperCase(), nat: pick(COUNTRIES)[0],
      born: W.year - age, rating, talent, wet: clamp(50 + gauss() * 15, 15, 95), cons: clamp(0.55 + gauss() * 0.15, 0.2, 0.95), cat, team: null, until: 0, salary: 0, num: 0,
      helmet: { c1: pick(HELMET_COLORS), c2: pick(HELMET_COLORS), c3: pick(HELMET_COLORS), pattern: pat === 'bandeira' ? 'faixa' : pat }, kc1: pick(HELMET_COLORS), kc2: pick(HELMET_COLORS),
      st: { races: 0, wins: 0, pods: 0, poles: 0, fl: 0, pts: 0, titles: 0, dnf: 0 }, by: {}, teams: [] };
    W.drivers[d.id] = d; return d;
  }
  function newTeams(cat) {
    return TEAMS[cat].map((t, i) => {
      const budget = clamp(5 - Math.floor(i / 2) + (rnd() < 0.25 ? (rnd() < 0.5 ? -1 : 1) : 0), 1, 5);
      return { name: t[0], c1: t[1], c2: t[2], perf: t[3], budget, rel: clamp(0.94 + budget * 0.009 + (rnd() - 0.5) * 0.02, 0.9, 0.995), dev: clamp(0.5 + budget * 0.1 + (rnd() - 0.5) * 0.3, 0.3, 1.2), shape: i % 5, pts: 0, hist: [] };
    });
  }
  function teamGoal(rank) { return rank <= 1 ? { k: 'title', v: 1, txt: 'Ganhar o campeonato' } : rank <= 3 ? { k: 'pos', v: 3, txt: 'Acabar no top 3 de equipas' } : rank <= 6 ? { k: 'pos', v: 6, txt: 'Acabar no top 6 de equipas' } : { k: 'pos', v: 9, txt: 'Sair dos últimos lugares' }; }
  function createWorld(year, playerNum) {
    const W = { v: 1, year, drivers: {}, teams: {}, sims: {}, champions: { kart: [], f4: [], f3: [], f2: [], f1: [] }, news: [], retired: [], reg: 0 };
    for (const cat of ORDER) {
      if (cat !== 'kart') { W.teams[cat] = newTeams(cat); W.teams[cat].forEach((t, i) => (t.goal = teamGoal(i))); }
      const n = cat === 'kart' ? KART_FIELD : 20;
      const list = Array.from({ length: n }, () => newDriver(W, cat)).sort((a, b) => b.rating - a.rating);
      if (cat !== 'kart') list.forEach((d, k) => { d.team = clamp(Math.floor((k + (rnd() - 0.5) * 4) / 2), 0, 9); });
      if (cat !== 'kart') { const cnt = Array(10).fill(0); for (const d of list) { while (cnt[d.team] >= 2) d.team = (d.team + 1) % 10; cnt[d.team]++; } }
      for (const d of list) { d.until = year + 1 + Math.floor(rnd() * 2); d.salary = Math.round(catById(cat).salary * (0.5 + d.rating / 100)); d.teams = d.team != null ? [W.teams[cat][d.team].name] : []; }
      numberField(W, cat, playerNum);
    }
    syncTeams(W);
    return W;
  }
  function numberField(W, cat, playerNum) {
    const used = new Set([playerNum]);
    for (const d of driversIn(W, cat)) { if (!d.num || used.has(d.num)) { let n; do n = 2 + Math.floor(rnd() * 98); while (used.has(n)); d.num = n; } used.add(d.num); }
  }
  const driversIn = (W, cat) => Object.values(W.drivers).filter((d) => d.cat === cat && !d.retired);
  // o resto do jogo usa TEAMS[cat] = [nome, cor1, cor2, competitividade]
  function syncTeams(W) { for (const cat of Object.keys(W.teams)) TEAMS[cat] = W.teams[cat].map((t) => [t.name, t.c1, t.c2, t.perf]); }

  // ---------- jogador ----------
  function playerRating(S) { const a = S.attr; return 0.3 * a.ritmo + 0.15 * a.consist + 0.12 * a.chuva + 0.15 * a.ultrap + 0.13 * a.fisico + 0.15 * a.tecnica; }
  const ageOf = (S, year) => (year ?? S.world.year) - S.profile.born;
  function superPoints(S) { const y = S.world.year; return (S.history || []).filter((h) => h.year >= y - 3).reduce((a, h) => a + ((SUPER[h.cat] || [])[h.pos - 1] || 0), 0); }
  function addRep(S, v, why) { S.rep = clamp((S.rep || 0) + v, 0, 100); if (why && Math.abs(v) >= 3) note(S, why); }
  function note(S, txt) { (S.log || (S.log = [])).unshift({ date: S.today, txt }); S.log.length = Math.min(S.log.length, 40); }

  // ---------- notícias ----------
  function news(S, k, title, body, cat) {
    const N = S.world.news; N.unshift({ date: S.today || S.world.year + '-01-01', k, title, body, cat: cat || S.cat }); if (N.length > 120) N.length = 120;
  }

  // ---------- desempenho e simulação de corridas ----------
  function carPerfAI(W, cat, d) { if (cat === 'kart') return 1; const t = W.teams[cat][d.team]; return t ? t.perf : 0.985; }
  function relOf(W, cat, d) { if (cat === 'kart') return 0.985; const t = W.teams[cat][d.team]; return t ? t.rel : 0.95; }
  // simula uma corrida: lista [{id, rating, wet(0-100), cons, perf, rel, grid}] -> ordem com desistências
  function simRace(list, wetness, gridWeight = 0.0006) {
    const out = list.map((e) => {
      const sk = skillOf(e.rating) + (wetness > 0.3 ? (e.wet - 50) * 0.00008 * wetness : 0);
      const sd = 0.006 * (1.3 - e.cons) + wetness * 0.004;
      const pace = e.perf * sk * (e.mul || 1) * (1 + gauss() * sd) - (e.grid != null ? e.grid * gridWeight : 0);
      const mech = rnd() < (1 - e.rel) * 0.85, crash = rnd() < 0.012 + wetness * 0.03 + (1 - e.cons) * 0.02;
      return { ...e, pace, dnf: mech ? 'mec' : crash ? 'acid' : null };
    });
    return out.sort((a, b) => (a.dnf ? 1 : 0) - (b.dnf ? 1 : 0) || b.pace - a.pace);
  }
  function simQualiOrder(list, wetness) { return list.map((e) => ({ ...e, q: e.perf * (skillOf(e.rating) + (wetness > 0.3 ? (e.wet - 50) * 0.00008 : 0)) * (e.mul || 1) * (1 + gauss() * 0.0025) })).sort((a, b) => b.q - a.q); }
  // simulação das categorias onde o jogador não está
  function ensureSims(S) {
    const W = S.world;
    for (const cat of ORDER) {
      if (cat === S.cat) continue;
      if (!W.sims[cat] || W.sims[cat].year !== W.year) W.sims[cat] = { year: W.year, round: 0, rounds: seasonPick(cat, 'curta').length, points: {}, wins: {}, pods: {}, tpts: {}, last: null, tracks: seasonPick(cat, 'curta').map((t) => t[0]) };
    }
  }
  function simCatRound(S, cat) {
    const W = S.world, sim = W.sims[cat]; if (!sim || sim.round >= sim.rounds) return;
    const ds = driversIn(W, cat), wet = rnd() < 0.2 ? 0.6 : 0, F = FORMAT[cat];
    const base = ds.map((d) => ({ id: d.id, rating: d.rating, wet: d.wet, cons: d.cons, perf: carPerfAI(W, cat, d), rel: relOf(W, cat, d), team: d.team }));
    const q = simQualiOrder(base, wet); q.forEach((e, k) => (e.grid = k));
    const award = (order, pts) => order.forEach((e, k) => { const p = e.dnf ? 0 : pts[k] || 0; sim.points[e.id] = (sim.points[e.id] || 0) + p; if (e.team != null) sim.tpts[e.team] = (sim.tpts[e.team] || 0) + p; });
    if (hasSprint(cat, sim.tracks[sim.round])) { const sp = simRace(q.map((e, k) => ({ ...e, grid: F.sprint.rev && k < F.sprint.rev ? F.sprint.rev - 1 - k : k })), wet); award(sp, F.sprint.pts); }
    const race = simRace(q, wet); award(race, F.main.pts);
    if (F.pole) { const p = q[0]; sim.points[p.id] = (sim.points[p.id] || 0) + F.pole; }
    race.forEach((e, k) => { const d = W.drivers[e.id]; recordDriver(d, cat, k + 1, !!e.dnf, q[0].id === e.id, false, e.dnf ? 0 : F.main.pts[k] || 0); if (k === 0 && !e.dnf) sim.wins[e.id] = (sim.wins[e.id] || 0) + 1; if (k < 3 && !e.dnf) sim.pods[e.id] = (sim.pods[e.id] || 0) + 1; });
    sim.round++; sim.last = { track: sim.tracks[sim.round - 1], win: race[0].id };
    // resultado surpreendente: equipa pequena no pódio
    if (cat !== 'kart') { const surprise = race.slice(0, 3).find((e) => !e.dnf && e.team >= 7); if (surprise && rnd() < 0.6) { const d = W.drivers[surprise.id]; news(S, 'surpresa', `Surpresa na ${catById(cat).n}: ${d.first} ${d.last} no pódio`, `A ${W.teams[cat][d.team].name}, uma das equipas mais pequenas, levou ${d.last} ao pódio em ${sim.last.track}.`, cat); } }
    if (cat === 'f1' || (cat === nextOf(S.cat))) { const d = W.drivers[race[0].id]; news(S, 'resultado', `${catById(cat).n}: ${d.first} ${d.last} vence em ${sim.last.track}`, `${d.last}${d.team != null ? ` (${W.teams[cat][d.team].name})` : ''} venceu a ronda ${sim.round}. ${leaderTxt(W, cat, sim)}`, cat); }
  }
  function leaderTxt(W, cat, sim) { const top = Object.entries(sim.points).sort((a, b) => b[1] - a[1])[0]; if (!top) return ''; const d = W.drivers[top[0]]; return d ? `Lidera o campeonato ${d.last}, com ${top[1]} pontos.` : ''; }
  // avança as outras categorias até à mesma fração da época que a do jogador
  function syncOtherCats(S, frac) { ensureSims(S); for (const cat of ORDER) { if (cat === S.cat) continue; const sim = S.world.sims[cat]; while (sim.round < Math.floor(frac * sim.rounds + 1e-6)) simCatRound(S, cat); } }
  function recordDriver(d, cat, pos, dnf, pole, fl, pts) {
    if (!d) return; const b = d.by[cat] || (d.by[cat] = { races: 0, wins: 0, pods: 0, poles: 0, fl: 0, pts: 0, titles: 0, dnf: 0 });
    for (const o of [d.st, b]) { o.races++; if (dnf) o.dnf++; else { if (pos === 1) o.wins++; if (pos <= 3) o.pods++; } if (pole) o.poles++; if (fl) o.fl++; o.pts += pts; }
  }
  // desenvolvimento das equipas durante a época (depois de cada ronda)
  function teamsDevelop(S) {
    const W = S.world;
    for (const cat of Object.keys(W.teams)) for (const t of W.teams[cat]) { const g = (0.00022 + t.budget * 0.00012) * t.dev * (0.4 + rnd() * 1.2); t.perf = clamp(t.perf + g - 0.00018, 0.975, 1.03); }
    syncTeams(W);
  }

  // ---------- rivalidades ----------
  function updateRivals(S, res) {
    const R0 = S.rivals || (S.rivals = {}), me = res.find((r) => r.id === 'me'); if (!me) return;
    for (const r of res) {
      if (r.id === 'me') continue; const d = S.world.drivers[r.id]; if (!d) continue;
      const rv = R0[r.id] || { heat: 0, k: 'posicoes', h2h: [0, 0], since: S.world.year };
      if (Math.abs(r.pos - me.pos) <= 1 && !r.out && !me.out) rv.heat += 7;
      if (d.team != null && d.team === S.team && S.cat !== 'kart') { rv.k = 'colega'; rv.heat += 3; }
      if (r.pos < me.pos) rv.h2h[1]++; else rv.h2h[0]++;
      rv.heat = clamp(rv.heat - 1.5, 0, 100);
      if (rv.heat > 0 || rv.k === 'colega') R0[r.id] = rv; else delete R0[r.id];
    }
    // rival direto: quem está mais perto no campeonato; jovem talento: mais novo, muito talentoso, a bater-te
    const tbl = Object.entries(S.points).sort((a, b) => b[1] - a[1]), mi = tbl.findIndex((x) => x[0] === 'me');
    const near = tbl[mi - 1] || tbl[mi + 1];
    if (near && R0[near[0]] !== undefined && R0[near[0]].k !== 'colega') { R0[near[0]].k = 'campeonato'; R0[near[0]].heat = Math.min(100, R0[near[0]].heat + 4); }
    else if (near && S.world.drivers[near[0]]) R0[near[0]] = { heat: 10, k: 'campeonato', h2h: [0, 0], since: S.world.year };
    for (const [id, rv] of Object.entries(R0)) { const d = S.world.drivers[id]; if (d && d.born > S.profile.born && d.talent > 85 && rv.h2h[1] > rv.h2h[0] && rv.k === 'posicoes') rv.k = 'jovem'; }
    // a rivalidade mais quente dá notícia de vez em quando
    const hot = Object.entries(R0).sort((a, b) => b[1].heat - a[1].heat)[0];
    if (hot && hot[1].heat > 55 && rnd() < 0.25) { const d = S.world.drivers[hot[0]]; news(S, 'rival', `Rivalidade ao rubro: ${S.profile.last} contra ${d.last}`, `${rivalTxt(hot[1].k)} ${d.first} ${d.last} e ${S.profile.first} ${S.profile.last} voltaram a lutar pelas mesmas posições. Frente a frente: ${hot[1].h2h[0]}-${hot[1].h2h[1]}.`); }
  }
  const rivalTxt = (k) => ({ campeonato: 'Na luta pelo campeonato,', colega: 'Dentro da mesma equipa,', jovem: 'O jovem talento não dá tréguas:', posicoes: 'Corrida após corrida,' }[k] || '');
  const rivalName = (k) => ({ campeonato: 'Rival no campeonato', colega: 'Colega de equipa', jovem: 'Jovem talento', posicoes: 'Luta pelas mesmas posições' }[k]);

  // ---------- patrocinadores ----------
  function sponsorOffers(S, n = 3) {
    const have = new Set((S.sponsors || []).map((s) => s.name)), rep = S.rep || 0, C = catById(S.cat), lvl = [0.25, 0.6, 1, 1.6, 3][catIdx(S.cat)];
    return SPONSOR_POOL.filter((p) => p[2] <= rep && !have.has(p[0])).sort(() => rnd() - 0.5).slice(0, n).map(([name, c, minRep, val]) => ({
      name, c, minRep, perRace: Math.round(val * lvl * (0.8 + rnd() * 0.4)), years: 1 + Math.floor(rnd() * 3), sign: Math.round(val * lvl * 2), winBonus: Math.round(val * lvl * 3), podBonus: Math.round(val * lvl * 1.2), shape: Math.floor(rnd() * 5), goalPay: Math.round(C.prize * (0.4 + rnd() * 0.5)) }));
  }
  function signSponsor(S, o) { S.sponsors = S.sponsors || []; if (S.sponsors.length >= 3) return; S.sponsors.push({ ...o, until: S.world.year + o.years - 1, happy: 60 }); S.money += o.sign; S.sponsor = { name: S.sponsors[0].name, c: S.sponsors[0].c }; note(S, `Assinaste com ${o.name}.`); }
  function sponsorsAfterRace(S, pos, dnf) {
    let total = 0; const lines = [];
    for (const sp of S.sponsors || []) { let v = sp.perRace; if (!dnf && pos === 1) v += sp.winBonus; else if (!dnf && pos <= 3) v += sp.podBonus; sp.happy = clamp(sp.happy + (dnf ? -6 : pos <= 3 ? 6 : pos <= 10 ? 1 : -2), 0, 100); total += v; lines.push([sp.name, v]); }
    S.money += total; return { total, lines };
  }
  function sponsorsSeasonEnd(S) {
    const keep = [];
    for (const sp of S.sponsors || []) {
      if (S.rep < sp.minRep - 15 || sp.happy < 25) news(S, 'patrocinio', `${sp.name} deixa de patrocinar ${S.profile.last}`, `O patrocinador saiu: ${sp.happy < 25 ? 'os resultados não convenceram' : 'a reputação do piloto caiu demasiado'}.`);
      else if (sp.until <= S.world.year) note(S, `O contrato com ${sp.name} terminou.`);
      else keep.push(sp);
    }
    S.sponsors = keep; S.sponsor = keep[0] ? { name: keep[0].name, c: keep[0].c } : null;
  }

  // ---------- desenvolvimento do carro do jogador ----------
  function partEffects(S) {
    const out = { power: 1, grip: 1, aero: 1, brake: 1, rel: 0 }, P = partsOf(S.cat); if (!P) return out;
    for (const [k, , , eff] of P) { const lv = (S.car && S.car[k]) || 0; for (const [e, v] of Object.entries(eff)) { if (e === 'rel') out.rel += v * lv; else out[e] *= 1 + v * lv; } }
    return out;
  }
  const partCost = (S, k) => { const lv = (S.car && S.car[k]) || 0; return Math.round(PART_COST[S.cat] * (1 + lv * 0.7) * (k === 'pu' || k === 'floor' ? 1.4 : 1)); };
  // pontos de desenvolvimento que a equipa dá em cada dia de oficina (conforme o orçamento)
  const devPoints = (S) => { const t = S.world.teams[S.cat] && S.world.teams[S.cat][S.team]; return t ? (t.budget >= 4 ? 2 : 1) + (S.attr.tecnica > 70 ? 1 : 0) : 0; };
  function playerReliability(S) { if (S.cat === 'kart') return 0.985 + 0.002 * ((S.kart && S.kart.motor) ? 0 : 0); const t = S.world.teams[S.cat][S.team]; return clamp((t ? t.rel : 0.95) + partEffects(S).rel, 0.85, 0.997); }

  // ---------- contratos e propostas ----------
  function teamRank(W, cat, i) { return W.teams[cat].map((t, k) => [k, t.perf]).sort((a, b) => b[1] - a[1]).findIndex((x) => x[0] === i); }
  function playerValue(S) {
    const tbl = Object.entries(S.points).sort((a, b) => b[1] - a[1]), n = tbl.length;
    let pos = tbl.findIndex((x) => x[0] === 'me') + 1;
    if (!tbl.some((x) => x[1] > 0)) { const h = (S.history || []).slice(-1)[0]; pos = h ? Math.round(clamp(h.pos + (catIdx(h.cat) < catIdx(S.cat) ? n * 0.4 : 0), 1, n)) : Math.round(n * 0.6); } // início da época: conta a época anterior
    const w = S.wins.me || 0, lvl = catIdx(S.cat);
    return { pos, n, score: 60 * Math.pow(1 - (pos - 1) / Math.max(1, n - 1), 1.6) + (S.rep || 0) * 0.3 + Math.min(w, 8) * 2.5 + (playerRating(S) - RATING[S.cat][0]) * 0.35 + (pos === 1 ? 10 : 0), lvl };
  }
  function makeOffer(S, cat, i, interest, opts = {}) {
    const W = S.world, t = W.teams[cat][i], C = catById(cat), rank = teamRank(W, cat, i);
    const salary = opts.paid ? 0 : Math.round(C.salary * (0.4 + clamp(interest, 0, 40) / 40) * (0.7 + t.budget * 0.12));
    const g = rank <= 1 ? { k: 'champ', v: 3, txt: 'Acabar no top 3 do campeonato' } : rank <= 4 ? { k: 'champ', v: 6, txt: 'Acabar no top 6 do campeonato' } : rank <= 7 ? { k: 'champ', v: 10, txt: 'Acabar no top 10 do campeonato' } : { k: 'mate', v: 0, txt: 'Acabar à frente do colega de equipa' };
    return { cat, team: i, name: t.name, rank, years: opts.years || (ageOf(S) < 21 && rank <= 4 ? 2 + Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 2)), salary, winBonus: Math.round(C.salary * 2.5), podBonus: Math.round(C.salary * 0.9), goal: g, maxMul: 1 + clamp(interest, 0, 30) / 60, paid: opts.paid ? Math.round(C.salary * 9 * (1.4 - t.budget * 0.08)) : 0, transfer: !!opts.transfer, tries: 0 };
  }
  // propostas no fim da época, conforme resultados, reputação, idade e superlicença
  function seasonOffers(S) {
    const W = S.world, v = playerValue(S), out = [], age = ageOf(S, W.year + 1), nx = nextOf(S.cat);
    const demand = (rank) => 72 - rank * 5.5;
    const tryCat = (cat, bonus, transfer) => {
      if (!cat || cat === 'kart') return;
      if (age < AGE_MIN[cat]) return;
      if (cat === 'f1' && superPoints(S) < 40) return;
      W.teams[cat].forEach((t, i) => { if (cat === S.cat && i === S.team) return; const interest = v.score + bonus - demand(teamRank(W, cat, i)) + (rnd() - 0.5) * 8; if (interest > 0) out.push(makeOffer(S, cat, i, interest, { transfer })); });
    };
    tryCat(nx, nx === 'f4' ? -15 : -20, false);
    if (S.cat !== 'kart') tryCat(S.cat, 0, true);
    // equipas pequenas aceitam um piloto que traga dinheiro (lugar pago)
    if (nx && nx !== 'kart' && age >= AGE_MIN[nx] && !(nx === 'f1' && superPoints(S) < 40) && v.pos <= Math.max(3, v.n * 0.5)) {
      const small = W.teams[nx].map((t, i) => i).filter((i) => teamRank(W, nx, i) >= 6 && !out.some((o) => o.cat === nx && o.team === i));
      if (small.length) out.push(makeOffer(S, nx, small[Math.floor(rnd() * small.length)], 0, { paid: true, years: 1 }));
    }
    // sem nada: uma equipa da categoria de baixo
    const pv = prevOf(S.cat);
    if (!out.length && pv && pv !== 'kart') out.push(makeOffer(S, pv, W.teams[pv].map((t, i) => i).sort((a, b) => teamRank(W, pv, b) - teamRank(W, pv, a))[Math.floor(rnd() * 3)], 10));
    return out.sort((a, b) => catIdx(b.cat) - catIdx(a.cat) || a.rank - b.rank).slice(0, 5);
  }
  // negociação: pedir mais salário ou outra duração; a equipa aceita até ao seu limite
  function negotiate(o, mul, years) {
    o.tries++;
    const okSal = mul <= o.maxMul + 0.001, okYears = years === o.years || Math.abs(years - o.years) <= 1;
    if (okSal && okYears) { o.salary = Math.round(o.salary * mul); o.years = years; o.agreed = true; return { ok: true, txt: 'Acordo fechado! A equipa aceitou os teus termos.' }; }
    if (o.tries >= 2 || rnd() < 0.3) { o.withdrawn = true; return { ok: false, txt: 'A equipa não gostou da exigência e retirou a proposta.' }; }
    o.maxMul = Math.max(1, o.maxMul - 0.05);
    return { ok: false, txt: okSal ? `A equipa só quer um contrato de ${o.years} época${o.years > 1 ? 's' : ''}.` : 'Pedes demasiado. A equipa não vai tão longe, mas a proposta continua de pé.' };
  }
  function contractGoalMet(S) {
    const c = S.contract; if (!c || !c.goal) return null;
    const v = playerValue(S);
    if (c.goal.k === 'champ') return v.pos <= c.goal.v;
    if (c.goal.k === 'mate') { const mate = Object.keys(S.points).find((id) => id !== 'me' && S.world.drivers[id] && S.world.drivers[id].team === S.team); return !mate || S.points.me >= S.points[mate]; }
    return null;
  }

  // ---------- fim de época: mercado, evolução, promoções, reformas ----------
  function closeSeason(S) {
    const W = S.world; ensureSims(S);
    for (const cat of ORDER) if (cat !== S.cat) while (W.sims[cat].round < W.sims[cat].rounds) simCatRound(S, cat);
    // campeões e classificação de equipas
    for (const cat of ORDER) {
      const pts = cat === S.cat ? S.points : W.sims[cat].points, tbl = Object.entries(pts).sort((a, b) => b[1] - a[1]);
      const champ = tbl[0]; if (!champ) continue;
      const isMe = champ[0] === 'me', d = isMe ? null : W.drivers[champ[0]];
      W.champions[cat].push({ year: W.year, id: champ[0], name: isMe ? S.profile.first + ' ' + S.profile.last : d.first + ' ' + d.last, nat: isMe ? S.profile.nat : d.nat, team: cat === 'kart' ? null : (isMe ? W.teams[cat][S.team] : W.teams[cat][d.team] || {}).name, pts: champ[1], me: isMe });
      if (d) { d.st.titles++; (d.by[cat] || (d.by[cat] = { races: 0, wins: 0, pods: 0, poles: 0, fl: 0, pts: 0, titles: 0, dnf: 0 })).titles++; }
      news(S, 'campeao', `${isMe ? S.profile.first + ' ' + S.profile.last : d.first + ' ' + d.last} é campeão de ${catById(cat).n} ${W.year}`, `Conquistou o título com ${champ[1]} pontos.`, cat);
      tbl.forEach(([id], k) => { const dd = W.drivers[id]; if (dd) dd.lastPos = k + 1; });
      if (W.teams[cat]) {
        const tp = cat === S.cat ? teamPoints(S) : W.sims[cat].tpts, order = W.teams[cat].map((t, i) => [i, tp[i] || 0]).sort((a, b) => b[1] - a[1]);
        order.forEach(([i, p], k) => { const t = W.teams[cat][i]; t.hist.push({ year: W.year, pos: k + 1, pts: p }); t.lastPos = k + 1; const met = t.goal && (t.goal.k === 'title' ? k === 0 : k + 1 <= t.goal.v); t.budget = clamp(t.budget + (met ? (rnd() < 0.4 ? 1 : 0) : rnd() < 0.35 ? -1 : 0) + (k === 0 ? 1 : 0), 1, 5); });
      }
    }
  }
  function teamPoints(S) { const tp = {}; for (const [id, p] of Object.entries(S.points)) { const t = id === 'me' ? S.team : S.world.drivers[id] && S.world.drivers[id].team; if (t != null) tp[t] = (tp[t] || 0) + p; } return tp; }
  // muda de época: o jogador escolheu o seu lugar (cat, team) ou ficou sem lugar (cat=null)
  function advanceYear(S, seat) {
    const W = S.world, year = W.year + 1;
    // evolução dos pilotos: os novos aproximam-se do talento; a partir dos 32 começam a perder
    for (const d of Object.values(W.drivers)) {
      if (d.retired) continue; const age = year - d.born;
      const grow = age < 24 ? (d.talent - d.rating) * (0.18 + rnd() * 0.17) : age < 31 ? (d.talent - d.rating) * 0.08 : -(age - 30) * (0.4 + rnd() * 0.6);
      d.rating = clamp(d.rating + grow + gauss() * 1.2, 20, 99); d.cons = clamp(d.cons + (age < 28 ? 0.015 : 0) + gauss() * 0.01, 0.2, 0.97);
    }
    // equipas: regressão à média, orçamento, mudança de regulamento de 4 em 4 anos
    W.reg = (W.reg || 0) + 1; const regChange = W.reg % 4 === 0;
    for (const cat of Object.keys(W.teams)) for (const t of W.teams[cat]) t.perf = clamp(1 + (t.perf - 1) * (regChange ? 0.35 : 0.75) + (t.budget - 3) * 0.0022 + gauss() * (regChange ? 0.006 : 0.0025), 0.978, 1.025);
    if (regChange) news(S, 'regras', 'Novo regulamento técnico em todas as categorias', 'As regras mudam para a nova época: as equipas com mais orçamento e melhor desenvolvimento podem ganhar vantagem, mas a hierarquia pode baralhar-se.', 'f1');
    // reformas
    for (const d of Object.values(W.drivers)) {
      if (d.retired) continue; const age = year - d.born;
      const quit = (d.cat === 'f1' && age > 34 + rnd() * 5) || (d.cat && d.cat !== 'f1' && d.cat !== 'kart' && age > 26 && d.rating < RATING[d.cat][1] - 4 && rnd() < 0.5) || (d.free && d.free >= 2) || (!d.cat && age > 30);
      if (quit) { d.retired = true; d.cat = null; d.team = null; W.retired.push(d.id); if (d.st.wins >= 5 || d.st.titles) news(S, 'reforma', `${d.first} ${d.last} retira-se`, `Despede-se com ${d.st.wins} vitórias e ${d.st.titles} título${d.st.titles === 1 ? '' : 's'}.`, 'f1'); }
    }
    // mercado: da F1 para baixo, as melhores equipas escolhem primeiro
    const value = (d, cat) => d.rating + (d.lastPos ? Math.max(0, 12 - d.lastPos) * (catIdx(d.cat) >= catIdx(cat) ? 0.6 : 1.1) : 0) - Math.max(0, year - d.born - 32) * 2 + gauss() * 2;
    for (const cat of ['f1', 'f2', 'f3', 'f4']) {
      const seats = []; W.teams[cat].forEach((t, i) => { seats.push(i, i); });
      if (seat && seat.cat === cat) seats.splice(seats.indexOf(seat.team), 1);
      // quem tem contrato para a nova época fica, se houver lugar na equipa (senão sai o mais fraco)
      const stay = driversIn(W, cat).filter((d) => d.team != null && d.until >= year).sort((a, b) => b.rating - a.rating);
      const kept = new Set();
      for (const d of stay) { const j = seats.indexOf(d.team); if (j >= 0) { seats.splice(j, 1); kept.add(d.id); } else { d.until = 0; if (rnd() < 0.5) news(S, 'mercado', `${d.first} ${d.last} perde o lugar na ${W.teams[cat][d.team].name}`, 'A equipa preferiu outro piloto para a nova época.', cat); } }
      const lower = prevOf(cat);
      const cands = Object.values(W.drivers).filter((d) => !d.retired && !kept.has(d.id) && year - d.born >= AGE_MIN[cat] && (d.cat === cat || d.free || (d.cat === lower && d.lastPos && d.lastPos <= (cat === 'f1' ? 3 : 6)) || (cat === 'f4' && d.cat === 'kart' && d.lastPos && d.lastPos <= 6)));
      cands.sort((a, b) => value(b, cat) - value(a, cat));
      const order = seats.slice().sort((a, b) => W.teams[cat][b].perf - W.teams[cat][a].perf);
      for (const ti of order) {
        const d = cands.shift(); if (!d) break;
        const moved = d.cat !== cat, old = d.cat;
        d.cat = cat; d.team = ti; d.free = 0; d.until = year + Math.floor(rnd() * 3); d.salary = Math.round(catById(cat).salary * (0.5 + d.rating / 100)); d.teams.push(W.teams[cat][ti].name); d.teams = [...new Set(d.teams)];
        if (moved && old && (cat === 'f1' || cat === nextOf(S.cat) || cat === S.cat) && rnd() < 0.7) news(S, 'mercado', `${d.first} ${d.last} sobe à ${catById(cat).n}`, `Vem ${old === 'kart' ? 'do karting' : 'da ' + catById(old).n} e vai correr pela ${W.teams[cat][ti].name}.`, cat);
        else if (!moved && rnd() < 0.15) news(S, 'mercado', `Transferência: ${d.last} muda para a ${W.teams[cat][ti].name}`, `${d.first} ${d.last} assinou por ${d.until - year + 1} época${d.until - year ? 's' : ''}.`, cat);
      }
      // quem ficou de fora fica sem lugar
      for (const d of cands) if (d.cat === cat && !kept.has(d.id)) { d.free = (d.free || 0) + 1; d.team = null; d.cat = null; }
    }
    // karting: sobem os mais velhos, entram miúdos novos
    for (const d of driversIn(W, 'kart')) if (year - d.born > 16) { d.cat = null; d.free = (d.free || 0) + 1; }
    for (const d of Object.values(W.drivers)) if (!d.retired && d.cat === null && d.free) { if (year - d.born <= 16 && !d.everF) d.cat = 'kart'; }
    while (driversIn(W, 'kart').length < KART_FIELD) newDriver(W, 'kart', { age: 12 + Math.floor(rnd() * 3) });
    for (const cat of ['f4', 'f3', 'f2', 'f1']) {
      const cnt = Array(10).fill(0); for (const d of driversIn(W, cat)) if (d.team != null) cnt[d.team]++;
      if (seat && seat.cat === cat) cnt[seat.team]++;
      for (let i = 0; i < 10; i++) while (cnt[i] < 2) { const d = newDriver(W, cat); d.team = i; d.until = year + 1; d.teams = [W.teams[cat][i].name]; cnt[i]++; if (cat !== 'f4' && rnd() < 0.3) news(S, 'talento', `Novo talento na ${catById(cat).n}: ${d.first} ${d.last}`, `Com ${year - d.born} anos, estreia-se pela ${W.teams[cat][i].name}.`, cat); }
    }
    // os pilotos que estão numa fórmula marcam-se para não voltarem ao karting
    for (const d of Object.values(W.drivers)) if (d.cat && d.cat !== 'kart') d.everF = true;
    W.year = year; W.sims = {};
    for (const cat of ORDER) numberField(W, cat, S.profile.num);
    for (const cat of ['f4', 'f3', 'f2', 'f1']) W.teams[cat].forEach((t, i) => (t.goal = teamGoal(teamRank(W, cat, i))));
    // limpar pilotos reformados antigos (fica só o essencial para o Hall of Fame)
    for (const id of W.retired) { const d = W.drivers[id]; if (d && d.st.wins === 0 && d.st.titles === 0 && W.year - (d.born + 40) > 0) delete W.drivers[id]; }
    W.retired = W.retired.filter((id) => W.drivers[id]);
    syncTeams(W);
  }

  // ---------- eventos fora das pistas ----------
  // cada evento: título, texto e escolhas [rótulo, efeitos]
  function dayEvent(S) {
    const W = S.world, r = rnd(), sp = (S.sponsors || [])[0], hot = Object.entries(S.rivals || {}).sort((a, b) => b[1].heat - a[1].heat)[0];
    const rv = hot && W.drivers[hot[0]];
    const pool = [];
    pool.push({ k: 'treino', ic: '🏋️', t: 'Treino físico', x: 'O preparador físico propõe uma sessão. Quanto queres puxar?', ch: [['Leve (recuperar)', { fisico: 0.4 }], ['Intenso', { fisico: 1.2, consist: 0.2, risk: 0.15 }]] });
    pool.push({ k: 'sim', ic: '🖥️', t: 'Simulador', x: 'A equipa tem o simulador livre. Em que queres trabalhar?', ch: [['Volta rápida', { ritmo: 0.8 }], ['Ritmo de corrida', { consist: 0.8 }], ['Pista molhada', { chuva: 0.9 }]] });
    if (S.cat !== 'kart') pool.push({ k: 'eng', ic: '🧑‍🔧', t: 'Reunião com os engenheiros', x: 'Os engenheiros querem saber para onde levar o desenvolvimento.', ch: [['Mais velocidade de ponta', { dev: 'power', tecnica: 0.5 }], ['Mais aderência em curva', { dev: 'grip', tecnica: 0.5 }], ['Mais fiabilidade', { dev: 'rel', tecnica: 0.5 }]] });
    else pool.push({ k: 'mec', ic: '🔧', t: 'Afinar o kart com o mecânico', x: 'O mecânico quer passar a tarde contigo a afinar o kart.', ch: [['Aprender com ele', { tecnica: 1 }], ['Ir treinar em pista', { ritmo: 0.6, money: -40 }]] });
    pool.push({ k: 'entrevista', ic: '🎙️', t: 'Entrevista', x: rv ? `Um jornalista pergunta o que pensas de ${rv.first} ${rv.last}.` : 'Uma revista quer saber quais são os teus objetivos.', ch: [['Responder com humildade', { rep: 0.5, rival: -5 }], ['Mostrar confiança', { rep: 1 }], ['Provocar', { rep: rnd() < 0.5 ? 2 : -2, rival: 15, sponsor: -4 }]] });
    if (sp) pool.push({ k: 'patro', ic: '🤝', t: `Evento da ${sp.name}`, x: `A ${sp.name} convida-te para uma sessão de fotografias com fãs.`, ch: [['Ir ao evento', { sponsor: 10, rep: 0.5, money: Math.round(sp.perRace * 0.3) }], ['Recusar e treinar', { sponsor: -10, ritmo: 0.4 }]] });
    if (S.rep >= 25 && rnd() < 0.3) pool.push({ k: 'especial', ic: '⭐', t: 'Evento especial', x: 'És convidado para uma corrida de exibição num festival de automobilismo.', ch: [['Aceitar', { rep: 3, money: Math.round(catById(S.cat).prize * 0.5), ultrap: 0.5 }], ['Ficar a descansar', { fisico: 0.3 }]] });
    if (S.rep >= 15 && rnd() < 0.35 && (S.sponsors || []).length < 3) { const o = sponsorOffers(S, 1)[0]; if (o) pool.push({ k: 'novopatro', ic: '💼', t: `Proposta da ${o.name}`, x: `A ${o.name} quer patrocinar-te: ${o.perRace}€ por corrida durante ${o.years} época${o.years > 1 ? 's' : ''} e ${o.sign}€ à assinatura.`, offer: o, ch: [['Assinar', { sign: true }], ['Recusar', {}]] }); }
    if (r < 0.2) return pool[Math.floor(rnd() * pool.length)];
    return null;
  }
  function applyChoice(S, ev, eff) {
    const A = S.attr, lines = [];
    const up = (k, v) => { const before = A[k]; A[k] = clamp(A[k] + v * (1 - A[k] / 110), 1, 99); if (A[k] - before > 0.05) lines.push(`${ATTR_N[k]} +${(A[k] - before).toFixed(1)}`); };
    for (const k of Object.keys(ATTR_N)) if (eff[k]) up(k, eff[k]);
    if (eff.risk && rnd() < eff.risk) { A.fisico = clamp(A.fisico - 1.5, 1, 99); lines.push('Pequena lesão: físico −1.5'); }
    if (eff.rep) { addRep(S, eff.rep); lines.push(`Reputação ${eff.rep > 0 ? '+' : ''}${eff.rep}`); }
    if (eff.money) { S.money += eff.money; lines.push(`${eff.money > 0 ? '+' : ''}${eff.money}€`); }
    if (eff.sponsor) for (const sp of S.sponsors || []) sp.happy = clamp(sp.happy + eff.sponsor, 0, 100);
    if (eff.sponsor) lines.push(`Patrocinadores ${eff.sponsor > 0 ? 'mais' : 'menos'} contentes`);
    if (eff.rival) { const hot = Object.entries(S.rivals || {}).sort((a, b) => b[1].heat - a[1].heat)[0]; if (hot) { hot[1].heat = clamp(hot[1].heat + eff.rival, 0, 100); lines.push(eff.rival > 0 ? 'A rivalidade aquece' : 'A rivalidade acalma'); } }
    if (eff.dev) { S.devFocus = eff.dev; S.devBonus = (S.devBonus || 0) + 1; lines.push('Mais 1 ponto de desenvolvimento no próximo dia de oficina'); }
    if (eff.sign && ev.offer) { signSponsor(S, ev.offer); lines.push(`Patrocínio assinado: +${ev.offer.sign}€`); }
    if (ev.k === 'entrevista' && eff.rival > 10) { const hot = Object.entries(S.rivals || {}).sort((a, b) => b[1].heat - a[1].heat)[0]; const d = hot && S.world.drivers[hot[0]]; if (d) news(S, 'declaracao', `${S.profile.last} provoca ${d.last}`, `"Este ano vou ser eu a ficar à frente", disse ${S.profile.first} ${S.profile.last}. ${d.last} ainda não respondeu.`); }
    return lines;
  }
  const ATTR_N = { ritmo: 'Ritmo', consist: 'Consistência', chuva: 'Chuva', ultrap: 'Ultrapassagem', fisico: 'Físico', tecnica: 'Técnica' };
  // conferência de imprensa depois da corrida
  function pressConference(S, pos, dnf) {
    const q = dnf ? 'Desististe hoje. O que aconteceu?' : pos === 1 ? 'Grande vitória! Como te sentes?' : pos <= 3 ? 'Mais um pódio. Dá para lutar pelo título?' : pos <= 10 ? 'Foi uma corrida sólida?' : 'Uma corrida difícil. Culpas o carro?';
    return { k: 'imprensa', ic: '📰', t: 'Conferência de imprensa', x: q, ch: dnf || pos > 10 ? [['Assumir a culpa', { rep: 1, team: 2 }], ['Culpar o carro', { rep: -1, team: -6 }], ['Falar do futuro', { rep: 0 }]] : [['Agradecer à equipa', { rep: 1, team: 3 }], ['Falar só de mim', { rep: 2, team: -3 }], ['Mandar um recado aos rivais', { rep: 2, rival: 10 }]] };
  }

  return { makeOffer, teamGoal, ORDER, AGE_MIN, FORMAT, PARTS, SUPER, ATTR_N, hasSprint, skillOf, logo, createWorld, newDriver, driversIn, syncTeams, playerRating, ageOf, superPoints, addRep, note, news,
    simRace, simQualiOrder, ensureSims, syncOtherCats, recordDriver, teamsDevelop, updateRivals, rivalName, sponsorOffers, signSponsor, sponsorsAfterRace, sponsorsSeasonEnd,
    partsOf, partEffects, partCost, devPoints, playerReliability, teamRank, playerValue, seasonOffers, negotiate, contractGoalMet, closeSeason, advanceYear, teamPoints, dayEvent, applyChoice, pressConference, nextOf, prevOf, catIdx, carPerfAI, relOf };
})();
