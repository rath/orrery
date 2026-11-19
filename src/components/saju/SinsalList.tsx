import type { SpecialSals } from '@orrery/core/types'
import { PILLAR_NAMES } from '@orrery/core/constants'
import { useLocale } from '../../i18n/index.ts'
import Section from '../ui/Section.tsx'

interface Props {
  sals: SpecialSals
}

interface SalEntry {
  label: string
  type: 'good' | 'bad'
}

export default function SinsalList({ sals }: Props) {
  const { t } = useLocale()
  const items: SalEntry[] = []

  // 길신 (吉神)
  if (sals.cheonul.length > 0) {
    const pos = sals.cheonul.map(i => PILLAR_NAMES[i]).join(',')
    items.push({ label: `${t('saju.sal.cheonul')}(${pos})`, type: 'good' })
  }
  if (sals.cheonduk.length > 0) {
    const pos = sals.cheonduk.map(i => PILLAR_NAMES[i]).join(',')
    items.push({ label: `${t('saju.sal.cheonduk')}(${pos})`, type: 'good' })
  }
  if (sals.wolduk.length > 0) {
    const pos = sals.wolduk.map(i => PILLAR_NAMES[i]).join(',')
    items.push({ label: `${t('saju.sal.wolduk')}(${pos})`, type: 'good' })
  }
  if (sals.munchang.length > 0) {
    const pos = sals.munchang.map(i => PILLAR_NAMES[i]).join(',')
    items.push({ label: `${t('saju.sal.munchang')}(${pos})`, type: 'good' })
  }
  if (sals.geumyeo.length > 0) {
    const pos = sals.geumyeo.map(i => PILLAR_NAMES[i]).join(',')
    items.push({ label: `${t('saju.sal.geumyeo')}(${pos})`, type: 'good' })
  }

  // 흉신 (凶神)
  if (sals.yangin.length > 0) {
    const pos = sals.yangin.map(i => PILLAR_NAMES[i]).join(',')
    items.push({ label: `${t('saju.sal.yangin')}(${pos})`, type: 'bad' })
  }
  if (sals.dohwa.length > 0) {
    const pos = sals.dohwa.map(i => PILLAR_NAMES[i]).join(',')
    items.push({ label: `${t('saju.sal.dohwa')}(${pos})`, type: 'bad' })
  }
  if (sals.baekho) items.push({ label: t('saju.sal.baekho'), type: 'bad' })
  if (sals.goegang) items.push({ label: t('saju.sal.goegang'), type: 'bad' })
  if (sals.hongyeom) items.push({ label: t('saju.sal.hongyeom'), type: 'bad' })

  if (items.length === 0) return null

  return (
    <Section hanja title="神殺">
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <span
            key={item.label}
            className={`rounded px-2 py-0.5 text-base font-medium ${
              item.type === 'good' ? 'bg-tone-blue-soft text-tone-blue' : 'bg-tone-red-soft text-tone-red'
            }`}
          >
            {item.label}
          </span>
        ))}
      </div>
    </Section>
  )
}
