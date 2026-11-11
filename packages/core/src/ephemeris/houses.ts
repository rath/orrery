/**
 * House systems: ways of dividing the sky around an observer into twelve
 * sectors, each beginning at a point of the ecliptic called a cusp.
 *
 * Every system here follows from its geometric definition on the celestial
 * sphere; the constructions are summarised next to each function.
 */
import { DEG, normalizeRadians } from './frames.ts'

/**
 * P Placidus, K Koch, O Porphyry, R Regiomontanus, C Campanus, E Equal,
 * W Whole Sign, B Alcabitius, M Morinus, T Topocentric (Polich–Page).
 */
export type HouseSystem = 'P' | 'K' | 'O' | 'R' | 'C' | 'E' | 'W' | 'B' | 'M' | 'T'

export interface Houses {
  /** The system actually used, which is Porphyry where the requested one is undefined. */
  system: HouseSystem
  /** Ecliptic longitudes of the twelve cusps in degrees; `cusps[0]` opens the first house. */
  cusps: number[]
  /** Ascendant: the degree of the ecliptic rising on the eastern horizon. */
  ascendant: number
  /** Midheaven: the degree of the ecliptic on the upper meridian. */
  midheaven: number
  /** Right ascension of the meridian (local sidereal time), degrees. */
  ramc: number
  /** True obliquity of the ecliptic, degrees. */
  obliquity: number
}

const HALF_PI = Math.PI / 2
const THIRD = Math.PI / 6 // 30°

/** The six cusps that define a chart; the other six lie opposite. */
interface Quadrants {
  c10: number
  c11: number
  c12: number
  c1: number
  c2: number
  c3: number
}

/**
 * Longitude of the ecliptic point rising where the celestial pole stands
 * `pole` above the horizon, at sidereal time `ra`. With the geographic
 * latitude as the pole this is the Ascendant.
 */
function risingPoint(ra: number, pole: number, obliquity: number): number {
  return Math.atan2(Math.cos(ra), -(Math.sin(ra) * Math.cos(obliquity) + Math.tan(pole) * Math.sin(obliquity)))
}

/** Longitude of the ecliptic point with right ascension `ra`. With the RAMC this is the Midheaven. */
function onHourCircle(ra: number, obliquity: number): number {
  return Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(obliquity))
}

/** Declination of the ecliptic point at `longitude`. */
function declination(longitude: number, obliquity: number): number {
  return Math.asin(Math.sin(obliquity) * Math.sin(longitude))
}

/**
 * Half the arc a point of declination `dec` describes above the horizon, as an
 * angle of the Earth's rotation. Clamped for points that graze the horizon.
 */
function semiDiurnalArc(dec: number, latitude: number): number {
  return Math.acos(Math.min(1, Math.max(-1, -Math.tan(latitude) * Math.tan(dec))))
}

/** Porphyry: each quadrant between the angles is cut into three equal arcs of the ecliptic. */
function porphyry(asc: number, mc: number): Quadrants {
  const upper = normalizeRadians(asc - mc)
  const lower = Math.PI - upper
  return { c10: mc, c11: mc + upper / 3, c12: mc + 2 * upper / 3, c1: asc, c2: asc + lower / 3, c3: asc + 2 * lower / 3 }
}

/**
 * Placidus: a cusp is the ecliptic point that has completed one or two thirds
 * of its own semi-arc — above the horizon counted from the meridian for houses
 * 11 and 12, below it counted from the lower meridian for houses 2 and 3. The
 * semi-arc depends on the unknown point itself, hence the iteration.
 */
function placidus(ramc: number, obliquity: number, latitude: number, asc: number, mc: number): Quadrants {
  const cusp = (fraction: number, below: boolean) => {
    let ra = ramc + (below ? Math.PI - fraction * HALF_PI : fraction * HALF_PI)
    let longitude = 0
    for (let iteration = 0; iteration < 100; iteration++) {
      longitude = onHourCircle(ra, obliquity)
      const arc = semiDiurnalArc(declination(longitude, obliquity), latitude)
      const next = ramc + (below ? Math.PI - fraction * (Math.PI - arc) : fraction * arc)
      if (Math.abs(next - ra) < 1e-12) break
      ra = next
    }
    return longitude
  }
  return { c10: mc, c11: cusp(1 / 3, false), c12: cusp(2 / 3, false), c1: asc, c2: cusp(2 / 3, true), c3: cusp(1 / 3, true) }
}

/**
 * Koch: the time the Midheaven degree took to climb from the horizon to the
 * meridian is cut into three; the cusps are the Ascendants of those moments,
 * continued at the same pace below the horizon.
 */
function koch(ramc: number, obliquity: number, latitude: number, asc: number, mc: number): Quadrants {
  const arc = semiDiurnalArc(declination(mc, obliquity), latitude)
  const ascendantAt = (thirds: number) => risingPoint(ramc + (thirds / 3) * arc, latitude, obliquity)
  return { c10: mc, c11: ascendantAt(-2), c12: ascendantAt(-1), c1: asc, c2: ascendantAt(1), c3: ascendantAt(2) }
}

/**
 * Regiomontanus, Campanus and Topocentric draw house circles through the north
 * and south points of the horizon. Such a circle is the horizon of some other
 * place, so its cusp is that place's Ascendant: `offset` is where the circle
 * meets the equator, measured from the meridian, and `pole` the height of the
 * celestial pole above it.
 */
function byHouseCircles(
  ramc: number, obliquity: number, asc: number, mc: number,
  circle: (step: number) => { offset: number; pole: number },
): Quadrants {
  const cusp = (step: number) => {
    const { offset, pole } = circle(step)
    return risingPoint(ramc + offset - HALF_PI, pole, obliquity)
  }
  return { c10: mc, c11: cusp(1), c12: cusp(2), c1: asc, c2: cusp(4), c3: cusp(5) }
}

/**
 * Alcabitius: the Ascendant's arcs above and below the horizon are each cut
 * into three along the equator, and the division points carried to the
 * ecliptic along hour circles.
 */
function alcabitius(ramc: number, obliquity: number, latitude: number, asc: number, mc: number): Quadrants {
  const above = semiDiurnalArc(declination(asc, obliquity), latitude)
  const below = Math.PI - above
  const cusp = (ra: number) => onHourCircle(ra, obliquity)
  return {
    c10: mc,
    c11: cusp(ramc + above / 3),
    c12: cusp(ramc + 2 * above / 3),
    c1: asc,
    c2: cusp(ramc + above + below / 3),
    c3: cusp(ramc + above + 2 * below / 3),
  }
}

/**
 * Morinus: the equator is cut into twelve equal arcs from the meridian, and the
 * division points carried to the ecliptic along circles through its poles. The
 * cusps of houses 1 and 10 therefore differ from the Ascendant and Midheaven.
 */
function morinus(ramc: number, obliquity: number): Quadrants {
  const cusp = (step: number) => {
    const ra = ramc + step * THIRD
    return Math.atan2(Math.sin(ra) * Math.cos(obliquity), Math.cos(ra))
  }
  return { c10: cusp(0), c11: cusp(1), c12: cusp(2), c1: cusp(3), c2: cusp(4), c3: cusp(5) }
}

/** Equal houses: 30° each, the first starting at `start`. */
function equal(start: number): Quadrants {
  return { c10: start + 9 * THIRD, c11: start + 10 * THIRD, c12: start + 11 * THIRD, c1: start, c2: start + THIRD, c3: start + 2 * THIRD }
}

/**
 * House cusps and angles.
 *
 * @param ramc      Local apparent sidereal time, radians.
 * @param obliquity True obliquity of the ecliptic, radians.
 * @param latitude  Geographic latitude, radians (north positive).
 */
export function houses(ramc: number, obliquity: number, latitude: number, system: HouseSystem): Houses {
  const upperMeridian = normalizeRadians(onHourCircle(ramc, obliquity))
  const eastHorizon = normalizeRadians(risingPoint(ramc, latitude, obliquity))
  // Inside the polar circles the horizon can cross the ecliptic behind the meridian, so that
  // the houses would run backwards. By convention the Ascendant is then the opposite crossing.
  const reversed = normalizeRadians(eastHorizon - upperMeridian) > Math.PI
  const asc = reversed ? normalizeRadians(eastHorizon + Math.PI) : eastHorizon
  let mc = upperMeridian

  // Placidus and Koch need every ecliptic degree to rise and set, which fails beyond the polar circles.
  const polar = Math.abs(latitude) + obliquity >= HALF_PI
  const used: HouseSystem = polar && (system === 'P' || system === 'K') ? 'O' : system

  // The systems built on house circles are rigid figures: when reversed they are
  // turned half a circle as a whole, Midheaven included.
  const houseCircles = (circle: (step: number) => { offset: number; pole: number }): Quadrants => {
    const figure = byHouseCircles(ramc, obliquity, eastHorizon, upperMeridian, circle)
    if (!reversed) return figure
    mc = normalizeRadians(upperMeridian + Math.PI)
    const turn = (cusp: number) => cusp + Math.PI
    return { c10: turn(figure.c10), c11: turn(figure.c11), c12: turn(figure.c12), c1: asc, c2: turn(figure.c2), c3: turn(figure.c3) }
  }

  let quadrants: Quadrants
  switch (used) {
    case 'P':
      quadrants = placidus(ramc, obliquity, latitude, asc, mc)
      break
    case 'K':
      quadrants = koch(ramc, obliquity, latitude, asc, mc)
      break
    case 'O':
      quadrants = porphyry(asc, mc)
      break
    case 'R':
      // The equator is cut into equal 30° arcs.
      quadrants = houseCircles(step => ({
        offset: step * THIRD,
        pole: Math.atan(Math.tan(latitude) * Math.sin(step * THIRD)),
      }))
      break
    case 'C':
      // The prime vertical is cut into equal 30° arcs, counted from the zenith.
      quadrants = houseCircles(step => ({
        offset: Math.atan2(Math.sin(step * THIRD) * Math.cos(latitude), Math.cos(step * THIRD)),
        pole: Math.asin(Math.sin(latitude) * Math.sin(step * THIRD)),
      }))
      break
    case 'T':
      // Equal arcs of the equator, with the tangent of the pole growing by thirds.
      quadrants = houseCircles(step => ({
        offset: step * THIRD,
        pole: Math.atan(Math.tan(latitude) * (step <= 3 ? step : 6 - step) / 3),
      }))
      break
    case 'B':
      quadrants = alcabitius(ramc, obliquity, latitude, asc, mc)
      break
    case 'M':
      quadrants = morinus(ramc, obliquity)
      break
    case 'E':
      quadrants = equal(asc)
      break
    case 'W':
      quadrants = equal(Math.floor(asc / THIRD) * THIRD)
      break
    default:
      throw new RangeError(`Unsupported house system: ${String(system)}`)
  }

  const { c10, c11, c12, c1, c2, c3 } = quadrants
  const half = [c1, c2, c3, c10 + Math.PI, c11 + Math.PI, c12 + Math.PI]
  const cusps = [...half, ...half.map(cusp => cusp + Math.PI)].map(cusp => normalizeRadians(cusp) / DEG)
  return {
    system: used,
    cusps,
    ascendant: asc / DEG,
    midheaven: mc / DEG,
    ramc: normalizeRadians(ramc) / DEG,
    obliquity: obliquity / DEG,
  }
}
