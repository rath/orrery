/**
 * Natal Chart Wheel — 좌표 수학, 상수, 행성 클러스터링
 */

// =============================================
// SVG 좌표계 상수
// =============================================

export const CX = 300
export const CY = 300
export const R_OUTER = 280       // 최외곽 (눈금)
export const R_ZODIAC_INNER = 230 // 별자리 밴드 안쪽
export const R_PLANET = 195      // 행성 심볼 배치
export const R_HOUSE_LABEL = 140 // 하우스 번호 배치
export const R_INNER = 100      // 내원 (애스펙트 영역 경계)

// =============================================
// 좌표 변환
// =============================================

/**
 * 황경(longitude)을 SVG 각도(도)로 변환.
 * ASC를 9시 방향(180°)에 배치하는 전통 레이아웃.
 * 반시계 방향 진행 (별자리 순서).
 */
export function lonToAngle(lon: number, ascLon: number): number {
  return ((180 - (lon - ascLon)) % 360 + 360) % 360
}

/**
 * 각도(도)와 반지름으로 SVG 좌표 산출.
 * 수학 좌표계 (반시계방향, y축 반전).
 */
export function angleToPoint(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CX + r * Math.cos(rad),
    y: CY - r * Math.sin(rad),
  }
}

/**
 * 황경 → SVG 좌표 (단축)
 */
export function lonToPoint(lon: number, ascLon: number, r: number): { x: number; y: number } {
  return angleToPoint(lonToAngle(lon, ascLon), r)
}

// =============================================
// 행성 클러스터링
// =============================================

export interface SpreadResult {
  id: string
  /** 실제 황경 */
  actualLon: number
  /** 표시 각도 (spread 적용 후) */
  displayAngle: number
  /** 실제 각도 (spread 전) */
  actualAngle: number
}

/**
 * 인접 행성이 minSpread 미만으로 가까울 때,
 * 클러스터 중심 기준으로 균등 분산하여 겹침을 방지.
 */
export function spreadPlanets(
  items: { id: string; lon: number }[],
  ascLon: number,
  minSpread = 8,
): SpreadResult[] {
  if (items.length === 0) return []

  // 각도 계산 후 정렬
  const withAngle = items.map(item => ({
    id: item.id,
    actualLon: item.lon,
    actualAngle: lonToAngle(item.lon, ascLon),
    displayAngle: lonToAngle(item.lon, ascLon),
  }))

  withAngle.sort((a, b) => a.actualAngle - b.actualAngle)

  // 클러스터 감지 & 분산 (반복 패스)
  for (let pass = 0; pass < 5; pass++) {
    let changed = false
    let i = 0
    while (i < withAngle.length) {
      // 현재 위치에서 클러스터 찾기
      let j = i + 1
      while (j < withAngle.length) {
        const gap = withAngle[j].displayAngle - withAngle[j - 1].displayAngle
        if (gap < minSpread) {
          j++
        } else {
          break
        }
      }
      const clusterSize = j - i
      if (clusterSize > 1) {
        // 클러스터 중심 계산
        const center =
          withAngle.slice(i, j).reduce((sum, p) => sum + p.displayAngle, 0) / clusterSize
        // 균등 분산
        const totalSpan = (clusterSize - 1) * minSpread
        const start = center - totalSpan / 2
        for (let k = 0; k < clusterSize; k++) {
          const newAngle = start + k * minSpread
          if (withAngle[i + k].displayAngle !== newAngle) {
            withAngle[i + k].displayAngle = newAngle
            changed = true
          }
        }
      }
      i = j
    }
    if (!changed) break
    // 재정렬
    withAngle.sort((a, b) => a.displayAngle - b.displayAngle)
  }

  return withAngle
}

// =============================================
// SVG Arc 경로 유틸
// =============================================

/**
 * 두 각도 사이의 원호(arc) SVG path data.
 * startAngle → endAngle 방향 (반시계).
 */
export function arcPath(startAngle: number, endAngle: number, r: number): string {
  const start = angleToPoint(startAngle, r)
  const end = angleToPoint(endAngle, r)
  // 호의 각도 크기 결정
  const sweep = ((endAngle - startAngle) % 360 + 360) % 360
  const largeArc = sweep > 180 ? 1 : 0
  // SVG arc는 시계 반대 방향이 sweep=0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}
