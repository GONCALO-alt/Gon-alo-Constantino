/* =====================================================================
   Núcleo: utilitários, ícones, estado partilhado e persistente
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const MIN = 60000, HOUR = 3600000, DAY = 86400000;
const dots = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function fmt(n) {
  n = Math.round(n || 0);
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',').replace(',0', '') + ' M';
  if (n >= 1e4) return Math.round(n / 1e3) + ' mil';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.', ',').replace(',0', '') + ' mil';
  return String(n);
}
const pad = n => String(n).padStart(2, '0');
const hhmm = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
function sameDay(a, b) { const x = new Date(a), y = new Date(b); return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate(); }
function dayLabel(t) {
  const now = Date.now();
  if (sameDay(t, now)) return 'Hoje';
  if (sameDay(t, now + DAY)) return 'Amanhã';
  if (sameDay(t, now - DAY)) return 'Ontem';
  const d = new Date(t);
  return DAYS[d.getDay()] + ', ' + d.getDate() + ' de ' + MONTHS[d.getMonth()];
}
const whenLabel = t => dayLabel(t) + ' · ' + hhmm(t);
function ago(t) {
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 45) return 'agora';
  if (s < 3600) return Math.round(s / 60) + ' min';
  if (s < 86400) return Math.round(s / 3600) + ' h';
  if (s < 7 * 86400) return Math.round(s / 86400) + ' d';
  const d = new Date(t); return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3);
}
function cdParts(ms) {
  ms = Math.max(0, ms);
  const d = Math.floor(ms / DAY), h = Math.floor(ms % DAY / HOUR), m = Math.floor(ms % HOUR / MIN), s = Math.floor(ms % MIN / 1000);
  return { d, h, m, s };
}
function cdShort(ms) {
  const { d, h, m, s } = cdParts(ms);
  if (d) return `${d} d ${h} h`;
  if (h) return `${h} h ${pad(m)} min`;
  return `${pad(m)}:${pad(s)}`;
}
function durLabel(ms) {
  const { h, m, s } = cdParts(ms);
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
const hashtags = t => [...new Set((String(t || '').match(/#[\p{L}\d_]+/gu) || []).map(x => x.toLowerCase()))];
function toLocalInput(t) { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function richText(t) {
  return esc(t)
    .replace(/#([\p{L}\d_]+)/gu, '<button class="ht" data-act="tag" data-tag="#$1">#$1</button>')
    .replace(/(^|\s)@([\w.]+)/g, '$1<span class="mn">@$2</span>');
}

/* ---------- Ícones (traço) ---------- */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  studio: '<rect x="2" y="5" width="15" height="14" rx="3"/><path d="m17 10 5-3v10l-5-3"/>',
  clip: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  reply: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  repost: '<path d="M4 9V7a2 2 0 0 1 2-2h12l-3-3M20 15v2a2 2 0 0 1-2 2H6l3 3"/>',
  save: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  pin: '<path d="M9 3h6l-1 6 4 4H6l4-4zM12 13v8"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
  share: '<path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M9 20h6M12 14v6"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  chevL: '<path d="m15 5-7 7 7 7"/>', chevR: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3 2.4 3.5 5.5"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
};
const icon = (n, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${IC[n] || ''}</svg>`;
const VERIFIED = `<span class="verified" title="Selo de verificação fictício"><svg viewBox="0 0 24 24" aria-label="Verificado (fictício)"><defs><linearGradient id="vg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9b6bff"/><stop offset=".6" stop-color="#4d8dff"/><stop offset="1" stop-color="#ff4fa8"/></linearGradient></defs><path fill="url(#vg)" d="M12 1.5l2.6 1.9 3.2-.2 1 3 2.6 1.9-1 3 1 3-2.6 1.9-1 3-3.2-.2L12 22.5l-2.6-1.9-3.2.2-1-3-2.6-1.9 1-3-1-3 2.6-1.9 1-3 3.2.2z"/><path d="m8 12.2 2.6 2.6L16.2 9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
const SIM = (t = 'fictício') => `<span class="sim-tag" title="Valor simulado — não é real">${t}</span>`;

/* ---------- Estado ---------- */
const LV_KEY = 'liveverse:v1';
let S = null;
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const copy = { ...S, live: S.live ? { ...S.live, chat: [] } : null };
      localStorage.setItem(LV_KEY, JSON.stringify(copy));
    } catch (e) { /* armazenamento indisponível ou cheio */ }
  }, 300);
}
function load() {
  try { const raw = localStorage.getItem(LV_KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) return s; } } catch (e) { }
  return null;
}

function seedState() {
  const now = Date.now();
  const t18 = new Date(); t18.setHours(18, 0, 0, 0);
  let evStart = t18.getTime();
  if (now > evStart + 50 * MIN) evStart += DAY;

  const accounts = [
    { id: 'a1', name: 'Rita Pixel', handle: 'ritapixel', hue: 320, followers: 184200, verified: true, cat: 'Gaming', games: ['minecraft', 'roblox'], bio: 'Construo mundos e destruo recordes. Lives diárias às 21h 💜', followed: true },
    { id: 'a2', name: 'Duarte Clutch', handle: 'duarteclutch', hue: 200, followers: 92500, verified: true, cat: 'FPS competitivo', games: ['valorant', 'fortnite'], bio: 'Jogador competitivo. 1v5 é só mais um dia.', followed: true },
    { id: 'a3', name: 'Sombra Lusa', handle: 'sombralusa', hue: 270, followers: 64300, verified: false, cat: 'Terror', games: ['phasmo', 'amnesia'], bio: 'Jogos de terror com as luzes apagadas 👻', followed: false },
    { id: 'a4', name: 'Mafalda Goals', handle: 'mafaldagoals', hue: 160, followers: 51800, verified: true, cat: 'Desporto', games: ['eafc', 'rocket'], bio: 'Ultimate Team, golos e muita emoção ⚽', followed: false },
    { id: 'a5', name: 'Tiago Turbo', handle: 'tiagoturbo', hue: 30, followers: 27900, verified: false, cat: 'Variedades', games: ['gta6', 'rocket'], bio: 'Carros, caos e gargalhadas. Agora a explorar Vice City no GTA VI 🌴', followed: false },
    { id: 'a6', name: 'Inês Arcade', handle: 'inesarcade', hue: 350, followers: 133000, verified: true, cat: 'Variedades', games: ['roblox', 'fortnite'], bio: 'A rainha dos mini-jogos 🎮', followed: true },
    { id: 'a7', name: 'Leo Lendas', handle: 'leolendas', hue: 230, followers: 78100, verified: false, cat: 'Gaming', games: ['lol'], bio: 'Main mid. Pentakills ao domingo.', followed: false },
    { id: 'a8', name: 'Kiko Mapas', handle: 'kikomapas', hue: 45, followers: 15400, verified: false, cat: 'Speedrun', games: ['gta6', 'minecraft'], bio: 'Speedruns e explorações de mapas. A descobrir todos os segredos do GTA VI.', followed: false },
  ];
  const me = {
    id: 'me', name: 'Nova Play', handle: 'novaplay', hue: 275, avatar: null, banner: null, cover: 0,
    bio: 'Criador de conteúdo no LiveVerse 🎮 Lives de Fortnite e Minecraft, desafios e muita comunidade.\nObjetivo do ano: 100 mil espectadores virtuais numa live! ⭐',
    category: 'Battle Royale', games: ['fortnite', 'minecraft', 'valorant'], verified: true,
    followers: 12480, followingBase: 146, accent: 'purple', xp: 640, viewsBase: 186400,
    agenda: [{ day: 2, time: '18:00', game: 'fortnite' }, { day: 4, time: '21:00', game: 'minecraft' }, { day: 6, time: '16:00', game: 'fortnite' }],
  };

  const ev1 = {
    id: 'ev_superstar', owner: 'me', title: 'FORTNITE — MODO SUPERSTAR',
    desc: 'Hoje às 18:00 vou entrar em live no Modo Superstar! Quero chegar aos 100 mil espectadores virtuais. Apareçam!',
    game: 'fortnite', mode: 'superstar', level: 'enorme', start: evStart, cover: { type: 'preset', v: 0 },
    countdown: true, reminders: true, cancelled: false, liveId: null, endedAt: null, interested: 864, notified: {},
    reminderUsers: 312, createdAt: now - 3 * HOUR, postId: 'p_ev1', myReminder: true,
  };
  const others = [
    { id: 'ev_o1', owner: 'a1', title: 'Construção épica: castelo gigante', desc: 'Vamos construir o maior castelo do servidor! Tragam ideias.', game: 'minecraft', mode: 'maratona', level: 'grande', start: now - 35 * MIN, dur: 3 * HOUR, cover: { type: 'preset', v: 5 }, interested: 12400, viewers: 18600 },
    { id: 'ev_o2', owner: 'a2', title: 'Torneio Valorant — Final', desc: 'A grande final do torneio da comunidade. Melhor de 3!', game: 'valorant', mode: 'torneio', level: 'grande', start: now + 2 * HOUR + 15 * MIN, dur: 2 * HOUR, cover: { type: 'preset', v: 1 }, interested: 6300 },
    { id: 'ev_o3', owner: 'a3', title: 'Noite de terror às escuras', desc: 'Phasmophobia sem lanterna. Quem aguenta até ao fim?', game: 'phasmo', mode: 'chill', level: 'media', start: now + DAY + 4 * HOUR, dur: 2 * HOUR, cover: { type: 'preset', v: 2 }, interested: 2900 },
    { id: 'ev_o4', owner: 'a6', title: 'Mini-jogos com a comunidade', desc: 'Jogos rápidos, prémios virtuais e muitas gargalhadas.', game: 'roblox', mode: 'casual', level: 'grande', start: now + 3 * DAY + 2 * HOUR, dur: 2 * HOUR, cover: { type: 'preset', v: 4 }, interested: 8800 },
    { id: 'ev_o5', owner: 'a4', title: 'FUT Champions ao vivo', desc: 'Fim de semana de Champions com o chat a escolher a equipa.', game: 'eafc', mode: 'competitivo', level: 'media', start: now - 2 * DAY, dur: 2 * HOUR, cover: { type: 'preset', v: 5 }, interested: 4100 },
  ].map(e => ({ countdown: true, reminders: true, cancelled: false, notified: {}, reminderUsers: Math.round(e.interested * .4), createdAt: now - DAY, myReminder: false, myInterest: false, ...e }));

  const lives = [
    { id: 'l1', title: 'Arena com o chat', game: 'fortnite', mode: 'competitivo', level: 'media', start: now - 3 * DAY - 2 * HOUR, end: now - 3 * DAY, peak: 6420, views: 11800, followers: 312, gifts: 1840, likes: 9400, reactions: 14, timeline: [] },
    { id: 'l2', title: 'À procura de diamantes', game: 'minecraft', mode: 'chill', level: 'media', start: now - 6 * DAY - 3 * HOUR, end: now - 6 * DAY - HOUR, peak: 4210, views: 8100, followers: 198, gifts: 920, likes: 6100, reactions: 9, timeline: [] },
    { id: 'l3', title: 'Ranked até cair', game: 'valorant', mode: 'competitivo', level: 'pequena', start: now - 10 * DAY - 2 * HOUR, end: now - 10 * DAY, peak: 980, views: 1900, followers: 64, gifts: 210, likes: 1500, reactions: 6, timeline: [] },
  ];
  const clips = [
    { id: 'c1', title: 'Clutch 1v3 na zona final', game: 'fortnite', streamer: 'me', type: 'Clutch', emoji: '🎯', popularity: 82, likes: 1840, comments: 132, onProfile: true, createdAt: now - 3 * DAY, liveId: 'l1', liked: false, commentsList: [] },
    { id: 'c2', title: 'Diamantes à primeira picaretada', game: 'minecraft', streamer: 'me', type: 'Item raro', emoji: '💎', popularity: 64, likes: 920, comments: 71, onProfile: true, createdAt: now - 6 * DAY, liveId: 'l2', liked: false, commentsList: [] },
    { id: 'c3', title: 'Caí da ponte sozinho 😂', game: 'fortnite', streamer: 'me', type: 'Momento engraçado', emoji: '😂', popularity: 71, likes: 1310, comments: 204, onProfile: false, createdAt: now - 3 * DAY + 20 * MIN, liveId: 'l1', liked: false, commentsList: [] },
    { id: 'c4', title: 'O fantasma apareceu na cozinha', game: 'phasmo', streamer: 'a3', type: 'Jump scare', emoji: '😱', popularity: 90, likes: 8400, comments: 640, onProfile: true, createdAt: now - DAY, liked: false, commentsList: [] },
    { id: 'c5', title: 'Castelo de diamante terminado', game: 'minecraft', streamer: 'a1', type: 'Grande conquista', emoji: '⚡', popularity: 77, likes: 12100, comments: 980, onProfile: true, createdAt: now - 2 * DAY, liked: false, commentsList: [] },
  ];

  const P = (o) => ({ id: uid(), type: 'text', text: '', createdAt: now, likes: 0, liked: false, reposts: 0, reposted: false, saved: false, views: 0, replies: [], status: 'published', ...o });
  const posts = [
    P({ id: 'p_ev1', author: 'me', type: 'event', eventId: ev1.id, text: null, createdAt: ev1.createdAt, likes: 742, reposts: 96, views: 18200,
      replies: [{ id: uid(), author: 'a2', text: 'Lá estarei! Bora aos 100 mil 🔥', t: now - 2 * HOUR }, { id: uid(), author: 'a6', text: 'Já ativei o lembrete ⏰', t: now - HOUR }] }),
    P({ author: 'me', type: 'clip', clipId: 'c1', text: 'O clutch da última live ainda me dá arrepios 😮‍💨 #fortnite #clips', createdAt: now - 2 * DAY, likes: 1290, reposts: 140, views: 24100 }),
    P({ author: 'me', type: 'text', text: 'Obrigado pelos 12 mil seguidores fictícios 💜 A próxima meta é a live de 100 mil espectadores virtuais! #LiveVerse #comunidade', createdAt: now - 4 * DAY, likes: 2120, reposts: 230, views: 31500 }),
    P({ author: 'a1', type: 'live', game: 'minecraft', eventId: 'ev_o1', text: 'ESTOU EM DIRETO! Construção épica do castelo gigante 🏰 #minecraft', createdAt: now - 34 * MIN, likes: 3400, reposts: 410, views: 52000 }),
    P({ author: 'a2', type: 'event', eventId: 'ev_o2', text: 'Final do torneio hoje! Quem vem torcer? #valorant #torneio', createdAt: now - 5 * HOUR, likes: 1880, reposts: 260, views: 30100 }),
    P({ author: 'a6', type: 'poll', text: 'Qual mini-jogo jogamos primeiro na próxima live? #roblox', createdAt: now - 7 * HOUR, likes: 920, reposts: 44, views: 15300,
      poll: { options: [{ t: 'Tower of Hell', v: 1840 }, { t: 'Escondidas', v: 1290 }, { t: 'Corrida de obstáculos', v: 960 }], myVote: null, ends: now + DAY } }),
    P({ author: 'a3', type: 'clip', clipId: 'c4', text: 'Nunca mais jogo sozinho à noite 😭👻 #terror #phasmophobia', createdAt: now - 20 * HOUR, likes: 5100, reposts: 820, views: 88000 }),
    P({ author: 'a4', type: 'game', game: 'eafc', text: 'Golo de bicicleta no minuto 90 para ganhar a final. Ainda estou a tremer ⚽ #eafc', createdAt: now - 26 * HOUR, likes: 2600, reposts: 190, views: 41000 }),
    P({ author: 'a7', type: 'text', text: 'Domingo há live com o chat a escolher os campeões. Preparem as sugestões! #lol', createdAt: now - 30 * HOUR, likes: 740, reposts: 38, views: 12100 }),
  ];
  const notifs = [
    { id: uid(), icon: '💜', text: '842 utilizadores fictícios começaram a seguir-te esta semana.', t: now - 5 * HOUR, read: false },
    { id: uid(), icon: '🔔', text: '«FORTNITE — MODO SUPERSTAR» já tem centenas de pessoas fictícias interessadas.', t: now - 2 * HOUR, read: false, link: { ev: ev1.id } },
  ];
  return {
    v: 1, me, accounts, posts, events: [ev1, ...others], lives, clips, notifs,
    ach: { first_post: now - 10 * DAY, first_live: now - 10 * DAY, live_1k: now - 6 * DAY, first_clip: now - 6 * DAY, first_event: now - 3 * HOUR },
    pinned: 'p_ev1', live: null, stats: { reactions: 29, clipsMade: 3, polls: 0 },
    lastOtherPost: now, createdAt: now,
  };
}

/* ---------- Contas ---------- */
const acc = id => id === 'me' ? S.me : (S.accounts.find(a => a.id === id) || { id, name: 'Conta fictícia', handle: 'conta', hue: 200, followers: 0 });
function avatar(a, size = 44, cls = '') {
  const initials = esc((a.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase());
  const inner = a.avatar ? `<img src="${a.avatar}" alt="">` : initials;
  return `<a class="av ${cls}" href="#${a.id === 'me' ? 'perfil' : 'conta-' + a.id}" style="--s:${size}px;--h:${a.hue || 270}" aria-label="Perfil de ${esc(a.name)}">${inner}</a>`;
}
const nameLine = a => `<strong>${esc(a.name)}</strong>${a.verified ? VERIFIED : ''}`;
const gicon = (g, size = 28) => { const G = GAMES[g] || GAMES.chat; return `<span class="gicon" style="--gc:${G.color};--s:${size}px" title="${esc(G.name)}">${G.glyph}</span>`; };
const followingCount = () => S.me.followingBase + S.accounts.filter(a => a.followed).length;
const totalLives = () => S.lives.length;
const totalViews = () => S.me.viewsBase + S.lives.reduce((s, l) => s + (l.views || 0), 0);
function career(xp = S.me.xp) {
  let i = 0; while (i + 1 < CAREER.length && xp >= CAREER[i + 1][0]) i++;
  const cur = CAREER[i][0], next = CAREER[i + 1] ? CAREER[i + 1][0] : null;
  return { level: i + 1, name: CAREER[i][1], xp, cur, next, pct: next ? (xp - cur) / (next - cur) * 100 : 100 };
}
function addXP(n) {
  const before = career().level; S.me.xp += Math.round(n);
  const after = career();
  if (after.level > before) { notify('🎖️', `Subiste para o nível de carreira ${after.level}: ${after.name}!`); if (S.live) (S.live.achQueue = S.live.achQueue || []).push(`Nível ${after.level} — ${after.name}`); else toast('🎖️', `Nível ${after.level} — ${after.name}`); }
}
function coverCSS(c) {
  if (!c) return COVERS[0];
  if (c.type === 'img') return `url("${c.v}") center/cover`;
  return COVERS[c.v % COVERS.length];
}

/* ---------- Notificações e toasts ---------- */
function notify(ic, text, link) {
  S.notifs.unshift({ id: uid(), icon: ic, text, t: Date.now(), read: false, link: link || null });
  S.notifs = S.notifs.slice(0, 120);
  save(); paintBadges();
}
function toast(ic, text, ms = 3600) {
  // durante a live só passam avisos importantes (erros e câmara/ecrã/microfone)
  if (S && S.live && !['⚠️', '📷', '🎮', '🎥', '🎙️', '🔴'].includes(ic)) return;
  const box = $('#toasts'); if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast'; el.innerHTML = `<span class="ico">${ic}</span><span>${esc(text)}</span>`;
  box.prepend(el);
  while (box.children.length > 4) box.lastChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms);
}

/* ---------- Conquistas ---------- */
function unlock(id) {
  if (S.ach[id]) return;
  const a = ACHIEVEMENTS.find(x => x.id === id); if (!a) return;
  S.ach[id] = Date.now();
  addXP(80);
  notify(a.icon, `Conquista desbloqueada: ${a.name}. Podes anunciá-la no feed.`, { ach: id });
  // durante a live fica em silêncio; aparece tudo junto quando a live termina
  if (S.live) (S.live.achQueue = S.live.achQueue || []).push(a.name);
  else toast(a.icon, `Conquista desbloqueada: ${a.name}`);
  save();
}
function checkAch() {
  const mine = S.posts.filter(p => p.author === 'me' && p.status === 'published');
  if (mine.length) unlock('first_post');
  if (S.pinned) unlock('pinned');
  if (S.events.some(e => e.owner === 'me')) unlock('first_event');
  if (S.events.some(e => e.owner === 'me' && e.interested >= 1000)) unlock('event_1k');
  if (S.lives.length || S.live) unlock('first_live');
  const peak = Math.max(0, ...S.lives.map(l => l.peak), S.live ? S.live.peak : 0);
  if (peak >= 1000) unlock('live_1k');
  if (peak >= 10000) unlock('live_10k');
  if (peak >= 100000) unlock('live_100k');
  if (S.stats.reactions >= 25) unlock('reactions_25');
  if (S.stats.clipsMade >= 1) unlock('first_clip');
  if (S.stats.clipsMade >= 10) unlock('clips_10');
  if (S.stats.polls >= 1) unlock('poll');
  if (S.me.followers >= 25000) unlock('followers_25k');
  if (S.live && S.live.gifts >= 10000) unlock('gifts_10k');
}

/* ---------- Eventos: estado e simulação ---------- */
function eventStatus(ev, now = Date.now()) {
  if (ev.cancelled) return 'cancelled';
  if (ev.owner === 'me') {
    if (S.live && S.live.eventId === ev.id) return 'live';
    if (ev.endedAt) return 'ended';
    if (now < ev.start - 5 * MIN) return 'scheduled';
    if (now < ev.start + 6 * HOUR) return 'soon';
    return 'ended';
  }
  if (now < ev.start) return 'scheduled';
  if (now < ev.start + (ev.dur || 2 * HOUR)) return 'live';
  return 'ended';
}
const STATUS_LABEL = { scheduled: 'Agendado', soon: 'A começar em breve', live: 'Em direto', ended: 'Terminado', cancelled: 'Cancelado' };

function simulateEvents(now) {
  for (const ev of S.events) {
    const st = eventStatus(ev, now);
    const lvl = LEVELS[ev.level] || LEVELS.media;
    if (st === 'scheduled' || st === 'soon') {
      const cap = ev.owner === 'me' ? 6 + S.me.followers * 1.2 + lvl.max * .004 : lvl.max * 0.22;
      if (ev.interested < cap && Math.random() < (ev.owner === 'me' ? .25 : .55)) {
        ev.interested += Math.max(1, Math.round(rand(.2, 1) * (ev.owner === 'me' ? cap / 120 : lvl.max / 3500) * (MODES[ev.mode]?.hype || 1)));
        ev.reminderUsers = Math.round(ev.interested * .42);
      }
    }
    if (ev.owner === 'me') ownEventNotifications(ev, st, now);
    else if (ev.myReminder) otherEventNotifications(ev, st, now);
  }
}
function ownEventNotifications(ev, st, now) {
  const n = ev.notified || (ev.notified = {});
  const left = ev.start - now;
  const lvl = LEVELS[ev.level] || LEVELS.media;
  const link = { ev: ev.id };
  if (st === 'cancelled' || st === 'ended') return;
  if (ev.interested >= 1000 && !n.k1) { n.k1 = 1; notify('🔔', `1.000 utilizadores fictícios estão interessados no teu evento «${ev.title}».`, link); toast('🔔', '1.000 utilizadores fictícios interessados no teu evento!'); checkAch(); }
  if (ev.interested >= Math.max(2500, lvl.max * .05) && !n.trend) { n.trend = 1; notify('📈', `O teu evento «${ev.title}» está a ser tendência na simulação.`, link); toast('📈', 'O teu evento está a ser tendência na simulação.'); }
  if (!ev.reminders) return;
  if (left <= 30 * MIN && left > 5 * MIN && !n.m30) { n.m30 = 1; notify('⏰', `O teu evento «${ev.title}» começa daqui a 30 minutos!`, link); toast('⏰', 'O teu evento começa daqui a 30 minutos!'); }
  if (left <= 5 * MIN && left > 0 && !n.m5) { n.m5 = 1; n.m30 = 1; notify('⏰', `O teu evento «${ev.title}» começa daqui a 5 minutos!`, link); toast('⏰', 'O teu evento começa daqui a 5 minutos!'); }
  if (left <= 0 && st === 'soon' && !n.start) { n.start = 1; n.m5 = 1; n.m30 = 1; notify('🎬', `Chegou a hora de «${ev.title}». Carrega em «Começar live».`, link); toast('🎬', 'Chegou a hora do teu evento! Começa a live.'); }
  if (left <= -2 * MIN && st === 'soon' && !n.wait) { n.wait = 1; notify('👥', 'A tua comunidade está à espera da tua live!', link); toast('👥', 'A tua comunidade está à espera da tua live!'); }
}
function otherEventNotifications(ev, st, now) {
  const n = ev.notified || (ev.notified = {});
  const a = acc(ev.owner), left = ev.start - now, link = { ev: ev.id };
  if (st === 'scheduled' && left <= 30 * MIN && !n.m30) { n.m30 = 1; notify('⏰', `${a.name} entra em direto daqui a 30 minutos: «${ev.title}».`, link); }
  if (st === 'live' && !n.live) { n.live = 1; n.m30 = 1; notify('🔴', `${a.name} está agora em direto: «${ev.title}».`, link); toast('🔴', `${a.name} está em direto!`); }
}

function eventPostText(ev) {
  const lvl = LEVELS[ev.level] || LEVELS.media;
  const when = dayLabel(ev.start).toUpperCase();
  return `🎮 LIVE ${when} — ${hhmm(ev.start)}\n\n${ev.title} 🔥\n\n${ev.desc}\n\nO objetivo: chegar aos ${dots(lvl.max)} espectadores virtuais!\n\nVenham participar na simulação, votar no chat, enviar presentes virtuais e acompanhar a diversão. #${(GAMES[ev.game]?.name || 'live').replace(/[^\p{L}\d]/gu, '').toLowerCase()} #LiveVerse`;
}
