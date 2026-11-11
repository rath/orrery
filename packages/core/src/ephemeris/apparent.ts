/**
 * Apparent geocentric positions: where a body is seen from the centre of the
 * Earth, on the ecliptic and equinox of date.
 *
 * Starting from positions in the fixed frame of J2000, three effects of light
 * are applied — its travel time, its bending by the Sun and the aberration
 * caused by the Earth's own motion — before the frame is turned to the
 * ecliptic of date.
 */
import { eclipticOfDateMatrix, meanLunarNode, normalizeRadians, nutation, rotate } from './frames.ts'
import type { Vector3 } from './frames.ts'
import { moonPosition } from './moon.ts'
import { integratedPosition } from './outer.ts'
import type { IntegratedBody } from './outer.ts'
import { heliocentricState } from './planets.ts'
import type { State, Vsop87Planet } from './planets.ts'
import { centuriesSinceJ2000 } from './time.ts'

export type Body =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn'
  | 'Uranus' | 'Neptune' | 'Pluto' | 'Chiron' | 'MeanNode'

/** Speed of light, AU/day (299 792.458 km/s). */
const LIGHT_SPEED = 173.1446326846693
/** Twice the Sun's gravitational radius GM/c², AU: the scale of light bending. */
const SOLAR_DEFLECTION = 1.97412574336e-8
/** Radius of the Sun, AU (695 700 km). */
const SOLAR_RADIUS = 0.00465047

const INTEGRATED: ReadonlySet<string> = new Set<IntegratedBody>(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron'])

const norm = (v: Vector3) => Math.hypot(v[0], v[1], v[2])
const dot = (a: Vector3, b: Vector3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

function heliocentricPosition(body: Exclude<Body, 'Sun' | 'Moon' | 'MeanNode'>, jdTt: number): Vector3 {
  if (INTEGRATED.has(body)) return integratedPosition(body as IntegratedBody, jdTt)
  const state = heliocentricState(body as Vsop87Planet, jdTt)
  return [state[0], state[1], state[2]]
}

/**
 * Astrometric geocentric position in the J2000 ecliptic frame, AU: the body
 * where it was when the light now reaching the Earth left it.
 */
export function astrometricPosition(body: Exclude<Body, 'MeanNode'>, jdTt: number, earth = heliocentricState('Earth', jdTt)): Vector3 {
  if (body === 'Moon') {
    // The Moon is given relative to the Earth, which moved on while the light (1.3 s) was under way.
    const lightTime = norm(moonPosition(jdTt)) / LIGHT_SPEED
    const moon = moonPosition(jdTt - lightTime)
    return [moon[0] - lightTime * earth[3], moon[1] - lightTime * earth[4], moon[2] - lightTime * earth[5]]
  }
  if (body === 'Sun') return [-earth[0], -earth[1], -earth[2]]

  let position: Vector3 = [0, 0, 0]
  let lightTime = 0
  for (let iteration = 0; iteration < 3; iteration++) {
    const sunToBody = heliocentricPosition(body, jdTt - lightTime)
    position = [sunToBody[0] - earth[0], sunToBody[1] - earth[1], sunToBody[2] - earth[2]]
    lightTime = norm(position) / LIGHT_SPEED
  }
  return position
}

/**
 * Bend the direction to a body by the Sun's gravity (first post-Newtonian
 * order). A body hidden behind the solar disc is left where it is, as in the
 * JPL ephemerides: its light does not reach the Earth at all.
 */
function deflect(position: Vector3, earth: State): Vector3 {
  const distance = norm(position)
  const sunToEarth: Vector3 = [earth[0], earth[1], earth[2]]
  const sunToBody: Vector3 = [position[0] + earth[0], position[1] + earth[1], position[2] + earth[2]]
  const earthDistance = norm(sunToEarth)
  const bodyDistance = norm(sunToBody)

  const p: Vector3 = [position[0] / distance, position[1] / distance, position[2] / distance]
  const e: Vector3 = [sunToEarth[0] / earthDistance, sunToEarth[1] / earthDistance, sunToEarth[2] / earthDistance]
  const q: Vector3 = [sunToBody[0] / bodyDistance, sunToBody[1] / bodyDistance, sunToBody[2] / bodyDistance]

  const pq = dot(p, q)
  const ep = dot(e, p)
  // The line of sight passes the Sun's centre at earthDistance·sin(elongation), cos(elongation) = −e·p.
  const behindSun = -ep * distance > earthDistance
  if (behindSun && earthDistance * Math.sqrt(Math.max(0, 1 - ep * ep)) < SOLAR_RADIUS) return position

  const scale = SOLAR_DEFLECTION / earthDistance / (1 + dot(q, e))
  return [
    distance * (p[0] + scale * (pq * e[0] - ep * q[0])),
    distance * (p[1] + scale * (pq * e[1] - ep * q[1])),
    distance * (p[2] + scale * (pq * e[2] - ep * q[2])),
  ]
}

/** Shift the direction to a body by the aberration due to the observer's velocity (AU/day). */
function aberrate(position: Vector3, earth: State): Vector3 {
  const distance = norm(position)
  return [
    position[0] + distance * earth[3] / LIGHT_SPEED,
    position[1] + distance * earth[4] / LIGHT_SPEED,
    position[2] + distance * earth[5] / LIGHT_SPEED,
  ]
}

export interface ApparentPosition {
  /** Ecliptic longitude from the true equinox of date, radians in [0, 2π). */
  longitude: number
  /** Ecliptic latitude, radians. */
  latitude: number
}

/** Apparent geocentric ecliptic longitude and latitude of date, at a Terrestrial Time instant. */
export function apparentPosition(body: Body, jdTt: number): ApparentPosition {
  const t = centuriesSinceJ2000(jdTt)
  const equinoxShift = nutation(t).longitude
  if (body === 'MeanNode') {
    return { longitude: normalizeRadians(meanLunarNode(t) + equinoxShift), latitude: 0 }
  }

  const earth = heliocentricState('Earth', jdTt)
  let position = astrometricPosition(body, jdTt, earth)
  if (body !== 'Sun') position = deflect(position, earth)
  position = aberrate(position, earth)

  // Nutation turns the equinox along the ecliptic and leaves ecliptic latitudes untouched.
  const [x, y, z] = rotate(eclipticOfDateMatrix(t), position)
  return {
    longitude: normalizeRadians(Math.atan2(y, x) + equinoxShift),
    latitude: Math.atan2(z, Math.hypot(x, y)),
  }
}
