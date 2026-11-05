'use strict';
/* Pit Box · Corrida e pit stop: fases, passos, controlos */
/* ---------------- CORRIDA ---------------- */
let R=null;
function later(fn,ms){const r=R;setTimeout(()=>{if(R&&R===r)fn();},ms);}
function rollEvents(D){const evs=new Set();if(Math.random()<D.prob){let n=1;if(D.maxEv>1&&Math.random()<.55)n++;if(D.maxEv>2&&Math.random()<.45)n++;while(evs.size<n)evs.add(pick(D.pool));}return evs;}

function faceTo(m,x,z){m.rotation.y=Math.atan2(-(z-m.position.z),x-m.position.x);}
function startRace(cfg){
  closeModal();
  const D=DIFF[cfg.diff],cat=cfg.cat,team=cfg.team,gunner=cat.role==='gun';
  if(showCar){scene.remove(showCar);showCar=null;}
  setTeamLook(team);applyPlayerLook(team);
  const wx=cfg.wx||pickWeather(cfg.circuit),W0=WEATHER[wx];applyWeather(wx);
  const newCompound=pick(W0.comps);
  const altPool=Object.keys(COMPOUND).filter(k=>k!==newCompound&&(W0.wet?['inter','wet','medium'].includes(k):['soft','medium','hard'].includes(k)));
  const altCompound=pick(altPool);
  const oldCompound=W0.rain?'inter':W0.wet?pick(['medium','inter']):pick(['soft','medium','hard']);
  const car=makeCar(cat.car,team.c1,team.c2,oldCompound);car.position.set(-80,0,0);car.visible=false;scene.add(car);
  const crewLook={suit:team.c1,acc:team.c2,glove:0x1d1f23,helmet:team.c2};
  const S=car.userData.S,gt=cat.car==='gt3',ax=gt?1.4:1.75*S,az=gt?.83:.78*S;
  const mine=cat.wheels===2?['FL','RL']:['FL'];
  // equipa da box (aparece quando chega a correr da garagem)
  const crew=new THREE.Group();crew.visible=false;scene.add(crew);
  const addM=(o,x,z,tx,tz)=>{const m=makeMechanic(Object.assign({},crewLook,o));m.position.set(x,0,z);faceTo(m,tx,tz);crew.add(m);return m;};
  [['FR',ax,1],['RR',-ax,1],['RL',-ax,-1]].forEach(([k,x,sg])=>{if(mine.includes(k))return;const wz=sg*az;
    addM({kneel:true},x,sg*(az+.95),x,wz);
    if(gunner){addM({kneel:true},x+.8,sg*(az+.6),x,wz);addM({kneel:true},x-.8,sg*(az+.6),x,wz);}});
  let offM=null,onM=null;
  if(gunner){offM=addM({kneel:true},ax+1.05,-(az+.32),ax,-az);onM=addM({kneel:true},ax-1.05,-(az+.32),ax,-az);}
  const noseX=gt?2.42:2.84*S,tailX=gt?-2.42:-2.3*S;
  let jacks=null;
  if(!gt){const jf=makeJack(V(noseX+.12,.13,0),V(noseX+1.45,.95,0),team.c2);crew.add(jf);
    const rg=new THREE.Group();const jr=makeJack(V(tailX-.15,.15,0),V(tailX-1.5,.95,0),team.c2);rg.add(jr);crew.add(rg);
    addM({},noseX+1.75,.25,noseX,0);const rjm=addM({},tailX-1.8,-.25,tailX,0);crew.remove(rjm);rg.add(rjm);rg.position.z=2.4;
    jacks={f:jf,r:jr,rg};}
  else{addM({},-1.75,-1.95,-1.2,-.9);addM({},-.6,1.95,-.6,.9);
    crew.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(-1.25,.5,-.95),V3(-1.45,.25,-1.6),V3(-2.3,.03,-2.5),V3(-4.2,.03,-3.6)]),24,.025,6),M(0x222222,{roughness:.7})));}
  addM({helmet:0xffffff},5.4,2.3,0,0);
  crew.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  // equipa sentada na garagem a ver a corrida
  const gcrew=new THREE.Group();scene.add(gcrew);const seated=[];
  W.SEATS.forEach(([x,z],i)=>{const m=makeMechanic(Object.assign({},crewLook,{seated:true,bare:true,skin:SKIN[(i+team.tier)%SKIN.length]}));m.position.set(x,0,z);m.rotation.y=Math.PI/2+rand(-.15,.15);gcrew.add(m);seated.push(m);});
  const eng=makeMechanic(Object.assign({},crewLook,{seated:true,bare:true,skin:SKIN[4]}));eng.position.set(2.3,0,-14.6);eng.rotation.y=Math.PI/2;gcrew.add(eng);
  // pneus: dois carrinhos (o pedido e outro composto); o que levamos nas mãos e o que pousamos na box
  const trolley=Math.random()<.5?[newCompound,altCompound]:[altCompound,newCompound];
  W.fetch.forEach((f,i)=>{f.g.visible=true;f.stripe.material.color.setHex(COMPOUND[trolley[i]].c);
    f.tag.material.map=canvasTex(256,80,(c,w,h)=>{c.fillStyle='#111';c.fillRect(0,0,w,h);c.fillStyle=hex(COMPOUND[trolley[i]].c);c.fillRect(0,0,14,h);c.fillStyle='#fff';c.font='bold 40px Arial';c.textAlign='center';c.fillText(COMPOUND[trolley[i]].name.toUpperCase(),w/2+6,55);});
    f.tag.material.needsUpdate=true;f.tag.visible=DIFF[cfg.diff].aids>=2;});
  const pc=playerColors(team);
  if(W.carry)camera.remove(W.carry);
  W.carry=new THREE.Group();const ct=makeWheel(.36,.32,newCompound,true);W.carryTyre=ct;ct.position.set(.02,-.4,-.95);ct.rotation.x=-.75;ct.scale.setScalar(.62);W.carry.add(ct);
  const gm=M(pc.glove,{roughness:.65}),sm=M(pc.suit,{roughness:.85});
  [-1,1].forEach(sg=>{W.carry.add(mesh(rbox(.08,.11,.09,.03),gm,sg*.24+.02,-.38,-.9,false));const a=mesh(new THREE.CapsuleGeometry(.045,.4,4,8),sm,sg*.3,-.5,-.66,false);a.rotation.x=1.15;W.carry.add(a);});
  W.carry.visible=false;camera.add(W.carry);
  if(W.placed)scene.remove(W.placed);
  W.placed=makeWheel(car.userData.wr*S,.32,newCompound,true);W.placedS=car.userData.wr*S;W.placed.rotation.x=Math.PI/2;W.placed.position.set(ax-.45,.17,-(az+1.15));W.placed.visible=false;scene.add(W.placed);
  W.fp.visible=false;W.lightR.color.setHex(0xff1a1a);W.lightG.color.setHex(0x103010);
  const posBefore=clamp(Math.round(2+(5-team.tier)*2.6+rand(-2,2.5)),1,16);
  const lap=Math.max(2,Math.round(cat.laps*.4));
  setupTV(team,posBefore,cfg.circuit,cat,lap-1,wx);
  R={...cfg,jacks,D,car,crew,gcrew,seated,offM,onM,mine,gunner,newCompound,altCompound,trolley,wx,temp:randi(W0.temp[0],W0.temp[1]),wxm:wxMods(wx),acc:[],reactAll:[],crewLook,t0:now(),phase:'garage',warnAt:rand(13,18),events:rollEvents(D),
    errors:[],pen:0,perfect:0,posBefore,lap,called:false,run:0,runT:0,fetch:null,reacts:[],runners:[],
    prepped:false,gunDir:'L',inBox:false,carState:'away',tStop:0,tRelease:0,step:null,si:-1,steps:[],holding:false,lock:0,
    par:+(cat.par*D.par).toFixed(1),ai:{},flags:{},stepsLog:[],nextChat:4.5,chatIdx:randi(0,CHATTER.length-1),stopX:0,eng:null};
  if(R.events.has('wrongdir'))R.gunDir='T';
  if((P.gear.overTorque&&Math.random()<.85)||(wx==='cold'&&Math.random()<.2))R.events.add('stuck');
  if(Math.random()<R.wxm.strategy)R.events.add('strategy');
  R.roleTxt=gunner?'Pistoleiro · dianteira esquerda':mine.length===2?'Dianteira e traseira esquerdas':'Dianteira esquerda';
  const lapT=TV.trk.lapT*TV.pace;
  R.carInfo={compound:oldCompound,lap0:lap,stint:randi(8,Math.max(9,Math.round(lap*.7))),wear:{FL:rand(52,64),FR:rand(55,68),RL:rand(48,60),RR:rand(50,63)},rate:W0.wet?1.1:1.6,
    temp:{FL:0,FR:0,RL:0,RR:0},lastLap:lapT*rand(1.005,1.02),fuel:rand(30,45)};
  ['FL','FR','RL','RR'].forEach(k=>R.carInfo.temp[k]=Math.round((W0.wet?62:wx==='hot'?108:wx==='cold'?82:96)+rand(-4,5)));
  R.preWarnAt=R.warnAt-6;gearInit();R.rival=setupRival(cat,team);
  R.stopX=R.events.has('overshoot')?.55:0;
  const base=R.par*.5;
  ['FR','RR','RL'].forEach(k=>{if(!mine.includes(k))R.ai[k]=gunner?{start:rand(.18,.3),done:cat.par*rand(.66,.8),st:'pending'}:{start:rand(.3,.5),done:base*rand(.85,1.1),st:'pending'};});
  if(R.events.has('crewdelay'))R.ai.RR.done+=rand(2,3.5)*(cfg.diff==='hard'?1.2:1);
  if(cat.refuel)R.ai.FUEL={start:.6,done:cat.refuel*D.par*.9,st:'pending'};
  // HUD
  show('hud');
  $('#hCirc').textContent=cfg.circuit.n;$('#hPos').textContent='P'+posBefore;$('#hLap').textContent=`Volta ${R.lap}/${cat.laps}`;
  $('#timerWrap').hidden=true;$('#ops').hidden=true;$('#alert').hidden=true;$('#prompt').textContent='';$('#hPar').textContent=f1(R.par)+' s';$('#hErr').textContent='0';
  $('#timer').className='timer';$('#timer').style.color='';$('#timer').textContent='0,00';
  hideControls();
  const myTxt=R.roleTxt;
  $('#nextOp').hidden=false;closeSheet();$('#gbar').hidden=false;
  $('#nextOp').innerHTML=`<div class="eyebrow">Próxima operação · ${esc(team.name)}</div>
    <dt>Categoria</dt><dd>${cat.name} · ${D.name}</dd><dt>A tua função</dt><dd>${myTxt}</dd>
    <dt>Pneus novos</dt><dd>${COMPOUND[R.newCompound].name}${cat.refuel?' + reabastecimento':''}</dd><dt>Condições</dt><dd>${W0.icon} ${W0.name} · ${R.temp}°C</dd><dt>Objetivo</dt><dd class="num">${f1(R.par)} s</dd>`;
  $('#w-FUEL').style.display=cat.refuel?'':'none';
  ['FL','FR','RL','RR','FUEL'].forEach(k=>{const e=$('#w-'+k);e.setAttribute('class','w'+(mine.includes(k)?' me':''));});
  $('#opsMe').textContent='A tua: '+myTxt.toLowerCase();
  setPrompt('Estás sentado com a equipa a ver a corrida. Espera pela chamada.');
  later(()=>{if(document.body.classList.contains('land')&&R.phase==='garage'){$('#nextOp').hidden=true;setPrompt('');}},7000);
  W.tvLine=`${cfg.circuit.n} · ${cfg.circuit.c} · ${cat.name} · ${W0.icon} ${W0.name} ${R.temp}°C`;
  camSnap(POSE.garage[0].clone().add(V(0,.45,.8)),POSE.garage[1]);camTo(POSE.garage[0],POSE.garage[1],2);Cam.mode='race';
  Snd.init();Snd.ambience(true);
  radio(`Bom dia equipa. ${cfg.circuit.n}, volta ${R.lap}, ${W0.track.toLowerCase()}. Estamos em P${posBefore}. Verifiquem o equipamento.`,'engineer');
}

function hideControls(){['#trigger','#dirSwitch','#actionBtn','#timing','#torque','#runMeter','#swipeZone','#choice','#posMeter'].forEach(s=>$(s).hidden=true);$('#dirSwitch').classList.remove('pulse');}
/* textos de ajuda: desaparecem no modo profissional */
function aidPrompt(t,slow=false){setPrompt(R&&R.D.aids===0?'':t,slow);}
/* posicionar-se na marca da roda antes de o carro chegar */
function startPositioning(){
  R.posOff=(Math.random()<.5?-1:1)*rand(.5,.85);R.posTgt=R.posOff;R.posHold=0;R.positioned=false;
  R.posZone={3:.2,2:.14,1:.11,0:.09}[R.D.aids];
  const m=$('#posMeter');m.hidden=false;$('#pZone').style.left=(50-R.posZone*50)+'%';$('#pZone').style.width=(R.posZone*100)+'%';
  $('#pZone').style.opacity=R.D.aids===0?'.25':'1';
  aidPrompt('Arrasta para te posicionares na marca da roda');R.posT0=now();
}
function finishPositioning(acc){
  if(!R||R.positioned)return;R.positioned=true;$('#posMeter').hidden=true;R.acc.push(acc);
  R.stepsLog.push({id:'position',t:now()-R.posT0,ideal:1.1});Snd.click();
  aidPrompt(R.carState==='away'||R.carState==='approach'?'Em posição. Espera pelo carro… não toques no gatilho':'');
  tryBeginWork();
}
function posPointer(e){
  if(!R||R.positioned)return;const r=$('#posMeter').getBoundingClientRect();
  const k=rotated?(e.clientY-r.top)/r.height:(e.clientX-r.left)/r.width;R.posTgt=clamp(k*2-1,-1,1);
}
function setPrompt(t,slow=false){const p=$('#prompt');p.textContent=t;p.classList.toggle('slow',slow);}
function showAction(label,cls,fn){const b=$('#actionBtn');b.hidden=false;b.className='btn primary '+(cls||'');b.innerHTML=label;b.onclick=fn;}
function updDir(){$('#dirSwitch').dataset.dir=R.gunDir;}

function raceTime(){return R.tStop?((R.tRelease||now())-R.tStop+R.pen):0;}

function err(code,msg,pen){
  if(!R)return;const s=pen*R.D.pen;R.errors.push({code,msg,pen:s});R.pen+=s;
  $('#hErr').textContent=R.errors.length;Snd.error();vibrate([60,40,60]);Cam.shake=.06;
  toast((s>0?'+'+f2(s)+' s · ':'')+msg,'bad');
  const v=$('#vignette');v.classList.add('hit');setTimeout(()=>v.classList.remove('hit'),60);
  if(s>0){const pf=$('#penFloat');pf.textContent='+'+f2(s);pf.classList.remove('show');void pf.offsetWidth;pf.classList.add('show');}
}

/* a equipa levanta-se e corre para a box */
function startRunners(){
  const spots=[];R.crew.children.forEach(m=>{if(m.userData&&m.userData.arms)spots.push(m.position.clone());});
  R.seated.forEach((m,i)=>{m.visible=false;
    const rn=makeMechanic(Object.assign({},R.crewLook,{bare:true,skin:m.userData.skin}));rn.position.copy(m.position);R.gcrew.add(rn);
    R.runners.push({m:rn,a:m.position.clone(),b:V(clamp(m.position.x*.6,-2.6,2.6),0,-6.2),c:(spots[i%Math.max(1,spots.length)]||V(0,0,0)).clone(),t0:now()+.3+i*.2,dur:rand(2.4,3.1)});});
}
function updRunners(t){
  if(!R.runners.length)return;
  R.runners.forEach((r,i)=>{if(r.done)return;const k=(t-r.t0)/r.dur;if(k<0)return;if(k>=1){r.done=1;r.m.visible=false;return;}
    const p=k<.45?r.a.clone().lerp(r.b,k/.45):r.b.clone().lerp(r.c,(k-.45)/.55);
    const dx=p.x-r.m.position.x,dz=p.z-r.m.position.z;if(dx*dx+dz*dz>1e-6)r.m.rotation.y=Math.atan2(-dz,dx);
    r.m.position.set(p.x,Math.abs(Math.sin(t*13+i))*.08,p.z);});
  if(!R.crew.visible&&R.runners.every(r=>r.done||(t-r.t0)/r.dur>.92))R.crew.visible=true;
}
/* chamada: "box esta volta" — levantar, ir buscar o pneu, levá-lo para a box */
function warnBox(){
  R.phase='prep';R.tWarn=now();R.carStopAt=R.tWarn+R.D.window;TV.focusUs=true;TV.shot=null;closeSheet();$('#gbar').hidden=true;
  const garble=R.events.has('radio'),strat=R.events.has('strategy');
  radio(`BOX, BOX! PIT STOP! Pneus ${COMPOUND[R.newCompound].name.toLowerCase()}. Equipa, para a box!`,'engineer',true,garble);
  if(garble)later(()=>radio(`Repito: pneus ${COMPOUND[R.newCompound].name.toLowerCase()}! O rádio está a falhar.`,'chief',true),2700);
  if(strat)later(()=>{R.newCompound=R.altCompound;radio(`Mudança de plano! Pneus ${COMPOUND[R.newCompound].name.toLowerCase()}! Repito, ${COMPOUND[R.newCompound].name.toLowerCase()}!`,'engineer',true);
    toast('Mudança de pneus!','warn',1400);W.tvLine=`${R.team.name} muda de estratégia`;},garble?4200:1300);
  W.tvLine=`${R.team.name} chama o piloto às boxes`;
  Snd.beep();setTimeout(()=>Snd.beep(),160);vibrate([120,60,120]);
  $('#nextOp').hidden=true;aidPrompt('Levanta-te! Vai buscar o pneu novo');
  showAction('🛞 IR BUSCAR O PNEU','',goFetch);
  startRunners();
}
function goFetch(){
  if(!R||R.fetch)return;R.fetch='walk';hideControls();setPrompt('');Snd.click();
  camTo(POSE.standG[0],POSE.standG[1],6);
  later(()=>{camTo(POSE.rack[0],POSE.rack[1],3.4);Cam.bob=.7;},420);
  later(()=>{Cam.bob=0;R.fetch='pick';showTyreChoice();},1550);
}
/* dois carrinhos: tens de pegar no composto que o engenheiro pediu */
function showTyreChoice(){
  aidPrompt('Pega nos pneus que o engenheiro pediu');
  const box=$('#choice');box.hidden=false;
  box.innerHTML=R.trolley.map((c,i)=>`<button class="btn small ${R.D.aids>=3&&c===R.newCompound?'primary':''}" data-i="${i}"><i class="cdot" style="background:${hex(COMPOUND[c].c)}"></i>${COMPOUND[c].name}${R.D.aids>=3&&c===R.newCompound?' ✓':''}</button>`).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>pickTyre(+b.dataset.i));
}
function pickTyre(i){
  if(!R||R.fetch!=='pick'||now()<R.lock)return;const comp=R.trolley[i];
  if(comp!==R.newCompound){err('wrongtyre','Pneus errados! Não são os que o engenheiro pediu',.5);R.lock=now()+.6;Snd.thud(.3);
    if(R.D.aids>=3)showTyreChoice();return;}
  R.fetch='carry';R.picked=comp;$('#choice').hidden=true;Snd.thud(.25);Snd.noise({dur:.3,type:'bandpass',f:500,vol:.15});
  W.fetch[i].g.visible=false;
  const p=W.carryTyre.position.clone(),r=W.carryTyre.rotation.clone(),sc=W.carryTyre.scale.x;W.carry.remove(W.carryTyre);
  W.carryTyre=makeWheel(.36,.32,comp,true);W.carryTyre.position.copy(p);W.carryTyre.rotation.copy(r);W.carryTyre.scale.setScalar(sc);W.carry.add(W.carryTyre);
  W.carry.visible=true;
  hideControls();$('#runMeter').hidden=false;R.run=0;R.runT=0;$('#rFill').style.width='0%';
  aidPrompt('Leva o pneu para a box! Toca depressa');
  showAction('LEVAR ▶','run',()=>{if(!R||R.fetch!=='carry')return;R.run=Math.min(1,R.run+.11);Snd.tone({f:120,type:'sine',dur:.08,vol:.12});Cam.bob=1;});
}
function placeTyre(){
  R.fetch='placed';R.inBox=true;$('#runMeter').hidden=true;Cam.bob=0;W.carry.visible=false;
  {const p=W.placed.position.clone();scene.remove(W.placed);W.placed=makeWheel(W.placedS,.32,R.picked,true);W.placed.rotation.x=Math.PI/2;W.placed.position.copy(p);scene.add(W.placed);}
  W.placed.visible=true;
  Snd.thud(.35);Snd.ambience(false);
  camTo(POSE.stand[0],POSE.stand[1],4);
  aidPrompt(R.gunner?'Pneu entregue ao colega. Pega na pistola!':'Pneu pousado. Pega na pistola!');
  const ready=now()+.35;showAction('🔧 PEGAR NA PISTOLA','',()=>{if(now()>=ready)prepGun();});
}
function callPit(){
  R.called=true;R.crew.visible=true;$('#alert').hidden=false;Snd.alarm();vibrate([200,100,200,100,200]);
  radio('PIT STOP! PIT STOP! CARRO A ENTRAR!','ENGENHEIRO',true);
  later(()=>{$('#alert').hidden=true;},2200);
  const us=TV.cars.find(c=>c.us);if(us)us.inPit=true;W.tvLine=R.team.name+' entra nas boxes';
}
function prepGun(){
  if(!R||R.prepped)return;R.prepped=true;Snd.clank(400,.2);W.fp.visible=true;
  $('#actionBtn').hidden=true;$('#trigger').hidden=false;$('#dirSwitch').hidden=false;updDir();
  if(R.gunDir!=='L'&&R.D.aids>=2)$('#dirSwitch').classList.add('pulse');
  startPositioning();
}
function carStopped(){
  R.carState='stopped';R.tStop=now();$('#timerWrap').hidden=false;$('#timer').className='timer run';$('#ops').hidden=false;
  Snd.thud(.4);
  if(!R.inBox)err('late','Atrasado para a box!',.6);
  else if(!R.prepped)err('noprep','Ferramenta não estava pronta!',.5);
  else if(!R.positioned){err('pos','Não estavas na posição!',.35);later(()=>finishPositioning(.2),350);}
  const jd=R.gunner?170:300;jackUp(jd/1000);
  later(()=>{R.carState='jacked';Snd.hiss(.35,.2);Snd.clank(300,.15);tryBeginWork();},jd);
}
function tryBeginWork(){
  if(!R||R.working||!R.prepped||!R.inBox||!R.positioned||R.carState!=='jacked')return;
  R.working=true;gearResolve();$('#posMeter').hidden=true;
  const pose=wheelPose(R.car,R.mine[0],0);
  if(R.events.has('overshoot')){pose[0].x-=R.stopX;pose[1].x-=R.stopX;}
  camTo(pose[0],pose[1],R.gunner?13:7);
  R.steps=buildSteps();R.si=-1;R.lock=now()+(R.gunner?.08:.3);later(nextStep,R.gunner?90:250);
}
function buildSteps(){
  const st=[],E=R.events,ex=R.D.explicitSwitch;
  if(R.gunner){const k='FL';if(E.has('overshoot'))st.push({id:'adjust',w:k});
    st.push({id:'loosen',w:k},{id:'swap',w:k});if(ex)st.push({id:'switchT',w:k});st.push({id:'tighten',w:k},{id:'signal',w:k});return st;}
  R.mine.forEach((k,i)=>{
    if(i>0){st.push({id:'move',w:k});if(ex)st.push({id:'switchL',w:k});}
    if(i===0&&E.has('overshoot'))st.push({id:'adjust',w:k});
    st.push({id:'loosen',w:k});st.push({id:'remove',w:k});
    if(i===0&&E.has('debris'))st.push({id:'debris',w:k});
    if(i===0&&E.has('blanket'))st.push({id:'blanket',w:k});
    st.push({id:'fit',w:k});if(ex)st.push({id:'switchT',w:k});
    st.push({id:'tighten',w:k});st.push({id:'confirm',w:k});
  });
  return st;
}
const STEP_TXT={
  adjust:'O carro passou da marca! Desliza ← para te reposicionares',
  move:'Roda traseira! Desliza → para lá chegares',
  loosen:'Mantém o gatilho para DESAPERTAR',
  remove:'Desliza ↓ para retirar a roda',
  debris:'Detritos no cubo! Toca 3× para limpar',
  blanket:'A manta térmica ficou presa! Desliza ↑',
  fit:'Encaixa a roda nova: toca no verde',
  swap:'Os colegas trocam a roda… espera pelo encaixe!',
  switchT:'Muda a pistola para APERTAR',
  switchL:'Muda a pistola para DESAPERTAR',
  tighten:'Mantém o gatilho e larga na zona verde',
  confirm:'Tudo apertado? Levanta a mão!',
  signal:'Apertada! Carrega no botão da pistola'
};
function nextStep(){
  if(!R)return;R.si++;hideControls();$('#trigger').classList.remove('held','jam');
  if(R.si>=R.steps.length){playerDone();return;}
  const s=R.steps[R.si];R.step=s;R.stepStart=now();R.slow=false;R.holding=false;R.prog=0;
  const wk=R.car.userData.wheels[s.w];R.cw=wk;
  setWheelState(s.w,'work');R.stepIdeal=stepIdeal(s.id);
  aidPrompt(STEP_TXT[s.id]);
  const showGun=()=>{$('#trigger').hidden=false;$('#dirSwitch').hidden=false;updDir();setRing(0);};
  switch(s.id){
    case 'adjust':swipeUI('left');break;
    case 'move':swipeUI('right');break;
    case 'remove':swipeUI('down');break;
    case 'blanket':swipeUI('up');break;
    case 'loosen':{showGun();const first=s.w===R.mine[0];
      R.need=R.cat.gun*cosmItem('gun',P.cosm.gun).bonus*(first&&R.events.has('stuck')?1.9:1)*R.wxm.loosen*R.press.need*(R.events.has('leak')?1.3:1);
      R.jamAt=first&&R.events.has('jam')?rand(.3,.7):9;R.jammed=false;R.firstPress=true;
      if(first&&R.events.has('leak')&&!R.flags.leakMsg){R.flags.leakMsg=1;toast('Fuga de ar! A pistola perde força','warn',1200);}
      if(first&&R.events.has('stuck')&&R.D.aids>=2&&!R.flags.stuckMsg){R.flags.stuckMsg=1;later(()=>toast('Porca presa — mantém o gatilho','warn',1000),400);}
      if(R.gunDir!=='L'&&R.D.aids>=3)$('#dirSwitch').classList.add('pulse');break;}
    case 'swap':showGun();R.flags.swapEarly=0;startSwap();break;
    case 'debris':R.taps=0;showAction('🧹 LIMPAR','',()=>{R.taps++;Snd.clank(900,.12);Cam.shake=.02;if(R.taps>=3){if(W.debris){W.debris.visible=false;}done(.15);}});break;
    case 'fit':{$('#timing').hidden=false;const mis=s.w===R.mine[0]&&R.events.has('misalign');
      R.fitW=R.D.fitW*(mis?.6:1)*R.wxm.fit*skillBonus().fit;R.fitSpd=R.D.fitSpd*(mis?1.4:1);R.fitC=rand(.25,.75);R.fitT0=now();R.fitting=false;
      const z=$('#tZone');z.style.left=((R.fitC-R.fitW/2)*100)+'%';z.style.width=(R.fitW*100)+'%';z.style.visibility=R.D.aids===0?'hidden':'visible';
      if(mis)toast('Roda desalinhada!','warn');break;}
    case 'switchT':case 'switchL':$('#dirSwitch').hidden=false;$('#dirSwitch').classList.add('pulse');updDir();break;
    case 'tighten':{showGun();$('#torque').hidden=false;R.tq=0;R.tqRate=1/(R.cat.gun*1.1*cosmItem('gun',P.cosm.gun).bonus)*R.D.tqRate*R.wxm.tq*R.press.tq;
      const [lo,hi]=tqBand();const z=$('#qZone');z.style.left=lo*100+'%';z.style.width=(hi-lo)*100+'%';z.style.visibility=R.D.aids===0?'hidden':'visible';$('#qFill').style.width='0%';
      const nut=wk.wheel.userData.nut;nut.visible=true;nut.position.z=nut.userData.z0;
      if(R.D.aids>=3&&R.gunDir!=='T')$('#dirSwitch').classList.add('pulse');break;}
    case 'confirm':showAction('✋ PRONTO','ready',()=>{Snd.good();tween(.25,k=>{W.fp.userData.lhG.position.y=.03+k*.25;},()=>tween(.3,k=>{W.fp.userData.lhG.position.y=.28-k*.25;}));done(.2);});break;
    case 'signal':showAction('🟢 BOTÃO · SINAL VERDE','ready',()=>{Snd.good();Snd.tone({f:1500,dur:.08,vol:.12});done(.04);});break;
  }
}
/* troca feita pelos colegas (modo pistoleiro): um tira a roda velha, outro põe a nova */
function aiArms(side,col){
  const g=new THREE.Group(),sl=M(col,{roughness:.88}),gl=M(0x1d1f23,{roughness:.65});
  [.6,-.6].forEach(a=>{const y=Math.sin(a)*.3,x=side*Math.cos(a)*.3;
    const arm=mesh(new THREE.CapsuleGeometry(.05,.6,4,8),sl,x+side*.36,y,.14,false);arm.rotation.z=Math.PI/2;g.add(arm);
    g.add(mesh(rbox(.1,.09,.12,.035),gl,x+side*.03,y,.14,false));});
  return g;
}
function startSwap(){
  const wk=R.cw,old=wk.wheel,E=R.events,ud=old.userData,first=wk===R.car.userData.wheels[R.mine[0]];
  old.add(aiArms(-1,R.team.c1));R.swapSeat=0;Snd.thud(.4);
  if(R.offM){const o=R.offM.position.clone();tween(.6,k=>{R.offM.position.x=o.x+Math.sin(k*Math.PI)*.25;R.offM.position.z=o.z-Math.sin(k*Math.PI)*.2;});}
  tween(.2,k=>{old.position.z=.5*ease(k);},()=>{
    tween(.18,k=>{old.position.x=-1.4*ease(k);old.position.y=-.08*k;},()=>{wk.slot.remove(old);});
    if(W.placed)W.placed.visible=false;
    const nw=makeWheel(ud.r,ud.w,R.picked||R.newCompound,first&&E.has('blanket'));nw.userData.nut.visible=false;nw.position.set(1.4,-.05,.5);
    const arms=aiArms(1,R.team.c1);nw.add(arms);wk.slot.add(nw);wk.wheel=nw;nw.traverse(o=>{if(o.isMesh)o.castShadow=true;});
    if(R.onM){const o=R.onM.position.clone();tween(.7,k=>{R.onM.position.x=o.x+Math.sin(k*Math.PI)*.25;R.onM.position.z=o.z-Math.sin(k*Math.PI)*.2;});}
    let wait=0;
    if(first&&E.has('debris')){toast('Detritos no cubo — o colega limpa','warn',1000);wait+=450;}
    later(()=>{
      tween(.2,k=>{nw.position.x=1.4*(1-ease(k));nw.position.y=-.05*(1-k);},()=>{
        const seat=()=>tween(.1,k=>{nw.position.z=.5*(1-k);},()=>{
          Snd.clank(260,.35);Snd.thud(.3);Cam.shake=.03;R.swapSeat=now();nw.remove(arms);
          setPrompt('AGORA! APERTA!');done(0);});
        const bl=nw.userData.blanket;
        if(bl){toast('Manta presa — o colega puxa-a','warn',900);tween(.35,k=>{bl.position.y=k*.9;bl.scale.setScalar(1-k*.5);},()=>{bl.visible=false;});}
        if(first&&E.has('misalign')){toast('Roda desalinhada — o colega tenta outra vez','warn',1100);Snd.thud(.35);
          tween(.42,k=>{nw.position.z=.5-.25*Math.sin(k*Math.PI);nw.rotation.z=Math.sin(k*Math.PI*3)*.06;},()=>later(seat,120));}
        else later(seat,bl?380:0);
      });
    },wait);
  });
}
function swipeUI(dir){const z=$('#swipeZone');z.hidden=false;const a=$('#swipeArrow');a.className='swipe-arrow '+dir;a.textContent={down:'↓',up:'↑',left:'←',right:'→'}[dir];R.swipeDir=dir;}
function done(delay=.15){
  if(!R||R.stepDone===R.si)return;R.stepDone=R.si;const s=R.step;
  R.stepsLog.push({id:s.id,t:now()-R.stepStart,ideal:R.stepIdeal});
  hideControls();R.lock=now()+delay;
  if(s.id==='confirm'||s.id==='signal'){setWheelState(s.w,'done');}
  later(nextStep,delay*1000);
}
function setWheelState(k,st){const e=$('#w-'+k);if(!e)return;e.setAttribute('class','w '+st+(R&&R.mine.includes(k)?' me':''));}
function setRing(p){$('#trigRing').style.strokeDashoffset=289*(1-clamp(p,0,1));}

/* ações sobre a roda */
function completeLoosen(){
  R.holding=false;Snd.gunStop(true);setRing(1);$('#trigger').classList.remove('held');
  const nut=R.cw.wheel.userData.nut;const z0=nut.position.z;
  tween(.18,k=>{nut.position.z=z0+.1*k;},()=>{nut.visible=false;});
  done(R.gunner?.04:.15);
}
function doRemove(){
  const wk=R.cw,old=wk.wheel;Snd.thud(.5);
  const z0=old.position.z;if(W.placed)W.placed.visible=false;
  tween(.28,k=>{old.position.z=z0+.6*ease(k);old.position.y=-.06*k;},()=>{
    wk.slot.remove(old);
    const nw=makeWheel(old.userData.r,old.userData.w,R.picked||R.newCompound,R.step&&R.events.has('blanket')&&wk===R.car.userData.wheels[R.mine[0]]);
    nw.userData.nut.visible=false;nw.position.z=.5;nw.position.y=-.03;wk.slot.add(nw);wk.wheel=nw;
    nw.traverse(o=>{if(o.isMesh)o.castShadow=true;});
    if(R.events.has('debris')&&wk===R.car.userData.wheels[R.mine[0]]){
      W.debris=mesh(new THREE.BoxGeometry(.18,.12,.02),MAT.carbon,.05,.08,.12);W.debris.rotation.z=.6;wk.slot.add(W.debris);}
  });
  done(.32);
}
function doBlanket(){const bl=R.cw.wheel.userData.blanket;Snd.noise({dur:.3,type:'bandpass',f:600,vol:.2});
  if(bl)tween(.3,k=>{bl.position.y=k*.9;bl.scale.setScalar(1-k*.5);},()=>{bl.visible=false;});done(.3);}
function fitTry(){
  if(!R||R.step?.id!=='fit'||now()<R.lock)return;
  const m=fitMarker();const nw=R.cw.wheel;
  if(Math.abs(m-R.fitC)<=R.fitW/2){
    Snd.clank(260,.35);Snd.thud(.3);Cam.shake=.03;
    const x0=nw.position.x;tween(.16,k=>{nw.position.z=.5*(1-k);nw.position.y=-.03*(1-k);nw.position.x=x0*(1-k);});
    R.acc.push(clamp(1-Math.abs(m-R.fitC)/(R.fitW/2)*.5,0,1));R.fitting=true;
    if(Math.abs(m-R.fitC)<R.fitW/6)toast('Encaixe perfeito','good',900);
    done(.2);
  }else{
    err('misfit','A roda não encaixou!',.45);Snd.thud(.4);R.lock=now()+.35;R.acc.push(0);
    tween(.35,k=>{nw.position.z=.5-.3*Math.sin(k*Math.PI);nw.rotation.z=Math.sin(k*Math.PI*3)*.08;});
  }
}
function fitMarker(){return .5+.5*Math.sin((now()-R.fitT0)*R.fitSpd-Math.PI/2);}
function evalTorque(){
  const [lo,hi]=tqBand();const q=R.tq;
  if(q<lo){if(R.D.aids>=1)toast('Ainda solta, continua!','warn',900);return;}
  R.acc.push(q<=hi?clamp(1-Math.abs(q-(lo+hi)/2)/(hi-lo),0,1):.15);
  if(q<=hi){R.perfect++;toast('Binário perfeito','good',900);Snd.good();}
  else err('over','Demasiado apertado!',.35);
  finishTighten();
}
function tqBand(){const b=skillBonus().tq;return[R.D.tq[0]-b,Math.min(.97,R.D.tq[1]+b)];}
function finishTighten(){R.holding=false;Snd.gunStop(true);$('#trigger').classList.remove('held');done(R.gunner?.04:.15);}

/* entrada: gatilho */
function trigDown(e){
  e.preventDefault();if(!R)return;Snd.init();
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}
  if(!R.working){if(!R.flags.early&&R.prepped){R.flags.early=1;err('early','Espera que o carro pare!',0);}return;}
  if(now()<R.lock||!R.step)return;
  const id=R.step.id;
  if(id==='swap'){if(!R.flags.swapEarly){R.flags.swapEarly=1;err('early2','Calma! A roda ainda não estava no sítio',.3);Snd.gunWrong();}return;}
  if(id==='loosen'){
    if(R.jammed){R.jamTaps++;Snd.tone({f:200,type:'square',dur:.06,vol:.15});Cam.shake=.02;
      if(Math.random()<(R.D.aids>=2?.5:.38)){unjam();toast('Pistola desencravada!','good',900);}return;}
    if(R.gunDir!=='L'){err('wrongdir','Sentido errado! Está em APERTAR',.4);Snd.gunWrong();$('#dirSwitch').classList.add('pulse');return;}
    if(R.firstPress){R.firstPress=false;R.reactAll.push(now()-R.stepStart);}
    R.holding=true;Snd.gunStart(false);$('#trigger').classList.add('held');
  }else if(id==='tighten'){
    if(R.gunDir!=='T'){err('wrongdir','Sentido errado! Está em DESAPERTAR',.4);Snd.gunWrong();$('#dirSwitch').classList.add('pulse');return;}
    if(R.swapSeat){const rt=now()-R.swapSeat;R.swapSeat=0;R.reacts.push(rt);R.reactAll.push(rt);toast('Reação '+f2(rt)+' s',rt<.35?'good':'warn',900);}
    R.holding=true;Snd.gunStart(true);$('#trigger').classList.add('held');
  }
}
/* encravamento: toques no gatilho (pode demorar) ou pistola de reserva (rápido e certo) */
function unjam(){R.jammed=false;$('#trigger').classList.remove('jam');$('#actionBtn').hidden=true;}
function offerSpare(){
  if(P.gear.spare<=0)return;
  showAction('🔁 PISTOLA DE RESERVA','',()=>{if(!R||!R.jammed)return;R.usedSpare=true;R.lock=now()+.6;Snd.clank(420,.25);Snd.thud(.2);
    W.fp.position.y-=.12;tween(.5,k=>{W.fp.position.y=W.fp.userData.base.y-.12*(1-k);});unjam();toast('Pistola de reserva','good',900);});
}
function trigUp(){
  if(!R||!R.holding)return;R.holding=false;$('#trigger').classList.remove('held');
  if(R.step&&R.step.id==='tighten'){Snd.gunStop(false);evalTorque();}
  else Snd.gunStop(false);
}
/* entrada: deslizar */
let sw=null;
function swDown(e){sw={x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}}
function swUp(e){
  if(!sw||!R||!R.step)return;let dx=e.clientX-sw.x,dy=e.clientY-sw.y;sw=null;
  if(rotated&&!e.kb){const t=dx;dx=dy;dy=-t;}
  if(Math.hypot(dx,dy)<35||now()<R.lock)return;
  const dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  if(dir!==R.swipeDir){toast('Para o outro lado!','warn',800);Snd.click();return;}
  const id=R.step.id;
  if(id==='remove')doRemove();
  else if(id==='blanket')doBlanket();
  else if(id==='adjust'){const p=wheelPose(R.car,R.step.w);camTo(p[0],p[1],7);Snd.noise({dur:.2,type:'lowpass',f:500,vol:.15});done(.3);}
  else if(id==='move'){const p=wheelPose(R.car,R.step.w);camTo(p[0],p[1],5);Cam.bob=.6;setTimeout(()=>{Cam.bob=0;},450);Snd.noise({dur:.25,type:'lowpass',f:500,vol:.15});done(.5);}
}
function toggleDir(){
  if(!R)return;R.gunDir=R.gunDir==='L'?'T':'L';updDir();Snd.click();Snd.tone({f:R.gunDir==='L'?500:700,type:'square',dur:.05,vol:.1});
  $('#dirSwitch').classList.remove('pulse');
  if(R.step&&R.step.id==='switchT'&&R.gunDir==='T')done(.1);
  else if(R.step&&R.step.id==='switchL'&&R.gunDir==='L')done(.1);
  else if(!R.working&&R.prepped)setPrompt('Espera pelo carro… não toques no gatilho');
}

function playerDone(){
  R.playerDone=now();R.step=null;hideControls();
  const wait=Object.values(R.ai).some(a=>a.st!=='done');
  setPrompt(wait?'Feito! À espera da equipa…':'');
  if(wait&&R.ai.RR&&R.ai.RR.st!=='done'&&R.events.has('crewdelay'))radio('Temos um problema na traseira direita! Aguenta!','chief',true);
  W.fp.userData.lhG.position.y=.28;
}
function release(){
  R.phase='release';R.tRelease=now();
  const t=raceTime();$('#timer').textContent=f2(t);$('#timer').className='timer done';$('#timer').style.color='';
  W.lightR.color.setHex(0x301010);W.lightG.color.setHex(0x22ff55);
  Snd.hiss(.4,.25);jackDown(.18);showPitGraphic(R,t);
  camTo(POSE.release[0],POSE.release[1],2.2);W.fp.visible=false;
  const good=t<=R.par;
  radio(good?'Vai, vai, vai! Excelente paragem!':'Vai, vai! Vamos lá recuperar.','ENGENHEIRO',true);
  setPrompt(f2(t)+' s');
  if(good)Snd.crowd(t<R.par*.85?1.4:1,3.5);
  R.leaveT=now();
  later(finishRace,3200);
}
const TV_LINES=r=>['Duelo intenso pela liderança','Volta mais rápida para o líder','Estratégia de uma paragem para a maioria','Diferença de 0,8 s no top 3',`${r.team.name} com bom ritmo`,'Pneus a degradar mais do que o previsto','Janela de paragens prestes a abrir'];

function updateRace(t,dt){
  const r=R;const el=t-r.t0;
  // TV: só desenha enquanto estamos na garagem
  const tvOn=(r.phase==='garage'||r.phase==='prep')&&Cam.pos.z<-6.6;
  const myPos=updateTV(dt,t,tvOn);
  if(!r.called){
    if(myPos&&myPos!==r.lastPos){r.lastPos=myPos;$('#hPos').textContent='P'+myPos;r.posBefore=myPos;}
    const us=TV.cars.find(c=>c.us);if(us){const l=Math.min(r.cat.laps,Math.max(1,tvLap(us)+1));if(l!==r.lap){r.lap=l;$('#hLap').textContent=`Volta ${l}/${r.cat.laps}`;}}
  }
  updRunners(t);updateWeather(dt,t);
  if(r.phase==='garage'){
    if(el>r.nextChat&&el<r.preWarnAt-1.5){r.nextChat=el+rand(5,7);
      if(Math.random()<.3)radio(pick(DRIVER_LINES),'driver');else{r.chatIdx=(r.chatIdx+1)%CHATTER.length;radio(CHATTER[r.chatIdx],pick(['engineer','strategist']));}W.tvLine=pick(TV_LINES(r));}
    if(el>r.preWarnAt&&!r.flags.pre){r.flags.pre=1;radio('Carro a entrar na próxima volta! Preparem-se.','engineer');later(()=>{if(R.phase==='garage')radio('Prepara a ferramenta!','chief');},2600);}
    if(el>r.warnAt)warnBox();
    if(tvOn&&Math.random()<dt*.3)Snd.pass(.03);
    const g=POSE.garage[0];camTo(V(g.x+Math.sin(t*.37)*.025,g.y+Math.sin(t*.23)*.012,g.z),POSE.garage[1],2);
  }
  if(r.fetch==='carry'){
    r.runT=Math.min(r.run,r.runT+dt*.85);const[p,l]=pathPose(CARRY_PATH,r.runT);camTo(p,l,6);
    if(r.runT>=.999)placeTyre();
    if(r.runT>=r.run-.01)Cam.bob=Math.max(0,Cam.bob-dt*3);
    $('#rFill').style.width=(r.run*100)+'%';
  }
  if(r.phase==='prep'&&!r.called&&t>r.carStopAt-4.4)callPit();
  // carro
  const tArr=r.carStopAt?r.carStopAt-t:999;
  if(r.carStopAt&&r.carState==='away'&&tArr<APPROACH_T){r.carState='approach';r.car.visible=true;r.eng=Snd.engine();}
  if((r.carState==='stopped'||r.carState==='jacked')&&r.phase!=='release')updateStopped(r,t,dt);
  updateRival(r,t,dt);
  if(r.carState==='approach'){
    if(updateApproach(r,t,dt,tArr)){r.car.position.set(r.stopX,0,0);r.car.rotation.y=0;if(r.eng)r.eng.set(68,.16,0,.2);carStopped();}
    if(r.inBox&&!r.working&&r.positioned)camTo(POSE.stand[0],V(r.car.position.x,.6,0),3.5);
  }
  // pit
  if(r.tStop&&r.phase!=='release'){
    const rt=raceTime();$('#timer').textContent=f2(rt);
    $('#timer').style.color=rt>r.par?'var(--alert)':'';
    const st=now()-r.tStop;
    Object.entries(r.ai).forEach(([k,a])=>{
      if(a.st==='pending'&&st>a.start){a.st='work';setWheelState(k,'work');if(k!=='FUEL'){Snd.distantGun(0);aiSwap(k,a);}}
      if(a.st==='work'&&st>a.done){a.st='done';setWheelState(k,'done');if(k!=='FUEL'){Snd.distantGun(0);Snd.clank(600,.06);}}
    });
    const left=Object.values(r.ai).filter(a=>a.st!=='done').length;
    $('#opsTxt').textContent=left?`Equipa: ${left} ${left===1?'tarefa':'tarefas'} em curso`:'Equipa: tudo pronto';
    if(r.playerDone&&!left&&r.phase!=='release'){if(laneClear(r))release();else if(!r.flags.hold){r.flags.hold=1;setPrompt('Carro a passar no pit lane: espera pela luz verde!',true);radio('Espera, espera! Carro a passar!','chief',true);}}
    if(r.step&&r.step.id!=='swap'&&!r.slow&&now()-r.stepStart>r.D.slow*(r.gunner?.55:1)*(r.step.id==='loosen'||r.step.id==='tighten'?1.4:1)){
      r.slow=true;R.errors.push({code:'slow',msg:'Demasiado lento: '+STEP_TXT[r.step.id].split(/[!:]/)[0],pen:0});$('#hErr').textContent=r.errors.length;
      if(R.D.aids>=1)setPrompt('DEPRESSA! '+STEP_TXT[r.step.id],true);Snd.tone({f:400,type:'square',dur:.1,vol:.08});
      if(Math.random()<.5)radio(pick(['Vamos, vamos!','Mais rápido!','O que se passa aí?']),'chief',true);
    }
  }
  // gatilho premido
  if(r.holding&&r.step){
    const sock=W.fp.userData.sock;sock.rotation.z+=dt*60*(r.gunDir==='L'?-1:1);Cam.shake=Math.max(Cam.shake,.008);
    const bz=W.fp.userData.base;W.fp.position.set(bz.x-.012+(Math.random()-.5)*.004,bz.y+.01+(Math.random()-.5)*.004,bz.z-.05);
    const nut=r.cw.wheel.userData.nut;
    if(r.step.id==='loosen'&&!r.jammed){
      r.prog+=dt/r.need;nut.rotation.z-=dt*40;setRing(r.prog);
      if(r.prog>=r.jamAt){r.jammed=true;r.jamTaps=0;r.jamAt=9;r.holding=false;Snd.gunStop();Snd.tone({f:90,type:'sawtooth',dur:.3,vol:.2});
        $('#trigger').classList.remove('held');$('#trigger').classList.add('jam');toast('Pistola encravada!','warn',1300);aidPrompt('Encravou! Toca no gatilho ou troca para a reserva');offerSpare();
        if(Math.random()<.6)radio('Temos um problema na operação!','chief',true);}
      if(r.prog>=1)completeLoosen();
    }else if(r.step.id==='tighten'){
      r.tq+=dt*r.tqRate;nut.rotation.z+=dt*40;$('#qFill').style.width=Math.min(100,r.tq*100)+'%';setRing(r.tq);
      if(r.tq>=1){err('over','Binário excessivo!',.6);finishTighten();}
    }
  }else if(W.fp){W.fp.position.lerp(W.fp.userData.base,.25);}
  if(r.step&&r.step.id==='fit'){const m=fitMarker();$('#tMarker').style.left=(m*100)+'%';
    if(!r.fitting&&now()>=r.lock&&r.cw.wheel)r.cw.wheel.position.x=(m-r.fitC)*.9;}
  if(r.prepped&&!r.positioned&&r.posOff!=null){
    r.posOff=lerp(r.posOff,r.posTgt,Math.min(1,dt*7));$('#pMarker').style.left=(50+r.posOff*50)+'%';
    if(Math.abs(r.posOff)<r.posZone&&Math.abs(r.posTgt-r.posOff)<.03){r.posHold+=dt;if(r.posHold>.35)finishPositioning(clamp(1-Math.abs(r.posOff)/r.posZone*.5,0,1));}else r.posHold=0;
    if(!r.positioned){const sp=POSE.stand[0].clone();sp.x+=r.posOff*1.3;if(r.carState==='approach')camTo(sp,V(r.car.position.x,.6,0),3.5);else camTo(sp,POSE.stand[1],5);}}
  // saída
  if(r.phase==='release')updateRelease(r,t,dt);
}
