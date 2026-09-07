const CACHE = "mystroparyaj-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./firebase-config.js",
  "./manifest.json"
];


self.addEventListener(
  "install",
  event => {

    event.waitUntil(
      caches
        .open(CACHE)
        .then(cache =>
          cache.addAll(ASSETS)
        )
    );
  }
);


self.addEventListener(
  "activate",
  event => {

    event.waitUntil(
      caches
        .keys()
        .then(keys =>
          Promise.all(
            keys
              .filter(
                key =>
                  key !== CACHE
              )
              .map(
                key =>
                  caches.delete(key)
              )
          )
        )
    );
  }
);


self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !== "GET"
    ) {
      return;
    }

    const url =
      new URL(event.request.url);

    /*
      Pa cache API MystroParyaj,
      Firebase oswa lòt sèvè ekstèn.
    */
    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    event.respondWith(
      fetch(event.request)

        .then(response => {

          const copy =
            response.clone();

          caches
            .open(CACHE)
            .then(cache => {
              cache.put(
                event.request,
                copy
              );
            });

          return response;
        })

        .catch(() =>
          caches.match(
            event.request
          )
        )
    );
  }
);
