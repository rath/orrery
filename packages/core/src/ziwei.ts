/**
 * 자미두수 (紫微斗數) 계산 엔진
 */
// @ts-expect-error lunar-javascript has no type declarations
import { Solar } from 'lunar-javascript'

import {
  TIAN_GAN, DI_ZHI, PALACE_NAMES,
  WU_XING_JU_MAP, NAYIN_TABLE,
  SI_HUA_TABLE, LU_CUN_TABLE, KUI_YUE_TABLE,
  HUO_XING_START, LING_XING_START, TIAN_MA_TABLE,
  ZIWEI_SERIES_OFFSETS, TIANFU_SERIES_OFFSETS,
  BRIGHTNESS_TABLE, WU_HU_DUN_GAN, CHANGSHENG_START,
} from './constants.ts'
import type {
  WuXingJu, ZiweiStar, ZiweiPalace, ZiweiChart,
  LiuYueInfo, LiuNianInfo,
} from './types.ts'

// =============================================
// 유틸리티
// =============================================

function zhiIndex(zhi: string): number {
  return DI_ZHI.indexOf(zhi)
}

function ganIndex(gan: string): number {
  return TIAN_GAN.indexOf(gan)
}

function zhiAt(index: number): string {
  return DI_ZHI[((index % 12) + 12) % 12]
}

function ganAt(index: number): string {
  return TIAN_GAN[((index % 10) + 10) % 10]
}

/** 시간 → 地支 인덱스 (23-1시=子(0), 1-3시=丑(1), ...) */
function hourZhiIndex(hour: number): number {
  if (hour === 23 || hour === 0) return 0
  return Math.floor((hour + 1) / 2) % 12
}

// =============================================
// 음력 변환 (lunar-javascript 사용)
// =============================================

function solarToLunar(year: number, month: number, day: number): {
  lunarYear: number; lunarMonth: number; lunarDay: number; isLeap: boolean
} {
  const solar = Solar.fromYmd(year, month, day)
  const lunar = solar.getLunar()
  const rawMonth = lunar.getMonth()
  return {
    lunarYear: lunar.getYear(),
    lunarMonth: Math.abs(rawMonth),
    lunarDay: lunar.getDay(),
    isLeap: rawMonth < 0,
  }
}

// =============================================
// 년주 간지
// =============================================

function getYearGanZhi(lunarYear: number): [string, string] {
  const ganIdx = ((lunarYear - 4) % 10 + 10) % 10
  const zhiIdx = ((lunarYear - 4) % 12 + 12) % 12
  return [ganAt(ganIdx), zhiAt(zhiIdx)]
}

// =============================================
// 명궁/신궁 계산
// =============================================

function calculateMingGong(lunarMonth: number, hour: number): string {
  const monthPalaceIdx = (2 + lunarMonth - 1) % 12
  const hourIdx = hourZhiIndex(hour)
  const mingGongIdx = ((monthPalaceIdx - hourIdx) % 12 + 12) % 12
  return zhiAt(mingGongIdx)
}

function calculateShenGong(lunarMonth: number, hour: number): string {
  const monthPalaceIdx = (2 + lunarMonth - 1) % 12
  const hourIdx = hourZhiIndex(hour)
  const shenGongIdx = (monthPalaceIdx + hourIdx) % 12
  return zhiAt(shenGongIdx)
}

// =============================================
// 궁간 계산 (五虎遁干法)
// =============================================

function getPalaceGan(yearGan: string, zhi: string): string {
  const startGan = WU_HU_DUN_GAN[yearGan]
  const startGanIdx = ganIndex(startGan)
  const yinIdx = zhiIndex('寅')
  const offset = ((zhiIndex(zhi) - yinIdx) % 12 + 12) % 12
  return ganAt(startGanIdx + offset)
}

// =============================================
// 오행국 결정
// =============================================

function getWuXingJu(palaceGan: string, palaceZhi: string): WuXingJu {
  const key = `${palaceGan},${palaceZhi}`
  const element = NAYIN_TABLE[key]
  if (element && WU_XING_JU_MAP[element]) {
    return WU_XING_JU_MAP[element]
  }
  return WU_XING_JU_MAP['water']
}

// =============================================
// 紫微星/天府星 위치
// =============================================

function calculateZiweiPosition(lunarDay: number, juNumber: number): string {
  const quotient = Math.floor(lunarDay / juNumber)
  const remainder = lunarDay % juNumber

  let position: number
  if (remainder === 0) {
    position = quotient
  } else {
    const add = juNumber - remainder
    position = quotient + 1
    if (add % 2 === 1) {
      position = position - add
    } else {
      position = position + add
    }
  }

  while (position > 12) position -= 12
  while (position < 1) position += 12

  const zhiIdx = (position - 1 + 2) % 12
  return zhiAt(zhiIdx)
}

function calculateTianfuPosition(ziweiZhi: string): string {
  const ziweiIdx = zhiIndex(ziweiZhi)
  const ziweiPos = ((ziweiIdx - 2) % 12 + 12) % 12 + 1
  let tianfuPos = 14 - ziweiPos
  if (tianfuPos > 12) tianfuPos -= 12
  const tianfuIdx = (tianfuPos - 1 + 2) % 12
  return zhiAt(tianfuIdx)
}

// =============================================
// 14주성 배치
// =============================================

function placeMainStars(ziweiZhi: string, tianfuZhi: string): Record<string, string> {
  const result: Record<string, string> = {}
  const ziweiIdx = zhiIndex(ziweiZhi)
  const tianfuIdx = zhiIndex(tianfuZhi)

  for (const [star, offset] of Object.entries(ZIWEI_SERIES_OFFSETS)) {
    result[star] = zhiAt(ziweiIdx + offset)
  }

  for (const [star, offset] of Object.entries(TIANFU_SERIES_OFFSETS)) {
    result[star] = zhiAt(tianfuIdx + offset)
  }

  return result
}

// =============================================
// 보조성 배치
// =============================================

function placeAuxStars(
  yearGan: string, yearZhi: string, lunarMonth: number, hour: number,
): Record<string, string> {
  const result: Record<string, string> = {}
  const hourIdx = hourZhiIndex(hour)

  // 月系星
  result['左輔'] = zhiAt(zhiIndex('辰') + lunarMonth - 1)
  result['右弼'] = zhiAt(zhiIndex('戌') - (lunarMonth - 1))

  // 時系星
  result['文昌'] = zhiAt(zhiIndex('戌') - hourIdx)
  result['文曲'] = zhiAt(zhiIndex('辰') + hourIdx)
  result['地空'] = zhiAt(zhiIndex('亥') - hourIdx)
  result['地劫'] = zhiAt(zhiIndex('亥') + hourIdx)

  // 年干系星
  result['祿存'] = LU_CUN_TABLE[yearGan]
  const luCunIdx = zhiIndex(result['祿存'])
  result['擎羊'] = zhiAt(luCunIdx + 1)
  result['陀羅'] = zhiAt(luCunIdx - 1)

  const [kui, yue] = KUI_YUE_TABLE[yearGan]
  result['天魁'] = kui
  result['天鉞'] = yue

  // 年支+時系星
  const huoStart = HUO_XING_START[yearZhi]
  result['火星'] = zhiAt(zhiIndex(huoStart) + hourIdx)

  const lingStart = LING_XING_START[yearZhi]
  result['鈴星'] = zhiAt(zhiIndex(lingStart) + hourIdx)

  // 年支系星
  result['天馬'] = TIAN_MA_TABLE[yearZhi]

  return result
}

// =============================================
// 사화
// =============================================

function getSiHua(yearGan: string): Record<string, string> {
  const [lu, quan, ke, ji] = SI_HUA_TABLE[yearGan]
  return {
    [lu]: '化祿',
    [quan]: '化權',
    [ke]: '化科',
    [ji]: '化忌',
  }
}

// =============================================
// 밝기
// =============================================

function getBrightness(star: string, zhi: string): string {
  return BRIGHTNESS_TABLE[star]?.[zhi] ?? ''
}

// =============================================
// 메인 명반 생성
// =============================================

export function createChart(
  year: number, month: number, day: number,
  hour: number, minute: number, isMale: boolean,
): ZiweiChart {
  // 1. 음력 변환
  const { lunarYear, lunarMonth, lunarDay, isLeap } = solarToLunar(year, month, day)

  // 2. 년주 간지
  const [yearGan, yearZhi] = getYearGanZhi(lunarYear)

  // 3. 명궁/신궁
  const mingGongZhi = calculateMingGong(lunarMonth, hour)
  const shenGongZhi = calculateShenGong(lunarMonth, hour)

  // 4. 명궁 천간
  const mingGongGan = getPalaceGan(yearGan, mingGongZhi)

  // 5. 오행국
  const wuXingJu = getWuXingJu(mingGongGan, mingGongZhi)

  // 6. 紫微/天府 위치
  const ziweiZhi = calculateZiweiPosition(lunarDay, wuXingJu.number)
  const tianfuZhi = calculateTianfuPosition(ziweiZhi)

  // 7. 14주성 배치
  const mainStars = placeMainStars(ziweiZhi, tianfuZhi)

  // 8. 보조성 배치
  const auxStars = placeAuxStars(yearGan, yearZhi, lunarMonth, hour)

  // 9. 사화
  const siHua = getSiHua(yearGan)

  // 10. 12궁 생성
  const palaces: Record<string, ZiweiPalace> = {}
  const mingIdx = zhiIndex(mingGongZhi)

  for (let i = 0; i < PALACE_NAMES.length; i++) {
    const palaceName = PALACE_NAMES[i]
    const zhi = zhiAt(mingIdx - i)
    const gan = getPalaceGan(yearGan, zhi)

    const stars: ZiweiStar[] = []

    // 주성 추가
    for (const [starName, starZhi] of Object.entries(mainStars)) {
      if (starZhi === zhi) {
        stars.push({
          name: starName,
          brightness: getBrightness(starName, zhi),
          siHua: siHua[starName] || '',
        })
      }
    }

    // 보조성 추가
    for (const [starName, starZhi] of Object.entries(auxStars)) {
      if (starZhi === zhi) {
        stars.push({
          name: starName,
          brightness: '',
          siHua: siHua[starName] || '',
        })
      }
    }

    palaces[palaceName] = {
      name: palaceName,
      zhi,
      gan,
      ganZhi: `${gan}${zhi}`,
      stars,
      isShenGong: zhi === shenGongZhi,
    }
  }

  return {
    solarYear: year,
    solarMonth: month,
    solarDay: day,
    hour,
    minute,
    isMale,
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth: isLeap,
    yearGan,
    yearZhi,
    mingGongZhi,
    shenGongZhi,
    wuXingJu,
    palaces,
    daXianStartAge: wuXingJu.number,
  }
}

// =============================================
// 유년 (流年) 계산
// =============================================

function getLiunianGanZhi(year: number): [string, string] {
  const ganIdx = ((year - 4) % 10 + 10) % 10
  const zhiIdx = ((year - 4) % 12 + 12) % 12
  return [ganAt(ganIdx), zhiAt(zhiIdx)]
}

function getPalaceByZhi(chart: ZiweiChart, zhi: string): ZiweiPalace | null {
  for (const palace of Object.values(chart.palaces)) {
    if (palace.zhi === zhi) return palace
  }
  return null
}

function getCurrentDaxian(chart: ZiweiChart, year: number): [string, number, number] {
  const age = year - chart.solarYear + 1
  const startAge = chart.daXianStartAge
  const mingIdx = zhiIndex(chart.mingGongZhi)

  const isYangGan = ganIndex(chart.yearGan) % 2 === 0
  const direction = (isYangGan && chart.isMale) || (!isYangGan && !chart.isMale) ? 1 : -1

  let daxianNum = Math.floor((age - startAge) / 10)
  if (daxianNum < 0) daxianNum = 0
  if (daxianNum > 11) daxianNum = 11

  const daxianStart = startAge + daxianNum * 10
  const daxianEnd = daxianStart + 9

  const palaceIdx = ((mingIdx + daxianNum * direction) % 12 + 12) % 12
  const palaceZhi = zhiAt(palaceIdx)
  const palace = getPalaceByZhi(chart, palaceZhi)

  return [palace?.name ?? '?', daxianStart, daxianEnd]
}

export function calculateLiunian(chart: ZiweiChart, year: number): LiuNianInfo {
  const [lnGan, lnZhi] = getLiunianGanZhi(year)
  const lnMingZhi = lnZhi

  const natalPalace = getPalaceByZhi(chart, lnMingZhi)
  const natalPalaceName = natalPalace?.name ?? '?'

  const lnSiHua = getSiHua(lnGan)

  // 사화별 궁 위치
  const siHuaPalaces: Record<string, string> = {}
  for (const [starName, huaType] of Object.entries(lnSiHua)) {
    for (const palace of Object.values(chart.palaces)) {
      for (const star of palace.stars) {
        if (star.name === starName) {
          siHuaPalaces[huaType] = palace.name
          break
        }
      }
    }
  }

  // 유년 12궁
  const lnPalaces: Record<string, string> = {}
  const lnMingIdx = zhiIndex(lnMingZhi)
  for (let i = 0; i < PALACE_NAMES.length; i++) {
    lnPalaces[PALACE_NAMES[i]] = zhiAt(lnMingIdx - i)
  }

  // 유월 계산
  const liuyue: LiuYueInfo[] = []
  for (let m = 1; m <= 12; m++) {
    const lyMingIdx = (lnMingIdx + (m - 1)) % 12
    const lyMingZhi = zhiAt(lyMingIdx)
    const lyNatalPalace = getPalaceByZhi(chart, lyMingZhi)
    liuyue.push({
      month: m,
      mingGongZhi: lyMingZhi,
      natalPalaceName: lyNatalPalace?.name ?? '?',
    })
  }

  const [daxianName, daxianStart, daxianEnd] = getCurrentDaxian(chart, year)

  return {
    year,
    gan: lnGan,
    zhi: lnZhi,
    mingGongZhi: lnMingZhi,
    natalPalaceAtMing: natalPalaceName,
    siHua: lnSiHua,
    siHuaPalaces,
    palaces: lnPalaces,
    liuyue,
    daxianPalaceName: daxianName,
    daxianAgeStart: daxianStart,
    daxianAgeEnd: daxianEnd,
  }
}

// 대한 12개 정보 (UI용)
export function getDaxianList(chart: ZiweiChart): Array<{
  ageStart: number; ageEnd: number; palaceName: string; ganZhi: string; mainStars: string[]
}> {
  const startAge = chart.daXianStartAge
  const mingIdx = zhiIndex(chart.mingGongZhi)
  const isYangGan = ganIndex(chart.yearGan) % 2 === 0
  const direction = (isYangGan && chart.isMale) || (!isYangGan && !chart.isMale) ? 1 : -1

  const result: Array<{
    ageStart: number; ageEnd: number; palaceName: string; ganZhi: string; mainStars: string[]
  }> = []

  const mainStarNames = new Set([
    '紫微', '天機', '太陽', '武曲', '天同', '廉貞',
    '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍',
  ])

  for (let i = 0; i < 12; i++) {
    const ageStart = startAge + i * 10
    const ageEnd = ageStart + 9
    const palaceIdx = ((mingIdx + i * direction) % 12 + 12) % 12
    const palaceZhi = zhiAt(palaceIdx)
    const palace = getPalaceByZhi(chart, palaceZhi)

    if (palace) {
      const mainStars = palace.stars
        .filter(s => mainStarNames.has(s.name))
        .map(s => s.name)
      result.push({
        ageStart, ageEnd,
        palaceName: palace.name,
        ganZhi: palace.ganZhi,
        mainStars,
      })
    }
  }

  return result
}
