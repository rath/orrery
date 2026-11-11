/**
 * Helpers shared by the table generators: truncating, rounding and printing
 * Poisson series in the layout `src/ephemeris/series.ts` evaluates.
 */

/** A * cos(B + C t), one term of a block multiplied by t^k. */
export interface Term {
  a: number
  b: number
  c: number
}

/** Blocks indexed by the power of t they are multiplied by. */
export type TermSeries = Term[][]

const TWO_PI = 2 * Math.PI

/** Fold a negative amplitude into the phase and reduce the phase to [0, 2π). */
export function canonical(term: Term): Term {
  let { a, b } = term
  if (a < 0) {
    a = -a
    b += Math.PI
  }
  b %= TWO_PI
  if (b < 0) b += TWO_PI
  return { a, b, c: term.c }
}

/**
 * Keep the terms whose contribution can reach `threshold` within |t| <= `span`,
 * sorted by decreasing amplitude.
 */
export function truncate(series: TermSeries, threshold: number, span: number): TermSeries {
  const kept = series.map((block, power) => block
    .map(canonical)
    .filter(term => term.a * Math.max(1, span ** power) >= threshold)
    .sort((p, q) => q.a - p.a))
  while (kept.length > 1 && kept[kept.length - 1].length === 0) kept.pop()
  return kept
}

/** Round to the given absolute precision and print the shortest literal. */
function literal(value: number, precision: number): string {
  const decimals = Math.min(15, Math.max(0, Math.ceil(-Math.log10(precision))))
  const text = String(Number(value.toFixed(decimals)))
  return text.startsWith('0.') ? text.slice(1) : text.startsWith('-0.') ? `-${text.slice(2)}` : text
}

/**
 * Print a series as nested array literals. Each number keeps only the digits
 * that matter for a result accurate to `resolution` within |t| <= `span`.
 */
export function printSeries(series: TermSeries, resolution: number, span: number): string {
  const blocks = series.map((block, power) => {
    const reach = Math.max(1, span ** power)
    const numbers = block.flatMap(({ a, b, c }) => {
      const phasePrecision = resolution / (a * reach)
      return [
        literal(a, resolution / reach),
        literal(b, phasePrecision),
        literal(c, phasePrecision / span),
      ]
    })
    return `[${wrap(numbers)}]`
  })
  return `[${blocks.join(', ')}]`
}

/** Join numbers with commas, breaking lines near 120 columns. */
function wrap(numbers: string[]): string {
  const lines: string[] = []
  let line = ''
  for (const number of numbers) {
    if (line.length + number.length + 1 > 118) {
      lines.push(line)
      line = ''
    }
    line += `${number},`
  }
  if (line) lines.push(line)
  return lines.length > 1 ? `\n${lines.join('\n')}\n` : lines.join('')
}

export function countTerms(series: TermSeries): number {
  return series.reduce((sum, block) => sum + block.length, 0)
}

/** Flat numeric layout used at run time, for evaluating a series inside the generators. */
export function toRuntime(series: TermSeries): number[][] {
  return series.map(block => block.flatMap(({ a, b, c }) => [a, b, c]))
}
