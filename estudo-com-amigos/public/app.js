import { AVATARS, FRAMES, isUnlocked } from './cosmetics.js';

const $ = s => document.querySelector(s);
const socket = io({ autoConnect: true });

// ---------- perfil guardado no browser ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
};
const profile = store.get('profile', { name: '', avatar: '🙂', frame: 'none', minutes: 0 });
let recent = store.get('recentRooms', []);
const saveProfile = () => store.set('profile', profile);

let room = null;
let me = null;
let tick = null;
let duelTick = null;
let duelPick = null;

// ---------- utilidades ----------
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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

// ---------- entrada ----------
$('#name').value = profile.name;
function renderHome() {
  $('#previewAvatar').outerHTML = `<span id="previewAvatar" class="avatar big frame-${esc(profile.frame)}">${esc(profile.avatar)}</span>`;
  $('#homeMinutes').textContent = `⏱️ ${profile.minutes} min de foco`;
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
  const payload = { profile, name: $('#roomName').value, code: $('#code').value };
  socket.emit(kind === 'create' ? 'createRoom' : 'joinRoom', payload, res => {
    if (res.error) return ($('#homeError').textContent = res.error);
    $('#homeError').textContent = '';
    openRoom(res.room, res.me);
  });
}

// ---------- sala ----------
function openRoom(r, m) {
  room = r; me = m;
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
  renderQuestions();
  renderRanking();
  renderTimer();
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
  if (!b) return;
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('hidden', t.id !== `tab-${b.dataset.tab}`));
  if (b.dataset.tab === 'ranking') renderRanking();
});

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

// estou na página ou não?
document.addEventListener('visibilitychange', () => {
  if (room) socket.emit('status', document.hidden ? 'away' : 'focused');
});

// chat
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

// temporizador
function renderTimer() {
  const t = room.timer;
  const box = $('#timerBox');
  box.className = `timer ${t.state}`;
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

socket.on('focusDone', ({ minutes, rewarded, stats }) => {
  if (!room) return;
  room.stats = stats;
  renderRanking();
  if (rewarded.includes(me.name)) {
    const before = profile.minutes;
    profile.minutes += minutes; saveProfile();
    const unlocked = [...AVATARS, ...FRAMES].filter(i => i.need > before && i.need <= profile.minutes);
    toast(`🎉 Ganhaste ${minutes} min de foco!${unlocked.length ? ' Desbloqueaste coisas novas no cacifo 🎨' : ''}`, 5000);
  } else {
    toast('Desta vez distraíste-te… na próxima consegues! 💪', 5000);
  }
});
socket.on('breakDone', () => room && toast('A pausa acabou. Mais uma ronda? 📚'));

// apontamentos
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
  });
};
$('#notes').addEventListener('click', e => {
  const b = e.target.closest('[data-note]');
  if (b && confirm('Apagar este apontamento?')) socket.emit('removeNote', b.dataset.note);
});
socket.on('note', n => { if (!room) return; room.notes.push(n); renderNotes(); });
socket.on('noteRemoved', id => { if (!room) return; room.notes = room.notes.filter(n => n.id !== id); renderNotes(); });

// perguntas
function renderQuestions() {
  $('#qCount').textContent = room.questions.length;
  $('#questions').innerHTML = [...room.questions].reverse().map(q => `
    <li><span>${esc(q.question)} <span class="muted small">— ${esc(q.author)}</span></span>
    ${q.author === me.name || room.owner === me.name ? `<button class="del" data-q="${esc(q.id)}" title="Apagar">✕</button>` : ''}</li>`).join('');
}
$('#qForm').onsubmit = e => {
  e.preventDefault();
  const opts = [...document.querySelectorAll('#qForm .opt')].map(i => i.value.trim());
  const right = Number(document.querySelector('#qForm input[name=right]:checked').value);
  if (!opts[right]) return ($('#quizError').textContent = 'A resposta certa que marcaste está vazia.');
  // tira as opções vazias mantendo a resposta certa
  const kept = opts.map((text, i) => ({ text, i })).filter(o => o.text);
  const q = { question: $('#qText').value, options: kept.map(o => o.text), answer: kept.findIndex(o => o.i === right) };
  socket.emit('addQuestion', q, res => {
    if (res?.error) return ($('#quizError').textContent = res.error);
    $('#quizError').textContent = '';
    $('#qForm').reset();
    $('#qText').focus();
  });
};
$('#questions').addEventListener('click', e => {
  const b = e.target.closest('[data-q]');
  if (b && confirm('Apagar esta pergunta?')) socket.emit('removeQuestion', b.dataset.q);
});
socket.on('question', q => { if (!room) return; room.questions.push(q); renderQuestions(); });
socket.on('questionRemoved', id => { if (!room) return; room.questions = room.questions.filter(q => q.id !== id); renderQuestions(); });

// duelo
$('#duelStart').onclick = () => socket.emit('duelStart', null, res => {
  $('#quizError').textContent = res?.error ?? '';
});
function showDuel(html) {
  $('#quizSetup').classList.add('hidden');
  $('#duelArea').classList.remove('hidden');
  $('#duelArea').innerHTML = html;
}
function showDuelMessage(text) { showDuel(`<p class="q">${esc(text)}</p>`); }
function goToQuizTab() { document.querySelector('.tabs button[data-tab=quiz]').click(); }

socket.on('duelStarting', ({ by, total }) => {
  if (!room) return;
  goToQuizTab();
  showDuel(`<p class="muted">${esc(by)} começou um duelo</p><p class="q">⚔️ ${total} perguntas… prepara-te!</p>`);
});
socket.on('duelQuestion', q => {
  if (!room) return;
  goToQuizTab();
  duelPick = null;
  showDuel(`
    <p class="muted">Pergunta ${q.index + 1} de ${q.total}</p>
    <div class="bar"><div id="duelBar" style="width:100%"></div></div>
    <p class="q">${esc(q.question)}</p>
    <div class="answers">${q.options.map((o, i) => `<button data-a="${i}">${esc(o)}</button>`).join('')}</div>
    <p id="duelFeedback" class="muted"></p>`);
  const total = q.endsAt - Date.now();
  clearInterval(duelTick);
  duelTick = setInterval(() => {
    const bar = $('#duelBar');
    if (!bar) return clearInterval(duelTick);
    bar.style.width = `${Math.max(0, (q.endsAt - Date.now()) / total) * 100}%`;
  }, 200);
});
$('#duelArea').addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b || duelPick !== null) return;
  duelPick = Number(b.dataset.a);
  b.classList.add('picked');
  document.querySelectorAll('#duelArea [data-a]').forEach(x => (x.disabled = true));
  socket.emit('duelAnswer', duelPick, res => {
    if (res) $('#duelFeedback').textContent = 'Resposta enviada! A aguardar os outros…';
  });
});
socket.on('duelReveal', ({ answer, scores }) => {
  if (!room) return;
  clearInterval(duelTick);
  document.querySelectorAll('#duelArea [data-a]').forEach(b => {
    const i = Number(b.dataset.a);
    b.disabled = true;
    b.classList.add(i === answer ? 'right' : 'wrong');
  });
  const fb = $('#duelFeedback');
  if (fb) fb.innerHTML = (duelPick === answer ? '✅ Certo!' : duelPick === null ? '⏰ Não respondeste.' : '❌ Errado.')
    + `<br>${scores.slice(0, 3).map((s, i) => `${['🥇', '🥈', '🥉'][i]} ${esc(s.name)} ${s.points}`).join(' · ')}`;
});
socket.on('duelEnd', ({ ranking, stats }) => {
  if (!room) return;
  room.stats = stats;
  showDuel(`<p class="q">🏆 Fim do duelo!</p>
    <ol>${ranking.map(r => `<li><b>${esc(r.name)}</b> — ${r.points} pontos</li>`).join('') || '<li>Ninguém respondeu 😴</li>'}</ol>
    <button id="duelBack">Voltar</button>`);
  $('#duelBack').onclick = () => { $('#duelArea').classList.add('hidden'); $('#quizSetup').classList.remove('hidden'); };
  renderRanking();
});

// ranking
function renderRanking() {
  const rows = Object.entries(room.stats).sort((a, b) => b[1].minutes - a[1].minutes || b[1].duelWins - a[1].duelWins);
  $('#rankingBody').innerHTML = rows.map(([name, s], i) =>
    `<tr><td>${i + 1}</td><td>${esc(name)}</td><td>${s.minutes}</td><td>${s.sessions}</td><td>${s.duelWins}</td></tr>`).join('')
    || '<tr><td colspan="5" class="muted">Ainda ninguém estudou aqui.</td></tr>';
}

// ---------- cacifo ----------
function openLocker() {
  $('#lockerMinutes').textContent = profile.minutes;
  $('#avatarGrid').innerHTML = AVATARS.map(a => {
    const ok = isUnlocked(a, profile.minutes);
    return `<button data-avatar="${a.id}" class="${ok ? '' : 'locked'} ${profile.avatar === a.id ? 'selected' : ''}" ${ok ? '' : 'disabled'}>
      <span class="avatar big frame-${esc(profile.frame)}">${a.id}</span>${ok ? '' : `🔒 ${a.need} min`}</button>`;
  }).join('');
  $('#frameGrid').innerHTML = FRAMES.map(f => {
    const ok = isUnlocked(f, profile.minutes);
    return `<button data-frame="${f.id}" class="${ok ? '' : 'locked'} ${profile.frame === f.id ? 'selected' : ''}" ${ok ? '' : 'disabled'}>
      <span class="avatar big frame-${f.id}">${esc(profile.avatar)}</span>${esc(f.name)}${ok ? '' : `<br>🔒 ${f.need} min`}</button>`;
  }).join('');
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

socket.on('disconnect', () => { if (room) toast('Ligação perdida… a recarregar.', 2000); setTimeout(() => room && location.reload(), 2000); });
