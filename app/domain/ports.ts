// Puertos del hexágono (ADR-001): interfaces que la infraestructura implementa.

export interface RandomSource {
  /** Uniforme en [0, 1). */
  next(): number
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
