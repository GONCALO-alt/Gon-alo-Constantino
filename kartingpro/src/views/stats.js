'use strict';
/* KARTING PRO · Estatísticas e evolução (só dados reais do utilizador) */
(function(g){
const KP=g.KP,ui=KP.ui,S=KP.store,esc=KP.esc;
const RANGES=[[7,'7 dias'],[30,'30 dias'],[90,'90 dias'],[0,'Tudo']];
let range=30,track=null,drillMode='light';
const inRange=(d,days)=>!days||d>=KP.daysAgo(days-1);
const prevRange=(d,days)=>days&&d>=KP.daysAgo(2*days-1)&&d<KP.daysAgo(days-1);
function weekKey(t){const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime();}

KP.app.view('estatisticas',{render(el){
  const all=S.sessions(),tracks=S.tracks();if(!track||!tracks.includes(track))track=tracks[0]||null;
  const ses=all.filter(s=>inRange(s.date,range)),prev=all.filter(s=>prevRange(s.date,range));
  const drills=S.drills().filter(d=>inRange(d.date,range));
  const laps=ses.reduce((a,s)=>a+KP.sessionStats(s).count,0),plaps=prev.reduce((a,s)=>a+KP.sessionStats(s).count,0);
  const light=drills.filter(d=>d.mode==='light'&&d.avg!=null),pl=S.drills('light').filter(d=>prevRange(d.date,range)&&d.avg!=null);
  const lAvg=light.length?KP.mean(light.map(d=>d.avg)):null,plAvg=pl.length?KP.mean(pl.map(d=>d.avg)):null;
  const cmp=(a,b,lowerBetter,fmt)=>range&&b!=null&&a!=null&&b!==0?`<span class="${(lowerBetter?a<b:a>b)?'good':a===b?'':'warn'}">${a>b?'+':a<b?'−':''}${fmt(Math.abs(a-b))}</span> vs ${range} dias antes`:range?'sem período anterior':'todo o histórico';
  el.innerHTML=`
  <div class="chips" role="group" aria-label="Período">${RANGES.map(([d,l])=>`<button class="chip" data-r="${d}" aria-pressed="${range===d}">${l}</button>`).join('')}</div>
  <section class="tiles">
    ${ui.tile('Sessões',String(ses.length),cmp(ses.length,prev.length,false,v=>String(v)))}
    ${ui.tile('Voltas registadas',KP.fmtInt(laps),cmp(laps,plaps,false,v=>KP.fmtInt(v)))}
    ${ui.tile('Reação à luz',lAvg!=null?Math.round(lAvg)+' ms':'—',lAvg!=null?cmp(lAvg,plAvg,true,v=>Math.round(v)+' ms'):'faz um teste no Treino')}
    ${ui.tile('Exercícios',String(drills.length),drills.length?`precisão média ${KP.fmtPct(KP.mean(drills.map(d=>d.accuracy).filter(v=>v!=null)))}`:'reflexos e concentração')}
  </section>
  <section class="card"><div class="card-h"><h3>Tempos de volta por sessão</h3></div>
    ${tracks.length>1?`<div class="field"><label for="stTrack">Circuito <span class="muted">(os tempos só se comparam no mesmo circuito)</span></label><select id="stTrack">${tracks.map(t=>`<option ${t===track?'selected':''}>${esc(t)}</option>`).join('')}</select></div>`:track?`<div class="small muted">${esc(track)}</div>`:''}
    <div id="chLaps"></div></section>
  <section class="card"><div class="card-h"><h3>Sessões e voltas por semana</h3></div><div id="chWeeks"></div></section>
  <section class="card"><div class="card-h"><h3>Evolução dos reflexos</h3><span class="small muted">menor é melhor</span></div><div id="chReact"></div></section>
  <section class="card"><div class="card-h"><h3>Precisão dos exercícios</h3></div>
    <div class="seg" id="stDm">${Object.entries(KP.GAMES).map(([k,G])=>`<button data-m="${k}" aria-pressed="${drillMode===k}">${esc(G.name)}</button>`).join('')}</div><div id="chAcc"></div></section>
  <section class="card"><div class="card-h"><h3>Recordes pessoais</h3></div><div class="list" id="stRec"></div></section>
  <div class="row"><button class="btn grow" id="stCmp" ${all.length<2?'disabled':''}>Comparar duas sessões</button><button class="btn grow" id="stExp">Exportar</button></div>`;
  KP.$$('[data-r]',el).forEach(b=>b.onclick=()=>{range=+b.dataset.r;KP.app.refresh();});
  const ts=KP.$('#stTrack',el);if(ts)ts.onchange=()=>{track=ts.value;KP.app.refresh();};
  KP.$$('#stDm button',el).forEach(b=>b.onclick=()=>{drillMode=b.dataset.m;KP.app.refresh();});
  // 1. melhor volta e média por sessão (circuito escolhido)
  const ts2=ses.filter(s=>s.track===track).map(s=>({s,st:KP.sessionStats(s)})).filter(o=>o.st.best!=null).sort((a,b)=>a.s.date-b.s.date);
  ui.lineChart(KP.$('#chLaps',el),{series:[
      {name:'Melhor volta',color:ui.C.red,points:ts2.map(o=>({x:o.s.date,y:o.st.best,xl:KP.fmtDate(o.s.date)}))},
      {name:'Média',color:ui.C.blue,points:ts2.filter(o=>o.st.avg!=null).map(o=>({x:o.s.date,y:o.st.avg,xl:KP.fmtDate(o.s.date)}))}],
    yFmt:(v,tick)=>KP.fmtTime(v,{dec:tick?1:3}),xFmt:x=>KP.fmtDate(x,{day:'numeric',month:'short'}),xName:'Sessão',label:'Melhor volta e média por sessão'});
  // 2. sessões e voltas por semana
  const wk={};ses.forEach(s=>{const k=weekKey(s.date);wk[k]=wk[k]||{n:0,l:0};wk[k].n++;wk[k].l+=KP.sessionStats(s).count;});
  const weeks=[];const nW=range?Math.ceil(range/7):Math.max(1,Math.min(26,Object.keys(wk).length?Math.ceil((weekKey(Date.now())-Math.min(...Object.keys(wk).map(Number)))/(7*864e5))+1:1));
  for(let i=nW-1;i>=0;i--){const k=weekKey(Date.now()-i*7*864e5);weeks.push({label:KP.fmtDate(k,{day:'numeric',month:'short'}),tip:`Semana de ${KP.fmtDate(k)} · ${(wk[k]||{l:0}).l} voltas`,value:(wk[k]||{n:0}).n});}
  ui.barChart(KP.$('#chWeeks',el),{bars:weeks,yFmt:v=>`${v} ${v===1?'sessão':'sessões'}`,xName:'Semana',yName:'Sessões',label:'Sessões por semana'});
  // 3. reflexos
  const rx=drills.filter(d=>d.mode==='light'&&d.avg!=null).sort((a,b)=>a.date-b.date);
  ui.lineChart(KP.$('#chReact',el),{series:[{name:'Média do teste',color:ui.C.blue,points:rx.map(d=>({x:d.date,y:d.avg,xl:KP.fmtDate(d.date)+' '+KP.fmtHour(d.date)}))},
      {name:'Melhor reação',color:ui.C.red,points:rx.filter(d=>d.best!=null).map(d=>({x:d.date,y:d.best,xl:KP.fmtDate(d.date)+' '+KP.fmtHour(d.date)}))}],
    yFmt:v=>Math.round(v)+' ms',xFmt:x=>KP.fmtDate(x,{day:'numeric',month:'short'}),xName:'Teste',label:'Evolução do tempo de reação à luz'});
  // 4. precisão por exercício
  const ac=drills.filter(d=>d.mode===drillMode&&d.accuracy!=null).sort((a,b)=>a.date-b.date);
  ui.lineChart(KP.$('#chAcc',el),{series:[{name:'Precisão',color:ui.C.red,points:ac.map(d=>({x:d.date,y:d.accuracy*100,xl:KP.fmtDate(d.date)+' '+KP.fmtHour(d.date)}))}],
    yFmt:v=>Math.round(v)+'%',xFmt:x=>KP.fmtDate(x,{day:'numeric',month:'short'}),xName:'Exercício',label:'Precisão dos exercícios',zero:true});
  // recordes (todo o histórico)
  const rec=[];
  tracks.forEach(t=>{const b=KP.bestAt(t);if(b.best!=null)rec.push([`Melhor volta · ${t}`,KP.fmtTime(b.best),KP.fmtDate(b.ses.date),b.ses.id]);});
  const allLight=S.drills('light').filter(d=>d.best!=null);if(allLight.length){const b=allLight.reduce((a,c)=>c.best<a.best?c:a);rec.push(['Reação mais rápida',Math.round(b.best)+' ms',KP.fmtDate(b.date)]);}
  const mem=S.drills('memory');if(mem.length){const b=mem.reduce((a,c)=>(c.score||0)>(a.score||0)?c:a);rec.push(['Sequência de memória',String(b.score),KP.fmtDate(b.date)]);}
  const most=all.reduce((a,s)=>KP.sessionStats(s).count>(a?KP.sessionStats(a).count:-1)?s:a,null);if(most)rec.push(['Mais voltas numa sessão',String(KP.sessionStats(most).count),KP.fmtDate(most.date),most.id]);
  const consist=all.filter(s=>KP.sessionStats(s).std!=null&&KP.sessionStats(s).n>=5).reduce((a,s)=>!a||KP.sessionStats(s).std<KP.sessionStats(a).std?s:a,null);
  if(consist)rec.push(['Sessão mais consistente (5+ voltas)','±'+(KP.sessionStats(consist).std/1000).toFixed(2)+' s',`${KP.fmtDate(consist.date)} · ${consist.track||''}`,consist.id]);
  const rb=KP.$('#stRec',el);
  rb.innerHTML=rec.length?rec.map(r=>`<${r[3]?'button':'div'} class="li" ${r[3]?`data-sid="${esc(r[3])}"`:''}><div style="min-width:0"><div class="t">${esc(r[0])}</div><div class="d">${esc(r[2])}</div></div><div class="r num" style="font-size:18px">${esc(r[1])}</div></${r[3]?'button':'div'}>`).join('')
    :ui.empty('Ainda sem recordes','Os recordes aparecem com as primeiras sessões e exercícios.');
  KP.$$('[data-sid]',rb).forEach(b=>b.onclick=()=>KP.openSession(b.dataset.sid));
  KP.$('#stCmp',el).onclick=()=>{const t=all.filter(s=>s.track===track);KP.openCompare((t[1]||all[1]).id,(t[0]||all[0]).id);};
  KP.$('#stExp',el).onclick=()=>KP.exportMenu();
}});
})(window);
