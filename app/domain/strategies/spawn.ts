// StandardWaveStrategy — composición progresiva de oleadas estilo SAS.
// Oleada 1: solo walkers. Desde la 2 entran runners, desde la 4 spitters,
// desde la 5 brutes. La vida escala +15% por oleada.

import type { RandomSource, SpawnStrategy, WavePlan, SpawnEntry } from '../ports'
import type { ZombieKind } from '../types'
import { rngRange } from '../utils/random'

export class StandardWaveStrategy implements SpawnStrategy {
  plan(wave: number, rng: RandomSource): WavePlan {
    const count = Math.min(Math.round(6 + wave * 2.5), 40)
    const horizon = Math.min(4 + count * 0.35, 22)
    const hpMultiplier = 1 + 0.15 * (wave - 1)

    const entries: SpawnEntry[] = []
    for (let i = 0; i < count; i++) {
      const kind = this.pickKind(wave, rng)
      const at = i < 3 ? rngRange(rng, 0, 1.5) : rngRange(rng, 0, horizon)
      entries.push({ kind, at })
    }
    entries.sort((a, b) => a.at - b.at)
    return { entries, hpMultiplier }
  }

  private pickKind(wave: number, rng: RandomSource): ZombieKind {
    const r = rng.next()
    if (wave >= 5 && r < 0.1) return 'brute'
    if (wave >= 4 && r < 0.25) return 'spitter'
    if (wave >= 2 && r < 0.45) return 'runner'
    return 'walker'
  }
}
