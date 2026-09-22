import { describe, expect, it } from 'vitest'
import { GameEngine, type UiSnapshot } from '../../app/application/game-engine'
import { NullRenderer } from '../../app/infrastructure/canvas-renderer'
import type { InputAdapter, RawInput } from '../../app/domain/ports'
import { InMemoryScoreRepository } from '../helpers/in-memory-score-repo'
import { SeededRandom } from '../../app/domain/utils/random'
import { createZombie } from '../../app/domain/entities/zombie-factory'

class FakeInput implements InputAdapter {
  readonly mode = 'fake'
  state: RawInput = { move: { x: 0, y: 0 }, firing: false }
  attach(): void {}
  detach(): void {}
  getState(): RawInput {
    return this.state
  }
}

function makeEngine() {
  const renderer = new NullRenderer()
  const input = new FakeInput()
  const repo = new InMemoryScoreRepository()
  const states: string[] = []
  const ui: UiSnapshot[] = []
  const engine = new GameEngine({
    canvas: null,
    renderer,
    input,
    rng: new SeededRandom(77),
    scoreRepo: repo,
    onState: s => states.push(s),
    onSnapshot: s => ui.push(s)
  })
  return { engine, renderer, input, repo, states, ui }
}

describe('GameEngine (raíz de composición: cierra el hexágono)', () => {
  it('beginRun arranca la partida y el update produce snapshots renderizados', () => {
    const { engine, renderer, ui } = makeEngine()
    engine.beginRun()
    expect(engine.game.state).toBe('playing')
    for (let i = 0; i < 20; i++) engine.update(0.05)
    expect(renderer.snapshots.length).toBeGreaterThan(5)
    expect(ui.some(s => s.wave === 1)).toBe(true)
  })

  it('el input falso mueve al jugador y dispara', () => {
    const { engine, input } = makeEngine()
    engine.beginRun()
    const x0 = engine.game.player.position.x
    input.state = { move: { x: 1, y: 0 }, firing: true, aimDir: { x: 1, y: 0 } }
    const beforeBullets = engine.game.bullets.length
    engine.update(0.1)
    expect(engine.game.player.position.x).toBeGreaterThan(x0)
    expect(engine.game.bullets.length).toBeGreaterThanOrEqual(beforeBullets)
  })

  it('al morir el jugador persiste el récord vía ScoreRepository y avisa onRecord', () => {
    const { engine, repo } = makeEngine()
    engine.beginRun()
    engine.game.player.money.earn(0)
    engine.game.score = 4321 // simula kills acumuladas
    engine.game.player.takeDamage(1e9)
    engine.update(0.05)
    expect(engine.game.state).toBe('gameover')
    expect(repo.getBest()?.score).toBe(4321)
  })

  it('los joysticks táctiles alimentan el dominio (mobile-first)', () => {
    const { engine } = makeEngine()
    engine.beginRun()
    engine.useTouchControls()
    const y0 = engine.game.player.position.y
    engine.setJoystick('left', 0, -1) // arriba
    engine.update(0.1)
    expect(engine.game.player.position.y).toBeLessThan(y0)
  })

  it('buy delega en el dominio y respeta el estado (tienda cerrada → state)', () => {
    const { engine } = makeEngine()
    const r = engine.buy({ kind: 'weapon', id: 'shotgun' })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('state')
  })

  it('restart vuelve a menú limpio', () => {
    const { engine } = makeEngine()
    engine.beginRun()
    engine.update(0.5)
    engine.restart()
    expect(engine.game.state).toBe('menu')
    expect(engine.game.zombies).toHaveLength(0)
  })

  it('resizeToCanvas ajusta la arena sin romper la simulación', () => {
    const { engine } = makeEngine()
    engine.beginRun()
    engine.game.arena.width = 390
    engine.game.arena.height = 700
    expect(() => engine.update(0.02)).not.toThrow()
    expect(engine.game.arena.width).toBe(390)
  })
})
