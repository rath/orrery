import { isRecord, parseSavedFormState } from './birth-state.ts'
import type { SavedFormState } from './birth-state.ts'

export interface Profile {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  data: SavedFormState
}

const STORAGE_KEY = 'orrery-profiles'
export const MAX_PROFILE_FILE_BYTES = 1024 * 1024
export const MAX_PROFILES = 500
export const MAX_PROFILE_NAME_LENGTH = 100

function parseProfile(item: unknown): Profile | null {
  if (!isRecord(item) || typeof item.name !== 'string'
    || !item.name.trim() || item.name.length > MAX_PROFILE_NAME_LENGTH) return null
  if (item.id !== undefined && (typeof item.id !== 'string' || !item.id || item.id.length > 100)) return null
  const data = parseSavedFormState(item.data)
  if (!data) return null
  const now = Date.now()
  const createdAt = item.createdAt ?? now
  const updatedAt = item.updatedAt ?? now
  if (!Number.isSafeInteger(createdAt) || (createdAt as number) < 0
    || !Number.isSafeInteger(updatedAt) || (updatedAt as number) < 0) return null
  return {
    id: (item.id as string | undefined) ?? crypto.randomUUID(),
    name: item.name.trim(), data,
    createdAt: createdAt as number, updatedAt: updatedAt as number,
  }
}

function parseList(json: string): unknown[] {
  // Check string length before allocating a UTF-8 buffer or parsing JSON.
  if (json.length > MAX_PROFILE_FILE_BYTES
    || new TextEncoder().encode(json).byteLength > MAX_PROFILE_FILE_BYTES) {
    throw new RangeError('Profile file is too large')
  }
  const parsed: unknown = JSON.parse(json)
  if (!Array.isArray(parsed) || parsed.length > MAX_PROFILES) throw new RangeError('Invalid profile list')
  return parsed
}

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const ids = new Set<string>()
    return parseList(raw).flatMap(item => {
      const profile = parseProfile(item)
      if (!profile || ids.has(profile.id)) return []
      ids.add(profile.id)
      return [profile]
    })
  } catch {
    return []
  }
}

function saveProfiles(profiles: Profile[]): void {
  if (profiles.length > MAX_PROFILES) throw new RangeError('Too many profiles')
  const json = JSON.stringify(profiles)
  parseList(json)
  // Let callers report quota/permission failures instead of claiming success.
  localStorage.setItem(STORAGE_KEY, json)
}

export function addProfile(name: string, data: SavedFormState): Profile {
  const profiles = loadProfiles()
  const profile = parseProfile({
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data,
  })
  if (!profile) throw new TypeError('Invalid profile')
  profiles.push(profile)
  saveProfiles(profiles)
  return profile
}

export function updateProfile(id: string, patch: { name?: string; data?: SavedFormState }): void {
  const profiles = loadProfiles()
  const idx = profiles.findIndex(p => p.id === id)
  if (idx === -1) return
  const profile = parseProfile({ ...profiles[idx], ...patch, updatedAt: Date.now() })
  if (!profile) throw new TypeError('Invalid profile')
  profiles[idx] = profile
  saveProfiles(profiles)
}

export function deleteProfile(id: string): void {
  const profiles = loadProfiles().filter(p => p.id !== id)
  saveProfiles(profiles)
}

export function exportProfiles(): string {
  return JSON.stringify(loadProfiles(), null, 2)
}

/** JSON 문자열에서 프로필을 파싱하여 기존 목록에 병합. 추가된 수를 반환. */
export function importProfiles(json: string): number {
  const parsed = parseList(json).map(item => {
    const profile = parseProfile(item)
    if (!profile) throw new TypeError('Invalid profile')
    return profile
  })
  const existing = loadProfiles()
  const existingIds = new Set(existing.map(p => p.id))
  let added = 0
  for (const item of parsed) {
    if (existingIds.has(item.id)) continue
    existing.push(item)
    existingIds.add(item.id)
    added++
  }
  saveProfiles(existing)
  return added
}
