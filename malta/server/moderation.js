// Moderação automática: filtro de palavrões/insultos e limites anti-spam.

// Palavrões: são tapados com asteriscos.
const PROFANITY = ['caralho', 'foda-se', 'fodase', 'foder', 'fodido', 'puta', 'merda', 'cona', 'cabrao', 'filho da puta', 'fdp', 'pqp', 'crl', 'fuck', 'fucking', 'shit', 'bitch', 'cunt', 'dick', 'asshole'];
// Insultos de ódio: tapados E contam como infração (3 → silenciado 1 hora).
const SLURS = ['paneleiro', 'maricas', 'nigger', 'nigga', 'faggot', 'retard', 'atrasado mental', 'monhé', 'cigano de merda', 'preto de merda', 'tranny'];

const LEET = { a: '[a4@áàãâ]', e: '[e3éê]', i: '[i1!í]', o: '[o0óõô]', u: '[uúü]', s: '[s5$]', c: '[cç]', g: '[g9]' };
function toRegex(word) {
  const body = [...word.normalize('NFD').replace(/[̀-ͯ]/g, '')]
    .map((ch) => (ch === ' ' || ch === '-' ? '[\\s\\-_.]*' : (LEET[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) + '+'))
    .join('');
  return new RegExp(`(^|[^\\p{L}\\p{N}])(${body})(?=$|[^\\p{L}\\p{N}])`, 'giu');
}
const PROF_RE = PROFANITY.map(toRegex);
const SLUR_RE = SLURS.map(toRegex);

function mask(m) { return m[0] + '*'.repeat(Math.max(2, m.length - 1)); }

// Devolve { text, slur } — text já filtrado; slur = true se continha insultos de ódio.
function filterText(text) {
  let slur = false;
  let out = String(text);
  for (const re of SLUR_RE) out = out.replace(re, (_, pre, w) => { slur = true; return pre + mask(w); });
  for (const re of PROF_RE) out = out.replace(re, (_, pre, w) => pre + mask(w));
  return { text: out, slur };
}
function isClean(text) { const f = filterText(text); return f.text === String(text); }

// Anti-spam por ligação: máx. 5 mensagens em 5 s; repetir a mesma mensagem 3× seguidas é bloqueado.
function makeSpamGuard() {
  const times = []; let last = ''; let repeats = 0; let mutedUntil = 0;
  return function check(text) {
    const now = Date.now();
    if (now < mutedUntil) return { ok: false, reason: `Calma! Podes voltar a escrever daqui a ${Math.ceil((mutedUntil - now) / 1000)} s.` };
    while (times.length && now - times[0] > 5000) times.shift();
    times.push(now);
    if (times.length > 5) { mutedUntil = now + 30000; return { ok: false, reason: 'Estás a mandar mensagens demasiado depressa. Silenciado 30 s.' }; }
    repeats = text === last ? repeats + 1 : 0; last = text;
    if (repeats >= 2) return { ok: false, reason: 'Não repitas a mesma mensagem.' };
    return { ok: true };
  };
}

module.exports = { filterText, isClean, makeSpamGuard };
