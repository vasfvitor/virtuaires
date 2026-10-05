// Small astronomy helpers shared by the build and the browser.

import { GROUND } from "../consts";

/** Longitude of the UTC-3 meridian, the one Brasília time is based on */
const LONGITUDE = -45;
/** Latitude of Brasília, where the horizon is reckoned from */
const LATITUDE = -15.8;
/** Right ascension drawn straight up from the pole in sky.svg: the Southern Cross */
export const UP = 187;

/** Northernmost declination in the star data, in degrees */
export const LIMIT = 40;
/** Degrees the sky turns in a day */
export const TURN = 360.98564736629;

/** A catalogue star: right ascension and declination in degrees, magnitude, B-V colour */
export type Star = [ra: number, dec: number, mag: number, bv: number | null];

/** Upper B-V bound and colour, from hot blue-white stars to cool golden ones.
    The third value is a more saturated version for wide-gamut screens */
export const COLORS = [
  [0.3, "#cfdcff", "color(display-p3 0.76 0.85 1)"],
  [1, "#fff6e0", "color(display-p3 1 0.96 0.86)"],
  [Infinity, "#ffcf87", "color(display-p3 1 0.79 0.46)"],
] as const;

/** Which of COLORS a star falls in; one without a measured colour counts as sunlike */
export const colorClass = (bv: number | null) =>
  COLORS.findIndex(([limit]) => (bv ?? 0.65) <= limit);

/** A number brought into 0 to `size`, as angles are into a full turn */
export const wrap = (n: number, size = 360) => ((n % size) + size) % size;

const julianDate = (date: Date) => date.getTime() / 86_400_000 + 2440587.5;

/** Local sidereal time in degrees: the right ascension on the meridian */
export const siderealTime = (date: Date) => {
  const greenwich = 280.46061837 + TURN * (julianDate(date) - 2451545);
  return wrap(greenwich + LONGITUDE);
};

/** How far to turn sky.svg clockwise so the stars on the meridian are straight up */
export const skyAngle = (date: Date) =>
  wrap(siderealTime(date) - UP).toFixed(2);

/** Mean age of the Moon as a fraction of the lunar month: 0 is new, 0.5 is full */
export const moonPhase = (date: Date) => {
  const lunations = (julianDate(date) - 2451550.1) / 29.530588853;
  return lunations - Math.floor(lunations);
};

/** Where the terminator crosses the disc's equator: 1 at new Moon, -1 at full */
const terminator = (phase: number) => Math.cos(2 * Math.PI * phase);

/** The lit share of the disc, 0 to 1 */
export const litShare = (phase: number) => (1 - terminator(phase)) / 2;

/**
 * Outline of the lit part of a unit disc. In the southern hemisphere the Moon
 * waxes from the left, so the first half of the cycle is lit on that side.
 */
export const litPath = (phase: number) => {
  const edge = terminator(phase);
  const limb = phase < 0.5 ? 0 : 1;
  // A crescent curves back along the lit side, a gibbous Moon along the dark one
  const back = edge > 0 ? 1 - limb : limb;
  return `M0-1A1 1 0 0 ${limb} 0 1A${Math.abs(edge).toFixed(3)} 1 0 0 ${back} 0-1Z`;
};

/** The Moon at the given phase as a standalone icon, for the browser tab */
export const moonIcon = (phase: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 32 32"><circle r="16" fill="${GROUND}"/><circle r="12.5" fill="#dfe9f8" fill-opacity=".13"/><path fill="#e6eefb" transform="scale(12.5)" d="${litPath(phase)}"/></svg>`;

/** The phase in words with the lit share of the disc, e.g. "Waning crescent, 39% lit" */
export const moonLabel = (phase: number) => {
  const names = [
    [0.03, "New Moon"],
    [0.22, "Waxing crescent"],
    [0.28, "First quarter"],
    [0.47, "Waxing gibbous"],
    [0.53, "Full Moon"],
    [0.72, "Waning gibbous"],
    [0.78, "Last quarter"],
    [0.97, "Waning crescent"],
    [1, "New Moon"],
  ] as const;
  const name = names.find(([limit]) => phase <= limit)![1];
  const lit = Math.round(litShare(phase) * 100);
  return `${name}, ${lit}% lit`;
};

/** The stars with a name of their own, brightest first: right ascension, declination, name */
export const NAMED: [ra: number, dec: number, name: string][] = [
  [101.29, -16.72, "Sirius"],
  [95.99, -52.7, "Canopus"],
  [213.92, 19.18, "Arcturus"],
  [219.9, -60.83, "Rigil Kentaurus"],
  [219.9, -60.84, "Toliman"],
  [279.23, 38.78, "Vega"],
  [78.63, -8.2, "Rigel"],
  [114.83, 5.22, "Procyon"],
  [24.43, -57.24, "Achernar"],
  [88.79, 7.41, "Betelgeuse"],
  [210.96, -60.37, "Hadar"],
  [297.7, 8.87, "Altair"],
  [186.65, -63.1, "Acrux"],
  [68.98, 16.51, "Aldebaran"],
  [201.3, -11.16, "Spica"],
  [247.35, -26.43, "Antares"],
  [116.33, 28.03, "Pollux"],
  [344.41, -29.62, "Fomalhaut"],
  [191.93, -59.69, "Mimosa"],
  [152.09, 11.97, "Regulus"],
  [104.66, -28.97, "Adhara"],
  [113.65, 31.89, "Castor"],
  [187.79, -57.11, "Gacrux"],
  [263.4, -37.1, "Shaula"],
  [81.28, 6.35, "Bellatrix"],
  [81.57, 28.61, "Elnath"],
  [138.3, -69.72, "Miaplacidus"],
  [84.05, -1.2, "Alnilam"],
  [332.06, -46.96, "Alnair"],
  [85.19, -1.94, "Alnitak"],
  [183.79, -58.75, "Imai"],
];

/** A star's height above the horizon at Brasília, in degrees */
const altitude = (ra: number, dec: number, date: Date) => {
  const rad = Math.PI / 180;
  const hour = (siderealTime(date) - ra) * rad;
  const [lat, d] = [LATITUDE * rad, dec * rad];
  return (
    Math.asin(
      Math.sin(lat) * Math.sin(d) +
        Math.cos(lat) * Math.cos(d) * Math.cos(hour),
    ) / rad
  );
};

/** The sky at a moment, in a few sentences: the Moon, the stars that are up, and the next named star to cross the meridian */
export const tonight = (date: Date, catalogue: Star[]) => {
  const up = (ra: number, dec: number) => altitude(ra, dec, date) > 0;
  const count = catalogue.filter(([ra, dec]) => up(ra, dec)).length;
  const bright = NAMED.filter(([ra, dec]) => up(ra, dec))
    .map(([, , name]) => name)
    .slice(0, 6);
  const now = siderealTime(date);
  const [ra, , next] = NAMED.reduce((best, star) =>
    wrap(star[0] - now) < wrap(best[0] - now) ? star : best,
  );
  const minutes = Math.round((wrap(ra - now) / TURN) * 1440);
  const wait =
    minutes < 60
      ? `${minutes} min`
      : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  const among = bright.length
    ? `, among them ${bright.slice(0, -1).join(", ")}${bright.length > 1 ? " and " : ""}${bright.at(-1)}`
    : "";
  const moon = moonLabel(moonPhase(date));
  return [
    `Moon phase: ${moon[0].toLowerCase()}${moon.slice(1)}.`,
    `Above the horizon from Brasília: ${count.toLocaleString("en")} of these stars${among}.`,
    `Next named star to cross the meridian: ${next}, in ${wait}.`,
  ].join(" ");
};
