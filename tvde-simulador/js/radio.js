// Rádio do carro: música gerada em tempo real (sem ficheiros) e um noticiário com a atualidade do jogo.
import { pick, hhmm } from './util.js';
import { EVENT_TYPES, eventStatus } from './game/events.js';

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const STATIONS = [
  { id: 'off', name: 'Rádio desligado', icon: '🔇' },
  { id: 'pop', name: 'Atlântico FM', freq: '98.4', icon: '🎵', desc: 'Êxitos do momento' },
  { id: 'jazz', name: 'Jazz Azul', freq: '91.2', icon: '🎷', desc: 'Jazz suave para conduzir' },
  { id: 'fado', name: 'Rádio Saudade', freq: '103.7', icon: '🎸', desc: 'Guitarra portuguesa e fado' },
  { id: 'news', name: 'Notícias 24', freq: '88.0', icon: '📰', desc: 'Notícias, trânsito e meteorologia' },
];
const STYLE = {
  pop: { bpm: 112, chords: [[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]], scale: [60, 62, 64, 67, 69, 72, 74, 76] },
  jazz: { bpm: 86, chords: [[50, 53, 57, 60], [43, 47, 50, 53], [48, 52, 55, 59], [45, 49, 52, 55]], scale: [62, 64, 65, 67, 69, 71, 72, 74, 77] },
  fado: { bpm: 72, chords: [[45, 48, 52], [50, 53, 57], [40, 44, 47], [45, 48, 52]], scale: [57, 59, 60, 62, 64, 65, 68, 69, 72] },
};
const FILLER = [
  'A câmara municipal anunciou a renovação do passeio marítimo, com novas ciclovias junto à praia.',
  'O mercado municipal recebe este fim de semana a feira do peixe fresco.',
  'O aeroporto de Porto Azul registou um novo recorde de passageiros este mês.',
  'Abriu uma nova pastelaria na Vila Velha. Os pastéis de nata já têm fila à porta.',
  'A universidade de Porto Azul inaugurou um laboratório dedicado à energia do mar.',
  'Os pescadores da Praia dos Pescadores tiveram uma excelente semana de sardinha.',
  'O teatro nacional estreia esta semana uma peça sobre a história da cidade.',
  'O hospital de Santa Luzia vai abrir uma nova ala de pediatria.',
];

export class Radio {
  constructor(sound) {
    this.sound = sound; this.station = 'off'; this.game = null;
    this._next = 0; this._step = 0; this._bar = 0; this._newsT = 3; this._duckUntil = 0; this.out = null;
  }
  _ensure() {
    const s = this.sound; if (!s.ctx) return false;
    if (!this.out) {
      const c = s.ctx;
      this.out = c.createGain(); this.out.gain.value = 0;
      this.tone = c.createBiquadFilter(); this.tone.type = 'lowpass'; this.tone.frequency.value = 4200;
      this.out.connect(this.tone); this.tone.connect(s.master);
      const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf; s.radio = this;
    }
    return true;
  }
  info() { return STATIONS.find((x) => x.id === this.station); }
  set(id) {
    this.station = id; if (this.game) this.game.state.settings.radio = id;
    if (!this._ensure()) return;
    const c = this.sound.ctx;
    this.out.gain.setTargetAtTime(id === 'off' ? 0 : 0.2, c.currentTime, 0.15);
    this._next = c.currentTime + 0.1; this._step = 0; this._bar = 0; this._newsT = id === 'news' ? 1.5 : 999;
    if (id !== 'off') { this._static(); const st = this.info(); if (st && id !== 'news') setTimeout(() => this._say(`${st.name}, ${st.freq}. ${st.desc}.`), 600); }
  }
  next() { const i = STATIONS.findIndex((x) => x.id === this.station); this.set(STATIONS[(i + 1) % STATIONS.length].id); return this.info(); }
  duck(sec) {
    if (!this.out) return; const c = this.sound.ctx;
    this._duckUntil = c.currentTime + sec;
    this.out.gain.setTargetAtTime(this.station === 'off' ? 0 : 0.05, c.currentTime, 0.1);
  }
  _say(text) {
    const s = this.sound; if (!s.voice || !s.enabled || !('speechSynthesis' in window) || speechSynthesis.speaking) return false;
    const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-PT'; u.rate = 1.08; u.pitch = 1; u.volume = 0.75;
    const v = s.voices.find((x) => /pt-PT/i.test(x.lang)) || s.voices[0]; if (v) u.voice = v;
    speechSynthesis.speak(u); return true;
  }
  _static() {
    const c = this.sound.ctx, src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    src.buffer = this.noiseBuf; f.type = 'highpass'; f.frequency.value = 2000; g.gain.setValueAtTime(0.06, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
    src.connect(f); f.connect(g); g.connect(this.out); src.start(); src.stop(c.currentTime + 0.45);
  }
  _note(t, f, dur, type, vol, filt = 0) {
    const c = this.sound.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (filt) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filt; o.connect(fl); fl.connect(g); } else o.connect(g);
    g.connect(this.out); o.start(t); o.stop(t + dur + 0.02);
  }
  _drum(t, kind, vol) {
    const c = this.sound.ctx;
    if (kind === 'k') { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22); o.connect(g); g.connect(this.out); o.start(t); o.stop(t + 0.25); return; }
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); src.buffer = this.noiseBuf;
    f.type = kind === 'h' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'h' ? 7000 : 1800;
    const d = kind === 'h' ? 0.05 : 0.16; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    src.connect(f); f.connect(g); g.connect(this.out); src.start(t, Math.random() * 0.3); src.stop(t + d + 0.02);
  }
  update(dt) {
    if (this.station === 'off' || !this._ensure()) return;
    const c = this.sound.ctx;
    if (this._duckUntil && c.currentTime > this._duckUntil) { this._duckUntil = 0; this.out.gain.setTargetAtTime(0.2, c.currentTime, 0.4); }
    if (this.station === 'news') { this._news(dt); return; }
    const S = STYLE[this.station]; const spb = 60 / S.bpm / 2; // colcheias
    while (this._next < c.currentTime + 0.3) {
      const t = this._next, st = this._step % 8, ch = S.chords[this._bar % 4];
      if (this.station === 'pop') {
        if (st === 0 || st === 4) this._drum(t, 'k', 0.5);
        if (st === 2 || st === 6) this._drum(t, 's', 0.18);
        this._drum(t, 'h', 0.05);
        this._note(t, mtof(ch[0] - 12), spb * 0.9, 'triangle', 0.16);
        if (st === 0) for (const n of ch) this._note(t, mtof(n + 12), spb * 7.5, 'sawtooth', 0.022, 1600);
        if (Math.random() < 0.55) this._note(t, mtof(pick(S.scale) + 12), spb * 0.85, 'square', 0.022, 2600);
      } else if (this.station === 'jazz') {
        const swing = st % 2 ? spb * 0.33 : 0;
        if (st % 2 === 0) this._note(t, mtof(ch[(st / 2) % ch.length] - 12), spb * 1.8, 'sine', 0.2);
        if (st % 2 === 1 || st === 0) this._drum(t + swing, 'h', 0.035);
        if (st === 3 || st === 7) for (const n of ch) this._note(t + swing, mtof(n + 12), spb * 1.2, 'triangle', 0.03);
        if (Math.random() < 0.35) this._note(t + swing, mtof(pick(S.scale) + 12), spb * 1.6, 'sine', 0.04);
      } else {
        const arp = [ch[0], ch[1], ch[2], ch[1] + 12, ch[2] + 12, ch[1] + 12, ch[2], ch[1]];
        this._note(t, mtof(arp[st] + 12), spb * 2.2, 'triangle', 0.07);
        if (st === 0) this._note(t, mtof(ch[0] - 12), spb * 7, 'sine', 0.12);
        if (st % 4 === 2 && Math.random() < 0.6) this._note(t, mtof(pick(S.scale) + 12), spb * 3, 'sawtooth', 0.02, 1400);
      }
      this._next += spb; this._step++; if (this._step % 8 === 0) this._bar++;
    }
  }
  _news(dt) {
    this._newsT -= dt; if (this._newsT > 0) return;
    const items = this.headlines();
    const text = pick(items);
    const c = this.sound.ctx;
    [0, 0.15, 0.3].forEach((d, i) => this._note(c.currentTime + d, mtof([72, 76, 79][i]), 0.25, 'sine', 0.08));
    setTimeout(() => { if (!this._say(text) && this.game) this.game.hud.toast('📻', 'Notícias 24', text); }, 600);
    this._newsT = 22 + Math.random() * 10;
  }
  headlines() {
    const g = this.game; if (!g || !g.state) return FILLER;
    const st = g.state, T = st.today; const out = [];
    out.push(`São ${hhmm(st.time).replace(':', ' e ')}. Esta é a Notícias 24, a rádio de Porto Azul.`);
    for (const e of T.events || []) out.push(`${EVENT_TYPES[e.type] ? '' : ''}Agenda: ${e.title}, às ${Math.floor(e.start / 60) % 24} horas. Estado: ${eventStatus(e, st.time)}. Espera-se muito movimento na zona.`);
    if ((T.works || []).length) out.push(`Trânsito: obras na ${T.works.map((id) => g.w.city.streetOf(g.w.net.edges[id])).join(' e na ')}. Circulação cortada, prefira percursos alternativos.`);
    const h = Math.floor(st.time / 60) % 24;
    if ((h >= 7 && h < 10) || (h >= 17 && h < 20)) out.push('Hora de ponta em Porto Azul: trânsito intenso no centro e na Avenida da Liberdade.');
    const w = { limpo: 'céu limpo e temperaturas agradáveis', nublado: 'céu nublado', chuva: 'chuva, conduza com cuidado', nevoeiro: 'nevoeiro cerrado, atenção à visibilidade' }[st.weather.type];
    out.push(`Meteorologia: neste momento, ${w}.`);
    if (T.prices) out.push(`Combustíveis: a gasolina está hoje a ${T.prices.gasolina.toFixed(2).replace('.', ',')} euros por litro e o gasóleo a ${T.prices.gasoleo.toFixed(2).replace('.', ',')}.`);
    out.push(`Futebol: o Porto Azul FC venceu por ${1 + Math.floor(Math.random() * 3)} a ${Math.floor(Math.random() * 2)} no último jogo.`);
    return out.concat(pick(FILLER), pick(FILLER));
  }
}
