'use strict';
/* KARTING PRO · Cronómetro
   O botão VOLTA usa o instante exato do toque (event.timeStamp), não a hora a que o ecrã é redesenhado.
   O estado é guardado a cada ação: se a app fechar, a sessão continua ao reabrir. */
(function(g){
const KP=g.KP,ui=KP.ui,S=KP.store,esc=KP.esc;
const T={sw:null,raf:0,wake:null,gpsStop:null,gpsAcc:null,flashTm:0,undoTm:0,audio:null};
const MINLAPS=[[0,'Sem'],[5000,'5 s'],[15000,'15 s'],[25000,'25 s']];

function persist(){const L=S.live();if(!L)return;L.sw=T.sw.toJSON();S.setLive(L);}
function beep(best){
  if(!S.settings().sound)return;
  try{T.audio=T.audio||new (g.AudioContext||g.webkitAudioContext)();const c=T.audio,t=c.currentTime,o=c.createOscillator(),gn=c.createGain();
    o.type='sine';o.frequency.value=best?1320:880;gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(.25,t+.01);gn.gain.exponentialRampToValueAtTime(.0001,t+.18);
    o.connect(gn);gn.connect(c.destination);o.start(t);o.stop(t+.2);}catch(e){}
}
async function wake(on){
  try{if(on&&S.settings().keepAwake&&navigator.wakeLock&&!T.wake){T.wake=await navigator.wakeLock.request('screen');T.wake.addEventListener('release',()=>{T.wake=null;});}
    if(!on&&T.wake){await T.wake.release();T.wake=null;}}catch(e){T.wake=null;}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S.live()&&T.sw&&T.sw.status==='running')wake(true);});

/* ---- ecrã de preparação ---- */
function setup(el){
  KP.app.focus(false);
  const st=S.settings(),p=S.profile(),last=S.sessions()[0],tracks=S.tracks(),karts=S.karts();
  const track=(last&&last.track)||p.homeTrack||'',kart=(last&&last.kart)||p.kart||'';
  el.innerHTML=`
  <section class="card" style="gap:12px">
    <div><h3 style="font-size:18px">Nova sessão</h3><span class="small muted">Os tempos ficam guardados automaticamente.</span></div>
    <div class="grid2">
      <div class="field"><label for="tmTrack">Circuito</label><input id="tmTrack" list="dlTracks" maxlength="60" value="${esc(track)}" placeholder="Nome do kartódromo"><datalist id="dlTracks">${tracks.map(t=>`<option value="${esc(t)}">`).join('')}</datalist></div>
      <div class="field"><label for="tmKart">Kart</label><input id="tmKart" list="dlKarts" maxlength="40" value="${esc(kart)}" placeholder="Ex.: kart 12"><datalist id="dlKarts">${karts.map(t=>`<option value="${esc(t)}">`).join('')}</datalist></div>
    </div>
    <div class="field"><label>Volta mínima <span class="muted">(ignora toques duplos)</span></label><div class="seg" id="tmMin">${MINLAPS.map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${st.minLapMs===v}">${l}</button>`).join('')}</div></div>
    <label class="switch"><span>A primeira volta é volta de saída<br><span class="small muted">Não conta para a melhor volta nem para a média</span></span><input type="checkbox" id="tmOut" ${st.outLap?'checked':''}></label>
    <div id="tmGps"></div>
    <button class="btn primary startbtn" id="tmStart">INICIAR</button>
    <p class="small muted" style="margin:0">Começa quando cruzares a linha de meta. Depois toca em VOLTA a cada passagem. Com teclado ou botão Bluetooth, a tecla Espaço também marca a volta.</p>
  </section>
  <section class="card"><div class="card-h"><h3>Sessões anteriores</h3>${S.sessions().length?'<button class="link" id="tmAll">Ver todas</button>':''}</div><div class="list" id="tmRecent"></div></section>`;
  KP.$$('#tmMin button',el).forEach(b=>b.onclick=()=>{S.setSettings({minLapMs:+b.dataset.v});KP.$$('#tmMin button',el).forEach(x=>x.setAttribute('aria-pressed',x===b));});
  KP.$('#tmOut',el).onchange=e=>S.setSettings({outLap:e.target.checked});
  const gpsBox=KP.$('#tmGps',el);
  const drawGps=()=>{const cal=KP.gps.calibration(KP.$('#tmTrack',el).value.trim());
    gpsBox.innerHTML=cal?`<label class="switch"><span>Voltas automáticas por GPS <span class="badge">experimental</span><br><span class="small muted">Linha calibrada com ±${Math.round(cal.acc)} m. O botão VOLTA continua a funcionar.</span></span><input type="checkbox" id="tmUseGps"></label>`
      :`<p class="small muted" style="margin:0">GPS (experimental): calibra a linha de meta deste circuito em Perfil › GPS para tentar voltas automáticas.</p>`;};
  drawGps();KP.$('#tmTrack',el).addEventListener('change',drawGps);
  KP.$('#tmStart',el).addEventListener('pointerdown',e=>{e.preventDefault();start(KP.eventClock(e),el);});
  KP.$('#tmStart',el).addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();start(KP.clock(),el);}});
  const all=KP.$('#tmAll',el);if(all)all.onclick=()=>KP.openSessionList();
  const rec=KP.$('#tmRecent',el),list=S.sessions().slice(0,3);
  rec.innerHTML=list.length?list.map(KP.sessionRow).join(''):ui.empty('Sem sessões guardadas','As sessões que terminares aparecem aqui.');
  KP.$$('[data-sid]',rec).forEach(b=>b.onclick=()=>KP.openSession(b.dataset.sid));
}
function start(t,el){
  const st=S.settings(),useGps=KP.$('#tmUseGps',el)&&KP.$('#tmUseGps',el).checked;
  T.sw=new KP.Stopwatch();T.sw.start(t,{minLapMs:st.minLapMs,outLap:st.outLap});
  S.setLive({sw:T.sw.toJSON(),track:KP.$('#tmTrack',el).value.trim(),kart:KP.$('#tmKart',el).value.trim(),gps:!!useGps});
  KP.vibrate(40);wake(true);KP.app.render();
}
/* ---- sessão em curso ---- */
function running(el){
  const L=S.live();if(!T.sw)T.sw=new KP.Stopwatch(L.sw);
  KP.app.focus(true);
  el.innerHTML=`<div class="tm" id="tm">
    <div class="tm-top"><span class="live" id="tmDot"></span><b style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(L.track||'Sessão')}</b>${L.kart?`<span class="muted">· ${esc(L.kart)}</span>`:''}<span class="grow"></span><span id="tmGpsAcc" class="small"></span><span class="num" id="tmTotal">0:00</span></div>
    <div class="tm-cur"><div class="lbl" id="tmLapN">VOLTA 1</div><div class="t" id="tmCur">0.0</div></div>
    <div class="tm-flash" id="tmFlash" aria-live="polite"></div>
    <div class="tm-stats" id="tmStats"></div>
    <div class="tm-laps" id="tmLaps"></div>
    <div class="tm-ctrl">
      <button class="lapbtn" id="tmLap" aria-label="Marcar volta">VOLTA<small id="tmLapHint">toca ao cruzar a meta</small></button>
      <button class="btn" id="tmPause">PAUSAR</button>
      <button class="btn holdbtn danger" id="tmEnd">TERMINAR<i></i></button>
    </div></div>`;
  el.style.padding='0';
  const lapBtn=KP.$('#tmLap',el);
  lapBtn.addEventListener('pointerdown',e=>{e.preventDefault();doLap(KP.eventClock(e),'toque');lapBtn.classList.add('hit');setTimeout(()=>lapBtn.classList.remove('hit'),120);});
  KP.$('#tmPause',el).onclick=()=>{const t=KP.clock();if(T.sw.status==='running'){T.sw.pause(t);wake(false);}else{T.sw.resume(t);wake(true);}persist();draw();};
  ui.hold(KP.$('#tmEnd',el),900,finish);
  if(L.gps)startGps(L.track);
  draw();loop();
}
function doLap(t,src){
  if(!T.sw||T.sw.status!=='running'){if(T.sw&&T.sw.status==='paused')flash('Em pausa: retoma para marcar voltas','');return;}
  const prevBest=KP.lapStats(T.sw.laps).best,r=T.sw.lap(t);if(!r)return;
  if(r.ignored){flash(`Toque ignorado (${KP.fmtTime(r.ms,{dec:1})} < volta mínima)`,'');return;}
  if(src==='gps')r.lap.src='gps';
  persist();const isBest=!r.lap.outlap&&(prevBest==null||r.ms<prevBest);
  KP.vibrate(isBest?[40,40,40]:40);beep(isBest);
  flash(r.lap.outlap?`Volta de saída ${KP.fmtTime(r.ms)}`:isBest?`${KP.fmtTime(r.ms)} · MELHOR VOLTA`:`${KP.fmtTime(r.ms)}  ${KP.fmtDelta(r.ms-prevBest)}`,isBest?'best':'',true);
  draw();
}
function flash(text,cls,undo){
  const f=KP.$('#tmFlash');if(!f)return;f.className='tm-flash '+cls;f.innerHTML='';f.appendChild(document.createTextNode(text));
  if(undo){const b=document.createElement('button');b.className='link';b.style.marginLeft='10px';b.textContent='Anular';b.onclick=()=>{const l=T.sw.removeLastLap();if(l){persist();draw();flash('Última volta anulada','');}};f.appendChild(b);}
  clearTimeout(T.flashTm);T.flashTm=setTimeout(()=>{if(f.isConnected)f.textContent='';},undo?6000:2500);
}
function draw(){
  if(!KP.$('#tm'))return;const sw=T.sw,laps=sw.laps,st=KP.lapStats(laps),last=laps[laps.length-1];
  KP.$('#tmLapN').textContent=sw.status==='paused'?'EM PAUSA':`VOLTA ${laps.length+1}`;
  KP.$('#tmDot').className=sw.status==='paused'?'live paused':'live';
  KP.$('#tmPause').textContent=sw.status==='paused'?'RETOMAR':'PAUSAR';
  KP.$('#tmStats').innerHTML=
    ui.tile('Última',last?KP.fmtTime(last.ms):'—')+ui.tile('Melhor',KP.fmtTime(st.best),'',true)+
    ui.tile('Δ melhor',last&&st.best!=null&&!last.outlap?KP.fmtDelta(last.ms-st.best):'—')+
    ui.tile('Média',KP.fmtTime(st.avg))+ui.tile('Voltas',String(laps.length))+ui.tile('Desvio',st.std!=null?'±'+(st.std/1000).toFixed(2)+' s':'—');
  const box=KP.$('#tmLaps');
  box.innerHTML=laps.length?laps.map((l,i)=>({l,i})).reverse().map(({l,i})=>{const best=i===st.bestIndex;
    return`<div class="lap ${best?'best':''} ${l.outlap?'out':''}"><span class="n">${i+1}</span><span class="ms">${KP.fmtTime(l.ms)}</span><span class="dl">${l.outlap?'SAÍDA':best?'MELHOR':st.best!=null?KP.fmtDelta(l.ms-st.best):''}${l.src==='gps'?' · GPS':''}</span></div>`;}).join('')
    :`<p class="muted small" style="padding:12px;margin:0">As voltas aparecem aqui. A melhor fica destacada a vermelho.</p>`;
}
function loop(){
  cancelAnimationFrame(T.raf);
  const tick=()=>{const cur=KP.$('#tmCur');if(!cur||!T.sw)return;const t=KP.clock();
    cur.textContent=KP.fmtTime(T.sw.currentLap(t),{dec:1});
    const tot=Math.floor(T.sw.elapsed(t)/1000);KP.$('#tmTotal').textContent=Math.floor(tot/60)+':'+String(tot%60).padStart(2,'0');
    T.raf=requestAnimationFrame(tick);};
  tick();
}
async function finish(){
  const t=KP.clock(),L=S.live();cancelAnimationFrame(T.raf);stopGps();
  const r=T.sw.finish(t);T.sw=null;S.setLive(null);wake(false);KP.app.focus(false);
  if(!r||!r.laps.length){ui.toast('Sessão sem voltas completas: não foi guardada');KP.app.render();return;}
  const ses=S.saveSession({source:'timer',date:Math.round(r.startedAt),track:L.track,kart:L.kart,laps:r.laps.map(l=>{const o={ms:l.ms,valid:true};if(l.outlap)o.outlap=true;if(l.src)o.src=l.src;return o;}),
    durationMs:r.durationMs,gps:!!L.gps,weather:'',trackCond:'',feel:0,good:'',improve:'',notes:''});
  ui.toast('Sessão guardada');KP.app.render();KP.openSession(ses.id,{justFinished:true});
}
/* ---- GPS experimental ---- */
function startGps(track){
  const cal=KP.gps.calibration(track);if(!cal)return;
  T.gpsStop=KP.gps.detect(cal,{minLapMs:T.sw.minLapMs,onCross:ts=>doLap(ts,'gps'),onAccuracy:a=>{const e=KP.$('#tmGpsAcc');if(e)e.textContent=a==null?'GPS sem sinal':`GPS ±${Math.round(a)} m`;},
    onError:m=>{const e=KP.$('#tmGpsAcc');if(e)e.textContent='GPS indisponível';flash(m,'');}});
}
function stopGps(){if(T.gpsStop){T.gpsStop();T.gpsStop=null;}}

KP.app.view('cronometro',{
  render(el){el.style.padding='';const L=S.live();if(L&&L.sw&&L.sw.status!=='finished')running(el);else setup(el);},
  leave(){cancelAnimationFrame(T.raf);KP.app.focus(false);}
});
/* teclado / botão Bluetooth: Espaço ou Enter marcam a volta */
document.addEventListener('keydown',e=>{
  if(KP.app.cur!=='cronometro'||!S.live()||KP.app.stack.length)return;
  if((e.code==='Space'||e.code==='Enter'||e.code==='AudioVolumeUp')&&!e.repeat){e.preventDefault();doLap(KP.eventClock(e),'tecla');}
});
KP.timer={resume(){if(S.live()&&!T.sw)T.sw=new KP.Stopwatch(S.live().sw);}};
})(window);
