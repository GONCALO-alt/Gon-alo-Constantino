'use strict';
/* Pit Box · realismo da paragem: chegada do carro ao limitador, travagem, macacos, rodas trocadas pelos
   colegas, carros a passar no pit lane (saída insegura evitada), saída com patinagem e grafismo da TV */
const LIM=22.2,BRAKE_T=1.6,CRUISE_T=1.8,APPROACH_T=CRUISE_T+BRAKE_T;   // 80 km/h; trava em 1,6 s (~14 m/s²)
const APPROACH_L=LIM*CRUISE_T+LIM*LIM/(2*LIM/BRAKE_T);
const FAST_Z=2.9;                                                           // faixa rápida do pit lane

/* macaco com pivô no berço: rodar o pivô baixa a pega e levanta o carro */
function makeJack(from,to,col){
  const pv=new THREE.Group();pv.position.copy(from);
  const cm=M(col,{roughness:.4,metalness:.3}),dir=to.x>from.x?1:-1,rel=to.clone().sub(from);
  pv.add(rod(V3(0,0,0),rel,.035,MAT.steel));pv.add(mesh(rbox(.16,.07,.55,.02),cm,0,0,0));
  [-.18,.18].forEach(z=>pv.add(mesh(new THREE.CylinderGeometry(.05,.05,.04,12).rotateX(Math.PI/2),MAT.rubber,dir*.28,-from.y+.05,z)));
  pv.add(rod(V3(dir*.28,-from.y+.05,-.2),V3(dir*.28,-from.y+.05,.2),.02,MAT.steel));
  pv.add(mesh(rbox(.1,.05,.4,.015),MAT.rubber,rel.x,rel.y,rel.z));
  pv.userData.dir=dir;return pv;
}
function jackUp(sec){
  const J=R.jacks;
  if(J){tween(sec,k=>{const e=ease(k);J.f.rotation.z=-.16*e*J.f.userData.dir;J.r.rotation.z=-.16*e*J.r.userData.dir;});
    const z0=J.rg.position.z;tween(Math.min(.18,sec),k=>{J.rg.position.z=z0*(1-ease(k));});}
  tween(sec,k=>{R.car.position.y=.09*ease(k);});
}
function jackDown(sec){
  const J=R.jacks;tween(sec,k=>{R.car.position.y=.09*(1-k);if(J){J.f.rotation.z=-.16*(1-k)*J.f.userData.dir;J.r.rotation.z=-.16*(1-k)*J.r.userData.dir;}});
  Snd.thud(.35);
}
/* rodas a girar e travões quentes */
function spinWheels(car,d){
  Object.values(car.userData.wheels).forEach(w=>{const inner=w.wheel&&w.wheel.userData.inner;if(!inner)return;
    inner.rotation.z+=(w.slot.position.z<0?1:-1)*d/car.userData.wr;});
}
function steer(car,a){['FL','FR'].forEach(k=>{const s=car.userData.wheels[k].slot;s.rotation.y=(k==='FL'?Math.PI:0)+a;});}
/* chegada: limitador a 80 km/h, mudança de faixa para a box e travagem forte até às marcas */
function approachPose(tau,stopX){
  const v=LIM,a=LIM/BRAKE_T;let x,spd;
  if(tau<CRUISE_T){x=v*tau;spd=v;}else{const u=Math.min(tau-CRUISE_T,BRAKE_T);x=v*CRUISE_T+v*u-.5*a*u*u;spd=Math.max(0,v-a*u);}
  const k=clamp((tau-(CRUISE_T-.7))/1.7,0,1),z=FAST_Z*(1-k*k*(3-2*k));
  return{x:stopX-APPROACH_L+x,z,spd,braking:tau>=CRUISE_T};
}
function updateApproach(r,t,dt,tArr){
  const tau=clamp(APPROACH_T-tArr,0,APPROACH_T),p=approachPose(tau,r.stopX),car=r.car;
  const dx=p.x-car.position.x,dz=p.z-car.position.z;
  car.position.x=p.x;car.position.z=p.z;
  const yaw=Math.abs(dx)>1e-4?Math.atan2(-dz,dx):0;car.rotation.y=lerp(car.rotation.y,yaw,.5);
  steer(car,clamp((yaw-(r.lastYaw||0))/Math.max(dt,1e-3)*.35,-.32,.32));r.lastYaw=yaw;
  spinWheels(car,Math.hypot(dx,dz));
  const body=car.userData.body;body.rotation.z=p.braking?lerp(body.rotation.z,-.014*Math.min(1,p.spd/6+.4),.25):0;
  body.position.y=Math.sin(t*34)*.004;
  if(p.braking){MAT.disc.emissiveIntensity=Math.min(1,MAT.disc.emissiveIntensity+dt*.8);
    if(!r.flags.downshift){r.flags.downshift=1;[0,.35,.7,1.05].forEach(d=>Snd.tone({f:220-d*60,slide:160-d*40,type:'sawtooth',dur:.12,vol:.06,delay:d}));}}
  if(r.eng)r.eng.set(p.braking?60+p.spd*4.2:150,.3,p.braking?0:.9);
  if(tArr<1.1&&W.placed&&W.placed.userData.blanket&&!r.flags.blanketOff){r.flags.blanketOff=1;const bl=W.placed.userData.blanket;
    tween(.35,k=>{bl.position.y=k*.6;bl.scale.setScalar(1-k*.6);},()=>{bl.visible=false;});}
  return tau>=APPROACH_T;
}
/* parado: o nariz volta ao sítio, motor ao ralenti, discos arrefecem */
function updateStopped(r,t,dt){
  const body=r.car.userData.body;body.rotation.z=lerp(body.rotation.z,0,.15);body.position.y=Math.sin(t*40)*.0015;
  steer(r.car,lerp(r.car.userData.wheels.FR.slot.rotation.y,0,.2));
  MAT.disc.emissiveIntensity=Math.max(.25,MAT.disc.emissiveIntensity-dt*.12);
  if(r.eng&&Math.random()<dt*2)r.eng.set(66+rand(-3,6),.15,0,.15);
}
/* saída: patinagem, limitador e regresso à faixa rápida */
function updateRelease(r,t,dt){
  const lt=t-r.leaveT-.2;if(lt<=0)return;
  const a=13,spd=Math.min(LIM,a*lt),car=r.car;
  const x=r.stopX+(lt<LIM/a?.5*a*lt*lt:.5*LIM*LIM/a+LIM*(lt-LIM/a));
  const k=clamp((lt-.3)/1.6,0,1),z=FAST_Z*k*k*(3-2*k);
  const dx=x-car.position.x,dz=z-car.position.z;car.position.x=x;car.position.z=z;
  car.rotation.y=Math.abs(dx)>1e-4?lerp(car.rotation.y,Math.atan2(-dz,dx),.5):0;
  spinWheels(car,Math.hypot(dx,dz)*(lt<.5?1.8:1));
  if(lt<.45&&!r.flags.spin){r.flags.spin=1;Snd.noise({dur:.5,type:'bandpass',f:1800,q:1.5,vol:.16});}
  if(r.eng){r.eng.set(spd>=LIM-.5?150:90+spd*5,.36,spd>=LIM-.5?.9:0);if(lt>3.2){r.eng.stop();r.eng=null;}}
}
/* rodas das outras posições trocadas pelos colegas, ao ritmo real de cada um */
function aiSwap(k,a){
  const car=R.car,wk=car.userData.wheels[k];if(!wk)return;
  const old=wk.wheel,ud=old.userData,sideX=k[0]==='F'?-1:1;
  tween(.2,q=>{old.position.z=.55*ease(q);},()=>{tween(.18,q=>{old.position.x=sideX*1.3*ease(q);},()=>wk.slot.remove(old));
    const nw=makeWheel(ud.r,ud.w,R.picked||R.newCompound,false);nw.userData.nut.visible=true;nw.position.set(-sideX*1.3,-.04,.55);wk.slot.add(nw);wk.wheel=nw;
    nw.traverse(o=>{if(o.isMesh)o.castShadow=true;});
    tween(.22,q=>{nw.position.x=-sideX*1.3*(1-ease(q));});
    const seatIn=Math.max(.05,(R.tStop+a.done-.14)-now());
    later(()=>tween(.1,q=>{nw.position.z=.55*(1-q);nw.position.y=-.04*(1-q);}),seatIn*1000);});
}
/* tráfego no pit lane: carros de outras equipas a passar na faixa rápida */
function setupRival(cat,team){
  const others=TEAMS.filter(t=>t.cat===team.cat&&t.id!==team.id);const rt=others.length?pick(others):team;
  const car=makeCar(cat.car,rt.c1,rt.c2,'medium');car.visible=false;scene.add(car);
  const p={easy:.15,medium:.35,hard:.55,pro:.65}[R.diff]||.35;
  return{car,team:rt,active:false,x:0,next:R.t0+rand(6,12),duringStop:Math.random()<p,eng:null};
}
function updateRival(r,t,dt){
  const rv=r.rival;if(!rv)return;
  if(!rv.active){
    let go=t>rv.next&&r.phase==='prep'&&r.carState==='away'&&!r.called,x0=-75;
    if(rv.duringStop&&r.tStop&&!r.flags.rivalStop){go=true;x0=-50;r.flags.rivalStop=1;}
    if(go){rv.active=true;rv.x=x0;rv.car.visible=true;rv.car.position.set(rv.x,0,FAST_Z+.4);rv.eng=Snd.engine();}
    return;
  }
  rv.x+=LIM*dt;rv.car.position.x=rv.x;spinWheels(rv.car,LIM*dt);rv.car.userData.body.position.y=Math.sin(t*33)*.004;
  if(rv.eng){const d=rv.x-camera.position.x,close=Math.max(.04,.3-Math.abs(d)/120);rv.eng.set(150*(d<0?1.06:.94),close,.9);}
  if(rv.x>85){rv.active=false;rv.car.visible=false;if(rv.eng){rv.eng.stop();rv.eng=null;}rv.next=t+rand(9,16);}
}
/* luz verde só com o pit lane livre (evita uma saída insegura) */
function laneClear(r){const rv=r.rival;return!rv||!rv.active||rv.x>r.stopX+8||rv.x<r.stopX-16;}
function cleanupFx(r){if(r.rival){scene.remove(r.rival.car);if(r.rival.eng)r.rival.eng.stop();}MAT.disc.emissiveIntensity=.32;$('#pitGfx').hidden=true;}
/* grafismo de transmissão com o tempo da paragem */
function showPitGraphic(r,time){
  const g=$('#pitGfx');g.style.setProperty('--tc',hex(r.team.c1));
  $('#pgTeam').textContent=r.team.name.split(' (')[0].toUpperCase();$('#pgT').textContent=time.toFixed(2).replace('.',',');
  $('#pgSub').textContent=time<=r.par?`${f2(r.par-time)} s abaixo do objetivo`:`${f2(time-r.par)} s acima do objetivo`;
  g.hidden=false;g.classList.remove('in');void g.offsetWidth;g.classList.add('in');
}
