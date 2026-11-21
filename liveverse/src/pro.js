/* =====================================================================
   Acabamento de plataforma real: sons de interface com preferências,
   player com volume/mute/qualidade/ecrã inteiro/loading/buffering/
   religar, chat com cartão de utilizador, menções, definições e menos
   repetição, tooltips, transições e estado da ligação.
   ===================================================================== */
Object.assign(IC, {
  volMute: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="m16 9 5 6M21 9l-5 6"/>',
  wifiOff: '<path d="M2 8.8a16 16 0 0 1 20 0M5 12.5a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0M12 20h.01"/><path d="m3 3 18 18"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1"/>',
});
const defaultSnd = () => ({ alerts: true, notif: true, ui: true, mentions: true, live: true });

/* ---------- Sons de interface (curtos e discretos) ---------- */
const UI_SOUNDS = {
  notif: () => { bell(1046.5, 0, .7, .16, 2, .8); bell(1568, .09, .9, .14, 2, .8); },
  mention: () => { bell(1318.5, 0, .5, .14, 2, .6); bell(1760, .07, .6, .12, 2, .6); },
  golive: () => { [523.3, 659.3, 784, 1046.5].forEach((f, i) => bell(f, i * .07, 1, .2, 2, 1)); },
  endlive: () => { [784, 659.3, 523.3].forEach((f, i) => bell(f, i * .09, .9, .16, 2, 1)); },
  follow: () => { bell(1318.5, 0, 1, .22); bell(1975.5, .1, 1.2, .18); },
  sub: () => { [659.3, 830.6, 987.8].forEach((f, i) => bell(f, i * .06, 1.1, .18, 2, 1)); },
  tick: () => { tonal(1800, 0, .03, .035, 'sine'); },
  open: () => { tonal(700, 0, .06, .05, 'sine', 980); },
  close: () => { tonal(900, 0, .06, .04, 'sine', 640); },
  toggle: () => { tonal(1200, 0, .035, .05, 'triangle'); },
  error: () => { tonal(330, 0, .12, .1, 'triangle'); tonal(262, .1, .18, .1, 'triangle'); },
  success: () => { bell(1174.7, 0, .5, .12, 2, .6); },
};
const UI_CAT = { notif: 'notif', mention: 'mentions', golive: 'live', endlive: 'live', follow: 'alerts', sub: 'alerts', tick: 'ui', open: 'ui', close: 'ui', toggle: 'ui', error: 'ui', success: 'ui' };
const lastUi = {};
function uiSound(name) {
  if (!S || !S.prefs.sound) return;
  const cat = UI_CAT[name]; if (cat && S.prefs.snd && S.prefs.snd[cat] === false) return;
  const now = Date.now(), gap = cat === 'ui' ? 60 : 900;
  if (now - (lastUi[name] || 0) < gap) return; lastUi[name] = now;
  if (!sfx()) return;
  try { UI_SOUNDS[name](); } catch (e) { }
}
function soundSettingsHTML() {
  const P = S.prefs, s = P.snd || defaultSnd();
  const row = (k, t, d) => `<label class="ss-row"><span><b>${t}</b><small>${d}</small></span><span class="switch"><input type="checkbox" data-sndcat="${k}" id="snd-${k}" ${s[k] !== false ? 'checked' : ''} ${P.sound ? '' : 'disabled'}></span></label>`;
  return `<div class="modal-head"><h2>Definições de som</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
  <div class="modal-body" id="sndBody">
    <div class="ss-master"><button class="icon-btn" data-act="snd-mute" aria-label="${P.sound ? 'Silenciar tudo' : 'Ligar o som'}">${icon(P.sound ? 'volume' : 'volMute')}</button>
      <input type="range" class="vol ss-vol" data-vol min="0" max="1" step="0.05" value="${P.volume}" aria-label="Volume geral" ${P.sound ? '' : 'disabled'}><span class="num small" data-volpct>${Math.round(P.volume * 100)}%</span></div>
    ${row('alerts', 'Alertas da live', 'Seguidores, subscrições, presentes e raids')}
    ${row('live', 'Início e fim da live', 'Som curto ao entrar e sair de direto')}
    ${row('notif', 'Notificações', 'Quando chega uma notificação (fora da live)')}
    ${row('mentions', 'Menções no chat', 'Quando alguém escreve @' + esc(S.me.handle))}
    ${row('ui', 'Interface', 'Menus, interruptores e confirmações, muito discretos')}
    <div class="row"><button class="btn btn-sm" data-act="snd-test">${icon('volume')} Ouvir exemplos</button><span class="tiny muted">O volume do player de cada canal é separado.</span></div>
  </div>`;
}

/* ---------- Tooltips ---------- */
let tipEl = null, tipT = null;
function tipShow(el) {
  const txt = el.getAttribute('data-tip'); if (!txt) return;
  tipEl = tipEl || Object.assign(document.createElement('div'), { className: 'tip' });
  tipEl.textContent = txt; document.body.appendChild(tipEl);
  const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  let x = r.left + r.width / 2 - w / 2, y = r.top - h - 8;
  if (y < 6) y = r.bottom + 8;
  x = Math.max(6, Math.min(innerWidth - w - 6, x));
  tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px'; tipEl.classList.add('on');
}
function tipHide() { clearTimeout(tipT); if (tipEl) tipEl.classList.remove('on'); }
document.addEventListener('mouseover', e => {
  const el = e.target.closest && e.target.closest('[title],[data-tip],.icon-btn[aria-label],.tn-ic[aria-label],.wp-ic[aria-label],.wp-round[aria-label]'); if (!el) return;
  if (el.hasAttribute('title')) { const t = el.getAttribute('title'); if (t) el.setAttribute('data-tip', t); el.removeAttribute('title'); }
  if (!el.getAttribute('data-tip') && el.getAttribute('aria-label') && el.matches('.icon-btn,.tn-ic,.wp-ic,.wp-round')) el.setAttribute('data-tip', el.getAttribute('aria-label'));
  clearTimeout(tipT); tipT = setTimeout(() => tipShow(el), 450);
}, true);
document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('[data-tip]')) tipHide(); }, true);
document.addEventListener('pointerdown', tipHide, true);

/* ---------- Player do canal ---------- */
const QUALITIES = [['auto', 'Automática (1080p60)'], ['1080', '1080p60 (origem)'], ['720', '720p60'], ['480', '480p'], ['360', '360p'], ['160', '160p']];
function playerPrefs() { S.prefs.player = S.prefs.player || { vol: .7, muted: false, q: 'auto' }; return S.prefs.player; }
function playerCtrlHTML(accId) {
  const P = playerPrefs(), muted = P.muted || P.vol === 0;
  return `<div class="wp-ctrl">
    <button class="wp-ic" data-act="player-pause" aria-label="Pausa (espaço)">${icon('pause')}</button>
    <div class="pv-vol"><button class="wp-ic ${muted ? 'muted' : ''}" data-act="player-vol" aria-label="${muted ? 'Ligar som (m)' : 'Silenciar (m)'}">${icon(muted ? 'volMute' : 'vol')}</button><input type="range" class="pv-range" data-pvol min="0" max="1" step="0.05" value="${muted ? 0 : P.vol}" aria-label="Volume do player"></div>
    <span class="wp-ctrl-live"><i></i>EM DIRETO</span><span class="spacer"></span>
    <div class="tn-drop-wrap"><button class="wp-ic" data-act="player-q" aria-label="Definições (qualidade)">${icon('gear')}</button>${UI.qOpen ? `<div class="pq-menu">${QUALITIES.map(([k, l]) => `<button data-act="player-qset" data-q="${k}" class="${P.q === k ? 'on' : ''}">${P.q === k ? icon('check') : '<i></i>'}${l}</button>`).join('')}</div>` : ''}</div>
    <button class="wp-pill" data-act="w-clip" data-id="${accId}">${icon('clip')} Clipe</button>
    <button class="wp-ic" data-act="w-full" aria-label="Modo teatro (t)">${icon('theaterIc')}</button>
    <button class="wp-ic" data-act="player-fs" aria-label="Ecrã inteiro (f)">${icon('expand')}</button>
  </div>`;
}
function applyQuality() { const q = playerPrefs().q; $$('.wp-video').forEach(v => { v.dataset.q = q; }); }
function playerOverlay(text, ms) {
  const v = $('.wp-video'); if (!v) return;
  let o = v.querySelector('.pl-load'); if (!o) { o = document.createElement('div'); o.className = 'pl-load'; v.appendChild(o); }
  o.innerHTML = `<span class="spin"></span>${text ? `<small>${esc(text)}</small>` : ''}`; o.hidden = false;
  clearTimeout(o._t); if (ms) o._t = setTimeout(() => { o.hidden = true; }, ms);
}
function playerOverlayHide() { const o = $('.wp-video .pl-load'); if (o) o.hidden = true; }
function playWatchAlert(kind) {
  const P = playerPrefs(); if (P.muted || P.vol <= 0 || !S.prefs.sound) return;
  if ($('.wp-video.paused')) return;
  const keep = S.prefs.volume; S.prefs.volume = keep * P.vol * .7;
  try { kind === 'gift' ? giftSound() : sound('sub'); } finally { S.prefs.volume = keep; }
}

/* ---------- Ligação à internet ---------- */
function netBanner(on) {
  let b = $('#netBanner');
  if (!on) { if (!b) { b = document.createElement('div'); b.id = 'netBanner'; b.className = 'net-banner'; b.innerHTML = `${icon('wifiOff')}<span>Sem ligação à internet. A tentar religar…</span>`; document.body.appendChild(b); } $$('.wp-video').forEach(() => playerOverlay('A religar…')); }
  else { if (b) b.remove(); playerOverlayHide(); toast('✅', 'Ligação restabelecida'); }
}
window.addEventListener('offline', () => netBanner(false));
window.addEventListener('online', () => netBanner(true));

/* ---------- Chat: cartão de utilizador, menções, definições, sem repetições ---------- */
function chatPrefs() { S.prefs.chat = S.prefs.chat || { time: true, size: 'm', mentions: true }; return S.prefs.chat; }
function applyChatPrefs() { const c = chatPrefs(); document.body.classList.toggle('chat-notime', !c.time); document.body.dataset.chatsize = c.size; }
function chatSettingsHTML() {
  const c = chatPrefs(), live = S.live && route().name === 'estudio';
  return `<div class="cs-menu" data-csmenu>
    <b class="cs-h">Definições do chat</b>
    <label class="cs-row"><span>Mostrar horas</span><span class="switch"><input type="checkbox" data-chatpref="time" id="csTime" ${c.time ? 'checked' : ''}></span></label>
    <label class="cs-row"><span>Destacar menções</span><span class="switch"><input type="checkbox" data-chatpref="mentions" id="csMent" ${c.mentions ? 'checked' : ''}></span></label>
    <div class="cs-row"><span>Tamanho do texto</span><span class="seg">${[['s', 'P'], ['m', 'M'], ['l', 'G']].map(([k, l]) => `<button type="button" class="${c.size === k ? 'on' : ''}" data-act="chat-size" data-s="${k}">${l}</button>`).join('')}</span></div>
    ${live ? `<button type="button" class="cs-link" data-act="mod-open">${icon('shield')} Modos do chat e moderação</button>` : ''}
    <button type="button" class="cs-link" data-act="snd-open">${icon('volume')} Definições de som</button>
  </div>`;
}
function userCardHTML(u, ctxLive) {
  const L = S.live, reg = regular(u), h = hashStr(u);
  const msgs = (ctxLive && L ? L.chat : WATCH.chat).filter(m => m.user === u && !m.sys && !m.gift).slice(-4);
  const since = reg ? reg.since : Date.now() - (h % 900 + 5) * DAY;
  const d = new Date(since);
  const color = (msgs[0] && msgs[0].color) || regColor(u) || NAME_COLORS[h % NAME_COLORS.length];
  const banned = S.mod.banned.some(b => b.u === u);
  return `<div class="ucard" data-ucard="${esc(u)}">
    <div class="uc-banner" style="--c:${color}"></div>
    <div class="uc-body"><div class="uc-top"><span class="av" style="--s:52px;--h:${h % 360}">${esc(u.slice(0, 2).toUpperCase())}</span><div><strong style="color:${color}">${esc(u)}</strong><div class="uc-badges">${regBadges(u) || '<span class="tiny muted">Sem distintivos</span>'}</div></div></div>
      <div class="uc-meta"><span>${icon('heart')} Segue desde ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}</span>${reg ? `<span>${icon('starF')} Subscritor há ${reg.months} ${reg.months === 1 ? 'mês' : 'meses'}</span>` : ''}<span class="tiny muted">Espetador fictício</span></div>
      ${msgs.length ? `<div class="uc-msgs">${msgs.map(m => `<div>${emotify(esc(m.text))}</div>`).join('')}</div>` : ''}
      <div class="uc-actions">
        <button class="btn btn-sm" data-act="uc-mention" data-user="${esc(u)}">${icon('at')} Mencionar</button>
        ${ctxLive && L ? `<button class="btn btn-sm" data-act="uc-timeout" data-user="${esc(u)}">${icon('clock')} 5 min</button><button class="btn btn-sm btn-danger" data-act="uc-ban" data-user="${esc(u)}">${banned ? 'Banido' : 'Banir'}</button>` : ''}
      </div></div></div>`;
}
function closePops() { $$('.ucard-pop, .cs-pop').forEach(p => p.remove()); }
function openPop(anchor, html, cls) {
  closePops();
  const host = anchor.closest('.chat') || document.body;
  const pop = document.createElement('div'); pop.className = cls; pop.innerHTML = html;
  host.appendChild(pop);
  uiSound('open');
  return pop;
}
const recentTexts = [];

const PRO_ACT = {
  'snd-open': () => { closePops(); UI.navMenu = null; MODAL.kind = 'sound'; openModal(soundSettingsHTML()); },
  'snd-mute': () => { S.prefs.sound = !S.prefs.sound; save(); openModal(soundSettingsHTML()); $$('[data-soundpanel]').forEach(el => el.outerHTML = soundPanelHTML()); if (S.prefs.sound) uiSound('success'); },
  'snd-test': () => { ['notif', 'follow', 'sub', 'mention', 'golive'].forEach((n, i) => setTimeout(() => { lastUi[n] = 0; uiSound(n); }, i * 650)); setTimeout(() => giftSound(true), 3400); },
  'player-pause': b => {
    const v = b.closest('.screen'); if (!v) return;
    const p = v.classList.toggle('paused'); b.innerHTML = icon(p ? 'playIc' : 'pause'); b.setAttribute('data-tip', p ? 'Reproduzir (espaço)' : 'Pausa (espaço)');
    if (!p) { playerOverlay('', 700); }
  },
  'player-vol': () => { const P = playerPrefs(); P.muted = !(P.muted || P.vol === 0); if (!P.muted && P.vol === 0) P.vol = .5; save(); paintPlayerCtrl(); },
  'player-q': () => { UI.qOpen = !UI.qOpen; paintPlayerCtrl(); if (UI.qOpen) uiSound('open'); },
  'player-qset': b => { const P = playerPrefs(); P.q = b.dataset.q; UI.qOpen = false; save(); applyQuality(); paintPlayerCtrl(); playerOverlay('', 900); toast('⚙️', 'Qualidade: ' + QUALITIES.find(q => q[0] === P.q)[1]); },
  'player-fs': () => {
    const v = $('.wp-video'); if (!v) return;
    try { if (document.fullscreenElement) document.exitFullscreen(); else (v.requestFullscreen ? v.requestFullscreen() : Promise.reject()).catch(() => ACT['w-full']()); } catch (e) { ACT['w-full'](); }
  },
  'chat-settings': b => {
    const open = $('.cs-pop'); if (open) { open.remove(); uiSound('close'); return; }
    openPop(b, chatSettingsHTML(), 'cs-pop');
  },
  'chat-size': b => { chatPrefs().size = b.dataset.s; save(); applyChatPrefs(); $$('.cs-pop .seg button').forEach(x => x.classList.toggle('on', x.dataset.s === b.dataset.s)); uiSound('toggle'); },
  'user-card': b => { const u = b.dataset.user; if (!u) return; const live = !!(S.live && route().name === 'estudio'); openPop(b, userCardHTML(u, live), 'ucard-pop'); },
  'uc-mention': b => { const i = $('#chatInput') || $('#wpInput') || $('#dockChatInput'); closePops(); if (i) { i.value = `@${b.dataset.user} ` + i.value; i.focus(); } },
  'uc-timeout': b => {
    const u = b.dataset.user, L = S.live; if (!L) return;
    L.muted = L.muted || {}; L.muted[u] = Date.now() + 5 * MIN; S.mod.stats.timeouts++;
    hideUserMsgs(u, `${u} foi silenciado durante 5 minutos`); pushChatBase({ sys: true, mod: true, text: `${u} foi silenciado durante 5 minutos.` }); closePops(); save();
  },
  'uc-ban': b => {
    const u = b.dataset.user, L = S.live; if (!L) return;
    if (!S.mod.banned.some(x => x.u === u)) { S.mod.banned.unshift({ u, t: Date.now() }); S.mod.stats.banned++; }
    hideUserMsgs(u, `${u} foi banido do chat`); pushChatBase({ sys: true, mod: true, text: `${u} foi banido do chat.` }); closePops(); rerenderMod(); save();
  },
};
function paintPlayerCtrl() { const c = $('.wp-ctrl'); const r = route(); if (c && r.name === 'watch') { c.outerHTML = playerCtrlHTML(r.id); const v = $('.wp-video'); if (v && v.classList.contains('paused')) { const b = $('.wp-ctrl [data-act="player-pause"]'); if (b) b.innerHTML = icon('playIc'); } } }

/* ---------- Integração com o resto da app ---------- */
function proInit() {
  S.prefs.snd = { ...defaultSnd(), ...(S.prefs.snd || {}) };
  playerPrefs(); chatPrefs(); applyChatPrefs();
  // notificações com som (fora da live)
  const notifyBase = notify;
  notify = function (...a) { notifyBase(...a); if (!S.live) uiSound('notif'); };
  // início e fim da live
  const startBase = startLive;
  startLive = function (...a) { const was = !!S.live; startBase(...a); if (!was && S.live) uiSound('golive'); };
  const endBase = endLive;
  endLive = function (...a) { const was = !!S.live; endBase(...a); if (was && !S.live) uiSound('endlive'); };
  // seguir e subscrever
  const followBase = ACT.follow;
  ACT.follow = (b, e) => { const a = S.accounts.find(x => x.id === b.dataset.id); const before = a && a.followed; followBase(b, e); if (a && !before && a.followed) uiSound('follow'); };
  const subBase = ACT['w-sub'];
  ACT['w-sub'] = (b, e) => { const had = !!(S.subs && S.subs[b.dataset.id]); subBase(b, e); if (!had && S.subs && S.subs[b.dataset.id]) uiSound('sub'); };
  // menus e interruptores
  ['nav-menu', 'create-toggle', 'emote-pick', 'menu', 'menu-sheet', 'create-sheet'].forEach(k => { const f = ACT[k]; if (f) ACT[k] = (b, e) => { f(b, e); uiSound('open'); }; });
  // chat: menos repetição, menções
  const pc = pushChat;
  pushChat = function (m) {
    const L = S.live;
    if (L && m && m.user && !m.sys && !m.gift && !m.me && !m.hype && !m.reply) {
      const k = String(m.text).toLowerCase().replace(/\W+/g, '');
      if (recentTexts.includes(k)) return;
      recentTexts.push(k); if (recentTexts.length > 40) recentTexts.shift();
    }
    if (L && m && m.user && !m.me && chatPrefs().mentions) {
      const me = S.me.handle.toLowerCase(), first = S.me.name.split(' ')[0].toLowerCase();
      const t = String(m.text).toLowerCase();
      if (t.includes('@' + me) || (first.length > 2 && new RegExp('\\b' + first + '\\b').test(t))) { m.mention = true; uiSound('mention'); }
    }
    return pc(m);
  };
  // player: atalhos de teclado
  document.addEventListener('keydown', e => {
    if (route().name !== 'watch' || isTyping() || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase(), q = sel => { const b = $(sel); if (b) { e.preventDefault(); b.click(); } };
    if (k === ' ' || k === 'k') q('.wp-ctrl [data-act="player-pause"]');
    else if (k === 'm') q('.wp-ctrl [data-act="player-vol"]');
    else if (k === 'f') q('.wp-ctrl [data-act="player-fs"]');
    else if (k === 't') q('.wp-ctrl [data-act="w-full"]');
  });
  // fechar janelas pequenas ao clicar fora
  document.addEventListener('click', e => {
    if (!e.target.closest('.ucard-pop, .cs-pop, [data-act="user-card"], [data-act="chat-settings"]')) { if ($('.ucard-pop, .cs-pop')) closePops(); }
    if (UI.qOpen && !e.target.closest('.wp-ctrl .tn-drop-wrap')) { UI.qOpen = false; paintPlayerCtrl(); }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.hasAttribute('data-pvol')) { const P = playerPrefs(); P.vol = +t.value; P.muted = P.vol === 0; save(); const b = $('.wp-ctrl [data-act="player-vol"]'); if (b) { b.innerHTML = icon(P.muted ? 'volMute' : 'vol'); b.classList.toggle('muted', P.muted); } }
    if (t.dataset.sndcat) { S.prefs.snd[t.dataset.sndcat] = t.checked; save(); uiSound('toggle'); }
    if (t.dataset.chatpref) { chatPrefs()[t.dataset.chatpref] = t.checked; save(); applyChatPrefs(); uiSound('toggle'); }
    if (t.hasAttribute('data-vol')) { $$('[data-volpct]').forEach(n => n.textContent = Math.round(+t.value * 100) + '%'); }
    if (t.type === 'checkbox' && t.closest('.switch') && !t.dataset.sndcat && !t.dataset.chatpref) uiSound('toggle');
  }, true);
  // transição suave entre páginas
  window.addEventListener('hashchange', () => { const m = $('#main'); if (m) { m.classList.remove('page-in'); void m.offsetWidth; m.classList.add('page-in'); } closePops(); UI.qOpen = false; });
  if (!navigator.onLine) setTimeout(() => netBanner(false), 500);
}
