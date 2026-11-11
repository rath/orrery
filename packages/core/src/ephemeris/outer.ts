/**
 * Heliocentric positions of the outer planets and Chiron, integrated from the
 * checkpoint tables (see `integrator.ts` for the method).
 */
import { CHIRON_CHECKPOINTS, OUTER_CHECKPOINTS } from './data/checkpoints.ts'
import { innerBarycentre, integrate } from './integrator.ts'
import type { CheckpointTable, IntegratedBody } from './integrator.ts'

export type { IntegratedBody } from './integrator.ts'

function tableOf(body: IntegratedBody): CheckpointTable {
  return body === 'Chiron' ? CHIRON_CHECKPOINTS : OUTER_CHECKPOINTS
}

/** First and last Julian day (TT) covered by the checkpoints of a body. */
export function integratedRange(body: IntegratedBody): [number, number] {
  const table = tableOf(body)
  return [table.epoch, table.epoch + (table.states.length / (6 * table.bodies.length) - 1) * table.interval]
}

/**
 * Recent integrations per table, by whole Julian day. A chart asks for several
 * bodies at instants a few hours apart (light-time, speed), which may straddle
 * a day boundary; keeping a few days avoids integrating afresh for each. The
 * result for an instant depends on that instant alone, never on the cache.
 */
interface Integration {
  state: Float64Array
  rate: Float64Array
}
const CACHED_DAYS = 4
const cache = new Map<CheckpointTable, Map<number, Integration>>()

function integrationAt(table: CheckpointTable, day: number): Integration {
  let days = cache.get(table)
  if (!days) {
    days = new Map()
    cache.set(table, days)
  }
  let entry = days.get(day)
  if (!entry) {
    entry = integrate(table, day)
    days.set(day, entry)
    // Maps iterate in insertion order, so the first key is the oldest.
    if (days.size > CACHED_DAYS) days.delete(days.keys().next().value!)
  }
  return entry
}

/** Heliocentric position of an integrated body in the J2000 ecliptic frame, AU. */
export function integratedPosition(body: IntegratedBody, jdTt: number): [number, number, number] {
  const table = tableOf(body)
  // A day of slack: light-time and rounding to whole days reach slightly past the table.
  const [first, last] = integratedRange(body)
  if (!(jdTt >= first - 1 && jdTt <= last + 1)) {
    throw new RangeError(`${body} is available for Julian days ${first} to ${last} (TT), got ${jdTt}`)
  }

  const day = Math.round(jdTt)
  const entry = integrationAt(table, day)

  // Carry the state over the remaining fraction of a day along its local parabola.
  const p = 6 * table.bodies.indexOf(body)
  const dt = jdTt - day
  const centre = innerBarycentre(jdTt)
  const position: [number, number, number] = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    position[i] = entry.state[p + i] + dt * entry.state[p + 3 + i] + (dt * dt / 2) * entry.rate[p + 3 + i] + centre[i]
  }
  return position
}
