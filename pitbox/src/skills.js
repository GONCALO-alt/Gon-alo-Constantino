'use strict';
/* Pit Box · Atributos profissionais (rapidez, precisão, coordenação, consistência) e análise da paragem */
const SKILLS=['speed','precision','coordination','consistency'];
const SKILL_NAME={speed:'Rapidez',precision:'Precisão',coordination:'Coordenação',consistency:'Consistência'};
const STEP_NAME={position:'Posicionar',adjust:'Reposicionar',move:'Mudar de roda',loosen:'Desapertar',remove:'Retirar a roda',debris:'Limpar o cubo',blanket:'Tirar a manta',
  fit:'Encaixar',swap:'Troca pelos colegas',switchT:'Mudar sentido',switchL:'Mudar sentido',tighten:'Apertar',confirm:'Sinalizar',signal:'Sinal verde'};
const IDEAL={adjust:.5,move:.6,remove:.45,debris:.7,blanket:.45,fit:.75,switchT:.35,switchL:.35,confirm:.35,signal:.35};
const avg=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
const std=a=>{const m=avg(a);return Math.sqrt(avg(a.map(x=>(x-m)**2)));};
/* tempo ideal de cada passo (base para a análise e para a consistência) */
function stepIdeal(id){
  if(id==='loosen')return R.cat.gun*cosmItem('gun',P.cosm.gun).bonus+.2;
  if(id==='tighten')return ((R.D.tq[0]+R.D.tq[1])/2)*R.cat.gun*1.1*cosmItem('gun',P.cosm.gun).bonus/R.D.tqRate+.25;
  if(id==='swap')return null;
  return IDEAL[id]||.5;
}
function measureSkills(r,time){
  const n=c=>r.errors.filter(e=>e.code===c).length;
  const speed=clamp(Math.round(100*Math.min(1.15,r.par/time)/1.15),0,100);
  let precision=r.acc.length?100*avg(r.acc):70;precision-=14*n('misfit')+12*n('over')+10*n('wrongtyre');
  const rts=r.reactAll.length?r.reactAll:[];
  let coordination=rts.length?100*avg(rts.map(b=>clamp(1-(b-.2)/.9,0,1))):72;
  coordination-=15*(n('early')+n('early2'))+12*n('wrongdir')+10*n('late')+8*(n('noprep')+n('pos'));
  const ratios=r.stepsLog.filter(s=>s.ideal).map(s=>s.t/s.ideal);
  const c1=ratios.length>1?1-clamp(std(ratios)/.9,0,1):.7;
  const prev=P.stats.stops.filter(s=>s.cat===r.cat.id).slice(-6,-1).map(s=>s.t/s.par);
  const c2=prev.length?1-clamp(Math.abs(time/r.par-avg(prev))/.6,0,1):.7;
  return{speed,precision:clamp(Math.round(precision),0,100),coordination:clamp(Math.round(coordination),0,100),consistency:clamp(Math.round(100*(.55*c1+.45*c2)),0,100)};
}
/* os atributos do perfil aproximam-se devagar do que mostras em cada paragem */
function growSkills(m,mult=1){const d={};SKILLS.forEach(k=>{const o=P.skills[k];P.skills[k]=clamp(o+(m[k]-o)*.12*mult+.4*mult,0,100);d[k]=P.skills[k]-o;});return d;}
/* pequenos efeitos dos atributos (equilibrados): zona de binário e janela de encaixe um pouco maiores */
function skillBonus(){return{tq:(P.skills.precision-35)/65*.012,fit:1+(P.skills.coordination-35)/65*.1};}
function teamVerdict(grade,r){
  const t={S:['Perfeito. É assim que se ganham campeonatos.',5],A:['Excelente trabalho, equipa toda em sintonia.',4],B:['Boa paragem. Ainda há décimas para tirar.',3],
    C:['Aceitável, mas perdemos tempo. Vamos rever as imagens.',2],D:['Isto custou-nos a corrida. Amanhã treinamos o dobro.',1]}[grade];
  return{text:t[0],stars:t[1]};
}
/* onde se perdeu tempo: passo a passo, real vs ideal */
function timeLossHTML(r){
  const rows=r.stepsLog.filter(s=>s.ideal);if(!rows.length)return'';
  const mx=Math.max(...rows.map(s=>Math.max(s.t,s.ideal)));
  const worst=rows.map(s=>({...s,loss:s.t-s.ideal})).sort((a,b)=>b.loss-a.loss).filter(s=>s.loss>.15).slice(0,2);
  return`<div class="card"><div class="eyebrow">Análise · onde perdeste tempo</div>
    <div class="tl">${rows.map(s=>{const loss=s.t-s.ideal,bad=worst.some(w=>w===s||w.id===s.id&&w.t===s.t);
      return`<div class="tl-row ${bad?'bad':''}"><span>${STEP_NAME[s.id]||s.id}</span><div class="tl-bar"><i class="ideal" style="width:${s.ideal/mx*100}%"></i><i class="real" style="width:${s.t/mx*100}%"></i></div><b class="num">${f2(s.t)}${loss>.05?` <small>+${f2(loss)}</small>`:''}</b></div>`;}).join('')}</div>
    <p class="muted" style="margin:8px 0 0">${worst.length?'Maior perda: '+worst.map(w=>`${STEP_NAME[w.id]} (+${f2(w.loss)} s)`).join(', ')+'.':'Sem perdas relevantes. Passos dentro do tempo ideal.'} A barra clara é o tempo ideal.</p></div>`;
}
function skillsHTML(m,d){
  return`<div class="card"><div class="eyebrow">Avaliação técnica</div><div class="skills">${SKILLS.map(k=>`<div><span>${SKILL_NAME[k]}</span><div class="bar"><i style="width:${m[k]}%"></i></div><b class="num">${m[k]}</b></div>`).join('')}</div>
    <p class="muted" style="margin:8px 0 0">Perfil: ${SKILLS.map(k=>`${SKILL_NAME[k]} ${Math.round(P.skills[k])}${d[k]>=.5?' ▲':''}`).join(' · ')}</p></div>`;
}
