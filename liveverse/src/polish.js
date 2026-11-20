/* =====================================================================
   Acabamento profissional: gestor de transmissão offline, ícones das
   notificações e lista suspensa do sino.
   ===================================================================== */
function notifIcon(n) {
  const t = (n.icon || '') + ' ' + (n.text || '');
  if (/seguir|seguidor|💜/.test(t)) return 'heart';
  if (/evento|📅|⏰|começa/.test(t)) return 'calendar';
  if (/conquista|🏆|nível|🎖️/i.test(t)) return 'trophy';
  if (/respondeu|✉️|💬|mensagem/.test(t)) return 'chat';
  if (/direto|live|🔴|🎬/i.test(t)) return 'studio';
  if (/raid|🚀/.test(t)) return 'users';
  return 'bell';
}
function setupPreviewHTML() {
  const v = S.prefs.orient === 'v';
  const inner = MEDIA.screen
    ? `<video data-stream="screen" class="live-video fit-contain" autoplay muted playsinline></video>${MEDIA.cam ? '<video data-stream="cam" class="pv-cam mirror" autoplay muted playsinline></video>' : ''}`
    : MEDIA.cam ? '<video data-stream="cam" class="live-video mirror" autoplay muted playsinline></video>'
    : `<div class="pv-off">${avatar(S.me, 64).replace('<a ', '<span ').replace('</a>', '</span>')}<b>Estás offline</b><small>Liga a câmara ou mostra o jogo para veres a pré-visualização</small></div>`;
  return `<div data-setuppv><div class="setup-preview big ${v ? 'vertical' : ''}">${inner}</div>
    <div class="row" style="margin-top:10px">${mediaButtonsHTML()}<span class="spacer"></span>${orientHTML()}</div>
    <p class="tiny muted" style="margin:8px 0 0">${inClaude() ? 'A câmara e o ecrã funcionam no teu site do Cloudflare ou no Chrome; dentro do Claude o navegador bloqueia-os.' : 'O vídeo fica só no teu navegador. Partilhar o ecrã funciona no computador.'}</p></div>`;
}
function studioSetup() {
  const mineEvents = S.events.filter(e => e.owner === 'me' && ['scheduled', 'soon'].includes(eventStatus(e))).sort((a, b) => a.start - b.start);
  const st = STUDIO.setup || (STUDIO.setup = { title: '', game: S.me.games[0] || 'fortnite', mode: 'casual', level: 'media', eventId: '', tags: '' });
  const summary = STUDIO.summary && S.lives.find(l => l.id === STUDIO.summary);
  return `${soonBanner(mineEvents.filter(e => eventStatus(e) === 'soon'))}
  <div class="page-head"><div><h1>Gestor de transmissão</h1><p>Estás offline. Prepara a transmissão e entra em direto quando quiseres.</p></div></div>
  ${summary ? liveSummary(summary) : ''}
  <form data-form="go-live" class="sm-setup">
    <section class="card sm-pv"><div class="sm-head"><span class="tw-chead-t">Pré-visualização da transmissão</span><span class="pill-state">OFFLINE</span></div>${setupPreviewHTML()}</section>
    <section class="card sm-info"><div class="sm-head"><span class="tw-chead-t">Informação da transmissão</span></div>
      <div class="stack" style="gap:12px">
        ${mineEvents.length ? `<label class="field"><span>Evento agendado</span><select class="input" name="eventId" id="glEvent" data-setup="eventId"><option value="">Nenhum</option>${mineEvents.map(e => `<option value="${e.id}" ${st.eventId === e.id ? 'selected' : ''}>${esc(e.title)} · ${whenLabel(e.start)}</option>`).join('')}</select></label>` : ''}
        <label class="field"><span>Título</span><input class="input" name="title" id="glTitle" data-setup="title" maxlength="90" placeholder="Ex.: Ranked com o chat" value="${esc(st.title)}"></label>
        <label class="field"><span>Categoria</span><select class="input" name="game" id="glGame" data-setup="game">${Object.entries(GAMES).map(([k, g]) => `<option value="${k}" ${st.game === k ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Etiquetas</span><input class="input" name="tags" id="glTags" data-setup="tags" maxlength="120" placeholder="Português, Competitivo" value="${esc(st.tags || '')}"></label>
        <div class="grid-2">
          <label class="field"><span>Modo</span><select class="input" name="mode" id="glMode" data-setup="mode">${Object.entries(MODES).map(([k, m]) => `<option value="${k}" ${st.mode === k ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
          <label class="field"><span>Audiência simulada</span><select class="input" name="level" id="glLevel" data-setup="level">${Object.entries(LEVELS).map(([k, l]) => `<option value="${k}" ${st.level === k ? 'selected' : ''}>Até ${dots(l.max)}</option>`).join('')}</select></label>
        </div>
        <button class="btn btn-live sm-go">${icon('studio')} Entrar em direto</button>
        <button type="button" class="btn" data-act="new-event" style="justify-content:center">${icon('calendar')} Agendar para outra hora</button>
        <p class="tiny muted" style="margin:0">Os espetadores e o chat são simulados.</p>
      </div></section>
  </form>
  <details class="card sm-more"><summary>${icon('gear')} Mais definições <small>Microfone e som · Meta de presentes · Moderação do chat</small></summary>
    <div class="grid-2" style="align-items:start">
      <section class="panel"><h3 class="panel-title">${icon('mic', 'style="width:18px"')} Microfone e som<small>${soundPanelHTML()}</small></h3>${micPanelHTML()}</section>
      <section class="panel"><h3 class="panel-title">${icon('target', 'style="width:18px"')} Meta de presentes</h3>${goalPanelHTML()}</section>
    </div>
    <section class="panel"><h3 class="panel-title">${icon('shield', 'style="width:18px"')} Moderação do chat</h3>${modPanelHTML()}</section>
  </details>
  <h2 class="tw-h" style="margin-top:22px">Transmissões anteriores</h2>
  <div class="stack">${S.lives.length ? [...S.lives].sort((a, b) => b.start - a.start).map(pastLive).join('') : '<div class="empty"><b>Ainda não fizeste nenhuma transmissão</b>Quando terminares a primeira, o resumo aparece aqui.</div>'}</div>`;
}
const POLISH_FORMS = {
  'go-live': f => {
    const st = STUDIO.setup; const ev = st.eventId && S.events.find(e => e.id === st.eventId);
    const tags = String(f.tags ? f.tags.value : st.tags || '').split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean).slice(0, 6);
    startLive(ev ? { title: ev.title, game: ev.game, mode: ev.mode, level: ev.level, eventId: ev.id } : { title: f.title.value.trim() || `Live de ${GAMES[st.game].name}`, game: st.game, mode: st.mode, level: st.level });
    if (S.live && tags.length) { S.live.tags = tags; render(); }
    STUDIO.setup = null; save();
  },
};
