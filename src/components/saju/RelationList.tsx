import type { AllRelations, RelationResult } from '@orrery/core/types'
import { ELEMENT_HANJA } from '@orrery/core/constants'
import Section from '../ui/Section.tsx'

interface Props {
  relations: AllRelations
  pillars: string[]  // 간지 [시, 일, 월, 년]
}

const PAIR_NAMES: Record<string, string> = {
  '0,1': '時-日', '0,2': '時-月', '0,3': '時-年',
  '1,2': '日-月', '1,3': '日-年', '2,3': '月-年',
}

type RelKind = 'good' | 'bad' | 'neutral'

function getRelKind(type: string): RelKind {
  if (type === '合' || type === '半合' || type === '三合' || type === '方合') return 'good'
  if (type === '沖' || type === '刑' || type === '害' || type === '破' || type === '怨嗔' || type === '鬼門') return 'bad'
  return 'neutral'
}

const KIND_STYLES: Record<RelKind, string> = {
  good: 'bg-tone-blue-soft text-tone-blue',
  bad: 'bg-tone-red-soft text-tone-red',
  neutral: 'bg-sunken text-fg-2',
}

function formatRelation(r: RelationResult, char1: string, char2: string) {
  const detail = r.detail && ELEMENT_HANJA[r.detail]
    ? ELEMENT_HANJA[r.detail]
    : r.detail ? `(${r.detail})` : ''
  return { text: `${char1}${char2} ${r.type}${detail}`, kind: getRelKind(r.type) }
}

export default function RelationList({ relations, pillars }: Props) {
  const lines: Array<{ label: string; tags: Array<{ text: string; kind: RelKind }> }> = []

  // 주 쌍 관계
  relations.pairs.forEach((rel, key) => {
    const [iStr, jStr] = key.split(',')
    const i = Number(iStr)
    const j = Number(jStr)
    const tags: Array<{ text: string; kind: RelKind }> = []

    for (const r of rel.stem) {
      tags.push(formatRelation(r, pillars[i][0], pillars[j][0]))
    }
    for (const r of rel.branch) {
      tags.push(formatRelation(r, pillars[i][1], pillars[j][1]))
    }

    if (tags.length > 0) {
      lines.push({ label: PAIR_NAMES[key] || key, tags })
    }
  })

  // 삼합
  for (const rel of relations.triple) {
    const el = rel.detail && ELEMENT_HANJA[rel.detail] ? ELEMENT_HANJA[rel.detail] : ''
    lines.push({ label: '', tags: [{ text: `${rel.type}${el}局`, kind: 'good' }] })
  }

  // 방합
  for (const rel of relations.directional) {
    const el = rel.detail && ELEMENT_HANJA[rel.detail] ? ELEMENT_HANJA[rel.detail] : ''
    lines.push({ label: '', tags: [{ text: `${rel.type}${el}`, kind: 'good' }] })
  }

  if (lines.length === 0) return null

  return (
    <Section hanja title="八字關係">
      <div className="space-y-2 font-hanja">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2 text-base">
            {line.label && (
              <span className="w-12 shrink-0 text-muted">{line.label}</span>
            )}
            <div className="flex flex-wrap gap-1.5">
              {line.tags.map((tag, j) => (
                <span
                  key={j}
                  className={`rounded px-2 py-0.5 text-base font-medium ${KIND_STYLES[tag.kind]}`}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
