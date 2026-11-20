/* =====================================================================
   Layout de plataforma de streaming no computador: barra de topo,
   barra lateral só com canais, destaque na página inicial, categorias,
   página Procurar e pontos do canal. Marca e logótipo são do LiveVerse.
   ===================================================================== */
Object.assign(IC, {
  dots3: '<circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/>',
  inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6H3v-6z"/>',
  collapse: '<path d="M4 4v16M9 12h11M13 8l-4 4 4 4"/>',
  expandSide: '<path d="M20 4v16M4 12h11M11 8l4 4-4 4"/>',
  chest: '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13h18M5 9a7 7 0 0 1 14 0M11 13v3h2v-3"/>',
  pointsIc: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10M8.5 10.5 12 7l3.5 3.5"/>',
});

/* ---------- Barra de topo ---------- */
UI.navMenu = null;
function topNavHTML() {
  const cur = navCurrent();
  const more = [['eventos', 'calendar', 'Eventos'], ['clips', 'clip', 'Clipes'], ['estudio', 'studio', 'Painel do criador'], ['mensagens', 'chat', 'Mensagens'], ['perfil', 'user', 'O meu canal']];
  return `<div class="tn-left">
      <a class="tn-logo" href="#feed" aria-label="LiveVerse — página inicial"><span class="logo-mark">${LOGO_SVG_FN()}</span></a>
      <a class="tn-link ${cur === 'feed' && UI.homeTab === 'following' ? 'on' : ''}" href="#feed" data-act="go-following">Seguidos</a>
      <a class="tn-link ${cur === 'explorar' ? 'on' : ''}" href="#explorar">Procurar</a>
      <div class="tn-drop-wrap"><button class="tn-ic" data-act="nav-menu" data-m="more" aria-label="Mais" aria-expanded="${UI.navMenu === 'more'}">${icon('dots3')}</button>
        ${UI.navMenu === 'more' ? `<div class="tn-drop">${more.map(([h, ic, l]) => `<a href="#${h}">${icon(ic)} ${l}</a>`).join('')}<button data-act="home-posts">${icon('edit')} Publicações</button></div>` : ''}</div>
    </div>
    <form class="tn-search" data-form="topsearch" role="search"><input class="input" id="topSearch" name="q" placeholder="Procurar" autocomplete="off" value="${esc(UI.explore?.q || '')}"><button aria-label="Procurar">${icon('search')}</button></form>
    <div class="tn-right">
      <span class="tn-clock num" data-clock="hm">${hhmm(Date.now())}</span>
      <a class="tn-ic" href="#notificacoes" aria-label="Atividade" title="Atividade">${icon('bell')}${badge(notifUnread())}</a>
      <a class="tn-ic" href="#mensagens" aria-label="Mensagens" title="Mensagens">${icon('inbox')}${badge(dmUnread())}</a>
      <a class="tn-golive ${S.live ? 'is-live' : ''}" href="#estudio">${icon('studio')} ${S.live ? 'Em direto' : 'Transmitir'}</a>
      <div class="tn-drop-wrap"><button class="tn-avatar" data-act="nav-menu" data-m="user" aria-label="Menu do utilizador" aria-expanded="${UI.navMenu === 'user'}">${avatar(S.me, 30).replace('<a ', '<span ').replace('</a>', '</span>')}${S.live ? '<i class="tn-live-dot"></i>' : ''}</button>
        ${UI.navMenu === 'user' ? `<div class="tn-drop tn-drop-r">
          <div class="tn-me">${avatar(S.me, 40).replace('<a ', '<span ').replace('</a>', '</span>')}<div><strong>${esc(S.me.name)}</strong><small>${fmt(S.me.followers)} seguidores · nível ${career().level}</small></div></div>
          <a href="#perfil">${icon('user')} Canal</a><button data-act="emotes-open">${icon('emote')} Emotes do canal</button><a href="#estudio">${icon('studio')} Painel do criador</a>
          <button data-act="new-event">${icon('calendar')} Agendar live</button><button data-act="compose">${icon('edit')} Nova publicação</button>
          <hr><button data-act="edit-profile">${icon('edit')} Editar perfil</button><button data-act="mod-open">${icon('shield')} Moderação</button><button data-act="accounts-edit">${icon('users')} Gerir contas</button>
        </div>` : ''}</div>
    </div>`;
}

/* ---------- Barra lateral: só canais ---------- */
function sideTwitchHTML() {
  const mini = !!S.prefs.sideMini;
  const row = (a, ev) => {
    const av = avatar(a, 30, ev ? '' : 'off').replace('<a ', '<span ').replace('</a>', '</span>');
    const href = a.id === 'me' ? '#estudio' : chanHash(a.id);
    return `<a class="chan ${ev ? '' : 'is-off'}" href="${href}" title="${esc(a.name)}${ev ? ' · ' + esc(ev.title) : ' · Offline'}">${av}<span><strong>${esc(a.name)}</strong><small>${ev ? esc(GAMES[ev.game]?.name || '') : ''}</small></span>${ev ? `<span class="chan-v"><i></i><span ${a.id === 'me' ? 'data-live="viewers"' : `data-chv="${ev.id}"`}>${fmt(a.id === 'me' ? S.live.viewers : ev.viewers || 0)}</span></span>` : '<span class="chan-off">Offline</span>'}</a>`;
  };
  const followed = S.accounts.filter(a => a.followed).map(a => [a, channelLive(a)]).sort((x, y) => (!!y[1] - !!x[1]) || ((y[1]?.viewers || 0) - (x[1]?.viewers || 0)));
  const rec = S.accounts.filter(a => !a.followed).map(a => [a, channelLive(a)]).filter(x => x[1]).sort((x, y) => (y[1].viewers || 0) - (x[1].viewers || 0)).slice(0, 6);
  return `<div class="sd-head"><span class="sd-title">Para ti</span><button class="tn-ic sd-toggle" data-act="side-mini" aria-label="${mini ? 'Expandir' : 'Recolher'} barra lateral" title="${mini ? 'Expandir' : 'Recolher'}">${icon(mini ? 'expandSide' : 'collapse')}</button></div>
    ${S.live ? `<span class="sd-label">O teu canal</span>${row(S.me, S.live)}` : ''}
    <span class="sd-label">Canais seguidos</span>
    ${followed.length ? followed.map(([a, ev]) => row(a, ev)).join('') : '<p class="sd-empty">Segue canais para os veres aqui.</p>'}
    <span class="sd-label">Canais em direto recomendados</span>
    ${rec.map(([a, ev]) => row(a, ev)).join('') || '<p class="sd-empty">Sem recomendações agora.</p>'}
    <p class="sd-foot">O LiveVerse é uma simulação: seguidores, espetadores, subscrições e métricas são fictícios.</p>`;
}

/* ---------- Página inicial: destaque e categorias ---------- */
UI.featIdx = 0;
function featuredHTML(lives) {
  if (!lives.length) return '';
  const list = lives.slice(0, 6); const i = Math.min(UI.featIdx, list.length - 1); const ev = list[i];
  const mine = ev === S.live; const a = mine ? S.me : acc(ev.owner), G = GAMES[ev.game] || GAMES.chat;
  const face = a.avatar ? `<img src="${a.avatar}" alt="">` : esc((a.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase());
  return `<section class="feat" aria-label="Em destaque">
    <a class="feat-player tw-thumb" href="${mine ? '#estudio' : chanHash(a.id)}" style="--gc:${G.color}">
      <span class="tw-thumb-bg"></span><span class="tw-thumb-glyph">${esc(glyphText(G))}</span>
      <span class="tw-thumb-cam" style="--h:${a.hue || 270}">${face}</span>
      <span class="tw-live">Em direto</span>
      ${folCounterHTML(Math.round(mine ? S.live.viewers : ev.viewers || 0), Math.floor(mine ? S.me.followers : a.followers), null, null)}
    </a>
    <div class="feat-info">
      <div class="wp-chan">${avatar(a, 50, 'ring-live')}<div><a class="wp-name" href="${mine ? '#perfil' : chanHash(a.id)}">${esc(a.name)}${a.verified ? VERIFIED : ''}</a><a class="wp-game" href="#explorar" data-act="cat-open" data-k="${ev.game}">${esc(G.name)}</a><span class="feat-vw">${espet(mine ? S.live.viewers : ev.viewers || 0)}</span></div></div>
      ${tagChips(streamTagsFor(ev).slice(0, 3))}
      <p class="feat-title">${esc(ev.title)}</p>
      <p class="tiny muted">${esc((a.bio || '').slice(0, 140))}</p>
    </div>
    <div class="feat-strip">${list.map((e, k) => { const g = GAMES[e.game] || GAMES.chat; return `<button class="feat-mini ${k === i ? 'on' : ''}" data-act="feat-sel" data-i="${k}" style="--gc:${g.color}" aria-label="Destaque ${k + 1}"><span class="tw-thumb-bg"></span><span>${esc(g.glyph)}</span></button>`; }).join('')}</div>
  </section>`;
}
function categoryStats() {
  const map = {};
  liveChannels().forEach(e => { map[e.game] = (map[e.game] || 0) + (e.viewers || 0); });
  if (S.live) map[S.live.game] = (map[S.live.game] || 0) + S.live.viewers;
  return Object.keys(GAMES).filter(k => k !== 'amnesia').map(k => ({ k, viewers: map[k] || 0 })).sort((a, b) => b.viewers - a.viewers);
}
function catCardHTML({ k, viewers }) {
  const G = GAMES[k];
  return `<button class="cat-card" data-act="cat-open" data-k="${k}">
    <span class="cat-art" style="--gc:${G.color}"><span class="tw-thumb-bg"></span><b>${esc(glyphText(G))}</b><em>${esc(G.name)}</em></span>
    <strong>${esc(G.name)}</strong><small>${espet(viewers)}</small>${tagChips([({ br: 'Shooter', sandbox: 'Aventura', fps: 'FPS', sports: 'Desporto', open: 'Ação', horror: 'Terror', moba: 'MOBA', chat: 'IRL' })[G.genre] || 'Jogo'])}
  </button>`;
}

/* ---------- Procurar ---------- */
UI.browseTab = 'cats'; UI.browseCat = null;
function viewExplore() {
  const q = (UI.explore.q || '').trim();
  if (UI.browseCat && !q) {
    const k = UI.browseCat, G = GAMES[k] || GAMES.chat;
    const lives = liveChannels().filter(e => e.game === k);
    const total = lives.reduce((s, e) => s + (e.viewers || 0), 0) + (S.live && S.live.game === k ? S.live.viewers : 0);
    return `<div class="cat-head"><span class="cat-art big" style="--gc:${G.color}"><span class="tw-thumb-bg"></span><b>${esc(glyphText(G))}</b></span>
      <div><button class="btn btn-sm btn-ghost" data-act="cat-back">${icon('chevL')} Procurar</button><h1>${esc(G.name)}</h1><p class="muted">${espet(total)} · ${lives.length + (S.live && S.live.game === k ? 1 : 0)} canais em direto</p>${tagChips(streamTags(k))}</div></div>
      <div class="tw-tabs"><button class="on">Canais em direto</button></div>
      <div class="tw-grid">${S.live && S.live.game === k ? liveCardHTML(S.live, true) : ''}${lives.map(e => liveCardHTML(e)).join('') || '<div class="empty"><b>Ninguém em direto nesta categoria</b>Volta mais tarde ou entra tu em direto.</div>'}</div>`;
  }
  return `<div class="page-head"><div><h1>Procurar</h1></div></div>
    <div class="tw-tabs">${[['cats', 'Categorias'], ['live', 'Canais em direto']].map(([k2, l]) => `<button class="${UI.browseTab === k2 && !q ? 'on' : ''}" data-act="browse-tab" data-k="${k2}">${l}</button>`).join('')}</div>
    <div class="search-bar">${icon('search')}<input class="input" type="search" id="exploreQ" data-explore placeholder="Procurar canais, categorias, #hashtags, clipes…" value="${esc(UI.explore.q)}" autocomplete="off" aria-label="Procurar"></div>
    <div id="exploreResults">${q ? exploreResults() : UI.browseTab === 'cats' ? `<div class="cat-grid2">${categoryStats().map(catCardHTML).join('')}</div>` : `<div class="tw-grid">${S.live ? liveCardHTML(S.live, true) : ''}${liveChannels().map(e => liveCardHTML(e)).join('')}</div>`}</div>`;
}

/* ---------- Pontos do canal ---------- */
function pointsHTML(accId) {
  const p = (S.points && S.points[accId]) || 0;
  return `<span class="pts" data-pts="${accId}" title="Pontos do canal (fictícios)">${icon('pointsIc')}<b class="num">${dots(p)}</b>${WATCH.chest && WATCH.key === accId ? `<button type="button" class="pts-chest" data-act="w-chest" data-id="${accId}" aria-label="Recolher bónus">${icon('chest')}</button>` : ''}</span>`;
}
function paintPoints(accId) { $$(`[data-pts="${accId}"]`).forEach(el => el.outerHTML = pointsHTML(accId)); }
function pointsTick(a) {
  const now = Date.now();
  WATCH.ptsAt = WATCH.ptsAt || now; WATCH.chestAt = WATCH.chestAt || now;
  if (now - WATCH.ptsAt > 60000) { WATCH.ptsAt = now; S.points = S.points || {}; S.points[a.id] = (S.points[a.id] || 0) + 10; paintPoints(a.id); save(); }
  if (!WATCH.chest && now - WATCH.chestAt > 120000) { WATCH.chest = true; paintPoints(a.id); }
}

const TW2_ACT = {
  'nav-menu': b => { const m = b.dataset.m; UI.navMenu = UI.navMenu === m ? null : m; renderNav(); },
  'go-following': () => { UI.homeTab = 'following'; if (route().name === 'feed') render(); },
  'home-posts': () => { UI.homeTab = 'posts'; UI.navMenu = null; if (route().name !== 'feed') location.hash = '#feed'; else render(); },
  'side-mini': () => { S.prefs.sideMini = !S.prefs.sideMini; save(); document.querySelector('.app').classList.toggle('side-mini', S.prefs.sideMini); renderNav(); },
  'feat-sel': b => { UI.featIdx = +b.dataset.i; const f = $('.feat'); if (f) f.outerHTML = featuredHTML(liveHomeList()); },
  'cat-open': b => { UI.browseCat = b.dataset.k; UI.explore.q = ''; if (route().name !== 'explorar') location.hash = '#explorar'; else render(); window.scrollTo({ top: 0 }); },
  'cat-back': () => { UI.browseCat = null; render(); },
  'browse-tab': b => { UI.browseTab = b.dataset.k; UI.browseCat = null; UI.explore.q = ''; render(); },
  'w-chest': b => { const id = b.dataset.id; S.points = S.points || {}; S.points[id] = (S.points[id] || 0) + 50; WATCH.chest = false; WATCH.chestAt = Date.now(); paintPoints(id); save(); toast('🎁', '+50 pontos do canal (fictícios)'); },
};
const TW2_FORMS = {
  topsearch: f => { UI.explore.q = f.q.value.trim(); UI.browseCat = null; if (route().name !== 'explorar') location.hash = '#explorar'; else render(); },
};
function liveHomeList() { const l = liveChannels(); return S.live ? [S.live, ...l] : l; }
