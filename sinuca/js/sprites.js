'use strict';
/* Desenho em pixel art: personagens (busto 24×33 células), bolas, tacos, letras 3×5 e ícones. */
const SPR = (() => {
  const FONT_SRC = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
    F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
    K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
    P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
    Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
    4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111',
    9: '111101111001110', '!': '010010010000010', '+': '000010111010000', '-': '000000111000000', '.': '000000000000010',
    ':': '000010000010000', '>': '100010001010100', '<': '001010100010001', '?': '110001010000010', '/': '001001010100100', ' ': '000000000000000', "'": '010010000000000',
  };
  const ACC = { 'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'É': 'E', 'Ê': 'E', 'Í': 'I', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ú': 'U', 'Ç': 'C' };

  function glyph(ch) {
    ch = ch.toUpperCase();
    if (ACC[ch]) ch = ACC[ch];
    return FONT_SRC[ch] || FONT_SRC['?'];
  }
  function textWidth(str, s = 1) { return str.length ? (str.length * 4 - 1) * s : 0; }
  function drawText(ctx, str, x, y, color, s = 1, align = 'left', shadow = null) {
    str = String(str);
    let w = textWidth(str, s);
    let x0 = align === 'center' ? Math.round(x - w / 2) : align === 'right' ? Math.round(x - w) : Math.round(x);
    y = Math.round(y);
    const pass = (dx, dy, c) => {
      ctx.fillStyle = c;
      for (let i = 0; i < str.length; i++) {
        const g = glyph(str[i]);
        for (let p = 0; p < 15; p++) if (g[p] === '1') ctx.fillRect(x0 + dx + (i * 4 + (p % 3)) * s, y + dy + Math.floor(p / 3) * s, s, s);
      }
    };
    if (shadow) pass(s, s, shadow);
    pass(0, 0, color);
  }

  /* ---------- Personagens ---------- */
  const GW = 24, GH = 33, Y0 = 3; // margem de 3 linhas no topo para chapéus
  function drawChar(ctx, look, ox, oy, px, a = {}) {
    const pose = a.pose || 'idle', t = a.t || 0, sil = a.silhouette || null;
    const R = (x, y, w, h, c) => {
      if (!c) return;
      ctx.fillStyle = sil || c;
      ctx.fillRect(Math.round(ox + x * px), Math.round(oy + (y + Y0) * px), Math.round(w * px), Math.round(h * px));
    };
    const skin = look.skin || '#eec39a', skinD = U.shade(skin, -0.18), skinL = U.shade(skin, 0.25);
    const hairC = look.hairC || '#2a2018', top = look.top || { type: 'tshirt', c: '#e04040' };
    let hy = 0;
    if (pose === 'idle' || pose === 'talk' || pose === 'think') hy = Math.sin(t * 2.6) > 0.55 ? 1 : 0;
    if (pose === 'sad') hy = 1;
    if (pose === 'happy') hy = Math.floor(t * 7) % 2 ? -1 : 0;
    const by = pose === 'happy' ? hy : 0; // o corpo também salta

    // aura dos lendários
    if (look.aura && !sil) {
      ctx.save();
      ctx.globalAlpha = 0.14 + 0.07 * Math.sin(t * 3);
      for (let y = -10; y <= 10; y++) { const w = Math.round(Math.sqrt(100 - y * y)); R(12 - w, 9 + y, w * 2, 1, look.aura); }
      ctx.globalAlpha = 0.08 + 0.04 * Math.sin(t * 3);
      for (let y = -12; y <= 12; y++) { const w = Math.round(Math.sqrt(144 - y * y)); R(12 - w, 9 + y, w * 2, 1, look.aura); }
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < 6; i++) {
        const x = (i * 7 + 3) % 22 + 1, y = 29 - ((t * 10 + i * 5.3) % 30);
        R(x, y, 1, 1, i % 2 ? '#ffffff' : look.aura);
      }
      ctx.restore();
    }

    const longHair = ['long', 'bangs', 'wavy'].includes(look.hair);
    if (longHair && !look.hood) { R(5, 5 + hy, 14, 11, hairC); R(4, 9 + hy, 2, 9, hairC); R(18, 9 + hy, 2, 9, hairC); }
    if (look.hood) { R(5, 1 + hy, 14, 7, top.c); R(4, 5 + hy, 3, 12, top.c); R(17, 5 + hy, 3, 12, top.c); }

    // ---------- corpo ----------
    const c = top.c;
    let sleeve = c, cuff = null;
    const T = (x, y, w, h, col) => R(x, y + by, w, h, col);
    switch (top.type) {
      case 'dress': case 'tank':
        T(4, 16, 16, 2, skin); T(5, 18, 14, 12, c); T(6, 16, 1, 2, c); T(17, 16, 1, 2, c); sleeve = skin;
        if (top.type === 'tank') { T(6, 17, 12, 13, c); T(9, 16, 6, 1, skin); }
        if (top.sparkle) for (let i = 0; i < 7; i++) {
          const on = Math.floor(t * 4 + i) % 3 === 0; if (on) T(6 + (i * 5) % 12, 19 + (i * 3) % 10, 1, 1, top.sparkle);
        }
        break;
      case 'robot':
        T(5, 15, 14, 1, c); T(4, 16, 16, 14, c); T(8, 19, 8, 6, U.shade(c, -0.25));
        T(9, 20, 2, 1, Math.floor(t * 3) % 2 ? top.c2 : '#40ff70'); T(13, 20, 2, 1, Math.floor(t * 3) % 2 ? '#40ff70' : top.c2);
        T(9, 23, 6, 1, U.shade(c, 0.3)); sleeve = U.shade(c, -0.1);
        break;
      default:
        T(5, 15, 14, 1, c); T(4, 16, 16, 14, c);
    }
    if (top.type === 'tshirt') T(10, 15, 4, 1, U.shade(c, -0.25));
    if (top.type === 'shirt') { T(9, 15, 2, 1, '#ffffff'); T(13, 15, 2, 1, '#ffffff'); for (let y = 17; y < 29; y += 3) T(12, y, 1, 1, U.shade(c, -0.3)); }
    if (top.type === 'jersey') {
      if (top.stripes) for (const x of [6, 10, 14, 18]) T(x, 16, 2, 14, top.c2);
      T(9, 15, 6, 1, top.collar || top.c2); cuff = top.c2;
      if (top.num) drawTextScaled(top.num, 12, 19 + by, top.numC || '#ffffff');
      if (top.emblem === 'bolt') { const bc = top.numC || '#009b3a'; T(13, 18, 2, 2, bc); T(11, 20, 3, 1, bc); T(10, 21, 2, 2, bc); T(12, 21, 3, 1, bc); T(11, 23, 2, 1, bc); }
    }
    if (top.type === 'suit') {
      T(10, 15, 4, 3, top.shirt); T(11, 18, 2, 2, top.shirt);
      if (top.tie) { T(11, 16, 2, 1, U.shade(top.tie, -0.2)); T(11, 17, 2, 6, top.tie); }
      T(9, 16, 1, 6, U.shade(c, -0.3)); T(14, 16, 1, 6, U.shade(c, -0.3));
      T(12, 24, 1, 1, U.shade(c, 0.35)); T(12, 27, 1, 1, U.shade(c, 0.35));
    }
    if (top.type === 'hoodie') {
      T(7, 14, 10, 2, U.shade(c, -0.18)); T(10, 16, 1, 4, top.c2); T(13, 16, 1, 4, top.c2);
      T(8, 24, 8, 3, U.shade(c, -0.12));
    }
    if (top.type === 'apron') {
      T(4, 16, 16, 14, top.c2); T(5, 15, 14, 1, top.c2); sleeve = top.c2;
      T(7, 19, 10, 11, c); T(8, 16, 1, 3, c); T(15, 16, 1, 3, c); T(9, 22, 6, 2, U.shade(c, -0.08));
    }
    if (top.type === 'cardigan') { T(10, 16, 4, 14, top.c2); for (let y = 18; y < 29; y += 3) T(9, y, 1, 1, '#ffffff'); }
    if (top.type === 'coat') {
      T(9, 16, 1, 7, U.shade(c, 0.2)); T(14, 16, 1, 7, U.shade(c, 0.2));
      T(8, 15, 8, 3, top.scarf); T(14, 18, 2, 6, top.scarf);
    }

    // braços
    const hand = skin;
    if (pose === 'happy') {
      const w = Math.floor(t * 7) % 2;
      R(2, 8 + w + by, 2, 9, sleeve); R(20, 9 - w + by, 2, 9, sleeve);
      R(2, 6 + w + by, 2, 2, hand); R(20, 7 - w + by, 2, 2, hand);
      if (cuff) { R(2, 8 + w + by, 2, 1, cuff); R(20, 9 - w + by, 2, 1, cuff); }
    } else if (pose === 'think') {
      R(2, 17, 2, 8, sleeve); R(2, 25, 2, 2, hand);
      R(20, 17, 2, 3, sleeve); R(16, 17, 5, 2, sleeve); R(15, 14 + hy, 2, 3, hand);
      if (cuff) R(2, 24, 2, 1, cuff);
    } else {
      const d = pose === 'sad' ? 1 : 0;
      R(2, 17 + d, 2, 8, sleeve); R(20, 17 + d, 2, 8, sleeve);
      R(2, 25 + d, 2, 2, hand); R(20, 25 + d, 2, 2, hand);
      if (cuff) { R(2, 24 + d, 2, 1, cuff); R(20, 24 + d, 2, 1, cuff); }
    }

    // ---------- cabeça ----------
    const H = y => y + hy;
    if (look.robot) {
      R(7, H(3), 10, 11, skin); R(6, H(6), 1, 4, U.shade(skin, -0.2)); R(17, H(6), 1, 4, U.shade(skin, -0.2));
      R(11, H(0), 2, 3, '#555555'); R(11, H(-1), 2, 1, Math.floor(t * 2) % 2 ? hairC : '#661111');
      R(8, H(7), 8, 3, '#14161a');
      const ex = 9 + Math.round((Math.sin(t * 1.7) + 1) * 2);
      R(ex, H(8), 2, 1, a.blink ? '#661111' : '#ff3b3b');
      R(9, H(11), 6, 1, '#3a3f48');
      if (a.talking && Math.floor(t * 8) % 2) R(9, H(11), 6, 1, '#40ff70');
      R(10, 14, 4, 2, '#555555');
      drawItem(look.item);
      return;
    }
    R(10, 14, 4, 2, skinD); // pescoço
    R(7, H(4), 10, 10, skin);
    R(6, H(7), 1, 3, skin); R(17, H(7), 1, 3, skin);
    R(7, H(13), 1, 1, skinD); R(16, H(13), 1, 1, skinD);

    // cabelo da frente
    const hc = hairC, hl = U.shade(hairC, 0.3), hd = U.shade(hairC, -0.3);
    if (!look.hood) switch (look.hair) {
      case 'short': R(7, H(2), 10, 2, hc); R(6, H(3), 12, 2, hc); R(6, H(5), 1, 3, hc); R(17, H(5), 1, 3, hc); R(7, H(4), 4, 1, hc); R(9, H(2), 3, 1, hl); break;
      case 'buzz': R(7, H(3), 10, 1, hc); R(6, H(4), 1, 3, hc); R(17, H(4), 1, 3, hc); break;
      case 'spiky': R(6, H(3), 12, 2, hc); R(6, H(5), 1, 2, hc); R(17, H(5), 1, 2, hc);
        for (const x of [7, 9, 11, 13, 15]) R(x, H(1), 1, 2, hc); for (const x of [8, 10, 12, 14, 16]) R(x, H(2), 1, 1, hl); break;
      case 'slick': R(7, H(1), 10, 3, hc); R(6, H(3), 1, 4, hd); R(17, H(3), 1, 4, hd); R(8, H(1), 4, 1, hl); R(7, H(4), 2, 1, hc); break;
      case 'curly': R(6, H(1), 12, 4, hc); R(5, H(2), 1, 4, hc); R(18, H(2), 1, 4, hc);
        for (const x of [7, 10, 13, 16]) R(x, H(0), 2, 1, hc); for (const x of [8, 12, 15]) R(x, H(2), 1, 1, hl); R(7, H(5), 3, 1, hc); break;
      case 'afro': R(4, H(0), 16, 5, hc); R(3, H(2), 1, 6, hc); R(20, H(2), 1, 6, hc); R(4, H(5), 3, 4, hc); R(17, H(5), 3, 4, hc); R(7, H(1), 3, 1, hl); break;
      case 'bald': R(8, H(3), 8, 1, skin); R(9, H(4), 2, 1, skinL); break;
      case 'balding': R(8, H(3), 8, 1, skin); R(9, H(4), 2, 1, skinL); R(6, H(5), 2, 4, hc); R(16, H(5), 2, 4, hc); break;
      case 'swoop': R(6, H(2), 12, 3, hc); R(5, H(4), 4, 2, hc); R(6, H(6), 1, 2, hc); R(17, H(4), 1, 4, hc); R(8, H(2), 6, 1, hl); R(5, H(5), 1, 1, hl); break;
      case 'bun': R(10, H(0), 4, 2, hc); R(7, H(2), 10, 2, hc); R(6, H(3), 12, 2, hc); R(6, H(5), 1, 3, hc); R(17, H(5), 1, 3, hc); R(11, H(0), 1, 1, hl); break;
      case 'bangs': R(6, H(2), 12, 3, hc); R(7, H(5), 10, 2, hc); R(6, H(5), 1, 7, hc); R(17, H(5), 1, 7, hc); R(9, H(2), 3, 1, hl); break;
      case 'long': case 'wavy':
        R(6, H(2), 12, 3, hc); R(6, H(5), 1, 7, hc); R(17, H(5), 1, 7, hc); R(7, H(4), 3, 1, hc); R(11, H(2), 1, 1, hl);
        if (look.hair === 'wavy') { R(5, H(12), 1, 1, hc); R(18, H(14), 1, 1, hc); R(4, H(17), 1, 1, hl); R(19, H(16), 1, 1, hl); }
        break;
      default: break;
    }

    // olhos e sobrancelhas
    const eyeC = look.eyes || '#1a1a1a', browC = look.hair === 'bald' || look.hair === 'balding' ? U.shade(hairC, -0.1) : hd;
    if (look.hood) {
      R(7, H(5), 10, 9, skin);
      const glow = a.blink ? U.shade(eyeC, -0.5) : eyeC;
      R(9, H(8), 2, 1, glow); R(13, H(8), 2, 1, glow);
    } else {
      if (look.hair !== 'bangs') {
        const sad = pose === 'sad' ? 1 : 0;
        R(8, H(7), 2, 1, browC); R(14, H(7), 2, 1, browC);
        if (sad) { R(8, H(6), 1, 1, browC); R(15, H(6), 1, 1, browC); }
        if (pose === 'think') R(14, H(6), 2, 1, browC);
      }
      if (pose === 'happy') { R(8, H(9), 1, 1, eyeC); R(9, H(8), 1, 1, eyeC); R(14, H(8), 1, 1, eyeC); R(15, H(9), 1, 1, eyeC); }
      else if (pose === 'sad' || a.blink) { R(8, H(9), 2, 1, eyeC); R(14, H(9), 2, 1, eyeC); }
      else { R(8, H(8), 2, 2, '#ffffff'); R(14, H(8), 2, 2, '#ffffff'); R(9, H(8), 1, 2, eyeC); R(14, H(8), 1, 2, eyeC); }
    }

    // nariz
    if (!look.hood) { R(12, H(9), 1, 1, skinD); R(11, H(10), 2, 1, skinD); }

    // barba
    const bc = look.beardC || hairC;
    if (look.beard === 'stubble') { for (let x = 7; x < 17; x++) for (let y = 11; y < 14; y++) if ((x + y) % 2 === 0) R(x, H(y), 1, 1, bc); }
    if (look.beard === 'full') { R(7, H(10), 1, 4, bc); R(16, H(10), 1, 4, bc); R(7, H(12), 10, 2, bc); R(8, H(14), 8, 1, bc); R(10, H(11), 4, 1, bc); }
    if (look.beard === 'goatee') R(10, H(13), 4, 2, bc);

    // boca
    const mouth = look.lips || U.shade(skin, -0.42);
    const talkOpen = (pose === 'talk' || a.talking) && Math.floor(t * 8) % 2 === 0;
    if (!look.hood) {
      if (pose === 'happy') { R(9, H(11), 1, 1, mouth); R(10, H(12), 4, 1, '#5a1a1a'); R(14, H(11), 1, 1, mouth); }
      else if (pose === 'sad') { R(10, H(12), 4, 1, mouth); R(9, H(13), 1, 1, mouth); R(14, H(13), 1, 1, mouth); }
      else if (talkOpen) { R(10, H(12), 4, 2, '#5a1a1a'); R(10, H(12), 4, 1, '#ffffff'); }
      else R(10, H(12), 4, 1, mouth);
    }
    if (look.beard === 'mustache') { R(9, H(11), 6, 1, bc); R(9, H(12), 1, 1, bc); R(14, H(12), 1, 1, bc); }

    // lágrima
    if (pose === 'sad' && !look.hood) R(9, H(10 + Math.floor((t * 5) % 4)), 1, 1, '#6ad0ff');

    // óculos
    const g = look.glasses;
    if (g) {
      const fc = g === 'sun' ? '#111111' : '#262626';
      for (const ex of [7, 13]) {
        R(ex, H(7), 4, 1, fc); R(ex, H(10), 4, 1, fc); R(ex, H(8), 1, 2, fc); R(ex + 3, H(8), 1, 2, fc);
        if (g === 'sun') { R(ex + 1, H(8), 2, 2, '#1a1a2a'); R(ex + 1, H(8), 1, 1, '#6a7aa0'); }
      }
      R(11, H(8), 2, 1, fc);
      if (g === 'square') { R(7, H(7), 4, 1, '#000000'); R(13, H(7), 4, 1, '#000000'); }
    }
    if (look.earrings) { R(6, H(10), 1, 1, look.earrings); R(17, H(10), 1, 1, look.earrings); }

    // chapéus
    const hat = look.hat;
    if (hat && hat.type) {
      const hc2 = hat.c || '#2f6fd0';
      if (hat.type === 'cap') { R(6, H(1), 12, 3, hc2); R(7, H(0), 10, 1, hc2); R(5, H(4), 14, 1, U.shade(hc2, -0.3)); R(11, H(1), 2, 1, hat.c2 || '#ffffff'); }
      if (hat.type === 'headband') R(6, H(5), 12, 1, hc2);
      if (hat.type === 'beanie') { R(6, H(0), 12, 5, hc2); R(6, H(4), 12, 1, U.shade(hc2, -0.25)); R(11, H(-1), 2, 1, '#ffffff'); }
      if (hat.type === 'tophat') { R(8, H(-3), 8, 5, hc2); R(5, H(2), 14, 1, hc2); R(8, H(0), 8, 1, '#c03030'); }
      if (hat.type === 'crown') {
        R(7, H(1), 10, 2, hc2); R(7, H(0), 1, 1, hc2); R(11, H(-1), 2, 2, hc2); R(16, H(0), 1, 1, hc2); R(9, H(0), 1, 1, hc2); R(14, H(0), 1, 1, hc2);
        R(11, H(1), 2, 1, '#e02040'); R(8, H(1), 1, 1, '#40a0ff'); R(15, H(1), 1, 1, '#40a0ff');
      }
    }
    if (pose !== 'happy') drawItem(look.item);

    function drawItem(item) {
      if (!item) return;
      const d = pose === 'sad' ? 1 : 0;
      switch (item) {
        case 'mic': R(20, 21 + d, 2, 4, '#333333'); R(19, 18 + d, 4, 3, '#bfbfbf'); R(20, 19 + d, 1, 1, '#7a7a7a'); break;
        case 'cup': R(19, 22 + d, 4, 3, '#ffffff'); R(19, 22 + d, 4, 1, '#6a3a1a'); R(23, 23 + d, 1, 1, '#ffffff'); break;
        case 'phone': R(20, 20 + d, 3, 5, '#222222'); R(21, 21 + d, 1, 3, Math.floor(t * 2) % 2 ? '#6ad0ff' : '#ffffff'); break;
        case 'accordion':
          R(5, 19, 14, 8, '#c02020'); for (const x of [8, 10, 12, 14]) R(x, 19, 1, 8, '#7a1010');
          R(5, 19, 2, 8, '#f4f4f4'); R(17, 19, 2, 8, '#f4f4f4'); R(4, 22, 2, 2, skin); R(18, 22, 2, 2, skin); break;
        case 'rocket': R(20, 17 + d, 2, 7, '#eeeeee'); R(20, 16 + d, 2, 1, '#d03030'); R(19, 22 + d, 1, 2, '#d03030'); R(22, 22 + d, 1, 2, '#d03030');
          R(20, 19 + d, 2, 1, '#4fa8ff'); break;
        case 'ball': R(19, 26 + d, 3, 3, '#ffffff'); R(20, 27 + d, 1, 1, '#111111'); R(19, 26 + d, 1, 1, '#111111'); break;
        case 'basketball': R(19, 26 + d, 3, 3, '#e07020'); R(20, 26 + d, 1, 3, '#5a2a0a'); R(19, 27 + d, 3, 1, '#5a2a0a'); break;
        case 'money': R(18, 23 + d, 5, 3, '#2a9a3a'); R(19, 24 + d, 3, 1, '#8fe09a'); R(18, 22 + d, 5, 1, '#3ab04a'); break;
        default: break;
      }
    }
    function drawTextScaled(str, cx, cy, col) {
      const s = px;
      const w = textWidth(str, 1);
      const gx = ox + Math.round((cx - w / 2) * s), gy = oy + (cy + Y0) * s;
      ctx.fillStyle = sil || col;
      for (let i = 0; i < str.length; i++) {
        const gg = glyph(str[i]);
        for (let p = 0; p < 15; p++) if (gg[p] === '1') ctx.fillRect(gx + (i * 4 + (p % 3)) * s, gy + Math.floor(p / 3) * s, s, s);
      }
    }
  }

  const charCache = new Map();
  /* Retrato estático (para menus). crop: número de linhas da grelha a mostrar. */
  function portrait(look, px = 2, opts = {}) {
    const key = JSON.stringify([look, px, opts.silhouette || '', opts.crop || 0, opts.pose || '']);
    if (charCache.has(key)) return charCache.get(key);
    const rows = opts.crop || GH;
    const cv = document.createElement('canvas');
    cv.width = GW * px; cv.height = rows * px;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawChar(ctx, look, 0, 0, px, { pose: opts.pose || 'idle', t: 0.3, silhouette: opts.silhouette });
    charCache.set(key, cv);
    return cv;
  }

  /* ---------- Bolas ---------- */
  const ballCache = new Map();
  function ballColor(set, id) {
    if (id === 0) return set.cue;
    if (id === 8) return set.eight;
    return set.colors[id > 8 ? id - 9 : id - 1];
  }
  function ballSprite(set, id, D) {
    const key = set.id + ':' + id + ':' + D;
    if (ballCache.has(key)) return ballCache.get(key);
    const cv = document.createElement('canvas');
    const pad = set.style === 'neon' ? 2 : 0;
    cv.width = cv.height = D + pad * 2;
    const ctx = cv.getContext('2d');
    const r = D / 2, base = ballColor(set, id), stripe = id >= 9;
    const rnd = U.seeded(id * 99 + D);
    if (pad) {
      ctx.globalAlpha = 0.35; ctx.fillStyle = base;
      for (let y = 0; y < D + 4; y++) for (let x = 0; x < D + 4; x++) {
        const dx = x + 0.5 - (r + 2), dy = y + 0.5 - (r + 2);
        if (dx * dx + dy * dy <= (r + 1.6) * (r + 1.6)) ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
      const dx = x + 0.5 - r, dy = y + 0.5 - r, d2 = dx * dx + dy * dy;
      if (d2 > r * r + 0.3) continue;
      let col = base;
      if (stripe && Math.abs(dy) > r * 0.45) col = set.style === 'galaxy' ? '#d8d4f0' : '#f6f2e6';
      if (id !== 0 && dx * dx + (dy + r * 0.05) * (dy + r * 0.05) < (r * 0.36) * (r * 0.36) && D >= 9) col = '#f6f2e6';
      if (set.style === 'football' && id === 0) {
        const pent = (Math.abs(dx) < r * 0.3 && Math.abs(dy) < r * 0.3) || (Math.abs(dx + r * 0.6) < r * 0.18 && Math.abs(dy - r * 0.4) < r * 0.2) || (Math.abs(dx - r * 0.6) < r * 0.18 && Math.abs(dy - r * 0.4) < r * 0.2);
        if (pent) col = '#151515';
      }
      if (set.style === 'galaxy' && rnd() < 0.08 && col !== '#f6f2e6') col = '#ffffff';
      const light = -(dx + dy) / (r * 1.6);
      const d = Math.sqrt(d2);
      if (set.style === 'retro') { if (d > r - 1.1) col = '#000000'; }
      else if (d > r - 1) col = U.shade(col, -0.35);
      else if (light > 0.45) col = U.shade(col, set.style === 'gold' ? 0.55 : 0.35);
      else if (light < -0.35) col = U.shade(col, -0.2);
      ctx.fillStyle = col; ctx.fillRect(x + pad, y + pad, 1, 1);
    }
    // brilho
    ctx.fillStyle = '#ffffff';
    const hx = Math.round(r * 0.55), hy = Math.round(r * 0.5);
    ctx.fillRect(hx + pad, hy + pad, D >= 9 ? 2 : 1, 1);
    if (D >= 11) ctx.fillRect(hx + pad, hy + 1 + pad, 1, 1);
    ballCache.set(key, cv);
    return cv;
  }

  /* ---------- Taco ---------- */
  function drawCue(ctx, cue, tipX, tipY, ang, len, t) {
    const dx = -Math.cos(ang), dy = -Math.sin(ang);
    const steps = Math.round(len);
    for (let s = 0; s < steps; s++) {
      const f = s / steps;
      let col, w = f < 0.5 ? 2 : 3;
      if (s < 2) col = cue.tip;
      else if (s < 4) col = '#f4f4f4';
      else if (f < 0.55) col = cue.shaft;
      else if (f < 0.6) col = cue.band;
      else col = cue.butt;
      switch (cue.style) {
        case 'stripes': if (f > 0.6 && Math.floor(s / 4) % 2) col = cue.band; break;
        case 'rainbow': if (s >= 4) col = `hsl(${(f * 360 + t * 120) % 360},90%,60%)`; break;
        case 'flame': if (f > 0.6 && (s + Math.floor(t * 12)) % 5 < 2) col = (s % 2) ? '#ffd23f' : '#ff6a00'; break;
        case 'carbon': if (f > 0.05 && (s % 2)) col = U.shade(col, 0.15); break;
        case 'sparkle': if (s >= 4 && ((s * 7 + Math.floor(t * 10)) % 23) === 0) col = '#ffffff'; break;
        default: break;
      }
      if (s === steps - 1) col = '#111111';
      const x = Math.round(tipX + dx * s - w / 2), y = Math.round(tipY + dy * s - w / 2);
      if (cue.style === 'glow' && s % 2 === 0) { ctx.globalAlpha = 0.25; ctx.fillStyle = cue.tip; ctx.fillRect(x - 1, y - 1, w + 2, w + 2); ctx.globalAlpha = 1; }
      ctx.fillStyle = col;
      ctx.fillRect(x, y, w, w);
    }
  }

  /* ---------- Ícones como imagens (para o HTML) ---------- */
  const ICONS = {
    coin: ['..YYYY..', '.YyyyyY.', 'YyYYYYyY', 'YyYyyYyY', 'YyYyyYyY', 'YyYYYYyY', '.YyyyyY.', '..YYYY..'],
    star: ['...YY...', '...YY...', 'YYYYYYYY', '.YYYYYY.', '..YYYY..', '.YYYYYY.', '.YY..YY.', 'Y......Y'],
    lock: ['..GGGG..', '.G....G.', '.G....G.', 'GGGGGGGG', 'GgggggGG', 'Ggg..ggG', 'GgggggGG', 'GGGGGGGG'],
    trophy: ['YYYYYYYY', 'Y.YYYY.Y', 'Y.YYYY.Y', '.YYYYYY.', '..YYYY..', '...YY...', '..YYYY..', '.yyyyyy.'],
  };
  const PAL = { Y: '#ffd23f', y: '#c8961a', G: '#9aa4b2', g: '#5a6472' };
  const iconURL = {};
  function buildIcons() {
    for (const k in ICONS) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 8;
      const ctx = cv.getContext('2d');
      ICONS[k].forEach((row, y) => [...row].forEach((ch, x) => { if (PAL[ch]) { ctx.fillStyle = PAL[ch]; ctx.fillRect(x, y, 1, 1); } }));
      iconURL[k] = cv.toDataURL();
    }
    const st = document.createElement('style');
    st.textContent = Object.keys(iconURL).map(k => `.ic-${k}{background-image:url(${iconURL[k]})}`).join('\n');
    document.head.appendChild(st);
  }

  return { drawText, textWidth, drawChar, portrait, ballSprite, ballColor, drawCue, buildIcons, GW, GH };
})();
