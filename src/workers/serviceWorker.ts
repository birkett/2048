const CACHE_NAME = '2048_cache';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(
                [
                    '/css/main.css',
                    '/js/application.js',
                    '/js/Direction.js',
                    '/js/GameConfig.js',
                    '/js/GameManager.js',
                    '/js/GameState.js',
                    '/js/Grid.js',
                    '/js/HtmlActuator.js',
                    '/js/KeyboardInputManager.js',
                    '/js/LocalStorageManager.js',
                    '/js/Position2d.js',
                    '/js/Tile.js',
                    '/android-chrome-192x192.png',
                    '/android-chrome-512x512.png',
                    '/favicon.ico',
                    '/index.html',
                    '/site.webmanifest'
                ]
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
