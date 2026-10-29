import { describe, expect, it } from 'vitest'
import { createChart } from '../src/ziwei.ts'
import fixtures from './ziwei-reference.json'

// Independent iztro 2.6.3 values: dayDivide=current, yearDivide=normal, fixLeap=false.
// https://github.com/SylarLong/iztro/tree/v2.6.3/src/astro
describe('Ziwei independent chart references', () => {
  for (const fixture of fixtures) {
    it(`${fixture.year}-${fixture.month}-${fixture.day} ${fixture.hour}:45 Asia/Seoul`, () => {
      const chart = createChart(fixture.year, fixture.month, fixture.day, fixture.hour, 45, true, 'Asia/Seoul')
      expect(chart.mingGongZhi).toBe(fixture.ming)
      expect(chart.shenGongZhi).toBe(fixture.shen)
      expect(chart.wuXingJu.name).toBe(fixture.ju)
      expect(Object.fromEntries(Object.values(chart.palaces).flatMap(p => p.stars.map(s => [s.name, p.zhi]))))
        .toEqual(fixture.stars)
    })
  }
})
