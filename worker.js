import { $typst, TypstSnippet, FetchAccessModel } from "./typst-all.js";

self.addEventListener("install", (event) => {
  self.skipWaiting(); // optional
});

self.addEventListener("activate", (event) => {
  $typst.setCompilerInitOptions({
    getModule: () => "./typst_ts_web_compiler_bg.wasm",
  });
  $typst.setRendererInitOptions({
    getModule: () => "./typst_ts_renderer_bg.wasm",
  });

  event.waitUntil(
    fetch("/assets.txt").then(async (r) => {
      const text = await r.text();
      const files = text.split("\n").filter((f) => f.length);
      console.log(files);
      return Promise.all(
        files.map(async (f) => {
          const r = await fetch(f);
          r.arrayBuffer().then((b) => {
            $typst.mapShadow(f, new Uint8Array(b));
          });
        }),
      );
    }),
  );

  // const fetchBackend = new FetchAccessModel(import.meta.url);
  // $typst.use(TypstSnippet.withAccessModel(fetchBackend));

  console.log("Initialized");
  self.clients.claim(); // optional
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  const url = new URL(event.request.url);
  console.log(url.pathname);
  if (url.pathname.endsWith("/dynamic")) {
    console.log("dyn");
    const body = JSON.stringify({ time: Date.now(), foo: "bar" });
    event.respondWith(
      new Response(body, {
        headers: { "Content-Type": "application/json" },
      }),
    );
  } else if (url.pathname.endsWith(".pdf")) {
    console.log("typst");
    const newUrl = new URL(
      url.pathname.replace(/\.pdf$/, ".typst"),
      url.origin,
    );
    event.respondWith(
      fetch(
        new Request(newUrl, {
          method: event.request.method,
          headers: event.request.headers,
          body:
            event.request.method !== "GET" && event.request.method !== "HEAD"
              ? event.request.body
              : undefined,
          redirect: "follow",
          credentials: "same-origin",
        }),
      )
        .then(async (r) => {
          if (!r.ok) {
            return r;
          }
          const t = await r.text();

          return $typst
            .pdf({ mainContent: t })
            .then((pdfData) => {
              return new Response(pdfData, {
                headers: { "Content-Type": "application/pdf" },
              });
            })
            .catch((e) => {
              return new Response("Typst Error: " + e.toString(), {
                headers: { "Content-Type": "text/plain" },
              });
            });
        })
        .catch((e) => {
          console.error("Foo", e);
          return fetch(event.request.clone());
        }),
    );
  } else if (url.pathname.endsWith(".png")) {
    console.log("typst");
    const newUrl = new URL(url.pathname.replace(/\.png/, ".typst"), url.origin);
    event.respondWith(
      fetch(
        new Request(newUrl, {
          method: event.request.method,
          headers: event.request.headers,
          body:
            event.request.method !== "GET" && event.request.method !== "HEAD"
              ? event.request.body
              : undefined,
          redirect: "follow",
          credentials: "same-origin",
        }),
      )
        .then(async (r) => {
          if (!r.ok) {
            return r;
          }
          const t = await r.text();

          return $typst
            .canvas({ mainContent: t })
            .then((pdfData) => {
              return new Response(pdfData, {
                headers: { "Content-Type": "image/png" },
              });
            })
            .catch((e) => {
              return new Response("Typst Error: " + e.toString(), {
                headers: { "Content-Type": "text/plain" },
              });
            });
        })
        .catch((e) => {
          console.error("Foo", e);
          return fetch(event.request.clone());
        }),
    );
  } else if (url.pathname.endsWith(".svg")) {
    console.log("typst");
    const newUrl = new URL(url.pathname.replace(/\.svg/, ".typst"), url.origin);
    event.respondWith(
      fetch(
        new Request(newUrl, {
          method: event.request.method,
          headers: event.request.headers,
          body:
            event.request.method !== "GET" && event.request.method !== "HEAD"
              ? event.request.body
              : undefined,
          redirect: "follow",
          credentials: "same-origin",
        }),
      )
        .then(async (r) => {
          if (!r.ok) {
            return r;
          }
          const t = await r.text();

          return $typst
            .svg({ mainContent: t })
            .then((pdfData) => {
              return new Response(pdfData, {
                headers: { "Content-Type": "image/svg+xml" },
              });
            })
            .catch((e) => {
              return new Response("Typst Error: " + e.toString(), {
                headers: { "Content-Type": "text/plain" },
              });
            });
        })
        .catch((e) => {
          console.error("Foo", e);
          return fetch(event.request.clone());
        }),
    );
  } else {
    event.respondWith(fetch(event.request.clone()));
  }
});
