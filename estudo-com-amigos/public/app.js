import { AVATARS, FRAMES, ACHIEVEMENTS, EMPTY_COUNTERS, isUnlocked, lockLabel } from './cosmetics.js';
import * as Sound from './sounds.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const socket = io({ autoConnect: true });

// ---------- perfil guardado no browser ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
};
const profile = store.get('profile', {});
profile.name ??= '';
profile.avatar ??= '🙂';
profile.frame ??= 'none';
profile.minutes ??= 0;
profile.counters = { ...EMPTY_COUNTERS, ...(profile.counters ?? {}) };
profile.achieved ??= [];
let recent = store.get('recentRooms', []);
const saveProfile = () => store.set('profile', profile);

let room = null;
let me = null;
let ai = { enabled: false, quota: null };
let tick = null;
let duelTick = null;
let duel = null; // estado do duelo atual no cliente

// ---------- utilidades ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const avatarHtml = (a, f, big = false) => `<span class="avatar frame-${esc(f)}${big ? ' big' : ''}">${esc(a)}</span>`;
function toast(text, ms = 3000) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add('hidden'), ms);
}
const fmt = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const LEAGUE_MEDALS = ['🥉', '🥈', '🥇', '💠', '💎'];
const whenText = d => d === 0 ? 'hoje' : d === 1 ? 'amanhã' : `daqui a ${d} dias`;
const emitP = (ev, data) => new Promise(r => socket.emit(ev, data, r));

// ---------- conquistas ----------
function bump(changes) {
  const c = profile.counters;
  for (const [k, v] of Object.entries(changes)) {
    if (k.startsWith('max:')) { const key = k.slice(4); c[key] = Math.max(c[key] ?? 0, v); }
    else c[k] = (c[k] ?? 0) + v;
  }
  const fresh = ACHIEVEMENTS.filter(a => !profile.achieved.includes(a.id) && a.test(c));
  for (const a of fresh) profile.achieved.push(a.id);
  saveProfile();
  if (fresh.length) {
    toast(`🏅 Conquista: ${fresh.map(a => `${a.icon} ${a.name}`).join(', ')}!`, 5000);
    if (room) renderAchievements();
  }
}

function renderAchievements() {
  $('#achievements').innerHTML = ACHIEVEMENTS.map(a => {
    const ok = profile.achieved.includes(a.id);
    return `<div class="ach ${ok ? '' : 'locked'}" title="${esc(a.desc)}"><span class="ic">${a.icon}</span><div><b>${esc(a.name)}</b><span>${esc(a.desc)}</span></div></div>`;
  }).join('');
}

// ---------- entrada ----------
$('#name').value = profile.name;
function renderHome() {
  $('#previewAvatar').outerHTML = `<span id="previewAvatar" class="avatar big frame-${esc(profile.frame)}">${esc(profile.avatar)}</span>`;
  $('#homeMinutes').textContent = `⏱️ ${profile.minutes} min · 🏅 ${profile.achieved.length}/${ACHIEVEMENTS.length}`;
  $('#recent').innerHTML = recent.length
    ? `<h3>Salas recentes</h3><ul>${recent.map(r => `<li><button data-code="${esc(r.code)}">${esc(r.name)} · ${esc(r.code)}</button></li>`).join('')}</ul>`
    : '';
}
renderHome();

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
  if (!name) return ($('#homeError').textContent = 'Escreve o teu nome primeiro.');
  profile.name = name; saveProfile();
  const payload = { profile: { name, avatar: profile.avatar, frame: profile.frame }, name: $('#roomName').value, code: $('#code').value };
  socket.emit(kind === 'create' ? 'createRoom' : 'joinRoom', payload, res => {
    if (res.error) return ($('#homeError').textContent = res.error);
    $('#homeError').textContent = '';
    openRoom(res);
  });
}

// ---------- sala ----------
function openRoom({ room: r, me: m, ai: a }) {
  room = r; me = m; ai = a;
  recent = [{ code: r.code, name: r.name }, ...recent.filter(x => x.code !== r.code)].slice(0, 6);
  store.set('recentRooms', recent);
  history.replaceState(null, '', `#${r.code}`);
  $('#home').classList.add('hidden');
  $('#room').classList.remove('hidden');
  $('#roomTitle').textContent = r.name;
  $('#copyCode').textContent = r.code;
  $('#messages').innerHTML = '';
  r.messages.forEach(addMessage);
  renderMembers(r.members);
  renderNotes();
  renderSummary();
  renderQuestions();
  renderTests();
  renderProgress();
  renderTimer();
  renderAchievements();
  renderAiQuota();
  setAmbience(r.ambience, false);
  $('#duelArea').classList.add('hidden');
  $('#quizSetup').classList.remove('hidden');
  if (r.duelActive) showDuelMessage('Há um duelo a decorrer — entras na próxima pergunta.');
}

$('#leave').onclick = () => location.reload();
$('#copyCode').onclick = async () => {
  try { await navigator.clipboard.writeText(room.code); toast('Código copiado! Envia-o aos teus amigos.'); }
  catch { toast(`Código: ${room.code}`); }
};

// separadores
document.querySelector('.tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]');
  if (b) openTab(b.dataset.tab);
});
function openTab(name) {
  $$('.tabs button').forEach(x => x.classList.toggle('active', x.dataset.tab === name));
  $$('.tab').forEach(t => t.classList.toggle('hidden', t.id !== `tab-${name}`));
  if (name === 'league') renderLeague();
  if (name === 'me') { renderAchievements(); renderGradeTests(); }
}

// membros
function renderMembers(list) {
  room.members = list;
  $('#members').innerHTML = list.map(m => {
    const away = m.status === 'away';
    const tag = m.distracted ? '<span class="tag away">distraído 😅</span>'
      : away ? '<span class="tag away">fora</span>'
      : room.timer.state === 'focus' ? '<span class="tag">a estudar 📖</span>' : '';
    return `<li>${avatarHtml(m.avatar, m.frame)}<span>${esc(m.name)}${m.name === me.name ? ' <span class="muted small">(tu)</span>' : ''}</span>${tag}</li>`;
  }).join('');
}
socket.on('members', list => room && renderMembers(list));

document.addEventListener('visibilitychange', () => {
  if (room) socket.emit('status', document.hidden ? 'away' : 'focused');
});

// ---------- chat ----------
function addMessage(m) {
  const li = document.createElement('li');
  if (m.system) {
    li.className = 'system';
    li.textContent = m.text;
  } else {
    const mine = me && m.author === me.name;
    const member = room.members.find(x => x.name === m.author);
    li.className = mine ? 'mine' : '';
    li.innerHTML = `${avatarHtml(member?.avatar ?? '🙂', member?.frame ?? 'none')}
      <div class="bubble"><div class="who">${esc(m.author)}</div>${esc(m.text)}</div>
      ${mine ? '' : `<button class="report" title="Denunciar mensagem" data-id="${esc(m.id)}">⚑</button>`}`;
  }
  const list = $('#messages');
  const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
  list.appendChild(li);
  if (atBottom || m.author === me?.name) list.scrollTop = list.scrollHeight;
}
socket.on('chat', m => room && addMessage(m));
socket.on('system', text => room && addMessage({ system: true, text }));
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
  toast('Obrigado. A mensagem foi denunciada.');
});

// reações ao vivo
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
  const t = room.timer;
  $('#timerBox').className = `timer ${t.state}`;
  $('#timerStart').classList.toggle('hidden', t.state !== 'idle');
  $('#focusMin').classList.toggle('hidden', t.state !== 'idle');
  $('#timerStop').classList.toggle('hidden', t.state === 'idle');
  $('#timerLabel').textContent = t.state === 'focus' ? '📖 Foco — nada de TikTok!'
    : t.state === 'break' ? '☕ Pausa' : 'Pronto para estudar?';
  clearInterval(tick);
  const draw = () => {
    $('#timerClock').textContent = t.state === 'idle' ? fmt(Number($('#focusMin').value) * 60_000) : fmt(t.endsAt - Date.now());
  };
  draw();
  if (t.state !== 'idle') tick = setInterval(draw, 500);
}
$('#focusMin').onchange = () => renderTimer();
$('#timerStart').onclick = () => socket.emit('timerStart', Number($('#focusMin').value));
$('#timerStop').onclick = () => socket.emit('timerStop');
socket.on('timer', t => { if (!room) return; room.timer = t; renderTimer(); });

socket.on('focusDone', ({ minutes, rewarded, streak }) => {
  if (!room) return;
  Sound.chime();
  if (rewarded.includes(me.name)) {
    const before = profile.minutes;
    profile.minutes += minutes;
    const hour = new Date().getHours();
    bump({ sessions: 1, minutes, night: hour >= 22 || hour < 4 ? 1 : 0, morning: hour >= 4 && hour < 8 ? 1 : 0, 'max:bestStreak': streak });
    const unlocked = [...AVATARS, ...FRAMES].filter(i => i.need > before && i.need <= profile.minutes);
    toast(`🎉 Ganhaste ${minutes} min de foco!${unlocked.length ? ' Desbloqueaste coisas novas no cacifo 🎨' : ''}`, 5000);
  } else {
    toast('Desta vez distraíste-te… na próxima consegues! 💪', 5000);
  }
});
socket.on('breakDone', () => room && toast('A pausa acabou. Mais uma ronda? 📚'));

// ---------- sons ----------
const savedVol = store.get('volume', 0.5);
$('#volume').value = savedVol;
Sound.setVolume(savedVol);
$('#volume').oninput = e => { Sound.setVolume(Number(e.target.value)); store.set('volume', Number(e.target.value)); };
$('#ambience').onchange = e => socket.emit('ambience', e.target.value);
$('#soundUnlock').onclick = () => { setAmbience(room.ambience, false); };

function setAmbience(a, announce) {
  room.ambience = a;
  $('#ambience').value = a;
  if (a === 'none') { Sound.stop(); $('#soundUnlock').classList.add('hidden'); return; }
  if (!Sound.canPlay()) return;
  if (store.get('muted', false)) return;
  Sound.play(a);
  // os browsers só deixam tocar som depois de um clique
  setTimeout(() => $('#soundUnlock').classList.toggle('hidden', Sound.isUnlocked()), 300);
  if (announce) toast(`🎧 Som da sala: ${$('#ambience').selectedOptions[0].textContent}`);
}
socket.on('ambience', ({ ambience, by }) => {
  if (!room) return;
  setAmbience(ambience, true);
  addMessage({ system: true, text: `${by} mudou o som da sala.` });
});

// ---------- chama da sala, liga e ranking ----------
function renderProgress() {
  const s = room.streak;
  const pct = Math.min(100, Math.round((s.today.minutes / s.today.goal) * 100));
  $('#streakBox').innerHTML = `
    <div class="flame ${s.today.lit || s.streak ? '' : 'off'}"><span class="big">🔥</span>
      <div><b>${s.streak} dia${s.streak === 1 ? '' : 's'} seguido${s.streak === 1 ? '' : 's'}</b><br>
      <span class="muted small">${s.today.lit ? 'Hoje já está acesa! ✅' : 'Ainda falta para hoje'}</span></div></div>
    <div class="progress"><div style="width:${pct}%"></div></div>
    <p class="muted small">Hoje: ${s.today.minutes} / ${s.today.goal} min (15 min × ${Math.max(1, s.today.people)} pessoa${s.today.people === 1 ? '' : 's'} que entr${s.today.people === 1 ? 'ou' : 'aram'}). Quem estuda a dobrar salva um amigo!</p>`;
  $('#streakBadge').textContent = `🔥 ${s.streak}`;
  $('#leagueBadge').textContent = `${LEAGUE_MEDALS[room.league.tier]} Liga ${room.league.name}`;
  bump({ 'max:bestStreak': s.streak, 'max:bestTier': room.league.tier });
  renderRanking();
  renderLeague();
}
socket.on('progress', p => {
  if (!room) return;
  Object.assign(room, { streak: p.streak, league: p.league, stats: p.stats });
  renderProgress();
});

function renderLeague() {
  const L = room.league;
  const last = L.last ? `<br><span class="muted small">Semana passada: ${L.last.place}.º lugar com ${L.last.minutes} min.</span>` : '';
  $('#leagueHead').innerHTML = `<span class="medal">${LEAGUE_MEDALS[L.tier]}</span>
    <div><b>Liga ${esc(L.name)}</b><br><span class="muted small">Todas as segundas-feiras, as melhores salas sobem de liga e as que não estudam descem.</span>${last}</div>`;
  $('#leagueBody').innerHTML = L.table.map((r, i) =>
    `<tr class="${r.me ? 'me' : ''}"><td>${i + 1}</td><td>${esc(r.name)}${r.me ? ' (vocês)' : ''}</td><td>${r.minutes}</td></tr>`).join('');
}

function renderRanking() {
  const rows = Object.entries(room.stats).sort((a, b) => b[1].minutes - a[1].minutes || b[1].duelWins - a[1].duelWins);
  $('#rankingBody').innerHTML = rows.map(([name, s], i) =>
    `<tr class="${name === me.name ? 'me' : ''}"><td>${i + 1}</td><td>${esc(name)}</td><td>${s.minutes}</td><td>${s.sessions}</td><td>${s.duelWins}</td></tr>`).join('')
    || '<tr><td colspan="5" class="muted">Ainda ninguém estudou aqui.</td></tr>';
}

// ---------- calendário de testes ----------
function renderTests() {
  const tests = room.tests;
  $('#tests').innerHTML = tests.map(t => `
    <li><span>📘 ${esc(t.subject)}</span><span class="when ${t.daysLeft <= 3 ? 'soon' : ''}">${whenText(t.daysLeft)}</span>
    <button class="del" data-test="${esc(t.id)}" title="Apagar">✕</button></li>`).join('')
    || '<li class="muted small">Nenhum teste marcado.</li>';
  const soon = tests.find(t => t.daysLeft <= 3);
  const banner = $('#testBanner');
  banner.classList.toggle('hidden', !soon);
  if (soon) banner.textContent = `⏰ Teste de ${soon.subject} ${whenText(soon.daysLeft)}! Bora fazer um foco juntos?`;
  renderGradeTests();
}
$('#testDate').min = new Date().toISOString().slice(0, 10);
$('#testForm').onsubmit = async e => {
  e.preventDefault();
  const res = await emitP('addTest', { subject: $('#testSubject').value, date: $('#testDate').value });
  $('#testError').textContent = res?.error ?? '';
  if (!res?.error) { $('#testSubject').value = ''; $('#testDate').value = ''; bump({ tests: 1 }); }
};
$('#tests').addEventListener('click', e => {
  const b = e.target.closest('[data-test]');
  if (b && confirm('Apagar este teste do calendário?')) socket.emit('removeTest', b.dataset.test);
});
socket.on('tests', tests => { if (!room) return; room.tests = tests; renderTests(); });

// ---------- apontamentos + resumo IA ----------
function renderNotes() {
  $('#notes').innerHTML = [...room.notes].reverse().map(n => `
    <li><div class="row between"><h4>${esc(n.title)}</h4>
      ${n.author === me.name || room.owner === me.name ? `<button class="del" data-note="${esc(n.id)}" title="Apagar">✕</button>` : ''}</div>
      <p>${esc(n.text)}</p><span class="muted small">por ${esc(n.author)}</span></li>`).join('')
    || '<li class="muted">Ainda não há apontamentos. Partilha o primeiro!</li>';
}
$('#noteForm').onsubmit = e => {
  e.preventDefault();
  socket.emit('addNote', { title: $('#noteTitle').value, text: $('#noteText').value }, res => {
    if (res?.error) return toast(res.error);
    $('#noteTitle').value = ''; $('#noteText').value = '';
    bump({ notes: 1 });
  });
};
$('#notes').addEventListener('click', e => {
  const b = e.target.closest('[data-note]');
  if (b && confirm('Apagar este apontamento?')) socket.emit('removeNote', b.dataset.note);
});
socket.on('note', n => { if (!room) return; room.notes.push(n); renderNotes(); });
socket.on('noteRemoved', id => { if (!room) return; room.notes = room.notes.filter(n => n.id !== id); renderNotes(); });

function renderSummary() {
  const s = room.summary;
  $('#summary').innerHTML = !s ? '' : `<div class="summary">
    <h3>${esc(s.title)}</h3>
    ${s.sections.map(sec => `<h4>${esc(sec.heading)}</h4><ul>${sec.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`).join('')}
    <div class="must"><b>⭐ Tens mesmo de saber:</b><ul>${s.mustKnow.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
    <p class="muted small">Gerado por IA a pedido de ${esc(s.by)} a partir de ${s.notes} apontamento(s). Confirma sempre com o livro.</p></div>`;
}
$('#aiSummary').onclick = () => withAI($('#aiSummary'), 'A IA está a ler os apontamentos…', () => emitP('aiSummary'), () => toast('Resumo pronto! 📄'));
socket.on('summary', s => { if (!room) return; room.summary = s; renderSummary(); });

// ---------- IA: comum ----------
function renderAiQuota() {
  const q = ai.quota;
  $('#aiQuota').textContent = !ai.enabled ? '⚠️ IA desligada' : q?.limit == null ? '✨ IA ilimitada (Premium)' : `${q.left}/${q.limit} pedidos de IA esta semana`;
  $$('.ai-btn, .file-btn').forEach(b => b.classList.toggle('disabled', !ai.enabled));
}
socket.on('aiQuota', q => { if (!room) return; ai.quota = q; renderAiQuota(); });

async function withAI(button, waiting, call, onOk) {
  if (!ai.enabled) return toast('A IA ainda não está ligada nesta app.');
  const status = $('#aiStatus');
  button.disabled = true;
  const old = button.textContent;
  button.textContent = '⏳ …';
  toast(waiting, 60000);
  try {
    const res = await call();
    if (res?.error) { toast(res.error, 5000); if (status) status.textContent = res.error; return res; }
    $('#toast').classList.add('hidden');
    onOk?.(res);
    return res;
  } finally {
    button.disabled = false;
    button.textContent = old;
  }
}

// ---------- IA: perguntas a partir de foto ou texto ----------
$('#aiTextToggle').onclick = () => $('#aiTextBox').classList.toggle('hidden');
$('#aiFromText').onclick = () => makeQuestions({ text: $('#aiText').value }, $('#aiFromText'));
$('#aiPhoto').onchange = async e => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  try {
    const image = await shrinkImage(file);
    makeQuestions({ image }, $('#aiTextToggle'));
  } catch {
    toast('Não consegui abrir essa imagem.');
  }
};

async function makeQuestions(payload, button) {
  $('#aiStatus').textContent = '🤖 A IA está a ler a matéria e a criar perguntas… (pode demorar uns segundos)';
  const res = await withAI(button, '🤖 A criar perguntas…', () => emitP('aiQuestions', payload), r => {
    $('#aiStatus').textContent = `✅ ${r.count} perguntas novas sobre ${r.subject}. Já podes começar um duelo!`;
    $('#aiText').value = '';
    bump({ aiQuestions: 1 });
  });
  if (res?.error) $('#aiStatus').textContent = `⚠️ ${res.error}`;
}

// Reduz a foto para no máximo 1568 px (o que a IA precisa) e converte para JPEG.
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
    <li><span>${esc(q.question)} <span class="diff" title="Dificuldade">${DIFF[q.difficulty ?? 2]}</span>
      ${q.ai ? '<span class="tag-ai">IA</span>' : ''}
      <span class="muted small">— ${esc(q.topic ? `${q.topic} · ` : '')}${esc(q.author)}</span></span>
    ${q.author === me.name || room.owner === me.name ? `<button class="del" data-q="${esc(q.id)}" title="Apagar">✕</button>` : ''}</li>`).join('');
}
$('#qForm').onsubmit = e => {
  e.preventDefault();
  const opts = $$('#qForm .opt').map(i => i.value.trim());
  const right = Number(document.querySelector('#qForm input[name=right]:checked').value);
  if (!opts[right]) return ($('#quizError').textContent = 'A resposta certa que marcaste está vazia.');
  const kept = opts.map((text, i) => ({ text, i })).filter(o => o.text);
  const q = {
    question: $('#qText').value, options: kept.map(o => o.text), answer: kept.findIndex(o => o.i === right),
    topic: $('#qTopic').value, difficulty: Number($('#qDiff').value),
  };
  socket.emit('addQuestion', q, res => {
    if (res?.error) return ($('#quizError').textContent = res.error);
    $('#quizError').textContent = '';
    const topic = $('#qTopic').value;
    $('#qForm').reset();
    $('#qTopic').value = topic; // mantém o tema para a próxima
    $('#qText').focus();
    bump({ questions: 1 });
  });
};
$('#questions').addEventListener('click', e => {
  const b = e.target.closest('[data-q]');
  if (b && confirm('Apagar esta pergunta?')) socket.emit('removeQuestion', b.dataset.q);
});
socket.on('question', q => { if (!room) return; room.questions.push(q); renderQuestions(); });
socket.on('questionRemoved', id => { if (!room) return; room.questions = room.questions.filter(q => q.id !== id); renderQuestions(); });

// ---------- duelos ----------
$('#duelStart').onclick = () => socket.emit('duelStart', { mode: $('#duelMode').value }, res => {
  $('#quizError').textContent = res?.error ?? '';
});
function showDuel(html) {
  $('#quizSetup').classList.add('hidden');
  $('#duelArea').classList.remove('hidden');
  $('#duelArea').innerHTML = html;
}
function showDuelMessage(text) { showDuel(`<p class="q">${esc(text)}</p>`); }

socket.on('duelStarting', ({ by, mode, total, players }) => {
  if (!room) return;
  openTab('quiz');
  duel = { mode, players, playing: players.includes(me.name), lifelines: { fifty: true, ask: true }, alive: players };
  const title = mode === 'eliminacao' ? '🛡️ Eliminação: quem erra sai!' : `⚡ ${total} perguntas — prepara-te!`;
  showDuel(`<p class="muted">${esc(by)} começou um duelo</p><p class="q">${title}</p>
    ${mode === 'eliminacao' ? '<p class="muted small">As perguntas vão ficando mais difíceis. Tens um 50/50 e podes perguntar à sala uma vez.</p>' : ''}`);
});

socket.on('duelQuestion', q => {
  if (!room) return;
  openTab('quiz');
  duel ??= { mode: q.mode, players: q.alive, playing: false, lifelines: { fifty: false, ask: false }, alive: q.alive };
  duel.q = q; duel.pick = null; duel.alive = q.alive;
  const canPlay = q.mode === 'eliminacao' ? q.alive.includes(me.name) : true;
  const elim = q.mode === 'eliminacao';
  showDuel(`
    <p class="muted">Pergunta ${q.index + 1} de ${q.total} <span class="diff">${DIFF[q.difficulty ?? 2]}</span></p>
    <div class="bar"><div id="duelBar" style="width:100%"></div></div>
    <p class="q">${esc(q.question)}</p>
    <div class="answers">${q.options.map((o, i) => `<button data-a="${i}" ${canPlay ? '' : 'disabled'}>${esc(o)}<span class="vote"></span></button>`).join('')}</div>
    ${elim && canPlay ? `<div class="lifelines">
      <button id="lfFifty" ${duel.lifelines.fifty && q.options.length > 2 ? '' : 'disabled'}>✂️ 50/50</button>
      <button id="lfAsk" ${duel.lifelines.ask ? '' : 'disabled'}>🙋 Perguntar à sala</button></div>` : ''}
    ${elim ? `<div class="alive">${duel.players.map(p => `<span class="${q.alive.includes(p) ? '' : 'out'}">${esc(p)}</span>`).join('')}</div>` : ''}
    <p id="duelFeedback" class="muted">${canPlay ? '' : 'Foste eliminado — agora és espectador 👀'}</p>
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
    if (res?.error) return toast(res.error);
    duel.lifelines.fifty = false;
    for (const i of res.hide) $(`#duelArea [data-a="${i}"]`)?.classList.add('hidden-opt');
    return;
  }
  if (e.target.closest('#lfAsk')) {
    e.target.disabled = true;
    const res = await emitP('duelAsk');
    if (res?.error) return toast(res.error);
    duel.lifelines.ask = false;
    $$('#duelArea [data-a]').forEach((b, i) => {
      const pct = res.total ? Math.round((res.votes[i] / res.total) * 100) : 0;
      b.querySelector('.vote').textContent = res.total ? `${pct}% da sala` : '';
    });
    if (!res.total) toast('Ainda ninguém respondeu… estás por tua conta! 😅');
    return;
  }
  const b = e.target.closest('[data-a]');
  if (!b || !duel || duel.pick !== null) return;
  duel.pick = Number(b.dataset.a);
  b.classList.add('picked');
  $$('#duelArea [data-a]').forEach(x => (x.disabled = true));
  const res = await emitP('duelAnswer', duel.pick);
  if (res) $('#duelFeedback').textContent = 'Resposta enviada! A aguardar os outros…';
});

socket.on('duelReveal', ({ answer, scores, eliminated, qid }) => {
  if (!room || !duel) return;
  clearInterval(duelTick);
  $$('#duelArea [data-a]').forEach(b => {
    const i = Number(b.dataset.a);
    b.disabled = true;
    b.classList.add(i === answer ? 'right' : 'wrong');
  });
  const fb = $('#duelFeedback');
  const iWasPlaying = duel.mode !== 'eliminacao' || duel.q.alive.includes(me.name);
  if (fb && iWasPlaying) {
    const verdict = duel.pick === answer ? '✅ Certo!' : duel.pick === null ? '⏰ Não respondeste.' : '❌ Errado.';
    const extra = duel.mode === 'eliminacao'
      ? (eliminated.length ? `<br>💥 Eliminados: ${eliminated.map(esc).join(', ')}` : '<br>Ninguém saiu desta vez!')
      : `<br>${scores.slice(0, 3).map((s, i) => `${['🥇', '🥈', '🥉'][i]} ${esc(s.name)} ${s.points}`).join(' · ')}`;
    fb.innerHTML = verdict + extra;
    if (duel.pick !== answer && ai.enabled) {
      $('#duelExplain').innerHTML = '<button id="explainBtn" class="ai-btn">🤖 Porque é que errei?</button>';
      $('#explainBtn').onclick = async () => {
        $('#explainBtn').disabled = true;
        $('#explainBtn').textContent = '⏳ A pensar…';
        const res = await emitP('aiExplain', { qid, chosen: duel.pick });
        $('#duelExplain').innerHTML = res?.error
          ? `<p class="error">${esc(res.error)}</p>`
          : `<div class="explain">🤖 ${esc(res.explanation)}</div>`;
      };
    }
  }
});

socket.on('duelEnd', ({ mode, ranking, winners }) => {
  if (!room) return;
  clearInterval(duelTick);
  const won = winners.includes(me.name);
  if (won) bump({ duelWins: 1, elimWins: mode === 'eliminacao' ? 1 : 0 });
  const rows = mode === 'eliminacao'
    ? ranking.map(r => `<li><b>${esc(r.name)}</b> — ${r.points} certa${r.points === 1 ? '' : 's'}${r.survived ? ' 🛡️' : ''}</li>`)
    : ranking.map(r => `<li><b>${esc(r.name)}</b> — ${r.points} pontos</li>`);
  showDuel(`<p class="q">${won ? '🏆 Ganhaste!' : '🏁 Fim do duelo!'}</p>
    ${winners.length ? `<p>Vencedor${winners.length > 1 ? 'es' : ''}: <b>${winners.map(esc).join(', ')}</b></p>` : '<p>Ninguém sobreviveu 😅</p>'}
    <ol>${rows.join('') || '<li>Ninguém respondeu 😴</li>'}</ol>
    <button id="duelBack">Voltar</button>`);
  $('#duelBack').onclick = () => { $('#duelArea').classList.add('hidden'); $('#quizSetup').classList.remove('hidden'); };
  duel = null;
});

// ---------- previsão de nota ----------
function renderGradeTests() {
  const sel = $('#gradeTest');
  const v = sel.value;
  sel.innerHTML = '<option value="">Sem teste</option>' + room.tests.map(t => `<option value="${esc(t.id)}">${esc(t.subject)} (${whenText(t.daysLeft)})</option>`).join('');
  if ([...sel.options].some(o => o.value === v)) sel.value = v;
  else if (room.tests[0]) sel.value = room.tests[0].id;
}
$('#aiGrade').onclick = () => withAI($('#aiGrade'), '🔮 A analisar as tuas respostas…', () => emitP('aiGrade', { testId: $('#gradeTest').value }), g => {
  $('#grade').innerHTML = `<div class="grade">
    <div class="row wrap"><span class="score">~${g.estimate}%</span>
      <span class="muted">confiança ${esc(g.confidence)}<br>com base em ${g.answered} respostas (${g.accuracy}% certas)</span></div>
    <p><b>${esc(g.message)}</b></p>
    <div class="cols">
      <div><b>💪 Pontos fortes</b><ul>${g.strengths.map(s => `<li>${esc(s)}</li>`).join('') || '<li>—</li>'}</ul></div>
      <div><b>🎯 A melhorar</b><ul>${g.toImprove.map(s => `<li>${esc(s)}</li>`).join('') || '<li>—</li>'}</ul></div>
    </div>
    <b>🗓️ Plano</b><ol>${g.plan.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <p class="muted small">É só uma estimativa feita por IA — o que conta é o que estudas! 😉</p></div>`;
});

// ---------- cacifo ----------
function openLocker() {
  $('#lockerMinutes').textContent = profile.minutes;
  const cell = (item, kind, inner, label) => {
    const ok = isUnlocked(item, profile.minutes, profile.achieved);
    const sel = (kind === 'avatar' ? profile.avatar : profile.frame) === item.id;
    return `<button data-${kind}="${esc(item.id)}" class="${ok ? '' : 'locked'} ${sel ? 'selected' : ''}" ${ok ? '' : 'disabled'}>
      ${inner}${label}${ok ? '' : `<br>${esc(lockLabel(item))}`}</button>`;
  };
  $('#avatarGrid').innerHTML = AVATARS.map(a => cell(a, 'avatar', `<span class="avatar big frame-${esc(profile.frame)}">${a.id}</span>`, '')).join('');
  $('#frameGrid').innerHTML = FRAMES.map(f => cell(f, 'frame', `<span class="avatar big frame-${f.id}">${esc(profile.avatar)}</span>`, esc(f.name))).join('');
  if (!$('#locker').open) $('#locker').showModal();
}
$('#openLocker').onclick = openLocker;
$('#openLocker2').onclick = openLocker;
$('#locker').addEventListener('click', e => {
  const a = e.target.closest('[data-avatar]');
  const f = e.target.closest('[data-frame]');
  if (!a && !f) return;
  if (a) profile.avatar = a.dataset.avatar;
  if (f) profile.frame = f.dataset.frame;
  saveProfile();
  openLocker();
  renderHome();
  if (room) socket.emit('profile', { avatar: profile.avatar, frame: profile.frame });
});

// entrar diretamente por link (…/#CODIGO)
const fromHash = location.hash.slice(1).toUpperCase();
if (/^[A-Z0-9]{6}$/.test(fromHash)) $('#code').value = fromHash;

socket.on('disconnect', () => {
  if (!room) return;
  toast('Ligação perdida… a recarregar.', 2000);
  setTimeout(() => location.reload(), 2000);
});
