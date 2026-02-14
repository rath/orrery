import type { PillarDetail } from '../../core/types.ts'
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
  // unknownTime이면 시주 숨김
  const displayPillars = unknownTime ? pillars.slice(1) : pillars
  const labels = unknownTime ? ['日柱', '月柱', '年柱'] : ['時柱', '日柱', '月柱', '年柱']

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
            {displayPillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-3 ${stemColorClass(p.pillar.stem)}`}>{p.stemSipsin}</td>
            ))}
          </tr>

          {/* 천간 */}
          <tr className="text-2xl">
            <td className="pr-2 text-right text-xs text-gray-400">천간</td>
            {displayPillars.map((p, i) => (
              <td key={i} className="py-1 px-3">
                <span className={`inline-block w-10 h-10 leading-10 rounded ${stemSolidBgClass(p.pillar.stem)}`}>
                  {p.pillar.stem}
                </span>
              </td>
            ))}
          </tr>

          {/* 지지 */}
          <tr className="text-2xl">
            <td className="pr-2 text-right text-xs text-gray-400">지지</td>
            {displayPillars.map((p, i) => (
              <td key={i} className="py-1 px-3">
                <span className={`inline-block w-10 h-10 leading-10 rounded ${branchSolidBgClass(p.pillar.branch)}`}>
                  {p.pillar.branch}
                </span>
              </td>
            ))}
          </tr>

          {/* 지지 십신 */}
          <tr className="text-xs text-gray-600">
            <td className="pr-2 text-right text-gray-400">십신</td>
            {displayPillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-3 ${branchColorClass(p.pillar.branch)}`}>{p.branchSipsin}</td>
            ))}
          </tr>

          {/* 구분선 */}
          <tr>
            <td colSpan={labels.length + 1} className="py-1">
              <div className="border-t border-gray-200" />
            </td>
          </tr>

          {/* 운성 */}
          <tr className="text-xs text-gray-600">
            <td className="pr-2 text-right text-gray-400">운성</td>
            {displayPillars.map((p, i) => (
              <td key={i} className="py-0.5 px-3">{p.unseong}</td>
            ))}
          </tr>

          {/* 신살 */}
          <tr className="text-xs text-gray-600">
            <td className="pr-2 text-right text-gray-400">신살</td>
            {displayPillars.map((p, i) => (
              <td key={i} className="py-0.5 px-3">{p.sinsal}</td>
            ))}
          </tr>

          {/* 지장간 */}
          <tr className="text-xs">
            <td className="pr-2 text-right text-gray-400">장간</td>
            {displayPillars.map((p, i) => (
              <td key={i} className="py-0.5 px-3">
                <span className="inline-flex gap-0.5 justify-center">
                  {[...p.jigang].map((ch, j) =>
                    ch === ' '
                      ? <span key={j} className="inline-block w-4" />
                      : <span key={j} className={`inline-block w-4 text-center rounded-sm ${elementSolidBgClass(stemElement(ch))}`}>{ch}</span>
                  )}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
