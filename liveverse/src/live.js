/* =====================================================================
   Estúdio e simulador de lives: audiência, chat, presentes, reações,
   cronologia, clips, sondagens, raids. Tudo fictício.
   ===================================================================== */
const LIVE_MS = 650;
const MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 75000, 100000, 250000, 500000, 1000000];
const TL_ICON = { scene: '🎬', train: '🚂', surprise: '🎲', mod: '🔨', start: '🔴', milestone: '📈', gift: '🎁', reaction: '⚡', poll_start: '📊', poll_end: '✅', viral: '🌪️', raid: '🛡️', achievement: '🏆', end: '⏹️', follow: '💜' };
let liveTimer = null;
let watchTimer = null;
const STUDIO = { overlay: window.innerWidth < 760, reacts: false, showMore: false, custom: '', fx: true, autoClip: false, media: null, setup: null };

const noEmoji = t => String(t).replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '');
function fakeUser() { if (S && S.regulars && S.regulars.length && Math.random() < .22) return pick(S.regulars).u; return pick(NAME_A) + pick(NAME_B) + (Math.random() < .3 ? randi(1, 99) : ''); }
function fill(t, ctx) {
  return t.replace('{game}', ctx.gameName).replace('{viewers}', fmt(ctx.viewers).toUpperCase()).replace('{goal}', fmt(ctx.goal)).replace('{G}', ctx.gameName);
}
function liveCtx(L = S.live) { return { gameName: (GAMES[L.game] || GAMES.chat).name, viewers: L.viewers, goal: (LEVELS[L.level] || LEVELS.media).max }; }

/* ---------- Ciclo de vida ---------- */
function startLive({ title, game, mode, level, eventId }) {
  if (S.live) return;
  const now = Date.now();
  const L = LEVELS[level] || LEVELS.media;
  S.live = {
    id: 'live_' + uid(), title: title || 'Live sem título', game, mode, level, eventId: eventId || null,
    start: now, viewers: Math.max(3, Math.round(L.max * .006)), peak: 0, boost: 0, engage: 1, likes: 0, followers: 0, gifts: 0,
    reactions: 0, msgs: 0, milestones: [], timeline: [], clips: [], poll: null, raided: false, chat: [], viralCount: 0,
    scene: 'starting', sceneAt: now, sceneUntil: now + 20000,
  };
  addTimeline('start', 'Live começou: ' + S.live.title, '🔴');
  pushChat({ plain: true, text: `Damos-te as boas-vindas à sala de chat de ${S.me.handle}!` });
  pushChat({ sys: true, text: `🔴 Estás em direto em ${GAMES[game].name} · Modo ${MODES[mode].name}. Audiência simulada.` });
  if (eventId) {
    const ev = S.events.find(e => e.id === eventId);
    if (ev) {
      ev.liveId = S.live.id;
      S.live.viewers = Math.max(S.live.viewers, Math.round(ev.interested * .35));
      notify('🔴', `O teu evento «${ev.title}» está agora em direto!`, { ev: ev.id });
      toast('🔴', 'O teu evento está agora em direto!');
      pushChat({ sys: true, text: `🔔 ${dots(ev.reminderUsers)} lembretes fictícios enviados — a comunidade está a chegar!` });
    }
  }
  S.stats.livesStarted = (S.stats.livesStarted || 0) + 1;
  checkAch(); save();
  runLive();
  location.hash = '#estudio';
  render();
}
function runLive() { clearInterval(liveTimer); if (S.live) liveTimer = setInterval(() => { try { liveTick(); } catch (e) { console.warn('live', e); } }, LIVE_MS); }

function endLive() {
  const L = S.live; if (!L) return;
  clearInterval(liveTimer); liveTimer = null;
  immersiveEnd(L); if (STUDIO.theater) setTheater(false);
  if (MEDIA.rec) recStop();
  const now = Date.now();
  addTimeline('end', 'Live terminada', '⏹️');
  const rec = {
    id: L.id, title: L.title, game: L.game, mode: L.mode, level: L.level, eventId: L.eventId, start: L.start, end: now,
    peak: Math.round(L.peak), views: Math.round(L.peak * rand(1.5, 2.1) + L.followers * 3), followers: Math.round(L.followers), gifts: Math.round(L.gifts),
    likes: Math.round(L.likes), reactions: L.reactions, timeline: L.timeline, clips: L.clips,
  };
  S.lives.push(rec);
  if (L.eventId) { const ev = S.events.find(e => e.id === L.eventId); if (ev) { ev.endedAt = now; ev.peak = rec.peak; } }
  addXP(Math.min(1500, (now - L.start) / MIN * 6 + rec.peak / 400 + 40));
  S.live = null;
  STUDIO.summary = rec.id;
  if (L.achQueue && L.achQueue.length) { const q = L.achQueue; setTimeout(() => toast('🏆', `Nesta live desbloqueaste: ${q.slice(0, 3).join(', ')}${q.length > 3 ? ` e mais ${q.length - 3}` : ''}`, 6500), 600); }
  STUDIO.media = null;
  notify('⏹️', `Live terminada: pico de ${fmt(rec.peak)} espectadores virtuais e ${fmt(rec.followers)} novos seguidores fictícios.`);
  checkAch(); save(); render();
}

/* ---------- Tick da simulação ---------- */
function liveTick() {
  const L = S.live; if (!L) return;
  const now = Date.now(), e = (now - L.start) / 1000;
  const lvl = LEVELS[L.level] || LEVELS.media, M = MODES[L.mode] || MODES.casual;
  const base = lvl.max * (0.05 + 0.68 * (1 - Math.exp(-e / (70 + lvl.max / 4000)))) * Math.min(1.15, M.hype * .85) * sceneFactor(L);
  L.boost *= 0.985;
  const target = Math.min(lvl.max * 1.12, base + L.boost) * rand(.985, 1.015);
  L.viewers = Math.max(1, L.viewers + (target - L.viewers) * 0.07);
  if (L.viewers > L.peak) L.peak = L.viewers;
  L.engage = 1 + (L.engage - 1) * 0.96;

  for (const m of MILESTONES) {
    if (L.viewers >= m && !L.milestones.includes(m)) {
      L.milestones.push(m);
      addTimeline('milestone', `Marco de audiência: ${dots(m)} espectadores virtuais`, '📈');
      activityPush(L, 'milestone', `Marco de ${dots(m)} espetadores`);
      if (m >= 1000) crowd(.7);
      if (m >= 500) sound('milestone');
      if (m >= lvl.max) { notify('🎯', `Meta atingida: ${dots(m)} espectadores virtuais em «${L.title}»!`); fxBurst('🎯', 'META ATINGIDA!'); }
      checkAch();
    }
  }
  // seguidores, gostos
  const fGain = L.viewers * 0.00005 * L.engage * rand(.3, 1.4);
  L.followers += fGain; S.me.followers += fGain;
  L.likes += L.viewers * 0.0006 * L.engage * rand(.5, 1.5);
  // chat
  const rate = (L.viewers < 30 ? .25 : L.viewers < 1000 ? .8 : L.viewers < 20000 ? 1.4 : 2.1) * Math.min(2.2, L.engage) * chatRateFactor();
  let n = Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0);
  while (n--) pushChat({ user: fakeUser(), text: S.mod.emoteOnly ? (S.emotes && S.emotes.length && Math.random() < .6 ? pick(S.emotes).code : pick(EMOTES)) : withEmotes(ambientLine(L)) });
  maybeTroll(L);
  surpriseTick(L); surpriseCheck(L); immersiveTick(L);
  // presentes
  if (Math.random() < (0.05 + Math.log10(L.viewers + 1) * 0.025 * L.engage) * (L.train ? 2.5 : 1) * (L.scene === 'starting' ? .3 : 1)) giftEvent();
  // raid espontânea
  if (!L.raided && e > 120 && Math.random() < 0.0025) raid();
  // sondagem
  if (L.poll && !L.poll.done) {
    L.poll.options.forEach(o => o.v += Math.round(L.viewers * rand(0, .0016) * o.bias));
    if (now >= L.poll.ends) endPoll();
  }
  if (Math.random() < .02) checkAch();
  updateLiveBits();
  if (Math.random() < .1) save();
}
function ambientLine(L) {
  const ctx = liveCtx(L);
  const sl = sceneLine(L); if (sl) return sl;
  const pools = [L.game === 'gta6' && Math.random() < .35 ? GTA6_AMBIENT : AMBIENT, MODE_AMBIENT[L.mode] || []];
  if (L.lastMood && Date.now() - L.lastMoodAt < 8000) pools.push(moodPool(L.game, L.lastMood));
  const pool = pools[pools.length > 2 && Math.random() < .5 ? 2 : Math.random() < .2 && pools[1].length ? 1 : 0];
  return fill(pick(pool), ctx);
}
function moodPool(game, mood) {
  const G = GAMES[game] || GAMES.chat;
  return GAME_POOLS[`${game}:${mood}`] || GAME_POOLS[`g:${G.genre}:${mood}`] || MOOD_POOLS[mood] || MOOD_POOLS.amazing;
}
function giftEvent(fromUser) {
  const L = S.live;
  const tot = GIFTS.reduce((s, g) => s + g.w, 0); let r = Math.random() * tot; let g = GIFTS[0];
  for (const x of GIFTS) { r -= x.w; if (r <= 0) { g = x; break; } }
  const qty = g.value >= 200 ? 1 : randi(1, L.viewers > 10000 ? 20 : 5);
  const val = g.value * qty;
  L.gifts += val;
  const u = fromUser || fakeUser();
  if (val >= 50) pushChat({ gift: true, text: `${u} enviou ${qty > 1 ? qty + '× ' : ''}${g.name} (${dots(val)} moedas virtuais)` });
  goalAdd(val); hypeAdd(val); trackGifter(L, u, val);
  if (val >= 20) activityPush(L, 'gift', `${u} ofereceu ${qty > 1 ? qty + '× ' : ''}${g.name} · ${dots(val)} moedas`);
  if (val >= 200) giftMessage(u, g, val);
  if (val >= 500) crowd(.5);
  if (val >= 50) { alertShow(g.icon, `${u} enviou ${qty > 1 ? qty + '× ' : ''}${g.name}`, `${dots(val)} moedas virtuais`, 'gift'); sound(val >= 200 ? 'bigGift' : 'gift'); }
  if (val >= 200) { addTimeline('gift', `Presente virtual: ${u} enviou ${qty > 1 ? qty + '× ' : ''}${g.name} ${g.icon}`, '🎁'); if (STUDIO.fx) particles([g.icon], 8); }
  if (L.gifts >= 10000) checkAch();
}

/* ---------- Chat ---------- */
function pushChat(m) {
  const L = S.live; if (!L) return;
  m.id = uid(); m.color = m.color || regColor(m.user) || pick(NAME_COLORS); m.t = Date.now();
  if (!modFilter(m)) return;
  L.chat.push(m); if (L.chat.length > 80) L.chat.shift();
  L.msgs++;
  $$('[data-chatlist]').forEach(list => {
    const overlay = list.dataset.chatlist === 'overlay';
    if (overlay) {
      if (m.removed) return;
      list.insertAdjacentHTML('beforeend', overlayMsgHTML(m));
      while (list.children.length > 6) list.firstElementChild.remove();
      return;
    }
    const paused = list.matches(':hover') || list.querySelector('.msg.open');
    const atBottom = !paused && list.scrollHeight - list.scrollTop - list.clientHeight < 60;
    if (!atBottom) { const pill = list.parentElement.querySelector('.more-pill'); if (pill) pill.hidden = false; }
    list.insertAdjacentHTML('beforeend', chatMsgHTML(m));
    while (list.children.length > 80) list.firstElementChild.remove();
    if (atBottom) list.scrollTop = list.scrollHeight;
  });
  const last = $('#dockLast'); if (last && !m.sys && !m.gift) last.textContent = `${m.user}: ${m.text}`;
}
function overlayMsgHTML(m) {
  if (m.sys || m.gift) return `<div class="ov-msg ov-sys" data-mid="${m.id}">${esc(noEmoji(m.text))}</div>`;
  return `<div class="ov-msg" data-mid="${m.id}" data-user="${esc(m.user)}">${regBadges(m.user)}<b style="color:${m.color}">${esc(m.user)}</b> ${emotify(esc(m.text))}</div>`;
}
function chatMsgHTML(m) {
  if (m.removed) return `<div class="msg removed">${esc(m.removed)}</div>`;
  if (m.plain) return `<div class="msg plain">${esc(m.text)}</div>`;
  if (m.sys) return `<div class="msg sys ${m.mod ? 'modmsg' : ''}">${esc(noEmoji(m.text))}</div>`;
  if (m.gift) return `<div class="msg gift">${esc(noEmoji(m.text))}</div>`;
  const time = m.t ? `<span class="msg-time">${hhmm(m.t)}</span>` : '';
  const inLive = !!(S.live && S.live.chat.includes(m));
  return `<div class="msg ${m.hype ? 'hype' : ''} ${m.me ? 'me' : ''}" data-mid="${m.id}" ${inLive ? `data-act="msg-tap" data-user="${esc(m.user)}" tabindex="0"` : ''}>${time}${m.bot ? `<span class="tbadge tb-bot" title="Bot do canal">${icon('botIc')}</span>` : ''}${m.sub && !regular(m.user) ? `<span class="tbadge tb-sub" title="Subscritor fictício">${icon('starF')}</span>` : ''}${regBadges(m.user)}<b style="color:${m.color}">${esc(m.user)}</b>: ${emotify(esc(m.text))}${inLive ? chatModTools(m) : ''}</div>`;
}

/* ---------- Cronologia & clips ---------- */
function addTimeline(type, label, ic, extra = {}) {
  const L = S.live; if (!L) return;
  const item = { id: uid(), type, label, icon: ic || TL_ICON[type] || '•', t: Date.now(), clipId: null, ...extra };
  L.timeline.unshift(item);
  const tl = $('#timeline'); if (tl) { tl.insertAdjacentHTML('afterbegin', tlHTML(item)); }
  return item;
}
function tlHTML(it) {
  const L = S.live; const rel = L ? durLabel(it.t - L.start) : hhmm(it.t);
  return `<div class="tl" data-tl="${it.id}"><span class="ico">${it.icon}</span><div>${esc(it.label)}<br><time>${rel}</time> ${it.clipId ? '<span class="clipped">✓ Clip criado</span>' : ''}</div>${it.clipId || it.type === 'end' ? '' : `<button class="btn btn-xs" data-act="tl-clip" data-id="${it.id}">${icon('clip')} Criar clip</button>`}</div>`;
}
function makeClip({ title, game, type, emoji, hype = .5, liveId, viewers = 1000 }) {
  const pop = clamp(Math.round(35 + hype * 50 + Math.log10(viewers + 1) * 3 + rand(-8, 8)), 5, 99);
  const c = { id: 'c_' + uid(), title, game, streamer: 'me', type, emoji, popularity: pop, likes: Math.round(viewers * rand(.01, .05) * (0.5 + hype)), comments: Math.round(viewers * rand(.001, .006)), onProfile: false, createdAt: Date.now(), liveId: liveId || null, liked: false, commentsList: [], secs: randi(15, 59) };
  S.clips.unshift(c);
  S.stats.clipsMade = (S.stats.clipsMade || 0) + 1;
  addXP(15); checkAch(); save();
  return c;
}
function clipFromTimeline(id) {
  const L = S.live; let it = L && L.timeline.find(x => x.id === id);
  let liveRec = null;
  if (!it) { for (const l of S.lives) { const f = (l.timeline || []).find(x => x.id === id); if (f) { it = f; liveRec = l; break; } } }
  if (!it || it.clipId) return;
  const game = L ? L.game : liveRec.game;
  const typeName = it.reactLabel || { start: 'Início da live', milestone: 'Marco de audiência', gift: 'Presente virtual', poll_start: 'Sondagem', poll_end: 'Resultado da sondagem', viral: 'Momento viral', raid: 'Raid', achievement: 'Conquista' }[it.type] || 'Momento';
  const c = makeClip({ title: it.clipTitle || it.label.replace(/^Reação ao jogo: /, ''), game, type: typeName, emoji: it.icon, hype: it.hype ?? .4, liveId: L ? L.id : liveRec.id, viewers: L ? L.viewers : liveRec.peak });
  it.clipId = c.id;
  if (L) L.clips.push(c.id);
  const el = document.querySelector(`[data-tl="${id}"]`); if (el) el.outerHTML = tlHTML(it);
  toast('🎬', `Clip criado: ${c.title}`);
  save();
}

/* ---------- Reações ao jogo ---------- */
function inferMood(text) {
  const t = text.toLowerCase();
  if (/clutch|1\s*(v|vs|contra)\s*\d/.test(t)) return { moods: ['clutch'], hype: .75, fol: true, viral: .45, emoji: '🎯', fx: 'CLUTCH!' };
  if (/ganhei|vit[oó]ria|venci|campe|win|#1|primeiro lugar/.test(t)) return { moods: ['win'], hype: .6, fol: true, viral: .25, emoji: '🏆', fx: 'VITÓRIA!' };
  if (/susto|medo|assust|fantasma|jump|terror|grit/.test(t)) return { moods: ['scary'], hype: .45, fol: true, viral: .25, emoji: '😱', fx: 'QUE SUSTO!' };
  if (/perdi|falhei|morri|derrota|azar|errei/.test(t)) return { moods: ['sad'], hype: .1, fol: false, viral: .05, emoji: '💀', fx: 'NÃÃÃO' };
  if (/haha|bug|engra[cç]|ca[ií]|rid[ií]cul|lol/.test(t)) return { moods: ['funny'], hype: .4, fol: true, viral: .3, emoji: '😂', fx: 'HAHAHA' };
  if (/encontrei|raro|lend[aá]ri|m[ií]tic|diamante|dourad/.test(t)) return { moods: ['rare'], hype: .55, fol: true, viral: .25, emoji: '💎', fx: 'RARO!' };
  return { moods: ['big', 'amazing'], hype: .45, fol: true, viral: .2, emoji: '⚡', fx: 'GRANDE MOMENTO!' };
}
function react(itemId, customText) {
  const L = S.live; if (!L) return;
  const item = itemId === 'custom' ? inferMood(customText) : REACT_ITEMS[itemId];
  if (!item) return;
  const label = itemId === 'custom' ? customText : REACT_LABEL[itemId];
  const ctx = liveCtx(L);
  const mood = item.moods[0];
  // 1. reações no chat (dependem do jogo e do acontecimento)
  let lines = [...moodPool(L.game, mood)];
  if (item.moods[1]) lines = lines.concat(moodPool(L.game, item.moods[1]).slice(0, 4));
  if (itemId === 'custom') {
    const short = customText.length > 40 ? customText.slice(0, 38) + '…' : customText;
    lines.push(`«${short}» ?!`, 'REPETE ISSO', 'CHAT VIRAM ISTO??', 'ISTO TEM DE IR PARA OS CLIPS');
    const vs = customText.match(/(\d+)\s*(?:contra|vs?|x)\s*(\d+)/i);
    if (vs) lines.push(`${vs[1]}v${vs[2]}?!?! INSANO`, `${vs[1]} CONTRA ${vs[2]} 😭😭`, 'CLIP CLIP CLIP');
  }
  const count = Math.round(6 + item.hype * 10 + Math.log10(L.viewers + 1));
  for (let i = 0; i < count; i++) setTimeout(() => { if (S.live === L) pushChat({ user: fakeUser(), text: withEmotes(fill(pick(lines), liveCtx(L))), hype: true }); }, i * rand(90, 260));
  L.lastMood = mood; L.lastMoodAt = Date.now(); avatarEmote(mood);
  if (item.hype >= .6) { giftRain(L, Math.round(item.hype * 5)); crowd(item.hype); }
  // 2. animação
  if (STUDIO.fx) { fxBurst(item.emoji, item.fx); if (mood === 'scary') { const sc = $('#screen'); sc?.classList.remove('shake'); void sc?.offsetWidth; sc?.classList.add('shake'); } }
  // 3. interação
  const lvl = LEVELS[L.level] || LEVELS.media;
  L.boost += item.hype * lvl.max * 0.07;
  L.engage = Math.min(3, L.engage + item.hype * 1.2);
  L.likes += L.viewers * item.hype * 0.05;
  // 4. seguidores
  if (item.fol) {
    const f = Math.round(L.viewers * item.hype * rand(.002, .006) + 1);
    L.followers += f; S.me.followers += f;
    setTimeout(() => { if (S.live !== L) return; activityPush(L, 'follow', `+${dots(f)} novos seguidores`); alertShow('💜', `+${dots(f)} novos seguidores`, 'seguidores fictícios', 'follow'); sound('follow'); }, 900);
  }
  // 5. cronologia
  sound('react');
  L.reactions++; S.stats.reactions = (S.stats.reactions || 0) + 1;
  const it = addTimeline('reaction', 'Reação ao jogo: ' + label, item.emoji, { hype: item.hype, reactLabel: itemId === 'custom' ? 'Acontecimento personalizado' : label, clipTitle: label + ' em ' + ctx.gameName });
  // momento viral
  if (Math.random() < item.viral) setTimeout(() => {
    if (S.live !== L) return;
    L.viralCount++; L.boost += lvl.max * .12; sound('viral'); alertShow('🌪️', 'Momento viral!', label, 'viral');
    addTimeline('viral', `Momento viral: «${label}» está a espalhar-se na simulação`, '🌪️', { hype: .9, reactLabel: 'Momento viral', clipTitle: 'VIRAL: ' + label });
    pushChat({ sys: true, text: '🌪️ MOMENTO VIRAL! Novos espectadores virtuais a chegar.' });
    toast('🌪️', 'Momento viral na simulação!');
    unlock('viral');
  }, 1600);
  // 6. clip opcional
  if (STUDIO.autoClip) setTimeout(() => clipFromTimeline(it.id), 300);
  checkAch(); updateLiveBits(); save();
}

/* ---------- Sondagens e raids ---------- */
function startPoll(q, opts) {
  const L = S.live; if (!L || (L.poll && !L.poll.done)) return;
  L.poll = { q, options: opts.map(t => ({ t, v: 0, bias: rand(.5, 1.5) })), ends: Date.now() + 30000, done: false };
  S.stats.polls = (S.stats.polls || 0) + 1;
  addTimeline('poll_start', 'Sondagem iniciada: ' + q, '📊');
  pushChat({ sys: true, text: '📊 Sondagem: ' + q + ' — votem!' });
  checkAch(); renderPollBox();
}
function endPoll() {
  const L = S.live; if (!L || !L.poll || L.poll.done) return;
  L.poll.done = true;
  const win = [...L.poll.options].sort((a, b) => b.v - a.v)[0];
  addTimeline('poll_end', `Sondagem terminada: venceu «${win.t}» (${dots(win.v)} votos fictícios)`, '✅');
  pushChat({ sys: true, text: `✅ O chat decidiu: «${win.t}»!` });
  renderPollBox();
}
function raid() {
  const L = S.live; if (!L) return;
  const from = pick(S.accounts); const lvl = LEVELS[L.level] || LEVELS.media;
  const n = Math.round(lvl.max * rand(.04, .14));
  L.boost += n; L.viewers += n * .5; L.raided = true;
  addTimeline('raid', `Raid fictícia de ${from.name} com ${dots(n)} espectadores`, '🛡️', { hype: .7, reactLabel: 'Raid', clipTitle: 'Raid de ' + from.name });
  pushChat({ sys: true, text: `🛡️ RAID! ${from.name} chegou com ${dots(n)} espectadores virtuais!` });
  for (let i = 0; i < 8; i++) setTimeout(() => S.live === L && pushChat({ user: fakeUser(), text: pick(['RAID DE @' + from.handle + ' 🚀', 'viemos da live da ' + from.name.split(' ')[0], 'BOAS DO RAID', '🛡️🛡️🛡️', 'que live é esta?! 🔥']), hype: true }), i * 180);
  if (STUDIO.fx) fxBurst('🛡️', 'RAID!');
  toast('🛡️', `Raid de ${from.name}!`);
  sound('raid'); crowd(.8); alertShow('🛡️', `Raid de ${from.name}`, `${dots(n)} espectadores virtuais`, 'raid');
  activityPush(L, 'raid', `${from.name} fez raid com ${dots(n)} espetadores`);
  unlock('raid'); updateLiveBits();
}

/* ---------- Efeitos visuais ---------- */
function fxBurst(emoji, text) {
  return; // visual limpo: só os alertas discretos
  const fx = $('#fx'); if (!fx || !STUDIO.fx) return;
  const flash = document.createElement('div'); flash.className = 'flash';
  const burst = document.createElement('div'); burst.className = 'burst';
  burst.innerHTML = `<div class="t">${esc(text)}</div>`;
  fx.querySelectorAll('.burst').forEach(n => n.remove());
  fx.append(flash, burst);
  setTimeout(() => { flash.remove(); burst.remove(); }, 2300);
}
function particles(list, n) {
  return; // sem emojis a voar no ecrã
  const fx = $('#fx'); if (!fx) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('span'); p.className = 'particle'; p.textContent = pick(list);
    p.style.left = rand(5, 95) + '%'; p.style.setProperty('--x', rand(-80, 80) + 'px'); p.style.setProperty('--r', rand(-60, 60) + 'deg'); p.style.setProperty('--d', rand(1.6, 3) + 's');
    fx.appendChild(p); setTimeout(() => p.remove(), 3100);
  }
}

/* ---------- Vista do estúdio ---------- */
function viewStudio() {
  if (!S.live) return studioSetup();
  const L = S.live, G = GAMES[L.game] || GAMES.chat, lvl = LEVELS[L.level] || LEVELS.media;
  const open = !!STUDIO.controls;
  return `<div class="live-top">
    <span class="pill-live">EM DIRETO</span>
    <button class="lt-title lt-edit" data-act="stream-info" title="Editar informação da transmissão"><strong>${esc(L.title)}</strong><small>${esc(G.name)} · ${esc(streamTagsFor(L).slice(0, 3).join(' · '))} ${icon('edit')}</small></button>
    <div class="lt-stat"><small>Sessão</small><b class="num" data-live="uptime">${upTime(Date.now() - L.start)}</b></div>
    <div class="lt-stat"><small>Espetadores ${SIM('sim.')}</small><b class="num" data-anim="viewers" data-v="${Math.round(L.viewers)}">${dots(L.viewers)}</b></div>
    <canvas class="lt-spark" id="viewSpark" width="160" height="40" aria-label="Gráfico de espectadores"></canvas>
    <div class="lt-stat lt-fol"><small>Seguidores</small><b class="num" data-anim="followers" data-v="${Math.floor(S.me.followers)}">${dots(Math.floor(S.me.followers))}</b></div>
    <span class="spacer"></span>
    <div class="lt-actions">
      <button class="btn" data-act="theater">${icon(STUDIO.theater ? 'shrink' : 'expand')} ${STUDIO.theater ? 'Sair do ecrã inteiro' : 'Ecrã inteiro'}</button>
      <button class="btn ${open ? 'btn-primary' : ''}" data-act="controls" aria-expanded="${open}">${icon('menu')} Controlos</button>
      <button class="btn btn-danger" data-act="end-live-ask">${icon('close')} Terminar<span class="desk-only"> transmissão</span></button>
    </div>
  </div>
  <div id="endConfirm"></div>
  <div class="studio has-activity ${STUDIO.theater ? 'theater' : ''} ${S.prefs.orient === 'v' ? 'is-vertical' : ''}">
    ${activityHTML(L)}
    <div class="studio-main">
      <div class="screen ${S.prefs.orient === 'v' ? 'vertical' : ''}" id="screen" style="--gc:${G.color}">${screenInner(L)}
      </div>
      ${theaterBarHTML()}
      ${quickActionsHTML()}
      <div data-surprise>${surpriseHTML()}</div>
      <div class="controls-panel" id="controlsPanel" ${open ? '' : 'hidden'}>
      ${scenesHTML()}
      <div class="row" style="margin-top:10px">
        <label class="btn btn-sm upload">${icon('image')} Usar a minha media no ecrã<input type="file" accept="video/*,image/*" data-file="studio-media" id="studioMedia"></label>
        ${STUDIO.media ? `<button class="btn btn-sm btn-ghost" data-act="studio-media-clear">Voltar ao ecrã simulado</button>` : ''}
        <button class="btn btn-sm" data-act="announce-live">${icon('share')} Anunciar no feed</button>
        <span class="spacer"></span>
        <label class="switch small"><input type="checkbox" id="ovToggle" data-studio="overlay" ${STUDIO.overlay ? 'checked' : ''}> Chat no ecrã</label>
        <label class="switch small"><input type="checkbox" id="folCtToggle" data-pref="folCounter" ${S.prefs.folCounter !== false ? 'checked' : ''}> Contador de seguidores no ecrã</label>
        <label class="switch small"><input type="checkbox" id="goalToggle" data-pref="goalOnScreen" ${S.prefs.goalOnScreen ? 'checked' : ''}> Meta no ecrã</label>
        <label class="switch small"><input type="checkbox" id="fxToggle" data-studio="fx" ${STUDIO.fx ? 'checked' : ''}> Animações no ecrã</label>
        <label class="switch small"><input type="checkbox" id="clipToggle" data-studio="autoClip" ${STUDIO.autoClip ? 'checked' : ''}> Criar clip automaticamente</label>
        <label class="switch small"><input type="checkbox" id="rmToggle" data-studio="randomMoments" ${S.prefs.randomMoments ? 'checked' : ''}> Momentos aleatórios</label>
      </div>
      <div class="live-stats">
        <div class="ls"><small>Pico</small><b data-live="peak">${fmt(L.peak)}</b></div>
        <div class="ls"><small>Novos seguidores</small><b class="up" data-live="followers">+${fmt(L.followers)}</b></div>
        <div class="ls"><small>Gostos</small><b data-live="likes">${fmt(L.likes)}</b></div>
        <div class="ls"><small>Moedas virtuais</small><b data-live="gifts">${fmt(L.gifts)}</b></div>
        <div class="ls"><small>Reações ao jogo</small><b data-live="reactions">${L.reactions}</b></div>
        <div class="ls"><small>Mensagens</small><b data-live="msgs">${fmt(L.msgs)}</b></div>
        <div class="ls"><small>Interação</small><b data-live="engage">${Math.round(L.engage * 100)}%</b></div>
        <div class="ls"><small>Modo</small><b>${esc(MODES[L.mode].name)}</b></div>
      </div>
      <div class="goal-row"><span class="small">Meta: <b>${dots(lvl.max)}</b> espectadores virtuais</span><div class="goal-bar"><i data-live="goal" style="width:${Math.min(100, L.peak / lvl.max * 100)}%"></i></div><b class="num small" data-live="goalpct">${Math.min(100, Math.round(L.peak / lvl.max * 100))}%</b></div>
      <section class="card panel" style="margin-top:16px"><h3 class="panel-title">${icon('mic', 'style="width:18px"')} Microfone e som<small>${soundPanelHTML()}</small></h3>${micPanelHTML()}${immersivePanelHTML()}</section>
      <section class="card react-panel">
        <h2>O que acabou de acontecer?</h2>
        <p class="small muted" style="margin:4px 0 0">Escolhe o acontecimento no jogo. A audiência fictícia de ${esc(G.name)} reage de acordo.</p>
        <div class="react-grid">${PANEL_BUTTONS.map(([id, e, l]) => `<button class="rbtn" data-act="${id === 'custom' ? 'react-custom-focus' : 'react'}" data-id="${id}"><span>${e}</span><span>${l}</span></button>`).join('')}</div>
        <form class="reply-form" data-form="react-custom" style="margin-top:10px"><input class="input" id="customReact" name="t" maxlength="120" placeholder="Ex.: Acabei de ganhar um clutch 1 contra 4!" value="${esc(STUDIO.custom)}" autocomplete="off"><button class="btn btn-primary">✍️ Reagir</button></form>
        <button class="btn btn-sm btn-ghost" data-act="react-more" style="margin-top:8px">${STUDIO.showMore ? 'Esconder' : 'Mais acontecimentos'} (${Object.keys(REACT_ITEMS).length})</button>
        ${STUDIO.showMore ? `<div class="react-more">${REACT_CATS.map(c => `<div class="react-cat">${c.icon} ${esc(c.name)}</div>${c.items.map(([id, l]) => `<button data-act="react" data-id="${id}">${l}</button>`).join('')}`).join('')}</div>` : ''}
      </section>
      <section class="card panel" style="margin-top:16px"><h3 class="panel-title">📊 Sondagem e comunidade</h3>
        <div id="pollBox">${pollBoxHTML()}</div>
        <div class="row" style="margin-top:10px"><button class="btn btn-sm" data-act="raid">${icon('users')} Simular raid</button><button class="btn btn-sm" data-act="gift-sim">🎁 Simular presente</button></div>
      </section>
      <section class="card panel" style="margin-top:16px"><h3 class="panel-title">${icon('target', 'style="width:18px"')} Meta de presentes</h3>${goalPanelHTML()}</section>
      <section class="card panel" style="margin-top:16px"><h3 class="panel-title">${icon('clock', 'style="width:18px"')} Cronologia da live</h3>
        <div class="timeline" id="timeline">${L.timeline.map(tlHTML).join('')}</div>
      </section>
      <section class="card panel" style="margin-top:16px"><h3 class="panel-title">${icon('shield', 'style="width:18px"')} Moderação</h3>${modPanelHTML()}</section>
      </div>
    </div>
    <aside class="studio-chat" aria-label="Chat da live">
      <section class="card chat"><div class="chat-head"><span class="tw-chead-t">Chat da transmissão</span>${SIM('fictício')}<span class="spacer"></span><span class="small muted num chat-vw">${icon('person')} <span data-live="viewers">${fmt(L.viewers)}</span></span></div>
        <div class="lb" data-slb>${leaderboardHTML(L.gifters)}</div>
        <div class="chat-badges" id="chatBadges">${chatBadgesHTML()}</div><div id="chatPinnedBox">${pinnedHTML()}</div>
        <div class="chat-list" id="chatList" data-chatlist="main">${L.chat.map(chatMsgHTML).join('')}</div>
        <button class="more-pill" data-act="chat-bottom" hidden>Mais mensagens abaixo</button>
        ${chatInputHTML('chatInput', 'chat', false)}
      </section>
    </aside>
  </div>`;
}
function afterStudioRender() { $$('[data-chatlist]').forEach(l => l.scrollTop = l.scrollHeight); drawSpark(); attachMedia(); }
function pollBoxHTML() {
  const P = S.live?.poll;
  if (P && !P.done) {
    const tot = P.options.reduce((s, o) => s + o.v, 0) || 1;
    return `<div class="poll-live"><strong>${esc(P.q)}</strong><div class="poll" id="pollBars">${P.options.map(o => `<div class="poll-opt"><i style="width:${(o.v / tot * 100).toFixed(1)}%"></i><span>${esc(o.t)}</span><b class="num">${dots(o.v)}</b></div>`).join('')}</div><div class="row" style="margin-top:8px"><span class="tiny muted">Termina em <span data-live="polltime">${Math.max(0, Math.ceil((P.ends - Date.now()) / 1000))}</span> s · votos fictícios</span><span class="spacer"></span><button class="btn btn-xs" data-act="poll-end">Terminar agora</button></div></div>`;
  }
  const last = P && P.done ? `<p class="small muted" style="margin:0 0 8px">Última sondagem: «${esc(P.q)}» — venceu «${esc([...P.options].sort((a, b) => b.v - a.v)[0].t)}».</p>` : '';
  return `${last}<form data-form="live-poll" class="stack" style="gap:8px"><input class="input" id="lpQ" name="q" maxlength="80" placeholder="Pergunta (ex.: Que arma uso a seguir?)" required><div class="grid-2"><input class="input" id="lpA" name="a" maxlength="40" placeholder="Opção 1" required><input class="input" id="lpB" name="b" maxlength="40" placeholder="Opção 2" required><input class="input" id="lpC" name="c" maxlength="40" placeholder="Opção 3 (opcional)"><input class="input" id="lpD" name="d" maxlength="40" placeholder="Opção 4 (opcional)"></div><button class="btn btn-sm btn-primary" style="align-self:flex-start">Iniciar sondagem (30 s)</button></form>`;
}
function renderPollBox() { const b = $('#pollBox'); if (b) b.innerHTML = pollBoxHTML(); }

function updateLiveBits() {
  const L = S.live; if (!L) return;
  liveCounters(L);
  const lvl = LEVELS[L.level] || LEVELS.media;
  const set = (k, v) => $$(`[data-live="${k}"]`).forEach(n => { n.textContent = v; });
  set('viewers', fmt(L.viewers)); set('peak', fmt(L.peak)); set('followers', '+' + fmt(L.followers)); set('likes', fmt(L.likes));
  set('gifts', fmt(L.gifts)); set('reactions', L.reactions); set('msgs', fmt(L.msgs)); set('engage', Math.round(L.engage * 100) + '%');
  set('time', durLabel(Date.now() - L.start)); set('goalpct', Math.min(100, Math.round(L.peak / lvl.max * 100)) + '%');
  const g = $('[data-live="goal"]'); if (g) g.style.width = Math.min(100, L.peak / lvl.max * 100) + '%';
  if (L.poll && !L.poll.done) {
    set('polltime', Math.max(0, Math.ceil((L.poll.ends - Date.now()) / 1000)));
    const bars = $('#pollBars'); if (bars) { const tot = L.poll.options.reduce((s, o) => s + o.v, 0) || 1; [...bars.children].forEach((el, i) => { el.querySelector('i').style.width = (L.poll.options[i].v / tot * 100).toFixed(1) + '%'; el.querySelector('b').textContent = dots(L.poll.options[i].v); }); }
  }
  if (L.eventId) $$(`[data-watchers="${L.eventId}"]`).forEach(n => n.textContent = fmt(L.viewers));
  $$('[data-me="followers"]').forEach(n => n.textContent = fmt(S.me.followers));
}

function studioSetupOld() {
  const mineEvents = S.events.filter(e => e.owner === 'me' && ['scheduled', 'soon'].includes(eventStatus(e))).sort((a, b) => a.start - b.start);
  const st = STUDIO.setup || (STUDIO.setup = { title: '', game: S.me.games[0] || 'fortnite', mode: 'casual', level: 'media', eventId: '' });
  const summary = STUDIO.summary && S.lives.find(l => l.id === STUDIO.summary);
  return `${soonBanner(mineEvents.filter(e => eventStatus(e) === 'soon'))}
  <div class="page-head"><div><h1>Estúdio de live</h1><p>Prepara a tua live simulada. Podes começar já ou a partir de um evento agendado.</p></div></div>
  ${summary ? liveSummary(summary) : ''}
  <section class="card setup">
    <h2>Nova live</h2><p class="muted small" style="margin:0 0 14px">Escolhe o jogo, o modo e a audiência virtual que queres simular.</p>
    <form data-form="go-live" class="stack">
      ${mineEvents.length ? `<label class="field"><span>A partir de um evento</span><select class="input" name="eventId" id="glEvent" data-setup="eventId"><option value="">Live sem evento</option>${mineEvents.map(e => `<option value="${e.id}" ${st.eventId === e.id ? 'selected' : ''}>${esc(e.title)} · ${whenLabel(e.start)}</option>`).join('')}</select></label>` : ''}
      <label class="field"><span>Título</span><input class="input" name="title" id="glTitle" data-setup="title" maxlength="80" placeholder="Ex.: Ranked com o chat" value="${esc(st.title)}"></label>
      ${setupMediaHTML()}
      <div class="grid-3">
        <label class="field"><span>Jogo</span><select class="input" name="game" id="glGame" data-setup="game">${Object.entries(GAMES).map(([k, g]) => `<option value="${k}" ${st.game === k ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Modo</span><select class="input" name="mode" id="glMode" data-setup="mode">${Object.entries(MODES).map(([k, m]) => `<option value="${k}" ${st.mode === k ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Audiência virtual</span><select class="input" name="level" id="glLevel" data-setup="level">${Object.entries(LEVELS).map(([k, l]) => `<option value="${k}" ${st.level === k ? 'selected' : ''}>${esc(l.name)} · até ${dots(l.max)}</option>`).join('')}</select></label>
      </div>
      <div class="row"><button class="btn btn-live">${icon('studio')} Entrar em direto agora</button><button type="button" class="btn" data-act="new-event">${icon('calendar')} Agendar para outra hora</button><span class="small muted">Os espectadores e o chat são simulados.</span></div>
    </form>
  </section>
  <div class="grid-2" style="margin-top:16px;align-items:start">
    <section class="card panel"><h3 class="panel-title">${icon('mic', 'style="width:18px"')} Microfone e som<small>${soundPanelHTML()}</small></h3>${micPanelHTML()}</section>
    <section class="card panel"><h3 class="panel-title">${icon('target', 'style="width:18px"')} Meta de presentes</h3>${goalPanelHTML()}</section>
  </div>
  <section class="card panel" style="margin-top:16px"><h3 class="panel-title">${icon('shield', 'style="width:18px"')} Moderação do chat</h3>${modPanelHTML()}</section>
  <h3 style="margin:22px 0 10px;font-size:20px">Lives anteriores</h3>
  <div class="stack">${S.lives.length ? [...S.lives].sort((a, b) => b.start - a.start).map(l => `${pastLive(l)}`).join('') : '<div class="empty"><b>Ainda sem lives</b></div>'}</div>`;
}
function liveSummary(l) {
  return `<section class="card setup" style="margin-bottom:16px;border-color:color-mix(in oklab,var(--accent) 50%,transparent)">
    <div class="row"><h2 style="flex:1">Resumo: ${esc(l.title)}</h2>${SIM('valores fictícios')}<button class="icon-btn" data-act="summary-close" aria-label="Fechar resumo">${icon('close')}</button></div>
    <div class="summary-grid">
      <div class="ls"><small>Pico</small><b>${fmt(l.peak)}</b></div><div class="ls"><small>Visualizações</small><b>${fmt(l.views)}</b></div>
      <div class="ls"><small>Novos seguidores</small><b class="up">+${fmt(l.followers)}</b></div><div class="ls"><small>Moedas virtuais</small><b>${fmt(l.gifts)}</b></div>
    </div>
    <div class="row"><button class="btn btn-primary" data-act="share-recap" data-id="${l.id}">${icon('share')} Partilhar resumo no feed</button><span class="small muted">${durLabel(l.end - l.start)} · ${l.reactions} reações · ${(l.clips || []).length} clips</span></div>
    <h3 style="margin:16px 0 6px;font-size:16px">Cronologia</h3>
    <div class="timeline">${(l.timeline || []).map(it => `<div class="tl"><span class="ico">${it.icon}</span><div>${esc(it.label)}<br><time>${durLabel(it.t - l.start)}</time> ${it.clipId ? '<span class="clipped">✓ Clip criado</span>' : ''}</div>${it.clipId || it.type === 'end' ? '' : `<button class="btn btn-xs" data-act="tl-clip" data-id="${it.id}">${icon('clip')} Criar clip</button>`}</div>`).join('')}</div>
  </section>`;
}

/* ---------- Assistir a lives de outras contas (simulado) ---------- */
function openWatch(evId) {
  const ev = S.events.find(e => e.id === evId); if (!ev) return;
  const a = acc(ev.owner), G = GAMES[ev.game] || GAMES.chat;
  openModal(`<div class="modal-head"><span class="pill-live">EM DIRETO</span><h2>${esc(ev.title)}</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
    <div class="watch"><div><div class="screen" style="--gc:${G.color}"><div class="screen-bg"></div><div class="screen-floor"></div><div class="screen-center"><div><div class="big">${esc(G.glyph.length > 3 ? G.glyph : G.name.toUpperCase())}</div><small>Live simulada de ${esc(a.name)}</small></div></div>
      <div class="hud"><span class="pill-live">LIVE</span><span class="glass">👀 <span class="num" id="wViewers">${fmt(ev.viewers || 1000)}</span></span><span class="sim-tag" style="margin-left:auto">Fictício</span></div></div>
      <div class="row" style="padding:12px 16px">${avatar(a, 40)}<div style="flex:1;min-width:0"><strong>${esc(a.name)}</strong>${a.verified ? VERIFIED : ''}<br><span class="small muted">${esc(G.name)} · Modo ${esc(MODES[ev.mode].name)}</span></div><button class="btn btn-sm ${a.followed ? '' : 'btn-primary'}" data-act="follow" data-id="${a.id}">${a.followed ? 'A seguir' : 'Seguir'}</button></div></div>
    <section class="chat"><div class="chat-head"><strong>Chat</strong>${SIM()}</div><div class="chat-list" id="wChat"></div>
      <form class="chat-form" data-form="watch-chat"><input class="input" id="wInput" name="t" maxlength="200" placeholder="Escreve no chat…" autocomplete="off"><button class="btn btn-sm btn-primary">Enviar</button></form></section></div>`, true);
  clearInterval(watchTimer);
  const ctx = { gameName: G.name, viewers: ev.viewers || 1000, goal: LEVELS[ev.level].max };
  watchTimer = setInterval(() => {
    const box = $('#wChat'); if (!box) { clearInterval(watchTimer); return; }
    ev.viewers = Math.round((ev.viewers || 1000) * rand(.995, 1.007));
    const v = $('#wViewers'); if (v) v.textContent = fmt(ev.viewers);
    ctx.viewers = ev.viewers;
    const pool = Math.random() < .25 ? moodPool(ev.game, pick(['amazing', 'funny', 'win', 'scary'])) : AMBIENT;
    box.insertAdjacentHTML('beforeend', chatMsgHTML({ user: fakeUser(), text: fill(pick(pool), ctx), color: pick(NAME_COLORS) }));
    while (box.children.length > 60) box.firstElementChild.remove();
    box.scrollTop = box.scrollHeight;
  }, 700);
}
