'use strict';
/* Fluxo dos modos de jogo e ecrãs de resultado. */
const MODES = (() => {
  const h = U.el;
  let tour = null, run = null, lastQuick = null;

  /* ---------- ecrã de resultado ---------- */
  function result(o) {
    const P = PROG.get();
    const meLook = o.meLook || GAME.avatarLook(P.avatar);
    const win = o.win;
    const drops = Array.from({ length: 14 }, (_, i) => ({ x: (i * 37) % 150, s: 40 + (i * 13) % 30 }));
    const conf = Array.from({ length: 40 }, (_, i) => ({ x: (i * 53) % 150, y: -(i * 17) % 90, c: ['#ffd23f', '#ff3b3b', '#3bb0ff', '#3bff7a', '#ff6bd6'][i % 5], s: 20 + (i * 7) % 25 }));
    const cv = UI.animCanvas(150, 92, 2, (ctx, tt) => {
      ctx.clearRect(0, 0, 150, 92);
      // chão e pódio
      SCENE.rect(ctx, 0, 84, 150, 8, '#1a1428');
      const lx = 8, rx = 86;
      if (o.oppLook) {
        const meY = win ? 10 : 18, opY = win ? 18 : 10;
        SCENE.rect(ctx, lx - 2, meY + 66, 56, 84 - meY - 66 + 8, win ? '#c8961a' : '#3a3450');
        SCENE.rect(ctx, rx - 2, opY + 66, 56, 84 - opY - 66 + 8, win ? '#3a3450' : '#c8961a');
        SPR.drawChar(ctx, meLook, lx, meY, 2, { pose: win ? 'happy' : 'sad', t: tt, blink: (tt % 3) < 0.1 });
        SPR.drawChar(ctx, o.oppLook, rx, opY, 2, { pose: win ? 'sad' : 'happy', t: tt + 0.5, blink: (tt % 3.4) < 0.1 });
        const loserX = win ? rx : lx, loserY = win ? opY : meY;
        cloud(ctx, loserX + 10, loserY - 6, tt, drops);
      } else {
        SPR.drawChar(ctx, meLook, 51, 14, 2, { pose: win ? 'happy' : 'sad', t: tt });
        if (!win) cloud(ctx, 61, 8, tt, drops);
      }
      if (win) for (const c of conf) { const y = (c.y + tt * c.s) % 96; ctx.fillStyle = c.c; ctx.fillRect(Math.round(c.x + Math.sin(tt * 3 + c.x) * 3), Math.round(y), 2, 2); }
    });
    function cloud(ctx, x, y, tt, dr) {
      SCENE.rect(ctx, x, y + 2, 28, 6, '#6a6a7a'); SCENE.rect(ctx, x + 4, y, 20, 3, '#7a7a8a'); SCENE.rect(ctx, x + 2, y + 7, 24, 1, '#4a4a5a');
      ctx.fillStyle = '#6ad0ff';
      for (const d of dr.slice(0, 6)) { const yy = (tt * d.s + d.x) % 30; ctx.fillRect(x + 2 + (d.x % 24), y + 9 + yy, 1, 2); }
    }
    const coinsEl = h('b', { class: 'count', text: '0' });
    const rewards = o.rewards;
    if (rewards && rewards.coins) {
      const total = rewards.coins; const t0 = performance.now();
      const tick = () => { const f = Math.min(1, (performance.now() - t0) / 900); coinsEl.textContent = '+' + U.fmt(total * f); if (f < 1 && coinsEl.isConnected) requestAnimationFrame(tick); else if (f >= 1) SFX.coin(); };
      requestAnimationFrame(tick);
    }
    const lv = P.level, need = PROG.xpForLevel(lv);
    const body = h('div', { class: 'result ' + (win ? 'win' : 'lose') },
      h('h1', { class: 'rtitle', text: o.title }),
      o.subtitle ? h('p', { class: 'rsub', text: o.subtitle }) : null,
      cv,
      o.quote ? h('p', { class: 'quote', text: '«' + o.quote + '»' }) : null,
      o.starsN != null ? h('div', { class: 'bigstars' }, UI.stars(o.starsN, 3)) : null,
      o.rows ? h('div', { class: 'records' }, ...o.rows.map(([k, v]) => h('div', {}, h('small', { text: k }), h('b', { text: String(v) })))) : null,
      rewards ? h('div', { class: 'rewards' },
        rewards.coins ? h('div', {}, h('i', { class: 'ic ic-coin' }), ' ', coinsEl, h('small', { text: ' moedas' })) : null,
        rewards.xp ? h('div', {}, h('small', { text: `+${rewards.xp} XP · Nível ${lv}` }), h('div', { class: 'meter' }, h('i', { style: { width: Math.round(P.xp / need * 100) + '%' } }))) : null,
        rewards.ratingDelta ? h('small', { class: rewards.ratingDelta > 0 ? 'up' : 'down', text: `Ranking: ${rewards.ratingDelta > 0 ? '+' : ''}${rewards.ratingDelta} (${P.rating})` }) : null,
        ...(rewards.levelUps || []).map(u => h('div', { class: 'lvlup', text: `⬆ NÍVEL ${u.level}! +${u.bonus} moedas` })),
        rewards.revenge ? h('div', { class: 'lvlup', text: '😤 Vingança servida!' }) : null,
      ) : null,
      o.extra || null,
      h('div', { class: 'rbtns' }, ...o.buttons.map(([label, fn, cls]) => UI.btn(label, fn, cls || ''))),
    );
    UI.show(h('section', { class: 'screen resultScreen' }, h('div', { class: 'scroll' }, body)));
    if (win) SFX.startMusic('menu');
    const fresh = PROG.newlyUnlocked();
    if (fresh.length) setTimeout(() => UI.announceUnlocks(fresh), 900);
  }

  function statRows(s) {
    const mm = Math.floor(s.time / 60), ss = Math.floor(s.time % 60);
    return [['Bolas', s.stats[0].potted], ['Tacadas', s.stats[0].shots], ['Faltas', s.stats[0].fouls], ['Melhor sequência', s.stats[0].bestRun], ['Tempo', `${mm}:${String(ss).padStart(2, '0')}`], ['Bolas dele', s.stats[1].potted]];
  }

  /* ---------- partida rápida ---------- */
  function quick(opp, scene) {
    lastQuick = { opp, scene };
    GAME.start({ mode: 'quick', opp, scene, onEnd: s => {
      const rw = PROG.onMatchEnd({ ...s, mode: 'quick', mult: 1 });
      result({
        win: s.win, title: s.win ? 'VITÓRIA!' : 'DERROTA',
        subtitle: s.win ? (s.runout ? `Mesa limpa contra ${opp.name}! Nem tacou!` : `Venceste ${opp.name}!`) : `${opp.name} ganhou desta vez.`,
        oppLook: opp.look, quote: U.pick(opp.lines[s.win ? 'lose' : 'win']), rows: statRows(s), rewards: rw,
        buttons: [['↻ Revanche', () => quick(opp, scene), 'go'], ['Outro adversário', UI.opponents], ['Menu', UI.home]],
      });
    } });
  }
  function twoPlayer(scene) {
    GAME.start({ mode: 'quick', twoPlayer: true, scene, onEnd: s => {
      PROG.get().stats.scenesPlayed[scene] = true; PROG.checkAll();
      const w = s.winner + 1;
      result({
        win: true, title: `JOGADOR ${w} GANHOU!`, subtitle: 'Partida a dois no mesmo telemóvel.',
        meLook: GAME.avatarLook(s.winner === 0 ? PROG.get().avatar : GAME.P2_AVATAR),
        oppLook: GAME.avatarLook(s.winner === 0 ? GAME.P2_AVATAR : PROG.get().avatar),
        rows: [['Bolas J1', s.stats[0].potted], ['Bolas J2', s.stats[1].potted], ['Faltas J1', s.stats[0].fouls], ['Faltas J2', s.stats[1].fouls]],
        buttons: [['↻ Desforra', () => twoPlayer(scene), 'go'], ['Menu', UI.home]],
      });
    } });
  }
  function free(scene) { GAME.start({ mode: 'free', scene }); }

  /* ---------- desafios ---------- */
  function challenge(d) {
    GAME.start({ mode: 'challenge', challenge: d, scene: PROG.get().equip.scene, onEnd: r => {
      const coins = r.ok ? PROG.onChallenge(d.id, r.stars, d.reward) : 0;
      const idx = CHALLENGES.indexOf(d), next = CHALLENGES[idx + 1];
      const btns = [['↻ Repetir', () => challenge(d), r.ok ? '' : 'go']];
      if (r.ok && next) btns.unshift(['Próximo ▶', () => challenge(next), 'go']);
      btns.push(['Desafios', UI.challenges]);
      result({
        win: r.ok, title: r.ok ? 'DESAFIO SUPERADO!' : 'FALHASTE', subtitle: r.ok ? d.name : r.why, starsN: r.ok ? r.stars : null,
        rows: [['Tacadas', r.shots], ['Tempo', Math.round(r.time) + ' s']], rewards: coins ? { coins } : null, buttons: btns,
      });
    } });
  }

  /* ---------- sobrevivência ---------- */
  function survivalIntro() {
    const P = PROG.get();
    UI.show(UI.screen('Sobrevivência', h('div', { class: 'detail' },
      h('p', { class: 'big', text: '🔥 Adversários cada vez mais difíceis. Uma derrota e acaba!' }),
      h('p', { text: 'Cada ronda ganha dá moedas extra, e quanto mais longe chegares maior é o prémio. Começa no Bar e acaba… com as lendas.' }),
      h('div', { class: 'records' }, h('div', {}, h('small', { text: 'Recorde' }), h('b', { text: P.stats.bestSurvival + ' rondas' })), h('div', {}, h('small', { text: 'Mestre Sombra' }), h('b', { text: PROG.charUnlocked(CHAR_BY_ID.sombra) ? 'Desbloqueado' : '8 rondas' }))),
      UI.btn('▶ COMEÇAR', () => { run = { round: 1, coins: 0, used: [] }; playSurvival(survivalPick(1)); }, 'go big'),
    )));
  }
  function survivalPick(round) {
    const target = Math.min(10, 1 + Math.floor((round - 1) * 0.75));
    let pool = CHARACTERS.filter(c => !run.used.includes(c.id));
    if (!pool.length) { run.used = []; pool = CHARACTERS.slice(); }
    const best = Math.min(...pool.map(c => Math.abs(c.diff - target)));
    return U.pick(pool.filter(c => Math.abs(c.diff - target) === best));
  }
  function playSurvival(opp) {
    run.used.push(opp.id);
    GAME.start({ mode: 'survival', opp, scene: opp.scene, title: `Sobrevivência · Ronda ${run.round}`, onEnd: s => survivalHandle(opp, s) });
  }
  function survivalHandle(opp, s) {
    const rw = PROG.onMatchEnd({ ...s, mode: 'survival', mult: 1 + run.round * 0.1 });
    if (s.win) {
      const bonus = 15 * run.round;
      PROG.addCoins(bonus, true); rw.coins += bonus; run.coins += rw.coins;
      PROG.onSurvivalRound(run.round);
      const done = run.round; run.round++;
      const nextOpp = survivalPick(run.round);
      result({
        win: true, title: `RONDA ${done} SUPERADA!`, subtitle: `Venceste ${opp.name}. Total da corrida: ${U.fmt(run.coins)} moedas.`,
        oppLook: opp.look, quote: U.pick(opp.lines.lose), rows: statRows(s), rewards: rw,
        extra: h('div', { class: 'nextopp' }, h('small', { text: 'Próximo adversário' }), UI.portraitEl(nextOpp, 2, 26, 1), h('b', { text: PROG.charUnlocked(nextOpp) ? nextOpp.name : '??? (misterioso)' }), UI.diffStars(nextOpp.diff)),
        buttons: [['Próxima ronda ▶', () => playSurvival(nextOpp), 'go'], ['Terminar corrida', survivalEnd]],
      });
    } else {
      run.coins += rw.coins;
      const won = run.round - 1;
      result({
        win: false, title: 'FIM DA CORRIDA', subtitle: `${opp.name} travou-te na ronda ${run.round}. Venceste ${won} ronda${won === 1 ? '' : 's'}.`,
        oppLook: opp.look, quote: U.pick(opp.lines.win), rows: statRows(s), rewards: rw,
        buttons: [['↻ Nova corrida', survivalIntro, 'go'], ['Menu', UI.home]],
      });
      run = null;
    }
  }
  function survivalEnd() {
    const won = run ? run.round - 1 : 0, coins = run ? run.coins : 0;
    run = null;
    result({ win: won > 0, title: 'CORRIDA TERMINADA', subtitle: `Venceste ${won} ronda${won === 1 ? '' : 's'} e ganhaste ${U.fmt(coins)} moedas.`, buttons: [['↻ Nova corrida', survivalIntro, 'go'], ['Menu', UI.home]] });
  }

  /* ---------- torneio ---------- */
  function tournamentStart(cup) {
    if (!PROG.spend(cup.entry)) { UI.toast('Moedas insuficientes', 'bad'); return; }
    const [a, b] = cup.range;
    let pool = U.shuffle(CHARACTERS.filter(c => c.diff >= a && c.diff <= b));
    if (pool.length < 7) pool = pool.concat(U.shuffle(CHARACTERS.filter(c => !pool.includes(c))).sort((x, y) => Math.abs(x.diff - (a + b) / 2) - Math.abs(y.diff - (a + b) / 2))).slice(0, 7);
    const opps = pool.slice(0, 7).sort((x, y) => x.diff - y.diff);
    // o mais fácil nos quartos contra ti; os outros espalhados
    const seeds = ['_me', opps[0].id, opps[6].id, opps[1].id, opps[5].id, opps[2].id, opps[4].id, opps[3].id];
    tour = { cup, round: 0, rounds: [seeds.slice()], alive: true };
    bracket();
  }
  function tourName(id) { return id === '_me' ? (PROG.get().avatar.name || 'Tu') : CHAR_BY_ID[id].short; }
  function myOpponent() {
    const r = tour.rounds[tour.round], i = r.indexOf('_me');
    return CHAR_BY_ID[r[i % 2 ? i - 1 : i + 1]];
  }
  function simMatch(a, b) {
    if (a === '_me' || b === '_me') return null;
    const da = CHAR_BY_ID[a].diff, db = CHAR_BY_ID[b].diff;
    const pa = 1 / (1 + Math.pow(10, (db - da) / 3));
    return Math.random() < pa ? a : b;
  }
  function advance(meWon) {
    const r = tour.rounds[tour.round], next = [];
    for (let i = 0; i < r.length; i += 2) {
      const a = r[i], b = r[i + 1];
      if (a === '_me' || b === '_me') next.push(meWon ? '_me' : (a === '_me' ? b : a));
      else next.push(simMatch(a, b));
    }
    tour.rounds.push(next); tour.round++;
  }
  function bracket() {
    const cols = [];
    for (let r = 0; r < 4; r++) {
      const ids = tour.rounds[r];
      const col = h('div', { class: 'bcol' }, h('small', { class: 'bname', text: r < 3 ? ROUND_NAMES[r] : 'Campeão' }));
      const n = r < 3 ? 8 >> r : 1;
      for (let i = 0; i < n; i++) {
        const id = ids ? ids[i] : null;
        const lost = ids && tour.rounds[r + 1] && !tour.rounds[r + 1].includes(id);
        col.appendChild(h('div', { class: 'bslot' + (id === '_me' ? ' me' : '') + (lost ? ' out' : '') + (i % 2 === 1 && r < 3 ? ' pair' : '') },
          id ? (id === '_me' ? UI.staticCanvas(24, 20, 1, ctx => SPR.drawChar(ctx, GAME.avatarLook(PROG.get().avatar), 0, -2, 1, {})) : UI.portraitEl(CHAR_BY_ID[id], 1, 20, 1)) : h('span', { class: 'q', text: '?' }),
          h('span', { text: id ? tourName(id) : '—' })));
      }
      cols.push(col);
    }
    const opp = myOpponent();
    const body = h('div', {},
      h('p', { class: 'note', text: `${tour.cup.name} · Prémio ${U.fmt(tour.cup.prize)} moedas` }),
      h('div', { class: 'bracket' }, ...cols),
      h('div', { class: 'nextopp' }, h('small', { text: ROUND_NAMES[tour.round] + ' · o teu adversário' }), UI.portraitEl(opp, 2, 26, 1), h('b', { text: PROG.charUnlocked(opp) ? opp.name : '??? (misterioso)' }), UI.diffStars(opp.diff)),
      UI.btn(`▶ Jogar ${ROUND_NAMES[tour.round].toLowerCase()}`, playTour, 'go big'),
    );
    UI.show(UI.screen('Torneio', body, { back: () => UI.confirmBox('Sair do torneio? Perdes a inscrição.', 'Sair', () => { tour = null; UI.tournaments(); }) }));
  }
  function playTour() {
    const opp = myOpponent(), r = tour.round, cup = tour.cup;
    const scene = r === 2 ? 'stadium' : cup.scene;
    GAME.start({ mode: 'tournament', opp, scene, title: `${cup.name} · ${ROUND_NAMES[r]}`, onEnd: s => {
      const rw = PROG.onMatchEnd({ ...s, mode: 'tournament', mult: 1 + r * 0.25 });
      if (s.win && r === 2) {
        PROG.onTournamentWin(cup);
        rw.coins += cup.prize;
        advance(true);
        const trophy = h('div', { class: 'champion' }, h('span', { class: 'trophy big ' + cup.id }, h('i', { class: 'ic ic-trophy' })), h('b', { text: `CAMPEÃO DA ${cup.name.toUpperCase()}!` }));
        tour = null;
        result({ win: true, title: 'CAMPEÃO!', subtitle: `Ganhaste a ${cup.name}! +${U.fmt(cup.prize)} moedas de prémio.`, oppLook: opp.look, quote: U.pick(opp.lines.lose), rows: statRows(s), rewards: rw, extra: trophy,
          buttons: [['Torneios', UI.tournaments, 'go'], ['Menu', UI.home]] });
      } else if (s.win) {
        advance(true);
        result({ win: true, title: 'APURADO!', subtitle: `Venceste ${opp.name} e segues para ${['', 'as meias-finais', 'a final'][tour.round]}.`, oppLook: opp.look, quote: U.pick(opp.lines.lose), rows: statRows(s), rewards: rw,
          buttons: [['Ver quadro ▶', bracket, 'go']] });
      } else {
        const where = ['nos quartos de final', 'nas meias-finais', 'na final'][r];
        tour = null;
        result({ win: false, title: 'ELIMINADO', subtitle: `${opp.name} afastou-te ${where}.`, oppLook: opp.look, quote: U.pick(opp.lines.win), rows: statRows(s), rewards: rw,
          buttons: [['Torneios', UI.tournaments, 'go'], ['Menu', UI.home]] });
      }
    } });
  }

  function abandon() {
    const st = GAME.st;
    if (st.mode === 'tournament') { tour = null; UI.toast('Desististe do torneio'); UI.tournaments(); }
    else if (st.mode === 'survival') survivalEnd();
    else if (st.mode === 'challenge') UI.challenges();
    else UI.home();
  }

  return { quick, twoPlayer, free, challenge, survivalIntro, tournamentStart, abandon, result, get lastQuick() { return lastQuick; } };
})();
