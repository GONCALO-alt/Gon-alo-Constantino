// Controla o passageiro no mundo: espera no passeio, caminha até ao carro, senta-se e sai.
import * as THREE from 'three';
import { Human } from '../world/human.js';

export class PaxActor {
  constructor(scene, car) { this.scene = scene; this.car = car; this.h = null; this.state = 'none'; this.fade = 0; }
  get present() { return !!this.h; }
  spawn(look, pos, faceTo) {
    this.remove();
    this.h = new Human(look);
    this.h.root.position.copy(pos);
    if (faceTo) this.h.root.rotation.y = Math.atan2(-(faceTo.x - pos.x), -(faceTo.z - pos.z));
    this.scene.add(this.h.root);
    this.state = 'stand'; this.h.setMode('stand');
  }
  wave(on) { if (this.h && this.state === 'stand') this.h.setMode(on ? 'wave' : 'stand'); }
  walkTo(target, cb, speed = 1.5) {
    if (!this.h) return;
    if (this.state === 'seated') this._unseat(target);
    this.target = target.clone(); this.cb = cb; this.speed = speed; this.state = 'walk'; this.h.setMode('walk');
  }
  seat() {
    if (!this.h) return;
    const r = this.h.root; this.scene.remove(r);
    this.car.seatAnchor.add(r);
    r.position.set(0, -0.92 * (this.h.look.height || 1) * 0.93 + 0.05, 0); r.rotation.set(0, 0, 0); r.scale.setScalar(0.93);
    this.h.setMode('sit'); this.state = 'seated';
  }
  _unseat(at) {
    const r = this.h.root; this.car.seatAnchor.remove(r);
    const door = this.car.toWorld(1.3, 0, 0.9);
    r.position.copy(door); r.position.y = 0.16; r.rotation.set(0, 0, 0); r.scale.setScalar(1);
    this.scene.add(r); void at;
  }
  exitTo(away, cb) {
    if (!this.h) { if (cb) cb(); return; }
    this.walkTo(away, () => { this.state = 'fading'; this.fade = 1; this.h.setMode('walk'); this._fadeCb = cb; this.target = away.clone().add(new THREE.Vector3((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20)); }, 1.4);
  }
  say(sec = 3) { if (this.h) this.h.talk = sec; }
  remove() {
    if (!this.h) return;
    this.h.root.parent?.remove(this.h.root); this.h.dispose(); this.h = null; this.state = 'none';
  }
  update(dt) {
    if (!this.h) return;
    this.h.update(dt);
    if (this.state === 'walk' || this.state === 'fading') {
      const r = this.h.root; const d = new THREE.Vector3().subVectors(this.target, r.position); d.y = 0;
      const L = d.length();
      if (L > 0.05) { r.rotation.y = Math.atan2(-d.x, -d.z); r.position.addScaledVector(d.normalize(), Math.min(L, this.speed * dt)); }
      r.position.y = 0.16;
      if (this.state === 'fading') {
        this.fade -= dt * 0.5; this.h.setOpacity(Math.max(0, this.fade));
        if (this.fade <= 0) { const cb = this._fadeCb; this.remove(); if (cb) cb(); }
      } else if (L < 0.25) { this.state = 'stand'; this.h.setMode('stand'); const cb = this.cb; this.cb = null; if (cb) cb(); }
    }
  }
}
