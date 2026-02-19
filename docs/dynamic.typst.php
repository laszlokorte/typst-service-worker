<?php header("Content-Type: text/plain") ?>
#set text(font: "PT Sans")
#show heading: set text(rgb(200,0,100))
#show link: underline

#grid(columns: 3, align: horizon, gutter: 2mm)[
#image("/favicon.svg", width: 5mm)
][#footnote[#link("http://laszlokorte.de")[Laszlo Korte]]][
= Hello Typst from php  <?php echo phpversion(); ?> on <?php echo $_SERVER['SERVER_NAME'] ?>!
]



This PDF file is generated via #link("https://typst.app/")[typst] inside the Service Worker of the browser.
The typst file is requested from the server. The server has generated the typst file via php <?php echo phpversion(); ?>



#link("<?php $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';
$full_url = $protocol."://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
echo $full_url; ?>")[You can read the raw typst source here]


== Table

#table(columns: 5,
  stroke: none,
table.header(
    [*A Table*], [*with*], [*multiple*], [*columns*], [*and rows*],
    table.hline()
),..range(5 * 4).map(n => numbering("A", n + 1)))

== Code

Source code in typst:

```elixir
[1, 2, 3, 4, 5]
    |> Enum.map(fn x -> x * 2 end)
    |> Enum.filter(fn x -> rem(x, 3) != 0 end)
    |> Enum.reduce(0, fn x, acc -> x + acc end)
```

== Math

#text(size: 16pt)[
$ #text[DFT] X(omega) = sum_(n=-infinity)^infinity x(n) dot e^(-j pi omega n) $
]


You can also write inline math $X(z) = sum_(n=-infinity)^infinity x(n) dot z^(-n)$

== Images

#lorem(50)

#image("/foo.jpg", width: 6cm)
