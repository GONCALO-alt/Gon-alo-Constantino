'use strict';
/* Som sintetizado com Web Audio: efeitos e pequenas músicas em estilo 8-bit para cada cenário. */
const SFX = (() => {
  let ac = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let soundOn = true, musicOn = true, lastClick = 0, curTrack = null, nextNote = 0, beat = 0, timer = null;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = soundOn ? 1 : 0; sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = musicOn ? 0.22 : 0; musicBus.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (curTrack) startMusic(curTrack, true);
  }
  function setSound(on) { soundOn = on; if (sfxBus) sfxBus.gain.value = on ? 1 : 0; }
  function setMusic(on) { musicOn = on; if (musicBus) musicBus.gain.value = on ? 0.22 : 0; }

  function tone(freq, dur, type = 'square', vol = 0.2, when = 0, slideTo = null, bus = sfxBus) {
    if (!ac) return;
    const t = ac.currentTime + when;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, filterType, freq, when = 0, q = 1, bus = sfxBus, attack = 0) {
    if (!ac) return;
    const t = ac.currentTime + when;
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain();
    if (attack) { g.gain.setValueAtTime(0.0008, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); }
    else g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(bus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  const S = {
    ball(speed) {
      if (!ac) return;
      const now = ac.currentTime;
      if (now - lastClick < 0.018) return;
      lastClick = now;
      const v = U.clamp(speed / 4, 0.04, 0.5);
      tone(2400 + Math.random() * 600, 0.035, 'sine', v);
      noise(0.03, v * 0.7, 'bandpass', 3200, 0, 2);
    },
    rail(speed) { const v = U.clamp(speed / 5, 0.03, 0.35); tone(140, 0.09, 'sine', v, 0, 70); noise(0.06, v * 0.4, 'lowpass', 600); },
    pocket() { tone(320, 0.18, 'triangle', 0.3, 0, 90); noise(0.12, 0.15, 'lowpass', 900, 0.03); tone(180, 0.06, 'square', 0.06, 0.12); },
    cue(power) { const v = 0.15 + power * 0.3; noise(0.05, v, 'bandpass', 1800, 0, 1.5); tone(900, 0.04, 'sine', v * 0.5); },
    ui() { tone(880, 0.05, 'square', 0.06); tone(1320, 0.05, 'square', 0.05, 0.04); },
    back() { tone(660, 0.05, 'square', 0.05); tone(440, 0.06, 'square', 0.05, 0.04); },
    coin() { tone(988, 0.07, 'square', 0.1); tone(1319, 0.18, 'square', 0.1, 0.07); },
    buy() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.09, 'square', 0.09, i * 0.06)); },
    error() { tone(200, 0.15, 'sawtooth', 0.1); tone(150, 0.2, 'sawtooth', 0.1, 0.1); },
    foul() { tone(300, 0.12, 'square', 0.12, 0, 150); tone(220, 0.2, 'square', 0.1, 0.12, 110); },
    combo(n) { for (let i = 0; i < n + 1; i++) tone(660 * Math.pow(1.26, i), 0.08, 'square', 0.09, i * 0.06); },
    unlock() { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.12, 'triangle', 0.14, i * 0.07)); },
    win() {
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i === 6 ? 0.5 : 0.13, 'square', 0.12, i * 0.12));
      [262, 330, 392, 523].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, i * 0.2));
      S.cheer(1.6);
    },
    lose() { [392, 370, 349, 330].forEach((f, i) => tone(f, i === 3 ? 0.7 : 0.25, 'sawtooth', 0.09, i * 0.28, i === 3 ? 260 : null)); },
    cheer(dur = 1.2) { noise(dur, 0.18, 'bandpass', 1400, 0, 0.6, sfxBus, 0.25); noise(dur * 0.8, 0.08, 'bandpass', 2600, 0.1, 1.2, sfxBus, 0.2); },
    talk() { tone(500 + Math.random() * 300, 0.04, 'square', 0.03); },
    vibrate(ms) { try { if (window.__vibrate !== false && navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sem vibração */ } },
  };

  /* ---------- música ---------- */
  const N = n => 440 * Math.pow(2, (n - 69) / 12); // nota MIDI → Hz
  const TRACKS = {
    menu: { bpm: 112, bass: [36, 36, 43, 43, 41, 41, 43, 43], lead: [60, 64, 67, 72, 71, 67, 64, 62, 60, 64, 67, 69, 67, 64, 62, 59], drum: 'soft' },
    bar: { bpm: 96, bass: [40, 44, 47, 49, 50, 49, 47, 44], lead: [64, 0, 67, 69, 70, 69, 67, 0, 64, 0, 62, 64, 0, 0, 59, 0], drum: 'shuffle' },
    disco: { bpm: 122, bass: [41, 53, 41, 53, 43, 55, 43, 55], lead: [72, 0, 74, 0, 77, 0, 74, 72, 70, 0, 72, 0, 74, 0, 0, 0], drum: 'four' },
    vip: { bpm: 84, bass: [38, 45, 43, 45, 36, 43, 41, 43], lead: [62, 65, 69, 72, 71, 67, 64, 0, 60, 64, 67, 71, 69, 65, 62, 0], drum: 'brush' },
    stadium: { bpm: 128, bass: [36, 36, 43, 43, 45, 45, 43, 43], lead: [67, 67, 0, 67, 69, 67, 64, 0, 67, 67, 0, 67, 72, 71, 67, 0], drum: 'march' },
    luxo: { bpm: 72, bass: [45, 52, 48, 52, 43, 50, 47, 50], lead: [69, 72, 76, 81, 79, 76, 72, 71, 69, 72, 76, 79, 77, 74, 71, 0], drum: null },
  };
  function startMusic(name, force) {
    if (curTrack === name && !force && timer) return;
    curTrack = name;
    if (!ac) return;
    if (timer) clearInterval(timer);
    nextNote = ac.currentTime + 0.1; beat = 0;
    timer = setInterval(schedule, 60);
  }
  function stopMusic() { if (timer) clearInterval(timer); timer = null; curTrack = null; }
  function schedule() {
    const tr = TRACKS[curTrack];
    if (!tr || !ac) return;
    const step = 60 / tr.bpm / 2;
    while (nextNote < ac.currentTime + 0.25) {
      const w = nextNote - ac.currentTime;
      if (musicOn) {
        if (beat % 2 === 0) { const b = tr.bass[(beat / 2) % tr.bass.length]; tone(N(b), step * 1.7, 'triangle', 0.5, w, null, musicBus); }
        const l = tr.lead[beat % tr.lead.length];
        if (l) tone(N(l), step * 0.9, 'square', 0.12, w, null, musicBus);
        const dr = tr.drum;
        if (dr === 'four' && beat % 2 === 0) tone(110, 0.12, 'sine', 0.6, w, 45, musicBus);
        if (dr === 'four' && beat % 2 === 1) noise(0.04, 0.12, 'highpass', 7000, w, 1, musicBus);
        if ((dr === 'shuffle' || dr === 'soft') && beat % 4 === 0) tone(100, 0.1, 'sine', 0.45, w, 50, musicBus);
        if ((dr === 'shuffle' || dr === 'soft' || dr === 'brush') && beat % 4 === 2) noise(0.07, 0.1, 'bandpass', 2500, w, 0.8, musicBus);
        if (dr === 'march' && beat % 2 === 0) tone(90, 0.14, 'sine', 0.5, w, 40, musicBus);
        if (dr === 'march' && beat % 4 === 3) noise(0.08, 0.16, 'bandpass', 1800, w, 0.8, musicBus);
      }
      nextNote += step; beat++;
    }
  }

  return Object.assign(S, { init, setSound, setMusic, startMusic, stopMusic });
})();
