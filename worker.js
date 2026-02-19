import {
  TypstSnippet,
  FetchAccessModel,
  createTypstSvgRenderer,
} from "./typst-all.js";

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

let cachedTypes = null;

async function getTypst() {
  if (cachedTypes) {
    return cachedTypes;
  }
  const all = await Promise.all([
    fetch("/assets.txt").then(async (r) => {
      const text = await r.text();
      const files = text.split("\n").filter((f) => f.length);
      return Promise.all(
        files.map(async (f_1) => {
          const r_1 = await fetch(f_1);
          const d = await r_1.arrayBuffer();
          return { file: f_1, data: d };
        }),
      );
    }),
    fetch("/fonts.txt").then(async (fs) => {
      const fonts = (await fs.text()).split("\n").filter((f_2) => f_2);

      const fetchBackend = new FetchAccessModel("/");
      TypstSnippet.ccOptions = {
        getModule: () => "./typst_ts_web_compiler_bg.wasm",
      };
      const typeInstance = new TypstSnippet({
        compiler: TypstSnippet.buildLocalCompiler,
        renderer: TypstSnippet.buildLocalRenderer,
      });

      typeInstance.use({
        key: "access-model",
        forRoles: ["compiler"],
        provides: [
          (A, I) => {
            return new Promise((C) => {
              (I.builder.set_access_model(
                fetchBackend,
                async (Q) => {
                  const E = await fetchBackend.getMTime(Q);
                  return E ? E.getTime() : 0;
                },
                (Q_1) => fetchBackend.isFile(Q_1) || !1,
                (Q_2) => fetchBackend.getRealPath(Q_2) || Q_2,
                async (Q_3) => await fetchBackend.readAll(Q_3),
              ),
                C());
            });
          },
        ],
      });
      typeInstance.setCompilerInitOptions({
        getModule: () => "./typst_ts_web_compiler_bg.wasm",
        beforeBuild: [preloadRemoteFonts(fonts.map((f_3) => `./fonts/${f_3}`))],
      });
      typeInstance.setRendererInitOptions({
        getModule: () => "./typst_ts_renderer_bg.wasm",
      });
      return typeInstance;
    }),
  ]);
  const [assets, typstInstance] = all;
  for (let a of assets) {
    await typstInstance.mapShadow(a.file, new Uint8Array(a.data));
  }
  cachedTypes = typstInstance;
  return typstInstance;
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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

          return (await getTypst()).pdf({ mainContent: t }).then((pdfData) => {
            return new Response(pdfData, {
              headers: { "Content-Type": "application/pdf" },
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

          return (await getTypst())
            .canvas({ mainContent: t })
            .then((pdfData) => {
              return new Response(pdfData, {
                headers: { "Content-Type": "image/png" },
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

          return (await getTypst()).svg({ mainContent: t }).then((pdfData) => {
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
