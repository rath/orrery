import { useEffect, useMemo, useRef, useState } from 'react'
import type { Profile } from '../utils/profiles.ts'
import { exportProfiles, importProfiles, MAX_PROFILE_FILE_BYTES } from '../utils/profiles.ts'
import { toBirthInput } from '../utils/birth-input.ts'
import { formatBirthTime, formatCompactDate } from '../utils/subject-summary.ts'
import { useLocale } from '../i18n/index.ts'
import { buttonClass, inputSmallClass } from './ui/classes.ts'

interface Props {
  profiles: readonly Profile[]
  /** 지금 명식을 보고 있는 프로필 */
  activeId: string | null
  onSelect: (profile: Profile) => void
  onNew: () => void
  /** 가져오기로 저장소가 바뀌었을 때 목록을 다시 읽게 한다 */
  onChanged: () => void
}

/** 이름으로 찾는 상자는 목록이 이보다 길 때만 보인다 */
const SEARCH_THRESHOLD = 7

/** 일주는 프로필 내용이 바뀔 때만 다시 계산한다 (id와 수정 시각으로 구분) */
const dayPillarCache = new Map<string, string | null>()

function useDayPillars(profiles: readonly Profile[]): ReadonlyMap<string, string> {
  const [pillars, setPillars] = useState<ReadonlyMap<string, string>>(() => new Map())

  useEffect(() => {
    let cancelled = false
    // 사주 엔진은 무거우므로 첫 화면을 그린 뒤에 불러온다.
    import('@orrery/core/saju').then(({ calculateSaju }) => {
      if (cancelled) return
      const next = new Map<string, string>()
      for (const profile of profiles) {
        const key = `${profile.id}:${profile.updatedAt}`
        if (!dayPillarCache.has(key)) {
          let ganzi: string | null = null
          const result = toBirthInput(profile.data)
          if (result.ok) {
            try {
              ganzi = calculateSaju(result.input).pillars[1].pillar.ganzi
            } catch {
              ganzi = null
            }
          }
          dayPillarCache.set(key, ganzi)
        }
        const cached = dayPillarCache.get(key)
        if (cached) next.set(profile.id, cached)
      }
      setPillars(next)
    }).catch(() => { /* 일주 없이도 목록은 쓸 수 있다 */ })
    return () => { cancelled = true }
  }, [profiles])

  return pillars
}

export default function PeoplePanel({ profiles, activeId, onSelect, onNew, onChanged }: Props) {
  const { t } = useLocale()
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dayPillars = useDayPillars(profiles)

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return profiles
    return profiles.filter(profile => profile.name.toLocaleLowerCase().includes(needle))
  }, [profiles, query])

  function handleExport() {
    const blob = new Blob([exportProfiles()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'orrery-profiles.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const fail = () => setMessage({ tone: 'error', text: t('profile.importError') })
    if (file.size > MAX_PROFILE_FILE_BYTES) {
      fail()
      return
    }
    const reader = new FileReader()
    reader.onerror = fail
    reader.onload = () => {
      try {
        const added = importProfiles(reader.result as string)
        setMessage({
          tone: 'ok',
          text: added > 0 ? t('profile.imported').replace('{n}', String(added)) : t('profile.importedNone'),
        })
        if (added > 0) onChanged()
      } catch {
        fail()
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-fg">
          {t('profile.listTitle')}
          {profiles.length > 0 && <span className="ml-1.5 font-normal text-muted tabular-nums">{profiles.length}</span>}
        </h2>
        <button type="button" onClick={onNew} className={buttonClass('secondary', 'sm')}>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          {t('profile.new')}
        </button>
      </div>

      {profiles.length > SEARCH_THRESHOLD && (
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('profile.search')}
          aria-label={t('profile.search')}
          className={`${inputSmallClass} mt-3 w-full`}
        />
      )}

      {profiles.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">{t('profile.emptyHint')}</p>
      ) : visible.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{t('profile.searchEmpty')}</p>
      ) : (
        <ul className="-mx-2 mt-2 min-h-0 flex-1 overflow-y-auto">
          {visible.map(profile => {
            const active = profile.id === activeId
            const time = formatBirthTime(profile.data)
            const dayPillar = dayPillars.get(profile.id)
            return (
              <li key={profile.id}>
                <button
                  type="button"
                  onClick={() => onSelect(profile)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors ${
                    active ? 'bg-sunken' : 'hover:bg-sunken'
                  }`}
                >
                  {/* 보고 있는 프로필에는 로고의 주색 점을 찍는다 */}
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-accent' : 'bg-transparent'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-base ${active ? 'font-semibold text-fg' : 'font-medium text-fg'}`}>
                      {profile.name}
                    </span>
                    <span className="block truncate text-sm text-muted tabular-nums">
                      {formatCompactDate(profile.data)}
                      {time && ` ${time}`}
                      {' · '}
                      {profile.data.gender === 'M' ? t('profile.male') : t('profile.female')}
                    </span>
                  </span>
                  {dayPillar && (
                    <span className="font-hanja shrink-0 text-sm text-fg-2" title={t('profile.ilju')}>{dayPillar}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-sm leading-relaxed text-muted">{t('profile.storageNote')}</p>
        <div className="-ml-3 mt-1 flex flex-wrap items-center">
          <button type="button" onClick={() => fileInputRef.current?.click()} className={buttonClass('ghost', 'sm')}>
            {t('profile.import')}
          </button>
          <button type="button" onClick={handleExport} disabled={profiles.length === 0} className={buttonClass('ghost', 'sm')}>
            {t('profile.export')}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
        <p role="status" className={`text-sm ${message?.tone === 'error' ? 'text-tone-red' : 'text-fg-2'} ${message ? 'mt-1' : ''}`}>
          {message?.text}
        </p>
      </div>
    </div>
  )
}
