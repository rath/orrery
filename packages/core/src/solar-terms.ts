// @ts-expect-error lunar-javascript has no type declarations
import { Solar } from 'lunar-javascript'
import { civilDateToUtc } from './validation.ts'

interface SolarDate {
  getYear(): number; getMonth(): number; getDay(): number
  getHour(): number; getMinute(): number; getSecond(): number
}
interface Term { index: number; utcMs: number }
const cache = new Map<number, Term[]>()
// lunar-javascript returns these astronomical instants in fixed UTC+8.
const names = [
  'DA_XUE', '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪',
  '大雪', 'DONG_ZHI', 'XIAO_HAN', 'DA_HAN', 'LI_CHUN', 'YU_SHUI', 'JING_ZHE',
]

function termsForYear(year: number): Term[] {
  const cached = cache.get(year)
  if (cached) return cached
  const table = Solar.fromYmd(year, 7, 1).getLunar().getJieQiTable() as Record<string, SolarDate>
  const terms = names.map((name, i) => {
    const term = table[name]
    return {
      index: (i - 4 + 24) % 24,
      utcMs: civilDateToUtc(term.getYear(), term.getMonth(), term.getDay(), term.getHour(), term.getMinute()).getTime()
        + term.getSecond() * 1000 - 8 * 3_600_000,
    }
  })
  if (cache.size >= 8) cache.delete(cache.keys().next().value!)
  cache.set(year, terms)
  return terms
}

export function getSolarTermPeriod(utcMs: number) {
  const year = new Date(utcMs).getUTCFullYear()
  const terms = termsForYear(year)
  const astrologyYear = utcMs < terms[4].utcMs ? year - 1 : year
  for (let i = terms.length - 3; i >= 0; i -= 2) {
    if (terms[i].utcMs <= utcMs) {
      return { astrologyYear, previous: terms[i], middle: terms[i + 1], next: terms[i + 2] }
    }
  }
  throw new RangeError('Solar terms unavailable for date')
}
