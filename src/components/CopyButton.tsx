import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n/index.ts'
import { buttonClass } from './ui/classes.ts'
import type { ButtonSize, ButtonVariant } from './ui/classes.ts'

interface Props {
  getText: () => string | Promise<string>
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

export default function CopyButton({ getText, label, variant = 'secondary', size = 'sm', className = '' }: Props) {
  const { t } = useLocale()
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  const busy = useRef(false)
  const mounted = useRef(true)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
    }
  }, [])

  async function handleClick() {
    if (busy.current) return
    busy.current = true
    clearTimeout(timer.current)
    setStatus('copying')
    try {
      const text = await getText()
      if (!mounted.current) return
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        if (!mounted.current) return
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        const focused = document.activeElement
        document.body.appendChild(textarea)
        try {
          textarea.select()
          if (!document.execCommand('copy')) throw new Error('Copy failed')
        } finally {
          textarea.remove()
          if (focused instanceof HTMLElement) focused.focus({ preventScroll: true })
        }
      }
      if (mounted.current) setStatus('copied')
    } catch {
      if (mounted.current) setStatus('error')
    } finally {
      busy.current = false
      if (mounted.current) timer.current = setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const idleLabel = label ?? t('copy.copy')
  // 세 문구를 같은 칸에 겹쳐 두어, 가장 긴 문구에 맞춘 폭이 유지되게 한다.
  const faces = [
    ['idle', idleLabel],
    ['copied', t('copy.copied')],
    ['error', t('copy.failed')],
  ] as const
  const shown = status === 'copied' || status === 'error' ? status : 'idle'
  const shownText = faces.find(([face]) => face === shown)![1]

  return (
    <>
      <button
        onClick={handleClick}
        type="button"
        disabled={status === 'copying'}
        aria-busy={status === 'copying'}
        aria-label={shownText}
        className={`${buttonClass(variant, size)} ${className}`}
      >
        <span className="grid justify-items-center" aria-hidden="true">
          {faces.map(([face, text]) => (
            <span key={face} className={`col-start-1 row-start-1 ${face === shown ? '' : 'invisible'}`}>
              {text}
            </span>
          ))}
        </span>
      </button>
      {/* 복사 결과는 화면 낭독기에도 알린다 */}
      <span role="status" className="sr-only">{shown === 'idle' ? '' : shownText}</span>
    </>
  )
}
