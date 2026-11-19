import { useRef } from 'react'

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  /** 선택한 값. null이면 아직 고르지 않은 상태다. */
  value: T | null
  options: readonly Option<T>[]
  onChange: (value: T) => void
  'aria-labelledby'?: string
  'aria-label'?: string
  invalid?: boolean
  size?: 'md' | 'sm'
  className?: string
}

/** 둘 중 하나를 고르는 이어 붙인 버튼. 라디오 그룹으로 동작한다 (방향키로 이동). */
export default function Segmented<T extends string>({
  value, options, onChange, invalid, size = 'md', className = '', ...aria
}: Props<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedIndex = options.findIndex(o => o.value === value)

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (step === 0) return
    e.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-invalid={invalid || undefined}
      {...aria}
      className={`inline-flex ${size === 'sm' ? 'h-8' : 'h-10'} overflow-hidden rounded-md border ${invalid ? 'border-tone-red' : 'border-control'} ${className}`}
    >
      {options.map((option, i) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={el => { refs.current[i] = el }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex === -1 && i === 0) ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={e => handleKeyDown(e, i)}
            className={`flex-1 whitespace-nowrap ${size === 'sm' ? 'px-3 text-sm' : 'min-w-14 px-4 text-base'} transition-colors focus-visible:outline-offset-[-2px] ${
              i > 0 ? 'border-l border-control' : ''
            } ${
              selected
                ? 'bg-inverse font-medium text-inverse-fg'
                : 'bg-surface text-fg-2 hover:bg-sunken hover:text-fg'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
