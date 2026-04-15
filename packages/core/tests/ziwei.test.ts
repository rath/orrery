import { describe, it, expect } from 'vitest'
import { createChart } from '../src/ziwei.ts'
import { adjustBirthInputToSolarTime } from '../src/timezone.ts'
import { ZIWEI_FIXTURES } from './fixtures.ts'

describe('createChart', () => {
  for (const fixture of ZIWEI_FIXTURES) {
    const { year, month, day, hour, minute, isMale, expected } = fixture
    const label = `${year}-${month}-${day} ${hour}:${minute} ${isMale ? 'M' : 'F'}`

    it(label, () => {
      const chart = createChart(year, month, day, hour, minute, isMale)

      expect(chart.lunarYear).toBe(expected.lunarYear)
      expect(chart.lunarMonth).toBe(expected.lunarMonth)
      expect(chart.lunarDay).toBe(expected.lunarDay)
      expect(`${chart.yearGan}${chart.yearZhi}`).toBe(expected.yearGanZhi)
      expect(chart.mingGongZhi).toBe(expected.mingGongZhi)
      expect(chart.shenGongZhi).toBe(expected.shenGongZhi)
      expect(chart.wuXingJu.name).toBe(expected.wuXingJuName)
      expect(chart.wuXingJu.number).toBe(expected.wuXingJuNumber)
    })
  }
})

describe('palace structure', () => {
  const chart = createChart(1993, 3, 12, 9, 45, true)

  it('has 12 palaces', () => {
    expect(Object.keys(chart.palaces).length).toBe(12)
  })

  it('命宮 has correct ganZhi', () => {
    expect(chart.palaces['命宮'].ganZhi).toBe('壬戌')
  })

  it('身宮 is marked correctly', () => {
    // 신궁은 申에 있으므로 부처궁
    const shenPalace = Object.values(chart.palaces).find(p => p.isShenGong)
    expect(shenPalace).toBeTruthy()
    expect(shenPalace!.zhi).toBe('申')
  })

  it('命宮 contains 天機', () => {
    const mingStars = chart.palaces['命宮'].stars.map(s => s.name)
    expect(mingStars).toContain('天機')
  })
})

describe('timezone handling', () => {
  it('converts overseas births to local solar time before chart calculation', () => {
    const solar = adjustBirthInputToSolarTime({
      year: 1990,
      month: 7,
      day: 1,
      hour: 9,
      minute: 0,
      gender: 'M',
      longitude: -118.2437,
      timezone: 'America/Los_Angeles',
    })
    const dst = createChart(1990, 7, 1, 9, 0, true, 'America/Los_Angeles', -118.2437)
    const solarInput = createChart(solar.year, solar.month, solar.day, solar.hour, solar.minute, true)

    expect(dst.lunarYear).toBe(solarInput.lunarYear)
    expect(dst.lunarMonth).toBe(solarInput.lunarMonth)
    expect(dst.lunarDay).toBe(solarInput.lunarDay)
    expect(dst.mingGongZhi).toBe(solarInput.mingGongZhi)
    expect(dst.shenGongZhi).toBe(solarInput.shenGongZhi)
  })

  it('still applies KDT→KST correction when timezone is Asia/Seoul', () => {
    // 1988-07-01 10:00은 KDT 기간. timezone 명시 여부와 무관하게 09:00 KST 기준 결과가 나와야 한다.
    const withTimezone = createChart(1988, 7, 1, 10, 0, true, 'Asia/Seoul', 127.0992)
    const withoutTimezone = createChart(1988, 7, 1, 10, 0, true)

    expect(withTimezone.lunarYear).toBe(withoutTimezone.lunarYear)
    expect(withTimezone.lunarMonth).toBe(withoutTimezone.lunarMonth)
    expect(withTimezone.lunarDay).toBe(withoutTimezone.lunarDay)
    expect(withTimezone.mingGongZhi).toBe(withoutTimezone.mingGongZhi)
    expect(withTimezone.shenGongZhi).toBe(withoutTimezone.shenGongZhi)
  })

  it('uses longitude to derive local solar time when timezone is provided', () => {
    const parisLike = createChart(1990, 1, 1, 7, 35, true, 'Etc/GMT-1', 2.3522)
    const seoulLike = createChart(1990, 1, 1, 7, 35, true, 'Etc/GMT-1', 126.978)

    expect(parisLike.mingGongZhi).not.toBe(seoulLike.mingGongZhi)
    expect(parisLike.shenGongZhi).not.toBe(seoulLike.shenGongZhi)
  })

  it('converts LA winter births (PST -8) to local solar time — equivalence with no-timezone path', () => {
    // Pair to the 1990-07 PDT test above, locking the PST branch of resolveLocalDateTimeToUtc.
    const solar = adjustBirthInputToSolarTime({
      year: 1990, month: 1, day: 15, hour: 9, minute: 0,
      gender: 'M', longitude: -118.2437, timezone: 'America/Los_Angeles',
    })
    const dst = createChart(1990, 1, 15, 9, 0, true, 'America/Los_Angeles', -118.2437)
    const solarInput = createChart(solar.year, solar.month, solar.day, solar.hour, solar.minute, true)

    expect(dst.lunarYear).toBe(solarInput.lunarYear)
    expect(dst.lunarMonth).toBe(solarInput.lunarMonth)
    expect(dst.lunarDay).toBe(solarInput.lunarDay)
    expect(dst.mingGongZhi).toBe(solarInput.mingGongZhi)
    expect(dst.shenGongZhi).toBe(solarInput.shenGongZhi)
  })

  it('Korean 1956-07 +9:30 historical DST: KST wall-clock normalization shifts ziwei hour block', () => {
    // Asia/Seoul was +9:30 in July 1956. ziwei uses integer hour for hourZhiIndex, so crossing the
    // 11:00 integer boundary yields a different palace assignment.
    //   createChart(11, 0) → normalized to 10:30 → hourZhiIndex(10) = 5 = 巳
    //   createChart(11, 30) → normalized to 11:00 → hourZhiIndex(11) = 6 = 午
    // Without correction, both raw inputs have integer hour 11 and would produce the same mingGong.
    const chart1100 = createChart(1956, 7, 15, 11, 0, true)
    const chart1130 = createChart(1956, 7, 15, 11, 30, true)
    expect(chart1100.mingGongZhi).not.toBe(chart1130.mingGongZhi)
  })
})
