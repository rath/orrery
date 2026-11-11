/**
 * Linear least squares by the normal equations, for the small, well-conditioned
 * fits the generators need.
 *
 * @param rows   One row of partial derivatives per observation.
 * @param values The observed residual for each row.
 * @returns the parameter vector minimising |rows · x − values|².
 */
export function leastSquares(rows: readonly (readonly number[])[], values: readonly number[]): number[] {
  const n = rows[0].length
  // Scale each column to unit norm so the elimination is not dominated by one parameter.
  const scale = Array.from({ length: n }, (_, j) => Math.hypot(...rows.map(row => row[j])) || 1)
  const normal = Array.from({ length: n }, () => new Array<number>(n + 1).fill(0))
  rows.forEach((row, r) => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) normal[i][j] += (row[i] / scale[i]) * (row[j] / scale[j])
      normal[i][n] += (row[i] / scale[i]) * values[r]
    }
  })
  // Gauss–Jordan elimination with partial pivoting.
  for (let i = 0; i < n; i++) {
    let pivot = i
    for (let k = i + 1; k < n; k++) if (Math.abs(normal[k][i]) > Math.abs(normal[pivot][i])) pivot = k
    ;[normal[i], normal[pivot]] = [normal[pivot], normal[i]]
    for (let k = 0; k < n; k++) {
      if (k === i) continue
      const factor = normal[k][i] / normal[i][i]
      for (let j = i; j <= n; j++) normal[k][j] -= factor * normal[i][j]
    }
  }
  return normal.map((row, i) => row[n] / row[i] / scale[i])
}
