import { useState, useMemo } from 'react'
import { findTransits } from '@orrery/core/pillars'
import { formatRelation } from '../../utils/format.ts'
import { useLocale } from '../../i18n/index.ts'
import Section from '../ui/Section.tsx'
import Segmented from '../ui/Segmented.tsx'
import { selectSmallClass } from '../ui/classes.ts'

interface Props {
  natalPillars: string[]  // [시주, 일주, 월주, 년주]
}

export default function TransitView({ natalPillars }: Props) {
  const { t } = useLocale()
  const [months, setMonths] = useState(1)
  const [backward, setBackward] = useState(false)

  const transits = useMemo(
    () => findTransits(natalPillars, months, backward),
    [natalPillars, months, backward],
  )

  const direction = backward ? t('saju.transit.past') : t('saju.transit.future')

  return (
    <Section
      hanja
      title="運勢"
      controls={<>
        <select
          value={months}
          onChange={e => setMonths(Number(e.target.value))}
          aria-label="運勢"
          className={selectSmallClass}
        >
          <option value={1}>{t('saju.transit.1month')}</option>
          <option value={3}>{t('saju.transit.3months')}</option>
          <option value={6}>{t('saju.transit.6months')}</option>
        </select>
        <Segmented
          aria-label="運勢"
          size="sm"
          value={backward ? 'past' : 'future'}
          options={[
            { value: 'future', label: t('saju.transit.futureBtn') },
            { value: 'past', label: t('saju.transit.pastBtn') },
          ]}
          onChange={value => setBackward(value === 'past')}
        />
      </>}
    >
      {transits.length === 0 ? (
        <p className="text-base text-muted">{direction} {months}{t('saju.transit.noRelation')}</p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="text-left text-base">
            <tbody>
              {transits.map((tr, i) => {
                const date = tr.date
                const dateStr = t('date.monthDay')
                  .replace('{m}', String(date.getMonth() + 1))
                  .replace('{d}', String(date.getDate()))
                const prefixMap: Record<string, string> = { '천간': t('transit.stem'), '지지': t('transit.branch') }
                const relStrs = tr.relations.map(r => `${prefixMap[r.prefix] ?? r.prefix}${formatRelation(r.relation)}`)

                return (
                  <tr key={i} className="border-b border-line last:border-b-0">
                    <td className="py-1.5 pr-5 whitespace-nowrap text-muted tabular-nums">{dateStr}</td>
                    <td className={`py-1.5 pr-5 font-hanja whitespace-nowrap ${tr.type === '月運' ? 'font-medium text-tone-blue' : 'text-fg-2'}`}>
                      {tr.type}
                    </td>
                    <td className="py-1.5 pr-5 font-hanja whitespace-nowrap text-fg">
                      {tr.transit}
                      <span className="mx-1.5 text-faint" aria-hidden="true">↔</span>
                      {tr.natalName}
                    </td>
                    <td className="py-1.5 text-fg-2">{relStrs.join(', ')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  )
}
