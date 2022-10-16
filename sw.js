const cacheName = "notification-v1.1.0--bootstrap-icons-v1.8.1";

self.addEventListener("install", (ev) => {
    const cacheFiles = [
        "./",
        "./index.html",
        "./scripts/index.js",
        "./scripts/bootstrap-icons/icons.js",
        "./scripts/bootstrap-icons/search.js",
        "./styles/index.css",
        "./favicon.ico",
        "./icons/favicon-vector.svg",
        "./icons/favicon-512.png",
        "./icons/favicon-192.png",
    ];
    ev.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            await cache.addAll(cacheFiles);
        })()
    );
});

self.addEventListener("fetch", (ev) => {
    ev.respondWith(
        (async () => {
            const resource = await caches.match(ev.request);
            if (resource) return resource;

            const response = await fetch(ev.request);
            const cache = await caches.open(cacheName);
            cache.put(ev.request, response.clone());
            return response;
        })()
    );
});

self.addEventListener("activate", (ev) => {
    ev.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key === cacheName) return;
                    return caches.delete(key);
                })
            );
        })
    );
});

self.addEventListener("notificationclick", (ev) => {
    ev.notification.close();
    let editUrl = `./?title=${encodeURIComponent(
        ev.notification.title
    )}&body=${encodeURIComponent(ev.notification.body)}`;
    if (ev.notification.icon) {
        const iconURL = ev.notification.icon;
        const iconName = iconURL.split("/").pop().slice(0, -4);
        editUrl += `&icon=${encodeURIComponent(iconName)}`;
    }
    self.clients.openWindow(editUrl);
});
