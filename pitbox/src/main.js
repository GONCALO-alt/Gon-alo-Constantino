'use strict';
/* Pit Box · Ciclo principal e arranque */
/* ---------------- CICLO PRINCIPAL ---------------- */
let last=now();
function loop(){
  requestAnimationFrame(loop);
  const t=now();const dt=Math.min(.05,t-last);last=t;
  updTweens(dt);
  if(R)updateRace(t,dt);
  else if(Cam.mode==='menu'){const a=.9+Math.sin(t*.12)*1.4;camTo(V(Math.cos(a)*7.6,2.1+Math.sin(t*.3)*.3,Math.sin(a)*7.6-.5),V(0,.45,0),2);}
  updateCam(dt,t);
  renderer.render(scene,camera);
}

/* ---------------- ARRANQUE ---------------- */
function boot(){
  if(!window.THREE){$('#loading').textContent='Sem ligação ao motor 3D. Verifica a internet e recarrega.';return;}
  initThree();
  W.fp=makeFPRig();camera.add(W.fp);
  applyPlayerLook(teamById(P.career.teamId));
  drawTVOverlay(0);
  $('#loading').remove();
  show('s-menu');
  loop();
  // eventos
  document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;Snd.init();Snd.click();const g=b.dataset.go;show(g.startsWith('s-')?g:'s-'+g);});
  document.addEventListener('pointerdown',()=>Snd.init(),{once:true});
  $('#tSound').onclick=()=>{P.settings.sound=!P.settings.sound;Snd.init();Snd.setOn(P.settings.sound);save();renderMenu();};
  $('#tOrient').onclick=cycleOrient;
  $('#tVoice').onclick=()=>{Snd.init();Snd.click();voiceModal();};
  const tr=$('#trigger');tr.addEventListener('pointerdown',trigDown);tr.addEventListener('pointerup',trigUp);tr.addEventListener('pointercancel',trigUp);tr.addEventListener('lostpointercapture',trigUp);
  tr.addEventListener('contextmenu',e=>e.preventDefault());
  $('#dirSwitch').addEventListener('click',toggleDir);
  const sz=$('#swipeZone');sz.addEventListener('pointerdown',swDown);sz.addEventListener('pointerup',swUp);
  $('#timing').addEventListener('pointerdown',e=>{e.preventDefault();fitTry();});
  $('#btnQuit').onclick=quitRace;
  document.addEventListener('keydown',e=>{ // atalhos para teclado (computador)
    if(!R)return;if(e.repeat)return;
    if(e.code==='Space'){e.preventDefault();if(R.step&&R.step.id==='fit')fitTry();else if(!$('#actionBtn').hidden)$('#actionBtn').click();else trigDown({preventDefault(){},currentTarget:tr,pointerId:0});}
    if(e.code==='KeyD')toggleDir();
    const map={ArrowDown:'down',ArrowUp:'up',ArrowLeft:'left',ArrowRight:'right'};
    if(map[e.code]&&R.step&&!$('#swipeZone').hidden){e.preventDefault();const d=map[e.code];const fake={x:0,y:0};sw=fake;const v={down:[0,80],up:[0,-80],left:[-80,0],right:[80,0]}[d];swUp({clientX:v[0],clientY:v[1],kb:true});}
  });
  document.addEventListener('keyup',e=>{if(e.code==='Space'&&R)trigUp();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&R)trigUp();});
}
boot();
