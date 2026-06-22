self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('feedme-v2').then(cache => cache.addAll([
      './',
      './index.html',
      './style.css',
      './app.js',
      './iching.js',
      './feedme.png',
      './manifest.json'
    ]))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
