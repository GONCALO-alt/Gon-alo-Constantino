import { describe, expect, it } from 'vitest';
import { addDays, isoWeekday } from '../shared/dates.ts';
import { generatePlan, sessionsForDate, splitDay } from '../shared/planner.ts';
import type { CalendarEvent, Questionnaire } from '../shared/types.ts';

const base: Questionnaire = {
  name: 'Ana',
  year: '9',
  subjects: ['portugues', 'matematica', 'ingles', 'historia', 'geografia', 'fisico-quimica', 'ciencias', 'educacao-fisica', 'cidadania'],
  customSubjects: {},
  difficult: ['matematica', 'fisico-quimica'],
  easy: ['ingles'],
  dailyMinutes: 90,
  studyDays: [0, 1, 2, 3, 4],
  startTime: '17:30',
  goal: 'melhorar-notas',
  styles: ['exercicios', 'resumos'],
  tests: [],
};

const TODAY = '2026-11-09'; // segunda-feira

describe('splitDay', () => {
  it('divide o tempo em blocos de 5 em 5 minutos que somam o total', () => {
    for (const m of [20, 30, 45, 60, 90, 120, 180]) {
      const blocks = splitDay(m);
      expect(blocks.reduce((a, b) => a + b, 0)).toBe(m);
      for (const b of blocks) {
        expect(b % 5).toBe(0);
        expect(b).toBeLessThanOrEqual(50);
      }
    }
    expect(splitDay(30)).toEqual([30]);
  });
});

describe('generatePlan', () => {
  const plan = generatePlan(base, [], TODAY);
  const count = (id: string) => plan.sessions.filter((s) => s.subject === id).length;

  it('respeita os dias, o tempo e a hora de início', () => {
    expect(new Set(plan.sessions.map((s) => s.weekday))).toEqual(new Set([0, 1, 2, 3, 4]));
    for (const d of [0, 1, 2, 3, 4]) {
      const day = plan.sessions.filter((s) => s.weekday === d);
      expect(day.reduce((a, s) => a + s.minutes, 0)).toBe(90);
      expect(day.map((s) => s.start).sort()[0]).toBe('17:30');
    }
  });

  it('dá mais tempo às disciplinas difíceis e menos às fáceis', () => {
    expect(count('matematica')).toBeGreaterThan(count('ingles'));
    expect(count('fisico-quimica')).toBeGreaterThan(count('ingles'));
    expect(count('educacao-fisica')).toBe(0);
    expect(count('cidadania')).toBe(0);
  });

  it('não repete a mesma disciplina no mesmo dia e põe as difíceis primeiro', () => {
    for (const d of [0, 1, 2, 3, 4]) {
      const day = plan.sessions.filter((s) => s.weekday === d).sort((a, b) => a.start.localeCompare(b.start));
      expect(new Set(day.map((s) => s.subject)).size).toBe(day.length);
      const firstEasyIdx = day.findIndex((s) => !base.difficult.includes(s.subject));
      const lastHardIdx = day.map((s) => base.difficult.includes(s.subject)).lastIndexOf(true);
      if (firstEasyIdx >= 0 && lastHardIdx >= 0) expect(lastHardIdx).toBeLessThan(firstEasyIdx);
    }
  });

  it('inclui consolidação, objetivos semanais e explicações', () => {
    expect(plan.sessions.some((s) => s.activity === 'consolidacao' && base.difficult.includes(s.subject))).toBe(true);
    expect(plan.weeklyGoals.length).toBeGreaterThanOrEqual(3);
    expect(plan.insights.join(' ')).toContain('Matemática');
  });

  it('segue o estilo de aprendizagem', () => {
    const acts = new Set(plan.sessions.map((s) => s.activity));
    expect(acts.has('exercicios')).toBe(true);
    expect(acts.has('resumo')).toBe(true);
  });

  it('com objetivo «trabalhos de casa» começa os dias de aulas pelos TPC', () => {
    const p = generatePlan({ ...base, goal: 'trabalhos-casa' }, [], TODAY);
    for (const d of [0, 1, 2, 3, 4]) {
      const first = p.sessions.filter((s) => s.weekday === d).sort((a, b) => a.start.localeCompare(b.start))[0];
      expect(first?.activity).toBe('tpc');
    }
  });
});

describe('sessionsForDate — revisões antes dos testes', () => {
  const testDate = addDays(TODAY, 4); // sexta-feira
  const events: CalendarEvent[] = [{ id: 'e1', type: 'teste', subject: 'historia', title: 'Teste de História', date: testDate, notes: '' }];
  const plan = generatePlan(base, events, TODAY);

  it('marca revisões nos 3 dias anteriores ao teste, sem aumentar o tempo do dia', () => {
    for (const diff of [3, 2, 1]) {
      const date = addDays(testDate, -diff);
      const day = sessionsForDate(plan, date, events);
      const rev = day.filter((s) => s.eventId === 'e1');
      expect(rev).toHaveLength(1);
      expect(rev[0]!.subject).toBe('historia');
      const template = plan.sessions.filter((s) => s.weekday === isoWeekday(date));
      expect(day.reduce((a, s) => a + s.minutes, 0)).toBe(template.reduce((a, s) => a + s.minutes, 0));
    }
    expect(sessionsForDate(plan, testDate, events).some((s) => s.eventId)).toBe(false);
  });

  it('num dia sem estudo acrescenta a revisão e pode ser desligado', () => {
    const sundayTest: CalendarEvent[] = [{ id: 'e2', type: 'teste', subject: 'matematica', title: 'Teste', date: addDays(TODAY, 7), notes: '' }];
    const sunday = addDays(TODAY, 6);
    expect(sessionsForDate(plan, sunday, sundayTest).filter((s) => s.eventId === 'e2')).toHaveLength(1);
    const off = { ...plan, settings: { autoRevisions: false } };
    expect(sessionsForDate(off, sunday, sundayTest)).toHaveLength(0);
  });
});
