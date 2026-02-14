import type { SpecialSals } from '@orrery/core/types'
import { PILLAR_NAMES } from '@orrery/core/constants'

interface Props {
  sals: SpecialSals
}

export default function SinsalList({ sals }: Props) {
  const items: string[] = []

  if (sals.yangin.length > 0) {
    const positions = sals.yangin.map(i => PILLAR_NAMES[i]).join(',')
    items.push(`양인살(${positions})`)
  }
  if (sals.baekho) items.push('백호살')
  if (sals.goegang) items.push('괴강살')

  if (items.length === 0) return null

  return (
    <section>
      <h3 className="text-sm font-medium text-gray-700 mb-2">神殺</h3>
      <p className="text-sm text-gray-600">{items.join(' · ')}</p>
    </section>
  )
}
