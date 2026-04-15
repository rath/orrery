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

function getOffsetMinutesAtLocalTime(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number | null {
  const value = timezone.trim()
  if (!value) return null

  try {
    const utcDate = resolveLocalDateTimeToUtc(year, month, day, hour, minute, value)
    // Local wall-clock interpreted as UTC minus the real UTC moment = the applied offset in ms.
    const localAsNaiveUtcMs = Date.UTC(year, month - 1, day, hour, minute)
    return Math.round((localAsNaiveUtcMs - utcDate.getTime()) / 60_000)
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
  const offsetMinutes = getOffsetMinutesAtLocalTime(timezone, year, month, day, hour, minute)
  if (offsetMinutes == null) return null
  return formatUtcOffsetMinutes(offsetMinutes)
}

export function isDaylightSavingInEffect(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): boolean {
  const actual = getOffsetMinutesAtLocalTime(timezone, year, month, day, hour, minute)
  if (actual == null) return false

  const january = getOffsetMinutesAtLocalTime(timezone, year, 1, 15, 12, 0)
  const july = getOffsetMinutesAtLocalTime(timezone, year, 7, 15, 12, 0)
  if (january == null || july == null) return false

  const standard = Math.min(january, july)
  const dst = Math.max(january, july)
  if (standard === dst) return false

  return actual === dst
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
