/**
 * Generates `src/ephemeris/data/elp2000.ts`: the truncated series of the lunar
 * theory ELP 2000-82B, and its mean arguments re-fitted to JPL DE441.
 *
 * Why re-fit: the theory's constants were adjusted to DE200 over a single
 * century, with a tidal acceleration of the Moon since revised by lunar laser
 * ranging. Left as published, the mean longitude drifts from modern ephemerides
 * by about 1″ per century squared — over six arcminutes at the year 1.
 */
import { readElp82b } from '../lib/elp82b.ts'
import type { MainTerm } from '../lib/elp82b.ts'
import { horizonsStates } from '../lib/horizons-vectors.ts'
import { leastSquares } from '../lib/least-squares.ts'
import { countTerms, printSeries, toRuntime, truncate } from '../lib/series.ts'
import type { TermSeries } from '../lib/series.ts'
import { ELP_ARGUMENTS, lunarPosition } from '../../../src/ephemeris/lunar-theory.ts'
import type { LunarArguments, LunarSeries } from '../../../src/ephemeris/lunar-theory.ts'
import { J2000 } from '../../../src/ephemeris/time.ts'

const ARCSEC = Math.PI / 648000
const AU_KM = 149597870.7
const ARCSEC_PER_RADIAN = 206264.806

/** Smallest coefficients kept: arcseconds for longitude and latitude, kilometres for distance. */
const THRESHOLD = [0.005, 0.005, 0.01]
/** Poisson terms are selected for |t| <= 10 centuries and printed to stay exact to |t| <= 20. */
const SELECTION_SPAN = 10
const PRINT_SPAN = 20

/** Check values of the notice (Table H): |x|, |y|, |z| in km, J2000 ecliptic. */
const CHECK_VALUES: [number, [number, number, number]][] = [
  [2469000.5, [361602.98536, 44996.9951, 30696.65316]],
  [2449000.5, [363132.34248, 35863.65378, 33196.00409]],
  [2429000.5, [371577.58161, 75271.14315, 32227.94618]],
  [2409000.5, [373896.15893, 127406.79129, 30037.79225]],
  [2389000.5, [346331.77361, 206365.40364, 28502.11732]],
]

/** Span of the fit and of the accuracy report, Julian days (TT): 1 CE to 3000 CE. */
const FIT_START = 1721100
const FIT_END = 2816800
const FIT_SAMPLES = 720

const unit = (coordinate: number) => (coordinate === 2 ? 1 : ARCSEC)

function toLunarSeries(main: MainTerm[][], perturbations: TermSeries[]): LunarSeries {
  return {
    main: main.map((terms, c) => terms.flatMap(term => [...term.multipliers, term.amplitude * unit(c)])),
    perturbations: perturbations.map((series, c) =>
      toRuntime(series).map(block => block.map((value, i) => (i % 3 === 0 ? value * unit(c) : value)))),
  }
}

interface Sample {
  t: number
  /** Geocentric position of the Moon from DE441, km, J2000 ecliptic. */
  position: [number, number, number]
}

/** Sample instants spread unevenly, so no lunar period is sampled in step. */
async function reference(): Promise<Sample[]> {
  const jds: number[] = []
  for (let i = 0; i < FIT_SAMPLES; i++) {
    const day = Math.round(FIT_START + (FIT_END - FIT_START) * i / (FIT_SAMPLES - 1))
    jds.push(day + ((i * 7919) % 1000) / 1000)
  }
  const states = await horizonsStates('301', jds, '500@399')
  return jds.map((jd, i) => ({
    t: (jd - J2000) / 36525,
    position: [states[i][0] * AU_KM, states[i][1] * AU_KM, states[i][2] * AU_KM],
  }))
}

const ARGUMENT_KEYS = ['meanLongitude', 'perigee', 'node'] as const
/** Powers of t adjusted in each argument: constant, rate, quadratic and cubic term. */
const FITTED_POWERS = 4

function adjusted(args: LunarArguments, parameters: readonly number[]): LunarArguments {
  const result = { ...args } as Record<typeof ARGUMENT_KEYS[number], number[]>
  ARGUMENT_KEYS.forEach((key, k) => {
    result[key] = args[key].map((value, power) => value + (power < FITTED_POWERS ? parameters[FITTED_POWERS * k + power] : 0))
  })
  return result
}

/** Gauss–Newton fit of the secular parts of W1, W2 and W3 to the DE441 positions. */
function fitArguments(series: LunarSeries, samples: readonly Sample[]): LunarArguments {
  let args: LunarArguments = ELP_ARGUMENTS
  const count = FITTED_POWERS * ARGUMENT_KEYS.length
  for (let iteration = 0; iteration < 3; iteration++) {
    const rows: number[][] = []
    const values: number[] = []
    for (const sample of samples) {
      const base = lunarPosition(series, sample.t, args)
      const partials = Array.from({ length: count }, (_, p) => {
        const step = 0.01 // arcseconds per century^power
        const nudged = lunarPosition(series, sample.t, adjusted(args, Array.from({ length: count }, (_, q) => (q === p ? step : 0))))
        return nudged.map((value, axis) => (value - base[axis]) / step)
      })
      for (let axis = 0; axis < 3; axis++) {
        rows.push(partials.map(partial => partial[axis]))
        values.push(sample.position[axis] - base[axis])
      }
    }
    args = adjusted(args, leastSquares(rows, values))
  }
  return args
}

interface Accuracy {
  longitude: number
  latitude: number
  distance: number
}

/** Largest differences from DE441 over the samples within [from, to] centuries. */
function accuracy(series: LunarSeries, args: LunarArguments, samples: readonly Sample[], from: number, to: number): Accuracy {
  const worst = { longitude: 0, latitude: 0, distance: 0 }
  for (const sample of samples) {
    if (sample.t < from || sample.t > to) continue
    const [x, y, z] = lunarPosition(series, sample.t, args)
    const [rx, ry, rz] = sample.position
    const range = Math.hypot(x, y, z)
    const referenceRange = Math.hypot(rx, ry, rz)
    let longitude = Math.atan2(y, x) - Math.atan2(ry, rx)
    longitude -= 2 * Math.PI * Math.round(longitude / (2 * Math.PI))
    worst.longitude = Math.max(worst.longitude, Math.abs(longitude) * ARCSEC_PER_RADIAN)
    worst.latitude = Math.max(worst.latitude, Math.abs(Math.asin(z / range) - Math.asin(rz / referenceRange)) * ARCSEC_PER_RADIAN)
    worst.distance = Math.max(worst.distance, Math.abs(range - referenceRange))
  }
  return worst
}

const describe = (a: Accuracy) => `longitude ${a.longitude.toFixed(2)}″, latitude ${a.latitude.toFixed(2)}″, distance ${a.distance.toFixed(2)} km`

export async function buildElp2000(): Promise<string> {
  const elp = await readElp82b()
  const complete = toLunarSeries(elp.main, elp.perturbations.map(series => truncate(series, 0, SELECTION_SPAN)))

  // Guard the reader: the complete series must reproduce the published check values.
  for (const [jd, expected] of CHECK_VALUES) {
    const position = lunarPosition(complete, (jd - J2000) / 36525)
    position.forEach((value, axis) => {
      if (Math.abs(Math.abs(value) - expected[axis]) > 1e-4) {
        throw new Error(`ELP 2000-82B does not reproduce the notice's check value at JD ${jd}`)
      }
    })
  }

  const samples = await reference()
  const fitted = fitArguments(complete, samples)

  const main = elp.main.map((terms, c) => terms
    .filter(term => Math.abs(term.amplitude) >= THRESHOLD[c])
    .sort((p, q) => Math.abs(q.amplitude) - Math.abs(p.amplitude)))
  const perturbations = elp.perturbations.map((series, c) => truncate(series, THRESHOLD[c], SELECTION_SPAN))
  const kept = toLunarSeries(main, perturbations)

  const published = accuracy(complete, ELP_ARGUMENTS, samples, -Infinity, Infinity)
  const report = [
    ['1800–2200', accuracy(kept, fitted, samples, -2, 2)],
    ['1000–3000', accuracy(kept, fitted, samples, -10, 10)],
    ['1–3000', accuracy(kept, fitted, samples, -Infinity, Infinity)],
  ] as const
  console.log(`  ELP as published, 1–3000: ${describe(published)}`)
  for (const [label, a] of report) console.log(`  truncated and re-fitted, ${label}: ${describe(a)}`)

  const printMain = (terms: MainTerm[], c: number) => {
    const precision = THRESHOLD[c] * unit(c) / 50
    const decimals = Math.ceil(-Math.log10(precision))
    const cells = terms.map(term => `${term.multipliers.join(',')},${Number((term.amplitude * unit(c)).toFixed(decimals))}`)
    const lines: string[] = []
    for (let i = 0; i < cells.length; i += 6) lines.push(`${cells.slice(i, i + 6).join(', ')},`)
    return `[\n${lines.join('\n')}\n  ]`
  }
  const printPolynomial = (coefficients: readonly number[]) =>
    `[${coefficients.map((value, power) => Number(value.toFixed(power < 2 ? 5 : 8))).join(', ')}]`
  const shift = (key: typeof ARGUMENT_KEYS[number]) =>
    [0, 1, 2, 3].map(power => (fitted[key][power] - ELP_ARGUMENTS[key][power]).toFixed(power >= 2 ? 5 : 3)).join(', ')

  return `/**
 * Lunar theory ELP 2000-82B, truncated, with mean arguments re-fitted to DE441.
 *
 * GENERATED by scripts/ephemeris/build-tables.ts — do not edit by hand.
 *
 * Source: M. Chapront-Touzé, J. Chapront, "The lunar ephemeris ELP 2000",
 * Astron. Astrophys. 124, 50 (1983) and "ELP 2000-85: a semi-analytical lunar
 * ephemeris adequate for historical times", Astron. Astrophys. 190, 342 (1988);
 * files ELP1–ELP36 as distributed by IMCCE (https://ftp.imcce.fr/pub/ephem/moon/elp82b/).
 *
 * Kept: coefficients of at least ${THRESHOLD[0]}″ in longitude and latitude and ${THRESHOLD[2]} km in
 * distance — ${main.map(terms => terms.length).join(' + ')} of ${elp.main.map(terms => terms.length).join(' + ')} main-problem terms and
 * ${perturbations.map(countTerms).join(' + ')} of ${elp.perturbations.map(countTerms).join(' + ')} perturbation terms.
 *
 * The terms up to t³ of the three mean longitudes were
 * re-fitted by least squares to ${FIT_SAMPLES} geocentric positions of the Moon from
 * NASA/JPL Horizons (DE441) between the years 1 and 3000. Shifts applied
 * (″, ″/century, ″/century², ″/century³):
 *   mean longitude ${shift('meanLongitude')}
 *   perigee        ${shift('perigee')}
 *   node           ${shift('node')}
 *
 * Largest differences from DE441 at the fitted positions:
${report.map(([label, a]) => ` *   ${label.padEnd(9)} ${describe(a)}`).join('\n')}
 */
import type { LunarArguments, LunarSeries } from '../lunar-theory.ts'

/** Mean longitudes of the Moon, its perigee and its node: arcseconds, in powers of Julian centuries. */
export const ELP_FITTED_ARGUMENTS: LunarArguments = {
  meanLongitude: ${printPolynomial(fitted.meanLongitude)},
  perigee: ${printPolynomial(fitted.perigee)},
  node: ${printPolynomial(fitted.node)},
}

/** Longitude and latitude in radians, distance in kilometres. */
export const ELP_SERIES: LunarSeries = {
  // Rows of (D, l′, l, F multipliers, coefficient).
  main: [
  ${main.map(printMain).join(',\n  ')},
  ],
  perturbations: [
    ${perturbations.map((series, c) => printSeries(
    series.map(block => block.map(term => ({ ...term, a: term.a * unit(c) }))),
    THRESHOLD[c] * unit(c) / 50, PRINT_SPAN,
  )).join(',\n    ')},
  ],
}
`
}
