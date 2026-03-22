import type { SavedFormState } from '../components/BirthForm.tsx'

export interface Profile {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  data: SavedFormState
}

const STORAGE_KEY = 'orrery-profiles'

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Profile[]
  } catch {
    return []
  }
}

function saveProfiles(profiles: Profile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  } catch { /* quota exceeded — ignore */ }
}

export function addProfile(name: string, data: SavedFormState): Profile {
  const profiles = loadProfiles()
  const profile: Profile = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data,
  }
  profiles.push(profile)
  saveProfiles(profiles)
  return profile
}

export function updateProfile(id: string, patch: { name?: string; data?: SavedFormState }): void {
  const profiles = loadProfiles()
  const idx = profiles.findIndex(p => p.id === id)
  if (idx === -1) return
  if (patch.name !== undefined) profiles[idx].name = patch.name.trim()
  if (patch.data !== undefined) profiles[idx].data = patch.data
  profiles[idx].updatedAt = Date.now()
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
  const parsed = JSON.parse(json)
  if (!Array.isArray(parsed)) throw new Error('올바른 프로필 JSON이 아닙니다.')
  const existing = loadProfiles()
  const existingIds = new Set(existing.map(p => p.id))
  const now = Date.now()
  let added = 0
  for (const item of parsed) {
    if (!item || typeof item.name !== 'string' || !item.data) continue
    if (item.id && existingIds.has(item.id)) continue
    existing.push({
      id: item.id ?? crypto.randomUUID(),
      name: item.name,
      createdAt: item.createdAt ?? now,
      updatedAt: item.updatedAt ?? now,
      data: item.data,
    })
    added++
  }
  saveProfiles(existing)
  return added
}
