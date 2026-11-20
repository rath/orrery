import { formatDegree } from '@orrery/core/natal'
import type { PlanetPosition } from '@orrery/core/types'
import { useLocale } from '../../../i18n/index.ts'
import ChartGlyph from './ChartGlyph.tsx'
import { R_PLANET, R_SCALE, angleToPoint, lonToAngle, spreadAngles } from './geometry.ts'

interface Props {
  planets: PlanetPosition[]
  ascLon: number
}

export default function PlanetMarkers({ planets, ascLon }: Props) {
  const { t } = useLocale()
  const angles = planets.map(p => lonToAngle(p.longitude, ascLon))
  const displayAngles = spreadAngles(angles, 15)
  return (
    <g>
      {planets.map((planet, i) => {
        const anchor = angleToPoint(angles[i], R_SCALE)
        const elbow = angleToPoint(angles[i], R_SCALE - 5)
        const tip = angleToPoint(displayAngles[i], R_PLANET + 18)
        return (
          <g key={planet.id}>
            <path d={`M${anchor.x},${anchor.y} L${elbow.x},${elbow.y} L${tip.x},${tip.y}`}
              fill="none" stroke="var(--muted)" strokeWidth={1.1} strokeLinejoin="round" />
            <circle cx={anchor.x} cy={anchor.y} r={2} fill="var(--fg)" />
          </g>
        )
      })}
      {planets.map((planet, i) => {
        const { x, y } = angleToPoint(displayAngles[i], R_PLANET)
        const position = `${t(`planet.${planet.id}`)} · ${t(`zodiac.${planet.sign}`)} ${formatDegree(planet.longitude)}`
        return (
          <g key={planet.id} transform={`translate(${x} ${y})`} color="var(--fg)">
            <title>{planet.isRetrograde ? `${position} · ${t('natal.retrograde')}` : position}</title>
            <rect x={-17} y={-21} width={34} height={44} rx={10} fill="var(--surface)" />
            <ChartGlyph id={planet.id} x={0} y={-6} size={30} />
            <text y={15} className="text-lg font-medium tabular-nums @min-[30rem]:text-sm" fill="var(--muted)">
              {Math.trunc(planet.degreeInSign)}°
              {planet.isRetrograde && <tspan dx={2} fill="var(--tone-red)" fontSize="0.8em">R</tspan>}
            </text>
          </g>
        )
      })}
    </g>
  )
}
