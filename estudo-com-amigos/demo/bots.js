// Amigos simulados para a demo: entram na sala, falam, estudam e jogam duelos.
import * as R from '../rooms.js';

const pick = a => a[Math.floor(Math.random() * a.length)];
const wait = ms => new Promise(r => setTimeout(r, ms));

const PEOPLE = [
  { name: 'Rui', avatar: 'a2', frame: 'blue', skill: 0.75, medal: 'estrela' },
  { name: 'Eva', avatar: 'a8', frame: 'gold', skill: 0.6, medal: 'polvo' },
];

const REPLIES = [
  'Siiim', 'Bora!', 'Concordo', 'Haha', 'Não percebi essa parte da matéria',
  'Fazemos mais um duelo depois?', 'Vou buscar água e já volto', '',
];

export function startBots(hub, store, code) {
  const room = store.get(code);
  const bots = PEOPLE.map(p => ({ ...p, socket: hub.connect() }));

  bots.forEach((bot, i) => {
    const s = bot.socket;
    setTimeout(() => s.emit('joinRoom', { code, profile: { name: bot.name, avatar: bot.avatar, frame: bot.frame, medal: bot.medal } }, () => {}), 1200 + i * 1500);

    s.on('chat', async m => {
      if (PEOPLE.some(p => p.name === m.author)) return;
      if (/\?$/.test(m.text) || Math.random() < 0.5) {
        await wait(1500 + Math.random() * 2500);
        if (i === 0 || Math.random() < 0.4) s.emit('chat', pick(REPLIES));
      }
    });

    s.on('timer', async t => {
      if (t.state !== 'focus') return;
      await wait(800 + i * 900);
      s.emit('react', pick(['flame', 'zap', 'heart']));
    });

    s.on('focusDone', async ({ rewarded }) => {
      await wait(1000 + i * 800);
      if (i === 0) s.emit('chat', rewarded.length ? 'Boa equipa!' : 'Uiii, distraí-me');
    });

    s.on('duelQuestion', async q => {
      if (q.mode === 'eliminacao' && !q.alive.includes(bot.name)) return;
      await wait(2000 + Math.random() * 6000);
      const d = room.duel;
      if (!d || d.index !== q.index) return;
      const right = d.questions[d.index].answer;
      const wrong = q.options.map((_, k) => k).filter(k => k !== right);
      s.emit('duelAnswer', Math.random() < bot.skill ? right : pick(wrong), () => {});
    });

    s.on('duelEnd', async ({ winners }) => {
      await wait(1200 + i * 700);
      if (winners.includes(bot.name)) s.emit('chat', i === 0 ? 'GG!' : 'Ganhei!');
      else if (i === 1) s.emit('chat', 'Quero desforra!');
    });
  });

  // o Rui e a Eva já tinham trazido algumas coisas para a sala
  const [rui, eva] = bots;
  setTimeout(() => {
    rui.socket.emit('chat', 'Olá! Já cá estou');
    eva.socket.emit('chat', 'Bora estudar para o teste de Ciências! Marquei-o no calendário');
    const inTwoDays = R.addDays(R.dayKey(), 2);
    eva.socket.emit('addTest', { subject: 'Ciências Naturais', date: inTwoDays }, () => {});
    rui.socket.emit('addNote', {
      title: 'Fotossíntese',
      text: 'As plantas fazem o seu alimento com luz, água e CO₂.\nAcontece nos cloroplastos (clorofila = verde).\nProduz glicose e liberta oxigénio.',
    }, () => {});
    const qs = [
      { question: 'Que gás as plantas libertam na fotossíntese?', options: ['Oxigénio', 'Dióxido de carbono', 'Hélio', 'Metano'], answer: 0, topic: 'Fotossíntese', difficulty: 1 },
      { question: 'Que cor tem a clorofila?', options: ['Vermelha', 'Verde', 'Azul', 'Amarela'], answer: 1, topic: 'Fotossíntese', difficulty: 1 },
      { question: 'Onde fica a maioria dos estomas?', options: ['Na raiz', 'No caule', 'Nas folhas', 'Nas flores'], answer: 2, topic: 'Trocas gasosas', difficulty: 2 },
      { question: 'A seiva elaborada transporta…', options: ['Só água', 'Açúcares produzidos nas folhas', 'Terra', 'Ar'], answer: 1, topic: 'Transporte', difficulty: 3 },
    ];
    for (const q of qs) rui.socket.emit('addQuestion', q, () => {});
  }, 4500);

  return bots;
}

// Salas de outras turmas para a tabela da liga não estar vazia.
export function seedLeague(store) {
  const others = [['9.ºA — Matemática', 165], ['7.ºC — Inglês', 120], ['8.ºA — História', 95], ['8.ºD — Físico-Química', 40], ['Clube de Estudo', 15]];
  for (const [name, minutes] of others) {
    const r = store.create(name, 'demo');
    r.league.minutes = minutes;
  }
}

// A sala nova já tem 3 dias de chama acesa, para se ver como funciona.
export function seedStreak(room) {
  for (let d = 1; d <= 3; d++) room.days[R.addDays(R.dayKey(), -d)] = { minutes: 60, people: ['Rui', 'Eva'] };
  room.league.minutes = 90;
}
