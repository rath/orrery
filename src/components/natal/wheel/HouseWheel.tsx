/**
 * 하우스 커스프 선 + 라벨 + 내원
 */
import { ROMAN } from '@orrery/core/natal'
import type { NatalHouse, NatalAngles } from '@orrery/core/types'
import {
  CX, CY, R_ZODIAC_INNER, R_INNER, R_HOUSE_LABEL,
  lonToAngle, angleToPoint,
} from './geometry.ts'

interface Props {
  houses: NatalHouse[]
  angles: NatalAngles
}

export default function HouseWheel({ houses, angles }: Props) {
  const ascLon = angles.asc.longitude

  const lines: React.ReactNode[] = []
  const labels: React.ReactNode[] = []

  for (const house of houses) {
    const angle = lonToAngle(house.cuspLongitude, ascLon)
    const outer = angleToPoint(angle, R_ZODIAC_INNER)
    const inner = angleToPoint(angle, R_INNER)

    // ASC(1), DESC(7), MC(10), IC(4) 축은 굵게
    const isAxis = house.number === 1 || house.number === 7 ||
                   house.number === 10 || house.number === 4
    const strokeWidth = isAxis ? 1.5 : 0.5
    const strokeColor = isAxis ? '#374151' : '#9ca3af'

    lines.push(
      <line
        key={`cusp-${house.number}`}
        x1={outer.x} y1={outer.y}
        x2={inner.x} y2={inner.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />,
    )

    // 하우스 라벨: 다음 커스프와의 중간 각도에 배치
    const nextHouse = houses.find(h => h.number === (house.number % 12) + 1)!
    const nextAngle = lonToAngle(nextHouse.cuspLongitude, ascLon)
    // 두 각도의 중간 (반시계 방향)
    let midAngle = (angle + nextAngle) / 2
    // 각도 차가 180°를 넘으면 보정
    if (Math.abs(angle - nextAngle) > 180) {
      midAngle = (midAngle + 180) % 360
    }
    const labelPos = angleToPoint(midAngle, R_HOUSE_LABEL)

    labels.push(
      <text
        key={`label-${house.number}`}
        x={labelPos.x}
        y={labelPos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fill="#9ca3af"
        style={{ userSelect: 'none' }}
      >
        {ROMAN[house.number - 1]}
      </text>,
    )
  }

  // ASC / MC 축 라벨
  const axisLabels = [
    { label: 'ASC', lon: angles.asc.longitude, offset: -12 },
    { label: 'MC', lon: angles.mc.longitude, offset: -12 },
  ]

  const axisLabelNodes = axisLabels.map(({ label, lon, offset }) => {
    const angle = lonToAngle(lon, ascLon)
    const pos = angleToPoint(angle, R_ZODIAC_INNER + offset)
    return (
      <text
        key={`axis-${label}`}
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={600}
        fill="#374151"
        style={{ userSelect: 'none' }}
      >
        {label}
      </text>
    )
  })

  return (
    <g>
      {lines}
      <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#d1d5db" strokeWidth={0.5} />
      {labels}
      {axisLabelNodes}
    </g>
  )
}
