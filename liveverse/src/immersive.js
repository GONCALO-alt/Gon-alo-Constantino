/* =====================================================================
   Imersão: cenas (como no OBS), avatar que fala contigo, presentes lidos
   em voz alta, hype train, espectadores habituais, som de multidão e
   modo teatro. Tudo simulado.
   ===================================================================== */
Object.assign(IC, {
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
});
const defaultImmersive = () => ({ cam: true, tts: true, crowd: true, camImg: null });

/* =========================== CENAS =========================== */
const SCENES = [
  ['starting', '⏳', 'A começar'], ['game', '🎮', 'Jogo'], ['chat', '💬', 'Conversa'], ['brb', '☕', 'Volto já'], ['ending', '👋', 'Fim'],
];
const SCENE_FACTOR = { starting: .35, game: 1, chat: .95, brb: .72, ending: .85 };
const CHAT_QUESTIONS = ['de onde és?', 'qual é o teu jogo favorito?', 'tens animais de estimação?', 'quando é a próxima live?', 'qual foi o teu melhor momento de sempre?', 'o que comeste hoje? 😂', 'fazes live amanhã?', 'qual é o teu setup?', 'jogas com o chat um dia?', 'dás dicas para começar a fazer lives?', 'qual é a tua música favorita?', 'preferes Fortnite ou Minecraft?'];
const SCENE_AMBIENT = {
  starting: ['já começou?', 'cheguei cedo 😎', 'olá!!', 'estou à espera 👀', 'bora bora', 'primeiro!!', 'a música de espera é top 🎶', 'quanto falta?', 'hoje vai ser épico'],
  brb: ['à espera... ⏳', 'quanto tempo?', '🍿🍿', 'volta depressa!', 'o chat toma conta da live 😂', 'ainda aqui 💜', 'AFK 😴', 'vou buscar um lanche também'],
  chat: CHAT_QUESTIONS,
  ending: ['NÃÃÃO já acabou?', 'obrigado pela live 💜', 'até amanhã!!', 'que live top', 'GG', 'próxima quando?', '👋👋', 'melhor live da semana'],
};
const sceneFactor = L => SCENE_FACTOR[L.scene || 'game'] || 1;
function sceneLine(L) {
  if (!L.scene || L.scene === 'game') return null;
  const p = L.scene === 'chat' ? .4 : .6;
  return Math.random() < p ? pick(SCENE_AMBIENT[L.scene]) : null;
}
function setScene(s, quiet) {
  const L = S.live; if (!L || L.scene === s) return;
  L.scene = s; L.sceneAt = Date.now();
  if (s === 'starting') L.sceneUntil = Date.now() + 20000;
  const name = (SCENES.find(x => x[0] === s) || [])[2];
  if (!quiet) addTimeline('scene', 'Cena: ' + name, (SCENES.find(x => x[0] === s) || [])[1]);
  const lines = { game: ['COMEÇOU!! 🔥', 'BORA', 'finalmente 😭', 'vamos a isso'], chat: ['conversa!! 💬', 'adoro estas partes', 'pergunta-me algo!'], brb: ['volta depressa!', 'ok à espera ⏳'], ending: ['NÃÃÃO 😭', 'obrigado pela live 💜'], starting: ['já começa!!'] }[s];
  if (lines) chatBurst(lines);
  if (s === 'game' && !quiet) crowd(.6);
  paintScreen(); paintScenes(); save();
}
function scenesHTML() {
  const cur = S.live?.scene || 'game';
  return `<div class="scenes" data-scenes role="group" aria-label="Cenas da live"><span class="scenes-label">${icon('layers')} Cena</span>${SCENES.map(([k, e, l]) => `<button class="scene-btn ${cur === k ? 'on' : ''}" data-act="scene" data-s="${k}" aria-pressed="${cur === k}"><span>${e}</span>${l}</button>`).join('')}</div>`;
}
function paintScenes() { $$('[data-scenes]').forEach(el => el.outerHTML = scenesHTML()); }

/* =========================== ECRÃ =========================== */
function camHTML(big = false) {
  if (!S.prefs.cam && !big) return '';
  const img = S.prefs.camImg || S.me.avatar;
  const face = img ? `<img src="${img}" alt="">` : `<span>${esc((S.me.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase())}</span>`;
  return `<div class="cam ${big ? 'cam-big' : ''}" style="--h:${S.me.hue || 270}" aria-hidden="true"><div class="cam-face">${face}</div><span class="cam-emote"></span><span class="cam-name">@${esc(S.me.handle)}</span></div>`;
}
function screenInner(L) {
  const G = GAMES[L.game] || GAMES.chat, scene = L.scene || 'game';
  let bg;
  if (scene === 'game') bg = STUDIO.media ? (STUDIO.media.kind === 'video' ? `<video src="${STUDIO.media.url}" autoplay muted loop playsinline></video>` : `<img class="media" src="${STUDIO.media.url}" alt="">`)
    : `<div class="screen-bg"></div><div class="screen-floor"></div><div class="screen-center"><div><div class="big">${esc(G.glyph.length > 3 ? G.glyph : G.name.toUpperCase())}</div><small>Ecrã de jogo simulado</small></div></div>`;
  else {
    const card = {
      starting: `<small>A live vai começar</small><div class="scene-big">A COMEÇAR<br>EM BREVE</div><div class="scene-cd num" data-scenecd>00:20</div><span class="scene-sub">${esc(L.title)}</span>`,
      brb: `<small>Pausa</small><div class="scene-big">VOLTO JÁ ☕</div><div class="scene-cd num" data-sceneel>00:00</div><span class="scene-sub">Não saiam daí!</span>`,
      chat: `${camHTML(true)}<div class="scene-big small">CONVERSA COM O CHAT 💬</div><span class="scene-sub">Pergunta o que quiseres</span>`,
      ending: `<small>Fim da live</small><div class="scene-big">OBRIGADO<br>POR VEREM 💜</div><span class="scene-sub">Até à próxima, @${esc(S.me.handle)}</span>`,
    }[scene];
    bg = `<div class="screen-bg"></div><div class="scene-wrap scene-${scene}"><div class="scene-card">${card}</div></div>`;
  }
  return `${bg}
    <div class="hud"><span class="pill-live">EM DIRETO</span><span class="glass">👀 <span class="num" data-live="viewers">${fmt(L.viewers)}</span></span><span class="glass num" data-live="time">${durLabel(Date.now() - L.start)}</span><span class="glass">MODO ${esc(MODES[L.mode].name.toUpperCase())}</span><span class="sim-tag" style="margin-left:auto">Audiência fictícia</span></div>
    ${trainHTML()}
    ${scene === 'game' ? `<div class="hud-bottom"><div class="hud-title">${gicon(L.game, 26)} <strong>${esc(L.title)}</strong><span class="tiny muted">${esc(G.name)} · @${esc(S.me.handle)}</span></div></div>` : ''}
    ${scene !== 'chat' && scene !== 'ending' ? camHTML() : ''}
    <div class="screen-chat ${STUDIO.overlay ? 'on' : ''}" data-chatlist="overlay" aria-hidden="true">${L.chat.filter(m => !m.removed).slice(-6).map(overlayMsgHTML).join('')}</div>
    ${goalBarHTML()}
    <div class="alert-box" id="alertBox" aria-live="polite"></div>
    <div class="fx" id="fx"></div>`;
}
function paintScreen() { const sc = $('#screen'); if (sc && S.live) { sc.innerHTML = screenInner(S.live); tickScene(S.live); } }

/* Avatar: mexe-se quando falas e faz caras conforme o momento */
let talkTimer = null;
function avatarTalk() {
  $$('.cam').forEach(c => c.classList.add('talk'));
  clearTimeout(talkTimer); talkTimer = setTimeout(() => $$('.cam').forEach(c => c.classList.remove('talk')), 700);
}
const MOOD_FACE = { win: '😎', tourn: '🏆', legend: '🤩', goal: '😁', amazing: '🔥', clutch: '🤯', combo: '⚡', rare: '🤩', big: '🥳', surprise: '😳', funny: '😂', bug: '🤨', sad: '😭', badluck: '😩', upset: '😤', scary: '😱', suspense: '😬', escape: '😮‍💨', enemy: '😨' };
let emoteTimer = null;
function avatarEmote(mood) {
  const f = MOOD_FACE[mood]; if (!f) return;
  $$('.cam-emote').forEach(e => { e.textContent = f; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show'); });
  clearTimeout(emoteTimer); emoteTimer = setTimeout(() => $$('.cam-emote').forEach(e => e.classList.remove('show')), 2600);
}

/* =========================== HYPE TRAIN =========================== */
function hypeAdd(val) {
  const L = S.live; if (!L) return;
  L.hpts = (L.hpts || 0) + val;
  if (!L.train && L.hpts >= 500) startTrain(L);
  if (L.train) {
    L.train.prog += val; L.train.until = Math.min(Date.now() + 60000, Math.max(L.train.until, Date.now() + 40000));
    while (L.train.prog >= L.train.need) trainLevelUp(L);
    paintTrain();
  }
}
function startTrain(L) {
  L.train = { lvl: 1, prog: 0, need: 800, until: Date.now() + 45000 };
  sound('surprise'); crowd(.8); fxBurst('🚂', 'HYPE TRAIN!');
  addTimeline('train', 'Hype train começou!', '🚂', { hype: .7, reactLabel: 'Hype train', clipTitle: 'Hype train na live' });
  pushChat({ sys: true, text: '🚂 HYPE TRAIN! Enviem presentes para subir de nível!' });
  chatBurst(['HYPE TRAIN 🚂🚂', 'TODOS A BORDO', 'VAMOS AO NÍVEL 5!!', 'CHOO CHOO 🚂']);
  alertShow('🚂', 'Hype train!', 'nível 1', 'milestone');
  paintTrain();
}
function trainLevelUp(L) {
  const T = L.train; T.prog -= T.need; T.lvl++; T.need = Math.round(T.need * 1.6);
  sound('goal'); crowd(.5 + Math.min(.5, T.lvl * .1)); fxBurst('🚂', 'NÍVEL ' + T.lvl + '!');
  pushChat({ sys: true, text: `🚂 Hype train subiu para o nível ${T.lvl}!` });
  chatBurst([`NÍVEL ${T.lvl}!!!`, 'NÃO PAREM 🚂', 'mais mais mais 🎁']);
  alertShow('🚂', `Hype train nível ${T.lvl}`, 'continua a subir!', 'milestone');
  follow(.004);
}
function trainTick(L) {
  L.hpts = (L.hpts || 0) * .98;
  if (!L.train) return;
  if (Date.now() > L.train.until) {
    const lvl = L.train.lvl; L.train = null; L.hpts = 0; L.bestTrain = Math.max(L.bestTrain || 0, lvl);
    addTimeline('train', `Hype train terminou no nível ${lvl}`, '🚂', { hype: .5 + lvl * .08, reactLabel: 'Hype train', clipTitle: `Hype train nível ${lvl}` });
    pushChat({ sys: true, text: `🚂 O hype train terminou no nível ${lvl}. Obrigado, chat!` });
    notify('🚂', `Hype train terminou no nível ${lvl} em «${L.title}».`);
  }
  paintTrain();
}
function trainHTML() {
  const T = S.live?.train; if (!T) return '<div class="train" id="trainBar" hidden></div>';
  const left = Math.max(0, Math.ceil((T.until - Date.now()) / 1000));
  return `<div class="train" id="trainBar"><b>🚂 HYPE TRAIN · NÍVEL ${T.lvl}</b><div class="goal-bar"><i style="width:${Math.min(100, T.prog / T.need * 100)}%"></i></div><span class="num">${left}s</span></div>`;
}
function paintTrain() { const el = $('#trainBar'); if (el) el.outerHTML = trainHTML(); }
function giftRain(L, n) { for (let i = 0; i < n; i++) setTimeout(() => S.live === L && giftEvent(), 400 + i * rand(250, 600)); }

/* =========================== ESPECTADORES HABITUAIS =========================== */
function seedRegulars() {
  const mk = (u, badge, months, color) => ({ u, badge, months, color, since: Date.now() - months * 30 * DAY });
  return [mk('rita_mod', 'mod', 14, '#3ee0a1'), mk('lobo_pt', 'mod', 9, '#6fb6ff'), mk('beatriz.gg', 'vip', 11, '#ff7ab8'), mk('zecaplays', 'sub', 7, '#ffc24b'), mk('nunolusa', 'sub', 4, '#c084fc'),
    mk('marta_xd', 'sub', 12, '#5eead4'), mk('tiago07', 'sub', 2, '#ff8a5c'), mk('inesfire', 'vip', 6, '#f472b6'), mk('duarte_fan', 'sub', 1, '#93c5fd'), mk('saralove', 'sub', 3, '#9b8cff')];
}
const regular = u => (S.regulars || []).find(r => r.u === u);
const regColor = u => regular(u)?.color;
function regBadges(u) {
  const r = regular(u); if (!r) return '';
  const b = r.badge === 'mod' ? '<span class="cbadge mod" title="Moderador (fictício)">🛡️</span>' : r.badge === 'vip' ? '<span class="cbadge vip" title="VIP (fictício)">💎</span>' : '';
  return `${b}<span class="cbadge sub" title="Subscritor há ${r.months} ${r.months === 1 ? 'mês' : 'meses'} (fictício)">⭐${r.months}</span>`;
}
function greetRegulars(L) {
  const me = S.me.name.split(' ')[0];
  const last = [...S.lives].sort((a, b) => b.end - a.end)[0];
  const moment = last && (last.timeline || []).find(t => t.type === 'reaction' || t.type === 'viral');
  const lastClip = S.clips.find(c => c.streamer === 'me');
  const regs = [...S.regulars].sort(() => Math.random() - .5).slice(0, 4);
  const lines = [
    `${me}!! cheguei 💜`, 'a minha live favorita da semana', `já são ${regs[0]?.months || 3} meses de sub ⭐`, 'boa noite a todos 👋',
    moment ? `ainda me lembro do «${moment.label.replace(/^Reação ao jogo: /, '')}» da última live 😂` : 'hoje vai ser épico',
    lastClip ? `vi o clip «${lastClip.title}» umas 10 vezes 😭` : 'trouxe pipocas 🍿',
  ];
  regs.forEach((r, i) => setTimeout(() => S.live === L && pushChat({ user: r.u, text: lines[i % lines.length] }), 800 + i * 1400));
  if (moment || lastClip) setTimeout(() => S.live === L && pushChat({ user: regs[3]?.u || pick(S.regulars).u, text: lines[moment ? 4 : 5] }), 6500);
}
function subRenewal(L) {
  const r = pick(S.regulars); r.months++;
  pushChat({ gift: true, text: `⭐ ${r.u} renovou a subscrição: ${r.months} meses!` });
  alertShow('⭐', `${r.u} · ${r.months} meses`, 'subscrição renovada (fictícia)', 'follow');
  sound('follow');
  ttsSay(`${r.u.replace(/[_.]/g, ' ')} renovou a subscrição. ${r.months} meses!`);
  setTimeout(() => S.live === L && pushChat({ user: r.u, text: pick(['mais um mês contigo 💜', 'nunca saio daqui', 'melhor canal ⭐']) }), 900);
}
function immersiveEnd(L) {
  // um espectador frequente desta live passa a ser habitual
  const names = [...new Set(L.chat.filter(m => m.user && !m.me && !m.troll && !regular(m.user)).map(m => m.user))];
  if (names.length) {
    const u = pick(names);
    S.regulars.push({ u, badge: 'sub', months: 1, color: pick(NAME_COLORS), since: Date.now() });
    if (S.regulars.length > 24) S.regulars.shift();
    notify('⭐', `${u} subscreveu o teu canal e passou a ser um espectador habitual (fictício).`);
  }
}

/* =========================== LEITURA EM VOZ ALTA =========================== */
const GIFT_MSGS = ['GG mano, continua assim!', 'manda um abraço para Braga!', 'isto é para o troco de skin', 'és o melhor streamer de Portugal', 'faz um clutch para mim!', 'lê isto em voz alta', 'primeira doação, adoro as tuas lives', 'saudações do Algarve', 'não te esqueças de beber água', 'aposto que não ganhas a próxima'];
const TTSX = { t: null, q: [], busy: false };
async function ttsInit() {
  try { if (window.claude && typeof window.claude.use === 'function') TTSX.t = await window.claude.use('tts'); } catch (e) { }
}
function ttsSay(text) {
  if (!S.prefs.tts || !S.prefs.sound) return;
  if (TTSX.q.length >= 3) TTSX.q.shift();
  TTSX.q.push(text); ttsDrain();
}
async function ttsDrain() {
  if (TTSX.busy || !TTSX.q.length) return;
  TTSX.busy = true; const text = TTSX.q.shift();
  const done = () => { TTSX.busy = false; setTimeout(ttsDrain, 700); };
  if (TTSX.t) {
    try { await TTSX.t.speak(text, { voice: 'airy' }); return done(); }
    catch (e) { if (e && ['busy', 'rate_limited', 'viewer_stopped', 'not_granted'].includes(e.code)) return done(); }
  }
  if (window.speechSynthesis) {
    try {
      const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-PT'; u.rate = 1.05; u.volume = S.prefs.volume;
      MIC.ignoreUntil = Date.now() + text.length * 85 + 1500;
      u.onend = done; u.onerror = done; speechSynthesis.speak(u); return;
    } catch (e) { }
  }
  done();
}
function giftMessage(u, g, val) {
  const msg = pick(GIFT_MSGS);
  pushChat({ gift: true, text: `💬 ${u}: «${msg}»` });
  ttsSay(`${u.replace(/[_.\d]+/g, ' ').trim() || 'Alguém'} enviou ${g.name}. ${msg}`);
}

/* =========================== SOM DE MULTIDÃO =========================== */
let noiseBuf = null;
function crowd(intensity = .6) {
  if (!S.prefs.crowd) return;
  const ctx = audio(); if (!ctx) return;
  try {
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2.2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = .6;
    const g = ctx.createGain(), t = ctx.currentTime, v = S.prefs.volume * .32 * intensity;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .25); g.gain.setValueAtTime(v, t + .9); g.gain.exponentialRampToValueAtTime(.0001, t + 2.1);
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 7 + Math.random() * 4; lg.gain.value = v * .5; lfo.connect(lg).connect(g.gain);
    src.connect(bp).connect(g).connect(ctx.destination); src.start(t); src.stop(t + 2.2); lfo.start(t); lfo.stop(t + 2.2);
  } catch (e) { }
}

/* =========================== MODO TEATRO =========================== */
function theaterBarHTML() {
  return `<div class="theater-bar">
    ${PANEL_BUTTONS.filter(b => b[0] !== 'custom').map(([id, e, l]) => `<button class="tb-react" data-act="react" data-id="${id}" title="${esc(l)}" aria-label="${esc(l)}">${e}</button>`).join('')}
    <span class="spacer"></span>
    <button class="btn btn-sm ${MIC.on ? 'btn-live' : ''}" data-act="mic-toggle">${icon('mic')} ${MIC.on ? 'A ouvir' : 'Microfone'}</button>
    <button class="btn btn-sm" data-act="theater">${icon('shrink')} Sair</button>
  </div>`;
}
function setTheater(on) {
  STUDIO.theater = on;
  const st = $('.studio'); if (st) st.classList.toggle('theater', on);
  document.body.classList.toggle('theater-on', on);
  if (on) { try { const p = document.documentElement.requestFullscreen?.(); p && p.catch(() => { }); STUDIO.fs = true; } catch (e) { } }
  else if (document.fullscreenElement) { try { document.exitFullscreen().catch(() => { }); } catch (e) { } }
  $$('[data-act="theater"]').forEach(b => { if (!b.closest('.theater-bar')) b.innerHTML = `${icon(on ? 'shrink' : 'expand')} ${on ? 'Sair do modo teatro' : 'Modo teatro'}`; });
  afterStudioRender();
}

/* =========================== PAINEL =========================== */
function immersivePanelHTML() {
  const sw = (k, label) => `<label class="switch small"><input type="checkbox" data-pref="${k}" id="pref-${k}" ${S.prefs[k] ? 'checked' : ''}> ${label}</label>`;
  return `<div class="imm-panel" data-immpanel>
    <div class="row" style="gap:16px">${sw('cam', 'Avatar na live')}${sw('tts', 'Ler presentes em voz alta')}${sw('crowd', 'Som de multidão')}</div>
    <div class="row"><label class="btn btn-xs upload">${icon('image')} Imagem do avatar<input type="file" accept="image/*" data-file="cam-img" id="camImg"></label>${S.prefs.camImg ? '<button class="btn btn-xs btn-ghost" data-act="cam-img-clear">Usar a foto de perfil</button>' : ''}<span class="tiny muted">O avatar mexe-se quando falas ao microfone e faz caras conforme o que acontece.</span></div>
  </div>`;
}

/* =========================== CICLO =========================== */
function tickScene(L) {
  const now = Date.now();
  $$('[data-scenecd]').forEach(n => n.textContent = durLabel(Math.max(0, (L.sceneUntil || now) - now)));
  $$('[data-sceneel]').forEach(n => n.textContent = durLabel(now - (L.sceneAt || now)));
}
function immersiveTick(L) {
  const now = Date.now();
  tickScene(L);
  if (L.scene === 'starting' && now >= (L.sceneUntil || 0)) { setScene('game'); toast('🎮', 'A live começou: cena «Jogo»'); }
  if (!L.greeted && now - L.start > 3500) { L.greeted = true; greetRegulars(L); }
  if (L.scene !== 'starting' && Math.random() < .004) subRenewal(L);
  trainTick(L);
}

const IMM_ACT = {
  'scene': b => setScene(b.dataset.s),
  'theater': () => setTheater(!STUDIO.theater),
  'cam-img-clear': () => { S.prefs.camImg = null; save(); paintScreen(); $$('[data-immpanel]').forEach(el => el.outerHTML = immersivePanelHTML()); },
  'end-raid-pick': () => {
    const live = S.accounts.filter(a => S.events.some(e => e.owner === a.id && eventStatus(e) === 'live'));
    const list = [...live, ...S.accounts.filter(a => !live.includes(a))].slice(0, 6);
    $('#endConfirm').innerHTML = `<div class="confirm-box" style="margin-bottom:16px;flex-direction:column;align-items:stretch"><span>Para quem queres enviar os teus espectadores?</span><div class="raid-grid">${list.map(a => `<button class="dm-pick" data-act="raid-out" data-id="${a.id}">${avatar(a, 36).replace('<a ', '<span ').replace('</a>', '</span>')}<span><strong>${esc(a.name)}</strong><small>${live.includes(a) ? '🔴 em direto' : esc(a.cat)}</small></span></button>`).join('')}</div><button class="btn btn-sm btn-ghost" data-act="end-live-no" style="align-self:flex-start">Cancelar</button></div>`;
  },
  'raid-out': b => {
    const L = S.live; if (!L) return; const a = acc(b.dataset.id); const n = Math.round(L.viewers);
    $('#endConfirm').innerHTML = '';
    setScene('ending', true);
    pushChat({ sys: true, text: `🚀 A fazer raid para ${a.name} com ${dots(n)} espectadores virtuais!` });
    chatBurst([`RAID PARA @${a.handle} 🚀`, 'BORA TODOS', 'obrigado pela live 💜', `${a.name.split(' ')[0].toUpperCase()} AQUI VAMOS NÓS`, '🚀🚀🚀']);
    addTimeline('raid', `Raid enviada para ${a.name} com ${dots(n)} espectadores`, '🚀');
    sound('raid'); crowd(.7);
    notify('🚀', `Fizeste raid para ${a.name} com ${dots(n)} espectadores virtuais.`);
    setTimeout(() => { if (S.live === L) endLive(); }, 4200);
  },
};
function onImmersiveInput(t) {
  if (t.dataset.pref) { S.prefs[t.dataset.pref] = t.checked; save(); if (t.dataset.pref === 'cam') paintScreen(); if (t.dataset.pref === 'tts' && !t.checked) { TTSX.q = []; try { TTSX.t?.stop(); speechSynthesis?.cancel(); } catch (e) { } } return true; }
  return false;
}
