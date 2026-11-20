import { normalizeDeg } from '@orrery/core/natal'

// 반지름은 모두 같은 SVG 좌표계에서 잰다. 원점은 휠 중심이다.
export const R_RIM = 284
export const R_ZODIAC = 231
export const R_SCALE = 221
export const R_PLANET = 190
export const R_HOUSES = 157
export const R_ASPECT = 130

/** ASC는 왼쪽, 황경과 하우스 번호는 거기서 반시계 방향으로 증가한다. */
export function lonToAngle(longitude: number, ascendant: number): number {
  return normalizeDeg(180 + longitude - ascendant)
}

export function angleToPoint(angle: number, radius: number) {
  const radians = angle * Math.PI / 180
  return { x: radius * Math.cos(radians), y: -radius * Math.sin(radians) }
}

export function radialLine(angle: number, from: number, to: number): string {
  const start = angleToPoint(angle, from)
  const end = angleToPoint(angle, to)
  return `M${start.x.toFixed(2)},${start.y.toFixed(2)}L${end.x.toFixed(2)},${end.y.toFixed(2)}`
}

/**
 * 양쪽 이웃에게 필요한 자리를 반씩 양보한다. 양 방향 모두 원을 한 바퀴
 * 훑으므로 359°와 1°도 이웃이다. 반환값은 원래 입력 순서의 표시 각도다.
 */
export function spreadAngles(angles: number[], minimumGap: number): number[] {
  const sorted = angles.map((angle, index) => ({ angle: normalizeDeg(angle), index }))
    .sort((a, b) => a.angle - b.angle)
  const count = sorted.length
  const gap = Math.min(minimumGap, 360 / count)
  const result = new Array<number>(count)

  sorted.forEach(({ angle, index }, i) => {
    let forward = angle
    let backward = angle
    for (let step = 1; step < count; step++) {
      const left = i - step
      const right = i + step
      const before = sorted[(left + count) % count].angle - (left < 0 ? 360 : 0)
      const after = sorted[right % count].angle + (right >= count ? 360 : 0)
      forward = Math.max(forward, before + step * gap)
      backward = Math.min(backward, after - step * gap)
    }
    result[index] = normalizeDeg((forward + backward) / 2)
  })
  return result
}
