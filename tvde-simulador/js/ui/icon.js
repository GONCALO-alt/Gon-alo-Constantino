// Ícone da app RIDO Driver: um «R» com uma rota que termina no ponto de recolha.
export const RIDO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2433"/><stop offset="1" stop-color="#05070b"/></linearGradient>
<linearGradient id="rt" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#4aa3ff"/><stop offset="1" stop-color="#22c55e"/></linearGradient>
</defs>
<rect width="120" height="120" rx="27" fill="url(#bg)"/>
<path d="M38 88V32h22c13 0 21 7 21 18 0 9-5 15-13 17l15 21" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 104c18-2 30-10 38-22" fill="none" stroke="url(#rt)" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/>
<circle cx="92" cy="26" r="9" fill="#22c55e"/><circle cx="92" cy="26" r="3.5" fill="#05070b"/>
</svg>`;
export const RIDO_ICON = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(RIDO_SVG);
