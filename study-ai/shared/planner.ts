// Motor do plano de estudos personalizado.
// Recebe as respostas do questionário (e os testes marcados) e cria:
//  - um horário semanal (sessões por dia, com hora, disciplina, duração e atividade);
//  - objetivos semanais;
//  - uma explicação das decisões tomadas.
// As revisões antes dos testes são calculadas para cada dia em `sessionsForDate`,
// por isso um teste marcado mais tarde no calendário entra logo no plano.

import { addDays, addMinutesToTime, daysBetween, formatDateShort, isoWeekday, WEEKDAYS } from './dates.ts';
import { getSubject } from './subjects.ts';
import type {
  ActivityType,
  CalendarEvent,
  DaySession,
  LearningStyle,
  PlanSession,
  Questionnaire,
  StudyPlan,
  WeeklyGoal,
} from './types.ts';
import { ACTIVITY_LABELS, STYLE_LABELS } from './types.ts';

const STYLE_ACTIVITY: Record<LearningStyle, ActivityType> = {
  explicacoes: 'estudo',
  exercicios: 'exercicios',
  resumos: 'resumo',
  perguntas: 'perguntas',
  exemplos: 'exemplos',
};

/** Divide os minutos de um dia em blocos (múltiplos de 5, entre 15 e 50 minutos). */
export function splitDay(minutes: number): number[] {
  const total = Math.max(15, Math.round(minutes / 5) * 5);
  let count: number;
  if (total <= 30) count = 1;
  else if (total <= 50) count = 2;
  else count = Math.min(6, Math.max(2, Math.round(total / 40)));
  const base = Math.floor(total / count / 5) * 5;
  const blocks = Array.from({ length: count }, () => base);
  let rest = total - base * count;
  for (let i = 0; rest > 0; i = (i + 1) % count, rest -= 5) blocks[i] = (blocks[i] ?? 0) + 5;
  return blocks;
}

export function breakAfter(blockMinutes: number): number {
  return blockMinutes > 30 ? 10 : 5;
}

function subjectWeights(q: Questionnaire, events: CalendarEvent[], today: string) {
  const subjects = [...new Set(q.subjects)];
  const weights = new Map<string, number>();
  const upcoming = new Set(
    events
      .filter((e) => e.type === 'teste' && e.subject && daysBetween(today, e.date) >= 0 && daysBetween(today, e.date) <= 21)
      .map((e) => e.subject as string),
  );
  for (const id of subjects) {
    const s = getSubject(id, q.customSubjects);
    const difficult = q.difficult.includes(id);
    const easy = q.easy.includes(id);
    let w = s.core ? 1 : 0.2;
    if (difficult) w = s.core ? 2.4 : 1.1;
    if (difficult && q.goal === 'melhorar-notas') w *= 1.2;
    if (easy) w *= 0.6;
    if (upcoming.has(id)) w += q.goal === 'preparar-testes' ? 0.9 : 0.5;
    weights.set(id, w);
  }
  // Disciplinas não nucleares (Educação Física, Cidadania…) só entram se forem difíceis
  // ou tiverem teste, quando há disciplinas nucleares suficientes.
  const coreCount = subjects.filter((id) => (weights.get(id) ?? 0) >= 0.5).length;
  const excluded: string[] = [];
  if (coreCount >= 2) {
    for (const id of subjects) {
      if ((weights.get(id) ?? 0) < 0.5) {
        weights.delete(id);
        excluded.push(id);
      }
    }
  }
  return { weights, excluded, upcoming };
}

let idCounter = 0;
function sessionId(): string {
  idCounter = (idCounter + 1) % 1_000_000;
  return `s${Date.now().toString(36)}${idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function generatePlan(q: Questionnaire, events: CalendarEvent[], today: string): StudyPlan {
  const studyDays = [...new Set(q.studyDays)].filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
  const days = studyDays.length ? studyDays : [0, 1, 2, 3, 4];
  const { weights, excluded, upcoming } = subjectWeights(q, events, today);
  const subjects = [...weights.keys()];
  const homework = q.goal === 'trabalhos-casa';

  // 1) Estrutura de blocos de cada dia.
  type Slot = { weekday: number; start: string; minutes: number; subject: string; activity: ActivityType };
  const slots: Slot[] = [];
  for (const weekday of days) {
    let blocks = splitDay(q.dailyMinutes);
    const isSchoolDay = weekday <= 4;
    let time = q.startTime;
    if (homework && isSchoolDay) {
      const tpc = Math.min(30, Math.max(15, Math.round(q.dailyMinutes / 3 / 5) * 5));
      slots.push({ weekday, start: time, minutes: tpc, subject: '', activity: 'tpc' });
      time = addMinutesToTime(time, tpc + breakAfter(tpc));
      blocks = q.dailyMinutes - tpc >= 15 ? splitDay(q.dailyMinutes - tpc) : [];
    }
    for (const minutes of blocks) {
      slots.push({ weekday, start: time, minutes, subject: '', activity: 'estudo' });
      time = addMinutesToTime(time, minutes + breakAfter(minutes));
    }
  }

  // 2) Distribuição das disciplinas pelos blocos (proporcional ao peso, sem repetir no mesmo dia).
  const studySlots = slots.filter((s) => s.activity !== 'tpc');
  const totalWeight = [...weights.values()].reduce((a, b) => a + b, 0) || 1;
  const target = new Map<string, number>();
  for (const id of subjects) {
    let t = ((weights.get(id) ?? 0) / totalWeight) * studySlots.length;
    if (studySlots.length >= subjects.length) t = Math.max(1, t);
    target.set(id, t);
  }
  const assigned = new Map<string, number>(subjects.map((id) => [id, 0]));
  const usedByDay = new Map<number, Set<string>>();
  for (const slot of studySlots) {
    if (!subjects.length) break;
    const today = usedByDay.get(slot.weekday) ?? new Set<string>();
    const yesterday = usedByDay.get(slot.weekday - 1) ?? new Set<string>();
    let best = subjects[0] as string;
    let bestScore = -Infinity;
    for (const id of subjects) {
      let score = (target.get(id) ?? 0) - (assigned.get(id) ?? 0);
      if (today.has(id)) score -= 100;
      if (yesterday.has(id)) score -= 0.35;
      score += (weights.get(id) ?? 0) * 0.01; // desempate: mais peso primeiro
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
    }
    slot.subject = best;
    assigned.set(best, (assigned.get(best) ?? 0) + 1);
    today.add(best);
    usedByDay.set(slot.weekday, today);
  }

  // 3) Em cada dia, as disciplinas difíceis vêm primeiro (com a cabeça fresca).
  for (const weekday of days) {
    const daySlots = studySlots.filter((s) => s.weekday === weekday);
    const ordered = [...daySlots].sort(
      (a, b) => Number(q.difficult.includes(b.subject)) - Number(q.difficult.includes(a.subject)),
    );
    const subjectsInOrder = ordered.map((s) => s.subject);
    daySlots.forEach((s, i) => (s.subject = subjectsInOrder[i] ?? s.subject));
  }

  // 4) Atividade de cada bloco, de acordo com o estilo de aprendizagem.
  const styles = q.styles.length ? q.styles : (['explicacoes', 'exercicios'] as LearningStyle[]);
  const cycleBase = [...new Set(styles.map((s) => STYLE_ACTIVITY[s]))];
  let offset = 0;
  for (const id of subjects) {
    const mine = studySlots.filter((s) => s.subject === id);
    const cycle = [...cycleBase];
    const difficult = q.difficult.includes(id);
    if (difficult && !cycle.includes('estudo')) cycle.unshift('estudo');
    if (difficult && !cycle.includes('exercicios')) cycle.push('exercicios');
    // As difíceis começam pela explicação; nas outras o ponto de partida roda,
    // para que todas as formas de estudar preferidas apareçam na semana.
    const start = difficult ? 0 : offset++;
    mine.forEach((s, i) => (s.activity = cycle[(i + start) % cycle.length] ?? 'estudo'));
    const last = mine[mine.length - 1];
    if (last && mine.length >= 2 && q.difficult.includes(id)) last.activity = 'consolidacao';
    else if (last && mine.length >= 3) last.activity = 'revisao';
  }

  const sessions: PlanSession[] = slots.map((s) => ({
    id: sessionId(),
    weekday: s.weekday,
    start: s.start,
    minutes: s.minutes,
    subject: s.subject,
    activity: s.activity,
  }));

  const plan: StudyPlan = {
    version: 1,
    generatedAt: new Date().toISOString(),
    sessions,
    weeklyGoals: [],
    insights: [],
    aiInsights: null,
    meta: { startTime: q.startTime, dailyMinutes: q.dailyMinutes, studyDays: days },
    settings: { autoRevisions: true },
  };
  plan.weeklyGoals = buildWeeklyGoals(q, plan, events, today);
  plan.insights = buildInsights(q, plan, events, today, excluded, upcoming);
  return plan;
}

export function minutesBySubject(plan: StudyPlan): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of plan.sessions) if (s.subject) m.set(s.subject, (m.get(s.subject) ?? 0) + s.minutes);
  return m;
}

function nextTests(events: CalendarEvent[], today: string, withinDays: number) {
  return events
    .filter((e) => e.type === 'teste' && daysBetween(today, e.date) >= 0 && daysBetween(today, e.date) <= withinDays)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildWeeklyGoals(q: Questionnaire, plan: StudyPlan, events: CalendarEvent[], today: string): WeeklyGoal[] {
  const goals: WeeklyGoal[] = [];
  const total = plan.sessions.length;
  if (total) {
    const target = Math.max(1, Math.ceil(total * 0.8));
    goals.push({ id: 'g-sessions', kind: 'sessions', target, text: `Completar ${target} das ${total} sessões do plano` });
  }
  const bySubject = minutesBySubject(plan);
  for (const id of q.difficult.slice(0, 2)) {
    const minutes = bySubject.get(id);
    if (!minutes) continue;
    goals.push({
      id: `g-min-${id}`,
      kind: 'minutes',
      subject: id,
      target: minutes,
      text: `Estudar ${getSubject(id, q.customSubjects).name} pelo menos ${minutes} min`,
    });
  }
  const test = nextTests(events, today, 14)[0];
  if (test && test.subject) {
    goals.push({
      id: `g-test-${test.id}`,
      kind: 'check',
      subject: test.subject,
      text: `Preparar o teste de ${getSubject(test.subject, q.customSubjects).name} (${formatDateShort(test.date)})`,
    });
  }
  const hardest = q.difficult[0];
  if (hardest) {
    goals.push({
      id: `g-practice-${hardest}`,
      kind: 'check',
      subject: hardest,
      text: `Fazer um teste de preparação de ${getSubject(hardest, q.customSubjects).name}`,
    });
  }
  if (q.styles.includes('perguntas')) goals.push({ id: 'g-flash', kind: 'check', text: 'Rever flashcards em 3 dias diferentes' });
  else if (q.styles.includes('resumos')) goals.push({ id: 'g-sum', kind: 'check', text: 'Guardar 2 resumos novos' });
  if (q.goal === 'trabalhos-casa') goals.push({ id: 'g-tpc', kind: 'check', text: 'Ter os trabalhos de casa feitos antes das aulas' });
  return goals.slice(0, 5);
}

function names(ids: string[], q: Questionnaire): string {
  const list = ids.map((id) => getSubject(id, q.customSubjects).name);
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`;
}

function buildInsights(
  q: Questionnaire,
  plan: StudyPlan,
  events: CalendarEvent[],
  today: string,
  excluded: string[],
  upcoming: Set<string>,
): string[] {
  const out: string[] = [];
  const days = plan.meta.studyDays;
  const weekly = plan.sessions.reduce((a, s) => a + s.minutes, 0);
  const dayNames = days.map((d) => WEEKDAYS[d]?.toLowerCase()).filter(Boolean) as string[];
  out.push(
    `Estudas ${days.length} ${days.length === 1 ? 'dia' : 'dias'} por semana (${names2(dayNames)}), ${q.dailyMinutes} minutos por dia a partir das ${q.startTime} — cerca de ${Math.round((weekly / 60) * 10) / 10} horas por semana, com pausas curtas entre sessões.`,
  );
  const count = new Map<string, number>();
  for (const s of plan.sessions) if (s.subject) count.set(s.subject, (count.get(s.subject) ?? 0) + 1);
  const hard = q.difficult.filter((id) => count.has(id));
  if (hard.length)
    out.push(
      `${names(hard, q)} ${hard.length === 1 ? 'tem' : 'têm'} mais sessões porque ${hard.length === 1 ? 'é a disciplina' : 'são as disciplinas'} em que sentes mais dificuldades — e ficam no início de cada dia, quando estás mais concentrado.`,
    );
  const easy = q.easy.filter((id) => count.has(id));
  if (easy.length)
    out.push(`${names(easy, q)} ${easy.length === 1 ? 'aparece' : 'aparecem'} menos vezes, só para manter a matéria em dia.`);
  const styles = q.styles.map((s) => STYLE_LABELS[s].toLowerCase());
  if (styles.length) out.push(`As atividades seguem a forma como preferes aprender: ${names2(styles)}.`);
  if (q.difficult.some((id) => count.has(id)))
    out.push('No fim da semana, as disciplinas difíceis têm uma sessão de exercícios de consolidação.');
  const tests = nextTests(events, today, 60);
  if (tests.length) {
    const list = tests
      .slice(0, 3)
      .map((t) => `${t.subject ? getSubject(t.subject, q.customSubjects).name : t.title} a ${formatDateShort(t.date)}`);
    out.push(
      `Nos 3 dias antes de cada teste, o plano troca sessões por revisões, um teste de preparação e uma revisão final (${list.join('; ')}).`,
    );
  } else {
    out.push('Quando marcares um teste no calendário, o plano acrescenta revisões nos 3 dias anteriores.');
  }
  if (upcoming.size && q.goal === 'preparar-testes')
    out.push('Como o teu objetivo é preparar testes, as disciplinas com testes nas próximas 3 semanas recebem mais tempo.');
  if (q.goal === 'trabalhos-casa') out.push('Nos dias de aulas, a primeira sessão é para os trabalhos de casa.');
  if (excluded.length)
    out.push(`${names(excluded, q)} não ${excluded.length === 1 ? 'entra' : 'entram'} no plano diário. Podes acrescentar sessões quando quiseres.`);
  return out;
}

function names2(list: string[]): string {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`;
}

const PREP: Record<number, { activity: ActivityType; note: string }> = {
  3: { activity: 'revisao', note: 'Revisão geral da matéria do teste' },
  2: { activity: 'preparacao-teste', note: 'Teste de preparação no gerador de testes' },
  1: { activity: 'preparacao-teste', note: 'Revisão final e flashcards' },
};

/** As sessões de um dia concreto: o plano semanal + revisões antes dos testes. */
export function sessionsForDate(plan: StudyPlan, date: string, events: CalendarEvent[]): DaySession[] {
  const weekday = isoWeekday(date);
  const template: DaySession[] = plan.sessions
    .filter((s) => s.weekday === weekday)
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((s) => ({ ...s, date, key: `${date}:${s.id}` }));
  if (!plan.settings.autoRevisions) return template;

  const preps = events
    .filter((e) => e.type === 'teste')
    .map((e) => ({ e, diff: daysBetween(date, e.date) }))
    .filter(({ diff }) => diff >= 1 && diff <= 3)
    .sort((a, b) => a.diff - b.diff);
  if (!preps.length) return template;

  const result = [...template];
  const replaced = new Set<number>();
  let extraStart = template.length
    ? addMinutesToTime(template[template.length - 1]!.start, template[template.length - 1]!.minutes + 10)
    : plan.meta.startTime;
  for (const { e, diff } of preps) {
    const info = PREP[diff]!;
    const prep = (base: { start: string; minutes: number }): DaySession => ({
      id: `rev-${e.id}-${diff}`,
      weekday,
      start: base.start,
      minutes: base.minutes,
      subject: e.subject ?? '',
      activity: info.activity,
      note: `${info.note}${e.title ? ` — ${e.title}` : ''}`,
      date,
      key: `${date}:rev-${e.id}-${diff}`,
      eventId: e.id,
    });
    // 1.º: substituir uma sessão da mesma disciplina; 2.º: a última sessão livre do dia.
    let idx = result.findIndex((s, i) => !replaced.has(i) && !s.eventId && s.subject === e.subject && s.activity !== 'tpc');
    if (idx < 0) {
      for (let i = result.length - 1; i >= 0; i--) {
        if (!replaced.has(i) && !result[i]!.eventId && result[i]!.activity !== 'tpc') {
          idx = i;
          break;
        }
      }
    }
    if (idx >= 0) {
      result[idx] = prep(result[idx]!);
      replaced.add(idx);
    } else {
      result.push(prep({ start: extraStart, minutes: 30 }));
      replaced.add(result.length - 1);
      extraStart = addMinutesToTime(extraStart, 40);
    }
  }
  return result.sort((a, b) => a.start.localeCompare(b.start));
}

/** Sessões de uma semana inteira (segunda a domingo) a partir de uma data. */
export function sessionsForWeek(plan: StudyPlan, anyDate: string, events: CalendarEvent[]): DaySession[] {
  const start = addDays(anyDate, -isoWeekday(anyDate));
  return Array.from({ length: 7 }, (_, i) => sessionsForDate(plan, addDays(start, i), events)).flat();
}

export function newSessionId(): string {
  return sessionId();
}

/** Remove repetições e incoerências das respostas do questionário (os testes passam para o calendário). */
export function cleanQuestionnaire(q: Questionnaire): Questionnaire {
  const subjects = [...new Set(q.subjects)];
  const custom: Record<string, string> = {};
  for (const id of subjects) if (q.customSubjects[id]) custom[id] = q.customSubjects[id]!;
  return {
    ...q,
    subjects,
    customSubjects: custom,
    difficult: [...new Set(q.difficult)].filter((id) => subjects.includes(id)),
    easy: [...new Set(q.easy)].filter((id) => subjects.includes(id) && !q.difficult.includes(id)),
    studyDays: [...new Set(q.studyDays)].sort((a, b) => a - b),
    styles: [...new Set(q.styles)],
    tests: [],
  };
}

/** O horário semanal em texto (para a análise do plano feita pela IA). */
export function planAsText(plan: StudyPlan, q: Questionnaire): string {
  return plan.meta.studyDays
    .map((d) => {
      const items = plan.sessions
        .filter((s) => s.weekday === d)
        .map((s) => `${s.start} ${s.subject ? getSubject(s.subject, q.customSubjects).name : 'TPC'} (${s.minutes} min, ${ACTIVITY_LABELS[s.activity]})`);
      return `${WEEKDAYS[d]}: ${items.join('; ')}`;
    })
    .join('\n');
}
