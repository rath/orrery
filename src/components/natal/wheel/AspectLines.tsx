/**
 * 애스펙트 연결선 — 내원 안에 표시
 */
import type { NatalAspect, PlanetPosition, AspectType } from '@orrery/core/types'
import { R_INNER, lonToPoint } from './geometry.ts'

/** 애스펙트 타입별 색상 */
const ASPECT_COLORS: Record<AspectType, string> = {
  conjunction: '#22c55e',
  trine: '#22c55e',
  sextile: '#3b82f6',
  square: '#ef4444',
  opposition: '#ef4444',
}

/** 애스펙트 타입별 최대 orb (투명도 계산용) */
const MAX_ORBS: Record<AspectType, number> = {
  conjunction: 8,
  sextile: 6,
  square: 8,
  trine: 8,
  opposition: 8,
}

interface Props {
  aspects: NatalAspect[]
  planets: PlanetPosition[]
  ascLon: number
}

export default function AspectLines({ aspects, planets, ascLon }: Props) {
  const lonMap = new Map(planets.map(p => [p.id, p.longitude]))

  // 상위 15개 (이미 orb 순 정렬됨)
  const top = aspects.slice(0, 15)

  return (
    <g>
      {top.map((asp, i) => {
        const lon1 = lonMap.get(asp.planet1)
        const lon2 = lonMap.get(asp.planet2)
        if (lon1 === undefined || lon2 === undefined) return null

        const p1 = lonToPoint(lon1, ascLon, R_INNER - 2)
        const p2 = lonToPoint(lon2, ascLon, R_INNER - 2)

        const color = ASPECT_COLORS[asp.type]
        const maxOrb = MAX_ORBS[asp.type]
        // 타이트할수록 진하게 (orb 0 → opacity 0.8, maxOrb → opacity 0.15)
        const opacity = 0.8 - (asp.orb / maxOrb) * 0.65

        return (
          <line
            key={`${asp.planet1}-${asp.planet2}-${i}`}
            x1={p1.x} y1={p1.y}
            x2={p2.x} y2={p2.y}
            stroke={color}
            strokeWidth={asp.orb < 1 ? 1.5 : 1}
            strokeOpacity={opacity}
          />
        )
      })}
    </g>
  )
}
