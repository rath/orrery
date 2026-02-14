import type { SajuResult, ZiweiChart, LiuNianInfo } from '../core/types.ts'
import { ELEMENT_HANJA, PILLAR_NAMES, PALACE_NAMES, MAIN_STAR_NAMES } from '../core/constants.ts'
import { getDaxianList } from '../core/ziwei.ts'
import { formatRelation, fmt2 } from './format.ts'

/** 사주 결과를 CLI 형식 텍스트로 변환 */
export function sajuToText(result: SajuResult): string {
  const { input, pillars, daewoon, relations, specialSals } = result
  const lines: string[] = []

  const genderChar = input.gender === 'M' ? '男' : '女'
  lines.push(`${input.year}年 ${input.month}月 ${input.day}日 ${input.hour}時 ${input.minute}分 (${genderChar})`)
  lines.push('')
  lines.push('四柱八字')
  lines.push('─────')

  const displayPillars = input.unknownTime ? pillars.slice(1) : pillars
  const labels = input.unknownTime ? ['日柱', '月柱', '年柱'] : ['時柱', '日柱', '月柱', '年柱']

  lines.push(`       ${labels.join('    ')}`)
  lines.push('─────')
  lines.push(`십신   ${displayPillars.map(p => fmt2(p.stemSipsin)).join('    ')}`)
  lines.push(`천간     ${displayPillars.map(p => p.pillar.stem).join('      ')}`)
  lines.push(`지지     ${displayPillars.map(p => p.pillar.branch).join('      ')}`)
  lines.push(`십신   ${displayPillars.map(p => fmt2(p.branchSipsin)).join('    ')}`)
  lines.push('─────')
  lines.push(`운성   ${displayPillars.map(p => fmt2(p.unseong)).join('    ')}`)
  lines.push(`장간  ${displayPillars.map(p => p.jigang).join('  ')}`)
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
    lines.push('大運')
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

  lines.push('紫微斗數 命盤')
  lines.push('═════')
  lines.push('')
  lines.push(`陽曆: ${chart.solarYear}年 ${chart.solarMonth}月 ${chart.solarDay}日 ${chart.hour}時 ${chart.minute}分`)
  lines.push(`陰曆: ${chart.lunarYear}年 ${chart.lunarMonth}月 ${chart.lunarDay}日${chart.isLeapMonth ? ' (閏月)' : ''}`)
  lines.push(`性別: ${genderChar}`)
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
