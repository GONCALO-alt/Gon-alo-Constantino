/* =====================================================================
   Mais perto de uma plataforma de streaming: cabeçalho de canal no
   perfil, gestor de transmissão (feed de atividade + ações rápidas),
   distintivos do chat em quadrado e barra de controlos do leitor.
   ===================================================================== */
Object.assign(IC, {
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>',
  playIc: '<path d="M7 4v16l13-8z" fill="currentColor" stroke="none"/>',
  vol: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  theaterIc: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 5v14"/>',
  marker: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  sword: '<path d="M14.5 3H21v6.5L9 21.5 2.5 15z" fill="currentColor" stroke="none"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9z" fill="currentColor" stroke="none"/>',
  starF: '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor" stroke="none"/>',
  botIc: '<rect x="4" y="7" width="16" height="12" rx="3" fill="currentColor" stroke="none"/><path d="M12 3v4" /><circle cx="9" cy="13" r="1.4" fill="#000" stroke="none"/><circle cx="15" cy="13" r="1.4" fill="#000" stroke="none"/>',
});

/* ---------- Distintivos do chat em quadrado ---------- */
function regBadges(u) {
  const r = regular(u); if (!r) return '';
  const b = r.badge === 'mod' ? `<span class="tbadge tb-mod" title="Moderador (fictício)">${icon('sword')}</span>` : r.badge === 'vip' ? `<span class="tbadge tb-vip" title="VIP (fictício)">${icon('gem')}</span>` : '';
  return `${b}<span class="tbadge tb-sub" title="Subscritor há ${r.months} ${r.months === 1 ? 'mês' : 'meses'} (fictício)">${icon('starF')}</span>`;
}

/* ---------- Perfil como cabeçalho de canal ---------- */
function channelHeaderHTML(a, me) {
  const ev = me ? (S.live || null) : channelLive(a);
  const followers = me ? Math.floor(S.me.followers) : a.followers;
  const banner = me && S.me.banner ? `url("${S.me.banner}") center/cover` : COVERS[(me ? S.me.cover : a.hue) % COVERS.length];
  return `<section class="ch-head">
    <div class="ch-banner" style="--cover:${esc(banner)}">${ev ? `<a class="ch-live" href="${me ? '#estudio' : chanHash(a.id)}"><span class="pill-live">EM DIRETO</span> ${esc(ev.title)}</a>` : '<span class="ch-off">OFFLINE</span>'}</div>
    <div class="ch-row">
      <span class="wp-av">${avatar(a, 72, ev ? 'ring-live' : '').replace('<a ', '<span ').replace('</a>', '</span>')}${ev ? '<span class="wp-livebadge">EM DIRETO</span>' : ''}</span>
      <div class="ch-meta"><h1>${esc(a.name)}${a.verified ? VERIFIED : ''}</h1><span class="muted"><b data-me="${me ? 'followers' : ''}">${fmt(followers)}</b> seguidores ${SIM()}</span></div>
      <span class="spacer"></span>
      <div class="ch-actions">${me
        ? `<button class="btn" data-act="edit-profile">${icon('edit')} Personalizar canal</button><a class="btn btn-primary" href="#estudio">${icon('studio')} Painel do criador</a>`
        : `${a.followed ? `<button class="wp-round on" data-act="follow" data-id="${a.id}" aria-label="Deixar de seguir">${icon('heartFill')}</button>` : `<button class="btn btn-primary" data-act="follow" data-id="${a.id}">${icon('heart')} Seguir</button>`}
           <button class="btn" data-act="go-sub" data-id="${a.id}">${icon('star')} Subscrever</button>
           <a class="btn" href="#conversa-${a.id}" aria-label="Enviar mensagem" title="Mensagem">${icon('chat')}</a>
           <button class="btn" data-act="accounts-edit" data-id="${a.id}" aria-label="Editar esta conta" title="Editar conta">${icon('edit')}</button>`}</div>
    </div>
  </section>`;
}
function aboutExtraHTML(id) {
  const me = id === 'me', a = acc(id);
  const car = me ? career() : career(Math.round(a.followers / 30));
  const following = me ? followingCount() : 120 + (a.hue % 300);
  const lives = me ? totalLives() : 40 + Math.round(a.followers / 2000);
  const views = me ? totalViews() : a.followers * 14;
  return `<section class="card panel about-wide">
    <h3 class="panel-title">Sobre ${esc(a.name)}</h3>
    <p class="prof-bio" style="margin-top:0">${richText(a.bio || '')}</p>
    <div class="prof-tags"><span class="chip on">${esc(me ? S.me.category : a.cat)}</span>${(a.games || []).map(g => `<span class="chip">${gicon(g, 20)} ${esc(GAMES[g]?.name || g)}</span>`).join('')}</div>
    <div class="lvl"><span class="lvl-num">${car.level}</span><div><strong>Nível de carreira ${car.level} · ${esc(car.name)}</strong><div class="goal-bar" style="margin-top:6px"><i style="width:${car.pct.toFixed(1)}%"></i></div><span class="tiny muted">${me ? `${dots(car.xp)} XP${car.next ? ' · faltam ' + dots(car.next - car.xp) + ' XP' : ''}` : 'Nível estimado pela simulação'}</span></div></div>
    <div class="stats">
      <div class="stat"><b data-me="${me ? 'followers' : ''}">${fmt(me ? S.me.followers : a.followers)}</b><small>Seguidores ${SIM()}</small></div>
      <div class="stat"><b>${fmt(following)}</b><small>A seguir</small></div>
      <div class="stat"><b>${fmt(lives)}</b><small>Transmissões</small></div>
      <div class="stat"><b>${fmt(views)}</b><small>Visualizações ${SIM()}</small></div>
    </div>
  </section>`;
}

/* ---------- Gestor de transmissão: feed de atividade ---------- */
const ACT_IC = { follow: ['heart', '#9147ff'], sub: ['starF', '#9147ff'], gift: ['gift', '#00a3a3'], raid: ['users', '#e91916'], train: ['bolt', '#eb8c00'], giftsub: ['gift', '#9147ff'] };
function activityPush(L, kind, text) {
  if (!L) return;
  const it = { k: kind, text, t: Date.now() };
  L.activity = L.activity || []; L.activity.unshift(it); if (L.activity.length > 80) L.activity.pop();
  const box = $('#smActivity');
  if (box) { const empty = box.querySelector('.sm-empty'); if (empty) empty.remove(); box.insertAdjacentHTML('afterbegin', activityItemHTML(it)); while (box.children.length > 80) box.lastElementChild.remove(); }
}
function activityItemHTML(it) {
  const [ic, c] = ACT_IC[it.k] || ['bolt', '#9147ff'];
  return `<div class="sm-item"><span class="sm-ic" style="--c:${c}">${icon(ic)}</span><div><span>${esc(it.text)}</span><time data-ago="${it.t}">${ago(it.t)}</time></div></div>`;
}
function activityHTML(L) {
  return `<aside class="sm-activity card" aria-label="Atividade">
    <div class="chat-head"><span class="tw-chead-t">Atividade</span>${SIM()}</div>
    <div class="sm-list" id="smActivity">${(L.activity || []).map(activityItemHTML).join('') || '<p class="sm-empty muted small">Seguidores, subscrições, presentes e raids aparecem aqui.</p>'}</div>
  </aside>`;
}

/* ---------- Ações rápidas ---------- */
function quickActionsHTML() {
  const o = S.prefs.orient || 'h';
  const tile = (act, ic, label, color, on = false, extra = '') => `<button class="qa-t ${on ? 'on' : ''}" data-act="${act}" style="--c:${color}" ${extra}><span class="qa-ic">${icon(ic)}</span><span class="qa-l">${label}</span></button>`;
  return `<section class="qa card" aria-label="Ações rápidas">
    <div class="qa-head"><span class="tw-chead-t">Ações rápidas</span><span class="spacer"></span>
      <label class="tb-scene">${icon('layers')}<select class="input" data-scene-select id="sceneSelectQA" aria-label="Cena">${SCENES.map(([k, e, l]) => `<option value="${k}" ${(S.live?.scene || 'game') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <div class="qa-grid">
      ${tile('cam-toggle', 'camera', MEDIA.cam ? 'Desligar câmara' : 'Câmara', '#9147ff', !!MEDIA.cam)}
      ${tile('screen-toggle', 'monitor', MEDIA.screen ? 'Parar ecrã' : 'Mostrar jogo', '#1f69ff', !!MEDIA.screen)}
      ${tile('rec-toggle', 'rec', MEDIA.rec ? 'Parar gravação' : 'Gravar', '#e91916', !!MEDIA.rec)}
      ${tile('orient', o === 'v' ? 'horizontal' : 'vertical', o === 'v' ? 'Passar a horizontal' : 'Passar a vertical', '#00a3a3', false, `data-o="${o === 'v' ? 'h' : 'v'}"`)}
      ${tile('mic-toggle', 'mic', MIC.on ? 'A ouvir' : 'Microfone', '#2b9c3a', MIC.on)}
      ${tile('reacts-toggle', 'bolt', 'Momentos', '#eb8c00', !!STUDIO.reacts)}
      ${tile('clip-now', 'marker', 'Marcador', '#c02bd1')}
      ${tile('open-poll', 'chart', 'Sondagem', '#1f69ff')}
      ${tile('end-raid-pick', 'users', 'Raid', '#e91916')}
      ${tile('announce-live', 'share', 'Anunciar', '#9147ff')}
      ${tile('mod-open', 'shield', 'Modo de chat', '#2b9c3a')}
      ${tile('theater', 'expand', 'Ecrã inteiro', '#53535f')}
    </div>
    ${MEDIA.lastUrl && !MEDIA.rec ? `<a class="btn btn-sm" href="${MEDIA.lastUrl}" download="liveverse-gravacao.${MEDIA.lastExt || 'webm'}" style="margin-top:8px">${icon('download')} Transferir a última gravação</a>` : ''}
    <div class="tb-reacts" ${STUDIO.reacts ? '' : 'hidden'}>${PANEL_BUTTONS.filter(b => b[0] !== 'custom').map(([id, e, l]) => `<button class="tb-react" data-act="react" data-id="${id}">${esc(l)}</button>`).join('')}</div>
  </section>`;
}
function paintQA() { $$('.qa').forEach(el => el.outerHTML = quickActionsHTML()); }

const TW3_ACT = {
  'go-sub': b => { location.hash = chanHash(b.dataset.id); },
  'clip-now': () => {
    const L = S.live; if (!L) return;
    const it = L.timeline.find(x => !x.clipId && x.type !== 'end') || addTimeline('reaction', 'Marcador na live', '🎬', { hype: .4, reactLabel: 'Marcador', clipTitle: `Marcador · ${durLabel(Date.now() - L.start)}` });
    clipFromTimeline(it.id);
  },
  'open-poll': () => { STUDIO.controls = true; const p = $('#controlsPanel'); if (p) p.hidden = false; $$('[data-act="controls"]').forEach(x => x.classList.add('btn-primary')); setTimeout(() => { const f = $('#pollBox'); if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#lpQ')?.focus({ preventScroll: true }); } }, 50); },
  'player-pause': b => { const v = b.closest('.screen'); if (!v) return; v.classList.toggle('paused'); b.innerHTML = icon(v.classList.contains('paused') ? 'playIc' : 'pause'); },
  'player-vol': b => { b.classList.toggle('muted'); toast('🔈', b.classList.contains('muted') ? 'Som da live silenciado (simulado)' : 'Som da live ligado (simulado)'); },
};
