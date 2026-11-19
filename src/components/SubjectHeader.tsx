import { useEffect, useRef, useState } from 'react'
import type { Subject } from '../utils/session.ts'
import { formatBirthDate, formatBirthTime, formatPlace } from '../utils/subject-summary.ts'
import { getTimeZoneDisplayLabelAtLocalTime, inferTimeZoneFromCoordinates } from '../utils/timezones.ts'
import { MAX_PROFILE_NAME_LENGTH } from '../utils/profiles.ts'
import { useLocale } from '../i18n/index.ts'
import CopyButton from './CopyButton.tsx'
import { buttonClass, errorClass, inputClass } from './ui/classes.ts'

interface Props {
  subject: Subject
  onEdit: () => void
  /** 저장하지 않은 명식에 이름을 붙여 저장한다. 실패하면 오류 문구를 돌려준다. */
  onSave: (name: string) => string | null
  getAllText: () => Promise<string>
}

/** 지금 보고 있는 명식이 누구의 것인지 보여주고, 저장·수정·복사를 여기서 한다. */
export default function SubjectHeader({ subject, onEdit, onSave, getAllText }: Props) {
  const { t, locale } = useLocale()
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const { state } = subject
  const saved = subject.profileId !== null

  useEffect(() => {
    if (naming) nameRef.current?.focus()
  }, [naming])

  const time = formatBirthTime(state)
  const timezone = inferTimeZoneFromCoordinates(state.latitude, state.longitude)
  const timezoneLabel = timezone
    ? getTimeZoneDisplayLabelAtLocalTime(
        timezone, state.year, state.month, state.day,
        state.unknownTime ? 12 : state.hour, state.unknownTime ? 0 : state.minute,
      ) ?? timezone
    : null
  const facts = [
    formatBirthDate(state, locale),
    time ?? t('profile.timeUnknown'),
    state.gender === 'M' ? t('form.male') : t('form.female'),
    formatPlace(state),
    timezoneLabel,
  ].filter((fact): fact is string => !!fact)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const failure = onSave(trimmed)
    setError(failure)
    if (!failure) {
      setNaming(false)
      setName('')
    }
  }

  return (
    <div className="pb-5">
      {naming ? (
        <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2">
          <div className="w-64 max-w-full">
            <input
              ref={nameRef}
              type="text"
              value={name}
              maxLength={MAX_PROFILE_NAME_LENGTH}
              onChange={e => { setName(e.target.value); setError(null) }}
              onKeyDown={e => { if (e.key === 'Escape') setNaming(false) }}
              placeholder={t('profile.namePlaceholder')}
              aria-label={t('form.name')}
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={!name.trim()} className={buttonClass('primary')}>
            {t('profile.save')}
          </button>
          <button type="button" onClick={() => { setNaming(false); setError(null) }} className={buttonClass('ghost')}>
            {t('profile.cancel')}
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-balance text-fg">
            {saved ? subject.name : t('subject.unsaved')}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {!saved && (
              <button type="button" onClick={() => setNaming(true)} className={buttonClass('secondary')}>
                {t('profile.save')}
              </button>
            )}
            <button type="button" onClick={onEdit} className={buttonClass('secondary')}>
              {t('subject.edit')}
            </button>
            <CopyButton variant="primary" size="md" label={t('app.copyAll')} getText={getAllText} />
          </div>
        </div>
      )}
      {error && <p role="alert" className={errorClass}>{error}</p>}
      <p className="mt-2 text-base leading-relaxed text-fg-2 tabular-nums">
        {facts.map((fact, i) => (
          // 구분점은 앞 항목에 붙여, 줄이 바뀌어도 줄 머리에 오지 않게 한다
          <span key={i} className="whitespace-nowrap">
            {fact}
            {i < facts.length - 1 && <span className="mx-1.5 text-faint" aria-hidden="true">·</span>}
          </span>
        ))}
      </p>
    </div>
  )
}
