import { useState } from 'react'

interface Props {
  getText: () => string
  label?: string
}

export default function CopyButton({ getText, label = '복사' }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = getText()
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors text-gray-600"
    >
      {copied ? '복사됨 ✓' : label}
    </button>
  )
}
