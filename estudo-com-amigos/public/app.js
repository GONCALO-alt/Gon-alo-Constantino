import { AVATARS, FRAMES, ACHIEVEMENTS, EMPTY_COUNTERS, MEDALS, EARN, isUnlocked } from './cosmetics.js';
import { t, setLang, getLang, guessLang, translateDom, LANGS, locale } from './i18n.js';
import { SUBJECTS, YEARS, GOALS, MINUTES, WHEN, suggestedSubjects, buildPlan, planTips, daysUntil } from './plan.js';
import * as Sound from './sounds.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const socket = io({ autoConnect: true });

// ---------- dados guardados neste browser ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
  clear() { try { localStorage.clear(); } catch { /* sem storage */ } },
};
const profile = store.get('profile', {});
profile.name ??= '';
profile.avatar ??= '🙂';
profile.frame ??= 'none';
profile.minutes ??= 0;
profile.scales ??= 50; // bónus de boas-vindas
profile.medals ??= ['peixinho'];
profile.medal ??= '🐟';
profile.counters = { ...EMPTY_COUNTERS, ...(profile.counters ?? {}) };
profile.achieved ??= [];
let recent = store.get('recentRooms', []);
const saveProfile = () => store.set('profile', profile);

setLang(store.get('lang', null) ?? guessLang());

let room = null;
let me = null;
let ai = { enabled: false, quota: null };
let view = 'inicio';
let tick = null;
let duelTick = null;
let duel = null;
let unread = 0;
let chatLog = [];

// ---------- utilidades ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const avatarHtml = (a, f, size = '') => `<span class="avatar frame-${esc(f)}${size ? ` ${size}` : ''}">${esc(a)}</span>`;
function toast(text, ms = 3000) {
  const el = $('#toast');
  el.textContent = text;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), ms);
}
const fmt = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const LEAGUE_MEDALS = ['🥉', '🥈', '🥇', '💠', '💎'];
const whenText = d => d === 0 ? t('when.today') : d === 1 ? t('when.tomorrow') : t('when.days', { n: d });
const emitP = (ev, data) => new Promise(r => socket.emit(ev, data, r));
const errText = res => t(`err.${res.error}`, res.p);
const plain = label => label.replace(/^\S+\s/, ''); // tira o emoji do início
const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
const money = v => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR' }).format(v);
const medalName = m => t(`medal.${m.id}`);
const subjName = id => (SUBJECTS.includes(id) ? t(`subj.${id}`) : id);

// ---------- navegação ----------
const VIEWS = ['inicio', 'plano', 'estudar', 'chat', 'salachat', 'duelos', 'apontamentos', 'calendario', 'liga', 'loja', 'medalhas', 'perfil', 'premium', 'definicoes'];

function show(name) {
  if (!VIEWS.includes(name)) name = 'inicio';
  view = name;
  const target = $(`#view-${name}`);
  const blocked = target.hasAttribute('data-needs-room') && !room;
  $$('.view').forEach(v => v.classList.toggle('hidden', v !== target || blocked));
  $('#noRoom').classList.toggle('hidden', !blocked);
  $$('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  $('#viewTitle').textContent = t(`view.${name}`);
  closeNav();
  if (name === 'salachat') { unread = 0; renderUnread(); const l = $('#messages'); l.scrollTop = l.scrollHeight; }
  if (name === 'chat') renderTutor(true);
  if (name === 'inicio') renderHome();
  if (name === 'plano') renderPlan();
  if (name === 'loja') renderShop();
  if (name === 'medalhas') renderMedals();
  if (name === 'perfil') renderProfile();
  if (name === 'premium') renderPremium();
  if (name === 'definicoes') renderSettings();
  if (name === 'liga' && room) renderLeague();
  window.scrollTo({ top: 0 });
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-view], [data-go]');
  if (b) show(b.dataset.view ?? b.dataset.go);
});

const openNav = () => { $('#nav').classList.add('open'); $('#navShade').classList.remove('hidden'); };
function closeNav() { $('#nav').classList.remove('open'); $('#navShade').classList.add('hidden'); }
$('#navOpen').onclick = openNav;
$('#moreBtn').onclick = openNav;
$('#navClose').onclick = closeNav;
$('#navShade').onclick = closeNav;

function renderLocks() {
  $$('#nav [data-view]').forEach(b => {
    const v = $(`#view-${b.dataset.view}`);
    b.classList.toggle('locked', !!v?.hasAttribute('data-needs-room') && !room);
  });
}
function renderUnread() {
  $('#chatDot').classList.toggle('hidden', unread === 0);
  $('#chatDot2').classList.toggle('hidden', unread === 0);
}

// ---------- língua ----------
function changeLang(lang) {
  setLang(lang);
  store.set('lang', lang);
  translateDom();
  renderWallet();
  if (room) {
    renderMembers(room.members);
    renderTimer();
    renderProgress();
    renderTests();
    renderNotes();
    renderSummary();
    renderQuestions();
    renderAiQuota();
    renderChat();
  }
  show(view);
}

// ---------- escamas e conquistas ----------
function earn(n, why) {
  if (n <= 0) return;
  profile.scales += n;
  saveProfile();
  renderWallet();
  if (why) toast(`+${n} 🐟 ${why}`);
}

function renderWallet() {
  for (const id of ['#navScales', '#topScales', '#shopScales']) $(id).textContent = profile.scales;
  $('#navAvatar').outerHTML = `<span id="navAvatar" class="avatar frame-${esc(profile.frame)}">${esc(profile.avatar)}</span>`;
  $('#navName').textContent = profile.name || t('nav.noName');
}

function bump(changes) {
  const c = profile.counters;
  for (const [k, v] of Object.entries(changes)) {
    if (k.startsWith('max:')) { const key = k.slice(4); c[key] = Math.max(c[key] ?? 0, v); }
    else c[k] = (c[k] ?? 0) + v;
  }
  const fresh = ACHIEVEMENTS.filter(a => !profile.achieved.includes(a.id) && a.test(c));
  for (const a of fresh) profile.achieved.push(a.id);
  if (fresh.length) profile.scales += EARN.achievement * fresh.length;
  saveProfile();
  if (fresh.length) {
    renderWallet();
    toast(t('toast.ach', { list: fresh.map(a => `${a.icon} ${t(`ach.${a.id}`)}`).join(', '), n: EARN.achievement * fresh.length }), 5000);
  }
}

// ---------- INÍCIO ----------
$('#name').value = profile.name;
$('#name').addEventListener('change', e => { profile.name = e.target.value.trim(); saveProfile(); renderWallet(); });

function renderHome() {
  $('#hello').textContent = t('home.hello', { name: profile.name ? `, ${profile.name}` : '' });
  $('#joinBox').classList.toggle('hidden', !!room);
  $('#roomHome').classList.toggle('hidden', !room);
  $('#recent').innerHTML = recent.length
    ? `<ul>${recent.map(r => `<li><button data-code="${esc(r.code)}"><span>${esc(r.name)}</span><code>${esc(r.code)}</code></button></li>`).join('')}</ul>`
    : `<p class="muted small">${t('home.noRecent')}</p>`;
  if (room) {
    $('#roomHomeName').textContent = room.name;
    const s = room.streak;
    $('#roomHomeStats').innerHTML = `
      <div><b>${room.members.length}</b><span>${t('stat.inRoom')}</span></div>
      <div><b>${s.today.minutes}/${s.today.goal}</b><span>${t('stat.minToday')}</span></div>
      <div><b>🔥 ${s.streak}</b><span>${t('stat.daysInRow')}</span></div>`;
  }
  renderPlanToday();
  const c = profile.counters;
  $('#myStats').innerHTML = [
    ['🐟', profile.scales, 'stat.scales'], ['⏱️', profile.minutes, 'stat.focusMin'], ['🎯', c.sessions, 'stat.sessions'],
    ['⚔️', c.duelWins, 'stat.duelsWon'], ['🏅', `${profile.achieved.length}/${ACHIEVEMENTS.length}`, 'stat.achievements'],
  ].map(([i, v, l]) => `<div class="stat"><b>${i} ${v}</b><span>${t(l)}</span></div>`).join('');
}

$('#recent').addEventListener('click', e => {
  const b = e.target.closest('button[data-code]');
  if (b) { $('#code').value = b.dataset.code; enter('join'); }
});
$('#create').onclick = () => enter('create');
$('#join').onclick = () => enter('join');
$('#code').addEventListener('keydown', e => { if (e.key === 'Enter') enter('join'); });
$('#code').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });

function enter(kind) {
  const name = $('#name').value.trim();
  if (!name) { $('#homeError').textContent = t('home.nameFirst'); $('#name').focus(); return; }
  profile.name = name; saveProfile(); renderWallet();
  const payload = { profile: { name, avatar: profile.avatar, frame: profile.frame, medal: profile.medal }, name: $('#roomName').value, code: $('#code').value };
  socket.emit(kind === 'create' ? 'createRoom' : 'joinRoom', payload, res => {
    if (res.error) return ($('#homeError').textContent = errText(res));
    $('#homeError').textContent = '';
    openRoom(res);
  });
}

// ---------- sala ----------
function openRoom({ room: r, me: m, ai: a }) {
  room = r; me = m; ai = a;
  recent = [{ code: r.code, name: r.name }, ...recent.filter(x => x.code !== r.code)].slice(0, 6);
  store.set('recentRooms', recent);
  try { history.replaceState(null, '', `#${r.code}`); } catch { /* sem history */ }
  $('#roomChips').classList.remove('hidden');
  $('#roomTitle').textContent = r.name;
  $('#copyCode').textContent = r.code;
  chatLog = [...r.messages];
  renderChat();
  renderMembers(r.members);
  renderNotes();
  renderSummary();
  renderQuestions();
  renderTests();
  renderProgress();
  renderTimer();
  renderAiQuota();
  renderLocks();
  setAmbience(r.ambience, false);
  $('#duelArea').classList.add('hidden');
  $('#quizSetup').classList.remove('hidden');
  if (r.duelActive) showDuelMessage(t('duel.running'));
  show('estudar');
}

const leave = () => { try { history.replaceState(null, '', location.pathname); } catch { /* */ } location.reload(); };
$('#leave').onclick = () => room ? leave() : toast(t('toast.noRoom'));
$('#leave2').onclick = leave;
$('#copyCode').onclick = async () => {
  try { await navigator.clipboard.writeText(room.code); toast(t('toast.codeCopied')); }
  catch { toast(t('toast.code', { code: room.code })); }
};

function renderMembers(list) {
  room.members = list;
  $('#members').innerHTML = list.map(m => {
    const tag = m.distracted ? `<span class="tag away">${t('tag.distracted')}</span>`
      : m.status === 'away' ? `<span class="tag away">${t('tag.away')}</span>`
      : room.timer.state === 'focus' ? `<span class="tag">${t('tag.studying')}</span>` : '';
    return `<li>${avatarHtml(m.avatar, m.frame)}<span>${esc(m.name)} ${m.medal ? `<span class="medal-tag" title="${t('tag.medal')}">${esc(m.medal)}</span>` : ''}${m.name === me.name ? ` <span class="muted small">${t('tag.you')}</span>` : ''}</span>${tag}</li>`;
  }).join('');
  if (view === 'inicio') renderHome();
}
socket.on('members', list => room && renderMembers(list));

document.addEventListener('visibilitychange', () => {
  if (room) socket.emit('status', document.hidden ? 'away' : 'focused');
});

// ---------- chat ----------
function messageEl(m) {
  const li = document.createElement('li');
  if (m.system) {
    li.className = 'system';
    li.textContent = typeof m.system === 'object' ? t(`sys.${m.system.k}`, m.system.p) : m.text;
    return li;
  }
  const mine = me && m.author === me.name;
  const member = room.members.find(x => x.name === m.author);
  li.className = mine ? 'mine' : '';
  li.innerHTML = `${avatarHtml(member?.avatar ?? '🙂', member?.frame ?? 'none')}
    <div class="bubble"><div class="who">${esc(m.author)} ${member?.medal ? esc(member.medal) : ''}</div>${esc(m.text)}</div>
    ${mine ? '' : `<button class="report" title="${t('chat.report')}" data-id="${esc(m.id)}">⚑</button>`}`;
  return li;
}
function renderChat() {
  const list = $('#messages');
  list.innerHTML = '';
  chatLog.slice(-150).forEach(m => list.appendChild(messageEl(m)));
  list.scrollTop = list.scrollHeight;
}
function addMessage(m) {
  chatLog.push(m);
  const list = $('#messages');
  const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
  list.appendChild(messageEl(m));
  if (!m.system && m.author !== me?.name && view !== 'salachat') { unread++; renderUnread(); }
  if (atBottom || m.author === me?.name) list.scrollTop = list.scrollHeight;
}
socket.on('chat', m => room && addMessage(m));
socket.on('system', s => room && addMessage({ system: s }));
$('#chatForm').onsubmit = e => {
  e.preventDefault();
  const v = $('#chatInput').value.trim();
  if (v) socket.emit('chat', v);
  $('#chatInput').value = '';
};
$('#messages').addEventListener('click', e => {
  const b = e.target.closest('.report');
  if (!b) return;
  socket.emit('report', { messageId: b.dataset.id });
  b.disabled = true;
  toast(t('toast.reported'));
});

$('.reactions').addEventListener('click', e => {
  const b = e.target.closest('[data-react]');
  if (!b) return;
  socket.emit('react', b.dataset.react);
  b.disabled = true;
  setTimeout(() => (b.disabled = false), 1500);
});
socket.on('react', ({ name, emoji }) => {
  if (!room) return;
  const el = document.createElement('div');
  el.className = 'react-float';
  el.style.left = `${10 + Math.random() * 80}%`;
  el.innerHTML = `${esc(emoji)}<small>${esc(name)}</small>`;
  $('#reactLayer').appendChild(el);
  setTimeout(() => el.remove(), 2500);
});

// ---------- temporizador ----------
function renderTimer() {
  if (!room) return;
  const tm = room.timer;
  $('#timerBox').className = `timer ${tm.state}`;
  $('#timerStart').classList.toggle('hidden', tm.state !== 'idle');
  $('#focusMin').classList.toggle('hidden', tm.state !== 'idle');
  $('#timerStop').classList.toggle('hidden', tm.state === 'idle');
  $('#timerLabel').textContent = tm.state === 'focus' ? t('timer.focus') : tm.state === 'break' ? t('timer.break') : t('timer.ready');
  clearInterval(tick);
  const draw = () => {
    $('#timerClock').textContent = tm.state === 'idle' ? fmt(Number($('#focusMin').value) * 60_000) : fmt(tm.endsAt - Date.now());
  };
  draw();
  if (tm.state !== 'idle') tick = setInterval(draw, 500);
}
$('#focusMin').onchange = () => renderTimer();
$('#timerStart').onclick = () => socket.emit('timerStart', Number($('#focusMin').value));
$('#timerStop').onclick = () => socket.emit('timerStop');
socket.on('timer', tm => { if (!room) return; room.timer = tm; renderTimer(); });

function setFocusMinutes(n) {
  const sel = $('#focusMin');
  if (![...sel.options].some(o => Number(o.value) === n)) sel.insertAdjacentHTML('beforeend', `<option value="${n}">${n} min</option>`);
  sel.value = String(n);
  renderTimer();
}

socket.on('focusDone', ({ minutes, rewarded, streak }) => {
  if (!room) return;
  Sound.chime();
  if (rewarded.includes(me.name)) {
    const before = profile.minutes;
    profile.minutes += minutes;
    const hour = new Date().getHours();
    bump({ sessions: 1, minutes, night: hour >= 22 || hour < 4 ? 1 : 0, morning: hour >= 4 && hour < 8 ? 1 : 0, 'max:bestStreak': streak });
    earn(minutes * EARN.perFocusMinute);
    const unlocked = [...AVATARS, ...FRAMES].filter(i => i.need > before && i.need <= profile.minutes);
    toast(t('toast.focusDone', { n: minutes, s: minutes * EARN.perFocusMinute }) + (unlocked.length ? t('toast.newAvatars') : ''), 5000);
  } else {
    toast(t('toast.distracted'), 5000);
  }
});
socket.on('breakDone', () => room && toast(t('toast.breakDone')));

// ---------- sons ----------
const savedVol = store.get('volume', 0.5);
$('#volume').value = savedVol;
Sound.setVolume(savedVol);
$('#volume').oninput = e => { Sound.setVolume(Number(e.target.value)); store.set('volume', Number(e.target.value)); };
$('#mute').checked = store.get('muted', false);
$('#mute').onchange = e => {
  store.set('muted', e.target.checked);
  if (e.target.checked) Sound.stop(); else if (room) setAmbience(room.ambience, false);
};
$('#ambience').onchange = e => socket.emit('ambience', e.target.value);
$('#soundUnlock').onclick = () => setAmbience(room.ambience, false);

function setAmbience(a, announce) {
  room.ambience = a;
  $('#ambience').value = a;
  if (a === 'none') { Sound.stop(); $('#soundUnlock').classList.add('hidden'); return; }
  if (!Sound.canPlay() || store.get('muted', false)) return;
  Sound.play(a);
  setTimeout(() => $('#soundUnlock').classList.toggle('hidden', Sound.isUnlocked()), 300);
  if (announce) toast(t('toast.ambience', { name: t(`amb.${a}`) }));
}
socket.on('ambience', ({ ambience, by }) => {
  if (!room) return;
  setAmbience(ambience, true);
  addMessage({ system: { k: 'ambience', p: { name: by } } });
});

// ---------- chama, liga e ranking ----------
function renderProgress() {
  const s = room.streak;
  const pct = Math.min(100, Math.round((s.today.minutes / s.today.goal) * 100));
  const n = Math.max(1, s.today.people);
  $('#streakBox').innerHTML = `
    <div class="flame ${s.today.lit || s.streak ? '' : 'off'}"><span class="big">🔥</span>
      <div><b>${t(s.streak === 1 ? 'flame.days1' : 'flame.days', { n: s.streak })}</b><br>
      <span class="muted small">${s.today.lit ? t('flame.lit') : t('flame.notYet')}</span></div></div>
    <div class="progress"><div style="width:${pct}%"></div></div>
    <p class="muted small">${t('flame.today', { m: s.today.minutes, g: s.today.goal, n })}</p>`;
  $('#streakBadge').textContent = `🔥 ${s.streak}`;
  $('#leagueBadge').textContent = `${LEAGUE_MEDALS[room.league.tier]} ${t('league.name', { name: t(`tier.${room.league.tier}`) })}`;
  bump({ 'max:bestStreak': s.streak, 'max:bestTier': room.league.tier });
  renderRanking();
  renderLeague();
  if (view === 'inicio') renderHome();
}
socket.on('progress', p => {
  if (!room) return;
  Object.assign(room, { streak: p.streak, league: p.league, stats: p.stats });
  renderProgress();
});

function renderLeague() {
  const L = room.league;
  const last = L.last ? `<br><span class="muted small">${t('league.last', { place: L.last.place, n: L.last.minutes })}</span>` : '';
  $('#leagueHead').innerHTML = `<span class="medal">${LEAGUE_MEDALS[L.tier]}</span>
    <div><b>${t('league.name', { name: t(`tier.${L.tier}`) })}</b><br><span class="muted small">${t('league.help')}</span>${last}</div>`;
  $('#leagueBody').innerHTML = L.table.map((r, i) =>
    `<tr class="${r.me ? 'me' : ''}"><td>${i + 1}</td><td>${esc(r.name)}${r.me ? ` ${t('league.you')}` : ''}</td><td>${r.minutes}</td></tr>`).join('');
}

function renderRanking() {
  const rows = Object.entries(room.stats).sort((a, b) => b[1].minutes - a[1].minutes || b[1].duelWins - a[1].duelWins);
  $('#rankingBody').innerHTML = rows.map(([name, s], i) =>
    `<tr class="${name === me.name ? 'me' : ''}"><td>${i + 1}</td><td>${esc(name)}</td><td>${s.minutes}</td><td>${s.sessions}</td><td>${s.duelWins}</td></tr>`).join('')
    || `<tr><td colspan="5" class="muted">${t('ranking.empty')}</td></tr>`;
}

// ---------- calendário ----------
function renderTests() {
  const tests = room.tests;
  $('#tests').innerHTML = tests.map(x => `
    <li><span>📘 ${esc(x.subject)}</span><span class="when ${x.daysLeft <= 3 ? 'soon' : ''}">${whenText(x.daysLeft)}</span>
    <button class="del" data-test="${esc(x.id)}" title="${t('btn.delete')}">✕</button></li>`).join('')
    || `<li class="muted small">${t('cal.none')}</li>`;
  const soon = tests.find(x => x.daysLeft <= 3);
  $('#testBanner').classList.toggle('hidden', !soon);
  if (soon) $('#testBanner').textContent = t('banner.test', { subject: soon.subject, when: whenText(soon.daysLeft) });
  renderGradeTests();
}
$('#testDate').min = new Date().toISOString().slice(0, 10);
$('#testForm').onsubmit = async e => {
  e.preventDefault();
  const res = await emitP('addTest', { subject: $('#testSubject').value, date: $('#testDate').value });
  $('#testError').textContent = res?.error ? errText(res) : '';
  if (!res?.error) { $('#testSubject').value = ''; $('#testDate').value = ''; bump({ tests: 1 }); toast(t('toast.testAdded')); }
};
$('#tests').addEventListener('click', e => {
  const b = e.target.closest('[data-test]');
  if (b && confirm(t('confirm.test'))) socket.emit('removeTest', b.dataset.test);
});
socket.on('tests', tests => { if (!room) return; room.tests = tests; renderTests(); });

// ---------- apontamentos ----------
function renderNotes() {
  $('#notes').innerHTML = [...room.notes].reverse().map(n => `
    <li><div class="row between"><h4>${esc(n.title)}</h4>
      ${n.author === me.name || room.owner === me.name ? `<button class="del" data-note="${esc(n.id)}" title="${t('btn.delete')}">✕</button>` : ''}</div>
      <p>${esc(n.text)}</p><span class="muted small">${esc(t('notes.by', { name: n.author }))}</span></li>`).join('')
    || `<li class="muted">${t('notes.empty')}</li>`;
}
$('#noteForm').onsubmit = e => {
  e.preventDefault();
  socket.emit('addNote', { title: $('#noteTitle').value, text: $('#noteText').value }, res => {
    if (res?.error) return toast(errText(res));
    $('#noteTitle').value = ''; $('#noteText').value = '';
    bump({ notes: 1 });
    earn(EARN.note, t('toast.earnNote'));
  });
};
$('#notes').addEventListener('click', e => {
  const b = e.target.closest('[data-note]');
  if (b && confirm(t('confirm.note'))) socket.emit('removeNote', b.dataset.note);
});
socket.on('note', n => { if (!room) return; room.notes.push(n); renderNotes(); });
socket.on('noteRemoved', id => { if (!room) return; room.notes = room.notes.filter(n => n.id !== id); renderNotes(); });

function renderSummary() {
  const s = room.summary;
  $('#summary').innerHTML = !s ? '' : `<div class="summary">
    <h3>${esc(s.title)}</h3>
    ${s.sections.map(sec => `<h4>${esc(sec.heading)}</h4><ul>${sec.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`).join('')}
    <div class="must"><b>${t('summary.must')}</b><ul>${s.mustKnow.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
    <p class="muted small">${esc(t('summary.by', { name: s.by, n: s.notes }))}</p></div>`;
}
$('#aiSummary').onclick = () => withAI($('#aiSummary'), t('ai.reading'), () => emitP('aiSummary', { lang: getLang() }), () => toast(t('toast.summary')));
socket.on('summary', s => { if (!room) return; room.summary = s; renderSummary(); });

// ---------- IA ----------
function renderAiQuota() {
  const q = ai.quota;
  $('#aiQuota').textContent = !ai.enabled ? t('ai.off') : q?.limit == null ? t('ai.unlimited') : t('ai.quota', { left: q.left, limit: q.limit });
}
socket.on('aiQuota', q => { if (!room) return; ai.quota = q; renderAiQuota(); });

async function withAI(button, waiting, call, onOk) {
  if (!ai.enabled) return toast(t('err.ai_off'));
  button.disabled = true;
  const old = button.textContent;
  button.textContent = '⏳ …';
  toast(waiting, 60000);
  try {
    const res = await call();
    if (res?.error) {
      toast(errText(res), 5000);
      if (res.quota) $('#aiStatus').innerHTML = `${esc(errText(res))} <button class="ghost small-btn" data-view="premium">⭐ ${t('prem.upsell')}</button>`;
      return res;
    }
    $('#toast').classList.add('hidden');
    onOk?.(res);
    return res;
  } finally {
    button.disabled = false;
    button.textContent = old;
  }
}

$('#aiTextToggle').onclick = () => $('#aiTextBox').classList.toggle('hidden');
$('#aiFromText').onclick = () => makeQuestions({ text: $('#aiText').value }, $('#aiFromText'));
$('#aiPhoto').onchange = async e => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  try { makeQuestions({ image: await shrinkImage(file) }, $('#aiTextToggle')); }
  catch { toast(t('ai.badImage')); }
};

async function makeQuestions(payload, button) {
  $('#aiStatus').textContent = t('ai.working');
  const res = await withAI(button, t('ai.making'), () => emitP('aiQuestions', { ...payload, lang: getLang() }), r => {
    $('#aiStatus').textContent = t('ai.done', { n: r.count, subject: r.subject });
    $('#aiText').value = '';
    bump({ aiQuestions: 1 });
  });
  if (res?.error && !res.quota) $('#aiStatus').textContent = `⚠️ ${errText(res)}`;
}

function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1568 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve({ mediaType: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.85).split(',')[1] });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// ---------- perguntas ----------
const DIFF = ['', '●○○', '●●○', '●●●'];
function renderQuestions() {
  $('#qCount').textContent = room.questions.length;
  $('#questions').innerHTML = [...room.questions].reverse().map(q => `
    <li><span>${esc(q.question)} <span class="diff" title="${t('diff.title')}">${DIFF[q.difficulty ?? 2]}</span>
      ${q.ai ? '<span class="tag-ai">IA</span>' : ''}
      <span class="muted small">· ${esc(q.topic ? `${q.topic} · ` : '')}${esc(q.author)}</span></span>
    ${q.author === me.name || room.owner === me.name ? `<button class="del" data-q="${esc(q.id)}" title="${t('btn.delete')}">✕</button>` : ''}</li>`).join('');
}
$('#qForm').onsubmit = e => {
  e.preventDefault();
  const opts = $$('#qForm .opt').map(i => i.value.trim());
  const right = Number(document.querySelector('#qForm input[name=right]:checked').value);
  if (!opts[right]) return ($('#quizError').textContent = t('q.rightEmpty'));
  const kept = opts.map((text, i) => ({ text, i })).filter(o => o.text);
  const q = {
    question: $('#qText').value, options: kept.map(o => o.text), answer: kept.findIndex(o => o.i === right),
    topic: $('#qTopic').value, difficulty: Number($('#qDiff').value),
  };
  socket.emit('addQuestion', q, res => {
    if (res?.error) return ($('#quizError').textContent = errText(res));
    $('#quizError').textContent = '';
    const topic = $('#qTopic').value;
    $('#qForm').reset();
    $('#qTopic').value = topic;
    $('#qText').focus();
    bump({ questions: 1 });
    earn(EARN.question, t('toast.earnQuestion'));
  });
};
$('#questions').addEventListener('click', e => {
  const b = e.target.closest('[data-q]');
  if (b && confirm(t('confirm.question'))) socket.emit('removeQuestion', b.dataset.q);
});
socket.on('question', q => { if (!room) return; room.questions.push(q); renderQuestions(); });
socket.on('questionRemoved', id => { if (!room) return; room.questions = room.questions.filter(q => q.id !== id); renderQuestions(); });

// ---------- duelos ----------
$('#duelStart').onclick = () => socket.emit('duelStart', { mode: $('#duelMode').value }, res => {
  $('#quizError').textContent = res?.error ? errText(res) : '';
});
function showDuel(html) {
  $('#quizSetup').classList.add('hidden');
  $('#duelArea').classList.remove('hidden');
  $('#duelArea').innerHTML = html;
}
function showDuelMessage(text) { showDuel(`<p class="q">${esc(text)}</p>`); }

socket.on('duelStarting', ({ by, mode, total, players }) => {
  if (!room) return;
  show('duelos');
  duel = { mode, players, lifelines: { fifty: true, ask: true }, alive: players };
  const title = mode === 'eliminacao' ? t('duel.elimTitle') : t('duel.classicTitle', { n: total });
  showDuel(`<p class="muted">${esc(t('duel.started', { name: by }))}</p><p class="q">${title}</p>
    ${mode === 'eliminacao' ? `<p class="muted small">${t('duel.elimHelp')}</p>` : ''}`);
});

socket.on('duelQuestion', q => {
  if (!room) return;
  if (view !== 'duelos') show('duelos');
  duel ??= { mode: q.mode, players: q.alive, lifelines: { fifty: false, ask: false }, alive: q.alive };
  duel.q = q; duel.pick = null; duel.alive = q.alive;
  const elim = q.mode === 'eliminacao';
  const canPlay = elim ? q.alive.includes(me.name) : true;
  showDuel(`
    <p class="muted">${t('duel.qOf', { i: q.index + 1, n: q.total })} <span class="diff">${DIFF[q.difficulty ?? 2]}</span></p>
    <div class="bar"><div id="duelBar" style="width:100%"></div></div>
    <p class="q">${esc(q.question)}</p>
    <div class="answers">${q.options.map((o, i) => `<button data-a="${i}" ${canPlay ? '' : 'disabled'}>${esc(o)}<span class="vote"></span></button>`).join('')}</div>
    ${elim && canPlay ? `<div class="lifelines">
      <button id="lfFifty" ${duel.lifelines.fifty && q.options.length > 2 ? '' : 'disabled'}>${t('btn.fifty')}</button>
      <button id="lfAsk" ${duel.lifelines.ask ? '' : 'disabled'}>${t('btn.ask')}</button></div>` : ''}
    ${elim ? `<div class="alive">${duel.players.map(p => `<span class="${q.alive.includes(p) ? '' : 'out'}">${esc(p)}</span>`).join('')}</div>` : ''}
    <p id="duelFeedback" class="muted">${canPlay ? '' : t('duel.spectator')}</p>
    <div id="duelExplain"></div>`);
  const total = q.endsAt - Date.now();
  clearInterval(duelTick);
  duelTick = setInterval(() => {
    const bar = $('#duelBar');
    if (!bar) return clearInterval(duelTick);
    bar.style.width = `${Math.max(0, (q.endsAt - Date.now()) / total) * 100}%`;
  }, 200);
});

$('#duelArea').addEventListener('click', async e => {
  if (e.target.closest('#lfFifty')) {
    e.target.disabled = true;
    const res = await emitP('duelFifty');
    if (res?.error) return toast(errText(res));
    duel.lifelines.fifty = false;
    for (const i of res.hide) $(`#duelArea [data-a="${i}"]`)?.classList.add('hidden-opt');
    return;
  }
  if (e.target.closest('#lfAsk')) {
    e.target.disabled = true;
    const res = await emitP('duelAsk');
    if (res?.error) return toast(errText(res));
    duel.lifelines.ask = false;
    $$('#duelArea [data-a]').forEach((b, i) => {
      const pct = res.total ? Math.round((res.votes[i] / res.total) * 100) : 0;
      b.querySelector('.vote').textContent = res.total ? t('duel.pct', { n: pct }) : '';
    });
    if (!res.total) toast(t('duel.nobody'));
    return;
  }
  const b = e.target.closest('[data-a]');
  if (!b || !duel || duel.pick !== null) return;
  duel.pick = Number(b.dataset.a);
  b.classList.add('picked');
  $$('#duelArea [data-a]').forEach(x => (x.disabled = true));
  const res = await emitP('duelAnswer', duel.pick);
  if (res) $('#duelFeedback').textContent = t('duel.sent');
});

socket.on('duelReveal', ({ answer, scores, eliminated, qid }) => {
  if (!room || !duel) return;
  clearInterval(duelTick);
  $$('#duelArea [data-a]').forEach(b => {
    b.disabled = true;
    b.classList.add(Number(b.dataset.a) === answer ? 'right' : 'wrong');
  });
  const fb = $('#duelFeedback');
  const playing = duel.mode !== 'eliminacao' || duel.q.alive.includes(me.name);
  if (!fb || !playing) return;
  const verdict = duel.pick === answer ? t('duel.right') : duel.pick === null ? t('duel.timeout') : t('duel.wrong');
  const extra = duel.mode === 'eliminacao'
    ? `<br>${eliminated.length ? esc(t('duel.out', { names: eliminated.join(', ') })) : t('duel.noneOut')}`
    : `<br>${scores.slice(0, 3).map((s, i) => `${['🥇', '🥈', '🥉'][i]} ${esc(s.name)} ${s.points}`).join(' · ')}`;
  fb.innerHTML = verdict + extra;
  if (duel.pick !== answer && ai.enabled) {
    $('#duelExplain').innerHTML = `<button id="explainBtn" class="ai-btn">${t('btn.whyWrong')}</button>`;
    $('#explainBtn').onclick = async () => {
      $('#explainBtn').disabled = true;
      $('#explainBtn').textContent = t('ai.thinking');
      const res = await emitP('aiExplain', { qid, chosen: duel?.pick ?? null, lang: getLang() });
      $('#duelExplain').innerHTML = res?.error
        ? `<p class="error">${esc(errText(res))}</p>`
        : `<div class="explain">🤖 ${esc(res.explanation)}</div>`;
    };
  }
});

socket.on('duelEnd', ({ mode, ranking, winners }) => {
  if (!room) return;
  clearInterval(duelTick);
  const won = winners.includes(me.name);
  if (won) { bump({ duelWins: 1, elimWins: mode === 'eliminacao' ? 1 : 0 }); earn(EARN.duelWin); }
  const rows = mode === 'eliminacao'
    ? ranking.map(r => `<li><b>${esc(r.name)}</b>: ${t(r.points === 1 ? 'duel.correct1' : 'duel.correct', { n: r.points })}${r.survived ? ' 🛡️' : ''}</li>`)
    : ranking.map(r => `<li><b>${esc(r.name)}</b>: ${t('duel.points', { n: r.points })}</li>`);
  showDuel(`<p class="q">${won ? t('duel.won', { n: EARN.duelWin }) : t('duel.end')}</p>
    ${winners.length ? `<p>${esc(t(winners.length > 1 ? 'duel.winners' : 'duel.winner', { names: winners.join(', ') }))}</p>` : `<p>${t('duel.noSurvivor')}</p>`}
    <ol>${rows.join('') || `<li>${t('duel.noAnswers')}</li>`}</ol>
    <button id="duelBack">${t('btn.back')}</button>`);
  $('#duelBack').onclick = () => { $('#duelArea').classList.add('hidden'); $('#quizSetup').classList.remove('hidden'); };
  duel = null;
});

// ---------- previsão de nota ----------
function renderGradeTests() {
  const sel = $('#gradeTest');
  const v = sel.value;
  sel.innerHTML = `<option value="">${t('grade.noTest')}</option>` + room.tests.map(x => `<option value="${esc(x.id)}">${esc(x.subject)} (${whenText(x.daysLeft)})</option>`).join('');
  if ([...sel.options].some(o => o.value === v)) sel.value = v;
  else if (room.tests[0]) sel.value = room.tests[0].id;
}
$('#aiGrade').onclick = () => {
  if (!room) return toast(t('grade.needRoom'));
  withAI($('#aiGrade'), t('grade.analyzing'), () => emitP('aiGrade', { testId: $('#gradeTest').value, lang: getLang() }), g => {
    const list = a => a.map(s => `<li>${esc(s)}</li>`).join('') || `<li>${t('grade.noData')}</li>`;
    $('#grade').innerHTML = `<div class="grade">
      <div class="row wrap"><span class="score">~${g.estimate}%</span>
        <span class="muted">${t('grade.conf', { c: t(`conf.${g.confidence}`) })}<br>${t('grade.based', { n: g.answered, p: g.accuracy })}</span></div>
      <p><b>${esc(g.message)}</b></p>
      <div class="cols">
        <div><b>${t('grade.strengths')}</b><ul>${list(g.strengths)}</ul></div>
        <div><b>${t('grade.improve')}</b><ul>${list(g.toImprove)}</ul></div>
      </div>
      <b>${t('grade.plan')}</b><ol>${g.plan.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <p class="muted small">${t('grade.note')}</p></div>`;
  });
};


// ---------- TUTOR (chat principal, sem sala) ----------
let tutorMsgs = store.get('tutorChat', []);
let tutorBusy = false;
let tutorImage = null;
let tutorLeft = null;
let tutorReqId = 0;
const saveTutor = () => store.set('tutorChat', tutorMsgs.slice(-60));

// Markdown simples e seguro: escapa tudo primeiro, depois **negrito**, *itálico* e listas
function md(text) {
  const lines = esc(text).split('\n');
  let html = '';
  let list = null;
  const inline = l => l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s.,!?)]|$)/g, '$1<i>$2</i>');
  for (const line of lines) {
    const ul = line.match(/^\s*[-•]\s+(.*)/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)/);
    const kind = ul ? 'ul' : ol ? 'ol' : null;
    if (kind !== list) { if (list) html += `</${list}>`; if (kind) html += `<${kind}>`; list = kind; }
    if (kind) html += `<li>${inline((ul ?? ol)[1])}</li>`;
    else if (line.trim()) html += `<p>${inline(line)}</p>`;
  }
  if (list) html += `</${list}>`;
  return html;
}

function tutorSubject() {
  const a = planAnswers();
  return subjName(a?.hard?.[0] ?? a?.subjects?.[0] ?? 'mat');
}

function tutorBubble(m) {
  const mine = m.role === 'user';
  return `<li class="${mine ? 'mine' : 'bot'}${m.error ? ' err' : ''}">
    ${mine ? avatarHtml(profile.avatar, profile.frame) : '<span class="avatar bot-av">🐟</span>'}
    <div class="bubble">${m.img ? '<div class="muted small">📷</div>' : ''}${m.pending && !m.content ? `<span class="typing">${t('tutor.thinking')}</span>` : mine ? esc(m.content).replace(/\n/g, '<br>') : md(m.content)}</div></li>`;
}

function renderTutor(scroll = false) {
  const hello = { role: 'assistant', content: t('tutor.hello', { name: profile.name ? `, ${profile.name}` : '' }) };
  $('#tutorLog').innerHTML = [hello, ...tutorMsgs].map(tutorBubble).join('');
  const subject = tutorSubject();
  const chips = [
    ['tutor.chip.explain', 'tutor.chip.explainMsg'], ['tutor.chip.quiz', 'tutor.chip.quizMsg'],
    ['tutor.chip.homework', 'tutor.chip.homeworkMsg'], ['tutor.chip.test', 'tutor.chip.testMsg'],
  ];
  $('#tutorChips').innerHTML = tutorMsgs.length > 2 ? '' : chips.map(([label, msg]) =>
    `<button class="chip-btn" data-ask-tutor="${esc(t(msg, { subject }))}">${esc(t(label, { subject }))}</button>`).join('');
  $('#tutorInfo').textContent = (tutorLeft != null ? t('tutor.left', { n: tutorLeft }) : '') + t('tutor.disclaimer');
  $('#tutorSend').disabled = tutorBusy;
  if (scroll) { const l = $('#tutorLog'); l.scrollTop = l.scrollHeight; }
}

async function askTutor(text) {
  text = text.trim();
  if (tutorBusy) return;
  if (!text && !tutorImage) return toast(t('err.tutor_empty'));
  const image = tutorImage;
  const userMsg = { role: 'user', content: text || t('tutor.photoMsg'), img: !!image };
  tutorMsgs.push(userMsg);
  const reply = { role: 'assistant', content: '', pending: true };
  tutorMsgs.push(reply);
  clearTutorImage();
  $('#tutorInput').value = '';
  autoGrow();
  tutorBusy = true;
  renderTutor(true);
  const id = ++tutorReqId;
  const history = tutorMsgs.filter(m => !m.pending && !m.error).map(({ role, content }) => ({ role, content }));
  const onDelta = d => {
    if (d.id !== id) return;
    reply.content += d.delta;
    const last = $('#tutorLog').lastElementChild;
    if (last) last.outerHTML = tutorBubble(reply);
    const l = $('#tutorLog'); l.scrollTop = l.scrollHeight;
  };
  socket.on('tutorDelta', onDelta);
  const res = await emitP('tutorAsk', { id, messages: history, lang: getLang(), image, context: planAnswers() });
  socket.off('tutorDelta', onDelta);
  tutorBusy = false;
  delete reply.pending;
  if (res?.error) {
    reply.content = `⚠️ ${errText(res)}`;
    reply.error = true;
    if (res.quota) reply.content += `\n\n**⭐ ${t('prem.upsell')}** → ${t('view.premium')}`;
  } else {
    reply.content = res.text;
    if (res.left != null) tutorLeft = res.left;
  }
  saveTutor();
  renderTutor(true);
}

function autoGrow() {
  const ta = $('#tutorInput');
  ta.style.height = 'auto';
  ta.style.height = `${Math.min(160, ta.scrollHeight)}px`;
}
function clearTutorImage() {
  tutorImage = null;
  $('#tutorImg').classList.add('hidden');
}

$('#tutorForm').onsubmit = e => { e.preventDefault(); askTutor($('#tutorInput').value); };
$('#tutorInput').addEventListener('input', autoGrow);
$('#tutorInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askTutor($('#tutorInput').value); }
});
$('#tutorChips').addEventListener('click', e => {
  const b = e.target.closest('[data-ask-tutor]');
  if (b) askTutor(b.dataset.askTutor);
});
$('#tutorNew').onclick = () => {
  if (tutorBusy) return;
  tutorMsgs = [];
  saveTutor();
  renderTutor(true);
  toast(t('tutor.cleared'));
};
$('#tutorPhoto').onchange = async e => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  try {
    tutorImage = await shrinkImage(file);
    $('#tutorImg img').src = `data:${tutorImage.mediaType};base64,${tutorImage.data}`;
    $('#tutorImg').classList.remove('hidden');
    $('#tutorInput').focus();
  } catch { toast(t('ai.badImage')); }
};
$('#tutorImgX').onclick = clearTutorImage;

// ---------- PLANO DE ESTUDO ----------
const planAnswers = () => store.get('planAnswers', null);
const doneMap = () => store.get('planDone', {});

function blockHtml(b, today) {
  const done = !!doneMap()[b.id];
  return `<div class="block kind-${b.kind} ${done ? 'done' : ''}">
    <b>${esc(subjName(b.subject))}</b>
    <span class="meta">${t(`plan.kind.${b.kind}`)} · ${b.minutes} min</span>
    <div class="acts">
      ${today && !done ? `<button data-start="${b.minutes}">${t('plan.start')}</button>` : ''}
      <label><input type="checkbox" data-done="${esc(b.id)}" ${done ? 'checked' : ''}> ${t('plan.done')}</label>
    </div></div>`;
}

function renderPlan() {
  const a = planAnswers();
  if (!a) {
    $('#planSummary').textContent = t('home.noPlan');
    $('#planWeek').innerHTML = `<div class="card empty" style="grid-column:1/-1"><span class="empty-icon">🗓️</span><p>${t('home.noPlan')}</p><button data-ob="start">${t('home.makePlan')}</button></div>`;
    $('#planTips').innerHTML = '';
    $('#planProgress').textContent = '';
    $('#planBar').style.width = '0%';
    $('#planNeedRoom').classList.add('hidden');
    return;
  }
  const plan = buildPlan(a);
  const todayIdx = (new Date().getDay() + 6) % 7;
  $('#planSummary').textContent = t('plan.summary', {
    min: a.minutes, days: a.days.length, when: lower(plain(t(`when.${a.when}`))), goal: lower(plain(t(`goal.${a.goal}`))),
  });
  const all = plan.week.flatMap(d => d.blocks);
  const done = all.filter(b => doneMap()[b.id]).length;
  $('#planProgress').textContent = t('plan.progress', { d: done, t: all.length });
  $('#planBar').style.width = `${all.length ? Math.round((done / all.length) * 100) : 0}%`;
  $('#planNeedRoom').classList.toggle('hidden', !!room);
  $('#planWeek').innerHTML = plan.week.map(d => {
    const date = new Date(`${d.date}T12:00:00`).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
    const isToday = d.day === todayIdx;
    return `<div class="day-col ${isToday ? 'today' : ''}">
      <header><span>${isToday ? t('plan.today') : t(`dayL.${d.day}`)}</span><small>${esc(date)}</small></header>
      <div class="blocks-wrap">${d.blocks.length ? d.blocks.map(b => blockHtml(b, isToday)).join('') : `<div class="rest">😌 ${t('plan.rest')}</div>`}</div>
    </div>`;
  }).join('');
  const tips = planTips(a).map(k => t(k));
  if (a.test?.date && daysUntil(a.test.date) >= 0) tips.unshift(t('tip.test', { subject: subjName(a.test.subject), when: whenText(daysUntil(a.test.date)) }));
  $('#planTips').innerHTML = tips.map(x => `<li>${esc(x)}</li>`).join('');
}

function renderPlanToday() {
  const a = planAnswers();
  const box = $('#planToday');
  if (!a) {
    box.innerHTML = `<h3>${t('home.planToday')}</h3><p class="muted">${t('home.noPlan')}</p><div><button data-ob="start">${t('home.makePlan')}</button></div>`;
    return;
  }
  const plan = buildPlan(a);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const blocks = plan.week[todayIdx].blocks;
  box.innerHTML = `<div class="row between wrap"><h3>${t('home.planToday')}</h3><button class="ghost small-btn" data-view="plano">${t('home.seePlan')}</button></div>
    ${blocks.length ? `<div class="blocks">${blocks.map(b => blockHtml(b, true)).join('')}</div>` : `<p class="muted">${t('home.planRest')}</p>`}`;
}

document.addEventListener('change', e => {
  const c = e.target.closest('[data-done]');
  if (!c) return;
  const m = doneMap();
  if (c.checked) m[c.dataset.done] = true; else delete m[c.dataset.done];
  store.set('planDone', m);
  if (view === 'plano') renderPlan(); else renderHome();
});
document.addEventListener('click', e => {
  const s = e.target.closest('[data-start]');
  if (s) {
    if (!room) { toast(t('plan.needRoom'), 5000); show('inicio'); return; }
    setFocusMinutes(Number(s.dataset.start));
    show('estudar');
    return;
  }
  if (e.target.closest('[data-ob]')) openOnboarding(true);
});
$('#redoPlan').onclick = () => openOnboarding(true);
$('#redoPlan2').onclick = () => openOnboarding(true);

// ---------- QUESTIONÁRIO INICIAL ----------
let ob = null; // { i, a }
const OB_STEPS = ['lang', 'name', 'year', 'subjects', 'hard', 'goal', 'minutes', 'days', 'when', 'test'];

function openOnboarding(redo = false) {
  const prev = planAnswers();
  ob = {
    i: redo ? 1 : 0,
    a: {
      name: profile.name, year: prev?.year ?? null, subjects: prev?.subjects ?? null, hard: prev?.hard ?? [],
      goal: prev?.goal ?? null, minutes: prev?.minutes ?? null, days: prev?.days ?? [0, 1, 2, 3, 4], when: prev?.when ?? null,
      test: prev?.test ?? null,
    },
  };
  $('#onboarding').classList.remove('hidden');
  renderOb();
}

function closeOnboarding() {
  $('#onboarding').classList.add('hidden');
  store.set('onboarded', true);
  ob = null;
}

const opt = (val, label, on, attr = 'data-v') => `<button ${attr}="${esc(val)}" class="${on ? 'on' : ''}">${esc(label)}</button>`;

function renderOb() {
  const step = OB_STEPS[ob.i];
  const a = ob.a;
  $('#obStep').textContent = t('ob.step', { i: ob.i + 1, n: OB_STEPS.length });
  $('#obBar').style.width = `${Math.round(((ob.i + 1) / OB_STEPS.length) * 100)}%`;
  $('#obBack').style.visibility = ob.i === 0 ? 'hidden' : 'visible';
  $('#obNext').textContent = ob.i === OB_STEPS.length - 1 ? t('ob.finish') : t('ob.next');
  $('#obError').textContent = '';
  let html = '';
  switch (step) {
    case 'lang':
      html = `<h2>${t('ob.lang')}</h2><p></p><div class="ob-opts">${Object.entries(LANGS).map(([k, v]) => opt(k, v, getLang() === k)).join('')}</div>`;
      break;
    case 'name':
      html = `<h2>${t('ob.name')}</h2><p>${t('ob.nameHelp')}</p><input id="obName" type="text" maxlength="20" value="${esc(a.name)}" placeholder="${esc(t('ph.name'))}" autocomplete="off">`;
      break;
    case 'year':
      html = `<h2>${t('ob.year')}</h2><p></p><div class="ob-opts three">${YEARS.map(y => opt(y, /^\d+$/.test(y) ? t('year.n', { n: y }) : t(`year.${y}`), a.year === y)).join('')}</div>`;
      break;
    case 'subjects':
      a.subjects ??= suggestedSubjects(a.year);
      html = `<h2>${t('ob.subjects')}</h2><p>${t('ob.pickMany')}</p><div class="ob-opts three">${SUBJECTS.map(s => opt(s, t(`subj.${s}`), a.subjects.includes(s))).join('')}</div>`;
      break;
    case 'hard':
      html = `<h2>${t('ob.hard')}</h2><p>${t('ob.hardHelp')}</p><div class="ob-opts three">${a.subjects.map(s => opt(s, t(`subj.${s}`), a.hard.includes(s))).join('')}</div>`;
      break;
    case 'goal':
      html = `<h2>${t('ob.goal')}</h2><p></p><div class="ob-opts">${GOALS.map(g => opt(g, t(`goal.${g}`), a.goal === g)).join('')}</div>`;
      break;
    case 'minutes':
      html = `<h2>${t('ob.minutes')}</h2><p></p><div class="ob-opts three">${MINUTES.map(m => opt(m, t('timer.min', { n: m }), a.minutes === m)).join('')}</div>`;
      break;
    case 'days':
      html = `<h2>${t('ob.days')}</h2><p>${t('ob.pickMany')}</p><div class="ob-opts days">${[0, 1, 2, 3, 4, 5, 6].map(d => opt(d, t(`day.${d}`), a.days.includes(d))).join('')}</div>`;
      break;
    case 'when':
      html = `<h2>${t('ob.when')}</h2><p></p><div class="ob-opts three">${WHEN.map(w => opt(w, t(`when.${w}`), a.when === w)).join('')}</div>`;
      break;
    case 'test':
      html = `<h2>${t('ob.test')}</h2><p>${t('ob.testHelp')}</p>
        <div class="ob-opts">${opt('none', t('ob.noTest'), !a.test, 'data-notest')}</div>
        <div class="ob-test">
          <select id="obTestSubj">${a.subjects.map(s => `<option value="${s}" ${a.test?.subject === s ? 'selected' : ''}>${esc(t(`subj.${s}`))}</option>`).join('')}</select>
          <input id="obTestDate" type="date" min="${new Date().toISOString().slice(0, 10)}" value="${esc(a.test?.date ?? '')}" aria-label="${esc(t('aria.testDate'))}">
        </div>`;
      break;
  }
  $('#obBody').innerHTML = html;
  $('#obName')?.focus();
}

$('#obBody').addEventListener('click', e => {
  if (!ob) return;
  const step = OB_STEPS[ob.i];
  const a = ob.a;
  if (e.target.closest('[data-notest]')) { a.test = null; $('#obTestDate').value = ''; renderOb(); return; }
  const b = e.target.closest('[data-v]');
  if (!b) return;
  const v = b.dataset.v;
  const toggle = (list, x) => (list.includes(x) ? list.filter(y => y !== x) : [...list, x]);
  switch (step) {
    case 'lang': changeLang(v); translateDom($('#onboarding')); break;
    case 'year': if (a.year !== v) a.subjects = null; a.year = v; break;
    case 'subjects': a.subjects = toggle(a.subjects, v); a.hard = a.hard.filter(h => a.subjects.includes(h)); break;
    case 'hard': a.hard = toggle(a.hard, v); break;
    case 'goal': a.goal = v; break;
    case 'minutes': a.minutes = Number(v); break;
    case 'days': a.days = toggle(a.days, Number(v)).sort(); break;
    case 'when': a.when = v; break;
  }
  renderOb();
  // nas perguntas de uma só resposta, avança logo
  if (['year', 'goal', 'minutes', 'when'].includes(step)) setTimeout(() => obNext(), 180);
});
$('#obBody').addEventListener('change', e => {
  if (!ob || OB_STEPS[ob.i] !== 'test') return;
  const date = $('#obTestDate').value;
  ob.a.test = date ? { subject: $('#obTestSubj').value, date } : null;
  $('[data-notest]').classList.toggle('on', !ob.a.test);
});
$('#obBody').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'obName') obNext(); });

function obValidate() {
  const step = OB_STEPS[ob.i];
  const a = ob.a;
  if (step === 'name') {
    a.name = $('#obName').value.trim();
    if (!a.name) return t('ob.needName');
  }
  if (['year', 'goal', 'minutes', 'when'].includes(step) && a[step] == null) return t('ob.pickOne');
  if (step === 'subjects' && !a.subjects.length) return t('ob.needSubject');
  if (step === 'days' && !a.days.length) return t('ob.needDay');
  return null;
}

function obNext() {
  if (!ob) return;
  const err = obValidate();
  if (err) { $('#obError').textContent = err; return; }
  if (ob.i < OB_STEPS.length - 1) { ob.i++; renderOb(); return; }
  // fim: guarda e cria o plano
  const { name, ...answers } = ob.a;
  profile.name = name;
  saveProfile();
  $('#name').value = name;
  store.set('planAnswers', answers);
  closeOnboarding();
  renderWallet();
  show('plano');
  toast(t('ob.done'), 4000);
}
$('#obNext').onclick = obNext;
$('#obBack').onclick = () => { if (ob && ob.i > 0) { ob.i--; renderOb(); } };
$('#obSkip').onclick = () => { closeOnboarding(); show('chat'); };

// ---------- PREMIUM ----------
let billing = 'month';
const PLANS = [
  { id: 'free', month: 0, year: 0, features: ['rooms', 'focus', 'ai30', 'plan', 'medals'] },
  { id: 'premium', month: 2.99, year: 24.99, hl: true, features: ['allFree', 'aiUnl', 'grade', 'planAi', 'stats', 'cosm'] },
  { id: 'family', month: 4.99, year: 39.99, features: ['allPrem', 'kids', 'report'] },
  { id: 'school', perStudent: 1, features: ['allPrem', 'teacher', 'classes', 'support'] },
];
const planPrice = p => p.perStudent ? `${money(p.perStudent)}${t('prem.perStudent')}`
  : p.month === 0 ? money(0)
  : billing === 'year' ? `${money(p.year)}${t('prem.perYear')}` : `${money(p.month)}${t('prem.perMonth')}`;

function renderPremium() {
  const pr = PLANS[1];
  $('#saveTag').textContent = t('prem.save', { n: Math.round((1 - pr.year / (pr.month * 12)) * 100) });
  $$('[data-billing]').forEach(b => b.classList.toggle('active', b.dataset.billing === billing));
  $('#planCards').innerHTML = PLANS.map(p => {
    const price = planPrice(p);
    const [amount, per] = p.month === 0 && !p.perStudent ? [price, ''] : splitPrice(price);
    const btn = p.id === 'free' ? `<button class="ghost" disabled>${t('prem.current')}</button>`
      : `<button data-ask="${p.id}" class="${p.hl ? '' : 'ghost'}">${t(p.id === 'school' ? 'prem.contact' : 'prem.ask')}</button>`;
    return `<div class="plan-card ${p.hl ? 'hl' : ''}">
      ${p.hl ? `<span class="pop">${t('prem.popular')}</span>` : ''}
      <h3>${t(`prem.${p.id}`)}</h3>
      <div class="price">${esc(amount)}<small>${esc(per)}</small></div>
      <ul>${p.features.map(f => `<li>${t(`prem.f.${f}`)}</li>`).join('')}</ul>
      ${btn}</div>`;
  }).join('');
}
function splitPrice(s) {
  const i = s.lastIndexOf('/');
  return i > 0 ? [s.slice(0, i), s.slice(i)] : [s, ''];
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-billing]');
  if (b) { billing = b.dataset.billing; renderPremium(); return; }
  const ask = e.target.closest('[data-ask]');
  if (ask) {
    const p = PLANS.find(x => x.id === ask.dataset.ask);
    $('#askMsg').value = t('prem.askMsg', { plan: t(`prem.${p.id}`), price: planPrice(p) });
    $('#askBox').classList.remove('hidden');
    $('#askBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
$('#copyAsk').onclick = async () => {
  try { await navigator.clipboard.writeText($('#askMsg').value); toast(t('toast.copied')); }
  catch { $('#askMsg').select(); toast(t('toast.copyFail')); }
};

// ---------- LOJA ----------
const buying = new Set();
function renderShop() {
  $('#shopScales').textContent = profile.scales;
  $('#earnList').innerHTML = [
    ['earn.focus', EARN.perFocusMinute], ['earn.duel', EARN.duelWin], ['earn.note', EARN.note],
    ['earn.question', EARN.question], ['earn.ach', EARN.achievement], ['earn.welcome', 50],
  ].map(([k, n]) => `<li>${t(k)}: <b>+${n}</b></li>`).join('');
  $('#shopGrid').innerHTML = MEDALS.map(m => {
    const owned = profile.medals.includes(m.id);
    const can = profile.scales >= m.price;
    const confirming = buying.has(m.id);
    const btn = owned ? `<button class="ghost" disabled>${t('shop.mine')}</button>`
      : confirming ? `<button data-buy="${m.id}" data-sure="1">${t('shop.confirm', { n: m.price })}</button>`
      : `<button data-buy="${m.id}" ${can ? '' : 'disabled'}>${can ? t('shop.buy') : t('shop.missing', { n: m.price - profile.scales })}</button>`;
    return `<div class="medal-card ${owned ? 'owned' : ''}">
      <span class="mi">${m.icon}</span><b>${esc(medalName(m))}</b><p>${esc(t(`medal.${m.id}.d`))}</p>
      <span class="price">${m.price ? `${m.price} 🐟` : t('shop.free')}</span>${btn}</div>`;
  }).join('');
}
$('#shopGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-buy]');
  if (!b) return;
  const m = MEDALS.find(x => x.id === b.dataset.buy);
  if (!b.dataset.sure) { buying.clear(); buying.add(m.id); return renderShop(); }
  buying.clear();
  if (profile.scales < m.price || profile.medals.includes(m.id)) return renderShop();
  profile.scales -= m.price;
  profile.medals.push(m.id);
  profile.medal = m.icon;
  saveProfile();
  renderWallet();
  renderShop();
  if (room) socket.emit('profile', { medal: profile.medal });
  toast(t('toast.bought', { icon: m.icon, name: medalName(m) }), 4000);
});

// ---------- MEDALHAS ----------
function renderMedals() {
  $('#ownedMedals').innerHTML = MEDALS.filter(m => profile.medals.includes(m.id)).map(m =>
    `<button data-medal="${esc(m.icon)}" class="${profile.medal === m.icon ? 'selected' : ''}">${m.icon} ${esc(medalName(m))}</button>`).join('')
    + `<button data-view="loja" class="ghost">${t('medals.toShop')}</button>`;
  $('#achCount').textContent = t('medals.count', { n: profile.achieved.length, t: ACHIEVEMENTS.length });
  $('#achievements').innerHTML = ACHIEVEMENTS.map(a => {
    const ok = profile.achieved.includes(a.id);
    return `<div class="ach ${ok ? '' : 'locked'}" title="${esc(t(`ach.${a.id}.d`))}"><span class="ic">${a.icon}</span><div><b>${esc(t(`ach.${a.id}`))}</b><span>${esc(t(`ach.${a.id}.d`))}</span></div></div>`;
  }).join('');
}
$('#ownedMedals').addEventListener('click', e => {
  const b = e.target.closest('[data-medal]');
  if (!b) return;
  profile.medal = b.dataset.medal;
  saveProfile();
  renderMedals();
  if (room) socket.emit('profile', { medal: profile.medal });
});

// ---------- PERFIL ----------
const lockText = item => item.ach ? `🔒 ${t(`ach.${item.ach}`)}` : t('lock.min', { n: item.need });
function renderProfile() {
  $('#profileAvatar').outerHTML = `<span id="profileAvatar" class="avatar huge frame-${esc(profile.frame)}">${esc(profile.avatar)}</span>`;
  $('#profileName').textContent = profile.name || t('nav.noName');
  const medal = MEDALS.find(m => m.icon === profile.medal);
  $('#profileMedal').textContent = medal ? `${medal.icon} ${medalName(medal)}` : '';
  const c = profile.counters;
  $('#profileStats').innerHTML = [
    ['🐟', profile.scales, 'stat.scales'], ['⏱️', profile.minutes, 'stat.focusMin'], ['🎯', c.sessions, 'stat.sessions'],
    ['⚔️', c.duelWins, 'stat.duelsWon'], ['🎖️', profile.medals.length, 'stat.medals'], ['🏅', profile.achieved.length, 'stat.achievements'],
  ].map(([i, v, l]) => `<div class="stat"><b>${i} ${v}</b><span>${t(l)}</span></div>`).join('');
  const cell = (item, kind, inner, label) => {
    const ok = isUnlocked(item, profile.minutes, profile.achieved);
    const sel = (kind === 'avatar' ? profile.avatar : profile.frame) === item.id;
    return `<button data-${kind}="${esc(item.id)}" class="${ok ? '' : 'locked'} ${sel ? 'selected' : ''}" ${ok ? '' : 'disabled'}>
      ${inner}${label}${ok ? '' : `<br>${esc(lockText(item))}`}</button>`;
  };
  $('#avatarGrid').innerHTML = AVATARS.map(a => cell(a, 'avatar', `<span class="avatar big frame-${esc(profile.frame)}">${a.id}</span>`, '')).join('');
  $('#frameGrid').innerHTML = FRAMES.map(f => cell(f, 'frame', `<span class="avatar big frame-${f.id}">${esc(profile.avatar)}</span>`, esc(t(`frame.${f.id}`)))).join('');
  $('[data-room-only]').classList.toggle('hidden', !room);
}
document.querySelector('#view-perfil').addEventListener('click', e => {
  const a = e.target.closest('[data-avatar]');
  const f = e.target.closest('[data-frame]');
  if (!a && !f) return;
  if (a) profile.avatar = a.dataset.avatar;
  if (f) profile.frame = f.dataset.frame;
  saveProfile();
  renderProfile();
  renderWallet();
  if (room) socket.emit('profile', { avatar: profile.avatar, frame: profile.frame });
});

// ---------- DEFINIÇÕES ----------
function applyTheme(th) {
  if (th === 'light' || th === 'dark') document.documentElement.dataset.theme = th;
  else delete document.documentElement.dataset.theme;
  $$('[data-theme-set]').forEach(b => b.classList.toggle('active', b.dataset.themeSet === (th || 'system')));
}
applyTheme(store.get('theme', null));
document.addEventListener('click', e => {
  const b = e.target.closest('[data-theme-set]');
  if (b) {
    const th = b.dataset.themeSet === 'system' ? null : b.dataset.themeSet;
    store.set('theme', th);
    applyTheme(th);
    return;
  }
  const l = e.target.closest('[data-lang]');
  if (l) { changeLang(l.dataset.lang); }
});
function renderSettings() {
  $('#langPicker').innerHTML = Object.entries(LANGS).map(([k, v]) => `<button data-lang="${k}" class="${getLang() === k ? 'active' : ''}">${esc(v)}</button>`).join('');
  $('#settingsRoom').textContent = room ? t('set.inRoom', { name: room.name, code: room.code }) : t('set.noRoom');
  $('#leave').disabled = !room;
}
let wipeArmed = false;
$('#wipe').onclick = () => {
  if (!wipeArmed) { wipeArmed = true; $('#wipe').textContent = t('wipe.sure'); return; }
  store.clear();
  location.reload();
};

// ---------- ＋ ADICIONAR ----------
const openAdd = () => $('#addSheet').classList.remove('hidden');
const closeAdd = () => $('#addSheet').classList.add('hidden');
$('#addBtn').onclick = () => { closeNav(); openAdd(); };
$('#addBtn2').onclick = openAdd;
$('#addClose').onclick = closeAdd;
$('#addSheet').addEventListener('click', e => {
  if (e.target === $('#addSheet')) return closeAdd();
  const b = e.target.closest('[data-add]');
  if (!b) return;
  closeAdd();
  const needRoom = ['foco', 'apontamento', 'pergunta', 'ia', 'teste', 'mensagem'].includes(b.dataset.add);
  if (needRoom && !room) { show('inicio'); toast(t('add.needRoom')); return; }
  const focus = sel => setTimeout(() => $(sel)?.focus(), 50);
  switch (b.dataset.add) {
    case 'sala':
      show('inicio');
      if (room) return toast(t('add.leaveFirst'));
      focus('#roomName'); break;
    case 'entrar':
      show('inicio');
      if (room) return toast(t('add.leaveFirst'));
      focus('#code'); break;
    case 'foco': show('estudar'); focus('#timerStart'); break;
    case 'apontamento': show('apontamentos'); focus('#noteTitle'); break;
    case 'pergunta': show('duelos'); $('#qDetails').open = true; focus('#qText'); break;
    case 'ia': show('duelos'); $('#aiPhoto').click(); break;
    case 'teste': show('calendario'); focus('#testSubject'); break;
    case 'mensagem': show('salachat'); focus('#chatInput'); break;
    case 'tutor': show('chat'); focus('#tutorInput'); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAdd(); closeNav(); } });

// ---------- arranque ----------
translateDom();
renderWallet();
renderLocks();
show('chat'); // o tutor é a página principal
const fromHash = location.hash.slice(1).toUpperCase();
if (/^[A-Z0-9]{6}$/.test(fromHash)) $('#code').value = fromHash;
if (!store.get('onboarded', false)) openOnboarding(false);

socket.on('disconnect', () => {
  if (!room) return;
  toast(t('toast.lost'), 2000);
  setTimeout(() => location.reload(), 2000);
});
