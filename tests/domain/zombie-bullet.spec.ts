import { describe, expect, it } from 'vitest'
import { Bullet } from '../../app/domain/entities/bullet'
import { createZombie } from '../../app/domain/entities/zombie-factory'

describe('Zombie (entidad con invariante de vida y cooldowns de ataque)', () => {
  it('factory crea los 4 tipos con stats de la tabla', () => {
    for (const kind of ['walker', 'runner', 'brute', 'spitter'] as const) {
      const z = createZombie(1, kind, { x: 0, y: 0 })
      expect(z.kind).toBe(kind)
      expect(z.config.health).toBeGreaterThan(0)
      expect(z.config.moneyReward).toBeGreaterThan(0)
    }
    expect(createZombie(1, 'brute', { x: 0, y: 0 }).config.health)
      .toBeGreaterThan(createZombie(2, 'walker', { x: 0, y: 0 }).config.health)
  })

  it('daño acumulado respeta el suelo de cero', () => {
    const z = createZombie(1, 'walker', { x: 0, y: 0 })
    z.takeDamage(10)
    expect(z.isDead).toBe(false)
    z.takeDamage(999)
    expect(z.isDead).toBe(true)
  })

  it('hpMultiplier escala la vida al crear (oleadas duras)', () => {
    const base = createZombie(1, 'walker', { x: 0, y: 0 }, 1)
    const hard = createZombie(2, 'walker', { x: 0, y: 0 }, 2)
    expect(hard.health.max).toBe(base.health.max * 2)
  })

  it('requestMelee respeta cooldown (ventana de invulnerabilidad)', () => {
    const z = createZombie(1, 'walker', { x: 0, y: 0 })
    expect(z.requestMelee(0.1)).toBe(true)  // primer golpe listo
    expect(z.requestMelee(0.1)).toBe(false) // en cooldown
    z.tickTimers(1) // > attackCooldown (0.8)
    expect(z.requestMelee(0.1)).toBe(true)
  })

  it('spitter: spitReady con cooldown propio; walker nunca escupe', () => {
    const spitter = createZombie(1, 'spitter', { x: 0, y: 0 })
    expect(spitter.spitReady()).toBe(true)
    spitter.markSpit()
    expect(spitter.spitReady()).toBe(false)
    const walker = createZombie(2, 'walker', { x: 0, y: 0 })
    expect(walker.config.ranged).toBeUndefined()
  })
})

describe('Bullet (proyectil con ttl)', () => {
  it('avanza según velocidad y expira por tiempo', () => {
    const b = new Bullet({
      position: { x: 0, y: 0 },
      velocity: { x: 100, y: 0 },
      damage: 10,
      ttl: 1,
      radius: 3,
      from: 'player',
      color: '#fff'
    })
    b.step(0.5)
    expect(b.position.x).toBeCloseTo(50)
    expect(b.isExpired).toBe(false)
    b.step(0.6)
    expect(b.isExpired).toBe(true)
  })

  it('bala de zombie daña al jugador y no a zombies (from)', () => {
    const b = new Bullet({
      position: { x: 0, y: 0 }, velocity: { x: 1, y: 0 }, damage: 5,
      ttl: 1, radius: 3, from: 'zombie', color: '#0f0'
    })
    expect(b.from).toBe('zombie')
  })
})
