/**
 * Heliocentric positions of Mercury, Venus, the Earth and Mars from the VSOP87
 * theory, with its slow drift against modern ephemerides corrected.
 */
import { VSOP87, VSOP87_TIME_CORRECTION } from './data/vsop87.ts'
import type { Vsop87Planet } from './data/vsop87.ts'
import { evaluateSeries } from './series.ts'
import { DAYS_PER_CENTURY, J2000 } from './time.ts'

export type { Vsop87Planet } from './data/vsop87.ts'

/** Position (AU) and velocity (AU/day): [x, y, z, vx, vy, vz]. */
export type State = [number, number, number, number, number, number]

const DAYS_PER_MILLENNIUM = 365250
const SECONDS_PER_DAY = 86400

/**
 * The instant at which to evaluate a planet's series so that it matches DE441:
 * the tabulated correction, interpolated between century nodes and held
 * constant beyond the table.
 */
function correctedTime(planet: Vsop87Planet, jdTt: number): number {
  const nodes = VSOP87_TIME_CORRECTION.seconds[planet]
  const position = (jdTt - J2000) / DAYS_PER_CENTURY - VSOP87_TIME_CORRECTION.firstCentury
  const clamped = Math.min(nodes.length - 1, Math.max(0, position))
  const node = Math.min(nodes.length - 2, Math.floor(clamped))
  const seconds = nodes[node] + (clamped - node) * (nodes[node + 1] - nodes[node])
  return jdTt + seconds / SECONDS_PER_DAY
}

/**
 * Heliocentric state of a planet in the J2000 ecliptic frame.
 *
 * @param cutoff Skip series terms below this amplitude (AU) when a rough
 *               position is enough.
 */
export function heliocentricState(planet: Vsop87Planet, jdTt: number, cutoff = 0): State {
  const t = (correctedTime(planet, jdTt) - J2000) / DAYS_PER_MILLENNIUM
  const [x, vx] = evaluateSeries(VSOP87[planet][0], t, cutoff)
  const [y, vy] = evaluateSeries(VSOP87[planet][1], t, cutoff)
  const [z, vz] = evaluateSeries(VSOP87[planet][2], t, cutoff)
  return [x, y, z, vx / DAYS_PER_MILLENNIUM, vy / DAYS_PER_MILLENNIUM, vz / DAYS_PER_MILLENNIUM]
}
