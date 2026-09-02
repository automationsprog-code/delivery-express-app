// Delivery Express Service Worker for PWA Installation & Asset Caching
const CACHE_NAME = 'delivery-express-v1.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle dynamic API/Supabase requests
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
