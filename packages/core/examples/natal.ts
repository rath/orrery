/**
 * 서양 점성술 출생차트(Natal Chart) 예제
 *
 * 실행: bun packages/core/examples/natal.ts
 *
 * 외부 의존성 없이 순수 TypeScript로 실행됩니다.
 */
import { calculateNatal, ZODIAC_SYMBOLS, PLANET_SYMBOLS, PLANET_KO, ASPECT_SYMBOLS, ROMAN, formatDegree } from '../src/natal.ts'
import type { BirthInput } from '../src/types.ts'

const input: BirthInput = {
  year: 1993,
  month: 3,
  day: 12,
  hour: 9,
  minute: 45,
  gender: 'M',
  latitude: 37.5665,   // 서울
  longitude: 126.9780,
}

const chart = await calculateNatal(input)

// ── 기본 정보 ──
console.log('═══ 출생차트 (Natal Chart) ═══')
console.log(`생년월일시: ${input.year}년 ${input.month}월 ${input.day}일 ${input.hour}시 ${input.minute}분`)
console.log(`출생지: ${input.latitude}°N, ${input.longitude}°E (서울)\n`)

// ── 앵글 ──
console.log('── 앵글 ──')
const { angles } = chart
console.log(`  ASC: ${ZODIAC_SYMBOLS[angles.asc.sign]} ${angles.asc.sign} ${formatDegree(angles.asc.longitude)}`)
console.log(`  MC:  ${ZODIAC_SYMBOLS[angles.mc.sign]} ${angles.mc.sign} ${formatDegree(angles.mc.longitude)}`)
console.log(`  DSC: ${ZODIAC_SYMBOLS[angles.desc.sign]} ${angles.desc.sign} ${formatDegree(angles.desc.longitude)}`)
console.log(`  IC:  ${ZODIAC_SYMBOLS[angles.ic.sign]} ${angles.ic.sign} ${formatDegree(angles.ic.longitude)}`)

// ── 행성 위치 ──
console.log('\n── 행성 위치 ──')
for (const planet of chart.planets) {
  const symbol = PLANET_SYMBOLS[planet.id]
  const name = PLANET_KO[planet.id].padEnd(4, '　')
  const sign = `${ZODIAC_SYMBOLS[planet.sign]} ${planet.sign.padEnd(11)}`
  const degree = formatDegree(planet.longitude)
  const retro = planet.isRetrograde ? ' (R)' : ''
  const house = `${ROMAN[planet.house - 1]}하우스`
  console.log(`  ${symbol} ${name} ${sign} ${degree}  ${house}${retro}`)
}

// ── 하우스 ──
console.log('\n── 하우스 (Placidus) ──')
for (const house of chart.houses) {
  const num = ROMAN[house.number - 1].padEnd(4)
  const sign = `${ZODIAC_SYMBOLS[house.sign]} ${house.sign.padEnd(11)}`
  console.log(`  ${num} ${sign} ${formatDegree(house.cuspLongitude)}`)
}

// ── 애스펙트 ──
console.log('\n── 주요 애스펙트 ──')
const sorted = [...chart.aspects].sort((a, b) => a.orb - b.orb)
for (const aspect of sorted) {
  const p1 = `${PLANET_SYMBOLS[aspect.planet1]} ${PLANET_KO[aspect.planet1]}`
  const p2 = `${PLANET_SYMBOLS[aspect.planet2]} ${PLANET_KO[aspect.planet2]}`
  const sym = ASPECT_SYMBOLS[aspect.type]
  const typeName = aspect.type.padEnd(11)
  const orb = `orb ${aspect.orb.toFixed(1)}°`
  console.log(`  ${p1} ${sym} ${p2}  ${typeName} ${orb}`)
}
