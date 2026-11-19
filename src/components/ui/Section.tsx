interface Props {
  /** 한자 전문용어 제목은 번역하지 않는다 */
  title: React.ReactNode
  /** 제목 옆에 붙는 조작 요소 (선택 상자 등) */
  controls?: React.ReactNode
  /** 오른쪽 끝에 놓는 동작 (복사 버튼 등) */
  action?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  /** 탭의 첫 구획은 h2, 그 아래 구획은 h3 */
  level?: 2 | 3
  hanja?: boolean
}

/** 결과 화면의 한 구획. 상자 대신 위쪽 구분선과 여백으로 나눈다. */
export default function Section({ title, controls, action, description, children, level = 3, hanja }: Props) {
  const Heading = level === 2 ? 'h2' : 'h3'
  return (
    <section className="border-t border-line py-6 first:border-t-0 first:pt-2">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Heading className={`text-lg font-semibold text-fg ${hanja ? 'font-hanja' : ''}`}>{title}</Heading>
        {controls}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {description && <p className="-mt-1 mb-3 text-sm text-muted">{description}</p>}
      {children}
    </section>
  )
}
