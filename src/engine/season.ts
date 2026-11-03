/**
 * Épocas festivas: a app muda de decoração conforme a data (hora local).
 *  - Halloween: 1 de outubro a 1 de novembro.
 *  - Natal: 2 de novembro a 6 de janeiro (Dia de Reis).
 *  - Carnaval: de 7 dias antes a 7 dias depois da terça-feira de Carnaval.
 *  - Páscoa: de 14 dias antes a 7 dias depois do domingo de Páscoa.
 */
export type Season = 'christmas' | 'halloween' | 'carnival' | 'easter';

/** Domingo de Páscoa (calendário gregoriano, algoritmo de Meeus/Jones/Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const DAY = 24 * 60 * 60 * 1000;
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Terça-feira de Carnaval: 47 dias antes da Páscoa. */
export function carnivalTuesday(year: number): Date {
  return addDays(easterSunday(year), -47);
}

export function seasonFor(date: Date = new Date()): Season | null {
  const d = dayStart(date);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const within = (from: Date, to: Date) => d.getTime() >= from.getTime() && d.getTime() <= to.getTime();

  const easter = easterSunday(y);
  if (within(addDays(easter, -14), addDays(easter, 7))) return 'easter';
  const carnival = carnivalTuesday(y);
  if (within(addDays(carnival, -7), addDays(carnival, 7))) return 'carnival';
  if (m === 10 || (m === 11 && day === 1)) return 'halloween';
  if ((m === 11 && day >= 2) || m === 12 || (m === 1 && day <= 6)) return 'christmas';
  return null;
}

/** Dias até ao fim da época atual (para testes e mensagens). */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((dayStart(b).getTime() - dayStart(a).getTime()) / DAY);
}

export const SEASON_INFO: Record<Season, { label: string; nl: string; pt: string; decorations: string[] }> = {
  christmas: { label: 'Natal', nl: 'Fijne feestdagen!', pt: 'Boas festas!', decorations: ['🎄', '❄️', '🎁', '⭐', '🔔'] },
  halloween: { label: 'Halloween', nl: 'Fijne Halloween!', pt: 'Feliz Halloween!', decorations: ['🎃', '🦇', '👻', '🕸️', '🍬'] },
  carnival: { label: 'Carnaval', nl: 'Alaaf! Fijn carnaval!', pt: 'Bom Carnaval!', decorations: ['🎭', '🎉', '🎊', '🥳', '🎺'] },
  easter: { label: 'Páscoa', nl: 'Vrolijk Pasen!', pt: 'Feliz Páscoa!', decorations: ['🥚', '🐣', '🐰', '🌷', '🪺'] },
};
