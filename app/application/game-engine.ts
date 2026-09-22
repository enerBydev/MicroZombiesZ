// GameEngine — raíz de composición de la aplicación. Cierra el hexágono:
// inyecta adaptadores (render, input, rng, repository) en el dominio, corre
// el bucle rAF con dt acotado y traduce el dominio a snapshots para la UI.

import { Game } from '../domain/game'
import type {
  BuyRequest, BuyResult, DomainEvent, GameState, GameSnapshot,
  InputAdapter, RandomSource, RawInput, RenderPort, ScoreRepository
} from '../domain/ports'
import { endRun } from './use-cases/endRun'
import { CanvasRenderer } from '../infrastructure/canvas-renderer'
import { KeyboardMouseInput } from '../infrastructure/keyboard-mouse-input'
import { TouchInput } from '../infrastructure/touch-input'
import { MathRandom } from '../domain/utils/random'
import type { Vec2 } from '../domain/value-objects/vec2'
import { vsub } from '../domain/value-objects/vec2'

export interface UiSnapshot {
  state: GameState
  hp: number
  maxHp: number
  money: number
  wave: number
  score: number
  weaponId: string
  weaponName: string
  weaponColor: string
  ammo: number
  infiniteAmmo: boolean
  zombiesLeft: number
}

export interface EngineOptions {
  canvas: HTMLCanvasElement | null
  renderer?: RenderPort
  input?: InputAdapter
  rng?: RandomSource
  scoreRepo: ScoreRepository
  onSnapshot?: (s: UiSnapshot) => void
  onEvent?: (e: DomainEvent) => void
  onState?: (s: GameState) => void
  onRecord?: (isRecord: boolean) => void
}

const MAX_DT = 0.05
const SNAPSHOT_EVERY = 0.1

export class GameEngine {
  readonly game: Game
  private renderer: RenderPort
  private input: InputAdapter
  private readonly keyboard: KeyboardMouseInput
  private readonly touch: TouchInput
  private scoreRepo: ScoreRepository
  private opts: EngineOptions
  private raf = 0
  private last = 0
  private running = false
  private sinceSnapshot = 0
  private lastState: GameState = 'menu'
  private canvas: HTMLCanvasElement | null

  constructor(opts: EngineOptions) {
    this.opts = opts
    this.canvas = opts.canvas
    const arena = this.readArena()
    this.game = new Game({ arena, rng: opts.rng ?? new MathRandom() })
    this.renderer = opts.renderer ?? (this.canvas ? new CanvasRenderer(this.canvas) : { render: () => {} })
    this.keyboard = (opts.input instanceof KeyboardMouseInput) ? opts.input : new KeyboardMouseInput()
    this.touch = new TouchInput()
    this.input = opts.input ?? this.keyboard
    this.scoreRepo = opts.scoreRepo
    if (this.canvas && this.keyboard) this.keyboard.bindCanvas(this.canvas)
  }

  private readArena(): { width: number; height: number } {
    if (this.canvas && this.canvas.clientWidth > 0) {
      return { width: this.canvas.clientWidth, height: this.canvas.clientHeight }
    }
    return { width: 800, height: 600 }
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.input.attach()
    this.last = performance.now()
    const loop = (t: number) => {
      if (!this.running) return
      const dt = Math.min((t - this.last) / 1000, MAX_DT)
      this.last = t
      this.update(dt)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop(): void {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.input.detach()
  }

  /** Un paso de simulación determinista (usado por el loop y por los tests). */
  update(dt: number): void {
    const events = this.game.tick(dt, this.buildInput())
    for (const e of events) this.handleEvent(e)

    if (this.game.state !== this.lastState) {
      this.lastState = this.game.state
      this.opts.onState?.(this.game.state)
    }

    this.renderer.render(this.snapshot())

    this.sinceSnapshot += dt
    if (this.sinceSnapshot >= SNAPSHOT_EVERY || events.length > 0) {
      this.sinceSnapshot = 0
      this.opts.onSnapshot?.(this.uiSnapshot())
    }
  }

  private handleEvent(e: DomainEvent): void {
    this.opts.onEvent?.(e)
    if (e.type === 'player-died') {
      const { isRecord } = endRun({ score: e.score, wave: e.wave }, this.scoreRepo)
      this.opts.onRecord?.(isRecord)
    }
  }

  private buildInput() {
    const raw: RawInput = this.input.getState()
    let aim: Vec2 = { x: 1, y: 0 }
    if (raw.aimDir) {
      aim = raw.aimDir
    } else if (raw.aimPoint) {
      aim = vsub(raw.aimPoint, this.game.player.position)
    }
    return { move: raw.move, aim, firing: raw.firing }
  }

  snapshot(): GameSnapshot {
    const g = this.game
    return {
      arena: g.arena,
      state: g.state,
      wave: g.wave,
      score: g.score,
      player: {
        position: { ...g.player.position },
        aim: { ...g.player.aim },
        hpRatio: g.player.health.ratio,
        weaponColor: g.player.weapon.stats.color,
        radius: g.player.radius
      },
      zombies: g.zombies.map(z => ({
        position: { ...z.position },
        kind: z.kind,
        radius: z.config.radius,
        hpRatio: z.health.ratio
      })),
      bullets: g.bullets.map(b => ({
        position: { ...b.position },
        radius: b.radius,
        color: b.color,
        from: b.from
      }))
    }
  }

  uiSnapshot(): UiSnapshot {
    const g = this.game
    const w = g.player.weapon.stats
    return {
      state: g.state,
      hp: g.player.health.current,
      maxHp: g.player.health.max,
      money: g.player.money.amount,
      wave: g.wave,
      score: g.score,
      weaponId: w.id,
      weaponName: w.name,
      weaponColor: w.color,
      ammo: g.player.ammoOf(w.id),
      infiniteAmmo: Boolean(w.infiniteAmmo),
      zombiesLeft: g.zombiesRemaining
    }
  }

  // ── Comandos hacia el dominio ────────────────────────────────────────────

  beginRun(): void {
    this.game.startRun()
    this.lastState = this.game.state
    this.opts.onState?.(this.game.state)
    this.opts.onSnapshot?.(this.uiSnapshot())
  }

  nextWave(): void {
    if (this.game.state !== 'shop') return
    this.game.nextWave()
    this.lastState = this.game.state
    this.opts.onState?.(this.game.state)
  }

  buy(req: BuyRequest): BuyResult {
    return this.game.buyUpgrade(req)
  }

  restart(): void {
    this.game.restart()
    this.lastState = this.game.state
    this.opts.onState?.(this.game.state)
    this.opts.onSnapshot?.(this.uiSnapshot())
  }

  // ── Joysticks táctiles (mobile-first) ────────────────────────────────────

  setJoystick(side: 'left' | 'right', x: number, y: number): void {
    if (side === 'left') this.touch.setLeftJoystick(x, y)
    else this.touch.setRightJoystick(x, y)
  }

  /** Usa controles táctiles como entrada activa (autodetección por defecto). */
  useTouchControls(): void {
    this.input = this.touch
    this.input.attach()
  }

  useDesktopControls(): void {
    this.input = this.keyboard
    this.input.attach()
  }

  /** Reposiciona la arena al tamaño actual del lienzo (rotación/responsive). */
  resizeToCanvas(): void {
    if (!this.canvas) return
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (w > 0 && h > 0) {
      this.game.arena.width = w
      this.game.arena.height = h
    }
  }
}
