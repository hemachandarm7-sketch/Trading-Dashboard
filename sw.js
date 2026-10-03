// AGGRESSIVE CACHE BUSTING - Delete all caches on every update
const CACHE_BUST_ID = Math.random().toString(36).substr(2, 12);

self.addEventListener('install', (event) => {
  console.log('[SW] Installing - Cache Bust ID:', CACHE_BUST_ID);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating - Clearing ALL old caches');
  event.waitUntil(
    caches.keys().then((names) => {
      console.log('[SW] Found caches:', names);
      return Promise.all(
        names.map((name) => {
          console.log('[SW] ❌ Deleting:', name);
          return caches.delete(name);
        })
      );
    }).then(() => {
      console.log('[SW] ✅ All caches cleared');
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ 
          type: 'SW_CACHE_CLEARED',
          message: 'All caches deleted - refresh will fetch fresh content'
        });
      });
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Network-first strategy: try network, fall back to cache
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        // Only cache successful responses
        if (response.ok) {
          const clone = response.clone();
          // Don't actually cache - just return fresh response
          return response;
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache as last resort
        return caches.match(event.request)
          .then(response => response || new Response('Offline', { status: 503 }));
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
    console.log('[SW] Manual cache clear requested');
    caches.keys().then(names => {
      Promise.all(names.map(name => caches.delete(name)))
        .then(() => console.log('[SW] Manual cache clear complete'));
    });
  }
});
