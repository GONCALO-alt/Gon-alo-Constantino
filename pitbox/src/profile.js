'use strict';
/* Pit Box · Perfil do jogador e gravação do progresso */
/* ---------------- PERFIL ---------------- */
const SAVE_KEY='pitbox.v1';
function defaultProfile(){return{
  v:1,level:1,xp:0,credits:0,
  settings:{difficulty:'easy',sound:true,voice:true,quickCat:'F4',orient:'portrait',voiceName:''},
  cosm:{suit:'team',gloves:'basic',helmet:'std',gun:'std',bought:[]},
  career:{teamId:'f4_bairro',season:1,round:0,racesInTeam:0,scores:[],teamPoints:0,offers:[],history:[],catsReached:['F4'],bestFinish:null},
  stats:{stops:[],total:0,errors:0,sumTime:0,best:{},bestScore:0,maxGain:0,clean:0,bestClean:0,subPar:0,perfect:0,errTypes:{},podiums:0,wins:0}
};}
function merge(def,src){if(!src||typeof src!=='object')return def;for(const k in def){if(k in src){if(def[k]&&typeof def[k]==='object'&&!Array.isArray(def[k]))def[k]=merge(def[k],src[k]);else def[k]=src[k];}}return def;}
let P=defaultProfile();
try{P=merge(defaultProfile(),JSON.parse(localStorage.getItem(SAVE_KEY)||'null'));}catch(e){}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(P));}catch(e){}}
const xpNeed=l=>250+l*150;
const catUnlocked=c=>P.level>=CATS[c].unlockLvl||P.career.catsReached.includes(c);
const cosmItem=(k,id)=>COSM[k].find(i=>i.id===id)||COSM[k][0];
const cosmOwned=(k,it)=>it.lvl<=P.level||P.cosm.bought.includes(k+':'+it.id);
