/**
 * Coordinate transformation and angle utility functions
 *
 * Ported from swephlib.c (Swiss Ephemeris)
 * Authors: Dieter Koch and Alois Treindl
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

export const TWOPI = 2 * Math.PI
export const DEG_TO_RAD = Math.PI / 180
export const RAD_TO_DEG = 180 / Math.PI
export const AU_KM = 149597870.7 // 1 AU in km

/** Reduce x modulo 360° */
export function degnorm(x: number): number {
  let y = x % 360.0
  if (Math.abs(y) < 1e-13) y = 0
  if (y < 0.0) y += 360.0
  return y
}

/** Reduce x modulo 2π */
export function radnorm(x: number): number {
  let y = x % TWOPI
  if (Math.abs(y) < 1e-13) y = 0
  if (y < 0.0) y += TWOPI
  return y
}

/** fmod that matches C behavior */
export function mod2PI(x: number): number {
  let y = x % TWOPI
  if (y < 0.0) y += TWOPI
  return y
}

/**
 * Cartesian (x, y, z) → Polar (lon, lat, radius)
 *
 * lon in radians [0, 2π), lat in radians [-π/2, π/2], r ≥ 0
 * Input/output arrays: [x, y, z, ...] → [lon, lat, r, ...]
 * If input has 6 elements, velocity components are also transformed.
 */
export function cartpol(x: number[]): number[] {
  const r2 = x[0] * x[0] + x[1] * x[1]
  const rr = r2 + x[2] * x[2]
  const result = new Array(x.length)

  // longitude
  if (r2 === 0 && x[2] === 0) {
    result[0] = 0
  } else {
    result[0] = Math.atan2(x[1], x[0])
    if (result[0] < 0) result[0] += TWOPI
  }

  // latitude
  if (x[2] === 0) {
    result[1] = 0
  } else {
    result[1] = Math.atan(x[2] / Math.sqrt(r2))
  }

  // radius
  result[2] = Math.sqrt(rr)

  // velocity transformation (if 6 elements)
  if (x.length >= 6) {
    const sqr2 = Math.sqrt(r2)
    if (sqr2 > 0) {
      result[3] = (x[0] * x[4] - x[1] * x[3]) / r2
      result[4] = (x[2] * (x[0] * x[3] + x[1] * x[4])
        - r2 * x[5]) / (rr * sqr2) * -1
    } else {
      result[3] = 0
      result[4] = 0
    }
    if (rr > 0) {
      result[5] = (x[0] * x[3] + x[1] * x[4] + x[2] * x[5]) / Math.sqrt(rr)
    } else {
      result[5] = 0
    }
  }

  return result
}

/**
 * Polar (lon, lat, radius) → Cartesian (x, y, z)
 *
 * Input: [lon(rad), lat(rad), r, ...]
 * If 6 elements, velocity components are also transformed.
 */
export function polcart(l: number[]): number[] {
  const result = new Array(l.length)
  const cosB = Math.cos(l[1])
  const sinB = Math.sin(l[1])
  const cosL = Math.cos(l[0])
  const sinL = Math.sin(l[0])

  result[0] = l[2] * cosB * cosL
  result[1] = l[2] * cosB * sinL
  result[2] = l[2] * sinB

  if (l.length >= 6) {
    result[3] = l[5] * cosB * cosL
      - l[2] * sinB * cosL * l[4]
      - l[2] * cosB * sinL * l[3]
    result[4] = l[5] * cosB * sinL
      - l[2] * sinB * sinL * l[4]
      + l[2] * cosB * cosL * l[3]
    result[5] = l[5] * sinB
      + l[2] * cosB * l[4]
  }

  return result
}

/**
 * Coordinate rotation by angle eps (typically obliquity)
 *
 * Rotates a cartesian vector around the x-axis by angle eps.
 * Used for ecliptic ↔ equatorial conversion.
 *
 * @param x    [x, y, z] input vector
 * @param eps  rotation angle in radians (positive = ecliptic→equatorial)
 */
export function coortrf(x: number[], eps: number): number[] {
  const cosEps = Math.cos(eps)
  const sinEps = Math.sin(eps)
  return [
    x[0],
    x[1] * cosEps + x[2] * sinEps,
    -x[1] * sinEps + x[2] * cosEps,
  ]
}

/**
 * Coordinate rotation for position+velocity (6 elements)
 */
export function coortrf2(x: number[], eps: number): number[] {
  const cosEps = Math.cos(eps)
  const sinEps = Math.sin(eps)
  return [
    x[0],
    x[1] * cosEps + x[2] * sinEps,
    -x[1] * sinEps + x[2] * cosEps,
    x[3],
    x[4] * cosEps + x[5] * sinEps,
    -x[4] * sinEps + x[5] * cosEps,
  ]
}

/** Cross product: a × b */
export function crossProd(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

/** Dot product */
export function dotProd(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/** Vector norm */
export function vecNorm(a: number[]): number {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
}
