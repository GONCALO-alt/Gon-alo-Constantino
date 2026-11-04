'use strict';
/* Pit Box · Mundo 3D: renderizador, pista, garagem, carros, rodas, mecânicos, mãos */
/* ---------------- MUNDO 3D ---------------- */
const canvas=$('#gl');
let renderer,scene,camera;
const MAT={};
const M=(color,o={})=>new THREE.MeshStandardMaterial(Object.assign({color,roughness:.6,metalness:.1},o));
const PM=(color,o={})=>new THREE.MeshPhysicalMaterial(Object.assign({color,roughness:.42,metalness:.05,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:.85},o));
function mesh(geo,mat,x=0,y=0,z=0,shadow=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(shadow){m.castShadow=true;m.receiveShadow=true;}return m;}
function canvasTex(w,h,draw,rep,linear){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);if(!linear)t.encoding=THREE.sRGBEncoding;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}t.anisotropy=8;return t;}
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const put=(p,o)=>(p.add(o),o);

/* ---- utilitários de geometria (formas suaves em vez de caixas) ---- */
function smooth(g){
  const p=g.attributes.position,map=new Map(),idx=[],pos=[];
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const k=Math.round(x*2e3)+'_'+Math.round(y*2e3)+'_'+Math.round(z*2e3);
    let j=map.get(k);if(j===undefined){j=pos.length/3;map.set(k,j);pos.push(x,y,z);}idx.push(j);}
  const n=new THREE.BufferGeometry();n.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));n.setIndex(idx);n.computeVertexNormals();g.dispose();return n;
}
function shapeFrom(cmds){const s=new THREE.Shape();cmds.forEach(([t,...a])=>{if(t==='m')s.moveTo(...a);else if(t==='l')s.lineTo(...a);else if(t==='q')s.quadraticCurveTo(...a);else if(t==='b')s.bezierCurveTo(...a);else if(t==='a')s.absarc(...a);});return s;}
function tbl(pts){return x=>{if(x>=pts[0][0])return pts[0][1];for(let i=1;i<pts.length;i++){if(x>=pts[i][0]){const a=pts[i-1],b=pts[i];return lerp(b[1],a[1],(x-b[0])/(a[0]-b[0]));}}return pts[pts.length-1][1];};}
/* perfil lateral (x,y) extrudido na largura, com meia-largura variável ao longo do carro */
function extrudeSide(cmds,hw,bevel=.02,seg=10){
  const g=new THREE.ExtrudeGeometry(shapeFrom(cmds),{depth:1,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:seg});
  g.translate(0,0,-.5);const f=typeof hw==='function'?hw:()=>hw;const p=g.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)*2*f(p.getX(i)));
  return smooth(g);
}
function rbox(w,h,d,b=.02){
  b=Math.min(b,w/2.2,h/2.2,d/2.2);const iw=w-2*b,ih=h-2*b;
  const g=new THREE.ExtrudeGeometry(shapeFrom([['m',-iw/2,-ih/2],['l',iw/2,-ih/2],['l',iw/2,ih/2],['l',-iw/2,ih/2]]),{depth:Math.max(.0005,d-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:2});
  g.translate(0,0,-(d-2*b)/2);return smooth(g);
}
function wing(chord,thick,span,mat,x,y,z=0,aoa=0){
  const c=chord,t=thick;
  const g=extrudeSide([['m',0,0],['q',-c*.1,-t,-c*.42,-t*.8],['q',-c*.85,-t*.35,-c,0],['q',-c*.5,t*.2,0,0]],span/2,.003,8);
  const m=mesh(g,mat,x,y,z);m.rotation.z=aoa;return m;
}
function rod(a,b,r,mat){const d=new THREE.Vector3().subVectors(b,a);const m=mesh(new THREE.CylinderGeometry(r,r,d.length(),8),mat);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());return m;}
function decalMat(draw,w=512,h=128){return new THREE.MeshStandardMaterial({map:canvasTex(w,h,draw),transparent:true,roughness:.4,metalness:.1,polygonOffset:true,polygonOffsetFactor:-4,depthWrite:false});}
function textDecal(txt,color,{w=512,h=128,font='italic 900 92px "Saira Condensed",Arial Narrow,Arial',bg=null}={}){
  return decalMat((c)=>{if(bg){c.fillStyle=bg;c.fillRect(0,0,w,h);}c.fillStyle=color;c.font=font;c.textAlign='center';c.textBaseline='middle';c.fillText(txt,w/2,h/2+4);},w,h);
}
/* junta peças estáticas com o mesmo material numa só malha (muito menos chamadas de desenho no telemóvel) */
function mergeGroup(root,keep=new Set()){
  root.updateMatrixWorld(true);
  const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();const buckets=new Map(),remove=[];
  root.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||keep.has(o)||o.material.transparent||Array.isArray(o.material))return;
    let a=o.parent;while(a&&a!==root){if(keep.has(a))return;a=a.parent;}
    const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone());g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));
    const k=o.material.uuid+(o.castShadow?'c':'');if(!buckets.has(k))buckets.set(k,{mat:o.material,geos:[],cast:o.castShadow,rec:o.receiveShadow});buckets.get(k).geos.push(g);remove.push(o);});
  remove.forEach(o=>o.parent.remove(o));
  buckets.forEach(b=>{
    if(b.geos.length===1&&false)return;
    let n=0;b.geos.forEach(g=>n+=g.attributes.position.count);const uv=b.geos.every(g=>g.attributes.uv);
    const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uvs=uv?new Float32Array(n*2):null;let off=0;
    b.geos.forEach(g=>{pos.set(g.attributes.position.array,off*3);if(g.attributes.normal)nor.set(g.attributes.normal.array,off*3);if(uv)uvs.set(g.attributes.uv.array,off*2);off+=g.attributes.position.count;g.dispose();});
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));if(uv)geo.setAttribute('uv',new THREE.BufferAttribute(uvs,2));
    geo.computeBoundingSphere();const m=new THREE.Mesh(geo,b.mat);m.castShadow=b.cast;m.receiveShadow=true;root.add(m);});
  return root;
}
function lum(n){const r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;return .3*r+.59*g+.11*b;}
function noiseFill(c,w,h,base,n,lo,hi,sz=1.4){c.fillStyle=base;c.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=randi(lo,hi);c.fillStyle=`rgb(${v},${v},${v+3})`;c.fillRect(Math.random()*w,Math.random()*h,sz*rand(.6,1.6),sz*rand(.6,1.6));}}

/* ---- céu e reflexos ---- */
function makeSky(){
  const t=canvasTex(2048,1024,(c,w,h)=>{
    const g=c.createLinearGradient(0,0,0,h/2);g.addColorStop(0,'#1f5fbf');g.addColorStop(.55,'#6fa3e3');g.addColorStop(.92,'#cfe0f1');g.addColorStop(1,'#e8eef3');
    c.fillStyle=g;c.fillRect(0,0,w,h/2+2);
    const sun=c.createRadialGradient(w*.62,h*.18,0,w*.62,h*.18,h*.35);sun.addColorStop(0,'rgba(255,255,245,1)');sun.addColorStop(.06,'rgba(255,250,225,.95)');sun.addColorStop(.3,'rgba(255,240,200,.25)');sun.addColorStop(1,'rgba(255,240,200,0)');
    c.fillStyle=sun;c.fillRect(0,0,w,h/2);
    for(let i=0;i<55;i++){const x=Math.random()*w,y=h*rand(.18,.44),s=rand(40,160);
      for(let k=0;k<7;k++){const cx=x+rand(-s,s),cy=y+rand(-s*.15,s*.15),r=s*rand(.3,.7);const cg=c.createRadialGradient(cx,cy,0,cx,cy,r);
        cg.addColorStop(0,'rgba(255,255,255,.55)');cg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=cg;c.beginPath();c.ellipse(cx,cy,r,r*.45,0,0,7);c.fill();}}
    // silhueta de árvores e edifícios no horizonte
    c.fillStyle='#5b6f63';for(let x=0;x<w;x+=6){const hh=rand(6,22);c.fillRect(x,h/2-hh,7,hh);}
    c.fillStyle='#8a96a3';for(let i=0;i<14;i++){const x=Math.random()*w,bw=rand(40,140),bh=rand(10,40);c.fillRect(x,h/2-bh,bw,bh);}
    const gg=c.createLinearGradient(0,h/2,0,h);gg.addColorStop(0,'#6a6d71');gg.addColorStop(.3,'#3d3f43');gg.addColorStop(1,'#202124');c.fillStyle=gg;c.fillRect(0,h/2,w,h/2);
  });
  t.mapping=THREE.EquirectangularReflectionMapping;return t;
}

function initThree(){
  if(THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();
  const sky=makeSky();scene.background=sky;
  const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(sky).texture;pm.dispose();
  scene.fog=new THREE.Fog(0xcfdde9,55,190);
  camera=new THREE.PerspectiveCamera(62,1,.04,400);scene.add(camera);
  MAT.tyre=M(0x1c1c1e,{roughness:.82,metalness:0,envMapIntensity:.5});
  MAT.rim=M(0x1c1e22,{metalness:.9,roughness:.26});MAT.lip=M(0xc2c8cf,{metalness:1,roughness:.16});
  MAT.carbon=new THREE.MeshPhysicalMaterial({color:0x17181b,roughness:.35,metalness:.35,clearcoat:.8,clearcoatRoughness:.15});
  MAT.carbonMatte=M(0x111214,{roughness:.6,metalness:.2});
  MAT.nut=M(0xdfe3e8,{metalness:1,roughness:.18});MAT.thread=M(0x9aa1a9,{metalness:1,roughness:.35});
  MAT.dark=M(0x08090b,{roughness:.3,metalness:.4});MAT.glass=new THREE.MeshPhysicalMaterial({color:0x0b1016,roughness:.04,metalness:.2,clearcoat:1,transparent:true,opacity:.72});
  MAT.disc=M(0x2b2725,{roughness:.55,metalness:.3,emissive:0xff3a00,emissiveIntensity:.09});
  MAT.concrete=M(0xc4c7ca,{roughness:.95,metalness:0});MAT.white=M(0xf2f2f2,{roughness:.55});MAT.yellow=M(0xffc61a,{roughness:.55});
  MAT.steel=M(0x8d939a,{metalness:.85,roughness:.35});MAT.rubber=M(0x121314,{roughness:.9});
  scene.add(new THREE.HemisphereLight(0xdbe8ff,0x3f3a32,.45));
  const sun=new THREE.DirectionalLight(0xfff1dc,2.3);sun.position.set(10,20,12);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:2,far:70});sun.shadow.bias=-.0004;sun.shadow.normalBias=.02;
  scene.add(sun);scene.add(sun.target);
  buildWorld();
  mergeGroup(scene,new Set([W.playerSpot,W.fetchTyre]));
  window.addEventListener('resize',applyOrient);applyOrient();
}
function resize(){const a=$('#app');const w=a.clientWidth,h=a.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.62?66:w/h>1.2?44:58;camera.updateProjectionMatrix();}
/* orientação: vertical, horizontal (roda o jogo se o telemóvel estiver de pé) ou automática */
const ORIENT={portrait:'📱 Vertical',landscape:'📱 Horizontal',auto:'📱 Automático'};
let rotated=false;
function applyOrient(){
  const vw=window.innerWidth,vh=window.innerHeight,devLand=vw>vh,o=P.settings.orient||'portrait';
  const land=o==='auto'?devLand:o==='landscape';
  rotated=land&&!devLand&&o==='landscape';
  document.body.classList.toggle('land',land);document.body.classList.toggle('rot',rotated);
  const a=$('#app');if(rotated){a.style.width=vh+'px';a.style.height=vw+'px';}else{a.style.width='';a.style.height='';}
  if(renderer)resize();
  const t=$('#tOrient');if(t)t.textContent=ORIENT[o];
  if(screen==='s-stats'&&P.stats.stops.length>1)drawChart();
}
function cycleOrient(){
  const order=['portrait','landscape','auto'];P.settings.orient=order[(order.indexOf(P.settings.orient||'portrait')+1)%3];save();Snd.init();Snd.click();
  if(P.settings.orient==='landscape'&&matchMedia('(pointer:coarse)').matches){
    try{const el=document.documentElement;const go=el.requestFullscreen?el.requestFullscreen():null;
      if(go&&go.then)go.then(()=>window.screen.orientation&&window.screen.orientation.lock&&window.screen.orientation.lock('landscape')).catch(()=>{});}catch(e){}
  }else if(P.settings.orient==='portrait'){try{window.screen.orientation&&window.screen.orientation.unlock&&window.screen.orientation.unlock();}catch(e){}}
  applyOrient();setTimeout(applyOrient,400);
  toast({portrait:'Ecrã na vertical',landscape:'Ecrã na horizontal',auto:'Segue a posição do telemóvel'}[P.settings.orient],'good',1200);
}

/* ---- pista, box e garagem ---- */
const W={};
function buildWorld(){
  // asfalto com agregado, manchas e relevo
  const asC=document.createElement('canvas');asC.width=asC.height=512;const ac=asC.getContext('2d');
  noiseFill(ac,512,512,'#45474b',26000,35,105,1.3);
  for(let i=0;i<40;i++){const x=Math.random()*512,y=Math.random()*512,r=rand(20,80);const g=ac.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(20,20,22,.18)');g.addColorStop(1,'rgba(20,20,22,0)');ac.fillStyle=g;ac.fillRect(x-r,y-r,2*r,2*r);}
  const asT=new THREE.CanvasTexture(asC);asT.encoding=THREE.sRGBEncoding;asT.wrapS=asT.wrapT=THREE.RepeatWrapping;asT.repeat.set(36,36);asT.anisotropy=8;
  const bmT=new THREE.CanvasTexture(asC);bmT.wrapS=bmT.wrapT=THREE.RepeatWrapping;bmT.repeat.set(36,36);
  const ground=mesh(new THREE.PlaneGeometry(240,240),new THREE.MeshStandardMaterial({map:asT,bumpMap:bmT,bumpScale:.012,roughness:.9,metalness:0,envMapIntensity:.4}),0,0,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;scene.add(ground);
  // marcas de borracha e óleo na zona da box
  const stain=new THREE.MeshBasicMaterial({map:canvasTex(256,256,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(10,10,10,.55)');g.addColorStop(1,'rgba(10,10,10,0)');c.fillStyle=g;c.fillRect(0,0,w,h);}),transparent:true,depthWrite:false});
  [[1.75,-.8,1.6],[1.75,.8,1.6],[-1.75,-.8,1.8],[-1.75,.8,1.8],[0,0,3.2],[-6,.3,2],[8,-.2,2.4]].forEach(([x,z,s])=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(s,s*.7),stain);p.rotation.x=-Math.PI/2;p.position.set(x,.003,z);scene.add(p);});
  const skid=new THREE.MeshBasicMaterial({map:canvasTex(512,64,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(8,8,8,0)');g.addColorStop(.3,'rgba(8,8,8,.5)');g.addColorStop(1,'rgba(8,8,8,.15)');c.fillStyle=g;for(let i=0;i<10;i++)c.fillRect(0,6+i*5,w,2.5);}),transparent:true,depthWrite:false});
  [-.8,.8].forEach(z=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(9,.32),skid);p.rotation.x=-Math.PI/2;p.position.set(6.5,.004,z);scene.add(p);});
  // linhas pintadas (com desgaste)
  const wornTex=(col)=>canvasTex(256,32,(c,w,h)=>{c.fillStyle=col;c.fillRect(0,0,w,h);for(let i=0;i<500;i++){c.fillStyle=`rgba(60,60,60,${rand(.1,.45)})`;c.fillRect(Math.random()*w,Math.random()*h,rand(1,4),rand(1,3));}});
  const lineMat=M(0xffffff,{map:wornTex('#f2bd12'),roughness:.55}),wMat=M(0xffffff,{map:wornTex('#ececec'),roughness:.55});
  const L=(w,d,x,z,m=lineMat)=>{const p=mesh(new THREE.PlaneGeometry(w,d),m,x,.005,z,false);p.rotation.x=-Math.PI/2;if(d>w)p.rotation.z=Math.PI/2,p.scale.set(d/w,w/d,1);p.receiveShadow=true;scene.add(p);};
  L(7.6,.1,0,-1.9);L(7.6,.1,0,1.9);L(.1,3.9,-3.8,0);L(.1,3.9,3.8,0);
  L(.5,.08,1.75,-1.25,wMat);L(.5,.08,1.75,1.25,wMat);L(.5,.08,-1.75,-1.25,wMat);L(.5,.08,-1.75,1.25,wMat);
  L(240,.14,0,4.2,wMat);L(240,.14,0,-5.6,lineMat);
  // logótipo da equipa pintado no chão da box
  W.floorLogoMat=new THREE.MeshStandardMaterial({transparent:true,roughness:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(3,.75),W.floorLogoMat);fl.rotation.x=-Math.PI/2;fl.rotation.z=Math.PI;fl.position.set(0,.006,-3.4);scene.add(fl);
  // muro das boxes com painéis publicitários e rede
  const wall=mesh(new THREE.BoxGeometry(240,1.1,.5),MAT.concrete,0,.55,9);scene.add(wall);
  const boardTex=canvasTex(1024,64,(c,w,h)=>{const ads=[['#ffc61a','#111','PIT BOX'],['#14171d','#ffc61a','RACE OIL'],['#e10600','#fff','TURBO'],['#f2f2f2','#111','SAFE']];
    for(let i=0;i<8;i++){const a=ads[i%4];c.fillStyle=a[0];c.fillRect(i*128,0,128,h);c.fillStyle=a[1];c.font='italic 900 34px Arial Narrow,Arial';c.textAlign='center';c.fillText(a[2],i*128+64,45);}},[24,1]);
  const board=mesh(new THREE.PlaneGeometry(240,.75),M(0xffffff,{map:boardTex,roughness:.5}),0,.58,8.74,false);board.rotation.y=Math.PI;scene.add(board);
  for(let x=-120;x<=120;x+=3.5)scene.add(mesh(new THREE.CylinderGeometry(.035,.035,3.2,6),MAT.steel,x,2.7,9.1,false));
  const fenceTex=canvasTex(64,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(60,64,70,.9)';c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.lineTo(w,h);c.moveTo(w,0);c.lineTo(0,h);c.stroke();},[480,10]);
  const fence=mesh(new THREE.PlaneGeometry(240,3),new THREE.MeshStandardMaterial({map:fenceTex,transparent:true,alphaTest:.3,side:THREE.DoubleSide,roughness:.5,metalness:.6}),0,2.6,9.1,false);scene.add(fence);
  // posto do muro das boxes (pit wall stand)
  W.standMat=M(0xff8000,{roughness:.5});
  const stand=new THREE.Group();stand.position.set(-2,0,8.15);
  stand.add(mesh(rbox(5,.9,.9,.05),MAT.carbonMatte,0,.45,0));
  stand.add(mesh(rbox(5.2,.1,1.5,.03),W.standMat,0,2.85,.2));
  [-2.4,2.4].forEach(x=>stand.add(mesh(new THREE.CylinderGeometry(.04,.04,2.4,8),MAT.steel,x,1.65,-.3)));
  for(let i=0;i<4;i++){const mo=mesh(rbox(.55,.36,.05,.01),MAT.dark,-1.8+i*1.2,1.25,-.25);mo.rotation.x=.2;stand.add(mo);
    const s=new THREE.Mesh(new THREE.PlaneGeometry(.5,.31),new THREE.MeshBasicMaterial({color:[0x0e3a24,0x13294d,0x3a2a0e,0x0e2f3a][i]}));s.position.set(-1.8+i*1.2,1.25,-.28);s.rotation.set(.2,Math.PI,0);stand.add(s);
    stand.add(mesh(new THREE.CylinderGeometry(.18,.18,.06,14),MAT.carbonMatte,-1.8+i*1.2,.95,-.75));
    stand.add(mesh(new THREE.CylinderGeometry(.03,.03,.9,6),MAT.steel,-1.8+i*1.2,.47,-.75));}
  scene.add(stand);
  // pista, corretores e relva
  const track=mesh(new THREE.PlaneGeometry(240,14),M(0xffffff,{map:asT.clone(),roughness:.85}),0,.008,17,false);track.material.map.repeat.set(30,2);track.rotation.x=-Math.PI/2;track.receiveShadow=true;scene.add(track);
  const kerbTex=canvasTex(64,16,(c,w,h)=>{c.fillStyle='#d8261f';c.fillRect(0,0,w/2,h);c.fillStyle='#f4f4f4';c.fillRect(w/2,0,w/2,h);},[120,1]);
  [10.2,23.8].forEach(z=>{const k=mesh(new THREE.PlaneGeometry(240,.6),M(0xffffff,{map:kerbTex,roughness:.5}),0,.012,z,false);k.rotation.x=-Math.PI/2;scene.add(k);});
  const grassTex=canvasTex(256,256,(c,w,h)=>{noiseFill(c,w,h,'#4f8a3a',9000,0,0,1.5);for(let i=0;i<9000;i++){c.fillStyle=`hsl(${rand(85,110)},${rand(35,55)}%,${rand(22,38)}%)`;c.fillRect(Math.random()*w,Math.random()*h,1.5,2.5);}},[40,12]);
  const grass=mesh(new THREE.PlaneGeometry(240,70),M(0xffffff,{map:grassTex,roughness:1}),0,.01,59,false);grass.rotation.x=-Math.PI/2;scene.add(grass);
  // bancada com lugares coloridos (sem adeptos visíveis)
  const seatTex=canvasTex(512,128,(c,w,h)=>{c.fillStyle='#3c4148';c.fillRect(0,0,w,h);const cols=['#1f4fa0','#d23c2a','#f0c419','#e8e8e8','#2f8f4e'];for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=6){c.fillStyle=cols[(Math.floor(x/60)+Math.floor(y/32))%cols.length];c.fillRect(x,y,4,5);}},[8,1]);
  const gs=new THREE.Group();gs.position.set(-10,0,44);
  for(let i=0;i<6;i++){gs.add(mesh(new THREE.BoxGeometry(100,.8,2.2),M(0xffffff,{map:seatTex,roughness:.8}),0,.6+i*1.4,i*2,false));}
  gs.add(mesh(new THREE.BoxGeometry(102,.35,16),M(0xe8ebee,{roughness:.6}),0,11,6,false));
  for(let x=-50;x<=50;x+=10)gs.add(mesh(new THREE.CylinderGeometry(.18,.18,11,8),MAT.steel,x,5.5,13,false));
  scene.add(gs);
  // árvores
  const tg=new THREE.ConeGeometry(2.2,7,8),tm=M(0x2f5a2c,{roughness:1}),N=70;const trees=new THREE.InstancedMesh(tg,tm,N);const d=new THREE.Object3D();
  for(let i=0;i<N;i++){d.position.set(rand(-110,110),3.5,rand(64,92));const s=rand(.7,1.4);d.scale.set(s,s*rand(.9,1.3),s);d.updateMatrix();trees.setMatrixAt(i,d.matrix);}scene.add(trees);
  // edifício das boxes e fachadas vizinhas
  const bldM=M(0xd9dce0,{roughness:.7});
  [[-57.05,106],[57.05,106]].forEach(([x,w])=>{const b=mesh(new THREE.BoxGeometry(w,6,14),bldM,x,3,-13.6,false);b.receiveShadow=true;scene.add(b);});
  scene.add(mesh(new THREE.BoxGeometry(8.1,1.4,14),bldM,0,5.3,-13.6,false));
  const glassBand=mesh(new THREE.BoxGeometry(240,1.2,.1),MAT.glass,0,7.2,-6.8,false);scene.add(glassBand);
  scene.add(mesh(new THREE.BoxGeometry(240,1.8,13),bldM,0,6.9,-13.6,false));
  const nb=[[0x1b2a6b,0xffc906,'BULL ENERGY'],[0xdc0000,0xfff200,'ROSSA'],[0x0f5c45,0xcedc00,'EMERALD'],[0xff8000,0x0d1b2a,'PAPAYA'],[0x9aa3ad,0x00d2be,'SILVER'],[0x0a3d91,0x00a3e0,'GROVE']];
  for(let i=-6;i<=6;i++){if(i===0)continue;const x=i*9;const tc=nb[(i+6)%nb.length];
    scene.add(mesh(new THREE.BoxGeometry(7.4,4,.2),M(0x0b0c0e,{roughness:.9}),x,2,-6.55,false));
    const inner=mesh(new THREE.PlaneGeometry(7.2,3.8),M(0x2a2e34,{roughness:.6}),x,2,-6.4,false);scene.add(inner);
    for(let k=0;k<3;k++)scene.add(mesh(new THREE.CylinderGeometry(.36,.36,.36,20),k===2?M(tc[0],{roughness:.9}):MAT.tyre,x+2.6,.18+k*.37,-6.1));
    scene.add(mesh(new THREE.BoxGeometry(8.6,1,.3),M(tc[0],{roughness:.45}),x,5,-6.5,false));
    scene.add(mesh(new THREE.BoxGeometry(8.6,.15,.32),M(tc[1]),x,4.5,-6.5,false));
    const lg=new THREE.Mesh(new THREE.PlaneGeometry(6,.8),textDecal(tc[2],lum(tc[0])>.6?'#111':'#fff'));lg.position.set(x,5,-6.33);scene.add(lg);}
  buildGarage();
  buildGantry();
  // TV grande da garagem: imagem 3D da transmissão + grafismo por cima
  W.tvCanvas=document.createElement('canvas');W.tvCanvas.width=800;W.tvCanvas.height=450;W.tvCtx=W.tvCanvas.getContext('2d');
  W.tvTex=new THREE.CanvasTexture(W.tvCanvas);W.tvTex.encoding=THREE.sRGBEncoding;W.tvTex.anisotropy=4;
  const tv=new THREE.Group();tv.position.set(0,2.2,-16.7);
  tv.add(mesh(rbox(2.38,1.4,.08,.02),M(0x0d0e10,{roughness:.3,metalness:.5}),0,0,-.045));
  W.tvScreenMat=new THREE.MeshBasicMaterial({color:0x05070a,toneMapped:false});
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(2.24,1.26),W.tvScreenMat);scr.position.z=.004;tv.add(scr);W.tvScreen=scr;
  W.tvOverMat=new THREE.MeshBasicMaterial({map:W.tvTex,transparent:true,toneMapped:false,depthWrite:false});
  const ov=new THREE.Mesh(new THREE.PlaneGeometry(2.24,1.26),W.tvOverMat);ov.position.z=.009;tv.add(ov);
  [-.85,.85].forEach(x=>{tv.add(mesh(new THREE.CylinderGeometry(.035,.035,2.2,8),MAT.steel,x,-1.1,-.12));tv.add(mesh(rbox(.5,.04,.6,.01),MAT.steel,x,-2.18,-.12));});
  scene.add(tv);W.tv=tv;
  const tvLight=new THREE.PointLight(0x9fc4ff,.6,4);tvLight.position.set(0,2.0,-15.9);scene.add(tvLight);
}
function buildGarage(){
  const g=new THREE.Group();scene.add(g);W.garage=g;
  // chão em epóxi brilhante
  const epoxy=canvasTex(512,512,(c,w,h)=>{noiseFill(c,w,h,'#8f969d',9000,120,160,1);c.strokeStyle='rgba(40,44,50,.35)';c.lineWidth=3;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(i*128,0);c.lineTo(i*128,h);c.stroke();c.beginPath();c.moveTo(0,i*128);c.lineTo(w,i*128);c.stroke();}},[2,3]);
  const floor=mesh(new THREE.PlaneGeometry(8,12),M(0xffffff,{map:epoxy,roughness:.16,metalness:0,envMapIntensity:.8}),0,.004,-12.5,false);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;g.add(floor);
  W.floorStripMat=M(0xff8000,{roughness:.3});
  [-3.3,3.3].forEach(x=>{const s=mesh(new THREE.PlaneGeometry(.3,12),W.floorStripMat,x,.006,-12.5,false);s.rotation.x=-Math.PI/2;g.add(s);});
  const panelTex=canvasTex(512,256,(c,w,h)=>{c.fillStyle='#e9ecef';c.fillRect(0,0,w,h);c.strokeStyle='#c9ced4';c.lineWidth=3;for(let x=0;x<=w;x+=128)c.strokeRect(x,0,128,h);},[3,1]);
  const wallM=M(0xffffff,{map:panelTex,roughness:.7,side:THREE.DoubleSide});
  g.add(mesh(new THREE.PlaneGeometry(8,4.5),wallM,0,2.25,-18.4,false));
  [-4,4].forEach(x=>{const s=mesh(new THREE.PlaneGeometry(12,4.5),wallM,x,2.25,-12.4,false);s.rotation.y=x<0?Math.PI/2:-Math.PI/2;g.add(s);});
  const ceil=mesh(new THREE.PlaneGeometry(8,12),M(0x24272c,{side:THREE.DoubleSide}),0,4.5,-12.4,false);ceil.rotation.x=Math.PI/2;g.add(ceil);
  for(let z=-17.5;z<=-7;z+=1.5)g.add(mesh(new THREE.BoxGeometry(8,.12,.08),MAT.steel,0,4.4,z,false));
  W.bannerMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6});
  g.add(mesh(new THREE.PlaneGeometry(7.6,1.2),W.bannerMat,0,3.6,-18.35,false));
  W.facadeMat=M(0xff8000,{roughness:.45});W.facade2=M(0x111111);
  g.add(mesh(new THREE.BoxGeometry(8.6,1,.3),W.facadeMat,0,5,-6.5,false));
  g.add(mesh(new THREE.BoxGeometry(8.6,.15,.32),W.facade2,0,4.5,-6.5,false));
  W.facadeLogoMat=new THREE.MeshStandardMaterial({transparent:true,roughness:.5,polygonOffset:true,polygonOffsetFactor:-4});
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(6,.8),W.facadeLogoMat);fl.position.set(0,5,-6.33);g.add(fl);
  W.sideMat=M(0xff8000,{roughness:.5});
  [-3.98,3.98].forEach(x=>{const p=mesh(new THREE.PlaneGeometry(10,.5),W.sideMat,x,1.2,-12.5,false);p.rotation.y=x<0?Math.PI/2:-Math.PI/2;g.add(p);});
  // pneus com mantas térmicas
  W.blanketMat=M(0xff8000,{roughness:.95});
  const quilt=canvasTex(128,64,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=2;for(let x=0;x<w;x+=16){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}});
  W.blanketMat.map=quilt;
  const tyreStack=(x,z,n,blanket)=>{for(let i=0;i<n;i++){const top=i===n-1&&blanket;const t=new THREE.Group();t.position.set(x,.18+i*.37,z);
      t.add(mesh(new THREE.CylinderGeometry(.37,.37,.35,28),top?W.blanketMat:MAT.tyre));
      if(!top)t.add(mesh(new THREE.CylinderGeometry(.24,.24,.36,20),MAT.rim));g.add(t);}};
  tyreStack(-3.2,-17.4,3,true);tyreStack(-2.3,-17.4,3,true);tyreStack(-3.2,-16.4,2,false);tyreStack(3.1,-10,4,true);tyreStack(3.1,-9.1,3,true);tyreStack(-3.2,-9.5,4,true);
  // carrinhos de ferramentas com gavetas
  const drawerTex=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#c81d25';c.fillRect(0,0,w,h);c.fillStyle='rgba(0,0,0,.35)';for(let y=10;y<h;y+=24)c.fillRect(6,y,w-12,3);c.fillStyle='#d9dde2';for(let y=18;y<h;y+=24)c.fillRect(w/2-20,y,40,4);});
  const chest=M(0xffffff,{map:drawerTex,roughness:.35,metalness:.4});
  [[2.6,-17.75],[1.4,-17.75],[3.55,-15.6]].forEach(([x,z],i)=>{const b=mesh(rbox(1.1,1.0,.6,.03),chest,x,.55,z);if(i===2)b.rotation.y=Math.PI/2;g.add(b);
    g.add(mesh(rbox(1.14,.06,.64,.02),MAT.carbonMatte,x,1.07,z));
    [[-.45,-.22],[.45,-.22],[-.45,.22],[.45,.22]].forEach(([dx,dz])=>g.add(mesh(new THREE.CylinderGeometry(.04,.04,.03,10).rotateX(Math.PI/2),MAT.rubber,x+(i===2?dz:dx),.04,z+(i===2?dx:dz))));});
  // pistolas no suporte e mangueiras de ar no chão
  for(let i=0;i<4;i++){const gun=mesh(new THREE.CylinderGeometry(.05,.055,.26,14).rotateZ(Math.PI/2),M(0x2b2e33,{metalness:.7,roughness:.3}),-3.7,1.55,-14.5+i*.5);g.add(gun);}
  g.add(mesh(rbox(.1,.2,2.2,.02),MAT.steel,-3.9,1.45,-13.75));
  const hose=(pts)=>{const tb=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.022,6),M(0xd8a106,{roughness:.6}));tb.castShadow=true;g.add(tb);};
  hose([V3(-3.9,1.4,-13),V3(-3.5,.03,-12.2),V3(-2.2,.03,-11.5),V3(-1,.03,-10.5),V3(.4,.03,-8.2),V3(1.2,.03,-6.8)]);
  hose([V3(-3.9,1.4,-14),V3(-3.6,.03,-13),V3(-1.2,.03,-12.8),V3(.2,.03,-11),V3(1.6,.03,-9.2),V3(2.2,.03,-7)]);
  // secretária com monitores de telemetria
  const DX=2.3,DZ=-15.3;
  g.add(mesh(rbox(1.6,.75,.6,.03),M(0x1e2228,{roughness:.5}),DX,.375,DZ));
  [-.5,.5].forEach(x0=>{const x=DX+x0;const mo=mesh(rbox(.52,.33,.03,.01),MAT.dark,x,.95,DZ-.1);mo.rotation.x=-.2;g.add(mo);
    const s=new THREE.Mesh(new THREE.PlaneGeometry(.47,.28),new THREE.MeshBasicMaterial({map:canvasTex(256,160,(c,w,h)=>{c.fillStyle='#0a1a14';c.fillRect(0,0,w,h);c.strokeStyle=x0<0?'#2bd46a':'#ffc61a';c.lineWidth=2;c.beginPath();for(let i=0;i<w;i+=4)c.lineTo(i,h/2+Math.sin(i*.07)*30+rand(-8,8));c.stroke();})}));
    s.position.set(x,.95,DZ-.08);s.rotation.x=-.2;g.add(s);});
  // extintor
  g.add(mesh(new THREE.CylinderGeometry(.09,.09,.5,14),M(0xd00000,{roughness:.3,metalness:.2}),3.8,.25,-11.5));
  // nariz sobresselente na parede
  const nose=mesh(new THREE.CylinderGeometry(.05,.22,1.3,14).rotateZ(Math.PI/2),W.sideMat,3.7,2.6,-14);nose.scale.set(1,.6,1);g.add(nose);
  // luzes de teto
  for(let z=-17;z<=-8;z+=3)g.add(mesh(rbox(1.8,.06,.3,.02),new THREE.MeshBasicMaterial({color:0xffffff}),0,4.4,z,false));
  const gl=new THREE.PointLight(0xfff8ee,1,14);gl.position.set(0,4,-13);g.add(gl);
  const gl2=new THREE.PointLight(0xfff8ee,.5,9);gl2.position.set(0,3.5,-8.5);g.add(gl2);
  // bancos onde a equipa se senta a ver a corrida
  const stoolM=M(0x1b1d22,{roughness:.5,metalness:.4});
  W.SEATS=[[-.66,-14.05],[.72,-14.0],[-1.55,-13.35],[1.62,-13.3],[-2.6,-14.6],[3.15,-12.6]];
  [[.12,-12.35],...W.SEATS,[2.3,-14.55]].forEach(([x,z])=>{g.add(mesh(new THREE.CylinderGeometry(.2,.2,.06,18),stoolM,x,.5,z));g.add(mesh(new THREE.CylinderGeometry(.03,.03,.48,8),MAT.steel,x,.25,z));g.add(mesh(new THREE.CylinderGeometry(.2,.22,.03,16),MAT.steel,x,.015,z));});
  // carro de pneus prontos (com mantas) junto à saída da garagem
  const tro=new THREE.Group();tro.position.set(-1.75,0,-9.0);g.add(tro);
  tro.add(mesh(rbox(.95,.06,.95,.02),MAT.steel,0,.14,0));
  [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]].forEach(([x,z])=>{tro.add(mesh(new THREE.CylinderGeometry(.02,.02,1.5,6),MAT.steel,x,.85,z));tro.add(mesh(new THREE.CylinderGeometry(.05,.05,.04,10).rotateX(Math.PI/2),MAT.rubber,x,.05,z));});
  for(let i=0;i<2;i++){const t=new THREE.Group();t.position.y=.36+i*.37;t.add(mesh(new THREE.CylinderGeometry(.36,.36,.33,32),MAT.tyre));t.add(mesh(new THREE.CylinderGeometry(.23,.23,.34,24),MAT.rim));tro.add(t);}
  W.fetchTyre=new THREE.Group();W.fetchTyre.position.set(-1.75,1.1,-9.0);W.fetchTyre.add(mesh(new THREE.CylinderGeometry(.37,.37,.35,28),W.blanketMat));
  W.fetchStripe=put(W.fetchTyre,mesh(new THREE.TorusGeometry(.3,.014,6,32),M(0xffd400,{roughness:.5}),0,.18,0,false));W.fetchStripe.rotation.x=Math.PI/2;g.add(W.fetchTyre);
  W.playerSpot=new THREE.Group();W.playerSpot.position.set(-2.2,0,-12.3);W.playerSpot.rotation.y=.9;g.add(W.playerSpot);
}
function buildGantry(){
  const g=new THREE.Group();g.position.set(5.3,0,-3.5);
  g.add(mesh(new THREE.CylinderGeometry(.05,.06,2.6,10),MAT.steel,0,1.3,0));
  g.add(mesh(new THREE.CylinderGeometry(.25,.28,.06,16),MAT.steel,0,.03,0));
  g.add(mesh(rbox(.08,.08,2.6,.01),MAT.steel,0,2.6,1.3));
  g.add(mesh(rbox(.18,.5,.22,.03),MAT.dark,0,2.35,2.4));
  W.lightR=new THREE.MeshBasicMaterial({color:0xff1a1a});W.lightG=new THREE.MeshBasicMaterial({color:0x103010});
  const r=new THREE.Mesh(new THREE.SphereGeometry(.07,12,10),W.lightR);r.position.set(-.1,2.48,2.4);g.add(r);
  const gr=new THREE.Mesh(new THREE.SphereGeometry(.07,12,10),W.lightG);gr.position.set(-.1,2.24,2.4);g.add(gr);
  scene.add(g);
}
function setTeamLook(team){
  const c1=hex(team.c1),c2=hex(team.c2),ink=lum(team.c1)>.6?'#111':'#fff';
  [W.facadeMat,W.sideMat,W.blanketMat,W.standMat,W.floorStripMat].forEach(m=>m.color.setHex(team.c1));W.facade2.color.setHex(team.c2);
  W.bannerMat.map=canvasTex(1024,160,(c,w,h)=>{c.fillStyle=c1;c.fillRect(0,0,w,h);c.fillStyle=c2;c.fillRect(0,h-26,w,26);
    c.fillStyle=ink;c.font='italic 900 76px "Saira Condensed",Arial Narrow,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(team.name.toUpperCase(),w/2,h/2-10);});
  W.bannerMat.needsUpdate=true;
  const logo=(c,w,h)=>{c.fillStyle=ink;c.font='italic 900 84px "Saira Condensed",Arial Narrow,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(team.name.split(' (')[0].toUpperCase(),w/2,h/2+4,w-20);};
  W.facadeLogoMat.map=canvasTex(1024,136,logo);W.facadeLogoMat.needsUpdate=true;
  W.floorLogoMat.map=canvasTex(1024,256,(c,w,h)=>{c.globalAlpha=.75;c.fillStyle=c1;c.font='italic 900 170px "Saira Condensed",Arial Narrow,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(team.name.split(' ')[0].toUpperCase(),w/2,h/2+8,w-20);});W.floorLogoMat.needsUpdate=true;
  document.documentElement.style.setProperty('--team',c1);document.documentElement.style.setProperty('--team2',c2);
}

/* ---- rodas: pneu com flanco escrito, jante de raios, porca central ---- */
const SIDE_TEX={};
function sidewallTex(compound){
  if(SIDE_TEX[compound])return SIDE_TEX[compound];
  const col=hex(COMPOUND[compound].c);
  const t=canvasTex(512,512,(c)=>{c.translate(256,256);
    c.lineWidth=11;c.strokeStyle=col;[[.25,1.3],[1.84,2.9],[3.4,4.45],[4.98,6.03]].forEach(([a,b])=>{c.beginPath();c.arc(0,0,236,a,b);c.stroke();});
    const word=(txt,ang,rad,step)=>{const n=txt.length;for(let i=0;i<n;i++){const a=ang+(i-(n-1)/2)*step;c.save();c.rotate(a);c.translate(0,-rad);c.fillText(txt[i],0,0);c.restore();}};
    c.fillStyle='#ededed';c.textAlign='center';c.textBaseline='middle';c.font='900 30px Arial';
    word('PIT BOX',0,206,.105);word('PIT BOX',Math.PI,206,.105);
    c.font='700 17px Arial';word(COMPOUND[compound].name.toUpperCase(),Math.PI/2,206,.07);word('RACING SLICK',-Math.PI/2,206,.07);
  });
  SIDE_TEX[compound]=t;return t;
}
function makeWheel(r,w,compound,blanket=false){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const h=w/2,ri=r*.64;
  const prof=[[ri,-h+.02],[r-.05,-h],[r-.015,-h+.018],[r,-h+.06],[r,h-.06],[r-.015,h-.018],[r-.05,h],[ri,h-.02]].map(([a,b])=>new THREE.Vector2(a,b));
  const tyre=mesh(new THREE.LatheGeometry(prof,56).rotateX(Math.PI/2),MAT.tyre);inner.add(tyre);
  const swM=new THREE.MeshStandardMaterial({map:sidewallTex(compound),transparent:true,alphaTest:.25,roughness:.6,polygonOffset:true,polygonOffsetFactor:-2});
  const ringG=new THREE.RingGeometry(ri+.006,r-.02,56,1);
  const s1=new THREE.Mesh(ringG,swM);s1.position.z=h+.002;inner.add(s1);
  const s2=new THREE.Mesh(ringG,swM);s2.position.z=-h-.002;s2.rotation.y=Math.PI;inner.add(s2);
  inner.add(mesh(new THREE.CylinderGeometry(ri,ri,w-.03,40,1,true).rotateX(Math.PI/2),M(0x15171a,{metalness:.8,roughness:.4,side:THREE.DoubleSide})));
  [h-.022,-h+.022].forEach(z=>inner.add(mesh(new THREE.TorusGeometry(ri-.004,.011,8,48),MAT.lip,0,0,z)));
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const sp=mesh(rbox(.032,ri-.08,.022,.008),MAT.rim,Math.sin(a)*(ri+.07)/2,Math.cos(a)*(ri+.07)/2,h-.07);sp.rotation.z=-a;sp.rotation.x=.18*Math.cos(0);inner.add(sp);}
  inner.add(mesh(new THREE.CylinderGeometry(.075,.088,.09,24).rotateX(Math.PI/2),MAT.rim,0,0,h-.085));
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;inner.add(mesh(new THREE.CylinderGeometry(.008,.008,.02,6).rotateX(Math.PI/2),MAT.lip,Math.cos(a)*.062,Math.sin(a)*.062,h-.035));}
  const nut=mesh(new THREE.CylinderGeometry(.052,.052,.055,6).rotateX(Math.PI/2),M(0xd8232a,{metalness:.8,roughness:.25}),0,0,h-.025);g.add(nut);
  nut.add(mesh(new THREE.CylinderGeometry(.03,.03,.058,16).rotateX(Math.PI/2),MAT.nut,0,0,0,false));
  nut.userData.z0=h-.025;
  let bl=null;
  if(blanket){bl=new THREE.Group();const bm=W.blanketMat.clone();bm.side=THREE.DoubleSide;
    bl.add(mesh(new THREE.CylinderGeometry(r+.035,r+.035,w+.05,40,1,true).rotateX(Math.PI/2),bm));
    bl.add(mesh(new THREE.RingGeometry(ri,r+.035,40),bm,0,0,h+.026));g.add(bl);}
  mergeGroup(inner);
  g.userData={nut,inner,r,w,blanket:bl};
  return g;
}
/* travão em brasa, cubo e eixo roscado — ficam no carro quando a roda sai */
function makeHub(r,w){
  const g=new THREE.Group(),ri=r*.64,h=w/2;
  g.add(mesh(new THREE.CylinderGeometry(ri*.86,ri*.86,.13,32,1,true).rotateX(Math.PI/2),M(0x111214,{roughness:.5,side:THREE.DoubleSide}),0,0,-h*.45));
  const disc=mesh(new THREE.CylinderGeometry(ri*.76,ri*.76,.032,40).rotateX(Math.PI/2),MAT.disc,0,0,-h*.15);g.add(disc);
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;put(g,mesh(new THREE.BoxGeometry(.004,ri*.3,.034),MAT.carbonMatte,Math.cos(a)*ri*.58,Math.sin(a)*ri*.58,-h*.15,false)).rotation.z=a-Math.PI/2;}
  const cal=mesh(rbox(.08,ri*.6,.08,.02),M(0xc8102e,{roughness:.35,metalness:.4}),ri*.55,ri*.25,-h*.15);cal.rotation.z=-.5;g.add(cal);
  g.add(mesh(new THREE.CylinderGeometry(.1,.1,.05,6).rotateX(Math.PI/2),MAT.steel,0,0,h*.05));
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;g.add(mesh(new THREE.CylinderGeometry(.012,.012,.06,8).rotateX(Math.PI/2),MAT.nut,Math.cos(a)*.075,Math.sin(a)*.075,h*.12));}
  g.add(mesh(new THREE.CylinderGeometry(.034,.034,h*.9,16).rotateX(Math.PI/2),MAT.thread,0,0,h*.4));
  for(let i=0;i<6;i++)g.add(mesh(new THREE.TorusGeometry(.034,.004,4,16),MAT.thread,0,0,h*.1+i*.03,false));
  return mergeGroup(g);
}

/* ---- carros ---- */
function carNumber(c1,c2){return (c1*7+c2*13)%89+4;}
function makeCar(kind,c1,c2,compound){
  const car=new THREE.Group(),body=new THREE.Group();car.add(body);
  const paint=PM(c1),paint2=PM(c2),cb=MAT.carbon,blk=MAT.dark,num=carNumber(c1,c2);
  const add=(g,m,x=0,y=0,z=0)=>{const o=mesh(g,m,x,y,z);body.add(o);return o;};
  const ink=lum(c1)>.6?'#111':'#fff',ink2=lum(c2)>.6?'#111':'#fff';
  let wx,wz,wr,ww,S=1;
  if(kind==='gt3'){
    const hw=tbl([[2.42,.8],[2.1,.93],[1.6,.97],[-2.0,.97],[-2.38,.9]]);
    add(extrudeSide([['m',2.36,.16],['q',2.5,.3,2.42,.52],['q',2.32,.68,1.9,.73],['q',1.2,.8,.75,.87],['l',-1.8,.9],['q',-2.32,.9,-2.4,.76],['l',-2.42,.3],['l',-2.32,.16],
      ['l',-1.83,.16],['l',-1.83,.34],['a',-1.4,.34,.43,Math.PI,0,true],['l',-.97,.16],['l',.97,.16],['l',.97,.34],['a',1.4,.34,.43,Math.PI,0,true],['l',1.83,.16]],hw,.05,14),paint);
    add(rbox(3.2,.28,1.3,.04),blk,0,.3,0);
    [1.4,-1.4].forEach(x=>add(new THREE.CylinderGeometry(.445,.445,1.75,28,1,true,0,Math.PI).rotateX(Math.PI/2).rotateZ(Math.PI/2),M(0x0a0a0b,{side:THREE.DoubleSide,roughness:.9}),x,.34,0));
    add(extrudeSide([['m',.8,.85],['q',.3,1.16,-.1,1.25],['l',-.86,1.25],['q',-1.5,1.14,-1.95,.88],['l',.8,.85]],tbl([[.8,.8],[-.2,.72],[-1.9,.64]]),.04,12),MAT.glass);
    add(extrudeSide([['m',-.02,1.235],['l',-.88,1.235],['l',-.9,1.28],['l',-.05,1.28]],.7,.02),paint);
    add(extrudeSide([['m',2.3,.67],['q',2.1,.74,1.9,.745],['q',1.2,.815,.8,.885],['l',.8,.895],['q',1.2,.825,1.9,.755],['q',2.1,.75,2.3,.68]],.13,.004),paint2);
    add(extrudeSide([['m',-.05,1.285],['l',-.86,1.285],['l',-.86,1.292],['l',-.05,1.292]],.13,.003),paint2);
    add(rbox(.5,.05,1.98,.02),cb,2.32,.13,0);[-.85,.85].forEach(z=>add(rbox(.3,.03,.18,.01),cb,2.3,.3,z));
    add(rbox(.45,.12,1.6,.02),blk,-2.25,.22,0);for(let i=-3;i<=3;i++)add(new THREE.BoxGeometry(.4,.14,.015),cb,-2.3,.22,i*.22);
    const rw=wing(.38,.06,1.9,cb,-1.95,1.36,0,-.12);body.add(rw);
    [-.5,.5].forEach(z=>{const n=add(extrudeSide([['m',-1.9,.86],['q',-1.95,1.2,-2.1,1.38],['l',-2.18,1.38],['q',-2.0,1.15,-2.0,.86]],.012,.006),cb,0,0,z);});
    [-.96,.96].forEach(z=>add(rbox(.42,.2,.02,.01),cb,-2.13,1.36,z));
    const hl=M(0xffffff,{emissive:0xfff3d0,emissiveIntensity:1.4,roughness:.1});
    [-.6,.6].forEach(z=>{const l=add(rbox(.3,.08,.3,.03),hl,2.2,.66,z);l.rotation.z=-.5;});
    add(rbox(.04,.05,1.5,.015),M(0xff0000,{emissive:0xff1010,emissiveIntensity:1.6}),-2.4,.74,0);
    [-1,1].forEach(z=>add(rbox(.16,.08,.08,.02),paint,.62,.97,z*.99));
    // número e patrocinador nas portas
    const numMat=decalMat((c,w,h)=>{c.fillStyle='#fff';c.beginPath();c.arc(w/2,h/2,h/2-4,0,7);c.fill();c.fillStyle='#111';c.font='900 150px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(num,w/2,h/2+8);},256,256);
    const spMat=textDecal('PIT BOX',ink2,{bg:hex(c2)});
    [-1,1].forEach(s=>{const n=new THREE.Mesh(new THREE.PlaneGeometry(.55,.55),numMat);n.position.set(.05,.58,s*.976);if(s<0)n.rotation.y=Math.PI;body.add(n);
      const sp=new THREE.Mesh(new THREE.PlaneGeometry(.9,.22),spMat);sp.position.set(-1.6,.6,s*.976);if(s<0)sp.rotation.y=Math.PI;body.add(sp);});
    add(new THREE.SphereGeometry(.14,16,12),PM(c2),-.45,1.02,-.3);
    wx=1.4;wz=.83;wr=.34;ww=.3;
  }else{
    S={f1:1,f2:.96,f3:.9,f4:.84}[kind];
    const modern=kind==='f1'||kind==='f2';
    add(extrudeSide([['m',2.0,.05],['l',2.0,.09],['l',-2.25,.09],['l',-2.25,.05]],tbl([[2.0,.3],[1.3,.3],[.8,.7],[-1.2,.72],[-1.6,.45],[-2.25,.4]]),.01),cb);
    add(extrudeSide([['m',2.82,.13],['l',2.82,.22],['q',2.2,.29,1.55,.42],['l',.78,.6],['l',.3,.63],['l',-.55,.64],['l',-.55,.15],['q',1.0,.1,2.82,.13]],
      tbl([[2.82,.06],[2.3,.12],[1.6,.19],[1.0,.26],[.6,.29],[-.6,.3]]),.03,12),paint);
    add(extrudeSide([['m',2.84,.13],['l',2.84,.225],['q',2.7,.24,2.5,.27],['l',2.5,.12]],tbl([[2.84,.055],[2.5,.08]]),.012),paint2);
    add(rbox(.72,.06,.4,.02),blk,.2,.635,0);
    add(new THREE.SphereGeometry(.125,20,16),paint2,.05,.72,0);
    const vis=mesh(new THREE.SphereGeometry(.128,20,10,-Math.PI*.38,Math.PI*.76,Math.PI*.36,Math.PI*.2),MAT.dark,.05,.72,0);vis.rotation.y=Math.PI/2;body.add(vis);
    add(rbox(.22,.12,.36,.04),cb,-.18,.68,0);
    add(extrudeSide([['m',.6,.19],['l',.6,.48],['q',.45,.56,.1,.56],['q',-.7,.55,-1.3,.3],['l',-1.3,.15],['l',.6,.19]],tbl([[.62,modern?.62:.5],[0,modern?.6:.5],[-.6,.47],[-1.3,.27]]),.04,12),paint);
    [-1,1].forEach(z=>add(rbox(.05,.24,.3,.02),blk,.6,.37,z*(modern?.45:.36)));
    add(extrudeSide([['m',.0,.6],['l',.02,.93],['q',-.3,.98,-.8,.8],['l',-1.95,.42],['l',-1.95,.22],['l',0,.3]],tbl([[.05,.16],[-.3,.23],[-1,.2],[-1.95,.1]]),.03,12),paint);
    add(rbox(.04,.15,.17,.015),blk,.035,.84,0);
    if(kind!=='f4')add(extrudeSide([['m',-.62,.86],['l',-1.85,.72],['l',-1.85,.46],['l',-1.0,.7]],.008,.004),paint2);
    // halo
    const hp=[V3(-.12,.66,.27),V3(.05,.81,.28),V3(.38,.83,.23),V3(.6,.8,0),V3(.38,.83,-.23),V3(.05,.81,-.28),V3(-.12,.66,-.27)];
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp),40,.026,10),cb);
    body.add(rod(V3(.6,.8,0),V3(.72,.6,0),.03,cb));
    [-1,1].forEach(z=>{body.add(rod(V3(.45,.62,z*.25),V3(.5,.74,z*.42),.012,cb));add(rbox(.13,.07,.05,.02),paint,.5,.75,z*.44);});
    // asa dianteira multi-elemento
    const fw=modern?[[.34,.04,2.95,.08,-.04],[.2,.03,2.68,.135,-.22],[.16,.025,2.55,.19,-.4]]:[[.32,.04,2.95,.09,-.05],[.18,.03,2.7,.15,-.25]];
    fw.forEach(([c,t,x,y,a],i)=>body.add(wing(c,t,1.9,i===0?cb:paint2,x,y,0,a)));
    [-.96,.96].forEach(z=>add(rbox(.46,.2,.02,.01),paint2,2.72,.17,z));
    // asa traseira, beam wing, difusor
    body.add(wing(.36,.05,.96,paint2,-1.95,.83,0,-.08));body.add(wing(.22,.035,.96,paint,-2.2,.95,0,-.45));
    body.add(wing(.2,.03,.8,cb,-1.95,.42,0,-.15));
    [-.49,.49].forEach(z=>add(rbox(.6,.46,.02,.01),paint,-2.12,.82,z));
    add(rbox(.1,.38,.05,.02),cb,-2.0,.6,0);
    add(rbox(.5,.18,.95,.02),blk,-2.05,.2,0);
    add(rbox(.04,.06,.1,.015),M(0xff0000,{emissive:0xff0000,emissiveIntensity:2}),-2.32,.38,0);
    // suspensão
    [[1.75,1],[1.75,-1],[-1.75,1],[-1.75,-1]].forEach(([x,s])=>{const wy=kind==='f4'?.3:.35;
      [[.24,.17],[.44,.2]].forEach(([y,zi])=>{body.add(rod(V3(x+.25,y,s*zi),V3(x,wy+(y>.3?.08:-.08),s*.62),.014,cb));body.add(rod(V3(x-.25,y,s*zi),V3(x,wy+(y>.3?.08:-.08),s*.62),.014,cb));});
      body.add(rod(V3(x+.05,.5,s*.2),V3(x,wy-.06,s*.6),.012,cb));});
    // livery: número no nariz e patrocinadores nas placas da asa traseira
    const numMat=decalMat((c,w,h)=>{c.fillStyle=ink2;c.font='italic 900 200px "Saira Condensed",Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(num,w/2,h/2+10);},256,256);
    const nn=new THREE.Mesh(new THREE.PlaneGeometry(.26,.26),numMat);nn.position.set(2.15,.335,0);nn.rotation.set(-Math.PI/2,0,-Math.PI/2);nn.rotateX(.16);body.add(nn);
    const spMat=textDecal('PIT BOX',ink);
    [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.56,.14),spMat);p.position.set(-2.12,.86,s*.502);if(s<0)p.rotation.y=Math.PI;body.add(p);});
    const sp2=textDecal(String(num),ink);[-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.4,.1),sp2);p.position.set(2.72,.18,s*.972);if(s<0)p.rotation.y=Math.PI;body.add(p);});
    wx=1.75;wz=.78;wr=kind==='f4'?.31:kind==='f3'?.33:.36;ww=kind==='f1'?.32:.3;
  }
  const wheels={};
  [['FL',wx,-wz],['FR',wx,wz],['RL',-wx,-wz],['RR',-wx,wz]].forEach(([k,x,z])=>{
    const w2=k[0]==='R'&&kind!=='gt3'?ww+.06:ww;
    const w=makeWheel(wr,w2,compound);
    const slot=new THREE.Group();slot.position.set(x,wr,z);if(z<0)slot.rotation.y=Math.PI;
    slot.add(makeHub(wr,w2));slot.add(w);car.add(slot);wheels[k]={slot,wheel:w};
  });
  // sombra de contacto suave
  const cs=new THREE.Mesh(new THREE.PlaneGeometry(kind==='gt3'?5.4:5.8,kind==='gt3'?2.6:2.4),new THREE.MeshBasicMaterial({map:canvasTex(256,128,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(.6,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.save();c.scale(1,h/w);c.fillRect(0,0,w,w);c.restore();}),transparent:true,depthWrite:false}));
  cs.rotation.x=-Math.PI/2;cs.position.y=.006;car.add(cs);car.userData.cs=cs;
  mergeGroup(body);
  car.scale.setScalar(S);
  car.userData={wheels,kind,body,wr,S,cs};
  car.traverse(o=>{if(o.isMesh&&o!==cs&&!o.material.transparent)o.castShadow=true;});
  return car;
}

/* ---- mecânicos ---- */
const SKIN=[0xf0c8a4,0xdcaa7c,0xc08a5e,0x8b5a3a,0x5d3a25,0xe8bc96];
/* mecânico: de pé, de joelhos ou sentado; com capacete (box) ou boné e auscultadores (garagem) */
function makeMechanic(o){
  const g=new THREE.Group();
  const suit=M(o.suit,{roughness:.88}),acc=M(o.acc,{roughness:.8}),glove=M(o.glove,{roughness:.65});
  const shoe=M(0x16171a,{roughness:.55}),dark=M(0x141518,{roughness:.6});
  const cap=(r,l,m,x,y,z,rz=0,rx=0)=>{const c=mesh(new THREE.CapsuleGeometry(r,l,6,14),m,x,y,z);c.rotation.set(rx,0,rz);g.add(c);return c;};
  let ty;
  if(o.seated){
    [-.11,.11].forEach(z=>{cap(.09,.3,suit,.17,.56,z,Math.PI/2);cap(.078,.3,suit,.38,.3,z);put(g,mesh(rbox(.28,.09,.12,.03),shoe,.45,.045,z));put(g,mesh(new THREE.SphereGeometry(.07,12,10),acc,.37,.56,z));});
    ty=.92;
  }else if(o.kneel){
    cap(.085,.3,suit,.17,.36,-.12,-1.35);cap(.075,.32,suit,.36,.2,-.12,.1);g.add(mesh(rbox(.26,.09,.11,.03),shoe,.42,.045,-.12));
    cap(.085,.3,suit,0,.35,.12,.15);cap(.075,.32,suit,-.2,.09,.12,Math.PI/2);put(g,mesh(rbox(.11,.09,.24,.03),shoe,-.42,.06,.12)).rotation.y=Math.PI/2;
    g.add(mesh(new THREE.SphereGeometry(.07,12,10),acc,.02,.1,.12));ty=.8;
  }else{
    [-.11,.11].forEach(z=>{cap(.088,.32,suit,0,.72,z);cap(.078,.32,suit,0,.32,z);g.add(mesh(new THREE.SphereGeometry(.07,12,10),acc,.06,.52,z));g.add(mesh(rbox(.28,.09,.12,.03),shoe,.05,.045,z));});
    ty=1.12;
  }
  const torso=cap(.19,.32,suit,0,ty,0);torso.scale.set(.82,1,1.18);
  const panel=cap(.192,.2,acc,0,ty+.02,0);panel.scale.set(.83,1,.9);panel.position.x=-.005;
  put(g,mesh(new THREE.CylinderGeometry(.2,.2,.07,18),M(0x111214),0,ty-.16,0)).scale.set(.84,1,1.2);
  g.add(mesh(new THREE.CylinderGeometry(.09,.11,.08,14),acc,0,ty+.29,0));
  const arms=[];
  [-.28,.28].forEach(z=>{const sh=new THREE.Group();sh.position.set(0,ty+.18,z);
    sh.add(mesh(new THREE.CapsuleGeometry(.065,.2,5,10),suit,0,-.15,0));
    const el=new THREE.Group();el.position.y=-.3;sh.add(el);
    el.add(mesh(new THREE.CapsuleGeometry(.058,.2,5,10),suit,0,-.13,0));
    el.add(mesh(rbox(.1,.12,.08,.035),o.bare?M(o.skin||SKIN[0],{roughness:.7}):glove,0,-.3,0));
    el.rotation.z=o.seated?1.25:o.kneel?.9:.35;sh.rotation.z=o.seated?.35:o.kneel?.7:.15;g.add(sh);arms.push(sh);});
  const hy=ty+.47;
  if(o.bare){
    const skin=M(o.skin||SKIN[0],{roughness:.7});
    g.add(mesh(new THREE.CylinderGeometry(.06,.07,.12,12),skin,0,ty+.33,0));
    g.add(mesh(new THREE.SphereGeometry(.135,22,16),skin,.01,hy-.02,0));
    g.add(mesh(new THREE.SphereGeometry(.142,22,10,0,Math.PI*2,0,Math.PI*.42),M(o.suit,{roughness:.8}),0,hy,0));
    put(g,mesh(rbox(.16,.016,.2,.006),M(o.acc,{roughness:.8}),.14,hy+.03,0)).rotation.z=-.15;
    put(g,mesh(new THREE.TorusGeometry(.152,.013,6,22,Math.PI),dark,0,hy+.01,0)).rotation.y=Math.PI/2;
    [-.15,.15].forEach(z=>put(g,mesh(new THREE.CylinderGeometry(.055,.055,.04,16),dark,0,hy-.04,z)).rotation.x=Math.PI/2);
    put(g,mesh(new THREE.CylinderGeometry(.006,.006,.13,5),dark,.06,hy-.08,.14)).rotation.z=1.2;
  }else{
    const hel=PM(o.helmet,{roughness:.22,metalness:.15});
    const visor=M(o.mirror?0xa9c4e4:0x0a0c10,{roughness:.04,metalness:o.mirror?1:.7});
    g.add(mesh(new THREE.SphereGeometry(.16,24,18),hel,0,hy,0));
    const vg=new THREE.SphereGeometry(.164,24,10,Math.PI*.62,Math.PI*.76,Math.PI*.33,Math.PI*.28);g.add(mesh(vg,visor,0,hy,0,false));
    put(g,mesh(new THREE.TorusGeometry(.13,.02,8,20,Math.PI),hel,.02,ty+.36,0)).rotation.set(Math.PI/2,0,-Math.PI/2);
  }
  mergeGroup(g);g.userData={arms,skin:o.skin};
  return g;
}
/* mãos e pistola pneumática em primeira pessoa */
function makeFPRig(){
  const g=new THREE.Group();
  const gunM=M(0x2b2e33,{metalness:.7,roughness:.28}),gloveM=M(0x1d1f23,{roughness:.7}),sleeveM=M(0xff8000,{roughness:.88}),accM=M(0x111111,{roughness:.8});
  const gun=new THREE.Group();g.add(gun);
  const prof=[[0,0],[.03,0],[.046,.015],[.05,.05],[.056,.16],[.058,.2],[.05,.235],[.042,.255],[.036,.28],[0,.28]].map(([a,b])=>new THREE.Vector2(a,b));
  const body=mesh(new THREE.LatheGeometry(prof,28),gunM,0,0,.02,false);body.rotation.x=-Math.PI/2;gun.add(body);
  for(let i=0;i<4;i++)gun.add(mesh(new THREE.TorusGeometry(.058,.006,6,24),MAT.steel,0,0,-.05-i*.022,false));
  const sock=new THREE.Group();sock.position.set(0,0,-.3);gun.add(sock);
  sock.add(mesh(new THREE.CylinderGeometry(.034,.034,.07,6).rotateX(Math.PI/2),MAT.nut,0,0,0,false));
  sock.add(mesh(new THREE.BoxGeometry(.012,.05,.072),MAT.dark,.028,0,0,false));
  const hd=mesh(rbox(.045,.15,.065,.018),MAT.rubber,0,-.1,-.01,false);hd.rotation.x=.22;gun.add(hd);
  gun.add(mesh(rbox(.016,.04,.02,.006),M(0xd00000,{roughness:.4}),0,-.05,-.05,false));
  const side=mesh(new THREE.CylinderGeometry(.018,.018,.13,10).rotateZ(Math.PI/2),MAT.rubber,-.1,.0,-.12,false);gun.add(side);
  const hose=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0,-.17,.03),V3(.02,-.32,.12),V3(.12,-.6,.32)]),16,.016,8),M(0xd8a106,{roughness:.6}));gun.add(hose);
  const rh=mesh(rbox(.075,.1,.09,.035),gloveM,.005,-.1,0,false);gun.add(rh);
  for(let i=0;i<4;i++)put(gun,mesh(new THREE.CapsuleGeometry(.012,.035,3,6),gloveM,-.035,-.065-i*.02,-.035,false)).rotation.z=Math.PI/2;
  const lhG=new THREE.Group();lhG.position.set(-.13,0,-.12);g.add(lhG);
  const lh=mesh(rbox(.09,.07,.1,.03),gloveM,0,0,0,false);lhG.add(lh);
  for(let i=0;i<4;i++)lhG.add(mesh(new THREE.CapsuleGeometry(.011,.03,3,6),gloveM,.03,.03,-.035+i*.023,false));
  const ls=mesh(new THREE.CapsuleGeometry(.045,.3,5,10),sleeveM,-.05,-.12,.18,false);ls.rotation.x=1.0;ls.rotation.z=-.3;lhG.add(ls);
  const lc=mesh(new THREE.CylinderGeometry(.047,.047,.04,14),accM,-.01,-.03,.05,false);lc.rotation.x=1.0;lc.rotation.z=-.3;lhG.add(lc);
  const rs=mesh(new THREE.CapsuleGeometry(.047,.3,5,10),sleeveM,.03,-.25,.17,false);rs.rotation.x=.75;gun.add(rs);
  const rc=mesh(new THREE.CylinderGeometry(.049,.049,.04,14),accM,.012,-.15,.06,false);rc.rotation.x=.75;gun.add(rc);
  g.position.set(.17,-.2,-.52);g.rotation.y=.38;g.rotation.x=.16;g.scale.setScalar(.8);
  mergeGroup(gun,new Set([sock]));mergeGroup(lhG);
  g.userData={gun,sock,lhG,gunM,gloveM,sleeveM,accM,base:g.position.clone()};
  g.visible=false;
  return g;
}
