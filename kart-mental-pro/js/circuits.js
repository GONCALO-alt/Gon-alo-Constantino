/* KART MENTAL PRO — circuitos: dados, geometria e desenho em SVG. */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;

  /*
   * Um circuito é uma lista de segmentos, a partir da meta, no sentido da corrida:
   *   { t:'S', l: comprimento, zone?: 'ultrapassagem' }
   *   { t:'C', d:'L'|'R', a: graus, r: raio, brake: 0|1|2 }   (0 sem travagem, 1 média, 2 forte)
   * O traçado fecha-se automaticamente até à meta.
   */
  const BUILTIN = [
    {
      id: 'alfa',
      name: 'Circuito Alfa',
      desc: 'Traçado fluido, ideal para começar.',
      segs: [
        { t: 'S', l: 170, zone: 'ultrapassagem' },
        { t: 'C', d: 'R', a: 90, r: 30, brake: 2 },
        { t: 'S', l: 100 },
        { t: 'C', d: 'R', a: 90, r: 30, brake: 1 },
        { t: 'S', l: 60 },
        { t: 'C', d: 'R', a: 90, r: 20, brake: 1 },
        { t: 'S', l: 20 },
        { t: 'C', d: 'L', a: 90, r: 20, brake: 0 },
        { t: 'S', l: 30 },
        { t: 'C', d: 'L', a: 90, r: 20, brake: 0 },
        { t: 'S', l: 20 },
        { t: 'C', d: 'R', a: 90, r: 20, brake: 1 },
        { t: 'C', d: 'R', a: 90, r: 30, brake: 0 },
        { t: 'S', l: 100 },
        { t: 'C', d: 'R', a: 90, r: 30, brake: 1 },
      ],
    },
    {
      id: 'beta',
      name: 'Circuito Beta',
      desc: 'Com gancho apertado e um "S" técnico.',
      segs: [
        { t: 'S', l: 180, zone: 'ultrapassagem' },
        { t: 'C', d: 'R', a: 90, r: 35, brake: 1 },
        { t: 'S', l: 60 },
        { t: 'C', d: 'R', a: 180, r: 25, brake: 2 },
        { t: 'S', l: 30 },
        { t: 'C', d: 'L', a: 90, r: 20, brake: 0 },
        { t: 'S', l: 80 },
        { t: 'C', d: 'L', a: 90, r: 20, brake: 1 },
        { t: 'S', l: 60 },
        { t: 'C', d: 'R', a: 90, r: 25, brake: 1 },
        { t: 'S', l: 20 },
        { t: 'C', d: 'R', a: 90, r: 30, brake: 0 },
        { t: 'S', l: 90 },
        { t: 'C', d: 'R', a: 90, r: 30, brake: 1 },
      ],
    },
    {
      id: 'gama',
      name: 'Circuito Gama',
      desc: 'Rápido com chicane e gancho final.',
      segs: [
        { t: 'S', l: 180, zone: 'ultrapassagem' },
        { t: 'C', d: 'R', a: 180, r: 30, brake: 2 },
        { t: 'S', l: 70 },
        { t: 'C', d: 'L', a: 45, r: 25, brake: 0 },
        { t: 'C', d: 'R', a: 45, r: 25, brake: 1 },
        { t: 'S', l: 50 },
        { t: 'C', d: 'L', a: 90, r: 25, brake: 1 },
        { t: 'S', l: 40 },
        { t: 'C', d: 'R', a: 90, r: 25, brake: 0 },
        { t: 'S', l: 30 },
        { t: 'C', d: 'R', a: 90, r: 25, brake: 1 },
        { t: 'S', l: 60, zone: 'ultrapassagem' },
        { t: 'C', d: 'R', a: 90, r: 20, brake: 2 },
        { t: 'C', d: 'L', a: 90, r: 30, brake: 0 },
        { t: 'C', d: 'R', a: 90, r: 30, brake: 1 },
      ],
    },
  ];
  BUILTIN.forEach((c) => (c.group = 'kart'));

  /* Traçados reais (Fórmula 1 e Portugal), em metros. */
  const REAL = (window.KMP_REAL_TRACKS || []).map((t) =>
    Object.assign({}, t, {
      real: true,
      desc: `${t.place} · ${(t.length / 1000).toFixed(3).replace('.', ',')} km`,
    })
  );

  const C = (KMP.circuits = {});
  C.GROUPS = [
    ['pt', 'Portugal'],
    ['f1', 'Fórmula 1'],
    ['kart', 'Karting (traçados de treino)'],
    ['mine', 'Os meus circuitos'],
  ];
  C.all = () =>
    REAL.filter((c) => c.group === 'pt')
      .concat(REAL.filter((c) => c.group === 'f1'), BUILTIN)
      .concat((KMP.store.state.circuits || []).map((c) => Object.assign({ custom: true, group: 'mine' }, c)));
  C.get = (id) => C.all().find((c) => c.id === id);

  C.brakeName = ['Sem travagem', 'Travagem média', 'Travagem forte'];
  const kindOf = (a, r) => (a >= 140 ? 'Gancho' : a < 100 && r >= 110 ? 'Curva rápida' : 'Curva média');

  /* ---------- Traçado desenhado com segmentos (karting e circuitos personalizados) ---------- */
  const fromSegments = (circ) => {
    let x = 0;
    let y = 0;
    let h = 0; // direção em radianos (0 = este; ecrã com y para baixo)
    const pts = [[x, y]];
    const corners = [];
    const straights = [];
    circ.segs.forEach((s) => {
      const i0 = pts.length - 1;
      if (s.t === 'S') {
        const n = Math.max(2, Math.round(s.l / 10));
        for (let k = 1; k <= n; k++) pts.push([x + (Math.cos(h) * (s.l * k)) / n, y + (Math.sin(h) * (s.l * k)) / n]);
        x += Math.cos(h) * s.l;
        y += Math.sin(h) * s.l;
        straights.push({ i0, i1: pts.length - 1, zone: !!s.zone });
      } else {
        const sg = s.d === 'R' ? 1 : -1;
        const a = (s.a * Math.PI) / 180;
        const cx = x + Math.cos(h + (sg * Math.PI) / 2) * s.r;
        const cy = y + Math.sin(h + (sg * Math.PI) / 2) * s.r;
        const a0 = Math.atan2(y - cy, x - cx);
        const n = Math.max(4, Math.round(s.a / 8));
        for (let k = 1; k <= n; k++) {
          const ang = a0 + (sg * a * k) / n;
          pts.push([cx + Math.cos(ang) * s.r, cy + Math.sin(ang) * s.r]);
        }
        const ae = a0 + sg * a;
        x = cx + Math.cos(ae) * s.r;
        y = cy + Math.sin(ae) * s.r;
        h += sg * a;
        corners.push({ i0, i1: pts.length - 1, d: s.d, a: s.a, r: s.r, brake: s.brake || 0, kind: s.a >= 150 ? 'Gancho' : s.a >= 80 ? 'Curva média' : 'Curva rápida' });
      }
    });
    // Fecho até à meta com uma curva de Bézier suave.
    const gap = Math.hypot(x, y);
    if (gap > 1) {
      const k = gap * 0.4;
      const p1 = [x + Math.cos(h) * k, y + Math.sin(h) * k];
      const p2 = [-k, 0];
      for (let t = 1; t <= 12; t++) {
        const u = t / 12;
        pts.push([
          (1 - u) ** 3 * x + 3 * (1 - u) ** 2 * u * p1[0] + 3 * (1 - u) * u * u * p2[0],
          (1 - u) ** 3 * y + 3 * (1 - u) ** 2 * u * p1[1] + 3 * (1 - u) * u * u * p2[1],
        ]);
      }
    }
    return { pts, corners, straights, estimated: false };
  };

  /* ---------- Traçado real: curvas detetadas pela curvatura ---------- */
  const fromPath = (circ) => {
    const P = circ.pts.concat([circ.pts[0]]);
    // Reamostrar a cada 5 m.
    const DS = 5;
    const S = [];
    for (let i = 0; i < P.length - 1; i++) {
      const [x0, y0] = P[i];
      const [x1, y1] = P[i + 1];
      const L = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.max(1, Math.round(L / DS));
      for (let k = 0; k < n; k++) S.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
    }
    const N = S.length;
    const at = (i) => S[((i % N) + N) % N];
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const K = 4;
    const head = S.map((_, i) => {
      const a = at(i - K);
      const b = at(i + K);
      return Math.atan2(b[1] - a[1], b[0] - a[0]);
    });
    const dth = head.map((hh, i) => wrap(head[(i + 1) % N] - hh));
    // Curvatura suavizada.
    const W = 3;
    const kap = dth.map((_, i) => {
      let s = 0;
      for (let k = -W; k <= W; k++) s += dth[(i + k + N) % N];
      return s / (2 * W + 1) / DS;
    });
    const TH = 1 / 230; // raio < 230 m
    const runs = [];
    let cur = null;
    for (let i = 0; i < N; i++) {
      const sg = kap[i] > TH ? 1 : kap[i] < -TH ? -1 : 0;
      if (sg && cur && cur.sg === sg && i - cur.i1 <= 6) cur.i1 = i;
      else if (sg) {
        cur = { sg, i0: i, i1: i };
        runs.push(cur);
      }
    }
    // Juntar a última curva com a primeira se atravessar a meta.
    if (runs.length > 1 && runs[0].i0 <= 2 && runs.at(-1).i1 >= N - 3 && runs[0].sg === runs.at(-1).sg) {
      runs.at(-1).i1 = runs[0].i1 + N;
      runs.shift();
    }
    const corners = [];
    runs.forEach((r) => {
      let sum = 0;
      let kmax = 0;
      for (let i = r.i0; i <= r.i1; i++) {
        sum += dth[i % N];
        kmax = Math.max(kmax, Math.abs(kap[i % N]));
      }
      const a = Math.abs((sum * 180) / Math.PI);
      if (a < 22) return;
      const rad = Math.round(1 / kmax);
      corners.push({ i0: r.i0, i1: r.i1, d: r.sg > 0 ? 'R' : 'L', a: Math.round(a), r: rad, kind: kindOf(a, rad) });
    });
    // Retas entre curvas e travagens estimadas pela velocidade de chegada.
    const straights = corners.map((c, k) => {
      const prev = corners[(k - 1 + corners.length) % corners.length];
      let i0 = prev.i1;
      if (k === 0) i0 = prev.i1 - N;
      return { i0, i1: c.i0, len: (c.i0 - i0) * DS };
    });
    corners.forEach((c, k) => {
      const L = straights[k].len;
      c.brake = (L >= 350 && (c.r < 110 || c.a >= 80)) || (L >= 200 && c.a >= 140) ? 2 : (L >= 150 && c.r < 160) || c.a >= 85 ? 1 : 0;
    });
    const longest = straights.reduce((m, s) => (s.len > m.len ? s : m), straights[0]);
    straights.forEach((s) => (s.zone = s === longest));
    return { pts: S, corners, straights, estimated: true, idx: (i) => ((i % N) + N) % N };
  };

  const cache = new Map();
  /** Pontos, curvas numeradas e retas, em unidades de desenho (pontos) com distâncias em metros. */
  C.geometry = (circ) => {
    if (circ.real && cache.has(circ.id)) return cache.get(circ.id);
    const raw = circ.real ? fromPath(circ) : fromSegments(circ);
    const pts = raw.pts;
    const idx = raw.idx || ((i) => Math.max(0, Math.min(pts.length - 1, i)));
    // Comprimento acumulado ao longo do traçado.
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const len = cum.at(-1) + (circ.real ? Math.hypot(pts[0][0] - pts.at(-1)[0], pts[0][1] - pts.at(-1)[1]) : 0);
    const dist = (i) => (i < 0 ? cum[idx(i)] - len : i >= pts.length ? cum[idx(i)] + len : cum[i]);
    const headAt = (i) => {
      const a = pts[idx(i)];
      const b = pts[idx(i + 2)];
      return Math.atan2(b[1] - a[1], b[0] - a[0]);
    };
    const corners = raw.corners.map((c, k) =>
      Object.assign(c, {
        n: k + 1,
        at: dist(c.i0),
        end: dist(c.i1),
        startPt: pts[idx(c.i0)],
        startH: headAt(c.i0),
        apex: pts[idx(Math.round((c.i0 + c.i1) / 2))],
      })
    );
    const straights = raw.straights.map((s) => {
      const l = Math.round(dist(s.i1) - dist(s.i0));
      const before = corners.find((c) => c.i0 >= s.i1) || corners[0];
      return { i0: s.i0, i1: s.i1, l, zone: s.zone, before };
    });
    corners.forEach((c) => {
      const s = straights.find((x) => x.before === c && x.i1 === c.i0);
      c.straight = s ? s.l : 0;
      c.zoneBefore = !!(s && s.zone);
    });
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const box = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    const g = { pts, all: pts, corners, straights, len, box, idx, estimated: raw.estimated, closing: [] };
    if (circ.real) cache.set(circ.id, g);
    return g;
  };

  /** SVG do circuito. opts: { labels, brakes, zones, plain, dot } */
  C.svg = (circ, opts) => {
    opts = Object.assign({ labels: true, brakes: true, zones: true }, opts || {});
    const g = C.geometry(circ);
    // Escala visual: os traçados reais têm quilómetros; os de karting, centenas de metros.
    const size = Math.max(g.box.x1 - g.box.x0, g.box.y1 - g.box.y0);
    const u = size / 260; // 1 "unidade de desenho" proporcional ao tamanho
    const pad = (circ.real ? 32 : 34) * u;
    const vb = [g.box.x0 - pad, g.box.y0 - pad, g.box.x1 - g.box.x0 + pad * 2, g.box.y1 - g.box.y0 + pad * 2].map((v) => v.toFixed(1));
    const d = (arr) => arr.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const full = d(g.pts) + ' Z';
    let extra = '';
    if (opts.zones && !opts.plain) {
      g.straights.forEach((s) => {
        if (!s.zone) return;
        const a = s.i0 + Math.round((s.i1 - s.i0) * 0.2);
        const b = s.i0 + Math.round((s.i1 - s.i0) * 0.8);
        const seg = [];
        for (let i = a; i <= b; i++) seg.push(g.pts[g.idx(i)]);
        if (seg.length > 1) extra += `<path d="${d(seg)}" fill="none" stroke="#00d26a" stroke-width="${(5 * u).toFixed(1)}" stroke-linecap="round" opacity=".85"/>`;
      });
    }
    if (opts.brakes && !opts.plain) {
      g.corners.forEach((c) => {
        if (!c.brake) return;
        const [sx, sy] = c.startPt;
        const h = c.startH;
        const nx = -Math.sin(h);
        const ny = Math.cos(h);
        const bars = c.brake === 2 ? 3 : 2;
        for (let k = 0; k < bars; k++) {
          const bx = sx - Math.cos(h) * (6 + k * 7) * u;
          const by = sy - Math.sin(h) * (6 + k * 7) * u;
          extra += `<line x1="${(bx - nx * 7 * u).toFixed(1)}" y1="${(by - ny * 7 * u).toFixed(1)}" x2="${(bx + nx * 7 * u).toFixed(1)}" y2="${(by + ny * 7 * u).toFixed(1)}" stroke="${c.brake === 2 ? '#e10600' : '#ff9500'}" stroke-width="${(3 * u).toFixed(1)}"/>`;
        }
      });
    }
    // Meta (xadrez) e seta do sentido, rodadas segundo a direção de partida.
    const p0 = g.pts[0];
    const p1 = g.pts[g.idx(2)];
    const h0 = (Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI;
    const flag = `<g transform="translate(${p0[0]} ${p0[1]}) rotate(${h0.toFixed(1)}) scale(${u.toFixed(3)})"><rect x="-3" y="-9" width="6" height="18" fill="#fff"/><rect x="-3" y="-9" width="3" height="3" fill="#111"/><rect x="0" y="-6" width="3" height="3" fill="#111"/><rect x="-3" y="-3" width="3" height="3" fill="#111"/><rect x="0" y="0" width="3" height="3" fill="#111"/><rect x="-3" y="3" width="3" height="3" fill="#111"/><rect x="0" y="6" width="3" height="3" fill="#111"/>${opts.plain ? '' : '<path d="M 30 -16 l 10 4 l -10 4" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>'}</g>`;
    let labels = '';
    if (opts.labels && !opts.plain) {
      g.corners.forEach((c) => {
        // Número do lado de fora da curva.
        const [ax, ay] = c.apex;
        const out = c.d === 'R' ? -1 : 1; // lado de fora: esquerda numa curva à direita
        const hm = c.startH + ((c.d === 'R' ? 1 : -1) * (c.a * Math.PI)) / 360;
        const lx = ax - Math.sin(hm) * out * (circ.real ? 20 : 16) * u;
        const ly = ay + Math.cos(hm) * out * (circ.real ? 20 : 16) * u;
        const k = circ.real ? 1.35 : 1;
        labels += `<g><circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="${(8.5 * k * u).toFixed(1)}" fill="#e10600"/><text x="${lx.toFixed(1)}" y="${(ly + 3.8 * k * u).toFixed(1)}" text-anchor="middle" font-size="${(10.5 * k * u).toFixed(1)}" font-weight="800" fill="#fff" font-family="-apple-system,Arial">${c.n}</text></g>`;
      });
    }
    const w = circ.real ? 7 * u : 16 * u;
    return {
      geo: g,
      html: `<svg class="circ-svg" viewBox="${vb.join(' ')}" preserveAspectRatio="xMidYMid meet">
        <path d="${full}" fill="none" stroke="#2a2b31" stroke-width="${(w * 1.4).toFixed(1)}" stroke-linejoin="round"/>
        <path d="${full}" fill="none" stroke="#4a4b55" stroke-width="${w.toFixed(1)}" stroke-linejoin="round"/>
        <path d="${full}" class="circ-line" fill="none" stroke="${opts.plain ? '#8b8d98' : '#f5f5f7'}" stroke-width="${(2 * u).toFixed(1)}" stroke-dasharray="${opts.plain ? '0' : (6 * u).toFixed(1)}" stroke-linejoin="round" opacity=".65"/>
        ${extra}${flag}${labels}
        ${opts.dot ? `<circle class="circ-dot" r="${(7 * u).toFixed(1)}" fill="#00d26a" stroke="#fff" stroke-width="${(2 * u).toFixed(1)}" cx="${p0[0]}" cy="${p0[1]}"/>` : ''}
      </svg>`,
    };
  };

  /** Lista de botões de circuitos agrupados (Portugal, F1, karting, os meus). */
  C.pickerHtml = (render) =>
    C.GROUPS.map(([gid, gname]) => {
      const list = C.all().filter((c) => c.group === gid);
      if (!list.length) return '';
      return `<div class="cir-group">${gname}</div>${list.map(render).join('')}`;
    }).join('');

  /** Descrição textual de uma curva (usada no estudo e na visualização). */
  C.describe = (c) => `${c.d === 'L' ? 'Esquerda' : 'Direita'} · ${c.kind} · ${C.brakeName[c.brake]}`;
})();
