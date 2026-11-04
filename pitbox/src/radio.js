'use strict';
/* Pit Box · Rádio: vozes e mensagens */
/* ---------------- RÁDIO ---------------- */
/* voz do engenheiro: procura uma voz masculina em português; se não houver, baixa o tom */
let engVoice=null,engMale=false;
const MALE_RX=/daniel|felipe|duarte|cristiano|ricardo|tiago|jorge|ant[oó]nio|jo[aã]o|paulo|pedro|miguel|\brui\b|male\b|masculin|homem|jmn|pmj|ptd|ptm/i;
const FEMALE_RX=/joana|catarina|h[eé]lia|luciana|maria|francisca|female|feminin|mulher|fernanda|raquel|in[eê]s|sfs|jfb|am[aá]lia|beatriz|\bsara\b|\bana\b|vit[oó]ria|let[ií]cia|camila/i;
function allVoices(){try{return speechSynthesis.getVoices()||[];}catch(e){return[];}}
function voiceScore(v){let s=0;if(/^pt/i.test(v.lang))s+=20;if(/pt[-_]PT/i.test(v.lang))s+=4;if(MALE_RX.test(v.name))s+=12;if(FEMALE_RX.test(v.name))s-=8;if(v.localService)s+=1;return s;}
function loadVoices(){const vs=allVoices();if(!vs.length)return;
  engVoice=vs.find(v=>v.name===P.settings.voiceName)||vs.slice().sort((a,b)=>voiceScore(b)-voiceScore(a))[0]||null;
  engMale=!!engVoice&&MALE_RX.test(engVoice.name)&&!FEMALE_RX.test(engVoice.name);}
try{loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}catch(e){}
/* vozes por função: cada uma usa uma voz diferente do telemóvel quando existe, e um tom próprio */
const ROLES={engineer:{label:'ENGENHEIRO',pitch:0,rate:1.02,slot:0},chief:{label:'CHEFE DE EQUIPA',pitch:-.12,rate:.96,slot:1},
  strategist:{label:'ESTRATEGA',pitch:.06,rate:1.08,slot:2},mech:{label:'MECÂNICO',pitch:.05,rate:1.25,slot:3},driver:{label:'PILOTO',pitch:.14,rate:1.16,slot:2}};
const ROLE_ALIAS={'ENGENHEIRO':'engineer','ESTRATEGA':'strategist','CHEFE DE MECÂNICOS':'chief','CHEFE DE EQUIPA':'chief','PILOTO':'driver','MECÂNICO':'mech'};
function roleVoice(role){
  const vs=allVoices().filter(v=>/^pt/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a));
  if(role==='engineer'||!vs.length)return engVoice;
  const others=vs.filter(v=>!engVoice||v.name!==engVoice.name);
  return others.length?others[(ROLES[role].slot-1+others.length)%others.length]:engVoice;
}
function speak(text,urgent,role='engineer'){
  if(!P.settings.voice||!('speechSynthesis' in window))return;
  try{speechSynthesis.cancel();if(!engVoice)loadVoices();
    const R0=ROLES[role]||ROLES.engineer,v=roleVoice(role),male=v&&MALE_RX.test(v.name)&&!FEMALE_RX.test(v.name);
    const u=new SpeechSynthesisUtterance(text.replace(/[!]+/g,'!').replace(/…|\.\.\./g,', '));
    u.lang=v?v.lang:'pt-PT';if(v)u.voice=v;
    const base=(male?.82:.5)+R0.pitch;u.pitch=clamp(urgent?base+.1:base,.1,2);u.rate=urgent?R0.rate+.15:R0.rate;u.volume=1;speechSynthesis.speak(u);}catch(e){}
}
let radioTimer=0;
/* garble: falha de comunicação, parte da mensagem perde-se em estática */
function radio(text,who='engineer',urgent=false,garble=false){
  const role=ROLES[who]?who:(ROLE_ALIAS[who]||'engineer');
  let shown=text;
  if(garble){const w=text.split(' ');shown=w.map((x,i)=>i%3===1||i>w.length*.5&&i%2?'…kssh…':x).join(' ');Snd.stat(1.4,.16);}
  const el=$('#radio');$('#radioWho').textContent=ROLES[role].label;$('#radioText').textContent=shown;
  el.classList.remove('quiet');el.classList.add('live');el.dataset.role=role;
  Snd.beep();Snd.stat(.18,.1);if(role==='driver')Snd.pass(.05);
  clearTimeout(radioTimer);radioTimer=setTimeout(()=>{el.classList.remove('live');el.classList.add('quiet');Snd.stat(.12,.08);Snd.tone({f:1150,dur:.06,vol:.07});},Math.max(2200,text.length*70));
  speak(garble?shown.replace(/…kssh…/g,' '):text,urgent,role);
}
function voiceModal(){
  loadVoices();
  const vs=allVoices().filter(v=>/^pt/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a));
  modal(`<h3>Rádio do engenheiro</h3>
    <button class="chip" id="vOn" aria-pressed="${P.settings.voice}" style="align-self:flex-start">${P.settings.voice?'🔊 Voz ligada':'🔇 Voz desligada'}</button>
    <p>As vozes vêm do teu telemóvel. ♂ marca as que parecem masculinas. Se só houver vozes femininas, o jogo baixa o tom para soar mais grave.</p>
    <div class="vlist">${vs.length?vs.map((v,i)=>`<button class="vitem ${engVoice&&v.name===engVoice.name?'on':''}" data-v="${i}"><span>${MALE_RX.test(v.name)&&!FEMALE_RX.test(v.name)?'♂ ':''}${esc(v.name)}</span><small>${esc(v.lang)}</small></button>`).join(''):'<p class="empty">Este browser não tem vozes em português. Será usada a voz automática.</p>'}</div>
    <div class="m-row"><button class="btn small" id="vTest">Testar</button><button class="btn small primary" id="vOk">Fechar</button></div>`);
  $('#vOn').onclick=()=>{P.settings.voice=!P.settings.voice;save();renderMenu();voiceModal();};
  document.querySelectorAll('.vitem').forEach(b=>b.onclick=()=>{const v=vs[+b.dataset.v];P.settings.voiceName=v.name;save();loadVoices();Snd.click();voiceModal();speak('Rádio check. Box, box, box.',false);});
  $('#vTest').onclick=()=>{Snd.init();const was=P.settings.voice;P.settings.voice=true;speak('Rádio check. Pneus médios, box esta volta. Copiado?',false);P.settings.voice=was;};
  $('#vOk').onclick=closeModal;
}
const DRIVER_LINES=['Os traseiros estão a acabar, quanto tempo falta?','Tenho tráfego à frente, vou atacar na reta.','O carro sai de frente na curva lenta.','Confirma o plano, box quando?','Boa volta, os pneus ainda aguentam.'];
const CHATTER=[
  'Rádio check. Ritmo bom, voltas consistentes.','Degradação traseira a aumentar. O plano mantém-se.',
  'Diferença para o carro da frente: um vírgula quatro. Estamos a aproximar.','Bandeiras amarelas no setor dois. Atenção.',
  'Equipa, mantas ligadas. Pneus a temperatura.','Carro de trás a três segundos. Estamos a controlar.',
  'Volta mais rápida pessoal. Bom trabalho.','Combustível dentro do alvo. Gestão normal.',
  'Janela de paragem aberta. Fiquem atentos.','Undercut possível. Equipa, preparem-se para a chamada.'
];
