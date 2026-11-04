'use strict';
/* KARTING PRO · dados guardados no dispositivo
   - Tudo fica no armazenamento local do browser (sem conta, sem servidor).
   - Cada registo tem id, createdAt e updatedAt; apagar deixa uma "lápide" (deleted:true).
     Isto permite, no futuro, juntar dados de vários dispositivos (ver KP.sync). */
(function(g){
const KP=g.KP;
const KEY='kartingpro.v1',SCHEMA=1;
function empty(){const now=Date.now();return{
  schema:SCHEMA,deviceId:KP.uid(),createdAt:now,
  profile:{name:'',kart:'',homeTrack:'',color:'#ef3b36',photo:'',createdAt:now,updatedAt:now},
  sessions:[],drills:[],
  xp:{total:0,log:[]},levels:[{level:0,at:now}],
  challenges:{},meta:{lastActiveDay:null},
  settings:{minLapMs:5000,keepAwake:true,haptics:true,sound:true,outLap:false},
  gps:{tracks:{}},live:null};}
let data=null,storageOk=true;const listeners=[];
function migrate(d){
  const base=empty();
  for(const k in base)if(!(k in d))d[k]=base[k];
  d.settings={...base.settings,...d.settings};d.profile={...base.profile,...d.profile};d.meta={...base.meta,...d.meta};
  d.schema=SCHEMA;return d;
}
function save(){try{g.localStorage.setItem(KEY,JSON.stringify(data));storageOk=true;return true;}catch(e){storageOk=false;return false;}}
const csvCell=v=>{const s=String(v??'');return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
const csv=rows=>rows.map(r=>r.map(csvCell).join(';')).join('\r\n');

const S={
  init(){
    let raw=null;
    try{raw=g.localStorage.getItem(KEY);data=raw?migrate(JSON.parse(raw)):empty();}catch(e){storageOk=false;data=empty();}
    if(!raw)save();
    try{g.navigator.storage&&g.navigator.storage.persist&&g.navigator.storage.persist();}catch(e){}
  },
  ok:()=>storageOk,
  raw:()=>data,
  save,
  on(fn){listeners.push(fn);},
  emit(type,payload){listeners.forEach(f=>{try{f(type,payload);}catch(e){console.error(e);}});},
  // perfil e definições
  profile:()=>data.profile,
  setProfile(p){Object.assign(data.profile,p,{updatedAt:Date.now()});save();S.emit('profile',data.profile);},
  settings:()=>data.settings,
  setSettings(p){Object.assign(data.settings,p);save();},
  // sessões de karting (cronómetro ou diário)
  sessions(){return data.sessions.filter(s=>!s.deleted).sort((a,b)=>b.date-a.date);},
  session(id){return data.sessions.find(s=>s.id===id&&!s.deleted)||null;},
  saveSession(s){
    const now=Date.now(),i=data.sessions.findIndex(x=>x.id===s.id),isNew=i<0;
    if(isNew){s.id=s.id||KP.uid();s.createdAt=now;data.sessions.push(s);}else data.sessions[i]=s;
    s.updatedAt=now;save();S.emit(isNew?'session-new':'session-updated',s);return s;
  },
  deleteSession(id){const s=data.sessions.find(x=>x.id===id);if(!s)return;s.deleted=true;s.updatedAt=Date.now();save();S.emit('session-deleted',s);},
  // exercícios de reflexos e concentração
  drills(mode){return data.drills.filter(d=>!d.deleted&&(!mode||d.mode===mode)).sort((a,b)=>a.date-b.date);},
  addDrill(d){Object.assign(d,{id:KP.uid(),date:d.date||Date.now()});d.updatedAt=d.date;data.drills.push(d);save();S.emit('drill',d);return d;},
  // sessão do cronómetro em curso (sobrevive a fechar a app)
  live:()=>data.live,
  setLive(v){data.live=v;save();},
  // listas para sugestões
  tracks(){const c={};S.sessions().forEach(s=>{if(s.track)c[s.track]=(c[s.track]||0)+1;});return Object.keys(c).sort((a,b)=>c[b]-c[a]);},
  karts(){const c={};S.sessions().forEach(s=>{if(s.kart)c[s.kart]=(c[s.kart]||0)+1;});return Object.keys(c).sort((a,b)=>c[b]-c[a]);},
  // exportação
  exportJSON(){const{live,...rest}=data;return JSON.stringify({app:'KARTING PRO',exportedAt:new Date().toISOString(),...rest},null,2);},
  exportSessionsCSV(list=S.sessions()){
    const rows=[['data','hora','circuito','kart','origem','voltas','melhor_volta','melhor_volta_ms','media','media_ms','desvio_ms','meteorologia','pista','sensacao_1a5','correu_bem','melhorar','notas']];
    list.forEach(s=>{const st=KP.sessionStats(s);rows.push([KP.dayKey(s.date),KP.fmtHour(s.date),s.track,s.kart,s.source==='timer'?'cronómetro':'diário',st.count,
      KP.fmtTime(st.best),st.best??'',KP.fmtTime(st.avg),st.avg!=null?Math.round(st.avg):'',st.std!=null?Math.round(st.std):'',s.weather,s.trackCond,s.feel||'',s.good,s.improve,s.notes]);});
    return csv(rows);
  },
  exportLapsCSV(list=S.sessions()){
    const rows=[['data','circuito','kart','sessao_id','volta','tempo','tempo_ms','valida','volta_de_saida']];
    list.forEach(s=>(s.laps||[]).forEach((l,i)=>rows.push([KP.dayKey(s.date),s.track,s.kart,s.id,i+1,KP.fmtTime(l.ms),l.ms,l.valid===false?'não':'sim',l.outlap?'sim':'não'])));
    return csv(rows);
  },
  exportDrillsCSV(){
    const rows=[['data','exercicio','categoria','melhor_ms','media_ms','acertos','erros','precisao','pontuacao']];
    S.drills().forEach(d=>rows.push([new Date(d.date).toISOString(),d.mode,d.cat,d.best??'',d.avg!=null?Math.round(d.avg):'',d.hits??'',d.errors??'',d.accuracy!=null?Math.round(d.accuracy*100)+'%':'',d.score??'']));
    return csv(rows);
  },
  /* importa uma cópia de segurança: junta por id, fica a versão mais recente de cada registo */
  importJSON(text){
    let obj;try{obj=JSON.parse(text);}catch(e){throw new Error('O ficheiro não é um JSON válido.');}
    if(!obj||obj.app!=='KARTING PRO'||!Array.isArray(obj.sessions))throw new Error('Este ficheiro não é uma cópia do KARTING PRO.');
    const r=S.mergeRecords(obj);save();S.emit('import',r);return r;
  },
  mergeRecords(remote){
    const res={sessions:0,drills:0};
    ['sessions','drills'].forEach(k=>(remote[k]||[]).forEach(rec=>{
      if(!rec||!rec.id)return;const i=data[k].findIndex(x=>x.id===rec.id);
      if(i<0){data[k].push(rec);res[k]++;}else if((rec.updatedAt||0)>(data[k][i].updatedAt||0)){data[k][i]=rec;res[k]++;}}));
    if(remote.profile&&(remote.profile.updatedAt||0)>(data.profile.updatedAt||0))data.profile={...data.profile,...remote.profile};
    if(remote.xp&&remote.xp.total>data.xp.total){data.xp=remote.xp;data.levels=remote.levels||data.levels;}
    if(remote.challenges)for(const d in remote.challenges)if(!data.challenges[d])data.challenges[d]=remote.challenges[d];
    if(remote.gps&&remote.gps.tracks)data.gps.tracks={...remote.gps.tracks,...data.gps.tracks};
    return res;
  },
  reset(){const keep=data.deviceId;data=empty();data.deviceId=keep;save();S.emit('reset');}
};
/* estatísticas de uma sessão (cronómetro: a partir das voltas; diário: valores introduzidos) */
KP.sessionStats=s=>{
  if(s.laps&&s.laps.length)return KP.lapStats(s.laps);
  const m=s.manual||{};return{n:m.laps||0,count:m.laps||0,best:m.bestMs??null,avg:m.avgMs??null,std:null,median:null,within1:null,bestIndex:-1};
};
KP.store=S;
/* Sincronização futura: basta registar um adaptador com pull() e push(dados).
   A junção usa os mesmos id/updatedAt/lápides que a importação. Nada é enviado sem adaptador. */
KP.sync={
  adapter:null,
  register(a){this.adapter=a;},
  async run(){
    if(!this.adapter)throw new Error('Sem serviço de sincronização configurado.');
    const remote=await this.adapter.pull();if(remote)S.mergeRecords(remote);S.save();
    await this.adapter.push(JSON.parse(S.exportJSON()));
  }
};
})(window);
