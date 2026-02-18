const CACHE_NAME = 'calm-critters-v1';
const ASSETS = [
    '/Calm-Critters/',
    '/Calm-Critters/index.html',
    '/Calm-Critters/manifest.json',
    '/Calm-Critters/icons/icon-192.svg',
    '/Calm-Critters/icons/icon-512.svg',
];

// Install — cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).then((response) => {
                // Cache successful responses for future offline use
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                // If offline and not cached, return the main page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/Calm-Critters/index.html');
                }
            });
        })
    );
});
