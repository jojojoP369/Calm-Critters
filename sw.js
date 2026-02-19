const CACHE_NAME = 'calm-critters-v5';
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

// Fetch — network-first for HTML (so code changes apply immediately), cache-first for assets
self.addEventListener('fetch', (event) => {
    // For navigation/HTML requests: always try network first
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                return caches.match(event.request) || caches.match('/Calm-Critters/index.html');
            })
        );
        return;
    }

    // For other assets: cache-first, fallback to network
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).then((response) => {
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
