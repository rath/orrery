import { useEffect, useRef, useState } from 'react'
import { useLocale, LOCALES, DEFAULT_LOCALE } from '../i18n/index.ts'
import type { Locale } from '../i18n/index.ts'

const LISTBOX_ID = 'lang-listbox'
const optionId = (code: Locale) => `lang-option-${code}`

export default function LanguageMenu() {
  const { locale, setLocale, t } = useLocale()
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const currentIndex = Math.max(0, LOCALES.findIndex(l => l.code === locale))
  const current = LOCALES[currentIndex] ?? LOCALES.find(l => l.code === DEFAULT_LOCALE)!
  const label = t('lang.select')

  function openMenu() {
    setHighlight(currentIndex)
    setOpen(true)
  }

  function closeMenu(restoreFocus: boolean) {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  function choose(code: Locale) {
    setLocale(code)
    closeMenu(true)
  }

  // Focus the listbox once it has been rendered.
  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  // Close on pointer interaction outside the menu.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu()
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlight(i => (i + 1) % LOCALES.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlight(i => (i - 1 + LOCALES.length) % LOCALES.length)
        break
      case 'Home':
        e.preventDefault()
        setHighlight(0)
        break
      case 'End':
        e.preventDefault()
        setHighlight(LOCALES.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        choose(LOCALES[highlight].code)
        break
      case 'Escape':
        e.preventDefault()
        closeMenu(true)
        break
      case 'Tab':
        closeMenu(false)
        break
    }
  }

  return (
    <div ref={containerRef} className="fixed top-14 left-3 z-50">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? LISTBOX_ID : undefined}
        aria-label={label}
        title={label}
        className="w-8 h-8 rounded-full
          flex items-center justify-center
          bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
          border border-gray-200 dark:border-gray-700
          text-gray-600 dark:text-gray-300
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors text-xs font-medium"
      >
        {current.short}
      </button>

      {open && (
        <ul
          ref={listRef}
          id={LISTBOX_ID}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={optionId(LOCALES[highlight].code)}
          onKeyDown={handleListKeyDown}
          className="absolute top-full left-0 mt-1 w-36 py-1 outline-none
            rounded-lg border shadow-lg
            bg-white dark:bg-gray-800
            border-gray-200 dark:border-gray-700"
        >
          {LOCALES.map((l, i) => {
            const selected = l.code === locale
            const highlighted = i === highlight
            return (
              <li
                key={l.code}
                id={optionId(l.code)}
                role="option"
                aria-selected={selected}
                onClick={() => choose(l.code)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer select-none
                  ${highlighted ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  ${selected ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <span className="w-3 text-center text-xs" aria-hidden="true">{selected ? '✓' : ''}</span>
                <span lang={l.code}>{l.name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
