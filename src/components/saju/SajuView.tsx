import { useMemo } from 'react'
import { calculateSaju } from '../../core/saju.ts'
import PillarTable from './PillarTable.tsx'
import RelationList from './RelationList.tsx'
import SinsalList from './SinsalList.tsx'
import DaewoonTable from './DaewoonTable.tsx'
import TransitView from './TransitView.tsx'
import CopyButton from '../CopyButton.tsx'
import { sajuToText } from '../../utils/text-export.ts'
import type { BirthInput } from '../../core/types.ts'

interface Props {
  input: BirthInput
}

export default function SajuView({ input }: Props) {
  const result = useMemo(() => calculateSaju(input), [input])

  const ganzis = result.pillars.map(p => p.pillar.ganzi)
  const natalPillars = ganzis // [시, 일, 월, 년]

  return (
    <div className="space-y-6">
      {/* 명식 테이블 */}
      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">四柱八字</h2>
          <CopyButton getText={() => sajuToText(result)} label="AI 해석용 복사" />
        </div>
        <PillarTable pillars={result.pillars} unknownTime={input.unknownTime} />
      </section>

      {/* 팔자 관계 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <RelationList relations={result.relations} pillars={ganzis} />
      </div>

      {/* 신살 */}
      {(result.specialSals.yangin.length > 0 || result.specialSals.baekho || result.specialSals.goegang) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <SinsalList sals={result.specialSals} />
        </div>
      )}

      {/* 대운 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <DaewoonTable daewoon={result.daewoon} />
      </div>

      {/* 트랜짓 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <TransitView natalPillars={natalPillars} />
      </div>
    </div>
  )
}
