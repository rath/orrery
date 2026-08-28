import { useSyncExternalStore } from 'react'
import { localeStore, LOCALES, DEFAULT_LOCALE } from './store.ts'
import type { Locale } from './store.ts'
import ko from './locales/ko.ts'
import zh from './locales/zh.ts'
import ja from './locales/ja.ts'
import en from './locales/en.ts'
import de from './locales/de.ts'
import es from './locales/es.ts'

export type { Locale }
export { LOCALES, DEFAULT_LOCALE }

export const messages: Record<Locale, Record<string, string>> = { ko, zh, ja, en, de, es }

function lookup(locale: Locale, key: string): string {
  return messages[locale][key] ?? messages[DEFAULT_LOCALE][key] ?? key
}

export function useLocale() {
  const locale = useSyncExternalStore(localeStore.subscribe, localeStore.getSnapshot)
  return {
    locale,
    setLocale: localeStore.setLocale,
    t: (key: string) => lookup(locale, key),
  }
}

/** Non-hook version for use outside React components (e.g., text-export) */
export function t(locale: Locale, key: string): string {
  return lookup(locale, key)
}

export function getLocale(): Locale {
  return localeStore.getSnapshot()
}
