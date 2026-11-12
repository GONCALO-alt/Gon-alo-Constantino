// Datas sem horas (YYYY-MM-DD), sempre no calendário local.

export const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
export const WEEKDAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
export const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function isISODate(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return toISODate(parseISODate(s)) === s;
}

export function today(): string {
  return toISODate(new Date());
}

/** Data de hoje num fuso horário (usado no servidor para os limites diários). */
export function todayInTimeZone(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function addDays(s: string, n: number): string {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** 0 = segunda … 6 = domingo. */
export function isoWeekday(s: string): number {
  return (parseISODate(s).getDay() + 6) % 7;
}

export function weekStart(s: string): string {
  return addDays(s, -isoWeekday(s));
}

export function weekDates(s: string): string[] {
  const start = weekStart(s);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86_400_000);
}

export function formatDateLong(s: string): string {
  const d = parseISODate(s);
  return `${WEEKDAYS[isoWeekday(s)]?.toLowerCase()}-feira, ${d.getDate()} de ${MONTHS[d.getMonth()]}`
    .replace('sábado-feira', 'sábado')
    .replace('domingo-feira', 'domingo');
}

export function formatDateShort(s: string): string {
  const d = parseISODate(s);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

export function formatDayMonth(s: string): string {
  const d = parseISODate(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]?.slice(0, 3)}`;
}

/** «hoje», «amanhã», «daqui a 5 dias», «há 2 dias». */
export function relativeDay(target: string, from = today()): string {
  const n = daysBetween(from, target);
  if (n === 0) return 'hoje';
  if (n === 1) return 'amanhã';
  if (n === -1) return 'ontem';
  if (n > 1) return `daqui a ${n} dias`;
  return `há ${-n} dias`;
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToTime(total: number): string {
  const t = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}

export function addMinutesToTime(t: string, minutes: number): string {
  return minutesToTime(timeToMinutes(t) + minutes);
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
