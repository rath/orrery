/**
 * Heliocentric state vectors from JPL Horizons, converted to the frame the
 * integrator works in.
 */
import { chunks, horizons, horizonsRows } from './sources.ts'
import { ECLIPTIC_J2000_TO_EQUATOR } from '../../../src/ephemeris/frames.ts'
import type { State } from '../../../src/ephemeris/planets.ts'

/** Horizons identifiers: planetary-system barycentres, and the numbered asteroid. */
export const HORIZONS_ID = {
  Jupiter: '5',
  Saturn: '6',
  Uranus: '7',
  Neptune: '8',
  Pluto: '9',
  Chiron: '2060;',
} as const

/** Apply the inverse (transpose) of the ecliptic → equator rotation. */
function equatorToEcliptic(x: number, y: number, z: number): [number, number, number] {
  const m = ECLIPTIC_J2000_TO_EQUATOR
  return [m[0] * x + m[3] * y + m[6] * z, m[1] * x + m[4] * y + m[7] * z, m[2] * x + m[5] * y + m[8] * z]
}

/**
 * Geometric position (AU) and velocity (AU/day) relative to a centre, in the
 * J2000 ecliptic frame, at the given Julian days (TDB).
 */
export async function horizonsStates(command: string, jds: readonly number[], centre = '500@10'): Promise<State[]> {
  const states: State[] = []
  for (const batch of chunks(jds, 60)) {
    const text = await horizons({
      COMMAND: `'${command}'`,
      EPHEM_TYPE: "'VECTORS'",
      CENTER: `'${centre}'`,
      TLIST: batch.map(jd => `'${jd}'`).join(','),
      TLIST_TYPE: "'JD'",
      REF_PLANE: "'FRAME'",
      REF_SYSTEM: "'ICRF'",
      VEC_TABLE: "'2'",
      VEC_CORR: "'NONE'",
      OUT_UNITS: "'AU-D'",
      CSV_FORMAT: "'YES'",
    })
    const rows = horizonsRows(text)
    if (rows.length !== batch.length) throw new Error(`Horizons returned ${rows.length} of ${batch.length} rows for ${command}`)
    rows.forEach((row, i) => {
      if (Math.abs(Number(row[0]) - batch[i]) > 1e-6) throw new Error(`unexpected epoch ${row[0]} for ${command}`)
      const [x, y, z, vx, vy, vz] = row.slice(2, 8).map(Number)
      states.push([...equatorToEcliptic(x, y, z), ...equatorToEcliptic(vx, vy, vz)])
    })
  }
  return states
}
