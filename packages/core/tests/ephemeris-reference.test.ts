import { describe, expect, it } from 'vitest'
import { calcHouses, calcPlanet, julday } from '../src/ephemeris/index.ts'
import { calcChiron } from '../src/ephemeris/chiron.ts'
import { calcMeanNodeFull } from '../src/ephemeris/node.ts'
import { CHIRON_JD_START, CHIRON_JD_STEP, CHIRON_N, CHIRON_LON, CHIRON_SPEED } from '../src/ephemeris/tables/chiron-data.ts'
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
