'use strict';
/* Pit Box · Câmara e animações (tweens) */
/* ---------------- CÂMARA ---------------- */
const Cam={pos:new THREE.Vector3(6,2.6,-6),look:new THREE.Vector3(0,.5,0),tp:new THREE.Vector3(6,2.6,-6),tl:new THREE.Vector3(0,.5,0),k:3,shake:0,bob:0,mode:'menu'};
function camTo(pos,look,k=3){Cam.tp.copy(pos);Cam.tl.copy(look);Cam.k=k;}
function camSnap(pos,look){Cam.pos.copy(pos);Cam.look.copy(look);camTo(pos,look);}
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const POSE={
  garage:[V(.12,1.19,-12.3),V(0,2.02,-16.7)],
  standG:[V(.12,1.66,-12.15),V(-1.4,.9,-9.2)],
  rack:[V(-1.05,1.64,-10.9),V(-1.75,.8,-9.0)],
  locker:[V(-.9,1.45,-10.1),V(-2.2,1.0,-12.3)],
  stand:[V(2.9,1.68,-2.7),V(-24,.7,.4)],
  release:[V(3.0,1.65,-2.4),V(22,.6,.3)]
};
function wheelPose(car,key,offsetX=0){
  const p=new THREE.Vector3();car.userData.wheels[key].slot.getWorldPosition(p);p.x+=offsetX;
  return R&&R.gunner?[V(p.x+.04,p.y+.56,p.z-1.28),V(p.x,p.y-.05,p.z)]:[V(p.x+.06,p.y+.68,p.z-1.5),V(p.x,p.y-.08,p.z)];
}
const RUN_PATH=[[V(0,1.6,-13.4),V(0,1.6,-16)],[V(0,1.6,-13.2),V(0,1.5,-6)],[V(.6,1.65,-8),V(2,1.4,0)],[V(1.8,1.68,-5),V(4,1.2,0)],POSE.stand];
const CARRY_PATH=[POSE.rack,[V(-.7,1.64,-7.7),V(1.2,1.0,-1.5)],[V(.8,1.66,-4.9),V(1.6,.6,-1.6)],[V(1.55,1.66,-3.5),V(1.25,.15,-2.35)]];
function pathPose(path,p){
  const n=path.length-1,f=clamp(p,0,1)*n,i=Math.min(n-1,Math.floor(f)),k=f-i,e=k*k*(3-2*k);
  return[path[i][0].clone().lerp(path[i+1][0],e),path[i][1].clone().lerp(path[i+1][1],e)];
}
function runPose(p){return pathPose(RUN_PATH,p);}
function updateCam(dt,t){
  const a=1-Math.exp(-Cam.k*dt);Cam.pos.lerp(Cam.tp,a);Cam.look.lerp(Cam.tl,a);
  camera.position.copy(Cam.pos);
  if(Cam.bob>0)camera.position.y+=Math.sin(t*14)*.05*Cam.bob;
  if(Cam.shake>0){camera.position.x+=(Math.random()-.5)*Cam.shake;camera.position.y+=(Math.random()-.5)*Cam.shake;Cam.shake=Math.max(0,Cam.shake-dt*.25);}
  camera.lookAt(Cam.look);
}

/* ---------------- TWEENS ---------------- */
const tweens=[];
function tween(dur,fn,done){tweens.push({t:0,dur,fn,done});}
function updTweens(dt){for(let i=tweens.length-1;i>=0;i--){const tw=tweens[i];tw.t+=dt;const k=clamp(tw.t/tw.dur,0,1);tw.fn(k);if(k>=1){tweens.splice(i,1);tw.done&&tw.done();}}}
const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
