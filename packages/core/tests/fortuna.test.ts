import { describe, expect, it } from 'vitest'
import { calculateNatal } from '../src/natal.ts'

// Swiss Ephemeris 2.10.03: calc_ut(MOSEPH), azalt(ECL2HOR) geometric altitude,
// and houses(). Solar-center horizon without atmospheric refraction.
// https://www.astro.com/swisseph/swephprg.htm
const fixtures = [
  { month: 4, day: 15, hour: 20, minute: 45, latitude: 37.5665, longitude: 126.978, expected: 289.7755695944603 }, // before sunrise
  { month: 4, day: 15, hour: 21, minute: 15, latitude: 37.5665, longitude: 126.978, expected: 122.91548388730259 }, // after sunrise
  { month: 4, day: 15, hour: 10, minute: 0, latitude: 37.5665, longitude: 126.978, expected: 290.8588366001266 }, // before sunset
  { month: 4, day: 15, hour: 10, minute: 15, latitude: 37.5665, longitude: 126.978, expected: 122.59822473145758 }, // after sunset
  { month: 6, day: 21, hour: 0, minute: 0, latitude: 70, longitude: 20, expected: 111.16290881865439 }, // polar day
  { month: 12, day: 21, hour: 12, minute: 0, latitude: 70, longitude: 20, expected: 49.28347458422536 }, // polar night
]

describe('Fortuna solar horizon', () => {
  for (const fixture of fixtures) {
    for (const system of ['P', 'W', 'M']) {
      it(`${fixture.month}-${fixture.day} ${fixture.hour}:${fixture.minute}, latitude ${fixture.latitude}, ${system}`, async () => {
        const { expected, ...dateAndLocation } = fixture
        const chart = await calculateNatal({ year: 2024, gender: 'M', timezone: 'UTC', ...dateAndLocation }, system)
        const actual = chart.planets.find(p => p.id === 'Fortuna')!.longitude
        expect(Math.abs(((actual - expected + 540) % 360) - 180)).toBeLessThan(0.004)
      })
    }
  }
})
