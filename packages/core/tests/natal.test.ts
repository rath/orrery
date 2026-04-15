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

  it('12 houses and 14 planets', async () => {
    const chart = await calculateNatal(makeInput(NATAL_FIXTURES[0]))
    expect(chart.houses).toHaveLength(12)
    expect(chart.planets).toHaveLength(14) // 10 planets + Chiron + NorthNode + SouthNode + Fortuna
  })

  it('Fortuna = ASC + Moon - Sun (day) or ASC + Sun - Moon (night)', async () => {
    const chart = await calculateNatal(makeInput(NATAL_FIXTURES[0]))
    const fortuna = chart.planets.find(p => p.id === 'Fortuna')!
    const sun = chart.planets.find(p => p.id === 'Sun')!
    const moon = chart.planets.find(p => p.id === 'Moon')!
    const ascLon = chart.angles!.asc.longitude
    const isDayChart = sun.house! >= 7
    const expected = isDayChart
      ? normalizeDeg(ascLon + moon.longitude - sun.longitude)
      : normalizeDeg(ascLon + sun.longitude - moon.longitude)
    expect(fortuna.longitude).toBeCloseTo(expected, 4)
    expect(fortuna.house).toBeGreaterThanOrEqual(1)
    expect(fortuna.house).toBeLessThanOrEqual(12)
  })

  it('uses explicit IANA time zones for overseas births', async () => {
    const losAngeles = await calculateNatal({
      year: 1990,
      month: 7,
      day: 1,
      hour: 9,
      minute: 0,
      gender: 'M',
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: 'America/Los_Angeles',
    })
    const utc = await calculateNatal({
      year: 1990,
      month: 7,
      day: 1,
      hour: 16,
      minute: 0,
      gender: 'M',
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: 'UTC',
    })
    const laSun = losAngeles.planets.find(p => p.id === 'Sun')!
    const utcSun = utc.planets.find(p => p.id === 'Sun')!

    expect(laSun.longitude).toBeCloseTo(utcSun.longitude, 6)
    expect(losAngeles.angles!.asc.longitude).toBeCloseTo(utc.angles!.asc.longitude, 6)
    expect(losAngeles.angles!.mc.longitude).toBeCloseTo(utc.angles!.mc.longitude, 6)
  })

  it('applies PST (-8) for LA winter births — pairs PDT test above to lock the non-DST branch', async () => {
    const losAngeles = await calculateNatal({
      year: 1990, month: 1, day: 15, hour: 12, minute: 0,
      gender: 'M', latitude: 34.0522, longitude: -118.2437,
      timezone: 'America/Los_Angeles',
    })
    // 12:00 PST (UTC-8) → 20:00Z
    const utc = await calculateNatal({
      year: 1990, month: 1, day: 15, hour: 20, minute: 0,
      gender: 'M', latitude: 34.0522, longitude: -118.2437,
      timezone: 'UTC',
    })
    expect(losAngeles.planets.find(p => p.id === 'Sun')!.longitude)
      .toBeCloseTo(utc.planets.find(p => p.id === 'Sun')!.longitude, 6)
    expect(losAngeles.angles!.asc.longitude).toBeCloseTo(utc.angles!.asc.longitude, 6)
    expect(losAngeles.angles!.mc.longitude).toBeCloseTo(utc.angles!.mc.longitude, 6)
  })

  it('1974 Nixon emergency DST: LA January resolves to PDT (-7) not PST (-8)', async () => {
    const nixon = await calculateNatal({
      year: 1974, month: 1, day: 15, hour: 12, minute: 0,
      gender: 'M', latitude: 34.0522, longitude: -118.2437,
      timezone: 'America/Los_Angeles',
    })
    // 12:00 PDT (UTC-7) → 19:00Z
    const utc = await calculateNatal({
      year: 1974, month: 1, day: 15, hour: 19, minute: 0,
      gender: 'M', latitude: 34.0522, longitude: -118.2437,
      timezone: 'UTC',
    })
    expect(nixon.planets.find(p => p.id === 'Sun')!.longitude)
      .toBeCloseTo(utc.planets.find(p => p.id === 'Sun')!.longitude, 6)
    expect(nixon.angles!.asc.longitude).toBeCloseTo(utc.angles!.asc.longitude, 6)
  })

  it('Sydney austral winter AEST (+10) gives different UTC than austral summer AEDT (+11) at same wall-clock', async () => {
    const summer = await calculateNatal({
      year: 2024, month: 1, day: 15, hour: 12, minute: 0,
      gender: 'M', latitude: -33.8688, longitude: 151.2093,
      timezone: 'Australia/Sydney',
    })
    const summerUtc = await calculateNatal({
      year: 2024, month: 1, day: 15, hour: 1, minute: 0,
      gender: 'M', latitude: -33.8688, longitude: 151.2093,
      timezone: 'UTC',
    })
    expect(summer.planets.find(p => p.id === 'Sun')!.longitude)
      .toBeCloseTo(summerUtc.planets.find(p => p.id === 'Sun')!.longitude, 6)

    const winter = await calculateNatal({
      year: 2024, month: 7, day: 15, hour: 12, minute: 0,
      gender: 'M', latitude: -33.8688, longitude: 151.2093,
      timezone: 'Australia/Sydney',
    })
    const winterUtc = await calculateNatal({
      year: 2024, month: 7, day: 15, hour: 2, minute: 0,
      gender: 'M', latitude: -33.8688, longitude: 151.2093,
      timezone: 'UTC',
    })
    expect(winter.planets.find(p => p.id === 'Sun')!.longitude)
      .toBeCloseTo(winterUtc.planets.find(p => p.id === 'Sun')!.longitude, 6)
  })

  it('rejects DST spring-forward gap input with a DST gap RangeError', async () => {
    // Europe/Berlin 2024-03-31 02:30 is inside the spring-forward gap (clocks jump 02:00 → 03:00 CEST).
    await expect(calculateNatal({
      year: 2024, month: 3, day: 31, hour: 2, minute: 30,
      gender: 'M', latitude: 52.52, longitude: 13.405,
      timezone: 'Europe/Berlin',
    })).rejects.toThrow(/^DST gap/)
  })
})
