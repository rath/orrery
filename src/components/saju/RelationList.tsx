import type { AllRelations } from '@orrery/core/types'
import { ELEMENT_HANJA, PILLAR_NAMES } from '@orrery/core/constants'

interface Props {
  relations: AllRelations
  pillars: string[]  // 간지 [시, 일, 월, 년]
}

const PAIR_NAMES: Record<string, string> = {
  '0,1': '時-日', '0,2': '時-月', '0,3': '時-年',
  '1,2': '日-月', '1,3': '日-年', '2,3': '月-年',
}

export default function RelationList({ relations, pillars }: Props) {
  const lines: Array<{ label: string; parts: string[] }> = []

  // 주 쌍 관계
  relations.pairs.forEach((rel, key) => {
    const [iStr, jStr] = key.split(',')
    const i = Number(iStr)
    const j = Number(jStr)
    const parts: string[] = []

    for (const r of rel.stem) {
      const detail = r.detail && ELEMENT_HANJA[r.detail] ? ELEMENT_HANJA[r.detail] : ''
      parts.push(`${pillars[i][0]}${pillars[j][0]}${r.type}${detail}`)
    }
    for (const r of rel.branch) {
      const detail = r.detail && ELEMENT_HANJA[r.detail]
        ? ELEMENT_HANJA[r.detail]
        : r.detail ? `(${r.detail})` : ''
      parts.push(`${pillars[i][1]}${pillars[j][1]}${r.type}${detail}`)
    }

    if (parts.length > 0) {
      lines.push({ label: PAIR_NAMES[key] || key, parts })
    }
  })

  // 삼합
  for (const rel of relations.triple) {
    const el = rel.detail && ELEMENT_HANJA[rel.detail] ? ELEMENT_HANJA[rel.detail] : ''
    lines.push({ label: '', parts: [`${rel.type}${el}局`] })
  }

  // 방합
  for (const rel of relations.directional) {
    const el = rel.detail && ELEMENT_HANJA[rel.detail] ? ELEMENT_HANJA[rel.detail] : ''
    lines.push({ label: '', parts: [`${rel.type}${el}`] })
  }

  if (lines.length === 0) return null

  return (
    <section>
      <h3 className="text-sm font-medium text-gray-700 mb-2">八字關係</h3>
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="text-sm text-gray-600">
            {line.label && (
              <span className="text-gray-400 mr-2">{line.label}:</span>
            )}
            <span>{line.parts.join(', ')}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
