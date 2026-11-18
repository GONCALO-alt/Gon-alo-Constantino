// Funcionalidades Premium e de acompanhamento:
// passe Premium (teste grátis, chama, turma), janela "isto é Premium", tutor com voz,
// modo exame, correção de respostas, notas (antes/depois) e relatório para os pais.
import { t, getLang, locale } from './i18n.js';
import { SUBJECTS } from './plan.js';
import { icon } from './ui-icons.js';

const DAY = 86_400_000;

export function initExtras(ctx) {
  const { $, $$, esc, toast, emitP, errText, socket, store, profile, saveProfile, show, getRoom, getView, planAnswers, subjName, shrinkImage } = ctx;

  // ---------- passe Premium ----------
  let premium = null; // { kind, exp }
  const isPremium = () => !!premium && premium.exp > Date.now();
  const fmtDate = ts => new Date(ts).toLocaleDateString(locale(), { day: 'numeric', month: 'long' });

  async function auth() {
    const pass = store.get('premiumPass', null);
    if (!pass) { premium = null; return refresh(); }
    const res = await emitP('auth', { pass });
    premium = res?.premium ?? null;
    if (!premium) store.set('premiumPass', null);
    refresh();
  }
  socket.on('connect', auth);

  function savePass(res) {
    if (!res?.pass) return false;
    store.set('premiumPass', res.pass);
    premium = res.premium;
    toast(t('toast.premiumOn', { date: fmtDate(premium.exp) }), 5000);
    refresh();
    return true;
  }

  async function claimTrial() {
    const res = await emitP('claimTrial');
    if (res?.error) { store.set('trialUsed', true); toast(errText(res)); refresh(); return; }
    store.set('trialUsed', true);
    savePass(res);
    closeUpsell();
  }

  async function claimStreak() {
    const res = await emitP('claimStreak');
    if (res?.error) return toast(errText(res));
    savePass(res);
  }

  const trialAvailable = () => !store.get('trialUsed', false) && !isPremium() && !!planAnswers();

  // sinal de Premium na barra e na carteira
  function refresh() {
    document.body.classList.toggle('is-premium', isPremium());
    $$('[data-section="premium"] span').forEach(s => { s.textContent = t('view.premium'); });
    $$('[data-section="premium"]').forEach(b => b.classList.toggle('has-premium', isPremium()));
    const v = getView();
    if (v === 'premium') renderPremiumExtras();
    if (v === 'plano') renderPlanTrial();
    if (v === 'exame') renderExamSetup();
    if (v === 'corrigir') renderCorrFree();
    renderVoiceButtons();
  }

  // ---------- janela "isto é Premium" (aparece quando faz falta, sem bloquear o essencial) ----------
  function upsell(textKey, params) {
    $('#upsellTitle').textContent = t('up.title');
    $('#upsellText').textContent = t(textKey, params);
    $('#upsellActions').innerHTML = `
      ${trialAvailable() ? `<button data-up="trial">${t('up.trial')}</button>` : ''}
      <button data-up="see" class="${trialAvailable() ? 'ghost' : ''}">${t('up.see')}</button>
      <button data-up="close" class="ghost">${t('up.close')}</button>`;
    $('#upsell').classList.remove('hidden');
  }
  const closeUpsell = () => $('#upsell').classList.add('hidden');
  $('#upsellClose').onclick = closeUpsell;
  $('#upsell').addEventListener('click', e => {
    if (e.target === $('#upsell')) return closeUpsell();
    const b = e.target.closest('[data-up]');
    if (!b) return;
    if (b.dataset.up === 'trial') claimTrial();
    if (b.dataset.up === 'see') { closeUpsell(); show('premium'); }
    if (b.dataset.up === 'close') closeUpsell();
  });

  // ---------- 11: oferta do teste grátis depois do plano ----------
  function renderPlanTrial() {
    const box = $('#planTrial');
    const show_ = trialAvailable() && !store.get('trialDismissed', false);
    box.classList.toggle('hidden', !show_);
    if (!show_) return;
    box.innerHTML = `<div><b>${t('trial.title')}</b><p>${t('trial.text')}</p></div>
      <div class="row"><button data-trial="go">${t('trial.btn')}</button><button data-trial="later" class="ghost">${t('trial.later')}</button></div>`;
  }
  $('#planTrial').addEventListener('click', e => {
    const b = e.target.closest('[data-trial]');
    if (!b) return;
    if (b.dataset.trial === 'go') claimTrial();
    else { store.set('trialDismissed', true); renderPlanTrial(); }
  });

  // ---------- 10, 12, 13: página Premium ----------
  function renderPremiumExtras() {
    $('#premStatus').innerHTML = isPremium()
      ? `<div class="prem-on">${t('prem.active', { date: fmtDate(premium.exp) })} · ${t(`prem.kind.${premium.kind}`)}</div>`
      : '';
    $('#cmpPremium').textContent = new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR' }).format(2.99);
    // teste grátis
    const used = store.get('trialUsed', false);
    $('#earnTrial').innerHTML = `<span>${icon('gift')} ${t('earnPrem.trial')}</span>
      ${used ? `<em>${t('earnPrem.trialUsed')}</em>` : !planAnswers() ? `<button data-ob="start" class="ghost small-btn">${t('earnPrem.needPlan')}</button>` : isPremium() ? '' : `<button data-claim="trial" class="small-btn">${t('earnPrem.trialBtn')}</button>`}`;
    // chama
    const room = getRoom();
    const streak = room?.streak?.streak ?? 0;
    $('#earnStreak').innerHTML = `<span>${icon('flame')} ${t('earnPrem.streak')}</span>
      ${room ? `<div class="mini-bar"><div style="width:${Math.min(100, Math.round(((streak % 30) || (streak >= 30 ? 30 : 0)) / 30 * 100))}%"></div></div>
        <em>${t('earnPrem.streakProgress', { n: Math.min(streak, 30) })}</em>${streak >= 30 ? `<button data-claim="streak" class="small-btn">${t('earnPrem.streakBtn')}</button>` : ''}`
      : `<em>${t('earnPrem.noRoom')}</em>`}`;
    // turma
    $('#earnTeam').innerHTML = `<span>${icon('users')} ${t('earnPrem.team')}</span>
      ${room ? `<em>${t('earnPrem.teamProgress', { n: team.count })}</em>` : `<em>${t('earnPrem.noRoom')}</em>`}`;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-claim]');
    if (!b) return;
    if (b.dataset.claim === 'trial') claimTrial();
    if (b.dataset.claim === 'streak') claimStreak();
  });

  // ---------- 13: Premium da turma ----------
  let team = { count: 0, need: 5, active: false };
  socket.on('teamPremium', x => { team = x; renderTeam(); if (getView() === 'premium') renderPremiumExtras(); });
  function renderTeam() {
    const box = $('#teamBox');
    if (!getRoom()) { box.innerHTML = ''; return; }
    const pct = Math.round((team.count / team.need) * 100);
    box.innerHTML = `<b>${t('team.title')}</b>
      <div class="mini-bar"><div style="width:${Math.min(100, pct)}%"></div></div>
      <span class="muted small">${team.active ? t('team.active') : t('team.progress', { n: team.count, need: team.need })}</span>`;
  }

  // ---------- 1: tutor com voz ----------
  const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  let speakOn = store.get('speakOn', false);
  let listening = null;

  function renderVoiceButtons() {
    $('#tutorSpeak').innerHTML = icon(speakOn && isPremium() ? 'speaker' : 'speakerOff');
    $('#tutorSpeak').setAttribute('aria-pressed', String(speakOn && isPremium()));
    $('#tutorMic').classList.toggle('on', !!listening);
  }
  $('#tutorSpeak').onclick = () => {
    if (!isPremium()) return upsell('up.voice');
    if (!('speechSynthesis' in globalThis)) return toast(t('voice.unsupported'));
    speakOn = !speakOn;
    store.set('speakOn', speakOn);
    if (!speakOn) speechSynthesis.cancel();
    renderVoiceButtons();
  };
  $('#tutorMic').onclick = () => {
    if (!isPremium()) return upsell('up.voice');
    if (!Recognition) return toast(t('voice.unsupported'));
    if (listening) { listening.stop(); return; }
    const rec = new Recognition();
    rec.lang = locale();
    rec.interimResults = true;
    rec.onresult = e => {
      const text = [...e.results].map(r => r[0].transcript).join('');
      $('#tutorInput').value = text;
      if (e.results[e.results.length - 1].isFinal) ctx.askTutor(text);
    };
    rec.onend = () => { listening = null; renderVoiceButtons(); };
    rec.onerror = () => { listening = null; renderVoiceButtons(); };
    listening = rec;
    rec.start();
    toast(t('voice.listening'), 2500);
    renderVoiceButtons();
  };
  function speak(text) {
    if (!speakOn || !isPremium() || !('speechSynthesis' in globalThis)) return;
    speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, '').replace(/[*_#>]/g, '').replace(/^\s*[-•]\s+/gm, '');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = locale();
    speechSynthesis.speak(u);
  }

  // ---------- 2: modo exame ----------
  let exam = null; // { title, questions, answers: [], endsAt, index, done }
  let examTick = null;
  const subjectOptions = (sel, current) => {
    const mine = planAnswers()?.subjects ?? [];
    const list = [...mine, ...SUBJECTS.filter(s => !mine.includes(s))];
    sel.innerHTML = list.map(s => `<option value="${s}" ${s === current ? 'selected' : ''}>${esc(subjName(s))}</option>`).join('');
  };

  function renderExamSetup() {
    if (exam && !exam.done) return;
    subjectOptions($('#examSubject'), $('#examSubject').value || planAnswers()?.hard?.[0]);
    $('#examFree').textContent = isPremium() ? t('exam.freePrem') : t('exam.free');
    const hist = store.get('examHistory', []);
    $('#examHistory').innerHTML = hist.length ? `<h3>${t('exam.history')}</h3><ul class="hist">${hist.slice(0, 5).map(h =>
      `<li><span>${esc(subjName(h.subject))}</span><span class="muted small">${new Date(h.date).toLocaleDateString(locale())}</span><b>${h.pct}%</b></li>`).join('')}</ul>` : '';
  }

  $('#examStart').onclick = async () => {
    const btn = $('#examStart');
    btn.disabled = true;
    toast(t('exam.making'), 60000);
    const subject = $('#examSubject').value;
    const res = await emitP('aiExam', {
      subject: subjName(subject), year: planAnswers()?.year ?? '', count: Number($('#examCount').value),
      topic: $('#examTopic').value, lang: getLang(),
    });
    btn.disabled = false;
    $('#toast').classList.add('hidden');
    if (res?.error) return res.quota ? upsell('up.exam') : toast(errText(res), 5000);
    exam = { ...res.exam, subject, answers: res.exam.questions.map(() => null), index: 0, endsAt: Date.now() + Number($('#examTime').value) * 60_000, done: false };
    $('#examSetup').classList.add('hidden');
    $('#examRun').classList.remove('hidden');
    clearInterval(examTick);
    examTick = setInterval(() => {
      const left = exam.endsAt - Date.now();
      const el = $('#examClock');
      if (el) el.textContent = fmtClock(left);
      if (left <= 0) { toast(t('exam.timeUp'), 4000); finishExam(); }
    }, 500);
    renderExamQuestion();
  };
  const fmtClock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

  function renderExamQuestion() {
    const q = exam.questions[exam.index];
    const answered = exam.answers.filter(a => a !== null).length;
    $('#examRun').innerHTML = `
      <div class="exam-top"><b>${esc(exam.title)}</b><span class="exam-clock" id="examClock">${fmtClock(exam.endsAt - Date.now())}</span></div>
      <div class="exam-dots">${exam.questions.map((_, i) => `<button data-goq="${i}" class="${i === exam.index ? 'cur' : ''} ${exam.answers[i] !== null ? 'ok' : ''}">${i + 1}</button>`).join('')}</div>
      <p class="muted small">${t('duel.qOf', { i: exam.index + 1, n: exam.questions.length })} · ${t('exam.answered', { n: answered, t: exam.questions.length })}</p>
      <p class="exam-q">${esc(q.question)}</p>
      <div class="exam-opts">${q.options.map((o, i) => `<button data-opt="${i}" class="${exam.answers[exam.index] === i ? 'picked' : ''}"><b>${'ABCD'[i]}</b> ${esc(o)}</button>`).join('')}</div>
      <div class="row between exam-nav">
        <button data-move="-1" class="ghost" ${exam.index === 0 ? 'disabled' : ''}>${icon('arrowLeft')}</button>
        ${exam.index < exam.questions.length - 1 ? `<button data-move="1" class="ghost">${icon('arrowRight')}</button>` : ''}
        <button data-finish="1">${t('exam.finish')}</button>
      </div>`;
  }

  $('#examRun').addEventListener('click', e => {
    if (!exam) return;
    const o = e.target.closest('[data-opt]');
    const m = e.target.closest('[data-move]');
    const g = e.target.closest('[data-goq]');
    if (e.target.closest('[data-again]')) { exam = null; $('#examRun').classList.add('hidden'); $('#examSetup').classList.remove('hidden'); renderExamSetup(); return; }
    if (exam.done) return;
    if (o) {
      exam.answers[exam.index] = Number(o.dataset.opt);
      if (exam.index < exam.questions.length - 1) exam.index++;
      renderExamQuestion();
    }
    if (m) { exam.index = Math.max(0, Math.min(exam.questions.length - 1, exam.index + Number(m.dataset.move))); renderExamQuestion(); }
    if (g) { exam.index = Number(g.dataset.goq); renderExamQuestion(); }
    if (e.target.closest('[data-finish]')) finishExam();
  });

  function finishExam() {
    if (!exam || exam.done) return;
    exam.done = true;
    clearInterval(examTick);
    const right = exam.questions.filter((q, i) => exam.answers[i] === q.answer).length;
    const pct = Math.round((right / exam.questions.length) * 100);
    const g20 = Math.round((pct / 5)) ;
    const hist = store.get('examHistory', []);
    hist.unshift({ subject: exam.subject, pct, date: Date.now() });
    store.set('examHistory', hist.slice(0, 20));
    profile.counters.answered = (profile.counters.answered ?? 0) + exam.questions.length;
    profile.counters.right = (profile.counters.right ?? 0) + right;
    saveProfile();
    $('#examRun').innerHTML = `
      <div class="exam-result ${pct >= 50 ? 'pass' : 'fail'}"><span>${icon(pct >= 90 ? 'trophy' : pct >= 50 ? 'star' : 'trendUp')}</span>
        <b>${t('exam.result', { p: pct, g: g20 })}</b><small>${esc(exam.title)}</small></div>
      <h3>${t('exam.review')}</h3>
      <ol class="exam-review">${exam.questions.map((q, i) => {
        const a = exam.answers[i];
        const ok = a === q.answer;
        return `<li class="${ok ? 'ok' : 'bad'}"><b>${icon(ok ? 'checkCircle' : 'xCircle', ok ? 'ok' : 'bad')} ${esc(q.question)}</b>
          ${ok ? '' : `<span>${esc(t('exam.yours', { a: a === null ? t('exam.none') : q.options[a] }))}</span><span>${esc(t('exam.rightIs', { a: q.options[q.answer] }))}</span>`}
          <em>${esc(q.explanation)}</em></li>`;
      }).join('')}</ol>
      <button data-again="1">${t('exam.again')}</button>`;
  }

  // ---------- 3: correção de respostas ----------
  let corrImage = null;
  function renderCorrFree() { $('#corrFree').textContent = isPremium() ? t('corr.freePrem') : t('corr.free'); }
  $('#corrPhoto').onchange = async e => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try { corrImage = await shrinkImage(f); $('#corrPhotoName').textContent = f.name; }
    catch { toast(t('ai.badImage')); }
  };
  $('#corrSend').onclick = async () => {
    const btn = $('#corrSend');
    btn.disabled = true;
    $('#corrResult').innerHTML = `<p class="muted">${t('corr.working')}</p>`;
    const res = await emitP('aiCorrect', {
      question: $('#corrQuestion').value, answer: $('#corrAnswer').value, image: corrImage,
      subject: subjName(planAnswers()?.subjects?.[0] ?? ''), lang: getLang(),
    });
    btn.disabled = false;
    if (res?.error) {
      $('#corrResult').innerHTML = `<p class="muted">${t('corr.empty')}</p>`;
      return res.quota ? upsell('up.corr') : toast(errText(res), 5000);
    }
    corrImage = null;
    $('#corrPhotoName').textContent = '';
    const r = res.result;
    const list = a => a.map(x => `<li>${esc(x)}</li>`).join('');
    $('#corrResult').innerHTML = `
      <div class="score-ring" style="--p:${r.score}"><b>${r.score}</b><small>/100</small></div>
      <p class="verdict">${esc(r.verdict)}</p>
      ${r.strengths.length ? `<h4>${t('corr.strengths')}</h4><ul>${list(r.strengths)}</ul>` : ''}
      ${r.improve.length ? `<h4>${t('corr.improve')}</h4><ul>${list(r.improve)}</ul>` : ''}
      <h4>${t('corr.model')}</h4><p class="model">${esc(r.modelAnswer)}</p>
      <h4>${t('corr.tip')}</h4><p>${esc(r.tip)}</p>`;
    renderCorrFree();
  };

  // ---------- 9: notas, antes e depois ----------
  if (!store.get('startedAt', null)) store.set('startedAt', Date.now());
  const grades = () => store.get('grades', []);
  const pctOf = g => Math.round((g.value / g.scale) * 100);
  const avg = list => list.length ? Math.round(list.reduce((s, g) => s + pctOf(g), 0) / list.length) : null;

  $('#gradeDate').max = new Date().toISOString().slice(0, 10);
  $('#gradeAdd').onclick = () => {
    const value = Number($('#gradeValue').value);
    const scale = Number($('#gradeScale').value);
    const date = $('#gradeDate').value || new Date().toISOString().slice(0, 10);
    if (!(value >= 0 && value <= scale) || $('#gradeValue').value === '') return ($('#gradeError').textContent = t('grades.invalid'));
    $('#gradeError').textContent = '';
    const list = grades();
    list.push({ id: Date.now().toString(36), subject: $('#gradeSubject').value, value, scale, date });
    list.sort((a, b) => a.date.localeCompare(b.date));
    store.set('grades', list);
    $('#gradeValue').value = '';
    renderGrades();
  };
  $('#gradesList').addEventListener('click', e => {
    const b = e.target.closest('[data-delgrade]');
    if (!b) return;
    store.set('grades', grades().filter(g => g.id !== b.dataset.delgrade));
    renderGrades();
  });

  function renderGrades() {
    subjectOptions($('#gradeSubject'), $('#gradeSubject').value);
    const list = grades();
    const started = new Date(store.get('startedAt', Date.now())).toISOString().slice(0, 10);
    const before = list.filter(g => g.date < started);
    const after = list.filter(g => g.date >= started);
    const a = avg(before), b = avg(after);
    $('#gradesCompare').innerHTML = !list.length ? `<p class="muted">${t('grades.empty')}</p>` : `
      <div class="cmp-box"><small>${t('grades.before')}</small><b>${a ?? '—'}${a != null ? '%' : ''}</b></div>
      <div class="cmp-arrow ${a != null && b != null ? (b > a ? 'up' : b < a ? 'down' : '') : ''}">${a != null && b != null ? (b > a ? t('grades.up', { d: b - a }) : b < a ? t('grades.down', { d: b - a }) : t('grades.same')) : '→'}</div>
      <div class="cmp-box hl"><small>${t('grades.after')}</small><b>${b ?? '—'}${b != null ? '%' : ''}</b></div>
      ${a == null || b == null ? `<p class="muted small full">${t('grades.needMore')}</p>` : ''}`;
    $('#gradesChart').innerHTML = chart(list, started);
    $('#gradesList').innerHTML = [...list].reverse().map(g => `<li><span class="sw" style="background:${color(g.subject)}"></span>
      <span>${esc(subjName(g.subject))}</span><span class="muted small">${new Date(`${g.date}T12:00:00`).toLocaleDateString(locale())}</span>
      <b>${g.value}/${g.scale}</b><button class="del" data-delgrade="${g.id}" title="${t('btn.delete')}">${icon('x')}</button></li>`).join('');
  }

  const PALETTE = ['#5a3ce6', '#ff8a3d', '#1fa36b', '#e0435a', '#2f7de0', '#c97f00', '#9b4dff', '#0e9aa7'];
  const color = s => PALETTE[Math.max(0, SUBJECTS.indexOf(s)) % PALETTE.length];

  // Gráfico de linhas simples em SVG: uma linha por disciplina, 0–100%, linha a tracejado no dia em que começaste
  function chart(list, started) {
    if (list.length < 2) return '';
    const W = 560, H = 220, L = 34, R = 10, T = 12, B = 28;
    const times = list.map(g => new Date(`${g.date}T12:00:00`).getTime());
    const sT = new Date(`${started}T12:00:00`).getTime();
    const min = Math.min(...times, sT), max = Math.max(...times, sT);
    const x = ts => L + ((ts - min) / Math.max(1, max - min)) * (W - L - R);
    const y = p => T + (1 - p / 100) * (H - T - B);
    const grid = [0, 50, 100].map(p => `<line x1="${L}" x2="${W - R}" y1="${y(p)}" y2="${y(p)}" class="grid"/><text x="${L - 6}" y="${y(p) + 4}" text-anchor="end" class="axis">${p}%</text>`).join('');
    const bySubj = {};
    list.forEach(g => (bySubj[g.subject] ??= []).push(g));
    const lines = Object.entries(bySubj).map(([s, gs]) => {
      const pts = gs.map(g => [x(new Date(`${g.date}T12:00:00`).getTime()), y(pctOf(g))]);
      return `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${color(s)}" stroke-width="2.5" stroke-linejoin="round"/>
        ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${color(s)}"/>`).join('')}`;
    }).join('');
    const start = `<line x1="${x(sT)}" x2="${x(sT)}" y1="${T}" y2="${H - B}" class="start"/><text x="${x(sT) > W / 2 ? x(sT) - 4 : x(sT) + 4}" y="${H - B + 16}" text-anchor="${x(sT) > W / 2 ? 'end' : 'start'}" class="axis">Shoalmates</text>`;
    const legend = Object.keys(bySubj).map(s => `<span><i style="background:${color(s)}"></i>${esc(subjName(s))}</span>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(t('grades.title'))}">${grid}${start}${lines}</svg><div class="legend">${legend}</div>`;
  }

  // ---------- 8: relatório para os pais ----------
  function weekRange() {
    const now = new Date();
    const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return [mon, sun];
  }
  function reportData() {
    const [mon, sun] = weekRange();
    const iso = d => d.toISOString().slice(0, 10);
    const log = (profile.log ?? []).filter(l => l.d >= iso(mon) && l.d <= iso(sun));
    const plan = ctx.weekPlanStats();
    const c = profile.counters;
    const room = getRoom();
    const tests = room?.tests ?? (planAnswers()?.test ? [{ subject: subjName(planAnswers().test.subject), date: planAnswers().test.date }] : []);
    return {
      name: profile.name || t('nav.noName'),
      from: mon.toLocaleDateString(locale(), { day: 'numeric', month: 'short' }),
      to: sun.toLocaleDateString(locale(), { day: 'numeric', month: 'short' }),
      minutes: log.reduce((s, l) => s + l.m, 0),
      sessions: log.length,
      days: new Set(log.map(l => l.d)).size,
      plan,
      quiz: c.answered ? { p: Math.round(((c.right ?? 0) / c.answered) * 100), n: c.answered } : null,
      subjects: (planAnswers()?.subjects ?? []).map(subjName),
      tests: tests.slice(0, 4).map(x => `${x.subject} (${new Date(`${x.date}T12:00:00`).toLocaleDateString(locale(), { day: 'numeric', month: 'short' })})`),
      grades: grades().slice(-4).reverse().map(g => `${subjName(g.subject)}: ${g.value}/${g.scale}`),
    };
  }
  function renderReport() {
    const r = reportData();
    const row = (k, v) => `<div class="rep-row"><span>${t(k)}</span><b>${esc(v)}</b></div>`;
    $('#report').innerHTML = `
      <div class="rep-head"><img src="${$('.brand .logo').getAttribute('src')}" alt=""><div><h2>${esc(t('report.title', { name: r.name }))}</h2>
        <p class="muted">${esc(t('report.week', { from: r.from, to: r.to }))}</p></div></div>
      <div class="rep-big"><div><b>${r.minutes}</b><span>${t('report.minutes')}</span></div><div><b>${r.sessions}</b><span>${t('report.sessions')}</span></div><div><b>${r.days}/7</b><span>${t('report.days')}</span></div></div>
      ${row('report.plan', r.plan.total ? t('report.planVal', { d: r.plan.done, t: r.plan.total }) : t('report.none'))}
      ${row('report.quiz', r.quiz ? t('report.quizVal', r.quiz) : t('report.none'))}
      ${row('report.subjects', r.subjects.join(', ') || t('report.none'))}
      ${row('report.tests', r.tests.join(', ') || t('report.none'))}
      ${row('report.grades', r.grades.join(' · ') || t('report.none'))}
      <p class="muted small">${t('report.footer')}</p>`;
  }
  function reportText() {
    const r = reportData();
    return [
      `Shoalmates · ${t('report.title', { name: r.name })}`,
      t('report.week', { from: r.from, to: r.to }), '',
      `- ${t('report.minutes')}: ${r.minutes}`,
      `- ${t('report.sessions')}: ${r.sessions}`,
      `- ${t('report.days')}: ${r.days}/7`,
      `- ${t('report.plan')}: ${r.plan.total ? t('report.planVal', { d: r.plan.done, t: r.plan.total }) : t('report.none')}`,
      `- ${t('report.quiz')}: ${r.quiz ? t('report.quizVal', r.quiz) : t('report.none')}`,
      `- ${t('report.tests')}: ${r.tests.join(', ') || t('report.none')}`,
      `- ${t('report.grades')}: ${r.grades.join(' · ') || t('report.none')}`, '',
      t('report.footer'),
    ].join('\n');
  }
  $('#reportCopy').onclick = async () => {
    try { await navigator.clipboard.writeText(reportText()); toast(t('report.copied')); }
    catch { toast(t('toast.copyFail')); }
  };
  $('#reportShare').onclick = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'Shoalmates', text: reportText() }); return; } catch { /* cancelado */ } }
    $('#reportCopy').click();
  };

  // ---------- ligações com o resto da app ----------
  return {
    isPremium,
    upsell,
    speak,
    renderTeam,
    renderPremiumExtras,
    onShow(name) {
      if (name === 'plano') renderPlanTrial();
      if (name === 'premium') renderPremiumExtras();
      if (name === 'exame') renderExamSetup();
      if (name === 'corrigir') renderCorrFree();
      if (name === 'notas') renderGrades();
      if (name === 'relatorio') renderReport();
      if (name === 'chat') renderVoiceButtons();
    },
  };
}
