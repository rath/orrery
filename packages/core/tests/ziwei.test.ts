import { describe, it, expect } from 'vitest'
import { createChart } from '../src/ziwei.ts'
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
