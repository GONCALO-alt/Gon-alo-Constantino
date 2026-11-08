import { CFG } from './config.js';

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const rr = (a, b, r = Math.random) => a + (b - a) * r();
export const ri = (a, b, r = Math.random) => Math.floor(a + (b - a + 1) * r());
export const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
export const chance = (p, r = Math.random) => r() < p;
export function weighted(items, wfn, r = Math.random) {
  let tot = 0; const ws = items.map((it) => { const w = Math.max(0, wfn(it)); tot += w; return w; });
  if (tot <= 0) return items[Math.floor(r() * items.length)];
  let x = r() * tot;
  for (let i = 0; i < items.length; i++) { x -= ws[i]; if (x <= 0) return items[i]; }
  return items[items.length - 1];
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export function smooth(e0, e1, x) { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
export function damp(cur, target, rate, dt) { return lerp(cur, target, 1 - Math.exp(-rate * dt)); }

export function eur(v, sign = false) {
  const s = Math.abs(v).toFixed(2).replace('.', ',');
  return (v < 0 ? '−' : sign && v > 0 ? '+' : '') + s + ' €';
}
export function hhmm(min) {
  min = Math.floor(min);
  const h = Math.floor(min / 60) % 24, m = ((min % 60) + 60) % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
export const toKm = (wm) => (wm * CFG.DIST_SCALE) / 1000;
export const kmStr = (wm) => toKm(wm).toFixed(1).replace('.', ',') + ' km';
export const etaMin = (wm, speed = 8) => (wm / speed) * CFG.TIME_SCALE / 60;
export function dur(min) {
  min = Math.max(0, Math.round(min));
  if (min < 60) return min + ' min';
  return Math.floor(min / 60) + ' h ' + String(min % 60).padStart(2, '0') + ' min';
}
export const WEEKDAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
export const weekday = (day) => WEEKDAYS[(day - 1) % 7];
export const isWeekend = (day) => ((day - 1) % 7) >= 4; // sexta à noite conta como fim de semana
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function stars(r) {
  const n = Math.round(r);
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Pequeno emissor de eventos
export class Emitter {
  constructor() { this._h = {}; }
  on(ev, fn) { (this._h[ev] ||= []).push(fn); return () => this.off(ev, fn); }
  off(ev, fn) { this._h[ev] = (this._h[ev] || []).filter((f) => f !== fn); }
  emit(ev, ...a) { (this._h[ev] || []).forEach((f) => f(...a)); }
}
