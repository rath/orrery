/**
 * The lunar theory ELP 2000-82B: mean arguments and evaluation of the series.
 *
 * Source: M. Chapront-Touzé, J. Chapront, "Lunar solution ELP 2000-82B"
 * (notice distributed with the series by IMCCE). Section 7 gives the mean
 * arguments fitted to the JPL ephemeris DE200/LE200, with secular terms from
 * ELP 2000-85; section 8 gives the coordinate systems.
 *
 * Each argument polynomial is in arcseconds, constant term first, in powers of
 * t = Julian centuries (TDB, taken as TT) since J2000.
 */
import { evaluateSeries } from './series.ts'
import type { PoissonSeries } from './series.ts'

const dms = (degrees: number, minutes: number, seconds: number) => degrees * 3600 + minutes * 60 + seconds

/** W1: mean longitude of the Moon. */
const MOON_MEAN_LONGITUDE = [dms(218, 18, 59.95571), 1732559343.73604, -5.8883, 0.006604, -0.00003169]
/** W2: mean longitude of the lunar perigee. */
const MOON_PERIGEE = [dms(83, 21, 11.67475), 14643420.2632, -38.2776, -0.045047, 0.00021301]
/** W3: mean longitude of the lunar ascending node. */
const MOON_NODE = [dms(125, 2, 40.39816), -6967919.3622, 6.3622, 0.007625, -0.00003586]
/** T: mean heliocentric longitude of the Earth–Moon barycentre. */
export const EARTH_MEAN_LONGITUDE = [dms(100, 27, 59.22059), 129597742.2758, -0.0202, 0.000009, 0.00000015]
/** ϖ′: mean longitude of the perihelion of the Earth–Moon barycentre. */
export const EARTH_PERIHELION = [dms(102, 56, 14.42753), 1161.2283, 0.5327, -0.000138, 0]

/** The three lunar mean longitudes, replaceable so their secular terms can be re-fitted. */
export interface LunarArguments {
  readonly meanLongitude: readonly number[]
  readonly perigee: readonly number[]
  readonly node: readonly number[]
}

export const ELP_ARGUMENTS: LunarArguments = {
  meanLongitude: MOON_MEAN_LONGITUDE,
  perigee: MOON_PERIGEE,
  node: MOON_NODE,
}

const subtract = (a: readonly number[], b: readonly number[]) => a.map((value, i) => value - b[i])

/**
 * Delaunay arguments, in the order the series use them:
 * D (mean elongation), l′ (Sun's mean anomaly), l (Moon's mean anomaly),
 * F (Moon's mean argument of latitude).
 */
export function delaunayPolynomials(args: LunarArguments = ELP_ARGUMENTS): number[][] {
  const elongation = subtract(args.meanLongitude, EARTH_MEAN_LONGITUDE)
  elongation[0] += dms(180, 0, 0)
  return [
    elongation,
    subtract(EARTH_MEAN_LONGITUDE, EARTH_PERIHELION),
    subtract(args.meanLongitude, args.perigee),
    subtract(args.meanLongitude, args.node),
  ]
}

// ── Evaluation ──────────────────────────────────────────────────────────

/** The series of the theory, in radians (longitude, latitude) and kilometres (distance). */
export interface LunarSeries {
  /**
   * Main problem, per coordinate: flat rows of the four Delaunay multipliers
   * and the coefficient. Longitude and latitude are sine series, distance a
   * cosine series.
   */
  readonly main: readonly (readonly number[])[]
  /** Perturbations per coordinate, with t in Julian centuries. */
  readonly perturbations: readonly PoissonSeries[]
}

const ARCSEC = Math.PI / 648000

function polynomial(coefficients: readonly number[], t: number): number {
  return coefficients.reduceRight((sum, coefficient) => sum * t + coefficient, 0) * ARCSEC
}

/**
 * Laskar's series for the orientation of the ecliptic of date on the ecliptic
 * of J2000 (notice, section 8): P = sin(π/2)·sin Π and Q = sin(π/2)·cos Π.
 */
const ECLIPTIC_P = [0, 0.10180391e-4, 0.47020439e-6, -0.5417367e-9, -0.2507948e-11, 0.463486e-14]
const ECLIPTIC_Q = [0, -0.113469002e-3, 0.12372674e-6, 0.1265417e-8, -0.1371808e-11, -0.320334e-14]

/**
 * Geocentric position of the Moon in kilometres, in the J2000 ecliptic frame.
 *
 * @param t    Julian centuries (TT) since J2000.
 * @param args Mean longitudes of the Moon, its perigee and its node.
 */
export function lunarPosition(
  series: LunarSeries, t: number, args: LunarArguments = ELP_ARGUMENTS,
): [number, number, number] {
  const delaunay = delaunayPolynomials(args).map(coefficients => polynomial(coefficients, t))
  const sums = [0, 0, 0]
  for (let coordinate = 0; coordinate < 3; coordinate++) {
    const rows = series.main[coordinate]
    let sum = 0
    for (let i = 0; i < rows.length; i += 5) {
      const argument = rows[i] * delaunay[0] + rows[i + 1] * delaunay[1] + rows[i + 2] * delaunay[2] + rows[i + 3] * delaunay[3]
      sum += rows[i + 4] * (coordinate === 2 ? Math.cos(argument) : Math.sin(argument))
    }
    sums[coordinate] = sum + evaluateSeries(series.perturbations[coordinate], t)[0]
  }

  // Longitude and latitude on the mean ecliptic of date, from its departure point.
  const longitude = polynomial(args.meanLongitude, t) + sums[0]
  const latitude = sums[1]
  const distance = sums[2]
  const x = distance * Math.cos(longitude) * Math.cos(latitude)
  const y = distance * Math.sin(longitude) * Math.cos(latitude)
  const z = distance * Math.sin(latitude)

  // Rotate from the ecliptic of date to the ecliptic of J2000.
  const p = ECLIPTIC_P.reduceRight((sum, coefficient) => sum * t + coefficient, 0)
  const q = ECLIPTIC_Q.reduceRight((sum, coefficient) => sum * t + coefficient, 0)
  const root = Math.sqrt(1 - p * p - q * q)
  return [
    (1 - 2 * p * p) * x + 2 * p * q * y + 2 * p * root * z,
    2 * p * q * x + (1 - 2 * q * q) * y - 2 * q * root * z,
    -2 * p * root * x + 2 * q * root * y + (1 - 2 * p * p - 2 * q * q) * z,
  ]
}
