import { useState } from 'react'
import type { BirthInput, Gender } from '../core/types.ts'
import logo from '../assets/icon-512.png'

interface Props {
  onSubmit: (input: BirthInput) => void
}

const now = new Date()
const currentYear = now.getFullYear()
const defaultYear = currentYear - 20

const selectClass =
  'w-full h-10 pl-3 pr-8 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white ' +
  'appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat ' +
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] " +
  'focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-400 ' +
  'transition-all disabled:opacity-40 disabled:bg-gray-50'


export default function BirthForm({ onSubmit }: Props) {
  const [year, setYear] = useState(defaultYear)
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [day, setDay] = useState(now.getDate())
  const [hour, setHour] = useState(now.getHours())
  const [minute, setMinute] = useState(now.getMinutes())
  const [gender, setGender] = useState<Gender>('M')
  const [unknownTime, setUnknownTime] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      year, month, day,
      hour: unknownTime ? 12 : hour,
      minute: unknownTime ? 0 : minute,
      gender,
      unknownTime,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex flex-col items-center md:flex-row md:items-start gap-5">
        {/* 로고 */}
        <img
          src={logo}
          alt="Orrery"
          className="w-80 max-w-full md:w-64 shrink-0"
        />

        {/* 폼 필드 전체 */}
        <div className="w-full min-w-0">
          {/* 생년월일 */}
          <fieldset>
            <legend className="text-xs font-medium text-gray-500 mb-2">생년월일</legend>
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

          {/* 시간 + 성별 */}
          <fieldset className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <legend className="text-xs font-medium text-gray-500">시간</legend>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unknownTime}
                  onChange={e => setUnknownTime(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-[18px] bg-gray-200 rounded-full peer-checked:bg-gray-800 relative transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-3.5" />
                <span className="text-xs text-gray-500">모름</span>
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
                <div className="inline-flex h-10 rounded-lg bg-gray-100 p-1">
                  {(['M', 'F'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`px-4 text-sm rounded-md transition-all ${
                        gender === g
                          ? 'bg-white text-gray-800 shadow-sm font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {g === 'M' ? '남' : '여'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* 계산 버튼 */}
          <button
            type="submit"
            className="mt-5 w-full h-11 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 active:scale-[0.98] transition-all"
          >
            계산
          </button>

          <p className="mt-3 text-center text-xs text-gray-400 leading-relaxed">
            🔒 모든 계산은 브라우저에서 처리되며,<br />
            입력하신 정보는 어떤 서버에도 전송되지 않습니다.
          </p>
        </div>
      </div>
    </form>
  )
}
