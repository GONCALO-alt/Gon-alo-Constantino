// Malta FC — gerir equipa, coleção de jogadores, abrir pacotes e o jogo na sala.
let fut = null;
let futTab = 'team';
const RAR_NAME = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro', lenda: 'Lenda' };
const POS_NAME = { GR: 'Guarda-redes', DEF: 'Defesa', MED: 'Médio', AV: 'Avançado' };

function fcCard(p, opts = {}) {
  if (!p) return `<div class="fc-card empty ${opts.small ? 'small' : ''}"><span>+</span><small>${opts.pos || ''}</small></div>`;
  return `<div class="fc-card ${p.rarity} ${opts.small ? 'small' : ''}" ${opts.attrs || ''}>
    <div class="fc-top"><b>${p.rating}</b><small>${p.pos}</small><span>${p.flag}</span></div>
    <div class="fc-face">${renderAvatar(p.face, opts.small ? 44 : 72)}</div>
    <div class="fc-name">${p.nick ? `«${esc(p.nick)}»` : esc(p.name.split(' ').slice(-1)[0])}</div>
    ${opts.small ? '' : `<div class="fc-full">${esc(p.name)}</div>`}
  </div>`;
}

async function loadFut() { const r = await api('/api/fut'); fut = r.fut; renderFutLobby(); return fut; }
function renderFutLobby() {
  if (!fut) return;
  const s = fut.stats, rec = fut.record;
  $('#fut-summary').innerHTML = `<div class="fut-ovr"><b>${s.overall}</b><small>GERAL</small></div>
    <div class="grow"><div>ATA <b>${s.atk}</b> · DEF <b>${s.def}</b> · Química <b>${s.chem}/10</b></div>
    <small class="muted">${rec.w}V ${rec.d}E ${rec.l}D · ${fut.players.length} jogadores</small>
    ${s.complete ? '' : '<div class="error">Onze incompleto!</div>'}</div>`;
  $('#fut-daily-dot').classList.toggle('hidden', !fut.canDaily);
}
$('#fut-open').addEventListener('click', () => openFut('team'));
$('#fut-bot').addEventListener('click', () => playBot());
function playBot() {
  if (!fut?.stats.complete) { toast('Completa o teu onze primeiro.'); return openFut('team'); }
  joinRoom('');
  const t = setInterval(() => { if (roomState) { clearInterval(t); socket.emit('game:start', 'futebol', { bot: true }); } }, 100);
  setTimeout(() => clearInterval(t), 5000);
}

function openFut(tab) {
  futTab = tab || futTab; show('screen-fut');
  loadFut().then(renderFut).catch((e) => toast(e.message));
}
$('#fut-back').addEventListener('click', () => backToLobby());
$('#fut-tabs').addEventListener('click', (e) => { const t = e.target.dataset.tab; if (t) { futTab = t; renderFut(); } });

function renderFut() {
  $('#fut-tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.tab === futTab));
  $('#coins-fut').textContent = me.coins;
  const el = $('#fut-body');
  const byUid = new Map(fut.players.map((p) => [p.uid, p]));
  if (futTab === 'team') {
    const F = fut.formations[fut.squad.formation]; const s = fut.stats;
    el.innerHTML = `<div class="fut-bar">
        <select id="formation">${Object.keys(fut.formations).map((f) => `<option ${f === fut.squad.formation ? 'selected' : ''}>${f}</option>`).join('')}</select>
        <button class="btn" id="auto-squad">✨ Equipa automática</button>
        <span class="grow"></span>
        <span class="stat">GERAL <b>${s.overall}</b></span><span class="stat">ATA <b>${s.atk}</b></span><span class="stat">DEF <b>${s.def}</b></span>
        <span class="stat" title="Jogadores do mesmo país dão química (+1 por cada repetido, máx. 10). A química dá bónus no jogo.">🧪 <b>${s.chem}/10</b></span>
      </div>
      <div class="pitch">${F.slots.map((pos, i) => `<div class="slot-p" style="left:${F.xy[i][0]}%;top:${F.xy[i][1]}%" data-slot="${i}">${fcCard(byUid.get(fut.squad.slots[i]), { small: true, pos })}</div>`).join('')}</div>
      <p class="hint-small">Toca num lugar para escolher o jogador. Jogadores do mesmo país dão química 🧪.</p>`;
    $('#formation').onchange = (e) => changeFormation(e.target.value);
    $('#auto-squad').onclick = async () => { fut = (await api('/api/fut/auto', { formation: fut.squad.formation })).fut; renderFut(); renderFutLobby(); };
    el.querySelectorAll('[data-slot]').forEach((d) => (d.onclick = () => pickForSlot(+d.dataset.slot)));
  } else if (futTab === 'players') {
    const inXI = new Set(fut.squad.slots);
    const list = [...fut.players].sort((a, b) => b.rating - a.rating);
    const dupes = dupesToSell();
    el.innerHTML = `<div class="fut-bar"><div class="tabs" id="pos-filter">${['Todos', 'GR', 'DEF', 'MED', 'AV'].map((p) => `<button data-p="${p}" class="${(window.posFilter || 'Todos') === p ? 'active' : ''}">${p}</button>`).join('')}</div>
      <span class="grow"></span>${dupes.length ? `<button class="btn" id="sell-dupes">Vender repetidos (${dupes.length}) · +${dupes.reduce((s, p) => s + fut.rarity[p.rarity].sell, 0)} 🪙</button>` : ''}</div>
      <div class="fc-grid">${list.filter((p) => !window.posFilter || window.posFilter === 'Todos' || p.pos === window.posFilter).map((p) => `<div class="fc-cell">${fcCard(p)}
        ${inXI.has(p.uid) ? '<small class="ok">No onze</small>' : `<button class="btn small ghost" data-sell="${p.uid}">Vender ${fut.rarity[p.rarity].sell} 🪙</button>`}</div>`).join('')}</div>`;
    $('#pos-filter').onclick = (e) => { if (e.target.dataset.p) { window.posFilter = e.target.dataset.p; renderFut(); } };
    el.querySelectorAll('[data-sell]').forEach((b) => (b.onclick = () => sell([b.dataset.sell])));
    $('#sell-dupes') && ($('#sell-dupes').onclick = () => sell(dupes.map((p) => p.uid)));
  } else {
    el.innerHTML = `<div class="grid-shop">${fut.packs.map((p) => `<div class="shop-card pack-card pk-${p.id}">
        <div class="pack-art">⚽<small>${esc(p.name.replace('Pacote ', ''))}</small></div>
        <b>${esc(p.name)}</b><small class="muted">${p.size} jogadores${p.guarantee ? ` · 1 ${RAR_NAME[p.guarantee]} garantido` : ''}</small>
        <small class="odds">${Object.entries(p.odds).map(([k, v]) => `${RAR_NAME[k]} ${v}%`).join(' · ')}</small>
        ${p.price === 0 ? `<button class="btn primary" data-pack="${p.id}" ${fut.canDaily ? '' : 'disabled'}>${fut.canDaily ? 'Abrir grátis' : 'Amanhã'}</button>` : `<button class="btn primary" data-pack="${p.id}">${p.price} 🪙</button>`}
      </div>`).join('')}</div>
      <p class="hint-small">Os jogadores são fictícios. Ganhas moedas a jogar, a subir de nível ou podes comprá-las na loja.</p>`;
    el.querySelectorAll('[data-pack]').forEach((b) => (b.onclick = () => openPack(b.dataset.pack)));
  }
}
function dupesToSell() {
  const inXI = new Set(fut.squad.slots); const keep = new Set(); const out = [];
  for (const p of [...fut.players].sort((a, b) => (inXI.has(b.uid) ? 1 : 0) - (inXI.has(a.uid) ? 1 : 0))) {
    if (keep.has(p.id)) { if (!inXI.has(p.uid)) out.push(p); } else keep.add(p.id);
  }
  return out;
}
async function sell(uids) {
  try { const r = await api('/api/fut/sell', { uids }); fut = r.fut; me.coins = r.coins; setMe(me); toast(`+${r.gained} 🪙`); renderFut(); renderFutLobby(); } catch (e) { toast(e.message); }
}
async function saveSquad(formation, slots) {
  try { fut = (await api('/api/fut/squad', { formation, slots })).fut; renderFut(); renderFutLobby(); } catch (e) { toast(e.message); }
}
function changeFormation(f) {
  const byUid = new Map(fut.players.map((p) => [p.uid, p]));
  const old = fut.squad.slots.filter(Boolean).map((u) => byUid.get(u)); const used = new Set();
  const bench = [...fut.players].sort((a, b) => b.rating - a.rating);
  const slots = fut.formations[f].slots.map((pos) => {
    const p = old.find((x) => x.pos === pos && !used.has(x.uid)) || bench.find((x) => x.pos === pos && !used.has(x.uid) && !fut.squad.slots.includes(x.uid));
    if (p) used.add(p.uid); return p ? p.uid : null;
  });
  saveSquad(f, slots);
}
function pickForSlot(i) {
  const pos = fut.formations[fut.squad.formation].slots[i];
  const taken = new Set(fut.squad.slots.filter((u, j) => u && j !== i));
  const opts = fut.players.filter((p) => p.pos === pos && !taken.has(p.uid)).sort((a, b) => b.rating - a.rating);
  modal(`<h3>${POS_NAME[pos]}</h3>
    <div class="fc-grid pick">${opts.map((p) => `<button class="fc-pick ${fut.squad.slots[i] === p.uid ? 'sel' : ''}" data-uid="${p.uid}">${fcCard(p, { small: true })}</button>`).join('') || '<p class="muted">Não tens jogadores nesta posição. Abre pacotes!</p>'}</div>
    <div class="row">${fut.squad.slots[i] ? '<button class="btn ghost" id="slot-clear">Tirar</button>' : ''}<button class="btn" data-close>Fechar</button></div>`);
  $('#modal-card').querySelectorAll('[data-uid]').forEach((b) => (b.onclick = () => { const s = [...fut.squad.slots]; s[i] = b.dataset.uid; closeModal(); saveSquad(fut.squad.formation, s); }));
  $('#slot-clear') && ($('#slot-clear').onclick = () => { const s = [...fut.squad.slots]; s[i] = null; closeModal(); saveSquad(fut.squad.formation, s); });
}

// ---- Abrir pacote, com cartas a virar uma a uma ----
async function openPack(id) {
  let r;
  try { r = await api('/api/fut/pack', { packId: id }); } catch (e) { toast(e.message); if (/insuficientes/.test(e.message)) { backToLobby(); shopTab = 'coins'; renderShop(); } return; }
  fut = r.fut; me.coins = r.coins; setMe(me);
  const best = r.got[r.got.length - 1];
  const ov = $('#pack-overlay'); ov.classList.remove('hidden');
  ov.innerHTML = `<div class="pack-stage">${r.got.map((p, i) => `<div class="flip" data-i="${i}"><div class="flip-in"><div class="flip-back ${p.rarity === best.rarity && i === r.got.length - 1 ? 'tease-' + p.rarity : ''}">⚽</div><div class="flip-front">${fcCard(p)}</div></div></div>`).join('')}</div>
    <p class="center" id="pack-hint">Toca para revelar</p><div class="center"><button class="btn primary hidden" id="pack-done">Continuar</button></div>`;
  let n = 0;
  const reveal = () => {
    const f = ov.querySelector(`.flip[data-i="${n}"]`); if (!f) return;
    f.classList.add('open'); const p = r.got[n];
    if (p.rarity === 'lenda') celebrate('👑', `LENDA! ${p.nick ? '«' + p.nick + '» ' : ''}${p.name}`, `${p.rating} de geral`);
    else if (p.rarity === 'ouro') for (let k = 0; k < 6; k++) setTimeout(() => floatReaction({ emoji: '✨', from: '' }), k * 90);
    n++;
    if (n >= r.got.length) { $('#pack-hint').textContent = ''; $('#pack-done').classList.remove('hidden'); }
  };
  ov.onclick = (e) => { if (e.target.id === 'pack-done') { ov.classList.add('hidden'); renderFut(); renderFutLobby(); } else reveal(); };
}

// ---- Jogo na sala ----
RENDER.futebol = function (el, g, _prev, footer) {
  const [A, B] = g.teams; const me_ = g.side;
  const playing = me_ >= 0 && !g.isBot ? true : me_ === 0;
  const team = (t, i) => t ? `<div class="fb-team ${i === g.attacker && (g.phase === 'play' || g.phase === 'pen') ? 'atk' : ''}"><b>${esc(t.name)}</b><small>${t.overall} · ${t.formation}${g.tactics?.[i] && typeof g.tactics[i] === 'string' ? ' · ' + g.tactics[i] : ''}</small></div>` : '<div class="fb-team"><b>…</b><small>à espera</small></div>';
  const pens = g.pens[0].length ? `<div class="pens">${[0, 1].map((i) => `<span>${g.pens[i].map((x) => (x ? '🟢' : '🔴')).join('')}</span>`).join(' — ')}</div>` : '';
  let body = '';
  if (g.phase === 'lobby') {
    const canJoin = me_ < 0 && !g.over;
    body = `<p class="center">${esc(g.message)}</p>${canJoin ? '<button class="btn primary" id="fb-join">⚽ Aceitar desafio</button>' : '<p class="center muted">À espera de adversário… (ou convida um amigo)</p>'}`;
  } else if (g.phase === 'tactic') {
    body = me_ >= 0 && g.tactics[me_] === null
      ? `<p class="center"><b>Escolhe a tática</b></p><div class="row tactic-row">${[['ofensiva', '⚔️ Ofensiva', 'ATA +12%, DEF −10%'], ['equilibrada', '⚖️ Equilibrada', 'Sem bónus'], ['defensiva', '🛡️ Defensiva', 'DEF +12%, ATA −10%']].map(([k, n, d]) => `<button class="btn" data-tac="${k}"><b>${n}</b><small>${d}</small></button>`).join('')}</div>`
      : '<p class="center muted">À espera da tática do adversário…</p>';
  } else if (g.phase === 'play' || g.phase === 'pen') {
    const atk = me_ === g.attacker;
    const label = g.phase === 'pen' ? (atk ? '🎯 Bate o penálti para…' : '🧤 Atira-te para…') : atk ? '⚔️ Ataca pela…' : '🛡️ Defende a zona…';
    body = me_ >= 0
      ? (g.myChoice ? `<p class="center muted">Escolheste <b>${g.myChoice}</b>. À espera…</p>` : `<p class="center"><b>${label}</b></p>`) +
        `<div class="mini-pitch ${g.phase === 'pen' ? 'goal' : ''}">${['esquerda', 'meio', 'direita'].map((z) => `<button class="zone ${g.myChoice === z ? 'sel' : ''}" data-zone="${z}" ${g.myChoice ? 'disabled' : ''}>${z}</button>`).join('')}</div>`
      : `<p class="center muted">${esc(g.message)}</p>`;
  } else if (g.last) {
    body = `<div class="mini-pitch result ${g.phase === 'penResult' ? 'goal' : ''}">${['esquerda', 'meio', 'direita'].map((z) => `<div class="zone ${g.last.atkZone === z ? 'a' : ''} ${g.last.defZone === z ? 'd' : ''}">${g.last.atkZone === z ? '⚽' : ''}${g.last.defZone === z ? '🧤' : ''}</div>`).join('')}</div>
      ${g.last.goal ? '<div class="goal-flash">GOLO!</div>' : ''}`;
  }
  el.innerHTML = `<div class="scoreboard">${team(A, 0)}<div class="score"><b>${g.score[0]} - ${g.score[1]}</b><small>${g.phase === 'pens' || g.phase === 'pen' || g.phase === 'penResult' ? 'Penáltis' : g.minute ? g.minute + "'" : '0\''}</small></div>${team(B, 1)}</div>
    ${pens}${timerBar(g)}${body}
    <ul class="fb-log">${[...g.log].reverse().map((l) => `<li class="${l.type}">${l.min ? `<small>${l.min}'</small> ` : ''}${esc(l.text)}</li>`).join('')}</ul>
    ${g.over && me_ >= 0 && g.isBot ? '<button class="btn primary" id="fb-again-bot">Jogar outra vez contra a IA</button>' : ''}
    ${footer}`;
  $('#fb-join')?.addEventListener('click', () => act('join'));
  el.querySelectorAll('[data-tac]').forEach((b) => b.addEventListener('click', () => act('tactic', b.dataset.tac)));
  el.querySelectorAll('[data-zone]').forEach((b) => b.addEventListener('click', () => act('zone', b.dataset.zone)));
  $('#fb-again-bot')?.addEventListener('click', () => socket.emit('game:start', 'futebol', { bot: true }));
  if (g.last?.goal && (g.phase === 'result' || g.phase === 'penResult')) {
    const scoredBy = g.last.goal && g.attacker;
    if (scoredBy === me_) for (let k = 0; k < 8; k++) setTimeout(() => floatReaction({ emoji: ['⚽', '🔥', '🎉'][k % 3], from: '' }), k * 70);
  }
  if (g.over && me_ >= 0) loadFut().catch(() => {});
};
GAME_MENU.unshift(['futebol', '⚽ Malta FC — Desafiar', 'A tua equipa contra a de um amigo. Quem ganha leva 30 🪙'], ['futebol', '🤖 Malta FC — Contra a IA', 'Treina a tua equipa. Vitória: 15 🪙', { bot: true }]);
