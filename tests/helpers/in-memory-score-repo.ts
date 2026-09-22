import type { ScoreEntry, ScoreRepository } from '../../app/domain/ports'

/** Double de tests (y de desarrollo) del puerto ScoreRepository. */
export class InMemoryScoreRepository implements ScoreRepository {
  private best: ScoreEntry | null = null
  getBest(): ScoreEntry | null {
    return this.best
  }
  saveBest(entry: ScoreEntry): ScoreEntry {
    if (!this.best || entry.score > this.best.score) this.best = { ...entry }
    return { ...this.best }
  }
}
