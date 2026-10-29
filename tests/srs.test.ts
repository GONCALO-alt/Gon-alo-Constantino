import { describe, expect, it } from 'vitest';
import { applyReview, intervalFor, isDue, isHard, newSchedule, pickDue, SRS_CONFIG } from '../src/engine/srs.ts';

const DAY = 86_400_000;
const t0 = Date.UTC(2026, 0, 1);

describe('revisão espaçada', () => {
  it('um item novo fica pronto em minutos', () => {
    const s = newSchedule('v-huis', t0);
    expect(s.box).toBe(0);
    expect(isDue(s, t0)).toBe(false);
    expect(isDue(s, t0 + SRS_CONFIG.intervals[0]!)).toBe(true);
  });
  it('respostas certas aumentam o intervalo', () => {
    let s = newSchedule('v-huis', t0);
    const gaps: number[] = [];
    let now = t0;
    for (let i = 0; i < 4; i++) {
      now = s.dueAt;
      s = applyReview(s, 'correct', now);
      gaps.push(s.dueAt - now);
    }
    expect(gaps).toEqual([...gaps].sort((a, b) => a - b));
    expect(s.box).toBe(4);
    expect(s.correct).toBe(4);
  });
  it('um erro torna o item elegível muito mais cedo', () => {
    let s = newSchedule('v-huis', t0);
    for (let i = 0; i < 4; i++) s = applyReview(s, 'correct', s.dueAt);
    const before = s.dueAt;
    const now = before - 2 * DAY;
    const after = applyReview(s, 'incorrect', now);
    expect(after.dueAt).toBe(now + SRS_CONFIG.relearnDelay);
    expect(after.dueAt).toBeLessThan(before);
    expect(after.box).toBe(s.box - SRS_CONFIG.lapsePenalty);
    expect(after.lapses).toBe(1);
  });
  it('"quase" mantém a caixa e revê mais cedo', () => {
    const s = { ...newSchedule('x', t0), box: 3 };
    const r = applyReview(s, 'almost', t0);
    expect(r.box).toBe(3);
    expect(r.dueAt - t0).toBeLessThan(intervalFor(3, 3));
  });
  it('confiança alta salta uma caixa', () => {
    expect(applyReview(newSchedule('x', t0), 'correct', t0, 'high').box).toBe(2);
  });
  it('itens difíceis encurtam os intervalos', () => {
    expect(intervalFor(3, 5)).toBeLessThan(intervalFor(3, 1));
  });
  it('pickDue dá prioridade aos itens mais frágeis e limita a sessão', () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ ...newSchedule(`v-${i}`, t0), box: i % 5, dueAt: t0 }));
    const picked = pickDue(items, t0 + 1, 10);
    expect(picked).toHaveLength(10);
    expect(picked[0]!.box).toBe(0);
  });
  it('isHard deteta muitos erros', () => {
    expect(isHard({ ...newSchedule('x', t0), reviews: 5, incorrect: 3 })).toBe(true);
    expect(isHard({ ...newSchedule('x', t0), reviews: 5, incorrect: 0 })).toBe(false);
  });
});
