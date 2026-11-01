import { useState } from 'react'
import type { ZiweiChart, LiuNianInfo } from '@orrery/core/types'
import { MAIN_STAR_NAMES } from '@orrery/core/constants'
import { useLocale } from '../../i18n/index.ts'

interface Props {
  chart: ZiweiChart
  liunian: LiuNianInfo
  onYearChange: (year: number) => void
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

export default function LiunianView({ chart, liunian, onYearChange }: Props) {
  const { t } = useLocale()
  const { year } = liunian
  const [yearDraft, setYearDraft] = useState<string | null>(null)

  const colorMap: Record<string, string> = {
    '化祿': 'text-green-600 dark:text-green-400',
    '化權': 'text-yellow-600 dark:text-yellow-400',
    '化科': 'text-blue-600 dark:text-blue-400',
    '化忌': 'text-red-600 dark:text-red-400',
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">{t('ziwei.lunarYear')}</h3>
        <input
          type="number"
          aria-label={t('ziwei.lunarYear')}
          value={yearDraft ?? year}
          onChange={e => {
            const draft = e.target.value
            setYearDraft(draft)
            const next = Number(draft)
            if (Number.isInteger(next) && next >= chart.lunarYear && next <= 9999) {
              onYearChange(next)
            }
          }}
          onBlur={() => setYearDraft(null)}
          min={chart.lunarYear}
          max={9999}
          className="w-20 text-base border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 text-gray-700 dark:text-gray-200"
        />
        <span className="text-sm text-gray-400 dark:text-gray-500 font-hanja">{liunian.gan}{liunian.zhi}年</span>
      </div>

      {/* 대한 정보 */}
      <div className="text-base text-gray-600 dark:text-gray-300 mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-200">大限</span>
        <span className="text-gray-400 dark:text-gray-500 mx-1">:</span>
        {liunian.daxianAgeStart}-{liunian.daxianAgeEnd}歲 {liunian.daxianPalaceName}
      </div>

      {/* 유년 명궁 */}
      <div className="text-base text-gray-600 dark:text-gray-300 mb-3">
        <span className="font-medium text-gray-700 dark:text-gray-200">流年命宮</span>
        <span className="text-gray-400 dark:text-gray-500 mx-1">:</span>
        <span className="font-hanja">{liunian.mingGongZhi}</span>宮 → 本命 {liunian.natalPalaceAtMing}
        <span className="text-gray-400 dark:text-gray-500 ml-1">
          ({getMainStarsAtZhi(chart, liunian.mingGongZhi).join(', ') || '空宮'})
        </span>
      </div>

      {/* 유년 사화 */}
      <div className="mb-3">
        <div className="text-base font-medium text-gray-700 dark:text-gray-200 mb-1">流年四化</div>
        <div className="space-y-0.5">
          {['化祿', '化權', '化科', '化忌'].map(huaType => {
            let starName = ''
            for (const [s, h] of Object.entries(liunian.siHua)) {
              if (h === huaType) { starName = s; break }
            }
            const palaceName = liunian.siHuaPalaces[huaType] || '?'
            if (!starName) return null
            return (
              <div key={huaType} className="text-base text-gray-600 dark:text-gray-300">
                <span className={colorMap[huaType]}>{huaType}</span>
                <span className="text-gray-400 dark:text-gray-500 mx-1">:</span>
                <span className="font-hanja">{starName}</span>
                <span className="text-gray-400 dark:text-gray-500 mx-1">→</span>
                <span>{palaceName}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 유월 */}
      <div>
        <div className="text-base font-medium text-gray-700 dark:text-gray-200 mb-1">流月運勢</div>
        <div className="space-y-0.5">
          {liunian.liuyue.map(ly => {
            const stars = getMainStarsAtZhi(chart, ly.mingGongZhi)
            const hasMain = stars.length > 0
            return (
              <div
                key={ly.month}
                className={`text-base ${hasMain ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <span className="w-10 inline-block">{LUNAR_MONTH_NAMES[ly.month - 1]}</span>
                <span className="font-hanja text-sm text-gray-400 dark:text-gray-500 mx-1">({ly.mingGongZhi})</span>
                <span className="mr-1">{ly.natalPalaceName}</span>
                <span className="text-gray-400 dark:text-gray-500 text-sm">
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
