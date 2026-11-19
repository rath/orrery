import { useId, useMemo, useRef, useState } from 'react'
import type { Gender, JasiMethod } from '@orrery/core/types'
import { isKoreanDaylightTime, isKoreanHistoricalTimeAnomaly } from '@orrery/core/timezone'
import type { City } from '@orrery/core/cities'
import { SEOUL } from '@orrery/core/cities'
import CityCombobox from './CityCombobox.tsx'
import Segmented from './ui/Segmented.tsx'
import Notice from './ui/Notice.tsx'
import { buttonClass, errorClass, hintClass, inputClass, labelClass, selectClass } from './ui/classes.ts'
import { useLocale } from '../i18n/index.ts'
import {
  getTimeZoneDisplayLabelAtLocalTime,
  inferTimeZoneFromCoordinates,
  isDaylightSavingInEffect,
} from '../utils/timezones.ts'
import {
  formatCoordinate,
  isCoordinateDraft,
  parseCoordinateDraft,
  stepCoordinate,
} from '../utils/coordinate-input.ts'
import type { SavedFormState } from '../utils/birth-state.ts'
import { toBirthInput } from '../utils/birth-input.ts'
import { MAX_PROFILE_NAME_LENGTH } from '../utils/profiles.ts'

interface Props {
  /** 채워 둘 값. null이면 빈 폼으로 시작한다. */
  initial: SavedFormState | null
  initialName: string
  /** 저장된 프로필을 고치는 중이면 true: 이름이 필수이고 삭제할 수 있다. */
  saved: boolean
  /** 이름이 비어 있으면 저장하지 않고 계산만 한다. 실패하면 보여줄 오류 문구를 돌려준다. */
  onSubmit: (state: SavedFormState, name: string) => string | null
  onCancel?: () => void
  onDelete?: () => string | null
}

type Field = 'name' | 'date' | 'time' | 'gender' | 'place'

const MIN_YEAR = 1900
const currentYear = new Date().getFullYear()

function parseYear(text: string): number | null {
  if (!/^\d{4}$/.test(text)) return null
  const year = Number(text)
  return year >= MIN_YEAR && year <= currentYear ? year : null
}

function toNumberOrNull(value: string): number | null {
  return value === '' ? null : Number(value)
}

export default function BirthForm({ initial, initialName, saved, onSubmit, onCancel, onDelete }: Props) {
  const { t, locale } = useLocale()
  const id = useId()

  const [name, setName] = useState(initialName)
  const [yearText, setYearText] = useState(initial ? String(initial.year) : '')
  const [month, setMonth] = useState<number | null>(initial?.month ?? null)
  const [day, setDay] = useState<number | null>(initial?.day ?? null)
  const [hour, setHour] = useState<number | null>(initial && !initial.unknownTime ? initial.hour : null)
  const [minute, setMinute] = useState<number | null>(initial && !initial.unknownTime ? initial.minute : null)
  const [unknownTime, setUnknownTime] = useState(initial?.unknownTime ?? false)
  const [gender, setGender] = useState<Gender | null>(initial?.gender ?? null)
  const [jasiMethod, setJasiMethod] = useState<JasiMethod>(initial?.jasiMethod ?? 'unified')
  // 한국어 화면에서만 서울을 미리 골라 둔다. 다른 언어에서는 틀린 기본값이 되기 쉽다.
  const [city, setCity] = useState<City | null>(initial ? initial.city : locale === 'ko' ? SEOUL : null)
  const [manualCoords, setManualCoords] = useState(initial?.manualCoords ?? false)
  const [latitudeText, setLatitudeText] = useState(() => initial ? formatCoordinate(initial.latitude) : '')
  const [longitudeText, setLongitudeText] = useState(() => initial ? formatCoordinate(initial.longitude) : '')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(initial?.jasiMethod === 'split')

  const nameRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)
  const hourRef = useRef<HTMLSelectElement>(null)
  const genderRef = useRef<HTMLDivElement>(null)
  const placeRef = useRef<HTMLDivElement>(null)

  const year = parseYear(yearText)
  const daysInMonth = month ? new Date(year ?? 2000, month, 0).getDate() : 31
  const latitude = manualCoords ? parseCoordinateDraft(latitudeText) : city?.lat ?? null
  const longitude = manualCoords ? parseCoordinateDraft(longitudeText) : city?.lon ?? null
  const willSave = saved || name.trim() !== ''

  const monthNames = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' })
    return Array.from({ length: 12 }, (_, i) => format.format(new Date(Date.UTC(2000, i, 1))))
  }, [locale])

  const timezone = useMemo(
    () => latitude != null && longitude != null ? inferTimeZoneFromCoordinates(latitude, longitude) : null,
    [latitude, longitude],
  )
  const dateComplete = year != null && month != null && day != null
  const clockHour = unknownTime || hour == null ? 12 : hour
  const clockMinute = unknownTime || minute == null ? 0 : minute
  const timezoneLabel = !timezone ? null
    : !dateComplete ? timezone
    : getTimeZoneDisplayLabelAtLocalTime(timezone, year, month, day, clockHour, clockMinute) ?? timezone

  const isKDT = dateComplete && timezone === 'Asia/Seoul' && isKoreanDaylightTime(year, month, day)
  const isKstAnomaly = dateComplete && timezone === 'Asia/Seoul' && isKoreanHistoricalTimeAnomaly(year, month, day)
  const isDst = dateComplete && timezone != null && !isKDT && !isKstAnomaly
    && isDaylightSavingInEffect(timezone, year, month, day, clockHour, clockMinute)

  function clearError(field: Field) {
    setSubmitError(null)
    setErrors(current => {
      if (!(field in current)) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function changeMonth(next: number | null) {
    setMonth(next)
    if (next != null && day != null) {
      setDay(Math.min(day, new Date(year ?? 2000, next, 0).getDate()))
    }
    clearError('date')
  }

  function changeYear(text: string) {
    if (!/^\d{0,4}$/.test(text)) return
    setYearText(text)
    const nextYear = parseYear(text)
    if (nextYear != null && month != null && day != null) {
      setDay(Math.min(day, new Date(nextYear, month, 0).getDate()))
    }
    clearError('date')
  }

  function changeCoordinate(value: string, setText: (value: string) => void) {
    if (!isCoordinateDraft(value)) return
    setText(value)
    clearError('place')
  }

  function stepCoordinateWithArrow(
    e: React.KeyboardEvent<HTMLInputElement>,
    text: string,
    setText: (value: string) => void,
  ) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    const value = parseCoordinateDraft(text)
    if (value == null) return
    e.preventDefault()
    setText(formatCoordinate(stepCoordinate(value, e.key === 'ArrowUp' ? 1 : -1)))
    clearError('place')
  }

  function switchToManualCoords() {
    setManualCoords(true)
    if (city && latitudeText === '' && longitudeText === '') {
      setLatitudeText(formatCoordinate(city.lat))
      setLongitudeText(formatCoordinate(city.lon))
    }
    clearError('place')
  }

  function focusField(field: Field) {
    const target = {
      name: nameRef.current,
      date: yearRef.current,
      time: hourRef.current,
      gender: genderRef.current?.querySelector<HTMLElement>('[tabindex="0"]') ?? null,
      place: placeRef.current?.querySelector<HTMLElement>('input') ?? null,
    }[field]
    target?.focus()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found: Partial<Record<Field, string>> = {}

    if (saved && name.trim() === '') found.name = t('form.nameRequired')
    if (!dateComplete) {
      found.date = yearText !== '' && year == null
        ? t('form.yearRange').replace('{min}', String(MIN_YEAR)).replace('{max}', String(currentYear))
        : t('form.dateRequired')
    }
    if (!unknownTime && (hour == null || minute == null)) found.time = t('form.timeRequired')
    if (gender == null) found.gender = t('form.genderRequired')
    if (latitude == null || longitude == null) {
      found.place = manualCoords ? t('form.coordinateInvalid') : t('form.placeRequired')
    } else if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      found.place = t('form.coordinateInvalid')
    }

    let state: SavedFormState | null = null
    if (Object.keys(found).length === 0 && dateComplete && gender != null && latitude != null && longitude != null) {
      state = {
        year, month, day,
        hour: unknownTime ? 12 : hour ?? 12,
        minute: unknownTime ? 0 : minute ?? 0,
        gender, unknownTime, jasiMethod,
        city: manualCoords ? null : city,
        manualCoords, latitude, longitude,
      }
      const result = toBirthInput(state)
      if (!result.ok) {
        state = null
        if (result.reason === 'invalid-date') found.date = t('form.invalidDate')
        else if (result.reason === 'dst-gap') found.time = t('form.dstGapError')
        else found.place = t('form.timezoneAutoDetectFailed')
      }
    }

    setErrors(found)
    if (!state) {
      const order: Field[] = ['name', 'date', 'time', 'gender', 'place']
      const first = order.find(field => found[field])
      if (first) focusField(first)
      return
    }
    setSubmitError(onSubmit(state, name.trim()))
  }

  const nameError = errors.name
  const dateError = errors.date
  const timeError = errors.time
  const genderError = errors.gender
  const placeError = errors.place

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={e => { if (e.key === 'Escape' && !e.defaultPrevented && onCancel) onCancel() }}
      noValidate
      aria-labelledby={`${id}-title`}
      className="rounded-lg border border-line bg-surface p-5 sm:p-6"
    >
      <h2 id={`${id}-title`} className="text-lg font-semibold text-fg">
        {saved ? t('form.titleEdit') : t('form.title')}
      </h2>

      <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {/* 이름 */}
        <div>
          <label htmlFor={`${id}-name`} className={labelClass}>
            {t('form.name')}
            {!saved && <span className="ml-1.5 font-normal text-muted">{t('form.optional')}</span>}
          </label>
          <input
            ref={nameRef}
            id={`${id}-name`}
            type="text"
            value={name}
            maxLength={MAX_PROFILE_NAME_LENGTH}
            onChange={e => { setName(e.target.value); clearError('name') }}
            placeholder={t('profile.namePlaceholder')}
            autoComplete="off"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? `${id}-name-error` : saved ? undefined : `${id}-name-hint`}
            className={`${inputClass} mt-1.5`}
          />
          {nameError
            ? <p id={`${id}-name-error`} role="alert" className={errorClass}>{nameError}</p>
            : !saved && <p id={`${id}-name-hint`} className={`${hintClass} mt-1.5`}>{t('form.nameHint')}</p>}
        </div>

        {/* 성별 */}
        <div>
          <span id={`${id}-gender`} className={labelClass}>{t('form.gender')}</span>
          <div ref={genderRef} className="mt-1.5">
            <Segmented
              aria-labelledby={`${id}-gender`}
              value={gender}
              invalid={!!genderError}
              options={[
                { value: 'M', label: t('form.male') },
                { value: 'F', label: t('form.female') },
              ]}
              onChange={value => { setGender(value); clearError('gender') }}
            />
          </div>
          {genderError && <p role="alert" className={errorClass}>{genderError}</p>}
        </div>

        {/* 생년월일 */}
        <div role="group" aria-labelledby={`${id}-date`} className="min-w-0">
          <span id={`${id}-date`} className={labelClass}>{t('form.birthDate')}</span>
          <div className="mt-1.5 grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,5fr)] gap-2">
            <input
              ref={yearRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={yearText}
              onChange={e => changeYear(e.target.value)}
              placeholder={t('form.year')}
              aria-label={t('form.year')}
              aria-invalid={dateError ? true : undefined}
              className={`${inputClass} tabular-nums`}
            />
            <select
              value={month ?? ''}
              onChange={e => changeMonth(toNumberOrNull(e.target.value))}
              aria-label={t('form.month')}
              aria-invalid={dateError ? true : undefined}
              className={`${selectClass} ${month == null ? 'text-muted' : ''}`}
            >
              <option value="" disabled>{t('form.month')}</option>
              {monthNames.map((label, i) => (
                <option key={i + 1} value={i + 1}>{label}</option>
              ))}
            </select>
            <select
              value={day ?? ''}
              onChange={e => { setDay(toNumberOrNull(e.target.value)); clearError('date') }}
              aria-label={t('form.day')}
              aria-invalid={dateError ? true : undefined}
              className={`${selectClass} tabular-nums ${day == null ? 'text-muted' : ''}`}
            >
              <option value="" disabled>{t('form.day')}</option>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <option key={i + 1} value={i + 1}>{`${i + 1}${t('form.daySuffix')}`}</option>
              ))}
            </select>
          </div>
          {dateError && <p role="alert" className={errorClass}>{dateError}</p>}
        </div>

        {/* 태어난 시각 */}
        <div role="group" aria-labelledby={`${id}-time`} className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span id={`${id}-time`} className={labelClass}>{t('form.time')}</span>
            <label className="flex items-center gap-1.5 text-sm text-fg-2">
              <input
                type="checkbox"
                checked={unknownTime}
                onChange={e => { setUnknownTime(e.target.checked); clearError('time') }}
                className="h-4 w-4 accent-(--fg)"
              />
              {t('form.unknown')}
            </label>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <select
              ref={hourRef}
              value={unknownTime ? '' : hour ?? ''}
              onChange={e => { setHour(toNumberOrNull(e.target.value)); clearError('time') }}
              disabled={unknownTime}
              aria-label={t('form.hour')}
              aria-invalid={timeError ? true : undefined}
              className={`${selectClass} tabular-nums ${hour == null && !unknownTime ? 'text-muted' : ''}`}
            >
              <option value="" disabled>{t('form.hour')}</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{`${String(i).padStart(2, '0')}${t('form.hourSuffix')}`}</option>
              ))}
            </select>
            <select
              value={unknownTime ? '' : minute ?? ''}
              onChange={e => { setMinute(toNumberOrNull(e.target.value)); clearError('time') }}
              disabled={unknownTime}
              aria-label={t('form.minute')}
              aria-invalid={timeError ? true : undefined}
              className={`${selectClass} tabular-nums ${minute == null && !unknownTime ? 'text-muted' : ''}`}
            >
              <option value="" disabled>{t('form.minute')}</option>
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>{`${String(i).padStart(2, '0')}${t('form.minuteSuffix')}`}</option>
              ))}
            </select>
          </div>
          {timeError && <p role="alert" className={errorClass}>{timeError}</p>}
        </div>

        {/* 출생지 */}
        <div role="group" aria-labelledby={`${id}-place`} className="min-w-0 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <span id={`${id}-place`} className={labelClass}>{t('form.birthPlace')}</span>
            <button
              type="button"
              onClick={() => manualCoords ? (setManualCoords(false), clearError('place')) : switchToManualCoords()}
              className="text-sm text-fg-2 underline decoration-control underline-offset-4 hover:text-fg hover:decoration-fg"
            >
              {manualCoords ? t('form.citySearch') : t('form.coordInput')}
            </button>
          </div>
          <div ref={placeRef} className="mt-1.5">
            {manualCoords ? (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={latitudeText}
                  onChange={e => changeCoordinate(e.target.value, setLatitudeText)}
                  onKeyDown={e => stepCoordinateWithArrow(e, latitudeText, setLatitudeText)}
                  placeholder={t('form.latitude')}
                  aria-label={t('form.latitude')}
                  aria-invalid={placeError ? true : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  className={`${inputClass} tabular-nums`}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  value={longitudeText}
                  onChange={e => changeCoordinate(e.target.value, setLongitudeText)}
                  onKeyDown={e => stepCoordinateWithArrow(e, longitudeText, setLongitudeText)}
                  placeholder={t('form.longitude')}
                  aria-label={t('form.longitude')}
                  aria-invalid={placeError ? true : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            ) : (
              <CityCombobox
                selectedCity={city}
                invalid={!!placeError}
                onSelect={next => { setCity(next); clearError('place') }}
              />
            )}
          </div>
          {placeError && <p role="alert" className={errorClass}>{placeError}</p>}
          {timezoneLabel && (
            <p className={`${hintClass} mt-1.5`}>
              {t('form.timezoneDefault')} <span className="tabular-nums">{timezoneLabel}</span>
              {isDst && <> · {t('form.dstActive')}</>}
              {!manualCoords && latitude != null && longitude != null && (
                <span className="tabular-nums">
                  {' '}· {t('form.latitude')} {latitude.toFixed(4)} · {t('form.longitude')} {longitude.toFixed(4)}
                </span>
              )}
            </p>
          )}
          {isKDT && <Notice tone="warn" className="mt-2">{t('form.kdt')}</Notice>}
          {!isKDT && isKstAnomaly && <Notice tone="warn" className="mt-2">{t('form.kstHistoricalOffset')}</Notice>}
        </div>
      </div>

      {/* 고급 설정: 자시법은 출생 시각이 있을 때만 의미가 있다 */}
      {!unknownTime && (
        <details className="group mt-5" open={advancedOpen} onToggle={e => setAdvancedOpen(e.currentTarget.open)}>
          <summary className="inline-flex list-none items-center gap-1 rounded-sm text-sm text-fg-2 hover:text-fg [&::-webkit-details-marker]:hidden">
            <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {t('form.advanced')}
          </summary>
          <div className="mt-3">
            <span id={`${id}-jasi`} className={labelClass}>{t('form.jasiMethod')}</span>
            <Segmented
              aria-labelledby={`${id}-jasi`}
              className="mt-1.5"
              value={jasiMethod}
              options={[
                { value: 'unified', label: t('form.unified') },
                { value: 'split', label: t('form.split') },
              ]}
              onChange={setJasiMethod}
            />
            <p className={`${hintClass} mt-1.5`}>
              {jasiMethod === 'unified' ? t('form.unifiedDesc') : t('form.splitDesc')}
            </p>
          </div>
        </details>
      )}

      {submitError && <Notice tone="error" role="alert" className="mt-5">{submitError}</Notice>}

      {/* 동작 */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button type="submit" className={`${buttonClass('primary')} min-w-28 max-sm:flex-1`}>
          {willSave ? t('form.saveAndCalculate') : t('form.calculate')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonClass('ghost')}>
            {t('profile.cancel')}
          </button>
        )}
        {onDelete && (
          <div className="ml-auto flex items-center gap-2">
            {confirmingDelete ? (
              <>
                <span className="text-sm text-fg-2">{t('profile.deleteConfirm')}</span>
                <button
                  type="button"
                  onClick={() => { setSubmitError(onDelete()); setConfirmingDelete(false) }}
                  className={buttonClass('danger', 'sm')}
                >
                  {t('profile.deleteYes')}
                </button>
                <button type="button" onClick={() => setConfirmingDelete(false)} className={buttonClass('ghost', 'sm')}>
                  {t('profile.cancel')}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmingDelete(true)} className={buttonClass('danger', 'sm')}>
                {t('profile.delete')}
              </button>
            )}
          </div>
        )}
      </div>

      <p className={`${hintClass} mt-4 flex items-start gap-1.5`}>
        <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
        <span>{t('form.privacy1')} {t('form.privacy2')}</span>
      </p>
    </form>
  )
}
