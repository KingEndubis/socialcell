// Simple PWA service worker for offline cache and fast reload
const CACHE_NAME = 'sm-ai-agent-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.webmanifest',
  './build/icon.svg',
  './build/brand.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k === CACHE_NAME ? null : caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Network-first for same-origin HTML; cache-first for static assets
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return resp;
      }).catch(() => caches.match(request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return resp;
      })
    )
  );
});