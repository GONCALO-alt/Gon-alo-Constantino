/* Sessões de corrida e qualificação: rivais, partida, voltas, tempos, boxes, pneus e resultados. */
'use strict';

const DIFF = { facil: 0.9, medio: 0.952, dificil: 0.985, lenda: 1.004 };
const NCP = 30; // pontos de cronometragem por volta

function carAccel(p, v) { const F = Math.min(p.P / Math.max(v, 6), p.m * p.acc0, p.mu * (p.m * 9.81 * (p.a / p.L) + p.cl * v * v * 0.55)); return (F - p.cd * v * v) / p.m; }
function carBrake(p, v) { return (p.mu * (p.m * 9.81 + p.cl * v * v) * p.brk + p.cd * v * v) / p.m; }

// pontos do mundo a partir de (índice/distância, desvio lateral ao centro)
function trackPoint(T, s, lat) {
  const f = (((s % T.len) + T.len) % T.len) / T.ds;
  const i = Math.floor(f) % T.n, j = (i + 1) % T.n, t = f - Math.floor(f);
  const x = lerp(T.x[i], T.x[j], t), y = lerp(T.y[i], T.y[j], t);
  const nx = lerp(T.nx[i], T.nx[j], t), ny = lerp(T.ny[i], T.ny[j], t);
  return { x: x + nx * lat, y: y + ny * lat, i, th: Math.atan2(lerp(T.ty[i], T.ty[j], t), lerp(T.tx[i], T.tx[j], t)) };
}
const offAt = (T, s) => { const f = (((s % T.len) + T.len) % T.len) / T.ds; const i = Math.floor(f) % T.n; return lerp(T.off[i], T.off[(i + 1) % T.n], f - Math.floor(f)); };

class Race {
  constructor(opts) {
    // opts: { T, cat, mode: 'race'|'quali', laps, field: [{driver, params}], player: {driver, params}, settings, grid: [ids] }
    Object.assign(this, opts);
    const T = this.T, C = catById(this.cat);
    this.C = C; this.time = 0; this.phase = 'grid'; this.phaseT = 0; this.lightsN = 0; this.msgs = [];
    this.fastest = null; this.finishOrder = []; this.done = false;
    this.cars = [];
    const gap = C.id === 'kart' ? 6.5 : 8;
    // grelha: atrás da linha, em zigue-zague
    const order = this.grid || [this.player.driver.id, ...this.field.map((f) => f.driver.id)];
    const all = [{ ...this.player, isPlayer: true }, ...this.field];
    order.forEach((id, k) => {
      const e = all.find((a) => a.driver.id === id);
      const s = this.mode === 'quali' ? T.len - (T.kart ? 90 : 320) : T.len - 12 - k * gap;
      const lat = this.mode === 'quali' ? T.off[0] : (k % 2 ? 1 : -1) * T.W * 0.22;
      const car = { id: e.driver.id, d: e.driver, p: e.params, isPlayer: !!e.isPlayer, s, lat, v: 0, lap: -1, cp: {}, lastCp: -1, lapStart: 0, laps: [], best: null,
        tyre: e.tyre || 'M', wear: 0, used: new Set([e.tyre || 'M']), pitLap: e.pitLap ?? -1, pitState: 0, pitT: 0, pits: 0, penalty: 0, finished: false, finishT: 0,
        prof: speedProfile(T, e.params), dTarget: 0, dl: 0, react: 0.18 + Math.random() * 0.35, mistakeT: 0, gridK: k, mode: 1 };
      if (!e.isPlayer) {
        const pt = trackPoint(T, s, lat);
        car.x = pt.x; car.y = pt.y; car.th = pt.th; car.dl = lat - offAt(T, s);
        car.pace = e.pace; car.accel = (v) => carAccel(e.params, v); car.brake = (v) => carBrake(e.params, v);
      } else {
        const pt = trackPoint(T, s, lat);
        car.phys = new Car(e.params);
        car.phys.place(pt.x, pt.y, pt.th);
        car.phys.tireGrip = COMPOUNDS[car.tyre].grip;
        car.hint = pt.i; car.lat = lat;
        if (this.mode === 'quali') { car.phys.setVel(car.prof.v[pt.i] * 0.75); }
        this.me = car;
      }
      this.cars.push(car);
    });
    if (this.mode === 'quali' || this.mode === 'practice') { this.phase = 'race'; for (const c of this.cars) c.lap = -1; this.me.lap = -1; }
    if (this.mode === 'practice') { this.laps = 10; }
    // meteorologia: chuva no início e no fim; muda a meio
    this.weather = this.weather || { start: 0, end: 0, at: 0.5 };
    this.rain = this.weather.start; this.wet = this.weather.start > 0.3 ? Math.min(1, this.weather.start + 0.15) : 0;
    for (const c of this.cars) { c.dmg = 0; c.susp = 0; c.out = false; c.yieldT = 0; }
    this.yellows = []; this.sc = null; this.flag = null; this.events = [];
    this.rep = { dt: 0.05, acc: 0, frames: [], ids: this.cars.map((c) => c.id) };
    this.teamOrderAsked = false;
    this.boxReq = null; this.radio = [];
    this.skids = []; this.parts = [];
    this.lapLen = T.len;
  }
  say(text, kind = '') { this.msgs.push({ text, kind, t: this.time }); if (this.onMsg) this.onMsg(text, kind); }
  progress(c) { return c.lap * this.T.len + (((c.s % this.T.len) + this.T.len) % this.T.len); }
  // posição na corrida (1 = primeiro)
  standings() {
    return this.cars.slice().sort((a, b) => {
      if (a.out !== b.out) return a.out ? 1 : -1;
      if (a.finished && b.finished) return a.finishT - b.finishT;
      if (a.finished) return -1; if (b.finished) return 1;
      return this.progress(b) - this.progress(a);
    });
  }
  tyreGrip(c) {
    const comp = COMPOUNDS[c.tyre], w = c.wear;
    const k = w < 0.7 ? 1 - 0.07 * (w / 0.7) : 0.93 - 0.55 * (w - 0.7);
    return comp.grip * Math.max(0.74, k) * wetFactor(c.tyre, this.wet || 0);
  }
  // fração da corrida feita pelo líder
  raceFrac() { const l = this.cars.reduce((a, c) => Math.max(a, this.progress(c)), 0); return clamp(l / (this.laps * this.T.len), 0, 1); }
  // incidentes: bandeira amarela e, se for grave, safety car
  incident(c, kind) {
    const T = this.T;
    this.yellows.push({ s: c.s, until: this.time + (kind === 'crash' ? 25 : 8) });
    if (c.isPlayer) return;
    if (kind === 'crash') {
      c.out = true; c.v = 0; c.dl = (c.dl > 0 ? 1 : -1) * (T.W / 2 + T.runoff * 0.6) - offAt(T, c.s) + c.dl * 0;
      this.say(`${c.d.last} bateu e desistiu. Bandeira amarela no setor.`, 'warn');
      if (!this.sc && !T.kart && this.mode === 'race' && Math.random() < 0.7) this.deploySC();
    } else this.say(`${c.d.last} fez um pião à tua frente! Cuidado.`, 'warn');
  }
  deploySC() {
    const leader = this.standings().find((c) => !c.out);
    this.sc = { s: (leader ? leader.s : 0) + 160, laps: 2, startLap: leader ? leader.lap : 0, v: 0, inLap: false };
    this.say('Safety car na pista! Sem ultrapassagens. Abranda e mantém a posição.', 'warn');
    if (this.onFlag) this.onFlag('sc');
  }
  redFlag() {
    this.phase = 'red'; this.phaseT = 0; this.sc = null;
    this.say('Bandeira vermelha! A corrida está suspensa. Vamos recomeçar da grelha.', 'warn');
    if (this.onFlag) this.onFlag('red');
  }
  restartFromRed() {
    const T = this.T, order = this.standings().filter((c) => !c.out), gap = T.kart ? 6.5 : 8, L = order[0] ? order[0].lap : 0;
    order.forEach((c, k) => {
      c.s = T.len - 12 - k * gap; c.lap = L - 1; c.v = 0; c.dl = (k % 2 ? 1 : -1) * T.W * 0.22 - offAt(T, c.s); c.dTarget = 0; c.pitState = 0; c.cp = {};
      if (c.isPlayer) { const pt = trackPoint(T, c.s, (k % 2 ? 1 : -1) * T.W * 0.22); c.phys.place(pt.x, pt.y, pt.th); c.hint = pt.i; c.lat = (k % 2 ? 1 : -1) * T.W * 0.22; }
      else this.placeAI(c);
    });
    this.phase = 'grid'; this.phaseT = 0; this.holdT = undefined; this.lightsN = 0;
  }
  // fim de uma volta
  lapDone(c) {
    const t = this.time - c.lapStart;
    if (c.lap >= 1 || (this.mode === 'quali' && c.lap >= 1)) {
      c.laps.push(t);
      if (!c.best || t < c.best) c.best = t;
      if (this.mode === 'race' && (!this.fastest || t < this.fastest.t)) {
        this.fastest = { t, id: c.id };
        if (c.isPlayer && this.laps > 1) this.say(`Volta mais rápida da corrida: ${fmtTime(t)}!`, 'good');
      }
    }
    c.lapStart = this.time;
  }
  update(dt, inp, A) {
    this.time += dt;
    const T = this.T;
    if (this.phase === 'red') { this.phaseT += dt; if (this.phaseT > 4) this.restartFromRed(); this.record(dt); return; }
    if (this.phase === 'grid') { this.phaseT += dt; if (this.phaseT > 1.2) { this.phase = 'lights'; this.phaseT = 0; } }
    else if (this.phase === 'lights') {
      this.phaseT += dt;
      const n = Math.min(5, Math.floor(this.phaseT / 0.9) + 1);
      if (n !== this.lightsN) { this.lightsN = n; if (this.onLight) this.onLight(n); }
      if (this.phaseT > 4.5 + (this.holdT ??= 0.4 + Math.random() * 1.6)) { this.phase = 'race'; this.lightsN = 0; this.startT = this.time; if (this.onLight) this.onLight(0); }
    }
    const racing = this.phase === 'race';
    // chuva e pista molhada
    if (this.mode === 'race') {
      const f = this.raceFrac(), w = this.weather, k = clamp((f - w.at) / 0.18, 0, 1);
      this.rain = lerp(w.start, w.end, k * k * (3 - 2 * k));
    }
    this.wet = clamp(this.wet + (this.rain > 0.15 ? this.rain * 0.02 : -0.0045) * dt, 0, 1);
    this.yellows = this.yellows.filter((y) => y.until > this.time);
    this.updateSC(dt);
    for (const c of this.cars) {
      if (c.isPlayer) this.updatePlayer(c, dt, inp, A, racing);
      else this.updateAI(c, dt, racing);
    }
    this.collisions();
    // classificação e fim
    if (this.mode === 'race' && !this.done) {
      const leader = this.standings()[0];
      if (this.me.finished && (this.cars.every((c) => c.finished || c.out) || this.time - this.me.finishT > 25)) this.done = true;
      void leader;
    }
    if (this.mode === 'quali' && this.me.laps.length >= 1 && !this.done) { this.done = true; }
    this.flags();
    this.record(dt);
  }
  record(dt) {
    const r = this.rep; r.acc += dt; if (r.acc < r.dt) return; r.acc -= r.dt;
    const f = new Float32Array(this.cars.length * 7 + 4);
    this.cars.forEach((c, k) => {
      const x = c.isPlayer ? c.phys.x : c.x, y = c.isPlayer ? c.phys.y : c.y, th = c.isPlayer ? c.phys.th : c.th, v = c.isPlayer ? c.phys.speed : c.v;
      f.set([x, y, th, v, c.s, this.progress(c), c.isPlayer ? c.phys.delta : 0], k * 7);
    });
    const n = this.cars.length * 7;
    f[n] = this.sc ? this.sc.s : -1; f[n + 1] = this.rain; f[n + 2] = this.wet; f[n + 3] = this.phase === 'lights' ? this.lightsN : 0;
    r.frames.push(f);
    if (r.frames.length > 40000) r.frames.splice(0, 1);
  }
  // safety car: anda à frente do líder; sai ao fim de duas voltas
  updateSC(dt) {
    const sc = this.sc; if (!sc) return;
    const T = this.T, i = Math.floor((((sc.s % T.len) + T.len) % T.len) / T.ds) % T.n;
    const leader = this.standings().find((c) => !c.out);
    const vt = Math.min(this.me.prof.v[i] * 0.55, 42);
    if (leader) { let g = sc.s - leader.s; if (g < -T.len / 2) g += T.len; if (g > T.len / 2) g -= T.len; sc.v = g > 60 ? vt * 0.85 : vt; }
    sc.s += sc.v * dt; if (sc.s >= T.len) sc.s -= T.len;
    const pt = trackPoint(T, sc.s, offAt(T, sc.s)), pt2 = trackPoint(T, sc.s + 2, offAt(T, sc.s + 2));
    sc.x = pt.x; sc.y = pt.y; sc.th = Math.atan2(pt2.y - pt.y, pt2.x - pt.x);
    if (leader && leader.lap - sc.startLap >= sc.laps && !sc.inLap) { sc.inLap = true; this.say('O safety car entra nas boxes nesta volta. Prepara o recomeço!', 'warn'); }
    if (sc.inLap && T.pit && this.relIdx(i) > T.pit.i0 && this.relIdx(i) < T.pit.i0 + 20) { this.sc = null; this.say('Bandeira verde! Corrida retomada.', 'good'); if (this.onFlag) this.onFlag('green'); }
    else if (sc.inLap && !T.pit && this.relIdx(i) > 0 && this.relIdx(i) < 20) { this.sc = null; this.say('Bandeira verde!', 'good'); }
  }
  // bandeiras para o jogador: amarela, azul; ultrapassagens proibidas
  flags() {
    const me = this.me, T = this.T; if (this.mode !== 'race') { this.flag = null; return; }
    const pos = this.standings().indexOf(me);
    let flag = null;
    for (const y of this.yellows) { let g = y.s - me.s; if (g < -T.len / 2) g += T.len; if (g > T.len / 2) g -= T.len; if (g > -60 && g < 220) flag = 'amarela'; }
    // azul: um carro com uma volta de avanço está mesmo atrás
    for (const o of this.cars) { if (o === me || o.out) continue; const d = this.progress(o) - this.progress(me); if (d > T.len - 70 && d < T.len + 5) flag = flag || 'azul'; }
    if (this.sc) flag = 'sc';
    if ((flag === 'amarela' || flag === 'sc') && me.prevPos != null && pos < me.prevPos && this.phase === 'race' && !me.pitState) {
      const passed = this.standings()[pos + 1];
      if (passed && !passed.out && !passed.pitState) { me.penalty += 5; this.say(`Ultrapassagem com ${flag === 'sc' ? 'safety car' : 'bandeira amarela'}! Penalização de 5 segundos.`, 'warn'); }
    }
    if (flag === 'azul' && this.flag !== 'azul') this.say('Bandeira azul: deixa passar o carro que te vai dar uma volta.', '');
    me.prevPos = pos; this.flag = flag;
  }
  crossLine(c, prevS, s) {
    const L = this.T.len;
    const a = ((prevS % L) + L) % L, b = ((s % L) + L) % L;
    if (a > L * 0.75 && b < L * 0.25) {
      c.lap++;
      this.lapDone(c);
      if (this.mode === 'race') {
        const leaderDone = this.cars.some((x) => x.finished);
        if (c.lap >= this.laps || (leaderDone && c.lap >= 1)) {
          if (!c.finished) { c.finished = true; c.finishT = this.time + c.penalty; this.finishOrder.push(c.id);
            if (c.isPlayer) this.say('Bandeira de xadrez! Corrida terminada.', 'good'); }
        } else if (c.isPlayer) {
          const left = this.laps - c.lap;
          if (left === 1) this.say('Última volta! Dá tudo.', 'warn');
          if (this.C.mandatory && c.used.size < 2 && left <= 2) this.say('Atenção: ainda tens de fazer a paragem obrigatória para mudar de pneus.', 'warn');
        }
      }
    } else if (a < L * 0.25 && b > L * 0.75) c.lap--;
    // cronometragem
    const cp = Math.floor((b / L) * NCP);
    if (cp !== c.lastCp) { c.lastCp = cp; c.cp[c.lap * NCP + cp] = this.time; }
  }
  updateAI(c, dt, racing) {
    const T = this.T;
    if (c.finished && this.mode === 'race') { c.v = Math.max(c.v - 4 * dt, Math.min(c.v, 25)); }
    if (c.out) { this.placeAI(c); return; }
    if (!racing && !c.finished) { this.placeAI(c); return; }
    if (this.time - (this.startT || 0) < c.react && c.lap < 0 && this.mode === 'race') { this.placeAI(c); return; }
    const i = Math.floor(((((c.s % T.len) + T.len) % T.len) / T.ds)) % T.n;
    // pneus
    c.wear += (dt * c.v) / (COMPOUNDS[c.tyre].life * this.laps * T.len) * (this.C.pits ? 1 : 0.35);
    let pace = c.pace * Math.sqrt(this.tyreGrip(c) / COMPOUNDS.M.grip);
    pace *= 1 - 0.08 * c.dmg;
    if (c.mistakeT > 0) { c.mistakeT -= dt; pace *= c.spinning ? 0.05 : 0.9; if (c.mistakeT <= 0) c.spinning = false; }
    else if (this.mode === 'race' && this.phase === 'race' && c.lap >= 0) {
      const risk = dt * 0.004 * (1.02 - c.d.skill) * 10 * (1 + (this.wet || 0) * 3);
      const r = Math.random();
      if (r < risk * 0.04) this.incident(c, 'crash');
      else if (r < risk * 0.25) { c.mistakeT = 3; c.spinning = true; this.incident(c, 'spin'); }
      else if (r < risk) c.mistakeT = 1.5 + Math.random() * 2;
    }
    if (c.out) { this.placeAI(c); return; }
    if (c.yieldT > 0) { c.yieldT -= dt; pace *= 0.93; c.dTarget = clamp(c.dTarget + (c.dl >= 0 ? 1 : -1) * dt * 2, -T.W / 2, T.W / 2); }
    if (c.boostT > 0) { c.boostT -= dt; pace *= 1.03; }
    const ahead = Math.round((c.v * 0.25) / T.ds);
    let target = c.prof.v[(i + ahead) % T.n] * pace;
    // boxes
    const pit = T.pit;
    if (pit && this.mode === 'race' && c.pitState === 0) {
      const rel = this.relIdx(i);
      if (rel > pit.i0 - 30 && rel < pit.i0 && c.lastPitCheck !== c.lap) {
        c.lastPitCheck = c.lap;
        const w = this.wet || 0, isWet = COMPOUNDS[c.tyre].wet;
        // trocar para pneus de chuva ou de seco quando a pista muda
        if (!isWet && w > 0.42) { c.pitState = 1; c.nextTyre = w > 0.7 ? 'W' : 'I'; }
        else if (isWet && w < 0.22 && this.laps - c.lap > 1) { c.pitState = 1; c.nextTyre = this.laps - c.lap > this.laps * 0.5 ? 'M' : 'S'; }
        else if (c.pitLap === c.lap) c.pitState = 1;
        else if (c.dmg > 0.5) c.pitState = 1;
      }
    }
    if (c.pitState) target = this.pitLogic(c, i, dt, target);
    // safety car: ninguém passa e o líder segue o carro de segurança
    if (this.sc && !c.pitState) {
      let g = this.sc.s - c.s; if (g < -T.len / 2) g += T.len; if (g > T.len / 2) g -= T.len;
      if (g > 0 && g < 120) target = Math.min(target, this.sc.v + (g - 25) * 0.5);
      target = Math.min(target, this.me.prof.v[i] * 0.6);
    }
    // tráfego: seguir ou ultrapassar
    let near = null, ng = 1e9;
    for (const o of this.cars) {
      if (o === c) continue;
      let g = this.progress(o) - this.progress(c);
      if (g < -T.len / 2) g += T.len; else if (g > T.len / 2) g -= T.len;
      if (g > 0 && g < 30 && g < ng) { const ol = o.isPlayer ? o.lat - offAt(T, o.s) : o.dl; if (Math.abs(ol - c.dl) < this.C.carW * 1.6 + 0.6) { ng = g; near = { o, ol, g }; } }
    }
    if (near && !c.pitState) {
      const ov = near.o.isPlayer ? near.o.phys.speed : near.o.v;
      const len = this.C.carLen * 1.25;
      if (target > ov + 0.3 && near.g < 22 && !this.sc && !(this.yellows.length && this.inYellow(c))) {
        const half = T.W / 2 - this.C.carW * 0.6, off = offAt(T, c.s);
        const left = -half - off, right = half - off;
        const want = near.ol >= 0 ? near.ol - this.C.carW * 1.5 : near.ol + this.C.carW * 1.5;
        c.dTarget = clamp(want, left, right);
      }
      if (near.g < len * 1.6) target = Math.min(target, ov + (near.g - len) * 0.8);
    } else c.dTarget *= 1 - Math.min(1, dt * 0.35);
    c.dl += clamp(c.dTarget - c.dl, -1.6 * dt, 1.6 * dt);
    // acelerar / travar com os limites do carro
    if (!racing && c.finished) target = 20;
    const dv = target - c.v;
    c.v += clamp(dv, -c.brake(c.v) * dt, Math.max(0, c.accel(c.v)) * dt);
    c.v -= 9.81 * gradeAt(T, i) * dt * 0.5;
    if (c.v < 0) c.v = 0;
    const prev = c.s;
    c.s += c.v * dt;
    if (c.s >= T.len) c.s -= T.len;
    this.crossLine(c, prev, c.s);
    this.placeAI(c);
  }
  inYellow(c) { const T = this.T; return this.yellows.some((y) => { let g = y.s - c.s; if (g < -T.len / 2) g += T.len; if (g > T.len / 2) g -= T.len; return g > -60 && g < 220; }); }
  // ordens de equipa
  teammate() { return this.cars.find((c) => !c.isPlayer && this.me.d.team != null && c.d.team === this.me.d.team); }
  askTeammate() {
    const tm = this.teammate(); if (!tm) return 'Não tens colega de equipa nesta categoria.';
    const st = this.standings(), ti = st.indexOf(tm), mi = st.indexOf(this.me);
    if (ti > mi) return `O ${tm.d.last} está atrás de ti.`;
    if (this.gap(this.me, tm) > 1.6) return `Estás longe do ${tm.d.last} (${this.gap(this.me, tm).toFixed(1)} s). Aproxima-te primeiro.`;
    if (Math.random() < 0.7) { tm.yieldT = 9; return `Entendido. O ${tm.d.last} vai deixar-te passar.`; }
    return `A equipa diz que não: o ${tm.d.last} também está a lutar por pontos.`;
  }
  letTeammatePass() { const tm = this.teammate(); if (tm) { tm.boostT = 12; this.me.letPass = true; } }
  placeAI(c) {
    const T = this.T;
    let lat = offAt(this.T, c.s) + c.dl;
    if (c.out) lat = clamp(lat, -(T.W / 2 + T.runoff - 1.5), T.W / 2 + T.runoff - 1.5);
    if (c.pitState && T.pit) lat = c.pitLat ?? lat;
    const pt = trackPoint(T, c.s, lat);
    const pt2 = trackPoint(T, c.s + 2, lat + (c.dTarget - c.dl) * 0.15);
    c.x = pt.x; c.y = pt.y; c.th = Math.atan2(pt2.y - pt.y, pt2.x - pt.x); c.lat = lat;
  }
  relIdx(i) { return i > this.T.n / 2 ? i - this.T.n : i; }
  // entrada nas boxes, paragem e saída (rivais e jogador)
  pitLogic(c, i, dt, target) {
    const T = this.T, pit = T.pit, rel = this.relIdx(i);
    const laneLat = pit.side * pit.off;
    const baseLat = offAt(T, c.s) + (c.dl || 0);
    if (c.pitState === 1) { // a entrar
      const k = clamp((rel - (pit.i0 - 30)) / 30, 0, 1);
      c.pitLat = lerp(baseLat, laneLat, k * k * (3 - 2 * k));
      if (rel >= pit.i0) c.pitState = 2;
      return Math.min(target, Math.max(pit.speed, target * (1 - k * 0.6)));
    }
    if (c.pitState === 2) { // limitador até à garagem
      c.pitLat = laneLat;
      if (rel >= pit.boxI + (c.gridK % 10) * 3 - 20 && !c.stopped) { c.pitState = 3; c.pitT = (c.isPlayer ? 2.6 : 2.3 + Math.random() * 0.9) + (c.dmg > 0.05 ? 4 + c.dmg * 6 : 0); c.stopped = true; }
      return pit.speed;
    }
    if (c.pitState === 3) { // parado a mudar pneus
      c.pitLat = laneLat; c.v = 0; c.pitT -= dt;
      if (c.pitT <= 0) {
        c.pits++;
        const nt = c.nextTyre || (c.tyre === 'S' ? 'M' : c.tyre === 'M' ? 'H' : 'M');
        c.tyre = nt; c.wear = 0; c.used.add(nt); c.pitState = 4; c.nextTyre = null;
        if (c.dmg > 0.05 || c.susp > 0.05) { if (c.isPlayer) this.say('Asa da frente nova e suspensão afinada.', 'good'); c.dmg = 0; c.susp = 0; }
        if (c.isPlayer) this.say(`Pneus ${COMPOUNDS[nt].n.toLowerCase()} montados. Vai, vai, vai!`, 'good');
      }
      return 0;
    }
    if (c.pitState === 4) { // limitador até à saída
      c.pitLat = laneLat;
      if (rel >= pit.i1) c.pitState = 5;
      return pit.speed;
    }
    if (c.pitState === 5) { // a voltar à pista
      const k = clamp((rel - pit.i1) / 30, 0, 1);
      c.pitLat = lerp(laneLat, baseLat, k * k * (3 - 2 * k));
      if (k >= 1 || rel < pit.i1 - 5) { c.pitState = 0; c.pitLat = null; c.stopped = false; }
      return target;
    }
    return target;
  }
  updatePlayer(c, dt, inp, A, racing) {
    const T = this.T, car = c.phys;
    // queimar a partida
    if (!racing && this.mode === 'race') {
      if (this.phase === 'lights' && inp.throttle > 0.1 && car.speed > 1.2 && !c.jump) { c.jump = true; c.penalty += 5; this.say('Partida antecipada! Penalização de 5 segundos.', 'warn'); }
      if (!c.jump) { car.VX *= 0.5; car.VY *= 0.5; }
      if (this.phase === 'grid') inp = { steer: 0, throttle: 0, brake: 1 };
    }
    // nas boxes, o carro anda sozinho
    if (c.pitState) {
      const pr = project(T, car.x, car.y, c.hint);
      c.s = T.s[pr.i]; c.hint = pr.i;
      const tgt = this.pitLogic(c, pr.i, dt, 30);
      c.v = c.pitState === 3 ? 0 : c.v + clamp(tgt - c.v, -12 * dt, 6 * dt);
      const prevS = c.sAlong ?? c.s;
      c.sAlong = (c.sAlong ?? c.s) + c.v * dt;
      const pt = trackPoint(T, c.sAlong, c.pitLat ?? c.lat);
      const pt2 = trackPoint(T, c.sAlong + 2, c.pitLat ?? c.lat);
      car.x = pt.x; car.y = pt.y; car.th = Math.atan2(pt2.y - pt.y, pt2.x - pt.x); car.setVel(c.v); car.w = 0;
      this.crossLine(c, prevS, c.sAlong);
      if (c.pitState === 0) { c.sAlong = null; car.setVel(Math.max(c.v, T.pit.speed)); }
      car.tireGrip = this.tyreGrip(c);
      c.lat = c.pitLat ?? c.lat;
      return;
    }
    const pr = project(T, car.x, car.y, c.hint);
    c.hint = pr.i;
    const alat = Math.abs(pr.lat), half = T.W / 2;
    let surf;
    const sideOut = pr.lat > 0 ? 1 : -1;
    const inPit = T.pit && this.relIdx(pr.i) > T.pit.i0 - 30 && this.relIdx(pr.i) < T.pit.i1 + 30 && sideOut === T.pit.side && alat < T.pit.off + 5;
    if (alat <= half || inPit) surf = { mu: 1, roll: 0, kind: 'asfalto' };
    else if (alat <= half + 1.1 && T.kerb[pr.i]) surf = { mu: 0.94, roll: 0.01, kind: 'corretor' };
    else if (T.gravel[pr.i] === sideOut) surf = { mu: 0.42, roll: 0.3, kind: 'gravilha' };
    else surf = { mu: 0.58, roll: 0.05, kind: 'relva' };
    c.surf = surf.kind;
    surf.grade = gradeAt(T, pr.i) * (Math.cos(car.th) * T.tx[pr.i] + Math.sin(car.th) * T.ty[pr.i]);
    car.tireGrip = this.tyreGrip(c);
    car.powerMode = c.mode === 2 ? 1.025 : c.mode === 0 ? 0.975 : 1;
    car.aeroMul = 1 - 0.45 * c.dmg; car.frontMul = 1 - 0.2 * c.dmg - 0.08 * c.susp; car.pull = c.susp * (c.pullDir || 1) * 0.07;
    if (this.sc && this.mode === 'race') { /* com safety car o jogador tem de abrandar */ }
    if (c.finished) inp = autopilot(car, T, c.prof, c.hint, 0.55);
    // vários passos pequenos para a física ficar estável
    const N = 4, h = dt / N;
    for (let k = 0; k < N; k++) car.step(h, inp, A, surf);
    // barreiras
    const lim = half + T.runoff;
    const pr2 = project(T, car.x, car.y, c.hint);
    if (Math.abs(pr2.lat) > lim && !inPit) {
      const sg = pr2.lat > 0 ? 1 : -1, i2 = pr2.i;
      car.x -= T.nx[i2] * (Math.abs(pr2.lat) - lim + 0.05) * sg; car.y -= T.ny[i2] * (Math.abs(pr2.lat) - lim + 0.05) * sg;
      const vn = car.VX * T.nx[i2] * sg + car.VY * T.ny[i2] * sg;
      if (vn > 0) {
        car.VX -= T.nx[i2] * sg * vn * 1.4; car.VY -= T.ny[i2] * sg * vn * 1.4;
        car.VX *= 0.75; car.VY *= 0.75; car.w *= 0.4;
        if (vn > 4) { this.say(vn > 15 ? 'Batida forte na barreira!' : 'Toque na barreira.', 'warn'); if (this.onHit) this.onHit(vn); }
        if (vn > 7) {
          const before = c.dmg; c.dmg = clamp(c.dmg + (vn - 7) / 25, 0, 1); c.susp = clamp(c.susp + (vn - 9) / 40, 0, 1); c.pullDir = c.pullDir || (Math.random() < 0.5 ? -1 : 1);
          if (c.dmg > 0.15 && before <= 0.15) this.say(`Danos na asa da frente (${Math.round(c.dmg * 100)}%). Perdes aderência à frente${this.C.pits ? ': podemos trocar a asa nas boxes' : ''}.`, 'warn');
          this.incident(c, 'spin');
          if (vn > 26 && this.mode === 'race' && this.wet > 0.4) this.redFlag();
          else if (vn > 20 && this.mode === 'race' && !this.sc && !this.T.kart) this.deploySC();
        }
        for (let q = 0; q < 10; q++) this.parts.push({ x: car.x, y: car.y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 0.5, t: 0, kind: 'spark' });
      }
    }
    const pr3 = project(T, car.x, car.y, c.hint);
    const prevS = c.s;
    c.s = pr3.s; c.lat = pr3.lat; c.hint = pr3.i;
    if (racing || this.mode === 'quali') this.crossLine(c, prevS, c.s);
    // desgaste dos pneus (derrapar gasta mais)
    const modeF = c.mode === 2 ? 1.3 : c.mode === 0 ? 0.72 : 1;
    c.wear += ((dt * car.speed) / (COMPOUNDS[c.tyre].life * this.laps * T.len)) * modeF * (1 + car.slide * 1.2) * (this.C.pits ? 1 : 0.35);
    c.v = car.speed;
    // pedido de box: entra na faixa das boxes
    if (this.boxReq && T.pit && this.mode === 'race') {
      const rel = this.relIdx(pr3.i);
      if (rel > T.pit.i0 - 30 && rel < T.pit.i0 - 2 && !c.finished) {
        c.pitState = 1; c.nextTyre = this.boxReq; this.boxReq = null; c.sAlong = c.s; c.v = car.speed; c.lat = pr3.lat;
        this.say('Limitador ligado. Entra na garagem.', '');
      }
    }
    // efeitos: marcas e fumo
    if (car.slide > 0.25 && car.speed > 5) {
      const cs = Math.cos(car.th), sn = Math.sin(car.th), back = car.p.b * 0.9, wd = car.p.wid * 0.42;
      for (const sd of [-1, 1]) this.skids.push([car.x - cs * back - sn * wd * sd, car.y - sn * back + cs * wd * sd, this.time, Math.min(1, car.slide)]);
      if (this.skids.length > 2400) this.skids.splice(0, 200);
      if (Math.random() < car.slide * 0.8) this.parts.push({ x: car.x - cs * back, y: car.y - sn * back, vx: -car.VX * 0.1 + (Math.random() - 0.5) * 2, vy: -car.VY * 0.1 + (Math.random() - 0.5) * 2, life: 1.2, t: 0, kind: 'smoke' });
    }
    if ((surf.kind === 'gravilha' || surf.kind === 'relva') && car.speed > 6 && Math.random() < 0.6) this.parts.push({ x: car.x, y: car.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 0.9, t: 0, kind: surf.kind === 'gravilha' ? 'dust' : 'grass' });
  }
  collisions() {
    const me = this.me, car = me.phys, R = this.C.carW * 0.55, Lh = this.C.carLen * 0.32;
    if (me.pitState) return;
    const circ = (x, y, th) => [[x + Math.cos(th) * Lh, y + Math.sin(th) * Lh], [x - Math.cos(th) * Lh, y - Math.sin(th) * Lh]];
    const mc = circ(car.x, car.y, car.th);
    for (const o of this.cars) {
      if (o.isPlayer || o.pitState) continue;
      if ((o.x - car.x) ** 2 + (o.y - car.y) ** 2 > (this.C.carLen * 1.5) ** 2) continue;
      { let gs = Math.abs(o.s - me.s) % this.T.len; gs = Math.min(gs, this.T.len - gs); if (gs > 40) continue; } // ponte: outra passagem
      const oc = circ(o.x, o.y, o.th);
      for (const a of mc) for (const b of oc) {
        const dx = a[0] - b[0], dy = a[1] - b[1], dd = Math.hypot(dx, dy);
        if (dd > 0 && dd < R * 2) {
          const push = (R * 2 - dd) / 2, ux = dx / dd, uy = dy / dd;
          car.x += ux * push; car.y += uy * push;
          // troca de velocidade ao longo da linha de contacto
          const ovx = Math.cos(o.th) * o.v, ovy = Math.sin(o.th) * o.v;
          const rel = (car.VX - ovx) * ux + (car.VY - ovy) * uy;
          if (rel < 0) {
            car.VX -= ux * rel * 0.6; car.VY -= uy * rel * 0.6;
            o.v = Math.max(0, o.v + rel * 0.25);
            o.dTarget += -Math.sign((ux * Math.cos(o.th + Math.PI / 2) + uy * Math.sin(o.th + Math.PI / 2)) || 1) * 0.6;
            if (-rel > 3 && this.onHit) this.onHit(-rel * 0.6);
            if (-rel > 5) { me.dmg = clamp(me.dmg + (-rel - 5) / 30, 0, 1); o.dmg = clamp(o.dmg + (-rel - 5) / 25, 0, 1); if (me.dmg > 0.15) this.say(`Toque com ${o.d.last}! A asa da frente ficou danificada.`, 'warn'); }
            if (-rel > 2) for (let q = 0; q < 6; q++) this.parts.push({ x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7, life: 0.4, t: 0, kind: 'spark' });
          }
        }
      }
    }
  }
  // diferença em segundos entre dois carros (pela cronometragem)
  gap(behind, ahead) {
    const keys = Object.keys(behind.cp).map(Number).sort((a, b) => b - a);
    for (const k of keys.slice(0, 3)) if (ahead.cp[k] !== undefined) return behind.cp[k] - ahead.cp[k];
    const dp = this.progress(ahead) - this.progress(behind);
    return dp / Math.max(10, behind.v || 30);
  }
  results() {
    const st = this.standings();
    const leader = st[0];
    return st.map((c, k) => {
      let time = null, gapTxt = '';
      if (c.finished) { time = c.finishT - (this.startT || 0); gapTxt = k === 0 ? fmtTime(time) : '+' + (c.finishT - leader.finishT).toFixed(3); }
      else { const lapsDown = Math.floor((this.progress(leader) - this.progress(c)) / this.T.len); gapTxt = lapsDown >= 1 ? `+${lapsDown} volta${lapsDown > 1 ? 's' : ''}` : '+' + Math.max(0, this.gap(c, leader)).toFixed(1); }
      let pen = c.penalty;
      if (this.C.mandatory && c.used.size < 2 && ![...c.used].some((t) => COMPOUNDS[t].wet)) { pen += 20; }
      return { id: c.id, d: c.d, pos: k + 1, time, gapTxt: c.out ? 'Desistiu' : gapTxt, best: c.best, pits: c.pits, penalty: pen, isPlayer: c.isPlayer, out: c.out, dmg: c.dmg };
    }).sort((a, b) => {
      // penalizações mudam a ordem
      const ta = a.out ? 2e9 + a.pos : a.time != null ? a.time + a.penalty : 1e9 + a.pos, tb = b.out ? 2e9 + b.pos : b.time != null ? b.time + b.penalty : 1e9 + b.pos;
      return ta - tb;
    }).map((r, k) => ({ ...r, pos: k + 1, pts: r.out ? 0 : POINTS[k] || 0 }));
  }
}
function fmtTime(t) {
  if (t == null || !isFinite(t)) return '—';
  const m = Math.floor(t / 60), s = t - m * 60;
  return (m ? m + ':' + (s < 10 ? '0' : '') : '') + s.toFixed(3);
}
