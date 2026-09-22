// Vec2 — value object matemático puro (funciones, sin clases: KISS).

export interface Vec2 { readonly x: number; readonly y: number }

export const vec2 = (x = 0, y = 0): Vec2 => ({ x, y })

export const vadd = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y })
export const vsub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
export const vscale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s })
export const vlen = (a: Vec2): number => Math.hypot(a.x, a.y)

export const vnormalize = (a: Vec2): Vec2 => {
  const l = Math.hypot(a.x, a.y)
  return l === 0 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l }
}

export const vdist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y)

export const vfromAngle = (angle: number, len = 1): Vec2 => ({
  x: Math.cos(angle) * len,
  y: Math.sin(angle) * len
})

export const vclampToRect = (v: Vec2, r: Bounds2): Vec2 => ({
  x: Math.min(Math.max(v.x, r.minX), r.maxX),
  y: Math.min(Math.max(v.y, r.minY), r.maxY)
})

export interface Bounds2 { minX: number; minY: number; maxX: number; maxY: number }

export const boundsOf = (a: { width: number; height: number }): Bounds2 => ({
  minX: 0, minY: 0, maxX: a.width, maxY: a.height
})
