/// <reference lib="webworker"/>
const CACHE_NAME = '2048_cache';
const VERSION_QUERY_STRING_REGEX = /\?v=(\w{0,7})/g; // ?v=...

class serviceWorker
{
    public static onInstall(event: ExtendableEvent): void {
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
                        '/serviceWorker.js',
                        '/site.webmanifest'
                    ]
                );
            })
        );
    }

    public static onFetch(event: FetchEvent): void {
        event.respondWith(
            fetch(event.request).catch(() => {
                const url = event.request.url.replace(VERSION_QUERY_STRING_REGEX, '');

                return <Promise<Response>>caches.match(url);
            })
        );
    }
}

self.addEventListener('install', <EventListenerOrEventListenerObject>serviceWorker.onInstall);
self.addEventListener('fetch', <EventListenerOrEventListenerObject>serviceWorker.onFetch);
