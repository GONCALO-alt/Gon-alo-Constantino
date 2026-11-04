'use strict';
/* KARTING PRO · Perfil do piloto, progressão, definições, GPS e dados */
(function(g){
const KP=g.KP,ui=KP.ui,S=KP.store,esc=KP.esc;
const COLORS=['#ef3b36','#3987e5','#f2a93b','#34c26f','#a35cf0','#e8e8ec'];
function resizePhoto(file,cb){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const s=256,c=document.createElement('canvas');c.width=c.height=s;
  const k=Math.max(s/img.width,s/img.height),w=img.width*k,h=img.height*k;c.getContext('2d').drawImage(img,(s-w)/2,(s-h)/2,w,h);cb(c.toDataURL('image/jpeg',.82));};img.src=r.result;};r.readAsDataURL(file);}
function editProfile(done){
  const p=S.profile();let photo=p.photo,color=p.color;
  const sh=ui.sheet(`<h3>Editar perfil</h3><form id="pfF" style="display:flex;flex-direction:column;gap:12px">
    <div class="row"><span id="pfAv">${ui.avatar(p,'avatar lg')}</span><div class="grow" style="display:flex;flex-direction:column;gap:6px">
      <label class="btn" for="pfPhoto" style="min-height:40px">Escolher fotografia</label><input id="pfPhoto" type="file" accept="image/*" hidden>
      <button type="button" class="btn ghost" id="pfNoPh" style="min-height:36px" ${photo?'':'hidden'}>Remover fotografia</button></div></div>
    <div class="field"><label>Cor do avatar</label><div class="chips">${COLORS.map(c=>`<button type="button" class="chip" data-c="${c}" aria-pressed="${c===color}" aria-label="Cor ${c}"><i style="width:16px;height:16px;border-radius:50%;background:${c};display:inline-block"></i></button>`).join('')}</div></div>
    <div class="field"><label for="pfName">Nome</label><input id="pfName" required maxlength="40" value="${esc(p.name)}"></div>
    <div class="grid2"><div class="field"><label for="pfKart">Kart</label><input id="pfKart" maxlength="40" value="${esc(p.kart)}"></div>
      <div class="field"><label for="pfTrack">Kartódromo habitual</label><input id="pfTrack" maxlength="60" value="${esc(p.homeTrack)}"></div></div>
    <p class="small muted" style="margin:0">A fotografia fica só neste telemóvel.</p>
    <div class="row"><button type="button" class="btn grow" data-close>Cancelar</button><button class="btn primary grow" type="submit">Guardar</button></div></form>`);
  const el=sh.el,redraw=()=>{KP.$('#pfAv',el).innerHTML=ui.avatar({...p,name:KP.$('#pfName',el).value,photo,color},'avatar lg');KP.$('#pfNoPh',el).hidden=!photo;};
  KP.$('#pfPhoto',el).onchange=e=>{const f=e.target.files[0];if(f)resizePhoto(f,d=>{photo=d;redraw();});};
  KP.$('#pfNoPh',el).onclick=()=>{photo='';redraw();};
  KP.$$('[data-c]',el).forEach(b=>b.onclick=()=>{color=b.dataset.c;KP.$$('[data-c]',el).forEach(x=>x.setAttribute('aria-pressed',x===b));redraw();});
  KP.$('#pfF',el).onsubmit=e=>{e.preventDefault();const name=KP.$('#pfName',el).value.trim();if(!name)return;
    S.setProfile({name,kart:KP.$('#pfKart',el).value.trim(),homeTrack:KP.$('#pfTrack',el).value.trim(),photo,color});sh.close();ui.toast('Perfil guardado');done();};
}
function gpsSheet(done){
  const sh=ui.sheet(`<h3>GPS · linha de meta <span class="badge">experimental</span></h3>
    <p class="small muted" style="margin:0">Fica parado em cima da linha de meta durante 15 segundos, ao ar livre. O GPS de um telemóvel costuma errar 3 a 10 metros e atualiza cerca de uma vez por segundo: a 60 km/h isso pode dar 0,2 a 0,6 s de diferença por volta. Usa-o para contar voltas; para tempos fiáveis, usa o botão VOLTA.</p>
    <div class="field"><label for="gpTrack">Circuito</label><input id="gpTrack" list="gpTl" value="${esc(S.profile().homeTrack||S.tracks()[0]||'')}"><datalist id="gpTl">${S.tracks().map(t=>`<option value="${esc(t)}">`).join('')}</datalist></div>
    <div class="note" id="gpStat">${KP.gps.supported()?'Pronto para calibrar.':'Este browser não tem localização disponível.'}</div>
    <div class="row"><button class="btn grow" data-close>Fechar</button><button class="btn primary grow" id="gpGo" ${KP.gps.supported()?'':'disabled'}>Calibrar (15 s)</button></div>`,{onClose:()=>{stop&&stop();done();}});
  let stop=null;const st=KP.$('#gpStat',sh.el);
  KP.$('#gpGo',sh.el).onclick=()=>{const t=KP.$('#gpTrack',sh.el).value.trim();if(!t){st.textContent='Escreve o nome do circuito.';return;}
    KP.$('#gpGo',sh.el).disabled=true;st.textContent='A ler o GPS… não te mexas.';
    stop=KP.gps.calibrate(t,{onSample:(a,n)=>{st.textContent=`Leituras: ${n} · precisão atual ±${Math.round(a)} m`;},
      onDone:c=>{st.textContent=`Linha guardada para ${c.track}: precisão típica ±${Math.round(c.acc)} m (${c.samples} leituras). ${c.acc>10?'Precisão fraca: as voltas automáticas podem falhar.':''}`;KP.$('#gpGo',sh.el).disabled=false;},
      onError:m=>{st.textContent=m;KP.$('#gpGo',sh.el).disabled=false;}});};
}
KP.app.view('perfil',{render(el){
  const p=S.profile();if(!p.name){KP.app.go('inicio');return;}
  const d=S.raw(),lv=KP.levelOf(d.xp.total),ses=S.sessions(),laps=ses.reduce((a,s)=>a+KP.sessionStats(s).count,0),mt=KP.mainTrack(),bt=mt?KP.bestAt(mt):{best:null};
  const light=S.drills('light').filter(x=>x.avg!=null),st=S.settings(),badges=KP.badges();
  const days=Object.keys(d.challenges).sort().reverse().slice(0,14);
  el.innerHTML=`
  <section class="card" style="flex-direction:row;align-items:center">${ui.avatar(p,'avatar lg')}<div class="grow" style="min-width:0"><h2 style="font-size:22px;font-weight:900">${esc(p.name)}</h2>
    <div class="small muted">${esc(lv.name)} · desde ${KP.fmtDate(p.createdAt)}</div>${p.kart||p.homeTrack?`<div class="small muted">${esc([p.kart,p.homeTrack].filter(Boolean).join(' · '))}</div>`:''}</div><button class="btn" id="pEdit" style="min-height:40px">Editar</button></section>
  <section class="card"><div class="card-h"><h3>Nível</h3><span class="num">${KP.fmtInt(d.xp.total)} XP</span></div>
    <div class="bar"><i style="width:${Math.round(lv.progress*100)}%"></i></div><div class="small muted">${lv.next?`${KP.fmtInt(lv.next-d.xp.total)} XP para ${lv.nextName}`:'Chegaste ao nível máximo'}</div>
    <div class="list">${KP.LEVELS.map((L,i)=>{const h=d.levels.find(x=>x.level===i);return`<div class="li" style="min-height:44px"><span class="badge ${i<=lv.index?'red':''}">${i+1}</span><span class="t">${L.name}</span><span class="r small muted">${h?'desde '+KP.fmtDate(h.at):KP.fmtInt(L.min)+' XP'}</span></div>`;}).join('')}</div></section>
  <section class="tiles">${ui.tile('Sessões',String(ses.length))}${ui.tile('Voltas',KP.fmtInt(laps))}${ui.tile('Melhor tempo',KP.fmtTime(bt.best),mt?esc(mt):'—',bt.best!=null)}
    ${ui.tile('Reação',light.length?Math.round(KP.min(light.map(x=>x.best).filter(v=>v!=null)))+' ms':'—',light.length?`melhor · média ${Math.round(KP.mean(light.slice(-10).map(x=>x.avg)))} ms`:'sem testes')}</section>
  <section class="card"><div class="card-h"><h3>Recompensas</h3><span class="small muted">${badges.filter(b=>b.got).length}/${badges.length}</span></div>
    <div class="list">${badges.map(b=>`<div class="li" style="min-height:48px"><span class="badge ${b.got?'red':''}">${b.got?'✓':Math.round(b.prog*100)+'%'}</span><div style="min-width:0"><div class="t">${esc(b.name)}</div><div class="d">${esc(b.desc)}</div></div></div>`).join('')}</div></section>
  <section class="card"><div class="card-h"><h3>Desafios</h3><span class="small muted">sequência: ${KP.streak()} dias</span></div>
    <div class="list">${days.map(k=>{const c=d.challenges[k],n=c.list.filter(x=>x.done).length;return`<div class="li" style="min-height:44px"><span class="t">${KP.relDay(KP.fromKey(k))}</span><span class="d">${c.list.map(x=>KP.CHALLENGES[x.id]?(x.done?'✓ ':'· ')+KP.CHALLENGES[x.id].text:'').join(' ')}</span><span class="r num">${n}/3</span></div>`;}).join('')||ui.empty('Sem desafios ainda','Os desafios aparecem no Início todos os dias.')}</div></section>
  <section class="card"><div class="card-h"><h3>XP recente</h3></div><div class="list">${d.xp.log.slice(-8).reverse().map(x=>`<div class="li" style="min-height:40px"><span class="small">${esc(x.reason)}</span><span class="r num small">+${x.amount} · ${KP.relDay(x.at)}</span></div>`).join('')||ui.empty('Ainda sem XP','Ganha XP a registar sessões, treinar e completar desafios.')}</div></section>
  <section class="card"><div class="card-h"><h3>Definições</h3></div>
    <label class="switch"><span>Manter o ecrã ligado durante a sessão</span><input type="checkbox" data-s="keepAwake" ${st.keepAwake?'checked':''}></label>
    <label class="switch"><span>Vibração ao marcar voltas</span><input type="checkbox" data-s="haptics" ${st.haptics?'checked':''}></label>
    <label class="switch"><span>Sons</span><input type="checkbox" data-s="sound" ${st.sound?'checked':''}></label></section>
  <section class="card"><div class="card-h"><h3>GPS <span class="badge">experimental</span></h3><button class="link" id="pGps">Calibrar</button></div>
    <div class="list">${KP.gps.list().map(c=>`<div class="li" style="min-height:44px"><div><div class="t">${esc(c.track)}</div><div class="d">±${Math.round(c.acc)} m · ${KP.fmtDate(c.at)}</div></div><button class="link r" data-gdel="${esc(c.track)}">Apagar</button></div>`).join('')||'<p class="small muted" style="margin:0">Sem linhas de meta calibradas. As voltas automáticas por GPS são uma ajuda aproximada, não substituem o botão VOLTA.</p>'}</div></section>
  <section class="card"><div class="card-h"><h3>Os teus dados</h3></div>
    <p class="small muted" style="margin:0">Sem conta e sem servidor: tudo fica guardado neste telemóvel${S.ok()?'':' (atenção: o armazenamento está bloqueado neste browser, os dados não vão ser guardados)'}. Exporta uma cópia de vez em quando.</p>
    <div class="row"><button class="btn grow" id="pExp">Exportar</button><label class="btn grow" for="pImp">Importar cópia</label><input id="pImp" type="file" accept="application/json,.json" hidden></div>
    <button class="btn danger block" id="pDel">Apagar todos os dados</button></section>
  <p class="small muted" style="text-align:center;margin:0">KARTING PRO 1.0 · TRAIN. IMPROVE. RACE.</p>`;
  KP.$('#pEdit',el).onclick=()=>editProfile(()=>KP.app.refresh());
  KP.$$('[data-s]',el).forEach(i=>i.onchange=()=>S.setSettings({[i.dataset.s]:i.checked}));
  KP.$('#pGps',el).onclick=()=>gpsSheet(()=>KP.app.refresh());
  KP.$$('[data-gdel]',el).forEach(b=>b.onclick=async()=>{if(await ui.confirm('Apagar calibração?',`A linha de meta de ${b.dataset.gdel} deixa de estar guardada.`,'Apagar',true)){KP.gps.remove(b.dataset.gdel);KP.app.refresh();}});
  KP.$('#pExp',el).onclick=()=>KP.exportMenu();
  KP.$('#pImp',el).onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const res=S.importJSON(r.result);ui.toast(`Importado: ${res.sessions} sessões, ${res.drills} treinos`);KP.app.refresh();}catch(err){ui.toast(err.message);}};r.readAsText(f);};
  KP.$('#pDel',el).onclick=async()=>{if(await ui.confirm('Apagar todos os dados?','Sessões, voltas, treinos, XP e perfil são apagados deste telemóvel. Exporta uma cópia antes, se quiseres guardar.','Apagar tudo',true)){S.reset();ui.toast('Dados apagados');KP.app.go('inicio');}};
}});
})(window);
