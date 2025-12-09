// Gear Base Service Worker - Offline Support
const CACHE_NAME = 'gearbase-v1';
const STATIC_CACHE = 'gearbase-static-v1';
const DYNAMIC_CACHE = 'gearbase-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/logo.png',
  '/manifest.json'
];

// API routes that should use network-first strategy
const API_ROUTES = [
  'supabase.co',
  '/rest/v1/',
  '/auth/v1/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Check if request is for an API
function isApiRequest(url) {
  return API_ROUTES.some(route => url.includes(route));
}

// Helper: Check if request is for a static asset
function isStaticAsset(url) {
  return url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);
}

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests: Network first, fall back to cache
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: Cache first, fall back to network
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML/other: Stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Strategy: Network first (for API calls)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline fallback for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/');
    }
    throw error;
  }
}

// Strategy: Cache first (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Cache and network failed:', request.url);
    throw error;
  }
}

// Strategy: Stale while revalidate
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, cached response will be used
  });

  return cachedResponse || fetchPromise;
}

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data === 'clearCache') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  // This will be triggered when connectivity is restored
  // The actual sync logic is in the main app using Dexie
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_REQUIRED' });
  });
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'Gear Base', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
