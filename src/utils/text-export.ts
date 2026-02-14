import type { SajuResult, ZiweiChart, LiuNianInfo, NatalChart } from '@orrery/core/types'
import { ELEMENT_HANJA, PILLAR_NAMES, PALACE_NAMES, MAIN_STAR_NAMES } from '@orrery/core/constants'
import { getDaxianList } from '@orrery/core/ziwei'
import { formatRelation, fmt2 } from './format.ts'
import { ZODIAC_SYMBOLS, PLANET_SYMBOLS, ASPECT_SYMBOLS, ROMAN, formatDegree } from '@orrery/core/natal'

/** 사주 결과를 CLI 형식 텍스트로 변환 */
export function sajuToText(result: SajuResult): string {
  const { input, pillars, daewoon, relations, specialSals } = result
  const lines: string[] = []
  const genderChar = input.gender === 'M' ? '男' : '女'

  lines.push(`四柱八字 (${genderChar})`)
  lines.push('─────')

  const labels = ['時柱', '日柱', '月柱', '年柱']
  const q = input.unknownTime

  lines.push(`       ${labels.join('    ')}`)
  lines.push('─────')
  lines.push(`십신   ${pillars.map((p, i) => fmt2(i === 0 && q ? '? ' : p.stemSipsin)).join('    ')}`)
  lines.push(`천간     ${pillars.map((p, i) => i === 0 && q ? '?' : p.pillar.stem).join('      ')}`)
  lines.push(`지지     ${pillars.map((p, i) => i === 0 && q ? '?' : p.pillar.branch).join('      ')}`)
  lines.push(`십신   ${pillars.map((p, i) => fmt2(i === 0 && q ? '? ' : p.branchSipsin)).join('    ')}`)
  lines.push('─────')
  lines.push(`운성   ${pillars.map((p, i) => fmt2(i === 0 && q ? '? ' : p.unseong)).join('    ')}`)
  lines.push(`장간  ${pillars.map((p, i) => i === 0 && q ? '  ?  ' : p.jigang).join('  ')}`)
  lines.push('')

  // 팔자 관계
  const relLines: string[] = []
  const pairNames: Record<string, string> = {
    '0,1': '時-日', '0,2': '時-月', '0,3': '時-年',
    '1,2': '日-月', '1,3': '日-年', '2,3': '月-年',
  }

  const ganzis = pillars.map(p => p.pillar.ganzi)

  relations.pairs.forEach((rel, key) => {
    const [iStr, jStr] = key.split(',')
    const i = Number(iStr)
    const j = Number(jStr)
    const parts: string[] = []

    for (const r of rel.stem) {
      const detail = r.detail && ELEMENT_HANJA[r.detail] ? ELEMENT_HANJA[r.detail] : ''
      parts.push(`${ganzis[i][0]}${ganzis[j][0]}${r.type}${detail}`)
    }
    for (const r of rel.branch) {
      const detail = r.detail && ELEMENT_HANJA[r.detail]
        ? ELEMENT_HANJA[r.detail]
        : r.detail ? `(${r.detail})` : ''
      parts.push(`${ganzis[i][1]}${ganzis[j][1]}${r.type}${detail}`)
    }
    if (parts.length > 0) {
      relLines.push(`${pairNames[key] || key}: ${parts.join(', ')}`)
    }
  })

  for (const rel of relations.triple) {
    const el = rel.detail && ELEMENT_HANJA[rel.detail] ? ELEMENT_HANJA[rel.detail] : ''
    relLines.push(`${rel.type}${el}局`)
  }
  for (const rel of relations.directional) {
    const el = rel.detail && ELEMENT_HANJA[rel.detail] ? ELEMENT_HANJA[rel.detail] : ''
    relLines.push(`${rel.type}${el}`)
  }

  if (relLines.length > 0) {
    lines.push('八字關係')
    lines.push('─────')
    relLines.forEach(l => lines.push(l))
    lines.push('')
  }

  // 신살
  const salItems: string[] = []
  if (specialSals.yangin.length > 0) {
    salItems.push(`양인살(${specialSals.yangin.map(i => PILLAR_NAMES[i]).join(',')})`)
  }
  if (specialSals.baekho) salItems.push('백호살')
  if (specialSals.goegang) salItems.push('괴강살')
  if (salItems.length > 0) {
    lines.push('神殺')
    lines.push('─────')
    lines.push(salItems.join(' · '))
    lines.push('')
  }

  // 대운
  if (daewoon.length > 0) {
    lines.push(input.unknownTime ? '大運 (시간 모름 — 정오 기준, 시작 시기 수개월 오차 가능)' : '大運')
    lines.push('─────')
    for (const dw of daewoon) {
      lines.push(`${String(dw.index).padStart(2)}運 (${String(dw.age).padStart(2)}세)  ${fmt2(dw.stemSipsin)}  ${dw.ganzi}  ${fmt2(dw.branchSipsin)}  (${dw.startDate.getFullYear()}年)`)
    }
  }

  return lines.join('\n')
}

/** 자미두수 명반을 텍스트로 변환 */
export function ziweiToText(chart: ZiweiChart, liunian?: LiuNianInfo): string {
  const lines: string[] = []
  const genderChar = chart.isMale ? '男' : '女'

  lines.push(`紫微斗數 命盤 (${genderChar})`)
  lines.push('═════')
  lines.push('')
  lines.push(`年柱: ${chart.yearGan}${chart.yearZhi}`)

  const mingPalace = chart.palaces['命宮']
  lines.push(`命宮: ${mingPalace?.gan ?? ''}${mingPalace?.zhi ?? ''}`)

  // 신궁 찾기
  let shenPalaceName = ''
  for (const p of Object.values(chart.palaces)) {
    if (p.isShenGong) { shenPalaceName = p.name; break }
  }
  lines.push(`身宮: ${shenPalaceName} (${chart.shenGongZhi})`)
  lines.push(`五行局: ${chart.wuXingJu.name}`)
  lines.push(`大限起始: ${chart.daXianStartAge}歲`)
  lines.push('')

  // 12궁
  lines.push('十二宮')
  lines.push('─────')
  for (const palaceName of PALACE_NAMES) {
    const palace = chart.palaces[palaceName]
    if (!palace) continue

    const shenMark = palace.isShenGong ? '·身' : '  '
    const mainStars = palace.stars.filter(s => MAIN_STAR_NAMES.has(s.name))
    const auxStars = palace.stars.filter(s => !MAIN_STAR_NAMES.has(s.name))

    const mainStr = mainStars.length > 0
      ? mainStars.map(s => {
          let name = s.name
          if (s.brightness) name += ` ${s.brightness}`
          if (s.siHua) name += ` ${s.siHua}`
          return name
        }).join(', ')
      : '(空宮)'

    lines.push(`${palace.name}${shenMark} ${palace.ganZhi}  ${mainStr}`)

    if (auxStars.length > 0) {
      const luckyNames = new Set(['左輔', '右弼', '文昌', '文曲', '天魁', '天鉞', '祿存', '天馬'])
      const lucky = auxStars.filter(s => luckyNames.has(s.name)).map(s => s.name)
      const sha = auxStars.filter(s => !luckyNames.has(s.name)).map(s => s.name)
      const parts: string[] = []
      if (lucky.length > 0) parts.push(`吉: ${lucky.join(' ')}`)
      if (sha.length > 0) parts.push(`煞: ${sha.join(' ')}`)
      if (parts.length > 0) lines.push(`          ${parts.join(' | ')}`)
    }
  }

  // 사화 요약
  lines.push('')
  lines.push('四化')
  lines.push('─────')
  const huaOrder = ['化祿', '化權', '化科', '化忌']
  for (const huaType of huaOrder) {
    for (const palace of Object.values(chart.palaces)) {
      for (const star of palace.stars) {
        if (star.siHua === huaType) {
          lines.push(`${huaType}: ${star.name} 在 ${palace.name}`)
        }
      }
    }
  }

  // 대운
  lines.push('')
  lines.push('大限')
  lines.push('─────')
  const daxianList = getDaxianList(chart)
  for (const dx of daxianList) {
    const stars = dx.mainStars.length > 0 ? dx.mainStars.join(' ') : '(空宮)'
    lines.push(`${String(dx.ageStart).padStart(3)}-${String(dx.ageEnd).padStart(3)}歲  ${dx.palaceName}  ${dx.ganZhi}  ${stars}`)
  }

  // 유년
  if (liunian) {
    lines.push('')
    lines.push(`流年 (${liunian.year}年 ${liunian.gan}${liunian.zhi}年)`)
    lines.push('═════')
    lines.push(`大限: ${liunian.daxianAgeStart}-${liunian.daxianAgeEnd}歲 ${liunian.daxianPalaceName}`)
    lines.push(`流年命宮: ${liunian.mingGongZhi}宮 → 本命 ${liunian.natalPalaceAtMing}`)

    for (const huaType of ['化祿', '化權', '化科', '化忌']) {
      let starName = ''
      for (const [s, h] of Object.entries(liunian.siHua)) {
        if (h === huaType) { starName = s; break }
      }
      const palaceName = liunian.siHuaPalaces[huaType] || '?'
      if (starName) lines.push(`${huaType}: ${starName} → ${palaceName}`)
    }

    lines.push('')
    const lunarMonthNames = ['正月', '二月', '三月', '四月', '五月', '六月',
                              '七月', '八月', '九月', '十月', '冬月', '臘月']
    for (const ly of liunian.liuyue) {
      lines.push(`${lunarMonthNames[ly.month - 1]} (${ly.mingGongZhi}): ${ly.natalPalaceName}`)
    }
  }

  return lines.join('\n')
}

/** Natal Chart를 텍스트로 변환 */
export function natalToText(chart: NatalChart, houseSystemName = 'Placidus'): string {
  const lines: string[] = []
  const hasHouses = chart.angles != null

  lines.push('Natal Chart')
  if (!hasHouses) lines.push('(시간 모름 — 정오 기준, ASC·하우스 제외)')
  lines.push('═════')
  lines.push('')

  // Angles
  if (chart.angles) {
    lines.push('Angles')
    lines.push('─────')
    for (const [label, a] of [['ASC', chart.angles.asc], ['MC', chart.angles.mc]] as const) {
      lines.push(`${label}  ${ZODIAC_SYMBOLS[a.sign]} ${a.sign} ${formatDegree(a.longitude)}`)
    }
    lines.push('')
  }

  // Planets
  lines.push('Planets')
  lines.push('─────')
  for (const p of chart.planets) {
    const retro = p.isRetrograde ? ' R' : '  '
    const sym = PLANET_SYMBOLS[p.id]
    const signSym = ZODIAC_SYMBOLS[p.sign]
    const housePart = p.house != null ? ` ${ROMAN[p.house - 1].padStart(5)}` : ''
    lines.push(`${sym} ${p.id.padEnd(10)} ${signSym} ${p.sign.padEnd(12)} ${formatDegree(p.longitude)}${retro}${housePart}`)
  }
  lines.push('')

  // Houses
  if (hasHouses && chart.houses.length > 0) {
    lines.push(`Houses (${houseSystemName})`)
    lines.push('─────')
    for (const h of chart.houses) {
      lines.push(`${ROMAN[h.number - 1].padStart(4)}  ${ZODIAC_SYMBOLS[h.sign]} ${h.sign.padEnd(12)} ${formatDegree(h.cuspLongitude)}`)
    }
    lines.push('')
  }

  // Aspects
  lines.push('Major Aspects')
  lines.push('─────')
  for (const a of chart.aspects.slice(0, 15)) {
    const sym1 = PLANET_SYMBOLS[a.planet1]
    const sym2 = PLANET_SYMBOLS[a.planet2]
    const aspSym = ASPECT_SYMBOLS[a.type]
    lines.push(`${sym1} ${a.planet1.padEnd(10)} ${aspSym} ${sym2} ${a.planet2.padEnd(10)} orb ${a.orb.toFixed(1)}°`)
  }

  return lines.join('\n')
}
