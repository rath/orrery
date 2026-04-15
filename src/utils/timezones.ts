import tzLookup from '@photostructure/tz-lookup'
import {
  resolveLocalDateTimeToUtc,
  resolveLocalDateTimeToUtcSafe,
} from '@orrery/core/timezone'

export type BirthLocalTimeValidationResult =
  | { ok: true; timezone: string }
  | { ok: false; reason: 'dst-gap' | 'invalid-timezone' | 'infer-failed' }

function formatUtcOffsetMinutes(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+'
  const absolute = Math.abs(offsetMinutes)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60

  if (minutes === 0) {
    return `UTC${sign}${hours}`
  }

  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`
}

export function inferTimeZoneFromCoordinates(latitude: number, longitude: number): string | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null

  try {
    return tzLookup(latitude, longitude)
  } catch {
    return null
  }
}

function getTimeZoneOffsetLabelAtLocalTime(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string | null {
  const value = timezone.trim()
  if (!value) return null

  try {
    const utcDate = resolveLocalDateTimeToUtc(year, month, day, hour, minute, value)
    // Local wall-clock interpreted as UTC minus the real UTC moment = the applied offset in ms.
    const localAsNaiveUtcMs = Date.UTC(year, month - 1, day, hour, minute)
    const offsetMinutes = Math.round((localAsNaiveUtcMs - utcDate.getTime()) / 60_000)
    return formatUtcOffsetMinutes(offsetMinutes)
  } catch {
    return null
  }
}

export function getTimeZoneDisplayLabelAtLocalTime(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string | null {
  const offsetLabel = getTimeZoneOffsetLabelAtLocalTime(timezone, year, month, day, hour, minute)
  if (!offsetLabel) return null
  return `${timezone.trim()} (${offsetLabel})`
}

export function validateBirthLocalTime(
  latitude: number,
  longitude: number,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): BirthLocalTimeValidationResult {
  const timezone = inferTimeZoneFromCoordinates(latitude, longitude)
  if (!timezone) return { ok: false, reason: 'infer-failed' }

  const result = resolveLocalDateTimeToUtcSafe(year, month, day, hour, minute, timezone)
  if (!result.ok) return result
  return { ok: true, timezone }
}
