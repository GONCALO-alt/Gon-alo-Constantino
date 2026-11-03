/* Carreira, menus, painel de corrida, comandos e rádio. */
'use strict';
(() => {
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const SAVE = 'grelha-partida-v1';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const eur = (n) => '€' + Math.round(n).toLocaleString('pt-PT');
const rndInt = (r, a, b) => a + Math.floor(r() * (b - a + 1));

// ---------- estado ----------
const DEFAULT_SETTINGS = { controls: 'arrows', sens: 1, abs: true, tc: true, line: true, steer: true, cam: 'cockpit', units: 'kmh', diff: 'medio', length: 0, vol: 0.8, voice: true, names: true, gfx: 'media', season: 'curta', formation: true };
let S = null;
function load() { try { S = JSON.parse(localStorage.getItem(SAVE)); } catch (e) { S = null; } if (S) { S.settings = { ...DEFAULT_SETTINGS, ...S.settings }; } }
let REAL = null; // carreira guardada enquanto se joga uma corrida rápida
function save() { if (S && S.quick) return; try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { /* sem armazenamento */ } }
load();
let tmpSettings = S ? S.settings : { ...DEFAULT_SETTINGS };
const ST = () => (S ? S.settings : tmpSettings);

// ---------- capacetes ----------
const flagImgCache = {};
function flagImg(a2) {
  if (flagImgCache[a2]) return flagImgCache[a2];
  const c = document.createElement('canvas'); c.width = 80; c.height = 60; const g = c.getContext('2d');
  g.font = '56px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(flagOf(a2), 40, 33);
  return (flagImgCache[a2] = c);
}
function helmetOf(p) { const h = p.helmet; return { ...h, hi: true, num: p.num, name: p.last, nat: p.nat, flagImg: h.pattern === 'bandeira' || h.showFlag ? flagImg(p.nat) : null, sponsorTxt: h.sponsor ? ((REAL || S) && (REAL || S).sponsor ? (REAL || S).sponsor.name : 'GRELHA') : null }; }
function paintHelmet(canvas, h) {
  const g = canvas.getContext('2d'), w = canvas.width; g.clearRect(0, 0, w, w);
  RENDER.drawHelmet(g, w / 2, w / 2, w * 0.4, h);
}

// ---------- mundo: pilotos, equipas e épocas (regras em career.js) ----------
const ATTR0 = { kart: 38, f4: 50, f3: 58, f2: 64, f1: 72 };
function freshPlayer(profile, year) {
  return { profile: { ...profile, born: profile.born || year - 14 }, attr: { ritmo: 46, consist: 43, chuva: 40, ultrap: 42, fisico: 47, tecnica: 40 }, rep: 3, sponsors: [], car: {}, contracts: [], byCat: {}, rivals: {}, log: [] };
}
// liga um piloto do mundo ao formato usado na corrida
function raceDriver(d) { return { id: d.id, first: d.first, last: d.last, code: d.code, nat: d.nat, num: d.num, skill: CAREER.skillOf(d.rating), rating: d.rating, wet: d.wet, cons: d.cons, helmet: d.helmet, kc1: d.kc1, kc2: d.kc2, team: d.team, born: d.born }; }
// carreiras de versões antigas: cria o mundo à volta do que já existe
function ensureWorld() {
  if (!S || S.world) { if (S && S.world) CAREER.syncTeams(S.world); return; }
  const year = S.year || 2025 + (S.season || 1);
  S.world = CAREER.createWorld(year, S.profile.num);
  Object.assign(S, { attr: null, ...freshPlayer(S.profile, year), money: S.money, history: S.history || [] });
  S.profile.born = year - 14 - Math.max(0, (S.season || 1) - 1);
  const lvl = ATTR0[S.cat] || 40; S.attr = { ritmo: lvl, consist: lvl - 2, chuva: lvl - 4, ultrap: lvl - 2, fisico: lvl + 3, tecnica: lvl - 4 };
  S.rep = clamp(5 + (S.stats.wins || 0) * 3 + (S.stats.titles || 0) * 10 + CAREER.catIdx(S.cat) * 8, 0, 70);
  if (S.sponsor) S.sponsors = [{ ...S.sponsor, minRep: 0, perRace: Math.round(catById(S.cat).prize * 0.2), years: 1, until: year, winBonus: catById(S.cat).prize, podBonus: Math.round(catById(S.cat).prize * 0.4), happy: 60, shape: 1, goalPay: catById(S.cat).prize }];
  // os rivais desta época passam a ser pilotos do mundo (mantém os pontos)
  for (const d of CAREER.driversIn(S.world, S.cat)) delete S.world.drivers[d.id];
  for (const d of S.drivers || []) {
    const r = clamp((d.skill - 0.93) / 0.00073, 25, 97);
    S.world.drivers[d.id] = { id: d.id, first: d.first, last: d.last, code: d.code, nat: d.nat, num: d.num, born: year - (S.cat === 'kart' ? 14 : 19), rating: r, talent: clamp(r + 10, r, 99), wet: 50, cons: 0.6, cat: S.cat, team: d.team ?? null, until: year, salary: 0,
      helmet: d.helmet, kc1: d.kc1, kc2: d.kc2, st: { races: 0, wins: S.wins[d.id] || 0, pods: 0, poles: 0, fl: 0, pts: S.points[d.id] || 0, titles: 0, dnf: 0 }, by: {}, teams: d.team != null ? [TEAMS[S.cat][d.team][0]] : [] };
  }
  if (S.cat !== 'kart' && S.team != null) S.contract = { cat: S.cat, team: S.team, name: TEAMS[S.cat][S.team][0], from: year, until: year, salary: Math.round(catById(S.cat).salary), winBonus: catById(S.cat).salary * 2, podBonus: catById(S.cat).salary, goal: { k: 'champ', v: 10, txt: 'Acabar no top 10 do campeonato' } };
  S.history.forEach((h, k) => { h.year = h.year || year - S.history.length + k; });
  CAREER.ensureSims(S); S.ver = 2;
  save();
}
function newSeason(cat, team) {
  S.cat = cat; S.team = team ?? null; S.round = 0; S.season = (S.season || 0) + 1;
  S.drivers = CAREER.driversIn(S.world, cat).filter((d) => cat === 'kart' || d.team != null).map(raceDriver);
  if (cat !== 'kart' && S.team != null) { const mates = S.drivers.filter((d) => d.team === S.team).sort((a, b) => b.rating - a.rating); for (const d of mates.slice(1)) { S.drivers = S.drivers.filter((x) => x.id !== d.id); const wd = S.world.drivers[d.id]; if (wd) { wd.team = null; wd.cat = null; wd.free = 1; } } } // só um colega de equipa
  S.points = { me: 0 }; S.wins = { me: 0 };
  for (const d of S.drivers) { S.points[d.id] = 0; S.wins[d.id] = 0; }
  S.year = S.world.year; S.car = {}; S.closed = false; S.offers = null; S.devLeft = 0;
  S.calendar = seasonPick(cat, (S.settings && S.settings.season) || 'curta').map((t) => ({ name: t[0], nat: t[1], date: S.year + '-' + t[2], res: null }));
  buildEvents();
  S.dev = 0;
  CAREER.ensureSims(S);
}
// ---------- calendário e dias ----------
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dOf = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const isoOf = (dt) => dt.toISOString().slice(0, 10);
const addDays = (iso, n) => { const d = dOf(iso); d.setUTCDate(d.getUTCDate() + n); return isoOf(d); };
const daysBetween = (a, b) => Math.round((dOf(b) - dOf(a)) / 864e5);
const fmtDay = (iso) => { const d = dOf(iso); return `${d.getUTCDate()} ${MESES[d.getUTCMonth()].slice(0, 3)}`; };
const EVN = { launch: ['🚀', 'Apresentação da época'], oficina: ['🔧', 'Dia de oficina'], corrida: ['🏁', 'Fim de semana de corrida'] };
function buildEvents() {
  const ev = [];
  S.calendar.forEach((c, k) => {
    const prev = k ? S.calendar[k - 1].date : null, gap = prev ? daysBetween(prev, c.date) : 30;
    ev.push({ t: 'oficina', r: k, date: addDays(c.date, -Math.min(4, Math.max(2, gap - 3))) });
    ev.push({ t: 'corrida', r: k, date: c.date });
  });
  ev.unshift({ t: 'launch', r: -1, date: addDays(ev[0].date, -12) });
  S.events = ev; S.offDone = []; S.launchDone = false; S.today = addDays(ev[0].date, -2); S.oficinaOpen = null;
}
function ensureEvents() { // carreiras antigas, sem datas
  if (!S || S.events) return;
  S.year = 2025 + (S.season || 1);
  const ref = TRACKS[S.cat] || [];
  let last = S.year + '-03-01';
  S.calendar.forEach((c) => { const t = ref.find((x) => x[0] === c.name); c.date = t && t[2] ? S.year + '-' + t[2] : addDays(last, 21); if (c.date <= last) c.date = addDays(last, 14); last = c.date; });
  const r = S.round; buildEvents(); S.launchDone = true; S.offDone = Array.from({ length: r }, (_, k) => k);
  S.today = r ? S.calendar[r - 1].date : S.today; save();
}
function nextEvent() {
  for (const e of S.events) {
    if (e.t === 'launch' && !S.launchDone) return e;
    if (e.t === 'oficina' && e.r >= S.round && !S.offDone.includes(e.r)) return e;
    if (e.t === 'corrida' && e.r >= S.round) return e;
  }
  return null;
}
function newCareer(profile) {
  const year = 2026, world = CAREER.createWorld(year, profile.num);
  S = { ver: 2, world, ...freshPlayer(profile, year), settings: { ...tmpSettings }, money: 600, kart: { motor: 0, chassis: 0, pneus: 0, travoes: 0, carb: 0, eixo: 0 },
    owned: ['liso', 'faixa'], history: [], stats: { races: 0, wins: 0, podiums: 0, poles: 0, titles: 0, fl: 0, dnf: 0, pts: 0 }, season: 0 };
  CAREER.news(S, 'carreira', `${profile.first} ${profile.last} estreia-se no karting`, `Com ${year - S.profile.born} anos, o piloto de ${flagOf(profile.nat)} começa a carreira sem fama e com pouco dinheiro.`, 'kart');
  newSeason('kart', null);
  save();
}

// ---------- carros ----------
const teamOf = (i) => (S.cat === 'kart' || i == null ? null : TEAMS[S.cat][i]);
function playerParams() {
  if (S.cat === 'kart') {
    const k = S.kart;
    return carParams('kart', { power: 0.97 + 0.022 * k.motor + 0.01 * (k.carb || 0), grip: 0.99 + 0.006 * (k.chassis + k.pneus) + 0.005 * (k.eixo || 0), brake: 0.95 + 0.02 * k.travoes });
  }
  const tf = teamOf(S.team)[3] * (1 + 0.004 * (S.dev || 0)), e = S.world ? CAREER.partEffects(S) : { power: 1, grip: 1, aero: 1, brake: 1 };
  return carParams(S.cat, { power: tf * e.power, grip: Math.pow(tf, 0.6) * e.grip, aero: tf * e.aero, brake: e.brake });
}
function aiParams(d) {
  if (S.cat === 'kart') return carParams('kart', { power: 1, grip: 1, brake: 1 });
  const tf = TEAMS[S.cat][d.team][3], e = d.team === S.team && S.world ? CAREER.partEffects(S) : { power: 1, grip: 1, aero: 1, brake: 1 }; // o colega também recebe as peças novas
  return carParams(S.cat, { power: tf * e.power, grip: Math.pow(tf, 0.6) * e.grip, aero: tf * e.aero, brake: e.brake });
}
// desempenho do carro numa escala comparável entre equipas (para simulações)
function carPerf(id) {
  if (S.cat === 'kart') { if (id !== 'me') return 1; const k = S.kart, raw = Math.pow(0.97 + 0.022 * k.motor + 0.01 * (k.carb || 0), 0.4) * Math.pow(0.99 + 0.006 * (k.chassis + k.pneus) + 0.005 * (k.eixo || 0), 0.45) * Math.pow(0.95 + 0.02 * k.travoes, 0.15); return 1 + (raw - 1) * 0.3; } // no tempo por volta, 5% de potência valem bem menos de 5%
  const d = id === 'me' ? { team: S.team } : S.drivers.find((x) => x.id === id), tf = TEAMS[S.cat][d.team][3];
  const e = d.team === S.team ? CAREER.partEffects(S) : { power: 1, grip: 1, aero: 1 };
  return tf * Math.pow(e.power, 0.4) * Math.pow(e.grip, 0.35) * Math.pow(e.aero, 0.25);
}
function meDriver() {
  const p = S.profile, t = teamOf(S.team);
  return { id: 'me', first: p.first, last: p.last, code: p.last.replace(/[^A-Za-zÀ-ú]/g, '').slice(0, 3).toUpperCase() || 'EU', nat: p.nat, num: p.num, skill: 1,
    c1: t ? t[1] : p.helmet.c1, c2: t ? t[2] : p.helmet.c2, helmet: helmetOf(p), team: S.team, sponsor: S.sponsor ? S.sponsor.name : null };
}
function aiDriver(d) {
  const t = teamOf(d.team);
  const sp = SPONSORS[(d.team != null ? d.team * 3 : d.num) % SPONSORS.length][0];
  return { ...d, c1: t ? t[1] : d.kc1, c2: t ? t[2] : d.kc2, helmet: { ...d.helmet, num: d.num, name: d.last }, sponsor: sp };
}
const trackCache = {};
function getTrack(name, cat) { const k = name + '|' + cat; return trackCache[k] || (trackCache[k] = buildTrack(name, cat)); }
const nameOf = (id) => (id === 'me' ? S.profile.first + ' ' + S.profile.last : (() => { const d = S.drivers.find((x) => x.id === id); return d ? d.first + ' ' + d.last : '?'; })());
const driverById = (id) => (id === 'me' ? meDriver() : aiDriver(S.drivers.find((x) => x.id === id)));

// ---------- navegação ----------
let screen = null;
function show(fn, ...args) { MENU3D.stop(); screen = [fn, args]; document.body.classList.add('carbon'); $('#race').hidden = true; app.hidden = false; app.innerHTML = fn(...args); afterRender(); }
function rerender() { if (!screen) return; const sc = app.querySelector('.screen'), top = sc ? sc.scrollTop : 0; show(screen[0], ...screen[1]); const n = app.querySelector('.screen'); if (n) n.scrollTop = top; }
let afterHooks = [];
function after(f) { afterHooks.push(f); }
function afterRender() { const h = afterHooks; afterHooks = []; h.forEach((f) => f()); }
app.addEventListener('click', (e) => {
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
  AUDIO.click(); ACT[b.dataset.a]?.(b.dataset.v, b);
});
app.addEventListener('change', (e) => { const el = e.target.closest('[data-c]'); if (el) CHG[el.dataset.c]?.(el.value, el); });
app.addEventListener('input', (e) => { const el = e.target.closest('[data-i]'); if (el) CHG[el.dataset.i]?.(el.value, el); });

// ---------- ecrãs ----------
function showroomCar(cat) {
  const p = (REAL || S) ? (REAL || S).profile : { nat: 'PT', num: 7, helmet: { c1: '#e10600', c2: '#ffffff', c3: '#1b1b1b', pattern: 'faixa' } };
  const base = REAL || S;
  cat = cat || (base ? base.cat : 'kart');
  let c1 = p.helmet.c1, c2 = p.helmet.c2;
  if (cat !== 'kart') { const ti = base && base.cat === cat && base.team != null ? base.team : (cat === QS.cat ? QS.team : 0); const t = TEAMS[cat][ti]; c1 = t[1]; c2 = t[2]; }
  return { cat, c1, c2, num: p.num, helmet: helmetOf(p), sponsor: base && base.sponsor ? base.sponsor.name : null };
}
function homeShell(inner, cat, wide) {
  after(() => { const ok = MENU3D.start($('#showCv'), showroomCar(cat)); if (!ok) $('#showCv').hidden = true; });
  return `<div class="home"><canvas id="showCv"></canvas><div class="homeL ${wide ? 'wide' : ''}">${inner}</div></div>`;
}
function scrHome() {
  const base = REAL || S;
  const C = base ? catById(base.cat) : null;
  return homeShell(`<div class="hlogo"><div class="mark"><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span></div>
  <h1>Grelha de <b>Partida</b></h1><p>Do karting à Fórmula 1</p></div>
  <nav class="mmenu">
  ${base ? `<button class="mbtn primary" data-a="hub"><i>01</i><span>Continuar carreira<small>${esc(base.profile.first + ' ' + base.profile.last)} · ${C.n} · época ${base.season}</small></span></button>` : ''}
  <button class="mbtn ${base ? '' : 'primary'}" data-a="newCareer"><i>${base ? '02' : '01'}</i><span>Nova carreira<small>Começa no karting e sobe até à F1</small></span></button>
  <button class="mbtn" data-a="quick"><i>${base ? '03' : '02'}</i><span>Corrida rápida<small>Escolhe carro, pista e tempo</small></span></button>
  <button class="mbtn" data-a="settings"><i>${base ? '04' : '03'}</i><span>Definições<small>Comandos, câmara, gráficos e som</small></span></button>
  </nav>
  <p class="hhint">Joga com o telemóvel na horizontal · No computador: setas ou WASD, espaço trava, R rádio</p>`);
}
// ---------- corrida rápida ----------
const QS = { cat: 'kart', track: 0, team: 0, wx: 'seco', len: 0, start: 'meio' };
const QWX = { seco: ['☀️ Seco', { start: 0, end: 0, at: 0.5 }], chuva: ['🌧️ Chuva', { start: 0.75, end: 0.7, at: 0.5 }], vem: ['🌦️ Chuva a meio', { start: 0, end: 0.8, at: 0.45 }], seca: ['🌤️ A secar', { start: 0.7, end: 0, at: 0.4 }] };
const QSTART = { pole: 'Pole position', meio: 'Meio da grelha', fim: 'Último', sorte: 'À sorte' };
const quickTracks = (cat) => (cat === 'kart' ? TRACKS.kart : Object.keys(CIRCUITS).map((k) => [k, CIRCUITS[k].nat]).sort((a, b) => a[0].localeCompare(b[0], 'pt')));
function scrQuick() {
  const C = catById(QS.cat), tr = quickTracks(QS.cat);
  QS.track = Math.min(QS.track, tr.length - 1);
  const segs = (k, list, cur) => `<div class="seg">${list.map(([v, l]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-a="qs" data-v="${k}|${v}">${l}</button>`).join('')}</div>`;
  return homeShell(`<div class="topbar"><button class="back" data-a="home">‹ Menu</button><h1>Corrida <em>rápida</em></h1></div>
  <div class="qform"><div class="col">
  <h2>Carro</h2>${segs('cat', CATS.map((c) => [c.id, c.short]), QS.cat)}
  ${QS.cat !== 'kart' ? `<label class="field">Equipa<select data-c="qteam">${TEAMS[QS.cat].map((t, k) => `<option value="${k}" ${k === QS.team ? 'selected' : ''}>${t[0]} ${'★'.repeat(Math.max(1, Math.round((t[3] - 0.982) * 160)))}</option>`).join('')}</select></label>` : ''}
  <label class="field">Pista<select data-c="qtrack">${tr.map((t, k) => `<option value="${k}" ${k === QS.track ? 'selected' : ''}>${flagOf(t[1])} ${t[0]}</option>`).join('')}</select></label>
  </div><div class="col"><h2>Tempo</h2>${segs('wx', Object.entries(QWX).map(([k, v]) => [k, v[0]]), QS.wx)}
  <h2>Voltas</h2>${segs('len', C.laps.map((n, k) => [k, n + ' voltas']), QS.len)}
  <h2>Partida</h2>${segs('start', Object.entries(QSTART), QS.start)}
  <h2>Rivais</h2>${segs('diff', [['facil', 'Fácil'], ['medio', 'Médio'], ['dificil', 'Difícil'], ['lenda', 'Lenda']], ST().diff)}
  </div></div>
  <button class="btn go" data-a="quickGo">Para a grelha!</button>`, QS.cat, true);
}
function quickSetup() {
  if (!(S && S.quick)) REAL = S;
  const base = REAL, tr = quickTracks(QS.cat)[QS.track];
  const profile = base ? JSON.parse(JSON.stringify(base.profile)) : { first: 'Piloto', last: 'Convidado', nat: 'PT', num: 7, helmet: { c1: '#e10600', c2: '#ffffff', c3: '#1b1b1b', pattern: 'faixa' } };
  S = { ver: 2, quick: true, world: CAREER.createWorld(2026, profile.num), ...freshPlayer(profile, 2026), settings: { ...(base ? base.settings : tmpSettings), length: QS.len }, money: 0, kart: { motor: 3, chassis: 3, pneus: 3, travoes: 3, carb: 3, eixo: 3 },
    owned: [], history: [], stats: { races: 0, wins: 0, podiums: 0, poles: 0, titles: 0 }, season: 0, sponsor: base && base.sponsor ? base.sponsor : null };
  newSeason(QS.cat, QS.cat === 'kart' ? null : QS.team);
  S.calendar = [{ name: tr[0], nat: tr[1], date: '2026-06-01', res: null }]; S.events = [{ t: 'corrida', r: 0, date: '2026-06-01' }]; S.offDone = [0]; S.launchDone = true;
  const C = catById(QS.cat), wx = { ...QWX[QS.wx][1] };
  const ids = S.drivers.slice().sort((a, b) => b.skill - a.skill).map((d) => d.id), n = ids.length + 1;
  const at = { pole: 0, meio: Math.floor(n / 2), fim: n - 1, sorte: Math.floor(Math.random() * n) }[QS.start];
  ids.splice(at, 0, 'me');
  weekend = { round: 0, grid: ids.map((id) => ({ id, t: 0 })), tyre: wx.start > 0.3 ? (C.pits ? 'I' : 'W') : 'M', quali: null, weather: wx, goal: null };
}
function leaveQuick() { if (S && S.quick) { S = REAL; REAL = null; if (S && S.world) CAREER.syncTeams(S.world); } }
let draft = null;
function scrNew(step = 1) {
  draft = draft || { first: '', last: '', nat: 'PT', num: 7, helmet: { c1: '#e10600', c2: '#ffffff', c3: '#1b1b1b', pattern: 'faixa' } };
  if (step === 1) return `<div class="screen"><div class="topbar"><button class="back" data-a="home">‹ Voltar</button><h1>Nova <em>carreira</em></h1></div>
  <div class="grid2"><div class="card"><h2>Piloto</h2>
  <label class="field">Nome<input type="text" id="fFirst" maxlength="18" value="${esc(draft.first)}" placeholder="O teu nome" autocomplete="off"></label>
  <label class="field">Apelido<input type="text" id="fLast" maxlength="20" value="${esc(draft.last)}" placeholder="O teu apelido" autocomplete="off"></label>
  <label class="field">Nacionalidade<select id="fNat">${COUNTRIES.slice().sort((a, b) => a[1].localeCompare(b[1], 'pt')).map(([c, n]) => `<option value="${c}" ${c === draft.nat ? 'selected' : ''}>${flagOf(c)} ${n}</option>`).join('')}</select></label>
  <label class="field">Número do carro (1 a 99)<input type="number" id="fNum" min="1" max="99" value="${draft.num}"></label></div>
  <div class="card"><h2>Como queres conduzir</h2>${settingsControls(true)}</div></div>
  <div class="stack"><button class="btn primary" data-a="newStep2">Seguinte: capacete</button></div></div>`;
  return `<div class="screen"><div class="topbar"><button class="back" data-a="newBack">‹ Voltar</button><h1>O teu <em>capacete</em></h1></div>
  <div class="grid2">${helmetEditor(draft, true)}</div>
  <div class="stack"><button class="btn go" data-a="startCareer">Começar no karting</button></div></div>`;
}
function helmetEditor(p, free) {
  const h = p.helmet; h.visor = h.visor || 'escura'; h.finish = h.finish || 'brilho';
  after(() => { const cv = $('#helm3d'); if (!(cv && MENU3D.start(cv, { helmet: helmetOf(p) }, 'helmet'))) { if (cv) cv.hidden = true; const c2 = $('#helmCv'); if (c2) { c2.hidden = false; paintHelmet(c2, helmetOf(p)); } } });
  const owned = (k) => free || S.owned.includes(k);
  const price = (k, cost) => (owned(k) || !cost ? '' : ` · ${eur(cost)}`);
  const sw = (k) => `<div class="swatches">${HELMET_COLORS.map((c) => `<button style="background:${c}" class="${h[k] === c ? 'on' : ''}" data-a="hcol" data-v="${k}|${c}" aria-label="cor"></button>`).join('')}</div>`;
  const zone = (k, l) => `<div class="zone"><span>${l}</span><div class="swatches small"><button class="none ${h[k] ? '' : 'on'}" data-a="hcol" data-v="${k}|-" aria-label="igual">—</button>${HELMET_COLORS.map((c) => `<button style="background:${c}" class="${h[k] === c ? 'on' : ''}" data-a="hcol" data-v="${k}|${c}" aria-label="cor"></button>`).join('')}</div></div>`;
  const tog = (k, l, def) => `<button class="${(h[k] ?? def) ? 'on' : ''}" data-a="htog" data-v="${k}|${def ? 1 : 0}">${l}</button>`;
  return `<div class="card helmetbox"><canvas id="helm3d" class="helm3d"></canvas><canvas id="helmCv" width="320" height="320" hidden></canvas><div class="muted">${flagOf(p.nat)} #${p.num} · ${esc(p.last || '')}</div></div>
  <div class="card"><h2>Cor principal</h2>${sw('c1')}<h2>Cor do desenho</h2>${sw('c2')}<h2>Cor dos detalhes</h2>${sw('c3')}
  <h2>Zonas do capacete</h2><p class="muted" style="margin:0">Pinta cada parte com outra cor (— = sem cor própria). Arrasta o capacete para o rodar.</p>${zone('cTop', 'Topo')}${zone('cChin', 'Queixeira')}${zone('cBack', 'Parte de trás')}${zone('cStrip', 'Faixa da viseira')}
  <h2>Desenho</h2><div class="seg">${HELMET_PATTERNS.map((x) => `<button class="${h.pattern === x.k ? 'on' : ''}" data-a="hpat" data-v="${x.k}">${x.n}${price(x.k, x.cost)}</button>`).join('')}</div>
  <h2>Viseira</h2><div class="seg">${HELMET_VISORS.map((x) => `<button class="${h.visor === x.k ? 'on' : ''}" data-a="hopt" data-v="visor|${x.k}">${x.n}${price('v:' + x.k, x.cost)}</button>`).join('')}</div>
  <h2>Acabamento</h2><div class="seg">${HELMET_FINISH.map((x) => `<button class="${h.finish === x.k ? 'on' : ''}" data-a="hopt" data-v="finish|${x.k}">${x.n}${price('f:' + x.k, x.cost)}</button>`).join('')}</div>
  <h2>Detalhes</h2><div class="seg">${tog('showNum', 'Número nos lados', true)}${tog('showName', 'Nome atrás', true)}${tog('showFlag', 'Bandeira atrás', false)}${tog('sponsor', 'Patrocinador na viseira', false)}</div>
  ${free ? '<p class="muted">Na carreira, alguns desenhos, viseiras e acabamentos custam dinheiro. Agora podes escolher qualquer um.</p>' : `<p class="muted">Tens <span class="money">${eur(S.money)}</span>. O que comprares fica teu.</p>`}</div>`;
}
function settingsControls(compact) {
  const s = ST();
  const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${String(s[k]) === String(v) ? 'on' : ''}" data-a="set" data-v="${k}|${v}">${l}</button>`).join('')}</div>`;
  return `<label class="field">Direção</label>${seg('controls', [['arrows', 'Setas ◀ ▶'], ['wheel', 'Volante']])}
  <label class="field">Dificuldade dos rivais</label>${seg('diff', [['facil', 'Fácil'], ['medio', 'Médio'], ['dificil', 'Difícil'], ['lenda', 'Lenda']])}
  <label class="field">Época</label>${seg('season', [['curta', 'Curta (algumas corridas)'], ['completa', 'Completa (calendário todo)']])}
  <label class="field">Ajudas</label><div class="seg">${[['abs', 'ABS'], ['tc', 'Controlo de tração'], ['steer', 'Direção assistida'], ['line', 'Trajetória ideal']].map(([k, l]) => `<button class="${s[k] ? 'on' : ''}" data-a="tog" data-v="${k}">${l}</button>`).join('')}</div>
  ${compact ? '' : `<label class="field">Duração das corridas</label>${seg('length', [[0, 'Curta'], [1, 'Média'], [2, 'Longa']])}
  <label class="field">Câmara</label>${seg('cam', [['cockpit', 'Primeira pessoa'], ['chase', 'Atrás do carro'], ['rot', 'Vista de cima'], ['fixed', 'Mapa fixo']])}
  <label class="field">Qualidade gráfica</label>${seg('gfx', [['baixa', 'Baixa (mais fluido)'], ['media', 'Média'], ['alta', 'Alta (sombras e detalhe)']])}
  <label class="field">Unidades</label>${seg('units', [['kmh', 'km/h'], ['mph', 'mph']])}
  <label class="field">Sensibilidade da direção · ${Math.round(s.sens * 100)}%</label><input type="range" min="0.6" max="1.5" step="0.05" value="${s.sens}" data-i="sens">
  <label class="field">Volume · ${Math.round(s.vol * 100)}%</label><input type="range" min="0" max="1" step="0.05" value="${s.vol}" data-i="vol">
  <label class="field">Corrida</label><div class="seg"><button class="${s.formation !== false ? 'on' : ''}" data-a="tog" data-v="formation">Volta de formação</button></div>
  <label class="field">Rádio</label><div class="seg"><button class="${s.voice ? 'on' : ''}" data-a="tog" data-v="voice">Voz do engenheiro</button><button class="${s.names ? 'on' : ''}" data-a="tog" data-v="names">Nomes dos rivais na pista</button></div>`}`;
}
function scrSettings() {
  const p = S ? S.profile : null;
  return `<div class="screen"><div class="topbar"><button class="back" data-a="${S ? 'hub' : 'home'}">‹ Voltar</button><h1><em>Definições</em></h1></div>
  <div class="grid2">${p ? `<div class="card"><h2>Piloto</h2>
  <label class="field">Nome<input type="text" maxlength="18" value="${esc(p.first)}" data-c="first"></label>
  <label class="field">Apelido<input type="text" maxlength="20" value="${esc(p.last)}" data-c="last"></label>
  <label class="field">Nacionalidade<select data-c="nat">${COUNTRIES.slice().sort((a, b) => a[1].localeCompare(b[1], 'pt')).map(([c, n]) => `<option value="${c}" ${c === p.nat ? 'selected' : ''}>${flagOf(c)} ${n}</option>`).join('')}</select></label>
  <label class="field">Número<input type="number" min="1" max="99" value="${p.num}" data-c="num"></label></div>` : ''}
  <div class="card"><h2>Condução e jogo</h2>${settingsControls(false)}</div>
  ${S ? '<div class="card"><h2>Carreira</h2><p class="muted">Apagar a carreira começa tudo de novo no karting. Não dá para desfazer.</p><button class="btn" data-a="wipe">Apagar carreira</button></div>' : ''}</div></div>`;
}
function navBar(active) {
  const tabs = [['hub', 'Paddock'], ['calendar', 'Calendário'], ['garage', 'Oficina'], ['champ', 'Campeonato'], ['news', 'Notícias'], ['profile', 'Piloto'], ['contract', S.cat === 'kart' ? 'Mercado' : 'Contrato'], ['sponsors', 'Patrocínios'], ['hof', 'Hall of Fame'], ['helmet', 'Capacete'], ['settings', 'Definições']];
  return `<div class="seg" style="flex-wrap:nowrap;overflow-x:auto">${tabs.map(([k, l]) => `<button class="${k === active ? 'on' : ''}" data-a="${k}">${l}</button>`).join('')}</div>`;
}
function champTable(limit) {
  const rows = [['me', S.points.me]].concat(S.drivers.map((d) => [d.id, S.points[d.id] || 0])).sort((a, b) => b[1] - a[1] || (S.wins[b[0]] || 0) - (S.wins[a[0]] || 0));
  const meIdx = rows.findIndex((r) => r[0] === 'me');
  return { rows: limit ? rows.slice(0, limit) : rows, meIdx };
}
const DAY_NOTES = ['Treino físico no ginásio.', 'Sessão no simulador a estudar a próxima pista.', 'Dia de descanso.', 'Reunião com a equipa a rever os dados.', 'Corrida de bicicleta para ganhar resistência.', 'Entrevista para uma revista de automobilismo.', 'Visita à fábrica para ver as peças novas.', 'Treino de reação com luzes.'];
function agendaCard() {
  const e = nextEvent();
  if (!e) return `<div class="card"><h2>Época terminada</h2><button class="btn primary" data-a="seasonEnd">Ver o final da época</button></div>`;
  const [ic, nm] = EVN[e.t], left = Math.max(0, daysBetween(S.today, e.date)), rd = S.calendar[Math.max(0, e.r)];
  const sub = e.t === 'corrida' ? `${flagOf(rd.nat)} ${rd.name} · ronda ${e.r + 1}/${S.calendar.length}` : e.t === 'oficina' ? `Prepara o ${S.cat === 'kart' ? 'kart' : 'carro'} para ${flagOf(rd.nat)} ${rd.name}` : `Começa a época ${S.year} da ${catById(S.cat).n}`;
  const go = e.t === 'corrida' ? '<button class="btn go" data-a="weekend">É hoje! Ir para o fim de semana de corrida</button>' : e.t === 'oficina' ? '<button class="btn go" data-a="oficina">É hoje! Ir para a oficina</button>' : '<button class="btn go" data-a="launch">É hoje! Ver a apresentação</button>';
  const wait = `<div class="dayrow"><button class="btn primary" data-a="nextDay">Avançar 1 dia ▶</button><button class="btn" data-a="skipDays">Saltar ${left} dia${left > 1 ? 's' : ''} ⏭</button></div>`;
  return `<div class="card agenda"><div class="today">📅 Hoje: <b>${fmtDay(S.today)} ${S.year}</b>${S.dayNote ? ` · <span>${esc(S.dayNote)}</span>` : ''}</div>
  <div class="evbig"><span class="evic">${ic}</span><div class="grow"><small>Próximo · ${fmtDay(e.date)} ${left > 0 ? `· daqui a ${left} dia${left > 1 ? 's' : ''}` : '· hoje'}</small><h3>${nm}</h3><div class="muted">${sub}</div></div></div>
  ${S.pending ? '<p class="muted">Responde primeiro ao evento de hoje.</p>' : left > 0 ? wait : go}<button class="btn small" data-a="calendar">Ver o calendário</button></div>`;
}
const teamLogo = (cat, i, size = 34) => { const t = S.world.teams[cat] && S.world.teams[cat][i]; return t ? CAREER.logo(t.name, t.c1, t.c2, t.shape, size) : ''; };
const meter = (v, max = 100, cls = '') => `<div class="meter ${cls}"><i style="width:${clamp((v / max) * 100, 0, 100)}%"></i></div>`;
const stars = (n) => '★'.repeat(n) + '<span class="dim">' + '★'.repeat(Math.max(0, 5 - n)) + '</span>';
const NEWS_IC = { campeao: '🏆', vitoria: '🥇', resultado: '🏁', surpresa: '😮', mercado: '🔁', talento: '🌟', regras: '📜', rival: '⚔️', declaracao: '🗣️', patrocinio: '💼', reforma: '👋', interesse: '👀', contrato: '✍️', pole: '⏱️', carreira: '🏎️' };
function pendingCard() {
  const ev = S.pending, msg = S.choiceMsg;
  if (!ev) return msg && msg.length ? `<div class="card result-note"><b>Resultado da tua escolha</b><div class="muted">${msg.map(esc).join(' · ')}</div></div>` : '';
  return `<div class="card event"><div class="row"><span class="evic">${ev.ic}</span><div class="grow"><small class="muted">${fmtDay(S.today)}</small><h3>${esc(ev.t)}</h3><div>${esc(ev.x)}</div></div></div><div class="seg">${ev.ch.map(([l], k) => `<button data-a="choose" data-v="${k}">${esc(l)}</button>`).join('')}</div></div>`;
}
function scrHub() {
  ensureEvents();
  const p = S.profile, C = catById(S.cat), t = teamOf(S.team), rd = S.calendar[S.round], W = S.world;
  after(() => { paintHelmet($('#helmCv'), helmetOf(p)); if (rd) drawTrackPreview($('#trkCv'), getTrack(rd.name, S.cat)); });
  const ct = S.contract && S.contract.cat === S.cat ? S.contract : null, rivals = Object.entries(S.rivals || {}).filter(([id]) => W.drivers[id]).sort((a, b) => b[1].heat - a[1].heat).slice(0, 2);
  const nw = W.news.slice(0, 3);
  return `<div class="screen"><div class="topbar"><h1>${C.n} <em>· ${S.year}</em></h1><span class="money">${eur(S.money)}</span></div>${navBar('hub')}
  ${pendingCard()}
  <div class="grid2">
  <div class="card"><div class="row"><canvas id="helmCv" width="160" height="160" style="width:74px;height:74px"></canvas><div class="grow"><h3>${flagOf(p.nat)} ${esc(p.first)} ${esc(p.last)}</h3><div class="muted">#${p.num} · ${CAREER.ageOf(S)} anos · ${t ? `${teamLogo(S.cat, S.team, 18)} ${esc(t[0])}` : 'Piloto de kart independente'}</div></div></div>
  <div class="kv"><div><small>Campeonato</small><b>P${champTable().meIdx + 1}</b></div><div><small>Pontos</small><b>${S.points.me}</b></div><div><small>Vitórias</small><b>${S.wins.me}</b></div><div><small>Ronda</small><b>${Math.min(S.round + 1, S.calendar.length)}/${S.calendar.length}</b></div></div>
  <div class="row"><span class="muted" style="min-width:92px">Reputação</span>${meter(S.rep)}<b>${Math.round(S.rep)}</b></div>
  <div class="row"><span class="muted" style="min-width:92px">Capacidade</span>${meter(CAREER.playerRating(S))}<b>${Math.round(CAREER.playerRating(S))}</b></div>
  ${ct ? `<div class="row"><span class="tag">Contrato</span><span class="grow muted">até ${ct.until} · ${eur(ct.salary)}/corrida · ${esc(ct.goal.txt)}</span></div>` : ''}
  <div class="row"><span class="tag">Patrocínios</span><span class="grow muted">${(S.sponsors || []).length ? S.sponsors.map((x) => esc(x.name)).join(', ') : 'nenhum'}</span><button class="btn small" data-a="sponsors">Ver</button></div></div>
  ${agendaCard()}
  <div class="card"><h2>Campeonato</h2>${(() => { const r = champTable().rows, mi = r.findIndex((x) => x[0] === 'me'), show5 = r.slice(0, 5).map((x, k) => [x, k]); if (mi >= 5) show5.push([r[mi], mi]); return show5.map(([[id, pts], k]) => { const d = driverById(id); return `<div class="row ${id === 'me' ? 'me' : ''}"><b style="min-width:24px">${k + 1}</b><span class="teamdot" style="background:${d.c1}"></span><span class="grow">${flagOf(d.nat)} ${esc(d.first[0] + '. ' + d.last)}</span><b>${pts}</b></div>`; }).join(''); })()}<button class="btn small" data-a="champ">Ver a tabela completa</button></div>
  <div class="card"><h2>Notícias</h2>${nw.map((n) => `<div class="news-mini"><span>${NEWS_IC[n.k] || '📰'}</span><div><b>${esc(n.title)}</b><div class="muted">${fmtDay(n.date)} · ${catById(n.cat) ? catById(n.cat).short : ''}</div></div></div>`).join('') || '<p class="muted">Sem notícias.</p>'}<button class="btn small" data-a="news">Abrir o centro de notícias</button></div>
  ${rivals.length ? `<div class="card"><h2>Rivalidades</h2>${rivals.map(([id, rv]) => { const d = W.drivers[id]; return `<div class="row"><span class="grow">${flagOf(d.nat)} <b>${esc(d.first + ' ' + d.last)}</b><div class="muted">${CAREER.rivalName(rv.k)} · frente a frente ${rv.h2h[0]}-${rv.h2h[1]}</div></span>${meter(rv.heat, 100, 'hot')}</div>`; }).join('')}</div>` : ''}
  ${rd ? `<div class="card"><h2>Próxima corrida · ${fmtDay(rd.date)}</h2><h3>${flagOf(rd.nat)} ${rd.name}</h3><canvas class="trackprev" id="trkCv" width="600" height="300"></canvas>
  <div class="muted">${(getTrack(rd.name, S.cat).len / 1000).toFixed(3)} km · ${CAREER.hasSprint(S.cat, rd.name) ? FMT().sprint.n + ' + ' : ''}${FMT().main.n}</div></div>` : ''}
  </div></div>`;
}
function scrCalendar() {
  ensureEvents();
  const byDay = {}; for (const e of S.events) (byDay[e.date] || (byDay[e.date] = [])).push(e);
  const first = dOf(S.events[0].date), last = dOf(S.events[S.events.length - 1].date), months = [];
  for (let y = first.getUTCFullYear(), m = first.getUTCMonth(); y < last.getUTCFullYear() || (y === last.getUTCFullYear() && m <= last.getUTCMonth()); m++ === 11 && (m = 0, y++)) months.push([y, m]);
  const nx = nextEvent();
  const cell = (iso) => {
    const evs = byDay[iso] || [], d = dOf(iso).getUTCDate();
    const cls = [iso === S.today ? 'today' : '', evs.length ? 'ev ev-' + evs[0].t : '', nx && nx.date === iso ? 'next' : '', iso < S.today ? 'past' : ''].join(' ');
    let inner = `<i>${d}</i>`;
    for (const e of evs) { if (e.t === 'corrida') { const c = S.calendar[e.r]; inner += `<span>${flagOf(c.nat)}</span>${c.res != null ? `<b>${c.res === 'DNF' ? 'DNF' : 'P' + c.res}</b>` : ''}`; } else inner += `<span>${EVN[e.t][0]}</span>`; }
    return `<div class="${cls}">${inner}</div>`;
  };
  const monthHtml = ([y, m]) => {
    const start = new Date(Date.UTC(y, m, 1)), pad = (start.getUTCDay() + 6) % 7, nd = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    let h = `<div class="month"><h3>${MESES[m]} ${y}</h3><div class="mgrid">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((x) => `<div class="wd">${x}</div>`).join('')}${'<div></div>'.repeat(pad)}`;
    for (let d = 1; d <= nd; d++) h += cell(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    return h + '</div></div>';
  };
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Calendário <em>· ${catById(S.cat).n} ${S.year}</em></h1><span class="money">${eur(S.money)}</span></div>${navBar('calendar')}
  <div class="legend muted">🏁 corrida · 🔧 dia de oficina · 🚀 apresentação · <span class="lg-today">hoje</span></div>
  <div class="months">${months.map(monthHtml).join('')}</div>
  <div class="card"><h2>Rondas</h2>${S.calendar.map((c, k) => `<div class="row ${k === S.round ? 'me' : ''}"><b style="min-width:26px">${k + 1}</b><span style="min-width:62px" class="muted">${fmtDay(c.date)}</span><span class="grow">${flagOf(c.nat)} ${esc(c.name)}</span><b>${c.res == null ? '' : c.res === 'DNF' ? 'DNF' : 'P' + c.res}</b></div>`).join('')}</div></div>`;
}
function scrLaunch() {
  const C = catById(S.cat), t = teamOf(S.team), ch = champTable();
  after(() => { if (!MENU3D.start($('#showCv'), showroomCar(S.cat))) $('#showCv').hidden = true; });
  return `<div class="home"><canvas id="showCv"></canvas><div class="homeL"><button class="back" data-a="hub" style="align-self:flex-start">‹ Paddock</button><div class="hlogo"><p>Apresentação · ${S.year}</p><h1>${t ? esc(t[0]) : 'Época de <b>karting</b>'}</h1></div>
  <div class="card"><h2>${C.n}</h2><div class="kv"><div><small>Corridas</small><b>${S.calendar.length}</b></div><div><small>Primeira</small><b>${fmtDay(S.calendar[0].date)}</b></div><div><small>Rivais</small><b>${S.drivers.length}</b></div></div>
  <p class="muted">Primeira corrida: ${flagOf(S.calendar[0].nat)} ${esc(S.calendar[0].name)}. ${S.cat === 'kart' ? 'Antes de cada corrida há um dia de oficina para melhorares o kart.' : 'Antes de cada corrida há um dia de oficina na fábrica para desenvolver o carro.'} ${ch.rows.length ? '' : ''}</p></div>
  <button class="btn go" data-a="launchDone">Começar a época</button></div></div>`;
}
function drawTrackPreview(cv, T) {
  const g = cv.getContext('2d'), w = cv.width, h = cv.height, m = T.mini;
  const sc = Math.min((w - 30) / (m.x1 - m.x0), (h - 30) / (m.y1 - m.y0));
  const ox = (w - (m.x1 - m.x0) * sc) / 2 - m.x0 * sc, oy = (h - (m.y1 - m.y0) * sc) / 2 - m.y0 * sc;
  g.clearRect(0, 0, w, h); g.lineJoin = 'round';
  g.beginPath(); for (let i = 0; i <= T.n; i++) { const j = i % T.n; g.lineTo(T.x[j] * sc + ox, T.y[j] * sc + oy); }
  g.strokeStyle = '#000'; g.lineWidth = 12; g.stroke(); g.strokeStyle = '#e9edf2'; g.lineWidth = 6; g.stroke();
  g.fillStyle = '#e10600'; g.beginPath(); g.arc(T.x[0] * sc + ox, T.y[0] * sc + oy, 7, 0, Math.PI * 2); g.fill();
}
const oficinaOpen = () => S.oficinaOpen != null && S.oficinaOpen === S.round;
function oficinaBanner() {
  ensureEvents();
  const e = nextEvent(), rd = S.calendar[S.round];
  if (oficinaOpen()) return `<div class="card oficina on"><div class="row"><span class="evic">🔧</span><div class="grow"><h3>Dia de oficina · ${fmtDay(S.today)}</h3><div class="muted">Os mecânicos estão contigo. Melhora o ${S.cat === 'kart' ? 'kart' : 'carro'} antes de ${rd ? flagOf(rd.nat) + ' ' + esc(rd.name) : 'a próxima corrida'}.</div></div><button class="btn go small" data-a="oficinaDone">Terminar o dia</button></div></div>`;
  return `<div class="card oficina"><div class="row"><span class="evic">🔒</span><div class="grow"><b>A oficina está fechada</b><div class="muted">${e && e.t === 'oficina' ? `Abre no dia de oficina: ${fmtDay(e.date)}.` : 'Só podes comprar peças e desenvolver o carro nos dias de oficina, antes de cada corrida.'}</div></div>${e && e.t === 'oficina' ? '<button class="btn small primary" data-a="oficina">Avançar</button>' : ''}</div></div>`;
}
function scrGarage() {
  const C = catById(S.cat), open = oficinaOpen();
  after(() => { const cv = $('#garCv'); if (cv && !MENU3D.start(cv, showroomCar(S.cat), 'garage')) cv.hidden = true; });
  const show3d = '<div class="card garage3d"><canvas id="garCv"></canvas></div>';
  if (S.cat === 'kart') {
    for (const pt of KART_PARTS) S.kart[pt.k] = S.kart[pt.k] || 0;
    return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Garagem <em>· kart</em></h1><span class="money">${eur(S.money)}</span></div>${navBar('garage')}${oficinaBanner()}
    <div class="grid2">${show3d}<div class="card"><h2>Peças do kart</h2>${KART_PARTS.map((pt) => { const lv = S.kart[pt.k], cost = pt.cost[lv], can = open && lv < 5 && S.money >= cost; return `<div class="part"><div class="ico">${pt.i}</div><div><b>${pt.n}</b><div class="muted">${pt.d}</div><div class="lv">${[0, 1, 2, 3, 4].map((i) => `<span class="${i < lv ? 'on' : ''}"></span>`).join('')}</div></div>
    <button class="btn small ${can ? 'primary' : ''}" data-a="buyPart" data-v="${pt.k}" ${can ? '' : 'disabled'}>${lv >= 5 ? 'Máx.' : (open ? '' : '🔒 ') + eur(cost)}</button></div>`; }).join('')}</div>
    <div class="card"><h2>O teu kart</h2><div class="kv"><div><small>Potência</small><b>${Math.round((0.97 + 0.022 * S.kart.motor + 0.01 * S.kart.carb) * 100)}%</b></div><div><small>Aderência</small><b>${Math.round((0.99 + 0.006 * (S.kart.chassis + S.kart.pneus) + 0.005 * S.kart.eixo) * 100)}%</b></div><div><small>Travagem</small><b>${Math.round((0.95 + 0.02 * S.kart.travoes) * 100)}%</b></div></div><p class="muted">100% = igual ao kart médio dos rivais. Ganhas dinheiro em cada corrida; acaba nos 3 primeiros do campeonato para receberes propostas da Fórmula 4.</p></div></div></div>`;
  }
  const W = S.world, tm = W.teams[S.cat][S.team], P = CAREER.partsOf(S.cat), eff = CAREER.partEffects(S), rel = CAREER.playerReliability(S), rank = CAREER.teamRank(W, S.cat, S.team);
  const mate = S.drivers.find((d) => d.team === S.team), pct = (v) => (v >= 1 ? '+' : '') + ((v - 1) * 100).toFixed(1) + '%';
  const effTxt = (e) => Object.entries(e).map(([k, v]) => `${v > 0 ? '+' : '−'}${Math.abs(v * 100).toFixed(1).replace('.', ',')}% ${{ power: 'potência', grip: 'aderência', aero: 'carga aerodinâmica', brake: 'travagem', rel: 'fiabilidade' }[k]}`).join(' · ');
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Oficina <em>· ${esc(tm.name)}</em></h1><span class="money">${eur(S.money)}</span></div>${navBar('garage')}${oficinaBanner()}
  <div class="grid2">${show3d}
  <div class="card"><div class="row">${teamLogo(S.cat, S.team, 46)}<div class="grow"><h3>${esc(tm.name)}</h3><div class="muted">${C.n} · ${rank + 1}.ª equipa mais rápida</div></div></div>
  <div class="kv"><div><small>Orçamento</small><b class="stars">${stars(tm.budget)}</b></div><div><small>Fiabilidade</small><b>${(rel * 100).toFixed(1)}%</b></div><div><small>Desenvolvimento</small><b>${Math.round(tm.dev * 100)}</b></div></div>
  <div class="muted">Objetivo da equipa: ${esc(tm.goal.txt)} · colega: ${mate ? esc(mate.first + ' ' + mate.last) : '—'}</div>
  <div class="kv"><div><small>Potência</small><b>${pct(eff.power)}</b></div><div><small>Aderência</small><b>${pct(eff.grip)}</b></div><div><small>Aero</small><b>${pct(eff.aero)}</b></div><div><small>Travagem</small><b>${pct(eff.brake)}</b></div></div></div>
  <div class="card"><h2>Desenvolvimento ${open ? `· ${S.devLeft || 0} ponto${S.devLeft === 1 ? '' : 's'} da equipa` : ''}</h2>
  ${P.map(([k, n, ic, e]) => { const lv = (S.car && S.car[k]) || 0, cost = CAREER.partCost(S, k); return `<div class="part"><div class="ico">${ic}</div><div><b>${n}</b><div class="muted">${effTxt(e)} por nível</div><div class="lv">${[0, 1, 2, 3, 4].map((i) => `<span class="${i < lv ? 'on' : ''}"></span>`).join('')}</div></div>
  <div class="partbtns">${open && lv < 5 && S.devLeft > 0 ? `<button class="btn small primary" data-a="upPart" data-v="${k}|team">Ponto da equipa</button>` : ''}<button class="btn small ${open && lv < 5 && S.money >= cost ? '' : ''}" data-a="upPart" data-v="${k}|pay" ${!open || lv >= 5 || S.money < cost ? 'disabled' : ''}>${lv >= 5 ? 'Máx.' : (open ? '' : '🔒 ') + eur(cost)}</button></div></div>`; }).join('')}
  <p class="muted">Em cada dia de oficina, a equipa dá pontos de desenvolvimento conforme o orçamento (e a tua técnica). Também podes pagar do teu bolso. Mais potência gasta fiabilidade; o arrefecimento recupera-a. As peças valem até ao fim da época, e as equipas rivais também evoluem.</p></div>
  <div class="card"><h2>Equipas da ${C.n}</h2>${W.teams[S.cat].map((x, i) => [x, i]).sort((a, b) => b[0].perf - a[0].perf).map(([x, i], k) => `<div class="row ${i === S.team ? 'me' : ''}"><b style="min-width:20px">${k + 1}</b>${teamLogo(S.cat, i, 26)}<div class="grow">${esc(x.name)}<div class="muted">orçamento ${stars(x.budget)} · fiabilidade ${(x.rel * 100).toFixed(1)}%</div></div>${meter((x.perf - 0.975) / 0.05 * 100)}</div>`).join('')}</div></div></div>`;
}
function scrHelmet() {
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Capacete</h1><span class="money">${eur(S.money)}</span></div>${navBar('helmet')}<div class="grid2">${helmetEditor(S.profile, false)}</div></div>`;
}
let champTab = 'pilotos';
function teamTable() {
  const tm = TEAMS[S.cat].map((t, i) => ({ i, t, pts: 0, wins: 0 }));
  for (const [id, pts] of champTable().rows) { const d = driverById(id); if (d.team != null && tm[d.team]) { tm[d.team].pts += pts; tm[d.team].wins += S.wins[id] || 0; } }
  return tm.sort((a, b) => b.pts - a.pts || b.wins - a.wins);
}
function scrChamp() {
  const ch = champTable(), C = catById(S.cat), done = S.calendar.slice(0, S.round), lead = ch.rows[0] ? ch.rows[0][1] : 0;
  const stat = (id) => { let pod = 0, best = 99, poles = 0, fls = 0; for (const r of done) { const p = r.full ? r.full[id] : id === 'me' ? (r.res === 'DNF' ? 'D' : r.res) : null; if (typeof p === 'number') { if (p <= 3) pod++; best = Math.min(best, p); } if (r.pole === id) poles++; if (r.fl === id) fls++; } return { pod, best: best < 99 ? best : '–', poles, fls }; };
  const name = (d) => `<span class="teamdot" style="background:${d.c1}"></span>${flagOf(d.nat)} ${esc(d.first[0] + '. ' + d.last)}`;
  const tabs = `<div class="seg">${[['pilotos', 'Pilotos'], ...(S.cat !== 'kart' ? [['equipas', 'Equipas']] : []), ['resultados', 'Resultados por corrida']].map(([k, l]) => `<button class="${champTab === k ? 'on' : ''}" data-a="champTab" data-v="${k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (champTab === 'equipas' && S.cat !== 'kart') {
    const tt = teamTable(), tl = tt[0].pts;
    body = `<div class="card"><h2>Campeonato de equipas</h2><div class="tbl"><table class="champ"><tr><th>Pos</th><th>Equipa</th><th>Pilotos</th><th>Vit.</th><th>Dif.</th><th>Pts</th></tr>
    ${tt.map((x, k) => { const ds = ch.rows.filter(([id]) => driverById(id).team === x.i).map(([id]) => driverById(id).last); return `<tr class="${x.i === S.team ? 'me' : ''}"><td class="pos">${k + 1}</td><td>${teamLogo(S.cat, x.i, 22)} ${esc(x.t[0])}</td><td class="muted">${ds.map(esc).join(', ')}</td><td>${x.wins}</td><td class="muted">${k ? '−' + (tl - x.pts) : '–'}</td><td><b>${x.pts}</b></td></tr>`; }).join('')}</table></div></div>`;
  } else if (champTab === 'resultados') {
    const cell = (p, r, id) => { const cls = p === 'D' ? 'dnf' : p === 1 ? 'p1' : p === 2 ? 'p2' : p === 3 ? 'p3' : p <= 10 ? 'pts' : 'np'; return p == null ? '<td></td>' : `<td class="rc ${cls}${r.pole === id ? ' pole' : ''}${r.fl === id ? ' fl' : ''}">${p === 'D' ? 'DNF' : p}</td>`; };
    body = `<div class="card"><h2>Resultados por corrida</h2><div class="tbl"><table class="champ res"><tr><th>Pos</th><th>Piloto</th>${S.calendar.map((r, k) => `<th title="${esc(r.name)}">${flagOf(r.nat)}<br><small>${k + 1}</small></th>`).join('')}<th>Pts</th></tr>
    ${ch.rows.map(([id, pts], k) => `<tr class="${id === 'me' ? 'me' : ''}"><td class="pos">${k + 1}</td><td class="nm">${name(driverById(id))}</td>${S.calendar.map((r, j) => (j < S.round ? cell(r.full ? r.full[id] : id === 'me' ? (r.res === 'DNF' ? 'D' : r.res) : null, r, id) : '<td class="fut"></td>')).join('')}<td><b>${pts}</b></td></tr>`).join('')}</table></div>
    <p class="muted"><span class="lgd p1">1.º</span> <span class="lgd p2">2.º</span> <span class="lgd p3">3.º</span> <span class="lgd pts">pontos</span> <span class="lgd np">sem pontos</span> <span class="lgd dnf">desistiu</span> · <u>sublinhado</u> = pole · ⏱ = volta mais rápida</p></div>`;
  } else {
    body = `<div class="card"><h2>Classificação de pilotos · ronda ${Math.min(S.round, S.calendar.length)}/${S.calendar.length}</h2><div class="tbl"><table class="champ"><tr><th>Pos</th><th>Piloto</th>${S.cat !== 'kart' ? '<th>Equipa</th>' : ''}<th>Vit.</th><th>Pód.</th><th>Poles</th><th>Melhor</th><th>Dif.</th><th>Pts</th></tr>
    ${ch.rows.map(([id, pts], k) => { const d = driverById(id), st = stat(id), t = teamOf(d.team); return `<tr class="${id === 'me' ? 'me' : ''} ${k < 3 ? 'top' + (k + 1) : ''}"><td class="pos">${k + 1}</td><td class="nm">${name(d)}</td>${S.cat !== 'kart' ? `<td class="muted">${t ? esc(t[0]) : ''}</td>` : ''}<td>${S.wins[id] || 0}</td><td>${st.pod}</td><td>${st.poles}</td><td>${st.best === '–' ? '–' : 'P' + st.best}</td><td class="muted">${k ? '−' + (lead - pts) : '–'}</td><td><b>${pts}</b></td></tr>`; }).join('')}</table></div>
    <p class="muted">Pontos: ${POINTS.join(', ')} (do 1.º ao 10.º). Ainda há ${Math.max(0, S.calendar.length - S.round)} corrida${S.calendar.length - S.round === 1 ? '' : 's'} = ${Math.max(0, S.calendar.length - S.round) * POINTS[0]} pontos em jogo.</p></div>`;
  }
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Campeonato <em>· ${C.n} ${S.year || ''}</em></h1></div>${navBar('champ')}${tabs}${body}</div>`;
}
let newsFilter = 'tudo', hofCat = 'f1';
function scrNews() {
  const N = S.world.news.filter((n) => newsFilter === 'tudo' || (newsFilter === 'minha' ? n.cat === S.cat : newsFilter === 'mercado' ? ['mercado', 'contrato', 'interesse', 'talento', 'reforma', 'patrocinio'].includes(n.k) : n.cat === newsFilter));
  const [top, ...rest] = N;
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Notícias <em>· Jornal da Grelha</em></h1></div>${navBar('news')}
  <div class="seg">${[['tudo', 'Tudo'], ['minha', 'A minha categoria'], ['f1', 'Fórmula 1'], ['mercado', 'Mercado']].map(([k, l]) => `<button class="${newsFilter === k ? 'on' : ''}" data-a="newsF" data-v="${k}">${l}</button>`).join('')}</div>
  ${top ? `<div class="card headline"><small class="muted">${NEWS_IC[top.k] || '📰'} ${fmtDay(top.date)} · ${catById(top.cat) ? catById(top.cat).n : ''}</small><h2 class="hl">${esc(top.title)}</h2><p>${esc(top.body)}</p></div>` : '<div class="card"><p class="muted">Ainda não há notícias.</p></div>'}
  <div class="newsgrid">${rest.slice(0, 40).map((n) => `<div class="card news"><small class="muted">${NEWS_IC[n.k] || '📰'} ${fmtDay(n.date)} · ${catById(n.cat) ? catById(n.cat).short : ''}</small><b>${esc(n.title)}</b><p class="muted">${esc(n.body)}</p></div>`).join('')}</div></div>`;
}
function scrProfile() {
  const p = S.profile, A = S.attr, st = S.stats, W = S.world;
  after(() => paintHelmet($('#helmCv'), helmetOf(p)));
  const cats = CAREER.ORDER.filter((c) => S.byCat && S.byCat[c]);
  const rivals = Object.entries(S.rivals || {}).filter(([id]) => W.drivers[id]).sort((a, b) => b[1].heat - a[1].heat).slice(0, 5);
  const teamsRep = [...new Set((S.contracts || []).map((c) => c.name).concat((S.history || []).map((h) => h.team).filter(Boolean)))];
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Piloto <em>· perfil</em></h1></div>${navBar('profile')}
  <div class="grid2"><div class="card"><div class="row"><canvas id="helmCv" width="160" height="160" style="width:84px;height:84px"></canvas><div class="grow"><h3>${flagOf(p.nat)} ${esc(p.first)} ${esc(p.last)}</h3><div class="muted">#${p.num} · ${CAREER.ageOf(S)} anos · ${catById(S.cat).n}</div></div></div>
  <div class="row"><span class="muted" style="min-width:110px">Reputação</span>${meter(S.rep)}<b>${Math.round(S.rep)}</b></div>
  <div class="row"><span class="muted" style="min-width:110px">Capacidade geral</span>${meter(CAREER.playerRating(S))}<b>${Math.round(CAREER.playerRating(S))}</b></div>
  ${Object.entries(CAREER.ATTR_N).map(([k, n]) => `<div class="row"><span class="muted" style="min-width:110px">${n}</span>${meter(A[k])}<b>${Math.round(A[k])}</b></div>`).join('')}
  <p class="muted">Os atributos sobem com corridas, treino físico, simulador e reuniões com os engenheiros. Contam nas sessões simuladas, no interesse das equipas e no desenvolvimento do carro. Superlicença: ${CAREER.superPoints(S)} pontos (precisas de 40 para a F1).</p></div>
  <div class="card"><h2>Carreira</h2><div class="kv"><div><small>Corridas</small><b>${st.races}</b></div><div><small>Vitórias</small><b>${st.wins}</b></div><div><small>Pódios</small><b>${st.podiums}</b></div><div><small>Poles</small><b>${st.poles}</b></div><div><small>V. rápidas</small><b>${st.fl || 0}</b></div><div><small>Títulos</small><b>${st.titles}</b></div><div><small>Pontos</small><b>${st.pts || 0}</b></div><div><small>Desistências</small><b>${st.dnf || 0}</b></div></div>
  ${cats.length ? `<div class="tbl"><table><tr><th>Categoria</th><th>Ép.</th><th>Corr.</th><th>Vit.</th><th>Pód.</th><th>Poles</th><th>Pts</th><th>Títulos</th></tr>${cats.map((c) => { const b = S.byCat[c]; return `<tr><td>${catById(c).n}</td><td>${b.seasons || 0}</td><td>${b.races}</td><td>${b.wins}</td><td>${b.pods}</td><td>${b.poles}</td><td>${b.pts}</td><td>${b.titles}</td></tr>`; }).join('')}</table></div>` : ''}
  <p class="muted">Equipas representadas: ${teamsRep.length ? teamsRep.map(esc).join(', ') : 'nenhuma ainda (karting independente)'}</p></div>
  <div class="card"><h2>Épocas</h2>${S.history.length ? `<div class="tbl"><table><tr><th>Ano</th><th>Categoria</th><th>Equipa</th><th>Pos.</th><th>Vit.</th><th>Pts</th></tr>${S.history.map((h) => `<tr><td>${h.year || ''}</td><td>${catById(h.cat).n}</td><td>${h.team ? esc(h.team) : '—'}</td><td>P${h.pos}</td><td>${h.wins ?? ''}</td><td>${h.pts}</td></tr>`).join('')}</table></div>` : '<p class="muted">Ainda estás na primeira época.</p>'}</div>
  <div class="card"><h2>Rivalidades</h2>${rivals.length ? rivals.map(([id, rv]) => { const d = W.drivers[id]; return `<div class="row"><span class="grow">${flagOf(d.nat)} <b>${esc(d.first + ' ' + d.last)}</b><div class="muted">${CAREER.rivalName(rv.k)} desde ${rv.since} · frente a frente ${rv.h2h[0]}-${rv.h2h[1]} · ${d.cat ? catById(d.cat).short : 'sem lugar'}</div></span>${meter(rv.heat, 100, 'hot')}</div>`; }).join('') : '<p class="muted">Ainda não tens rivais. Aparecem com quem lutas pelas mesmas posições.</p>'}</div></div></div>`;
}
function scrContract() {
  const W = S.world, ct = S.contract && S.contract.cat === S.cat ? S.contract : null, v = CAREER.playerValue(S), nx = CAREER.nextOf(S.cat);
  // interesse estimado das equipas (com base na época atual)
  const interest = (cat, bonus) => W.teams[cat].map((t, i) => [i, v.score + bonus - (72 - CAREER.teamRank(W, cat, i) * 5.5)]).sort((a, b) => b[1] - a[1]);
  const lvl = (x) => (x > 15 ? ['Muito interessada', 'good'] : x > 0 ? ['Interessada', ''] : x > -12 ? ['A observar', 'dim'] : ['Sem interesse', 'dim']);
  const block = (cat, bonus, title) => `<div class="card"><h2>${title}</h2>${interest(cat, bonus).map(([i, x]) => { const [l, c] = lvl(x); return `<div class="row">${teamLogo(cat, i, 24)}<span class="grow">${esc(W.teams[cat][i].name)}</span><span class="tag ${c}">${l}</span></div>`; }).join('')}</div>`;
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>${ct ? 'Contrato' : 'Mercado'}</h1><span class="money">${eur(S.money)}</span></div>${navBar('contract')}
  <div class="grid2">${ct ? `<div class="card"><div class="row">${teamLogo(ct.cat, ct.team, 48)}<div class="grow"><h3>${esc(ct.name)}</h3><div class="muted">${catById(ct.cat).n} · de ${ct.from} a ${ct.until}</div></div></div>
  <div class="kv"><div><small>Salário/corrida</small><b>${eur(ct.salary)}</b></div><div><small>Bónus vitória</small><b>${eur(ct.winBonus)}</b></div><div><small>Bónus pódio</small><b>${eur(ct.podBonus)}</b></div><div><small>Relação</small><b>${(S.teamRel || 0) >= 10 ? 'Muito boa' : (S.teamRel || 0) >= 0 ? 'Boa' : (S.teamRel || 0) > -15 ? 'Tensa' : 'Má'}</b></div></div>
  <div class="row"><span class="tag">Objetivo</span><span class="grow">${esc(ct.goal.txt)}</span><b>${CAREER.contractGoalMet(S) ? '✓ a cumprir' : '✗ por agora não'}</b></div>
  <p class="muted">No fim da época, a equipa avalia o objetivo. Se falhares e a relação estiver má, pode rescindir o contrato.</p></div>`
  : `<div class="card"><h2>Sem contrato</h2><p class="muted">${S.cat === 'kart' ? 'No karting corres por tua conta, com o dinheiro dos prémios e dos patrocinadores. Para subir à Fórmula 4 tens de acabar bem o campeonato e chamar a atenção das equipas. Também podes comprar um lugar numa equipa pequena.' : 'Não tens contrato nesta categoria.'}</p>
  <div class="kv"><div><small>Valor no mercado</small><b>${Math.round(v.score)}</b></div><div><small>Reputação</small><b>${Math.round(S.rep)}</b></div><div><small>Idade</small><b>${CAREER.ageOf(S)}</b></div></div></div>`}
  ${nx ? block(nx, nx === 'f4' ? -15 : -20, `Interesse na ${catById(nx).n}`) : ''}
  ${S.cat !== 'kart' ? block(S.cat, 0, `Interesse na ${catById(S.cat).n}`) : ''}
  <div class="card"><h2>Histórico de contratos</h2>${(S.contracts || []).length ? S.contracts.map((c) => `<div class="row">${teamLogo(c.cat, c.team, 22)}<span class="grow">${esc(c.name)} <span class="muted">· ${catById(c.cat).short} · ${c.from}–${c.until}</span></span><b>${c.paid ? 'lugar pago' : eur(c.salary) + '/corrida'}</b></div>`).join('') : '<p class="muted">Ainda não assinaste nenhum contrato.</p>'}</div></div></div>`;
}
function scrHof() {
  const W = S.world, ch = W.champions[hofCat] || [];
  const all = Object.values(W.drivers).map((d) => ({ name: d.first + ' ' + d.last, nat: d.nat, t: d.by.f1 ? d.by.f1.titles : 0, w: d.by.f1 ? d.by.f1.wins : 0, tt: d.st.titles, tw: d.st.wins, active: !d.retired }));
  const me = S.byCat && S.byCat.f1 ? S.byCat.f1 : { titles: 0, wins: 0 };
  all.push({ name: S.profile.first + ' ' + S.profile.last, nat: S.profile.nat, t: me.titles, w: me.wins, tt: S.stats.titles, tw: S.stats.wins, active: true, me: true });
  const best = all.filter((x) => x.tt || x.tw).sort((a, b) => b.t - a.t || b.w - a.w || b.tt - a.tt || b.tw - a.tw).slice(0, 15);
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Hall of Fame</h1></div>${navBar('hof')}
  <div class="grid2"><div class="card"><h2>Os maiores do jogo</h2><div class="tbl"><table><tr><th>#</th><th>Piloto</th><th>Títulos F1</th><th>Vitórias F1</th><th>Títulos</th><th>Vitórias</th></tr>${best.map((x, k) => `<tr class="${x.me ? 'me' : ''}"><td class="pos">${k + 1}</td><td>${flagOf(x.nat)} ${esc(x.name)}${x.active ? '' : ' <span class="muted">(retirado)</span>'}</td><td>${x.t}</td><td>${x.w}</td><td>${x.tt}</td><td>${x.tw}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">Ainda ninguém ganhou nada nesta carreira.</td></tr>'}</table></div></div>
  <div class="card"><h2>Campeões anteriores</h2><div class="seg">${CAREER.ORDER.map((c) => `<button class="${hofCat === c ? 'on' : ''}" data-a="hofCat" data-v="${c}">${catById(c).short}</button>`).join('')}</div>
  ${ch.slice().reverse().map((x) => `<div class="row ${x.me ? 'me' : ''}"><b style="min-width:44px">${x.year}</b><span class="grow">${flagOf(x.nat)} ${esc(x.name)}${x.team ? ` <span class="muted">· ${esc(x.team)}</span>` : ''}</span><b>${x.past ? '' : x.pts + ' pts'}</b></div>`).join('')}</div></div></div>`;
}
function scrCareer() {
  const st = S.stats;
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Carreira</h1></div>${navBar('career')}
  <div class="grid2"><div class="card"><h2>Estatísticas</h2><div class="kv"><div><small>Corridas</small><b>${st.races}</b></div><div><small>Vitórias</small><b>${st.wins}</b></div><div><small>Pódios</small><b>${st.podiums}</b></div><div><small>Poles</small><b>${st.poles}</b></div><div><small>Títulos</small><b>${st.titles}</b></div></div></div>
  <div class="card"><h2>Percurso</h2>${S.history.length ? S.history.map((h) => `<div class="row"><b>Época ${h.season}</b><span class="grow">${catById(h.cat).n}${h.team ? ' · ' + h.team : ''}</span><span>P${h.pos} · ${h.pts} pts</span></div>`).join('') : '<p class="muted">Ainda estás na primeira época.</p>'}
  <p class="muted">Caminho: Karting → Fórmula 4 → Fórmula 3 → Fórmula 2 → Fórmula 1.</p></div></div></div>`;
}
// fim de semana: escolher pneus e qualificação
let weekend = null;
const FMT = () => CAREER.FORMAT[S.cat];
const wkSprint = () => CAREER.hasSprint(S.cat, S.calendar[S.round].name);
function stageGrid(stage) {
  const q = weekend.grid.map((g) => g.id), F = FMT();
  if (stage === 'sprint') { const rev = F.sprint.rev; return rev ? q.slice(0, rev).reverse().concat(q.slice(rev)) : q; }
  if (S.cat === 'kart' && weekend.sprintRes) return weekend.sprintRes.slice(); // a final parte pela ordem da pré-final
  return q;
}
function scrWeekend() {
  const rd = S.calendar[S.round], C = catById(S.cat), F = FMT(), spr = wkSprint();
  if (!(weekend && weekend.round === S.round)) {
    const r = Math.random(), wx = r < 0.66 ? { start: 0, end: 0, at: 0.5, txt: '☀️ Seco' } : r < 0.82 ? { start: 0.75, end: 0.7, at: 0.5, txt: '🌧️ Chuva durante a corrida' } : r < 0.92 ? { start: 0, end: 0.8, at: 0.3 + Math.random() * 0.3, txt: '🌦️ Seco no início, chuva a meio' } : { start: 0.7, end: 0, at: 0.25 + Math.random() * 0.3, txt: '🌤️ Molhado no início, depois seca' };
    weekend = { round: S.round, grid: null, tyre: wx.start > 0.3 ? (C.pits ? 'I' : 'W') : 'M', quali: null, weather: wx, goal: S.sponsor ? makeGoal() : null, sprintRes: null, fp: false };
  }
  after(() => drawTrackPreview($('#trkCv'), getTrack(rd.name, S.cat)));
  const grid = weekend.grid, sdone = !!weekend.sprintRes;
  const step = (ok, now, ic, name, extra) => `<div class="wkstep ${ok ? 'done' : now ? 'now' : ''}"><span class="ic">${ok ? '✓' : ic}</span><div class="grow"><b>${name}</b>${extra ? `<div class="muted">${extra}</div>` : ''}</div></div>`;
  const steps = step(weekend.fp, !grid, '1', 'Treinos livres', 'Opcional: conhecer a pista') + step(!!grid, !grid, '2', 'Qualificação', grid ? `Partes em P${grid.findIndex((g) => g.id === 'me') + 1}` : '')
    + (spr ? step(sdone, grid && !sdone, '3', F.sprint.n, F.sprint.rev ? `Grelha invertida nos ${F.sprint.rev} primeiros · ${F.sprint.pts.length ? 'pontos: ' + F.sprint.pts.join('-') : 'sem pontos, decide a grelha da final'}` : F.sprint.pts.length ? 'pontos: ' + F.sprint.pts.join('-') : 'decide a grelha da final') : '')
    + step(false, grid && (!spr || sdone), spr ? '4' : '3', F.main.n, `pontos: ${F.main.pts.slice(0, 10).join('-')}${F.pole ? ` · pole +${F.pole}` : ''}${F.fl ? ` · volta mais rápida +${F.fl}` : ''}`);
  const nextStage = !grid ? null : spr && !sdone ? 'sprint' : 'main';
  const lapsOf = (st) => (st === 'sprint' ? Math.max(2, Math.round(C.laps[S.settings.length] * F.sprint.laps)) : C.laps[S.settings.length]);
  const gridHtml = grid ? `<div class="card"><h2>Grelha · ${nextStage === 'sprint' ? F.sprint.n : F.main.n}</h2><div class="tbl"><table><tr><th>Pos</th><th>Piloto</th><th>${nextStage === 'main' && S.cat === 'kart' && sdone ? 'Pré-final' : 'Qualif.'}</th></tr>${stageGrid(nextStage).map((id, k) => { const d = driverById(id), g = grid.find((x) => x.id === id); return `<tr class="${id === 'me' ? 'me' : ''}"><td class="pos">${k + 1}</td><td><span class="teamdot" style="background:${d.c1}"></span>${flagOf(d.nat)} ${esc(d.first[0] + '. ' + d.last)}</td><td>${g ? fmtTime(g.t) : ''}</td></tr>`; }).join('')}</table></div></div>` : '';
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>${flagOf(rd.nat)} ${rd.name}</h1></div>
  <div class="grid2"><div class="card"><h2>Ronda ${S.round + 1} de ${S.calendar.length}${rd.date ? ' · ' + fmtDay(rd.date) : ''}</h2><canvas class="trackprev" id="trkCv" width="600" height="300"></canvas>
  <div class="muted">${(getTrack(rd.name, S.cat).len / 1000).toFixed(3)} km · ${F.main.n}: ${lapsOf('main')} voltas${spr ? ` · ${F.sprint.n}: ${lapsOf('sprint')} voltas` : ''}</div>
  <div class="row"><b>Previsão:</b><span class="grow">${weekend.weather.txt}</span></div>
  ${weekend.goal ? `<div class="row"><span class="tag">${esc(S.sponsor.name)}</span><span class="grow muted">Objetivo: ${weekend.goal.txt} · prémio ${eur(weekend.goal.pay)}</span></div>` : ''}
  <div class="wksteps">${steps}</div>
  ${!grid ? `<button class="btn" data-a="practice">Treinos livres</button><button class="btn primary" data-a="quali">Qualificação: fazer a minha volta</button><button class="btn" data-a="qualiSim">Simular a qualificação</button>` : ''}
  ${nextStage ? `<h2>Pneus para a partida</h2><div class="seg">${tyreChoices(C).map((k) => { const c = COMPOUNDS[k]; return `<button class="${weekend.tyre === k ? 'on' : ''}" data-a="tyre" data-v="${k}"><span class="cmp" style="border-color:${c.c}"></span>${C.pits || k === 'W' ? c.n : 'Slicks (seco)'}</button>`; }).join('')}</div>
  <p class="muted">${C.pits ? `Macios: rápidos mas gastam depressa. Duros: lentos mas duram. Intermédios e chuva: para pista molhada. ${C.mandatory ? 'Na corrida principal em seco tens de usar dois tipos de pneus.' : 'Podes parar nas boxes quando quiseres, pelo rádio.'}` : 'Nesta categoria não há paragens: escolhe bem os pneus para o tempo que vai fazer.'}${S.cat !== 'kart' ? ' O carro leva o combustível certo para a corrida: no modo ataque gastas mais.' : ''}</p>
  <button class="btn go" data-a="race" data-v="${nextStage}">Para a grelha: ${nextStage === 'sprint' ? F.sprint.n : F.main.n}</button><button class="btn" data-a="simRace" data-v="${nextStage}">Simular ${nextStage === 'sprint' ? 'a ' + F.sprint.n.toLowerCase() : 'a corrida'}</button>` : ''}</div>${gridHtml}</div></div>`;
}
function tyreChoices(C) { return C.pits ? ['S', 'M', 'H', 'I', 'W'] : ['M', 'W']; }
// objetivos dos patrocinadores
function makeGoal() {
  const C = catById(S.cat), r = Math.random(), pay = Math.round(C.prize * (0.6 + Math.random() * 0.6));
  const tm = S.cat !== 'kart';
  if (r < 0.3) { const n = [3, 5, 8, 10][Math.floor(Math.random() * 4)]; return { k: 'top', v: n, txt: `acabar no top ${n}`, pay: Math.round(pay * (12 - n) / 6) }; }
  if (r < 0.5) { const n = 2 + Math.floor(Math.random() * 3); return { k: 'gain', v: n, txt: `ganhar ${n} posições em relação à partida`, pay }; }
  if (r < 0.65) return { k: 'fast', txt: 'fazer a volta mais rápida', pay: pay * 1.5 };
  if (r < 0.82 && tm) return { k: 'mate', txt: 'acabar à frente do colega de equipa', pay };
  return { k: 'clean', txt: 'acabar sem danos no carro', pay: Math.round(pay * 0.8) };
}
function scrSponsor() {
  const mine = S.sponsors || [];
  if (!S.spOffers || S.spOffers.round !== S.round || S.spOffers.year !== S.year) S.spOffers = { round: S.round, year: S.year, list: CAREER.sponsorOffers(S, 3) };
  const offers = S.spOffers.list, full = mine.length >= 3;
  const card = (o, k, own) => `<div class="card sponsor"><div class="row">${CAREER.logo(o.name, o.c, '#ffffff', o.shape || 0, 44)}<div class="grow"><h3>${esc(o.name)}</h3><div class="muted">${own ? `contrato até ${o.until}` : `${o.years} época${o.years > 1 ? 's' : ''} · reputação mínima ${o.minRep}`}</div></div></div>
  <div class="kv"><div><small>Por corrida</small><b>${eur(o.perRace)}</b></div><div><small>Vitória</small><b>+${eur(o.winBonus)}</b></div><div><small>Pódio</small><b>+${eur(o.podBonus)}</b></div>${own ? '' : `<div><small>Assinatura</small><b>${eur(o.sign)}</b></div>`}</div>
  ${own ? `<div class="row"><span class="muted" style="min-width:80px">Satisfação</span>${meter(o.happy, 100, o.happy < 35 ? 'hot' : '')}<b>${Math.round(o.happy)}</b></div>` : `<button class="btn primary" data-a="sponsor" data-v="${k}" ${full ? 'disabled' : ''}>Assinar com ${esc(o.name)}</button>`}</div>`;
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Patrocínios</h1><span class="money">${eur(S.money)}</span></div>${navBar('sponsors')}
  <h2>Os teus patrocinadores (${mine.length}/3)</h2><div class="grid2">${mine.map((o) => card(o, 0, true)).join('') || '<div class="card"><p class="muted">Ainda não tens patrocinadores.</p></div>'}</div>
  <h2>Propostas</h2><p class="muted">Com mais reputação aparecem marcas maiores. Os patrocinadores ficam contentes com bons resultados e presença nos eventos; se ficarem descontentes ou a tua reputação cair, vão-se embora no fim da época.</p>
  <div class="grid2">${offers.length ? offers.map((o, k) => card(o, k, false)).join('') : '<div class="card"><p class="muted">Nenhuma marca está interessada por agora. Melhora os resultados e a reputação.</p></div>'}</div></div>`;
}
function checkGoal(goal, res, mine, R) {
  if (!goal) return false;
  const startPos = (weekend && weekend.grid ? weekend.grid.findIndex((g) => g.id === 'me') : R.cars.length - 1) + 1;
  if (mine.dnf || mine.out) return false;
  if (goal.k === 'top') return mine.pos <= goal.v;
  if (goal.k === 'gain') return startPos - mine.pos >= goal.v;
  if (goal.k === 'fast') return R.fastest && R.fastest.id === 'me';
  if (goal.k === 'mate') { const tm = R.teammate && R.teammate(); const t = tm && res.find((r) => r.id === tm.id); return !!t && t.pos > mine.pos; }
  if (goal.k === 'clean') return R.me.dmg < 0.1;
  return false;
}
const weekendStart = () => (lastRace && lastRace.startPos) || '-';
function scrResults(res, info) {
  return `<div class="screen"><div class="topbar"><h1>${info.stageName ? esc(info.stageName) : 'Resultado'} <em>· ${info.track}</em></h1>${info.quick ? '' : `<span class="money">+${eur(info.money)}</span>`}</div>
  <div class="grid2"><div class="card"><h2>Classificação da corrida</h2><div class="tbl"><table><tr><th>Pos</th><th>Piloto</th><th>Tempo</th><th>Melhor volta</th><th>Pts</th></tr>
  ${res.map((r) => `<tr class="${r.isPlayer ? 'me' : ''}"><td class="pos">${r.pos}</td><td><span class="teamdot" style="background:${r.d.c1}"></span>${flagOf(r.d.nat)} ${esc(r.d.first[0] + '. ' + r.d.last)}${r.penalty ? ` <span class="tag">+${r.penalty}s</span>` : ''}</td><td>${r.dnf ? 'Desistiu' : r.gapTxt}</td><td style="${info.fastest === r.id ? 'color:var(--purple);font-weight:700' : ''}">${fmtTime(r.best)}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table></div></div>
  <div class="card"><h2>O teu dia</h2><h3>${info.why ? ({ mec: '🔧 Avaria mecânica', acid: '💥 Acidente', fuel: '⛽ Sem combustível' }[info.why] || 'Desististe') : info.pos <= 3 ? ['🥇 Vitória!', '🥈 Segundo lugar', '🥉 Terceiro lugar'][info.pos - 1] : 'P' + info.pos}</h3>
  ${info.quick ? `<div class="kv"><div><small>Pontos</small><b>${info.pts}</b></div><div><small>Partiste</small><b>P${weekendStart(info)}</b></div></div>` : `<div class="kv"><div><small>Pontos</small><b>+${info.pts}</b></div><div><small>Prémio</small><b>${eur(info.money)}</b></div><div><small>Campeonato</small><b>P${info.champ}</b></div></div>`}
  ${info.breakdown ? `<div class="money-list">${info.breakdown.map(([n, v]) => `<div class="row"><span class="grow muted">${esc(n)}</span><b>${eur(v)}</b></div>`).join('')}</div>` : ''}
  ${info.goal && S.sponsor ? `<p class="muted">${esc(S.sponsor.name)}: ${info.goal.txt} — ${info.goalOk ? `<b style="color:var(--green)">cumprido! +${eur(info.goal.pay)}</b>` : 'não cumprido'}</p>` : ''}
  ${info.replay ? '<button class="btn" data-a="replay">🎬 Ver repetição</button>' : ''}
  ${info.quick ? '<button class="btn primary" data-a="quickAgain">Correr outra vez</button><button class="btn" data-a="quick">Mudar a corrida</button><button class="btn" data-a="home">Menu principal</button>' : info.sprint ? '<button class="btn primary" data-a="weekend">Voltar ao fim de semana</button>' : '<button class="btn primary" data-a="hub">Voltar ao paddock</button>'}</div></div></div>`;
}
// fim de época: fecha o campeonato, avalia o contrato e abre o mercado
function closeMySeason() {
  if (S.closed) return;
  S.closed = true;
  const W = S.world, ch = champTable(), pos = ch.meIdx + 1, C = catById(S.cat), t = teamOf(S.team);
  CAREER.closeSeason(S);
  S.history.push({ season: S.season, year: S.year, cat: S.cat, pos, pts: S.points.me, wins: S.wins.me, team: t ? t[0] : null });
  const b = bc(); b.seasons = (b.seasons || 0) + 1;
  S.rep = S.rep * 0.92; // a fama esquece-se um pouco de uma época para a outra
  if (pos === 1) { S.stats.titles++; b.titles++; CAREER.addRep(S, 10 + CAREER.catIdx(S.cat) * 3); } else if (pos <= 3) CAREER.addRep(S, 4); else if (pos > ch.rows.length / 2) CAREER.addRep(S, -3);
  S.money += pos <= 3 ? [5, 3, 2][pos - 1] * C.prize : 0;
  // contrato: objetivo cumprido? a equipa pode dispensar-te
  const ct = S.contract && S.contract.cat === S.cat ? S.contract : null;
  if (ct) {
    const met = CAREER.contractGoalMet(S); ct.met = met;
    if (met) { CAREER.addRep(S, 3); S.teamRel = (S.teamRel || 0) + 5; } else { S.teamRel = (S.teamRel || 0) - 8; CAREER.addRep(S, -2); }
    if (ct.until > S.year && !met && (S.teamRel || 0) < -10) { ct.released = true; CAREER.news(S, 'contrato', `${t[0]} dispensa ${S.profile.first} ${S.profile.last}`, `A equipa rescindiu o contrato: o objetivo (${ct.goal.txt.toLowerCase()}) não foi cumprido.`); }
  }
  CAREER.sponsorsSeasonEnd(S);
  S.offers = CAREER.seasonOffers(S);
  // renovação com a equipa atual, se o contrato acabou e a relação é boa
  if (ct && ct.until <= S.year && !ct.released && (S.teamRel || 0) > -12 && pos <= ch.rows.length * 0.7) { const o = CAREER.makeOffer(S, S.cat, S.team, 12 + (S.teamRel || 0) / 2); o.renew = true; S.offers.unshift(o); }
  if (S.offers.some((o) => CAREER.catIdx(o.cat) > CAREER.catIdx(S.cat) && !o.paid)) CAREER.news(S, 'interesse', `${S.profile.last} tem propostas da ${catById(CAREER.nextOf(S.cat)).n}`, 'Depois de uma boa época, as equipas da categoria seguinte querem o piloto.');
  save();
}
let negK = null, negMsg = '';
function offerCard(o, k) {
  const t = S.world.teams[o.cat][o.team], up = CAREER.catIdx(o.cat) - CAREER.catIdx(S.cat);
  if (o.withdrawn) return `<div class="card offer off"><div class="row">${teamLogo(o.cat, o.team, 40)}<div class="grow"><b>${esc(o.name)}</b><div class="muted">Proposta retirada</div></div></div></div>`;
  const neg = negK === k ? `<div class="negbox"><div class="muted">Salário pedido</div><div class="seg">${[1, 1.1, 1.2, 1.35].map((m) => `<button class="${(o.ask || 1) === m ? 'on' : ''}" data-a="negMul" data-v="${m}">${m === 1 ? 'Igual' : '+' + Math.round((m - 1) * 100) + '%'}</button>`).join('')}</div>
    <div class="muted">Duração</div><div class="seg">${[1, 2, 3].map((y) => `<button class="${(o.askY || o.years) === y ? 'on' : ''}" data-a="negYears" data-v="${y}">${y} época${y > 1 ? 's' : ''}</button>`).join('')}</div>
    <button class="btn primary" data-a="negSend">Fazer a proposta</button>${negMsg ? `<p class="muted">${esc(negMsg)}</p>` : ''}</div>` : '';
  return `<div class="card offer ${o.agreed ? 'agreed' : ''}"><div class="row">${teamLogo(o.cat, o.team, 44)}<div class="grow"><h3>${esc(o.name)}</h3><div class="muted">${catById(o.cat).n}${up > 0 ? ' · <b class="up">PROMOÇÃO</b>' : up < 0 ? ' · desces de categoria' : o.renew ? ' · renovação' : ' · transferência'} · ${o.rank + 1}.ª equipa mais rápida · orçamento ${stars(t.budget)}</div></div></div>
  <div class="kv"><div><small>Duração</small><b>${o.years} época${o.years > 1 ? 's' : ''}</b></div><div><small>Salário/corrida</small><b>${o.paid ? '—' : eur(o.salary)}</b></div><div><small>Vitória</small><b>+${eur(o.winBonus)}</b></div><div><small>Pódio</small><b>+${eur(o.podBonus)}</b></div></div>
  <div class="muted">Objetivo: ${esc(o.goal.txt)}${o.paid ? ` · <b>lugar pago: ${eur(o.paid)}</b>` : ''}</div>
  <div class="seg">${o.paid ? `<button class="btn primary" data-a="accept" data-v="${k}" ${S.money < o.paid ? 'disabled' : ''}>Pagar e assinar</button>` : `<button class="btn primary" data-a="accept" data-v="${k}">Assinar</button>${o.agreed ? '' : `<button class="btn" data-a="neg" data-v="${k}">Negociar</button>`}`}</div>${neg}</div>`;
}
function scrSeasonEnd() {
  closeMySeason();
  const W = S.world, ch = champTable(), pos = ch.meIdx + 1, C = catById(S.cat), ct = S.contract && S.contract.cat === S.cat ? S.contract : null;
  const stays = ct && ct.until > S.year && !ct.released, sl = CAREER.superPoints(S), nx = CAREER.nextOf(S.cat);
  const title = pos === 1 ? (S.cat === 'f1' ? '🏆 Campeão do Mundo de Fórmula 1!' : `🏆 Campeão de ${C.n}!`) : `Terminaste em P${pos}`;
  const champs = CAREER.ORDER.map((c) => W.champions[c].filter((x) => x.year === S.year).pop()).filter(Boolean);
  return `<div class="screen"><div class="topbar"><h1>Fim da época <em>· ${C.n} ${S.year}</em></h1><span class="money">${eur(S.money)}</span></div>
  <div class="grid2"><div class="card"><h2>A tua época</h2><h3>${title}</h3>
  <div class="kv"><div><small>Pontos</small><b>${S.points.me}</b></div><div><small>Vitórias</small><b>${S.wins.me}</b></div><div><small>Reputação</small><b>${Math.round(S.rep)}</b></div><div><small>Idade</small><b>${CAREER.ageOf(S)}</b></div>${S.cat !== 'kart' ? `<div><small>Superlicença</small><b>${sl}/40</b></div>` : ''}</div>
  ${ct ? `<p class="muted">Objetivo do contrato (${esc(ct.goal.txt.toLowerCase())}): ${ct.met ? '<b style="color:var(--green)">cumprido</b>' : '<b style="color:var(--red)">falhado</b>'}${ct.released ? ' · <b>a equipa dispensou-te</b>' : ''}</p>` : ''}
  ${nx === 'f1' && sl < 40 ? '<p class="muted">Para a Fórmula 1 precisas de 40 pontos de superlicença nas últimas 3 épocas (os melhores lugares na F2, F3 e F4 dão pontos) e de 18 anos.</p>' : ''}
  <h2>Campeões ${S.year}</h2>${champs.map((x) => `<div class="row"><span class="tag">${catById(CAREER.ORDER.find((c) => W.champions[c].includes(x))).short}</span><span class="grow">${flagOf(x.nat)} ${esc(x.name)}${x.team ? ` <span class="muted">· ${esc(x.team)}</span>` : ''}</span><b>${x.pts}</b></div>`).join('')}</div>
  <div class="card"><h2>O teu futuro</h2>
  ${stays ? `<div class="row"><span class="grow">Tens contrato com a <b>${esc(ct.name)}</b> até ${ct.until}.</span><button class="btn primary small" data-a="stay">Cumprir o contrato</button></div><p class="muted">Se assinares por outra equipa, ela paga a tua saída.</p>` : ''}
  ${S.cat === 'kart' ? '<div class="row"><span class="grow">Continuar no karting mais uma época.</span><button class="btn small" data-a="kartAgain">Nova época de karting</button></div>' : ''}
  ${S.offers.length ? '' : '<p class="muted">Nenhuma equipa te fez proposta.</p>'}
  ${!stays && S.cat !== 'kart' && !S.offers.some((o) => !o.withdrawn) ? '<button class="btn" data-a="findSeat">Procurar lugar numa equipa pequena</button>' : ''}</div></div>
  <h2>Propostas (${S.offers.filter((o) => !o.withdrawn).length})</h2><div class="grid2">${S.offers.map((o, k) => offerCard(o, k)).join('')}</div></div>`;
}
function startNextSeason(seat) {
  CAREER.advanceYear(S, seat);
  if (seat) newSeason(seat.cat, seat.team); else newSeason(S.cat === 'kart' ? 'kart' : S.cat, S.cat === 'kart' ? null : S.team);
  S.today = S.events[0] ? addDays(S.events[0].date, -2) : S.today; S.pending = null; S.choiceMsg = null;
  save(); show(scrHub);
}

// ---------- ações ----------
const readDraft = () => { const f = $('#fFirst'); if (!f) return; draft.first = f.value.trim(); draft.last = $('#fLast').value.trim(); draft.nat = $('#fNat').value; draft.num = clamp(parseInt($('#fNum').value, 10) || 7, 1, 99); };
const ACT = {
  home: () => { leaveQuick(); show(scrHome); },
  quick: () => { show(scrQuick); },
  qs: (v) => { const [k, val] = v.split('|'); if (k === 'diff') { ST().diff = val; if (S) save(); } else if (k === 'cat') { QS.cat = val; QS.team = Math.min(QS.team, 9); QS.len = Math.min(QS.len, 2); } else QS[k] = k === 'len' ? +val : val; rerender(); },
  quickGo: () => { quickSetup(); startSession('race'); },
  quickAgain: () => { quickSetup(); startSession('race'); },
  newCareer: () => { draft = null; show(scrNew, 1); },
  newStep2: () => { readDraft(); if (!draft.first || !draft.last) { alertBox('Escreve o teu nome e apelido.'); return; } show(scrNew, 2); },
  newBack: () => show(scrNew, 1),
  startCareer: () => { newCareer({ ...draft, helmet: { ...draft.helmet } }); S.owned = Array.from(new Set(['liso', 'faixa', draft.helmet.pattern])); save(); show(scrHub); },
  hub: () => show(scrHub), garage: () => show(scrGarage), helmet: () => show(scrHelmet), champ: () => show(scrChamp), career: () => show(scrCareer), settings: () => show(scrSettings),
  set: (v) => { const [k, val] = v.split('|'); ST()[k] = isNaN(+val) || ['controls', 'diff', 'cam', 'units', 'gfx'].includes(k) ? val : +val; if (S) save(); readDraft(); rerender(); },
  tog: (k) => { ST()[k] = !ST()[k]; if (S) save(); readDraft(); rerender(); },
  hcol: (v) => { const [k, c] = v.split('|'); const p = S && screen[0] !== scrNew ? S.profile : draft; if (c === '-') delete p.helmet[k]; else p.helmet[k] = c; if (S) save(); rerender(); },
  hopt: (v) => {
    const [k, val] = v.split('|'), list = k === 'visor' ? HELMET_VISORS : HELMET_FINISH, it = list.find((x) => x.k === val), id = (k === 'visor' ? 'v:' : 'f:') + val;
    const career = S && screen[0] !== scrNew, p = career ? S.profile : draft;
    if (career && it.cost && !S.owned.includes(id)) { if (S.money < it.cost) { alertBox(`Precisas de ${eur(it.cost)}.`); return; } S.money -= it.cost; S.owned.push(id); }
    p.helmet[k] = val; if (career) save(); rerender();
  },
  htog: (v) => { const [k, def] = v.split('|'), p = S && screen[0] !== scrNew ? S.profile : draft; p.helmet[k] = !(p.helmet[k] ?? def === '1'); if (S && screen[0] !== scrNew) save(); rerender(); },
  hpat: (k) => {
    if (S && screen[0] !== scrNew) {
      const pat = HELMET_PATTERNS.find((x) => x.k === k);
      if (!S.owned.includes(k)) { if (S.money < pat.cost) { alertBox(`Precisas de ${eur(pat.cost)} para este desenho.`); return; } S.money -= pat.cost; S.owned.push(k); }
      S.profile.helmet.pattern = k; save();
    } else draft.helmet.pattern = k;
    rerender();
  },
  calendar: () => show(scrCalendar),
  champTab: (k) => { champTab = k; rerender(); },
  nextDay: () => { const e = nextEvent(); if (!e || S.today >= e.date || S.pending) return; S.today = addDays(S.today, 1); S.choiceMsg = null; S.dayNote = null; if (S.today !== e.date) { S.pending = CAREER.dayEvent(S); if (!S.pending) S.dayNote = DAY_NOTES[Math.floor(Math.random() * DAY_NOTES.length)]; } save(); rerender(); },
  choose: (k) => { const ev = S.pending; if (!ev) return; const eff = ev.ch[+k][1]; const lines = CAREER.applyChoice(S, ev, eff); if (eff.team) { S.teamRel = (S.teamRel || 0) + eff.team; lines.push(eff.team > 0 ? 'A equipa gostou' : 'A equipa não gostou'); } S.choiceMsg = lines.length ? lines : ['Sem efeitos especiais.']; S.pending = null; save(); rerender(); },
  news: () => show(scrNews), profile: () => show(scrProfile), contract: () => show(scrContract), hof: () => show(scrHof),
  newsF: (v) => { newsFilter = v; rerender(); }, hofCat: (v) => { hofCat = v; rerender(); },
  skipDays: () => { const e = nextEvent(); if (!e || S.pending) return; S.today = e.date; S.dayNote = null; S.choiceMsg = null; save(); rerender(); },
  launch: () => show(scrLaunch),
  launchDone: () => { S.launchDone = true; S.today = S.events[0].date; save(); show(scrHub); },
  oficina: () => { const e = nextEvent(); if (!e || e.t !== 'oficina') { show(scrGarage); return; } S.today = e.date; S.oficinaOpen = e.r; if (S.cat !== 'kart') { S.devLeft = CAREER.devPoints(S) + (S.devBonus || 0); S.devBonus = 0; } save(); show(scrGarage); },
  upPart: (v) => { if (!oficinaOpen()) return; const [k, how] = v.split('|'); S.car = S.car || {}; const lv = S.car[k] || 0; if (lv >= 5) return; if (how === 'team') { if (!(S.devLeft > 0)) return; S.devLeft--; } else { const c = CAREER.partCost(S, k); if (S.money < c) return; S.money -= c; } S.car[k] = lv + 1; CAREER.addRep(S, 0.2); save(); rerender(); },
  oficinaDone: () => { if (oficinaOpen()) S.offDone.push(S.round); S.oficinaOpen = null; save(); show(scrHub); },
  buyPart: (k) => { if (!oficinaOpen()) return; const pt = KART_PARTS.find((x) => x.k === k), lv = S.kart[k]; if (lv >= 5 || S.money < pt.cost[lv]) return; S.money -= pt.cost[lv]; S.kart[k]++; save(); rerender(); },
  dev: () => { if (!oficinaOpen()) return; const C = catById(S.cat), cost = Math.round(C.salary * 3 * (1 + S.dev * 0.6)); if (S.dev >= 5 || S.money < cost) return; S.money -= cost; S.dev++; save(); rerender(); },
  wipe: () => confirmBox('Apagar a carreira? Não dá para desfazer.', () => { try { localStorage.removeItem(SAVE); } catch (e) { /* */ } S = null; show(scrHome); }),
  weekend: () => { const e = nextEvent(); if (e && e.t === 'oficina') { alertBox('Primeiro há o dia de oficina.'); return; } if (e && e.t === 'launch') { show(scrLaunch); return; } const rd = S.calendar[S.round]; if (rd && rd.date && S.today < addDays(rd.date, -2)) { S.today = addDays(rd.date, -2); save(); } show(scrWeekend); },
  tyre: (k) => { weekend.tyre = k; rerender(); },
  quali: () => startSession('quali'),
  qualiSim: () => { weekend.grid = simQuali(null); poleNote(); rerender(); },
  race: (v) => startSession('race', v || 'main'),
  simRace: (v) => simulateRace(v || 'main'),
  practice: () => startSession('practice'),
  replay: () => startReplay(),
  sponsors: () => show(scrSponsor),
  sponsor: (k) => { const o = S.spOffers && S.spOffers.list[+k]; if (!o || (S.sponsors || []).length >= 3) return; CAREER.signSponsor(S, o); S.spOffers.list.splice(+k, 1); CAREER.news(S, 'patrocinio', `${o.name} patrocina ${S.profile.last}`, `Contrato de ${o.years} época${o.years > 1 ? 's' : ''}, ${eur(o.perRace)} por corrida.`); save(); rerender(); },
  seasonEnd: () => show(scrSeasonEnd),
  accept: (k) => {
    const o = S.offers[+k]; if (!o || o.withdrawn) return; if (o.paid) { if (S.money < o.paid) return; S.money -= o.paid; }
    const y = S.world.year + 1, prev = S.contract;
    S.contract = { cat: o.cat, team: o.team, name: o.name, from: y, until: y + o.years - 1, salary: o.salary, winBonus: o.winBonus, podBonus: o.podBonus, goal: o.goal, paid: o.paid };
    S.contracts = S.contracts || []; S.contracts.push({ ...S.contract });
    S.teamRel = o.renew ? (S.teamRel || 0) : 0;
    CAREER.news(S, 'contrato', `${S.profile.first} ${S.profile.last} ${o.renew ? 'renova com' : 'assina pela'} ${o.name}`, `${catById(o.cat).n}, ${o.years} época${o.years > 1 ? 's' : ''}${o.paid ? ', num lugar pago' : `, ${eur(o.salary)} por corrida`}.${prev && prev.until >= y && prev.team !== o.team ? ' A nova equipa pagou a saída do contrato anterior.' : ''}`, o.cat);
    negK = null; negMsg = ''; startNextSeason({ cat: o.cat, team: o.team });
  },
  stay: () => { startNextSeason({ cat: S.cat, team: S.team }); },
  kartAgain: () => { startNextSeason(null); },
  findSeat: () => { const W = S.world, cat = S.cat, pv = CAREER.prevOf(cat); const weak = W.teams[cat].map((t, i) => i).sort((a, b) => CAREER.teamRank(W, cat, b) - CAREER.teamRank(W, cat, a)).slice(0, 2); S.offers.push(...weak.map((i) => CAREER.makeOffer(S, cat, i, 0, { paid: true, years: 1 }))); if (pv && pv !== 'kart') S.offers.push(CAREER.makeOffer(S, pv, W.teams[pv].map((t, i) => i)[Math.floor(Math.random() * 10)], 15)); save(); rerender(); },
  neg: (k) => { negK = +k; negMsg = ''; rerender(); },
  negMul: (v) => { S.offers[negK].ask = +v; rerender(); }, negYears: (v) => { S.offers[negK].askY = +v; rerender(); },
  negSend: () => { const o = S.offers[negK]; const r = CAREER.negotiate(o, o.ask || 1, o.askY || o.years); negMsg = r.txt; if (r.ok || o.withdrawn) negK = null; if (!r.ok && o.withdrawn) alertBox(r.txt); else if (r.ok) alertBox(r.txt); save(); rerender(); },
};
const CHG = {
  qtrack: (v) => { QS.track = +v; },
  qteam: (v) => { QS.team = +v; MENU3D.setCar(showroomCar(QS.cat)); },
  first: (v) => { S.profile.first = v.trim() || S.profile.first; save(); },
  last: (v) => { S.profile.last = v.trim() || S.profile.last; save(); },
  nat: (v) => { S.profile.nat = v; save(); },
  num: (v) => { S.profile.num = clamp(parseInt(v, 10) || S.profile.num, 1, 99); save(); },
  sens: (v) => { ST().sens = +v; if (S) save(); },
  vol: (v) => { ST().vol = +v; AUDIO.setVolume(+v); if (S) save(); },
};
function alertBox(text) {
  const d = document.createElement('div'); d.className = 'overlay'; d.style.position = 'fixed';
  d.innerHTML = `<div class="box"><p>${esc(text)}</p><button class="btn primary">OK</button></div>`;
  d.querySelector('button').onclick = () => d.remove(); document.body.appendChild(d);
}
function confirmBox(text, yes) {
  const d = document.createElement('div'); d.className = 'overlay'; d.style.position = 'fixed';
  d.innerHTML = `<div class="box"><p>${esc(text)}</p><button class="btn primary" data-y>Sim</button><button class="btn" data-n>Cancelar</button></div>`;
  d.querySelector('[data-y]').onclick = () => { d.remove(); yes(); }; d.querySelector('[data-n]').onclick = () => d.remove(); document.body.appendChild(d);
}

// ---------- qualificação simulada ----------
function simQuali(myTime) {
  const rd = S.calendar[S.round], T = getTrack(rd.name, S.cat), diff = DIFF[S.settings.diff];
  const wet = weekend && weekend.weather && weekend.weather.start > 0.3 ? 1 : 0;
  const list = S.drivers.map((d) => ({ id: d.id, t: speedProfile(T, aiParams(d)).lap / (d.skill * diff * (1 + wet * ((d.wet || 50) - 50) * 0.00008)) * (1 + (Math.random() - 0.5) * 0.006 * (1.3 - (d.cons ?? 0.6))) }));
  const refLap = S.cat === 'kart' ? speedProfile(T, carParams('kart', { power: 1, grip: 1, brake: 1 })).lap / carPerf('me') : speedProfile(T, playerParams()).lap;
  const mine = myTime ?? refLap / (CAREER.skillOf(CAREER.playerRating(S)) * 0.952 / 0.955 * 0.955 * (1 + (Math.random() - 0.5) * 0.008));
  list.push({ id: 'me', t: mine });
  list.sort((a, b) => a.t - b.t);
  if (list[0].id === 'me' && !S.quick) { S.stats.poles++; bc().poles++; }
  return list;
}

// ---------- sessão de corrida ----------
let R = null, running = false, view = { shake: 0, braking: false }, inp = { steer: 0, throttle: 0, brake: 0 }, ctl = { left: false, right: false, gas: false, brk: false, wheel: null };
function startSession(mode, stage) {
  const rd = S.calendar[S.round], C = catById(S.cat), T = getTrack(rd.name, S.cat);
  if (mode === 'race') weekend.stage = stage || weekend.stage || 'main';
  const sprint = mode === 'race' && weekend.stage === 'sprint';
  const laps = sprint ? Math.max(2, Math.round(C.laps[S.settings.length] * FMT().sprint.laps)) : C.laps[S.settings.length];
  const diff = DIFF[S.settings.diff];
  const wx = weekend.weather || { start: 0, end: 0, at: 0.5 };
  const field = mode === 'quali' || mode === 'practice' ? [] : S.drivers.map((d) => {
    let tyre = 'M', pitLap = -1;
    if (wx.start > 0.3) tyre = C.pits ? (wx.start > 0.7 ? 'W' : 'I') : 'W';
    else if (C.pits) {
      const r = Math.random();
      if (C.mandatory) { tyre = r < 0.55 ? 'S' : 'M'; pitLap = Math.max(1, Math.round(laps * (tyre === 'S' ? 0.4 : 0.58) + (Math.random() - 0.5) * 2)); }
      else { tyre = r < 0.5 ? 'M' : 'H'; pitLap = tyre === 'M' && laps * 0.75 > laps * COMPOUNDS.M.life ? Math.round(laps * 0.6) : -1; }
    }
    if (sprint && C.pits) pitLap = -1; // na sprint não há paragem obrigatória
    const wd = S.world && S.world.drivers[d.id], rel = wd ? CAREER.relOf(S.world, S.cat, wd) : 0.97;
    return { driver: aiDriver(d), params: aiParams(d), pace: d.skill * diff * (wx.start > 0.3 ? 1 + ((d.wet || 50) - 50) * 0.00008 : 1), tyre, pitLap, rel };
  });
  const grid = mode === 'race' && weekend.grid ? stageGrid(weekend.stage) : null;
  R = new Race({ T, cat: S.cat, mode, laps: mode === 'quali' ? 1 : laps, field, player: { driver: meDriver(), params: playerParams(), tyre: weekend.tyre }, grid, weather: mode === 'race' ? { ...wx } : { start: wx.start, end: wx.start, at: 1 },
    playerRel: S.world ? CAREER.playerReliability(S) : 0.99, formation: mode === 'race' && S.settings.formation !== false, fuel: mode === 'race' && S.cat !== 'kart', sprint });
  if (sprint) R.C = { ...R.C, mandatory: false };
  R.startPos = (grid ? grid.indexOf('me') : R.cars.length - 1) + 1;
  R.onFlag = (k) => { if (k === 'vsc') bigMsg('VIRTUAL SAFETY CAR'); else if (k === 'sc') bigMsg('SAFETY CAR'); else if (k === 'red') bigMsg('BANDEIRA VERMELHA'); else if (k === 'green') bigMsg('BANDEIRA VERDE'); };
  R.onMsg = (text, kind) => radioMsg(text, kind);
  R.onLight = (n) => { lights(n); };
  R.onHit = (f) => { view.shake = Math.min(1.2, f / 12); AUDIO.hit(f); const fl = $('#flash'); fl.classList.add('on'); setTimeout(() => fl.classList.remove('on'), 120); try { navigator.vibrate && navigator.vibrate(Math.min(200, f * 8)); } catch (e) { /* */ } };
  enterRace();
  if (mode === 'practice') radioMsg('Treinos livres: dá as voltas que quiseres. Sai pela pausa quando acabares.', '');
  else if (mode === 'quali') radioMsg('Volta lançada. Dá tudo até à meta!', '');
  else radioMsg(R.phase === 'formation' ? `Volta de formação: aquece os pneus e volta à grelha. Depois são ${laps} voltas. Podes saltar a volta pelo rádio.` : `Verifica os comandos. ${laps} voltas. Boa sorte!`, '');
}
function enterRace() {
  MENU3D.stop();
  app.hidden = true; $('#race').hidden = false; document.body.classList.remove('carbon');
  RENDER.init($('#cv'));
  if (window.THREE) { try { R3D.init($('#cv3'), S.settings.gfx); } catch (e) { window.__no3d = true; } } else window.__no3d = true;
  $('#replayBar').hidden = true; $('#race').classList.remove('replaying');
  setCamVis();
  $('#steerArrows').hidden = S.settings.controls !== 'arrows';
  $('#steerWheel').hidden = S.settings.controls !== 'wheel';
  $('#hUnit').textContent = S.settings.units === 'mph' ? 'mph' : 'km/h';
  const C = catById(S.cat);
  $('#leds').innerHTML = Array.from({ length: 15 }, () => '<i></i>').join('');
  $('#hPosN').textContent = '/' + R.cars.length; $('#hLapN').textContent = '/' + R.laps;
  $('#radioSheet').hidden = true; $('#raceOverlay').hidden = true;
  AUDIO.setVolume(S.settings.vol); AUDIO.setVoice(S.settings.voice); AUDIO.startEngine(S.cat);
  inp = { steer: 0, throttle: 0, brake: 0 }; ctl = { left: false, right: false, gas: false, brk: false, wheel: null };
  paused = false; running = true; last = performance.now();
  try { if (document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().then(() => window.screen.orientation?.lock?.('landscape').catch(() => {})).catch(() => {}); } catch (e) { /* */ }
  checkOrientation();
  void C;
  requestAnimationFrame(loop);
}
let paused = false, last = 0, hudT = 0, portraitOk = false;
const is3D = () => !window.__no3d && (S.settings.cam === 'cockpit' || S.settings.cam === 'chase');
function setCamVis() { $('#race').classList.toggle('cockpit', is3D() && S.settings.cam === 'cockpit'); $('#cv3').hidden = !is3D(); $('#cv').hidden = is3D(); if (is3D()) R3D.resize(); else RENDER.resize(); }
const CAMS = ['cockpit', 'chase', 'rot', 'fixed'], CAMN = { cockpit: 'Primeira pessoa', chase: 'Atrás do carro', rot: 'Vista de cima', fixed: 'Mapa fixo' };
function nextCam() { S.settings.cam = CAMS[(CAMS.indexOf(S.settings.cam) + 1) % CAMS.length]; save(); setCamVis(); }
function checkOrientation() {
  const ov = $('#raceOverlay');
  if (window.innerHeight > window.innerWidth && !portraitOk && running) {
    paused = true;
    ov.innerHTML = `<div class="box"><h3>Roda o telemóvel</h3><p class="muted">O jogo foi feito para a horizontal: vês mais pista e os comandos ficam nos lados.</p><button class="btn primary" id="oPortrait">Jogar assim mesmo</button></div>`;
    ov.hidden = false; $('#oPortrait').onclick = () => { portraitOk = true; ov.hidden = true; paused = false; };
  } else if (ov.querySelector('#oPortrait')) { ov.hidden = true; paused = false; }
}
window.addEventListener('resize', () => { if (running) { RENDER.resize(); if (!window.__no3d) R3D.resize(); checkOrientation(); } });
function loop(now) {
  if (!running) return;
  let dt = Math.min(1 / 30, (now - last) / 1000); last = now;
  const st = S.settings;
  // comandos → entradas suaves
  if (st.controls === 'arrows' || ctl.keys) {
    const tgt = (ctl.right ? 1 : 0) - (ctl.left ? 1 : 0);
    const rate = (tgt === 0 ? 7 : 3.6) * st.sens;
    inp.steer += clamp(tgt * Math.min(1, st.sens) - inp.steer, -rate * dt, rate * dt);
  } else inp.steer = clamp((ctl.wheelAngle || 0) / 110 * st.sens, -1, 1);
  inp.throttle += clamp((ctl.gas ? 1 : 0) - inp.throttle, -dt * 10, dt * 7);
  inp.brake += clamp((ctl.brk ? 1 : 0) - inp.brake, -dt * 12, dt * 12);
  if (!paused) {
    const useInp = window.__ap && R.phase === 'race' ? autopilot(R.me.phys, R.T, R.me.prof, R.me.hint, window.__ap) : inp;
    R.update(dt, useInp, { abs: st.abs, tc: st.tc, steer: st.steer });
    view.shake = Math.max(0, view.shake - dt * 2.5);
  } else dt = 0;
  view.braking = inp.brake > 0.1; view.line = st.line; view.camFixed = st.cam === 'fixed'; view.names = st.names; view.cam = st.cam;
  view.teams = S.cat === 'kart' ? [] : TEAMS[S.cat];
  if (is3D()) R3D.frame(state3D(), view, dt); else RENDER.frame(R, view, dt);
  rainFx(dt);
  hudT -= dt || 0.016;
  if (hudT <= 0) { hudT = 0.1; updateHUD(); }
  const me = R.me, car = me.phys;
  // som: rival mais perto
  let nearD = 1e9; for (const c of R.cars) if (!c.isPlayer) nearD = Math.min(nearD, Math.hypot(c.x - car.x, c.y - car.y));
  AUDIO.update(car.rpm, car.p.rpm, paused ? 0 : inp.throttle, paused ? 0 : car.slide, paused ? 0 : clamp(1 - nearD / 60, 0, 1), 120 + Math.random() * 30);
  if (R.done && !R.endShown) { R.endShown = true; setTimeout(endSession, R.mode === 'quali' ? 900 : 1500); }
  requestAnimationFrame(loop);
}
const idxOf = (T, s) => Math.floor((((s % T.len) + T.len) % T.len) / T.ds) % T.n;
function state3D() {
  const me = R.me, car = me.phys, T = R.T;
  return {
    T, R, weather: R.weather, focus: 'me', phase: R.phase, lightsN: R.lightsN, rain: R.rain, wet: R.wet, sc: R.sc,
    latG: car.latG * Math.sign(car.w || 0), longG: car.longG, surf: me.surf, rpm: car.rpm, rpmRange: car.p.rpm, speed: car.speed, gear: car.gear,
    pos: R.standings().indexOf(me) + 1, flag: R.flag,
    lapCur: me.lap >= 0 && R.phase === 'race' ? R.time - me.lapStart : 0, lapLast: me.laps[me.laps.length - 1], lapBest: me.best, delta: hudDelta,
    lapN: Math.max(1, Math.min(R.laps, me.lap + 1)), lapsN: R.mode === 'practice' ? '∞' : R.laps, wear: me.wear, cmpColor: R.C.pits ? COMPOUNDS[me.tyre].c : null, status: $('#hStatus').textContent, fuel: me.fuel0 ? me.fuel - Math.max(0, R.laps - Math.max(0, me.lap)) : null, mode: me.mode,
    cars: R.cars.map((c) => c.isPlayer
      ? { id: c.id, x: car.x, y: car.y, th: car.th, v: car.speed, s: c.s, i: idxOf(T, c.s), steer: car.delta, tyreColor: COMPOUNDS[c.tyre].c, wing: c.dmg, slide: car.slide }
      : { id: c.id, x: c.x, y: c.y, th: c.th, v: c.v, s: c.s, i: idxOf(T, c.s), steer: clamp(Math.atan(T.rk[idxOf(T, c.s)] * R.C.L), -0.3, 0.3), tyreColor: COMPOUNDS[c.tyre].c, wing: c.dmg, slide: c.spinning ? 1 : 0 }),
  };
}
// gotas de chuva no ecrã (primeira pessoa)
const drops = [];
function rainFx(dt) {
  const cvr = $('#rainFx'), on = R && S.settings.cam === 'cockpit' && is3D() && (R.rain || 0) > 0.05;
  cvr.hidden = !on; if (!on) return;
  const w = cvr.clientWidth, h = cvr.clientHeight; if (cvr.width !== w) { cvr.width = w; cvr.height = h; }
  const g = cvr.getContext('2d'); g.clearRect(0, 0, w, h);
  const sp = R.me.phys.speed;
  if (Math.random() < R.rain * dt * 40 && drops.length < 70) drops.push({ x: Math.random() * w, y: Math.random() * h * 0.8, r: 2 + Math.random() * 5, life: 1.5 + Math.random() * 2 });
  for (const d of drops) { d.life -= dt; const cx = w / 2, dx = d.x - cx; d.x += dx * dt * sp * 0.015; d.y += (dt * 8 + dt * sp * 0.4); }
  for (let k = drops.length - 1; k >= 0; k--) if (drops[k].life <= 0 || drops[k].y > h || drops[k].x < 0 || drops[k].x > w) drops.splice(k, 1);
  for (const d of drops) { const gr = g.createRadialGradient(d.x - d.r * 0.3, d.y - d.r * 0.3, 0, d.x, d.y, d.r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(180,200,220,.12)'); g.fillStyle = gr; g.beginPath(); g.ellipse(d.x, d.y, d.r, d.r * (1 + sp * 0.01), 0, 0, 7); g.fill(); }
}
function lights(n) {
  const el = $('#lights');
  if (n > 0) { el.hidden = false; [...el.children].forEach((c, k) => c.classList.toggle('on', k < n)); AUDIO.light(true); }
  else { [...el.children].forEach((c) => c.classList.remove('on')); AUDIO.light(false); bigMsg('LUZES APAGADAS!'); setTimeout(() => (el.hidden = true), 700); }
}
function bigMsg(t) { const d = document.createElement('div'); d.className = 'hud bigmsg'; d.textContent = t; $('#race').appendChild(d); setTimeout(() => d.remove(), 1700); }
let radioTimer = null, hudDelta = null;
const ENGINEER = ['Rui', 'Marta', 'Tom', 'Sofia', 'Luca'][Math.floor(Math.random() * 5)];
function radioMsg(text, kind) {
  const el = $('#radioMsg');
  el.className = 'hud radio-msg ' + (kind || ''); el.innerHTML = `<b>📻 ${ENGINEER}, engenheiro</b>${esc(text)}`; el.hidden = false;
  clearTimeout(radioTimer); radioTimer = setTimeout(() => (el.hidden = true), 4800);
  AUDIO.radio(text);
}
function updateHUD() {
  const me = R.me, car = me.phys, st = S.settings;
  const sp = car.speed * (st.units === 'mph' ? 2.237 : 3.6);
  $('#hSpd').textContent = Math.round(sp);
  $('#hGear').textContent = car.speed < 0.5 && inp.throttle < 0.1 ? 'N' : car.gear;
  const k = clamp((car.rpm - car.p.rpm[0]) / (car.p.rpm[1] - car.p.rpm[0]), 0, 1), lit = Math.round(k * 15);
  [...$('#leds').children].forEach((el, i) => (el.className = i < lit ? (i < 5 ? 'g' : i < 10 ? 'r' : 'b') : ''));
  // pneus
  const w = me.wear, col = w < 0.45 ? 'var(--green)' : w < 0.7 ? 'var(--yellow)' : w < 0.85 ? '#ff8a00' : 'var(--red)';
  [...$('#hTyres').children].forEach((el) => (el.style.background = col));
  const cmp = COMPOUNDS[me.tyre];
  $('#hCmp').innerHTML = R.C.pits ? `<span class="cmp" style="border-color:${cmp.c}"></span><b>${cmp.n}</b>` : '<b>Pneus</b>';
  $('#hWear').textContent = Math.round((1 - w) * 100) + '% de borracha';
  // estado
  let stx = '';
  if (me.pitState) stx = me.pitState === 3 ? 'PARAGEM NAS BOXES' : 'LIMITADOR · BOXES';
  else if (R.boxReq) stx = 'BOX NESTA VOLTA · ' + COMPOUNDS[R.boxReq].n.toUpperCase();
  else if (me.surf && me.surf !== 'asfalto' && me.surf !== 'corretor') stx = me.surf === 'gravilha' ? 'NA GRAVILHA!' : 'FORA DA PISTA';
  else if (me.mode !== 1) stx = me.mode === 2 ? 'MODO ATAQUE' : 'A POUPAR PNEUS';
  if (st.abs && car.lockF) stx = stx || 'ABS';
  if (R.phase === 'formation') stx = 'VOLTA DE FORMAÇÃO';
  else if (R.flag === 'vsc') stx = 'VIRTUAL SAFETY CAR · ABRANDA';
  else if (R.me.fuel0 && R.phase === 'race' && R.me.fuel < (R.laps - Math.max(0, R.me.lap)) * 0.98) stx = stx || 'POUPA COMBUSTÍVEL';
  if (R.flag === 'sc') stx = 'SAFETY CAR · SEM ULTRAPASSAGENS';
  else if (R.flag === 'amarela') stx = stx || 'BANDEIRA AMARELA';
  else if (R.flag === 'azul') stx = stx || 'BANDEIRA AZUL';
  if (R.phase === 'red') stx = 'BANDEIRA VERMELHA';
  $('#hStatus').textContent = stx;
  const fl = $('#hFlag'); fl.className = 'hud flagbox ' + (R.phase === 'red' ? 'red' : R.flag || ''); fl.hidden = !(R.flag || R.phase === 'red');
  fl.textContent = R.phase === 'red' ? 'BANDEIRA VERMELHA' : R.flag === 'sc' ? 'SAFETY CAR' : R.flag === 'vsc' ? 'VIRTUAL SC' : R.flag === 'amarela' ? 'AMARELA' : R.flag === 'azul' ? 'AZUL' : '';
  $('#hDmg').hidden = !(me.dmg > 0.05 || me.susp > 0.05); $('#hDmg').textContent = `🔧 Asa ${Math.round(me.dmg * 100)}%`;
  $('#hWx').textContent = (R.rain > 0.15 ? '🌧️' : R.wet > 0.25 ? '💧' : '☀️') + ' pista ' + (R.wet > 0.6 ? 'encharcada' : R.wet > 0.25 ? 'molhada' : R.wet > 0.08 ? 'húmida' : 'seca');
  // posição e volta
  const order = R.standings(), pos = order.indexOf(me) + 1;
  $('#hPos').textContent = R.mode === 'quali' ? '—' : pos;
  $('#hLap').textContent = Math.max(1, Math.min(R.laps, me.lap + 1));
  // tempos
  const cur = me.lap >= 0 ? R.time - me.lapStart : 0;
  $('#tCur').textContent = fmtTime(me.lap >= 0 && R.phase === 'race' ? cur : 0);
  $('#tLast').textContent = 'Última ' + fmtTime(me.laps[me.laps.length - 1]);
  $('#tBest').textContent = 'Melhor ' + fmtTime(me.best);
  // diferença para a melhor volta (pela fração da volta)
  const dEl = $('#tDelta');
  hudDelta = null;
  if (me.best && me.lap >= 1 && me.bestCp) {
    const cp = me.lastCp, tNow = me.cp[me.lap * NCP + cp], ref = me.bestCp[cp];
    if (tNow !== undefined && ref !== undefined) { const d = tNow - me.lapStart - ref; hudDelta = d; dEl.textContent = (d > 0 ? '+' : '') + d.toFixed(2); dEl.className = 'delta ' + (d > 0 ? 'up' : 'down'); }
  } else dEl.textContent = '';
  // torre de tempos
  if (R.mode === 'race') {
    const meIdx = order.indexOf(me);
    const from = clamp(meIdx - 4, 0, Math.max(0, order.length - 9));
    const rows = [];
    for (let i = 0; i < Math.min(order.length, 9); i++) {
      const idx = i < 3 ? i : from + i;
      if (idx >= order.length || (i >= 3 && idx < 3)) continue;
      rows.push(idx);
    }
    const uniq = [...new Set(rows)].sort((a, b) => a - b).slice(0, 9);
    const leader = order[0];
    $('#tower').innerHTML = `<div class="hd"><span>VOLTA ${Math.max(1, Math.min(R.laps, leader.lap + 1))}/${R.laps}</span><span>${R.C.short}</span></div>` + uniq.map((i) => {
      const c = order[i]; let g = '';
      if (i === 0) g = 'Líder'; else if (c.pitState) g = 'BOX';
      else { const gp = R.gap(c, leader); g = gp > 0 && isFinite(gp) ? '+' + gp.toFixed(1) : ''; }
      if (c.finished) g = i === 0 ? '🏁' : g;
      return `<div class="ln ${c.isPlayer ? 'me' : ''}"><span class="p">${i + 1}</span><span class="bar" style="background:${c.d.c1}"></span><span>${esc(c.d.code)}</span><span class="g ${c.pitState ? 'pit' : ''}">${g}</span></div>`;
    }).join('');
  } else $('#tower').innerHTML = `<div class="hd"><span>QUALIFICAÇÃO</span><span>${R.C.short}</span></div><div class="ln me"><span class="p">—</span><span class="bar" style="background:${me.d.c1}"></span><span>${esc(me.d.code)}</span><span class="g">volta lançada</span></div>`;
  RENDER.drawMini($('#mini'), R);
  // pedais
  $('#fGas').style.height = inp.throttle * 100 + '%'; $('#fBrake').style.height = inp.brake * 100 + '%';
  // guardar parciais da melhor volta
  if (me.laps.length && me.best === me.laps[me.laps.length - 1] && me.bestLapN !== me.laps.length) {
    me.bestLapN = me.laps.length; const L = me.lap - 1; me.bestCp = {};
    const start = me.cp[L * NCP];
    for (let c = 0; c < NCP; c++) if (me.cp[L * NCP + c] !== undefined) me.bestCp[c] = me.cp[L * NCP + c] - (start ?? me.cp[L * NCP + c]);
  }
  // avisos automáticos do engenheiro
  const tm = R.teammate && R.teammate();
  if (tm && !R.teamOrderAsked && R.mode === 'race' && me.lap >= 1 && R.phase === 'race' && order.indexOf(tm) === pos && R.gap(tm, me) < 0.8 && tm.pace > 0.99 * DIFF[S.settings.diff]) {
    R.teamOrderAsked = true; R.teamOrder = true; radioMsg(`O ${tm.d.last} está mais rápido. A equipa pede para o deixares passar. Responde no rádio.`, 'warn');
  }
  if (!me.wearWarned && me.wear > 0.75 && R.mode === 'race') { me.wearWarned = true; radioMsg(R.C.pits ? 'Os pneus estão a acabar. Pensa em vir às boxes.' : 'Cuidado: os pneus estão gastos, trava mais cedo.', 'warn'); }
  if (me.lap !== me.lastLapMsg && me.lap >= 1 && R.mode === 'race' && !me.finished) {
    me.lastLapMsg = me.lap;
    const ahead = order[pos - 2];
    const lt = me.laps[me.laps.length - 1];
    if (lt) radioMsg(`Volta em ${fmtTime(lt)}. Estás em P${pos}${ahead ? `, a ${Math.max(0, R.gap(me, ahead)).toFixed(1)} s de ${ahead.d.last}` : ''}.`, '');
  }
}
// ---------- rádio ----------
function radioSheet() {
  const me = R.me, C = R.C, sh = $('#radioSheet');
  const mode = (m, l) => `<button class="${me.mode === m ? 'on' : ''}" data-r="mode" data-v="${m}">${l}</button>`;
  sh.innerHTML = `<h4>Rádio da equipa <button class="x" data-r="close" aria-label="Fechar">✕</button></h4>
  ${C.pits && R.mode === 'race' ? `<div class="muted">Boxes: escolhe os pneus</div><div class="seg">${R.boxReq ? `<button data-r="nobox">Cancelar box (${COMPOUNDS[R.boxReq].n})</button>` : Object.entries(COMPOUNDS).map(([k, c]) => `<button data-r="box" data-v="${k}"><span class="cmp" style="border-color:${c.c}"></span>Box: ${c.n}</button>`).join('')}</div>` : ''}
  ${R.phase === 'formation' ? '<div class="seg"><button data-r="skipform">⏭ Terminar a volta de formação</button></div>' : ''}
  <div class="muted">Modo de condução${me.fuel0 ? ' (também mexe no consumo)' : ''}</div><div class="seg">${mode(2, 'Atacar')}${mode(1, 'Normal')}${mode(0, me.fuel0 ? 'Poupar' : 'Poupar pneus')}</div>
  ${me.fuel0 ? '<div class="seg"><button data-r="fuel">⛽ Como está o combustível?</button></div>' : ''}
  ${R.teammate && R.teammate() ? `<div class="muted">Colega de equipa: ${esc(R.teammate().d.last)}</div><div class="seg">${R.teamOrder ? '<button data-r="letpass">Deixar o colega passar</button><button data-r="refuse">Recusar a ordem</button>' : '<button data-r="mate">Pedir ao colega para me deixar passar</button>'}</div>` : ''}
  <div class="seg" style="flex-direction:column"><button data-r="tyres">🛞 Como estão os pneus?</button><button data-r="damage">🔧 Como está o carro?</button><button data-r="weather">🌦️ O tempo vai mudar?</button><button data-r="gaps">⏱ Diferenças para a frente e para trás?</button><button data-r="pace">📊 Como está o meu ritmo?</button><button data-r="laps">🏁 Quantas voltas faltam?</button>${C.pits ? '<button data-r="rivals">🔧 Estratégia dos rivais?</button>' : ''}</div>`;
  sh.hidden = false;
}
$('#radioSheet').addEventListener('click', (e) => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  const me = R.me, order = R.standings(), pos = order.indexOf(me) + 1, a = b.dataset.r;
  AUDIO.click();
  if (a === 'close') { $('#radioSheet').hidden = true; return; }
  if (a === 'skipform') { if (R.phase === 'formation') R.formationEnd(); $('#radioSheet').hidden = true; return; }
  if (a === 'fuel') { const left = Math.max(0, R.laps - Math.max(0, me.lap)), m = me.fuel - left; radioMsg(me.fuel <= 0 ? 'Não temos combustível!' : `Combustível para ${me.fuel.toFixed(1)} voltas, faltam ${left}. ${m < -0.05 ? 'Tens de poupar: põe o modo poupar.' : m > 0.6 ? 'Tens margem: podes atacar um pouco.' : 'Está certo, mantém o ritmo.'}`, m < -0.05 ? 'warn' : ''); return; }
  if (a === 'box') { R.boxReq = b.dataset.v; radioMsg(`Entendido: box nesta volta para ${COMPOUNDS[b.dataset.v].n.toLowerCase()}. Entra pela faixa das boxes antes da meta.`, ''); }
  else if (a === 'nobox') { R.boxReq = null; radioMsg('Box cancelado. Fica na pista.', ''); }
  else if (a === 'mode') { me.mode = +b.dataset.v; radioMsg(['Modo poupança: menos ritmo, os pneus duram mais.', 'Modo normal.', 'Modo ataque: mais potência, os pneus gastam mais.'][me.mode], ''); }
  else if (a === 'tyres') { const left = Math.round((1 - me.wear) * 100); const lapsLeft = Math.max(0, (1 - me.wear) * COMPOUNDS[me.tyre].life * R.laps * (R.C.pits ? 1 : 2.8)); radioMsg(`Pneus com ${left}% de borracha. Dão para mais umas ${lapsLeft.toFixed(0)} voltas.`, left < 30 ? 'warn' : ''); }
  else if (a === 'gaps') { const f = order[pos - 2], bk = order[pos]; radioMsg(`${f ? `${f.d.last} à frente a ${Math.max(0, R.gap(me, f)).toFixed(1)} s` : 'Vais na frente!'}${bk ? `. ${bk.d.last} atrás a ${Math.max(0, R.gap(bk, me)).toFixed(1)} s` : ''}.`, ''); }
  else if (a === 'pace') { const myL = me.laps[me.laps.length - 1], ld = order[0], ldL = ld.laps[ld.laps.length - 1]; radioMsg(myL && ldL && ld !== me ? `A tua última volta: ${fmtTime(myL)}. O líder fez ${fmtTime(ldL)}. ${myL < ldL ? 'Estás mais rápido!' : `Perdes ${(myL - ldL).toFixed(2)} s por volta.`}` : myL ? `A tua última volta: ${fmtTime(myL)}.` : 'Ainda não há uma volta completa.', ''); }
  else if (a === 'mate') radioMsg(R.askTeammate(), '');
  else if (a === 'letpass') { R.letTeammatePass(); R.teamOrder = false; S.teamRel = (S.teamRel || 0) + 6; save(); radioMsg('Obrigado. A equipa não se esquece disto.', 'good'); radioSheet(); }
  else if (a === 'refuse') { R.teamOrder = false; S.teamRel = (S.teamRel || 0) - 10; save(); radioMsg('Recebido... A equipa não está contente.', 'warn'); radioSheet(); }
  else if (a === 'damage') radioMsg(me.dmg < 0.05 && me.susp < 0.05 ? 'O carro está perfeito, sem danos.' : `Asa da frente com ${Math.round(me.dmg * 100)}% de danos${me.susp > 0.05 ? ' e a suspensão puxa para um lado' : ''}. ${R.C.pits ? 'Na próxima paragem trocamos a asa.' : 'Aguenta até ao fim.'}`, me.dmg > 0.3 ? 'warn' : '');
  else if (a === 'weather') { const w = R.weather, f = R.raceFrac(); radioMsg(w.end > w.start + 0.2 && f < w.at ? `Vem aí chuva, mais ou menos daqui a ${Math.max(1, Math.round((w.at - f) * R.laps))} voltas.` : w.end < w.start - 0.2 && f < w.at ? 'A chuva vai parar. A pista vai secar.' : R.rain > 0.15 ? 'Vai continuar a chover.' : 'Não está previsto mudar.', ''); }
  else if (a === 'laps') { const left = Math.max(0, R.laps - Math.max(0, me.lap)); radioMsg(left <= 0 ? 'É a última volta!' : `Faltam ${left} volta${left > 1 ? 's' : ''}.`, ''); }
  else if (a === 'rivals') { const pitted = R.cars.filter((c) => !c.isPlayer && c.pits > 0).length; const f = order[pos - 2]; radioMsg(`${pitted} rivais já pararam.${f ? ` ${f.d.last} vai de ${COMPOUNDS[f.tyre].n.toLowerCase()}${f.pits ? ' e já parou' : ' e ainda não parou'}.` : ''}`, ''); }
  if (a !== 'close') { if (a === 'box' || a === 'nobox' || a === 'mode') radioSheet(); }
});
$('#bRadio').onclick = () => { AUDIO.click(); const sh = $('#radioSheet'); if (sh.hidden) radioSheet(); else sh.hidden = true; };
$('#bPause').onclick = () => pauseMenu();
$('#bCam').onclick = () => { AUDIO.click(); nextCam(); radioMsg('Câmara: ' + CAMN[S.settings.cam] + '.', ''); };
function pauseMenu() {
  paused = true; const ov = $('#raceOverlay');
  ov.innerHTML = `<div class="box"><h3>Pausa</h3><button class="btn primary" data-p="go">Continuar</button><button class="btn" data-p="restart">Recomeçar ${R.mode === 'quali' ? 'a volta' : 'a corrida'}</button>
  <div class="seg">${[['abs', 'ABS'], ['tc', 'Tração'], ['steer', 'Direção'], ['line', 'Trajetória']].map(([k, l]) => `<button class="${S.settings[k] ? 'on' : ''}" data-p="tog" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="seg"><button class="${S.settings.controls === 'arrows' ? 'on' : ''}" data-p="ctl" data-v="arrows">Setas</button><button class="${S.settings.controls === 'wheel' ? 'on' : ''}" data-p="ctl" data-v="wheel">Volante</button><button data-p="cam">📷 ${CAMN[S.settings.cam]}</button></div>
  <button class="btn" data-p="quit">${R.mode === 'practice' ? 'Terminar os treinos' : R.mode === 'quali' ? 'Sair da qualificação' : 'Desistir da corrida'}</button></div>`;
  ov.hidden = false;
}
$('#raceOverlay').addEventListener('click', (e) => {
  const b = e.target.closest('[data-p]'); if (!b) return; AUDIO.click();
  const a = b.dataset.p;
  if (a === 'go') { $('#raceOverlay').hidden = true; paused = false; }
  else if (a === 'tog') { S.settings[b.dataset.v] = !S.settings[b.dataset.v]; save(); pauseMenu(); }
  else if (a === 'ctl') { S.settings.controls = b.dataset.v; save(); $('#steerArrows').hidden = S.settings.controls !== 'arrows'; $('#steerWheel').hidden = S.settings.controls !== 'wheel'; pauseMenu(); }
  else if (a === 'cam') { nextCam(); pauseMenu(); }
  else if (a === 'restart') { running = false; AUDIO.stopEngine(); startSession(R.mode); }
  else if (a === 'quit') { if (R.mode === 'practice') { running = false; AUDIO.stopEngine(); show(scrWeekend); radioTimer && clearTimeout(radioTimer); } else if (R.mode === 'quali') { running = false; AUDIO.stopEngine(); weekend.grid = simQuali(9999); show(scrWeekend); } else { R.dnf = true; running = false; AUDIO.stopEngine(); endSession(); } }
});
let lastRace = null;
const is3Dok = () => !!window.THREE && !window.__no3d;
// ---------- repetição com câmaras de televisão ----------
let RP = null;
function startReplay() {
  const RR = lastRace; if (!RR) return;
  R = RR; app.hidden = true; $('#race').hidden = false; document.body.classList.remove('carbon');
  if (window.THREE) { try { R3D.init($('#cv3'), S.settings.gfx); } catch (e) { return; } }
  $('#cv3').hidden = false; $('#cv').hidden = true;
  $('#race').classList.add('replaying'); $('#race').classList.remove('cockpit');
  $('#raceOverlay').hidden = true; $('#radioSheet').hidden = true; $('#hFlag').hidden = true; $('#lights').hidden = true;
  RP = { k: 0, play: true, speed: 1, cam: 'tv', focus: 'me', cache: null };
  $('#replayBar').hidden = false; replayBar();
  running = false; replayLoop.last = performance.now(); requestAnimationFrame(replayLoop);
}
function replayBar() {
  const n = RR().rep.frames.length, t = (RP.k * RR().rep.dt);
  $('#replayBar').innerHTML = `<button data-rp="back">⏪ 10s</button><button data-rp="play">${RP.play ? '⏸' : '▶'}</button><button data-rp="speed">${RP.speed}x</button>
  <button data-rp="cam">📷 ${{ tv: 'TV', cockpit: 'Cockpit', chase: 'Atrás' }[RP.cam]}</button><button data-rp="prev">◀</button><span>${esc(driverById(RP.focus)?.last || '')}</span><button data-rp="next">▶</button>
  <span class="t">${fmtTime(t)} / ${fmtTime(n * RR().rep.dt)}</span><button data-rp="exit">Sair</button>`;
}
const RR = () => lastRace;
function replayLoop(now) {
  if (!RP) return;
  const dt = clamp((now - replayLoop.last) / 1000, 0, 0.05); replayLoop.last = now;
  const rep = R.rep, n = rep.frames.length;
  if (!n) { RP = null; show(S.quick ? scrHome : scrHub); return; }
  if (RP.play) RP.k = clamp(RP.k + (dt * RP.speed) / rep.dt, 0, n - 1);
  const f = rep.frames[Math.floor(RP.k)], T = R.T, N = R.cars.length * 7;
  const cars = R.cars.map((c, k) => ({ id: c.id, x: f[k * 7], y: f[k * 7 + 1], th: f[k * 7 + 2], v: f[k * 7 + 3], s: f[k * 7 + 4], i: idxOf(T, f[k * 7 + 4]), steer: c.isPlayer ? f[k * 7 + 6] : clamp(Math.atan(T.rk[idxOf(T, f[k * 7 + 4])] * R.C.L), -0.3, 0.3), tyreColor: COMPOUNDS[c.tyre].c, wing: 0, slide: 0, prog: f[k * 7 + 5] }));
  const scS = f[N];
  const sc = scS >= 0 ? (() => { const a = trackPoint(T, scS, offAt(T, scS)), b = trackPoint(T, scS + 2, offAt(T, scS + 2)); return { s: scS, x: a.x, y: a.y, th: Math.atan2(b.y - a.y, b.x - a.x) }; })() : null;
  const order = cars.slice().sort((a, b) => b.prog - a.prog);
  const st = { T, R, weather: R.weather, cars, focus: RP.focus, phase: f[N + 3] ? 'lights' : 'race', lightsN: f[N + 3], rain: f[N + 1], wet: f[N + 2], sc, rpm: 0, rpmRange: [0, 1], speed: cars.find((c) => c.id === RP.focus).v, gear: 3, pos: order.findIndex((c) => c.id === RP.focus) + 1 };
  R3D.frame(st, { cam: RP.cam, teams: S.cat === 'kart' ? [] : TEAMS[S.cat] }, RP.play ? dt * RP.speed : 0);
  if ((replayLoop.hud = (replayLoop.hud || 0) + dt) > 0.25) {
    replayLoop.hud = 0;
    $('#tower').innerHTML = `<div class="hd"><span>REPETIÇÃO</span><span>${R.C.short}</span></div>` + order.slice(0, 10).map((c, i) => { const d = driverById(c.id); return `<div class="ln ${c.id === RP.focus ? 'me' : ''}"><span class="p">${i + 1}</span><span class="bar" style="background:${d.c1}"></span><span>${esc(d.code)}</span><span class="g">${Math.round(c.v * 3.6)}</span></div>`; }).join('');
    replayBar();
  }
  requestAnimationFrame(replayLoop);
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-rp]'); if (!b || !RP) return; AUDIO.click();
  const a = b.dataset.rp, ids = R.cars.map((c) => c.id);
  if (a === 'play') RP.play = !RP.play;
  else if (a === 'back') RP.k = Math.max(0, RP.k - 10 / R.rep.dt);
  else if (a === 'speed') RP.speed = { 0.5: 1, 1: 2, 2: 4, 4: 0.5 }[RP.speed];
  else if (a === 'cam') RP.cam = { tv: 'cockpit', cockpit: 'chase', chase: 'tv' }[RP.cam];
  else if (a === 'next' || a === 'prev') { const k = ids.indexOf(RP.focus); RP.focus = ids[(k + (a === 'next' ? 1 : ids.length - 1)) % ids.length]; }
  else if (a === 'exit') { RP = null; $('#replayBar').hidden = true; $('#race').classList.remove('replaying'); if (S.quick) { leaveQuick(); show(scrHome); } else show(scrHub); return; }
  replayBar();
});
const bc = () => { S.byCat = S.byCat || {}; return S.byCat[S.cat] || (S.byCat[S.cat] = { races: 0, wins: 0, pods: 0, poles: 0, fl: 0, pts: 0, titles: 0, dnf: 0, seasons: 0 }); };
function poleNote() { if (S.quick || !weekend.grid) return; const p = driverById(weekend.grid[0].id); if (weekend.grid[0].id === 'me') CAREER.addRep(S, 1); else if (Math.random() < 0.3) CAREER.news(S, 'pole', `Pole para ${p.last} em ${S.calendar[S.round].name}`, `${p.first} ${p.last} foi o mais rápido na qualificação da ${catById(S.cat).n}.`); }
// pontos oficiais da sessão (sprint ou principal), com pole e volta mais rápida onde contam
function scoreSession(res, stage, fastestId) {
  const F = FMT(), tbl = stage === 'sprint' ? F.sprint.pts : F.main.pts;
  for (const r of res) {
    r.pts = r.out || r.dnf ? 0 : tbl[r.pos - 1] || 0;
    if (stage === 'main' && F.pole && weekend.grid && weekend.grid[0].id === r.id) r.pts += F.pole;
    if (F.fl && fastestId === r.id && r.pos <= 10 && !r.out && !r.dnf) r.pts += F.fl;
  }
  return res;
}
// corrida simulada: capacidade do piloto, carro, equipa, chuva, fiabilidade e grelha
function simulateRace(stage) {
  weekend.stage = stage;
  const grid = stageGrid(stage), wet = weekend.weather.start > 0.3 ? 0.7 : weekend.weather.end > 0.3 ? 0.35 : 0, diff = DIFF[S.settings.diff];
  const list = grid.map((id, k) => { if (id === 'me') { const a = S.attr; return { id, rating: CAREER.playerRating(S), wet: a.chuva, cons: clamp(a.consist / 100, 0.2, 0.95), perf: carPerf('me'), rel: CAREER.playerReliability(S), grid: k, mul: 0.952 }; }
    const d = S.drivers.find((x) => x.id === id), wd = S.world.drivers[id]; return { id, rating: d.rating ?? (d.skill - 0.93) / 0.00073, wet: d.wet ?? 50, cons: d.cons ?? 0.6, perf: carPerf(id), rel: wd ? CAREER.relOf(S.world, S.cat, wd) : 0.97, grid: k, mul: diff }; });
  const out = CAREER.simRace(list, wet, 0.0005), T = getTrack(S.calendar[S.round].name, S.cat), base = speedProfile(T, playerParams()).lap;
  const laps = stage === 'sprint' ? Math.max(2, Math.round(catById(S.cat).laps[S.settings.length] * FMT().sprint.laps)) : catById(S.cat).laps[S.settings.length];
  const lead = out[0].pace, fast = out.filter((e) => !e.dnf).sort((a, b) => b.pace * (1 + Math.random() * 0.002) - a.pace * (1 + Math.random() * 0.002))[0];
  const res = out.map((e, k) => { const d = driverById(e.id), gap = (lead - e.pace) / lead * base * laps;
    return { id: e.id, d, pos: k + 1, isPlayer: e.id === 'me', out: !!e.dnf, dnf: !!e.dnf, why: e.dnf, gapTxt: e.dnf ? (e.dnf === 'mec' ? 'Avaria' : 'Acidente') : k === 0 ? `${laps} voltas` : '+' + Math.max(0.2, gap).toFixed(3), best: base / (CAREER.skillOf(e.rating) * e.mul) * (1 + Math.random() * 0.004), penalty: 0, dmg: 0 }; });
  finishStage(res, stage, fast && fast.id, null);
}
function endSession() {
  running = false; AUDIO.stopEngine();
  try { speechSynthesis.cancel(); } catch (e) { /* */ }
  if (R.mode === 'quali') { const t = R.me.laps[0]; weekend.grid = simQuali(t); poleNote(); show(scrWeekend); return; }
  let res = R.results();
  if (R.dnf) { const me = res.find((r) => r.isPlayer); res = res.filter((r) => !r.isPlayer).map((r, k) => ({ ...r, pos: k + 1 })); res.push({ ...me, pos: res.length + 1, dnf: true, out: true, why: R.failDnf || 'desistiu', gapTxt: R.failDnf === 'mec' ? 'Avaria' : R.failDnf === 'fuel' ? 'Sem combustível' : 'Desistiu' }); }
  if (S.quick) {
    lastRace = R; const mine = res.find((r) => r.isPlayer);
    show(scrResults, res, { track: R.T.name, money: 0, pts: mine.pts, pos: mine.pos, champ: 0, fastest: R.fastest && R.fastest.id, goal: null, goalOk: false, replay: is3Dok() && R.rep.frames.length > 20, quick: true });
    return;
  }
  lastRace = R;
  finishStage(res, weekend.stage || 'main', R.fastest && R.fastest.id, R);
}
// fecha uma sessão: sprint volta ao fim de semana; a principal fecha a ronda
function finishStage(res, stage, fastestId, RR) {
  scoreSession(res, stage, fastestId);
  for (const r of res) { S.points[r.id] = (S.points[r.id] || 0) + r.pts; }
  const mine = res.find((r) => r.isPlayer), pos = mine.pos;
  if (stage === 'sprint') {
    weekend.sprintRes = res.map((r) => r.id); weekend.sprintPos = pos;
    S.stats.pts = (S.stats.pts || 0) + mine.pts; bc().pts += mine.pts;
    if (pos <= 3 && !mine.dnf) CAREER.addRep(S, 1);
    save();
    show(scrResults, res, { track: S.calendar[S.round].name, stageName: FMT().sprint.n, money: 0, pts: mine.pts, pos, champ: champTable().meIdx + 1, fastest: fastestId, replay: RR && is3Dok() && RR.rep.frames.length > 20, sprint: true });
    return;
  }
  const C = catById(S.cat), rd = S.calendar[S.round], W = S.world, dnf = !!mine.dnf;
  for (const r of res) if (r.pos === 1 && !r.dnf) S.wins[r.id] = (S.wins[r.id] || 0) + 1;
  // estatísticas do jogador e dos pilotos do mundo
  const b = bc(); S.stats.races++; b.races++; S.stats.pts = (S.stats.pts || 0) + mine.pts; b.pts += mine.pts;
  if (dnf) { S.stats.dnf = (S.stats.dnf || 0) + 1; b.dnf++; } else { if (pos === 1) { S.stats.wins++; b.wins++; } if (pos <= 3) { S.stats.podiums++; b.pods++; } }
  if (fastestId === 'me') { S.stats.fl = (S.stats.fl || 0) + 1; b.fl++; }
  for (const r of res) if (!r.isPlayer) CAREER.recordDriver(W.drivers[r.id], S.cat, r.pos, !!(r.dnf || r.out), weekend.grid && weekend.grid[0].id === r.id, fastestId === r.id, r.pts);
  // dinheiro: prémio, salário do contrato, bónus, patrocinadores e objetivo
  const prize = Math.round(dnf ? C.prize * 0.15 : pos <= 10 ? C.prize * (1.6 - pos * 0.12) : C.prize * 0.25);
  const ct = S.contract && S.contract.cat === S.cat ? S.contract : null;
  const salary = ct ? ct.salary : 0, bonus = ct && !dnf ? (pos === 1 ? ct.winBonus : pos <= 3 ? ct.podBonus : 0) : 0;
  const sp = CAREER.sponsorsAfterRace(S, pos, dnf);
  const goal = weekend && weekend.goal, goalOk = RR ? checkGoal(goal, res, mine, RR) : goal ? (goal.k === 'top' ? !dnf && pos <= goal.v : goal.k === 'gain' ? !dnf && stageGrid('main').indexOf('me') + 1 - pos >= goal.v : goal.k === 'clean' ? !dnf : goal.k === 'fast' ? fastestId === 'me' : goal.k === 'mate' ? (() => { const m = res.find((r) => r.d.team === S.team && !r.isPlayer); return m && m.pos > pos; })() : false) : false;
  const earned = prize + salary + bonus + (goalOk ? goal.pay : 0);
  S.money += earned;
  // reputação e experiência
  CAREER.addRep(S, dnf ? -1 : pos === 1 ? 4 : pos <= 3 ? 2 : pos <= 6 ? 0.6 : pos <= 10 ? 0.2 : -0.4);
  if (RR && RR.me && RR.me.penalty >= 5) CAREER.addRep(S, -1);
  const A = S.attr, grow = (k, v) => (A[k] = clamp(A[k] + v * (1 - A[k] / 105), 1, 99));
  grow('ritmo', 0.35); grow('consist', dnf ? 0.05 : 0.3); grow('ultrap', 0.25); grow('fisico', 0.1); if (weekend.weather.start > 0.3 || weekend.weather.end > 0.3) grow('chuva', 0.6);
  CAREER.updateRivals(S, res);
  // guardar a ronda e avançar o mundo
  rd.full = Object.fromEntries(res.map((r) => [r.id, r.dnf || r.out ? 'D' : r.pos])); rd.fl = fastestId; rd.pole = weekend.grid ? weekend.grid[0].id : null;
  rd.res = dnf ? 'DNF' : pos; if (weekend.sprintPos) rd.spr = weekend.sprintPos; if (rd.date) S.today = rd.date;
  const win = res[0], wd = win.d;
  if (win.isPlayer) CAREER.news(S, 'vitoria', `${S.profile.first} ${S.profile.last} vence em ${rd.name}!`, `${pos === 1 && weekend.grid && weekend.grid[0].id === 'me' ? 'Da pole à vitória. ' : ''}Mais 25 pontos para o campeonato de ${C.n}.`);
  else CAREER.news(S, 'resultado', `${wd.first} ${wd.last} vence em ${rd.name}`, `${S.profile.last} terminou ${dnf ? 'fora de prova' : 'em P' + pos}. ${(() => { const t = champTable().rows[0]; return `Líder: ${driverById(t[0]).last} com ${t[1]} pontos.`; })()}`);
  if (!dnf && pos <= 3 && CAREER.nextOf(S.cat) && S.rep > 20 && Math.random() < 0.3) { const nx = CAREER.nextOf(S.cat), t = W.teams[nx] && W.teams[nx][Math.floor(Math.random() * 6)]; if (t) CAREER.news(S, 'interesse', `${t.name} de olho em ${S.profile.last}`, `A equipa da ${catById(nx).n} está a acompanhar os resultados do jovem piloto.`); }
  S.round++;
  CAREER.syncOtherCats(S, S.round / S.calendar.length); CAREER.teamsDevelop(S);
  S.pending = CAREER.pressConference(S, pos, dnf);
  weekend = null; save();
  const champ = champTable().meIdx + 1;
  show(scrResults, res, { track: rd.name, stageName: FMT().main.n, money: earned, breakdown: [['Prémio', prize], ...(salary ? [['Salário', salary]] : []), ...(bonus ? [['Bónus do contrato', bonus]] : []), ...sp.lines, ...(goalOk ? [['Objetivo do patrocinador', goal.pay]] : [])], pts: mine.pts, pos, champ, fastest: fastestId, goal, goalOk, replay: RR && is3Dok() && RR.rep.frames.length > 20, why: mine.why });
}

// ---------- comandos por toque ----------
function hold(el, on, off) {
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); on(); el.classList.add('on'); });
  const up = () => { off(); el.classList.remove('on'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
}
hold($('#bLeft'), () => (ctl.left = true), () => (ctl.left = false));
hold($('#bRight'), () => (ctl.right = true), () => (ctl.right = false));
hold($('#bGas'), () => (ctl.gas = true), () => (ctl.gas = false));
hold($('#bBrake'), () => (ctl.brk = true), () => (ctl.brk = false));
{
  const wEl = $('#steerWheel'), svg = $('#wheelSvg');
  let pid = null, a0 = 0, base = 0;
  const ang = (e) => { const r = wEl.getBoundingClientRect(); return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI; };
  wEl.addEventListener('pointerdown', (e) => { e.preventDefault(); wEl.setPointerCapture(e.pointerId); pid = e.pointerId; a0 = ang(e); base = ctl.wheelAngle || 0; });
  wEl.addEventListener('pointermove', (e) => { if (e.pointerId !== pid) return; let d = ang(e) - a0; d = ((d + 540) % 360) - 180; ctl.wheelAngle = clamp(base + d, -130, 130); svg.style.transform = `rotate(${ctl.wheelAngle}deg)`; });
  const rel = (e) => { if (e.pointerId !== pid) return; pid = null; const back = () => { ctl.wheelAngle *= 0.6; if (Math.abs(ctl.wheelAngle) < 1) ctl.wheelAngle = 0; svg.style.transform = `rotate(${ctl.wheelAngle}deg)`; if (ctl.wheelAngle && pid === null) requestAnimationFrame(back); }; back(); };
  wEl.addEventListener('pointerup', rel); wEl.addEventListener('pointercancel', rel);
}
// teclado
const keys = {};
window.addEventListener('keydown', (e) => {
  if (!running) return;
  keys[e.code] = true; ctl.keys = true;
  if (e.code === 'KeyR') $('#bRadio').click();
  if (e.code === 'KeyC') nextCam();
  if (e.code === 'Escape' || e.code === 'KeyP') pauseMenu();
  if (e.code === 'KeyB' && R.C.pits) { R.boxReq = R.boxReq ? null : 'M'; radioMsg(R.boxReq ? 'Box nesta volta para médios.' : 'Box cancelado.', ''); }
  keyMap(); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; keyMap(); });
function keyMap() {
  ctl.left = !!(keys.ArrowLeft || keys.KeyA); ctl.right = !!(keys.ArrowRight || keys.KeyD);
  ctl.gas = !!(keys.ArrowUp || keys.KeyW); ctl.brk = !!(keys.ArrowDown || keys.KeyS || keys.Space);
}
document.addEventListener('visibilitychange', () => { if (document.hidden && running && !paused) pauseMenu(); });

// ganchos de teste
window.__gp = { newSeason, save, startReplay, get RP() { return RP; }, get R() { return R; }, get S() { return S; }, ctl, inp, autopilot: (on) => (window.__ap = on) };
try { ensureWorld(); } catch (e) { console.error(e); }
show(scrHome);
})();
