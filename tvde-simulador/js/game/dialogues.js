// Diálogos e situações durante as viagens. Cada escolha tem consequências.
// Efeitos: mood (humor), tip (gorjeta extra €), fareAdd (valor extra na tarifa), money (dinheiro imediato),
// clean (limpeza do carro), rep (reputação), action: faster | detour | stop | changeDest | endEarly | hardBrake | slow
// rnd: { p, ok:{...}, bad:{...} } — resultado aleatório

const any = null;
const notQuiet = (c) => c.pers !== 'calado' && c.pers !== 'executivo';

export const SCENES = [
  // ---------- CUMPRIMENTOS ----------
  { id: 'g_warm', kind: 'greet', pers: ['simpatico', 'generoso', 'conversador'], text: (c) => `${c.saud}! Tudo bem consigo?`,
    choices: [
      { t: (c) => `Tudo ótimo, obrigado! E consigo? Vamos para ${c.destShort}, certo?`, mood: 8, reply: 'Certíssimo! Que simpatia, obrigado.' },
      { t: (c) => `${c.saud}. Confirma o destino: ${c.destShort}?`, mood: 4, reply: 'Sim, isso mesmo.' },
      { t: '(Acenar com a cabeça e arrancar)', mood: -4, reply: '...Ok.' },
    ] },
  { id: 'g_quiet', kind: 'greet', pers: ['calado', 'executivo'], text: (c) => `${c.saud}.`,
    choices: [
      { t: (c) => `${c.saud}. A temperatura está boa assim?`, mood: 5, reply: 'Está ótima, obrigado.' },
      { t: 'Então, como está a correr o dia? Muito trabalho?', mood: -7, reply: '...Sim. Bastante.' },
      { t: '(Sorrir e arrancar com suavidade)', mood: 5 },
    ] },
  { id: 'g_hurry', kind: 'greet', pers: ['apressado'], text: 'Olá! Desculpe, estou mesmo atrasado. Consegue ir rápido?',
    choices: [
      { t: 'Vou pelo caminho mais rápido, fique descansado.', mood: 6, reply: 'Obrigado, a sério!' },
      { t: 'Posso acelerar um bocadinho...', mood: 12, eff: { action: 'faster' }, reply: 'Isso! Muito obrigado!' },
      { t: 'Vou respeitar os limites de velocidade, peço desculpa.', mood: -5, reply: 'Pronto... está bem.' },
    ] },
  { id: 'g_rude', kind: 'greet', pers: ['rude'], text: 'Demorou imenso. Vamos lá, que não tenho o dia todo.',
    choices: [
      { t: 'Peço desculpa pela espera. Vamos já.', mood: 10, reply: 'Hmpf.' },
      { t: 'O trânsito estava complicado, mas já cá estou.', mood: 2, reply: 'Desculpas, desculpas...' },
      { t: 'Se calhar podia ser um pouco mais simpático.', mood: -16, reply: 'Era o que faltava. Conduza.' },
    ] },
  { id: 'g_party', kind: 'greet', pers: ['festivo'], text: 'Eeeei motorista! Boa noiteee! Bora lá!',
    choices: [
      { t: 'Boa noite! Pelos vistos divertiu-se!', mood: 9, reply: 'Melhor noite do ano, a sério!' },
      { t: 'Boa noite. Cinto de segurança, por favor.', mood: 2, reply: 'Sim senhor, chefe!' },
      { t: 'Por favor, não faça muito barulho no carro.', mood: -9, reply: 'Uiii, que sério...' },
    ] },
  { id: 'g_tourist', kind: 'greet', pers: ['turista'], text: (c) => `Hello! Olá! Desculpe, o meu português é pouco... ${c.destShort}, sim?`,
    choices: [
      { t: 'Yes! Welcome to Porto Azul!', mood: 12, reply: 'Oh, thank you! Muito obrigado!' },
      { t: (c) => `Sim, ${c.destShort}. Bem-vindo!`, mood: 6, reply: 'Obrigado!' },
      { t: '(Mostrar o destino no telemóvel)', mood: 1 },
    ] },
  { id: 'g_picky', kind: 'greet', pers: ['exigente'], text: (c) => `${c.saud}. Pode baixar a temperatura? E desligar o rádio, por favor.`,
    choices: [
      { t: 'Claro, já está.', mood: 10, reply: 'Obrigado. Assim está muito melhor.' },
      { t: 'Baixo a temperatura; o rádio já estava desligado.', mood: 4, reply: 'Ah, está bem.' },
      { t: 'Prefiro manter assim, está agradável.', mood: -12, reply: 'A sério? Fantástico...' },
    ] },
  { id: 'g_generic', kind: 'greet', pers: ['apressado', 'simpatico', 'exigente', 'festivo'], w: 0.5, text: (c) => `${c.saud}, é para ${c.destShort}.`,
    choices: [
      { t: 'Perfeito, vamos a isso. Pode pôr o cinto?', mood: 5, reply: 'Claro.' },
      { t: 'Ok.', mood: 0 },
    ] },

  // ---------- CONVERSAS ----------
  { id: 'm_rain', kind: 'mid', pers: any, cond: (c) => c.weather === 'chuva' && notQuiet(c), text: 'Que chuva, hein? Nunca mais pára...',
    choices: [
      { t: 'Pois é, mas faz falta para os campos!', mood: 5, reply: 'Lá isso é verdade.' },
      { t: 'Com chuva há sempre mais trabalho para nós.', mood: 3, reply: 'Imagino! Ainda bem que o apanhei.' },
      { t: '(Silêncio)', mood: -2, moodPers: { conversador: -6 } },
    ] },
  { id: 'm_sun', kind: 'mid', pers: any, cond: (c) => c.weather === 'limpo' && !c.night && notQuiet(c), text: 'Está um dia lindo hoje! Apetece mesmo ir à praia.',
    choices: [
      { t: 'Nem me diga! Ao fim do dia vou dar um mergulho.', mood: 7, reply: 'Faz muito bem!' },
      { t: 'Para quem trabalha é igual, infelizmente.', mood: 1, reply: 'Ahah, coitado!' },
      { t: '(Sorrir)', mood: 1 },
    ] },
  { id: 'm_fog', kind: 'mid', pers: any, cond: (c) => c.weather === 'nevoeiro', text: 'Com este nevoeiro mal se vê nada! Vá com cuidado.',
    choices: [
      { t: 'Não se preocupe, vou devagar e com atenção.', mood: 8, eff: { action: 'slow' }, reply: 'Assim fico mais descansado.' },
      { t: 'Conheço isto de olhos fechados.', mood: -3, reply: 'Hum... prefiro que os tenha abertos.' },
    ] },
  { id: 'm_work', kind: 'mid', pers: ['conversador', 'simpatico', 'generoso', 'turista'], text: 'Então e há quanto tempo é que faz TVDE?',
    choices: [
      { t: 'Há pouco tempo, mas estou a gostar muito!', mood: 6, reply: 'Que bom! Nota-se que tem jeito.' },
      { t: 'Já há uns tempos. Conheço a cidade como as minhas mãos.', mood: 7, reply: 'Então estou em boas mãos!' },
      { t: 'Prefiro não falar de trabalho, desculpe.', mood: -6, reply: 'Oh... claro, claro.' },
    ] },
  { id: 'm_football', kind: 'mid', pers: ['conversador', 'festivo', 'simpatico'], text: 'Viu o jogo ontem? Que vergonha aquele árbitro!',
    choices: [
      { t: 'Nem me fale! Era penálti claríssimo!', mood: 10, reply: 'Exatamente! Finalmente alguém com bom senso!' },
      { t: 'Não ligo muito a futebol, confesso.', mood: -3, reply: 'A sério? Que pena!' },
      { t: 'Eu sou do outro clube...', rnd: { p: 0.5, ok: { mood: 9, reply: 'Ahah! Pelo menos tem sentido de humor!' }, bad: { mood: -8, reply: 'Ah... pronto. Fico calado.' } } },
    ] },
  { id: 'm_family', kind: 'mid', pers: ['simpatico', 'conversador', 'generoso'], text: 'Vou ter com a minha filha, faz anos hoje!',
    choices: [
      { t: 'Que bom! Muitos parabéns à sua filha!', mood: 10, reply: 'Obrigado! Ela vai adorar o presente.' },
      { t: 'Que idade faz?', mood: 7, reply: 'Faz 7! Está enorme, nem acredito.' },
      { t: 'Hm.', mood: -5 },
    ] },
  { id: 'm_chatty', kind: 'mid', pers: ['conversador'], text: 'E sabe o que me aconteceu hoje? O meu chefe decidiu mudar tudo outra vez...',
    choices: [
      { t: 'A sério? Conte lá isso!', mood: 11, reply: 'Então ouça... (conta a história toda com entusiasmo)' },
      { t: 'Hmm, hum... (ouvir com atenção)', mood: 4, reply: '...e pronto, é o que é!' },
      { t: 'Desculpe, preciso de me concentrar no trânsito.', mood: -8, reply: 'Ah, claro... desculpe.' },
    ] },
  { id: 'm_tour_food', kind: 'mid', pers: ['turista'], text: 'Can you recommend... um restaurante? Comida portuguesa?',
    choices: [
      { t: 'Experimente a Marisqueira Atlântida. O bacalhau é incrível!', mood: 14, eff: { tip: 2 }, reply: 'Amazing! Vou lá hoje à noite!' },
      { t: 'Há muitos na zona da Tasca do Zé. É só escolher.', mood: 6, reply: 'Ok, thank you!' },
      { t: 'Sorry, não sei.', mood: -5, reply: 'Oh... ok.' },
    ] },
  { id: 'm_tour_city', kind: 'mid', pers: ['turista'], text: 'Porto Azul is beautiful! O que devo visitar?',
    choices: [
      { t: 'O Parque da Cidade e a praia ao pôr do sol!', mood: 12, reply: 'Wonderful, vou anotar!' },
      { t: 'O Museu do Mar é muito interessante.', mood: 8, reply: 'Gosto de museus, obrigado!' },
      { t: 'Não há muito para ver, sinceramente.', mood: -10, reply: 'Oh... que pena.' },
    ] },
  { id: 'm_exec_call', kind: 'mid', pers: ['executivo'], text: '(Ao telefone) Sim... não, a reunião é às três... (para si) Desculpe, pode baixar o rádio?',
    choices: [
      { t: '(Desligar o rádio e manter silêncio)', mood: 11, reply: '(acena em agradecimento)' },
      { t: 'Claro, com certeza.', mood: 7 },
      { t: 'O rádio não está assim tão alto...', mood: -9, reply: '(suspira)' },
    ] },
  { id: 'm_exec_card', kind: 'mid', pers: ['executivo'], w: 0.6, text: 'Conduz bem. Às vezes preciso de motorista para clientes. Tem contacto?',
    choices: [
      { t: 'Muito obrigado! Pode sempre pedir-me pela app.', mood: 8, eff: { tip: 3 }, reply: 'Excelente. Vou lembrar-me de si.' },
      { t: 'Só trabalho através da plataforma, mas obrigado.', mood: 5, eff: { rep: 1 }, reply: 'Profissional. Gosto disso.' },
    ] },
  { id: 'm_hurry', kind: 'mid', pers: ['apressado'], text: 'Pode ir um bocadinho mais depressa? Por favor!',
    choices: [
      { t: 'Vou acelerar.', mood: 10, eff: { action: 'faster' }, reply: 'Obrigado!' },
      { t: 'Vou o mais rápido que a lei permite.', mood: 2, reply: 'Pronto...' },
      { t: 'Não vou arriscar uma multa, desculpe.', mood: -6, reply: 'Vou chegar tardíssimo...' },
    ] },
  { id: 'm_hurry_traffic', kind: 'mid', pers: ['apressado', 'exigente'], cond: (c) => c.redAhead, text: 'Isto está tudo parado! Não há outro caminho?',
    choices: [
      { t: 'Vou tentar um caminho alternativo.', mood: 8, eff: { action: 'detour' }, reply: 'Boa ideia!' },
      { t: 'Este é o mais rápido, garanto-lhe.', mood: 2, reply: 'Espero bem que sim.' },
      { t: 'Devia ter saído mais cedo.', mood: -15, reply: 'Como?! Que falta de educação!' },
    ] },
  { id: 'm_rude', kind: 'mid', pers: ['rude'], text: 'Você conduz pior que a minha avó. Onde é que tirou a carta?',
    choices: [
      { t: 'Estou a conduzir com segurança; é a minha prioridade.', mood: 8, eff: { rep: 1 }, reply: '...Hmpf. Está bem.' },
      { t: '(Ignorar e continuar)', mood: 0 },
      { t: 'Se não está satisfeito, pode sair aqui.', mood: -40, eff: { action: 'endEarly' }, reply: 'Ótimo! Vou fazer queixa!' },
      { t: 'A sua avó deve ser uma excelente condutora.', mood: -6, rnd: { p: 0.4, ok: { mood: 14, reply: 'Ahah! Pronto, essa teve piada.' }, bad: { mood: -8, reply: 'Engraçadinho...' } } },
    ] },
  { id: 'm_rude2', kind: 'mid', pers: ['rude'], text: 'Que cheiro é este? Este carro é uma vergonha.',
    choices: [
      { t: 'Peço desculpa. Quer que abra um pouco a janela?', mood: 8, reply: 'Pelo menos isso.' },
      { t: 'O carro foi lavado hoje de manhã.', mood: -3, reply: 'Não parece.' },
      { t: 'Ninguém o obrigou a escolher este carro.', mood: -18, reply: 'Vai ver a avaliação que lhe vou dar!' },
    ] },
  { id: 'm_feet', kind: 'mid', pers: ['rude', 'festivo'], text: '(O passageiro pôs os pés em cima do banco)', sys: true,
    choices: [
      { t: 'Peço-lhe que tire os pés do banco, por favor.', mood: -2, reply: 'Pronto, pronto...' },
      { t: '(Deixar estar)', mood: 2, eff: { clean: -12 } },
      { t: 'Tire já os pés daí!', mood: -14, reply: 'Calma! Que stress...' },
    ] },
  { id: 'm_stop', kind: 'mid', pers: ['exigente', 'simpatico', 'generoso', 'conversador', 'apressado'], w: 0.6, text: 'Desculpe, pode parar um minuto na farmácia aqui à frente? É rápido.',
    choices: [
      { t: 'Claro, sem problema. Eu espero.', mood: 12, eff: { action: 'stop', stopMin: 4, fareAdd: 1.2 }, reply: 'Muito obrigado! Volto já.' },
      { t: 'Só se for mesmo rápido, tenho outras viagens.', mood: 4, eff: { action: 'stop', stopMin: 3, fareAdd: 0.9 }, reply: 'Prometo, dois minutos!' },
      { t: 'Lamento, não posso fazer paragens.', mood: -10, reply: 'Que chatice...' },
    ] },
  { id: 'm_change', kind: 'mid', pers: any, w: 0.55, text: (c) => `Olhe, mudei de ideias. Pode antes levar-me a ${c.newDest}?`,
    choices: [
      { t: 'Claro, vou alterar o destino.', mood: 9, eff: { action: 'changeDest' }, reply: 'Ótimo, obrigado!' },
      { t: 'Posso, mas o preço vai ser recalculado.', mood: 5, eff: { action: 'changeDest' }, reply: 'Sim, sem problema.' },
      { t: 'Não posso alterar a viagem, desculpe.', mood: -12, reply: 'A sério? Na app dá para mudar...' },
    ] },
  { id: 'm_music', kind: 'mid', pers: ['festivo', 'conversador', 'turista'], text: 'Posso pôr uma música? Tenho aqui a minha playlist!',
    choices: [
      { t: 'Claro! Ligue ao Bluetooth.', mood: 12, reply: '🎵 (Começa a tocar música animada)' },
      { t: 'Pode, mas baixinho.', mood: 5, reply: 'Combinado!' },
      { t: 'Prefiro viajar sem música.', mood: -8, reply: 'Oh... ok.' },
    ] },
  { id: 'm_heat', kind: 'mid', pers: any, cond: (c) => c.weather === 'limpo' && c.hour > 11 && c.hour < 19, text: 'Está tanto calor aqui dentro...',
    choices: [
      { t: 'Ligo já o ar condicionado.', mood: 7, reply: 'Ahh, muito melhor.' },
      { t: 'Quer que abra a janela?', mood: 4, reply: 'Pode ser.' },
      { t: 'Já vai passar.', mood: -7, reply: '...' },
    ] },
  { id: 'm_charger', kind: 'mid', pers: ['executivo', 'turista', 'simpatico', 'apressado', 'conversador'], w: 0.7, text: 'Tem carregador de telemóvel? Estou quase sem bateria.',
    choices: [
      { t: 'Tenho. Aqui tem um cabo USB-C.', mood: 10, reply: 'Salvou-me o dia!' },
      { t: 'Só tenho para iPhone, serve?', rnd: { p: 0.5, ok: { mood: 9, reply: 'Serve, perfeito!' }, bad: { mood: -2, reply: 'Ah, o meu é Android...' } } },
      { t: 'Não tenho, desculpe.', mood: -3 },
    ] },
  { id: 'm_sick', kind: 'mid', pers: ['festivo'], cond: (c) => c.night, text: 'Ai... acho que não estou muito bem... pode parar?',
    choices: [
      { t: 'Paro já aqui ao lado!', mood: 10, eff: { action: 'stop', stopMin: 2 }, reply: '(sai, respira fundo e volta) Obrigado... já passou.' },
      { t: 'Aguente só mais um bocadinho!', rnd: { p: 0.45, ok: { mood: 0, reply: 'Ok... ok... já passou.' }, bad: { mood: -6, eff: { clean: -45, fareAdd: 25 }, reply: '(Vomitou no carro.) Ai... desculpe!' } } },
      { t: 'Abra a janela, respire fundo!', rnd: { p: 0.7, ok: { mood: 6, reply: 'Ufa... ajudou.' }, bad: { mood: -6, eff: { clean: -30, fareAdd: 25 }, reply: '(Sujou a porta.) Desculpe!!' } } },
    ] },
  { id: 'm_cash', kind: 'mid', pers: ['rude', 'festivo', 'conversador', 'apressado'], w: 0.35, text: 'Olhe, e se eu cancelar na app e lhe pagar em dinheiro? Fica mais barato para os dois.',
    choices: [
      { t: 'Não, isso é contra as regras da plataforma.', mood: -2, eff: { rep: 2 }, reply: 'Pronto, era só uma ideia.' },
      { t: 'Prefiro não arriscar, desculpe.', mood: 0, eff: { rep: 1 } },
      { t: 'Pode ser...', mood: 6, rnd: { p: 0.65, ok: { eff: { money: 4 }, reply: '(Recebe 4 € extra em dinheiro, por fora)' }, bad: { eff: { money: -50, rep: -5 }, reply: '(A plataforma detetou a fraude: multa de 50 €)' } } },
    ] },
  { id: 'm_hospital', kind: 'mid', pers: any, cond: (c) => c.destDistrict === 'X', text: 'Estou um bocado nervoso, vou fazer uns exames...',
    choices: [
      { t: 'Vai correr tudo bem, vai ver.', mood: 12, reply: 'Obrigado, precisava de ouvir isso.' },
      { t: 'Quer que vá mais devagar?', mood: 6, reply: 'Não, está ótimo assim.' },
      { t: '(Silêncio)', mood: -2 },
    ] },
  { id: 'm_airport', kind: 'mid', pers: any, cond: (c) => c.destDistrict === 'A', text: 'Tenho o voo daqui a hora e meia. Chegamos a tempo?',
    choices: [
      { t: 'Chegamos com tempo de sobra.', mood: 8, reply: 'Ainda bem!' },
      { t: 'Vou acelerar um pouco para garantir.', mood: 10, eff: { action: 'faster' }, reply: 'Obrigado!' },
      { t: 'Depende do trânsito...', mood: -6, reply: 'Ai, não me assuste!' },
    ] },
  { id: 'm_station', kind: 'mid', pers: any, cond: (c) => c.destDistrict === 'S', text: 'Apanho o comboio para Lisboa. Dá tempo?',
    choices: [
      { t: 'Dá perfeitamente. Boa viagem!', mood: 7, reply: 'Obrigado!' },
      { t: 'Vou pelo caminho mais rápido.', mood: 6 },
    ] },
  { id: 'm_route', kind: 'mid', pers: ['exigente', 'rude'], text: 'Porque é que vai por aqui? O meu GPS diz outro caminho.',
    choices: [
      { t: 'O meu GPS tem trânsito em tempo real, este é o mais rápido.', mood: 4, reply: 'Se o diz...' },
      { t: 'Quer que vá pelo seu caminho?', mood: 8, eff: { action: 'detour' }, reply: 'Sim, obrigado.' },
      { t: 'Eu é que sei o caminho.', mood: -11, reply: 'Que arrogância...' },
    ] },
  { id: 'm_clean', kind: 'mid', pers: ['generoso', 'simpatico', 'exigente', 'executivo'], cond: (c) => c.clean > 70, text: 'O seu carro está tão limpinho! Dá gosto.',
    choices: [
      { t: 'Obrigado! Faço questão.', mood: 6, reply: 'Nota-se!' },
      { t: '(Sorrir) Obrigado!', mood: 4 },
    ] },
  { id: 'm_dirty', kind: 'mid', pers: any, cond: (c) => c.clean < 45, text: 'Hum... o carro podia estar mais limpo, não acha?',
    choices: [
      { t: 'Tem toda a razão, peço desculpa. Vou lavá-lo hoje.', mood: 3, reply: 'Está bem.' },
      { t: 'Foi o passageiro anterior...', mood: -2, reply: 'Pois...' },
      { t: 'Está bom assim.', mood: -9, reply: '...' },
    ] },
  { id: 'm_pet', kind: 'mid', pers: any, cond: (c) => c.noteTag === 'pet', text: '(O cão ladra) Desculpe, ele fica nervoso no carro.',
    choices: [
      { t: 'Não faz mal! Que cão tão giro!', mood: 12, eff: { clean: -8 }, reply: 'Ele gostou de si!' },
      { t: 'Pode segurá-lo no colo, por favor?', mood: 2, reply: 'Claro.' },
      { t: 'Os cães não deviam vir no banco.', mood: -12, reply: 'Ele está sossegado...' },
    ] },
  { id: 'm_night', kind: 'mid', pers: ['simpatico', 'calado', 'generoso', 'turista'], cond: (c) => c.night, text: 'Ainda bem que apanhei um carro, já é tarde...',
    choices: [
      { t: 'Fique tranquilo, espero até entrar em casa.', mood: 11, eff: { rep: 1 }, reply: 'Muito obrigado, a sério.' },
      { t: 'A esta hora há poucos carros, teve sorte.', mood: 4 },
    ] },
  { id: 'm_food', kind: 'mid', pers: ['festivo', 'conversador', 'apressado'], w: 0.5, text: '(O passageiro abre um hambúrguer) Importa-se?',
    choices: [
      { t: 'Prefiro que não coma no carro, desculpe.', mood: -4, reply: 'Ok, guardo para depois.' },
      { t: 'Esteja à vontade, mas cuidado com os bancos.', mood: 8, eff: { clean: -12 }, reply: 'Obrigado! Estava cheio de fome.' },
      { t: 'Só se me der uma batata!', mood: 10, eff: { clean: -10 }, reply: 'Ahah, tome lá!' },
    ] },
  { id: 'm_quiet_ok', kind: 'mid', pers: ['calado'], text: '(O passageiro olha pela janela em silêncio)', sys: true,
    choices: [
      { t: '(Respeitar o silêncio)', mood: 6 },
      { t: 'Quer que ponha uma música calma?', rnd: { p: 0.5, ok: { mood: 6, reply: 'Pode ser, obrigado.' }, bad: { mood: -4, reply: 'Não, obrigado.' } } },
      { t: 'Então, vai trabalhar ou vai para casa?', mood: -6, reply: 'Hm.' },
    ] },
  { id: 'm_tip_tease', kind: 'mid', pers: ['generoso'], text: 'Gosto de motoristas que sabem o que fazem. Vou deixar gorjeta!',
    choices: [
      { t: 'Muito obrigado, é muito simpático!', mood: 6, eff: { tip: 1 } },
      { t: 'Não é preciso, mas agradeço.', mood: 8, eff: { tip: 1.5 } },
    ] },

  // ---------- SITUAÇÕES NA ESTRADA ----------
  { id: 'e_block', kind: 'event', pers: any, sys: true, text: '⚠️ Estrada cortada mais à frente (obras).',
    choices: [
      { t: 'Desviar pelo caminho alternativo', mood: 0, eff: { action: 'detour' } },
      { t: 'Esperar que abram (≈5 min)', mood: -8, eff: { action: 'stop', stopMin: 5, inLane: true } },
    ] },
  { id: 'e_accident', kind: 'event', pers: any, sys: true, text: '🚧 Acidente na via. O trânsito está parado.',
    choices: [
      { t: 'Recalcular a rota', mood: 2, eff: { action: 'detour' } },
      { t: 'Aguardar (≈6 min)', mood: -10, eff: { action: 'stop', stopMin: 6, inLane: true } },
    ] },
  { id: 'e_ambulance', kind: 'event', pers: any, sys: true, text: '🚑 Ambulância em marcha de emergência atrás de si!',
    choices: [
      { t: 'Encostar e deixar passar', mood: 4, eff: { action: 'stop', stopMin: 1, rep: 1 } },
      { t: 'Continuar', mood: -6, rnd: { p: 0.6, ok: { reply: 'A ambulância conseguiu passar por outro lado.' }, bad: { eff: { money: -60 }, reply: '👮 Multa de 60 € por não ceder passagem.' } } },
    ] },
  { id: 'e_ped', kind: 'event', pers: any, sys: true, text: '🚶 Um peão atravessa de repente fora da passadeira!',
    choices: [
      { t: 'Travar a fundo', mood: -2, eff: { action: 'hardBrake' }, reply: 'Uff! Foi por pouco...' },
      { t: 'Buzinar e abrandar', mood: -4, eff: { action: 'hardBrake', horn: true } },
    ] },
  { id: 'e_flat', kind: 'event', pers: any, sys: true, w: 0.4, text: '💥 Pneu furado!',
    choices: [
      { t: 'Trocar o pneu (≈15 min; desconto de 3 € ao passageiro)', mood: -10, eff: { action: 'stop', stopMin: 15, fareAdd: -3, money: -25 } },
      { t: 'Chamar a assistência (≈25 min, 40 €)', mood: -16, eff: { action: 'stop', stopMin: 25, money: -40 } },
      { t: 'Continuar devagar até ao destino', mood: -6, eff: { action: 'slow', condition: -15 } },
    ] },
  { id: 'e_police', kind: 'event', pers: any, sys: true, w: 0.5, text: '🚓 Operação STOP da polícia. Mandam-no encostar.',
    choices: [
      { t: 'Encostar e apresentar os documentos', mood: -4, eff: { action: 'stop', stopMin: 4, police: true } },
    ] },
];

export const FAREWELLS = {
  good: ['Muito obrigado! Bom trabalho!', 'Excelente viagem, obrigado!', 'Obrigado, tenha um ótimo dia!', 'Perfeito, até à próxima!'],
  ok: ['Obrigado.', 'Pronto, obrigado.', 'Até logo.'],
  bad: ['Finalmente...', 'Hmpf.', 'Já não era sem tempo.'],
};
