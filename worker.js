import { $typst, TypstSnippet, FetchAccessModel } from "./typst-all.js";

export function preloadRemoteFonts(userFonts, options) {
  const loader = async (_, { ref, builder }) => {
    if (options?.fetcher) {
      ref.setFetcher(options.fetcher);
    }
    await ref.loadFonts(builder, [...userFonts]);
  };
  loader._preloadRemoteFontOptions = options;
  loader._kind = "fontLoader";
  return loader;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      fetch("/assets.txt").then(async (r) => {
        const text = await r.text();
        const files = text.split("\n").filter((f) => f.length);
        return Promise.all(
          files.map(async (f) => {
            const r = await fetch(f);
            r.arrayBuffer().then((b) => {
              $typst.mapShadow(f, new Uint8Array(b));
            });
          }),
        );
      }),
      fetch("/fonts.txt").then(async (fs) => {
        const fonts = (await fs.text()).split("\n").filter((f) => f);

        $typst.setCompilerInitOptions({
          getModule: () => "./typst_ts_web_compiler_bg.wasm",
          beforeBuild: [preloadRemoteFonts(fonts.map((f) => `./fonts/${f}`))],
        });
        $typst.setRendererInitOptions({
          getModule: () => "./typst_ts_renderer_bg.wasm",
        });
      }),
    ]),
  );
  self.skipWaiting(); // optional
});

self.addEventListener("activate", (event) => {
  self.clients.claim(); // optional
  // const fetchBackend = new FetchAccessModel(import.meta.url);
  // $typst.use(TypstSnippet.withAccessModel(fetchBackend));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/dynamic")) {
    const body = JSON.stringify({ time: Date.now(), foo: "bar" });
    event.respondWith(
      new Response(body, {
        headers: { "Content-Type": "application/json" },
      }),
    );
  } else if (url.pathname.endsWith(".pdf")) {
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
              console.error(e);
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
              return new Response(
                pdfData.replace(
                  /<(script|style)([^>]*)>([\s\S]*?)<\/\1>/gi,
                  (_, tag, attrs, content) =>
                    `<${tag}${attrs}><![CDATA[${content
                      .replace(/document\.body/g, "document.rootElement")
                      .replace(/"span"/g, '"text"')
                      .replace(/addEventListener\("/g, (c) => c + "_")
                      .replace(
                        /createElement\(/g,
                        (c) => "createElementNS('http://www.w3.org/2000/svg',",
                      )
                      .replace(
                        'document.getElementsByTagName("head")[0]',
                        "document.rootElement",
                      )
                      .replace(/\&gt;/g, ">")
                      .replace(/\&lt;/g, "<")
                      .replace(/\&nbsp;/g, " ")
                      .split(";")
                      .join(";\n")}]]></${tag}>`,
                ),
                {
                  headers: { "Content-Type": "image/svg+xml" },
                },
              );
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

function splitIntoChunks(str, maxLength = 100) {
  return splitSmart(str).join("\n");
  const chunks = [];

  const regex = new RegExp(`.{1,${200}}(?:\\s+|$)`, "g");

  return str
    .match(regex)
    .map((s) => s.trim())
    .join("\n");
}

function splitSmart(str, maxLength = 100) {
  const regex = /[a-zA-Z0-9\:<>/\+\-"=\.!\?]+|[^a-zA-Z0-9\:<>/\+\-"=\.!\?]+/g;
  const parts = str.match(regex) || [];
  const lines = [];
  let line = "";

  for (const part of parts) {
    // if adding this part exceeds maxLength, push current line
    if (line && line.length + part.length > maxLength) {
      lines.push(line);
      line = "";
    }
    line += part;
  }

  if (line) lines.push(line);
  return lines;
}
