/**
 * Natal Chart Wheel — SVG 루트 컨테이너
 *
 * 레이어 순서 (아래→위):
 * 1. AspectLines (내원 안)
 * 2. HouseWheel (커스프 선 + 라벨)
 * 3. ZodiacRing (외곽 밴드)
 * 4. PlanetMarkers (행성 심볼)
 */
import type { NatalChart } from '@orrery/core/types'
import AspectLines from './AspectLines.tsx'
import HouseWheel from './HouseWheel.tsx'
import ZodiacRing from './ZodiacRing.tsx'
import PlanetMarkers from './PlanetMarkers.tsx'

interface Props {
  chart: NatalChart
  /** 화면 낭독기에 읽어 줄 이름 */
  label: string
}

export default function NatalWheel({ chart, label }: Props) {
  if (!chart.angles) return null

  const ascLon = chart.angles.asc.longitude

  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full max-w-[600px] mx-auto"
      role="img"
      aria-label={label}
    >
      <AspectLines aspects={chart.aspects} planets={chart.planets} ascLon={ascLon} />
      <HouseWheel houses={chart.houses} angles={chart.angles} />
      <ZodiacRing ascLon={ascLon} />
      <PlanetMarkers planets={chart.planets} ascLon={ascLon} />
    </svg>
  )
}
