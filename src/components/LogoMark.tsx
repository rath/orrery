import { useId } from 'react'

interface Props {
  className?: string
}

/**
 * 로고를 작은 크기용으로 단순화한 마크 (public/favicon.svg와 같은 도형).
 * 획은 글자색(currentColor)을 따르고 가운데 점만 주색이다.
 */
export default function LogoMark({ className }: Props) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <mask id={`${id}-gap`}>
        <rect width="64" height="64" fill="#fff" />
        <path d="M32 32L52.52 -24.38L67.27 -16.54Z" fill="#000" />
      </mask>
      <mask id={`${id}-hole`}>
        <rect width="64" height="64" fill="#fff" />
        <circle cx="33.5" cy="30.5" r="15.5" fill="#000" />
      </mask>
      <path
        fill="currentColor"
        fillRule="evenodd"
        mask={`url(#${id}-gap)`}
        d="M57 32A25 25 0 1 0 7 32A25 25 0 1 0 57 32ZM49 30.5A15.5 15.5 0 1 0 18 30.5A15.5 15.5 0 1 0 49 30.5Z"
      />
      <g mask={`url(#${id}-hole)`}>
        <ellipse cx="32" cy="32" rx="31.5" ry="8" transform="rotate(-20 32 32)" fill="none" stroke="currentColor" strokeWidth="5" />
      </g>
      <circle cx="31.5" cy="31.5" r="8" fill="#d7391e" />
    </svg>
  )
}
