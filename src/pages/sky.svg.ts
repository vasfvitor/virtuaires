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

/** Upper B-V bound and colour, from hot blue-white stars to cool golden ones */
const COLORS = [
  [0.3, "#cfdcff"],
  [1, "#fff6e0"],
  [Infinity, "#ffcf87"],
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
    `<path stroke="${COLORS[color][1]}" stroke-width="${w}" stroke-opacity="${o}" d="${d.join("")}"/>`;
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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-radius} ${-radius} ${radius * 2} ${radius * 2}"><style>path{vector-effect:non-scaling-stroke}</style><filter id="b"><feGaussianBlur stdDeviation="1.6"/></filter><g fill="#cdd6f2" fill-opacity=".05" fill-rule="evenodd" filter="url(#b)">${glow.join("")}</g><g fill="none" stroke-linecap="round">${paths.join("")}</g></svg>`;

export const GET: APIRoute = () =>
  new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
