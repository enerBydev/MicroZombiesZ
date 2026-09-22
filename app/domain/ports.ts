// Puertos del hexágono (ADR-001): interfaces que la infraestructura implementa.

import type { Vec2 } from './value-objects/vec2'
import type { ArenaRect, GameState, ZombieKind } from './types'

export interface RandomSource {
  /** Uniforme en [0, 1). */
  next(): number
}

/** Puerto de reloj (inyectable para tests). */
export interface GameClock {
  now(): number
}

export interface ScoreEntry {
  score: number
  wave: number
  at: string
}

/** Puerto de persistencia de récords (Repository pattern). */
export interface ScoreRepository {
  getBest(): ScoreEntry | null
  saveBest(entry: ScoreEntry): ScoreEntry
}

export interface SpawnEntry {
  kind: import('./types').ZombieKind
  /** Segundos desde el inicio de la oleada. */
  at: number
}

export interface WavePlan {
  entries: SpawnEntry[]
  hpMultiplier: number
}

/** Puerto de composición de oleadas (Strategy pattern). */
export interface SpawnStrategy {
  plan(wave: number, rng: RandomSource): WavePlan
}

// ─── Render ────────────────────────────────────────────────────────────────

export interface SnapshotZombie {
  position: Vec2
  kind: ZombieKind
  radius: number
  hpRatio: number
}

export interface SnapshotBullet {
  position: Vec2
  radius: number
  color: string
  from: 'player' | 'zombie'
}

export interface GameSnapshot {
  arena: ArenaRect
  state: GameState
  wave: number
  score: number
  player: { position: Vec2; aim: Vec2; hpRatio: number; weaponColor: string; radius: number }
  zombies: SnapshotZombie[]
  bullets: SnapshotBullet[]
}

/** Puerto de renderizado (Canvas hoy, otro mañana — hexágono). */
export interface RenderPort {
  render(snapshot: GameSnapshot): void
}

// ─── Input ─────────────────────────────────────────────────────────────────

export interface RawInput {
  /** Vector de movimiento deseado (magnitud libre). */
  move: Vec2
  firing: boolean
  /** Posición absoluta del puntero (desktop). */
  aimPoint?: Vec2
  /** Dirección de apuntado directa (joystick derecho táctil). */
  aimDir?: Vec2
}

/** Puerto de entrada (teclado+ratón, táctil, mandos). */
export interface InputAdapter {
  readonly mode: string
  getState(): RawInput
  attach(): void
  detach(): void
}
