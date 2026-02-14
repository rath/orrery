/**
 * Julian Day Number conversion
 *
 * Ported from swedate.c (Swiss Ephemeris)
 * Original authors: Marc Pottenger, Alois Treindl, Dieter Koch
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

const SE_GREG_CAL = 1

/**
 * Calendar date → Julian Day Number (Gregorian calendar)
 *
 * @param year  astronomical year (0 = 1 BC, -1 = 2 BC, …)
 * @param month 1–12
 * @param day   1–31
 * @param hour  UT as decimal hours (e.g. 13.5 = 13:30)
 */
export function julday(year: number, month: number, day: number, hour: number): number {
  let u = year
  if (month < 3) u -= 1
  const u0 = u + 4712.0
  let u1 = month + 1.0
  if (u1 < 4) u1 += 12.0
  let jd = Math.floor(u0 * 365.25)
    + Math.floor(30.6 * u1 + 0.000001)
    + day + hour / 24.0 - 63.5
  // Gregorian correction
  let u2 = Math.floor(Math.abs(u) / 100) - Math.floor(Math.abs(u) / 400)
  if (u < 0.0) u2 = -u2
  jd = jd - u2 + 2
  if ((u < 0.0) && (u / 100 === Math.floor(u / 100)) && (u / 400 !== Math.floor(u / 400)))
    jd -= 1
  return jd
}

/**
 * Julian Day Number → Calendar date (Gregorian calendar)
 */
export function revjul(jd: number): { year: number; month: number; day: number; hour: number } {
  let u0 = jd + 32082.5
  // Gregorian correction
  let u1 = u0 + Math.floor(u0 / 36525.0) - Math.floor(u0 / 146100.0) - 38.0
  if (jd >= 1830691.5) u1 += 1
  u0 = u0 + Math.floor(u1 / 36525.0) - Math.floor(u1 / 146100.0) - 38.0
  const u2 = Math.floor(u0 + 123.0)
  const u3 = Math.floor((u2 - 122.2) / 365.25)
  const u4 = Math.floor((u2 - Math.floor(365.25 * u3)) / 30.6001)
  let month = Math.trunc(u4 - 1.0)
  if (month > 12) month -= 12
  const day = Math.trunc(u2 - Math.floor(365.25 * u3) - Math.floor(30.6001 * u4))
  const year = Math.trunc(u3 + Math.floor((u4 - 2.0) / 12.0) - 4800)
  const hour = (jd - Math.floor(jd + 0.5) + 0.5) * 24.0
  return { year, month, day, hour }
}
