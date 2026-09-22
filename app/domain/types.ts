// Tipos y datos del dominio MicroZombiesZ — capa 100% pura (ADR-001).
// Cero imports de Vue/Nuxt/DOM: el dominio es testeable y portable.

export type ZombieKind = 'walker' | 'runner' | 'brute' | 'spitter'

export interface ArenaRect { width: number; height: number }
export interface Bounds { minX: number; minY: number; maxX: number; maxY: number }

export interface RangedConfig {
  range: number
  cooldown: number
  damage: number
  projectileSpeed: number
}

/** Stats de un tipo de zombie (tabla de datos del dominio). */
export interface ZombieConfig {
  kind: ZombieKind
  health: number
  speed: number
  radius: number
  damage: number
  moneyReward: number
  scoreReward: number
  attackCooldown: number
  ranged?: RangedConfig
  color: string
}

export const ZOMBIE_TYPES: Record<ZombieKind, ZombieConfig> = {
  walker: { kind: 'walker', health: 60, speed: 42, radius: 12, damage: 12, moneyReward: 10, scoreReward: 10, attackCooldown: 0.8, color: '#59a65a' },
  runner: { kind: 'runner', health: 35, speed: 96, radius: 10, damage: 8, moneyReward: 14, scoreReward: 16, attackCooldown: 0.6, color: '#a3d977' },
  brute: { kind: 'brute', health: 260, speed: 26, radius: 20, damage: 30, moneyReward: 40, scoreReward: 45, attackCooldown: 1.2, color: '#8c4a3c' },
  spitter: { kind: 'spitter', health: 45, speed: 34, radius: 11, damage: 10, moneyReward: 22, scoreReward: 26, attackCooldown: 1.0, ranged: { range: 250, cooldown: 2.2, damage: 12, projectileSpeed: 150 }, color: '#57b8a2' }
}

export const ACID_COLOR = '#7fd6c2'

/** Estado de entrada normalizado (producido por adaptadores de input). */
export interface InputState {
  /** Dirección de movimiento deseada (sin normalizar; el dominio normaliza). */
  move: { x: number; y: number }
  /** Punto del mundo hacia el que se apunta. */
  aim: { x: number; y: number }
  firing: boolean
}

export type GameState = 'menu' | 'playing' | 'shop' | 'gameover'

export type DomainEvent =
  | { type: 'run-started' }
  | { type: 'wave-started'; wave: number }
  | { type: 'wave-cleared'; wave: number }
  | { type: 'zombie-died'; kind: ZombieKind; money: number; score: number; at: { x: number; y: number } }
  | { type: 'player-hit'; damage: number; hp: number }
  | { type: 'player-died'; score: number; wave: number }
  | { type: 'shot'; weapon: string }

export type BuyRequest =
  | { kind: 'weapon'; id: string }
  | { kind: 'ammo'; id: string; packs?: number }
  | { kind: 'health' }

export interface BuyResult {
  ok: boolean
  reason?: 'funds' | 'unknown' | 'state' | 'maxed'
  money: number
}

/** Entrada de tabla de sabores (contenido generado por Claude Code vía relay). */
export interface FlavorEntry { tagline: string; lore: string }
export interface GameFlavor {
  weapons: Record<string, FlavorEntry>
  zombies: Record<ZombieKind, FlavorEntry>
  taglines: string[]
}
