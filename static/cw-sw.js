/* eslint-disable no-undef */
/* eslint-disable semi */
/* eslint-disable quotes */

const CACHE_NAME = "cw-sw";
const CACHE_AUTH_ENDPOINT = "sw/auth";
const MANIFEST_ENDPOINT = "_nuxt/manifest";
const DEVICE_MANIFEST_ENDPOINT = "/device-manifest.json";

// see: https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
self.addEventListener("activate", (event) => {
  // eslint-disable-next-line no-undef
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const isManifest = request.url.match(MANIFEST_ENDPOINT);

  if (isManifest || request.url.match(DEVICE_MANIFEST_ENDPOINT)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        const endpoint = isManifest ? MANIFEST_ENDPOINT : DEVICE_MANIFEST_ENDPOINT
        return cache.match(endpoint)
          .then(response => response || fetch(event.request))
          .then(response => response && response.json && response.json())
          .then((response) => {
            if (request.url.includes('?')) {
              // For gym device manifest
              return createFetchResponse(Object.assign(response, {
                start_url: response.start_url.split('?')[0] + request.url.substr(request.url.indexOf('?'))
              }));
            } else {
              return cache.match(CACHE_AUTH_ENDPOINT)
                .then(authResponse => authResponse && authResponse.json && authResponse.json())
                .then((authResponse) => {
                  const queryString = authResponse && authResponse.token ? '?token=' + authResponse.token : ''
                  return createFetchResponse(Object.assign(response, {
                    start_url: response.start_url.split('?')[0] + queryString
                  }))
                });
            }
          })
          .then((response) => {
            response && cache.put(endpoint, response.clone());
            return response;
          })
      })
    );
  } else if (request.method === 'POST' && request.url.match(CACHE_AUTH_ENDPOINT)) {
    request.json().then((body) => {
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(CACHE_AUTH_ENDPOINT, createFetchResponse(body));
      });
    });
    return createFetchResponse({});
  } else {
    return event;
  }
});

function createFetchResponse (body) {
  return new Response(JSON.stringify(body));
}

// Handle CW web push notification
self.addEventListener("push", function (event) {
  if (!event.data) {
    return;
  }

  const payload = event.data.json()
  if (!payload || !payload.title || !payload.profileId) {
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.match(CACHE_AUTH_ENDPOINT))
      .then(response => response && response.json && response.json())
      .then((response) => {
        if (!response || !response.profileId || response.profileId !== payload.profileId) {
          return;
        }

        self.registration.showNotification(payload.title, {
          body: payload.body,
          data: {
            url: location.origin
          }
        });
      })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
