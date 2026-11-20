import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useLocale } from '../i18n/index.ts'
import type { Profile, ProfilePlacement } from '../utils/profiles.ts'
import { formatBirthTime, formatCompactDate } from '../utils/subject-summary.ts'
import { buttonClass, iconButtonClass } from './ui/classes.ts'

interface Props {
  profiles: readonly Profile[]
  activeId: string | null
  dayPillars: ReadonlyMap<string, string>
  onSelect: (profile: Profile) => void
  onMove: (profile: Profile, targetId: string, placement: ProfilePlacement) => void
}

interface DropTarget {
  id: string
  placement: ProfilePlacement
}

export default function ProfileList({ profiles, activeId, dayPillars, onSelect, onMove }: Props) {
  const { t } = useLocale()
  const [dragged, setDragged] = useState<Profile | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const expandedHandle = useRef<HTMLButtonElement>(null)
  const canReorder = profiles.length > 1

  function targetAt(event: DragEvent<HTMLLIElement>, index: number): DropTarget | null {
    const target = profiles[index]
    if (!dragged || target.id === dragged.id) return null
    const { top, height } = event.currentTarget.getBoundingClientRect()
    // 행 중앙에 놓으면 위로 끌 때는 그 행 앞, 아래로 끌 때는 그 행 뒤에 넣는다.
    const middle = Math.floor(top + height / 2)
    const before = event.clientY < middle
      || (event.clientY === middle && index < profiles.findIndex(profile => profile.id === dragged.id))
    const placement = before ? 'before' : 'after'
    // 검색 결과에서 보이는 순서가 같다면 숨겨진 프로필 사이의 위치도 건드리지 않는다.
    const neighbor = profiles[placement === 'before' ? index - 1 : index + 1]
    return neighbor?.id === dragged.id ? null : { id: target.id, placement }
  }

  function endDrag() {
    setDragged(null)
    setDropTarget(null)
  }

  function previewDrop(event: DragEvent<HTMLLIElement>, index: number) {
    if (!dragged) return
    event.preventDefault()
    const next = targetAt(event, index)
    event.dataTransfer.dropEffect = next ? 'move' : 'none'
    setDropTarget(current =>
      current?.id === next?.id && current?.placement === next?.placement ? current : next,
    )
  }

  function moveOnePlace(
    button: HTMLButtonElement, profile: Profile, neighbor: Profile | undefined, placement: ProfilePlacement,
  ) {
    if (!neighbor) return
    onMove(profile, neighbor.id, placement)
    // 이동한 행과 함께 키보드 포커스도 옮긴다. 목록 끝에서는 손잡이로 돌아간다.
    requestAnimationFrame(() => (button.disabled ? expandedHandle.current : button)?.focus())
  }

  return (
    <ul
      className="-mx-2 mt-2 min-h-0 flex-1 overflow-y-auto"
      onDragLeave={event => {
        if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
          setDropTarget(null)
        }
      }}
    >
      {profiles.map((profile, index) => {
        const active = profile.id === activeId
        const expanded = canReorder && profile.id === expandedId
        const time = formatBirthTime(profile.data)
        const dayPillar = dayPillars.get(profile.id)
        const reorderLabel = t('profile.reorder').replace('{name}', () => profile.name)
        return (
          <li
            key={profile.id}
            className="relative"
            draggable={canReorder}
            onDragStart={event => {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('application/x-orrery-profile', profile.id)
              setDragged(profile)
              setExpandedId(null)
            }}
            onDragEnter={event => previewDrop(event, index)}
            onDragOver={event => previewDrop(event, index)}
            onDrop={event => {
              if (!dragged) return
              event.preventDefault()
              const target = targetAt(event, index)
              if (target) onMove(dragged, target.id, target.placement)
              endDrag()
            }}
            onDragEnd={endDrag}
          >
            <div className={`flex items-center rounded-md transition-colors ${active ? 'bg-sunken' : 'hover:bg-sunken'}`}>
              <button
                type="button"
                onClick={() => {
                  setExpandedId(null)
                  onSelect(profile)
                }}
                aria-current={active ? 'true' : undefined}
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-2 text-left focus-visible:outline-offset-[-2px]"
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-accent' : 'bg-transparent'}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-base text-fg ${active ? 'font-semibold' : 'font-medium'}`}>{profile.name}</span>
                  <span className="block truncate text-sm text-muted tabular-nums">
                    {formatCompactDate(profile.data)}{time && ` ${time}`}{' · '}
                    {profile.data.gender === 'M' ? t('profile.male') : t('profile.female')}
                  </span>
                </span>
                {dayPillar && (
                  <span className="font-hanja shrink-0 text-sm text-fg-2" title={t('profile.ilju')}>{dayPillar}</span>
                )}
              </button>
              {canReorder && (
                <button
                  type="button"
                  ref={expanded ? expandedHandle : undefined}
                  aria-label={reorderLabel}
                  title={reorderLabel}
                  aria-expanded={expanded}
                  onClick={() => setExpandedId(expanded ? null : profile.id)}
                  className={`${iconButtonClass} cursor-grab active:cursor-grabbing focus-visible:outline-offset-[-2px]`}
                >
                  <svg className="h-4 w-4 text-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <circle cx="5.5" cy="3" r="1.35" /><circle cx="10.5" cy="3" r="1.35" />
                    <circle cx="5.5" cy="8" r="1.35" /><circle cx="10.5" cy="8" r="1.35" />
                    <circle cx="5.5" cy="13" r="1.35" /><circle cx="10.5" cy="13" r="1.35" />
                  </svg>
                </button>
              )}
            </div>
            {expanded && (
              <div className="flex justify-end gap-1 px-2 pb-2">
                <button
                  type="button"
                  className={buttonClass('secondary', 'sm')}
                  disabled={index === 0}
                  onClick={event => moveOnePlace(event.currentTarget, profile, profiles[index - 1], 'before')}
                >
                  {t('profile.moveUp')}
                </button>
                <button
                  type="button"
                  className={buttonClass('secondary', 'sm')}
                  disabled={index === profiles.length - 1}
                  onClick={event => moveOnePlace(event.currentTarget, profile, profiles[index + 1], 'after')}
                >
                  {t('profile.moveDown')}
                </button>
              </div>
            )}
            {dropTarget?.id === profile.id && (
              <span aria-hidden="true" className={`pointer-events-none absolute inset-x-2 h-0.5 rounded-full bg-fg ${dropTarget.placement === 'before' ? 'top-0' : 'bottom-0'}`} />
            )}
          </li>
        )
      })}
    </ul>
  )
}
