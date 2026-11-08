// Modelo 3D articulado dos passageiros, com animações (parado, acenar, andar, sentado, falar).
import * as THREE from 'three';

export class Human {
  constructor(look) {
    this.look = look;
    const k = look.height || 1;
    const mat = (c, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
    this.mats = { skin: mat(look.skin, 0.6), shirt: mat(look.shirt), pants: mat(look.pants), hair: mat(look.hair, 0.9), shoe: mat(0x161616, 0.5), dark: mat(0x111111, 0.3) };
    const box = (w, h, d, m) => { const g = new THREE.BoxGeometry(w, h, d); const me = new THREE.Mesh(g, m); me.castShadow = true; return me; };
    const root = new THREE.Group(); this.root = root;
    const body = new THREE.Group(); body.scale.setScalar(k); root.add(body);
    const hips = new THREE.Group(); hips.position.y = 0.92; body.add(hips); this.hips = hips;
    const pelvis = box(0.36, 0.16, 0.22, this.mats.pants); pelvis.position.y = 0.0; hips.add(pelvis);
    const mkLeg = (x) => {
      const top = new THREE.Group(); top.position.set(x, -0.02, 0); hips.add(top);
      const th = box(0.15, 0.46, 0.17, this.mats.pants); th.position.y = -0.23; top.add(th);
      const knee = new THREE.Group(); knee.position.y = -0.46; top.add(knee);
      const sh = box(0.13, 0.42, 0.14, this.mats.pants); sh.position.y = -0.21; knee.add(sh);
      const foot = box(0.12, 0.07, 0.26, this.mats.shoe); foot.position.set(0, -0.43, -0.05); knee.add(foot);
      return { top, knee };
    };
    this.legL = mkLeg(-0.1); this.legR = mkLeg(0.1);
    const torso = new THREE.Group(); torso.position.y = 0.06; hips.add(torso); this.torso = torso;
    const chest = box(look.gender === 'f' ? 0.36 : 0.42, 0.56, 0.24, this.mats.shirt); chest.position.y = 0.3; torso.add(chest);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8), this.mats.skin); neck.position.y = 0.62; torso.add(neck);
    const head = new THREE.Group(); head.position.y = 0.76; torso.add(head); this.head = head;
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), this.mats.skin); skull.scale.set(0.95, 1.12, 1); skull.castShadow = true; head.add(skull);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.04), this.mats.skin); nose.position.set(0, -0.01, -0.12); head.add(nose);
    for (const x of [-0.042, 0.042]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), this.mats.dark); e.position.set(x, 0.025, -0.11); head.add(e); }
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.01), new THREE.MeshStandardMaterial({ color: 0x7a3b33 })); mouth.position.set(0, -0.06, -0.113); head.add(mouth); this.mouth = mouth;
    // cabelo
    const hs = look.hairStyle;
    if (hs !== 'bald') {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.128, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), this.mats.hair);
      cap.scale.set(0.98, 1.15, 1.05); cap.position.y = 0.012; cap.rotation.x = 0.25; head.add(cap);
      if (hs === 'long') { const l = box(0.25, 0.3, 0.1, this.mats.hair); l.position.set(0, -0.1, 0.075); head.add(l); }
      if (hs === 'bun') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), this.mats.hair); b.position.set(0, 0.1, 0.1); head.add(b); }
      if (hs === 'curly') { cap.scale.set(1.12, 1.25, 1.15); }
    }
    if (look.beard) { const b = box(0.2, 0.08, 0.06, this.mats.hair); b.position.set(0, -0.085, -0.085); head.add(b); }
    if (look.glasses) { const g = box(0.2, 0.035, 0.01, this.mats.dark); g.position.set(0, 0.025, -0.125); head.add(g); }
    const mkArm = (x) => {
      const sh = new THREE.Group(); sh.position.set(x, 0.53, 0); torso.add(sh);
      const up = box(0.1, 0.3, 0.11, this.mats.shirt); up.position.y = -0.15; sh.add(up);
      const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
      const fo = box(0.085, 0.27, 0.09, look.sleeves === 'short' ? this.mats.skin : this.mats.shirt); fo.position.y = -0.135; el.add(fo);
      const hand = box(0.08, 0.09, 0.05, this.mats.skin); hand.position.y = -0.31; el.add(hand);
      return { sh, el };
    };
    this.armL = mkArm(-0.25); this.armR = mkArm(0.25);
    this.mode = 'stand'; this.t = Math.random() * 10; this.talk = 0; this.lookYaw = 0; this.lookTarget = 0; this._lookTimer = 2;
    this.opacity = 1;
  }
  setMode(m) { this.mode = m; }
  setOpacity(o) {
    this.opacity = o;
    for (const k in this.mats) { const m = this.mats[k]; m.transparent = o < 1; m.opacity = o; }
  }
  update(dt) {
    this.t += dt; const t = this.t;
    const L = this.legL, R = this.legR, A = this.armL, B = this.armR;
    const set = (g, x = 0, y = 0, z = 0) => g.rotation.set(x, y, z);
    this.hips.position.y = 0.92; this.torso.rotation.set(0, 0, 0);
    if (this.mode === 'walk') {
      const s = Math.sin(t * 7.5);
      set(L.top, s * 0.55); set(L.knee, Math.max(0, -s) * 0.8); set(R.top, -s * 0.55); set(R.knee, Math.max(0, s) * 0.8);
      set(A.sh, -s * 0.45, 0, -0.05); set(A.el, -0.25); set(B.sh, s * 0.45, 0, 0.05); set(B.el, -0.25);
      this.hips.position.y = 0.92 + Math.abs(Math.cos(t * 7.5)) * 0.03;
    } else if (this.mode === 'sit') {
      set(L.top, Math.PI / 2 - 0.05, 0, 0.05); set(L.knee, -Math.PI / 2 + 0.1); set(R.top, Math.PI / 2 - 0.05, 0, -0.05); set(R.knee, -Math.PI / 2 + 0.1);
      const phone = this.look.phoneUser && Math.sin(t * 0.13) > 0.3;
      if (phone) { set(A.sh, 0.7, 0, 0.1); set(A.el, 1.2); set(B.sh, 0.75, 0, -0.1); set(B.el, 1.3); }
      else { set(A.sh, 0.35, 0, -0.08); set(A.el, 0.9); set(B.sh, 0.35, 0, 0.08); set(B.el, 0.9); }
      this.torso.rotation.x = 0.12;
      this._lookTimer -= dt;
      if (this._lookTimer <= 0) { this._lookTimer = 2 + Math.random() * 4; this.lookTarget = phone ? 0 : (Math.random() - 0.5) * 1.6; }
      this.lookYaw += (this.lookTarget - this.lookYaw) * Math.min(1, dt * 3);
      this.head.rotation.set(phone ? 0.5 : 0, this.lookYaw, 0);
    } else if (this.mode === 'wave') {
      set(L.top); set(L.knee); set(R.top); set(R.knee);
      set(A.sh, 0, 0, -0.06); set(A.el, -0.1);
      set(B.sh, 0, 0, 2.6 + Math.sin(t * 8) * 0.35); set(B.el, 0, 0, 0.3);
    } else {
      set(L.top); set(L.knee); set(R.top); set(R.knee);
      set(A.sh, Math.sin(t * 1.3) * 0.03, 0, -0.07); set(A.el, -0.15); set(B.sh, -Math.sin(t * 1.3) * 0.03, 0, 0.07); set(B.el, -0.15);
      this.head.rotation.set(0, Math.sin(t * 0.4) * 0.4, 0);
    }
    // a falar
    if (this.talk > 0) {
      this.talk -= dt;
      this.mouth.scale.y = 1 + Math.abs(Math.sin(t * 18)) * 4;
      this.head.rotation.x += Math.sin(t * 6) * 0.05;
    } else this.mouth.scale.y = 1;
  }
  dispose() {
    this.root.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
    for (const k in this.mats) this.mats[k].dispose();
  }
}
