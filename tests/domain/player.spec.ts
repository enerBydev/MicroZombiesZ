import { describe, expect, it } from 'vitest'
import { Player } from '../../app/domain/entities/player'
import { createWeapon, SHOTGUN } from '../../app/domain/strategies/weapons'
import { SeededRandom } from '../../app/domain/utils/random'

const ARENA = { minX: 0, minY: 0, maxX: 400, maxY: 300 }

function makePlayer(overrides: Partial<ConstructorParameters<typeof Player>[0]> = {}) {
  return new Player({
    position: { x: 200, y: 150 },
    speed: 100,
    maxHealth: 100,
    radius: 14,
    startingMoney: 100,
    ...overrides
  })
}

describe('Player (entidad con inventario de estrategias de arma)', () => {
  it('movimiento normalizado en diagonal + clamp a la arena', () => {
    const p = makePlayer()
    p.move({ x: 1, y: 1 }, 1, ARENA) // 1s a speed 100 → |delta| = 100 (normalizado)
    expect(p.position.x).toBeCloseTo(200 + 100 * Math.SQRT1_2, 5)
    expect(p.position.y).toBeCloseTo(150 + 100 * Math.SQRT1_2, 5)

    p.move({ x: 50, y: 0 }, 10, ARENA)
    expect(p.position.x).toBe(400) // clamped
  })

  it('disparo: pistola infinita no agota munición y respeta cadencia', () => {
    const p = makePlayer()
    const rng = new SeededRandom(2)
    p.setAim({ x: 1, y: 0 })
    const b1 = p.fire(rng)
    expect(b1).not.toBeNull()
    const b2 = p.fire(rng)
    expect(b2).toBeNull() // cooldown
    p.tickCooldown(1)
    expect(p.fire(rng)).not.toBeNull()
    expect(p.ammoOf('pistol')).toBe(Number.POSITIVE_INFINITY)
  })

  it('disparo con arma limitada consume munición y se bloquea a cero', () => {
    const p = makePlayer({ startingMoney: 1000 })
    const sg = SHOTGUN()
    expect(p.buyWeapon(sg)).toBe(true)
    p.tickCooldown(10)
    const rng = new SeededRandom(4)
    p.setAim({ x: 0, y: 1 })
    const before = p.ammoOf('shotgun')
    expect(p.fire(rng)).not.toBeNull()
    expect(p.ammoOf('shotgun')).toBe(before - 1)
    p.debugDrainAmmo('shotgun')
    p.tickCooldown(10)
    expect(p.fire(rng)).toBeNull()
  })

  it('compra de arma: deduce dinero exacto y cambia de arma', () => {
    const p = makePlayer({ startingMoney: 300 })
    const sg = SHOTGUN()
    expect(p.buyWeapon(sg)).toBe(true)
    expect(p.money.amount).toBe(300 - sg.stats.cost)
    expect(p.weapon.stats.id).toBe('shotgun')
  })

  it('compra rechazada sin fondos no muta nada', () => {
    const p = makePlayer({ startingMoney: 5 })
    const rifle = createWeapon('rifle')
    expect(p.buyWeapon(rifle)).toBe(false)
    expect(p.weapon.stats.id).toBe('pistol')
    expect(p.money.amount).toBe(5)
    expect(p.owned.map(w => w.stats.id)).toEqual(['pistol'])
  })

  it('compra de munición respeta tope maxAmmo y no permite arma no comprada', () => {
    const p = makePlayer({ startingMoney: 5000 })
    const sg = SHOTGUN()
    p.buyWeapon(sg)
    expect(p.buyAmmo(sg, 99)).toBe(true)
    expect(p.ammoOf('shotgun')).toBe(sg.stats.maxAmmo)
    const rifle = createWeapon('rifle')
    expect(p.buyAmmo(rifle)).toBe(false)
  })

  it('compra de vida cura sin superar el máximo', () => {
    const p = makePlayer()
    p.takeDamage(50)
    expect(p.buyHealth(40, 60)).toBe(true)
    expect(p.health.current).toBe(90)
    expect(p.buyHealth(999, 10)).toBe(true)
    expect(p.health.current).toBe(100)
  })

  it('daño y muerte', () => {
    const p = makePlayer()
    p.takeDamage(30)
    expect(p.isDead).toBe(false)
    p.takeDamage(500)
    expect(p.isDead).toBe(true)
  })

  it('switchWeapon rota solo entre armas propias', () => {
    const p = makePlayer({ startingMoney: 1000 })
    expect(() => p.switchWeapon(3)).toThrow()
    p.buyWeapon(SHOTGUN())
    p.switchWeapon(0)
    expect(p.weapon.stats.id).toBe('pistol')
  })
})
