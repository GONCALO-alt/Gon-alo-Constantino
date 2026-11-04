'use strict';
/* Pit Box · Ecrãs e menus */
/* ---------------- UI GERAL ---------------- */
const SCREENS=['s-menu','s-career','s-quick','s-locker','s-stats','hud','s-result'];
let screen='s-menu';
function show(id){SCREENS.forEach(s=>$('#'+s).hidden=s!==id);screen=id;
  if(id==='s-menu'){renderMenu();Cam.mode='menu';}
  if(id==='s-career'){renderCareer();Cam.mode='garageView';camTo(V(-1,2.2,-4.5),V(1,.7,0),2);}
  if(id==='s-quick'){renderQuick();Cam.mode='garageView';camTo(V(5.5,1.4,-3.8),V(0,.5,0),2);}
  if(id==='s-locker'){renderLocker();Cam.mode='locker';camTo(POSE.locker[0],POSE.locker[1],2.5);}
  if(id==='s-stats'){renderStats();Cam.mode='garageView';camTo(V(-3,3.2,5.5),V(0,.4,0),2);}
}
function toast(msg,cls='',ms){const el=document.createElement('div');el.className='tst '+cls;el.textContent=msg;const box=$('#toast');box.appendChild(el);while(box.children.length>2)box.firstChild.remove();setTimeout(()=>el.remove(),ms||1500);}
function vibrate(p){try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}}
function modal(html){const m=$('#modal');m.innerHTML=`<div class="card">${html}</div>`;m.hidden=false;return m;}
function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML='';}
function stars(n,max=5){return`<span class="stars" aria-label="${n} de ${max}">${'★'.repeat(n)}<span class="off">${'★'.repeat(max-n)}</span></span>`;}
function diffSeg(id){return`<div><div class="eyebrow" style="margin-bottom:6px">Dificuldade</div><div class="seg" id="${id}">${Object.entries(DIFF).map(([k,d])=>`<button data-d="${k}" style="--dc:${d.col}" aria-pressed="${P.settings.difficulty===k}">${d.name}</button>`).join('')}</div><p class="diff-note" id="${id}-note">${DIFF[P.settings.difficulty].note}</p></div>`;}
function bindDiff(id){$('#'+id).addEventListener('click',e=>{const b=e.target.closest('button[data-d]');if(!b)return;P.settings.difficulty=b.dataset.d;save();Snd.click();
  $('#'+id).querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#'+id+'-note').textContent=DIFF[b.dataset.d].note;});}

function renderMenu(){
  $('#mLvl').textContent=P.level;$('#mXp').style.width=(P.xp/xpNeed(P.level)*100).toFixed(0)+'%';
  $('#mCr').textContent=P.credits+' cr';const t=teamById(P.career.teamId);$('#mTeam').textContent=t.name+' · '+CATS[t.cat].name;
  $('#tSound').setAttribute('aria-pressed',P.settings.sound);$('#tVoice').setAttribute('aria-pressed',P.settings.voice);
  previewCar(t);
}
function renderCareer(){
  const C=P.career,t=teamById(C.teamId),cat=CATS[t.cat];
  const circ=CIRCUITS[(C.season*3+C.round)%CIRCUITS.length];
  const conf=C.scores.length?Math.round(C.scores.slice(-3).reduce((a,b)=>a+b,0)/Math.min(3,C.scores.length)/10):0;
  const week=C.round*2+1;
  $('#s-career').innerHTML=`
  <div class="ph"><button class="back" data-go="s-menu" aria-label="Voltar">←</button><h2>Carreira</h2></div>
  <div class="card team-card" style="--tc1:${hex(t.c1)};--tc2:${hex(t.c2)}">
    <div class="eyebrow">A tua equipa · ${cat.name}</div><h3>${esc(t.name)}</h3>
    <div style="margin-top:6px">${stars(t.tier,maxTier(t.cat))}</div>
    <dl class="kv"><dt>Confiança da equipa</dt><dd>${conf}%</dd><dt>Pontos da equipa (época)</dt><dd class="num">${C.teamPoints}</dd><dt>Corridas nesta equipa</dt><dd class="num">${C.racesInTeam}</dd><dt>A tua função</dt><dd>${cat.wheels===1?'1 roda':'2 rodas'}</dd></dl>
    <div class="bar" style="margin-top:10px"><i style="width:${conf}%;background:${hex(t.c1)}"></i></div>
  </div>
  ${C.offers.map((o,i)=>{const ot=teamById(o.teamId);return`<div class="card offer"><div class="eyebrow" style="color:var(--pit)">Nova proposta</div><h3 style="font-size:24px;margin-top:4px">${esc(ot.name)}</h3><div style="font-size:14px;color:var(--muted);margin-top:4px">${CATS[ot.cat].name} · ${stars(ot.tier,maxTier(ot.cat))}</div><div class="row"><button class="btn small primary" data-acc="${i}">Aceitar</button><button class="btn small" data-dec="${i}">Recusar</button></div></div>`;}).join('')}
  <div class="card">
    <div class="eyebrow">Época ${C.season} · Ronda ${C.round+1} de ${ROUNDS}</div>
    <h3 style="font-size:26px;margin-top:4px">GP de ${esc(circ.n)}</h3>
    <div style="color:var(--muted);font-size:14px">${esc(circ.c)} · Semana ${week} · Domingo</div>
    <div class="cal">${Array.from({length:ROUNDS},(_,i)=>`<span class="${i<C.round?'done':i===C.round?'now':''}">R${i+1}</span>`).join('')}</div>
  </div>
  ${diffSeg('cDiff')}
  <button class="btn primary" id="goRace">Ir para a garagem</button>
  ${C.history.length?`<div class="card"><div class="eyebrow">Últimas corridas</div><ul class="list">${C.history.slice(-5).reverse().map(h=>`<li><span>${esc(h.circ)} · ${h.cat}</span><b>${f2(h.time)} s · P${h.fin}</b></li>`).join('')}</ul></div>`:''}
  <p style="font-size:13px;color:var(--muted);margin:0">Bons resultados aumentam a confiança da equipa. Com confiança alta chegam propostas de equipas melhores e, no topo, de categorias superiores.</p>`;
  bindDiff('cDiff');
  $('#goRace').onclick=()=>{Snd.init();Snd.ui();startRace({mode:'career',team:t,cat,diff:P.settings.difficulty,circuit:circ});};
  $('#s-career').querySelectorAll('[data-acc]').forEach(b=>b.onclick=()=>{acceptOffer(+b.dataset.acc);});
  $('#s-career').querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{P.career.offers.splice(+b.dataset.dec,1);save();Snd.click();renderCareer();});
  previewCar(t);
}
function acceptOffer(i){
  const o=P.career.offers[i];if(!o)return;const nt=teamById(o.teamId);
  P.career.teamId=nt.id;P.career.racesInTeam=0;P.career.scores=[];P.career.offers=[];
  if(!P.career.catsReached.includes(nt.cat))P.career.catsReached.push(nt.cat);
  save();Snd.good();Snd.crowd(.6,2.5);toast('Bem-vindo à '+nt.name+'!','good',2200);renderCareer();
}
function renderQuick(){
  const sel=P.settings.quickCat&&catUnlocked(P.settings.quickCat)?P.settings.quickCat:'F4';
  const cats=Object.values(CATS).sort((a,b)=>a.order-b.order);
  $('#s-quick').innerHTML=`
  <div class="ph"><button class="back" data-go="s-menu" aria-label="Voltar">←</button><h2>Corrida rápida</h2></div>
  <div class="cats">${cats.map(c=>{const u=catUnlocked(c.id);return`<button class="cat ${u?'':'locked'}" data-cat="${c.id}" aria-pressed="${c.id===sel}" ${u?'':'disabled'}><span class="badge">${c.id}</span><span style="min-width:0"><b>${c.name}</b><p>${u?esc(c.crew):'🔒 Desbloqueia no nível '+c.unlockLvl+' ou na carreira'}</p></span></button>`;}).join('')}</div>
  ${diffSeg('qDiff')}
  <button class="btn primary" id="goQuick">Começar</button>`;
  bindDiff('qDiff');
  $('#s-quick').querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{P.settings.quickCat=b.dataset.cat;save();Snd.click();renderQuick();});
  $('#goQuick').onclick=()=>{Snd.init();Snd.ui();const cat=CATS[sel];const ct=teamById(P.career.teamId);
    const team=ct.cat===cat.id?ct:pick(tiersOf(cat.id).filter(t=>t.tier>=3)||tiersOf(cat.id));
    startRace({mode:'quick',team,cat,diff:P.settings.difficulty,circuit:pick(CIRCUITS)});};
  previewCar(teamById(P.career.teamId).cat===sel?teamById(P.career.teamId):tiersOf(sel)[tiersOf(sel).length-1],sel);
}
let lockerTab='suit';
function renderLocker(){
  const items=COSM[lockerTab];
  $('#s-locker').innerHTML=`
  <div class="ph" style="background:none"><button class="back" data-go="s-menu" aria-label="Voltar">←</button><h2>Mecânico</h2><span class="credits">${P.credits} cr</span></div>
  <div class="locker-spacer"></div>
  <div style="display:flex;flex-direction:column;gap:10px;overflow-y:auto;padding-bottom:16px;min-height:0">
  <div class="tabs">${COSM_TABS.map(([k,n])=>`<button data-tab="${k}" aria-pressed="${k===lockerTab}">${n}</button>`).join('')}</div>
  <div class="items">${items.map(it=>{const own=cosmOwned(lockerTab,it),on=P.cosm[lockerTab]===it.id;const team=teamById(P.career.teamId);
    const col=lockerTab==='suit'?(it.base??team.c1):(it.c??team.c2);const acc=lockerTab==='suit'?(it.acc??team.c2):null;const price=it.lvl*120;
    return`<button class="item ${on?'on':''} ${own?'':'locked'}" data-it="${it.id}"><div class="sw" style="background:${acc!=null?`linear-gradient(90deg,${hex(col)} 70%,${hex(acc)} 70%)`:hex(col)}"></div><b>${esc(it.name)}</b><small>${on?'Equipado':own?(it.desc||'Tocar para equipar'):`🔒 Nível ${it.lvl} · ou ${price} cr`}</small></button>`;}).join('')}</div>
  <p style="font-size:13px;color:var(--muted);margin:0">Tudo se desbloqueia ao subir de nível. Se quiseres algo mais cedo, podes usar os créditos ganhos nas corridas.</p></div>`;
  $('#s-locker').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{lockerTab=b.dataset.tab;Snd.click();renderLocker();});
  $('#s-locker').querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{
    const it=COSM[lockerTab].find(x=>x.id===b.dataset.it);
    if(cosmOwned(lockerTab,it)){P.cosm[lockerTab]=it.id;save();Snd.ui();}
    else{const price=it.lvl*120;
      if(P.credits>=price){modal(`<h3>Comprar ${esc(it.name)}?</h3><p>Custa ${price} créditos. Tens ${P.credits}.</p><div class="m-row"><button class="btn small primary" id="mYes">Comprar</button><button class="btn small" id="mNo">Cancelar</button></div>`);
        $('#mYes').onclick=()=>{P.credits-=price;P.cosm.bought.push(lockerTab+':'+it.id);P.cosm[lockerTab]=it.id;save();closeModal();Snd.good();applyPlayerLook(teamById(P.career.teamId));renderLocker();};$('#mNo').onclick=closeModal;}
      else{toast(`Nível ${it.lvl} ou ${price} cr`,'warn');Snd.error();}}
    applyPlayerLook(teamById(P.career.teamId));renderLocker();});
}
function renderStats(){
  const S=P.stats;const avg=S.total?S.sumTime/S.total:0;
  let bestAll=null;Object.entries(S.best).forEach(([k,v])=>{if(!bestAll||v.t<bestAll.t)bestAll=Object.assign({k},v);});
  const rows=Object.values(CATS).sort((a,b)=>a.order-b.order).map(c=>`<tr><td>${c.id}</td>${Object.keys(DIFF).map(d=>{const b=S.best[c.id+'_'+d];return`<td>${b?f2(b.t):'—'}</td>`;}).join('')}</tr>`).join('');
  const topErr=Object.entries(S.errTypes).sort((a,b)=>b[1]-a[1]).slice(0,4);
  $('#s-stats').innerHTML=`
  <div class="ph"><button class="back" data-go="s-menu" aria-label="Voltar">←</button><h2>Estatísticas</h2></div>
  <div class="tiles">
    <div class="tile"><div class="eyebrow">Melhor tempo</div><div class="v">${bestAll?f2(bestAll.t)+' s':'—'}</div><div class="s">${bestAll?bestAll.k.replace('_',' · ').replace('easy','Fácil').replace('medium','Médio').replace('hard','Difícil'):'Ainda sem paragens'}</div></div>
    <div class="tile"><div class="eyebrow">Tempo médio</div><div class="v">${S.total?f2(avg)+' s':'—'}</div><div class="s">todas as categorias</div></div>
    <div class="tile"><div class="eyebrow">Pit stops</div><div class="v">${S.total}</div><div class="s">${S.subPar} abaixo do objetivo</div></div>
    <div class="tile"><div class="eyebrow">Erros</div><div class="v">${S.errors}</div><div class="s">${S.total?f1(S.errors/S.total)+' por paragem':'—'}</div></div>
  </div>
  <div class="card"><div class="eyebrow">Evolução · tempo face ao objetivo</div>${S.stops.length>1?'<canvas id="chart"></canvas><div style="font-size:12px;color:var(--muted)">Abaixo da linha = mais rápido do que o objetivo. Últimas '+Math.min(30,S.stops.length)+' paragens.</div>':'<p class="empty">Faz pelo menos duas paragens para veres a evolução.</p>'}</div>
  <div class="card"><div class="eyebrow">Recordes por categoria (s)</div><div class="tbl-wrap"><table><thead><tr><th>Cat.</th><th>Fácil</th><th>Médio</th><th>Difícil</th></tr></thead><tbody>${rows}</tbody></table></div></div>
  <div class="card"><div class="eyebrow">Recordes pessoais</div><ul class="list">
    <li><span>Melhor pontuação</span><b>${S.bestScore}</b></li>
    <li><span>Mais posições ganhas numa paragem</span><b>${S.maxGain}</b></li>
    <li><span>Paragens limpas seguidas</span><b>${S.bestClean}</b></li>
    <li><span>Apertos perfeitos</span><b>${S.perfect}</b></li>
    <li><span>Vitórias / pódios (carreira)</span><b>${S.wins} / ${S.podiums}</b></li></ul></div>
  ${topErr.length?`<div class="card"><div class="eyebrow">Erros mais frequentes</div><ul class="list">${topErr.map(([k,v])=>`<li><span>${esc(k)}</span><b>${v}</b></li>`).join('')}</ul></div>`:''}
  <button class="btn small" id="resetBtn" style="align-self:center;opacity:.7">Apagar progresso</button>`;
  $('#resetBtn').onclick=()=>{modal(`<h3>Apagar tudo?</h3><p>Perdes nível, carreira, cosméticos e recordes.</p><div class="m-row"><button class="btn small" id="mYes" style="background:var(--alert)">Apagar</button><button class="btn small" id="mNo">Cancelar</button></div>`);
    $('#mYes').onclick=()=>{P=defaultProfile();save();closeModal();applyPlayerLook(teamById(P.career.teamId));show('s-menu');};$('#mNo').onclick=closeModal;};
  if(S.stops.length>1)drawChart();
}
function drawChart(){
  const cv=$('#chart');const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth,h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;
  const c=cv.getContext('2d');c.scale(dpr,dpr);const data=P.stats.stops.slice(-30).map(s=>s.t/s.par*100);
  const lo=Math.min(60,...data)-5,hi=Math.max(140,...data)+5;const pad=28;
  const X=i=>pad+(w-pad-8)*(data.length===1?.5:i/(data.length-1)),Y=v=>8+(h-26)*(1-(v-lo)/(hi-lo));
  c.font='11px Chakra Petch, monospace';c.fillStyle='#8e96a4';c.strokeStyle='#2f3540';c.lineWidth=1;
  [lo+5,100,hi-5].forEach(v=>{c.beginPath();c.moveTo(pad,Y(v));c.lineTo(w-6,Y(v));c.stroke();c.fillText(Math.round(v)+'%',0,Y(v)+4);});
  c.strokeStyle='#ffc61a';c.setLineDash([4,4]);c.beginPath();c.moveTo(pad,Y(100));c.lineTo(w-6,Y(100));c.stroke();c.setLineDash([]);
  const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(34,211,107,.0)');gr.addColorStop(1,'rgba(34,211,107,.18)');
  c.beginPath();data.forEach((v,i)=>i?c.lineTo(X(i),Y(v)):c.moveTo(X(i),Y(v)));c.strokeStyle='#eef1f5';c.lineWidth=2;c.stroke();
  c.lineTo(X(data.length-1),h-18);c.lineTo(X(0),h-18);c.closePath();c.fillStyle=gr;c.fill();
  data.forEach((v,i)=>{c.beginPath();c.arc(X(i),Y(v),i===data.length-1?4.5:2.5,0,7);c.fillStyle=v<=100?'#22d36b':'#ff3030';c.fill();});
}

/* carro em exibição no menu */
let showCar=null;
function previewCar(team,catId){
  if(R)return;const kind=CATS[catId||team.cat].car;const key=team.id+kind;
  if(showCar&&showCar.userData.key===key)return;
  if(showCar)scene.remove(showCar);
  showCar=makeCar(kind,team.c1,team.c2,'medium');showCar.userData.key=key;scene.add(showCar);
  setTeamLook(team);
}
