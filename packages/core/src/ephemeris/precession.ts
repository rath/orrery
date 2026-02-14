/**
 * Precession — IAU 1976 model
 *
 * Ported from swephlib.c (Swiss Ephemeris)
 * Authors: Dieter Koch and Alois Treindl
 *
 * Precesses equatorial rectangular coordinates from J2000 to a given epoch
 * or vice versa.
 *
 * AGPL-licensed — see Swiss Ephemeris license terms.
 */

const J2000 = 2451545.0
const DEG_TO_RAD = Math.PI / 180

/**
 * Precess equatorial rectangular coordinates.
 *
 * IAU 1976 precession (Lieske model).
 *
 * @param R  [x, y, z] equatorial rectangular coordinates (modified in place)
 * @param J  target epoch (Julian day TT)
 * @param direction  -1 = J2000→J, +1 = J→J2000
 */
export function precess(R: number[], J: number, direction: number): void {
  const T = (J - J2000) / 36525.0

  // IAU 1976 precession angles (Lieske, Astron. Astrophys. 73, 282, 1979)
  const Z = (((((-0.0000002 * T - 0.0000327) * T + 0.0179663) * T
    + 0.3019015) * T + 2306.2181) * T + 0.0) * DEG_TO_RAD / 3600
  const z = (((((-0.0000003 * T - 0.000047) * T + 0.0182237) * T
    + 1.0947790) * T + 2306.2181) * T + 0.0) * DEG_TO_RAD / 3600
  const TH = ((((-0.0000001 * T - 0.0000601) * T - 0.0418251) * T
    - 0.4269353) * T + 2004.3109) * T * DEG_TO_RAD / 3600

  const sinTH = Math.sin(TH)
  const cosTH = Math.cos(TH)
  const sinZ = Math.sin(Z)
  const cosZ = Math.cos(Z)
  const sinz = Math.sin(z)
  const cosz = Math.cos(z)
  const A = cosZ * cosTH
  const B = sinZ * cosTH

  const x = new Array(3)
  if (direction < 0) {
    // From J2000 to J
    x[0] = (A * cosz - sinZ * sinz) * R[0]
      - (B * cosz + cosZ * sinz) * R[1]
      - sinTH * cosz * R[2]
    x[1] = (A * sinz + sinZ * cosz) * R[0]
      - (B * sinz - cosZ * cosz) * R[1]
      - sinTH * sinz * R[2]
    x[2] = cosZ * sinTH * R[0]
      - sinZ * sinTH * R[1]
      + cosTH * R[2]
  } else {
    // From J to J2000
    x[0] = (A * cosz - sinZ * sinz) * R[0]
      + (A * sinz + sinZ * cosz) * R[1]
      + cosZ * sinTH * R[2]
    x[1] = -(B * cosz + cosZ * sinz) * R[0]
      - (B * sinz - cosZ * cosz) * R[1]
      - sinZ * sinTH * R[2]
    x[2] = -sinTH * cosz * R[0]
      - sinTH * sinz * R[1]
      + cosTH * R[2]
  }
  R[0] = x[0]
  R[1] = x[1]
  R[2] = x[2]
}
