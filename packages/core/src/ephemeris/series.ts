/**
 * Poisson series: sum over k of t^k * sum over i of A_i * cos(B_i + C_i * t).
 *
 * Both analytical theories used here (VSOP87 for the planets, ELP 2000-82B for
 * the Moon's perturbations) are published in this shape, so one evaluator
 * serves them all.
 */

/**
 * One block per power of t. A block is a flat list of (amplitude, phase,
 * frequency) triplets, sorted by decreasing amplitude.
 */
export type PoissonSeries = readonly (readonly number[])[]

/**
 * Evaluate a series and its time derivative at `t` (in the time unit of the series).
 *
 * @param cutoff Terms smaller than this amplitude are skipped; because blocks are
 *               sorted, this trades accuracy for speed without separate tables.
 * @returns [value, d(value)/dt]
 */
export function evaluateSeries(series: PoissonSeries, t: number, cutoff = 0): [number, number] {
  let value = 0
  let rate = 0
  let power = 1 // t^k
  let lowerPower = 0 // k * t^(k-1)
  for (let k = 0; k < series.length; k++) {
    const block = series[k]
    let sum = 0
    let sumRate = 0
    for (let i = 0; i < block.length; i += 3) {
      const amplitude = block[i]
      if (amplitude < cutoff) break
      const argument = block[i + 1] + block[i + 2] * t
      sum += amplitude * Math.cos(argument)
      sumRate -= amplitude * block[i + 2] * Math.sin(argument)
    }
    value += power * sum
    rate += lowerPower * sum + power * sumRate
    lowerPower = (k + 1) * power
    power *= t
  }
  return [value, rate]
}
