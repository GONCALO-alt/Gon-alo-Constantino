'use strict';
/* KARTING PRO · GPS experimental: calibração da linha de meta e deteção de passagens.
   O GPS de um telemóvel tem tipicamente 3–10 m de erro e atualiza ~1 vez por segundo.
   A 60 km/h, 5 m são 0,3 s: serve para contar voltas, não para tempos oficiais. */
(function(g){
const KP=g.KP,S=()=>KP.store;
const R=6371000,rad=d=>d*Math.PI/180;
const dist=(a,b)=>{const dLa=rad(b.lat-a.lat),dLo=rad(b.lon-a.lon);const h=Math.sin(dLa/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h));};
const errText=e=>e&&e.code===1?'Sem autorização para usar a localização.':e&&e.code===3?'O GPS demorou demasiado a responder.':'A localização não está disponível neste ambiente. Instala a app no telemóvel (ver instruções) e tenta ao ar livre.';
const key=t=>(t||'').trim().toLowerCase();
KP.gps={
  supported:()=>!!(g.navigator&&g.navigator.geolocation),
  distance:dist,
  calibration:track=>track?S().raw().gps.tracks[key(track)]||null:null,
  remove(track){delete S().raw().gps.tracks[key(track)];S().save();},
  list:()=>Object.values(S().raw().gps.tracks),
  /* fica parado na linha de meta ~15 s: média pesada pela precisão de cada leitura */
  calibrate(track,{seconds=15,onSample,onDone,onError}={}){
    if(!KP.gps.supported()){onError&&onError(errText());return()=>{};}
    const samples=[];let id=null,tm=null;
    const stop=()=>{if(id!=null)g.navigator.geolocation.clearWatch(id);clearTimeout(tm);id=null;};
    try{id=g.navigator.geolocation.watchPosition(p=>{const c=p.coords;samples.push({lat:c.latitude,lon:c.longitude,acc:c.accuracy});onSample&&onSample(c.accuracy,samples.length);},
      e=>{stop();onError&&onError(errText(e));},{enableHighAccuracy:true,maximumAge:0,timeout:20000});}catch(e){onError&&onError(errText());return stop;}
    tm=setTimeout(()=>{stop();
      if(samples.length<3){onError&&onError('Poucas leituras de GPS. Tenta ao ar livre, com o céu à vista.');return;}
      let sw=0,la=0,lo=0;samples.forEach(s=>{const w=1/Math.max(1,s.acc)**2;sw+=w;la+=s.lat*w;lo+=s.lon*w;});
      const accs=samples.map(s=>s.acc).sort((a,b)=>a-b),med=accs[accs.length>>1];
      const cal={track:track.trim(),lat:la/sw,lon:lo/sw,acc:med,radius:Math.max(15,2*med),samples:samples.length,at:Date.now()};
      S().raw().gps.tracks[key(track)]=cal;S().save();onDone&&onDone(cal);},seconds*1000);
    return stop;
  },
  /* deteção: arma-se quando o kart se afasta da linha e marca a passagem no ponto mais próximo */
  detect(cal,{minLapMs=15000,onCross,onAccuracy,onError}={}){
    if(!KP.gps.supported()){onError&&onError(errText());return()=>{};}
    let armed=false,near=null,last=0,id=null;const far=Math.max(40,cal.radius*2.5);
    try{id=g.navigator.geolocation.watchPosition(p=>{
      const c=p.coords,d=dist(cal,{lat:c.latitude,lon:c.longitude});onAccuracy&&onAccuracy(c.accuracy);
      if(c.accuracy>cal.radius*2)return;               // leitura demasiado imprecisa: ignorada
      if(d>far){armed=true;near=null;return;}
      if(armed&&d<cal.radius){if(!near||d<=near.d)near={d,t:p.timestamp};else{fire(near.t);}}
      else if(armed&&near&&d>=cal.radius)fire(near.t);
    },e=>onError&&onError(errText(e)),{enableHighAccuracy:true,maximumAge:0,timeout:20000});}catch(e){onError&&onError(errText());}
    function fire(t){armed=false;const nt=near?near.t:t;near=null;if(last&&nt-last<minLapMs)return;last=nt;onCross&&onCross(nt);}
    return()=>{if(id!=null)g.navigator.geolocation.clearWatch(id);};
  }
};
})(window);
