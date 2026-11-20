'use strict';
/* =====================================================================
   LiveVerse — dados de referência (jogos, modos, reações, conquistas)
   Tudo o que é audiência, seguidores e métricas é SIMULADO/FICTÍCIO.
   ===================================================================== */

const GAMES = {
  fortnite:  { name: 'Fortnite',          genre: 'br',      color: '#8b5cf6', glyph: 'FN' },
  minecraft: { name: 'Minecraft',         genre: 'sandbox', color: '#2fb86a', glyph: 'MC' },
  valorant:  { name: 'Valorant',          genre: 'fps',     color: '#ff4d6d', glyph: 'VL' },
  eafc:      { name: 'EA Sports FC',      genre: 'sports',  color: '#22c3a6', glyph: 'FC' },
  gta6:      { name: 'GTA VI',            genre: 'open',    color: '#ff5a8a', glyph: 'VI' },
  gta:       { name: 'GTA V',             genre: 'open',    color: '#f59e0b', glyph: 'GTA' },
  roblox:    { name: 'Roblox',            genre: 'sandbox', color: '#ef4444', glyph: 'RB' },
  phasmo:    { name: 'Phasmophobia',      genre: 'horror',  color: '#64748b', glyph: 'PH' },
  lol:       { name: 'League of Legends', genre: 'moba',    color: '#3b82f6', glyph: 'LoL' },
  rocket:    { name: 'Rocket League',     genre: 'sports',  color: '#0ea5e9', glyph: 'RL' },
  amnesia:   { name: 'Jogo de terror',    genre: 'horror',  color: '#7f1d1d', glyph: '👻' },
  chat:      { name: 'Conversa',          genre: 'chat',    color: '#ec4899', glyph: '💬' },
};

const MODES = {
  casual:     { name: 'Casual',     hype: 0.85 },
  competitivo:{ name: 'Competitivo',hype: 1.0 },
  torneio:    { name: 'Torneio',    hype: 1.15 },
  maratona:   { name: 'Maratona',   hype: 0.95 },
  chill:      { name: 'Chill',      hype: 0.75 },
  superstar:  { name: 'SUPERSTAR',  hype: 1.3 },
};

const LEVELS = {
  pequena:  { name: 'Pequena',  max: 1000 },
  media:    { name: 'Média',    max: 10000 },
  grande:   { name: 'Grande',   max: 50000 },
  enorme:   { name: 'Enorme',   max: 100000 },
  lendaria: { name: 'Lendária', max: 1000000 },
};

const CATEGORIES = ['Gaming', 'Battle Royale', 'FPS competitivo', 'Terror', 'Desporto', 'Variedades', 'Speedrun', 'Conversa & Comunidade'];

const COVERS = [
  'radial-gradient(circle at 20% 30%, #ff4fa8 0, transparent 45%), radial-gradient(circle at 80% 20%, #4d8dff 0, transparent 45%), linear-gradient(135deg, #2a0f5c, #0b0820)',
  'radial-gradient(circle at 75% 35%, #9b6bff 0, transparent 50%), radial-gradient(circle at 15% 80%, #ff3b5c 0, transparent 40%), linear-gradient(160deg, #1a0b3d, #06050f)',
  'radial-gradient(circle at 50% 120%, #4d8dff 0, transparent 60%), radial-gradient(circle at 10% 10%, #22d3ee 0, transparent 35%), linear-gradient(180deg, #0b1440, #05060f)',
  'conic-gradient(from 210deg at 70% 40%, #ff4fa8, #9b6bff, #4d8dff, #ff4fa8)',
  'radial-gradient(circle at 30% 50%, #ffc24b 0, transparent 40%), radial-gradient(circle at 80% 60%, #ff4fa8 0, transparent 45%), linear-gradient(135deg, #3a0d2b, #0c0716)',
  'radial-gradient(circle at 60% 40%, #3ee0a1 0, transparent 40%), radial-gradient(circle at 20% 80%, #4d8dff 0, transparent 45%), linear-gradient(135deg, #052e2b, #060a12)',
];

const GIFTS = [
  { name: 'Estrela',   icon: '⭐', value: 1,   w: 50 },
  { name: 'Coração',   icon: '💜', value: 5,   w: 28 },
  { name: 'Foguetão',  icon: '🚀', value: 50,  w: 12 },
  { name: 'Coroa',     icon: '👑', value: 200, w: 6 },
  { name: 'Diamante',  icon: '💎', value: 500, w: 3 },
  { name: 'Galáxia',   icon: '🌌', value: 2000, w: 1 },
];

/* ---------- Reações: categorias e acontecimentos ---------- */
const REACT_CATS = [
  { id: 'vitoria', name: 'Vitória', icon: '🏆', items: [
    ['win_match', 'Ganhei uma partida'], ['win_tourn', 'Ganhei um torneio'], ['goal', 'Alcancei um objetivo'],
    ['perfect', 'Fiz uma jogada perfeita'], ['legend', 'Vitória lendária']] },
  { id: 'emoc', name: 'Momentos emocionantes', icon: '🔥', items: [
    ['amazing', 'Jogada incrível'], ['clutch', 'Clutch'], ['combo', 'Combo incrível'], ['rare', 'Encontrei um item raro'],
    ['big', 'Grande conquista'], ['surprise', 'Sucesso inesperado']] },
  { id: 'funny', name: 'Momentos engraçados', icon: '😂', items: [
    ['fail_funny', 'Falhanço engraçado'], ['unexpected', 'Momento inesperado'], ['bug', 'Bug estranho'],
    ['oops', 'Erro divertido'], ['funny_react', 'Reação engraçada']] },
  { id: 'sad', name: 'Desilusão', icon: '💀', items: [
    ['lose', 'Perdi a partida'], ['miss', 'Falhei uma oportunidade'], ['fail_chal', 'Falhei um desafio'],
    ['badluck', 'Má sorte'], ['upset', 'Derrota inesperada']] },
  { id: 'horror', name: 'Terror e suspense', icon: '😱', items: [
    ['jumpscare', 'Jump scare'], ['enemy', 'Inimigo inesperado'], ['scary', 'Momento assustador'],
    ['suspense', 'Suspense'], ['escape', 'Escape por pouco']] },
];

// moods: pools de mensagens; hype: impulso de audiência (0–1); fol: gera seguidores; viral: probabilidade de momento viral
const REACT_ITEMS = {
  win_match:  { moods: ['win'], hype: .5, fol: true, viral: .15, emoji: '🏆', fx: 'VITÓRIA!' },
  win_tourn:  { moods: ['tourn', 'win'], hype: .8, fol: true, viral: .5, emoji: '🏆', fx: 'CAMPEÃO!' },
  goal:       { moods: ['goal'], hype: .35, fol: true, viral: .1, emoji: '🎯', fx: 'OBJETIVO!' },
  perfect:    { moods: ['amazing'], hype: .5, fol: true, viral: .25, emoji: '✨', fx: 'PERFEITO!' },
  legend:     { moods: ['legend', 'win'], hype: .95, fol: true, viral: .75, emoji: '👑', fx: 'LENDÁRIO!' },
  amazing:    { moods: ['amazing'], hype: .45, fol: true, viral: .2, emoji: '🔥', fx: 'INCRÍVEL!' },
  clutch:     { moods: ['clutch'], hype: .7, fol: true, viral: .4, emoji: '🎯', fx: 'CLUTCH!' },
  combo:      { moods: ['combo', 'amazing'], hype: .4, fol: true, viral: .15, emoji: '⚡', fx: 'COMBO!' },
  rare:       { moods: ['rare'], hype: .5, fol: true, viral: .25, emoji: '💎', fx: 'ITEM RARO!' },
  big:        { moods: ['big'], hype: .6, fol: true, viral: .3, emoji: '⚡', fx: 'GRANDE MOMENTO!' },
  surprise:   { moods: ['surprise'], hype: .35, fol: true, viral: .15, emoji: '😳', fx: 'INESPERADO!' },
  fail_funny: { moods: ['funny'], hype: .4, fol: true, viral: .3, emoji: '😂', fx: 'HAHAHA' },
  unexpected: { moods: ['surprise', 'funny'], hype: .3, fol: false, viral: .15, emoji: '🤯', fx: 'O QUÊ?!' },
  bug:        { moods: ['bug', 'funny'], hype: .35, fol: false, viral: .3, emoji: '🐛', fx: 'BUG!' },
  oops:       { moods: ['funny'], hype: .3, fol: false, viral: .15, emoji: '🙈', fx: 'OOPS!' },
  funny_react:{ moods: ['funny'], hype: .35, fol: true, viral: .25, emoji: '😂', fx: 'HAHAHA' },
  lose:       { moods: ['sad'], hype: .08, fol: false, viral: 0, emoji: '💀', fx: 'DERROTA' },
  miss:       { moods: ['sad'], hype: .06, fol: false, viral: 0, emoji: '💀', fx: 'FALHOU...' },
  fail_chal:  { moods: ['sad'], hype: .06, fol: false, viral: 0, emoji: '💀', fx: 'DESAFIO FALHADO' },
  badluck:    { moods: ['badluck', 'sad'], hype: .1, fol: false, viral: .05, emoji: '🍀', fx: 'QUE AZAR' },
  upset:      { moods: ['upset', 'sad'], hype: .12, fol: false, viral: .05, emoji: '😵', fx: 'NÃO PODE!' },
  jumpscare:  { moods: ['scary'], hype: .45, fol: true, viral: .35, emoji: '😱', fx: 'JUMP SCARE!' },
  enemy:      { moods: ['enemy', 'scary'], hype: .35, fol: false, viral: .15, emoji: '👹', fx: 'ATRÁS DE TI!' },
  scary:      { moods: ['scary'], hype: .4, fol: true, viral: .2, emoji: '😱', fx: 'QUE SUSTO!' },
  suspense:   { moods: ['suspense'], hype: .25, fol: false, viral: .05, emoji: '🕯️', fx: 'SUSPENSE...' },
  escape:     { moods: ['escape', 'scary'], hype: .4, fol: true, viral: .2, emoji: '🏃', fx: 'ESCAPOU!' },
};
const REACT_LABEL = Object.fromEntries(REACT_CATS.flatMap(c => c.items));

const PANEL_BUTTONS = [
  ['win_match', '🏆', 'Vitória'], ['amazing', '🔥', 'Jogada incrível'], ['funny_react', '😂', 'Momento engraçado'],
  ['scary', '😱', 'Momento assustador'], ['miss', '💀', 'Falhei'], ['clutch', '🎯', 'Clutch'],
  ['rare', '💎', 'Item raro'], ['big', '⚡', 'Grande momento'], ['custom', '✍️', 'Acontecimento personalizado'],
];

const MOOD_POOLS = {
  win: ['GGGGG 🏆', 'VITÓRIA!!!', 'QUE MÁQUINA', 'ISTO É QUE É JOGAR', 'GG WP', 'ELE NÃO PERDOA', 'CAMPEÃO 👑', 'OS HATERS FICARAM CALADOS', 'VITÓRIA MERECIDA', 'CHAT EM FESTA 🎉', 'LETS GOOOOO', 'MAIS UMA PARA A COLEÇÃO'],
  tourn: ['CAMPEÃO DO TORNEIO 🏆', 'TAÇA PARA CASA', 'QUE TORNEIO INSANO', 'MERECIDÍSSIMO', 'O MELHOR DO TORNEIO SEM DÚVIDA'],
  legend: ['VITÓRIA LENDÁRIA 😭', 'ISTO VAI PARA A HISTÓRIA', 'EU ESTAVA AQUI QUANDO ACONTECEU', 'LENDA LENDA LENDA', 'NINGUÉM ACREDITA NISTO', 'FAÇAM CLIP AGORA', 'ARREPIEI-ME TODO'],
  goal: ['OBJETIVO CUMPRIDO ✅', 'CONSEGUIU!!', 'FINALMENTE', 'DISSE QUE IA CONSEGUIR E CONSEGUIU', 'META ALCANÇADA 💜'],
  amazing: ['QUE JOGADA 🔥', 'ISTO FOI PERFEITO', 'NÃO HÁ PALAVRAS', 'MECÂNICAS DE OUTRO MUNDO', 'REPLAY REPLAY', 'MANO??? 🔥🔥', 'ISTO NÃO É NORMAL', 'TALENTO PURO'],
  clutch: ['NÃO ACREDITO NESTE CLUTCH 😭', 'CLUTCH KING 👑', 'O CORAÇÃO NÃO AGUENTA', 'CHAT ISTO ESTÁ INSANO', 'FAÇAM CLIP AGORA', 'ELE CONSEGUIU!!', 'SANGUE FRIO TOTAL 🧊', '{viewers} A ASSISTIR A ISTO'],
  combo: ['COMBO INSANO', 'QUE SEQUÊNCIA', 'NEM PESTANEJOU', 'ISTO É ARTE', 'COMBO COMBO COMBO'],
  rare: ['MANO ENCONTROU!', 'ISTO É MESMO RARO', 'NÃO ACREDITO', 'QUE SORTE ABSURDA 🍀', 'GUARDA BEM ISSO', 'EU PROCUREI ISSO DURANTE MESES 😭', '💎💎💎'],
  big: ['GRANDE MOMENTO ⚡', 'HISTÓRICO', 'ISTO MERECE UM CLIP', 'CHAT DE PÉ 👏', 'QUE CONQUISTA', 'MOMENTO DO ANO'],
  surprise: ['COMO??? 😂', 'NINGUÉM ESPERAVA', 'SORTE OU TALENTO?', 'ISTO FOI INESPERADO', 'ESPERA, O QUÊ?'],
  funny: ['HAHAHAHAHAHA', 'ESTOU A GUARDAR ESTE CLIP', 'MANO O QUE FOI ISTO?', 'MELHOR MOMENTO DA LIVE', '😂😂😂😂', 'CHOREI A RIR', 'ISTO VAI PARA O COMPILADO', 'NÃO CONSIGO PARAR DE RIR'],
  bug: ['O JOGO PARTIU-SE 😂', 'BUG LENDÁRIO', 'ISTO É UMA FEATURE', 'A FÍSICA DESISTIU', 'REPORTEM ISTO AOS DEVS 😭'],
  sad: ['NÃÃÃO 😭', 'FOI POR POUCO', 'PRÓXIMA É NOSSA', 'CABEÇA ERGUIDA 💜', 'F', 'O CHAT ESTÁ CONTIGO', 'AINDA ACREDITAMOS', 'ACONTECE AOS MELHORES'],
  badluck: ['QUE AZAR 💀', 'O RNG ODEIA-TE', 'NÃO É POSSÍVEL', 'DESTINO CRUEL'],
  upset: ['COMO É QUE PERDEU ISSO?', 'CHOCADO 😳', 'NINGUÉM ESPERAVA ESSA', 'ROUBADO 😤'],
  scary: ['EU SALTEI 😭', 'VIRA-TE!', 'O CHAT NÃO ESTÁ PREPARADO', 'QUE SUSTO', 'FECHEI OS OLHOS', 'NÃO VOU DORMIR HOJE', '😱😱😱', 'CORRE CORRE CORRE'],
  suspense: ['NÃO ABRAS ESSA PORTA', 'OUVI ALGUMA COISA', 'O SILÊNCIO ASSUSTA MAIS', 'ESTOU A SUAR', 'CUIDADO...'],
  escape: ['SAFOU-SE POR UM PIXEL', 'QUASE QUASE', 'O CORAÇÃO A MIL 💓', 'FUGA LENDÁRIA'],
  enemy: ['DE ONDE VEIO ESSE??', 'ATRÁS DE TI!', 'EMBOSCADA 😳', 'OLHA À ESQUERDA!!'],
};

// Reações específicas do jogo (jogo:mood) e do género (g:género:mood)
const GAME_POOLS = {
  'fortnite:clutch': ['NÃO ACREDITO NESTE CLUTCH 😭', 'ELE CONSEGUIU GANHAR!', 'CHAT ISTO ESTÁ INSANO', 'FAÇAM CLIP AGORA', '{viewers} A ASSISTIR A ISTO', 'QUE BUILD FIGHT 🧱', 'EDITS DE OUTRO NÍVEL'],
  'fortnite:win': ['VICTORY ROYALE 👑', '#1 #1 #1', 'DANCINHA DA VITÓRIA 🕺', 'CROWN CONQUISTADA', 'ÚLTIMO DE PÉ!!'],
  'fortnite:rare': ['MÍTICA!!! 💎', 'LOOT DOURADO', 'ARMA MÍTICA NO INÍCIO?!'],
  'fortnite:amazing': ['QUE BUILD 🧱', 'NO SCOPE?!', 'EDIT LIMPÍSSIMO'],
  'minecraft:rare': ['MANO ENCONTROU!', 'ISTO É MESMO RARO', 'NÃO ACREDITO', 'QUE SORTE ABSURDA', 'DIAMANTES 💎💎', 'SPEEDRUN DE SORTE'],
  'minecraft:enemy': ['CREEPER ATRÁS DE TI 💥', 'SSSSSS', 'O ENDERMAN OLHOU-TE 👀'],
  'minecraft:scary': ['CREEPER!!! 💥', 'SSSSSS', 'FOGE PARA A BASE'],
  'minecraft:funny': ['CAIU NA LAVA 😂', 'RIP INVENTÁRIO', 'O PORCO GANHOU 🐷'],
  'valorant:clutch': ['ACE?? 😳', '1v4 CLUTCH DE SONHO', 'DEFUSE NO ÚLTIMO SEGUNDO', 'HEADSHOTS LIMPINHOS', 'O SPIKE NÃO EXPLODIU 😭'],
  'valorant:amazing': ['ONE TAP 🎯', 'QUE FLICK', 'MIRA DE OUTRO PLANETA'],
  'eafc:win': ['GOLOOOOO ⚽', 'CAMPEÕES!!', 'TIKI-TAKA', 'GOLO AOS 90 😭'],
  'eafc:amazing': ['QUE GOLAÇO', 'BICICLETA?!', 'DRIBLE DE CRAQUE', 'ROSCA PERFEITA'],
  'rocket:amazing': ['AÉREO PERFEITO 🚗💨', 'FLIP RESET?!', 'QUE DEFESA'],
  'gta:funny': ['A POLÍCIA NÃO DESISTE 😂', 'CONDUÇÃO DE CAMPEÃO', 'ISTO SÓ NO GTA'],
  'gta6:funny': ['A POLÍCIA NÃO DESISTE 😂', 'ISTO SÓ NO GTA 6', 'CONDUÇÃO DE CAMPEÃO 🚗💥', 'O CROCODILO GANHOU 🐊😂', 'CAIU DO BARCO HAHAHA', 'O NPC FICOU CHOCADO 😂'],
  'gta6:win': ['GOLPE PERFEITO 💰', 'MISSÃO CUMPRIDA ✅', 'FUGIRAM COM O DINHEIRO TODO', 'VICE CITY É NOSSA 🌴', 'QUE ASSALTO LIMPO'],
  'gta6:amazing': ['QUE CONDUÇÃO 🏎️', 'FUGA DE FILME', 'QUE MANOBRA', 'SALTO INSANO DA PONTE', 'PERSEGUIÇÃO ÉPICA 🚓'],
  'gta6:clutch': ['ESCAPOU COM 5 ESTRELAS ⭐⭐⭐⭐⭐', 'NÃO ACREDITO QUE FUGIU', 'CLUTCH NA PERSEGUIÇÃO 😭', 'O HELICÓPTERO PERDEU-TE 🚁'],
  'gta6:rare': ['CARRO RARÍSSIMO 😳', 'ENCONTROU O SEGREDO!', 'EASTER EGG?!', 'QUE SORTE NESSE CARRO 💎'],
  'gta6:big': ['GRANDE GOLPE ⚡', 'MOMENTO HISTÓRICO NO GTA 6', 'CHAT DE PÉ 👏', 'ISTO VAI PARA OS CLIPS'],
  'gta6:sad': ['WASTED 💀', 'A POLÍCIA APANHOU-TE 😭', 'TÃO PERTO DO ESCONDERIJO', 'BUSTED 🚓'],
  'gta6:enemy': ['A POLÍCIA ESTÁ ATRÁS DE TI 🚓', 'EMBOSCADA NO BECO', 'OLHA O HELICÓPTERO 🚁'],
  'gta6:scary': ['ESSE SUSTO 😱', 'DE ONDE VEIO ESSE CARRO?!', 'QUASE ATROPELADO 😭'],
  'gta6:escape': ['FUGIU POR UM TRIZ 🏃', 'DESPISTOU A POLÍCIA', 'ESCONDERIJO ALCANÇADO ✅'],
  'lol:clutch': ['PENTAKILL?!?!', 'BARON STEAL 😭', '1v5 NA BASE'],
  'lol:win': ['NEXUS ABAIXO 🏆', 'VITÓRIA ÉPICA'],
  'roblox:funny': ['O AVATAR 😂', 'OBBY DO TERROR'],
  'g:horror:scary': ['EU SALTEI 😭', 'VIRA-TE!', 'O CHAT NÃO ESTÁ PREPARADO', 'QUE SUSTO', 'O FANTASMA ESTÁ AÍ 👻', 'ACENDE A LANTERNA', 'NÃO OLHES PARA TRÁS'],
  'g:horror:suspense': ['ESTÁ DEMASIADO SILENCIOSO', 'OUVISTE AQUILO?', 'A PORTA MEXEU-SE 🚪'],
  'g:horror:funny': ['GRITOU MAIS QUE O FANTASMA 😂', 'O FANTASMA FICOU COM MEDO DE TI'],
  'g:sports:win': ['GOLOOOO ⚽', 'CAMPEÕES!!'],
};

const AMBIENT = [
  'boas!!', 'primeira vez aqui 👋', 'que live top', 'salve do Porto', 'olá de Braga 💜', 'boa noite chat', 'que setup bonito',
  '{game} é o melhor jogo', 'LETS GOOOO', 'bora bora', 'acabei de chegar, o que perdi?', 'segue-me de volta? 🙏',
  'vim do TikTok', 'a música está top', '🔥🔥🔥', '💜💜', 'KEKW', 'GG', 'qual é a sensibilidade?', 'joga com a malta!',
  'salve de Lisboa', 'quem está a ver às escondidas nas aulas? 😂', 'live diária?', 'o chat está on fire', 'mano és o maior',
  'quero chegar aos {goal} hoje!', 'partilhem a live!', 'Algarve presente ☀️', 'Açores na casa 🌋', 'saudades destas lives',
];
const MODE_AMBIENT = {
  superstar: ['MODO SUPERSTAR ATIVADO ⭐', 'vamos aos {goal}!!', 'isto vai bater recordes', 'SUPERSTAR SUPERSTAR'],
  torneio: ['força no torneio!', 'é desta que ganhamos', 'quem é o próximo adversário?'],
  maratona: ['quantas horas vai durar?', 'maratona!! trouxe pipocas 🍿'],
  chill: ['que live relaxante', 'vibe tranquila hoje', 'boa para estudar'],
  competitivo: ['modo tryhard ON', 'foco total hoje'],
  casual: ['live descontraída 😎'],
};

const NAME_A = ['pixel', 'nova', 'turbo', 'luso', 'zeca', 'rita', 'sombra', 'neon', 'leo', 'bia', 'kiko', 'mafs', 'duda', 'tuga', 'lobo', 'rafa', 'inês', 'joka', 'beta', 'gamer', 'nico', 'miga', 'vasco', 'sara', 'tomás', 'lara'];
const NAME_B = ['_pt', 'play', 'gg', '07', 'xd', 'king', 'queen', '_yt', 'zz', '99', 'tv', 'lol', '_02', 'x', 'pro', 'fan', 'lusa', '360', '_br', 'fire'];
const NAME_COLORS = ['#ff7ab8', '#9b8cff', '#6fb6ff', '#3ee0a1', '#ffc24b', '#ff8a5c', '#c084fc', '#5eead4', '#f472b6', '#93c5fd'];

const ACHIEVEMENTS = [
  { id: 'first_post',  icon: '✍️', name: 'Primeira publicação', desc: 'Publica algo no feed.' },
  { id: 'pinned',      icon: '📌', name: 'Em destaque', desc: 'Fixa uma publicação no perfil.' },
  { id: 'first_event', icon: '📅', name: 'Agenda cheia', desc: 'Agenda o teu primeiro evento.' },
  { id: 'event_1k',    icon: '🔔', name: 'Mil interessados', desc: '1.000 utilizadores fictícios interessados num evento.' },
  { id: 'first_live',  icon: '🎥', name: 'Em direto!', desc: 'Faz a tua primeira live simulada.' },
  { id: 'live_1k',     icon: '👀', name: 'Casa cheia', desc: '1.000 espectadores virtuais numa live.' },
  { id: 'live_10k',    icon: '🚀', name: 'Descolagem', desc: '10.000 espectadores virtuais numa live.' },
  { id: 'live_100k',   icon: '⭐', name: 'Superstar', desc: '100.000 espectadores virtuais numa live.' },
  { id: 'reactions_25',icon: '⚡', name: 'Narrador', desc: 'Usa 25 reações ao jogo.' },
  { id: 'viral',       icon: '🌪️', name: 'Viral', desc: 'Tem um momento viral numa live.' },
  { id: 'raid',        icon: '🛡️', name: 'Raid recebida', desc: 'Recebe uma raid fictícia.' },
  { id: 'poll',        icon: '📊', name: 'O chat decide', desc: 'Faz uma sondagem.' },
  { id: 'first_clip',  icon: '🎬', name: 'Realizador', desc: 'Cria o teu primeiro clip.' },
  { id: 'clips_10',    icon: '🎞️', name: 'Coleção de clips', desc: 'Cria 10 clips.' },
  { id: 'gifts_10k',   icon: '💎', name: 'Chuva de presentes', desc: '10.000 moedas virtuais numa live.' },
  { id: 'followers_25k', icon: '💜', name: 'Comunidade forte', desc: '25.000 seguidores fictícios.' },
];

const CAREER = [
  [0, 'Novato'], [300, 'Emergente'], [900, 'Em ascensão'], [2000, 'Parceiro'], [4500, 'Estrela'], [9000, 'Superstar'], [18000, 'Lenda'],
];

const POST_TYPES = [
  ['text', '✍️', 'Texto'], ['game', '🎮', 'Jogo'], ['live', '🔴', 'Live'], ['event', '📅', 'Evento'],
  ['poll', '📊', 'Sondagem'], ['achievement', '🏆', 'Conquista'], ['photo', '🖼️', 'Foto'], ['clip', '🎬', 'Clip'],
];

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DAYS_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const OTHER_POST_LINES = [
  ['Hoje há live até tarde! Quem alinha? #{g} #LiveVerse', 'live'],
  ['Novo recorde pessoal no {G} 😮‍💨 #{g}', 'game'],
  ['Qual é o vosso jogo favorito para lives de fim de semana?', 'text'],
  ['Obrigado pelos {n} seguidores fictícios!! 💜 #comunidade', 'text'],
  ['Clip da live de ontem, ainda não acredito 😂 #{g} #clips', 'text'],
  ['Setup novo a chegar esta semana 👀', 'text'],
  ['Quem quer fazer squad comigo amanhã? #{g}', 'game'],
  ['Hoje a live é só conversa e Q&A ☕ #conversa', 'text'],
];

const GTA6_AMBIENT = ['GTA 6 FINALMENTE 😭', 'Vice City está linda 🌴', 'faz um assalto!!', 'vai à praia 🏖️', 'rouba aquele carro', 'quantas estrelas já tens? ⭐', 'o mapa é gigante', 'joga com a Lucia!', 'bora fazer missões', 'que gráficos 😳', 'pega num barco 🚤', 'vai ao pântano 🐊'];
