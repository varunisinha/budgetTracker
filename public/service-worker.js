
const DATA_CACHE_NAME = "data-cache-v1";

const CACHE_NAME = "static-cache-v2";

//creating an array to store the files that have to be cached:

const FILES_TO_CACHE = [

    "/",

    "/styles.css",

    "/manifest.webmanifest",

    "/index.html",

    "/index.js",

    //adding given image files

    "/icons/icon-512x512.png",

    "/icons/icon-192x192.png"


];




//installing and registering service worker and loading cache here

self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                console.log("Files cached");

                return cache.addAll(FILES_TO_CACHE);
            })
    );
    self.skipWaiting();
})

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys()

            .then(keyList => {

                return Promise.all(

                    keyList.map(key => {

                        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {

                            console.log("old cache data deleted", key);

                            return caches.delete(key);
                        }
                    })
                );
            })
    );

    self.clients.claim();

});

//Handling API calls and store in cache
//using fetch function

self.addEventListener("fetch", (event) => {
    //if request url includes api
    if (event.request.url.includes("/api/transaction")) {

        console.log("[Service Worker] Fetch (data)", event.request.url);

        event.respondWith(

            caches.open(DATA_CACHE_NAME).then(cache => {

                return fetch(event.request)

                    .then(response => {

                        //checking for successful response output

                        if (response.status === 200) {

                            cache.put(event.request.url, response.clone());

                        }
                        return response;
                    })
                    .catch(err => {

                        return cache.match(event.request);
                    });
            })
        );
        return;
    }
    event.respondWith(

        caches.open(CACHE_NAME).then(cache => {

            return cache.match(evt.request).then(response => {

                return response || fetch(evt.request);
            });
        })
    );
});