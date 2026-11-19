import { describe, expect, it } from 'vitest'
import { toBirthInput } from './birth-input.ts'
import type { SavedFormState } from './birth-state.ts'

const seoul: SavedFormState = {
  year: 1990, month: 6, day: 15, hour: 9, minute: 30, gender: 'F',
  unknownTime: false, jasiMethod: 'split', city: null, manualCoords: true,
  latitude: 37.5665, longitude: 126.978,
}

describe('toBirthInput', () => {
  it('fills the time zone from the coordinates', () => {
    const result = toBirthInput(seoul)
    expect(result).toEqual({
      ok: true,
      input: {
        year: 1990, month: 6, day: 15, hour: 9, minute: 30, gender: 'F',
        unknownTime: false, jasiMethod: 'split',
        latitude: 37.5665, longitude: 126.978, timezone: 'Asia/Seoul',
      },
    })
  })

  it('infers a time zone outside Korea instead of falling back to Seoul', () => {
    const result = toBirthInput({ ...seoul, latitude: 34.0522, longitude: -118.2437 })
    expect(result.ok && result.input.timezone).toBe('America/Los_Angeles')
  })

  it('uses noon and drops the jasi method when the birth time is unknown', () => {
    const result = toBirthInput({ ...seoul, unknownTime: true })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.input).toMatchObject({ hour: 12, minute: 0, unknownTime: true })
    expect(result.input).not.toHaveProperty('jasiMethod')
  })

  it('reports a wall-clock time skipped by a daylight saving transition', () => {
    // 2021-03-14 02:30 does not exist in Los Angeles: clocks jump from 02:00 to 03:00.
    const result = toBirthInput({
      ...seoul, year: 2021, month: 3, day: 14, hour: 2, minute: 30,
      latitude: 34.0522, longitude: -118.2437,
    })
    expect(result).toEqual({ ok: false, reason: 'dst-gap' })
  })

  it('reports a date that does not exist', () => {
    expect(toBirthInput({ ...seoul, year: 2001, month: 2, day: 29 })).toEqual({ ok: false, reason: 'invalid-date' })
  })
})
