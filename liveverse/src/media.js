/* =====================================================================
   Câmara, ecrã do jogo, gravação e formato da live (horizontal/vertical).
   O vídeo fica só no teu navegador: nada é enviado para lado nenhum.
   Dentro do Claude o navegador bloqueia a câmara e o ecrã; funciona no
   site do Cloudflare ou ao abrir o ficheiro no Chrome.
   ===================================================================== */
Object.assign(IC, {
  camera: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/>',
  monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  rec: '<circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/>',
  vertical: '<rect x="7" y="2.5" width="10" height="19" rx="2"/>',
  horizontal: '<rect x="2.5" y="7" width="19" height="10" rx="2"/>',
  flip: '<path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M20 4v4h-4M4 20v-4h4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
});
const MEDIA = { cam: null, screen: null, rec: null, chunks: [], recStart: 0, recTimer: null, facing: 'user', lastUrl: null, compose: null };
const inClaude = () => !!(window.claude && typeof window.claude.use === 'function');

function mediaError(e, what) {
  const n = e && e.name;
  let msg;
  if (n === 'NotAllowedError' || n === 'SecurityError') msg = inClaude()
    ? `Dentro do Claude o navegador não deixa usar a ${what}. Abre o LiveVerse no teu site do Cloudflare (ou o ficheiro no Chrome) para a usares.`
    : `Não deste autorização para usar a ${what}. Podes ativá-la nas definições do navegador (ícone do cadeado ao lado do endereço).`;
  else if (n === 'NotFoundError' || n === 'OverconstrainedError') msg = `Não foi encontrada nenhuma ${what} neste dispositivo.`;
  else if (n === 'NotReadableError') msg = `A ${what} está a ser usada por outra aplicação. Fecha-a e tenta outra vez.`;
  else msg = `Não foi possível usar a ${what} neste navegador.`;
  toast('⚠️', msg, 7000);
}
function camToggle() {
  if (MEDIA.cam) { stopStream('cam'); return; }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { mediaError({ name: inClaude() ? 'NotAllowedError' : 'x' }, 'câmara'); return; }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: MEDIA.facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
    .then(st => { MEDIA.cam = st; st.getVideoTracks()[0].addEventListener('ended', () => stopStream('cam')); toast('📷', 'Câmara ligada. Só tu vês este vídeo.'); mediaChanged(); })
    .catch(e => mediaError(e, 'câmara'));
}
function camFlip() {
  MEDIA.facing = MEDIA.facing === 'user' ? 'environment' : 'user';
  if (!MEDIA.cam) return;
  MEDIA.cam.getTracks().forEach(t => t.stop()); MEDIA.cam = null;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: MEDIA.facing }, audio: false })
    .then(st => { MEDIA.cam = st; mediaChanged(); })
    .catch(e => { mediaError(e, 'câmara'); mediaChanged(); });
}
function screenToggle() {
  if (MEDIA.screen) { stopStream('screen'); return; }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    toast('⚠️', inClaude() ? 'Dentro do Claude não dá para partilhar o ecrã. Abre o LiveVerse no Cloudflare, no computador.' : 'Este dispositivo não permite partilhar o ecrã (os telemóveis normalmente não deixam). Usa a câmara ou o computador.', 7000);
    return;
  }
  navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30 } }, audio: true })
    .then(st => { MEDIA.screen = st; st.getVideoTracks()[0].addEventListener('ended', () => stopStream('screen')); toast('🎮', 'A mostrar o ecrã do jogo na live.'); mediaChanged(); })
    .catch(e => { if (e && e.name === 'NotAllowedError' && !inClaude()) return; mediaError(e, 'partilha de ecrã'); });
}
function stopStream(kind) {
  const st = MEDIA[kind]; if (!st) return;
  if (MEDIA.rec && MEDIA.rec._src && MEDIA.rec._src.includes(kind)) recStop();
  st.getTracks().forEach(t => t.stop()); MEDIA[kind] = null;
  mediaChanged();
}
function stopAllMedia() { if (MEDIA.rec) recStop(); ['cam', 'screen'].forEach(k => { if (MEDIA[k]) { MEDIA[k].getTracks().forEach(t => t.stop()); MEDIA[k] = null; } }); }
function attachMedia() {
  $$('video[data-stream]').forEach(v => {
    const st = MEDIA[v.dataset.stream];
    if (st && v.srcObject !== st) { v.srcObject = st; v.muted = true; v.play().catch(() => { }); }
  });
}
function mediaChanged() {
  if (S.live) { paintScreen(); paintMediaBar(); }
  $$('[data-setupmedia]').forEach(el => el.outerHTML = setupMediaHTML());
  attachMedia();
}

/* ---------- Gravação ---------- */
function recToggle() { if (MEDIA.rec) recStop(); else recStart(); }
function recStart() {
  if (!window.MediaRecorder) { toast('⚠️', 'Este navegador não consegue gravar vídeo.'); return; }
  const src = MEDIA.screen && MEDIA.cam ? 'screen+cam' : MEDIA.screen ? 'screen' : MEDIA.cam ? 'cam' : null;
  if (!src) { toast('🎥', 'Liga a câmara ou mostra o jogo para poderes gravar.'); return; }
  let stream;
  if (src === 'screen+cam') stream = composeStream();
  else stream = MEDIA[src];
  const audio = MEDIA.screen ? MEDIA.screen.getAudioTracks() : [];
  if (audio.length && src === 'screen+cam') audio.forEach(t => stream.addTrack(t));
  const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  const mimeType = types.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
  let rec;
  try { rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined); } catch (e) { toast('⚠️', 'Não foi possível começar a gravar.'); return; }
  rec._src = src; rec._type = mimeType || 'video/webm';
  MEDIA.chunks = [];
  rec.ondataavailable = ev => { if (ev.data && ev.data.size) MEDIA.chunks.push(ev.data); };
  rec.onstop = () => {
    if (MEDIA.compose) { MEDIA.compose.stop(); MEDIA.compose = null; }
    const blob = new Blob(MEDIA.chunks, { type: rec._type.split(';')[0] });
    if (MEDIA.lastUrl) URL.revokeObjectURL(MEDIA.lastUrl);
    MEDIA.lastUrl = URL.createObjectURL(blob); MEDIA.lastExt = rec._type.includes('mp4') ? 'mp4' : 'webm';
    const secs = Math.max(1, Math.round((Date.now() - MEDIA.recStart) / 1000));
    S.clips.unshift({ id: 'c_' + uid(), title: `Gravação da live · ${hhmm(Date.now())}`, game: S.live ? S.live.game : 'chat', streamer: 'me', type: 'Gravação', emoji: '🎥', popularity: 50, likes: 0, comments: 0, onProfile: false, createdAt: Date.now(), liked: false, commentsList: [], secs: Math.min(59, secs), media: { kind: 'video', url: MEDIA.lastUrl } });
    save(); toast('🎥', 'Gravação guardada nos teus clips. Podes transferi-la no botão «Transferir».', 6000);
    paintMediaBar();
  };
  rec.start(1000); MEDIA.rec = rec; MEDIA.recStart = Date.now();
  clearInterval(MEDIA.recTimer); MEDIA.recTimer = setInterval(() => $$('[data-rec]').forEach(n => n.textContent = durLabel(Date.now() - MEDIA.recStart)), 500);
  paintMediaBar();
}
function recStop() { const r = MEDIA.rec; if (!r) return; MEDIA.rec = null; clearInterval(MEDIA.recTimer); try { r.stop(); } catch (e) { } paintMediaBar(); }
function composeStream() {
  // junta o ecrã do jogo com a câmara no canto, como na live
  const c = document.createElement('canvas'); c.width = 1280; c.height = S.prefs.orient === 'v' ? 2276 : 720;
  if (S.prefs.orient === 'v') { c.width = 720; c.height = 1280; }
  const ctx = c.getContext('2d');
  const vs = document.createElement('video'), vc = document.createElement('video');
  [vs, vc].forEach(v => { v.muted = true; v.playsInline = true; });
  vs.srcObject = MEDIA.screen; vc.srcObject = MEDIA.cam; vs.play().catch(() => { }); vc.play().catch(() => { });
  let on = true;
  const draw = () => {
    if (!on) return;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
    const fit = (v, x, y, w, h, cover) => { const vw = v.videoWidth || 16, vh = v.videoHeight || 9; const s = cover ? Math.max(w / vw, h / vh) : Math.min(w / vw, h / vh); const dw = vw * s, dh = vh * s; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(v, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); ctx.restore(); };
    fit(vs, 0, 0, c.width, c.height, false);
    const cw = Math.round(c.width * (S.prefs.orient === 'v' ? .36 : .22)), ch = Math.round(cw * .75);
    ctx.save(); ctx.translate(24 + cw, 24); ctx.scale(-1, 1); fit(vc, 0, 0, cw, ch, true); ctx.restore();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(24, 24, cw, ch);
    requestAnimationFrame(draw);
  };
  draw();
  const out = c.captureStream(30);
  MEDIA.compose = { stop() { on = false; vs.srcObject = null; vc.srcObject = null; } };
  return out;
}

/* ---------- Formato da live ---------- */
function setOrient(o) {
  S.prefs.orient = o; save();
  if (o === 'v') STUDIO.overlay = true;
  const sc = $('#screen'); if (sc) sc.classList.toggle('vertical', o === 'v');
  const st = $('.studio'); if (st) st.classList.toggle('is-vertical', o === 'v');
  $$('[data-act="orient"]').forEach(b => b.classList.toggle('on', b.dataset.o === o));
  paintScreen(); attachMedia();
}

/* ---------- Barra de controlo da live (fora do ecrã) ---------- */
function mediaButtonsHTML() {
  return `<button class="btn btn-sm ${MEDIA.cam ? 'btn-primary' : ''}" data-act="cam-toggle">${icon('camera')} ${MEDIA.cam ? 'Desligar câmara' : 'Câmara'}</button>
    ${MEDIA.cam ? `<button class="btn btn-sm" data-act="cam-flip" title="Trocar câmara" aria-label="Trocar câmara">${icon('flip')}</button>` : ''}
    <button class="btn btn-sm ${MEDIA.screen ? 'btn-primary' : ''}" data-act="screen-toggle">${icon('monitor')} ${MEDIA.screen ? 'Parar ecrã' : 'Mostrar jogo'}</button>`;
}
function orientHTML() {
  const o = S.prefs.orient || 'h';
  return `<div class="seg" role="group" aria-label="Formato da live"><button class="${o === 'h' ? 'on' : ''}" data-act="orient" data-o="h">${icon('horizontal')} Horizontal</button><button class="${o === 'v' ? 'on' : ''}" data-act="orient" data-o="v">${icon('vertical')} Vertical</button></div>`;
}
function paintMediaBar() { $$('.theater-bar').forEach(el => el.outerHTML = theaterBarHTML()); paintQA(); }
function setupMediaHTML() {
  return `<div class="field" data-setupmedia><span>Câmara e jogo</span><div class="row">${mediaButtonsHTML()}${orientHTML()}</div>
    ${MEDIA.cam || MEDIA.screen ? `<div class="setup-preview ${S.prefs.orient === 'v' ? 'vertical' : ''}">${MEDIA.screen ? '<video data-stream="screen" class="live-video fit-contain" autoplay muted playsinline></video>' : ''}${MEDIA.cam ? `<video data-stream="cam" class="${MEDIA.screen ? 'pv-cam' : 'live-video'} mirror" autoplay muted playsinline></video>` : ''}</div>` : ''}
    <span class="tiny muted" style="text-transform:none;letter-spacing:0;font-weight:500">${inClaude() ? 'A câmara e o ecrã funcionam no site do Cloudflare ou ao abrir o ficheiro no Chrome; dentro do Claude o navegador bloqueia-os.' : 'O vídeo fica só no teu navegador. Partilhar o ecrã funciona no computador.'}</span></div>`;
}

const MEDIA_ACT = {
  'cam-toggle': () => camToggle(),
  'cam-flip': () => camFlip(),
  'screen-toggle': () => screenToggle(),
  'rec-toggle': () => recToggle(),
  'reacts-toggle': () => { STUDIO.reacts = !STUDIO.reacts; paintMediaBar(); },
  'orient': b => { setOrient(b.dataset.o); paintQA(); },
};
