/**
 * 서양 점성술 Natal Chart 계산 엔진
 *
 * Pure TypeScript ephemeris (Moshier 이론 기반).
 * 외부 데이터 파일이나 WASM 없이 브라우저에서 동기 실행 가능.
 */
import type {
  BirthInput, ZodiacSign, PlanetId, PlanetPosition,
  NatalHouse, NatalAngles, AspectType, NatalAspect, NatalChart,
} from './types.ts'
import { julday, calcPlanet, calcHouses } from './ephemeris/index.ts'

export { isKoreanDaylightTime } from './kdt.ts'

// =============================================
// 상수
// =============================================

const DEFAULT_LAT = 37.5194
const DEFAULT_LON = 127.0992

export const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

export const ZODIAC_SYMBOLS: Record<ZodiacSign, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
}

export const ZODIAC_KO: Record<ZodiacSign, string> = {
  Aries: '양자리', Taurus: '황소자리', Gemini: '쌍둥이자리', Cancer: '게자리',
  Leo: '사자자리', Virgo: '처녀자리', Libra: '천칭자리', Scorpio: '전갈자리',
  Sagittarius: '궁수자리', Capricorn: '염소자리', Aquarius: '물병자리', Pisces: '물고기자리',
}

export const PLANET_SYMBOLS: Record<PlanetId, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅',
  Neptune: '♆', Pluto: '♇', Chiron: '⚷',
  NorthNode: '☊', SouthNode: '☋',
}

export const PLANET_KO: Record<PlanetId, string> = {
  Sun: '태양', Moon: '달', Mercury: '수성', Venus: '금성',
  Mars: '화성', Jupiter: '목성', Saturn: '토성', Uranus: '천왕성',
  Neptune: '해왕성', Pluto: '명왕성', Chiron: '키론',
  NorthNode: '북교점', SouthNode: '남교점',
}

/** PlanetId → swisseph body number 매핑 (SouthNode 제외 — 수동 계산) */
const PLANET_BODIES: [PlanetId, number][] = [
  ['Sun', 0],       // SE_SUN
  ['Moon', 1],      // SE_MOON
  ['Mercury', 2],   // SE_MERCURY
  ['Venus', 3],     // SE_VENUS
  ['Mars', 4],      // SE_MARS
  ['Jupiter', 5],   // SE_JUPITER
  ['Saturn', 6],    // SE_SATURN
  ['Uranus', 7],    // SE_URANUS
  ['Neptune', 8],   // SE_NEPTUNE
  ['Pluto', 9],     // SE_PLUTO
  ['Chiron', 15],   // SE_CHIRON
  ['NorthNode', 10], // SE_MEAN_NODE
]

export const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
}

const ASPECT_DEFS: { type: AspectType; angle: number; maxOrb: number }[] = [
  { type: 'conjunction', angle: 0, maxOrb: 8 },
  { type: 'sextile', angle: 60, maxOrb: 6 },
  { type: 'square', angle: 90, maxOrb: 8 },
  { type: 'trine', angle: 120, maxOrb: 8 },
  { type: 'opposition', angle: 180, maxOrb: 8 },
]

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

/** 하우스 시스템: [swisseph char, 표시 이름] */
export const HOUSE_SYSTEMS: [string, string][] = [
  ['P', 'Placidus'],
  ['K', 'Koch'],
  ['O', 'Porphyrius'],
  ['R', 'Regiomontanus'],
  ['C', 'Campanus'],
  ['E', 'Equal'],
  ['W', 'Whole Sign'],
  ['B', 'Alcabitus'],
  ['M', 'Morinus'],
  ['T', 'Topocentric'],
]

// =============================================
// 유틸리티
// =============================================

/** longitude → ZodiacSign */
export function lonToSign(lon: number): ZodiacSign {
  return ZODIAC_SIGNS[Math.trunc(normalizeDeg(lon) / 30)]
}

/** 0~360 정규화 (음수 모듈로 처리) */
export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/** 경도에서 별자리 내 도수 */
function degreeInSign(lon: number): number {
  return normalizeDeg(lon) % 30
}

/** 두 경도 사이 각도 차이 (0~180) */
function angularDifference(lon1: number, lon2: number): number {
  let diff = Math.abs(normalizeDeg(lon1) - normalizeDeg(lon2))
  if (diff > 180) diff = 360 - diff
  return diff
}

/** 도수를 DD°MM' 형식으로 포맷 */
export function formatDegree(lon: number): string {
  const d = degreeInSign(lon)
  const deg = Math.trunc(d)
  const min = Math.trunc((d - deg) * 60)
  return `${deg}°${String(min).padStart(2, '0')}'`
}

/** 행성이 어느 하우스에 속하는지 판정 (cusps는 1-indexed: cusps[1]~cusps[12]) */
function findHouse(planetLon: number, cusps: number[]): number {
  const lon = normalizeDeg(planetLon)
  for (let i = 1; i <= 12; i++) {
    const start = normalizeDeg(cusps[i])
    const end = normalizeDeg(cusps[i === 12 ? 1 : i + 1])
    if (start < end) {
      if (lon >= start && lon < end) return i
    } else {
      // 0° 경계를 넘는 경우
      if (lon >= start || lon < end) return i
    }
  }
  return 1
}

/** 특정 UTC 시각에서 주어진 타임존의 오프셋(분 단위)을 반환 */
function getTimezoneOffsetMinutes(date: Date, timezone: string): number {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' })
  const tzStr = date.toLocaleString('en-US', { timeZone: timezone })
  return (new Date(tzStr).getTime() - new Date(utcStr).getTime()) / 60_000
}

/** 한국 현지 시각 → UTC 오프셋(시간)을 반환. KST=9, KDT=10. */
function getSeoulUtcOffsetHours(
  year: number, month: number, day: number,
  hour: number, minute: number,
): number {
  // KST(+9)를 초기 추정치로 사용하여 UTC 시각을 근사
  const guessUtcMs = Date.UTC(year, month - 1, day, hour, minute) - 9 * 3_600_000
  const offsetMin = getTimezoneOffsetMinutes(new Date(guessUtcMs), 'Asia/Seoul')
  return offsetMin / 60
}

/** 모든 행성 쌍의 메이저 애스펙트 계산 */
function calculateAspects(planets: PlanetPosition[]): NatalAspect[] {
  const aspects: NatalAspect[] = []
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i]
      const p2 = planets[j]
      const diff = angularDifference(p1.longitude, p2.longitude)
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle)
        if (orb <= def.maxOrb) {
          aspects.push({
            planet1: p1.id,
            planet2: p2.id,
            type: def.type,
            angle: def.angle,
            orb: Math.round(orb * 10) / 10,
          })
        }
      }
    }
  }
  aspects.sort((a, b) => a.orb - b.orb)
  return aspects
}

// =============================================
// 메인 계산
// =============================================

export async function calculateNatal(input: BirthInput, houseSystem = 'P'): Promise<NatalChart> {
  const lat = input.latitude ?? DEFAULT_LAT
  const lon = input.longitude ?? DEFAULT_LON

  // 한국 현지 시각 → UT 변환 (KST=+9, KDT=+10)
  const offsetHours = getSeoulUtcOffsetHours(
    input.year, input.month, input.day, input.hour, input.minute,
  )
  const utHourDecimal = input.hour + input.minute / 60 - offsetHours
  let utYear = input.year
  let utMonth = input.month
  let utDay = input.day
  let utHour = utHourDecimal
  if (utHour < 0) {
    utHour += 24
    // 날짜 롤백
    const d = new Date(utYear, utMonth - 1, utDay - 1)
    utYear = d.getFullYear()
    utMonth = d.getMonth() + 1
    utDay = d.getDate()
  } else if (utHour >= 24) {
    utHour -= 24
    const d = new Date(utYear, utMonth - 1, utDay + 1)
    utYear = d.getFullYear()
    utMonth = d.getMonth() + 1
    utDay = d.getDate()
  }
  const jd = julday(utYear, utMonth, utDay, utHour)

  // 하우스 계산
  const { cusps, ascmc } = calcHouses(jd, lat, lon, houseSystem)

  // 행성 위치 계산
  const planets: PlanetPosition[] = []
  for (const [id, bodyNum] of PLANET_BODIES) {
    const pos = calcPlanet(jd, bodyNum)
    planets.push({
      id,
      longitude: pos.longitude,
      latitude: pos.latitude,
      speed: pos.longitudeSpeed,
      sign: lonToSign(pos.longitude),
      degreeInSign: degreeInSign(pos.longitude),
      isRetrograde: pos.longitudeSpeed < 0,
      house: findHouse(pos.longitude, cusps),
    })
  }

  // SouthNode = NorthNode + 180°
  const northNode = planets.find(p => p.id === 'NorthNode')!
  const southLon = normalizeDeg(northNode.longitude + 180)
  planets.push({
    id: 'SouthNode',
    longitude: southLon,
    latitude: -northNode.latitude,
    speed: northNode.speed,
    sign: lonToSign(southLon),
    degreeInSign: degreeInSign(southLon),
    isRetrograde: false,
    house: findHouse(southLon, cusps),
  })

  // 하우스 배열 구축
  const houses: NatalHouse[] = []
  for (let i = 1; i <= 12; i++) {
    const cuspLon = cusps[i]
    houses.push({
      number: i,
      cuspLongitude: cuspLon,
      sign: lonToSign(cuspLon),
      degreeInSign: degreeInSign(cuspLon),
    })
  }

  // 앵글
  const ascLon = ascmc[0]
  const mcLon = ascmc[1]
  const descLon = normalizeDeg(ascLon + 180)
  const icLon = normalizeDeg(mcLon + 180)
  const angles: NatalAngles = {
    asc: { longitude: ascLon, sign: lonToSign(ascLon), degreeInSign: degreeInSign(ascLon) },
    mc: { longitude: mcLon, sign: lonToSign(mcLon), degreeInSign: degreeInSign(mcLon) },
    desc: { longitude: descLon, sign: lonToSign(descLon), degreeInSign: degreeInSign(descLon) },
    ic: { longitude: icLon, sign: lonToSign(icLon), degreeInSign: degreeInSign(icLon) },
  }

  // 애스펙트 (SouthNode 제외 — 관례상 NorthNode만 사용)
  const aspectPlanets = planets.filter(p => p.id !== 'SouthNode')
  const aspects = calculateAspects(aspectPlanets)

  return { input, planets, houses, angles, aspects }
}
