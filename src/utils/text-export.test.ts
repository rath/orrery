import { describe, expect, it } from 'vitest'
import { createChart, calculateLiunian } from '@orrery/core/ziwei'
import { calculateNatal, HOUSE_SYSTEMS } from '@orrery/core/natal'
import { calculateSaju } from '@orrery/core/saju'
import type { BirthInput } from '@orrery/core/types'
import { allChartsToText, natalToText, sajuToText, ziweiToText } from './text-export.ts'
import { resolveLiunianYear } from './ziwei-year.ts'
import { LOCALES } from '../i18n/index.ts'

const input: BirthInput = {
  year: 1993, month: 3, day: 12, hour: 9, minute: 45, gender: 'M',
  latitude: 37.5665, longitude: 126.978, timezone: 'Asia/Seoul',
}
const chart = createChart(1993, 3, 12, 9, 45, true, input.timezone, input.longitude)

describe('AI text export', () => {
  it.each(['W', 'K'])('uses the selected house system %s for the combined copy', async houseSystem => {
    const selected = await calculateNatal(input, houseSystem)
    const placidus = await calculateNatal(input, 'P')
    expect(selected.houses).not.toEqual(placidus.houses)
    const text = await allChartsToText(input, { houseSystem })
    expect(text).toContain(natalToText(selected))
    expect(text).not.toContain('Houses (Placidus)')
  })

  it('names the actual fallback house system at polar latitudes', async () => {
    const polarInput = { ...input, latitude: 78.2232, longitude: 15.6469, timezone: 'Arctic/Longyearbyen' }
    const natal = await calculateNatal(polarInput, 'P')
    expect(natal.houseSystem).not.toBe('P')
    const name = HOUSE_SYSTEMS.find(([code]) => code === natal.houseSystem)![1]
    const text = await allChartsToText(polarInput, { houseSystem: 'P' })
    expect(text).toContain(`Houses (${name})`)
    expect(text).toContain(natalToText(natal))
  })

  it('exports every calculated aspect in both individual and combined copies', async () => {
    const natal = await calculateNatal(input)
    expect(natal.aspects.length).toBeGreaterThan(15)
    for (const text of [natalToText(natal), await allChartsToText(input)]) {
      expect(text.match(/^.+ orb [\d.]+°$/gm)).toHaveLength(natal.aspects.length)
    }
  })

  it('includes the selected lunar year and all twelve months in the combined copy', async () => {
    const text = await allChartsToText(input, { ziweiYear: 2032, locale: 'ko' })
    const individual = ziweiToText(chart, calculateLiunian(chart, 2032), { timezone: input.timezone, locale: 'ko' })
    expect(text).toContain(individual)
    expect(text).toContain('流年 (2032年 壬子年)')
    const months = individual.match(/^(?:正月|二月|三月|四月|五月|六月|七月|八月|九月|十月|冬月|臘月) /gm)
    expect(months).toHaveLength(12)
    expect(text).toContain('四柱八字')
    expect(text).toContain('Natal Chart')
  })

  it('defaults to the lunar year on either side of Lunar New Year', async () => {
    const before = new Date(2026, 1, 16, 12)
    const after = new Date(2026, 1, 17, 12)
    expect(resolveLiunianYear(chart, null, before)).toBe(2025)
    expect(resolveLiunianYear(chart, null, after)).toBe(2026)
    expect(await allChartsToText(input, { referenceDate: before })).toContain('流年 (2025年 乙巳年)')
    expect(await allChartsToText(input, { referenceDate: after })).toContain('流年 (2026年 丙午年)')
  })

  it('uses the lunar birth year as the lower bound when the birth falls before Lunar New Year', () => {
    const januaryBirth = createChart(1993, 1, 1, 12, 0, true, 'Asia/Seoul')
    expect(resolveLiunianYear(januaryBirth, 1992, new Date(2026, 10, 1))).toBe(1992)
    expect(resolveLiunianYear(januaryBirth, 1990, new Date(2026, 10, 1))).toBe(1992)
  })

  it('keeps the current year available for births more than a century ago', () => {
    const oldChart = createChart(1900, 6, 15, 12, 0, true, 'Asia/Seoul')
    expect(resolveLiunianYear(oldChart, null, new Date(2026, 10, 1))).toBe(2026)
  })

  it('omits Ziwei and its annual flow when birth time is unknown', async () => {
    const text = await allChartsToText({ ...input, unknownTime: true }, { ziweiYear: 2032 })
    expect(text).not.toContain('紫微斗數')
    expect(text).not.toContain('流年 (')
    expect(text).toContain('四柱八字')
    expect(text).toContain('Natal Chart')
  })
})

describe('calculation basis in AI text', () => {
  it('describes the Korean clock, solar-term boundaries and actual displayed age formula', () => {
    const text = sajuToText(calculateSaju({ ...input, timezone: undefined }), 'en')
    expect(text).toContain('KST (UTC+09:00)')
    expect(text).toContain('historical offsets and DST corrected')
    expect(text).toContain('年柱 changes at 立春')
    expect(text).toContain('子時 starts at 23:30')
    expect(text).toContain('日柱 advances to the next day')
    expect(text).toContain('start year − adjusted birth year')
  })

  it('describes the selected split method and the overseas solar-time boundary', () => {
    const overseas: BirthInput = {
      ...input, jasiMethod: 'split', timezone: 'Europe/Berlin', latitude: 52.52, longitude: 13.405,
    }
    const text = sajuToText(calculateSaju(overseas), 'en')
    expect(text).toContain('true solar time using longitude and equation of time')
    expect(text).toContain('子時 starts at 23:00')
    expect(text).toContain('日柱 stays on the same day and 時干 uses the next day')
    expect(text).not.toContain('KST')
  })

  it('states Ziwei calendar, age, leap-month and monthly-flow conventions', () => {
    const text = ziweiToText(chart, calculateLiunian(chart, 2032), { timezone: input.timezone, locale: 'en' })
    expect(text).toContain('年柱 and 流年 change at Lunar New Year')
    expect(text).toContain('nominal age = reference lunar year − birth lunar year + 1')
    expect(text).toContain('no half-month split')
    expect(text).toContain('at 23:00 in the adjusted clock, the lunar date stays on the same day')
    expect(text).toContain('lunar months 1–12')
    expect(text).toContain('斗君-based 命宮 position summary')
    expect(ziweiToText(chart, undefined, { locale: 'en' })).toContain('original timezone not provided')
  })

  it('carries the overseas time basis into both Eastern charts', async () => {
    const overseas = { ...input, timezone: 'Europe/Berlin', latitude: 52.52, longitude: 13.405 }
    const text = await allChartsToText(overseas, { locale: 'en' })
    expect(text.match(/true solar time using longitude and equation of time/g)).toHaveLength(2)
    expect(text).not.toContain('KST')
  })

  it('states the zodiac, node, UTC conversion and actual house system', async () => {
    const text = natalToText(await calculateNatal(input, 'W'))
    expect(text).toContain('tropical zodiac · geocentric positions · mean lunar node')
    expect(text).toContain('IANA local time → UTC')
    expect(text).toContain('Houses: Whole Sign; cusp start inclusive, next cusp exclusive')
    const unknown = natalToText(await calculateNatal({ ...input, unknownTime: true }, 'W'))
    expect(unknown).toContain('noon (12:00)')
    expect(unknown).not.toContain('Houses: Whole Sign')
  })

  it.each(LOCALES.map(l => l.code))('keeps birth details private and resolves metadata in %s', async locale => {
    const text = await allChartsToText(input, { locale, ziweiYear: 2032 })
    expect(text).not.toMatch(/export\.|\{start\}|\{system\}/)
    expect(text).not.toContain('1993年 3月 12日')
    expect(text).not.toContain('1993-03-12')
    expect(text).not.toContain('09:45')
    expect(text).not.toContain('37.5665')
    expect(text).not.toContain('126.978')
  })
})
