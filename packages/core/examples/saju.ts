/**
 * 사주팔자(四柱八字) 예제
 *
 * 실행: bun packages/core/examples/saju.ts
 */
import { calculateSaju } from '../src/saju.ts'
import { PILLAR_NAMES, ELEMENT_HANJA } from '../src/constants.ts'
import type { BirthInput } from '../src/types.ts'

const input: BirthInput = {
  year: 1993,
  month: 3,
  day: 12,
  hour: 9,
  minute: 45,
  gender: 'M',
}

const result = calculateSaju(input)

// ── 사주 원국 ──
console.log('═══ 사주팔자 (四柱八字) ═══')
console.log(`생년월일시: ${input.year}년 ${input.month}월 ${input.day}일 ${input.hour}시 ${input.minute}분 (${input.gender === 'M' ? '남' : '여'})\n`)

console.log('       年柱    月柱    日柱    時柱')
const pillars = [...result.pillars].reverse() // 년→월→일→시 순서로 출력

const stems = pillars.map(p => ` ${p.pillar.stem}  `).join('  ')
const branches = pillars.map(p => ` ${p.pillar.branch}  `).join('  ')
const ganzis = pillars.map(p => ` ${p.pillar.ganzi} `).join('  ')
console.log(`천간:  ${stems}`)
console.log(`지지:  ${branches}`)
console.log(`간지:  ${ganzis}`)

console.log('')
console.log('       年柱    月柱    日柱    時柱')
const stemSipsins = pillars.map(p => p.stemSipsin.padStart(4, ' ')).join('  ')
const branchSipsins = pillars.map(p => p.branchSipsin.padStart(4, ' ')).join('  ')
const unseongs = pillars.map(p => p.unseong.padStart(4, ' ')).join('  ')
console.log(`십신:  ${stemSipsins}`)
console.log(`지지:  ${branchSipsins}`)
console.log(`운성:  ${unseongs}`)

// ── 대운 ──
console.log('\n═══ 대운 (大運) ═══')
for (const dw of result.daewoon) {
  const year = dw.startDate.getFullYear()
  console.log(
    `  ${String(dw.age).padStart(2)}세 (${year}~) ${dw.ganzi}  ${dw.stemSipsin}/${dw.branchSipsin}  ${dw.unseong}`
  )
}

// ── 간지 관계 ──
console.log('\n═══ 간지 관계 ═══')
const pairNames: Record<string, string> = {
  '3,2': '年-月', '3,1': '年-日', '3,0': '年-時',
  '2,1': '月-日', '2,0': '月-時', '1,0': '日-時',
}
for (const [key, pair] of result.relations.pairs) {
  const allRelations = [...pair.stem, ...pair.branch]
  if (allRelations.length > 0) {
    const label = pairNames[key] ?? key
    const desc = allRelations.map(r => `${r.type}${r.detail ? `(${r.detail})` : ''}`).join(', ')
    console.log(`  ${label}: ${desc}`)
  }
}

if (result.relations.triple.length > 0) {
  console.log(`  삼합: ${result.relations.triple.map(r => `${r.type}(${r.detail})`).join(', ')}`)
}
if (result.relations.directional.length > 0) {
  console.log(`  방합: ${result.relations.directional.map(r => `${r.type}(${r.detail})`).join(', ')}`)
}

// ── 신살 ──
console.log('\n═══ 신살 ═══')
const { specialSals } = result
if (specialSals.yangin.length > 0) {
  const positions = specialSals.yangin.map(i => PILLAR_NAMES[i]).join(', ')
  console.log(`  양인살: ${positions}`)
}
if (specialSals.baekho) console.log('  백호살')
if (specialSals.goegang) console.log('  괴강살')
if (!specialSals.yangin.length && !specialSals.baekho && !specialSals.goegang) {
  console.log('  (없음)')
}
