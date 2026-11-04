'use strict';
/* Pit Box · Ferramentas, manutenção e painel da garagem (ferramentas, carro, equipa, operação) */
const PRESS_LO=9.0,PRESS_HI=10.0;
const FIRST=['Rui','Tiago','Nuno','André','Bruno','Hugo','Pedro','Marco','Diogo','Luís','Carlos','Ricardo','Sérgio','Paulo','João','Miguel','Filipe','Vasco','Gonçalo','Duarte','Tomás','Jorge','Ana','Inês','Marta','Sara'];
const LAST=['Silva','Costa','Ferreira','Martins','Alves','Ribeiro','Nunes','Pinto','Lopes','Santos','Gomes','Vaz','Mendes','Rocha','Teixeira','Barros','Fonseca','Carvalho','Leite','Mota'];
function seeded(str){let h=2166136261;for(const ch of str)h=Math.imul(h^ch.charCodeAt(0),16777619);return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return((h^=h>>>16)>>>0)/4294967296;};}
const CREW_ROLES={
  F1:[['Pistoleiro · dianteira esquerda (tu)',1],['Pistoleiros',3],['Tira-roda',4],['Põe-roda',4],['Macaco dianteiro',1],['Macaco traseiro',1],['Estabilizadores',2],['Asa dianteira',2],['Controlo de saída',1],['Reserva',1]],
  F2:[['Pistoleiro · dianteira esquerda (tu)',1],['Pistoleiros',3],['Tira-roda',4],['Põe-roda',4],['Macaco dianteiro',1],['Macaco traseiro',1]],
  F3:[['Pistoleiro · dianteira esquerda (tu)',1],['Pistoleiros',3],['Tira-roda',4],['Põe-roda',4],['Macaco dianteiro',1],['Macaco traseiro',1]],
  F4:[['Rodas do lado esquerdo (tu)',1],['Rodas do lado direito',2],['Macaco dianteiro',1],['Macaco traseiro',1],['Chefe de mecânicos',1]],
  GT3:[['Rodas do lado esquerdo (tu)',1],['Rodas do lado direito',2],['Reabastecimento',1],['Macacos pneumáticos',1]]
};
/* estado por corrida: pressão, verificações, fuga escondida */
function gearInit(){
  R.gear={pressure:+rand(7.6,11.3).toFixed(1),checked:{pressure:false,test:false,hose:false},leak:Math.random()<.12+(100-P.gear.cond)/260,leakFixed:false,maintained:false,testMsg:'',hoseMsg:''};
}
const pressOk=()=>R.gear.pressure>=PRESS_LO&&R.gear.pressure<=PRESS_HI;
/* resolve as falhas de equipamento no início do trabalho: dependem do estado da pistola e das verificações feitas */
function gearResolve(){
  const g=R.gear,base={easy:.04,medium:.07,hard:.1,pro:.12}[R.diff]||.07;
  const pJam=clamp(base+(100-P.gear.cond)/100*.5-(g.checked.test?.08:0)-(g.maintained?.05:0)+(WX.id==='hot'?.04:0),.02,.85);
  R.gearInfo={pJam:Math.round(pJam*100)};
  if(Math.random()<pJam)R.events.add('jam');
  if(g.leak&&!g.leakFixed)R.events.add('leak');
  const p=g.pressure;R.press={need:p<PRESS_LO?1+(PRESS_LO-p)*.18:1,tq:p<PRESS_LO?1-(PRESS_LO-p)*.12:p>PRESS_HI?1+(p-PRESS_HI)*.22:1};
  if(!pressOk())R.events.add('pressure');
}
/* desgaste depois de cada paragem */
function gearAfterStop(){
  const gun=cosmItem('gun',P.cosm.gun),jam=R.events.has('jam'),over=R.errors.some(e=>e.code==='over');
  const loss=Math.round((5+rand(0,3))*(gun.dur||1)+(jam?6:0)+(over?4:0));
  P.gear.cond=Math.max(0,P.gear.cond-loss);P.gear.overTorque=over;
  if(R.usedSpare)P.gear.spare=Math.max(0,P.gear.spare-25);
  return loss;
}

/* ---------- painel da garagem ---------- */
let sheetOpen=null,sheetTimer=0;
function openSheet(id){
  if(!R||R.phase!=='garage'){closeSheet();return;}
  sheetOpen=id;$('#nextOp').hidden=true;setPrompt('');
  document.querySelectorAll('#gbar button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.sheet===id));
  const el=$('#sheet');el.hidden=false;
  ({tools:renderToolsSheet,car:renderCarSheet,team:renderTeamSheet,op:renderOpSheet})[id]();
  clearInterval(sheetTimer);if(id==='car')sheetTimer=setInterval(()=>{if(sheetOpen==='car'&&R)renderCarSheet();},700);
}
function closeSheet(){sheetOpen=null;clearInterval(sheetTimer);$('#sheet').hidden=true;$('#sheet').innerHTML='';document.querySelectorAll('#gbar button').forEach(b=>b.setAttribute('aria-pressed','false'));}
const sheetHead=t=>`<div class="sh-h"><b>${t}</b><button class="sh-x" aria-label="Fechar">✕</button></div>`;
function bindSheetClose(){$('#sheet .sh-x').onclick=()=>{Snd.click();closeSheet();};}

function renderToolsSheet(){
  const g=R.gear,gun=cosmItem('gun',P.cosm.gun),c=P.gear.cond,ck=g.checked,aids=R.D.aids;
  const band=aids>=2?`background:linear-gradient(90deg,#2a2f38 ${(PRESS_LO-6)/6*100}%,rgba(34,211,107,.6) ${(PRESS_LO-6)/6*100}% ${(PRESS_HI-6)/6*100}%,#2a2f38 ${(PRESS_HI-6)/6*100}%)`:'';
  $('#sheet').innerHTML=sheetHead('Ferramentas')+`
  <div class="tool-row"><div><b>${esc(gun.name)}</b><small>Pistola principal · ${c}%</small></div><div class="bar cond"><i style="width:${c}%;background:${c>60?'var(--go)':c>35?'var(--pit)':'var(--alert)'}"></i></div></div>
  <ol class="chk">
    <li class="${ck.pressure?'ok':''}"><div class="chk-h"><b>1 · Pressão do ar</b><span class="num" id="gPv">${f1(g.pressure)} bar</span></div>
      <input type="range" id="gPr" min="6" max="12" step="0.1" value="${g.pressure}" style="${band}" aria-label="Pressão do ar"><small>Alvo: ${f1(PRESS_LO)} a ${f1(PRESS_HI)} bar</small></li>
    <li class="${ck.test?'ok':''}"><div class="chk-h"><b>2 · Testar a pistola</b><button class="btn small" id="gTest">Mantém para testar</button></div><small id="gTr">${esc(g.testMsg)}</small></li>
    <li class="${ck.hose?'ok':''}"><div class="chk-h"><b>3 · Mangueira e soquete</b><button class="btn small" id="gHose">${ck.hose?'Inspecionado':'Inspecionar'}</button></div><small>${esc(g.hoseMsg)}</small>
      ${ck.hose&&g.leak&&!g.leakFixed?'<button class="btn small primary" id="gFix">Trocar mangueira</button>':''}</li>
  </ol>
  <div class="tool-act"><button class="btn small" id="gMaint" ${g.maintained?'disabled':''}><span>${g.maintained?'Manutenção feita':'🛠️ Manutenção · mantém 2 s'}</span><i class="hold"></i></button>
    <button class="btn small" id="gNew" ${P.credits<150?'disabled':''}>Pistola nova · 150 cr</button></div>
  <small class="muted">Pistola de reserva: ${P.gear.spare}% · Ferramentas por verificar aumentam o risco de falhas.</small>`;
  bindSheetClose();
  const pr=$('#gPr');pr.oninput=()=>{g.pressure=+pr.value;$('#gPv').textContent=f1(g.pressure)+' bar';};
  pr.onchange=()=>{g.checked.pressure=pressOk();Snd.click();if(g.checked.pressure){Snd.good();toast('Pressão certa','good',800);}renderToolsSheet();};
  const holdBtn=(el,ms,onDone,onStart,onCancel)=>{let tm=0,st=0,raf=0;const bar=el.querySelector('.hold');
    const tick=()=>{const k=(now()-st)/(ms/1000);if(bar)bar.style.width=Math.min(100,k*100)+'%';if(k<1)raf=requestAnimationFrame(tick);};
    el.onpointerdown=e=>{e.preventDefault();st=now();onStart&&onStart();tick();tm=setTimeout(()=>{cancelAnimationFrame(raf);tm=0;onDone();},ms);};
    const up=()=>{if(tm){clearTimeout(tm);tm=0;cancelAnimationFrame(raf);if(bar)bar.style.width='0';onCancel&&onCancel();}};el.onpointerup=up;el.onpointerleave=up;el.onpointercancel=up;};
  holdBtn($('#gTest'),700,()=>{Snd.gunStop(true);g.checked.test=true;
      g.testMsg=P.gear.cond<45?'Rotação irregular: a pistola precisa de manutenção.':!pressOk()?'Funciona, mas a pressão está fora do alvo.':'Rotação e binário OK.';renderToolsSheet();},
    ()=>Snd.gunStart(false),()=>Snd.gunStop(false));
  $('#gHose').onclick=()=>{if(g.checked.hose)return;Snd.click();g.hoseMsg='A inspecionar…';renderToolsSheet();
    setTimeout(()=>{if(!R)return;g.checked.hose=true;g.hoseMsg=g.leak?'Fuga de ar na ligação da mangueira!':'Sem fugas. Soquete em bom estado.';if(g.leak)Snd.hiss(.4,.15);if(sheetOpen==='tools')renderToolsSheet();},600);};
  const fx=$('#gFix');if(fx)fx.onclick=()=>{g.leakFixed=true;g.hoseMsg='Mangueira trocada.';Snd.clank(500,.2);renderToolsSheet();};
  if(!g.maintained)holdBtn($('#gMaint'),2000,()=>{g.maintained=true;P.gear.cond=Math.min(100,P.gear.cond+30);save();Snd.good();toast('Pistola afinada','good',900);renderToolsSheet();},
    ()=>Snd.noise({dur:2,type:'bandpass',f:900,q:2,vol:.06}));
  $('#gNew').onclick=()=>{if(P.credits<150)return;P.credits-=150;P.gear.cond=100;save();Snd.good();renderToolsSheet();};
}
function fmtLap(s){const m=Math.floor(s/60);return`${m}:${(s-m*60).toFixed(3).padStart(6,'0').replace('.',',')}`;}
function renderCarSheet(){
  const us=TV.cars.find(c=>c.us),order=TV.order,p=order.indexOf(us)+1,avgV=TV.trk.L/TV.trk.lapT*TV.pace,ci=R.carInfo;
  const ahead=p>1?(order[p-2].s-us.s)/avgV:null,behind=p<order.length?(us.s-order[p].s)/avgV:null;
  const wear=k=>Math.min(99,Math.round(ci.wear[k]+(R.lap-ci.lap0)*ci.rate));
  const cell=k=>`<div class="tyre"><b>${k}</b><span>${wear(k)}%</span><small>${ci.temp[k]}°C</small></div>`;
  $('#sheet').innerHTML=sheetHead('Estado do carro')+`
  <dl class="kv"><dt>Posição</dt><dd>P${p} · volta ${R.lap}/${R.cat.laps}</dd>
    <dt>Última volta</dt><dd class="num">${fmtLap(ci.lastLap)}</dd>
    <dt>Para o da frente</dt><dd class="num">${ahead==null?'—':'+'+f2(ahead)+' s'}</dd><dt>Para o de trás</dt><dd class="num">${behind==null?'—':'−'+f2(behind)+' s'}</dd>
    <dt>Pneus atuais</dt><dd>${COMPOUND[ci.compound].name} · ${R.lap-ci.lap0+ci.stint} voltas</dd>${R.cat.refuel?`<dt>Combustível</dt><dd>${Math.max(4,Math.round(ci.fuel-(R.lap-ci.lap0)*2.2))}%</dd>`:''}
    <dt>Condições</dt><dd>${WEATHER[R.wx].icon} ${WEATHER[R.wx].track} · ${R.temp}°C</dd></dl>
  <div class="tyres">${cell('FL')}${cell('FR')}${cell('RL')}${cell('RR')}</div><small class="muted">Desgaste dos pneus (dianteiros em cima)</small>`;
  bindSheetClose();
}
function renderTeamSheet(){
  const rnd=seeded(R.team.id),nm=()=>FIRST[Math.floor(rnd()*FIRST.length)]+' '+LAST[Math.floor(rnd()*LAST.length)];
  const roles=CREW_ROLES[R.cat.id],total=roles.reduce((a,r)=>a+r[1],0),chief=nm(),eng=nm();
  const C=P.career,conf=C.scores.length?Math.round(C.scores.slice(-3).reduce((a,b)=>a+b,0)/Math.min(3,C.scores.length)/10):0;
  $('#sheet').innerHTML=sheetHead(esc(R.team.name))+`
  <dl class="kv"><dt>Chefe de equipa</dt><dd>${chief}</dd><dt>Engenheiro de corrida</dt><dd>${eng}</dd><dt>Mecânicos na paragem</dt><dd>${total}</dd>${R.mode==='career'?`<dt>Confiança em ti</dt><dd>${conf}%</dd>`:''}</dl>
  <ul class="list">${roles.map(([r,n])=>`<li><span>${esc(r)}</span><b>${n}</b></li>`).join('')}</ul>
  <div class="eyebrow" style="margin-top:10px">Os teus atributos</div>
  <div class="skills">${SKILLS.map(k=>`<div><span>${SKILL_NAME[k]}</span><div class="bar"><i style="width:${P.skills[k]}%"></i></div><b class="num">${Math.round(P.skills[k])}</b></div>`).join('')}</div>`;
  bindSheetClose();
}
function renderOpSheet(){
  const w=WEATHER[R.wx],steps=R.gunner?['Pegar no pneu pedido e levá-lo à box','Pegar na pistola e posicionar-te na marca','Desapertar a porca (mantém o gatilho)','Esperar que os colegas troquem a roda','Mudar o sentido e apertar até à zona certa','Botão da pistola: sinal verde']
    :['Pegar no pneu pedido e levá-lo à box','Pegar na pistola e posicionar-te na marca','Desapertar, retirar e encaixar a roda nova','Mudar o sentido e apertar até à zona certa','Levantar a mão'+(R.mine.length>1?' e repetir na traseira':'')];
  $('#sheet').innerHTML=sheetHead('Próxima operação')+`
  <dl class="kv"><dt>Categoria</dt><dd>${R.cat.name} · ${R.D.name}</dd><dt>A tua função</dt><dd>${esc(R.roleTxt)}</dd>
    <dt>Pneus novos</dt><dd>${COMPOUND[R.newCompound].name}${R.cat.refuel?' + reabastecimento':''}</dd><dt>Objetivo</dt><dd class="num">${f1(R.par)} s</dd>
    <dt>Condições</dt><dd>${w.icon} ${w.name} · ${R.temp}°C</dd></dl>
  <p class="muted" style="margin:8px 0">${esc(w.note)}</p>
  <ol class="steps">${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`;
  bindSheetClose();
}
