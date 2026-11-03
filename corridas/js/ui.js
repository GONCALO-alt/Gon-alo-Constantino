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
const DEFAULT_SETTINGS = { controls: 'arrows', sens: 1, abs: true, tc: true, line: true, steer: true, cam: 'cockpit', units: 'kmh', diff: 'medio', length: 0, vol: 0.8, voice: true, names: true, gfx: 'media' };
let S = null;
function load() { try { S = JSON.parse(localStorage.getItem(SAVE)); } catch (e) { S = null; } if (S) S.settings = { ...DEFAULT_SETTINGS, ...S.settings }; }
function save() { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { /* sem armazenamento */ } }
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
function helmetOf(p) { return { ...p.helmet, flagImg: p.helmet.pattern === 'bandeira' ? flagImg(p.nat) : null }; }
function paintHelmet(canvas, h) {
  const g = canvas.getContext('2d'), w = canvas.width; g.clearRect(0, 0, w, w);
  RENDER.drawHelmet(g, w / 2, w / 2, w * 0.4, h);
}

// ---------- pilotos rivais ----------
function makeDrivers(cat, seed) {
  const r = mulberry32(seed), n = cat === 'kart' ? 15 : 19, used = new Set([S.profile.num]), out = [];
  const natPool = COUNTRIES.map((c) => c[0]);
  for (let k = 0; k < n; k++) {
    const first = FIRST[Math.floor(r() * FIRST.length)], last = LAST[Math.floor(r() * LAST.length)];
    let num; do num = rndInt(r, 2, 99); while (used.has(num)); used.add(num);
    const pat = HELMET_PATTERNS[Math.floor(r() * HELMET_PATTERNS.length)].k;
    out.push({ id: 'd' + seed + '_' + k, first, last, code: last.replace(/[^A-Za-zÀ-ú]/g, '').slice(0, 3).toUpperCase(), nat: natPool[Math.floor(r() * natPool.length)],
      skill: 0.955 + r() * 0.045, num, helmet: { c1: HELMET_COLORS[Math.floor(r() * 12)], c2: HELMET_COLORS[Math.floor(r() * 12)], c3: HELMET_COLORS[Math.floor(r() * 12)], pattern: pat === 'bandeira' ? 'faixa' : pat },
      kc1: HELMET_COLORS[Math.floor(r() * 12)], kc2: HELMET_COLORS[Math.floor(r() * 12)] });
  }
  // lugares nas equipas (os melhores vão para as melhores, com alguma sorte à mistura)
  if (cat !== 'kart') {
    const seats = []; TEAMS[cat].forEach((t, ti) => { seats.push(ti, ti); });
    const mine = seats.indexOf(S.team); if (mine >= 0) seats.splice(mine, 1);
    out.sort((a, b) => b.skill + r() * 0.012 - (a.skill + r() * 0.012)).forEach((d, k) => (d.team = seats[k]));
  }
  return out;
}
function newSeason(cat, team) {
  S.cat = cat; S.team = team ?? null; S.round = 0; S.season = (S.season || 0) + 1;
  S.drivers = makeDrivers(cat, Math.floor(Math.random() * 1e9));
  S.points = { me: 0 }; S.wins = { me: 0 };
  for (const d of S.drivers) { S.points[d.id] = 0; S.wins[d.id] = 0; }
  const C = catById(cat), pool = TRACKS[cat].slice();
  S.calendar = pool.slice(0, C.rounds).map((t) => ({ name: t[0], nat: t[1], res: null }));
  S.dev = 0;
}
function newCareer(profile) {
  S = { ver: 1, profile, settings: { ...tmpSettings }, money: 600, kart: { motor: 0, chassis: 0, pneus: 0, travoes: 0 },
    owned: ['liso', 'faixa'], history: [], stats: { races: 0, wins: 0, podiums: 0, poles: 0, titles: 0 }, season: 0 };
  newSeason('kart', null);
  save();
}

// ---------- carros ----------
const teamOf = (i) => (S.cat === 'kart' || i == null ? null : TEAMS[S.cat][i]);
function playerParams() {
  if (S.cat === 'kart') {
    const k = S.kart;
    return carParams('kart', { power: 0.95 + 0.028 * k.motor, grip: 0.978 + 0.009 * (k.chassis + k.pneus), brake: 0.9 + 0.025 * k.travoes });
  }
  const tf = teamOf(S.team)[3] * (1 + 0.004 * S.dev);
  return carParams(S.cat, { power: tf, grip: Math.pow(tf, 0.6), aero: tf });
}
function aiParams(d) {
  if (S.cat === 'kart') return carParams('kart', { power: 1, grip: 1, brake: 1 });
  const tf = TEAMS[S.cat][d.team][3];
  return carParams(S.cat, { power: tf, grip: Math.pow(tf, 0.6), aero: tf });
}
function meDriver() {
  const p = S.profile, t = teamOf(S.team);
  return { id: 'me', first: p.first, last: p.last, code: p.last.replace(/[^A-Za-zÀ-ú]/g, '').slice(0, 3).toUpperCase() || 'EU', nat: p.nat, num: p.num, skill: 1,
    c1: t ? t[1] : p.helmet.c1, c2: t ? t[2] : p.helmet.c2, helmet: helmetOf(p), team: S.team, sponsor: S.sponsor ? S.sponsor.name : null };
}
function aiDriver(d) {
  const t = teamOf(d.team);
  const sp = SPONSORS[(d.team != null ? d.team * 3 : d.num) % SPONSORS.length][0];
  return { ...d, c1: t ? t[1] : d.kc1, c2: t ? t[2] : d.kc2, helmet: { ...d.helmet }, sponsor: sp };
}
const trackCache = {};
function getTrack(name, cat) { const k = name + '|' + cat; return trackCache[k] || (trackCache[k] = buildTrack(name, cat)); }
const nameOf = (id) => (id === 'me' ? S.profile.first + ' ' + S.profile.last : (() => { const d = S.drivers.find((x) => x.id === id); return d ? d.first + ' ' + d.last : '?'; })());
const driverById = (id) => (id === 'me' ? meDriver() : aiDriver(S.drivers.find((x) => x.id === id)));

// ---------- navegação ----------
let screen = null;
function show(fn, ...args) { screen = [fn, args]; document.body.classList.add('carbon'); $('#race').hidden = true; app.hidden = false; app.innerHTML = fn(...args); afterRender(); }
function rerender() { if (screen) show(screen[0], ...screen[1]); }
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
function scrHome() {
  return `<div class="screen"><div class="logo"><div class="mark"><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span></div>
  <h1>Grelha de <b>Partida</b></h1><p>Começa no karting, ganha campeonatos e sobe à Fórmula 4, Fórmula 3, Fórmula 2 e Fórmula 1.</p></div>
  <div class="stack">${S ? `<button class="btn primary" data-a="hub">Continuar carreira</button><div class="muted" style="text-align:center">${esc(S.profile.first + ' ' + S.profile.last)} · ${catById(S.cat).n} · época ${S.season}</div>` : ''}
  <button class="btn ${S ? '' : 'primary'}" data-a="newCareer">Nova carreira</button><button class="btn" data-a="settings">Definições</button></div>
  <p class="muted" style="text-align:center;margin-top:auto">Joga com o telemóvel na horizontal. No computador: setas ou WASD, espaço para travar, R para o rádio.</p></div>`;
}
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
  after(() => paintHelmet($('#helmCv'), { ...p.helmet, flagImg: p.helmet.pattern === 'bandeira' ? flagImg(p.nat) : null }));
  const owned = free ? HELMET_PATTERNS.map((x) => x.k) : S.owned;
  const sw = (k) => `<div class="swatches">${HELMET_COLORS.map((c) => `<button style="background:${c}" class="${p.helmet[k] === c ? 'on' : ''}" data-a="hcol" data-v="${k}|${c}" aria-label="cor"></button>`).join('')}</div>`;
  return `<div class="card helmetbox"><canvas id="helmCv" width="320" height="320"></canvas><div class="muted">${flagOf(p.nat)} #${p.num}</div></div>
  <div class="card"><h2>Cor principal</h2>${sw('c1')}<h2>Cor do desenho</h2>${sw('c2')}<h2>Terceira cor</h2>${sw('c3')}
  <h2>Desenho</h2><div class="seg">${HELMET_PATTERNS.map((x) => { const has = owned.includes(x.k); return `<button class="${p.helmet.pattern === x.k ? 'on' : ''}" data-a="hpat" data-v="${x.k}">${x.n}${has || free ? '' : ` · ${eur(x.cost)}`}</button>`; }).join('')}</div>
  ${free ? '<p class="muted">Na carreira, alguns desenhos custam dinheiro. Agora podes escolher qualquer um.</p>' : `<p class="muted">Tens <span class="money">${eur(S.money)}</span>. Os desenhos comprados ficam teus.</p>`}</div>`;
}
function settingsControls(compact) {
  const s = ST();
  const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${String(s[k]) === String(v) ? 'on' : ''}" data-a="set" data-v="${k}|${v}">${l}</button>`).join('')}</div>`;
  return `<label class="field">Direção</label>${seg('controls', [['arrows', 'Setas ◀ ▶'], ['wheel', 'Volante']])}
  <label class="field">Dificuldade dos rivais</label>${seg('diff', [['facil', 'Fácil'], ['medio', 'Médio'], ['dificil', 'Difícil'], ['lenda', 'Lenda']])}
  <label class="field">Ajudas</label><div class="seg">${[['abs', 'ABS'], ['tc', 'Controlo de tração'], ['steer', 'Direção assistida'], ['line', 'Trajetória ideal']].map(([k, l]) => `<button class="${s[k] ? 'on' : ''}" data-a="tog" data-v="${k}">${l}</button>`).join('')}</div>
  ${compact ? '' : `<label class="field">Duração das corridas</label>${seg('length', [[0, 'Curta'], [1, 'Média'], [2, 'Longa']])}
  <label class="field">Câmara</label>${seg('cam', [['cockpit', 'Primeira pessoa'], ['chase', 'Atrás do carro'], ['rot', 'Vista de cima'], ['fixed', 'Mapa fixo']])}
  <label class="field">Qualidade gráfica</label>${seg('gfx', [['baixa', 'Baixa (mais fluido)'], ['media', 'Média'], ['alta', 'Alta (sombras e detalhe)']])}
  <label class="field">Unidades</label>${seg('units', [['kmh', 'km/h'], ['mph', 'mph']])}
  <label class="field">Sensibilidade da direção · ${Math.round(s.sens * 100)}%</label><input type="range" min="0.6" max="1.5" step="0.05" value="${s.sens}" data-i="sens">
  <label class="field">Volume · ${Math.round(s.vol * 100)}%</label><input type="range" min="0" max="1" step="0.05" value="${s.vol}" data-i="vol">
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
  const tabs = [['hub', 'Paddock'], ['garage', S.cat === 'kart' ? 'Garagem' : 'Equipa'], ['helmet', 'Capacete'], ['champ', 'Campeonato'], ['career', 'Carreira'], ['settings', 'Definições']];
  return `<div class="seg" style="flex-wrap:nowrap;overflow-x:auto">${tabs.map(([k, l]) => `<button class="${k === active ? 'on' : ''}" data-a="${k}">${l}</button>`).join('')}</div>`;
}
function champTable(limit) {
  const rows = [['me', S.points.me]].concat(S.drivers.map((d) => [d.id, S.points[d.id] || 0])).sort((a, b) => b[1] - a[1] || (S.wins[b[0]] || 0) - (S.wins[a[0]] || 0));
  const meIdx = rows.findIndex((r) => r[0] === 'me');
  return { rows: limit ? rows.slice(0, limit) : rows, meIdx };
}
function scrHub() {
  const p = S.profile, C = catById(S.cat), t = teamOf(S.team), rd = S.calendar[S.round];
  const ch = champTable();
  after(() => { paintHelmet($('#helmCv'), helmetOf(p)); if (rd) drawTrackPreview($('#trkCv'), getTrack(rd.name, S.cat)); });
  return `<div class="screen"><div class="topbar"><h1>${C.n} <em>· época ${S.season}</em></h1><span class="money">${eur(S.money)}</span></div>${navBar('hub')}
  <div class="grid2">
  <div class="card"><div class="row"><canvas id="helmCv" width="160" height="160" style="width:80px;height:80px"></canvas><div class="grow"><h3>${flagOf(p.nat)} ${esc(p.first)} ${esc(p.last)}</h3><div class="muted">#${p.num} · ${t ? `<span class="teamdot" style="background:${t[1]}"></span>${t[0]}` : 'Piloto de kart independente'}</div></div></div>
  <div class="kv"><div><small>Campeonato</small><b>P${ch.meIdx + 1}</b></div><div><small>Pontos</small><b>${S.points.me}</b></div><div><small>Vitórias</small><b>${S.wins.me}</b></div><div><small>Ronda</small><b>${Math.min(S.round + 1, S.calendar.length)}/${S.calendar.length}</b></div></div>
  ${S.sponsor ? `<div class="row"><span class="tag" style="border-color:${S.sponsor.c}">Patrocinador</span><b class="grow">${esc(S.sponsor.name)}</b></div>` : '<button class="btn" data-a="sponsors">Escolher um patrocinador</button>'}
  ${S.cat !== 'kart' ? `<div class="muted">Relação com a equipa: ${S.teamRel >= 10 ? 'muito boa' : S.teamRel >= 0 ? 'boa' : S.teamRel > -15 ? 'tensa' : 'má'}</div>` : ''}</div>
  ${rd ? `<div class="card"><h2>Próxima corrida</h2><h3>${flagOf(rd.nat)} ${rd.name}</h3><canvas class="trackprev" id="trkCv" width="600" height="300"></canvas>
  <div class="muted">${(getTrack(rd.name, S.cat).len / 1000).toFixed(2)} km · ${C.laps[S.settings.length]} voltas${C.pits ? ` · paragem nas boxes ${C.mandatory ? 'obrigatória' : 'opcional'}` : ''}</div>
  <button class="btn primary" data-a="weekend">Ir para o fim de semana de corrida</button></div>` : `<div class="card"><h2>Época terminada</h2><button class="btn primary" data-a="seasonEnd">Ver o final da época</button></div>`}
  </div></div>`;
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
function scrGarage() {
  const C = catById(S.cat);
  if (S.cat === 'kart') {
    return `<div class="screen"><div class="topbar"><h1>Garagem <em>· kart</em></h1><span class="money">${eur(S.money)}</span></div>${navBar('garage')}
    <div class="grid2"><div class="card"><h2>Peças do kart</h2>${KART_PARTS.map((pt) => { const lv = S.kart[pt.k], cost = pt.cost[lv]; return `<div class="part"><div class="ico">${pt.i}</div><div><b>${pt.n}</b><div class="muted">${pt.d}</div><div class="lv">${[0, 1, 2, 3, 4].map((i) => `<span class="${i < lv ? 'on' : ''}"></span>`).join('')}</div></div>
    <button class="btn small ${lv < 5 && S.money >= cost ? 'primary' : ''}" data-a="buyPart" data-v="${pt.k}" ${lv >= 5 || S.money < cost ? 'disabled' : ''}>${lv >= 5 ? 'Máx.' : eur(cost)}</button></div>`; }).join('')}</div>
    <div class="card"><h2>Como funciona</h2><p class="muted">Ganhas dinheiro em cada corrida (mais quanto melhor for o resultado). As peças tornam o teu kart mais rápido do que o dos rivais. Acaba o campeonato nos 3 primeiros para receberes propostas da Fórmula 4.</p>
    <div class="kv"><div><small>Potência</small><b>${Math.round((0.95 + 0.028 * S.kart.motor) * 100)}%</b></div><div><small>Aderência</small><b>${Math.round((0.978 + 0.009 * (S.kart.chassis + S.kart.pneus)) * 100)}%</b></div><div><small>Travagem</small><b>${Math.round((0.9 + 0.025 * S.kart.travoes) * 100)}%</b></div></div><p class="muted">100% = igual ao kart médio dos rivais.</p></div></div></div>`;
  }
  const t = teamOf(S.team), devCost = Math.round(C.salary * 3 * (1 + S.dev * 0.6));
  return `<div class="screen"><div class="topbar"><h1>Equipa <em>· ${t[0]}</em></h1><span class="money">${eur(S.money)}</span></div>${navBar('garage')}
  <div class="grid2"><div class="card"><h2>O teu carro</h2><div class="row"><span class="teamdot" style="background:${t[1]};height:40px;width:8px"></span><div class="grow"><h3>${t[0]}</h3><div class="muted">${C.n} · competitividade ${'★'.repeat(Math.max(1, Math.round((t[3] - 0.982) * 160)))}</div></div></div>
  <div class="kv"><div><small>Salário/corrida</small><b>${eur(C.salary * (0.6 + (t[3] - 0.98) * 15))}</b></div><div><small>Desenvolvimento</small><b>${S.dev}/5</b></div></div>
  <button class="btn ${S.dev < 5 && S.money >= devCost ? 'primary' : ''}" data-a="dev" ${S.dev >= 5 || S.money < devCost ? 'disabled' : ''}>${S.dev >= 5 ? 'Desenvolvimento no máximo' : `Pagar desenvolvimento do carro · ${eur(devCost)}`}</button>
  <p class="muted">Cada nível de desenvolvimento dá +0,4% de potência e aderência até ao fim da época.</p></div>
  <div class="card"><h2>Equipas da categoria</h2>${TEAMS[S.cat].map((x, i) => `<div class="row"><span class="teamdot" style="background:${x[1]}"></span><div class="grow">${x[0]}${i === S.team ? ' <span class="tag red">a tua</span>' : ''}</div><span class="muted">${'★'.repeat(Math.max(1, Math.round((x[3] - 0.982) * 160)))}</span></div>`).join('')}</div></div></div>`;
}
function scrHelmet() {
  return `<div class="screen"><div class="topbar"><h1>Capacete</h1><span class="money">${eur(S.money)}</span></div>${navBar('helmet')}<div class="grid2">${helmetEditor(S.profile, false)}</div></div>`;
}
function scrChamp() {
  const ch = champTable();
  return `<div class="screen"><div class="topbar"><h1>Campeonato <em>· ${catById(S.cat).n}</em></h1></div>${navBar('champ')}
  <div class="grid2"><div class="card"><h2>Classificação de pilotos</h2><div class="tbl"><table><tr><th>Pos</th><th>Piloto</th><th>Vit.</th><th>Pts</th></tr>
  ${ch.rows.map(([id, pts], k) => { const d = driverById(id); return `<tr class="${id === 'me' ? 'me' : ''}"><td class="pos">${k + 1}</td><td><span class="teamdot" style="background:${d.c1}"></span>${flagOf(d.nat)} ${esc(d.first[0] + '. ' + d.last)}</td><td>${S.wins[id] || 0}</td><td><b>${pts}</b></td></tr>`; }).join('')}</table></div></div>
  <div class="card"><h2>Calendário</h2><div class="cal">${S.calendar.map((r, k) => `<div class="r ${k === S.round ? 'next' : k < S.round ? 'done' : ''}"><b>${k + 1}</b><span>${flagOf(r.nat)}</span><span>${r.name}</span><span class="muted">${r.res ? 'P' + r.res : k === S.round ? 'próxima' : ''}</span></div>`).join('')}</div>
  <p class="muted">Pontos por corrida: ${POINTS.join(', ')} (do 1.º ao 10.º).</p></div></div></div>`;
}
function scrCareer() {
  const st = S.stats;
  return `<div class="screen"><div class="topbar"><h1>Carreira</h1></div>${navBar('career')}
  <div class="grid2"><div class="card"><h2>Estatísticas</h2><div class="kv"><div><small>Corridas</small><b>${st.races}</b></div><div><small>Vitórias</small><b>${st.wins}</b></div><div><small>Pódios</small><b>${st.podiums}</b></div><div><small>Poles</small><b>${st.poles}</b></div><div><small>Títulos</small><b>${st.titles}</b></div></div></div>
  <div class="card"><h2>Percurso</h2>${S.history.length ? S.history.map((h) => `<div class="row"><b>Época ${h.season}</b><span class="grow">${catById(h.cat).n}${h.team ? ' · ' + h.team : ''}</span><span>P${h.pos} · ${h.pts} pts</span></div>`).join('') : '<p class="muted">Ainda estás na primeira época.</p>'}
  <p class="muted">Caminho: Karting → Fórmula 4 → Fórmula 3 → Fórmula 2 → Fórmula 1.</p></div></div></div>`;
}
// fim de semana: escolher pneus e qualificação
let weekend = null;
function scrWeekend() {
  const rd = S.calendar[S.round], C = catById(S.cat);
  if (!(weekend && weekend.round === S.round)) {
    const r = Math.random(), wx = r < 0.66 ? { start: 0, end: 0, at: 0.5, txt: '☀️ Seco' } : r < 0.82 ? { start: 0.75, end: 0.7, at: 0.5, txt: '🌧️ Chuva durante a corrida' } : r < 0.92 ? { start: 0, end: 0.8, at: 0.3 + Math.random() * 0.3, txt: '🌦️ Seco no início, chuva a meio' } : { start: 0.7, end: 0, at: 0.25 + Math.random() * 0.3, txt: '🌤️ Molhado no início, depois seca' };
    weekend = { round: S.round, grid: null, tyre: wx.start > 0.3 ? (C.pits ? 'I' : 'W') : 'M', quali: null, weather: wx, goal: S.sponsor ? makeGoal() : null };
  }
  after(() => drawTrackPreview($('#trkCv'), getTrack(rd.name, S.cat)));
  const gridHtml = weekend.grid ? `<div class="card"><h2>Grelha de partida</h2><div class="tbl"><table><tr><th>Pos</th><th>Piloto</th><th>Tempo</th></tr>${weekend.grid.map((g, k) => { const d = driverById(g.id); return `<tr class="${g.id === 'me' ? 'me' : ''}"><td class="pos">${k + 1}</td><td><span class="teamdot" style="background:${d.c1}"></span>${flagOf(d.nat)} ${esc(d.first[0] + '. ' + d.last)}</td><td>${fmtTime(g.t)}</td></tr>`; }).join('')}</table></div></div>` : '';
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>${flagOf(rd.nat)} ${rd.name}</h1></div>
  <div class="grid2"><div class="card"><h2>Ronda ${S.round + 1} de ${S.calendar.length}</h2><canvas class="trackprev" id="trkCv" width="600" height="300"></canvas>
  <div class="muted">${(getTrack(rd.name, S.cat).len / 1000).toFixed(2)} km · ${C.laps[S.settings.length]} voltas</div>
  <div class="row"><b>Previsão:</b><span class="grow">${weekend.weather.txt}</span></div>
  ${weekend.goal ? `<div class="row"><span class="tag">${esc(S.sponsor.name)}</span><span class="grow muted">Objetivo: ${weekend.goal.txt} · prémio ${eur(weekend.goal.pay)}</span></div>` : ''}
  <button class="btn" data-a="practice">Treinos livres (conhecer a pista)</button>
  ${weekend.grid ? '' : `<button class="btn primary" data-a="quali">Qualificação: fazer a minha volta</button><button class="btn" data-a="qualiSim">Simular a qualificação</button>`}
  <h2>Pneus para a partida</h2><div class="seg">${tyreChoices(C).map((k) => { const c = COMPOUNDS[k]; return `<button class="${weekend.tyre === k ? 'on' : ''}" data-a="tyre" data-v="${k}"><span class="cmp" style="border-color:${c.c}"></span>${C.pits || k === 'W' ? c.n : 'Slicks (seco)'}</button>`; }).join('')}</div>
  <p class="muted">${C.pits ? `Macios: rápidos mas gastam depressa. Duros: lentos mas duram. Intermédios e chuva: para pista molhada. ${C.mandatory ? 'Em seco tens de usar dois tipos de pneus (pelo menos uma paragem), senão levas 20 s de penalização.' : 'Podes parar nas boxes quando quiseres, pelo rádio.'}` : 'Nesta categoria não há paragens: escolhe bem os pneus para o tempo que vai fazer.'}</p>
  ${weekend.grid ? '<button class="btn go" data-a="race">Para a grelha!</button>' : ''}</div>${gridHtml}</div></div>`;
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
  const offers = S.sponsorOffers || (S.sponsorOffers = SPONSORS.slice().sort(() => Math.random() - 0.5).slice(0, 3).map(([name, c]) => ({ name, c, bonus: Math.round(catById(S.cat).prize * (0.8 + Math.random() * 1.2)) })));
  return `<div class="screen"><div class="topbar"><button class="back" data-a="hub">‹ Paddock</button><h1>Patrocinadores</h1><span class="money">${eur(S.money)}</span></div>
  <div class="grid2">${offers.map((o, k) => `<div class="card"><h3><span class="teamdot" style="background:${o.c};height:22px"></span>${esc(o.name)}</h3><p class="muted">Paga ${eur(o.bonus)} já e um prémio por cada objetivo cumprido em corrida. O nome aparece no teu ${S.cat === 'kart' ? 'kart' : 'carro'}.</p><button class="btn primary" data-a="sponsor" data-v="${k}">Assinar com ${esc(o.name)}</button></div>`).join('')}</div></div>`;
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
function scrResults(res, info) {
  return `<div class="screen"><div class="topbar"><h1>Resultado <em>· ${info.track}</em></h1><span class="money">+${eur(info.money)}</span></div>
  <div class="grid2"><div class="card"><h2>Classificação da corrida</h2><div class="tbl"><table><tr><th>Pos</th><th>Piloto</th><th>Tempo</th><th>Melhor volta</th><th>Pts</th></tr>
  ${res.map((r) => `<tr class="${r.isPlayer ? 'me' : ''}"><td class="pos">${r.pos}</td><td><span class="teamdot" style="background:${r.d.c1}"></span>${flagOf(r.d.nat)} ${esc(r.d.first[0] + '. ' + r.d.last)}${r.penalty ? ` <span class="tag">+${r.penalty}s</span>` : ''}</td><td>${r.dnf ? 'Desistiu' : r.gapTxt}</td><td style="${info.fastest === r.id ? 'color:var(--purple);font-weight:700' : ''}">${fmtTime(r.best)}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table></div></div>
  <div class="card"><h2>O teu dia</h2><h3>${info.pos <= 3 ? ['🥇 Vitória!', '🥈 Segundo lugar', '🥉 Terceiro lugar'][info.pos - 1] : 'P' + info.pos}</h3>
  <div class="kv"><div><small>Pontos</small><b>+${info.pts}</b></div><div><small>Prémio</small><b>${eur(info.money)}</b></div><div><small>Campeonato</small><b>P${info.champ}</b></div></div>
  ${info.goal ? `<p class="muted">${esc(S.sponsor.name)}: ${info.goal.txt} — ${info.goalOk ? `<b style="color:var(--green)">cumprido! +${eur(info.goal.pay)}</b>` : 'não cumprido'}</p>` : ''}
  ${info.replay ? '<button class="btn" data-a="replay">🎬 Ver repetição</button>' : ''}
  <button class="btn primary" data-a="hub">Voltar ao paddock</button></div></div></div>`;
}
function scrSeasonEnd() {
  const ch = champTable(), pos = ch.meIdx + 1, C = catById(S.cat), nx = nextCat(S.cat);
  let offers = S.offers;
  if (!offers) {
    offers = [];
    if (nx) {
      const tm = TEAMS[nx.id];
      const pickFrom = (a, b, n) => { const idx = []; for (let i = a; i <= b; i++) idx.push(i); idx.sort(() => Math.random() - 0.5); return idx.slice(0, n); };
      if (pos === 1) offers = pickFrom(0, 4, 3); else if (pos <= 3) offers = pickFrom(2, 7, 3); else if (pos <= 6) offers = pickFrom(7, 9, 1);
      offers = offers.map((i) => ({ cat: nx.id, team: i, name: tm[i][0], salary: Math.round(nx.salary * (0.6 + (tm[i][3] - 0.98) * 15)) }));
    } else if (S.cat === 'f1') {
      const tm = TEAMS.f1; const a = pos <= 3 ? [0, 4] : pos <= 10 ? [3, 8] : [7, 9];
      for (let i = a[0]; i <= a[1] && offers.length < 3; i++) if (i !== S.team) offers.push({ cat: 'f1', team: i, name: tm[i][0], salary: Math.round(C.salary * (0.6 + (tm[i][3] - 0.98) * 15)) });
    }
    S.offers = offers;
    if (!S.closed) {
      S.closed = true;
      const t = teamOf(S.team);
      S.history.push({ season: S.season, cat: S.cat, pos, pts: S.points.me, team: t ? t[0] : null });
      if (pos === 1) S.stats.titles++;
      S.money += pos <= 3 ? [5, 3, 2][pos - 1] * C.prize : 0;
      save();
    }
  }
  const title = pos === 1 ? (S.cat === 'f1' ? '🏆 Campeão do Mundo de Fórmula 1!' : '🏆 Campeão!') : `Terminaste em P${pos}`;
  return `<div class="screen"><div class="topbar"><h1>Fim da época <em>· ${C.n}</em></h1><span class="money">${eur(S.money)}</span></div>
  <div class="grid2"><div class="card"><h2>Campeonato</h2><h3>${title}</h3><p class="muted">${pos <= 3 ? `Bónus do campeonato: ${eur([5, 3, 2][pos - 1] * C.prize)}.` : ''} ${nx ? (pos <= 3 ? `As equipas da ${nx.n} querem-te!` : pos <= 6 ? `Uma equipa pequena da ${nx.n} oferece-te um lugar.` : `Ainda não chega para a ${nx.n}. Faz mais uma época para mostrares o teu valor.`) : ''}</p>
  ${champTable(5).rows.map(([id, pts], k) => `<div class="row"><b>${k + 1}.</b><span class="grow">${flagOf(driverById(id).nat)} ${esc(nameOf(id))}</span><b>${pts}</b></div>`).join('')}</div>
  <div class="card"><h2>Propostas</h2>${offers.length ? offers.map((o, k) => { const t = TEAMS[o.cat][o.team]; return `<div class="row"><span class="teamdot" style="background:${t[1]};height:34px"></span><div class="grow"><b>${o.name}</b><div class="muted">${catById(o.cat).n} · ${'★'.repeat(Math.max(1, Math.round((t[3] - 0.982) * 160)))} · ${eur(o.salary)}/corrida</div></div><button class="btn small primary" data-a="accept" data-v="${k}">Assinar</button></div>`; }).join('') : '<p class="muted">Sem propostas desta vez.</p>'}
  <button class="btn" data-a="repeat">${S.cat === 'kart' && !offers.length ? 'Nova época de karting' : offers.length ? `Ficar mais uma época na ${C.n}` : `Nova época na ${C.n}`}</button></div></div></div>`;
}

// ---------- ações ----------
const readDraft = () => { const f = $('#fFirst'); if (!f) return; draft.first = f.value.trim(); draft.last = $('#fLast').value.trim(); draft.nat = $('#fNat').value; draft.num = clamp(parseInt($('#fNum').value, 10) || 7, 1, 99); };
const ACT = {
  home: () => show(scrHome),
  newCareer: () => { draft = null; show(scrNew, 1); },
  newStep2: () => { readDraft(); if (!draft.first || !draft.last) { alertBox('Escreve o teu nome e apelido.'); return; } show(scrNew, 2); },
  newBack: () => show(scrNew, 1),
  startCareer: () => { newCareer({ ...draft, helmet: { ...draft.helmet } }); S.owned = Array.from(new Set(['liso', 'faixa', draft.helmet.pattern])); save(); show(scrHub); },
  hub: () => show(scrHub), garage: () => show(scrGarage), helmet: () => show(scrHelmet), champ: () => show(scrChamp), career: () => show(scrCareer), settings: () => show(scrSettings),
  set: (v) => { const [k, val] = v.split('|'); ST()[k] = isNaN(+val) || ['controls', 'diff', 'cam', 'units', 'gfx'].includes(k) ? val : +val; if (S) save(); readDraft(); rerender(); },
  tog: (k) => { ST()[k] = !ST()[k]; if (S) save(); readDraft(); rerender(); },
  hcol: (v) => { const [k, c] = v.split('|'); const p = S && screen[0] !== scrNew ? S.profile : draft; p.helmet[k] = c; if (S) save(); rerender(); },
  hpat: (k) => {
    if (S && screen[0] !== scrNew) {
      const pat = HELMET_PATTERNS.find((x) => x.k === k);
      if (!S.owned.includes(k)) { if (S.money < pat.cost) { alertBox(`Precisas de ${eur(pat.cost)} para este desenho.`); return; } S.money -= pat.cost; S.owned.push(k); }
      S.profile.helmet.pattern = k; save();
    } else draft.helmet.pattern = k;
    rerender();
  },
  buyPart: (k) => { const pt = KART_PARTS.find((x) => x.k === k), lv = S.kart[k]; if (lv >= 5 || S.money < pt.cost[lv]) return; S.money -= pt.cost[lv]; S.kart[k]++; save(); rerender(); },
  dev: () => { const C = catById(S.cat), cost = Math.round(C.salary * 3 * (1 + S.dev * 0.6)); if (S.dev >= 5 || S.money < cost) return; S.money -= cost; S.dev++; save(); rerender(); },
  wipe: () => confirmBox('Apagar a carreira? Não dá para desfazer.', () => { try { localStorage.removeItem(SAVE); } catch (e) { /* */ } S = null; show(scrHome); }),
  weekend: () => show(scrWeekend),
  tyre: (k) => { weekend.tyre = k; rerender(); },
  quali: () => startSession('quali'),
  qualiSim: () => { weekend.grid = simQuali(null); rerender(); },
  race: () => startSession('race'),
  practice: () => startSession('practice'),
  replay: () => startReplay(),
  sponsors: () => show(scrSponsor),
  sponsor: (k) => { const o = S.sponsorOffers[+k]; S.sponsor = { name: o.name, c: o.c }; S.money += o.bonus; S.sponsorOffers = null; save(); show(scrHub); },
  seasonEnd: () => show(scrSeasonEnd),
  accept: (k) => { const o = S.offers[+k]; S.offers = null; S.closed = false; if (o.cat !== S.cat) { S.sponsor = null; } S.teamRel = 0; newSeason(o.cat, o.team); save(); show(scrHub); },
  repeat: () => { const cat = S.cat, team = S.team; S.offers = null; S.closed = false; newSeason(cat, team); save(); show(scrHub); },
};
const CHG = {
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
  const list = S.drivers.map((d) => ({ id: d.id, t: speedProfile(T, aiParams(d)).lap / (d.skill * diff) * (1 + (Math.random() - 0.5) * 0.006) }));
  const mine = myTime ?? speedProfile(T, playerParams()).lap / (0.955 * (1 + (Math.random() - 0.5) * 0.01));
  list.push({ id: 'me', t: mine });
  list.sort((a, b) => a.t - b.t);
  if (list[0].id === 'me') S.stats.poles++;
  return list;
}

// ---------- sessão de corrida ----------
let R = null, running = false, view = { shake: 0, braking: false }, inp = { steer: 0, throttle: 0, brake: 0 }, ctl = { left: false, right: false, gas: false, brk: false, wheel: null };
function startSession(mode) {
  const rd = S.calendar[S.round], C = catById(S.cat), T = getTrack(rd.name, S.cat);
  const laps = C.laps[S.settings.length];
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
    return { driver: aiDriver(d), params: aiParams(d), pace: d.skill * diff, tyre, pitLap };
  });
  const grid = mode === 'race' && weekend.grid ? weekend.grid.map((g) => g.id) : null;
  R = new Race({ T, cat: S.cat, mode, laps: mode === 'quali' ? 1 : laps, field, player: { driver: meDriver(), params: playerParams(), tyre: weekend.tyre }, grid, weather: mode === 'race' ? { ...wx } : { start: wx.start, end: wx.start, at: 1 } });
  R.onFlag = (k) => { if (k === 'sc') bigMsg('SAFETY CAR'); else if (k === 'red') bigMsg('BANDEIRA VERMELHA'); else if (k === 'green') bigMsg('BANDEIRA VERDE'); };
  R.onMsg = (text, kind) => radioMsg(text, kind);
  R.onLight = (n) => { lights(n); };
  R.onHit = (f) => { view.shake = Math.min(1.2, f / 12); AUDIO.hit(f); const fl = $('#flash'); fl.classList.add('on'); setTimeout(() => fl.classList.remove('on'), 120); try { navigator.vibrate && navigator.vibrate(Math.min(200, f * 8)); } catch (e) { /* */ } };
  enterRace();
  if (mode === 'practice') radioMsg('Treinos livres: dá as voltas que quiseres. Sai pela pausa quando acabares.', '');
  else if (mode === 'quali') radioMsg('Volta lançada. Dá tudo até à meta!', '');
  else radioMsg(`Verifica os comandos. ${laps} voltas. Boa sorte!`, '');
}
function enterRace() {
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
  try { if (document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().then(() => screen.orientation?.lock?.('landscape').catch(() => {})).catch(() => {}); } catch (e) { /* */ }
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
let radioTimer = null;
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
  if (R.flag === 'sc') stx = 'SAFETY CAR · SEM ULTRAPASSAGENS';
  else if (R.flag === 'amarela') stx = stx || 'BANDEIRA AMARELA';
  else if (R.flag === 'azul') stx = stx || 'BANDEIRA AZUL';
  if (R.phase === 'red') stx = 'BANDEIRA VERMELHA';
  $('#hStatus').textContent = stx;
  const fl = $('#hFlag'); fl.className = 'hud flagbox ' + (R.phase === 'red' ? 'red' : R.flag || ''); fl.hidden = !(R.flag || R.phase === 'red');
  fl.textContent = R.phase === 'red' ? 'BANDEIRA VERMELHA' : R.flag === 'sc' ? 'SAFETY CAR' : R.flag === 'amarela' ? 'AMARELA' : R.flag === 'azul' ? 'AZUL' : '';
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
  if (me.best && me.lap >= 1 && me.bestCp) {
    const cp = me.lastCp, tNow = me.cp[me.lap * NCP + cp], ref = me.bestCp[cp];
    if (tNow !== undefined && ref !== undefined) { const d = tNow - me.lapStart - ref; dEl.textContent = (d > 0 ? '+' : '') + d.toFixed(2); dEl.className = 'delta ' + (d > 0 ? 'up' : 'down'); }
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
  <div class="muted">Modo de condução</div><div class="seg">${mode(2, 'Atacar')}${mode(1, 'Normal')}${mode(0, 'Poupar pneus')}</div>
  ${R.teammate && R.teammate() ? `<div class="muted">Colega de equipa: ${esc(R.teammate().d.last)}</div><div class="seg">${R.teamOrder ? '<button data-r="letpass">Deixar o colega passar</button><button data-r="refuse">Recusar a ordem</button>' : '<button data-r="mate">Pedir ao colega para me deixar passar</button>'}</div>` : ''}
  <div class="seg" style="flex-direction:column"><button data-r="tyres">🛞 Como estão os pneus?</button><button data-r="damage">🔧 Como está o carro?</button><button data-r="weather">🌦️ O tempo vai mudar?</button><button data-r="gaps">⏱ Diferenças para a frente e para trás?</button><button data-r="pace">📊 Como está o meu ritmo?</button><button data-r="laps">🏁 Quantas voltas faltam?</button>${C.pits ? '<button data-r="rivals">🔧 Estratégia dos rivais?</button>' : ''}</div>`;
  sh.hidden = false;
}
$('#radioSheet').addEventListener('click', (e) => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  const me = R.me, order = R.standings(), pos = order.indexOf(me) + 1, a = b.dataset.r;
  AUDIO.click();
  if (a === 'close') { $('#radioSheet').hidden = true; return; }
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
  if (!n) { RP = null; show(scrHub); return; }
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
  else if (a === 'exit') { RP = null; $('#replayBar').hidden = true; $('#race').classList.remove('replaying'); show(scrHub); return; }
  replayBar();
});
function endSession() {
  running = false; AUDIO.stopEngine();
  try { speechSynthesis.cancel(); } catch (e) { /* */ }
  if (R.mode === 'quali') { const t = R.me.laps[0]; weekend.grid = simQuali(t); show(scrWeekend); return; }
  let res = R.results();
  if (R.dnf) { const me = res.find((r) => r.isPlayer); res = res.filter((r) => !r.isPlayer).map((r, k) => ({ ...r, pos: k + 1, pts: POINTS[k] || 0 })); res.push({ ...me, pos: res.length + 1, pts: 0, dnf: true }); }
  const C = catById(S.cat);
  for (const r of res) { S.points[r.id] = (S.points[r.id] || 0) + r.pts; if (r.pos === 1) S.wins[r.id] = (S.wins[r.id] || 0) + 1; }
  const mine = res.find((r) => r.isPlayer), pos = mine.pos;
  const prize = Math.round((pos <= 10 ? C.prize * (1.6 - pos * 0.12) : C.prize * 0.25) + (C.salary ? C.salary * (0.6 + (teamOf(S.team)[3] - 0.98) * 15) : 0));
  const goal = weekend && weekend.goal, goalOk = checkGoal(goal, res, mine, R);
  S.money += prize + (goalOk ? goal.pay : 0); S.stats.races++; if (pos === 1) S.stats.wins++; if (pos <= 3) S.stats.podiums++;
  lastRace = R;
  S.calendar[S.round].res = mine.dnf ? 'DNF' : pos; S.round++; weekend = null; save();
  const champ = champTable().meIdx + 1;
  show(scrResults, res, { track: R.T.name, money: prize + (goalOk ? goal.pay : 0), pts: mine.pts, pos, champ, fastest: R.fastest && R.fastest.id, goal, goalOk, replay: is3Dok() && R.rep.frames.length > 20 });
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
show(scrHome);
})();
