/** 폼 컨트롤과 버튼이 공유하는 클래스. 화면마다 모양이 달라지지 않도록 여기서만 정의한다. */

const CHEVRON =
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%238a8b96%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] " +
  'bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat'

const controlBase =
  'rounded-md border border-control bg-surface text-fg transition-colors ' +
  'hover:border-fg focus-visible:border-fg focus-visible:outline-offset-0 ' +
  'disabled:border-line disabled:bg-sunken disabled:text-faint disabled:hover:border-line ' +
  'aria-invalid:border-tone-red'

export const inputClass = `${controlBase} h-10 w-full px-3 text-base placeholder:text-muted`

export const selectClass = `${controlBase} ${CHEVRON} h-10 w-full appearance-none pl-3 pr-8 text-base`

/** 표 머리의 작은 선택 상자 (기간, 하우스 방식 등) */
export const selectSmallClass = `${controlBase} ${CHEVRON} h-8 appearance-none pl-2.5 pr-7 text-sm`

export const inputSmallClass = `${controlBase} h-8 px-2.5 text-sm placeholder:text-muted`

const buttonBase =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap ' +
  'transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const buttonSize = {
  md: 'h-10 px-4 text-base',
  sm: 'h-8 px-3 text-sm',
} as const

const buttonVariant = {
  primary: 'bg-inverse text-inverse-fg hover:bg-inverse/85',
  secondary: 'border border-control bg-surface text-fg hover:bg-sunken',
  ghost: 'text-fg-2 hover:bg-sunken hover:text-fg',
  danger: 'text-tone-red hover:bg-tone-red-soft',
} as const

export type ButtonVariant = keyof typeof buttonVariant
export type ButtonSize = keyof typeof buttonSize

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md'): string {
  return `${buttonBase} ${buttonSize[size]} ${buttonVariant[variant]}`
}

/** 아이콘만 있는 정사각형 버튼 */
export const iconButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fg-2 transition-colors hover:bg-sunken hover:text-fg'

export const labelClass = 'block text-sm font-medium text-fg-2'
export const hintClass = 'text-sm text-muted'
export const errorClass = 'mt-1.5 text-sm text-tone-red'
