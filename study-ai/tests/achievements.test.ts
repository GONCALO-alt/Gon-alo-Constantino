import { describe, expect, it } from 'vitest';
import { earnedKeys, level, medals, weeklyChallenges, type AchievementStats } from '../src/achievements.ts';
import { longestRun } from '../shared/types.ts';

const zero: AchievementStats = {
  totalMinutes: 0,
  timerMinutes: 0,
  questions: 0,
  summaries: 0,
  cards: { total: 0, mastered: 0 },
  weekMinutes: 0,
  weekSessions: 0,
  achievements: {
    bestStreak: 0, studyDays: 0, sessionsDone: 0, testsDone: 0, testsExcellent: 0, reviewsTotal: 0,
    subjectsStudied: 0, weekTests: 0, weekReviews: 0, weekQuestions: 0, weekDays: 0,
  },
};

describe('medalhas e pontos', () => {
  it('ao início não há medalhas e o nível é Iniciante', () => {
    const list = medals(zero);
    expect(list.every((m) => m.tier === null)).toBe(true);
    expect(list.find((m) => m.id === 'tempo')!.next!.text).toBe('Estudar 1 hora no total');
    expect(level(zero)).toMatchObject({ xp: 0, level: 1, name: 'Iniciante' });
  });

  it('ganha bronze, prata e ouro conforme os objetivos', () => {
    const s: AchievementStats = { ...zero, totalMinutes: 700, achievements: { ...zero.achievements, bestStreak: 30, testsDone: 1 } };
    const list = medals(s);
    const tempo = list.find((m) => m.id === 'tempo')!;
    expect(tempo.tier).toBe('prata');
    expect(tempo.next).toEqual({ tier: 'ouro', goal: 3000, text: 'Estudar 50 horas no total' });
    expect(list.find((m) => m.id === 'sequencia')!.tier).toBe('ouro');
    expect(list.find((m) => m.id === 'sequencia')!.next).toBeNull();
    expect(list.find((m) => m.id === 'testes')!.tier).toBe('bronze');
    expect(earnedKeys(list)).toEqual(['tempo:bronze', 'tempo:prata', 'sequencia:bronze', 'sequencia:prata', 'sequencia:ouro', 'testes:bronze']);
    const l = level(s, list);
    expect(l.xp).toBe(700 + 25 + 50 + 150 + 50 + 150 + 400 + 50);
    expect(l.name).toBe('Dedicado');
  });

  it('desafios da semana: o tempo planeado e mais dois que mudam de semana para semana', () => {
    const s: AchievementStats = { ...zero, weekMinutes: 200, achievements: { ...zero.achievements, weekTests: 1 } };
    const a = weeklyChallenges(s, '2026-11-09', 5 * 60);
    expect(a).toHaveLength(3);
    expect(a[0]).toMatchObject({ id: 'minutos', goal: 240, value: 200, done: false });
    const b = weeklyChallenges(s, '2026-11-16', 5 * 60);
    expect(b.map((c) => c.id)).not.toEqual(a.map((c) => c.id));
    expect(new Set(a.map((c) => c.id)).size).toBe(3);
    const teste = [...a, ...b, ...weeklyChallenges(s, '2026-11-23', null)].find((c) => c.id === 'teste');
    if (teste) expect(teste.done).toBe(true);
  });

  it('conta a maior sequência de dias seguidos', () => {
    expect(longestRun([])).toBe(0);
    expect(longestRun(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06'])).toBe(3);
    expect(longestRun(['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-01'])).toBe(3);
  });
});
