// Ciclo completo de uma viagem: pedido → recolha → viagem com decisões → pagamento e avaliação.
import * as THREE from 'three';
import { CFG } from '../config.js';
import { clamp, etaMin, isWeekend, pick, rr, toKm, weighted, eur } from '../util.js';
import { hourOf, pickupDemand, destDemand, surge, fareFor, requestRate } from './economy.js';
import { makePassenger, PERSONALITIES, avatar } from './passengers.js';
import { SCENES, FAREWELLS } from './dialogues.js';

const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export class Rides {
  constructor(g) {
    this.g = g; this.req = null; this.nextIn = 1.5; this.dialogOpen = false; this.idleTimer = 0; this.idleTarget = null;
  }
  get ride() { return this.g.state.ride; }
  set ride(v) { this.g.state.ride = v; }
  get w() { return this.g.w; }
  loc(id) { return this.w.city.locations[id]; }

  routeLen(fromEdge, fromS, toEdge, toS) {
    const net = this.w.net;
    if (fromEdge === toEdge && toS > fromS + 12) return toS - fromS;
    const ids = net.findRoute(fromEdge, toEdge);
    if (!ids) return 800;
    let L = net.edges[ids[0]].len - fromS;
    for (let k = 1; k < ids.length; k++) L += CFG.ROADW + (k === ids.length - 1 ? toS : net.edges[ids[k]].len);
    return L;
  }

  // ---------- pedidos ----------
  canRequest() {
    const st = this.g.state;
    return st.dayActive && st.online && !this.ride && !this.req && !this.g.skip && st.time < CFG.DAY_END - 12 && !this.g.serviceTrip && !st.offAfterRide && !st.endAfterRide;
  }
  update(dtMin, dtReal) {
    const st = this.g.state;
    if (this.req) {
      this.req.timer -= dtReal;
      if (this.req.timer <= 0) this.reject(true);
    }
    if (this.canRequest()) {
      this.nextIn -= dtMin;
      if (this.nextIn <= 0) this.spawnRequest();
      this._idle(dtMin);
    }
    const r = this.ride; if (!r) return;
    const ap = this.w.ap;
    if (r.phase === 'toPickup') {
      if (r.cancelAt && ap.path && ap.d / ap.path.length > r.cancelAt) { this.cancelByPax(); return; }
      if (this.w.pax.present && this.w.pax.state === 'stand') this.w.pax.wave(dist2(ap.pos, this.loc(r.pickup).pos) < 70);
    } else if (r.phase === 'waiting') {
      r.waitMin += dtMin;
      if (r.lateLeft > 0 && r.waitMin >= r.lateLeft && !r.paxCame) { r.paxCame = true; this._paxAppear(true); }
      if (!r.paxCame && r.waitMin >= (r.nextAsk || 4) && !this.g.hud.modalOpen) this._askLate();
    } else if (r.phase === 'boarded') {
      r.boardWait = (r.boardWait || 0) + dtMin;
      if (r.boardWait > 1.5 && !r.nudged) { r.nudged = true; r.mood -= 3; this._say('Podemos ir?'); }
    } else if (r.phase === 'onTrip') {
      if (r.holdUntil && st.time >= r.holdUntil) this._release();
      if (!this.dialogOpen && ap.path && !r.holdUntil) {
        const prog = ap.d / ap.path.length;
        const next = r.sched[0];
        if (next !== undefined && (next.kind === 'greet' ? st.time - r.startT > 0.6 : prog >= next.at)) {
          r.sched.shift(); this._playKind(next.kind);
        }
      }
      // humor afetado por semáforos para apressados
      if (r.pax.pers === 'apressado' && ap.redAhead && ap.v < 0.2) r.mood -= dtMin * 1.5;
    } else if (r.phase === 'arrived') {
      r.arrWait = (r.arrWait || 0) + dtMin;
      if (r.arrWait > 1.5 && !r.arrNudged) { r.arrNudged = true; r.mood -= 3; this._say('Já chegámos, não é?'); }
      if (r.arrWait > 4) this.endTrip();
    }
  }

  spawnRequest() {
    const g = this.g, st = g.state, city = this.w.city, ap = this.w.ap;
    const h = hourOf(st.time), wk = isWeekend(st.day);
    const carPos = ap.pos;
    const locs = city.locations;
    const pickup = weighted(locs, (l) => { const d = dist2(l.pos, carPos); return d < 30 ? 0 : pickupDemand(l.district, h, wk) * Math.exp(-d / 230); });
    const dest = weighted(locs, (l) => {
      if (l === pickup) return 0;
      const d = dist2(l.pos, pickup.pos);
      const pref = d < 130 ? 0.03 : d < 260 ? 0.5 : d < 650 ? 1 : 0.75;
      return destDemand(l.district, h, pickup.district) * pref;
    });
    const pickDist = ap.routeLength(pickup.edge, pickup.s);
    const tripDist = this.routeLen(pickup.edge, pickup.s, dest.edge, dest.s);
    const estMin = etaMin(tripDist) + 1;
    const sur = surge(st.time, wk, this.w.env.state.rain);
    const veh = g.vehicle;
    const airport = pickup.district === 'A' || dest.district === 'A';
    const fare = fareFor(tripDist, estMin, veh, sur, airport);
    const seed = Math.floor(Math.random() * 1e9);
    const pax = makePassenger(seed, { hour: h, district: pickup.district, destDistrict: dest.district, premium: veh.cat === 'RIDO Black' });
    this.req = { seed, pax, pickup: pickup.id, dest: dest.id, pickDist, tripDist, estMin, pickMin: etaMin(pickDist), fare, net: fare * (1 - CFG.COMMISSION), surge: sur, cat: veh.cat, timer: CFG.REQUEST_TIMEOUT, airport };
    const mean = 7 / requestRate(st.time, wk, this.w.env.state.rain) / (veh.cat === 'RIDO Black' ? 0.75 : 1) / (g.ratingAvg() < 4.5 ? 0.75 : 1);
    this.nextIn = clamp(-Math.log(1 - Math.random()) * mean, 1.2, 28);
    this.w.sound.request();
    g.emit('request', this.req);
  }
  reject(timeout = false) {
    if (!this.req) return;
    const st = this.g.state;
    st.stats.rejected++; st.today.streak = 0; st.streak = 0;
    this.req = null; this.nextIn = Math.max(this.nextIn, rr(0.8, 3));
    this.g.notify(timeout ? 'Pedido expirado' : 'Pedido recusado', timeout ? 'Não respondeste a tempo. A taxa de aceitação baixou.' : 'A taxa de aceitação foi atualizada.', '✖️');
    this.g.emit('changed');
  }
  accept() {
    const r = this.req; if (!r) return;
    const g = this.g, st = g.state;
    this.req = null;
    st.stats.accepted++; st.today.streak++; st.today.bestStreak = Math.max(st.today.bestStreak, st.today.streak);
    const P = PERSONALITIES[r.pax.pers];
    const ride = {
      ...r, id: st.stats.accepted, phase: 'toPickup', acceptT: st.time, waitMin: 0, lateLeft: r.pax.late, paxCame: false,
      mood: P.mood + g.vehicle.moodBonus, tipExtra: 0, fareAdd: 0, played: [], sched: [], log: [],
      cancelAt: r.pax.cancels ? rr(0.15, 0.75) : 0, startT: 0, drivenStart: 0,
    };
    delete ride.timer;
    this.ride = ride;
    this._goPickup();
    if (!ride.lateLeft) this._spawnPax(false);
    if (r.pax.note?.tag === 'call') this.g.later(4, () => this.g.message(ride, 'Olá! Ligue-me quando estiver cá fora, por favor.'));
    else if (Math.random() < 0.35) this.g.later(5, () => this.g.message(ride, pick(['Olá! Estou à espera na entrada.', 'Ok, obrigado! Até já.', 'Estou de casaco azul 😊', 'Já estou cá em baixo.'])));
    g.emit('changed'); g.save();
  }
  _goPickup() {
    const l = this.loc(this.ride.pickup);
    this.w.ap.speedFactor = 1;
    if (!this.w.ap.routeTo(l.edge, l.s, true, () => this.onArrivePickup())) this.onArrivePickup();
  }
  _spawnPax(walkNow) {
    const r = this.ride; const l = this.loc(r.pickup);
    const e = this.w.net.edges[l.edge];
    const pos = l.walk.clone(); pos.y = 0.16;
    pos.x += e.d.x * rr(-2, 2); pos.z += e.d.z * rr(-2, 2);
    this.w.pax.spawn(r.pax.look, pos, l.pos);
    if (walkNow) this._paxToCar();
  }
  _paxAppear(late) {
    const r = this.ride;
    this._spawnPax(true);
    if (late) { r.wasLate = true; this.g.message(r, pick(['Desculpe a demora! Já vou!', 'Estou a descer, peço imensa desculpa!', 'Só mais um segundo!'])); }
  }
  _paxToCar() {
    const door = this.w.car.toWorld(1.35, 0, 0.85); door.y = 0.16;
    this.w.pax.walkTo(door, () => {
      this.w.sound.door();
      this.w.pax.seat();
      const r = this.ride; if (!r) return;
      r.phase = 'boarded'; r.boardWait = 0;
      this.g.notify('Passageiro a bordo', `${r.pax.first} entrou no carro. Toca em «Iniciar viagem».`, '🧍');
      this.g.emit('changed');
    });
  }
  onArrivePickup() {
    const r = this.ride; if (!r || r.phase !== 'toPickup') return;
    r.phase = 'waiting'; r.arriveT = this.g.state.time; r.waitMin = 0;
    this.w.sound.ping();
    this.g.notify('Chegaste ao local de recolha', `${this.loc(r.pickup).name}. A aguardar ${r.pax.first}...`, '📍');
    if (!r.lateLeft) { r.paxCame = true; if (!this.w.pax.present) this._spawnPax(true); else this._paxToCar(); }
    this.g.emit('changed');
  }
  _askLate() {
    const r = this.ride; const waited = Math.round(r.waitMin);
    const fee = r.waitMin >= 5;
    this.g.hud.decide({
      title: 'Passageiro atrasado', icon: '⏳', img: avatar(r.pax),
      text: `${r.pax.name} ainda não apareceu. Estás à espera há ${waited} min.`,
      options: [
        { label: 'Esperar mais 3 minutos', fn: () => { r.nextAsk = r.waitMin + 3; } },
        { label: 'Enviar mensagem ao passageiro', fn: () => { r.nextAsk = r.waitMin + 3; this.g.message(r, 'Estou a chegar, desculpe!'); r.lateLeft = Math.min(r.lateLeft, r.waitMin + 1.2); } },
        { label: fee ? `Cancelar e receber taxa (${eur(CFG.FARE.cancelFee)})` : 'Cancelar (sem taxa, antes dos 5 min)', danger: true, fn: () => this.cancelByDriver(fee) },
      ],
    });
    r.nextAsk = r.waitMin + 999;
  }
  cancelByPax() {
    const r = this.ride; const st = this.g.state;
    const fee = st.time - r.acceptT > 2 ? CFG.FARE.cancelFee * (1 - CFG.COMMISSION) : 0;
    st.stats.cancelPax++;
    this.w.ap.stop(); this.w.pax.remove();
    this.ride = null; this.nextIn = rr(0.5, 2);
    this.g.notify('Viagem cancelada pelo passageiro', fee ? `${r.pax.first} cancelou. Recebeste a taxa de cancelamento.` : `${r.pax.first} cancelou a viagem.`, '🚫');
    if (fee) this.g.addMoney(fee, 'trip', `Taxa de cancelamento — ${r.pax.name}`);
    this.w.sound.bad();
    this.g.hud.closeDialog(); this.dialogOpen = false;
    this.g.emit('changed'); this.g.save();
  }
  cancelByDriver(withFee = false) {
    const r = this.ride; if (!r) return;
    const st = this.g.state;
    if (r.phase === 'onTrip' || r.phase === 'arrived') { this.g.notify('Não é possível', 'Não podes cancelar com o passageiro no carro.', '⚠️'); return; }
    if (withFee) { this.g.addMoney(CFG.FARE.cancelFee * (1 - CFG.COMMISSION), 'trip', `Taxa de cancelamento — ${r.pax.name}`); st.stats.cancelPax++; }
    else { st.stats.cancelMe++; st.streak = 0; st.today.streak = 0; }
    this.w.ap.stop();
    if (r.phase === 'boarded') { const l = this.loc(r.pickup); this.w.pax.exitTo(l.walk, null); } else this.w.pax.remove();
    this.ride = null; this.nextIn = rr(1, 3);
    this.g.notify('Viagem cancelada', withFee ? 'Cancelaste após o tempo de espera. Recebeste a taxa.' : 'Cancelaste a viagem. A taxa de cancelamento foi registada.', '🚫');
    this.g.hud.closeDialog(); this.dialogOpen = false;
    this.g.emit('changed'); this.g.save();
  }

  // ---------- viagem ----------
  startTrip() {
    const r = this.ride; if (!r || r.phase !== 'boarded') return;
    const st = this.g.state, ap = this.w.ap;
    r.phase = 'onTrip'; r.startT = st.time; r.drivenStart = ap.distDriven;
    const d = this.loc(r.dest);
    ap.speedFactor = 1;
    ap.routeTo(d.edge, d.s, true, () => this.onArriveDest());
    // agenda de conversas
    const P = PERSONALITIES[r.pax.pers];
    const n = P.chat === 0 ? (Math.random() < 0.5 ? 1 : 0) : P.chat + (Math.random() < 0.3 ? 1 : 0) - (Math.random() < 0.3 ? 1 : 0);
    const at = []; for (let i = 0; i < Math.max(0, n); i++) at.push(rr(0.18, 0.85));
    at.sort((a, b) => a - b);
    r.sched = [];
    if (P.chat > 0 || r.pax.pers === 'calado' || Math.random() < 0.6) r.sched.push({ kind: 'greet', at: 0 });
    at.forEach((a) => r.sched.push({ kind: 'mid', at: a }));
    if (Math.random() < 0.22) { r.sched.push({ kind: 'event', at: rr(0.3, 0.7) }); r.sched.sort((a, b) => (a.kind === 'greet' ? -1 : b.kind === 'greet' ? 1 : a.at - b.at)); }
    if (st.fatigue > 75) { r.mood -= 6; this.g.notify('Estás cansado', 'O cansaço afeta a tua condução e as avaliações. Considera fazer uma pausa.', '😴'); }
    if (st.clean < 40) r.mood -= 6;
    if (st.condition < 35) r.mood -= 4;
    const pickupTook = r.arriveT - r.acceptT;
    if (pickupTook > r.pickMin * 1.8 + 3) r.mood -= 5;
    if (r.wasLate) r.mood += 2;
    this.w.sound.click();
    this.g.emit('changed'); this.g.save();
  }
  onArriveDest() {
    const r = this.ride; if (!r || r.phase !== 'onTrip') return;
    r.phase = 'arrived'; r.arrWait = 0;
    this.w.ap.speedFactor = 1;
    this.w.sound.ping();
    this.g.notify('Chegaste ao destino', 'Toca em «Terminar viagem» para concluir.', '🏁');
    this.g.emit('changed');
  }
  endTrip() {
    const r = this.ride; if (!r || (r.phase !== 'arrived' && r.phase !== 'onTrip')) return;
    const g = this.g, st = g.state, ap = this.w.ap, veh = g.vehicle;
    this.g.hud.closeDialog(); this.dialogOpen = false;
    const drivenW = Math.max(50, ap.distDriven - r.drivenStart);
    const minutes = Math.max(1, st.time - r.startT);
    let fare = Math.max(CFG.FARE.min, r.fare + r.fareAdd);
    if (r.early) fare = Math.max(CFG.FARE.min, r.fare * clamp(drivenW / r.tripDist, 0.2, 1));
    if (r.destChanged) fare = Math.max(fare, fareFor(drivenW, minutes, veh, r.surge, r.airport) + r.fareAdd);
    fare = Math.round(fare * 100) / 100;
    const commission = Math.round(fare * CFG.COMMISSION * 100) / 100;
    const net = Math.round((fare - commission) * 100) / 100;
    // humor final
    let mood = r.mood;
    if (r.slow && this.w.env.state.fog < 0.5) mood -= 4;
    if (st.fatigue > 85) mood -= 4;
    mood = clamp(mood, 0, 110);
    let rating = clamp(Math.round(2.9 + mood / 100 * 2.35 + rr(-0.35, 0.35)), 1, 5);
    if (r.early) rating = mood > 50 ? 3 : Math.random() < 0.6 ? 1 : 2;
    const P = PERSONALITIES[r.pax.pers];
    let tip = 0;
    const tipP = clamp((P.tip + veh.tipBonus) * clamp((mood - 40) / 45, 0, 1.4), 0, 0.95);
    if (!r.early && Math.random() < tipP) tip = Math.round(rr(0.5, 3) * (r.pax.pers === 'generoso' ? 2 : 1) * (0.7 + veh.fareMult * 0.3) * 2) / 2;
    if (mood > 50 && r.tipExtra > 0) tip += r.tipExtra;
    // pagamento
    st.today.gross += fare; st.today.commission += commission; st.stats.commission += commission;
    g.addMoney(net, 'trip', `Viagem — ${r.pax.name}`);
    this.w.sound.cash();
    const km = toKm(drivenW);
    st.stats.trips++; st.today.trips++; st.stats.km += km; st.today.km += km;
    const h = hourOf(st.time);
    const airport = this.loc(r.pickup).district === 'A' || this.loc(r.dest).district === 'A';
    if (airport) { st.stats.airport++; st.today.airport++; }
    if (h >= 22 || h < 3) { st.stats.night++; st.today.night++; }
    if (this.w.env.state.rain > 0.5) st.stats.rainTrips++;
    st.clean = clamp(st.clean - rr(1.5, 3), 0, 100);
    // bónus de sequência
    st.streak = (st.streak || 0) + 1;
    if (st.streak % 3 === 0) this.g.later(2.5, () => g.addMoney(1.5, 'bonus', `Bónus de sequência (${st.streak} viagens seguidas)`, true));
    // radar
    if (r.faster && Math.random() < 0.22) this.g.later(9, () => { g.addMoney(-60, 'fine', 'Multa — radar de velocidade'); g.notify('📸 Radar de velocidade', 'Foste apanhado em excesso de velocidade: multa de 60 €.', '🚨'); this.w.sound.bad(); });
    const entry = {
      id: st.stats.trips, day: st.day, t: Math.floor(st.time), seed: r.seed, name: r.pax.name, pers: r.pax.pers, paxRating: r.pax.rating,
      from: this.loc(r.pickup).name, to: this.loc(r.dest).name, km: Math.round(km * 10) / 10, min: Math.round(minutes),
      fare, commission, net, tip: 0, rating: 0, surge: r.surge, look: r.pax.look, cat: r.cat, log: r.log.slice(0, 6), early: !!r.early,
    };
    st.history.unshift(entry); if (st.history.length > 250) st.history.length = 250;
    // xp
    const xp = 10 + Math.round(km) + (airport ? 5 : 0);
    g.addXp(xp);
    // passageiro sai
    const dl = this.loc(r.dest);
    const say = mood > 65 ? pick(FAREWELLS.good) : mood > 40 ? pick(FAREWELLS.ok) : pick(FAREWELLS.bad);
    this._say(say);
    this.g.later(1.6, () => { this.w.sound.door(); this.w.pax.exitTo(dl.walk, null); });
    // avaliação e gorjeta chegam depois
    const name = r.pax.name, pers = r.pax.pers;
    this.g.later(6, () => {
      entry.rating = rating; entry.tip = tip;
      st.stats.ratings.push(rating); if (st.stats.ratings.length > 100) st.stats.ratings.shift();
      st.stats.ratingSum += rating; st.stats.ratingN++;
      st.today.ratings.push(rating);
      if (rating === 5) { st.stats.five++; st.today.five++; g.addXp(5); if (pers === 'rude') st.flags.rudeFive = true; }
      if (tip > 0) { g.addMoney(tip, 'tip', `Gorjeta — ${name}`); st.today.tips += tip; st.stats.tips += tip; }
      g.notify(`${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} ${name}`, tip > 0 ? `Avaliou-te com ${rating} estrelas e deixou ${eur(tip)} de gorjeta!` : `Avaliou-te com ${rating} estrela${rating > 1 ? 's' : ''}.`, rating >= 4 ? '⭐' : '😕');
      if (tip > 0) this.w.sound.cash(); else if (rating <= 2) this.w.sound.bad(); else this.w.sound.ping();
      g.checkProgress(); g.emit('changed'); g.save();
      // objeto esquecido
      if (Math.random() < 0.06 && !r.early) this._lostItem(name);
    });
    this.ride = null; this.nextIn = rr(0.6, 3.5); ap.hold = false; ap.speedFactor = 1;
    g.emit('tripDone', entry);
    if (st.offAfterRide) { st.offAfterRide = false; g.goOffline(); }
    if (st.endAfterRide) { st.endAfterRide = false; g.later(3, () => g.endDay()); }
    g.checkProgress(); g.emit('changed'); g.save();
  }
  _lostItem(name) {
    const item = pick(['telemóvel', 'guarda-chuva', 'carteira', 'casaco', 'óculos de sol', 'saco de compras']);
    if (this.ride) return;
    this.g.hud.decide({
      title: 'Objeto esquecido', icon: '🎒',
      text: `${name} esqueceu-se de um ${item} no banco de trás.`,
      options: [
        { label: 'Contactar e devolver (≈10 min)', fn: () => { this.g.skipTime(10, 'A devolver o objeto...'); this.g.later(3, () => { this.g.addMoney(5, 'tip', `Agradecimento — ${name}`); this.g.notify('Objeto devolvido', `${name} agradeceu muito e deixou-te 5,00 €.`, '🙏'); this.g.addXp(10); }); } },
        { label: 'Entregar nos perdidos e achados', fn: () => this.g.notify('Perdidos e achados', 'Objeto entregue. Obrigado pela honestidade.', '📦') },
      ],
    });
  }

  // ---------- conversas e decisões ----------
  ctx() {
    const r = this.ride, st = this.g.state;
    const h = hourOf(st.time);
    const saud = h >= 6 && h < 13 ? 'Bom dia' : h >= 13 && h < 20 ? 'Boa tarde' : 'Boa noite';
    const d = this.loc(r.dest);
    return {
      saud, hour: h, night: h >= 21 || h < 5, pers: r.pax.pers, weather: this.g.weatherType(), clean: st.clean,
      dest: d.name, destShort: d.name, destDistrict: d.district, noteTag: r.pax.note?.tag, redAhead: this.w.ap.redAhead,
      newDest: r._newDest ? this.loc(r._newDest).name : '',
    };
  }
  _playKind(kind) {
    const r = this.ride;
    if (kind === 'mid' && !r.destChanged && Math.random() < 0.12) {
      // preparar um destino alternativo para a cena de mudança de destino
      const cur = this.loc(r.dest);
      const opts = this.w.city.locations.filter((l) => l.id !== r.dest && dist2(l.pos, cur.pos) > 120 && dist2(l.pos, cur.pos) < 380 && l.kind === 'poi');
      if (opts.length) r._newDest = pick(opts).id;
    }
    const c = this.ctx();
    const pool = SCENES.filter((s) => s.kind === kind && !r.played.includes(s.id) && (!s.pers || s.pers.includes(r.pax.pers)) && (!s.cond || s.cond(c)) && (s.id !== 'm_change' || r._newDest));
    if (!pool.length) return;
    const sc = weighted(pool, (s) => (s.w ?? 1) * (s.id === 'm_change' ? 2.5 : 1));
    r.played.push(sc.id);
    this.playScene(sc, c);
  }
  _say(text, sec = 3.5) {
    const r = this.ride; if (!r && !this.w.pax.present) return;
    const pax = r ? r.pax : null;
    this.w.pax.say(sec);
    this.g.hud.say(pax ? pax.first : 'Passageiro', text, pax ? avatar(pax) : null, sec);
    if (pax) this.w.sound.speak(text, pax.gender);
  }
  playScene(sc, c) {
    const r = this.ride; const t = typeof sc.text === 'function' ? sc.text(c) : sc.text;
    this.dialogOpen = true;
    if (!sc.sys) { this.w.pax.say(3.5); this.w.sound.speak(t, r.pax.gender); }
    else this.w.sound.ping();
    const choices = sc.choices.map((ch) => (typeof ch.t === 'function' ? ch.t(c) : ch.t));
    this.g.hud.dialog({
      name: sc.sys ? 'Situação' : r.pax.first, img: sc.sys ? null : avatar(r.pax), text: t, sys: !!sc.sys, choices, timeout: sc.sys ? 12 : 14,
      onChoose: (i, timedOut) => {
        this.dialogOpen = false;
        if (!this.ride || this.ride !== r) return;
        const idx = i < 0 ? (sc.sys ? 0 : choices.length - 1) : i;
        const ch = sc.choices[idx];
        if (timedOut && !sc.sys) r.mood -= 3;
        r.log.push(`${sc.sys ? '⚠️' : '💬'} ${t.length > 60 ? t.slice(0, 57) + '…' : t} → ${choices[idx]}`);
        this._applyChoice(ch, sc);
      },
    });
  }
  _applyChoice(ch, sc) {
    const r = this.ride;
    let mood = ch.mood || 0; let eff = ch.eff; let reply = ch.reply;
    if (ch.moodPers && ch.moodPers[r.pax.pers] !== undefined) mood = ch.moodPers[r.pax.pers];
    if (ch.rnd) { const o = Math.random() < ch.rnd.p ? ch.rnd.ok : ch.rnd.bad; mood += o.mood || 0; eff = { ...(eff || {}), ...(o.eff || {}) }; reply = o.reply || reply; }
    // personalidades reagem de forma diferente
    if (r.pax.pers === 'calado' && mood > 0 && sc.kind === 'mid' && sc.id !== 'm_quiet_ok') mood = Math.round(mood * 0.6);
    if (r.pax.pers === 'rude' && mood > 0) mood = Math.round(mood * 0.8);
    r.mood += mood;
    if (eff) this._applyEffect(eff);
    if (reply) this.g.later(0.6, () => { if (sc.sys) this.g.hud.say('', reply, null, 3.5); else this._say(reply); });
    this.g.emit('changed');
  }
  _applyEffect(e) {
    const g = this.g, st = g.state, ap = this.w.ap, r = this.ride;
    if (e.tip) r.tipExtra += e.tip;
    if (e.fareAdd) { r.fareAdd += e.fareAdd; if (e.fareAdd >= 20) g.notify('Taxa de limpeza', `Foi cobrada ao passageiro uma taxa de limpeza de ${eur(e.fareAdd)}.`, '🧽'); }
    if (e.money) g.addMoney(e.money, e.money < 0 ? 'fine' : 'other', e.money < 0 ? 'Multa / despesa durante viagem' : 'Dinheiro extra');
    if (e.clean) st.clean = clamp(st.clean + e.clean, 0, 100);
    if (e.condition) st.condition = clamp(st.condition + e.condition, 0, 100);
    if (e.rep) r.mood += e.rep * 2;
    if (e.horn) this.w.sound.horn();
    switch (e.action) {
      case 'faster': ap.speedFactor = 1.28; r.faster = true; r.log.push('⚡ Acelerou a pedido do passageiro'); break;
      case 'slow': ap.speedFactor = 0.65; r.slow = true; break;
      case 'detour': this._detour(); break;
      case 'stop': this._stop(e.stopMin || 3, e.inLane, e.police); break;
      case 'changeDest': this._changeDest(); break;
      case 'endEarly': this._endEarly(); break;
      case 'hardBrake': ap.v *= 0.15; this.w.jolt(1); break;
    }
  }
  _detour() {
    const r = this.ride, ap = this.w.ap; const d = this.loc(r.dest);
    const ids = ap.routeIds || []; const i = ids.indexOf(ap.edge);
    const blocked = new Set();
    if (i >= 0 && ids[i + 1] !== undefined && ids[i + 1] !== d.edge) blocked.add(ids[i + 1]);
    if (!ap.routeTo(d.edge, d.s, true, () => this.onArriveDest(), blocked)) ap.routeTo(d.edge, d.s, true, () => this.onArriveDest());
    r.log.push('↪️ Rota alternativa');
    this.g.notify('Rota recalculada', 'A navegação encontrou um caminho alternativo.', '🧭');
  }
  _stop(min, inLane, police) {
    const r = this.ride, ap = this.w.ap, st = this.g.state;
    const hold = () => { r.holdUntil = st.time + min; r.police = police; };
    const p = ap.curPiece;
    if (!inLane && p && p.kind === 'edge' && p.edge.len - ap.s > 30) {
      ap.routeTo(p.edge.id, ap.s + 24, true, hold);
      r.resume = true;
    } else { ap.hold = true; hold(); r.resume = false; }
    this.g.notify('Paragem', `Paragem de cerca de ${min} min.`, '⏸️');
  }
  _release() {
    const r = this.ride, ap = this.w.ap, st = this.g.state;
    r.holdUntil = 0; ap.hold = false;
    if (r.police) { r.police = false; if (st.condition < 45) { this.g.addMoney(-80, 'fine', 'Multa — veículo em mau estado'); this.g.notify('👮 Multa', 'O veículo apresenta defeitos: multa de 80 €. Faz a revisão!', '🚨'); } else this.g.notify('👮 Tudo em ordem', 'Documentos verificados. Boa viagem!', '✅'); }
    if (r.resume || !ap.path) { const d = this.loc(r.dest); ap.routeTo(d.edge, d.s, true, () => this.onArriveDest()); }
  }
  _changeDest() {
    const r = this.ride, ap = this.w.ap;
    if (!r._newDest) return;
    r.dest = r._newDest; r._newDest = null; r.destChanged = true;
    const d = this.loc(r.dest);
    ap.routeTo(d.edge, d.s, true, () => this.onArriveDest());
    const driven = ap.distDriven - r.drivenStart;
    const est = driven + ap.remaining;
    r.tripDist = est;
    r.fare = fareFor(est, etaMin(est) + 1, this.g.vehicle, r.surge, r.airport || d.district === 'A');
    r.log.push('📍 Destino alterado para ' + d.name);
    this.g.notify('Destino alterado', `Novo destino: ${d.name}. Tarifa estimada: ${eur(r.fare * (1 - CFG.COMMISSION))} (líquido).`, '📍');
  }
  _endEarly() {
    const r = this.ride, ap = this.w.ap;
    r.early = true; r.log.push('🛑 Viagem terminada antecipadamente');
    const p = ap.curPiece;
    const fin = () => { r.phase = 'arrived'; r.arrWait = 3.5; this.g.emit('changed'); };
    if (p && p.kind === 'edge' && p.edge.len - ap.s > 25) ap.routeTo(p.edge.id, ap.s + 20, true, fin);
    else { ap.stop(); fin(); }
  }

  // ---------- sem viagem: posicionamento ----------
  _idle(dtMin) {
    const st = this.g.state, ap = this.w.ap;
    const mode = st.settings.idle;
    if (mode === 'parado' || this.g.serviceTrip) return;
    this.idleTimer -= dtMin;
    if (ap.moving || this.idleTimer > 0) return;
    const h = hourOf(st.time), wk = isWeekend(st.day);
    const locs = this.w.city.locations;
    let target;
    if (mode === 'circular') target = pick(locs.filter((l) => dist2(l.pos, ap.pos) > 80 && dist2(l.pos, ap.pos) < 300));
    else target = weighted(locs, (l) => Math.pow(pickupDemand(l.district, h, wk), 2) * Math.exp(-dist2(l.pos, ap.pos) / 300));
    this.idleTimer = mode === 'circular' ? 0.5 : 25;
    if (target && dist2(target.pos, ap.pos) > 40) ap.routeTo(target.edge, target.s, true, null);
  }
}
export { THREE };
