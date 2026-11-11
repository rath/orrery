/**
 * Reference frames: precession, nutation, obliquity and sidereal time.
 *
 * The planetary theories work in the fixed ecliptic frame of J2000, whereas a
 * horoscope is drawn on the ecliptic and equinox "of date", which drift with
 * the slow wobble of the Earth's axis (precession) and its small periodic
 * nodding (nutation).
 */
import { NUTATION_TERMS } from './data/nutation.ts'
import { J2000 } from './time.ts'

export const DEG = Math.PI / 180
const ARCSEC = DEG / 3600
const TWO_PI = 2 * Math.PI

/** Reduce an angle in radians to [0, 2π). */
export function normalizeRadians(angle: number): number {
  const reduced = angle % TWO_PI
  return reduced < 0 ? reduced + TWO_PI : reduced
}

/** Evaluate a polynomial given in arcseconds (constant term first); result in radians. */
function arcsecPolynomial(coefficients: readonly number[], t: number): number {
  return coefficients.reduceRight((sum, coefficient) => sum * t + coefficient, 0) * ARCSEC
}

// ── Rotations (3×3 matrices in row-major order) ─────────────────────────

export type Matrix3 = readonly number[]
export type Vector3 = readonly [number, number, number]

/** Rotation of the coordinate axes about X by `angle` (the R1 of the astrometric literature). */
function rotationX(angle: number): Matrix3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [1, 0, 0, 0, c, s, 0, -s, c]
}

/** Rotation of the coordinate axes about Z by `angle` (R3). */
function rotationZ(angle: number): Matrix3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [c, s, 0, -s, c, 0, 0, 0, 1]
}

function multiply(a: Matrix3, b: Matrix3): Matrix3 {
  const product = new Array<number>(9)
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      product[3 * row + column] = a[3 * row] * b[column] + a[3 * row + 1] * b[3 + column] + a[3 * row + 2] * b[6 + column]
    }
  }
  return product
}

export function rotate(m: Matrix3, v: Vector3): Vector3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ]
}

// ── Precession (IAU 2006) ───────────────────────────────────────────────
//
// N. Capitaine, P. T. Wallace, J. Chapront, "Expressions for IAU 2000
// precession quantities", Astron. Astrophys. 412, 567 (2003), adopted as the
// IAU 2006 precession. Coefficients in arcseconds, t in Julian centuries of TT.

/** Obliquity of the ecliptic at J2000, arcseconds. */
const OBLIQUITY_J2000 = 84381.406
const MEAN_OBLIQUITY = [OBLIQUITY_J2000, -46.836769, -0.0001831, 0.0020034, -0.000000576, -0.0000000434]
/** Luni-solar precession ψ_A, inclination ω_A of the equator on the J2000 ecliptic, planetary precession χ_A. */
const PSI_A = [0, 5038.481507, -1.0790069, -0.00114045, 0.000132851, -0.0000000951]
const OMEGA_A = [OBLIQUITY_J2000, -0.025754, 0.0512623, -0.00772503, -0.000000467, 0.0000003337]
const CHI_A = [0, 10.556403, -2.3814292, -0.00121197, 0.000170663, -0.000000056]

/**
 * Rotation from the VSOP87 dynamical ecliptic frame of J2000 to the J2000
 * equatorial frame (FK5, which coincides with the ICRF to ~0.02″). Published
 * with VSOP87; the ELP 2000-82B lunar frame differs from it by 0.0005″ only.
 */
export const ECLIPTIC_J2000_TO_EQUATOR: Matrix3 = [
  1, 0.00000044036, -0.000000190919,
  -0.000000479966, 0.917482137087, -0.397776982902,
  0, 0.397776982902, 0.917482137087,
]

/** Mean obliquity of the ecliptic of date, radians. */
export function meanObliquity(t: number): number {
  return arcsecPolynomial(MEAN_OBLIQUITY, t)
}

/**
 * Rotation taking J2000 ecliptic coordinates (the frame of the theories) to
 * the mean ecliptic and equinox of date.
 */
export function eclipticOfDateMatrix(t: number): Matrix3 {
  // J2000 equator → mean equator of date, by the four-rotation form of the precession.
  const precession = multiply(
    rotationZ(arcsecPolynomial(CHI_A, t)),
    multiply(
      rotationX(-arcsecPolynomial(OMEGA_A, t)),
      multiply(rotationZ(-arcsecPolynomial(PSI_A, t)), rotationX(OBLIQUITY_J2000 * ARCSEC)),
    ),
  )
  return multiply(rotationX(meanObliquity(t)), multiply(precession, ECLIPTIC_J2000_TO_EQUATOR))
}

// ── Nutation ────────────────────────────────────────────────────────────

/**
 * Delaunay arguments of the Sun and Moon (IERS Conventions 2003, after Simon
 * et al. 1994): constant in degrees, then arcseconds per power of t.
 * Order: l (Moon's mean anomaly), l′ (Sun's mean anomaly), F (Moon's mean
 * argument of latitude), D (mean elongation), Ω (mean longitude of the Moon's
 * ascending node).
 */
const DELAUNAY: readonly (readonly number[])[] = [
  [134.96340251, 1717915923.2178, 31.8792, 0.051635, -0.0002447],
  [357.52910918, 129596581.0481, -0.5532, 0.000136, -0.00001149],
  [93.27209062, 1739527262.8478, -12.7512, -0.001037, 0.00000417],
  [297.85019547, 1602961601.209, -6.3706, 0.006593, -0.00003169],
  [125.04455501, -6962890.5431, 7.4722, 0.007702, -0.00005939],
]

function delaunayArgument(index: number, t: number): number {
  const [degrees, ...rates] = DELAUNAY[index]
  return degrees * DEG + arcsecPolynomial([0, ...rates], t)
}

/** Mean longitude of the Moon's ascending node on the ecliptic of date, radians. */
export function meanLunarNode(t: number): number {
  return normalizeRadians(delaunayArgument(4, t))
}

export interface Nutation {
  /** Δψ: shift of the equinox along the ecliptic, radians. */
  longitude: number
  /** Δε: change of the obliquity, radians. */
  obliquity: number
}

const MICROARCSEC = ARCSEC / 1e6
let cachedNutation: { t: number; value: Nutation } | null = null

/** Nutation in longitude and obliquity. */
export function nutation(t: number): Nutation {
  if (cachedNutation?.t === t) return cachedNutation.value

  const args = DELAUNAY.map((_, index) => delaunayArgument(index, t))
  let longitude = 0
  let obliquity = 0
  for (const term of NUTATION_TERMS) {
    const argument = term[0] * args[0] + term[1] * args[1] + term[2] * args[2] + term[3] * args[3] + term[4] * args[4]
    const sin = Math.sin(argument)
    const cos = Math.cos(argument)
    longitude += (term[5] + term[6] * t) * sin + term[7] * cos
    obliquity += (term[8] + term[9] * t) * cos + term[10] * sin
  }
  const value = { longitude: longitude * MICROARCSEC, obliquity: obliquity * MICROARCSEC }
  cachedNutation = { t, value }
  return value
}

/** True obliquity of the ecliptic of date (mean obliquity plus nutation), radians. */
export function trueObliquity(t: number): number {
  return meanObliquity(t) + nutation(t).obliquity
}

// ── Sidereal time ───────────────────────────────────────────────────────

/** Greenwich mean sidereal time minus the Earth rotation angle (IAU 2006), arcseconds. */
const GMST_MINUS_ERA = [0.014506, 4612.156534, 1.3915817, -0.00000044, -0.000029956, -0.0000000368]

/**
 * Greenwich apparent sidereal time, radians: the right ascension of the true
 * equinox currently on the Greenwich meridian.
 *
 * @param jdUt Julian day in UT, which fixes the Earth's rotation angle.
 * @param t    Julian centuries of TT since J2000, for the slow precession terms.
 */
export function greenwichApparentSiderealTime(jdUt: number, t: number): number {
  const days = jdUt - J2000
  // Earth rotation angle, split so the whole turns do not eat the precision of the fraction.
  const turns = 0.779057273264 + 0.00273781191135448 * days + (days % 1)
  const mean = TWO_PI * turns + arcsecPolynomial(GMST_MINUS_ERA, t)
  const equationOfEquinoxes = nutation(t).longitude * Math.cos(meanObliquity(t))
  return normalizeRadians(mean + equationOfEquinoxes)
}
