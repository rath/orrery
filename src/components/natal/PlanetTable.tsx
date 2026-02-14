import type { PlanetPosition, NatalAngles } from '../../core/types.ts'
import { PLANET_SYMBOLS, PLANET_KO, ZODIAC_SYMBOLS, ZODIAC_KO, ROMAN, formatDegree } from '../../core/natal.ts'

interface Props {
  planets: PlanetPosition[]
  angles: NatalAngles
}

export default function PlanetTable({ planets, angles }: Props) {
  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 mb-2">Planets</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left py-1 pr-2">행성</th>
              <th className="text-left py-1 pr-2">별자리</th>
              <th className="text-right py-1 pr-2">도수</th>
              <th className="text-center py-1 pr-2">Rx</th>
              <th className="text-center py-1">하우스</th>
            </tr>
          </thead>
          <tbody>
            {planets.map(p => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="py-1.5 pr-2">
                  <span className="mr-1">{PLANET_SYMBOLS[p.id]}</span>
                  <span className="text-gray-600">{PLANET_KO[p.id]}</span>
                </td>
                <td className="py-1.5 pr-2 whitespace-nowrap">
                  <span className="mr-1">{ZODIAC_SYMBOLS[p.sign]}</span>
                  <span className="text-gray-600 sm:hidden">{ZODIAC_KO[p.sign].slice(0, -2)}</span>
                  <span className="text-gray-600 hidden sm:inline">{ZODIAC_KO[p.sign]}</span>
                </td>
                <td className="py-1.5 pr-2 text-right font-mono text-gray-700">
                  {formatDegree(p.longitude)}
                </td>
                <td className="py-1.5 pr-2 text-center text-red-500">
                  {p.isRetrograde ? 'R' : ''}
                </td>
                <td className="py-1.5 text-center text-gray-600">
                  {ROMAN[p.house - 1]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Angles */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <h3 className="text-xs font-medium text-gray-500 mb-2">Angles</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {([
            ['ASC', angles.asc],
            ['MC', angles.mc],
            ['DESC', angles.desc],
            ['IC', angles.ic],
          ] as const).map(([label, a]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-medium text-gray-700 w-10">{label}</span>
              <span>{ZODIAC_SYMBOLS[a.sign]}</span>
              <span className="text-gray-600 sm:hidden">{ZODIAC_KO[a.sign].slice(0, -2)}</span>
              <span className="text-gray-600 hidden sm:inline">{ZODIAC_KO[a.sign]}</span>
              <span className="font-mono text-gray-700">{formatDegree(a.longitude)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
