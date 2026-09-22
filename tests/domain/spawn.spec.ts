import { describe, expect, it } from 'vitest'
import { StandardWaveStrategy } from '../../app/domain/strategies/spawn'
import { SeededRandom } from '../../app/domain/utils/random'

const strat = new StandardWaveStrategy()

describe('SpawnStrategy (composición y dificultad de oleadas)', () => {
  it('oleada 1: solo walkers y multiplicador de vida 1', () => {
    const plan = strat.plan(1, new SeededRandom(11))
    expect(plan.entries.length).toBeGreaterThanOrEqual(6)
    expect(plan.entries.every(e => e.kind === 'walker')).toBe(true)
    expect(plan.hpMultiplier).toBe(1)
  })

  it('la dificultad escala: más enemigos y más vida en oleadas altas', () => {
    const early = strat.plan(1, new SeededRandom(11))
    const late = strat.plan(8, new SeededRandom(11))
    expect(late.entries.length).toBeGreaterThan(early.entries.length)
    expect(late.hpMultiplier).toBeGreaterThan(early.hpMultiplier)
  })

  it('oleada avanzada mezcla tipos (runner/spitter/brute)', () => {
    const plan = strat.plan(9, new SeededRandom(21))
    const kinds = new Set(plan.entries.map(e => e.kind))
    expect(kinds.has('runner')).toBe(true)
    expect(kinds.has('spitter')).toBe(true)
    expect(kinds.has('brute')).toBe(true)
  })

  it('los tiempos de spawn están ordenados y dentro del horizonte', () => {
    const plan = strat.plan(5, new SeededRandom(31))
    const times = plan.entries.map(e => e.at)
    for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThanOrEqual(times[i - 1])
    expect(times[0]).toBeLessThan(2)
    expect(times[times.length - 1]).toBeLessThanOrEqual(22 + 1e-9)
  })

  it('mismo seed → mismo plan (determinismo para tests/replays)', () => {
    expect(strat.plan(4, new SeededRandom(9))).toEqual(strat.plan(4, new SeededRandom(9)))
  })
})
