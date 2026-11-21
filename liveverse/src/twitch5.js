/* ===================== Fidelidade de plataforma: player, canal, chat e emotes ===================== */

Object.assign(IC, { flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>' });

/* ---------- Emotes globais do LiveVerse (desenhos próprios, 28 px no chat) ---------- */
function lvEmoteSVG(kind) {
  const face = (c, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><circle cx="28" cy="29" r="24" fill="${c}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>${inner}</svg>`;
  const eyes = '<circle cx="20" cy="24" r="3.4" fill="#1b1030"/><circle cx="36" cy="24" r="3.4" fill="#1b1030"/>';
  const S = {
    lvRir: face('#ffcf3f', '<path d="M14 23q6-6 12 0M30 23q6-6 12 0" stroke="#1b1030" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M15 31h26q-1 13-13 13T15 31z" fill="#1b1030"/><path d="M20 38q8 5 16 0" stroke="#ff6b8a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M10 26q-3 7 1 10M46 26q3 7-1 10" stroke="#57c7ff" stroke-width="3.4" fill="none" stroke-linecap="round"/>'),
    lvHype: face('#a970ff', '<circle cx="20" cy="23" r="5.5" fill="#fff"/><circle cx="36" cy="23" r="5.5" fill="#fff"/><circle cx="21" cy="24" r="2.8" fill="#1b1030"/><circle cx="37" cy="24" r="2.8" fill="#1b1030"/><ellipse cx="28" cy="38" rx="7" ry="6.5" fill="#1b1030"/><path d="M6 8l3 6M50 8l-3 6M28 1v6" stroke="#ffe066" stroke-width="3" stroke-linecap="round"/>'),
    lvGG: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><path d="M15 6h26v14a13 13 0 0 1-26 0z" fill="#ffc83d" stroke="#8a5a00" stroke-width="2"/><path d="M15 10H7q0 12 10 13M41 10h8q0 12-10 13" stroke="#ffc83d" stroke-width="4" fill="none"/><rect x="24" y="32" width="8" height="9" fill="#e0a21b"/><rect x="15" y="41" width="26" height="8" rx="2" fill="#9147ff"/><text x="28" y="20" font-family="Arial,sans-serif" font-weight="900" font-size="11" text-anchor="middle" fill="#8a5a00">GG</text></svg>',
    lvAmor: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><path d="M28 50S5 35 5 19A11.5 11.5 0 0 1 28 13a11.5 11.5 0 0 1 23 6c0 16-23 31-23 31z" fill="#9147ff" stroke="#3b1580" stroke-width="2"/><path d="M15 17q3-5 8-4" stroke="#fff" stroke-opacity=".7" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>',
    lvOmg: face('#7fd1ff', '<circle cx="20" cy="22" r="6" fill="#fff"/><circle cx="36" cy="22" r="6" fill="#fff"/><circle cx="20" cy="22" r="2.6" fill="#1b1030"/><circle cx="36" cy="22" r="2.6" fill="#1b1030"/><ellipse cx="28" cy="39" rx="4.5" ry="6" fill="#1b1030"/><path d="M14 13l6 2M42 13l-6 2" stroke="#1b1030" stroke-width="3" stroke-linecap="round"/>'),
    lvChoro: face('#8fb3ff', eyes + '<path d="M19 42q9-8 18 0" stroke="#1b1030" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M18 29q-3 6 0 10q3-4 0-10zM38 29q-3 6 0 10q3-4 0-10z" fill="#2a7dff"/>'),
    lvFogo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><path d="M28 3c3 10 15 15 15 30a15 15 0 0 1-30 0c0-7 4-11 7-14 0 5 2 8 5 9-2-9 0-17 3-25z" fill="#ff5a1f" stroke="#8a1c00" stroke-width="2"/><path d="M28 27c2 5 8 7 8 14a8 8 0 0 1-16 0c0-4 3-6 4-8 1 3 2 4 3 4-1-4 0-7 1-10z" fill="#ffd23f"/></svg>',
    lvPiscar: face('#ffcf3f', '<circle cx="20" cy="24" r="3.4" fill="#1b1030"/><path d="M32 24h8" stroke="#1b1030" stroke-width="3.4" stroke-linecap="round"/><path d="M18 35q10 9 20 0" stroke="#1b1030" stroke-width="3.4" fill="none" stroke-linecap="round"/>'),
    lvRaiva: face('#ff5c5c', '<path d="M14 17l9 4M42 17l-9 4" stroke="#1b1030" stroke-width="3.4" stroke-linecap="round"/><circle cx="20" cy="26" r="3" fill="#1b1030"/><circle cx="36" cy="26" r="3" fill="#1b1030"/><path d="M19 41q9-7 18 0" stroke="#1b1030" stroke-width="3.4" fill="none" stroke-linecap="round"/>'),
    lvPop: face('#ffe7a3', '<circle cx="20" cy="24" r="3.4" fill="#1b1030"/><circle cx="36" cy="24" r="3.4" fill="#1b1030"/><path d="M17 33q11 10 22 0" stroke="#1b1030" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M38 40l10-4-2 14-12-2z" fill="#ff4f4f"/><circle cx="43" cy="37" r="3" fill="#fff"/><circle cx="47" cy="35" r="2.4" fill="#fff"/>'),
  };
  return 'data:image/svg+xml,' + encodeURIComponent(S[kind]);
}
const GLOBAL_EMOTES = ['lvRir', 'lvHype', 'lvGG', 'lvAmor', 'lvOmg', 'lvChoro', 'lvFogo', 'lvPiscar', 'lvRaiva', 'lvPop'].map(code => ({ code, img: lvEmoteSVG(code), global: true }));

/* ---------- Player: barra inferior e menu de definições com submenus ---------- */
UI.qPanel = 'main'; UI.vstats = false;
function playerCtrlHTML(accId) {
  const P = playerPrefs(), muted = P.muted || P.vol === 0;
  const qLabel = (QUALITIES.find(q => q[0] === P.q) || QUALITIES[0])[1];
  const panel = UI.qPanel || 'main';
  const row = (act, label, val, extra = '') => `<button data-act="${act}" ${extra}><span>${label}</span>${val != null ? `<em>${esc(val)}</em>` : ''}${icon('chevR')}</button>`;
  const tog = (act, label, on) => `<button data-act="${act}" class="pq-tog" role="switch" aria-checked="${on}"><span>${label}</span><i class="sw ${on ? 'on' : ''}"></i></button>`;
  const menu = !UI.qOpen ? '' : panel === 'q'
    ? `<div class="pq-menu pq-sub"><button class="pq-back" data-act="pq-go" data-p="main">${icon('chevL')}<b>Qualidade</b></button>${QUALITIES.map(([k, l]) => `<button data-act="player-qset" data-q="${k}" class="pq-radio ${P.q === k ? 'on' : ''}"><i></i>${l}</button>`).join('')}</div>`
    : panel === 'adv'
      ? `<div class="pq-menu pq-sub"><button class="pq-back" data-act="pq-go" data-p="main">${icon('chevL')}<b>Avançado</b></button>${tog('pq-stats', 'Estatísticas de vídeo', !!UI.vstats)}${tog('pq-lowlat', 'Baixa latência', P.lowLat !== false)}</div>`
      : `<div class="pq-menu">${row('pq-go', 'Qualidade', qLabel, 'data-p="q"')}${row('pq-go', 'Avançado', null, 'data-p="adv"')}<button data-act="pq-report"><span>Comunicar problema de reprodução</span></button></div>`;
  return `<div class="wp-ctrl">
    <button class="wp-ic" data-act="player-pause" aria-label="Pausa (espaço)">${icon('pause')}</button>
    <div class="pv-vol"><button class="wp-ic ${muted ? 'muted' : ''}" data-act="player-vol" aria-label="${muted ? 'Ligar som (m)' : 'Silenciar (m)'}">${icon(muted ? 'volMute' : 'vol')}</button><input type="range" class="pv-range" data-pvol min="0" max="1" step="0.05" value="${muted ? 0 : P.vol}" aria-label="Volume" style="--v:${(muted ? 0 : P.vol) * 100}%"></div>
    <span class="wp-ctrl-live"><i></i>EM DIRETO</span><span class="spacer"></span>
    <button class="wp-ic" data-act="w-clip" data-id="${accId}" aria-label="Clipe (alt+x)">${icon('clip')}</button>
    <div class="tn-drop-wrap"><button class="wp-ic ${UI.qOpen ? 'on' : ''}" data-act="player-q" aria-label="Definições" aria-expanded="${!!UI.qOpen}">${icon('gear')}</button>${menu}</div>
    <button class="wp-ic" data-act="w-full" aria-label="${UI.watchFull ? 'Sair do modo teatro (t)' : 'Modo teatro (t)'}">${icon('theaterIc')}</button>
    <button class="wp-ic" data-act="player-fs" aria-label="${document.fullscreenElement ? 'Sair do ecrã inteiro (f)' : 'Ecrã inteiro (f)'}">${icon('expand')}</button>
  </div>`;
}

/* estatísticas de vídeo (fictícias), como o painel avançado de um leitor real */
let vstatsT = null;
function vstatsPaint() {
  const v = $('.wp-video'); if (!v) return;
  let box = v.querySelector('.vstats');
  if (!UI.vstats) { if (box) box.remove(); return; }
  if (!box) { box = document.createElement('div'); box.className = 'vstats'; v.appendChild(box); }
  const P = playerPrefs();
  const q = P.q === 'auto' ? '1080' : P.q;
  const res = { 1080: '1920x1080', 720: '1280x720', 480: '852x480', 360: '640x360', 160: '284x160' }[q];
  const kbps = { 1080: 6000, 720: 3500, 480: 1500, 360: 700, 160: 230 }[q];
  const low = P.lowLat !== false;
  const lat = (low ? 1.1 + Math.random() * .7 : 4.2 + Math.random() * 1.4).toFixed(2);
  const rows = [['Resolução de vídeo', res], ['Resolução de apresentação', `${v.clientWidth}x${v.clientHeight}`], ['FPS', q === '480' || q === '360' || q === '160' ? '30' : '60'], ['Velocidade de transferência', `${dots(Math.round(kbps * (.9 + Math.random() * .2)))} Kbps`], ['Latência até ao emissor', `${lat} s`], ['Tamanho do buffer', `${(low ? 1.4 + Math.random() * .5 : 4 + Math.random()).toFixed(2)} s`], ['Fotogramas perdidos', String(Math.floor(Math.random() * 3))], ['Modo de latência', low ? 'Baixa latência' : 'Normal']];
  box.innerHTML = `<b>Estatísticas de vídeo <small>(simuladas)</small></b>${rows.map(([k, val]) => `<span><i>${k}</i>${val}</span>`).join('')}<button data-act="pq-stats" aria-label="Fechar estatísticas">${icon('close')}</button>`;
}

/* ---------- Barra do canal: partilhar e mais opções ---------- */
function moreMenuHTML(a) {
  return `<div class="tw-pop wp-more-pop" role="menu">
    <a role="menuitem" href="#conta-${a.id}">${icon('user')} Ver perfil</a>
    <button role="menuitem" data-act="wp-share" data-id="${a.id}">${icon('share')} Partilhar</button>
    <button role="menuitem" data-act="chat-collapse">${icon('collapseR')} ${UI.chatCollapsed ? 'Mostrar chat' : 'Esconder chat'}</button>
    <button role="menuitem" data-act="wp-report">${icon('flag')} Denunciar transmissão</button>
  </div>`;
}
function closeTwPops() { $$('.tw-pop').forEach(p => p.remove()); }

const TW5_ACT = {
  'pq-go': b => { UI.qPanel = b.dataset.p; paintPlayerCtrl(); },
  'pq-stats': () => { UI.vstats = !UI.vstats; clearInterval(vstatsT); if (UI.vstats) vstatsT = setInterval(vstatsPaint, 1000); vstatsPaint(); if ($('.pq-menu')) paintPlayerCtrl(); },
  'pq-lowlat': () => { const P = playerPrefs(); P.lowLat = P.lowLat === false; save(); paintPlayerCtrl(); vstatsPaint(); playerOverlay('', 600); },
  'pq-report': () => { UI.qOpen = false; UI.qPanel = 'main'; paintPlayerCtrl(); toast('✅', 'Obrigado! O relatório de reprodução foi enviado (simulação).'); },
  'wp-share': b => {
    closeTwPops();
    const url = location.href.split('#')[0] + chanHash(b.dataset.id);
    const done = () => toast('🔗', 'Link copiado para a área de transferência');
    try { navigator.clipboard.writeText(url).then(done, done); } catch (e) { done(); }
  },
  'wp-more': b => {
    const open = $('.wp-more-pop'); closeTwPops(); if (open) return;
    const a = S.accounts.find(x => x.id === b.dataset.id); if (!a) return;
    const wrap = document.createElement('div'); wrap.innerHTML = moreMenuHTML(a);
    const pop = wrap.firstElementChild; document.body.appendChild(pop);
    const r = b.getBoundingClientRect();
    pop.style.top = (r.bottom + 6) + 'px'; pop.style.left = Math.max(8, Math.min(innerWidth - pop.offsetWidth - 8, r.right - pop.offsetWidth)) + 'px';
  },
  'wp-report': () => { closeTwPops(); toast('🛡️', 'Denúncia registada (simulação). A equipa fictícia vai analisar.'); },
};

/* ---------- Integração ---------- */
function tw5Init() {
  // fechar menus ao clicar fora e voltar ao painel principal das definições
  document.addEventListener('click', e => {
    if (!e.target.closest('.tw-pop, [data-act="wp-more"]')) closeTwPops();
    if (!UI.qOpen) UI.qPanel = 'main';
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeTwPops(); if (UI.qOpen) { UI.qOpen = false; UI.qPanel = 'main'; paintPlayerCtrl(); } }
    if (e.altKey && (e.key === 'x' || e.key === 'X' || e.code === 'KeyX')) { const c = $('.wp-ctrl [data-act="w-clip"]'); if (c) { e.preventDefault(); c.click(); } }
  });
  // trilho do volume preenchido até ao valor (como num leitor real)
  document.addEventListener('input', e => { if (e.target.hasAttribute && e.target.hasAttribute('data-pvol')) e.target.style.setProperty('--v', (+e.target.value * 100) + '%'); });
  // ao abrir/fechar o ecrã inteiro, o rótulo do botão muda
  document.addEventListener('fullscreenchange', () => { if ($('.wp-ctrl')) paintPlayerCtrl(); });
  // estatísticas continuam depois de mudar de página
  addEventListener('hashchange', () => { closeTwPops(); setTimeout(vstatsPaint, 60); });
}
