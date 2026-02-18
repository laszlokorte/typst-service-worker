<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Typst in Service worker</title>
</head>
<body>
 <h1>Typst via Service Worker</h1>

 <span id="workerStatus"></span>

 <h2>Rendered as PDF</h2>
 <p>
     The PDF file linked below is compiled via Service worker and then served to you.
 </p>
 <p>
     <a href="docs/dynamic.pdf" target="_blank">Open PDF</a>
 </p>

 <h2>Rendered as SVG</h2>
 <p>Below you should see the document as SVG graphic generated and served the the Service Worker<p>
 <figure>
     <a href="docs/dynamic.svg" target="_blank">
     <img onerror="navigator.serviceWorker && setTimeout(window.location.reload.bind(window.location), 1000)" src="docs/dynamic.svg" alt="SVG rendered via typst in ServiceWorker" />
     </a>
 </figure>
 <script>
 navigator.serviceWorker.register('/worker.js', {
   scope: '/',
   type: "module",updateViaCache: "none",
 }).then((s) => {
   s.update()
   console.log(s)
   window.workerStatus.appendChild(document.createTextNode("Worker registered"))
 }).catch((e) => {
   window.workerStatus.appendChild(document.createTextNode(e))
 });
 </script>
</body>

</html>
