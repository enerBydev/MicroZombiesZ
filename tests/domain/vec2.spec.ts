import { describe, expect, it } from 'vitest'
import { SeededRandom } from '../../app/domain/utils/random'
import {
  vadd, vdist, vfromAngle, vlen, vnormalize, vscale, vsub, vclampToRect
} from '../../app/domain/value-objects/vec2'

describe('Vec2 (value object matemático puro)', () => {
  it('suma, resta y escalado', () => {
    expect(vadd({ x: 1, y: 2 }, { x: 3, y: -1 })).toEqual({ x: 4, y: 1 })
    expect(vsub({ x: 3, y: -1 }, { x: 1, y: 2 })).toEqual({ x: 2, y: -3 })
    expect(vscale({ x: 2, y: -3 }, 2)).toEqual({ x: 4, y: -6 })
  })

  it('longitud y normalización (sin NaN en vector cero)', () => {
    expect(vlen({ x: 3, y: 4 })).toBe(5)
    expect(vnormalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 })
    const n = vnormalize({ x: 3, y: 4 })
    expect(n.x).toBeCloseTo(0.6)
    expect(n.y).toBeCloseTo(0.8)
  })

  it('distancia euclídea', () => {
    expect(vdist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it('fromAngle construye direcciones', () => {
    expect(vfromAngle(0, 2)).toEqual({ x: 2, y: 0 })
    expect(vfromAngle(Math.PI / 2, 1).y).toBeCloseTo(1)
  })

  it('clamp a rectángulo (arena)', () => {
    const arena = { minX: 0, minY: 0, maxX: 100, maxY: 50 }
    expect(vclampToRect({ x: -5, y: 60 }, arena)).toEqual({ x: 0, y: 50 })
    expect(vclampToRect({ x: 50, y: 25 }, arena)).toEqual({ x: 50, y: 25 })
  })

  it('SeededRandom es determinista y está en [0,1)', () => {
    const a = new SeededRandom(7)
    const b = new SeededRandom(7)
    for (let i = 0; i < 50; i++) {
      const va = a.next()
      expect(va).toBe(b.next())
      expect(va).toBeGreaterThanOrEqual(0)
      expect(va).toBeLessThan(1)
    }
  })
})
