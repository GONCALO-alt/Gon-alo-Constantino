// Mapa 2D (GPS): camada estática pré-desenhada + rota, carro, marcadores e zonas de procura.
import { CFG, DISTRICTS } from '../config.js';
import { pickupDemand } from '../game/economy.js';

const ICONS = { A: '✈️', S: '🚆', X: '🏥', M: '🛍️', G: '⛽', H: '🏨', r: '🍽️', N: '🍸', U: '🎓', P: '🌳' };

export class MapRenderer {
  constructor(city) {
    this.city = city; const net = city.net;
    this.E = net.half + 90; const E = this.E;
    const SZ = 1400; this.SZ = SZ; this.k = SZ / (2 * E);
    const c = document.createElement('canvas'); c.width = c.height = SZ; this.static = c;
    const x = c.getContext('2d'); const k = this.k;
    const P = (v) => (v + E) * k;
    x.fillStyle = '#161a20'; x.fillRect(0, 0, SZ, SZ);
    x.fillStyle = '#123049'; x.fillRect(0, P(net.half + 100), SZ, SZ);
    x.fillStyle = '#3a3626'; x.fillRect(0, P(net.half + 40), SZ, (60) * k);
    const FOOT = CFG.SPACING - CFG.ROADW;
    for (const b of city.blocks) {
      x.fillStyle = DISTRICTS[b.type].map;
      x.fillRect(P(b.cx - FOOT / 2), P(b.cz - FOOT / 2), FOOT * k, FOOT * k);
    }
    // estradas
    x.fillStyle = '#4b5361';
    const RW = CFG.ROADW;
    for (const e of net.edges) {
      if (e.id > e.rev) continue;
      const A = net.nodes[e.a], B = net.nodes[e.b];
      const x0 = Math.min(A.x, B.x) - RW / 2, z0 = Math.min(A.z, B.z) - RW / 2;
      x.fillRect(P(x0), P(z0), (Math.abs(B.x - A.x) + RW) * k, (Math.abs(B.z - A.z) + RW) * k);
    }
    x.strokeStyle = 'rgba(255,255,255,0.12)'; x.lineWidth = 1; x.setLineDash([6, 8]);
    for (const e of net.edges) {
      if (e.id > e.rev) continue;
      const A = net.nodes[e.a], B = net.nodes[e.b];
      x.beginPath(); x.moveTo(P(A.x), P(A.z)); x.lineTo(P(B.x), P(B.z)); x.stroke();
    }
    x.setLineDash([]);
    // pista
    x.fillStyle = '#3b414b'; x.fillRect(P(net.half + 70), P(city.runwayZ - 23), 700 * k, 46 * k);
    // ícones dos locais
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const done = new Set();
    for (const b of city.blocks) {
      if (!ICONS[b.type]) continue;
      if (b.type === 'A') { if (done.has('A')) continue; done.add('A'); }
      const cx = b.type === 'A' ? (net.half - CFG.SPACING) : b.cx, cz = b.type === 'A' ? (net.half - CFG.SPACING) : b.cz;
      x.font = `${b.type === 'A' ? 44 : 26}px sans-serif`; x.fillText(ICONS[b.type], P(cx), P(cz));
    }
    // nomes das ruas
    x.font = '600 13px Arial'; x.fillStyle = 'rgba(220,228,240,0.55)';
    net.edges.forEach((e) => {
      if (e.id > e.rev) return;
      const A = net.nodes[e.a];
      if ((A.i + A.j) % 3 !== 0) return;
      const B = net.nodes[e.b];
      x.save(); x.translate(P((A.x + B.x) / 2), P((A.z + B.z) / 2));
      if (e.axis === 'NS') x.rotate(-Math.PI / 2);
      x.fillText(city.streetOf(e), 0, 0); x.restore();
    });
  }
  // desenha o mapa. o: {cx, cz, zoom, rot, path, pathFrom, car:{x,z,h}, pins:[{x,z,color,label}], heat:{h,wk}}
  draw(ctx, w, h, o) {
    const E = this.E;
    ctx.save();
    ctx.fillStyle = '#161a20'; ctx.fillRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2); ctx.rotate(-o.rot); ctx.scale(o.zoom, o.zoom); ctx.translate(-o.cx, -o.cz);
    ctx.drawImage(this.static, -E, -E, 2 * E, 2 * E);
    if (o.heat) {
      for (const b of this.city.blocks) {
        const d = pickupDemand(b.type, o.heat.h, o.heat.wk);
        if (d < 1.6) continue;
        const a = Math.min(0.55, (d - 1.4) / 5);
        const g = ctx.createRadialGradient(b.cx, b.cz, 0, b.cx, b.cz, 70);
        g.addColorStop(0, `rgba(255,${d > 3 ? 70 : 140},40,${a})`); g.addColorStop(1, 'rgba(255,100,40,0)');
        ctx.fillStyle = g; ctx.fillRect(b.cx - 70, b.cz - 70, 140, 140);
      }
    }
    if (o.path) {
      const pts = o.path.points(o.pathFrom || 0, 5);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 9 / o.zoom; this._poly(ctx, pts);
      ctx.strokeStyle = o.routeColor || '#4aa3ff'; ctx.lineWidth = 5.5 / o.zoom; this._poly(ctx, pts);
    }
    ctx.restore();
    const toS = (x, z) => {
      const dx = (x - o.cx) * o.zoom, dz = (z - o.cz) * o.zoom; const c = Math.cos(-o.rot), s = Math.sin(-o.rot);
      return [w / 2 + dx * c - dz * s, h / 2 + dx * s + dz * c];
    };
    for (const p of o.pins || []) {
      const [sx, sy] = toS(p.x, p.z);
      ctx.fillStyle = p.color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy - 12, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx - 5, sy - 7); ctx.lineTo(sx, sy); ctx.lineTo(sx + 5, sy - 7); ctx.fill();
      if (p.label) { ctx.font = '600 11px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(p.label, sx, sy - 25); }
    }
    if (o.car) {
      const [sx, sy] = toS(o.car.x, o.car.z);
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(-o.car.h - o.rot);
      ctx.fillStyle = 'rgba(74,163,255,0.25)'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1a73e8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(8, 8); ctx.lineTo(0, 4); ctx.lineTo(-8, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }
  _poly(ctx, pts) {
    if (pts.length < 2) return;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
}
