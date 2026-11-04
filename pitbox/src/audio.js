'use strict';
/* Pit Box · Áudio sintetizado (Web Audio) */
/* ---------------- ÁUDIO (sintetizado) ---------------- */
const Snd={
  ctx:null,on:P.settings.sound,
  init(){
    if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}
    try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    const c=this.ctx;
    this.master=c.createGain();this.master.gain.value=this.on?.9:0;
    const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;
    this.master.connect(comp);comp.connect(c.destination);
    const len=c.sampleRate*2,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.white=b;
    const bb=c.createBuffer(1,len,c.sampleRate),bd=bb.getChannelData(0);let l=0;
    for(let i=0;i<len;i++){l=(l+.02*(Math.random()*2-1))/1.02;bd[i]=l*3.5;}this.brown=bb;
  },
  ok(){return !!this.ctx;},
  t(){return this.ctx.currentTime;},
  setOn(v){this.on=v;if(this.master)this.master.gain.setTargetAtTime(v?.9:0,this.t(),.05);},
  noise({dur=.3,type='bandpass',f=1000,q=1,vol=.3,a=.005,delay=0,buf,loop=false,dest}={}){
    if(!this.ok())return null;const c=this.ctx,t=this.t()+delay;
    const s=c.createBufferSource();s.buffer=buf||this.white;s.loop=loop||dur>1.8;
    const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+a);
    s.connect(fl);fl.connect(g);g.connect(dest||this.master);s.start(t,Math.random()*1.5);
    if(!loop){g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.stop(t+dur+.05);}
    return {s,g,fl};
  },
  tone({f=440,type='sine',dur=.2,vol=.2,a=.004,slide=null,delay=0,dest}={}){
    if(!this.ok())return;const c=this.ctx,t=this.t()+delay;
    const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
    const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(dest||this.master);o.start(t);o.stop(t+dur+.05);
  },
  click(){this.tone({f:1800,type:'square',dur:.03,vol:.08});},
  ui(){this.tone({f:660,type:'triangle',dur:.06,vol:.12});this.tone({f:990,type:'triangle',dur:.08,vol:.1,delay:.05});},
  clank(f=520,vol=.25){[1,2.76,5.4,8.9].forEach((m,i)=>this.tone({f:f*m,type:'sine',dur:.35/(i+1)+.05,vol:vol/(i+1.2)}));this.noise({dur:.05,type:'highpass',f:3000,vol:vol*.6});},
  thud(vol=.5){this.tone({f:95,slide:38,type:'sine',dur:.28,vol});this.noise({dur:.18,type:'lowpass',f:400,vol:vol*.7});},
  hiss(dur=.45,vol=.25){this.noise({dur,type:'highpass',f:3500,vol});},
  error(){this.tone({f:150,type:'square',dur:.22,vol:.18});this.tone({f:110,type:'square',dur:.25,vol:.14,delay:.1});},
  good(){this.tone({f:880,dur:.12,vol:.15});this.tone({f:1320,dur:.2,vol:.13,delay:.08});},
  beep(){this.tone({f:1250,type:'sine',dur:.09,vol:.12});},
  stat(dur=.25,vol=.12){this.noise({dur,type:'bandpass',f:2200,q:.8,vol});},
  alarm(){for(let i=0;i<4;i++){this.tone({f:960,type:'square',dur:.16,vol:.13,delay:i*.36});this.tone({f:720,type:'square',dur:.16,vol:.13,delay:i*.36+.18});}},
  crowd(intensity=1,dur=3.5){
    if(!this.ok())return;const c=this.ctx,t=this.t();
    [[700,.6],[1400,.9],[2600,1.2]].forEach(([f,q],i)=>{
      const n=this.noise({type:'bandpass',f,q,vol:.0001,loop:true});if(!n)return;
      const v=.16*intensity/(i+1);n.g.gain.cancelScheduledValues(t);n.g.gain.setValueAtTime(.0001,t);
      n.g.gain.linearRampToValueAtTime(v,t+.5);n.g.gain.linearRampToValueAtTime(v*.8,t+dur*.6);n.g.gain.exponentialRampToValueAtTime(.0001,t+dur);n.s.stop(t+dur+.1);
    });
    for(let i=0;i<6*intensity;i++){const f=rand(1600,3000);this.tone({f,slide:f*rand(.7,1.3),type:'sine',dur:rand(.4,.9),vol:.03,delay:rand(.1,dur*.6)});}
  },
  /* motor contínuo (carro na box / a sair) */
  engine(){
    if(!this.ok())return null;const c=this.ctx;
    const g=c.createGain();g.gain.value=0;
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1100;lp.Q.value=3;
    const ws=c.createWaveShaper();const cu=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cu[i]=Math.tanh(x*3);}ws.curve=cu;
    const am=c.createGain();am.gain.value=1;
    const o1=c.createOscillator();o1.type='sawtooth';const o2=c.createOscillator();o2.type='sawtooth';o2.detune.value=14;
    const o3=c.createOscillator();o3.type='square';
    const lfo=c.createOscillator();lfo.type='square';lfo.frequency.value=13;const lg=c.createGain();lg.gain.value=0;
    lfo.connect(lg);lg.connect(am.gain);
    [o1,o2].forEach(o=>o.connect(ws));const o3g=c.createGain();o3g.gain.value=.5;o3.connect(o3g);o3g.connect(ws);
    ws.connect(lp);lp.connect(am);am.connect(g);g.connect(this.master);
    [o1,o2,o3,lfo].forEach(o=>o.start());
    const h={g,set:(f,vol,limiter=0,k=.08)=>{const t=this.t();o1.frequency.setTargetAtTime(f,t,k);o2.frequency.setTargetAtTime(f,t,k);o3.frequency.setTargetAtTime(f/2,t,k);
        lp.frequency.setTargetAtTime(600+f*4,t,k);g.gain.setTargetAtTime(vol,t,k);lg.gain.setTargetAtTime(limiter*.45,t,.02);},
      stop:()=>{const t=this.t();g.gain.setTargetAtTime(0,t,.2);setTimeout(()=>{[o1,o2,o3,lfo].forEach(o=>{try{o.stop()}catch(e){}});},1500);}};
    return h;
  },
  /* pistola pneumática */
  gunStart(tight=false){
    if(!this.ok()||this.gun)return;const c=this.ctx,t=this.t();
    const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.22,t+.02);
    const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(tight?240:200,t);o.frequency.linearRampToValueAtTime(tight?300:380,t+.6);
    const am=c.createGain();const lfo=c.createOscillator();lfo.type='square';lfo.frequency.value=42;const lg=c.createGain();lg.gain.value=.5;lfo.connect(lg);lg.connect(am.gain);
    const hp=c.createBiquadFilter();hp.type='bandpass';hp.frequency.value=900;hp.Q.value=.7;
    o.connect(hp);hp.connect(am);am.connect(g);g.connect(this.master);o.start();lfo.start();
    const n=this.noise({type:'highpass',f:2500,vol:.12,loop:true});
    this.gun={o,lfo,g,n};
  },
  gunStop(final=false){
    if(!this.gun)return;const t=this.t(),G=this.gun;this.gun=null;
    G.g.gain.setTargetAtTime(0,t,.015);if(G.n){G.n.g.gain.setTargetAtTime(0,t,.015);G.n.s.stop(t+.2);}
    G.o.stop(t+.2);G.lfo.stop(t+.2);if(final)this.clank(700,.3);
  },
  gunWrong(){this.tone({f:300,slide:140,type:'sawtooth',dur:.35,vol:.15});},
  distantGun(delay=0){if(!this.ok())return;for(let i=0;i<5;i++)this.tone({f:rand(260,320),type:'sawtooth',dur:.08,vol:.035,delay:delay+i*.07});},
  pass(vol=.05){if(!this.ok())return;const f=rand(260,340);this.tone({f,slide:f*.55,type:'sawtooth',dur:1.4,vol,a:.6});},
  ambience(on){
    if(!this.ok())return;
    if(on&&!this.amb){this.amb=this.noise({buf:this.brown,type:'lowpass',f:420,vol:.07,loop:true});
      this.ambTimer=setInterval(()=>{if(Math.random()<.5)this.clank(rand(300,900),.04);else this.noise({dur:.25,type:'highpass',f:3000,vol:.02});},2300);}
    if(!on&&this.amb){const t=this.t();this.amb.g.gain.setTargetAtTime(0,t,.3);this.amb.s.stop(t+1.5);this.amb=null;clearInterval(this.ambTimer);}
  }
};
