import { describe, expect, it } from 'vitest'
import { WalkerBrain, RunnerBrain, BruteBrain, SpitterBrain } from '../../app/domain/strategies/brains'
import { createZombie } from '../../app/domain/entities/zombie-factory'
import { SeededRandom } from '../../app/domain/utils/random'
import { vlen, vsub } from '../../app/domain/value-objects/vec2'

const RNG = new SeededRandom(2)
const CTX = (time = 0) => ({ playerPos: { x: 100, y: 0 }, dt: 0.1, rng: RNG, time })

describe('ZombieBrain (Strategy de IA por tipo)', () => {
  it('walker persigue al jugador en línea recta', () => {
    const z = createZombie(1, 'walker', { x: 0, y: 0 })
    const r = new WalkerBrain().step(z, CTX())
    const toPlayer = vsub(CTX().playerPos, z.position)
    expect(r.move.x).toBeGreaterThan(0)
    expect(r.move.y).toBeCloseTo(0, 5)
    expect(vlen(r.move)).toBeCloseTo(z.config.speed * CTX().dt, 5)
    expect(toPlayer.x).toBe(100)
  })

  it('runner es más rápido que walker', () => {
    const w = createZombie(1, 'walker', { x: 0, y: 0 })
    const r = createZombie(2, 'runner', { x: 0, y: 0 })
    const mw = new WalkerBrain().step(w, CTX())
    const mr = new RunnerBrain().step(r, CTX())
    expect(vlen(mr.move)).toBeGreaterThan(vlen(mw.move))
  })

  it('brute es más lento pero más duro', () => {
    const b = createZombie(1, 'brute', { x: 0, y: 0 })
    const w = createZombie(2, 'walker', { x: 0, y: 0 })
    expect(b.config.health).toBeGreaterThan(w.config.health)
    expect(vlen(new BruteBrain().step(b, CTX()).move))
      .toBeLessThan(vlen(new WalkerBrain().step(w, CTX()).move))
  })

  it('spitter mantiene distancia: huye si está cerca', () => {
    const z = createZombie(1, 'spitter', { x: 60, y: 0 }) // a 40 del jugador (< 160)
    const r = new SpitterBrain().step(z, CTX())
    expect(r.move.x).toBeLessThan(0) // se aleja
    expect(r.spit).toBeUndefined()
  })

  it('spitter escupe hacia el jugador cuando está en rango', () => {
    const z = createZombie(1, 'spitter', { x: 200, y: 0 }) // a 100 (en [160, 260])
    const r = new SpitterBrain().step(z, CTX())
    expect(r.spit).toBeDefined()
    expect(r.spit!.toward.x).toBe(100)
    expect(r.spit!.damage).toBeGreaterThan(0)
    z.markSpit()
    expect(new SpitterBrain().step(z, CTX()).spit).toBeUndefined() // cooldown
  })
})
