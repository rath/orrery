import type { BirthInput } from '@orrery/core/types'
import type { SavedFormState } from './birth-state.ts'
import { validateBirthLocalTime } from './timezones.ts'

export type BirthInputFailure = 'dst-gap' | 'invalid-timezone' | 'invalid-date' | 'infer-failed'

export type BirthInputResult =
  | { ok: true; input: BirthInput }
  | { ok: false; reason: BirthInputFailure }

/**
 * 저장된 폼 상태를 계산 엔진 입력으로 바꾼다.
 * 타임존은 좌표에서 추론해 항상 채운다 (생략하면 코어가 Asia/Seoul로 계산한다).
 * 출생 시각을 모르면 정오로 계산한다.
 */
export function toBirthInput(state: SavedFormState): BirthInputResult {
  const hour = state.unknownTime ? 12 : state.hour
  const minute = state.unknownTime ? 0 : state.minute
  const result = validateBirthLocalTime(
    state.latitude, state.longitude,
    state.year, state.month, state.day,
    hour, minute,
  )
  if (!result.ok) return { ok: false, reason: result.reason }
  return {
    ok: true,
    input: {
      year: state.year,
      month: state.month,
      day: state.day,
      hour,
      minute,
      gender: state.gender,
      unknownTime: state.unknownTime,
      ...(!state.unknownTime && { jasiMethod: state.jasiMethod }),
      latitude: state.latitude,
      longitude: state.longitude,
      timezone: result.timezone,
    },
  }
}
