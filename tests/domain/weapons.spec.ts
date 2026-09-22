import { describe, expect, it } from 'vitest'
import { createWeapon, PISTOL, SHOTGUN, RIFLE, SMG } from '../../app/domain/strategies/weapons'
import { SeededRandom } from '../../app/domain/utils/random'
import { vlen } from '../../app/domain/value-objects/vec2'

describe('WeaponStrategy (patrón Strategy: cada arma es intercambiable)', () => {
  it('catálogo crea las 4 armas con stats coherentes', () => {
    for (const id of ['pistol', 'shotgun', 'smg', 'rifle']) {
      const w = createWeapon(id)
      expect(w.stats.id).toBe(id)
      expect(w.stats.fireRate).toBeGreaterThan(0)
      expect(w.stats.damage).toBeGreaterThan(0)
    }
  })

  it('pistola: 1 bala, munición infinita (no consume)', () => {
    const rng = new SeededRandom(1)
    const bullets = PISTOL().spawnBullets({ x: 0, y: 0 }, { x: 1, y: 0 }, rng)
    expect(bullets).toHaveLength(1)
    expect(bullets[0].damage).toBeGreaterThan(0)
    expect(PISTOL().stats.infiniteAmmo).toBe(true)
  })

  it('escopeta: 6 perdigones con dispersión amplia', () => {
    const rng = new SeededRandom(3)
    const w = SHOTGUN()
    const bullets = w.spawnBullets({ x: 0, y: 0 }, { x: 1, y: 0 }, rng)
    expect(bullets).toHaveLength(6)
    for (const b of bullets) {
      const angle = Math.atan2(b.velocity.y, b.velocity.x)
      expect(Math.abs(angle)).toBeLessThanOrEqual(w.stats.spread + 1e-9)
    }
  })

  it('rifle supera en velocidad de bala y cadencia a la pistola', () => {
    expect(RIFLE().stats.bulletSpeed).toBeGreaterThan(PISTOL().stats.bulletSpeed)
    expect(RIFLE().stats.fireRate).toBeGreaterThan(PISTOL().stats.fireRate)
  })

  it('las balas nacen desplazadas del cañón (no dentro del jugador)', () => {
    const rng = new SeededRandom(5)
    const bullets = createWeapon('smg').spawnBullets({ x: 100, y: 100 }, { x: 0, y: -1 }, rng)
    for (const b of bullets) {
      expect(vlen({ x: b.position.x - 100, y: b.position.y - 100 })).toBeGreaterThanOrEqual(12)
    }
  })
})
