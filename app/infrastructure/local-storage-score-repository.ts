// LocalStorageScoreRepository — adaptador de persistencia (Repository pattern).
// Implementa el puerto ScoreRepository del dominio con localStorage,
// a prueba de entornos sin storage (SSR, modo privado).

import type { ScoreEntry, ScoreRepository } from '../domain/ports'

const KEY = 'mzz:best-score'

export class LocalStorageScoreRepository implements ScoreRepository {
  getBest(): ScoreEntry | null {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as ScoreEntry
      if (typeof parsed.score !== 'number' || typeof parsed.wave !== 'number') return null
      return parsed
    } catch {
      return null
    }
  }

  saveBest(entry: ScoreEntry): ScoreEntry {
    const best = this.getBest()
    if (!best || entry.score > best.score) {
      const next: ScoreEntry = { ...entry }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* storage lleno o ausente: el récord vive solo en memoria esta sesión */
      }
      return next
    }
    return best
  }
}
