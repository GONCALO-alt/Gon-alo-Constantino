'use strict';
/* Núcleo do jogo: esquema do ecrã, ciclo de desenho, toques, tacadas, turnos, reações e comentários. */
const GAME = (() => {
  const W = 240, TOP_Y1 = 92, BOT_H = 88;
  let cv, ctx, stage, L = null, scale = 1;
  let t = 0, lastTs = 0, acc = 0, paused = false;
  const $ = id => document.getElementById(id);

  const st = {
    screen: 'menu', cfg: null, mode: null, opp: null, scene: 'bar', twoPlayer: false,
    balls: [], match: null, phase: 'idle',
    aim: -Math.PI / 2, power: 0, spin: { x: 0, y: 0 }, drag: null,
    shot: null, sh: null, startPos: null,
    stats: null, particles: [], floats: [], falling: [], shake: 0,
    anim: [{ pose: 'idle', until: 0 }, { pose: 'idle', until: 0 }],
    bubbleUntil: 0, talkUntil: 0, commentUntil: 0,
    timers: [], ai: null, challenge: null, announced8: [false, false], menuChar: null, menuCharT: 0,
    hintShown: 0,
  };

  /* ---------- aparência do jogador ---------- */
  function avatarLook(av, alt) {
    const topC = alt ? '#c84040' : av.topC;
    const hat = av.hat ? AVATAR.hats.find(h => h.id === av.hat) : null;
    return {
      skin: av.skin, hair: av.hair, hairC: av.hairC, beard: av.beard, beardC: av.hairC, glasses: av.glasses,
      hat: hat && hat.id ? { type: hat.id, c: hat.c, c2: '#ffffff' } : null,
      top: { type: av.top, c: topC, c2: U.shade(topC, av.top === 'jersey' ? 0.6 : -0.25), num: av.top === 'jersey' ? (alt ? '2' : '1') : '', numC: '#ffffff', shirt: '#ffffff', tie: av.top === 'suit' ? '#c03030' : null },
    };
  }
  const P2_AVATAR = { skin: '#d9a066', hair: 'curly', hairC: '#1a1a1a', top: 'tshirt', topC: '#c84040', beard: null, glasses: null, hat: null };

  /* ---------- esquema ---------- */
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let H = Math.round(W * vh / vw);
    H = U.clamp(H, 470, 600);
    scale = Math.min(vw / W, vh / H);
    cv.width = W; cv.height = H;
    stage.style.width = (W * scale) + 'px'; stage.style.height = (H * scale) + 'px';
    stage.style.left = ((vw - W * scale) / 2) + 'px'; stage.style.top = ((vh - H * scale) / 2) + 'px';
    document.documentElement.style.setProperty('--s', scale);
    const rail = 9, botY0 = H - BOT_H;
    const avail = botY0 - TOP_Y1 - rail * 2 - 8;
    const tw = Math.floor(Math.min(avail / 2, W - rail * 2 - 22));
    const th = tw * 2;
    const tx = Math.round((W - tw) / 2), ty = Math.round(TOP_Y1 + 4 + rail + (avail - th) / 2);
    L = { W, H, topY1: TOP_Y1, botY0, tx, ty, tw, th, k: tw, rail };
    L.D = Math.max(5, Math.round(2 * PHYS.R * L.k));
    L.bar = { x: 58, y: botY0 + 36, w: 134, h: 14 };
    L.spinC = { x: 218, y: botY0 + 46, r: 15 };
    ctx.imageSmoothingEnabled = false;
    positionOverlay();
  }
  function positionOverlay() {
    const set = (id, x, y) => { const e = $(id); if (e) { e.style.left = `calc(var(--s) * ${x}px)`; e.style.top = `calc(var(--s) * ${y}px)`; } };
    set('oppTag', 58, 19); set('bubble', 58, 31); set('meTag', 56, L.botY0 + 4); set('turnTag', 146, L.botY0 + 4);
    set('comment', 0, TOP_Y1 + 1); set('aimBtns', 56, L.botY0 + 58); set('panel', 6, 19);
    set('hint', 0, TOP_Y1 + 14);
  }
  const toPx = (x, y) => [L.tx + x * L.k, L.ty + y * L.k];
  const toTable = (lx, ly) => [(lx - L.tx) / L.k, (ly - L.ty) / L.k];

  /* ---------- texto em sobreposição ---------- */
  function say(text, dur = 2.8) {
    const b = $('bubble'); b.textContent = text; b.hidden = false;
    st.bubbleUntil = t + dur; st.talkUntil = t + Math.min(dur, 1.4);
  }
  function sayLine(kind, chance = 1) {
    if (!st.opp || Math.random() > chance) return;
    const arr = st.opp.lines[kind]; if (arr && arr.length) say(U.pick(arr));
  }
  function comment(kind, chance = 1) {
    if (Math.random() > chance) return;
    const arr = COMMENTS[kind]; if (!arr) return;
    const e = $('comment'); e.textContent = '🎙 ' + U.pick(arr); e.hidden = false; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop');
    st.commentUntil = t + 2.6;
  }
  function commentText(text) { const e = $('comment'); e.textContent = text; e.hidden = false; st.commentUntil = t + 2.6; }
  function react(p, pose, dur = 1.2) { st.anim[p] = { pose, until: t + dur }; }
  function later(sec, fn) { st.timers.push({ at: t + sec, fn }); }

  /* ---------- arranque das partidas ---------- */
  function start(cfg) {
    st.cfg = cfg; st.mode = cfg.mode; st.opp = cfg.opp || null; st.scene = cfg.scene || 'bar'; st.twoPlayer = !!cfg.twoPlayer;
    st.screen = 'play'; st.phase = 'idle'; st.timers = []; st.particles = []; st.floats = []; st.falling = []; st.ai = null; st.drag = null;
    st.power = 0; st.spin = { x: 0, y: 0 }; st.aim = -Math.PI / 2; st.announced8 = [false, false];
    st.stats = [0, 1].map(() => ({ shots: 0, potted: 0, fouls: 0, run: 0, bestRun: 0 }));
    st.match = { cur: 0, groups: [null, null], isBreak: true, ballInHand: true };
    st.challenge = null; st.t0 = t;
    $('bubble').hidden = true; $('comment').hidden = true;
    if (cfg.mode === 'challenge') {
      const d = cfg.challenge;
      st.balls = [{ id: 0, x: d.cue.x, y: d.cue.y, vx: 0, vy: 0, on: true }].concat(d.balls.map(b => ({ id: b.id, x: b.x, y: b.y, vx: 0, vy: 0, on: true })));
      st.match.isBreak = false; st.match.ballInHand = false;
      st.challenge = { def: d, shots: 0, start: t, next: 1, done: false };
      const firstTarget = st.balls.find(b => b.id !== 0);
      if (firstTarget) st.aim = Math.atan2(firstTarget.y - d.cue.y, firstTarget.x - d.cue.x);
    } else {
      st.balls = PHYS.rack();
    }
    UI.gameHud(st);
    SFX.startMusic(st.scene);
    if (st.opp) { later(0.4, () => { sayLine('hello'); react(1, 'talk', 1.5); }); }
    if (cfg.mode === 'free') commentText('🎱 Treino livre: joga à vontade!');
    else if (cfg.mode === 'challenge') commentText('🎯 ' + cfg.challenge.desc);
    else later(0.2, () => commentText(st.twoPlayer ? '🎱 Jogador 1 abre a partida' : '🎱 Tu abres a partida. Boa sorte!'));
    beginTurn();
  }

  function isHuman(p) { return p === 0 || st.twoPlayer; }
  function cueBall() { return st.balls.find(b => b.id === 0); }
  function placeArea() { return st.match.isBreak && st.mode !== 'challenge' ? { minY: PHYS.HEAD_Y, maxY: PHYS.L - PHYS.R } : null; }

  function beginTurn() {
    const m = st.match, cue = cueBall();
    if (!cue.on) {
      const s = PHYS.freeSpotNear(st.balls, 0.5, 1.58, 0, placeArea());
      Object.assign(cue, { on: true, x: s.x, y: s.y, vx: 0, vy: 0 });
    }
    st.power = 0; st.spin = { x: 0, y: 0 };
    UI.updateHud(st);
    if (st.mode === 'free' || st.mode === 'challenge' || isHuman(m.cur)) {
      st.phase = 'aim';
      if (st.hintShown < 2 && st.mode !== 'challenge') { st.hintShown++; showHint(m.ballInHand ? 'Arrasta a bola branca para a pores · Toca na mesa para apontar · Desliza a barra e solta para tacar' : 'Toca na mesa para apontar · Desliza a barra e solta para tacar'); }
      else if (m.ballInHand && !m.isBreak) showHint('Bola na mão: arrasta a bola branca para onde quiseres');
    } else startAI();
  }
  function showHint(text) { const h = $('hint'); h.textContent = text; h.hidden = false; st.hintUntil = t + 4.5; }

  /* ---------- IA ---------- */
  function startAI() {
    st.phase = 'ai';
    const m = st.match, diff = st.opp ? st.opp.diff : 5;
    react(1, 'think', 3);
    const ai = { stage: 'wait', t0: t };
    st.ai = ai;
    later(0.5 + Math.random() * 0.4, () => {
      if (st.ai !== ai) return;
      if (m.ballInHand) {
        const pos = m.isBreak ? { x: 0.5 + U.rand(-0.2, 0.2), y: 1.58 } : AI.placeCue(m, st.balls, 1, placeArea(), diff);
        const cue = cueBall();
        const ok = PHYS.isFree(st.balls, pos.x, pos.y, 0, placeArea()) ? pos : PHYS.freeSpotNear(st.balls, pos.x, pos.y, 0, placeArea());
        Object.assign(cue, { on: true, x: ok.x, y: ok.y });
      }
      ai.planner = AI.planner(m, st.balls, 1, diff);
      ai.stage = 'plan'; ai.t0 = t;
    });
  }
  function updateAI() {
    const ai = st.ai; if (!ai || st.phase !== 'ai') return;
    if (ai.stage === 'plan') {
      if (ai.planner.step(7) && t - ai.t0 > 0.7) {
        ai.res = ai.planner.result; ai.stage = 'aim'; ai.t0 = t; ai.from = st.aim;
        let d = ai.res.ang - st.aim; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
        ai.delta = d; react(1, 'idle', 0.1);
      }
    } else if (ai.stage === 'aim') {
      const f = U.clamp((t - ai.t0) / 0.7, 0, 1), e = 1 - Math.pow(1 - f, 3);
      st.aim = ai.from + ai.delta * e;
      if (f >= 1) { ai.stage = 'pull'; ai.t0 = t; st.spin = ai.res.spin; }
    } else if (ai.stage === 'pull') {
      const f = U.clamp((t - ai.t0) / 0.5, 0, 1);
      st.power = ai.res.power * f;
      if (f >= 1) { st.ai = null; shoot(ai.res.ang, ai.res.power, ai.res.spin); }
    }
  }

  /* ---------- tacada ---------- */
  function shoot(ang, power, spin) {
    const m = st.match, p = m.cur;
    st.aim = ang;
    st.startPos = {};
    for (const b of st.balls) if (b.on) st.startPos[b.id] = [b.x, b.y];
    const rec = PHYS.newRecord();
    st.shot = { rec, wasOn8: RULES.onEight(m, st.balls, p), shooter: p, power };
    st.sh = { rec, spin: PHYS.strike(st.balls, ang, power, spin), ev: physEvent };
    st.phase = 'moving'; st.power = 0; acc = 0;
    st.stats[p].shots++;
    SFX.cue(power);
    if (m.isBreak && st.mode !== 'challenge') st.shake = 3 * power;
    $('hint').hidden = true;
  }

  function physEvent(type, d) {
    if (type === 'ball') SFX.ball(d.speed);
    else if (type === 'rail') { if (d.speed > 0.12) SFX.rail(d.speed); }
    else if (type === 'pocket') {
      SFX.pocket();
      if (PROG.get().settings.vibrate) SFX.vibrate(18);
      const [px, py] = toPx(d.x, d.y);
      st.falling.push({ id: d.id, x: px, y: py, life: 0.22 });
      if (d.id !== 0) {
        potEffect(px, py);
        st.floats.push({ text: d.id === 8 ? 'BOLA 8!' : '+1', x: px, y: py - 6, life: 1, color: d.id === 8 ? '#ffd23f' : '#ffffff' });
      } else st.floats.push({ text: 'OPS!', x: px, y: py - 6, life: 1, color: '#ff6b6b' });
    }
  }

  function potEffect(x, y) {
    const fx = POTFX.find(f => f.id === PROG.get().equip.fx) || POTFX[0];
    const n = fx.id === 'confetti' || fx.id === 'coins' ? 22 : 16;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = U.rand(20, 70);
      const p = { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: U.rand(0.5, 1.1), color: U.pick(fx.colors), kind: 'sq', g: 0, size: 1 };
      if (fx.id === 'confetti') { p.g = 80; p.vy -= 40; p.size = 2; }
      if (fx.id === 'stars') { p.kind = 'star'; p.vx *= 0.6; p.vy *= 0.6; }
      if (fx.id === 'hearts') { p.kind = 'heart'; p.vy = -U.rand(15, 45); p.vx *= 0.4; }
      if (fx.id === 'fire') { p.kind = 'sq'; p.size = 2; p.vy = -U.rand(20, 60); p.vx *= 0.3; p.g = -20; }
      if (fx.id === 'coins') { p.kind = 'coin'; p.g = 120; p.vy = -U.rand(40, 90); p.vx *= 0.5; }
      if (fx.id === 'lightning') { p.kind = i % 4 ? 'sq' : 'bolt'; p.vx *= 1.4; p.vy *= 1.4; p.life *= 0.6; }
      st.particles.push(p);
    }
  }
  function burst(x, y, colors, n = 40) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = U.rand(30, 110);
      st.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: U.rand(0.8, 1.6), color: U.pick(colors), kind: 'sq', g: 90, size: 2 });
    }
  }

  function endShot() {
    const m = st.match, rec = st.shot.rec, p = st.shot.shooter;
    st.phase = 'idle';
    if (st.mode === 'free') return endShotFree(rec);
    if (st.mode === 'challenge') return endShotChallenge(rec);

    const res = RULES.evaluate(m, rec, st.balls, st.shot.wasOn8);
    const S = st.stats[p];
    const objPotted = rec.potted.length;
    S.potted += objPotted;
    if (res.foul) S.fouls++;
    if (res.cont) { S.run++; S.bestRun = Math.max(S.bestRun, S.run); } else S.run = 0;
    if (p === 0 && !st.twoPlayer) PROG.onShot({ potted: rec.potted.filter(id => id !== 8).length, foul: !!res.foul });

    if (res.respot8) {
      const e = st.balls.find(b => b.id === 8);
      const s = PHYS.freeSpotNear(st.balls, PHYS.FOOT.x, PHYS.FOOT.y, 8);
      Object.assign(e, { on: true, x: s.x, y: s.y, vx: 0, vy: 0 });
      comment('respot8');
    }
    const cue = cueBall();
    if (!cue.on) { const s = PHYS.freeSpotNear(st.balls, 0.5, 1.5, 0); Object.assign(cue, { on: true, x: s.x, y: s.y }); }

    // comentários e reações
    const human = isHuman(p) && !st.twoPlayer, other = 1 - p;
    if (m.isBreak) comment('break', 0.8);
    if (res.win == null) {
      if (res.foul) {
        SFX.foul();
        commentText('⚠ ' + RULES.foulText(res.foul) + (st.twoPlayer ? '' : ''));
        if (res.foul === 'scratch') comment('scratch', 0.5);
        react(p, 'sad', 1.3); react(other, 'happy', 1.3);
        if (human) sayLine('playerFoul', 0.8); else if (!st.twoPlayer) sayLine('miss', 0.6);
      } else if (objPotted) {
        if (objPotted >= 3) { comment('combo3'); SFX.combo(3); st.shake = 3; }
        else if (objPotted === 2) { comment('combo'); SFX.combo(2); st.shake = 2; }
        else {
          let longShot = false;
          for (const id of rec.potted) { const s0 = st.startPos[id], b = st.balls.find(x => x.id === id); if (s0 && b && Math.hypot(b.x - s0[0], b.y - s0[1]) > 1.1) longShot = true; }
          if (longShot) comment('long'); else if (S.run >= 3) comment('run'); else comment('pot', 0.35);
        }
        if (res.cont) {
          react(p, 'happy', 1.1);
          if (human) { sayLine('playerPot', 0.45); react(1, 'think', 1.4); }
          else if (!st.twoPlayer) sayLine('pot', 0.65);
        } else {
          react(p, 'sad', 1);
          if (!human && !st.twoPlayer) sayLine('miss', 0.5);
        }
      } else if (!m.isBreak) {
        comment('miss', 0.3);
        react(p, 'sad', 0.9);
        if (!human && !st.twoPlayer) sayLine('miss', 0.5);
      }
      if (res.assigned) later(0.9, () => commentText(`🎨 ${playerName(p)}: ${RULES.groupName(res.assigned)} · ${playerName(other)}: ${RULES.groupName(res.assigned === 'solid' ? 'stripe' : 'solid')}`));
    }

    RULES.apply(m, res);
    if (res.win != null) { later(0.6, () => finishMatch(res.win, res)); return; }
    // anuncia quando alguém fica na bola 8
    for (const q of [0, 1]) if (!st.announced8[q] && RULES.onEight(m, st.balls, q)) { st.announced8[q] = true; later(1.2, () => comment('on8')); }
    if (m.cur !== p) {
      later(0.7, () => {
        const who = m.cur;
        $('turnTag').classList.remove('pop'); void $('turnTag').offsetWidth; $('turnTag').classList.add('pop');
        if (st.twoPlayer) commentText(`👉 Vez do ${playerName(who)}${m.ballInHand ? ' · bola na mão' : ''}`);
        beginTurn();
      });
    } else later(0.35, beginTurn);
  }

  function playerName(p) {
    if (p === 0) return st.twoPlayer ? 'Jogador 1' : (PROG.get().avatar.name || 'Tu');
    return st.twoPlayer ? 'Jogador 2' : (st.opp ? st.opp.short : 'CPU');
  }

  function finishMatch(winner, res) {
    st.phase = 'over';
    const humanWin = winner === 0;
    react(winner, 'happy', 6); react(1 - winner, 'sad', 6);
    if (!st.twoPlayer && st.opp) sayLine(humanWin ? 'lose' : 'win');
    if (humanWin || st.twoPlayer) { SFX.win(); const [x, y] = toPx(0.5, 1); burst(x, y, ['#ffd23f', '#ff3b3b', '#3bb0ff', '#3bff7a', '#ffffff'], 70); }
    else SFX.lose();
    commentText(st.twoPlayer ? `🏆 ${playerName(winner)} ganhou!` : humanWin ? '🏆 VITÓRIA! Que partida!' : '💔 Derrota… fica para a próxima!');
    const summary = {
      win: humanWin, winner, stats: st.stats, scene: st.scene, opp: st.opp, mode: st.mode, twoPlayer: st.twoPlayer,
      fouls: st.stats[0].fouls, shots: st.stats[0].shots, runout: humanWin && st.stats[1].shots === 0, bestRun: st.stats[0].bestRun,
      time: t - st.t0, potted: st.stats[0].potted, eightFoul: res && res.foul,
    };
    later(1.8, () => { st.phase = 'done'; if (st.cfg.onEnd) st.cfg.onEnd(summary); });
  }

  function endShotFree(rec) {
    const cue = cueBall();
    if (rec.potted.length) { SFX.combo(Math.min(rec.potted.length, 3)); if (rec.potted.length >= 2) comment('combo'); }
    st.match.isBreak = false;
    if (rec.cuePotted) { st.match.ballInHand = true; comment('scratch'); const s = PHYS.freeSpotNear(st.balls, 0.5, 1.5, 0); Object.assign(cue, { on: true, x: s.x, y: s.y }); }
    else st.match.ballInHand = false;
    if (!st.balls.some(b => b.on && b.id !== 0)) { commentText('✨ Mesa limpa! Toca em «Rearrumar» para mais.'); SFX.unlock(); const [x, y] = toPx(0.5, 1); burst(x, y, ['#ffd23f', '#ffffff', '#3bff7a']); }
    later(0.2, beginTurn);
  }

  function endShotChallenge(rec) {
    const ch = st.challenge, d = ch.def, cue = cueBall();
    ch.shots++;
    let fail = null, ok = false;
    const left = st.balls.filter(b => b.on && b.id !== 0);
    if (d.type === 'order') {
      for (const id of rec.potted) { if (id !== ch.next) { fail = `Encaçapaste a ${id} antes da ${ch.next}!`; break; } ch.next++; }
    }
    if (!fail && rec.cuePotted && d.type !== 'timed') fail = 'A bola branca caiu na caçapa!';
    if (!fail && d.type === 'only') { if (rec.potted.some(id => id !== d.target)) fail = 'Caiu uma bola que não era a 8!'; else if (rec.potted.includes(d.target)) ok = true; }
    if (!fail && d.type === 'bank' && rec.potted.includes(d.target)) { if (rec.bankPotted.includes(d.target)) ok = true; else fail = 'A bola tinha de tocar numa tabela antes de cair!'; }
    if (!fail && d.type === 'multi') { if (rec.potted.length >= d.k) ok = true; else if (left.length < d.k) fail = 'Já não há bolas suficientes.'; }
    if (!fail && (d.type === 'clear' || d.type === 'timed' || d.type === 'order') && !left.length) ok = true;
    if (rec.potted.length) { SFX.combo(Math.min(3, rec.potted.length)); }
    if (rec.cuePotted && d.type === 'timed') { const s = PHYS.freeSpotNear(st.balls, 0.5, 1.5, 0); Object.assign(cue, { on: true, x: s.x, y: s.y }); st.match.ballInHand = true; }
    else st.match.ballInHand = false;
    if (!ok && !fail && ch.shots >= d.shots) fail = 'Acabaram as tacadas.';
    UI.updateHud(st);
    if (ok) return challengeEnd(true);
    if (fail) return challengeEnd(false, fail);
    later(0.2, beginTurn);
  }
  function challengeEnd(ok, why) {
    const ch = st.challenge, d = ch.def;
    if (ch.done) return;
    ch.done = true; st.phase = 'over';
    let stars = 0;
    if (ok) {
      if (d.type === 'timed') { const left = d.time - (t - ch.start); stars = left >= d.time * 0.5 ? 3 : left >= d.time * 0.25 ? 2 : 1; }
      else stars = ch.shots <= d.par ? 3 : ch.shots <= d.par + Math.ceil((d.shots - d.par) / 2) ? 2 : 1;
      SFX.win(); const [x, y] = toPx(0.5, 1); burst(x, y, ['#ffd23f', '#ffffff', '#3bb0ff'], 60);
      commentText('🎯 Desafio superado!');
    } else { SFX.lose(); commentText('✖ ' + why); }
    later(1.4, () => { st.phase = 'done'; st.cfg.onEnd && st.cfg.onEnd({ ok, why, stars, shots: ch.shots, time: t - ch.start, def: d }); });
  }

  /* ---------- modo livre: ações ---------- */
  function freeRerack() { if (st.mode !== 'free' || st.phase === 'moving') return; st.balls = PHYS.rack(); st.match.isBreak = true; st.match.ballInHand = true; beginTurn(); SFX.ui(); }
  function freeBallInHand() { if (st.phase !== 'aim') return; st.match.ballInHand = true; st.match.isBreak = false; showHint('Arrasta a bola branca para onde quiseres'); SFX.ui(); }

  function quit() { st.screen = 'menu'; st.phase = 'idle'; st.timers = []; st.ai = null; st.opp = null; $('bubble').hidden = true; $('comment').hidden = true; $('hint').hidden = true; }

  /* ---------- toques ---------- */
  function logical(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; }
  function canAim() { return st.screen === 'play' && st.phase === 'aim' && !paused; }
  function onDown(e) {
    SFX.init();
    if (!canAim()) return;
    const [lx, ly] = logical(e), b = L.bar, sc = L.spinC;
    let kind = null;
    if (lx >= b.x - 8 && lx <= b.x + b.w + 8 && ly >= b.y - 10 && ly <= b.y + b.h + 10) kind = 'power';
    else if (Math.hypot(lx - sc.x, ly - sc.y) < sc.r + 8) kind = 'spin';
    else if (ly > L.ty - L.rail - 12 && ly < L.ty + L.th + L.rail + 12) {
      const [x, y] = toTable(lx, ly), cue = cueBall();
      if (st.match.ballInHand && Math.hypot(x - cue.x, y - cue.y) < 0.1) kind = 'cue';
      else kind = 'aim';
    }
    if (!kind) return;
    st.drag = { kind, id: e.pointerId };
    try { cv.setPointerCapture(e.pointerId); } catch (er) { /* sem captura */ }
    onMove(e);
    e.preventDefault();
  }
  function onMove(e) {
    const d = st.drag; if (!d || d.id !== e.pointerId || !canAim()) return;
    const [lx, ly] = logical(e);
    if (d.kind === 'power') st.power = U.clamp((lx - L.bar.x) / L.bar.w, 0, 1);
    else if (d.kind === 'spin') {
      let sx = (lx - L.spinC.x) / L.spinC.r, sy = -(ly - L.spinC.y) / L.spinC.r;
      const m = Math.hypot(sx, sy); if (m > 1) { sx /= m; sy /= m; }
      st.spin = { x: Math.abs(sx) < 0.15 ? 0 : sx, y: Math.abs(sy) < 0.15 ? 0 : sy };
    } else if (d.kind === 'cue') {
      const [x, y] = toTable(lx, ly), cue = cueBall(), area = placeArea();
      const nx = U.clamp(x, PHYS.R, 1 - PHYS.R), ny = U.clamp(y, area ? area.minY : PHYS.R, PHYS.L - PHYS.R);
      if (PHYS.isFree(st.balls, nx, ny, 0, area)) { cue.x = nx; cue.y = ny; }
    } else if (d.kind === 'aim') {
      const [x, y] = toTable(lx, ly), cue = cueBall();
      if (Math.hypot(x - cue.x, y - cue.y) > PHYS.R * 0.8) st.aim = Math.atan2(y - cue.y, x - cue.x);
    }
    e.preventDefault();
  }
  function onUp(e) {
    const d = st.drag; if (!d || d.id !== e.pointerId) return;
    st.drag = null;
    if (d.kind === 'power' && canAim()) {
      if (st.power > 0.03) shoot(st.aim, st.power, st.spin);
      else st.power = 0;
    }
  }
  function nudgeAim(dir, fine) { if (canAim()) st.aim += dir * (fine ? 0.0015 : 0.006); }
  function onKey(e) {
    if (!canAim()) return;
    if (e.key === 'ArrowLeft') { nudgeAim(-1, e.shiftKey); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { nudgeAim(1, e.shiftKey); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { st.power = U.clamp(st.power + 0.05, 0, 1); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { st.power = U.clamp(st.power - 0.05, 0, 1); e.preventDefault(); }
    else if ((e.key === ' ' || e.key === 'Enter') && st.power > 0.03) { shoot(st.aim, st.power, st.spin); e.preventDefault(); }
  }

  /* ---------- ciclo ---------- */
  function frame(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    if (!paused) { t += dt; update(dt); }
    render();
    requestAnimationFrame(frame);
  }
  function update(dt) {
    // temporizadores
    if (st.timers.length) {
      const due = st.timers.filter(x => x.at <= t);
      st.timers = st.timers.filter(x => x.at > t);
      due.forEach(x => x.fn());
    }
    if (st.screen === 'play') {
      if (st.phase === 'moving') {
        acc += dt;
        let moving = true, n = 0;
        while (acc >= PHYS.DT && n < 40) { moving = PHYS.step(st.balls, PHYS.DT, st.sh); acc -= PHYS.DT; n++; if (!moving) break; }
        if (!moving) { acc = 0; endShot(); }
      }
      updateAI();
      if (st.challenge && !st.challenge.done && st.challenge.def.type === 'timed' && t - st.challenge.start > st.challenge.def.time && st.phase !== 'moving') challengeEnd(false, 'Acabou o tempo!');
      if (st.challenge && !st.challenge.done) UI.updateTimer(st, t);
    }
    if (t > st.bubbleUntil) $('bubble').hidden = true;
    if (t > st.commentUntil) $('comment').hidden = true;
    if (st.hintUntil && t > st.hintUntil) { $('hint').hidden = true; st.hintUntil = 0; }
    if (t < st.talkUntil && Math.random() < 0.18) SFX.talk();
    for (const p of st.particles) { p.life -= dt; p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; }
    st.particles = st.particles.filter(p => p.life > 0);
    for (const f of st.floats) { f.life -= dt; f.y -= 14 * dt; }
    st.floats = st.floats.filter(f => f.life > 0);
    for (const f of st.falling) f.life -= dt;
    st.falling = st.falling.filter(f => f.life > 0);
    st.shake = Math.max(0, st.shake - dt * 8);
    if (st.screen === 'menu') {
      if (!st.menuChar || t > st.menuCharT) {
        const pool = PROG.unlockedChars();
        st.menuChar = U.pick(pool.length ? pool : CHARACTERS); st.menuCharT = t + 4;
        react(1, Math.random() < 0.5 ? 'happy' : 'talk', 1.2);
      }
    }
  }

  function poseOf(p) {
    const a = st.anim[p];
    if (a && t < a.until) return a.pose;
    if (p === 1 && t < st.talkUntil) return 'talk';
    if (st.screen === 'play' && st.phase === 'ai' && p === 1 && st.ai && st.ai.stage === 'plan') return 'think';
    return 'idle';
  }

  function render() {
    if (!L) return;
    const P = PROG.get();
    const scene = st.screen === 'play' ? st.scene : P.equip.scene;
    ctx.save();
    if (st.shake > 0) ctx.translate(Math.round(U.rand(-st.shake, st.shake)), Math.round(U.rand(-st.shake, st.shake)));
    ctx.drawImage(SCENE.background(scene, L), 0, 0);
    SCENE.fx(ctx, scene, L, t);
    const tdef = TABLES.find(x => x.id === P.equip.table) || TABLES[0];
    ctx.drawImage(SCENE.table(tdef, L), L.tx - L.rail, L.ty - L.rail);
    const set = BALLSETS.find(x => x.id === P.equip.balls) || BALLSETS[0];
    const balls = st.screen === 'play' ? st.balls : menuBalls();

    if (st.screen === 'play' && st.phase === 'aim' && P.settings.guide && st.mode !== 'free') highlightTargets(balls);
    // sombras e bolas
    const D = L.D;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (const b of balls) if (b.on) { const [x, y] = toPx(b.x, b.y); SCENE.circle(ctx, Math.round(x) + 1, Math.round(y) + 1, D / 2 - 0.5, 'rgba(0,0,0,0.3)'); }
    for (const f of st.falling) {
      const d = Math.max(2, Math.round(D * (f.life / 0.22)));
      const spr = SPR.ballSprite(set, f.id, d);
      ctx.drawImage(spr, Math.round(f.x - spr.width / 2), Math.round(f.y - spr.height / 2));
    }
    for (const b of balls) if (b.on) {
      const spr = SPR.ballSprite(set, b.id, D);
      const [x, y] = toPx(b.x, b.y);
      ctx.drawImage(spr, Math.round(x - spr.width / 2), Math.round(y - spr.height / 2));
    }
    if (st.screen === 'play') {
      if (st.phase === 'aim' || st.phase === 'ai') drawAim(balls);
      if (st.phase === 'aim' && st.match.ballInHand) drawHand();
    }
    SCENE.overlay(ctx, scene, L, t);
    drawParticles();
    ctx.restore();
    drawZones(P);
  }

  let menuRack = null;
  function menuBalls() { if (!menuRack) menuRack = PHYS.rack(U.seeded(3)); return menuRack; }

  function highlightTargets(balls) {
    const m = st.match, p = m.cur;
    if (st.mode === 'challenge') return;
    if (Math.floor(t * 2) % 2) return;
    for (const b of balls) {
      if (!b.on || b.id === 0) continue;
      if (!RULES.legalFirst(m, balls, p, b.id) || (m.isBreak)) continue;
      const [x, y] = toPx(b.x, b.y);
      SCENE.circle(ctx, Math.round(x), Math.round(y), L.D / 2 + 1.5, 'rgba(255,255,255,0.35)');
    }
  }

  function drawAim(balls) {
    const cue = balls.find(b => b.id === 0); if (!cue || !cue.on) return;
    const [cx, cy] = toPx(cue.x, cue.y);
    const dx = Math.cos(st.aim), dy = Math.sin(st.aim);
    const human = st.phase === 'aim';
    const P = PROG.get();
    if (human) {
      const rc = PHYS.raycast(balls, cue.x, cue.y, dx, dy);
      const full = P.settings.guide;
      const len = full ? rc.t : Math.min(rc.t, 0.35);
      const steps = Math.floor(len * L.k);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (let s = Math.ceil(L.D / 2) + 2; s < steps; s += 3) ctx.fillRect(Math.round(cx + dx * s), Math.round(cy + dy * s), 1, 1);
      if (full) {
        const gx = cue.x + dx * rc.t, gy = cue.y + dy * rc.t;
        const [px, py] = toPx(gx, gy);
        const r = L.D / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let a = 0; a < 16; a++) ctx.fillRect(Math.round(px + Math.cos(a / 16 * Math.PI * 2) * r), Math.round(py + Math.sin(a / 16 * Math.PI * 2) * r), 1, 1);
        if (rc.ball) {
          let nx = rc.ball.x - gx, ny = rc.ball.y - gy; const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
          const [bx, by] = toPx(rc.ball.x, rc.ball.y);
          const legal = st.mode === 'free' || st.mode === 'challenge' || st.match.isBreak || RULES.legalFirst(st.match, balls, st.match.cur, rc.ball.id);
          ctx.fillStyle = legal ? '#ffffff' : '#ff5a5a';
          for (let s = 0; s < 34; s += 2) ctx.fillRect(Math.round(bx + nx * s), Math.round(by + ny * s), 1, 1);
          const dot = dx * nx + dy * ny; let tx = dx - dot * nx, ty = dy - dot * ny; const tl = Math.hypot(tx, ty);
          if (tl > 0.05) { tx /= tl; ty /= tl; ctx.fillStyle = 'rgba(160,220,255,0.8)'; for (let s = 0; s < 18 * tl; s += 2) ctx.fillRect(Math.round(px + tx * s), Math.round(py + ty * s), 1, 1); }
          if (!legal) SPR.drawText(ctx, 'X', bx, by - L.D - 5, '#ff5a5a', 1, 'center');
        }
      }
    }
    const cue2 = CUES.find(c => c.id === P.equip.cue) || CUES[0];
    const pull = 3 + st.power * 26;
    SPR.drawCue(ctx, cue2, cx - dx * (L.D / 2 + pull), cy - dy * (L.D / 2 + pull), st.aim, 118, t);
  }

  function drawHand() {
    const cue = cueBall(); const [x, y] = toPx(cue.x, cue.y);
    const bob = Math.floor(t * 3) % 2;
    ctx.fillStyle = '#ffffff';
    for (let a = 0; a < 20; a++) if ((a + Math.floor(t * 8)) % 4 < 2) ctx.fillRect(Math.round(x + Math.cos(a / 20 * Math.PI * 2) * (L.D / 2 + 4)), Math.round(y + Math.sin(a / 20 * Math.PI * 2) * (L.D / 2 + 4)), 1, 1);
    SPR.drawText(ctx, 'ARRASTA', x, y + L.D / 2 + 6 + bob, '#ffffff', 1, 'center', '#000000');
  }

  function drawParticles() {
    for (const p of st.particles) {
      const a = U.clamp(p.life * 2, 0, 1);
      ctx.globalAlpha = a; ctx.fillStyle = p.color;
      const x = Math.round(p.x), y = Math.round(p.y);
      if (p.kind === 'star') { ctx.fillRect(x, y - 1, 1, 3); ctx.fillRect(x - 1, y, 3, 1); }
      else if (p.kind === 'heart') { ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x - 1, y + 1, 3, 1); ctx.fillRect(x, y + 2, 1, 1); }
      else if (p.kind === 'coin') { ctx.fillRect(x - 1, y - 1, 3, 3); ctx.fillStyle = '#fff6c0'; ctx.fillRect(x, y - 1, 1, 1); }
      else if (p.kind === 'bolt') { ctx.fillRect(x, y, 1, 2); ctx.fillRect(x + 1, y + 2, 1, 2); ctx.fillRect(x, y + 4, 1, 2); }
      else ctx.fillRect(x, y, p.size || 1, p.size || 1);
    }
    ctx.globalAlpha = 1;
    for (const f of st.floats) {
      ctx.globalAlpha = U.clamp(f.life * 2, 0, 1);
      SPR.drawText(ctx, f.text, f.x, f.y, f.color, 1, 'center', '#000000');
    }
    ctx.globalAlpha = 1;
  }

  /* zonas dos jogadores (cima: adversário; baixo: tu) */
  function drawZones(P) {
    const H = L.H, by = L.botY0;
    const play = st.screen === 'play';
    // painel inferior
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, by, W, H - by);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, by, W, 1);
    const cur = play && st.match ? st.match.cur : -1;
    const glow = Math.floor(t * 3) % 2 ? '#ffd23f' : '#c8961a';
    const activeTurn = play && (st.phase === 'aim' || st.phase === 'ai' || st.phase === 'moving');
    if (activeTurn && cur === 0 && st.mode !== 'free' && st.mode !== 'challenge') { ctx.fillStyle = glow; ctx.fillRect(0, by, W, 1); ctx.fillRect(0, H - 1, W, 1); }

    // adversário
    const oppLook = play ? (st.twoPlayer ? avatarLook(P2_AVATAR) : st.opp ? st.opp.look : null) : (st.menuChar ? st.menuChar.look : null);
    if (oppLook) {
      if (activeTurn && cur === 1) { ctx.fillStyle = 'rgba(255,210,63,0.18)'; ctx.fillRect(2, 18, 52, 72); ctx.fillStyle = glow; ctx.fillRect(2, 89, 52, 1); }
      SPR.drawChar(ctx, oppLook, 6, 20, 2, { pose: poseOf(1), t: t + 0.7, blink: (t % 3.3) < 0.13, talking: t < st.talkUntil });
    }
    // jogador
    const meLook = avatarLook(P.avatar);
    ctx.save(); ctx.beginPath(); ctx.rect(0, by + 1, 56, H - by); ctx.clip();
    SPR.drawChar(ctx, meLook, 4, by + 4, 2, { pose: poseOf(0), t, blink: (t % 3.7) < 0.12 });
    ctx.restore();

    if (!play) return;
    // indicadores de bolas
    if (st.mode !== 'free' && st.mode !== 'challenge') {
      drawGroup(0, 58, by + 24);
      if (oppLook) drawGroup(1, 58, 79);
    }
    // barra de força
    const b = L.bar, myTurn = st.phase === 'aim';
    ctx.fillStyle = '#111111'; ctx.fillRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2);
    ctx.fillStyle = '#2a2a33'; ctx.fillRect(b.x, b.y, b.w, b.h);
    const fw = Math.round(b.w * st.power);
    for (let x = 0; x < fw; x++) {
      const f = x / b.w;
      ctx.fillStyle = f < 0.5 ? '#3bff7a' : f < 0.8 ? '#ffd23f' : '#ff3b3b';
      ctx.fillRect(b.x + x, b.y + 1, 1, b.h - 2);
    }
    for (let i = 1; i < 10; i++) { ctx.fillStyle = '#00000088'; ctx.fillRect(b.x + Math.round(b.w * i / 10), b.y, 1, b.h); }
    SPR.drawText(ctx, st.drag && st.drag.kind === 'power' ? 'SOLTA PARA TACAR' : myTurn ? 'FORÇA >>>' : '', b.x + b.w / 2, b.y + 5, '#ffffff', 1, 'center', '#000000');
    if (myTurn && !st.drag && Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(b.x + 2, b.y + 3, 2, b.h - 6); }
    // efeito
    const sc = L.spinC;
    SCENE.circle(ctx, sc.x, sc.y, sc.r + 1, '#111111');
    SCENE.circle(ctx, sc.x, sc.y, sc.r, '#f4f0e4');
    SCENE.circle(ctx, sc.x - 4, sc.y - 5, 3, '#ffffff');
    ctx.fillStyle = '#c8c0b0'; ctx.fillRect(sc.x - sc.r + 2, sc.y, sc.r * 2 - 3, 1); ctx.fillRect(sc.x, sc.y - sc.r + 2, 1, sc.r * 2 - 3);
    SCENE.circle(ctx, Math.round(sc.x + st.spin.x * (sc.r - 4)), Math.round(sc.y - st.spin.y * (sc.r - 4)), 2.5, '#e02020');
    SPR.drawText(ctx, 'EFEITO', sc.x, sc.y + sc.r + 4, '#ffffff', 1, 'center', '#000000');
  }

  function drawGroup(p, x, y) {
    const m = st.match, g = m.groups[p];
    const set = BALLSETS.find(s => s.id === PROG.get().equip.balls) || BALLSETS[0];
    let ids;
    if (!g) ids = null;
    else if (RULES.remaining(st.balls, g) === 0) ids = [8];
    else ids = st.balls.filter(b => b.on && PHYS.groupOf(b.id) === g).map(b => b.id).sort((a, b) => a - b);
    const w = ids ? ids.length * 10 + 2 : 48;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - 2, y - 2, w + 2, 13);
    if (!ids) { SPR.drawText(ctx, 'MESA ABERTA', x, y + 2, '#c8c8d0', 1, 'left', '#000000'); return; }
    ids.forEach((id, i) => {
      const spr = SPR.ballSprite(set, id, 9);
      if (id === 8 && Math.floor(t * 3) % 2) SCENE.circle(ctx, x + i * 10 + 4.5, y + 4.5, 6, '#ffd23f');
      ctx.drawImage(spr, x + i * 10, y);
    });
  }

  function init() {
    cv = $('game'); ctx = cv.getContext('2d'); stage = $('stage');
    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', () => setTimeout(layout, 200));
    cv.addEventListener('pointerdown', onDown, { passive: false });
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', () => { if (document.hidden && st.screen === 'play') UI.pause(); });
    requestAnimationFrame(ts => { lastTs = ts; requestAnimationFrame(frame); });
  }
  function setPaused(v) { paused = v; }
  function now() { return t; }

  return { init, start, quit, setPaused, nudgeAim, freeRerack, freeBallInHand, avatarLook, P2_AVATAR, st, playerName, now, layout: () => L };
})();
