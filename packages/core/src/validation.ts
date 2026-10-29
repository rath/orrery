import type { BirthInput } from './types.ts'

export class InvalidDateTimeError extends RangeError {}

/** Bound calendar arithmetic before entering the solar-term search loops. */
export function assertDateTime(
  year: number, month: number, day: number, hour: number, minute: number,
): void {
  if (![year, month, day, hour, minute].every(Number.isInteger)
    || year < 1 || year > 9999 || month < 1 || month > 12
    || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new InvalidDateTimeError('Invalid date/time (year must be between 1 and 9999)')
  }
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (day < 1 || day > days[month - 1]) {
    throw new InvalidDateTimeError('Invalid calendar date')
  }
}

export function assertCoordinate(value: number, limit: number): void {
  if (!Number.isFinite(value) || Math.abs(value) > limit) {
    throw new RangeError(`Coordinate must be finite and between -${limit} and ${limit}`)
  }
}

export function assertBirthInput(input: BirthInput): void {
  assertDateTime(input.year, input.month, input.day, input.hour, input.minute)
  if (input.gender !== 'M' && input.gender !== 'F') throw new RangeError('Invalid gender')
  if (input.unknownTime !== undefined && typeof input.unknownTime !== 'boolean') {
    throw new RangeError('Invalid unknownTime')
  }
  if (input.jasiMethod !== undefined && input.jasiMethod !== 'unified' && input.jasiMethod !== 'split') {
    throw new RangeError('Invalid jasiMethod')
  }
  if (input.latitude !== undefined) assertCoordinate(input.latitude, 90)
  if (input.longitude !== undefined) assertCoordinate(input.longitude, 180)
}

/** Date.UTC treats years 0–99 as 1900–1999; setUTCFullYear preserves the year. */
export function civilDateToUtc(
  year: number, month: number, day: number, hour = 0, minute = 0,
): Date {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, 0, 0)
  return date
}
