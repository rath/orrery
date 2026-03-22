import { useState, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react'
import type { BirthInput, Gender, JasiMethod } from '@orrery/core/types'
import { isKoreanDaylightTime } from '@orrery/core/natal'
import type { City } from '@orrery/core/cities'
import { SEOUL } from '@orrery/core/cities'
import CityCombobox from './CityCombobox.tsx'
import logo from '../assets/icon-512.png'

export interface BirthFormHandle {
  getCurrentState(): SavedFormState
}

interface Props {
  onSubmit: (input: BirthInput) => void
  externalState?: SavedFormState | null
  onExternalStateConsumed?: () => void
}

const STORAGE_KEY = 'orrery-birth-input'

export interface SavedFormState {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: Gender
  unknownTime: boolean
  jasiMethod: JasiMethod
  city: City | null
  manualCoords: boolean
  latitude: number
  longitude: number
}

function loadSaved(): SavedFormState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SavedFormState
  } catch {
    return null
  }
}

const now = new Date()
const currentYear = now.getFullYear()
const saved = loadSaved()

const selectClass =
  'w-full h-10 pl-3 pr-8 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 ' +
  'appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat ' +
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] " +
  'focus:outline-none focus:ring-2 focus:ring-gray-800/20 dark:focus:ring-gray-200/20 focus:border-gray-400 dark:focus:border-gray-500 ' +
  'transition-all disabled:opacity-40 disabled:bg-gray-50 dark:disabled:bg-gray-800'


const BirthForm = forwardRef<BirthFormHandle, Props>(function BirthForm({ onSubmit, externalState, onExternalStateConsumed }, ref) {
  const [year, setYear] = useState(saved?.year ?? currentYear - 20)
  const [month, setMonth] = useState(saved?.month ?? now.getMonth() + 1)
  const [day, setDay] = useState(saved?.day ?? now.getDate())
  const [hour, setHour] = useState(saved?.hour ?? now.getHours())
  const [minute, setMinute] = useState(saved?.minute ?? now.getMinutes())
  const [gender, setGender] = useState<Gender>(saved?.gender ?? 'M')
  const [unknownTime, setUnknownTime] = useState(saved?.unknownTime ?? false)
  const [jasiMethod, setJasiMethod] = useState<JasiMethod>(saved?.jasiMethod ?? 'unified')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedCity, setSelectedCity] = useState<City | null>(saved?.city ?? SEOUL)
  const [manualCoords, setManualCoords] = useState(saved?.manualCoords ?? false)
  const [latitude, setLatitude] = useState(saved?.latitude ?? SEOUL.lat)
  const [longitude, setLongitude] = useState(saved?.longitude ?? SEOUL.lon)

  useImperativeHandle(ref, () => ({
    getCurrentState: (): SavedFormState => ({
      year, month, day, hour, minute, gender, unknownTime, jasiMethod,
      city: selectedCity, manualCoords, latitude, longitude,
    }),
  }))

  useEffect(() => {
    if (!externalState) return
    const s = externalState
    setYear(s.year)
    setMonth(s.month)
    setDay(s.day)
    setHour(s.hour)
    setMinute(s.minute)
    setGender(s.gender)
    setUnknownTime(s.unknownTime)
    setJasiMethod(s.jasiMethod)
    setSelectedCity(s.city)
    setManualCoords(s.manualCoords)
    setLatitude(s.latitude)
    setLongitude(s.longitude)
    onExternalStateConsumed?.()
    // 프로필 선택 시 자동 계산
    onSubmit({
      year: s.year, month: s.month, day: s.day,
      hour: s.unknownTime ? 12 : s.hour,
      minute: s.unknownTime ? 0 : s.minute,
      gender: s.gender,
      unknownTime: s.unknownTime,
      ...(!s.unknownTime && { jasiMethod: s.jasiMethod }),
      latitude: s.latitude,
      longitude: s.longitude,
    })
  }, [externalState]) // eslint-disable-line react-hooks/exhaustive-deps

  const isKDT = useMemo(() => isKoreanDaylightTime(year, month, day), [year, month, day])

  function handleCitySelect(city: City) {
    setSelectedCity(city)
    setLatitude(city.lat)
    setLongitude(city.lon)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const state: SavedFormState = {
      year, month, day, hour, minute, gender, unknownTime, jasiMethod,
      city: selectedCity, manualCoords, latitude, longitude,
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* quota exceeded — ignore */ }
    onSubmit({
      year, month, day,
      hour: unknownTime ? 12 : hour,
      minute: unknownTime ? 0 : minute,
      gender,
      unknownTime,
      ...(!unknownTime && { jasiMethod }),
      latitude,
      longitude,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm dark:shadow-none">
      <div className="flex flex-col items-center md:flex-row md:items-start gap-5">
        {/* 로고 */}
        <div className="flex flex-col items-center shrink-0">
          <img
            src={logo}
            alt="혼천의"
            className="w-48 md:w-64"
          />
          <span className="text-base text-gray-400 dark:text-gray-500 font-hanja -mt-1">혼천의(渾天儀)</span>
        </div>

        {/* 폼 필드 전체 */}
        <div className="w-full min-w-0">
          {/* 생년월일 */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">생년월일 (양력)</legend>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
                  const y = currentYear - i
                  return <option key={y} value={y}>{y}년</option>
                })}
              </select>
              <select
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}월</option>
                ))}
              </select>
              <select
                value={day}
                onChange={e => setDay(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}일</option>
                ))}
              </select>
            </div>
          </fieldset>

          {isKDT && (
            <div className="mt-2 px-3 py-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              88올림픽 하계표준시(KDT, UTC+10) 적용 기간입니다. 모든 계산에 자동 반영됩니다.
            </div>
          )}

          {/* 시간 + 성별 */}
          <fieldset className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <legend className="text-sm font-medium text-gray-500 dark:text-gray-400">시간</legend>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unknownTime}
                  onChange={e => setUnknownTime(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-[18px] bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-gray-800 dark:peer-checked:bg-gray-200 relative transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-3.5" />
                <span className="text-sm text-gray-500 dark:text-gray-400">모름</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <select
                value={hour}
                onChange={e => setHour(Number(e.target.value))}
                disabled={unknownTime}
                className={selectClass}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}시</option>
                ))}
              </select>
              <select
                value={minute}
                onChange={e => setMinute(Number(e.target.value))}
                disabled={unknownTime}
                className={selectClass}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}분</option>
                ))}
              </select>

              {/* 성별 — segmented control */}
              <div>
                <div className="inline-flex h-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  {(['M', 'F'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`px-4 text-base rounded-md transition-all ${
                        gender === g
                          ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      {g === 'M' ? '남' : '여'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* 위치 (Natal Chart용) */}
          <fieldset className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <legend className="text-sm font-medium text-gray-500 dark:text-gray-400">출생 위치 (Natal Chart)</legend>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualCoords}
                  onChange={e => {
                    setManualCoords(e.target.checked)
                    if (!e.target.checked && selectedCity) {
                      setLatitude(selectedCity.lat)
                      setLongitude(selectedCity.lon)
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-8 h-[18px] bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-gray-800 dark:peer-checked:bg-gray-200 relative transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-3.5" />
                <span className="text-sm text-gray-500 dark:text-gray-400">직접 입력</span>
              </label>
            </div>
            {manualCoords ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">위도</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={e => setLatitude(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800/20 dark:focus:ring-gray-200/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">경도</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={e => setLongitude(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800/20 dark:focus:ring-gray-200/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>
              </div>
            ) : (
              <CityCombobox selectedCity={selectedCity} onSelect={handleCitySelect} />
            )}
          </fieldset>

          {/* 고급 설정 */}
          {!unknownTime && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                고급 설정
              </button>
              {showAdvanced && (
                <fieldset className="mt-2">
                  <legend className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">자시법 (子時法)</legend>
                  <div className="inline-flex h-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                    {([
                      { value: 'unified' as const, label: '통자시' },
                      { value: 'split' as const, label: '야자시' },
                    ]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setJasiMethod(opt.value)}
                        className={`px-4 text-base rounded-md transition-all ${
                          jasiMethod === opt.value
                            ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                    {jasiMethod === 'unified'
                      ? '23:30부터 子시, 일주를 다음날로 넘깁니다.'
                      : '23:30~00:00(야자시)은 子시이나, 일주는 당일 유지합니다.'}
                  </p>
                </fieldset>
              )}
            </div>
          )}

          {/* 계산 버튼 */}
          <button
            type="submit"
            className="mt-5 w-full h-11 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-base font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 active:scale-[0.98] transition-all"
          >
            계산
          </button>

          <p className="mt-3 text-center text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
            🔒 모든 계산은 브라우저에서 처리되며,<br />
            입력하신 정보는 어떤 서버에도 전송되지 않습니다.
          </p>
        </div>
      </div>
    </form>
  )
})

export default BirthForm
