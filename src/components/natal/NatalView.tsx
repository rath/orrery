import { useEffect, useState } from 'react'
import { calculateNatal, HOUSE_SYSTEMS } from '@orrery/core/natal'
import PlanetTable from './PlanetTable.tsx'
import HouseTable from './HouseTable.tsx'
import AspectGrid from './AspectGrid.tsx'
import NatalWheel from './wheel/NatalWheel.tsx'
import CopyButton from '../CopyButton.tsx'
import { natalToText } from '../../utils/text-export.ts'
import type { BirthInput, NatalChart } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'

interface Props {
  input: BirthInput
}

export default function NatalView({ input }: Props) {
  const { t } = useLocale()
  const [chart, setChart] = useState<NatalChart | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [houseSystem, setHouseSystem] = useState('P')

  const unknownTime = !!input.unknownTime

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setChart(null)

    calculateNatal(input, houseSystem)
      .then(result => {
        if (!cancelled) {
          setChart(result)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [input, houseSystem])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-base text-gray-500 dark:text-gray-400">
          <svg className="w-5 h-5 animate-spin text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t('natal.loading')}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-base text-red-800 dark:text-red-300 font-medium">{t('natal.error')}</p>
        <p className="text-base text-red-600 dark:text-red-400 mt-1">{error}</p>
      </div>
    )
  }

  if (!chart) return null

  const houseSystemName = HOUSE_SYSTEMS.find(([k]) => k === (chart.houseSystem ?? houseSystem))?.[1] ?? 'Placidus'

  return (
    <div className="space-y-6">
      {!unknownTime && chart.houseSystem && chart.houseSystem !== houseSystem && (
        <p role="status" className="text-sm text-amber-700 dark:text-amber-400">
          {t('natal.houseSystemFallback').replace('{system}', houseSystemName)}
        </p>
      )}
      {/* 시간 모름 안내 */}
      {unknownTime && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-base text-amber-800 dark:text-amber-300 font-medium">
            {t('natal.unknownTime')}
          </p>
          <p className="text-base text-amber-600 dark:text-amber-400 mt-1">
            {t('natal.unknownTimeDetail')}
          </p>
        </div>
      )}

      {/* Wheel Chart — 시간 있을 때만 */}
      {!unknownTime && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <NatalWheel chart={chart} />
        </div>
      )}

      {/* Planets + Angles */}
      <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 sm:gap-3">
            <h2 className="text-base font-medium text-gray-700 dark:text-gray-200">Natal Chart</h2>
            {!unknownTime && (
              <label className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 sm:ml-2">
                House
                <select
                  value={houseSystem}
                  onChange={e => setHouseSystem(e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                >
                {HOUSE_SYSTEMS.map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
                </select>
              </label>
            )}
          </div>
          <CopyButton getText={() => natalToText(chart, houseSystemName)} label={t('copy.aiCopy')} />
        </div>
        <PlanetTable planets={chart.planets} angles={chart.angles} />
      </section>

      {/* Houses — 시간 있을 때만 */}
      {!unknownTime && chart.houses.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Houses</h3>
          <HouseTable houses={chart.houses} />
        </div>
      )}

      {/* Aspects */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <AspectGrid aspects={chart.aspects} />
      </div>
    </div>
  )
}
