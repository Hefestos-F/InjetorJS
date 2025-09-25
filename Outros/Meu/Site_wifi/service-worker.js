// Cache leve para funcionar offline o básico.
// Ajuste lista CORE conforme necessidade.
const CACHE = 'exaustor-v1';
const CORE = [
  '/',
  '/offline.html',
  '/manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Página principal: network-first
  if (url.pathname === '/' || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(() =>
        caches.match(req).then(r => r || caches.match('/offline.html'))
      )
    );
    return;
  }

  // Estáticos: cache-first
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(r => {
        const copy = r.clone();
        const type = r.headers.get('content-type') || '';
        const okToCache = r.ok && (type.includes('text/') || type.includes('application/') || type.includes('image/'));
        if (okToCache) caches.open(CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(() => caches.match('/offline.html'));
    })
  );
});
