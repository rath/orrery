import { useRef, useEffect } from 'react'
import type { ZiweiChart } from '@orrery/core/types'
import { getDaxianIndex, getDaxianList } from '@orrery/core/ziwei'
import { stemSolidBgClass, branchSolidBgClass } from '../../utils/format.ts'

interface Props {
  chart: ZiweiChart
}

export default function DaxianTable({ chart }: Props) {
  const daxianList = getDaxianList(chart)
  const activeIdx = getDaxianIndex(chart, new Date().getFullYear())
  const activeRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      container.scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
    }
  }, [activeIdx])

  return (
    <section>
      <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">大限</h3>
      <div ref={scrollRef} className="overflow-x-auto py-1">
        <div className="flex flex-row-reverse gap-1 w-fit font-hanja">
          {daxianList.map((dx, i) => {
            const isActive = i === activeIdx
            const gan = dx.ganZhi[0]
            const zhi = dx.ganZhi[1]
            return (
              <div
                key={i}
                ref={isActive ? activeRef : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 ${isActive ? 'ring-2 ring-amber-400 dark:ring-amber-500 bg-amber-50 dark:bg-amber-950' : ''}`}
              >
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {dx.ageStart}-{dx.ageEnd}歲
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{dx.palaceName}</span>
                <span className={`inline-flex items-center justify-center w-8 h-8 leading-none text-base rounded pb-[2px] ${stemSolidBgClass(gan)}`}>
                  {gan}
                </span>
                <span className={`inline-flex items-center justify-center w-8 h-8 leading-none text-base rounded pb-[2px] ${branchSolidBgClass(zhi)}`}>
                  {zhi}
                </span>
                {dx.mainStars.length > 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight mt-0.5">
                    {dx.mainStars.map(s => (
                      <div key={s}>{s}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">空宮</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
