<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Typst in Service worker</title>
  <script>
  navigator.serviceWorker.register('/worker.js', {
    scope: '/',
    type: "module"
  }).then(() => {
    document.body.appendChild(document.createTextNode("Worker registered"))
  });
  </script>
</head>
<body>
 <h1>Hello  Typst</h1>

 <p>

     <a href="dynamic.pdf" target="_blank">Open PDF</a>

 </p>

 <p>

     <img src="dynamic.svg" alt="SVG rendered via typst in ServiceWorker" />
 </p>
</body>

</html>
