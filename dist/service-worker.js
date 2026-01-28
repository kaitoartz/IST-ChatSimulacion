// IST-ChatSimulacion Service Worker
// Enables offline support with intelligent caching strategy

const CACHE_VERSION = 'ist-chat-v1';
const CACHE_ASSETS = 'ist-chat-assets-v1';
const CACHE_DATA = 'ist-chat-data-v1';

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/dist/script.js',
  '/dist/style.css',
  '/dist/assets/sounds/sent.mp3',
  '/dist/assets/sounds/received.mp3',
  '/dist/assets/sounds/call.mp3',
  '/dist/assets/sounds/notification.wav',
  '/dist/assets/sounds/nico_audio.ogg',
  '/dist/assets/hand.jpg',
  '/dist/assets/nico.jpg',
  '/dist/assets/logo.png',
  '/dist/assets/blur.jpg',
  '/dist/assets/sticker.png',
  '/dist/assets/doc_icon.png',
  '/dist/assets/sticker-ok.webp',
  '/dist/assets/sticker-gg.webp'
];

// Install event - cache essential assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_ASSETS)
      .then(cache => {
        console.log('[SW] Caching essential assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => console.warn('[SW] Install error:', err))
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_ASSETS && cacheName !== CACHE_DATA) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external URLs except CDNs
  if (url.origin !== location.origin) {
    // Only cache allowed CDN resources
    if (url.origin.includes('cdn.') || url.origin.includes('esm.sh') || url.origin.includes('pixabay.com')) {
      event.respondWith(
        caches.match(request)
          .then(response => response || fetch(request).then(res => {
            if (res && res.status === 200) {
              const responseToCache = res.clone();
              caches.open(CACHE_DATA).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            return res;
          }))
          .catch(() => new Response('Offline - external resource unavailable', { status: 503 }))
      );
    }
    return;
  }

  // Strategy for JSON data files (network first, then cache)
  if (url.pathname.includes('.json')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_DATA).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Strategy for static assets (cache first, then network)
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_ASSETS).then(cache => {
            cache.put(request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // Return offline page or cached response
        return caches.match(request) || 
               new Response('Offline - resource not available', { status: 503 });
      })
  );
});

// Background sync (optional - for future features)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-results') {
    event.waitUntil(syncResults());
  }
});

const syncResults = async () => {
  try {
    const cache = await caches.open(CACHE_DATA);
    // Implement sync logic here if needed
    console.log('[SW] Background sync completed');
  } catch (err) {
    console.warn('[SW] Sync error:', err);
  }
};

console.log('[SW] Service Worker loaded');
