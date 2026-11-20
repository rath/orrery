import { ZODIAC_SIGNS } from '@orrery/core/natal'
import { useLocale } from '../../../i18n/index.ts'
import ChartGlyph from './ChartGlyph.tsx'
import { R_RIM, R_SCALE, R_ZODIAC, angleToPoint, lonToAngle, radialLine } from './geometry.ts'

// 양자리부터 불·흙·공기·물이 세 번 반복된다.
const elementTones = ['red', 'green', 'amber', 'blue'] as const

function signArc(radius: number, inset = 0): string {
  const start = angleToPoint(inset, radius)
  const end = angleToPoint(30 - inset, radius)
  return `M${start.x},${start.y} A${radius},${radius} 0 0 0 ${end.x},${end.y}`
}

const band = signArc((R_RIM + R_ZODIAC) / 2)
const rim = signArc(R_RIM - 1.5, 0.4)
const ticks = { degree: '', five: '', ten: '' }
for (let degree = 0; degree < 360; degree++) {
  if (degree % 10 === 0) ticks.ten += radialLine(degree, R_SCALE, R_ZODIAC)
  else if (degree % 5 === 0) ticks.five += radialLine(degree, R_SCALE, R_SCALE + 7)
  else ticks.degree += radialLine(degree, R_SCALE, R_SCALE + 3.5)
}

export default function ZodiacRing({ ascLon }: { ascLon: number }) {
  const { t } = useLocale()
  return (
    <g>
      {ZODIAC_SIGNS.map((sign, index) => {
        const start = lonToAngle(index * 30, ascLon)
        const middle = lonToAngle(index * 30 + 15, ascLon)
        const glyph = angleToPoint(middle, R_ZODIAC + 16)
        const name = angleToPoint(middle, R_RIM - 13)
        // 아래쪽 반원에서도 이름을 바로 읽을 수 있게 접선 방향을 뒤집는다.
        const tilt = middle > 180 ? 270 - middle : 90 - middle
        const tone = elementTones[index % 4]
        return (
          <g key={sign} color={`var(--tone-${tone})`}>
            <g transform={`rotate(${-start})`} fill="none">
              <path d={band} stroke="currentColor" strokeOpacity={0.075} strokeWidth={R_RIM - R_ZODIAC} />
              <path d={rim} stroke="currentColor" strokeWidth={3} />
              <path d={radialLine(0, R_ZODIAC, R_RIM)} stroke="var(--control)" strokeWidth={0.8} />
            </g>
            <ChartGlyph id={sign} {...glyph} size={25} />
            <text
              x={name.x} y={name.y} transform={`rotate(${tilt} ${name.x} ${name.y})`}
              className="text-lg font-medium @min-[30rem]:text-sm"
              fill="currentColor"
            >{t(`zodiac.${sign}`)}</text>
          </g>
        )
      })}
      <g fill="none">
        <circle r={R_ZODIAC} stroke="var(--control)" strokeWidth={0.85} />
        <circle r={R_SCALE} stroke="var(--muted)" strokeWidth={1} />
        <g transform={`rotate(${-lonToAngle(0, ascLon)})`}>
          <path d={ticks.degree} stroke="var(--faint)" strokeWidth={0.8} className="hidden @min-[30rem]:inline" />
          <path d={ticks.five} stroke="var(--control)" strokeWidth={1} />
          <path d={ticks.ten} stroke="var(--muted)" strokeWidth={1.2} />
        </g>
      </g>
    </g>
  )
}
