// Estado do jogo, relógio, economia, dias de trabalho, serviços, veículos e gravação automática.
import { CFG, VEHICLES } from '../config.js';
import { Emitter, clamp, eur, hhmm, isWeekend, pick, rr, toKm, weekday, dur } from '../util.js';
import { ACHIEVEMENTS, levelFromXp, makeObjectives, objectiveProgress, hourOf } from './economy.js';
import { Rides } from './rides.js';
import { WEATHERS } from '../world/sky.js';

function newToday(level, day) {
  return {
    trips: 0, gross: 0, net: 0, tips: 0, bonus: 0, commission: 0,
    exp: { fuel: 0, maint: 0, wash: 0, fines: 0, fixed: 0, other: 0 },
    five: 0, ratings: [], airport: 0, night: 0, onlineMin: 0, workMin: 0, km: 0, fuelUsed: 0, fuelCost: 0,
    streak: 0, bestStreak: 0, start: null, end: null, objectives: makeObjectives(level, day * 7 + level), objDone: 0,
  };
}
export function newState(name) {
  return {
    v: 1, name: name || 'Motorista', created: Date.now(),
    balance: CFG.START_BALANCE, day: 1, time: CFG.DAY_START, dayActive: false, online: false,
    car: null, vehicle: 'compacto', owned: ['compacto'], fuel: { compacto: 100 }, condition: 100, clean: 100, odo: 0,
    xp: 0, level: 1,
    stats: { trips: 0, earned: 0, tips: 0, bonus: 0, expenses: 0, km: 0, five: 0, ratingSum: 0, ratingN: 0, ratings: [], airport: 0, night: 0, rainTrips: 0,
      accepted: 0, rejected: 0, cancelMe: 0, cancelPax: 0, onlineMin: 0, bestDay: 0, commission: 0, fuelL: 0 },
    today: newToday(1, 1),
    days: [], history: [], finance: [], notes: [], chat: [],
    achievements: {}, flags: {},
    weather: { type: 'limpo', next: CFG.DAY_START + 150 },
    settings: { quality: 'auto', speed: 1, sound: true, voice: true, idle: 'zona', minimap: true },
    ride: null, fatigue: 0, sinceBreak: 0, streak: 0, weekly: { week: 0, trips: 0, claimed: false, base: 0 },
    offAfterRide: false, endAfterRide: false,
  };
}

export class Game extends Emitter {
  constructor(world, hud) {
    super();
    this.w = world; this.hud = hud;
    this.state = null; this.rides = new Rides(this);
    this.timers = []; this.skip = null; this.serviceTrip = null; this.paused = true;
    this._saveTimer = 0; this._lastDist = 0; this._lowFuelWarned = false; this._breakAsked = 0;
  }
  get vehicle() { return VEHICLES[this.state.vehicle]; }
  static hasSave() { try { return !!localStorage.getItem(CFG.SAVE_KEY); } catch { return false; } }
  load() {
    try {
      const raw = localStorage.getItem(CFG.SAVE_KEY); if (!raw) return false;
      const s = JSON.parse(raw); const base = newState(s.name);
      this.state = { ...base, ...s, stats: { ...base.stats, ...s.stats }, settings: { ...base.settings, ...s.settings }, today: { ...newToday(s.level || 1, s.day || 1), ...s.today } };
      return true;
    } catch (e) { console.warn('save inválido', e); return false; }
  }
  newGame(name) {
    this.state = newState(name);
    const h = this.w.city.home; this.state.car = { edge: h.edge, s: h.s };
  }
  save() {
    if (!this.state) return;
    const ap = this.w.ap; this.state.car = { edge: ap.edge, s: ap.s, off: ap.off };
    try { localStorage.setItem(CFG.SAVE_KEY, JSON.stringify(this.state)); } catch (e) { console.warn(e); }
  }
  reset() { try { localStorage.removeItem(CFG.SAVE_KEY); } catch { /* */ } }

  // inicia a simulação depois de carregar/criar
  begin() {
    const st = this.state, ap = this.w.ap;
    const c = st.car || { edge: this.w.city.home.edge, s: this.w.city.home.s };
    ap.place(c.edge, c.s, CFG.CURB);
    this._lastDist = ap.distDriven;
    this.w.car.build(this.vehicle);
    this.w.env.state = { ...WEATHERS[st.weather.type] };
    const r = st.ride;
    if (r) {
      // retomar a viagem em curso
      if (r.phase === 'request') st.ride = null;
      else if (r.phase === 'toPickup' || r.phase === 'waiting') { r.phase = 'toPickup'; this.rides._goPickup(); if (!r.lateLeft || r.paxCame) this.rides._spawnPax(false); }
      else if (r.phase === 'boarded' || r.phase === 'onTrip' || r.phase === 'arrived') {
        this.rides._spawnPax(false); this.w.pax.seat();
        if (r.phase === 'onTrip') { const d = this.rides.loc(r.dest); r.holdUntil = 0; r.drivenStart = ap.distDriven - 50; ap.routeTo(d.edge, d.s, true, () => this.rides.onArriveDest()); }
      }
    }
    this.paused = false;
    this.emit('changed');
  }

  ratingAvg() { const r = this.state.stats.ratings; return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 5; }
  acceptance() { const s = this.state.stats; const t = s.accepted + s.rejected; return t ? s.accepted / t : 1; }
  weatherType() { return this.state.weather.type; }
  weekEarnings() {
    const st = this.state; const wk = Math.floor((st.day - 1) / 7);
    let sum = st.today.net + st.today.tips + st.today.bonus;
    for (const d of st.days) if (Math.floor((d.day - 1) / 7) === wk) sum += d.income;
    return sum;
  }

  addMoney(amt, type, desc, notify = false) {
    const st = this.state;
    amt = Math.round(amt * 100) / 100;
    st.balance = Math.round((st.balance + amt) * 100) / 100;
    st.finance.unshift({ day: st.day, t: Math.floor(st.time), type, desc, amt });
    if (st.finance.length > 300) st.finance.length = 300;
    const T = st.today;
    if (type === 'trip') { T.net += amt; st.stats.earned += amt; }
    else if (type === 'tip') { st.stats.earned += amt; }
    else if (type === 'bonus') { T.bonus += amt; st.stats.bonus += amt; st.stats.earned += amt; }
    else if (amt < 0) {
      const k = { fuel: 'fuel', maint: 'maint', wash: 'wash', fine: 'fines', fixed: 'fixed' }[type] || 'other';
      T.exp[k] += -amt; st.stats.expenses += -amt;
    } else st.stats.earned += amt;
    if (notify) this.notify(type === 'bonus' ? '🎉 Bónus' : 'Carteira', `${desc}: ${eur(amt, true)}`, type === 'bonus' ? '🎁' : '💶');
    this.emit('money', amt);
    this.emit('changed');
  }
  notify(title, body, icon = '🔔') {
    const st = this.state;
    const n = { day: st.day, t: Math.floor(st.time), title, body, icon, read: false };
    st.notes.unshift(n); if (st.notes.length > 80) st.notes.length = 80;
    this.hud.toast(icon, title, body);
    this.emit('notify', n);
  }
  message(ride, text) {
    if (!this.state.ride || this.state.ride !== ride) return;
    this.state.chat.push({ from: 'pax', text, t: Math.floor(this.state.time) });
    if (this.state.chat.length > 30) this.state.chat.shift();
    this.notify(`Mensagem de ${ride.pax.first}`, text, '💬');
    this.w.sound.ping();
  }
  sendMessage(text) {
    const r = this.state.ride; if (!r) return;
    this.state.chat.push({ from: 'me', text, t: Math.floor(this.state.time) });
    if (r.phase === 'waiting' && r.lateLeft > r.waitMin) { r.lateLeft = Math.min(r.lateLeft, r.waitMin + 1.2); this.later(3, () => this.message(r, pick(['Desculpe! Estou mesmo a sair.', 'Um minuto, por favor!', 'Já vou, já vou!']))); }
    else if (r.phase === 'toPickup' || r.phase === 'waiting') this.later(3, () => this.message(r, pick(['Ok, obrigado!', 'Perfeito, até já.', '👍'])));
    this.emit('changed');
  }
  later(sec, fn) { this.timers.push({ t: sec, fn }); }
  addXp(n) {
    const st = this.state; st.xp += n;
    const L = levelFromXp(st.xp);
    if (L > st.level) {
      st.level = L;
      const bonus = 10 * L;
      this.later(1.5, () => { this.addMoney(bonus, 'bonus', `Subida para o nível ${L}`); this.hud.celebrate(`Nível ${L}!`, `Ganhaste um bónus de ${eur(bonus)}.`); this.w.sound.cash(); });
    }
  }

  // ---------- estado online / dia ----------
  goOnline() {
    const st = this.state; if (!st.dayActive) return;
    if (st.time >= CFG.DAY_END - 12) { this.notify('Fim do horário', 'Já não é possível ficar online hoje.', '🌙'); return; }
    if (this.fuelPct() <= 3) { this.notify('Sem combustível', 'Abastece antes de ficar online.', '⛽'); return; }
    st.online = true; st.offAfterRide = false; if (st.today.start == null) st.today.start = st.time;
    this.rides.nextIn = rr(0.5, 2.5);
    this.w.sound.ping(); this.notify('Estás online', 'À procura de viagens perto de ti...', '🟢');
    this.emit('changed');
  }
  goOffline() {
    const st = this.state;
    if (st.ride) { st.offAfterRide = !st.offAfterRide; this.notify(st.offAfterRide ? 'Ficas offline após esta viagem' : 'Pedido anulado', st.offAfterRide ? 'Não vais receber novos pedidos.' : 'Continuas online.', '🟡'); this.emit('changed'); return; }
    st.online = false; this.rides.req = null;
    if (!this.serviceTrip) this.w.ap.stop();
    this.notify('Estás offline', 'Não vais receber pedidos.', '⚪');
    this.emit('changed');
  }
  startDay() {
    const st = this.state;
    st.dayActive = true; st.time = CFG.DAY_START; st.online = false;
    st.today = newToday(st.level, st.day);
    st.sinceBreak = 0; st.fatigue = Math.max(0, st.fatigue - 100);
    this._newWeather(true);
    if (st.day === 1) st.weather.type = 'limpo';
    this.w.env.state = { ...WEATHERS[st.weather.type] };
    const h = this.w.city.home; this.w.ap.place(h.edge, h.s, CFG.CURB);
    this._lastDist = this.w.ap.distDriven;
    this.paused = false;
    this.save(); this.emit('dayStart'); this.emit('changed');
  }
  endDay(force = false) {
    const st = this.state;
    if (st.ride && !force) { st.endAfterRide = true; this.notify('Fim de sessão agendado', 'A sessão termina após concluíres esta viagem.', '🏁'); this.emit('changed'); return; }
    if (st.ride) { this.w.ap.stop(); this.w.pax.remove(); st.ride = null; }
    this.rides.req = null; this.w.ap.stop();
    const T = st.today, veh = this.vehicle;
    if (st.time > CFG.DAY_END - 5) st.flags.workedLate = true;
    if (T.start != null) this.addMoney(-veh.daily, 'fixed', `Custos diários (seguro, licença TVDE, aluguer) — ${veh.name}`);
    const avg = T.ratings.length ? T.ratings.reduce((a, b) => a + b, 0) / T.ratings.length : 0;
    if (T.ratings.length >= 5 && avg >= 4.85) this.addMoney(10, 'bonus', 'Bónus de qualidade (avaliação ≥ 4,85)');
    const expenses = Object.values(T.exp).reduce((a, b) => a + b, 0);
    const income = T.net + T.tips + T.bonus;
    const summary = {
      day: st.day, weekday: weekday(st.day), trips: T.trips, gross: T.gross, commission: T.commission, net: T.net, tips: T.tips, bonus: T.bonus,
      exp: { ...T.exp }, expenses, income, profit: income - expenses, rating: avg, minutes: T.start != null ? st.time - T.start : 0, onlineMin: T.onlineMin,
      km: T.km, fuelUsed: T.fuelUsed, fuelCost: T.fuelCost, objectives: T.objectives.map((o) => ({ text: o.text, done: o.done, reward: o.reward })), endedAt: st.time,
    };
    st.days.push(summary); if (st.days.length > 60) st.days.shift();
    st.stats.bestDay = Math.max(st.stats.bestDay, summary.profit);
    st.dayActive = false; st.online = false; st.offAfterRide = false; st.endAfterRide = false;
    st.day += 1; st.time = CFG.DAY_START; st.chat = [];
    this.checkProgress();
    this.paused = true;
    this.save();
    this.emit('dayEnd', summary); this.emit('changed');
  }
  takeBreak(min) {
    const st = this.state;
    if (st.ride) { this.notify('Agora não', 'Termina a viagem antes de fazer pausa.', '⚠️'); return; }
    const wasOn = st.online; st.online = false; this.rides.req = null;
    this.skipTime(min, `☕ Pausa de ${min} minutos...`, () => {
      st.fatigue = Math.max(0, st.fatigue - min * 0.9); st.sinceBreak = 0;
      if (min >= 30) this.addMoney(-rr(3, 7), 'other', 'Café e lanche na pausa');
      this.notify('Pausa terminada', 'Sentes-te mais descansado.', '☕');
      if (wasOn && st.time < CFG.DAY_END - 12) this.goOnline();
    });
  }
  skipTime(min, label, cb) {
    this.skip = { left: min, rate: min / 2.2, cb };
    this.hud.fade(label, 2.4);
  }
  fuelPct() { return this.state.fuel[this.state.vehicle] ?? 100; }

  // ---------- serviços ----------
  goService() {
    const st = this.state;
    if (st.ride) { this.notify('Agora não', 'Termina a viagem atual primeiro.', '⚠️'); return; }
    const ap = this.w.ap;
    const gs = this.w.city.gasStations.map((l) => ({ l, d: ap.routeLength(l.edge, l.s) })).sort((a, b) => a.d - b.d)[0];
    if (!gs) return;
    if (gs.d < 15) { this.openService(); return; }
    this.serviceTrip = gs.l; this.rides.req = null;
    ap.speedFactor = 1;
    ap.routeTo(gs.l.edge, gs.l.s, true, () => { this.serviceTrip = null; this.openService(); });
    this.notify('A caminho do posto', `${gs.l.name} — ${(toKm(gs.d)).toFixed(1).replace('.', ',')} km`, '⛽');
    this.emit('changed');
  }
  openService() { this.emit('service'); }
  serviceQuote() {
    const st = this.state, veh = this.vehicle;
    const missing = (100 - this.fuelPct()) / 100 * veh.tank;
    return {
      fuel: { units: missing, cost: Math.round(missing * veh.unitPrice * 100) / 100, min: veh.unit === 'kWh' ? Math.round(10 + missing * 0.6) : 6 },
      wash: { cost: 8, min: 20 },
      maint: { cost: Math.round((100 - st.condition) * 1.4 + 15), min: 60 },
    };
  }
  doService(kind) {
    const st = this.state, veh = this.vehicle; const q = this.serviceQuote()[kind];
    if (q.cost > st.balance) { this.notify('Saldo insuficiente', `Precisas de ${eur(q.cost)}.`, '💳'); return false; }
    if (kind === 'fuel') {
      if (q.units < 0.5) { this.notify('Depósito cheio', 'Não é preciso abastecer.', '⛽'); return false; }
      this.addMoney(-q.cost, 'fuel', `${veh.unit === 'kWh' ? 'Carregamento' : 'Abastecimento'} — ${q.units.toFixed(1)} ${veh.unit}`);
      st.fuel[st.vehicle] = 100; this._lowFuelWarned = false;
    } else if (kind === 'wash') { this.addMoney(-q.cost, 'wash', 'Lavagem completa'); st.clean = 100; }
    else { this.addMoney(-q.cost, 'maint', 'Revisão e manutenção'); st.condition = 100; }
    this.skipTime(q.min, kind === 'fuel' ? (veh.unit === 'kWh' ? '🔌 A carregar a bateria...' : '⛽ A abastecer...') : kind === 'wash' ? '🧽 Lavagem em curso...' : '🔧 Revisão na oficina...', null);
    this.save();
    return true;
  }
  buyVehicle(id) {
    const st = this.state, v = VEHICLES[id];
    if (st.owned.includes(id)) return this.selectVehicle(id);
    if (st.level < v.level) { this.notify('Nível insuficiente', `Precisas do nível ${v.level}.`, '🔒'); return; }
    if (st.balance < v.price) { this.notify('Saldo insuficiente', `Precisas de ${eur(v.price)}.`, '💳'); return; }
    this.addMoney(-v.price, 'other', `Compra — ${v.name}`);
    st.owned.push(id); st.fuel[id] = 100;
    this.notify('Veículo comprado!', `${v.name} (${v.cat}) já é teu.`, '🔑');
    this.hud.celebrate('Carro novo!', v.name);
    this.selectVehicle(id); this.checkProgress();
  }
  selectVehicle(id) {
    const st = this.state;
    if (st.ride) { this.notify('Agora não', 'Não podes trocar de carro durante uma viagem.', '⚠️'); return; }
    if (!st.owned.includes(id)) return;
    st.vehicle = id; st.fuel[id] ??= 100;
    this.w.car.build(VEHICLES[id]);
    this.notify('Veículo selecionado', `${VEHICLES[id].name} — categoria ${VEHICLES[id].cat}.`, '🚘');
    this.save(); this.emit('changed');
  }

  // ---------- progresso ----------
  checkProgress() {
    const st = this.state;
    for (const o of st.today.objectives) {
      if (o.done) continue;
      if (objectiveProgress(o, st.today) >= o.target) {
        o.done = true; st.today.objDone++;
        this.later(1, () => { this.addMoney(o.reward, 'bonus', `Objetivo cumprido: ${o.text}`); this.hud.celebrate('Objetivo cumprido!', `${o.text} · +${eur(o.reward)}`); this.addXp(20); this.w.sound.cash(); });
      }
    }
    // desafio semanal
    const wk = Math.floor((st.day - 1) / 7);
    if (st.weekly.week !== wk) st.weekly = { week: wk, trips: 0, claimed: false, base: st.stats.trips };
    st.weekly.base ??= 0;
    st.weekly.trips = st.stats.trips - st.weekly.base;
    if (!st.weekly.claimed && st.weekly.trips >= 40) { st.weekly.claimed = true; this.later(2, () => { this.addMoney(50, 'bonus', 'Desafio semanal: 40 viagens'); this.hud.celebrate('Desafio semanal!', '+50,00 €'); }); }
    for (const a of ACHIEVEMENTS) {
      if (st.achievements[a.id]) continue;
      if (a.test(st)) { st.achievements[a.id] = st.day; this.later(2, () => { this.hud.celebrate(`${a.icon} Conquista desbloqueada`, a.name); this.notify('Conquista: ' + a.name, a.desc, a.icon); this.addXp(15); }); }
    }
  }
  _newWeather(morning = false) {
    const st = this.state; const h = hourOf(st.time);
    const type = pick(morning || h < 10 ? ['limpo', 'limpo', 'nublado', 'nevoeiro', 'nevoeiro', 'chuva'] : ['limpo', 'limpo', 'limpo', 'nublado', 'nublado', 'chuva', 'chuva', 'nevoeiro']);
    st.weather = { type, next: st.time + rr(90, 240) };
  }

  // ---------- ciclo principal ----------
  tick(dtReal) {
    const st = this.state; if (!st) return 0;
    // temporizadores em tempo real
    for (let i = this.timers.length - 1; i >= 0; i--) { const t = this.timers[i]; t.t -= dtReal; if (t.t <= 0) { this.timers.splice(i, 1); t.fn(); } }
    if (this.paused || !st.dayActive) return 0;
    let dtMin = dtReal * st.settings.speed * CFG.TIME_SCALE / 60;
    if (this.skip) {
      const add = Math.min(this.skip.left, this.skip.rate * dtReal);
      this.skip.left -= add; dtMin += add;
      if (this.skip.left <= 0.001) { const cb = this.skip.cb; this.skip = null; if (cb) cb(); this.emit('changed'); }
    }
    st.time += dtMin;
    const T = st.today;
    if (st.online || st.ride) { T.onlineMin += dtMin; st.stats.onlineMin += dtMin; st.sinceBreak += dtMin; st.fatigue = clamp(st.fatigue + dtMin / 6, 0, 100); }
    // consumo de energia e desgaste
    const ap = this.w.ap; const dd = ap.distDriven - this._lastDist; this._lastDist = ap.distDriven;
    if (dd > 0) {
      const km = toKm(dd), veh = this.vehicle;
      const used = km * veh.per100 / 100; T.fuelUsed += used; T.fuelCost += used * veh.unitPrice; st.stats.fuelL += used;
      st.fuel[st.vehicle] = clamp(this.fuelPct() - used / veh.tank * 100, 0, 100);
      st.condition = clamp(st.condition - km * 0.06, 0, 100);
      st.odo += km;
      if (this.fuelPct() < 12 && !this._lowFuelWarned) { this._lowFuelWarned = true; this.notify('Reserva de combustível', 'Vai ao posto: Garagem → Ir ao posto.', '⛽'); this.w.sound.bad(); }
      if (this.fuelPct() <= 0) this._outOfFuel();
    }
    // meteorologia
    if (st.time >= st.weather.next) { const old = st.weather.type; this._newWeather(); if (st.weather.type !== old) this.notify('Meteorologia', `${WEATHERS[st.weather.type].icon} ${WEATHERS[st.weather.type].label}`, WEATHERS[st.weather.type].icon); }
    // pausas
    if (st.sinceBreak > 240 && !st.ride && !this.hud.modalOpen && st.time - this._breakAsked > 60) {
      this._breakAsked = st.time;
      this.hud.decide({ title: 'Estás a trabalhar há 4 horas', icon: '☕', text: 'O cansaço aumenta e os passageiros notam. Queres fazer uma pausa?',
        options: [{ label: 'Pausa de 15 min', fn: () => this.takeBreak(15) }, { label: 'Pausa de 30 min', fn: () => this.takeBreak(30) }, { label: 'Continuar a trabalhar', fn: () => {} }] });
    }
    this.rides.update(dtMin, dtReal);
    this.checkProgressTimer = (this.checkProgressTimer || 0) - dtReal;
    if (this.checkProgressTimer <= 0) { this.checkProgressTimer = 5; this.checkProgress(); }
    // fim do dia
    if (st.time >= CFG.DAY_END - 15 && !this._warnedEnd) { this._warnedEnd = true; this.notify('Quase 02:00', 'O dia de trabalho termina às 02:00.', '🌙'); }
    if (st.time >= CFG.DAY_END && (!st.ride || st.time >= CFG.DAY_END + 30)) { this._warnedEnd = false; this.endDay(true); }
    else if (st.time >= CFG.DAY_END && st.ride) st.endAfterRide = true;
    this._saveTimer -= dtReal;
    if (this._saveTimer <= 0) { this._saveTimer = 20; this.save(); }
    return dtMin;
  }
  _outOfFuel() {
    const st = this.state;
    const r = st.ride;
    if (r && (r.phase === 'onTrip' || r.phase === 'arrived')) { r.early = true; r.mood = 10; this.rides.endTrip(); }
    else if (r) this.rides.cancelByDriver(false);
    const gs = this.w.city.gasStations[0];
    this.addMoney(-60, 'maint', 'Reboque — ficou sem combustível');
    st.fuel[st.vehicle] = 20; this._lowFuelWarned = false;
    this.w.ap.place(gs.edge, gs.s);
    this.skipTime(40, '🚛 Ficaste sem combustível. A aguardar o reboque...', () => this.notify('Reboque', 'O carro foi levado para o posto. Abastece!', '🚛'));
  }
  summaryText(s) { return `${s.trips} viagens · ${eur(s.profit)} · ${dur(s.minutes)}`; }
  clock() { return hhmm(this.state.time); }
  isWeekend() { return isWeekend(this.state.day); }
}
