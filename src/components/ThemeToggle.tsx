import { useState, useEffect, useCallback } from 'react'
import { useLocale } from '../i18n/index.ts'

type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'orrery-theme'

function getStored(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch { /* Storage can be disabled by browser policy. */ }
  return 'system'
}

function applyTheme(pref: ThemePreference) {
  const isDark =
    pref === 'dark' ||
    (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  document.documentElement.classList.toggle('dark', isDark)
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? '#0f172a' : '#f9fafb')
}

export default function ThemeToggle() {
  const { t } = useLocale()
  const [pref, setPref] = useState<ThemePreference>(getStored)

  const apply = useCallback(() => applyTheme(pref), [pref])

  useEffect(() => {
    apply()

    if (pref !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [pref, apply])

  function cycle() {
    const next: ThemePreference =
      pref === 'system' ? 'light' : pref === 'light' ? 'dark' : 'system'
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, next)
    } catch { /* Keep the in-memory preference when persistence is unavailable. */ }
    setPref(next)
  }

  const titles: Record<ThemePreference, string> = {
    system: t('theme.system'),
    light: t('theme.light'),
    dark: t('theme.dark'),
  }

  return (
    <button
      onClick={cycle}
      className="fixed top-3 left-3 z-50 p-2 rounded-full
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
        border border-gray-200 dark:border-gray-700
        text-gray-600 dark:text-gray-300
        hover:bg-gray-100 dark:hover:bg-gray-700
        transition-colors"
      aria-label={titles[pref]}
      title={titles[pref]}
    >
      {pref === 'system' && (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      )}
      {pref === 'light' && (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
      {pref === 'dark' && (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  )
}
