// framepilot service worker — makes the app installable + gives it an offline shell.
// Deliberately CONSERVATIVE so it can never strand a live user on stale content:
//   · navigations  → NETWORK-FIRST (always fresh online; cached shell only offline)
//   · _next/static + icons (immutable, hashed) → cache-first + revalidate
//   · Convex / /api / cross-origin (realtime, must not cache) → untouched (network)
// skipWaiting + clients.claim so a new build activates on next load, and the app's
// "Muat ulang versi" (forceFreshReload) can always unregister + purge as the escape hatch.
const CACHE = "fp-shell-v1";
const SHELL = "/";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add(SHELL))
      .catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  // only same-origin; Convex realtime, /api, and any cross-origin go straight to network
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;

  // page navigations: network-first, fall back to the cached shell when offline
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          return (await caches.match(SHELL)) || Response.error();
        }
      })()
    );
    return;
  }

  // immutable build assets + icons: serve cached instantly, refresh in the background
  if (url.pathname.startsWith("/_next/static") || /\.(png|svg|webp|woff2?|ico|css|js)$/.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        const network = fetch(req)
          .then((res) => {
            // clone SYNCHRONOUSLY — caches.open() is async, so cloning inside its
            // .then() runs after res is already returned + its body consumed → throws
            // "Response body is already used". Clone now, stash the copy later.
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })()
    );
  }
});
