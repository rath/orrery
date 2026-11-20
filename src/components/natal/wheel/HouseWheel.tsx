import { normalizeDeg } from '@orrery/core/natal'
import type { NatalAngles, NatalHouse } from '@orrery/core/types'
import {
  R_ASPECT, R_HOUSES, R_RIM, R_SCALE, angleToPoint, lonToAngle, radialLine, spreadAngles,
} from './geometry.ts'

const axes = [
  ['asc', 'ASC'], ['mc', 'MC'], ['desc', 'DESC'], ['ic', 'IC'],
] as const

interface Props {
  houses: NatalHouse[]
  angles: NatalAngles
}

export default function HouseWheel({ houses, angles }: Props) {
  const ascLon = angles.asc.longitude
  const axisAngles = axes.map(([key]) => lonToAngle(angles[key].longitude, ascLon))
  const labelAngles = spreadAngles(axisAngles, 10)
  const sectors = houses.map((house, i) => {
    const next = houses[(i + 1) % houses.length]
    const span = normalizeDeg(next.cuspLongitude - house.cuspLongitude)
    return {
      number: house.number,
      cusp: lonToAngle(house.cuspLongitude, ascLon),
      middle: lonToAngle(house.cuspLongitude + span / 2, ascLon),
    }
  })
  const houseLabels = spreadAngles(sectors.map(s => s.middle), 11)
  const shifted = sectors.map((s, i) => Math.abs(normalizeDeg(s.middle - houseLabels[i] + 180) - 180) > 0.1)
  // 극권에서는 여러 하우스가 1° 안에 모일 수 있다. 경계는 원위치에 남기고
  // 번호를 벌려 놓을 때만 짧은 지시선으로 원래 구획의 가운데를 가리킨다.
  const cuspEnd = shifted.includes(true) ? R_HOUSES - 5 : R_ASPECT
  return (
    <g>
      <circle r={(R_HOUSES + R_ASPECT) / 2} fill="none" stroke="var(--sunken)" strokeWidth={R_HOUSES - R_ASPECT} />
      <circle r={R_HOUSES} fill="none" stroke="var(--line)" />
      <circle r={R_ASPECT} fill="none" stroke="var(--control)" strokeWidth={0.9} />
      {sectors.map(({ number, cusp, middle }, i) => {
        const label = angleToPoint(houseLabels[i], (R_HOUSES + R_ASPECT) / 2)
        const anchor = angleToPoint(middle, R_HOUSES)
        const end = angleToPoint(houseLabels[i], R_HOUSES - 7)
        return (
          <g key={number}>
            <path d={radialLine(cusp, cuspEnd, R_HOUSES)} stroke="var(--control)" strokeWidth={0.8} />
            <path d={radialLine(cusp, R_HOUSES, R_SCALE)} stroke="var(--line)" />
            {shifted[i] && <line x1={anchor.x} y1={anchor.y} x2={end.x} y2={end.y} stroke="var(--muted)" />}
            <text x={label.x} y={label.y} className="text-lg font-medium @min-[30rem]:text-base" fill="var(--fg-2)">
              {number}
            </text>
          </g>
        )
      })}
      {axes.map(([key, name], i) => {
        // Whole Sign · Equal · Morinus 등에서는 앵글이 하우스 경계와 다를 수 있다.
        const angle = axisAngles[i]
        const labelAngle = labelAngles[i]
        const label = angleToPoint(labelAngle, key === 'asc' || key === 'desc' ? 311 : 302)
        const stem = angleToPoint(angle, R_RIM + 6)
        const end = angleToPoint(labelAngle, R_RIM + 9)
        return (
          <g key={key}>
            <path d={radialLine(angle, R_HOUSES, R_SCALE)} stroke="var(--fg-2)" strokeWidth={1.6} />
            <path d={`M${stem.x},${stem.y} L${end.x},${end.y}`} stroke="var(--fg-2)" />
            <path
              d={`M${R_RIM - 1},0 l7,-3.3 v6.6 Z`} transform={`rotate(${-angle})`}
              fill="var(--fg-2)"
            />
            <text x={label.x} y={label.y} className="text-lg font-semibold @min-[30rem]:text-base" fill="var(--fg)">
              {name}
            </text>
          </g>
        )
      })}
    </g>
  )
}
