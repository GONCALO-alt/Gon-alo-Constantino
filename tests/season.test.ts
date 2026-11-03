/**
 * Épocas festivas (engine/season.ts).
 */
import { describe, expect, it } from 'vitest';
import { carnivalTuesday, easterSunday, seasonFor } from '../src/engine/season.ts';

const d = (s: string) => { const [y, m, day] = s.split('-').map(Number); return new Date(y!, m! - 1, day!, 12); };
const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

describe('datas móveis', () => {
  it('domingo de Páscoa', () => {
    expect(iso(easterSunday(2025))).toBe('2025-04-20');
    expect(iso(easterSunday(2026))).toBe('2026-04-05');
    expect(iso(easterSunday(2027))).toBe('2027-03-28');
    expect(iso(easterSunday(2024))).toBe('2024-03-31');
  });
  it('terça-feira de Carnaval (47 dias antes da Páscoa)', () => {
    expect(iso(carnivalTuesday(2026))).toBe('2026-02-17');
    expect(iso(carnivalTuesday(2027))).toBe('2027-02-09');
  });
});

describe('época de cada dia', () => {
  it('Halloween: 1 de outubro a 1 de novembro', () => {
    expect(seasonFor(d('2026-09-30'))).toBeNull();
    expect(seasonFor(d('2026-10-01'))).toBe('halloween');
    expect(seasonFor(d('2026-10-31'))).toBe('halloween');
    expect(seasonFor(d('2026-11-01'))).toBe('halloween');
  });
  it('Natal: 2 de novembro a 6 de janeiro', () => {
    expect(seasonFor(d('2026-11-02'))).toBe('christmas');
    expect(seasonFor(d('2026-12-25'))).toBe('christmas');
    expect(seasonFor(d('2027-01-06'))).toBe('christmas');
    expect(seasonFor(d('2027-01-07'))).toBeNull();
  });
  it('Carnaval: uma semana antes e uma depois da terça-feira de Carnaval', () => {
    expect(seasonFor(d('2026-02-09'))).toBeNull();
    expect(seasonFor(d('2026-02-10'))).toBe('carnival');
    expect(seasonFor(d('2026-02-17'))).toBe('carnival');
    expect(seasonFor(d('2026-02-24'))).toBe('carnival');
    expect(seasonFor(d('2026-02-25'))).toBeNull();
  });
  it('Páscoa: duas semanas antes e uma depois', () => {
    expect(seasonFor(d('2026-03-21'))).toBeNull();
    expect(seasonFor(d('2026-03-22'))).toBe('easter');
    expect(seasonFor(d('2026-04-05'))).toBe('easter');
    expect(seasonFor(d('2026-04-12'))).toBe('easter');
    expect(seasonFor(d('2026-04-13'))).toBeNull();
  });
  it('resto do ano sem decoração', () => {
    expect(seasonFor(d('2026-07-15'))).toBeNull();
    expect(seasonFor(d('2026-05-20'))).toBeNull();
  });
});
