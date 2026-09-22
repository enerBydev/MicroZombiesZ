import { describe, expect, it } from 'vitest'
import { Game } from '../../app/domain/game'
import { SeededRandom } from '../../app/domain/utils/random'
import { SHOTGUN } from '../../app/domain/strategies/weapons'
import { createZombie } from '../../app/domain/entities/zombie-factory'

const ARENA = { width: 800, height: 600 }
const IDLE = { move: { x: 0, y: 0 }, aim: { x: 1, y: 0 }, firing: false }

function newGame(seed = 123) {
  return new Game({ arena: ARENA, rng: new SeededRandom(seed), spawn: undefined })
}

describe('Game (aggregate root: máquina de estados menu→playing→shop→gameover)', () => {
  it('startRun: pasa a playing, oleada 1 con plan de spawn', () => {
    const g = newGame()
    expect(g.state).toBe('menu')
    const events = g.startRun()
    expect(g.state).toBe('playing')
    expect(g.wave).toBe(1)
    expect(events.map(e => e.type)).toEqual(['run-started', 'wave-started'])
    expect(g.spawnPending()).toBeGreaterThan(0)
  })

  it('tick en menú: sin eventos y sin cambios', () => {
    const g = newGame()
    expect(g.tick(0.1, IDLE)).toEqual([])
    expect(g.zombies).toHaveLength(0)
  })

  it('los zombies aparecen según el plan temporal', () => {
    const g = newGame()
    g.startRun()
    g.tick(0.5, IDLE)
    expect(g.zombies.length).toBeGreaterThan(0)
    expect(g.spawnPending() + g.zombies.length).toBeGreaterThan(0)
  })

  it('disparo efectivo: bala mata zombie → dinero, score y evento', () => {
    const g = newGame()
    g.startRun()
    // coloco un walker justo delante del jugador y disparo
    const z = createZombie(99, 'walker', { x: g.player.position.x + 60, y: g.player.position.y })
    g.zombies.push(z)
    g.bullets.length = 0
    const events = g.tick(0.05, { move: { x: 0, y: 0 }, aim: { x: 1, y: 0 }, firing: true })
    // varias balas pueden hacer falta; repetimos ticks
    let died = events.some(e => e.type === 'zombie-died')
    for (let i = 0; i < 40 && !died; i++) {
      const ev = g.tick(0.05, { move: { x: 0, y: 0 }, aim: { x: 1, y: 0 }, firing: true })
      died = ev.some(e => e.type === 'zombie-died')
    }
    expect(died).toBe(true)
    expect(g.score).toBeGreaterThan(0)
    expect(g.player.money.amount).toBeGreaterThan(0)
    expect(g.zombies.find(t => t.id === 99)?.isDead ?? true).toBe(true)
  })

  it('contacto de zombie daña al jugador con cooldown de ataque', () => {
    const g = newGame()
    g.startRun()
    g.spawnQueueClearForTest()
    const z = createZombie(77, 'brute', { x: g.player.position.x, y: g.player.position.y })
    g.zombies.push(z)
    const hpBefore = g.player.health.current
    const events = g.tick(0.05, IDLE)
    expect(events.some(e => e.type === 'player-hit')).toBe(true)
    expect(g.player.health.current).toBeLessThan(hpBefore)
    // segundo tick inmediato: aún en cooldown → sin daño extra
    const hpMid = g.player.health.current
    g.tick(0.05, IDLE)
    expect(g.player.health.current).toBe(hpMid)
  })

  it('spitter dispara proyectiles que dañan al jugador', () => {
    const g = newGame()
    g.startRun()
    g.spawnQueueClearForTest()
    const z = createZombie(55, 'spitter', { x: g.player.position.x + 200, y: g.player.position.y })
    g.zombies.push(z)
    const hpBefore = g.player.health.current
    let hit = false
    for (let i = 0; i < 30 && !hit; i++) {
      const ev = g.tick(0.1, IDLE)
      hit = ev.some(e => e.type === 'player-hit')
    }
    expect(hit).toBe(true)
    expect(g.player.health.current).toBeLessThan(hpBefore)
  })

  it('oleada completada → estado shop + evento', () => {
    const g = newGame()
    g.startRun()
    g.spawnQueueClearForTest()
    for (const z of g.zombies) z.takeDamage(1e9)
    const events = g.tick(0.05, IDLE)
    expect(g.state).toBe('shop')
    expect(events.some(e => e.type === 'wave-cleared' && e.wave === 1)).toBe(true)
  })

  it('nextWave desde shop avanza y re-planifica', () => {
    const g = newGame()
    g.startRun()
    g.spawnQueueClearForTest()
    for (const z of g.zombies) z.takeDamage(1e9)
    g.tick(0.05, IDLE)
    const events = g.nextWave()
    expect(g.state).toBe('playing')
    expect(g.wave).toBe(2)
    expect(events.map(e => e.type)).toContain('wave-started')
    expect(g.spawnPending()).toBeGreaterThan(0)
  })

  it('nextWave fuera de shop está prohibido', () => {
    const g = newGame()
    expect(() => g.nextWave()).toThrow()
  })

  it('muerte del jugador → gameover + evento con score', () => {
    const g = newGame()
    g.startRun()
    g.spawnQueueClearForTest()
    g.player.takeDamage(1e9)
    const events = g.tick(0.05, IDLE)
    expect(g.state).toBe('gameover')
    const died = events.find(e => e.type === 'player-died')
    expect(died).toBeDefined()
    expect(died!.score).toBe(g.score)
  })

  it('tienda: comprar arma, munición y vida en estado shop', () => {
    const g = newGame()
    g.startRun()
    g.spawnQueueClearForTest()
    for (const z of g.zombies) z.takeDamage(1e9)
    g.tick(0.05, IDLE)
    g.player.money.earn(5000)

    const w = g.buyUpgrade({ kind: 'weapon', id: 'shotgun' })
    expect(w.ok).toBe(true)
    const ammo = g.buyUpgrade({ kind: 'ammo', id: 'shotgun', packs: 2 })
    expect(ammo.ok).toBe(true)
    g.player.takeDamage(50)
    const hp = g.buyUpgrade({ kind: 'health' })
    expect(hp.ok).toBe(true)
    expect(g.player.health.current).toBeGreaterThan(g.player.health.max - 50 + 40 - 1)
  })

  it('tienda cerrada → compras rechazadas por estado', () => {
    const g = newGame()
    const r = g.buyUpgrade({ kind: 'weapon', id: 'shotgun' })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('state')
  })

  it('compra de arma desconocida → reason unknown', () => {
    const g = newGame()
    g.startRun()
    g.spawnQueueClearForTest()
    for (const z of g.zombies) z.takeDamage(1e9)
    g.tick(0.05, IDLE)
    const r = g.buyUpgrade({ kind: 'weapon', id: 'bfg-inexistente' })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('unknown')
  })

  it('restart vuelve a menú con entidades limpias', () => {
    const g = newGame()
    g.startRun()
    g.tick(1, IDLE)
    g.restart()
    expect(g.state).toBe('menu')
    expect(g.zombies).toHaveLength(0)
    expect(g.bullets).toHaveLength(0)
    expect(g.score).toBe(0)
    expect(g.wave).toBe(0)
    expect(g.player.health.current).toBe(g.player.health.max)
  })

  it('el jugador no puede salir de la arena al moverse', () => {
    const g = newGame()
    g.startRun()
    for (let i = 0; i < 600; i++) {
      g.tick(0.05, { move: { x: -1, y: -1 }, aim: { x: 1, y: 0 }, firing: false })
    }
    expect(g.player.position.x).toBeGreaterThanOrEqual(0)
    expect(g.player.position.y).toBeGreaterThanOrEqual(0)
    expect(g.player.position.x).toBeLessThanOrEqual(ARENA.width)
  })

  it('las balas expiradas y muertos se depuran del mundo', () => {
    const g = newGame()
    g.startRun()
    g.spawnQueueClearForTest()
    const z = createZombie(31, 'walker', { x: g.player.position.x + 40, y: g.player.position.y })
    g.zombies.push(z)
    for (let i = 0; i < 30; i++) g.tick(0.06, { move: { x: 0, y: 0 }, aim: { x: 1, y: 0 }, firing: true })
    expect(g.bullets.every(b => !b.isExpired)).toBe(true)
    expect(g.zombies.every(t => !t.isDead)).toBe(true)
  })
})
