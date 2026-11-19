import type { ZiweiChart, ZiweiPalace } from '@orrery/core/types'
import { MAIN_STAR_NAMES, LUCKY_STAR_NAMES, SHA_STAR_NAMES, DI_ZHI } from '@orrery/core/constants'
import { getDaxianList } from '@orrery/core/ziwei'

interface Props {
  chart: ZiweiChart
}

/** 지지 → 그리드 위치 (row, col) 매핑 — 전통 命盤 배치 */
const ZHI_GRID: Record<string, [number, number]> = {
  '巳': [1, 1], '午': [1, 2], '未': [1, 3], '申': [1, 4],
  '辰': [2, 1],                                '酉': [2, 4],
  '卯': [3, 1],                                '戌': [3, 4],
  '寅': [4, 1], '丑': [4, 2], '子': [4, 3], '亥': [4, 4],
}

function siHuaColor(siHua: string): string {
  switch (siHua) {
    case '化祿': return 'text-tone-green'
    case '化權': return 'text-tone-amber'
    case '化科': return 'text-tone-blue'
    case '化忌': return 'text-tone-red'
    default: return ''
  }
}

function brightnessColor(b: string): string {
  if (b === '廟' || b === '旺') return 'text-tone-green'
  if (b === '陷') return 'text-tone-red'
  return 'text-muted'
}

function getPalaceByZhi(chart: ZiweiChart, zhi: string): ZiweiPalace | undefined {
  for (const p of Object.values(chart.palaces)) {
    if (p.zhi === zhi) return p
  }
  return undefined
}

function PalaceCell({ palace, daxianRange }: { palace: ZiweiPalace; daxianRange?: string }) {
  const mainStars = palace.stars.filter(s => MAIN_STAR_NAMES.has(s.name))
  const luckyStars = palace.stars.filter(s => LUCKY_STAR_NAMES.has(s.name))
  const shaStars = palace.stars.filter(s => SHA_STAR_NAMES.has(s.name))

  return (
    <div className="flex h-full flex-col justify-between p-1 text-xs leading-snug sm:p-2 sm:text-sm">
      {/* 궁명 + 신궁 + 간지 */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-1">
          <span className="font-semibold text-fg">
            {palace.name}
            {palace.isShenGong && <span className="text-accent ml-0.5">·身</span>}
          </span>
          <span className="font-hanja text-[0.6875rem] text-muted sm:text-xs">{palace.ganZhi}</span>
        </div>

        {/* 주성 */}
        <div className="mt-1 space-y-0.5">
          {mainStars.length > 0 ? (
            mainStars.map(s => (
              <div key={s.name} className="font-hanja">
                <span className="text-fg">{s.name}</span>
                {s.brightness && (
                  <span className={`ml-0.5 ${brightnessColor(s.brightness)}`}>{s.brightness}</span>
                )}
                {s.siHua && (
                  <span className={`ml-0.5 ${siHuaColor(s.siHua)}`}>{s.siHua}</span>
                )}
              </div>
            ))
          ) : (
            <div className="text-muted">空宮</div>
          )}
        </div>

        {/* 보성 / 살성 */}
        {(luckyStars.length > 0 || shaStars.length > 0) && (
          <div className="mt-1 border-t border-line pt-1 font-hanja">
            {luckyStars.length > 0 && (
              <div className="text-tone-green">{luckyStars.map(s => s.name).join(' ')}</div>
            )}
            {shaStars.length > 0 && (
              <div className="text-tone-red">{shaStars.map(s => s.name).join(' ')}</div>
            )}
          </div>
        )}
      </div>

      {/* 대한 나이 범위 */}
      {daxianRange && (
        <div className="mt-1 text-right text-[0.6875rem] text-muted tabular-nums sm:text-xs">{daxianRange}</div>
      )}
    </div>
  )
}

export default function MingPanGrid({ chart }: Props) {
  const genderChar = chart.isMale ? '男' : '女'

  let shenPalaceName = ''
  for (const p of Object.values(chart.palaces)) {
    if (p.isShenGong) { shenPalaceName = p.name; break }
  }

  // 대한 목록 → 궁 지지별 나이 범위 매핑
  const daxianList = getDaxianList(chart)
  const daxianByZhi = new Map<string, string>()
  for (const dx of daxianList) {
    const palace = chart.palaces[dx.palaceName]
    if (palace) {
      daxianByZhi.set(palace.zhi, `${dx.ageStart}-${dx.ageEnd}歲`)
    }
  }

  return (
    // 좁은 화면에서는 글자를 줄여 명반 전체가 한눈에 들어오게 한다 (가로로 밀어 보지 않는다)
    <div className="-mx-2 sm:mx-0 sm:overflow-x-auto">
      <div className="grid grid-cols-4 grid-rows-4 border-t border-l border-line sm:min-w-[600px]">
        {/* 12궁 셀 */}
        {DI_ZHI.split('').map(zhi => {
          const pos = ZHI_GRID[zhi]
          if (!pos) return null
          const palace = getPalaceByZhi(chart, zhi)
          if (!palace) return null

          return (
            <div
              key={zhi}
              className="min-h-[104px] min-w-0 border-r border-b border-line sm:min-h-[124px]"
              style={{ gridRow: pos[0], gridColumn: pos[1] }}
            >
              <PalaceCell palace={palace} daxianRange={daxianByZhi.get(zhi)} />
            </div>
          )
        })}

        {/* 중앙 패널 (row 2-3, col 2-3) */}
        <div
          className="flex min-w-0 flex-col items-center justify-center border-r border-b border-line bg-sunken p-1.5 sm:p-3"
          style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}
        >
          <div className="w-full max-w-[220px] space-y-0.5 text-xs text-fg-2 sm:text-sm">
            <div>
              <span className="text-muted">陽曆:</span>{' '}
              {chart.solarYear}年 {chart.solarMonth}月 {chart.solarDay}日 {chart.hour}時 {chart.minute}分
            </div>
            <div>
              <span className="text-muted">陰曆:</span>{' '}
              {chart.lunarYear}年 {chart.lunarMonth}月 {chart.lunarDay}日
              {chart.isLeapMonth && <span className="text-tone-amber ml-1">(閏月)</span>}
            </div>
            <div>
              <span className="text-muted">性別:</span> {genderChar}
            </div>
            <div className="pt-1">
              <span className="text-muted">年柱:</span>{' '}
              <span className="font-hanja">{chart.yearGan}{chart.yearZhi}</span>
            </div>
            <div>
              <span className="text-muted">命宮:</span>{' '}
              <span className="font-hanja">{chart.palaces['命宮']?.ganZhi}</span>
            </div>
            <div>
              <span className="text-muted">身宮:</span>{' '}
              {shenPalaceName} (<span className="font-hanja">{chart.shenGongZhi}</span>)
            </div>
            <div>
              <span className="text-muted">五行局:</span> {chart.wuXingJu.name}
            </div>
            <div>
              <span className="text-muted">大限起始:</span> {chart.daXianStartAge}歲
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
