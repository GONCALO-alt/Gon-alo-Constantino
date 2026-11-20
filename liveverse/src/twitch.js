/* =====================================================================
   Estilo de plataforma de streaming: página inicial com lives, página
   de canal para ver as lives das outras contas, chat com top de
   presentes, recompensa, boas-vindas, bot e "Mais mensagens abaixo".
   Canais, espetadores, subscrições e presentes são fictícios.
   ===================================================================== */
Object.assign(IC, {
  gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12.5h18M12 8S10.5 3 7.8 3a2.5 2.5 0 0 0 0 5M12 8s1.5-5 4.2-5a2.5 2.5 0 0 1 0 5"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14.5s1.5 2 4 2 4-2 4-2"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="3"/>',
  person: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.3-3.6 4-5.4 7-5.4s5.7 1.8 7 5.4"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
  heartFill: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z" fill="currentColor"/>',
  bellPlus: '<path d="M6 16V11a6 6 0 0 1 9-5.2M18 11v5l2 2H4"/><path d="M10 21h4M19 3v5M16.5 5.5h5"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
});

/* ---------- Canais em direto (eventos + emissões simuladas que mudam a cada 2 h) ---------- */
const STREAM_TITLES = {
  fortnite: ['🏆 RANKED ATÉ UNREAL HOJE', 'Torneio de duos com subs 🔥', 'Criativo com o chat'],
  gta6: ['🌴 GTA 6 PELA PRIMEIRA VEZ 🌴', 'GTA VI: a missão final 💰', 'Explorar Vice City toda 🚗'],
  minecraft: ['Hardcore dia 100 ⛏️', 'Construir a cidade dos subs', 'Speedrun até ao dragão 🐉'],
  valorant: ['Radiante hoje? 🎯', 'Ranked com a equipa', 'Aim training + ranked'],
  eafc: ['FUT Champions 20-0?', 'Abertura de packs 🎁', 'Modo carreira ⚽'],
  phasmo: ['Terror às escuras 👻', 'Pesadelo sem lanterna'],
  roblox: ['Mini-jogos com subs!', 'Obby impossível 😭'],
  lol: ['Solo queue até diamante', 'Só mid hoje'],
  rocket: ['1v1 contra o chat 🚗', 'Ranked 2v2'],
  gta: ['RP na cidade 🚓', 'Assaltos com a crew'],
  amnesia: ['Terror a sério 😱'],
  chat: ['Só conversa ☕ Q&A', 'Reagir a clips da semana'],
};
const STREAM_TAGS = { fortnite: ['Competitivo', 'BattleRoyale'], gta6: ['RP', 'MundoAberto'], minecraft: ['Construção', 'Família'], valorant: ['FPS', 'Competitivo'], eafc: ['Futebol', 'FUT'], phasmo: ['Terror', 'Coop'], roblox: ['Família', 'MiniJogos'], lol: ['MOBA', 'Ranked'], rocket: ['Carros', 'Competitivo'], gta: ['RP'], amnesia: ['Terror'], chat: ['Conversa', 'QA'] };
const hashStr = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const SYN = {};
function channelLive(a) {
  if (!a) return null;
  const ev = S.events.find(e => e.owner === a.id && eventStatus(e) === 'live'); if (ev) return ev;
  const slot = Math.floor(Date.now() / (2 * HOUR)), key = a.id + ':' + slot, h = hashStr(key);
  if (h % 10 >= 5) return null;
  if (!SYN[key]) {
    const games = a.games && a.games.length ? a.games : ['chat'];
    const game = games[h % games.length], titles = STREAM_TITLES[game] || STREAM_TITLES.chat;
    SYN[key] = { id: 'syn_' + a.id, owner: a.id, synthetic: true, title: titles[h % titles.length], game, mode: 'casual', level: 'grande', desc: '',
      start: slot * 2 * HOUR - ((h % 150) + 12) * MIN, dur: 9 * HOUR, viewers: Math.max(40, Math.round(a.followers * (0.04 + (h % 17) / 100))),
      interested: 0, reminderUsers: 0, cover: { type: 'preset', v: h % 6 }, notified: {}, countdown: false, reminders: false };
  }
  return SYN[key];
}
const liveChannels = () => S.accounts.map(channelLive).filter(Boolean).sort((x, y) => (y.viewers || 0) - (x.viewers || 0));
const chanHash = id => '#canal-' + String(id).replace(/_/g, '-');
const findAnyEvent = id => S.events.find(e => e.id === id) || Object.values(SYN).find(e => e.id === id);
const espet = n => `${fmt(n)} ${Math.round(n) === 1 ? 'espetador' : 'espetadores'}`;
function upTime(ms) { const { h, m, s } = cdParts(ms); return `${pad(h + Math.floor(ms / DAY) * 24)}:${pad(m)}:${pad(s)}`; }
function streamTags(game, extra = []) { return ['Português', ...(STREAM_TAGS[game] || []), ...extra]; }
const glyphText = G => G.glyph.length > 3 ? G.glyph : (G.name.length > 12 ? G.glyph : G.name.toUpperCase());
const tagChips = tags => `<div class="tw-tags">${tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>`;

/* ---------- Página inicial ---------- */
UI.homeTab = 'live'; UI.homeCat = 'all';
function homeTabsHTML() {
  return `<nav class="tw-tabs" aria-label="Página inicial">${[['following', 'A seguir'], ['live', 'Em direto'], ['clips', 'Clipes'], ['posts', 'Publicações']].map(([k, l]) => `<button class="${UI.homeTab === k ? 'on' : ''}" data-act="home-tab" data-k="${k}">${l}</button>`).join('')}</nav>`;
}
function liveCardHTML(ev, mine = false) {
  const a = mine ? S.me : acc(ev.owner), G = GAMES[ev.game] || GAMES.chat;
  const viewers = mine ? S.live.viewers : (ev.viewers || 0);
  const href = mine ? '#estudio' : chanHash(a.id);
  const face = a.avatar ? `<img src="${a.avatar}" alt="">` : esc((a.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase());
  return `<article class="tw-card">
    <a class="tw-thumb" href="${href}" style="--gc:${G.color}" aria-label="Ver a live de ${esc(a.name)}">
      <span class="tw-thumb-bg"></span><span class="tw-thumb-glyph">${esc(glyphText(G))}</span>
      <span class="tw-thumb-cam" style="--h:${a.hue || 270}">${face}</span>
      <span class="tw-live">Em direto</span>
      <span class="tw-viewers" ${mine ? 'data-live="viewers-card"' : `data-chv="${ev.id}"`}>${espet(viewers)}</span>
    </a>
    <div class="tw-meta">${avatar(a, 40)}<div>
      <a class="tw-name" href="${href}">${esc(a.name)}${a.verified ? VERIFIED : ''}${mine ? ' <span class="tw-you">tu</span>' : ''}</a>
      <p class="tw-title">${esc(ev.title)}</p>
      <span class="tw-game">${esc(G.name)}</span>
      ${tagChips(streamTags(ev.game).slice(0, 3))}
    </div></div>
  </article>`;
}
function viewFeed() {
  const t = UI.homeTab;
  const soon = S.events.filter(e => e.owner === 'me' && eventStatus(e) === 'soon' && !S.live);
  if (t === 'posts') return soonBanner(soon) + homeTabsHTML() + viewPosts();
  let body = '';
  if (t === 'live') {
    const lives = liveChannels();
    const cats = [...new Set(lives.map(e => e.game))];
    const list = lives.filter(e => UI.homeCat === 'all' || e.game === UI.homeCat);
    body = `<div class="chip-row tw-cats">${[['all', 'Tudo'], ...cats.map(g => [g, GAMES[g]?.name || g])].map(([k, l]) => `<button class="chip ${UI.homeCat === k ? 'on' : ''}" data-act="home-cat" data-k="${k}">${esc(l)}</button>`).join('')}</div>
      <div class="tw-grid">${S.live && (UI.homeCat === 'all' || UI.homeCat === S.live.game) ? liveCardHTML(S.live, true) : ''}${list.map(e => liveCardHTML(e)).join('') || '<div class="empty"><b>Ninguém em direto nesta categoria</b>Experimenta outra categoria.</div>'}</div>`;
  } else if (t === 'following') {
    const fol = S.accounts.filter(a => a.followed);
    const live = fol.map(channelLive).filter(Boolean);
    const off = fol.filter(a => !channelLive(a));
    const evs = S.events.filter(e => fol.some(a => a.id === e.owner) && ['scheduled', 'soon'].includes(eventStatus(e))).sort((x, y) => x.start - y.start).slice(0, 4);
    body = !fol.length ? `<div class="empty"><b>Ainda não segues ninguém</b>Segue canais fictícios na página <a href="#explorar">Procurar</a>.</div>` : `
      <h2 class="tw-h">Canais em direto <span class="num">${live.length}</span></h2>
      <div class="tw-grid">${live.map(e => liveCardHTML(e)).join('') || '<p class="muted">Nenhum canal que segues está em direto agora.</p>'}</div>
      ${evs.length ? `<h2 class="tw-h">Próximas transmissões</h2><div class="day-list" style="margin:0">${evs.map(evRow).join('')}</div>` : ''}
      <h2 class="tw-h">Canais offline</h2>
      <div class="tw-offline">${off.map(a => `<a class="tw-off" href="${chanHash(a.id)}">${avatar(a, 44, 'off').replace('<a ', '<span ').replace('</a>', '</span>')}<span><strong>${esc(a.name)}</strong><small>${esc(GAMES[(a.games || [])[0]]?.name || a.cat)} · ${fmt(a.followers)} seguidores</small></span><span class="chan-off">Offline</span></a>`).join('') || '<p class="muted">Todos estão em direto!</p>'}</div>`;
  } else {
    const games = [...new Set(S.clips.map(c => c.game))];
    const list = [...S.clips].filter(c => UI.homeCat === 'all' || c.game === UI.homeCat).sort((a, b) => b.popularity - a.popularity);
    body = `<div class="chip-row tw-cats">${[['all', 'Tudo'], ...games.map(g => [g, GAMES[g]?.name || g])].map(([k, l]) => `<button class="chip ${UI.homeCat === k ? 'on' : ''}" data-act="home-cat" data-k="${k}">${esc(l)}</button>`).join('')}</div>
      ${list.length ? `<div class="clip-grid">${list.map(clipCard).join('')}</div>` : '<div class="empty"><b>Sem clipes</b>Cria clipes durante as tuas lives.</div>'}`;
  }
  return `${soonBanner(soon)}${homeTabsHTML()}${body}`;
}

/* ---------- Página do canal ---------- */
UI.watchFull = false;
const WATCH = { key: null, acc: null, chat: [], gifters: {}, timer: null, started: 0, botAt: 0, dropDone: false };
function viewWatch(id) {
  const a = S.accounts.find(x => x.id === id);
  if (!a) return `<div class="empty"><b>Canal não encontrado</b><a href="#feed">Voltar à página inicial</a></div>`;
  const ev = channelLive(a), G = GAMES[ev ? ev.game : ((a.games || [])[0] || 'chat')] || GAMES.chat;
  const sub = S.subs && S.subs[a.id];
  const next = S.events.filter(e => e.owner === a.id && ['scheduled', 'soon'].includes(eventStatus(e))).sort((x, y) => x.start - y.start)[0];
  const face = a.avatar ? `<img src="${a.avatar}" alt="">` : esc((a.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase());
  const video = ev ? `<div class="screen-bg"></div><div class="screen-floor"></div><div class="screen-center"><div><div class="big">${esc(glyphText(G))}</div><small>Live simulada</small></div></div>
      <span class="wp-cam" style="--h:${a.hue || 270}">${face}<em>${esc(a.handle)}</em></span>`
    : `<div class="wp-offline"><div>${avatar(a, 84).replace('<a ', '<span ').replace('</a>', '</span>')}<strong>${esc(a.name)} está offline</strong><span>${next ? `Próxima live: ${esc(next.title)} · ${whenLabel(next.start)}` : 'Segue o canal para saberes quando entra em direto.'}</span></div></div>`;
  return `<div class="wp ${UI.watchFull ? 'full' : ''}" data-watch="${a.id}">
    <div class="wp-main">
      <div class="wp-video screen" style="--gc:${G.color}">
        ${video}
        <div class="wp-top">
          <a class="wp-ic" href="#feed" aria-label="Voltar">${icon('chevD')}</a>
          ${ev ? '<span class="wp-aud">Dirigido a todos · fictício</span>' : ''}
          <span class="spacer"></span>
          ${ev ? `<button class="wp-pill" data-act="w-clip" data-id="${a.id}">${icon('clip')} Clipe</button>` : ''}
          <button class="wp-ic" data-act="w-share" data-id="${a.id}" aria-label="Partilhar">${icon('share')}</button>
          <button class="wp-ic" data-act="w-quality" aria-label="Definições">${icon('gear')}</button>
        </div>
        ${ev ? `<div class="wp-bottom"><span class="tw-uptime"><i></i><span class="num" data-wup>${upTime(Date.now() - ev.start)}</span></span><span class="tw-vw">${icon('person')}<b class="num" data-anim="wviewers" data-v="${Math.round(ev.viewers || 0)}">${fmt(ev.viewers || 0)}</b></span><span class="spacer"></span><button class="wp-ic" data-act="w-full" aria-label="Ecrã inteiro">${icon(UI.watchFull ? 'shrink' : 'expand')}</button></div>
        <div class="screen-chat on" data-wchat-overlay aria-hidden="true"></div>` : ''}
        <div class="fx" id="wfx"></div>
      </div>
      <section class="wp-info">
        <div class="wp-chan">${avatar(a, 52, ev ? 'ring-live' : '')}<div>
          <a class="wp-name" href="#conta-${a.id}">${esc(a.name)}${a.verified ? VERIFIED : ''}</a>
          <p class="wp-title">${esc(ev ? ev.title : (a.bio || ''))}</p>
          <a class="wp-game" href="#explorar" data-act="explore-game" data-k="${ev ? ev.game : (a.games || ['chat'])[0]}">${esc(G.name)}</a>
        </div></div>
        ${ev ? tagChips(streamTags(ev.game, ['Gaming', 'DropsAtivos'])) : ''}
        <div class="wp-actions">
          <button class="wp-round ${a.followed ? 'on' : ''}" data-act="follow" data-id="${a.id}" aria-label="${a.followed ? 'Deixar de seguir' : 'Seguir'}" title="${a.followed ? 'A seguir' : 'Seguir'}">${icon(a.followed ? 'heartFill' : 'heart')}</button>
          <button class="wp-round ${S.chanBell && S.chanBell[a.id] ? 'on' : ''}" data-act="w-bell" data-id="${a.id}" aria-label="Notificações do canal">${icon('bellPlus')}</button>
          <button class="btn wp-gift" data-act="w-giftsub" data-id="${a.id}">Oferecer subscrição</button>
          <button class="btn ${sub ? '' : 'btn-primary'} wp-sub" data-act="w-sub" data-id="${a.id}">${sub ? icon('star') + ' Subscrito' : 'Subscrever'}</button>
        </div>
        <p class="tiny muted" style="margin:0">Subscrições, presentes e espetadores são fictícios: nada é pago.</p>
      </section>
    </div>
    <aside class="wp-side">
      <section class="card chat wp-chatbox">
        <div class="chat-head"><strong>Chat ${ev ? '' : 'offline'}</strong>${SIM()}<span class="spacer"></span><span class="small muted">👀 <span data-wv>${ev ? fmt(ev.viewers || 0) : 0}</span></span></div>
        ${ev ? `<div class="lb" data-wlb>${leaderboardHTML(WATCH.key === a.id ? WATCH.gifters : {})}</div>
        <div class="drop" data-wdrop>${dropHTML(a, ev)}</div>` : ''}
        <div class="chat-list" id="wpChat" data-wchat></div>
        <button class="more-pill" data-act="chat-bottom" hidden>Mais mensagens abaixo</button>
        ${chatInputHTML('wpInput', 'watch-send', true, a.id)}
      </section>
    </aside>
  </div>`;
}
function dropHTML(a, ev) {
  const need = 10 * MIN, got = WATCH.key === a.id ? Date.now() - WATCH.started : 0, pct = Math.min(100, got / need * 100);
  const G = GAMES[ev.game] || GAMES.chat; const done = S.badges && S.badges[ev.game];
  return `<span class="drop-ic">${gicon(ev.game, 34)}</span><div><b>${done ? 'Emblema ganho!' : `Vê 10 minutos e ganha o emblema «${esc(G.name)}»`}</b><small>Recompensa fictícia · ${done ? 'já está no teu perfil' : Math.floor(pct) + '%'}</small><div class="goal-bar"><i style="width:${done ? 100 : pct}%"></i></div></div>`;
}
function leaderboardHTML(g) {
  const top = Object.entries(g || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (!top.length) return '<span class="tiny muted">Ainda ninguém ofereceu presentes</span>';
  return top.map(([u, n], i) => `<span class="lb-i"><b class="lb-medal m${i + 1}">${i + 1}</b><span><strong>${esc(u)}</strong><small>${icon('gift')} ${dots(n)}</small></span></span>`).join('');
}
function chatInputHTML(id, form, gift, accId) {
  return `<form class="tw-input" data-form="${form}" ${accId ? `data-id="${accId}"` : ''}>
    ${gift ? `<button type="button" class="tw-in-gift" data-act="w-giftsub" data-id="${accId}" aria-label="Oferecer subscrição">${icon('gift')}</button>` : ''}
    <div class="tw-in-wrap"><input class="input" id="${id}" name="t" maxlength="200" placeholder="Enviar chat" autocomplete="off"><button type="button" class="tw-in-emo" data-act="emote-pick" data-for="${id}" aria-label="Emotes">${icon('smile')}</button></div>
    <button class="btn btn-primary btn-sm">Chat</button>
    <div class="emote-pop" data-emotes-for="${id}" hidden>${['😂', '🔥', '💜', '😭', '😱', '🏆', '👀', '💀', '🎉', '👏', 'GG', 'W', 'L', '🐐', '🫡', '🤯', '💎', '⚡', '🍿', '❤️'].map(e => `<button type="button" data-act="emote-insert" data-e="${e}" data-for="${id}">${e}</button>`).join('')}</div>
  </form>`;
}
function wMsg(m) {
  m.id = m.id || uid(); m.t = m.t || Date.now(); m.color = m.color || regColor(m.user) || pick(NAME_COLORS);
  WATCH.chat.push(m); if (WATCH.chat.length > 150) WATCH.chat.shift();
  const list = $('#wpChat'); if (list) appendChat(list, chatMsgHTML(m));
  const ov = $('[data-wchat-overlay]'); if (ov && !m.plain) { ov.insertAdjacentHTML('beforeend', overlayMsgHTML(m)); while (ov.children.length > 7) ov.firstElementChild.remove(); }
}
function appendChat(list, html, max = 150) {
  const near = list.scrollHeight - list.scrollTop - list.clientHeight < 50;
  list.insertAdjacentHTML('beforeend', html);
  while (list.children.length > max) list.firstElementChild.remove();
  const pill = list.parentElement.querySelector('.more-pill');
  if (near) list.scrollTop = list.scrollHeight; else if (pill) pill.hidden = false;
}
function startWatch(a) {
  const ev = channelLive(a);
  if (WATCH.key !== a.id) {
    clearInterval(WATCH.timer);
    Object.assign(WATCH, { key: a.id, acc: a, chat: [], gifters: {}, started: Date.now(), botAt: Date.now(), dropDone: false });
    if (ev) {
      const seed = Math.max(3, Math.round((ev.viewers || 100) / 80));
      [fakeUser(), fakeUser(), fakeUser()].forEach((u, i) => WATCH.gifters[u] = Math.round(seed * [4, 2, 1.3][i]));
    }
  }
  const list = $('#wpChat');
  if (list) {
    list.innerHTML = '';
    if (!WATCH.chat.length) {
      wMsg({ plain: true, text: `Damos-te as boas-vindas à sala de chat de ${a.handle}!` });
      if (ev) wMsg({ user: 'LiveBot', bot: true, color: '#00c8af', text: `Segue ${a.name} nas redes e ativa as notificações 🔔 · comandos: !discord !setup` });
      else wMsg({ plain: true, text: 'O canal está offline. Podes escrever na mesma.' });
    } else WATCH.chat.slice(-80).forEach(m => list.insertAdjacentHTML('beforeend', chatMsgHTML(m)));
    list.scrollTop = list.scrollHeight;
  }
  clearInterval(WATCH.timer);
  paintWatchLB();
  if (!ev) return;
  WATCH.timer = setInterval(() => watchTick(a), 650);
}
function watchTick(a) {
  const r = route();
  if (r.name !== 'watch' || r.id !== a.id) { clearInterval(WATCH.timer); return; }
  const ev = channelLive(a); if (!ev) { clearInterval(WATCH.timer); render(); return; }
  ev.viewers = Math.max(10, Math.round((ev.viewers || 100) * rand(.996, 1.007)));
  $$('[data-anim="wviewers"]').forEach(el => tweenNum(el, ev.viewers));
  $$('[data-wv]').forEach(el => el.textContent = fmt(ev.viewers));
  const up = $('[data-wup]'); if (up) up.textContent = upTime(Date.now() - ev.start);
  const ctx = { gameName: (GAMES[ev.game] || GAMES.chat).name, viewers: ev.viewers, goal: 100000 };
  const rate = ev.viewers > 5000 ? 1.6 : ev.viewers > 500 ? 1 : .5;
  let n = Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0);
  while (n--) {
    const pool = Math.random() < .35 ? moodPool(ev.game, pick(['amazing', 'funny', 'win', 'clutch', 'scary', 'sad', 'rare'])) : (ev.game === 'gta6' && Math.random() < .4 ? GTA6_AMBIENT : AMBIENT);
    wMsg({ user: Math.random() < .12 && S.regulars.length ? pick(S.regulars).u : fakeUser(), text: fill(pick(pool), ctx) });
  }
  if (Math.random() < .018) { const u = fakeUser(), k = pick([1, 1, 5, 10]); WATCH.gifters[u] = (WATCH.gifters[u] || 0) + k; wMsg({ gift: true, text: `🎁 ${u} ofereceu ${k} ${k === 1 ? 'subscrição' : 'subscrições'} à comunidade!` }); paintWatchLB(); }
  if (Math.random() < .012) wMsg({ gift: true, text: `⭐ ${fakeUser()} subscreveu por ${randi(2, 30)} meses!` });
  if (Date.now() - WATCH.botAt > 45000) { WATCH.botAt = Date.now(); wMsg({ user: 'LiveBot', bot: true, color: '#00c8af', text: pick([`Segue ${a.name} e ativa as notificações 🔔`, 'Lembrem-se de ser simpáticos no chat 💜', `Vejam os clipes de ${a.handle} na página do canal!`]) }); }
  const drop = $('[data-wdrop]'); if (drop) drop.innerHTML = dropHTML(a, ev);
  if (!WATCH.dropDone && Date.now() - WATCH.started > 10 * MIN) { WATCH.dropDone = true; S.badges = S.badges || {}; if (!S.badges[ev.game]) { S.badges[ev.game] = Date.now(); notify('🎖️', `Ganhaste o emblema «${(GAMES[ev.game] || GAMES.chat).name}» por veres a live de ${a.name} (fictício).`); toast('🎖️', 'Emblema ganho!'); save(); } }
}
function paintWatchLB() { const el = $('[data-wlb]'); if (el) el.innerHTML = leaderboardHTML(WATCH.gifters); }
function stopWatch() { clearInterval(WATCH.timer); }

/* ---------- Estúdio: informação do canal, top de presentes e meta no chat ---------- */
function studioInfoHTML() {
  const L = S.live, G = GAMES[L.game] || GAMES.chat;
  return `<section class="wp-info studio-info"><div class="wp-chan">${avatar(S.me, 48, 'ring-live')}<div>
    <span class="wp-name">${esc(S.me.name)}${S.me.verified ? VERIFIED : ''}</span>
    <p class="wp-title">${esc(L.title)}</p><span class="wp-game">${esc(G.name)}</span></div>
    <div class="si-stats"><span>${icon('person')} <b class="num" data-live="viewers">${fmt(L.viewers)}</b></span><span>💜 <b class="num" data-me="followers">${fmt(S.me.followers)}</b></span></div></div>
    ${tagChips(streamTags(L.game, [MODES[L.mode].name]))}</section>`;
}
function trackGifter(L, u, val) { L.gifters = L.gifters || {}; L.gifters[u] = (L.gifters[u] || 0) + val; const el = $('[data-slb]'); if (el && Date.now() - (L.lbAt || 0) > 1000) { L.lbAt = Date.now(); el.innerHTML = leaderboardHTML(L.gifters); } }
function goalBannerHTML() {
  const G = S.prefs.giftGoal, pct = Math.min(100, G.progress / G.target * 100);
  return `<span class="drop-ic">🎯</span><div><b>${esc(G.title)}</b><small>${dots(G.progress)} / ${dots(G.target)} moedas virtuais</small><div class="goal-bar"><i style="width:${pct}%"></i></div></div>`;
}
function paintGoalBanner() { $$('[data-goalbanner]').forEach(el => el.innerHTML = goalBannerHTML()); }

const TW_ACT = {
  'home-tab': b => { UI.homeTab = b.dataset.k; UI.homeCat = 'all'; render(); },
  'home-cat': b => { UI.homeCat = b.dataset.k; render(); },
  'watch': b => { const ev = findAnyEvent(b.dataset.id); closeModalIfOpen(); if (ev) location.hash = ev.owner === 'me' ? '#estudio' : chanHash(ev.owner); },
  'chat-bottom': b => { const list = b.parentElement.querySelector('.chat-list'); if (list) list.scrollTop = list.scrollHeight; b.hidden = true; },
  'emote-pick': b => { const pop = $(`[data-emotes-for="${b.dataset.for}"]`); if (pop) pop.hidden = !pop.hidden; },
  'emote-insert': b => { const i = document.getElementById(b.dataset.for); if (i) { i.value = (i.value ? i.value.replace(/\s*$/, ' ') : '') + b.dataset.e + ' '; i.focus(); } },
  'w-full': () => { UI.watchFull = !UI.watchFull; const wp = $('.wp'); if (wp) wp.classList.toggle('full', UI.watchFull); document.body.classList.toggle('theater-on', UI.watchFull); const btn = $('[data-act="w-full"]'); if (btn) btn.innerHTML = icon(UI.watchFull ? 'shrink' : 'expand'); try { if (UI.watchFull) document.documentElement.requestFullscreen?.().catch(() => { }); else if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); } catch (e) { } },
  'w-clip': b => { const a = acc(b.dataset.id), ev = channelLive(a); if (!ev) return; const G = GAMES[ev.game] || GAMES.chat; S.clips.unshift({ id: 'c_' + uid(), title: `${G.name}: momento na live de ${a.name}`, game: ev.game, streamer: a.id, type: 'Clipe de espetador', emoji: '🎬', popularity: randi(40, 90), likes: 0, comments: 0, onProfile: false, createdAt: Date.now(), liked: false, commentsList: [], secs: 30 }); save(); toast('🎬', 'Clipe criado. Está em Página inicial → Clipes.'); },
  'w-share': b => { const a = acc(b.dataset.id); copyText(`Estou a ver ${a.name} no LiveVerse (simulação)`); },
  'w-quality': () => toast('⚙️', 'Qualidade: Automática (1080p60 simulado)'),
  'w-bell': b => { S.chanBell = S.chanBell || {}; const id = b.dataset.id; S.chanBell[id] = !S.chanBell[id]; b.classList.toggle('on', S.chanBell[id]); toast('🔔', S.chanBell[id] ? 'Vais receber notificações deste canal' : 'Notificações do canal desligadas'); save(); },
  'w-sub': b => {
    S.subs = S.subs || {}; const a = acc(b.dataset.id);
    if (S.subs[a.id]) { delete S.subs[a.id]; toast('⭐', 'Subscrição cancelada (fictícia)'); }
    else { S.subs[a.id] = { since: Date.now() }; toast('⭐', `Subscreveste ${a.name} (fictício, sem pagamentos)`); wMsg({ gift: true, text: `⭐ ${S.me.name} subscreveu! Bem-vindo à família de ${a.name}!` }); setTimeout(() => ['BEM-VINDO 💜', `${S.me.name} 🫡`, 'mais um sub!! 🎉'].forEach((t, i) => setTimeout(() => wMsg({ user: fakeUser(), text: t }), i * 300)), 400); }
    save(); const nb = $('.wp-sub'); if (nb) { nb.classList.toggle('btn-primary', !S.subs[a.id]); nb.innerHTML = S.subs[a.id] ? icon('star') + ' Subscrito' : 'Subscrever'; }
  },
  'w-giftsub': b => {
    const id = b.dataset.id; const a = acc(id); if (route().name !== 'watch') return;
    const who = fakeUser(); WATCH.gifters[S.me.handle] = (WATCH.gifters[S.me.handle] || 0) + 1;
    wMsg({ gift: true, text: `🎁 ${S.me.name} ofereceu uma subscrição a ${who}!` });
    setTimeout(() => wMsg({ user: who, text: pick(['OBRIGADO 😭💜', 'obrigadoooo', 'que lenda 🐐', `obrigado ${S.me.name}!!`]) }), 700);
    paintWatchLB(); toast('🎁', 'Ofereceste uma subscrição (fictícia, sem pagamentos)');
  },
};
const TW_FORMS = {
  'watch-send': f => {
    const t = f.t.value.trim(); if (!t) return; f.t.value = ''; const a = acc(f.dataset.id);
    wMsg({ user: S.me.name, text: t, me: true, sub: !!(S.subs && S.subs[a.id]), color: '#bf94ff' });
    const pop = f.querySelector('.emote-pop'); if (pop) pop.hidden = true;
    if (channelLive(a) && Math.random() < .7) setTimeout(() => wMsg({ user: fakeUser(), text: pick([`@${S.me.name} boas!`, `@${S.me.name} concordo`, `@${S.me.name} 😂😂`, 'verdade', `@${S.me.name} bem-vindo!`]) }), rand(900, 2200));
  },
};
document.addEventListener('scroll', e => {
  const t = e.target; if (!t || !t.classList || !t.classList.contains('chat-list')) return;
  if (t.scrollHeight - t.scrollTop - t.clientHeight < 40) { const pill = t.parentElement.querySelector('.more-pill'); if (pill) pill.hidden = true; }
}, true);
