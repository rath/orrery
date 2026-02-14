/**
 * 행성 심볼 배치 — 클러스터링, tick mark, 역행 표시
 */
import { PLANET_SYMBOLS } from '@orrery/core/natal'
import type { PlanetId, PlanetPosition } from '@orrery/core/types'
import {
  R_ZODIAC_INNER, R_PLANET,
  angleToPoint, spreadPlanets,
} from './geometry.ts'

interface Props {
  planets: PlanetPosition[]
  ascLon: number
}

export default function PlanetMarkers({ planets, ascLon }: Props) {
  const items = planets.map(p => ({ id: p.id, lon: p.longitude }))
  const spread = spreadPlanets(items, ascLon)

  // 역행 여부 lookup
  const retroMap = new Map(planets.map(p => [p.id, p.isRetrograde]))

  return (
    <g>
      {spread.map(({ id, displayAngle, actualAngle }) => {
        const symbolPos = angleToPoint(displayAngle, R_PLANET)
        const tickOuter = angleToPoint(actualAngle, R_ZODIAC_INNER - 2)
        const tickInner = angleToPoint(actualAngle, R_ZODIAC_INNER - 8)

        // 표시 위치와 실제 위치가 다르면 점선 포인터
        const angleDiff = Math.abs(displayAngle - actualAngle)
        const needPointer = angleDiff > 1

        const pointerEnd = angleToPoint(actualAngle, R_ZODIAC_INNER - 8)
        const pointerStart = angleToPoint(displayAngle, R_PLANET + 10)

        const planetId = id as PlanetId
        const isRetro = retroMap.get(planetId) ?? false
        const symbol = PLANET_SYMBOLS[planetId] ?? '?'

        return (
          <g key={id}>
            {/* Tick mark (실제 위치) */}
            <line
              x1={tickOuter.x} y1={tickOuter.y}
              x2={tickInner.x} y2={tickInner.y}
              stroke="#6b7280"
              strokeWidth={1}
            />

            {/* 포인터 (표시 위치 ≠ 실제 위치) */}
            {needPointer && (
              <line
                x1={pointerStart.x} y1={pointerStart.y}
                x2={pointerEnd.x} y2={pointerEnd.y}
                stroke="#9ca3af"
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
            )}

            {/* 행성 심볼 */}
            <text
              x={symbolPos.x}
              y={symbolPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fill="#1f2937"
              style={{ userSelect: 'none' }}
            >
              {symbol}
            </text>

            {/* 역행 표시 */}
            {isRetro && (
              <text
                x={symbolPos.x + 9}
                y={symbolPos.y + 5}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={7}
                fill="#ef4444"
                fontWeight={600}
                style={{ userSelect: 'none' }}
              >
                R
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}
