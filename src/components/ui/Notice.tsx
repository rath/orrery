interface Props {
  tone: 'warn' | 'error'
  title?: string
  children: React.ReactNode
  className?: string
  role?: 'alert' | 'status'
}

const TONE = {
  warn: 'bg-tone-amber-soft text-tone-amber',
  error: 'bg-tone-red-soft text-tone-red',
} as const

/** 계산 결과를 읽을 때 알아야 할 주의 사항이나 오류 */
export default function Notice({ tone, title, children, className = '', role }: Props) {
  return (
    <div role={role} className={`rounded-md px-3.5 py-2.5 text-sm leading-relaxed ${TONE[tone]} ${className}`}>
      {title && <p className="font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  )
}
