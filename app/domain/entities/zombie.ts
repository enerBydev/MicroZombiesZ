// Zombie — entidad con vida, cooldown de ataque melee y de escupitajo.

import type { ZombieConfig } from '../types'
import type { Vec2 } from '../value-objects/vec2'
import { Health } from '../value-objects/health'

export class Zombie {
  readonly id: number
  readonly kind: ZombieConfig['kind']
  readonly config: ZombieConfig
  position: Vec2
  readonly health: Health
  private attackTimer = 0
  private spitTimer = 0

  constructor(id: number, config: ZombieConfig, position: Vec2, hpMultiplier = 1) {
    this.id = id
    this.kind = config.kind
    this.config = config
    this.position = { ...position }
    this.health = Health.of(Math.ceil(config.health * hpMultiplier), Math.ceil(config.health * hpMultiplier))
  }

  get isDead(): boolean {
    return this.health.isDead
  }

  get moneyReward(): number {
    return this.config.moneyReward
  }

  get scoreReward(): number {
    return this.config.scoreReward
  }

  takeDamage(amount: number): void {
    this.health.damage(amount)
  }

  tickTimers(dt: number): void {
    if (this.attackTimer > 0) this.attackTimer = Math.max(0, this.attackTimer - dt)
    if (this.spitTimer > 0) this.spitTimer = Math.max(0, this.spitTimer - dt)
  }

  /** Intenta ataque melee: true si estaba listo (y arranca el cooldown). */
  requestMelee(_dt: number): boolean {
    if (this.attackTimer > 0) return false
    this.attackTimer = this.config.attackCooldown
    return true
  }

  spitReady(): boolean {
    return Boolean(this.config.ranged) && this.spitTimer <= 0
  }

  markSpit(): void {
    if (this.config.ranged) this.spitTimer = this.config.ranged.cooldown
  }
}
