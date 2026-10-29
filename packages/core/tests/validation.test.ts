import { describe, expect, it } from 'vitest'
import { calcSolarTerms, findTransits, getFourPillars } from '../src/pillars.ts'
import { calculateSaju } from '../src/saju.ts'
import { calculateNatal } from '../src/natal.ts'
import { createChart } from '../src/ziwei.ts'
import { resolveLocalDateTimeToUtc, resolveLocalDateTimeToUtcSafe } from '../src/timezone.ts'
import type { BirthInput } from '../src/types.ts'

const input: BirthInput = {
  year: 2000, month: 2, day: 29, hour: 12, minute: 0,
  gender: 'M', timezone: 'Asia/Seoul',
}

describe('calendar input boundaries', () => {
  it.each([
    { year: NaN }, { year: Infinity }, { year: 1e10 }, { year: 0 },
    { month: Infinity }, { month: 13 }, { day: 30 },
    { hour: -1 }, { minute: 0.5 }, { minute: 60 },
  ])('rejects invalid dates before calendar search: %j', (patch) => {
    const value = { ...input, ...patch }
    expect(() => getFourPillars(value.year, value.month, value.day, value.hour, value.minute)).toThrow(RangeError)
    expect(() => calcSolarTerms(value.year, value.month, value.day, value.hour, value.minute)).toThrow(RangeError)
    expect(() => calculateSaju(value)).toThrow(RangeError)
    expect(() => createChart(value.year, value.month, value.day, value.hour, value.minute, true)).toThrow(RangeError)
  })

  it('distinguishes an impossible calendar date from a DST gap', () => {
    expect(resolveLocalDateTimeToUtcSafe(1900, 2, 29, 12, 0, 'Asia/Seoul'))
      .toEqual({ ok: false, reason: 'invalid-date' })
    expect(resolveLocalDateTimeToUtcSafe(2024, 3, 10, 2, 30, 'America/New_York'))
      .toEqual({ ok: false, reason: 'dst-gap' })
  })

  it('preserves early Gregorian years instead of adding 1900', () => {
    expect(resolveLocalDateTimeToUtc(50, 1, 1, 0, 0, 'UTC').toISOString())
      .toBe('0050-01-01T00:00:00.000Z')
  })

  it.each([{ latitude: NaN }, { latitude: 91 }, { longitude: Infinity }, { longitude: -181 }])(
    'rejects invalid coordinates: %j', async patch => {
      expect(() => calculateSaju({ ...input, ...patch })).toThrow(RangeError)
      await expect(calculateNatal({ ...input, ...patch })).rejects.toThrow(RangeError)
    },
  )

  it('rejects unknown house systems', async () => {
    await expect(calculateNatal(input, '__proto__')).rejects.toThrow('Unsupported house system')
  })

  it.each([NaN, Infinity, -1, 0, 0.5, 121])('bounds transit work for %s months', months => {
    expect(() => findTransits(['甲子'], months)).toThrow(RangeError)
  })

  it('bounds the number and validates the contents of transit pillars', () => {
    expect(() => findTransits(Array(1000).fill('甲子'))).toThrow(RangeError)
    expect(() => findTransits(['bad'])).toThrow(RangeError)
    expect(() => findTransits(['??', '甲子'])).not.toThrow()
  })
})
