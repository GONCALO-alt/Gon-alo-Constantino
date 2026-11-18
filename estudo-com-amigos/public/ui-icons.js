// Ícones do Shoalmates: desenhados à mão em SVG (24×24, traço de 2 px), seguem a cor do texto.
// Uso: icon('flame') devolve o <svg>; no HTML, <i data-icon="flame"></i> é preenchido por paintIcons().

const P = {
  bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 17h5"/><circle cx="12" cy="3.5" r="1"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 5.2a3.3 3.3 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20.5c.8-4 3.9-6.5 8-6.5s7.2 2.5 8 6.5"/>',
  star: '<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8z"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5"/><circle cx="12" cy="12" r="6.6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.8h5M12 2.8V6"/>',
  message: '<path d="M4 5.5h16v10.5H9.5L5 20v-4H4z"/>',
  swords: '<path d="M3.5 3.5 14 14M11 17l6-6M15.5 15.5l4 4M20.5 3.5 10 14M7 11l6 6M8.5 15.5l-4 4"/>',
  note: '<path d="M6 3.5h8.5L19 8v12.5H6z"/><path d="M14 3.5V8.5h5M9 12.5h6M9 16h6"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H4.5c0 3 1.5 4.5 3.7 4.8M16 5.5h3.5c0 3-1.5 4.5-3.7 4.8M12 13v3.5M8.5 20.5h7M9.5 20.5l.8-4h3.4l.8 4"/>',
  medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.5 10.5 5.5 3.5h4L12 9M15.5 10.5l3-7h-4L12 9M12 12.6l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>',
  bag: '<path d="M5 8h14l-1 12.5H6z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  chart: '<path d="M4 4v16h16"/><path d="M7.5 15l3.5-4 3 2.5 5-6.5"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 10.5h7M8.5 14h7M8.5 17.5h4"/>',
  pen: '<path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19z"/><path d="M14 7l3 3"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
  speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  speakerOff: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  camera: '<path d="M3.5 8h4l1.5-2.5h6L16.5 8h4v11.5h-17z"/><circle cx="12" cy="13.5" r="3.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8.3.5 2.1 1.6 3.1 2.6 3.6C12.2 7 13 4.4 15 2.8c.1 3.4 3.5 5.6 3.5 11.5 0 4.1-2.8 6.7-6.5 6.7z"/><path d="M12 21c-1.6 0-2.8-1.1-2.8-2.8 0-1.8 1.6-2.8 2.2-4.4 1.2 1 3.4 2.4 3.4 4.4S13.6 21 12 21z"/>',
  fish: '<path d="M3 12c3-4.5 9-6 13.5-2.6L21 6.5v11l-4.5-2.9C12 18 6 16.5 3 12z"/><circle cx="8.5" cy="11" r=".9" fill="currentColor"/>',
  send: '<path d="M4 12 20.5 4 16 20.5l-4-7z"/><path d="M12 13.5 20.5 4"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.5 9.5"/>',
  xCircle: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5C10 4 6.5 5 7.5 7.2 8.3 8.6 12 8.5 12 8.5zM12 8.5c2-4.5 5.5-3.5 4.5-1.3-.8 1.4-4.5 1.3-4.5 1.3z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16.5 6.5l2.5 2.5M14 9l2 2"/>',
  book: '<path d="M4 5.5C6.5 4 9.5 4 12 5.5v14c-2.5-1.5-5.5-1.5-8 0zM12 5.5c2.5-1.5 5.5-1.5 8 0v14c-2.5-1.5-5.5-1.5-8 0z"/>',
  bulb: '<path d="M9 17.5h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
  scale: '<path d="M12 4v16M7 20.5h10M5 7.5h14M5 7.5l-2.5 6a2.8 2.8 0 0 0 5 0zM19 7.5l-2.5 6a2.8 2.8 0 0 0 5 0z"/>',
  teacher: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.6 1.5 3.4 2.2 5.5 2.2s3.9-.7 5.5-2.2V11M21.5 9v5"/>',
  alert: '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  shield: '<path d="M12 3 19.5 6v5.5c0 4.6-3 8-7.5 9.5-4.5-1.5-7.5-4.9-7.5-9.5V6z"/>',
  crown: '<path d="M3.5 8.5 7.5 13 12 6l4.5 7 4-4.5-1.5 10h-14z"/>',
  gem: '<path d="M6.5 4h11l3.5 5-9 11L3 9z"/><path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5"/>',
  sparkles: '<path d="M10 3.5 11.6 8.4 16.5 10l-4.9 1.6L10 16.5l-1.6-4.9L3.5 10l4.9-1.6zM18 14l.8 2.2 2.2.8-2.2.8L18 20l-.8-2.2-2.2-.8 2.2-.8z"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  sunrise: '<path d="M3.5 18.5h17M7.5 18.5a4.5 4.5 0 0 1 9 0M12 4.5v6M9 7.5l3-3 3 3"/>',
  zap: '<path d="M13 2.5 4.5 13.5H12L11 21.5l8.5-11H12z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  coffee: '<path d="M4.5 9h12v5.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM16.5 10.5h1.5a2.5 2.5 0 0 1 0 5h-1.5M8 3.5c-.8 1 .8 2-0 3M12 3.5c-.8 1 .8 2 0 3"/>',
  trendUp: '<path d="m3.5 17 6-6 4 4 7-7.5"/><path d="M15 7.5h5.5V13"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  flag: '<path d="M5.5 21V4M5.5 4.5h11l-2 4 2 4h-11"/>',
  hourglass: '<path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 5 4.5 6 4.5 8.5S7.5 15.5 7.5 20.5M16.5 3.5c0 5-4.5 6-4.5 8.5s4.5 3.5 4.5 8.5"/>',
  owl: '<path d="M5.5 5.5 8 8M18.5 5.5 16 8"/><path d="M5.5 5.5c-1 5 0 14 6.5 15 6.5-1 7.5-10 6.5-15-2 1.5-4 2.5-6.5 2.5S7.5 7 5.5 5.5z"/><circle cx="9.3" cy="11.5" r="1.6"/><circle cx="14.7" cy="11.5" r="1.6"/><path d="m11 14.5 1 1.2 1-1.2"/>',
  pencil: '<path d="M15 4.5 19.5 9 9 19.5H4.5V15z"/><path d="M13 6.5 17.5 11"/>',
  wave: '<path d="M2.5 9c2.5-2.5 4.5-2.5 7 0s4.5 2.5 7 0 3.5-2 5-1M2.5 15c2.5-2.5 4.5-2.5 7 0s4.5 2.5 7 0 3.5-2 5-1"/>',
  shell: '<path d="M12 20.5c-5 0-8.5-3.5-8.5-8.5a8.5 8.5 0 0 1 17 0c0 5-3.5 8.5-8.5 8.5z"/><path d="M12 20.5V5M12 20.5l-5-13M12 20.5l5-13M12 20.5 4 11M12 20.5l8-9.5"/>',
  octopus: '<path d="M6.5 12a5.5 5.5 0 0 1 11 0v2"/><path d="M6.5 12v2c0 2.5-2 3.5-3.5 3.5M9.5 14.5c0 3-1 4.5-2.5 5.5M12 14.5v6M14.5 14.5c0 3 1 4.5 2.5 5.5M17.5 14c0 2.5 2 3.5 3.5 3.5"/><circle cx="10" cy="10" r=".9" fill="currentColor"/><circle cx="14" cy="10" r=".9" fill="currentColor"/>',
  shark: '<path d="M2.5 15c4-1 7-1.5 10-1.5l1-6.5 4 6.8c1.7.4 3 .9 4 1.7-3 2.5-8 3.5-13 2-2.5-.6-4.5-1.5-6-2.5z"/><path d="M21.5 15.5 20 12M8 16.5v-1.5"/>',
  whale: '<path d="M3.5 13c0 4 3.5 6.5 8 6.5 5 0 8-3 8-7.5 0-1 .3-2 1.5-2.5-1.5-.7-3-.4-4 .5-1 .9-1.5 2.5-3.5 3-2.5.6-5 .5-10 0z"/><path d="M8 9c0-2 1-3 2-3.5M8 9c0-2-1-3-2-3.5"/><circle cx="7.5" cy="15" r=".8" fill="currentColor"/>',
  trident: '<path d="M12 21V8M6 4v4a6 6 0 0 0 12 0V4M12 3v5M6 4 4.8 5.5M6 4l1.2 1.5M18 4l-1.2 1.5M18 4l1.2 1.5M12 3l-1.2 1.5M12 3l1.2 1.5"/>',
  pearl: '<path d="M3.5 14.5c2-6 15-6 17 0-2 4.5-15 4.5-17 0z"/><circle cx="12" cy="11" r="3"/><path d="M11 10h.01"/>',
  bubble: '<circle cx="9" cy="13.5" r="5.5"/><circle cx="17" cy="7" r="3"/><circle cx="18.5" cy="15.5" r="1.8"/><path d="M6.8 11.5a2.5 2.5 0 0 1 2.2-1.5"/>',
};

export const ICON_NAMES = Object.keys(P);

export function icon(name, cls = '') {
  const body = P[name] ?? P.star;
  return `<svg class="ic${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}

// Preenche todos os <x data-icon="nome"> (só uma vez por elemento)
export function paintIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    if (el.dataset.painted === el.dataset.icon) return;
    el.innerHTML = icon(el.dataset.icon);
    el.dataset.painted = el.dataset.icon;
  });
}

// ---------- avatares: peixes desenhados em SVG ----------
// Cada avatar: corpo, barbatana, padrão e um acessório opcional.
const FISH = {
  a1: ['#5a3ce6', '#ff8a3d', ''],        a2: ['#ff8a3d', '#ffd3b3', ''],       a3: ['#1fa36b', '#9be3c3', ''],
  a4: ['#2f7de0', '#9cc7ff', ''],        a5: ['#e0435a', '#ffb3be', 'stripes'], a6: ['#f5b301', '#fff0b3', 'dots'],
  a7: ['#0e9aa7', '#a6eef3', 'stripes'], a8: ['#9b4dff', '#e0c9ff', 'dots'],   a9: ['#ff5a1f', '#ffd3b3', 'stripes'],
  a10: ['#3f24c9', '#ffb84d', 'scales'], a11: ['#178a59', '#f5b301', 'scales'], a12: ['#d8344e', '#5a3ce6', 'dots'],
  a13: ['#222034', '#7a5cff', 'scales'], a14: ['#ff6fb1', '#ffe0ef', 'stripes'], a15: ['#f5b301', '#ff5a1f', 'crown'],
  // especiais (conquistas)
  s1: ['#2b2d5c', '#f5e27a', 'moon'],   s2: ['#ff9f43', '#ffe08a', 'sun'],    s3: ['#5d6b82', '#c9d3e3', 'shield'],
  s4: ['#7a5cff', '#c9b8ff', 'shield'], s5: ['#ff5a1f', '#ffb84d', 'flame'],  s6: ['#178a59', '#ffffff', 'pencil'],
  s7: ['#4fb3c9', '#e4fbff', 'gem'],    s8: ['#5a3ce6', '#ffffff', 'glasses'],
};
export const FISH_IDS = Object.keys(FISH);

export function fish(id) {
  const [body, fin, extra] = FISH[id] ?? FISH.a1;
  const pattern = {
    stripes: `<path d="M27 15v20M35 13v24" stroke="${fin}" stroke-width="3.5" stroke-linecap="round" opacity=".85"/>`,
    dots: `<circle cx="28" cy="20" r="2.4" fill="${fin}"/><circle cx="35" cy="28" r="2.4" fill="${fin}"/><circle cx="26" cy="31" r="2" fill="${fin}"/>`,
    scales: `<path d="M24 22a4 4 0 0 0 8 0M32 22a4 4 0 0 0 8 0M28 29a4 4 0 0 0 8 0" stroke="${fin}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  }[extra] ?? '';
  const acc = {
    crown: `<path d="M34 9l3 4 3-6 3 6 3-4-1.5 7h-9z" fill="#f5b301" stroke="#b37f00" stroke-width="1"/>`,
    moon: `<path d="M48 9a5 5 0 1 0 5 7 4 4 0 0 1-5-7z" fill="${fin}"/>`,
    sun: `<circle cx="49" cy="11" r="3.5" fill="${fin}"/><path d="M49 4.5v2M49 15.5v2M42.5 11h2M53.5 11h2" stroke="${fin}" stroke-width="1.6" stroke-linecap="round"/>`,
    shield: `<path d="M24 22l6-2.5 6 2.5v4.5c0 3.5-2.5 6-6 7-3.5-1-6-3.5-6-7z" fill="${fin}" opacity=".95"/>`,
    flame: `<path d="M47 4c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1.5 1 2 1.5 2 0-2.5-.5-4.5.5-6z" fill="${fin}"/>`,
    pencil: `<path d="M23 34l13-13 3 3-13 13h-3z" fill="${fin}" opacity=".9"/>`,
    gem: `<path d="M44 6h7l2.5 3.5L47.5 16 41.5 9.5z" fill="${fin}" stroke="#2a7f91" stroke-width="1"/>`,
    glasses: `<circle cx="44" cy="23" r="4" fill="none" stroke="#fff" stroke-width="2"/><path d="M48 23h3" stroke="#fff" stroke-width="2"/>`,
  }[extra] ?? '';
  return `<svg class="fish-av" viewBox="0 0 60 50" aria-hidden="true">
    <path d="M8 25 0 13v24z" fill="${fin}"/>
    <path d="M7 25c6-12 20-17 33-14 9 2 15 8 17 14-2 6-8 12-17 14-13 3-27-2-33-14z" fill="${body}"/>
    <path d="M25 13c3-6 9-8 14-6l-4 6z" fill="${fin}"/>
    ${pattern}
    <circle cx="45" cy="22" r="4.2" fill="#fff"/><circle cx="46" cy="22" r="2.2" fill="#1d1a2e"/>
    <path d="M52 30c-1.5 1.5-3.5 1.5-5 .5" stroke="#1d1a2e" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${acc}
  </svg>`;
}

// ---------- emblemas (medalhas, conquistas, ligas) ----------
export function badge(iconName, color, cls = '') {
  return `<span class="badge-ic ${cls}" style="--bc:${color}">${icon(iconName)}</span>`;
}

export const TIERS = [
  { ic: 'medal', color: '#c47a3a' }, // Bronze
  { ic: 'medal', color: '#8f9bb0' }, // Prata
  { ic: 'trophy', color: '#e0a400' }, // Ouro
  { ic: 'gem', color: '#2fa4b9' }, // Platina
  { ic: 'gem', color: '#7a5cff' }, // Diamante
];
export const tierBadge = tier => badge(TIERS[tier]?.ic ?? 'medal', TIERS[tier]?.color ?? '#c47a3a', 'tier');

// Reações rápidas na sala (nomes que o servidor aceita)
export const REACTIONS = ['flame', 'zap', 'heart', 'sparkles', 'moon', 'coffee'];
