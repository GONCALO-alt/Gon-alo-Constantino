'use strict';
/* Pit Box · TV da garagem: corrida em direto no traçado real */
/* ---------------- TV DA GARAGEM: transmissão em direto no circuito real ---------------- */
const TV={scene:null,trk:null,cars:[],order:[],shot:null,lastR:0,lastO:0,focusUs:false,lapOff:0};
const TV_PACE={F1:1,F2:.93,F3:.87,F4:.8,GT3:.82};
const DRIVERS=['SIL','COS','FER','MAR','ALV','RIB','NUN','PIN','LOP','SAN','GOM','VAZ','MEN','ROC','TEI','BAR','FON','CAR','LEI','MOT','AZE','REI'];
/* amostra o traçado real a cada ~6 m e calcula curvatura e velocidade possível em cada ponto */
function trackSamples(name){
  const T=TRACKS[name]||TRACKS['Portimão'];const raw=[];
  for(let i=0;i<T.p.length;i+=2)raw.push(new THREE.Vector3(T.p[i],0,-T.p[i+1]));
  const curve=new THREE.CatmullRomCurve3(raw,true,'centripetal');
  const L=curve.getLength(),N=Math.max(240,Math.round(L/6)),pts=curve.getSpacedPoints(N);pts.pop();
  const ds=L/N,tan=[],nor=[],kap=new Float32Array(N),v=new Float32Array(N);
  for(let i=0;i<N;i++){const t=pts[(i+1)%N].clone().sub(pts[(i-1+N)%N]).normalize();tan.push(t);nor.push(V3(t.z,0,-t.x));}
  for(let i=0;i<N;i++){const a=tan[(i-2+N)%N],b=tan[(i+2)%N];kap[i]=Math.acos(clamp(a.dot(b),-1,1))/(4*ds);}
  const k2=new Float32Array(N);for(let i=0;i<N;i++){let s=0;for(let j=-3;j<=3;j++)s+=kap[(i+j+N)%N];k2[i]=s/7;}
  for(let i=0;i<N;i++)v[i]=Math.min(89,Math.sqrt(40/Math.max(k2[i],1e-5)));
  for(let p=0;p<2;p++)for(let i=0;i<N;i++){const q=(i-1+N)%N;v[i]=Math.min(v[i],Math.sqrt(v[q]*v[q]+2*11*ds));}
  for(let p=0;p<2;p++)for(let i=N-1;i>=0;i--){const q=(i+1)%N;v[i]=Math.min(v[i],Math.sqrt(v[q]*v[q]+2*36*ds));}
  let lapT=0;for(let i=0;i<N;i++)lapT+=ds/v[i];
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z);});
  return{pts,N,L,ds,tan,nor,kap:k2,v,lapT,box:[x0,x1,z0,z1]};
}
function tvRibbon(trk,a,b,y,mat,filter){
  const P=[],{pts,nor,N}=trk;
  for(let i=0;i<N;i++){if(filter&&!filter(i))continue;const j=(i+1)%N;
    const A0=pts[i].clone().addScaledVector(nor[i],a),B0=pts[i].clone().addScaledVector(nor[i],b),A1=pts[j].clone().addScaledVector(nor[j],a),B1=pts[j].clone().addScaledVector(nor[j],b);
    P.push(A0.x,y,A0.z,B0.x,y,B0.z,A1.x,y,A1.z,B0.x,y,B0.z,B1.x,y,B1.z,A1.x,y,A1.z);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();
  return new THREE.Mesh(g,mat);
}
function tvCarModel(c1,c2,gt){
  const g=new THREE.Group(),Lm=c=>new THREE.MeshLambertMaterial({color:c});const m1=Lm(c1),m2=Lm(c2),dk=Lm(0x141414);
  const B=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);};
  if(gt){B(4.5,.75,1.9,m1,0,.6,0);B(2,.45,1.5,dk,-.3,1.2,0);B(4.52,.1,.4,m2,0,.98,0);B(.4,.06,1.8,dk,-2.1,1.35,0);}
  else{B(4.6,.4,.7,m1,0,.42,0);B(1.6,.36,1.4,m1,-.3,.38,0);B(1.4,.3,.5,m2,1.6,.32,0);B(.45,.06,1.85,m2,2.5,.15,0);B(.4,.1,.95,m2,-2.35,.95,0);B(.1,.4,.1,dk,-2.2,.7,0);B(.5,.25,.25,dk,0,.75,0);}
  [[1.75,.8],[1.75,-.8],[-1.75,.8],[-1.75,-.8]].forEach(([x,z])=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.36,12).rotateX(Math.PI/2),dk);w.position.set(gt?x*.8:x,.36,z*(gt?1.05:1));g.add(w);});
  return mergeGroup(g);
}
function setupTV(team,posBefore,circuit,cat,lapNow,wx='dry'){
  if(TV.scene)TV.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});
  if(!TV.rt){TV.rt=new THREE.WebGLRenderTarget(512,288);TV.rt.texture.encoding=THREE.sRGBEncoding;
    TV.cam=new THREE.PerspectiveCamera(40,16/9,1.2,4500);
    TV.grass=canvasTex(128,128,(c,w,h)=>{noiseFill(c,w,h,'#4a7f37',0,0,0);for(let i=0;i<3000;i++){c.fillStyle=`hsl(${rand(85,110)},${rand(30,50)}%,${rand(22,36)}%)`;c.fillRect(Math.random()*w,Math.random()*h,2,2);}},[400,400]);}
  W.tvScreenMat.map=TV.rt.texture;W.tvScreenMat.color.setHex(0xffffff);W.tvScreenMat.needsUpdate=true;
  const trk=trackSamples(circuit.n);TV.trk=trk;
  const TW={dry:[0x8fbbe6,0xb7d0e8,400,2200,1,1.4],hot:[0xa9c4dc,0xe6dcc8,300,1800,1.05,1.6],cold:[0x9aa5b0,0xc4ccd4,300,1700,.95,1],wet:[0x9aa5b0,0xb9c2ca,250,1400,.95,.8],rain:[0x5f6873,0x8d97a1,120,900,.85,.5],night:[0x060b18,0x0b1220,250,1600,.55,.25]}[wx]||[0x8fbbe6,0xb7d0e8,400,2200,1,1.4];
  const s=new THREE.Scene();s.background=new THREE.Color(TW[0]);s.fog=new THREE.Fog(TW[1],TW[2],TW[3]);
  s.add(new THREE.HemisphereLight(0xe3eeff,0x50603c,TW[4]));const sun=new THREE.DirectionalLight(0xfff2dd,TW[5]);sun.position.set(400,600,250);s.add(sun);
  const grass=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshLambertMaterial({map:TV.grass}));grass.rotation.x=-Math.PI/2;grass.position.y=-.6;s.add(grass);
  const L=c=>new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide});
  const asph=L(WEATHER[wx]&&WEATHER[wx].wet?0x2f3236:0x45474c),gravel=L(0xc8b48c),run=L(0x6c7075),wht=L(0xf2f2f2),red=L(0xd8261f);
  const K=i=>trk.kap[i]>.0065;
  s.add(tvRibbon(trk,-28,-8,-.3,gravel,K));s.add(tvRibbon(trk,8,28,-.3,gravel,K));
  s.add(tvRibbon(trk,-10,10,-.15,run));
  s.add(tvRibbon(trk,-6.5,6.5,0,asph));
  s.add(tvRibbon(trk,-6.6,-6.2,.12,wht));s.add(tvRibbon(trk,6.2,6.6,.12,wht));
  [[-7.9,-6.6],[6.6,7.9]].forEach(([a,b])=>{s.add(tvRibbon(trk,a,b,.14,red,i=>K(i)&&(i>>1)%2===0));s.add(tvRibbon(trk,a,b,.14,wht,i=>K(i)&&(i>>1)%2===1));});
  s.add(tvRibbon(trk,-6.5,6.5,.16,wht,i=>i===0));
  // bancada e edifício das boxes na reta da meta
  const i0=trk.N-14,t0=trk.tan[i0],ry=Math.atan2(-t0.z,t0.x);
  const gs=new THREE.Mesh(new THREE.BoxGeometry(140,14,18),new THREE.MeshLambertMaterial({color:0x5d6f86}));gs.position.copy(trk.pts[i0]).addScaledVector(trk.nor[i0],-34);gs.position.y=7;gs.rotation.y=ry;s.add(gs);
  const pb=new THREE.Mesh(new THREE.BoxGeometry(170,9,14),new THREE.MeshLambertMaterial({color:0xdfe3e8}));pb.position.copy(trk.pts[i0]).addScaledVector(trk.nor[i0],32);pb.position.y=4.5;pb.rotation.y=ry;s.add(pb);
  // árvores longe da pista
  const [x0,x1,z0,z1]=trk.box,NT=260,tr=new THREE.InstancedMesh(new THREE.ConeGeometry(5,16,7),new THREE.MeshLambertMaterial({color:0x2f5a2c}),NT),d=new THREE.Object3D();let n=0;
  for(let k=0;k<NT*4&&n<NT;k++){const x=rand(x0-350,x1+350),z=rand(z0-350,z1+350);let ok=true;
    for(let i=0;i<trk.N;i+=3){const p=trk.pts[i];if((p.x-x)**2+(p.z-z)**2<55*55){ok=false;break;}}
    if(ok){d.position.set(x,8,z);const sc=rand(.7,1.5);d.scale.set(sc,sc,sc);d.updateMatrix();tr.setMatrixAt(n++,d.matrix);}}
  tr.count=n;s.add(tr);
  // carros
  const NC=16,others=TEAMS.filter(t=>t.cat===team.cat&&t.id!==team.id),pace=TV_PACE[cat.id]||1,avgV=trk.L/trk.lapT;
  TV.cars=[];let s0=rand(.2,.6)*trk.L;
  for(let i=0;i<NC;i++){const us=i===posBefore-1;const tm=us?team:(others[i%Math.max(1,others.length)]||team);
    const m=tvCarModel(tm.c1,tm.c2,cat.id==='GT3');s.add(m);
    TV.cars.push({us,tm,m,s:s0,v:0,pace:pace*(us?1:rand(.994,1.004)),lat:rand(-2,2),latGoal:0,latT:0,inPit:false,
      code:us?tm.name.replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase():DRIVERS[(i*7+tm.tier*3)%DRIVERS.length]});
    s0-=avgV*pace*rand(.45,2.4);}
  const us=TV.cars.find(c=>c.us);TV.lapOff=lapNow-Math.floor(us.s/trk.L);
  TV.scene=s;TV.shot=null;TV.focusUs=false;TV.order=TV.cars.slice();TV.pace=pace;
}
function tvPos(s){const trk=TV.trk;const u=(((s%trk.L)+trk.L)%trk.L)/trk.ds;const i=Math.floor(u)%trk.N;return{i,j:(i+1)%trk.N,f:u-Math.floor(u)};}
function tvLap(c){return TV.lapOff+Math.floor(c.s/TV.trk.L);}
function tvNextShot(){
  const us=TV.cars.find(c=>c.us),order=TV.order;let target;const r=Math.random();
  if((TV.focusUs||r<.35)&&!us.inPit)target=us;else if(r<.6)target=order[0];else target=order[randi(1,Math.min(order.length-1,9))];
  let type=pick(TV.focusUs?['onboard','chase']:['heli','side','chase','side','heli','onboard']);
  if(type==='onboard'&&!target.us&&Math.random()<.5)type='chase';
  TV.shot={type,target,t0:now(),dur:rand(4.5,7.5),spot:null};TV.snap=true;
}
function tvCamUpdate(dt){
  if(!TV.shot||now()-TV.shot.t0>TV.shot.dur||TV.shot.target.inPit)tvNextShot();
  const sh=TV.shot,c=sh.target,trk=TV.trk,{i}=tvPos(c.s),P=c.m.position,tn=trk.tan[i],nr=trk.nor[i];
  let pos,look,fov=38,snap=TV.snap;
  if(sh.type==='heli'){pos=P.clone().addScaledVector(tn,-40).addScaledVector(nr,32).add(V3(0,44,0));look=P.clone().addScaledVector(tn,14);fov=28;}
  else if(sh.type==='chase'){pos=P.clone().addScaledVector(tn,-9.5).add(V3(0,3.1,0));look=P.clone().addScaledVector(tn,10).add(V3(0,1,0));fov=52;}
  else if(sh.type==='onboard'){pos=P.clone().addScaledVector(tn,-.4).add(V3(0,1.35,0));look=P.clone().addScaledVector(tn,30).add(V3(0,.7,0));fov=64;snap=true;}
  else{const ahead=sh.spot==null?-1:(sh.spot-i+trk.N)%trk.N;
    if(sh.spot==null||ahead>trk.N-8){sh.spot=(i+32)%trk.N;}
    const k=sh.spot;pos=trk.pts[k].clone().addScaledVector(trk.nor[k],trk.kap[k]>.004?-26:-20).add(V3(0,4.5,0));look=P.clone().add(V3(0,.7,0));fov=22;snap=true;}
  if(snap)TV.cam.position.copy(pos);else TV.cam.position.lerp(pos,1-Math.exp(-5*dt));
  TV.snap=false;TV.cam.lookAt(look);if(TV.cam.fov!==fov){TV.cam.fov=fov;TV.cam.updateProjectionMatrix();}
}
/* avança a corrida na TV; desenha só quando a TV está à vista. Devolve a posição do nosso carro */
function updateTV(dt,t,render){
  const trk=TV.trk;if(!trk)return 0;
  TV.cars.forEach(c=>{if(c.inPit)return;const{i,j,f}=tvPos(c.s);c.v=lerp(trk.v[i],trk.v[j],f)*c.pace;c.s+=c.v*dt;
    c.latT-=dt;if(c.latT<0){c.latT=rand(2,5);c.latGoal=rand(-2.6,2.6);}c.lat=lerp(c.lat,c.latGoal,Math.min(1,dt*.6));});
  const run=TV.cars.filter(c=>!c.inPit).sort((a,b)=>b.s-a.s);
  for(let k=1;k<run.length;k++)if(run[k-1].s-run[k].s<8)run[k].s=run[k-1].s-8;
  TV.order=TV.cars.slice().sort((a,b)=>b.s-a.s);
  if(render&&t-TV.lastR>1/24){TV.lastR=t;
    TV.cars.forEach(c=>{c.m.visible=!c.inPit;if(c.inPit)return;const{i,j,f}=tvPos(c.s);
      c.m.position.copy(trk.pts[i]).lerp(trk.pts[j],f).addScaledVector(trk.nor[i],c.lat);c.m.position.y=.08;
      const tg=trk.tan[i].clone().lerp(trk.tan[j],f);c.m.rotation.y=Math.atan2(-tg.z,tg.x);});
    tvCamUpdate(Math.max(dt,1/24));
    renderer.setRenderTarget(TV.rt);renderer.render(TV.scene,TV.cam);renderer.setRenderTarget(null);
    if(t-TV.lastO>.16){TV.lastO=t;drawTVOverlay(t);}
  }
  return TV.order.findIndex(c=>c.us)+1;
}
function drawTVOverlay(t){
  const c=W.tvCtx,Wd=800,H=450;c.clearRect(0,0,Wd,H);c.textBaseline='alphabetic';c.textAlign='left';
  if(!TV.trk){c.fillStyle='#0b0d12';c.fillRect(0,0,Wd,H);c.fillStyle='#ffc61a';c.font='italic 900 84px "Saira Condensed",Arial Narrow,Arial';c.textAlign='center';c.fillText('PIT BOX TV',Wd/2,H/2+24);W.tvTex.needsUpdate=true;return;}
  const order=TV.order,trk=TV.trk,avgV=trk.L/trk.lapT*TV.pace,leader=order[0];
  // torre de tempos
  const x0=14,y0=14,rw=196;
  c.fillStyle='rgba(10,12,17,.92)';c.fillRect(x0,y0,rw,32);c.fillStyle='#e10600';c.fillRect(x0,y0,6,32);
  c.fillStyle='#fff';c.font='bold 18px Arial';c.fillText(`VOLTA ${Math.max(1,Math.min(R?R.cat.laps:99,tvLap(leader)+1))}/${R?R.cat.laps:'-'}`,x0+14,y0+23);
  const rows=order.slice(0,8),ui=order.findIndex(o=>o.us);if(ui>=8)rows.push(order[ui]);
  rows.forEach((car,k)=>{const p=order.indexOf(car)+1,y=y0+35+k*27+(k===8?5:0);
    c.fillStyle=car.us?'rgba(255,198,26,.96)':'rgba(10,12,17,.84)';c.fillRect(x0,y,rw,25);
    c.fillStyle=car.us?'#111':'#fff';c.font='bold 16px Arial';c.fillText(String(p),x0+8,y+18);
    c.fillStyle=hex(car.tm.c1);c.fillRect(x0+34,y+4,5,17);
    c.fillStyle=car.us?'#111':'#fff';c.fillText(car.code,x0+46,y+18);
    c.font='15px Arial';c.textAlign='right';
    c.fillText(car.inPit?'PIT':p===1?'LÍDER':'+'+((leader.s-car.s)/avgV).toFixed(3).replace('.',','),x0+rw-8,y+18);c.textAlign='left';});
  // mapa do circuito real
  const mw=200,mh=150,mx=Wd-mw-14,my=14,[bx0,bx1,bz0,bz1]=trk.box,sc=Math.min((mw-24)/(bx1-bx0),(mh-34)/(bz1-bz0));
  const MX=x=>mx+mw/2+(x-(bx0+bx1)/2)*sc,MY=z=>my+20+(mh-20)/2+(z-(bz0+bz1)/2)*sc;
  c.fillStyle='rgba(10,12,17,.78)';c.fillRect(mx,my,mw,mh);c.fillStyle='#fff';c.font='bold 13px Arial';c.fillText((R?R.circuit.n:'').toUpperCase(),mx+8,my+15);
  c.fillStyle='#e10600';c.fillText('● AO VIVO',mx+mw-80,my+15);
  c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=3;c.lineJoin='round';c.beginPath();
  for(let i=0;i<=trk.N;i+=2){const p=trk.pts[i%trk.N];i?c.lineTo(MX(p.x),MY(p.z)):c.moveTo(MX(p.x),MY(p.z));}c.closePath();c.stroke();
  TV.cars.forEach(car=>{if(car.inPit||car.us)return;const p=car.m.position;c.fillStyle=hex(car.tm.c1);c.beginPath();c.arc(MX(p.x),MY(p.z),3.5,0,7);c.fill();});
  const us=TV.cars.find(x=>x.us);if(us&&!us.inPit){const p=us.m.position;c.fillStyle='#ffc61a';c.beginPath();c.arc(MX(p.x),MY(p.z),6,0,7);c.fill();c.strokeStyle='#111';c.lineWidth=2;c.stroke();}
  // legenda do carro em destaque
  const tg=TV.shot&&TV.shot.target;
  if(tg&&!tg.inPit){const p=order.indexOf(tg)+1,y=H-92;
    c.fillStyle='rgba(10,12,17,.9)';c.fillRect(14,y,360,52);c.fillStyle=hex(tg.tm.c1);c.fillRect(14,y,7,52);
    c.fillStyle='#fff';c.font='bold 22px Arial';c.fillText(`P${p}  ${tg.code}`,30,y+24);
    c.font='14px Arial';c.fillStyle='#c9ced8';c.fillText(tg.tm.name.slice(0,30),30,y+44);
    c.textAlign='right';c.font='bold 22px Arial';c.fillStyle='#fff';c.fillText(Math.round(tg.v*3.6)+' km/h',364,y+33);c.textAlign='left';
    if(TV.shot.type==='onboard'){c.fillStyle='rgba(10,12,17,.85)';c.fillRect(Wd/2-50,14,100,26);c.fillStyle='#fff';c.font='bold 14px Arial';c.textAlign='center';c.fillText('ONBOARD',Wd/2,32);c.textAlign='left';}}
  if(TV.focusUs&&us&&!us.inPit&&Math.floor(t*2)%2){c.fillStyle='#ffc61a';c.fillRect(Wd/2-70,H-92,140,40);c.fillStyle='#111';c.font='italic 900 30px Arial';c.textAlign='center';c.fillText('BOX BOX',Wd/2,H-62);c.textAlign='left';}
  // rodapé
  c.fillStyle='rgba(8,9,12,.92)';c.fillRect(0,H-30,Wd,30);c.fillStyle='#e10600';c.fillRect(0,H-30,8,30);
  c.fillStyle='#fff';c.font='16px Arial';c.fillText(W.tvLine||'',18,H-10);
  W.tvTex.needsUpdate=true;
}
