# Experiment for rendering Typst in ServiceWorker

Run local web server:

```sh
php -S localhost:9999 -t .
```

open [http://localhost:9999](http://localhost:9999) in the Browser to setup the Service Worker.
Then click on the link to open the PDF file.

The Service Worker detects the file name ending with `.pdf`, replace the file extension with `.typst` and fetches the typst file from the server. Then the Service worker compiles the typst source to to PDF on the client side and serves the resulting PDF as HTTP response back to the browser.

For using typst from Js [typst.ts](https://github.com/Myriad-Dreamin/typst.ts) is used.

Currently typst.ts does not seem to support async file loading. The Service Workers fetches the `assets.txt` file on startup and preloads all files listed there to make them available as resources for the typst document. It would be nice if typst could load these files lazily.
Originally `typst.ts` usese `XMLHttpRequest` in blocking mode for lazy asset loading but `XMLHttpRequest` is not supported inside Service Worker.
