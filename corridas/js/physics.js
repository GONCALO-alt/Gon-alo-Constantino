/* Física do carro: modelo de "bicicleta" com pneus que saturam, transferência de peso, carga aerodinâmica, ABS e controlo de tração. */
'use strict';

// parâmetros de um carro (categoria + melhorias)
function carParams(catId, mods = {}) {
  const C = catById(catId);
  const power = mods.power || 1, grip = mods.grip || 1, brake = mods.brake || 1, aero = mods.aero || 1;
  const P = C.P * power, vtop = C.vtop * Math.cbrt(power);
  const p = {
    cat: catId, P, m: C.m, mu: C.mu * grip, cl: C.cl * aero, cd: C.P / (C.vtop ** 3), vtop: vtop * 1.02,
    L: C.L, a: C.a, b: C.L - C.a, h: C.h, lock: C.lock, acc0: C.acc0 * Math.sqrt(power), brk: 0.92 * brake,
    B: catId === 'kart' ? 14.5 : 17.5, gears: C.gears, rpm: C.rpm, len: C.carLen, wid: C.carW,
  };
  p.Iz = p.m * p.a * p.b * (catId === 'kart' ? 0.9 : 1.15);
  p.key = [catId, power, grip, brake, aero].map((v) => (typeof v === 'number' ? v.toFixed(4) : v)).join(':');
  return p;
}

class Car {
  constructor(p) {
    this.p = p;
    this.x = 0; this.y = 0; this.th = 0; this.VX = 0; this.VY = 0; this.w = 0; this.delta = 0; this.axPrev = 0;
    this.slide = 0; this.lockF = false; this.lockR = false; this.spin = false; this.tireGrip = 1; this.powerMode = 1;
    this.gear = 1; this.rpm = p.rpm[0];
  }
  get speed() { return Math.hypot(this.VX, this.VY); }
  place(x, y, th) { this.x = x; this.y = y; this.th = th; this.VX = this.VY = this.w = 0; this.delta = 0; }
  setVel(v) { this.VX = Math.cos(this.th) * v; this.VY = Math.sin(this.th) * v; this.w = 0; }
  maxSteer(v, surfMu) {
    const p = this.p;
    if (!this.assist) return p.lock;
    const muE = p.mu * this.tireGrip * surfMu;
    const kmax = (muE * (9.81 + (p.cl * v * v) / p.m)) / Math.max(4, v * v);
    return Math.min(p.lock, p.L * kmax * 1.05 + (1.6 / p.B) * 1.25);
  }
  step(dt, inp, A, surf) {
    const p = this.p, g = 9.81;
    const cs = Math.cos(this.th), sn = Math.sin(this.th);
    let vx = this.VX * cs + this.VY * sn, vy = -this.VX * sn + this.VY * cs;
    const v = Math.hypot(vx, vy);
    // direção com velocidade limitada do volante
    this.assist = A.steer;
    const target = inp.steer * this.maxSteer(v, surf.mu);
    const rate = p.cat === 'kart' ? 3.2 : 2.6;
    this.delta += clamp(target - this.delta, -rate * dt, rate * dt);
    const d = this.delta, cd = Math.cos(d), sd = Math.sin(d);
    // cargas nos eixos
    const down = p.cl * v * v;
    const dN = (p.m * this.axPrev * p.h * 0.7) / p.L;
    const Nf = Math.max(60, p.m * g * (p.b / p.L) + down * 0.45 - dN);
    const Nr = Math.max(60, p.m * g * (p.a / p.L) + down * 0.55 + dN);
    const muE = p.mu * surf.mu * this.tireGrip;
    // forças pedidas pelo piloto
    const dir = vx >= 0 ? 1 : -1;
    let Fdrive = inp.throttle * Math.min((p.P * this.powerMode) / Math.max(Math.abs(vx), 6), p.m * p.acc0);
    const Fb = inp.brake * muE * (Nf + Nr) * p.brk * 1.1;
    let Fxf = -Fb * 0.6 * dir, Fxr = Fdrive - Fb * 0.4 * dir;
    // ângulos de deriva
    const ux = Math.max(Math.abs(vx), 1.5);
    const af = Math.atan2(vy + p.a * this.w, ux) - d * dir;
    const ar = Math.atan2(vy - p.b * this.w, ux);
    const curve = (al) => Math.sin(1.55 * Math.atan(p.B * al));
    // carro afinado para ser estável: um pouco mais de aderência atrás do que à frente
    const muF = muE * 0.97, muR = muE * 1.05;
    let Fyf = -muF * Nf * curve(af), Fyr = -muR * Nr * curve(ar);
    // círculo de aderência: travar a fundo ou acelerar demais tira aderência lateral
    this.lockF = this.lockR = this.spin = false;
    const capF = muF * Nf, capR = muR * Nr;
    let avail = Math.sqrt(Math.max(0, capF * capF - Fyf * Fyf));
    if (Math.abs(Fxf) > avail) {
      if (A.abs) Fxf = Math.sign(Fxf) * avail * 0.98;
      else { this.lockF = v > 3; Fxf = Math.sign(Fxf) * Math.max(avail, capF * 0.78); Fyf *= 0.3; }
    }
    avail = Math.sqrt(Math.max(0, capR * capR - Fyr * Fyr));
    if (Math.abs(Fxr) > avail) {
      if (Fxr > 0) {
        if (A.tc) Fxr = avail * 0.97;
        else { this.spin = v > 2; Fxr = Math.min(Fxr, Math.max(avail, capR * 0.8)); Fyr *= 0.5; }
      } else if (A.abs) Fxr = -avail * 0.98;
      else { this.lockR = v > 3; Fxr = -Math.max(avail, capR * 0.78); Fyr *= 0.3; }
    }
    const resist = p.cd * vx * Math.abs(vx) + surf.roll * p.m * g * Math.tanh(vx * 2) + 0.012 * p.m * g * Math.tanh(vx);
    const Fx = Fxr + Fxf * cd - Fyf * sd - resist;
    const Fy = Fyr + Fyf * cd + Fxf * sd;
    const torque = p.a * (Fyf * cd + Fxf * sd) - p.b * Fyr;
    const ax = Fx / p.m, ay = Fy / p.m;
    const ovx = vx;
    vx += (ax + vy * this.w) * dt;
    vy += (ay - vx * this.w) * dt;
    this.w += (torque / p.Iz) * dt;
    // a travar não anda para trás
    if (inp.brake > 0.05 && inp.throttle < 0.05 && ovx > 0 && vx < 0) vx = 0;
    // muito devagar: comportamento cinemático (sem derrapar)
    if (v < 3) {
      const k = clamp((3 - v) / 3, 0, 1);
      this.w = lerp(this.w, (vx * Math.tan(d)) / p.L, k);
      vy *= 1 - k * Math.min(1, 10 * dt);
    }
    this.axPrev = lerp(this.axPrev, ax, Math.min(1, dt * 20));
    this.th += this.w * dt;
    const c2 = Math.cos(this.th), s2 = Math.sin(this.th);
    this.VX = vx * c2 - vy * s2; this.VY = vx * s2 + vy * c2;
    this.x += this.VX * dt; this.y += this.VY * dt;
    // derrapagem (para fumo, marcas e chiar dos pneus)
    const peak = 1.6 / p.B;
    this.slide = clamp(Math.max(Math.abs(ar), Math.abs(af)) / peak - 0.85, 0, 1.5) + (this.lockF || this.lockR ? 0.8 : 0) + (this.spin ? 0.6 : 0);
    this.latG = Math.abs(ay) / g; this.longG = ax / g;
    // caixa automática (para o som e o painel)
    const vv = Math.max(0, vx), top = p.vtop;
    if (p.gears === 1) { this.gear = 1; this.rpm = lerp(p.rpm[0], p.rpm[1], clamp(vv / top, 0, 1)); }
    else {
      const ratio = (gi) => top * (0.32 + 0.68 * (gi / p.gears)) ** 1.25;
      const r = (gi) => p.rpm[0] + (p.rpm[1] - p.rpm[0]) * clamp(vv / ratio(gi), 0, 1.02);
      if (r(this.gear) > p.rpm[1] * 0.985 && this.gear < p.gears) this.gear++;
      else if (this.gear > 1 && r(this.gear - 1) < p.rpm[1] * 0.82) this.gear--;
      this.rpm = r(this.gear);
    }
  }
}

// piloto automático (usado nos testes e na volta de demonstração)
function autopilot(car, T, prof, hint, aggression = 1) {
  const pr = project(T, car.x, car.y, hint);
  const v = car.speed;
  const look = 5 + v * 0.42;
  const j = (pr.i + Math.round(look / T.ds)) % T.n;
  const tx = T.rx[j], ty = T.ry[j];
  const ang = Math.atan2(ty - car.y, tx - car.x) - car.th;
  const a = Math.atan2(Math.sin(ang), Math.cos(ang));
  const ld = Math.hypot(tx - car.x, ty - car.y);
  const delta = Math.atan((2 * car.p.L * Math.sin(a)) / Math.max(1, ld));
  const steer = clamp(delta / car.maxSteer(v, 1), -1, 1);
  const k2 = (pr.i + Math.round((2 + v * 0.3) / T.ds)) % T.n;
  const target = prof.v[k2] * aggression;
  let throttle = 0, brake = 0;
  if (v < target - 0.5) throttle = clamp((target - v) / 3, 0.2, 1);
  else if (v > target + 0.8) brake = clamp((v - target) / 4, 0.1, 1);
  return { steer, throttle, brake, i: pr.i };
}
