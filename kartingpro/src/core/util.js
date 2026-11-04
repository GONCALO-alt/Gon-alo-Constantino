'use strict';
/* KARTING PRO · utilitários partilhados (formatação de tempos, datas, estatística) */
(function(g){
const KP=g.KP=g.KP||{};
const doc=g.document;
KP.$=(s,r=doc)=>r.querySelector(s);
KP.$$=(s,r=doc)=>[...r.querySelectorAll(s)];
KP.esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
KP.uid=()=>(g.crypto&&g.crypto.randomUUID)?g.crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2,10);
KP.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* Fonte de tempo: alta resolução e monótona dentro da página, expressa em ms desde 1970
   para poder ser guardada e retomada depois de fechar/reabrir a app. */
KP.clock=()=>(g.performance&&g.performance.timeOrigin?g.performance.timeOrigin+g.performance.now():Date.now());
/* hora exata de um toque (event.timeStamp) na mesma escala de KP.clock */
KP.eventClock=e=>{
  const ts=e&&e.timeStamp;
  if(!ts||!g.performance||!g.performance.timeOrigin)return KP.clock();
  return ts>1e12?ts:g.performance.timeOrigin+ts;
};

/* 62345 -> "1:02.345"; 9876 -> "9.876"; dec=1 -> décimas (truncado, como num painel de cronometragem) */
KP.fmtTime=(ms,{dec=3,sign=false}={})=>{
  if(ms==null||!isFinite(ms))return '—';
  const neg=ms<0;let t=Math.floor(Math.abs(ms));
  const m=Math.floor(t/60000);t-=m*60000;const s=Math.floor(t/1000);const f=t-s*1000;
  const frac=dec===3?String(f).padStart(3,'0'):dec===2?String(Math.floor(f/10)).padStart(2,'0'):String(Math.floor(f/100));
  const body=(m?m+':'+String(s).padStart(2,'0'):String(s))+(dec>0?'.'+frac:'');
  return (neg?'−':sign?'+':'')+body;
};
KP.fmtDelta=ms=>ms==null||!isFinite(ms)?'—':(ms<0?'−':'+')+KP.fmtTime(Math.abs(ms));
KP.fmtDur=ms=>{if(!isFinite(ms))return '—';const s=Math.round(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;return h?`${h} h ${m} min`:m?`${m} min ${String(r).padStart(2,'0')} s`:`${r} s`;};
KP.fmtMs=ms=>ms==null||!isFinite(ms)?'—':Math.round(ms)+' ms';
KP.fmtPct=v=>v==null||!isFinite(v)?'—':Math.round(v*100)+'%';
KP.fmtInt=n=>(n??0).toLocaleString('pt-PT');
/* "1:02.345" | "62.345" | "62,345" -> ms (null se inválido) */
KP.parseTime=str=>{
  if(str==null)return null;const s=String(str).trim().replace(',','.');if(!s)return null;
  const m=s.match(/^(?:(\d+):)?(\d{1,2}(?:\.\d{1,3})?)$/)||s.match(/^()(\d+(?:\.\d{1,3})?)$/);
  if(!m)return null;const mins=m[1]?+m[1]:0,secs=parseFloat(m[2]);if(!isFinite(secs))return null;
  return Math.round((mins*60+secs)*1000);
};

/* datas (sempre locais) */
KP.dayKey=(d=new Date())=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
KP.fromKey=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d);};
KP.fmtDate=(d,opt={day:'numeric',month:'short',year:'numeric'})=>new Date(d).toLocaleDateString('pt-PT',opt);
KP.fmtDateLong=d=>new Date(d).toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
KP.fmtHour=d=>new Date(d).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'});
KP.daysAgo=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d.getTime();};
KP.relDay=d=>{const a=KP.fromKey(KP.dayKey(d)).getTime(),b=KP.fromKey(KP.dayKey()).getTime();const n=Math.round((b-a)/864e5);
  return n===0?'Hoje':n===1?'Ontem':n<7?`Há ${n} dias`:KP.fmtDate(d);};

/* estatística */
KP.mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
KP.std=a=>{if(a.length<2)return null;const m=KP.mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1));};
KP.median=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),k=s.length>>1;return s.length%2?s[k]:(s[k-1]+s[k])/2;};
KP.min=a=>a.length?Math.min(...a):null;

/* gerador pseudo-aleatório com semente (desafios diários iguais durante o dia) */
KP.seeded=str=>{let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
  return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296;};};
KP.shuffle=(a,rnd=Math.random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
KP.pick=(a,rnd=Math.random)=>a[Math.floor(rnd()*a.length)];
KP.vibrate=p=>{try{if(KP.store&&KP.store.settings().haptics&&g.navigator.vibrate)g.navigator.vibrate(p);}catch(e){}};
KP.inFrame=(()=>{try{return g.self!==g.top;}catch(e){return true;}})();
})(typeof window!=='undefined'?window:globalThis);
