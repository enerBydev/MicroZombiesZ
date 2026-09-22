// Bullet — proyectil del jugador o de un spitter.

import type { Vec2 } from '../value-objects/vec2'
import { vadd, vscale } from '../value-objects/vec2'

export interface BulletOptions {
  position: Vec2
  velocity: Vec2
  damage: number
  ttl: number
  radius: number
  from: 'player' | 'zombie'
  color: string
}

export class Bullet {
  position: Vec2
  readonly velocity: Vec2
  readonly damage: number
  readonly radius: number
  readonly from: 'player' | 'zombie'
  readonly color: string
  private _ttl: number

  constructor(o: BulletOptions) {
    this.position = { ...o.position }
    this.velocity = { ...o.velocity }
    this.damage = o.damage
    this.radius = o.radius
    this.from = o.from
    this.color = o.color
    this._ttl = o.ttl
  }

  step(dt: number): void {
    this.position = vadd(this.position, vscale(this.velocity, dt))
    this._ttl -= dt
  }

  get isExpired(): boolean {
    return this._ttl <= 0
  }

  /** Expira la bala de inmediato (impacto registrado). */
  expire(): void {
    this._ttl = 0
  }
}
