// Malta FC — jogadores fictícios, pacotes, plantel e jogos de futebol 1 contra 1.
// Os jogadores são gerados com uma semente fixa: o mesmo id é sempre o mesmo jogador.
const crypto = require('crypto');

// ---------- Jogadores ----------
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const NAT = {
  PT: { flag: '🇵🇹', first: ['Tiago', 'Rúben', 'Diogo', 'Gonçalo', 'Rafael', 'Nuno', 'Hugo', 'Vasco', 'Duarte', 'Rodrigo', 'Tomás', 'Afonso', 'Martim', 'Simão', 'Leandro', 'Salvador'], last: ['Almeida', 'Carvalho', 'Moreira', 'Sousa', 'Pinto', 'Teixeira', 'Correia', 'Matos', 'Barros', 'Antunes', 'Fontes', 'Brito', 'Seixas', 'Valente', 'Quintela', 'Gouveia'] },
  BR: { flag: '🇧🇷', first: ['Caio', 'Matheus', 'Lucas', 'Gabriel', 'Igor', 'Felipe', 'Renan', 'Wesley', 'Everton', 'Juninho', 'Kauã', 'Davi'], last: ['Oliveira', 'Rocha', 'Nogueira', 'Araújo', 'Cardoso', 'Barbosa', 'Freitas', 'Moura', 'Peixoto', 'Bezerra', 'Queiroz', 'Damasceno'] },
  ES: { flag: '🇪🇸', first: ['Pablo', 'Álvaro', 'Sergio', 'Iker', 'Javier', 'Adrián', 'Unai', 'Aitor', 'Gonzalo', 'Íñigo'], last: ['Navarro', 'Ortega', 'Delgado', 'Romero', 'Herrera', 'Iglesias', 'Molina', 'Castillo', 'Arrieta', 'Zubiría'] },
  FR: { flag: '🇫🇷', first: ['Théo', 'Maxime', 'Antoine', 'Yanis', 'Enzo', 'Mathis', 'Nolan', 'Rayan', 'Bastien', 'Clément'], last: ['Lefèvre', 'Moreau', 'Girard', 'Fontaine', 'Rousseau', 'Blanchard', 'Garnier', 'Chevalier', 'Marchand', 'Perrin'] },
  AR: { flag: '🇦🇷', first: ['Facundo', 'Nicolás', 'Franco', 'Joaquín', 'Santiago', 'Matías', 'Agustín', 'Tomás', 'Lautaro', 'Bautista'], last: ['Sosa', 'Acosta', 'Benítez', 'Medina', 'Ledesma', 'Quiroga', 'Villalba', 'Ojeda', 'Godoy', 'Paredes'] },
  AO: { flag: '🇦🇴', first: ['Edson', 'Wilson', 'Nelson', 'Djalma', 'Ivanildo', 'Jacinto', 'Adilson', 'Hélder'], last: ['Tavares', 'Semedo', 'Fortes', 'Monteiro', 'Varela', 'Cabral', 'Kiala', 'Nzinga'] },
  CV: { flag: '🇨🇻', first: ['Kelvin', 'Jandir', 'Elvis', 'Dário', 'Ryan', 'Admir', 'Garry', 'Kenny'], last: ['Mendes', 'Lopes', 'Semedo', 'Rodrigues', 'Furtado', 'Gomes', 'Andrade', 'Delgado'] },
  NL: { flag: '🇳🇱', first: ['Daan', 'Sem', 'Luuk', 'Bram', 'Thijs', 'Jesse', 'Milan', 'Jelle'], last: ['de Vries', 'Jansen', 'Visser', 'Bakker', 'Smit', 'Mulder', 'de Boer', 'Meijer'] },
  IT: { flag: '🇮🇹', first: ['Lorenzo', 'Matteo', 'Alessandro', 'Davide', 'Federico', 'Simone', 'Riccardo', 'Gabriele'], last: ['Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Conti', 'Galli'] },
  GB: { flag: '🇬🇧', first: ['Jack', 'Harry', 'Oliver', 'Charlie', 'Callum', 'Reece', 'Jordan', 'Alfie'], last: ['Walker', 'Wright', 'Hughes', 'Turner', 'Hall', 'Wood', 'Clarke', 'Fletcher'] },
};
const NICKS = ['Maestro', 'Muralha', 'Foguete', 'Mágico', 'Tornado', 'Pantera', 'Canhão', 'Gigante', 'Fenómeno', 'Matador', 'Leão', 'Relâmpago', 'Polvo', 'Bailarino', 'Furacão', 'Professor', 'Cometa', 'Tanque', 'Feiticeiro', 'Águia'];
const RARITY = {
  bronze: { min: 50, max: 64, count: 160, sell: 10, name: 'Bronze' },
  prata: { min: 65, max: 74, count: 110, sell: 30, name: 'Prata' },
  ouro: { min: 75, max: 84, count: 70, sell: 100, name: 'Ouro' },
  lenda: { min: 85, max: 95, count: 20, sell: 400, name: 'Lenda' },
};
const POS_MIX = ['GR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'AV', 'AV', 'AV'];
const SKINS = ['skin1', 'skin2', 'skin3', 'skin4', 'skin5'], HAIR = ['hairNone', 'hairShort', 'hairShort', 'hairLong', 'hairCurly', 'hairMohawk', 'hairBuns'];
const HC = ['hcBlack', 'hcBrown', 'hcBlond', 'hcRed', 'hcBlack', 'hcBrown'];
const KIT = { bronze: 'outGrey', prata: 'outBlue', ouro: 'outNeon', lenda: 'outHot' };

const POOL = []; const BY_ID = new Map();
(function build() {
  const r = rng(20261114); const nats = Object.keys(NAT); let id = 1; const used = new Set();
  for (const [rar, R] of Object.entries(RARITY)) {
    for (let i = 0; i < R.count; i++) {
      const nat = nats[Math.floor(r() * nats.length)]; const N = NAT[nat];
      let name; do { name = `${N.first[Math.floor(r() * N.first.length)]} ${N.last[Math.floor(r() * N.last.length)]}`; } while (used.has(name)); used.add(name);
      const pos = POS_MIX[Math.floor(r() * POS_MIX.length)];
      const rating = R.min + Math.floor(Math.pow(r(), 1.6) * (R.max - R.min + 1));
      const face = { skin: SKINS[Math.floor(r() * 5)], hair: HAIR[Math.floor(r() * HAIR.length)], hairColor: HC[Math.floor(r() * HC.length)], eyes: rar === 'lenda' ? 'eyesStar' : 'eyesDot', accessory: rar === 'lenda' ? 'accCrown' : 'accNone', outfit: KIT[rar], bg: rar === 'lenda' ? 'bgGalaxy' : rar === 'ouro' ? 'bgSunset' : 'bgDark' };
      const p = { id: id++, name, nick: rar === 'lenda' ? NICKS[i % NICKS.length] : null, nat, flag: N.flag, pos, rating, rarity: rar, face };
      POOL.push(p); BY_ID.set(p.id, p);
    }
  }
})();

// ---------- Pacotes ----------
const PACKS = [
  { id: 'daily', name: 'Pacote diário', price: 0, size: 3, odds: { bronze: 75, prata: 23, ouro: 2 }, desc: 'Grátis uma vez por dia' },
  { id: 'bronze', name: 'Pacote Bronze', price: 100, size: 5, odds: { bronze: 80, prata: 18, ouro: 2 } },
  { id: 'prata', name: 'Pacote Prata', price: 250, size: 5, odds: { bronze: 20, prata: 65, ouro: 14, lenda: 1 } },
  { id: 'ouro', name: 'Pacote Ouro', price: 600, size: 5, odds: { prata: 45, ouro: 52, lenda: 3 }, guarantee: 'ouro' },
  { id: 'lenda', name: 'Pacote Lenda', price: 1500, size: 3, odds: { ouro: 85, lenda: 15 }, guarantee: 'lenda' },
];
const FORMATIONS = {
  '4-3-3': { slots: ['GR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'AV', 'AV', 'AV'], xy: [[50, 90], [14, 70], [38, 74], [62, 74], [86, 70], [25, 48], [50, 53], [75, 48], [18, 22], [50, 16], [82, 22]] },
  '4-4-2': { slots: ['GR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'AV', 'AV'], xy: [[50, 90], [14, 70], [38, 74], [62, 74], [86, 70], [12, 46], [37, 50], [63, 50], [88, 46], [36, 18], [64, 18]] },
  '3-5-2': { slots: ['GR', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'MED', 'AV', 'AV'], xy: [[50, 90], [25, 72], [50, 75], [75, 72], [10, 46], [30, 50], [50, 42], [70, 50], [90, 46], [36, 18], [64, 18]] },
  '4-2-4': { slots: ['GR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'AV', 'AV', 'AV', 'AV'], xy: [[50, 90], [14, 70], [38, 74], [62, 74], [86, 70], [35, 48], [65, 48], [12, 22], [37, 16], [63, 16], [88, 22]] },
};

function rollRarity(odds) {
  const total = Object.values(odds).reduce((a, b) => a + b, 0); let x = Math.random() * total;
  for (const [k, v] of Object.entries(odds)) { if ((x -= v) < 0) return k; }
  return Object.keys(odds)[0];
}
function randomPlayer(rarity, pos) {
  const list = POOL.filter((p) => p.rarity === rarity && (!pos || p.pos === pos));
  return list[Math.floor(Math.random() * list.length)];
}
const ORDER = ['bronze', 'prata', 'ouro', 'lenda'];

function ensureFut(u) {
  u.fut ??= { players: [], squad: { formation: '4-3-3', slots: Array(11).fill(null) }, lastDaily: null, record: { w: 0, d: 0, l: 0, gf: 0, ga: 0 } };
  if (!u.fut.players.length) {
    // Plantel inicial: chega para fazer um onze (+ 3 suplentes)
    for (const pos of ['GR', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'AV', 'AV', 'AV', 'AV']) {
      u.fut.players.push({ uid: crypto.randomBytes(5).toString('hex'), pid: randomPlayer(Math.random() < 0.25 ? 'prata' : 'bronze', pos).id });
    }
    autoSquad(u);
  }
  return u.fut;
}
function owned(u) { return u.fut.players.map((x) => ({ uid: x.uid, ...BY_ID.get(x.pid) })); }
function autoSquad(u, formation) {
  const f = FORMATIONS[formation || u.fut.squad.formation] ? formation || u.fut.squad.formation : '4-3-3';
  const avail = owned(u).sort((a, b) => b.rating - a.rating); const used = new Set();
  const slots = FORMATIONS[f].slots.map((pos) => { const p = avail.find((x) => x.pos === pos && !used.has(x.uid)); if (p) used.add(p.uid); return p ? p.uid : null; });
  u.fut.squad = { formation: f, slots };
}
function teamStats(u) {
  const f = FORMATIONS[u.fut.squad.formation]; const map = new Map(u.fut.players.map((x) => [x.uid, BY_ID.get(x.pid)]));
  const xi = u.fut.squad.slots.map((uid) => (uid ? map.get(uid) : null));
  const complete = xi.every(Boolean);
  const avg = (pos) => { const l = xi.filter((p, i) => p && f.slots[i] === pos).map((p) => p.rating); return l.length ? l.reduce((a, b) => a + b, 0) / l.length : 40; };
  const nats = {}; xi.filter(Boolean).forEach((p) => (nats[p.nat] = (nats[p.nat] || 0) + 1));
  const chem = Math.min(10, Object.values(nats).reduce((s, n) => s + Math.max(0, n - 1), 0));
  const overall = Math.round(xi.filter(Boolean).reduce((s, p) => s + p.rating, 0) / 11);
  const bonus = 1 + chem / 100;
  return { complete, overall, chem, atk: Math.round((avg('AV') * 0.6 + avg('MED') * 0.4) * bonus), def: Math.round((avg('DEF') * 0.6 + avg('GR') * 0.4) * bonus), xi };
}
function futView(u) {
  ensureFut(u);
  return { players: owned(u), squad: u.fut.squad, stats: (({ xi, ...s }) => s)(teamStats(u)), record: u.fut.record, canDaily: u.fut.lastDaily !== new Date().toISOString().slice(0, 10), packs: PACKS, formations: FORMATIONS, rarity: RARITY };
}

// ---------- Rotas HTTP ----------
function routes(app, auth, { save, bad, addXp }) {
  app.get('/api/fut', auth, (req, res) => { const v = futView(req.user); save(); res.json({ fut: v }); });
  app.post('/api/fut/pack', auth, (req, res) => {
    const u = req.user; ensureFut(u); const pack = PACKS.find((p) => p.id === req.body?.packId);
    if (!pack) return bad(res, 400, 'Pacote inválido.');
    const today = new Date().toISOString().slice(0, 10);
    if (pack.price === 0) { if (u.fut.lastDaily === today) return bad(res, 400, 'Já abriste o pacote diário. Volta amanhã!'); u.fut.lastDaily = today; }
    else { if (u.coins < pack.price) return bad(res, 402, 'Moedas insuficientes.'); u.coins -= pack.price; }
    if (u.fut.players.length + pack.size > 200) return bad(res, 400, 'Plantel cheio (200). Vende alguns jogadores.');
    const got = [];
    for (let i = 0; i < pack.size; i++) got.push(randomPlayer(rollRarity(pack.odds)));
    if (pack.guarantee && !got.some((p) => ORDER.indexOf(p.rarity) >= ORDER.indexOf(pack.guarantee))) got[0] = randomPlayer(pack.guarantee);
    got.sort((a, b) => a.rating - b.rating); // o melhor sai no fim
    const added = got.map((p) => { const o = { uid: crypto.randomBytes(5).toString('hex'), pid: p.id }; u.fut.players.push(o); return { uid: o.uid, ...p }; });
    addXp(u, 3); save();
    res.json({ got: added, fut: futView(u), coins: u.coins });
  });
  app.post('/api/fut/squad', auth, (req, res) => {
    const u = req.user; ensureFut(u); const { formation, slots } = req.body || {};
    const F = FORMATIONS[formation]; if (!F || !Array.isArray(slots) || slots.length !== 11) return bad(res, 400, 'Equipa inválida.');
    const mine = new Map(owned(u).map((p) => [p.uid, p])); const seen = new Set();
    for (let i = 0; i < 11; i++) {
      const uid = slots[i]; if (uid == null) continue;
      const p = mine.get(uid); if (!p || seen.has(uid)) return bad(res, 400, 'Jogador inválido.');
      if (p.pos !== F.slots[i]) return bad(res, 400, `${p.name} não joga a ${F.slots[i]}.`);
      seen.add(uid);
    }
    u.fut.squad = { formation, slots: slots.map((s) => s ?? null) }; save();
    res.json({ fut: futView(u) });
  });
  app.post('/api/fut/auto', auth, (req, res) => { ensureFut(req.user); autoSquad(req.user, req.body?.formation); save(); res.json({ fut: futView(req.user) }); });
  app.post('/api/fut/sell', auth, (req, res) => {
    const u = req.user; ensureFut(u); const uids = [].concat(req.body?.uids || []);
    let total = 0;
    for (const uid of uids) {
      if (u.fut.squad.slots.includes(uid)) return bad(res, 400, 'Não podes vender jogadores do onze titular.');
      const i = u.fut.players.findIndex((x) => x.uid === uid); if (i < 0) continue;
      total += RARITY[BY_ID.get(u.fut.players[i].pid).rarity].sell; u.fut.players.splice(i, 1);
    }
    u.coins += total; save();
    res.json({ fut: futView(u), coins: u.coins, gained: total });
  });
}

// ---------- Jogo: Malta FC (1 contra 1, ou contra a IA) ----------
const ZONES = ['esquerda', 'meio', 'direita'];
const TACTICS = { ofensiva: [1.12, 0.9], equilibrada: [1, 1], defensiva: [0.9, 1.12] };
const MOMENTS = 8; const CHOOSE_MS = 15000;

function createMatch({ io, sysMsg, nameOf, userOf, addCoins, save, emit, end, setTimer }) {
  function snapshot(u) {
    const s = teamStats(u); const F = FORMATIONS[u.fut.squad.formation];
    return { name: u.name, overall: s.overall, chem: s.chem, atk: s.atk, def: s.def, formation: u.fut.squad.formation, xi: s.xi.map((p, i) => ({ name: p.nick || p.name.split(' ').slice(-1)[0], full: p.name, pos: F.slots[i], rating: p.rating, rarity: p.rarity })) };
  }
  function botTeam(level) {
    const F = FORMATIONS['4-4-2']; const rar = level >= 80 ? 'ouro' : level >= 68 ? 'prata' : 'bronze';
    const xi = F.slots.map((pos) => randomPlayer(Math.random() < 0.3 ? ORDER[Math.max(0, ORDER.indexOf(rar) - 1)] : rar, pos));
    const avg = (pos) => { const l = xi.filter((_, i) => F.slots[i] === pos).map((p) => p.rating); return l.reduce((a, b) => a + b, 0) / l.length; };
    return { name: '🤖 Malta IA', bot: true, overall: Math.round(xi.reduce((s, p) => s + p.rating, 0) / 11), chem: 3, atk: Math.round(avg('AV') * 0.6 + avg('MED') * 0.4), def: Math.round(avg('DEF') * 0.6 + avg('GR') * 0.4), formation: '4-4-2', xi: xi.map((p, i) => ({ name: p.nick || p.name.split(' ').slice(-1)[0], full: p.name, pos: F.slots[i], rating: p.rating, rarity: p.rarity })) };
  }
  const pickFrom = (team, positions) => { const l = team.xi.filter((p) => positions.includes(p.pos)); return l[Math.floor(Math.random() * l.length)] || team.xi[0]; };
  const strength = (g, side, kind) => { const t = g.teams[side]; const tac = TACTICS[g.tactics[side] || 'equilibrada']; return kind === 'atk' ? t.atk * tac[0] : t.def * tac[1]; };
  const log = (g, text, type = '') => { g.log.push({ text, type, min: g.minute }); if (g.log.length > 30) g.log.shift(); };
  const sideOf = (g, sid) => g.sids.indexOf(sid);

  const def = {
    min: 1,
    start(r, sid, opts) {
      const u = userOf(r, sid); ensureFut(u);
      const s = teamStats(u); if (!s.complete) return io.to(sid).emit('toast', 'Completa o teu onze no Malta FC primeiro (11 jogadores).');
      r.game = { type: 'futebol', sids: [sid, null], teams: [snapshot(u), null], participants: [sid], score: [0, 0], tactics: [null, null], choices: [null, null], moment: 0, minute: 0, phase: 'lobby', log: [], scorers: [], pens: [[], []], message: `${nameOf(r, sid)} desafia alguém para um jogo! (${s.overall} geral)` };
      if (opts?.bot) { r.game.sids[1] = 'bot'; r.game.teams[1] = botTeam(s.overall); def.kickoff(r); }
    },
    kickoff(r) {
      const g = r.game; g.phase = 'tactic'; g.message = 'Escolham a tática!';
      if (g.sids[1] === 'bot') g.tactics[1] = ['ofensiva', 'equilibrada', 'defensiva'][Math.floor(Math.random() * 3)];
      setTimer(r, 12000, () => { g.tactics = g.tactics.map((t) => t || 'equilibrada'); def.nextMoment(r); });
    },
    nextMoment(r) {
      const g = r.game;
      if (g.moment >= MOMENTS) {
        if (g.score[0] === g.score[1]) { g.phase = 'pens'; g.penRound = 0; log(g, `Empate ${g.score[0]}-${g.score[1]}! Vamos para os penáltis 😬`, 'big'); return def.nextPen(r); }
        return def.finish(r);
      }
      g.moment++; g.attacker = (g.moment - 1) % 2; g.minute = Math.round((g.moment - 0.5) * (90 / MOMENTS) + Math.random() * 6 - 3);
      g.phase = 'play'; g.choices = [null, null];
      g.message = `${g.minute}' — ${g.teams[g.attacker].name} ao ataque!`;
      if (g.sids[1] === 'bot') g.choices[1] = ZONES[Math.floor(Math.random() * 3)];
      setTimer(r, CHOOSE_MS, () => { g.choices = g.choices.map((c) => c || ZONES[Math.floor(Math.random() * 3)]); def.resolve(r); });
      emit(r);
    },
    resolve(r) {
      const g = r.game; const a = g.attacker, d = 1 - a;
      const atkZone = g.choices[a], defZone = g.choices[d];
      const ratio = Math.min(1.6, Math.max(0.6, strength(g, a, 'atk') / strength(g, d, 'def')));
      const guessed = atkZone === defZone;
      const p = Math.min(0.85, Math.max(0.04, (guessed ? 0.13 : 0.52) * Math.pow(ratio, 2)));
      const scorer = pickFrom(g.teams[a], Math.random() < 0.75 ? ['AV'] : ['MED', 'AV']);
      const defender = guessed ? pickFrom(g.teams[d], Math.random() < 0.5 ? ['GR'] : ['DEF']) : pickFrom(g.teams[d], ['GR']);
      g.last = { atkZone, defZone, goal: false };
      if (Math.random() < p) {
        g.score[a]++; g.scorers.push({ side: a, name: scorer.name, min: g.minute }); g.last.goal = true;
        log(g, pickLine(guessed ? ['⚽ GOLO! {s} entra {z} mesmo com marcação e não perdoa!', '⚽ GOLAÇO de {s}! Remate impossível {z}!'] : ['⚽ GOLO! {s} aparece sozinho {z} e marca!', '⚽ GOLO de {s}! A defesa estava toda do outro lado!', '⚽ {s} finta tudo {z} e mete-a lá dentro!'], scorer, defender, atkZone), 'goal');
      } else if (guessed) log(g, pickLine(['🧱 {d} leu o lance {z} e cortou!', '🧤 {d} adivinha e faz a defesa da noite!', '🛑 Ataque {z} travado por {d}.'], scorer, defender, atkZone), 'save');
      else log(g, pickLine(['😱 {s} isolado {z}… e ao poste!', '😬 {s} remata {z}, mas {d} estica-se toda e defende!', '💨 {s} rematou por cima. Que oportunidade!'], scorer, defender, atkZone), 'miss');
      g.phase = 'result'; g.message = `${g.teams[0].name} ${g.score[0]} - ${g.score[1]} ${g.teams[1].name}`;
      setTimer(r, 3500, () => def.nextMoment(r)); emit(r);
    },
    nextPen(r) {
      const g = r.game; const [a, b] = g.pens;
      const decided = (g.penRound >= 6 && a.length === b.length && sum(a) !== sum(b)) || (g.penRound < 6 && (sum(a) > sum(b) + (3 - b.length) || sum(b) > sum(a) + (3 - a.length)));
      if (decided || g.penRound >= 10) {
        if (sum(a) === sum(b)) (Math.random() < 0.5 ? a : b).push(1);
        return def.finish(r);
      }
      g.attacker = g.penRound % 2; g.penRound++; g.choices = [null, null]; g.phase = 'pen';
      g.message = `Penálti para ${g.teams[g.attacker].name}`;
      if (g.sids[1] === 'bot') g.choices[1] = ZONES[Math.floor(Math.random() * 3)];
      setTimer(r, 10000, () => { g.choices = g.choices.map((c) => c || ZONES[Math.floor(Math.random() * 3)]); def.resolvePen(r); });
      emit(r);
    },
    resolvePen(r) {
      const g = r.game; const a = g.attacker, d = 1 - a;
      const kicker = pickFrom(g.teams[a], ['AV']); const gk = pickFrom(g.teams[d], ['GR']);
      const guessed = g.choices[a] === g.choices[d];
      const goal = Math.random() < (guessed ? 0.22 + (kicker.rating - gk.rating) / 200 : 0.9);
      g.pens[a].push(goal ? 1 : 0);
      g.last = { atkZone: g.choices[a], defZone: g.choices[d], goal };
      log(g, goal ? `🎯 ${kicker.name} marca o penálti (${g.choices[a]})!` : `🧤 ${gk.name} defende o penálti de ${kicker.name}!`, goal ? 'goal' : 'save');
      g.phase = 'penResult'; g.message = `Penáltis: ${sum(g.pens[0])} - ${sum(g.pens[1])}`;
      setTimer(r, 2500, () => def.nextPen(r)); emit(r);
    },
    finish(r) {
      const g = r.game;
      const pa = sum(g.pens[0]), pb = sum(g.pens[1]);
      const win = g.score[0] !== g.score[1] ? (g.score[0] > g.score[1] ? 0 : 1) : g.pens[0].length ? (pa > pb ? 0 : 1) : -1;
      const res = `${g.teams[0].name} ${g.score[0]}-${g.score[1]} ${g.teams[1].name}${g.pens[0].length ? ` (${pa}-${pb} g.p.)` : ''}`;
      g.sids.forEach((sid, i) => {
        const u = sid !== 'bot' && userOf(r, sid); if (!u) return; ensureFut(u);
        const rec = u.fut.record; rec.gf += g.score[i]; rec.ga += g.score[1 - i];
        if (win === i) rec.w++; else if (win === -1) rec.d++; else rec.l++;
        const prize = g.sids[1] === 'bot' ? (win === i ? 15 : 3) : win === i ? 30 : 5;
        addCoins(u, prize);
      });
      save();
      log(g, win >= 0 ? `🏆 ${g.teams[win].name} ganha! ${res}` : `🤝 Empate! ${res}`, 'big');
      end(r, win >= 0 ? `🏆 ${g.teams[win].name} ganhou! ${res}` : `Empate: ${res}`, win >= 0 && g.sids[win] !== 'bot' ? [g.sids[win]] : []);
    },
    action(r, sid, a, p) {
      const g = r.game; const side = sideOf(g, sid);
      if (a === 'join') {
        if (g.phase !== 'lobby' || side >= 0 || g.sids[1]) return;
        const u = userOf(r, sid); ensureFut(u);
        if (!teamStats(u).complete) return io.to(sid).emit('toast', 'Completa o teu onze no Malta FC primeiro.');
        g.sids[1] = sid; g.teams[1] = snapshot(u); g.participants.push(sid);
        sysMsg(r, `⚽ ${nameOf(r, sid)} aceitou o desafio! ${g.teams[0].name} vs ${g.teams[1].name}`);
        def.kickoff(r); return emit(r);
      }
      if (side < 0) return;
      if (a === 'tactic' && g.phase === 'tactic' && TACTICS[p]) {
        g.tactics[side] = p;
        if (g.tactics.every(Boolean)) def.nextMoment(r); else emit(r);
        return;
      }
      if (a === 'zone' && (g.phase === 'play' || g.phase === 'pen') && ZONES.includes(p) && !g.choices[side]) {
        g.choices[side] = p;
        if (g.choices.every(Boolean)) (g.phase === 'pen' ? def.resolvePen : def.resolve)(r); else emit(r);
      }
    },
    view(g, r, sid) {
      const side = sideOf(g, sid);
      return {
        sids: g.sids, side, teams: g.teams, score: g.score, minute: g.minute, moment: g.moment, moments: MOMENTS, phase: g.phase,
        attacker: g.attacker, tactics: g.phase === 'tactic' ? g.tactics.map((t, i) => (i === side ? t : !!t)) : g.tactics,
        myChoice: side >= 0 ? g.choices[side] : null, waiting: g.choices.map(Boolean),
        last: g.phase === 'result' || g.phase === 'penResult' || g.over ? g.last : null, log: g.log.slice(-8), scorers: g.scorers, pens: g.pens, isBot: g.sids[1] === 'bot',
      };
    },
    leave(r, sid, who) {
      const g = r.game; const side = sideOf(g, sid); if (side < 0) return;
      if (g.phase === 'lobby') return end(r, `${who} saiu.`);
      const other = 1 - side; g.score[other] = Math.max(g.score[other], g.score[side] + 3);
      log(g, `🏳️ ${who} abandonou o jogo — vitória por desistência.`, 'big'); def.finish(r);
    },
  };
  return def;
}
const sum = (a) => a.reduce((x, y) => x + y, 0);
function pickLine(lines, s, d, z) { return lines[Math.floor(Math.random() * lines.length)].replace(/\{s\}/g, s.name).replace(/\{d\}/g, d.name).replace(/\{z\}/g, { esquerda: 'pela esquerda', meio: 'pelo meio', direita: 'pela direita' }[z]); }

module.exports = { routes, createMatch, ensureFut, POOL };
