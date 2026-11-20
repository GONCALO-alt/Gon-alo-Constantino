/* =====================================================================
   Vistas: navegação, feed, publicações, eventos, perfil, clips, notificações
   ===================================================================== */
const UI = {
  feedTab: 'all', tag: null, profTab: 'posts', profSub: 'posts', evTab: 'upcoming', clipTab: 'all',
  calMonth: (() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime(); })(),
  calSel: null, openReplies: new Set(), openComments: new Set(), menu: null, lastSig: '',
  cmp: { type: 'text', text: '', game: 'fortnite', eventId: '', poll: ['', ''], pollHours: 24, achId: '', img: null, clipId: '', schedule: false, at: '' },
};

function route() {
  const h = (location.hash || '#feed').slice(1);
  if (h.startsWith('conta-')) return { name: 'profile', id: h.slice(6) };
  if (h === 'perfil') return { name: 'profile', id: 'me' };
  if (h.startsWith('conversa-')) return { name: 'mensagens', id: h.slice(9) };
  if (['feed', 'eventos', 'estudio', 'clips', 'notificacoes', 'explorar', 'mensagens'].includes(h)) return { name: h };
  return { name: 'feed' };
}

function paintBadges() { if (S) renderNav(); }

function render() {
  if (!S) return;
  document.documentElement.dataset.accent = S.me.accent || 'purple';
  renderNav();
  const r = route();
  const main = $('#main');
  document.querySelector('.app').classList.toggle('wide', r.name === 'estudio' || r.name === 'mensagens');
  const html = r.name === 'feed' ? viewFeed()
    : r.name === 'profile' ? viewProfile(r.id)
    : r.name === 'eventos' ? viewEvents()
    : r.name === 'estudio' ? viewStudio()
    : r.name === 'clips' ? viewClips()
    : r.name === 'explorar' ? viewExplore()
    : r.name === 'mensagens' ? viewMessages(r.id)
    : viewNotifs();
  main.innerHTML = html;
  $('#rail').innerHTML = viewRail();
  if (r.name === 'estudio') afterStudioRender();
  if (r.name === 'mensagens') afterMessagesRender();
  tickClock();
  updateLiveBits();
  tickCountdowns();
  UI.lastSig = statusSig();
}
function statusSig() { return S.events.map(e => e.id + eventStatus(e)).join('|') + '|' + S.posts.filter(p => p.status === 'scheduled').length + '|' + !!S.live; }

/* ---------- Rail ---------- */
function viewRail() {
  const now = Date.now();
  const liveNow = S.events.filter(e => e.owner !== 'me' && eventStatus(e) === 'live');
  const upcoming = S.events.filter(e => ['scheduled', 'soon'].includes(eventStatus(e)) && (e.owner === 'me' || e.myReminder)).sort((a, b) => a.start - b.start).slice(0, 4);
  const tags = {};
  S.posts.filter(p => p.status === 'published' && now - p.createdAt < 14 * DAY).forEach(p => hashtags(postText(p)).forEach(t => tags[t] = (tags[t] || 0) + 1 + p.likes / 1000));
  const top = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sugg = S.accounts.filter(a => !a.followed).slice(0, 4);
  return `
  ${liveNow.length ? `<section class="card panel"><h3 class="panel-title"><span class="pill-live">EM DIRETO</span> Agora ${SIM()}</h3>
    ${liveNow.map(e => { const a = acc(e.owner); return `<button class="rail-ev" data-act="watch" data-id="${e.id}">${avatar(a, 38, 'ring-live').replace('<a ', '<span ').replace('</a>', '</span>')}<div><strong>${esc(a.name)}</strong><small>${esc(GAMES[e.game].name)} · <span data-watchers="${e.id}">${fmt(e.viewers || 1000)}</span> a ver</small></div></button>`; }).join('')}
  </section>` : ''}
  <section class="card panel"><h3 class="panel-title">${icon('calendar', 'style="width:18px"')} Próximos eventos <small><a href="#eventos">Ver todos</a></small></h3>
    ${upcoming.length ? upcoming.map(e => `<button class="rail-ev" data-act="event-open" data-id="${e.id}">${gicon(e.game, 34)}<div><strong>${esc(e.title)}</strong><small>${eventStatus(e) === 'soon' ? 'A começar em breve' : `<span data-cdtext="${e.start}">${cdShort(e.start - now)}</span>`} · ${e.owner === 'me' ? 'teu' : '@' + esc(acc(e.owner).handle)}</small></div></button>`).join('')
      : `<p class="muted small" style="margin:0">Sem eventos agendados. <button class="btn btn-xs" data-act="new-event">Agendar</button></p>`}
  </section>
  <section class="card panel"><h3 class="panel-title">${icon('bolt', 'style="width:18px"')} Tendências ${SIM('simulado')}</h3>
    ${top.map(([t, v], i) => `<button class="trend" data-act="tag" data-tag="${esc(t)}"><small>${i + 1} · Tendência no LiveVerse</small><b>${esc(t)}</b><small>${fmt(v * 940)} publicações fictícias</small></button>`).join('') || '<p class="muted small">Sem tendências ainda.</p>'}
  </section>
  <section class="card panel"><h3 class="panel-title">${icon('users', 'style="width:18px"')} Quem seguir</h3>
    ${sugg.map(a => `<div class="sugg">${avatar(a, 40)}<a href="#conta-${a.id}"><strong>${esc(a.name)}${a.verified ? VERIFIED : ''}</strong><small>@${esc(a.handle)} · ${fmt(a.followers)} seguidores</small></a><button class="btn btn-sm" data-act="follow" data-id="${a.id}">Seguir</button></div>`).join('') || '<p class="muted small">Já segues todas as contas sugeridas.</p>'}
  </section>`;
}

/* ---------- Feed ---------- */
function postText(p) { if (p.type === 'event' && p.text == null) { const ev = S.events.find(e => e.id === p.eventId); return ev ? eventPostText(ev) : ''; } return p.text || ''; }
function visiblePosts() { return S.posts.filter(p => p.status === 'published').sort((a, b) => b.createdAt - a.createdAt); }
function viewFeed() {
  let list = visiblePosts();
  if (UI.feedTab === 'following') list = list.filter(p => p.author === 'me' || acc(p.author).followed);
  if (UI.feedTab === 'saved') list = list.filter(p => p.saved);
  if (UI.feedTab === 'events') list = list.filter(p => p.type === 'event' || p.type === 'live');
  if (UI.tag) list = list.filter(p => hashtags(postText(p)).includes(UI.tag));
  const soon = S.events.filter(e => e.owner === 'me' && eventStatus(e) === 'soon' && !S.live);
  return `
  ${soonBanner(soon)}
  <div class="page-head"><div><h1>Início</h1><p>A tua rede de criadores. Tudo o que vês de audiência é simulado.</p></div></div>
  ${composerHTML()}
  <div class="tabs" role="tablist">
    ${[['all', 'Para ti'], ['following', 'A seguir'], ['events', 'Eventos e lives'], ['saved', 'Guardados']].map(([k, l]) => `<button class="tab ${UI.feedTab === k ? 'on' : ''}" data-act="feed-tab" data-k="${k}">${l}</button>`).join('')}
  </div>
  ${UI.tag ? `<div class="row" style="margin-bottom:12px"><span class="chip on">${esc(UI.tag)}</span><button class="btn btn-sm btn-ghost" data-act="tag-clear">${icon('close')} Limpar filtro</button></div>` : ''}
  <div class="feed">${list.length ? list.map(postCard).join('') : `<div class="empty"><b>Nada por aqui</b>${UI.feedTab === 'saved' ? 'Guarda publicações com o ícone do marcador.' : 'Publica algo ou segue mais contas fictícias.'}</div>`}</div>`;
}
function soonBanner(list) {
  return list.map(e => `<div class="soon-banner"><span class="pill-soon">A COMEÇAR EM BREVE</span><div><strong>${esc(e.title)}</strong><span class="muted small">${whenLabel(e.start)} · <b data-int="${e.id}">${fmt(e.interested)}</b> interessados ${SIM()}</span></div><button class="btn btn-live" data-act="start-event" data-id="${e.id}">${icon('studio')} Começar live</button></div>`).join('');
}

/* ---------- Composer ---------- */
function composerHTML() {
  const c = UI.cmp;
  const sched = S.posts.filter(p => p.author === 'me' && p.status === 'scheduled').sort((a, b) => a.scheduledAt - b.scheduledAt);
  return `<section class="card composer" id="composer">
    <div class="ptypes" role="group" aria-label="Tipo de publicação">${POST_TYPES.map(([k, e, l]) => `<button class="chip ${c.type === k ? 'on' : ''}" data-act="cmp-type" data-k="${k}">${e} ${l}</button>`).join('')}</div>
    <div class="composer-top">${avatar(S.me, 46)}<div>
      <textarea id="cmpText" data-cmp="text" maxlength="600" placeholder="${esc(cmpPlaceholder(c.type))}" aria-label="Texto da publicação">${esc(c.text)}</textarea>
      <div class="cmp-extra" id="cmpExtra">${composerExtra()}</div>
      <div class="tag-preview" id="cmpTags">${tagPreview(c.text)}</div>
    </div></div>
    <div class="composer-bar">
      <label class="switch"><input type="checkbox" id="cmpSchedule" data-cmp="schedule" ${c.schedule ? 'checked' : ''}> Agendar</label>
      <input class="input" type="datetime-local" id="cmpAt" data-cmp="at" value="${esc(c.at)}" style="width:auto;flex:0 1 220px" ${c.schedule ? '' : 'hidden'} aria-label="Data e hora de publicação">
      <span class="spacer"></span>
      <span class="count" id="cmpCount">${c.text.length}/500</span>
      <button class="btn btn-primary" data-act="publish">${c.schedule ? icon('clock') + ' Agendar' : 'Publicar'}</button>
    </div>
    ${sched.length ? `<div class="sched-list"><span class="small muted">Publicações agendadas (${sched.length})</span>${sched.map(p => `<div class="sched-item">${icon('clock', 'style="width:16px;flex:none"')}<span>${esc(postText(p) || POST_TYPES.find(t => t[0] === p.type)[2])}</span><b class="num">${whenLabel(p.scheduledAt)}</b><button class="btn btn-xs btn-ghost" data-act="sched-cancel" data-id="${p.id}">Cancelar</button></div>`).join('')}</div>` : ''}
  </section>`;
}
function cmpPlaceholder(t) {
  return { text: 'O que se passa na tua comunidade?', game: 'Que jogo vais jogar? Conta tudo…', live: 'Anuncia a tua próxima live…', event: 'Escreve um texto para acompanhar o evento (opcional)…', poll: 'Faz uma pergunta à comunidade…', achievement: 'Celebra a tua conquista…', photo: 'Escreve uma legenda…', clip: 'Fala sobre este clip…' }[t];
}
function tagPreview(t) { const h = hashtags(t); return h.length ? 'Hashtags: ' + h.map(x => `<b>${esc(x)}</b>`).join(' ') : ''; }
function composerExtra() {
  const c = UI.cmp;
  const gameSel = `<label class="field"><span>Jogo</span><select class="input" data-cmp="game" id="cmpGame">${Object.entries(GAMES).map(([k, g]) => `<option value="${k}" ${c.game === k ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>`;
  if (c.type === 'game') return gameSel;
  if (c.type === 'live') return `${gameSel}<p class="small muted" style="margin:0">${S.live ? 'Estás em direto: a publicação liga diretamente à live atual.' : 'Anuncia que vais entrar em direto. Para uma data e hora concretas, usa um evento.'}</p>`;
  if (c.type === 'event') {
    const mine = S.events.filter(e => e.owner === 'me' && ['scheduled', 'soon'].includes(eventStatus(e)));
    return `<div class="row"><label class="field" style="flex:1"><span>Evento</span><select class="input" data-cmp="eventId" id="cmpEvent"><option value="">Escolhe um evento…</option>${mine.map(e => `<option value="${e.id}" ${c.eventId === e.id ? 'selected' : ''}>${esc(e.title)} · ${whenLabel(e.start)}</option>`).join('')}</select></label><button class="btn" data-act="new-event" style="align-self:flex-end">${icon('plus')} Novo evento</button></div>`;
  }
  if (c.type === 'poll') return `<div class="stack" style="gap:8px">${c.poll.map((o, i) => `<div class="row" style="flex-wrap:nowrap"><input class="input" id="cmpPoll${i}" data-cmp="poll" data-i="${i}" maxlength="60" placeholder="Opção ${i + 1}" value="${esc(o)}">${c.poll.length > 2 ? `<button class="icon-btn" data-act="poll-del" data-i="${i}" aria-label="Remover opção">${icon('close')}</button>` : ''}</div>`).join('')}
    <div class="row">${c.poll.length < 4 ? `<button class="btn btn-sm" data-act="poll-add">${icon('plus')} Opção</button>` : ''}<label class="field" style="flex-direction:row;align-items:center;gap:8px;margin-left:auto"><span>Duração</span><select class="input" data-cmp="pollHours" id="cmpPollH" style="width:auto">${[1, 6, 24, 72].map(h => `<option value="${h}" ${+c.pollHours === h ? 'selected' : ''}>${h} h</option>`).join('')}</select></label></div></div>`;
  if (c.type === 'achievement') {
    const got = ACHIEVEMENTS.filter(a => S.ach[a.id]);
    return `<label class="field"><span>Conquista</span><select class="input" data-cmp="achId" id="cmpAch"><option value="">Escolhe uma conquista desbloqueada…</option>${got.map(a => `<option value="${a.id}" ${c.achId === a.id ? 'selected' : ''}>${a.icon} ${esc(a.name)}</option>`).join('')}</select></label>`;
  }
  if (c.type === 'photo') return c.img ? `<div class="photo-prev"><img src="${c.img}" alt="Pré-visualização da fotografia"><button class="icon-btn" data-act="cmp-img-del" aria-label="Remover fotografia">${icon('close')}</button></div>`
    : `<label class="btn upload">${icon('image')} Escolher fotografia<input type="file" accept="image/*" data-file="cmp-photo" id="cmpPhoto"></label>`;
  if (c.type === 'clip') {
    const mine = S.clips.filter(x => x.streamer === 'me');
    return `<label class="field"><span>Clip</span><select class="input" data-cmp="clipId" id="cmpClip"><option value="">Escolhe um dos teus clips…</option>${mine.map(x => `<option value="${x.id}" ${c.clipId === x.id ? 'selected' : ''}>${x.emoji} ${esc(x.title)}</option>`).join('')}</select></label>`;
  }
  return '';
}
function refreshComposer() { const el = $('#composer'); if (!el) return; el.outerHTML = composerHTML(); }

/* ---------- Cartão de publicação ---------- */
const KIND = { game: '🎮 Anúncio de jogo', live: '🔴 Anúncio de live', event: '📅 Evento', poll: '📊 Sondagem', achievement: '🏆 Conquista', photo: '🖼️ Foto', clip: '🎬 Clip' };
function postCard(p) {
  const a = acc(p.author), mine = p.author === 'me', pinned = S.pinned === p.id;
  const text = postText(p);
  let extra = '';
  if (p.type === 'event' || (p.type === 'live' && p.eventId)) { const ev = S.events.find(e => e.id === p.eventId); if (ev) extra = eventCard(ev); }
  if (p.type === 'game' || (p.type === 'live' && !p.eventId)) {
    const G = GAMES[p.game] || GAMES.chat; const isLive = p.type === 'live' && S.live && S.live.id === p.liveId;
    extra = `<div class="game-strip" style="--gc:${G.color}">${gicon(p.game, 44)}<div><span class="small muted">${p.type === 'live' ? (isLive ? 'Em direto agora' : 'Live anunciada') : 'A jogar'}</span><strong>${esc(G.name)}</strong></div>${isLive ? `<a class="btn btn-live btn-sm" href="#estudio" style="margin-left:auto">${icon('studio')} Estúdio</a>` : p.type === 'live' ? '<span class="pill-state" style="margin-left:auto">LIVE</span>' : ''}</div>`;
  }
  if (p.type === 'poll' && p.poll) {
    const total = p.poll.options.reduce((s, o) => s + o.v, 0) || 1; const done = p.poll.myVote != null || Date.now() > p.poll.ends;
    extra = `<div class="poll">${p.poll.options.map((o, i) => done
      ? `<div class="poll-opt ${p.poll.myVote === i ? 'mine' : ''}"><i style="width:${(o.v / total * 100).toFixed(1)}%"></i><span>${esc(o.t)}${p.poll.myVote === i ? ' ✓' : ''}</span><b class="num">${Math.round(o.v / total * 100)}%</b></div>`
      : `<button class="poll-opt" data-act="vote" data-id="${p.id}" data-i="${i}"><span>${esc(o.t)}</span></button>`).join('')}
      <span class="tiny muted">${dots(total)} votos ${SIM('fictícios')} · ${Date.now() > p.poll.ends ? 'Sondagem terminada' : 'Termina em ' + cdShort(p.poll.ends - Date.now())}</span></div>`;
  }
  if (p.type === 'achievement') { const x = ACHIEVEMENTS.find(z => z.id === p.achId); if (x) extra = `<div class="ach-banner"><span class="ach-ico">${x.icon}</span><div><span class="tiny muted">CONQUISTA DESBLOQUEADA</span><strong>${esc(x.name)}</strong><span class="small muted">${esc(x.desc)}</span></div></div>`; }
  if (p.type === 'photo' && p.img) extra = `<div class="post-media"><img src="${p.img}" alt="Fotografia publicada" loading="lazy"></div>`;
  if (p.type === 'clip') { const c = S.clips.find(z => z.id === p.clipId); if (c) extra = clipMini(c); }
  if (p.recap) extra += `<div class="recap"><div><b>${fmt(p.recap.peak)}</b><small>pico de espectadores</small></div><div><b>${fmt(p.recap.followers)}</b><small>novos seguidores</small></div><div><b>${fmt(p.recap.gifts)}</b><small>moedas virtuais</small></div><div><b>${durLabel(p.recap.dur)}</b><small>duração</small></div></div><span class="tiny muted">Resumo de live simulada ${SIM()}</span>`;
  const open = UI.openReplies.has(p.id);
  return `<article class="card post ${pinned ? 'pinned' : ''}" data-post="${p.id}">
    ${avatar(a, 46)}
    <div class="post-body">
      ${pinned ? `<div class="post-meta-top">${icon('pin')} Publicação fixada</div>` : p.reposted ? `<div class="post-meta-top">${icon('repost')} Repostaste</div>` : ''}
      <div class="post-head"><a href="#${mine ? 'perfil' : 'conta-' + a.id}">${nameLine(a)}</a><span class="muted">@${esc(a.handle)} · <time data-ago="${p.createdAt}" title="${new Date(p.createdAt).toLocaleString('pt-PT')}">${ago(p.createdAt)}</time></span>${KIND[p.type] ? `<span class="post-kind">${KIND[p.type]}</span>` : ''}
        <div class="menu-wrap"><button class="icon-btn" data-act="menu" data-id="${p.id}" aria-label="Mais opções">${icon('more')}</button>${UI.menu === p.id ? postMenu(p) : ''}</div></div>
      ${text ? `<p class="post-text">${richText(text)}</p>` : ''}
      ${extra}
      <div class="post-actions">
        <button class="pa" data-act="reply-toggle" data-id="${p.id}" aria-label="Responder">${icon('reply')}<span>${fmt(p.replies.length + (p.replyBase || 0))}</span></button>
        <button class="pa rp ${p.reposted ? 'on' : ''}" data-act="repost" data-id="${p.id}" aria-label="Repostar">${icon('repost')}<span>${fmt(p.reposts)}</span></button>
        <button class="pa like ${p.liked ? 'on' : ''}" data-act="like" data-id="${p.id}" aria-label="Gostar">${icon('heart')}<span>${fmt(p.likes)}</span></button>
        <button class="pa save ${p.saved ? 'on' : ''}" data-act="save" data-id="${p.id}" aria-label="Guardar">${icon('save')}</button>
        ${mine ? `<button class="pa pin ${pinned ? 'on' : ''}" data-act="pin" data-id="${p.id}" aria-label="${pinned ? 'Desafixar' : 'Fixar no perfil'}">${icon('pin')}</button>` : ''}
        <span class="pa views" title="Visualizações simuladas">${icon('eye')}<span data-views="${p.id}">${fmt(p.views)}</span></span>
      </div>
      ${open ? `<div class="replies">${p.replies.map(r => { const ra = acc(r.author); return `<div class="reply">${avatar(ra, 30)}<div><strong>${esc(ra.name)}</strong> <time class="muted tiny" data-ago="${r.t}">${ago(r.t)}</time><br>${richText(r.text)}</div></div>`; }).join('')}
        <form class="reply-form" data-form="reply" data-id="${p.id}"><input class="input" id="reply-${p.id}" name="t" maxlength="280" placeholder="Escreve uma resposta…" autocomplete="off"><button class="btn btn-sm btn-primary">Responder</button></form></div>` : ''}
    </div></article>`;
}
function postMenu(p) {
  const mine = p.author === 'me';
  return `<div class="menu">
    ${mine ? `<button data-act="pin" data-id="${p.id}">${icon('pin')} ${S.pinned === p.id ? 'Desafixar do perfil' : 'Fixar no perfil'}</button>` : `<button data-act="follow" data-id="${p.author}">${icon('users')} ${acc(p.author).followed ? 'Deixar de seguir' : 'Seguir'} @${esc(acc(p.author).handle)}</button>`}
    <button data-act="share-dm" data-type="post" data-id="${p.id}">${icon('send')} Enviar por mensagem</button>
    <button data-act="copy-post" data-id="${p.id}">${icon('share')} Copiar texto</button>
    ${p.eventId ? `<button data-act="event-open" data-id="${p.eventId}">${icon('calendar')} Ver evento</button>` : ''}
    ${mine ? `<button class="danger" data-act="post-del" data-id="${p.id}">${icon('trash')} Eliminar publicação</button>` : ''}
  </div>`;
}

/* ---------- Cartão de evento (premium) ---------- */
function eventCard(ev, opts = {}) {
  const st = eventStatus(ev), a = acc(ev.owner), G = GAMES[ev.game] || GAMES.chat, M = MODES[ev.mode] || MODES.casual, L = LEVELS[ev.level] || LEVELS.media;
  const mine = ev.owner === 'me', now = Date.now();
  const whenTxt = st === 'live' ? '<span class="pill-live">EM DIRETO</span>' : st === 'soon' ? '<span class="pill-soon">A COMEÇAR EM BREVE</span>' : st === 'cancelled' ? '<span class="pill-state">CANCELADO</span>' : st === 'ended' ? '<span class="pill-state">TERMINADO</span>'
    : `<span class="ev-when">🎮 LIVE ${dayLabel(ev.start).toUpperCase()} — ${hhmm(ev.start)}</span>`;
  let mid;
  if (st === 'scheduled' && ev.countdown) {
    const { d, h, m, s } = cdParts(ev.start - now);
    mid = `<div class="cd" data-cd="${ev.start}" aria-label="Contagem decrescente"><div><b data-p="d">${pad(d)}</b><small>dias</small></div><div><b data-p="h">${pad(h)}</b><small>horas</small></div><div><b data-p="m">${pad(m)}</b><small>min</small></div><div><b data-p="s">${pad(s)}</b><small>seg</small></div></div>`;
  } else if (st === 'scheduled') mid = `<div class="cd-state off">${whenLabel(ev.start).toUpperCase()}</div>`;
  else if (st === 'soon') mid = `<div class="cd-state soon">A COMEÇAR EM BREVE</div>`;
  else if (st === 'live') mid = `<div class="cd-state live">EM DIRETO · <span data-watchers="${ev.id}">${fmt(mine ? S.live.viewers : (ev.viewers || 1000))}</span> espectadores virtuais</div>`;
  else if (st === 'cancelled') mid = `<div class="cd-state off">EVENTO CANCELADO</div>`;
  else mid = `<div class="cd-state off">TERMINADO${ev.peak ? ' · PICO DE ' + fmt(ev.peak) : ''}</div>`;
  const faces = S.accounts.slice(0, 4).map(x => avatar(x, 24).replace('<a ', '<span ').replace('</a>', '</span>')).join('');
  let actions = '';
  if (st === 'scheduled' || st === 'soon') actions += `<button class="btn ${ev.myReminder ? '' : 'btn-primary'}" data-act="remind" data-id="${ev.id}">${icon(ev.myReminder ? 'check' : 'bell')} ${ev.myReminder ? 'LEMBRETE ATIVO' : 'LEMBRAR-ME'}</button>`;
  if (!opts.inModal) actions += `<button class="btn" data-act="event-open" data-id="${ev.id}">${icon('eye')} VER EVENTO</button>`;
  if (mine && st === 'soon') actions += `<button class="btn btn-live" data-act="start-event" data-id="${ev.id}">${icon('studio')} COMEÇAR LIVE</button>`;
  if (mine && st === 'live') actions += `<a class="btn btn-live" href="#estudio">${icon('studio')} IR PARA O ESTÚDIO</a>`;
  if (!mine && st === 'live') actions += `<button class="btn btn-live" data-act="watch" data-id="${ev.id}">${icon('play')} ASSISTIR</button>`;
  return `<div class="ev-card ${opts.standalone ? 'standalone' : ''} ${st === 'cancelled' ? 'ev-cancelled' : ''}">
    <div class="ev-cover" style="--cover:${esc(coverCSS(ev.cover))}"><div class="grid-lines"></div>
      <div class="ev-top">${whenTxt}<span class="ev-mode">MODO ${esc(M.name.toUpperCase())}</span></div>
      <div><div class="ev-title">${esc(ev.title)} ${st === 'scheduled' || st === 'soon' ? '🔥' : ''}</div>
        <div class="ev-sub">${gicon(ev.game, 26)}<span>${esc(G.name)}</span><span>·</span><span>${mine ? 'O teu evento' : '@' + esc(a.handle)}</span></div></div>
    </div>
    <div class="ev-info">
      ${mid}
      <div class="ev-stats">
        <div><small>Meta de audiência</small><b>Até ${fmt(L.max)}</b><small>espectadores virtuais</small></div>
        <div><small>Interessados ${SIM()}</small><b data-int="${ev.id}">${dots(ev.interested)}</b><small>pessoas fictícias</small></div>
        <div><small>Lembretes ${SIM('sim.')}</small><b data-rem="${ev.id}">${dots(ev.reminderUsers || 0)}</b><small>${ev.reminders ? 'ativos' : 'desligados'}</small></div>
      </div>
      <div class="ev-faces"><span class="faces">${faces}</span><span><b data-int="${ev.id}">${dots(ev.interested)}</b> pessoas fictícias interessadas${ev.myInterest ? ', incluindo tu' : ''}</span></div>
      ${actions ? `<div class="ev-actions">${actions}</div>` : ''}
    </div></div>`;
}

/* ---------- Clips ---------- */
function clipCard(c) {
  const s = acc(c.streamer), G = GAMES[c.game] || GAMES.chat, open = UI.openComments.has(c.id);
  return `<article class="card clip">
    <div class="clip-thumb" style="--gc:${G.color}">${c.media ? (c.media.kind === 'video' ? `<video src="${c.media.url}" muted loop playsinline autoplay></video>` : `<img src="${c.media.url}" alt="">`) : `<span class="emo">${c.emoji || '🎬'}</span>`}
      <span class="sim-tag">${c.media ? 'Media tua' : 'Clip simulado'}</span>${gicon(c.game, 26)}<span class="dur">0:${pad(c.secs || 30)}</span><span class="play">${icon('play')}</span></div>
    <div class="clip-body">
      <strong>${esc(c.title)}</strong>
      <span class="small muted">${esc(s.name)} · ${esc(G.name)} · ${esc(c.type)}</span>
      <div class="clip-pop"><span>Popularidade ${SIM('sim.')}</span><div class="goal-bar"><i style="width:${c.popularity}%"></i></div><b class="num">${c.popularity}</b></div>
      <div class="clip-actions">
        <button class="pa like ${c.liked ? 'on' : ''}" data-act="clip-like" data-id="${c.id}">${icon('heart')}<span>${fmt(c.likes)}</span></button>
        <button class="pa" data-act="clip-comments" data-id="${c.id}">${icon('reply')}<span>${fmt(c.comments)}</span></button>
        <button class="pa" data-act="clip-share" data-id="${c.id}" title="Partilhar no feed">${icon('share')}<span>Partilhar</span></button>
        <button class="pa" data-act="share-dm" data-type="clip" data-id="${c.id}" title="Enviar por mensagem" aria-label="Enviar por mensagem">${icon('send')}</button>
        ${c.streamer === 'me' ? `<button class="pa ${c.onProfile ? 'pin on' : ''}" data-act="clip-profile" data-id="${c.id}" title="${c.onProfile ? 'Remover do perfil' : 'Adicionar ao perfil'}">${icon(c.onProfile ? 'check' : 'plus')}<span>${c.onProfile ? 'No perfil' : 'Perfil'}</span></button>` : ''}
      </div>
      ${open ? `<div class="clip-comments">${clipCommentList(c).map(m => `<div><b>${esc(m.u)}</b> ${esc(m.t)}</div>`).join('')}
        <form class="reply-form" data-form="clip-comment" data-id="${c.id}"><input class="input" id="cc-${c.id}" name="t" maxlength="200" placeholder="Comentar…" autocomplete="off"><button class="btn btn-sm">Enviar</button></form>
        ${c.streamer === 'me' ? `<div class="row"><label class="btn btn-xs upload">${icon('image')} Anexar a minha media<input type="file" accept="video/*,image/*" data-file="clip-media" data-id="${c.id}" id="cm-${c.id}"></label>${c.streamer === 'me' ? `<button class="btn btn-xs btn-danger" data-act="clip-del" data-id="${c.id}">${icon('trash')} Eliminar</button>` : ''}</div><span class="tiny muted">Vídeos anexados ficam só nesta sessão do navegador.</span>` : ''}</div>` : ''}
    </div></article>`;
}
function clipCommentList(c) {
  const seedTxt = ['MOMENTO LENDÁRIO', 'vi isto em direto 😭', 'replay infinito', 'isto merece 1M de views', 'o chat foi à loucura', 'top clip'];
  const base = seedTxt.slice(0, 3).map((t, i) => ({ u: NAME_A[(c.id.charCodeAt(1) + i) % NAME_A.length] + NAME_B[i], t }));
  return [...base, ...(c.commentsList || [])];
}
function clipMini(c) {
  const G = GAMES[c.game] || GAMES.chat;
  return `<div class="clip-mini"><div class="clip-thumb" style="--gc:${G.color}"><span class="emo">${c.emoji || '🎬'}</span><span class="dur">0:${pad(c.secs || 30)}</span></div>
    <div><span class="tiny muted">CLIP SIMULADO · ${esc(G.name.toUpperCase())}</span><strong style="display:block;font-family:var(--f-display)">${esc(c.title)}</strong><span class="small muted">${esc(c.type)} · ${fmt(c.likes)} gostos · popularidade ${c.popularity}</span></div></div>`;
}
function viewClips() {
  let list = [...S.clips].sort((a, b) => b.createdAt - a.createdAt);
  if (UI.clipTab === 'mine') list = list.filter(c => c.streamer === 'me');
  if (UI.clipTab === 'community') list = list.filter(c => c.streamer !== 'me');
  return `<div class="page-head"><div><h1>Clips</h1><p>Clips simulados criados a partir de momentos das lives. Não são gravações reais, a não ser que anexes a tua própria media.</p></div></div>
  <div class="tabs">${[['all', 'Todos'], ['mine', 'Os meus'], ['community', 'Comunidade']].map(([k, l]) => `<button class="tab ${UI.clipTab === k ? 'on' : ''}" data-act="clip-tab" data-k="${k}">${l}</button>`).join('')}</div>
  ${list.length ? `<div class="clip-grid">${list.map(clipCard).join('')}</div>` : `<div class="empty"><b>Ainda sem clips</b>Durante uma live, carrega em «Criar clip» na cronologia.</div>`}`;
}

/* ---------- Perfil ---------- */
function viewProfile(id) {
  const a = acc(id), me = id === 'me';
  if (!me && !S.accounts.find(x => x.id === id)) return `<div class="empty"><b>Conta não encontrada</b><a href="#feed">Voltar ao início</a></div>`;
  const car = me ? career() : career(Math.round(a.followers / 30));
  const myEvents = S.events.filter(e => e.owner === id);
  const next = myEvents.filter(e => ['scheduled', 'soon', 'live'].includes(eventStatus(e))).sort((x, y) => x.start - y.start)[0];
  const tabs = [['posts', 'Publicações'], ['about', 'Sobre'], ['lives', 'Lives'], ['events', 'Eventos'], ['clips', 'Clips'], ['ach', 'Conquistas']];
  const followers = me ? S.me.followers : a.followers;
  const following = me ? followingCount() : 120 + (a.hue % 300);
  const lives = me ? totalLives() : 40 + Math.round(a.followers / 2000);
  const views = me ? totalViews() : a.followers * 14;
  return `
  <section class="card prof">
    <div class="banner" style="--cover:${esc(me && S.me.banner ? `url("${S.me.banner}") center/cover` : COVERS[(me ? S.me.cover : a.hue) % COVERS.length])}"><div class="grid-lines"></div></div>
    <div class="prof-inner">
      <div class="prof-top">${avatar(a, 120).replace('class="av ', 'class="av ' + (me && S.live ? 'ring-live ' : ''))}<span class="spacer"></span>
        ${me ? `<button class="btn" data-act="edit-profile">${icon('edit')} Editar perfil</button><button class="btn btn-primary" data-act="new-event">${icon('calendar')} Agendar live</button>`
          : `<a class="btn" href="#conversa-${a.id}">${icon('chat')} Mensagem</a><button class="btn ${a.followed ? '' : 'btn-primary'}" data-act="follow" data-id="${a.id}">${a.followed ? icon('check') + ' A seguir' : icon('plus') + ' Seguir'}</button>`}
      </div>
      <div class="prof-name"><h1>${esc(a.name)}</h1>${a.verified ? VERIFIED + SIM('selo fictício') : ''}${me && S.live ? '<span class="pill-live">EM DIRETO</span>' : ''}</div>
      <div class="prof-handle">@${esc(a.handle)}</div>
      <p class="prof-bio">${richText(a.bio || '')}</p>
      <div class="prof-tags"><span class="chip on">${esc(me ? S.me.category : a.cat)}</span>${(a.games || []).map(g => `<span class="chip">${gicon(g, 20)} ${esc(GAMES[g]?.name || g)}</span>`).join('')}</div>
      <div class="lvl"><span class="lvl-num">${car.level}</span><div><strong>Nível de carreira ${car.level} · ${esc(car.name)}</strong><div class="goal-bar" style="margin-top:6px"><i style="width:${car.pct.toFixed(1)}%"></i></div><span class="tiny muted">${me ? `${dots(car.xp)} XP${car.next ? ' · faltam ' + dots(car.next - car.xp) + ' XP para o próximo nível' : ' · nível máximo'}` : 'Nível estimado pela simulação'}</span></div></div>
      <div class="stats">
        <div class="stat"><b data-me="followers">${fmt(followers)}</b><small>Seguidores ${SIM()}</small></div>
        <div class="stat"><b>${fmt(following)}</b><small>A seguir</small></div>
        <div class="stat"><b>${fmt(lives)}</b><small>Lives simuladas</small></div>
        <div class="stat"><b>${fmt(views)}</b><small>Visualizações ${SIM()}</small></div>
      </div>
    </div>
  </section>
  ${next ? `<div style="margin-bottom:16px">${eventCard(next, { standalone: true })}</div>` : ''}
  <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${UI.profTab === k ? 'on' : ''}" data-act="prof-tab" data-k="${k}">${l}</button>`).join('')}</div>
  ${profileTab(id)}`;
}
function profileTab(id) {
  const me = id === 'me', a = acc(id);
  const t = UI.profTab;
  if (t === 'posts') {
    const all = visiblePosts();
    let list;
    const sub = me ? UI.profSub : 'posts';
    if (sub === 'posts') list = all.filter(p => p.author === id);
    else if (sub === 'reposts') list = all.filter(p => p.reposted);
    else if (sub === 'likes') list = all.filter(p => p.liked);
    else list = all.filter(p => p.saved);
    if (sub === 'posts' && me && S.pinned) { const pin = list.find(p => p.id === S.pinned); if (pin) list = [pin, ...list.filter(p => p !== pin)]; }
    return `${me ? `<div class="subtabs">${[['posts', 'Publicações'], ['reposts', 'Reposts'], ['likes', 'Gostos'], ['saved', 'Guardados']].map(([k, l]) => `<button class="chip ${UI.profSub === k ? 'on' : ''}" data-act="prof-sub" data-k="${k}">${l}</button>`).join('')}</div>` : ''}
      <div class="feed">${list.length ? list.map(postCard).join('') : `<div class="empty"><b>Sem publicações aqui</b>${sub === 'posts' ? 'As publicações aparecem neste separador.' : 'Interage com publicações no feed.'}</div>`}</div>`;
  }
  if (t === 'about') {
    const agenda = me ? S.me.agenda : (a.games || []).slice(0, 2).map((g, i) => ({ day: (a.hue + i * 3) % 7, time: i ? '16:00' : '21:00', game: g }));
    const evs = S.events.filter(e => e.owner === id && ['scheduled', 'soon'].includes(eventStatus(e))).sort((x, y) => x.start - y.start);
    return `<div class="about-grid">
      <section class="card panel"><h3 class="panel-title">Sobre</h3>
        <div class="kv"><span>Categoria</span><b>${esc(me ? S.me.category : a.cat)}</b></div>
        <div class="kv"><span>Jogos favoritos</span><b>${(a.games || []).map(g => esc(GAMES[g]?.name)).join(', ') || '—'}</b></div>
        <div class="kv"><span>Verificação</span><b>${a.verified ? 'Selo fictício ativo' : 'Sem selo'}</b></div>
        <div class="kv"><span>Nível de carreira</span><b>${me ? career().level + ' · ' + career().name : '—'}</b></div>
        <div class="kv"><span>Lives simuladas</span><b>${me ? totalLives() : '—'}</b></div>
        ${me ? `<div class="kv"><span>Conquistas</span><b>${Object.keys(S.ach).length} de ${ACHIEVEMENTS.length}</b></div>` : ''}
      </section>
      <section class="card panel"><h3 class="panel-title">${icon('calendar', 'style="width:18px"')} Agenda de lives${me ? `<small><button class="btn btn-xs" data-act="edit-profile">Editar</button></small>` : ''}</h3>
        <div class="agenda">${agenda.length ? [...agenda].sort((x, y) => x.day - y.day).map(g => `<div class="agenda-row"><b>${DAYS[g.day]}</b><span class="num">${esc(g.time)}</span>${gicon(g.game, 22)}<span>${esc(GAMES[g.game]?.name || '')}</span></div>`).join('') : '<p class="muted small">Sem horário fixo.</p>'}</div>
      </section>
      <section class="card panel" style="grid-column:1/-1"><h3 class="panel-title">Próximos eventos</h3>
        <div class="day-list" style="margin:0">${evs.length ? evs.map(evRow).join('') : '<p class="muted small" style="margin:0">Sem eventos agendados.</p>'}</div>
      </section></div>`;
  }
  if (t === 'lives') {
    if (!me) return `<div class="empty"><b>${fmt(40 + Math.round(a.followers / 2000))} lives simuladas</b>${esc(a.name)} faz lives regularmente. ${S.events.some(e => e.owner === id && eventStatus(e) === 'live') ? 'Está em direto agora!' : ''}</div>`;
    return `${S.live ? `<div class="soon-banner" style="border-color:var(--live)"><span class="pill-live">EM DIRETO</span><div><strong>${esc(S.live.title)}</strong><span class="small muted">${fmt(S.live.viewers)} espectadores virtuais</span></div><a class="btn btn-live" href="#estudio">Abrir estúdio</a></div>` : ''}
      <div class="stack">${S.lives.length ? [...S.lives].sort((x, y) => y.start - x.start).map(pastLive).join('') : '<div class="empty"><b>Ainda sem lives</b>Vai ao estúdio e entra em direto.</div>'}</div>`;
  }
  if (t === 'events') {
    const evs = S.events.filter(e => e.owner === id).sort((x, y) => y.start - x.start);
    return evs.length ? `<div class="ev-grid">${evs.map(e => eventCard(e, { standalone: true })).join('')}</div>` : `<div class="empty"><b>Sem eventos</b>${me ? '<button class="btn btn-sm btn-primary" data-act="new-event" style="margin-top:8px">Agendar o primeiro</button>' : ''}</div>`;
  }
  if (t === 'clips') {
    const list = S.clips.filter(c => c.streamer === id && c.onProfile);
    return list.length ? `<div class="clip-grid">${list.map(clipCard).join('')}</div>` : `<div class="empty"><b>Sem clips no perfil</b>${me ? 'Adiciona clips ao perfil na página de clips.' : ''}</div>`;
  }
  // conquistas
  const got = me ? S.ach : Object.fromEntries(ACHIEVEMENTS.filter((x, i) => (a.hue + i * 7) % 3 !== 0).map(x => [x.id, 1]));
  return `<div class="ach-grid">${ACHIEVEMENTS.map(x => `<div class="ach ${got[x.id] ? 'got' : 'locked'}"><span class="ach-ico">${x.icon}</span><strong>${esc(x.name)}</strong><span class="small muted">${esc(x.desc)}</span>
    ${got[x.id] ? `<span class="tiny" style="color:var(--warn)">Desbloqueada${me ? ' · ' + ago(got[x.id]) : ''}</span>${me ? `<button class="btn btn-xs" data-act="announce-ach" data-id="${x.id}">Anunciar no feed</button>` : ''}` : '<span class="tiny muted">Bloqueada</span>'}</div>`).join('')}</div>`;
}
function pastLive(l) {
  return `<div class="past-live">${gicon(l.game, 48)}<div><strong>${esc(l.title)}</strong><span class="small muted">${whenLabel(l.start)} · ${durLabel(l.end - l.start)} · Modo ${esc(MODES[l.mode]?.name || '')}</span><div class="row small" style="gap:14px;margin-top:4px"><span>👀 Pico <b class="num">${fmt(l.peak)}</b></span><span>💜 +<b class="num">${fmt(l.followers)}</b></span><span>💎 <b class="num">${fmt(l.gifts)}</b></span><span>⚡ ${l.reactions || 0} reações</span></div></div>${SIM()}</div>`;
}
function evRow(e) {
  const st = eventStatus(e);
  return `<button class="ev-row" data-act="event-open" data-id="${e.id}">${gicon(e.game, 38)}<div><strong>${esc(e.title)}</strong><span class="small muted">${e.owner === 'me' ? 'O teu evento' : '@' + esc(acc(e.owner).handle)} · ${esc(MODES[e.mode]?.name || '')} · ${STATUS_LABEL[st]}</span></div><time>${hhmm(e.start)}</time></button>`;
}

/* ---------- Página de eventos ---------- */
function viewEvents() {
  const now = Date.now();
  const all = S.events;
  const by = {
    upcoming: all.filter(e => ['scheduled', 'soon'].includes(eventStatus(e))).sort((a, b) => a.start - b.start),
    live: all.filter(e => eventStatus(e) === 'live'),
    past: all.filter(e => ['ended', 'cancelled'].includes(eventStatus(e))).sort((a, b) => b.start - a.start),
    mine: all.filter(e => e.owner === 'me').sort((a, b) => b.start - a.start),
    rec: all.filter(e => e.owner !== 'me' && ['scheduled', 'soon', 'live'].includes(eventStatus(e))).sort((a, b) => (S.me.games.includes(b.game) - S.me.games.includes(a.game)) || b.interested - a.interested),
  };
  const tabs = [['upcoming', 'Próximos'], ['live', 'Em direto'], ['past', 'Anteriores'], ['mine', 'Os meus'], ['rec', 'Recomendados']];
  const list = by[UI.evTab] || [];
  const soon = all.filter(e => e.owner === 'me' && eventStatus(e) === 'soon' && !S.live);
  return `${soonBanner(soon)}
  <div class="page-head"><div><h1>Eventos</h1><p>Agenda lives, acompanha contagens decrescentes e vê quem está interessado (pessoas fictícias).</p></div><span class="spacer"></span><button class="btn btn-primary" data-act="new-event">${icon('plus')} Criar evento</button></div>
  ${calendarHTML(now)}
  <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${UI.evTab === k ? 'on' : ''}" data-act="ev-tab" data-k="${k}">${l}<span class="num">${by[k].length}</span></button>`).join('')}</div>
  ${list.length ? `<div class="ev-grid">${list.map(e => `<div class="stack" style="gap:8px">${eventCard(e, { standalone: true })}${e.owner === 'me' && !['ended'].includes(eventStatus(e)) ? `<div class="row"><button class="btn btn-sm" data-act="event-edit" data-id="${e.id}">${icon('edit')} Editar</button><button class="btn btn-sm btn-danger" data-act="event-open" data-id="${e.id}" data-confirm="delete">${icon('trash')} Eliminar</button></div>` : e.owner === 'me' ? `<div class="row"><button class="btn btn-sm btn-danger" data-act="event-open" data-id="${e.id}" data-confirm="delete">${icon('trash')} Eliminar</button></div>` : ''}</div>`).join('')}</div>`
    : `<div class="empty"><b>Sem eventos nesta lista</b>${UI.evTab === 'mine' || UI.evTab === 'upcoming' ? '<button class="btn btn-sm btn-primary" data-act="new-event" style="margin-top:8px">Agendar uma live</button>' : ''}</div>`}`;
}
function calendarHTML(now) {
  const m = new Date(UI.calMonth); const year = m.getFullYear(), month = m.getMonth();
  const first = new Date(year, month, 1); const startDow = (first.getDay() + 6) % 7; // segunda primeiro
  const days = [];
  for (let i = 0; i < 42; i++) days.push(new Date(year, month, 1 - startDow + i));
  const dow = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  const sel = UI.calSel;
  const dayEvents = d => S.events.filter(e => sameDay(e.start, d) && !e.cancelled);
  const selList = sel ? S.events.filter(e => sameDay(e.start, sel)).sort((a, b) => a.start - b.start) : [];
  return `<section class="card cal"><div class="cal-head"><button class="icon-btn" data-act="cal-nav" data-d="-1" aria-label="Mês anterior">${icon('chevL')}</button><h3>${MONTHS[month]} ${year}</h3><button class="btn btn-sm btn-ghost" data-act="cal-today">Hoje</button><button class="icon-btn" data-act="cal-nav" data-d="1" aria-label="Mês seguinte">${icon('chevR')}</button></div>
    <div class="cal-grid">${dow.map(d => `<div class="cal-dow">${d}</div>`).join('')}
    ${days.map(d => { const evs = dayEvents(d); return `<button class="cal-day ${d.getMonth() !== month ? 'out' : ''} ${sameDay(d, now) ? 'today' : ''} ${sel && sameDay(d, sel) ? 'sel' : ''}" data-act="cal-sel" data-t="${d.getTime()}" aria-label="${d.getDate()} de ${MONTHS[d.getMonth()]}, ${evs.length} eventos"><span>${d.getDate()}</span><span class="dots">${evs.slice(0, 3).map(e => `<i class="${eventStatus(e) === 'live' ? 'live' : e.owner === 'me' ? 'mine' : ''}"></i>`).join('')}</span></button>`; }).join('')}</div>
    <div class="cal-legend"><span><i style="background:var(--pink)"></i>Os meus eventos</span><span><i style="background:var(--blue)"></i>Comunidade</span><span><i style="background:var(--live)"></i>Em direto</span></div>
    ${sel ? `<div class="day-list"><div class="row"><strong>${dayLabel(sel)}</strong><span class="spacer"></span>${new Date(sel).setHours(23, 59) > now ? `<button class="btn btn-sm" data-act="new-event" data-date="${sel}">${icon('plus')} Agendar neste dia</button>` : ''}</div>${selList.length ? selList.map(evRow).join('') : '<p class="muted small" style="margin:0">Sem eventos neste dia.</p>'}</div>` : ''}
  </section>`;
}

/* ---------- Notificações ---------- */
function viewNotifs() {
  return `<div class="page-head"><div><h1>Notificações</h1><p>Notificações simuladas e geridas pela própria app.</p></div><span class="spacer"></span><button class="btn btn-sm" data-act="notif-read">${icon('check')} Marcar tudo como lido</button><button class="btn btn-sm btn-ghost" data-act="notif-clear">Limpar</button></div>
  <div class="stack" style="gap:8px">${S.notifs.length ? S.notifs.map(n => `<button class="notif ${n.read ? '' : 'unread'}" data-act="notif-open" data-id="${n.id}"><span class="ico">${n.icon}</span><div>${esc(n.text)}<time data-ago="${n.t}">${ago(n.t)}</time></div></button>`).join('') : '<div class="empty"><b>Tudo em dia</b>As notificações dos teus eventos e lives aparecem aqui.</div>'}</div>`;
}
