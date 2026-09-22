// Game — aggregate root del dominio (DDD). Orquesta los sistemas de la
// simulación: spawn de oleadas, movimiento, disparo, colisiones, recompensas
// y máquina de estados menu→playing→shop→gameover.
//
// Decisión de diseño (ADR-001): las acciones CONTINUAS viven en tick()
// (moverse, disparar, colisionar); las acciones DISCRETAS son comandos
// explícitos (startRun, nextWave, buyUpgrade, restart). tick() devuelve
// DomainEvents — el dominio no conoce la UI ni la persistencia.

import type { ArenaRect, BuyRequest, BuyResult, DomainEvent, GameState, InputState } from './types'
import { ACID_COLOR } from './types'
import type { RandomSource, SpawnEntry, SpawnStrategy } from './ports'
import { StandardWaveStrategy } from './strategies/spawn'
import { BRAINS } from './strategies/brains'
import { createWeapon } from './strategies/weapons'
import { Player, HEALTH_COST, HEALTH_PACK } from './entities/player'
import { createZombie } from './entities/zombie-factory'
import type { Zombie } from './entities/zombie'
import { Bullet } from './entities/bullet'
import { MathRandom } from './utils/random'
import { boundsOf, vadd, vdist, vnormalize, vscale, type Bounds2 } from './value-objects/vec2'

export interface GameConfig {
  arena: ArenaRect
  rng?: RandomSource
  spawn?: SpawnStrategy
}

const EDGE_MARGIN = 24
const CONTACT_GRACE = 2

export class Game {
  state: GameState = 'menu'
  readonly arena: ArenaRect
  readonly player: Player
  zombies: Zombie[] = []
  bullets: Bullet[] = []
  wave = 0
  score = 0

  private rng: RandomSource
  private spawnStrategy: SpawnStrategy
  private queue: SpawnEntry[] = []
  private waveElapsed = 0
  private time = 0
  private hpMultiplier = 1

  constructor(cfg: GameConfig) {
    this.arena = cfg.arena
    this.rng = cfg.rng ?? new MathRandom()
    this.spawnStrategy = cfg.spawn ?? new StandardWaveStrategy()
    this.player = new Player({
      position: { x: this.arena.width / 2, y: this.arena.height / 2 },
      speed: 130,
      maxHealth: 100,
      radius: 14,
      startingMoney: 0
    })
  }

  get bounds(): Bounds2 {
    return boundsOf(this.arena)
  }

  get zombiesRemaining(): number {
    return this.zombies.length + this.queue.length
  }

  spawnPending(): number {
    return this.queue.length
  }

  /** Acceso de debug/tests: vacía la cola de spawn pendiente. */
  spawnQueueClearForTest(): void {
    this.queue = []
  }

  startRun(): DomainEvent[] {
    if (this.state !== 'menu' && this.state !== 'gameover') return []
    this.resetWorld()
    this.state = 'playing'
    const events: DomainEvent[] = [{ type: 'run-started' }]
    events.push(...this.beginWave(1))
    return events
  }

  nextWave(): DomainEvent[] {
    if (this.state !== 'shop') throw new Error('nextWave solo es válido en la tienda')
    this.state = 'playing'
    return this.beginWave(this.wave + 1)
  }

  restart(): DomainEvent[] {
    this.resetWorld()
    this.state = 'menu'
    return []
  }

  private resetWorld(): void {
    this.zombies = []
    this.bullets = []
    this.queue = []
    this.wave = 0
    this.score = 0
    this.waveElapsed = 0
    this.time = 0
    const maxHp = this.player.health.max
    // Reconstruimos el jugador para un estado limpio (inventario incluido).
    const fresh = new Player({
      position: { x: this.arena.width / 2, y: this.arena.height / 2 },
      speed: 130,
      maxHealth: maxHp,
      radius: 14,
      startingMoney: 0
    })
    // Asignación controlada: el jugador es readonly por convención externa.
    ;(this as { player: Player }).player = fresh
  }

  private beginWave(wave: number): DomainEvent[] {
    this.wave = wave
    const plan = this.spawnStrategy.plan(wave, this.rng)
    this.queue = [...plan.entries]
    this.hpMultiplier = plan.hpMultiplier
    this.waveElapsed = 0
    this.state = 'playing'
    return [{ type: 'wave-started', wave }]
  }

  buyUpgrade(req: BuyRequest): BuyResult {
    if (this.state !== 'shop') {
      return { ok: false, reason: 'state', money: this.player.money.amount }
    }
    const money = () => this.player.money.amount
    if (req.kind === 'weapon') {
      const w = createWeapon(req.id)
      if (!w || w.stats.cost === 0) return { ok: false, reason: 'unknown', money: money() }
      return this.player.buyWeapon(w)
        ? { ok: true, money: money() }
        : { ok: false, reason: 'funds', money: money() }
    }
    if (req.kind === 'ammo') {
      const w = this.player.owned.find(x => x.stats.id === req.id)
      if (!w) return { ok: false, reason: 'unknown', money: money() }
      return this.player.buyAmmo(w, req.packs ?? 1)
        ? { ok: true, money: money() }
        : { ok: false, reason: 'maxed', money: money() }
    }
    // health
    return this.player.buyHealth(HEALTH_PACK, HEALTH_COST)
      ? { ok: true, money: money() }
      : { ok: false, reason: 'funds', money: money() }
  }

  tick(dt: number, input: InputState): DomainEvent[] {
    if (this.state !== 'playing') return []
    const events: DomainEvent[] = []
    this.time += dt
    this.waveElapsed += dt

    this.spawnDue()
    this.player.move(input.move, dt, this.bounds)
    this.player.setAim(input.aim)
    this.player.tickCooldown(dt)
    this.shoot(input, events)
    this.moveZombies(dt, events)
    this.meleeAttacks(events)
    this.stepBulletsAndCollisions(dt, events)
    this.reap(events)

    if (this.player.isDead) {
      this.state = 'gameover'
      events.push({ type: 'player-died', score: this.score, wave: this.wave })
      return events
    }

    if (this.queue.length === 0 && this.zombies.length === 0) {
      this.state = 'shop'
      events.push({ type: 'wave-cleared', wave: this.wave })
    }
    return events
  }

  private spawnDue(): void {
    while (this.queue.length > 0 && this.queue[0] !== undefined && this.queue[0].at <= this.waveElapsed) {
      const entry = this.queue.shift() as SpawnEntry
      this.zombies.push(createZombie(undefined, entry.kind, this.randomEdgePoint(), this.hpMultiplier))
    }
  }

  private randomEdgePoint(): { x: number; y: number } {
    const m = EDGE_MARGIN
    const side = Math.floor(this.rng.next() * 4)
    switch (side) {
      case 0: return { x: this.rng.next() * this.arena.width, y: m }
      case 1: return { x: this.arena.width - m, y: this.rng.next() * this.arena.height }
      case 2: return { x: this.rng.next() * this.arena.width, y: this.arena.height - m }
      default: return { x: m, y: this.rng.next() * this.arena.height }
    }
  }

  private shoot(input: InputState, events: DomainEvent[]): void {
    if (!input.firing) return
    const fired = this.player.fire(this.rng)
    if (fired) {
      this.bullets.push(...fired)
      events.push({ type: 'shot', weapon: this.player.weapon.stats.id })
    }
  }

  private moveZombies(dt: number, _events: DomainEvent[]): void {
    const ctx = { playerPos: this.player.position, dt, rng: this.rng, time: this.time }
    for (const z of this.zombies) {
      z.tickTimers(dt)
      const brain = BRAINS[z.kind]
      if (!brain) continue
      const result = brain.step(z, ctx)
      z.position = vadd(z.position, result.move)
      z.position = {
        x: Math.min(Math.max(z.position.x, 4), this.arena.width - 4),
        y: Math.min(Math.max(z.position.y, 4), this.arena.height - 4)
      }
      if (result.spit && z.spitReady()) {
        z.markSpit()
        const dir = vnormalize({
          x: ctx.playerPos.x - z.position.x,
          y: ctx.playerPos.y - z.position.y
        })
        this.bullets.push(new Bullet({
          position: { ...z.position },
          velocity: vscale(dir, result.spit.speed),
          damage: result.spit.damage,
          ttl: 3,
          radius: 5,
          from: 'zombie',
          color: ACID_COLOR
        }))
      }
    }
  }

  private meleeAttacks(events: DomainEvent[]): void {
    for (const z of this.zombies) {
      const d = vdist(z.position, this.player.position)
      if (d < z.config.radius + this.player.radius + CONTACT_GRACE && z.requestMelee(0)) {
        this.player.takeDamage(z.config.damage)
        events.push({ type: 'player-hit', damage: z.config.damage, hp: this.player.health.current })
      }
    }
  }

  private stepBulletsAndCollisions(dt: number, events: DomainEvent[]): void {
    for (const b of this.bullets) {
      b.step(dt)
      if (b.isExpired) continue
      if (b.from === 'player') {
        for (const z of this.zombies) {
          if (z.isDead) continue
          if (vdist(b.position, z.position) < b.radius + z.config.radius) {
            z.takeDamage(b.damage)
            b.expire()
            break
          }
        }
      } else if (vdist(b.position, this.player.position) < b.radius + this.player.radius) {
        this.player.takeDamage(b.damage)
        b.expire()
        events.push({ type: 'player-hit', damage: b.damage, hp: this.player.health.current })
      }
    }
  }

  private reap(events: DomainEvent[]): void {
    const survivors: Zombie[] = []
    for (const z of this.zombies) {
      if (z.isDead) {
        this.player.money.earn(z.moneyReward)
        this.score += z.scoreReward
        events.push({
          type: 'zombie-died', kind: z.kind, money: z.moneyReward,
          score: z.scoreReward, at: { ...z.position }
        })
      } else {
        survivors.push(z)
      }
    }
    this.zombies = survivors
    this.bullets = this.bullets.filter(b => !b.isExpired)
  }
}
