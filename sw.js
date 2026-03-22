// AniFold Service Worker - Cache Buster v4
// This SW clears ALL old caches immediately

const CACHE_NAME = 'anifold-cache-v4';

self.addEventListener('install', function(event) {
  // Take control immediately without waiting
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    // Delete ALL caches (including any old Firebase cached responses)
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      // Take control of all open pages immediately
      return self.clients.claim();
    }).then(function() {
      // Notify all clients to reload
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ type: 'SW_UPDATED' });
      });
    })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  
  // NEVER cache HTML pages - always fetch fresh from network
  if (event.request.mode === 'navigate' || 
      url.endsWith('.html') || 
      url.endsWith('/') ||
      url === 'https://anifold.shop/' ||
      url === 'https://anifold.shop/#') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(function() {
        return new Response('Offline', { status: 503 });
      })
    );
    return;
  }
  
  // NEVER cache Firebase requests
  if (url.includes('firebaseio.com') || 
      url.includes('firebase') || 
      url.includes('googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For everything else: network first, no persistent caching
  event.respondWith(fetch(event.request).catch(function() {
    return caches.match(event.request);
  }));
});

// Handle reload message
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
