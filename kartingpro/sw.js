/* KARTING PRO · funcionamento sem rede: guarda a app no telemóvel depois da primeira visita */
const CACHE='kartingpro-v1';
const FILES=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon.svg',
  'src/styles.css','src/core/util.js','src/core/store.js','src/core/progress.js','src/features/stopwatch.js','src/features/gps.js',
  'src/ui/components.js','src/ui/app.js','src/views/home.js','src/views/sessions.js','src/views/timer.js','src/views/training.js',
  'src/views/diary.js','src/views/stats.js','src/views/profile.js','src/main.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // tipos de letra: guardados na primeira utilização
  if(url.host.includes('fonts.g')){e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(r=>r||fetch(req).then(res=>{c.put(req,res.clone());return res;}))));return;}
  if(url.origin!==location.origin)return;
  // app: rede primeiro (para receber atualizações), cópia local se não houver rede
  e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res;}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
});
