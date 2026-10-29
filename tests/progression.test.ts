import { describe, expect, it } from 'vitest';
import type { CourseIndex } from '../src/domain/schemas.ts';
import {
  computeLessonStates, computeUnitStates, currentStreak, lessonXp, longestStreak, nextLesson, studyDaysInLastWeek,
} from '../src/engine/progression.ts';

function index(unitLessons: number[][], prereq: Record<string, string[]> = {}): CourseIndex {
  // unitLessons[s][u] = nº de lições publicadas na unidade u da secção s
  return {
    courseId: 'pt-nl', structureVersion: 1, contentHash: 'x', builtAt: '',
    sections: unitLessons.map((units, si) => ({
      id: `s${si + 1}`, order: si + 1, title: `S${si + 1}`, goal: 'g', cefr: 'A1', plannedLessons: 10,
      units: units.map((n, ui) => {
        const id = `s${si + 1}-u${String(ui + 1).padStart(2, '0')}`;
        return {
          id, sectionId: `s${si + 1}`, order: ui + 1, title: id, description: 'd', cefr: 'A1', topics: ['t'],
          prerequisites: prereq[id] ?? [], plannedLessons: 10,
          lessonIds: Array.from({ length: n }, (_, li) => `${id}-l${String(li + 1).padStart(3, '0')}`),
        };
      }),
    })),
  } as CourseIndex;
}

describe('desbloqueio', () => {
  it('a primeira unidade está disponível e a seguinte bloqueada', () => {
    const st = computeUnitStates(index([[2, 2]]), new Set());
    expect(st.get('s1-u01')).toBe('available');
    expect(st.get('s1-u02')).toBe('locked');
  });
  it('concluir uma unidade desbloqueia a seguinte (também entre secções)', () => {
    const idx = index([[1], [1]]);
    const st = computeUnitStates(idx, new Set(['s1-u01-l001']));
    expect(st.get('s1-u01')).toBe('completed');
    expect(st.get('s2-u01')).toBe('available');
  });
  it('unidades sem conteúdo ficam "em preparação" e não bloqueiam as seguintes', () => {
    const st = computeUnitStates(index([[1, 0, 1]]), new Set(['s1-u01-l001']));
    expect(st.get('s1-u02')).toBe('coming-soon');
    expect(st.get('s1-u03')).toBe('available');
  });
  it('respeita pré-requisitos explícitos', () => {
    const idx = index([[1, 1, 1]], { 's1-u03': ['s1-u01'] });
    const st = computeUnitStates(idx, new Set(['s1-u01-l001']));
    expect(st.get('s1-u03')).toBe('available');
  });
  it('navegação livre desbloqueia tudo', () => {
    const st = computeUnitStates(index([[1, 1], [1]]), new Set(), true);
    expect([...st.values()].every((s) => s === 'available')).toBe(true);
  });
  it('lições são sequenciais e as concluídas continuam acessíveis', () => {
    const idx = index([[3]]);
    const unit = idx.sections[0]!.units[0]!;
    const ls = computeLessonStates(unit, 'in-progress', new Set(['s1-u01-l001']));
    expect([...ls.values()]).toEqual(['completed', 'available', 'locked']);
  });
  it('uma unidade iniciada não volta a bloquear após atualização de conteúdo', () => {
    // A unidade 1 recebeu uma lição nova: deixou de estar completa, mas a 2 já tinha progresso.
    const idx = index([[2, 1]]);
    const st = computeUnitStates(idx, new Set(['s1-u01-l001', 's1-u02-l001']));
    expect(st.get('s1-u02')).toBe('completed');
  });
  it('próxima lição recomendada', () => {
    const idx = index([[2, 2]]);
    expect(nextLesson(idx, new Set())?.lessonId).toBe('s1-u01-l001');
    expect(nextLesson(idx, new Set(['s1-u01-l001', 's1-u01-l002']))?.lessonId).toBe('s1-u02-l001');
  });
});

describe('XP e sequência (sem castigos)', () => {
  it('XP de lição com bónus de perfeição e menos XP ao repetir', () => {
    expect(lessonXp(10, 10, false)).toBe(25);
    expect(lessonXp(7, 10, false)).toBe(17);
    expect(lessonXp(10, 10, true)).toBeLessThan(lessonXp(10, 10, false));
  });
  it('sequência conta até hoje ou ontem', () => {
    expect(currentStreak(['2026-03-01', '2026-03-02', '2026-03-03'], '2026-03-03')).toBe(3);
    expect(currentStreak(['2026-03-01', '2026-03-02'], '2026-03-03')).toBe(2); // ainda pode estudar hoje
    expect(currentStreak(['2026-03-01'], '2026-03-03')).toBe(0);
  });
  it('a melhor sequência nunca se perde', () => {
    expect(longestStreak(['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-05'])).toBe(3);
  });
  it('dias de estudo nos últimos 7 dias', () => {
    expect(studyDaysInLastWeek(['2026-03-01', '2026-03-07', '2026-02-20'], '2026-03-07')).toBe(2);
  });
});
