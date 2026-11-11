/**
 * Reader for the 36 data files of the lunar solution ELP 2000-82B, following
 * the record layouts and formulas of the notice distributed with them
 * ("Lunar solution ELP 2000-82B", sections 2 to 7).
 */
import { readSource } from './sources.ts'
import type { TermSeries } from './series.ts'
import {
  EARTH_MEAN_LONGITUDE, ELP_ARGUMENTS, delaunayPolynomials,
} from '../../../src/ephemeris/lunar-theory.ts'

const MOON_MEAN_LONGITUDE = ELP_ARGUMENTS.meanLongitude

const ARCSEC = Math.PI / 648000
const DEG = Math.PI / 180
const dms = (degrees: number, minutes: number, seconds: number) => degrees * 3600 + minutes * 60 + seconds

// ── Constants of the theory (notice, sections 6 and 7) ──────────────────

/** ν: sidereal mean motion of the Moon, ″/century. */
const NU = MOON_MEAN_LONGITUDE[1]
/** n′: sidereal mean motion of the Sun, ″/century. */
const N_PRIME = EARTH_MEAN_LONGITUDE[1]
/** m = n′/ν. */
const M = N_PRIME / NU
/** μ′ = (mT + mL) / (mS + mT + mL). */
const MASS_RATIO = 3.040423956e-6
/** α = a0/a′, ratio of the semi-major axes, from Kepler's third law for both orbits. */
const ALPHA = Math.cbrt(M * M * MASS_RATIO)
/** p: precession constant at J2000, ″/century. */
const PRECESSION = 5029.0966

/** Corrections to the constants from the fit to DE200/LE200 (section 7). */
const DELTA_NU = 0.55604 / NU // relative
const DELTA_N_PRIME = -0.0642 / NU // relative to ν
const DELTA_GAMMA = -0.08066 * ARCSEC
const DELTA_E = 0.01789 * ARCSEC
const DELTA_E_PRIME = -0.12879 * ARCSEC

/** Mean longitudes of the planets at J2000 and their mean motions (Table F, VSOP82): ″, ″/century. */
const PLANET_LONGITUDES = {
  Mercury: [dms(252, 15, 3.25986), 538101628.68898],
  Venus: [dms(181, 58, 47.28305), 210664136.43355],
  Mars: [dms(355, 25, 59.78866), 68905077.59284],
  Jupiter: [dms(34, 21, 5.34212), 10925660.42861],
  Saturn: [dms(50, 4, 38.89694), 4399609.65932],
  Uranus: [dms(314, 3, 18.01841), 1542481.19393],
  Neptune: [dms(304, 20, 55.19575), 786550.32074],
}

// ── Main problem (files ELP1 to ELP3) ───────────────────────────────────

/** A * sin or cos (i1 D + i2 l′ + i3 l + i4 F). */
export interface MainTerm {
  multipliers: [number, number, number, number]
  amplitude: number
}

/**
 * Format 4I3, 2X, F13.5, 6(2X, F10.2): four multipliers, the coefficient A and
 * its derivatives B1..B6 with respect to the constants (m, Γ, E, e′, α, μ).
 * The coefficient is corrected for the fitted constants as section 7 prescribes.
 */
async function readMain(file: number, isDistance: boolean): Promise<MainTerm[]> {
  const terms: MainTerm[] = []
  for (const line of (await readSource('elp82b', `ELP${file}`)).split('\n').slice(1)) {
    if (!line.trim()) continue
    const multipliers = [0, 3, 6, 9].map(start => Number(line.slice(start, start + 3))) as MainTerm['multipliers']
    let a = Number(line.slice(14, 27))
    const b = [0, 1, 2, 3, 4, 5].map(i => Number(line.slice(27 + 12 * i, 39 + 12 * i)))

    const viaMeanMotion = b[0] + (2 * ALPHA / (3 * M)) * b[4]
    if (isDistance) a -= (2 / 3) * a * DELTA_NU
    a += viaMeanMotion * (DELTA_N_PRIME - M * DELTA_NU)
      + b[1] * DELTA_GAMMA + b[2] * DELTA_E + b[3] * DELTA_E_PRIME
    terms.push({ multipliers, amplitude: a })
  }
  return terms
}

// ── Perturbations (files ELP4 to ELP36) ─────────────────────────────────

type Linear = [number, number] // value at J2000 and rate per century, radians

const linear = (polynomial: readonly number[]): Linear => [polynomial[0] * ARCSEC, polynomial[1] * ARCSEC]

function argumentSets(): { figure: Linear[]; planetary1: Linear[]; planetary2: Linear[] } {
  const [d, lPrime, l, f] = delaunayPolynomials().map(linear)
  const planets = Object.fromEntries(
    Object.entries(PLANET_LONGITUDES).map(([name, polynomial]) => [name, linear(polynomial)]),
  )
  const earth = linear(EARTH_MEAN_LONGITUDE)
  // ζ: the Moon's mean longitude referred to the mean equinox of date.
  const zeta: Linear = [MOON_MEAN_LONGITUDE[0] * ARCSEC, (MOON_MEAN_LONGITUDE[1] + PRECESSION) * ARCSEC]
  const { Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune } = planets
  return {
    figure: [zeta, d, lPrime, l, f],
    planetary1: [Mercury, Venus, earth, Mars, Jupiter, Saturn, Uranus, Neptune, d, l, f],
    planetary2: [Mercury, Venus, earth, Mars, Jupiter, Saturn, Uranus, d, lPrime, l, f],
  }
}

/**
 * Formats 5I3 or 11I3, then 1X, F9.5 (phase, degrees), 1X, F9.5 (amplitude).
 * A sin(Σ i_k·argument_k + φ) is rewritten as A cos(B + C t).
 */
async function readPerturbation(file: number, args: Linear[]): Promise<TermSeries[number]> {
  const width = 3 * args.length
  const terms: TermSeries[number] = []
  for (const line of (await readSource('elp82b', `ELP${file}`)).split('\n').slice(1)) {
    if (!line.trim()) continue
    let phase = Number(line.slice(width + 1, width + 10)) * DEG - Math.PI / 2
    let rate = 0
    args.forEach(([value, perCentury], k) => {
      const multiplier = Number(line.slice(3 * k, 3 * k + 3))
      phase += multiplier * value
      rate += multiplier * perCentury
    })
    terms.push({ a: Number(line.slice(width + 11, width + 20)), b: phase, c: rate })
  }
  return terms
}

export interface Elp82b {
  /** Main problem: longitude (sine, ″), latitude (sine, ″), distance (cosine, km). */
  main: [MainTerm[], MainTerm[], MainTerm[]]
  /** Perturbations of longitude (″), latitude (″) and distance (km); t in centuries. */
  perturbations: [TermSeries, TermSeries, TermSeries]
}

export async function readElp82b(): Promise<Elp82b> {
  const args = argumentSets()
  const main = [await readMain(1, false), await readMain(2, false), await readMain(3, true)] as Elp82b['main']

  // File number → [argument set, power of t]. Coordinates cycle longitude, latitude, distance.
  const groups: [number, Linear[], number][] = [
    [4, args.figure, 0], [7, args.figure, 1], // Earth figure
    [10, args.planetary1, 0], [13, args.planetary1, 1], // planetary, table 1
    [16, args.planetary2, 0], [19, args.planetary2, 1], // planetary, table 2
    [22, args.figure, 0], [25, args.figure, 1], // tides
    [28, args.figure, 0], // Moon figure
    [31, args.figure, 0], // relativity
    [34, args.figure, 2], // solar eccentricity
  ]
  const perturbations: Elp82b['perturbations'] = [[[], [], []], [[], [], []], [[], [], []]]
  for (const [first, argumentSet, power] of groups) {
    for (let coordinate = 0; coordinate < 3; coordinate++) {
      perturbations[coordinate][power].push(...await readPerturbation(first + coordinate, argumentSet))
    }
  }
  return { main, perturbations }
}
