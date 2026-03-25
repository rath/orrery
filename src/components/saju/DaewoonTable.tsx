import { useState, useRef, useEffect, useMemo } from 'react'
import type { DaewoonItem } from '@orrery/core/types'
import { getYearGanzi, getRelation, getJeonggi, getTwelveMeteor, getTwelveSpirit } from '@orrery/core/pillars'
import { stemColorClass, branchColorClass, stemSolidBgClass, branchSolidBgClass } from '../../utils/format.ts'

interface Props {
  daewoon: DaewoonItem[]
  unknownTime?: boolean
  birthYear: number
  dayStem: string
  yearBranch: string
  gongmangBranches: [string, string]
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

interface SewoonItem {
  year: number
  age: number
  ganzi: string
  stemSipsin: string
  branchSipsin: string
  unseong: string
  sinsal: string
  isGongmang: boolean
}

function buildSewoonItems(
  startYear: number, endYear: number,
  birthYear: number, dayStem: string, yearBranch: string,
  gmSet: Set<string>,
): SewoonItem[] {
  const items: SewoonItem[] = []
  for (let y = startYear; y < endYear; y++) {
    const ganzi = getYearGanzi(y)
    const stem = ganzi[0]
    const branch = ganzi[1]
    const rel = getRelation(dayStem, stem)
    const stemSipsin = rel ? rel.hanja : '?'
    const jeonggi = getJeonggi(branch)
    const bRel = getRelation(dayStem, jeonggi)
    const branchSipsin = bRel ? bRel.hanja : '?'
    items.push({
      year: y,
      age: y - birthYear,
      ganzi,
      stemSipsin,
      branchSipsin,
      unseong: getTwelveMeteor(dayStem, branch),
      sinsal: getTwelveSpirit(yearBranch, branch),
      isGongmang: gmSet.has(branch),
    })
  }
  return items
}

export default function DaewoonTable({
  daewoon, unknownTime, birthYear, dayStem, yearBranch, gongmangBranches,
}: Props) {
  if (daewoon.length === 0) {
    return (
      <section>
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">大運</h3>
        <p className="text-base text-gray-400 dark:text-gray-500">대운 데이터가 없습니다.</p>
      </section>
    )
  }

  const activeIdx = findActiveDaewoonIndex(daewoon)
  const [selectedIdx, setSelectedIdx] = useState(activeIdx)
  const activeRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sewoonScrollRef = useRef<HTMLDivElement>(null)
  const sewoonActiveRef = useRef<HTMLDivElement>(null)

  // 사주 재계산 시 선택 초기화
  useEffect(() => {
    setSelectedIdx(activeIdx)
  }, [daewoon])

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      container.scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
    }
  }, [activeIdx])

  useEffect(() => {
    if (sewoonActiveRef.current && sewoonScrollRef.current) {
      const container = sewoonScrollRef.current
      const el = sewoonActiveRef.current
      container.scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
    }
  }, [selectedIdx])

  const gmSet = useMemo(() => new Set(gongmangBranches), [gongmangBranches])

  const sewoonItems = useMemo(() => {
    if (selectedIdx < 0) return []
    const dw = daewoon[selectedIdx]
    const startYear = dw.startDate.getFullYear()
    const endYear = selectedIdx + 1 < daewoon.length
      ? daewoon[selectedIdx + 1].startDate.getFullYear()
      : startYear + 10
    return buildSewoonItems(startYear, endYear, birthYear, dayStem, yearBranch, gmSet)
  }, [selectedIdx, daewoon, birthYear, dayStem, yearBranch, gmSet])

  const currentYear = new Date().getFullYear()

  return (
    <section className="space-y-4">
      {/* 대운 */}
      <div>
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">大運</h3>
        {unknownTime && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
            출생 시간 없이 정오(12:00) 기준으로 계산하여 대운 시작 시기에 수개월 오차가 있을 수 있습니다.
          </p>
        )}
        <div ref={scrollRef} className="overflow-x-auto py-1">
          <div className="flex flex-row-reverse gap-2 w-fit font-hanja">
            {daewoon.map((dw, i) => {
              const isActive = i === activeIdx
              const isSelected = i === selectedIdx
              const stem = dw.ganzi[0]
              const branch = dw.ganzi[1]
              let ringClass = ''
              if (isActive && isSelected) ringClass = 'ring-2 ring-amber-400 dark:ring-amber-500 bg-amber-50 dark:bg-amber-950'
              else if (isActive) ringClass = 'ring-1 ring-amber-300 dark:ring-amber-600'
              else if (isSelected) ringClass = 'ring-2 ring-blue-400 dark:ring-blue-500 bg-blue-50 dark:bg-blue-950'
              return (
                <div
                  key={dw.index}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => setSelectedIdx(i)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${ringClass}`}
                >
                  <span className="text-xs text-gray-500 dark:text-gray-400">{dw.age}세</span>
                  <span className={`text-sm ${stemColorClass(stem)}`}>{dw.stemSipsin}</span>
                  <span className={`inline-flex items-center justify-center w-8 h-8 leading-none text-base rounded pb-[2px] ${stemSolidBgClass(stem)}`}>
                    {stem}
                  </span>
                  <span className={`inline-flex items-center justify-center w-8 h-8 leading-none text-base rounded pb-[2px] ${branchSolidBgClass(branch)}`}>
                    {branch}
                  </span>
                  <span className={`text-sm ${branchColorClass(branch)}`}>{dw.branchSipsin}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{dw.unseong}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{dw.sinsal}</span>
                  {dw.isGongmang && <span className="text-xs text-gray-600 dark:text-gray-300">空亡</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 세운 */}
      {selectedIdx >= 0 && sewoonItems.length > 0 && (
        <div>
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">歲運</h3>
          <div ref={sewoonScrollRef} className="overflow-x-auto py-1">
            <div className="flex flex-row-reverse gap-2 w-fit font-hanja">
              {sewoonItems.map((sw) => {
                const isActive = sw.year === currentYear
                const stem = sw.ganzi[0]
                const branch = sw.ganzi[1]
                return (
                  <div
                    key={sw.year}
                    ref={isActive ? sewoonActiveRef : undefined}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 ${isActive ? 'ring-2 ring-amber-400 dark:ring-amber-500 bg-amber-50 dark:bg-amber-950' : ''}`}
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400">{sw.age}세</span>
                    <span className={`text-sm ${stemColorClass(stem)}`}>{sw.stemSipsin}</span>
                    <span className={`inline-flex items-center justify-center w-8 h-8 leading-none text-base rounded pb-[2px] ${stemSolidBgClass(stem)}`}>
                      {stem}
                    </span>
                    <span className={`inline-flex items-center justify-center w-8 h-8 leading-none text-base rounded pb-[2px] ${branchSolidBgClass(branch)}`}>
                      {branch}
                    </span>
                    <span className={`text-sm ${branchColorClass(branch)}`}>{sw.branchSipsin}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{sw.unseong}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{sw.sinsal}</span>
                    {sw.isGongmang && <span className="text-xs text-gray-600 dark:text-gray-300">空亡</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
