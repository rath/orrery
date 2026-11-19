import type { PlanetPosition, NatalAngles } from '@orrery/core/types'
import { PLANET_SYMBOLS, ZODIAC_SYMBOLS, ROMAN, formatDegree } from '@orrery/core/natal'
import { useLocale } from '../../i18n/index.ts'
import { textGlyph } from '../../utils/format.ts'

interface Props {
  planets: PlanetPosition[]
  angles: NatalAngles | null
}

function Sign({ sign }: { sign: PlanetPosition['sign'] }) {
  const { t } = useLocale()
  return (
    <>
      <span className="mr-1.5 inline-block w-5 text-center font-symbol text-lg leading-none text-fg">{textGlyph(ZODIAC_SYMBOLS[sign])}</span>
      <span className="sm:hidden">{t(`zodiac.short.${sign}`)}</span>
      <span className="hidden sm:inline">{t(`zodiac.${sign}`)}</span>
    </>
  )
}

export default function PlanetTable({ planets, angles }: Props) {
  const { t } = useLocale()
  const showHouse = planets.some(p => p.house != null)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full max-w-xl text-base">
          <thead>
            <tr className="border-b border-line text-sm text-muted">
              <th scope="col" className="py-1.5 pr-3 text-left font-normal">{t('natal.planet')}</th>
              <th scope="col" className="py-1.5 pr-3 text-left font-normal">{t('natal.sign')}</th>
              <th scope="col" className="py-1.5 pr-3 text-right font-normal">{t('natal.degree')}</th>
              <th scope="col" className="py-1.5 pr-3 text-center font-normal">Rx</th>
              {showHouse && <th scope="col" className="py-1.5 text-center font-normal">{t('natal.house')}</th>}
            </tr>
          </thead>
          <tbody>
            {planets.map(p => (
              <tr key={p.id} className="border-b border-line last:border-b-0">
                <th scope="row" className="py-1.5 pr-3 text-left font-normal whitespace-nowrap text-fg-2">
                  <span className="mr-1.5 inline-block w-5 text-center font-symbol text-lg leading-none text-fg">{textGlyph(PLANET_SYMBOLS[p.id])}</span>
                  {t(`planet.${p.id}`)}
                </th>
                <td className="py-1.5 pr-3 whitespace-nowrap text-fg-2"><Sign sign={p.sign} /></td>
                <td className="py-1.5 pr-3 text-right text-fg tabular-nums">{formatDegree(p.longitude)}</td>
                <td className="py-1.5 pr-3 text-center font-medium text-tone-red">{p.isRetrograde ? 'R' : ''}</td>
                {showHouse && (
                  <td className="py-1.5 text-center text-fg-2">{p.house != null ? ROMAN[p.house - 1] : ''}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 앵글: 출생 시각이 있을 때만 */}
      {angles && (
        <>
          <h4 className="mt-6 mb-2 text-base font-semibold text-fg">{t('natal.angles')}</h4>
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-1.5 text-base sm:grid-cols-2">
            {([
              ['ASC', angles.asc],
              ['MC', angles.mc],
              ['DESC', angles.desc],
              ['IC', angles.ic],
            ] as const).map(([label, a]) => (
              <div key={label} className="flex items-center gap-2 whitespace-nowrap">
                <dt className="w-12 font-medium text-muted">{label}</dt>
                <dd className="flex flex-1 items-center justify-between gap-3 text-fg-2">
                  <span><Sign sign={a.sign} /></span>
                  <span className="text-fg tabular-nums">{formatDegree(a.longitude)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  )
}
