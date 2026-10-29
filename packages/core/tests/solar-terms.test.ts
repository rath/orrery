import { describe, expect, it } from 'vitest'
import { calcSolarTerms, getFourPillars } from '../src/pillars.ts'
import { calculateSaju } from '../src/saju.ts'

// Solar terms are 15° ecliptic longitude crossings, not fixed annual minute offsets.
// https://www.hko.gov.hk/en/gts/time/24solarterms.htm
// Independently checked with Swiss Ephemeris 2.10.03 solcross_ut(315):
// 2024-02-04 08:27:08 UTC = 17:27:08 KST (lunar-javascript differs by <2s).
describe('astronomical solar terms', () => {
  it('reports the 2024 Lichun time in KST', () => {
    expect(calcSolarTerms(2024, 2, 5, 12, 0)).toMatchObject({
      ingiName: 0, ingiYear: 2024, ingiMonth: 2, ingiDay: 4, ingiHour: 17, ingiMin: 27,
    })
  })

  it('changes year and month at Lichun rather than 27 minutes early', () => {
    expect(getFourPillars(2024, 2, 4, 17, 26).slice(0, 2)).toEqual(['癸卯', '乙丑'])
    expect(getFourPillars(2024, 2, 4, 17, 28).slice(0, 2)).toEqual(['甲辰', '丙寅'])
  })

  it('uses the same physical crossing for overseas and Korean births', () => {
    for (const [minute, expected] of [[26, ['乙丑', '癸卯']], [28, ['丙寅', '甲辰']]] as const) {
      const chart = calculateSaju({
        year: 2024, month: 2, day: 4, hour: 3, minute, gender: 'M',
        timezone: 'America/New_York', longitude: -74.006,
      })
      expect(chart.pillars.slice(2).map(p => p.pillar.ganzi)).toEqual(expected)
    }
  })

  it('does not apply the Korean half-hour offset to true solar time twice', () => {
    const chart = calculateSaju({
      year: 1990, month: 1, day: 15, hour: 9, minute: 15, gender: 'M',
      timezone: 'America/Los_Angeles', longitude: -118.2437,
    })
    expect(chart.pillars[0].pillar.branch).toBe('巳')
  })

  it('keeps Korean and true-solar late-Zi boundaries distinct', () => {
    const solar = { trueSolarTime: true }
    expect(getFourPillars(2000, 1, 1, 23, 0, 'unified', solar)[2])
      .toBe(getFourPillars(2000, 1, 2, 0, 0)[2])
    expect(getFourPillars(2000, 1, 1, 23, 0, 'split', solar)[2])
      .toBe(getFourPillars(2000, 1, 1, 12, 0)[2])
    expect(getFourPillars(2000, 1, 1, 23, 0)[2])
      .toBe(getFourPillars(2000, 1, 1, 12, 0)[2])
  })
})
