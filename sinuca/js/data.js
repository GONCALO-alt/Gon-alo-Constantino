'use strict';
/* Conteúdo do jogo. As personagens famosas são caricaturas humorísticas e fictícias:
   não há qualquer ligação, patrocínio ou apoio das pessoas representadas. */

const TIERS = {
  normal: { name: 'Normal', color: '#9fb3c8' },
  especial: { name: 'Especial', color: '#4fd1ff' },
  lendario: { name: 'Lendário', color: '#ffc531' },
};

/* unlock: { wins:n } | { coins:n } (moedas ganhas no total) | { challenges:n } | { tournament:true } |
   { cup:'lendas' } | { survival:n } | { beat:'id' } */
const CHARACTERS = [
  {
    id: 'ze', name: 'Zé do Café', short: 'ZÉ', tier: 'normal', diff: 1, unlock: { wins: 0 }, scene: 'bar',
    bio: 'Dono do café da esquina. Joga entre dois galões e nunca fecha a conta.',
    look: { skin: '#e8b48a', hair: 'balding', hairC: '#3a2a1a', beard: 'mustache', beardC: '#3a2a1a', top: { type: 'apron', c: '#f4f4f4', c2: '#7a4a2a' }, item: 'cup' },
    lines: {
      hello: ['Bica e uma partida? Fica por conta da casa!', 'Olha que eu aqui sou o patrão, hein!'],
      pot: ['Esta foi direitinha como um galão!', 'Ah pois é! Lá para dentro!'],
      miss: ['Ups… estava a pensar na máquina do café.', 'Foi a mesa que mexeu!'],
      playerPot: ['Ena, tens jeito, miúdo!', 'Essa até me fez entornar o café.'],
      playerFoul: ['Falta! Isso paga-se com um pastel de nata.'],
      win: ['Ganhei! Próxima bica é tua!', 'Experiência de balcão, meu caro!'],
      lose: ['Pronto, pago eu os cafés…', 'Para a próxima ponho-te descafeinado!'],
    },
  },
  {
    id: 'rosa', name: 'Tia Rosa', short: 'TIA ROSA', tier: 'normal', diff: 2, unlock: { wins: 0 }, scene: 'bar',
    bio: 'A avó do bairro. Jura que nunca perdeu um jogo de sueca — nem de sinuca.',
    look: { skin: '#f0c8a0', hair: 'bun', hairC: '#c9c9c9', glasses: 'round', lips: '#c0506a', earrings: '#ffd23f', top: { type: 'cardigan', c: '#c05080', c2: '#f4e0c0' } },
    lines: {
      hello: ['Ai filho, joga devagarinho que a tia já não tem idade.', 'Comeste a sopa? Então vamos a isto.'],
      pot: ['Hihi! A tia ainda tem pontaria!', 'Isto é como enfiar a linha na agulha.'],
      miss: ['Ai, os óculos estavam embaciados.', 'Estas bolas de hoje são muito escorregadias.'],
      playerPot: ['Muito bem, meu querido!', 'Que orgulho! Vou contar às vizinhas.'],
      playerFoul: ['Ai ai ai… isso não se faz à tia!'],
      win: ['Ganhei! Agora vais lanchar comigo.', 'A tia ainda dá cartas!'],
      lose: ['Deixei-te ganhar, claro. Coisas de tia.', 'Pronto, toma lá um rebuçado.'],
    },
  },
  {
    id: 'rui', name: 'Rui Tabelas', short: 'RUI', tier: 'normal', diff: 3, unlock: { wins: 0 }, scene: 'bar',
    bio: 'Só joga com tabelas. Diz que é estilo; os amigos dizem que é azar.',
    look: { skin: '#d9a066', hair: 'short', hairC: '#1a1a1a', beard: 'stubble', beardC: '#2a2a2a', hat: { type: 'cap', c: '#2f6fd0', c2: '#ffffff' }, top: { type: 'tshirt', c: '#e04040' } },
    lines: {
      hello: ['Tabela, contra-tabela e lá vai ela!', 'Hoje estou inspirado, mano.'],
      pot: ['Viste a tabela? VISTE?', 'Geometria pura, mano.'],
      miss: ['Era para dar três tabelas…', 'Calculei mal o ângulo, só isso.'],
      playerPot: ['Direta? Que falta de imaginação.', 'Hm. Sorte de principiante.'],
      playerFoul: ['Até eu acerto mais na branca!'],
      win: ['Tabelas, mano. Tabelas!', 'Ganhei com estilo.'],
      lose: ['Para a próxima uso quatro tabelas.', 'Deixa-me treinar os ângulos…'],
    },
  },
  {
    id: 'taylor', name: 'Taylor Swift', short: 'TAYLOR', tier: 'normal', diff: 2, unlock: { wins: 0 }, scene: 'disco',
    bio: 'Estrela pop com uma tacada nova para cada Era. Escreve uma canção sobre cada derrota.',
    look: { skin: '#f6d2b8', hair: 'bangs', hairC: '#f0d68a', lips: '#d0102a', earrings: '#e8e8ff', top: { type: 'dress', c: '#8a5cd0', sparkle: '#efe6ff' }, item: 'mic' },
    lines: {
      hello: ['Bem-vindo à minha Era da Sinuca!', 'Vamos lá… shake it off!'],
      pot: ['Esta bola nunca, nunca mais volta!', 'Encaçapada na minha playlist.'],
      miss: ['Vou escrever uma canção sobre esta tacada.', 'Ai, isto pedia um refrão melhor.'],
      playerPot: ['Ok, essa vai para o álbum.', 'Hm, és bom… suspeito.'],
      playerFoul: ['Isto vai dar uma balada triste para ti!'],
      win: ['Mais um êxito número 1!', 'Era da Vitória: desbloqueada!'],
      lose: ['Vou transformar isto num álbum de sucesso.', 'Shake it off… shake it off…'],
    },
  },
  {
    id: 'tony', name: 'Tony Carreira', short: 'TONY', tier: 'normal', diff: 2, unlock: { wins: 1 }, scene: 'vip',
    bio: 'Cantor romântico. Cada bola encaçapada merece uma serenata.',
    look: { skin: '#e7b58c', hair: 'short', hairC: '#3b2a1e', beard: 'stubble', beardC: '#3b2a1e', top: { type: 'suit', c: '#f2f2f2', shirt: '#1a1a1a', tie: null }, item: 'mic' },
    lines: {
      hello: ['Esta partida é dedicada a ti… com carinho!', 'Sonhos de menino… de taco na mão.'],
      pot: ['Ai que lindo, que lindo!', 'Isto merece um aplauso, meus amigos!'],
      miss: ['Errar também é romântico.', 'O coração tremeu…'],
      playerPot: ['Que tacada emocionante!', 'Dá-me vontade de cantar!'],
      playerFoul: ['Até a minha guitarra desafinou.'],
      win: ['Obrigado, obrigado! Vocês são lindos!', 'Vitória com sentimento!'],
      lose: ['Vou cantar a minha tristeza…', 'Fica para o próximo concerto.'],
    },
  },
  {
    id: 'quim', name: 'Quim Barreiros', short: 'QUIM', tier: 'normal', diff: 3, unlock: { wins: 2 }, scene: 'bar',
    bio: 'Rei da concertina e das festas de verão. Joga ao ritmo do pimba.',
    look: { skin: '#f0c09a', hair: 'balding', hairC: '#ececec', beard: 'mustache', beardC: '#ececec', top: { type: 'shirt', c: '#d63a3a' }, item: 'accordion' },
    lines: {
      hello: ['Toca a concertina e toca a tacada!', 'Ó malta, isto hoje é festa!'],
      pot: ['Ai que bola tão bem metida!', 'Pimba! Lá para dentro!'],
      miss: ['Desafinei na tacada…', 'A concertina distraiu-me!'],
      playerPot: ['Olha o artista! Bate palmas, malta!', 'Essa dava uma cantiga!'],
      playerFoul: ['Falta! Isso é desafinar, rapaz!'],
      win: ['Ganhei e vou fazer uma música sobre isto!', 'Festa rija, malta!'],
      lose: ['Perdi, mas a festa continua!', 'Ai a minha vida…'],
    },
  },
  {
    id: 'cristina', name: 'Cristina Ferreira', short: 'CRISTINA', tier: 'normal', diff: 3, unlock: { wins: 3 }, scene: 'vip',
    bio: 'Rainha das manhãs da televisão. Apresenta a partida enquanto a joga.',
    look: { skin: '#f3cfb0', hair: 'long', hairC: '#d9b070', lips: '#d8285e', earrings: '#ffd23f', top: { type: 'dress', c: '#e0408a', sparkle: '#ffc0dc' }, item: 'mic' },
    lines: {
      hello: ['Bom dia, Portugal! Hoje temos sinuca em direto!', 'Que maravilha, um adversário novo!'],
      pot: ['Isto sim é audiência!', 'Bola dentro, sorriso ligado!'],
      miss: ['Vamos para intervalo!', 'Ai, isto não ficou bem na câmara.'],
      playerPot: ['Que talento! Já te convido para o programa.', 'Palmas para ele, por favor!'],
      playerFoul: ['Ui! Isso vai para os apanhados.'],
      win: ['Ganhei! E a audiência subiu!', 'Que manhã fantástica!'],
      lose: ['Parabéns! Vais ao programa amanhã.', 'Até amanhã, Portugal…'],
    },
  },
  {
    id: 'rap', name: 'Ricardo Araújo Pereira', short: 'RAP', tier: 'normal', diff: 4, unlock: { wins: 4 }, scene: 'luxo',
    bio: 'Humorista. Comenta cada tacada com uma ironia tão fina como o taco.',
    look: { skin: '#eec39a', hair: 'short', hairC: '#2a2018', beard: 'full', beardC: '#2a2018', glasses: 'square', top: { type: 'suit', c: '#222222', shirt: '#ffffff', tie: null } },
    lines: {
      hello: ['Vou jogar com a seriedade que isto não merece.', 'Prometo não fazer piadas. É mentira.'],
      pot: ['Repara na elegância. Foi de propósito. Mais ou menos.', 'A física está do meu lado, coitada.'],
      miss: ['Falhei para não te humilhar. Sou generoso.', 'Isto é um género de humor muito subtil.'],
      playerPot: ['Muito bem. Odeio-te um bocadinho.', 'Uau. Vou fingir que não vi.'],
      playerFoul: ['Uma falta. Que original.'],
      win: ['Ganhei. Era o desfecho cómico mais previsível.', 'Vitória. Aplausos opcionais.'],
      lose: ['Perdi de propósito, para ter material.', 'Isto vai dar um sketch excelente.'],
    },
  },
  {
    id: 'trump', name: 'Donald Trump', short: 'TRUMP', tier: 'normal', diff: 4, unlock: { wins: 5 }, scene: 'vip',
    bio: 'Garante que joga a melhor sinuca de sempre. Tremenda. Ninguém joga melhor, dizem.',
    look: { skin: '#f2b37a', hair: 'swoop', hairC: '#f0d27a', top: { type: 'suit', c: '#1d2a50', shirt: '#ffffff', tie: '#d01020' } },
    lines: {
      hello: ['Vou jogar a melhor partida da história. Tremenda!', 'Muita gente diz que eu sou o melhor nisto.'],
      pot: ['Tremendo! Ninguém encaçapa como eu.', 'Bela bola. A mais bonita, acreditem.'],
      miss: ['A mesa está inclinada. Muito injusto!', 'Essa tacada foi perfeita, a bola é que falhou.'],
      playerPot: ['Nada mau. Mas eu fazia melhor.', 'Sorte. Muita sorte.'],
      playerFoul: ['Falta! Péssimo. Muito mau.'],
      win: ['Vitória enorme! A maior de sempre!', 'Eu disse! Ninguém ganha como eu!'],
      lose: ['Quero uma recontagem das bolas!', 'Foi uma derrota… tremenda. Para ti, claro.'],
    },
  },
  {
    id: 'shakira', name: 'Shakira', short: 'SHAKIRA', tier: 'normal', diff: 4, unlock: { wins: 6 }, scene: 'disco',
    bio: 'As ancas não mentem — e o taco também não. Joga sempre a dançar.',
    look: { skin: '#f0c49a', hair: 'wavy', hairC: '#e2b65a', lips: '#c8384a', earrings: '#ffd23f', top: { type: 'tank', c: '#f08020' } },
    lines: {
      hello: ['Waka waka, vamos jogar!', 'Prepara-te, isto vai ter ritmo!'],
      pot: ['As ancas não mentem!', 'Olé! Mais uma!'],
      miss: ['Ai, faltou-me o compasso.', 'Isto foi só o aquecimento.'],
      playerPot: ['Uau, tens ritmo!', 'Essa tacada dava uma música!'],
      playerFoul: ['Fora do ritmo, querido!'],
      win: ['É tempo de África… e de vitória!', 'Dança da vitória!'],
      lose: ['Ok, ganhaste… mas eu dancei melhor.', 'Vou chorar numa canção.'],
    },
  },
  {
    id: 'marcelo', name: 'Marcelo Rebelo de Sousa', short: 'MARCELO', tier: 'normal', diff: 5, unlock: { wins: 7 }, scene: 'luxo',
    bio: 'O Professor. Comenta todas as tacadas e tira selfies com o público entre jogadas.',
    look: { skin: '#f0c8a6', hair: 'balding', hairC: '#bdbdbd', top: { type: 'suit', c: '#2b3a5a', shirt: '#ffffff', tie: '#4060a0' }, item: 'phone' },
    lines: {
      hello: ['Antes de começar, uma selfie!', 'Vamos analisar esta mesa com rigor professoral.'],
      pot: ['Nota vinte! Excelente!', 'Esta merece um comentário no domingo.'],
      miss: ['Ora bem, isto foi pedagógico.', 'Foi para dar emoção ao jogo!'],
      playerPot: ['Muito bem! Merece um abraço!', 'Belíssimo! Uma selfie para celebrar?'],
      playerFoul: ['Ai, ai… isso tem de ser revisto.'],
      win: ['Vitória! E agora uma selfie com todos!', 'Afetos e tacadas certeiras!'],
      lose: ['Parabéns! Um abraço muito sentido!', 'Perdi, mas ganhei mais um amigo.'],
    },
  },
  {
    id: 'mrbeast', name: 'MrBeast', short: 'MRBEAST', tier: 'especial', diff: 3, unlock: { coins: 800 }, scene: 'stadium',
    bio: 'Oferece prémios absurdos a quem encaçapar. Especial: desbloqueia ao ganhares 800 moedas no total.',
    look: { skin: '#f2c9a0', hair: 'short', hairC: '#6b4423', beard: 'full', beardC: '#6b4423', top: { type: 'hoodie', c: '#2aa6e0', c2: '#ffffff' }, item: 'money' },
    lines: {
      hello: ['Se ganhares, dou-te uma ilha! (Não dou.)', 'Último a encaçapar ganha… nada! Vamos!'],
      pot: ['Esta tacada vale 100 mil moedas!', 'Oferecia um carro a esta bola!'],
      miss: ['Ok, vou dar 10 mil a quem fizer pior.', 'Isso foi só para o vídeo.'],
      playerPot: ['UAU! Toma lá… uma palmadinha nas costas!', 'Isto vai para a miniatura do vídeo!'],
      playerFoul: ['Falta! Perdeste o prémio imaginário!'],
      win: ['Ganhei! Agora oferece-me um carro!', 'Vídeo novo: ganhei a sinuca!'],
      lose: ['Ganhaste! O prémio é… a glória!', 'Vou fazer um vídeo sobre a minha derrota.'],
    },
  },
  {
    id: 'elon', name: 'Elon Musk', short: 'ELON', tier: 'especial', diff: 5, unlock: { challenges: 3 }, scene: 'luxo',
    bio: 'Quer levar a bola 8 para Marte. Especial: desbloqueia ao completares 3 desafios.',
    look: { skin: '#f1c9a5', hair: 'short', hairC: '#4a3426', top: { type: 'tshirt', c: '#151515' }, item: 'rocket' },
    lines: {
      hello: ['Calculei 42 trajetórias. Vamos começar.', 'Esta mesa precisa de um foguetão.'],
      pot: ['Aterragem perfeita na caçapa!', 'Para Marte e mais além!'],
      miss: ['Falha rápida, aprendizagem rápida.', 'Atualização de software pendente…'],
      playerPot: ['Interessante. Vou contratar-te.', 'Os meus algoritmos não previram isso.'],
      playerFoul: ['Erro humano detetado.'],
      win: ['Missão cumprida. Próxima paragem: Marte.', 'Engenharia pura.'],
      lose: ['Vou lançar uma versão 2.0 de mim.', 'Explosão inesperada… mas aprendemos.'],
    },
  },
  {
    id: 'neymar', name: 'Neymar Jr.', short: 'NEYMAR', tier: 'normal', diff: 5, unlock: { wins: 8 }, scene: 'disco',
    bio: 'Muito talento, muita finta e uma ou outra queda teatral perto da caçapa.',
    look: { skin: '#d9a777', hair: 'spiky', hairC: '#e2c060', beard: 'stubble', beardC: '#3a2a1a', earrings: '#ffffff', top: { type: 'jersey', c: '#ffd700', c2: '#00843d', num: '10', numC: '#0b3fa0' }, item: 'ball' },
    lines: {
      hello: ['Vamos jogar, meu parceiro! Com ginga!', 'Hoje é dia de lambreta na branca!'],
      pot: ['Golaço! Quer dizer… bolaço!', 'Ginga brasileira, meu irmão!'],
      miss: ['Ai! Falta! Alguém me tocou!', 'O taco escorregou… juro!'],
      playerPot: ['Que jogada, parceiro!', 'Isso foi uma finta e peras!'],
      playerFoul: ['Falta! Cartão amarelo para ti!'],
      win: ['Ganhei! Vou dançar na mesa!', 'É festa, meu povo!'],
      lose: ['Rolei três vezes no chão de tristeza.', 'Vou pedir o VAR!'],
    },
  },
  {
    id: 'bolt', name: 'Usain Bolt', short: 'BOLT', tier: 'normal', diff: 6, unlock: { wins: 10 }, scene: 'stadium',
    bio: 'O homem mais rápido do mundo. As bolas dele chegam à caçapa antes de partirem.',
    look: { skin: '#6b4226', hair: 'buzz', hairC: '#111111', top: { type: 'jersey', c: '#ffd500', c2: '#009b3a', num: '', numC: '#009b3a', emblem: 'bolt' } },
    lines: {
      hello: ['Pronto? Partida em 9,58 segundos!', 'Prepara-te para a velocidade.'],
      pot: ['Relâmpago na caçapa!', 'Rápido demais para ti!'],
      miss: ['Fui rápido demais até para a bola.', 'Falsa partida, repete!'],
      playerPot: ['Nada mau, mas és lento.', 'Ok, essa teve velocidade.'],
      playerFoul: ['Falsa partida! Desqualificado… quase.'],
      win: ['Recorde mundial de sinuca!', '⚡ Relâmpago!'],
      lose: ['Primeira vez que fico em segundo.', 'Preciso de treinar o sprint do taco.'],
    },
  },
  {
    id: 'lebron', name: 'LeBron James', short: 'LEBRON', tier: 'normal', diff: 6, unlock: { wins: 12 }, scene: 'stadium',
    bio: 'O Rei. Encaçapa como quem afunda no último segundo.',
    look: { skin: '#5c3a21', hair: 'buzz', hairC: '#111111', beard: 'full', beardC: '#111111', hat: { type: 'headband', c: '#ffffff' }, top: { type: 'jersey', c: '#552583', c2: '#fdb927', num: '23', numC: '#fdb927' }, item: 'basketball' },
    lines: {
      hello: ['O Rei chegou à mesa.', 'Isto é como basquetebol, mas deitado.'],
      pot: ['Afundanço na caçapa!', 'Três pontos!'],
      miss: ['Ressalto. Faz parte.', 'Era para ser um alley-oop.'],
      playerPot: ['Boa assistência a ti próprio!', 'Respeito, respeito.'],
      playerFoul: ['Falta técnica!'],
      win: ['Mais um anel para a coleção!', 'O Rei não perde a coroa.'],
      lose: ['Volto mais forte na próxima época.', 'Até o Rei descansa.'],
    },
  },
  {
    id: 'yamal', name: 'Lamine Yamal', short: 'YAMAL', tier: 'normal', diff: 6, unlock: { wins: 14 }, scene: 'stadium',
    bio: 'O miúdo prodígio. Joga como um veterano e ainda tem de fazer os trabalhos de casa.',
    look: { skin: '#8d5a3b', hair: 'curly', hairC: '#111111', top: { type: 'jersey', c: '#c60b1e', c2: '#ffc400', num: '19', numC: '#ffc400' }, item: 'ball' },
    lines: {
      hello: ['Só tenho até às nove, depois são os TPC.', 'Vamos lá, rápido que amanhã há escola!'],
      pot: ['De pé esquerdo… quer dizer, de taco!', 'Fácil!'],
      miss: ['Estava a pensar no teste de matemática.', 'Ups, é a idade.'],
      playerPot: ['Boa! Ensinas-me isso?', 'Fixe!'],
      playerFoul: ['Até o meu irmão mais novo faz melhor!'],
      win: ['Ganhei! Já posso jogar consola?', 'O futuro é agora!'],
      lose: ['Ainda estou a crescer!', 'A minha mãe vai dizer que foi bom na mesma.'],
    },
  },
  {
    id: 'mbappe', name: 'Kylian Mbappé', short: 'MBAPPÉ', tier: 'normal', diff: 7, unlock: { wins: 16 }, scene: 'stadium',
    bio: 'Tão rápido que a bola chega à caçapa antes de o taco lhe tocar.',
    look: { skin: '#7a4b2e', hair: 'bald', hairC: '#111111', top: { type: 'jersey', c: '#0a1f5c', c2: '#ffffff', num: '10', numC: '#ffffff' }, item: 'ball' },
    lines: {
      hello: ['Bonjour! Vamos jogar a alta velocidade.', 'Pronto para o contra-ataque?'],
      pot: ['Contra-ataque fulminante!', 'Trop facile!'],
      miss: ['Fora de jogo, pá.', 'Rápido demais, a bola não acompanhou.'],
      playerPot: ['Magnifique!', 'Uau, rápido!'],
      playerFoul: ['Falta! Até o árbitro viu.'],
      win: ['Vitória à velocidade da luz!', 'Champion!'],
      lose: ['Vou pedir transferência para outra mesa.', 'Merci, bem jogado.'],
    },
  },
  {
    id: 'mourinho', name: 'José Mourinho', short: 'MOURINHO', tier: 'normal', diff: 7, unlock: { wins: 18 }, scene: 'luxo',
    bio: 'O Special One. Estaciona o autocarro em frente às caçapas e ganha por 1-0.',
    look: { skin: '#e9be98', hair: 'short', hairC: '#9a9a9a', beard: 'stubble', beardC: '#8a8a8a', top: { type: 'coat', c: '#1a1d24', scarf: '#3a3f50' } },
    lines: {
      hello: ['Eu sou o Special One… da sinuca.', 'Já estudei o teu jogo. Todo.'],
      pot: ['Tática. Pura tática.', 'Eu avisei na conferência de imprensa.'],
      miss: ['Prefiro não falar. Se falo, sou castigado.', 'O árbitro… não digo nada.'],
      playerPot: ['Hm. Sorte, só isso.', 'Ainda não ganhaste nada.'],
      playerFoul: ['Vês? Eu sabia.'],
      win: ['Mais um título. É o que faço.', 'Estacionei o autocarro e ganhei.'],
      lose: ['Ganhaste o jogo, eu ganhei a conferência de imprensa.', 'Tenho mais títulos do que tu.'],
    },
  },
  {
    id: 'pepe', name: 'Pepe', short: 'PEPE', tier: 'normal', diff: 7, unlock: { wins: 20 }, scene: 'stadium',
    bio: 'Defesa de ferro. Aqui não passa nada — nem a bola branca.',
    look: { skin: '#c48a5c', hair: 'bald', hairC: '#1a1a1a', beard: 'full', beardC: '#1a1a1a', top: { type: 'jersey', c: '#c8102e', c2: '#046a38', num: '3', numC: '#ffd700' } },
    lines: {
      hello: ['Na minha mesa ninguém passa!', 'Prepara-te para levar com defesa.'],
      pot: ['Até os defesas marcam!', 'Cabeçada certeira!'],
      miss: ['Eu sou é defesa, pá!', 'Essa foi só um aliviar de bola.'],
      playerPot: ['Hmpf. Passou. Desta vez.', 'Boa. Mas não volta a acontecer.'],
      playerFoul: ['Falta! E eu nem te toquei!'],
      win: ['Muralha! Muralha!', 'Ninguém passa!'],
      lose: ['Fiz o que pude na defesa…', 'Grande jogo, respeito.'],
    },
  },
  {
    id: 'robo', name: 'Robô Taco 3000', short: 'ROBÔ', tier: 'especial', diff: 8, unlock: { tournament: true }, scene: 'disco',
    bio: 'Máquina construída só para jogar sinuca. Especial: desbloqueia ao ganhares um torneio.',
    look: { robot: true, skin: '#9fb0bf', hairC: '#ff4040', top: { type: 'robot', c: '#6f8293', c2: '#ffd23f' } },
    lines: {
      hello: ['A INICIAR PROTOCOLO SINUCA.', 'BIP BUP. ADVERSÁRIO DETETADO.'],
      pot: ['TRAJETÓRIA: PERFEITA.', 'BOLA. ELIMINADA.'],
      miss: ['ERRO 404: CAÇAPA NÃO ENCONTRADA.', 'A RECALIBRAR…'],
      playerPot: ['ANOMALIA DETETADA.', 'HUMANO… COMPETENTE?'],
      playerFoul: ['FALTA HUMANA REGISTADA. HA. HA.'],
      win: ['VITÓRIA. HUMANOS: 0.', 'DOMINAÇÃO DA MESA CONCLUÍDA.'],
      lose: ['A DESLIGAR… DE VERGONHA.', 'NECESSÁRIA ATUALIZAÇÃO.'],
    },
  },
  {
    id: 'cr7', name: 'Cristiano Ronaldo', short: 'CR7', tier: 'lendario', diff: 9, unlock: { wins: 22 }, scene: 'stadium',
    bio: 'O Comandante. Treina 25 horas por dia e celebra cada bola com um salto. SIIIUUU!',
    look: { skin: '#d6a173', hair: 'slick', hairC: '#1a1a1a', top: { type: 'jersey', c: '#c8102e', c2: '#046a38', num: '7', numC: '#ffd700' }, aura: '#ffd23f' },
    lines: {
      hello: ['Eu treino mais do que toda a gente. Preparado?', 'Vamos a isto. Calma, que eu estou aqui.'],
      pot: ['SIIIUUU!', 'Livre direto… para a caçapa!'],
      miss: ['Isto nunca me acontece. Nunca.', 'Amanhã treino o dobro.'],
      playerPot: ['Boa! Mas eu faço de bicicleta.', 'Respeito. Agora vê o mestre.'],
      playerFoul: ['Falta! Até no treino faço melhor.'],
      win: ['SIIIUUU! Mais um troféu!', 'Trabalho, trabalho, trabalho!'],
      lose: ['Parabéns. Vou treinar mais 10 horas.', 'Ainda não acabou. Volto mais forte.'],
    },
  },
  {
    id: 'messi', name: 'Lionel Messi', short: 'MESSI', tier: 'lendario', diff: 9, unlock: { beat: 'cr7' }, scene: 'stadium',
    bio: 'Fala pouco e joga muito. Lendário: desbloqueia ao venceres o CR7.',
    look: { skin: '#e5b38a', hair: 'short', hairC: '#5a3a22', beard: 'full', beardC: '#5a3a22', top: { type: 'jersey', c: '#75aadb', c2: '#ffffff', stripes: true, num: '10', numC: '#111111' }, aura: '#9fd4ff' },
    lines: {
      hello: ['Olá. Vamos jogar tranquilo.', '…'],
      pot: ['Tranquilo.', 'Assim, devagarinho.'],
      miss: ['Pois… acontece.', 'Hm.'],
      playerPot: ['Boa. Muito boa.', 'Bonita.'],
      playerFoul: ['Tranquilo, acontece a todos.'],
      win: ['Obrigado. Foi um bom jogo.', 'Mais uma para a coleção, tranquilo.'],
      lose: ['Bem jogado, de verdade.', 'Gostei de jogar contigo.'],
    },
  },
  {
    id: 'eusebio', name: 'Eusébio', short: 'EUSÉBIO', tier: 'lendario', diff: 10, unlock: { cup: 'lendas' }, scene: 'luxo',
    bio: 'O Pantera Negra. Lenda eterna do futebol português: elegância e potência em cada tacada. Desbloqueia ao ganhares a Taça das Lendas.',
    look: { skin: '#4a2c1a', hair: 'short', hairC: '#111111', top: { type: 'jersey', c: '#e00000', c2: '#ffffff', num: '10', numC: '#ffffff', collar: '#ffffff' }, aura: '#ffd23f' },
    lines: {
      hello: ['Força, miúdo! Joga com o coração.', 'Vamos fazer um bonito jogo.'],
      pot: ['Bonita tacada, sim senhor.', 'Com força e com jeito!'],
      miss: ['Faz parte. Levanta a cabeça.', 'O importante é jogar bonito.'],
      playerPot: ['Muito bem! Tens talento.', 'Isso! Assim é que é.'],
      playerFoul: ['Calma, respira e tenta outra vez.'],
      win: ['Bom jogo! Continua a treinar.', 'Foi um prazer.'],
      lose: ['Parabéns, campeão! Mereceste.', 'Que orgulho jogar contigo.'],
    },
  },
  {
    id: 'sombra', name: 'Mestre Sombra', short: 'SOMBRA', tier: 'lendario', diff: 10, unlock: { survival: 8 }, scene: 'disco',
    bio: 'Ninguém sabe quem é. Aparece nas salas mais escuras e nunca falha. Lendário: vence 8 rondas seguidas na Sobrevivência.',
    look: { hood: true, skin: '#1c1426', hairC: '#2a1f3a', eyes: '#d36bff', top: { type: 'hoodie', c: '#2a1f3a', c2: '#d36bff' }, aura: '#d36bff' },
    lines: {
      hello: ['…A sombra observa-te.', 'Ninguém me vence no escuro.'],
      pot: ['Inevitável.', 'Como previsto.'],
      miss: ['Interessante… a sombra hesitou.', 'Um momento de luz.'],
      playerPot: ['Tens potencial, aprendiz.', 'Hmmm…'],
      playerFoul: ['A escuridão castiga os impacientes.'],
      win: ['Volta para a luz, aprendiz.', 'A sombra prevalece.'],
      lose: ['Finalmente… um digno adversário.', 'A sombra curva-se perante ti.'],
    },
  },
];
const CHAR_BY_ID = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));

const SCENES = [
  { id: 'bar', name: 'Bar Clássico', price: 0, desc: 'Madeira velha, néon a piscar e o cheiro a tremoços.', bg: '#1d120b' },
  { id: 'disco', name: 'Discoteca', price: 250, desc: 'Bola de espelhos, luzes coloridas e pista de dança.', bg: '#120a20' },
  { id: 'vip', name: 'Sala VIP', price: 600, desc: 'Veludo vermelho, dourados e muito estilo.', bg: '#2a0a12' },
  { id: 'stadium', name: 'Estádio de Futebol', price: 900, desc: 'Relvado, holofotes e uma bancada aos gritos.', bg: '#0a1a30' },
  { id: 'luxo', name: 'Sala de Bilhar Luxuosa', price: 1500, desc: 'Lustres, mármore, quadros e lareira acesa.', bg: '#1a1208' },
];
const SCENE_BY_ID = Object.fromEntries(SCENES.map(s => [s.id, s]));

/* Tacos: só estética (não mudam a física). */
const CUES = [
  { id: 'basic', name: 'Taco do Bar', price: 0, butt: '#5a3218', shaft: '#d8b07a', band: '#222222', tip: '#3a7bd5', style: 'plain' },
  { id: 'classic', name: 'Madeira Clássica', price: 100, butt: '#2a160a', shaft: '#e6c48e', band: '#d8b23a', tip: '#3a7bd5', style: 'plain' },
  { id: 'blue', name: 'Azul Elétrico', price: 200, butt: '#0f3fa0', shaft: '#bcd6ff', band: '#ffffff', tip: '#4fd1ff', style: 'stripes' },
  { id: 'pink', name: 'Néon Rosa', price: 300, butt: '#ff2d95', shaft: '#ffd0ea', band: '#ffffff', tip: '#ff2d95', style: 'glow' },
  { id: 'ice', name: 'Gelo Polar', price: 450, butt: '#9be7ff', shaft: '#eafaff', band: '#4fb8e0', tip: '#ffffff', style: 'sparkle' },
  { id: 'carbon', name: 'Fibra de Carbono', price: 600, butt: '#1a1a1a', shaft: '#3a3a3a', band: '#ff3b3b', tip: '#ff3b3b', style: 'carbon' },
  { id: 'dragon', name: 'Dragão de Fogo', price: 900, butt: '#8a0f0f', shaft: '#ffb347', band: '#ffd23f', tip: '#ff6a00', style: 'flame' },
  { id: 'rainbow', name: 'Arco-Íris', price: 1200, butt: '#ff3b3b', shaft: '#ffffff', band: '#ffffff', tip: '#ffffff', style: 'rainbow' },
  { id: 'gold', name: 'Ouro Maciço', price: 2000, butt: '#b8860b', shaft: '#ffe28a', band: '#ffffff', tip: '#ffd23f', style: 'sparkle' },
  { id: 'legend', name: 'Taco Lendário', price: -1, unlockBy: 'champ_lendas', butt: '#3a0a5a', shaft: '#ffd23f', band: '#d36bff', tip: '#d36bff', style: 'glow' },
];

const TABLES = [
  { id: 'green', name: 'Verde Clássico', price: 0, felt: '#1f7a3a', rail: '#6b3b1f' },
  { id: 'blue', name: 'Azul Torneio', price: 150, felt: '#1f5aa8', rail: '#3b2414' },
  { id: 'red', name: 'Vermelho Paixão', price: 200, felt: '#a82a2a', rail: '#2a1a10' },
  { id: 'purple', name: 'Roxo Real', price: 300, felt: '#5a2a8a', rail: '#2a1a2a' },
  { id: 'pink', name: 'Rosa Choque', price: 300, felt: '#c8408a', rail: '#f4f4f4' },
  { id: 'black', name: 'Preto Noite', price: 450, felt: '#24262e', rail: '#8a8a8a' },
  { id: 'teal', name: 'Turquesa', price: 450, felt: '#16857e', rail: '#d8c8a0' },
  { id: 'gold', name: 'Dourado VIP', price: 1500, felt: '#a8801f', rail: '#1a1a1a' },
];

/* cores 1–7 (as riscadas 9–15 usam as mesmas). */
const BALLSETS = [
  { id: 'classic', name: 'Clássicas', price: 0, colors: ['#f2c21b', '#1f4fd0', '#d42a2a', '#6a2a9a', '#f07a1a', '#1a8a3a', '#8a2a1a'], eight: '#151515', cue: '#f6f2e6', style: 'normal' },
  { id: 'pastel', name: 'Pastel', price: 200, colors: ['#ffe08a', '#9ec4ff', '#ff9e9e', '#cfa6ff', '#ffc08a', '#a6ecb0', '#d8a88a'], eight: '#3a3a4a', cue: '#ffffff', style: 'normal' },
  { id: 'neon', name: 'Néon', price: 400, colors: ['#fff200', '#00e5ff', '#ff2d55', '#bf5af2', '#ff9f0a', '#32d74b', '#ff375f'], eight: '#101010', cue: '#ffffff', style: 'neon' },
  { id: 'retro', name: 'Retro 8-bit', price: 350, colors: ['#fcb514', '#3058d8', '#e03030', '#8040c0', '#f08020', '#20a040', '#a04020'], eight: '#000000', cue: '#fcfcfc', style: 'retro' },
  { id: 'galaxy', name: 'Galáxia', price: 800, colors: ['#ffd36b', '#5b7bff', '#ff5b8a', '#b56bff', '#ff9e5b', '#5bffb0', '#c08060'], eight: '#0a0620', cue: '#e8e4ff', style: 'galaxy' },
  { id: 'gold', name: 'Ouro e Prata', price: 1200, colors: ['#ffd23f', '#c0c8d8', '#ffd23f', '#c0c8d8', '#ffd23f', '#c0c8d8', '#ffd23f'], eight: '#1a1206', cue: '#fffbe8', style: 'gold' },
  { id: 'football', name: 'Futebol', price: 600, colors: ['#f2c21b', '#1f4fd0', '#d42a2a', '#6a2a9a', '#f07a1a', '#1a8a3a', '#8a2a1a'], eight: '#151515', cue: '#ffffff', style: 'football' },
];

const POTFX = [
  { id: 'sparks', name: 'Faíscas', price: 0, colors: ['#ffffff', '#ffe08a', '#ffd23f'] },
  { id: 'confetti', name: 'Confetes', price: 150, colors: ['#ff3b3b', '#3bb0ff', '#ffd23f', '#3bff7a', '#ff6bd6'] },
  { id: 'stars', name: 'Estrelas', price: 250, colors: ['#ffd23f', '#ffffff'] },
  { id: 'hearts', name: 'Corações', price: 300, colors: ['#ff3b6b', '#ff8fb0'] },
  { id: 'fire', name: 'Fogo', price: 400, colors: ['#ffef5a', '#ff9a1a', '#ff3b1a'] },
  { id: 'lightning', name: 'Relâmpagos', price: 500, colors: ['#e8f4ff', '#7ac8ff'] },
  { id: 'coins', name: 'Chuva de Moedas', price: 700, colors: ['#ffd23f', '#c8961a'] },
];

const AVATAR = {
  skins: ['#f6d2b8', '#eec39a', '#d9a066', '#c48a5c', '#8d5a3b', '#5c3a21'],
  hairs: ['short', 'buzz', 'spiky', 'slick', 'curly', 'long', 'bangs', 'bun', 'afro', 'bald'],
  hairNames: { short: 'Curto', buzz: 'Rapado', spiky: 'Espetado', slick: 'Penteado', curly: 'Encaracolado', long: 'Comprido', bangs: 'Franja', bun: 'Carrapito', afro: 'Afro', bald: 'Careca' },
  hairColors: ['#1a1a1a', '#4a3426', '#8a5a2a', '#e2c060', '#c8402a', '#bdbdbd', '#3a6ad8', '#ff5ab0'],
  tops: ['tshirt', 'hoodie', 'jersey', 'suit', 'tank'],
  topNames: { tshirt: 'T-shirt', hoodie: 'Camisola', jersey: 'Equipamento', suit: 'Fato', tank: 'Cavas' },
  topColors: ['#e04040', '#2f6fd0', '#1a8a3a', '#f2c21b', '#6a2a9a', '#151515', '#f4f4f4', '#f07a1a', '#16857e', '#ff5ab0'],
  beards: [null, 'stubble', 'mustache', 'full'],
  beardNames: { null: 'Nada', stubble: 'Barba curta', mustache: 'Bigode', full: 'Barba' },
  glasses: [null, 'round', 'square', 'sun'],
  glassesNames: { null: 'Nada', round: 'Redondos', square: 'Quadrados', sun: 'De sol' },
  hats: [
    { id: null, name: 'Nada' },
    { id: 'cap', name: 'Boné', c: '#2f6fd0' },
    { id: 'beanie', name: 'Gorro', c: '#c84040' },
    { id: 'headband', name: 'Fita', c: '#ffffff' },
    { id: 'tophat', name: 'Cartola', c: '#151515', unlockBy: 'millionaire' },
    { id: 'crown', name: 'Coroa', c: '#ffd23f', unlockBy: 'champ' },
  ],
};

const ACHIEVEMENTS = [
  { id: 'first_win', name: 'Primeira Vitória', desc: 'Ganha a tua primeira partida.', reward: 50, test: s => s.wins >= 1 },
  { id: 'wins10', name: 'Habitué do Bar', desc: 'Ganha 10 partidas.', reward: 150, test: s => s.wins >= 10 },
  { id: 'wins50', name: 'Tubarão da Mesa', desc: 'Ganha 50 partidas.', reward: 500, test: s => s.wins >= 50 },
  { id: 'wins100', name: 'Centenário', desc: 'Ganha 100 partidas.', reward: 1000, test: s => s.wins >= 100 },
  { id: 'combo2', name: 'Dois Coelhos', desc: 'Encaçapa 2 bolas numa só tacada.', reward: 50, test: s => s.combos2 >= 1 },
  { id: 'combo3', name: 'Hat-trick', desc: 'Encaçapa 3 bolas numa só tacada.', reward: 150, test: s => s.combos3 >= 1 },
  { id: 'runout', name: 'Mesa Limpa', desc: 'Ganha sem o adversário chegar a tacar.', reward: 300, test: s => s.runouts >= 1 },
  { id: 'nofoul', name: 'Cavalheiro', desc: 'Ganha 5 partidas sem fazer faltas.', reward: 150, test: s => s.noFoulWins >= 5 },
  { id: 'champ', name: 'Campeão', desc: 'Ganha um torneio. Prémio: coroa para a tua personagem.', reward: 200, test: s => s.tournaments >= 1 },
  { id: 'champ_lendas', name: 'Lenda das Lendas', desc: 'Ganha a Taça das Lendas. Prémio: Taco Lendário.', reward: 800, test: s => (s.cupWins.lendas || 0) >= 1 },
  { id: 'surv5', name: 'Sobrevivente', desc: 'Vence 5 rondas seguidas no modo Sobrevivência.', reward: 150, test: s => s.bestSurvival >= 5 },
  { id: 'surv10', name: 'Imparável', desc: 'Vence 10 rondas seguidas no modo Sobrevivência.', reward: 500, test: s => s.bestSurvival >= 10 },
  { id: 'beat_cr7', name: 'SIIIUUU!', desc: 'Vence o Cristiano Ronaldo.', reward: 200, test: s => (s.beaten.cr7 || 0) >= 1 },
  { id: 'beat_messi', name: 'Tranquilo', desc: 'Vence o Lionel Messi.', reward: 200, test: s => (s.beaten.messi || 0) >= 1 },
  { id: 'goat', name: 'Debate Encerrado', desc: 'Vence o CR7 e o Messi.', reward: 400, test: s => (s.beaten.cr7 || 0) >= 1 && (s.beaten.messi || 0) >= 1 },
  { id: 'collect10', name: 'Colecionador', desc: 'Desbloqueia 10 adversários.', reward: 200, test: s => s.charsUnlocked >= 10 },
  { id: 'collect_all', name: 'Caderneta Completa', desc: 'Desbloqueia todos os adversários.', reward: 1000, test: s => s.charsUnlocked >= CHARACTERS.length },
  { id: 'rich', name: 'Mealheiro', desc: 'Junta 1000 moedas ao mesmo tempo.', reward: 100, test: s => s.coinsNow >= 1000 },
  { id: 'millionaire', name: 'Milionário', desc: 'Ganha 10 000 moedas no total. Prémio: cartola.', reward: 500, test: s => s.totalCoins >= 10000 },
  { id: 'shopper', name: 'Estiloso', desc: 'Compra 5 artigos na loja.', reward: 150, test: s => s.itemsBought >= 5 },
  { id: 'challenger', name: 'Desafiante', desc: 'Completa 5 desafios.', reward: 150, test: s => s.challengesDone >= 5 },
  { id: 'challenge_master', name: 'Perfeccionista', desc: 'Tem 3 estrelas em todos os desafios.', reward: 800, test: s => s.challenges3 >= CHALLENGES.length },
  { id: 'daily10', name: 'Rotina de Campeão', desc: 'Completa 10 desafios diários.', reward: 300, test: s => s.dailyDone >= 10 },
  { id: 'tourist', name: 'Turista', desc: 'Joga em todos os cenários.', reward: 200, test: s => Object.keys(s.scenesPlayed).length >= SCENES.length },
  { id: 'revenge', name: 'Vingança', desc: 'Vence alguém que te tinha derrotado.', reward: 100, test: s => s.revenges >= 1 },
  { id: 'potted500', name: 'Máquina de Encaçapar', desc: 'Encaçapa 500 bolas.', reward: 300, test: s => s.potted >= 500 },
  { id: 'level10', name: 'Veterano', desc: 'Chega ao nível 10.', reward: 300, test: s => s.level >= 10 },
];

/* Desafios: posições em unidades da mesa (largura 1, comprimento 2). Tipos:
   clear (encaçapa todas), multi (k bolas numa só tacada), bank (encaçapa a bola alvo depois de tocar numa tabela),
   order (encaçapa por ordem numérica), timed (limpa a mesa dentro do tempo), only (só a bola alvo; as outras não podem cair). */
function rackCluster(cx, cy, ids) {
  const out = []; const R = 0.03, dx = 2 * R + 0.002, dy = dx * 0.866;
  let i = 0;
  for (let row = 0; i < ids.length; row++) {
    for (let k = 0; k <= row && i < ids.length; k++) out.push({ id: ids[i++], x: cx + (k - row / 2) * dx, y: cy - row * dy });
  }
  return out;
}
const CHALLENGES = [
  { id: 'c1', name: 'Primeira Tacada', desc: 'Encaçapa a bola amarela.', type: 'clear', shots: 3, par: 1, reward: 60,
    cue: { x: 0.54, y: 0.79 }, balls: [{ id: 1, x: 0.2, y: 0.3 }] },
  { id: 'c2', name: 'Lado a Lado', desc: 'Encaçapa as duas bolas nas caçapas do meio.', type: 'clear', shots: 4, par: 2, reward: 80,
    cue: { x: 0.5, y: 1.0 }, balls: [{ id: 2, x: 0.16, y: 1.0 }, { id: 3, x: 0.84, y: 1.0 }] },
  { id: 'c3', name: 'Tabela!', desc: 'Encaçapa a bola 8 depois de ela tocar numa tabela.', type: 'bank', target: 8, shots: 4, par: 1, reward: 100,
    cue: { x: 0.5, y: 1.55 }, balls: [{ id: 8, x: 0.5, y: 0.9 }] },
  { id: 'c4', name: 'Em Fila', desc: 'Encaçapa as 4 bolas.', type: 'clear', shots: 7, par: 4, reward: 100,
    cue: { x: 0.5, y: 1.7 }, balls: [{ id: 1, x: 0.25, y: 0.35 }, { id: 2, x: 0.75, y: 0.35 }, { id: 3, x: 0.25, y: 1.65 }, { id: 4, x: 0.75, y: 1.65 }] },
  { id: 'c5', name: 'Por Ordem', desc: 'Encaçapa as bolas 1, 2 e 3 por esta ordem.', type: 'order', shots: 6, par: 3, reward: 120,
    cue: { x: 0.5, y: 1.5 }, balls: [{ id: 1, x: 0.3, y: 0.6 }, { id: 2, x: 0.7, y: 1.2 }, { id: 3, x: 0.4, y: 1.8 }] },
  { id: 'c6', name: 'Dois de Uma Vez', desc: 'Encaçapa 2 bolas na mesma tacada.', type: 'multi', k: 2, shots: 5, par: 1, reward: 150,
    cue: { x: 0.5, y: 1.6 }, balls: rackCluster(0.5, 0.55, [1, 2, 3, 4, 5, 6]) },
  { id: 'c7', name: 'Contra-Relógio', desc: 'Limpa a mesa em menos de 75 segundos.', type: 'timed', time: 75, shots: 99, par: 6, reward: 150,
    cue: { x: 0.5, y: 1.5 }, balls: [{ id: 1, x: 0.15, y: 0.2 }, { id: 2, x: 0.85, y: 0.2 }, { id: 3, x: 0.5, y: 0.7 }, { id: 4, x: 0.12, y: 1.0 }, { id: 5, x: 0.88, y: 1.0 }, { id: 6, x: 0.5, y: 1.85 }] },
  { id: 'c8', name: 'Cercado', desc: 'Encaçapa só a bola 8. Nenhuma outra pode cair.', type: 'only', target: 8, shots: 3, par: 1, reward: 150,
    cue: { x: 0.5, y: 1.6 }, balls: [{ id: 8, x: 0.5, y: 0.5 }, { id: 9, x: 0.4, y: 0.42 }, { id: 10, x: 0.6, y: 0.42 }, { id: 11, x: 0.36, y: 0.58 }, { id: 12, x: 0.64, y: 0.58 }] },
  { id: 'c9', name: 'Hat-trick', desc: 'Encaçapa 3 bolas na mesma tacada.', type: 'multi', k: 3, shots: 6, par: 2, reward: 200,
    cue: { x: 0.5, y: 1.6 }, balls: rackCluster(0.5, 0.5, [1, 2, 3, 4, 5, 6, 7, 9, 10, 11]) },
  { id: 'c10', name: 'Tabela Dupla', desc: 'Encaçapa a bola 5 depois de tocar numa tabela, com obstáculos no caminho.', type: 'bank', target: 5, shots: 4, par: 1, reward: 200,
    cue: { x: 0.3, y: 1.5 }, balls: [{ id: 5, x: 0.7, y: 1.0 }, { id: 13, x: 0.5, y: 0.6 }, { id: 14, x: 0.15, y: 0.5 }] },
  { id: 'c11', name: 'Sprint Final', desc: 'Limpa a mesa completa em menos de 3 minutos.', type: 'timed', time: 180, shots: 99, par: 14, reward: 300,
    cue: { x: 0.5, y: 1.55 }, balls: rackCluster(0.5, 0.5, [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]) },
  { id: 'c12', name: 'Mestre da Mesa', desc: 'Limpa a mesa completa em 10 tacadas ou menos.', type: 'clear', shots: 10, par: 7, reward: 500,
    cue: { x: 0.5, y: 1.55 }, balls: rackCluster(0.5, 0.5, [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]) },
];

const CUPS = [
  { id: 'bairro', name: 'Taça do Bairro', entry: 0, prize: 250, range: [1, 4], scene: 'bar', unlock: null, desc: 'Torneio de café. Bom para começar.' },
  { id: 'estrelas', name: 'Taça das Estrelas', entry: 100, prize: 700, range: [3, 7], scene: 'disco', unlock: { cup: 'bairro' }, desc: 'Famosos de todo o mundo. Desbloqueia ao ganhares a Taça do Bairro.' },
  { id: 'lendas', name: 'Taça das Lendas', entry: 300, prize: 1800, range: [6, 10], scene: 'luxo', unlock: { cup: 'estrelas' }, desc: 'Só para lendas. Desbloqueia ao ganhares a Taça das Estrelas.' },
];
const ROUND_NAMES = ['Quartos de final', 'Meias-finais', 'Final'];

const DAILY_TEMPLATES = [
  { type: 'win', n: 2, text: 'Ganha {n} partidas', reward: 80 },
  { type: 'win', n: 3, text: 'Ganha {n} partidas', reward: 120 },
  { type: 'pot', n: 20, text: 'Encaçapa {n} bolas', reward: 60 },
  { type: 'pot', n: 40, text: 'Encaçapa {n} bolas', reward: 100 },
  { type: 'combo', n: 1, text: 'Encaçapa 2 bolas numa só tacada', reward: 80 },
  { type: 'beatDiff', n: 1, d: 6, text: 'Vence um adversário de dificuldade 6 ou mais', reward: 120 },
  { type: 'tournamentMatch', n: 2, text: 'Ganha {n} jogos de torneio', reward: 100 },
  { type: 'survRound', n: 3, text: 'Passa {n} rondas no modo Sobrevivência', reward: 100 },
  { type: 'challenge', n: 1, text: 'Completa um desafio', reward: 70 },
  { type: 'noFoulWin', n: 1, text: 'Ganha uma partida sem faltas', reward: 90 },
  { type: 'shots', n: 30, text: 'Faz {n} tacadas', reward: 50 },
  { type: 'sceneNotBar', n: 1, text: 'Joga uma partida fora do Bar Clássico', reward: 60 },
];

const COMMENTS = {
  break: ['E começa a partida! Que estrondo!', 'Abertura feita. As bolas estão em pânico.', 'Que break! Até a lâmpada tremeu.'],
  pot: ['Lá para dentro!', 'Que categoria!', 'A caçapa agradece.', 'Limpinho!', 'Bola no saco!'],
  combo: ['DUAS DE UMA VEZ! Isto é magia!', 'Combinação de luxo!', 'Duas bolas, um só bilhete!'],
  combo3: ['TRÊS?! Alguém chame os bombeiros!', 'Hat-trick na mesa! Inacreditável!'],
  miss: ['Uiii, por pouco!', 'A bola não quis.', 'Falhou… mas com estilo.', 'Quase! Quase conta?'],
  scratch: ['A branca foi dar um passeio à caçapa…', 'Branca ao fundo! Que vergonha alheia.', 'Isso não era para entrar, pois não?'],
  nohit: ['Nem tocou numa bola! Foi treinar o ar?', 'Tacada fantasma! Falta.'],
  wrong: ['Bola errada primeiro! Falta.', 'Essa bola não era tua!'],
  open: ['A mesa continua aberta.', 'Ainda ninguém escolheu cor.'],
  groups: ['Grupos definidos: começa a guerra!', 'Cores escolhidas. Agora é a sério.'],
  on8: ['Só falta a preta! Tensão máxima!', 'Agora é a bola 8. Respira fundo…'],
  long: ['Do outro lado da mesa! Que pontaria!', 'Tacada de longa distância. Espetacular!'],
  respot8: ['A 8 caiu no break! Volta para a mesa.'],
  run: ['Está imparável!', 'Alguém trave este jogador!', 'Sequência de sonho!'],
};
