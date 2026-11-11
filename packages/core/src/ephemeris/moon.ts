/**
 * Geocentric position of the Moon from the lunar theory ELP 2000-82B.
 */
import { ELP_FITTED_ARGUMENTS, ELP_SERIES } from './data/elp2000.ts'
import type { Vector3 } from './frames.ts'
import { lunarPosition } from './lunar-theory.ts'
import { centuriesSinceJ2000 } from './time.ts'

export const KM_PER_AU = 149597870.7

/** Geocentric position of the Moon in the J2000 ecliptic frame, AU. */
export function moonPosition(jdTt: number): Vector3 {
  const [x, y, z] = lunarPosition(ELP_SERIES, centuriesSinceJ2000(jdTt), ELP_FITTED_ARGUMENTS)
  return [x / KM_PER_AU, y / KM_PER_AU, z / KM_PER_AU]
}
