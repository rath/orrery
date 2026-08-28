/** Single source of truth for supported locales (order = display order in the language menu). */
export const LOCALES = [
  { code: 'ko', short: '한', name: '한국어' },
  { code: 'zh', short: '中', name: '中文' },
  { code: 'ja', short: '日', name: '日本語' },
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'de', short: 'DE', name: 'Deutsch' },
  { code: 'es', short: 'ES', name: 'Español' },
] as const

export type Locale = (typeof LOCALES)[number]['code']

export const DEFAULT_LOCALE: Locale = 'en'

const STORAGE_KEY = 'orrery-locale'
const VALID = new Set<string>(LOCALES.map(l => l.code))

function isLocale(v: string | null | undefined): v is Locale {
  return v != null && VALID.has(v)
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const lang of candidates) {
    if (typeof lang !== 'string') continue
    const code = lang.split('-')[0].toLowerCase()
    if (isLocale(code)) return code
  }
  return DEFAULT_LOCALE
}

function readStored(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStored(locale: Locale): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Storage unavailable (private mode, quota, disabled) — the in-memory value still applies.
  }
}

function applyDocumentLang(locale: Locale): void {
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

function getInitial(): Locale {
  const stored = readStored()
  return isLocale(stored) ? stored : detectBrowserLocale()
}

let currentLocale: Locale = getInitial()
applyDocumentLang(currentLocale)

const listeners = new Set<() => void>()

export const localeStore = {
  getSnapshot: (): Locale => currentLocale,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
  setLocale: (locale: Locale) => {
    if (locale === currentLocale) return
    currentLocale = locale
    writeStored(locale)
    applyDocumentLang(locale)
    listeners.forEach(l => l())
  },
}
