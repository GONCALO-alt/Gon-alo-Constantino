'use strict';
/* KARTING PRO · navegação: 5 separadores (hash #inicio … #estatisticas), perfil e páginas empilhadas */
(function(g){
const KP=g.KP,ui=KP.ui;
const TABS=[['inicio','Início','home'],['cronometro','Cronómetro','timer'],['treino','Treino','train'],['diario','Diário','diary'],['estatisticas','Estatísticas','stats']];
const app=KP.app={views:{},cur:null,stack:[]};
app.view=(name,def)=>{app.views[name]=def;};
app.go=(name)=>{
  if(!app.views[name])name='inicio';
  while(app.stack.length)app.pop(true);
  const prev=app.views[app.cur];if(prev&&prev.leave)prev.leave();
  app.cur=name;
  if(location.hash!=='#'+name){try{history.replaceState(null,'','#'+name);}catch(e){location.hash=name;}}
  KP.$$('.nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===name?'page':'false'));
  app.render();KP.store.emit('view',name);
};
app.render=()=>{const main=KP.$('main');main.removeAttribute('style');main.innerHTML='';main.scrollTop=0;app.views[app.cur].render(main);app.updateNav();};
app.refresh=()=>{const top=app.stack[app.stack.length-1];if(top)top.redraw();else{const m=KP.$('main'),y=m.scrollTop;m.innerHTML='';app.views[app.cur].render(m);m.scrollTop=y;app.updateNav();}};
/* página por cima da vista atual (detalhe de sessão, comparação, exercício) */
app.push=(title,render,{full=false,onClose}={})=>{
  const el=document.createElement('section');el.className='page';
  el.innerHTML=`${full?'':`<header class="page-h"><button class="back" aria-label="Voltar">‹</button><h2></h2></header>`}<div class="page-b" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;${full?'':'gap:14px;padding-block:14px 28px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))'}"></div>`;
  if(!full)el.querySelector('h2').textContent=title;
  KP.$('#app').appendChild(el);
  const body=el.querySelector('.page-b');
  const page={el,body,onClose,redraw:()=>{const y=body.scrollTop;body.innerHTML='';render(body,page);body.scrollTop=y;},setTitle:t=>{const h=el.querySelector('h2');if(h)h.textContent=t;}};
  app.stack.push(page);
  if(!full)el.querySelector('.back').onclick=()=>app.pop();
  render(body,page);return page;
};
app.pop=(silent)=>{const p=app.stack.pop();if(!p)return;p.el.remove();p.onClose&&p.onClose();if(!silent&&!app.stack.length){const m=KP.$('main'),y=m.scrollTop;m.innerHTML='';app.views[app.cur].render(m);m.scrollTop=y;app.updateNav();}};
app.updateNav=()=>{const live=!!KP.store.live();const b=KP.$('.nav [data-tab="cronometro"]');if(b)b.classList.toggle('live',live);
  const tb=KP.$('#topAvatar');if(tb)tb.innerHTML=ui.avatar(KP.store.profile());};
app.focus=on=>document.body.classList.toggle('focus',!!on);
app.mount=()=>{
  KP.$('#nav').innerHTML=TABS.map(([id,label,ic])=>`<button data-tab="${id}" aria-current="false">${ui.icon[ic]}<span>${label}</span></button>`).join('');
  KP.$$('#nav button').forEach(b=>b.onclick=()=>app.go(b.dataset.tab));
  KP.$('#topAvatar').onclick=()=>app.go('perfil');
  g.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h&&h!==app.cur)app.go(h);});
  let rt=0;g.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!document.body.classList.contains('focus'))app.refresh();},200);});
};
})(window);
