/**
 * The outer solar system by numerical integration: Jupiter, Saturn, Uranus,
 * Neptune, Pluto and Chiron.
 *
 * Rather than a long analytical series per planet, a table holds their
 * positions and velocities at epochs decades apart ("checkpoints", derived
 * from JPL Horizons), and Newton's equations of motion carry all of them
 * together from the nearest checkpoint to the requested date. Checkpoints keep
 * each integration short, so its errors never accumulate.
 *
 * The integration runs in the J2000 ecliptic frame about the common centre of
 * mass of the Sun and the four inner planets. From Jupiter outwards these act
 * almost as a single body, which removes their fast orbits from the problem;
 * what remains of their influence, the flattening of that combined mass along
 * the ecliptic, is included as an orbit-averaged quadrupole.
 */
import { heliocentricState } from './planets.ts'
import type { State } from './planets.ts'

export type IntegratedBody = 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto' | 'Chiron'

/** A table of states at equally spaced epochs: six numbers per body per epoch. */
export interface CheckpointTable {
  /** Julian day (TT) of the first checkpoint. */
  readonly epoch: number
  /** Days between checkpoints. */
  readonly interval: number
  readonly bodies: readonly IntegratedBody[]
  readonly states: readonly number[]
}

/**
 * Gravitational parameters GM in AU³/day², from the header of the JPL DE440
 * ephemeris (Park et al. 2021, Astron. J. 161, 105). Planets include their
 * satellites; Chiron is treated as massless.
 */
const GM_SUN = 2.9591220828411956e-4
const GM: Record<IntegratedBody, number> = {
  Jupiter: 2.825345825225792e-7,
  Saturn: 8.45970599337629e-8,
  Uranus: 1.29202656496824e-8,
  Neptune: 1.524357347885194e-8,
  Pluto: 2.175096464893358e-12,
  Chiron: 0,
}

/** Inner planets: GM (AU³/day²), semi-major axis (AU) and eccentricity at J2000. */
const INNER = [
  { planet: 'Mercury', gm: 4.912500194889318e-11, a: 0.387098, e: 0.20563 },
  { planet: 'Venus', gm: 7.243452332644119e-10, a: 0.723332, e: 0.006772 },
  { planet: 'Earth', gm: 8.997011392947347e-10, a: 1.000001, e: 0.016709 }, // Earth and Moon
  { planet: 'Mars', gm: 9.549548829725812e-11, a: 1.523679, e: 0.093401 },
] as const

const GM_CENTRE = GM_SUN + INNER.reduce((sum, { gm }) => sum + gm, 0)
/**
 * Quadrupole of the inner planets, each smeared along its orbit: the sum of
 * GM times the mean square orbital radius a²(1 + 3e²/2), in AU⁵/day².
 */
const QUADRUPOLE = INNER.reduce((sum, { gm, a, e }) => sum + gm * a * a * (1 + 1.5 * e * e), 0)

/** Longest integration step, days: about 1/430 of Jupiter's period. */
const MAX_STEP = 10
/**
 * VSOP87 terms below this amplitude (AU) are skipped when locating the centre:
 * the inner planets displace it by a few millionths of an AU in total.
 */
const CENTRE_CUTOFF = 1e-4

/**
 * Position and velocity of the centre of mass of the Sun and inner planets,
 * relative to the Sun.
 */
export function innerBarycentre(jdTt: number, cutoff = CENTRE_CUTOFF): State {
  const centre: State = [0, 0, 0, 0, 0, 0]
  for (const { planet, gm } of INNER) {
    const state = heliocentricState(planet, jdTt, cutoff)
    for (let i = 0; i < 6; i++) centre[i] += (gm / GM_CENTRE) * state[i]
  }
  return centre
}

/**
 * Time derivative of the system state `y` (per body: position, velocity),
 * i.e. velocities and accelerations.
 */
function derivative(y: Float64Array, bodies: readonly IntegratedBody[]): Float64Array {
  const dy = new Float64Array(y.length)
  for (let i = 0; i < bodies.length; i++) {
    const p = 6 * i
    const x = y[p]
    const yy = y[p + 1]
    const z = y[p + 2]
    dy[p] = y[p + 3]
    dy[p + 1] = y[p + 4]
    dy[p + 2] = y[p + 5]

    // Attraction between the centre and the body itself, with the quadrupole of the centre.
    const r2 = x * x + yy * yy + z * z
    const r = Math.sqrt(r2)
    const monopole = -(GM_CENTRE + GM[bodies[i]]) / (r2 * r)
    const quadrupole = -0.75 * QUADRUPOLE / (r2 * r2 * r)
    const tilt = 5 * z * z / r2
    let ax = x * (monopole + quadrupole * (1 - tilt))
    let ay = yy * (monopole + quadrupole * (1 - tilt))
    let az = z * (monopole + quadrupole * (3 - tilt))

    // Every other massive body pulls on this one directly, and on the centre (the indirect term).
    for (let j = 0; j < bodies.length; j++) {
      const gm = GM[bodies[j]]
      if (j === i || gm === 0) continue
      const sx = y[6 * j]
      const sy = y[6 * j + 1]
      const sz = y[6 * j + 2]
      const dx = sx - x
      const dyy = sy - yy
      const dz = sz - z
      const direct = gm / Math.hypot(dx, dyy, dz) ** 3
      const indirect = gm / Math.hypot(sx, sy, sz) ** 3
      ax += direct * dx - indirect * sx
      ay += direct * dyy - indirect * sy
      az += direct * dz - indirect * sz
    }
    dy[p + 3] = ax
    dy[p + 4] = ay
    dy[p + 5] = az
  }
  return dy
}

function advance(y: Float64Array, dy: Float64Array, factor: number): Float64Array {
  const result = new Float64Array(y.length)
  for (let i = 0; i < y.length; i++) result[i] = y[i] + factor * dy[i]
  return result
}

/**
 * Integrate a system from its checkpoint nearest to `jdTt` with the classical
 * fourth-order Runge–Kutta method.
 *
 * @returns the state at `jdTt` and its time derivative there.
 */
export function integrate(table: CheckpointTable, jdTt: number): { state: Float64Array; rate: Float64Array } {
  const { bodies } = table
  const width = 6 * bodies.length
  const last = table.states.length / width - 1
  const index = Math.min(last, Math.max(0, Math.round((jdTt - table.epoch) / table.interval)))
  const start = table.epoch + index * table.interval
  let y = Float64Array.from(table.states.slice(index * width, (index + 1) * width))

  const steps = Math.ceil(Math.abs(jdTt - start) / MAX_STEP)
  const h = steps > 0 ? (jdTt - start) / steps : 0
  for (let step = 0; step < steps; step++) {
    const k1 = derivative(y, bodies)
    const k2 = derivative(advance(y, k1, h / 2), bodies)
    const k3 = derivative(advance(y, k2, h / 2), bodies)
    const k4 = derivative(advance(y, k3, h), bodies)
    const next = new Float64Array(width)
    for (let i = 0; i < width; i++) next[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])
    y = next
  }
  return { state: y, rate: derivative(y, bodies) }
}
