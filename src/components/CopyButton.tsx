import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n/index.ts'

interface Props {
  getText: () => string | Promise<string>
  label?: React.ReactNode
}

export default function CopyButton({ getText, label }: Props) {
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

  return (
    <button
      onClick={handleClick}
      type="button"
      disabled={status === 'copying'}
      aria-live="polite"
      aria-busy={status === 'copying'}
      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 whitespace-nowrap"
    >
      {status === 'copied' ? t('copy.copied') : status === 'error' ? t('copy.failed') : (label ?? t('copy.copy'))}
    </button>
  )
}
