// Malta — núcleo do cliente: conta, lobby, loja, amigos, sala, chat, reações e emotes.
const { CATALOG, findItem, levelFor, xpForLevel } = window.Catalog;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';

let token = safeGet('malta.token');
let me = null;
let socket = null;
let roomState = null;

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} }

async function api(path, body) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro');
  if (data.me) setMe(data.me);
  return data;
}

function show(id) { document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('hidden', s.id !== id)); }
const inLobby = () => !$('#screen-lobby').classList.contains('hidden');
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('hidden'), 3000); }
function modal(html) { $('#modal-card').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); window.onModalClose?.(); window.onModalClose = null; }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });
const owns = (id) => { const it = findItem(id); return !!it && (it.price === 0 || (me.vip && it.slot === 'reaction') || me.owned.includes(id)); };

// ---------------- Conta ----------------
let authMode = 'login';
$('#auth-tabs').addEventListener('click', (e) => {
  const m = e.target.dataset.mode; if (!m) return;
  authMode = m;
  $('#auth-tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
  $('#auth-form').classList.toggle('registering', m === 'register');
  $('#auth-submit').textContent = m === 'login' ? 'Entrar' : 'Criar conta';
  $('#auth-form').birthDate.required = m === 'register';
  $('#auth-form').rules.required = m === 'register';
});
$('#auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target; $('#auth-error').textContent = '';
  try {
    const body = { name: f.name.value, password: f.password.value };
    if (authMode === 'register') body.birthDate = f.birthDate.value;
    const res = await fetch('/api/' + authMode, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    token = data.token; safeSet('malta.token', token);
    setMe(data.me); enterLobby();
  } catch (err) { $('#auth-error').textContent = err.message; }
});
$('#logout').addEventListener('click', () => { safeSet('malta.token', null); token = null; socket?.disconnect(); socket = null; show('screen-auth'); });

function setMe(m) {
  const prevInbox = me?.inbox?.length || 0;
  me = m;
  $('#coins').textContent = me.coins; $('#coins-room').textContent = me.coins;
  $('#me-name').textContent = me.name;
  $('#me-avatar').innerHTML = renderAvatar(me.avatar, 84);
  $('#me-vip').classList.toggle('hidden', !me.vip);
  const lo = xpForLevel(me.level), hi = xpForLevel(me.level + 1);
  $('#me-level').textContent = me.level;
  $('#me-xpbar').style.width = ((me.xp - lo) / (hi - lo)) * 100 + '%';
  $('#me-xp').textContent = `${me.xp - lo}/${hi - lo} XP`;
  $('#me-badges').innerHTML = Object.entries(CATALOG.badges).map(([id, b]) => `<span class="bdg ${me.badges.includes(id) ? '' : 'off'}" title="${esc(b.name)} — ${esc(b.desc)}">${b.icon}</span>`).join('');
  $('#daily-btn').disabled = !me.canClaimDaily;
  $('#daily-btn').textContent = me.canClaimDaily ? '🎁 Bónus diário (+50)' : '🎁 Volta amanhã';
  $('#inbox-dot').classList.toggle('hidden', !me.inbox.length);
  $('#blocked-box').classList.toggle('hidden', !me.blocked.length);
  $('#blocked').innerHTML = me.blocked.map((n) => `<li>${esc(n)}<span class="spacer"></span><button class="btn small ghost" data-unblock="${esc(n)}">Desbloquear</button></li>`).join('');
  renderReactionBar(); renderEmotePop();
  if (inLobby()) renderShop();
  if (me.inbox.length > prevInbox && inLobby()) showInbox();
}

// ---------------- Lobby ----------------
function enterLobby() {
  show('screen-lobby'); renderShop(); loadFriends(); connectSocket();
  const fromUrl = new URLSearchParams(location.search).get('sala');
  if (fromUrl) joinRoom(fromUrl);
  else if (me.inbox.length) showInbox();
}
function backToLobby() { show('screen-lobby'); renderShop(); loadFriends(); }
$('#daily-btn').addEventListener('click', async () => { try { const r = await api('/api/daily', {}); toast(`+${r.gained} 🪙`); } catch (e) { toast(e.message); } });
$('#coins-btn').addEventListener('click', () => { shopTab = 'coins'; renderShop(); $('#shop').scrollIntoView({ behavior: 'smooth' }); });
$('#join-form').addEventListener('submit', (e) => { e.preventDefault(); joinRoom($('#room-code').value); });
$('#new-room').addEventListener('click', () => joinRoom(''));
$('#house-btn').addEventListener('click', () => joinRoom(me.houseCode));
$('#friend-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try { await api('/api/friends', { name: $('#friend-name').value }); $('#friend-name').value = ''; loadFriends(); toast('Amigo adicionado!'); } catch (err) { toast(err.message); }
});
async function loadFriends() {
  try {
    const [{ friends }, { list }] = await Promise.all([api('/api/friends/online'), api('/api/leaderboard')]);
    $('#friends').innerHTML = friends.length ? friends.map((f) => `<li>
      ${renderAvatar(f.avatar, 34)}<span class="dot ${f.online ? 'on' : ''}"></span>
      <span class="grow"><b>${esc(f.name)}</b> <small class="muted">nv ${f.level}</small>${f.streak ? ` <span class="streak" title="Dias seguidos juntos">🔥${f.streak}</span>` : ''}</span>
      ${f.room ? `<button class="btn small primary" data-room="${esc(f.room)}">Juntar</button>` : ''}
      <button class="btn small ghost" data-gift="${esc(f.name)}" title="Oferecer prenda">🎁</button>
      <button class="btn small ghost" data-more="${esc(f.name)}" title="Mais">⋯</button></li>`).join('')
      : '<li class="muted">Ainda não tens amigos aqui. Adiciona-os pelo nome!</li>';
    $('#leaderboard').innerHTML = list.map((x, i) => `<li class="${x.me ? 'me' : ''}"><span class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</span>${renderAvatar(x.avatar, 28)}<b class="grow">${esc(x.name)}</b><small>nv ${x.level} · ${x.xp} XP</small></li>`).join('');
  } catch {}
}
$('#friends').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.room) joinRoom(b.dataset.room);
  if (b.dataset.gift) giftModal(b.dataset.gift);
  if (b.dataset.more) {
    const n = b.dataset.more;
    modal(`<h3>${esc(n)}</h3><button class="btn" id="m-remove">Remover dos amigos</button><button class="btn" id="m-block">🚫 Bloquear</button><button class="btn ghost" data-close>Fechar</button>`);
    $('#m-remove').onclick = async () => { await api('/api/friends/remove', { name: n }); closeModal(); loadFriends(); };
    $('#m-block').onclick = () => { closeModal(); blockUser(n); };
  }
});
$('#blocked').addEventListener('click', async (e) => { const n = e.target.dataset.unblock; if (n) { await api('/api/block', { name: n }); toast(`${n} desbloqueado`); } });
setInterval(() => { if (inLobby() && me) loadFriends(); }, 10000);

async function blockUser(name) {
  try {
    const r = await api('/api/block', { name });
    toast(r.blocked ? `${name} foi bloqueado. Não vais ver mensagens nem reações dele/a.` : `${name} desbloqueado`);
    loadFriends(); renderPeople();
  } catch (e) { toast(e.message); }
}

// ---- Presentes ----
function giftModal(to) {
  const shopItems = [...CATALOG.emotes, ...CATALOG.reactions, ...CATALOG.decor, ...CATALOG.themes, ...Object.values(CATALOG.avatar).flat()].filter((i) => i.price > 0);
  modal(`<h3>🎁 Prenda para ${esc(to)}</h3>
    <div class="tabs" id="gift-tabs"><button class="active" data-g="coins">Moedas</button><button data-g="item">Item</button></div>
    <div id="gift-coins" class="row">${[50, 100, 250, 500].map((n) => `<button class="btn" data-coins="${n}">${n} 🪙</button>`).join('')}</div>
    <select id="gift-item" class="hidden">${shopItems.map((i) => `<option value="${i.id}">${esc(i.value?.startsWith?.('#') || i.value?.length > 4 ? '' : i.value)} ${esc(i.name || i.id)} — ${i.price} 🪙</option>`).join('')}</select>
    <input id="gift-note" placeholder="Mensagem (opcional)" maxlength="120" />
    <div class="row"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="gift-send">Oferecer</button></div>`);
  let mode = 'coins', coins = 100;
  const sel = () => $('#gift-coins').querySelectorAll('button').forEach((b) => b.classList.toggle('primary', +b.dataset.coins === coins));
  sel();
  $('#gift-coins').onclick = (e) => { if (e.target.dataset.coins) { coins = +e.target.dataset.coins; sel(); } };
  $('#gift-tabs').onclick = (e) => {
    const g = e.target.dataset.g; if (!g) return; mode = g;
    $('#gift-tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.g === g));
    $('#gift-coins').classList.toggle('hidden', g !== 'coins'); $('#gift-item').classList.toggle('hidden', g !== 'item');
  };
  $('#gift-send').onclick = async () => {
    try {
      await api('/api/gift', { to, note: $('#gift-note').value, ...(mode === 'coins' ? { coins } : { itemId: $('#gift-item').value }) });
      closeModal(); toast(`Prenda enviada a ${to}! 🎁`);
    } catch (e) { toast(e.message); }
  };
}
function giftLabel(g) {
  if (g.coins) return `${g.coins} 🪙`;
  const it = findItem(g.itemId); return it ? `${it.value && !it.value.startsWith('#') && it.value.length <= 4 ? it.value + ' ' : ''}${it.name || it.id}` : 'um item';
}
function showInbox() {
  if (!me.inbox.length) return modal('<h3>🎁 Prendas</h3><p class="muted">Ainda não recebeste prendas novas.</p><button class="btn" data-close>Fechar</button>');
  modal(`<h3>🎁 Recebeste prendas!</h3><ul class="friends">${me.inbox.map((g) => `<li><span class="big-emoji">🎁</span><span class="grow"><b>${esc(g.from)}</b> ofereceu-te <b>${esc(giftLabel(g))}</b>${g.note ? `<br><i>«${esc(g.note)}»</i>` : ''}</span></li>`).join('')}</ul><button class="btn primary" data-close>Obrigado!</button>`);
  window.onModalClose = () => api('/api/inbox/seen', {}).catch(() => {});
}
$('#inbox-btn').addEventListener('click', showInbox);

// ---------------- Loja ----------------
let shopTab = 'avatar';
let draft = null;
const SLOT_NAMES = { skin: 'Pele', hair: 'Cabelo', hairColor: 'Cor do cabelo', eyes: 'Olhos', accessory: 'Acessório', outfit: 'Roupa', bg: 'Fundo' };
$('#shop-tabs').addEventListener('click', (e) => { const t = e.target.dataset.tab; if (t) { shopTab = t; renderShop(); } });
const buyBtn = (it) => (owns(it.id) ? '<span class="ok">✓ Tens</span>' : `<button class="btn small primary" data-buy="${it.id}">${it.price} 🪙</button>`);
const card = (big, it, extra = '') => `<div class="shop-card"><div class="big">${big}</div><div>${esc(it.name || '')}</div>${extra}${buyBtn(it)}</div>`;

function renderShop() {
  $('#shop-tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.tab === shopTab));
  const el = $('#shop');
  if (shopTab === 'avatar') {
    draft = draft || { ...me.avatar };
    const dirty = JSON.stringify(draft) !== JSON.stringify(me.avatar);
    const locked = Object.values(draft).filter((id) => !owns(id));
    el.innerHTML = `<div class="editor">
      <div class="preview">${renderAvatar(draft, 180)}
        ${locked.length ? `<button class="btn primary" id="buy-draft">Comprar tudo · ${locked.reduce((s, id) => s + findItem(id).price, 0)} 🪙</button>` : `<button class="btn primary" id="save-avatar" ${dirty ? '' : 'disabled'}>Guardar avatar</button>`}
        ${dirty ? '<button class="btn small ghost" id="reset-avatar">Desfazer</button>' : ''}
      </div>
      <div>${Object.entries(CATALOG.avatar).map(([slot, items]) => `<div class="slot"><h4>${SLOT_NAMES[slot]}</h4><div class="items">
        ${items.map((it) => `<button class="item ${draft[slot] === it.id ? 'sel' : ''} ${owns(it.id) ? '' : 'locked'}" data-slot="${slot}" data-id="${it.id}" title="${esc(it.name || '')}">
          ${it.value.startsWith('#') ? `<span class="sw" style="background:${it.value}"></span>` : ''}${it.name ? `<span>${esc(it.name)}</span>` : ''}${owns(it.id) ? '' : `<span class="price">${it.price}🪙</span>`}
        </button>`).join('')}</div></div>`).join('')}
      </div></div>`;
    el.querySelectorAll('.item').forEach((b) => b.addEventListener('click', () => { draft[b.dataset.slot] = b.dataset.id; renderShop(); }));
    $('#save-avatar')?.addEventListener('click', async () => { try { await api('/api/avatar', { avatar: draft }); draft = null; toast('Avatar guardado ✨'); } catch (e) { toast(e.message); } });
    $('#reset-avatar')?.addEventListener('click', () => { draft = null; renderShop(); });
    $('#buy-draft')?.addEventListener('click', async () => {
      try { for (const id of locked) await api('/api/buy', { itemId: id }); await api('/api/avatar', { avatar: draft }); draft = null; toast('Comprado e guardado! ✨'); }
      catch (e) { toast(e.message); if (/insuficientes/.test(e.message)) { shopTab = 'coins'; renderShop(); } }
    });
  } else if (shopTab === 'emotes') {
    el.innerHTML = `<p class="muted">Os emotes animam o teu avatar na sala para toda a gente ver.</p><div class="grid-shop">${CATALOG.emotes.map((it) =>
      card(`<div class="emote-demo anim-${it.anim}">${renderAvatar(me.avatar, 64)}</div>`, it, `<div>${it.value}</div>`)).join('')}</div>`;
  } else if (shopTab === 'reactions' || shopTab === 'extras') {
    const list = shopTab === 'reactions' ? CATALOG.reactions : CATALOG.extras;
    el.innerHTML = `<div class="grid-shop">${list.map((it) => card(it.value || (it.id === 'x_bigReact' ? '🔍' : '✨'), it)).join('')}</div>`;
  } else if (shopTab === 'house') {
    const h = me.house;
    el.innerHTML = `<p class="muted">A tua casa é uma sala só tua (código <b>${me.houseCode}</b>). Escolhe o tema e até 8 decorações — quem lá entrar vê-as.</p>
      <label class="check"><input type="checkbox" id="house-fo" ${h.friendsOnly ? 'checked' : ''}/> Só os meus amigos podem entrar</label>
      <h4>Temas</h4><div class="grid-shop">${CATALOG.themes.map((t) => `<div class="shop-card ${h.theme === t.id ? 'selected' : ''}"><div class="theme-sw" style="background:${t.value}"></div><div>${esc(t.name)}</div>
        ${owns(t.id) ? (h.theme === t.id ? '<span class="ok">✓ Em uso</span>' : `<button class="btn small" data-theme="${t.id}">Usar</button>`) : buyBtn(t)}</div>`).join('')}</div>
      <h4>Decoração (${h.decor.length}/8)</h4><div class="grid-shop">${CATALOG.decor.map((d) => `<div class="shop-card ${h.decor.includes(d.id) ? 'selected' : ''}"><div class="big">${d.value}</div><div>${esc(d.name)}</div>
        ${owns(d.id) ? `<button class="btn small" data-decor="${d.id}">${h.decor.includes(d.id) ? 'Tirar' : 'Pôr'}</button>` : buyBtn(d)}</div>`).join('')}</div>`;
    el.querySelectorAll('[data-theme]').forEach((b) => b.addEventListener('click', () => api('/api/house', { theme: b.dataset.theme }).catch((e) => toast(e.message))));
    el.querySelectorAll('[data-decor]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.decor; const d = h.decor.includes(id) ? h.decor.filter((x) => x !== id) : [...h.decor, id];
      api('/api/house', { decor: d }).catch((e) => toast(e.message));
    }));
    $('#house-fo').addEventListener('change', (e) => api('/api/house', { friendsOnly: e.target.checked }));
  } else {
    el.innerHTML = `<div class="grid-shop">
      ${CATALOG.coinPacks.map((p) => `<div class="shop-card">${p.tag ? `<span class="tagline">${p.tag}</span>` : ''}<div class="big">🪙</div><b>${p.coins} moedas</b><button class="btn primary" data-pack="${p.id}">${eur(p.eur)}</button></div>`).join('')}
      <div class="shop-card span2"><span class="badge vip">${CATALOG.vip.name}</span><ul class="perks">${CATALOG.vip.perks.map((x) => `<li>${x}</li>`).join('')}</ul>
        ${me.vip ? '<span class="ok">✓ És Malta+</span>' : `<button class="btn primary" data-pack="vip">${eur(CATALOG.vip.eur)} / mês</button>`}</div>
    </div><p class="demo-note">⚠️ Modo demonstração: nenhum pagamento é cobrado. Para lançar a sério liga-se o Stripe / Apple Pay / Google Play (ver README).</p>`;
    el.querySelectorAll('[data-pack]').forEach((b) => b.addEventListener('click', () => checkout(b.dataset.pack)));
  }
  el.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => buyItem(b.dataset.buy)));
}
function buyItem(id) {
  const it = findItem(id);
  const label = it.value && !it.value.startsWith('#') && it.value.length <= 4 ? it.value + ' ' : '';
  modal(`<h3>Comprar ${esc(label)}${esc(it.name || '')}?</h3><p>Custa <b>${it.price} 🪙</b>. Tens ${me.coins} 🪙.</p>
    <div class="row"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="confirm-buy">Comprar</button></div>`);
  $('#confirm-buy').addEventListener('click', async () => {
    try { await api('/api/buy', { itemId: id }); closeModal(); toast('Comprado! 🎉'); }
    catch (e) { closeModal(); toast(/insuficientes/.test(e.message) ? 'Moedas insuficientes — compra mais na loja 🪙' : e.message); shopTab = 'coins'; }
  });
}
function checkout(packId) {
  const p = CATALOG.coinPacks.find((x) => x.id === packId);
  const label = p ? `${p.coins} moedas · ${eur(p.eur)}` : `${CATALOG.vip.name} · ${eur(CATALOG.vip.eur)}`;
  modal(`<h3>Pagamento</h3><p>${label}</p><p class="demo-note">Modo demo — não é cobrado nada.</p>
    <div class="row"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="pay">Pagar (demo)</button></div>`);
  $('#pay').addEventListener('click', async () => { try { await api('/api/coins/checkout', { packId }); closeModal(); toast('Obrigado! Moedas adicionadas 🪙'); } catch (e) { toast(e.message); } });
}

// ---------------- Tempo real ----------------
function connectSocket() {
  if (socket) return;
  socket = io({ auth: { token } });
  socket.on('connect_error', (e) => { if (e.message === 'auth') { safeSet('malta.token', null); location.reload(); } });
  socket.on('disconnect', (reason) => { if (reason === 'io server disconnect') { toast('A tua sessão terminou.'); setTimeout(() => location.reload(), 1500); } });
  socket.on('me', setMe);
  socket.on('toast', toast);
  socket.on('badge', (id) => { const b = CATALOG.badges[id]; if (b) celebrate(`${b.icon}`, `Novo emblema: ${b.name}`, b.desc); });
  socket.on('levelup', ({ level, coins }) => celebrate('⭐', `Subiste para o nível ${level}!`, `+${coins} 🪙 de prémio`));
  socket.on('gift', (g) => { toast(`🎁 ${g.from} ofereceu-te ${giftLabel(g)}!`); });
  socket.on('room', (st) => { roomState = st; renderRoomChrome(); renderPeople(); syncTiles(); });
  socket.on('kicked', () => { leaveRoom(true); backToLobby(); });
  socket.on('chat', addMessage);
  socket.on('react', floatReaction);
  socket.on('emote', playEmote);
  socket.on('yt', applyYt);
  socket.on('music', applyMusic);
  socket.on('game', renderGame);
  socket.on('game:draw', drawStroke);
  socket.on('game:clear', clearBoard);
  socket.on('peer-joined', ({ sid }) => ensurePeer(sid));
  socket.on('peer-left', ({ sid }) => dropPeer(sid));
  socket.on('signal', onSignal);
  socket.on('media-state', ({ sid, ...st }) => { mediaStates[sid] = st; syncTiles(); });
  socket.on('connect', () => { if (roomState) joinRoom(roomState.code); });
}
function celebrate(icon, title, sub) {
  for (let i = 0; i < 12; i++) setTimeout(() => floatReaction({ emoji: ['🎉', '✨', '⭐'][i % 3], from: '' }), i * 80);
  toast(`${icon} ${title} — ${sub}`);
}

function joinRoom(code) {
  connectSocket();
  socket.emit('join', code, (res) => {
    if (res.error) { toast(res.error); history.replaceState(null, '', location.pathname); return; }
    roomState = res.state;
    show('screen-room');
    history.replaceState(null, '', '?sala=' + res.code);
    $('#messages').innerHTML = '';
    for (const m of roomState.members) if (m.sid !== socket.id) ensurePeer(m.sid);
    renderRoomChrome(); renderPeople(); syncTiles(); renderReactionBar(); renderGame(null);
    applyYt(roomState.yt); applyMusic(roomState.music);
    startClipRecorder();
  });
}
function leaveRoom(already) {
  if (!already) socket?.emit('leave');
  roomState = null;
  for (const sid of Object.keys(peers)) dropPeer(sid);
  stopLocal(); applyYt({ videoId: null }); applyMusic({ current: null }); stopClipRecorder();
  document.body.style.removeProperty('--room-bg');
  history.replaceState(null, '', location.pathname);
}
$('#leave').addEventListener('click', () => { leaveRoom(); backToLobby(); });
$('#copy-code').addEventListener('click', () => {
  const link = location.origin + '/?sala=' + roomState.code;
  if (navigator.share) navigator.share({ title: 'Malta', text: 'Anda para a minha sala na Malta!', url: link }).catch(() => {});
  else navigator.clipboard?.writeText(link).then(() => toast('Link copiado — manda à malta!'), () => toast(link));
});

// ---- Aspeto da sala: tema, decoração, título ----
function renderRoomChrome() {
  if (!roomState) return;
  const t = CATALOG.themes.find((x) => x.id === roomState.theme) || CATALOG.themes[0];
  $('#screen-room').style.background = t.value;
  $('#room-title').textContent = roomState.isHouse ? `🏠 Casa de ${roomState.ownerName}` : `Sala ${roomState.code}`;
  $('#decor').innerHTML = (roomState.decor || []).map((id, i) => `<span style="animation-delay:${i * 0.3}s">${findItem(id)?.value || ''}</span>`).join('');
  $('#decor').classList.toggle('hidden', !roomState.decor?.length);
  $('#room-settings').classList.toggle('hidden', roomState.ownerId !== me.id);
}
$('#room-settings').addEventListener('click', () => {
  const s = roomState;
  modal(`<h3>⚙️ ${s.isHouse ? 'A tua casa' : 'Definições da sala'}</h3>
    <label class="check"><input type="checkbox" id="rs-fo" ${s.friendsOnly ? 'checked' : ''}/> 🔒 Só os meus amigos podem entrar</label>
    <h4>Tema</h4><div class="items">${CATALOG.themes.map((t) => `<button class="item ${s.theme === t.id ? 'sel' : ''} ${owns(t.id) ? '' : 'locked'}" data-theme="${t.id}"><span class="sw" style="background:${t.value}"></span>${esc(t.name)}</button>`).join('')}</div>
    <h4>Decoração</h4><div class="items">${CATALOG.decor.map((d) => `<button class="item ${s.decor.includes(d.id) ? 'sel' : ''} ${owns(d.id) ? '' : 'locked'}" data-decor="${d.id}">${d.value}</button>`).join('')}</div>
    <button class="btn" data-close>Fechar</button>`);
  $('#rs-fo').onchange = (e) => socket.emit('room:settings', { friendsOnly: e.target.checked });
  $('#modal-card').querySelectorAll('[data-theme]').forEach((b) => (b.onclick = () => {
    if (!owns(b.dataset.theme)) return buyItem(b.dataset.theme);
    socket.emit('room:settings', { theme: b.dataset.theme }); closeModal();
  }));
  $('#modal-card').querySelectorAll('[data-decor]').forEach((b) => (b.onclick = () => {
    const id = b.dataset.decor; if (!owns(id)) return buyItem(id);
    const d = s.decor.includes(id) ? s.decor.filter((x) => x !== id) : [...s.decor, id].slice(0, 8);
    socket.emit('room:settings', { decor: d }); closeModal();
  }));
});

// ---- Chat ----
$('#chat-form').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#chat-input').value; if (v.trim()) socket.emit('chat', v); $('#chat-input').value = ''; });
function addMessage(m) {
  const box = $('#messages');
  const div = document.createElement('div');
  if (m.system) { div.className = 'msg system'; div.textContent = m.text; }
  else {
    const cls = m.from.extras.includes('x_nameRainbow') ? 'rainbow' : m.from.extras.includes('x_nameGold') ? 'gold' : '';
    div.className = 'msg';
    div.innerHTML = `${renderAvatar(m.from.avatar, 30)}<div class="body"><div class="who ${cls}">${esc(m.from.name)} <small class="lvl">${m.from.level}</small>${m.from.vip ? ' <span class="badge vip">+</span>' : ''}</div>${esc(m.text)}</div>`;
  }
  const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
  box.appendChild(div);
  if (atBottom) box.scrollTop = box.scrollHeight;
  while (box.children.length > 200) box.firstChild.remove();
}

// ---- Reações ----
function renderReactionBar() {
  if (!me) return;
  $('#reaction-bar').innerHTML = CATALOG.reactions.map((r) => `<button data-r="${r.id}" class="${owns(r.id) ? '' : 'locked'}" title="${owns(r.id) ? '' : r.price + ' 🪙'}">${r.value}</button>`).join('');
}
$('#reaction-bar').addEventListener('click', (e) => {
  const id = e.target.closest('button')?.dataset.r; if (!id) return;
  if (!owns(id)) return buyItem(id);
  socket.emit('react', id);
});
const floaters = []; // também usado pelos clips
function floatReaction({ emoji, big, from }) {
  const el = document.createElement('div');
  const x = 10 + Math.random() * 75;
  el.className = 'floater' + (big ? ' big' : '');
  el.style.left = x + '%';
  el.innerHTML = `${emoji}${from ? `<small>${esc(from)}</small>` : ''}`;
  $('#float-layer').appendChild(el);
  floaters.push({ emoji, big, x: x / 100, t: performance.now() });
  setTimeout(() => el.remove(), 2700);
}

// ---- Emotes ----
function renderEmotePop() {
  if (!me) return;
  $('#emote-pop').innerHTML = CATALOG.emotes.map((e) => `<button data-e="${e.id}" class="${owns(e.id) ? '' : 'locked'}" title="${esc(e.name)}${owns(e.id) ? '' : ' · ' + e.price + ' 🪙'}">${e.value}<small>${esc(e.name)}</small></button>`).join('');
}
$('#btn-emotes').addEventListener('click', () => $('#emote-pop').classList.toggle('hidden'));
$('#emote-pop').addEventListener('click', (e) => {
  const id = e.target.closest('button')?.dataset.e; if (!id) return;
  $('#emote-pop').classList.add('hidden');
  if (!owns(id)) return buyItem(id);
  socket.emit('emote', id);
});
function playEmote({ sid, anim, emoji }) {
  const tile = document.querySelector(`.tile[data-sid="${sid}"]`); if (!tile) return;
  const layer = tile.querySelector('.emote-layer');
  const m = roomState.members.find((x) => x.sid === sid);
  layer.innerHTML = `<div class="anim-${anim}">${renderAvatar(m?.avatar, 110)}</div><span class="emote-emoji">${emoji}</span>`;
  layer.classList.remove('hidden');
  clearTimeout(layer._t); layer._t = setTimeout(() => layer.classList.add('hidden'), 2600);
  tile._emote = { anim, until: performance.now() + 2600 };
}

// ---- Pessoas: amigos, bloquear, denunciar, expulsar ----
function renderPeople() {
  if (!roomState || !socket) return;
  const owner = roomState.ownerId === me.id;
  $('#count').textContent = roomState.members.length;
  $('#people').innerHTML = roomState.members.map((m) => `<li>${renderAvatar(m.avatar, 34)}
    <span class="grow"><b>${esc(m.name)}</b> <small class="muted">nv ${m.level}</small> ${m.badges.map((b) => CATALOG.badges[b]?.icon || '').join('')}${m.vip ? ' <span class="badge vip">Malta+</span>' : ''}${m.userId === roomState.ownerId ? ' 👑' : ''}</span>
    ${m.sid === socket.id ? '<small>(tu)</small>' : `
      ${me.friends.includes(m.name) ? '' : `<button class="btn small ghost" data-add="${esc(m.name)}" title="Adicionar amigo">+👤</button>`}
      <button class="btn small ghost" data-act="${esc(m.name)}" data-sid="${m.sid}" title="Mais">⋯</button>`}</li>`).join('');
}
$('#people').addEventListener('click', async (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.add) { try { await api('/api/friends', { name: b.dataset.add }); toast(`${b.dataset.add} adicionado aos amigos`); renderPeople(); } catch (err) { toast(err.message); } }
  if (b.dataset.act) {
    const n = b.dataset.act, sid = b.dataset.sid;
    const owner = roomState.ownerId === me.id;
    modal(`<h3>${esc(n)}</h3>
      ${me.friends.includes(n) ? `<button class="btn" id="p-gift">🎁 Oferecer prenda</button>` : ''}
      <button class="btn" id="p-block">🚫 ${me.blocked.includes(n) ? 'Desbloquear' : 'Bloquear'}</button>
      <button class="btn" id="p-report">⚑ Denunciar</button>
      ${owner ? '<button class="btn" id="p-kick">👢 Expulsar da sala</button>' : ''}
      <button class="btn ghost" data-close>Fechar</button>`);
    $('#p-gift') && ($('#p-gift').onclick = () => giftModal(n));
    $('#p-block').onclick = () => { closeModal(); blockUser(n); };
    $('#p-kick') && ($('#p-kick').onclick = () => { socket.emit('kick', sid); closeModal(); });
    $('#p-report').onclick = () => reportModal(n);
  }
});
function reportModal(n) {
  modal(`<h3>Denunciar ${esc(n)}</h3>
    <select id="why-kind"><option>Assédio ou bullying</option><option>Linguagem de ódio</option><option>Conteúdo impróprio na câmara</option><option>Spam ou burla</option><option>Parece ter menos de 16 anos</option><option>Outro</option></select>
    <input id="why" placeholder="Conta-nos o que aconteceu (opcional)" maxlength="250" />
    <label class="check"><input type="checkbox" id="also-block" checked /> Bloquear também</label>
    <div class="row"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="send-rep">Enviar denúncia</button></div>`);
  $('#send-rep').onclick = async () => {
    await api('/api/report', { who: n, room: roomState?.code, why: `${$('#why-kind').value}: ${$('#why').value}` }).catch(() => {});
    const blockToo = $('#also-block').checked;
    closeModal(); toast('Obrigado. A equipa vai analisar — as mensagens recentes foram anexadas.');
    if (blockToo && !me.blocked.includes(n)) blockUser(n);
  };
}

// ---- Separadores laterais e de média ----
$('#side-tabs').addEventListener('click', (e) => {
  const t = e.target.closest('button')?.dataset.tab; if (!t) return;
  $('#side-tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
  ['chat', 'games', 'people'].forEach((p) => $('#panel-' + p).classList.toggle('hidden', p !== t));
});
$('#media-tabs').addEventListener('click', (e) => { const t = e.target.closest('button')?.dataset.media; if (t) showMediaTab(t); });
function showMediaTab(t) {
  $('#media-tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.media === t));
  $('#media-yt').classList.toggle('hidden', t !== 'yt'); $('#media-music').classList.toggle('hidden', t !== 'music');
}

// ---------------- Arranque ----------------
document.addEventListener('DOMContentLoaded', async () => {
  if (!token) return show('screen-auth');
  try { await api('/api/me'); enterLobby(); } catch { safeSet('malta.token', null); show('screen-auth'); }
});
