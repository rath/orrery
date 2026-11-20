import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addProfile, deleteProfile, exportProfiles, importProfiles, loadProfiles,
  MAX_PROFILE_FILE_BYTES, MAX_PROFILES, moveProfile, updateProfile,
} from './profiles.ts'
import { parseSavedFormState } from './birth-state.ts'
import type { SavedFormState } from './birth-state.ts'

const state: SavedFormState = {
  year: 1990, month: 6, day: 15, hour: 12, minute: 0, gender: 'M',
  unknownTime: false, jasiMethod: 'unified', city: null, manualCoords: true,
  latitude: 37.5, longitude: 127,
}
const profile = { id: 'one', name: 'Test', createdAt: 1, updatedAt: 1, data: state }
let storage: Map<string, string>

beforeEach(() => {
  storage = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => { storage.set(key, value) }),
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('untrusted saved data', () => {
  it.each([null, [], { ...state, latitude: '37.5' }, { ...state, day: 31 },
    { ...state, city: { name: {}, lat: 37, lon: 127 } },
    { ...state, unknownTime: 'false' }, { ...state, jasiMethod: 'invalid' }, { ...state, year: 9999 },
  ])('rejects invalid form state: %j', data => {
    expect(parseSavedFormState(data)).toBeNull()
  })

  it('keeps compatible defaults and drops unknown keys', () => {
    const parsed = parseSavedFormState({ ...state, unknownTime: undefined, jasiMethod: undefined, extra: { bad: true } })
    expect(parsed).toEqual(state)
  })

  it('recovers valid profiles from a malformed stored list', () => {
    storage.set('orrery-profiles', JSON.stringify([null, {}, profile, profile]))
    expect(loadProfiles()).toEqual([profile])
    storage.set('orrery-profiles', '{}')
    expect(loadProfiles()).toEqual([])
  })

  it('deduplicates within the imported file and against existing profiles', () => {
    expect(importProfiles(JSON.stringify([profile, profile]))).toBe(1)
    expect(importProfiles(JSON.stringify([profile]))).toBe(0)
    expect(loadProfiles()).toEqual([profile])
  })

  it('rejects an invalid import without partially saving valid entries', () => {
    importProfiles(JSON.stringify([profile]))
    const before = storage.get('orrery-profiles')
    expect(() => importProfiles(JSON.stringify([{ ...profile, id: 'two' }, { name: 'Bad', data: {} }]))).toThrow()
    expect(storage.get('orrery-profiles')).toBe(before)
  })

  it('rejects oversized text and too many profiles before saving', () => {
    expect(() => importProfiles(' '.repeat(MAX_PROFILE_FILE_BYTES + 1))).toThrow()
    expect(() => importProfiles(JSON.stringify(Array(MAX_PROFILES + 1).fill(profile)))).toThrow()
    expect(storage.size).toBe(0)
  })

  it('copies only allowed fields from imported objects', () => {
    const json = JSON.stringify([{ ...profile, data: { ...state, extra: 'discard' }, extra: 'discard' }])
      .replace('"id":', '"__proto__":{"polluted":true},"id":')
    importProfiles(json)
    expect(loadProfiles()).toEqual([profile])
    expect({}).not.toHaveProperty('polluted')
  })

  it('reports failed writes for every mutating operation', () => {
    const existing = [profile, { ...profile, id: 'last' }]
    importProfiles(JSON.stringify(existing))
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('quota') })
    expect(() => addProfile('New', state)).toThrow('quota')
    expect(() => updateProfile('one', { name: 'Renamed' })).toThrow('quota')
    expect(() => deleteProfile('one')).toThrow('quota')
    expect(() => moveProfile('one', 'last', 'after')).toThrow('quota')
    expect(() => importProfiles(JSON.stringify([{ ...profile, id: 'two' }]))).toThrow('quota')
    expect(loadProfiles()).toEqual(existing)
  })
})

describe('profile order', () => {
  const second = { ...profile, id: 'two', name: 'Second', updatedAt: 2 }
  const third = { ...profile, id: 'three', name: 'Third', createdAt: 3, updatedAt: 4 }
  const original = [profile, second, third]

  beforeEach(() => {
    importProfiles(JSON.stringify(original))
    vi.mocked(localStorage.setItem).mockClear()
  })

  it.each([
    ['one', 'three', 'before', [second, profile, third], 2],
    ['one', 'three', 'after', [second, third, profile], 3],
    ['three', 'one', 'before', [third, profile, second], 1],
    ['three', 'one', 'after', [profile, third, second], 2],
  ] as const)('places %s relative to %s (%s) in storage and exports', (id, target, placement, expected, position) => {
    expect(moveProfile(id, target, placement)).toBe(position)
    expect(loadProfiles()).toEqual(expected)
    expect(JSON.parse(exportProfiles())).toEqual(expected)
    expect(localStorage.setItem).toHaveBeenCalledTimes(1)
  })

  it('keeps edits and imports made since the list was displayed', () => {
    const imported = { ...profile, id: 'four' }
    updateProfile('one', { name: 'Renamed' })
    importProfiles(JSON.stringify([imported]))
    const [renamed] = loadProfiles()

    moveProfile('one', 'three', 'after')
    expect(loadProfiles()).toEqual([second, third, renamed, imported])
  })

  it('skips writes for unchanged positions and missing profiles', () => {
    expect(moveProfile('one', 'one', 'after')).toBeNull()
    expect(moveProfile('one', 'two', 'before')).toBeNull()
    expect(moveProfile('two', 'one', 'after')).toBeNull()
    expect(moveProfile('deleted', 'two', 'after')).toBeNull()
    expect(moveProfile('one', 'deleted', 'before')).toBeNull()
    expect(localStorage.setItem).not.toHaveBeenCalled()
    expect(loadProfiles()).toEqual(original)
  })
})
