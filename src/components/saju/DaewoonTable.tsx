import type { DaewoonItem } from '../../core/types.ts'
import { stemColorClass, branchColorClass, stemSolidBgClass, branchSolidBgClass } from '../../utils/format.ts'

interface Props {
  daewoon: DaewoonItem[]
}

function findActiveDaewoonIndex(daewoon: DaewoonItem[]): number {
  const now = new Date()
  let activeIdx = -1
  for (let i = 0; i < daewoon.length; i++) {
    if (daewoon[i].startDate <= now) {
      activeIdx = i
    }
  }
  return activeIdx
}

export default function DaewoonTable({ daewoon }: Props) {
  if (daewoon.length === 0) {
    return (
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">大運</h3>
        <p className="text-sm text-gray-400">대운 계산에는 출생 시간이 필요합니다.</p>
      </section>
    )
  }

  const activeIdx = findActiveDaewoonIndex(daewoon)

  return (
    <section>
      <h3 className="text-sm font-medium text-gray-700 mb-2">大運</h3>
      <div className="overflow-x-auto">
        <div className="flex flex-row-reverse gap-1 w-fit font-hanja">
          {daewoon.map((dw, i) => {
            const isActive = i === activeIdx
            const stem = dw.ganzi[0]
            const branch = dw.ganzi[1]
            return (
              <div
                key={dw.index}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 ${isActive ? 'ring-2 ring-amber-400 bg-amber-50' : ''}`}
              >
                <span className="text-xs text-gray-500">{dw.age}세</span>
                <span className={`text-xs ${stemColorClass(stem)}`}>{dw.stemSipsin}</span>
                <span className={`inline-block w-8 h-8 leading-8 text-center text-base rounded ${stemSolidBgClass(stem)}`}>
                  {stem}
                </span>
                <span className={`inline-block w-8 h-8 leading-8 text-center text-base rounded ${branchSolidBgClass(branch)}`}>
                  {branch}
                </span>
                <span className={`text-xs ${branchColorClass(branch)}`}>{dw.branchSipsin}</span>
                <span className="text-xs text-gray-500">{dw.unseong}</span>
                <span className="text-xs text-gray-500">{dw.sinsal}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
