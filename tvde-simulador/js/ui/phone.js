// Telemóvel virtual com a app de motorista (RIDO Driver) e outras apps.
import { APP_NAME, CFG, VEHICLES, CITY_NAME } from '../config.js';
import { esc, eur, hhmm, kmStr, dur, weekday, stars, clamp, isWeekend } from '../util.js';
import { avatar, PERSONALITIES } from '../game/passengers.js';
import { ACHIEVEMENTS, LEVEL_TITLES, levelTitle, reputationTier, xpForLevel, objectiveProgress, hourOf } from '../game/economy.js';
import { WEATHERS } from '../world/sky.js';

const PHASE = { toPickup: 'A caminho da recolha', waiting: 'À espera do passageiro', boarded: 'Passageiro a bordo', onTrip: 'Em viagem', arrived: 'Chegaste ao destino' };
const FIN_ICON = { trip: '🚗', tip: '🎁', bonus: '🎉', fuel: '⛽', maint: '🔧', wash: '🧽', fine: '🚨', fixed: '📄', other: '💶' };

export class Phone {
  constructor(game, map) {
    this.g = game; this.map = map;
    this.el = document.getElementById('phone');
    this.el.innerHTML = '<div class="screen"></div>';
    this.scr = this.el.querySelector('.screen');
    this.open = false; this.screen = 'home'; this.tab = 'inicio'; this.mapZoom = 0.9; this.heat = true; this.expanded = -1;
    this._dirty = true; this._rt = 0;
    this.el.addEventListener('click', (e) => this._click(e));
    this.el.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.el.addEventListener('wheel', (e) => e.stopPropagation());
    game.on('changed', () => { this._dirty = true; });
    game.on('request', () => { if (this.open) { this.screen = 'driver'; this.tab = 'inicio'; } this._dirty = true; });
  }
  get st() { return this.g.state; }
  show(screen) { this.open = true; this.el.classList.remove('hidden'); if (screen) { this.screen = screen; if (screen === 'driver') this.tab = 'inicio'; } this._dirty = true; this.render(); }
  hide() { this.open = false; this.el.classList.add('hidden'); }
  toggle() { if (this.open) this.hide(); else this.show(this.g.rides.req || this.st.ride ? 'driver' : null); }
  unread() { return this.st.notes.filter((n) => !n.read).length; }

  _click(e) {
    const t = e.target.closest('[data-a]'); if (!t) return;
    e.stopPropagation();
    const a = t.dataset.a, v = t.dataset.v; const g = this.g, st = this.st;
    this.g.w.sound.click();
    switch (a) {
      case 'app': this.screen = v; if (v === 'driver') this.tab = 'inicio'; break;
      case 'home': this.screen = 'home'; break;
      case 'close': this.hide(); return;
      case 'tab': this.tab = v; if (v === 'caixa') setTimeout(() => { st.notes.forEach((n) => (n.read = true)); }, 400); break;
      case 'online': st.online ? g.goOffline() : g.goOnline(); break;
      case 'accept': g.rides.accept(); break;
      case 'reject': g.rides.reject(false); break;
      case 'start': g.rides.startTrip(); break;
      case 'end': g.rides.endTrip(); break;
      case 'cancel': g.hud.decide({ title: 'Cancelar viagem?', icon: '🚫', text: 'Cancelar viagens afeta a tua taxa de cancelamento e reputação.', options: [{ label: 'Sim, cancelar', danger: true, fn: () => g.rides.cancelByDriver(st.ride && st.ride.phase === 'waiting' && st.ride.waitMin >= 5) }, { label: 'Não', fn: () => {} }] }); break;
      case 'msg': g.sendMessage(v); break;
      case 'idle': st.settings.idle = v; g.rides.idleTimer = 0; if (v === 'parado' && !st.ride && !g.serviceTrip) g.w.ap.stop(); break;
      case 'break': g.takeBreak(+v); break;
      case 'endday': g.hud.decide({ title: 'Terminar sessão?', icon: '🏁', text: st.ride ? 'A sessão termina quando concluíres a viagem atual.' : 'Vais terminar o dia de trabalho e ver o resumo.', options: [{ label: 'Terminar o dia', danger: true, fn: () => { this.hide(); g.endDay(); } }, { label: 'Continuar a trabalhar', fn: () => {} }] }); break;
      case 'service': this.hide(); g.goService(); break;
      case 'buy': g.buyVehicle(v); break;
      case 'zoom': this.mapZoom = clamp(this.mapZoom * (v === 'in' ? 1.4 : 0.7), 0.25, 4); break;
      case 'heat': this.heat = !this.heat; break;
      case 'exp': this.expanded = this.expanded === +v ? -1 : +v; break;
      case 'set': this._setting(t.dataset.k, v); break;
      case 'reset': g.hud.decide({ title: 'Apagar progresso?', icon: '🗑️', text: 'Todo o progresso será apagado. Esta ação não pode ser desfeita.', options: [{ label: 'Apagar e recomeçar', danger: true, fn: () => { g.reset(); location.reload(); } }, { label: 'Cancelar', fn: () => {} }] }); break;
    }
    this._dirty = true; this.render();
  }
  _setting(k, v) {
    const s = this.st.settings;
    if (k === 'speed') s.speed = +v;
    else if (k === 'sound') { s.sound = !s.sound; this.g.w.sound.setEnabled(s.sound); }
    else if (k === 'voice') { s.voice = !s.voice; this.g.w.sound.voice = s.voice; }
    else if (k === 'minimap') s.minimap = !s.minimap;
    else if (k === 'quality') { s.quality = v; this.g.save(); this.g.hud.decide({ title: 'Qualidade gráfica', icon: '🎨', text: 'Recarregar agora para aplicar?', options: [{ label: 'Recarregar', fn: () => location.reload() }, { label: 'Mais tarde', fn: () => {} }] }); }
    else if (k === 'name') { const n = prompt('Nome do motorista:', this.st.name); if (n && n.trim()) this.st.name = n.trim().slice(0, 24); }
    this.g.save();
  }

  // ---------- renderização ----------
  render() {
    if (!this.open || !this._dirty) return;
    this._dirty = false;
    const body = this.scr.querySelector('.pbody'); const scroll = body ? body.scrollTop : 0; const prevKey = this._key;
    const st = this.st;
    const w = WEATHERS[st.weather.type];
    let inner = '';
    switch (this.screen) {
      case 'driver': inner = this._driver(); break;
      case 'map': inner = this._mapApp(); break;
      case 'wallet': inner = this._wallet(); break;
      case 'garage': inner = this._garage(); break;
      case 'goals': inner = this._goals(); break;
      case 'chat': inner = this._chat(); break;
      case 'settings': inner = this._settings(); break;
      default: inner = this._home();
    }
    this.scr.innerHTML = `<div class="sbar"><span id="pclock">${hhmm(st.time)}</span><div class="island"></div><span>${w.icon} 5G ▮▮▮ ${Math.round(70 + 30 * Math.sin(st.time / 200))}%</span></div>${inner}<div class="homebar"><i data-a="${this.screen === 'home' ? 'close' : 'home'}"></i></div>`;
    if (this.g.rides.req && this.screen !== 'home') this.scr.insertAdjacentHTML('beforeend', this._request());
    this._key = this.screen + this.tab;
    const nb = this.scr.querySelector('.pbody'); if (nb && prevKey === this._key) nb.scrollTop = scroll;
    this._drawMaps(true);
  }
  tick(dt) {
    if (!this.open) return;
    this._rt -= dt;
    if (this._dirty) this.render();
    const c = document.getElementById('pclock'); if (c) c.textContent = hhmm(this.st.time);
    const req = this.g.rides.req;
    if (req) {
      const ring = document.getElementById('reqRing'); const n = document.getElementById('reqN');
      if (ring) ring.setAttribute('stroke-dashoffset', String(126 * (1 - req.timer / CFG.REQUEST_TIMEOUT)));
      if (n) n.textContent = Math.ceil(req.timer);
    }
    const eta = document.getElementById('tripEta'); if (eta) eta.textContent = this._etaText();
    if (this._rt <= 0) { this._rt = 0.2; this._drawMaps(false); }
  }
  _etaText() {
    const ap = this.g.w.ap; const r = this.st.ride;
    if (!r || !ap.path) return '';
    const m = ap.remaining / 8 * CFG.TIME_SCALE / 60;
    return `${Math.max(1, Math.round(m))} min · ${kmStr(ap.remaining)}`;
  }
  _drawMaps() {
    for (const id of ['pmap', 'fullmap']) {
      const c = document.getElementById(id); if (!c) continue;
      const w = c.clientWidth, h = c.clientHeight; if (!w || !h) continue;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const ap = this.g.w.ap;
      const full = id === 'fullmap';
      this.map.draw(x, w, h, { cx: full ? ap.pos.x * 0.5 : ap.pos.x, cz: full ? ap.pos.z * 0.5 : ap.pos.z, zoom: full ? this.mapZoom * Math.min(w, h) / 800 : 0.55 * w / 300, rot: 0,
        path: ap.path, pathFrom: ap.d, car: { x: ap.pos.x, z: ap.pos.z, h: ap.heading }, pins: this.g.mapPins(), heat: (full ? this.heat : !this.st.ride) ? { h: hourOf(this.st.time), wk: isWeekend(this.st.day) } : null });
    }
  }

  _appbar(title, back = 'home', right = '') { return `<div class="appbar"><button class="back" data-a="${back === 'home' ? 'home' : 'app'}" data-v="${back}">‹</button><h3>${title}</h3><div class="sp"></div>${right}</div>`; }

  _home() {
    const st = this.st; const un = this.unread();
    const apps = [
      ['driver', '🚗', '#000', APP_NAME.split(' ')[0], un],
      ['map', '🗺️', '#1e7a46', 'Mapa'], ['wallet', '💳', '#1f5fbf', 'Carteira'], ['garage', '🔧', '#d97a1e', 'Garagem'],
      ['goals', '🏆', '#7b3fbf', 'Objetivos'], ['chat', '💬', '#22a35a', 'Mensagens', st.ride ? st.chat.filter((c) => c.from === 'pax').length : 0], ['settings', '⚙️', '#5b6270', 'Definições'],
    ];
    const T = st.today;
    return `<div class="pbody"><div class="home">
      <div class="bigclock">${hhmm(st.time)}</div><div class="date">${weekday(st.day)} · Dia ${st.day} · ${CITY_NAME}</div>
      <div class="apps">${apps.map((a) => `<button class="app" data-a="app" data-v="${a[0]}"><div class="ai" style="background:${a[2]}">${a[1]}</div>${a[3]}${a[4] ? `<span class="badge">${a[4]}</span>` : ''}</button>`).join('')}</div>
      <div class="widget"><div class="t">Ganhos de hoje</div><div class="v">${eur(T.net + T.tips + T.bonus)}</div><div class="t">${T.trips} viagens · saldo ${eur(st.balance)}</div></div>
      <div class="widget"><div class="t">${WEATHERS[st.weather.type].icon} ${WEATHERS[st.weather.type].label} · ${st.online ? '🟢 Online' : '⚪ Offline'}</div></div>
    </div></div>`;
  }

  _driver() {
    const st = this.st; const un = this.unread();
    let body = '';
    if (this.tab === 'inicio') body = this._inicio();
    else if (this.tab === 'ganhos') body = this._ganhos();
    else if (this.tab === 'historico') body = this._historico();
    else if (this.tab === 'caixa') body = this._caixa();
    else body = this._conta();
    const tabs = [['inicio', '🏠', 'Início'], ['ganhos', '💶', 'Ganhos'], ['historico', '🧾', 'Viagens'], ['caixa', '🔔', 'Caixa', un], ['conta', '👤', 'Conta']];
    return `${this._appbar(`<span style="font-weight:850">RIDO</span> <span style="font-weight:400;opacity:.6">Driver</span>`, 'home', `<span class="chip" style="margin:0">${st.online ? '🟢 Online' : '⚪ Offline'}</span>`)}
      <div class="pbody"><div class="sec">${body}</div></div>
      <div class="tabs">${tabs.map((t) => `<button class="${this.tab === t[0] ? 'on' : ''}" data-a="tab" data-v="${t[0]}"><span class="ti">${t[1]}</span>${t[2]}${t[3] ? `<span class="badge">${t[3]}</span>` : ''}</button>`).join('')}</div>`;
  }
  _inicio() {
    const st = this.st, g = this.g, T = st.today, r = st.ride;
    let h = `<div class="mapbox"><canvas id="pmap"></canvas><div class="earn">${eur(T.net + T.tips + T.bonus)}</div>${!r ? '<div class="legend">🔥 zonas com mais procura</div>' : ''}</div>`;
    if (r) {
      const P = this.g.rides.loc(r.pickup), D = this.g.rides.loc(r.dest);
      const btns = [];
      if (r.phase === 'boarded') btns.push('<button class="btn primary" data-a="start">▶ Iniciar viagem</button>');
      if (r.phase === 'arrived') btns.push('<button class="btn primary" data-a="end">🏁 Terminar viagem</button>');
      if (r.phase === 'toPickup' || r.phase === 'waiting') btns.push('<button class="btn small" data-a="app" data-v="chat">💬 Mensagem</button><button class="btn small danger" data-a="cancel">Cancelar</button>');
      h += `<div class="trip"><div class="ph">${PHASE[r.phase] || ''}${r.phase === 'waiting' ? ` · ${Math.floor(r.waitMin)} min` : ''}</div>
        <div class="pax"><img src="${avatar(r.pax)}"><div><b>${esc(r.pax.name)}</b><span>★ ${r.pax.rating.toFixed(2)} · ${r.pax.trips} viagens · ${r.cat}</span></div></div>
        ${r.pax.note ? `<div class="note">📝 ${esc(r.pax.note.text)}</div>` : ''}
        <div class="route"><div class="pt">${esc(P.name)}<small>Recolha</small></div><div class="pt d">${esc(D.name)}<small>Destino${r.destChanged ? ' (alterado)' : ''}</small></div></div>
        <div class="kv"><span>Estimativa</span><b id="tripEta">${this._etaText()}</b></div>
        <div class="kv"><span>Valor estimado (líquido)</span><b>${eur((r.fare + r.fareAdd) * (1 - CFG.COMMISSION))}</b></div>
        <div class="btnrow" style="margin-top:10px">${btns.join('')}</div></div>`;
      if (st.offAfterRide || st.endAfterRide) h += `<div class="note">${st.endAfterRide ? '🏁 A sessão termina após esta viagem.' : '🟡 Ficas offline após esta viagem.'}</div>`;
      return h;
    }
    if (g.serviceTrip) h += `<div class="card">⛽ A caminho de <b>${esc(g.serviceTrip.name)}</b> <span class="muted" id="tripEta"></span></div>`;
    if (!st.dayActive) return h + '<div class="card">O dia de trabalho terminou.</div>';
    h += `<button class="golive ${st.online ? 'off' : ''}" data-a="online">${st.online ? 'FICAR OFFLINE' : 'FICAR ONLINE'}</button>
      <p class="muted" style="text-align:center;margin:8px 0 12px">${st.online ? '🔎 À procura de viagens perto de ti...' : 'Fica online para começar a receber pedidos.'}</p>
      <div class="card"><h4>Enquanto esperas</h4><div class="seg">${[['zona', '🔥 Ir para zona quente'], ['circular', '🔄 Circular'], ['parado', '🅿️ Parado']].map(([k, l]) => `<button class="${st.settings.idle === k ? 'on' : ''}" data-a="idle" data-v="${k}">${l}</button>`).join('')}</div></div>
      <div class="grid2"><div class="stat"><div class="l">Viagens hoje</div><div class="n">${T.trips}</div></div><div class="stat"><div class="l">Online</div><div class="n">${dur(T.onlineMin)}</div></div>
      <div class="stat"><div class="l">Avaliação</div><div class="n">★ ${g.ratingAvg().toFixed(2)}</div></div><div class="stat"><div class="l">Combustível</div><div class="n">${Math.round(g.fuelPct())}%</div></div></div>`;
    return h;
  }
  _request() {
    const q = this.g.rides.req; const P = this.g.rides.loc(q.pickup), D = this.g.rides.loc(q.dest);
    return `<div class="req"><div class="sheet">
      <div class="top"><div><span class="cat">${q.cat}</span>${q.surge > 1.05 ? `<span class="surge">⚡ ×${q.surge.toFixed(1)}</span>` : ''}</div>
        <div class="ring"><svg width="46" height="46"><circle cx="23" cy="23" r="20" stroke="#2a313c" stroke-width="4" fill="none"/><circle id="reqRing" cx="23" cy="23" r="20" stroke="#22c55e" stroke-width="4" fill="none" stroke-dasharray="126" stroke-dashoffset="0" stroke-linecap="round"/></svg><b id="reqN">${Math.ceil(q.timer)}</b></div></div>
      <div class="price">${eur(q.net)}</div><div class="muted">Valor estimado a receber · tarifa ${eur(q.fare)} (comissão ${Math.round(CFG.COMMISSION * 100)}%)${q.airport ? ' · inclui taxa aeroporto' : ''}</div>
      <div class="pax" style="margin-top:12px"><img src="${avatar(q.pax)}"><div><b>${esc(q.pax.name)}</b><span>★ ${q.pax.rating.toFixed(2)} · ${q.pax.trips} viagens</span></div></div>
      <div class="route"><div class="pt">${esc(P.name)}<small>${Math.max(1, Math.round(q.pickMin))} min · ${kmStr(q.pickDist)} até à recolha</small></div>
        <div class="pt d">${esc(D.name)}<small>Viagem: ${Math.round(q.estMin)} min · ${kmStr(q.tripDist)}</small></div></div>
      ${q.pax.note ? `<div class="note">📝 «${esc(q.pax.note.text)}»</div>` : ''}
      <div class="btnrow"><button class="btn" data-a="reject" style="flex:1">Recusar</button><button class="btn primary" data-a="accept" style="flex:2">Aceitar</button></div>
    </div></div>`;
  }
  _ganhos() {
    const st = this.st, g = this.g, T = st.today;
    const wk = Math.floor((st.day - 1) / 7); const days = [];
    for (let i = 0; i < 7; i++) {
      const d = wk * 7 + 1 + i;
      const rec = d === st.day ? { income: T.net + T.tips + T.bonus } : st.days.find((x) => x.day === d);
      days.push({ d, v: rec ? rec.income : 0, today: d === st.day });
    }
    const max = Math.max(10, ...days.map((d) => d.v));
    const avgTrip = st.stats.trips ? st.stats.earned / st.stats.trips : 0;
    const exp = Object.values(T.exp).reduce((a, b) => a + b, 0);
    return `<div class="card"><h4>Hoje</h4><div class="big">${eur(T.net + T.tips + T.bonus)}</div><div class="muted">${T.trips} viagens · ${dur(T.onlineMin)} online</div>
      <div class="kv" style="margin-top:8px"><span>Tarifas (bruto)</span><b>${eur(T.gross)}</b></div><div class="kv"><span>Comissão da plataforma</span><b class="neg">${eur(-T.commission)}</b></div>
      <div class="kv"><span>Gorjetas</span><b class="pos">${eur(T.tips)}</b></div><div class="kv"><span>Bónus</span><b class="pos">${eur(T.bonus)}</b></div><div class="kv"><span>Despesas</span><b class="neg">${eur(-exp)}</b></div></div>
      <div class="card"><h4>Esta semana · ${eur(g.weekEarnings())}</h4><div class="bars">${days.map((d) => `<div class="${d.today ? 'today' : ''}"><i style="height:${Math.max(2, d.v / max * 100)}%"></i>${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][(d.d - 1) % 7]}</div>`).join('')}</div></div>
      <div class="grid2">
        <div class="stat"><div class="l">Ganhos totais</div><div class="n">${eur(st.stats.earned)}</div></div><div class="stat"><div class="l">Viagens totais</div><div class="n">${st.stats.trips}</div></div>
        <div class="stat"><div class="l">Média por viagem</div><div class="n">${eur(avgTrip)}</div></div><div class="stat"><div class="l">Avaliação média</div><div class="n">★ ${g.ratingAvg().toFixed(2)}</div></div>
        <div class="stat"><div class="l">Gorjetas totais</div><div class="n">${eur(st.stats.tips)}</div></div><div class="stat"><div class="l">Km percorridos</div><div class="n">${Math.round(st.stats.km)} km</div></div>
        <div class="stat"><div class="l">Taxa de aceitação</div><div class="n">${Math.round(g.acceptance() * 100)}%</div></div><div class="stat"><div class="l">Melhor dia</div><div class="n">${eur(st.stats.bestDay)}</div></div>
      </div>
      <div class="card" style="margin-top:10px"><h4>Dias anteriores</h4><div class="list">${st.days.slice().reverse().slice(0, 14).map((d) => `<div class="it"><div class="ic">📅</div><div class="mid"><b>Dia ${d.day} · ${d.weekday}</b><span>${d.trips} viagens · ${dur(d.minutes)} · ★ ${d.rating ? d.rating.toFixed(2) : '—'}</span></div><div class="r ${d.profit >= 0 ? 'pos' : 'neg'}">${eur(d.profit)}<small>lucro</small></div></div>`).join('') || '<p class="muted">Ainda sem dias concluídos.</p>'}</div></div>`;
  }
  _historico() {
    const H = this.st.history;
    if (!H.length) return '<div class="card"><p class="muted">Ainda não fizeste viagens. Fica online para começar!</p></div>';
    return `<div class="card list">${H.slice(0, 80).map((t) => {
      const exp = this.expanded === t.id;
      return `<div class="it" data-a="exp" data-v="${t.id}" style="cursor:pointer;flex-wrap:wrap"><img src="${avatar({ seed: t.seed, look: t.look, pers: t.pers })}"><div class="mid"><b>${esc(t.name)}</b><span>${esc(t.from)} → ${esc(t.to)}</span><span>Dia ${t.day} · ${hhmm(t.t)} · ${t.km.toFixed(1).replace('.', ',')} km · ${t.min} min</span></div>
        <div class="r">${eur(t.net + t.tip)}<small>${t.rating ? stars(t.rating) : 'a aguardar…'}</small></div>
        ${exp ? `<div style="width:100%;margin-top:8px;font-size:12.5px;color:#c9d2de"><div class="kv"><span>Tarifa</span><b>${eur(t.fare)}</b></div><div class="kv"><span>Comissão</span><b>${eur(-t.commission)}</b></div><div class="kv"><span>Gorjeta</span><b>${eur(t.tip)}</b></div><div class="kv"><span>Perfil</span><b>${PERSONALITIES[t.pers]?.label || ''}</b></div><div class="kv"><span>Categoria</span><b>${t.cat}${t.surge > 1.05 ? ' · ×' + t.surge.toFixed(1) : ''}</b></div>${t.log.map((l) => `<div style="padding:4px 0">${esc(l)}</div>`).join('')}</div>` : ''}</div>`;
    }).join('')}</div>`;
  }
  _caixa() {
    const N = this.st.notes;
    if (!N.length) return '<div class="card"><p class="muted">Sem notificações.</p></div>';
    return `<div class="card list">${N.map((n) => `<div class="it ${n.read ? '' : 'unread'}"><div class="ic">${n.icon}</div><div class="mid"><b>${esc(n.title)}</b><span style="white-space:normal">${esc(n.body)}</span></div><div class="r"><small>${hhmm(n.t)}</small><small>Dia ${n.day}</small></div></div>`).join('')}</div>`;
  }
  _conta() {
    const st = this.st, g = this.g;
    const L = st.level; const x0 = xpForLevel(L), x1 = xpForLevel(L + 1);
    const tier = reputationTier(g.ratingAvg(), st.stats.ratings.length);
    const s = st.stats; const cancelRate = s.accepted ? (s.cancelMe / s.accepted) : 0;
    return `<div class="card" style="text-align:center"><div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#4aa3ff,#22c55e);margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800">${esc(st.name[0] || 'M')}</div>
      <b style="font-size:18px">${esc(st.name)}</b><div class="muted">${levelTitle(L)} · Nível ${L}</div>
      <div class="progress"><i style="width:${clamp((st.xp - x0) / (x1 - x0) * 100, 0, 100)}%"></i></div><div class="muted" style="margin-top:4px">${st.xp - x0} / ${x1 - x0} XP para o nível ${L + 1}</div></div>
      <div class="card"><h4>Reputação</h4><div class="kv"><span>Avaliação</span><b>★ ${g.ratingAvg().toFixed(2)} (${s.ratings.length})</b></div><div class="kv"><span>Escalão</span><b style="color:${tier.color}">${tier.name}</b></div>
      <div class="kv"><span>Taxa de aceitação</span><b>${Math.round(g.acceptance() * 100)}%</b></div><div class="kv"><span>Taxa de cancelamento</span><b>${Math.round(cancelRate * 100)}%</b></div><div class="kv"><span>Viagens</span><b>${s.trips}</b></div></div>
      <div class="card"><h4>Cansaço</h4><div class="progress"><i style="width:${st.fatigue}%;background:${st.fatigue > 70 ? 'var(--bad)' : st.fatigue > 45 ? 'var(--warn)' : 'var(--acc)'}"></i></div>
      <div class="muted" style="margin:6px 0 10px">${st.fatigue > 70 ? 'Muito cansado — as avaliações vão sofrer.' : st.fatigue > 45 ? 'Algum cansaço acumulado.' : 'Descansado.'} Sem pausa há ${dur(st.sinceBreak)}.</div>
      <div class="btnrow"><button class="btn small" data-a="break" data-v="15">☕ 15 min</button><button class="btn small" data-a="break" data-v="30">🥪 30 min</button><button class="btn small" data-a="break" data-v="60">🍽️ 1 h</button></div></div>
      <button class="btn" data-a="service">⛽ Ir ao posto (combustível, lavagem, revisão)</button>
      <button class="btn danger" data-a="endday">🏁 Terminar sessão (fim do dia)</button>`;
  }
  _mapApp() {
    return `${this._appbar('Mapa')}<div class="pbody" style="display:flex;flex-direction:column"><div class="sec" style="flex:1;display:flex;flex-direction:column"><div class="mapbox" style="flex:1;height:auto;min-height:300px"><canvas id="fullmap"></canvas>
      <div style="position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:6px"><button class="btn small" data-a="zoom" data-v="in" style="width:40px;margin:0">＋</button><button class="btn small" data-a="zoom" data-v="out" style="width:40px;margin:0">－</button><button class="btn small" data-a="heat" style="width:40px;margin:0">🔥</button></div>
      <div class="legend">🟢 recolha · ⚪ destino · 🔵 tu · 🔥 procura · ⛽ posto</div></div></div></div>`;
  }
  _wallet() {
    const st = this.st, T = st.today; const e = T.exp;
    return `${this._appbar('Carteira')}<div class="pbody"><div class="sec">
      <div class="card"><h4>Saldo da conta</h4><div class="big ${st.balance < 0 ? 'neg' : ''}">${eur(st.balance)}</div><div class="muted">Pagamentos transferidos após cada viagem</div></div>
      <div class="card"><h4>Despesas de hoje</h4><div class="kv"><span>⛽ Combustível/energia</span><b>${eur(e.fuel)}</b></div><div class="kv"><span>🔧 Manutenção</span><b>${eur(e.maint)}</b></div><div class="kv"><span>🧽 Lavagem</span><b>${eur(e.wash)}</b></div><div class="kv"><span>🚨 Multas</span><b>${eur(e.fines)}</b></div><div class="kv"><span>📄 Custos fixos</span><b>${eur(e.fixed)}</b></div><div class="kv"><span>💶 Outros</span><b>${eur(e.other)}</b></div>
      <div class="kv"><span>Consumo estimado hoje</span><b>${T.fuelUsed.toFixed(1)} ${this.g.vehicle.unit} ≈ ${eur(T.fuelCost)}</b></div></div>
      <div class="card"><h4>Movimentos</h4><div class="list">${st.finance.slice(0, 60).map((f) => `<div class="it"><div class="ic">${FIN_ICON[f.type] || '💶'}</div><div class="mid"><b>${esc(f.desc)}</b><span>Dia ${f.day} · ${hhmm(f.t)}</span></div><div class="r ${f.amt >= 0 ? 'pos' : 'neg'}">${eur(f.amt, true)}</div></div>`).join('') || '<p class="muted">Sem movimentos.</p>'}</div></div>
    </div></div>`;
  }
  _garage() {
    const st = this.st, g = this.g, v = g.vehicle;
    const bar = (p, c) => `<div class="progress"><i style="width:${p}%;background:${c}"></i></div>`;
    return `${this._appbar('Garagem')}<div class="pbody"><div class="sec">
      <div class="card"><h4>${esc(v.name)} · ${v.cat}</h4>
        <div class="kv"><span>${v.unit === 'kWh' ? '🔋 Bateria' : '⛽ Combustível'}</span><b>${Math.round(g.fuelPct())}%</b></div>${bar(g.fuelPct(), g.fuelPct() < 15 ? 'var(--bad)' : 'var(--acc)')}
        <div class="kv" style="margin-top:8px"><span>🔧 Estado mecânico</span><b>${Math.round(st.condition)}%</b></div>${bar(st.condition, st.condition < 40 ? 'var(--bad)' : 'var(--acc2)')}
        <div class="kv" style="margin-top:8px"><span>🧽 Limpeza</span><b>${Math.round(st.clean)}%</b></div>${bar(st.clean, st.clean < 45 ? 'var(--warn)' : 'var(--acc2)')}
        <div class="kv" style="margin-top:8px"><span>Quilometragem</span><b>${Math.round(st.odo)} km</b></div><div class="kv"><span>Consumo</span><b>${v.per100} ${v.unit}/100 km</b></div><div class="kv"><span>Custos diários</span><b>${eur(v.daily)}</b></div>
        <button class="btn blue" data-a="service" style="margin-top:10px">⛽ Ir ao posto mais próximo</button></div>
      <h4 style="margin:14px 2px 8px;color:var(--mut);font-size:13px">VEÍCULOS</h4>
      ${Object.values(VEHICLES).map((x) => {
        const own = st.owned.includes(x.id), cur = st.vehicle === x.id, locked = st.level < x.level;
        return `<div class="veh ${cur ? 'cur' : ''}"><div class="vh"><div><b>${esc(x.name)}</b><div class="muted">${x.cat} · tarifa ×${x.fareMult.toFixed(2)} · ${x.energy}</div></div><div class="sw" style="background:#${x.paint.toString(16).padStart(6, '0')}"></div></div>
          <p class="muted" style="margin:6px 0 8px">${esc(x.desc)}</p>
          ${cur ? '<span class="chip">✅ Em uso</span>' : own ? `<button class="btn small" data-a="buy" data-v="${x.id}">Usar este carro</button>` : locked ? `<span class="chip">🔒 Nível ${x.level} · ${eur(x.price)}</span>` : `<button class="btn small primary" data-a="buy" data-v="${x.id}">Comprar por ${eur(x.price)}</button>`}</div>`;
      }).join('')}
    </div></div>`;
  }
  _goals() {
    const st = this.st;
    const wk = st.weekly || { trips: 0 };
    return `${this._appbar('Objetivos')}<div class="pbody"><div class="sec">
      <div class="card"><h4>Objetivos de hoje</h4>${st.today.objectives.map((o) => { const p = Math.min(o.target, objectiveProgress(o, st.today)); return `<div style="padding:8px 0;border-bottom:1px solid var(--line)"><div style="display:flex;justify-content:space-between"><span>${o.done ? '✅' : '🎯'} ${esc(o.text)}</span><b class="pos">+${eur(o.reward)}</b></div><div class="progress"><i style="width:${p / o.target * 100}%"></i></div><div class="muted" style="margin-top:3px">${o.fmt === 'min' ? dur(p) + ' / ' + dur(o.target) : (Math.floor(p * 100) / 100) + ' / ' + o.target}</div></div>`; }).join('')}</div>
      <div class="card"><h4>Desafio semanal</h4><div style="display:flex;justify-content:space-between"><span>${wk.claimed ? '✅' : '🏁'} Completa 40 viagens esta semana</span><b class="pos">+50,00 €</b></div><div class="progress"><i style="width:${Math.min(100, wk.trips / 40 * 100)}%"></i></div><div class="muted" style="margin-top:3px">${Math.min(40, wk.trips)} / 40</div></div>
      <div class="card"><h4>Níveis</h4><div class="muted">Sobe de nível com viagens e avaliações de 5 ★. Cada nível dá um bónus e desbloqueia veículos.</div>${LEVEL_TITLES.slice(0, 6).map((t, i) => `<div class="kv"><span>${t}</span><b>${['1', '2–3', '4', '5–6', '7', '8–9'][i]}</b></div>`).join('')}</div>
      <div class="card"><h4>Conquistas · ${Object.keys(st.achievements).length}/${ACHIEVEMENTS.length}</h4><div class="ach">${ACHIEVEMENTS.map((a) => `<div class="${st.achievements[a.id] ? 'on' : ''}" title="${esc(a.desc)}"><span class="e">${a.icon}</span>${esc(a.name)}</div>`).join('')}</div></div>
    </div></div>`;
  }
  _chat() {
    const st = this.st, r = st.ride;
    if (!r) return `${this._appbar('Mensagens')}<div class="pbody"><div class="sec"><div class="card"><p class="muted">Sem conversa ativa. As mensagens com o passageiro aparecem aqui durante uma viagem.</p></div></div></div>`;
    const quick = ['Estou a chegar!', 'Já estou cá fora 🚗', 'Estou à sua espera', 'Pode partilhar a localização exata?'];
    return `${this._appbar(esc(r.pax.name), 'driver')}<div class="pbody"><div class="sec"><div class="chat">${st.chat.map((c) => `<div class="m ${c.from === 'me' ? 'me' : ''}">${esc(c.text)}</div>`).join('') || '<p class="muted">Envia uma mensagem ao passageiro.</p>'}</div>
      <div class="qr">${quick.map((q) => `<button data-a="msg" data-v="${esc(q)}">${esc(q)}</button>`).join('')}</div></div></div>`;
  }
  _settings() {
    const s = this.st.settings;
    const tog = (k, on) => `<div class="toggle ${on ? 'on' : ''}" data-a="set" data-k="${k}"></div>`;
    const seg = (k, opts, cur) => `<div class="seg">${opts.map(([v, l]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-a="set" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
    return `${this._appbar('Definições')}<div class="pbody"><div class="sec"><div class="card">
      <div class="setrow"><span>Velocidade do tempo</span>${seg('speed', [[1, '×1'], [2, '×2'], [4, '×4']], s.speed)}</div>
      <div class="setrow"><span>Qualidade gráfica</span>${seg('quality', [['auto', 'Auto'], ['low', 'Baixa'], ['med', 'Média'], ['high', 'Alta']], s.quality)}</div>
      <div class="setrow"><span>Som</span>${tog('sound', s.sound)}</div>
      <div class="setrow"><span>Voz dos passageiros</span>${tog('voice', s.voice)}</div>
      <div class="setrow"><span>Minimapa</span>${tog('minimap', s.minimap)}</div>
      <div class="setrow"><span>Nome do motorista</span><button class="btn small" data-a="set" data-k="name" style="width:auto;margin:0">${esc(this.st.name)} ✏️</button></div></div>
      <div class="card"><h4>Controlos</h4><div class="muted" style="line-height:1.6">Arrastar no ecrã: olhar à volta · Duplo toque: olhar em frente<br>Teclado: <b>P</b> telemóvel · <b>Espaço</b> ação · <b>1–4</b> respostas · <b>Esc</b> pausa · <b>O</b> online</div></div>
      <button class="btn danger" data-a="reset">🗑️ Apagar progresso</button>
      <p class="muted" style="text-align:center">O progresso é guardado automaticamente neste dispositivo.</p></div></div>`;
  }
}
