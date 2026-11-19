import type { InjongEntry, PillarDetail } from '@orrery/core/types'
import { ELEMENT_HANJA } from '@orrery/core/constants'
import { STEM_INFO } from '@orrery/core/constants'
import { stemColorClass } from '../../utils/format.ts'
import { useLocale } from '../../i18n/index.ts'
import Section from '../ui/Section.tsx'

interface Props {
  injongbeop: InjongEntry[]
  pillars: PillarDetail[] // [시, 일, 월, 년]
}

export default function InjongbeopChart({ injongbeop, pillars }: Props) {
  const { t } = useLocale()
  if (injongbeop.length === 0) return null

  const dayBranch = pillars[1].pillar.branch
  const jigang = pillars[1].jigang.replace(/ /g, '')

  // 일지 지장간의 십신 요약
  const jigangSummary = [...jigang].map(stem => {
    const info = STEM_INFO[stem]
    const el = info ? ELEMENT_HANJA[info.element] : '?'
    return `${stem}${el}`
  }).join(' ')

  return (
    <Section
      hanja
      title="引從法"
      description={<>
        日支 <span className="font-hanja">{dayBranch}</span> {t('saju.injong.jijanggan')}:
        <span className="ml-1 font-hanja">{jigangSummary}</span>
        {t('saju.injong.desc')}
      </>}
    >
      <ul className="flex flex-wrap gap-x-6 gap-y-1.5">
        {injongbeop.map(entry => (
          <li key={entry.category} className="flex items-center gap-1.5 text-base">
            <span className={`font-hanja font-medium ${stemColorClass(entry.yangStem)}`}>
              {entry.yangStem}{ELEMENT_HANJA[STEM_INFO[entry.yangStem]?.element ?? ''] ?? ''}
            </span>
            <span className="font-hanja text-fg-2">{entry.category}</span>
            <span className="text-faint" aria-hidden="true">→</span>
            <span className="font-hanja">{entry.unseong}從</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
