import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { AspectType, NatalChart } from '@orrery/core/types'
import { useLocale } from '../../../i18n/index.ts'
import { iconButtonClass } from '../../ui/classes.ts'
import AspectLines, { AspectLegend } from './AspectLines.tsx'
import HouseWheel from './HouseWheel.tsx'
import ZodiacRing from './ZodiacRing.tsx'
import PlanetMarkers from './PlanetMarkers.tsx'
import { R_RIM } from './geometry.ts'

type Props = Pick<NatalChart, 'angles' | 'aspects' | 'houses' | 'planets'>

export default function NatalWheel({ angles, aspects, houses, planets }: Props) {
  const { t } = useLocale()
  const description = useId()
  const viewportId = useId()
  const viewport = useRef<HTMLDivElement>(null)
  const [zoomed, setZoomed] = useState(false)
  const [selected, setSelected] = useState<AspectType | null>(null)
  useLayoutEffect(() => {
    const el = viewport.current
    if (zoomed && el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
  }, [zoomed])

  if (!angles) return null
  const ascLon = angles.asc.longitude
  const visible = selected ? aspects.filter(a => a.type === selected) : aspects
  const zoomLabel = t(zoomed ? 'natal.fitWheel' : 'natal.enlargeWheel')

  return (
    <figure className="@container mx-auto w-full max-w-2xl pt-2 pb-5">
      <div className="relative">
        <div
          id={viewportId} ref={viewport} className="overflow-x-auto overscroll-x-contain"
          role={zoomed ? 'region' : undefined} aria-label={zoomed ? t('app.tab.natal') : undefined}
          tabIndex={zoomed ? 0 : undefined}
        >
          <div className={`@container w-full ${zoomed ? '@max-[30rem]:w-[40rem]' : ''}`}>
            <svg
              viewBox="-336 -316 672 632" className="block w-full select-none"
              textAnchor="middle" dominantBaseline="central"
              role="img" aria-label={t('app.tab.natal')} aria-describedby={description}
            >
              <desc id={description}>{t('natal.wheelDescription')}</desc>
              <circle r={R_RIM} fill="var(--surface)" />
              <ZodiacRing ascLon={ascLon} />
              <HouseWheel houses={houses} angles={angles} />
              <AspectLines aspects={visible} planets={planets} ascLon={ascLon} />
              <PlanetMarkers planets={planets} ascLon={ascLon} />
            </svg>
          </div>
        </div>
        <button
          type="button" aria-controls={viewportId} aria-label={zoomLabel} title={zoomLabel}
          onClick={() => setZoomed(!zoomed)}
          className={`${iconButtonClass} absolute top-0 right-0 bg-bg @min-[30rem]:hidden @max-[30rem]:size-11`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
            <circle cx={10} cy={10} r={6.5} />
            <path d="M15 15l5.5 5.5 M7.2 10h5.6" />
            {!zoomed && <path d="M10 7.2v5.6" />}
          </svg>
        </button>
      </div>
      {aspects.length > 0 && (
        <figcaption className="mt-2">
          <AspectLegend aspects={aspects} selected={selected} onSelect={setSelected} />
        </figcaption>
      )}
    </figure>
  )
}
