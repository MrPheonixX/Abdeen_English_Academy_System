/*
 * Lightweight offline support for the static GitHub Pages build.
 * App data itself is saved in localStorage/IndexedDB by the client code.
 * Never cache API/auth calls or cross-origin requests.
 */
const CACHE_NAME = "abdeen-english-academy-v1";
const APP_ROOT = new URL("./", self.location.href).href;
const CORE_URLS = [
  APP_ROOT,
  new URL("manifest.webmanifest", self.location.href).href,
  new URL("favicon.svg", self.location.href).href,
  new URL("__grok/icon-180.png", self.location.href).href,
  new URL("__grok/icon-192.png", self.location.href).href,
  new URL("__grok/icon-512.png", self.location.href).href,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        CORE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
          } catch {
            // A failed optional cache entry must not prevent installation.
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("abdeen-english-academy-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const scopePath = new URL(self.registration.scope).pathname;
  if (url.origin !== self.location.origin || !url.pathname.startsWith(scopePath)) return;
  if (url.pathname.includes("/api/") || url.pathname.endsWith("/sw.js")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(APP_ROOT, response.clone());
          }
          return response;
        } catch {
          return (await caches.match(APP_ROOT)) || Response.error();
        }
      })(),
    );
    return;
  }

  if (!["script", "style", "image", "font"].includes(request.destination)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      const refresh = fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            void cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || (await refresh) || Response.error();
    })(),
  );
});
