/* =====================================================================
   Padrões de interface de uma plataforma de streaming: controlos do
   player com auto-esconder, clique para pausa e duplo clique para ecrã
   inteiro, modo teatro com chat, recolher o chat, regras do chat,
   deixar de seguir no coração, sino só para quem segue, barra lateral
   com «Mostrar mais» e cartão ao passar o rato, «Mostrar mais» na
   página inicial, categorias com seguir/ordenar/clipes e sugestões na
   pesquisa. A marca, o logótipo e os sons próprios continuam a ser do
   LiveVerse.
   ===================================================================== */
Object.assign(IC, {
  heartBreak: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/><path d="m12 8-1.5 3 3 2-1.5 3"/>',
  collapseR: '<path d="M4 4v16M20 12H9M13 8l-4 4 4 4"/>',
  collapseL: '<path d="M20 4v16M4 12h11M11 8l4 4-4 4"/>',
  sort: '<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>',
});
/* cores de nome predefinidas, ajustadas para fundo escuro */
NAME_COLORS.splice(0, NAME_COLORS.length, '#FF4A4A', '#7B8CFF', '#3EC23E', '#E05A5A', '#FF7F50', '#9ACD32', '#FF6A33', '#4BC08C', '#DAA520', '#E0883F', '#6FB2B5', '#4DA3FF', '#FF69B4', '#A970FF', '#00E57A');

/* ---------- Player: auto-esconder, clique e duplo clique ---------- */
let ctrlT = null, clickT = null;
function ctrlShow(v) {
  v.classList.add('ctrl-on');
  clearTimeout(ctrlT);
  ctrlT = setTimeout(() => { if (!v.matches(':hover') || !v.querySelector('.pq-menu')) v.classList.remove('ctrl-on'); }, 2600);
}
document.addEventListener('mousemove', e => { const v = e.target.closest && e.target.closest('.wp-video'); if (v) ctrlShow(v); }, { passive: true });
document.addEventListener('mouseleave', e => { if (e.target && e.target.classList && e.target.classList.contains('wp-video')) e.target.classList.remove('ctrl-on'); }, true);
document.addEventListener('click', e => {
  const v = e.target.closest && e.target.closest('.wp-video');
  if (!v || e.target.closest('.wp-ctrl, .wp-top, .wp-htop, button, a, .pl-load, .chat-expand')) return;
  clearTimeout(clickT);
  clickT = setTimeout(() => { const b = v.querySelector('[data-act="player-pause"]'); if (b && v.isConnected) ACT['player-pause'](b); }, 230);
}, true);
document.addEventListener('dblclick', e => {
  const v = e.target.closest && e.target.closest('.wp-video');
  if (!v || e.target.closest('.wp-ctrl, button, a')) return;
  clearTimeout(clickT);
  ACT['player-fs']();
}, true);

/* ---------- Barra lateral com «Mostrar mais» e cartão ao passar o rato ---------- */
UI.sideMoreF = false; UI.sideMoreR = false;
function sideTwitchHTML() {
  const mini = !!S.prefs.sideMini;
  const row = (a, ev) => {
    const av = avatar(a, 30, ev ? '' : 'off').replace('<a ', '<span ').replace('</a>', '</span>');
    const href = a.id === 'me' ? '#estudio' : chanHash(a.id);
    return `<a class="chan ${ev ? '' : 'is-off'}" href="${href}" data-hovercard="${a.id}">${av}<span><strong>${esc(a.name)}</strong><small>${ev ? esc(GAMES[ev.game]?.name || '') : ''}</small></span>${ev ? `<span class="chan-v"><i></i><span ${a.id === 'me' ? 'data-live="viewers"' : `data-chv="${ev.id}"`}>${fmt(a.id === 'me' ? S.live.viewers : ev.viewers || 0)}</span></span>` : '<span class="chan-off">Offline</span>'}</a>`;
  };
  const followed = S.accounts.filter(a => a.followed).map(a => [a, channelLive(a)]).sort((x, y) => (!!y[1] - !!x[1]) || ((y[1]?.viewers || 0) - (x[1]?.viewers || 0)));
  const rec = S.accounts.filter(a => !a.followed).map(a => [a, channelLive(a)]).filter(x => x[1]).sort((x, y) => (y[1].viewers || 0) - (x[1].viewers || 0));
  const fShow = UI.sideMoreF ? followed : followed.slice(0, 6), rShow = UI.sideMoreR ? rec : rec.slice(0, 4);
  const more = (k, open, n) => n ? `<button class="sd-more" data-act="side-more" data-k="${k}">${open ? 'Mostrar menos' : 'Mostrar mais'}</button>` : '';
  return `<div class="sd-head"><span class="sd-title">Para ti</span><button class="tn-ic sd-toggle" data-act="side-mini" aria-label="${mini ? 'Expandir' : 'Recolher'} barra lateral">${icon(mini ? 'expandSide' : 'collapse')}</button></div>
    ${S.live ? `<span class="sd-label">O teu canal</span>${row(S.me, S.live)}` : ''}
    <span class="sd-label">Canais seguidos</span>
    ${fShow.length ? fShow.map(([a, ev]) => row(a, ev)).join('') : '<p class="sd-empty">Segue canais para os veres aqui.</p>'}
    ${more('f', UI.sideMoreF, followed.length > 6)}
    <span class="sd-label">Canais em direto recomendados</span>
    ${rShow.map(([a, ev]) => row(a, ev)).join('') || '<p class="sd-empty">Sem recomendações agora.</p>'}
    ${more('r', UI.sideMoreR, rec.length > 4)}
    <p class="sd-foot">O LiveVerse é uma simulação: seguidores, espetadores, subscrições e métricas são fictícios.</p>`;
}
let hcEl = null, hcT = null;
function hoverCardShow(link) {
  const id = link.dataset.hovercard, a = id === 'me' ? S.me : S.accounts.find(x => x.id === id); if (!a) return;
  const ev = id === 'me' ? S.live : channelLive(a);
  hcEl = hcEl || Object.assign(document.createElement('div'), { className: 'hovercard' });
  hcEl.innerHTML = ev ? `<b>${esc(ev.title)}</b><span>${esc(GAMES[ev.game]?.name || '')} · ${espet(id === 'me' ? S.live.viewers : ev.viewers || 0)}</span>` : `<b>${esc(a.name)}</b><span>Offline · ${fmt(a.followers)} seguidores</span>`;
  document.body.appendChild(hcEl);
  const r = link.getBoundingClientRect();
  hcEl.style.top = Math.max(56, r.top + r.height / 2 - hcEl.offsetHeight / 2) + 'px'; hcEl.style.left = (r.right + 8) + 'px';
  hcEl.classList.add('on');
}
document.addEventListener('mouseover', e => {
  const l = e.target.closest && e.target.closest('.side [data-hovercard]');
  clearTimeout(hcT);
  if (!l) { if (hcEl) hcEl.classList.remove('on'); return; }
  hcT = setTimeout(() => hoverCardShow(l), 250);
}, true);

/* ---------- Sugestões na pesquisa de cima ---------- */
function searchSuggest(q) {
  const box = $('#tnSuggest'); if (!box) return;
  q = q.trim().toLowerCase();
  if (!q) { box.hidden = true; return; }
  const cats = Object.entries(GAMES).filter(([k, g]) => k !== 'amnesia' && g.name.toLowerCase().includes(q)).slice(0, 4);
  const chans = S.accounts.filter(a => (a.name + ' ' + a.handle).toLowerCase().includes(q)).slice(0, 6);
  box.innerHTML = (cats.length || chans.length) ? `${cats.map(([k, g]) => `<button type="button" class="sg" data-act="cat-open" data-k="${k}">${gicon(k, 30)}<span><b>${esc(g.name)}</b><small>Categoria</small></span></button>`).join('')}
    ${chans.map(a => { const ev = channelLive(a); return `<a class="sg" href="${chanHash(a.id)}">${avatar(a, 30).replace('<a ', '<span ').replace('</a>', '</span>')}<span><b>${esc(a.name)}${a.verified ? VERIFIED : ''}</b><small>${ev ? `<i class="sg-live"></i>Em direto · ${esc(GAMES[ev.game]?.name || '')}` : 'Offline'}</small></span></a>`; }).join('')}
    <button type="button" class="sg sg-all" data-act="search-all">${icon('search')} Ver todos os resultados para «${esc(q)}»</button>`
    : `<p class="sg-none">Sem resultados para «${esc(q)}»</p>`;
  box.hidden = false;
}

/* ---------- Página de categoria: seguir, separadores, ordenar ---------- */
UI.catTab = 'live'; UI.catSort = 'rec';
function categoryPageHTML(k) {
  const G = GAMES[k] || GAMES.chat;
  let lives = liveChannels().filter(e => e.game === k);
  if (UI.catSort === 'desc') lives.sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
  else if (UI.catSort === 'asc') lives.sort((a, b) => (a.viewers || 0) - (b.viewers || 0));
  else if (UI.catSort === 'recent') lives.sort((a, b) => b.start - a.start);
  const total = lives.reduce((s, e) => s + (e.viewers || 0), 0) + (S.live && S.live.game === k ? S.live.viewers : 0);
  const fol = !!(S.catFollow && S.catFollow[k]);
  const catFollowers = 2000 + hashStr(k) % 900000 + (fol ? 1 : 0);
  const clips = S.clips.filter(c => c.game === k);
  return `<div class="cat-head"><span class="cat-art big" style="--gc:${G.color}"><span class="tw-thumb-bg"></span><b>${esc(glyphText(G))}</b></span>
      <div><button class="btn btn-sm btn-ghost" data-act="cat-back">${icon('chevL')} Procurar</button><h1>${esc(G.name)}</h1>
        <p class="muted"><b class="cat-n">${espet(total)}</b> · ${fmt(catFollowers)} seguidores ${SIM()}</p>${tagChips(streamTags(k))}
        <button class="btn ${fol ? '' : 'btn-primary'} cat-fol" data-act="cat-follow" data-k="${k}" style="margin-top:10px">${icon(fol ? 'heartFill' : 'heart')} ${fol ? 'A seguir' : 'Seguir'}</button></div></div>
    <div class="cat-bar"><div class="tw-tabs" style="margin:0;border:0">${[['live', 'Canais em direto'], ['clips', 'Clipes']].map(([t, l]) => `<button class="${UI.catTab === t ? 'on' : ''}" data-act="cat-tab" data-t="${t}">${l}</button>`).join('')}</div>
      ${UI.catTab === 'live' ? `<label class="cat-sort">Ordenar por <select class="input" data-catsort id="catSort">${[['rec', 'Recomendados para ti'], ['desc', 'Espetadores (mais para menos)'], ['asc', 'Espetadores (menos para mais)'], ['recent', 'Começaram recentemente']].map(([v, l]) => `<option value="${v}" ${UI.catSort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>` : ''}</div>
    ${UI.catTab === 'live'
      ? `<div class="tw-grid">${S.live && S.live.game === k ? liveCardHTML(S.live, true) : ''}${lives.map(e => liveCardHTML(e)).join('') || '<div class="empty"><b>Ninguém em direto nesta categoria</b>Volta mais tarde ou entra tu em direto.</div>'}</div>`
      : clips.length ? `<div class="clip-grid">${clips.map(clipCard).join('')}</div>` : '<div class="empty"><b>Ainda não há clipes desta categoria</b>Cria clipes durante as lives.</div>'}`;
}

/* ---------- Regras do chat (primeira mensagem em cada canal) ---------- */
const CHAT_RULES = ['Sê simpático e respeita toda a gente.', 'Nada de spam, links ou autopromoção.', 'Não partilhes dados pessoais.', 'Segue as indicações dos moderadores.'];
function chatRulesModal(accId, onOk) {
  const a = acc(accId);
  MODAL.kind = 'rules'; MODAL.onRulesOk = onOk;
  openModal(`<div class="modal-head"><h2>Regras do chat</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
    <div class="modal-body"><p style="margin:0">O chat de <b>${esc(a.name)}</b> tem estas regras:</p><ol class="rules">${CHAT_RULES.map(r => `<li>${r}</li>`).join('')}</ol></div>
    <div class="modal-foot"><button class="btn btn-primary" data-act="rules-ok" data-id="${accId}">Aceito</button></div>`);
}

const TW4_ACT = {
  'side-more': b => { if (b.dataset.k === 'f') UI.sideMoreF = !UI.sideMoreF; else UI.sideMoreR = !UI.sideMoreR; renderNav(); },
  'home-more': () => { UI.homeMore = !UI.homeMore; render(); },
  'search-all': () => { const i = $('#topSearch'); UI.explore.q = i ? i.value.trim() : ''; UI.browseCat = null; const s = $('#tnSuggest'); if (s) s.hidden = true; if (route().name !== 'explorar') location.hash = '#explorar'; else render(); },
  'cat-follow': b => { S.catFollow = S.catFollow || {}; const k = b.dataset.k; S.catFollow[k] = !S.catFollow[k]; save(); if (S.catFollow[k]) { uiSound('follow'); toast('💜', `A seguir a categoria ${GAMES[k]?.name || k}`); } render(); },
  'cat-tab': b => { UI.catTab = b.dataset.t; render(); },
  'chat-collapse': () => { UI.chatCollapsed = !UI.chatCollapsed; const wp = $('.wp'); if (wp) wp.classList.toggle('chat-collapsed', UI.chatCollapsed); uiSound(UI.chatCollapsed ? 'close' : 'open'); },
  'rules-ok': b => { S.rulesOk = S.rulesOk || {}; S.rulesOk[b.dataset.id] = true; save(); const fn = MODAL.onRulesOk; closeModal(); if (fn) fn(); },
  'w-full': () => {
    UI.watchFull = !UI.watchFull;
    const wp = $('.wp'); if (wp) wp.classList.toggle('full', UI.watchFull);
    document.body.classList.toggle('theater-on', UI.watchFull);
    $$('.wp-ctrl [data-act="w-full"]').forEach(btn => btn.setAttribute('data-tip', UI.watchFull ? 'Sair do modo teatro (t)' : 'Modo teatro (t)'));
    const l = $('#wpChat'); if (l) l.scrollTop = l.scrollHeight;
  },
};
function tw4Init() {
  // seguir: o coração passa a «deixar de seguir» ao passar o rato; sem confirmação, como na plataforma original
  // enviar no chat de outro canal: regras na primeira vez
  const sendBase = FORMS['watch-send'];
  FORMS['watch-send'] = f => {
    const id = f.dataset.id; S.rulesOk = S.rulesOk || {};
    if (!S.rulesOk[id] && f.t.value.trim()) { chatRulesModal(id, () => sendBase(f)); return; }
    sendBase(f);
  };
  // definições do chat: horas escondidas por omissão
  const c = chatPrefs(); if (!c.v2) { c.time = false; c.v2 = true; save(); applyChatPrefs(); }
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'topSearch') searchSuggest(t.value);
    if (t.hasAttribute && t.hasAttribute('data-catsort')) { UI.catSort = t.value; render(); }
  });
  document.addEventListener('focusin', e => { if (e.target.id === 'topSearch' && e.target.value) searchSuggest(e.target.value); });
  document.addEventListener('click', e => { if (!e.target.closest('.tn-search')) { const s = $('#tnSuggest'); if (s) s.hidden = true; } });
  window.addEventListener('hashchange', () => { const s = $('#tnSuggest'); if (s) s.hidden = true; if (hcEl) hcEl.classList.remove('on'); UI.homeMore = false; if (route().name !== 'explorar') { UI.catTab = 'live'; } });
}
