/* =====================================================================
   Realismo: microfone sempre ligado na live, pelo menos 100 respostas,
   chat que vê o jogo (Claude), conversas entre espetadores, escrita
   humana, memória, primeira mensagem, entradas e saídas, personagens,
   silêncio, audiência que reage à atividade, presentes com mensagem,
   resumo da live e contador de seguidores a passo.
   ===================================================================== */

/* ---------- Quantas pessoas respondem ---------- */
function respN(L) {
  const want = 100 + Math.round(Math.log10(L.viewers + 1) * 12);
  return isReal(L) ? Math.min(want, Math.max(0, Math.round(L.viewers * .9))) : want;
}

/* ---------- Microfone sempre ligado (sem botão) ---------- */
function micAuto() {
  if (!MIC.api || MIC.on || MIC.state === 'starting' || MIC.userOff) return;
  try { micStart(); } catch (e) { }
}
document.addEventListener('pointerdown', () => { if (S && S.live) micAuto(); }, true);
document.addEventListener('keydown', () => { if (S && S.live) micAuto(); }, true);
function micIndHTML() {
  const on = MIC.on || MIC.state === 'listening';
  return `<span class="mic-ind ${on ? 'on' : ''}" data-micind title="${on ? 'O chat está a ouvir-te' : MIC.api ? 'Toca em qualquer lado para o chat te ouvir' : 'Microfone indisponível neste navegador'}">${icon('mic')}<span>${on ? 'A ouvir' : MIC.api ? 'Toca para ligar' : 'Sem micro'}</span></span>`;
}
function paintMicInd() { $$('[data-micind]').forEach(el => el.outerHTML = micIndHTML()); }

/* ---------- Escrita humana ---------- */
const ABBR = [[/\bnão\b/gi, 'n'], [/\btambém\b/gi, 'tb'], [/\bporque\b/gi, 'pq'], [/\bque\b/gi, 'q'], [/\bmuito\b/gi, 'mt'], [/\bestás\b/gi, 'tas'], [/\bestá\b/gi, 'tá'], [/\bpara\b/gi, 'pra'], [/\bobrigado\b/gi, 'obg'], [/\bmesmo\b/gi, 'msm'], [/\bvocês\b/gi, 'vcs'], [/\bbeleza\b/gi, 'blz'], [/\bagora\b/gi, 'agr'], [/\bquando\b/gi, 'qnd']];
const stripAcc = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
function humanize(t) {
  let s = String(t);
  const re = typeof emoteRe === 'function' ? emoteRe() : null;
  if (re && re.test(s)) return s;
  if (Math.random() < .35) s = s.toLowerCase();
  if (Math.random() < .45) ABBR.forEach(([a, b]) => { if (Math.random() < .55) s = s.replace(a, b); });
  if (Math.random() < .25) s = stripAcc(s);
  if (Math.random() < .12) s = s.replace(/\b([\p{L}]{5,})\b/u, w => { const i = 1 + Math.floor(Math.random() * (w.length - 2)); return w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2); });
  if (Math.random() < .14) s = s.replace(/([aeiou])(\W*)$/i, (m, v, r) => v.repeat(3 + Math.floor(Math.random() * 4)) + r);
  if (Math.random() < .1) s += pick([' xd', ' kkk', ' lol', ' ahah', ' 😂', ' 💀']);
  if (Math.random() < .06) s = s.toUpperCase();
  return s;
}

/* ---------- Personagens ---------- */
const PERSONAS = [
  { u: 'joka_fan', color: '#ff7ab8', lines: ['és o maior 💜', 'melhor streamer de pt', 'nunca falho uma live', '💜💜💜', 'amo estas lives', 'já partilhei a live!'] },
  { u: 'pedrojogos', color: '#6fb6ff', lines: ['joga minecraft', 'muda de jogo pls', 'quando jogas gta 6?', 'joga com os subs!', 'faz uma live de terror'] },
  { u: 'ana.pergunta', color: '#3ee0a1', lines: ['quantos anos tens?', 'de onde és?', 'qual é o teu setup?', 'q sensibilidade usas?', 'fazes live amanhã?', 'tens discord?'] },
  { u: 'tugaboss', color: '#ffc24b', gifter: true, lines: ['toma lá mais um 🎁', 'bora meta!!', 'vou mandar presente', 'quem me acompanha nos presentes?'] },
  { u: 'sr_critico', color: '#c084fc', lines: ['jogaste mal ali', 'eu fazia melhor', 'isso foi sorte', 'hmm ok', 'n gostei dessa jogada', 'skill issue'] },
  { u: 'ritinha_lol', color: '#f472b6', lines: ['HAHAHAHA', 'tou a morrer 😂', 'q fofo', 'esta live tá top', 'alguém mais de lisboa?'] },
];
function personaTick(L) {
  const real = isReal(L);
  if (real && L.viewers < 3) return;
  if (Math.random() > (real ? Math.min(.05, L.viewers * .002) : .05)) return;
  const p = pick(PERSONAS);
  if (p.gifter && Math.random() < .35) { giftEvent(p.u); return; }
  pushChat({ user: p.u, text: pick(p.lines), color: p.color });
}

/* ---------- Chat: conversas, primeira mensagem, entradas e saídas ---------- */
const REPLY_T = ['@{u} concordo', '@{u} kkkk', '@{u} nem pensar', '@{u} verdade', '@{u} és doido 😂', '@{u} isso msm', '@{u} ?', '@{u} eu tb', '@{u} quem és tu 😂', '@{u} calma', '@{u} facto', '@{u} n é bem assim', '@{u} 💀'];
const pushChatBase = pushChat;
pushChat = function (m) {
  const L = S.live; if (!L) return;
  const human = m.user && !m.sys && !m.gift && !m.me && !m.bot && !m.plain;
  if (human && !m.raw && Math.random() < .55) m.text = humanize(m.text);
  if (human) {
    L.chatters = L.chatters || {};
    if (!L.chatters[m.user]) { L.chatters[m.user] = 1; if (!regular(m.user) && Math.random() < .18) m.first = true; }
    else L.chatters[m.user]++;
  }
  pushChatBase(m);
  if (human && !m.reply && Math.random() < (isReal(L) ? Math.min(.08, L.viewers * .004) : .08)) {
    const from = fakeUser();
    setTimeout(() => {
      if (S.live !== L) return;
      pushChat({ user: from, text: pick(REPLY_T).replace('{u}', m.user), reply: true });
      if (Math.random() < .35) setTimeout(() => S.live === L && pushChat({ user: m.user, text: pick(['@' + from + ' kkk', '@' + from + ' sim', '@' + from + ' n', '@' + from + ' exato', '@' + from + ' cala-te 😂']), reply: true, color: m.color }), rand(1200, 3500));
    }, rand(900, 4000));
  }
};
function joinLeaveTick(L) {
  const real = isReal(L);
  const p = real ? Math.min(.03, L.viewers * .003) : .035;
  if (Math.random() < p) pushChatBase({ plain: true, text: `${fakeUser()} ${Math.random() < .7 ? 'entrou no chat' : 'saiu do chat'}` });
}

/* ---------- Memória ---------- */
function rememberSaid(L, text) {
  if (text.length < 8) return;
  L.memory = L.memory || []; L.memory.push({ text, t: Date.now(), used: false });
  if (L.memory.length > 30) L.memory.shift();
}
function memoryTick(L) {
  if (!L.memory || !L.memory.length || Math.random() > .006) return;
  if (isReal(L) && L.viewers < 2) return;
  const old = L.memory.filter(m => !m.used && Date.now() - m.t > 3 * MIN);
  if (!old.length) return;
  const m = pick(old); m.used = true;
  const short = m.text.length > 42 ? m.text.slice(0, 40) + '…' : m.text;
  const topic = topicOf(m.text);
  const lines = [`há bocado disseste "${short}" 😂`, `lembram-se quando ele disse "${short}"?`, topic ? `e a ${topic}?` : 'e então, fizeste?', topic ? `ainda estou à espera da ${topic}` : 'ainda estou à espera', 'ele esqueceu-se 💀', 'promessas...'];
  const n = isReal(L) ? Math.min(4, Math.max(1, Math.round(L.viewers / 3))) : randi(3, 6);
  for (let i = 0; i < n; i++) setTimeout(() => S.live && pushChat({ user: fakeUser(), text: lines[i % lines.length] }), i * rand(500, 1400));
}

/* ---------- Silêncio e atividade ---------- */
function markActive(L) { if (!L) return; L.lastAct = Date.now(); L.silenceAsked = false; }
const sceneFactorBase = sceneFactor;
function idleFactor(L) {
  const idle = (Date.now() - (L.lastAct || L.start)) / 1000;
  if (idle < 25) return 1.08;
  if (idle < 90) return 1;
  return Math.max(.55, 1 - (idle - 90) / 1200);
}
sceneFactor = L => sceneFactorBase(L) * idleFactor(L);
function silenceTick(L) {
  const idle = (Date.now() - (L.lastAct || L.start)) / 1000;
  if (idle < 80 || L.silenceAsked || !['game', 'chat'].includes(L.scene || 'game')) return;
  if (isReal(L) && L.viewers < 1) return;
  L.silenceAsked = true;
  const lines = ['estás aí?', 'sem som?', 'fala connosco 😢', 'o micro morreu?', '??', 'olá??', 'tá calado hoje', 'não te ouço', 'diz alguma coisa'];
  const n = isReal(L) ? Math.min(6, Math.max(1, Math.round(L.viewers / 2))) : randi(5, 9);
  for (let i = 0; i < n; i++) setTimeout(() => S.live === L && pushChat({ user: fakeUser(), text: pick(lines) }), i * rand(400, 1100));
}

/* ---------- O chat vê o jogo e percebe o que dizes (Claude) ---------- */
const VISION = { sample: null, busy: false, last: 0, off: false };
(async () => { try { if (window.claude && typeof window.claude.use === 'function') VISION.sample = await window.claude.use('sample'); } catch (e) { } })();
function grabFrame() {
  const v = document.querySelector('#screen video[data-stream="screen"]') || document.querySelector('#screen video[data-stream="cam"]');
  if (!v || !v.videoWidth) return Promise.resolve(null);
  const w = 640, h = Math.round(v.videoHeight / v.videoWidth * w), c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(v, 0, 0, w, h);
  return new Promise(res => c.toBlob(b => res(b), 'image/jpeg', .7));
}
async function smartReplies(L, said) {
  if (!VISION.sample || VISION.off || VISION.busy || Date.now() - VISION.last < 15000) return;
  if (isReal(L) && L.viewers < 2) return;
  VISION.busy = true; VISION.last = Date.now();
  try {
    const frame = await grabFrame();
    const G = (GAMES[L.game] || GAMES.chat).name;
    const prompt = `És o chat de uma live de streaming em português de Portugal (calão de jovens portugueses). O streamer está a jogar ${G}. O streamer acabou de dizer em voz alta: "${said}".${frame ? ' A imagem é o que aparece no ecrã da live neste momento: reage também ao que se vê.' : ''}
Escreve 18 mensagens curtas (1 a 8 palavras) de espetadores diferentes a reagir ao que ele disse${frame ? ' e ao que se vê' : ''}. Responde ao conteúdo de forma concreta: se ele fizer uma pergunta, responde (uns sim, outros não, outros talvez, com opiniões); se contar algo, comenta. Estilo de chat: informal, abreviaturas (n, q, pq, tb), alguns emojis, alguns em maiúsculas, algumas opiniões diferentes. Nada ofensivo nem impróprio para menores. Responde APENAS com um array JSON de strings.`;
    const opts = { modelTier: 'quick', cache: false };
    if (frame) opts.images = [frame];
    let arr = await VISION.sample.json(prompt, opts).catch(async e => {
      if (e && e.code === 'images_unavailable' && frame) return VISION.sample.json(prompt, { modelTier: 'quick', cache: false });
      throw e;
    });
    if (!Array.isArray(arr)) arr = Array.isArray(arr && arr.messages) ? arr.messages : [];
    arr = arr.filter(x => typeof x === 'string' && x.trim()).slice(0, 24);
    const n = isReal(L) ? Math.min(arr.length, Math.max(1, Math.round(L.viewers * .5))) : arr.length;
    arr.slice(0, n).forEach((t, i) => setTimeout(() => S.live === L && pushChat({ user: fakeUser(), text: t.slice(0, 120), hype: true, raw: true }), 200 + i * rand(250, 700)));
  } catch (e) {
    if (e && ['not_granted', 'unavailable', 'blocked_by_policy'].includes(e.code)) VISION.off = true;
  } finally { VISION.busy = false; }
}

/* ---------- Novo chatRespond: memória + atividade + respostas locais + Claude ---------- */
function chatRespond(text) {
  const L = S.live; if (!L) return;
  markActive(L); rememberSaid(L, text);
  L.boost += (LEVELS[L.level] || LEVELS.media).max * .015;
  chatRespondLocal(text);
  smartReplies(L, text);
}

/* ---------- Presentes com mensagem ---------- */
const GIFT_MSGS2 = ['GG mano, continua assim!', 'manda um abraço para o Porto', 'isto é para a meta!', 'és o melhor streamer de PT', 'faz um clutch para mim', 'primeira vez que doo, adoro as tuas lives', 'saudações do Algarve ☀️', 'bebe água 💧', 'aposto q n ganhas a próxima 😂', 'lê isto em voz alta', 'feliz aniversário a mim 🎂', 'joga minecraft a seguir', 'obrigado pelas lives 💜', 'diz olá à minha irmã', 'vai à loja!!', 'bora 100 seguidores'];
function giftMessage(u, g, val) {
  const msg = pick(GIFT_MSGS2);
  pushChatBase({ gift: true, text: `${u} enviou ${g.name}: «${msg}»` });
  if (val >= 50) ttsSay(`${u.replace(/[_.\d]+/g, ' ').trim() || 'Alguém'} enviou ${g.name}. ${msg}`);
}

/* ---------- Contador de seguidores a passo (cada seguidor sobe) ---------- */
function setOdo(el, n) {
  el._target = n;
  if (el._stepping) return;
  el._stepping = true;
  const step = () => {
    const cur = +el.dataset.n || 0, tgt = el._target;
    if (cur === tgt || !el.isConnected) { el._stepping = false; return; }
    const diff = tgt - cur, inc = Math.abs(diff) > 40 ? Math.ceil(diff / 10) : Math.sign(diff);
    setOdoInstant(el, cur + inc);
    setTimeout(step, Math.abs(diff) > 40 ? 90 : 260);
  };
  step();
}

/* ---------- Resumo da live (como numa plataforma de streaming) ---------- */
function liveSummary(l) {
  const dur = l.end - l.start, hist = l.hist || [];
  const avg = hist.length ? Math.round(hist.reduce((s, p) => s + p[1], 0) / hist.length) : Math.round(l.peak * .6);
  const unique = Math.max(1, Math.round(l.peak * 1.8 + (l.chatters || 0)));
  const watch = Math.min(dur, Math.round(dur * avg / unique));
  const best = (l.timeline || []).filter(t => ['reaction', 'viral', 'raid', 'gift'].includes(t.type)).sort((a, b) => (b.hype || 0) - (a.hype || 0)).slice(0, 4);
  let chart = '';
  if (hist.length > 1) {
    const W = 1000, H = 170, max = Math.max(...hist.map(p => p[1]), l.peak, 1), t0 = hist[0][0], t1 = hist[hist.length - 1][0] || t0 + 1;
    const pts = hist.map(p => [((p[0] - t0) / (t1 - t0 || 1)) * (W - 20) + 10, H - 18 - (p[1] / max) * (H - 34)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    chart = `<svg class="sum-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Espetadores ao longo da live">
      <line x1="10" x2="${W - 10}" y1="${H - 18}" y2="${H - 18}" stroke="currentColor" stroke-opacity=".15"/>
      <path d="${line} L ${pts[pts.length - 1][0]} ${H - 18} L ${pts[0][0]} ${H - 18} Z" fill="#9147ff" fill-opacity=".18"/>
      <path d="${line}" fill="none" stroke="#a970ff" stroke-width="2.5" stroke-linejoin="round"/>
      <text x="10" y="12" fill="currentColor" fill-opacity=".6" font-size="11">Pico ${dots(Math.round(l.peak))}</text>
      <text x="10" y="${H - 4}" fill="currentColor" fill-opacity=".6" font-size="11">Início</text>
      <text x="${W - 10}" y="${H - 4}" fill="currentColor" fill-opacity=".6" font-size="11" text-anchor="end">${durLabel(dur)}</text></svg>`;
  }
  const tile = (label, value) => `<div class="sum-t"><small>${label}</small><b class="num">${value}</b></div>`;
  return `<section class="card sum">
    <div class="sum-head"><div><span class="tw-chead-t">Resumo da transmissão</span><h2>${esc(l.title)}</h2><span class="muted small">${whenLabel(l.start)} · ${durLabel(dur)} · ${esc((GAMES[l.game] || GAMES.chat).name)}</span></div><span class="spacer"></span>
      <button class="btn btn-primary btn-sm" data-act="share-recap" data-id="${l.id}">${icon('share')} Partilhar</button><button class="icon-btn" data-act="summary-close" aria-label="Fechar resumo">${icon('close')}</button></div>
    <div class="sum-grid">
      ${tile('Média de espetadores', dots(avg))}${tile('Pico de espetadores', dots(Math.round(l.peak)))}${tile('Tempo médio a ver', durLabel(watch))}${tile('Novos seguidores', '+' + dots(l.followers))}
      ${tile('Pessoas no chat', dots(l.chatters || 0))}${tile('Mensagens', dots(l.msgs || 0))}${tile('Moedas virtuais', dots(l.gifts))}${tile('Visualizações', dots(l.views))}
    </div>
    ${chart}
    ${best.length ? `<h3 class="sum-h">Melhores momentos</h3><div class="sum-best">${best.map(t => `<div><span>${esc(t.label.replace(/^Reação ao jogo: /, ''))}</span><time class="num">${durLabel(t.t - l.start)}</time>${t.clipId ? '<span class="clipped">Clipe criado</span>' : `<button class="btn btn-xs" data-act="tl-clip" data-id="${t.id}">${icon('clip')} Criar clipe</button>`}</div>`).join('')}</div>` : ''}
    <p class="tiny muted" style="margin:0">Valores simulados.</p>
  </section>`;
}

/* reagir ao jogo e escrever no chat também contam como atividade */
const reactBase = react;
react = function (...a) { markActive(S.live); return reactBase.apply(this, a); };
document.addEventListener('submit', e => { if (e.target.closest('[data-form="chat"]') && S.live) markActive(S.live); }, true);

/* ---------- Ciclo ---------- */
setInterval(() => {
  try {
    const L = S && S.live; if (!L) return;
    personaTick(L); joinLeaveTick(L); memoryTick(L); silenceTick(L);
    paintMicInd();
  } catch (e) { console.warn('realism', e); }
}, 1000);
