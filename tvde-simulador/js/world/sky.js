// Céu procedimental, sol/lua, nevoeiro, chuva e mapa de ambiente (reflexos).
import * as THREE from 'three';
import { clamp, lerp, smooth } from '../util.js';
import { shared } from './materials.js';

const skyVert = `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`;
const skyFrag = `
uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSunDir; uniform vec3 uSunColor; uniform vec3 uFogColor;
uniform float uCloud; uniform float uTime; uniform float uNight; uniform float uFog; uniform float uSunVis;
varying vec3 vDir;
float h13(vec3 p){ p = fract(p*0.1031); p += dot(p, p.yzx+33.33); return fract((p.x+p.y)*p.z); }
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h12(i),h12(i+vec2(1,0)),f.x), mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0.0, a=0.5; for(int i=0;i<5;i++){ s+=a*vn(p); p*=2.03; a*=0.5; } return s; }
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uTop, pow(clamp(h,0.0,1.0), 0.5));
  col = mix(col, uHorizon*0.55, smoothstep(0.0,-0.2,h));
  float sd = max(dot(d, uSunDir), 0.0);
  col += uSunColor * (pow(sd, 1400.0)*40.0*uSunVis + pow(sd, 10.0)*0.28 + pow(sd,3.0)*0.08) * (1.0-uCloud*0.85);
  if (h > 0.0) {
    vec3 p = floor(d*420.0); float s = h13(p);
    col += step(0.9982, s) * uNight * (1.0-uCloud) * vec3(0.95) * (0.6+0.4*sin(uTime*3.0+s*90.0));
    vec2 uv = d.xz/(h+0.1)*1.6 + vec2(uTime*0.004, uTime*0.0015);
    float n = fbm(uv);
    float c = smoothstep(0.62-uCloud*0.5, 0.95-uCloud*0.35, n) * smoothstep(0.0, 0.12, h);
    vec3 cc = mix(uHorizon*1.05, vec3(1.0), 0.45*(1.0-uNight)) * (0.55 + 0.45*(1.0-uCloud));
    cc += uSunColor*pow(sd,6.0)*0.4*(1.0-uCloud);
    col = mix(col, cc, c*0.92);
  }
  col = mix(col, uFogColor, clamp(uFog*(1.0-smoothstep(-0.05, 0.45, h)) + uFog*0.4, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const C = (h) => new THREE.Color(h);
const PAL = {
  night: { top: C('#03060f'), hor: C('#0d1526'), sun: C('#8ea4d8') },
  twi: { top: C('#1a2245'), hor: C('#d9774a'), sun: C('#ff8a4a') },
  gold: { top: C('#3e6fb2'), hor: C('#f0b383'), sun: C('#ffc27a') },
  day: { top: C('#2a68c0'), hor: C('#a9c9e6'), sun: C('#fff3e0') },
};

export const WEATHERS = {
  limpo: { label: 'Céu limpo', icon: '☀️', cloud: 0.12, rain: 0, fog: 0 },
  nublado: { label: 'Nublado', icon: '☁️', cloud: 0.78, rain: 0, fog: 0.08 },
  chuva: { label: 'Chuva', icon: '🌧️', cloud: 0.95, rain: 1, fog: 0.22 },
  nevoeiro: { label: 'Nevoeiro', icon: '🌫️', cloud: 0.6, rain: 0, fog: 1 },
};

export class Environment {
  constructor(renderer, scene, quality) {
    this.renderer = renderer; this.scene = scene; this.q = quality;
    this.sun = new THREE.DirectionalLight(0xffffff, 3);
    this.sun.castShadow = quality !== 'low';
    const sz = quality === 'high' ? 2048 : 1024;
    this.sun.shadow.mapSize.set(sz, sz);
    const sc = this.sun.shadow.camera; sc.left = -75; sc.right = 75; sc.top = 75; sc.bottom = -75; sc.near = 1; sc.far = 500;
    this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.05;
    scene.add(this.sun, this.sun.target);
    this.hemi = new THREE.HemisphereLight(0xbfd8ff, 0x4a4238, 1.0); scene.add(this.hemi);

    this.skyU = {
      uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color() }, uFogColor: { value: new THREE.Color() }, uCloud: { value: 0 }, uTime: shared.uTime,
      uNight: { value: 0 }, uFog: { value: 0 }, uSunVis: { value: 1 },
    };
    const skyMat = new THREE.ShaderMaterial({ uniforms: this.skyU, vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false, fog: false });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), skyMat);
    this.sky.renderOrder = -10; this.sky.frustumCulled = false;
    scene.add(this.sky);
    scene.fog = new THREE.FogExp2(0xa0b0c0, 0.002);

    // cena só com o céu para gerar o mapa de ambiente
    this.envScene = new THREE.Scene();
    this.envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat));
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.envRT = null; this._envTimer = 0; this._lastEnvKey = '';

    // chuva
    const N = quality === 'low' ? 900 : quality === 'med' ? 1600 : 2600;
    this.rainN = N;
    const pos = new Float32Array(N * 6);
    this.rainData = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) { this.rainData[i * 4] = (Math.random() - 0.5) * 70; this.rainData[i * 4 + 1] = Math.random() * 30; this.rainData[i * 4 + 2] = (Math.random() - 0.5) * 70; this.rainData[i * 4 + 3] = 18 + Math.random() * 8; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xaabbcc, transparent: true, opacity: 0.35, depthWrite: false }));
    this.rain.frustumCulled = false; this.rain.visible = false; scene.add(this.rain);

    this.state = { cloud: 0.1, rain: 0, fog: 0 };
    this.night = 0; this.sunElev = 0;
    this.out = {};
  }

  // tMin: minutos desde a meia-noite do dia (pode passar de 1440)
  compute(tMin, w) {
    const hour = (tMin / 60) % 24;
    const dayLen = 14.2, rise = 6.1;
    let el;
    const hh = hour < rise - 6 ? hour + 24 : hour;
    if (hh >= rise && hh <= rise + dayLen) el = Math.sin(Math.PI * (hh - rise) / dayLen) * 62;
    else { const nt = hh > rise + dayLen ? hh - (rise + dayLen) : hh + 24 - (rise + dayLen); el = -Math.sin(Math.PI * clamp(nt / (24 - dayLen), 0, 1)) * 40; }
    const az = Math.PI * clamp((hh - rise) / dayLen, -0.2, 1.2);
    const er = THREE.MathUtils.degToRad(el);
    const sunDir = new THREE.Vector3(Math.cos(az) * Math.cos(er), Math.sin(er), Math.sin(az) * Math.cos(er) * 0.6 + 0.4 * Math.cos(er)).normalize();
    let top = new THREE.Color(), hor = new THREE.Color(), sc = new THREE.Color();
    const mix3 = (a, b, t) => { top.copy(a.top).lerp(b.top, t); hor.copy(a.hor).lerp(b.hor, t); sc.copy(a.sun).lerp(b.sun, t); };
    if (el < -8) mix3(PAL.night, PAL.night, 0);
    else if (el < 1) mix3(PAL.night, PAL.twi, smooth(-8, 1, el));
    else if (el < 10) mix3(PAL.twi, PAL.gold, smooth(1, 10, el));
    else mix3(PAL.gold, PAL.day, smooth(10, 24, el));
    const night = smooth(3, -7, el);
    const ov = w.cloud;
    const grey = new THREE.Color(0.48, 0.52, 0.57).multiplyScalar(lerp(1, 0.08, night));
    top.lerp(grey, ov * 0.85); hor.lerp(grey.clone().multiplyScalar(1.25), ov * 0.8);
    const fogCol = hor.clone().lerp(new THREE.Color(0.62, 0.66, 0.7).multiplyScalar(lerp(1, 0.12, night)), w.fog * 0.7);
    return { el, sunDir, top, hor, sc, night, fogCol, hour };
  }

  update(dt, tMin, target, camPos, focus) {
    // aproximar a meteorologia do alvo
    const k = 1 - Math.exp(-dt * 0.06);
    for (const key of ['cloud', 'rain', 'fog']) this.state[key] = lerp(this.state[key], target[key], k);
    const w = this.state;
    const o = this.compute(tMin, w);
    this.out = o; this.night = o.night; this.sunElev = o.el;
    const U = this.skyU;
    U.uTop.value.copy(o.top); U.uHorizon.value.copy(o.hor); U.uSunDir.value.copy(o.el > -6 ? o.sunDir : new THREE.Vector3(-0.4, 0.6, -0.5).normalize());
    U.uSunColor.value.copy(o.sc); U.uCloud.value = w.cloud; U.uNight.value = o.night; U.uFog.value = w.fog * 0.85;
    U.uFogColor.value.copy(o.fogCol); U.uSunVis.value = o.el > -6 ? 1 : 0.15;
    this.sky.position.copy(camPos);

    const dayK = smooth(-3, 8, o.el);
    const sunI = 3.4 * dayK * (1 - 0.78 * w.cloud) + (1 - dayK) * 0.18;
    this.sun.intensity = sunI;
    this.sun.color.copy(o.el > -3 ? o.sc : new THREE.Color(0.55, 0.65, 0.9));
    const ld = o.el > -3 ? o.sunDir : new THREE.Vector3(-0.4, 0.75, -0.5).normalize();
    this.sun.position.copy(focus).addScaledVector(ld, 180);
    this.sun.target.position.copy(focus);
    // brilho da cidade à noite
    const skyC = o.top.clone().lerp(o.hor, 0.5);
    this.hemi.color.copy(skyC).lerp(new THREE.Color(1.0, 0.72, 0.45), o.night * 0.45);
    this.hemi.groundColor.set(0x3d362e).multiplyScalar(lerp(1, 0.4, o.night));
    this.hemi.intensity = lerp(1.15, 0.55, o.night) * (1 + w.cloud * 0.2);
    const f = this.scene.fog;
    f.color.copy(o.fogCol);
    f.density = 0.0014 + w.rain * 0.0035 + w.fog * 0.02 + o.night * 0.0006;
    shared.uNight.value = o.night;

    // chuva
    this.rain.visible = w.rain > 0.05;
    if (this.rain.visible) {
      this.rain.material.opacity = 0.32 * w.rain * (1 - o.night * 0.4);
      const P = this.rain.geometry.attributes.position.array; const D = this.rainData;
      const count = Math.floor(this.rainN * clamp(w.rain, 0, 1));
      for (let i = 0; i < this.rainN; i++) {
        let y = D[i * 4 + 1] - D[i * 4 + 3] * dt;
        if (y < 0) y += 30;
        D[i * 4 + 1] = y;
        const x = camPos.x + D[i * 4], z = camPos.z + D[i * 4 + 2], yy = camPos.y - 8 + y;
        const vis = i < count;
        P[i * 6] = x; P[i * 6 + 1] = vis ? yy : -100; P[i * 6 + 2] = z;
        P[i * 6 + 3] = x + 0.05; P[i * 6 + 4] = vis ? yy + 0.7 : -100; P[i * 6 + 5] = z + 0.08;
      }
      this.rain.geometry.attributes.position.needsUpdate = true;
    }

    // mapa de ambiente
    this._envTimer -= dt;
    const key = Math.round(o.el / 3) + ':' + Math.round(w.cloud * 6) + ':' + Math.round(w.fog * 4);
    if (this._envTimer <= 0 && key !== this._lastEnvKey) {
      this._envTimer = 2; this._lastEnvKey = key;
      const rt = this.pmrem.fromScene(this.envScene, 0, 0.1, 500);
      if (this.envRT) this.envRT.dispose();
      this.envRT = rt; this.scene.environment = rt.texture;
      this.scene.environmentIntensity = lerp(0.9, 0.35, o.night);
    }
    return o;
  }
}
