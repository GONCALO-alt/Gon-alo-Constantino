'use strict';
/* Ecrãs e menus em HTML (por cima do jogo) + elementos do HUD durante as partidas. */
const UI = (() => {
  const $ = id => document.getElementById(id);
  const h = U.el;
  let root, anims = [], rafOn = false;

  /* ---------- utilitários de ecrã ---------- */
  function animLoop() {
    rafOn = true;
    const tt = performance.now() / 1000;
    anims = anims.filter(a => a.cv.isConnected);
    for (const a of anims) a.draw(a.ctx, tt);
    if (anims.length) requestAnimationFrame(animLoop); else rafOn = false;
  }
  function animCanvas(w, h2, cssScale, draw) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h2;
    cv.style.width = (w * cssScale) + 'px'; cv.style.height = (h2 * cssScale) + 'px'; cv.className = 'px';
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    anims.push({ cv, ctx, draw });
    if (!rafOn) requestAnimationFrame(animLoop);
    return cv;
  }
  function staticCanvas(w, h2, cssScale, draw) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h2;
    cv.style.width = (w * cssScale) + 'px'; cv.style.height = (h2 * cssScale) + 'px'; cv.className = 'px';
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; draw(ctx); return cv;
  }
  function portraitEl(c, px = 2, crop = 26, cssScale = 1) {
    const locked = !PROG.charUnlocked(c);
    const src = SPR.portrait(c.look, px, { crop, silhouette: locked ? '#0b0b14' : null });
    return staticCanvas(src.width, src.height, cssScale, x => x.drawImage(src, 0, 0));
  }
  function coinsChip() { return h('span', { class: 'chip coins' }, h('i', { class: 'ic ic-coin' }), h('b', { class: 'coinVal', text: U.fmt(PROG.get().coins) })); }
  function refreshCoins() { document.querySelectorAll('.coinVal').forEach(e => { e.textContent = U.fmt(PROG.get().coins); }); }
  function stars(n, max = 5) { return h('span', { class: 'stars', 'aria-label': `${n} de ${max}` }, ...Array.from({ length: max }, (_, i) => h('i', { class: 'ic ic-star' + (i < n ? '' : ' off') }))); }
  function diffStars(d) { return stars(Math.ceil(d / 2)); }
  function tierBadge(c) { const tr = TIERS[c.tier]; return h('span', { class: 'tier tier-' + c.tier, style: { '--tc': tr.color } }, tr.name); }
  function btn(label, onclick, cls = '') {
    return h('button', { class: 'btn ' + cls, onclick: e => { SFX.init(); SFX.ui(); onclick(e); } }, label);
  }

  function show(el) {
    hideHud(); GAME.quit();
    root.innerHTML = ''; root.appendChild(el); root.hidden = false; root.scrollTop = 0;
    const sc = el.querySelector('.scroll'); if (sc) sc.scrollTop = 0;
  }
  function hide() { root.hidden = true; root.innerHTML = ''; }
  function screen(title, body, opts = {}) {
    const back = opts.back === false ? null : h('button', { class: 'iconbtn', 'aria-label': 'Voltar', onclick: () => { SFX.init(); SFX.back(); (opts.back || home)(); } }, '◀');
    return h('section', { class: 'screen ' + (opts.cls || '') },
      h('header', { class: 'bar' }, back || h('span', { class: 'iconbtn ghost' }), h('h2', { text: title }), coinsChip()),
      h('div', { class: 'scroll' }, body),
    );
  }
  function modal(content, cls = '') {
    const m = h('div', { class: 'modal ' + cls }, h('div', { class: 'sheet' }, content));
    document.body.appendChild(m);
    return { el: m, close: () => m.remove() };
  }
  function confirmBox(text, yesLabel, onYes, onNo) {
    const m = modal([h('p', { class: 'big', text }), h('div', { class: 'row' }, btn('Cancelar', () => { m.close(); if (onNo) onNo(); }), btn(yesLabel, () => { m.close(); onYes(); }, 'danger'))]);
  }
  function toast(html, cls = '') {
    const box = $('toasts');
    const e = h('div', { class: 'toast ' + cls, html });
    box.appendChild(e);
    setTimeout(() => e.classList.add('out'), 2800);
    setTimeout(() => e.remove(), 3400);
  }

  /* ---------- menu principal ---------- */
  function home() {
    GAME.quit();
    SFX.startMusic('menu');
    const P = PROG.get();
    const pool = PROG.unlockedChars();
    const trio = U.shuffle(pool, Math.random).slice(0, 3);
    while (trio.length < 3) trio.push(U.pick(CHARACTERS));
    const hero = animCanvas(168, 68, 2, (ctx, tt) => {
      ctx.clearRect(0, 0, 168, 68);
      trio.forEach((c, i) => {
        const ph = (tt * 0.5 + i * 0.33) % 1;
        const pose = ph < 0.12 ? 'happy' : ph < 0.3 ? 'talk' : 'idle';
        SPR.drawChar(ctx, c.look, i * 58 + 2, 0, 2, { pose, t: tt + i, blink: ((tt + i) % 3) < 0.12, talking: pose === 'talk' });
      });
    });
    const xpNeed = PROG.xpForLevel(P.level);
    const pend = PROG.dailyPending();
    const tile = (icon, label, fn, badge) => h('button', { class: 'tile', onclick: () => { SFX.init(); SFX.ui(); fn(); } }, h('span', { class: 'tico', text: icon }), h('span', { text: label }), badge ? h('em', { class: 'badge', text: badge }) : null);
    const el = h('section', { class: 'screen home' },
      h('header', { class: 'bar' },
        h('span', { class: 'chip lvl' }, 'NÍVEL ', h('b', { text: P.level }), h('span', { class: 'xp' }, h('i', { style: { width: Math.round(P.xp / xpNeed * 100) + '%' } }))),
        h('span', { style: { flex: 1 } }), coinsChip()),
      h('div', { class: 'scroll' },
        h('div', { class: 'logo' }, h('h1', {}, 'SINUCA', h('span', { text: 'DAS ESTRELAS' })), hero),
        btn(h('span', {}, '▶ JOGAR', h('small', { text: 'Partida rápida contra um famoso' })), opponents, 'go big'),
        h('div', { class: 'grid2' },
          btn(h('span', {}, '🏆 Torneio', h('small', { text: 'Quartos, meias e final' })), tournaments, 'gold'),
          btn(h('span', {}, '🔥 Sobrevivência', h('small', { text: `Recorde: ${P.stats.bestSurvival} rondas` })), MODES.survivalIntro, 'red'),
          btn(h('span', {}, '🎯 Desafios', h('small', { text: `${Object.keys(P.challenges).length}/${CHALLENGES.length} completos` })), challenges, 'blue'),
          btn(h('span', {}, '🎱 Treino Livre', h('small', { text: 'Sem regras nem pressão' })), () => sceneChooser('Treino Livre', s => MODES.free(s)), 'green'),
        ),
        btn(h('span', {}, '👥 2 Jogadores', h('small', { text: 'No mesmo telemóvel' })), () => sceneChooser('2 Jogadores', s => MODES.twoPlayer(s)), 'wide'),
        h('div', { class: 'tiles' },
          tile('🛒', 'Personalizar', () => shop('cues')),
          tile('⭐', 'Famosos', opponents),
          tile('📅', 'Diários', daily, pend ? String(pend) : null),
          tile('🏅', 'Conquistas', achievements),
          tile('📊', 'Ranking', leaderboard),
          tile('⚙️', 'Definições', settings),
        ),
        h('p', { class: 'disclaimer', text: 'Paródia humorística: todas as personagens são caricaturas fictícias. Não há qualquer ligação, patrocínio ou apoio das pessoas representadas.' }),
      ),
    );
    show(el);
    const fresh = PROG.newlyUnlocked();
    if (fresh.length && P.stats.matches > 0) announceUnlocks(fresh);
  }

  function announceUnlocks(list) {
    SFX.unlock();
    const m = modal([
      h('h3', { class: 'gold', text: list.length > 1 ? 'Novos adversários!' : 'Novo adversário!' }),
      h('div', { class: 'unlockRow' }, ...list.map(c => h('div', { class: 'ucard' }, portraitEl(c, 2, 26, 1.5), h('b', { text: c.name }), tierBadge(c)))),
      btn('Fixe!', () => m.close(), 'go'),
    ], 'pop');
  }

  /* ---------- escolha de adversário ---------- */
  function opponents() {
    const grid = h('div', { class: 'cards' });
    const sorted = CHARACTERS.slice().sort((a, b) => (PROG.charUnlocked(b) - PROG.charUnlocked(a)) || a.diff - b.diff);
    for (const c of sorted) {
      const ok = PROG.charUnlocked(c), S = PROG.get().stats;
      grid.appendChild(h('button', { class: 'card char' + (ok ? '' : ' locked') + ' t-' + c.tier, onclick: () => { SFX.init(); SFX.ui(); charDetail(c); } },
        portraitEl(c, 2, 26, 1),
        h('b', { text: ok ? c.short : '???' }),
        diffStars(c.diff),
        ok ? ((S.beaten[c.id] || S.lostTo[c.id]) ? h('small', { text: `${S.beaten[c.id] || 0}V · ${S.lostTo[c.id] || 0}D` }) : tierBadge(c)) : h('small', { class: 'lockline' }, h('i', { class: 'ic ic-lock' }), ' Bloqueado'),
      ));
    }
    const n = PROG.unlockedChars().length;
    show(screen(`Famosos ${n}/${CHARACTERS.length}`, [h('p', { class: 'note', text: 'Ganha partidas para desbloquear mais adversários. Os especiais e os lendários têm condições próprias.' }), grid]));
  }

  function charDetail(c) {
    const ok = PROG.charUnlocked(c), P = PROG.get();
    const phrase = U.pick(c.lines.hello);
    const big = ok ? animCanvas(48, 66, 2.5, (ctx, tt) => {
      ctx.clearRect(0, 0, 48, 66);
      const ph = tt % 5;
      SPR.drawChar(ctx, c.look, 0, 0, 2, { pose: ph < 0.8 ? 'happy' : ph < 2.2 ? 'talk' : 'idle', t: tt, blink: (tt % 3) < 0.12, talking: ph >= 0.8 && ph < 2.2 });
    }) : portraitEl(c, 2, 33, 2.5);
    let scene = P.equip.scene;
    if (PROG.owns('scenes', c.scene)) scene = c.scene;
    const chips = h('div', { class: 'chips' });
    const renderChips = () => {
      chips.innerHTML = '';
      for (const s of SCENES) {
        const own = PROG.owns('scenes', s.id);
        chips.appendChild(h('button', { class: 'chipbtn' + (s.id === scene ? ' sel' : '') + (own ? '' : ' locked'), disabled: !own, onclick: () => { scene = s.id; SFX.ui(); renderChips(); } }, own ? s.name : '🔒 ' + s.name));
      }
    };
    renderChips();
    const S = P.stats;
    const body = h('div', { class: 'detail' },
      h('div', { class: 'dhead' }, big,
        h('div', {},
          h('h3', { text: ok ? c.name : '???' }), tierBadge(c),
          h('div', { class: 'diffbar' }, h('span', { text: 'Dificuldade' }), h('div', { class: 'meter' }, h('i', { style: { width: c.diff * 10 + '%' } })), h('b', { text: c.diff + '/10' })),
          ok ? h('p', { class: 'quote', text: '«' + phrase + '»' }) : null,
        )),
      h('p', { text: ok ? c.bio : 'Adversário misterioso. Desbloqueia-o para descobrires quem é!' }),
      ok ? h('p', { class: 'small', text: `Contra ti: ${S.beaten[c.id] || 0} vitórias · ${S.lostTo[c.id] || 0} derrotas · Pontos de ranking: ${PROG.charRating(c)}` }) : null,
      ok ? h('div', {}, h('h4', { text: 'Cenário' }), chips) : h('p', { class: 'lockline big' }, h('i', { class: 'ic ic-lock' }), ' ' + PROG.unlockText(c)),
      ok ? btn('▶ JOGAR', () => MODES.quick(c, scene), 'go big')
        : btn(h('span', {}, 'Desbloquear já · ', h('i', { class: 'ic ic-coin' }), ' ' + U.fmt(PROG.charPrice(c))), () => {
          if (PROG.buyChar(c)) { SFX.buy(); PROG.newlyUnlocked(); toast(`⭐ ${c.name} desbloqueado!`); charDetail(c); }
          else { SFX.error(); toast('Moedas insuficientes', 'bad'); }
        }, 'gold'),
      h('p', { class: 'disclaimer', text: 'Caricatura humorística e fictícia. Sem ligação nem patrocínio da pessoa representada.' }),
    );
    show(screen(ok ? c.short : 'Bloqueado', body, { back: opponents }));
  }

  function sceneChooser(title, go) {
    const list = h('div', { class: 'list' });
    for (const s of SCENES) {
      const own = PROG.owns('scenes', s.id);
      list.appendChild(h('button', { class: 'item' + (own ? '' : ' locked'), disabled: !own, onclick: () => { SFX.ui(); go(s.id); } },
        scenePreview(s.id, 0.25), h('div', {}, h('b', { text: s.name }), h('small', { text: own ? s.desc : 'Compra este cenário na loja' }))));
    }
    show(screen(title + ' · Cenário', list));
  }

  /* ---------- torneios ---------- */
  function tournaments() {
    const P = PROG.get();
    const list = h('div', { class: 'list' });
    for (const cup of CUPS) {
      const ok = PROG.cupUnlocked(cup), won = P.stats.cupWins[cup.id] || 0;
      list.appendChild(h('button', { class: 'item cup' + (ok ? '' : ' locked'), onclick: () => {
        SFX.init();
        if (!ok) { SFX.error(); toast(cup.desc, 'bad'); return; }
        if (P.coins < cup.entry) { SFX.error(); toast('Moedas insuficientes para a inscrição', 'bad'); return; }
        SFX.ui(); MODES.tournamentStart(cup);
      } },
        h('span', { class: 'trophy ' + cup.id }, h('i', { class: 'ic ic-trophy' })),
        h('div', {},
          h('b', { text: cup.name + (won ? ` · ${won}×🏆` : '') }),
          h('small', { text: cup.desc }),
          h('small', {}, 'Inscrição: ', h('i', { class: 'ic ic-coin' }), ` ${cup.entry} · Prémio: `, h('i', { class: 'ic ic-coin' }), ` ${cup.prize} · Dificuldade ${cup.range[0]}–${cup.range[1]}`)),
        ok ? null : h('i', { class: 'ic ic-lock' })));
    }
    show(screen('Torneios', [h('p', { class: 'note', text: '8 jogadores, três rondas: quartos de final, meias-finais e a grande final no estádio. Uma derrota e estás fora!' }), list]));
  }

  /* ---------- desafios ---------- */
  function challenges() {
    const P = PROG.get();
    const list = h('div', { class: 'list' });
    CHALLENGES.forEach((d, i) => {
      const ok = PROG.challengeUnlocked(i), st = P.challenges[d.id] || 0;
      list.appendChild(h('button', { class: 'item' + (ok ? '' : ' locked'), onclick: () => {
        SFX.init();
        if (!ok) { SFX.error(); toast('Completa o desafio anterior primeiro', 'bad'); return; }
        SFX.ui(); MODES.challenge(d);
      } },
        h('span', { class: 'num', text: String(i + 1) }),
        h('div', {}, h('b', { text: d.name }), h('small', { text: d.desc }),
          h('small', { text: d.type === 'timed' ? `Tempo: ${d.time} s` : `Tacadas: ${d.shots} · 3 estrelas com ${d.par}` })),
        ok ? stars(st, 3) : h('i', { class: 'ic ic-lock' })));
    });
    show(screen('Desafios', list));
  }

  /* ---------- loja e personalização ---------- */
  const SHOP_TABS = [['cues', 'Tacos'], ['tables', 'Mesas'], ['balls', 'Bolas'], ['fx', 'Efeitos'], ['scenes', 'Cenários'], ['avatar', 'Personagem']];
  function shop(tab = 'cues') {
    const tabs = h('div', { class: 'tabs' }, ...SHOP_TABS.map(([id, name]) => h('button', { class: 'tab' + (id === tab ? ' sel' : ''), onclick: () => { SFX.ui(); shop(id); } }, name)));
    const body = tab === 'avatar' ? avatarEditor() : shopList(tab);
    show(screen('Personalizar', [tabs, body]));
  }
  function itemPreview(cat, item) {
    if (cat === 'cues') return animCanvas(90, 10, 1.4, (ctx, tt) => { ctx.clearRect(0, 0, 90, 10); SPR.drawCue(ctx, item, 86, 5, 0, 84, tt); });
    if (cat === 'tables') return staticCanvas(40, 24, 1.6, ctx => {
      SCENE.rect(ctx, 0, 0, 40, 24, item.rail); SCENE.rect(ctx, 0, 0, 40, 1, U.shade(item.rail, 0.2)); SCENE.rect(ctx, 4, 4, 32, 16, item.felt);
      for (const [x, y] of [[4, 4], [20, 4], [35, 4], [4, 19], [20, 19], [35, 19]]) SCENE.circle(ctx, x, y, 2, '#050505');
    });
    if (cat === 'balls') return staticCanvas(52, 13, 2, ctx => { [1, 10, 8, 0, 4].forEach((id, i) => ctx.drawImage(SPR.ballSprite(item, id, 9), i * 10 + 1, 1)); });
    if (cat === 'fx') return animCanvas(40, 24, 1.6, (ctx, tt) => {
      ctx.clearRect(0, 0, 40, 24);
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2, r = ((tt * 0.9 + i * 0.07) % 1) * 14;
        ctx.globalAlpha = 1 - r / 14; ctx.fillStyle = item.colors[i % item.colors.length];
        const x = Math.round(20 + Math.cos(a) * r), y = Math.round(12 + Math.sin(a) * r * 0.7);
        if (item.id === 'stars') { ctx.fillRect(x, y - 1, 1, 3); ctx.fillRect(x - 1, y, 3, 1); }
        else if (item.id === 'hearts') { ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x - 1, y + 1, 3, 1); ctx.fillRect(x, y + 2, 1, 1); }
        else ctx.fillRect(x, y, item.id === 'confetti' || item.id === 'fire' || item.id === 'coins' ? 2 : 1, 2);
      }
      ctx.globalAlpha = 1; SCENE.circle(ctx, 20, 12, 3, '#050505');
    });
    if (cat === 'scenes') return scenePreview(item.id, 0.25);
    return h('span');
  }
  function scenePreview(id, f) {
    const LL = { W: 240, H: 420, topY1: 92, tx: 81, ty: 110, tw: 78, th: 156, k: 78, rail: 7 };
    const bg = SCENE.background(id, LL);
    return staticCanvas(Math.round(240 * f), Math.round(150 * f), 1.6, ctx => {
      ctx.drawImage(bg, 0, 0, 240, 150, 0, 0, Math.round(240 * f), Math.round(150 * f));
      SCENE.fx(ctx, id, { ...LL, W: 240 * f, H: 150 * f, topY1: 92 * f }, 0.1);
    });
  }
  function shopList(cat) {
    const P = PROG.get(), items = PROG.SHOP[cat];
    const eqKey = { cues: 'cue', tables: 'table', balls: 'balls', fx: 'fx', scenes: 'scene' }[cat];
    const list = h('div', { class: 'list' });
    for (const it of items) {
      const own = PROG.owns(cat, it.id), using = P.equip[eqKey] === it.id;
      let action;
      if (using) action = h('span', { class: 'using', text: 'Em uso' });
      else if (own) action = btn('Usar', () => { PROG.equip(cat, it.id); shop(cat); }, 'small');
      else if (it.price < 0) {
        const a = ACHIEVEMENTS.find(x => x.id === it.unlockBy);
        action = h('small', { class: 'lockline' }, h('i', { class: 'ic ic-lock' }), ' Conquista: ' + (a ? a.name : ''));
      } else action = btn(h('span', {}, h('i', { class: 'ic ic-coin' }), ' ' + U.fmt(it.price)), () => {
        if (PROG.buy(cat, it.id)) { SFX.buy(); PROG.equip(cat, it.id); toast(`✔ ${it.name} comprado!`); shop(cat); }
        else { SFX.error(); toast('Moedas insuficientes', 'bad'); }
      }, 'small gold');
      list.appendChild(h('div', { class: 'item shopitem' + (using ? ' sel' : '') }, h('div', { class: 'prev' }, itemPreview(cat, it)), h('div', {}, h('b', { text: it.name }), it.desc ? h('small', { text: it.desc }) : null), action));
    }
    return list;
  }

  function avatarEditor() {
    const P = PROG.get(), av = P.avatar;
    const prev = animCanvas(24, 33, 4, (ctx, tt) => {
      ctx.clearRect(0, 0, 24, 33);
      const ph = tt % 4;
      SPR.drawChar(ctx, GAME.avatarLook(P.avatar), 0, 0, 1, { pose: ph < 0.7 ? 'happy' : 'idle', t: tt, blink: (tt % 3) < 0.12 });
    });
    const set = (k, v) => { av[k] = v; PROG.save(); SFX.ui(); refresh(); };
    const wrap = h('div', { class: 'avatar' });
    function row(label, items) { return h('div', { class: 'arow' }, h('h4', { text: label }), h('div', { class: 'chips' }, ...items)); }
    function swatch(k, c) { return h('button', { class: 'sw' + (av[k] === c ? ' sel' : ''), style: { background: c }, 'aria-label': c, onclick: () => set(k, c) }); }
    function opt(k, v, name, locked) { return h('button', { class: 'chipbtn' + (av[k] === v ? ' sel' : '') + (locked ? ' locked' : ''), disabled: !!locked, onclick: () => set(k, v) }, (locked ? '🔒 ' : '') + name); }
    function refresh() {
      wrap.innerHTML = '';
      const name = h('input', { class: 'name', maxlength: 12, value: av.name || '', 'aria-label': 'Nome', oninput: e => { av.name = e.target.value.slice(0, 12); PROG.save(); } });
      wrap.append(
        h('div', { class: 'apreview' }, prev, h('label', {}, h('span', { text: 'Nome' }), name)),
        row('Pele', AVATAR.skins.map(c => swatch('skin', c))),
        row('Cabelo', AVATAR.hairs.map(v => opt('hair', v, AVATAR.hairNames[v]))),
        row('Cor do cabelo', AVATAR.hairColors.map(c => swatch('hairC', c))),
        row('Roupa', AVATAR.tops.map(v => opt('top', v, AVATAR.topNames[v]))),
        row('Cor da roupa', AVATAR.topColors.map(c => swatch('topC', c))),
        row('Barba', AVATAR.beards.map(v => opt('beard', v, AVATAR.beardNames[String(v)]))),
        row('Óculos', AVATAR.glasses.map(v => opt('glasses', v, AVATAR.glassesNames[String(v)]))),
        row('Chapéu', AVATAR.hats.map(hh => opt('hat', hh.id, hh.name, !PROG.hatAvailable(hh)))),
      );
    }
    refresh();
    return wrap;
  }

  /* ---------- conquistas, ranking, diários, definições ---------- */
  function achievements() {
    const P = PROG.get();
    const n = Object.keys(P.ach).length;
    const list = h('div', { class: 'list' });
    for (const a of ACHIEVEMENTS) {
      const ok = !!P.ach[a.id];
      list.appendChild(h('div', { class: 'item ach' + (ok ? ' done' : ' locked') },
        h('span', { class: 'medal', text: ok ? '🏅' : '🔒' }),
        h('div', {}, h('b', { text: a.name }), h('small', { text: a.desc })),
        h('small', { class: 'rew' }, h('i', { class: 'ic ic-coin' }), ' ' + a.reward)));
    }
    show(screen(`Conquistas ${n}/${ACHIEVEMENTS.length}`, list));
  }

  function leaderboard(tab = 'rank') {
    const P = PROG.get(), S = P.stats;
    const tabs = h('div', { class: 'tabs' }, h('button', { class: 'tab' + (tab === 'rank' ? ' sel' : ''), onclick: () => leaderboard('rank') }, 'Classificação'), h('button', { class: 'tab' + (tab === 'rec' ? ' sel' : ''), onclick: () => leaderboard('rec') }, 'Recordes'));
    let body;
    if (tab === 'rank') {
      const rows = PROG.leaderboard();
      body = h('ol', { class: 'rank' }, ...rows.map((r, i) => h('li', { class: r.me ? 'me' : '' },
        h('span', { class: 'pos', text: String(i + 1) }),
        r.me ? staticCanvas(24, 20, 1.5, ctx => SPR.drawChar(ctx, GAME.avatarLook(P.avatar), 0, -2, 1, {})) : portraitEl(r.c, 1, 20, 1.5),
        h('b', { text: r.me ? `${r.name} (tu)` : (PROG.charUnlocked(r.c) ? r.name : '???') }),
        h('span', { class: 'pts', text: U.fmt(r.rating) }))));
      const myPos = rows.findIndex(r => r.me) + 1;
      body = [h('p', { class: 'note', text: `Estás em ${myPos}.º lugar com ${P.rating} pontos. Ganha a adversários fortes para subir!` }), body];
    } else {
      const winp = S.matches ? Math.round(S.wins / S.matches * 100) : 0;
      const rec = [
        ['Partidas', S.matches], ['Vitórias', S.wins], ['Derrotas', S.losses], ['% vitórias', winp + '%'],
        ['Bolas encaçapadas', S.potted], ['Tacadas', S.shots], ['Faltas', S.fouls], ['Mais bolas numa tacada', S.bestCombo],
        ['Melhor sequência', S.bestRun], ['Vitória mais rápida', S.fastestWin ? S.fastestWin + ' tacadas' : '—'], ['Recorde Sobrevivência', 'Ronda ' + S.bestSurvival],
        ['Torneios ganhos', S.tournaments], ['Mesas limpas', S.runouts], ['Moedas ganhas', U.fmt(S.totalCoins)], ['Lendários vencidos', S.legendWins], ['Nível', P.level],
      ];
      body = h('div', { class: 'records' }, ...rec.map(([k, v]) => h('div', {}, h('small', { text: k }), h('b', { text: String(v) }))));
    }
    show(screen('Ranking', [tabs, body]));
  }

  function daily() {
    PROG.refreshDaily();
    const P = PROG.get(), D = P.daily;
    const bonus = h('div', { class: 'item bonus' },
      h('span', { class: 'medal', text: '🎁' }),
      h('div', {}, h('b', { text: 'Prémio diário' }), h('small', { text: `Sequência: ${D.streak} dia${D.streak === 1 ? '' : 's'}. Volta amanhã para ganhares mais!` })),
      D.bonusClaimed ? h('span', { class: 'using', text: 'Recebido' }) : btn(h('span', {}, h('i', { class: 'ic ic-coin' }), ' ' + PROG.dailyBonusAmount()), () => { const n = PROG.claimDailyBonus(); SFX.coin(); toast(`+${n} moedas!`); daily(); }, 'small gold'));
    const tasks = D.tasks.map((tk, i) => h('div', { class: 'item' + (tk.claimed ? ' done' : '') },
      h('span', { class: 'medal', text: tk.claimed ? '✅' : tk.progress >= tk.n ? '⭐' : '🎯' }),
      h('div', {}, h('b', { text: tk.text }), h('div', { class: 'meter' }, h('i', { style: { width: Math.round(tk.progress / tk.n * 100) + '%' } })), h('small', { text: `${tk.progress}/${tk.n}` })),
      tk.claimed ? h('span', { class: 'using', text: 'Feito' }) : tk.progress >= tk.n
        ? btn(h('span', {}, 'Receber ', h('i', { class: 'ic ic-coin' }), ' ' + tk.reward), () => { PROG.claimDaily(i); SFX.coin(); toast(`+${tk.reward} moedas!`); daily(); }, 'small gold')
        : h('small', { class: 'rew' }, h('i', { class: 'ic ic-coin' }), ' ' + tk.reward)));
    show(screen('Desafios diários', [bonus, h('h4', { text: 'Missões de hoje' }), h('div', { class: 'list' }, ...tasks), h('p', { class: 'note', text: 'As missões mudam todos os dias à meia-noite.' })]));
  }

  function settings() {
    const S = PROG.get().settings;
    const tog = (k, label, after) => h('label', { class: 'toggle' }, h('span', { text: label }),
      h('input', { type: 'checkbox', checked: S[k], onchange: e => { S[k] = e.target.checked; PROG.save(); after && after(S[k]); SFX.ui(); } }));
    show(screen('Definições', h('div', { class: 'list' },
      tog('sound', 'Efeitos sonoros', v => SFX.setSound(v)),
      tog('music', 'Música', v => SFX.setMusic(v)),
      tog('vibrate', 'Vibração', v => { window.__vibrate = v; }),
      tog('guide', 'Linha de mira completa'),
      h('div', { class: 'item' }, h('div', {}, h('b', { text: 'Como jogar' }),
        h('small', { text: 'Toca ou arrasta na mesa para apontar. Desliza o dedo na barra de força e solta para tacar. Usa ◀ ▶ para afinar a mira e o círculo «Efeito» para dar efeito à bola branca (em cima: segue; em baixo: recua).' }),
        h('small', { text: 'Regras: encaçapa o teu grupo (lisas ou riscadas) e depois a bola 8. Bola branca na caçapa, não tocar em bola nenhuma ou tocar primeiro na bola errada é falta: o adversário fica com bola na mão.' }))),
      btn('Apagar todo o progresso', () => confirmBox('Tens a certeza? Perdes moedas, desbloqueios e recordes.', 'Apagar', () => { PROG.reset(); toast('Progresso apagado'); home(); }), 'danger'),
      h('p', { class: 'disclaimer', text: 'Sinuca das Estrelas · paródia humorística. As personagens inspiradas em pessoas reais são caricaturas fictícias, sem qualquer ligação, patrocínio ou apoio dessas pessoas.' }),
    )));
  }

  /* ---------- HUD das partidas ---------- */
  function gameHud(st) {
    hide();
    $('hud').hidden = false;
    const free = st.mode === 'free', chal = st.mode === 'challenge';
    $('oppTag').hidden = free || chal;
    $('panel').hidden = !(free || chal);
    $('aimBtns').hidden = false;
    const titles = { quick: st.twoPlayer ? '2 Jogadores' : 'Partida rápida', tournament: st.cfg.title || 'Torneio', survival: st.cfg.title || 'Sobrevivência', challenge: 'Desafio', free: 'Treino livre' };
    $('modeTitle').textContent = titles[st.mode] || '';
    if (st.opp || st.twoPlayer) {
      const o = $('oppTag'); o.innerHTML = '';
      if (st.twoPlayer) o.append(h('b', { text: 'JOGADOR 2' }));
      else o.append(h('b', { text: st.opp.name }), tierBadge(st.opp), diffStars(st.opp.diff));
    }
    const pn = $('panel'); pn.innerHTML = '';
    if (free) pn.append(h('b', { text: '🎱 TREINO LIVRE' }), h('small', { text: 'Sem regras. Experimenta efeitos e tabelas.' }),
      h('div', { class: 'row' }, h('button', { class: 'mini', onclick: () => GAME.freeRerack() }, '↻ Rearrumar'), h('button', { class: 'mini', onclick: () => GAME.freeBallInHand() }, '✋ Bola na mão')));
    if (chal) pn.append(h('b', { text: '🎯 ' + st.challenge.def.name }), h('small', { text: st.challenge.def.desc }), h('span', { id: 'chalInfo', class: 'chalInfo' }));
    updateHud(st);
  }
  function updateHud(st) {
    refreshCoins();
    const m = st.match, P = PROG.get();
    const me = $('meTag'); me.innerHTML = '';
    const gname = g => RULES.groupName(g);
    const mineName = st.twoPlayer ? 'JOGADOR 1' : (P.avatar.name || 'Tu');
    me.append(h('b', { text: mineName }));
    if (st.mode !== 'free' && st.mode !== 'challenge') {
      me.append(h('small', { text: m.groups[0] ? (RULES.onEight(m, st.balls, 0) ? '· Bola 8!' : '· ' + gname(m.groups[0])) : '' }));
      const o = $('oppTag'); let og = o.querySelector('.grp');
      if (!og) { og = h('small', { class: 'grp' }); o.append(og); }
      og.textContent = m.groups[1] ? (RULES.onEight(m, st.balls, 1) ? 'Bola 8!' : gname(m.groups[1])) : '';
    }
    const tt = $('turnTag');
    if (st.mode === 'free' || st.mode === 'challenge') tt.hidden = true;
    else {
      tt.hidden = false;
      const mine = m.cur === 0;
      tt.textContent = st.twoPlayer ? `VEZ DO JOGADOR ${m.cur + 1}` : mine ? 'A TUA VEZ' : `VEZ DE ${st.opp ? st.opp.short : 'CPU'}`;
      tt.className = 'turnTag ' + (mine ? 'me' : 'opp');
      if (m.ballInHand) tt.textContent += ' ✋';
    }
    if (st.mode === 'challenge') updateTimer(st, GAME.now());
  }
  function updateTimer(st, t) {
    const e = $('chalInfo'); if (!e) return;
    const ch = st.challenge, d = ch.def;
    const txt = d.type === 'timed' ? `⏱ ${Math.max(0, Math.ceil(d.time - (t - ch.start)))} s · Tacadas: ${ch.shots}` : `Tacadas: ${ch.shots}/${d.shots} · ⭐⭐⭐ com ${d.par}`;
    if (e.textContent !== txt) e.textContent = txt;
  }
  function hideHud() { $('hud').hidden = true; }

  function pause() {
    const st = GAME.st;
    if (st.screen !== 'play' || document.querySelector('.modal.pause')) return;
    GAME.setPaused(true);
    const S = PROG.get().settings;
    const close = () => { GAME.setPaused(false); m.close(); };
    const canRestart = ['quick', 'free', 'challenge'].includes(st.mode);
    const quitText = st.mode === 'tournament' ? 'Desistir do torneio' : st.mode === 'survival' ? 'Terminar a corrida' : 'Sair para o menu';
    const m = modal([
      h('h3', { text: 'Pausa' }),
      btn('▶ Continuar', close, 'go'),
      canRestart ? btn('↻ Recomeçar', () => { m.close(); GAME.setPaused(false); GAME.start(st.cfg); }) : null,
      h('div', { class: 'row' },
        btn(S.sound ? '🔊 Som' : '🔇 Som', e => { S.sound = !S.sound; SFX.setSound(S.sound); PROG.save(); e.currentTarget.textContent = S.sound ? '🔊 Som' : '🔇 Som'; }),
        btn(S.music ? '🎵 Música' : '🔇 Música', e => { S.music = !S.music; SFX.setMusic(S.music); PROG.save(); e.currentTarget.textContent = S.music ? '🎵 Música' : '🔇 Música'; })),
      btn(quitText, () => {
        m.close();
        const go = () => { GAME.setPaused(false); MODES.abandon(); };
        if (st.mode === 'tournament' || st.mode === 'survival') confirmBox(st.mode === 'tournament' ? 'Se desistires ficas eliminado do torneio.' : 'A corrida termina aqui.', 'Sair', go, () => GAME.setPaused(false)); else go();
      }, 'danger'),
    ], 'pause');
  }

  function init() {
    root = $('ui');
    $('bPause').addEventListener('click', () => { SFX.init(); SFX.ui(); pause(); });
    const hold = (el, dir) => {
      let iv = null, n = 0;
      const stop = () => { if (iv) clearInterval(iv); iv = null; };
      el.addEventListener('pointerdown', e => { e.preventDefault(); SFX.init(); n = 0; GAME.nudgeAim(dir, true); iv = setInterval(() => { n++; GAME.nudgeAim(dir, n < 12); }, 60); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, stop));
    };
    hold($('aimL'), -1); hold($('aimR'), 1);
    PROG.onNotice(n => {
      if (n.type === 'achievement') { toast(`🏅 <b>${n.a.name}</b><br>+${n.a.reward} moedas`, 'ach'); SFX.unlock(); }
      if (n.type === 'daily') toast(`📅 Missão diária feita!<br><b>${n.t.text}</b>`, 'ach');
      refreshCoins();
    });
  }

  return { init, home, show, hide, screen, modal, toast, btn, portraitEl, animCanvas, staticCanvas, tierBadge, diffStars, stars, coinsChip, refreshCoins,
    gameHud, updateHud, updateTimer, hideHud, pause, opponents, tournaments, challenges, shop, daily, announceUnlocks, confirmBox, scenePreview };
})();
