// Desenha o avatar em SVG a partir dos IDs dos itens.
(function () {
  const val = (slot, id) => (Catalog.CATALOG.avatar[slot].find((i) => i.id === id) || Catalog.CATALOG.avatar[slot][0]).value;

  function bg(v, uid) {
    if (v === 'sunset') return `<defs><linearGradient id="g${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7e5f"/><stop offset="1" stop-color="#feb47b"/></linearGradient></defs><rect width="100" height="100" fill="url(#g${uid})"/>`;
    if (v === 'galaxy') return `<defs><radialGradient id="g${uid}"><stop offset="0" stop-color="#5b2a86"/><stop offset="1" stop-color="#0b0b2b"/></radialGradient></defs><rect width="100" height="100" fill="url(#g${uid})"/>` +
      [[15,20],[80,15],[70,80],[25,75],[50,10],[90,50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff"/>`).join('');
    return `<rect width="100" height="100" fill="${v}"/>`;
  }
  function hair(style, c) {
    switch (style) {
      case 'short': return `<path d="M28 44 Q30 22 50 21 Q70 22 72 44 Q66 32 50 31 Q34 32 28 44Z" fill="${c}"/>`;
      case 'long': return `<path d="M26 70 Q22 24 50 21 Q78 24 74 70 L68 70 Q70 36 50 32 Q30 36 32 70Z" fill="${c}"/>`;
      case 'curly': return [[32,32],[42,25],[54,24],[65,30],[70,40],[29,42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}"/>`).join('');
      case 'mohawk': return `<path d="M44 34 L46 8 L50 14 L54 8 L56 34Z" fill="${c}"/>`;
      case 'buns': return `<circle cx="31" cy="25" r="9" fill="${c}"/><circle cx="69" cy="25" r="9" fill="${c}"/><path d="M28 42 Q30 24 50 23 Q70 24 72 42 Q64 32 50 32 Q36 32 28 42Z" fill="${c}"/>`;
      default: return '';
    }
  }
  function eyes(style) {
    switch (style) {
      case 'happy': return `<path d="M38 50 q4 -5 8 0 M54 50 q4 -5 8 0" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      case 'wink': return `<circle cx="42" cy="49" r="3" fill="#222"/><path d="M54 49 h8" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>`;
      case 'star': return ['42', '58'].map((x) => `<text x="${x}" y="53" font-size="10" text-anchor="middle">⭐</text>`).join('');
      default: return `<circle cx="42" cy="49" r="3" fill="#222"/><circle cx="58" cy="49" r="3" fill="#222"/>`;
    }
  }
  function acc(a) {
    switch (a) {
      case 'glasses': return `<g stroke="#222" stroke-width="2" fill="none"><circle cx="42" cy="49" r="6"/><circle cx="58" cy="49" r="6"/><path d="M48 49h4"/></g>`;
      case 'shades': return `<g fill="#111"><rect x="34" y="44" width="14" height="9" rx="3"/><rect x="52" y="44" width="14" height="9" rx="3"/><rect x="47" y="46" width="6" height="2"/></g>`;
      case 'cap': return `<path d="M27 38 Q30 18 50 18 Q70 18 73 38Z" fill="#e63946"/><rect x="50" y="34" width="32" height="5" rx="2.5" fill="#b71c2c"/>`;
      case 'headphones': return `<path d="M26 50 Q26 18 50 18 Q74 18 74 50" stroke="#222" stroke-width="4" fill="none"/><rect x="21" y="44" width="9" height="16" rx="4" fill="#ff2e63"/><rect x="70" y="44" width="9" height="16" rx="4" fill="#ff2e63"/>`;
      case 'crown': return `<path d="M34 24 L38 10 L44 20 L50 6 L56 20 L62 10 L66 24Z" fill="#f2c94c" stroke="#c9a227" stroke-width="1.5"/>`;
      default: return '';
    }
  }
  let n = 0;
  window.renderAvatar = function (a, size = 64) {
    a = { ...Catalog.defaultAvatar(), ...(a || {}) };
    const uid = ++n;
    const skin = val('skin', a.skin), hc = val('hairColor', a.hairColor), out = val('outfit', a.outfit);
    const hairStyle = val('hair', a.hair);
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avatar-svg" aria-hidden="true">
      ${bg(val('bg', a.bg), uid)}
      <path d="M18 100 Q20 74 50 72 Q80 74 82 100Z" fill="${out}"/>
      <rect x="44" y="62" width="12" height="12" fill="${skin}"/>
      ${hairStyle === 'long' ? hair('long', hc) : ''}
      <ellipse cx="50" cy="48" rx="22" ry="24" fill="${skin}"/>
      ${eyes(val('eyes', a.eyes))}
      <path d="M43 60 Q50 65 57 60" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${hairStyle !== 'long' ? hair(hairStyle, hc) : ''}
      ${acc(val('accessory', a.accessory))}
    </svg>`;
  };
})();
