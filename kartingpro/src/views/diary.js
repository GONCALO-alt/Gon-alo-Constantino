'use strict';
/* KARTING PRO · Diário: calendário dos dias de treino e registo de cada ida ao kartódromo */
(function(g){
const KP=g.KP,ui=KP.ui,S=KP.store,esc=KP.esc;
let month=new Date(),dayFilter=null;
KP.app.view('diario',{render(el){
  const ses=S.sessions(),marks={};
  ses.forEach(s=>{const k=KP.dayKey(s.date);(marks[k]=marks[k]||{}).kart=true;});
  S.drills().forEach(d=>{const k=KP.dayKey(d.date);(marks[k]=marks[k]||{}).train=true;});
  const list=dayFilter?ses.filter(s=>KP.dayKey(s.date)===dayFilter):ses;
  el.innerHTML=`
  <button class="btn primary block" id="dyNew">+ Nova entrada no diário</button>
  <section class="card"><div id="dyCal"></div>
    <div class="legend" style="margin-top:4px"><span><i class="sq" style="background:var(--red)"></i>Sessão de karting</span><span><i class="sq" style="background:var(--fg-2);border-radius:50%;width:6px;height:6px"></i>Treino na app</span></div></section>
  <section class="card"><div class="card-h"><h3>${dayFilter?esc(KP.fmtDateLong(KP.fromKey(dayFilter))):'Todas as sessões'}</h3>${dayFilter?'<button class="link" id="dyAll">Ver todas</button>':`<span class="small muted">${ses.length}</span>`}</div>
    <div class="list" id="dyList"></div></section>`;
  ui.calendar(KP.$('#dyCal',el),month,marks,k=>{dayFilter=k;month=KP.fromKey(k);KP.app.refresh();});
  // manter o mês escolhido quando se navega no calendário
  KP.$$('#dyCal [data-m]',el).forEach(b=>b.addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()+ +b.dataset.m,1);},{capture:true}));
  const box=KP.$('#dyList',el);
  if(list.length){box.innerHTML=list.map(s=>{const st=KP.sessionStats(s);return`<button class="li" data-sid="${esc(s.id)}"><div style="min-width:0">
      <div class="t">${esc(s.track||'Sem circuito')} <span class="small muted">${KP.fmtDate(s.date)}</span></div>
      <div class="d">${st.count} voltas · melhor ${KP.fmtTime(st.best)}${s.weather?' · '+esc(s.weather):''}${s.feel?' · '+KP.FEEL[s.feel]:''}</div>
      ${s.improve?`<div class="d" style="color:var(--fg-2)">A melhorar: ${esc(s.improve.length>70?s.improve.slice(0,70)+'…':s.improve)}</div>`:''}</div><span class="chev">›</span></button>`;}).join('');
    KP.$$('[data-sid]',box).forEach(b=>b.onclick=()=>KP.openSession(b.dataset.sid));}
  else box.innerHTML=dayFilter?ui.empty('Sem sessões neste dia','Podes criar uma entrada para este dia.',`<button class="btn" id="dyAdd">Registar sessão neste dia</button>`)
    :ui.empty('O diário está vazio','Cada sessão do cronómetro aparece aqui. Também podes registar uma sessão à mão.');
  KP.$('#dyNew',el).onclick=()=>KP.editDiary(null,()=>KP.app.refresh());
  const all=KP.$('#dyAll',el);if(all)all.onclick=()=>{dayFilter=null;KP.app.refresh();};
  const add=KP.$('#dyAdd',el);if(add)add.onclick=()=>KP.editDiary(null,s=>{dayFilter=KP.dayKey(s.date);KP.app.refresh();});
  if(add){/* data por omissão = dia escolhido */add.onclick=()=>{KP.editDiary(null,s=>{KP.app.refresh();});const di=KP.$('#dfDate');if(di)di.value=dayFilter;};}
}});
})(window);
