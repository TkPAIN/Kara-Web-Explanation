const CACHE_NAME = 'kara-tech-v1';
const urlsToCache = [
  '/karatech-web/',
  '/karatech-web/index.html',
  '/karatech-web/about.html',
  '/karatech-web/services.html',
  '/karatech-web/blog.html',
  '/karatech-web/contact.html',
  '/karatech-web/privacy.html',
  '/karatech-web/cookies.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
