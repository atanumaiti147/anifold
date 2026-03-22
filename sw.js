// AniFold SW v3 - Minimal, no HTML caching
const CACHE = 'anifold-v3';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

// NO caching for HTML - always fetch fresh
self.addEventListener('fetch', e => {
  if(e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request));
    return;
  }
});
