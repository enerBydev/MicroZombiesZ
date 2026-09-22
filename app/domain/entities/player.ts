// Player — entidad central: vida, dinero e inventario de WeaponStrategy.
// Invariantes: la vida nunca sale de [0, max]; el dinero nunca es negativo;
// no se puede disparar sin munición ni comprar sin fondos.

import type { Vec2 } from '../value-objects/vec2'
import { vadd, vclampToRect, vnormalize, vscale } from '../value-objects/vec2'
import type { Bounds2 } from '../value-objects/vec2'
import { Health } from '../value-objects/health'
import { Money } from '../value-objects/money'
import type { Bullet } from './bullet'
import { PISTOL, type WeaponStrategy } from '../strategies/weapons'
import type { RandomSource } from '../ports'

export interface PlayerConfig {
  position: Vec2
  speed: number
  maxHealth: number
  radius: number
  startingMoney: number
}

export const HEALTH_PACK = 40
export const HEALTH_COST = 60

export class Player {
  position: Vec2
  aim: Vec2 = { x: 1, y: 0 }
  readonly health: Health
  readonly money: Money
  readonly radius: number
  readonly speed: number
  private loadout: WeaponStrategy[]
  private current = 0
  private ammo: Record<string, number> = {}
  private fireCooldown = 0

  constructor(cfg: PlayerConfig) {
    this.position = { ...cfg.position }
    this.speed = cfg.speed
    this.radius = cfg.radius
    this.health = Health.full(cfg.maxHealth)
    this.money = Money.of(cfg.startingMoney)
    this.loadout = [PISTOL()]
    this.ammo[this.loadout[0].stats.id] = Number.POSITIVE_INFINITY
  }

  get isDead(): boolean {
    return this.health.isDead
  }

  get weapon(): WeaponStrategy {
    return this.loadout[this.current]
  }

  get owned(): WeaponStrategy[] {
    return [...this.loadout]
  }

  get fireCooldownLeft(): number {
    return this.fireCooldown
  }

  takeDamage(amount: number): void {
    this.health.damage(amount)
  }

  move(dir: Vec2, dt: number, bounds: Bounds2): void {
    const n = vnormalize(dir)
    const delta = vscale(n, this.speed * dt)
    this.position = vclampToRect(vadd(this.position, delta), bounds)
  }

  setAim(a: Vec2): void {
    const n = vnormalize(a)
    if (n.x !== 0 || n.y !== 0) this.aim = n
  }

  tickCooldown(dt: number): void {
    if (this.fireCooldown > 0) this.fireCooldown = Math.max(0, this.fireCooldown - dt)
  }

  canFire(): boolean {
    const s = this.weapon.stats
    return this.fireCooldown <= 0 && (s.infiniteAmmo || (this.ammo[s.id] ?? 0) > 0)
  }

  /** Dispara con el arma actual. Devuelve null si no está lista o sin munición. */
  fire(rng: RandomSource): Bullet[] | null {
    if (!this.canFire()) return null
    const w = this.weapon
    if (!w.stats.infiniteAmmo) this.ammo[w.stats.id] = (this.ammo[w.stats.id] ?? 0) - 1
    this.fireCooldown = 1 / w.stats.fireRate
    return w.spawnBullets(this.position, this.aim, rng)
  }

  ammoOf(id: string): number {
    return this.ammo[id] ?? 0
  }

  /** Helper de debug/tests: deja a cero la munición de un arma propia. */
  debugDrainAmmo(id: string): void {
    if (id in this.ammo && !this.weapon.stats.infiniteAmmo) this.ammo[id] = 0
  }

  buyWeapon(w: WeaponStrategy): boolean {
    if (this.loadout.some(x => x.stats.id === w.stats.id)) return false
    if (!this.money.spend(w.stats.cost)) return false
    this.loadout.push(w)
    this.ammo[w.stats.id] = w.stats.ammoPack
    this.current = this.loadout.length - 1
    return true
  }

  buyAmmo(w: WeaponStrategy, packs = 1): boolean {
    if (!this.loadout.some(x => x.stats.id === w.stats.id)) return false
    if (w.stats.infiniteAmmo) return false
    const current = this.ammoOf(w.stats.id)
    if (current >= w.stats.maxAmmo) return false
    const cost = w.stats.ammoCost * packs
    if (!this.money.spend(cost)) return false
    this.ammo[w.stats.id] = Math.min(w.stats.maxAmmo, current + w.stats.ammoPack * packs)
    return true
  }

  buyHealth(amount = HEALTH_PACK, cost = HEALTH_COST): boolean {
    if (this.health.current >= this.health.max) return false
    if (!this.money.spend(cost)) return false
    this.health.heal(amount)
    return true
  }

  switchWeapon(index: number): void {
    if (index < 0 || index >= this.loadout.length) throw new Error(`Arma fuera de rango: ${index}`)
    this.current = index
  }
}
