import { useRef, useEffect } from 'react'
import type { ZiweiChart } from '@orrery/core/types'
import { getDaxianIndex, getDaxianList } from '@orrery/core/ziwei'
import { stemSolidBgClass, branchSolidBgClass } from '../../utils/format.ts'
import Section from '../ui/Section.tsx'

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
    <Section hanja title="大限">
      <div ref={scrollRef} className="overflow-x-auto py-1">
        <div className="flex w-fit flex-row-reverse gap-1 font-hanja">
          {daxianList.map((dx, i) => {
            const isActive = i === activeIdx
            const gan = dx.ganZhi[0]
            const zhi = dx.ganZhi[1]
            return (
              <div
                key={i}
                ref={isActive ? activeRef : undefined}
                aria-current={isActive ? 'true' : undefined}
                className={`flex shrink-0 flex-col items-center gap-0.5 rounded-md px-1.5 py-1.5 ${isActive ? 'bg-accent-soft' : ''}`}
              >
                <span className={`text-sm whitespace-nowrap tabular-nums ${isActive ? 'font-semibold text-accent-ink' : 'text-muted'}`}>
                  {dx.ageStart}-{dx.ageEnd}
                </span>
                <span className="text-sm text-fg-2">{dx.palaceName}</span>
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded pb-[2px] text-lg leading-none ${stemSolidBgClass(gan)}`}>
                  {gan}
                </span>
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded pb-[2px] text-lg leading-none ${branchSolidBgClass(zhi)}`}>
                  {zhi}
                </span>
                {dx.mainStars.length > 0 ? (
                  <div className="mt-0.5 text-center text-sm leading-tight text-fg-2">
                    {dx.mainStars.map(s => (
                      <div key={s}>{s}</div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-0.5 text-sm text-muted">空宮</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
