// Economia, procura por zona e hora, níveis, objetivos diários e conquistas.
import { CFG } from '../config.js';
import { clamp, pick, ri, toKm } from '../util.js';

// multiplicador de pedidos por hora (0..23)
const HOUR_RATE = [1.3, 1.1, 0.6, 0.3, 0.3, 0.4, 0.8, 1.4, 1.6, 1.3, 0.9, 0.9, 1.2, 1.2, 0.9, 0.9, 1.1, 1.5, 1.7, 1.5, 1.2, 1.1, 1.2, 1.3];
export const hourOf = (t) => Math.floor(t / 60) % 24;
export function requestRate(t, weekend, rain) {
  const h = hourOf(t);
  let r = HOUR_RATE[h];
  if (weekend && (h >= 22 || h < 3)) r *= 1.4;
  return r * (1 + rain * 0.35);
}
export function surge(t, weekend, rain) {
  const r = requestRate(t, weekend, rain);
  const s = 1 + Math.max(0, r - 1.25) * 0.7 + rain * 0.18;
  return Math.round(clamp(s, 1, 1.9) * 10) / 10;
}
// procura de recolha por bairro
export function pickupDemand(d, h, weekend) {
  const night = h >= 22 || h < 3;
  switch (d) {
    case 'R': return h >= 6 && h < 10 ? 3 : night ? 0.6 : 1.1;
    case 'D': return h >= 17 && h < 21 ? 3 : h >= 12 && h < 15 ? 1.6 : 0.6;
    case 'C': return night ? 0.9 : 1.6;
    case 'N': return night ? (weekend ? 6 : 4) : h >= 20 ? 1.5 : 0.25;
    case 'A': return h >= 6 && h < 10 ? 2.4 : h >= 12 && h < 23 ? 2 : 1;
    case 'S': return (h >= 7 && h < 10) || (h >= 17 && h < 21) ? 2.6 : 1;
    case 'H': return (h >= 7 && h < 12) || (h >= 18 && h < 24) ? 2.1 : 0.8;
    case 'r': return (h >= 12 && h < 15) || (h >= 19 && h < 24) ? 2.6 : 0.6;
    case 'M': return h >= 10 && h < 23 ? 2 : 0.2;
    case 'X': return h >= 8 && h < 20 ? 1.6 : 0.6;
    case 'U': return (h >= 8 && h < 11) || (h >= 16 && h < 20) ? 2.2 : 0.4;
    case 'V': return (h >= 10 && h < 19) ? 2 : (h >= 19 && h < 24) ? 2.4 : 0.4;
    case 'B': return h >= 11 && h < 20 ? 2.6 : h >= 20 && h < 24 ? 1.2 : 0.2;
    case 'E': return 0.3;
    default: return 0.4;
  }
}
export function destDemand(d, h, from) {
  const night = h >= 22 || h < 3;
  const morning = h >= 6 && h < 11;
  const evening = h >= 17 && h < 22;
  if (from === 'N' && night) return d === 'R' ? 5 : d === 'H' ? 1.5 : 0.3;
  switch (d) {
    case 'R': return evening || night ? 3.2 : 1;
    case 'D': return morning ? 3 : 1;
    case 'C': return 1.5;
    case 'N': return h >= 21 || h < 2 ? 2.4 : 0.2;
    case 'A': return 1.4;
    case 'S': return morning || evening ? 2 : 1;
    case 'H': return from === 'A' ? 3 : 0.9;
    case 'r': return (h >= 12 && h < 14) || (h >= 19 && h < 22) ? 2.4 : 0.5;
    case 'M': return h >= 10 && h < 21 ? 1.8 : 0.1;
    case 'X': return 0.9;
    case 'U': return morning ? 2 : 0.4;
    case 'V': return h >= 10 && h < 23 ? 2 : 0.4;
    case 'B': return h >= 9 && h < 18 ? 2.8 : 0.4;
    case 'E': return 0.2;
    default: return 0.3;
  }
}
export function fareFor(distW, minutes, vehicle, surgeMult, airport) {
  const F = CFG.FARE; const km = toKm(distW);
  let f = (F.base + F.perKm * km + F.perMin * minutes) * vehicle.fareMult * surgeMult;
  if (airport) f += F.airportFee;
  return Math.round(Math.max(F.min * vehicle.fareMult, f) * 100) / 100;
}

// ---------- níveis ----------
export const LEVEL_TITLES = ['Estreante', 'Iniciante', 'Motorista', 'Motorista Experiente', 'Profissional', 'Profissional Sénior', 'Especialista', 'Elite', 'Elite Ouro', 'Lenda da Estrada'];
export function xpForLevel(L) { return Math.round(80 * (L - 1) + 40 * (L - 1) * (L - 1)); }
export function levelFromXp(xp) { let L = 1; while (xpForLevel(L + 1) <= xp) L++; return L; }
export function levelTitle(L) { return LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((L - 1) / 1.5))]; }
export function reputationTier(r, n) {
  if (n < 5) return { name: 'Novo motorista', color: '#8ea0b8' };
  if (r >= 4.92) return { name: 'Diamante', color: '#7fe3ff' };
  if (r >= 4.85) return { name: 'Platina', color: '#d7e1ee' };
  if (r >= 4.75) return { name: 'Ouro', color: '#ffd35a' };
  if (r >= 4.6) return { name: 'Prata', color: '#c0c8d0' };
  if (r >= 4.4) return { name: 'Bronze', color: '#d08a4e' };
  return { name: 'Em risco', color: '#ff5a5a' };
}

// ---------- objetivos diários ----------
const OBJ_TEMPLATES = [
  (L) => ({ id: 'trips', text: `Completa ${6 + L} viagens`, target: 6 + L, reward: 8 + L * 2 }),
  (L) => ({ id: 'earn', text: `Ganha ${40 + L * 12} € líquidos`, target: 40 + L * 12, reward: 10 + L * 2 }),
  () => ({ id: 'five', text: 'Recebe 4 avaliações de 5 ★', target: 4, reward: 10 }),
  () => ({ id: 'airport', text: 'Faz 1 viagem de ou para o aeroporto', target: 1, reward: 8 }),
  () => ({ id: 'night', text: 'Faz 3 viagens depois das 22:00', target: 3, reward: 14 }),
  () => ({ id: 'hours', text: 'Fica online durante 5 horas', target: 300, reward: 12, fmt: 'min' }),
  () => ({ id: 'tips', text: 'Recebe 5 € em gorjetas', target: 5, reward: 8 }),
  () => ({ id: 'streak', text: 'Aceita 5 pedidos seguidos', target: 5, reward: 7 }),
];
export function makeObjectives(level, seed) {
  const pool = OBJ_TEMPLATES.map((f) => f(level));
  const out = [];
  let i = seed % pool.length;
  while (out.length < 3) { const o = pool[i % pool.length]; if (!out.find((x) => x.id === o.id)) out.push({ ...o, done: false }); i += 3; }
  return out;
}
export function objectiveProgress(o, today) {
  switch (o.id) {
    case 'trips': return today.trips;
    case 'earn': return today.net;
    case 'five': return today.five;
    case 'airport': return today.airport;
    case 'night': return today.night;
    case 'hours': return today.onlineMin;
    case 'tips': return today.tips;
    case 'streak': return today.bestStreak;
    default: return 0;
  }
}

// ---------- conquistas ----------
export const ACHIEVEMENTS = [
  { id: 'first', name: 'Primeira viagem', desc: 'Completa a tua primeira viagem.', icon: '🚗', test: (s) => s.stats.trips >= 1 },
  { id: 't10', name: 'A aquecer', desc: 'Completa 10 viagens.', icon: '🔟', test: (s) => s.stats.trips >= 10 },
  { id: 't50', name: 'Rodado', desc: 'Completa 50 viagens.', icon: '🛞', test: (s) => s.stats.trips >= 50 },
  { id: 't100', name: 'Centenário', desc: 'Completa 100 viagens.', icon: '💯', test: (s) => s.stats.trips >= 100 },
  { id: 't500', name: 'Veterano', desc: 'Completa 500 viagens.', icon: '🏆', test: (s) => s.stats.trips >= 500 },
  { id: 'five1', name: 'Cinco estrelas', desc: 'Recebe a primeira avaliação de 5 ★.', icon: '⭐', test: (s) => s.stats.five >= 1 },
  { id: 'five50', name: 'Favorito da cidade', desc: 'Recebe 50 avaliações de 5 ★.', icon: '🌟', test: (s) => s.stats.five >= 50 },
  { id: 'day100', name: 'Dia em cheio', desc: 'Lucra 100 € num só dia.', icon: '💶', test: (s) => s.stats.bestDay >= 100 },
  { id: 'k1', name: 'Primeiro milhar', desc: 'Ganha 1000 € no total.', icon: '💰', test: (s) => s.stats.earned >= 1000 },
  { id: 'k5', name: 'Empresário', desc: 'Ganha 5000 € no total.', icon: '🏦', test: (s) => s.stats.earned >= 5000 },
  { id: 'car1', name: 'Carro novo', desc: 'Compra o teu primeiro veículo.', icon: '🔑', test: (s) => s.owned.length >= 2 },
  { id: 'carAll', name: 'Frota completa', desc: 'Desbloqueia todos os veículos.', icon: '🚘', test: (s) => s.owned.length >= 4 },
  { id: 'late', name: 'Coruja da noite', desc: 'Trabalha até às 02:00.', icon: '🦉', test: (s) => s.flags.workedLate },
  { id: 'air10', name: 'Rota do aeroporto', desc: 'Faz 10 viagens de/para o aeroporto.', icon: '✈️', test: (s) => s.stats.airport >= 10 },
  { id: 'tips100', name: 'Mãos largas', desc: 'Recebe 100 € em gorjetas no total.', icon: '🎁', test: (s) => s.stats.tips >= 100 },
  { id: 'rude5', name: 'Sangue frio', desc: 'Recebe 5 ★ de um passageiro mal-humorado.', icon: '🧊', test: (s) => s.flags.rudeFive },
  { id: 'rain10', name: 'Rei da chuva', desc: 'Faz 10 viagens com chuva.', icon: '☔', test: (s) => s.stats.rainTrips >= 10 },
  { id: 'lvl5', name: 'Profissional', desc: 'Chega ao nível 5.', icon: '🎖️', test: (s) => s.level >= 5 },
  { id: 'lvl10', name: 'Lenda', desc: 'Chega ao nível 10.', icon: '👑', test: (s) => s.level >= 10 },
  { id: 'fav', name: 'Motorista de confiança', desc: 'Ganha o primeiro cliente habitual.', icon: '💛', test: (s) => (s.regulars || []).length >= 1 },
  { id: 'story', name: 'Contador de histórias', desc: 'Acompanha a história completa de um cliente habitual.', icon: '📖', test: (s) => (s.flags.storyDone || 0) >= 1 },
  { id: 'pool10', name: 'Boleia partilhada', desc: 'Leva 10 passageiros em viagens partilhadas.', icon: '👥', test: (s) => (s.stats.pool || 0) >= 10 },
  { id: 'goal', name: 'Sonho realizado', desc: 'Cumpre um objetivo de poupança.', icon: '🐷', test: (s) => (s.savings?.done || []).length >= 1 },
  { id: 'week', name: 'Semana completa', desc: 'Trabalha 7 dias.', icon: '📅', test: (s) => s.days.length >= 7 },
];

export function randomBreakdown() { return pick(['Luz do motor acesa', 'Ruído nos travões', 'Pneu com pouca pressão']); }
export const rint = ri;
