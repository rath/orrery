import type { JwaEntry, PillarDetail } from '@orrery/core/types'
import { stemColorClass } from '../../utils/format.ts'
import { useLocale } from '../../i18n/index.ts'
import Section from '../ui/Section.tsx'

interface Props {
  jwabeop: JwaEntry[][]   // [시, 일, 월, 년]
  pillars: PillarDetail[]
  unknownTime?: boolean
}

const LABELS = ['時柱', '日柱', '月柱', '年柱']

export default function JwabeopChart({ jwabeop, pillars, unknownTime }: Props) {
  const { t } = useLocale()
  // 최대 지장간 수 (행 수)
  const maxRows = Math.max(...jwabeop.map(entries => entries.length))
  if (maxRows === 0) return null

  return (
    <Section hanja title="坐法" description={t('saju.jwabeop.desc')}>
      <div className="overflow-x-auto">
        <table className="w-full max-w-xl text-left text-base font-hanja">
          <thead>
            <tr className="text-sm text-muted">
              {LABELS.map((label, i) => (
                <th key={label} scope="col" className="py-1 pr-4 font-normal whitespace-nowrap">
                  {i === 0 && unknownTime ? '' : `${label} ${pillars[i].pillar.branch}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }, (_, row) => (
              <tr key={row}>
                {jwabeop.map((entries, col) => {
                  if (col === 0 && unknownTime) {
                    return <td key={col} className="py-0.5 pr-4 text-faint">?</td>
                  }
                  const entry = entries[row]
                  if (!entry) return <td key={col} className="py-0.5 pr-4" />
                  return (
                    <td key={col} className="py-0.5 pr-4 whitespace-nowrap">
                      <span className={`font-medium ${stemColorClass(entry.stem)}`}>{entry.stem}</span>
                      <span className="ml-1.5 text-sm text-fg-2">{entry.sipsin}</span>
                      <span className="ml-1.5 text-sm text-muted">{entry.unseong}坐</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
