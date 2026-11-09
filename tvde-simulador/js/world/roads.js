// Rede viária: intersecções, vias dirigidas, semáforos, cálculo de rotas e trajetórias.
import * as THREE from 'three';
import { CFG } from '../config.js';
import { clamp, lerp, smooth } from '../util.js';

const S = CFG.SPACING, RW = CFG.ROADW;
const LIGHT_CYCLE = 26;

export class RoadNetwork {
  constructor(removedNodes = []) {
    const G = CFG.GRID; this.G = G;
    this.nodes = []; this.edges = []; this.edgeMap = new Map();
    const rem = new Set(removedNodes);
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const id = j * G + i;
      this.nodes.push({ id, i, j, x: (i - (G - 1) / 2) * S, z: (j - (G - 1) / 2) * S, exists: !rem.has(id), out: [], inc: [], lightOffset: (i * 7 + j * 11) % LIGHT_CYCLE });
    }
    for (const n of this.nodes) {
      if (!n.exists) continue;
      if (n.i < G - 1) { const m = this.nodes[n.id + 1]; if (m.exists) this._link(n, m); }
      if (n.j < G - 1) { const m = this.nodes[n.id + G]; if (m.exists) this._link(n, m); }
    }
    this.edgeLen = S - RW;
    this.time = 0;
    this._curveCache = new Map();
    this.half = ((G - 1) / 2) * S;
    this.closed = new Set();
    // Vila Velha: ponte a oeste e um quarteirão de ruas antigas do outro lado do rio
    const W = this.nodeAt(0, 4), BR = 240;
    const F1 = this.addNode(W.x - BR, W.z, -1, 4), F2 = this.addNode(F1.x - S, W.z, -2, 4);
    const F3 = this.addNode(F1.x - S, W.z + S, -2, 5), F4 = this.addNode(F1.x, W.z + S, -1, 5);
    this._link(W, F1); this._link(F1, F2); this._link(F2, F3); this._link(F3, F4); this._link(F4, F1);
    const be = this.edgeBetween(W.id, F1.id), be2 = this.edgeBetween(F1.id, W.id);
    for (const id of [be, be2]) { this.edges[id].bridge = true; this.edges[id].name = 'Ponte Atlântica'; }
    const names = { [F1.id + ':' + F2.id]: 'Rua da Sé', [F2.id + ':' + F3.id]: 'Calçada do Castelo', [F3.id + ':' + F4.id]: 'Rua dos Pescadores', [F4.id + ':' + F1.id]: 'Travessa do Rio' };
    for (const e of this.edges) {
      const k1 = e.a + ':' + e.b, k2 = e.b + ':' + e.a;
      if (names[k1] || names[k2]) { e.name = names[k1] || names[k2]; e.old = true; }
    }
    this.old = { F1, F2, F3, F4, W };
    this.bounds = { minX: F2.x - 140, maxX: this.half + 90, minZ: -this.half - 90, maxZ: this.half + 110 };
  }
  addNode(x, z, i, j) {
    const n = { id: this.nodes.length, i, j, x, z, exists: true, out: [], inc: [], lightOffset: (Math.abs(i) * 7 + j * 11) % LIGHT_CYCLE };
    this.nodes.push(n); return n;
  }
  _link(a, b) { const e1 = this._add(a, b), e2 = this._add(b, a); e1.rev = e2.id; e2.rev = e1.id; }
  _add(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz);
    const d = { x: dx / L, z: dz / L };
    const e = { id: this.edges.length, a: a.id, b: b.id, d, r: { x: -d.z, z: d.x }, axis: Math.abs(dx) > Math.abs(dz) ? 'EW' : 'NS', len: L - RW, rev: -1 };
    this.edges.push(e); a.out.push(e.id); b.inc.push(e.id);
    this.edgeMap.set(a.id * 1000 + b.id, e.id);
    return e;
  }
  edgeBetween(a, b) { const v = this.edgeMap.get(a * 1000 + b); return v === undefined ? -1 : v; }
  nodeAt(i, j) { return this.nodes[j * this.G + i]; }

  edgePoint(e, s, off, out) {
    const a = this.nodes[e.a]; const k = RW / 2 + s;
    out.x = a.x + e.d.x * k + e.r.x * off; out.y = 0; out.z = a.z + e.d.z * k + e.r.z * off;
    return out;
  }
  hasLight(nodeId) { return this.nodes[nodeId].out.length >= 3; }
  light(nodeId, axis) {
    const n = this.nodes[nodeId];
    if (n.out.length < 3) return 'G';
    const t = (this.time + n.lightOffset) % LIGHT_CYCLE;
    if (axis === 'NS') return t < 10 ? 'G' : t < 12.5 ? 'Y' : 'R';
    return t >= 13 && t < 23 ? 'G' : t >= 23 && t < 25.5 ? 'Y' : 'R';
  }
  turnType(e1, e2) {
    const dot = e1.d.x * e2.d.x + e1.d.z * e2.d.z;
    if (dot > 0.5) return 'S';
    if (dot < -0.5) return 'U';
    const cross = e1.d.x * e2.d.z - e1.d.z * e2.d.x;
    return cross > 0 ? 'R' : 'L';
  }
  turnCost(e1, e2) { const t = this.turnType(e1, e2); return t === 'S' ? 0 : t === 'R' ? 4 : t === 'L' ? 10 : 80; }
  successors(eid, blocked) {
    const e = this.edges[eid];
    const outs = this.nodes[e.b].out.filter((x) => x !== e.rev && !(blocked && blocked.has(x)) && !this.closed.has(x));
    return outs.length ? outs : [e.rev];
  }
  // Dijkstra sobre vias dirigidas (evita inversões de marcha)
  findRoute(startId, goalId, blocked = null) {
    const N = this.edges.length;
    const dist = new Float64Array(N).fill(Infinity); const prev = new Int32Array(N).fill(-1);
    const open = [];
    const sE = this.edges[startId];
    for (const n of this.successors(startId, blocked)) {
      const c = this.edges[n].len + this.turnCost(sE, this.edges[n]);
      if (c < dist[n]) { dist[n] = c; prev[n] = startId; open.push([c, n]); }
    }
    while (open.length) {
      let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
      const [c, id] = open.splice(bi, 1)[0];
      if (c > dist[id]) continue;
      if (id === goalId) break;
      const e = this.edges[id];
      for (const n of this.successors(id, blocked)) {
        const nc = c + this.edges[n].len + RW + this.turnCost(e, this.edges[n]);
        if (nc < dist[n]) { dist[n] = nc; prev[n] = id; open.push([nc, n]); }
      }
    }
    if (dist[goalId] === Infinity) return null;
    const path = [goalId]; let cur = prev[goalId]; let guard = 0;
    while (cur !== startId) { if (cur < 0 || guard++ > 5000) return null; path.push(cur); cur = prev[cur]; }
    path.push(startId);
    return path.reverse();
  }
  curve(e1, e2) {
    const key = e1.id * 10000 + e2.id;
    let c = this._curveCache.get(key);
    if (c) return c;
    const p0 = this.edgePoint(e1, e1.len, CFG.LANE, new THREE.Vector3());
    const p2 = this.edgePoint(e2, 0, CFG.LANE, new THREE.Vector3());
    const type = this.turnType(e1, e2);
    let p1;
    if (type === 'S') p1 = p0.clone().lerp(p2, 0.5);
    else if (type === 'U') { const n = this.nodes[e1.b]; p1 = new THREE.Vector3(n.x + e1.d.x * 4, 0, n.z + e1.d.z * 4); }
    else { const proj = (p2.x - p0.x) * e1.d.x + (p2.z - p0.z) * e1.d.z; p1 = new THREE.Vector3(p0.x + e1.d.x * proj, 0, p0.z + e1.d.z * proj); }
    c = { p0, p1, p2, type, len: 0, from: e1.id, to: e2.id };
    let L = 0; const a = new THREE.Vector3(), b = new THREE.Vector3();
    this.bezier(c, 0, a);
    for (let i = 1; i <= 12; i++) { this.bezier(c, i / 12, b); L += a.distanceTo(b); a.copy(b); }
    c.len = L;
    this._curveCache.set(key, c);
    return c;
  }
  bezier(c, t, out) {
    const u = 1 - t;
    out.x = u * u * c.p0.x + 2 * u * t * c.p1.x + t * t * c.p2.x; out.y = 0;
    out.z = u * u * c.p0.z + 2 * u * t * c.p1.z + t * t * c.p2.z;
    return out;
  }
}

// Trajetória composta por troços de via e curvas nas intersecções
export class Path {
  constructor(net, pieces) {
    this.net = net; this.pieces = pieces; let acc = 0;
    for (const p of pieces) { p.start = acc; acc += p.len; }
    this.length = acc; this._i = 0;
  }
  idxAt(d) {
    let i = this._i; const P = this.pieces;
    while (i < P.length - 1 && d >= P[i].start + P[i].len) i++;
    while (i > 0 && d < P[i].start) i--;
    this._i = i; return i;
  }
  offsetAt(p, local) {
    let off = CFG.LANE;
    if (p.offStart !== undefined && Math.abs(p.offStart - CFG.LANE) > 0.05) off = lerp(p.offStart, CFG.LANE, smooth(0, 12, local));
    if (p.pullEnd) off = lerp(off, CFG.CURB, smooth(p.len - 16, p.len, local));
    return off;
  }
  sample(d, out) {
    d = clamp(d, 0, this.length);
    const p = this.pieces[this.idxAt(d)]; const local = d - p.start;
    if (p.kind === 'edge') return this.net.edgePoint(p.edge, p.s0 + local, this.offsetAt(p, local), out);
    return this.net.bezier(p.curve, p.len > 0 ? local / p.len : 1, out);
  }
  // pontos (x,z) do restante percurso para desenhar no mapa
  points(fromD, step = 6) {
    const out = []; const v = new THREE.Vector3();
    for (let d = fromD; d < this.length; d += step) { this.sample(d, v); out.push([v.x, v.z]); }
    this.sample(this.length, v); out.push([v.x, v.z]);
    return out;
  }
}

export function buildPath(net, ids, sStart, sEnd, offStart, pullEnd) {
  const pieces = [];
  for (let k = 0; k < ids.length; k++) {
    const e = net.edges[ids[k]];
    const s0 = k === 0 ? sStart : 0, s1 = k === ids.length - 1 ? sEnd : e.len;
    if (s1 > s0 + 0.01 || k === ids.length - 1) pieces.push({ kind: 'edge', edge: e, s0, s1: Math.max(s0, s1), len: Math.max(0, s1 - s0) });
    if (k < ids.length - 1) {
      const n = net.edges[ids[k + 1]]; const c = net.curve(e, n);
      pieces.push({ kind: 'turn', curve: c, len: c.len, node: e.b, from: e, to: n });
    }
  }
  if (pieces[0].kind === 'edge') pieces[0].offStart = offStart;
  const last = pieces[pieces.length - 1];
  if (pullEnd && last.kind === 'edge') last.pullEnd = true;
  return new Path(net, pieces);
}
