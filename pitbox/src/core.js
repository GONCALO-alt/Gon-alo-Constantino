'use strict';
/* Pit Box · Utilitários gerais */
/* =========================================================
   PIT BOX — simulador de mecânico de pit stop
   Estrutura: dados → perfil → áudio → rádio → mundo 3D → corrida/pit → ecrãs
   ========================================================= */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a,b)=>a+Math.random()*(b-a);
const randi=(a,b)=>Math.floor(rand(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const now=()=>performance.now()/1000;
const f2=s=>s.toFixed(2).replace('.',',');
const f1=s=>s.toFixed(1).replace('.',',');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hex=n=>'#'+n.toString(16).padStart(6,'0');
