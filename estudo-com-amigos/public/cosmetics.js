// Cosméticos e conquistas.
// Avatares/molduras desbloqueiam-se com minutos de foco ("need") ou com uma conquista ("ach").
// Mais tarde, alguns podem passar a estar à venda — sem dar vantagem no jogo.

export const AVATARS = [
  { id: '🙂', need: 0 },  { id: '😎', need: 0 },  { id: '🐱', need: 0 },  { id: '🐶', need: 0 },
  { id: '🦊', need: 25 }, { id: '🐼', need: 50 }, { id: '🐸', need: 75 }, { id: '🦉', need: 100 },
  { id: '🐯', need: 150 },{ id: '🤖', need: 200 },{ id: '👽', need: 300 },{ id: '🦄', need: 450 },
  { id: '🐉', need: 600 },{ id: '🧠', need: 900 },{ id: '👑', need: 1500 },
  // especiais (conquistas)
  { id: '🌙', ach: 'coruja' },   { id: '🌅', ach: 'madrugador' }, { id: '⚔️', ach: 'duelos10' },
  { id: '🛡️', ach: 'sobrevivente' }, { id: '🔥', ach: 'chama7' }, { id: '✍️', ach: 'autor' },
  { id: '💎', ach: 'diamante' }, { id: '🤓', ach: 'ia' },
];

export const FRAMES = [
  { id: 'none',    name: 'Simples', need: 0 },
  { id: 'blue',    name: 'Azul',    need: 30 },
  { id: 'green',   name: 'Verde',   need: 60 },
  { id: 'orange',  name: 'Laranja', need: 120 },
  { id: 'fire',    name: 'Fogo',    need: 300 },
  { id: 'gold',    name: 'Ouro',    need: 600 },
  { id: 'rainbow', name: 'Arco-íris', need: 1200 },
  { id: 'league',  name: 'Liga',    ach: 'liga' },
];

// c = contadores guardados no browser
export const ACHIEVEMENTS = [
  { id: 'foco1',        icon: '🎯', name: 'Primeiro foco',       desc: 'Acaba uma sessão de foco.',            test: c => c.sessions >= 1 },
  { id: 'foco10',       icon: '📚', name: 'Estudioso',           desc: 'Acaba 10 sessões de foco.',            test: c => c.sessions >= 10 },
  { id: 'horas5',       icon: '⏳', name: '5 horas',             desc: 'Junta 300 minutos de foco.',           test: c => c.minutes >= 300 },
  { id: 'coruja',       icon: '🌙', name: 'Coruja',              desc: 'Acaba um foco depois das 22h.',        test: c => c.night >= 1 },
  { id: 'madrugador',   icon: '🌅', name: 'Madrugador',          desc: 'Acaba um foco antes das 8h.',          test: c => c.morning >= 1 },
  { id: 'duelo1',       icon: '⚔️', name: 'Primeira vitória',    desc: 'Ganha um duelo.',                      test: c => c.duelWins >= 1 },
  { id: 'duelos10',     icon: '🏆', name: 'Campeão',             desc: 'Ganha 10 duelos.',                     test: c => c.duelWins >= 10 },
  { id: 'sobrevivente', icon: '🛡️', name: 'Sobrevivente',        desc: 'Ganha um duelo de eliminação.',        test: c => c.elimWins >= 1 },
  { id: 'autor',        icon: '✍️', name: 'Autor',               desc: 'Escreve 10 perguntas.',                test: c => c.questions >= 10 },
  { id: 'partilha',     icon: '📝', name: 'Partilhador',         desc: 'Partilha 5 apontamentos.',             test: c => c.notes >= 5 },
  { id: 'chama3',       icon: '🕯️', name: 'Chama acesa',         desc: 'Sala com 3 dias seguidos.',            test: c => c.bestStreak >= 3 },
  { id: 'chama7',       icon: '🔥', name: 'Fogueira',            desc: 'Sala com 7 dias seguidos.',            test: c => c.bestStreak >= 7 },
  { id: 'calendario',   icon: '📅', name: 'Organizado',          desc: 'Marca um teste no calendário.',        test: c => c.tests >= 1 },
  { id: 'ia',           icon: '🤓', name: 'Mago da IA',          desc: 'Cria perguntas com a IA.',             test: c => c.aiQuestions >= 1 },
  { id: 'liga',         icon: '🥈', name: 'A subir',             desc: 'A tua sala chega à liga Prata.',       test: c => c.bestTier >= 1 },
  { id: 'diamante',     icon: '💎', name: 'Diamante',            desc: 'A tua sala chega à liga Diamante.',    test: c => c.bestTier >= 4 },
];

export const EMPTY_COUNTERS = {
  sessions: 0, minutes: 0, night: 0, morning: 0, duelWins: 0, elimWins: 0,
  questions: 0, notes: 0, bestStreak: 0, tests: 0, aiQuestions: 0, bestTier: 0,
};

export function isUnlocked(item, minutes, achieved = []) {
  if (item.ach) return achieved.includes(item.ach);
  return minutes >= item.need;
}

export const lockLabel = item => item.ach
  ? `🔒 ${ACHIEVEMENTS.find(a => a.id === item.ach)?.name ?? 'Conquista'}`
  : `🔒 ${item.need} min`;
