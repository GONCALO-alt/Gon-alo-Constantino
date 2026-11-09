/* KART MENTAL PRO — ícones SVG (traço). */
(function () {
  'use strict';
  const P = {
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    palette: '<circle cx="7" cy="8" r="2.5"/><circle cx="17" cy="8" r="2.5"/><circle cx="7" cy="16" r="2.5"/><circle cx="17" cy="16" r="2.5"/>',
    lights: '<rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="6.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="17.5" cy="12" r="1.6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    calc: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>',
    stroop: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
    diff: '<rect x="2" y="5" width="9" height="14" rx="1.5"/><rect x="13" y="5" width="9" height="14" rx="1.5"/><circle cx="17.5" cy="10" r="1.5"/>',
    digits: '<path d="M4 8l2-2v12M10 8a2 2 0 0 1 4 0c0 2-4 4-4 6h4M17 6h3l-2 4a2.5 2.5 0 1 1-2 4"/>',
    track: '<path d="M5 18c-2 0-3-2-2-4l3-7c1-2 3-3 5-2l2 1c1 .5 2 0 3-1 2-2 5 0 4 2l-2 4c-1 2 0 3 1 4 1 2-1 4-3 3H5z"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V4.5A2.5 2.5 0 0 0 9 4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    home: '<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    dumbbell: '<path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4c0 3 2 5 4 5M16 6h4c0 3-2 5-4 5M12 13v4M8 21h8M9 17h6"/>',
    fire: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chev: '<path d="m9 5 7 7-7 7"/>',
    back: '<path d="m15 5-7 7 7 7"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
    gauge: '<path d="M4 16a8 8 0 1 1 16 0M12 16l4-5"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>',
    medal: '<circle cx="12" cy="15" r="6"/><path d="M8 3l2 6M16 3l-2 6M10.5 15l1.5-2v5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    helmet: '<path d="M3 14a9 9 0 0 1 18 0v3H9l-2 3H4a1 1 0 0 1-1-1zM13 9h8"/>',
  };
  window.KMP.icon = (name, cls) =>
    `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.flag}</svg>`;
})();
