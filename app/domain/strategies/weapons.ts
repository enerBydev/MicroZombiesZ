// WeaponStrategy — patrón Strategy: cada arma es una estrategia intercambiable
// que sabe generar sus propios proyectiles. El catálogo permite seleccionarlas
// desde la tienda (Repository de estrategias).

import type { RandomSource } from '../ports'
import { Bullet } from '../entities/bullet'
import type { Vec2 } from '../value-objects/vec2'
import { vadd, vfromAngle, vnormalize, vscale } from '../value-objects/vec2'

export interface WeaponStats {
  id: string
  name: string
  cost: number
  ammoPack: number
  maxAmmo: number
  ammoCost: number
  infiniteAmmo?: boolean
  fireRate: number
  damage: number
  pellets: number
  /** Dispersión total en radianes. */
  spread: number
  bulletSpeed: number
  bulletTtl: number
  bulletRadius: number
  color: string
}

/** Desplazamiento del cañón respecto al origen (centro del jugador). */
export const MUZZLE_OFFSET = 12

export abstract class WeaponStrategy {
  constructor(readonly stats: WeaponStats) {}

  get id(): string {
    return this.stats.id
  }

  get name(): string {
    return this.stats.name
  }

  spawnBullets(origin: Vec2, aim: Vec2, rng: RandomSource): Bullet[] {
    const dir = vnormalize(aim)
    const muzzle = vadd(origin, vscale(dir, MUZZLE_OFFSET))
    const baseAngle = Math.atan2(dir.y, dir.x)
    const out: Bullet[] = []
    for (let i = 0; i < this.stats.pellets; i++) {
      const jitter = (rng.next() - 0.5) * 2 * this.stats.spread
      out.push(new Bullet({
        position: muzzle,
        velocity: vfromAngle(baseAngle + jitter, this.stats.bulletSpeed),
        damage: this.stats.damage,
        ttl: this.stats.bulletTtl,
        radius: this.stats.bulletRadius,
        from: 'player',
        color: this.stats.color
      }))
    }
    return out
  }
}

export class PistolWeapon extends WeaponStrategy {}
export class ShotgunWeapon extends WeaponStrategy {}
export class SmgWeapon extends WeaponStrategy {}
export class RifleWeapon extends WeaponStrategy {}

export const WEAPON_IDS = ['pistol', 'shotgun', 'smg', 'rifle'] as const
export type WeaponId = typeof WEAPON_IDS[number]

export const PISTOL = () => new PistolWeapon({
  id: 'pistol', name: 'Pistola 9mm', cost: 0, ammoPack: 0, maxAmmo: Number.POSITIVE_INFINITY,
  ammoCost: 0, infiniteAmmo: true, fireRate: 4.5, damage: 34, pellets: 1, spread: 0.02,
  bulletSpeed: 520, bulletTtl: 1.5, bulletRadius: 3, color: '#ffd166'
})

export const SHOTGUN = () => new ShotgunWeapon({
  id: 'shotgun', name: 'Escopeta T-12', cost: 250, ammoPack: 12, maxAmmo: 48, ammoCost: 30,
  fireRate: 1.4, damage: 14, pellets: 6, spread: 0.38, bulletSpeed: 460,
  bulletTtl: 0.6, bulletRadius: 2.5, color: '#ff8fa3'
})

export const SMG = () => new SmgWeapon({
  id: 'smg', name: 'Subfusil Rata', cost: 420, ammoPack: 90, maxAmmo: 270, ammoCost: 40,
  fireRate: 10, damage: 15, pellets: 1, spread: 0.09, bulletSpeed: 500,
  bulletTtl: 1.2, bulletRadius: 2.5, color: '#9bd1ff'
})

export const RIFLE = () => new RifleWeapon({
  id: 'rifle', name: 'Rifle de asalto VK', cost: 650, ammoPack: 60, maxAmmo: 180, ammoCost: 50,
  fireRate: 7.5, damage: 30, pellets: 1, spread: 0.04, bulletSpeed: 640,
  bulletTtl: 1.8, bulletRadius: 3, color: '#c3f584'
})

const FACTORIES: Record<WeaponId, () => WeaponStrategy> = {
  pistol: PISTOL,
  shotgun: SHOTGUN,
  smg: SMG,
  rifle: RIFLE
}

export function createWeapon(id: string): WeaponStrategy | null {
  const factory = (FACTORIES as Record<string, () => WeaponStrategy | undefined>)[id]
  return factory ? factory() : null
}

export function shopWeapons(): WeaponStrategy[] {
  return [SHOTGUN(), SMG(), RIFLE()]
}
