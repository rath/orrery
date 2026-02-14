/**
 * Moshier lunar theory — DE404 fit variant
 *
 * Ported from swemmoon.c (Swiss Ephemeris)
 * Original author: Steve Moshier (August 1991)
 * Adapted for Swiss Ephemeris by Dieter Koch (April 1996)
 * DE404 fit by Steve Moshier (October 1995)
 *
 * Computes geocentric ecliptic position of the Moon using
 * truncated Taylor series of perturbation integrals.
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

import { polcart, coortrf2 } from './math.ts'
import { precess } from './precession.ts'
import { calcObliquity } from './obliquity.ts'
import { deltaT } from './deltat.ts'
import {
  STR,
  MOON_SPEED_INTV,
  MOON_MEAN_DIST_KM,
  Z,
  NLR, LR,
  NMB, MB,
  NLRT, LRT,
  NBT, BT,
  NLRT2, LRT2,
  NBT2, BT2,
} from './tables/moon-coefficients.ts'

const J2000 = 2451545.0
const AUNIT = 1.49597870700e+11 // meters

// ─── Module-level state (mirrors C static variables) ───────────────────

let ss: number[][] = Array.from({ length: 5 }, () => new Array(8).fill(0))
let cc: number[][] = Array.from({ length: 5 }, () => new Array(8).fill(0))

let SWELP = 0
let M = 0
let MP = 0
let D = 0
let NF = 0

let T = 0
let T2 = 0

let Ve = 0
let Ea = 0
let Ma = 0
let Ju = 0
let Sa = 0

let f = 0
let g = 0
let cg = 0
let sg = 0

let l = 0
let l1 = 0
let l2 = 0
let l3 = 0
let l4 = 0
let B = 0

let moonpol = [0, 0, 0]

// ─── Utility functions ─────────────────────────────────────────────────

function mods3600(x: number): number {
  return x - 1296000.0 * Math.floor(x / 1296000.0)
}

/**
 * Build lookup table of sin(i*arg) and cos(i*arg) for i = 1..n.
 */
function sscc(k: number, arg: number, n: number): void {
  const su = Math.sin(arg)
  const cu = Math.cos(arg)
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

// ─── chewm: evaluate perturbation series ───────────────────────────────

/**
 * Evaluate a Chebyshev-like perturbation series.
 *
 * @param pt       coefficient table (flat array)
 * @param nlines   number of rows
 * @param nangles  number of angle-factor entries per row
 * @param typflg   1=large lon+rad, 2=lon+rad, 3=large lat, 4=lat
 * @param ans      [longitude, latitude, radius] accumulator
 */
function chewm(
  pt: readonly number[],
  nlines: number,
  nangles: number,
  typflg: number,
  ans: number[],
): void {
  let p = 0
  for (let i = 0; i < nlines; i++) {
    let k1 = 0
    let sv = 0.0
    let cv = 0.0
    for (let m = 0; m < nangles; m++) {
      const j = pt[p++]
      if (j !== 0) {
        let k = j
        if (j < 0) k = -k
        let su = ss[m][k - 1]
        const cu = cc[m][k - 1]
        if (j < 0) su = -su
        if (k1 === 0) {
          sv = su
          cv = cu
          k1 = 1
        } else {
          const ff = su * cv + cu * sv
          cv = cu * cv - su * sv
          sv = ff
        }
      }
    }
    switch (typflg) {
      case 1: {
        // large longitude and radius
        const j1 = pt[p++]
        const k1v = pt[p++]
        ans[0] += (10000.0 * j1 + k1v) * sv
        const j2 = pt[p++]
        const k2 = pt[p++]
        if (k2) ans[2] += (10000.0 * j2 + k2) * cv
        break
      }
      case 2: {
        // longitude and radius
        const jv = pt[p++]
        const kv = pt[p++]
        ans[0] += jv * sv
        ans[2] += kv * cv
        break
      }
      case 3: {
        // large latitude
        const jv = pt[p++]
        const kv = pt[p++]
        ans[1] += (10000.0 * jv + kv) * sv
        break
      }
      case 4: {
        // latitude
        const jv = pt[p++]
        ans[1] += jv * sv
        break
      }
    }
  }
}

// ─── Mean elements (DE404 variant) ─────────────────────────────────────

/**
 * Mean elements of the lunar orbit — DE404 fit.
 *
 * Sets module-level variables: M, NF, MP, D, SWELP.
 */
function mean_elements(): void {
  const fracT = T - Math.trunc(T)

  // Mean anomaly of sun = l' (J. Laskar)
  M = mods3600(129600000.0 * fracT - 3418.961646 * T + 1287104.76154)
  M += ((((((((
    1.62e-20 * T
    - 1.0390e-17) * T
    - 3.83508e-15) * T
    + 4.237343e-13) * T
    + 8.8555011e-11) * T
    - 4.77258489e-8) * T
    - 1.1297037031e-5) * T
    + 1.4732069041e-4) * T
    - 0.552891801772) * T2

  // Mean distance of moon from its ascending node = F
  NF = mods3600(1739232000.0 * fracT + 295263.0983 * T - 2.079419901760e-01 * T + 335779.55755)

  // Mean anomaly of moon = l
  MP = mods3600(1717200000.0 * fracT + 715923.4728 * T - 2.035946368532e-01 * T + 485868.28096)

  // Mean elongation of moon = D
  D = mods3600(1601856000.0 * fracT + 1105601.4603 * T + 3.962893294503e-01 * T + 1072260.73512)

  // Mean longitude of moon, referred to the mean ecliptic and equinox of date
  SWELP = mods3600(1731456000.0 * fracT + 1108372.83264 * T - 6.784914260953e-01 * T + 785939.95571)

  // Higher degree secular terms (DE404 z[] indices 0–11)
  NF += ((Z[2] * T + Z[1]) * T + Z[0]) * T2
  MP += ((Z[5] * T + Z[4]) * T + Z[3]) * T2
  D += ((Z[8] * T + Z[7]) * T + Z[6]) * T2
  SWELP += ((Z[11] * T + Z[10]) * T + Z[9]) * T2
}

// ─── Mean planetary longitudes (Laskar, Bretagnon) ─────────────────────

/**
 * Compute mean longitudes of Venus through Saturn in arcseconds.
 *
 * Sets module-level variables: Ve, Ea, Ma, Ju, Sa.
 */
function mean_elements_pl(): void {
  Ve = mods3600(210664136.4335482 * T + 655127.283046)
  Ve += ((((((((
    -9.36e-23 * T
    - 1.95e-20) * T
    + 6.097e-18) * T
    + 4.43201e-15) * T
    + 2.509418e-13) * T
    - 3.0622898e-10) * T
    - 2.26602516e-9) * T
    - 1.4244812531e-5) * T
    + 0.005871373088) * T2

  Ea = mods3600(129597742.26669231 * T + 361679.214649)
  Ea += ((((((((
    -1.16e-22 * T
    + 2.976e-19) * T
    + 2.8460e-17) * T
    - 1.08402e-14) * T
    - 1.226182e-12) * T
    + 1.7228268e-10) * T
    + 1.515912254e-7) * T
    + 8.863982531e-6) * T
    - 2.0199859001e-2) * T2

  Ma = mods3600(68905077.59284 * T + 1279559.78866)
  Ma += (-1.043e-5 * T + 9.38012e-3) * T2

  Ju = mods3600(10925660.428608 * T + 123665.342120)
  Ju += (1.543273e-5 * T - 3.06037836351e-1) * T2

  Sa = mods3600(4399609.65932 * T + 180278.89694)
  Sa += ((4.475946e-8 * T - 6.874806e-5) * T + 7.56161437443e-1) * T2
}

// ─── moon1: T^2 and T^1 perturbation terms (DE404) ────────────────────

function moon1(): void {
  let a: number

  // Clear ss/cc tables (Bhanu Pinnamaneni fix)
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 8; j++) {
      ss[i][j] = 0
      cc[i][j] = 0
    }
  }

  sscc(0, STR * D, 6)
  sscc(1, STR * M, 4)
  sscc(2, STR * MP, 4)
  sscc(3, STR * NF, 4)

  moonpol[0] = 0.0
  moonpol[1] = 0.0
  moonpol[2] = 0.0

  // Terms in T^2, scale 1.0 = 10^-5"
  chewm(LRT2, NLRT2, 4, 2, moonpol)
  chewm(BT2, NBT2, 4, 4, moonpol)

  f = 18 * Ve - 16 * Ea

  // 18V - 16E - l
  g = STR * (f - MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l = 6.367278 * cg + 12.747036 * sg       // t^0
  l1 = 23123.70 * cg - 10570.02 * sg       // t^1
  l2 = Z[12] * cg + Z[13] * sg             // t^2
  moonpol[2] += 5.01 * cg + 2.72 * sg

  // 10V - 3E - l
  g = STR * (10.0 * Ve - 3.0 * Ea - MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.253102 * cg + 0.503359 * sg
  l1 += 1258.46 * cg + 707.29 * sg
  l2 += Z[14] * cg + Z[15] * sg

  // 8V - 13E
  g = STR * (8.0 * Ve - 13.0 * Ea)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.187231 * cg - 0.127481 * sg
  l1 += -319.87 * cg - 18.34 * sg
  l2 += Z[16] * cg + Z[17] * sg

  // 4E - 8M + 3J
  a = 4.0 * Ea - 8.0 * Ma + 3.0 * Ju
  g = STR * a
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.866287 * cg + 0.248192 * sg
  l1 += 41.87 * cg + 1053.97 * sg
  l2 += Z[18] * cg + Z[19] * sg

  // 4E - 8M + 3J - l
  g = STR * (a - MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.165009 * cg + 0.044176 * sg
  l1 += 4.67 * cg + 201.55 * sg

  // 18V - 16E
  g = STR * f
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += 0.330401 * cg + 0.661362 * sg
  l1 += 1202.67 * cg - 555.59 * sg
  l2 += Z[20] * cg + Z[21] * sg

  // 18V - 16E - 2l
  g = STR * (f - 2.0 * MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += 0.352185 * cg + 0.705041 * sg
  l1 += 1283.59 * cg - 586.43 * sg

  // 2J - 5S
  g = STR * (2.0 * Ju - 5.0 * Sa)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.034700 * cg + 0.160041 * sg
  l2 += Z[22] * cg + Z[23] * sg

  // L - F
  g = STR * (SWELP - NF)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += 0.000116 * cg + 7.063040 * sg
  l1 += 298.8 * sg

  // T^3 terms
  sg = Math.sin(STR * M)
  l3 = Z[24] * sg
  l4 = 0

  // Small latitude corrections (T^1 scaled)
  g = STR * (2.0 * D - M)
  sg = Math.sin(g)
  cg = Math.cos(g)
  moonpol[2] += -0.2655 * cg * T

  g = STR * (M - MP)
  moonpol[2] += -0.1568 * Math.cos(g) * T

  g = STR * (M + MP)
  moonpol[2] += 0.1309 * Math.cos(g) * T

  g = STR * (2.0 * (D + M) - MP)
  sg = Math.sin(g)
  cg = Math.cos(g)
  moonpol[2] += 0.5568 * cg * T

  l2 += moonpol[0]

  g = STR * (2.0 * D - M - MP)
  moonpol[2] += -0.1910 * Math.cos(g) * T

  moonpol[1] *= T
  moonpol[2] *= T

  // Terms in T^1
  moonpol[0] = 0.0
  chewm(BT, NBT, 4, 4, moonpol)
  chewm(LRT, NLRT, 4, 1, moonpol)

  // 18V - 16E - l - F
  g = STR * (f - MP - NF - 2355767.6)
  moonpol[1] += -1127.0 * Math.sin(g)

  // 18V - 16E - l + F
  g = STR * (f - MP + NF - 235353.6)
  moonpol[1] += -1123.0 * Math.sin(g)

  g = STR * (Ea + D + 51987.6)
  moonpol[1] += 1303.0 * Math.sin(g)

  g = STR * SWELP
  moonpol[1] += 342.0 * Math.sin(g)

  // 2Ve - 3Ea
  g = STR * (2.0 * Ve - 3.0 * Ea)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.343550 * cg - 0.000276 * sg
  l1 += 105.90 * cg + 336.53 * sg

  // 18V - 16E - 2D
  g = STR * (f - 2.0 * D)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += 0.074668 * cg + 0.149501 * sg
  l1 += 271.77 * cg - 124.20 * sg

  // 18V - 16E - 2D - l
  g = STR * (f - 2.0 * D - MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += 0.073444 * cg + 0.147094 * sg
  l1 += 265.24 * cg - 121.16 * sg

  // 18V - 16E + 2D - l
  g = STR * (f + 2.0 * D - MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += 0.072844 * cg + 0.145829 * sg
  l1 += 265.18 * cg - 121.29 * sg

  // 18V - 16E + 2D - 2l
  g = STR * (f + 2.0 * (D - MP))
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += 0.070201 * cg + 0.140542 * sg
  l1 += 255.36 * cg - 116.79 * sg

  // Ea + D - F
  g = STR * (Ea + D - NF)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += 0.288209 * cg - 0.025901 * sg
  l1 += -63.51 * cg - 240.14 * sg

  // 2Ea - 3Ju + 2D - l
  g = STR * (2.0 * Ea - 3.0 * Ju + 2.0 * D - MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += 0.077865 * cg + 0.438460 * sg
  l1 += 210.57 * cg + 124.84 * sg

  // Ea - 2Ma
  g = STR * (Ea - 2.0 * Ma)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.216579 * cg + 0.241702 * sg
  l1 += 197.67 * cg + 125.23 * sg

  // (4E - 8M + 3J) + l
  g = STR * (a + MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.165009 * cg + 0.044176 * sg
  l1 += 4.67 * cg + 201.55 * sg

  // (4E - 8M + 3J) + 2D - l
  g = STR * (a + 2.0 * D - MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.133533 * cg + 0.041116 * sg
  l1 += 6.95 * cg + 187.07 * sg

  // (4E - 8M + 3J) - 2D + l
  g = STR * (a - 2.0 * D + MP)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.133430 * cg + 0.041079 * sg
  l1 += 6.28 * cg + 169.08 * sg

  // 3Ve - 4Ea
  g = STR * (3.0 * Ve - 4.0 * Ea)
  cg = Math.cos(g)
  sg = Math.sin(g)
  l += -0.175074 * cg + 0.003035 * sg
  l1 += 49.17 * cg + 150.57 * sg

  // 2(Ea + D - l) - 3Ju + const
  g = STR * (2.0 * (Ea + D - MP) - 3.0 * Ju + 213534.0)
  l1 += 158.4 * Math.sin(g)

  l1 += moonpol[0]

  // Set amplitude scale: 1.0 = 10^-4 arcsec
  a = 0.1 * T
  moonpol[1] *= a
  moonpol[2] *= a
}

// ─── moon2: small T^0 terms ───────────────────────────────────────────

function moon2(): void {
  // Longitude terms (T^0)
  g = STR * (2 * (Ea - Ju + D) - MP + 648431.172)
  l += 1.14307 * Math.sin(g)

  g = STR * (Ve - Ea + 648035.568)
  l += 0.82155 * Math.sin(g)

  g = STR * (3 * (Ve - Ea) + 2 * D - MP + 647933.184)
  l += 0.64371 * Math.sin(g)

  g = STR * (Ea - Ju + 4424.04)
  l += 0.63880 * Math.sin(g)

  g = STR * (SWELP + MP - NF + 4.68)
  l += 0.49331 * Math.sin(g)

  g = STR * (SWELP - MP - NF + 4.68)
  l += 0.4914 * Math.sin(g)

  g = STR * (SWELP + NF + 2.52)
  l += 0.36061 * Math.sin(g)

  g = STR * (2.0 * Ve - 2.0 * Ea + 736.2)
  l += 0.30154 * Math.sin(g)

  g = STR * (2.0 * Ea - 3.0 * Ju + 2.0 * D - 2.0 * MP + 36138.2)
  l += 0.28282 * Math.sin(g)

  g = STR * (2.0 * Ea - 2.0 * Ju + 2.0 * D - 2.0 * MP + 311.0)
  l += 0.24516 * Math.sin(g)

  g = STR * (Ea - Ju - 2.0 * D + MP + 6275.88)
  l += 0.21117 * Math.sin(g)

  g = STR * (2.0 * (Ea - Ma) - 846.36)
  l += 0.19444 * Math.sin(g)

  g = STR * (2.0 * (Ea - Ju) + 1569.96)
  l -= 0.18457 * Math.sin(g)

  g = STR * (2.0 * (Ea - Ju) - MP - 55.8)
  l += 0.18256 * Math.sin(g)

  g = STR * (Ea - Ju - 2.0 * D + 6490.08)
  l += 0.16499 * Math.sin(g)

  g = STR * (Ea - 2.0 * Ju - 212378.4)
  l += 0.16427 * Math.sin(g)

  g = STR * (2.0 * (Ve - Ea - D) + MP + 1122.48)
  l += 0.16088 * Math.sin(g)

  g = STR * (Ve - Ea - MP + 32.04)
  l -= 0.15350 * Math.sin(g)

  g = STR * (Ea - Ju - MP + 4488.88)
  l += 0.14346 * Math.sin(g)

  g = STR * (2.0 * (Ve - Ea + D) - MP - 8.64)
  l += 0.13594 * Math.sin(g)

  g = STR * (2.0 * (Ve - Ea - D) + 1319.76)
  l += 0.13432 * Math.sin(g)

  g = STR * (Ve - Ea - 2.0 * D + MP - 56.16)
  l -= 0.13122 * Math.sin(g)

  g = STR * (Ve - Ea + MP + 54.36)
  l -= 0.12722 * Math.sin(g)

  g = STR * (3.0 * (Ve - Ea) - MP + 433.8)
  l += 0.12539 * Math.sin(g)

  g = STR * (Ea - Ju + MP + 4002.12)
  l += 0.10994 * Math.sin(g)

  g = STR * (20.0 * Ve - 21.0 * Ea - 2.0 * D + MP - 317511.72)
  l += 0.10652 * Math.sin(g)

  g = STR * (26.0 * Ve - 29.0 * Ea - MP + 270002.52)
  l += 0.10490 * Math.sin(g)

  g = STR * (3.0 * Ve - 4.0 * Ea + D - MP - 322765.56)
  l += 0.10386 * Math.sin(g)

  // Latitude terms (T^0)
  g = STR * (SWELP + 648002.556)
  B = 8.04508 * Math.sin(g)

  g = STR * (Ea + D + 996048.252)
  B += 1.51021 * Math.sin(g)

  g = STR * (f - MP + NF + 95554.332)
  B += 0.63037 * Math.sin(g)

  g = STR * (f - MP - NF + 95553.792)
  B += 0.63014 * Math.sin(g)

  g = STR * (SWELP - MP + 2.9)
  B += 0.45587 * Math.sin(g)

  g = STR * (SWELP + MP + 2.5)
  B += -0.41573 * Math.sin(g)

  g = STR * (SWELP - 2.0 * NF + 3.2)
  B += 0.32623 * Math.sin(g)

  g = STR * (SWELP - 2.0 * D + 2.5)
  B += 0.29855 * Math.sin(g)
}

// ─── moon3: main T^0 terms ────────────────────────────────────────────

function moon3(): void {
  moonpol[0] = 0.0
  chewm(LR, NLR, 4, 1, moonpol)
  chewm(MB, NMB, 4, 3, moonpol)

  l += (((l4 * T + l3) * T + l2) * T + l1) * T * 1.0e-5

  moonpol[0] = SWELP + l + 1.0e-4 * moonpol[0]
  moonpol[1] = 1.0e-4 * moonpol[1] + B
  moonpol[2] = 1.0e-4 * moonpol[2] + MOON_MEAN_DIST_KM // 385000.52899 km
}

// ─── moon4: final unit conversion ──────────────────────────────────────

function moon4(): void {
  // km → AU
  moonpol[2] /= AUNIT / 1000
  // arcsec → radians
  moonpol[0] = STR * mods3600(moonpol[0])
  moonpol[1] = STR * moonpol[1]
  B = moonpol[1]
}

// ─── moshmoon2: orchestrator ───────────────────────────────────────────

function moshmoon2(J: number): number[] {
  T = (J - J2000) / 36525.0
  T2 = T * T

  mean_elements()
  mean_elements_pl()
  moon1()
  moon2()
  moon3()
  moon4()

  return [moonpol[0], moonpol[1], moonpol[2]]
}

// ─── ecldat_equ2000: ecliptic of date → equatorial J2000 ──────────────

/**
 * Convert polar ecliptic coordinates (of date) to equatorial J2000 cartesian.
 *
 * Modifies xpm in-place: input [lon, lat, dist] → output [x, y, z].
 */
function ecldat_equ2000(tjd: number, xpm: number[]): void {
  // Polar → cartesian
  const cart = polcart([xpm[0], xpm[1], xpm[2]])

  // Obliquity of date (need TT for obliquity)
  const tjde = tjd + deltaT(tjd)
  const eps = calcObliquity(tjde)

  // Ecliptic → equatorial rotation
  const eq = coortrf2([cart[0], cart[1], cart[2], 0, 0, 0], -eps)

  // Precess: epoch of date → J2000
  precess(eq, tjde, 1)

  xpm[0] = eq[0]
  xpm[1] = eq[1]
  xpm[2] = eq[2]
}

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Compute geocentric equatorial J2000 position and velocity of the Moon.
 *
 * Implements the Moshier lunar theory (DE404 fit).
 * Speed is obtained via parabolic interpolation of three positions.
 *
 * @param tjd  Julian day (UT)
 * @returns Object with `xp`: [x, y, z, vx, vy, vz] in AU and AU/day
 */
export function calcMoon(tjd: number): { xp: number[] } {
  // Central position
  const xpm = moshmoon2(tjd)
  ecldat_equ2000(tjd, xpm)

  // Forward position
  const t1 = tjd + MOON_SPEED_INTV
  const x1 = moshmoon2(t1)
  ecldat_equ2000(t1, x1)

  // Backward position
  const t2 = tjd - MOON_SPEED_INTV
  const x2 = moshmoon2(t2)
  ecldat_equ2000(t2, x2)

  // Parabolic interpolation for speed
  const xp = new Array(6)
  for (let i = 0; i <= 2; i++) {
    xp[i] = xpm[i]
    const b = (x1[i] - x2[i]) / 2
    const a = (x1[i] + x2[i]) / 2 - xpm[i]
    xp[i + 3] = (2 * a + b) / MOON_SPEED_INTV
  }

  return { xp }
}
