/**
 * Ephemeris public API
 *
 * Pure TypeScript implementation of the Swiss Ephemeris Moshier mode.
 * No external data files or WASM required.
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

import { julday as _julday, revjul as _revjul } from './julian.ts'
import { deltaT } from './deltat.ts'
import { calcObliquity } from './obliquity.ts'
import { calcNutation } from './nutation.ts'
import { precess } from './precession.ts'
import { cartpol, coortrf2, degnorm, RAD_TO_DEG } from './math.ts'
import { moshplan } from './planets.ts'
import type { PlanetTable } from './tables/planet-coefficients.ts'
import {
  mer404, ven404, ear404, mar404, jup404,
  sat404, ura404, nep404, plu404,
} from './tables/planet-coefficients.ts'
import { calcMoon } from './moon.ts'
import { calcMeanNodeFull } from './node.ts'
import { calcChiron } from './chiron.ts'
export { calcHouses } from './houses.ts'
export type { HousesResult } from './houses.ts'

// ── Planet tables (ordered by Moshier index) ────────────────────────────

const allPlanets: PlanetTable[] = [
  mer404, ven404, ear404, mar404, jup404,
  sat404, ura404, nep404, plu404,
]

// ── Body constants (matching swisseph) ──────────────────────────────────

const SE_SUN = 0
const SE_MOON = 1
const SE_MEAN_NODE = 10
const SE_CHIRON = 15

/** Map swisseph body number → moshplan ipli (internal planet index) */
const bodyToIpli: Record<number, number> = {
  0: 0,  // Sun (uses Earth position)
  2: 2,  // Mercury
  3: 3,  // Venus
  4: 4,  // Mars
  5: 5,  // Jupiter
  6: 6,  // Saturn
  7: 7,  // Uranus
  8: 8,  // Neptune
  9: 9,  // Pluto
}

// ── Result type ─────────────────────────────────────────────────────────

export interface PlanetResult {
  longitude: number       // degrees [0, 360)
  latitude: number        // degrees
  distance: number        // AU
  longitudeSpeed: number  // degrees/day
  latitudeSpeed: number   // degrees/day
  distanceSpeed: number   // AU/day
}

// ── Nutation rotation ───────────────────────────────────────────────────

/**
 * Apply nutation to equatorial rectangular coordinates (linearized rotation).
 *
 * Transforms mean equatorial of date → true equatorial of date.
 * Modifies array in-place. Handles both 3-element and 6-element vectors.
 */
function nutate(p: number[], dpsi: number, deps: number, meanObliquity: number): void {
  const soe = Math.sin(meanObliquity)
  const coe = Math.cos(meanObliquity)
  const A = dpsi * coe
  const B = dpsi * soe

  const x0 = p[0] - A * p[1] - B * p[2]
  const x1 = A * p[0] + p[1] - deps * p[2]
  const x2 = B * p[0] + deps * p[1] + p[2]
  p[0] = x0
  p[1] = x1
  p[2] = x2

  if (p.length >= 6) {
    const x3 = p[3] - A * p[4] - B * p[5]
    const x4 = A * p[3] + p[4] - deps * p[5]
    const x5 = B * p[3] + deps * p[4] + p[5]
    p[3] = x3
    p[4] = x4
    p[5] = x5
  }
}

// ── Coordinate pipeline ─────────────────────────────────────────────────

/**
 * Convert geocentric equatorial J2000 position+velocity
 * to apparent ecliptic of date (longitude, latitude, distance, speeds).
 *
 * Pipeline: precess(J2000→date) → nutate → equatorial→ecliptic → cartesian→polar
 */
function equ2000ToEclDate(xeq: number[], tjde: number): number[] {
  const meanEps = calcObliquity(tjde)
  const [dpsi, deps] = calcNutation(tjde)
  const trueEps = meanEps + deps

  // Precess position J2000 → date
  precess(xeq, tjde, -1)
  // Precess velocity (separate 3-element array)
  if (xeq.length >= 6) {
    const vel = [xeq[3], xeq[4], xeq[5]]
    precess(vel, tjde, -1)
    xeq[3] = vel[0]; xeq[4] = vel[1]; xeq[5] = vel[2]
  }

  // Nutation: mean equatorial → true equatorial
  nutate(xeq, dpsi, deps, meanEps)

  // Equatorial → ecliptic (positive trueEps = R_x(-eps) = equatorial→ecliptic)
  const eclCart = coortrf2(xeq, trueEps)

  // Cartesian → polar (lon, lat, dist, lonSpeed, latSpeed, distSpeed)
  return cartpol(eclCart)
}

// ── Public API ──────────────────────────────────────────────────────────

export function julday(y: number, m: number, d: number, h: number): number {
  return _julday(y, m, d, h)
}

export function revjul(jd: number) {
  return _revjul(jd)
}

/**
 * Calculate planet position.
 *
 * @param jd    Julian day (UT)
 * @param body  swisseph body number (0=Sun, 1=Moon, 2=Mercury, ..., 9=Pluto, 10=MeanNode, 15=Chiron)
 * @returns ecliptic position and speed
 */
export function calcPlanet(jd: number, body: number): PlanetResult {
  const tjde = jd + deltaT(jd)

  // ── Mean Node ──
  if (body === SE_MEAN_NODE) {
    const { longitude, speed } = calcMeanNodeFull(tjde)
    return {
      longitude, latitude: 0, distance: 0.002569,
      longitudeSpeed: speed, latitudeSpeed: 0, distanceSpeed: 0,
    }
  }

  // ── Chiron (interpolation table, takes UT) ──
  if (body === SE_CHIRON) {
    const { longitude, speed } = calcChiron(jd)
    return {
      longitude, latitude: 0, distance: 0,
      longitudeSpeed: speed, latitudeSpeed: 0, distanceSpeed: 0,
    }
  }

  // ── Moon ──
  if (body === SE_MOON) {
    const { xp } = calcMoon(jd)
    const polar = equ2000ToEclDate(xp, tjde)
    return {
      longitude: degnorm(polar[0] * RAD_TO_DEG),
      latitude: polar[1] * RAD_TO_DEG,
      distance: polar[2],
      longitudeSpeed: polar[3] * RAD_TO_DEG,
      latitudeSpeed: polar[4] * RAD_TO_DEG,
      distanceSpeed: polar[5],
    }
  }

  // ── Sun & planets (Mercury–Pluto) ──
  const ipli = bodyToIpli[body]
  if (ipli === undefined) {
    throw new Error(`Unsupported body: ${body}`)
  }

  const { xp, xe } = moshplan(jd, ipli, allPlanets)

  // Geocentric = planet - Earth (for Sun: geocentric = -Earth)
  const xgeo = new Array(6)
  if (body === SE_SUN) {
    for (let i = 0; i < 6; i++) xgeo[i] = -xe[i]
  } else {
    for (let i = 0; i < 6; i++) xgeo[i] = xp[i] - xe[i]
  }

  const polar = equ2000ToEclDate(xgeo, tjde)
  return {
    longitude: degnorm(polar[0] * RAD_TO_DEG),
    latitude: polar[1] * RAD_TO_DEG,
    distance: polar[2],
    longitudeSpeed: polar[3] * RAD_TO_DEG,
    latitudeSpeed: polar[4] * RAD_TO_DEG,
    distanceSpeed: polar[5],
  }
}
