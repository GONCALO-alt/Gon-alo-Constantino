// Malta — servidor (Express + Socket.IO)
// Contas, loja de avatar/reações, salas com chat, sinalização WebRTC,
// YouTube sincronizado e jogos (Jogo do Galo e Desenha & Adivinha).
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { CATALOG, findItem, defaultAvatar } = require('./catalog');

const PORT = process.env.PORT || 3000;
const MIN_AGE = 16;
const MAX_AGE = 25;
const MAX_ROOM = 8; // vídeo em malha (P2P) funciona bem até ~8 pessoas
const START_COINS = 200;
const DAILY_COINS = 50;

// ---------- Persistência simples em JSON ----------
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
fs.mkdirSync(DATA_DIR, { recursive: true });
let users = {};
try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch { users = {}; }
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), () => {}), 200);
}

function hashPassword(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') };
}
function ageFrom(birthDate) {
  const b = new Date(birthDate);
  if (isNaN(b)) return -1;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
function publicUser(u) {
  return {
    id: u.id, name: u.name, coins: u.coins, avatar: u.avatar, owned: u.owned,
    vip: !!u.vip, friends: u.friends || [], canClaimDaily: u.lastDaily !== today(),
  };
}
function today() { return new Date().toISOString().slice(0, 10); }
function byToken(token) {
  if (!token) return null;
  return Object.values(users).find((u) => u.token === token) || null;
}
function owns(u, id) {
  const it = findItem(id);
  if (!it) return false;
  return it.price === 0 || u.vip && it.slot === 'reaction' || u.owned.includes(id);
}
function addCoins(u, n) { u.coins += n; save(); pushMe(u); }

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

app.post('/api/register', (req, res) => {
  const { name, password, birthDate } = req.body || {};
  const clean = String(name || '').trim();
  if (!/^[\p{L}\p{N}_.]{3,16}$/u.test(clean)) return res.status(400).json({ error: 'O nome deve ter 3–16 letras, números, _ ou .' });
  if (String(password || '').length < 6) return res.status(400).json({ error: 'A palavra-passe precisa de pelo menos 6 caracteres.' });
  const age = ageFrom(birthDate);
  if (age < MIN_AGE || age > MAX_AGE) return res.status(403).json({ error: `A Malta é para pessoas dos ${MIN_AGE} aos ${MAX_AGE} anos.` });
  if (Object.values(users).some((u) => u.name.toLowerCase() === clean.toLowerCase())) return res.status(409).json({ error: 'Esse nome já existe.' });
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(24).toString('hex');
  users[id] = { id, name: clean, pw: hashPassword(password), birthDate, coins: START_COINS, owned: [], avatar: defaultAvatar(), token, friends: [], lastDaily: null, vip: false };
  save();
  res.json({ token, me: publicUser(users[id]) });
});

app.post('/api/login', (req, res) => {
  const { name, password } = req.body || {};
  const u = Object.values(users).find((x) => x.name.toLowerCase() === String(name || '').toLowerCase());
  if (!u || hashPassword(String(password || ''), u.pw.salt).hash !== u.pw.hash) return res.status(401).json({ error: 'Nome ou palavra-passe errados.' });
  u.token = crypto.randomBytes(24).toString('hex'); save();
  res.json({ token: u.token, me: publicUser(u) });
});

app.get('/api/me', auth, (req, res) => res.json({ me: publicUser(req.user) }));

app.post('/api/daily', auth, (req, res) => {
  const u = req.user;
  if (u.lastDaily === today()) return res.status(400).json({ error: 'Já recebeste o bónus de hoje.' });
  u.lastDaily = today(); addCoins(u, DAILY_COINS);
  res.json({ me: publicUser(u), gained: DAILY_COINS });
});

app.post('/api/avatar', auth, (req, res) => {
  const u = req.user; const a = req.body?.avatar || {};
  const next = { ...u.avatar };
  for (const slot of Object.keys(CATALOG.avatar)) {
    if (!(slot in a)) continue;
    const it = CATALOG.avatar[slot].find((i) => i.id === a[slot]);
    if (!it) return res.status(400).json({ error: 'Item inválido.' });
    if (!owns(u, it.id)) return res.status(402).json({ error: 'Ainda não compraste esse item.' });
    next[slot] = it.id;
  }
  u.avatar = next; save(); refreshInRooms(u);
  res.json({ me: publicUser(u) });
});

app.post('/api/buy', auth, (req, res) => {
  const u = req.user; const it = findItem(req.body?.itemId);
  if (!it || it.price === 0) return res.status(400).json({ error: 'Item inválido.' });
  if (u.owned.includes(it.id)) return res.status(400).json({ error: 'Já tens este item.' });
  if (u.coins < it.price) return res.status(402).json({ error: 'Moedas insuficientes.' });
  u.coins -= it.price; u.owned.push(it.id); save(); refreshInRooms(u);
  res.json({ me: publicUser(u) });
});

// PAGAMENTOS: em produção isto seria um webhook do Stripe / Apple / Google
// que só credita as moedas depois de o pagamento estar confirmado.
// Aqui está em MODO DEMO: credita logo, sem cobrar nada.
app.post('/api/coins/checkout', auth, (req, res) => {
  const u = req.user;
  if (req.body?.packId === 'vip') { u.vip = true; addCoins(u, 200); refreshInRooms(u); return res.json({ me: publicUser(u), demo: true }); }
  const pack = CATALOG.coinPacks.find((p) => p.id === req.body?.packId);
  if (!pack) return res.status(400).json({ error: 'Pacote inválido.' });
  addCoins(u, pack.coins);
  res.json({ me: publicUser(u), demo: true });
});

app.post('/api/friends', auth, (req, res) => {
  const u = req.user; const target = Object.values(users).find((x) => x.name.toLowerCase() === String(req.body?.name || '').toLowerCase());
  if (!target || target.id === u.id) return res.status(404).json({ error: 'Utilizador não encontrado.' });
  u.friends = Array.from(new Set([...(u.friends || []), target.name])); save();
  res.json({ me: publicUser(u) });
});

app.get('/api/friends/online', auth, (req, res) => {
  const list = (req.user.friends || []).map((n) => {
    const f = Object.values(users).find((x) => x.name === n);
    const room = f && [...rooms.values()].find((r) => [...r.members.values()].some((m) => m.userId === f.id));
    return { name: n, online: !!room, room: room ? room.code : null };
  });
  res.json({ friends: list });
});

const reports = [];
app.post('/api/report', auth, (req, res) => {
  reports.push({ by: req.user.name, who: String(req.body?.who || '').slice(0, 32), why: String(req.body?.why || '').slice(0, 300), at: new Date().toISOString() });
  fs.appendFile(path.join(DATA_DIR, 'reports.log'), JSON.stringify(reports.at(-1)) + '\n', () => {});
  res.json({ ok: true });
});

// ---------- Tempo real ----------
const server = http.createServer(app);
const io = new Server(server);
const rooms = new Map(); // code -> room
const userSockets = new Map(); // userId -> Set(socketId)

function newRoom(code) {
  return { code, members: new Map(), yt: { videoId: null, playing: false, time: 0, at: Date.now() }, game: null };
}
function memberView(u) {
  const ex = u.owned.filter((id) => id.startsWith('x_'));
  return { userId: u.id, name: u.name, avatar: u.avatar, extras: ex, vip: !!u.vip };
}
function roomState(r) {
  return { code: r.code, members: [...r.members.entries()].map(([sid, m]) => ({ sid, ...m })), yt: ytNow(r), game: gameView(r) };
}
function ytNow(r) {
  const y = r.yt;
  return { ...y, time: y.playing ? y.time + (Date.now() - y.at) / 1000 : y.time };
}
function pushMe(u) {
  for (const sid of userSockets.get(u.id) || []) io.to(sid).emit('me', publicUser(u));
}
function refreshInRooms(u) {
  for (const r of rooms.values()) {
    let changed = false;
    for (const m of r.members.values()) if (m.userId === u.id) { Object.assign(m, memberView(u)); changed = true; }
    if (changed) io.to(r.code).emit('room', roomState(r));
  }
}
function sysMsg(r, text) { io.to(r.code).emit('chat', { system: true, text, at: Date.now() }); }

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

  socket.on('join', (codeRaw, ack) => {
    const code = String(codeRaw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || randomCode();
    let r = rooms.get(code);
    if (!r) { r = newRoom(code); rooms.set(code, r); }
    if (r.members.size >= (me().vip ? 12 : MAX_ROOM)) return ack?.({ error: 'A sala está cheia.' });
    leave();
    socket.join(code); socket.data.room = code;
    r.members.set(socket.id, memberView(me()));
    ack?.({ ok: true, code, state: roomState(r) });
    socket.to(code).emit('peer-joined', { sid: socket.id, name: me().name });
    io.to(code).emit('room', roomState(r));
    sysMsg(r, `${me().name} entrou na sala 👋`);
  });

  socket.on('leave', leave);
  socket.on('disconnect', () => {
    leave();
    userSockets.get(uid)?.delete(socket.id);
  });

  function leave() {
    const r = room(); if (!r) return;
    r.members.delete(socket.id); socket.leave(r.code); socket.data.room = null;
    io.to(r.code).emit('peer-left', { sid: socket.id });
    if (r.game) gameOnLeave(r, socket.id, me().name);
    if (r.members.size === 0) { clearTimeout(r.game?.timer); rooms.delete(r.code); return; }
    io.to(r.code).emit('room', roomState(r));
    sysMsg(r, `${me().name} saiu`);
  }

  // Chat
  socket.on('chat', (text) => {
    const r = room(); if (!r) return;
    const t = String(text || '').trim().slice(0, 500); if (!t) return;
    if (r.game?.type === 'desenha' && desenhaGuess(r, socket.id, t)) return;
    io.to(r.code).emit('chat', { from: memberView(me()), text: t, at: Date.now() });
  });

  // Reações (as pagas são verificadas no servidor)
  let lastReact = 0;
  socket.on('react', (id) => {
    const r = room(); if (!r) return;
    const it = CATALOG.reactions.find((x) => x.id === id);
    if (!it || !owns(me(), id)) return;
    if (Date.now() - lastReact < 250) return; lastReact = Date.now();
    io.to(r.code).emit('react', { emoji: it.value, big: !!it.big || me().owned.includes('x_bigReact'), from: me().name, sid: socket.id });
  });

  // WebRTC: o servidor só passa mensagens entre pares
  socket.on('signal', ({ to, data }) => {
    const r = room(); if (!r || !r.members.has(to)) return;
    io.to(to).emit('signal', { from: socket.id, data });
  });
  socket.on('media-state', (st) => {
    const r = room(); if (!r) return;
    socket.to(r.code).emit('media-state', { sid: socket.id, cam: !!st?.cam, mic: !!st?.mic });
  });

  // YouTube sincronizado
  socket.on('yt', (msg) => {
    const r = room(); if (!r || !msg) return;
    const y = r.yt; const now = ytNow(r);
    if (msg.type === 'load') {
      const id = parseYouTube(msg.url); if (!id) return socket.emit('toast', 'Link do YouTube inválido.');
      r.yt = { videoId: id, playing: true, time: 0, at: Date.now() };
      sysMsg(r, `${me().name} pôs um vídeo a tocar 🎬`);
    } else if (msg.type === 'play') { r.yt = { ...y, playing: true, time: num(msg.time, now.time), at: Date.now() }; }
    else if (msg.type === 'pause') { r.yt = { ...y, playing: false, time: num(msg.time, now.time), at: Date.now() }; }
    else if (msg.type === 'seek') { r.yt = { ...y, time: num(msg.time, now.time), at: Date.now() }; }
    else if (msg.type === 'stop') { r.yt = { videoId: null, playing: false, time: 0, at: Date.now() }; }
    else return;
    io.to(r.code).emit('yt', { ...ytNow(r), by: socket.id });
  });

  // Jogos
  socket.on('game:start', (type) => {
    const r = room(); if (!r) return;
    if (r.game && !r.game.over) return socket.emit('toast', 'Já há um jogo a decorrer.');
    if (type === 'galo') startGalo(r, socket.id);
    else if (type === 'desenha') startDesenha(r);
    else if (type === 'quiz') startQuiz(r);
  });
  socket.on('game:join', () => { const r = room(); if (r?.game?.type === 'galo') galoJoin(r, socket.id); });
  socket.on('game:move', (cell) => { const r = room(); if (r?.game?.type === 'galo') galoMove(r, socket.id, cell); });
  socket.on('game:answer', (i) => { const r = room(); if (r?.game?.type === 'quiz') quizAnswer(r, socket.id, i); });
  socket.on('game:draw', (stroke) => {
    const r = room(); const g = r?.game;
    if (g?.type !== 'desenha' || g.drawer !== socket.id || g.over) return;
    const pt = (p) => Array.isArray(p) && p.length === 2 && p.every((n) => Number.isFinite(n) && n >= -0.1 && n <= 1.1);
    if (!stroke || !pt(stroke.a) || !pt(stroke.b) || !/^#[0-9a-f]{3,6}$/i.test(stroke.c) || !(stroke.w > 0 && stroke.w <= 30)) return;
    socket.to(r.code).emit('game:draw', { a: stroke.a, b: stroke.b, c: stroke.c, w: stroke.w });
  });
  socket.on('game:clear', () => {
    const r = room(); const g = r?.game;
    if (g?.type === 'desenha' && g.drawer === socket.id) io.to(r.code).emit('game:clear');
  });
  socket.on('game:end', () => { const r = room(); if (r?.game) endGame(r, 'Jogo terminado.'); });
});

function num(v, d) { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : d; }
function randomCode() { return crypto.randomBytes(3).toString('hex').toUpperCase(); }
function parseYouTube(url) {
  const s = String(url || '').trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function userOf(r, sid) { const m = r.members.get(sid); return m && users[m.userId]; }
function nameOf(r, sid) { return r.members.get(sid)?.name || '?'; }
function emitGame(r) { io.to(r.code).emit('game', gameView(r)); }
function endGame(r, msg) {
  if (!r.game) return;
  clearTimeout(r.game.timer);
  r.game.over = true; r.game.message = msg || r.game.message;
  emitGame(r);
}

// ---- Jogo do Galo ----
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function startGalo(r, sid) {
  r.game = { type: 'galo', board: Array(9).fill(null), players: [sid, null], turn: 0, over: false, message: `${nameOf(r, sid)} quer jogar. Quem aceita?` };
  emitGame(r);
}
function galoJoin(r, sid) {
  const g = r.game; if (g.over || g.players[1] || g.players[0] === sid) return;
  g.players[1] = sid; g.message = `Vez de ${nameOf(r, g.players[0])} (❌)`; emitGame(r);
}
function galoMove(r, sid, cell) {
  const g = r.game; if (g.over || !g.players[1]) return;
  if (g.players[g.turn] !== sid || !(cell >= 0 && cell < 9) || g.board[cell]) return;
  g.board[cell] = g.turn === 0 ? 'X' : 'O';
  const win = LINES.find((l) => l.every((i) => g.board[i] === g.board[cell]));
  if (win) {
    g.win = win; const u = userOf(r, sid); if (u) addCoins(u, 10);
    return endGame(r, `${nameOf(r, sid)} ganhou! +10 🪙`);
  }
  if (g.board.every(Boolean)) return endGame(r, 'Empate! 🤝');
  g.turn = 1 - g.turn; g.message = `Vez de ${nameOf(r, g.players[g.turn])} (${g.turn ? '⭕' : '❌'})`;
  emitGame(r);
}

// ---- Desenha & Adivinha ----
const WORDS = ['gato','pizza','guitarra','praia','foguetão','bicicleta','telemóvel','sol','dragão','castelo','futebol','hambúrguer','unicórnio','avião','piscina','cão','robô','arco-íris','vulcão','sereia','bolo','comboio','girafa','fantasma','headphones','skate','montanha','pinguim','banana','tubarão'];
const ROUND_MS = 75000;
function startDesenha(r) {
  if (r.members.size < 2) return sysMsg(r, 'Precisam de pelo menos 2 pessoas para o Desenha & Adivinha.');
  const order = [...r.members.keys()];
  r.game = { type: 'desenha', order, idx: -1, scores: {}, over: false, rounds: Math.min(order.length * 2, 8), played: 0 };
  nextDesenhaRound(r);
}
function nextDesenhaRound(r) {
  const g = r.game; clearTimeout(g.timer);
  g.order = g.order.filter((s) => r.members.has(s));
  if (g.played >= g.rounds || g.order.length < 2) {
    const best = Object.entries(g.scores).sort((a, b) => b[1] - a[1])[0];
    return endGame(r, best ? `Fim! Ganhou ${nameOf(r, best[0])} com ${best[1]} pontos 🏆` : 'Fim do jogo.');
  }
  g.idx = (g.idx + 1) % g.order.length; g.played++;
  g.drawer = g.order[g.idx];
  g.word = WORDS[Math.floor(Math.random() * WORDS.length)];
  g.guessed = []; g.endsAt = Date.now() + ROUND_MS;
  g.message = `${nameOf(r, g.drawer)} está a desenhar…`;
  io.to(r.code).emit('game:clear');
  emitGame(r);
  io.to(g.drawer).emit('game:secret', g.word);
  g.timer = setTimeout(() => { sysMsg(r, `⏰ Acabou o tempo! A palavra era «${g.word}».`); nextDesenhaRound(r); }, ROUND_MS);
}
function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, ''); }
function desenhaGuess(r, sid, text) {
  const g = r.game; if (g.over || sid === g.drawer || g.guessed.includes(sid)) return false;
  if (norm(text) !== norm(g.word)) return false;
  g.guessed.push(sid);
  const pts = Math.max(3, 10 - (g.guessed.length - 1) * 3);
  g.scores[sid] = (g.scores[sid] || 0) + pts; g.scores[g.drawer] = (g.scores[g.drawer] || 0) + 2;
  const u = userOf(r, sid); if (u) addCoins(u, 5);
  sysMsg(r, `✅ ${nameOf(r, sid)} acertou! +${pts} pontos, +5 🪙`);
  emitGame(r);
  if (g.guessed.length >= g.order.length - 1) { sysMsg(r, `A palavra era «${g.word}».`); setTimeout(() => r.game === g && nextDesenhaRound(r), 2000); clearTimeout(g.timer); }
  return true;
}

// ---- Quiz rápido ----
const QUIZ = [
  ['Qual é o planeta mais perto do Sol?', ['Vénus', 'Mercúrio', 'Marte', 'Terra'], 1],
  ['Quantos jogadores tem uma equipa de futebol em campo?', ['10', '11', '12', '9'], 1],
  ['Em que país fica Machu Picchu?', ['México', 'Chile', 'Peru', 'Bolívia'], 2],
  ['Qual é o maior oceano?', ['Atlântico', 'Índico', 'Pacífico', 'Ártico'], 2],
  ['Quantos lados tem um hexágono?', ['5', '6', '7', '8'], 1],
  ['Qual destes NÃO é um elemento químico?', ['Ouro', 'Prata', 'Bronze', 'Ferro'], 2],
  ['Qual é a capital da Austrália?', ['Sydney', 'Melbourne', 'Camberra', 'Perth'], 2],
  ['Quem pintou a Mona Lisa?', ['Picasso', 'Da Vinci', 'Van Gogh', 'Dalí'], 1],
  ['Qual é o animal terrestre mais rápido?', ['Leão', 'Chita', 'Cavalo', 'Antílope'], 1],
  ['Quantos minutos tem um dia?', ['1440', '1200', '1600', '960'], 0],
  ['Qual é o rio mais longo de Portugal?', ['Douro', 'Tejo', 'Mondego', 'Guadiana'], 1],
  ['Que idioma tem mais falantes nativos?', ['Inglês', 'Espanhol', 'Mandarim', 'Hindi'], 2],
];
function startQuiz(r) {
  const qs = [...QUIZ].sort(() => Math.random() - 0.5).slice(0, 5);
  r.game = { type: 'quiz', qs, qi: -1, scores: {}, over: false };
  nextQuiz(r);
}
function nextQuiz(r) {
  const g = r.game; clearTimeout(g.timer);
  if (g.qi >= 0) sysMsg(r, `Resposta: ${g.qs[g.qi][1][g.qs[g.qi][2]]}`);
  g.qi++;
  if (g.qi >= g.qs.length) {
    const best = Object.entries(g.scores).sort((a, b) => b[1] - a[1])[0];
    if (best) { const u = userOf(r, best[0]); if (u) addCoins(u, 15); }
    return endGame(r, best ? `Fim! ${nameOf(r, best[0])} ganhou com ${best[1]} pontos (+15 🪙)` : 'Fim do quiz — ninguém pontuou.');
  }
  g.answered = {}; g.endsAt = Date.now() + 12000; g.message = `Pergunta ${g.qi + 1}/${g.qs.length}`;
  emitGame(r);
  g.timer = setTimeout(() => nextQuiz(r), 12000);
}
function quizAnswer(r, sid, i) {
  const g = r.game; if (g.over || sid in g.answered) return;
  g.answered[sid] = i;
  if (i === g.qs[g.qi][2]) g.scores[sid] = (g.scores[sid] || 0) + Math.max(1, Math.ceil((g.endsAt - Date.now()) / 1000));
  emitGame(r);
  if (Object.keys(g.answered).length >= r.members.size) { clearTimeout(g.timer); g.timer = setTimeout(() => nextQuiz(r), 1500); }
}

function gameOnLeave(r, sid, who) {
  const g = r.game; if (g.over) return;
  if (g.type === 'galo' && g.players.includes(sid)) endGame(r, `${who} saiu — jogo cancelado.`);
  if (g.type === 'desenha' && g.drawer === sid) { sysMsg(r, 'Quem desenhava saiu. Próxima ronda!'); nextDesenhaRound(r); }
}
function gameView(r) {
  const g = r.game; if (!g) return null;
  const names = (o) => Object.fromEntries(Object.entries(o).map(([s, v]) => [s, { name: nameOf(r, s), v }]));
  if (g.type === 'galo') return { type: 'galo', board: g.board, players: g.players, names: g.players.map((s) => s && nameOf(r, s)), turn: g.turn, over: g.over, win: g.win, message: g.message };
  if (g.type === 'desenha') return { type: 'desenha', drawer: g.drawer, hint: g.word ? g.word.replace(/[^\s-]/g, '_ ').trim() : '', endsAt: g.endsAt, scores: names(g.scores), guessed: g.guessed, over: g.over, message: g.message, round: g.played, rounds: g.rounds };
  if (g.type === 'quiz') { const q = g.qs[g.qi]; return { type: 'quiz', q: q && q[0], options: q && q[1], endsAt: g.endsAt, answered: Object.keys(g.answered || {}), scores: names(g.scores), over: g.over, message: g.message }; }
}

server.listen(PORT, () => console.log(`Malta a correr em http://localhost:${PORT}`));
