/**
 * 외곽 별자리 링 — 12개 호형 세그먼트, 심볼, 눈금
 */
import { ZODIAC_SIGNS, ZODIAC_SYMBOLS } from '@orrery/core/natal'
import type { ZodiacSign } from '@orrery/core/types'
import {
  CX, CY, R_OUTER, R_ZODIAC_INNER,
  lonToAngle, angleToPoint, arcPath,
} from './geometry.ts'

/** 원소별 세그먼트 색상 */
const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#ef4444',   // red
  Earth: '#92400e',  // brown
  Air: '#eab308',    // yellow
  Water: '#3b82f6',  // blue
}

const SIGN_ELEMENT: Record<ZodiacSign, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
}

interface Props {
  ascLon: number
}

export default function ZodiacRing({ ascLon }: Props) {
  const segments: React.ReactNode[] = []
  const symbols: React.ReactNode[] = []
  const ticks: React.ReactNode[] = []

  for (let i = 0; i < 12; i++) {
    const sign = ZODIAC_SIGNS[i]
    const startLon = i * 30
    const endLon = (i + 1) * 30

    const startAngle = lonToAngle(startLon, ascLon)
    const endAngle = lonToAngle(endLon, ascLon)

    // 세그먼트 호 (외곽 → 내곽 사이 영역)
    const outerStart = angleToPoint(startAngle, R_OUTER)
    const outerEnd = angleToPoint(endAngle, R_OUTER)
    const innerEnd = angleToPoint(endAngle, R_ZODIAC_INNER)
    const innerStart = angleToPoint(startAngle, R_ZODIAC_INNER)

    // 호의 방향: startAngle > endAngle (반시계 감소)
    const outerArc = `M ${outerStart.x} ${outerStart.y} A ${R_OUTER} ${R_OUTER} 0 0 0 ${outerEnd.x} ${outerEnd.y}`
    const lineToInner = `L ${innerEnd.x} ${innerEnd.y}`
    const innerArc = `A ${R_ZODIAC_INNER} ${R_ZODIAC_INNER} 0 0 1 ${innerStart.x} ${innerStart.y}`
    const closePath = 'Z'

    const color = ELEMENT_COLORS[SIGN_ELEMENT[sign]]

    segments.push(
      <path
        key={`seg-${i}`}
        d={`${outerArc} ${lineToInner} ${innerArc} ${closePath}`}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={0.5}
        strokeOpacity={0.3}
      />,
    )

    // 30° 경계선
    const bStart = angleToPoint(startAngle, R_ZODIAC_INNER)
    const bEnd = angleToPoint(startAngle, R_OUTER)
    segments.push(
      <line
        key={`border-${i}`}
        x1={bStart.x} y1={bStart.y}
        x2={bEnd.x} y2={bEnd.y}
        stroke="#9ca3af"
        strokeWidth={0.5}
      />,
    )

    // 별자리 심볼 (세그먼트 중앙)
    const midLon = startLon + 15
    const midAngle = lonToAngle(midLon, ascLon)
    const symbolR = (R_OUTER + R_ZODIAC_INNER) / 2
    const pos = angleToPoint(midAngle, symbolR)

    symbols.push(
      <text
        key={`sym-${i}`}
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fill="#374151"
        style={{ userSelect: 'none' }}
      >
        {ZODIAC_SYMBOLS[sign]}
      </text>,
    )

    // 10° 간격 눈금 (30° 경계 제외)
    for (let d = 10; d < 30; d += 10) {
      const tickLon = startLon + d
      const tickAngle = lonToAngle(tickLon, ascLon)
      const t1 = angleToPoint(tickAngle, R_OUTER)
      const t2 = angleToPoint(tickAngle, R_OUTER - 5)
      ticks.push(
        <line
          key={`tick-${i}-${d}`}
          x1={t1.x} y1={t1.y}
          x2={t2.x} y2={t2.y}
          stroke="#9ca3af"
          strokeWidth={0.5}
        />,
      )
    }
  }

  // 외곽 원, 내곽 원
  return (
    <g>
      {segments}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#6b7280" strokeWidth={1} />
      <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#6b7280" strokeWidth={0.5} />
      {ticks}
      {symbols}
    </g>
  )
}
