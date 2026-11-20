/* =====================================================================
   Editar a informação da transmissão, câmara nas cenas e emotes do
   canal. Também retira os momentos que fingiam erros na live.
   ===================================================================== */
Object.assign(IC, {
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  emote: '<circle cx="12" cy="12" r="9"/><path d="M8 14.5s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01"/><path d="M17 3l4 4" />',
});

/* Sem momentos que fingem erros (live caiu, direitos de autor) */
['lag', 'music'].forEach(id => { const i = SURPRISES.findIndex(s => s.id === id); if (i >= 0) SURPRISES.splice(i, 1); });

/* ---------- 1. Editar a informação da transmissão ---------- */
function streamTagsFor(ev) { return ev && ev.tags && ev.tags.length ? ev.tags : streamTags(ev.game); }
function openStreamInfo() {
  const L = S.live; if (!L) return;
  MODAL.kind = 'stream-info';
  const tags = streamTagsFor(L).join(', ');
  openModal(`<div class="modal-head"><h2>Editar informação da transmissão</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
  <form data-form="stream-info" id="siForm">
    <div class="modal-body">
      <label class="field"><span>Título</span><input class="input" name="title" id="siTitle" maxlength="90" required value="${esc(L.title)}"></label>
      <label class="field"><span>Categoria</span><select class="input" name="game" id="siGame">${Object.entries(GAMES).map(([k, g]) => `<option value="${k}" ${L.game === k ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Etiquetas (separadas por vírgulas)</span><input class="input" name="tags" id="siTags" maxlength="120" value="${esc(tags)}" placeholder="Português, Competitivo, Chill"></label>
      <p class="tiny muted" style="margin:0">As mudanças aparecem logo no teu canal, no cartão da página inicial e no chat.</p>
    </div>
    <div class="modal-foot"><button type="button" class="btn btn-ghost" data-act="modal-close">Cancelar</button><button class="btn btn-primary">Guardar</button></div>
  </form>`);
}
function saveStreamInfo(f) {
  const L = S.live; if (!L) return closeModal();
  const title = f.title.value.trim() || L.title, game = f.game.value;
  const tags = f.tags.value.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean).slice(0, 6);
  const gameChanged = game !== L.game, titleChanged = title !== L.title;
  L.title = title; L.tags = tags.length ? tags : null;
  if (gameChanged) L.game = game;
  closeModal(); render();
  const G = GAMES[L.game] || GAMES.chat;
  if (gameChanged) { addTimeline('scene', `Categoria mudada para ${G.name}`, '🎮'); activityPush(L, 'milestone', `Categoria: ${G.name}`); chatBurst([`mudou para ${G.name}!!`, 'BORA', `${G.name} 🔥`, 'finalmente!']); }
  if (titleChanged) { activityPush(L, 'milestone', `Título: ${title}`); }
  save();
}

/* ---------- 6. Emotes do canal ---------- */
UI.emoteDraft = null;
const emoteRe = () => {
  const codes = (S.emotes || []).map(e => e.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return codes.length ? new RegExp(`(^|\\s)(${codes.join('|')})(?=\\s|$)`, 'g') : null;
};
function emotify(escaped) {
  const re = emoteRe(); if (!re) return escaped;
  const map = Object.fromEntries((S.emotes || []).map(e => [e.code, e.img]));
  return escaped.replace(re, (m, sp, code) => `${sp}<img class="emote" src="${map[code]}" alt="${code}" title="${code}">`);
}
function stripCodes(s) { const re = emoteRe(); return re ? String(s).replace(re, ' ') : s; }
function withEmotes(text) {
  const em = S.emotes || []; if (!em.length || Math.random() > .2) return text;
  const k = Math.random() < .3 ? 3 : 1;
  const codes = Array.from({ length: k }, () => pick(em).code).join(' ');
  return Math.random() < .25 ? codes : `${text} ${codes}`;
}
function emotesModalHTML() {
  const list = S.emotes || [];
  const prefix = (S.me.handle || 'canal').replace(/[^a-z0-9]/gi, '').slice(0, 5).toLowerCase();
  return `<div class="modal-head"><h2>Emotes do canal</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('close')}</button></div>
  <div class="modal-body">
    <p class="small muted" style="margin:0">Carrega imagens tuas (de preferência quadradas e com fundo transparente). Os espetadores fictícios usam-nas no chat e tu podes escolhê-las no botão de emotes.</p>
    <div class="em-grid">${list.length ? list.map((e, i) => `<div class="em-item"><img src="${e.img}" alt="${esc(e.code)}"><code>${esc(e.code)}</code><button class="icon-btn" data-act="emote-del" data-i="${i}" aria-label="Apagar ${esc(e.code)}">${icon('trash')}</button></div>`).join('') : '<p class="muted small">Ainda não tens emotes.</p>'}</div>
    <form class="em-add" data-form="emote-add">
      <label class="em-pick upload">${UI.emoteDraft ? `<img src="${UI.emoteDraft}" alt="Pré-visualização">` : icon('image')}<span>${UI.emoteDraft ? 'Trocar imagem' : 'Escolher imagem'}</span><input type="file" accept="image/*" data-file="emote-img" id="emoteFile"></label>
      <label class="field" style="flex:1"><span>Código</span><input class="input" name="code" id="emoteCode" maxlength="20" placeholder="${prefix}GG" pattern="[A-Za-z0-9_]{3,20}" required></label>
      <button class="btn btn-primary" ${UI.emoteDraft ? '' : 'disabled'}>Adicionar</button>
    </form>
    <p class="tiny muted" style="margin:0">Até 20 emotes · código com 3 a 20 letras ou números (ex.: ${prefix}Hype).</p>
  </div>`;
}
function openEmotes() { MODAL.kind = 'emotes'; openModal(emotesModalHTML()); }
function squareEmote(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { const s = 112, c = document.createElement('canvas'); c.width = c.height = s; const ctx = c.getContext('2d'); const m = Math.min(img.width, img.height); ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s); URL.revokeObjectURL(url); res(c.toDataURL('image/png')); };
    img.onerror = e => { URL.revokeObjectURL(url); rej(e); };
    img.src = url;
  });
}

const FEAT_ACT = {
  'stream-info': () => openStreamInfo(),
  'emotes-open': () => { UI.navMenu = null; openEmotes(); },
  'emote-del': b => { S.emotes.splice(+b.dataset.i, 1); save(); openEmotes(); },
};
const FEAT_FORMS = {
  'stream-info': f => saveStreamInfo(f),
  'emote-add': f => {
    const code = f.code.value.trim();
    if (!UI.emoteDraft) return toast('⚠️', 'Escolhe uma imagem para o emote.');
    if (!/^[A-Za-z0-9_]{3,20}$/.test(code)) return toast('⚠️', 'O código só pode ter letras, números e «_» (3 a 20).');
    S.emotes = S.emotes || [];
    if (S.emotes.some(e => e.code.toLowerCase() === code.toLowerCase())) return toast('⚠️', 'Já tens um emote com esse código.');
    if (S.emotes.length >= 20) return toast('⚠️', 'Chegaste ao limite de 20 emotes.');
    S.emotes.push({ code, img: UI.emoteDraft }); UI.emoteDraft = null; save(); openEmotes();
  },
};
