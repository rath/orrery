import { parseSavedFormState } from './birth-state.ts'
import type { SavedFormState } from './birth-state.ts'
import type { Profile } from './profiles.ts'

/** 저장하지 않고 마지막으로 계산한 입력 */
const LAST_INPUT_KEY = 'orrery-birth-input'
/** 마지막으로 보던 프로필의 id */
const ACTIVE_PROFILE_KEY = 'orrery-active-profile'

/** 화면에 명식을 띄운 대상. profileId가 null이면 저장하지 않은 입력이다. */
export interface Subject {
  profileId: string | null
  name: string
  state: SavedFormState
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // 저장소를 쓸 수 없어도(용량 초과, 차단) 화면의 상태는 그대로 유효하다.
  }
}

export function loadLastInput(): SavedFormState | null {
  const raw = read(LAST_INPUT_KEY)
  if (!raw || raw.length > 4096) return null
  try {
    return parseSavedFormState(JSON.parse(raw))
  } catch {
    return null
  }
}

export function subjectOfProfile(profile: Profile): Subject {
  return { profileId: profile.id, name: profile.name, state: profile.data }
}

/** 다시 방문했을 때 이어서 보여줄 대상: 마지막으로 보던 프로필, 없으면 마지막 입력. */
export function loadInitialSubject(profiles: readonly Profile[]): Subject | null {
  const activeId = read(ACTIVE_PROFILE_KEY)
  const profile = activeId ? profiles.find(p => p.id === activeId) : undefined
  if (profile) return subjectOfProfile(profile)
  const state = loadLastInput()
  return state ? { profileId: null, name: '', state } : null
}

/** 저장하지 않은 입력이 프로필로 저장되면 따로 보관하던 사본은 지운다. */
export function forgetLastInput(): void {
  write(LAST_INPUT_KEY, null)
}

/** 보고 있는 대상을 기억한다. 저장하지 않은 입력은 내용 자체를 보관한다. */
export function rememberSubject(subject: Subject | null): void {
  write(ACTIVE_PROFILE_KEY, subject?.profileId ?? null)
  if (subject && subject.profileId === null) {
    write(LAST_INPUT_KEY, JSON.stringify(subject.state))
  }
}
