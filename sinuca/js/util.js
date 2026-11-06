'use strict';
/* Utilitários partilhados: números, aleatório com semente, armazenamento seguro e ajudas de DOM. */
const U = {
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  lerp(a, b, t) { return a + (b - a) * t; },
  rand(a, b) { return a + Math.random() * (b - a); },
  randi(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  pick(arr, rnd = Math.random) { return arr[Math.floor(rnd() * arr.length)]; },
  gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  },
  /* Gerador determinístico (mulberry32) para desafios diários e classificações. */
  seeded(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  },
  todayKey(d = new Date()) {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  },
  shuffle(arr, rnd = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  load(key, def) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  },
  save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* armazenamento indisponível */ }
  },
  fmt(n) { return Math.round(n).toLocaleString('pt-PT'); },
  hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  },
  rgbToHex(r, g, b) {
    const c = v => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
  },
  /* f > 0 clareia, f < 0 escurece. */
  shade(hex, f) {
    const [r, g, b] = U.hexToRgb(hex);
    if (f >= 0) return U.rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
    return U.rgbToHex(r * (1 + f), g * (1 + f), b * (1 + f));
  },
  el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'text') e.textContent = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) e.style.setProperty(sk, v[sk]); else e.style[sk] = v[sk]; } }
        else e.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const k of kids.flat(Infinity)) {
      if (k == null || k === false) continue;
      e.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k);
    }
    return e;
  },
  fill(str, obj) { return str.replace(/\{(\w+)\}/g, (_, k) => (obj[k] != null ? obj[k] : '')); },
};
