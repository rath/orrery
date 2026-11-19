import type { NatalAspect } from '@orrery/core/types'
import { PLANET_SYMBOLS, ASPECT_SYMBOLS } from '@orrery/core/natal'
import { useLocale } from '../../i18n/index.ts'
import { textGlyph } from '../../utils/format.ts'
import Section from '../ui/Section.tsx'

interface Props {
  aspects: NatalAspect[]
}

export default function AspectGrid({ aspects }: Props) {
  const { t } = useLocale()
  const top = aspects.slice(0, 15)

  return (
    <Section title={t('natal.aspects')}>
      <table className="w-full max-w-md text-left text-base">
        <tbody>
          {top.map((a, i) => (
            <tr key={i} className="border-b border-line last:border-b-0">
              <td className="py-1.5 pr-3 whitespace-nowrap">
                <span className="mr-1.5 inline-block w-5 text-center font-symbol text-fg">{textGlyph(PLANET_SYMBOLS[a.planet1])}</span>
                <span className="text-fg-2">{t(`planet.${a.planet1}`)}</span>
              </td>
              <td className="py-1.5 pr-3 text-center font-symbol text-lg leading-none text-fg">{textGlyph(ASPECT_SYMBOLS[a.type])}</td>
              <td className="py-1.5 pr-3 whitespace-nowrap">
                <span className="mr-1.5 inline-block w-5 text-center font-symbol text-fg">{textGlyph(PLANET_SYMBOLS[a.planet2])}</span>
                <span className="text-fg-2">{t(`planet.${a.planet2}`)}</span>
              </td>
              <td className="py-1.5 text-right whitespace-nowrap text-muted tabular-nums">orb {a.orb.toFixed(1)}°</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  )
}
