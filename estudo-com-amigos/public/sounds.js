// Sons de foco gerados no browser (Web Audio) — não precisam de ficheiros.
let ctx = null;
let master = null;
let current = null; // { name, stop() }
let volume = 0.5;

function ensure() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const canPlay = () => !!(window.AudioContext || window.webkitAudioContext);
export const isUnlocked = () => !!ctx && ctx.state === 'running';

export function setVolume(v) {
  volume = v;
  if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
}

function noiseBuffer(kind = 'white', seconds = 4) {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0, b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else if (kind === 'pink') {
      b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965226; b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12;
    } else d[i] = w;
  }
  return buf;
}

function loopNoise(kind, out, { lp, hp, gain }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(kind);
  src.loop = true;
  let node = src;
  if (hp) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; node.connect(f); node = f; }
  if (lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; node.connect(f); node = f; }
  const g = ctx.createGain(); g.gain.value = gain; node.connect(g); g.connect(out);
  src.start();
  return src;
}

function burst(out, { at, dur, freq, q = 1, gain = 0.2, type = 'bandpass' }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer('white', Math.max(0.05, dur));
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + Math.min(0.02, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(f); f.connect(g); g.connect(out);
  src.start(at); src.stop(at + dur + 0.05);
}

function tone(out, { at, dur, freq, type = 'sine', gain = 0.1, attack = 0.01 }) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g); g.connect(out);
  o.start(at); o.stop(at + dur + 0.05);
}

// agenda eventos aleatórios ao longo do tempo
function every(minS, maxS, fn) {
  let t = null, alive = true;
  const go = () => {
    if (!alive) return;
    fn(ctx.currentTime + 0.05);
    t = setTimeout(go, (minS + Math.random() * (maxS - minS)) * 1000);
  };
  t = setTimeout(go, minS * 500);
  return () => { alive = false; clearTimeout(t); };
}

const SCENES = {
  chuva(out) {
    const a = loopNoise('pink', out, { lp: 2500, hp: 400, gain: 0.9 });
    const b = loopNoise('brown', out, { lp: 400, gain: 0.5 });
    const drops = every(0.05, 0.25, at => burst(out, { at, dur: 0.04, freq: 2500 + Math.random() * 3000, q: 4, gain: 0.05 + Math.random() * 0.08 }));
    return () => { a.stop(); b.stop(); drops(); };
  },
  cafe(out) {
    const murmur = loopNoise('brown', out, { lp: 700, hp: 120, gain: 0.7 });
    const clinks = every(1.5, 6, at => {
      const f = 2200 + Math.random() * 1800;
      tone(out, { at, dur: 0.6, freq: f, gain: 0.04 });
      tone(out, { at: at + 0.02, dur: 0.4, freq: f * 1.5, gain: 0.02 });
    });
    const cups = every(4, 10, at => burst(out, { at, dur: 0.12, freq: 900, q: 2, gain: 0.08 }));
    return () => { murmur.stop(); clinks(); cups(); };
  },
  lofi(out) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(out);
    const crackle = every(0.05, 0.4, at => burst(out, { at, dur: 0.01, freq: 3000, q: 1, gain: 0.03 * Math.random() }));
    const hiss = loopNoise('pink', out, { lp: 6000, hp: 2000, gain: 0.05 });
    const chords = [[220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 349.2], [164.8, 207.7, 246.9, 329.6]];
    const beat = 60 / 72;
    let bar = 0, alive = true, t = null;
    const play = () => {
      if (!alive) return;
      const at = ctx.currentTime + 0.05;
      for (const f of chords[bar % chords.length]) tone(lp, { at, dur: beat * 4, freq: f, type: 'triangle', gain: 0.035, attack: 0.15 });
      for (let i = 0; i < 4; i++) {
        const k = at + i * beat;
        if (i % 2 === 0) tone(out, { at: k, dur: 0.25, freq: 55, gain: 0.25 });         // bombo
        else burst(out, { at: k, dur: 0.12, freq: 1800, q: 0.8, gain: 0.08 });           // tarola suave
        burst(out, { at: k + beat / 2, dur: 0.03, freq: 8000, type: 'highpass', gain: 0.03 }); // prato
      }
      bar++;
      t = setTimeout(play, beat * 4 * 1000);
    };
    play();
    return () => { alive = false; clearTimeout(t); crackle(); hiss.stop(); };
  },
  biblioteca(out) {
    const room = loopNoise('pink', out, { lp: 900, hp: 80, gain: 0.25 });
    const pages = every(6, 18, at => {
      for (let i = 0; i < 3; i++) burst(out, { at: at + i * 0.07, dur: 0.18, freq: 3500 + Math.random() * 1500, q: 0.7, gain: 0.05 });
    });
    const tick = every(1, 1, at => tone(out, { at, dur: 0.03, freq: 2600, type: 'square', gain: 0.006 }));
    return () => { room.stop(); pages(); tick(); };
  },
};

export function play(name) {
  if (current?.name === name) return;
  stop();
  if (!SCENES[name]) return;
  ensure();
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, ctx.currentTime);
  out.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5); // entra devagar
  out.connect(master);
  const stopScene = SCENES[name](out);
  current = {
    name,
    stop() {
      out.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      setTimeout(() => { stopScene(); out.disconnect(); }, 1200);
    },
  };
}

export function stop() {
  current?.stop();
  current = null;
}

// som curto quando o foco acaba
export function chime() {
  if (!ctx) return;
  const at = ctx.currentTime + 0.02;
  [523.3, 659.3, 784].forEach((f, i) => tone(master, { at: at + i * 0.15, dur: 0.8, freq: f, gain: 0.15 }));
}
