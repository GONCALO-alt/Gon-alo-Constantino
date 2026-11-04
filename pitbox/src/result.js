'use strict';
/* Pit Box · Resultado, estatísticas e progressão */
/* ---------------- RESULTADO / PROGRESSÃO ---------------- */
function finishRace(){
  if(!R)return;const r=R,D=r.D;Snd.gunStop();
  const time=raceTime(),par=r.par;
  const errs=r.errors.filter(e=>e.code!=='slow').length,slows=r.errors.length-errs;
  const react=r.reacts.length?r.reacts[0]:null;
  let score=Math.round(1000*clamp(par/time,0,1.35))-errs*45-slows*15+r.perfect*40+(react!==null&&react<.3?40:0);
  score=Math.max(0,Math.round(score*D.mult));
  const grade=score>=1050?'S':score>=900?'A':score>=740?'B':score>=580?'C':'D';
  const delta=clamp(Math.round((par-time)/(par*.09)),-6,5);
  const posAfter=clamp(r.posBefore-delta,1,20);
  const fin=clamp(posAfter+randi(-1,1),1,20);
  const pts=PTS[fin-1]||0;
  const team=r.team;
  const xp=Math.round(score*.3*(1+r.cat.order*.12));
  const cr=Math.round(score*.12*r.cat.payout*(1+team.tier*.12));
  // estatísticas
  const S=P.stats;S.total++;S.errors+=r.errors.length;S.sumTime+=time;
  r.errors.forEach(e=>{const k=e.code==='slow'?'Demasiado lento':e.msg.replace(/!.*$/,'');S.errTypes[k]=(S.errTypes[k]||0)+1;});
  S.stops.push({t:+time.toFixed(2),par,cat:r.cat.id,d:r.diff,e:r.errors.length,s:score,w:r.wx,c:r.circuit.n,date:Date.now()});if(S.stops.length>100)S.stops.shift();
  const sk=measureSkills(r,time);S.stops[S.stops.length-1].a=sk;
  const skd=growSkills(sk,{easy:.7,medium:1,hard:1.2,pro:1.4}[r.diff]||1);
  const gearLoss=gearAfterStop(),gearChk=r.gear.checked;
  const catStops=S.stops.filter(x=>x.cat===r.cat.id),catAvg=avg(catStops.map(x=>x.t));
  const verdict=teamVerdict(grade,r);
  const bk=r.cat.id+'_'+r.diff;const prev=S.best[bk];const rec=!prev||time<prev.t;
  if(rec)S.best[bk]={t:+time.toFixed(2),date:Date.now()};
  if(score>S.bestScore)S.bestScore=score;if(delta>S.maxGain)S.maxGain=delta;
  if(r.errors.length===0){S.clean++;S.bestClean=Math.max(S.bestClean,S.clean);}else S.clean=0;
  if(time<=par)S.subPar++;S.perfect+=r.perfect;
  // carreira
  let offerNew=null,seasonEnd=false;
  if(r.mode==='career'){
    const C=P.career;C.racesInTeam++;C.scores.push(score);if(C.scores.length>6)C.scores.shift();
    C.teamPoints+=pts;C.history.push({circ:r.circuit.n,cat:r.cat.id,time:+time.toFixed(2),fin});if(C.history.length>30)C.history.shift();
    if(fin<=3)S.podiums++;if(fin===1)S.wins++;
    C.round++;if(C.round>=ROUNDS){C.round=0;C.season++;seasonEnd=C.teamPoints;C.teamPoints=0;}
    offerNew=makeOffer();if(offerNew&&!C.offers.find(o=>o.teamId===offerNew.teamId)){C.offers.unshift(offerNew);C.offers=C.offers.slice(0,2);}else offerNew=null;
  }
  // nível
  P.xp+=xp;P.credits+=cr;const unlocks=[];let lvUp=false;
  while(P.xp>=xpNeed(P.level)){P.xp-=xpNeed(P.level);P.level++;lvUp=true;
    Object.entries(COSM).forEach(([k,list])=>list.forEach(it=>{if(it.lvl===P.level)unlocks.push(it.name);}));
    Object.values(CATS).forEach(c=>{if(c.unlockLvl===P.level)unlocks.push(c.name+' (corrida rápida)');});}
  save();
  if(delta>=2||fin<=3)setTimeout(()=>Snd.crowd(fin===1?1.6:1.1,4),300);
  // ecrã
  cleanupRace();previewCar(r.team,r.cat.id);Cam.mode='menu';
  const errList=r.errors.map(e=>`<li><span>${esc(e.msg)}</span><b>${e.pen?'+'+f2(e.pen)+' s':'—'}</b></li>`).join('');
  const evs=[...r.events].map(e=>EVENTS[e]);
  const gradeTxt={S:'Paragem de campeões!',A:'Excelente trabalho',B:'Boa paragem',C:'Pode melhorar',D:'Paragem difícil'}[grade];
  $('#s-result').innerHTML=`
  <div class="res-head">
    <div class="eyebrow">${esc(r.circuit.n)} · ${r.cat.name} · ${D.name}</div>
    <div class="res-time">${f2(time)}<span style="font-size:28px"> s</span></div>
    <div style="color:var(--muted);font-size:14px">Objetivo ${f1(par)} s · ${time<=par?'<span class="up">−'+f2(par-time)+' s</span>':'<span class="down">+'+f2(time-par)+' s</span>'}</div>
    <div class="grade ${grade}">${grade}</div>
    <div style="font-family:var(--f-display);font-weight:800;font-size:20px;text-transform:uppercase;margin-top:4px">${gradeTxt}</div>
    ${rec?'<div class="record">★ NOVO RECORDE PESSOAL</div>':''}
  </div>
  <div class="card"><div class="eyebrow">Relatório da paragem</div>
    <div class="tiles" style="margin-top:8px">
      <div class="tile"><div class="eyebrow">Melhor pessoal</div><div class="v">${S.best[bk]?f2(S.best[bk].t):'—'}</div><div class="s">${r.cat.id} · ${D.name}</div></div>
      <div class="tile"><div class="eyebrow">Média ${r.cat.id}</div><div class="v">${f2(catAvg)}</div><div class="s">${catStops.length} paragens</div></div></div>
    <div class="verdict"><span class="stars">${'★'.repeat(verdict.stars)}<span class="off">${'★'.repeat(5-verdict.stars)}</span></span><p>“${esc(verdict.text)}”<small> · Chefe de equipa</small></p></div></div>
  ${skillsHTML(sk,skd)}
  ${timeLossHTML(r)}
  <div class="card"><div class="eyebrow" style="text-align:center">Corrida</div>
    <div class="pos-change"><span>P${r.posBefore}</span><span class="arrow ${delta>0?'up':delta<0?'down':''}">${delta>0?'▲ '+delta:delta<0?'▼ '+(-delta):'='}</span><span>P${posAfter}</span></div>
    <div style="text-align:center;color:var(--muted);font-size:14px">Resultado final: <b style="color:var(--fg)">P${fin}</b>${pts?` · ${pts} pontos`:''}${seasonEnd!==false?`<br>Fim da época! A equipa somou ${seasonEnd} pontos.`:''}</div></div>
  ${react!==null?`<div class="card"><div class="eyebrow">Pistoleiro</div><ul class="list"><li><span>Tempo de reação ao encaixe da roda</span><b>${f2(react)} s</b></li></ul></div>`:''}
  <div class="card"><div class="eyebrow">Erros (${r.errors.length})</div>${r.errors.length?`<ul class="list errs">${errList}</ul>`:'<p class="empty" style="color:var(--go)">Paragem limpa, sem erros.</p>'}
    ${evs.length?`<div class="eyebrow" style="margin-top:12px">Imprevistos</div><ul class="list">${evs.map(e=>`<li><span>${esc(e)}</span></li>`).join('')}</ul>`:''}</div>
  <div class="card"><div class="eyebrow">Equipamento e condições</div><ul class="list">
    <li><span>Pistola</span><b>${P.gear.cond}% (−${gearLoss})</b></li>
    <li><span>Verificações</span><b>${['pressure','test','hose'].filter(k=>gearChk[k]).length}/3</b></li>
    ${r.usedSpare?'<li><span>Pistola de reserva usada</span><b>sim</b></li>':''}
    <li><span>Condições</span><b>${WEATHER[r.wx].icon} ${WEATHER[r.wx].name} · ${r.temp}°C</b></li>
    <li><span>Pneus montados</span><b>${COMPOUND[r.picked||r.newCompound].name}</b></li></ul>
    ${P.gear.cond<50?'<p class="muted" style="margin:8px 0 0">A pistola precisa de manutenção: faz-a na garagem antes da próxima corrida (Ferramentas) ou no Mecânico › Oficina.</p>':''}</div>
  <div class="rewards"><div class="tile"><div class="eyebrow">Pontuação</div><div class="v">${score}</div></div><div class="tile"><div class="eyebrow">XP</div><div class="v">+${xp}</div></div><div class="tile"><div class="eyebrow">Créditos</div><div class="v">+${cr}</div></div></div>
  ${lvUp?`<div class="card unlock"><div class="eyebrow" style="color:var(--go)">Subiste para o nível ${P.level}</div>${unlocks.length?`<ul class="list">${unlocks.map(u=>`<li><span>🔓 ${esc(u)}</span></li>`).join('')}</ul>`:''}</div>`:''}
  <div class="row2"><button class="btn primary" id="rCont">${r.mode==='career'?'Carreira':'Continuar'}</button><button class="btn" id="rAgain">Repetir</button></div>`;
  show('s-result');
  $('#rCont').onclick=()=>{Snd.ui();show(r.mode==='career'?'s-career':'s-quick');};
  $('#rAgain').onclick=()=>{Snd.ui();if(r.mode==='career'){const t=teamById(P.career.teamId);startRace({mode:'career',team:t,cat:CATS[t.cat],diff:P.settings.difficulty,circuit:CIRCUITS[(P.career.season*3+P.career.round)%CIRCUITS.length]});}
    else startRace({mode:'quick',team:r.team,cat:r.cat,diff:r.diff,circuit:pick(CIRCUITS)});};
  if(offerNew)setTimeout(()=>{const ot=teamById(offerNew.teamId);Snd.beep();
    modal(`<div class="eyebrow" style="color:var(--pit)">📩 Proposta recebida</div><h3>${esc(ot.name)}</h3><p>${CATS[ot.cat].name} · ${stars(ot.tier,maxTier(ot.cat))}<br>O chefe de equipa viu as tuas paragens e quer-te na equipa já na próxima corrida.</p>
      <div class="m-row"><button class="btn small primary" id="mYes">Aceitar</button><button class="btn small" id="mNo">Depois</button></div>`);
    $('#mYes').onclick=()=>{closeModal();acceptOffer(P.career.offers.findIndex(o=>o.teamId===ot.id));show('s-career');};$('#mNo').onclick=closeModal;},900);
}
function makeOffer(){
  const C=P.career;if(C.racesInTeam<2)return null;
  const t=teamById(C.teamId);const sc=C.scores.slice(-3);const avg=sc.reduce((a,b)=>a+b,0)/sc.length;
  const mt=maxTier(t.cat);
  if(t.tier<mt&&avg>=560+t.tier*55){const c=tiersOf(t.cat).filter(x=>x.tier===t.tier+1);if(c.length)return{teamId:pick(c).id};}
  const idx=CAT_PATH.indexOf(t.cat);
  if(t.tier>=mt-1&&avg>=760&&idx>=0&&idx<CAT_PATH.length-1){const c=tiersOf(CAT_PATH[idx+1]).filter(x=>x.tier<=2);return{teamId:pick(c).id};}
  if((t.cat==='F3'||t.cat==='F2')&&avg>=650&&Math.random()<.25){const c=tiersOf('GT3').filter(x=>x.tier>=2&&x.tier<=3);return{teamId:pick(c).id};}
  if(t.cat==='GT3'&&t.tier>=4&&avg>=800){const c=tiersOf('F1').filter(x=>x.tier<=2);return{teamId:pick(c).id};}
  return null;
}
function cleanupRace(){
  if(!R)return;Snd.gunStop();Snd.ambience(false);if(R.eng){R.eng.stop();}
  scene.remove(R.car);scene.remove(R.crew);scene.remove(R.gcrew);W.fp.visible=false;W.debris=null;
  if(W.carry)W.carry.visible=false;if(W.placed)W.placed.visible=false;W.fetch.forEach(f=>f.g.visible=true);TV.focusUs=false;R=null;
  closeSheet();$('#gbar').hidden=true;$('#choice').hidden=true;$('#posMeter').hidden=true;applyWeather('dry');
  try{speechSynthesis.cancel();}catch(e){}
}
function quitRace(){
  modal(`<h3>Abandonar corrida?</h3><p>O cronómetro não pára. Se saíres, esta paragem não conta para a carreira.</p><div class="m-row"><button class="btn small" id="mYes" style="background:var(--alert)">Abandonar</button><button class="btn small primary" id="mNo">Continuar</button></div>`);
  $('#mYes').onclick=()=>{closeModal();const m=R&&R.mode;cleanupRace();show(m==='career'?'s-career':'s-menu');};$('#mNo').onclick=closeModal;
}
