/**
 * Mean Lunar Node calculation
 *
 * Polynomial expressions for the mean longitude of the ascending node
 * of the Moon's orbit on the ecliptic.
 *
 * Based on Chapront et al. "Expressions for the Mean Elements of the
 * Moon and the Sun" and Swiss Ephemeris implementation.
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

const J2000 = 2451545.0

function degnorm(x: number): number {
  let y = x % 360.0
  if (Math.abs(y) < 1e-13) y = 0
  if (y < 0.0) y += 360.0
  return y
}

/**
 * Mean longitude of the ascending lunar node.
 *
 * @param tjd Julian day (TT)
 * @returns longitude in degrees [0, 360)
 */
export function calcMeanNode(tjd: number): number {
  const T = (tjd - J2000) / 36525.0
  const T2 = T * T
  const T3 = T2 * T
  const T4 = T3 * T

  // Chapront et al. expression for Omega (mean ascending node)
  // in degrees
  const omega = 125.0445479
    - 1934.1362891 * T
    + 0.0020754 * T2
    + T3 / 467441.0
    - T4 / 60616000.0

  return degnorm(omega)
}

/**
 * Calculate Mean Node ecliptic longitude and speed.
 *
 * @param tjd Julian day (TT)
 * @returns { longitude: number, speed: number } in degrees and degrees/day
 */
export function calcMeanNodeFull(tjd: number): { longitude: number; speed: number } {
  const lon = calcMeanNode(tjd)

  // Speed via numerical differentiation (0.1 day interval)
  const dt = 0.1
  const lon2 = calcMeanNode(tjd - dt)
  // Wrap the angular difference before dividing by the time interval.
  const speed = (((lon - lon2 + 180) % 360 + 360) % 360 - 180) / dt

  return { longitude: lon, speed }
}
