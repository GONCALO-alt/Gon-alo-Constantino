// Texturas procedimentais (canvas) e materiais partilhados.
import * as THREE from 'three';

export const shared = { uNight: { value: 0 }, uTime: { value: 0 } };

export function makeCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
function noise(ctx, w, h, amt) {
  const id = ctx.getImageData(0, 0, w, h); const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amt;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(id, 0, 0);
}
export function canvasTex(c, repeat = true, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// Estrada: 12 m de largura (u) por 24 m de comprimento (v)
export function makeRoadTexture() {
  const [c, x] = makeCanvas(256, 512);
  x.fillStyle = '#3b3c3f'; x.fillRect(0, 0, 256, 512);
  noise(x, 256, 512, 34);
  // desgaste dos pneus
  x.fillStyle = 'rgba(20,20,22,0.18)';
  for (const u of [3, 9]) { x.fillRect((u - 1.1) / 12 * 256, 0, 0.6 / 12 * 256, 512); x.fillRect((u + 0.5) / 12 * 256, 0, 0.6 / 12 * 256, 512); }
  // remendos
  for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '30,30,32' : '70,70,72'},0.25)`; x.fillRect(Math.random() * 230, Math.random() * 490, 10 + Math.random() * 40, 10 + Math.random() * 30); }
  x.fillStyle = '#e8e6df';
  x.fillRect(0.45 / 12 * 256, 0, 3, 512);
  x.fillRect(256 - 0.45 / 12 * 256 - 3, 0, 3, 512);
  for (let v = 0; v < 512; v += 256) x.fillRect(126, v + 40, 4, 86);
  return canvasTex(c);
}
export function makeAsphaltTexture() {
  const [c, x] = makeCanvas(256, 256);
  x.fillStyle = '#3a3b3e'; x.fillRect(0, 0, 256, 256);
  noise(x, 256, 256, 34);
  return canvasTex(c);
}
export function makeCrosswalkTexture() {
  const [c, x] = makeCanvas(256, 64);
  x.clearRect(0, 0, 256, 64);
  x.fillStyle = 'rgba(235,233,226,0.92)';
  for (let k = 0; k < 12; k++) x.fillRect(k * 21.33 + 5, 2, 11, 60);
  return canvasTex(c, false);
}
// Calçada portuguesa clara
export function makeSidewalkTexture() {
  const [c, x] = makeCanvas(256, 256);
  x.fillStyle = '#b9b6ae'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) {
    const g = 165 + Math.random() * 60;
    x.fillStyle = `rgb(${g},${g - 3},${g - 8})`;
    const s = 4 + Math.random() * 4;
    x.fillRect(Math.random() * 256, Math.random() * 256, s, s * (0.7 + Math.random() * 0.6));
  }
  // ondas escuras (calçada)
  x.strokeStyle = 'rgba(60,60,62,0.55)'; x.lineWidth = 6;
  x.beginPath();
  for (let u = 0; u <= 256; u += 4) x.lineTo(u, 128 + Math.sin(u / 256 * Math.PI * 2) * 40);
  x.stroke();
  noise(x, 256, 256, 18);
  return canvasTex(c);
}
export function makeCobbleTexture() {
  const [c, x] = makeCanvas(256, 256);
  x.fillStyle = '#5c5850'; x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 16; r++) for (let k = 0; k < 16; k++) {
    const g = 105 + Math.random() * 45; x.fillStyle = `rgb(${g},${g - 4},${g - 12})`;
    const ox = (r % 2) * 8;
    x.beginPath(); x.ellipse(k * 16 + ox + 8, r * 16 + 8, 7, 6.5, Math.random(), 0, Math.PI * 2); x.fill();
  }
  noise(x, 256, 256, 20);
  return canvasTex(c);
}
export function makeGrassTexture() {
  const [c, x] = makeCanvas(256, 256);
  x.fillStyle = '#4c6b34'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    const g = Math.random();
    x.fillStyle = `rgba(${60 + g * 40},${90 + g * 50},${40 + g * 20},0.6)`;
    x.fillRect(Math.random() * 256, Math.random() * 256, 2, 3);
  }
  return canvasTex(c);
}
export function makeGlowTexture(inner = 'rgba(255,220,170,1)') {
  const [c, x] = makeCanvas(128, 128);
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner); g.addColorStop(0.25, inner.replace(',1)', ',0.55)'));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return canvasTex(c, false);
}

// Letreiros (texto num canvas)
export function makeSignTexture(lines, { bg = '#0b2a4a', fg = '#ffffff', w = 512, h = 128, font = 'bold', border = null, neon = false } = {}) {
  const [c, x] = makeCanvas(w, h);
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); } else x.clearRect(0, 0, w, h);
  if (border) { x.strokeStyle = border; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8); }
  x.textAlign = 'center'; x.textBaseline = 'middle';
  const n = lines.length;
  lines.forEach((ln, i) => {
    const size = Math.min(h / n * (i === 0 ? 0.62 : 0.42), (w * 1.7) / Math.max(4, ln.length));
    x.font = `${font} ${size}px "Helvetica Neue", Arial, sans-serif`;
    if (neon) { x.shadowColor = fg; x.shadowBlur = 18; }
    x.fillStyle = fg;
    x.fillText(ln, w / 2, (h / n) * (i + 0.5));
  });
  return canvasTex(c, false);
}

// Material dos edifícios: janelas procedimentais em shader (acendem de noite)
export function makeBuildingMaterial() {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.88, metalness: 0.0 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uNight = shared.uNight;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec3 aParams;
        varying vec3 vParams; varying vec3 vLocal; varying vec3 vScale; varying vec3 vWN;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vParams = aParams;
        #ifdef USE_INSTANCING
          vec3 bSc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
          mat3 bIm = mat3(instanceMatrix);
        #else
          vec3 bSc = vec3(1.0); mat3 bIm = mat3(1.0);
        #endif
        vScale = bSc; vLocal = position * bSc;
        vWN = normalize(mat3(modelMatrix) * bIm * normal);`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uNight;
        varying vec3 vParams; varying vec3 vLocal; varying vec3 vScale; varying vec3 vWN;
        float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 nW = normalize(vWN);
        float wType = vParams.x; float seed = vParams.y;
        float isSide = 1.0 - step(0.5, abs(nW.y));
        bool xFace = abs(nW.x) > 0.5;
        float hor = xFace ? vLocal.z : vLocal.x;
        float wid = xFace ? vScale.z : vScale.x;
        float fh = wType < 0.5 ? 3.6 : (wType < 1.5 ? 3.3 : 3.0);
        float ww = wType < 0.5 ? 1.7 : (wType < 1.5 ? 3.1 : 2.5);
        float nx = max(1.0, floor(wid / ww)); float cw = wid / nx;
        float uu = (hor + wid * 0.5) / cw; float fu = fract(uu);
        float yy = vLocal.y; float fv = fract(yy / fh);
        vec2 cid = vec2(floor(uu) + (floor(nW.x * 1.5 + 0.5) * 7.0 + floor(nW.z * 1.5 + 0.5) * 3.0) * 17.0 + floor(seed * 10.0), floor(yy / fh));
        float winMask = 0.0;
        if (wType < 0.5) winMask = step(0.05, fu) * step(fu, 0.95) * step(0.1, fv) * step(fv, 0.93);
        else if (wType < 2.5) { float wx = wType < 1.5 ? 0.22 : 0.3; winMask = step(wx, fu) * step(fu, 1.0 - wx) * step(0.3, fv) * step(fv, 0.82); }
        float shop = (vParams.z > 0.5 && yy < 3.8 && yy > 0.3 && fu > 0.06 && fu < 0.94) ? 1.0 : 0.0;
        winMask *= step(yy, vScale.y - 1.1) * step(wType < 0.5 ? 0.4 : 3.9 * vParams.z + 0.6, yy);
        winMask = max(winMask, shop) * isSide;
        float hh = h12(cid * 0.731 + vec2(seed * 1.37, seed * 0.53));
        float lit = step(1.0 - (0.12 + 0.5 * uNight), hh) * uNight;
        vec3 glass = wType < 0.5 ? mix(vec3(0.10, 0.14, 0.19), diffuseColor.rgb * 0.5, 0.35) : vec3(0.07, 0.09, 0.12);
        if (wType > 1.5 && wType < 2.5 && hh > 0.55) glass = vec3(0.16, 0.13, 0.11); // persianas
        diffuseColor.rgb = mix(diffuseColor.rgb, glass, winMask);
        if (nW.y > 0.5) diffuseColor.rgb *= 0.55;
        diffuseColor.rgb *= 0.86 + 0.14 * smoothstep(0.0, 5.0, yy);
        vec3 warm = hh > 0.75 ? vec3(0.75, 0.86, 1.0) : vec3(1.0, 0.78, 0.5);
        vec3 winEmit = winMask * (lit * warm * 1.05 + shop * uNight * vec3(1.0, 0.85, 0.6) * 1.1);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.08, winMask);`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
        metalnessFactor = mix(metalnessFactor, 0.85, winMask);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += winEmit;`);
  };
  return m;
}
