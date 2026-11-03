/* Som sintetizado: motor (muda com as rotações), pneus a chiar, batidas, rádio e voz do engenheiro. */
'use strict';

const AUDIO = (() => {
  let ac = null, master = null, eng = null, squeal = null, rivals = null, vol = 0.8, voice = true;
  function ctx() {
    try {
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = vol; master.connect(ac.destination);
      }
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { ac = null; }
    return ac;
  }
  function noiseBuf(sec) { const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  function startEngine(cat) {
    const a = ctx(); if (!a) return; stopEngine();
    const kart = cat === 'kart';
    const o1 = a.createOscillator(), o2 = a.createOscillator(), o3 = a.createOscillator();
    o1.type = 'sawtooth'; o2.type = 'square'; o3.type = 'sawtooth';
    const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200; f.Q.value = 3;
    const g = a.createGain(); g.gain.value = 0;
    const g2 = a.createGain(); g2.gain.value = kart ? 0.35 : 0.22;
    const g3 = a.createGain(); g3.gain.value = kart ? 0.15 : 0.3;
    o1.connect(f); o2.connect(g2).connect(f); o3.connect(g3).connect(f); f.connect(g).connect(master);
    o1.start(); o2.start(); o3.start();
    // pneus a chiar
    const n = a.createBufferSource(); n.buffer = noiseBuf(2); n.loop = true;
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 7;
    const sg = a.createGain(); sg.gain.value = 0; n.connect(bp).connect(sg).connect(master); n.start();
    // rivais (um zumbido conjunto)
    const r1 = a.createOscillator(); r1.type = 'sawtooth'; const rf = a.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 900;
    const rg = a.createGain(); rg.gain.value = 0; r1.connect(rf).connect(rg).connect(master); r1.start();
    eng = { o1, o2, o3, f, g, kart, cat }; squeal = { sg, bp }; rivals = { r1, rg, rf };
  }
  function stopEngine() {
    if (!eng) return;
    try { for (const o of [eng.o1, eng.o2, eng.o3, rivals.r1]) o.stop(); } catch (e) { /* */ }
    try { squeal.sg.disconnect(); eng.g.disconnect(); rivals.rg.disconnect(); } catch (e) { /* */ }
    eng = squeal = rivals = null;
  }
  function update(rpm, rpmRange, throttle, slide, nearRival, rivalRpm) {
    if (!eng || !ac) return;
    const t = ac.currentTime, k = clamp((rpm - rpmRange[0]) / (rpmRange[1] - rpmRange[0]), 0, 1);
    // frequência base: o kart é um monocilíndrico (zumbido), os fórmulas têm um som mais agudo
    const base = eng.kart ? 40 + k * 190 : eng.cat === 'f1' ? 95 + k * 560 : 80 + k * 380;
    eng.o1.frequency.setTargetAtTime(base, t, 0.03);
    eng.o2.frequency.setTargetAtTime(base * 0.5, t, 0.03);
    eng.o3.frequency.setTargetAtTime(base * 2.01, t, 0.03);
    eng.f.frequency.setTargetAtTime(600 + throttle * 2400 + k * 1500, t, 0.05);
    eng.g.gain.setTargetAtTime(0.06 + throttle * 0.1 + k * 0.04, t, 0.05);
    squeal.sg.gain.setTargetAtTime(clamp(slide - 0.2, 0, 1) * 0.12, t, 0.05);
    squeal.bp.frequency.setTargetAtTime(1600 + slide * 600, t, 0.1);
    rivals.rg.gain.setTargetAtTime(nearRival * 0.05, t, 0.1);
    rivals.r1.frequency.setTargetAtTime(rivalRpm, t, 0.08);
  }
  function blip(freq, dur, type = 'square', v = 0.05, delay = 0) {
    const a = ctx(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + delay;
    o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function hit(force) {
    const a = ctx(); if (!a) return;
    const s = a.createBufferSource(); s.buffer = noiseBuf(0.4);
    const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
    const g = a.createGain(); g.gain.value = clamp(force / 20, 0.05, 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.35);
    s.connect(f).connect(g).connect(master); s.start();
  }
  function radio(text) {
    blip(1250, 0.07, 'square', 0.04); blip(950, 0.06, 'square', 0.03, 0.08);
    if (!voice || !window.speechSynthesis) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-PT'; u.rate = 1.12; u.pitch = 0.9; u.volume = 0.9;
      const v = speechSynthesis.getVoices().find((x) => /pt(-|_)PT/i.test(x.lang)) || speechSynthesis.getVoices().find((x) => /^pt/i.test(x.lang));
      if (v) u.voice = v;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { /* sem voz */ }
  }
  function light(on) { blip(on ? 520 : 880, on ? 0.18 : 0.35, 'sine', 0.08); }
  function click() { blip(700, 0.04, 'square', 0.025); }
  return {
    ctx, startEngine, stopEngine, update, hit, radio, light, click,
    setVolume(v) { vol = v; if (master) master.gain.value = v; },
    setVoice(v) { voice = v; },
  };
})();
