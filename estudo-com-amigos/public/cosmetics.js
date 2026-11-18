// Cosméticos e conquistas.
// Avatares (peixes desenhados em ui-icons.js) e molduras desbloqueiam-se com minutos de foco ("need")
// ou com uma conquista ("ach"). Sem vantagem no jogo.

export const AVATARS = [
  { id: 'a1', need: 0 },   { id: 'a2', need: 0 },   { id: 'a3', need: 0 },   { id: 'a4', need: 0 },
  { id: 'a5', need: 25 },  { id: 'a6', need: 50 },  { id: 'a7', need: 75 },  { id: 'a8', need: 100 },
  { id: 'a9', need: 150 }, { id: 'a10', need: 200 }, { id: 'a11', need: 300 }, { id: 'a12', need: 450 },
  { id: 'a13', need: 600 }, { id: 'a14', need: 900 }, { id: 'a15', need: 1500 },
  // especiais (conquistas)
  { id: 's1', ach: 'coruja' },      { id: 's2', ach: 'madrugador' }, { id: 's3', ach: 'duelos10' },
  { id: 's4', ach: 'sobrevivente' }, { id: 's5', ach: 'chama7' },     { id: 's6', ach: 'autor' },
  { id: 's7', ach: 'diamante' },    { id: 's8', ach: 'ia' },
];

// Avatares antigos (emoji) passam para o primeiro peixe
export const avatarId = id => (AVATARS.some(a => a.id === id) ? id : 'a1');

export const FRAMES = [
  { id: 'none',    need: 0 },
  { id: 'blue',    need: 30 },
  { id: 'green',   need: 60 },
  { id: 'orange',  need: 120 },
  { id: 'fire',    need: 300 },
  { id: 'gold',    need: 600 },
  { id: 'rainbow', need: 1200 },
  { id: 'league',  ach: 'liga' },
];

// c = contadores guardados no browser. "ic" é o nome do ícone em ui-icons.js
export const ACHIEVEMENTS = [
  { id: 'foco1',        ic: 'target',    color: '#5a3ce6', test: c => c.sessions >= 1 },
  { id: 'foco10',       ic: 'book',      color: '#2f7de0', test: c => c.sessions >= 10 },
  { id: 'horas5',       ic: 'hourglass', color: '#0e9aa7', test: c => c.minutes >= 300 },
  { id: 'coruja',       ic: 'owl',       color: '#2b2d5c', test: c => c.night >= 1 },
  { id: 'madrugador',   ic: 'sunrise',   color: '#ff9f43', test: c => c.morning >= 1 },
  { id: 'duelo1',       ic: 'swords',    color: '#d8344e', test: c => c.duelWins >= 1 },
  { id: 'duelos10',     ic: 'trophy',    color: '#e0a400', test: c => c.duelWins >= 10 },
  { id: 'sobrevivente', ic: 'shield',    color: '#5d6b82', test: c => c.elimWins >= 1 },
  { id: 'autor',        ic: 'pen',       color: '#178a59', test: c => c.questions >= 10 },
  { id: 'partilha',     ic: 'note',      color: '#9b4dff', test: c => c.notes >= 5 },
  { id: 'chama3',       ic: 'flame',     color: '#ff9f43', test: c => c.bestStreak >= 3 },
  { id: 'chama7',       ic: 'flame',     color: '#ff5a1f', test: c => c.bestStreak >= 7 },
  { id: 'calendario',   ic: 'calendar',  color: '#2f7de0', test: c => c.tests >= 1 },
  { id: 'ia',           ic: 'sparkles',  color: '#7a5cff', test: c => c.aiQuestions >= 1 },
  { id: 'liga',         ic: 'medal',     color: '#8f9bb0', test: c => c.bestTier >= 1 },
  { id: 'diamante',     ic: 'gem',       color: '#7a5cff', test: c => c.bestTier >= 4 },
];

export const EMPTY_COUNTERS = {
  sessions: 0, minutes: 0, night: 0, morning: 0, duelWins: 0, elimWins: 0,
  questions: 0, notes: 0, bestStreak: 0, tests: 0, aiQuestions: 0, bestTier: 0,
};

export function isUnlocked(item, minutes, achieved = []) {
  if (item.ach) return achieved.includes(item.ach);
  return minutes >= item.need;
}

// ---------- Loja de medalhas ----------
// Compram-se com escamas, que se ganham a estudar (nunca com dinheiro, nunca ao calhas).
export const MEDALS = [
  { id: 'peixinho', ic: 'fish',     color: '#5a3ce6', price: 0 },
  { id: 'bolha',    ic: 'bubble',   color: '#2f7de0', price: 40 },
  { id: 'livro',    ic: 'book',     color: '#0e9aa7', price: 60 },
  { id: 'lapis',    ic: 'pencil',   color: '#c97f00', price: 80 },
  { id: 'relogio',  ic: 'timer',    color: '#178a59', price: 120 },
  { id: 'estrela',  ic: 'star',     color: '#e0a400', price: 160 },
  { id: 'polvo',    ic: 'octopus',  color: '#d8344e', price: 220 },
  { id: 'tubarao',  ic: 'shark',    color: '#5d6b82', price: 300 },
  { id: 'baleia',   ic: 'whale',    color: '#2b5fb8', price: 450 },
  { id: 'tridente', ic: 'trident',  color: '#2fa4b9', price: 650 },
  { id: 'perola',   ic: 'pearl',    color: '#b0679e', price: 900 },
  { id: 'coroa',    ic: 'crown',    color: '#f5b301', price: 1500 },
];

// Medalhas antigas guardadas como emoji passam para o id
const OLD_MEDALS = { '🐟': 'peixinho', '🫧': 'bolha', '📘': 'livro', '✏️': 'lapis', '⏱️': 'relogio', '⭐': 'estrela', '🐙': 'polvo', '🦈': 'tubarao', '🐋': 'baleia', '🔱': 'tridente', '🦪': 'perola', '👑': 'coroa' };
export const medalId = v => (MEDALS.some(m => m.id === v) ? v : OLD_MEDALS[v] ?? (v ? 'peixinho' : ''));

// Como se ganham escamas
export const EARN = {
  perFocusMinute: 1,
  duelWin: 20,
  question: 3,
  note: 5,
  achievement: 25,
};
