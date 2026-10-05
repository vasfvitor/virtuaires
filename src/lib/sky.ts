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

/** Days from one new Moon to the next */
const SYNODIC = 29.530588853;

const julianDate = (date: Date) => date.getTime() / 86_400_000 + 2440587.5;

/** Local sidereal time in degrees: the right ascension on the meridian */
export const siderealTime = (date: Date) => {
  const greenwich = 280.46061837 + TURN * (julianDate(date) - 2451545);
  return wrap(greenwich + LONGITUDE);
};

/** How far to turn sky.svg clockwise so the stars on the meridian are straight up */
export const skyAngle = (date: Date) =>
  wrap(siderealTime(date) - UP).toFixed(2);

/** The new Moons either side of a moment */
const lunation = (date: Date) => {
  const day = 86_400_000;
  // A day on from each new Moon found, so the search moves past it
  const after = (when: Date) =>
    nextPhase(new Date(when.getTime() + day), false);
  let last = after(new Date(date.getTime() - 32 * day));
  let next = after(last);
  while (next <= date) [last, next] = [next, after(next)];
  return { last, next };
};

/** Age of the Moon as a fraction of its month, from the true new Moons either side: 0 is new, 0.5 is about full */
export const moonPhase = (date: Date) => {
  const { last, next } = lunation(date);
  return (date.getTime() - last.getTime()) / (next.getTime() - last.getTime());
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

/** The phase's name, e.g. "Waning crescent" */
export const moonName = (phase: number) => {
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
  return names.find(([limit]) => phase <= limit)![1];
};

/** The phase in words with the lit share of the disc, e.g. "Waning crescent, 39% lit" */
export const moonLabel = (phase: number) =>
  `${moonName(phase)}, ${Math.round(litShare(phase) * 100)}% lit`;

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

/** Sidereal time on Brasília's own meridian, about three degrees west of the one its clocks keep */
const cityTime = (date: Date) => siderealTime(date) + CITY - LONGITUDE;

/** A star's height above the horizon at Brasília, in degrees */
const altitude = (ra: number, dec: number, date: Date) => {
  const rad = Math.PI / 180;
  const hour = (cityTime(date) - ra) * rad;
  const [lat, d] = [LATITUDE * rad, dec * rad];
  return (
    Math.asin(
      Math.sin(lat) * Math.sin(d) +
        Math.cos(lat) * Math.cos(d) * Math.cos(hour),
    ) / rad
  );
};

/** Brasília time, in hours from UTC */
const ZONE = -3;
/** Brasília's own longitude, for the Sun */
const CITY = -47.9;

/** Sunset on a day in Brasília and the sunrise after it, by the sunrise equation */
const sunTimes = (date: Date) => {
  const rad = Math.PI / 180;
  const local = new Date(date.getTime() + ZONE * 3_600_000);
  const midnight = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
  );
  const at = (days: number) => {
    const n = julianDate(new Date(midnight)) + 0.5 - 2451545 + days;
    const noon = n - CITY / 360;
    const anomaly = wrap(357.5291 + 0.98560028 * noon);
    const m = anomaly * rad;
    const centre =
      1.9148 * Math.sin(m) + 0.02 * Math.sin(2 * m) + 0.0003 * Math.sin(3 * m);
    const longitude = wrap(anomaly + centre + 282.9372) * rad;
    const transit =
      2451545 + noon + 0.0053 * Math.sin(m) - 0.0069 * Math.sin(2 * longitude);
    const declination = Math.asin(
      Math.sin(longitude) * Math.sin(23.4397 * rad),
    );
    const lat = LATITUDE * rad;
    const half =
      Math.acos(
        (Math.sin(-0.833 * rad) - Math.sin(lat) * Math.sin(declination)) /
          (Math.cos(lat) * Math.cos(declination)),
      ) / rad;
    const toDate = (jd: number) => new Date((jd - 2440587.5) * 86_400_000);
    return {
      rise: toDate(transit - half / 360),
      set: toDate(transit + half / 360),
    };
  };
  return { sunset: at(0).set, sunrise: at(1).rise };
};

/**
 * The next new or full Moon after a moment, from the true phase with its
 * main periodic terms (Meeus, Astronomical Algorithms, ch. 49): within a few
 * minutes, against a day for the mean motion alone
 */
const nextPhase = (date: Date, full: boolean) => {
  const rad = Math.PI / 180;
  const now = julianDate(date);
  let k = Math.floor((now - 2451550.09766) / SYNODIC) - 1 + (full ? 0.5 : 0);
  for (; ; k++) {
    const t = k / 1236.85;
    const e = 1 - 0.002516 * t - 0.0000074 * t * t;
    const sun = (2.5534 + 29.1053567 * k) * rad;
    const moon = (201.5643 + 385.81693528 * k + 0.0107582 * t * t) * rad;
    const node = (160.7108 + 390.67050284 * k - 0.0016118 * t * t) * rad;
    const omega = (124.7746 - 1.56375588 * k) * rad;
    const terms =
      (full ? -0.40614 : -0.4072) * Math.sin(moon) +
      (full ? 0.17302 : 0.17241) * e * Math.sin(sun) +
      (full ? 0.01614 : 0.01608) * Math.sin(2 * moon) +
      (full ? 0.01043 : 0.01039) * Math.sin(2 * node) +
      (full ? 0.00734 : 0.00739) * e * Math.sin(moon - sun) -
      (full ? 0.00515 : 0.00514) * e * Math.sin(moon + sun) +
      (full ? 0.00209 : 0.00208) * e * e * Math.sin(2 * sun) -
      0.00111 * Math.sin(moon - 2 * node) -
      0.00057 * Math.sin(moon + 2 * node) +
      0.00056 * e * Math.sin(2 * moon + sun) -
      0.00042 * Math.sin(3 * moon) +
      0.00042 * e * Math.sin(sun + 2 * node) +
      0.00038 * e * Math.sin(sun - 2 * node) -
      0.00024 * e * Math.sin(2 * moon - sun) -
      0.00017 * Math.sin(omega);
    const jd = 2451550.09766 + SYNODIC * k + 0.00015437 * t * t + terms;
    if (jd > now) return new Date((jd - 2440587.5) * 86_400_000);
  }
};

/**
 * The facts the sky page lists, by key, as of a moment. The Moon's dates are
 * worldwide moments, so they are given in the reader's own time zone when it
 * is known, and in UTC when it is not; the Sun's times are Brasília's own
 */
export const skyFacts = (date: Date, catalogue: Star[], reader?: string) => {
  const format = (
    when: Date,
    timeZone: string,
    parts: Intl.DateTimeFormatOptions,
  ) => when.toLocaleString("en-GB", { timeZone, ...parts });
  const clock = { hour: "2-digit", minute: "2-digit" } as const;
  const local = (when: Date) => format(when, "America/Sao_Paulo", clock);
  const theirs = reader ?? "UTC";
  const moment = (when: Date) =>
    `${format(when, theirs, { day: "numeric", month: "long" })}, ${format(when, theirs, clock)} ${reader ? "your time" : "UTC"}`;

  const phase = moonPhase(date);
  const age = (date.getTime() - lunation(date).last.getTime()) / 86_400_000;
  const up = (ra: number, dec: number) => altitude(ra, dec, date) > 0;
  const named = NAMED.filter(([ra, dec]) => up(ra, dec)).map(
    ([, , name]) => name,
  );
  const now = cityTime(date);
  const [ra, , next] = NAMED.reduce((best, star) =>
    wrap(star[0] - now) < wrap(best[0] - now) ? star : best,
  );
  const minutes = Math.round((wrap(ra - now) / TURN) * 1440);
  const { sunset, sunrise } = sunTimes(date);

  return {
    phase: moonName(phase),
    lit: `${Math.round(litShare(phase) * 100)}%`,
    age: `${age.toFixed(1)} days`,
    newMoon: moment(nextPhase(date, false)),
    fullMoon: moment(nextPhase(date, true)),
    sun: `sets ${local(sunset)}, rises ${local(sunrise)}, Brasília time`,
    stars: `${catalogue.filter(([ra, dec]) => up(ra, dec)).length.toLocaleString("en")} of ${catalogue.length.toLocaleString("en")}`,
    named: named.length ? named.join(", ") : "none",
    next: `${next}, in ${minutes < 60 ? "" : `${Math.floor(minutes / 60)} h `}${minutes % 60} min`,
    asOf: `${format(date, theirs, { day: "numeric", month: "long", year: "numeric" })}, ${format(date, theirs, clock)} ${reader ? "your time" : "UTC"}`,
  };
};
