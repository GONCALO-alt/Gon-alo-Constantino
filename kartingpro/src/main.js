'use strict';
/* KARTING PRO · arranque */
(function(g){
const KP=g.KP,S=KP.store,ui=KP.ui;
S.init();KP.initProgress();KP.today();
KP.app.mount();
/* avisos de XP, desafios e subida de nível */
S.on((type,p)=>{
  if(type==='xp'&&p.amount)ui.toast(`+${p.amount} XP · ${p.reason}`,'xp');
  if(type==='levelup')setTimeout(()=>ui.toast(`Subiste para ${p.name}!`,'xp'),400);
  if(type==='challenge-all')setTimeout(()=>ui.toast('Desafios de hoje completos','xp'),300);
});
/* sessão do cronómetro em curso: retomar diretamente no cronómetro */
const live=S.live();KP.timer.resume();
const h=location.hash.slice(1);
KP.app.go(live?'cronometro':(KP.app.views[h]?h:'inicio'));
if(live)setTimeout(()=>ui.toast('Sessão em curso recuperada: o tempo continuou a contar'),300);
if(!S.ok())setTimeout(()=>ui.toast('Atenção: este browser não deixa guardar dados'),600);
/* app instalável e a funcionar sem rede (quando servida por http/https, fora de molduras) */
if('serviceWorker' in navigator&&!KP.inFrame&&/^https?:$/.test(location.protocol)){
  g.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
})(window);
