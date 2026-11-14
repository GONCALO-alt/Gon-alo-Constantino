// Clips: grava continuamente (só no teu dispositivo) uma composição da sala — vídeos, avatares,
// reações e emotes — e ao carregar em «Clip» guarda os últimos ~30 s para descarregar ou partilhar.
// Nada é enviado para o servidor; a sala é avisada de que foi feito um clip.
const CLIP_W = 720, CLIP_H = 1280, CLIP_FPS = 20, SEG_MS = 30000;
let clip = null;

function pickMime() {
  const opts = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return opts.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || '';
}

function startClipRecorder() {
  if (clip || !window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return;
  const canvas = document.createElement('canvas'); canvas.width = CLIP_W; canvas.height = CLIP_H;
  const ctx = canvas.getContext('2d');
  let audio = null, dest = null;
  try { audio = new AudioContext(); dest = audio.createMediaStreamDestination(); } catch {}
  const stream = canvas.captureStream(CLIP_FPS);
  if (dest) dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  clip = { canvas, ctx, audio, dest, stream, mime: pickMime(), recs: [], sources: new Map(), avatarImgs: new Map(), draw: null };
  clip.draw = setInterval(drawClipFrame, 1000 / CLIP_FPS);
  // Dois gravadores desfasados 15 s: há sempre um com 15–30 s de conteúdo, num ficheiro válido.
  newRecorder(); clip.stagger = setTimeout(() => clip && newRecorder(), SEG_MS / 2);
  connectAllAudio();
}
function stopClipRecorder() {
  if (!clip) return;
  clearInterval(clip.draw); clearTimeout(clip.stagger);
  clip.recs.forEach((r) => { clearTimeout(r.timer); try { r.rec.stop(); } catch {} });
  try { clip.audio?.close(); } catch {}
  clip = null;
}
function newRecorder() {
  if (!clip) return;
  let rec;
  try { rec = new MediaRecorder(clip.stream, clip.mime ? { mimeType: clip.mime, videoBitsPerSecond: 2_500_000 } : undefined); } catch { return; }
  const entry = { rec, chunks: [], start: Date.now() };
  rec.ondataavailable = (e) => e.data.size && entry.chunks.push(e.data);
  rec.start(1000);
  entry.timer = setTimeout(() => {
    try { rec.stop(); } catch {}
    if (!clip) return;
    clip.recs = clip.recs.filter((x) => x !== entry);
    newRecorder();
  }, SEG_MS);
  clip.recs.push(entry);
}

// Mistura o áudio de todos (e o teu microfone) para o clip
function connectAudio(id, ms) {
  if (!clip?.audio || !ms?.getAudioTracks().length || clip.sources.has(id + ms.getAudioTracks()[0].id)) return;
  try { clip.audio.createMediaStreamSource(ms).connect(clip.dest); clip.sources.set(id + ms.getAudioTracks()[0].id, true); } catch {}
}
function connectAllAudio() {
  if (!clip) return;
  for (const [sid, p] of Object.entries(peers)) connectAudio(sid, p.stream);
  if (localStream) connectAudio('me', localStream);
}
window.onPeerAudio = (sid, s) => connectAudio(sid, s);
window.onLocalAudio = (s) => connectAudio('me', s);

function avatarImage(m) {
  const key = JSON.stringify(m.avatar);
  let e = clip.avatarImgs.get(m.sid);
  if (!e || e.key !== key) {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(renderAvatar(m.avatar, 256).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
    e = { key, img }; clip.avatarImgs.set(m.sid, e);
  }
  return e.img;
}

function drawClipFrame() {
  if (!clip || !roomState) return;
  const { ctx } = clip; const W = CLIP_W, H = CLIP_H;
  const grad = ctx.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, '#1b1530'); grad.addColorStop(1, '#0e0f18');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  const tiles = [...document.querySelectorAll('#videos .tile')];
  const n = Math.max(1, tiles.length); const cols = n <= 2 ? 1 : 2; const rows = Math.ceil(n / cols);
  const pad = 16, top = 120, bottom = 110;
  const tw = (W - pad * (cols + 1)) / cols, th = Math.min((H - top - bottom - pad * (rows + 1)) / rows, tw * 1.2);
  const now = performance.now();
  tiles.forEach((tile, i) => {
    const x = pad + (i % cols) * (tw + pad), y = top + pad + Math.floor(i / cols) * (th + pad);
    const m = roomState.members.find((mm) => mm.sid === tile.dataset.sid); if (!m) return;
    ctx.save(); roundRect(ctx, x, y, tw, th, 22); ctx.clip();
    ctx.fillStyle = '#262a3d'; ctx.fillRect(x, y, tw, th);
    const v = tile.querySelector('video');
    if (v.style.visibility === 'visible' && v.videoWidth) {
      const s = Math.max(tw / v.videoWidth, th / v.videoHeight); const vw = v.videoWidth * s, vh = v.videoHeight * s;
      ctx.drawImage(v, x + (tw - vw) / 2, y + (th - vh) / 2, vw, vh); // no clip não se espelha
    } else {
      const img = avatarImage(m); const s = Math.min(tw, th) * 0.6;
      let dy = 0, rot = 0;
      if (tile._emote && tile._emote.until > now) { const k = (now % 600) / 600; dy = -Math.abs(Math.sin(k * Math.PI)) * 40; rot = tile._emote.anim === 'spin' ? k * Math.PI * 2 : Math.sin(k * Math.PI * 2) * 0.15; }
      ctx.translate(x + tw / 2, y + th / 2 + dy); ctx.rotate(rot);
      if (img.complete) ctx.drawImage(img, -s / 2, -s / 2, s, s);
    }
    ctx.restore();
    ctx.fillStyle = '#000a'; roundRect(ctx, x + 12, y + th - 46, ctx.measureText(m.name).width + 36, 34, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '600 22px system-ui, sans-serif'; ctx.fillText(m.name, x + 28, y + th - 22);
  });
  // reações a flutuar
  ctx.textAlign = 'center';
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i]; const t = (now - f.t) / 2600;
    if (t > 1) { floaters.splice(i, 1); continue; }
    ctx.globalAlpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
    ctx.font = `${f.big ? 130 : 64}px system-ui, sans-serif`;
    ctx.fillText(f.emoji, f.x * W, H - bottom - t * (H * 0.6));
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
  // marca de água
  ctx.font = '900 54px system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('malta', 32, 80);
  ctx.fillStyle = '#ff4fa3'; ctx.fillText('.', 32 + ctx.measureText('malta').width, 80);
  ctx.font = '500 24px system-ui, sans-serif'; ctx.fillStyle = '#ffffffb0';
  ctx.fillText(roomState.isHouse ? `Casa de ${roomState.ownerName}` : `Sala ${roomState.code}`, 32, H - 50);
}
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

$('#btn-clip').addEventListener('click', () => {
  if (!clip) { startClipRecorder(); return toast('A gravar… carrega outra vez daqui a uns segundos.'); }
  clip.audio?.resume?.();
  const oldest = [...clip.recs].sort((a, b) => a.start - b.start)[0];
  if (!oldest || !oldest.chunks.length) return toast('Ainda não há nada gravado — tenta daqui a uns segundos.');
  oldest.rec.requestData();
  setTimeout(() => {
    const type = (clip?.mime || 'video/webm').split(';')[0];
    const blob = new Blob(oldest.chunks, { type });
    const url = URL.createObjectURL(blob);
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const file = new File([blob], `malta-clip-${Date.now()}.${ext}`, { type });
    const secs = Math.round((Date.now() - oldest.start) / 1000);
    socket.emit('clip');
    modal(`<h3>🎬 O teu clip (${secs} s)</h3><video src="${url}" controls autoplay playsinline class="clip-preview"></video>
      <p class="hint-small">Pede autorização a quem aparece antes de publicar. 💜</p>
      <div class="row"><a class="btn" href="${url}" download="${file.name}">⬇️ Descarregar</a>
      ${navigator.canShare?.({ files: [file] }) ? '<button class="btn primary" id="share-clip">📤 Partilhar</button>' : ''}
      <button class="btn ghost" data-close>Fechar</button></div>`);
    $('#share-clip')?.addEventListener('click', () => navigator.share({ files: [file], title: 'Malta', text: 'Na Malta com a malta 😂' }).catch(() => {}));
    window.onModalClose = () => URL.revokeObjectURL(url);
  }, 300);
});
