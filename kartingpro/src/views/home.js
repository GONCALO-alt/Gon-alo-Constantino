'use strict';
/* KARTING PRO · Início (dashboard) */
(function(g){
const KP=g.KP,ui=KP.ui,S=KP.store,esc=KP.esc;
function onboarding(el){
  el.innerHTML=`<div class="card" style="gap:14px">
    <div class="slogan">TRAIN. <b>IMPROVE.</b> RACE.</div>
    <h1 style="font-size:30px;font-weight:900;font-style:italic">Bem-vindo ao KARTING PRO</h1>
    <p class="muted" style="margin:0">O teu centro de treino: cronómetro de voltas, reflexos, concentração, diário e evolução. Sem conta: os dados ficam guardados só neste telemóvel.</p>
    <form id="obForm" style="display:flex;flex-direction:column;gap:12px">
      <div class="field"><label for="obName">Nome do piloto</label><input id="obName" required maxlength="40" autocomplete="nickname" placeholder="Ex.: Gonçalo"></div>
      <div class="grid2"><div class="field"><label for="obKart">Kart (opcional)</label><input id="obKart" maxlength="40" placeholder="Ex.: Sodi RT10"></div>
      <div class="field"><label for="obTrack">Kartódromo habitual</label><input id="obTrack" maxlength="50" placeholder="Ex.: Kartódromo de Évora"></div></div>
      <button class="btn primary block" type="submit">Começar</button>
    </form></div>`;
  KP.$('#obForm',el).onsubmit=e=>{e.preventDefault();const name=KP.$('#obName',el).value.trim();if(!name)return;
    S.setProfile({name,kart:KP.$('#obKart',el).value.trim(),homeTrack:KP.$('#obTrack',el).value.trim()});KP.app.render();ui.toast('Perfil criado');};
}
/* circuito mais usado: as voltas só se comparam dentro do mesmo circuito */
KP.mainTrack=()=>S.tracks()[0]||null;
KP.bestAt=track=>{let best=null,ses=null;S.sessions().filter(s=>s.track===track).forEach(s=>{const b=KP.sessionStats(s).best;if(b!=null&&(best==null||b<best)){best=b;ses=s;}});return{best,ses};};
KP.app.view('inicio',{render(el){
  const p=S.profile();if(!p.name){onboarding(el);return;}
  const d=S.raw(),lv=KP.levelOf(d.xp.total),ses=S.sessions(),laps=ses.reduce((a,s)=>a+KP.sessionStats(s).count,0);
  const mt=KP.mainTrack(),bt=mt?KP.bestAt(mt):{best:null},light=S.drills('light'),last5=light.slice(-5).map(x=>x.avg).filter(v=>v!=null);
  const live=S.live(),lastS=ses[0],ls=lastS?KP.sessionStats(lastS):null,today=KP.today(),streak=KP.streak();
  el.innerHTML=`
  <section class="hello">${ui.avatar(p,'avatar lg')}<div style="min-width:0;flex:1">
    <div class="eyebrow">${esc(lv.name)} · nível ${lv.index+1} de 5</div><h1>${esc(p.name)}</h1>
    <div class="lvl"><div class="bar" role="progressbar" aria-valuenow="${Math.round(lv.progress*100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.round(lv.progress*100)}%"></i></div>
    <div class="row small"><span class="num">${KP.fmtInt(d.xp.total)} XP</span><span class="grow"></span><span class="muted">${lv.next?`${KP.fmtInt(lv.next-d.xp.total)} XP para ${lv.nextName}`:'Nível máximo'}</span></div></div></div></section>
  <button class="quick" id="qTimer"><span><span class="t">${live?'SESSÃO EM CURSO':'CRONÓMETRO'}</span><br><span class="s">${live?`${(live.sw.laps||[]).length} voltas · toca para voltar`:'Iniciar uma sessão de voltas'}</span></span>${ui.icon.play}</button>
  <section class="tiles">
    ${ui.tile('Sessões',KP.fmtInt(ses.length),ses.length?`${KP.fmtInt(laps)} voltas registadas`:'Ainda sem sessões')}
    ${ui.tile('Melhor volta',bt.best!=null?KP.fmtTime(bt.best):'—',mt?esc(mt):'Usa o cronómetro',bt.best!=null)}
    ${ui.tile('Reação média',last5.length?Math.round(KP.mean(last5))+' ms':'—',last5.length?`últimos ${last5.length} testes`:'Faz um teste no Treino')}
    ${ui.tile('Sequência',`${streak} ${streak===1?'dia':'dias'}`,streak?'dias seguidos com atividade':'Treina hoje para começar')}
  </section>
  <section class="card"><div class="card-h"><h3>Última sessão</h3>${ses.length?'<button class="link" id="allS">Todas</button>':''}</div>
    ${lastS?`<button class="li" id="lastS" style="border:0;padding:0"><div style="min-width:0"><div class="t">${esc(lastS.track||'Sem circuito')}</div><div class="d">${KP.relDay(lastS.date)} · ${ls.count} voltas${lastS.kart?' · '+esc(lastS.kart):''}</div></div>
      <div class="r"><div class="num" style="font-size:20px">${KP.fmtTime(ls.best)}</div><div class="d">média ${KP.fmtTime(ls.avg)}</div></div><span class="chev">›</span></button>`
      :ui.empty('Ainda não há sessões','Usa o cronómetro no kartódromo ou regista uma sessão no Diário.')}</section>
  <section class="card"><div class="card-h"><h3>Desafios de hoje</h3><span class="small muted">${today.list.filter(x=>x.done).length}/3${today.bonus?' · bónus ganho':''}</span></div>
    <div>${today.list.map(c=>{const def=KP.CHALLENGES[c.id];return`<div class="chal ${c.done?'done':''}"><span class="ck">${c.done?'✓':''}</span><span class="t">${esc(def.text)}</span><span class="xp">+${def.xp} XP</span></div>`;}).join('')}</div>
    <p class="small muted" style="margin:0">Completa os 3 para ganhar +30 XP. Os desafios mudam todos os dias.</p></section>
  <section class="card" id="evo"><div class="card-h"><h3>Evolução</h3><button class="link" id="goStats">Estatísticas</button></div></section>
  <div class="slogan" style="text-align:center;padding:6px 0">TRAIN. <b>IMPROVE.</b> RACE.</div>`;
  KP.$('#qTimer',el).onclick=()=>KP.app.go('cronometro');
  if(lastS)KP.$('#lastS',el).onclick=()=>KP.openSession(lastS.id);
  const all=KP.$('#allS',el);if(all)all.onclick=()=>KP.openSessionList();
  KP.$('#goStats',el).onclick=()=>KP.app.go('estatisticas');
  // evolução: só dados reais
  const evo=KP.$('#evo',el);const rows=[];
  if(mt){const s=ses.filter(x=>x.track===mt&&KP.sessionStats(x).best!=null).reverse().slice(-10),v=s.map(x=>KP.sessionStats(x).best);
    if(v.length>=2){const dl=v[v.length-1]-v[0];rows.push(`<div class="row"><div class="grow"><div class="small muted">Melhor volta em ${esc(mt)} (${v.length} sessões)</div><div class="num" style="font-size:18px">${KP.fmtTime(v[v.length-1])} <span class="small ${dl<0?'good':'warn'}">${KP.fmtDelta(dl)} desde a 1.ª</span></div></div>${ui.spark(v)}</div>`);}}
  const lv10=light.slice(-10).map(x=>x.avg).filter(x=>x!=null);
  if(lv10.length>=2){const dl=lv10[lv10.length-1]-lv10[0];rows.push(`<div class="row"><div class="grow"><div class="small muted">Reação à luz (média por teste)</div><div class="num" style="font-size:18px">${Math.round(lv10[lv10.length-1])} ms <span class="small ${dl<0?'good':'warn'}">${dl<0?'−':'+'}${Math.abs(Math.round(dl))} ms</span></div></div>${ui.spark(lv10)}</div>`);}
  evo.insertAdjacentHTML('beforeend',rows.length?rows.join(''):ui.empty('Ainda sem evolução','Com 2 sessões no mesmo circuito ou 2 testes de reflexos, a tendência aparece aqui.'));
}});
})(window);
