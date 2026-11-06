/* Guarda os ficheiros do jogo para funcionar sem rede. */
const CACHE = 'sinuca-v1';
const FILES = ['./', 'index.html', 'css/style.css', 'manifest.webmanifest', 'icon.svg',
  'js/util.js', 'js/data.js', 'js/sprites.js', 'js/physics.js', 'js/rules.js', 'js/ai.js', 'js/progress.js',
  'js/audio.js', 'js/scenes.js', 'js/game.js', 'js/ui.js', 'js/modes.js', 'js/main.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return r; }).catch(() => caches.match(e.request)));
});
