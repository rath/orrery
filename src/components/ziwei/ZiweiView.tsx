import { useMemo } from 'react'
import { createChart } from '../../core/ziwei.ts'
import MingPanGrid from './MingPanGrid.tsx'
import SihuaSummary from './SihuaSummary.tsx'
import DaxianTable from './DaxianTable.tsx'
import LiunianView from './LiunianView.tsx'
import CopyButton from '../CopyButton.tsx'
import { ziweiToText } from '../../utils/text-export.ts'
import type { BirthInput } from '../../core/types.ts'

interface Props {
  input: BirthInput
}

export default function ZiweiView({ input }: Props) {
  if (input.unknownTime) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800 font-medium">
          자미두수는 출생 시간이 필수입니다.
        </p>
        <p className="text-sm text-amber-600 mt-1">
          시간에 따라 명반 전체 구조가 바뀝니다. 출생 시간을 입력해주세요.
        </p>
      </div>
    )
  }

  const chart = useMemo(
    () => createChart(input.year, input.month, input.day, input.hour, input.minute, input.gender === 'M'),
    [input],
  )

  return (
    <div className="space-y-6">
      {/* 命盤 그리드 (기본 정보 + 12궁) */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-medium text-gray-700">紫微斗數 命盤</h2>
          <CopyButton getText={() => ziweiToText(chart)} label="AI 해석용 복사" />
        </div>
        <MingPanGrid chart={chart} />
      </div>

      {/* 사화 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <SihuaSummary chart={chart} />
      </div>

      {/* 대한 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <DaxianTable chart={chart} />
      </div>

      {/* 유년 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <LiunianView chart={chart} />
      </div>
    </div>
  )
}
