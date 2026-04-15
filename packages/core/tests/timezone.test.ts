import { describe, it, expect } from 'vitest'
import {
  resolveLocalDateTimeToUtc,
  resolveLocalDateTimeToUtcSafe,
  adjustBirthInputToKstWallClock,
  isKoreanHistoricalTimeAnomaly,
} from '../src/timezone.ts'
import { isKoreanDaylightTime } from '../src/kdt.ts'

describe('resolveLocalDateTimeToUtc — America/Los_Angeles', () => {
  it('summer noon → PDT (-7)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 7, 15, 12, 0, 'America/Los_Angeles').toISOString())
      .toBe('2024-07-15T19:00:00.000Z')
  })

  it('winter noon → PST (-8)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 1, 15, 12, 0, 'America/Los_Angeles').toISOString())
      .toBe('2024-01-15T20:00:00.000Z')
  })

  it('spring-forward boundary: 01:59 → 09:59Z (still PST)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 3, 10, 1, 59, 'America/Los_Angeles').toISOString())
      .toBe('2024-03-10T09:59:00.000Z')
  })

  it('spring-forward boundary: 03:00 → 10:00Z (PDT begins)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 3, 10, 3, 0, 'America/Los_Angeles').toISOString())
      .toBe('2024-03-10T10:00:00.000Z')
  })

  it('spring-forward gap 02:30 throws DST gap error', () => {
    expect(() => resolveLocalDateTimeToUtc(2024, 3, 10, 2, 30, 'America/Los_Angeles'))
      .toThrow(/^DST gap/)
  })

  it('fall-back boundary: 00:59 → 07:59Z (still PDT)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 11, 3, 0, 59, 'America/Los_Angeles').toISOString())
      .toBe('2024-11-03T07:59:00.000Z')
  })

  it('fall-back overlap: 01:30 → 08:30Z (prefer-first = PDT pre-rollback)', () => {
    // Both 08:30Z (PDT) and 09:30Z (PST) round-trip to local 01:30. Core must pick PDT = earlier UTC.
    expect(resolveLocalDateTimeToUtc(2024, 11, 3, 1, 30, 'America/Los_Angeles').toISOString())
      .toBe('2024-11-03T08:30:00.000Z')
  })

  it('fall-back boundary: 02:00 → 10:00Z (PST, post-rollback)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 11, 3, 2, 0, 'America/Los_Angeles').toISOString())
      .toBe('2024-11-03T10:00:00.000Z')
  })
})

describe('resolveLocalDateTimeToUtc — America/New_York', () => {
  it('summer noon → EDT (-4)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 7, 15, 12, 0, 'America/New_York').toISOString())
      .toBe('2024-07-15T16:00:00.000Z')
  })

  it('winter noon → EST (-5)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 1, 15, 12, 0, 'America/New_York').toISOString())
      .toBe('2024-01-15T17:00:00.000Z')
  })
})

describe('resolveLocalDateTimeToUtc — US historical DST edge cases', () => {
  it('1974 Nixon emergency DST: Jan 15 LA = PDT (-7)', () => {
    // Nixon's year-round DST order was active in Jan 1974 (energy crisis response).
    expect(resolveLocalDateTimeToUtc(1974, 1, 15, 12, 0, 'America/Los_Angeles').toISOString())
      .toBe('1974-01-15T19:00:00.000Z')
  })

  it('1973 Jan LA = PST (-8) — control for Nixon regression', () => {
    expect(resolveLocalDateTimeToUtc(1973, 1, 15, 12, 0, 'America/Los_Angeles').toISOString())
      .toBe('1973-01-15T20:00:00.000Z')
  })

  it('2006 old rule: Apr 2 LA = PDT (old April first Sunday start)', () => {
    expect(resolveLocalDateTimeToUtc(2006, 4, 2, 12, 0, 'America/Los_Angeles').toISOString())
      .toBe('2006-04-02T19:00:00.000Z')
  })

  it('2006 old rule: Mar 12 LA = PST (still before old April start)', () => {
    expect(resolveLocalDateTimeToUtc(2006, 3, 12, 12, 0, 'America/Los_Angeles').toISOString())
      .toBe('2006-03-12T20:00:00.000Z')
  })

  it('2007 new rule: Mar 11 LA = PDT (March 2nd Sunday start)', () => {
    expect(resolveLocalDateTimeToUtc(2007, 3, 11, 12, 0, 'America/Los_Angeles').toISOString())
      .toBe('2007-03-11T19:00:00.000Z')
  })
})

describe('resolveLocalDateTimeToUtc — Europe/Berlin', () => {
  it('summer noon → CEST (+2)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 7, 15, 12, 0, 'Europe/Berlin').toISOString())
      .toBe('2024-07-15T10:00:00.000Z')
  })

  it('winter noon → CET (+1)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 1, 15, 12, 0, 'Europe/Berlin').toISOString())
      .toBe('2024-01-15T11:00:00.000Z')
  })

  it('spring-forward boundary: 01:59 → 00:59Z', () => {
    expect(resolveLocalDateTimeToUtc(2024, 3, 31, 1, 59, 'Europe/Berlin').toISOString())
      .toBe('2024-03-31T00:59:00.000Z')
  })

  it('spring-forward boundary: 03:00 → 01:00Z', () => {
    expect(resolveLocalDateTimeToUtc(2024, 3, 31, 3, 0, 'Europe/Berlin').toISOString())
      .toBe('2024-03-31T01:00:00.000Z')
  })

  it('spring-forward gap 02:30 throws DST gap error', () => {
    expect(() => resolveLocalDateTimeToUtc(2024, 3, 31, 2, 30, 'Europe/Berlin'))
      .toThrow(/^DST gap/)
  })

  it('fall-back overlap: 02:30 → 00:30Z (prefer-first = CEST pre-rollback)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 10, 27, 2, 30, 'Europe/Berlin').toISOString())
      .toBe('2024-10-27T00:30:00.000Z')
  })

  it('fall-back boundary: 03:00 → 02:00Z (CET, post-rollback)', () => {
    expect(resolveLocalDateTimeToUtc(2024, 10, 27, 3, 0, 'Europe/Berlin').toISOString())
      .toBe('2024-10-27T02:00:00.000Z')
  })
})

describe('resolveLocalDateTimeToUtc — Australia/Sydney (southern hemisphere)', () => {
  it('January noon → AEDT (+11) — austral summer', () => {
    expect(resolveLocalDateTimeToUtc(2024, 1, 15, 12, 0, 'Australia/Sydney').toISOString())
      .toBe('2024-01-15T01:00:00.000Z')
  })

  it('July noon → AEST (+10) — austral winter, phase inverted vs northern hemisphere', () => {
    expect(resolveLocalDateTimeToUtc(2024, 7, 15, 12, 0, 'Australia/Sydney').toISOString())
      .toBe('2024-07-15T02:00:00.000Z')
  })
})

describe('resolveLocalDateTimeToUtc — Asia/Seoul historical', () => {
  it('modern 1995 noon → +9', () => {
    expect(resolveLocalDateTimeToUtc(1995, 7, 15, 12, 0, 'Asia/Seoul').toISOString())
      .toBe('1995-07-15T03:00:00.000Z')
  })

  it('1988 KDT summer noon → +10', () => {
    expect(resolveLocalDateTimeToUtc(1988, 7, 15, 12, 0, 'Asia/Seoul').toISOString())
      .toBe('1988-07-15T02:00:00.000Z')
  })

  it('1956-01 standard time → +8:30', () => {
    expect(resolveLocalDateTimeToUtc(1956, 1, 15, 12, 0, 'Asia/Seoul').toISOString())
      .toBe('1956-01-15T03:30:00.000Z')
  })

  it('1956-07 DST on +8:30 base → +9:30', () => {
    expect(resolveLocalDateTimeToUtc(1956, 7, 15, 12, 0, 'Asia/Seoul').toISOString())
      .toBe('1956-07-15T02:30:00.000Z')
  })
})

describe('resolveLocalDateTimeToUtcSafe', () => {
  it('wraps valid input in { ok: true, date }', () => {
    const result = resolveLocalDateTimeToUtcSafe(2024, 7, 15, 12, 0, 'America/Los_Angeles')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.date.toISOString()).toBe('2024-07-15T19:00:00.000Z')
    }
  })

  it('returns { ok: false, reason: "dst-gap" } for spring-forward gap', () => {
    const result = resolveLocalDateTimeToUtcSafe(2024, 3, 10, 2, 30, 'America/Los_Angeles')
    expect(result).toEqual({ ok: false, reason: 'dst-gap' })
  })

  it('returns { ok: false, reason: "invalid-timezone" } for unknown zone', () => {
    const result = resolveLocalDateTimeToUtcSafe(2024, 7, 15, 12, 0, 'Not/A_Real_Zone')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('invalid-timezone')
    }
  })
})

describe('adjustBirthInputToKstWallClock', () => {
  const input = (year: number, month: number, day: number, hour: number, minute: number) =>
    ({ year, month, day, hour, minute, gender: 'M' as const })

  it('1987-08-23 04:10 KDT → 03:10 KST (same date)', () => {
    expect(adjustBirthInputToKstWallClock(input(1987, 8, 23, 4, 10)))
      .toEqual({ year: 1987, month: 8, day: 23, hour: 3, minute: 10 })
  })

  it('1987-08-23 00:30 KDT → 1987-08-22 23:30 KST (date rollback)', () => {
    expect(adjustBirthInputToKstWallClock(input(1987, 8, 23, 0, 30)))
      .toEqual({ year: 1987, month: 8, day: 22, hour: 23, minute: 30 })
  })

  it('1988-07-01 10:00 KDT → 09:00 KST', () => {
    expect(adjustBirthInputToKstWallClock(input(1988, 7, 1, 10, 0)))
      .toEqual({ year: 1988, month: 7, day: 1, hour: 9, minute: 0 })
  })

  it('1949-06-15 12:00 KDT (1949 +10) → 11:00 KST', () => {
    expect(adjustBirthInputToKstWallClock(input(1949, 6, 15, 12, 0)))
      .toEqual({ year: 1949, month: 6, day: 15, hour: 11, minute: 0 })
  })

  it('1956-01-15 12:00 (+8:30 winter) → 12:30 KST (+30m advance)', () => {
    expect(adjustBirthInputToKstWallClock(input(1956, 1, 15, 12, 0)))
      .toEqual({ year: 1956, month: 1, day: 15, hour: 12, minute: 30 })
  })

  it('1956-07-15 12:00 (+9:30 DST) → 11:30 KST (-30m retreat)', () => {
    expect(adjustBirthInputToKstWallClock(input(1956, 7, 15, 12, 0)))
      .toEqual({ year: 1956, month: 7, day: 15, hour: 11, minute: 30 })
  })

  it('1961-06-15 12:00 (+8:30 pre-transition) → 12:30 KST', () => {
    expect(adjustBirthInputToKstWallClock(input(1961, 6, 15, 12, 0)))
      .toEqual({ year: 1961, month: 6, day: 15, hour: 12, minute: 30 })
  })

  it('1961-09-15 12:00 (+9 post-transition) → 12:00 KST (no change)', () => {
    expect(adjustBirthInputToKstWallClock(input(1961, 9, 15, 12, 0)))
      .toEqual({ year: 1961, month: 9, day: 15, hour: 12, minute: 0 })
  })

  it('modern 1995-07-15 12:00 (+9) → 12:00 KST (no change)', () => {
    expect(adjustBirthInputToKstWallClock(input(1995, 7, 15, 12, 0)))
      .toEqual({ year: 1995, month: 7, day: 15, hour: 12, minute: 0 })
  })
})

describe('isKoreanDaylightTime — 1987-88 UI message back-compat', () => {
  it('1987 KDT period returns true', () => {
    expect(isKoreanDaylightTime(1987, 8, 23)).toBe(true)
  })

  it('1988 KDT period returns true', () => {
    expect(isKoreanDaylightTime(1988, 7, 1)).toBe(true)
  })

  it('1956 +8:30/+9:30 NOT flagged — scope is 1987-88 only', () => {
    expect(isKoreanDaylightTime(1956, 7, 15)).toBe(false)
  })

  it('modern dates return false', () => {
    expect(isKoreanDaylightTime(1995, 7, 15)).toBe(false)
  })
})

describe('isKoreanHistoricalTimeAnomaly', () => {
  it('detects 1987-88 KDT', () => {
    expect(isKoreanHistoricalTimeAnomaly(1987, 8, 23)).toBe(true)
    expect(isKoreanHistoricalTimeAnomaly(1988, 7, 1)).toBe(true)
  })

  it('detects 1949 KDT', () => {
    expect(isKoreanHistoricalTimeAnomaly(1949, 6, 15)).toBe(true)
  })

  it('detects 1954-1961 Aug +8:30 / +9:30 base', () => {
    expect(isKoreanHistoricalTimeAnomaly(1956, 1, 15)).toBe(true)
    expect(isKoreanHistoricalTimeAnomaly(1956, 7, 15)).toBe(true)
    expect(isKoreanHistoricalTimeAnomaly(1961, 6, 15)).toBe(true)
  })

  it('returns false for 1952-53 +9 lull (between 1948-51 KDT and 1954 base shift)', () => {
    expect(isKoreanHistoricalTimeAnomaly(1953, 6, 1)).toBe(false)
  })

  it('returns false for post-1961-08 +9 standard', () => {
    expect(isKoreanHistoricalTimeAnomaly(1962, 1, 1)).toBe(false)
    expect(isKoreanHistoricalTimeAnomaly(1995, 7, 15)).toBe(false)
  })
})
