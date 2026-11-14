// Ver YouTube e ouvir Spotify em conjunto, sincronizados pelo servidor.

// ================= YouTube =================
let yt = null, ytReady = false, ytApplying = 0, pendingYt = null, currentVideo = null;
window.onYouTubeIframeAPIReady = () => { ytReady = true; if (pendingYt) applyYt(pendingYt); };
$('#yt-form').addEventListener('submit', (e) => { e.preventDefault(); socket.emit('yt', { type: 'load', url: $('#yt-url').value }); $('#yt-url').value = ''; });
$('#yt-stop').addEventListener('click', () => socket.emit('yt', { type: 'stop' }));

function applyYt(s) {
  if (!s?.videoId) {
    currentVideo = null; pendingYt = null; $('#yt-wrap').classList.add('hidden'); $('#yt-stop').classList.add('hidden');
    try { yt?.stopVideo(); } catch {}
    return;
  }
  showMediaTab('yt');
  $('#yt-wrap').classList.remove('hidden'); $('#yt-stop').classList.remove('hidden');
  if (!ytReady) { pendingYt = s; return; }
  ytApplying = Date.now();
  if (!yt) {
    currentVideo = s.videoId;
    yt = new YT.Player('yt-player', {
      videoId: s.videoId, playerVars: { autoplay: 1, start: Math.floor(s.time), playsinline: 1, rel: 0 },
      events: { onStateChange: onYtState, onReady: () => applyYt(s) },
    });
    return;
  }
  if (typeof yt.getCurrentTime !== 'function') return;
  if (currentVideo !== s.videoId) { currentVideo = s.videoId; yt.loadVideoById(s.videoId, s.time); }
  else if (Math.abs(yt.getCurrentTime() - s.time) > 1.5) yt.seekTo(s.time, true);
  if (s.playing) yt.playVideo(); else yt.pauseVideo();
}
function onYtState(e) {
  if (Date.now() - ytApplying < 900) return; // ignora o eco das mudanças que vieram do servidor
  if (e.data === YT.PlayerState.PLAYING) socket.emit('yt', { type: 'play', time: yt.getCurrentTime() });
  if (e.data === YT.PlayerState.PAUSED) socket.emit('yt', { type: 'pause', time: yt.getCurrentTime() });
}

// ================= Spotify =================
// Usa o leitor oficial embebido (iFrame API). Sem sessão Spotify no browser só toca uma prévia de 30 s.
let spAPI = null, spCtl = null, spUri = null, spApplying = 0, spState = null, musicState = null, spCreating = false;
window.onSpotifyIframeApiReady = (API) => { spAPI = API; if (musicState) applyMusic(musicState); };
$('#music-form').addEventListener('submit', (e) => { e.preventDefault(); socket.emit('music', { type: 'add', url: $('#music-url').value }); $('#music-url').value = ''; });
$('#music-skip').addEventListener('click', () => socket.emit('music', { type: 'next', uri: musicState?.current?.uri }));
$('#music-stop').addEventListener('click', () => socket.emit('music', { type: 'stop' }));
$('#music-sync').addEventListener('click', () => { spUri = null; applyMusic({ ...musicState, at: Date.now() }, true); });
$('#music-queue').addEventListener('click', (e) => { const i = e.target.dataset.rm; if (i != null) socket.emit('music', { type: 'remove', i: +i }); });

function expectedPos(s) { return s.playing ? s.pos + (Date.now() - (s.receivedAt || Date.now())) : s.pos; }

function applyMusic(s, force) {
  if (!s) return;
  const wasOn = !!musicState?.current;
  musicState = { ...s, receivedAt: Date.now() };
  if (s.current && !wasOn && !currentVideo) showMediaTab('music');
  const on = !!s.current;
  $('#music-dot').classList.toggle('hidden', !on || !s.playing);
  $('#music-now').classList.toggle('hidden', !on);
  $('#music-queue').innerHTML = (s.queue || []).map((q, i) => `<li><span class="grow">${esc(q.title)} <small class="muted">· ${esc(q.by)}</small></span><button class="btn small ghost" data-rm="${i}">✕</button></li>`).join('');
  if (!on) { spUri = null; try { spCtl?.pause(); } catch {} return; }
  if (!spAPI) return;
  spApplying = Date.now();
  if (!spCtl) {
    if (spCreating) return; spCreating = true;
    const el = document.createElement('div'); $('#sp-embed').replaceChildren(el);
    spAPI.createController(el, { uri: s.current.uri, width: '100%', height: 152 }, (ctl) => {
      spCtl = ctl; spUri = s.current.uri; spCreating = false;
      ctl.addListener('playback_update', onSpUpdate);
      ctl.addListener('ready', () => applyMusic(musicState));
    });
    return;
  }
  if (spUri !== s.current.uri) { spUri = s.current.uri; spCtl.loadUri(s.current.uri); spState = null; return setTimeout(() => applyMusic(musicState), 800); }
  const want = expectedPos(musicState);
  if (s.playing) {
    if (!spState || force || Math.abs(spState.position - want) > 2500) spCtl.seek(want / 1000);
    if (!spState || spState.isPaused) spCtl.resume();
  } else if (spState && !spState.isPaused) spCtl.pause();
}
function onSpUpdate(e) {
  const d = e.data; const prev = spState; spState = d;
  if (!musicState?.current) return;
  if (d.duration && (!prev || prev.duration !== d.duration)) socket.emit('music', { type: 'duration', uri: musicState.current.uri, ms: d.duration });
  if (Date.now() - spApplying < 1500 || d.isBuffering) return;
  const atEnd = d.duration && d.position >= d.duration - 800; // fim da prévia de 30 s: não pausar para todos
  if (prev && prev.isPaused !== d.isPaused && !atEnd) {
    socket.emit('music', { type: d.isPaused ? 'pause' : 'play', pos: d.position });
  } else if (!d.isPaused && musicState.playing && Math.abs(d.position - expectedPos(musicState)) > 4000 && d.position < d.duration - 1000) {
    socket.emit('music', { type: 'seek', pos: d.position });
  }
}
