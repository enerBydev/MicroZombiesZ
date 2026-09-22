import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalLeaderboardRepository } from '../../app/infrastructure/local-leaderboard-repository'

// Tests del fallback de leaderboard para GitHub Pages (Repository/Strategy).
describe('LocalLeaderboardRepository (fallback Pages)', () => {
  let repo: LocalLeaderboardRepository

  beforeEach(() => {
    localStorage.clear()
    repo = new LocalLeaderboardRepository()
  })

  it('empieza vacía', async () => {
    expect(await repo.fetchTop()).toEqual([])
  })

  it('registra y ordena por puntuación descendente', async () => {
    await repo.submit({ name: 'a', score: 100, wave: 3, at: 't1' })
    await repo.submit({ name: 'b', score: 500, wave: 7, at: 't2' })
    await repo.submit({ name: 'c', score: 250, wave: 5, at: 't3' })
    const top = await repo.fetchTop()
    expect(top.map(r => r.name)).toEqual(['b', 'c', 'a'])
  })

  it('devuelve el rank correcto al registrar', async () => {
    await repo.submit({ name: 'a', score: 100, wave: 1, at: 't1' })
    const first = await repo.submit({ name: 'b', score: 500, wave: 1, at: 't2' })
    expect(first.rank).toBe(1)
    const second = await repo.submit({ name: 'c', score: 250, wave: 1, at: 't3' })
    expect(second.rank).toBe(2)
  })

  it('mantiene máximo 100 filas como la API de Nitro', async () => {
    for (let i = 0; i < 105; i++) {
      await repo.submit({ name: `p${i}`, score: i, wave: 1, at: `t${i}` })
    }
    const raw = JSON.parse(localStorage.getItem('mzz:leaderboard-local') || '[]') as unknown[]
    expect(raw.length).toBe(100)
  })

  it('degrada a memoria si localStorage falla (modo privado)', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    const { rank } = await repo.submit({ name: 'x', score: 42, wave: 1, at: 'tx' })
    expect(rank).toBe(1)
    const top = await repo.fetchTop()
    expect(top[0]?.score).toBe(42)
    spy.mockRestore()
  })
})
