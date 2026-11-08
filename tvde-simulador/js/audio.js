// Som procedimental (WebAudio) e voz dos passageiros (síntese de fala pt-PT).
export class Sound {
  constructor() { this.ctx = null; this.enabled = true; this.voice = true; this.voices = []; }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = this.ctx = new AC();
    this.master = c.createGain(); this.master.gain.value = this.enabled ? 0.8 : 0; this.master.connect(c.destination);
    // ruído
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const noise = () => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
    // motor
    this.engOsc = c.createOscillator(); this.engOsc.type = 'sawtooth'; this.engOsc.frequency.value = 40;
    this.engOsc2 = c.createOscillator(); this.engOsc2.type = 'triangle'; this.engOsc2.frequency.value = 80;
    this.engF = c.createBiquadFilter(); this.engF.type = 'lowpass'; this.engF.frequency.value = 220;
    this.engG = c.createGain(); this.engG.gain.value = 0.0;
    this.engOsc.connect(this.engF); this.engOsc2.connect(this.engF); this.engF.connect(this.engG); this.engG.connect(this.master);
    this.engOsc.start(); this.engOsc2.start();
    // estrada / vento
    this.road = noise(); this.roadF = c.createBiquadFilter(); this.roadF.type = 'lowpass'; this.roadF.frequency.value = 400;
    this.roadG = c.createGain(); this.roadG.gain.value = 0; this.road.connect(this.roadF); this.roadF.connect(this.roadG); this.roadG.connect(this.master);
    // chuva
    this.rain = noise(); this.rainF = c.createBiquadFilter(); this.rainF.type = 'bandpass'; this.rainF.frequency.value = 2500; this.rainF.Q.value = 0.4;
    this.rainG = c.createGain(); this.rainG.gain.value = 0; this.rain.connect(this.rainF); this.rainF.connect(this.rainG); this.rainG.connect(this.master);
    // ambiente da cidade
    this.amb = noise(); this.ambF = c.createBiquadFilter(); this.ambF.type = 'lowpass'; this.ambF.frequency.value = 180;
    this.ambG = c.createGain(); this.ambG.gain.value = 0.05; this.amb.connect(this.ambF); this.ambF.connect(this.ambG); this.ambG.connect(this.master);
    this._loadVoices();
  }
  _loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const load = () => { this.voices = speechSynthesis.getVoices().filter((v) => /^pt/i.test(v.lang)); };
    load(); speechSynthesis.onvoiceschanged = load;
  }
  setEnabled(on) { this.enabled = on; if (this.master) this.master.gain.value = on ? 0.8 : 0; if (!on && 'speechSynthesis' in window) speechSynthesis.cancel(); }
  update(speed, rain, electric) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const k = Math.min(1, speed / 14);
    const idle = electric ? 0 : 0.035;
    this.engOsc.frequency.setTargetAtTime((electric ? 120 : 38) + k * (electric ? 240 : 70), t, 0.2);
    this.engOsc2.frequency.setTargetAtTime((electric ? 240 : 76) + k * (electric ? 300 : 140), t, 0.2);
    this.engG.gain.setTargetAtTime(electric ? k * 0.012 : idle + k * 0.05, t, 0.3);
    this.roadG.gain.setTargetAtTime(k * 0.16, t, 0.3);
    this.roadF.frequency.setTargetAtTime(300 + k * 500, t, 0.3);
    this.rainG.gain.setTargetAtTime(rain * 0.12, t, 0.5);
  }
  _tone(freq, dur, type = 'sine', vol = 0.15, delay = 0) {
    if (!this.ctx || !this.enabled) return;
    const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  }
  request() { [0, 0.18, 0.36].forEach((d, i) => this._tone([880, 1175, 1568][i], 0.25, 'sine', 0.16, d)); }
  ping() { this._tone(1046, 0.18, 'sine', 0.12); this._tone(1568, 0.22, 'sine', 0.08, 0.09); }
  cash() { [0, 0.07, 0.14, 0.24].forEach((d, i) => this._tone([1318, 1568, 2093, 2637][i], 0.2, 'triangle', 0.1, d)); }
  tick() { this._tone(1800, 0.03, 'square', 0.03); this._tone(1200, 0.03, 'square', 0.025, 0.06); }
  door() { this._tone(90, 0.25, 'sine', 0.3); this._tone(140, 0.12, 'square', 0.05); }
  bad() { this._tone(330, 0.25, 'sawtooth', 0.08); this._tone(220, 0.35, 'sawtooth', 0.08, 0.15); }
  horn() { this._tone(420, 0.4, 'square', 0.06); this._tone(520, 0.4, 'square', 0.05); }
  click() { this._tone(2400, 0.02, 'square', 0.03); }
  speak(text, gender = 'm', rate = 1.03) {
    if (!this.voice || !this.enabled || !('speechSynthesis' in window)) return;
    const clean = text.replace(/[()*_~]/g, '').replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '');
    if (!clean.trim() || clean.trim().startsWith('...')) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'pt-PT';
    const pt = this.voices.filter((v) => /pt-PT/i.test(v.lang)); const pool = pt.length ? pt : this.voices;
    if (pool.length) {
      const fem = pool.filter((v) => /female|mulher|joana|catarina|fernanda|raquel|helena|ines|inês/i.test(v.name));
      const mal = pool.filter((v) => /male|homem|duarte|cristiano|daniel|tiago/i.test(v.name) && !/female/i.test(v.name));
      u.voice = (gender === 'f' ? fem[0] : mal[0]) || pool[0];
    }
    u.pitch = gender === 'f' ? 1.15 : 0.9; u.rate = rate; u.volume = 0.9;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
}
