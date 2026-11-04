'use strict';
/* KARTING PRO · sessões: lista, detalhe, diário da sessão, comparação, eliminação e exportação */
(function(g){
const KP=g.KP,ui=KP.ui,S=KP.store,esc=KP.esc;
const WEATHER=['☀️ Seco','⛅ Nublado','🌧️ Chuva','🔥 Calor','❄️ Frio','💨 Vento'];
const TRACKC=['Seca','Húmida','Molhada','Com pó','Muita borracha','Fria'];
const FEEL=['','Muito mal','Mal','Normal','Bem','Excelente'];
KP.WEATHER=WEATHER;KP.TRACKC=TRACKC;KP.FEEL=FEEL;

KP.sessionRow=s=>{const st=KP.sessionStats(s);return`<button class="li" data-sid="${esc(s.id)}"><div style="min-width:0"><div class="t">${esc(s.track||'Sem circuito')}</div>
  <div class="d">${KP.fmtDate(s.date)} · ${st.count} voltas${s.source==='manual'?' · diário':''}${s.kart?' · '+esc(s.kart):''}</div></div>
  <div class="r"><div class="num" style="font-size:17px">${KP.fmtTime(st.best)}</div><div class="d">média ${KP.fmtTime(st.avg)}</div></div><span class="chev">›</span></button>`;};

/* exportar texto: no telemóvel instalado descarrega um ficheiro; aqui dentro só copiar funciona */
KP.exportText=(name,text,mime='text/csv')=>{
  const s=ui.sheet(`<h3>Exportar ${esc(name)}</h3><p class="small muted" style="margin:0">${KP.inFrame?'Copia o conteúdo e cola numa folha de cálculo ou num ficheiro.':'Descarrega o ficheiro ou copia o conteúdo.'}</p>
    <div class="field"><textarea id="expTxt" readonly style="min-height:160px;font-family:var(--f-num);font-size:12px"></textarea></div>
    <div class="row">${KP.inFrame?'':'<button class="btn grow" id="expDl">Descarregar</button>'}<button class="btn primary grow" id="expCp">Copiar</button></div>`);
  const ta=KP.$('#expTxt',s.el);ta.value=text;
  KP.$('#expCp',s.el).onclick=()=>{const ok=()=>ui.toast('Copiado');
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(ok,()=>{ta.focus();ta.select();ui.toast('Seleccionado: usa Copiar do teclado');});
    else{ta.focus();ta.select();ui.toast('Seleccionado: usa Copiar do teclado');}};
  const dl=KP.$('#expDl',s.el);if(dl)dl.onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime+';charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
};

KP.openSessionList=()=>KP.app.push('Sessões',(b)=>{
  const list=S.sessions();
  if(!list.length){b.innerHTML=`<div class="card">${ui.empty('Ainda não há sessões','Termina uma sessão no cronómetro ou cria uma entrada no Diário.')}</div>`;return;}
  b.innerHTML=`<div class="row"><button class="btn grow" id="slCmp" ${list.length<2?'disabled':''}>Comparar duas sessões</button><button class="btn" id="slExp">Exportar</button></div><div class="card"><div class="list">${list.map(KP.sessionRow).join('')}</div></div>`;
  KP.$$('[data-sid]',b).forEach(x=>x.onclick=()=>KP.openSession(x.dataset.sid));
  KP.$('#slCmp',b).onclick=()=>KP.openCompare(list[1].id,list[0].id);
  KP.$('#slExp',b).onclick=()=>KP.exportMenu();
});

KP.openSession=(id,{justFinished=false}={})=>KP.app.push('Sessão',(b,page)=>{
  const s=S.session(id);if(!s){b.innerHTML=`<div class="card">${ui.empty('Sessão não encontrada','Pode ter sido eliminada.')}</div>`;return;}
  page.setTitle(s.track||'Sessão');
  const st=KP.sessionStats(s),laps=s.laps||[];
  b.innerHTML=`
  ${justFinished?`<div class="note">Sessão guardada. Completa o diário (circuito, condições, sensações) para ganhar XP e lembrar-te do que aprendeste.</div>`:''}
  <div class="row small muted"><span>${KP.fmtDateLong(s.date)} · ${KP.fmtHour(s.date)}</span><span class="grow"></span><span>${s.source==='timer'?'Cronómetro':'Diário'}${s.gps?' · GPS':''}</span></div>
  <section class="tiles t3">
    ${ui.tile('Melhor',KP.fmtTime(st.best),st.bestIndex>=0?`volta ${st.bestIndex+1}`:'',true)}
    ${ui.tile('Média',KP.fmtTime(st.avg))}${ui.tile('Voltas',String(st.count),s.durationMs?KP.fmtDur(s.durationMs):'')}
    ${ui.tile('Desvio',st.std!=null?'±'+(st.std/1000).toFixed(2)+' s':'—','consistência')}
    ${ui.tile('Mediana',KP.fmtTime(st.median))}${ui.tile('A 1% da melhor',st.within1!=null?KP.fmtPct(st.within1):'—','das voltas')}
  </section>
  ${laps.length>1?`<section class="card"><div class="card-h"><h3>Tempos por volta</h3><span class="small muted">menor é melhor</span></div><div id="sdChart"></div></section>`:''}
  ${laps.length?`<section class="card"><div class="card-h"><h3>Voltas</h3><span class="small muted">toca numa volta para a invalidar</span></div><div class="tm-laps" style="max-height:none;flex:none">${laps.map((l,i)=>{const best=i===st.bestIndex;
    return`<button class="lap ${best?'best':''} ${l.valid===false?'inv':''} ${l.outlap?'out':''}" data-lap="${i}" style="width:100%;text-align:left"><span class="n">${i+1}</span><span class="ms">${KP.fmtTime(l.ms)}</span><span class="dl">${l.valid===false?'INVÁLIDA':l.outlap?'SAÍDA':best?'MELHOR':st.best!=null?KP.fmtDelta(l.ms-st.best):''}</span></button>`;}).join('')}</div></section>`:''}
  <section class="card"><div class="card-h"><h3>Diário</h3><button class="link" id="sdEdit">Editar</button></div>
    <dl style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0;font-size:14px">
      <dt class="muted">Kart</dt><dd style="margin:0">${esc(s.kart||'—')}</dd>
      <dt class="muted">Meteorologia</dt><dd style="margin:0">${esc(s.weather||'—')}</dd>
      <dt class="muted">Pista</dt><dd style="margin:0">${esc(s.trackCond||'—')}</dd>
      <dt class="muted">Sensações</dt><dd style="margin:0">${s.feel?FEEL[s.feel]+' ('+s.feel+'/5)':'—'}${s.feelText?' · '+esc(s.feelText):''}</dd>
      <dt class="muted">Correu bem</dt><dd style="margin:0;white-space:pre-wrap">${esc(s.good||'—')}</dd>
      <dt class="muted">A melhorar</dt><dd style="margin:0;white-space:pre-wrap">${esc(s.improve||'—')}</dd>
      <dt class="muted">Notas</dt><dd style="margin:0;white-space:pre-wrap">${esc(s.notes||'—')}</dd></dl></section>
  <div class="row"><button class="btn grow" id="sdCmp" ${S.sessions().length<2?'disabled':''}>Comparar</button><button class="btn grow" id="sdExp">Exportar</button></div>
  <button class="btn danger block" id="sdDel">Eliminar sessão</button>`;
  if(laps.length>1){const pts=laps.map((l,i)=>({l,i})).filter(o=>o.l.valid!==false&&!o.l.outlap).map(o=>({x:o.i+1,y:o.l.ms,xl:'Volta '+(o.i+1)}));
    ui.lineChart(KP.$('#sdChart',b),{series:[{name:'Tempo de volta',color:ui.C.red,points:pts}],yFmt:(v,tick)=>KP.fmtTime(v,{dec:tick?1:3}),xFmt:x=>'V'+x,xName:'Volta',
      highlight:p=>p.y===st.best,label:'Tempos por volta da sessão'});}
  KP.$$('[data-lap]',b).forEach(x=>x.onclick=()=>{const i=+x.dataset.lap,l=s.laps[i];
    const sh=ui.sheet(`<h3>Volta ${i+1} · ${KP.fmtTime(l.ms)}</h3><p class="small muted" style="margin:0">Uma volta inválida (pião, bandeira amarela, tráfego) não conta para a melhor volta nem para a média.</p>
      <button class="btn block ${l.valid===false?'primary':''}" id="lvT">${l.valid===false?'Tornar válida':'Invalidar volta'}</button><button class="btn ghost block" data-close>Cancelar</button>`);
    KP.$('#lvT',sh.el).onclick=()=>{l.valid=l.valid===false;S.saveSession(s);sh.close();page.redraw();};});
  KP.$('#sdEdit',b).onclick=()=>KP.editDiary(s,()=>page.redraw());
  KP.$('#sdCmp',b).onclick=()=>{const other=S.sessions().find(x=>x.id!==s.id&&x.track===s.track)||S.sessions().find(x=>x.id!==s.id);KP.openCompare(s.id,other.id);};
  KP.$('#sdExp',b).onclick=()=>KP.exportText(`sessao-${KP.dayKey(s.date)}.csv`,S.exportLapsCSV([s]));
  KP.$('#sdDel',b).onclick=async()=>{if(await ui.confirm('Eliminar sessão?','A sessão e as voltas deixam de aparecer no histórico e nas estatísticas.','Eliminar',true)){S.deleteSession(s.id);KP.app.pop();ui.toast('Sessão eliminada');}};
  if(justFinished&&!s.track)setTimeout(()=>KP.editDiary(s,()=>page.redraw()),400);
});

/* formulário do diário (sessões do cronómetro ou entradas manuais) */
KP.editDiary=(s,done)=>{
  const isNew=!s,manual=!s||s.source==='manual';
  s=s||{source:'manual',date:Date.now(),track:S.profile().homeTrack||'',kart:S.profile().kart||'',laps:[],manual:{},weather:'',trackCond:'',feel:0,good:'',improve:'',notes:''};
  const m=s.manual||{},dt=new Date(s.date);const dv=`${KP.dayKey(dt)}`;
  const chips=(name,opts,val)=>`<div class="chips" data-chips="${name}">${opts.map(o=>`<button type="button" class="chip" aria-pressed="${o===val}">${esc(o)}</button>`).join('')}</div>`;
  const sh=ui.sheet(`<h3>${isNew?'Nova entrada no diário':'Diário da sessão'}</h3>
    <form id="dfForm" style="display:flex;flex-direction:column;gap:12px">
      <div class="grid2"><div class="field"><label for="dfTrack">Circuito</label><input id="dfTrack" list="dfTl" required maxlength="60" value="${esc(s.track)}"><datalist id="dfTl">${S.tracks().map(t=>`<option value="${esc(t)}">`).join('')}</datalist></div>
        <div class="field"><label for="dfDate">Data</label><input id="dfDate" type="date" value="${dv}" ${manual?'':'disabled'}></div></div>
      <div class="field"><label for="dfKart">Kart utilizado</label><input id="dfKart" maxlength="40" value="${esc(s.kart||'')}"></div>
      ${manual?`<div class="grid2"><div class="field"><label for="dfLaps">Número de voltas</label><input id="dfLaps" type="number" inputmode="numeric" min="0" max="999" value="${m.laps??''}"></div>
        <div class="field"><label for="dfBest">Melhor volta</label><input id="dfBest" inputmode="decimal" placeholder="0:52.345" value="${m.bestMs!=null?KP.fmtTime(m.bestMs):''}"></div></div>
        <div class="field"><label for="dfAvg">Média dos tempos</label><input id="dfAvg" inputmode="decimal" placeholder="0:53.900" value="${m.avgMs!=null?KP.fmtTime(m.avgMs):''}"><span class="hint">Formato m:ss.mmm ou segundos (ex.: 52.345)</span></div>`
        :`<p class="small muted" style="margin:0">Voltas, melhor volta e média vêm do cronómetro.</p>`}
      <div class="field"><label>Condições meteorológicas</label>${chips('weather',WEATHER,s.weather)}</div>
      <div class="field"><label>Condições da pista</label>${chips('trackCond',TRACKC,s.trackCond)}</div>
      <div class="field"><label>Sensações durante a sessão</label><div class="seg" id="dfFeel">${[1,2,3,4,5].map(n=>`<button type="button" data-v="${n}" aria-pressed="${s.feel===n}">${n} · ${FEEL[n]}</button>`).join('')}</div>
        <input id="dfFeelT" maxlength="120" placeholder="Em poucas palavras (opcional)" value="${esc(s.feelText||'')}" style="margin-top:6px"></div>
      <div class="field"><label for="dfGood">O que correu bem</label><textarea id="dfGood" maxlength="600">${esc(s.good||'')}</textarea></div>
      <div class="field"><label for="dfImp">O que quero melhorar</label><textarea id="dfImp" maxlength="600">${esc(s.improve||'')}</textarea></div>
      <div class="field"><label for="dfNotes">Notas (afinação, pressões, trajetórias…)</label><textarea id="dfNotes" maxlength="1000">${esc(s.notes||'')}</textarea></div>
      <p class="small" id="dfErr" style="color:var(--red-hi);margin:0" hidden></p>
      <div class="row"><button type="button" class="btn grow" data-close>Cancelar</button><button type="submit" class="btn primary grow">Guardar</button></div></form>`);
  const el=sh.el;let feel=s.feel||0;
  KP.$$('[data-chips] .chip',el).forEach(c=>c.onclick=()=>{const box=c.parentElement,on=c.getAttribute('aria-pressed')==='true';KP.$$('.chip',box).forEach(x=>x.setAttribute('aria-pressed','false'));c.setAttribute('aria-pressed',String(!on));});
  KP.$$('#dfFeel button',el).forEach(b=>b.onclick=()=>{feel=+b.dataset.v;KP.$$('#dfFeel button',el).forEach(x=>x.setAttribute('aria-pressed',x===b));});
  KP.$('#dfForm',el).onsubmit=e=>{e.preventDefault();const err=KP.$('#dfErr',el);err.hidden=true;
    const pick=n=>{const c=KP.$(`[data-chips="${n}"] .chip[aria-pressed="true"]`,el);return c?c.textContent:'';};
    if(manual){const best=KP.parseTime(KP.$('#dfBest',el).value),avg=KP.parseTime(KP.$('#dfAvg',el).value),n=KP.$('#dfLaps',el).value;
      if(KP.$('#dfBest',el).value&&best==null||KP.$('#dfAvg',el).value&&avg==null){err.textContent='Tempo inválido. Usa m:ss.mmm (1:02.345) ou segundos (62.345).';err.hidden=false;return;}
      if(best!=null&&avg!=null&&avg<best){err.textContent='A média não pode ser mais rápida do que a melhor volta.';err.hidden=false;return;}
      s.manual={laps:n===''?0:Math.max(0,parseInt(n,10)||0),bestMs:best,avgMs:avg};
      const dd=KP.$('#dfDate',el).value;if(dd){const nd=KP.fromKey(dd);nd.setHours(12);s.date=nd.getTime();}}
    Object.assign(s,{track:KP.$('#dfTrack',el).value.trim(),kart:KP.$('#dfKart',el).value.trim(),weather:pick('weather'),trackCond:pick('trackCond'),feel,
      feelText:KP.$('#dfFeelT',el).value.trim(),good:KP.$('#dfGood',el).value.trim(),improve:KP.$('#dfImp',el).value.trim(),notes:KP.$('#dfNotes',el).value.trim()});
    S.saveSession(s);sh.close();ui.toast(isNew?'Entrada guardada no diário':'Diário atualizado');done&&done(s);};
};

/* comparação de duas sessões */
KP.openCompare=(aId,bId)=>KP.app.push('Comparar sessões',(b)=>{
  const list=S.sessions();let A=S.session(aId)||list[1],B=S.session(bId)||list[0];
  const opt=sel=>list.map(s=>`<option value="${esc(s.id)}" ${s.id===sel.id?'selected':''}>${esc(KP.fmtDate(s.date))} · ${esc(s.track||'—')} · ${KP.fmtTime(KP.sessionStats(s).best)}</option>`).join('');
  const sa=KP.sessionStats(A),sb=KP.sessionStats(B);
  const row=(label,va,vb,fmt,lowerBetter=true)=>{const d=va!=null&&vb!=null?vb-va:null;const better=d==null?'':(lowerBetter?d<0:d>0)?'good':d===0?'':'warn';
    return`<tr><td>${label}</td><td>${fmt(va)}</td><td>${fmt(vb)}</td><td class="${better}">${d==null?'—':(d>0?'+':d<0?'−':'')+fmt(Math.abs(d))}</td></tr>`;};
  b.innerHTML=`<div class="grid2"><div class="field"><label for="cA"><i style="display:inline-block;width:14px;height:2px;background:${ui.C.red};vertical-align:middle;margin-right:6px"></i>Sessão A</label><select id="cA">${opt(A)}</select></div>
    <div class="field"><label for="cB"><i style="display:inline-block;width:14px;height:2px;background:${ui.C.blue};vertical-align:middle;margin-right:6px"></i>Sessão B</label><select id="cB">${opt(B)}</select></div></div>
    ${A.track!==B.track?`<div class="note">Circuitos diferentes (${esc(A.track||'—')} e ${esc(B.track||'—')}): os tempos não são diretamente comparáveis.</div>`:''}
    <div class="card"><div class="tbl-wrap"><table><thead><tr><th></th><th>A</th><th>B</th><th>B − A</th></tr></thead><tbody>
      ${row('Melhor volta',sa.best,sb.best,KP.fmtTime)}${row('Média',sa.avg,sb.avg,KP.fmtTime)}${row('Mediana',sa.median,sb.median,KP.fmtTime)}
      ${row('Desvio',sa.std,sb.std,v=>v==null?'—':(v/1000).toFixed(2)+' s')}${row('Voltas',sa.count,sb.count,v=>v==null?'—':String(Math.round(v)),false)}
      ${row('A 1% da melhor',sa.within1,sb.within1,v=>v==null?'—':Math.round(v*100)+'%',false)}</tbody></table></div></div>
    <div class="card"><div class="card-h"><h3>Volta a volta</h3><span class="small muted">menor é melhor</span></div><div id="cChart"></div></div>`;
  const pts=s=>(s.laps||[]).map((l,i)=>({l,i})).filter(o=>o.l.valid!==false&&!o.l.outlap).map(o=>({x:o.i+1,y:o.l.ms,xl:'Volta '+(o.i+1)}));
  ui.lineChart(KP.$('#cChart',b),{series:[{name:'A · '+KP.fmtDate(A.date),color:ui.C.red,points:pts(A)},{name:'B · '+KP.fmtDate(B.date),color:ui.C.blue,points:pts(B)}],yFmt:(v,tick)=>KP.fmtTime(v,{dec:tick?1:3}),xFmt:x=>'V'+x,xName:'Volta',label:'Comparação volta a volta'});
  const re=()=>{const a=KP.$('#cA',b).value,bb=KP.$('#cB',b).value;KP.app.pop(true);KP.openCompare(a,bb);};
  KP.$('#cA',b).onchange=re;KP.$('#cB',b).onchange=re;
});
KP.exportMenu=()=>{
  const sh=ui.sheet(`<h3>Exportar registos</h3><p class="small muted" style="margin:0">Os dados nunca saem do telemóvel sem seres tu a exportá-los.</p>
    <button class="btn block" data-x="ses">Sessões (CSV)</button><button class="btn block" data-x="laps">Todas as voltas (CSV)</button>
    <button class="btn block" data-x="drills">Treinos de reflexos e concentração (CSV)</button><button class="btn block" data-x="json">Cópia de segurança completa (JSON)</button>
    <button class="btn ghost block" data-close>Fechar</button>`);
  KP.$$('[data-x]',sh.el).forEach(b=>b.onclick=()=>{sh.close();const x=b.dataset.x,d=KP.dayKey();
    if(x==='ses')KP.exportText(`karting-pro-sessoes-${d}.csv`,S.exportSessionsCSV());
    if(x==='laps')KP.exportText(`karting-pro-voltas-${d}.csv`,S.exportLapsCSV());
    if(x==='drills')KP.exportText(`karting-pro-treinos-${d}.csv`,S.exportDrillsCSV());
    if(x==='json')KP.exportText(`karting-pro-copia-${d}.json`,S.exportJSON(),'application/json');});
};
})(window);
