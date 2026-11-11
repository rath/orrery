import { describe, expect, it } from 'vitest'
import { apparentPosition } from '../src/ephemeris/apparent.ts'
import { CHIRON_CHECKPOINTS, OUTER_CHECKPOINTS } from '../src/ephemeris/data/checkpoints.ts'
import { DELTA_T_FIRST_YEAR, DELTA_T_YEARLY } from '../src/ephemeris/data/delta-t.ts'
import {
  DEG, eclipticOfDateMatrix, greenwichApparentSiderealTime, meanObliquity, nutation, rotate,
} from '../src/ephemeris/frames.ts'
import { houses } from '../src/ephemeris/houses.ts'
import type { HouseSystem } from '../src/ephemeris/houses.ts'
import {
  CHIRON_END, CHIRON_START, EPHEMERIS_END, EPHEMERIS_START, eclipticPosition, housesAt, isAvailable, julianDay,
} from '../src/ephemeris/index.ts'
import { integrate } from '../src/ephemeris/integrator.ts'
import type { CheckpointTable } from '../src/ephemeris/integrator.ts'
import { integratedPosition } from '../src/ephemeris/outer.ts'
import { heliocentricState } from '../src/ephemeris/planets.ts'
import { deltaT } from '../src/ephemeris/time.ts'

const ARCSEC = DEG / 3600
const separation = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)

describe('julianDay', () => {
  it('matches known epochs of the proleptic Gregorian calendar', () => {
    expect(julianDay(2000, 1, 1, 12)).toBe(2451545)
    expect(julianDay(1900, 1, 1)).toBe(2415020.5)
    expect(julianDay(1970, 1, 1)).toBe(2440587.5) // Unix epoch
    expect(julianDay(1, 1, 1)).toBe(1721425.5)
    expect(julianDay(1858, 11, 17)).toBe(2400000.5) // origin of the Modified Julian Date
  })

  it('applies the Gregorian leap-year rule', () => {
    expect(julianDay(2024, 3, 1) - julianDay(2024, 2, 28)).toBe(2)
    expect(julianDay(1900, 3, 1) - julianDay(1900, 2, 28)).toBe(1)
    expect(julianDay(2000, 3, 1) - julianDay(2000, 2, 28)).toBe(2)
  })
})

describe('deltaT', () => {
  const tableEnd = DELTA_T_FIRST_YEAR + DELTA_T_YEARLY.length - 1

  it('reproduces observed values', () => {
    // U.S. Naval Observatory: 63.83 s at 2000.0, 29.15 s at 1950.0, −2.70 s at 1900.0.
    expect(deltaT(julianDay(2000, 1, 1))).toBeCloseTo(63.83, 1)
    expect(deltaT(julianDay(1950, 1, 1))).toBeCloseTo(29.15, 1)
    expect(deltaT(julianDay(1900, 1, 1))).toBeCloseTo(-2.7, 1)
  })

  it('follows the historical record before 1900', () => {
    // Espenak & Meeus (2006), Table 1 and polynomial expressions.
    expect(deltaT(julianDay(1800, 1, 1))).toBeCloseTo(13.7, 0)
    expect(deltaT(julianDay(1700, 1, 1))).toBeCloseTo(8.8, 0)
    expect(Math.abs(deltaT(julianDay(1000, 1, 1)) - 1574)).toBeLessThan(5)
    expect(Math.abs(deltaT(julianDay(1, 1, 1)) - 10570)).toBeLessThan(40)
  })

  it('is continuous where its pieces join', () => {
    for (const year of [500, 1600, 1700, 1800, 1860, 1900, tableEnd, tableEnd + 150]) {
      const jd = julianDay(year, 1, 1)
      expect(Math.abs(deltaT(jd + 1) - deltaT(jd - 1))).toBeLessThan(0.5)
    }
  })

  it('leaves the observations smoothly and grows towards the tidal trend', () => {
    const at = (year: number) => deltaT(julianDay(year, 1, 1))
    expect(Math.abs(at(tableEnd + 1) - at(tableEnd))).toBeLessThan(0.5)
    for (let year = tableEnd; year < 3000; year += 10) expect(at(year + 10)).toBeGreaterThan(at(year))
    // −20 + 32·((y − 1820)/100)² seconds (Morrison & Stephenson 2004).
    expect(at(2500)).toBeCloseTo(-20 + 32 * 6.8 ** 2, 0)
  })
})

describe('reference frames', () => {
  it('has the IAU 2006 obliquity at J2000', () => {
    expect(meanObliquity(0) / ARCSEC).toBeCloseTo(84381.406, 6)
  })

  it('gives the nutation at J2000', () => {
    // 2000-01-01 12:00 TT: Δψ = −13.93″, Δε = −5.77″ (Astronomical Almanac).
    const { longitude, obliquity } = nutation(0)
    expect(longitude / ARCSEC).toBeCloseTo(-13.93, 1)
    expect(obliquity / ARCSEC).toBeCloseTo(-5.77, 1)
  })

  it('gives Greenwich sidereal time at J2000', () => {
    // Mean sidereal time at 2000-01-01 12:00 UT1 is 18h 41m 50.548s = 280.46062°.
    const equationOfEquinoxes = nutation(0).longitude * Math.cos(meanObliquity(0))
    const mean = (greenwichApparentSiderealTime(2451545, 0) - equationOfEquinoxes) / DEG
    expect(mean).toBeCloseTo(280.46062, 4)
  })

  it('precesses by a pure rotation, about 1.4° per century along the ecliptic', () => {
    for (const t of [-20, -1, 0, 1, 10]) {
      const m = eclipticOfDateMatrix(t)
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const dot = m[3 * i] * m[3 * j] + m[3 * i + 1] * m[3 * j + 1] + m[3 * i + 2] * m[3 * j + 2]
          expect(dot).toBeCloseTo(i === j ? 1 : 0, 6)
        }
      }
    }
    // After a century the J2000 equinox has gained the general precession in longitude,
    // p_A = 5028.796″ + 1.105″ (Capitaine et al. 2003).
    const [x, y] = rotate(eclipticOfDateMatrix(1), [1, 0, 0])
    expect(Math.atan2(y, x) / DEG).toBeCloseTo((5028.796 + 1.105) / 3600, 3)
  })
})

describe('houses', () => {
  const OBLIQUITY = 23.4375 * DEG
  const SYSTEMS: HouseSystem[] = ['P', 'K', 'O', 'R', 'C', 'E', 'W', 'B', 'M', 'T']

  it('puts 0° Aries on the Ascendant when 0° Capricorn culminates', () => {
    for (const latitude of [-45, 0, 37.5, 60]) {
      const result = houses(270 * DEG, OBLIQUITY, latitude * DEG, 'P')
      expect(separation(result.midheaven, 270)).toBeLessThan(1e-9)
      expect(separation(result.ascendant, 0)).toBeLessThan(1e-9)
    }
  })

  it('places opposite cusps 180° apart and keeps the houses in zodiacal order', () => {
    for (const system of SYSTEMS) {
      for (const ramc of [10, 95, 200, 310]) {
        const { cusps } = houses(ramc * DEG, OBLIQUITY, 48 * DEG, system)
        expect(cusps).toHaveLength(12)
        for (let i = 0; i < 6; i++) expect(separation(cusps[i] + 180, cusps[i + 6])).toBeLessThan(1e-9)
        const total = cusps.reduce((sum, cusp, i) => sum + ((cusps[(i + 1) % 12] - cusp + 360) % 360), 0)
        expect(total).toBeCloseTo(360, 6)
      }
    }
  })

  it('opens the first house at the Ascendant and the tenth at the Midheaven in quadrant systems', () => {
    for (const system of ['P', 'K', 'O', 'R', 'C', 'B', 'T'] as const) {
      const result = houses(123 * DEG, OBLIQUITY, 52 * DEG, system)
      expect(separation(result.cusps[0], result.ascendant)).toBeLessThan(1e-9)
      expect(separation(result.cusps[9], result.midheaven)).toBeLessThan(1e-9)
    }
  })

  it('divides Equal and Whole Sign houses into 30° steps', () => {
    const equal = houses(123 * DEG, OBLIQUITY, 52 * DEG, 'E')
    const whole = houses(123 * DEG, OBLIQUITY, 52 * DEG, 'W')
    for (let i = 0; i < 12; i++) {
      expect(separation(equal.cusps[i], equal.ascendant + 30 * i)).toBeLessThan(1e-9)
      expect(separation(whole.cusps[i], Math.round(whole.cusps[i] / 30) * 30)).toBeLessThan(1e-9)
    }
    expect(whole.cusps[0]).toBeCloseTo(Math.floor(whole.ascendant / 30) * 30, 9)
  })

  it('agrees across all quadrant systems on the equator at the equinox point', () => {
    // With 0° Aries rising at the equator every construction meets the same great circles.
    const reference = houses(270 * DEG, OBLIQUITY, 0, 'O')
    for (const system of ['R', 'C', 'T'] as const) {
      const result = houses(270 * DEG, OBLIQUITY, 0, system)
      result.cusps.forEach((cusp, i) => expect(separation(cusp, reference.cusps[i])).toBeLessThan(3))
    }
  })

  it('falls back to Porphyry for Placidus and Koch inside the polar circles', () => {
    for (const latitude of [70, -70, 89]) {
      expect(houses(1, OBLIQUITY, latitude * DEG, 'P').system).toBe('O')
      expect(houses(1, OBLIQUITY, latitude * DEG, 'K').system).toBe('O')
      expect(houses(1, OBLIQUITY, latitude * DEG, 'R').system).toBe('R')
    }
    expect(houses(1, OBLIQUITY, 66 * DEG, 'P').system).toBe('P')
  })

  it('keeps the houses in order inside the polar circles', () => {
    for (let ramc = 0; ramc < 360; ramc += 15) {
      for (const latitude of [-80, -70, 70, 80]) {
        // Where the horizon crosses the ecliptic behind the meridian, the Ascendant is
        // taken on the opposite side, so that it stays ahead of the Midheaven ...
        const porphyry = houses(ramc * DEG, OBLIQUITY, latitude * DEG, 'O')
        const upperMeridian = porphyry.midheaven
        for (const system of ['O', 'E', 'W', 'B', 'M'] as const) {
          const result = houses(ramc * DEG, OBLIQUITY, latitude * DEG, system)
          expect(result.ascendant).toBeCloseTo(porphyry.ascendant, 9)
          expect(result.midheaven).toBeCloseTo(upperMeridian, 9)
          expect((result.ascendant - result.midheaven + 360) % 360).toBeLessThanOrEqual(180)
        }
        // ... while the systems built on house circles turn as a whole, Midheaven included.
        for (const system of ['R', 'C', 'T'] as const) {
          const result = houses(ramc * DEG, OBLIQUITY, latitude * DEG, system)
          expect(result.ascendant).toBeCloseTo(porphyry.ascendant, 9)
          expect(separation(result.cusps[0], result.ascendant)).toBeLessThan(1e-9)
          expect(separation(result.cusps[9], result.midheaven)).toBeLessThan(1e-9)
          const turned = separation(result.midheaven, upperMeridian)
          expect(Math.min(turned, 180 - turned)).toBeLessThan(1e-9)
        }
      }
    }
  })

  it('rejects an unknown system', () => {
    expect(() => houses(0, OBLIQUITY, 0, 'X' as HouseSystem)).toThrow(RangeError)
  })
})

describe('numerical integration of the outer planets', () => {
  /** A table holding only checkpoint `index`, so that the integration must start there. */
  const only = (table: CheckpointTable, index: number): CheckpointTable => {
    const width = 6 * table.bodies.length
    return {
      ...table,
      epoch: table.epoch + index * table.interval,
      states: table.states.slice(index * width, (index + 1) * width),
    }
  }

  it('meets halfway between neighbouring checkpoints', () => {
    // Forwards from one checkpoint and backwards from the next must agree: this bounds
    // the error of every integration, which never runs further than that midpoint.
    // Limits in AU; at Jupiter's distance from the Earth 4·10⁻⁶ AU subtends 0.2″.
    const LIMIT = { Jupiter: 4e-6, Saturn: 2e-6, Uranus: 1e-6, Neptune: 1e-6, Pluto: 2e-6, Chiron: 2e-7 }
    for (const table of [OUTER_CHECKPOINTS, CHIRON_CHECKPOINTS]) {
      const count = table.states.length / (6 * table.bodies.length)
      for (let index = 0; index + 1 < count; index += 5) {
        const middle = table.epoch + (index + 0.5) * table.interval
        const forwards = integrate(only(table, index), middle).state
        const backwards = integrate(only(table, index + 1), middle).state
        table.bodies.forEach((name, body) => {
          const gap = Math.hypot(...[0, 1, 2].map(axis => forwards[6 * body + axis] - backwards[6 * body + axis]))
          expect(gap).toBeLessThan(LIMIT[name])
        })
      }
    }
  })

  it('returns the same position whatever was computed before', () => {
    const jd = 2460000.25
    const first = integratedPosition('Pluto', jd)
    integratedPosition('Pluto', jd - 40000)
    integratedPosition('Chiron', jd + 3000)
    expect(integratedPosition('Pluto', jd)).toEqual(first)
  })

  it('is continuous across the whole-day steps of its cache', () => {
    for (const body of ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron'] as const) {
      const before = integratedPosition(body, 2451000.5 - 1e-7)
      const after = integratedPosition(body, 2451000.5 + 1e-7)
      const jump = Math.hypot(before[0] - after[0], before[1] - after[1], before[2] - after[2])
      expect(jump).toBeLessThan(1e-8) // AU; the motion itself over this interval is ~10⁻⁹ AU
    }
  })
})

describe('eclipticPosition', () => {
  it('reports plausible daily motions', () => {
    for (let month = 1; month <= 12; month++) {
      const jd = julianDay(2024, month, 15, 12)
      const sun = eclipticPosition('Sun', jd)
      const moon = eclipticPosition('Moon', jd)
      expect(sun.speed).toBeGreaterThan(0.95)
      expect(sun.speed).toBeLessThan(1.02)
      expect(moon.speed).toBeGreaterThan(11.7)
      expect(moon.speed).toBeLessThan(15.4)
      expect(Math.abs(sun.latitude)).toBeLessThan(0.001)
      expect(Math.abs(moon.latitude)).toBeLessThan(5.4)
    }
  })

  it('measures speed as the derivative of longitude', () => {
    for (const body of ['Moon', 'Mercury', 'Mars', 'Jupiter', 'Pluto', 'Chiron', 'MeanNode'] as const) {
      const jd = julianDay(1987, 6, 5, 3)
      const day = separation(eclipticPosition(body, jd + 0.5).longitude, eclipticPosition(body, jd - 0.5).longitude)
      expect(Math.abs(eclipticPosition(body, jd).speed)).toBeCloseTo(day, body === 'Moon' ? 1 : 3)
    }
  })

  it('shows Mercury retrograde in April 2024 and direct in June 2024', () => {
    // Mercury was retrograde from 1 to 25 April 2024.
    expect(eclipticPosition('Mercury', julianDay(2024, 4, 10)).speed).toBeLessThan(0)
    expect(eclipticPosition('Mercury', julianDay(2024, 6, 1)).speed).toBeGreaterThan(0)
  })

  it('keeps the mean node retrograde across 0°', () => {
    const start = julianDay(2006, 1, 1)
    for (let day = 0; day < 365; day += 5) {
      const { speed } = eclipticPosition('MeanNode', start + day)
      expect(speed).toBeLessThan(-0.04)
      expect(speed).toBeGreaterThan(-0.06)
    }
  })

  it('places the Sun at the equinox when spring begins', () => {
    // March equinox 2024: 20 March 03:06 UT (Astronomical Almanac).
    const { longitude } = eclipticPosition('Sun', julianDay(2024, 3, 20, 3 + 6 / 60))
    expect(separation(longitude, 0)).toBeLessThan(0.001)
  })

  it('shifts the Sun by the annual aberration', () => {
    // Seen from the moving Earth the Sun appears 20.5″ behind its geometric place.
    const jdTt = 2451545
    const earth = heliocentricState('Earth', jdTt)
    const geometric = rotate(eclipticOfDateMatrix(0), [-earth[0], -earth[1], -earth[2]])
    const geometricLongitude = Math.atan2(geometric[1], geometric[0]) + nutation(0).longitude
    const shift = (apparentPosition('Sun', jdTt).longitude - geometricLongitude) / ARCSEC
    expect(((shift % 1296000) + 1296000) % 1296000 - 1296000).toBeCloseTo(-20.5, 0)
  })
})

describe('coverage', () => {
  it('spans the years 1 to 3000', () => {
    expect(isAvailable('Sun', julianDay(1, 1, 1))).toBe(true)
    expect(isAvailable('Sun', julianDay(3000, 12, 31, 23.99))).toBe(true)
    expect(isAvailable('Sun', julianDay(3001, 1, 1))).toBe(false)
    expect(isAvailable('Sun', EPHEMERIS_START - 1e-6)).toBe(false)
    expect(isAvailable('Sun', EPHEMERIS_END)).toBe(false)
    expect(isAvailable('Moon', NaN)).toBe(false)
  })

  it('offers Chiron for 1900 to 2099 only', () => {
    expect(isAvailable('Chiron', CHIRON_START)).toBe(true)
    expect(isAvailable('Chiron', CHIRON_START - 1e-6)).toBe(false)
    expect(isAvailable('Chiron', CHIRON_END - 1e-6)).toBe(true)
    expect(isAvailable('Chiron', CHIRON_END)).toBe(false)
    expect(() => eclipticPosition('Chiron', julianDay(1899, 12, 31))).toThrow(RangeError)
    expect(() => eclipticPosition('Chiron', julianDay(2100, 1, 1))).toThrow(/Chiron \(years 1900–2099\)/)
  })

  it('computes every body at both ends of the range', () => {
    for (const jd of [EPHEMERIS_START, EPHEMERIS_END - 1e-6]) {
      for (const body of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'MeanNode'] as const) {
        const position = eclipticPosition(body, jd)
        expect(Number.isFinite(position.longitude + position.latitude + position.speed)).toBe(true)
      }
      expect(Number.isFinite(housesAt(jd, 37.5, 127, 'P').ascendant)).toBe(true)
    }
    for (const jd of [CHIRON_START, CHIRON_END - 1e-6]) {
      expect(Number.isFinite(eclipticPosition('Chiron', jd).longitude)).toBe(true)
    }
  })

  it('rejects dates outside the range for positions and houses', () => {
    for (const jd of [julianDay(3001, 1, 1), julianDay(-100, 1, 1), NaN]) {
      for (const body of ['Sun', 'Moon', 'Pluto', 'MeanNode'] as const) {
        expect(() => eclipticPosition(body, jd)).toThrow(RangeError)
      }
      expect(() => housesAt(jd, 37.5, 127, 'P')).toThrow(/outside the ephemeris range/)
    }
  })
})
