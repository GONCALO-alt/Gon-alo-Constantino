// Eventos da cidade: concentram procura e preço dinâmico numa zona a certas horas.
import { mulberry32, pick, ri } from '../util.js';

const RIVALS = ['Lisboa', 'Braga', 'Coimbra', 'Faro', 'Setúbal', 'Guimarães', 'Aveiro'];
const BANDS = ['Os Navegantes', 'Maré Alta', 'Luna & Os Faróis', 'DJ Atlântico', 'Fado Novo', 'Banda do Cais'];
export const EVENT_TYPES = {
  futebol: { icon: '⚽', venue: 'E', make: (r) => ({ title: `Futebol: Porto Azul FC × ${pick(RIVALS, r)}`, start: ri(18, 21, r) * 60, dur: 120 }) },
  concerto: { icon: '🎸', venue: 'P', make: (r) => ({ title: `Concerto de ${pick(BANDS, r)} no Parque da Cidade`, start: ri(21, 22, r) * 60, dur: 180 }) },
  cruzeiro: { icon: '🚢', venue: 'B', make: () => ({ title: 'Navio de cruzeiro atracado junto à praia', start: 8 * 60, dur: 240, arrival: true }) },
  festa: { icon: '🎉', venue: 'V', make: (r) => ({ title: 'Festa popular na Vila Velha (sardinhas e música)', start: ri(19, 20, r) * 60, dur: 240 }) },
  congresso: { icon: '💼', venue: 'D', make: () => ({ title: 'Congresso de Tecnologia no centro de negócios', start: 9 * 60, dur: 480 }) },
};

export function makeEvents(day, weekend) {
  const r = mulberry32(day * 9973 + 17);
  const pool = weekend ? ['futebol', 'concerto', 'festa', 'cruzeiro', 'futebol'] : ['futebol', 'congresso', 'cruzeiro', 'concerto', 'festa'];
  const n = r() < 0.35 ? 2 : 1; const out = [];
  while (out.length < n) {
    const id = pick(pool, r); if (out.find((e) => e.type === id)) continue;
    const t = EVENT_TYPES[id]; const ev = t.make(r);
    out.push({ type: id, icon: t.icon, venue: t.venue, title: ev.title, start: ev.start, end: ev.start + ev.dur, arrival: !!ev.arrival });
  }
  return out.sort((a, b) => a.start - b.start);
}
const tod = (t) => ((t % 1440) + 1440) % 1440 < 360 ? (t % 1440) + 1440 : t % 1440; // 00:00–02:00 contam como 24:00–26:00
// multiplicador de recolhas (pessoas a sair do evento ou a chegar à cidade)
export function eventPickup(loc, t, events) {
  let k = 1; const m = tod(t);
  for (const e of events || []) {
    if (loc.district !== e.venue) continue;
    if (e.arrival ? (m >= e.start && m < e.end) : (m >= e.end - 15 && m < e.end + 70)) k *= 7;
  }
  return k;
}
// multiplicador de destinos (pessoas a ir para o evento)
export function eventDest(loc, t, events) {
  let k = 1; const m = tod(t);
  for (const e of events || []) if (loc.district === e.venue && !e.arrival && m >= e.start - 120 && m < e.start + 15) k *= 5;
  return k;
}
export function eventSurge(loc, t, events) {
  const m = tod(t);
  for (const e of events || []) if (loc.district === e.venue && (e.arrival ? m >= e.start && m < e.end : m >= e.end - 10 && m < e.end + 60)) return 0.5;
  return 0;
}
export function eventStatus(e, t) {
  const m = tod(t);
  if (m < e.start - 120) return 'mais tarde';
  if (m < e.start) return 'a começar em breve';
  if (m < e.end) return 'a decorrer';
  if (m < e.end + 70) return 'a terminar — muita procura!';
  return 'terminou';
}
