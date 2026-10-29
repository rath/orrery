import { useState, useEffect, useRef, useMemo } from 'react'
import type { SavedFormState } from './BirthForm.tsx'
import { loadProfiles, addProfile, updateProfile, deleteProfile, exportProfiles, importProfiles, MAX_PROFILE_FILE_BYTES, MAX_PROFILE_NAME_LENGTH } from '../utils/profiles.ts'
import type { Profile } from '../utils/profiles.ts'
import { toHangul } from '@orrery/core/pillars'
import { calculateSaju } from '@orrery/core/saju'
import { useLocale } from '../i18n/index.ts'
import { inferTimeZoneFromCoordinates } from '../utils/timezones.ts'

interface Props {
  onClose: () => void
  getCurrentFormState: () => SavedFormState | null
  onSelect: (data: SavedFormState) => void
}

function formatSummary(data: SavedFormState, t: (key: string) => string): string {
  const date = `${data.year}-${String(data.month).padStart(2, '0')}-${String(data.day).padStart(2, '0')}`
  const time = data.unknownTime
    ? t('profile.timeUnknown')
    : `${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`
  const gender = data.gender === 'M' ? t('profile.male') : t('profile.female')
  const city = data.city?.name ?? t('profile.manualInput')
  const effectiveTimezone = inferTimeZoneFromCoordinates(data.latitude, data.longitude) ?? ''
  const timezone = effectiveTimezone
    ? ` ${effectiveTimezone}`
    : ''
  try {
    const saju = calculateSaju({
      year: data.year,
      month: data.month,
      day: data.day,
      hour: data.hour,
      minute: data.minute,
      gender: data.gender,
      unknownTime: data.unknownTime,
      jasiMethod: data.jasiMethod,
      latitude: data.latitude,
      longitude: data.longitude,
      ...(effectiveTimezone ? { timezone: effectiveTimezone } : {}),
    })
    const dp = saju.pillars[1].pillar.ganzi
    const ilju = toHangul(dp[0]) + toHangul(dp[1]) + t('profile.ilju')
    return `${date} ${time} ${gender} ${city}${timezone} ${ilju}`
  } catch {
    return `${date} ${time} ${gender} ${city}${timezone}`
  }
}

export default function ProfileModal({ onClose, getCurrentFormState, onSelect }: Props) {
  const { t } = useLocale()
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles)
  const [savingNew, setSavingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const newNameInputRef = useRef<HTMLInputElement>(null)
  const editNameInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentState] = useState(getCurrentFormState)
  const currentSummary = useMemo(() => currentState ? formatSummary(currentState, t) : '', [currentState, t])
  const summaries = useMemo(() => new Map(profiles.map(profile => [profile.id, formatSummary(profile.data, t)])), [profiles, t])

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  useEffect(() => {
    if (savingNew) newNameInputRef.current?.focus()
  }, [savingNew])

  useEffect(() => {
    if (editingId) editNameInputRef.current?.focus()
  }, [editingId])

  // 삭제 확인 3초 후 자동 리셋
  useEffect(() => {
    if (!confirmDeleteId) return
    const timer = setTimeout(() => setConfirmDeleteId(null), 3000)
    return () => clearTimeout(timer)
  }, [confirmDeleteId])

  function refresh() {
    setProfiles(loadProfiles())
  }

  function handleSaveNew() {
    const trimmed = newName.trim()
    if (!trimmed) return
    const state = getCurrentFormState()
    if (!state) return
    try {
      addProfile(trimmed, state)
      setSavingNew(false)
      setNewName('')
      setError(null)
      refresh()
    } catch {
      setError(t('profile.storageError'))
    }
  }

  function handleRename(id: string) {
    const trimmed = editName.trim()
    if (!trimmed) {
      setEditingId(null)
      return
    }
    try {
      updateProfile(id, { name: trimmed })
      setEditingId(null)
      setError(null)
      refresh()
    } catch {
      setError(t('profile.storageError'))
    }
  }

  function handleDelete(id: string) {
    if (confirmDeleteId === id) {
      try {
        deleteProfile(id)
        setConfirmDeleteId(null)
        setError(null)
        refresh()
      } catch {
        setError(t('profile.storageError'))
      }
    } else {
      setConfirmDeleteId(id)
    }
  }

  function handleSelect(data: SavedFormState) {
    onSelect(data)
    onClose()
  }

  function handleExport() {
    const json = exportProfiles()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orrery-profiles.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_PROFILE_FILE_BYTES) {
      setError(t('profile.importError'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => setError(t('profile.importError'))
    reader.onload = () => {
      try {
        const added = importProfiles(reader.result as string)
        setError(null)
        if (added > 0) {
          refresh()
        }
      } catch {
        setError(t('profile.importError'))
      }
    }
    reader.readAsText(file)
  }

  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    // 백드롭 클릭 시 닫기
    if (e.target === dialogRef.current) onClose()
  }

  const inputClass =
    'h-9 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-100 ' +
    'bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800/20 dark:focus:ring-gray-200/20 ' +
    'focus:border-gray-400 dark:focus:border-gray-500 transition-all'

  const btnPrimary =
    'px-2.5 py-1 text-sm rounded-md border transition-colors border-gray-800 dark:border-gray-200 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300'
  const btnSecondary =
    'px-2.5 py-1 text-sm rounded-md border transition-colors border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={onClose}
      className="m-auto rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 shadow-xl dark:shadow-none w-[min(28rem,calc(100vw-2rem))] overflow-hidden"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">{t('profile.title')}</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label={t('profile.close')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 설명 + 내보내기/가져오기 */}
      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mb-4">
        {t('profile.desc')}
        <button type="button" onClick={handleExport} disabled={profiles.length === 0} className="underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40 disabled:no-underline transition-colors">{t('profile.export')}</button>
        /
        <button type="button" onClick={() => fileInputRef.current?.click()} className="underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">{t('profile.import')}</button>
        {t('profile.backupSuffix')}
      </p>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

      {/* 새 프로필 저장 */}
      {savingNew ? (
        <form
          onSubmit={e => { e.preventDefault(); handleSaveNew() }}
          className="flex gap-2 mb-4"
        >
          <input
            ref={newNameInputRef}
            maxLength={MAX_PROFILE_NAME_LENGTH}
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={t('profile.namePlaceholder')}
            className={inputClass + ' flex-1'}
          />
          <button type="submit" disabled={!newName.trim()} className={btnPrimary + ' disabled:opacity-40'}>
            {t('profile.save')}
          </button>
          <button type="button" onClick={() => setSavingNew(false)} className={btnSecondary}>
            {t('profile.cancel')}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setSavingNew(true)}
          className="w-full mb-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <span>{t('profile.addNew')}</span>
          <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {currentSummary}
          </span>
        </button>
      )}

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 프로필 목록 */}
      <div className="max-h-[60vh] overflow-y-auto">
        {profiles.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">
            {t('profile.empty')}
          </p>
        ) : (
          <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
            {profiles.map(profile => (
              <div
                key={profile.id}
                onClick={() => editingId !== profile.id && handleSelect(profile.data)}
                className="py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                {/* 별칭 + 액션 */}
                {editingId === profile.id ? (
                  <form
                    onSubmit={e => { e.preventDefault(); handleRename(profile.id) }}
                    onClick={e => e.stopPropagation()}
                    className="flex gap-2"
                  >
                    <input
                      ref={editNameInputRef}
                      maxLength={MAX_PROFILE_NAME_LENGTH}
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleRename(profile.id)}
                      onKeyDown={e => { if (e.key === 'Escape') { setEditingId(null) } }}
                      className={inputClass + ' flex-1 h-7 text-sm'}
                    />
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {profile.name}
                    </span>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => { setEditingId(profile.id); setEditName(profile.name) }}
                        className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                        title={t('profile.editName')}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(profile.id)}
                        className={confirmDeleteId === profile.id
                          ? 'px-1.5 py-0.5 text-xs rounded border border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 transition-colors'
                          : 'p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors'}
                      >
                        {confirmDeleteId === profile.id ? t('profile.confirmDelete') : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 요약 */}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {summaries.get(profile.id)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </dialog>
  )
}
