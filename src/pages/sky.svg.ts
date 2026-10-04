import type { APIRoute } from "astro";
import stars from "../data/stars.json";
import milkyWay from "../data/milkyway.json";
import { UP } from "../lib/sky";

// The southern sky as seen from the ground: an azimuthal equidistant
// projection centred on the south celestial pole, one unit per degree.

/** Northernmost declination in the data, in degrees */
const LIMIT = 40;

/** Upper magnitude bound, dot diameter in px and opacity of each brightness class */
const CLASSES = [
  [1, 4.5, 1],
  [2, 3.4, 0.95],
  [3, 2.6, 0.85],
  [4, 1.9, 0.7],
  [5, 1.4, 0.55],
  [6, 1, 0.4],
] as const;

/** Upper B-V bound and colour, from hot blue-white stars to cool golden ones.
    The third value is a more saturated version for wide-gamut screens */
const COLORS = [
  [0.3, "#cfdcff", "color(display-p3 0.76 0.85 1)"],
  [1, "#fff6e0", "color(display-p3 1 0.96 0.86)"],
  [Infinity, "#ffcf87", "color(display-p3 1 0.79 0.46)"],
] as const;

const radius = 90 + LIMIT;

const project = (ra: number, dec: number) => {
  const r = 90 + dec;
  const angle = ((ra - UP) * Math.PI) / 180;
  // East is to the left when facing the pole
  return [-r * Math.sin(angle), -r * Math.cos(angle)];
};

const dots = new Map<string, string[]>();
for (const [ra, dec, mag, bv] of stars as [
  number,
  number,
  number,
  number | null,
][]) {
  const [x, y] = project(ra, dec).map((n) => n.toFixed(1));
  const size = CLASSES.findIndex(([limit]) => mag <= limit);
  const color = COLORS.findIndex(([limit]) => (bv ?? 0.65) <= limit);
  const key = `${size} ${color}`;
  dots.set(key, [...(dots.get(key) ?? []), `M${x} ${y}h.01`]);
}

const paths = [...dots].flatMap(([key, d]) => {
  const [size, color] = key.split(" ").map(Number);
  const [, width, opacity] = CLASSES[size];
  const path = (w: number, o: number) =>
    `<path class="c${color}" stroke-width="${w}" stroke-opacity="${o}" d="${d.join("")}"/>`;
  // The brightest stars also get a faint halo
  return size < 2
    ? [path(width * 3.2, 0.12), path(width, opacity)]
    : [path(width, opacity)];
});

// The brightness levels are nested, so their fills add up towards the core
const glow = (milkyWay as [number, number][][][]).map((rings) => {
  const d = rings.map(
    (ring) =>
      `M${ring.map(([ra, dec]) => project(ra, dec).map(Math.round).join(" ")).join("L")}Z`,
  );
  return `<path d="${d.join("")}"/>`;
});

// A faint chart grid: declination every 30°, right ascension every two hours
const parallels = [-60, -30, 0, 30].map(
  (dec) =>
    `<circle r="${90 + dec}"${dec === 0 ? ' stroke-opacity=".085"' : ""}/>`,
);
const meridians = Array.from({ length: 12 }, (_, hour) => {
  const [from, to] = [-80, LIMIT].map((dec) =>
    project(hour * 30, dec)
      .map(Math.round)
      .join(" "),
  );
  return `M${from}L${to}`;
});

// The ecliptic, the Sun's yearly path, tilted against the equator
const TILT = (23.4393 * Math.PI) / 180;
const ecliptic = Array.from({ length: 72 }, (_, i) => {
  const lon = (i * 5 * Math.PI) / 180;
  const dec = Math.asin(Math.sin(TILT) * Math.sin(lon));
  const ra = Math.atan2(Math.cos(TILT) * Math.sin(lon), Math.cos(lon));
  return project((ra * 180) / Math.PI, (dec * 180) / Math.PI)
    .map((n) => n.toFixed(1))
    .join(" ");
});

const grid = `<g fill="none" stroke="#9db4ff" stroke-opacity=".05">${parallels.join("")}<path d="${meridians.join("")}"/><path stroke-dasharray="3 6" stroke-opacity=".13" d="M${ecliptic.join("L")}Z"/></g>`;

const tints =
  COLORS.map(([, srgb], i) => `.c${i}{stroke:${srgb}}`).join("") +
  `@media (color-gamut:p3){${COLORS.map(([, , p3], i) => `.c${i}{stroke:${p3}}`).join("")}}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-radius} ${-radius} ${radius * 2} ${radius * 2}"><style>path,circle{vector-effect:non-scaling-stroke}${tints}</style><filter id="b"><feGaussianBlur stdDeviation="1.6"/></filter><g fill="#cdd6f2" fill-opacity=".05" fill-rule="evenodd" filter="url(#b)">${glow.join("")}</g>${grid}<g fill="none" stroke-linecap="round">${paths.join("")}</g></svg>`;

export const GET: APIRoute = () =>
  new Response(svg, {
    // The dev server would otherwise let browsers keep an old copy
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
