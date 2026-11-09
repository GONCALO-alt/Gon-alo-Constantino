/* KART MENTAL PRO — service worker: guarda a app no dispositivo para funcionar sem internet. */
const VERSION = 'kmp-1e0eae393a';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'js/core.js',
  'js/icons.js',
  'js/data.js',
  'js/circuits.js',
  'js/exercises/e01-reflexos.js',
  'js/exercises/e02-schulte.js',
  'js/exercises/e03-periferica.js',
  'js/exercises/e04-cores.js',
  'js/exercises/e05-partida.js',
  'js/exercises/e06-seguimento.js',
  'js/exercises/e07-calculo.js',
  'js/exercises/e08-stroop.js',
  'js/exercises/e09-diferencas.js',
  'js/exercises/e10-numeros.js',
  'js/exercises/e11-circuitos.js',
  'js/exercises/e12-visualizacao.js',
  'js/program.js',
  'js/runner.js',
  'js/views.js',
  'js/app.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primeiro a cache (rápido e sem internet); atualiza em segundo plano.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res && res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => hit || caches.match('index.html'));
      return hit || net;
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((list) => {
      if (list.length) return list[0].focus();
      return self.clients.openWindow('./');
    })
  );
});
