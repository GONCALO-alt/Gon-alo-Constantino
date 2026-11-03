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
  I: { n: 'Intermédios', c: '#2fb24c', grip: 1, life: 0.85, wet: true },
  W: { n: 'Chuva', c: '#2f7de1', grip: 1, life: 1.1, wet: true },
};
// aderência dos pneus conforme a pista está seca (0) ou encharcada (1)
function wetFactor(t, w) {
  if (t === 'I') return w < 0.15 ? 0.86 + (w / 0.15) * 0.06 : 0.92 - 0.25 * Math.max(0, w - 0.6);
  if (t === 'W') return w < 0.35 ? 0.77 + 0.09 * (w / 0.35) : 0.86 + 0.03 * (w - 0.35);
  return 1 - 0.5 * w;
}
const SPONSORS = [['Lusoil', '#e10600'], ['Nimbus Energy', '#1e5bc6'], ['Kappa Telecom', '#6a0dad'], ['Rio Verde Café', '#1a8a4a'], ['Atlas Seguros', '#0b1f4b'],
  ['Zeta Bank', '#00a19b'], ['Pixel Games', '#ff8000'], ['Sol & Mar', '#f0b323'], ['Orion Watches', '#2b2b2b'], ['Vortex Drinks', '#d4145a']];

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
// calendários: karting com pistas inventadas; F4, F3, F2 e F1 com os circuitos reais do calendário de cada categoria [nome, país, data mês-dia]
const TRACKS = {
  kart: [['Kartódromo Vale Verde', 'PT', '03-22'], ['Pista do Moinho', 'ES', '04-19'], ['Kart Arena Lago Azul', 'IT', '05-17'], ['Kartódromo da Ribeira', 'BR', '06-14'], ['Circuito das Dunas', 'FR', '07-12'], ['Kartbahn Tannenwald', 'DE', '09-06'], ['Pista Sol Poente', 'MX', '10-04']],
  // F4 (campeonatos europeus de F4, Itália e Espanha)
  f4: [['Paul Ricard', 'FR', '04-12'], ['Portimão (Algarve)', 'PT', '05-03'], ['Imola', 'IT', '05-24'], ['Spa-Francorchamps', 'BE', '06-21'], ['Mugello', 'IT', '07-12'], ['Red Bull Ring', 'AT', '08-30'], ['Barcelona-Catalunha', 'ES', '09-27'], ['Monza', 'IT', '10-18']],
  // Fórmula 3 (corre nos fins de semana da F1)
  f3: [['Albert Park (Melbourne)', 'AU', '03-08'], ['Bahrein (Sakhir)', 'BH', '04-12'], ['Mónaco', 'MC', '06-07'], ['Barcelona-Catalunha', 'ES', '06-14'], ['Red Bull Ring', 'AT', '06-28'], ['Silverstone', 'GB', '07-05'], ['Spa-Francorchamps', 'BE', '07-19'], ['Hungaroring', 'HU', '07-26'], ['Monza', 'IT', '09-06'], ['Madring (Madrid)', 'ES', '09-13']],
  // Fórmula 2
  f2: [['Albert Park (Melbourne)', 'AU', '03-08'], ['Bahrein (Sakhir)', 'BH', '04-12'], ['Jeddah', 'SA', '04-19'], ['Mónaco', 'MC', '06-07'], ['Barcelona-Catalunha', 'ES', '06-14'], ['Red Bull Ring', 'AT', '06-28'], ['Silverstone', 'GB', '07-05'], ['Spa-Francorchamps', 'BE', '07-19'], ['Hungaroring', 'HU', '07-26'], ['Monza', 'IT', '09-06'], ['Madring (Madrid)', 'ES', '09-13'], ['Baku', 'AZ', '09-26'], ['Lusail', 'QA', '11-29'], ['Yas Marina', 'AE', '12-06']],
  // Fórmula 1
  f1: [['Albert Park (Melbourne)', 'AU', '03-08'], ['Xangai', 'CN', '03-15'], ['Suzuka', 'JP', '03-29'], ['Bahrein (Sakhir)', 'BH', '04-12'], ['Jeddah', 'SA', '04-19'], ['Miami', 'US', '05-03'],
    ['Gilles Villeneuve (Montreal)', 'CA', '05-24'], ['Mónaco', 'MC', '06-07'], ['Barcelona-Catalunha', 'ES', '06-14'], ['Red Bull Ring', 'AT', '06-28'], ['Silverstone', 'GB', '07-05'], ['Spa-Francorchamps', 'BE', '07-19'],
    ['Hungaroring', 'HU', '07-26'], ['Zandvoort', 'NL', '08-23'], ['Monza', 'IT', '09-06'], ['Madring (Madrid)', 'ES', '09-13'], ['Baku', 'AZ', '09-26'], ['Marina Bay (Singapura)', 'SG', '10-11'],
    ['Circuito das Américas (Austin)', 'US', '10-25'], ['Hermanos Rodríguez (México)', 'MX', '11-01'], ['Interlagos', 'BR', '11-08'], ['Las Vegas', 'US', '11-21'], ['Lusail', 'QA', '11-29'], ['Yas Marina', 'AE', '12-06']],
};
// época curta: escolhe corridas espalhadas pelo calendário, pela ordem das datas
function seasonPick(cat, mode) {
  const all = TRACKS[cat], n = mode === 'completa' ? all.length : Math.min(all.length, catById(cat).rounds);
  if (n >= all.length) return all.slice();
  const out = []; for (let k = 0; k < n; k++) out.push(all[Math.round((k * (all.length - 1)) / Math.max(1, n - 1))]);
  return out;
}
const trackSeed = (name, cat) => { let h = 2166136261; for (const ch of name + (cat === 'kart' ? 'k' : 'f')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };

// peças do kart: nome, efeito, preços por nível
const KART_PARTS = [
  { k: 'motor', n: 'Motor', i: '⚙️', d: '+2,2% potência por nível', cost: [400, 900, 1600, 2600, 4000] },
  { k: 'chassis', n: 'Chassis', i: '🛠️', d: '+0,6% aderência nas curvas por nível', cost: [350, 800, 1400, 2300, 3600] },
  { k: 'pneus', n: 'Pneus', i: '🛞', d: '+0,6% aderência por nível', cost: [250, 600, 1100, 1800, 2800] },
  { k: 'travoes', n: 'Travões', i: '🛑', d: 'travagem mais forte e estável', cost: [200, 500, 900, 1500, 2400] },
  { k: 'carb', n: 'Carburador', i: '⛽', d: '+1% potência e melhor resposta por nível', cost: [300, 700, 1200, 2000, 3100] },
  { k: 'eixo', n: 'Eixo traseiro', i: '🔩', d: '+0,5% aderência à saída das curvas por nível', cost: [280, 650, 1150, 1900, 2900] },
];
// desenhos do capacete
const HELMET_PATTERNS = [
  { k: 'liso', n: 'Liso', cost: 0 }, { k: 'faixa', n: 'Faixa central', cost: 0 }, { k: 'duplo', n: 'Faixas duplas', cost: 150 },
  { k: 'degrade', n: 'Degradê', cost: 200 }, { k: 'coroa', n: 'Coroa', cost: 220 }, { k: 'diagonal', n: 'Riscas diagonais', cost: 260 },
  { k: 'estrelas', n: 'Estrelas', cost: 300 }, { k: 'raio', n: 'Raio', cost: 350 }, { k: 'ondas', n: 'Ondas', cost: 380 },
  { k: 'xadrez', n: 'Xadrez', cost: 400 }, { k: 'circulos', n: 'Círculos', cost: 420 }, { k: 'chamas', n: 'Chamas', cost: 450 },
  { k: 'camuflado', n: 'Camuflado', cost: 500 }, { k: 'bandeira', n: 'Bandeira do país', cost: 600 },
];
const HELMET_COLORS = ['#e10600', '#ff8000', '#ffd400', '#c8e600', '#1fbf4a', '#00a19b', '#33b5ff', '#1e5bc6', '#0b1f4b', '#6a0dad', '#d4145a', '#ff7eb6', '#c9a227', '#8a5a2b', '#ffffff', '#c0c0c0', '#5a5f66', '#1b1b1b'];
const HELMET_VISORS = [{ k: 'escura', n: 'Escura', cost: 0 }, { k: 'clara', n: 'Clara', cost: 0 }, { k: 'espelho', n: 'Espelhada', cost: 250 }, { k: 'dourada', n: 'Dourada', cost: 350 }, { k: 'azul', n: 'Azul', cost: 300 }, { k: 'arco', n: 'Arco-íris', cost: 450 }];
const HELMET_FINISH = [{ k: 'brilho', n: 'Brilhante', cost: 0 }, { k: 'mate', n: 'Mate', cost: 200 }, { k: 'metal', n: 'Metalizado', cost: 350 }];
// traçados inspirados em circuitos reais (aproximados): pontos dos cantos [x, y, raio] em metros (y para baixo = sul)
// e relevo [fração da volta, altura em metros]
const LAYOUTS = {
  'Autodromo di Monza (inspirado)': { nat: 'IT', pts: [[0, 300, 600], [0, -520, 14], [26, -548, 14], [40, -900, 330], [330, -1130, 18], [362, -1160, 18], [560, -1185, 60], [705, -1080, 55], [665, -520, 25], [630, -470, 35], [648, -400, 70], [540, 760, 170], [0, 790, 130]],
    elev: [[0, 0], [0.3, 4], [0.55, 9], [0.8, 3], [1, 0]] },
  'Autódromo do Algarve (inspirado)': { nat: 'PT', pts: [[0, 0, 900], [900, -20, 45], [960, -160, 40], [820, -300, 70], [560, -260, 60], [420, -420, 35], [560, -560, 90], [860, -620, 120], [1050, -760, 40], [900, -900, 60], [500, -820, 160], [180, -700, 30], [60, -500, 120], [-150, -380, 45], [-180, -150, 90]],
    elev: [[0, 0], [0.12, -14], [0.25, -4], [0.38, 12], [0.5, 22], [0.62, 6], [0.72, 18], [0.85, 4], [1, 0]] },
  'Circuit de Spa (inspirado)': { nat: 'BE', pts: [[-20, 200, 600], [0, -30, 18], [45, -25, 18], [60, 300, 60], [115, 390, 70], [900, 600, 25], [935, 645, 25], [965, 760, 50], [1010, 1110, 22], [920, 1090, 45], [760, 1400, 110], [500, 1430, 60], [380, 1570, 60], [160, 1100, 250], [-60, 470, 14], [-85, 430, 14]],
    elev: [[0, 0], [0.06, -18], [0.1, 14], [0.25, 36], [0.4, 10], [0.55, -16], [0.75, -6], [0.92, 6], [1, 0]] },
  'Autódromo de Interlagos (inspirado)': { nat: 'BR', pts: [[0, 0, 700], [-40, 320, 40], [40, 400, 40], [-20, 520, 160], [-60, 900, 120], [260, 980, 60], [360, 820, 45], [300, 640, 40], [460, 560, 30], [420, 420, 35], [240, 460, 50], [150, 300, 90], [180, -120, 130]],
    elev: [[0, 8], [0.1, -6], [0.3, -16], [0.55, -4], [0.75, -12], [0.9, 2], [1, 8]] },
};
