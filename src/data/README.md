`stars.json` holds every star down to magnitude 6 south of declination +40°, as
`[right ascension°, declination°, magnitude, B-V colour index]`, brightest first.

`milkyway.json` holds the outlines of the Milky Way at five brightness levels,
faintest first, as rings of `[right ascension°, declination°]` thinned to about
one point per degree.

Taken from the Hipparcos-based `stars.6.json` and from `mw.json` of
[d3-celestial](https://github.com/ofrohn/d3-celestial) (BSD 3-Clause, © Olaf Frohn).
