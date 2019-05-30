
const preCachedList = [
    "/", "offline.json", "mission.html", "resources.html", "tours.html",
    "app.js", "weather.js",
    "_css/fonts.css", "_css/main.css", "_css/mobile.css", "_css/tablet.css",
    "_images/back_bug.gif", "_images/desert_desc_bug.gif", "_images/nature_desc_bug.gif",
    "_images/backpack_bug.gif", "_images/flag.jpg", "_images/snow_desc_bug.gif",
    "_images/calm_bug.gif", "_images/home_page_back.jpg", "_images/springs_desc_bug.gif",
    "_images/calm_desc_bug.gif", "_images/kids_desc_bug.gif", "_images/star_bullet.gif",
    "_images/cycle_desc_bug.gif", "_images/logo.gif", "_images/taste_bug.gif",
    "_images/cycle_logo.png", "_images/looking.jpg", "_images/taste_desc_bug.gif",
    "_images/desert_bug.gif", "_images/mission_look.jpg", "_images/tour_badge.png"
]
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open("california-assets-v2")
            .then(cache => {
                cache.addAll(preCachedList);
            })
    );
});

self.addEventListener("message", event => {
    const message = event.data;
    switch (message.action) {
        case "update-resources":
            caches.open("california-assets-v2")
                .then(cache => {
                    cache.addAll(preCachedList)
                        .then(() => {
                            alertPagesUpdate();
                        });
                })
            break;
    }
});

function alertPagesUpdate() {
    clients.matchAll({
        includeUncontrolled: false,
        type: "window"

    }).then(clients => {
        clients.forEach(client => {
            client.postMessage({
                action: "resources-updated"
            })
        })
    })
}

self.addEventListener("activate", event => {
    const cacheWhiteList = ["california-assets-v2", "california-fonts"];
    event.waitUntil(
        caches.keys()
            .then(names => {
                Promise.all(
                    names.map(cacheName => {
                        if (cacheWhiteList.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                )

            })


    )
})
self.addEventListener("fetch", event => {

    const requestURL = new URL(event.request.url);
    if (requestURL.host == "explorecalifornia.org" && !navigator.onLine) {
        event.respondWith(fetch("offline.json"))

    }
    else if (requestURL.pathname.match(/^\/_css*/)) {
        //Network first policy for the css
        //     event.respondWith(
        //         fetch(event.request)
        //             .catch(error => {
        //                 return caches.match(event.request);
        //             })
        //     )


        //Stale while revalidate

        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    const fetchRequest =
                        fetch(event.request)
                            .then(networkResponse => {
                                return caches.open("california-assets-v2")
                                    .then(cache => {
                                        cache.put(event.request, networkResponse.clone())
                                        return networkResponse;
                                    })

                            })
                    return response || fetchRequest;
                })
        )


    }

    else {
        //Cache first policy
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    else {
                        //Loading fonts from fetch and then caching for subsequent requests
                        if (requestURL.pathname.match(/^\/_fonts*/)) {
                            const fetchRequest =
                                fetch(event.request)
                                    .then(networkResponse => {
                                        return caches.open("california-fonts")
                                            .then(cache => {
                                                cache.put(event.request, networkResponse.clone());
                                                return networkResponse;
                                            })

                                    })

                            return fetchRequest;
                        }
                        else {
                            return fetch(event.request);
                        }
                    }
                })
        )
    }
})
