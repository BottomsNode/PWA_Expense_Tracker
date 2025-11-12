const CACHE_NAME = "expense-tracker-v1.1";

const ASSETS = [
    "/",
    "/index.html",
    "/manifest.json",
    "/pwa-icon-192.png",
    "/app-icon.png",
];

self.addEventListener("install", (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                await cache.addAll(ASSETS);
            } catch (err) {
            }
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", (event) => {

    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const url = event.request.url;
    if (url.includes("localhost:") || url.includes("@vite") || url.includes("react-refresh")) {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                const networkResponse = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            } catch {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) return cachedResponse;
                if (event.request.mode === "navigate") {
                    return caches.match("/index.html");
                }

                return new Response("Offline", { status: 503, statusText: "Offline" });
            }
        })()
    );
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
