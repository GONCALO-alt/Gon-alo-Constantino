// Peões que caminham nos passeios à volta dos quarteirões (instanciados por partes do corpo).
import * as THREE from 'three';
import { CFG } from '../config.js';
import { pick, rr } from '../util.js';

const SHIRTS = [0x2d4a7a, 0xb53a3a, 0xe8e2d0, 0x2f2f33, 0x3f7a4a, 0xd9a441, 0x7a4a8a, 0x5a7fa8, 0xc96f4a, 0x1f1f22];
const PANTS = [0x22252b, 0x2d3a55, 0x4a4036, 0x1a1a1c, 0x6b6157, 0x30455e];
export const SKINS = [0xf1d0b5, 0xe0b48f, 0xc68e64, 0x9a6640, 0x6e4529, 0xf5dcc6];

export class Pedestrians {
  constructor(scene, city, count) {
    this.city = city; this.peds = [];
    const blocks = city.blocks.filter((b) => b.type !== 'A');
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85 });
    const mk = (geo) => { const m = new THREE.InstancedMesh(geo, mat, count); m.castShadow = true; m.frustumCulled = false; scene.add(m); return m; };
    const leg = new THREE.BoxGeometry(0.14, 0.86, 0.16); leg.translate(0, -0.43, 0);
    const arm = new THREE.BoxGeometry(0.1, 0.62, 0.11); arm.translate(0, -0.31, 0);
    const torso = new THREE.BoxGeometry(0.4, 0.6, 0.24); torso.translate(0, 0.3, 0);
    const head = new THREE.SphereGeometry(0.12, 10, 8); head.scale(1, 1.15, 1);
    this.parts = { legL: mk(leg), legR: mk(leg), armL: mk(arm), armR: mk(arm), torso: mk(torso), head: mk(head) };
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const b = pick(blocks);
      const hw = (CFG.SPACING - CFG.ROADW) / 2 - (b.type === 'V' ? 1.2 : 2.7);
      const p = { b, hw, t: Math.random() * hw * 8, dir: Math.random() < 0.5 ? 1 : -1, sp: rr(1.0, 1.6), ph: Math.random() * 6, sc: rr(0.9, 1.08), stop: 0 };
      this.peds.push(p);
      const shirt = pick(SHIRTS), pant = pick(PANTS), skin = pick(SKINS);
      this.parts.legL.setColorAt(i, c.set(pant)); this.parts.legR.setColorAt(i, c.set(pant));
      this.parts.armL.setColorAt(i, c.set(shirt)); this.parts.armR.setColorAt(i, c.set(shirt));
      this.parts.torso.setColorAt(i, c.set(shirt)); this.parts.head.setColorAt(i, c.set(skin));
    }
    this._m = new THREE.Matrix4(); this._b = new THREE.Matrix4(); this._l = new THREE.Matrix4(); this._q = new THREE.Quaternion();
    this._t = 0; this.camPos = new THREE.Vector3();
  }
  update(dt) {
    const m = this._m, base = this._b, loc = this._l, q = this._q;
    const up = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0);
    this.peds.forEach((p, i) => {
      if (p.stop > 0) p.stop -= dt; else { p.t += p.dir * p.sp * dt; p.ph += p.sp * dt * 5.2; if (Math.random() < dt * 0.01) p.stop = rr(2, 8); }
      const L = p.hw * 2, per = L * 4;
      let t = ((p.t % per) + per) % per;
      const side = Math.floor(t / L); const a = t - side * L - p.hw;
      let x, z, dx, dz;
      if (side === 0) { x = a; z = -p.hw; dx = 1; dz = 0; }
      else if (side === 1) { x = p.hw; z = a; dx = 0; dz = 1; }
      else if (side === 2) { x = -a; z = p.hw; dx = -1; dz = 0; }
      else { x = -p.hw; z = -a; dx = 0; dz = -1; }
      dx *= p.dir; dz *= p.dir;
      const yaw = Math.atan2(-dx, -dz);
      q.setFromAxisAngle(up, yaw);
      base.compose(new THREE.Vector3(p.b.cx + x, 0.16, p.b.cz + z), q, new THREE.Vector3(p.sc, p.sc, p.sc));
      const walking = p.stop <= 0;
      const sw = walking ? Math.sin(p.ph) * 0.5 : 0;
      const set = (mesh, px, py, pz, rx) => {
        loc.makeRotationAxis(X, rx); loc.setPosition(px, py, pz);
        m.multiplyMatrices(base, loc); mesh.setMatrixAt(i, m);
      };
      set(this.parts.legL, -0.1, 0.88, 0, sw); set(this.parts.legR, 0.1, 0.88, 0, -sw);
      set(this.parts.armL, -0.26, 1.44, 0, -sw * 0.8); set(this.parts.armR, 0.26, 1.44, 0, sw * 0.8);
      set(this.parts.torso, 0, 0.88 + Math.abs(Math.cos(p.ph)) * 0.03 * (walking ? 1 : 0), 0, 0);
      set(this.parts.head, 0, 1.64, 0, 0);
    });
    for (const k in this.parts) this.parts[k].instanceMatrix.needsUpdate = true;
  }
}
