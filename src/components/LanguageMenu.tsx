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
    <div ref={containerRef} className="relative">
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
        className="inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-sm text-fg-2 transition-colors hover:bg-sunken hover:text-fg"
      >
        <span lang={current.code}>{current.name}</span>
        <svg className="h-4 w-4 text-faint" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
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
          className="absolute top-full right-0 z-20 mt-1 w-40 rounded-md border border-line bg-surface py-1 shadow-lg outline-none"
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
                className={`flex items-center gap-2 px-3 py-2 text-sm select-none ${highlighted ? 'bg-sunken' : ''} ${
                  selected ? 'font-medium text-fg' : 'text-fg-2'
                }`}
              >
                <svg className={`h-4 w-4 ${selected ? '' : 'invisible'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                </svg>
                <span lang={l.code}>{l.name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
