/**
 * Astrological house system calculations
 *
 * Ported from swehouse.c / swephlib.c (Swiss Ephemeris)
 * Authors: Dieter Koch and Alois Treindl
 *
 * Supports 10 house systems:
 *   P = Placidus, K = Koch, O = Porphyrius, R = Regiomontanus,
 *   C = Campanus, E = Equal, W = Whole Sign, B = Alcabitus,
 *   M = Morinus, T = Topocentric
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

import { degnorm, DEG_TO_RAD, RAD_TO_DEG } from './math'
import { calcObliquity } from './obliquity'
import { calcNutation } from './nutation'
import { deltaT } from './deltat'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HousesResult {
  cusps: number[]   // cusps[1..12] in degrees (index 0 unused)
  ascmc: number[]   // ascmc[0]=ASC, ascmc[1]=MC, ascmc[2]=ARMC
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VERY_SMALL = 1e-10

// ---------------------------------------------------------------------------
// Trigonometric helpers (degree-based)
// ---------------------------------------------------------------------------

const sind = (x: number): number => Math.sin(x * DEG_TO_RAD)
const cosd = (x: number): number => Math.cos(x * DEG_TO_RAD)
const tand = (x: number): number => Math.tan(x * DEG_TO_RAD)
const asind = (x: number): number => Math.asin(x) * RAD_TO_DEG
const acosd = (x: number): number => Math.acos(x) * RAD_TO_DEG
const atand = (x: number): number => Math.atan(x) * RAD_TO_DEG

/** Clamp value to [-1, 1] for asin/acos safety */
function clamp1(x: number): number {
  if (x > 1) return 1
  if (x < -1) return -1
  return x
}

// ---------------------------------------------------------------------------
// Ascendant helper functions (from swehouse.c)
// ---------------------------------------------------------------------------

/**
 * Compute the ecliptic longitude rising at a given ARMC offset.
 *
 * @param x  ARMC + offset (degrees)
 * @param f  geographic latitude (degrees)
 * @param sine  sin(obliquity)
 * @param cose  cos(obliquity)
 */
function Asc1(x1: number, f: number, sine: number, cose: number): number {
  x1 = degnorm(x1)
  const n = Math.floor(x1 / 90) + 1
  if (Math.abs(90 - f) < VERY_SMALL) return 180
  if (Math.abs(90 + f) < VERY_SMALL) return 0
  let ass: number
  if (n === 1) {
    ass = Asc2(x1, f, sine, cose)
  } else if (n === 2) {
    ass = 180 - Asc2(180 - x1, -f, sine, cose)
  } else if (n === 3) {
    ass = 180 + Asc2(x1 - 180, -f, sine, cose)
  } else {
    ass = 360 - Asc2(360 - x1, f, sine, cose)
  }
  ass = degnorm(ass)
  if (Math.abs(ass - 90) < VERY_SMALL) ass = 90
  if (Math.abs(ass - 180) < VERY_SMALL) ass = 180
  if (Math.abs(ass - 270) < VERY_SMALL) ass = 270
  if (Math.abs(ass - 360) < VERY_SMALL) ass = 0
  return ass
}

function Asc2(x: number, f: number, sine: number, cose: number): number {
  let ass = -tand(f) * sine + cose * cosd(x)
  if (Math.abs(ass) < VERY_SMALL) ass = 0
  let sinx = sind(x)
  if (Math.abs(sinx) < VERY_SMALL) sinx = 0
  if (sinx === 0) {
    ass = (ass < 0) ? -VERY_SMALL : VERY_SMALL
  } else if (ass === 0) {
    ass = (sinx < 0) ? -90 : 90
  } else {
    ass = atand(sinx / ass)
  }
  if (ass < 0) ass = 180 + ass
  return ass
}

// ---------------------------------------------------------------------------
// Angle difference helper
// ---------------------------------------------------------------------------

/** Normalized difference p1 - p2 in range (-180, 180] */
function difdeg2n(p1: number, p2: number): number {
  let d = degnorm(p1 - p2)
  if (d > 180) d -= 360
  return d
}

// ---------------------------------------------------------------------------
// Sidereal time — IAU 1976 (from swephlib.c swe_sidtime0)
// ---------------------------------------------------------------------------

/**
 * Greenwich Mean Sidereal Time with equation of equinoxes.
 *
 * @param tjd_ut  Julian day in UT
 * @param eps     obliquity (degrees), true (mean + nutation in obliquity)
 * @param nut     nutation in longitude (degrees)
 * @returns GMST in hours [0, 24)
 */
function sidtime0(tjd_ut: number, eps: number, nut: number): number {
  const jd = tjd_ut
  let jd0 = Math.floor(jd)
  let secs = tjd_ut - jd0
  if (secs < 0.5) {
    jd0 -= 0.5
    secs += 0.5
  } else {
    jd0 += 0.5
    secs -= 0.5
  }
  secs *= 86400.0
  const tu = (jd0 - 2451545.0) / 36525.0
  let gmst = ((-6.2e-6 * tu + 9.3104e-2) * tu + 8640184.812866) * tu + 24110.54841
  const msday =
    1.0 +
    ((-1.86e-5 * tu + 0.186208) * tu + 8640184.812866) / (86400 * 36525)
  gmst += msday * secs
  // equation of equinoxes
  const eqeq = 240.0 * nut * Math.cos(eps * DEG_TO_RAD)
  gmst += eqeq
  gmst = gmst - 86400.0 * Math.floor(gmst / 86400.0)
  return gmst / 3600 // hours
}

// ---------------------------------------------------------------------------
// Compute opposite houses: cusps 4-9 from cusps 10,11,12,1,2,3
// ---------------------------------------------------------------------------

function computeOpposites(cusps: number[]): void {
  cusps[4] = degnorm(cusps[10] + 180)
  cusps[5] = degnorm(cusps[11] + 180)
  cusps[6] = degnorm(cusps[12] + 180)
  cusps[7] = degnorm(cusps[1] + 180)
  cusps[8] = degnorm(cusps[2] + 180)
  cusps[9] = degnorm(cusps[3] + 180)
}

// ---------------------------------------------------------------------------
// Polar region fix (Regiomontanus, Campanus, Topocentric)
// ---------------------------------------------------------------------------

function polarFix(cusps: number[]): void {
  const acmc = difdeg2n(cusps[1], cusps[10])
  if (acmc < 0) {
    cusps[1] = degnorm(cusps[1] + 180)
    cusps[2] = degnorm(cusps[2] + 180)
    cusps[3] = degnorm(cusps[3] + 180)
    cusps[10] = degnorm(cusps[10] + 180)
    cusps[11] = degnorm(cusps[11] + 180)
    cusps[12] = degnorm(cusps[12] + 180)
  }
}

// ---------------------------------------------------------------------------
// Individual house systems
// ---------------------------------------------------------------------------

/** Porphyrius (O): equal trisection of quadrants */
function housesPorphyry(
  cusps: number[], ac: number, mc: number,
): void {
  cusps[1] = ac
  cusps[10] = mc
  let acmc = difdeg2n(ac, mc)
  let acUsed = ac
  if (acmc < 0) {
    acUsed = degnorm(ac + 180)
    acmc = difdeg2n(acUsed, mc)
  }
  cusps[11] = degnorm(mc + acmc / 3)
  cusps[12] = degnorm(mc + (acmc / 3) * 2)
  cusps[2] = degnorm(acUsed + (180 - acmc) / 3)
  cusps[3] = degnorm(acUsed + ((180 - acmc) / 3) * 2)
  computeOpposites(cusps)
}

/** Placidus (P): iterative semi-arc division */
function housesPlacidus(
  cusps: number[],
  th: number, fi: number, ekl: number,
  sine: number, cose: number,
  ac: number, mc: number,
): void {
  // Polar circle check: fall back to Porphyry
  if (Math.abs(fi) >= 90 - ekl) {
    housesPorphyry(cusps, ac, mc)
    return
  }

  cusps[1] = ac
  cusps[10] = mc

  // Cusp 11: offset 30, fraction 1/3 of semi-diurnal arc (add)
  cusps[11] = placidusIter(th, fi, sine, cose, 30, 1 / 3, 1)
  // Cusp 12: offset 60, fraction 2/3 of semi-diurnal arc (add)
  cusps[12] = placidusIter(th, fi, sine, cose, 60, 2 / 3, 1)
  // Cusp 2: offset 120, fraction 2/3 of semi-nocturnal arc (subtract)
  cusps[2] = placidusIter(th, fi, sine, cose, 120, 2 / 3, -1)
  // Cusp 3: offset 150, fraction 1/3 of semi-nocturnal arc (subtract)
  cusps[3] = placidusIter(th, fi, sine, cose, 150, 1 / 3, -1)

  computeOpposites(cusps)
}

/**
 * Placidus iteration for a single cusp.
 *
 * @param th     ARMC (degrees)
 * @param fi     geographic latitude (degrees)
 * @param sine   sin(obliquity)
 * @param cose   cos(obliquity)
 * @param offset base ARMC offset (30, 60, 120, 150)
 * @param frac   fraction of semi-arc (1/3 or 2/3)
 * @param sign   +1 for diurnal (cusps 11,12), -1 for nocturnal (cusps 2,3)
 */
function placidusIter(
  th: number, fi: number,
  sine: number, cose: number,
  offset: number, frac: number, sign: number,
): number {
  let x = Asc1(th + offset, fi, sine, cose)
  for (let iter = 0; iter < 100; iter++) {
    // Declination of ecliptic point x
    const dec = asind(clamp1(sind(x) * sine))
    // Ascensional difference of point x at latitude fi
    const ad = asind(clamp1(tand(dec) * tand(fi)))
    // New ARMC offset adjusted by fraction of ascensional difference
    const xNew = Asc1(th + offset + sign * ad * frac, fi, sine, cose)
    if (Math.abs(xNew - x) < VERY_SMALL) {
      return xNew
    }
    x = xNew
  }
  return x
}

/** Koch (K) */
function housesKoch(
  cusps: number[],
  th: number, fi: number,
  sine: number, cose: number,
  ac: number, mc: number,
  ekl: number,
): void {
  // Polar circle check: fall back to Porphyry
  if (Math.abs(fi) >= 90 - ekl) {
    housesPorphyry(cusps, ac, mc)
    return
  }

  cusps[1] = ac
  cusps[10] = mc

  const tanfi = tand(fi)
  const cosfi = cosd(fi)

  let sina = sind(mc) * sine / cosfi
  sina = clamp1(sina)
  const cosa = Math.sqrt(1 - sina * sina)
  const c = atand(tanfi / cosa)
  const ad3 = asind(clamp1(sind(c) * sina)) / 3.0

  cusps[11] = Asc1(th + 30 - 2 * ad3, fi, sine, cose)
  cusps[12] = Asc1(th + 60 - ad3, fi, sine, cose)
  cusps[2] = Asc1(th + 120 + ad3, fi, sine, cose)
  cusps[3] = Asc1(th + 150 + 2 * ad3, fi, sine, cose)

  computeOpposites(cusps)
}

/** Regiomontanus (R) */
function housesRegiomontanus(
  cusps: number[],
  th: number, fi: number,
  sine: number, cose: number,
  ac: number, mc: number,
  ekl: number,
): void {
  cusps[1] = ac
  cusps[10] = mc

  const tanfi = tand(fi)
  const fh1 = atand(tanfi * 0.5)
  const fh2 = atand(tanfi * cosd(30))

  cusps[11] = Asc1(30 + th, fh1, sine, cose)
  cusps[12] = Asc1(60 + th, fh2, sine, cose)
  cusps[2] = Asc1(120 + th, fh2, sine, cose)
  cusps[3] = Asc1(150 + th, fh1, sine, cose)

  // Polar region fix
  if (Math.abs(fi) >= 90 - ekl) {
    polarFix(cusps)
  }

  computeOpposites(cusps)
}

/** Campanus (C) */
function housesCampanus(
  cusps: number[],
  th: number, fi: number,
  sine: number, cose: number,
  ac: number, mc: number,
  ekl: number,
): void {
  cusps[1] = ac
  cusps[10] = mc

  const fh1 = asind(sind(fi) / 2)
  const fh2 = asind((Math.sqrt(3) / 2) * sind(fi))
  const cosfi = cosd(fi)

  let xh1: number
  let xh2: number
  if (Math.abs(cosfi) < VERY_SMALL) {
    xh1 = fi > 0 ? 90 : 270
    xh2 = xh1
  } else {
    xh1 = atand(Math.sqrt(3) / cosfi)
    xh2 = atand(1 / (Math.sqrt(3) * cosfi))
  }

  cusps[11] = Asc1(th + 90 - xh1, fh1, sine, cose)
  cusps[12] = Asc1(th + 90 - xh2, fh2, sine, cose)
  cusps[2] = Asc1(th + 90 + xh2, fh2, sine, cose)
  cusps[3] = Asc1(th + 90 + xh1, fh1, sine, cose)

  // Polar region fix
  if (Math.abs(fi) >= 90 - ekl) {
    polarFix(cusps)
  }

  computeOpposites(cusps)
}

/** Equal (E): 30-degree houses from ASC */
function housesEqual(cusps: number[], ac: number): void {
  cusps[1] = ac
  for (let i = 2; i <= 12; i++) {
    cusps[i] = degnorm(cusps[1] + (i - 1) * 30)
  }
}

/** Whole Sign (W): 30-degree houses from start of ASC's sign */
function housesWholeSign(cusps: number[], ac: number): void {
  cusps[1] = ac - (ac % 30)
  for (let i = 2; i <= 12; i++) {
    cusps[i] = degnorm(cusps[1] + (i - 1) * 30)
  }
}

/** Alcabitus (B): semi-arc division on the equator */
function housesAlcabitus(
  cusps: number[],
  th: number, fi: number,
  sine: number, cose: number,
  ac: number, mc: number,
  ekl: number,
): void {
  // Polar circle check: fall back to Porphyry
  if (Math.abs(fi) >= 90 - ekl) {
    housesPorphyry(cusps, ac, mc)
    return
  }

  cusps[1] = ac
  cusps[10] = mc

  const tanfi = tand(fi)

  // Declination of ASC
  const dek = asind(clamp1(sind(ac) * sine))
  // Semi-diurnal arc of ASC
  const r = clamp1(-tanfi * tand(dek))
  const sda = acosd(r)
  const sna = 180 - sda
  const sd3 = sda / 3
  const sn3 = sna / 3

  cusps[11] = Asc1(degnorm(th + sd3), 0, sine, cose)
  cusps[12] = Asc1(degnorm(th + 2 * sd3), 0, sine, cose)
  cusps[2] = Asc1(degnorm(th + 180 - 2 * sn3), 0, sine, cose)
  cusps[3] = Asc1(degnorm(th + 180 - sn3), 0, sine, cose)

  computeOpposites(cusps)
}

/** Morinus (M): equatorial points projected to ecliptic */
function housesMorinus(
  cusps: number[], th: number, ekl: number,
): void {
  let a = th
  for (let i = 1; i <= 12; i++) {
    let j = i + 10
    if (j > 12) j -= 12
    a = degnorm(a + 30)
    // Transform equatorial point (lon=a, lat=0) to ecliptic longitude
    cusps[j] = degnorm(
      Math.atan2(sind(a) * cosd(ekl), cosd(a)) * RAD_TO_DEG,
    )
  }
}

/** Topocentric (T) — Polich-Page */
function housesTopocentric(
  cusps: number[],
  th: number, fi: number,
  sine: number, cose: number,
  ac: number, mc: number,
  ekl: number,
): void {
  cusps[1] = ac
  cusps[10] = mc

  const tanfi = tand(fi)
  const fh1 = atand(tanfi / 3.0)
  const fh2 = atand((tanfi * 2.0) / 3.0)

  cusps[11] = Asc1(30 + th, fh1, sine, cose)
  cusps[12] = Asc1(60 + th, fh2, sine, cose)
  cusps[2] = Asc1(120 + th, fh2, sine, cose)
  cusps[3] = Asc1(150 + th, fh1, sine, cose)

  // Polar region fix
  if (Math.abs(fi) >= 90 - ekl) {
    polarFix(cusps)
  }

  computeOpposites(cusps)
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Calculate astrological house cusps for a given house system.
 *
 * @param tjd_ut  Julian day in UT
 * @param geolat  geographic latitude (degrees, north positive)
 * @param geolon  geographic longitude (degrees, east positive)
 * @param hsys    house system code: P, K, O, R, C, E, W, B, M, T
 * @returns       cusps[1..12] and ascmc[0]=ASC, ascmc[1]=MC, ascmc[2]=ARMC
 */
export function calcHouses(
  tjd_ut: number,
  geolat: number,
  geolon: number,
  hsys: string,
): HousesResult {
  // --- Compute obliquity and nutation ---
  const tjde = tjd_ut + deltaT(tjd_ut)
  const eps_mean_rad = calcObliquity(tjde)
  const eps_mean = eps_mean_rad * RAD_TO_DEG
  const [dpsi, deps] = calcNutation(tjde)
  const nutlo_lon = dpsi * RAD_TO_DEG // nutation in longitude (degrees)
  const nutlo_obl = deps * RAD_TO_DEG // nutation in obliquity (degrees)

  // --- ARMC (local sidereal time in degrees) ---
  const armc = degnorm(
    sidtime0(tjd_ut, eps_mean + nutlo_obl, nutlo_lon) * 15 + geolon,
  )

  // --- True obliquity ---
  const ekl = eps_mean + nutlo_obl
  const cose = Math.cos(ekl * DEG_TO_RAD)
  const sine = Math.sin(ekl * DEG_TO_RAD)

  // --- MC from ARMC ---
  const th = degnorm(armc)
  let mc: number
  if (
    Math.abs(th - 90) > VERY_SMALL &&
    Math.abs(th - 270) > VERY_SMALL
  ) {
    const tant = Math.tan(th * DEG_TO_RAD)
    mc = Math.atan(tant / cose) * RAD_TO_DEG
    if (th > 90 && th <= 270) mc += 180
  } else {
    mc = Math.abs(th - 90) <= VERY_SMALL ? 90 : 270
  }
  mc = degnorm(mc)

  // --- ASC ---
  const ac = Asc1(th + 90, geolat, sine, cose)

  // --- Compute cusps ---
  const cusps = new Array<number>(13).fill(0)
  const fi = geolat

  switch (hsys.toUpperCase()) {
    case 'P':
      housesPlacidus(cusps, th, fi, ekl, sine, cose, ac, mc)
      break
    case 'K':
      housesKoch(cusps, th, fi, sine, cose, ac, mc, ekl)
      break
    case 'O':
      housesPorphyry(cusps, ac, mc)
      break
    case 'R':
      housesRegiomontanus(cusps, th, fi, sine, cose, ac, mc, ekl)
      break
    case 'C':
      housesCampanus(cusps, th, fi, sine, cose, ac, mc, ekl)
      break
    case 'E':
      housesEqual(cusps, ac)
      break
    case 'W':
      housesWholeSign(cusps, ac)
      break
    case 'B':
      housesAlcabitus(cusps, th, fi, sine, cose, ac, mc, ekl)
      break
    case 'M':
      housesMorinus(cusps, th, ekl)
      break
    case 'T':
      housesTopocentric(cusps, th, fi, sine, cose, ac, mc, ekl)
      break
    default:
      // Default to Placidus
      housesPlacidus(cusps, th, fi, ekl, sine, cose, ac, mc)
      break
  }

  return {
    cusps,
    ascmc: [ac, mc, armc],
  }
}
