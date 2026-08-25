import { useMemo } from 'react'
import { createChart } from '@orrery/core/ziwei'
import MingPanGrid from './MingPanGrid.tsx'
import SihuaSummary from './SihuaSummary.tsx'
import DaxianTable from './DaxianTable.tsx'
import LiunianView from './LiunianView.tsx'
import CopyButton from '../CopyButton.tsx'
import { ziweiToText } from '../../utils/text-export.ts'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'

interface Props {
  input: BirthInput
}

export default function ZiweiView({ input }: Props) {
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

  if (input.unknownTime || !chart) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-base text-amber-800 dark:text-amber-300 font-medium">
          {t('ziwei.needTime')}
        </p>
        <p className="text-base text-amber-600 dark:text-amber-400 mt-1">
          {t('ziwei.needTimeDesc')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 命盤 그리드 (기본 정보 + 12궁) */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-medium text-gray-700 dark:text-gray-200">紫微斗數 命盤</h2>
          <CopyButton getText={() => ziweiToText(chart)} label={t('copy.aiCopy')} />
        </div>
        <MingPanGrid chart={chart} />
      </div>

      {/* 사화 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <SihuaSummary chart={chart} />
      </div>

      {/* 대한 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <DaxianTable chart={chart} />
      </div>

      {/* 유년 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <LiunianView chart={chart} />
      </div>
    </div>
  )
}
