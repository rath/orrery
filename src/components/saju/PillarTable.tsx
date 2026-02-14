import type { PillarDetail } from '@orrery/core/types'
import {
  stemColorClass,
  branchColorClass,
  stemSolidBgClass,
  branchSolidBgClass,
  elementSolidBgClass,
  stemElement,
} from '../../utils/format.ts'

interface Props {
  pillars: PillarDetail[]  // [시, 일, 월, 년]
  unknownTime?: boolean
}

export default function PillarTable({ pillars, unknownTime }: Props) {
  const labels = ['時柱', '日柱', '月柱', '年柱']

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-sm">
        <thead>
          <tr className="text-xs text-gray-500">
            <td className="py-1 pr-2 text-right w-12"></td>
            {labels.map(label => (
              <th key={label} className="py-1 px-3 font-normal">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="font-hanja">
          {/* 천간 십신 */}
          <tr className="text-xs text-gray-600">
            <td className="pr-2 text-right text-gray-400">십신</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-3 ${i === 0 && unknownTime ? 'text-gray-300' : stemColorClass(p.pillar.stem)}`}>
                {i === 0 && unknownTime ? '?' : p.stemSipsin}
              </td>
            ))}
          </tr>

          {/* 천간 */}
          <tr className="text-2xl">
            <td className="pr-2 text-right text-xs text-gray-400">천간</td>
            {pillars.map((p, i) => (
              <td key={i} className="py-1 px-3">
                {i === 0 && unknownTime
                  ? <span className="inline-flex items-center justify-center w-10 h-10 leading-none rounded pb-[3px] bg-gray-100 text-gray-300">?</span>
                  : <span className={`inline-flex items-center justify-center w-10 h-10 leading-none rounded pb-[3px] ${stemSolidBgClass(p.pillar.stem)}`}>{p.pillar.stem}</span>
                }
              </td>
            ))}
          </tr>

          {/* 지지 */}
          <tr className="text-2xl">
            <td className="pr-2 text-right text-xs text-gray-400">지지</td>
            {pillars.map((p, i) => (
              <td key={i} className="py-1 px-3">
                {i === 0 && unknownTime
                  ? <span className="inline-flex items-center justify-center w-10 h-10 leading-none rounded pb-[3px] bg-gray-100 text-gray-300">?</span>
                  : <span className={`inline-flex items-center justify-center w-10 h-10 leading-none rounded pb-[3px] ${branchSolidBgClass(p.pillar.branch)}`}>{p.pillar.branch}</span>
                }
              </td>
            ))}
          </tr>

          {/* 지지 십신 */}
          <tr className="text-xs text-gray-600">
            <td className="pr-2 text-right text-gray-400">십신</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-3 ${i === 0 && unknownTime ? 'text-gray-300' : branchColorClass(p.pillar.branch)}`}>
                {i === 0 && unknownTime ? '?' : p.branchSipsin}
              </td>
            ))}
          </tr>

          {/* 구분선 */}
          <tr>
            <td colSpan={5} className="py-1">
              <div className="border-t border-gray-200" />
            </td>
          </tr>

          {/* 운성 */}
          <tr className="text-xs text-gray-600">
            <td className="pr-2 text-right text-gray-400">운성</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-3 ${i === 0 && unknownTime ? 'text-gray-300' : ''}`}>
                {i === 0 && unknownTime ? '?' : p.unseong}
              </td>
            ))}
          </tr>

          {/* 신살 */}
          <tr className="text-xs text-gray-600">
            <td className="pr-2 text-right text-gray-400">신살</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-3 ${i === 0 && unknownTime ? 'text-gray-300' : ''}`}>
                {i === 0 && unknownTime ? '?' : p.sinsal}
              </td>
            ))}
          </tr>

          {/* 지장간 */}
          <tr className="text-xs">
            <td className="pr-2 text-right text-gray-400">장간</td>
            {pillars.map((p, i) => (
              <td key={i} className="py-0.5 px-3">
                {i === 0 && unknownTime
                  ? <span className="text-gray-300">?</span>
                  : <span className="inline-flex gap-0.5 justify-center">
                      {[...p.jigang].map((ch, j) =>
                        ch === ' '
                          ? <span key={j} className="inline-block w-4" />
                          : <span key={j} className={`inline-flex items-center justify-center w-4 h-4 leading-none rounded-sm pb-px ${elementSolidBgClass(stemElement(ch))}`}>{ch}</span>
                      )}
                    </span>
                }
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
