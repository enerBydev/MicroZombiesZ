// Utilidades de aleatoriedad (puras, sin DOM). SeededRandom (mulberry32)
// da determinismo para tests y replays; MathRandom es el default del juego.

import type { RandomSource } from '../ports'

export class SeededRandom implements RandomSource {
  private s: number

  constructor(seed = 42) {
    this.s = seed >>> 0
  }

  next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0
    let t = this.s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  range(a: number, b: number): number {
    return a + (b - a) * this.next()
  }

  angle(): number {
    return this.next() * Math.PI * 2
  }
}

export class MathRandom implements RandomSource {
  next(): number {
    return Math.random()
  }
}

export const rngRange = (rng: RandomSource, a: number, b: number): number => a + (b - a) * rng.next()
