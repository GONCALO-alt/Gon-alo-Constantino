// Geração da cidade de Porto Azul: estradas, passeios, edifícios, locais de interesse e mobiliário urbano.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CFG, DMAP, STREETS_NS, STREETS_EW } from '../config.js';
import { mulberry32, pick, rr, ri } from '../util.js';
import * as M from './materials.js';

const S = CFG.SPACING, RW = CFG.ROADW;
const FOOT = S - RW;            // 72: quarteirão incluindo passeio
const HB = FOOT / 2 - CFG.SIDEWALK; // 32: meia largura edificável

const POI_NAMES = {
  '4,0': 'Posto Atlântico', '5,6': 'Posto Rota Sul', '2,0': 'Parque da Cidade', '6,0': 'Universidade de Porto Azul',
  '0,3': 'Estação Central', '6,2': 'Hospital de Santa Luzia', '4,5': 'Atlântico Shopping',
  '5,1': 'Hotel Miramar', '4,3': 'Grande Hotel Avenida',
  '1,1': 'Restaurante O Marinheiro', '5,2': 'Tasca do Zé', '6,4': 'Marisqueira Atlântida', '2,5': 'Pizzaria Bella Vita',
  '1,4': 'Bar Neon', '2,4': 'Discoteca Lux Azul', '1,5': 'Cervejaria do Cais',
  '2,2': 'Torre Atlântica', '3,2': 'Edifício Horizonte', '2,3': 'Centro Empresarial', '3,3': 'Praça Financeira', '4,4': 'Torre Azul',
  '2,1': 'Mercado Municipal', '3,1': 'Teatro Nacional', '4,1': 'Câmara Municipal', '4,2': 'Biblioteca Municipal',
  '1,2': 'Museu do Mar', '1,3': 'Praça do Comércio', '5,3': 'Clínica do Mar', '6,3': 'Ginásio Vita', '3,4': 'Cinema Avenida',
  '5,4': 'Igreja de São Pedro', '6,3': 'Estádio do Mar', '3,5': 'Escola Secundária', '5,5': 'Mercado Biológico', '3,6': 'Pastelaria Central', '4,6': 'Feira Popular',
};
const PAL = {
  R: ['#e8d5a3', '#f2c6b4', '#d9e4dd', '#f5f0e1', '#c9d6e3', '#e3bf6a', '#efe9dd', '#d8b4a0', '#b7c9b5', '#9fb8cf', '#f0dcc0'],
  C: ['#cfc8bd', '#b9b2a8', '#e0dcd3', '#a7a39b', '#d4c4a8', '#9aa5ad', '#c2b8a3', '#e6ded0'],
  D: ['#8fa3b5', '#6f8496', '#a9b8c4', '#5d7080', '#b5c1c9', '#7d8f9e'],
  N: ['#7b4b3a', '#5b4a42', '#8a6f5a', '#4a4a52', '#6b3f3f', '#5d5560'],
};

export class City {
  constructor(scene, net, quality) {
    this.scene = scene; this.net = net; this.q = quality;
    this.rng = mulberry32(20261108);
    this.blocks = []; this.locations = []; this.bld = []; this.roofs = []; this.trees = [];
    this.signMats = []; this.nightMats = []; this.lightHeads = [];
    this.root = new THREE.Group(); scene.add(this.root);
    this.mats = {
      road: new THREE.MeshStandardMaterial({ map: M.makeRoadTexture(), roughness: 0.92 }),
      asphalt: new THREE.MeshStandardMaterial({ map: M.makeAsphaltTexture(), roughness: 0.92 }),
      side: new THREE.MeshStandardMaterial({ map: M.makeSidewalkTexture(), roughness: 0.85 }),
      grass: new THREE.MeshStandardMaterial({ map: M.makeGrassTexture(), roughness: 1 }),
      lawn: null,
      cross: new THREE.MeshStandardMaterial({ map: M.makeCrosswalkTexture(), transparent: true, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false }),
      bld: M.makeBuildingMaterial(),
      white: new THREE.MeshStandardMaterial({ color: 0xf1f0ec, roughness: 0.7 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x8d949b, roughness: 0.35, metalness: 0.8 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.6, metalness: 0.3 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x6f8fa8, roughness: 0.08, metalness: 0.9 }),
      water: new THREE.MeshStandardMaterial({ color: 0x1d4a66, roughness: 0.06, metalness: 0.3 }),
      sand: new THREE.MeshStandardMaterial({ color: 0xd8c79e, roughness: 1 }),
      cobble: new THREE.MeshStandardMaterial({ map: M.makeCobbleTexture(), roughness: 0.8 }),
      stone: new THREE.MeshStandardMaterial({ color: 0xb8ad97, roughness: 0.95 }),
    };
    this.mats.road.map.repeat.set(1, 1);
    const lt = this.mats.grass.map.clone(); lt.repeat.set(10, 10); lt.needsUpdate = true;
    this.mats.lawn = new THREE.MeshStandardMaterial({ map: lt, roughness: 1 });
    this.wetMats = [this.mats.road, this.mats.asphalt, this.mats.side, this.mats.cobble];
    for (const m of this.wetMats) { m.userData.baseRough = m.roughness; m.userData.baseColor = m.color.clone(); }

    this._blocks();
    this._ground();
    this._roads();
    this._sidewalks();
    for (const b of this.blocks) this._fillBlock(b);
    this._airport();
    this._oldTownExtras();
    this._beach();
    this._buildingMeshes();
    this._lamps();
    this._trafficLights();
    this._treesMesh();
    this._locations();
  }

  // ---------- quarteirões ----------
  _blocks() {
    const G = CFG.GRID;
    for (let bj = 0; bj < G - 1; bj++) for (let bi = 0; bi < G - 1; bi++) {
      const type = DMAP[bj][bi];
      const cx = (bi + 0.5 - (G - 1) / 2) * S, cz = (bj + 0.5 - (G - 1) / 2) * S;
      const key = bi + ',' + bj;
      this.blocks.push({ bi, bj, type, cx, cz, key, poi: POI_NAMES[key] || null, idx: this.blocks.length });
    }
    const o = this.net.old;
    this.blocks.push({ bi: -2, bj: 4, type: 'V', cx: (o.F1.x + o.F2.x) / 2, cz: o.F1.z + S / 2, key: 'old', poi: 'Sé de Porto Azul', idx: this.blocks.length });
    // lado principal: o que está virado para o centro da cidade
    for (const b of this.blocks) {
      const sides = [['N', 0, -1], ['S', 0, 1], ['W', -1, 0], ['E', 1, 0]];
      let best = 'N', bd = -1e9;
      for (const [k, nx, nz] of sides) { const d = nx * -b.cx + nz * -b.cz + this.rng() * 0.1; if (d > bd) { bd = d; best = k; } }
      b.main = best;
    }
  }
  block(bi, bj) { return this.blocks[bj * (CFG.GRID - 1) + bi]; }

  // ---------- chão, mar, montes ----------
  _ground() {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), this.mats.grass);
    g.rotation.x = -Math.PI / 2; g.position.y = -0.06; g.receiveShadow = true;
    this.mats.grass.map.repeat.set(600, 600);
    this.root.add(g);
    const half = this.net.half;
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(5000, 94), this.mats.sand);
    sand.rotation.x = -Math.PI / 2; sand.position.set(0, -0.03, half + 53); sand.receiveShadow = true; this.root.add(sand);
    const prom = new THREE.Mesh(new THREE.BoxGeometry(2 * half + 40, 0.16, 4.5), this.mats.side);
    prom.position.set(-20, 0.08, half + RW / 2 + 2.25); prom.receiveShadow = true; this.root.add(prom);
    // rio entre a cidade e a Vila Velha
    const o = this.net.old; const rx0 = o.F1.x + RW / 2 + 3, rx1 = o.W.x - RW / 2 - 3;
    this.river = { x0: rx0, x1: rx1 };
    const river = new THREE.Mesh(new THREE.PlaneGeometry(rx1 - rx0, 3000), this.mats.water);
    river.rotation.x = -Math.PI / 2; river.position.set((rx0 + rx1) / 2, -0.035, 300); this.root.add(river);
    for (const x of [rx0, rx1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 3000), this.mats.stone); w.position.set(x, -0.4, 300); w.receiveShadow = true; this.root.add(w); }
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(6000, 2400), this.mats.water);
    sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.02, half + 100 + 1200); this.root.add(sea);
    this.sea = sea;
    // montes distantes
    const hillGeo = new THREE.ConeGeometry(1, 1, 7, 1);
    const hills = new THREE.InstancedMesh(hillGeo, new THREE.MeshStandardMaterial({ color: 0x3c5236, roughness: 1, flatShading: true }), 46);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    for (let i = 0; i < 46; i++) {
      const a = Math.PI * 0.95 + (i / 46) * Math.PI * 1.1 + rr(-0.03, 0.03, this.rng);
      const r = rr(1100, 1650, this.rng);
      p.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      const w = rr(180, 380, this.rng); sc.set(w, rr(90, 230, this.rng), w * rr(0.7, 1.2, this.rng));
      p.y = sc.y / 2 - 10;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.rng() * 6);
      hills.setMatrixAt(i, m.compose(p, q, sc));
    }
    this.root.add(hills);
  }

  // ---------- estradas ----------
  _roads() {
    const pos = [], uv = [], idx = [];
    const quad = (pts, uvs) => {
      const b = pos.length / 3;
      for (const p of pts) pos.push(p[0], p[1], p[2]);
      for (const t of uvs) uv.push(t[0], t[1]);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
    const n = this.net; const h = RW / 2;
    const oldPos = [], oldUv = [], oldIdx = [];
    for (const e of n.edges) {
      if (e.id > e.rev || !e.old) continue;
      const A = n.nodes[e.a], B = n.nodes[e.b];
      const s = [A.x + e.d.x * h, A.z + e.d.z * h], t = [B.x - e.d.x * h, B.z - e.d.z * h];
      const b0 = oldPos.length / 3, L = e.len / 6;
      for (const p of [[s[0] - e.r.x * h, s[1] - e.r.z * h], [s[0] + e.r.x * h, s[1] + e.r.z * h], [t[0] + e.r.x * h, t[1] + e.r.z * h], [t[0] - e.r.x * h, t[1] - e.r.z * h]]) oldPos.push(p[0], 0.01, p[1]);
      oldUv.push(0, 0, 2, 0, 2, L, 0, L); oldIdx.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3);
    }
    this.root.add(this._meshFrom(oldPos, oldUv, oldIdx, this.mats.cobble));
    for (const e of n.edges) {
      if (e.id > e.rev || e.old) continue;
      const A = n.nodes[e.a], B = n.nodes[e.b];
      const s = [A.x + e.d.x * h, A.z + e.d.z * h], t = [B.x - e.d.x * h, B.z - e.d.z * h];
      const L = e.len / 24;
      quad([[s[0] - e.r.x * h, 0.01, s[1] - e.r.z * h], [s[0] + e.r.x * h, 0.01, s[1] + e.r.z * h], [t[0] + e.r.x * h, 0.01, t[1] + e.r.z * h], [t[0] - e.r.x * h, 0.01, t[1] - e.r.z * h]],
        [[0, 0], [1, 0], [1, L], [0, L]]);
    }
    this.root.add(this._meshFrom(pos, uv, idx, this.mats.road));
    // intersecções
    pos.length = 0; uv.length = 0; idx.length = 0;
    for (const nd of n.nodes) {
      if (!nd.exists) continue;
      const x = nd.x, z = nd.z;
      quad([[x - h, 0.012, z - h], [x + h, 0.012, z - h], [x + h, 0.012, z + h], [x - h, 0.012, z + h]], [[0, 0], [1.2, 0], [1.2, 1.2], [0, 1.2]]);
    }
    this.root.add(this._meshFrom(pos, uv, idx, this.mats.asphalt));
    // passadeiras
    pos.length = 0; uv.length = 0; idx.length = 0;
    for (const e of n.edges) {
      if (!n.hasLight(e.b)) continue;
      const B = n.nodes[e.b];
      const a0 = h + 0.6, a1 = h + 3.6;
      const p0 = [B.x - e.d.x * a1, B.z - e.d.z * a1], p1 = [B.x - e.d.x * a0, B.z - e.d.z * a0];
      if (e.id < e.rev || true) {
        quad([[p0[0] - e.r.x * h, 0.02, p0[1] - e.r.z * h], [p0[0] + e.r.x * h, 0.02, p0[1] + e.r.z * h], [p1[0] + e.r.x * h, 0.02, p1[1] + e.r.z * h], [p1[0] - e.r.x * h, 0.02, p1[1] - e.r.z * h]],
          [[0, 0], [1, 0], [1, 1], [0, 1]]);
      }
    }
    const cw = this._meshFrom(pos, uv, idx, this.mats.cross); cw.renderOrder = 1; this.root.add(cw);
  }
  _meshFrom(pos, uv, idx, mat) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true;
    return m;
  }

  // ---------- passeios ----------
  _sidewalks() {
    const geos = [];
    for (const b of this.blocks) {
      if (b.type === 'A') continue;
      const g = new THREE.BoxGeometry(FOOT, 0.16, FOOT); g.translate(b.cx, 0.08, b.cz); geos.push(g);
    }
    const a = this._airportCenter();
    const ga = new THREE.BoxGeometry(2 * S - RW, 0.16, 2 * S - RW); ga.translate(a.x, 0.08, a.z); geos.push(ga);
    const merged = mergeGeometries(geos.map((g) => g.toNonIndexed()));
    const P = merged.attributes.position, N = merged.attributes.normal, UV = merged.attributes.uv;
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      if (Math.abs(N.getY(i)) > 0.5) UV.setXY(i, x / 4, z / 4); else UV.setXY(i, (x + z) / 4, y / 4);
    }
    const m = new THREE.Mesh(merged, this.mats.side); m.receiveShadow = true; this.root.add(m);
  }

  // ---------- edifícios ----------
  addB(x, z, w, d, h, color, type = 1, shop = 0, y = 0) {
    this.bld.push({ x, z, w, d, h, color, type, seed: this.rng() * 100, shop, y });
  }
  _perimeter(b, o) {
    const r = this.rng; const h = o.hb || HB;
    const dep = { N: rr(o.dep[0], o.dep[1], r), S: rr(o.dep[0], o.dep[1], r), W: rr(o.dep[0], o.dep[1], r), E: rr(o.dep[0], o.dep[1], r) };
    const row = (side, a0, a1) => {
      let a = a0;
      while (a < a1 - 3) {
        let f = rr(o.front[0], o.front[1], r); if (a1 - a - f < o.front[0] * 0.6) f = a1 - a;
        const ht = rr(o.ht[0], o.ht[1], r); const col = pick(o.pal, r); const d = dep[side];
        const c = a + f / 2;
        if (r() > (o.gap || 0)) {
          if (side === 'N') this.addB(b.cx + c, b.cz - h + d / 2, f - 0.2, d, ht, col, o.type, o.shop);
          if (side === 'S') this.addB(b.cx + c, b.cz + h - d / 2, f - 0.2, d, ht, col, o.type, o.shop);
          if (side === 'W') this.addB(b.cx - h + d / 2, b.cz + c, d, f - 0.2, ht, col, o.type, o.shop);
          if (side === 'E') this.addB(b.cx + h - d / 2, b.cz + c, d, f - 0.2, ht, col, o.type, o.shop);
          if (o.roof && r() < o.roof) {
            const along = side === 'N' || side === 'S';
            this.roofs.push({ x: along ? b.cx + c : (side === 'W' ? b.cx - h + d / 2 : b.cx + h - d / 2), z: along ? (side === 'N' ? b.cz - h + d / 2 : b.cz + h - d / 2) : b.cz + c,
              w: along ? f - 0.2 : d, d: along ? d : f - 0.2, h: 2.2, y: ht, rot: along ? 0 : Math.PI / 2 });
          }
        }
        a += f;
      }
    };
    row('N', -h, h); row('S', -h, h); row('W', -h + dep.N, h - dep.S); row('E', -h + dep.N, h - dep.S);
    return dep;
  }
  _courtyard(b, dep) {
    const x0 = b.cx - HB + dep.W, x1 = b.cx + HB - dep.E, z0 = b.cz - HB + dep.N, z1 = b.cz + HB - dep.S;
    const g = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), this.mats.lawn);
    g.rotation.x = -Math.PI / 2; g.position.set((x0 + x1) / 2, 0.17, (z0 + z1) / 2); g.receiveShadow = true; this.root.add(g);
    const n = ri(2, 6, this.rng);
    for (let i = 0; i < n; i++) this.trees.push({ x: rr(x0 + 3, x1 - 3, this.rng), z: rr(z0 + 3, z1 - 3, this.rng), s: rr(0.8, 1.3, this.rng) });
  }
  _streetTrees(b, step = 15) {
    const o = FOOT / 2 - 1.3;
    for (let a = -o + 6; a < o - 4; a += step) {
      if (this.rng() < 0.75) this.trees.push({ x: b.cx + a, z: b.cz - o, s: rr(0.7, 1.0, this.rng) });
      if (this.rng() < 0.75) this.trees.push({ x: b.cx + a, z: b.cz + o, s: rr(0.7, 1.0, this.rng) });
      if (this.rng() < 0.75) this.trees.push({ x: b.cx - o, z: b.cz + a, s: rr(0.7, 1.0, this.rng) });
      if (this.rng() < 0.75) this.trees.push({ x: b.cx + o, z: b.cz + a, s: rr(0.7, 1.0, this.rng) });
    }
  }
  // posição e rotação de uma fachada num lado do quarteirão
  _face(b, side, dist, along = 0) {
    switch (side) {
      case 'N': return { x: b.cx + along, z: b.cz - dist, rot: Math.PI };
      case 'S': return { x: b.cx - along, z: b.cz + dist, rot: 0 };
      case 'W': return { x: b.cx - dist, z: b.cz - along, rot: -Math.PI / 2 };
      default: return { x: b.cx + dist, z: b.cz + along, rot: Math.PI / 2 };
    }
  }
  addSign(lines, opts, x, y, z, w, h, rot, double = false) {
    const t = M.makeSignTexture(lines, opts);
    const mat = new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.4, roughness: 0.5, side: double ? THREE.DoubleSide : THREE.FrontSide, transparent: !opts.bg });
    mat.userData.neon = !!opts.neon;
    this.signMats.push(mat);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z); m.rotation.y = rot; this.root.add(m);
    return m;
  }
  _totem(b, lines, opts) {
    const f = this._face(b, b.main, FOOT / 2 - 1.0, 18);
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 0.25), this.mats.dark);
    pole.position.set(f.x, 1.6, f.z); this.root.add(pole);
    // perpendicular à rua, visível para quem se aproxima
    this.addSign(lines, opts, f.x, 3.9, f.z, 4.2, 1.5, f.rot + Math.PI / 2, true);
  }

  _fillBlock(b) {
    const r = this.rng; const t = b.type;
    if (t === 'A') return;
    if (t === 'R') {
      const dep = this._perimeter(b, { dep: [10, 13], ht: [7, 15], front: [7, 11], pal: PAL.R, type: 2, shop: 0, roof: 0.5, gap: 0.06 });
      this._courtyard(b, dep);
    } else if (t === 'C') {
      const dep = this._perimeter(b, { dep: [14, 18], ht: [13, 30], front: [10, 18], pal: PAL.C, type: 1, shop: 1 });
      this._courtyard(b, dep); this._streetTrees(b, 18);
      if (b.poi) { const f = this._face(b, b.main, HB + 0.15); this.addSign([b.poi.toUpperCase()], { bg: '#1b2433', fg: '#f3e9d2' }, f.x, 5.2, f.z, 14, 1.6, f.rot); }
    } else if (t === 'D') {
      for (const [qx, qz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const cx = b.cx + qx * 16, cz = b.cz + qz * 16;
        if (r() < 0.82) {
          const w = rr(17, 25, r), d = rr(17, 25, r);
          const centerBoost = 1 - Math.min(1, Math.hypot(b.cx, b.cz) / 260);
          const h = rr(38, 70, r) + centerBoost * rr(20, 60, r);
          this.addB(cx, cz, w, d, h, pick(PAL.D, r), r() < 0.65 ? 0 : 1, 0);
          this.addB(cx, cz, w * 0.4, d * 0.4, 3, '#5a5f66', 3, 0, h);
          if (r() < 0.5) this.addB(cx, cz, 30, 30, rr(5, 9, r), pick(PAL.C, r), 1, 1);
        } else {
          this.addB(cx, cz, 28, 28, rr(10, 22, r), pick(PAL.C, r), 1, 1);
        }
      }
      this._streetTrees(b, 20);
      if (b.poi) { const f = this._face(b, b.main, HB + 2.0); this.addSign([b.poi.toUpperCase()], { bg: null, fg: '#e8f1ff' }, f.x, 9, f.z, 16, 2, f.rot); }
    } else if (t === 'H') {
      const dep = this._perimeter(b, { dep: [12, 15], ht: [10, 18], front: [10, 16], pal: PAL.C, type: 1, shop: 1 });
      const f = this._face(b, b.main, HB - 12);
      const hgt = rr(42, 58, r);
      const along = b.main === 'N' || b.main === 'S';
      this.addB(f.x, f.z, along ? 30 : 22, along ? 22 : 30, hgt, '#efe7da', 1, 1);
      const sf = this._face(b, b.main, HB - 0.8);
      this.addSign(['HOTEL', b.poi.replace('Hotel ', '').replace('Grande Hotel ', 'GRANDE HOTEL ').toUpperCase()], { bg: null, fg: '#ffd98a', neon: true }, f.x + (sf.x - f.x) * 0.5, hgt + 2.4, f.z + (sf.z - f.z) * 0.5, 18, 4.2, f.rot, true);
      this._totem(b, [b.poi.toUpperCase(), '★★★★'], { bg: '#2a1f3a', fg: '#ffd98a' });
      this._streetTrees(b, 16);
      void dep;
    } else if (t === 'r' || t === 'N') {
      const night = t === 'N';
      const dep = this._perimeter(b, { dep: [11, 14], ht: night ? [8, 17] : [8, 14], front: [8, 13], pal: night ? PAL.N : PAL.R, type: 2, shop: 1 });
      this._courtyard(b, dep);
      // toldos coloridos
      const cols = [0xb5302a, 0x2e6b3f, 0x1f4e8c, 0xd99a1e, 0x6a2b6e];
      for (const side of ['N', 'S', 'W', 'E']) {
        for (let k = -2; k <= 2; k++) {
          if (r() < 0.45) continue;
          const f = this._face(b, side, HB + 0.8, k * 11);
          const aw = new THREE.Mesh(new THREE.BoxGeometry(6, 0.12, 1.6), new THREE.MeshStandardMaterial({ color: pick(cols, r), roughness: 0.8 }));
          aw.position.set(f.x, 3.3, f.z); aw.rotation.y = f.rot; aw.rotation.x = 0; this.root.add(aw);
        }
      }
      const names = night ? ['BAR NEON', 'LUX AZUL', 'KARAOKE', 'SUNSET CLUB', 'TASCA 24H', 'COCKTAILS', 'JAZZ', 'DISCO'] : ['RESTAURANTE', 'CAFÉ', 'PASTELARIA', 'GRILL', 'SUSHI', 'MARISQUEIRA'];
      const neonCols = ['#ff3fa4', '#3ff2ff', '#ffe14a', '#8a5cff', '#ff6a3d', '#4aff7a'];
      const f = this._face(b, b.main, HB + 0.25);
      this.addSign([b.poi ? b.poi.toUpperCase() : pick(names, r)], { bg: night ? null : '#2a1d14', fg: night ? pick(neonCols, r) : '#ffe7b0', neon: night }, f.x, 4.6, f.z, 12, 1.8, f.rot);
      if (night) {
        for (const side of ['N', 'S', 'W', 'E']) {
          if (side === b.main) continue;
          const g = this._face(b, side, HB + 0.25, rr(-15, 15, r));
          this.addSign([pick(names, r)], { bg: null, fg: pick(neonCols, r), neon: true }, g.x, rr(4.5, 7, r), g.z, 8, 1.6, g.rot);
        }
      }
    } else if (t === 'P') this._park(b);
    else if (t === 'S') this._station(b);
    else if (t === 'X') this._hospital(b);
    else if (t === 'M') this._mall(b);
    else if (t === 'G') this._gas(b);
    else if (t === 'U') this._university(b);
    else if (t === 'V') this._oldBlock(b);
    else if (t === 'E') this._stadium(b);
  }

  _park(b) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(FOOT - 6, FOOT - 6), this.mats.lawn);
    g.rotation.x = -Math.PI / 2; g.position.set(b.cx, 0.17, b.cz); g.receiveShadow = true; this.root.add(g);
    for (const rot of [0, Math.PI / 2]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(FOOT - 6, 3), this.mats.side);
      p.rotation.x = -Math.PI / 2; p.rotation.z = rot; p.position.set(b.cx, 0.18, b.cz); this.root.add(p);
    }
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.3, 0.7, 28), this.mats.white); ring.position.set(b.cx, 0.35, b.cz); this.root.add(ring);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.1, 28), this.mats.water); w.position.set(b.cx, 0.68, b.cz); this.root.add(w);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 2.4, 10), this.mats.white); col.position.set(b.cx, 1.6, b.cz); this.root.add(col);
    for (let i = 0; i < 46; i++) {
      const x = rr(-30, 30, this.rng), z = rr(-30, 30, this.rng);
      if (Math.abs(x) < 3 || Math.abs(z) < 3 || Math.hypot(x, z) < 8) continue;
      this.trees.push({ x: b.cx + x, z: b.cz + z, s: rr(0.9, 1.6, this.rng) });
    }
    this._totem(b, ['PARQUE DA CIDADE'], { bg: '#1e4d2b', fg: '#ffffff' });
  }
  _station(b) {
    const hall = { x: b.cx + 6, z: b.cz, w: 24, d: 56, h: 12 };
    this.addB(hall.x, hall.z, hall.w, hall.d, hall.h, '#d9ccb0', 1, 1);
    const arch = new THREE.CylinderGeometry(12, 12, 56, 24, 1, false, -Math.PI / 2, Math.PI);
    arch.rotateX(-Math.PI / 2); arch.scale(1, 0.5, 1);
    const am = new THREE.Mesh(arch, this.mats.glass); am.position.set(hall.x, hall.h, hall.z); am.castShadow = true; this.root.add(am);
    this.addB(b.cx + 14, b.cz - 24, 7, 7, 30, '#cbbd9e', 1, 0);
    const clockT = M.makeSignTexture(['🕒'], { bg: '#f4efe2', fg: '#222', w: 128, h: 128 });
    for (const [dx, dz, rot] of [[3.6, 0, Math.PI / 2], [0, -3.6, Math.PI]]) {
      const c = new THREE.Mesh(new THREE.CircleGeometry(2.2, 24), new THREE.MeshStandardMaterial({ map: clockT, emissive: 0xffffff, emissiveMap: clockT, emissiveIntensity: 0.3 }));
      c.position.set(b.cx + 14 + dx, 26, b.cz - 24 + dz); c.rotation.y = rot; this.root.add(c);
    }
    for (let k = -2; k <= 2; k++) {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 50), this.mats.metal); roof.position.set(b.cx - 14 + k * 0.01, 4.5, b.cz); roof.castShadow = true;
      if (k === 0) this.root.add(roof);
    }
    for (let z = -22; z <= 22; z += 11) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.5, 0.3), this.mats.metal); p.position.set(b.cx - 14, 2.25, b.cz + z); this.root.add(p); }
    this.addSign(['ESTAÇÃO CENTRAL', 'COMBOIOS · METRO'], { bg: '#0d3b66', fg: '#ffffff' }, hall.x + hall.w / 2 + 0.2, 9.5, hall.z, 18, 3.4, Math.PI / 2);
    this._totem(b, ['ESTAÇÃO CENTRAL', '🚆 Partidas'], { bg: '#0d3b66', fg: '#ffffff' });
  }
  _hospital(b) {
    this.addB(b.cx - 6, b.cz, 30, 50, 24, '#f3f2ee', 1, 0);
    this.addB(b.cx + 14, b.cz - 10, 18, 30, 14, '#e8ecef', 1, 0);
    this.addB(b.cx + 14, b.cz + 18, 18, 18, 9, '#e8ecef', 1, 0);
    const h = new THREE.Mesh(new THREE.CircleGeometry(6, 32), new THREE.MeshStandardMaterial({ map: M.makeSignTexture(['H'], { bg: '#2b6a3f', fg: '#fff', w: 128, h: 128 }) }));
    h.rotation.x = -Math.PI / 2; h.position.set(b.cx - 6, 24.05, b.cz + 8); this.root.add(h);
    this.addSign(['HOSPITAL DE SANTA LUZIA'], { bg: '#ffffff', fg: '#0b5394' }, b.cx - 21.2, 20, b.cz, 24, 2.6, -Math.PI / 2);
    const cross = M.makeSignTexture(['✚'], { bg: null, fg: '#e0262b', w: 128, h: 128, neon: true });
    const cm = new THREE.MeshStandardMaterial({ map: cross, emissive: 0xffffff, emissiveMap: cross, emissiveIntensity: 1, transparent: true, side: THREE.DoubleSide });
    this.signMats.push(cm); cm.userData.neon = true;
    const c = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), cm); c.position.set(b.cx - 21.3, 27.5, b.cz - 18); c.rotation.y = -Math.PI / 2; this.root.add(c);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 16), this.mats.white); canopy.position.set(b.cx - 25, 4.2, b.cz + 10); canopy.castShadow = true; this.root.add(canopy);
    this.addSign(['URGÊNCIA'], { bg: '#c81e1e', fg: '#ffffff' }, b.cx - 29.1, 4.9, b.cz + 10, 7, 1.2, -Math.PI / 2);
    this._totem(b, ['HOSPITAL', 'SANTA LUZIA ✚'], { bg: '#ffffff', fg: '#0b5394' });
  }
  _mall(b) {
    this.addB(b.cx, b.cz + 4, 58, 48, 16, '#dcd5c9', 3, 0);
    this.addB(b.cx, b.cz - 22, 22, 4, 12, '#9cb6c8', 0, 0);
    this.addSign(['ATLÂNTICO SHOPPING'], { bg: null, fg: '#ffffff', neon: true }, b.cx, 14, b.cz - 20.3, 26, 3, Math.PI);
    for (const dx of [-24, 24]) this.addSign(['🛍  LOJAS · CINEMA · RESTAURAÇÃO'], { bg: '#7a1f3d', fg: '#fff' }, b.cx + dx * 0.9, 8, b.cz - 20.3, 14, 1.6, Math.PI);
    this._totem(b, ['ATLÂNTICO', 'SHOPPING'], { bg: '#7a1f3d', fg: '#ffffff' });
  }
  _gas(b) {
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(FOOT - 8, FOOT - 8), this.mats.asphalt);
    pad.rotation.x = -Math.PI / 2; pad.position.set(b.cx, 0.17, b.cz); this.root.add(pad);
    const f = this._face(b, b.main, 12);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(22, 0.8, 22), this.mats.white); canopy.position.set(f.x, 5.4, f.z); canopy.castShadow = true; this.root.add(canopy);
    const glowM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4dd, emissiveIntensity: 0.2 }); this.nightMats.push(glowM);
    const under = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), glowM); under.rotation.x = Math.PI / 2; under.position.set(f.x, 4.98, f.z); this.root.add(under);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(22.2, 0.4, 22.2), new THREE.MeshStandardMaterial({ color: 0x1b8f4a, roughness: 0.5 })); stripe.position.set(f.x, 5.6, f.z); this.root.add(stripe);
    for (const [dx, dz] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5, 0.5), this.mats.white); p.position.set(f.x + dx, 2.5, f.z + dz); this.root.add(p); }
    for (const dx of [-5, 5]) for (const dz of [-4, 4]) {
      const pump = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.6), new THREE.MeshStandardMaterial({ color: 0x1b8f4a, roughness: 0.5 }));
      pump.position.set(f.x + dx, 0.85 + 0.17, f.z + dz); pump.castShadow = true; this.root.add(pump);
    }
    const back = this._face(b, b.main, -14);
    this.addB(back.x, back.z, 14, 14, 4.6, '#f0f0ea', 1, 1);
    this.addSign([b.poi.toUpperCase(), 'GASOLINA 1,78 · GASÓLEO 1,62 · ⚡ 0,32'], { bg: '#1b8f4a', fg: '#ffffff' }, f.x, 6.4, f.z + (b.main === 'N' ? -11.2 : b.main === 'S' ? 11.2 : 0) , 18, 1.6, f.rot);
    this._totem(b, ['⛽ ' + b.poi.toUpperCase(), 'COMBUSTÍVEL · CARREGAMENTO'], { bg: '#1b8f4a', fg: '#ffffff' });
  }
  _university(b) {
    const f = this._face(b, b.main, 10);
    const along = b.main === 'N' || b.main === 'S';
    this.addB(f.x, f.z, along ? 52 : 20, along ? 20 : 52, 17, '#e6dcc6', 1, 0);
    const back = this._face(b, b.main, -18);
    this.addB(back.x, back.z, along ? 30 : 18, along ? 18 : 30, 12, '#dcd0b6', 1, 0);
    const colFace = this._face(b, b.main, 21.5);
    for (let k = -3; k <= 3; k++) {
      const p = this._face(b, b.main, 21.5, k * 5);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 12, 12), this.mats.white); c.position.set(p.x, 6, p.z); c.castShadow = true; this.root.add(c);
    }
    const pedi = new THREE.Mesh(new THREE.BoxGeometry(along ? 36 : 4, 1.4, along ? 4 : 36), this.mats.white); pedi.position.set(colFace.x, 12.7, colFace.z); this.root.add(pedi);
    const s = this._face(b, b.main, 23.6);
    this.addSign(['UNIVERSIDADE DE PORTO AZUL'], { bg: '#f3ede0', fg: '#3a2b18' }, s.x, 14.4, s.z, 22, 1.8, s.rot);
    this._totem(b, ['UNIVERSIDADE', 'DE PORTO AZUL'], { bg: '#2b3a67', fg: '#ffffff' });
  }
  _airportCenter() {
    const G = CFG.GRID; return { x: (7 - (G - 1) / 2) * S, z: (7 - (G - 1) / 2) * S };
  }
  _airport() {
    const c = this._airportCenter();
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(2 * S - RW - 8, 100), this.mats.asphalt);
    pad.rotation.x = -Math.PI / 2; pad.position.set(c.x, 0.17, c.z + 24); pad.receiveShadow = true; this.root.add(pad);
    this.addB(c.x, c.z - 42, 120, 28, 15, '#9fb3c2', 0, 0);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(128, 0.8, 40), this.mats.white); roof.position.set(c.x, 15.4, c.z - 46); roof.castShadow = true; this.root.add(roof);
    for (let x = -60; x <= 60; x += 15) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 15, 8), this.mats.white); p.position.set(c.x + x, 7.5, c.z - 64); this.root.add(p); }
    this.addSign(['✈  AEROPORTO DE PORTO AZUL'], { bg: null, fg: '#ffffff', neon: true }, c.x, 13, c.z - 56.2, 40, 3.2, Math.PI);
    this.addSign(['PARTIDAS  ↗'], { bg: '#0d2f57', fg: '#ffd84a' }, c.x - 30, 6, c.z - 56.2, 12, 1.8, Math.PI);
    this.addSign(['CHEGADAS ↘'], { bg: '#0d2f57', fg: '#ffd84a' }, c.x + 30, 6, c.z - 56.2, 12, 1.8, Math.PI);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.4, 36, 16), this.mats.white); tower.position.set(c.x + 52, 18, c.z + 30); tower.castShadow = true; this.root.add(tower);
    const cab = new THREE.Mesh(new THREE.CylinderGeometry(6, 4.5, 5, 16), this.mats.glass); cab.position.set(c.x + 52, 38.5, c.z + 30); this.root.add(cab);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 0.8, 16), this.mats.white); cap.position.set(c.x + 52, 41.4, c.z + 30); this.root.add(cap);
    // aviões estacionados
    this.planes = [];
    for (const [dx, dz, rot] of [[-35, 20, 0.2], [5, 30, -0.1]]) { const p = this._plane(); p.position.set(c.x + dx, 0, c.z + dz); p.rotation.y = rot; this.root.add(p); }
    // pista a este da cidade e avião que descola
    const half = this.net.half;
    const runway = new THREE.Mesh(new THREE.PlaneGeometry(700, 46), this.mats.asphalt);
    runway.rotation.x = -Math.PI / 2; runway.position.set(half + 420, 0.02, c.z + 20); this.root.add(runway);
    const lineM = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
    for (let x = 0; x < 700; x += 40) { const l = new THREE.Mesh(new THREE.PlaneGeometry(20, 1), lineM); l.rotation.x = -Math.PI / 2; l.position.set(half + 80 + x, 0.04, c.z + 20); this.root.add(l); }
    this.flyer = this._plane(); this.flyer.scale.setScalar(1.1); this.root.add(this.flyer);
    this.flyT = 0; this.runwayZ = c.z + 20; this.runwayX = half + 90;
  }
  _plane() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 32, 16), this.mats.white); body.rotation.x = Math.PI / 2; body.position.y = 3.2; g.add(body);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 10), this.mats.white); nose.scale.set(1, 1, 1.6); nose.position.set(0, 3.2, -16); g.add(nose);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(34, 0.4, 5), this.mats.metal); wing.position.set(0, 2.6, 0); g.add(wing);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 4), new THREE.MeshStandardMaterial({ color: 0x1e5aa8 })); tail.position.set(0, 7, 14); g.add(tail);
    const stab = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 3), this.mats.metal); stab.position.set(0, 4, 14.5); g.add(stab);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  update(dt) {
    if (!this.flyer) return;
    this.flyT = (this.flyT + dt) % 140;
    const t = this.flyT;
    if (t < 30) { const x = this.runwayX + (t < 18 ? 0.5 * 2.4 * t * t : 389 + (t - 18) * 70); const y = t < 18 ? 0 : (t - 18) * (t - 18) * 0.9; this.flyer.position.set(x, y, this.runwayZ); this.flyer.rotation.set(t < 18 ? 0 : Math.min(0.25, (t - 18) * 0.05), -Math.PI / 2, 0); this.flyer.visible = true; }
    else this.flyer.visible = false;
  }

  _oldBlock(b) {
    const PALV = ['#f2d9a0', '#e8b4a6', '#9fbedf', '#f4efe4', '#d9c7a1', '#c4dbc8', '#e9cf7a', '#5d86b5'];
    const dep = this._perimeter(b, { dep: [9, 12], ht: [9, 16], front: [5, 8], pal: PALV, type: 2, shop: 1, roof: 0.85, hb: 33.4 });
    this._courtyard(b, dep);
    // Sé: igreja com duas torres sineiras
    const f = this._face(b, 'E', 18);
    this.addB(b.cx + 14, b.cz, 18, 26, 17, '#ece4d2', 3, 0);
    for (const dz of [-10, 10]) { this.addB(b.cx + 23, b.cz + dz, 6, 6, 30, '#e6dcc7', 3, 0); this.roofs.push({ x: b.cx + 23, z: b.cz + dz, w: 6, d: 6, h: 4, y: 30 }); }
    this.addSign(['SÉ DE PORTO AZUL'], { bg: '#efe6d3', fg: '#5a3d1e' }, b.cx + 26.2, 12, b.cz, 12, 1.4, Math.PI / 2);
    void f;
    this.addSign(['VILA VELHA'], { bg: '#1f4a7a', fg: '#ffffff', border: '#ffffff' }, b.cx + 34, 3.5, b.cz - 22, 5, 1.2, Math.PI / 2, true);
  }
  _oldTownExtras() {
    const o = this.net.old; const r = this.rng;
    const PALV = ['#f2d9a0', '#e8b4a6', '#9fbedf', '#f4efe4', '#d9c7a1', '#e9cf7a', '#5d86b5'];
    // casas do lado de fora do quarteirão (ruas estreitas)
    const rowX = (x0, x1, z, dirZ) => { for (let x = x0; x < x1 - 4; ) { const f = rr(5, 8, r), d = rr(9, 12, r), h = rr(9, 15, r); this.addB(x + f / 2, z + dirZ * d / 2, f - 0.2, d, h, pick(PALV, r), 2, r() < 0.5 ? 1 : 0); if (r() < 0.8) this.roofs.push({ x: x + f / 2, z: z + dirZ * d / 2, w: f - 0.2, d, h: 2.2, y: h }); x += f; } };
    rowX(o.F2.x - 6, o.F1.x + 6, o.F1.z - RW / 2 - 1.6, -1);
    rowX(o.F2.x - 6, o.F1.x + 6, o.F3.z + RW / 2 + 1.6, 1);
    // castelo no monte
    const cx = o.F2.x - 82, cz = o.F2.z + S / 2;
    const hill = new THREE.Mesh(new THREE.CylinderGeometry(42, 64, 16, 24), this.mats.lawn); hill.position.set(cx, 8 - 0.06, cz); hill.receiveShadow = true; this.root.add(hill);
    const top = 16;
    for (const [dx, dz, w, d] of [[0, -22, 46, 3], [0, 22, 46, 3], [-22, 0, 3, 46], [22, 0, 3, 46]]) this.addB(cx + dx, cz + dz, w, d, 8, '#b8ad97', 3, 0, top);
    for (const [dx, dz] of [[-22, -22], [22, -22], [-22, 22], [22, 22]]) this.addB(cx + dx, cz + dz, 7, 7, 13, '#ada18a', 3, 0, top);
    this.addB(cx, cz, 12, 12, 20, '#b3a790', 3, 0, top);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6), this.mats.metal); pole.position.set(cx, top + 23, cz); this.root.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), new THREE.MeshStandardMaterial({ color: 0x1f4a9a, side: THREE.DoubleSide })); flag.position.set(cx + 1.5, top + 25, cz); this.root.add(flag); this.flag = flag;
    this.addSign(['🏰 CASTELO DE PORTO AZUL'], { bg: '#3a2b1a', fg: '#f3e2c0' }, o.F2.x - RW / 2 - 4, 3, cz + 10, 7, 1.3, Math.PI / 2, true);
    // ponte: tabuleiro, guardas, pilares e cabos
    const W = o.W, F1 = o.F1; const bx0 = F1.x + RW / 2, bx1 = W.x - RW / 2, bl = bx1 - bx0, bc = (bx0 + bx1) / 2;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(bl, 1.4, RW + 3), this.mats.stone); deck.position.set(bc, -0.69, W.z); deck.castShadow = true; this.root.add(deck);
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(bl, 1.0, 0.25), this.mats.metal); rail.position.set(bc, 0.5, W.z + s * (RW / 2 + 0.9)); this.root.add(rail);
    }
    const cableM = new THREE.LineBasicMaterial({ color: 0xc9cdd2 });
    for (const tx of [bx0 + bl * 0.28, bx0 + bl * 0.72]) {
      for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(1.8, 34, 1.8), new THREE.MeshStandardMaterial({ color: 0xb33a2e, roughness: 0.6 })); t.position.set(tx, 16, W.z + s * (RW / 2 + 1.6)); t.castShadow = true; this.root.add(t); }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, RW + 5), new THREE.MeshStandardMaterial({ color: 0xb33a2e })); beam.position.set(tx, 31, W.z); this.root.add(beam);
      for (const s of [-1, 1]) {
        const pts = [];
        for (let k = -12; k <= 12; k++) { const x = tx + k * 3.2; pts.push(new THREE.Vector3(x, 1, W.z + s * (RW / 2 + 1.6)), new THREE.Vector3(tx, 32, W.z + s * (RW / 2 + 1.6))); }
        this.root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), cableM));
      }
    }
    this.addSign(['PONTE ATLÂNTICA'], { bg: '#0d3b66', fg: '#ffffff' }, bx1 + 2, 4, W.z - RW / 2 - 2, 6, 1.2, Math.PI / 2, true);
  }
  _stadium(b) {
    const conc = new THREE.MeshStandardMaterial({ color: 0xd4d2cc, roughness: 0.9, side: THREE.DoubleSide });
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(31, 22, 17, 40, 1, true), conc); bowl.scale.z = 0.85; bowl.position.set(b.cx, 8.6, b.cz); bowl.castShadow = true; bowl.receiveShadow = true; this.root.add(bowl);
    const seats = new THREE.Mesh(new THREE.CylinderGeometry(29.5, 21, 15, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0x1e5aa8, roughness: 0.8, side: THREE.BackSide })); seats.scale.z = 0.85; seats.position.set(b.cx, 8.2, b.cz); this.root.add(seats);
    const [c, x] = M.makeCanvas(256, 160);
    x.fillStyle = '#2f7d3a'; x.fillRect(0, 0, 256, 160); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#2a7234' : '#33873f'; x.fillRect(i * 32, 0, 32, 160); }
    x.strokeStyle = '#fff'; x.lineWidth = 2; x.strokeRect(8, 8, 240, 144); x.beginPath(); x.moveTo(128, 8); x.lineTo(128, 152); x.stroke(); x.beginPath(); x.arc(128, 80, 20, 0, 7); x.stroke();
    const field = new THREE.Mesh(new THREE.PlaneGeometry(36, 24), new THREE.MeshStandardMaterial({ map: M.canvasTex(c, false) })); field.rotation.x = -Math.PI / 2; field.position.set(b.cx, 0.2, b.cz); this.root.add(field);
    const glow = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf4f7ff, emissiveIntensity: 0.2 }); this.nightMats.push(glow);
    for (const [dx, dz] of [[-27, -24], [27, -24], [-27, 24], [27, 24]]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 30, 8), this.mats.metal); p.position.set(b.cx + dx, 15, b.cz + dz); this.root.add(p);
      const l = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 0.5), glow); l.position.set(b.cx + dx * 0.97, 30, b.cz + dz * 0.97); l.lookAt(b.cx, 0, b.cz); this.root.add(l);
    }
    const f = this._face(b, b.main, HB + 0.5);
    this.addSign(['ESTÁDIO DO MAR'], { bg: '#0b2f63', fg: '#ffffff' }, f.x, 6, f.z, 16, 2, f.rot);
    this._totem(b, ['🏟️ ESTÁDIO DO MAR'], { bg: '#0b2f63', fg: '#ffffff' });
  }
  _beach() {
    const half = this.net.half; const r = this.rng;
    // palmeiras ao longo do passeio marítimo
    const fr = []; for (let k = 0; k < 7; k++) { const g = new THREE.BoxGeometry(0.5, 0.06, 3.2); g.translate(0, 0, 1.5); g.rotateX(0.35); g.rotateY((k / 7) * Math.PI * 2); fr.push(g); }
    const crownG = mergeGeometries(fr); crownG.translate(0, 7.2, 0);
    const trunkG = new THREE.CylinderGeometry(0.16, 0.26, 7.4, 7); trunkG.translate(0, 3.7, 0);
    const pts = []; for (let x = -half - 4; x < half + 20; x += 17) pts.push(x);
    const trunks = new THREE.InstancedMesh(trunkG, new THREE.MeshStandardMaterial({ color: 0x7a6248, roughness: 1 }), pts.length);
    const crowns = new THREE.InstancedMesh(crownG, new THREE.MeshStandardMaterial({ color: 0x3f7a35, roughness: 0.9, side: THREE.DoubleSide }), pts.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    pts.forEach((x, i) => { q.setFromAxisAngle(up, r() * 6); m.compose(new THREE.Vector3(x, 0.16, half + RW / 2 + 3.6), q, new THREE.Vector3(1, rr(0.85, 1.15, r), 1)); trunks.setMatrixAt(i, m); crowns.setMatrixAt(i, m); });
    trunks.castShadow = crowns.castShadow = true; this.root.add(trunks, crowns);
    // chapéus de sol
    const N = 70; const poleG = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 5); poleG.translate(0, 1.2, 0);
    const topG = new THREE.ConeGeometry(1.4, 0.6, 10); topG.translate(0, 2.5, 0);
    const poles = new THREE.InstancedMesh(poleG, this.mats.white, N), tops = new THREE.InstancedMesh(topG, new THREE.MeshStandardMaterial({ roughness: 0.8 }), N);
    const cols = [0xd9483b, 0x2f6fb5, 0xf2c53d, 0xffffff, 0x2a9d6f, 0xe07a2f]; const col = new THREE.Color();
    for (let i = 0; i < N; i++) { m.makeTranslation(rr(-half, half + 10, r), -0.03, rr(half + 30, half + 88, r)); poles.setMatrixAt(i, m); tops.setMatrixAt(i, m); tops.setColorAt(i, col.setHex(pick(cols, r))); }
    tops.castShadow = true; this.root.add(poles, tops);
    // bares de praia e torre de nadador-salvador
    for (const [x, name] of [[-210, 'BAR ONDA'], [-40, 'BAR SAL'], [130, 'SURF CLUB']]) {
      this.addB(x, half + 26, 10, 7, 3.6, '#e9dcc0', 2, 1);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 9), new THREE.MeshStandardMaterial({ color: 0x8a5a35 })); roof.position.set(x, 3.9, half + 26); this.root.add(roof);
      this.addSign([name], { bg: null, fg: '#ffd56a', neon: true }, x, 4.6, half + 21.4, 6, 1.2, Math.PI);
    }
    const tw = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2, 2.4), new THREE.MeshStandardMaterial({ color: 0xd9483b })); tw.position.set(60, 3.6, half + 60); this.root.add(tw);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.6, 0.15), this.mats.white); l.position.set(60 + dx, 1.3, half + 60 + dz); this.root.add(l); }
  }

  _buildingMeshes() {
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const n = this.bld.length;
    const params = new Float32Array(n * 3);
    const mesh = new THREE.InstancedMesh(geo, this.mats.bld, n);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    this.bld.forEach((b, i) => {
      m.makeScale(b.w, b.h, b.d); m.setPosition(b.x, b.y + 0.16, b.z);
      mesh.setMatrixAt(i, m); mesh.setColorAt(i, c.set(b.color));
      params[i * 3] = b.type; params[i * 3 + 1] = b.seed; params[i * 3 + 2] = b.shop;
    });
    geo.setAttribute('aParams', new THREE.InstancedBufferAttribute(params, 3));
    mesh.castShadow = true; mesh.receiveShadow = true;
    this.root.add(mesh); this.buildingMesh = mesh;
    // telhados de duas águas
    const pg = new THREE.BufferGeometry();
    const v = [-0.5, 0, -0.5, 0.5, 0, -0.5, 0, 1, -0.5, -0.5, 0, 0.5, 0, 1, 0.5, 0.5, 0, 0.5,
      -0.5, 0, -0.5, 0, 1, -0.5, 0, 1, 0.5, -0.5, 0, -0.5, 0, 1, 0.5, -0.5, 0, 0.5,
      0.5, 0, -0.5, 0.5, 0, 0.5, 0, 1, 0.5, 0.5, 0, -0.5, 0, 1, 0.5, 0, 1, -0.5];
    pg.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); pg.computeVertexNormals();
    const rm = new THREE.InstancedMesh(pg, new THREE.MeshStandardMaterial({ color: 0xb4583a, roughness: 0.85, side: THREE.DoubleSide }), this.roofs.length);
    const q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    this.roofs.forEach((r, i) => {
      // cumeeira ao longo do lado maior
      const rot = r.w > r.d ? Math.PI / 2 : 0;
      q.setFromAxisAngle(up, rot); p.set(r.x, r.y + 0.16, r.z);
      s.set(rot ? r.d : r.w, r.h, rot ? r.w : r.d);
      rm.setMatrixAt(i, m.compose(p, q, s));
      rm.setColorAt(i, c.setHSL(0.04 + this.rng() * 0.03, 0.5, 0.36 + this.rng() * 0.1));
    });
    rm.castShadow = true; rm.receiveShadow = true; this.root.add(rm);
  }

  _lamps() {
    const n = this.net; const list = [];
    for (const e of n.edges) {
      if (e.id > e.rev) continue;
      let k = 0;
      for (let s = 10; s < e.len - 6; s += 25) {
        const side = k++ % 2 ? 1 : -1;
        const A = n.nodes[e.a]; const base = RW / 2 + s;
        const x = A.x + e.d.x * base, z = A.z + e.d.z * base;
        list.push({ x: x + e.r.x * side * (RW / 2 + 0.6), z: z + e.r.z * side * (RW / 2 + 0.6), hx: x + e.r.x * side * (RW / 2 - 1.0), hz: z + e.r.z * side * (RW / 2 - 1.0), px: x + e.r.x * side * (RW / 2 - 2.2), pz: z + e.r.z * side * (RW / 2 - 2.2), rx: e.r.x * side, rz: e.r.z * side });
      }
    }
    const poleG = new THREE.CylinderGeometry(0.07, 0.11, 7.2, 6); poleG.translate(0, 3.6, 0);
    const poles = new THREE.InstancedMesh(poleG, this.mats.dark, list.length);
    const headG = new THREE.BoxGeometry(0.42, 0.14, 1.9);
    this.lampMat = new THREE.MeshStandardMaterial({ color: 0x333333, emissive: 0xffc98a, emissiveIntensity: 0 });
    const heads = new THREE.InstancedMesh(headG, this.lampMat, list.length);
    const poolG = new THREE.PlaneGeometry(13, 13); poolG.rotateX(-Math.PI / 2);
    this.poolMat = new THREE.MeshBasicMaterial({ map: M.makeGlowTexture('rgba(255,190,120,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    const pools = new THREE.InstancedMesh(poolG, this.poolMat, list.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
    list.forEach((l, i) => {
      poles.setMatrixAt(i, m.makeTranslation(l.x, 0.16, l.z));
      q.setFromAxisAngle(up, Math.atan2(l.rx, l.rz));
      heads.setMatrixAt(i, m.compose(new THREE.Vector3((l.x + l.hx) / 2, 7.3, (l.z + l.hz) / 2), q, one));
      pools.setMatrixAt(i, m.makeTranslation(l.px, 0.05, l.pz));
    });
    poles.castShadow = this.q !== 'low';
    pools.renderOrder = 2;
    this.root.add(poles, heads, pools);
    this.lampList = list;
  }

  _trafficLights() {
    const n = this.net; const heads = [];
    for (const nd of n.nodes) {
      if (!nd.exists || !n.hasLight(nd.id)) continue;
      for (const eid of nd.inc) {
        const e = n.edges[eid];
        const x = nd.x - e.d.x * (RW / 2 + 0.9) + e.r.x * (RW / 2 + 0.6);
        const z = nd.z - e.d.z * (RW / 2 + 0.9) + e.r.z * (RW / 2 + 0.6);
        heads.push({ node: nd.id, axis: e.axis, x, z, rot: Math.atan2(-e.d.x, -e.d.z) });
      }
    }
    const poleG = new THREE.CylinderGeometry(0.07, 0.08, 3.4, 6); poleG.translate(0, 1.7, 0);
    const boxG = new THREE.BoxGeometry(0.34, 1.0, 0.26);
    const lampG = new THREE.SphereGeometry(0.11, 10, 8);
    const poles = new THREE.InstancedMesh(poleG, this.mats.dark, heads.length);
    const boxes = new THREE.InstancedMesh(boxG, new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.5 }), heads.length);
    const lamps = new THREE.InstancedMesh(lampG, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), heads.length * 3);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
    heads.forEach((h, i) => {
      poles.setMatrixAt(i, m.makeTranslation(h.x, 0.16, h.z));
      q.setFromAxisAngle(up, h.rot);
      boxes.setMatrixAt(i, m.compose(v.set(h.x, 3.5, h.z), q, one));
      for (let k = 0; k < 3; k++) {
        const off = new THREE.Vector3(0, 0.3 - k * 0.3, 0.14).applyQuaternion(q);
        lamps.setMatrixAt(i * 3 + k, m.compose(v.set(h.x + off.x, 3.5 + off.y, h.z + off.z), q, one));
        lamps.setColorAt(i * 3 + k, new THREE.Color(0x111111));
      }
    });
    this.root.add(poles, boxes, lamps);
    this.tlHeads = heads; this.tlLamps = lamps; this._tlTimer = 0;
  }
  updateLights(dt) {
    this._tlTimer -= dt; if (this._tlTimer > 0) return; this._tlTimer = 0.2;
    const n = this.net; const c = new THREE.Color();
    const RED = new THREE.Color(4, 0.15, 0.1), YEL = new THREE.Color(4, 2.4, 0.1), GRN = new THREE.Color(0.1, 3.5, 1.2), OFF = new THREE.Color(0.06, 0.06, 0.06);
    this.tlHeads.forEach((h, i) => {
      const L = n.light(h.node, h.axis);
      this.tlLamps.setColorAt(i * 3, L === 'R' ? RED : OFF);
      this.tlLamps.setColorAt(i * 3 + 1, L === 'Y' ? YEL : OFF);
      this.tlLamps.setColorAt(i * 3 + 2, L === 'G' ? GRN : OFF);
    });
    void c;
    this.tlLamps.instanceColor.needsUpdate = true;
  }

  _treesMesh() {
    const trunkG = new THREE.CylinderGeometry(0.14, 0.22, 2.6, 6); trunkG.translate(0, 1.3, 0);
    const crownG = new THREE.IcosahedronGeometry(1.7, 1); crownG.translate(0, 3.7, 0);
    const n = this.trees.length;
    const trunks = new THREE.InstancedMesh(trunkG, new THREE.MeshStandardMaterial({ color: 0x5a4330, roughness: 1 }), n);
    const crowns = new THREE.InstancedMesh(crownG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }), n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), c = new THREE.Color();
    this.trees.forEach((t, i) => {
      q.setFromAxisAngle(up, this.rng() * 6.28); p.set(t.x, 0.16, t.z); s.set(t.s, t.s * rr(0.9, 1.2, this.rng), t.s);
      m.compose(p, q, s); trunks.setMatrixAt(i, m); crowns.setMatrixAt(i, m);
      crowns.setColorAt(i, c.setHSL(0.22 + this.rng() * 0.08, 0.45 + this.rng() * 0.2, 0.24 + this.rng() * 0.1));
    });
    trunks.castShadow = crowns.castShadow = this.q === 'high';
    crowns.receiveShadow = true;
    this.root.add(trunks, crowns);
  }

  // ---------- locais de recolha/destino ----------
  _nodeNear(x, z) {
    for (const n of this.net.nodes) if (n.exists && Math.abs(n.x - x) < 1 && Math.abs(n.z - z) < 1) return n.id;
    return -1;
  }
  _sideEdge(b, side) {
    const n = this.net, k = S / 2;
    const nw = this._nodeNear(b.cx - k, b.cz - k), ne = this._nodeNear(b.cx + k, b.cz - k), sw = this._nodeNear(b.cx - k, b.cz + k), se = this._nodeNear(b.cx + k, b.cz + k);
    const eb = (a, c) => (a < 0 || c < 0 ? -1 : n.edgeBetween(a, c));
    if (side === 'N') return eb(nw, ne);
    if (side === 'S') return eb(se, sw);
    if (side === 'W') return eb(sw, nw);
    return eb(ne, se);
  }
  streetOf(e) {
    if (e.name) return e.name;
    const a = this.net.nodes[e.a];
    return e.axis === 'EW' ? STREETS_EW[a.j] : STREETS_NS[a.i];
  }
  _addLoc(b, side, name, kind, district, sFrac = null) {
    const eid = this._sideEdge(b, side); if (eid < 0) return null;
    const e = this.net.edges[eid];
    const s = e.len * (sFrac ?? rr(0.4, 0.7, this.rng));
    const pos = this.net.edgePoint(e, s, CFG.CURB, new THREE.Vector3());
    const walk = this.net.edgePoint(e, s, RW / 2 + 1.8, new THREE.Vector3());
    const street = this.streetOf(e);
    const num = ri(2, 240, this.rng);
    const loc = { id: this.locations.length, name: name || `${street}, ${num}`, street, address: `${street}, ${num}`, kind, district, edge: eid, s, pos, walk, block: b.idx };
    this.locations.push(loc);
    return loc;
  }
  _addLocEdge(eid, name, kind, district, sFrac) {
    if (eid < 0) return null;
    const e = this.net.edges[eid]; const s = e.len * sFrac;
    const pos = this.net.edgePoint(e, s, CFG.CURB, new THREE.Vector3());
    const walk = this.net.edgePoint(e, s, RW / 2 + 1.8, new THREE.Vector3());
    const street = this.streetOf(e);
    const loc = { id: this.locations.length, name, street, address: street, kind, district, edge: eid, s, pos, walk, block: -1 };
    this.locations.push(loc); return loc;
  }
  _locations() {
    const sides = ['N', 'E', 'S', 'W'];
    for (const b of this.blocks) {
      if (b.type === 'A') continue;
      if (b.poi) b.mainLoc = this._addLoc(b, b.main, b.poi, 'poi', b.type, 0.55);
      const extra = b.type === 'R' ? 2 : b.type === 'P' || b.type === 'G' ? 0 : 1;
      const others = sides.filter((s) => s !== b.main).sort(() => this.rng() - 0.5);
      for (let k = 0; k < extra; k++) this._addLoc(b, others[k], null, 'addr', b.type === 'G' || b.type === 'P' ? 'R' : b.type);
    }
    const a1 = this.block(6, 6), a2 = this.block(6, 7);
    this.airportDep = this._addLoc(a1, 'N', 'Aeroporto — Partidas', 'poi', 'A', 0.5);
    this.airportArr = this._addLoc(a2, 'W', 'Aeroporto — Chegadas', 'poi', 'A', 0.5);
    // Vila Velha, castelo, praia
    const ob = this.blocks.find((b) => b.type === 'V');
    const ol = this._addLoc(ob, 'S', 'Largo do Pelourinho', 'poi', 'V', 0.5); if (ol) ol.name = 'Largo do Pelourinho';
    this._addLoc(ob, 'N', 'Tasca da Vila Velha', 'poi', 'V', 0.45);
    const o = this.net.old;
    this._addLocEdge(this.net.edgeBetween(o.F2.id, o.F3.id), 'Castelo de Porto Azul', 'poi', 'V', 0.5);
    const beachNames = ['Praia Azul — Bar Onda', 'Praia dos Pescadores', 'Clube de Surf do Mar', 'Passeio Marítimo', 'Bar Sal — Praia'];
    for (let i = 0; i < 5; i++) {
      const eid = this.net.edgeBetween(this.net.nodeAt(i, 8).id, this.net.nodeAt(i + 1, 8).id);
      this._addLocEdge(eid, beachNames[i], 'poi', 'B', 0.5);
    }
    this.stadium = this.locations.find((l) => l.district === 'E');
    this.gasStations = this.locations.filter((l) => l.district === 'G' && l.kind === 'poi');
    this.home = this.locations.find((l) => l.district === 'R' && this.blocks[l.block].bi === 1 && this.blocks[l.block].bj === 6) || this.locations[0];
  }

  // obras: barreira, cones e aviso no início de cada rua cortada
  setWorks(ids) {
    if (this.worksGroup) { this.root.remove(this.worksGroup); this.worksGroup.traverse((o) => { if (o.isMesh) o.geometry.dispose(); }); }
    const g = new THREE.Group(); this.worksGroup = g; this.root.add(g);
    if (!this._worksMat) {
      const [c, x] = M.makeCanvas(128, 32); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#d42a20'; x.beginPath(); x.moveTo(i * 16, 32); x.lineTo(i * 16 + 16, 0); x.lineTo(i * 16 + 32, 0); x.lineTo(i * 16 + 16, 32); x.fill(); }
      this._worksMat = new THREE.MeshStandardMaterial({ map: M.canvasTex(c, false), emissive: 0x331100, roughness: 0.6 });
      this._coneMat = new THREE.MeshStandardMaterial({ color: 0xff6a1a, emissive: 0x401a00, roughness: 0.6 });
    }
    const v = new THREE.Vector3();
    for (const id of ids) {
      const e = this.net.edges[id]; const rot = Math.atan2(-e.d.x, -e.d.z);
      this.net.edgePoint(e, 2.5, CFG.LANE, v);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.9, 0.3), this._worksMat); bar.position.set(v.x, 0.75, v.z); bar.rotation.y = rot; bar.castShadow = true; g.add(bar);
      for (const sx of [-2.6, 2.6]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), this.mats.dark); l.position.set(v.x + e.r.x * sx, 0.6, v.z + e.r.z * sx); g.add(l); }
      for (let k = 0; k < 6; k++) { this.net.edgePoint(e, 6 + k * 4, CFG.LANE + (k % 2 ? 1.4 : -1.4), v); const cn = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 10), this._coneMat); cn.position.set(v.x, 0.36, v.z); g.add(cn); }
      this.net.edgePoint(e, 2.0, CFG.LANE + 3.6, v);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), new THREE.MeshStandardMaterial({ map: M.makeSignTexture(['⚠ OBRAS', 'RUA CORTADA'], { bg: '#ffd21f', fg: '#111', w: 256, h: 150, border: '#d42a20' }), side: THREE.DoubleSide }));
      sign.position.set(v.x, 2.1, v.z); sign.rotation.y = rot; g.add(sign);
    }
  }

  setNight(night, wet) {
    this.lampMat.emissiveIntensity = night * 3.2;
    this.poolMat.opacity = night * 0.55;
    for (const m of this.signMats) m.emissiveIntensity = (m.userData.neon ? 0.6 : 0.25) + night * (m.userData.neon ? 2.2 : 1.0);
    for (const m of this.nightMats) m.emissiveIntensity = 0.2 + night * 1.8;
    for (const m of this.wetMats) {
      m.roughness = m.userData.baseRough * (1 - wet * 0.72);
      m.color.copy(m.userData.baseColor).multiplyScalar(1 - wet * 0.35);
    }
    this.mats.water.color.setRGB(0.11 * (1 - night * 0.7), 0.29 * (1 - night * 0.7), 0.4 * (1 - night * 0.7));
  }
}
