'use strict';
/* Cenários em pixel art (fundo fixo + animações) e desenho da mesa.
   L = esquema do ecrã em píxeis lógicos: { W, H, topY1, botY0, tx, ty, tw, th, k, rail }. */
const SCENE = (() => {
  function circle(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    for (let y = -Math.floor(r); y <= Math.floor(r); y++) {
      const w = Math.floor(Math.sqrt(r * r - y * y));
      ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
    }
  }
  function rect(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }

  /* ---------- fundos fixos ---------- */
  const BUILD = {
    bar(ctx, L, rnd) {
      const { W, H, topY1 } = L;
      for (let x = 0; x < W; x += 8) rect(ctx, x, 0, 8, topY1, (x / 8) % 2 ? '#3a2416' : '#432a1a');
      for (let x = 0; x < W; x += 8) rect(ctx, x, 0, 1, topY1, '#2a180e');
      rect(ctx, 0, topY1 - 4, W, 4, '#24150b');
      for (let y = topY1; y < H; y += 10) for (let x = 0; x < W; x += 10) rect(ctx, x, y, 10, 10, ((x + y) / 10) % 2 ? '#2a1a10' : '#22150c');
      // prateleira com garrafas
      rect(ctx, 120, topY1 - 26, 62, 3, '#6b3b1f'); rect(ctx, 120, topY1 - 23, 62, 1, '#2a180e');
      const cols = ['#2a7a3a', '#8a2a1a', '#c8a03a', '#3a5a8a', '#6a2a6a', '#d8d8d8'];
      for (let x = 124; x < 178; x += 7) {
        const c = U.pick(cols, rnd), h = 7 + Math.floor(rnd() * 5);
        rect(ctx, x, topY1 - 26 - h, 4, h, c); rect(ctx, x + 1, topY1 - 30 - h, 2, 4, U.shade(c, -0.3)); rect(ctx, x + 1, topY1 - 24 - h, 1, 3, '#ffffff55');
      }
      // alvo de dardos
      circle(ctx, 98, 30, 9, '#1a1a1a'); circle(ctx, 98, 30, 7, '#e8d8b0'); circle(ctx, 98, 30, 5, '#2a7a3a'); circle(ctx, 98, 30, 3, '#c83a2a'); circle(ctx, 98, 30, 1, '#2a7a3a');
      // candeeiro por cima da mesa
      rect(ctx, W / 2, 0, 1, topY1 - 10, '#111111');
      rect(ctx, W / 2 - 14, topY1 - 10, 29, 4, '#1f6a3a'); rect(ctx, W / 2 - 17, topY1 - 6, 35, 3, '#2a8a4a'); rect(ctx, W / 2 - 17, topY1 - 3, 35, 1, '#ffe8a0');
    },
    disco(ctx, L) {
      const { W, H, topY1 } = L;
      rect(ctx, 0, 0, W, topY1, '#140a24');
      for (let x = 0; x < W; x += 12) rect(ctx, x, 0, 1, topY1, '#1d1033');
      for (let y = topY1; y < H; y += 12) for (let x = 0; x < W; x += 12) { rect(ctx, x, y, 12, 12, '#0e0818'); rect(ctx, x + 1, y + 1, 10, 10, '#1a1030'); }
      // colunas de som
      for (const sx of [96, W - 22]) {
        rect(ctx, sx, topY1 - 40, 18, 40, '#0a0a0a'); rect(ctx, sx + 1, topY1 - 39, 16, 38, '#202020');
        circle(ctx, sx + 9, topY1 - 30, 5, '#0a0a0a'); circle(ctx, sx + 9, topY1 - 30, 2, '#444444');
        circle(ctx, sx + 9, topY1 - 13, 7, '#0a0a0a'); circle(ctx, sx + 9, topY1 - 13, 3, '#444444');
      }
      rect(ctx, W / 2, 0, 1, 12, '#888888');
    },
    vip(ctx, L, rnd) {
      const { W, H, topY1, tx, ty, tw, th, rail } = L;
      rect(ctx, 0, 0, W, topY1, '#5a0f1e');
      for (let y = 4; y < topY1; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < W; x += 8) rect(ctx, x, y, 2, 2, '#701a2a');
      for (let x = 0; x < W; x += 40) rect(ctx, x, 0, 2, topY1, '#c8a03a');
      // cortinas
      for (const [cx, dir] of [[0, 1], [W - 18, -1]]) {
        for (let i = 0; i < 18; i += 3) rect(ctx, cx + i, 0, 3, topY1 - 2 - (dir > 0 ? i : 18 - i) * 0.6, (i / 3) % 2 ? '#8a1020' : '#a01828');
      }
      rect(ctx, 0, topY1 - 3, W, 3, '#c8a03a');
      // chão: alcatifa
      rect(ctx, 0, topY1, W, H - topY1, '#3a0812');
      for (let y = topY1; y < H; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < W; x += 6) rect(ctx, x, y, 1, 1, '#4a0c18');
      rect(ctx, tx - rail - 8, ty - rail - 8, tw + rail * 2 + 16, th + rail * 2 + 16, '#c8a03a');
      rect(ctx, tx - rail - 6, ty - rail - 6, tw + rail * 2 + 12, th + rail * 2 + 12, '#8a1020');
      // taças de champanhe
      for (let i = 0; i < 4; i++) {
        const x = 150 + i * 14 + Math.floor(rnd() * 3), y = topY1 - 14;
        rect(ctx, x, y, 5, 5, '#f8e8a0aa'); rect(ctx, x + 2, y + 5, 1, 4, '#ffffff'); rect(ctx, x, y + 9, 5, 1, '#ffffff');
      }
      rect(ctx, 146, topY1 - 4, 66, 2, '#d8b84a');
    },
    stadium(ctx, L, rnd) {
      const { W, H, topY1, tx, ty, tw, th } = L;
      const bands = ['#050b1e', '#081230', '#0b1840', '#0e1e4e'];
      for (let i = 0; i < 4; i++) rect(ctx, 0, i * 6, W, 6, bands[i]);
      // bancada
      const sy = 22;
      for (let y = sy; y < topY1 - 10; y += 4) rect(ctx, 0, y, W, 4, (y / 4) % 2 ? '#3a3f4a' : '#30343e');
      const crowd = ['#e04040', '#ffffff', '#2f6fd0', '#f2c21b', '#1a8a3a', '#f0c49a', '#8d5a3b', '#d9a066'];
      for (let y = sy + 1; y < topY1 - 12; y += 4) for (let x = (y % 8 ? 1 : 3); x < W; x += 4) {
        rect(ctx, x, y, 2, 2, U.pick(crowd, rnd)); rect(ctx, x, y + 2, 2, 1, U.pick(crowd, rnd));
      }
      // placas publicitárias
      const ads = [['GOLO!', '#ffd23f', '#1a1a1a'], ['SINUCA', '#ffffff', '#c8102e'], ['TACO', '#1a1a1a', '#4fd1ff'], ['VAMOS', '#ffffff', '#1a8a3a']];
      let x = 0, i = 0;
      while (x < W) { const [t, fg, bg] = ads[i++ % 4]; rect(ctx, x, topY1 - 10, 40, 10, bg); SPR.drawText(ctx, t, x + 20, topY1 - 8, fg, 1, 'center'); x += 40; }
      // relvado
      for (let y = topY1; y < H; y += 14) rect(ctx, 0, y, W, 14, ((y - topY1) / 14) % 2 ? '#2f8a3a' : '#38a046');
      rect(ctx, 0, ty + th / 2, W, 1, '#e8f4e8');
      ctx.strokeStyle = 'transparent';
      const cx = W / 2, cy = ty + th / 2, r = tw * 0.75;
      for (let a = 0; a < 360; a += 2) { const px = cx + Math.cos(a * Math.PI / 180) * r, py = cy + Math.sin(a * Math.PI / 180) * r; rect(ctx, px, py, 1, 1, '#e8f4e8'); }
      // torres de luz
      for (const lx of [6, W - 16]) { rect(ctx, lx + 4, 2, 2, sy, '#555a66'); rect(ctx, lx, 0, 10, 6, '#7a808c'); for (let k = 0; k < 4; k++) rect(ctx, lx + 1 + k * 2, 1, 1, 4, '#fffbe0'); }
    },
    luxo(ctx, L, rnd) {
      const { W, H, topY1, tx, ty, tw, th, rail } = L;
      rect(ctx, 0, 0, W, topY1, '#2a1a0c');
      for (let x = 2; x < W; x += 30) { rect(ctx, x, 6, 26, topY1 - 14, '#3a2412'); rect(ctx, x + 1, 7, 24, topY1 - 16, '#2e1c0e'); }
      rect(ctx, 0, topY1 - 6, W, 6, '#4a2e16'); rect(ctx, 0, topY1 - 6, W, 1, '#c8a03a');
      // quadros
      const paint = (x, y, w, h) => {
        rect(ctx, x - 2, y - 2, w + 4, h + 4, '#c8a03a'); rect(ctx, x, y, w, h, '#7ab0d8');
        rect(ctx, x, y + h * 0.55, w, h * 0.45, '#3a7a3a'); circle(ctx, x + w * 0.7, y + h * 0.3, 2, '#ffe080');
        for (let i = 0; i < w; i += 3) rect(ctx, x + i, y + h * 0.55 - (rnd() * 3), 3, 2, '#2a5a2a');
      };
      paint(128, 12, 24, 16); paint(170, 14, 18, 14);
      // lareira
      rect(ctx, 200, topY1 - 34, 36, 28, '#d8d4cc'); rect(ctx, 205, topY1 - 26, 26, 20, '#1a0e06'); rect(ctx, 198, topY1 - 36, 40, 3, '#efe9dd');
      // chão de mármore
      for (let y = topY1; y < H; y += 16) for (let x = 0; x < W; x += 16) rect(ctx, x, y, 16, 16, ((x + y) / 16) % 2 ? '#d8d4cc' : '#a49e94');
      for (let i = 0; i < 40; i++) rect(ctx, rnd() * W, topY1 + rnd() * (H - topY1), 3, 1, '#8a847a');
      // tapete
      rect(ctx, tx - rail - 10, ty - rail - 10, tw + rail * 2 + 20, th + rail * 2 + 20, '#6a1018');
      rect(ctx, tx - rail - 8, ty - rail - 8, tw + rail * 2 + 16, th + rail * 2 + 16, '#8a2028');
      for (let x = tx - rail - 10; x < tx + tw + rail + 10; x += 3) { rect(ctx, x, ty - rail - 12, 1, 2, '#e8d8a0'); rect(ctx, x, ty + th + rail + 10, 1, 2, '#e8d8a0'); }
      // lustre
      rect(ctx, W / 2, 0, 1, 8, '#c8a03a'); rect(ctx, W / 2 - 12, 8, 25, 2, '#c8a03a'); rect(ctx, W / 2 - 8, 10, 17, 2, '#e8c050');
    },
  };

  const bgCache = { key: '', cv: null };
  function background(id, L) {
    const key = id + ':' + L.W + 'x' + L.H + ':' + L.tx + ',' + L.ty + ',' + L.tw;
    if (bgCache.key === key) return bgCache.cv;
    const [cv, ctx] = canvas(L.W, L.H);
    rect(ctx, 0, 0, L.W, L.H, '#000000');
    (BUILD[id] || BUILD.bar)(ctx, L, U.seeded(U.hashStr(id)));
    bgCache.key = key; bgCache.cv = cv;
    return cv;
  }

  /* ---------- animações por cima do fundo ---------- */
  function fx(ctx, id, L, t) {
    const { W, H, topY1 } = L;
    if (id === 'bar') {
      const on = Math.sin(t * 9) > -0.85 || Math.sin(t * 2.3) > 0;
      SPR.drawText(ctx, 'BAR', 192, topY1 - 30, on ? '#ff4fa8' : '#5a1a3a', 2, 'left', on ? '#7a1048' : null);
      if (on) { ctx.globalAlpha = 0.12; rect(ctx, 187, topY1 - 35, 34, 20, '#ff4fa8'); ctx.globalAlpha = 1; }
    } else if (id === 'disco') {
      // pista com luzes
      const cols = ['#ff2d95', '#4fd1ff', '#ffd23f', '#3bff7a', '#bf5af2'];
      const beat = Math.floor(t * 2.05);
      for (let y = topY1; y < H; y += 12) for (let x = 0; x < W; x += 12) {
        const h = (x * 7 + y * 13 + beat * 31) % 9;
        if (h < 2) { ctx.globalAlpha = 0.55; rect(ctx, x + 1, y + 1, 10, 10, cols[(x + y + beat) % 5]); ctx.globalAlpha = 1; }
      }
      // bola de espelhos
      const cx = W / 2, cy = 18;
      circle(ctx, cx, cy, 7, '#a0a8b8');
      for (let i = 0; i < 12; i++) { const a = t * 1.5 + i; rect(ctx, cx + Math.cos(a) * 5, cy + Math.sin(i * 2) * 5, 2, 2, i % 3 ? '#e8f0ff' : '#5a6070'); }
    } else if (id === 'vip') {
      for (let i = 0; i < 8; i++) {
        const ph = (t * 0.7 + i * 0.37) % 1;
        if (ph < 0.25) { const x = (i * 53) % W, y = (i * 29) % (topY1 - 6) + 3; rect(ctx, x, y - 1, 1, 3, '#fff6c0'); rect(ctx, x - 1, y, 3, 1, '#fff6c0'); }
      }
      SPR.drawText(ctx, 'VIP', 98, topY1 - 32, '#ffd23f', 2, 'left', '#6a4a0a');
    } else if (id === 'stadium') {
      for (let i = 0; i < 6; i++) {
        if (((t * 3 + i * 0.71) % 1) < 0.08) { const x = (i * 41 + Math.floor(t)) % W, y = 24 + (i * 7) % (topY1 - 40); rect(ctx, x, y, 2, 2, '#ffffff'); }
      }
      const wave = (Math.floor(t * 6)) % 60;
      for (let x = 0; x < W; x += 4) if (Math.abs((x / 4) - wave) < 3) rect(ctx, x, 23, 2, 2, '#ffd23f');
      ctx.globalAlpha = 0.07 + 0.03 * Math.sin(t * 2);
      ctx.fillStyle = '#fffbe0';
      ctx.beginPath(); ctx.moveTo(11, 4); ctx.lineTo(W * 0.55, H); ctx.lineTo(W * 0.15, H); ctx.fill();
      ctx.beginPath(); ctx.moveTo(W - 11, 4); ctx.lineTo(W * 0.85, H); ctx.lineTo(W * 0.45, H); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (id === 'luxo') {
      for (let i = 0; i < 5; i++) {
        const fl = Math.sin(t * 13 + i * 2) > 0 ? '#ffe080' : '#ffb040';
        rect(ctx, W / 2 - 10 + i * 5, 5 + (i % 2), 1, 2, fl);
      }
      // lume da lareira
      const fy = topY1 - 8;
      for (let i = 0; i < 9; i++) {
        const h = 4 + Math.floor((Math.sin(t * 10 + i * 1.7) + 1) * 4);
        rect(ctx, 207 + i * 2.6, fy - h, 2, h, i % 2 ? '#ff9a1a' : '#ffd23f');
      }
      rect(ctx, 206, fy, 24, 2, '#5a2a0a');
    }
  }

  /* Por cima da mesa (luzes da discoteca e candeeiro do bar). */
  function overlay(ctx, id, L, t) {
    if (id === 'disco') {
      const cols = ['#ff2d95', '#4fd1ff', '#ffd23f', '#3bff7a'];
      ctx.globalAlpha = 0.09;
      for (let i = 0; i < 4; i++) {
        const a = t * 0.6 + i * Math.PI / 2;
        ctx.fillStyle = cols[i];
        ctx.beginPath(); ctx.moveTo(L.W / 2, 18);
        ctx.lineTo(L.W / 2 + Math.cos(a) * 400, 18 + Math.abs(Math.sin(a)) * 600 + 100);
        ctx.lineTo(L.W / 2 + Math.cos(a + 0.18) * 400, 18 + Math.abs(Math.sin(a + 0.18)) * 600 + 100);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (id === 'bar') {
      ctx.globalAlpha = 0.07; ctx.fillStyle = '#ffe8a0';
      ctx.beginPath(); ctx.moveTo(L.W / 2 - 17, L.topY1); ctx.lineTo(L.W / 2 + 18, L.topY1); ctx.lineTo(L.tx + L.tw + 6, L.ty + L.th * 0.6); ctx.lineTo(L.tx - 6, L.ty + L.th * 0.6); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- mesa ---------- */
  const tableCache = { key: '', cv: null };
  function table(def, L) {
    const key = def.id + ':' + L.tw + ':' + L.th + ':' + L.rail;
    if (tableCache.key === key) return tableCache.cv;
    const { tw, th, k, rail } = L;
    const W = tw + rail * 2, H = th + rail * 2;
    const [cv, ctx] = canvas(W + 4, H + 4);
    const ox = rail, oy = rail;
    rect(ctx, 3, 3, W, H, '#00000066'); // sombra
    const rc = def.rail, rcl = U.shade(rc, 0.18), rcd = U.shade(rc, -0.35);
    rect(ctx, 0, 0, W, H, rcd); rect(ctx, 1, 1, W - 2, H - 2, rc);
    rect(ctx, 1, 1, W - 2, 1, rcl); rect(ctx, 1, 1, 1, H - 2, rcl);
    for (let y = 3; y < H - 3; y += 5) { rect(ctx, 2, y, 1, 2, rcd); rect(ctx, W - 3, y + 2, 1, 2, rcd); }
    // pano
    const f = def.felt, fd = U.shade(f, -0.18), fl = U.shade(f, 0.06);
    rect(ctx, ox - 2, oy - 2, tw + 4, th + 4, U.shade(f, -0.3));
    rect(ctx, ox, oy, tw, th, f);
    const rnd = U.seeded(7);
    for (let i = 0; i < tw * th / 30; i++) rect(ctx, ox + rnd() * tw, oy + rnd() * th, 1, 1, rnd() < 0.5 ? fd : fl);
    // linha de saída e marca do pé
    for (let x = 0; x < tw; x += 2) rect(ctx, ox + x, oy + PHYS.HEAD_Y * k, 1, 1, U.shade(f, 0.18));
    rect(ctx, ox + PHYS.FOOT.x * k - 1, oy + PHYS.FOOT.y * k - 1, 2, 2, U.shade(f, 0.25));
    // tabelas (almofadas)
    const cushion = U.shade(f, -0.22);
    const cg = PHYS.CG * k, sg = PHYS.SG * k;
    rect(ctx, ox + cg, oy, tw - cg * 2, 2, cushion); rect(ctx, ox + cg, oy + th - 2, tw - cg * 2, 2, cushion);
    rect(ctx, ox, oy + cg, 2, th / 2 - cg - sg, cushion); rect(ctx, ox, oy + th / 2 + sg, 2, th / 2 - cg - sg, cushion);
    rect(ctx, ox + tw - 2, oy + cg, 2, th / 2 - cg - sg, cushion); rect(ctx, ox + tw - 2, oy + th / 2 + sg, 2, th / 2 - cg - sg, cushion);
    // diamantes
    const dia = '#f0e8d0';
    for (const fx of [0.25, 0.5, 0.75]) { rect(ctx, ox + fx * tw, rail / 2 - 1, 1, 1, dia); rect(ctx, ox + fx * tw, H - rail / 2, 1, 1, dia); }
    for (const fy of [0.25, 0.5, 0.75, 1.25, 1.5, 1.75]) { rect(ctx, rail / 2 - 1, oy + fy * k, 1, 1, dia); rect(ctx, W - rail / 2, oy + fy * k, 1, 1, dia); }
    // caçapas
    for (const p of PHYS.POCKETS) {
      const cx = ox + p.x * k, cy = oy + p.y * k, r = p.r * k * 0.95;
      circle(ctx, cx, cy, r + 1.5, '#1a1a1a');
      circle(ctx, cx, cy, r, '#050505');
      rect(ctx, cx - r * 0.4, cy - r * 0.5, 2, 1, '#2a2a2a');
    }
    tableCache.key = key; tableCache.cv = cv;
    return cv;
  }

  return { background, fx, overlay, table, circle, rect };
})();
