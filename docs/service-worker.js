const CACHE_NAME = 'bevbrain-static-v1';
const OFFLINE_CACHE = 'bevbrain-articles-v1';
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './news-fetcher.js',
  './ai-chat.js',
  './assets/logo.svg'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME && k !== OFFLINE_CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Network-first for API, cache-first for static assets
self.addEventListener('fetch', (evt) => {
  const req = evt.request;
  const url = new URL(req.url);

  // Handle API article requests with network-first strategy
  if (url.pathname.includes('/api/articles') || url.pathname.endsWith('/data/articles.json')) {
    evt.respondWith((async () => {
      try {
        const networkResp = await fetch(req);
        const cloned = networkResp.clone();
        const cache = await caches.open(OFFLINE_CACHE);
        cache.put(req, cloned);
        return networkResp;
      } catch (e) {
        const cache = await caches.open(OFFLINE_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      }
    })());
    return;
  }

  // For other requests, try cache first, then network
  evt.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(networkResp => {
      return caches.open(CACHE_NAME).then(cache => {
        try { cache.put(req, networkResp.clone()); } catch (e) { /* ignore opaque */ }
        return networkResp;
      });
    }).catch(() => cached))
  );
});
