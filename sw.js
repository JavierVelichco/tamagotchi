self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("feedme-v2").then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./iching.js",
        "./manifest.json",
        "./feedme.png"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
