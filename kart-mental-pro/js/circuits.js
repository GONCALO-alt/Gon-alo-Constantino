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

  const C = (KMP.circuits = {});
  C.all = () => BUILTIN.concat((KMP.store.state.circuits || []).map((c) => Object.assign({ custom: true }, c)));
  C.get = (id) => C.all().find((c) => c.id === id);

  C.cornerKind = (s) => (s.a >= 150 ? 'Gancho' : s.a >= 80 ? 'Curva média' : 'Curva rápida');
  C.brakeName = ['Sem travagem', 'Travagem média', 'Travagem forte'];

  /** Calcula pontos, curvas numeradas e comprimentos. */
  C.geometry = (circ) => {
    let x = 0;
    let y = 0;
    let h = 0; // direção em radianos (0 = este; ecrã com y para baixo)
    const pts = [[x, y]];
    const segInfo = [];
    const corners = [];
    let len = 0;
    circ.segs.forEach((s, i) => {
      const start = { x, y, h, len };
      if (s.t === 'S') {
        const n = Math.max(2, Math.round(s.l / 10));
        for (let k = 1; k <= n; k++) pts.push([x + Math.cos(h) * (s.l * k) / n, y + Math.sin(h) * (s.l * k) / n]);
        x += Math.cos(h) * s.l;
        y += Math.sin(h) * s.l;
        len += s.l;
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
        len += s.r * a;
        corners.push(Object.assign({ n: corners.length + 1, seg: i, apex: pts[pts.length - 1 - Math.floor(n / 2)], kind: C.cornerKind(s) }, s));
      }
      segInfo.push({ start, end: { x, y, h, len } });
    });
    // Fecho até à meta com uma curva de Bézier suave.
    const gap = Math.hypot(x, y);
    const closing = [];
    if (gap > 1) {
      const k = gap * 0.4;
      const p1 = [x + Math.cos(h) * k, y + Math.sin(h) * k];
      const p2 = [-k, 0];
      for (let t = 1; t <= 12; t++) {
        const u = t / 12;
        const bx = (1 - u) ** 3 * x + 3 * (1 - u) ** 2 * u * p1[0] + 3 * (1 - u) * u * u * p2[0];
        const by = (1 - u) ** 3 * y + 3 * (1 - u) ** 2 * u * p1[1] + 3 * (1 - u) * u * u * p2[1];
        closing.push([bx, by]);
      }
    }
    const all = pts.concat(closing);
    const xs = all.map((p) => p[0]);
    const ys = all.map((p) => p[1]);
    const box = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    // Retas por ordem de comprimento (para perguntas).
    const straights = circ.segs
      .map((s, i) => ({ s, i }))
      .filter((o) => o.s.t === 'S')
      .map((o) => {
        const nextCorner = corners.find((c) => c.seg > o.i) || corners[0];
        return { i: o.i, l: o.s.l, zone: o.s.zone, before: nextCorner };
      });
    return { pts, closing, all, corners, box, segInfo, len, straights };
  };

  /** SVG do circuito. opts: { labels, brakes, zones, plain, dot } */
  C.svg = (circ, opts) => {
    opts = Object.assign({ labels: true, brakes: true, zones: true }, opts || {});
    const g = C.geometry(circ);
    const pad = 34;
    const vb = [g.box.x0 - pad, g.box.y0 - pad, g.box.x1 - g.box.x0 + pad * 2, g.box.y1 - g.box.y0 + pad * 2];
    const d = (arr) => arr.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const full = d(g.all) + ' Z';
    let extra = '';
    if (opts.zones && !opts.plain) {
      circ.segs.forEach((s, i) => {
        if (s.t === 'S' && s.zone) {
          const a = g.segInfo[i].start;
          const b = g.segInfo[i].end;
          extra += `<line x1="${a.x + (b.x - a.x) * 0.2}" y1="${a.y + (b.y - a.y) * 0.2}" x2="${a.x + (b.x - a.x) * 0.8}" y2="${a.y + (b.y - a.y) * 0.8}" stroke="#00d26a" stroke-width="5" stroke-linecap="round" opacity=".85"/>`;
        }
      });
    }
    if (opts.brakes && !opts.plain) {
      g.corners.forEach((c) => {
        if (!c.brake) return;
        const st = g.segInfo[c.seg].start;
        const nx = -Math.sin(st.h);
        const ny = Math.cos(st.h);
        const bars = c.brake === 2 ? 3 : 2;
        for (let k = 0; k < bars; k++) {
          const bx = st.x - Math.cos(st.h) * (6 + k * 7);
          const by = st.y - Math.sin(st.h) * (6 + k * 7);
          extra += `<line x1="${bx - nx * 7}" y1="${by - ny * 7}" x2="${bx + nx * 7}" y2="${by + ny * 7}" stroke="${c.brake === 2 ? '#e10600' : '#ff9500'}" stroke-width="3"/>`;
        }
      });
    }
    // Meta (xadrez)
    const flag = `<g transform="translate(0 0)"><rect x="-3" y="-9" width="6" height="18" fill="#fff"/><rect x="-3" y="-9" width="3" height="3" fill="#111"/><rect x="0" y="-6" width="3" height="3" fill="#111"/><rect x="-3" y="-3" width="3" height="3" fill="#111"/><rect x="0" y="0" width="3" height="3" fill="#111"/><rect x="-3" y="3" width="3" height="3" fill="#111"/><rect x="0" y="6" width="3" height="3" fill="#111"/></g>`;
    let labels = '';
    if (opts.labels && !opts.plain) {
      const cx = (g.box.x0 + g.box.x1) / 2;
      const cy = (g.box.y0 + g.box.y1) / 2;
      g.corners.forEach((c) => {
        const [ax, ay] = c.apex;
        let vx = ax - cx;
        let vy = ay - cy;
        const m = Math.hypot(vx, vy) || 1;
        vx /= m;
        vy /= m;
        const lx = ax + vx * 18;
        const ly = ay + vy * 18;
        labels += `<g><circle cx="${lx}" cy="${ly}" r="9" fill="#e10600"/><text x="${lx}" y="${ly + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="-apple-system,Arial">${c.n}</text></g>`;
      });
    }
    const arrow = `<path d="M 30 -10 l 10 4 l -10 4" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>`;
    return {
      geo: g,
      html: `<svg class="circ-svg" viewBox="${vb.join(' ')}" preserveAspectRatio="xMidYMid meet">
        <path d="${full}" fill="none" stroke="#2a2b31" stroke-width="22" stroke-linejoin="round"/>
        <path d="${full}" fill="none" stroke="#4a4b55" stroke-width="16" stroke-linejoin="round"/>
        <path d="${full}" class="circ-line" fill="none" stroke="${opts.plain ? '#8b8d98' : '#f5f5f7'}" stroke-width="2" stroke-dasharray="${opts.plain ? '0' : '6 6'}" stroke-linejoin="round" opacity=".65"/>
        ${extra}${flag}${opts.plain ? '' : arrow}${labels}
        ${opts.dot ? '<circle class="circ-dot" r="7" fill="#00d26a" stroke="#fff" stroke-width="2" cx="0" cy="0"/>' : ''}
      </svg>`,
    };
  };

  /** Descrição textual de uma curva (usada no estudo e na visualização). */
  C.describe = (c) => `${c.d === 'L' ? 'Esquerda' : 'Direita'} · ${c.kind} · ${C.brakeName[c.brake]}`;
})();
