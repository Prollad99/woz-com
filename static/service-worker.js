const CACHE_NAME = 'static-cache-v2';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/css/main.css',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
        // Add other assets that need to be cached here
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );

  return self.clients.claim(); // Take control of uncontrolled clients immediately
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request).then(function(fetchResponse) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});