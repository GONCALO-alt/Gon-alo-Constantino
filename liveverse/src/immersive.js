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
  ['starting', '⏳', 'A começar'], ['game', '🎮', 'Jogo'], ['followers', '💜', 'Seguidores'], ['chat', '💬', 'Conversa'], ['brb', '☕', 'Volto já'], ['ending', '👋', 'Fim'],
];
const SCENE_FACTOR = { starting: .35, game: 1, followers: 1, chat: .95, brb: .72, ending: .85 };
const CHAT_QUESTIONS = ['de onde és?', 'qual é o teu jogo favorito?', 'tens animais de estimação?', 'quando é a próxima live?', 'qual foi o teu melhor momento de sempre?', 'o que comeste hoje? 😂', 'fazes live amanhã?', 'qual é o teu setup?', 'jogas com o chat um dia?', 'dás dicas para começar a fazer lives?', 'qual é a tua música favorita?', 'preferes Fortnite ou Minecraft?'];
const SCENE_AMBIENT = {
  starting: ['já começou?', 'cheguei cedo 😎', 'olá!!', 'estou à espera 👀', 'bora bora', 'primeiro!!', 'a música de espera é top 🎶', 'quanto falta?', 'hoje vai ser épico'],
  brb: ['à espera... ⏳', 'quanto tempo?', '🍿🍿', 'volta depressa!', 'o chat toma conta da live 😂', 'ainda aqui 💜', 'AFK 😴', 'vou buscar um lanche também'],
  chat: CHAT_QUESTIONS,
  followers: ['SEGUIDO ✅', 'vamos à próxima meta!!', 'acabei de seguir 💜', 'bora encher isto', 'segue toda a gente!', 'quase lá 👀', 'partilhem a live!'],
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
  paintScreen(); paintScenes(); $$('[data-scene-select]').forEach(x => x.value = s); save();
}
function scenesHTML() {
  const cur = S.live?.scene || 'game';
  return `<div class="scenes" data-scenes role="group" aria-label="Cenas da live"><span class="scenes-label">${icon('layers')} Cena</span>${SCENES.map(([k, e, l]) => `<button class="scene-btn ${cur === k ? 'on' : ''}" data-act="scene" data-s="${k}" aria-pressed="${cur === k}"><span>${e}</span>${l}</button>`).join('')}</div>`;
}
function paintScenes() { $$('[data-scenes]').forEach(el => el.outerHTML = scenesHTML()); }

/* =========================== ECRÃ =========================== */
function camHTML(big = false) {
  if (MEDIA.cam) return `<div class="cam live-cam ${big ? 'cam-big' : ''}" aria-hidden="true"><video data-stream="cam" class="mirror" autoplay muted playsinline></video></div>`;
  if (!big) return '';
  const img = S.prefs.camImg || S.me.avatar;
  const face = img ? `<img src="${img}" alt="">` : `<span>${esc((S.me.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase())}</span>`;
  return `<div class="cam ${big ? 'cam-big' : ''}" style="--h:${S.me.hue || 270}" aria-hidden="true"><div class="cam-face">${face}</div><span class="cam-name">@${esc(S.me.handle)}</span></div>`;
}
function screenInner(L) {
  const G = GAMES[L.game] || GAMES.chat, scene = L.scene || 'game';
  let bg;
  const main = MEDIA.screen ? 'screen' : MEDIA.cam ? 'cam' : null;
  if (scene === 'game' && main) bg = `<video data-stream="${main}" class="live-video ${main === 'cam' ? 'mirror' : 'fit-contain'}" autoplay muted playsinline></video>`;
  else if (scene === 'game') bg = STUDIO.media ? (STUDIO.media.kind === 'video' ? `<video src="${STUDIO.media.url}" autoplay muted loop playsinline></video>` : `<img class="media" src="${STUDIO.media.url}" alt="">`)
    : `<div class="screen-bg"></div><div class="screen-floor"></div><div class="screen-center"><div><div class="big">${esc(glyphText(G))}</div><small>Ecrã de jogo simulado</small></div></div>`;
  else {
    const card = {
      starting: `<small>A live vai começar</small><div class="scene-big">A COMEÇAR<br>EM BREVE</div><div class="scene-cd num" data-scenecd>00:20</div><span class="scene-sub">${esc(L.title)}</span>`,
      brb: `<small>Pausa</small><div class="scene-big">VOLTO JÁ</div><div class="scene-cd num" data-sceneel>00:00</div><span class="scene-sub">Não saiam daí!</span>`,
      chat: `${camHTML(true)}<div class="scene-big small">CONVERSA COM O CHAT</div><span class="scene-sub">Pergunta o que quiseres</span>`,
      followers: folSceneHTML(),
      ending: `<small>Fim da live</small><div class="scene-big">OBRIGADO<br>POR VEREM</div><span class="scene-sub">Até à próxima, @${esc(S.me.handle)}</span>`,
    }[scene];
    bg = `<div class="screen-bg"></div><div class="scene-wrap scene-${scene}"><div class="scene-card">${card}</div></div>`;
  }
  return `${bg}
    ${S.prefs.folCounter !== false ? folCounterHTML(Math.round(L.viewers), Math.floor(S.me.followers), 'viewers', 'followers') : ''}
    <div class="wp-bottom st-bottom"><span class="tw-uptime"><i></i><span class="num" data-live="uptime">${upTime(Date.now() - L.start)}</span></span><span class="tw-vw">${icon('person')}<b class="num" data-anim="viewers" data-v="${Math.round(L.viewers)}">${dots(L.viewers)}</b></span></div>
    ${trainHTML()}
    ${scene === 'game' && MEDIA.cam && MEDIA.screen ? camHTML() : scene !== 'game' && scene !== 'chat' && MEDIA.cam ? camHTML() : ''}
    <div class="screen-chat ${STUDIO.overlay ? 'on' : ''}" data-chatlist="overlay" aria-hidden="true">${L.chat.filter(m => !m.removed).slice(-6).map(overlayMsgHTML).join('')}</div>
    ${S.prefs.goalOnScreen ? goalBarHTML() : ''}
    <div class="alert-box" id="alertBox" aria-live="polite"></div>
    <div class="fx" id="fx"></div>`;
}
function paintScreen() { const sc = $('#screen'); if (sc && S.live) { sc.innerHTML = screenInner(S.live); sc.classList.toggle('vertical', S.prefs.orient === 'v'); tickScene(S.live); attachMedia(); } }

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
  activityPush(L, 'train', 'Começou um hype train');
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
  pushChat({ gift: true, text: `${r.u} renovou a subscrição: ${r.months} meses!` });
  activityPush(L, 'sub', `${r.u} subscreveu · ${r.months} meses`);
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
  const cur = S.live?.scene || 'game';
  return `<div class="theater-bar">
    <div class="tb-group">${mediaButtonsHTML()}
      <button class="btn btn-sm ${MEDIA.rec ? 'btn-live' : ''}" data-act="rec-toggle">${icon('rec')} ${MEDIA.rec ? 'Parar <span class="num" data-rec>00:00</span>' : 'Gravar'}</button>
      ${MEDIA.lastUrl && !MEDIA.rec ? `<a class="btn btn-sm" href="${MEDIA.lastUrl}" download="liveverse-gravacao.${MEDIA.lastExt || 'webm'}">${icon('download')} Transferir</a>` : ''}</div>
    ${orientHTML()}
    <span class="spacer"></span>
    <div class="tb-group">
      <label class="tb-scene">${icon('layers')}<select class="input" data-scene-select id="sceneSelect" aria-label="Cena">${SCENES.map(([k, e, l]) => `<option value="${k}" ${cur === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <button class="btn btn-sm ${MIC.on ? 'btn-live' : ''}" data-act="mic-toggle">${icon('mic')} ${MIC.on ? 'A ouvir' : 'Microfone'}</button>
      <button class="btn btn-sm ${STUDIO.reacts ? 'btn-primary' : ''}" data-act="reacts-toggle">${icon('bolt')} Momentos</button>
      <button class="btn btn-sm tb-full" data-act="theater">${icon(STUDIO.theater ? 'shrink' : 'expand')} ${STUDIO.theater ? 'Sair do ecrã inteiro' : 'Ecrã inteiro'}</button>
    </div>
    <div class="tb-reacts" ${STUDIO.reacts ? '' : 'hidden'}>${PANEL_BUTTONS.filter(b => b[0] !== 'custom').map(([id, e, l]) => `<button class="tb-react" data-act="react" data-id="${id}">${esc(l)}</button>`).join('')}</div>
  </div>`;
}
function setTheater(on) {
  STUDIO.theater = on;
  const st = $('.studio'); if (st) st.classList.toggle('theater', on);
  document.body.classList.toggle('theater-on', on);
  if (on) { try { const p = document.documentElement.requestFullscreen?.(); p && p.catch(() => { }); STUDIO.fs = true; } catch (e) { } }
  else if (document.fullscreenElement) { try { document.exitFullscreen().catch(() => { }); } catch (e) { } }
  $$('[data-act="theater"]').forEach(b => { b.innerHTML = `${icon(on ? 'shrink' : 'expand')} ${on ? 'Sair do ecrã inteiro' : 'Ecrã inteiro'}`; });
  $$('.screen [data-anim]').forEach(el => { el._v = undefined; });
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
  'controls': b => { STUDIO.controls = !STUDIO.controls; const p = $('#controlsPanel'); if (p) p.hidden = !STUDIO.controls; b.classList.toggle('btn-primary', STUDIO.controls); b.setAttribute('aria-expanded', STUDIO.controls); if (STUDIO.controls) p?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  'ev-quick': b => {
    syncEventDraft(); const now = new Date(); const k = b.dataset.k; let t;
    if (k.endsWith('m')) { t = Date.now() + (+k.slice(0, -1)) * MIN; }
    else if (k === 'tonight') { const d = new Date(); d.setHours(21, 0, 0, 0); t = d.getTime() > Date.now() + MIN ? d.getTime() : d.getTime() + DAY; }
    else if (k === 'tomorrow') { t = Date.now() + DAY; }
    else if (k === 'weekend') { const d = new Date(); const add = (6 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + add); d.setHours(16, 0, 0, 0); t = d.getTime(); }
    const d = new Date(t); d.setSeconds(0, 0); MODAL.draft.start = d.getTime(); paintEventEditor();
  },
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
  if (t.hasAttribute('data-scene-select')) { setScene(t.value); return true; }
  if (t.dataset.pref === 'goalOnScreen') { S.prefs.goalOnScreen = t.checked; save(); paintScreen(); return true; }
  if (t.dataset.pref) { S.prefs[t.dataset.pref] = t.checked; save(); if (t.dataset.pref === 'cam' || t.dataset.pref === 'folCounter') paintScreen(); if (t.dataset.pref === 'tts' && !t.checked) { TTSX.q = []; try { TTSX.t?.stop(); speechSynthesis?.cancel(); } catch (e) { } } return true; }
  return false;
}

/* =========================== CONTADORES ANIMADOS =========================== */
const FOL_GOALS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
const nextFolGoal = f => FOL_GOALS.find(g => g > f) || Math.ceil((f + 1) / 1e6) * 1e6;
function tweenNum(el, to) {
  if (el._v === undefined) el._v = +(el.dataset.v || to);
  const from = el._v; if (from === to) return;
  el._v = to;
  cancelAnimationFrame(el._raf);
  const t0 = performance.now(), d = 620;
  const step = t => { const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = dots(Math.round(from + (to - from) * e)); if (p < 1) el._raf = requestAnimationFrame(step); };
  el._raf = requestAnimationFrame(step);
  if (to > from) {
    el._acc = (el._acc || 0) + (to - from);
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    const now = Date.now();
    if (now - (el._lastPop || 0) > 1300) {
      const host = el.parentElement; const pop = document.createElement('span');
      pop.className = 'num-pop' + (el.dataset.anim === 'followers' ? ' fol' : '');
      pop.textContent = '+' + dots(el._acc);
      host.appendChild(pop); setTimeout(() => pop.remove(), 1400);
      el._acc = 0; el._lastPop = now;
    }
  }
}
function liveCounters(L) {
  const v = Math.round(L.viewers), f = Math.floor(S.me.followers);
  $$('[data-live="uptime"]').forEach(el => el.textContent = upTime(Date.now() - L.start));
  $$('[data-live="viewers-card"]').forEach(el => el.textContent = espet(v));
  $$('[data-anim="viewers"]').forEach(el => tweenNum(el, v));
  $$('[data-anim="followers"]').forEach(el => tweenNum(el, f));
  // histórico para o gráfico
  const now = Date.now();
  L.hist = L.hist || [];
  if (!L.hist.length || now - L.hist[L.hist.length - 1][0] > 1900) { L.hist.push([now, v]); if (L.hist.length > 90) L.hist.shift(); drawSpark(); }
  // novos seguidores com nomes
  if (L.lastFol == null) L.lastFol = f;
  if (f > L.lastFol) {
    const n = f - L.lastFol; L.lastFol = f;
    L.recentFol = L.recentFol || [];
    const names = Array.from({ length: Math.min(n, 3) }, () => fakeUser());
    L.recentFol.unshift(...names); L.recentFol = L.recentFol.slice(0, 8);
    names.forEach(nm => activityPush(L, 'follow', `${nm} seguiu-te`));
    if (now - (L.lastFolMsg || 0) > 5000) { L.lastFolMsg = now; pushChat({ sys: true, text: `${names[0]}${n > 1 ? ` e mais ${dots(n - 1)}` : ''} ${n > 1 ? 'começaram' : 'começou'} a seguir-te!` }); }
    const goal = FOL_GOALS.filter(g => g <= f).pop();
    if (goal && goal > (S.me.folGoalHit || 0)) {
      S.me.folGoalHit = goal;
      sound('goal'); crowd(.7); fxBurst('💜', `${dots(goal)} ${goal === 1 ? 'SEGUIDOR' : 'SEGUIDORES'}!`);
      alertShow('💜', `${dots(goal)} ${goal === 1 ? 'seguidor' : 'seguidores'}!`, 'nova meta de seguidores', 'follow');
      notify('💜', goal === 1 ? 'Tens o teu primeiro seguidor fictício!' : `Chegaste aos ${dots(goal)} seguidores fictícios!`);
      addTimeline('follow', `Meta de seguidores: ${dots(goal)}`, '💜', { hype: .6, reactLabel: 'Meta de seguidores', clipTitle: `${dots(goal)} seguidores!` });
      chatBurst([`${dots(goal)}!!! 💜`, 'PARABÉNS 🎉', 'QUE CRESCIMENTO', 'próxima meta já!']);
    }
    paintFolScene();
  }
}
function drawSpark() {
  const c = $('#viewSpark'); const L = S.live; if (!c || !L || !L.hist || L.hist.length < 2) return;
  const ctx = c.getContext('2d'), w = c.width, h = c.height, pts = L.hist.map(p => p[1]);
  const max = Math.max(...pts) * 1.08 || 1, min = Math.min(...pts) * .9;
  const X = i => i / (pts.length - 1) * (w - 6) + 3, Y = v => h - 4 - (v - min) / (max - min || 1) * (h - 8);
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(145,71,255,.45)'); g.addColorStop(1, 'rgba(145,71,255,0)');
  ctx.beginPath(); pts.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)));
  ctx.lineTo(X(pts.length - 1), h); ctx.lineTo(X(0), h); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); pts.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)));
  ctx.strokeStyle = '#a970ff'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.arc(X(pts.length - 1), Y(pts[pts.length - 1]), 3.2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
}
function folSceneHTML() {
  const f = Math.floor(S.me.followers), goal = nextFolGoal(f), prev = FOL_GOALS.filter(g => g <= f).pop() || 0;
  const pct = Math.min(100, (f - prev) / (goal - prev) * 100);
  const recent = (S.live?.recentFol || []).slice(0, 5);
  return `<small>Seguidores</small><div class="fol-big num" data-anim="followers" data-v="${f}">${dots(f)}</div>
    <div class="fol-goal" data-fol-goal><span>Próxima meta: <b>${dots(goal)}</b></span><div class="goal-bar"><i style="width:${pct}%"></i></div></div>
    <div class="fol-list" data-fol-list>${recent.length ? recent.map(n => `<span>💜 ${esc(n)}</span>`).join('') : '<span class="muted">À espera do próximo seguidor…</span>'}</div>`;
}
function paintFolScene() {
  if (S.live?.scene !== 'followers') return;
  const f = Math.floor(S.me.followers), goal = nextFolGoal(f), prev = FOL_GOALS.filter(g => g <= f).pop() || 0;
  $$('[data-fol-goal]').forEach(el => el.innerHTML = `<span>Próxima meta: <b>${dots(goal)}</b></span><div class="goal-bar"><i style="width:${Math.min(100, (f - prev) / (goal - prev) * 100)}%"></i></div>`);
  $$('[data-fol-list]').forEach(el => el.innerHTML = (S.live.recentFol || []).slice(0, 5).map(n => `<span>💜 ${esc(n)}</span>`).join(''));
}

/* =========================== COMEÇAR DO ZERO =========================== */
function resetToZero(s) {
  if (s.zero1) return; s.zero1 = 1;
  Object.assign(s.me, { followers: 0, viewsBase: 0, xp: 0, followingBase: 0, folGoalHit: 0 });
  s.me.bio = 'Criador de conteúdo no LiveVerse 🎮 A começar do zero!\nObjetivo: chegar aos primeiros 100 seguidores e depois aos 100 mil espectadores virtuais numa live ⭐';
  s.lives = [];
  s.clips = s.clips.filter(c => c.streamer !== 'me');
  s.posts = s.posts.filter(p => p.author !== 'me' || (p.type === 'event' && p.eventId));
  s.posts.filter(p => p.author === 'me').forEach(p => { p.likes = Math.min(p.likes, 2); p.reposts = 0; p.views = Math.min(p.views, 25); p.replies = []; });
  if (s.pinned && !s.posts.find(p => p.id === s.pinned)) s.pinned = null;
  s.ach = {}; s.stats = { reactions: 0, clipsMade: 0, polls: 0 };
  s.events.filter(e => e.owner === 'me').forEach(e => { e.interested = Math.min(e.interested, 3); e.reminderUsers = 0; e.notified = {}; });
  s.dms = (s.dms || []).map(t => ({ ...t, msgs: t.msgs.filter(m => !/12 mil|raid de ontem|De nada!!/.test(m.text)) })).filter(t => t.msgs.length);
  s.notifs = [{ id: uid(), icon: '🚀', text: 'Começas do zero: 0 seguidores. Agenda a tua primeira live à hora que quiseres e faz crescer a comunidade!', t: Date.now(), read: false }];
  if (s.regulars) s.regulars = s.regulars.slice(0, 3).map(r => ({ ...r, months: 1 }));
}

/* Contador no ecrã: espetadores em direto em grande e seguidores numa caixa branca */
function folCounterHTML(viewers, followers, vKey, fKey) {
  // só os seguidores (o número grande das views foi retirado)
  return `<div class="fol-counter" aria-label="${dots(followers)} seguidores">
    <div class="fc-top"><span class="fc-logo">${LOGO_SVG_FN()}</span><div class="fc-box num" ${fKey ? `data-anim="${fKey}" data-v="${followers}"` : ''}>${dots(followers)}</div></div>
  </div>`;
}
