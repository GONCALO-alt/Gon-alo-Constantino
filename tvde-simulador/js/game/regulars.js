// Clientes habituais: passageiros que voltam, se lembram de ti e têm histórias em vários capítulos.
// Cada história tem partes; cada viagem com esse cliente mostra a parte seguinte.

export const STORIES = [
  { id: 'casamento', title: 'O casamento', parts: [
    { text: 'Lembra-se de mim? Vou casar daqui a uns meses e estou em pânico com o discurso!',
      choices: [{ t: 'Fale com o coração, vai correr lindamente.', mood: 10, reply: 'Vou tentar! Obrigada pela força.' }, { t: 'Comece com uma piada, quebra o gelo.', mood: 8, reply: 'Boa ideia! Tenho uma ótima sobre o meu noivo.' }, { t: 'Discursos são sempre aborrecidos...', mood: -8, reply: 'Pois... isso não ajuda nada.' }] },
    { text: 'Estamos indecisos: casamos na Sé da Vila Velha ou na praia ao pôr do sol?',
      choices: [{ t: 'A Sé é linda, e a festa pode ser na praia!', mood: 12, reply: 'O melhor dos dois mundos! Adorei.' }, { t: 'Na praia, sem dúvida.', mood: 7, reply: 'É o que o meu noivo diz!' }, { t: 'Tanto faz, o importante é a festa.', mood: 2, reply: 'Hm, também é verdade.' }] },
    { text: '(Com a voz trémula) Discuti com o meu noivo por causa dos convidados... Será que estamos a precipitar-nos?',
      choices: [{ t: 'Todos os casais discutem antes do casamento. Conversem com calma.', mood: 14, reply: 'Tem razão. Vou ligar-lhe já.' }, { t: 'Se tem dúvidas, pense bem.', mood: 0, reply: 'Pois... vou pensar.' }, { t: 'Isso não é comigo, desculpe.', mood: -10, reply: 'Claro. Desculpe ter falado.' }] },
    { text: 'É HOJE! Leve-me à Sé, por favor! Fiz questão de pedir o meu motorista preferido.', final: true,
      choices: [{ t: 'Que honra! Muitas felicidades aos dois!', mood: 20, eff: { tip: 20 }, reply: 'Obrigada por tudo. Isto é para si! 💐' }, { t: 'Vamos lá, sem atrasos!', mood: 14, eff: { tip: 12 }, reply: 'Obrigada! Guarde isto para um café.' }] },
  ] },
  { id: 'restaurante', title: 'O restaurante', parts: [
    { text: 'Sabe uma coisa? Vou abrir o meu próprio restaurante na Vila Velha. Comida do mar!',
      choices: [{ t: 'Que coragem! Vai ser um sucesso.', mood: 10, reply: 'Obrigado! Vou precisar de clientes como você.' }, { t: 'A restauração é difícil, tenha cuidado.', mood: 2, reply: 'Eu sei, eu sei...' }] },
    { text: 'Preciso de um nome para o restaurante. «O Pescador», «Maré Viva» ou «Sal & Brasa»?',
      choices: [{ t: 'Maré Viva!', mood: 10, eff: { story: 'Maré Viva' }, reply: 'Maré Viva... soa mesmo bem!' }, { t: 'Sal & Brasa!', mood: 10, eff: { story: 'Sal & Brasa' }, reply: 'Moderno! Gosto.' }, { t: 'O Pescador, clássico.', mood: 8, eff: { story: 'O Pescador' }, reply: 'Clássico nunca falha.' }] },
    { text: 'O banco recusou o empréstimo. Estou a pensar desistir de tudo...',
      choices: [{ t: 'Não desista! Tente outro banco ou um sócio.', mood: 14, reply: 'Tem razão. Um amigo meu ofereceu-se para entrar no negócio.' }, { t: 'Às vezes é melhor desistir.', mood: -6, reply: 'Pois... talvez.' }] },
    { text: 'Inauguração hoje! Vou para o restaurante e quero que seja o meu primeiro convidado.', final: true,
      choices: [{ t: 'Parabéns! Passo lá ao jantar.', mood: 20, eff: { tip: 15 }, reply: 'O jantar é por conta da casa! E isto é pela viagem.' }, { t: 'Que orgulho! Boa sorte!', mood: 14, eff: { tip: 10 }, reply: 'Obrigado por me ouvir este tempo todo.' }] },
  ] },
  { id: 'manuel', title: 'Histórias de Porto Azul', parts: [
    { text: 'Sabia que esta cidade era só uma vila de pescadores quando eu era miúdo? A ponte nem existia!',
      choices: [{ t: 'A sério? Conte-me mais!', mood: 12, reply: 'Atravessávamos o rio de barco. O meu pai era barqueiro.' }, { t: 'Muita coisa mudou, imagino.', mood: 6, reply: 'Tudo, tudo mudou...' }] },
    { text: 'No aeroporto havia um campo de futebol. Joguei lá a final de 1968!',
      choices: [{ t: 'E ganharam?', mood: 12, reply: 'Três a dois! Marquei o golo da vitória, de cabeça!' }, { t: 'Que memória!', mood: 6, reply: 'Ah, bons tempos.' }] },
    { text: 'A minha mulher faleceu no ano passado. Às vezes estas viagens são a única conversa que tenho no dia.',
      choices: [{ t: 'Lamento muito. Pode sempre conversar comigo.', mood: 16, reply: 'Obrigado, rapaz. Faz mais diferença do que imagina.' }, { t: '(Ouvir em silêncio)', mood: 8, reply: '...Obrigado por ouvir.' }] },
    { text: 'O meu neto termina hoje o curso na universidade! Leve-me depressa, que não quero perder!', final: true,
      choices: [{ t: 'Que orgulho! Vamos já!', mood: 20, eff: { tip: 12 }, reply: 'Tome. E obrigado por estes meses de boa companhia.' }, { t: 'Parabéns ao seu neto!', mood: 14, eff: { tip: 8 }, reply: 'Vou dizer-lhe que o meu motorista mandou cumprimentos!' }] },
  ] },
  { id: 'ines', title: 'A estudante de medicina', parts: [
    { text: 'Desculpe se estiver calada, tenho exame de anatomia amanhã e não sei nada!',
      choices: [{ t: 'Quer que fique em silêncio para estudar?', mood: 12, reply: 'Sim, por favor! Obrigada!' }, { t: 'Vai correr bem, já sabe mais do que pensa.', mood: 8, reply: 'Espero que sim...' }] },
    { text: 'Chumbei no exame... Os meus pais vão ficar tão desiludidos.',
      choices: [{ t: 'Um exame não define ninguém. Na próxima vai conseguir.', mood: 14, reply: 'Obrigada... precisava mesmo de ouvir isso.' }, { t: 'Estude mais da próxima vez.', mood: -4, reply: 'Pois. Obrigada.' }] },
    { text: 'Hoje é o exame de recurso. Estou a tremer!',
      choices: [{ t: 'Respire fundo. Vai arrasar!', mood: 12, reply: 'Vou! Obrigada!' }, { t: 'Quer ouvir uma música calma?', mood: 10, reply: 'Pode ser, ajuda a acalmar.' }] },
    { text: 'PASSEI! Com 17! Tinha de lhe contar, foi o primeiro a saber depois da minha mãe!', final: true,
      choices: [{ t: 'Parabéns, doutora! Eu sabia!', mood: 20, eff: { tip: 10 }, reply: 'Hoje a viagem tem gorjeta de festa!' }, { t: 'Muitos parabéns!', mood: 14, eff: { tip: 6 }, reply: 'Obrigada por me apoiar!' }] },
  ] },
  { id: 'tiago', title: 'O músico', parts: [
    { text: 'Estou a ensaiar com a minha banda para o primeiro concerto a sério. Quer ouvir uma música nossa?',
      choices: [{ t: 'Claro, ponha a tocar!', mood: 12, eff: { radio: 'pop' }, reply: '🎵 (Toca uma música animada) Então? Gostou?' }, { t: 'Agora não, desculpe.', mood: -4, reply: 'Ok, fica para outra vez.' }] },
    { text: 'O vocalista saiu da banda a uma semana do concerto. Não sei o que fazer.',
      choices: [{ t: 'Porque não canta você?', mood: 14, reply: 'Eu? ...Sabe que mais? Vou tentar!' }, { t: 'Cancelem o concerto.', mood: -8, reply: 'Nem pensar!' }] },
    { text: 'Afinal sou eu o vocalista! Ensaiei a noite toda. Diga-me a verdade: tenho jeito?',
      choices: [{ t: 'Tem uma voz incrível!', mood: 12, reply: 'Obrigado! Isso dá-me confiança.' }, { t: 'Com mais treino vai lá chegar.', mood: 6, reply: 'Honesto. Gosto disso.' }] },
    { text: 'Hoje é o concerto! Arranjei-lhe dois bilhetes, como agradecimento.', final: true,
      choices: [{ t: 'Obrigado! Lá estarei a cantar convosco!', mood: 20, eff: { tip: 10 }, reply: 'Vou dedicar uma música ao meu motorista!' }, { t: 'Muita sorte! Arrasa!', mood: 14, eff: { tip: 6 }, reply: 'Obrigado por tudo!' }] },
  ] },
];

export const REGULAR_GREETS = {
  good: ['Olá outra vez, {driver}! Que sorte calhar consigo!', 'Ah, o meu motorista preferido! Tudo bem, {driver}?', '{driver}! Já sabia que era você pela matrícula!'],
  bad: ['Ah... é você outra vez.', 'Olá. Espero que hoje corra melhor do que da última vez.'],
};

// Viagens partilhadas: conversas entre os dois passageiros
export const POOL_SCENES = [
  { text: '{b}: Importa-se de abrir a janela? Está abafado. — {a}: Eu tenho frio, prefiro fechada...',
    choices: [{ t: 'Abro só um bocadinho, para os dois.', moodA: 4, moodB: 4 }, { t: 'Abro a janela.', moodA: -8, moodB: 8 }, { t: 'Fica fechada, liga-se o ar condicionado.', moodA: 6, moodB: -3 }] },
  { text: '{b} está ao telemóvel em voz muito alta. {a} revira os olhos.',
    choices: [{ t: 'Peço desculpa, pode falar um pouco mais baixo?', moodA: 8, moodB: -4 }, { t: '(Ignorar)', moodA: -6, moodB: 0 }, { t: 'Aumentar o volume do rádio.', moodA: -2, moodB: -2 }] },
  { text: '{a}: Espera... tu és amiga da Joana do ginásio? — {b}: Sou! Que mundo pequeno!',
    choices: [{ t: 'Porto Azul é uma aldeia!', moodA: 8, moodB: 8 }, { t: '(Sorrir e conduzir)', moodA: 4, moodB: 4 }] },
  { text: '{b}: Desculpe, mas isto é mesmo o caminho mais rápido para mim? Estou a ver que vamos dar uma volta.',
    choices: [{ t: 'É uma viagem partilhada: deixo-a primeiro, prometo.', moodA: 0, moodB: 6 }, { t: 'A app é que decide a rota.', moodA: 0, moodB: -4 }] },
];
