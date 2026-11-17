// Gera o plano de estudo semanal a partir das respostas do questionário inicial.
// Não usa IA nem internet: as mesmas respostas dão sempre o mesmo plano.

export const SUBJECTS = ['mat', 'port', 'ing', 'cien', 'fq', 'hist', 'geo', 'bg', 'fil', 'fr', 'es', 'tic', 'ev', 'eco'];
export const YEARS = ['5', '6', '7', '8', '9', '10', '11', '12', 'uni', 'other'];
export const GOALS = ['grades', 'exams', 'keep', 'organize'];
export const MINUTES = [15, 30, 45, 60, 90, 120];
export const WHEN = ['morning', 'afternoon', 'evening'];

// Disciplinas sugeridas por ano (pré-selecionadas no questionário)
export function suggestedSubjects(year) {
  const y = Number(year);
  if (y >= 5 && y <= 6) return ['mat', 'port', 'ing', 'cien', 'hist'];
  if (y >= 7 && y <= 9) return ['mat', 'port', 'ing', 'cien', 'fq', 'hist', 'geo', 'fr'];
  if (y >= 10 && y <= 12) return ['mat', 'port', 'ing', 'bg', 'fq', 'fil'];
  return ['mat', 'port', 'ing'];
}

const dayIndex = date => (date.getDay() + 6) % 7; // 0 = segunda
const isoDay = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Segunda-feira da semana de "now" (hora local)
export function weekStart(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - dayIndex(d));
  return d;
}

export function daysUntil(dateStr, now = new Date()) {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.round((new Date(y, m - 1, d) - a) / 86_400_000);
}

/**
 * answers: { subjects: [], hard: [], goal, minutes, days: [0..6], when, test?: { subject, date } }
 * Devolve { week: [{ date, day, blocks: [{ id, subject, minutes, kind }] }], ... }
 */
export function buildPlan(answers, now = new Date()) {
  const subjects = answers.subjects?.length ? answers.subjects : ['mat'];
  const hard = (answers.hard ?? []).filter(s => subjects.includes(s));
  const minutes = Number(answers.minutes) || 30;
  const days = answers.days?.length ? answers.days : [0, 1, 2, 3, 4];

  // blocos de 25 min (ou um bloco só, para quem tem pouco tempo)
  const blockLen = minutes >= 50 ? 25 : minutes;
  const perDay = minutes >= 50 ? Math.floor(minutes / 25) : 1;

  // peso: difíceis valem 3, as outras 1
  const weighted = [];
  for (const s of subjects) for (let i = 0; i < (hard.includes(s) ? 3 : 1); i++) weighted.push(s);
  // espalha as repetições para a mesma disciplina não aparecer seguida
  const queue = interleave(weighted);

  const start = weekStart(now);
  const testDays = answers.test?.date ? daysUntil(answers.test.date, start) : null;
  let cursor = 0;
  let n = 0;
  const week = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const blocks = [];
    if (days.includes(d)) {
      for (let b = 0; b < perDay; b++) {
        // nos 3 dias antes do teste, o primeiro bloco do dia é para o teste
        const beforeTest = testDays != null && testDays - d >= 1 && testDays - d <= 3;
        let subject, kind;
        if (beforeTest && b === 0) {
          subject = answers.test.subject; kind = 'test';
        } else {
          subject = queue[cursor % queue.length]; cursor++;
          n++;
          kind = n % 3 === 0 ? 'quiz' : (hard.includes(subject) && n % 2 === 0 ? 'practice' : 'study');
        }
        blocks.push({ id: `${isoDay(date)}-${b}`, subject, minutes: blockLen, kind });
      }
    }
    week.push({ date: isoDay(date), day: d, blocks });
  }
  return { week, blockLen, perDay, weekOf: isoDay(start) };
}

function interleave(list) {
  const counts = {};
  for (const s of list) counts[s] = (counts[s] ?? 0) + 1;
  const out = [];
  while (out.length < list.length) {
    for (const s of Object.keys(counts)) if (counts[s]-- > 0) out.push(s);
  }
  return out;
}

// Dicas (chaves de tradução) para o plano
export function planTips(answers) {
  const tips = [`tip.${answers.when ?? 'afternoon'}`];
  if (answers.hard?.length) tips.push('tip.hard');
  tips.push(`tip.${answers.goal ?? 'keep'}`);
  return tips;
}
