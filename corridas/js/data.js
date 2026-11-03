/* Grelha de Partida — dados do jogo: países, categorias, equipas, pilotos e pistas (tudo inventado). */
'use strict';

const flagOf = (a2) => String.fromCodePoint(...[...a2].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

const COUNTRIES = [
  ['PT', 'Portugal'], ['BR', 'Brasil'], ['ES', 'Espanha'], ['FR', 'França'], ['IT', 'Itália'], ['DE', 'Alemanha'], ['GB', 'Reino Unido'],
  ['NL', 'Países Baixos'], ['BE', 'Bélgica'], ['CH', 'Suíça'], ['AT', 'Áustria'], ['MC', 'Mónaco'], ['FI', 'Finlândia'], ['SE', 'Suécia'],
  ['DK', 'Dinamarca'], ['NO', 'Noruega'], ['PL', 'Polónia'], ['US', 'Estados Unidos'], ['CA', 'Canadá'], ['MX', 'México'], ['AR', 'Argentina'],
  ['CO', 'Colômbia'], ['CL', 'Chile'], ['JP', 'Japão'], ['CN', 'China'], ['KR', 'Coreia do Sul'], ['IN', 'Índia'], ['AU', 'Austrália'],
  ['NZ', 'Nova Zelândia'], ['ZA', 'África do Sul'], ['AE', 'Emirados Árabes'], ['TH', 'Tailândia'], ['IE', 'Irlanda'], ['CZ', 'Chéquia'],
  ['EE', 'Estónia'], ['AO', 'Angola'], ['MZ', 'Moçambique'], ['CV', 'Cabo Verde'], ['UY', 'Uruguai'], ['VE', 'Venezuela'],
];
const countryName = (a2) => (COUNTRIES.find((c) => c[0] === a2) || [a2, a2])[1];

const FIRST = ['Lucas', 'Mateo', 'Oliver', 'Noah', 'Léo', 'Max', 'Kimi', 'Oscar', 'Liam', 'Enzo', 'Rafael', 'Tomás', 'Hugo', 'Elias', 'Yuki', 'Arthur',
  'Felipe', 'Theo', 'Sebastián', 'Jonas', 'Nico', 'Gabriel', 'Isack', 'Marco', 'Dino', 'Luca', 'Alex', 'Victor', 'Ryo', 'Diego', 'Emil', 'Ollie',
  'Joaquim', 'Bruno', 'Santiago', 'Aiden', 'Pierre', 'Carlos', 'Andrea', 'Finn', 'Kai', 'Leon', 'Zane', 'Igor', 'Tiago', 'Duarte', 'Matías', 'Jack'];
const LAST = ['Moreau', 'Silva', 'Novak', 'Bergström', 'Kowalski', 'Hartmann', 'Rossi', 'Fischer', 'Okafor', 'Tanaka', 'Navarro', 'Lindqvist',
  'Dubois', 'Costa', 'Ferraz', 'van Dijk', 'Albuquerque', 'Ricci', 'Moreno', 'Kato', 'Nakamura', 'Becker', 'Lambert', 'Andersen', 'Pereira',
  'Castelli', 'Hughes', 'Walsh', 'Duarte', 'Vidal', 'Romero', 'Schulz', 'Kovac', 'Mendes', 'Laurent', 'Bianchi', 'Sato', 'Petrov', 'Holm',
  'Quintero', 'Reyes', 'Vasconcelos', 'Brandt', 'Leclair', 'Oyama', 'Marchetti', 'Sousa', 'Franco', 'Winter', 'Sterling'];

// ---------- Categorias (carros com números próximos dos reais) ----------
// P = potência (W), m = massa com piloto (kg), vtop = velocidade máxima (m/s), cl = carga aerodinâmica (N por (m/s)²),
// mu = aderência dos pneus, L = distância entre eixos (m), a = do centro de massa ao eixo da frente, h = altura do centro de massa
const CATS = [
  { id: 'kart', n: 'Karting', short: 'KART', P: 21000, m: 165, vtop: 34, cl: 0, mu: 1.3, L: 1.05, a: 0.6, h: 0.26, lock: 0.42, acc0: 6.5, len: [950, 1250], W: 8, runoff: 7,
    gears: 1, rpm: [3000, 14500], laps: [4, 7, 10], rounds: 5, pits: false, mandatory: false, prize: 260, salary: 0, carLen: 1.8, carW: 1.35 },
  { id: 'f4', n: 'Fórmula 4', short: 'F4', P: 120000, m: 570, vtop: 61, cl: 0.6, mu: 1.45, L: 2.75, a: 1.5, h: 0.3, lock: 0.34, acc0: 8, len: [3000, 3800], W: 12, runoff: 14,
    gears: 6, rpm: [3500, 7500], laps: [4, 6, 9], rounds: 6, pits: false, mandatory: false, prize: 900, salary: 300, carLen: 4.3, carW: 1.75 },
  { id: 'f3', n: 'Fórmula 3', short: 'F3', P: 280000, m: 670, vtop: 75, cl: 1.4, mu: 1.5, L: 2.95, a: 1.6, h: 0.3, lock: 0.32, acc0: 9.5, len: [3300, 4200], W: 13, runoff: 15,
    gears: 6, rpm: [4000, 8500], laps: [5, 8, 11], rounds: 6, pits: true, mandatory: false, prize: 2200, salary: 900, carLen: 4.95, carW: 1.85 },
  { id: 'f2', n: 'Fórmula 2', short: 'F2', P: 450000, m: 760, vtop: 83, cl: 2.3, mu: 1.55, L: 3.13, a: 1.7, h: 0.3, lock: 0.31, acc0: 11, len: [3500, 4500], W: 13, runoff: 16,
    gears: 6, rpm: [4500, 10000], laps: [6, 10, 14], rounds: 7, pits: true, mandatory: true, prize: 5000, salary: 2500, carLen: 5.22, carW: 1.9 },
  { id: 'f1', n: 'Fórmula 1', short: 'F1', P: 750000, m: 800, vtop: 94, cl: 4.1, mu: 1.65, L: 3.6, a: 1.9, h: 0.28, lock: 0.3, acc0: 13, len: [3700, 4800], W: 14, runoff: 17,
    gears: 8, rpm: [5000, 12500], laps: [7, 12, 18], rounds: 8, pits: true, mandatory: true, prize: 14000, salary: 9000, carLen: 5.6, carW: 2.0 },
];
const catById = (id) => CATS.find((c) => c.id === id);
const nextCat = (id) => CATS[CATS.findIndex((c) => c.id === id) + 1] || null;
const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

// pneus: aderência e duração (em fração da corrida, para que a estratégia conte em qualquer duração)
const COMPOUNDS = {
  S: { n: 'Macios', c: '#e8463a', grip: 1.045, life: 0.48 },
  M: { n: 'Médios', c: '#f2c230', grip: 1.0, life: 0.7 },
  H: { n: 'Duros', c: '#f2f2f2', grip: 0.963, life: 0.98 },
};

// equipas inventadas por categoria: [nome, cor principal, cor secundária, competitividade]
const TEAMS = {
  f4: [['Kestrel Junior', '#1d6fe0', '#ffffff', 1.012], ['Pinheiro Racing', '#1a8a4a', '#f4d03f', 1.008], ['Blue Fin Racing', '#0fb5c9', '#0b2340', 1.004],
    ['Volta Academy', '#e85d1c', '#1b1b1b', 1.0], ['Corsa Giovani', '#c8102e', '#ffffff', 0.998], ['Northgate Racing', '#5b2c83', '#ffd447', 0.995],
    ['Sol Nascente', '#f0b323', '#c8102e', 0.993], ['Iberia Talents', '#a50f2d', '#f2c230', 0.99], ['Alpen Speed', '#e6e6e6', '#d0021b', 0.988], ['Cobalto Motorsport', '#2348a3', '#9ad0ff', 0.985]],
  f3: [['Halcyon Racing', '#11284b', '#f5a623', 1.012], ['Magma Motorsport', '#d0421b', '#2b2b2b', 1.008], ['Delta Corse', '#0057b8', '#ffffff', 1.004],
    ['Rivera GP', '#00a19a', '#ffffff', 1.0], ['Stormline', '#4a4f57', '#7fe0ff', 0.997], ['Kaiju Racing', '#7d1fa3', '#d8ff3c', 0.995],
    ['Brasa Motorsport', '#f2c230', '#1d8a3a', 0.992], ['Lynx Engineering', '#ff6f00', '#122033', 0.99], ['Oranje Speed', '#ff7b00', '#1e3c96', 0.988], ['Atlântico Racing', '#0d3b66', '#4cc9f0', 0.985]],
  f2: [['Apex Grand Prix', '#c6002b', '#ffd400', 1.012], ['Valkyrie Racing', '#2b2d42', '#ef233c', 1.008], ['Hermes Motorsport', '#f77f00', '#003049', 1.004],
    ['Ondina Racing', '#3a86ff', '#ffffff', 1.0], ['Zenith Corse', '#1b998b', '#f4f1de', 0.997], ['Black Pine', '#111111', '#58c27d', 0.995],
    ['Solaris', '#ffbe0b', '#3a0ca3', 0.992], ['Torre Racing', '#8d0801', '#f4d58d', 0.99], ['Equinox', '#6c757d', '#00f5d4', 0.988], ['Fénix GP', '#ff4d00', '#2b2b2b', 0.985]],
  f1: [['Aurora Grand Prix', '#0b1f4b', '#e10600', 1.015], ['Vortex Racing', '#cc0000', '#ffcc00', 1.011], ['Titan Motorsport', '#00a19b', '#c0c0c0', 1.007],
    ['Falcão Corse', '#ff8000', '#1e1e1e', 1.003], ['Nordlicht Racing', '#1e5bc6', '#ffffff', 1.0], ['Sakura Speed', '#f2f2f2', '#d4145a', 0.996],
    ['Condor Racing', '#006f62', '#cedc00', 0.993], ['Atlas Grand Prix', '#2b4562', '#f4a259', 0.99], ['Lusitânia Racing', '#046a38', '#da291c', 0.987], ['Meridian Racing', '#6a0dad', '#ffd700', 0.984]],
};

// pistas inventadas por categoria
const TRACKS = {
  kart: [['Kartódromo Vale Verde', 'PT'], ['Pista do Moinho', 'ES'], ['Kart Arena Lago Azul', 'IT'], ['Kartódromo da Ribeira', 'BR'], ['Circuito das Dunas', 'FR'], ['Kartbahn Tannenwald', 'DE'], ['Pista Sol Poente', 'MX']],
  f4: [['Circuito da Serra Azul', 'PT'], ['Autódromo Costa Dourada', 'ES'], ['Ring Eichenwald', 'DE'], ['Circuit des Falaises', 'FR'], ['Silver Bay Circuit', 'GB'], ['Circuito Lago Nero', 'IT'], ['Autódromo Vale do Sol', 'BR']],
  f3: [['Circuito Lago Nero', 'IT'], ['Ring Eichenwald', 'DE'], ['Circuit des Falaises', 'FR'], ['Silver Bay Circuit', 'GB'], ['Circuito da Serra Azul', 'PT'], ['Desert Moon Circuit', 'AE'], ['Autódromo Costa Dourada', 'ES']],
  f2: [['Desert Moon Circuit', 'AE'], ['Autódromo Vale do Sol', 'BR'], ['Circuito Lago Nero', 'IT'], ['Silver Bay Circuit', 'GB'], ['Sakura Hills Circuit', 'JP'], ['Circuito da Serra Azul', 'PT'], ['Ring Eichenwald', 'DE'], ['Maple Ridge Raceway', 'CA']],
  f1: [['Desert Moon Circuit', 'AE'], ['Kangaroo Point Circuit', 'AU'], ['Sakura Hills Circuit', 'JP'], ['Circuito da Serra Azul', 'PT'], ['Autódromo Costa Dourada', 'ES'],
    ['Maple Ridge Raceway', 'CA'], ['Silver Bay Circuit', 'GB'], ['Circuito Lago Nero', 'IT'], ['Red Canyon Speedway', 'US'], ['Autódromo Vale do Sol', 'BR']],
};
const trackSeed = (name, cat) => { let h = 2166136261; for (const ch of name + (cat === 'kart' ? 'k' : 'f')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };

// peças do kart: nome, efeito, preços por nível
const KART_PARTS = [
  { k: 'motor', n: 'Motor', i: '⚙️', d: '+3% potência por nível', cost: [400, 900, 1600, 2600, 4000] },
  { k: 'chassis', n: 'Chassis', i: '🛠️', d: '+1,5% aderência nas curvas por nível', cost: [350, 800, 1400, 2300, 3600] },
  { k: 'pneus', n: 'Pneus', i: '🛞', d: '+1,5% aderência por nível', cost: [250, 600, 1100, 1800, 2800] },
  { k: 'travoes', n: 'Travões', i: '🛑', d: 'travagem mais forte e estável', cost: [200, 500, 900, 1500, 2400] },
];
// desenhos do capacete
const HELMET_PATTERNS = [
  { k: 'liso', n: 'Liso', cost: 0 }, { k: 'faixa', n: 'Faixa central', cost: 0 }, { k: 'duplo', n: 'Faixas duplas', cost: 150 },
  { k: 'estrelas', n: 'Estrelas', cost: 300 }, { k: 'chamas', n: 'Chamas', cost: 450 }, { k: 'xadrez', n: 'Xadrez', cost: 400 },
  { k: 'bandeira', n: 'Bandeira do país', cost: 600 }, { k: 'raio', n: 'Raio', cost: 350 },
];
const HELMET_COLORS = ['#e10600', '#ff8000', '#ffd400', '#1fbf4a', '#00a19b', '#1e5bc6', '#0b1f4b', '#6a0dad', '#d4145a', '#ffffff', '#c0c0c0', '#1b1b1b'];
