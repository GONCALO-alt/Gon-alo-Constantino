'use strict';
/* Pit Box · Dados do jogo: categorias, dificuldades, equipas, circuitos, cosméticos */
/* ---------------- DADOS ---------------- */
const CATS={
  F4:{id:'F4',name:'Fórmula 4',wheels:2,gun:1.25,par:15,car:'f4',laps:18,unlockLvl:1,payout:.6,order:0,
      crew:'Equipa pequena: trocas as duas rodas do lado esquerdo com uma pistola mais lenta.'},
  F3:{id:'F3',name:'Fórmula 3',wheels:1,gun:1.0,par:7.6,car:'f3',laps:22,unlockLvl:2,payout:.8,order:1,
      crew:'És o pistoleiro: desapertas e apertas a porca. Dois colegas tiram e põem a roda.',role:'gun'},
  GT3:{id:'GT3',name:'GT3',wheels:2,gun:.9,par:15,car:'gt3',laps:40,unlockLvl:3,payout:1,order:2,refuel:10,
      crew:'Trocas as duas rodas do lado esquerdo enquanto o carro reabastece.'},
  F2:{id:'F2',name:'Fórmula 2',wheels:1,gun:.82,par:6.6,car:'f2',laps:30,unlockLvl:4,payout:1.2,order:3,
      crew:'Pistoleiro numa paragem obrigatória. Pistola rápida, pouca margem para erros.',role:'gun'},
  F1:{id:'F1',name:'Fórmula 1',wheels:1,gun:.6,par:5.6,car:'f1',laps:57,unlockLvl:6,payout:1.8,order:4,
      crew:'Pistoleiro numa equipa de 20 mecânicos. Só desapertas e apertas, cada décima conta.',role:'gun'}
};
const CAT_PATH=['F4','F3','F2','F1'];
const DIFF={
  easy:{name:'Fácil',par:1.35,arrive:9,window:16.5,pen:1,prob:.45,maxEv:1,pool:['misalign'],explicitSwitch:true,aids:3,fitW:.3,fitSpd:2.2,tq:[.6,.95],tqRate:.9,slow:2.8,mult:.8,col:'#22d36b',
        note:'Mais tempo, poucos imprevistos e indicações em todos os passos. Ideal para aprender.'},
  medium:{name:'Médio',par:1,arrive:7,window:13,pen:1.3,prob:.75,maxEv:2,pool:['wrongdir','misalign','crewdelay','blanket'],explicitSwitch:false,aids:2,fitW:.2,fitSpd:3,tq:[.73,.92],tqRate:1.1,slow:2,mult:1,col:'#ffc61a',
        note:'Tempo exigente e mais imprevistos. Ninguém te lembra de mudar o sentido da pistola.'},
  hard:{name:'Difícil',par:.82,arrive:5.5,window:10.5,pen:1.7,prob:1,maxEv:3,pool:['wrongdir','misalign','crewdelay','blanket','overshoot','debris','radio'],explicitSwitch:false,aids:1,fitW:.13,fitSpd:3.8,tq:[.8,.9],tqRate:1.3,slow:1.4,mult:1.3,col:'#ff3030',
        note:'Pouco tempo, vários imprevistos por paragem, carro fora da marca e erros a custar o dobro.'},
  pro:{name:'Profissional',par:.75,arrive:5,window:9.5,pen:2,prob:1,maxEv:3,pool:['wrongdir','misalign','crewdelay','blanket','overshoot','debris','radio'],explicitSwitch:false,aids:0,fitW:.12,fitSpd:4.2,tq:[.82,.89],tqRate:1.4,slow:1.2,mult:1.6,col:'#b06cff',
        note:'Sem ajudas: sem textos de passo, sem zonas verdes nem destaques. Só tu, a pistola e o rádio.'}
};
const EVENTS={
  jam:'Pistola encravada',stuck:'Porca presa',wrongdir:'Pistola no sentido errado',misalign:'Roda desalinhada',
  crewdelay:'Problema na traseira direita',blanket:'Manta térmica presa',overshoot:'Carro passou da marca',debris:'Detritos no cubo',
  pressure:'Pressão de ar fora do alvo',leak:'Fuga de ar na mangueira',radio:'Falha de comunicação no rádio',strategy:'Mudança de pneus à última hora'
};
const COMPOUND={soft:{name:'Macios',c:0xe10600},medium:{name:'Médios',c:0xffd400},hard:{name:'Duros',c:0xf4f4f4},inter:{name:'Intermédios',c:0x2bb24c},wet:{name:'Chuva',c:0x1f7ae0}};
const TEAMS=[
  // Fórmula 4
  {id:'f4_bairro',cat:'F4',tier:1,name:'Garagem do Bairro Racing',c1:0x2d6a4f,c2:0xf1faee},
  {id:'f4_lisboa',cat:'F4',tier:2,name:'Escola Kart Lisboa',c1:0x1d3557,c2:0xe63946},
  {id:'f4_iberia',cat:'F4',tier:3,name:'Iberia Junior Team',c1:0xffb703,c2:0x023047},
  {id:'f4_primo',cat:'F4',tier:4,name:'Primo F4',c1:0xd62828,c2:0xffffff},
  // Fórmula 3
  {id:'f3_valley',cat:'F3',tier:1,name:'Alpine Valley Junior',c1:0x6c757d,c2:0x00b4d8},
  {id:'f3_hitech',cat:'F3',tier:2,name:'Hi-Volt Junior',c1:0x111111,c2:0xc0c0c0},
  {id:'f3_azure',cat:'F3',tier:3,name:'Azure Trident',c1:0x0077b6,c2:0xffffff},
  {id:'f3_primo',cat:'F3',tier:4,name:'Primo Racing Junior',c1:0xc1121f,c2:0xfdf0d5},
  // Fórmula 2
  {id:'f2_lusa',cat:'F2',tier:1,name:'Lusitânia Racing',c1:0x006400,c2:0xd00000},
  {id:'f2_arte',cat:'F2',tier:2,name:'Arte Grand Prix',c1:0x222222,c2:0xff4d6d},
  {id:'f2_virtuosi',cat:'F2',tier:3,name:'Virtuosi Corse',c1:0x003566,c2:0xffc300},
  {id:'f2_primo',cat:'F2',tier:4,name:'Primo Racing',c1:0xb00020,c2:0xffffff},
  // Fórmula 1 (versões fictícias inspiradas em equipas reais)
  {id:'f1_grove',cat:'F1',tier:1,name:'Grove Blue Racing',c1:0x0a3d91,c2:0x00a3e0},
  {id:'f1_stars',cat:'F1',tier:1,name:'Stars & Stripes F1',c1:0xb6babd,c2:0xd0021b},
  {id:'f1_enstone',cat:'F1',tier:2,name:'Enstone Bleu',c1:0x0b6bcb,c2:0xff87bc},
  {id:'f1_emerald',cat:'F1',tier:3,name:'Emerald Silverstone',c1:0x0f5c45,c2:0xcedc00},
  {id:'f1_papaya',cat:'F1',tier:4,name:'Papaya Racing (Woking)',c1:0xff8000,c2:0x0d1b2a},
  {id:'f1_silver',cat:'F1',tier:4,name:'Silver Arrows Brackley',c1:0x9aa3ad,c2:0x00d2be},
  {id:'f1_bull',cat:'F1',tier:5,name:'Bull Energy Racing',c1:0x1b2a6b,c2:0xffc906},
  {id:'f1_rossa',cat:'F1',tier:5,name:'Scuderia Rossa (Maranello)',c1:0xdc0000,c2:0xfff200},
  // GT3
  {id:'gt_lusitano',cat:'GT3',tier:1,name:'Lusitano GT',c1:0x5e548e,c2:0xf2e9e4},
  {id:'gt_iron',cat:'GT3',tier:2,name:'Iron Horse GT',c1:0x3a3a3a,c2:0xff6b00},
  {id:'gt_bavaria',cat:'GT3',tier:3,name:'Bavaria Motorsport GT',c1:0xf8f9fa,c2:0x1c69d4},
  {id:'gt_rossa',cat:'GT3',tier:4,name:'Rossa GT Corse',c1:0xd90429,c2:0x111111},
  {id:'gt_star',cat:'GT3',tier:5,name:'Silver Star GT',c1:0xadb5bd,c2:0x2ec4b6}
];
const teamById=id=>TEAMS.find(t=>t.id===id)||TEAMS[0];
const tiersOf=cat=>TEAMS.filter(t=>t.cat===cat);
const maxTier=cat=>Math.max(...tiersOf(cat).map(t=>t.tier));
const CIRCUITS=[
  {n:'Portimão',c:'Portugal'},{n:'Barcelona',c:'Espanha'},{n:'Mónaco',c:'Mónaco'},{n:'Silverstone',c:'Reino Unido'},
  {n:'Spa',c:'Bélgica'},{n:'Zandvoort',c:'Países Baixos'},{n:'Monza',c:'Itália'},{n:'Interlagos',c:'Brasil'},
  {n:'Suzuka',c:'Japão'},{n:'Red Bull Ring',c:'Áustria'},{n:'Hungaroring',c:'Hungria'},{n:'Imola',c:'Itália'},{n:'Estoril',c:'Portugal'}
];

const ROUNDS=8;
const PTS=[25,18,15,12,10,8,6,4,2,1];
const COSM={
  suit:[
    {id:'team',name:'Fato da equipa',lvl:1,base:null,acc:null},
    {id:'carbon',name:'Carbono',lvl:3,base:0x2b2e34,acc:0x9aa1ac},
    {id:'retro',name:'Retro 70',lvl:5,base:0xefe3c8,acc:0xc0392b},
    {id:'neon',name:'Neon nocturno',lvl:8,base:0x15161a,acc:0x39ff88},
    {id:'gold',name:'Campeão dourado',lvl:12,base:0xc99a1d,acc:0xffffff}
  ],
  gloves:[
    {id:'basic',name:'Luvas básicas',lvl:1,c:0x1d1f23},
    {id:'kevlar',name:'Kevlar',lvl:2,c:0xe0b53a},
    {id:'red',name:'Vermelho corrida',lvl:3,c:0xd00000},
    {id:'fluor',name:'Fluorescentes',lvl:4,c:0xc6ff00},
    {id:'carbon',name:'Carbono',lvl:7,c:0x3a3d44},
    {id:'gold',name:'Ouro',lvl:10,c:0xe0b13a}
  ],
  helmet:[
    {id:'std',name:'Capacete padrão',lvl:1,c:null},
    {id:'white',name:'Branco clássico',lvl:2,c:0xf2f2f2},
    {id:'mirror',name:'Viseira espelhada',lvl:4,c:0x1a1a1a,mirror:true},
    {id:'champ',name:'Capacete campeão',lvl:9,c:0xd4a017,mirror:true}
  ],
  gun:[
    {id:'std',name:'Pistola padrão',lvl:1,c:0x2b2e33,bonus:1,dur:1,desc:'Fiável.'},
    {id:'blue',name:'Pistola anodizada',lvl:3,c:0x1f4fd1,bonus:1,dur:.85,desc:'Desgasta-se 15% menos.'},
    {id:'titan',name:'Pistola titânio',lvl:6,c:0x9aa3ad,bonus:.95,dur:.75,desc:'5% mais rápida, mais resistente.'},
    {id:'pro',name:'Pistola F1 Pro',lvl:11,c:0xd0d4da,bonus:.9,dur:.6,desc:'10% mais rápida, muito resistente.'}
  ]
};
COSM.boots=[{id:'std',name:'Botas pretas',lvl:1,c:0x16171a},{id:'white',name:'Botas brancas',lvl:2,c:0xe9e9e9},{id:'team',name:'Botas da equipa',lvl:4,c:null},{id:'carbon',name:'Botas carbono',lvl:7,c:0x30333a},{id:'gold',name:'Botas douradas',lvl:11,c:0xc99a1d}];
const COSM_TABS=[['suit','Fatos'],['gloves','Luvas'],['boots','Botas'],['helmet','Capacete'],['gun','Pistola']];
