import { useState, useMemo } from 'react'
import { calculateLiunian } from '@orrery/core/ziwei'
import type { ZiweiChart } from '@orrery/core/types'
import { MAIN_STAR_NAMES } from '@orrery/core/constants'

interface Props {
  chart: ZiweiChart
}

const LUNAR_MONTH_NAMES = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '臘月',
]

function getMainStarsAtZhi(chart: ZiweiChart, zhi: string): string[] {
  for (const palace of Object.values(chart.palaces)) {
    if (palace.zhi === zhi) {
      return palace.stars
        .filter(s => MAIN_STAR_NAMES.has(s.name))
        .map(s => s.name)
    }
  }
  return []
}

export default function LiunianView({ chart }: Props) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const liunian = useMemo(() => calculateLiunian(chart, year), [chart, year])

  const colorMap: Record<string, string> = {
    '化祿': 'text-green-600',
    '化權': 'text-yellow-600',
    '化科': 'text-blue-600',
    '化忌': 'text-red-600',
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-medium text-gray-700">流年</h3>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          min={chart.solarYear}
          max={chart.solarYear + 100}
          className="w-20 text-sm border border-gray-300 rounded px-2 py-0.5 text-gray-700"
        />
        <span className="text-xs text-gray-400 font-hanja">{liunian.gan}{liunian.zhi}年</span>
      </div>

      {/* 대한 정보 */}
      <div className="text-sm text-gray-600 mb-2">
        <span className="font-medium text-gray-700">大限</span>
        <span className="text-gray-400 mx-1">:</span>
        {liunian.daxianAgeStart}-{liunian.daxianAgeEnd}歲 {liunian.daxianPalaceName}
      </div>

      {/* 유년 명궁 */}
      <div className="text-sm text-gray-600 mb-3">
        <span className="font-medium text-gray-700">流年命宮</span>
        <span className="text-gray-400 mx-1">:</span>
        <span className="font-hanja">{liunian.mingGongZhi}</span>宮 → 本命 {liunian.natalPalaceAtMing}
        <span className="text-gray-400 ml-1">
          ({getMainStarsAtZhi(chart, liunian.mingGongZhi).join(', ') || '空宮'})
        </span>
      </div>

      {/* 유년 사화 */}
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 mb-1">流年四化</div>
        <div className="space-y-0.5">
          {['化祿', '化權', '化科', '化忌'].map(huaType => {
            let starName = ''
            for (const [s, h] of Object.entries(liunian.siHua)) {
              if (h === huaType) { starName = s; break }
            }
            const palaceName = liunian.siHuaPalaces[huaType] || '?'
            if (!starName) return null
            return (
              <div key={huaType} className="text-sm text-gray-600">
                <span className={colorMap[huaType]}>{huaType}</span>
                <span className="text-gray-400 mx-1">:</span>
                <span className="font-hanja">{starName}</span>
                <span className="text-gray-400 mx-1">→</span>
                <span>{palaceName}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 유월 */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-1">流月運勢</div>
        <div className="space-y-0.5">
          {liunian.liuyue.map(ly => {
            const stars = getMainStarsAtZhi(chart, ly.mingGongZhi)
            const hasMain = stars.length > 0
            return (
              <div
                key={ly.month}
                className={`text-sm ${hasMain ? 'text-gray-600' : 'text-gray-400'}`}
              >
                <span className="w-10 inline-block">{LUNAR_MONTH_NAMES[ly.month - 1]}</span>
                <span className="font-hanja text-xs text-gray-400 mx-1">({ly.mingGongZhi})</span>
                <span className="mr-1">{ly.natalPalaceName}</span>
                <span className="text-gray-400 text-xs">
                  {hasMain ? `- ${stars.join(', ')}` : '- (空宮)'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
