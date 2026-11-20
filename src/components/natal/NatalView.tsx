import { useEffect, useState } from 'react'
import { calculateNatal, HOUSE_SYSTEMS } from '@orrery/core/natal'
import PlanetTable from './PlanetTable.tsx'
import HouseTable from './HouseTable.tsx'
import AspectGrid from './AspectGrid.tsx'
import NatalWheel from './wheel/NatalWheel.tsx'
import CopyButton from '../CopyButton.tsx'
import type { BirthInput, NatalChart } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import Section from '../ui/Section.tsx'
import Notice from '../ui/Notice.tsx'
import { selectSmallClass } from '../ui/classes.ts'

interface Props {
  input: BirthInput
  houseSystem: string
  onHouseSystemChange: (houseSystem: string) => void
}

export default function NatalView({ input, houseSystem, onHouseSystemChange }: Props) {
  const { t } = useLocale()
  const [calculation, setCalculation] = useState<{
    input: BirthInput; houseSystem: string; chart: NatalChart | null; error: string | null
  } | null>(null)

  const current = calculation?.input === input && calculation.houseSystem === houseSystem ? calculation : null
  const chart = current?.chart
  const error = current?.error
  const loading = !current
  const unknownTime = !!input.unknownTime

  useEffect(() => {
    let cancelled = false

    calculateNatal(input, houseSystem)
      .then(result => {
        if (!cancelled) {
          setCalculation({ input, houseSystem, chart: result, error: null })
        }
      })
      .catch(err => {
        if (!cancelled) {
          setCalculation({ input, houseSystem, chart: null, error: err instanceof Error ? err.message : String(err) })
        }
      })

    return () => { cancelled = true }
  }, [input, houseSystem])

  if (loading) {
    return <p role="status" className="py-12 text-center text-muted">{t('natal.loading')}</p>
  }

  if (error) {
    return <Notice tone="error" role="alert" title={t('natal.error')}>{error}</Notice>
  }

  if (!chart) return null

  const houseSystemName = HOUSE_SYSTEMS.find(([k]) => k === (chart.houseSystem ?? houseSystem))?.[1] ?? 'Placidus'
  const majorAspects = chart.aspects.slice(0, 15)

  return (
    <div>
      {!unknownTime && chart.houseSystem && chart.houseSystem !== houseSystem && (
        <Notice tone="warn" role="status" className="mb-4">
          {t('natal.houseSystemFallback').replace('{system}', houseSystemName)}
        </Notice>
      )}
      {unknownTime && (
        <Notice tone="warn" title={t('natal.unknownTime')} className="mb-4">{t('natal.unknownTimeDetail')}</Notice>
      )}

      {/* 휠: 출생 시각이 있을 때만 */}
      {!unknownTime && (
        <NatalWheel angles={chart.angles} houses={chart.houses} planets={chart.planets} aspects={majorAspects} />
      )}

      <Section
        level={2}
        title={t('natal.planets')}
        controls={!unknownTime && (
          <label className="flex items-center gap-2 text-sm text-muted">
            {t('natal.houseSystem')}
            <select
              value={houseSystem}
              onChange={e => onHouseSystemChange(e.target.value)}
              className={selectSmallClass}
            >
              {HOUSE_SYSTEMS.map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </label>
        )}
        action={<CopyButton getText={async () => (await import('../../utils/text-export.ts')).natalToText(chart, houseSystemName)} label={t('copy.aiCopy')} />}
      >
        <PlanetTable planets={chart.planets} angles={chart.angles} />
      </Section>

      {!unknownTime && chart.houses.length > 0 && <HouseTable houses={chart.houses} />}
      <AspectGrid aspects={majorAspects} />
    </div>
  )
}
