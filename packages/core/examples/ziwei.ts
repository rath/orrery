/**
 * 자미두수(紫微斗數) 예제
 *
 * 실행: bun packages/core/examples/ziwei.ts
 */
import { createChart, getDaxianList, calculateLiunian } from '../src/ziwei.ts'
import { PALACE_NAMES, MAIN_STAR_NAMES } from '../src/constants.ts'

const year = 1993
const month = 3
const day = 12
const hour = 9
const minute = 45
const isMale = true

const chart = createChart(year, month, day, hour, minute, isMale)

// ── 기본 정보 ──
console.log('═══ 자미두수 명반 (紫微斗數 命盤) ═══')
console.log(`양력: ${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분 (${isMale ? '남' : '여'})`)
console.log(`음력: ${chart.lunarYear}년 ${chart.lunarMonth}월 ${chart.lunarDay}일${chart.isLeapMonth ? ' (윤달)' : ''}`)
console.log(`년주: ${chart.yearGan}${chart.yearZhi}`)
console.log(`명궁: ${chart.mingGongZhi}  신궁: ${chart.shenGongZhi}`)
console.log(`오행국: ${chart.wuXingJu.name} (${chart.wuXingJu.number}국)`)

// ── 12궁 성요 배치 ──
console.log('\n═══ 12궁 성요 배치 ═══')
for (const name of PALACE_NAMES) {
  const palace = chart.palaces[name]
  if (!palace) continue

  const shenMark = palace.isShenGong ? ' [身宮]' : ''
  const mainStars = palace.stars
    .filter(s => MAIN_STAR_NAMES.has(s.name))
    .map(s => {
      const sihua = s.siHua ? ` ${s.siHua}` : ''
      return `${s.name}(${s.brightness}${sihua})`
    })

  const otherStars = palace.stars
    .filter(s => !MAIN_STAR_NAMES.has(s.name))
    .map(s => {
      const sihua = s.siHua ? ` ${s.siHua}` : ''
      return `${s.name}${sihua}`
    })

  console.log(`\n  ◆ ${name} [${palace.ganZhi}]${shenMark}`)
  if (mainStars.length > 0) console.log(`    주성: ${mainStars.join(', ')}`)
  if (otherStars.length > 0) console.log(`    부성: ${otherStars.join(', ')}`)
}

// ── 대한 (大限) ──
console.log('\n═══ 대한 (大限) ═══')
const daxianList = getDaxianList(chart)
for (const dx of daxianList) {
  const stars = dx.mainStars.length > 0 ? dx.mainStars.join(', ') : '-'
  console.log(`  ${String(dx.ageStart).padStart(2)}~${String(dx.ageEnd).padStart(2)}세  ${dx.palaceName.padEnd(4, '　')} ${dx.ganZhi}  [${stars}]`)
}

// ── 유년 (流年) ──
const targetYear = 2026
const liunian = calculateLiunian(chart, targetYear)

console.log(`\n═══ ${targetYear}년 유년 (流年) ═══`)
console.log(`유년 간지: ${liunian.gan}${liunian.zhi}`)
console.log(`유년 명궁: ${liunian.mingGongZhi} → 본명반 ${liunian.natalPalaceAtMing}`)
console.log(`현재 대한: ${liunian.daxianPalaceName} (${liunian.daxianAgeStart}~${liunian.daxianAgeEnd}세)`)

console.log('\n유년 사화:')
for (const [star, hua] of Object.entries(liunian.siHua)) {
  const palace = liunian.siHuaPalaces[hua] ?? '?'
  console.log(`  ${star} → ${hua} (${palace})`)
}

console.log('\n유월 (流月):')
for (const ly of liunian.liuyue) {
  console.log(`  ${String(ly.month).padStart(2)}월  ${ly.mingGongZhi} → ${ly.natalPalaceName}`)
}
