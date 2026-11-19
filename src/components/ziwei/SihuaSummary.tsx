import type { ZiweiChart } from '@orrery/core/types'
import Section from '../ui/Section.tsx'

interface Props {
  chart: ZiweiChart
}

export default function SihuaSummary({ chart }: Props) {
  const siHuaInfo: Record<string, { star: string; palace: string } | null> = {
    '化祿': null, '化權': null, '化科': null, '化忌': null,
  }

  for (const palace of Object.values(chart.palaces)) {
    for (const star of palace.stars) {
      if (star.siHua) {
        siHuaInfo[star.siHua] = { star: star.name, palace: palace.name }
      }
    }
  }

  const colorMap: Record<string, string> = {
    '化祿': 'text-tone-green',
    '化權': 'text-tone-amber',
    '化科': 'text-tone-blue',
    '化忌': 'text-tone-red',
  }

  return (
    <Section hanja title="四化">
      <dl className="grid w-fit grid-cols-[auto_auto_auto] gap-x-4 gap-y-1 font-hanja text-base">
        {Object.entries(siHuaInfo).map(([huaType, info]) => {
          if (!info) return null
          return (
            <div key={huaType} className="contents">
              <dt className={`font-medium ${colorMap[huaType] || ''}`}>{huaType}</dt>
              <dd className="text-fg">{info.star}</dd>
              <dd className="text-fg-2"><span className="mr-1 text-muted">在</span>{info.palace}</dd>
            </div>
          )
        })}
      </dl>
    </Section>
  )
}
