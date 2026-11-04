'use strict';
/* KARTING PRO · motor do cronómetro
   Tudo é calculado a partir de marcas de tempo (ms desde 1970, alta resolução), nunca a partir de
   quantas vezes o ecrã foi desenhado. Se o ecrã congelar, a app for para segundo plano ou for
   fechada e reaberta, os tempos continuam certos porque o estado guarda apenas instantes. */
(function(g){
const KP=g.KP=g.KP||{};
class Stopwatch{
  constructor(state){
    Object.assign(this,{status:'idle',startedAt:null,lapStart:null,pauseAt:null,pausedTotal:0,lapPaused:0,laps:[],finishedAt:null,minLapMs:5000,outLap:false},state||{});
    this.laps=(this.laps||[]).map(l=>({...l}));
  }
  /* tempo ativo (sem pausas) */
  elapsed(t){
    if(this.status==='idle')return 0;
    const end=this.status==='paused'?this.pauseAt:this.status==='finished'?this.finishedAt:t;
    return end-this.startedAt-this.pausedTotal;
  }
  currentLap(t){
    if(this.status==='idle'||this.status==='finished')return 0;
    const end=this.status==='paused'?this.pauseAt:t;
    return end-this.lapStart-this.lapPaused;
  }
  start(t,{minLapMs,outLap}={}){
    if(this.status!=='idle')return false;
    if(minLapMs!=null)this.minLapMs=minLapMs;if(outLap!=null)this.outLap=outLap;
    Object.assign(this,{status:'running',startedAt:t,lapStart:t,pausedTotal:0,lapPaused:0,laps:[]});
    return true;
  }
  /* devolve {ms,index} ou {ignored:true,ms} quando o toque é mais curto que a volta mínima */
  lap(t){
    if(this.status!=='running')return null;
    const ms=t-this.lapStart-this.lapPaused;
    if(ms<this.minLapMs)return{ignored:true,ms};
    const lap={ms:Math.round(ms),at:t,valid:true};
    if(this.outLap&&this.laps.length===0)lap.outlap=true;
    this.laps.push(lap);this.lapStart=t;this.lapPaused=0;
    return{ms:lap.ms,index:this.laps.length-1,lap};
  }
  pause(t){if(this.status!=='running')return false;this.status='paused';this.pauseAt=t;return true;}
  resume(t){if(this.status!=='paused')return false;const d=t-this.pauseAt;this.pausedTotal+=d;this.lapPaused+=d;this.pauseAt=null;this.status='running';return true;}
  /* termina: a volta incompleta em curso não conta (não cruzou a meta) */
  finish(t){
    if(this.status==='idle'||this.status==='finished')return null;
    if(this.status==='paused')this.resume(this.pauseAt);
    this.finishedAt=t;this.status='finished';
    return{laps:this.laps.map(l=>({...l})),durationMs:Math.round(this.elapsed(t)),startedAt:this.startedAt};
  }
  removeLastLap(){if(!this.laps.length||this.status!=='running')return null;const l=this.laps.pop();this.lapStart=l.at-l.ms;return l;}
  toJSON(){const{status,startedAt,lapStart,pauseAt,pausedTotal,lapPaused,laps,finishedAt,minLapMs,outLap}=this;return{status,startedAt,lapStart,pauseAt,pausedTotal,lapPaused,laps,finishedAt,minLapMs,outLap};}
}
/* estatísticas de uma lista de voltas (só voltas válidas, sem volta de saída) */
KP.lapStats=laps=>{
  const v=(laps||[]).filter(l=>l.valid!==false&&!l.outlap).map(l=>l.ms);
  if(!v.length)return{n:0,count:(laps||[]).length,best:null,avg:null,std:null,median:null,within1:null,bestIndex:-1};
  const best=Math.min(...v),avg=v.reduce((a,b)=>a+b,0)/v.length;
  const std=v.length>1?Math.sqrt(v.reduce((s,x)=>s+(x-avg)**2,0)/(v.length-1)):null;
  const s=[...v].sort((a,b)=>a-b),k=s.length>>1;
  return{n:v.length,count:laps.length,best,avg,std,median:s.length%2?s[k]:(s[k-1]+s[k])/2,
    within1:v.filter(x=>x<=best*1.01).length/v.length,
    bestIndex:laps.findIndex(l=>l.valid!==false&&!l.outlap&&l.ms===best)};
};
KP.Stopwatch=Stopwatch;
if(typeof module!=='undefined')module.exports={Stopwatch,lapStats:KP.lapStats};
})(typeof window!=='undefined'?window:globalThis);
