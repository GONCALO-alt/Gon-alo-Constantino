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
  constructor(scene, net, count) {
    this.net = net; this.cars = [];
    const geo = makeCarGeometry();
    this.mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.55 }), count);
    this.mesh.castShadow = true; this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    // luzes (pontos com brilho)
    const lp = new Float32Array(count * 4 * 3), lc = new Float32Array(count * 4 * 3);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(lp, 3)); lg.setAttribute('color', new THREE.BufferAttribute(lc, 3));
    this.lights = new THREE.Points(lg, new THREE.PointsMaterial({ size: 0.9, map: makeGlowTexture(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    this.lights.frustumCulled = false; scene.add(this.lights);
    this.occ = new Map();
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      let tries = 0, e, s;
      do { e = pick(net.edges); s = rr(5, e.len - 5); tries++; } while (tries < 20 && this.cars.some((c) => c.edge === e.id && Math.abs(c.s - s) < 12));
      const scaleK = Math.random() < 0.2 ? 1.12 : Math.random() < 0.2 ? 0.92 : 1;
      this.cars.push({ i, edge: e.id, s, v: rr(4, 9), vmax: rr(9.5, 13), next: null, turn: null, td: 0, braking: false, pos: new THREE.Vector3(), yaw: 0, scale: scaleK });
      this.mesh.setColorAt(i, col.set(pick(COLORS)));
    }
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._s = new THREE.Vector3(); this._v = new THREE.Vector3(); this._v2 = new THREE.Vector3();
    this.night = 0;
  }
  chooseNext(e) {
    const n = this.net; const outs = n.nodes[e.b].out.filter((x) => x !== e.rev);
    if (!outs.length) return e.rev;
    let tot = 0; const w = outs.map((x) => { const t = n.turnType(e, n.edges[x]); const v = t === 'S' ? 3 : t === 'R' ? 1.5 : 1; tot += v; return v; });
    let r = Math.random() * tot;
    for (let k = 0; k < outs.length; k++) { r -= w[k]; if (r <= 0) return outs[k]; }
    return outs[0];
  }
  // ocupação das vias (inclui o carro do jogador)
  buildOcc(player) {
    const occ = this.occ; occ.forEach((a) => (a.length = 0));
    const add = (eid, s, ref) => { let a = occ.get(eid); if (!a) { a = []; occ.set(eid, a); } a.push({ s, ref }); };
    for (const c of this.cars) {
      if (!c.turn) add(c.edge, c.s, c);
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
    for (const c of this.cars) {
      let vT = c.vmax;
      if (!c.turn) {
        const e = n.edges[c.edge];
        if (c.next == null) c.next = this.chooseNext(e);
        const ne = n.edges[c.next]; const curve = n.curve(e, ne);
        const toStop = e.len - c.s;
        if (curve.type !== 'S') vT = Math.min(vT, Math.sqrt(CFG.TURN_SPEED ** 2 + 2 * DEC * Math.max(0, toStop)));
        const L = n.light(e.b, e.axis);
        if (L !== 'G' && !(L === 'Y' && toStop < (c.v * c.v) / (2 * DEC * 1.4) + 1)) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, toStop - 1.5)));
        const gap = this.gapAhead(e.id, c.s, c);
        if (gap < 60) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, gap - 7.5)));
        if (toStop < 14) { const g2 = this.gapAhead(ne.id, -1000, c); if (g2 < 20) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, toStop + curve.len + g2 - 8))); }
        this._accel(c, vT, dt);
        c.s += c.v * dt;
        if (c.s >= e.len) { c.turn = curve; c.turnTo = ne.id; c.td = c.s - e.len; }
      } else {
        if (c.turn.type !== 'S') vT = Math.min(vT, CFG.TURN_SPEED);
        const g = this.gapAhead(c.turnTo, -(c.turn.len - c.td), c);
        if (g < 30) vT = Math.min(vT, Math.sqrt(2 * DEC * Math.max(0, g - 7.5)));
        this._accel(c, vT, dt);
        c.td += c.v * dt;
        if (c.td >= c.turn.len) { c.edge = c.turnTo; c.s = c.td - c.turn.len; c.next = null; c.turn = null; }
      }
      this._pose(c);
    }
    this._render();
  }
  _accel(c, vT, dt) {
    c.braking = vT < c.v - 0.3;
    if (c.v < vT) c.v = Math.min(vT, c.v + 2.2 * dt); else c.v = Math.max(vT, c.v - 6.5 * dt);
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
      q.setFromAxisAngle(up, c.yaw); s.set(c.scale, c.scale, c.scale);
      m.compose(c.pos, q, s); this.mesh.setMatrixAt(c.i, m);
      const fx = -Math.sin(c.yaw), fz = -Math.cos(c.yaw), rx = -fz, rz = fx;
      const k = c.i * 12;
      for (let j = 0; j < 4; j++) {
        const front = j < 2; const side = j % 2 ? 0.62 : -0.62; const along = front ? 2.2 : -2.2;
        P[k + j * 3] = c.pos.x + fx * along * c.scale + rx * side;
        P[k + j * 3 + 1] = 0.8 * c.scale;
        P[k + j * 3 + 2] = c.pos.z + fz * along * c.scale + rz * side;
        if (front) { const b = night * 1.0; Cc[k + j * 3] = b; Cc[k + j * 3 + 1] = b * 0.92; Cc[k + j * 3 + 2] = b * 0.75; }
        else { const b = c.braking ? 1.0 : night * 0.45; Cc[k + j * 3] = b; Cc[k + j * 3 + 1] = b * 0.05; Cc[k + j * 3 + 2] = b * 0.03; }
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.lights.geometry.attributes.position.needsUpdate = true;
    this.lights.geometry.attributes.color.needsUpdate = true;
  }
}
