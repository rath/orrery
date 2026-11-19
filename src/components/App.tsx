import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import Header from './Header.tsx'
import BirthForm from './BirthForm.tsx'
import PeoplePanel from './PeoplePanel.tsx'
import PeopleDialog from './PeopleDialog.tsx'
import SubjectHeader from './SubjectHeader.tsx'
import Guide from './Guide.tsx'
import Notice from './ui/Notice.tsx'
import { useLocale } from '../i18n/index.ts'
import { addProfile, deleteProfile, loadProfiles, updateProfile } from '../utils/profiles.ts'
import type { Profile } from '../utils/profiles.ts'
import type { SavedFormState } from '../utils/birth-state.ts'
import { toBirthInput } from '../utils/birth-input.ts'
import { forgetLastInput, loadInitialSubject, rememberSubject, subjectOfProfile } from '../utils/session.ts'
import type { Subject } from '../utils/session.ts'
import logo from '../assets/logo.png'
import logoDark from '../assets/logo-dark.png'

const SajuView = lazy(() => import('./saju/SajuView.tsx'))
const ZiweiView = lazy(() => import('./ziwei/ZiweiView.tsx'))
const NatalView = lazy(() => import('./natal/NatalView.tsx'))

const TABS = ['saju', 'ziwei', 'natal'] as const
type Tab = (typeof TABS)[number]

/** 폼이 열려 있는 이유: 새로 입력하는 중이거나, 보고 있는 명식을 고치는 중이다. */
type Editor = { kind: 'new'; serial: number } | { kind: 'edit' } | null

export default function App() {
  const { t } = useLocale()
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles)
  const [subject, setSubject] = useState<Subject | null>(() => loadInitialSubject(loadProfiles()))
  const [editor, setEditor] = useState<Editor>(() => subject ? null : { kind: 'new', serial: 0 })
  const [tab, setTab] = useState<Tab>('saju')
  const [ziweiYear, setZiweiYear] = useState<number | null>(null)
  const [houseSystem, setHouseSystem] = useState('P')
  const [referenceDate] = useState(() => new Date())
  const [peopleOpen, setPeopleOpen] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const chartRef = useRef<HTMLDivElement>(null)

  const birth = useMemo(() => subject ? toBirthInput(subject.state) : null, [subject])
  const birthInput = birth?.ok ? birth.input : null
  // 저장된 값으로 계산할 수 없으면(예: 좌표에서 시간대를 찾지 못함) 폼을 열어 고치게 한다.
  const activeEditor: Editor = subject && !birthInput && !editor ? { kind: 'edit' } : editor
  const showChart = !!subject && !!birthInput && activeEditor?.kind !== 'new'
  const firstVisit = !subject && profiles.length === 0

  function show(next: Subject | null) {
    setSubject(next)
    rememberSubject(next)
  }

  function focusChart() {
    requestAnimationFrame(() => chartRef.current?.focus({ preventScroll: true }))
  }

  function selectProfile(profile: Profile) {
    show(subjectOfProfile(profile))
    setEditor(null)
    setPeopleOpen(false)
    window.scrollTo({ top: 0 })
  }

  function startNew() {
    setEditor(current => ({ kind: 'new', serial: current?.kind === 'new' ? current.serial + 1 : 0 }))
    setPeopleOpen(false)
    window.scrollTo({ top: 0 })
  }

  function submitForm(state: SavedFormState, name: string): string | null {
    const editingId = activeEditor?.kind === 'edit' ? subject?.profileId ?? null : null
    try {
      if (editingId) {
        updateProfile(editingId, { name, data: state })
        show({ profileId: editingId, name, state })
        setProfiles(loadProfiles())
      } else if (name) {
        show(subjectOfProfile(addProfile(name, state)))
        setProfiles(loadProfiles())
        if (activeEditor?.kind === 'edit') forgetLastInput()
      } else {
        show({ profileId: null, name: '', state })
      }
    } catch {
      return t('profile.storageError')
    }
    setEditor(null)
    window.scrollTo({ top: 0 })
    focusChart()
    return null
  }

  function saveSubject(name: string): string | null {
    if (!subject) return null
    try {
      show(subjectOfProfile(addProfile(name, subject.state)))
      setProfiles(loadProfiles())
      forgetLastInput()
      return null
    } catch {
      return t('profile.storageError')
    }
  }

  function deleteSubject(): string | null {
    if (!subject?.profileId) return null
    try {
      deleteProfile(subject.profileId)
    } catch {
      return t('profile.storageError')
    }
    setProfiles(loadProfiles())
    show(null)
    setEditor({ kind: 'new', serial: 0 })
    window.scrollTo({ top: 0 })
    return null
  }

  const getAllText = useCallback(async () => {
    if (!birthInput) return ''
    const { allChartsToText } = await import('../utils/text-export.ts')
    return allChartsToText(birthInput, { ziweiYear, referenceDate, houseSystem })
  }, [birthInput, ziweiYear, referenceDate, houseSystem])

  function handleTabKeyDown(e: React.KeyboardEvent, index: number) {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    e.preventDefault()
    const next = (index + step + TABS.length) % TABS.length
    setTab(TABS[next])
    tabRefs.current[next]?.focus()
  }

  const people = (
    <PeoplePanel
      profiles={profiles}
      activeId={activeEditor?.kind === 'new' ? null : subject?.profileId ?? null}
      onSelect={selectProfile}
      onNew={startNew}
      onChanged={() => setProfiles(loadProfiles())}
    />
  )

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <Header />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block" aria-label={t('profile.listTitle')}>
          <div className="sticky top-0 flex max-h-screen flex-col py-8">{people}</div>
        </aside>

        <main className="min-w-0 max-w-3xl py-6 lg:py-8">
          {/* 좁은 화면: 프로필 목록을 여는 버튼 */}
          {(profiles.length > 0 || subject) && (
            <button
              type="button"
              onClick={() => setPeopleOpen(true)}
              className="mb-5 flex h-11 w-full items-center gap-2 rounded-md border border-line bg-surface px-3 text-left text-base text-fg transition-colors hover:bg-sunken lg:hidden"
            >
              <svg className="h-5 w-5 shrink-0 text-muted" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM4 16.5A1.5 1.5 0 005.5 18h9a1.5 1.5 0 001.5-1.5c0-2.5-2.7-4.5-6-4.5s-6 2-6 4.5z" />
              </svg>
              <span className="min-w-0 flex-1 truncate font-medium">{t('profile.listTitle')}</span>
              {profiles.length > 0 && <span className="text-sm text-muted tabular-nums">{profiles.length}</span>}
              <svg className="h-4 w-4 shrink-0 text-faint" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* 첫 방문: 무엇을 하는 곳인지 */}
          {firstVisit && (
            <div className="mb-6 flex items-center gap-5">
              <img src={logo} width={512} height={512} alt="" className="h-20 w-20 shrink-0 sm:h-24 sm:w-24 dark:hidden" />
              <img src={logoDark} width={512} height={512} alt="" className="hidden h-20 w-20 shrink-0 sm:h-24 sm:w-24 dark:block" />
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-balance text-fg sm:text-2xl">{t('app.subtitle.tool')}</h1>
                <p className="mt-1.5 text-base leading-relaxed text-pretty text-fg-2">
                  {t('app.lead')}
                </p>
              </div>
            </div>
          )}

          {/* 소개도 명식 제목도 없는 화면에는 화면 낭독기용 제목을 둔다 ('혼천의(渾天儀)'는 번역하지 않는다) */}
          {!firstVisit && (activeEditor || !showChart) && <h1 className="sr-only">혼천의(渾天儀)</h1>}

          {activeEditor && (
            <div className={showChart ? 'mb-8' : ''}>
              <BirthForm
                key={activeEditor.kind === 'new' ? `new-${activeEditor.serial}` : `edit-${subject?.profileId ?? 'unsaved'}`}
                initial={activeEditor.kind === 'edit' ? subject?.state ?? null : null}
                initialName={activeEditor.kind === 'edit' ? subject?.name ?? '' : ''}
                saved={activeEditor.kind === 'edit' && !!subject?.profileId}
                onSubmit={submitForm}
                onCancel={subject && birthInput ? () => setEditor(null) : undefined}
                onDelete={activeEditor.kind === 'edit' && subject?.profileId ? deleteSubject : undefined}
              />
              {subject && !birthInput && birth && !birth.ok && (
                <Notice tone="error" role="alert" className="mt-3">{t('form.timezoneAutoDetectFailed')}</Notice>
              )}
            </div>
          )}

          {showChart && subject && birthInput && (
            <div ref={chartRef} tabIndex={-1} className="outline-none">
              {!activeEditor && (
                <SubjectHeader
                  key={subject.profileId ?? 'unsaved'}
                  subject={subject}
                  onEdit={() => setEditor({ kind: 'edit' })}
                  onSave={saveSubject}
                  getAllText={getAllText}
                />
              )}

              <div className="sticky top-0 z-10 -mx-4 border-b border-line bg-bg px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
                <div role="tablist" aria-label={t('app.subtitle.tool')} className="no-scrollbar -mx-3 flex overflow-x-auto">
                  {TABS.map((id, i) => {
                    const selected = tab === id
                    return (
                      <button
                        key={id}
                        ref={el => { tabRefs.current[i] = el }}
                        type="button"
                        role="tab"
                        id={`tab-${id}`}
                        aria-selected={selected}
                        aria-controls={`panel-${id}`}
                        tabIndex={selected ? 0 : -1}
                        onClick={e => { setTab(id); e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' }) }}
                        onKeyDown={e => handleTabKeyDown(e, i)}
                        className={`relative h-12 shrink-0 px-3 text-base whitespace-nowrap transition-colors focus-visible:outline-offset-[-2px] ${
                          selected ? 'font-semibold text-fg' : 'text-muted hover:text-fg'
                        }`}
                      >
                        {t(`app.tab.${id}`)}
                        {selected && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-accent" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-4">
                <Suspense fallback={<p role="status" className="py-12 text-center text-muted">{t('app.loading')}</p>}>
                  {tab === 'saju' && <SajuView input={birthInput} />}
                  {tab === 'ziwei' && <ZiweiView input={birthInput} year={ziweiYear} onYearChange={setZiweiYear} referenceDate={referenceDate} />}
                  {tab === 'natal' && <NatalView input={birthInput} houseSystem={houseSystem} onHouseSystemChange={setHouseSystem} />}
                </Suspense>
              </div>
            </div>
          )}

          <Guide />
        </main>
      </div>

      <footer className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted sm:px-6">
          &copy; 2026 Jang-Ho Hwang
          <span className="mx-1.5" aria-hidden="true">·</span>
          <a href="https://x.com/xrath" target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-fg hover:decoration-fg">@xrath</a>
          <span className="mx-1.5" aria-hidden="true">·</span>
          <a href="https://x.com/xrath/status/2022548658562937028" target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-fg hover:decoration-fg">{t('app.intro')}</a>
        </p>
      </footer>

      {peopleOpen && <PeopleDialog onClose={() => setPeopleOpen(false)}>{people}</PeopleDialog>}
    </div>
  )
}
