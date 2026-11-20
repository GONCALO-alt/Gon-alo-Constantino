const LOGO_SVG_RAW = '<svg viewBox="0 0 512 512" role="img" aria-label="LiveVerse"> <defs> <linearGradient id="lvbgX" x1="0" y1="0" x2="1" y2="1"> <stop offset="0" stop-color="#a970ff"/> <stop offset=".55" stop-color="#9147ff"/> <stop offset="1" stop-color="#5c16c5"/> </linearGradient> </defs> <rect width="512" height="512" rx="116" fill="url(#lvbgX)"/> <g transform="rotate(-22 256 272)" fill="none" stroke="#fff" stroke-width="24" stroke-linecap="round"> <path d="M66 272 A190 76 0 0 1 446 272" stroke-opacity=".55"/> </g> <path d="M206 168 L206 376 L378 272 Z" fill="#fff" stroke="#7a2ff0" stroke-width="44" stroke-linejoin="round" paint-order="stroke"/> <path d="M206 168 L206 376 L378 272 Z" fill="#fff" stroke="#fff" stroke-width="22" stroke-linejoin="round"/> <g transform="rotate(-22 256 272)" fill="none" stroke="#fff" stroke-width="24" stroke-linecap="round"> <path d="M66 272 A190 76 0 0 0 446 272"/> </g> <circle cx="396" cy="126" r="44" fill="#ff3355" stroke="#fff" stroke-width="16"/> </svg>';
let logoN = 0;
const LOGO_SVG_FN = () => LOGO_SVG_RAW.replace(/lvbgX/g, 'lvbg' + (++logoN));
/* =====================================================================
   Social: relógio em tempo real, menu, explorar, mensagens diretas e
   moderação do chat. Contas e mensagens recebidas são fictícias.
   ===================================================================== */
Object.assign(IC, {
  chat: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
});

/* ---------- Relógio em tempo real ---------- */
const fullDate = t => { const d = new Date(t); return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`; };
const hms = t => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
function clockHTML(big = false) {
  const now = Date.now();
  return `<div class="clock ${big ? 'big' : ''}" aria-label="Hora atual"><b class="num" data-clock="time">${hms(now)}</b><small data-clock="date">${fullDate(now)}</small></div>`;
}
function tickClock() {
  const now = Date.now();
  $$('[data-clock="time"]').forEach(n => n.textContent = hms(now));
  $$('[data-clock="hm"]').forEach(n => n.textContent = hhmm(now));
  $$('[data-clock="date"]').forEach(n => n.textContent = fullDate(now));
}
function tickAgo() { $$('[data-ago]').forEach(n => { const v = ago(+n.dataset.ago); if (n.textContent !== v) n.textContent = v; }); }

/* ---------- Menu ---------- */
const NAV_GROUPS = [
  ['Descobrir', [['feed', 'home', 'Página inicial'], ['explorar', 'search', 'Procurar']]],
  ['Social', [['mensagens', 'chat', 'Mensagens'], ['notificacoes', 'bell', 'Atividade']]],
  ['Criador', [['estudio', 'studio', 'Estúdio'], ['eventos', 'calendar', 'Eventos'], ['clips', 'clip', 'Clips']]],
  ['Conta', [['perfil', 'user', 'Perfil']]],
];
const dmUnread = () => (S.dms || []).reduce((s, t) => s + (t.unread || 0), 0);
const notifUnread = () => S.notifs.filter(n => !n.read).length;
const badge = n => n ? `<span class="badge-count">${n > 99 ? '99+' : n}</span>` : '';
function navCurrent() { const r = route(); return r.name === 'profile' ? (r.id === 'me' ? 'perfil' : '') : r.name === 'feed' ? 'feed' : r.name; }
function navLink([h, ic, label], cur) {
  const extra = h === 'notificacoes' ? badge(notifUnread()) : h === 'mensagens' ? badge(dmUnread()) : h === 'estudio' && S.live ? '<span class="pill-live" style="margin-left:auto">LIVE</span>' : '';
  return `<a class="nav-link ${cur === h ? 'on' : ''}" href="#${h}" ${cur === h ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${extra}</a>`;
}
function createMenuHTML() {
  return `<div class="create-menu" role="menu">
    <button role="menuitem" data-act="compose"><span class="cm-ico" style="--c:var(--purple)">${icon('edit')}</span><span><b>Nova publicação</b><small>Texto, sondagem, foto, clip…</small></span></button>
    <button role="menuitem" data-act="new-event"><span class="cm-ico" style="--c:var(--blue)">${icon('calendar')}</span><span><b>Agendar live</b><small>Evento com contagem decrescente</small></span></button>
    <button role="menuitem" data-act="go-studio"><span class="cm-ico" style="--c:var(--live)">${icon('studio')}</span><span><b>${S.live ? 'Voltar à live' : 'Entrar em direto'}</b><small>${S.live ? fmt(S.live.viewers) + ' espectadores virtuais' : 'Abrir o estúdio'}</small></span></button>
  </div>`;
}
function renderNav() {
  const r = route(); const cur = navCurrent();
  $('#side').innerHTML = sideTwitchHTML();
  $('#topNav').innerHTML = topNavHTML();
  document.querySelector('.app').classList.toggle('side-mini', !!S.prefs.sideMini);
  $('#topBar').innerHTML = `<button class="tb-avatar" data-act="menu-sheet" aria-label="Menu">${avatar(S.me, 32).replace('<a ', '<span ').replace('</a>', '</span>')}${S.live ? '<i class="tn-live-dot"></i>' : ''}</button>
    <a class="logo" href="#feed" aria-label="LiveVerse"><span class="logo-mark">${LOGO_SVG_FN()}</span></a>
    <span class="spacer"></span>
    ${S.live ? `<a class="pill-live" href="#estudio">EM DIRETO</a>` : ''}
    <a class="icon-btn top-ic" href="#notificacoes" aria-label="Atividade">${icon('bell')}${badge(notifUnread())}</a>
    <a class="icon-btn top-ic" href="#mensagens" aria-label="Mensagens">${icon('inbox')}${badge(dmUnread())}</a>`;
  const bn = (h, ic, label, extra = '') => `<a class="nav-link ${cur === h ? 'on' : ''}" href="#${h}" ${cur === h ? 'aria-current="page"' : ''}>${ic}<span>${label}</span>${extra}</a>`;
  $('#bottomNav').innerHTML = `${bn('feed', icon('home'), 'Início')}${bn('explorar', icon('search'), 'Procurar')}
    <button class="nav-fab" data-act="create-sheet" aria-label="Criar">${icon('plus')}</button>
    ${bn('notificacoes', icon('bell'), 'Atividade', badge(notifUnread()))}
    ${bn('perfil', `<span class="bn-av">${avatar(S.me, 24).replace('<a ', '<span ').replace('</a>', '</span>')}</span>`, 'Perfil', S.live ? '<span class="pill-live"></span>' : '')}`;
  $('#liveFloat').hidden = true;
  renderDock();
}

/* ---------- Chat flutuante (fora do estúdio, durante a live) ---------- */
UI.dockOpen = window.innerWidth >= 820;
let dockKey = '';
function renderDock() {
  const dock = $('#chatDock'); if (!dock) return;
  const show = !!S.live && route().name !== 'estudio';
  const key = show ? S.live.id + '|' + UI.dockOpen : 'off';
  if (key === dockKey) return;
  dockKey = key; dock.hidden = !show;
  if (!show) { dock.innerHTML = ''; return; }
  const L = S.live;
  const lastM = [...L.chat].reverse().find(m => !m.sys && !m.gift && !m.removed);
  dock.className = 'chat-dock ' + (UI.dockOpen ? 'open' : 'min');
  if (!UI.dockOpen) {
    dock.innerHTML = `<button class="dock-pill" data-act="dock-toggle" aria-label="Abrir o chat da live"><span class="pill-live">EM DIRETO</span><span class="num" data-live="viewers">${fmt(L.viewers)}</span><span class="dock-last" id="dockLast">${lastM ? esc(lastM.user + ': ' + lastM.text) : 'Abrir chat'}</span>${icon('chat')}</button>`;
    return;
  }
  dock.innerHTML = `<section class="card chat">
    <div class="chat-head"><span class="pill-live">EM DIRETO</span><strong class="dock-title">${esc(L.title)}</strong><span class="spacer"></span><span class="small muted num" data-live="viewers">${fmt(L.viewers)}</span>
      <button class="icon-btn dock-mic ${MIC.on ? 'on' : ''}" id="dockMic" data-act="mic-toggle" title="Microfone" aria-label="Ligar ou desligar o microfone">${icon('mic')}</button>
      <a class="icon-btn" href="#estudio" title="Abrir estúdio" aria-label="Abrir estúdio">${icon('studio')}</a><button class="icon-btn" data-act="dock-toggle" title="Minimizar" aria-label="Minimizar chat">${icon('close')}</button></div>
    <div class="chat-list" data-chatlist="dock">${L.chat.slice(-40).map(chatMsgHTML).join('')}</div>
    <div class="dock-react">${PANEL_BUTTONS.filter(b => b[0] !== 'custom').slice(0, 6).map(([id, e, l]) => `<button data-act="react" data-id="${id}" title="${esc(l)}" aria-label="${esc(l)}">${e}</button>`).join('')}</div>
    <form class="chat-form" data-form="chat"><input class="input" id="dockChatInput" name="t" maxlength="200" placeholder="Fala com o chat…" autocomplete="off"><button class="btn btn-primary btn-sm">Enviar</button></form>
  </section>`;
  const list = dock.querySelector('.chat-list'); list.scrollTop = list.scrollHeight;
}
function openMenuSheet() {
  const cur = navCurrent();
  openModal(`<div class="sheet-grip" aria-hidden="true"></div>
    <div class="sheet-top"><a class="side-me-link" href="#perfil">${avatar(S.me, 46).replace('<a ', '<span ').replace('</a>', '</span>')}<div><strong>${esc(S.me.name)}</strong><small>@${esc(S.me.handle)} · nível ${career().level}</small></div></a>${clockHTML(true)}</div>
    ${S.live ? `<a class="live-pill" href="#estudio" style="margin:0 16px"><span class="pill-live">EM DIRETO</span><span class="num" data-live="viewers">${fmt(S.live.viewers)}</span><span class="tiny muted">espectadores virtuais</span></a>` : ''}
    <div class="sheet-body">${NAV_GROUPS.map(([g, items]) => `<div><span class="nav-label">${g}</span><div class="tile-grid">${items.map(([h, ic, label]) => `<a class="tile ${cur === h ? 'on' : ''}" href="#${h}">${icon(ic)}<span>${label}</span>${h === 'notificacoes' ? badge(notifUnread()) : h === 'mensagens' ? badge(dmUnread()) : ''}</a>`).join('')}</div></div>`).join('')}
      <div class="row"><button class="btn btn-sm" data-act="edit-profile">${icon('edit')} Editar perfil</button><button class="btn btn-sm" data-act="mod-open">${icon('shield')} Moderação</button><button class="btn btn-sm" data-act="accounts-edit">${icon('users')} Gerir contas</button><button class="btn btn-sm btn-ghost" data-act="modal-close" style="margin-left:auto">Fechar</button></div>
      <p class="tiny muted" style="margin:0">O LiveVerse é uma simulação: seguidores, espetadores, subscrições e métricas são fictícios.</p></div>`, 'sheet');
}
function openCreateSheet() {
  openModal(`<div class="sheet-grip" aria-hidden="true"></div><div class="sheet-body"><h2 style="font-size:20px">Criar</h2>${createMenuHTML()}<button class="btn btn-ghost" data-act="modal-close">Fechar</button></div>`, 'sheet');
}

/* ---------- Explorar ---------- */
UI.explore = { q: '', game: 'all' };
function viewExploreOld() {
  const games = Object.entries(GAMES).filter(([k]) => k !== 'amnesia');
  return `<div class="page-head"><div><h1>Explorar</h1><p>Descobre criadores, eventos, clips e tendências da rede fictícia.</p></div><span class="spacer"></span><button class="btn" data-act="accounts-edit">${icon('users')} Gerir contas</button></div>
  <div class="search-bar">${icon('search')}<input class="input" type="search" id="exploreQ" data-explore placeholder="Pesquisar contas, #hashtags, eventos, clips…" value="${esc(UI.explore.q)}" autocomplete="off" aria-label="Pesquisar"></div>
  <div class="chip-row" role="group" aria-label="Filtrar por jogo"><button class="chip ${UI.explore.game === 'all' ? 'on' : ''}" data-act="explore-game" data-k="all">Todos</button>${games.map(([k, g]) => `<button class="chip ${UI.explore.game === k ? 'on' : ''}" data-act="explore-game" data-k="${k}">${gicon(k, 18)} ${esc(g.name)}</button>`).join('')}</div>
  <div id="exploreResults">${exploreResults()}</div>`;
}
function exploreResults() {
  const q = UI.explore.q.trim().toLowerCase(), g = UI.explore.game;
  const byGame = x => g === 'all' || x === g;
  const accs = S.accounts.filter(a => g === 'all' || (a.games || []).includes(g));
  const evs = S.events.filter(e => byGame(e.game) && !e.cancelled);
  const clips = S.clips.filter(c => byGame(c.game));
  const posts = visiblePosts().filter(p => g === 'all' || p.game === g || hashtags(postText(p)).some(t => t.includes((GAMES[g]?.name || '').toLowerCase().replace(/[^\p{L}\d]/gu, ''))));
  const tagCount = {};
  visiblePosts().forEach(p => hashtags(postText(p)).forEach(t => tagCount[t] = (tagCount[t] || 0) + 1 + p.likes / 1500));
  const sec = (title, body, n) => `<section class="ex-sec"><h2 class="ex-title">${title}${n != null ? `<span class="num">${n}</span>` : ''}</h2>${body}</section>`;
  if (q) {
    const qq = q.replace(/^#/, '');
    const mA = accs.filter(a => [a.name, a.handle, a.bio, a.cat].join(' ').toLowerCase().includes(qq));
    const mT = Object.keys(tagCount).filter(t => t.includes(qq)).slice(0, 10);
    const mE = evs.filter(e => [e.title, e.desc, GAMES[e.game]?.name].join(' ').toLowerCase().includes(qq));
    const mC = clips.filter(c => [c.title, c.type, GAMES[c.game]?.name].join(' ').toLowerCase().includes(qq));
    const mP = posts.filter(p => postText(p).toLowerCase().includes(qq)).slice(0, 8);
    if (!mA.length && !mT.length && !mE.length && !mC.length && !mP.length) return `<div class="empty"><b>Sem resultados para «${esc(q)}»</b>Experimenta outro nome, jogo ou hashtag.</div>`;
    return [
      mA.length ? sec('Contas', `<div class="creator-grid">${mA.map(creatorCard).join('')}</div>`, mA.length) : '',
      mT.length ? sec('Hashtags', `<div class="chip-row">${mT.map(t => `<button class="chip" data-act="tag" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>`, mT.length) : '',
      mE.length ? sec('Eventos', `<div class="ev-grid">${mE.map(e => eventCard(e, { standalone: true })).join('')}</div>`, mE.length) : '',
      mC.length ? sec('Clips', `<div class="clip-grid">${mC.map(clipCard).join('')}</div>`, mC.length) : '',
      mP.length ? sec('Publicações', `<div class="feed">${mP.map(postCard).join('')}</div>`, mP.length) : '',
    ].join('');
  }
  const live = evs.filter(e => eventStatus(e) === 'live');
  const up = evs.filter(e => ['scheduled', 'soon'].includes(eventStatus(e))).sort((a, b) => b.interested - a.interested).slice(0, 4);
  const topClips = [...clips].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  const tags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const cats = Object.entries(GAMES).filter(([k]) => k !== 'amnesia').map(([k, G]) => ({ k, G, creators: S.accounts.filter(a => (a.games || []).includes(k)).length + (S.me.games.includes(k) ? 1 : 0), events: S.events.filter(e => e.game === k && ['scheduled', 'soon', 'live'].includes(eventStatus(e))).length, live: S.events.some(e => e.game === k && eventStatus(e) === 'live') })).sort((a, b) => (b.live - a.live) || (b.creators + b.events) - (a.creators + a.events));
  return [
    live.length ? sec('<span class="pill-live">EM DIRETO</span> Agora', `<div class="ev-grid">${live.map(e => eventCard(e, { standalone: true })).join('')}</div>`) : '',
    g === 'all' ? sec('Categorias', `<div class="cat-grid">${cats.map(c => `<button class="cat" style="--gc:${c.G.color}" data-act="explore-game" data-k="${c.k}">${gicon(c.k, 40)}<b>${esc(c.G.name)}</b><small>${c.creators} criadores · ${c.events} eventos</small>${c.live ? '<span class="pill-live">LIVE</span>' : ''}</button>`).join('')}</div>`) : '',
    sec('Criadores em destaque', accs.length ? `<div class="creator-grid">${[...accs].sort((a, b) => b.followers - a.followers).map(creatorCard).join('')}</div>` : '<p class="muted">Ainda não há criadores fictícios deste jogo.</p>'),
    tags.length ? sec(`Tendências ${SIM('simulado')}`, `<div class="trend-grid">${tags.map(([t, v], i) => `<button class="trend-card" data-act="tag" data-tag="${esc(t)}"><small>#${i + 1} em tendência</small><b>${esc(t)}</b><small>${fmt(v * 940)} publicações fictícias</small></button>`).join('')}</div>`) : '',
    topClips.length ? sec('Clips populares', `<div class="clip-grid">${topClips.map(clipCard).join('')}</div>`) : '',
    up.length ? sec('Próximos eventos', `<div class="ev-grid">${up.map(e => eventCard(e, { standalone: true })).join('')}</div>`) : '',
  ].join('');
}
function creatorCard(a) {
  const live = S.events.some(e => e.owner === a.id && eventStatus(e) === 'live');
  return `<article class="card creator"><div class="creator-banner" style="--cover:${esc(COVERS[a.hue % COVERS.length])}"></div>
    <div class="creator-body">${avatar(a, 56, live ? 'ring-live' : '')}
      <a href="#conta-${a.id}" class="creator-name"><strong>${esc(a.name)}</strong>${a.verified ? VERIFIED : ''}</a>
      <small class="muted">@${esc(a.handle)} · ${esc(a.cat)}</small>
      <div class="row" style="gap:4px">${(a.games || []).map(g => gicon(g, 22)).join('')}${live ? '<span class="pill-live">EM DIRETO</span>' : ''}</div>
      <span class="small"><b class="num">${fmt(a.followers)}</b> seguidores ${SIM('sim.')}</span>
      <div class="row" style="gap:6px;margin-top:auto"><button class="btn btn-sm ${a.followed ? '' : 'btn-primary'}" data-act="follow" data-id="${a.id}">${a.followed ? 'A seguir' : 'Seguir'}</button><a class="btn btn-sm" href="#conversa-${a.id}">${icon('chat')} Mensagem</a></div>
    </div></article>`;
}

/* ---------- Mensagens diretas ---------- */
UI.dmSearch = ''; UI.typing = {};
function seedDMs(now = Date.now()) {
  const M = (from, text, t) => ({ id: uid(), from, text, t });
  return [
    { id: 'a2', with: 'a2', unread: 1, msgs: [M('a2', 'Ei! Vi o teu evento do Modo Superstar 🔥', now - 2 * HOUR - 60000), M('a2', 'No fim da minha live posso fazer raid para a tua?', now - 2 * HOUR)] },
    { id: 'a1', with: 'a1', unread: 0, msgs: [M('me', 'Obrigado pelo raid de ontem! 💜', now - DAY - 3 * HOUR), M('a1', 'De nada!! Para a semana fazemos uma live juntos em Minecraft? 💎', now - DAY - 2 * HOUR)] },
    { id: 'a6', with: 'a6', unread: 0, msgs: [M('a6', 'Parabéns pelos 12 mil seguidores! 💜', now - 3 * DAY)] },
  ];
}
function thread(id, create = false) {
  let t = S.dms.find(x => x.with === id);
  if (!t && create && S.accounts.find(a => a.id === id)) { t = { id, with: id, unread: 0, msgs: [] }; S.dms.push(t); }
  return t;
}
const lastMsg = t => t.msgs[t.msgs.length - 1];
function viewMessages(activeId) {
  const active = activeId && thread(activeId, true);
  const list = [...S.dms].filter(t => t.msgs.length || t.with === activeId).sort((a, b) => (lastMsg(b)?.t || Date.now()) - (lastMsg(a)?.t || Date.now()));
  const q = UI.dmSearch.toLowerCase();
  const shown = list.filter(t => !q || [acc(t.with).name, acc(t.with).handle].join(' ').toLowerCase().includes(q));
  return `<div class="dm ${active ? 'has-active' : ''}">
    <aside class="card dm-list">
      <div class="dm-list-head"><h1>Mensagens</h1><button class="icon-btn" data-act="dm-new" aria-label="Nova mensagem" title="Nova mensagem">${icon('plus')}</button></div>
      <div class="search-bar small">${icon('search')}<input class="input" type="search" id="dmSearch" data-dmsearch placeholder="Procurar conversa" value="${esc(UI.dmSearch)}" autocomplete="off" aria-label="Procurar conversa"></div>
      <div class="dm-threads" id="dmThreads">${shown.length ? shown.map(t => dmThreadRow(t, activeId)).join('') : '<p class="muted small" style="padding:12px">Sem conversas.</p>'}</div>
      <p class="tiny muted" style="padding:10px 14px;margin:0">As contas e as respostas são fictícias e geradas pela app.</p>
    </aside>
    <section class="card dm-pane">${active ? dmPane(active) : `<div class="dm-empty">${icon('chat')}<b>As tuas mensagens</b><span class="muted">Fala com criadores fictícios, combina raids e colaborações, ou partilha eventos e clips.</span><button class="btn btn-primary" data-act="dm-new">${icon('plus')} Nova mensagem</button></div>`}</section>
  </div>`;
}
function dmThreadRow(t, activeId) {
  const a = acc(t.with), m = lastMsg(t);
  const prev = m ? (m.from === 'me' ? 'Tu: ' : '') + (m.share ? shareLabel(m.share) : m.text) : 'Nova conversa';
  return `<a class="dm-row ${t.with === activeId ? 'on' : ''} ${t.unread ? 'unread' : ''}" href="#conversa-${a.id}">${avatar(a, 44).replace('<a ', '<span ').replace('</a>', '</span>')}<div><div class="row" style="gap:6px;flex-wrap:nowrap"><strong>${esc(a.name)}</strong>${a.verified ? VERIFIED : ''}<span class="spacer"></span>${m ? `<time class="tiny muted" data-ago="${m.t}">${ago(m.t)}</time>` : ''}</div><span class="dm-prev">${UI.typing[t.with] ? '<i>a escrever…</i>' : esc(prev)}</span></div>${t.unread ? `<span class="badge-count">${t.unread}</span>` : ''}</a>`;
}
function dmPane(t) {
  const a = acc(t.with);
  let lastDay = null;
  const bubbles = t.msgs.map(m => {
    const sep = !lastDay || !sameDay(lastDay, m.t) ? `<div class="dm-day">${dayLabel(m.t)}</div>` : ''; lastDay = m.t;
    return sep + dmBubble(m);
  }).join('');
  return `<header class="dm-head"><a class="icon-btn dm-back" href="#mensagens" aria-label="Voltar às conversas">${icon('back')}</a>${avatar(a, 40)}<div style="min-width:0;flex:1"><a href="#conta-${a.id}" style="text-decoration:none"><strong>${esc(a.name)}</strong>${a.verified ? VERIFIED : ''}</a><span class="small dm-status"><i></i>${S.events.some(e => e.owner === a.id && eventStatus(e) === 'live') ? 'Em direto agora' : 'Ativo agora'} ${SIM()}</span></div><a class="btn btn-sm" href="#conta-${a.id}">Ver perfil</a></header>
  <div class="dm-msgs" id="dmMsgs">${bubbles || `<div class="dm-empty small">${avatar(a, 64)}<b>${esc(a.name)}</b><span class="muted">@${esc(a.handle)} · ${fmt(a.followers)} seguidores fictícios</span><span class="muted">Diz olá!</span></div>`}${UI.typing[t.with] ? '<div class="bubble them typing" id="dmTyping"><span></span><span></span><span></span></div>' : ''}</div>
  <div class="dm-quick">${['👋 Olá!', '🔥 Bora fazer uma live juntos?', '🛡️ Fazes raid no fim?', '💜 Obrigado!'].map(q => `<button class="chip" data-act="dm-quick" data-t="${esc(q)}">${esc(q)}</button>`).join('')}</div>
  <form class="dm-form" data-form="dm" data-id="${a.id}"><input class="input" id="dmInput" name="t" maxlength="500" placeholder="Escreve uma mensagem…" autocomplete="off"><button class="btn btn-primary" aria-label="Enviar">${icon('send')}</button></form>`;
}
function shareLabel(s) {
  if (s.type === 'event') { const e = S.events.find(x => x.id === s.id); return '📅 ' + (e ? e.title : 'Evento'); }
  if (s.type === 'clip') { const c = S.clips.find(x => x.id === s.id); return '🎬 ' + (c ? c.title : 'Clip'); }
  const p = S.posts.find(x => x.id === s.id); return '📝 ' + (p ? postText(p).slice(0, 60) : 'Publicação');
}
function dmBubble(m) {
  const share = m.share ? `<button class="dm-share" data-act="dm-share-open" data-type="${m.share.type}" data-id="${m.share.id}">${esc(shareLabel(m.share))}<small>Abrir</small></button>` : '';
  return `<div class="bubble ${m.from === 'me' ? 'me' : 'them'}">${share}${m.text ? `<span>${richText(m.text)}</span>` : ''}<time>${hhmm(m.t)}</time></div>`;
}
function afterMessagesRender() { const b = $('#dmMsgs'); if (b) b.scrollTop = b.scrollHeight; const r = route(); if (r.id) { const t = thread(r.id); if (t && t.unread) { t.unread = 0; save(); renderNav(); } } }
function refreshDM(id) {
  const r = route();
  if (r.name === 'mensagens') {
    const th = $('#dmThreads'); if (th) { const q = UI.dmSearch.toLowerCase(); th.innerHTML = [...S.dms].filter(t => t.msgs.length || t.with === r.id).sort((a, b) => (lastMsg(b)?.t || Date.now()) - (lastMsg(a)?.t || Date.now())).filter(t => !q || [acc(t.with).name, acc(t.with).handle].join(' ').toLowerCase().includes(q)).map(t => dmThreadRow(t, r.id)).join(''); }
    if (r.id === id) {
      const box = $('#dmMsgs'); const t = thread(id);
      if (box && t) { let lastDay = null; box.innerHTML = t.msgs.map(m => { const sep = !lastDay || !sameDay(lastDay, m.t) ? `<div class="dm-day">${dayLabel(m.t)}</div>` : ''; lastDay = m.t; return sep + dmBubble(m); }).join('') + (UI.typing[id] ? '<div class="bubble them typing"><span></span><span></span><span></span></div>' : ''); box.scrollTop = box.scrollHeight; }
      if (t && t.unread) { t.unread = 0; save(); }
    }
  }
  renderNav();
}
function sendDM(id, text, share) {
  const t = thread(id, true); if (!t) return;
  t.msgs.push({ id: uid(), from: 'me', text: text || '', t: Date.now(), share: share || null });
  save(); refreshDM(id);
  scheduleDMReply(id, text, share);
}
function scheduleDMReply(id, text, share) {
  if (UI.typing[id]) return;
  setTimeout(() => { UI.typing[id] = true; refreshDM(id); }, rand(700, 1600));
  setTimeout(() => { UI.typing[id] = false; receiveDM(id, dmReplyText(id, text, share)); }, rand(2600, 4800));
}
function dmReplyText(id, text = '', share) {
  const a = acc(id), t = text.toLowerCase();
  const next = S.events.filter(e => e.owner === 'me' && ['scheduled', 'soon'].includes(eventStatus(e))).sort((x, y) => x.start - y.start)[0];
  const g = GAMES[pick(a.games || ['fortnite'])].name;
  if (share) return share.type === 'event' ? `Que evento top! ${next ? `Vou estar lá ${dayLabel(next.start).toLowerCase()} às ${hhmm(next.start)} ⏰` : 'Já ativei o lembrete ⏰'}` : share.type === 'clip' ? pick(['HAHAHA este clip 😂', 'Que momento 😭🔥', 'Vou partilhar com a minha comunidade!']) : pick(['Vi agora, muito bom!', 'Concordo totalmente 👀', 'Top 🔥']);
  if (/raid/.test(t)) return pick(['Combinado! Faço raid no fim da minha live 🛡️', 'Claro! Avisa-me quando estiveres a acabar.', 'Bora, a minha comunidade vai adorar.']);
  if (/live|direto|evento|hoje|amanh/.test(t)) return next ? `Vou estar na tua live ${dayLabel(next.start).toLowerCase()} às ${hhmm(next.start)}! Já tenho o lembrete ativo ⏰` : 'Avisa quando marcares a próxima live, quero estar lá!';
  if (/juntos|collab|colab|squad|jogar|jogamos/.test(t)) return `Bora! Que tal ${g} ${pick(['no sábado à tarde', 'na sexta às 21h', 'amanhã à noite'])}? 🎮`;
  if (/obrigad|valeu/.test(t)) return pick(['De nada 💜', 'Sempre! 🙌', 'Estamos juntos!']);
  if (/ol[aá]|oi\b|boas|hey|bom dia|boa noite|boa tarde/.test(t)) return pick([`Olá ${S.me.name.split(' ')[0]}! Tudo bem? 😄`, 'Boas!! Como vai isso?', 'Heyyy 👋']);
  if (/\?\s*$/.test(t)) return pick(['Boa pergunta… acho que sim! 😅', 'Hmm, deixa-me pensar e já te digo.', 'Sim, sem dúvida!']);
  return pick(['Haha verdade 😂', 'Fixe! 🔥', 'Concordo!', 'Isso mesmo 💜', 'Vamos falando!']);
}
function receiveDM(id, text) {
  const t = thread(id, true); if (!t) return;
  t.msgs.push({ id: uid(), from: id, text, t: Date.now() });
  const r = route(); const viewing = r.name === 'mensagens' && r.id === id && document.visibilityState !== 'hidden';
  if (!viewing) { t.unread = (t.unread || 0) + 1; notify('✉️', `${acc(id).name}: ${text}`, { dm: id }); toast('✉️', `${acc(id).name}: ${text.length > 50 ? text.slice(0, 48) + '…' : text}`); }
  save(); refreshDM(id);
}
const DM_OPENERS = [
  'Ei! Vi o teu último clip, está brutal 😂',
  'Queres fazer uma live juntos esta semana?',
  'Posso fazer raid para a tua próxima live? 🛡️',
  'Que setup usas para as lives?',
  'Parabéns pelo crescimento! A tua comunidade é top 💜',
  'Vais participar no torneio da comunidade?',
];
function maybeInboundDM(now) {
  if (now - (S.lastDM || 0) < rand(4 * MIN, 7 * MIN)) return;
  S.lastDM = now;
  if (Math.random() < .45) return;
  const a = pick(S.accounts.filter(x => x.followed).concat(S.accounts));
  const next = S.events.filter(e => e.owner === 'me' && ['scheduled', 'soon'].includes(eventStatus(e))).sort((x, y) => x.start - y.start)[0];
  const opener = next && Math.random() < .4 ? `Vi o teu evento «${next.title}». Às ${hhmm(next.start)} estou lá! 🔥` : pick(DM_OPENERS);
  receiveDM(a.id, opener);
}
function openDMPicker(share) {
  const rows = S.accounts.map(a => `<button class="dm-pick" data-act="${share ? 'dm-send-share' : 'dm-goto'}" data-id="${a.id}" ${share ? `data-type="${share.type}" data-sid="${share.id}"` : ''}>${avatar(a, 40).replace('<a ', '<span ').replace('</a>', '</span>')}<span><strong>${esc(a.name)}</strong>${a.verified ? VERIFIED : ''}<small>@${esc(a.handle)}</small></span>${share ? `<span class="btn btn-sm btn-primary">${icon('send')} Enviar</span>` : ''}</button>`).join('');
  openModal(`<div class="modal-head"><h2>${share ? 'Enviar por mensagem' : 'Nova mensagem'}</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
    <div class="modal-body">${share ? `<div class="dm-share" style="cursor:default">${esc(shareLabel(share))}</div>` : ''}<div class="stack" style="gap:4px">${rows}</div></div>`);
}

/* ---------- Moderação ---------- */
const TROLLS = ['spam_bot99', 'troll_lusitano', 'hater_x', 'botzinho_pt', 'seguidores_baratos'];
const TROLL_LINES = ['SIGAM O MEU CANAL 👉 spam.pt', 'compra seguidores baratos!!! 💸', 'esta live é uma seca', 'és mesmo burro 🙄', 'ganha moedas grátis aqui 👉 link', 'FFFFFFFFFFFFFFFFFFFFF', 'aaaaaaaaaaaaaaaaaaaaaaaaa'];
const EMOTES = ['🔥🔥🔥', '💜💜', '😂😂😂', '👏👏', '😱', '🏆', '💎💎', '⚡', '🎉🎉', '👀'];
const defaultMod = () => ({ automod: true, slow: false, subOnly: false, emoteOnly: false, words: ['burro', 'seca', 'compra seguidores', 'grátis', 'spam.pt'], banned: [], stats: { deleted: 0, banned: 0, timeouts: 0, blocked: 0 } });
const isEmojiOnly = s => !/[\p{L}\d]/u.test(s);
function modFilter(m) {
  // devolve true se a mensagem pode aparecer
  if (m.sys || m.gift || m.me) return true;
  const L = S.live, M = S.mod, now = Date.now();
  if (M.banned.some(b => b.u === m.user)) return false;
  if (L.muted && L.muted[m.user] > now) return false;
  const low = m.text.toLowerCase();
  const word = M.words.find(w => w && low.includes(w.toLowerCase()));
  const spam = M.automod && (m.troll || /(.)\1{9,}/.test(m.text) || /👉|link|http/i.test(m.text));
  if (word || spam) {
    M.stats.blocked++;
    if (now - (L.lastAutoNotice || 0) > 9000) { L.lastAutoNotice = now; setTimeout(() => S.live === L && pushChat({ sys: true, mod: true, text: `🛡️ AutoMod bloqueou uma mensagem de ${m.user}${word ? ' (palavra bloqueada)' : ' (spam)'}` }), 0); }
    paintModStats();
    return false;
  }
  if (M.emoteOnly && !isEmojiOnly(m.text)) return false;
  if (M.subOnly) m.sub = true;
  return true;
}
function chatRateFactor() { const M = S.mod; return (M.slow ? .45 : 1) * (M.subOnly ? .4 : 1); }
function maybeTroll(L) {
  const p = .035 * (S.mod.subOnly ? .2 : 1);
  if (Math.random() < p) pushChat({ user: pick(TROLLS), text: pick(TROLL_LINES), troll: true, color: '#9aa0b4' });
}
function chatModTools(m) {
  if (m.sys || m.gift) return '';
  const pinOnly = m.me;
  return `<span class="msg-tools"><button data-act="mod-pin" data-id="${m.id}" title="Fixar mensagem" aria-label="Fixar">📌</button><button data-act="mod-del" data-id="${m.id}" title="Apagar" aria-label="Apagar">🗑️</button>${pinOnly ? '' : `<button data-act="mod-timeout" data-id="${m.id}" title="Silenciar 5 min" aria-label="Silenciar 5 minutos">⏱️</button><button data-act="mod-ban" data-id="${m.id}" title="Banir" aria-label="Banir">🔨</button>`}</span>`;
}
function hideUserMsgs(user, label) {
  const L = S.live; if (!L) return;
  L.chat.forEach(m => { if (m.user === user && !m.sys) { m.removed = label; } });
  $$('[data-chatlist] [data-user]').forEach(el => { if (el.dataset.user !== user) return; if (el.classList.contains('ov-msg')) el.remove(); else el.outerHTML = `<div class="msg removed">${esc(label)}</div>`; });
}
function chatBadgesHTML() {
  const M = S.mod;
  return [M.automod && '<span class="mini-badge">🛡️ AutoMod</span>', M.slow && '<span class="mini-badge">🐢 Modo lento</span>', M.subOnly && '<span class="mini-badge">⭐ Só subscritores</span>', M.emoteOnly && '<span class="mini-badge">😀 Só emojis</span>'].filter(Boolean).join('');
}
function pinnedHTML() {
  const p = S.live?.pinned; if (!p) return '';
  return `<div class="chat-pinned">📌 <span><b>${esc(p.user)}</b>: ${esc(p.text)}</span><button class="icon-btn" data-act="mod-unpin" aria-label="Desafixar">${icon('close')}</button></div>`;
}
function modPanelHTML() {
  const M = S.mod;
  const tog = (k, label, desc) => `<label class="switch mod-tog"><input type="checkbox" data-modtoggle="${k}" id="mod-${k}" ${M[k] ? 'checked' : ''}><span><b>${label}</b><small>${desc}</small></span></label>`;
  return `<div class="mod-panel" data-modpanel>
    <div class="mod-stats">
      <div><b class="num" data-modstat="blocked">${dots(M.stats.blocked)}</b><small>bloqueadas pelo AutoMod</small></div>
      <div><b class="num" data-modstat="deleted">${dots(M.stats.deleted)}</b><small>apagadas</small></div>
      <div><b class="num" data-modstat="timeouts">${dots(M.stats.timeouts)}</b><small>silenciados</small></div>
      <div><b class="num" data-modstat="banned">${dots(M.stats.banned)}</b><small>banidos</small></div>
    </div>
    <div class="mod-toggles">
      ${tog('automod', 'AutoMod', 'Bloqueia spam, links e mensagens repetidas.')}
      ${tog('slow', 'Modo lento', 'Menos mensagens por segundo no chat.')}
      ${tog('subOnly', 'Só subscritores', 'Só subscritores fictícios podem escrever.')}
      ${tog('emoteOnly', 'Só emojis', 'O chat só aceita emojis.')}
    </div>
    <div class="field"><span>Palavras bloqueadas</span>
      <div class="chip-row">${M.words.map((w, i) => `<span class="chip">${esc(w)}<button class="chip-x" data-act="mod-word-del" data-i="${i}" aria-label="Remover ${esc(w)}">${icon('close')}</button></span>`).join('') || '<span class="muted small">Nenhuma.</span>'}</div>
      <form class="reply-form" data-form="mod-word"><input class="input" id="modWord" name="w" maxlength="30" placeholder="Adicionar palavra ou expressão" autocomplete="off"><button class="btn btn-sm">Adicionar</button></form></div>
    <div class="field"><span>Utilizadores banidos (${M.banned.length})</span>
      ${M.banned.length ? `<div class="stack" style="gap:4px">${M.banned.map((b, i) => `<div class="sched-item"><span>🔨 ${esc(b.u)}</span><time class="tiny muted" data-ago="${b.t}">${ago(b.t)}</time><button class="btn btn-xs" data-act="mod-unban" data-i="${i}">Desbanir</button></div>`).join('')}</div>` : '<span class="muted small">Ninguém banido.</span>'}</div>
    ${S.live ? `<div class="row"><button class="btn btn-sm btn-danger" data-act="mod-clear">${icon('trash')} Limpar chat</button><span class="tiny muted">Passa o rato (ou toca) numa mensagem do chat para fixar, apagar, silenciar ou banir.</span></div>` : '<span class="tiny muted">Estas definições aplicam-se a todas as tuas lives simuladas.</span>'}
  </div>`;
}
function rerenderMod() { $$('[data-modpanel]').forEach(el => el.outerHTML = modPanelHTML()); const b = $('#chatBadges'); if (b) b.innerHTML = chatBadgesHTML(); }
function paintModStats() { const st = S.mod.stats; $$('[data-modstat]').forEach(n => n.textContent = dots(st[n.dataset.modstat] || 0)); }
function findChat(id) { return S.live && S.live.chat.find(m => m.id === id); }

const SOCIAL_ACT = {
  'accounts-edit': b => openAccountsEditor(b.dataset.id || null),
  'acc-add': () => { syncAccountsDraft(); MODAL.draft.push({ id: 'a_' + uid(), name: 'Nova conta', handle: 'novaconta' + randi(10, 99), hue: randi(0, 359), followers: 1000, verified: false, cat: 'Gaming', games: ['fortnite'], bio: '', followed: false, isNew: true }); MODAL.focusLast = true; paintAccountsEditor(); },
  'acc-del': b => { syncAccountsDraft(); MODAL.draft = MODAL.draft.filter(a => a.id !== b.dataset.id); paintAccountsEditor(); },
  'dock-toggle': () => { UI.dockOpen = !UI.dockOpen; renderDock(); if (UI.dockOpen) $('#dockChatInput')?.focus({ preventScroll: true }); },
  'create-toggle': () => { UI.createOpen = !UI.createOpen; renderNav(); },
  'create-sheet': () => openCreateSheet(),
  'menu-sheet': () => openMenuSheet(),
  'go-studio': () => { UI.createOpen = false; closeModalIfOpen(); if (route().name === 'estudio') render(); else location.hash = '#estudio'; },
  'explore-game': b => { UI.explore.game = b.dataset.k; if (route().name !== 'explorar') location.hash = '#explorar'; else { render(); } },
  'dm-new': () => openDMPicker(null),
  'dm-goto': b => { closeModal(); thread(b.dataset.id, true); location.hash = '#conversa-' + b.dataset.id; },
  'dm-quick': b => { const f = $('[data-form="dm"]'); if (f) sendDM(f.dataset.id, b.dataset.t); },
  'share-dm': b => { UI.menu = null; openDMPicker({ type: b.dataset.type, id: b.dataset.id }); },
  'dm-send-share': b => { sendDM(b.dataset.id, '', { type: b.dataset.type, id: b.dataset.sid }); closeModal(); toast('✉️', `Enviado para ${acc(b.dataset.id).name}`); },
  'dm-share-open': b => { const { type, id } = b.dataset; if (type === 'event') openEventDetail(id); else if (type === 'clip') location.hash = '#clips'; else { UI.openReplies.add(id); const p = S.posts.find(x => x.id === id); location.hash = p && p.author !== 'me' ? '#conta-' + p.author : '#perfil'; } },
  'mod-open': () => { UI.createOpen = false; openModal(`<div class="modal-head"><h2>${icon('shield', 'style="width:22px;vertical-align:-4px"')} Moderação do chat</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div><div class="modal-body">${modPanelHTML()}</div>`); },
  'msg-tap': b => { $$('[data-chatlist] .msg.open').forEach(x => x !== b && x.classList.remove('open')); b.classList.toggle('open'); },
  'mod-del': b => { const m = findChat(b.dataset.id); if (!m) return; m.removed = 'mensagem apagada por um moderador'; S.mod.stats.deleted++; $$(`[data-mid="${m.id}"]`).forEach(el => { if (el.classList.contains('ov-msg')) el.remove(); else el.outerHTML = `<div class="msg removed">mensagem apagada por um moderador</div>`; }); paintModStats(); save(); },
  'mod-timeout': b => { const m = findChat(b.dataset.id); if (!m) return; const L = S.live; L.muted = L.muted || {}; L.muted[m.user] = Date.now() + 5 * MIN; S.mod.stats.timeouts++; hideUserMsgs(m.user, `${m.user} foi silenciado durante 5 minutos`); pushChat({ sys: true, mod: true, text: `⏱️ ${m.user} foi silenciado durante 5 minutos.` }); paintModStats(); save(); },
  'mod-ban': b => {
    const m = findChat(b.dataset.id); if (!m) return; const L = S.live;
    if (!S.mod.banned.some(x => x.u === m.user)) S.mod.banned.unshift({ u: m.user, t: Date.now() });
    S.mod.stats.banned++; hideUserMsgs(m.user, `${m.user} foi banido do chat`);
    pushChat({ sys: true, mod: true, text: `🔨 ${m.user} foi banido do chat.` });
    addTimeline('mod', `Moderação: ${m.user} foi banido`, '🔨');
    if (m.troll) setTimeout(() => S.live === L && pushChat({ user: fakeUser(), text: pick(['obrigado mod 🙏', 'finalmente 😂', 'GG mod', 'chat limpo 💜']) }), 600);
    rerenderMod(); save();
  },
  'mod-pin': b => { const m = findChat(b.dataset.id); if (!m) return; S.live.pinned = { user: m.user, text: m.text }; const p = $('#chatPinnedBox'); if (p) p.innerHTML = pinnedHTML(); toast('📌', 'Mensagem fixada no chat'); save(); },
  'mod-unpin': () => { if (S.live) S.live.pinned = null; const p = $('#chatPinnedBox'); if (p) p.innerHTML = ''; save(); },
  'mod-clear': () => { const L = S.live; if (!L) return; L.chat = []; $$('[data-chatlist]').forEach(l => l.innerHTML = ''); pushChat({ sys: true, mod: true, text: '🧹 O chat foi limpo por um moderador.' }); },
  'mod-unban': b => { const x = S.mod.banned.splice(+b.dataset.i, 1)[0]; if (x) toast('✅', `${x.u} foi desbanido`); save(); rerenderMod(); },
  'mod-word-del': b => { S.mod.words.splice(+b.dataset.i, 1); save(); rerenderMod(); },
};
const SOCIAL_FORMS = {
  accounts: () => saveAccounts(),
  dm: f => { const t = f.t.value.trim(); if (!t) return; f.t.value = ''; sendDM(f.dataset.id, t); $('#dmInput')?.focus(); },
  'mod-word': f => { const w = f.w.value.trim().toLowerCase(); if (!w) return; if (!S.mod.words.includes(w)) S.mod.words.push(w); save(); rerenderMod(); $('#modWord')?.focus(); },
};
function onSocialInput(t) {
  if (t.hasAttribute('data-explore')) { UI.explore.q = t.value; const box = $('#exploreResults'); if (box) { box.innerHTML = exploreResults(); tickCountdowns(); } return true; }
  if (t.hasAttribute('data-dmsearch')) { UI.dmSearch = t.value; refreshDM(null); return true; }
  if (t.dataset.modtoggle) {
    S.mod[t.dataset.modtoggle] = t.checked; save();
    const b = $('#chatBadges'); if (b) b.innerHTML = chatBadgesHTML();
    $$(`[data-modtoggle="${t.dataset.modtoggle}"]`).forEach(x => x.checked = t.checked);
    if (S.live) pushChat({ sys: true, mod: true, text: `${t.checked ? 'Ativado' : 'Desativado'}: ${{ automod: 'AutoMod', slow: 'modo lento', subOnly: 'só subscritores', emoteOnly: 'só emojis' }[t.dataset.modtoggle]}.` });
    return true;
  }
  return false;
}

/* ---------- Gerir contas fictícias ---------- */
function openAccountsEditor(focusId) {
  MODAL.kind = 'accounts';
  MODAL.draft = S.accounts.map(a => ({ ...a, games: [...(a.games || [])] }));
  MODAL.focusId = focusId;
  paintAccountsEditor();
}
function syncAccountsDraft() {
  const f = $('#accForm'); if (!f) return;
  MODAL.draft.forEach(a => {
    const row = f.querySelector(`[data-accrow="${a.id}"]`); if (!row) return;
    const v = n => row.querySelector(`[name="${n}"]`);
    a.name = v('name').value; a.handle = v('handle').value; a.bio = v('bio').value; a.cat = v('cat').value;
    a.followers = Math.max(0, Math.round(+v('followers').value || 0)); a.verified = v('verified').checked; a.hue = +v('hue').value;
    a.games = [...row.querySelectorAll('input[name="g"]:checked')].map(i => i.value);
  });
}
function paintAccountsEditor() {
  const D = MODAL.draft;
  openModal(`<div class="modal-head"><h2>Gerir contas</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
  <form id="accForm" data-form="accounts">
    <div class="modal-body">
      <p class="small muted" style="margin:0">Estas contas fazem parte da simulação: publicam, entram em direto, enviam mensagens e aparecem no chat. Muda os nomes, as bios e os números como quiseres. Fica guardado só neste navegador.</p>
      ${D.map((a, i) => `<details class="acc-row" data-accrow="${a.id}" ${a.isNew && MODAL.focusLast && i === D.length - 1 || MODAL.focusId === a.id ? 'open' : ''}>
        <summary>${avatar(a, 36).replace('<a ', '<span ').replace('</a>', '</span>')}<span><strong>${esc(a.name)}</strong>${a.verified ? VERIFIED : ''}<small>@${esc(a.handle)} · ${fmt(a.followers)} seguidores</small></span>${icon('chevR', 'class="acc-chev"')}</summary>
        <div class="acc-fields">
          <div class="grid-2"><label class="field"><span>Nome</span><input class="input" name="name" id="an-${a.id}" maxlength="40" required value="${esc(a.name)}"></label>
            <label class="field"><span>Nome de utilizador</span><input class="input" name="handle" id="ah-${a.id}" maxlength="24" required value="${esc(a.handle)}"></label></div>
          <label class="field"><span>Biografia</span><input class="input" name="bio" id="ab-${a.id}" maxlength="200" value="${esc(a.bio || '')}"></label>
          <div class="grid-3"><label class="field"><span>Categoria</span><select class="input" name="cat" id="ac-${a.id}">${CATEGORIES.map(c => `<option ${a.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
            <label class="field"><span>Seguidores (fictícios)</span><input class="input" type="number" min="0" max="100000000" name="followers" id="af-${a.id}" value="${a.followers}"></label>
            <label class="field"><span>Cor do avatar</span><input class="input hue" type="range" min="0" max="359" name="hue" id="au-${a.id}" value="${a.hue}" style="--h:${a.hue}"></label></div>
          <div class="field"><span>Jogos</span><div class="chip-row">${Object.entries(GAMES).map(([k, g]) => `<label class="chip ${a.games.includes(k) ? 'on' : ''}" style="cursor:pointer"><input type="checkbox" name="g" value="${k}" ${a.games.includes(k) ? 'checked' : ''} hidden data-chipcheck>${gicon(k, 18)} ${esc(g.name)}</label>`).join('')}</div></div>
          <div class="row"><label class="switch"><input type="checkbox" name="verified" id="av-${a.id}" ${a.verified ? 'checked' : ''}> Selo de verificação fictício</label><span class="spacer"></span><button type="button" class="btn btn-sm btn-danger" data-act="acc-del" data-id="${a.id}">${icon('trash')} Apagar conta</button></div>
        </div></details>`).join('')}
      <button type="button" class="btn" data-act="acc-add" style="align-self:flex-start">${icon('plus')} Adicionar conta</button>
      <p class="small" id="accErr" style="color:#ff8aa0;margin:0" hidden></p>
    </div>
    <div class="modal-foot"><button type="button" class="btn btn-ghost" data-act="modal-close">Cancelar</button><button class="btn btn-primary">Guardar contas</button></div>
  </form>`, true);
  MODAL.focusLast = false;
}
function saveAccounts() {
  syncAccountsDraft();
  const D = MODAL.draft, err = $('#accErr');
  for (const a of D) {
    a.name = a.name.trim(); a.handle = a.handle.trim().replace(/^@/, '').toLowerCase();
    if (!a.name || !/^[a-z0-9_.]+$/.test(a.handle)) { err.textContent = `Revê a conta «${a.name || 'sem nome'}»: o nome de utilizador só pode ter letras, números, «_» e «.».`; err.hidden = false; return; }
    if (!a.games.length) a.games = ['fortnite'];
    delete a.isNew;
  }
  const handles = D.map(a => a.handle);
  if (handles.length !== new Set(handles).size || handles.includes(S.me.handle)) { err.textContent = 'Há dois nomes de utilizador iguais. Cada conta precisa de um diferente.'; err.hidden = false; return; }
  if (!D.length) { err.textContent = 'Mantém pelo menos uma conta na simulação.'; err.hidden = false; return; }
  const keep = new Set(D.map(a => a.id));
  const gone = S.accounts.filter(a => !keep.has(a.id)).map(a => a.id);
  if (gone.length) {
    const g = new Set(gone);
    S.posts = S.posts.filter(p => !g.has(p.author));
    S.posts.forEach(p => p.replies = p.replies.filter(r => !g.has(r.author)));
    S.events = S.events.filter(e => !g.has(e.owner));
    S.clips = S.clips.filter(c => !g.has(c.streamer));
    S.dms = S.dms.filter(t => !g.has(t.with));
  }
  S.accounts = D;
  save(); closeModal(); render(); toast('✅', 'Contas guardadas');
}

/* Canais seguidos na barra lateral (como numa plataforma de streaming) */
function sideChannelsHTML() {
  const liveEv = id => channelLive(S.accounts.find(x => x.id === id));
  const list = [...S.accounts].sort((a, b) => (!!liveEv(b) - !!liveEv(a)) || (b.followed - a.followed) || b.followers - a.followers).slice(0, 7);
  return `<div class="side-channels"><span class="nav-label">Canais recomendados</span>${list.map(a => {
    const ev = liveEv(a.id);
    const av = avatar(a, 30, ev ? '' : 'off').replace('<a ', '<span ').replace('</a>', '</span>');
    return ev ? `<a class="chan" href="${chanHash(a.id)}" title="${esc(a.name)} · ${esc(ev.title)}">${av}<span><strong>${esc(a.name)}</strong><small>${esc(GAMES[ev.game]?.name || '')}</small></span><span class="chan-v"><i></i><span data-chv="${ev.id}">${fmt(ev.viewers || 1000)}</span></span></a>`
      : `<a class="chan" href="#conta-${a.id}">${av}<span><strong>${esc(a.name)}</strong><small>${esc(GAMES[(a.games || [])[0]]?.name || a.cat)}</small></span><span class="chan-off">Offline</span></a>`;
  }).join('')}</div>`;
}
