import { useState } from 'react'
import type { ZiweiChart, LiuNianInfo } from '@orrery/core/types'
import { MAIN_STAR_NAMES } from '@orrery/core/constants'
import { useLocale } from '../../i18n/index.ts'
import Section from '../ui/Section.tsx'
import { inputSmallClass } from '../ui/classes.ts'

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
    '化祿': 'text-tone-green',
    '化權': 'text-tone-amber',
    '化科': 'text-tone-blue',
    '化忌': 'text-tone-red',
  }

  return (
    <Section
      title={t('ziwei.lunarYear')}
      controls={<>
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
          className={`${inputSmallClass} w-24 tabular-nums`}
        />
        <span className="font-hanja text-base text-fg-2">{liunian.gan}{liunian.zhi}年</span>
      </>}
    >
      <dl className="grid w-fit grid-cols-[auto_auto] gap-x-4 gap-y-1 text-base">
        <dt className="font-hanja font-medium text-fg">大限</dt>
        <dd className="text-fg-2">
          <span className="tabular-nums">{liunian.daxianAgeStart}-{liunian.daxianAgeEnd}</span>歲 {liunian.daxianPalaceName}
        </dd>
        <dt className="font-hanja font-medium text-fg">流年命宮</dt>
        <dd className="text-fg-2">
          <span className="font-hanja">{liunian.mingGongZhi}</span>宮
          <span className="mx-1.5 text-faint" aria-hidden="true">→</span>
          本命 {liunian.natalPalaceAtMing}
          <span className="ml-1.5 text-muted">
            ({getMainStarsAtZhi(chart, liunian.mingGongZhi).join(', ') || '空宮'})
          </span>
        </dd>
      </dl>

      <h4 className="mt-5 mb-2 font-hanja text-base font-semibold text-fg">流年四化</h4>
      <dl className="grid w-fit grid-cols-[auto_auto_auto] gap-x-4 gap-y-1 font-hanja text-base">
        {['化祿', '化權', '化科', '化忌'].map(huaType => {
          let starName = ''
          for (const [s, h] of Object.entries(liunian.siHua)) {
            if (h === huaType) { starName = s; break }
          }
          const palaceName = liunian.siHuaPalaces[huaType] || '?'
          if (!starName) return null
          return (
            <div key={huaType} className="contents">
              <dt className={`font-medium ${colorMap[huaType]}`}>{huaType}</dt>
              <dd className="text-fg">{starName}</dd>
              <dd className="text-fg-2"><span className="mr-1 text-faint" aria-hidden="true">→</span>{palaceName}</dd>
            </div>
          )
        })}
      </dl>

      <h4 className="mt-5 mb-2 font-hanja text-base font-semibold text-fg">流月運勢</h4>
      <table className="text-left text-base">
        <tbody>
          {liunian.liuyue.map(ly => {
            const stars = getMainStarsAtZhi(chart, ly.mingGongZhi)
            return (
              <tr key={ly.month} className="border-b border-line last:border-b-0">
                <th scope="row" className="py-1 pr-4 font-hanja font-normal whitespace-nowrap text-fg">
                  {LUNAR_MONTH_NAMES[ly.month - 1]}
                </th>
                <td className="py-1 pr-4 font-hanja text-muted">{ly.mingGongZhi}</td>
                <td className="py-1 pr-4 font-hanja whitespace-nowrap text-fg">{ly.natalPalaceName}</td>
                <td className="py-1 font-hanja text-fg-2">{stars.length > 0 ? stars.join(', ') : <span className="text-muted">空宮</span>}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Section>
  )
}
