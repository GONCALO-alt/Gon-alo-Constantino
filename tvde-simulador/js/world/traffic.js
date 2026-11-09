// Trânsito: carros que circulam pela rede, respeitam semáforos e a distância ao carro da frente.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CFG } from '../config.js';
import { pick, rr } from '../util.js';
import { makeGlowTexture } from './materials.js';

const COLORS = [0xf2f2f2, 0x111214, 0xa7adb3, 0x5d6267, 0x1c2f55, 0x8c1c1c, 0xd8cdb5, 0x23402f, 0xf2f2f2, 0x111214, 0x6a7077, 0x2f5f8f];

function colored(geo, rgb) {
  const n = geo.attributes.position.count; const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { c[i * 3] = rgb[0]; c[i * 3 + 1] = rgb[1]; c[i * 3 + 2] = rgb[2]; }
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return geo;
}
export function makeBusGeometry() {
  const parts = [];
  const b = (w, h, d, x, y, z, col) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); parts.push(colored(g, col)); };
  const W = [1, 1, 1], G = [0.07, 0.09, 0.12], K = [0.04, 0.04, 0.045], Y = [0.95, 0.75, 0.15];
  b(2.5, 2.6, 11, 0, 1.75, 0, W); b(2.52, 0.9, 9.6, 0, 2.3, 0.5, G); b(2.4, 1.6, 0.1, 0, 2.0, -5.52, G);
  b(2.54, 0.25, 11.02, 0, 1.05, 0, Y);
  for (const x of [-1.1, 1.1]) for (const z of [-3.6, 3.4]) { const g = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 14); g.rotateZ(Math.PI / 2); g.translate(x, 0.5, z); parts.push(colored(g, K)); }
  return mergeGeometries(parts);
}
export function makeCarGeometry() {
  const parts = [];
  const b = (w, h, d, x, y, z, col) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); parts.push(colored(g, col)); };
  const W = [1, 1, 1], G = [0.07, 0.09, 0.12], K = [0.04, 0.04, 0.045], L = [1.4, 1.4, 1.3], R = [0.9, 0.06, 0.05];
  b(1.8, 0.55, 4.3, 0, 0.62, 0, W);         // carroçaria
  b(1.74, 0.16, 1.2, 0, 0.95, -1.45, W);    // capô
  b(1.62, 0.52, 2.15, 0, 1.15, 0.25, G);    // vidros
  b(1.5, 0.06, 1.9, 0, 1.43, 0.3, W);       // tejadilho
  b(1.84, 0.18, 0.25, 0, 0.42, -2.12, K);   // para-choques
  b(1.84, 0.18, 0.25, 0, 0.42, 2.12, K);
  b(0.38, 0.12, 0.05, -0.6, 0.78, -2.16, L); b(0.38, 0.12, 0.05, 0.6, 0.78, -2.16, L);
  b(0.4, 0.12, 0.05, -0.62, 0.8, 2.16, R); b(0.4, 0.12, 0.05, 0.62, 0.8, 2.16, R);
  for (const x of [-0.82, 0.82]) for (const z of [-1.35, 1.35]) {
    const g = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14); g.rotateZ(Math.PI / 2); g.translate(x, 0.33, z); parts.push(colored(g, K));
  }
  return mergeGeometries(parts);
}

export class Traffic {
  constructor(scene, net, count, busCount = 5) {
    this.net = net; this.cars = [];
    this.mesh = new THREE.InstancedMesh(makeCarGeometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.55 }), count);
    this.busMesh = new THREE.InstancedMesh(makeBusGeometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.3 }), busCount);
    for (const m of [this.mesh, this.busMesh]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); }
    const total = count + busCount;
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 12), 3)); lg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(total * 12), 3));
    this.lights = new THREE.Points(lg, new THREE.PointsMaterial({ size: 0.9, map: makeGlowTexture(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    this.lights.frustumCulled = false; scene.add(this.lights);
    this.occ = new Map(); this.density = 1; this.focus = new THREE.Vector3(); this.onHorn = null;
    const col = new THREE.Color();
    for (let i = 0; i < total; i++) {
      const bus = i >= count;
      const c = { i: bus ? i - count : i, li: i, bus, active: true, edge: 0, s: 0, v: rr(4, 9), vmax: bus ? rr(8, 9.5) : rr(9.5, 13), next: null, turn: null, td: 0, braking: false,
        pos: new THREE.Vector3(), yaw: 0, scale: bus ? 1 : Math.random() < 0.2 ? 1.12 : Math.random() < 0.2 ? 0.92 : 1, wait: 0, stopAt: -1, hold: 0 };
      this._spawn(c, false);
      this.cars.push(c);
      if (bus) this.busMesh.setColorAt(c.i, col.set(i % 2 ? 0xe9eef2 : 0x2e7d4f)); else this.mesh.setColorAt(c.i, col.set(pick(COLORS)));
    }
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._s = new THREE.Vector3(); this._v = new THREE.Vector3(); this._v2 = new THREE.Vector3();
    this.night = 0; this._densT = 0;
  }
  _spawn(c, far) {
    const n = this.net; let e, s, tries = 0;
    do {
      e = pick(n.edges); s = rr(6, e.len - 6); tries++;
      const p = n.edgePoint(e, s, CFG.LANE, this._v || new THREE.Vector3());
      const ok = !n.closed.has(e.id) && !this.cars.some((o) => o.active && o !== c && o.edge === e.id && Math.abs(o.s - s) < 14) && (!far || p.distanceTo(this.focus) > 130);
      if (ok) break;
    } while (tries < 40);
    c.edge = e.id; c.s = s; c.turn = null; c.next = null; c.v = rr(3, 8); c.wait = 0; c.hold = 0; c.stopAt = c.bus && Math.random() < 0.6 ? rr(15, e.len - 15) : -1;
  }
  // percentagem de carros em circulação (hora de ponta = 1)
  setDensity(f) { this.density = f; }
  _applyDensity() {
    const cars = this.cars.filter((c) => !c.bus); const target = Math.round(cars.length * this.density);
    cars.forEach((c, k) => {
      const want = k < target;
      if (want === c.active) return;
      const far = c.pos.distanceTo(this.focus) > 130;
      if (!want && far) c.active = false;
      else if (want) { this._spawn(c, true); c.active = true; this._pose(c); }
    });
  }
  chooseNext(e) {
    const n = this.net; const outs = n.nodes[e.b].out.filter((x) => x !== e.rev && !n.closed.has(x));
    if (!outs.length) return e.rev;
    let tot = 0; const w = outs.map((x) => { const t = n.turnType(e, n.edges[x]); const v = t === 'S' ? 3 : t === 'R' ? 1.5 : 1; tot += v; return v; });
    let r = Math.random() * tot;
    for (let k = 0; k < outs.length; k++) { r -= w[k]; if (r <= 0) return outs[k]; }
    return outs[0];
  }
  // ocupação das vias (inclui o carro do jogador e as obras)
  buildOcc(player) {
    const occ = this.occ; occ.forEach((a) => (a.length = 0));
    const add = (eid, s, ref) => { let a = occ.get(eid); if (!a) { a = []; occ.set(eid, a); } a.push({ s, ref }); };
    for (const c of this.cars) {
      if (!c.active) continue;
      if (!c.turn) { add(c.edge, c.s, c); if (c.bus) add(c.edge, c.s - 4.5, c); }
      else { add(c.turnTo, -(c.turn.len - c.td), c); add(c.edge, this.net.edges[c.edge].len + c.td, c); }
    }
    if (player) for (const o of player.occupancy()) add(o.edge, o.s, player);
  }
  gapAhead(eid, s, self) {
    const a = this.occ.get(eid); if (!a) return Infinity;
    let g = Infinity;
    for (const o of a) { if (o.ref === self) continue; const d = o.s - s; if (d > 0.05 && d < g) g = d; }
    return g;
  }
  update(dt) {
    const n = this.net; const DEC = CFG.DEC;
    this._densT -= dt; if (this._densT <= 0) { this._densT = 2; this._applyDensity(); }
    for (const c of this.cars) {
      if (!c.active) continue;
      let vT = c.vmax; let red = false; const minGap = c.bus ? 10 : 7.5;
      if (!c.turn) {
        const e = n.edges[c.edge];
        if (c.next == null) c.next = this.chooseNext(e);
        const ne = n.edges[c.next]; const curve = n.curve(e, ne);
        const toStop = e.len - c.s;
        if (curve.type !== 'S') vT = Math.min(vT, Math.sqrt(CFG.TURN_SPEED ** 2 + 2 * DEC * Math.max(0, toStop)));
        const L = n.light(e.b, e.axis);
        if (L !== 'G' && !(L === 'Y' && toStop < (c.v * c.v) / (2 * DEC * 1.4) + 1)) { vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, toStop - 1.5))); red = toStop < 30; }
        const gap = this.gapAhead(e.id, c.s, c);
        if (gap < 60) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, gap - minGap)));
        if (toStop < 14) { const g2 = this.gapAhead(ne.id, -1000, c); if (g2 < 20) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, toStop + curve.len + g2 - 8))); }
        // paragem de autocarro
        if (c.bus && c.stopAt > 0) {
          if (c.hold > 0) { c.hold -= dt; vT = 0; if (c.hold <= 0) c.stopAt = -1; }
          else { const d = c.stopAt - c.s; if (d < 0.5) c.hold = rr(5, 9); else vT = Math.min(vT, Math.sqrt(2 * DEC * d) + 0.3); }
        }
        this._accel(c, vT, dt);
        c.s += c.v * dt;
        if (c.s >= e.len) { c.turn = curve; c.turnTo = ne.id; c.td = c.s - e.len; }
      } else {
        if (c.turn.type !== 'S') vT = Math.min(vT, CFG.TURN_SPEED * (c.bus ? 0.8 : 1));
        const g = this.gapAhead(c.turnTo, -(c.turn.len - c.td), c);
        if (g < 30) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, g - minGap)));
        this._accel(c, vT, dt);
        c.td += c.v * dt;
        if (c.td >= c.turn.len) {
          c.edge = c.turnTo; c.s = c.td - c.turn.len; c.next = null; c.turn = null;
          if (c.bus) c.stopAt = Math.random() < 0.55 ? rr(15, n.edges[c.edge].len - 15) : -1;
        }
      }
      // buzinas quando ficam presos sem semáforo vermelho
      if (c.v < 0.3 && !red && c.hold <= 0) c.wait += dt; else c.wait = 0;
      if (c.wait > 5 && Math.random() < dt * 0.35 && this.onHorn) { this.onHorn(c.pos, c.bus); c.wait = 2; }
      this._pose(c);
    }
    this._render();
  }
  _accel(c, vT, dt) {
    c.braking = vT < c.v - 0.3;
    if (c.v < vT) c.v = Math.min(vT, c.v + (c.bus ? 1.4 : 2.2) * dt); else c.v = Math.max(vT, c.v - 6.5 * dt);
    if (c.v < 0) c.v = 0;
  }
  _pose(c) {
    const n = this.net; const p = this._v, q = this._v2;
    if (!c.turn) { const e = n.edges[c.edge]; n.edgePoint(e, c.s, CFG.LANE, p); c.yaw = Math.atan2(-e.d.x, -e.d.z); }
    else {
      const t = c.td / c.turn.len; n.bezier(c.turn, Math.min(1, t), p); n.bezier(c.turn, Math.min(1, t + 0.05), q);
      if (q.distanceToSquared(p) > 1e-6) c.yaw = Math.atan2(-(q.x - p.x), -(q.z - p.z));
    }
    c.pos.copy(p);
  }
  _render() {
    const m = this._m, q = this._q, s = this._s; const up = new THREE.Vector3(0, 1, 0);
    const P = this.lights.geometry.attributes.position.array, Cc = this.lights.geometry.attributes.color.array;
    const night = this.night;
    for (const c of this.cars) {
      const mesh = c.bus ? this.busMesh : this.mesh;
      const k = c.li * 12;
      if (!c.active) { m.makeScale(0, 0, 0); mesh.setMatrixAt(c.i, m); for (let j = 0; j < 12; j++) { Cc[k + j] = 0; P[k + j] = 0; } continue; }
      q.setFromAxisAngle(up, c.yaw); s.set(c.scale, c.scale, c.scale);
      m.compose(c.pos, q, s); mesh.setMatrixAt(c.i, m);
      const fx = -Math.sin(c.yaw), fz = -Math.cos(c.yaw), rx = -fz, rz = fx;
      const L = c.bus ? 5.55 : 2.2, sd = c.bus ? 1.0 : 0.62, hy = c.bus ? 1.0 : 0.8;
      for (let j = 0; j < 4; j++) {
        const front = j < 2; const side = j % 2 ? sd : -sd; const along = front ? L : -L;
        P[k + j * 3] = c.pos.x + fx * along * c.scale + rx * side;
        P[k + j * 3 + 1] = hy * c.scale;
        P[k + j * 3 + 2] = c.pos.z + fz * along * c.scale + rz * side;
        if (front) { const b = night * 1.0; Cc[k + j * 3] = b; Cc[k + j * 3 + 1] = b * 0.92; Cc[k + j * 3 + 2] = b * 0.75; }
        else { const b = c.braking || c.hold > 0 ? 1.0 : night * 0.45; Cc[k + j * 3] = b; Cc[k + j * 3 + 1] = b * 0.05; Cc[k + j * 3 + 2] = b * 0.03; }
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true; this.busMesh.instanceMatrix.needsUpdate = true;
    this.lights.geometry.attributes.position.needsUpdate = true;
    this.lights.geometry.attributes.color.needsUpdate = true;
  }
}
