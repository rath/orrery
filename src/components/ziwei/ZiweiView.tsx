import { useMemo } from 'react'
import { createChart, calculateLiunian } from '@orrery/core/ziwei'
import { getBirthTimezone } from '@orrery/core/timezone'
import MingPanGrid from './MingPanGrid.tsx'
import SihuaSummary from './SihuaSummary.tsx'
import DaxianTable from './DaxianTable.tsx'
import LiunianView from './LiunianView.tsx'
import CopyButton from '../CopyButton.tsx'
import Section from '../ui/Section.tsx'
import Notice from '../ui/Notice.tsx'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import { resolveLiunianYear } from '../../utils/ziwei-year.ts'

interface Props {
  input: BirthInput
  year: number | null
  onYearChange: (year: number) => void
  referenceDate: Date
}

export default function ZiweiView({ input, year, onYearChange, referenceDate }: Props) {
  const { t } = useLocale()

  const chart = useMemo(
    () => input.unknownTime
      ? null
      : createChart(
          input.year, input.month, input.day,
          input.hour, input.minute, input.gender === 'M', input.timezone, input.longitude,
        ),
    [input],
  )

  const liunian = useMemo(
    () => chart ? calculateLiunian(chart, resolveLiunianYear(chart, year, referenceDate)) : null,
    [chart, year, referenceDate],
  )

  if (input.unknownTime || !chart || !liunian) {
    return <Notice tone="warn" title={t('ziwei.needTime')}>{t('ziwei.needTimeDesc')}</Notice>
  }

  return (
    <div>
      <Section
        level={2}
        hanja
        title="紫微斗數 命盤"
        action={<CopyButton getText={async () => (await import('../../utils/text-export.ts')).ziweiToText(chart, liunian, { timezone: getBirthTimezone(input) })} label={t('copy.aiCopy')} />}
      >
        <MingPanGrid chart={chart} />
      </Section>
      <SihuaSummary chart={chart} />
      <DaxianTable chart={chart} />
      <LiunianView chart={chart} liunian={liunian} onYearChange={onYearChange} />
    </div>
  )
}
