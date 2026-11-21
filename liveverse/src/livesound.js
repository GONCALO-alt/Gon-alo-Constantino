/* =====================================================================
   Sons de live a sério (sintetizados, sem ficheiros): sinos de alerta,
   moedas, fanfarra de raid e multidão, com eco. Contador de seguidores
   com algarismos que sobem. Chat que entende o que dizes ao microfone.
   ===================================================================== */

/* ---------- Motor de som ---------- */
const SFX = { ctx: null, out: null, wet: null };
function sfx() {
  const ctx = audio(); if (!ctx) return null;
  if (SFX.ctx !== ctx) {
    SFX.ctx = ctx;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(ctx.destination);
    const master = ctx.createGain(); master.gain.value = 1; master.connect(comp);
    // eco curto (sala) gerado a partir de ruído
    const len = Math.round(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const conv = ctx.createConvolver(); conv.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = .28; conv.connect(wet).connect(master);
    SFX.out = master; SFX.wet = conv;
  }
  return SFX;
}
function vol() { return S.prefs.volume * .9; }
function bus(ctx, wetAmt = 1) { const g = ctx.createGain(); g.connect(SFX.out); if (wetAmt) { const s = ctx.createGain(); s.gain.value = wetAmt; g.connect(s).connect(SFX.wet); } return g; }
function bell(f, t, d = 1.2, g = .5, ratio = 3.5, idx = 2.2) {
  const ctx = SFX.ctx, at = ctx.currentTime + t;
  const car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), env = ctx.createGain(), o = bus(ctx, 1);
  car.frequency.value = f; mod.frequency.value = f * ratio;
  mg.gain.setValueAtTime(f * idx, at); mg.gain.exponentialRampToValueAtTime(f * .05, at + d);
  mod.connect(mg).connect(car.frequency);
  env.gain.setValueAtTime(.0001, at); env.gain.exponentialRampToValueAtTime(g * vol(), at + .006); env.gain.exponentialRampToValueAtTime(.0001, at + d);
  car.connect(env).connect(o); car.start(at); mod.start(at); car.stop(at + d + .1); mod.stop(at + d + .1);
}
function tonal(f, t, d, g, type = 'triangle', f2) {
  const ctx = SFX.ctx, at = ctx.currentTime + t, o = ctx.createOscillator(), env = ctx.createGain(), lp = ctx.createBiquadFilter(), b = bus(ctx, .7);
  o.type = type; o.frequency.setValueAtTime(f, at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + d * .8);
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 6, at); lp.frequency.exponentialRampToValueAtTime(f * 1.5, at + d);
  env.gain.setValueAtTime(.0001, at); env.gain.exponentialRampToValueAtTime(g * vol(), at + .02); env.gain.setValueAtTime(g * vol(), at + d * .6); env.gain.exponentialRampToValueAtTime(.0001, at + d);
  o.connect(lp).connect(env).connect(b); o.start(at); o.stop(at + d + .05);
}
let NOISE = null;
function noise(ctx) { if (!NOISE || NOISE.sampleRate !== ctx.sampleRate) { NOISE = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return NOISE; }
function whoosh(t, d = .8, g = .35, f1 = 300, f2 = 3200) {
  const ctx = SFX.ctx, at = ctx.currentTime + t, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), env = ctx.createGain(), b = bus(ctx, .8);
  s.buffer = noise(ctx); bp.type = 'bandpass'; bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(f1, at); bp.frequency.exponentialRampToValueAtTime(f2, at + d);
  env.gain.setValueAtTime(.0001, at); env.gain.exponentialRampToValueAtTime(g * vol(), at + d * .7); env.gain.exponentialRampToValueAtTime(.0001, at + d);
  s.connect(bp).connect(env).connect(b); s.start(at, Math.random()); s.stop(at + d + .05);
}
function sparkle(t, n = 6, g = .12) { for (let i = 0; i < n; i++) bell(2600 + Math.random() * 2400, t + i * .045 + Math.random() * .03, .35, g, 2.01, 1); }
function coin(t, g = .35) { tonal(988, t, .09, g, 'square'); tonal(1319, t + .08, .5, g, 'square'); }

const LIVE_SOUNDS = {
  follow: () => { bell(1318.5, 0, 1.3, .45); bell(1975.5, .14, 1.6, .4); },
  sub: () => { [523.3, 659.3, 784].forEach((f, i) => tonal(f, i * .02, 1.2, .14, 'triangle')); bell(1568, .05, 1.6, .35); bell(2093, .22, 1.8, .3); sparkle(.3, 5); },
  gift: () => { coin(0, .22); sparkle(.12, 4); },
  bigGift: () => { coin(0, .25); [1046.5, 1318.5, 1568, 2093].forEach((f, i) => bell(f, .18 + i * .09, 1.2, .3)); sparkle(.5, 8); },
  raid: () => { whoosh(0, .9, .45); [392, 523.3, 659.3, 784].forEach((f, i) => tonal(f, .55 + i * .12, i === 3 ? 1.1 : .25, .2, 'sawtooth')); [392, 523.3, 659.3].forEach(f => tonal(f, 1.1, 1, .1, 'sawtooth')); crowdCheer(.9, .7); },
  milestone: () => { [784, 987.8, 1175, 1568].forEach((f, i) => bell(f, i * .07, 1.5, .28)); },
  viral: () => { whoosh(0, 1, .35, 200, 5000); sparkle(.6, 10, .1); bell(1568, .9, 1.4, .35); },
  goal: () => { [523.3, 659.3, 784, 1046.5].forEach((f, i) => tonal(f, i * .13, i === 3 ? 1.3 : .2, .2, 'sawtooth')); bell(2093, .55, 1.8, .3); sparkle(.6, 8); },
  react: () => { tonal(660, 0, .12, .12, 'sine', 990); },
  surprise: () => { bell(880, 0, .6, .3, 2, 1); bell(1320, .16, .9, .3, 2, 1); },
  ding: () => bell(1318.5, 0, 1.2, .4),
};
const lastS = {};
function sound(name) {
  const now = Date.now(); if (now - (lastS[name] || 0) < 300) return; lastS[name] = now;
  if (!sfx()) return;
  try { (LIVE_SOUNDS[name] || LIVE_SOUNDS.ding)(); } catch (e) { }
}
/* multidão: várias bandas de ruído a pulsar + palmas */
function crowdCheer(intensity = .6, delay = 0) {
  if (!S.prefs.crowd || !sfx()) return;
  const ctx = SFX.ctx, at = ctx.currentTime + delay, dur = 1.8 + intensity * 1.4, g0 = vol() * .25 * intensity;
  [[450, 1.4], [1100, 1], [2400, .7]].forEach(([f, k]) => {
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), env = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), b = bus(ctx, 1);
    s.buffer = noise(ctx); bp.type = 'bandpass'; bp.frequency.value = f * (.9 + Math.random() * .2); bp.Q.value = .9;
    env.gain.setValueAtTime(.0001, at); env.gain.exponentialRampToValueAtTime(g0 * k, at + .35); env.gain.setValueAtTime(g0 * k, at + dur * .55); env.gain.exponentialRampToValueAtTime(.0001, at + dur);
    lfo.frequency.value = 3 + Math.random() * 5; lg.gain.value = g0 * k * .4; lfo.connect(lg).connect(env.gain);
    s.connect(bp).connect(env).connect(b); s.start(at, Math.random()); s.stop(at + dur + .1); lfo.start(at); lfo.stop(at + dur + .1);
  });
  const claps = Math.round(18 + intensity * 30);
  for (let i = 0; i < claps; i++) {
    const t = at + Math.random() * dur * .85, s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), env = ctx.createGain(), b = bus(ctx, 1);
    s.buffer = noise(ctx); hp.type = 'bandpass'; hp.frequency.value = 1400 + Math.random() * 1600; hp.Q.value = 1.5;
    const gg = g0 * (.6 + Math.random() * .8);
    env.gain.setValueAtTime(.0001, t); env.gain.exponentialRampToValueAtTime(gg, t + .004); env.gain.exponentialRampToValueAtTime(.0001, t + .07);
    s.connect(hp).connect(env).connect(b); s.start(t, Math.random() * 2); s.stop(t + .1);
  }
}
function crowd(intensity = .6) { crowdCheer(intensity); }

/* ---------- Contador: o algarismo antigo sobe e o novo entra por baixo ---------- */
function odoHTML(n) { return dots(n).split('').map(ch => /\d/.test(ch) ? `<span class="od">${ch}</span>` : `<span class="od-sep">${ch}</span>`).join(''); }
function setOdoInstant(el, n) {
  const prev = +el.dataset.n || 0; if (prev === n) return;
  el.dataset.n = n;
  const a = dots(prev), b = dots(n);
  if (a.length !== b.length || !el.querySelector('.od')) {
    el.innerHTML = b.split('').map(ch => /\d/.test(ch) ? `<span class="od"><span class="od-r ${n > prev ? 'up' : 'down'}"><span>${ch === '0' ? '9' : ch}</span><span>${ch}</span></span></span>` : `<span class="od-sep">${ch}</span>`).join('');
  } else {
    const cells = el.children;
    b.split('').forEach((ch, i) => {
      if (ch === a[i] || !/\d/.test(ch) || !cells[i]) return;
      const c = cells[i], up = n > prev;
      c.innerHTML = `<span class="od-r ${up ? 'up' : 'down'}"><span>${up ? a[i] : ch}</span><span>${up ? ch : a[i]}</span></span>`;
    });
  }
  clearTimeout(el._odoT);
  el._odoT = setTimeout(() => { el.innerHTML = odoHTML(+el.dataset.n); }, 700);
  el.classList.remove('od-flash'); void el.offsetWidth; el.classList.add('od-flash');
}

/* ---------- O chat entende o que dizes ---------- */
const YN_VERB = /^(e se |achas que |será que |posso |devo |vou |vamos |faço |fazemos |compro |compramos |jogo |jogamos |entro |entramos |mato |pego |apanho |abro |fico |mudo |saio |ataco |roubo |salto |subo |desço |escolho |uso |levo |tento |continuo |paro |acabo |ganho |experimento |meto |ponho |aceito |vou já |bora |queres que |querem que |achas |acham )/i;
const WH = /^(qual|quais|quem|onde|aonde|quando|como|porque|porquê|por que|quanto|quantos|quantas|o que|que)\b/i;
const YES = ['SIM', 'sim!!', 'SIM SIM SIM', 'claro', 'bora', 'vai vai vai', 'faz isso', '100% sim', 'obviamente', 'sim, era bué top', 'era bué top', 'siga', 'vai lá', 'sim 🔥', 'BORAAA', 'claro que sim'];
const NO = ['não', 'NÃO 😂', 'nem pensar', 'nope', 'não faças isso', 'má ideia 💀', 'não não não', 'jamais 😂', 'acho que não'];
const MAYBE = ['talvez', 'depende 🤔', 'hmm talvez', 'não sei 😂', 'tu é que sabes', 'arrisca', 'meh', 'pode ser'];
function topicOf(text) {
  const cleaned = text.replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim();
  const m = cleaned.match(/\b(?:para|pra|a|ao|à|na|no|nessa|nesse|naquela|naquele|aquela|aquele|esta|este|essa|esse|o|a|uma|um)\s+((?:[\p{L}\d-]+\s?){1,3})$/iu);
  let t = m ? m[1] : cleaned.split(' ').slice(-1)[0];
  t = t.replace(/^(aquela|aquele|essa|esse|esta|este|a|o|uma|um)\s+/i, '').trim();
  return t.length > 2 ? t.toLowerCase() : '';
}
function answerLines(text) {
  const t = text.trim(), low = t.toLowerCase();
  const isQ = /\?\s*$/.test(t) || YN_VERB.test(low) || WH.test(low) || /^(chat|malta|pessoal)\b/i.test(low) && /\b(vou|devo|faço|querem|acham|preferem)\b/i.test(low);
  if (!isQ) return null;
  const q = low.replace(/^(chat|malta|pessoal)[,!]?\s*/i, '');
  const topic = topicOf(q);
  // escolha entre opções: «loja ou praia?»
  const ors = q.replace(/\?/g, '').split(/\s+ou\s+/);
  if (ors.length >= 2) {
    const opts = ors.map((o, i) => (i === 0 ? topicOf(o) || o.split(' ').slice(-2).join(' ') : o.replace(/^(para |pra |a |o |à |ao |na |no )/i, '').trim())).filter(Boolean).slice(0, 4);
    const lines = [];
    opts.forEach(o => lines.push(o, `${o}!!`, `${o.toUpperCase()}`, `${o} claro`, `${o} 🔥`));
    lines.push('os dois 😂', 'nenhum', 'tanto faz');
    return { lines, mood: null, hype: .3 };
  }
  if (/^(onde|aonde)\b/.test(q)) return { lines: ['ali à esquerda', 'no mapa!', 'vai para norte', 'não sei 😂', 'atrás de ti', 'perto da praia', 'segue a estrada', 'na cidade', 'ao pé do hospital', 'no telhado 👀'], hype: .2 };
  if (/^quando\b/.test(q)) return { lines: ['AGORA', 'já!!', 'daqui a nada', 'logo', 'amanhã', 'agora mesmo', 'depois desta partida'], hype: .2 };
  if (/^(quanto|quantos|quantas)\b/.test(q)) return { lines: ['10', 'uns 50', '100!!', 'muitos', '3', 'mil 😂', '7', 'nenhum'], hype: .2 };
  if (/^como\b/.test(q)) return { lines: ['à bruta 😂', 'com calma', 'salta primeiro', 'usa o carro', 'como sempre', 'faz o combo', 'não sei mas faz', 'devagar'], hype: .2 };
  if (/^(porque|porquê|por que)\b/.test(q)) return { lines: ['porque sim 😂', 'é o destino', 'boa pergunta', 'porque é top', 'não sabemos', 'skill issue 💀'], hype: .2 };
  if (/^(qual|quais|que|o que)\b/.test(q) && !YN_VERB.test(q)) {
    const lines = ['a primeira', 'a segunda', 'a mais rara 💎', 'surpreende-nos', 'a azul', 'a mais difícil', 'tanto faz'];
    if (/jogo/.test(q)) lines.push(...Object.values(GAMES).filter(g => g.genre !== 'chat').map(g => g.name));
    if (/arma/.test(q)) lines.push('a shotgun', 'sniper!!', 'a pistola 😂', 'AR', 'a lendária');
    if (/carro|mota/.test(q)) lines.push('o desportivo', 'o mais rápido', 'a mota 🏍️', 'o amarelo');
    if (/skin|roupa/.test(q)) lines.push('a preta', 'a dourada ✨', 'a mais feia 😂', 'a do evento');
    return { lines, hype: .25 };
  }
  if (/^quem\b/.test(q)) return { lines: ['EU 🙋', 'eu!!', 'tu claro', 'o chat todo', `${pick(S.accounts).name}!`, 'ninguém 😂'], hype: .2 };
  // sim/não (incluindo «vou para aquela loja?»)
  const lines = [...YES, ...YES.slice(0, 8), ...NO, ...MAYBE];
  if (topic) lines.push(`vai à ${topic}`, `${topic} sim`, `${topic}!!`, `a ${topic} é top`, `nada de ${topic} 😂`, `${topic} era bué top`, `bora ${topic}`, `${topic} não 💀`);
  return { lines, hype: .3, yn: true };
}
function chatRespondLocal(text) {
  const L = S.live; if (!L) return;
  if (chatCommand(L, text)) { L.voice = (L.voice || 0) + 1; avatarEmote('goal'); return; }
  const ans = answerLines(text);
  if (!ans) return chatRespondOld(text);
  const n = respN(L);
  const used = new Map();
  for (let i = 0; i < n; i++) {
    let line = pick(ans.lines), tries = 0;
    while ((used.get(line) || 0) >= 2 && tries++ < 6) line = pick(ans.lines);
    used.set(line, (used.get(line) || 0) + 1);
    setTimeout(() => S.live === L && pushChat({ user: fakeUser(), text: withEmotes(line), hype: true }), 400 + i * rand(55, 130) + Math.random() * 400);
  }
  L.engage = Math.min(3, L.engage + .6);
  L.voice = (L.voice || 0) + 1;
  avatarEmote('surprise');
  if (ans.yn && n >= 6) setTimeout(() => {
    if (S.live !== L) return;
    const yes = randi(40, 75);
    pushChat({ sys: true, text: `O chat respondeu: ${yes}% sim · ${100 - yes}% não` });
  }, 600 + n * 95);
}
