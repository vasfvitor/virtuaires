// Small astronomy helpers shared by the build and the browser.

/** Longitude of the UTC-3 meridian, the one Brasília time is based on */
const LONGITUDE = -45;
/** Right ascension drawn straight up from the pole in sky.svg: the Southern Cross */
export const UP = 187;

const julianDate = (date: Date) => date.getTime() / 86_400_000 + 2440587.5;

/** How far to turn sky.svg clockwise so the stars on the meridian are straight up */
export const skyAngle = (date: Date) => {
  const greenwich =
    280.46061837 + 360.98564736629 * (julianDate(date) - 2451545);
  return ((((greenwich + LONGITUDE - UP) % 360) + 360) % 360).toFixed(2);
};

/** Mean age of the Moon as a fraction of the lunar month: 0 is new, 0.5 is full */
export const moonPhase = (date: Date) => {
  const lunations = (julianDate(date) - 2451550.1) / 29.530588853;
  return lunations - Math.floor(lunations);
};

/** Outline of the lit part of a unit disc, lit from the right */
export const litPath = (phase: number) => {
  const terminator = Math.cos(2 * Math.PI * phase);
  // A crescent curves back along the lit side, a gibbous Moon along the dark one
  const sweep = terminator > 0 ? 0 : 1;
  return `M0-1A1 1 0 0 1 0 1A${Math.abs(terminator).toFixed(3)} 1 0 0 ${sweep} 0-1Z`;
};

/** In the southern hemisphere the Moon waxes from the left */
export const litFromLeft = (phase: number) => phase < 0.5;
