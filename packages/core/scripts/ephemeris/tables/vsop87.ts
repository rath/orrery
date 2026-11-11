/**
 * Generates `src/ephemeris/data/vsop87.ts`: truncated VSOP87A series for
 * Mercury, Venus, the Earth and Mars.
 */
import { horizonsStates } from '../lib/horizons-vectors.ts'
import { leastSquares } from '../lib/least-squares.ts'
import { VSOP87_PLANETS, readVsop87A, readVsop87Checks } from '../lib/vsop87.ts'
import type { Vsop87Planet } from '../lib/vsop87.ts'
import { countTerms, printSeries, toRuntime, truncate } from '../lib/series.ts'
import { evaluateSeries } from '../../../src/ephemeris/series.ts'
import { J2000 } from '../../../src/ephemeris/time.ts'

/**
 * Smallest amplitude kept, in AU. Chosen so that dropping the rest moves the
 * planet by at most ~0.2 arcsecond as seen from the Earth at its closest, for
 * dates within a millennium of J2000 (see `README.md` for the measurements).
 */
const THRESHOLD: Record<Vsop87Planet, number> = {
  Mercury: 3e-8,
  Venus: 1e-8,
  Earth: 1e-8,
  Mars: 2e-8,
}

/** Terms are selected for |t| <= 1 millennium and printed to stay exact to |t| <= 2. */
const SELECTION_SPAN = 1
const PRINT_SPAN = 2

/**
 * VSOP87 was fitted to the JPL ephemeris DE200 of 1981. Against today's DE441
 * each planet runs slowly ahead of or behind its predicted place (Mars by 16
 * seconds of its motion in 2200, minutes in antiquity), mostly from asteroid
 * perturbations and mean motions known less well then. The drift is absorbed by
 * evaluating the series at a slightly shifted time: the shift is tabulated at
 * century nodes, fitted by least squares to DE441 positions from Horizons.
 */
const HORIZONS_ID: Record<Vsop87Planet, string> = { Mercury: '199', Venus: '299', Earth: '399', Mars: '4' }
/** Nodes at whole Julian centuries from J2000, covering 100 BCE to 3100 CE. */
const FIRST_NODE = -21
const LAST_NODE = 11
const SAMPLES_PER_CENTURY = 15

async function fitTimeCorrection(name: Vsop87Planet, series: number[][][]): Promise<{ seconds: number[]; before: number; after: number }> {
  const count = (LAST_NODE - FIRST_NODE) * SAMPLES_PER_CENTURY
  const jds: number[] = []
  for (let i = 0; i < count; i++) {
    // Uneven spacing, so no orbital period is sampled in step.
    const centuries = FIRST_NODE + (i + ((i * 7919) % 1000) / 1000) / SAMPLES_PER_CENTURY
    jds.push(Number((J2000 + centuries * 36525).toFixed(3)))
  }
  const reference = await horizonsStates(HORIZONS_ID[name], jds)

  const evaluate = (jd: number) => series.map(axis => evaluateSeries(axis, (jd - J2000) / 365250))
  const miss = (jd: number, i: number) => {
    const state = evaluate(jd)
    return Math.hypot(...state.map(([position], axis) => position - reference[i][axis]))
  }

  // Each sample's offset along the orbit, as a time: (Δr · v) / v², in seconds.
  const rows: number[][] = []
  const offsets: number[] = []
  jds.forEach((jd, i) => {
    const state = evaluate(jd)
    const velocity = state.map(([, rate]) => rate / 365250)
    const along = state.reduce((sum, [position], axis) => sum + (reference[i][axis] - position) * velocity[axis], 0)
    offsets.push(86400 * along / velocity.reduce((sum, v) => sum + v * v, 0))
    // Piecewise-linear basis: each sample weighs on the two nodes around it.
    const position = (jd - J2000) / 36525 - FIRST_NODE
    const node = Math.min(LAST_NODE - FIRST_NODE - 1, Math.floor(position))
    const row = new Array<number>(LAST_NODE - FIRST_NODE + 1).fill(0)
    row[node] = 1 - (position - node)
    row[node + 1] = position - node
    rows.push(row)
  })
  const seconds = leastSquares(rows, offsets).map(value => Number(value.toFixed(2)))

  const corrected = (jd: number) => {
    const position = (jd - J2000) / 36525 - FIRST_NODE
    const node = Math.min(LAST_NODE - FIRST_NODE - 1, Math.floor(position))
    return jd + (seconds[node] + (position - node) * (seconds[node + 1] - seconds[node])) / 86400
  }
  return {
    seconds,
    before: Math.max(...jds.map((jd, i) => miss(jd, i))),
    after: Math.max(...jds.map((jd, i) => miss(corrected(jd), i))),
  }
}

export async function buildVsop87(): Promise<string> {
  const checks = await readVsop87Checks()
  const entries: string[] = []
  const summary: string[] = []
  const corrections: string[] = []
  const fitSummary: string[] = []

  for (const [name, extension] of VSOP87_PLANETS) {
    const full = await readVsop87A(extension)

    // Guard the parser: the untruncated series must reproduce the published check values.
    const complete = full.map(series => toRuntime(truncate(series, 0, SELECTION_SPAN)))
    const bodyChecks = checks.filter(check => check.body === name.toUpperCase())
    if (bodyChecks.length === 0) throw new Error(`no check values for ${name}`)
    for (const check of bodyChecks) {
      const t = (check.jd - 2451545) / 365250
      complete.forEach((series, axis) => {
        const [position, rate] = evaluateSeries(series, t)
        if (Math.abs(position - check.position[axis]) > 1e-10
          || Math.abs(rate / 365250 - check.velocity[axis]) > 1e-10) {
          throw new Error(`${name} does not reproduce vsop87.chk at JD ${check.jd}`)
        }
      })
    }

    const threshold = THRESHOLD[name]
    const kept = full.map(series => truncate(series, threshold, SELECTION_SPAN))
    const printed = kept.map(series => printSeries(series, threshold / 50, PRINT_SPAN))
    entries.push(`  ${name}: [\n    ${printed.join(',\n    ')},\n  ],`)
    summary.push(` *   ${name.padEnd(8)} ${String(kept.reduce((n, s) => n + countTerms(s), 0)).padStart(5)} of `
      + `${String(full.reduce((n, s) => n + countTerms(s), 0)).padStart(5)} terms, amplitude >= ${threshold.toExponential()} AU`)

    const fit = await fitTimeCorrection(name, kept.map(toRuntime))
    corrections.push(`    ${name}: [${fit.seconds.join(', ')}],`)
    fitSummary.push(` *   ${name.padEnd(8)} ${(fit.before * 1e6).toFixed(2).padStart(6)} → ${(fit.after * 1e6).toFixed(2).padStart(5)}`)
    console.log(`  ${name}: largest difference from DE441 ${(fit.before * 1e6).toFixed(2)} → ${(fit.after * 1e6).toFixed(2)} ×10⁻⁶ AU`)
  }

  return `/**
 * VSOP87A planetary series, truncated.
 *
 * GENERATED by scripts/ephemeris/build-tables.ts — do not edit by hand.
 *
 * Source: P. Bretagnon, G. Francou, "Planetary theories in rectangular and
 * spherical variables: VSOP87 solutions", Astron. Astrophys. 202, 309 (1988),
 * files VSOP87A.* as distributed by IMCCE (https://ftp.imcce.fr/pub/ephem/planets/vsop87/).
 *
 * Heliocentric rectangular coordinates X, Y, Z in AU, referred to the dynamical
 * ecliptic and equinox J2000; time in thousands of Julian years from J2000 (TT).
 *
${summary.join('\n')}
 *
 * The time corrections re-fit the series to NASA/JPL Horizons (DE441)
 * heliocentric positions, ${(LAST_NODE - FIRST_NODE) * SAMPLES_PER_CENTURY} per planet. Largest distance from DE441 between
 * 100 BCE and 3100 CE, before → after the correction, in 10⁻⁶ AU:
${fitSummary.join('\n')}
 */
import type { PoissonSeries } from '../series.ts'

export type Vsop87Planet = ${VSOP87_PLANETS.map(([name]) => `'${name}'`).join(' | ')}

export const VSOP87: Record<Vsop87Planet, readonly [PoissonSeries, PoissonSeries, PoissonSeries]> = {
${entries.join('\n')}
}

/**
 * Seconds to add to the time before evaluating a planet's series, at whole
 * Julian centuries from J2000 starting with \`firstCentury\`; interpolate linearly.
 */
export const VSOP87_TIME_CORRECTION: { firstCentury: number; seconds: Record<Vsop87Planet, readonly number[]> } = {
  firstCentury: ${FIRST_NODE},
  seconds: {
${corrections.join('\n')}
  },
}
`
}
