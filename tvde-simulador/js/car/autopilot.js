// Condução automática do carro do jogador: segue a rota, respeita semáforos e o trânsito.
import * as THREE from 'three';
import { CFG } from '../config.js';
import { buildPath } from '../world/roads.js';
import { clamp } from '../util.js';

export class Autopilot {
  constructor(net) {
    this.net = net; this.traffic = null;
    this.edge = 0; this.s = 10; this.off = CFG.CURB;
    this.path = null; this.d = 0; this.v = 0; this.prevV = 0; this.accel = 0;
    this.pos = new THREE.Vector3(); this.heading = 0; this.yawRate = 0;
    this.hold = false; this.speedFactor = 1; this.onArrive = null; this.pending = null;
    this.inTurn = false; this.curPiece = null; this.redAhead = false; this.distDriven = 0;
    this._a = new THREE.Vector3(); this._b = new THREE.Vector3();
  }
  place(edgeId, s, off = CFG.CURB) {
    this.edge = edgeId; this.s = s; this.off = off; this.path = null; this.v = 0; this.inTurn = false; this.pending = null;
    this._pose(true);
  }
  get moving() { return !!this.path; }
  get remaining() { return this.path ? this.path.length - this.d : 0; }
  routeLength(goalEdge, goalS, blocked = null) {
    if (goalEdge === this.edge && goalS > this.s + 12) return goalS - this.s;
    const ids = this.net.findRoute(this.edge, goalEdge, blocked);
    if (!ids) return Infinity;
    let L = this.net.edges[ids[0]].len - this.s;
    for (let k = 1; k < ids.length; k++) L += CFG.ROADW + (k === ids.length - 1 ? goalS : this.net.edges[ids[k]].len);
    return L;
  }
  routeTo(goalEdge, goalS, pull = true, cb = null, blocked = null) {
    if (this.inTurn) { this.pending = [goalEdge, goalS, pull, cb, blocked]; return true; }
    let ids;
    if (goalEdge === this.edge && goalS > this.s + 12) ids = [goalEdge];
    else ids = this.net.findRoute(this.edge, goalEdge, blocked);
    if (!ids) return false;
    this.path = buildPath(this.net, ids, this.s, goalS, this.off, pull);
    this.d = 0; this.onArrive = cb; this.pending = null; this.routeIds = ids;
    return true;
  }
  stop() { this.path = null; this.pending = null; this.onArrive = null; }
  // pontos ocupados na rede (para o trânsito não nos atropelar)
  occupancy() {
    const p = this.curPiece;
    if (!this.path || !p) { return this.off > 4.2 ? [] : [{ edge: this.edge, s: this.s }]; }
    if (p.kind === 'edge') { return this.off > 4.2 && this.v < 0.5 ? [] : [{ edge: p.edge.id, s: this.s }]; }
    const local = this.d - p.start;
    return [{ edge: p.to.id, s: -(p.len - local) }, { edge: p.from.id, s: p.from.len + local }];
  }
  nextTurn() {
    if (!this.path) return null;
    const P = this.path.pieces; const i = this.path.idxAt(this.d);
    for (let k = i; k < P.length; k++) {
      const q = P[k];
      if (q.kind === 'turn' && q.curve.type !== 'S' && q.start + q.len > this.d) return { type: q.curve.type, dist: Math.max(0, q.start - this.d), street: q.to };
    }
    return { type: 'F', dist: this.path.length - this.d };
  }
  update(dt) {
    this.prevV = this.v;
    if (!this.path) {
      this.v = 0; this.accel = 0; this.yawRate *= 0.9; this.curPiece = null; this._pose(false, dt);
      return;
    }
    const P = this.path.pieces, DEC = CFG.DEC;
    const i = this.path.idxAt(this.d); const p = P[i]; this.curPiece = p;
    let vT = CFG.MAX_SPEED * this.speedFactor;
    const remain = this.path.length - this.d;
    vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, remain - 0.2)) + 0.25);
    this.redAhead = false;
    for (let k = i; k < P.length; k++) {
      const q = P[k]; const ahead = q.start - this.d;
      if (ahead > 90) break;
      if (q.kind === 'turn') {
        const lim = q.curve.type === 'S' ? CFG.MAX_SPEED * this.speedFactor : CFG.TURN_SPEED * (this.speedFactor > 1 ? 1.15 : 1);
        vT = Math.min(vT, Math.sqrt(lim * lim + 2 * DEC * Math.max(0, ahead)));
      } else if (k + 1 < P.length && q.s1 >= q.edge.len - 0.01) {
        const stop = q.start + q.len - this.d;
        if (stop > -0.3) {
          const L = this.net.light(q.edge.b, q.edge.axis);
          if (L !== 'G' && !(L === 'Y' && stop < (this.v * this.v) / (2 * DEC * 1.4) + 1)) {
            vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, stop - 1.5))); this.redAhead = true; break;
          }
        }
      }
    }
    if (this.traffic) {
      if (p.kind === 'edge') {
        const g = this.traffic.gapAhead(p.edge.id, this.s, this);
        if (g < 60) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, g - 7.5)));
        const nx = P[i + 1];
        if (nx && nx.kind === 'turn' && p.len - (this.d - p.start) < 14) {
          const g2 = this.traffic.gapAhead(nx.to.id, -1000, this);
          if (g2 < 20) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, p.start + p.len - this.d + nx.len + g2 - 8)));
        }
      } else {
        const local = this.d - p.start;
        const g = this.traffic.gapAhead(p.to.id, -(p.len - local), this);
        if (g < 30) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, g - 7.5)));
      }
    }
    if (this.hold) vT = 0;
    if (this.v < vT) this.v = Math.min(vT, this.v + CFG.ACC * (this.speedFactor > 1 ? 1.3 : 1) * dt);
    else this.v = Math.max(vT, this.v - (this.hold ? 5 : 6.5) * dt);
    this.v = Math.max(0, this.v);
    this.accel = (this.v - this.prevV) / Math.max(dt, 1e-4);
    this.d += this.v * dt; this.distDriven += this.v * dt;
    // estado na rede
    const j = this.path.idxAt(this.d); const q = P[j]; const local = this.d - q.start;
    if (q.kind === 'edge') { this.edge = q.edge.id; this.s = q.s0 + local; this.off = this.path.offsetAt(q, local); this.inTurn = false; }
    else { this.inTurn = true; this.edge = q.from.id; }
    this._pose(false, dt);
    if (!this.inTurn && this.pending) { const a = this.pending; this.pending = null; this.routeTo(...a); return; }
    if (remain - this.v * dt <= 0.25 && this.v < 0.6) {
      const cb = this.onArrive; const last = P[P.length - 1];
      if (last.kind === 'edge') { this.edge = last.edge.id; this.s = last.s1; this.off = last.pullEnd ? CFG.CURB : CFG.LANE; }
      this.path = null; this.onArrive = null; this.v = 0; this.inTurn = false;
      if (cb) cb();
    }
  }
  _pose(snap, dt = 0.016) {
    const a = this._a, b = this._b;
    if (this.path) { this.path.sample(this.d, a); this.path.sample(this.d + 2.0, b); }
    else { const e = this.net.edges[this.edge]; this.net.edgePoint(e, this.s, this.off, a); b.set(a.x + e.d.x, 0, a.z + e.d.z); }
    this.pos.copy(a);
    const dx = b.x - a.x, dz = b.z - a.z;
    if (dx * dx + dz * dz > 1e-6) {
      const h = Math.atan2(-dx, -dz);
      if (snap) { this.heading = h; this.yawRate = 0; return; }
      let dh = h - this.heading; while (dh > Math.PI) dh -= Math.PI * 2; while (dh < -Math.PI) dh += Math.PI * 2;
      const k = 1 - Math.exp(-dt * 7);
      const step = dh * k;
      this.heading += step;
      this.yawRate = clamp(step / Math.max(dt, 1e-4), -3, 3);
    }
  }
}
