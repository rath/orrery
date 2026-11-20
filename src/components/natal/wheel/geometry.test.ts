import { describe, expect, it } from 'vitest'
import { angleToPoint, lonToAngle, spreadAngles } from './geometry.ts'

describe('natal wheel orientation', () => {
  it('puts the ascendant on the left and increasing longitude below the horizon', () => {
    const asc = 345
    const points = [0, 90, 180, 270].map(offset => angleToPoint(lonToAngle((asc + offset) % 360, asc), 1))
    const expected = [[-1, 0], [0, 1], [1, 0], [0, -1]]
    points.forEach((point, i) => {
      expect(point.x).toBeCloseTo(expected[i][0])
      expect(point.y).toBeCloseTo(expected[i][1])
    })
  })
})

describe('circular label placement', () => {
  it('preserves the original order and leaves isolated labels on their longitudes', () => {
    expect(spreadAngles([200, 75, 310], 15)).toEqual([200, 75, 310])
    expect(spreadAngles([], 15)).toEqual([])
  })

  it('shares the displacement across the 0° seam', () => {
    expect(spreadAngles([1, 180, 359], 16)).toEqual([8, 180, 352])
  })

  it('keeps crowded and coincident labels in order with room on both sides', () => {
    const angles = [0, 0, 0.01, 2, 4, 5, 14, 170, 293, 351, 355, 358, 359, 359.5]
    const before = [...angles]
    const placed = spreadAngles(angles, 15)
    const gaps = placed.map((current, i) => (placed[(i + 1) % placed.length] - current + 360) % 360)
    gaps.forEach(gap => expect(gap).toBeGreaterThanOrEqual(15 - 1e-9))
    expect(gaps.reduce((sum, gap) => sum + gap, 0)).toBeCloseTo(360)
    expect(angles).toEqual(before)
  })
})
