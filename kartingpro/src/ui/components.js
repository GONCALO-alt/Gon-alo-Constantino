'use strict';
/* KARTING PRO · componentes reutilizáveis: ícones, bandeiras, folhas, avisos, gráficos, calendário */
(function(g){
const KP=g.KP,esc=KP.esc;
const ui=KP.ui={};
/* cores dos gráficos (validadas para daltonismo no fundo escuro) */
const C=ui.C={red:'#ef3b36',blue:'#3987e5',line:'#2a2a31',line2:'#3a3a44',muted:'#8b8b96',surface:'#141418',fg2:'#c6c6ce'};

/* ---- ícones (traço, herdam a cor do texto) ---- */
const P=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
ui.icon={
  home:P('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  timer:P('<circle cx="12" cy="13" r="8"/><path d="M12 13V9"/><path d="M10 2h4"/><path d="M19 6l1.5-1.5"/>'),
  train:P('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'),
  diary:P('<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/><path d="M9 8h6"/>'),
  stats:P('<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>'),
  flag:P('<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>'),
  bolt:P('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  eye:P('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  grid:P('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
  memory:P('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01"/>'),
  wave:P('<path d="M2 12h3l2-6 4 12 3-9 2 3h6"/>'),
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
  user:P('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>')
};

/* ---- bandeiras de pista (desenhadas, 60×40) ---- */
const chk=()=>{let s='';for(let y=0;y<4;y++)for(let x=0;x<6;x++)if((x+y)%2)s+=`<rect x="${x*10}" y="${y*10}" width="10" height="10" fill="#111"/>`;return`<rect width="60" height="40" fill="#f4f4f4"/>${s}`;};
ui.FLAGS={
  green:{name:'Verde',meaning:'Pista livre: fim do perigo, já se pode ultrapassar',svg:'<rect width="60" height="40" fill="#1fa34a"/>'},
  yellow:{name:'Amarela',meaning:'Perigo: abrandar e proibido ultrapassar',svg:'<rect width="60" height="40" fill="#f6c90e"/>'},
  red:{name:'Vermelha',meaning:'Sessão interrompida: abrandar e voltar às boxes',svg:'<rect width="60" height="40" fill="#d7261e"/>'},
  blue:{name:'Azul',meaning:'Deixar passar o piloto mais rápido que vem atrás',svg:'<rect width="60" height="40" fill="#1b5fd6"/>'},
  checker:{name:'Xadrez',meaning:'Fim da sessão ou da corrida',svg:chk()},
  black:{name:'Preta',meaning:'Desclassificado: entrar nas boxes',svg:'<rect width="60" height="40" fill="#111"/>'},
  blackOrange:{name:'Preta com disco laranja',meaning:'Problema mecânico: ir às boxes',svg:'<rect width="60" height="40" fill="#111"/><circle cx="30" cy="20" r="11" fill="#f07d1a"/>'},
  blackWhite:{name:'Meia preta, meia branca',meaning:'Aviso por conduta antidesportiva',svg:'<rect width="60" height="40" fill="#f4f4f4"/><path d="M0 40L60 0V40z" fill="#111"/>'},
  slippery:{name:'Riscas amarelas e vermelhas',meaning:'Piso escorregadio (óleo ou água)',svg:'<rect width="60" height="40" fill="#f6c90e"/>'+[1,3,5].map(i=>`<rect x="${i*10}" width="10" height="40" fill="#d7261e"/>`).join('')},
  white:{name:'Branca',meaning:'Veículo lento em pista',svg:'<rect width="60" height="40" fill="#f4f4f4"/>'}
};
ui.flag=(id,cls='flag')=>`<div class="${cls}" role="img" aria-label="Bandeira ${esc(ui.FLAGS[id].name)}"><svg viewBox="0 0 60 40" preserveAspectRatio="none">${ui.FLAGS[id].svg}</svg></div>`;
ui.flagSvg=id=>`<svg viewBox="0 0 60 40" role="img" aria-label="Bandeira ${esc(ui.FLAGS[id].name)}"><rect x=".5" y=".5" width="59" height="39" rx="3" fill="none" stroke="#3a3a44"/>${ui.FLAGS[id].svg.replace('<rect width="60" height="40"','<rect width="60" height="40" rx="3"')}</svg>`;

/* ---- avatar ---- */
ui.avatar=(p,cls='avatar')=>{const ini=(p.name||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'?';
  return`<span class="${cls}" style="background:${esc(p.color||'#ef3b36')}">${p.photo?`<img src="${esc(p.photo)}" alt="">`:esc(ini)}</span>`;};

/* ---- avisos curtos ---- */
ui.toast=(msg,kind='')=>{const box=KP.$('#toasts');const el=document.createElement('div');el.className='toast '+kind;el.textContent=msg;box.appendChild(el);
  while(box.children.length>3)box.firstChild.remove();setTimeout(()=>el.remove(),kind==='xp'?1700:1800);};

/* ---- folha inferior ---- */
ui.sheet=(html,{onClose}={})=>{
  const scrim=document.createElement('div');scrim.className='scrim';scrim.innerHTML=`<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  KP.$('#app').appendChild(scrim);
  const close=()=>{scrim.remove();onClose&&onClose();};
  scrim.addEventListener('click',e=>{if(e.target===scrim)close();});
  KP.$$('[data-close]',scrim).forEach(b=>b.onclick=close);
  return{el:scrim.querySelector('.sheet'),close};
};
ui.confirm=(title,text,ok='Confirmar',danger=false)=>new Promise(res=>{
  const s=ui.sheet(`<h3>${esc(title)}</h3><p class="muted" style="margin:0">${esc(text)}</p>
    <div class="row"><button class="btn grow" data-close>Cancelar</button><button class="btn grow ${danger?'danger':'primary'}" id="cfOk">${esc(ok)}</button></div>`,{onClose:()=>res(false)});
  KP.$('#cfOk',s.el).onclick=()=>{s.close();res(true);};
});
/* botão "mantém premido" (evita terminar sessões por engano) */
ui.hold=(btn,ms,onDone)=>{
  const bar=btn.querySelector('i');let st=0,raf=0,tm=0;
  const tick=()=>{const k=(KP.clock()-st)/ms;if(bar)bar.style.width=Math.min(100,k*100)+'%';if(k<1)raf=requestAnimationFrame(tick);};
  const stop=()=>{clearTimeout(tm);cancelAnimationFrame(raf);tm=0;if(bar)bar.style.width='0';};
  btn.addEventListener('pointerdown',e=>{e.preventDefault();st=KP.clock();tick();tm=setTimeout(()=>{stop();onDone();},ms);});
  ['pointerup','pointerleave','pointercancel'].forEach(t=>btn.addEventListener(t,()=>{if(tm)stop();}));
  btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onDone();}});
};
ui.empty=(title,text,action='')=>`<div class="empty"><b>${esc(title)}</b><p>${esc(text)}</p>${action}</div>`;
ui.tile=(label,value,sub='',hl=false)=>`<div class="tile ${hl?'hl':''}"><span class="eyebrow">${esc(label)}</span><span class="v">${value}</span>${sub?`<span class="s">${sub}</span>`:''}</div>`;

/* ---- gráficos (SVG, com dica ao tocar e vista em tabela) ---- */
function niceTicks(min,max,count=4){
  if(min===max){min-=1;max+=1;}
  const span=max-min,step0=span/count,mag=Math.pow(10,Math.floor(Math.log10(step0))),f=step0/mag;
  const step=(f<1.5?1:f<3?2:f<7?5:10)*mag;const lo=Math.floor(min/step)*step,hi=Math.ceil(max/step)*step;
  const t=[];for(let v=lo;v<=hi+step/2;v+=step)t.push(+v.toFixed(10));return t;
}
function chartShell(el,opt){
  el.classList.add('chart');el.innerHTML='';
  if(opt.legend&&opt.series&&opt.series.length>1){const lg=document.createElement('div');lg.className='legend';
    opt.series.forEach(s=>{const sp=document.createElement('span');sp.innerHTML=`<i class="${opt.bars?'sq':''}" style="background:${s.color}"></i>`;sp.appendChild(document.createTextNode(s.name));lg.appendChild(sp);});el.appendChild(lg);}
  const box=document.createElement('div');box.style.position='relative';el.appendChild(box);
  return box;
}
function tableToggle(el,head,rows){
  const b=document.createElement('button');b.className='toggle-tbl';b.textContent='Ver dados em tabela';el.appendChild(b);
  const w=document.createElement('div');w.className='tbl-wrap';w.hidden=true;
  const t=document.createElement('table');const tr=document.createElement('tr');head.forEach(h=>{const th=document.createElement('th');th.textContent=h;tr.appendChild(th);});
  const th=document.createElement('thead');th.appendChild(tr);t.appendChild(th);const tb=document.createElement('tbody');
  rows.forEach(r=>{const row=document.createElement('tr');r.forEach(c=>{const td=document.createElement('td');td.textContent=c;row.appendChild(td);});tb.appendChild(row);});
  t.appendChild(tb);w.appendChild(t);el.appendChild(w);
  b.onclick=()=>{w.hidden=!w.hidden;b.textContent=w.hidden?'Ver dados em tabela':'Esconder tabela';};
}
/* linhas: series=[{name,color,points:[{x,y,xl}]}]; uma só série dispensa legenda */
ui.lineChart=(el,opt)=>{
  const series=opt.series.filter(s=>s.points.length);
  if(!series.length){el.innerHTML=ui.empty('Sem dados neste período','Quando houver registos, a evolução aparece aqui.');return;}
  const box=chartShell(el,{legend:true,series});
  const W=Math.max(260,el.clientWidth||320),H=opt.height||190,L=50,Rm=14,T=10,B=26;
  const all=series.flatMap(s=>s.points.map(p=>p.y));let ymin=Math.min(...all),ymax=Math.max(...all);
  if(opt.zero){ymin=Math.min(0,ymin);}const pad=(ymax-ymin)*.12||Math.abs(ymax)*.05||1;
  const ticks=niceTicks(opt.zero?ymin:ymin-pad,ymax+pad,4);ymin=ticks[0];ymax=ticks[ticks.length-1];
  const xs=[...new Set(series.flatMap(s=>s.points.map(p=>p.x)))].sort((a,b)=>a-b);
  const xmin=xs[0],xmax=xs[xs.length-1];
  const X=x=>xmax===xmin?L+(W-L-Rm)/2:L+(x-xmin)/(xmax-xmin)*(W-L-Rm),Y=y=>T+(1-(y-ymin)/(ymax-ymin))*(H-T-B);
  const fy=opt.yFmt||(v=>v),fx=opt.xFmt||(v=>v);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.label||'Gráfico')}">`;
  ticks.forEach(t=>{s+=`<line x1="${L}" x2="${W-Rm}" y1="${Y(t)}" y2="${Y(t)}" stroke="${C.line}" stroke-width="1"/><text x="${L-6}" y="${Y(t)+4}" text-anchor="end" font-size="11" fill="${C.muted}" font-family="Chakra Petch, monospace">${esc(fy(t,true))}</text>`;});
  const xt=xs.length<=6?xs:[xs[0],xs[Math.floor(xs.length/3)],xs[Math.floor(2*xs.length/3)],xs[xs.length-1]];
  [...new Set(xt)].forEach((x,i,a)=>{s+=`<text x="${X(x)}" y="${H-6}" text-anchor="${a.length>1&&i===0?'start':a.length>1&&i===a.length-1?'end':'middle'}" font-size="11" fill="${C.muted}">${esc(fx(x))}</text>`;});
  series.forEach((se,si)=>{
    const pts=se.points.map(p=>[X(p.x),Y(p.y)]);
    const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    if(series.length===1&&pts.length>1)s+=`<path d="${d} L${pts[pts.length-1][0]} ${H-B} L${pts[0][0]} ${H-B}Z" fill="${se.color}" fill-opacity=".1"/>`;
    s+=`<path d="${d}" fill="none" stroke="${se.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const dots=pts.length<=24;
    se.points.forEach((p,i)=>{const hl=opt.highlight&&opt.highlight(p,si);if(dots||hl||i===pts.length-1)
      s+=`<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="${hl?6:4}" fill="${se.color}" stroke="${C.surface}" stroke-width="2"/>`;});
  });
  s+=`<line class="xh" x1="0" x2="0" y1="${T}" y2="${H-B}" stroke="${C.fg2}" stroke-width="1" visibility="hidden"/>`;
  s+=`<rect x="${L}" y="0" width="${W-L-Rm}" height="${H}" fill="transparent" class="hit"/></svg>`;
  box.innerHTML=s;
  const tt=document.createElement('div');tt.className='tt';tt.hidden=true;box.appendChild(tt);
  const svg=box.querySelector('svg'),xh=svg.querySelector('.xh');
  const show=e=>{const r=svg.getBoundingClientRect();const px=(e.clientX-r.left)/r.width*W;
    let best=xs[0];xs.forEach(x=>{if(Math.abs(X(x)-px)<Math.abs(X(best)-px))best=x;});
    xh.setAttribute('x1',X(best));xh.setAttribute('x2',X(best));xh.setAttribute('visibility','visible');
    tt.innerHTML='';const xl=document.createElement('div');xl.className='x';
    const any=series.map(se=>se.points.find(p=>p.x===best)).find(Boolean);xl.textContent=any&&any.xl?any.xl:fx(best);tt.appendChild(xl);
    series.forEach(se=>{const p=se.points.find(q=>q.x===best);if(!p)return;const row=document.createElement('div');row.className='r';
      row.innerHTML=`<i class="k" style="background:${se.color}"></i><b></b><span class="muted"></span>`;row.querySelector('b').textContent=fy(p.y);row.querySelector('span').textContent=se.name;tt.appendChild(row);});
    tt.hidden=false;const bx=X(best)/W*r.width;tt.style.left=Math.min(Math.max(0,bx-60),r.width-130)+'px';tt.style.top='0px';};
  const hide=()=>{tt.hidden=true;xh.setAttribute('visibility','hidden');};
  const hit=svg.querySelector('.hit');hit.addEventListener('pointermove',show);hit.addEventListener('pointerdown',show);hit.addEventListener('pointerleave',hide);
  if(opt.table!==false)tableToggle(el,[opt.xName||'',...series.map(s=>s.name)],xs.map(x=>{const any=series.map(se=>se.points.find(p=>p.x===x)).find(Boolean);
    return[any&&any.xl?any.xl:fx(x),...series.map(se=>{const p=se.points.find(q=>q.x===x);return p?fy(p.y):'—';})];}));
};
/* barras a partir de zero: bars=[{label,value,tip}] */
ui.barChart=(el,opt)=>{
  const bars=opt.bars;if(!bars.length||bars.every(b=>!b.value)){el.innerHTML=ui.empty('Sem dados neste período','Os totais aparecem quando houver registos.');return;}
  const box=chartShell(el,{});
  const W=Math.max(260,el.clientWidth||320),H=opt.height||170,L=34,Rm=8,T=10,B=26;
  const ticks=niceTicks(0,Math.max(...bars.map(b=>b.value)),3),ymax=ticks[ticks.length-1];
  const band=(W-L-Rm)/bars.length,bw=Math.min(24,band*.6),Y=v=>T+(1-v/ymax)*(H-T-B);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.label||'Gráfico de barras')}">`;
  ticks.forEach(t=>{s+=`<line x1="${L}" x2="${W-Rm}" y1="${Y(t)}" y2="${Y(t)}" stroke="${C.line}" stroke-width="1"/><text x="${L-6}" y="${Y(t)+4}" text-anchor="end" font-size="11" fill="${C.muted}" font-family="Chakra Petch, monospace">${t}</text>`;});
  const every=Math.ceil(bars.length/7);
  bars.forEach((b,i)=>{const x=L+band*i+(band-bw)/2,y=Y(b.value),h=H-B-y;
    if(b.value>0)s+=`<path class="bar-m" data-i="${i}" d="M${x} ${H-B} V${y+Math.min(4,h)} Q${x} ${y} ${x+Math.min(4,bw/2)} ${y} H${x+bw-Math.min(4,bw/2)} Q${x+bw} ${y} ${x+bw} ${y+Math.min(4,h)} V${H-B}Z" fill="${opt.color||C.red}"/>`;
    s+=`<rect data-i="${i}" class="bar-hit" x="${L+band*i}" y="${T}" width="${band}" height="${H-T-B}" fill="transparent"/>`;
    if(i%every===0)s+=`<text x="${x+bw/2}" y="${H-6}" text-anchor="middle" font-size="11" fill="${C.muted}">${esc(b.label)}</text>`;});
  s+='</svg>';box.innerHTML=s;
  const tt=document.createElement('div');tt.className='tt';tt.hidden=true;box.appendChild(tt);const svg=box.querySelector('svg');
  KP.$$('.bar-hit',svg).forEach(r=>{const f=e=>{const b=bars[+r.dataset.i];tt.innerHTML='<div class="x"></div><div class="r"><b></b></div>';tt.querySelector('.x').textContent=b.tip||b.label;tt.querySelector('b').textContent=(opt.yFmt||String)(b.value);
    const rr=svg.getBoundingClientRect(),bx=(+r.getAttribute('x')+band/2)/W*rr.width;tt.style.left=Math.min(Math.max(0,bx-55),rr.width-120)+'px';tt.style.top='0px';tt.hidden=false;
    KP.$$('.bar-m',svg).forEach(m=>m.setAttribute('fill-opacity',m.dataset.i===r.dataset.i?'1':'.55'));};
    r.addEventListener('pointermove',f);r.addEventListener('pointerdown',f);r.addEventListener('pointerleave',()=>{tt.hidden=true;KP.$$('.bar-m',svg).forEach(m=>m.setAttribute('fill-opacity','1'));});});
  tableToggle(el,[opt.xName||'',opt.yName||'Valor'],bars.map(b=>[b.tip||b.label,(opt.yFmt||String)(b.value)]));
};
/* mini tendência (sem eixos) para os cartões do início */
ui.spark=(vals,color=C.red,w=120,h=34)=>{
  if(vals.length<2)return'';const mn=Math.min(...vals),mx=Math.max(...vals),sp=mx-mn||1;
  const p=vals.map((v,i)=>[i/(vals.length-1)*(w-8)+4,4+(1-(v-mn)/sp)*(h-8)]);
  return`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><path d="${p.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ')}" fill="none" stroke="${C.line2}" stroke-width="2" stroke-linejoin="round"/><circle cx="${p[p.length-1][0]}" cy="${p[p.length-1][1]}" r="4" fill="${color}" stroke="${C.surface}" stroke-width="2"/></svg>`;
};

/* ---- calendário mensal (semana começa à segunda) ---- */
ui.calendar=(el,month,marks,onPick)=>{
  const y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1),start=new Date(first);start.setDate(1-((first.getDay()+6)%7));
  const today=KP.dayKey();let h=`<div class="cal-h"><button data-m="-1" aria-label="Mês anterior">‹</button><b>${first.toLocaleDateString('pt-PT',{month:'long',year:'numeric'})}</b><button data-m="1" aria-label="Mês seguinte">›</button></div><div class="cal">`;
  ['S','T','Q','Q','S','S','D'].forEach(d=>h+=`<span class="dow">${d}</span>`);
  for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const k=KP.dayKey(d),mk=marks[k]||{};
    h+=`<button class="d ${d.getMonth()!==m?'out':''} ${k===today?'today':''} ${mk.kart?'kart':''}" data-k="${k}" aria-label="${KP.fmtDate(d)}${mk.kart?', sessão de karting':''}${mk.train?', treino':''}">${d.getDate()}<span class="dots">${mk.train?'<i></i>':''}</span></button>`;}
  el.innerHTML=h+'</div>';
  KP.$$('[data-m]',el).forEach(b=>b.onclick=()=>{const nm=new Date(y,m+ +b.dataset.m,1);ui.calendar(el,nm,marks,onPick);});
  KP.$$('[data-k]',el).forEach(b=>b.onclick=()=>onPick&&onPick(b.dataset.k));
};
})(window);
