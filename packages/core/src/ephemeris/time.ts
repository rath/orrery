/**
 * Time scales: Julian day numbers, and ΔT = TT − UT.
 *
 * Civil time (UT) is tied to the Earth's irregular rotation, whereas the
 * planetary theories run on the uniform Terrestrial Time (TT). ΔT bridges the
 * two; it is measured for the past and can only be estimated for the future.
 */
import { DELTA_T_FIRST_YEAR, DELTA_T_YEARLY } from './data/delta-t.ts'

/** Julian day of the epoch J2000.0 (2000-01-01 12:00 TT). */
export const J2000 = 2451545
export const DAYS_PER_CENTURY = 36525
const SECONDS_PER_DAY = 86400

/**
 * Julian day of a date in the proleptic Gregorian calendar.
 *
 * @param hours Hours since midnight, fractional.
 */
export function julianDay(year: number, month: number, day: number, hours = 0): number {
  // Count from 1 March so the leap day falls at the end of the shifted year.
  const shift = month <= 2 ? 1 : 0
  const y = year + 4800 - shift
  const m = month + 12 * shift - 3
  const dayNumber = day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  return dayNumber - 0.5 + hours / 24
}

/** Julian centuries elapsed since J2000. */
export function centuriesSinceJ2000(jd: number): number {
  return (jd - J2000) / DAYS_PER_CENTURY
}

/** Calendar year with fraction, on the mean Gregorian year. */
function decimalYear(jd: number): number {
  return 2000 + (jd - 2451544.5) / 365.2425
}

/**
 * Long-term trend of ΔT caused by tidal braking of the Earth's rotation
 * (Morrison & Stephenson 2004), in seconds.
 */
function tidalParabola(year: number): number {
  const u = (year - 1820) / 100
  return -20 + 32 * u * u
}

/**
 * Polynomial fits to historical ΔT before the observed table begins:
 * F. Espenak & J. Meeus, "Five Millennium Canon of Solar Eclipses" (NASA/TP-2006-214141),
 * https://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html
 *
 * Each segment applies up to (not including) `until` and is a polynomial in
 * (year − origin) / scale.
 */
const HISTORICAL_FITS: { until: number; origin: number; scale: number; coefficients: number[] }[] = [
  {
    until: 500, origin: 0, scale: 100,
    coefficients: [10583.6, -1014.41, 33.78311, -5.952053, -0.1798452, 0.022174192, 0.0090316521],
  },
  {
    until: 1600, origin: 1000, scale: 100,
    coefficients: [1574.2, -556.01, 71.23472, 0.319781, -0.8503463, -0.005050998, 0.0083572073],
  },
  { until: 1700, origin: 1600, scale: 1, coefficients: [120, -0.9808, -0.01532, 1 / 7129] },
  {
    until: 1800, origin: 1700, scale: 1,
    coefficients: [8.83, 0.1603, -0.0059285, 0.00013336, -1 / 1174000],
  },
  {
    until: 1860, origin: 1800, scale: 1,
    coefficients: [13.72, -0.332447, 0.0068612, 0.0041116, -0.00037436, 0.0000121272, -0.0000001699, 0.000000000875],
  },
  {
    until: 1900, origin: 1860, scale: 1,
    coefficients: [7.62, 0.5737, -0.251754, 0.01680668, -0.0004473624, 1 / 233174],
  },
]

const TABLE_END_YEAR = DELTA_T_FIRST_YEAR + DELTA_T_YEARLY.length - 1
/** Years over which the extrapolation eases from the last observation into the tidal trend. */
const BRIDGE_YEARS = 150

/**
 * Beyond the observations: a cubic Hermite bridge that leaves the table with
 * the trend of its last decade and joins the tidal parabola, value and slope,
 * `BRIDGE_YEARS` later.
 */
function extrapolated(year: number): number {
  const joinYear = TABLE_END_YEAR + BRIDGE_YEARS
  if (year >= joinYear) return tidalParabola(year)

  const last = DELTA_T_YEARLY.length - 1
  const startValue = DELTA_T_YEARLY[last]
  const startSlope = (startValue - DELTA_T_YEARLY[last - 10]) / 10
  const endValue = tidalParabola(joinYear)
  const endSlope = 0.64 * (joinYear - 1820) / 100 // derivative of the parabola, s/year

  const s = (year - TABLE_END_YEAR) / BRIDGE_YEARS
  const s2 = s * s
  const s3 = s2 * s
  return (2 * s3 - 3 * s2 + 1) * startValue + (s3 - 2 * s2 + s) * BRIDGE_YEARS * startSlope
    + (3 * s2 - 2 * s3) * endValue + (s3 - s2) * BRIDGE_YEARS * endSlope
}

/**
 * ΔT = TT − UT in seconds.
 *
 * Observed yearly values from 1900, published historical fits before that, and
 * an extrapolation afterwards. The uncertainty grows from well under a second
 * in the 20th century to minutes in antiquity and for the far future.
 */
export function deltaT(jdUt: number): number {
  const year = decimalYear(jdUt)
  if (year < -500) return tidalParabola(year)
  if (year >= TABLE_END_YEAR) return extrapolated(year)
  if (year >= DELTA_T_FIRST_YEAR) {
    const position = year - DELTA_T_FIRST_YEAR
    const index = Math.floor(position)
    const fraction = position - index
    return DELTA_T_YEARLY[index] + fraction * (DELTA_T_YEARLY[index + 1] - DELTA_T_YEARLY[index])
  }
  const fit = HISTORICAL_FITS.find(segment => year < segment.until)!
  const u = (year - fit.origin) / fit.scale
  return fit.coefficients.reduceRight((sum, coefficient) => sum * u + coefficient, 0)
}

/** Convert a Julian day in UT to Terrestrial Time. */
export function terrestrialTime(jdUt: number): number {
  return jdUt + deltaT(jdUt) / SECONDS_PER_DAY
}
