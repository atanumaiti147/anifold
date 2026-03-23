// AniFold Service Worker - Cache Buster v4 + OneSignal Push
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'anifold-cache-v4';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      return self.clients.claim();
    }).then(function() {
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

  // NEVER cache HTML pages
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

// Handle messages from page
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Tab se notification (jab tab open ho)
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title || 'Anifold Store', {
      body: event.data.body || '',
      icon: event.data.icon || 'https://res.cloudinary.com/di1mnrg0l/image/upload/v1774128852/Picsart-26-01-02-20-57-17-409_kzckpu.png',
      tag: 'anifold-tab',
      data: { url: event.data.url || 'https://anifold.shop' }
    });
  }
});

// Notification tap → store open
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) ? event.notification.data.url : 'https://anifold.shop';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes('anifold.shop') && 'focus' in list[i]) {
          list[i].navigate(url);
          return list[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
