/**
 * Nutation calculation — IAU 1980 model
 *
 * Ported from swephlib.c (Swiss Ephemeris)
 * Authors: Dieter Koch and Alois Treindl
 *
 * The IAU 1980 nutation model with 106 terms + Herring 1987 corrections.
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

const J2000 = 2451545.0
const DEG_TO_RAD = Math.PI / 180
const ENDMARK = 9999

/**
 * Nutation coefficient table (IAU 1980 + Herring 1987 corrections)
 *
 * Each row: [MM, MS, FF, DD, OM, LS, LS2, OC, OC2]
 * LS, OC are in units of 0.0001"; LS2, OC2 in 0.00001"
 * Entries starting with 101/102 are Herring 1987 corrections
 */
const nt: number[] = [
  // @formatter:off
   0, 0, 0, 0, 2,  2062,  2, -895,  5,
  -2, 0, 2, 0, 1,    46,  0,  -24,  0,
   2, 0,-2, 0, 0,    11,  0,    0,  0,
  -2, 0, 2, 0, 2,    -3,  0,    1,  0,
   1,-1, 0,-1, 0,    -3,  0,    0,  0,
   0,-2, 2,-2, 1,    -2,  0,    1,  0,
   2, 0,-2, 0, 1,     1,  0,    0,  0,
   0, 0, 2,-2, 2,-13187,-16, 5736,-31,
   0, 1, 0, 0, 0,  1426,-34,   54, -1,
   0, 1, 2,-2, 2,  -517, 12,  224, -6,
   0,-1, 2,-2, 2,   217, -5,  -95,  3,
   0, 0, 2,-2, 1,   129,  1,  -70,  0,
   2, 0, 0,-2, 0,    48,  0,    1,  0,
   0, 0, 2,-2, 0,   -22,  0,    0,  0,
   0, 2, 0, 0, 0,    17, -1,    0,  0,
   0, 1, 0, 0, 1,   -15,  0,    9,  0,
   0, 2, 2,-2, 2,   -16,  1,    7,  0,
   0,-1, 0, 0, 1,   -12,  0,    6,  0,
  -2, 0, 0, 2, 1,    -6,  0,    3,  0,
   0,-1, 2,-2, 1,    -5,  0,    3,  0,
   2, 0, 0,-2, 1,     4,  0,   -2,  0,
   0, 1, 2,-2, 1,     4,  0,   -2,  0,
   1, 0, 0,-1, 0,    -4,  0,    0,  0,
   2, 1, 0,-2, 0,     1,  0,    0,  0,
   0, 0,-2, 2, 1,     1,  0,    0,  0,
   0, 1,-2, 2, 0,    -1,  0,    0,  0,
   0, 1, 0, 0, 2,     1,  0,    0,  0,
  -1, 0, 0, 1, 1,     1,  0,    0,  0,
   0, 1, 2,-2, 0,    -1,  0,    0,  0,
   0, 0, 2, 0, 2, -2274, -2,  977, -5,
   1, 0, 0, 0, 0,   712,  1,   -7,  0,
   0, 0, 2, 0, 1,  -386, -4,  200,  0,
   1, 0, 2, 0, 2,  -301,  0,  129, -1,
   1, 0, 0,-2, 0,  -158,  0,   -1,  0,
  -1, 0, 2, 0, 2,   123,  0,  -53,  0,
   0, 0, 0, 2, 0,    63,  0,   -2,  0,
   1, 0, 0, 0, 1,    63,  1,  -33,  0,
  -1, 0, 0, 0, 1,   -58, -1,   32,  0,
  -1, 0, 2, 2, 2,   -59,  0,   26,  0,
   1, 0, 2, 0, 1,   -51,  0,   27,  0,
   0, 0, 2, 2, 2,   -38,  0,   16,  0,
   2, 0, 0, 0, 0,    29,  0,   -1,  0,
   1, 0, 2,-2, 2,    29,  0,  -12,  0,
   2, 0, 2, 0, 2,   -31,  0,   13,  0,
   0, 0, 2, 0, 0,    26,  0,   -1,  0,
  -1, 0, 2, 0, 1,    21,  0,  -10,  0,
  -1, 0, 0, 2, 1,    16,  0,   -8,  0,
   1, 0, 0,-2, 1,   -13,  0,    7,  0,
  -1, 0, 2, 2, 1,   -10,  0,    5,  0,
   1, 1, 0,-2, 0,    -7,  0,    0,  0,
   0, 1, 2, 0, 2,     7,  0,   -3,  0,
   0,-1, 2, 0, 2,    -7,  0,    3,  0,
   1, 0, 2, 2, 2,    -8,  0,    3,  0,
   1, 0, 0, 2, 0,     6,  0,    0,  0,
   2, 0, 2,-2, 2,     6,  0,   -3,  0,
   0, 0, 0, 2, 1,    -6,  0,    3,  0,
   0, 0, 2, 2, 1,    -7,  0,    3,  0,
   1, 0, 2,-2, 1,     6,  0,   -3,  0,
   0, 0, 0,-2, 1,    -5,  0,    3,  0,
   1,-1, 0, 0, 0,     5,  0,    0,  0,
   2, 0, 2, 0, 1,    -5,  0,    3,  0,
   0, 1, 0,-2, 0,    -4,  0,    0,  0,
   1, 0,-2, 0, 0,     4,  0,    0,  0,
   0, 0, 0, 1, 0,    -4,  0,    0,  0,
   1, 1, 0, 0, 0,    -3,  0,    0,  0,
   1, 0, 2, 0, 0,     3,  0,    0,  0,
   1,-1, 2, 0, 2,    -3,  0,    1,  0,
  -1,-1, 2, 2, 2,    -3,  0,    1,  0,
  -2, 0, 0, 0, 1,    -2,  0,    1,  0,
   3, 0, 2, 0, 2,    -3,  0,    1,  0,
   0,-1, 2, 2, 2,    -3,  0,    1,  0,
   1, 1, 2, 0, 2,     2,  0,   -1,  0,
  -1, 0, 2,-2, 1,    -2,  0,    1,  0,
   2, 0, 0, 0, 1,     2,  0,   -1,  0,
   1, 0, 0, 0, 2,    -2,  0,    1,  0,
   3, 0, 0, 0, 0,     2,  0,    0,  0,
   0, 0, 2, 1, 2,     2,  0,   -1,  0,
  -1, 0, 0, 0, 2,     1,  0,   -1,  0,
   1, 0, 0,-4, 0,    -1,  0,    0,  0,
  -2, 0, 2, 2, 2,     1,  0,   -1,  0,
  -1, 0, 2, 4, 2,    -2,  0,    1,  0,
   2, 0, 0,-4, 0,    -1,  0,    0,  0,
   1, 1, 2,-2, 2,     1,  0,   -1,  0,
   1, 0, 2, 2, 1,    -1,  0,    1,  0,
  -2, 0, 2, 4, 2,    -1,  0,    1,  0,
  -1, 0, 4, 0, 2,     1,  0,    0,  0,
   1,-1, 0,-2, 0,     1,  0,    0,  0,
   2, 0, 2,-2, 1,     1,  0,   -1,  0,
   2, 0, 2, 2, 2,    -1,  0,    0,  0,
   1, 0, 0, 2, 1,    -1,  0,    0,  0,
   0, 0, 4,-2, 2,     1,  0,    0,  0,
   3, 0, 2,-2, 2,     1,  0,    0,  0,
   1, 0, 2,-2, 0,    -1,  0,    0,  0,
   0, 1, 2, 0, 1,     1,  0,    0,  0,
  -1,-1, 0, 2, 1,     1,  0,    0,  0,
   0, 0,-2, 0, 1,    -1,  0,    0,  0,
   0, 0, 2,-1, 2,    -1,  0,    0,  0,
   0, 1, 0, 2, 0,    -1,  0,    0,  0,
   1, 0,-2,-2, 0,    -1,  0,    0,  0,
   0,-1, 2, 0, 1,    -1,  0,    0,  0,
   1, 1, 0,-2, 1,    -1,  0,    0,  0,
   1, 0,-2, 2, 0,    -1,  0,    0,  0,
   2, 0, 0, 2, 0,     1,  0,    0,  0,
   0, 0, 2, 4, 2,    -1,  0,    0,  0,
   0, 1, 0, 1, 0,     1,  0,    0,  0,
  // Herring 1987 corrections (flag=101: cos nutl, flag=102: sin nuto)
   101, 0, 0, 0, 1,-725, 0, 213, 0,
   101, 1, 0, 0, 0, 523, 0, 208, 0,
   101, 0, 2,-2, 2, 102, 0, -41, 0,
   101, 0, 2, 0, 2, -81, 0,  32, 0,
   102, 0, 0, 0, 1, 417, 0, 224, 0,
   102, 1, 0, 0, 0,  61, 0, -24, 0,
   102, 0, 2,-2, 2,-118, 0, -47, 0,
  ENDMARK,
  // @formatter:on
]

function degnorm(x: number): number {
  let y = x % 360.0
  if (Math.abs(y) < 1e-13) y = 0
  if (y < 0.0) y += 360.0
  return y
}

/**
 * Calculate nutation in longitude (dpsi) and obliquity (deps)
 *
 * IAU 1980 + Herring 1987 corrections
 *
 * @param tjd Julian day (TT)
 * @returns [dpsi, deps] in radians
 */
export function calcNutation(tjd: number): [number, number] {
  const T = (tjd - J2000) / 36525.0
  const T2 = T * T

  // Fundamental arguments (FK5 reference system), in arcseconds → degrees → radians
  const OM = degnorm((-6962890.539 * T + 450160.280 + (0.008 * T + 7.455) * T2) / 3600) * DEG_TO_RAD
  const MS = degnorm((129596581.224 * T + 1287099.804 - (0.012 * T + 0.577) * T2) / 3600) * DEG_TO_RAD
  const MM = degnorm((1717915922.633 * T + 485866.733 + (0.064 * T + 31.310) * T2) / 3600) * DEG_TO_RAD
  const FF = degnorm((1739527263.137 * T + 335778.877 + (0.011 * T - 13.257) * T2) / 3600) * DEG_TO_RAD
  const DD = degnorm((1602961601.328 * T + 1072261.307 + (0.019 * T - 6.891) * T2) / 3600) * DEG_TO_RAD

  const args = [MM, MS, FF, DD, OM]
  const ns = [3, 2, 4, 4, 2]

  // Pre-compute sin/cos of multiple angles
  const ss: number[][] = new Array(5)
  const cc: number[][] = new Array(5)
  for (let k = 0; k <= 4; k++) {
    ss[k] = new Array(8)
    cc[k] = new Array(8)
    const arg = args[k]
    const n = ns[k]
    let su = Math.sin(arg)
    let cu = Math.cos(arg)
    ss[k][0] = su
    cc[k][0] = cu
    let sv = 2.0 * su * cu
    let cv = cu * cu - su * su
    ss[k][1] = sv
    cc[k][1] = cv
    for (let i = 2; i < n; i++) {
      const s = su * cv + cu * sv
      cv = cu * cv - su * sv
      sv = s
      ss[k][i] = sv
      cc[k][i] = cv
    }
  }

  // First terms (not in table)
  let C = (-0.01742 * T - 17.1996) * ss[4][0]  // sin(OM)
  let D = (0.00089 * T + 9.2025) * cc[4][0]    // cos(OM)

  // Process table entries
  let p = 0
  while (nt[p] !== ENDMARK) {
    // argument of sine and cosine
    let k1 = 0
    let cv = 0.0
    let sv = 0.0
    for (let m = 0; m < 5; m++) {
      let j = nt[p + m]
      if (j > 100) j = 0  // p[0] is a flag
      if (j !== 0) {
        let k = j
        if (j < 0) k = -k
        let su = ss[m][k - 1]
        if (j < 0) su = -su
        const cu = cc[m][k - 1]
        if (k1 === 0) {
          sv = su
          cv = cu
          k1 = 1
        } else {
          const sw = su * cv + cu * sv
          cv = cu * cv - su * sv
          sv = sw
        }
      }
    }

    // longitude coefficient (in 0.0001")
    let f = nt[p + 5] * 0.0001
    if (nt[p + 6] !== 0) f += 0.00001 * T * nt[p + 6]

    // obliquity coefficient (in 0.0001")
    let g = nt[p + 7] * 0.0001
    if (nt[p + 8] !== 0) g += 0.00001 * T * nt[p + 8]

    if (nt[p] >= 100) {
      f *= 0.1
      g *= 0.1
    }

    if (nt[p] !== 102) {
      C += f * sv
      D += g * cv
    } else {
      // cos for nutl, sin for nuto
      C += f * cv
      D += g * sv
    }

    p += 9
  }

  const dpsi = DEG_TO_RAD * C / 3600.0
  const deps = DEG_TO_RAD * D / 3600.0
  return [dpsi, deps]
}
