// HUD: barra superior, navegação, minimapa, notificações, diálogos, decisões e janelas.
import { esc, hhmm } from '../util.js';

const $ = (id) => document.getElementById(id);

export class HUD {
  constructor() {
    this.el = { hud: $('hud'), toasts: $('toasts'), dialog: $('dialog'), say: $('say'), modal: $('modal'), fade: $('fade'), cel: $('celebrate'),
      clock: $('clockPill'), status: $('statusPill'), money: $('moneyPill'), nav: $('nav'), action: $('actionBtn'), actionWrap: $('actionWrap'),
      minimap: $('minimap'), phoneBtn: $('phoneBtn'), reqMini: $('reqMini') };
    this._dlg = null; this._modalStack = 0; this._sayT = null; this.getTime = () => 0;
  }
  get modalOpen() { return !this.el.modal.classList.contains('hidden') || !!this._dlg; }

  toast(icon, title, body) {
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = `<div class="ic">${icon}</div><div><b>${esc(title)}</b><span>${esc(body || '')}</span></div>`;
    this.el.toasts.prepend(t);
    while (this.el.toasts.children.length > 3) this.el.toasts.lastChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 4800);
  }
  say(name, text, img, sec = 3.5) {
    const s = this.el.say;
    s.innerHTML = `${img ? `<img src="${img}">` : ''}<div>${name ? `<b>${esc(name)}:</b>` : ''}${esc(text)}</div>`;
    s.classList.remove('hidden');
    clearTimeout(this._sayT); this._sayT = setTimeout(() => s.classList.add('hidden'), sec * 1000);
  }
  dialog({ name, img, text, sys, choices, timeout = 14, onChoose }) {
    this.closeDialog(true);
    const d = this.el.dialog; this.el.say.classList.add('hidden');
    d.innerHTML = `<div class="dlg-head">${sys ? '<div class="sysic">⚠️</div>' : img ? `<img src="${img}">` : ''}<div><div class="who">${esc(name)}</div><div class="line">${esc(text)}</div></div></div>
      <div class="dlg-choices">${choices.map((c, i) => `<button data-i="${i}"><span class="k">${i + 1}</span><span>${esc(c)}</span></button>`).join('')}</div>
      <div class="dlg-timer"><i></i></div>`;
    d.classList.remove('hidden');
    const bar = d.querySelector('.dlg-timer i');
    requestAnimationFrame(() => { bar.style.transitionDuration = timeout + 's'; bar.style.width = '0%'; });
    const done = (i, to) => { if (!this._dlg) return; const cb = this._dlg.cb; this.closeDialog(true); cb(i, to); };
    this._dlg = { cb: onChoose, n: choices.length, timer: setTimeout(() => done(-1, true), timeout * 1000), done };
    d.querySelectorAll('button').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); done(+b.dataset.i, false); }));
  }
  choose(i) { if (this._dlg && i < this._dlg.n) this._dlg.done(i, false); }
  closeDialog(silent = false) {
    if (this._dlg) { clearTimeout(this._dlg.timer); this._dlg = null; }
    this.el.dialog.classList.add('hidden'); void silent;
  }
  // janela de decisão / informação
  modal(html, buttons = [], { dismiss = false } = {}) {
    const m = this.el.modal;
    m.innerHTML = `<div class="mbox">${html}<div class="mbtns" style="margin-top:14px">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div></div>`;
    m.classList.remove('hidden');
    m.querySelectorAll('.mbtns button').forEach((el) => el.addEventListener('click', (e) => {
      e.stopPropagation(); const b = buttons[+el.dataset.i];
      if (!b.keep) this.closeModal();
      if (b.fn) b.fn();
    }));
    m.onclick = dismiss ? (e) => { if (e.target === m) this.closeModal(); } : null;
    return m;
  }
  closeModal() { this.el.modal.classList.add('hidden'); this.el.modal.innerHTML = ''; }
  decide({ title, icon, text, img, options }) {
    const html = `${img ? `<div class="imgrow"><img src="${img}"><div><h2>${esc(title)}</h2></div></div>` : `<div class="icon">${icon || '❓'}</div><h2>${esc(title)}</h2>`}<p>${esc(text)}</p>`;
    this.modal(html, options.map((o) => ({ label: esc(o.label), cls: o.danger ? 'danger' : '', fn: o.fn })));
  }
  fade(label, sec) {
    const f = this.el.fade; f.innerHTML = `<div class="clock" id="fadeClock">${hhmm(this.getTime())}</div><div>${esc(label)}</div>`;
    f.classList.remove('hidden');
    const iv = setInterval(() => { const c = document.getElementById('fadeClock'); if (c) c.textContent = hhmm(this.getTime()); }, 80);
    setTimeout(() => { clearInterval(iv); f.classList.add('hidden'); }, sec * 1000);
  }
  celebrate(title, sub) {
    const c = this.el.cel; c.innerHTML = `<b>${esc(title)}</b><span>${esc(sub || '')}</span>`;
    c.classList.remove('hidden'); clearTimeout(this._celT);
    this._celT = setTimeout(() => c.classList.add('hidden'), 2800);
  }
  setAction(label, cls, fn) {
    const b = this.el.action;
    if (!label) { this.el.actionWrap.classList.add('hidden'); this._actFn = null; return; }
    this.el.actionWrap.classList.remove('hidden');
    if (b.textContent !== label) b.textContent = label;
    b.className = cls || ''; this._actFn = fn;
    if (!b._bound) { b._bound = true; b.addEventListener('click', (e) => { e.stopPropagation(); if (this._actFn) this._actFn(); }); }
  }
}
