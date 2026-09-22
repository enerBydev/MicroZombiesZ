import { describe, expect, it } from 'vitest'
import { InMemoryScoreRepository } from '../helpers/in-memory-score-repo'
import { startRun } from '../../app/application/use-cases/startRun'
import { endRun } from '../../app/application/use-cases/endRun'
import { Game } from '../../app/domain/game'
import { SeededRandom } from '../../app/domain/utils/random'

describe('use-case StartRun (comando discreto de aplicación)', () => {
  it('crea un juego fresco en playing con la config dada', () => {
    const g = startRun({ arena: { width: 800, height: 600 }, rng: new SeededRandom(5) })
    expect(g).toBeInstanceOf(Game)
    expect(g.state).toBe('playing')
    expect(g.wave).toBe(1)
  })
})

describe('use-case EndRun (persiste récord vía puerto ScoreRepository)', () => {
  it('guarda el mejor score y reporta si es récord', () => {
    const repo = new InMemoryScoreRepository()
    expect(repo.getBest()).toBeNull()

    const r1 = endRun({ score: 100, wave: 2 }, repo)
    expect(r1.isRecord).toBe(true)
    expect(repo.getBest()?.score).toBe(100)
    expect(repo.getBest()?.wave).toBe(2)
    expect(repo.getBest()?.at).toBeTruthy()

    const r2 = endRun({ score: 50, wave: 1 }, repo)
    expect(r2.isRecord).toBe(false)
    expect(repo.getBest()?.score).toBe(100)

    const r3 = endRun({ score: 300, wave: 5 }, repo)
    expect(r3.isRecord).toBe(true)
    expect(repo.getBest()?.score).toBe(300)
    expect(repo.getBest()?.wave).toBe(5)
  })
})
