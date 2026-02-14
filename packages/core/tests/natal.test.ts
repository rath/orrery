import { describe, it, expect } from 'vitest'
import { calculateNatal, normalizeDeg } from '../src/natal.ts'
import { NATAL_FIXTURES } from './fixtures.ts'
import type { BirthInput } from '../src/types.ts'

function makeInput(f: typeof NATAL_FIXTURES[0]): BirthInput {
  return {
    year: f.year, month: f.month, day: f.day,
    hour: f.hour, minute: f.minute,
    gender: 'M',
  }
}

describe('calculateNatal', () => {
  for (const fixture of NATAL_FIXTURES) {
    const label = `${fixture.year}/${fixture.month}/${fixture.day} ${fixture.hour}:${String(fixture.minute).padStart(2, '0')}`

    it(`Sun longitude for ${label}`, async () => {
      const chart = await calculateNatal(makeInput(fixture))
      const sun = chart.planets.find(p => p.id === 'Sun')!
      expect(sun.longitude).toBeCloseTo(fixture.expected.sun.lon, 1)
      expect(sun.sign).toBe(fixture.expected.sun.sign)
    })

    it(`Moon longitude for ${label}`, async () => {
      const chart = await calculateNatal(makeInput(fixture))
      const moon = chart.planets.find(p => p.id === 'Moon')!
      expect(moon.longitude).toBeCloseTo(fixture.expected.moon.lon, 0)
      expect(moon.sign).toBe(fixture.expected.moon.sign)
    })

    it(`ASC/MC for ${label}`, async () => {
      const chart = await calculateNatal(makeInput(fixture))
      expect(chart.angles.asc.longitude).toBeCloseTo(fixture.expected.asc.lon, 0)
      expect(chart.angles.asc.sign).toBe(fixture.expected.asc.sign)
      expect(chart.angles.mc.longitude).toBeCloseTo(fixture.expected.mc.lon, 0)
      expect(chart.angles.mc.sign).toBe(fixture.expected.mc.sign)
    })

    it(`Mercury retrograde for ${label}`, async () => {
      const chart = await calculateNatal(makeInput(fixture))
      const mercury = chart.planets.find(p => p.id === 'Mercury')!
      expect(mercury.isRetrograde).toBe(fixture.expected.mercury.isRetrograde)
    })

    it(`NorthNode for ${label}`, async () => {
      const chart = await calculateNatal(makeInput(fixture))
      const nn = chart.planets.find(p => p.id === 'NorthNode')!
      expect(nn.longitude).toBeCloseTo(fixture.expected.northNode.lon, 0)
      expect(nn.sign).toBe(fixture.expected.northNode.sign)
    })
  }

  it('SouthNode = NorthNode + 180°', async () => {
    const chart = await calculateNatal(makeInput(NATAL_FIXTURES[0]))
    const nn = chart.planets.find(p => p.id === 'NorthNode')!
    const sn = chart.planets.find(p => p.id === 'SouthNode')!
    const expected = normalizeDeg(nn.longitude + 180)
    expect(sn.longitude).toBeCloseTo(expected, 4)
  })

  it('all planets have house 1-12', async () => {
    const chart = await calculateNatal(makeInput(NATAL_FIXTURES[0]))
    for (const p of chart.planets) {
      expect(p.house).toBeGreaterThanOrEqual(1)
      expect(p.house).toBeLessThanOrEqual(12)
    }
  })

  it('retrograde planets have negative speed', async () => {
    const chart = await calculateNatal(makeInput(NATAL_FIXTURES[0]))
    for (const p of chart.planets) {
      if (p.isRetrograde) {
        expect(p.speed).toBeLessThan(0)
      }
    }
  })

  it('12 houses and 13 planets', async () => {
    const chart = await calculateNatal(makeInput(NATAL_FIXTURES[0]))
    expect(chart.houses).toHaveLength(12)
    expect(chart.planets).toHaveLength(13) // 10 planets + Chiron + NorthNode + SouthNode
  })
})
