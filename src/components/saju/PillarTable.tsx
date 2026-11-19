import type { PillarDetail, Gongmang } from '@orrery/core/types'
import {
  stemColorClass,
  branchColorClass,
  stemSolidBgClass,
  branchSolidBgClass,
  elementSolidBgClass,
  stemElement,
} from '../../utils/format.ts'
import { useLocale } from '../../i18n/index.ts'

interface Props {
  pillars: PillarDetail[]  // [시, 일, 월, 년]
  unknownTime?: boolean
  gongmang: Gongmang
}

export default function PillarTable({ pillars, unknownTime, gongmang }: Props) {
  const { t } = useLocale()
  const gmSet = new Set(gongmang.branches)
  const labels = ['時柱', '日柱', '月柱', '年柱']

  return (
    <div className="overflow-x-auto">
      <table className="w-full max-w-lg text-center text-base">
        <thead>
          <tr className="text-sm text-muted">
            <td className="w-12 py-1 pr-2" />
            {labels.map(label => (
              <th key={label} className="py-1 px-1 sm:px-3 font-normal">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="font-hanja">
          {/* 천간 십신 */}
          <tr className="text-sm text-fg-2">
            <th scope="row" className="pr-3 text-right text-sm font-normal whitespace-nowrap text-muted">{t('saju.sipsin')}</th>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-1 sm:px-3 ${i === 0 && unknownTime ? 'text-faint' : stemColorClass(p.pillar.stem)}`}>
                {i === 0 && unknownTime ? '?' : p.stemSipsin}
              </td>
            ))}
          </tr>

          {/* 천간 */}
          <tr className="text-[1.75rem] sm:text-[2rem]">
            <th scope="row" className="pr-3 text-right text-sm font-normal whitespace-nowrap text-muted">{t('saju.cheongan')}</th>
            {pillars.map((p, i) => (
              <td key={i} className="py-1 px-1 sm:px-3">
                {i === 0 && unknownTime
                  ? <span className="inline-flex h-12 w-12 items-center justify-center rounded-md pb-[3px] leading-none sm:h-14 sm:w-14 bg-sunken text-faint">?</span>
                  : <span className={`inline-flex h-12 w-12 items-center justify-center rounded-md pb-[3px] leading-none sm:h-14 sm:w-14 ${stemSolidBgClass(p.pillar.stem)}`}>{p.pillar.stem}</span>
                }
              </td>
            ))}
          </tr>

          {/* 지지 */}
          <tr className="text-[1.75rem] sm:text-[2rem]">
            <th scope="row" className="pr-3 text-right text-sm font-normal whitespace-nowrap text-muted">{t('saju.jiji')}</th>
            {pillars.map((p, i) => (
              <td key={i} className="py-1 px-1 sm:px-3">
                {i === 0 && unknownTime
                  ? <span className="inline-flex h-12 w-12 items-center justify-center rounded-md pb-[3px] leading-none sm:h-14 sm:w-14 bg-sunken text-faint">?</span>
                  : <span className={`inline-flex h-12 w-12 items-center justify-center rounded-md pb-[3px] leading-none sm:h-14 sm:w-14 ${branchSolidBgClass(p.pillar.branch)}`}>{p.pillar.branch}</span>
                }
              </td>
            ))}
          </tr>

          {/* 지지 십신 */}
          <tr className="text-sm text-fg-2">
            <th scope="row" className="pr-3 text-right text-sm font-normal whitespace-nowrap text-muted">{t('saju.sipsin')}</th>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-1 sm:px-3 ${i === 0 && unknownTime ? 'text-faint' : branchColorClass(p.pillar.branch)}`}>
                {i === 0 && unknownTime ? '?' : p.branchSipsin}
              </td>
            ))}
          </tr>

          {/* 구분선 */}
          <tr>
            <td colSpan={5} className="py-1">
              <div className="border-t border-line" />
            </td>
          </tr>

          {/* 운성 */}
          <tr className="text-sm text-fg-2">
            <th scope="row" className="pr-3 text-right text-sm font-normal whitespace-nowrap text-muted">{t('saju.unseong')}</th>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-1 sm:px-3 ${i === 0 && unknownTime ? 'text-faint' : ''}`}>
                {i === 0 && unknownTime ? '?' : p.unseong}
              </td>
            ))}
          </tr>

          {/* 신살 */}
          <tr className="text-sm text-fg-2">
            <th scope="row" className="pr-3 text-right text-sm font-normal whitespace-nowrap text-muted">{t('saju.sinsal')}</th>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-1 sm:px-3 ${i === 0 && unknownTime ? 'text-faint' : ''}`}>
                {i === 0 && unknownTime ? '?' : p.sinsal}
              </td>
            ))}
          </tr>

          {/* 지장간 */}
          <tr className="text-sm">
            <th scope="row" className="pr-3 text-right text-sm font-normal whitespace-nowrap text-muted">{t('saju.janggan')}</th>
            {pillars.map((p, i) => (
              <td key={i} className="py-0.5 px-1 sm:px-3">
                {i === 0 && unknownTime
                  ? <span className="text-faint">?</span>
                  : <span className="inline-flex gap-0.5 justify-center">
                      {[...p.jigang].map((ch, j) =>
                        ch === ' '
                          ? <span key={j} className="inline-block w-5" />
                          : <span key={j} className={`inline-flex h-5 w-5 items-center justify-center rounded-sm pb-px text-[0.8125rem] leading-none ${elementSolidBgClass(stemElement(ch))}`}>{ch}</span>
                      )}
                    </span>
                }
              </td>
            ))}
          </tr>
          {/* 공망 */}
          <tr className="text-sm text-fg-2">
            <th scope="row" className="pr-3 text-right text-sm font-normal whitespace-nowrap text-muted">{t('saju.gongmang')}</th>
            {pillars.map((p, i) => {
              const isGm = i !== 1 && gmSet.has(p.pillar.branch)
              const isUnknown = i === 0 && unknownTime
              return (
                <td key={i} className={`py-0.5 px-1 sm:px-3 ${isUnknown ? 'text-faint' : ''}`}>
                  {isUnknown ? '?' : isGm ? '空亡' : ''}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
