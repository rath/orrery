import { describe, expect, it } from 'vitest'
import { calcHouses, calcPlanet, julday } from '../src/ephemeris/index.ts'
import { CHIRON_JD_END, calcChiron, hasChironData } from '../src/ephemeris/chiron.ts'
import { MOSHLUEPH_END, MOSHLUEPH_START, calcMoon } from '../src/ephemeris/moon.ts'
import { calcMeanNodeFull } from '../src/ephemeris/node.ts'
import { MOSHPLEPH_END, MOSHPLEPH_START, moshplan } from '../src/ephemeris/planets.ts'
import { CHIRON_JD_START, CHIRON_JD_STEP, CHIRON_N, CHIRON_LON, CHIRON_SPEED } from '../src/ephemeris/tables/chiron-data.ts'
import {
  mer404, ven404, ear404, mar404, jup404, sat404, ura404, nep404, plu404,
} from '../src/ephemeris/tables/planet-coefficients.ts'
import { calculateNatal } from '../src/natal.ts'
import reference from './swiss-reference.json'

// Independent oracle: https://www.astro.com/swisseph/swephprg.htm
// Generated with pyswisseph, not this implementation. See JSON source metadata.
const distance = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)

describe('Swiss Ephemeris reference positions', () => {
  for (const fixture of reference.planets) {
    it(`apparent longitudes at ${fixture.year}-${fixture.month}-15 12:00 UT`, () => {
      const jd = julday(fixture.year, fixture.month, 15, 12)
      fixture.longitudes.forEach((longitude, body) => {
        expect(distance(calcPlanet(jd, body).longitude, longitude)).toBeLessThan(0.0003)
      })
    })
  }
  for (const fixture of reference.houses) {
    it(`${fixture.system} houses at ${fixture.year}-${fixture.month}, latitude ${fixture.lat}`, () => {
      const result = calcHouses(julday(fixture.year, fixture.month, 15, 12), fixture.lat, 127, fixture.system)
      result.cusps.slice(1).forEach((cusp, index) => {
        expect(distance(cusp, fixture.cusps[index])).toBeLessThan(0.004)
      })
      fixture.angles.forEach((angle, index) => {
        expect(distance(result.ascmc[index], angle)).toBeLessThan(0.004)
      })
    })
  }

  it('returns the final Chiron sample at the inclusive upper bound', () => {
    const result = calcChiron(CHIRON_JD_START + (CHIRON_N - 1) * CHIRON_JD_STEP)
    expect(result.longitude).toBeCloseTo(CHIRON_LON[CHIRON_N - 1], 7)
    expect(result.speed).toBeCloseTo(CHIRON_SPEED[CHIRON_N - 1], 7)
    expect(() => calcChiron(NaN)).toThrow()
  })

  it('keeps mean-node speed negative across zero degrees', () => {
    // Locate a crossing independently of the implementation's angle wrapping.
    const start = julday(2006, 1, 1, 0)
    for (let day = 0; day < 365; day += 0.05) {
      const speed = calcMeanNodeFull(start + day).speed
      expect(speed).toBeLessThan(-0.04)
      expect(speed).toBeGreaterThan(-0.06)
    }
  })

  it('reports polar fallback and both nodes as retrograde', async () => {
    const chart = await calculateNatal({
      year: 2024, month: 4, day: 15, hour: 12, minute: 0, gender: 'M',
      latitude: 70, longitude: 127, timezone: 'UTC',
    })
    expect(chart.houseSystem).toBe('O')
    expect(chart.planets.filter(p => ['NorthNode', 'SouthNode'].includes(p.id)).every(p => p.isRetrograde)).toBe(true)
  })
})

// Swiss Ephemeris sweph.h: MOSHPLEPH/MOSHLUEPH = 625000.5 .. 2818000.5 (TT).
// swi_moshplan allows 0.3 day beyond the limits and swi_moshmoon 0.2 day.
// https://github.com/aloistr/swisseph/blob/master/swemplan.c
describe('ephemeris coverage limits', () => {
  const planets = [mer404, ven404, ear404, mar404, jup404, sat404, ura404, nep404, plu404]

  it('reports Chiron table coverage with inclusive bounds', () => {
    expect(hasChironData(CHIRON_JD_START)).toBe(true)
    expect(hasChironData(CHIRON_JD_END)).toBe(true)
    expect(hasChironData(CHIRON_JD_START - 1e-6)).toBe(false)
    expect(hasChironData(CHIRON_JD_END + 1e-6)).toBe(false)
    expect(hasChironData(NaN)).toBe(false)
    expect(() => calcChiron(CHIRON_JD_END + 1e-6)).toThrow(RangeError)
  })

  it('applies the Swiss Ephemeris margins to the Moshier planet range', () => {
    expect(() => moshplan(MOSHPLEPH_START - 0.3, 4, planets)).not.toThrow()
    expect(() => moshplan(MOSHPLEPH_END + 0.3, 4, planets)).not.toThrow()
    expect(() => moshplan(MOSHPLEPH_START - 0.31, 4, planets)).toThrow(RangeError)
    expect(() => moshplan(MOSHPLEPH_END + 0.31, 4, planets)).toThrow(/outside Moshier planet range/)
    expect(() => moshplan(NaN, 4, planets)).toThrow(RangeError)
  })

  it('applies the Swiss Ephemeris margins to the Moshier Moon range', () => {
    expect(() => calcMoon(MOSHLUEPH_START - 0.2)).not.toThrow()
    expect(() => calcMoon(MOSHLUEPH_END + 0.2)).not.toThrow()
    expect(() => calcMoon(MOSHLUEPH_START - 0.21)).toThrow(RangeError)
    expect(() => calcMoon(MOSHLUEPH_END + 0.21)).toThrow(/outside Moshier's Moon range/)
  })

  it('rejects Moshier bodies after the range but keeps the analytic mean node', () => {
    const inside = julday(3000, 1, 1, 0)
    const outside = julday(3100, 1, 1, 0)
    for (const body of [0, 1, 2, 9]) {
      expect(Number.isFinite(calcPlanet(inside, body).longitude)).toBe(true)
      expect(() => calcPlanet(outside, body)).toThrow(RangeError)
    }
    expect(Number.isFinite(calcPlanet(outside, 10).longitude)).toBe(true)
  })
})
