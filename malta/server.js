// Malta — servidor (Express + Socket.IO)
// Contas, progresso (XP, níveis, emblemas, streaks), loja, presentes, casas,
// salas com chat moderado, sinalização WebRTC, YouTube e Spotify sincronizados e jogos.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { CATALOG, findItem, defaultAvatar, levelFor } = require('./catalog');
const { filterText, isClean, makeSpamGuard } = require('./server/moderation');
const createGames = require('./server/games');
const football = require('./server/football');

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const MIN_AGE = 16, MAX_AGE = 25;
const MAX_ROOM = 8, MAX_ROOM_VIP = 12;
const START_COINS = 200, DAILY_COINS = 50, LEVEL_UP_COINS = 50;

// ---------- Persistência simples em JSON ----------
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
fs.mkdirSync(DATA_DIR, { recursive: true });
const load = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const users = load(USERS_FILE, {});
const reports = load(REPORTS_FILE, []);
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(USERS_FILE, JSON.stringify(users), () => {});
    fs.writeFile(REPORTS_FILE, JSON.stringify(reports.slice(-2000)), () => {});
  }, 300);
}
function migrate(u) {
  u.xp ??= 0; u.badges ??= []; u.stats ??= {}; u.streaks ??= {}; u.blocked ??= []; u.friends ??= []; u.inbox ??= [];
  u.house ??= { theme: 't_default', decor: [], friendsOnly: false };
  u.strikes ??= 0; u.mutedUntil ??= 0; u.reportedBy ??= [];
  return u;
}
Object.values(users).forEach(migrate);

// ---------- Utilitários ----------
const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);
function hashPassword(pw, salt = crypto.randomBytes(16).toString('hex')) { return { salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') }; }
function ageFrom(birthDate) {
  const b = new Date(birthDate); if (isNaN(b)) return -1;
  const now = new Date(); let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
const byToken = (t) => (t ? Object.values(users).find((u) => u.token === t && !u.banned) : null) || null;
const byName = (n) => Object.values(users).find((u) => u.name.toLowerCase() === String(n || '').trim().toLowerCase()) || null;
const houseCode = (u) => 'C' + u.id.replace(/-/g, '').slice(0, 7).toUpperCase();
const byHouse = (code) => Object.values(users).find((u) => houseCode(u) === code) || null;
const blockedPair = (a, b) => !!a && !!b && (a.blocked.includes(b.name) || b.blocked.includes(a.name));
function owns(u, id) {
  const it = findItem(id); if (!it) return false;
  return it.price === 0 || (u.vip && it.slot === 'reaction') || u.owned.includes(id);
}
function activeStreaks(u) {
  return Object.fromEntries(Object.entries(u.streaks).filter(([, s]) => s.last === today() || s.last === yesterday()).map(([n, s]) => [n, s.n]));
}
function publicUser(u) {
  return {
    id: u.id, name: u.name, coins: u.coins, avatar: u.avatar, owned: u.owned, vip: !!u.vip,
    friends: u.friends, blocked: u.blocked, canClaimDaily: u.lastDaily !== today(),
    xp: u.xp, level: levelFor(u.xp), badges: u.badges, stats: u.stats, streaks: activeStreaks(u),
    house: u.house, houseCode: houseCode(u), inbox: u.inbox.filter((g) => !g.seen), mutedUntil: u.mutedUntil,
  };
}

// ---------- Progresso ----------
function notify(u, ev, data) { for (const sid of userSockets.get(u.id) || []) io.to(sid).emit(ev, data); }
function pushMe(u) { notify(u, 'me', publicUser(u)); }
function addCoins(u, n) { u.coins += n; save(); pushMe(u); }
function badge(u, id) {
  if (u.badges.includes(id)) return;
  u.badges.push(id); save(); notify(u, 'badge', id);
}
function addXp(u, n) {
  const before = levelFor(u.xp); u.xp += n; const after = levelFor(u.xp);
  if (after > before) {
    u.coins += LEVEL_UP_COINS * (after - before);
    notify(u, 'levelup', { level: after, coins: LEVEL_UP_COINS * (after - before) });
    if (after >= 10) badge(u, 'level10');
  }
  save(); pushMe(u);
}
const BADGE_RULES = { messages: [500, 'chatty'], watchMin: [60, 'cinema'], callMin: [60, 'caller'], wins: [1, 'first_win'], drawGuessed: [10, 'artist'], songs: [10, 'dj'] };
function stat(u, key, n = 1) {
  u.stats[key] = (u.stats[key] || 0) + n;
  const rule = BADGE_RULES[key]; if (rule && u.stats[key] >= rule[0]) badge(u, rule[1]);
  save();
}
function touchStreak(a, b) {
  for (const [x, y] of [[a, b], [b, a]]) {
    const s = x.streaks[y.name] || { n: 0, last: null };
    if (s.last === today()) continue;
    s.n = s.last === yesterday() ? s.n + 1 : 1; s.last = today(); x.streaks[y.name] = s;
    if (s.n >= 7) badge(x, 'streak7');
    if (s.n > 1) notify(x, 'toast', `🔥 Streak de ${s.n} dias com ${y.name}!`);
    pushMe(x);
  }
  save();
}

// ---------- HTTP ----------
const app = express();
app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/catalog.js', (_req, res) => res.sendFile(path.join(__dirname, 'catalog.js')));

function auth(req, res, next) {
  const u = byToken((req.headers.authorization || '').replace('Bearer ', ''));
  if (!u) return res.status(401).json({ error: 'Sessão inválida.' });
  req.user = u; next();
}
const bad = (res, code, error) => res.status(code).json({ error });
football.routes(app, auth, { save, bad, addXp });

app.post('/api/register', (req, res) => {
  const { name, password, birthDate } = req.body || {};
  const clean = String(name || '').trim();
  if (!/^[\p{L}\p{N}_.]{3,16}$/u.test(clean)) return bad(res, 400, 'O nome deve ter 3–16 letras, números, _ ou .');
  if (!isClean(clean)) return bad(res, 400, 'Escolhe outro nome.');
  if (String(password || '').length < 6) return bad(res, 400, 'A palavra-passe precisa de pelo menos 6 caracteres.');
  const age = ageFrom(birthDate);
  if (age < MIN_AGE || age > MAX_AGE) return bad(res, 403, `A Malta é para pessoas dos ${MIN_AGE} aos ${MAX_AGE} anos.`);
  if (byName(clean)) return bad(res, 409, 'Esse nome já existe.');
  const id = crypto.randomUUID(); const token = crypto.randomBytes(24).toString('hex');
  users[id] = migrate({ id, name: clean, pw: hashPassword(password), birthDate, coins: START_COINS, owned: [], avatar: defaultAvatar(), token, lastDaily: null, vip: false, createdAt: new Date().toISOString() });
  save();
  res.json({ token, me: publicUser(users[id]) });
});

app.post('/api/login', (req, res) => {
  const { name, password } = req.body || {};
  const u = byName(name);
  if (!u || hashPassword(String(password || ''), u.pw.salt).hash !== u.pw.hash) return bad(res, 401, 'Nome ou palavra-passe errados.');
  if (u.banned) return bad(res, 403, 'Esta conta foi suspensa por violar as regras.');
  u.token = crypto.randomBytes(24).toString('hex'); save();
  res.json({ token: u.token, me: publicUser(u) });
});

app.get('/api/me', auth, (req, res) => res.json({ me: publicUser(req.user) }));

app.post('/api/daily', auth, (req, res) => {
  const u = req.user;
  if (u.lastDaily === today()) return bad(res, 400, 'Já recebeste o bónus de hoje.');
  u.lastDaily = today(); addCoins(u, DAILY_COINS); addXp(u, 5);
  res.json({ me: publicUser(u), gained: DAILY_COINS });
});

app.post('/api/avatar', auth, (req, res) => {
  const u = req.user; const a = req.body?.avatar || {}; const next = { ...u.avatar };
  for (const slot of Object.keys(CATALOG.avatar)) {
    if (!(slot in a)) continue;
    const it = CATALOG.avatar[slot].find((i) => i.id === a[slot]);
    if (!it) return bad(res, 400, 'Item inválido.');
    if (!owns(u, it.id)) return bad(res, 402, 'Ainda não compraste esse item.');
    next[slot] = it.id;
  }
  u.avatar = next; save(); refreshInRooms(u);
  res.json({ me: publicUser(u) });
});

app.post('/api/buy', auth, (req, res) => {
  const u = req.user; const it = findItem(req.body?.itemId);
  if (!it || it.price === 0) return bad(res, 400, 'Item inválido.');
  if (u.owned.includes(it.id)) return bad(res, 400, 'Já tens este item.');
  if (u.coins < it.price) return bad(res, 402, 'Moedas insuficientes.');
  u.coins -= it.price; u.owned.push(it.id); save(); refreshInRooms(u);
  res.json({ me: publicUser(u) });
});

// PAGAMENTOS — MODO DEMO. Em produção: Stripe Checkout / compras na app e creditar só no webhook confirmado.
app.post('/api/coins/checkout', auth, (req, res) => {
  const u = req.user;
  if (req.body?.packId === 'vip') { u.vip = true; addCoins(u, 200); refreshInRooms(u); return res.json({ me: publicUser(u), demo: true }); }
  const pack = CATALOG.coinPacks.find((p) => p.id === req.body?.packId);
  if (!pack) return bad(res, 400, 'Pacote inválido.');
  addCoins(u, pack.coins);
  res.json({ me: publicUser(u), demo: true });
});

// ---- Amigos, bloqueios, ranking ----
app.post('/api/friends', auth, (req, res) => {
  const u = req.user; const t = byName(req.body?.name);
  if (!t || t.id === u.id || t.banned) return bad(res, 404, 'Utilizador não encontrado.');
  if (blockedPair(u, t)) return bad(res, 403, 'Não é possível adicionar este utilizador.');
  if (!u.friends.includes(t.name)) { u.friends.push(t.name); notify(t, 'toast', `${u.name} adicionou-te aos amigos 👋`); }
  if (u.friends.length >= 5) badge(u, 'social');
  save(); res.json({ me: publicUser(u) });
});
app.post('/api/friends/remove', auth, (req, res) => {
  const u = req.user; u.friends = u.friends.filter((n) => n !== req.body?.name); save(); res.json({ me: publicUser(u) });
});
app.get('/api/friends/online', auth, (req, res) => {
  const u = req.user;
  const list = u.friends.map((n) => {
    const f = byName(n);
    const room = f && [...rooms.values()].find((r) => [...r.members.values()].some((m) => m.userId === f.id));
    const canSee = room && !blockedPair(u, f) && canEnter(u, room, true).ok;
    return { name: n, avatar: f?.avatar, level: levelFor(f?.xp), online: !!room, room: canSee ? room.code : null, streak: activeStreaks(u)[n] || 0 };
  });
  res.json({ friends: list });
});
app.post('/api/block', auth, (req, res) => {
  const u = req.user; const t = byName(req.body?.name);
  if (!t || t.id === u.id) return bad(res, 404, 'Utilizador não encontrado.');
  if (u.blocked.includes(t.name)) u.blocked = u.blocked.filter((n) => n !== t.name);
  else { u.blocked.push(t.name); u.friends = u.friends.filter((n) => n !== t.name); t.friends = t.friends.filter((n) => n !== u.name); pushMe(t); }
  save(); res.json({ me: publicUser(u), blocked: u.blocked.includes(t.name) });
});
app.get('/api/leaderboard', auth, (req, res) => {
  const u = req.user;
  const list = [u, ...u.friends.map(byName).filter(Boolean)].map((x) => ({ name: x.name, avatar: x.avatar, xp: x.xp, level: levelFor(x.xp), badges: x.badges.length, me: x.id === u.id }));
  res.json({ list: list.sort((a, b) => b.xp - a.xp) });
});

// ---- Presentes ----
app.post('/api/gift', auth, (req, res) => {
  const u = req.user; const t = byName(req.body?.to);
  if (!t || t.id === u.id) return bad(res, 404, 'Utilizador não encontrado.');
  if (!u.friends.includes(t.name)) return bad(res, 403, 'Só podes oferecer prendas a amigos.');
  if (blockedPair(u, t)) return bad(res, 403, 'Não é possível oferecer a este utilizador.');
  const note = filterText(String(req.body?.note || '').slice(0, 120)).text;
  const gift = { id: crypto.randomUUID(), from: u.name, note, at: Date.now(), seen: false };
  if (req.body?.itemId) {
    const it = findItem(req.body.itemId);
    if (!it || it.price === 0) return bad(res, 400, 'Item inválido.');
    if (t.owned.includes(it.id)) return bad(res, 400, `${t.name} já tem esse item.`);
    if (u.coins < it.price) return bad(res, 402, 'Moedas insuficientes.');
    u.coins -= it.price; t.owned.push(it.id); gift.itemId = it.id;
  } else {
    const n = Math.floor(Number(req.body?.coins));
    if (!(n >= 10 && n <= 1000)) return bad(res, 400, 'Podes oferecer entre 10 e 1000 moedas.');
    if (u.coins < n) return bad(res, 402, 'Moedas insuficientes.');
    u.coins -= n; t.coins += n; gift.coins = n;
  }
  t.inbox.push(gift); t.inbox = t.inbox.slice(-30);
  badge(u, 'generous'); addXp(u, 10);
  save(); pushMe(u); pushMe(t); refreshInRooms(t);
  notify(t, 'gift', gift);
  res.json({ me: publicUser(u) });
});
app.post('/api/inbox/seen', auth, (req, res) => { req.user.inbox.forEach((g) => (g.seen = true)); save(); res.json({ me: publicUser(req.user) }); });

// ---- Casa ----
app.post('/api/house', auth, (req, res) => {
  const err = applyHouse(req.user, req.body || {}); if (err) return bad(res, 400, err);
  save(); res.json({ me: publicUser(req.user) });
});
function applyHouse(u, b) {
  if (b.theme !== undefined && (!CATALOG.themes.some((t) => t.id === b.theme) || !owns(u, b.theme))) return 'Tema não disponível.';
  if (b.decor !== undefined && (!Array.isArray(b.decor) || b.decor.length > 8 || !b.decor.every((d) => CATALOG.decor.some((x) => x.id === d) && owns(u, d)))) return 'Decoração inválida (máx. 8 que tenhas comprado).';
  if (b.theme !== undefined) u.house.theme = b.theme;
  if (b.decor !== undefined) u.house.decor = [...new Set(b.decor)];
  if (b.friendsOnly !== undefined) u.house.friendsOnly = !!b.friendsOnly;
  save();
  const r = rooms.get(houseCode(u)); if (r) { syncHouse(r); io.to(r.code).emit('room', roomState(r)); }
  return null;
}

// ---- Denúncias e administração ----
app.post('/api/report', auth, (req, res) => {
  const u = req.user; const t = byName(req.body?.who);
  if (!t || t.id === u.id) return bad(res, 404, 'Utilizador não encontrado.');
  const r = rooms.get(req.body?.room);
  const inRoom = r && [...r.members.values()].some((m) => m.userId === u.id);
  const evidence = inRoom ? r.log.filter((m) => m.name === t.name).slice(-10) : [];
  reports.push({ id: crypto.randomUUID(), by: u.name, who: t.name, why: String(req.body?.why || '').slice(0, 300), room: r?.code || null, evidence, at: new Date().toISOString(), status: 'aberta' });
  // 3 pessoas diferentes a denunciar em 24 h → chat silenciado 24 h automaticamente
  t.reportedBy = t.reportedBy.filter((x) => Date.now() - x.at < 864e5 && x.by !== u.name);
  t.reportedBy.push({ by: u.name, at: Date.now() });
  if (t.reportedBy.length >= 3 && t.mutedUntil < Date.now()) {
    t.mutedUntil = Date.now() + 864e5; notify(t, 'toast', 'Foste silenciado no chat durante 24 h por várias denúncias.'); pushMe(t);
  }
  save(); res.json({ ok: true });
});
function admin(req, res, next) {
  const a = Buffer.from(String(req.headers['x-admin-token'] || '')); const b = Buffer.from(ADMIN_TOKEN);
  if (!ADMIN_TOKEN || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return bad(res, 401, 'Sem acesso.');
  next();
}
app.get('/api/admin/reports', admin, (_req, res) => {
  res.json({ reports: reports.slice(-300).reverse().map((r) => { const t = byName(r.who) || {}; return { ...r, whoState: { banned: !!t.banned, mutedUntil: t.mutedUntil || 0, strikes: t.strikes || 0 } }; }) });
});
app.post('/api/admin/action', admin, (req, res) => {
  const t = byName(req.body?.name); if (!t) return bad(res, 404, 'Utilizador não encontrado.');
  const a = req.body?.action;
  if (a === 'ban') { t.banned = true; t.token = null; for (const sid of userSockets.get(t.id) || []) io.sockets.sockets.get(sid)?.disconnect(true); }
  else if (a === 'unban') t.banned = false;
  else if (a === 'mute') t.mutedUntil = Date.now() + 864e5;
  else if (a === 'unmute') { t.mutedUntil = 0; t.strikes = 0; t.reportedBy = []; }
  else if (a === 'dismiss') { /* só fecha as denúncias */ }
  else return bad(res, 400, 'Ação inválida.');
  for (const r of reports) if (r.who === t.name && r.status === 'aberta') r.status = a;
  save(); pushMe(t); res.json({ ok: true });
});

// ---------- Tempo real ----------
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e5 });
const rooms = new Map();
const userSockets = new Map();
const nameOf = (r, sid) => r.members.get(sid)?.name || '?';
const userOf = (r, sid) => { const m = r.members.get(sid); return m && users[m.userId]; };
function sysMsg(r, text) { io.to(r.code).emit('chat', { system: true, text, at: Date.now() }); }
const games = createGames({ io, sysMsg, nameOf, userOf, addCoins, addXp, stat, save });

function newRoom(code, creator) {
  const host = byHouse(code);
  const r = {
    code, owner: host ? host.id : creator.id, isHouse: !!host, theme: 't_default', decor: [], friendsOnly: false,
    members: new Map(), kicked: new Set(), log: [],
    yt: { videoId: null, playing: false, time: 0, at: Date.now() },
    music: { current: null, playing: false, pos: 0, at: Date.now(), duration: 0, queue: [] },
    game: null,
  };
  if (host) syncHouse(r);
  return r;
}
function syncHouse(r) { const h = users[r.owner].house; r.theme = h.theme; r.decor = h.decor; r.friendsOnly = h.friendsOnly; }
function canEnter(u, r, ignoreSize) {
  const owner = users[r.owner];
  if (r.kicked.has(u.id)) return { ok: false, error: 'Foste expulso desta sala.' };
  if (owner && owner.id !== u.id && blockedPair(owner, u)) return { ok: false, error: 'Não podes entrar nesta sala.' };
  if (r.friendsOnly && owner && owner.id !== u.id && !owner.friends.includes(u.name)) return { ok: false, error: `Esta sala é só para amigos de ${owner.name}.` };
  if (!ignoreSize && r.members.size >= (u.vip ? MAX_ROOM_VIP : MAX_ROOM)) return { ok: false, error: 'A sala está cheia.' };
  return { ok: true };
}
function memberView(u) {
  return { userId: u.id, name: u.name, avatar: u.avatar, extras: u.owned.filter((id) => id.startsWith('x_')), vip: !!u.vip, level: levelFor(u.xp), badges: u.badges.slice(-3) };
}
function roomState(r) {
  return {
    code: r.code, ownerId: r.owner, ownerName: users[r.owner]?.name, isHouse: r.isHouse, theme: r.theme, decor: r.decor, friendsOnly: r.friendsOnly,
    members: [...r.members.entries()].map(([sid, m]) => ({ sid, ...m })), yt: ytNow(r), music: musicNow(r),
  };
}
function ytNow(r) { const y = r.yt; return { ...y, time: y.playing ? y.time + (Date.now() - y.at) / 1000 : y.time }; }
function musicNow(r) { const m = r.music; return { ...m, pos: m.playing ? m.pos + (Date.now() - m.at) : m.pos }; }
function refreshInRooms(u) {
  for (const r of rooms.values()) {
    let changed = false;
    for (const m of r.members.values()) if (m.userId === u.id) { Object.assign(m, memberView(u)); changed = true; }
    if (changed) io.to(r.code).emit('room', roomState(r));
  }
}
// Envia a cada pessoa da sala, exceto a quem bloqueou (ou foi bloqueado por) quem enviou.
function emitFiltered(r, from, ev, payload) {
  for (const [sid, m] of r.members) if (!blockedPair(users[m.userId], from)) io.to(sid).emit(ev, payload);
}

io.use((socket, next) => {
  const u = byToken(socket.handshake.auth?.token);
  if (!u) return next(new Error('auth'));
  socket.data.userId = u.id; next();
});

io.on('connection', (socket) => {
  const uid = socket.data.userId;
  if (!userSockets.has(uid)) userSockets.set(uid, new Set());
  userSockets.get(uid).add(socket.id);
  const me = () => users[uid];
  const room = () => rooms.get(socket.data.room);
  const isOwner = (r) => r && r.owner === uid;
  const spam = makeSpamGuard();
  const toast = (t) => socket.emit('toast', t);

  socket.on('join', (codeRaw, ack) => {
    if (typeof ack !== 'function') return;
    const code = String(codeRaw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || crypto.randomBytes(3).toString('hex').toUpperCase();
    let r = rooms.get(code); const fresh = !r;
    if (!r) r = newRoom(code, me());
    const can = canEnter(me(), r); if (!can.ok) return ack({ error: can.error });
    leave();
    if (fresh) rooms.set(code, r);
    socket.join(code); socket.data.room = code;
    r.members.set(socket.id, memberView(me()));
    for (const m of r.members.values()) {
      const o = users[m.userId];
      if (o.id !== uid && (o.friends.includes(me().name) || me().friends.includes(o.name)) && !blockedPair(o, me())) touchStreak(me(), o);
    }
    ack({ ok: true, code, state: roomState(r), you: socket.id });
    socket.to(code).emit('peer-joined', { sid: socket.id, name: me().name });
    io.to(code).emit('room', roomState(r));
    if (r.game) games.emitTo(r, socket.id);
    sysMsg(r, `${me().name} entrou na sala 👋`);
  });

  socket.on('leave', leave);
  socket.on('disconnect', () => { leave(); userSockets.get(uid)?.delete(socket.id); });

  function leave() {
    const r = room(); if (!r) return;
    r.members.delete(socket.id); socket.leave(r.code); socket.data.room = null;
    io.to(r.code).emit('peer-left', { sid: socket.id });
    games.leave(r, socket.id, me().name);
    if (r.members.size === 0) { games.stop(r); rooms.delete(r.code); return; }
    if (!r.isHouse && r.owner === uid && ![...r.members.values()].some((m) => m.userId === uid)) {
      r.owner = r.members.values().next().value.userId; sysMsg(r, `${users[r.owner].name} é agora dono/a da sala.`);
    }
    io.to(r.code).emit('room', roomState(r));
    sysMsg(r, `${me().name} saiu`);
  }

  // ---- Chat (moderado) ----
  let lastXpMsg = 0;
  socket.on('chat', (text) => {
    const r = room(); if (!r) return;
    const raw = String(text || '').trim().slice(0, 500); if (!raw) return;
    const u = me();
    if (u.mutedUntil > Date.now()) return toast(`Estás silenciado no chat até ${new Date(u.mutedUntil).toLocaleString('pt-PT')}.`);
    const s = spam(raw); if (!s.ok) return toast(s.reason);
    if (games.chat(r, socket.id, raw)) return;
    const f = filterText(raw);
    if (f.slur) {
      u.strikes++;
      if (u.strikes >= 3) { u.mutedUntil = Date.now() + 36e5; u.strikes = 0; toast('Linguagem de ódio não é permitida. Silenciado 1 hora.'); }
      else toast(`⚠️ Linguagem de ódio não é permitida (aviso ${u.strikes}/3).`);
      save();
    }
    const msg = { from: memberView(u), text: f.text, at: Date.now() };
    r.log.push({ name: u.name, text: f.text, at: msg.at }); if (r.log.length > 100) r.log.shift();
    emitFiltered(r, u, 'chat', msg);
    stat(u, 'messages');
    if (Date.now() - lastXpMsg > 10000) { lastXpMsg = Date.now(); addXp(u, 1); }
  });

  // ---- Reações e emotes ----
  let lastReact = 0;
  socket.on('react', (id) => {
    const r = room(); if (!r) return;
    const it = CATALOG.reactions.find((x) => x.id === id);
    if (!it || !owns(me(), id) || Date.now() - lastReact < 250) return; lastReact = Date.now();
    emitFiltered(r, me(), 'react', { emoji: it.value, big: !!it.big || me().owned.includes('x_bigReact'), from: me().name, sid: socket.id });
  });
  let lastEmote = 0;
  socket.on('emote', (id) => {
    const r = room(); if (!r) return;
    const it = CATALOG.emotes.find((x) => x.id === id);
    if (!it || !owns(me(), id) || Date.now() - lastEmote < 1500) return; lastEmote = Date.now();
    emitFiltered(r, me(), 'emote', { sid: socket.id, anim: it.anim, emoji: it.value, from: me().name });
  });

  // ---- WebRTC (o servidor só passa mensagens) ----
  socket.on('signal', ({ to, data } = {}) => {
    const r = room(); if (!r || !r.members.has(to)) return;
    io.to(to).emit('signal', { from: socket.id, data });
  });
  socket.on('media-state', (st) => {
    const r = room(); if (!r) return;
    r.members.get(socket.id).inCall = !!(st?.cam || st?.mic || st?.screen);
    socket.to(r.code).emit('media-state', { sid: socket.id, cam: !!st?.cam, mic: !!st?.mic, screen: !!st?.screen });
  });
  socket.on('clip', () => { const r = room(); if (r) sysMsg(r, `🎬 ${me().name} guardou um clip dos últimos segundos.`); });

  // ---- YouTube sincronizado ----
  socket.on('yt', (msg) => {
    const r = room(); if (!r || !msg) return;
    const y = r.yt; const t = num(msg.time, ytNow(r).time);
    if (msg.type === 'load') {
      const id = parseYouTube(msg.url); if (!id) return toast('Link do YouTube inválido.');
      r.yt = { videoId: id, playing: true, time: 0, at: Date.now() }; sysMsg(r, `${me().name} pôs um vídeo a tocar 🎬`);
    } else if (msg.type === 'play') r.yt = { ...y, playing: true, time: t, at: Date.now() };
    else if (msg.type === 'pause') r.yt = { ...y, playing: false, time: t, at: Date.now() };
    else if (msg.type === 'seek') r.yt = { ...y, time: t, at: Date.now() };
    else if (msg.type === 'stop') r.yt = { videoId: null, playing: false, time: 0, at: Date.now() };
    else return;
    io.to(r.code).emit('yt', { ...ytNow(r), by: socket.id });
  });

  // ---- Spotify sincronizado (fila partilhada) ----
  socket.on('music', async (msg) => {
    const r = room(); if (!r || !msg) return;
    const m = r.music; const pos = num(msg.pos, musicNow(r).pos);
    if (msg.type === 'add') {
      const uri = parseSpotify(msg.url); if (!uri) return toast('Link do Spotify inválido (música, álbum ou playlist).');
      if (m.queue.length >= 30) return toast('A fila está cheia.');
      const item = { uri, title: await spotifyTitle(uri), by: me().name };
      if (rooms.get(r.code) !== r) return;
      stat(me(), 'songs'); addXp(me(), 2);
      if (!m.current) playItem(r, item); else { m.queue.push(item); sysMsg(r, `🎧 ${me().name} pôs na fila: ${item.title}`); }
    } else if (msg.type === 'play' && m.current) Object.assign(m, { playing: true, pos, at: Date.now() });
    else if (msg.type === 'pause' && m.current) Object.assign(m, { playing: false, pos, at: Date.now() });
    else if (msg.type === 'seek' && m.current) Object.assign(m, { pos, at: Date.now() });
    else if (msg.type === 'next') { if (msg.uri && msg.uri !== m.current?.uri) return; return nextSong(r); }
    else if (msg.type === 'remove') { const i = Number(msg.i); if (m.queue[i]) m.queue.splice(i, 1); }
    else if (msg.type === 'duration') { if (m.current && msg.uri === m.current.uri) m.duration = Math.max(m.duration, Math.min(num(msg.ms, 0), 4 * 36e5)); return; }
    else if (msg.type === 'stop') Object.assign(m, { current: null, playing: false, pos: 0, queue: [], duration: 0 });
    else return;
    io.to(r.code).emit('music', musicNow(r));
  });

  // ---- Jogos ----
  socket.on('game:start', (type, opts) => { const r = room(); if (r) games.start(r, socket.id, String(type), opts); });
  socket.on('game:action', (a, p) => { const r = room(); if (r) games.action(r, socket.id, String(a), p); });

  // ---- Definições da sala (só o dono) ----
  socket.on('room:settings', (b = {}) => {
    const r = room(); if (!isOwner(r)) return toast('Só o dono da sala pode mudar isto.');
    if (r.isHouse) { const err = applyHouse(me(), b); if (err) toast(err); pushMe(me()); return; }
    if (b.theme !== undefined) { if (!CATALOG.themes.some((t) => t.id === b.theme) || !owns(me(), b.theme)) return toast('Tema não disponível.'); r.theme = b.theme; }
    if (Array.isArray(b.decor) && b.decor.length <= 8 && b.decor.every((d) => CATALOG.decor.some((x) => x.id === d) && owns(me(), d))) r.decor = b.decor;
    if (b.friendsOnly !== undefined) r.friendsOnly = !!b.friendsOnly;
    io.to(r.code).emit('room', roomState(r));
  });
  socket.on('kick', (sid) => {
    const r = room(); if (!isOwner(r) || !r.members.has(sid) || sid === socket.id) return;
    const tu = userOf(r, sid); if (tu) r.kicked.add(tu.id);
    sysMsg(r, `${nameOf(r, sid)} foi expulso da sala.`);
    const target = io.sockets.sockets.get(sid);
    if (target) { target.emit('kicked'); target.listeners('leave').forEach((fn) => fn()); }
  });
});

function playItem(r, item) {
  Object.assign(r.music, { current: item, playing: true, pos: 0, at: Date.now(), duration: 0 });
  sysMsg(r, `🎧 A tocar: ${item.title} (por ${item.by})`);
}
function nextSong(r) {
  const m = r.music; const n = m.queue.shift();
  if (n) playItem(r, n); else Object.assign(m, { current: null, playing: false, pos: 0, duration: 0 });
  io.to(r.code).emit('music', musicNow(r));
}

// Avança a fila de música quando a faixa acaba
setInterval(() => {
  for (const r of rooms.values()) {
    const m = musicNow(r);
    if (m.current && m.playing && m.duration > 0 && m.pos > m.duration + 1500) nextSong(r);
  }
}, 1000);
// XP por minuto em chamada, a ver vídeos ou a ouvir música juntos
setInterval(() => {
  for (const r of rooms.values()) {
    const watching = r.yt.playing && r.yt.videoId;
    for (const m of r.members.values()) {
      const u = users[m.userId]; if (!u) continue;
      let xp = 0;
      if (m.inCall) { stat(u, 'callMin'); xp += 2; }
      if (watching) { stat(u, 'watchMin'); xp += 1; }
      if (r.music.playing) xp += 1;
      if (xp) addXp(u, xp);
    }
  }
}, 60000);

function num(v, d) { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : d; }
function parseYouTube(url) {
  const s = String(url || '').trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function parseSpotify(url) {
  const s = String(url || '').trim();
  const m = s.match(/^spotify:(track|album|playlist|episode):([A-Za-z0-9]{22})$/) || s.match(/open\.spotify\.com\/(?:intl-[\w-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]{22})/);
  return m ? `spotify:${m[1]}:${m[2]}` : null;
}
const titleCache = new Map();
async function spotifyTitle(uri) {
  if (titleCache.has(uri)) return titleCache.get(uri);
  const [, type, id] = uri.split(':');
  let title = { track: 'Música', album: 'Álbum', playlist: 'Playlist', episode: 'Podcast' }[type] || 'Música';
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) title = String((await res.json()).title || title).slice(0, 100);
  } catch {}
  titleCache.set(uri, title);
  return title;
}

server.listen(PORT, () => console.log(`Malta a correr em http://localhost:${PORT}`));
