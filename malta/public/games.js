// Interface dos jogos. O servidor envia a vista de cada jogador; aqui só se desenha e envia ações.
let currentGame = null, timerInt = null;
const act = (a, p) => socket.emit('game:action', a, p);

const GAME_MENU = [
  ['cartas', '🃏 Cartas Loucas', 'Livra-te de todas as cartas primeiro. 2–6 pessoas · +20 🪙'],
  ['impostor', '🕵️ Impostor', 'Todos sabem a palavra… menos um. Descubram-no! 3+ pessoas'],
  ['desenha', '🎨 Desenha & Adivinha', 'Um desenha, os outros adivinham no chat. +5 🪙 por acerto'],
  ['maisProvavel', '👉 Quem é mais provável…', 'Votem em quem da sala encaixa melhor. Só risos.'],
  ['verdade', '😳 Verdade ou Consequência', 'Versão segura, à vez. Podes sempre passar.'],
  ['quiz', '🧠 Quiz relâmpago', 'Cultura geral. Quanto mais rápido, mais pontos. +15 🪙', { cat: 'geral' }],
  ['quiz', '🎵 Quiz de música', 'Perguntas sobre música e artistas. +15 🪙', { cat: 'musica' }],
  ['galo', '❌⭕ Jogo do Galo', '1 contra 1. Quem ganha leva 10 🪙'],
];

function openGamesTab() { $('#side-tabs [data-tab="games"]').click(); }
function scoresHtml(scores) {
  const list = Object.values(scores || {}).sort((a, b) => b.v - a.v);
  return list.length ? `<ul class="scores">${list.map((s, i) => `<li>${['🥇', '🥈', '🥉'][i] || '·'} ${esc(s.name)} — ${s.v}</li>`).join('')}</ul>` : '';
}
function startTimer(g) {
  clearInterval(timerInt);
  if (!g.endsAt || g.over) return;
  const tick = () => { const b = $('#tbar'); if (b) b.style.width = Math.max(0, (g.endsAt - Date.now()) / (g.total || 1)) * 100 + '%'; };
  tick(); timerInt = setInterval(tick, 250);
}
const timerBar = (g) => (!g.over && g.endsAt ? '<div class="timer"><i id="tbar"></i></div>' : '');

function renderGame(g) {
  const prev = currentGame; currentGame = g;
  const el = $('#game');
  clearInterval(timerInt);
  if (!g) {
    el.innerHTML = `<div class="game-menu">${GAME_MENU.map(([t, n, d, o], i) => `<button class="game-pick" data-i="${i}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>`;
    el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { const [t, , , o] = GAME_MENU[b.dataset.i]; socket.emit('game:start', t, o); }));
    return;
  }
  if (!prev || prev.type !== g.type || prev.over) openGamesTab();
  const footer = g.over
    ? `<div class="row"><button class="btn primary" id="again">Jogar outra vez</button><button class="btn ghost" id="back">Outros jogos</button></div>`
    : `<button class="btn small ghost" id="end-game">Terminar jogo</button>`;
  const R = RENDER[g.type];
  R(el, g, prev, footer);
  $('#again')?.addEventListener('click', () => socket.emit('game:start', g.type, { cat: g.cat }));
  $('#back')?.addEventListener('click', () => renderGame(null));
  $('#end-game')?.addEventListener('click', () => act('end'));
  startTimer(g);
}

const RENDER = {
  galo(el, g, _p, footer) {
    const mine = g.players.indexOf(socket.id);
    const canJoin = !g.players[1] && mine === -1 && !g.over;
    el.innerHTML = `<p class="game-msg">${esc(g.message)}</p>
      <p class="center muted">❌ ${esc(g.names[0] || '?')} vs ⭕ ${esc(g.names[1] || '…')}</p>
      ${canJoin ? '<button class="btn primary" id="join-galo">Aceitar desafio</button>' : ''}
      <div class="galo">${g.board.map((c, i) => `<button data-cell="${i}" class="${g.win?.includes(i) ? 'win' : ''}">${c === 'X' ? '❌' : c === 'O' ? '⭕' : ''}</button>`).join('')}</div>${footer}`;
    $('#join-galo')?.addEventListener('click', () => act('join'));
    el.querySelectorAll('[data-cell]').forEach((b) => b.addEventListener('click', () => act('move', +b.dataset.cell)));
  },

  quiz(el, g, _p, footer) {
    const answered = g.mine !== undefined && g.mine !== null;
    el.innerHTML = `<p class="game-msg">${g.cat === 'musica' ? '🎵 ' : '🧠 '}${esc(g.message)}</p>
      ${!g.over && g.q ? `${timerBar(g)}<h3>${esc(g.q)}</h3>
        <div class="quiz-opts">${g.options.map((o, i) => `<button class="btn ${g.mine === i ? 'primary' : ''}" data-ans="${i}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>
        <small class="muted">${g.answered.length} responderam</small>` : ''}
      ${scoresHtml(g.scores)}${footer}`;
    el.querySelectorAll('[data-ans]').forEach((b) => b.addEventListener('click', () => act('answer', +b.dataset.ans)));
  },

  desenha(el, g, prev, footer) {
    const drawing = g.drawer === socket.id && !g.over;
    if (!(prev?.type === 'desenha' && !prev.over && $('#board'))) {
      el.innerHTML = `<div id="dz-info"></div><canvas id="board" width="800" height="600"></canvas><div class="palette" id="palette"></div><div id="dz-foot"></div>`;
      setupBoard();
    }
    $('#dz-info').innerHTML = `<p class="game-msg">${esc(g.message)} <small>(ronda ${g.round}/${g.rounds})</small></p>${timerBar(g)}
      ${drawing ? `<p class="hint">Desenha: <b>${esc(g.word || '…')}</b></p>` : !g.over ? `<p class="hint">${esc(g.hint)}</p><p class="center muted">Escreve o teu palpite no chat!</p>` : ''}`;
    $('#palette').classList.toggle('hidden', !drawing);
    if (drawing && !$('#palette').children.length) {
      $('#palette').innerHTML = ['#111', '#e63946', '#3d7bff', '#2bb673', '#ffb020', '#9b5cff', '#8b5a2b', '#fff'].map((c) => `<button data-color="${c}" style="background:${c}"></button>`).join('') + '<button class="btn small" id="clear-board">Limpar</button>';
      $('#palette').querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => { brush.color = b.dataset.color; brush.width = b.dataset.color === '#fff' ? 24 : 5; }));
      $('#clear-board').addEventListener('click', () => act('clear'));
    }
    if (!drawing) $('#palette').innerHTML = '';
    $('#dz-foot').innerHTML = scoresHtml(g.scores) + footer;
  },

  maisProvavel(el, g, _p, footer) {
    if (g.over) {
      el.innerHTML = `<p class="game-msg">${esc(g.message)}</p><ul class="titles">${g.titles.map((t) => `<li><b>${esc(t.name)}</b> é quem é mais provável ${esc(t.prompt)}</li>`).join('')}</ul>${footer}`;
      return;
    }
    el.innerHTML = `<p class="game-msg">${esc(g.message)}</p>${timerBar(g)}<h3 class="center">Quem é mais provável ${esc(g.prompt)}</h3>
      ${g.phase === 'vote'
        ? `<div class="vote-grid">${g.candidates.map((c) => `<button class="btn ${g.myVote === c.sid ? 'primary' : ''}" data-vote="${c.sid}">${esc(c.name)}</button>`).join('')}</div><small class="muted">${g.voted}/${g.candidates.length} votaram</small>`
        : `<ul class="results">${(g.results || []).map((r, i) => `<li>${i === 0 ? '👑' : '·'} <b>${esc(r.name)}</b> — ${r.n} voto${r.n > 1 ? 's' : ''}</li>`).join('') || '<li class="muted">Ninguém votou 😅</li>'}</ul>`}
      ${footer}`;
    el.querySelectorAll('[data-vote]').forEach((b) => b.addEventListener('click', () => act('vote', b.dataset.vote)));
  },

  verdade(el, g, _p, footer) {
    const mine = g.player === socket.id && !g.over;
    el.innerHTML = `<p class="game-msg">${esc(g.message)}</p>${timerBar(g)}<p class="center muted">Vez ${g.turn}/${g.maxTurns}</p>
      ${mine && g.phase === 'choose' ? `<div class="row big-choice"><button class="btn primary" data-a="truth">🗣️ Verdade</button><button class="btn primary" data-a="dare">🔥 Consequência</button></div>` : ''}
      ${g.phase === 'do' && !g.over ? `<div class="prompt-card ${g.kind}"><small>${g.kind === 'truth' ? 'VERDADE' : 'CONSEQUÊNCIA'} para ${esc(g.playerName)}</small><p>${esc(g.prompt)}</p></div>
        ${mine ? '<div class="row"><button class="btn primary" data-a="done">✅ Feito</button><button class="btn ghost" data-a="pass">🙈 Passo</button></div>' : '<p class="center muted">Reage com emojis enquanto esperas 😄</p>'}` : ''}
      ${scoresHtml(g.scores)}${footer}`;
    el.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => act(b.dataset.a)));
  },

  impostor(el, g, _p, footer) {
    let body = '';
    if (g.over) body = g.reveal ? `<div class="prompt-card"><small>A palavra era</small><p>${esc(g.reveal.word)}</p><small>Impostor: <b>${esc(g.reveal.imp)}</b></small></div>` : '';
    else {
      body = !g.playing ? '<p class="center muted">Este jogo começou antes de entrares. Vê e diverte-te!</p>'
        : g.isImpostor ? `<div class="prompt-card dare"><small>Categoria: ${esc(g.cat)}</small><p>🕵️ És o IMPOSTOR</p><small>Finge que sabes a palavra!</small></div>`
        : `<div class="prompt-card truth"><small>Categoria: ${esc(g.cat)}</small><p>${esc(g.word)}</p><small>Não digas a palavra!</small></div>`;
      if (g.phase === 'clues') body += `<p class="center muted">Escrevam uma pista cada no chat.</p><button class="btn small" id="imp-skip">Já demos as pistas → votar</button>`;
      if (g.phase === 'vote' && g.playing) body += `<div class="vote-grid">${g.candidates.map((c) => `<button class="btn ${g.myVote === c.sid ? 'primary' : ''}" data-vote="${c.sid}">${esc(c.name)}</button>`).join('')}</div><small class="muted">${g.voted}/${g.total} votaram</small>`;
    }
    el.innerHTML = `<p class="game-msg">${esc(g.message)}</p>${timerBar(g)}${body}${footer}`;
    $('#imp-skip')?.addEventListener('click', () => act('skip'));
    el.querySelectorAll('[data-vote]').forEach((b) => b.addEventListener('click', () => act('vote', b.dataset.vote)));
  },

  cartas(el, g, _p, footer) {
    const myTurn = g.turnSid === socket.id && !g.over;
    const COLORS = { r: '#e63946', g: '#2bb673', b: '#3d7bff', y: '#f2b705', w: '#222' };
    const label = (c) => ({ skip: '⊘', rev: '⇄', '+2': '+2', '+4': '+4', w: '🌈' }[c.v] || c.v);
    const cardHtml = (c, attrs = '') => `<button class="card-c ${c.c === 'w' ? 'wild' : ''}" style="--cc:${COLORS[c.c]}" ${attrs}>${label(c)}</button>`;
    el.innerHTML = `<p class="game-msg">${esc(g.message)}</p>${timerBar(g)}
      <ul class="card-players">${g.players.map((p) => `<li class="${p.sid === g.turnSid ? 'turn' : ''}">${esc(p.name)} <b>${p.count}🂠</b></li>`).join('')}</ul>
      <div class="table-c"><div class="pile">${cardHtml(g.top, 'disabled')}<span class="color-dot" style="background:${COLORS[g.color]}"></span></div>
        <button class="card-c back" id="draw-c" ${myTurn && g.drawn == null ? '' : 'disabled'}>🂠<small>${g.deck}</small></button>
        <span class="muted">${g.dir === 1 ? '↻' : '↺'}</span></div>
      ${myTurn ? `<p class="center"><b>É a tua vez!</b> ${g.drawn != null ? '<button class="btn small" id="pass-c">Passar</button>' : ''}</p>` : ''}
      ${g.hand ? `<div class="hand">${g.hand.map((c) => cardHtml(c, `data-card="${c.id}" ${g.playableIds.includes(c.id) ? 'class-playable' : 'disabled'}`)).join('')}</div>` : ''}
      ${footer}`;
    el.querySelectorAll('[class-playable]').forEach((b) => b.classList.add('playable'));
    $('#draw-c')?.addEventListener('click', () => act('draw'));
    $('#pass-c')?.addEventListener('click', () => act('pass'));
    el.querySelectorAll('[data-card]').forEach((b) => b.addEventListener('click', () => {
      const c = g.hand.find((x) => x.id === +b.dataset.card);
      if (c.c !== 'w') return act('play', { id: c.id });
      modal(`<h3>Escolhe a cor</h3><div class="row">${['r', 'g', 'b', 'y'].map((k) => `<button class="card-c" style="--cc:${COLORS[k]}" data-col="${k}"></button>`).join('')}</div>`);
      $('#modal-card').querySelectorAll('[data-col]').forEach((x) => (x.onclick = () => { act('play', { id: c.id, color: x.dataset.col }); closeModal(); }));
    }));
  },
};

// ---- quadro de desenho ----
const brush = { color: '#111', width: 5 };
function setupBoard() {
  const c = $('#board'); let last = null;
  const pos = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  c.addEventListener('pointerdown', (e) => { if (currentGame?.drawer !== socket.id || currentGame.over) return; last = pos(e); c.setPointerCapture(e.pointerId); });
  c.addEventListener('pointermove', (e) => {
    if (!last) return; const p = pos(e);
    const s = { a: last, b: p, c: brush.color, w: brush.width };
    drawStroke(s); act('draw', s); last = p;
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
