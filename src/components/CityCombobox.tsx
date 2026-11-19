import { useState, useRef, useEffect, useCallback } from 'react'
import type { City } from '@orrery/core/cities'
import { KOREAN_CITIES, filterCities, formatCityName } from '@orrery/core/cities'
import { useLocale } from '../i18n/index.ts'
import { inputClass } from './ui/classes.ts'

interface Props {
  selectedCity: City | null
  onSelect: (city: City) => void
  invalid?: boolean
}

/** 포커스 시 보여줄 기본 도시 목록 (한국 주요 도시) */
const DEFAULT_CITIES = KOREAN_CITIES.slice(0, 8) as City[]

export default function CityCombobox({ selectedCity, onSelect, invalid }: Props) {
  const { t } = useLocale()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = query ? filterCities(query) : DEFAULT_CITIES
  const koreanResults = results.filter(c => !c.country)
  const worldResults = results.filter(c => !!c.country)
  const flatResults = results // 이미 한국 우선 정렬됨

  // 하이라이트된 항목이 보이도록 스크롤
  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll('[role="option"]')
    items[highlightIndex]?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex])

  const close = useCallback(() => {
    setIsOpen(false)
    setHighlightIndex(-1)
    setQuery('')
  }, [])

  function handleFocus() {
    setIsOpen(true)
    setQuery('')
    setHighlightIndex(-1)
  }

  function handleInput(value: string) {
    setQuery(value)
    setIsOpen(true)
    setHighlightIndex(-1)
  }

  function selectCity(city: City) {
    onSelect(city)
    close()
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex(i => flatResults.length ? (i + 1) % flatResults.length : -1)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex(i => flatResults.length ? (i - 1 + flatResults.length) % flatResults.length : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && highlightIndex < flatResults.length) {
          selectCity(flatResults[highlightIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        close()
        inputRef.current?.blur()
        break
    }
  }

  // mousedown + preventDefault로 블러-클릭 경쟁 해결
  function handleOptionMouseDown(e: React.MouseEvent, city: City) {
    e.preventDefault()
    selectCity(city)
  }

  function handleBlur(e: React.FocusEvent) {
    // 컨테이너 내부로 포커스가 이동하면 무시
    if (containerRef.current?.contains(e.relatedTarget as Node)) return
    close()
  }

  const listboxId = 'city-listbox'

  /** 구분선이 있는 섹션별 렌더링 */
  function renderOptions() {
    if (flatResults.length === 0) {
      return (
        <li className="px-3 py-2 text-center text-base text-muted">
          {t('city.noResults')}
        </li>
      )
    }

    const items: React.ReactNode[] = []
    let optionIndex = 0

    if (koreanResults.length > 0) {
      items.push(
        <li key="header-kr" className="px-3 pt-1.5 pb-1 text-sm font-medium text-muted" role="presentation">
          {t('city.korea')}
        </li>
      )
      for (const city of koreanResults) {
        const idx = optionIndex++
        items.push(renderOption(city, idx))
      }
    }

    if (worldResults.length > 0) {
      if (koreanResults.length > 0) {
        items.push(
          <li key="divider" className="my-1 border-t border-line" role="presentation" />
        )
      }
      items.push(
        <li key="header-world" className="px-3 pt-1.5 pb-1 text-sm font-medium text-muted" role="presentation">
          {t('city.world')}
        </li>
      )
      for (const city of worldResults) {
        const idx = optionIndex++
        items.push(renderOption(city, idx))
      }
    }

    return items
  }

  function renderOption(city: City, index: number) {
    const isHighlighted = index === highlightIndex
    const label = formatCityName(city)
    return (
      <li
        key={`${city.name}-${city.country ?? city.region ?? 'kr'}`}
        id={`city-option-${index}`}
        role="option"
        aria-selected={isHighlighted}
        className={`px-3 py-2 text-base ${isHighlighted ? 'bg-sunken text-fg' : 'text-fg-2'}`}
        onMouseDown={e => handleOptionMouseDown(e, city)}
        onMouseEnter={() => setHighlightIndex(index)}
      >
        {label}
      </li>
    )
  }

  const displayValue = isOpen ? query : (selectedCity ? formatCityName(selectedCity) : '')

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={highlightIndex >= 0 ? `city-option-${highlightIndex}` : undefined}
        autoComplete="off"
        aria-label={t('form.birthPlace')}
        aria-invalid={invalid || undefined}
        className={`${inputClass} pr-9`}
        placeholder={t('city.placeholder')}
        value={displayValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={e => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {/* 드롭다운 아이콘 */}
      <svg
        className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-faint"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line bg-surface py-1 shadow-lg"
        >
          {renderOptions()}
        </ul>
      )}
    </div>
  )
}
