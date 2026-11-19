import { formatCityName } from '@orrery/core/cities'
import type { SavedFormState } from './birth-state.ts'
import { formatCoordinate } from './coordinate-input.ts'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** 언어에 맞춘 긴 날짜 (예: 1979년 6월 26일, June 26, 1979) */
export function formatBirthDate(state: SavedFormState, locale: string): string {
  const date = new Date(Date.UTC(state.year, state.month - 1, state.day))
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(date)
}

/** 목록용 짧은 날짜 (예: 1979.06.26) */
export function formatCompactDate(state: SavedFormState): string {
  return `${state.year}.${pad(state.month)}.${pad(state.day)}`
}

/** 출생 시각 (예: 07:35). 시각을 모르면 null. */
export function formatBirthTime(state: SavedFormState): string | null {
  return state.unknownTime ? null : `${pad(state.hour)}:${pad(state.minute)}`
}

/** 도시 이름, 좌표를 직접 넣었으면 좌표 */
export function formatPlace(state: SavedFormState): string {
  if (!state.manualCoords && state.city) return formatCityName(state.city)
  return `${formatCoordinate(state.latitude)}, ${formatCoordinate(state.longitude)}`
}
