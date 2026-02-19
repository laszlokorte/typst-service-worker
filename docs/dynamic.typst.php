#set text(font: "PT Sans")
#show heading: set text(rgb(200,0,100))
#show link: underline

#image("/favicon.svg", width: 1cm)

= Hello Typst from <?php echo $_SERVER['SERVER_NAME'] ?>!

This PDF file is generated via #link("https://typst.app/")[typst] inside the Service Worker of the browser.
The typst file is requested from the server. The server has generated the typst file via php <?php echo phpversion(); ?>


#link("http://laszlokorte.de")[Laszlo Korte]

== Table

#table(columns: 5,
  stroke: none,
table.header(
    [*A Table*], [*with*], [*multiple*], [*columns*], [*and rows*],
    table.hline()
),..range(5 * 5).map(n => numbering("A", n + 1)))


== Math

#text(size: 20pt)[
$ #text[DFT] X(omega) = sum_(n=-infinity)^infinity x(n) dot e^(-j pi omega n) $
]


You can also write inline math $X(z) = sum_(n=-infinity)^infinity x(n) dot z^(-n)$

== Images

#lorem(30)

#image("/foo.jpg", width: 7cm)
