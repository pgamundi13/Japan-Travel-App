var CACHE = "japan-trip-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Cache-first for app shell, network-first fallback for everything else (e.g. Google Fonts)
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req)
        .then(function (res) {
          if (res && res.status === 200 && res.type === "basic") {
            var resClone = res.clone();
            caches.open(CACHE).then(function (cache) { cache.put(req, resClone); });
          }
          return res;
        })
        .catch(function () {
          if (req.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});
