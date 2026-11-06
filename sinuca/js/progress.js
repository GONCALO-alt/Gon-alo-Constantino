'use strict';
/* Perfil do jogador guardado no aparelho: moedas, desbloqueios, conquistas, recordes, diários e classificação. */
const PROG = (() => {
  const KEY = 'sinuca-estrelas-v1';
  let P = null;
  const listeners = [];

  function fresh() {
    return {
      v: 1, coins: 250, xp: 0, level: 1, rating: 1000,
      owned: { scenes: { bar: true }, cues: { basic: true }, tables: { green: true }, balls: { classic: true }, fx: { sparks: true } },
      boughtChars: {},
      equip: { cue: 'basic', table: 'green', balls: 'classic', fx: 'sparks', scene: 'bar' },
      avatar: { name: 'Tu', skin: '#eec39a', hair: 'short', hairC: '#4a3426', top: 'tshirt', topC: '#2f6fd0', beard: null, glasses: null, hat: null },
      ach: {},
      stats: {
        wins: 0, losses: 0, matches: 0, potted: 0, shots: 0, fouls: 0, combos2: 0, combos3: 0, runouts: 0, noFoulWins: 0,
        tournaments: 0, cupWins: {}, bestSurvival: 0, challengesDone: 0, challenges3: 0, dailyDone: 0, itemsBought: 0,
        scenesPlayed: {}, beaten: {}, lostTo: {}, revenges: 0, totalCoins: 0, bestRun: 0, bestCombo: 0, fastestWin: 0, legendWins: 0,
      },
      challenges: {},
      daily: { key: '', tasks: [], streakKey: '', streak: 0, bonusClaimed: false },
      seenChars: {},
      settings: { sound: true, music: true, vibrate: true, guide: true },
    };
  }

  function merge(base, saved) {
    for (const k in saved) {
      if (saved[k] && typeof saved[k] === 'object' && !Array.isArray(saved[k]) && base[k] && typeof base[k] === 'object') merge(base[k], saved[k]);
      else base[k] = saved[k];
    }
    return base;
  }

  function init() {
    const saved = U.load(KEY, null);
    P = saved && saved.v === 1 ? merge(fresh(), saved) : fresh();
    refreshDaily();
    save();
    return P;
  }
  function save() { U.save(KEY, P); }
  function reset() { P = fresh(); refreshDaily(); save(); }
  function get() { return P; }
  function onNotice(fn) { listeners.push(fn); }
  function notify(n) { listeners.forEach(fn => fn(n)); }

  /* ---------- moedas e XP ---------- */
  function addCoins(n, silent) {
    if (n <= 0) return;
    P.coins += n; P.stats.totalCoins += n;
    if (!silent) notify({ type: 'coins', n });
    checkAll();
  }
  function spend(n) { if (P.coins < n) return false; P.coins -= n; save(); return true; }
  function xpForLevel(l) { return 100 + (l - 1) * 60; }
  function addXp(n) {
    P.xp += n;
    const ups = [];
    while (P.xp >= xpForLevel(P.level)) {
      P.xp -= xpForLevel(P.level); P.level++;
      const bonus = 50 + P.level * 10; addCoins(bonus, true); ups.push({ level: P.level, bonus });
    }
    return ups;
  }

  /* ---------- desbloqueios ---------- */
  function charUnlocked(c) {
    if (P.boughtChars[c.id]) return true;
    const u = c.unlock || {}, s = P.stats;
    if (u.wins != null) return s.wins >= u.wins;
    if (u.coins != null) return s.totalCoins >= u.coins;
    if (u.challenges != null) return s.challengesDone >= u.challenges;
    if (u.tournament) return s.tournaments >= 1;
    if (u.cup) return (s.cupWins[u.cup] || 0) >= 1;
    if (u.survival != null) return s.bestSurvival >= u.survival;
    if (u.beat) return (s.beaten[u.beat] || 0) >= 1;
    return true;
  }
  function unlockText(c) {
    const u = c.unlock || {};
    if (u.wins != null) return `Ganha ${u.wins} partida${u.wins === 1 ? '' : 's'} (tens ${P.stats.wins})`;
    if (u.coins != null) return `Ganha ${U.fmt(u.coins)} moedas no total (tens ${U.fmt(P.stats.totalCoins)})`;
    if (u.challenges != null) return `Completa ${u.challenges} desafios (tens ${P.stats.challengesDone})`;
    if (u.tournament) return 'Ganha um torneio';
    if (u.cup) return `Ganha a ${CUPS.find(x => x.id === u.cup).name}`;
    if (u.survival != null) return `Vence ${u.survival} rondas seguidas na Sobrevivência (recorde: ${P.stats.bestSurvival})`;
    if (u.beat) return `Vence ${CHAR_BY_ID[u.beat].name}`;
    return '';
  }
  function charPrice(c) { return c.tier === 'lendario' ? 5000 : c.tier === 'especial' ? 2500 : 150 + c.diff * 120; }
  function buyChar(c) {
    if (charUnlocked(c) || !spend(charPrice(c))) return false;
    P.boughtChars[c.id] = true; save(); checkAll(); return true;
  }
  function unlockedChars() { return CHARACTERS.filter(charUnlocked); }
  /* Personagens desbloqueadas que o jogador ainda não viu (para anunciar). */
  function newlyUnlocked() {
    const out = [];
    for (const c of CHARACTERS) if (charUnlocked(c) && !P.seenChars[c.id]) { P.seenChars[c.id] = true; out.push(c); }
    if (out.length) save();
    return out;
  }

  const SHOP = { cues: CUES, tables: TABLES, balls: BALLSETS, fx: POTFX, scenes: SCENES };
  const EQUIP_KEY = { cues: 'cue', tables: 'table', balls: 'balls', fx: 'fx', scenes: 'scene' };
  function owns(cat, id) {
    const item = SHOP[cat].find(i => i.id === id);
    if (item && item.unlockBy) return !!P.ach[item.unlockBy];
    return !!P.owned[cat][id];
  }
  function buy(cat, id) {
    const item = SHOP[cat].find(i => i.id === id);
    if (!item || owns(cat, id) || item.price < 0) return false;
    if (!spend(item.price)) return false;
    P.owned[cat][id] = true; P.stats.itemsBought++;
    save(); checkAll(); return true;
  }
  function equip(cat, id) { if (!owns(cat, id)) return false; P.equip[EQUIP_KEY[cat]] = id; save(); return true; }
  function hatAvailable(h) { return !h.unlockBy || !!P.ach[h.unlockBy]; }

  /* ---------- conquistas ---------- */
  function statsView() {
    return Object.assign({}, P.stats, { charsUnlocked: unlockedChars().length, coinsNow: P.coins, level: P.level });
  }
  function checkAll() {
    const sv = statsView();
    for (const a of ACHIEVEMENTS) {
      if (P.ach[a.id]) continue;
      let ok = false;
      try { ok = a.test(sv); } catch (e) { ok = false; }
      if (ok) {
        P.ach[a.id] = Date.now();
        P.coins += a.reward; P.stats.totalCoins += a.reward;
        notify({ type: 'achievement', a });
      }
    }
    save();
  }

  /* ---------- desafios diários ---------- */
  function refreshDaily() {
    const key = U.todayKey();
    if (P.daily.key === key) return;
    const rnd = U.seeded(U.hashStr('diario-' + key));
    const pool = U.shuffle(DAILY_TEMPLATES.map((t, i) => i), rnd);
    const used = new Set(), tasks = [];
    for (const i of pool) {
      const t = DAILY_TEMPLATES[i];
      if (used.has(t.type)) continue;
      used.add(t.type);
      tasks.push({ i, type: t.type, n: t.n, d: t.d, text: U.fill(t.text, t), reward: t.reward, progress: 0, claimed: false });
      if (tasks.length === 3) break;
    }
    const yesterday = U.todayKey(new Date(Date.now() - 864e5));
    P.daily.streak = P.daily.streakKey === yesterday ? P.daily.streak : 0;
    P.daily.key = key; P.daily.tasks = tasks; P.daily.bonusClaimed = false;
  }
  function dailyBonusAmount() { return 50 + Math.min(P.daily.streak, 6) * 25; }
  function claimDailyBonus() {
    refreshDaily();
    if (P.daily.bonusClaimed) return 0;
    const n = dailyBonusAmount();
    P.daily.bonusClaimed = true; P.daily.streak++; P.daily.streakKey = P.daily.key;
    addCoins(n, true); save(); return n;
  }
  function dailyBump(type, amount = 1, data = {}) {
    refreshDaily();
    for (const t of P.daily.tasks) {
      if (t.type !== type || t.progress >= t.n) continue;
      if (type === 'beatDiff' && (data.diff || 0) < t.d) continue;
      t.progress = Math.min(t.n, t.progress + amount);
      if (t.progress >= t.n) notify({ type: 'daily', t });
    }
  }
  function claimDaily(idx) {
    const t = P.daily.tasks[idx];
    if (!t || t.claimed || t.progress < t.n) return 0;
    t.claimed = true; P.stats.dailyDone++;
    addCoins(t.reward, true); save(); return t.reward;
  }
  function dailyPending() { refreshDaily(); return P.daily.tasks.filter(t => t.progress >= t.n && !t.claimed).length + (P.daily.bonusClaimed ? 0 : 1); }

  /* ---------- eventos de jogo ---------- */
  function onShot(info) {
    P.stats.shots++; dailyBump('shots');
    if (info.potted) { P.stats.potted += info.potted; dailyBump('pot', info.potted); }
    if (info.potted >= 2) { P.stats.combos2++; dailyBump('combo'); }
    if (info.potted >= 3) P.stats.combos3++;
    P.stats.bestCombo = Math.max(P.stats.bestCombo, info.potted || 0);
    if (info.foul) P.stats.fouls++;
  }

  /* Fim de partida contra um adversário. Devolve recompensas e novidades. */
  function onMatchEnd(r) {
    const s = P.stats, c = r.opp, out = { coins: 0, xp: 0, levelUps: [], ratingDelta: 0, revenge: false };
    s.matches++;
    s.scenesPlayed[r.scene] = true;
    if (r.scene !== 'bar') dailyBump('sceneNotBar');
    if (c) {
      const oppRating = charRating(c);
      const exp = 1 / (1 + Math.pow(10, (oppRating - P.rating) / 400));
      const delta = Math.round(32 * ((r.win ? 1 : 0) - exp));
      P.rating = Math.max(100, P.rating + delta); out.ratingDelta = delta;
    }
    if (r.win) {
      s.wins++; dailyBump('win');
      if (c) {
        if ((s.lostTo[c.id] || 0) > 0 && !(s.beaten[c.id] || 0)) { s.revenges++; out.revenge = true; }
        s.beaten[c.id] = (s.beaten[c.id] || 0) + 1;
        dailyBump('beatDiff', 1, { diff: c.diff });
        if (c.tier === 'lendario') s.legendWins++;
      }
      if (!r.fouls) { s.noFoulWins++; dailyBump('noFoulWin'); }
      if (r.runout) s.runouts++;
      if (r.shots && (!s.fastestWin || r.shots < s.fastestWin)) s.fastestWin = r.shots;
      if (r.mode === 'tournament') dailyBump('tournamentMatch');
      out.coins = Math.round((30 + (c ? c.diff * 14 : 10)) * (r.mult || 1));
      out.xp = 40 + (c ? c.diff * 8 : 0);
    } else {
      s.losses++;
      if (c) s.lostTo[c.id] = (s.lostTo[c.id] || 0) + 1;
      out.coins = Math.round((6 + (c ? c.diff * 2 : 0)) * (r.mult || 1));
      out.xp = 15 + (c ? c.diff * 2 : 0);
    }
    s.bestRun = Math.max(s.bestRun, r.bestRun || 0);
    addCoins(out.coins, true);
    out.levelUps = addXp(out.xp);
    checkAll(); save();
    return out;
  }

  function onChallenge(id, stars, reward) {
    const prev = P.challenges[id] || 0;
    let coins = 0;
    if (!prev) { P.stats.challengesDone++; coins += reward; }
    if (stars > prev) {
      coins += (stars - prev) * 20;
      if (stars === 3) P.stats.challenges3++;
      P.challenges[id] = stars;
    }
    dailyBump('challenge');
    addCoins(coins, true); checkAll(); save();
    return coins;
  }
  function challengeUnlocked(i) { return i === 0 || !!P.challenges[CHALLENGES[i - 1].id]; }

  function onSurvivalRound(round) {
    dailyBump('survRound');
    if (round > P.stats.bestSurvival) P.stats.bestSurvival = round;
    checkAll(); save();
  }
  function onTournamentWin(cup) {
    P.stats.tournaments++;
    P.stats.cupWins[cup.id] = (P.stats.cupWins[cup.id] || 0) + 1;
    addCoins(cup.prize, true); checkAll(); save();
  }
  function cupUnlocked(cup) { return !cup.unlock || (P.stats.cupWins[cup.unlock.cup] || 0) >= 1; }

  /* ---------- classificação ---------- */
  function charRating(c) {
    const rnd = U.seeded(U.hashStr(c.id + U.todayKey()));
    return Math.round(650 + c.diff * 115 + (rnd() - 0.5) * 60 + (c.tier === 'lendario' ? 80 : 0));
  }
  function leaderboard() {
    const rows = CHARACTERS.map(c => ({ id: c.id, name: c.name, rating: charRating(c), c }));
    rows.push({ id: '_me', name: P.avatar.name || 'Tu', rating: P.rating, me: true });
    rows.sort((a, b) => b.rating - a.rating);
    return rows;
  }

  return {
    init, save, reset, get, onNotice, addCoins, spend, addXp, xpForLevel,
    charUnlocked, unlockText, charPrice, buyChar, unlockedChars, newlyUnlocked,
    owns, buy, equip, hatAvailable, SHOP, checkAll,
    refreshDaily, claimDaily, claimDailyBonus, dailyBonusAmount, dailyPending,
    onShot, onMatchEnd, onChallenge, challengeUnlocked, onSurvivalRound, onTournamentWin, cupUnlocked,
    charRating, leaderboard,
  };
})();
