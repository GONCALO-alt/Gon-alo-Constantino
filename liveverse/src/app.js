/* =====================================================================
   Janelas (perfil, editor de eventos, detalhes), ações e ciclo principal
   ===================================================================== */
let lastFocus = null;
function openModal(html, wide = false) {
  lastFocus = document.activeElement;
  const m = $('#modal'), c = $('#modalCard');
  c.className = 'modal-card' + (wide === true ? ' wide' : wide ? ' ' + wide : '');
  m.classList.toggle('as-sheet', wide === 'sheet');
  c.innerHTML = html; m.hidden = false;
  setTimeout(() => { const f = c.querySelector('input:not([type=file]):not([type=checkbox]),textarea,select,button'); f && f.focus({ preventScroll: true }); }, 30);
}
function closeModal() {
  $('#modal').hidden = true; $('#modalCard').innerHTML = '';
  clearInterval(watchTimer); MODAL.kind = null;
  lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
}
const MODAL = { kind: null, draft: null, evId: null, confirm: null };

/* ---------- Editar perfil ---------- */
function openProfileEditor() {
  const m = S.me;
  MODAL.kind = 'profile';
  MODAL.draft = { name: m.name, handle: m.handle, bio: m.bio, category: m.category, games: [...m.games], avatar: m.avatar, banner: m.banner, cover: m.cover, accent: m.accent, verified: m.verified, agenda: m.agenda.map(x => ({ ...x })) };
  paintProfileEditor();
}
function syncProfileDraft() {
  const f = $('#profForm'); if (!f) return;
  const D = MODAL.draft;
  D.name = f.name.value; D.handle = f.handle.value; D.bio = f.bio.value; D.category = f.category.value; D.verified = f.verified.checked;
  D.games = $$('input[name="games"]:checked', f).map(i => i.value);
  D.agenda = $$('.agenda-edit .row', f).map(r => ({ day: +r.querySelector('select[name="aday"]').value, time: r.querySelector('input[name="atime"]').value || '18:00', game: r.querySelector('select[name="agame"]').value }));
}
function paintProfileEditor() {
  const D = MODAL.draft;
  openModal(`<div class="modal-head"><h2>Editar perfil</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
  <form id="profForm" data-form="profile">
    <div class="banner" style="--cover:${esc(D.banner ? `url("${D.banner}") center/cover` : COVERS[D.cover % COVERS.length])};border-radius:0"><div class="grid-lines"></div></div>
    <div class="modal-body">
      <div class="row">${avatar({ ...S.me, avatar: D.avatar, name: D.name }, 72).replace('<a ', '<span ').replace('</a>', '</span>')}<label class="btn btn-sm upload">${icon('image')} Foto de perfil<input type="file" accept="image/*" data-file="avatar" id="upAvatar"></label>${D.avatar ? '<button type="button" class="btn btn-sm btn-ghost" data-act="avatar-clear">Remover foto</button>' : ''}</div>
      <div class="field"><span>Banner</span><div class="cover-picks">${COVERS.map((c, i) => `<button type="button" class="cover-pick ${!D.banner && D.cover === i ? 'on' : ''}" style="--cover:${esc(c)}" data-act="prof-cover" data-v="${i}" aria-label="Banner ${i + 1}"></button>`).join('')}<label class="btn btn-sm upload">${icon('image')} Carregar imagem<input type="file" accept="image/*" data-file="banner" id="upBanner"></label></div></div>
      <div class="grid-2"><label class="field"><span>Nome de apresentação</span><input class="input" name="name" id="pfName" maxlength="40" required value="${esc(D.name)}"></label>
        <label class="field"><span>Nome de utilizador</span><input class="input" name="handle" id="pfHandle" maxlength="24" pattern="[A-Za-z0-9_.]+" required value="${esc(D.handle)}"></label></div>
      <label class="field"><span>Biografia</span><textarea class="input" name="bio" id="pfBio" maxlength="300">${esc(D.bio)}</textarea></label>
      <div class="grid-2"><label class="field"><span>Categoria de criador</span><select class="input" name="category" id="pfCat">${CATEGORIES.map(c => `<option ${D.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
        <div class="field"><span>Cor do perfil</span><div class="color-picks">${[['purple', 'var(--purple)', 'Roxo'], ['blue', 'var(--blue)', 'Azul'], ['pink', 'var(--pink)', 'Rosa']].map(([k, c, l]) => `<button type="button" class="color-pick ${D.accent === k ? 'on' : ''}" style="background:${c}" data-act="accent" data-v="${k}" aria-label="${l}"></button>`).join('')}</div></div></div>
      <div class="field"><span>Jogos favoritos</span><div class="row" style="gap:6px">${Object.entries(GAMES).map(([k, g]) => `<label class="chip ${D.games.includes(k) ? 'on' : ''}" style="cursor:pointer"><input type="checkbox" name="games" value="${k}" ${D.games.includes(k) ? 'checked' : ''} hidden data-chipcheck>${gicon(k, 18)} ${esc(g.name)}</label>`).join('')}</div></div>
      <label class="switch"><input type="checkbox" name="verified" id="pfVer" ${D.verified ? 'checked' : ''}> Mostrar selo de verificação fictício</label>
      <div class="field"><span>Agenda de lives</span><div class="agenda-edit">${D.agenda.map((a, i) => `<div class="row"><select class="input" name="aday" id="ad${i}">${DAYS.map((d, j) => `<option value="${j}" ${a.day === j ? 'selected' : ''}>${d}</option>`).join('')}</select><input class="input" type="time" name="atime" id="at${i}" value="${esc(a.time)}"><select class="input" name="agame" id="ag${i}">${Object.entries(GAMES).map(([k, g]) => `<option value="${k}" ${a.game === k ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select><button type="button" class="icon-btn" data-act="agenda-del" data-i="${i}" aria-label="Remover">${icon('trash')}</button></div>`).join('')}</div>
        <button type="button" class="btn btn-sm" data-act="agenda-add" style="align-self:flex-start">${icon('plus')} Adicionar horário</button></div>
    </div>
    <div class="modal-foot"><button type="button" class="btn btn-ghost" data-act="modal-close">Cancelar</button><button class="btn btn-primary">Guardar perfil</button></div>
  </form>`);
}

/* ---------- Editor de eventos ---------- */
function openEventEditor(evId, dateTs) {
  const ev = evId && S.events.find(e => e.id === evId);
  MODAL.kind = 'event'; MODAL.evId = ev ? ev.id : null; MODAL.confirm = null;
  let start;
  if (ev) start = ev.start;
  else {
    const n = new Date(Date.now() + 30 * MIN); n.setMinutes(n.getMinutes() < 30 ? 30 : 60, 0, 0); start = n.getTime();
    if (dateTs && !sameDay(start, dateTs)) { const d = new Date(dateTs); const h = new Date(start); d.setHours(h.getHours(), h.getMinutes(), 0, 0); start = d.getTime() > Date.now() ? d.getTime() : start; }
  }
  MODAL.draft = ev ? { ...ev, cover: { ...ev.cover } } : {
    title: '', desc: '', game: S.me.games[0] || 'fortnite', mode: 'superstar', level: 'enorme', start,
    cover: { type: 'preset', v: randi(0, COVERS.length - 1) }, countdown: true, reminders: true,
  };
  paintEventEditor();
}
function syncEventDraft() {
  const f = $('#evForm'); if (!f) return;
  const D = MODAL.draft;
  D.title = f.title.value; D.desc = f.desc.value; D.game = f.game.value; D.mode = f.mode.value; D.level = f.level.value;
  D.countdown = f.countdown.checked; D.reminders = f.reminders.checked;
  const [y, mo, da] = (f.date.value || toLocalInput(Date.now())).split('-').map(Number);
  const [h, mi] = (f.time.value || '18:00').split(':').map(Number);
  D.start = new Date(y, mo - 1, da, h, mi).getTime();
}
function paintEventEditor() {
  const D = MODAL.draft, editing = !!MODAL.evId;
  const preview = { ...D, id: 'preview', owner: 'me', interested: D.interested || 0, reminderUsers: D.reminderUsers || 0, notified: {}, cancelled: false };
  const C = MODAL.confirm;
  openModal(`<div class="modal-head"><h2>${editing ? 'Editar evento' : 'Agendar live'}</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
  <form id="evForm" data-form="event">
    <div class="modal-body">
      <div id="evPreview">${eventPreview(preview)}</div>
      <label class="field"><span>Título do evento</span><input class="input" name="title" id="evTitle" maxlength="70" required placeholder="FORTNITE — MODO SUPERSTAR" value="${esc(D.title)}" data-evprev></label>
      <label class="field"><span>Descrição</span><textarea class="input" name="desc" id="evDesc" maxlength="400" placeholder="Hoje às 18:00 vou entrar em live no Modo Superstar! Quero chegar aos 100 mil espectadores virtuais. Apareçam!" data-evprev>${esc(D.desc)}</textarea></label>
      <div class="grid-3">
        <label class="field"><span>Jogo</span><select class="input" name="game" id="evGame" data-evprev>${Object.entries(GAMES).map(([k, g]) => `<option value="${k}" ${D.game === k ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Data</span><input class="input" type="date" name="date" id="evDate" required min="${toLocalInput(Date.now())}" value="${toLocalInput(D.start)}" data-evprev></label>
        <label class="field"><span>Hora (qualquer hora)</span><input class="input" type="time" step="60" name="time" id="evTime" required value="${hhmm(D.start)}" data-evprev></label>
      </div>
      <div class="field"><span>Atalhos</span><div class="chip-row">${[['15m', 'Daqui a 15 min'], ['30m', 'Daqui a 30 min'], ['60m', 'Daqui a 1 h'], ['120m', 'Daqui a 2 h'], ['tonight', 'Hoje às 21:00'], ['tomorrow', 'Amanhã a esta hora'], ['weekend', 'Sábado às 16:00']].map(([k, l]) => `<button type="button" class="chip" data-act="ev-quick" data-k="${k}">${l}</button>`).join('')}</div>
        <span class="tiny muted" style="text-transform:none;letter-spacing:0;font-weight:500">Escolhe qualquer dia e hora nos campos acima ou usa um atalho. Começa às ${hhmm(D.start)} de ${dayLabel(D.start).toLowerCase()}.</span></div>
      <div class="grid-2">
        <label class="field"><span>Modo de live</span><select class="input" name="mode" id="evMode" data-evprev>${Object.entries(MODES).map(([k, m]) => `<option value="${k}" ${D.mode === k ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Nível de audiência</span><select class="input" name="level" id="evLevel" data-evprev>${Object.entries(LEVELS).map(([k, l]) => `<option value="${k}" ${D.level === k ? 'selected' : ''}>${esc(l.name)} · até ${dots(l.max)} espectadores virtuais</option>`).join('')}</select></label>
      </div>
      <div class="field"><span>Imagem de capa</span><div class="cover-picks">${COVERS.map((c, i) => `<button type="button" class="cover-pick ${D.cover.type === 'preset' && D.cover.v === i ? 'on' : ''}" style="--cover:${esc(c)}" data-act="ev-cover" data-v="${i}" aria-label="Capa ${i + 1}"></button>`).join('')}<label class="btn btn-sm upload">${icon('image')} Carregar imagem<input type="file" accept="image/*" data-file="ev-cover" id="evCoverUp"></label></div></div>
      <div class="row" style="gap:20px"><label class="switch"><input type="checkbox" name="countdown" id="evCd" ${D.countdown ? 'checked' : ''} data-evprev> Contagem decrescente</label><label class="switch"><input type="checkbox" name="reminders" id="evRem" ${D.reminders ? 'checked' : ''} data-evprev> Lembretes simulados</label></div>
      <div class="kv"><span>Visibilidade</span><b>Pública dentro da rede social fictícia</b></div>
      ${C === 'cancel' ? `<div class="confirm-box"><span>Cancelar este evento? O cartão passa a mostrar «Cancelado» no feed e no perfil.</span><button type="button" class="btn btn-sm btn-ghost" data-act="confirm-no">Manter</button><button type="button" class="btn btn-sm btn-danger" data-act="ev-cancel" data-id="${MODAL.evId}">Cancelar evento</button></div>` : ''}
      <p class="small" id="evErr" style="color:#ff8aa0;margin:0" hidden></p>
    </div>
    <div class="modal-foot">${editing ? `<button type="button" class="btn btn-danger" data-act="ev-cancel-ask" style="margin-right:auto">Cancelar evento</button>` : ''}<button type="button" class="btn btn-ghost" data-act="modal-close">Fechar</button><button class="btn btn-primary">${editing ? 'Guardar alterações' : icon('calendar') + ' Publicar evento'}</button></div>
  </form>`, true);
}
function eventPreview(ev) {
  return `<span class="tiny muted">PRÉ-VISUALIZAÇÃO DO CARTÃO</span>${eventCard({ ...ev, title: ev.title || 'Título do evento', desc: ev.desc || '' }, { inModal: true, preview: true }).replace(/data-act="[^"]*"/g, 'tabindex="-1"').replace(/<button /g, '<button type="button" ').replace(/<a class="btn/g, '<span class="btn')}`;
}
function refreshEventPreview() {
  syncEventDraft();
  const D = MODAL.draft; const box = $('#evPreview'); if (!box) return;
  box.innerHTML = eventPreview({ ...D, id: 'preview', owner: 'me', interested: D.interested || 0, reminderUsers: D.reminderUsers || 0, notified: {}, cancelled: false, liveId: null, endedAt: null });
  tickCountdowns();
}
function saveEvent() {
  syncEventDraft();
  const D = MODAL.draft, err = $('#evErr');
  const fail = t => { err.textContent = t; err.hidden = false; };
  if (!D.title.trim()) return fail('Dá um título ao evento.');
  if (D.start < Date.now() + 60000 && !MODAL.evId) return fail('Escolhe uma data e hora no futuro.');
  if (MODAL.evId) {
    const ev = S.events.find(e => e.id === MODAL.evId);
    const moved = ev.start !== D.start;
    Object.assign(ev, { title: D.title.trim(), desc: D.desc.trim(), game: D.game, mode: D.mode, level: D.level, start: D.start, cover: D.cover, countdown: D.countdown, reminders: D.reminders });
    if (moved) { ev.notified = { k1: ev.notified.k1, trend: ev.notified.trend }; ev.endedAt = null; }
    toast('✅', 'Evento atualizado');
  } else {
    const now = Date.now();
    const ev = { id: 'ev_' + uid(), owner: 'me', title: D.title.trim(), desc: D.desc.trim(), game: D.game, mode: D.mode, level: D.level, start: D.start, cover: D.cover,
      countdown: D.countdown, reminders: D.reminders, cancelled: false, liveId: null, endedAt: null, interested: randi(8, 40), reminderUsers: 0, notified: {}, createdAt: now, myReminder: true };
    const post = { id: 'p_' + uid(), author: 'me', type: 'event', eventId: ev.id, text: null, createdAt: now, likes: 0, liked: false, reposts: 0, reposted: false, saved: false, views: 0, replies: [], status: 'published' };
    ev.postId = post.id;
    S.events.push(ev); S.posts.push(post);
    addXP(40);
    notify('📅', `Evento publicado: «${ev.title}» · ${whenLabel(ev.start)}. Está no teu perfil, no feed e em Eventos.`, { ev: ev.id });
    toast('📅', 'Evento publicado no perfil, no feed e em Eventos');
    fakeEngagement(post);
    checkAch();
  }
  save(); closeModal(); render();
}

/* ---------- Detalhes do evento ---------- */
function openEventDetail(id, confirm = null) {
  const ev = S.events.find(e => e.id === id); if (!ev) return toast('⚠️', 'Este evento já não existe.');
  MODAL.kind = 'detail'; MODAL.evId = id; MODAL.confirm = confirm;
  const st = eventStatus(ev), a = acc(ev.owner), mine = ev.owner === 'me', L = LEVELS[ev.level] || LEVELS.media;
  openModal(`<div class="modal-head"><h2>Detalhes do evento</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
  <div class="modal-body">
    ${eventCard(ev, { inModal: true })}
    ${ev.desc ? `<p style="margin:0;white-space:pre-wrap">${richText(ev.desc)}</p>` : ''}
    <section>
      <div class="kv"><span>Anfitrião</span><b>${esc(a.name)} · @${esc(a.handle)}</b></div>
      <div class="kv"><span>Jogo</span><b>${esc(GAMES[ev.game]?.name)}</b></div>
      <div class="kv"><span>Modo</span><b>${esc(MODES[ev.mode]?.name)}</b></div>
      <div class="kv"><span>Data e hora</span><b>${whenLabel(ev.start)}</b></div>
      <div class="kv"><span>Audiência esperada</span><b>Até ${dots(L.max)} espectadores virtuais</b></div>
      <div class="kv"><span>Visibilidade</span><b>Pública dentro da rede social fictícia</b></div>
      <div class="kv"><span>Estado</span><b>${STATUS_LABEL[st]}</b></div>
      <div class="kv"><span>Lembretes simulados</span><b>${ev.reminders ? dots(ev.reminderUsers) + ' utilizadores fictícios' : 'Desligados'}</b></div>
    </section>
    <button class="btn btn-sm" data-act="share-dm" data-type="event" data-id="${ev.id}" style="align-self:flex-start">${icon('send')} Enviar por mensagem</button>
    ${!mine && st !== 'ended' && st !== 'cancelled' ? `<button class="btn ${ev.myInterest ? '' : 'btn-primary'}" data-act="interest" data-id="${ev.id}">${ev.myInterest ? icon('check') + ' Tens interesse' : '⭐ Tenho interesse'}</button>` : ''}
    ${MODAL.confirm === 'delete' ? `<div class="confirm-box"><span>Eliminar este evento? A publicação do evento também é removida do feed.</span><button class="btn btn-sm btn-ghost" data-act="confirm-no">Manter</button><button class="btn btn-sm btn-danger" data-act="ev-delete" data-id="${ev.id}">${icon('trash')} Eliminar</button></div>` : ''}
    ${MODAL.confirm === 'cancel' ? `<div class="confirm-box"><span>Cancelar este evento? Continua visível como «Cancelado».</span><button class="btn btn-sm btn-ghost" data-act="confirm-no">Manter</button><button class="btn btn-sm btn-danger" data-act="ev-cancel" data-id="${ev.id}">Cancelar evento</button></div>` : ''}
  </div>
  ${mine ? `<div class="modal-foot">
    <button class="btn btn-danger" data-act="ev-delete-ask" data-id="${ev.id}" style="margin-right:auto">${icon('trash')} Eliminar</button>
    ${['scheduled', 'soon'].includes(st) ? `<button class="btn" data-act="ev-cancel-ask" data-id="${ev.id}">Cancelar evento</button><button class="btn" data-act="event-edit" data-id="${ev.id}">${icon('edit')} Editar</button>` : ''}
    ${st === 'cancelled' ? `<button class="btn" data-act="ev-restore" data-id="${ev.id}">Repor evento</button>` : ''}
    ${['scheduled', 'soon'].includes(st) && !S.live ? `<button class="btn btn-live" data-act="start-event" data-id="${ev.id}">${icon('studio')} ${st === 'soon' ? 'Começar live' : 'Começar já'}</button>` : ''}
  </div>` : ''}`);
  tickCountdowns();
}

/* ---------- Envolvimento simulado ---------- */
const REPLY_POOLS = {
  event: ['Lá estarei! 🔥', 'Já ativei o lembrete ⏰', 'Bora aos {goal}!', 'Não vou perder!', 'Contagem decrescente ligada 👀'],
  live: ['A caminho!', 'Já estou no chat 💜', 'Bora!!'],
  poll: ['Votei!', 'Difícil escolher 😅', 'A primeira, claro'],
  achievement: ['Parabéns!! 🏆', 'Mereces!', 'Que orgulho 💜'],
  clip: ['QUE CLIP 😭', 'Replay infinito', 'Isto é lendário'],
  text: ['Top 🔥', 'Concordo totalmente', 'Isso mesmo!', '💜💜', 'Quando é a próxima live?', 'Grande!'],
};
function fakeEngagement(post) {
  const base = Math.max(20, S.me.followers * .01);
  const steps = 6;
  for (let i = 1; i <= steps; i++) setTimeout(() => {
    post.likes += Math.round(base * rand(.05, .25)); post.views += Math.round(base * rand(.4, 1.2)); post.reposts += Math.random() < .5 ? randi(0, Math.ceil(base / 200)) : 0;
    rerenderPost(post.id); save();
  }, i * rand(1500, 3500));
  const nReplies = randi(1, 2);
  for (let i = 0; i < nReplies; i++) setTimeout(() => {
    const a = pick(S.accounts); const ev = post.eventId && S.events.find(e => e.id === post.eventId);
    const pool = REPLY_POOLS[post.type] || REPLY_POOLS.text;
    const text = pick(pool).replace('{goal}', ev ? fmt(LEVELS[ev.level].max) : '100 mil');
    post.replies.push({ id: uid(), author: a.id, text, t: Date.now() });
    notify('💬', `${a.name} respondeu à tua publicação: «${text}»`, { post: post.id });
    rerenderPost(post.id); save();
  }, rand(2500, 6000) + i * 2500);
  setTimeout(() => notify('💜', `${dots(post.likes)} utilizadores fictícios gostaram da tua publicação.`, { post: post.id }), 14000);
}
function rerenderPost(id) {
  const p = S.posts.find(x => x.id === id); if (!p) return;
  $$(`[data-post="${id}"]`).forEach(el => {
    const keep = el.querySelector('.reply-form input'); const val = keep && keep.value; const focused = keep && document.activeElement === keep;
    el.outerHTML = postCard(p);
    if (val || focused) { const n = $(`[data-post="${id}"] .reply-form input`); if (n) { n.value = val || ''; if (focused) n.focus(); } }
  });
  tickCountdowns();
}

/* ---------- Publicar ---------- */
function publishPost() {
  const c = UI.cmp; const text = c.text.trim();
  const fail = t => toast('⚠️', t);
  if (text.length > 500) return fail('O texto tem mais de 500 caracteres.');
  const p = { id: 'p_' + uid(), author: 'me', type: c.type, text, createdAt: Date.now(), likes: 0, liked: false, reposts: 0, reposted: false, saved: false, views: 0, replies: [], status: 'published' };
  if (c.type === 'text' && !text) return fail('Escreve alguma coisa antes de publicar.');
  if (c.type === 'game' || c.type === 'live') { p.game = c.game; if (c.type === 'live' && S.live) { p.liveId = S.live.id; p.game = S.live.game; } if (!text) p.text = c.type === 'live' ? `Vou entrar em direto em ${GAMES[p.game].name}! 🔴 #LiveVerse` : `A jogar ${GAMES[p.game].name} 🎮`; }
  if (c.type === 'event') { if (!c.eventId) return fail('Escolhe um evento ou cria um novo.'); p.eventId = c.eventId; p.text = text || null; }
  if (c.type === 'poll') { const opts = c.poll.map(s => s.trim()).filter(Boolean); if (!text) return fail('Escreve a pergunta da sondagem.'); if (opts.length < 2) return fail('A sondagem precisa de pelo menos 2 opções.'); p.poll = { options: opts.map(t => ({ t, v: 0 })), myVote: null, ends: 0, hours: +c.pollHours }; }
  if (c.type === 'achievement') { if (!c.achId) return fail('Escolhe uma conquista.'); p.achId = c.achId; if (!text) p.text = `Nova conquista desbloqueada: ${ACHIEVEMENTS.find(a => a.id === c.achId).name}! 🏆 #conquista`; }
  if (c.type === 'photo') { if (!c.img) return fail('Escolhe uma fotografia.'); p.img = c.img; }
  if (c.type === 'clip') { if (!c.clipId) return fail('Escolhe um clip.'); p.clipId = c.clipId; }
  if (c.schedule) {
    const at = c.at ? new Date(c.at).getTime() : NaN;
    if (!(at > Date.now() + 30000)) return fail('Escolhe uma data e hora de publicação no futuro.');
    p.status = 'scheduled'; p.scheduledAt = at;
    toast('🕒', `Publicação agendada para ${whenLabel(at)}`);
  } else {
    activatePost(p);
    toast('✅', 'Publicado');
  }
  S.posts.push(p);
  UI.cmp = { ...UI.cmp, type: 'text', text: '', poll: ['', ''], achId: '', img: null, clipId: '', eventId: '', schedule: false, at: '' };
  addXP(12); checkAch(); save(); render();
  if (p.status === 'published') fakeEngagement(p);
}
function activatePost(p) {
  p.status = 'published'; p.createdAt = p.scheduledAt || Date.now();
  if (p.poll && !p.poll.ends) p.poll.ends = p.createdAt + (p.poll.hours || 24) * HOUR;
}

/* ---------- Ações (delegação) ---------- */
const ACT = {
  'compose': () => { if (route().name !== 'feed') location.hash = '#feed'; setTimeout(() => { const t = $('#cmpText'); t && (t.focus(), t.scrollIntoView({ block: 'center', behavior: 'smooth' })); }, 60); },
  'new-event': b => openEventEditor(null, b.dataset.date ? +b.dataset.date : null),
  'feed-tab': b => { UI.feedTab = b.dataset.k; render(); },
  'tag': b => { UI.tag = b.dataset.tag.toLowerCase(); UI.feedTab = 'all'; if (route().name !== 'feed') location.hash = '#feed'; else render(); window.scrollTo({ top: 0 }); },
  'tag-clear': () => { UI.tag = null; render(); },
  'cmp-type': b => { UI.cmp.type = b.dataset.k; refreshComposer(); },
  'poll-add': () => { if (UI.cmp.poll.length < 4) UI.cmp.poll.push(''); refreshComposer(); },
  'poll-del': b => { UI.cmp.poll.splice(+b.dataset.i, 1); refreshComposer(); },
  'cmp-img-del': () => { UI.cmp.img = null; refreshComposer(); },
  'publish': () => publishPost(),
  'sched-cancel': b => { S.posts = S.posts.filter(p => p.id !== b.dataset.id); save(); refreshComposer(); toast('🗑️', 'Publicação agendada cancelada'); },
  'menu': b => { const id = b.dataset.id; const prev = UI.menu; UI.menu = prev === id ? null : id; if (prev && prev !== id) rerenderPost(prev); rerenderPost(id); },
  'like': b => { const p = S.posts.find(x => x.id === b.dataset.id); p.liked = !p.liked; p.likes += p.liked ? 1 : -1; save(); rerenderPost(p.id); },
  'repost': b => { const p = S.posts.find(x => x.id === b.dataset.id); p.reposted = !p.reposted; p.reposts += p.reposted ? 1 : -1; if (p.reposted) toast('🔁', 'Repostado no teu perfil'); save(); rerenderPost(p.id); },
  'save': b => { const p = S.posts.find(x => x.id === b.dataset.id); p.saved = !p.saved; toast('🔖', p.saved ? 'Guardado' : 'Removido dos guardados'); save(); rerenderPost(p.id); },
  'pin': b => { const id = b.dataset.id; S.pinned = S.pinned === id ? null : id; UI.menu = null; toast('📌', S.pinned ? 'Fixado no perfil' : 'Desafixado'); checkAch(); save(); render(); },
  'reply-toggle': b => { const id = b.dataset.id; UI.openReplies.has(id) ? UI.openReplies.delete(id) : UI.openReplies.add(id); rerenderPost(id); const i = $(`#reply-${id}`); i && i.focus(); },
  'vote': b => { const p = S.posts.find(x => x.id === b.dataset.id); if (p.poll.myVote != null) return; p.poll.myVote = +b.dataset.i; p.poll.options[+b.dataset.i].v++; save(); rerenderPost(p.id); },
  'copy-post': b => { const p = S.posts.find(x => x.id === b.dataset.id); copyText(postText(p)); UI.menu = null; rerenderPost(p.id); },
  'post-del': b => { const id = b.dataset.id; const p = S.posts.find(x => x.id === id); S.posts = S.posts.filter(x => x.id !== id); if (S.pinned === id) S.pinned = null; if (p && p.type === 'event') { const ev = S.events.find(e => e.id === p.eventId); if (ev && ev.postId === id) ev.postId = null; } UI.menu = null; save(); render(); toast('🗑️', 'Publicação eliminada'); },
  'follow': b => { const a = S.accounts.find(x => x.id === b.dataset.id); if (!a) return; a.followed = !a.followed; a.followers += a.followed ? 1 : -1; UI.menu = null; toast(a.followed ? '💜' : '👋', a.followed ? `A seguir ${a.name}` : `Deixaste de seguir ${a.name}`); save(); render(); if (MODAL.kind === null && !$('#modal').hidden) { } },
  'event-open': b => { UI.menu = null; openEventDetail(b.dataset.id, b.dataset.confirm || null); },
  'event-edit': b => openEventEditor(b.dataset.id),
  'remind': b => { const ev = S.events.find(e => e.id === b.dataset.id); if (!ev) return; ev.myReminder = !ev.myReminder; if (ev.owner !== 'me') { ev.myInterest = ev.myReminder || ev.myInterest; ev.interested += ev.myReminder ? 1 : 0; } toast(ev.myReminder ? '⏰' : '🔕', ev.myReminder ? 'Lembrete ativo: vais receber uma notificação antes de começar.' : 'Lembrete desligado'); save(); rerenderAll(); },
  'interest': b => { const ev = S.events.find(e => e.id === b.dataset.id); ev.myInterest = !ev.myInterest; ev.interested += ev.myInterest ? 1 : -1; save(); openEventDetail(ev.id); render(); },
  'start-event': b => { const ev = S.events.find(e => e.id === b.dataset.id); if (!ev || S.live) return; closeModalIfOpen(); startLive({ title: ev.title, game: ev.game, mode: ev.mode, level: ev.level, eventId: ev.id }); },
  'watch': b => openWatch(b.dataset.id),
  'prof-tab': b => { UI.profTab = b.dataset.k; render(); },
  'prof-sub': b => { UI.profSub = b.dataset.k; render(); },
  'edit-profile': () => openProfileEditor(),
  'announce-ach': b => { UI.cmp.type = 'achievement'; UI.cmp.achId = b.dataset.id; location.hash = '#feed'; closeModalIfOpen(); setTimeout(() => $('#cmpText')?.focus(), 80); },
  'ev-tab': b => { UI.evTab = b.dataset.k; render(); },
  'cal-nav': b => { const d = new Date(UI.calMonth); d.setMonth(d.getMonth() + +b.dataset.d); UI.calMonth = d.getTime(); render(); },
  'cal-today': () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); UI.calMonth = d.getTime(); UI.calSel = Date.now(); render(); },
  'cal-sel': b => { const t = +b.dataset.t; UI.calSel = UI.calSel && sameDay(UI.calSel, t) ? null : t; render(); },
  'notif-read': () => { S.notifs.forEach(n => n.read = true); save(); render(); },
  'notif-clear': () => { S.notifs = []; save(); render(); },
  'notif-open': b => {
    const n = S.notifs.find(x => x.id === b.dataset.id); if (!n) return; n.read = true; save();
    if (n.link?.dm) { location.hash = '#conversa-' + n.link.dm; }
    else if (n.link?.ev) { render(); openEventDetail(n.link.ev); }
    else if (n.link?.post) { UI.openReplies.add(n.link.post); location.hash = '#perfil'; UI.profTab = 'posts'; UI.profSub = 'posts'; render(); }
    else if (n.link?.ach) { location.hash = '#perfil'; UI.profTab = 'ach'; render(); }
    else render();
  },
  'clip-tab': b => { UI.clipTab = b.dataset.k; render(); },
  'clip-like': b => { const c = S.clips.find(x => x.id === b.dataset.id); c.liked = !c.liked; c.likes += c.liked ? 1 : -1; save(); render(); },
  'clip-comments': b => { const id = b.dataset.id; UI.openComments.has(id) ? UI.openComments.delete(id) : UI.openComments.add(id); render(); },
  'clip-share': b => {
    const c = S.clips.find(x => x.id === b.dataset.id);
    const p = { id: 'p_' + uid(), author: 'me', type: 'clip', clipId: c.id, text: `${c.emoji} ${c.title} #clips #${(GAMES[c.game]?.name || '').replace(/[^\p{L}\d]/gu, '').toLowerCase()}`, createdAt: Date.now(), likes: 0, liked: false, reposts: 0, reposted: false, saved: false, views: 0, replies: [], status: 'published' };
    S.posts.push(p); copyText(`${c.title} — clip simulado de @${acc(c.streamer).handle} no LiveVerse`, true);
    toast('🎬', 'Clip partilhado no feed'); fakeEngagement(p); checkAch(); save(); render();
  },
  'clip-profile': b => { const c = S.clips.find(x => x.id === b.dataset.id); c.onProfile = !c.onProfile; toast('🎬', c.onProfile ? 'Clip adicionado ao perfil' : 'Clip removido do perfil'); save(); render(); },
  'clip-del': b => { S.clips = S.clips.filter(x => x.id !== b.dataset.id); S.posts = S.posts.filter(p => p.clipId !== b.dataset.id); save(); render(); toast('🗑️', 'Clip eliminado'); },
  'react': b => { react(b.dataset.id); b.classList.remove('fired'); void b.offsetWidth; b.classList.add('fired'); },
  'react-custom-focus': () => { const i = $('#customReact'); if (i && i.value.trim()) { react('custom', i.value.trim()); } else i && i.focus(); },
  'react-more': () => { STUDIO.showMore = !STUDIO.showMore; render(); },
  'raid': () => raid(),
  'gift-sim': () => giftEvent(),
  'poll-end': () => endPoll(),
  'tl-clip': b => { clipFromTimeline(b.dataset.id); if (!S.live) render(); },
  'end-live-ask': () => { $('#endConfirm').innerHTML = `<div class="confirm-box" style="margin-bottom:16px"><span>Terminar a live? O resumo e a cronologia ficam guardados no perfil.</span><button class="btn btn-sm btn-ghost" data-act="end-live-no">Continuar em direto</button><button class="btn btn-sm" data-act="end-raid-pick">🚀 Terminar com raid</button><button class="btn btn-sm btn-danger" data-act="end-live">Terminar live</button></div>`; },
  'end-live-no': () => { $('#endConfirm').innerHTML = ''; },
  'end-live': () => endLive(),
  'announce-live': () => {
    const L = S.live; if (!L) return;
    const p = { id: 'p_' + uid(), author: 'me', type: 'live', game: L.game, liveId: L.id, eventId: L.eventId || undefined, text: `🔴 ESTOU EM DIRETO! ${L.title} · ${GAMES[L.game].name} no Modo ${MODES[L.mode].name}. Venham para o chat! #LiveVerse`, createdAt: Date.now(), likes: 0, liked: false, reposts: 0, reposted: false, saved: false, views: 0, replies: [], status: 'published' };
    if (!p.eventId) delete p.eventId;
    S.posts.push(p); fakeEngagement(p); L.boost += (LEVELS[L.level].max) * .03; toast('📣', 'Live anunciada no feed'); save();
  },
  'share-recap': b => {
    const l = S.lives.find(x => x.id === b.dataset.id); if (!l) return;
    const p = { id: 'p_' + uid(), author: 'me', type: 'game', game: l.game, text: `Que live! «${l.title}» chegou a um pico de ${fmt(l.peak)} espectadores virtuais. Obrigado a todos 💜 #LiveVerse`, recap: { peak: l.peak, followers: l.followers, gifts: l.gifts, dur: l.end - l.start }, createdAt: Date.now(), likes: 0, liked: false, reposts: 0, reposted: false, saved: false, views: 0, replies: [], status: 'published' };
    S.posts.push(p); fakeEngagement(p); toast('✅', 'Resumo partilhado no feed'); STUDIO.summary = null; save(); render();
  },
  'summary-close': () => { STUDIO.summary = null; render(); },
  'studio-media-clear': () => { if (STUDIO.media) URL.revokeObjectURL(STUDIO.media.url); STUDIO.media = null; render(); },
  'modal-close': () => closeModal(),
  'confirm-no': () => { MODAL.confirm = null; if (MODAL.kind === 'event') { syncEventDraft(); paintEventEditor(); } else openEventDetail(MODAL.evId); },
  'ev-cover': b => { syncEventDraft(); MODAL.draft.cover = { type: 'preset', v: +b.dataset.v }; paintEventEditor(); },
  'ev-cancel-ask': b => { if (MODAL.kind === 'event') { syncEventDraft(); MODAL.confirm = 'cancel'; paintEventEditor(); } else openEventDetail(b.dataset.id, 'cancel'); },
  'ev-cancel': b => { const ev = S.events.find(e => e.id === b.dataset.id); ev.cancelled = true; notify('🚫', `Cancelaste o evento «${ev.title}». Os interessados fictícios foram avisados.`, { ev: ev.id }); toast('🚫', 'Evento cancelado'); save(); closeModal(); render(); },
  'ev-restore': b => { const ev = S.events.find(e => e.id === b.dataset.id); ev.cancelled = false; toast('✅', 'Evento reposto'); save(); openEventDetail(ev.id); render(); },
  'ev-delete-ask': b => openEventDetail(b.dataset.id, 'delete'),
  'ev-delete': b => { const id = b.dataset.id; S.events = S.events.filter(e => e.id !== id); S.posts = S.posts.filter(p => !(p.author === 'me' && p.type === 'event' && p.eventId === id)); if (S.pinned && !S.posts.find(p => p.id === S.pinned)) S.pinned = null; toast('🗑️', 'Evento eliminado'); save(); closeModal(); render(); },
  'prof-cover': b => { syncProfileDraft(); MODAL.draft.cover = +b.dataset.v; MODAL.draft.banner = null; paintProfileEditor(); },
  'avatar-clear': () => { syncProfileDraft(); MODAL.draft.avatar = null; paintProfileEditor(); },
  'accent': b => { syncProfileDraft(); MODAL.draft.accent = b.dataset.v; document.documentElement.dataset.accent = b.dataset.v; paintProfileEditor(); },
  'agenda-add': () => { syncProfileDraft(); MODAL.draft.agenda.push({ day: 5, time: '21:00', game: MODAL.draft.games[0] || 'fortnite' }); paintProfileEditor(); },
  'agenda-del': b => { syncProfileDraft(); MODAL.draft.agenda.splice(+b.dataset.i, 1); paintProfileEditor(); },
};
function closeModalIfOpen() { if (!$('#modal').hidden) closeModal(); }
function rerenderAll() { const open = !$('#modal').hidden && MODAL.kind === 'detail'; render(); if (open) openEventDetail(MODAL.evId); }
function copyText(t, quiet) {
  try { navigator.clipboard.writeText(t).then(() => !quiet && toast('📋', 'Copiado'), () => !quiet && toast('📋', 'Não foi possível copiar automaticamente.')); }
  catch (e) { !quiet && toast('📋', 'Não foi possível copiar automaticamente.'); }
}

/* ---------- Formulários ---------- */
const FORMS = {
  reply: f => {
    const t = f.t.value.trim(); if (!t) return; const p = S.posts.find(x => x.id === f.dataset.id);
    p.replies.push({ id: uid(), author: 'me', text: t, t: Date.now() }); save(); rerenderPost(p.id);
    $(`#reply-${p.id}`)?.focus();
    if (p.author !== 'me') setTimeout(() => { p.replies.push({ id: uid(), author: p.author, text: pick(['Obrigado! 💜', 'Haha exatamente', 'Bora nessa!', 'Aparece na próxima live 🔥']), t: Date.now() }); rerenderPost(p.id); save(); notify('💬', `${acc(p.author).name} respondeu-te.`, { post: p.id }); }, rand(2500, 5000));
  },
  'clip-comment': f => { const t = f.t.value.trim(); if (!t) return; const c = S.clips.find(x => x.id === f.dataset.id); c.commentsList = [...(c.commentsList || []), { u: S.me.handle, t }]; c.comments++; save(); render(); $(`#cc-${c.id}`)?.focus(); },
  'react-custom': f => { const t = f.t.value.trim(); if (!t) return f.t.focus(); react('custom', t); STUDIO.custom = ''; f.t.value = ''; },
  chat: f => { const t = f.t.value.trim(); if (!t || !S.live) return; const ep = f.querySelector('.emote-pop'); if (ep) ep.hidden = true; pushChat({ user: S.me.name, text: t, me: true, color: '#ff4fa8' }); f.t.value = '';
    setTimeout(() => S.live && pushChat({ user: fakeUser(), text: pick(['respondeu-me!! 😭', 'concordo!', '💜💜💜', 'haha verdade', 'LEMBRA-TE DE MIM ' + S.me.name.split(' ')[0].toUpperCase()]) }), 700); },
  'watch-chat': f => { const t = f.t.value.trim(); if (!t) return; const box = $('#wChat'); box.insertAdjacentHTML('beforeend', chatMsgHTML({ user: S.me.name, text: t, me: true, color: '#ff4fa8' })); box.scrollTop = box.scrollHeight; f.t.value = ''; },
  'live-poll': f => { const opts = [f.a.value, f.b.value, f.c.value, f.d.value].map(s => s.trim()).filter(Boolean); if (opts.length < 2) return; startPoll(f.q.value.trim(), opts); },
  'go-live': f => { const st = STUDIO.setup; const ev = st.eventId && S.events.find(e => e.id === st.eventId); startLive(ev ? { title: ev.title, game: ev.game, mode: ev.mode, level: ev.level, eventId: ev.id } : { title: f.title.value.trim() || `Live de ${GAMES[st.game].name}`, game: st.game, mode: st.mode, level: st.level }); STUDIO.setup = null; },
  profile: f => {
    syncProfileDraft(); const D = MODAL.draft;
    const handle = D.handle.trim().replace(/^@/, '').toLowerCase();
    if (!D.name.trim() || !/^[a-z0-9_.]+$/.test(handle)) return toast('⚠️', 'Nome de utilizador: só letras, números, «_» e «.».');
    Object.assign(S.me, { name: D.name.trim(), handle, bio: D.bio.trim(), category: D.category, games: D.games.length ? D.games : ['fortnite'], avatar: D.avatar, banner: D.banner, cover: D.cover, accent: D.accent, verified: D.verified, agenda: D.agenda });
    save(); closeModal(); render(); toast('✅', 'Perfil guardado');
  },
  event: () => saveEvent(),
};

/* ---------- Ficheiros ---------- */
async function fileToDataURL(file, maxW, maxH, q = .82) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const s = Math.min(1, maxW / img.width, maxH / img.height);
    const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', q);
  } finally { URL.revokeObjectURL(url); }
}
async function onFile(input) {
  const file = input.files && input.files[0]; if (!file) return;
  const kind = input.dataset.file;
  try {
    if (kind === 'cmp-photo') { UI.cmp.img = await fileToDataURL(file, 1200, 1200); refreshComposer(); }
    else if (kind === 'avatar') { syncProfileDraft(); MODAL.draft.avatar = await fileToDataURL(file, 320, 320, .85); paintProfileEditor(); }
    else if (kind === 'banner') { syncProfileDraft(); MODAL.draft.banner = await fileToDataURL(file, 1500, 500); paintProfileEditor(); }
    else if (kind === 'ev-cover') { syncEventDraft(); MODAL.draft.cover = { type: 'img', v: await fileToDataURL(file, 1000, 500) }; paintEventEditor(); }
    else if (kind === 'gift-sound') {
      if (file.size > 600 * 1024) { toast('⚠️', 'O som é demasiado grande. Usa um ficheiro com menos de 600 KB (alguns segundos).'); return; }
      S.prefs.giftSound = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
      GS.buf = null; save(); giftSound(true); toast('🔊', 'Som dos presentes atualizado');
      $$('[data-soundpanel]').forEach(el => el.outerHTML = soundPanelHTML());
    }
    else if (kind === 'emote-img') { UI.emoteDraft = await squareEmote(file); openEmotes(); setTimeout(() => $('#emoteCode')?.focus(), 50); }
    else if (kind === 'cam-img') { S.prefs.camImg = await fileToDataURL(file, 400, 400, .85); save(); paintScreen(); $$('[data-immpanel]').forEach(el => el.outerHTML = immersivePanelHTML()); toast('🙂', 'Imagem do avatar atualizada'); }
    else if (kind === 'studio-media') { if (STUDIO.media) URL.revokeObjectURL(STUDIO.media.url); STUDIO.media = { kind: file.type.startsWith('video') ? 'video' : 'image', url: URL.createObjectURL(file) }; render(); }
    else if (kind === 'clip-media') { const c = S.clips.find(x => x.id === input.dataset.id); c.media = file.type.startsWith('video') ? { kind: 'video', url: URL.createObjectURL(file) } : { kind: 'image', url: await fileToDataURL(file, 800, 450) }; save(); render(); toast('🎬', 'Media anexada ao clip'); }
  } catch (e) { toast('⚠️', 'Não foi possível ler este ficheiro. Experimenta outra imagem.'); }
}

/* ---------- Ciclo principal ---------- */
function tickCountdowns() {
  const now = Date.now();
  $$('[data-cd]').forEach(el => {
    const { d, h, m, s } = cdParts(+el.dataset.cd - now);
    const set = (k, v) => { const n = el.querySelector(`[data-p="${k}"]`); if (n && n.textContent !== v) n.textContent = v; };
    set('d', pad(d)); set('h', pad(h)); set('m', pad(m)); set('s', pad(s));
  });
  $$('[data-cdtext]').forEach(el => el.textContent = cdShort(+el.dataset.cdtext - now));
}
let tickN = 0;
function tick() {
  if (!S) return;
  const now = Date.now(); tickN++;
  tickClock();
  if (tickN % 15 === 0) tickAgo();
  maybeInboundDM(now);
  // publicações agendadas
  for (const p of S.posts) if (p.status === 'scheduled' && p.scheduledAt <= now) {
    activatePost(p); notify('🕒', 'A tua publicação agendada foi publicada.', { post: p.id }); toast('🕒', 'Publicação agendada publicada'); fakeEngagement(p); checkAch(); save();
  }
  if (tickN % 3 === 0) {
    simulateEvents(now);
    // contadores
    S.events.forEach(ev => { $$(`[data-int="${ev.id}"]`).forEach(n => n.textContent = dots(ev.interested)); $$(`[data-rem="${ev.id}"]`).forEach(n => n.textContent = dots(ev.reminderUsers || 0)); if (ev.owner !== 'me' && eventStatus(ev) === 'live') { ev.viewers = Math.round((ev.viewers || LEVELS[ev.level].max * .3) * rand(.99, 1.012)); $$(`[data-watchers="${ev.id}"]`).forEach(n => n.textContent = fmt(ev.viewers)); } });
    Object.values(SYN).forEach(ev => { ev.viewers = Math.max(10, Math.round(ev.viewers * rand(.993, 1.009))); $$(`[data-chv="${ev.id}"]`).forEach(n => n.textContent = n.closest('.tw-thumb') ? espet(ev.viewers) : fmt(ev.viewers)); });
    S.events.forEach(ev => $$(`[data-chv="${ev.id}"]`).forEach(n => n.textContent = n.closest('.tw-thumb') ? espet(ev.viewers || 0) : fmt(ev.viewers || 0)));
    // visualizações simuladas
    for (const p of S.posts) if (p.status === 'published' && now - p.createdAt < 5 * DAY && Math.random() < .25) {
      p.views += randi(1, p.author === 'me' ? Math.ceil(S.me.followers / 800) : 40);
      if (p.author === 'me' && Math.random() < .2) p.likes += 1;
      $$(`[data-views="${p.id}"]`).forEach(n => n.textContent = fmt(p.views));
    }
    // votos fictícios em sondagens
    for (const p of S.posts) if (p.poll && p.status === 'published' && now < p.poll.ends && Math.random() < .3) { const o = pick(p.poll.options); o.v += randi(1, 6); }
    save();
  }
  // atividade de outras contas
  if (now - S.lastOtherPost > rand(55000, 90000)) {
    S.lastOtherPost = now;
    const a = pick(S.accounts), g = pick(a.games), [line, type] = pick(OTHER_POST_LINES);
    const gname = GAMES[g].name;
    S.posts.push({ id: 'p_' + uid(), author: a.id, type, game: g, text: line.replace('{g}', gname.replace(/[^\p{L}\d]/gu, '').toLowerCase()).replace('{G}', gname).replace('{n}', fmt(a.followers)), createdAt: now, likes: randi(5, 80), liked: false, reposts: randi(0, 10), reposted: false, saved: false, views: randi(100, 900), replies: [], status: 'published' });
    const others = S.posts.filter(p => p.author !== 'me');
    if (others.length > 120) { const old = others.sort((x, y) => x.createdAt - y.createdAt)[0]; if (!old.saved && !old.liked && !old.reposted) S.posts = S.posts.filter(p => p !== old); }
    if (route().name === 'feed' && window.scrollY < 200 && !isTyping()) render();
    save();
  }
  tickCountdowns();
  const sig = statusSig();
  if (sig !== UI.lastSig && !isTyping() && $('#modal').hidden) render();
}
function isTyping() { const a = document.activeElement; return a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'checkbox'; }

/* ---------- Ligações de eventos ---------- */
function bind() {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (UI.menu && !e.target.closest('.menu-wrap')) { const id = UI.menu; UI.menu = null; rerenderPost(id); }
    if (UI.createOpen && !e.target.closest('.create-wrap')) { UI.createOpen = false; renderNav(); }
    if (UI.navMenu && (!e.target.closest('.tn-drop-wrap') || e.target.closest('.tn-drop a, .tn-drop button'))) { UI.navMenu = null; setTimeout(renderNav, 0); }
    if (!e.target.closest('.tw-input')) $$('.emote-pop').forEach(p => { p.hidden = true; });
    if (!b) { if (e.target === $('#modal')) closeModal(); return; }
    const fn = ACT[b.dataset.act]; if (!fn) return;
    if (b.tagName === 'A' && b.getAttribute('href')) return;
    e.preventDefault(); fn(b, e);
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-form]'); if (!f) return;
    e.preventDefault(); FORMS[f.dataset.form]?.(f);
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (onSocialInput(t)) return;
    if (onExtraInput(t)) return;
    if (onImmersiveInput(t)) return;
    if (t.dataset.cmp) {
      const k = t.dataset.cmp;
      if (k === 'poll') UI.cmp.poll[+t.dataset.i] = t.value;
      else if (k === 'schedule') { UI.cmp.schedule = t.checked; const at = $('#cmpAt'); at.hidden = !t.checked; if (t.checked && !UI.cmp.at) { const d = new Date(Date.now() + HOUR); d.setMinutes(0); UI.cmp.at = `${toLocalInput(d)}T${hhmm(d)}`; at.value = UI.cmp.at; } $('[data-act="publish"]').innerHTML = t.checked ? icon('clock') + ' Agendar' : 'Publicar'; }
      else UI.cmp[k] = t.value;
      if (k === 'text') { const c = $('#cmpCount'); c.textContent = t.value.length + '/500'; c.classList.toggle('over', t.value.length > 500); $('#cmpTags').innerHTML = tagPreview(t.value); t.style.height = 'auto'; t.style.height = Math.min(300, t.scrollHeight) + 'px'; }
    }
    if (t.dataset.setup && STUDIO.setup) {
      STUDIO.setup[t.dataset.setup] = t.value;
      if ((t.dataset.setup === 'game' || t.dataset.setup === 'level') && route().name === 'estudio' && !S.live) { render(); }
      if (t.dataset.setup === 'eventId' && t.value) { const ev = S.events.find(x => x.id === t.value); if (ev) { Object.assign(STUDIO.setup, { title: ev.title, game: ev.game, mode: ev.mode, level: ev.level }); render(); } }
    }
    if (t.dataset.studio) { STUDIO[t.dataset.studio] = t.checked; if (t.dataset.studio === 'overlay') $$('.screen-chat').forEach(x => x.classList.toggle('on', t.checked)); }
    if (t.id === 'customReact') STUDIO.custom = t.value;
    if (t.hasAttribute('data-evprev')) refreshEventPreview();
    if (t.hasAttribute('data-chipcheck')) t.closest('.chip').classList.toggle('on', t.checked);
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.file) onFile(t);
    else if (t.dataset.cmp === 'schedule' || t.dataset.studio || t.hasAttribute('data-chipcheck')) t.dispatchEvent(new Event('input', { bubbles: true }));
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
    else if (e.key === 'Escape' && STUDIO.theater) setTheater(false);
    else if (e.key === 'Escape' && UI.watchFull) ACT['w-full']();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.id === 'cmpText') publishPost();
  });
  window.addEventListener('hashchange', () => { UI.menu = null; UI.createOpen = false; const r = route(); if (r.name === 'profile' && r.id !== UI.lastProfile) { UI.profTab = 'posts'; UI.profSub = 'posts'; UI.lastProfile = r.id; } closeModalIfOpen(); render(); window.scrollTo({ top: 0 }); $('#main').focus({ preventScroll: true }); });
}

function addGta6Content(s) {
  if (s.gta6) return; s.gta6 = 1;
  const now = Date.now();
  ['a5', 'a8'].forEach(id => { const a = s.accounts.find(x => x.id === id); if (a && !a.games.includes('gta6')) a.games.unshift('gta6'); });
  const base = { countdown: true, reminders: true, cancelled: false, notified: {}, createdAt: now - HOUR, myReminder: false, myInterest: false };
  s.events.push(
    { ...base, id: 'ev_gta6_live', owner: 'a5', title: 'GTA VI — Primeira noite em Vice City', desc: 'Primeiro passeio por Vice City: carros, praia, missões e muito caos. O chat escolhe para onde vamos!', game: 'gta6', mode: 'superstar', level: 'grande', start: now - 20 * MIN, dur: 3 * HOUR, cover: { type: 'preset', v: 4 }, interested: 15800, reminderUsers: 6300, viewers: 24300 },
    { ...base, id: 'ev_gta6_heist', owner: 'a8', title: 'GTA VI — Todos os segredos do mapa', desc: 'Speedrun de exploração: vamos procurar easter eggs e carros raros em todo o mapa.', game: 'gta6', mode: 'maratona', level: 'grande', start: now + DAY + 5 * HOUR, dur: 4 * HOUR, cover: { type: 'preset', v: 0 }, interested: 9400, reminderUsers: 3700 },
  );
  const P = o => ({ id: 'p_' + uid(), likes: 0, liked: false, reposts: 0, reposted: false, saved: false, views: 0, replies: [], status: 'published', ...o });
  s.posts.push(
    P({ author: 'a5', type: 'live', game: 'gta6', eventId: 'ev_gta6_live', text: 'ESTOU EM DIRETO NO GTA VI! 🌴 Primeira noite em Vice City, venham escolher a próxima missão #gta6 #vicecity', createdAt: now - 18 * MIN, likes: 6200, reposts: 940, views: 98000 }),
    P({ author: 'a8', type: 'event', eventId: 'ev_gta6_heist', text: 'Amanhã: maratona à procura de todos os segredos do mapa do GTA VI 🔍 Ativem o lembrete! #gta6', createdAt: now - 3 * HOUR, likes: 2100, reposts: 310, views: 34000 }),
  );
  s.clips.unshift({ id: 'c_gta6', title: 'Fuga com 5 estrelas pela ponte de Vice City', game: 'gta6', streamer: 'a5', type: 'Escape por pouco', emoji: '🚓', popularity: 94, likes: 15200, comments: 1320, onProfile: true, createdAt: now - 2 * HOUR, liked: false, commentsList: [], secs: 42 });
}
function migrate(s) {
  s.stats = s.stats || { reactions: 0, clipsMade: 0, polls: 0 };
  s.ach = s.ach || {}; s.notifs = s.notifs || []; s.clips = s.clips || []; s.lives = s.lives || [];
  s.events.forEach(e => { e.notified = e.notified || {}; e.cover = e.cover || { type: 'preset', v: 0 }; });
  s.clips.forEach(c => { if (c.media && c.media.kind === 'video') delete c.media; });
  s.dms = s.dms || seedDMs(); s.mod = { ...defaultMod(), ...(s.mod || {}) }; s.mod.stats = { ...defaultMod().stats, ...s.mod.stats };
  if (s.lastDM == null) s.lastDM = Date.now();
  addGta6Content(s);
  s.prefs = { ...defaultPrefs(), ...(s.prefs || {}) };
  s.prefs.giftGoal = { ...defaultPrefs().giftGoal, ...(s.prefs.giftGoal || {}) };
  s.prefs = { ...defaultImmersive(), ...s.prefs };
  s.regulars = s.regulars || seedRegulars();
  s.giftLog = s.giftLog || {};
  s.subs = s.subs || {}; s.badges = s.badges || {}; s.chanBell = s.chanBell || {}; s.points = s.points || {}; s.emotes = s.emotes || [];
  resetToZero(s);
  if (s.prefs.goalOnScreen == null) s.prefs.goalOnScreen = false;
  if (!s.prefs.orient) s.prefs.orient = 'h';
  if (s.prefs.folCounter == null) s.prefs.folCounter = true;
  if (s.live) s.live.surprise = null;
  if (s.live) { s.live.chat = []; }
  return s;
}

function init() {
  S = migrate(load() || seedState());
  const r = route(); UI.lastProfile = r.name === 'profile' ? r.id : null;
  bind();
  if (S.live) { runLive(); pushChat({ sys: true, text: '🔁 Live retomada depois de recarregar a página.' }); }
  checkAch();
  render();
  setInterval(() => { try { tick(); } catch (e) { console.warn('tick', e); } }, 1000);
  micInit(); ttsInit();
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && STUDIO.theater && STUDIO.fs) { STUDIO.fs = false; setTheater(false); } if (!document.fullscreenElement && UI.watchFull) ACT['w-full'](); });
  save();
}
Object.assign(ACT, GIFTSND_ACT, SOCIAL_ACT, EXTRA_ACT, IMM_ACT, TW_ACT, MEDIA_ACT, TW2_ACT, TW3_ACT, FEAT_ACT, { 'chat-settings': () => S.live && route().name === 'estudio' ? ACT['mod-open']() : toast('⚙️', 'Definições do chat: modo normal (simulado)') });
Object.assign(FORMS, SOCIAL_FORMS, EXTRA_FORMS, TW_FORMS, TW2_FORMS, FEAT_FORMS, POLISH_FORMS);
init();
Object.assign(ACT, PRO_ACT, {
  'w-quality': b => { if ($('.wp-ctrl') && getComputedStyle($('.wp-ctrl')).display !== 'none') return PRO_ACT['player-q'](b); const P = playerPrefs(); openModal(`<div class="modal-head"><h2>Qualidade</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div><div class="modal-body pq-sheet">${QUALITIES.map(([k, l]) => `<button data-act="player-qset" data-q="${k}" class="${P.q === k ? 'on' : ''}">${P.q === k ? icon('check') : '<i></i>'}${l}</button>`).join('')}</div>`, 'sheet'); },
});
ACT['player-qset'] = (b, e) => { closeModalIfOpen(); PRO_ACT['player-qset'](b, e); };
proInit();
Object.assign(ACT, TW4_ACT);
tw4Init();
Object.assign(ACT, TW5_ACT);
tw5Init();
