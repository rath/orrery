import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { forgetLastInput, loadInitialSubject, loadLastInput, rememberSubject, subjectOfProfile } from './session.ts'
import type { SavedFormState } from './birth-state.ts'
import type { Profile } from './profiles.ts'

const state: SavedFormState = {
  year: 1990, month: 6, day: 15, hour: 12, minute: 0, gender: 'M',
  unknownTime: false, jasiMethod: 'unified', city: null, manualCoords: true,
  latitude: 37.5, longitude: 127,
}
const profile: Profile = { id: 'one', name: 'Test', createdAt: 1, updatedAt: 1, data: { ...state, year: 1980 } }
let storage: Map<string, string>

beforeEach(() => {
  storage = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
    removeItem: (key: string) => { storage.delete(key) },
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('session', () => {
  it('starts with nothing on a first visit', () => {
    expect(loadInitialSubject([])).toBeNull()
  })

  it('resumes the last unsaved input', () => {
    rememberSubject({ profileId: null, name: '', state })
    expect(loadInitialSubject([profile])).toEqual({ profileId: null, name: '', state })
  })

  it('resumes the profile that was open, using its current data', () => {
    rememberSubject({ profileId: null, name: '', state })
    rememberSubject(subjectOfProfile(profile))
    const renamed = { ...profile, name: 'Renamed' }
    expect(loadInitialSubject([renamed])).toEqual(subjectOfProfile(renamed))
  })

  it('falls back to the last unsaved input when the open profile is gone', () => {
    rememberSubject({ profileId: null, name: '', state })
    rememberSubject(subjectOfProfile(profile))
    expect(loadInitialSubject([])).toEqual({ profileId: null, name: '', state })
  })

  it('forgets the unsaved copy on request', () => {
    rememberSubject({ profileId: null, name: '', state })
    forgetLastInput()
    expect(loadLastInput()).toBeNull()
    expect(loadInitialSubject([])).toBeNull()
  })

  it('ignores malformed or oversized stored input', () => {
    storage.set('orrery-birth-input', '{not json')
    expect(loadLastInput()).toBeNull()
    storage.set('orrery-birth-input', JSON.stringify({ ...state, day: 99 }))
    expect(loadLastInput()).toBeNull()
    storage.set('orrery-birth-input', JSON.stringify({ ...state, pad: 'x'.repeat(5000) }))
    expect(loadLastInput()).toBeNull()
  })

  it('keeps working when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
      removeItem: () => { throw new Error('blocked') },
    })
    expect(() => rememberSubject({ profileId: null, name: '', state })).not.toThrow()
    expect(loadInitialSubject([profile])).toBeNull()
  })
})
