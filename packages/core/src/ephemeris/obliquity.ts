/**
 * Obliquity of the ecliptic
 *
 * Ported from swephlib.c (Swiss Ephemeris)
 * IAU 1976 model — the default for Moshier ephemeris.
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

const J2000 = 2451545.0
const DEG_TO_RAD = Math.PI / 180

/**
 * Mean obliquity of the ecliptic (IAU 1976)
 *
 * @param tjd Julian day (TT)
 * @returns obliquity in radians
 */
export function calcObliquity(tjd: number): number {
  const T = (tjd - J2000) / 36525.0
  // IAU 1976 Lieske formula, in arcseconds
  const eps = (((1.813e-3 * T - 5.9e-4) * T - 46.8150) * T + 84381.448) * DEG_TO_RAD / 3600
  return eps
}
