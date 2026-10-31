/*
 * Service worker da DutchPath: guarda a aplicação e todas as lições no telemóvel,
 * para funcionar sem internet. Gerado por tools/build-sw.ts (a lista de ficheiros
 * PRECACHE e a VERSION são inseridas no topo durante o build).
 */
/* global PRECACHE, VERSION */
const PREFIX = 'dutchpath-';
const CACHE = PREFIX + VERSION;
const HASHES = 'sw-hashes.json';
const url = (path) => new URL(path, self.registration.scope).href;

async function broadcast(msg) {
  const all = await self.clients.matchAll({ includeUncontrolled: true });
  for (const c of all) c.postMessage(msg);
}

/** Hashes guardados por uma versão anterior: ficheiros iguais copiam-se sem os descarregar outra vez. */
async function previousCaches() {
  const names = (await caches.keys()).filter((n) => n.startsWith(PREFIX) && n !== CACHE);
  const out = [];
  for (const name of names) {
    const cache = await caches.open(name);
    const res = await cache.match(url(HASHES));
    if (res) out.push({ cache, hashes: await res.json().catch(() => ({})) });
  }
  return out;
}

async function precache() {
  const cache = await caches.open(CACHE);
  const old = await previousCaches();
  // Se uma instalação anterior foi interrompida, os ficheiros já guardados não se repetem.
  const doneRes = await cache.match(url(HASHES));
  const done = doneRes ? await doneRes.json().catch(() => ({})) : {};
  const total = PRECACHE.length;
  let count = 0;
  let lastSent = 0;
  const queue = [...PRECACHE];
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const [path, hash] = item;
      const key = url(path);
      if (done[path] !== hash) {
        let res;
        for (const o of old) {
          if (o.hashes[path] === hash) { res = await o.cache.match(key); if (res) break; }
        }
        if (!res) {
          res = await fetch(key, { cache: 'no-cache' });
          if (!res.ok) throw new Error(`${path}: ${res.status}`);
        }
        await cache.put(key, res);
      }
      count++;
      if (count - lastSent >= 10 || count === total) {
        lastSent = count;
        broadcast({ type: 'dutchpath-offline', state: 'saving', done: count, total });
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  await cache.put(url(HASHES), new Response(JSON.stringify(Object.fromEntries(PRECACHE)), { headers: { 'Content-Type': 'application/json' } }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
    await broadcast({ type: 'dutchpath-offline', state: 'ready', version: VERSION });
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'dutchpath-status') return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const ready = !!(await cache.match(url(HASHES)));
    event.source?.postMessage({ type: 'dutchpath-offline', state: ready ? 'ready' : 'saving', version: VERSION });
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (req.mode === 'navigate') {
      // A página abre sempre, com ou sem internet.
      return (await cache.match(url('index.html'))) ?? fetch(req);
    }
    const hit = await cache.match(req, { ignoreSearch: true, ignoreVary: true });
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (e) {
      return (await caches.match(req, { ignoreSearch: true, ignoreVary: true })) ?? Response.error();
    }
  })());
});
