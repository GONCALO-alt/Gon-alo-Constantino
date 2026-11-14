// Vídeochamada WebRTC em malha (cada pessoa liga-se a cada pessoa) + partilha de ecrã.
// Para produção: acrescentar um servidor TURN aqui (ex. coturn) para redes restritivas.
const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const peers = {}; // sid -> { pc, stream, makingOffer, ignoreOffer, polite }
const mediaStates = {};
let localStream = null;
let camTrack = null;
let screenTrack = null;

function ensurePeer(sid) {
  if (peers[sid]) return peers[sid];
  const pc = new RTCPeerConnection(ICE);
  const p = (peers[sid] = { pc, stream: new MediaStream(), makingOffer: false, ignoreOffer: false, polite: socket.id < sid });
  if (localStream) localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
  pc.ontrack = (e) => {
    p.stream.getTracks().filter((t) => t.kind === e.track.kind).forEach((t) => p.stream.removeTrack(t));
    p.stream.addTrack(e.track);
    e.track.onended = () => { p.stream.removeTrack(e.track); syncTiles(); };
    syncTiles(); window.onPeerAudio?.(sid, p.stream);
  };
  pc.onicecandidate = (e) => e.candidate && socket.emit('signal', { to: sid, data: { candidate: e.candidate } });
  pc.onnegotiationneeded = async () => {
    try { p.makingOffer = true; await pc.setLocalDescription(); socket.emit('signal', { to: sid, data: { description: pc.localDescription } }); }
    catch (err) { console.warn(err); } finally { p.makingOffer = false; }
  };
  return p;
}
async function onSignal({ from, data }) {
  const p = ensurePeer(from); const pc = p.pc;
  try {
    if (data.description) {
      const collision = data.description.type === 'offer' && (p.makingOffer || pc.signalingState !== 'stable');
      p.ignoreOffer = !p.polite && collision;
      if (p.ignoreOffer) return;
      await pc.setRemoteDescription(data.description);
      if (data.description.type === 'offer') { await pc.setLocalDescription(); socket.emit('signal', { to: from, data: { description: pc.localDescription } }); }
    } else if (data.candidate) {
      try { await pc.addIceCandidate(data.candidate); } catch (e) { if (!p.ignoreOffer) throw e; }
    }
  } catch (err) { console.warn('signal', err); }
}
function dropPeer(sid) { peers[sid]?.pc.close(); delete peers[sid]; delete mediaStates[sid]; syncTiles(); }

async function startCall() {
  try { localStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch {
    try { localStream = await navigator.mediaDevices.getUserMedia({ audio: true }); toast('Sem câmara — entraste só com áudio.'); }
    catch { toast('Não foi possível aceder ao microfone/câmara.'); return false; }
  }
  camTrack = localStream.getVideoTracks()[0] || null;
  for (const p of Object.values(peers)) localStream.getTracks().forEach((t) => p.pc.addTrack(t, localStream));
  window.onLocalAudio?.(localStream);
  updateCallButtons(); sendMediaState(); syncTiles();
  return true;
}
function stopLocal() {
  if (!localStream) return;
  stopScreen(true);
  localStream.getTracks().forEach((t) => t.stop());
  for (const p of Object.values(peers)) p.pc.getSenders().forEach((s) => s.track && p.pc.removeTrack(s));
  localStream = null; camTrack = null; updateCallButtons(); sendMediaState(); syncTiles();
}

// ---- Partilha de ecrã: substitui a câmara (ou acrescenta vídeo se só havia áudio) ----
async function startScreen() {
  if (!navigator.mediaDevices?.getDisplayMedia) return toast('Este dispositivo não permite partilhar o ecrã.');
  if (!localStream && !(await startCall())) return;
  let display;
  try { display = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 }, audio: false }); } catch { return; }
  screenTrack = display.getVideoTracks()[0];
  screenTrack.onended = () => stopScreen();
  for (const p of Object.values(peers)) {
    const sender = p.pc.getSenders().find((s) => s.track?.kind === 'video');
    if (sender) sender.replaceTrack(screenTrack); else p.pc.addTrack(screenTrack, localStream);
  }
  if (camTrack) localStream.removeTrack(camTrack);
  localStream.addTrack(screenTrack);
  updateCallButtons(); sendMediaState(); syncTiles();
  toast('Estás a partilhar o ecrã 🖥️');
}
function stopScreen(silent) {
  if (!screenTrack) return;
  const st = screenTrack; screenTrack = null;
  st.onended = null; st.stop();
  localStream?.removeTrack(st);
  for (const p of Object.values(peers)) {
    const sender = p.pc.getSenders().find((s) => s.track === st || (s.track === null && !camTrack));
    if (!sender) continue;
    if (camTrack) sender.replaceTrack(camTrack); else p.pc.removeTrack(sender);
  }
  if (camTrack && localStream) localStream.addTrack(camTrack);
  if (!silent) { updateCallButtons(); sendMediaState(); syncTiles(); }
}

function sendMediaState() {
  const a = localStream?.getAudioTracks()[0];
  socket?.emit('media-state', { cam: !!camTrack?.enabled && !!localStream, mic: !!a?.enabled, screen: !!screenTrack });
}
function updateCallButtons() {
  const a = localStream?.getAudioTracks()[0];
  $('#btn-call').textContent = localStream ? '📴 Sair da chamada' : '📞 Entrar na chamada';
  $('#btn-mic').className = 'ctl ' + (a ? (a.enabled ? 'on' : 'off') : '');
  $('#btn-cam').className = 'ctl ' + (camTrack && localStream ? (camTrack.enabled ? 'on' : 'off') : '');
  $('#btn-screen').className = 'ctl ' + (screenTrack ? 'on' : '');
}
$('#btn-call').addEventListener('click', () => (localStream ? stopLocal() : startCall()));
$('#btn-mic').addEventListener('click', () => { const a = localStream?.getAudioTracks()[0]; if (!a) return startCall(); a.enabled = !a.enabled; updateCallButtons(); sendMediaState(); syncTiles(); });
$('#btn-cam').addEventListener('click', () => { if (!camTrack) return localStream ? toast('Sem câmara disponível.') : startCall(); camTrack.enabled = !camTrack.enabled; updateCallButtons(); sendMediaState(); syncTiles(); });
$('#btn-screen').addEventListener('click', () => (screenTrack ? stopScreen() : startScreen()));

function syncTiles() {
  if (!roomState || !socket) return;
  const box = $('#videos');
  const seen = new Set();
  for (const m of roomState.members) {
    seen.add(m.sid);
    let tile = box.querySelector(`[data-sid="${m.sid}"]`);
    if (!tile) {
      tile = document.createElement('div'); tile.className = 'tile'; tile.dataset.sid = m.sid;
      tile.innerHTML = `<div class="av"></div><video autoplay playsinline></video><div class="emote-layer hidden"></div><span class="label"></span>`;
      box.appendChild(tile);
    }
    const isMe = m.sid === socket.id;
    const st = isMe ? { cam: !!camTrack?.enabled && !!localStream, mic: !!localStream?.getAudioTracks()[0]?.enabled, screen: !!screenTrack } : mediaStates[m.sid] || {};
    const stream = isMe ? localStream : peers[m.sid]?.stream;
    const showVideo = (st.cam || st.screen) && stream?.getVideoTracks().length > 0;
    const video = tile.querySelector('video');
    if (stream && video.srcObject !== stream) video.srcObject = stream;
    if (!stream) video.srcObject = null;
    video.muted = isMe;
    video.style.visibility = showVideo ? 'visible' : 'hidden';
    tile.classList.toggle('screen', !!st.screen);
    tile.classList.toggle('mirror', isMe && !st.screen);
    if (!isMe && stream) video.play().catch(() => {});
    const av = tile.querySelector('.av');
    const key = JSON.stringify(m.avatar);
    if (av.dataset.key !== key) { av.innerHTML = renderAvatar(m.avatar, 90); av.dataset.key = key; }
    tile.querySelector('.label').textContent = `${st.screen ? '🖥️ ' : ''}${st.mic ? '🎙' : '🔇'} ${m.name}${isMe ? ' (tu)' : ''}`;
  }
  box.querySelectorAll('.tile').forEach((t) => { if (!seen.has(t.dataset.sid)) t.remove(); });
}
