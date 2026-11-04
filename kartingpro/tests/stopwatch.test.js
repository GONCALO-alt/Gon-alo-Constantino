// Testes do motor do cronómetro: node kartingpro/tests/stopwatch.test.js
'use strict';
const assert=require('assert');
const {Stopwatch,lapStats}=require('../src/features/stopwatch.js');
let n=0;const t=(name,fn)=>{fn();n++;console.log('ok -',name);};

t('voltas medidas a partir dos instantes do toque',()=>{
  const s=new Stopwatch();s.start(1000);
  assert.deepStrictEqual(s.lap(1000+52345).ms,52345);
  assert.strictEqual(s.lap(1000+52345+51987).ms,51987);
  assert.strictEqual(s.laps.length,2);
  assert.strictEqual(s.currentLap(1000+52345+51987+1500),1500);
});
t('pausa não conta para a volta nem para o tempo total',()=>{
  const s=new Stopwatch();s.start(0);s.pause(10000);s.resume(40000);
  assert.strictEqual(s.lap(70000).ms,40000);
  assert.strictEqual(s.elapsed(70000),40000);
});
t('ecrã congelado não altera o tempo (só contam os instantes)',()=>{
  const s=new Stopwatch();s.start(500);
  // nenhuma atualização intermédia: o próximo toque chega 3 minutos depois
  assert.strictEqual(s.lap(500+180000).ms,180000);
});
t('toques duplos abaixo da volta mínima são ignorados',()=>{
  const s=new Stopwatch();s.start(0,{minLapMs:5000});s.lap(50000);
  const r=s.lap(50300);assert.ok(r.ignored);assert.strictEqual(s.laps.length,1);
  assert.strictEqual(s.lap(101000).ms,51000);
});
t('estado guardado e retomado continua a contar',()=>{
  const a=new Stopwatch();a.start(1000);a.lap(61000);
  const saved=JSON.parse(JSON.stringify(a.toJSON()));
  const b=new Stopwatch(saved);
  assert.strictEqual(b.lap(121500).ms,60500);
  assert.strictEqual(b.laps.length,2);
});
t('terminar ignora a volta incompleta e guarda a duração ativa',()=>{
  const s=new Stopwatch();s.start(0);s.lap(50000);s.pause(60000);s.resume(70000);
  const r=s.finish(80000);
  assert.strictEqual(r.laps.length,1);assert.strictEqual(r.durationMs,70000);
});
t('volta de saída não entra na melhor volta nem na média',()=>{
  const s=new Stopwatch();s.start(0,{outLap:true});s.lap(90000);s.lap(140000);s.lap(191000);
  const st=lapStats(s.laps);
  assert.strictEqual(st.best,50000);assert.strictEqual(st.n,2);assert.strictEqual(st.bestIndex,1);
});
t('estatísticas: média, desvio e voltas a 1% da melhor',()=>{
  const st=lapStats([{ms:50000},{ms:50400},{ms:51000},{ms:53000,valid:false}]);
  assert.strictEqual(st.best,50000);assert.strictEqual(Math.round(st.avg),50467);
  assert.strictEqual(st.within1,2/3);assert.strictEqual(st.n,3); // 51,000 está a mais de 1% de 50,000
});
console.log(`\n${n} testes passaram`);
