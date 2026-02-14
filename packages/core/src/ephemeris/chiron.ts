/**
 * Chiron position via cubic Hermite interpolation
 *
 * Uses pre-computed table from Swiss Ephemeris (1900-2100, 10-day intervals).
 * Cubic Hermite interpolation uses both position and speed data
 * for sub-arcsecond accuracy between table entries.
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

import {
  CHIRON_JD_START, CHIRON_JD_STEP, CHIRON_N,
  CHIRON_LON, CHIRON_SPEED,
} from './tables/chiron-data.ts'

/**
 * Normalize angle to [0, 360)
 */
function degnorm(x: number): number {
  let y = x % 360
  if (y < 0) y += 360
  return y
}

/**
 * Cubic Hermite interpolation between two data points.
 *
 * Given positions p0, p1 and tangents m0, m1 at t=0 and t=1,
 * returns interpolated value at fractional position t ∈ [0, 1].
 */
function hermite(t: number, p0: number, p1: number, m0: number, m1: number): number {
  const t2 = t * t
  const t3 = t2 * t
  const h00 = 2 * t3 - 3 * t2 + 1
  const h10 = t3 - 2 * t2 + t
  const h01 = -2 * t3 + 3 * t2
  const h11 = t3 - t2
  return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1
}

/**
 * Calculate Chiron ecliptic longitude and speed.
 *
 * @param tjd Julian day (UT)
 * @returns { longitude, speed } in degrees and degrees/day
 */
export function calcChiron(tjd: number): { longitude: number; speed: number } {
  // Check range
  const jdEnd = CHIRON_JD_START + (CHIRON_N - 1) * CHIRON_JD_STEP
  if (tjd < CHIRON_JD_START || tjd > jdEnd) {
    throw new Error(
      `Chiron: JD ${tjd} outside range ${CHIRON_JD_START}..${jdEnd}`
    )
  }

  // Find table index
  const fractionalIdx = (tjd - CHIRON_JD_START) / CHIRON_JD_STEP
  const i = Math.floor(fractionalIdx)
  const frac = fractionalIdx - i

  // Clamp to valid range
  const i0 = Math.min(i, CHIRON_N - 2)
  const i1 = i0 + 1

  // Get positions (handle wrap-around for 0°/360° boundary)
  let p0 = CHIRON_LON[i0]
  let p1 = CHIRON_LON[i1]

  // Unwrap: if positions differ by >180°, one crossed 0°
  let dp = p1 - p0
  if (dp > 180) dp -= 360
  if (dp < -180) dp += 360
  const p1u = p0 + dp // unwrapped p1

  // Tangents: speed * step_size (convert degrees/day to degrees/interval)
  const m0 = CHIRON_SPEED[i0] * CHIRON_JD_STEP
  const m1 = CHIRON_SPEED[i1] * CHIRON_JD_STEP

  const lon = hermite(frac, p0, p1u, m0, m1)

  // Speed via derivative of Hermite
  const t = frac
  const t2 = t * t
  const dh00 = 6 * t2 - 6 * t
  const dh10 = 3 * t2 - 4 * t + 1
  const dh01 = -6 * t2 + 6 * t
  const dh11 = 3 * t2 - 2 * t
  const speed = (dh00 * p0 + dh10 * m0 + dh01 * p1u + dh11 * m1) / CHIRON_JD_STEP

  return {
    longitude: degnorm(lon),
    speed,
  }
}
