// Jogos multijogador. O servidor manda: cada jogador recebe a sua própria vista
// (com a sua mão de cartas, a palavra secreta, etc.).
// ctx: { io, sysMsg, nameOf, userOf, addCoins, addXp, stat }
module.exports = function createGames(ctx) {
  const { io, sysMsg, nameOf, userOf, addCoins, addXp, stat } = ctx;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const scoresView = (r, s) => Object.fromEntries(Object.entries(s || {}).map(([sid, v]) => [sid, { name: nameOf(r, sid), v }]));
  const topOf = (s) => { const e = Object.entries(s || {}).sort((a, b) => b[1] - a[1]); return e.length && e[0][1] > 0 ? e.filter((x) => x[1] === e[0][1]).map((x) => x[0]) : []; };

  function emit(r) {
    if (!r.game) return;
    for (const sid of r.members.keys()) io.to(sid).emit('game', view(r, sid));
  }
  function end(r, msg, winners = []) {
    const g = r.game; if (!g || g.over) return;
    clearTimeout(g.timer);
    g.over = true; g.message = msg || g.message;
    for (const sid of g.participants || []) {
      const u = userOf(r, sid); if (!u) continue;
      stat(u, 'gamesPlayed'); addXp(u, winners.includes(sid) ? 25 : 10);
      if (winners.includes(sid)) stat(u, 'wins');
    }
    emit(r);
  }
  function setTimer(r, ms, fn) {
    const g = r.game; clearTimeout(g.timer); g.endsAt = Date.now() + ms; g.total = ms;
    g.timer = setTimeout(() => { if (r.game === g && !g.over) fn(); }, ms);
  }
  const alive = (r, list) => list.filter((s) => r.members.has(s));

  // ================= Jogo do Galo =================
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const galo = {
    min: 2,
    start(r, sid) { r.game = { type: 'galo', board: Array(9).fill(null), players: [sid, null], participants: [sid], turn: 0, message: `${nameOf(r, sid)} quer jogar. Quem aceita?` }; },
    action(r, sid, a, p) {
      const g = r.game;
      if (a === 'join') { if (g.players[1] || g.players[0] === sid) return; g.players[1] = sid; g.participants.push(sid); g.message = `Vez de ${nameOf(r, g.players[0])} (❌)`; return emit(r); }
      if (a !== 'move' || !g.players[1] || g.players[g.turn] !== sid || !(p >= 0 && p < 9) || g.board[p]) return;
      g.board[p] = g.turn ? 'O' : 'X';
      const win = LINES.find((l) => l.every((i) => g.board[i] === g.board[p]));
      if (win) { g.win = win; const u = userOf(r, sid); if (u) addCoins(u, 10); return end(r, `${nameOf(r, sid)} ganhou! +10 🪙`, [sid]); }
      if (g.board.every(Boolean)) return end(r, 'Empate! 🤝');
      g.turn = 1 - g.turn; g.message = `Vez de ${nameOf(r, g.players[g.turn])} (${g.turn ? '⭕' : '❌'})`; emit(r);
    },
    view: (g, r) => ({ board: g.board, players: g.players, names: g.players.map((s) => s && nameOf(r, s)), turn: g.turn, win: g.win }),
    leave(r, sid, who) { if (r.game.players.includes(sid)) end(r, `${who} saiu — jogo cancelado.`); },
  };

  // ================= Desenha & Adivinha =================
  const WORDS = ['gato','pizza','guitarra','praia','foguetão','bicicleta','telemóvel','sol','dragão','castelo','futebol','hambúrguer','unicórnio','avião','piscina','cão','robô','arco-íris','vulcão','sereia','bolo','comboio','girafa','fantasma','skate','montanha','pinguim','banana','tubarão','pipocas','óculos','relógio','árvore','chapéu','tartaruga','ananás','farol','dinossauro'];
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
  const desenha = {
    min: 2,
    start(r) {
      const order = [...r.members.keys()];
      r.game = { type: 'desenha', order, participants: [...order], idx: -1, scores: {}, rounds: Math.min(order.length * 2, 8), played: 0 };
      desenha.next(r);
    },
    next(r) {
      const g = r.game; g.order = alive(r, g.order);
      if (g.played >= g.rounds || g.order.length < 2) {
        const w = topOf(g.scores);
        return end(r, w.length ? `Fim! Ganhou ${w.map((s) => nameOf(r, s)).join(' e ')} 🏆` : 'Fim do jogo.', w);
      }
      g.idx = (g.idx + 1) % g.order.length; g.played++;
      g.drawer = g.order[g.idx]; g.word = pick(WORDS); g.guessed = [];
      g.message = `${nameOf(r, g.drawer)} está a desenhar…`;
      io.to(r.code).emit('game:clear');
      setTimer(r, 75000, () => { sysMsg(r, `⏰ Acabou o tempo! A palavra era «${g.word}».`); desenha.next(r); });
      emit(r);
    },
    chat(r, sid, text) {
      const g = r.game; if (sid === g.drawer || g.guessed.includes(sid) || norm(text) !== norm(g.word)) return false;
      g.guessed.push(sid);
      const pts = Math.max(3, 10 - (g.guessed.length - 1) * 3);
      g.scores[sid] = (g.scores[sid] || 0) + pts; g.scores[g.drawer] = (g.scores[g.drawer] || 0) + 2;
      const u = userOf(r, sid); if (u) addCoins(u, 5);
      const d = userOf(r, g.drawer); if (d) stat(d, 'drawGuessed');
      sysMsg(r, `✅ ${nameOf(r, sid)} acertou! +${pts} pontos, +5 🪙`);
      if (g.guessed.length >= g.order.length - 1) { sysMsg(r, `A palavra era «${g.word}».`); setTimer(r, 2000, () => desenha.next(r)); }
      emit(r); return true;
    },
    action(r, sid, a, p) {
      const g = r.game; if (g.drawer !== sid) return;
      if (a === 'clear') io.to(r.code).emit('game:clear');
      if (a === 'draw') {
        const pt = (q) => Array.isArray(q) && q.length === 2 && q.every((n) => Number.isFinite(n) && n >= -0.1 && n <= 1.1);
        if (!p || !pt(p.a) || !pt(p.b) || !/^#[0-9a-f]{3,6}$/i.test(p.c) || !(p.w > 0 && p.w <= 30)) return;
        io.to(r.code).except(sid).emit('game:draw', { a: p.a, b: p.b, c: p.c, w: p.w });
      }
    },
    view: (g, r, sid) => ({ drawer: g.drawer, word: sid === g.drawer ? g.word : null, hint: g.word ? [...g.word].map((c) => (c === '-' || c === ' ' ? c : '_')).join(' ') : '', scores: scoresView(r, g.scores), guessed: g.guessed, round: g.played, rounds: g.rounds }),
    leave(r, sid) { if (r.game.drawer === sid) { sysMsg(r, 'Quem desenhava saiu. Próxima ronda!'); desenha.next(r); } },
  };

  // ================= Quiz (geral e música) =================
  const QUIZ = {
    geral: [
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
      ['Quantos ossos tem o corpo humano adulto?', ['186', '206', '226', '256'], 1],
      ['Em que ano chegou o Homem à Lua?', ['1965', '1969', '1972', '1975'], 1],
    ],
    musica: [
      ['Que banda gravou «Bohemian Rhapsody»?', ['The Beatles', 'Queen', 'ABBA', 'Coldplay'], 1],
      ['Quantas cordas tem uma guitarra clássica?', ['4', '5', '6', '7'], 2],
      ['De que país é a banda BTS?', ['Japão', 'China', 'Coreia do Sul', 'Tailândia'], 2],
      ['Que estilo musical é típico de Lisboa e Coimbra?', ['Flamenco', 'Fado', 'Tango', 'Samba'], 1],
      ['Quem é conhecido como o «Rei do Pop»?', ['Elvis Presley', 'Prince', 'Michael Jackson', 'Freddie Mercury'], 2],
      ['Quantas teclas tem um piano normal?', ['76', '88', '96', '100'], 1],
      ['Que instrumento tem pedais, pratos e tarolas?', ['Bateria', 'Harpa', 'Órgão', 'Baixo'], 0],
      ['Em que cidade nasceram os Beatles?', ['Londres', 'Manchester', 'Liverpool', 'Dublin'], 2],
      ['Que país ganhou a Eurovisão em 2017 com «Amar pelos Dois»?', ['Espanha', 'Itália', 'Portugal', 'Suécia'], 2],
      ['O que mede o «BPM» de uma música?', ['Volume', 'Batidas por minuto', 'Duração', 'Tom'], 1],
      ['Que género musical nasceu no Bronx, Nova Iorque, nos anos 70?', ['Hip-hop', 'Reggae', 'Jazz', 'Grunge'], 0],
      ['Qual destes é um instrumento de sopro?', ['Violino', 'Saxofone', 'Xilofone', 'Ukulele'], 1],
    ],
  };
  const quiz = {
    min: 1,
    start(r, sid, opts) {
      const cat = QUIZ[opts?.cat] ? opts.cat : 'geral';
      r.game = { type: 'quiz', cat, qs: shuffle(QUIZ[cat]).slice(0, 5), qi: -1, scores: {}, participants: [...r.members.keys()] };
      quiz.next(r);
    },
    next(r) {
      const g = r.game;
      if (g.qi >= 0) sysMsg(r, `Resposta: ${g.qs[g.qi][1][g.qs[g.qi][2]]}`);
      g.qi++;
      if (g.qi >= g.qs.length) {
        const w = topOf(g.scores); w.forEach((s) => { const u = userOf(r, s); if (u) addCoins(u, 15); });
        return end(r, w.length ? `Fim! ${w.map((s) => nameOf(r, s)).join(' e ')} ganhou (+15 🪙)` : 'Fim do quiz — ninguém pontuou.', w);
      }
      g.answered = {}; g.message = `Pergunta ${g.qi + 1}/${g.qs.length}`;
      setTimer(r, 12000, () => quiz.next(r)); emit(r);
    },
    action(r, sid, a, i) {
      const g = r.game; if (a !== 'answer' || sid in g.answered) return;
      g.answered[sid] = i;
      if (i === g.qs[g.qi][2]) g.scores[sid] = (g.scores[sid] || 0) + Math.max(1, Math.ceil((g.endsAt - Date.now()) / 1000));
      if (!g.participants.includes(sid)) g.participants.push(sid);
      if (Object.keys(g.answered).length >= r.members.size) setTimer(r, 1500, () => quiz.next(r));
      emit(r);
    },
    view: (g, r, sid) => { const q = g.qs[g.qi]; return { cat: g.cat, q: q && q[0], options: q && q[1], answered: Object.keys(g.answered || {}), mine: g.answered?.[sid], scores: scoresView(r, g.scores) }; },
  };

  // ================= Quem é mais provável… =================
  const MP = ['…de se tornar famoso/a no TikTok?', '…de adormecer num filme?', '…de chegar atrasado/a ao próprio casamento?', '…de comer a comida dos outros?', '…de ficar rico/a?', '…de se perder numa cidade nova?', '…de ganhar um reality show?', '…de rir num momento sério?', '…de adotar 10 gatos?', '…de mandar mensagem à pessoa errada?', '…de viver noutro país?', '…de ficar acordado/a até às 5 da manhã a ver séries?', '…de se esquecer do aniversário de alguém?', '…de sobreviver a um apocalipse zombie?', '…de começar a dançar no meio da rua?', '…de chorar num filme de animação?', '…de gastar tudo em roupa?', '…de ser presidente da câmara?', '…de responder com um meme a tudo?', '…de cozinhar o melhor jantar?'];
  const maisProvavel = {
    min: 2,
    start(r) {
      r.game = { type: 'maisProvavel', prompts: shuffle(MP).slice(0, 5), i: -1, titles: [], participants: [...r.members.keys()] };
      maisProvavel.next(r);
    },
    next(r) {
      const g = r.game; g.i++;
      if (g.i >= g.prompts.length) return end(r, 'Fim! Vejam os títulos 👇', []);
      g.phase = 'vote'; g.votes = {}; g.results = null; g.message = `Ronda ${g.i + 1}/${g.prompts.length}`;
      setTimer(r, 20000, () => maisProvavel.reveal(r)); emit(r);
    },
    reveal(r) {
      const g = r.game; const count = {};
      for (const t of Object.values(g.votes)) if (r.members.has(t)) count[t] = (count[t] || 0) + 1;
      g.results = Object.entries(count).sort((a, b) => b[1] - a[1]).map(([s, n]) => ({ name: nameOf(r, s), n }));
      if (g.results[0]) g.titles.push({ prompt: g.prompts[g.i], name: g.results[0].name });
      g.phase = 'reveal'; setTimer(r, 5000, () => maisProvavel.next(r)); emit(r);
    },
    action(r, sid, a, target) {
      const g = r.game; if (a !== 'vote' || g.phase !== 'vote' || !r.members.has(target)) return;
      g.votes[sid] = target;
      if (Object.keys(g.votes).length >= r.members.size) maisProvavel.reveal(r); else emit(r);
    },
    view: (g, r, sid) => ({ prompt: g.prompts[g.i], phase: g.phase, voted: Object.keys(g.votes || {}).length, myVote: g.votes?.[sid], candidates: [...r.members.keys()].map((s) => ({ sid: s, name: nameOf(r, s) })), results: g.results, titles: g.titles }),
  };

  // ================= Verdade ou Consequência (versão segura) =================
  const TRUTHS = ['Qual foi a coisa mais embaraçosa que te aconteceu na escola?', 'Qual é a tua música «guilty pleasure»?', 'Qual é o teu maior medo?', 'Que app usas mais e quanto tempo por dia?', 'Qual foi o pior presente que já recebeste?', 'Qual é o teu talento escondido?', 'O que farias com 1 milhão de euros?', 'Qual foi a tua pior fase de estilo?', 'Que série já viste mais vezes?', 'Já fingiste estar doente para faltar a alguma coisa?', 'Qual foi a compra de que mais te arrependeste?', 'Qual é a coisa mais estranha que já comeste?', 'Se pudesses trocar de vida com alguém por um dia, quem seria?', 'Qual é o teu sonho mais louco?', 'Que mania tens que ninguém sabe?', 'Qual foi a última vez que choraste a rir?'];
  const DARES = ['Canta o refrão de uma música escolhida pelo grupo.', 'Fala com sotaque nas tuas próximas 3 mensagens.', 'Faz a tua melhor imitação de um animal na câmara.', 'Conta uma piada — se ninguém rir, conta outra.', 'Faz 10 agachamentos na câmara.', 'Escreve as próximas 3 mensagens só com emojis.', 'Dança 10 segundos sem música.', 'Diz um elogio sincero a cada pessoa da sala.', 'Fala como narrador de documentário durante 30 segundos.', 'Faz a tua melhor cara de surpresa durante 10 segundos.', 'Muda o avatar para um look escolhido pelo grupo durante 5 minutos.', 'Faz uma pose de super-herói e mantém-na até à próxima vez.', 'Imita alguém da sala (com carinho!).', 'Inventa um rap de 4 versos sobre a sala.'];
  const verdade = {
    min: 2,
    start(r) {
      const order = shuffle([...r.members.keys()]);
      r.game = { type: 'verdade', order, participants: [...order], idx: -1, turns: 0, maxTurns: Math.min(order.length * 2, 12), scores: {} };
      verdade.next(r);
    },
    next(r) {
      const g = r.game; g.order = alive(r, g.order);
      if (g.turns >= g.maxTurns || g.order.length < 2) { const w = topOf(g.scores); return end(r, 'Fim! Obrigado pela coragem 😅', w); }
      g.turns++; g.idx = (g.idx + 1) % g.order.length; g.player = g.order[g.idx];
      g.phase = 'choose'; g.kind = null; g.prompt = null; g.message = `Vez de ${nameOf(r, g.player)}: verdade ou consequência?`;
      setTimer(r, 30000, () => { sysMsg(r, `${nameOf(r, g.player)} não escolheu a tempo.`); verdade.next(r); }); emit(r);
    },
    action(r, sid, a) {
      const g = r.game; if (sid !== g.player) return;
      if (g.phase === 'choose' && (a === 'truth' || a === 'dare')) {
        g.kind = a; g.prompt = pick(a === 'truth' ? TRUTHS : DARES); g.phase = 'do';
        g.message = `${nameOf(r, sid)} escolheu ${a === 'truth' ? 'VERDADE' : 'CONSEQUÊNCIA'}`;
        setTimer(r, 60000, () => verdade.next(r)); return emit(r);
      }
      if (g.phase === 'do' && (a === 'done' || a === 'pass')) {
        if (a === 'done') { g.scores[sid] = (g.scores[sid] || 0) + 1; sysMsg(r, `✅ ${nameOf(r, sid)} cumpriu!`); }
        else sysMsg(r, `🙈 ${nameOf(r, sid)} passou.`);
        verdade.next(r);
      }
    },
    view: (g, r) => ({ player: g.player, playerName: nameOf(r, g.player), phase: g.phase, kind: g.kind, prompt: g.prompt, turn: g.turns, maxTurns: g.maxTurns, scores: scoresView(r, g.scores) }),
    leave(r, sid) { if (r.game.player === sid) verdade.next(r); },
  };

  // ================= Impostor =================
  const IMP = {
    Comida: ['pizza', 'sushi', 'francesinha', 'gelado', 'pastel de nata', 'hambúrguer', 'bacalhau'],
    Lugares: ['praia', 'aeroporto', 'hospital', 'cinema', 'escola', 'ginásio', 'discoteca'],
    Animais: ['girafa', 'pinguim', 'tubarão', 'gato', 'polvo', 'elefante', 'canguru'],
    Profissões: ['bombeiro', 'médico', 'professor', 'youtuber', 'cozinheiro', 'piloto', 'DJ'],
    Desporto: ['futebol', 'surf', 'ténis', 'basquetebol', 'natação', 'skate', 'boxe'],
  };
  const impostor = {
    min: 3,
    start(r) {
      const players = [...r.members.keys()]; const cat = pick(Object.keys(IMP));
      r.game = { type: 'impostor', players, participants: [...players], cat, word: pick(IMP[cat]), imp: pick(players), phase: 'clues', votes: {}, message: 'Cada um escreve UMA pista no chat (sem dizer a palavra!).' };
      setTimer(r, 60000, () => impostor.vote(r)); emit(r);
    },
    vote(r) { const g = r.game; g.phase = 'vote'; g.message = 'Votem: quem é o impostor?'; setTimer(r, 30000, () => impostor.reveal(r)); emit(r); },
    reveal(r) {
      const g = r.game; const c = {};
      for (const t of Object.values(g.votes)) c[t] = (c[t] || 0) + 1;
      const top = Object.entries(c).sort((a, b) => b[1] - a[1]);
      const caught = top.length && top[0][0] === g.imp && (top.length < 2 || top[1][1] < top[0][1]);
      g.reveal = { imp: nameOf(r, g.imp), word: g.word };
      const crew = alive(r, g.players).filter((s) => s !== g.imp);
      if (caught) { crew.forEach((s) => { const u = userOf(r, s); if (u) addCoins(u, 10); }); end(r, `Apanhado! ${nameOf(r, g.imp)} era o impostor. A malta ganha +10 🪙`, crew); }
      else { const u = userOf(r, g.imp); if (u) addCoins(u, 20); end(r, `${nameOf(r, g.imp)} era o impostor e escapou! +20 🪙`, [g.imp]); }
    },
    action(r, sid, a, target) {
      const g = r.game;
      if (a === 'skip' && g.phase === 'clues') return impostor.vote(r);
      if (a !== 'vote' || g.phase !== 'vote' || !g.players.includes(sid) || !r.members.has(target) || target === sid) return;
      g.votes[sid] = target;
      if (Object.keys(g.votes).length >= alive(r, g.players).length) impostor.reveal(r); else emit(r);
    },
    view: (g, r, sid) => ({ phase: g.phase, cat: g.cat, playing: g.players.includes(sid), isImpostor: sid === g.imp, word: g.players.includes(sid) && sid !== g.imp ? g.word : null, candidates: alive(r, g.players).filter((s) => s !== sid).map((s) => ({ sid: s, name: nameOf(r, s) })), voted: Object.keys(g.votes).length, myVote: g.votes[sid], total: alive(r, g.players).length, reveal: g.reveal }),
    leave(r, sid, who) { if (r.game.imp === sid) end(r, `${who} (o impostor!) saiu.`); else if (alive(r, r.game.players).length < 3) end(r, 'Jogadores insuficientes.'); },
  };

  // ================= Cartas Loucas (descarta tudo para ganhar) =================
  const COLORS = ['r', 'g', 'b', 'y'];
  function newDeck() {
    const d = []; let n = 0;
    for (const c of COLORS) {
      d.push({ id: n++, c, v: '0' });
      for (const v of ['1','2','3','4','5','6','7','8','9','skip','rev','+2']) { d.push({ id: n++, c, v }); d.push({ id: n++, c, v }); }
    }
    for (let i = 0; i < 4; i++) { d.push({ id: n++, c: 'w', v: 'w' }); d.push({ id: n++, c: 'w', v: '+4' }); }
    return shuffle(d);
  }
  const cartas = {
    min: 2, max: 6,
    start(r) {
      const players = [...r.members.keys()].slice(0, 6);
      const deck = newDeck(); const hands = {};
      for (const s of players) hands[s] = deck.splice(0, 7);
      let top; do { top = deck.shift(); if (top.c === 'w') deck.push(top); } while (top.c === 'w');
      r.game = { type: 'cartas', players, participants: [...players], hands, deck, discard: [top], color: top.c, turn: 0, dir: 1, drawn: null };
      cartas.turnStart(r, `Começa ${nameOf(r, players[0])}`);
    },
    top: (g) => g.discard[g.discard.length - 1],
    playable: (g, c) => c.c === 'w' || c.c === g.color || c.v === cartas.top(g).v,
    draw(g, n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        if (!g.deck.length) { const t = g.discard.pop(); g.deck = shuffle(g.discard); g.discard = [t]; }
        if (!g.deck.length) break;
        out.push(g.deck.shift());
      }
      return out;
    },
    advance(g, steps = 1) { const n = g.players.length; g.turn = (((g.turn + g.dir * steps) % n) + n) % n; },
    turnStart(r, msg) {
      const g = r.game; g.drawn = null; g.message = msg;
      setTimer(r, 30000, () => { const s = g.players[g.turn]; g.hands[s].push(...cartas.draw(g, 1)); cartas.advance(g); cartas.turnStart(r, `${nameOf(r, s)} demorou — comprou 1 carta.`); });
      emit(r);
    },
    action(r, sid, a, p) {
      const g = r.game; const me = g.players[g.turn]; if (sid !== me) return;
      const hand = g.hands[sid];
      if (a === 'draw' && !g.drawn) {
        const [c] = cartas.draw(g, 1); if (!c) return;
        hand.push(c);
        if (cartas.playable(g, c)) { g.drawn = c.id; g.message = `${nameOf(r, sid)} comprou uma carta…`; return emit(r); }
        cartas.advance(g); return cartas.turnStart(r, `${nameOf(r, sid)} comprou e passou.`);
      }
      if (a === 'pass' && g.drawn != null) { cartas.advance(g); return cartas.turnStart(r, `${nameOf(r, sid)} passou.`); }
      if (a !== 'play') return;
      const idx = hand.findIndex((c) => c.id === p?.id); if (idx < 0) return;
      const card = hand[idx];
      if (g.drawn != null && card.id !== g.drawn) return;
      if (!cartas.playable(g, card)) return;
      if (card.c === 'w' && !COLORS.includes(p.color)) return;
      hand.splice(idx, 1); g.discard.push(card); g.color = card.c === 'w' ? p.color : card.c;
      if (!hand.length) { const u = userOf(r, sid); if (u) addCoins(u, 20); return end(r, `${nameOf(r, sid)} ficou sem cartas e ganhou! +20 🪙`, [sid]); }
      let msg = `${nameOf(r, sid)} jogou`; const two = g.players.length === 2;
      if (card.v === 'skip') { cartas.advance(g, 2); msg += ' ⊘ — salta a vez'; }
      else if (card.v === 'rev') { g.dir *= -1; cartas.advance(g, two ? 2 : 1); msg += ' ⇄ — inverte'; }
      else if (card.v === '+2' || card.v === '+4') {
        cartas.advance(g); const victim = g.players[g.turn]; const n = card.v === '+2' ? 2 : 4;
        g.hands[victim].push(...cartas.draw(g, n)); cartas.advance(g); msg += ` ${card.v} — ${nameOf(r, victim)} compra ${n}`;
      } else cartas.advance(g);
      if (hand.length === 1) msg += ` · ${nameOf(r, sid)} só tem 1 carta! 🔔`;
      cartas.turnStart(r, msg);
    },
    view: (g, r, sid) => ({ top: cartas.top(g), color: g.color, turnSid: g.players[g.turn], dir: g.dir, players: g.players.map((s) => ({ sid: s, name: nameOf(r, s), count: g.hands[s].length })), hand: g.hands[sid] || null, drawn: g.players[g.turn] === sid ? g.drawn : null, playableIds: g.players[g.turn] === sid ? (g.hands[sid] || []).filter((c) => (g.drawn == null || c.id === g.drawn) && cartas.playable(g, c)).map((c) => c.id) : [], deck: g.deck.length }),
    leave(r, sid, who) {
      const g = r.game; const i = g.players.indexOf(sid); if (i < 0) return;
      const wasTurn = i === g.turn; const cur = g.players[g.turn];
      g.deck.push(...g.hands[sid]); delete g.hands[sid]; g.players.splice(i, 1);
      if (g.players.length < 2) { const w = g.players[0]; return end(r, `${who} saiu. ${w ? nameOf(r, w) + ' ganha!' : ''}`, w ? [w] : []); }
      const n = g.players.length;
      if (wasTurn) { g.turn = ((g.dir === 1 ? i : i - 1) + n) % n; cartas.turnStart(r, `${who} saiu.`); }
      else { g.turn = g.players.indexOf(cur); emit(r); }
    },
  };

  const futebol = require('./football').createMatch({ io, sysMsg, nameOf, userOf, addCoins, save: ctx.save, emit, end, setTimer });

  const GAMES = { galo, desenha, quiz, maisProvavel, verdade, impostor, cartas, futebol };

  function view(r, sid) {
    const g = r.game; if (!g) return null;
    const def = GAMES[g.type];
    return { type: g.type, over: !!g.over, message: g.message, endsAt: g.endsAt, total: g.total, ...def.view(g, r, sid) };
  }

  return {
    names: Object.keys(GAMES),
    start(r, sid, type, opts) {
      const def = GAMES[type]; if (!def) return;
      if (r.game && !r.game.over) return io.to(sid).emit('toast', 'Já há um jogo a decorrer.');
      if (r.members.size < def.min) return io.to(sid).emit('toast', `Este jogo precisa de pelo menos ${def.min} pessoas na sala.`);
      if (r.game) clearTimeout(r.game.timer);
      def.start(r, sid, opts); emit(r);
    },
    action(r, sid, a, p) { const g = r.game; if (!g || g.over) return; if (a === 'end') return end(r, 'Jogo terminado.'); GAMES[g.type].action?.(r, sid, a, p); },
    chat(r, sid, text) { const g = r.game; return !!(g && !g.over && GAMES[g.type].chat?.(r, sid, text)); },
    leave(r, sid, who) { const g = r.game; if (g && !g.over) GAMES[g.type].leave?.(r, sid, who); },
    emitTo(r, sid) { io.to(sid).emit('game', view(r, sid)); },
    stop(r) { if (r.game) clearTimeout(r.game.timer); },
  };
};
