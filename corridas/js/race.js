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
    if (this.mode === 'quali') { this.phase = 'race'; for (const c of this.cars) c.lap = -1; this.me.lap = -1; }
    this.boxReq = null; this.radio = [];
    this.skids = []; this.parts = [];
    this.lapLen = T.len;
  }
  say(text, kind = '') { this.msgs.push({ text, kind, t: this.time }); if (this.onMsg) this.onMsg(text, kind); }
  progress(c) { return c.lap * this.T.len + (((c.s % this.T.len) + this.T.len) % this.T.len); }
  // posição na corrida (1 = primeiro)
  standings() {
    return this.cars.slice().sort((a, b) => {
      if (a.finished && b.finished) return a.finishT - b.finishT;
      if (a.finished) return -1; if (b.finished) return 1;
      return this.progress(b) - this.progress(a);
    });
  }
  tyreGrip(c) {
    const comp = COMPOUNDS[c.tyre], w = c.wear;
    const k = w < 0.7 ? 1 - 0.07 * (w / 0.7) : 0.93 - 0.55 * (w - 0.7);
    return comp.grip * Math.max(0.74, k);
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
    if (this.phase === 'grid') { this.phaseT += dt; if (this.phaseT > 1.2) { this.phase = 'lights'; this.phaseT = 0; } }
    else if (this.phase === 'lights') {
      this.phaseT += dt;
      const n = Math.min(5, Math.floor(this.phaseT / 0.9) + 1);
      if (n !== this.lightsN) { this.lightsN = n; if (this.onLight) this.onLight(n); }
      if (this.phaseT > 4.5 + (this.holdT ??= 0.4 + Math.random() * 1.6)) { this.phase = 'race'; this.lightsN = 0; this.startT = this.time; if (this.onLight) this.onLight(0); }
    }
    const racing = this.phase === 'race';
    for (const c of this.cars) {
      if (c.isPlayer) this.updatePlayer(c, dt, inp, A, racing);
      else this.updateAI(c, dt, racing);
    }
    this.collisions();
    // classificação e fim
    if (this.mode === 'race' && !this.done) {
      const leader = this.standings()[0];
      if (this.me.finished && (this.cars.every((c) => c.finished) || this.time - this.me.finishT > 25)) this.done = true;
      void leader;
    }
    if (this.mode === 'quali' && this.me.laps.length >= 1 && !this.done) { this.done = true; }
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
    if (!racing && !c.finished) { this.placeAI(c); return; }
    if (this.time - (this.startT || 0) < c.react && c.lap < 0 && this.mode === 'race') { this.placeAI(c); return; }
    const i = Math.floor(((((c.s % T.len) + T.len) % T.len) / T.ds)) % T.n;
    // pneus
    c.wear += (dt * c.v) / (COMPOUNDS[c.tyre].life * this.laps * T.len) * (this.C.pits ? 1 : 0.35);
    let pace = c.pace * Math.sqrt(this.tyreGrip(c) / COMPOUNDS.M.grip);
    if (c.mistakeT > 0) { c.mistakeT -= dt; pace *= 0.9; }
    else if (Math.random() < dt * 0.004 * (1.02 - c.d.skill) * 10) c.mistakeT = 1.5 + Math.random() * 2;
    const ahead = Math.round((c.v * 0.25) / T.ds);
    let target = c.prof.v[(i + ahead) % T.n] * pace;
    // boxes
    const pit = T.pit;
    if (pit && this.mode === 'race' && c.pitLap === c.lap && c.pitState === 0) {
      const rel = this.relIdx(i);
      if (rel > pit.i0 - 30 && rel < pit.i0) c.pitState = 1;
    }
    if (c.pitState) target = this.pitLogic(c, i, dt, target);
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
      if (target > ov + 0.3 && near.g < 22) {
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
    if (c.v < 0) c.v = 0;
    const prev = c.s;
    c.s += c.v * dt;
    if (c.s >= T.len) c.s -= T.len;
    this.crossLine(c, prev, c.s);
    this.placeAI(c);
  }
  placeAI(c) {
    const T = this.T;
    let lat = offAt(this.T, c.s) + c.dl;
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
      if (rel >= pit.boxI + (c.gridK % 10) * 3 - 20 && !c.stopped) { c.pitState = 3; c.pitT = (c.isPlayer ? 2.6 : 2.3 + Math.random() * 0.9); c.stopped = true; }
      return pit.speed;
    }
    if (c.pitState === 3) { // parado a mudar pneus
      c.pitLat = laneLat; c.v = 0; c.pitT -= dt;
      if (c.pitT <= 0) {
        c.pits++;
        const nt = c.nextTyre || (c.tyre === 'S' ? 'M' : c.tyre === 'M' ? 'H' : 'M');
        c.tyre = nt; c.wear = 0; c.used.add(nt); c.pitState = 4; c.nextTyre = null;
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
    car.tireGrip = this.tyreGrip(c);
    car.powerMode = c.mode === 2 ? 1.025 : c.mode === 0 ? 0.975 : 1;
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
      if (this.C.mandatory && c.used.size < 2) { pen += 20; }
      return { id: c.id, d: c.d, pos: k + 1, time, gapTxt, best: c.best, pits: c.pits, penalty: pen, isPlayer: c.isPlayer };
    }).sort((a, b) => {
      // penalizações mudam a ordem
      const ta = a.time != null ? a.time + a.penalty : 1e9 + a.pos, tb = b.time != null ? b.time + b.penalty : 1e9 + b.pos;
      return ta - tb;
    }).map((r, k) => ({ ...r, pos: k + 1, pts: POINTS[k] || 0 }));
  }
}
function fmtTime(t) {
  if (t == null || !isFinite(t)) return '—';
  const m = Math.floor(t / 60), s = t - m * 60;
  return (m ? m + ':' + (s < 10 ? '0' : '') : '') + s.toFixed(3);
}
