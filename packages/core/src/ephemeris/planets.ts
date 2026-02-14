/**
 * Moshier planetary theory
 *
 * Ported from swemplan.c (Swiss Ephemeris)
 * Original author: Steve Moshier; modified for Swiss Ephemeris by Dieter Koch
 *
 * Computes heliocentric ecliptic positions of Mercury through Pluto
 * using harmonic series expansions (VSOP-like).
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

import type { PlanetTable } from './tables/planet-coefficients.ts'
import { polcart, coortrf2, DEG_TO_RAD } from './math.ts'
import { calcObliquity } from './obliquity.ts'
import { precess } from './precession.ts'
import { calcNutation } from './nutation.ts'
import { deltaT } from './deltat.ts'

const J2000 = 2451545.0
const J1900 = 2415020.0
const TIMESCALE = 3652500.0
const STR = 4.8481368110953599359e-6  // arc seconds to radians
const PLAN_SPEED_INTV = 0.1           // days, for numerical differentiation
const EARTH_MOON_MRAT = 81.30056

/** Map from internal planet index to Moshier table index */
const pnoint2msh = [2, 2, 0, 1, 3, 4, 5, 6, 7, 8]

/** Fundamental frequencies, arc-seconds per 10000 Julian years (Simon et al 1994) */
const freqs = [
  53810162868.8982,
  21066413643.3548,
  12959774228.3429,
  6890507749.3988,
  1092566037.7991,
  439960985.5372,
  154248119.3933,
  78655032.0744,
  52272245.1795,
]

/** Initial phases, in arc-seconds */
const phases = [
  252.25090552 * 3600,
  181.97980085 * 3600,
  100.46645683 * 3600,
  355.43299958 * 3600,
  34.35151874 * 3600,
  50.07744430 * 3600,
  314.05500511 * 3600,
  304.34866548 * 3600,
  860492.1546,
]

function mods3600(x: number): number {
  return x - 1.296e6 * Math.floor(x / 1.296e6)
}

function degnorm(x: number): number {
  let y = x % 360.0
  if (Math.abs(y) < 1e-13) y = 0
  if (y < 0.0) y += 360.0
  return y
}

// Thread-local sin/cos tables
const ssTbl: number[][] = Array.from({ length: 9 }, () => new Array(24).fill(0))
const ccTbl: number[][] = Array.from({ length: 9 }, () => new Array(24).fill(0))

/**
 * Prepare lookup table of sin(i*L) and cos(i*L)
 */
function sscc(k: number, arg: number, n: number): void {
  const su = Math.sin(arg)
  const cu = Math.cos(arg)
  ssTbl[k][0] = su
  ccTbl[k][0] = cu
  let sv = 2.0 * su * cu
  let cv = cu * cu - su * su
  ssTbl[k][1] = sv
  ccTbl[k][1] = cv
  for (let i = 2; i < n; i++) {
    const s = su * cv + cu * sv
    cv = cu * cv - su * sv
    sv = s
    ssTbl[k][i] = sv
    ccTbl[k][i] = cv
  }
}

/**
 * Evaluate Moshier planetary series for a single body.
 *
 * Returns heliocentric ecliptic spherical coordinates:
 *   pobj[0] = longitude (radians)
 *   pobj[1] = latitude (radians)
 *   pobj[2] = radius (AU)
 */
export function moshplan2(J: number, plan: PlanetTable): number[] {
  const T = (J - J2000) / TIMESCALE
  const pobj = [0, 0, 0]

  // Generate sin/cos tables for needed multiple angles
  for (let i = 0; i < 9; i++) {
    const j = plan.maxHarmonic[i]
    if (j > 0) {
      const sr = (mods3600(freqs[i] * T) + phases[i]) * STR
      sscc(i, sr, j)
    }
  }

  const argTbl = plan.argTbl
  const lonTbl = plan.lonTbl
  const latTbl = plan.latTbl
  const radTbl = plan.radTbl

  let sl = 0.0
  let sb = 0.0
  let sr = 0.0

  let pIdx = 0   // index into argTbl
  let plIdx = 0  // index into lonTbl
  let pbIdx = 0  // index into latTbl
  let prIdx = 0  // index into radTbl

  for (; ;) {
    // Number of periodic arguments
    const np = argTbl[pIdx++]
    if (np < 0) break

    if (np === 0) {
      // Polynomial term
      const nt = argTbl[pIdx++]
      // Longitude polynomial
      let cu = lonTbl[plIdx++]
      for (let ip = 0; ip < nt; ip++) {
        cu = cu * T + lonTbl[plIdx++]
      }
      sl += mods3600(cu)
      // Latitude polynomial
      cu = latTbl[pbIdx++]
      for (let ip = 0; ip < nt; ip++) {
        cu = cu * T + latTbl[pbIdx++]
      }
      sb += cu
      // Radius polynomial
      cu = radTbl[prIdx++]
      for (let ip = 0; ip < nt; ip++) {
        cu = cu * T + radTbl[prIdx++]
      }
      sr += cu
      continue
    }

    // Periodic terms: combine harmonic arguments
    let k1 = 0
    let cv = 0.0
    let sv = 0.0
    for (let ip = 0; ip < np; ip++) {
      const j = argTbl[pIdx++]        // which harmonic
      const m = argTbl[pIdx++] - 1    // which planet (0-indexed)
      if (j !== 0) {
        let k = j
        if (j < 0) k = -k
        k -= 1
        let su = ssTbl[m][k]
        if (j < 0) su = -su
        const cu = ccTbl[m][k]
        if (k1 === 0) {
          sv = su
          cv = cu
          k1 = 1
        } else {
          const t = su * cv + cu * sv
          cv = cu * cv - su * sv
          sv = t
        }
      }
    }

    // Highest power of T
    const nt = argTbl[pIdx++]

    // Longitude
    let cuL = lonTbl[plIdx++]
    let suL = lonTbl[plIdx++]
    for (let ip = 0; ip < nt; ip++) {
      cuL = cuL * T + lonTbl[plIdx++]
      suL = suL * T + lonTbl[plIdx++]
    }
    sl += cuL * cv + suL * sv

    // Latitude
    let cuB = latTbl[pbIdx++]
    let suB = latTbl[pbIdx++]
    for (let ip = 0; ip < nt; ip++) {
      cuB = cuB * T + latTbl[pbIdx++]
      suB = suB * T + latTbl[pbIdx++]
    }
    sb += cuB * cv + suB * sv

    // Radius
    let cuR = radTbl[prIdx++]
    let suR = radTbl[prIdx++]
    for (let ip = 0; ip < nt; ip++) {
      cuR = cuR * T + radTbl[prIdx++]
      suR = suR * T + radTbl[prIdx++]
    }
    sr += cuR * cv + suR * sv
  }

  pobj[0] = STR * sl
  pobj[1] = STR * sb
  pobj[2] = STR * plan.distance * sr + plan.distance
  return pobj
}

/**
 * Short lunar theory for Earth-Moon barycenter → Earth adjustment.
 *
 * Subtracts the Moon's position / (1 + mass_ratio) from EMB coords.
 */
function embofsMosh(
  tjd: number,
  xemb: number[],
  epsDate: number,
): void {
  const T = (tjd - J1900) / 36525.0
  // Mean anomaly of Moon (MP)
  let a = degnorm(((1.44e-5 * T + 0.009192) * T + 477198.8491) * T + 296.104608)
  a *= DEG_TO_RAD
  const smp = Math.sin(a)
  const cmp = Math.cos(a)
  const s2mp = 2.0 * smp * cmp
  const c2mp = cmp * cmp - smp * smp
  // Mean elongation (D)
  a = degnorm(((1.9e-6 * T - 0.001436) * T + 445267.1142) * T + 350.737486)
  a = 2.0 * DEG_TO_RAD * a
  const s2d = Math.sin(a)
  const c2d = Math.cos(a)
  // Mean distance from ascending node (F)
  a = degnorm(((-3e-7 * T - 0.003211) * T + 483202.0251) * T + 11.250889)
  a *= DEG_TO_RAD
  const sf = Math.sin(a)
  const cf = Math.cos(a)
  const s2f = 2.0 * sf * cf
  const sx = s2d * cmp - c2d * smp   // sin(2D - MP)
  // Mean longitude of Moon (LP)
  let L = ((1.9e-6 * T - 0.001133) * T + 481267.8831) * T + 270.434164
  // Mean anomaly of Sun (M)
  const M = degnorm(((-3.3e-6 * T - 1.50e-4) * T + 35999.0498) * T + 358.475833)
  // Ecliptic longitude of the Moon
  L = L
    + 6.288750 * smp
    + 1.274018 * sx
    + 0.658309 * s2d
    + 0.213616 * s2mp
    - 0.185596 * Math.sin(DEG_TO_RAD * M)
    - 0.114336 * s2f
  // Ecliptic latitude
  const aSmpCf = smp * cf
  const sCmpSf = cmp * sf
  let B = 5.128189 * sf
    + 0.280606 * (aSmpCf + sCmpSf)
    + 0.277693 * (aSmpCf - sCmpSf)
    + 0.173238 * (s2d * cf - c2d * sf)
  B *= DEG_TO_RAD
  // Parallax
  let p = 0.950724
    + 0.051818 * cmp
    + 0.009531 * (c2d * cmp + s2d * smp)  // cos(2D - MP)
    + 0.007843 * c2d
    + 0.002824 * c2mp
  p *= DEG_TO_RAD
  // Distance in AU
  const dist = 4.263523e-5 / Math.sin(p)
  // Convert to rectangular ecliptic
  L = degnorm(L) * DEG_TO_RAD
  const xyz = polcart([L, B, dist])
  // Convert to equatorial
  const xyzEq = coortrf2([xyz[0], xyz[1], xyz[2], 0, 0, 0], -epsDate)
  // Precess to J2000
  precess(xyzEq, tjd, 1) // J→J2000
  // EMB → Earth
  for (let i = 0; i <= 2; i++) {
    xemb[i] -= xyzEq[i] / (EARTH_MOON_MRAT + 1.0)
  }
}

/**
 * Compute heliocentric equatorial J2000 coordinates for Earth and a planet.
 *
 * @param tjd   Julian day (UT)
 * @param ipli  internal planet index (0=Earth/Sun, 2=Mercury, ..., 8=Neptune)
 * @param planets  array of all 9 PlanetTable objects [mer404..plu404]
 * @returns { xp: number[6], xe: number[6] } planet and Earth position+velocity
 */
export function moshplan(
  tjd: number,
  ipli: number,
  allPlanets: PlanetTable[],
): { xp: number[]; xe: number[] } {
  const iplm = pnoint2msh[ipli]

  // Obliquity at J2000 for coordinate transformation (radians)
  const eps2000 = calcObliquity(J2000)

  // --- Earth position (from EMB) ---
  // EMB heliocentric ecliptic polar
  const embPolar = moshplan2(tjd, allPlanets[pnoint2msh[0]])  // Earth = index 0 → ear404
  // To cartesian
  let xe = polcart(embPolar)
  // To equatorial J2000
  xe = coortrf2([xe[0], xe[1], xe[2], 0, 0, 0], -eps2000)
  // EMB → Earth (needs obliquity of date for Moon)
  const epsDate = calcObliquity(tjd + deltaT(tjd))
  embofsMosh(tjd, xe, epsDate)

  // Speed via numerical differentiation
  const embPolar2 = moshplan2(tjd - PLAN_SPEED_INTV, allPlanets[pnoint2msh[0]])
  let x2 = polcart(embPolar2)
  x2 = coortrf2([x2[0], x2[1], x2[2], 0, 0, 0], -eps2000)
  embofsMosh(tjd - PLAN_SPEED_INTV, x2, epsDate)

  xe[3] = (xe[0] - x2[0]) / PLAN_SPEED_INTV
  xe[4] = (xe[1] - x2[1]) / PLAN_SPEED_INTV
  xe[5] = (xe[2] - x2[2]) / PLAN_SPEED_INTV

  // --- If Earth is the requested planet ---
  if (ipli === 0) {
    return { xp: [...xe], xe: [...xe] }
  }

  // --- Other planet ---
  const plPolar = moshplan2(tjd, allPlanets[iplm])
  let xp = polcart(plPolar)
  xp = coortrf2([xp[0], xp[1], xp[2], 0, 0, 0], -eps2000)

  // Speed
  const plPolar2 = moshplan2(tjd - PLAN_SPEED_INTV, allPlanets[iplm])
  let xp2 = polcart(plPolar2)
  xp2 = coortrf2([xp2[0], xp2[1], xp2[2], 0, 0, 0], -eps2000)

  xp[3] = (xp[0] - xp2[0]) / PLAN_SPEED_INTV
  xp[4] = (xp[1] - xp2[1]) / PLAN_SPEED_INTV
  xp[5] = (xp[2] - xp2[2]) / PLAN_SPEED_INTV

  return { xp, xe }
}
