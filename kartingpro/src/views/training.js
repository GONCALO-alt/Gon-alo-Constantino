'use strict';
/* KARTING PRO · Treino de reflexos e de concentração
   Tempos de reação: instante do toque (event.timeStamp) menos o instante da imagem em que o estímulo
   apareceu (requestAnimationFrame). Precisão típica: ±1 imagem do ecrã (8–16 ms). */
(function(g){
const KP=g.KP,ui=KP.ui,S=KP.store,esc=KP.esc,F=ui.FLAGS;
const rand=(a,b)=>a+Math.random()*(b-a);
/* mostra um estímulo e devolve (via cb) o instante em que ficou visível */
function onsetAfter(change,cb){requestAnimationFrame(()=>{change();requestAnimationFrame(ts=>cb(g.performance.timeOrigin+ts));});}
let audio=null;
function tone(f,d=.12){if(!S.settings().sound)return;try{audio=audio||new (g.AudioContext||g.webkitAudioContext)();const t=audio.currentTime,o=audio.createOscillator(),gn=audio.createGain();
  o.frequency.value=f;gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(.2,t+.01);gn.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gn);gn.connect(audio.destination);o.start(t);o.stop(t+d+.02);}catch(e){}}

const GAMES={
  light:{cat:'reflex',name:'Reação à luz',icon:'bolt',short:'Toca assim que a luz ficar verde.',
    how:['O ecrã fica cinzento.','Depois de um tempo aleatório aparece a luz verde.','Toca em qualquer sítio o mais depressa possível. Tocar antes conta como antecipação.','5 tentativas.'],
    main:d=>({v:d.avg!=null?Math.round(d.avg)+' ms':'—',label:'Reação média',n:d.avg,lower:true}),run:runLight},
  signals:{cat:'reflex',name:'Reação a sinais',icon:'flag',short:'Reage só à bandeira pedida e ignora as outras.',
    how:['Vão aparecer bandeiras de pista, uma de cada vez.','Toca só quando aparecer a bandeira pedida.','Tocar noutra bandeira é um erro; deixar passar a certa também.','24 bandeiras, cerca de 30 segundos.'],
    main:d=>({v:KP.fmtPct(d.accuracy),label:'Precisão',n:d.accuracy,lower:false}),run:runSignals},
  visual:{cat:'reflex',name:'Reação visual',icon:'eye',short:'Encontra depressa a bandeira pedida na grelha.',
    how:['Em cima aparece a bandeira a encontrar.','Toca nela na grelha o mais depressa possível.','Toques errados contam como erro.','12 rondas, grelha cada vez maior.'],
    main:d=>({v:d.avg!=null?Math.round(d.avg)+' ms':'—',label:'Tempo médio por procura',n:d.avg,lower:true}),run:runVisual},
  memory:{cat:'focus',name:'Memória',icon:'memory',short:'Memoriza a sequência de luzes e repete-a.',
    how:['As luzes acendem numa sequência.','Quando terminar, repete-a pela mesma ordem.','Cada acerto aumenta a sequência numa luz.','Tens 2 vidas.'],
    main:d=>({v:String(d.score??0),label:'Sequência máxima',n:d.score,lower:false}),run:runMemory},
  attention:{cat:'focus',name:'Atenção',icon:'grid',short:'Encontra todas as bandeiras pedidas entre muitas.',
    how:['Aparece uma grelha com várias bandeiras.','Toca em todas as que forem iguais à pedida.','Toques errados contam como erro.','3 rondas, cada uma maior.'],
    main:d=>({v:d.avg!=null?Math.round(d.avg)+' ms':'—',label:'Tempo por bandeira',n:d.avg,lower:true}),run:runAttention},
  identify:{cat:'focus',name:'Identificação rápida',icon:'flag',short:'Escolhe o significado certo de cada bandeira.',
    how:['Aparece uma bandeira de pista.','Escolhe o significado correto entre 4 opções.','Tens 5 segundos por bandeira.','12 bandeiras.'],
    main:d=>({v:KP.fmtPct(d.accuracy),label:'Respostas certas',n:d.accuracy,lower:false}),run:runIdentify},
  sustained:{cat:'focus',name:'Concentração sustentada',icon:'wave',short:'90 segundos: toca quando a bandeira se repete.',
    how:['As bandeiras aparecem uma a uma, cada vez mais depressa.','Toca em IGUAL quando a bandeira for a mesma que a anterior.','Não toques nas outras.','Dura 90 segundos.'],
    main:d=>({v:KP.fmtPct(d.accuracy),label:'Precisão em 90 s',n:d.accuracy,lower:false}),run:runSustained}
};
KP.GAMES=GAMES;

/* ---------- 1. reação à luz ---------- */
function runLight(ar,done){
  const N=5;let trial=0,rts=[],antic=0,lapses=0,state='idle',onset=0,tm=0;
  ar.innerHTML=`<div class="hud"><span id="gN"></span><span id="gA"></span></div><div class="light" id="gL"></div><div class="msg" id="gM"></div><div class="sub">Toca em qualquer sítio do ecrã</div>`;
  const L=KP.$('#gL',ar),M=KP.$('#gM',ar),hud=()=>{KP.$('#gN',ar).textContent=`Tentativa ${Math.min(trial+1,N)}/${N}`;KP.$('#gA',ar).textContent=antic?`Antecipações: ${antic}`:'';};
  const next=()=>{if(trial>=N)return end();state='wait';L.classList.remove('go');ar.classList.remove('full-go','false');M.textContent='Espera pela luz verde…';hud();
    tm=setTimeout(()=>onsetAfter(()=>{L.classList.add('go');ar.classList.add('full-go');M.textContent='AGORA!';},t=>{onset=t;state='go';
      tm=setTimeout(()=>{if(state==='go'){state='done';lapses++;trial++;M.textContent='Demasiado lento';setTimeout(next,900);}},2000);}),rand(1500,4200));};
  ar.onpointerdown=e=>{
    if(state==='wait'){clearTimeout(tm);antic++;state='pen';M.textContent='Antecipação! Espera pelo verde.';ar.classList.add('false');KP.vibrate([60,40,60]);setTimeout(next,1100);return;}
    if(state==='go'){clearTimeout(tm);const rt=KP.eventClock(e)-onset;state='done';rts.push(rt);trial++;tone(880,.08);M.textContent=`${Math.round(rt)} ms`;setTimeout(next,900);}
  };
  const end=()=>{state='end';done({best:KP.min(rts),avg:KP.mean(rts),hits:rts.length,errors:antic+lapses,antic,lapses,accuracy:rts.length/Math.max(1,rts.length+antic+lapses),trials:rts.map(Math.round)});};
  next();return()=>clearTimeout(tm);
}
/* ---------- 2. reação a sinais (só a bandeira pedida) ---------- */
function runSignals(ar,done){
  const target=KP.pick(['green','blue','yellow']),others=['green','blue','yellow','red','white','checker','slippery'].filter(f=>f!==target);
  const seq=KP.shuffle([...Array(8).fill(target),...Array.from({length:16},()=>KP.pick(others))]);
  let i=-1,onset=0,resp=false,hits=0,miss=0,fa=0,cr=0,rts=[],tm=0,on=false;
  ar.innerHTML=`<div class="hud"><span id="gN"></span><span>Alvo: ${esc(F[target].name)}</span></div><div class="msg">Toca só na bandeira <b>${esc(F[target].name.toUpperCase())}</b></div><div id="gF">${ui.flag(target)}</div><div class="sub" id="gM">Começa em 3 s…</div>`;
  const box=KP.$('#gF',ar),M=KP.$('#gM',ar);
  const step=()=>{i++;if(i>=seq.length)return end();KP.$('#gN',ar).textContent=`${i+1}/${seq.length}`;resp=false;
    onsetAfter(()=>{box.innerHTML=ui.flag(seq[i]);box.style.visibility='visible';},t=>{onset=t;on=true;
      tm=setTimeout(()=>{on=false;if(!resp){if(seq[i]===target)miss++;else cr++;}box.style.visibility='hidden';tm=setTimeout(step,rand(450,950));},900);});};
  ar.onpointerdown=e=>{if(!on||resp)return;resp=true;
    if(seq[i]===target){hits++;const rt=KP.eventClock(e)-onset;rts.push(rt);M.textContent=`Certo · ${Math.round(rt)} ms`;tone(880,.06);}
    else{fa++;M.textContent='Essa não era a pedida';KP.vibrate(80);ar.classList.add('false');setTimeout(()=>ar.classList.remove('false'),200);}};
  tm=setTimeout(()=>{box.style.visibility='hidden';M.textContent='';tm=setTimeout(step,600);},2600);
  const end=()=>done({best:KP.min(rts),avg:KP.mean(rts),hits,errors:miss+fa,miss,fa,cr,accuracy:(hits+cr)/seq.length,details:{target}});
  return()=>clearTimeout(tm);
}
/* ---------- 3. reação visual (procura na grelha) ---------- */
function runVisual(ar,done){
  const R=12,ids=Object.keys(F);let round=0,onset=0,errs=0,rts=[],tgt=null,live=false;
  ar.style.justifyContent='flex-start';
  ar.innerHTML=`<div class="hud" style="position:static;width:100%"><span id="gN"></span><span id="gE"></span></div><div class="row" style="gap:12px"><span class="msg">Encontra:</span><div style="width:84px">${''}<div id="gT" class="flag" style="width:84px"></div></div></div><div class="vgrid" id="gG"></div>`;
  const G=KP.$('#gG',ar);
  const next=()=>{if(round>=R)return end();live=false;const n=round<6?4:5;tgt=KP.pick(ids);
    KP.$('#gN',ar).textContent=`Ronda ${round+1}/${R}`;KP.$('#gE',ar).textContent=errs?`Erros: ${errs}`:'';
    const cells=Array.from({length:n*n},()=>KP.pick(ids.filter(x=>x!==tgt)));cells[Math.floor(Math.random()*cells.length)]=tgt;
    KP.$('#gT',ar).innerHTML=`<svg viewBox="0 0 60 40" preserveAspectRatio="none">${F[tgt].svg}</svg>`;
    G.style.gridTemplateColumns=`repeat(${n},minmax(0,1fr))`;
    onsetAfter(()=>{G.innerHTML=cells.map((c,k)=>`<button class="vcell" data-k="${k}" data-f="${c}" aria-label="${esc(F[c].name)}">${ui.flagSvg(c)}</button>`).join('');},t=>{onset=t;live=true;});};
  G.onpointerdown=e=>{const c=e.target.closest('.vcell');if(!c||!live)return;
    if(c.dataset.f===tgt){live=false;rts.push(KP.eventClock(e)-onset);round++;c.classList.add('ok');tone(880,.06);setTimeout(next,350);}
    else{errs++;c.classList.add('bad');KP.vibrate(60);KP.$('#gE',ar).textContent=`Erros: ${errs}`;}};
  const end=()=>done({best:KP.min(rts),avg:KP.mean(rts),hits:R,errors:errs,accuracy:R/(R+errs),trials:rts.map(Math.round)});
  next();return()=>{};
}
/* ---------- 4. memória (sequência de luzes) ---------- */
function runMemory(ar,done){
  const PADS=[['#d7261e','1',523],['#1b5fd6','2',587],['#f6c90e','3',659],['#1fa34a','4',784]];
  let len=3,lives=2,seq=[],pos=0,best=0,taps=0,right=0,accepting=false,tm=0;
  ar.innerHTML=`<div class="hud"><span id="gN"></span><span id="gV"></span></div><div class="msg" id="gM"></div><div class="pads" id="gP">${PADS.map((p,i)=>`<button class="pad" data-i="${i}" style="background:${p[0]}" aria-label="Luz ${p[1]}" disabled>${p[1]}</button>`).join('')}</div>`;
  const pads=KP.$$('.pad',ar),M=KP.$('#gM',ar);
  const hud=()=>{KP.$('#gN',ar).textContent=`Sequência: ${len}`;KP.$('#gV',ar).textContent='Vidas: '+'●'.repeat(lives)+'○'.repeat(2-lives);};
  const flashPad=(i,ms)=>{pads[i].classList.add('on');tone(PADS[i][2],ms/1000);setTimeout(()=>pads[i].classList.remove('on'),ms);};
  const play=()=>{accepting=false;pads.forEach(p=>p.disabled=true);seq=Array.from({length:len},()=>Math.floor(Math.random()*4));pos=0;hud();M.textContent='Observa…';
    const on=Math.max(320,560-len*20),gap=180;seq.forEach((v,k)=>{tm=setTimeout(()=>flashPad(v,on),700+k*(on+gap));});
    tm=setTimeout(()=>{accepting=true;pads.forEach(p=>p.disabled=false);M.textContent='Agora tu: repete a sequência';},700+len*(on+gap));};
  KP.$('#gP',ar).onpointerdown=e=>{const p=e.target.closest('.pad');if(!p||!accepting)return;const i=+p.dataset.i;taps++;flashPad(i,180);
    if(i===seq[pos]){right++;pos++;if(pos===seq.length){best=Math.max(best,len);accepting=false;M.textContent='Certo!';len++;if(len>14)return end();tm=setTimeout(play,800);}}
    else{accepting=false;lives--;KP.vibrate([60,40,60]);M.textContent=lives?'Errado. Nova sequência do mesmo tamanho.':'Fim';if(!lives)return setTimeout(end,700);tm=setTimeout(play,1100);}};
  const end=()=>done({score:best,hits:right,errors:taps-right,accuracy:taps?right/taps:0,level:best});
  play();return()=>clearTimeout(tm);
}
/* ---------- 5. atenção (encontrar todas) ---------- */
function runAttention(ar,done){
  const ROUNDS=[[4,5,5],[5,6,7],[6,7,9]],ids=Object.keys(F);let r=0,onset=0,found=0,need=0,errs=0,times=[],tgt=null,total=0;
  ar.style.justifyContent='flex-start';
  ar.innerHTML=`<div class="hud" style="position:static;width:100%"><span id="gN"></span><span id="gE"></span></div><div class="row" style="gap:12px"><span class="msg">Toca em todas:</span><div id="gT" class="flag" style="width:84px"></div><span class="num" id="gC"></span></div><div class="vgrid" id="gG"></div>`;
  const G=KP.$('#gG',ar);
  const next=()=>{if(r>=ROUNDS.length)return end();const[c,rows,k]=ROUNDS[r];tgt=KP.pick(ids);found=0;need=k;
    const cells=Array.from({length:c*rows},()=>KP.pick(ids.filter(x=>x!==tgt)));KP.shuffle([...cells.keys()]).slice(0,k).forEach(i=>cells[i]=tgt);
    KP.$('#gN',ar).textContent=`Ronda ${r+1}/${ROUNDS.length}`;KP.$('#gT',ar).innerHTML=`<svg viewBox="0 0 60 40" preserveAspectRatio="none">${F[tgt].svg}</svg>`;KP.$('#gC',ar).textContent=`0/${k}`;
    G.style.gridTemplateColumns=`repeat(${c},minmax(0,1fr))`;
    onsetAfter(()=>{G.innerHTML=cells.map((f,i)=>`<button class="vcell" data-f="${f}" aria-label="${esc(F[f].name)}">${ui.flagSvg(f)}</button>`).join('');},t=>{onset=t;});};
  G.onpointerdown=e=>{const c=e.target.closest('.vcell');if(!c||c.classList.contains('hit'))return;
    if(c.dataset.f===tgt){c.classList.add('hit');found++;total++;tone(880,.05);KP.$('#gC',ar).textContent=`${found}/${need}`;
      if(found===need){times.push((KP.eventClock(e)-onset)/need);r++;setTimeout(next,400);}}
    else{errs++;c.classList.add('bad');KP.vibrate(60);KP.$('#gE',ar).textContent=`Erros: ${errs}`;}};
  const end=()=>done({avg:KP.mean(times),best:KP.min(times),hits:total,errors:errs,accuracy:total/(total+errs),trials:times.map(Math.round)});
  next();return()=>{};
}
/* ---------- 6. identificação rápida (significado das bandeiras) ---------- */
function runIdentify(ar,done){
  const ids=Object.keys(F),qs=KP.shuffle([...ids,...KP.shuffle(ids).slice(0,2)]);let q=-1,onset=0,right=0,rts=[],tm=0,live=false;
  ar.style.justifyContent='flex-start';
  ar.innerHTML=`<div class="hud" style="position:static;width:100%"><span id="gN"></span><span id="gR"></span></div><div id="gF"></div><div class="bar" style="width:100%;max-width:420px"><i id="gTm" style="width:100%"></i></div><div class="opts" id="gO"></div>`;
  const O=KP.$('#gO',ar),bar=KP.$('#gTm',ar);
  const next=()=>{q++;if(q>=qs.length)return end();const f=qs[q];live=false;
    const opts=KP.shuffle([f,...KP.shuffle(ids.filter(x=>x!==f)).slice(0,3)]);
    KP.$('#gN',ar).textContent=`${q+1}/${qs.length}`;KP.$('#gR',ar).textContent=`Certas: ${right}`;
    onsetAfter(()=>{KP.$('#gF',ar).innerHTML=ui.flag(f);O.innerHTML=opts.map(o=>`<button class="btn" data-o="${o}">${esc(F[o].meaning)}</button>`).join('');
      bar.style.transition='none';bar.style.width='100%';},t=>{onset=t;live=true;requestAnimationFrame(()=>{bar.style.transition='width 5s linear';bar.style.width='0%';});
      tm=setTimeout(()=>{if(live){live=false;mark(null,f);setTimeout(next,1100);}},5000);});};
  const mark=(chosen,f)=>{KP.$$('[data-o]',O).forEach(b=>{if(b.dataset.o===f)b.classList.add('right');else if(b.dataset.o===chosen)b.classList.add('wrong');});};
  O.onpointerdown=e=>{const b=e.target.closest('[data-o]');if(!b||!live)return;live=false;clearTimeout(tm);const f=qs[q];
    if(b.dataset.o===f){right++;rts.push(KP.eventClock(e)-onset);tone(880,.06);}else KP.vibrate(80);
    mark(b.dataset.o,f);setTimeout(next,b.dataset.o===f?600:1300);};
  const end=()=>done({hits:right,errors:qs.length-right,accuracy:right/qs.length,avg:KP.mean(rts),best:KP.min(rts)});
  next();return()=>clearTimeout(tm);
}
/* ---------- 7. concentração sustentada (1-back, 90 s, cada vez mais rápido) ---------- */
function runSustained(ar,done){
  const DUR=90000,ids=['green','yellow','red','blue','white','checker'];let prev=null,cur=null,t0=0,onset=0,resp=false,tm=0,on=false;
  const st={hits:0,miss:0,fa:0,cr:0,rts:[],seg:[{ok:0,n:0},{ok:0,n:0},{ok:0,n:0}]};
  ar.innerHTML=`<div class="hud"><span id="gT">90 s</span><span id="gS"></span></div><div class="msg">Toca em IGUAL quando a bandeira se repetir</div><div id="gF" style="min-height:200px;display:grid;place-items:center"></div>
    <button class="btn primary tapzone" id="gTap">IGUAL</button>`;
  const box=KP.$('#gF',ar);
  const segOf=()=>Math.min(2,Math.floor((KP.clock()-t0)/30000));
  const score=(ok)=>{const s=st.seg[segOf()];s.n++;if(ok)s.ok++;};
  const step=()=>{const el=KP.clock()-t0;if(el>=DUR)return end();
    const soa=1350-(650*el/DUR);prev=cur;cur=(prev&&Math.random()<.27)?prev:KP.pick(ids.filter(x=>x!==prev));resp=false;
    KP.$('#gT',ar).textContent=Math.ceil((DUR-el)/1000)+' s';
    onsetAfter(()=>{box.innerHTML=ui.flag(cur);},t=>{onset=t;on=true;
      tm=setTimeout(()=>{on=false;const isT=prev&&cur===prev;if(!resp){if(isT){st.miss++;score(false);}else{st.cr++;score(true);}}box.innerHTML='';tm=setTimeout(step,Math.max(200,soa-550));},550);});};
  KP.$('#gTap',ar).onpointerdown=e=>{e.preventDefault();if(resp||!cur)return;resp=true;const isT=prev&&cur===prev;
    if(isT){st.hits++;st.rts.push(KP.eventClock(e)-onset);score(true);tone(880,.05);KP.$('#gS',ar).textContent='✓';}
    else{st.fa++;score(false);KP.vibrate(60);KP.$('#gS',ar).textContent='✗';}};
  t0=KP.clock();tm=setTimeout(step,800);
  const end=()=>{const n=st.hits+st.miss+st.fa+st.cr;done({hits:st.hits,errors:st.miss+st.fa,miss:st.miss,fa:st.fa,cr:st.cr,accuracy:n?(st.hits+st.cr)/n:0,avg:KP.mean(st.rts),best:KP.min(st.rts),
    details:{segments:st.seg.map(s=>s.n?s.ok/s.n:null)}});};
  return()=>clearTimeout(tm);
}

/* ---------- página de exercício: instruções → exercício → resultado ---------- */
function openGame(mode){
  const G=GAMES[mode];let cleanup=null;
  KP.app.push(G.name,(b,page)=>{
    b.innerHTML=`<header class="page-h"><button class="back" id="gX" aria-label="Sair">✕</button><h2>${esc(G.name)}</h2></header><div class="arena" id="gAr"></div>`;
    const ar=KP.$('#gAr',b);KP.$('#gX',b).onclick=()=>{cleanup&&cleanup();KP.app.pop();};
    const hist=S.drills(mode),prevMain=hist.map(d=>G.main(d).n).filter(v=>v!=null);
    const intro=()=>{ar.className='arena';ar.style.justifyContent='';ar.onpointerdown=null;
      ar.innerHTML=`<div class="card" style="width:100%;max-width:420px"><div class="eyebrow">${G.cat==='reflex'?'Reflexos':'Concentração'}</div><h3 style="font-size:22px">${esc(G.name)}</h3>
        <ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px">${G.how.map(h=>`<li>${esc(h)}</li>`).join('')}</ol>
        ${prevMain.length?`<div class="row small muted"><span>Feitos: ${hist.length}</span><span class="grow"></span><span>Melhor: ${esc(G.main(hist[bestIdx(hist,G)]).v)}</span></div>`:''}
        ${KP.drillsToday()>=KP.DRILL_CAP?'<div class="note">Já fizeste vários exercícios hoje. Podes continuar, mas o XP dos treinos fica para amanhã: descansar também faz parte do treino.</div>':''}
        <button class="btn primary block" id="gGo" style="min-height:60px;font-size:20px">Começar</button></div>`;
      KP.$('#gGo',ar).onclick=()=>{ar.innerHTML='';cleanup=G.run(ar,res=>{cleanup=null;finish(res);});};};
    const finish=res=>{ar.onpointerdown=null;ar.className='arena';
      const d=S.addDrill(Object.assign({mode,cat:G.cat},res));const m=G.main(d);
      const prev=prevMain.slice(-5),pm=prev.length?KP.mean(prev):null;let evo='Primeiro registo deste exercício. Repete noutro dia para veres a evolução.';
      if(pm!=null&&m.n!=null){const diff=m.n-pm,better=m.lower?diff<0:diff>0;
        evo=(better?'Melhor':'Abaixo')+` do que a tua média dos últimos ${prev.length} (${m.lower?(diff<0?'−':'+')+Math.abs(Math.round(diff))+' ms':(diff>0?'+':'−')+Math.abs(Math.round(diff*100))+' pontos'}).`;}
      const series=[...prevMain,m.n].slice(-10);
      ar.style.justifyContent='flex-start';
      ar.innerHTML=`<div style="width:100%;max-width:440px;display:flex;flex-direction:column;gap:12px">
        <div class="card" style="align-items:flex-start"><span class="eyebrow">${esc(m.label)}</span><span class="res-main">${esc(m.v)}</span><span class="small muted">${esc(evo)}</span>${series.length>1?ui.spark(series,ui.C.red,220,44):''}</div>
        <div class="tiles t3">${ui.tile('Melhor reação',d.best!=null?Math.round(d.best)+' ms':'—')}${ui.tile('Média',d.avg!=null?Math.round(d.avg)+' ms':'—')}${ui.tile('Precisão',KP.fmtPct(d.accuracy))}
          ${ui.tile('Acertos',String(d.hits??'—'))}${ui.tile('Erros',String(d.errors??'—'))}${ui.tile(mode==='memory'?'Sequência':'Tentativas',mode==='memory'?String(d.score):String((d.trials||[]).length||d.hits+d.errors||'—'))}</div>
        ${d.antic?`<div class="note">Antecipações: ${d.antic}. Esperar pelo sinal é tão importante como reagir depressa (um falso arranque é penalizado).</div>`:''}
        ${d.details&&d.details.segments?`<div class="note">Precisão por período: ${d.details.segments.map((v,i)=>`${i*30}–${i*30+30} s: ${v==null?'—':Math.round(v*100)+'%'}`).join(' · ')}</div>`:''}
        <div class="row"><button class="btn grow" id="gAgain">Repetir</button><button class="btn primary grow" id="gDone">Terminar</button></div></div>`;
      KP.$('#gAgain',ar).onclick=intro;KP.$('#gDone',ar).onclick=()=>KP.app.pop();};
    intro();
  },{full:true,onClose:()=>{cleanup&&cleanup();}});
}
function bestIdx(hist,G){let bi=0;hist.forEach((d,i)=>{const a=G.main(d).n,b=G.main(hist[bi]).n;if(a!=null&&(b==null||(G.main(d).lower?a<b:a>b)))bi=i;});return bi;}
KP.openGame=openGame;

KP.app.view('treino',{render(el){
  const today=KP.drillsToday();
  const row=id=>{const G=GAMES[id],h=S.drills(id),last=h[h.length-1];
    return`<button class="drill" data-g="${id}"><span class="ic">${ui.icon[G.icon]}</span><span style="min-width:0"><span class="t">${esc(G.name)}</span><br><span class="d">${esc(G.short)}</span></span>
      <span class="r">${last?`${esc(G.main(last).v)}<br><span class="small muted">${KP.relDay(last.date)}</span>`:'<span class="small muted">Novo</span>'}</span></button>`;};
  el.innerHTML=`<div class="card" style="flex-direction:row;align-items:center"><div class="grow"><div class="eyebrow">Hoje</div><b>${today} ${today===1?'exercício':'exercícios'}</b><div class="small muted">XP dos treinos conta até ${KP.DRILL_CAP} por dia.</div></div><span class="num" style="font-size:28px;color:var(--red)">${KP.streak()}<span class="small muted"> dias</span></span></div>
  <h2 style="font-size:13px;letter-spacing:.14em;color:var(--muted);text-transform:uppercase">Reflexos</h2>
  ${['light','signals','visual'].map(row).join('')}
  <h2 style="font-size:13px;letter-spacing:.14em;color:var(--muted);text-transform:uppercase;margin-top:6px">Concentração</h2>
  ${['memory','attention','identify','sustained'].map(row).join('')}
  <p class="small muted" style="margin:0">Faz os exercícios antes de ir para a pista ou em dias de descanso. 10 minutos chegam.</p>`;
  KP.$$('[data-g]',el).forEach(b=>b.onclick=()=>openGame(b.dataset.g));
}});
})(window);
