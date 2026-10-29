import { useMemo } from 'react'
import { calculateSaju } from '@orrery/core/saju'
import PillarTable from './PillarTable.tsx'
import RelationList from './RelationList.tsx'
import SinsalList from './SinsalList.tsx'
import JwabeopChart from './JwabeopChart.tsx'
import InjongbeopChart from './InjongbeopChart.tsx'
import DaewoonTable from './DaewoonTable.tsx'
import TransitView from './TransitView.tsx'
import CopyButton from '../CopyButton.tsx'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'

interface Props {
  input: BirthInput
}

export default function SajuView({ input }: Props) {
  const { t } = useLocale()
  const result = useMemo(() => calculateSaju(input), [input])

  const ganzis = useMemo(() => result.pillars.map(p => p.pillar.ganzi), [result])
  const natalPillars = ganzis // [시, 일, 월, 년]

  return (
    <div className="space-y-6">
      {/* 명식 테이블 */}
      <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-gray-700 dark:text-gray-200">四柱八字</h2>
          <CopyButton getText={async () => (await import('../../utils/text-export.ts')).sajuToText(result)} label={t('copy.aiCopy')} />
        </div>
        <PillarTable pillars={result.pillars} unknownTime={input.unknownTime} gongmang={result.gongmang} />
      </section>

      {/* 팔자 관계 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <RelationList relations={result.relations} pillars={ganzis} />
      </div>

      {/* 신살 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <SinsalList sals={result.specialSals} />
      </div>

      {/* 좌법 · 인종법 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <JwabeopChart jwabeop={result.jwabeop} pillars={result.pillars} unknownTime={input.unknownTime} />
        <InjongbeopChart injongbeop={result.injongbeop} pillars={result.pillars} />
      </div>

      {/* 대운 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <DaewoonTable
          daewoon={result.daewoon}
          unknownTime={input.unknownTime}
          birthYear={input.year}
          dayStem={result.pillars[1].pillar.stem}
          yearBranch={result.pillars[3].pillar.branch}
          gongmangBranches={result.gongmang.branches}
        />
      </div>

      {/* 트랜짓 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <TransitView natalPillars={natalPillars} />
      </div>
    </div>
  )
}
