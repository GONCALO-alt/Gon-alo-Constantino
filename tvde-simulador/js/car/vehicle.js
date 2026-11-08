// Carro do jogador em primeira pessoa: interior, câmara, ecrãs, espelho, limpa-vidros e gotas.
import * as THREE from 'three';
import { makeCanvas, canvasTex } from '../world/materials.js';
import { clamp, damp } from '../util.js';

const WS = { cx: 0, cy: 1.235, cz: -0.755, w: 1.52, L: Math.hypot(0.5, 0.6), tilt: Math.atan2(0.6, 0.5) };

export class PlayerCar {
  constructor(scene, camera, quality) {
    this.scene = scene; this.camera = camera; this.q = quality;
    this.root = new THREE.Group(); scene.add(this.root);
    this.yaw = 0; this.pitch = -0.08; this.targetYaw = 0; this.targetPitch = -0.08;
    this.head = new THREE.Group(); this.root.add(this.head);
    this.headYaw = new THREE.Group(); this.head.add(this.headYaw);
    this.headPitch = new THREE.Group(); this.headYaw.add(this.headPitch);
    this.headPitch.add(camera); camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0);
    this.interior = null;
    this.steer = 0; this.wiperA = 0.05; this.wiperDir = 1; this.wiperOn = false;
    this.drops = []; this._dropTimer = 0;
    this.sway = new THREE.Vector3();
    // ecrãs (canvas)
    [this.clusterC, this.clusterX] = makeCanvas(512, 192);
    [this.screenC, this.screenX] = makeCanvas(512, 320);
    [this.phoneC, this.phoneX] = makeCanvas(160, 320);
    [this.dropC, this.dropX] = makeCanvas(512, 256);
    this.clusterT = canvasTex(this.clusterC, false); this.screenT = canvasTex(this.screenC, false); this.phoneT = canvasTex(this.phoneC, false); this.dropT = canvasTex(this.dropC, false);
    // retrovisor
    this.mirrorRT = null;
    if (quality !== 'low') {
      this.mirrorRT = new THREE.WebGLRenderTarget(512, 132, { type: THREE.HalfFloatType });
      this.mirrorCam = new THREE.PerspectiveCamera(26, 512 / 132, 0.1, 400);
    }
    // faróis
    this.headL = new THREE.SpotLight(0xfff1dc, 0, 70, 0.62, 0.55, 1.3);
    this.headL.position.set(0, 0.75, -2.3); this.headL.target.position.set(0, 0, -28);
    this.root.add(this.headL, this.headL.target);
    this.cabinL = new THREE.PointLight(0xffffff, 0, 3.2, 1.6); this.cabinL.position.set(0, 1.42, 0.45); this.root.add(this.cabinL);
  }

  build(def) {
    if (this.interior) { this.root.remove(this.interior); this.interior.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); } }); }
    this.def = def;
    const I = new THREE.Group(); this.interior = I; this.root.add(I);
    const mat = (c, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
    const dash = mat(def.interior, 0.75), seat = mat(def.seat, 0.85), trim = mat(new THREE.Color(def.interior).multiplyScalar(0.7), 0.5, 0.2);
    const head = mat(new THREE.Color(def.interior).lerp(new THREE.Color(0xbdb8b0), 0.6), 0.95);
    const paint = new THREE.MeshPhysicalMaterial({ color: def.paint, roughness: 0.32, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.08 });
    const black = mat(0x0d0d0f, 0.45, 0.2), chrome = mat(0xcfd3d8, 0.15, 1);
    const accent = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: def.accent, emissiveIntensity: 0.6 });
    this.accentMat = accent;
    const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0, shadow = false) => {
      const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.rotation.set(rx, ry, rz);
      me.receiveShadow = true; me.castShadow = shadow; I.add(me); return me;
    };
    const box = (w, h, d, m, x, y, z, rx = 0, ry = 0, rz = 0, sh = false) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz, sh);
    const beam = (a, b, t, m) => {
      const dir = new THREE.Vector3().subVectors(b, a); const len = dir.length();
      const me = new THREE.Mesh(new THREE.BoxGeometry(t, len, t * 1.6), m);
      me.position.copy(a).addScaledVector(dir, 0.5);
      me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      me.castShadow = true; me.receiveShadow = true; I.add(me); return me;
    };
    const extrudeX = (pts, depth, m, x0 = 0) => {
      const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        if (p.length === 4) sh.quadraticCurveTo(p[0], p[1], p[2], p[3]); else sh.lineTo(p[0], p[1]);
      }
      const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 10 });
      g.rotateY(-Math.PI / 2); g.translate(depth / 2 + x0, 0, 0);
      const me = new THREE.Mesh(g, m); me.castShadow = true; me.receiveShadow = true; I.add(me); return me;
    };
    const e = def.eye || 1.16; const lift = e - 1.16; // SUV mais alto
    I.position.y = 0; this.eye = new THREE.Vector3(-0.37, e, 0.05);
    const Y = (y) => y + lift * 0.85;

    // tablier
    extrudeX([[-1.08, Y(0.5)], [-1.08, Y(0.97)], [-0.86, Y(1.03), -0.66, Y(0.985)], [-0.58, Y(0.93)], [-0.49, Y(0.76), -0.52, Y(0.6)], [-0.62, Y(0.45)], [-1.08, Y(0.45)]], 1.76, dash);
    // capota
    extrudeX([[-1.08, Y(0.93)], [-2.3, Y(0.83)], [-2.46, Y(0.81), -2.48, Y(0.68)], [-1.08, Y(0.68)]], 1.72, paint);
    box(1.6, 0.02, 0.05, chrome, 0, Y(0.835), -2.32);
    // linha de luz ambiente
    box(1.2, 0.006, 0.006, accent, 0.05, Y(0.935), -0.585);
    // binóculo do painel de instrumentos
    box(0.38, 0.025, 0.12, trim, -0.37, Y(0.955), -0.56, -0.15);
    this.clusterMesh = add(new THREE.PlaneGeometry(0.31, 0.116), new THREE.MeshBasicMaterial({ map: this.clusterT, toneMapped: false }), -0.37, Y(0.875), -0.528, -0.45);
    // ecrã central
    box(0.3, 0.2, 0.025, black, 0.03, Y(0.84), -0.528, -0.45, -0.12);
    this.screenMesh = add(new THREE.PlaneGeometry(0.275, 0.172), new THREE.MeshBasicMaterial({ map: this.screenT, toneMapped: false }), 0.03, Y(0.84), -0.514, -0.45, -0.12);
    // ventiladores e botões
    for (const x of [-0.13, 0.19]) box(0.06, 0.035, 0.02, black, x, Y(0.9), -0.56, -0.45);
    for (const x of [-0.7, 0.6]) box(0.12, 0.05, 0.03, black, x, Y(0.88), -0.64, -0.3);
    box(0.22, 0.04, 0.02, black, 0.03, Y(0.71), -0.5, -0.3);
    // consola central e alavanca
    box(0.26, 0.3, 0.86, trim, 0.02, Y(0.4), -0.15);
    box(0.24, 0.05, 0.5, dash, 0.02, Y(0.57), 0.1);
    add(new THREE.CylinderGeometry(0.012, 0.015, 0.12, 8), chrome, 0.02, Y(0.62), -0.28);
    add(new THREE.SphereGeometry(0.03, 12, 10), black, 0.02, Y(0.69), -0.28);
    // chão e tejadilho
    box(1.78, 0.05, 2.9, mat(0x1a1a1c, 1), 0, Y(0.22), 0.25);
    box(1.52, 0.035, 1.78, head, 0, Y(1.505), 0.41);
    // pilares
    for (const s of [-1, 1]) {
      beam(new THREE.Vector3(s * 0.8, Y(0.97), -1.05), new THREE.Vector3(s * 0.71, Y(1.49), -0.47), 0.07, trim);
      beam(new THREE.Vector3(s * 0.86, Y(0.95), 0.5), new THREE.Vector3(s * 0.78, Y(1.49), 0.5), 0.09, head);
      beam(new THREE.Vector3(s * 0.85, Y(0.95), 1.62), new THREE.Vector3(s * 0.72, Y(1.46), 1.26), 0.14, head);
      beam(new THREE.Vector3(s * 0.74, Y(1.49), -0.47), new THREE.Vector3(s * 0.74, Y(1.49), 1.27), 0.05, head);
      // portas
      box(0.06, 0.68, 2.6, dash, s * 0.9, Y(0.62), 0.3);
      box(0.12, 0.05, 2.6, trim, s * 0.86, Y(0.965), 0.3);
      box(0.1, 0.05, 0.5, seat, s * 0.84, Y(0.72), 0.05);
      box(0.02, 0.03, 0.12, chrome, s * 0.865, Y(0.83), -0.25);
      // espelhos laterais
      const mx = s * 1.0;
      box(0.22, 0.14, 0.09, paint, mx, Y(1.0), -0.82, 0, s * 0.15);
      add(new THREE.PlaneGeometry(0.19, 0.11), mat(0x9aa7b5, 0.02, 1), mx, Y(1.0), -0.774, 0, s * 0.15);
      // pala de sol
      box(0.42, 0.02, 0.18, head, s * 0.37, Y(1.475), -0.36, 0.12);
    }
    // vidro traseiro moldura e chapeleira
    box(1.4, 0.04, 0.3, trim, 0, Y(0.97), 1.72);
    // bancos
    const seatAt = (x) => {
      box(0.5, 0.13, 0.52, seat, x, Y(0.5), 0.14);
      box(0.5, 0.66, 0.13, seat, x, Y(0.87), 0.45, 0.17, 0, 0, true);
      box(0.27, 0.19, 0.1, seat, x, Y(1.3), 0.55, 0.1);
      box(0.04, 0.1, 0.04, chrome, x - 0.08, Y(1.18), 0.54); box(0.04, 0.1, 0.04, chrome, x + 0.08, Y(1.18), 0.54);
    };
    seatAt(-0.37); seatAt(0.37);
    box(1.42, 0.15, 0.5, seat, 0, Y(0.48), 1.08);
    box(1.42, 0.62, 0.14, seat, 0, Y(0.82), 1.38, 0.2);
    for (const x of [-0.45, 0.45]) box(0.26, 0.17, 0.09, seat, x, Y(1.22), 1.46, 0.15);
    // volante
    const wheel = new THREE.Group(); wheel.position.set(-0.37, Y(0.87), -0.47); wheel.rotation.x = -0.42; I.add(wheel);
    const spin = new THREE.Group(); wheel.add(spin); this.wheel = wheel; this.wheelSpin = spin;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.019, 12, 48), black); spin.add(rim); rim.castShadow = true;
    for (const a of [0, Math.PI, -Math.PI / 2]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.02), trim); sp.position.set(Math.cos(a) * 0.09, Math.sin(a) * 0.09, 0); sp.rotation.z = a; spin.add(sp); }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.05, 20), black); hub.rotation.x = Math.PI / 2; spin.add(hub);
    const logo = new THREE.Mesh(new THREE.CircleGeometry(0.022, 20), chrome); logo.position.z = 0.027; spin.add(logo);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.3, 10), trim); col.rotation.x = Math.PI / 2 - 0.42; col.position.set(-0.37, Y(0.83), -0.56); I.add(col);
    // telemóvel no suporte
    const pm = new THREE.Group(); pm.position.set(0.24, Y(1.035), -0.68); pm.rotation.set(-0.15, -0.35, 0); I.add(pm);
    const pbody = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.158, 0.01), black); pm.add(pbody);
    this.phoneMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.072, 0.15), new THREE.MeshBasicMaterial({ map: this.phoneT, toneMapped: false })); this.phoneMesh.position.z = 0.0055; pm.add(this.phoneMesh);
    const clamp_ = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.02), trim); clamp_.position.set(0, -0.085, -0.005); pm.add(clamp_);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.06, 0.015), trim); stem.position.set(0, -0.11, -0.01); pm.add(stem);
    this.phoneMount = pm;
    // retrovisor interior
    box(0.02, 0.06, 0.02, trim, 0, Y(1.46), -0.6);
    box(0.28, 0.08, 0.03, black, 0, Y(1.4), -0.6, 0.05, 0.12);
    const mm = this.mirrorRT ? new THREE.MeshBasicMaterial({ map: this.mirrorRT.texture, color: 0x9a9a9a }) : mat(0x2a3138, 0.05, 1);
    if (this.mirrorRT) { this.mirrorRT.texture.wrapS = THREE.RepeatWrapping; this.mirrorRT.texture.repeat.x = -1; }
    this.mirrorMesh = add(new THREE.PlaneGeometry(0.26, 0.067), mm, 0, Y(1.4), -0.584, 0.05, 0.12);
    this.mirrorPos = new THREE.Vector3(0, Y(1.4), -0.6);
    // para-brisas: vidro, gotas e limpa-vidros
    const wsG = new THREE.Group(); wsG.position.set(WS.cx, Y(WS.cy), WS.cz); wsG.rotation.x = WS.tilt; I.add(wsG);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(WS.w, WS.L), new THREE.MeshStandardMaterial({ color: 0x9fb4c4, roughness: 0.02, metalness: 1, transparent: true, opacity: 0.07, depthWrite: false }));
    wsG.add(glass);
    const drops = new THREE.Mesh(new THREE.PlaneGeometry(WS.w, WS.L), new THREE.MeshBasicMaterial({ map: this.dropT, transparent: true, depthWrite: false, opacity: 0.9 }));
    drops.position.z = 0.002; drops.renderOrder = 5; wsG.add(drops); this.dropMesh = drops;
    this.wipers = [];
    for (const px of [-0.5, 0.1]) {
      const piv = new THREE.Group(); piv.position.set(px, -WS.L / 2 + 0.035, 0.012); wsG.add(piv);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.012, 0.012), black); arm.position.x = 0.28; piv.add(arm);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.018, 0.016), black); blade.position.set(0.3, 0.014, 0.004); piv.add(blade);
      this.wipers.push({ piv, x: px, y: -WS.L / 2 + 0.035 });
    }
    // braços e mãos do condutor
    const sleeve = mat(0x2b3442, 0.9), skin = mat(0xd9a982, 0.6);
    this.arms = [];
    for (const s of [-1, 1]) {
      const up = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 1, 10), sleeve);
      const lo = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.036, 1, 10), sleeve);
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.05), skin);
      for (const m of [up, lo, hand]) { m.castShadow = true; I.add(m); }
      this.arms.push({ s, up, lo, hand });
    }
    // âncora do lugar traseiro direito
    this.seatAnchor = new THREE.Group(); this.seatAnchor.position.set(0.44, Y(0.47), 1.1); I.add(this.seatAnchor);
    this.head.position.copy(this.eye);
    this.lift = lift;
  }

  // posição no mundo de um ponto local do carro
  toWorld(x, y, z, out = new THREE.Vector3()) { return out.set(x, y, z).applyMatrix4(this.root.matrixWorld); }

  _orient(mesh, a, b) {
    const d = new THREE.Vector3().subVectors(b, a); const L = d.length();
    mesh.position.copy(a).addScaledVector(d, 0.5);
    mesh.scale.set(1, L, 1);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  }
  _updateArms() {
    this.wheelSpin.updateMatrixWorld(true); this.interior.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(this.interior.matrixWorld).invert();
    for (const a of this.arms) {
      const ang = a.s < 0 ? Math.PI - 0.25 : 0.25;
      const grip = new THREE.Vector3(Math.cos(ang) * 0.185, Math.sin(ang) * 0.185, 0.02).applyMatrix4(this.wheelSpin.matrixWorld).applyMatrix4(inv);
      const sh = new THREE.Vector3(-0.37 + a.s * 0.2, this.eye.y - 0.27, 0.3);
      const mid = sh.clone().lerp(grip, 0.5); mid.x += a.s * 0.12; mid.y -= 0.14; mid.z += 0.04;
      this._orient(a.up, sh, mid); this._orient(a.lo, mid, grip);
      a.hand.position.copy(grip); a.hand.quaternion.copy(this.wheel.quaternion);
      a.hand.rotateZ(this.wheelSpin.rotation.z + (a.s < 0 ? 0.3 : -0.3));
    }
  }

  look(dx, dy) {
    this.targetYaw = clamp(this.targetYaw - dx, -2.9, 2.9);
    this.targetPitch = clamp(this.targetPitch - dy, -0.75, 0.55);
  }
  recenter() { this.targetYaw = 0; this.targetPitch = -0.08; }

  update(dt, o) {
    // o: { speed, yawRate, accel, night, rain, steerHint }
    this.steer = damp(this.steer, clamp(o.yawRate * 2.2, -2.6, 2.6), 6, dt);
    if (this.wheelSpin) this.wheelSpin.rotation.z = this.steer;
    this.yaw = damp(this.yaw, this.targetYaw, 10, dt); this.pitch = damp(this.pitch, this.targetPitch, 10, dt);
    this.headYaw.rotation.y = this.yaw; this.headPitch.rotation.x = this.pitch;
    // balanço da cabeça com acelerações
    const tx = clamp(-o.yawRate * o.speed * 0.006, -0.05, 0.05), tz = clamp(-o.accel * 0.008, -0.04, 0.04);
    this.sway.x = damp(this.sway.x, tx, 4, dt); this.sway.z = damp(this.sway.z, tz, 4, dt);
    const bump = o.speed > 0.5 ? Math.sin(performance.now() * 0.023) * 0.0015 * Math.min(1, o.speed / 10) : 0;
    const lean = clamp(-this.yaw / 2.3, 0, 1) - clamp(this.yaw / 2.3, 0, 1) * 0.3;
    this.head.position.set(this.eye.x + this.sway.x + lean * 0.16, this.eye.y + bump + Math.abs(lean) * 0.03, this.eye.z + this.sway.z - Math.abs(lean) * 0.1);
    this.head.rotation.z = -this.sway.x * 0.6;
    this._updateArms();
    // luzes
    this.headL.intensity = o.night > 0.3 || o.fog > 0.4 ? 260 : 0;
    this.cabinL.intensity = (1 - o.night) * 1.1 + o.night * 0.3; this.cabinL.color.setHex(o.night > 0.5 ? 0x9fb6ff : 0xfff6ea);
    this.accentMat.emissiveIntensity = 0.25 + o.night * 1.4;
    // limpa-vidros
    this.wiperOn = o.rain > 0.15;
    const prev = this.wiperA;
    if (this.wiperOn || this.wiperA > 0.06) {
      const sp = (1.4 + o.rain * 1.6) * dt * 2;
      this.wiperA += this.wiperDir * sp;
      if (this.wiperA > 1.75) { this.wiperA = 1.75; this.wiperDir = -1; }
      if (this.wiperA < 0.05) { this.wiperA = 0.05; this.wiperDir = 1; }
    }
    for (const w of this.wipers) w.piv.rotation.z = this.wiperA;
    this._updateDrops(dt, o, prev);
  }

  _updateDrops(dt, o, prevA) {
    const rain = o.rain;
    if (rain > 0.05) {
      this._dropTimer += dt * rain * 90;
      while (this._dropTimer > 1) { this._dropTimer -= 1; if (this.drops.length < 260) this.drops.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8 }); }
    }
    const a0 = Math.min(prevA, this.wiperA), a1 = Math.max(prevA, this.wiperA);
    const flow = o.speed * 0.004 * dt;
    this.drops = this.drops.filter((d) => {
      d.y += flow * d.r; if (d.y > 1.02) return false;
      if (rain < 0.05) d.r -= dt * 0.25;
      if (d.r < 0.3) return false;
      if (a1 - a0 > 1e-4) {
        const px = d.x * WS.w - WS.w / 2, py = d.y * WS.L - WS.L / 2;
        for (const w of this.wipers) {
          const dx = px - w.x, dy = py - w.y; const dist = Math.hypot(dx, dy);
          if (dist < 0.6) { const ang = Math.atan2(dy, dx); if (ang >= a0 - 0.03 && ang <= a1 + 0.03) return false; }
        }
      }
      return true;
    });
    this._dropDraw = (this._dropDraw || 0) - dt;
    if (this._dropDraw <= 0) {
      this._dropDraw = 0.05;
      const x = this.dropX, W = 512, H = 256;
      x.clearRect(0, 0, W, H);
      for (const d of this.drops) {
        const cx = d.x * W, cy = (1 - d.y) * H, r = d.r * 2.2;
        const g = x.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
        g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.6, 'rgba(190,205,220,0.25)'); g.addColorStop(1, 'rgba(30,40,50,0.35)');
        x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, r, r * 1.15, 0, 0, Math.PI * 2); x.fill();
      }
      this.dropT.needsUpdate = true;
    }
  }

  renderMirror(renderer, scene, frame) {
    if (!this.mirrorRT || frame % (this.q === 'high' ? 2 : 3) !== 0) return;
    const cam = this.mirrorCam;
    this.toWorld(this.mirrorPos.x, this.mirrorPos.y, this.mirrorPos.z, cam.position);
    const fwd = this.toWorld(this.mirrorPos.x, this.mirrorPos.y - 0.03, this.mirrorPos.z + 10, new THREE.Vector3());
    cam.lookAt(fwd);
    this.mirrorMesh.visible = false;
    const prevT = renderer.getRenderTarget();
    renderer.setRenderTarget(this.mirrorRT); renderer.render(scene, cam); renderer.setRenderTarget(prevT);
    this.mirrorMesh.visible = true;
  }

  drawCluster(d) {
    const x = this.clusterX, W = 512, H = 192;
    const acc = '#' + new THREE.Color(this.def.accent).getHexString();
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05070b'); g.addColorStop(1, '#0c1119');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // velocidade
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = 'bold 84px Arial'; x.fillText(String(Math.round(d.speed)), W / 2, 86);
    x.font = '22px Arial'; x.fillStyle = '#8ea0b8'; x.fillText('km/h', W / 2, 140);
    // arco
    x.strokeStyle = '#1e2836'; x.lineWidth = 10; x.beginPath(); x.arc(W / 2, 100, 82, Math.PI * 0.8, Math.PI * 2.2); x.stroke();
    x.strokeStyle = acc; x.beginPath(); x.arc(W / 2, 100, 82, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * Math.min(1, d.speed / 90))); x.stroke();
    // combustível
    x.textAlign = 'left'; x.fillStyle = '#8ea0b8'; x.font = '18px Arial';
    x.fillText(d.energyIcon + ' ' + Math.round(d.fuelPct) + '%', 26, 40);
    x.fillStyle = '#1e2836'; x.fillRect(26, 58, 120, 10);
    x.fillStyle = d.fuelPct < 15 ? '#ff4d4d' : acc; x.fillRect(26, 58, 120 * d.fuelPct / 100, 10);
    x.fillStyle = '#8ea0b8'; x.fillText(d.odo, 26, 100);
    x.fillText(d.temp, 26, 130);
    // hora e mudança
    x.textAlign = 'right'; x.fillStyle = '#ffffff'; x.font = 'bold 26px Arial'; x.fillText(d.clock, W - 26, 42);
    x.font = 'bold 30px Arial'; x.fillStyle = acc; x.fillText(d.gear, W - 26, 96);
    x.font = '16px Arial'; x.fillStyle = d.online ? '#3ddc84' : '#8ea0b8'; x.fillText(d.online ? '● ONLINE' : '○ OFFLINE', W - 26, 136);
    // piscas
    const blink = Math.floor(performance.now() / 380) % 2 === 0;
    if (d.indicator && blink) {
      x.fillStyle = '#3ddc84'; x.beginPath();
      if (d.indicator === 'L') { x.moveTo(150, 30); x.lineTo(172, 16); x.lineTo(172, 44); } else { x.moveTo(362, 30); x.lineTo(340, 16); x.lineTo(340, 44); }
      x.fill();
    }
    if (d.warn) { x.fillStyle = '#ffb020'; x.font = 'bold 18px Arial'; x.textAlign = 'center'; x.fillText(d.warn, W / 2, 175); }
    this.clusterT.needsUpdate = true;
  }
  drawPhone(d) {
    const x = this.phoneX, W = 160, H = 320;
    x.fillStyle = '#07090d'; x.fillRect(0, 0, W, H);
    x.fillStyle = d.online ? '#0f3d24' : '#20242c'; x.fillRect(0, 0, W, 60);
    x.fillStyle = '#fff'; x.font = 'bold 18px Arial'; x.textAlign = 'center';
    x.fillText(d.online ? 'ONLINE' : 'OFFLINE', W / 2, 38);
    x.font = 'bold 26px Arial'; x.fillText(d.earn, W / 2, 110);
    x.font = '13px Arial'; x.fillStyle = '#9aa'; x.fillText('ganhos hoje', W / 2, 132);
    if (d.status) { x.fillStyle = d.flash ? '#ffcc33' : '#4aa3ff'; x.fillRect(10, 160, W - 20, 70); x.fillStyle = '#000'; x.font = 'bold 15px Arial'; wrap(x, d.status, W / 2, 185, W - 30, 18); }
    x.fillStyle = '#9aa'; x.font = '14px Arial'; x.fillText(d.clock, W / 2, 290);
    this.phoneT.needsUpdate = true;
  }
}
function wrap(x, text, cx, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { x.fillText(line, cx, y); y += lh; line = w; } else line = t; }
  if (line) x.fillText(line, cx, y);
}
