// Partidas completas IA contra IA: verifica que as regras terminam sempre e que a dificuldade conta.
const load = require('./load.cjs');
const ctx = load(['util.js', 'data.js', 'physics.js', 'rules.js', 'ai.js']);
const { PHYS, RULES, AI } = ctx;

function playGame(dA, dB) {
  const balls = PHYS.rack();
  const match = { cur: 0, groups: [null, null], isBreak: true, ballInHand: true };
  const diffs = [dA, dB];
  for (let shot = 0; shot < 300; shot++) {
    const p = match.cur;
    const cue = balls.find(b => b.id === 0);
    if (!cue.on || match.ballInHand) {
      const area = match.isBreak ? { minY: PHYS.HEAD_Y, maxY: PHYS.L - PHYS.R } : null;
      const pos = match.isBreak ? { x: 0.5, y: 1.58 } : AI.placeCue(match, balls, p, area, diffs[p]);
      cue.on = true; cue.x = pos.x; cue.y = pos.y; cue.vx = cue.vy = 0;
      if (!PHYS.isFree(balls, cue.x, cue.y, 0, area)) throw new Error('posição inválida para a branca');
    }
    const pl = AI.planner(match, balls, p, diffs[p]);
    while (!pl.step(1000)) {}
    const { ang, power, spin } = pl.result;
    const wasOn8 = RULES.onEight(match, balls, p);
    const sh = { rec: PHYS.newRecord(), spin: PHYS.strike(balls, ang, power, spin), ev: null };
    let n = 0; while (PHYS.step(balls, PHYS.DT, sh) && n++ < 20000) {}
    const res = RULES.evaluate(match, sh.rec, balls, wasOn8);
    if (res.respot8) { const e = balls.find(b => b.id === 8); const s = PHYS.freeSpotNear(balls, PHYS.FOOT.x, PHYS.FOOT.y, 8); Object.assign(e, { on: true, x: s.x, y: s.y }); }
    RULES.apply(match, res);
    if (res.win != null) return { winner: res.win, shots: shot + 1 };
  }
  return { winner: -1, shots: 300 };
}

let wins = [0, 0], stuck = 0, total = 0, shots = 0;
const N = Number(process.argv[2] || 16);
const t0 = Date.now();
for (let g = 0; g < N; g++) {
  const swap = g % 2;
  const r = playGame(swap ? 2 : 9, swap ? 9 : 2);
  total++; shots += r.shots;
  if (r.winner < 0) stuck++;
  else { const strongWon = (r.winner === 0) !== !!swap; wins[strongWon ? 0 : 1]++; }
}
console.log(`jogos ${total} | forte(9) ${wins[0]} fraco(2) ${wins[1]} | sem fim ${stuck} | média tacadas ${(shots / total).toFixed(1)} | ${Date.now() - t0} ms`);
if (stuck) process.exit(1);
if (wins[0] <= wins[1]) { console.error('A dificuldade não está a fazer diferença'); process.exit(1); }
