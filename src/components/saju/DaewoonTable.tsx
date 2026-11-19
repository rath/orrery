import { useState, useRef, useEffect, useMemo } from 'react'
import type { DaewoonItem } from '@orrery/core/types'
import { getYearGanzi, getRelation, getJeonggi, getTwelveMeteor, getTwelveSpirit } from '@orrery/core/pillars'
import { stemColorClass, branchColorClass, stemSolidBgClass, branchSolidBgClass } from '../../utils/format.ts'
import { useLocale } from '../../i18n/index.ts'
import Section from '../ui/Section.tsx'
import Notice from '../ui/Notice.tsx'

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

/** 대운·세운 한 칸의 모양. 지금 해당하는 칸은 주색 바탕, 고른 칸은 먹색 테두리로 구분한다. */
function columnClass(current: boolean, selected: boolean): string {
  return `flex shrink-0 flex-col items-center gap-0.5 rounded-md px-1.5 py-1.5 ${current ? 'bg-accent-soft' : ''} ${
    selected ? 'ring-2 ring-fg ring-inset' : ''
  }`
}

const TILE = 'inline-flex h-9 w-9 items-center justify-center rounded pb-[2px] text-lg leading-none'

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
  const { t } = useLocale()

  const activeIdx = findActiveDaewoonIndex(daewoon)
  const [selection, setSelection] = useState<{ source: DaewoonItem[]; index: number } | null>(null)
  const selectedIdx = selection?.source === daewoon ? selection.index : activeIdx
  const activeRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sewoonScrollRef = useRef<HTMLDivElement>(null)
  const sewoonActiveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      container.scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
    }
  }, [activeIdx, daewoon])

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
    if (!dw) return []
    const startYear = dw.startDate.getUTCFullYear()
    const endYear = selectedIdx + 1 < daewoon.length
      ? daewoon[selectedIdx + 1].startDate.getUTCFullYear()
      : startYear + 10
    return buildSewoonItems(startYear, endYear, birthYear, dayStem, yearBranch, gmSet)
  }, [selectedIdx, daewoon, birthYear, dayStem, yearBranch, gmSet])

  const currentYear = new Date().getFullYear()

  if (daewoon.length === 0) {
    return (
      <Section hanja title="大運">
        <p className="text-base text-muted">{t('saju.noData')}</p>
      </Section>
    )
  }

  return (
    <>
      <Section hanja title="大運" description={t('saju.daewoonHint')}>
        {unknownTime && <Notice tone="warn" className="mb-3">{t('saju.unknownTimeWarning')}</Notice>}
        <div ref={scrollRef} className="overflow-x-auto py-1">
          <div className="flex w-fit flex-row-reverse gap-1 font-hanja">
            {daewoon.map((dw, i) => {
              const isActive = i === activeIdx
              const isSelected = i === selectedIdx
              const stem = dw.ganzi[0]
              const branch = dw.ganzi[1]
              return (
                <div key={dw.index} ref={isActive ? activeRef : undefined}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => setSelection({ source: daewoon, index: i })}
                    className={`${columnClass(isActive, isSelected)} transition-colors ${isActive || isSelected ? '' : 'hover:bg-sunken'}`}
                  >
                    <span className={`text-sm tabular-nums ${isActive ? 'font-semibold text-accent-ink' : 'text-muted'}`}>{dw.age}{t('saju.ageSuffix')}</span>
                    <span className={`text-sm ${stemColorClass(stem)}`}>{dw.stemSipsin}</span>
                    <span className={`${TILE} ${stemSolidBgClass(stem)}`}>{stem}</span>
                    <span className={`${TILE} ${branchSolidBgClass(branch)}`}>{branch}</span>
                    <span className={`text-sm ${branchColorClass(branch)}`}>{dw.branchSipsin}</span>
                    <span className="text-sm text-fg-2">{dw.unseong}</span>
                    <span className="text-sm text-fg-2">{dw.sinsal}</span>
                    <span className="h-5 text-sm text-muted">{dw.isGongmang ? '空亡' : ''}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      {selectedIdx >= 0 && sewoonItems.length > 0 && (
        <Section hanja title="歲運">
          <div ref={sewoonScrollRef} className="overflow-x-auto py-1">
            <div className="flex w-fit flex-row-reverse gap-1 font-hanja">
              {sewoonItems.map(sw => {
                const isActive = sw.year === currentYear
                const stem = sw.ganzi[0]
                const branch = sw.ganzi[1]
                return (
                  <div
                    key={sw.year}
                    ref={isActive ? sewoonActiveRef : undefined}
                    aria-current={isActive ? 'true' : undefined}
                    className={columnClass(isActive, false)}
                  >
                    <span className="text-sm text-muted tabular-nums">{sw.year}</span>
                    <span className={`text-sm tabular-nums ${isActive ? 'font-semibold text-accent-ink' : 'text-muted'}`}>{sw.age}{t('saju.ageSuffix')}</span>
                    <span className={`text-sm ${stemColorClass(stem)}`}>{sw.stemSipsin}</span>
                    <span className={`${TILE} ${stemSolidBgClass(stem)}`}>{stem}</span>
                    <span className={`${TILE} ${branchSolidBgClass(branch)}`}>{branch}</span>
                    <span className={`text-sm ${branchColorClass(branch)}`}>{sw.branchSipsin}</span>
                    <span className="text-sm text-fg-2">{sw.unseong}</span>
                    <span className="text-sm text-fg-2">{sw.sinsal}</span>
                    <span className="h-5 text-sm text-muted">{sw.isGongmang ? '空亡' : ''}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Section>
      )}
    </>
  )
}
