/* KART MENTAL PRO — núcleo: utilitários, armazenamento, som, voz e gráficos. */
(function () {
  'use strict';
  const KMP = (window.KMP = window.KMP || {});

  /* ---------- Utilitários ---------- */
  const U = (KMP.u = {});
  U.$ = (sel, root) => (root || document).querySelector(sel);
  U.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randint = (a, b) => Math.floor(U.rand(a, b + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
  U.esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  U.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  /** Pontuação linear: valor "bom" dá 100, valor "mau" dá 0. */
  U.scale = (v, good, bad) => Math.round(U.clamp(((v - bad) / (good - bad)) * 100, 0, 100));

  U.h = function (html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  /* Datas (sempre na hora local) */
  U.ymd = (d) => {
    d = d ? new Date(d) : new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  U.parseYmd = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  U.addDays = (s, n) => {
    const d = U.parseYmd(s);
    d.setDate(d.getDate() + n);
    return U.ymd(d);
  };
  U.diffDays = (a, b) => Math.round((U.parseYmd(b) - U.parseYmd(a)) / 86400000);
  U.WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  U.WD_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  U.MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  U.fmtDate = (s) => {
    const d = U.parseYmd(s);
    return d.getDate() + ' ' + U.MONTHS[d.getMonth()];
  };
  U.fmtDateTime = (ts) => {
    const d = new Date(ts);
    return d.getDate() + ' ' + U.MONTHS[d.getMonth()] + ' · ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  /** Segunda-feira da semana de uma data (chave da semana). */
  U.weekStart = (s) => {
    const d = U.parseYmd(s);
    const wd = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - wd);
    return U.ymd(d);
  };
  U.fmtDur = (ms) => {
    const totalMin = Math.round(ms / 60000);
    if (ms < 60000) return Math.round(ms / 1000) + ' s';
    if (totalMin < 60) return totalMin + ' min';
    return Math.floor(totalMin / 60) + ' h ' + String(totalMin % 60).padStart(2, '0') + ' min';
  };
  U.fmtSec = (ms) => (ms / 1000).toFixed(2).replace('.', ',') + ' s';
  U.fmtClock = (ms) => {
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  U.pct = (x) => (x == null ? '—' : Math.round(x * 100) + '%');
  U.num = (x, dec) => (x == null ? '—' : Number(x).toFixed(dec || 0).replace('.', ','));

  /* ---------- Âmbito: temporizadores que se cancelam ao sair de um exercício ---------- */
  KMP.Scope = class Scope {
    constructor() {
      this.alive = true;
      this._t = new Set();
      this._i = new Set();
      this._r = new Set();
      this._l = [];
    }
    timeout(fn, ms) {
      const id = setTimeout(() => {
        this._t.delete(id);
        if (this.alive) fn();
      }, ms);
      this._t.add(id);
      return id;
    }
    interval(fn, ms) {
      const id = setInterval(() => this.alive && fn(), ms);
      this._i.add(id);
      return id;
    }
    clearInterval(id) {
      clearInterval(id);
      this._i.delete(id);
    }
    raf(fn) {
      const id = requestAnimationFrame((t) => {
        this._r.delete(id);
        if (this.alive) fn(t);
      });
      this._r.add(id);
      return id;
    }
    /** Promessa que só resolve se o exercício ainda estiver ativo. */
    wait(ms) {
      return new Promise((res) => this.timeout(res, ms));
    }
    on(el, ev, fn, opts) {
      el.addEventListener(ev, fn, opts);
      this._l.push([el, ev, fn, opts]);
    }
    dispose() {
      this.alive = false;
      this._t.forEach(clearTimeout);
      this._i.forEach(clearInterval);
      this._r.forEach(cancelAnimationFrame);
      this._l.forEach(([el, ev, fn, o]) => el.removeEventListener(ev, fn, o));
      this._l = [];
    }
  };

  /* ---------- Armazenamento local ---------- */
  const KEY = 'kmp:v1';
  const defaults = () => ({
    v: 1,
    profile: {
      name: 'Piloto',
      kartType: 'aluguer',
      freq: '1-2',
      goal: 'todas',
      level: 'corridas',
      createdAt: Date.now(),
    },
    settings: { sound: true, voice: true, reminder: { on: false, time: '19:00' }, onboarded: false },
    sessions: [],
    levels: {},
    program: null,
    track: [],
    circuits: [],
    ach: {},
    challenges: {},
    analysis: {},
  });

  const S = (KMP.store = {
    state: null,
    ok: true,
    load() {
      let data = null;
      try {
        data = JSON.parse(localStorage.getItem(KEY) || 'null');
      } catch (e) {
        data = null;
      }
      const d = defaults();
      if (data && typeof data === 'object') {
        this.state = Object.assign(d, data);
        this.state.profile = Object.assign(d.profile, data.profile || {});
        this.state.settings = Object.assign(d.settings, data.settings || {});
      } else {
        this.state = d;
      }
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      return this.state;
    },
    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.state));
        this.ok = true;
      } catch (e) {
        this.ok = false;
        KMP.toast && KMP.toast('Não foi possível guardar os dados neste dispositivo.', 'err');
      }
    },
    reset() {
      this.state = defaults();
      this.state.settings.onboarded = true;
      this.save();
    },
    export() {
      return JSON.stringify(this.state, null, 1);
    },
    import(text) {
      const data = JSON.parse(text);
      if (!data || data.v !== 1 || !Array.isArray(data.sessions)) throw new Error('Ficheiro inválido');
      localStorage.setItem(KEY, JSON.stringify(data));
      this.load();
    },
  });

  /* ---------- Som (gerado no navegador, sem ficheiros) ---------- */
  let actx = null;
  const ensureAudio = () => {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  };
  // O iPhone só deixa tocar som depois de um toque do utilizador.
  ['pointerdown', 'touchend', 'click'].forEach((ev) =>
    document.addEventListener(ev, () => S.state && S.state.settings.sound && ensureAudio(), { passive: true })
  );

  const tone = (freq, dur, type, vol, when) => {
    if (!S.state || !S.state.settings.sound) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  };
  KMP.sound = {
    tone,
    tick: () => tone(1200, 0.05, 'square', 0.06),
    tap: () => tone(700, 0.06, 'triangle', 0.12),
    ok: () => {
      tone(880, 0.09, 'triangle', 0.18);
      tone(1320, 0.12, 'triangle', 0.16, 0.08);
    },
    err: () => tone(160, 0.22, 'sawtooth', 0.12),
    light: () => tone(520, 0.12, 'square', 0.1),
    go: () => tone(1050, 0.25, 'square', 0.12),
    pad: (i) => tone([330, 392, 494, 587, 659, 784][i % 6], 0.32, 'triangle', 0.2),
    record: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.18, i * 0.11)),
    finish: () => [392, 523, 659].forEach((f, i) => tone(f, 0.2, 'triangle', 0.16, i * 0.12)),
  };

  /* ---------- Voz (síntese do sistema, pt-PT) ---------- */
  let ptVoice = null;
  const pickVoice = () => {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    ptVoice = vs.find((v) => /pt[-_]PT/i.test(v.lang)) || vs.find((v) => /^pt/i.test(v.lang)) || null;
  };
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  KMP.speak = (text) => {
    if (!S.state || !S.state.settings.voice || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-PT';
      if (ptVoice) u.voice = ptVoice;
      u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch (e) {}
  };
  KMP.stopSpeak = () => {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  };

  /* ---------- Gráficos SVG ---------- */
  KMP.chart = {
    /** Linha com pontos. values: números (null = falha). */
    line(values, o) {
      o = Object.assign({ w: 320, h: 140, color: 'var(--red)', unit: '', invert: false, dec: 0 }, o || {});
      const pts = values.map((v, i) => [i, v]).filter((p) => p[1] != null);
      if (pts.length < 2) return `<div class="chart-empty">${o.empty || 'Faz pelo menos 2 sessões para ver a evolução.'}</div>`;
      const vs = pts.map((p) => p[1]);
      let min = o.min != null ? o.min : Math.min(...vs);
      let max = o.max != null ? o.max : Math.max(...vs);
      if (max === min) {
        max += 1;
        min -= 1;
      }
      const pad = { l: 36, r: 10, t: 12, b: 18 };
      const W = o.w - pad.l - pad.r;
      const H = o.h - pad.t - pad.b;
      const n = Math.max(values.length - 1, 1);
      const x = (i) => pad.l + (i / n) * W;
      const y = (v) => pad.t + (o.invert ? (v - min) / (max - min) : 1 - (v - min) / (max - min)) * H;
      const path = pts.map((p, k) => (k ? 'L' : 'M') + x(p[0]).toFixed(1) + ' ' + y(p[1]).toFixed(1)).join(' ');
      const area = path + ' L' + x(pts[pts.length - 1][0]).toFixed(1) + ' ' + (pad.t + H) + ' L' + x(pts[0][0]).toFixed(1) + ' ' + (pad.t + H) + ' Z';
      const grid = [0, 0.5, 1]
        .map((f) => {
          const v = o.invert ? min + f * (max - min) : max - f * (max - min);
          const yy = pad.t + f * H;
          return `<line x1="${pad.l}" x2="${o.w - pad.r}" y1="${yy}" y2="${yy}" class="grid"/><text x="${pad.l - 6}" y="${yy + 4}" text-anchor="end" class="axis">${U.num(v, o.dec)}</text>`;
        })
        .join('');
      const gid = 'g' + Math.random().toString(36).slice(2, 7);
      const last = pts[pts.length - 1];
      return `<svg class="chart" viewBox="0 0 ${o.w} ${o.h}" preserveAspectRatio="none" role="img" aria-label="Gráfico de evolução">
        <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${o.color}" stop-opacity=".35"/><stop offset="1" stop-color="${o.color}" stop-opacity="0"/></linearGradient></defs>
        ${grid}<path d="${area}" fill="url(#${gid})"/><path d="${path}" fill="none" stroke="${o.color}" stroke-width="2.2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
        ${pts.map((p) => `<circle cx="${x(p[0])}" cy="${y(p[1])}" r="2.4" fill="${o.color}"/>`).join('')}
        <circle cx="${x(last[0])}" cy="${y(last[1])}" r="4.5" fill="var(--bg)" stroke="${o.color}" stroke-width="2"/>
      </svg>`;
    },
    /** Barras verticais com rótulos. */
    bars(items, o) {
      o = Object.assign({ w: 320, h: 150, color: 'var(--red)', dec: 0 }, o || {});
      if (!items.length) return '<div class="chart-empty">Sem dados ainda.</div>';
      const max = Math.max(...items.map((i) => i.v || 0), o.max || 0, 1);
      const pad = { l: 8, r: 8, t: 16, b: 22 };
      const W = o.w - pad.l - pad.r;
      const H = o.h - pad.t - pad.b;
      const bw = W / items.length;
      return `<svg class="chart" viewBox="0 0 ${o.w} ${o.h}" role="img" aria-label="Gráfico de barras">
        ${items
          .map((it, i) => {
            const bh = ((it.v || 0) / max) * H;
            const xx = pad.l + i * bw + bw * 0.18;
            const yy = pad.t + H - bh;
            return `<rect x="${xx}" y="${pad.t}" width="${bw * 0.64}" height="${H}" rx="3" class="bar-bg"/>
              <rect x="${xx}" y="${yy}" width="${bw * 0.64}" height="${Math.max(bh, 0)}" rx="3" fill="${it.color || o.color}"/>
              ${it.v ? `<text x="${xx + bw * 0.32}" y="${yy - 4}" text-anchor="middle" class="axis val">${U.num(it.v, o.dec)}</text>` : ''}
              <text x="${xx + bw * 0.32}" y="${o.h - 6}" text-anchor="middle" class="axis">${U.esc(it.label)}</text>`;
          })
          .join('')}
      </svg>`;
    },
  };

  /* ---------- Avisos ---------- */
  KMP.toast = (msg, kind) => {
    let host = U.$('#toasts');
    if (!host) {
      host = U.h('<div id="toasts" aria-live="polite"></div>');
      document.body.appendChild(host);
    }
    const t = U.h(`<div class="toast ${kind || ''}">${msg}</div>`);
    host.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2800);
    setTimeout(() => t.remove(), 3300);
  };

  /** Janela modal simples. Devolve o elemento; fecha com .close(). */
  KMP.modal = (html, opts) => {
    opts = opts || {};
    const m = U.h(`<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`);
    m.close = () => {
      m.classList.add('out');
      setTimeout(() => m.remove(), 200);
    };
    m.addEventListener('click', (e) => {
      if (e.target === m && !opts.locked) m.close();
      const c = e.target.closest('[data-close]');
      if (c) m.close();
    });
    document.body.appendChild(m);
    return m;
  };

  KMP.confirm = (text, okLabel, danger) =>
    new Promise((res) => {
      const m = KMP.modal(`<p class="modal-text">${text}</p>
        <div class="row gap"><button class="btn ghost" data-v="0">Cancelar</button><button class="btn ${danger ? 'danger' : 'primary'}" data-v="1">${okLabel || 'Confirmar'}</button></div>`);
      m.addEventListener('click', (e) => {
        const b = e.target.closest('[data-v]');
        if (b) {
          m.close();
          res(b.dataset.v === '1');
        }
      });
    });
})();
