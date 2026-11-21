/* =====================================================================
   Extras da live: microfone (o chat reage ao que dizes), sons e alertas,
   metas de presentes e momentos aleatórios. Tudo simulado.
   ===================================================================== */
Object.assign(IC, {
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  volume: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9 5 6M22 9l-5 6"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
});
const defaultPrefs = () => ({ sound: true, volume: 0.6, randomMoments: true, giftGoal: { title: 'Troco de skin', target: 5000, progress: 0, reached: 0 } });

/* =========================== SONS =========================== */
let AC = null;
function audio() {
  if (!S.prefs.sound) return null;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { return null; }
  return AC;
}
function tone(ctx, { f = 660, t = 0, d = .18, type = 'sine', v = 1, slide = 0 }) {
  const o = ctx.createOscillator(), g = ctx.createGain(), at = ctx.currentTime + t;
  o.type = type; o.frequency.setValueAtTime(f, at); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, at + d);
  const vol = S.prefs.volume * .22 * v;
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(Math.max(vol, .0002), at + .015); g.gain.exponentialRampToValueAtTime(0.0001, at + d);
  o.connect(g).connect(ctx.destination); o.start(at); o.stop(at + d + .05);
}
const SOUNDS = {
  gift: [{ f: 880, d: .12 }, { f: 1175, t: .09, d: .14 }, { f: 1568, t: .18, d: .22 }],
  bigGift: [{ f: 523, d: .14, type: 'triangle' }, { f: 659, t: .1, d: .14, type: 'triangle' }, { f: 784, t: .2, d: .14, type: 'triangle' }, { f: 1047, t: .3, d: .4, type: 'triangle' }],
  follow: [{ f: 620, d: .1 }, { f: 930, t: .08, d: .16 }],
  milestone: [{ f: 523, d: .16, type: 'square', v: .5 }, { f: 784, t: .14, d: .16, type: 'square', v: .5 }, { f: 1047, t: .28, d: .45, type: 'square', v: .5 }],
  raid: [{ f: 220, d: .5, type: 'sawtooth', v: .6, slide: 2 }, { f: 330, t: .35, d: .5, type: 'sawtooth', v: .5, slide: 2 }],
  viral: [{ f: 300, d: .6, type: 'sine', slide: 4 }, { f: 1200, t: .45, d: .3 }],
  react: [{ f: 740, d: .08, type: 'triangle' }, { f: 990, t: .06, d: .1, type: 'triangle' }],
  surprise: [{ f: 988, d: .1 }, { f: 784, t: .1, d: .1 }, { f: 988, t: .2, d: .1 }, { f: 1319, t: .3, d: .25 }],
  goal: [{ f: 523, d: .2, type: 'triangle' }, { f: 659, t: .15, d: .2, type: 'triangle' }, { f: 784, t: .3, d: .2, type: 'triangle' }, { f: 1047, t: .45, d: .2, type: 'triangle' }, { f: 1319, t: .6, d: .6, type: 'triangle' }],
  ding: [{ f: 1046, d: .2, v: .5 }],
};
const lastSound = {};
function soundOld(name) {
  const now = Date.now(); if (now - (lastSound[name] || 0) < 350) return; lastSound[name] = now;
  const ctx = audio(); if (!ctx) return;
  (SOUNDS[name] || SOUNDS.ding).forEach(n => tone(ctx, n));
}

/* =========================== ALERTAS NO ECRÃ =========================== */
const ALERTQ = []; let alertBusy = false;
function alertShow(ic, title, sub, kind = 'gift') {
  if (!S.live) return;
  ALERTQ.push({ ic, title, sub, kind }); if (ALERTQ.length > 4) ALERTQ.shift();
  if (!alertBusy) nextAlert();
}
function nextAlert() {
  const a = ALERTQ.shift(); const box = $('#alertBox');
  if (!a) { alertBusy = false; return; }
  alertBusy = true;
  const AIC = { gift: 'gift', follow: 'heart', raid: 'users', milestone: 'person', goal: 'target', viral: 'bolt' };
  if (box) { box.innerHTML = `<div class="alert alert-${a.kind}"><span class="alert-ic">${icon(AIC[a.kind] || 'bolt')}</span><div><b>${esc(a.title)}</b>${a.sub ? `<small>${esc(a.sub)}</small>` : ''}</div></div>`; }
  setTimeout(() => { if (box) box.innerHTML = ''; setTimeout(nextAlert, 250); }, 2600);
}

/* =========================== METAS DE PRESENTES =========================== */
const GOAL_PRESETS = [['Troco de skin', 5000], ['Desafio sem armas', 2000], ['Live de 3 horas', 10000], ['Jogar com o chat', 1500], ['Setup novo (fictício)', 25000]];
function goalAdd(val) {
  const G = S.prefs.giftGoal; if (!G || G.progress >= G.target) return;
  G.progress = Math.min(G.target, G.progress + val);
  paintGoal();
  if (G.progress >= G.target) {
    G.reached = (G.reached || 0) + 1;
    sound('goal'); crowd(.9); fxBurst('🎯', 'META ALCANÇADA!');
    addTimeline('gift', `Meta de presentes alcançada: ${G.title} (${dots(G.target)} moedas virtuais)`, '🎯', { hype: .8, reactLabel: 'Meta de presentes', clipTitle: 'Meta alcançada: ' + G.title });
    pushChat({ sys: true, text: `🎯 META DE PRESENTES ALCANÇADA: ${G.title}!` });
    const L = S.live;
    for (let i = 0; i < 8; i++) setTimeout(() => S.live === L && pushChat({ user: fakeUser(), text: pick(['CONSEGUIMOS!! 🎯', 'META BATIDA 🔥', 'AGORA TENS DE CUMPRIR 😂', 'GG CHAT 💜', `${G.title.toUpperCase()}!!!`]), hype: true }), 200 + i * 160);
    notify('🎯', `Meta de presentes alcançada: ${G.title}!`);
    alertShow('🎯', 'Meta alcançada!', G.title, 'goal');
  }
  save();
}
function goalBarHTML() {
  const G = S.prefs.giftGoal; if (!G) return '';
  const pct = Math.min(100, G.progress / G.target * 100);
  return `<div class="goal-overlay ${pct >= 100 ? 'done' : ''}" id="goalOverlay"><span>🎯 ${esc(G.title)}</span><div class="goal-bar"><i style="width:${pct}%"></i></div><b class="num">${dots(G.progress)} / ${dots(G.target)}</b></div>`;
}
function paintGoal() { paintGoalBanner(); const el = $('#goalOverlay'); if (el) el.outerHTML = goalBarHTML(); const p = $('#goalPanel'); if (p) p.outerHTML = goalPanelHTML(); }
function goalPanelHTML() {
  const G = S.prefs.giftGoal, pct = Math.min(100, G.progress / G.target * 100);
  return `<div id="goalPanel" class="stack" style="gap:10px">
    <div class="row"><b>${esc(G.title)}</b><span class="spacer"></span><span class="num small">${dots(G.progress)} / ${dots(G.target)} moedas</span></div>
    <div class="goal-bar" style="height:10px"><i style="width:${pct}%"></i></div>
    ${pct >= 100 ? `<div class="row"><span class="small" style="color:var(--good);font-weight:700">✅ Meta alcançada!</span><span class="spacer"></span><button class="btn btn-sm btn-primary" data-act="goal-reset">Nova meta</button></div>` : ''}
    <form class="stack" data-form="goal" style="gap:8px">
      <div class="chip-row">${GOAL_PRESETS.map(([t, v]) => `<button type="button" class="chip" data-act="goal-preset" data-t="${esc(t)}" data-v="${v}">${esc(t)} · ${fmt(v)}</button>`).join('')}</div>
      <div class="grid-2"><input class="input" name="title" id="goalTitle" maxlength="40" placeholder="Nome da meta" value="${esc(G.title)}"><input class="input" type="number" name="target" id="goalTarget" min="10" max="10000000" value="${G.target}" aria-label="Moedas necessárias"></div>
      <button class="btn btn-sm" style="align-self:flex-start">Guardar meta</button>
    </form>
  </div>`;
}

/* =========================== MOMENTOS ALEATÓRIOS =========================== */
const SURPRISES = [
  { id: 'famous', ic: '🌟', title: 'Um streamer famoso (fictício) entrou no chat!', text: () => `${pick(S.accounts).name} está a ver a tua live.`, choices: [
    ['Cumprimentar em direto', s => { boost(.12); chatBurst(['ELE CUMPRIMENTOU-O 😭', 'COLLAB QUANDO?', 'QUE MOMENTO 🔥', 'OS DOIS JUNTOS!!']); follow(.004); }],
    ['Fingir que não viste', s => chatBurst(['IGNORASTE-O?! 😂', 'chat viu tudo 👀', 'que frieza 🧊'])]] },
  { id: 'lag', ic: '📡', title: 'A live caiu durante 5 segundos!', text: () => 'Alguns espectadores saíram. O que dizes ao chat?', pre: () => { S.live.viewers *= .88; }, choices: [
    ['Pedir desculpa', () => { boost(.03); chatBurst(['tudo bem 💜', 'acontece!', 'voltou 🙌', 'internet de batata 😂']); }],
    ['Fingir que nada aconteceu', () => chatBurst(['ninguém reparou 😂', 'LAG LAG LAG', 'a internet foi passear', 'que se passou?? 😂'])]] },
  { id: 'subs', ic: '🎁', title: 'Alguém ofereceu 100 subs!', text: () => `${fakeUser()} ofereceu 100 subscrições fictícias.`, choices: [
    ['Agradecer em grande', () => { gift(2500); follow(.006); chatBurst(['QUE LENDA 👑', 'OBRIGADO PELO SUB!!', '100 SUBS?!?! 😭', 'chuva de subs 🌧️💜']); fxBurst('🎁', '100 SUBS!'); }],
    ['Agradecer rapidamente', () => { gift(2500); chatBurst(['obrigado!! 💜', 'GG']); }]] },
  { id: 'challenge', ic: '🎯', title: 'O chat pede um desafio!', text: () => pick(['Ganhar a próxima partida sem usar armas.', 'Jogar o próximo jogo só com uma mão.', 'Não falar durante 2 minutos.', 'Fazer 3 kills seguidas.']), choices: [
    ['Aceitar desafio', () => { boost(.1); S.live.engage = Math.min(3, S.live.engage + .8); chatBurst(['ACEITOU!! 😳', 'isto vai correr mal 😂', 'BORA', 'clip ready 🎬']); }],
    ['Recusar', () => chatBurst(['FRACO 😂', 'medroso 🐔', 'buuuu', 'fica para a próxima'])]] },
  { id: 'troll', ic: '🤬', title: 'Um troll está a fazer spam no chat', text: () => 'O chat está a ficar irritado.', pre: () => { for (let i = 0; i < 3; i++) setTimeout(() => S.live && pushChat({ user: 'hater_x', text: pick(['esta live é uma seca', 'FFFFFFFFFFFFFFFFFFFF', 'és mau 🙄']), troll: true, color: '#9aa0b4' }), i * 300); }, choices: [
    ['Banir o troll', () => { if (!S.mod.banned.some(b => b.u === 'hater_x')) S.mod.banned.unshift({ u: 'hater_x', t: Date.now() }); S.mod.stats.banned++; hideUserMsgs('hater_x', 'hater_x foi banido do chat'); pushChat({ sys: true, mod: true, text: '🔨 hater_x foi banido do chat.' }); chatBurst(['obrigado mod 🙏', 'BANIDO 🔨', 'chat limpo 💜']); rerenderMod(); }],
    ['Ignorar', () => chatBurst(['bane-o!!', 'ignora os haters 💜', 'não lhe ligues'])]] },
  { id: 'pet', ic: '🐱', title: 'O teu animal de estimação apareceu na câmara!', text: () => 'O chat está a pedir para o ver.', choices: [
    ['Mostrar ao chat', () => { boost(.1); follow(.005); chatBurst(['QUE FOFO 😍', 'MOSTRA MAIS', 'o verdadeiro streamer chegou 😂', '🐱🐱🐱', 'ESTE É O MELHOR MOMENTO DA LIVE']); fxBurst('😍', 'QUE FOFO!'); }],
    ['Tirar daí', () => chatBurst(['NÃÃÃO 😭', 'deixa-o ficar!!', 'justiça para o gato'])]] },
  { id: 'music', ic: '🎵', title: 'Está a tocar música com direitos de autor!', text: () => 'Podes ter problemas na simulação.', choices: [
    ['Desligar já', () => chatBurst(['boa decisão', 'a música estava top 😢', 'DMCA evitado ✅'])],
    ['Arriscar', () => { if (Math.random() < .5) { S.live.viewers *= .85; pushChat({ sys: true, text: '⚠️ Aviso fictício de direitos de autor: alguns espectadores saíram.' }); chatBurst(['eu avisei 😂', 'ups']); } else chatBurst(['que música top 🎶', 'ninguém viu 😂', 'BANGER']); }]] },
  { id: 'sponsor', ic: '💼', title: 'Uma marca fictícia quer patrocinar esta live', text: () => `A «${pick(['Energia Turbo', 'PixelChairs', 'NovaHeadsets', 'MegaSnacks'])}» oferece 800 moedas virtuais.`, choices: [
    ['Aceitar patrocínio', () => { gift(800); chatBurst(['PATROCINADO 💼', 'vendido 😂', 'parabéns!!', 'código de desconto?']); }],
    ['Recusar', () => chatBurst(['independente 💪', 'respeito', 'leal à comunidade 💜'])]] },
  { id: 'snack', ic: '🍕', title: 'Estás com fome. Pausa para lanche?', text: () => 'O chat está a ver-te olhar para a cozinha.', choices: [
    ['Pausa de 1 minuto', () => { S.live.viewers *= .93; chatBurst(['traz para nós 🍕', 'o que vais comer?', 'pausa merecida', 'ficamos à espera 💜']); }],
    ['Continuar a jogar', () => { boost(.04); chatBurst(['MÁQUINA', 'quem precisa de comer 😂', 'dedicação 🔥']); }]] },
  { id: 'surpriseRaid', ic: '🛡️', title: 'Raid surpresa a chegar!', text: () => 'Um canal fictício está a enviar a comunidade toda.', choices: [
    ['Dar as boas-vindas', () => { raid(); chatBurst(['BEM-VINDOS!! 👋', 'raid gang 🛡️']); }],
    ['Continuar como se nada fosse', () => raid()]] },
];
function boost(f) { const L = S.live; if (L) L.boost += (LEVELS[L.level] || LEVELS.media).max * f; }
function follow(f) { const L = S.live; if (!L) return; const n = Math.round(L.viewers * f + 1); L.followers += n; S.me.followers += n; alertShow('💜', `+${dots(n)} novos seguidores`, 'seguidores fictícios', 'follow'); sound('follow'); }
function gift(v) { const L = S.live; if (!L) return; L.gifts += v; goalAdd(v); hypeAdd(v); alertShow('🎁', `${dots(v)} moedas virtuais`, 'presente fictício', 'gift'); giftSound(); }
function chatBurst(lines) { const L = S.live; lines.forEach((t, i) => setTimeout(() => S.live === L && pushChat({ user: fakeUser(), text: t, hype: true }), 150 + i * 220)); }
function surpriseTick(L) {
  if (!S.prefs.randomMoments || L.surprise || ['starting', 'ending', 'brb'].includes(L.scene) || (isReal(L) && L.viewers < 3)) return;
  const e = (Date.now() - L.start) / 1000;
  L.nextSurprise = L.nextSurprise || L.start + rand(35000, 60000);
  if (e < 30 || Date.now() < L.nextSurprise) return;
  const used = L.usedSurprises || (L.usedSurprises = []);
  const pool = SURPRISES.filter(s => !used.includes(s.id));
  const s = pick(pool.length ? pool : SURPRISES);
  used.push(s.id);
  L.surprise = { id: s.id, text: s.text(), until: Date.now() + 25000 };
  s.pre && s.pre();
  sound('surprise');
  paintSurprise();
  if (route().name !== 'estudio') toast(s.ic, 'Momento surpresa: ' + s.title);
}
function surpriseCheck(L) { if (L.surprise && Date.now() > L.surprise.until) resolveSurprise(1); else if (L.surprise) { const t = $('#surpriseTime'); if (t) t.textContent = Math.max(0, Math.ceil((L.surprise.until - Date.now()) / 1000)); } }
function resolveSurprise(i) {
  const L = S.live; if (!L || !L.surprise) return;
  const s = SURPRISES.find(x => x.id === L.surprise.id); L.surprise = null;
  L.nextSurprise = Date.now() + rand(70000, 130000);
  if (s) { const [label, fn] = s.choices[i] || s.choices[1]; try { fn(s); } catch (e) { } addTimeline('surprise', `Momento surpresa: ${s.title} → ${label}`, s.ic, { hype: .5, reactLabel: 'Momento surpresa', clipTitle: s.title }); }
  paintSurprise(); updateLiveBits(); save();
}
function surpriseHTML() {
  const L = S.live; if (!L || !L.surprise) return '';
  const s = SURPRISES.find(x => x.id === L.surprise.id); if (!s) return '';
  return `<section class="card surprise"><div class="surprise-ic">${s.ic}</div><div class="surprise-body"><span class="tiny muted">MOMENTO SURPRESA · escolhe em <b id="surpriseTime">${Math.max(0, Math.ceil((L.surprise.until - Date.now()) / 1000))}</b> s</span><strong>${esc(s.title)}</strong><span class="small muted">${esc(L.surprise.text)}</span>
    <div class="row">${s.choices.map(([l], i) => `<button class="btn btn-sm ${i === 0 ? 'btn-primary' : ''}" data-act="surprise-choice" data-i="${i}">${esc(l)}</button>`).join('')}</div></div></section>`;
}
function paintSurprise() { $$('[data-surprise]').forEach(el => el.innerHTML = surpriseHTML()); }

/* =========================== MICROFONE =========================== */
const MIC = { api: null, d: null, rec: null, on: false, state: 'idle', partial: '', heard: [], ready: false };
async function micInit() {
  try {
    if (window.claude && typeof window.claude.use === 'function') {
      const d = await window.claude.use('dictation');
      if (d) {
        MIC.api = 'claude'; MIC.d = d;
        d.onPartial(({ text }) => { MIC.partial = text; paintMicLive(); });
        d.onFinal(({ text }) => { MIC.partial = ''; heard(text); });
        d.onState(({ state, reason }) => {
          MIC.state = state; MIC.on = state !== 'idle';
          if (state === 'idle' && reason && !['stopped', 'viewer_stopped', 'hidden'].includes(reason)) micError(reason);
          paintMic();
        });
      }
    }
  } catch (e) { }
  if (!MIC.api) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) MIC.api = 'web';
  }
  MIC.ready = true; paintMic();
}
function micStart() {
  if (MIC.api === 'claude') {
    MIC.d.start().catch(err => { micError(err && err.code); paintMic(); });
    return;
  }
  if (MIC.api === 'web') {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      const r = new SR(); r.lang = 'pt-PT'; r.continuous = true; r.interimResults = true;
      r.onresult = ev => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) { const res = ev.results[i]; if (res.isFinal) heard(res[0].transcript); else interim += res[0].transcript; }
        MIC.partial = interim; paintMicLive();
      };
      r.onerror = ev => { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') { MIC.on = false; micError('not_granted'); } };
      r.onend = () => { if (MIC.on) { try { r.start(); } catch (e) { MIC.on = false; paintMic(); } } else { MIC.state = 'idle'; paintMic(); } };
      r.start(); MIC.rec = r; MIC.on = true; MIC.state = 'listening'; paintMic();
    } catch (e) { micError('unavailable'); }
    return;
  }
  toast('🎙️', 'O microfone não está disponível neste navegador. Escreve o que disseste no campo por baixo.');
}
function micStop() {
  MIC.on = false;
  if (MIC.api === 'claude') MIC.d.stop().catch(() => { });
  if (MIC.api === 'web' && MIC.rec) { try { MIC.rec.stop(); } catch (e) { } }
  MIC.state = 'idle'; MIC.partial = ''; paintMic();
}
function micError(code) {
  const msg = { not_granted: 'Não deste permissão ao microfone. Podes mudar isso nas permissões do artifact ou do navegador.', dismissed: 'Fechaste o pedido de permissão. Carrega outra vez no botão para tentar de novo.', unavailable: 'O microfone não está disponível aqui. Usa o Chrome no computador ou escreve o que disseste.', rate_limited: 'Demasiados pedidos ao microfone. Tenta daqui a pouco.', upstream_error: 'O microfone falhou. Tenta outra vez.' }[code];
  if (msg) toast('🎙️', msg, 5200);
  if (code === 'unavailable') MIC.api = null;
}
function heard(raw) {
  const text = String(raw || '').trim(); if (!text) return;
  if (MIC.api === 'web' && Date.now() < (MIC.ignoreUntil || 0) && !heard.typed) return;
  avatarTalk();
  if (heard.typed) { MIC.heard.unshift({ t: Date.now(), text }); MIC.heard = MIC.heard.slice(0, 6); paintMic(); if (S.live) chatRespond(text); return; }
  MIC.buf = (MIC.buf ? MIC.buf + ' ' : '') + text;
  clearTimeout(MIC.bufT);
  MIC.bufT = setTimeout(() => {
    const full = MIC.buf.trim(); MIC.buf = '';
    MIC.heard.unshift({ t: Date.now(), text: full }); MIC.heard = MIC.heard.slice(0, 6);
    paintMic();
    if (S.live) chatRespond(full);
  }, 900);
}

/* O chat responde ao que disseste */
const VOICE_RULES = [
  { re: /\b(ha){2,}|\bhehe|\bkkk|\blol\b|piada|engraçad|a rir|rir-me|que risada/i, lines: ['HAHAHAHAHA', '😂😂😂', 'morri a rir 💀', 'o riso dele 😭', 'KKKKKKK', 'conta outra!!', 'essa foi boa 😂'], hype: .25, mood: 'funny' },
  { re: /se (me )?(estão|estiverem|tão) a ouvir|estão-me a ouvir|ouvem-me|está a dar som|há som|alguém (me )?ouve/i, lines: ['SIM!!', 'estou a ouvir 👂', 'ouvimos-te bem', 'sim, ouço tudo', 'alto e bom som 🔊', 'sim sim', 'ouço perfeitamente', 'tudo a dar 👍'], hype: .2, many: true },
  { re: /(^|\s)(olá|ola|oi|boas|bom dia|boa tarde|boa noite|e aí|eae|hey|salve)(\s|$|[,!.])|sejam bem[- ]vindos|bem[- ]vindos/i, lines: ['BOAS!! 👋', 'olá {me} 💜', 'salve!!', 'boa noite chat', 'cheguei 👋', 'olááá', 'presente ✋'], hype: .1 },
  { re: /sigam|segue-me|seguir o canal|ativem|subscrev|deixem o like|partilhem/i, lines: ['já sigo!! 💜', 'seguido ✅', 'like dado 👍', 'partilhei!', 'sub feito 🔔'], hype: .1, fol: .004 },
  { re: /presente|doações|doa[çc]|moedas|apoiem/i, lines: ['toma lá 🎁', 'vou mandar um foguetão 🚀', 'apoio sempre!', 'só tenho 3 moedas 😂'], hype: .08, gifts: true },
  { re: /obrigad|valeu|agradeço/i, lines: ['de nada!! 💜', 'nós é que agradecemos', '💜💜💜', 'sempre contigo', 'tu mereces'], hype: .06 },
  { re: /adeus|tchau|até amanhã|até já|vou terminar|acabar a live|vou embora|fim da live/i, lines: ['NÃÃÃO fica mais 😭', 'até amanhã 👋', 'mais 5 minutos!!', 'que live top, obrigado', 'bye bye 💜'], hype: .04 },
  { re: /ganhei|vitória|consegui|vencemos|ganhámos|top ?1|let'?s go|bora|vamos lá|siu+/i, lines: ['LETS GOOOO 🔥', 'GGGG', 'BORA BORA BORA', 'ÉS UMA MÁQUINA', 'SIUUUU', 'CAMPEÃO 👑'], hype: .35, mood: 'win', fol: .003 },
  { re: /não acredito|que raiva|perdi|morri|azar|bolas|fogo|que nervos|odeio isto|outra vez não/i, lines: ['F', 'calma calma 😂', 'respira fundo', 'próxima é nossa 💜', 'o rage 😂', 'acontece!!', 'NÃÃÃO 😭'], hype: .12, mood: 'sad' },
  { re: /susto|medo|assust|aaa+h*|ai meu deus|que é isto|o que foi isto/i, lines: ['AHAHA ele assustou-se 😂', 'o grito 😭', 'EU TAMBÉM SALTEI', 'clip do susto 🎬', 'coração a mil 💓'], hype: .3, mood: 'scary' },
  { re: /cant(ar|o)|música|musica|canção/i, lines: ['canta mais!! 🎤', 'que voz 😂', 'BIS BIS', 'põe a música mais alta 🎶'], hype: .1 },
  { re: /fome|comer|pizza|jantar|lanche/i, lines: ['traz para nós 🍕', 'o que vais comer?', 'eu também tenho fome 😂', 'pizza 🍕🍕'], hype: .05 },
  { re: /sono|cansad|dormir/i, lines: ['vai dormir 😂', 'café ☕', 'só mais uma partida', 'live até às 4 da manhã!!'], hype: .04 },
];
function chatCommand(L, text) {
  // «digam olá», «escrevam GG», «mandem corações»: muita gente faz o que pediste
  const m = text.match(/\b(digam|diz(?:ei)?|escrevam|mandem|ponham|metam|spammem|enviem)\s+(?:aí\s+|ai\s+|lá\s+|no chat\s+|todos\s+)*["«“]?([^,.!?»”"]{1,30})/i);
  if (!m) return false;
  let word = m[2].trim().replace(/\s+(no chat|aí|ai|todos|pessoal|malta)$/i, '').trim();
  if (!word) return false;
  if (/^cora[çc](ão|ões)$/i.test(word)) word = '💜';
  const variants = [word, word, word, word.toUpperCase(), word + '!!', word + ' 👋', word.toLowerCase() + ' ' + S.me.name.split(' ')[0], word + ' 💜', word.toUpperCase() + '!!!', word + ' 😄'];
  let n = clamp(Math.round(8 + Math.log10(L.viewers + 1) * 4), 8, 28);
  if ((LEVELS[L.level] || {}).realistic) n = Math.min(n, Math.max(0, Math.round(L.viewers * .9)));
  for (let i = 0; i < n; i++) setTimeout(() => S.live === L && pushChat({ user: fakeUser(), text: pick(variants), hype: true }), 250 + i * rand(70, 190));
  L.engage = Math.min(3, L.engage + .5);
  return true;
}
function chatRespondOld(text) {
  const L = S.live; const t = text.toLowerCase();
  if (chatCommand(L, text)) { L.voice = (L.voice || 0) + 1; avatarEmote('goal'); return; }
  const me = S.me.name.split(' ')[0];
  let lines = [], hype = .08, rule = null;
  const matched = VOICE_RULES.filter(r => r.re.test(t));
  matched.forEach(r => { lines = lines.concat(r.lines); hype = Math.max(hype, r.hype); rule = rule || r; });
  // nome de um jogo
  for (const [k, G] of Object.entries(GAMES)) if (t.includes(G.name.toLowerCase()) && k !== 'chat') lines.push(`${G.name} 🔥`, `bora ${G.name}!!`, k === L.game ? 'é o melhor jogo' : `muda para ${G.name}!`);
  // perguntas ao chat
  const question = /\?\s*$/.test(text) || /^(chat|malta|pessoal)[,!]?\s/i.test(t) || /o que acham|que acham|vocês|qual (é|preferem|querem)|quem (é|quer|acha)|querem que|devo |faço /i.test(t);
  if (question && !(rule && rule.many)) {
    if (/que jogo|qual jogo|jogo querem|jogo jogo/i.test(t)) { const gs = Object.values(GAMES).filter(g => g.genre !== 'chat').map(g => g.name); lines.push(...Array.from({ length: 6 }, () => pick(gs) + pick(['!!', ' 🔥', '', ' por favor 🙏'])), 'tanto faz 😂', 'GTA VI!!'); }
    else if (/qual|que arma|que mapa|que modo|que skin/i.test(t)) lines.push('a primeira', 'a segunda', 'tanto faz 😂', 'a mais difícil', 'surpreende-nos', 'a mais rara 💎');
    else if (/sim ou não|sim ou nao|devo|faço|querem que/i.test(t)) lines.push('SIM', 'SIM!!', 'não 😂', 'claro que sim', 'NÃO FAÇAS ISSO 😂', 'SIM SIM SIM', 'faz!!');
    else if (/quem/i.test(t)) lines.push('EU 🙋', 'eu!!', `${pick(S.accounts).name}!`, 'tu claro 😂', 'o chat todo');
    else lines.push('eu acho que sim', 'depende 🤔', 'boa pergunta', 'SIM', 'não sei 😂', 'concordo!', 'claro');
    hype = Math.max(hype, .12);
  }
  // eco do que disseste
  const words = text.replace(/[^\p{L}\d\s]/gu, ' ').split(/\s+/).filter(w => w.length > 4);
  if (!lines.length) {
    const w = words.length ? pick(words).toLowerCase() : '';
    lines.push('verdade', 'concordo', 'hmm 🤔', 'exatamente!', 'isso mesmo', 'LOL', 'repete isso 😂');
    if (w) lines.push(`${w}?? 😂`, `«${w}» 😂`, `ele disse ${w} 💀`);
  } else if (!question && words.length && Math.random() < .4) {
    const short = text.length > 40 ? text.slice(0, 38) + '…' : text;
    lines.push(`"${short}" 😂`);
  }
  let n = clamp(Math.round((rule && rule.many ? 9 : 6) + hype * 12 + Math.log10(L.viewers + 1) * 2), 6, 22);
  if ((LEVELS[L.level] || {}).realistic) n = Math.min(n, Math.max(0, Math.round(L.viewers * .8)));
  const used = new Set();
  for (let i = 0; i < n; i++) {
    let line = pick(lines); if (used.has(line) && lines.length > used.size) line = pick(lines); used.add(line);
    setTimeout(() => S.live === L && pushChat({ user: fakeUser(), text: line.replace('{me}', me), hype: hype >= .2 }), 350 + i * rand(120, 300));
  }
  L.engage = Math.min(3, L.engage + hype * .8); L.boost += (LEVELS[L.level] || LEVELS.media).max * hype * .02;
  if (rule && rule.fol) follow(rule.fol);
  if (rule && rule.gifts) setTimeout(() => S.live === L && giftEvent(), 1200);
  if (rule && rule.mood) { L.lastMood = rule.mood; L.lastMoodAt = Date.now(); avatarEmote(rule.mood); }
  else if (question) avatarEmote('surprise');
  L.voice = (L.voice || 0) + 1;
}

function micPanelHTML() {
  const avail = MIC.api ? true : !MIC.ready;
  const listening = MIC.on || MIC.state === 'listening' || MIC.state === 'starting';
  return `<div class="mic-panel" data-micpanel>
    <div class="row">
      <button class="btn ${listening ? 'btn-live' : 'btn-primary'}" data-act="mic-toggle" ${avail ? '' : 'disabled'}>${icon(listening ? 'close' : 'mic')} ${listening ? 'Desligar microfone' : 'Ligar microfone'}</button>
      <span class="mic-state ${listening ? 'on' : ''}"><i></i>${!MIC.ready ? 'A verificar…' : !MIC.api ? 'Microfone indisponível neste navegador' : MIC.state === 'starting' ? 'A pedir acesso…' : listening ? 'A ouvir-te' : 'Desligado'}</span>
    </div>
    <p class="tiny muted" style="margin:0">O chat fictício ouve o que dizes e responde: ri-se das piadas, responde a perguntas, cumprimenta, consola-te quando perdes. O microfone não aparece na live.</p>
    <div class="mic-live" id="micLive">${MIC.partial ? `<i>${esc(MIC.partial)}…</i>` : ''}</div>
    ${MIC.heard.length ? `<div class="mic-heard">${MIC.heard.map(h => `<div><time>${hhmm(h.t)}</time> «${esc(h.text)}»</div>`).join('')}</div>` : ''}
    <form class="reply-form" data-form="say"><input class="input" id="sayInput" name="t" maxlength="200" placeholder="Ou escreve o que disseste em voz alta…" autocomplete="off"><button class="btn btn-sm">Dizer</button></form>
  </div>`;
}
function paintMic() { if (typeof paintQA === 'function') paintQA(); $$('[data-micpanel]').forEach(el => el.outerHTML = micPanelHTML()); const b = $('#dockMic'); if (b) b.classList.toggle('on', MIC.on); }
function paintMicLive() { if (MIC.partial) avatarTalk(); const el = $('#micLive'); if (el) el.innerHTML = MIC.partial ? `<i>${esc(MIC.partial)}…</i>` : ''; }

function soundPanelHTML() {
  return `<div class="row sound-row" data-soundpanel>
    <button class="icon-btn" data-act="sound-toggle" aria-label="${S.prefs.sound ? 'Desligar sons' : 'Ligar sons'}" title="${S.prefs.sound ? 'Desligar sons' : 'Ligar sons'}">${icon(S.prefs.sound ? 'volume' : 'mute')}</button>
    <input type="range" class="vol" id="volRange" data-vol min="0" max="1" step="0.05" value="${S.prefs.volume}" aria-label="Volume dos alertas" ${S.prefs.sound ? '' : 'disabled'}>
    <button class="btn btn-xs" data-act="gift-sound-test">Testar som dos presentes</button>
    <label class="btn btn-xs upload">Trocar som<input type="file" accept="audio/*" data-file="gift-sound" id="giftSoundFile"></label>
    ${S.prefs.giftSound ? '<button class="btn btn-xs btn-ghost" data-act="gift-sound-reset">Som original</button>' : ''}
  </div>`;
}

const EXTRA_ACT = {
  'mic-toggle': () => { if (MIC.on || MIC.state === 'listening' || MIC.state === 'starting') micStop(); else micStart(); },
  'surprise-choice': b => resolveSurprise(+b.dataset.i),
  'sound-toggle': () => { S.prefs.sound = !S.prefs.sound; save(); $$('[data-soundpanel]').forEach(el => el.outerHTML = soundPanelHTML()); if (S.prefs.sound) sound('ding'); },
  'sound-test': () => { const list = ['gift', 'follow', 'milestone', 'raid', 'goal']; list.forEach((n, i) => setTimeout(() => { lastSound[n] = 0; sound(n); }, i * 700)); },
  'goal-preset': b => { const f = $('[data-form="goal"]'); if (f) { f.title.value = b.dataset.t; f.target.value = b.dataset.v; } },
  'goal-reset': () => { S.prefs.giftGoal.progress = 0; save(); paintGoal(); },
};
const EXTRA_FORMS = {
  say: f => { const t = f.t.value.trim(); if (!t) return; f.t.value = ''; heard.typed = true; heard(t); heard.typed = false; if (!S.live) toast('🎙️', 'Entra em direto para o chat reagir ao que dizes.'); },
  goal: f => { const G = S.prefs.giftGoal; const title = f.title.value.trim() || 'Meta de presentes'; const target = clamp(Math.round(+f.target.value || 0), 10, 10000000); const changed = title !== G.title || target !== G.target; G.title = title; G.target = target; if (changed && G.progress >= target) G.progress = 0; save(); paintGoal(); toast('🎯', 'Meta de presentes guardada'); },
};
function onExtraInput(t) {
  if (t.hasAttribute('data-vol')) { S.prefs.volume = +t.value; save(); return true; }
  if (t.dataset.studio === 'randomMoments') { S.prefs.randomMoments = t.checked; save(); return true; }
  return false;
}
