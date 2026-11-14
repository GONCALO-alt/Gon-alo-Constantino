// Malta — cliente
const { CATALOG, findItem } = window.Catalog;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('hidden'), 2600); }
function modal(html) { $('#modal-card').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.dataset.close != null) closeModal(); });

// ---------------- Conta ----------------
let authMode = 'login';
$('#auth-tabs').addEventListener('click', (e) => {
  const m = e.target.dataset.mode; if (!m) return;
  authMode = m;
  $('#auth-tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
  $('#auth-form').classList.toggle('registering', m === 'register');
  $('#auth-submit').textContent = m === 'login' ? 'Entrar' : 'Criar conta';
  $('#auth-form').birthDate.required = m === 'register';
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
  me = m;
  $('#coins').textContent = me.coins; $('#coins-room').textContent = me.coins;
  $('#me-name').textContent = me.name;
  $('#me-avatar').innerHTML = renderAvatar(me.avatar, 72);
  $('#me-vip').classList.toggle('hidden', !me.vip);
  $('#daily-btn').disabled = !me.canClaimDaily;
  $('#daily-btn').textContent = me.canClaimDaily ? '🎁 Bónus diário (+50)' : '🎁 Volta amanhã';
  renderReactionBar();
  if (!$('#screen-lobby').classList.contains('hidden')) renderShop();
}
const owns = (id) => { const it = findItem(id); return it && (it.price === 0 || (me.vip && it.slot === 'reaction') || me.owned.includes(id)); };

// ---------------- Lobby ----------------
function enterLobby() {
  show('screen-lobby'); renderShop(); loadFriends(); connectSocket();
  const fromUrl = new URLSearchParams(location.search).get('sala');
  if (fromUrl) joinRoom(fromUrl);
}
$('#daily-btn').addEventListener('click', async () => { try { const r = await api('/api/daily', {}); toast(`+${r.gained} 🪙`); } catch (e) { toast(e.message); } });
$('#coins-btn').addEventListener('click', () => { shopTab = 'coins'; renderShop(); $('#shop').scrollIntoView({ behavior: 'smooth' }); });
$('#join-form').addEventListener('submit', (e) => { e.preventDefault(); joinRoom($('#room-code').value); });
$('#new-room').addEventListener('click', () => joinRoom(''));
$('#friend-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try { await api('/api/friends', { name: $('#friend-name').value }); $('#friend-name').value = ''; loadFriends(); toast('Amigo adicionado!'); } catch (err) { toast(err.message); }
});
async function loadFriends() {
  try {
    const { friends } = await api('/api/friends/online');
    $('#friends').innerHTML = friends.length ? friends.map((f) => `<li><span class="dot ${f.online ? 'on' : ''}"></span>${esc(f.name)}<span class="spacer"></span>${f.room ? `<button class="btn small" data-room="${esc(f.room)}">Juntar-me</button>` : '<small style="color:var(--muted)">offline</small>'}</li>`).join('') : '<li style="color:var(--muted)">Ainda não tens amigos aqui. Adiciona-os pelo nome!</li>';
  } catch {}
}
$('#friends').addEventListener('click', (e) => { const r = e.target.dataset.room; if (r) joinRoom(r); });
setInterval(() => { if (!$('#screen-lobby').classList.contains('hidden')) loadFriends(); }, 10000);

// ---------------- Loja ----------------
let shopTab = 'avatar';
let draft = null;
const SLOT_NAMES = { skin: 'Pele', hair: 'Cabelo', hairColor: 'Cor do cabelo', eyes: 'Olhos', accessory: 'Acessório', outfit: 'Roupa', bg: 'Fundo' };
$('#shop-tabs').addEventListener('click', (e) => { const t = e.target.dataset.tab; if (t) { shopTab = t; renderShop(); } });

function renderShop() {
  $('#shop-tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.tab === shopTab));
  const el = $('#shop');
  if (shopTab === 'avatar') {
    draft = draft || { ...me.avatar };
    const dirty = JSON.stringify(draft) !== JSON.stringify(me.avatar);
    const lockedInDraft = Object.values(draft).filter((id) => !owns(id));
    el.innerHTML = `<div class="editor">
      <div style="display:grid;gap:10px;justify-items:center">${renderAvatar(draft, 180)}
        ${lockedInDraft.length ? `<button class="btn primary" id="buy-draft">Comprar tudo · ${lockedInDraft.reduce((s, id) => s + findItem(id).price, 0)} 🪙</button>` : `<button class="btn primary" id="save-avatar" ${dirty ? '' : 'disabled'}>Guardar avatar</button>`}
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
      try { for (const id of lockedInDraft) await api('/api/buy', { itemId: id }); await api('/api/avatar', { avatar: draft }); draft = null; toast('Comprado e guardado! ✨'); }
      catch (e) { toast(e.message); if (/insuficientes/.test(e.message)) { shopTab = 'coins'; renderShop(); } }
    });
  } else if (shopTab === 'reactions' || shopTab === 'extras') {
    const list = shopTab === 'reactions' ? CATALOG.reactions : CATALOG.extras;
    el.innerHTML = `<div class="grid-shop">${list.map((it) => `<div class="shop-card">
      <div class="big">${it.value || (it.id === 'x_bigReact' ? '🔍' : '✨')}</div>
      <div>${esc(it.name || '')}</div>
      ${owns(it.id) ? '<span style="color:var(--ok)">✓ Tens</span>' : `<button class="btn small primary" data-buy="${it.id}">${it.price} 🪙</button>`}
    </div>`).join('')}</div>`;
    el.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => buyItem(b.dataset.buy)));
  } else {
    el.innerHTML = `<div class="grid-shop">
      ${CATALOG.coinPacks.map((p) => `<div class="shop-card">${p.tag ? `<span class="tagline">${p.tag}</span>` : ''}<div class="big">🪙</div><b>${p.coins} moedas</b><button class="btn primary" data-pack="${p.id}">${p.eur.toFixed(2).replace('.', ',')} €</button></div>`).join('')}
      <div class="shop-card" style="grid-column:span 2"><span class="badge vip">${CATALOG.vip.name}</span><ul style="text-align:left;margin:0">${CATALOG.vip.perks.map((x) => `<li>${x}</li>`).join('')}</ul>
        ${me.vip ? '<span style="color:var(--ok)">✓ És Malta+</span>' : `<button class="btn primary" data-pack="vip">${CATALOG.vip.eur.toFixed(2).replace('.', ',')} € / mês</button>`}</div>
    </div><p class="demo-note">⚠️ Modo demonstração: nenhum pagamento é cobrado. Para lançar a sério liga-se o Stripe / Apple Pay / Google Play (ver README).</p>`;
    el.querySelectorAll('[data-pack]').forEach((b) => b.addEventListener('click', () => checkout(b.dataset.pack)));
  }
}
function buyItem(id) {
  const it = findItem(id);
  modal(`<h3>Comprar ${esc(it.value || '')} ${esc(it.name || '')}?</h3><p>Custa <b>${it.price} 🪙</b>. Tens ${me.coins} 🪙.</p>
    <div class="row"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="confirm-buy">Comprar</button></div>`);
  $('#confirm-buy').addEventListener('click', async () => {
    try { await api('/api/buy', { itemId: id }); closeModal(); toast('Comprado! 🎉'); }
    catch (e) { closeModal(); toast(/insuficientes/.test(e.message) ? 'Moedas insuficientes — compra mais na loja 🪙' : e.message); shopTab = 'coins'; }
  });
}
function checkout(packId) {
  const p = CATALOG.coinPacks.find((x) => x.id === packId);
  const label = p ? `${p.coins} moedas · ${p.eur.toFixed(2).replace('.', ',')} €` : `${CATALOG.vip.name} · ${CATALOG.vip.eur.toFixed(2).replace('.', ',')} €`;
  modal(`<h3>Pagamento</h3><p>${label}</p><p class="demo-note">Modo demo — não é cobrado nada.</p>
    <div class="row"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="pay">Pagar (demo)</button></div>`);
  $('#pay').addEventListener('click', async () => { try { await api('/api/coins/checkout', { packId }); closeModal(); toast('Obrigado! Moedas adicionadas 🪙'); } catch (e) { toast(e.message); } });
}

// ---------------- Tempo real ----------------
function connectSocket() {
  if (socket) return;
  socket = io({ auth: { token } });
  socket.on('connect_error', (e) => { if (e.message === 'auth') { safeSet('malta.token', null); location.reload(); } });
  socket.on('me', setMe);
  socket.on('toast', toast);
  socket.on('room', (st) => { roomState = st; renderPeople(); syncTiles(); });
  socket.on('chat', addMessage);
  socket.on('react', floatReaction);
  socket.on('yt', applyYt);
  socket.on('game', renderGame);
  socket.on('game:secret', (w) => { secretWord = w; renderGame(currentGame); });
  socket.on('game:draw', drawStroke);
  socket.on('game:clear', clearBoard);
  socket.on('peer-joined', ({ sid }) => ensurePeer(sid));
  socket.on('peer-left', ({ sid }) => dropPeer(sid));
  socket.on('signal', onSignal);
  socket.on('media-state', ({ sid, cam, mic }) => { mediaStates[sid] = { cam, mic }; syncTiles(); });
  socket.on('connect', () => { if (roomState) joinRoom(roomState.code); });
}

function joinRoom(code) {
  connectSocket();
  socket.emit('join', code, (res) => {
    if (res.error) return toast(res.error);
    roomState = res.state;
    show('screen-room');
    $('#room-code-label').textContent = res.code;
    history.replaceState(null, '', '?sala=' + res.code);
    $('#messages').innerHTML = '';
    for (const m of roomState.members) if (m.sid !== socket.id) ensurePeer(m.sid);
    renderPeople(); syncTiles(); renderReactionBar(); renderGame(roomState.game);
    if (roomState.yt.videoId) applyYt(roomState.yt);
  });
}
function leaveRoom() {
  socket?.emit('leave'); roomState = null;
  for (const sid of Object.keys(peers)) dropPeer(sid);
  stopLocal(); applyYt({ videoId: null });
  history.replaceState(null, '', location.pathname);
}
$('#leave').addEventListener('click', () => { leaveRoom(); show('screen-lobby'); renderShop(); loadFriends(); });
$('#copy-code').addEventListener('click', () => {
  const link = location.origin + '/?sala=' + roomState.code;
  navigator.clipboard?.writeText(link).then(() => toast('Link copiado — manda à malta!'), () => toast(link));
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
    div.innerHTML = `${renderAvatar(m.from.avatar, 30)}<div class="body"><div class="who ${cls}">${esc(m.from.name)}${m.from.vip ? ' <span class="badge vip">+</span>' : ''}</div>${esc(m.text)}</div>`;
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
function floatReaction({ emoji, big, from }) {
  const el = document.createElement('div');
  el.className = 'floater' + (big ? ' big' : '');
  el.style.left = 10 + Math.random() * 75 + '%';
  el.innerHTML = `${emoji}<small>${esc(from)}</small>`;
  $('#float-layer').appendChild(el);
  setTimeout(() => el.remove(), 2700);
}

// ---- Pessoas / denúncias ----
function renderPeople() {
  if (!roomState) return;
  $('#count').textContent = roomState.members.length;
  $('#people').innerHTML = roomState.members.map((m) => `<li>${renderAvatar(m.avatar, 34)}<b>${esc(m.name)}</b>${m.vip ? '<span class="badge vip">Malta+</span>' : ''}<span class="spacer"></span>
    ${m.sid !== socket.id ? `<button class="btn small ghost" data-add="${esc(m.name)}">+ Amigo</button><button class="btn small ghost" data-report="${esc(m.name)}" title="Denunciar">⚑</button>` : '<small>(tu)</small>'}</li>`).join('');
}
$('#people').addEventListener('click', async (e) => {
  const add = e.target.dataset.add, rep = e.target.dataset.report;
  if (add) { try { await api('/api/friends', { name: add }); toast(`${add} adicionado aos amigos`); } catch (err) { toast(err.message); } }
  if (rep) {
    modal(`<h3>Denunciar ${esc(rep)}</h3><input id="why" placeholder="O que aconteceu?" maxlength="300" /><div class="row"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="send-rep">Enviar</button></div>`);
    $('#send-rep').addEventListener('click', async () => { await api('/api/report', { who: rep, why: $('#why').value }); closeModal(); toast('Obrigado. A equipa vai ver.'); });
  }
});

// ---------------- Vídeochamada (WebRTC em malha) ----------------
const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const peers = {}; // sid -> { pc, stream, makingOffer, ignoreOffer }
const mediaStates = {};
let localStream = null;

function ensurePeer(sid) {
  if (peers[sid]) return peers[sid];
  const pc = new RTCPeerConnection(ICE);
  const p = (peers[sid] = { pc, stream: new MediaStream(), makingOffer: false, ignoreOffer: false, polite: socket.id < sid });
  if (localStream) localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
  pc.ontrack = (e) => { p.stream.addTrack(e.track); e.track.onended = () => p.stream.removeTrack(e.track); syncTiles(); };
  pc.onicecandidate = (e) => e.candidate && socket.emit('signal', { to: sid, data: { candidate: e.candidate } });
  pc.onnegotiationneeded = async () => {
    try { p.makingOffer = true; await pc.setLocalDescription(); socket.emit('signal', { to: sid, data: { description: pc.localDescription } }); }
    catch (err) { console.warn(err); } finally { p.makingOffer = false; }
  };
  return p;
}
async function onSignal({ from, data }) {
  const p = ensurePeer(from); const pc = p.pc;
  try {
    if (data.description) {
      const collision = data.description.type === 'offer' && (p.makingOffer || pc.signalingState !== 'stable');
      p.ignoreOffer = !p.polite && collision;
      if (p.ignoreOffer) return;
      await pc.setRemoteDescription(data.description);
      if (data.description.type === 'offer') { await pc.setLocalDescription(); socket.emit('signal', { to: from, data: { description: pc.localDescription } }); }
    } else if (data.candidate) {
      try { await pc.addIceCandidate(data.candidate); } catch (e) { if (!p.ignoreOffer) throw e; }
    }
  } catch (err) { console.warn('signal', err); }
}
function dropPeer(sid) { peers[sid]?.pc.close(); delete peers[sid]; delete mediaStates[sid]; syncTiles(); }

async function startCall() {
  try { localStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true }); }
  catch { try { localStream = await navigator.mediaDevices.getUserMedia({ audio: true }); toast('Sem câmara — entraste só com áudio.'); } catch { return toast('Não foi possível aceder ao microfone/câmara.'); } }
  for (const p of Object.values(peers)) localStream.getTracks().forEach((t) => p.pc.addTrack(t, localStream));
  updateCallButtons(); sendMediaState(); syncTiles();
}
function stopLocal() {
  if (!localStream) return;
  localStream.getTracks().forEach((t) => t.stop());
  for (const p of Object.values(peers)) p.pc.getSenders().forEach((s) => s.track && p.pc.removeTrack(s));
  localStream = null; updateCallButtons(); sendMediaState(); syncTiles();
}
function sendMediaState() {
  const v = localStream?.getVideoTracks()[0], a = localStream?.getAudioTracks()[0];
  socket?.emit('media-state', { cam: !!v?.enabled, mic: !!a?.enabled });
}
function updateCallButtons() {
  const v = localStream?.getVideoTracks()[0], a = localStream?.getAudioTracks()[0];
  $('#btn-call').textContent = localStream ? '📴 Sair da chamada' : '📞 Entrar na chamada';
  $('#btn-mic').className = 'ctl ' + (a ? (a.enabled ? 'on' : 'off') : '');
  $('#btn-cam').className = 'ctl ' + (v ? (v.enabled ? 'on' : 'off') : '');
}
$('#btn-call').addEventListener('click', () => (localStream ? stopLocal() : startCall()));
$('#btn-mic').addEventListener('click', () => { const a = localStream?.getAudioTracks()[0]; if (!a) return startCall(); a.enabled = !a.enabled; updateCallButtons(); sendMediaState(); });
$('#btn-cam').addEventListener('click', () => { const v = localStream?.getVideoTracks()[0]; if (!v) return startCall(); v.enabled = !v.enabled; updateCallButtons(); sendMediaState(); syncTiles(); });

function syncTiles() {
  if (!roomState) return;
  const box = $('#videos');
  const seen = new Set();
  for (const m of roomState.members) {
    seen.add(m.sid);
    let tile = box.querySelector(`[data-sid="${m.sid}"]`);
    if (!tile) {
      tile = document.createElement('div'); tile.className = 'tile'; tile.dataset.sid = m.sid;
      tile.innerHTML = `<div class="av"></div><video autoplay playsinline></video><span class="label"></span>`;
      box.appendChild(tile);
    }
    const isMe = m.sid === socket.id;
    const stream = isMe ? localStream : peers[m.sid]?.stream;
    const camOn = isMe ? !!localStream?.getVideoTracks()[0]?.enabled : !!mediaStates[m.sid]?.cam && stream?.getVideoTracks().length > 0;
    const micOn = isMe ? !!localStream?.getAudioTracks()[0]?.enabled : !!mediaStates[m.sid]?.mic;
    const video = tile.querySelector('video');
    if (stream && video.srcObject !== stream) video.srcObject = stream;
    if (!stream) video.srcObject = null;
    video.muted = isMe;
    video.style.visibility = camOn ? 'visible' : 'hidden';
    if (!isMe && stream) video.play().catch(() => {});
    tile.querySelector('.av').innerHTML = renderAvatar(m.avatar, 90);
    tile.querySelector('.label').textContent = (micOn ? '🎙 ' : '🔇 ') + m.name + (isMe ? ' (tu)' : '');
  }
  box.querySelectorAll('.tile').forEach((t) => { if (!seen.has(t.dataset.sid)) t.remove(); });
}

// ---------------- YouTube juntos ----------------
let yt = null, ytReady = false, ytApplying = 0, pendingYt = null, currentVideo = null;
window.onYouTubeIframeAPIReady = () => { ytReady = true; if (pendingYt) applyYt(pendingYt); };
$('#yt-form').addEventListener('submit', (e) => { e.preventDefault(); socket.emit('yt', { type: 'load', url: $('#yt-url').value }); $('#yt-url').value = ''; });
$('#yt-stop').addEventListener('click', () => socket.emit('yt', { type: 'stop' }));

function applyYt(s) {
  if (!s.videoId) {
    currentVideo = null; $('#yt-wrap').classList.add('hidden'); $('#yt-stop').classList.add('hidden');
    try { yt?.stopVideo(); } catch {}
    return;
  }
  if (!ytReady) { pendingYt = s; return; }
  $('#yt-wrap').classList.remove('hidden'); $('#yt-stop').classList.remove('hidden');
  ytApplying = Date.now();
  if (!yt) {
    currentVideo = s.videoId;
    yt = new YT.Player('yt-player', {
      videoId: s.videoId, playerVars: { autoplay: 1, start: Math.floor(s.time), playsinline: 1, rel: 0 },
      events: { onStateChange: onYtState, onReady: () => applyYt(s) },
    });
    return;
  }
  if (typeof yt.getCurrentTime !== 'function') return;
  if (currentVideo !== s.videoId) { currentVideo = s.videoId; yt.loadVideoById(s.videoId, s.time); }
  else if (Math.abs(yt.getCurrentTime() - s.time) > 1.5) yt.seekTo(s.time, true);
  if (s.playing) yt.playVideo(); else yt.pauseVideo();
}
function onYtState(e) {
  if (Date.now() - ytApplying < 900) return; // ignora o eco das mudanças que vieram do servidor
  if (e.data === YT.PlayerState.PLAYING) socket.emit('yt', { type: 'play', time: yt.getCurrentTime() });
  if (e.data === YT.PlayerState.PAUSED) socket.emit('yt', { type: 'pause', time: yt.getCurrentTime() });
}

// ---------------- Jogos ----------------
let currentGame = null, secretWord = null, timerInt = null;
$('#side-tabs').addEventListener('click', (e) => {
  const t = e.target.closest('button')?.dataset.tab; if (!t) return;
  $('#side-tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
  ['chat', 'games', 'people'].forEach((p) => $('#panel-' + p).classList.toggle('hidden', p !== t));
});
function openGamesTab() { $('#side-tabs [data-tab="games"]').click(); }

function renderGame(g) {
  const prev = currentGame; currentGame = g;
  const el = $('#game');
  clearInterval(timerInt);
  if (!g) {
    el.innerHTML = `<div class="game-menu">
      <button class="game-pick" data-start="galo"><b>❌⭕ Jogo do Galo</b><span>1 contra 1. Quem ganha leva 10 🪙</span></button>
      <button class="game-pick" data-start="desenha"><b>🎨 Desenha & Adivinha</b><span>Um desenha, os outros adivinham no chat. +5 🪙 por acerto</span></button>
      <button class="game-pick" data-start="quiz"><b>🧠 Quiz relâmpago</b><span>5 perguntas, quanto mais rápido mais pontos. O vencedor leva 15 🪙</span></button>
    </div>`;
    el.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => socket.emit('game:start', b.dataset.start)));
    return;
  }
  if (!prev || prev.type !== g.type) openGamesTab();
  const footer = g.over ? `<div class="row"><button class="btn primary" id="again">Jogar outra vez</button><button class="btn ghost" id="back">Outros jogos</button></div>` : `<button class="btn small ghost" id="end-game">Terminar jogo</button>`;
  const bindFooter = () => {
    $('#again')?.addEventListener('click', () => socket.emit('game:start', g.type));
    $('#back')?.addEventListener('click', () => renderGame(null));
    $('#end-game')?.addEventListener('click', () => socket.emit('game:end'));
  };

  if (g.type === 'galo') {
    const mine = g.players.indexOf(socket.id);
    const canJoin = !g.players[1] && mine === -1 && !g.over;
    el.innerHTML = `<p class="game-msg">${esc(g.message)}</p>
      <p style="text-align:center;color:var(--muted)">❌ ${esc(g.names[0] || '?')} vs ⭕ ${esc(g.names[1] || '…')}</p>
      ${canJoin ? '<button class="btn primary" id="join-galo">Aceitar desafio</button>' : ''}
      <div class="galo">${g.board.map((c, i) => `<button data-cell="${i}" class="${g.win?.includes(i) ? 'win' : ''}">${c === 'X' ? '❌' : c === 'O' ? '⭕' : ''}</button>`).join('')}</div>${footer}`;
    $('#join-galo')?.addEventListener('click', () => socket.emit('game:join'));
    el.querySelectorAll('[data-cell]').forEach((b) => b.addEventListener('click', () => socket.emit('game:move', +b.dataset.cell)));
    return bindFooter();
  }

  if (g.type === 'quiz') {
    const answered = g.answered?.includes(socket.id);
    el.innerHTML = `<p class="game-msg">${esc(g.message)}</p>
      ${!g.over && g.q ? `<div class="timer"><i id="tbar"></i></div><h3>${esc(g.q)}</h3>
        <div class="quiz-opts">${g.options.map((o, i) => `<button class="btn" data-ans="${i}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>
        <small style="color:var(--muted)">${g.answered.length} responderam</small>` : ''}
      ${scoresHtml(g.scores)}${footer}`;
    el.querySelectorAll('[data-ans]').forEach((b) => b.addEventListener('click', () => { socket.emit('game:answer', +b.dataset.ans); el.querySelectorAll('[data-ans]').forEach((x) => (x.disabled = true)); b.classList.add('primary'); }));
    startTimer(g.endsAt, 12000);
    return bindFooter();
  }

  if (g.type === 'desenha') {
    const drawing = g.drawer === socket.id && !g.over;
    if (!(prev?.type === 'desenha' && $('#board'))) {
      el.innerHTML = `<div id="dz-info"></div><canvas id="board" width="800" height="600"></canvas><div class="palette" id="palette"></div><div id="dz-foot"></div>`;
      setupBoard();
    }
    if (g.drawer !== prev?.drawer) secretWord = g.drawer === socket.id ? secretWord : null;
    $('#dz-info').innerHTML = `<p class="game-msg">${esc(g.message)} <small>(ronda ${g.round}/${g.rounds})</small></p>
      ${!g.over ? `<div class="timer"><i id="tbar"></i></div>` : ''}
      ${drawing ? `<p class="hint">Desenha: <b>${esc(secretWord || '…')}</b></p>` : !g.over ? `<p class="hint">${esc(g.hint)}</p><p style="text-align:center;color:var(--muted);margin:0">Escreve o teu palpite no chat!</p>` : ''}`;
    $('#palette').classList.toggle('hidden', !drawing);
    $('#palette').innerHTML = drawing ? ['#111', '#e63946', '#3d7bff', '#2bb673', '#ffb020', '#9b5cff', '#8b5a2b', '#fff'].map((c) => `<button data-color="${c}" style="background:${c}"></button>`).join('') + '<button class="btn small" id="clear-board" style="width:auto">Limpar</button>' : '';
    $('#palette').querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => { brush.color = b.dataset.color; brush.width = b.dataset.color === '#fff' ? 24 : 5; }));
    $('#clear-board')?.addEventListener('click', () => socket.emit('game:clear'));
    $('#dz-foot').innerHTML = scoresHtml(g.scores) + footer;
    if (!g.over) startTimer(g.endsAt, 75000);
    bindFooter();
  }
}
function scoresHtml(scores) {
  const list = Object.values(scores || {}).sort((a, b) => b.v - a.v);
  return list.length ? `<ul class="scores">${list.map((s, i) => `<li>${['🥇', '🥈', '🥉'][i] || '·'} ${esc(s.name)} — ${s.v}</li>`).join('')}</ul>` : '';
}
function startTimer(endsAt, total) {
  const tick = () => { const b = $('#tbar'); if (b) b.style.width = Math.max(0, (endsAt - Date.now()) / total) * 100 + '%'; };
  tick(); timerInt = setInterval(tick, 250);
}

// quadro de desenho
const brush = { color: '#111', width: 5 };
function setupBoard() {
  const c = $('#board'); let last = null;
  const pos = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  c.addEventListener('pointerdown', (e) => { if (currentGame?.drawer !== socket.id || currentGame.over) return; last = pos(e); c.setPointerCapture(e.pointerId); });
  c.addEventListener('pointermove', (e) => {
    if (!last) return; const p = pos(e);
    const s = { a: last, b: p, c: brush.color, w: brush.width };
    drawStroke(s); socket.emit('game:draw', s); last = p;
  });
  const end = () => (last = null);
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
}
function drawStroke(s) {
  const c = $('#board'); if (!c) return; const x = c.getContext('2d');
  x.strokeStyle = s.c; x.lineWidth = s.w; x.lineCap = 'round';
  x.beginPath(); x.moveTo(s.a[0] * c.width, s.a[1] * c.height); x.lineTo(s.b[0] * c.width, s.b[1] * c.height); x.stroke();
}
function clearBoard() { const c = $('#board'); c?.getContext('2d').clearRect(0, 0, c.width, c.height); }

// ---------------- Arranque ----------------
(async function boot() {
  if (!token) return show('screen-auth');
  try { await api('/api/me'); enterLobby(); } catch { safeSet('malta.token', null); show('screen-auth'); }
})();
