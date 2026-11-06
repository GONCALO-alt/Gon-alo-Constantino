'use strict';
/* Adversários controlados pelo computador.
   Gera tacadas candidatas (bola fantasma → caçapa), simula-as com a física real, escolhe a melhor
   e depois aplica um erro de pontaria que depende da dificuldade (1–10). */
const AI = (() => {
  const R = PHYS.R;
  const skillOf = diff => U.clamp((diff - 1) / 9, 0, 1);

  function targets(match, balls, p) {
    const g = match.groups[p];
    if (g && RULES.remaining(balls, g) === 0) return balls.filter(b => b.on && b.id === 8);
    if (!g) return balls.filter(b => b.on && b.id !== 0 && b.id !== 8);
    return balls.filter(b => b.on && PHYS.groupOf(b.id) === g);
  }

  /* Tacadas diretas para caçapas, ordenadas por facilidade. */
  function candidates(match, balls, p, cuePos) {
    const cue = cuePos || balls.find(b => b.id === 0);
    const out = [];
    for (const t of targets(match, balls, p)) {
      for (let k = 0; k < 6; k++) {
        const pk = PHYS.POCKETS[k];
        const dx = pk.x - t.x, dy = pk.y - t.y, d = Math.hypot(dx, dy);
        const ux = dx / d, uy = dy / d;
        const gx = t.x - ux * 2 * R, gy = t.y - uy * 2 * R;
        const cx = gx - cue.x, cy = gy - cue.y, dc = Math.hypot(cx, cy);
        if (dc < 1e-4) continue;
        const ax = cx / dc, ay = cy / dc, cos = ax * ux + ay * uy;
        if (cos < 0.25) continue;
        // caçapas do meio aceitam mal bolas muito oblíquas
        if (k === 2 || k === 3) { if (Math.abs(ux) < 0.55) continue; }
        let h = cos * cos / (0.35 + dc + d * 1.3);
        const rc = PHYS.raycast(balls, cue.x, cue.y, ax, ay);
        if (rc.ball && rc.ball.id !== t.id) h *= 0.15;
        // bolas no caminho entre a bola alvo e a caçapa
        const rc2 = PHYS.raycast(balls, t.x, t.y, ux, uy, t.id);
        if (rc2.ball && rc2.t < d - 0.03) h *= 0.2;
        const power = U.clamp(0.16 + (dc + d / Math.max(cos, 0.35)) * 0.2, 0.14, 0.92);
        out.push({ ang: Math.atan2(ay, ax), power, h, target: t.id, pocket: k });
      }
    }
    out.sort((a, b) => b.h - a.h);
    return out;
  }

  function bestH(match, balls, p) {
    if (!balls.some(b => b.id === 0 && b.on)) return 0.5;
    const c = candidates(match, balls, p);
    return c.length ? c[0].h : 0;
  }

  function score(match, p, sim, wasOn8) {
    const m = { cur: p, groups: match.groups.slice(), isBreak: match.isBreak };
    const res = RULES.evaluate(m, sim.rec, sim.balls, wasOn8);
    if (res.win === p) return 10000;
    if (res.win === 1 - p) return -10000;
    let s = 0;
    if (res.assigned) { m.groups[p] = res.assigned; m.groups[1 - p] = res.assigned === 'solid' ? 'stripe' : 'solid'; }
    m.isBreak = false;
    if (res.foul) s -= 150 + bestH(m, sim.balls, 1 - p) * 60;
    if (res.cont) s += 60 + res.ownPotted * 50 + bestH(m, sim.balls, p) * 120;
    else if (!res.foul) s -= bestH(m, sim.balls, 1 - p) * 70;
    s -= res.oppPotted * 20;
    return s;
  }

  /* Escolhe onde pôr a bola branca quando tem bola na mão. */
  function placeCue(match, balls, p, area, diff) {
    const sk = skillOf(diff);
    let best = null;
    for (const t of targets(match, balls, p)) {
      for (const pk of PHYS.POCKETS) {
        const dx = pk.x - t.x, dy = pk.y - t.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
        for (const dist of [0.22, 0.35, 0.5]) {
          const x = t.x - ux * (2 * R + dist), y = t.y - uy * (2 * R + dist);
          if (!PHYS.isFree(balls, x, y, 0, area)) continue;
          const c = candidates(match, balls, p, { x, y });
          if (!c.length) continue;
          const h = c[0].h * (0.6 + Math.random() * 0.8 * (1 - sk));
          if (!best || h > best.h) best = { x, y, h };
        }
      }
    }
    if (best) return best;
    const y0 = area ? (area.minY + area.maxY) / 2 : 1.5;
    return PHYS.freeSpotNear(balls, 0.5 + U.rand(-0.15, 0.15), y0, 0, area);
  }

  /* Planeamento incremental (algumas simulações por fotograma). */
  function planner(match, balls, p, diff) {
    const sk = skillOf(diff);
    const wasOn8 = RULES.onEight(match, balls, p);
    let list = [];
    if (match.isBreak) {
      const apex = balls.filter(b => b.on && b.id !== 0).sort((a, b) => b.y - a.y)[0];
      const cue = balls.find(b => b.id === 0);
      const ang = Math.atan2(apex.y - cue.y, apex.x - cue.x) + U.gauss() * 0.004;
      return { done: true, step() { return true; }, result: { ang, power: U.rand(0.86, 1), spin: { x: 0, y: 0 } } };
    }
    const cands = candidates(match, balls, p);
    const n = 4 + Math.round(sk * 12);
    for (const c of cands.slice(0, n)) {
      list.push(c);
      list.push({ ...c, power: U.clamp(c.power * 0.75, 0.12, 1) });
      if (sk > 0.4) list.push({ ...c, power: U.clamp(c.power * 1.3, 0.12, 1) });
      if (sk > 0.6) list.push({ ...c, spin: { x: 0, y: -0.6 } }, { ...c, spin: { x: 0, y: 0.6 } });
    }
    // tacadas de segurança: apontar ao centro das bolas próprias
    const cue = balls.find(b => b.id === 0);
    for (const t of targets(match, balls, p).slice(0, 6)) {
      const a = Math.atan2(t.y - cue.y, t.x - cue.x);
      list.push({ ang: a, power: 0.3, h: 0 }, { ang: a + 0.04, power: 0.45, h: 0 }, { ang: a - 0.04, power: 0.45, h: 0 });
    }
    if (!list.length) for (let i = 0; i < 8; i++) list.push({ ang: Math.random() * Math.PI * 2, power: 0.5, h: 0 });

    let i = 0, best = null, bestS = -Infinity;
    const obj = {
      done: false, result: null,
      step(budgetMs = 6) {
        const t0 = performance.now();
        while (i < list.length && performance.now() - t0 < budgetMs) {
          const c = list[i++];
          const sim = PHYS.simulate(balls, c.ang, c.power, c.spin || null);
          const s = score(match, p, sim, wasOn8) + Math.random() * 30 * (1 - sk);
          if (s > bestS) { bestS = s; best = c; }
        }
        if (i >= list.length) {
          const sd = 0.0015 + 0.03 * Math.pow(1 - sk, 1.7);
          const pick = best || list[0];
          this.result = {
            ang: pick.ang + U.gauss() * sd,
            power: U.clamp(pick.power * (1 + U.gauss() * 0.12 * (1 - sk)), 0.08, 1),
            spin: pick.spin || { x: 0, y: 0 },
            score: bestS,
          };
          this.done = true;
        }
        return this.done;
      },
    };
    return obj;
  }

  return { planner, placeCue, candidates, skillOf };
})();
