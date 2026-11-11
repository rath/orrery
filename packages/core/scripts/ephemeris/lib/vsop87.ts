/**
 * Reader for the VSOP87A files (heliocentric rectangular coordinates, dynamical
 * ecliptic and equinox J2000), following the record layout in `vsop87.doc`.
 */
import { readSource } from './sources.ts'
import type { TermSeries } from './series.ts'

/** The planets taken from VSOP87; the outer planets are integrated numerically instead. */
export const VSOP87_PLANETS = [
  ['Mercury', 'mer'],
  ['Venus', 'ven'],
  ['Earth', 'ear'],
  ['Mars', 'mar'],
] as const

export type Vsop87Planet = typeof VSOP87_PLANETS[number][0]

/** Series for X, Y and Z; time in thousands of Julian years from J2000 (TT). */
export type RectangularSeries = [TermSeries, TermSeries, TermSeries]

export async function readVsop87A(extension: string): Promise<RectangularSeries> {
  const text = await readSource('vsop87', `VSOP87A.${extension}`)
  const result: RectangularSeries = [[], [], []]
  let block: TermSeries[number] | null = null
  for (const line of text.split('\n')) {
    if (line.includes('VSOP87 VERSION')) {
      // Header record: coordinate index in column 42, power of T in column 60.
      const coordinate = Number(line[41]) - 1
      const power = Number(line[59])
      block = []
      result[coordinate][power] = block
    } else if (line.trim() && block) {
      // Term record: A in columns 80-97, B in 98-111, C in 112-131.
      block.push({
        a: Number(line.slice(79, 97)),
        b: Number(line.slice(97, 111)),
        c: Number(line.slice(111, 131)),
      })
    }
  }
  for (const series of result) {
    for (let power = 0; power < series.length; power++) series[power] ??= []
  }
  return result
}

export interface CheckValue {
  body: string
  jd: number
  position: [number, number, number]
  velocity: [number, number, number]
}

/** Substitution results published with the theory (`vsop87.chk`), VSOP87A section only. */
export async function readVsop87Checks(): Promise<CheckValue[]> {
  const lines = (await readSource('vsop87', 'vsop87.chk')).split('\n')
  const numbers = (line: string) => [...line.matchAll(/-?\d*\.\d+/g)].map(m => Number(m[0]))
  const checks: CheckValue[] = []
  for (let i = 0; i < lines.length; i++) {
    const match = /^\s*VSOP87A\s+(\S+)\s+JD(\d+\.\d)/.exec(lines[i])
    if (!match) continue
    checks.push({
      body: match[1],
      jd: Number(match[2]),
      position: numbers(lines[i + 1]) as [number, number, number],
      velocity: numbers(lines[i + 2]) as [number, number, number],
    })
  }
  return checks
}
