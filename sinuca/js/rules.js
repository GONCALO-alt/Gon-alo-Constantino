'use strict';
/* Regras da bola 8 (versão de bar): lisas 1–7, riscadas 9–15, preta no fim.
   Falta: branca encaçapada, não tocar em nenhuma bola, ou tocar primeiro numa bola que não é tua.
   Depois de uma falta, o adversário joga com bola na mão (em qualquer sítio). */
const RULES = (() => {
  const G = id => PHYS.groupOf(id);

  function remaining(balls, group) {
    let n = 0;
    for (const b of balls) if (b.on && b.id !== 0 && G(b.id) === group) n++;
    return n;
  }

  /* Chamar antes da tacada: diz se o jogador já está na bola 8. */
  function onEight(match, balls, p) {
    const g = match.groups[p];
    return !!g && remaining(balls, g) === 0;
  }

  /* Legal como primeiro toque? */
  function legalFirst(match, balls, p, id) {
    const g = match.groups[p];
    if (id == null) return false;
    if (!g) return id !== 8 || match.isBreak;
    if (onEight(match, balls, p)) return id === 8;
    return G(id) === g;
  }

  /* Avalia a tacada. ballsAfter: estado final; wasOn8: valor de onEight antes da tacada. */
  function evaluate(match, rec, ballsAfter, wasOn8) {
    const p = match.cur, o = 1 - p;
    const out = { foul: null, cont: false, win: null, assigned: null, respot8: false, ownPotted: 0, oppPotted: 0 };
    const g0 = match.groups[p];
    if (rec.cuePotted) out.foul = 'scratch';
    else if (rec.firstHit == null) out.foul = 'nohit';
    else if (!match.isBreak) {
      if (g0) {
        const need = wasOn8 ? 'eight' : g0;
        if (G(rec.firstHit) !== need) out.foul = 'wrong';
      } else if (rec.firstHit === 8) out.foul = 'wrong';
    }
    const potted = rec.potted.filter(id => id !== 8);
    const eight = rec.potted.includes(8);
    if (eight) {
      if (match.isBreak) out.respot8 = true;
      else { out.win = (wasOn8 && !out.foul) ? p : o; return out; }
    }
    let g = g0;
    if (!g && !match.isBreak && !out.foul && potted.length) {
      g = G(potted[0]);
      out.assigned = g;
    }
    if (g) {
      for (const id of potted) { if (G(id) === g) out.ownPotted++; else out.oppPotted++; }
    } else out.ownPotted = potted.length;
    out.cont = !out.foul && out.ownPotted > 0;
    return out;
  }

  /* Aplica o resultado ao estado do jogo (grupos e vez). */
  function apply(match, res) {
    const p = match.cur;
    if (res.assigned) {
      match.groups[p] = res.assigned;
      match.groups[1 - p] = res.assigned === 'solid' ? 'stripe' : 'solid';
    }
    match.isBreak = false;
    if (res.win != null) return;
    if (!res.cont) match.cur = 1 - p;
    match.ballInHand = !!res.foul;
  }

  function groupName(g) { return g === 'solid' ? 'Lisas' : g === 'stripe' ? 'Riscadas' : g === 'eight' ? 'Bola 8' : 'Mesa aberta'; }
  function foulText(f) {
    return { scratch: 'Falta: bola branca encaçapada', nohit: 'Falta: nenhuma bola tocada', wrong: 'Falta: primeiro toque na bola errada' }[f] || 'Falta';
  }

  return { remaining, onEight, legalFirst, evaluate, apply, groupName, foulText };
})();
