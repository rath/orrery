import { describe, expect, it } from 'vitest'
import { formatBirthDate, formatBirthTime, formatCompactDate, formatPlace } from './subject-summary.ts'
import type { SavedFormState } from './birth-state.ts'

const state: SavedFormState = {
  year: 1979, month: 6, day: 5, hour: 7, minute: 5, gender: 'M',
  unknownTime: false, jasiMethod: 'unified',
  city: { name: '서울', lat: 37.5665, lon: 126.978 }, manualCoords: false,
  latitude: 37.5665, longitude: 126.978,
}

describe('subject summary', () => {
  it('formats the date for the interface language without shifting the day', () => {
    expect(formatBirthDate(state, 'ko')).toBe('1979년 6월 5일')
    expect(formatBirthDate(state, 'en')).toBe('June 5, 1979')
    // The first and last day of a year must not slip into a neighbouring year in any time zone.
    expect(formatBirthDate({ ...state, month: 1, day: 1 }, 'en')).toBe('January 1, 1979')
    expect(formatBirthDate({ ...state, month: 12, day: 31 }, 'en')).toBe('December 31, 1979')
  })

  it('pads the compact date and the time', () => {
    expect(formatCompactDate(state)).toBe('1979.06.05')
    expect(formatBirthTime(state)).toBe('07:05')
  })

  it('has no time when the birth time is unknown', () => {
    expect(formatBirthTime({ ...state, unknownTime: true })).toBeNull()
  })

  it('names the city, with its country when abroad', () => {
    expect(formatPlace(state)).toBe('서울')
    expect(formatPlace({ ...state, city: { name: '도쿄', country: '일본', lat: 35.68, lon: 139.69 } })).toBe('도쿄, 일본')
  })

  it('shows coordinates when they were entered by hand', () => {
    expect(formatPlace({ ...state, city: null, manualCoords: true, latitude: 37.5, longitude: -126.978 }))
      .toBe('37.5, -126.978')
  })
})
