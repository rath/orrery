/**
 * 서양 점성술 Natal Chart 계산 엔진
 *
 * 자체 구현한 순수 TypeScript 천체력(`./ephemeris`)을 사용한다.
 * 외부 데이터 파일이나 WASM 없이 브라우저에서 동기 실행 가능.
 */
import type {
  BirthInput, ZodiacSign, PlanetId, PlanetPosition,
  NatalHouse, NatalAngles, AspectType, NatalAspect, NatalChart,
} from './types.ts'
import { eclipticPosition, housesAt, isAvailable, julianDay } from './ephemeris/index.ts'
import type { Body, HouseSystem, Houses } from './ephemeris/index.ts'
import { birthInputToUtcDate, getBirthTimezone } from './timezone.ts'
import { assertBirthInput } from './validation.ts'

export { isKoreanDaylightTime } from './kdt.ts'
export { isKoreanHistoricalTimeAnomaly } from './timezone.ts'

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
  NorthNode: '☊', SouthNode: '☋', Fortuna: '⊕',
}

export const PLANET_KO: Record<PlanetId, string> = {
  Sun: '태양', Moon: '달', Mercury: '수성', Venus: '금성',
  Mars: '화성', Jupiter: '목성', Saturn: '토성', Uranus: '천왕성',
  Neptune: '해왕성', Pluto: '명왕성', Chiron: '키론',
  NorthNode: '북교점', SouthNode: '남교점', Fortuna: '행운점',
}

/** PlanetId → 천체력 천체 매핑 (SouthNode, Fortuna 제외 — 파생 포인트) */
const PLANET_BODIES: [PlanetId, Body][] = [
  ['Sun', 'Sun'],
  ['Moon', 'Moon'],
  ['Mercury', 'Mercury'],
  ['Venus', 'Venus'],
  ['Mars', 'Mars'],
  ['Jupiter', 'Jupiter'],
  ['Saturn', 'Saturn'],
  ['Uranus', 'Uranus'],
  ['Neptune', 'Neptune'],
  ['Pluto', 'Pluto'],
  ['Chiron', 'Chiron'],
  ['NorthNode', 'MeanNode'], // 평균 교점
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

/** 하우스 시스템: [한 글자 코드, 표시 이름] */
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

const DEG_TO_RAD = Math.PI / 180

/** Geometric solar center above the horizon, independent of house divisions. */
function isDaytime(sun: PlanetPosition, latitude: number, houses: Houses): boolean {
  const obliquity = houses.obliquity * DEG_TO_RAD
  const lon = sun.longitude * DEG_TO_RAD
  const lat = sun.latitude * DEG_TO_RAD
  // 황도 좌표 → 적도 직교 좌표
  const x = Math.cos(lat) * Math.cos(lon)
  const y = Math.cos(lat) * Math.sin(lon) * Math.cos(obliquity) - Math.sin(lat) * Math.sin(obliquity)
  const z = Math.cos(lat) * Math.sin(lon) * Math.sin(obliquity) + Math.sin(lat) * Math.cos(obliquity)
  // 천정 방향과의 내적 = sin(고도)
  const phi = latitude * DEG_TO_RAD
  const theta = houses.ramc * DEG_TO_RAD
  return Math.cos(phi) * (x * Math.cos(theta) + y * Math.sin(theta)) + Math.sin(phi) * z >= 0
}

/** 도수를 DD°MM' 형식으로 포맷 */
export function formatDegree(lon: number): string {
  const d = degreeInSign(lon)
  const deg = Math.trunc(d)
  const min = Math.trunc((d - deg) * 60)
  return `${deg}°${String(min).padStart(2, '0')}'`
}

/** 행성이 어느 하우스(1~12)에 속하는지 판정 (cusps[0]이 1하우스 시작점) */
function findHouse(planetLon: number, cusps: number[]): number {
  const lon = normalizeDeg(planetLon)
  for (let i = 0; i < 12; i++) {
    const start = normalizeDeg(cusps[i])
    const end = normalizeDeg(cusps[(i + 1) % 12])
    if (start < end) {
      if (lon >= start && lon < end) return i + 1
    } else {
      // 0° 경계를 넘는 경우
      if (lon >= start || lon < end) return i + 1
    }
  }
  return 1
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
  assertBirthInput(input)
  houseSystem = typeof houseSystem === 'string' ? houseSystem.toUpperCase() : ''
  if (!HOUSE_SYSTEMS.some(([code]) => code === houseSystem)) {
    throw new RangeError(`Unsupported house system: ${houseSystem}`)
  }
  const lat = input.latitude ?? DEFAULT_LAT
  const lon = input.longitude ?? DEFAULT_LON
  const unknownTime = !!input.unknownTime

  // 시간 모름이면 정오(12:00) 기준으로 계산 (행성 오차 최소화)
  const hour = unknownTime ? 12 : input.hour
  const minute = unknownTime ? 0 : input.minute
  const timezone = getBirthTimezone(input)

  const utcDate = birthInputToUtcDate(
    input.year, input.month, input.day, hour, minute, timezone,
  )
  const utYear = utcDate.getUTCFullYear()
  const utMonth = utcDate.getUTCMonth() + 1
  const utDay = utcDate.getUTCDate()
  const utHour = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600
  const jd = julianDay(utYear, utMonth, utDay, utHour)

  // 하우스 계산 (시간 모름이면 생략). 극지방에서는 요청한 방식 대신 Porphyry가 쓰일 수 있다.
  const houseResult = unknownTime ? null : housesAt(jd, lat, lon, houseSystem as HouseSystem)
  const cusps = houseResult?.cusps ?? null
  if (houseResult) houseSystem = houseResult.system

  // 행성 위치 계산 (Chiron은 천체력이 다루는 1900~2099년에만 포함)
  const planets: PlanetPosition[] = []
  for (const [id, body] of PLANET_BODIES) {
    if (body === 'Chiron' && !isAvailable(body, jd)) continue
    const pos = eclipticPosition(body, jd)
    planets.push({
      id,
      longitude: pos.longitude,
      latitude: pos.latitude,
      speed: pos.speed,
      sign: lonToSign(pos.longitude),
      degreeInSign: degreeInSign(pos.longitude),
      isRetrograde: pos.speed < 0,
      ...(cusps ? { house: findHouse(pos.longitude, cusps) } : {}),
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
    isRetrograde: northNode.speed < 0,
    ...(cusps ? { house: findHouse(southLon, cusps) } : {}),
  })

  // Fortuna (Part of Fortune) — ASC 필요하므로 시간을 알 때만 계산
  if (houseResult) {
    const ascLon = houseResult.ascendant
    const sun = planets.find(p => p.id === 'Sun')!
    const moon = planets.find(p => p.id === 'Moon')!
    // Whole Sign/Morinus 등의 하우스 경계는 실제 지평선과 일치하지 않는다.
    const isDayChart = isDaytime(sun, lat, houseResult)
    const fortunaLon = isDayChart
      ? normalizeDeg(ascLon + moon.longitude - sun.longitude)
      : normalizeDeg(ascLon + sun.longitude - moon.longitude)
    planets.push({
      id: 'Fortuna',
      longitude: fortunaLon,
      latitude: 0,
      speed: 0,
      sign: lonToSign(fortunaLon),
      degreeInSign: degreeInSign(fortunaLon),
      isRetrograde: false,
      house: findHouse(fortunaLon, cusps!),
    })
  }

  // 하우스 배열 구축
  const houses: NatalHouse[] = []
  if (cusps) {
    for (let i = 0; i < 12; i++) {
      const cuspLon = cusps[i]
      houses.push({
        number: i + 1,
        cuspLongitude: cuspLon,
        sign: lonToSign(cuspLon),
        degreeInSign: degreeInSign(cuspLon),
      })
    }
  }

  // 앵글
  let angles: NatalAngles | null = null
  if (houseResult) {
    const ascLon = houseResult.ascendant
    const mcLon = houseResult.midheaven
    const descLon = normalizeDeg(ascLon + 180)
    const icLon = normalizeDeg(mcLon + 180)
    angles = {
      asc: { longitude: ascLon, sign: lonToSign(ascLon), degreeInSign: degreeInSign(ascLon) },
      mc: { longitude: mcLon, sign: lonToSign(mcLon), degreeInSign: degreeInSign(mcLon) },
      desc: { longitude: descLon, sign: lonToSign(descLon), degreeInSign: degreeInSign(descLon) },
      ic: { longitude: icLon, sign: lonToSign(icLon), degreeInSign: degreeInSign(icLon) },
    }
  }

  // 애스펙트 (SouthNode, Fortuna 제외 — 파생 포인트)
  const aspectPlanets = planets.filter(p => p.id !== 'SouthNode' && p.id !== 'Fortuna')
  const aspects = calculateAspects(aspectPlanets)

  return { input, planets, houses, angles, aspects, houseSystem }
}
