import type { AspectType, NatalAspect, PlanetPosition } from '@orrery/core/types'
import { useLocale } from '../../../i18n/index.ts'
import { buttonClass } from '../../ui/classes.ts'
import { R_ASPECT, angleToPoint, lonToAngle } from './geometry.ts'

// 색을 구분하기 어려워도 선의 굵기와 점선의 간격으로 종류를 읽을 수 있다.
const strokes: Record<AspectType, { color: string; width: number; dash?: string }> = {
  conjunction: { color: 'var(--tone-amber)', width: 3.6 },
  sextile: { color: 'var(--tone-blue)', width: 1.6, dash: '1 4' },
  square: { color: 'var(--tone-red)', width: 1.7, dash: '6 3' },
  trine: { color: 'var(--tone-blue)', width: 1.6 },
  opposition: { color: 'var(--tone-red)', width: 1.8, dash: '14 3 2 3' },
}

interface Props {
  aspects: NatalAspect[]
  planets: PlanetPosition[]
  ascLon: number
}

export default function AspectLines({ aspects, planets, ascLon }: Props) {
  // 선 끝은 항상 실제 황경에 둔다. 바깥쪽 행성 기호만 겹침을 피해 이동한다.
  const points = new Map(planets.map(p => [p.id, angleToPoint(lonToAngle(p.longitude, ascLon), R_ASPECT)]))
  return (
    <g strokeLinecap="round">
      {[...aspects].reverse().map(aspect => {
        const a = points.get(aspect.planet1)
        const b = points.get(aspect.planet2)
        if (!a || !b) return null
        const { color, width, dash } = strokes[aspect.type]
        const conjunction = aspect.type === 'conjunction'
        return (
          <g key={`${aspect.planet1}-${aspect.planet2}`} stroke={color} opacity={0.88 - aspect.orb * 0.03}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={width} strokeDasharray={dash} />
            {[a, b].map((point, i) => (
              <circle key={i} cx={point.x} cy={point.y} r={conjunction ? 2.8 : 1.7}
                fill={conjunction ? 'var(--surface)' : color} strokeWidth={conjunction ? 1.6 : 0} />
            ))}
          </g>
        )
      })}
    </g>
  )
}

interface LegendProps {
  aspects: NatalAspect[]
  selected: AspectType | null
  onSelect: (type: AspectType | null) => void
}

export function AspectLegend({ aspects, selected, onSelect }: LegendProps) {
  const { t } = useLocale()
  const kinds = [...new Map(aspects.map(a => [a.type, a])).values()].sort((a, b) => a.angle - b.angle)
  return (
    <div role="group" aria-label={t('natal.aspectKey')} className="flex flex-wrap justify-center gap-x-1">
      {kinds.map(({ type, angle }) => {
        const { color, width, dash } = strokes[type]
        const active = selected === type
        return (
          <button
            key={type} type="button" aria-pressed={active}
            onClick={() => onSelect(active ? null : type)}
            className={`${buttonClass('ghost', 'sm')} @max-[30rem]:h-11 @max-[30rem]:gap-1 @max-[30rem]:px-1 aria-pressed:bg-sunken aria-pressed:underline aria-pressed:underline-offset-4`}
          >
            <svg width="22" height="10" aria-hidden="true">
              <line x1="2" x2="20" y1="5" y2="5" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
            </svg>
            {t(`aspect.${type}`)}
            <span className="text-muted tabular-nums">{angle}°</span>
          </button>
        )
      })}
    </div>
  )
}
