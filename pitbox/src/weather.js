'use strict';
/* Pit Box · Meteorologia dinâmica: céu, luz, pista molhada, chuva, noite, efeitos no trabalho */
const WEATHER={
  dry:{name:'Seco',icon:'☀️',temp:[20,27],track:'Pista seca',sky:'clear',wet:0,rain:0,night:0,sun:2.3,hemi:.45,fog:[55,190],fogC:0xcfdde9,
       comps:['soft','medium','hard'],note:'Condições normais.'},
  hot:{name:'Calor',icon:'🔥',temp:[33,41],track:'Pista seca e quente',sky:'haze',wet:0,rain:0,night:0,sun:2.6,hemi:.5,fog:[45,170],fogC:0xe6dcc8,
       comps:['medium','hard'],note:'Cubos e porcas quentes: o aperto sobe mais depressa. Cuidado com o binário.'},
  cold:{name:'Frio',icon:'❄️',temp:[3,9],track:'Pista seca e fria',sky:'overcast',wet:0,rain:0,night:0,sun:1.2,hemi:.5,fog:[45,160],fogC:0xc4ccd4,
       comps:['soft','medium'],note:'Porcas frias e contraídas: desapertar demora mais.'},
  wet:{name:'Pista molhada',icon:'💧',temp:[11,17],track:'Pista molhada',sky:'overcast',wet:1,rain:0,night:0,sun:1.0,hemi:.5,fog:[40,150],fogC:0xb9c2ca,
       comps:['inter'],note:'Luvas molhadas: encaixar a roda é mais difícil. A equipa pode mudar de pneus.'},
  rain:{name:'Chuva',icon:'🌧️',temp:[9,15],track:'Chuva forte',sky:'storm',wet:1,rain:1,night:0,sun:.55,hemi:.45,fog:[25,110],fogC:0x8d97a1,
       comps:['wet','inter'],note:'Chuva forte: pouca visibilidade, mãos molhadas e mudanças de pneus à última hora.'},
  night:{name:'Noite',icon:'🌙',temp:[23,29],track:'Corrida noturna',sky:'night',wet:0,rain:0,night:1,sun:.12,hemi:.16,fog:[60,220],fogC:0x0b1220,
       comps:['soft','medium','hard'],note:'Corrida noturna com holofotes. Menos luz à volta da box.'}
};
/* condições possíveis em cada circuito (a primeira é a mais habitual) */
const CIRCUIT_WX={'Portimão':['dry','hot','night'],'Barcelona':['hot','dry'],'Mónaco':['dry','hot','night'],'Silverstone':['wet','dry','rain','cold'],
  'Spa':['rain','wet','cold','dry'],'Zandvoort':['wet','dry','cold'],'Monza':['hot','dry','night'],'Interlagos':['rain','dry','hot'],
  'Suzuka':['dry','rain','wet'],'Red Bull Ring':['cold','rain','dry'],'Hungaroring':['hot','dry'],'Imola':['wet','dry','rain'],'Estoril':['dry','wet','hot','night']};
function pickWeather(circ){const l=CIRCUIT_WX[circ.n]||['dry'];return pick(l.concat(l[0],'dry'));}
/* efeitos no trabalho (equilibrados) */
function wxMods(id){return{
  loosen:id==='cold'?1.15:1, tq:id==='hot'?1.1:1, fit:id==='rain'?.8:id==='wet'?.86:1,
  strategy:id==='rain'?.6:id==='wet'?.45:.12};}

function makeSkyWx(kind){
  const P={clear:['#1f5fbf','#6fa3e3','#cfe0f1','#e8eef3',1,55,.55],haze:['#5f8fc4','#a9c4dc','#efe2c6','#f3e8d2',1,35,.5],
    overcast:['#7f8b97','#9aa5b0','#c3cad1','#d0d5da',0,90,.6],storm:['#3d4651','#59636e','#87919b','#9aa3ac',0,120,.75],night:['#030712','#08142b','#14233d','#1d2c44',0,0,0]}[kind];
  const t=canvasTex(2048,1024,(c,w,h)=>{
    const g=c.createLinearGradient(0,0,0,h/2);g.addColorStop(0,P[0]);g.addColorStop(.55,P[1]);g.addColorStop(.92,P[2]);g.addColorStop(1,P[3]);
    c.fillStyle=g;c.fillRect(0,0,w,h/2+2);
    if(P[4]){const sun=c.createRadialGradient(w*.62,h*.18,0,w*.62,h*.18,h*.35);sun.addColorStop(0,'rgba(255,255,245,1)');sun.addColorStop(.06,'rgba(255,250,225,.95)');sun.addColorStop(.3,'rgba(255,240,200,.25)');sun.addColorStop(1,'rgba(255,240,200,0)');c.fillStyle=sun;c.fillRect(0,0,w,h/2);}
    for(let i=0;i<P[5];i++){const x=Math.random()*w,y=h*rand(.12,.46),s=rand(50,190);
      for(let k=0;k<7;k++){const cx=x+rand(-s,s),cy=y+rand(-s*.15,s*.15),r=s*rand(.3,.7);const cg=c.createRadialGradient(cx,cy,0,cx,cy,r);
        const v=kind==='storm'?'90,98,108':kind==='overcast'?'200,205,212':'255,255,255';cg.addColorStop(0,`rgba(${v},${P[6]})`);cg.addColorStop(1,`rgba(${v},0)`);c.fillStyle=cg;c.beginPath();c.ellipse(cx,cy,r,r*.45,0,0,7);c.fill();}}
    if(kind==='night'){for(let i=0;i<700;i++){c.fillStyle=`rgba(255,255,255,${rand(.2,.9)})`;c.fillRect(Math.random()*w,Math.random()*h*.45,rand(1,2.4),rand(1,2.4));}
      const glow=c.createLinearGradient(0,h*.4,0,h/2);glow.addColorStop(0,'rgba(255,170,90,0)');glow.addColorStop(1,'rgba(255,170,90,.35)');c.fillStyle=glow;c.fillRect(0,h*.4,w,h*.1);}
    c.fillStyle=kind==='night'?'#0c1420':'#5b6f63';for(let x=0;x<w;x+=6){const hh=rand(6,22);c.fillRect(x,h/2-hh,7,hh);}
    c.fillStyle=kind==='night'?'#141c28':'#8a96a3';for(let i=0;i<14;i++){const x=Math.random()*w,bw=rand(40,140),bh=rand(10,40);c.fillRect(x,h/2-bh,bw,bh);
      if(kind==='night'){c.fillStyle='rgba(255,214,140,.7)';for(let k=0;k<20;k++)c.fillRect(x+Math.random()*bw,h/2-Math.random()*bh,2,2);c.fillStyle='#141c28';}}
    const gg=c.createLinearGradient(0,h/2,0,h);gg.addColorStop(0,kind==='night'?'#1a1d22':'#6a6d71');gg.addColorStop(.3,'#3d3f43');gg.addColorStop(1,'#202124');c.fillStyle=gg;c.fillRect(0,h/2,w,h/2);
  });
  t.mapping=THREE.EquirectangularReflectionMapping;return t;
}
const WX={id:'dry',drops:null,flood:[],lastFlash:0};
function applyWeather(id){
  const w=WEATHER[id]||WEATHER.dry;WX.id=id;
  if(WX.sky)WX.sky.dispose();if(WX.env)WX.env.dispose();
  WX.sky=makeSkyWx(w.sky);scene.background=WX.sky;
  const pm=new THREE.PMREMGenerator(renderer);WX.env=pm.fromEquirectangular(WX.sky).texture;scene.environment=WX.env;pm.dispose();
  scene.fog.color.setHex(w.fogC);scene.fog.near=w.fog[0];scene.fog.far=w.fog[1];
  W.sun.intensity=w.sun;W.sun.color.setHex(id==='hot'?0xffe2b8:id==='night'?0x9fb4ff:0xfff1dc);W.hemi.intensity=w.hemi;
  W.groundMat.roughness=w.wet?.2:.9;W.groundMat.envMapIntensity=w.wet?1.25:.4;W.groundMat.color.setHex(w.wet?0x6d7075:0xffffff);W.groundMat.needsUpdate=true;
  WX.flood.forEach(l=>l.intensity=w.night?1.6:0);if(W.floodMeshes)W.floodMeshes.material.color.setHex(w.night?0xfff6dd:0x3a3d42);
  renderer.toneMappingExposure=w.night?1.25:id==='rain'?1.15:1.12;
  if(WX.drops)WX.drops.visible=!!w.rain;
  Snd.rain(!!w.rain||!!w.wet,w.rain?1:.35);
}
function buildWeatherFx(){
  // gotas de chuva à volta da câmara
  const N=1100,pos=new Float32Array(N*6);WX.dropData=new Float32Array(N*3);
  for(let i=0;i<N;i++){WX.dropData[i*3]=rand(-9,9);WX.dropData[i*3+1]=rand(0,9);WX.dropData[i*3+2]=rand(-9,9);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  WX.drops=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xc8d4e0,transparent:true,opacity:.45,fog:false}));WX.drops.frustumCulled=false;WX.drops.visible=false;scene.add(WX.drops);
  // holofotes da corrida noturna
  [[-6,9,-4],[7,9,3],[0,9,6]].forEach(([x,y,z])=>{const l=new THREE.PointLight(0xfff3dc,0,28,1.6);l.position.set(x,y,z);scene.add(l);WX.flood.push(l);});
}
function updateWeather(dt,t){
  const w=WEATHER[WX.id];if(!w)return;
  if(w.rain&&WX.drops){
    const inGarage=Cam.pos.z<-7&&Math.abs(Cam.pos.x)<4;WX.drops.visible=!inGarage;
    const p=WX.drops.geometry.attributes.position.array,d=WX.dropData,c=camera.position;
    for(let i=0;i<d.length/3;i++){d[i*3+1]-=dt*16;if(d[i*3+1]<-1.8){d[i*3+1]=rand(6,9);d[i*3]=rand(-9,9);d[i*3+2]=rand(-9,9);}
      const x=c.x+d[i*3],y=c.y+d[i*3+1],z=c.z+d[i*3+2];p[i*6]=x;p[i*6+1]=Math.max(0,y);p[i*6+2]=z;p[i*6+3]=x+.03;p[i*6+4]=Math.max(0,y-.45);p[i*6+5]=z;}
    WX.drops.geometry.attributes.position.needsUpdate=true;
    if(t-WX.lastFlash>rand(9,16)&&Math.random()<.02){WX.lastFlash=t;const h0=W.hemi.intensity;W.hemi.intensity=2.4;setTimeout(()=>W.hemi.intensity=h0,90);setTimeout(()=>Snd.thunder(),rand(400,1400));}
  }
  Snd.rainLevel(Cam.pos.z<-7?.35:1);
}
