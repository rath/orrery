import { describe, expect, it } from 'vitest'
import { apparentPosition, astrometricPosition } from '../src/ephemeris/apparent.ts'
import type { Body } from '../src/ephemeris/apparent.ts'
import { DEG, ECLIPTIC_J2000_TO_EQUATOR, rotate } from '../src/ephemeris/frames.ts'
import { eclipticPosition, housesAt, julianDay } from '../src/ephemeris/index.ts'
import type { HouseSystem } from '../src/ephemeris/index.ts'
import horizons from './horizons-reference.json'
import swiss from './swiss-reference.json'

const ARCSEC = 1 / 3600
/** Smallest difference between two angles in degrees. */
const separation = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)

type RealBody = Exclude<Body, 'MeanNode'>
const HORIZONS_BODIES = Object.keys(horizons.apparent.bodies) as RealBody[]

// Primary oracle: NASA/JPL Horizons (DE441), queried at Terrestrial Time instants so
// that ΔT plays no part. Regenerate with scripts/ephemeris/build-reference.ts.
describe('JPL Horizons reference', () => {
  // Horizons reports ecliptic coordinates of date with the IAU 1976/80 precession and
  // nutation; this implementation uses IAU 2006/2000A. The two definitions drift apart
  // by about 0.2″ per century, which is most of the tolerance.
  describe('apparent ecliptic position of date, 1900–2100', () => {
    for (const body of HORIZONS_BODIES) {
      it(body, () => {
        horizons.apparent.jd.forEach((jd, i) => {
          const expected = horizons.apparent.bodies[body][i]
          if (!expected) return
          const actual = apparentPosition(body, jd)
          expect(separation(actual.longitude / DEG, expected[0])).toBeLessThan(0.4 * ARCSEC)
          expect(Math.abs(actual.latitude / DEG - expected[1])).toBeLessThan(0.2 * ARCSEC)
        })
      })
    }
  })

  // Venus passing behind the Sun on 4 June 2024: outside the disc the Sun bends its light
  // by up to 0.7″; behind the disc Horizons, like this implementation, applies no bending.
  it('bends light near the Sun', () => {
    horizons.conjunction.jd.forEach((jd, i) => {
      const [longitude, latitude] = horizons.conjunction.venus[i]
      const actual = apparentPosition('Venus', jd)
      expect(separation(actual.longitude / DEG, longitude)).toBeLessThan(0.1 * ARCSEC)
      expect(Math.abs(actual.latitude / DEG - latitude)).toBeLessThan(0.1 * ARCSEC)
    })
  })

  // Astrometric places are referred to the fixed ICRF, so they test the theories and
  // the integration themselves over the whole range, free of any precession model.
  describe('astrometric position in the ICRF, years 1–3000', () => {
    /** Largest separation allowed, arcseconds: [within 1800–2200, over the whole range]. */
    const TOLERANCE: Record<RealBody, [number, number]> = {
      Sun: [0.1, 0.3],
      Moon: [0.3, 2],
      Mercury: [0.2, 0.3],
      Venus: [0.2, 0.3],
      Mars: [0.25, 2.5],
      Jupiter: [0.1, 0.15],
      Saturn: [0.03, 0.05],
      Uranus: [0.03, 0.05],
      Neptune: [0.03, 0.05],
      Pluto: [0.03, 0.05],
      Chiron: [0.03, 0.03],
    }

    for (const body of HORIZONS_BODIES) {
      it(body, () => {
        let compared = 0
        horizons.astrometric.jd.forEach((jd, i) => {
          const expected = horizons.astrometric.bodies[body][i]
          if (!expected) return
          const [x, y, z] = rotate(ECLIPTIC_J2000_TO_EQUATOR, astrometricPosition(body, jd))
          const ra = expected[0] * DEG
          const dec = expected[1] * DEG
          const cosine = (x * Math.cos(dec) * Math.cos(ra) + y * Math.cos(dec) * Math.sin(ra) + z * Math.sin(dec))
            / Math.hypot(x, y, z)
          const apart = Math.acos(Math.min(1, cosine)) / DEG / ARCSEC
          const year = 2000 + (jd - 2451545) / 365.25
          expect(apart).toBeLessThan(TOLERANCE[body][year > 1800 && year < 2200 ? 0 : 1])
          compared++
        })
        expect(compared).toBeGreaterThan(0)
      })
    }
  })
})

// Cross-check against an unrelated implementation: Swiss Ephemeris 2.10.03 in Moshier
// mode, through pyswisseph (see the `source` field). Instants are given in UT here, so
// the comparison also covers ΔT — which is why it stops where observed ΔT stops.
describe('Swiss Ephemeris cross-check', () => {
  const BODIES: Body[] = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'MeanNode',
  ]
  /** Bodies slow enough that a minute's disagreement about a future ΔT does not show. */
  const SLOW = new Set<Body>(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'MeanNode'])
  const LAST_OBSERVED_YEAR = 2024

  for (const fixture of swiss.planets) {
    it(`apparent longitudes at ${fixture.year}-${fixture.month}-15 12:00 UT`, () => {
      const jd = julianDay(fixture.year, fixture.month, 15, 12)
      const future = fixture.year > LAST_OBSERVED_YEAR
      fixture.longitudes.forEach((longitude, index) => {
        const body = BODIES[index]
        if (future && !SLOW.has(body)) return
        // The Moshier tables are themselves about 1–2″ from DE441 for the Moon and, later
        // this century, for Neptune and Pluto; elsewhere the old 0.0003° bound still holds.
        const tolerance = future ? 0.001 : body === 'Moon' ? 0.0006 : 0.0003
        expect(separation(eclipticPosition(body, jd).longitude, longitude)).toBeLessThan(tolerance)
      })
    })
  }

  for (const fixture of swiss.houses) {
    it(`${fixture.system} houses at ${fixture.year}-${fixture.month}, latitude ${fixture.lat}`, () => {
      const jd = julianDay(fixture.year, fixture.month, 15, 12)
      const result = housesAt(jd, fixture.lat, 127, fixture.system as HouseSystem)
      result.cusps.forEach((cusp, index) => {
        expect(separation(cusp, fixture.cusps[index])).toBeLessThan(0.0005)
      })
      expect(separation(result.ascendant, fixture.angles[0])).toBeLessThan(0.0005)
      expect(separation(result.midheaven, fixture.angles[1])).toBeLessThan(0.0005)
    })
  }
})
