'use strict';
/* KARTING PRO · progressão: XP, níveis, desafios diários, sequência de dias e recompensas.
   Regras pensadas para não incentivar excesso de treino: só 3 desafios por dia e
   os exercícios deixam de dar XP depois de 6 no mesmo dia. */
(function(g){
const KP=g.KP,S=()=>KP.store;
const LEVELS=[{name:'Rookie',min:0},{name:'Amateur',min:400},{name:'Advanced',min:1200},{name:'Pro',min:3000},{name:'Elite',min:6000}];
const DRILL_XP=10,DRILL_CAP=6,ALL_BONUS=30;
KP.LEVELS=LEVELS;
KP.levelOf=xp=>{let i=0;LEVELS.forEach((l,k)=>{if(xp>=l.min)i=k;});const next=LEVELS[i+1];
  return{index:i,name:LEVELS[i].name,min:LEVELS[i].min,next:next?next.min:null,nextName:next?next.name:null,progress:next?(xp-LEVELS[i].min)/(next.min-LEVELS[i].min):1};};

KP.addXP=(amount,reason)=>{
  if(!amount)return;const d=S().raw();const before=KP.levelOf(d.xp.total).index;
  d.xp.total+=amount;d.xp.log.push({at:Date.now(),amount,reason});if(d.xp.log.length>500)d.xp.log.shift();
  const after=KP.levelOf(d.xp.total).index;
  if(after>before){d.levels.push({level:after,at:Date.now()});S().save();S().emit('levelup',LEVELS[after]);}
  else S().save();
  S().emit('xp',{amount,reason});
};

/* ---- desafios diários ---- */
const POOL={
  light:{text:'Faz um teste de reação à luz',kind:'drill',mode:'light',xp:25,group:'reflex'},
  signals:{text:'Completa a reação a sinais',kind:'drill',mode:'signals',xp:25,group:'reflex'},
  visual:{text:'Completa a reação visual',kind:'drill',mode:'visual',xp:25,group:'reflex'},
  beatLight:{text:'Bate a tua média de reação à luz',kind:'beat',mode:'light',xp:35,group:'reflex'},
  memory:{text:'Faz um exercício de memória',kind:'drill',mode:'memory',xp:30,group:'focus'},
  attention:{text:'Completa um exercício de atenção',kind:'drill',mode:'attention',xp:30,group:'focus'},
  identify:{text:'Identifica as bandeiras',kind:'drill',mode:'identify',xp:30,group:'focus'},
  sustained:{text:'Faz o teste de concentração sustentada',kind:'drill',mode:'sustained',xp:35,group:'focus'},
  stats:{text:'Consulta as tuas estatísticas',kind:'view',view:'estatisticas',xp:15,group:'other'},
  diary:{text:'Escreve no diário o que queres melhorar',kind:'diary',xp:25,group:'other'},
  session:{text:'Regista uma sessão de karting',kind:'session',xp:40,group:'other'}
};
KP.CHALLENGES=POOL;
function build(day){
  const rnd=KP.seeded('kp-'+day),dow=KP.fromKey(day).getDay(),has=S().sessions().length>0;
  const reflex=KP.pick(['light','signals','visual','beatLight'],rnd),focus=KP.pick(['memory','attention','identify','sustained'],rnd);
  const other=(dow===0||dow===6)?'session':has&&rnd()<.5?'diary':'stats';
  return{list:[reflex,focus,other].map(id=>({id,done:false,doneAt:null})),bonus:false};
}
KP.today=()=>{const d=S().raw(),k=KP.dayKey();if(!d.challenges[k]){d.challenges[k]=build(k);S().save();}return d.challenges[k];};
function complete(item){
  if(item.done)return;item.done=true;item.doneAt=Date.now();const c=POOL[item.id];
  KP.addXP(c.xp,'Desafio: '+c.text);S().emit('challenge',{id:item.id,text:c.text,xp:c.xp});
  const t=KP.today();if(!t.bonus&&t.list.every(x=>x.done)){t.bonus=true;KP.addXP(ALL_BONUS,'Todos os desafios do dia');S().emit('challenge-all',{xp:ALL_BONUS});}
  S().save();
}
function checkChallenges(type,p){
  const t=KP.today();
  t.list.forEach(item=>{if(item.done)return;const c=POOL[item.id];
    if(c.kind==='drill'&&type==='drill'&&p.mode===c.mode)complete(item);
    else if(c.kind==='beat'&&type==='drill'&&p.mode===c.mode){
      const prev=S().drills(c.mode).filter(d=>d.id!==p.id).slice(-5).map(d=>d.avg).filter(v=>v!=null);
      if(p.avg!=null&&(!prev.length||p.avg<KP.mean(prev)))complete(item);}
    else if(c.kind==='view'&&type==='view'&&p===c.view)complete(item);
    else if(c.kind==='session'&&type==='session-new')complete(item);
    else if(c.kind==='diary'&&(type==='session-updated'||type==='session-new')&&p.improve&&p.improve.trim())complete(item);
  });
}

/* ---- sequência de dias com atividade ---- */
KP.activeDays=()=>{
  const d=S().raw(),set=new Set();
  S().sessions().forEach(s=>set.add(KP.dayKey(s.date)));S().drills().forEach(x=>set.add(KP.dayKey(x.date)));
  Object.entries(d.challenges).forEach(([k,v])=>{if(v.list.some(x=>x.done))set.add(k);});
  return set;
};
KP.streak=()=>{const set=KP.activeDays();const d=new Date();d.setHours(12);
  if(!set.has(KP.dayKey(d)))d.setDate(d.getDate()-1);let n=0;while(set.has(KP.dayKey(d))){n++;d.setDate(d.getDate()-1);}return n;};
KP.drillsToday=()=>S().drills().filter(x=>KP.dayKey(x.date)===KP.dayKey()).length;

/* ---- recompensas (calculadas a partir dos dados, nada inventado) ---- */
KP.badges=()=>{
  const ses=S().sessions(),laps=ses.reduce((a,s)=>a+KP.sessionStats(s).count,0),light=S().drills('light'),st=KP.streak();
  const bestRt=light.length?Math.min(...light.map(d=>d.best).filter(v=>v!=null)):null;
  return[
    {id:'s1',name:'Primeira sessão',desc:'Regista 1 sessão',got:ses.length>=1,prog:Math.min(1,ses.length)},
    {id:'s10',name:'Habitué',desc:'Regista 10 sessões',got:ses.length>=10,prog:Math.min(1,ses.length/10)},
    {id:'l100',name:'100 voltas',desc:'Completa 100 voltas registadas',got:laps>=100,prog:Math.min(1,laps/100)},
    {id:'l500',name:'500 voltas',desc:'Completa 500 voltas registadas',got:laps>=500,prog:Math.min(1,laps/500)},
    {id:'r250',name:'Reflexos de piloto',desc:'Reação à luz abaixo de 250 ms',got:bestRt!=null&&bestRt<250,prog:bestRt?Math.min(1,250/bestRt):0},
    {id:'st3',name:'3 dias seguidos',desc:'Atividade em 3 dias seguidos',got:st>=3,prog:Math.min(1,st/3)},
    {id:'st7',name:'Semana completa',desc:'Atividade em 7 dias seguidos',got:st>=7,prog:Math.min(1,st/7)},
    {id:'d5',name:'Diário em dia',desc:'Escreve "o que melhorar" em 5 sessões',got:ses.filter(s=>s.improve).length>=5,prog:Math.min(1,ses.filter(s=>s.improve).length/5)}
  ];
};

/* ---- regras de XP ligadas aos eventos da app ---- */
KP.initProgress=()=>{
  S().on((type,p)=>{
    const d=S().raw();
    if(['drill','session-new','challenge'].includes(type)){
      const k=KP.dayKey();
      if(d.meta.lastActiveDay!==k){d.meta.lastActiveDay=k;S().save();const st=KP.streak();if(st>1)KP.addXP(5*Math.min(st,5),`Sequência de ${st} dias`);}
    }
    if(type==='session-new'){
      const n=KP.sessionStats(p).count;KP.addXP(p.source==='timer'?50+Math.min(30,2*n):30,'Sessão registada');
    }
    if((type==='session-updated'||type==='session-new')&&!p.diaryXP&&p.track&&p.feel&&(p.good||p.improve)){
      p.diaryXP=true;S().save();KP.addXP(20,'Diário completo');
    }
    if(type==='drill'){
      if(KP.drillsToday()<=DRILL_CAP)KP.addXP(DRILL_XP,'Exercício de treino');
    }
    if(['drill','view','session-new','session-updated'].includes(type))checkChallenges(type,p);
  });
};
KP.DRILL_CAP=DRILL_CAP;
})(window);
