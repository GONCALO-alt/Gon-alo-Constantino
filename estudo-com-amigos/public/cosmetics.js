// Cosméticos: desbloqueiam-se com minutos de foco.
// Mais tarde, alguns podem passar a estar à venda (campo "price"), sem dar vantagem no jogo.

export const AVATARS = [
  { id: '🙂', need: 0 },  { id: '😎', need: 0 },  { id: '🐱', need: 0 },  { id: '🐶', need: 0 },
  { id: '🦊', need: 25 }, { id: '🐼', need: 50 }, { id: '🐸', need: 75 }, { id: '🦉', need: 100 },
  { id: '🐯', need: 150 },{ id: '🤖', need: 200 },{ id: '👽', need: 300 },{ id: '🦄', need: 450 },
  { id: '🐉', need: 600 },{ id: '🧠', need: 900 },{ id: '👑', need: 1500 },
];

export const FRAMES = [
  { id: 'none',    name: 'Simples', need: 0 },
  { id: 'blue',    name: 'Azul',    need: 30 },
  { id: 'green',   name: 'Verde',   need: 60 },
  { id: 'orange',  name: 'Laranja', need: 120 },
  { id: 'fire',    name: 'Fogo',    need: 300 },
  { id: 'gold',    name: 'Ouro',    need: 600 },
  { id: 'rainbow', name: 'Arco-íris', need: 1200 },
];

export const isUnlocked = (item, minutes) => minutes >= item.need;
