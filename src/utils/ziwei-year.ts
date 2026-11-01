import { getLunarYear } from '@orrery/core/ziwei'
import type { ZiweiChart } from '@orrery/core/types'

/** 조회 기본값은 브라우저 현지 날짜의 음력년. 화면과 복사에 같은 기준 날짜를 전달한다. */
export function resolveLiunianYear(
  chart: ZiweiChart,
  selectedYear: number | null | undefined,
  referenceDate: Date,
): number {
  const year = selectedYear ?? getLunarYear(
    referenceDate.getFullYear(), referenceDate.getMonth() + 1, referenceDate.getDate(),
  )
  return Math.max(chart.lunarYear, Math.min(9999, year))
}
