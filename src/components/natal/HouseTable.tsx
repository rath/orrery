import type { NatalHouse } from '@orrery/core/types'
import { ZODIAC_SYMBOLS, ROMAN, formatDegree } from '@orrery/core/natal'
import { useLocale } from '../../i18n/index.ts'
import { textGlyph } from '../../utils/format.ts'
import Section from '../ui/Section.tsx'

interface Props {
  houses: NatalHouse[]
}

export default function HouseTable({ houses }: Props) {
  const { t } = useLocale()
  const columns = [houses.slice(0, 6), houses.slice(6)]

  return (
    <Section title={t('natal.houses')}>
      <div className="grid max-w-xl grid-cols-2 gap-x-8">
        {columns.map((column, ci) => (
          <table key={ci} className="w-full text-base">
            <tbody>
              {column.map(h => (
                <tr key={h.number} className="border-b border-line last:border-b-0">
                  <th scope="row" className="w-9 py-1.5 pr-2 text-right font-medium text-muted">
                    {ROMAN[h.number - 1]}
                  </th>
                  <td className="py-1.5 pr-2 whitespace-nowrap text-fg-2">
                    <span className="mr-1.5 inline-block w-5 text-center font-symbol text-lg leading-none text-fg">{textGlyph(ZODIAC_SYMBOLS[h.sign])}</span>
                    <span className="sm:hidden">{t(`zodiac.short.${h.sign}`)}</span>
                    <span className="hidden sm:inline">{t(`zodiac.${h.sign}`)}</span>
                  </td>
                  <td className="py-1.5 text-right text-fg tabular-nums">{formatDegree(h.cuspLongitude)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </Section>
  )
}
